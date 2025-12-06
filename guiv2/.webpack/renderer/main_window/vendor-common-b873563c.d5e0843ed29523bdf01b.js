"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[9765],{

/***/ 21567:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   T: () => (/* binding */ computeRadarPoints)
/* harmony export */ });
/* unused harmony export Radar */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var es_toolkit_compat_last__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(20025);
/* harmony import */ var es_toolkit_compat_last__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(es_toolkit_compat_last__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(59744);
/* harmony import */ var _util_Global__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(59938);
/* harmony import */ var _util_PolarUtils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(14040);
/* harmony import */ var _util_ChartUtils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(33964);
/* harmony import */ var _shape_Polygon__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(20852);
/* harmony import */ var _shape_Dot__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(66613);
/* harmony import */ var _container_Layer__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(86069);
/* harmony import */ var _component_LabelList__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(5614);
/* harmony import */ var _component_ActivePoints__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(85695);
/* harmony import */ var _state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(59482);
/* harmony import */ var _state_selectors_radarSelectors__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(53758);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(49082);
/* harmony import */ var _context_PanoramaContext__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(12070);
/* harmony import */ var _state_SetLegendPayload__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(19797);
/* harmony import */ var _util_useAnimationId__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(8107);
/* harmony import */ var _context_RegisterGraphicalItemId__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(84044);
/* harmony import */ var _state_SetGraphicalItem__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(42678);
/* harmony import */ var _util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(55448);
/* harmony import */ var _animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(31528);
/* harmony import */ var _util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(80196);
var _excluded = ["id"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// eslint-disable-next-line max-classes-per-file
























function getLegendItemColor(stroke, fill) {
  return stroke && stroke !== 'none' ? stroke : fill;
}
var computeLegendPayloadFromRadarSectors = props => {
  var {
    dataKey,
    name,
    stroke,
    fill,
    legendType,
    hide
  } = props;
  return [{
    inactive: hide,
    dataKey,
    type: legendType,
    color: getLegendItemColor(stroke, fill),
    value: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_6__/* .getTooltipNameProp */ .uM)(name, dataKey),
    payload: props
  }];
};
function getTooltipEntrySettings(props) {
  var {
    dataKey,
    stroke,
    strokeWidth,
    fill,
    name,
    hide,
    tooltipType
  } = props;
  return {
    /*
     * I suppose this here _could_ return props.points
     * because while Radar does not support item tooltip mode, it _could_ support it.
     * But when I actually do return the points here, a defaultIndex test starts failing.
     * So, undefined it is.
     */
    dataDefinedOnItem: undefined,
    positions: undefined,
    settings: {
      stroke,
      strokeWidth,
      fill,
      nameKey: undefined,
      // RadarChart does not have nameKey unfortunately
      dataKey,
      name: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_6__/* .getTooltipNameProp */ .uM)(name, dataKey),
      hide,
      type: tooltipType,
      color: getLegendItemColor(stroke, fill),
      unit: '' // why doesn't Radar support unit?
    }
  };
}
function renderDotItem(option, props) {
  var dotItem;
  if (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(option)) {
    // @ts-expect-error typescript is unhappy with cloned props type
    dotItem = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(option, props);
  } else if (typeof option === 'function') {
    dotItem = option(props);
  } else {
    dotItem = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_shape_Dot__WEBPACK_IMPORTED_MODULE_8__/* .Dot */ .c, _extends({}, props, {
      className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('recharts-radar-dot', typeof option !== 'boolean' ? option.className : '')
    }));
  }
  return dotItem;
}
function computeRadarPoints(_ref) {
  var {
    radiusAxis,
    angleAxis,
    displayedData,
    dataKey,
    bandSize
  } = _ref;
  var {
    cx,
    cy
  } = angleAxis;
  var isRange = false;
  var points = [];
  var angleBandSize = angleAxis.type !== 'number' ? bandSize !== null && bandSize !== void 0 ? bandSize : 0 : 0;
  displayedData.forEach((entry, i) => {
    var name = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_6__/* .getValueByDataKey */ .kr)(entry, angleAxis.dataKey, i);
    var value = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_6__/* .getValueByDataKey */ .kr)(entry, dataKey);
    var angle = angleAxis.scale(name) + angleBandSize;
    var pointValue = Array.isArray(value) ? es_toolkit_compat_last__WEBPACK_IMPORTED_MODULE_1___default()(value) : value;
    var radius = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_3__/* .isNullish */ .uy)(pointValue) ? undefined : radiusAxis.scale(pointValue);
    if (Array.isArray(value) && value.length >= 2) {
      isRange = true;
    }
    points.push(_objectSpread(_objectSpread({}, (0,_util_PolarUtils__WEBPACK_IMPORTED_MODULE_5__/* .polarToCartesian */ .IZ)(cx, cy, radius, angle)), {}, {
      // @ts-expect-error getValueByDataKey does not validate the output type
      name,
      // @ts-expect-error getValueByDataKey does not validate the output type
      value,
      cx,
      cy,
      radius,
      angle,
      payload: entry
    }));
  });
  var baseLinePoints = [];
  if (isRange) {
    points.forEach(point => {
      if (Array.isArray(point.value)) {
        var baseValue = point.value[0];
        var radius = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_3__/* .isNullish */ .uy)(baseValue) ? undefined : radiusAxis.scale(baseValue);
        baseLinePoints.push(_objectSpread(_objectSpread({}, point), {}, {
          radius
        }, (0,_util_PolarUtils__WEBPACK_IMPORTED_MODULE_5__/* .polarToCartesian */ .IZ)(cx, cy, radius, point.angle)));
      } else {
        baseLinePoints.push(point);
      }
    });
  }
  return {
    points,
    isRange,
    baseLinePoints
  };
}
function Dots(_ref2) {
  var {
    points,
    props
  } = _ref2;
  var {
    dot,
    dataKey
  } = props;
  if (!dot) {
    return null;
  }
  var {
      id
    } = props,
    propsWithoutId = _objectWithoutProperties(props, _excluded);
  var baseProps = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_20__/* .svgPropertiesNoEvents */ .uZ)(propsWithoutId);
  var customDotProps = (0,_util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_22__/* .svgPropertiesAndEventsFromUnknown */ .y)(dot);
  var dots = points.map((entry, i) => {
    var dotProps = _objectSpread(_objectSpread(_objectSpread({
      key: "dot-".concat(i),
      r: 3
    }, baseProps), customDotProps), {}, {
      // @ts-expect-error we're passing in a dataKey that Dot did not ask for
      dataKey,
      cx: entry.x,
      cy: entry.y,
      index: i,
      payload: entry
    });
    return renderDotItem(dot, dotProps);
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_9__/* .Layer */ .W, {
    className: "recharts-radar-dots"
  }, dots);
}
function RadarLabelListProvider(_ref3) {
  var {
    showLabels,
    points,
    children
  } = _ref3;
  /*
   * Radar provides a Cartesian label list context. Do we want to also provide a polar label list context?
   * That way, users can choose to use polar positions for the Radar labels.
   */
  // const labelListEntries: ReadonlyArray<PolarLabelListEntry> = points.map(
  //   (point): PolarLabelListEntry => ({
  //     value: point.value,
  //     payload: point.payload,
  //     parentViewBox: undefined,
  //     clockWise: false,
  //     viewBox: {
  //       cx: point.cx,
  //       cy: point.cy,
  //       innerRadius: point.radius,
  //       outerRadius: point.radius,
  //       startAngle: point.angle,
  //       endAngle: point.angle,
  //       clockWise: false,
  //     },
  //   }),
  // );

  var labelListEntries = points.map(point => {
    var viewBox = {
      x: point.x,
      y: point.y,
      width: 0,
      height: 0
    };
    return _objectSpread(_objectSpread({}, viewBox), {}, {
      value: point.value,
      payload: point.payload,
      parentViewBox: undefined,
      viewBox,
      fill: undefined
    });
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_LabelList__WEBPACK_IMPORTED_MODULE_10__/* .CartesianLabelListContextProvider */ .h8, {
    value: showLabels ? labelListEntries : null
  }, children);
}
function StaticPolygon(_ref4) {
  var {
    points,
    baseLinePoints,
    props
  } = _ref4;
  if (points == null) {
    return null;
  }
  var {
    shape,
    isRange,
    connectNulls
  } = props;
  var handleMouseEnter = e => {
    var {
      onMouseEnter
    } = props;
    if (onMouseEnter) {
      onMouseEnter(props, e);
    }
  };
  var handleMouseLeave = e => {
    var {
      onMouseLeave
    } = props;
    if (onMouseLeave) {
      onMouseLeave(props, e);
    }
  };
  var radar;
  if (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(shape)) {
    radar = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(shape, _objectSpread(_objectSpread({}, props), {}, {
      points
    }));
  } else if (typeof shape === 'function') {
    radar = shape(_objectSpread(_objectSpread({}, props), {}, {
      points
    }));
  } else {
    radar = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_shape_Polygon__WEBPACK_IMPORTED_MODULE_7__/* .Polygon */ .t, _extends({}, (0,_util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_22__/* .svgPropertiesAndEvents */ .a)(props), {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      points: points,
      baseLinePoints: isRange ? baseLinePoints : undefined,
      connectNulls: connectNulls
    }));
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_9__/* .Layer */ .W, {
    className: "recharts-radar-polygon"
  }, radar, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(Dots, {
    props: props,
    points: points
  }));
}
var interpolatePolarPoint = (prevPoints, prevPointsDiffFactor, t) => (entry, index) => {
  var prev = prevPoints && prevPoints[Math.floor(index * prevPointsDiffFactor)];
  if (prev) {
    return _objectSpread(_objectSpread({}, entry), {}, {
      x: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_3__/* .interpolate */ .GW)(prev.x, entry.x, t),
      y: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_3__/* .interpolate */ .GW)(prev.y, entry.y, t)
    });
  }
  return _objectSpread(_objectSpread({}, entry), {}, {
    x: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_3__/* .interpolate */ .GW)(entry.cx, entry.x, t),
    y: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_3__/* .interpolate */ .GW)(entry.cy, entry.y, t)
  });
};
function PolygonWithAnimation(_ref5) {
  var {
    props,
    previousPointsRef,
    previousBaseLinePointsRef
  } = _ref5;
  var {
    points,
    baseLinePoints,
    isAnimationActive,
    animationBegin,
    animationDuration,
    animationEasing,
    onAnimationEnd,
    onAnimationStart
  } = props;
  var prevPoints = previousPointsRef.current;
  var prevBaseLinePoints = previousBaseLinePointsRef.current;
  var prevPointsDiffFactor = prevPoints && prevPoints.length / points.length;
  var prevBaseLinePointsDiffFactor = prevBaseLinePoints && prevBaseLinePoints.length / baseLinePoints.length;
  var animationId = (0,_util_useAnimationId__WEBPACK_IMPORTED_MODULE_17__/* .useAnimationId */ .n)(props, 'recharts-radar-');
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
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(RadarLabelListProvider, {
    showLabels: showLabels,
    points: points
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_21__/* .JavascriptAnimate */ .J, {
    animationId: animationId,
    begin: animationBegin,
    duration: animationDuration,
    isActive: isAnimationActive,
    easing: animationEasing,
    key: "radar-".concat(animationId),
    onAnimationEnd: handleAnimationEnd,
    onAnimationStart: handleAnimationStart
  }, t => {
    var stepData = t === 1 ? points : points.map(interpolatePolarPoint(prevPoints, prevPointsDiffFactor, t));
    var stepBaseLinePoints = t === 1 ? baseLinePoints : baseLinePoints === null || baseLinePoints === void 0 ? void 0 : baseLinePoints.map(interpolatePolarPoint(prevBaseLinePoints, prevBaseLinePointsDiffFactor, t));
    if (t > 0) {
      // eslint-disable-next-line no-param-reassign
      previousPointsRef.current = stepData;
      // eslint-disable-next-line no-param-reassign
      previousBaseLinePointsRef.current = stepBaseLinePoints;
    }
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(StaticPolygon, {
      points: stepData,
      baseLinePoints: stepBaseLinePoints,
      props: props
    });
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_LabelList__WEBPACK_IMPORTED_MODULE_10__/* .LabelListFromLabelProp */ .qY, {
    label: props.label
  }), props.children);
}
function RenderPolygon(props) {
  var previousPointsRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(undefined);
  var previousBaseLinePointsRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(undefined);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(PolygonWithAnimation, {
    props: props,
    previousPointsRef: previousPointsRef,
    previousBaseLinePointsRef: previousBaseLinePointsRef
  });
}
var defaultRadarProps = {
  angleAxisId: 0,
  radiusAxisId: 0,
  hide: false,
  activeDot: true,
  dot: false,
  legendType: 'rect',
  isAnimationActive: !_util_Global__WEBPACK_IMPORTED_MODULE_4__/* .Global */ .m.isSsr,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'ease'
};
class RadarWithState extends react__WEBPACK_IMPORTED_MODULE_0__.PureComponent {
  render() {
    var {
      hide,
      className,
      points
    } = this.props;
    if (hide || points == null) {
      return null;
    }
    var layerClass = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('recharts-radar', className);
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_9__/* .Layer */ .W, {
      className: layerClass
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(RenderPolygon, this.props)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_ActivePoints__WEBPACK_IMPORTED_MODULE_11__/* .ActivePoints */ .W, {
      points: points,
      mainColor: getLegendItemColor(this.props.stroke, this.props.fill),
      itemDataKey: this.props.dataKey,
      activeDot: this.props.activeDot
    }));
  }
}
function RadarImpl(props) {
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_15__/* .useIsPanorama */ .r)();
  var radarPoints = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_14__/* .useAppSelector */ .G)(state => (0,_state_selectors_radarSelectors__WEBPACK_IMPORTED_MODULE_13__/* .selectRadarPoints */ .cr)(state, props.radiusAxisId, props.angleAxisId, isPanorama, props.id));
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(RadarWithState, _extends({}, props, {
    points: radarPoints === null || radarPoints === void 0 ? void 0 : radarPoints.points,
    baseLinePoints: radarPoints === null || radarPoints === void 0 ? void 0 : radarPoints.baseLinePoints,
    isRange: radarPoints === null || radarPoints === void 0 ? void 0 : radarPoints.isRange
  }));
}
class Radar extends react__WEBPACK_IMPORTED_MODULE_0__.PureComponent {
  render() {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_RegisterGraphicalItemId__WEBPACK_IMPORTED_MODULE_18__/* .RegisterGraphicalItemId */ .x, {
      id: this.props.id,
      type: "radar"
    }, id => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetGraphicalItem__WEBPACK_IMPORTED_MODULE_19__/* .SetPolarGraphicalItem */ .v, {
      type: "radar",
      id: id,
      data: undefined // Radar does not have data prop, why?
      ,
      dataKey: this.props.dataKey,
      hide: this.props.hide,
      angleAxisId: this.props.angleAxisId,
      radiusAxisId: this.props.radiusAxisId
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetLegendPayload__WEBPACK_IMPORTED_MODULE_16__/* .SetPolarLegendPayload */ ._, {
      legendPayload: computeLegendPayloadFromRadarSectors(this.props)
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_12__/* .SetTooltipEntrySettings */ .r, {
      fn: getTooltipEntrySettings,
      args: this.props
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(RadarImpl, _extends({}, this.props, {
      id: id
    }))));
  }
}
_defineProperty(Radar, "displayName", 'Radar');
_defineProperty(Radar, "defaultProps", defaultRadarProps);

/***/ }),

/***/ 32351:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Z: () => (/* binding */ RadialBar),
/* harmony export */   s: () => (/* binding */ computeRadialBarDataItems)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34164);
/* harmony import */ var _util_RadialBarUtils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(53820);
/* harmony import */ var _container_Layer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(86069);
/* harmony import */ var _util_ReactUtils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(94501);
/* harmony import */ var _util_Global__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(59938);
/* harmony import */ var _component_LabelList__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(5614);
/* harmony import */ var _component_Cell__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(72050);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(59744);
/* harmony import */ var _util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(33964);
/* harmony import */ var _util_types__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(98940);
/* harmony import */ var _context_tooltipContext__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(58008);
/* harmony import */ var _state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(59482);
/* harmony import */ var _state_selectors_radialBarSelectors__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(66297);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(49082);
/* harmony import */ var _state_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(33032);
/* harmony import */ var _state_SetLegendPayload__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(19797);
/* harmony import */ var _util_useAnimationId__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(8107);
/* harmony import */ var _context_RegisterGraphicalItemId__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(84044);
/* harmony import */ var _state_SetGraphicalItem__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(42678);
/* harmony import */ var _util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(55448);
/* harmony import */ var _animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(31528);
var _excluded = ["shape", "activeShape", "cornerRadius", "id"],
  _excluded2 = ["onMouseEnter", "onClick", "onMouseLeave"],
  _excluded3 = ["value", "background"];
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
// eslint-disable-next-line max-classes-per-file























var STABLE_EMPTY_ARRAY = [];
function RadialBarLabelListProvider(_ref) {
  var {
    showLabels,
    sectors,
    children
  } = _ref;
  var labelListEntries = sectors.map(sector => ({
    value: sector.value,
    payload: sector.payload,
    parentViewBox: undefined,
    clockWise: false,
    viewBox: {
      cx: sector.cx,
      cy: sector.cy,
      innerRadius: sector.innerRadius,
      outerRadius: sector.outerRadius,
      startAngle: sector.startAngle,
      endAngle: sector.endAngle,
      clockWise: false
    },
    fill: sector.fill
  }));
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_LabelList__WEBPACK_IMPORTED_MODULE_6__/* .PolarLabelListContextProvider */ .dL, {
    value: showLabels ? labelListEntries : null
  }, children);
}
function RadialBarSectors(_ref2) {
  var {
    sectors,
    allOtherRadialBarProps,
    showLabels
  } = _ref2;
  var {
      shape,
      activeShape,
      cornerRadius,
      id
    } = allOtherRadialBarProps,
    others = _objectWithoutProperties(allOtherRadialBarProps, _excluded);
  var baseProps = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_20__/* .svgPropertiesNoEvents */ .uZ)(others);
  var activeIndex = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_14__/* .useAppSelector */ .G)(_state_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_15__/* .selectActiveTooltipIndex */ .A2);
  var {
      onMouseEnter: onMouseEnterFromProps,
      onClick: onItemClickFromProps,
      onMouseLeave: onMouseLeaveFromProps
    } = allOtherRadialBarProps,
    restOfAllOtherProps = _objectWithoutProperties(allOtherRadialBarProps, _excluded2);
  var onMouseEnterFromContext = (0,_context_tooltipContext__WEBPACK_IMPORTED_MODULE_11__/* .useMouseEnterItemDispatch */ .Cj)(onMouseEnterFromProps, allOtherRadialBarProps.dataKey);
  var onMouseLeaveFromContext = (0,_context_tooltipContext__WEBPACK_IMPORTED_MODULE_11__/* .useMouseLeaveItemDispatch */ .Pg)(onMouseLeaveFromProps);
  var onClickFromContext = (0,_context_tooltipContext__WEBPACK_IMPORTED_MODULE_11__/* .useMouseClickItemDispatch */ .Ub)(onItemClickFromProps, allOtherRadialBarProps.dataKey);
  if (sectors == null) {
    return null;
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(RadialBarLabelListProvider, {
    showLabels: showLabels,
    sectors: sectors
  }, sectors.map((entry, i) => {
    var isActive = activeShape && activeIndex === String(i);
    // @ts-expect-error the types need a bit of attention
    var onMouseEnter = onMouseEnterFromContext(entry, i);
    // @ts-expect-error the types need a bit of attention
    var onMouseLeave = onMouseLeaveFromContext(entry, i);
    // @ts-expect-error the types need a bit of attention
    var onClick = onClickFromContext(entry, i);

    // @ts-expect-error cx types are incompatible
    var radialBarSectorProps = _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, baseProps), {}, {
      cornerRadius: (0,_util_RadialBarUtils__WEBPACK_IMPORTED_MODULE_2__/* .parseCornerRadius */ .Di)(cornerRadius)
    }, entry), (0,_util_types__WEBPACK_IMPORTED_MODULE_10__/* .adaptEventsOfChild */ .X)(restOfAllOtherProps, entry, i)), {}, {
      onMouseEnter,
      onMouseLeave,
      onClick,
      className: "recharts-radial-bar-sector ".concat(entry.className),
      forceCornerRadius: others.forceCornerRadius,
      cornerIsExternal: others.cornerIsExternal,
      isActive,
      option: isActive ? activeShape : shape
    });
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_util_RadialBarUtils__WEBPACK_IMPORTED_MODULE_2__/* .RadialBarSector */ .l, _extends({
      key: "sector-".concat(entry.cx, "-").concat(entry.cy, "-").concat(entry.innerRadius, "-").concat(entry.outerRadius, "-").concat(entry.startAngle, "-").concat(entry.endAngle, "-").concat(i) // eslint-disable-line react/no-array-index-key
    }, radialBarSectorProps));
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_LabelList__WEBPACK_IMPORTED_MODULE_6__/* .LabelListFromLabelProp */ .qY, {
    label: allOtherRadialBarProps.label
  }), allOtherRadialBarProps.children);
}
function SectorsWithAnimation(_ref3) {
  var {
    props,
    previousSectorsRef
  } = _ref3;
  var {
    data,
    isAnimationActive,
    animationBegin,
    animationDuration,
    animationEasing,
    onAnimationEnd,
    onAnimationStart
  } = props;
  var animationId = (0,_util_useAnimationId__WEBPACK_IMPORTED_MODULE_17__/* .useAnimationId */ .n)(props, 'recharts-radialbar-');
  var prevData = previousSectorsRef.current;
  var [isAnimating, setIsAnimating] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
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
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_21__/* .JavascriptAnimate */ .J, {
    animationId: animationId,
    begin: animationBegin,
    duration: animationDuration,
    isActive: isAnimationActive,
    easing: animationEasing,
    onAnimationStart: handleAnimationStart,
    onAnimationEnd: handleAnimationEnd,
    key: animationId
  }, t => {
    var stepData = t === 1 ? data : (data !== null && data !== void 0 ? data : STABLE_EMPTY_ARRAY).map((entry, index) => {
      var prev = prevData && prevData[index];
      if (prev) {
        var interpolatorStartAngle = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_8__/* .interpolateNumber */ .Dj)(prev.startAngle, entry.startAngle);
        var interpolatorEndAngle = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_8__/* .interpolateNumber */ .Dj)(prev.endAngle, entry.endAngle);
        return _objectSpread(_objectSpread({}, entry), {}, {
          startAngle: interpolatorStartAngle(t),
          endAngle: interpolatorEndAngle(t)
        });
      }
      var {
        endAngle,
        startAngle
      } = entry;
      var interpolator = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_8__/* .interpolateNumber */ .Dj)(startAngle, endAngle);
      return _objectSpread(_objectSpread({}, entry), {}, {
        endAngle: interpolator(t)
      });
    });
    if (t > 0) {
      // eslint-disable-next-line no-param-reassign
      previousSectorsRef.current = stepData !== null && stepData !== void 0 ? stepData : null;
    }
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_3__/* .Layer */ .W, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(RadialBarSectors, {
      sectors: stepData !== null && stepData !== void 0 ? stepData : STABLE_EMPTY_ARRAY,
      allOtherRadialBarProps: props,
      showLabels: !isAnimating
    }));
  });
}
function RenderSectors(props) {
  var previousSectorsRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(SectorsWithAnimation, {
    props: props,
    previousSectorsRef: previousSectorsRef
  });
}
function SetRadialBarPayloadLegend(props) {
  var legendPayload = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_14__/* .useAppSelector */ .G)(state => (0,_state_selectors_radialBarSelectors__WEBPACK_IMPORTED_MODULE_13__/* .selectRadialBarLegendPayload */ .Wc)(state, props.legendType));
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetLegendPayload__WEBPACK_IMPORTED_MODULE_16__/* .SetPolarLegendPayload */ ._, {
    legendPayload: legendPayload !== null && legendPayload !== void 0 ? legendPayload : []
  });
}
function getTooltipEntrySettings(props) {
  var {
    dataKey,
    data,
    stroke,
    strokeWidth,
    name,
    hide,
    fill,
    tooltipType
  } = props;
  return {
    dataDefinedOnItem: data,
    positions: undefined,
    settings: {
      stroke,
      strokeWidth,
      fill,
      nameKey: undefined,
      // RadialBar does not have nameKey, why?
      dataKey,
      name: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__/* .getTooltipNameProp */ .uM)(name, dataKey),
      hide,
      type: tooltipType,
      color: fill,
      unit: '' // Why does RadialBar not support unit?
    }
  };
}
class RadialBarWithState extends react__WEBPACK_IMPORTED_MODULE_0__.PureComponent {
  renderBackground(sectors) {
    if (sectors == null) {
      return null;
    }
    var {
      cornerRadius
    } = this.props;
    var backgroundProps = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_20__/* .svgPropertiesNoEventsFromUnknown */ .ic)(this.props.background);
    return sectors.map((entry, i) => {
      var {
          value,
          background
        } = entry,
        rest = _objectWithoutProperties(entry, _excluded3);
      if (!background) {
        return null;
      }
      var props = _objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread({
        cornerRadius: (0,_util_RadialBarUtils__WEBPACK_IMPORTED_MODULE_2__/* .parseCornerRadius */ .Di)(cornerRadius)
      }, rest), {}, {
        // @ts-expect-error backgroundProps is contributing unknown props
        fill: '#eee'
      }, background), backgroundProps), (0,_util_types__WEBPACK_IMPORTED_MODULE_10__/* .adaptEventsOfChild */ .X)(this.props, entry, i)), {}, {
        index: i,
        className: (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)('recharts-radial-bar-background-sector', backgroundProps === null || backgroundProps === void 0 ? void 0 : backgroundProps.className),
        option: background,
        isActive: false
      });
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_util_RadialBarUtils__WEBPACK_IMPORTED_MODULE_2__/* .RadialBarSector */ .l, _extends({
        key: "background-".concat(rest.cx, "-").concat(rest.cy, "-").concat(rest.innerRadius, "-").concat(rest.outerRadius, "-").concat(rest.startAngle, "-").concat(rest.endAngle, "-").concat(i) // eslint-disable-line react/no-array-index-key
      }, props));
    });
  }
  render() {
    var {
      hide,
      data,
      className,
      background
    } = this.props;
    if (hide) {
      return null;
    }
    var layerClass = (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)('recharts-area', className);
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_3__/* .Layer */ .W, {
      className: layerClass
    }, background && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_3__/* .Layer */ .W, {
      className: "recharts-radial-bar-background"
    }, this.renderBackground(data)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_3__/* .Layer */ .W, {
      className: "recharts-radial-bar-sectors"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(RenderSectors, this.props)));
  }
}
function RadialBarImpl(props) {
  var _useAppSelector;
  var cells = (0,_util_ReactUtils__WEBPACK_IMPORTED_MODULE_4__/* .findAllByType */ .aS)(props.children, _component_Cell__WEBPACK_IMPORTED_MODULE_7__/* .Cell */ .f);
  var radialBarSettings = {
    data: undefined,
    hide: false,
    id: props.id,
    dataKey: props.dataKey,
    minPointSize: props.minPointSize,
    stackId: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__/* .getNormalizedStackId */ .$8)(props.stackId),
    maxBarSize: props.maxBarSize,
    barSize: props.barSize,
    type: 'radialBar',
    angleAxisId: props.angleAxisId,
    radiusAxisId: props.radiusAxisId
  };
  var data = (_useAppSelector = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_14__/* .useAppSelector */ .G)(state => (0,_state_selectors_radialBarSelectors__WEBPACK_IMPORTED_MODULE_13__/* .selectRadialBarSectors */ .sq)(state, props.radiusAxisId, props.angleAxisId, radialBarSettings, cells))) !== null && _useAppSelector !== void 0 ? _useAppSelector : STABLE_EMPTY_ARRAY;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_12__/* .SetTooltipEntrySettings */ .r, {
    fn: getTooltipEntrySettings,
    args: _objectSpread(_objectSpread({}, props), {}, {
      data
    })
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(RadialBarWithState, _extends({}, props, {
    data: data
  })));
}
var defaultRadialBarProps = {
  angleAxisId: 0,
  radiusAxisId: 0,
  minPointSize: 0,
  hide: false,
  legendType: 'rect',
  data: [],
  isAnimationActive: !_util_Global__WEBPACK_IMPORTED_MODULE_5__/* .Global */ .m.isSsr,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'ease',
  forceCornerRadius: false,
  cornerIsExternal: false
};
function computeRadialBarDataItems(_ref4) {
  var {
    displayedData,
    stackedData,
    dataStartIndex,
    stackedDomain,
    dataKey,
    baseValue,
    layout,
    radiusAxis,
    radiusAxisTicks,
    bandSize,
    pos,
    angleAxis,
    minPointSize,
    cx,
    cy,
    angleAxisTicks,
    cells,
    startAngle: rootStartAngle,
    endAngle: rootEndAngle
  } = _ref4;
  return (displayedData !== null && displayedData !== void 0 ? displayedData : []).map((entry, index) => {
    var value, innerRadius, outerRadius, startAngle, endAngle, backgroundSector;
    if (stackedData) {
      // @ts-expect-error truncateByDomain expects only numerical domain, but it can received categorical domain too
      value = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__/* .truncateByDomain */ ._f)(stackedData[dataStartIndex + index], stackedDomain);
    } else {
      value = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__/* .getValueByDataKey */ .kr)(entry, dataKey);
      if (!Array.isArray(value)) {
        value = [baseValue, value];
      }
    }
    if (layout === 'radial') {
      innerRadius = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__/* .getCateCoordinateOfBar */ .y2)({
        axis: radiusAxis,
        ticks: radiusAxisTicks,
        bandSize,
        offset: pos.offset,
        entry,
        index
      });
      endAngle = angleAxis.scale(value[1]);
      startAngle = angleAxis.scale(value[0]);
      outerRadius = (innerRadius !== null && innerRadius !== void 0 ? innerRadius : 0) + pos.size;
      var deltaAngle = endAngle - startAngle;
      if (Math.abs(minPointSize) > 0 && Math.abs(deltaAngle) < Math.abs(minPointSize)) {
        var delta = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_8__/* .mathSign */ .sA)(deltaAngle || minPointSize) * (Math.abs(minPointSize) - Math.abs(deltaAngle));
        endAngle += delta;
      }
      backgroundSector = {
        background: {
          cx,
          cy,
          innerRadius,
          outerRadius,
          startAngle: rootStartAngle,
          endAngle: rootEndAngle
        }
      };
    } else {
      innerRadius = radiusAxis.scale(value[0]);
      outerRadius = radiusAxis.scale(value[1]);
      startAngle = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__/* .getCateCoordinateOfBar */ .y2)({
        axis: angleAxis,
        ticks: angleAxisTicks,
        bandSize,
        offset: pos.offset,
        entry,
        index
      });
      endAngle = (startAngle !== null && startAngle !== void 0 ? startAngle : 0) + pos.size;
      var deltaRadius = outerRadius - innerRadius;
      if (Math.abs(minPointSize) > 0 && Math.abs(deltaRadius) < Math.abs(minPointSize)) {
        var _delta = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_8__/* .mathSign */ .sA)(deltaRadius || minPointSize) * (Math.abs(minPointSize) - Math.abs(deltaRadius));
        outerRadius += _delta;
      }
    }
    return _objectSpread(_objectSpread(_objectSpread({}, entry), backgroundSector), {}, {
      payload: entry,
      value: stackedData ? value : value[1],
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle
    }, cells && cells[index] && cells[index].props);
  });
}
class RadialBar extends react__WEBPACK_IMPORTED_MODULE_0__.PureComponent {
  render() {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_RegisterGraphicalItemId__WEBPACK_IMPORTED_MODULE_18__/* .RegisterGraphicalItemId */ .x, {
      id: this.props.id,
      type: "radialBar"
    }, id => {
      var _this$props$hide, _this$props$angleAxis, _this$props$radiusAxi;
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetGraphicalItem__WEBPACK_IMPORTED_MODULE_19__/* .SetPolarGraphicalItem */ .v, {
        type: "radialBar",
        id: id
        // TODO: do we need this anymore and is the below comment true? Strict nulls complains about it
        ,
        data: undefined // data prop is injected through generator and overwrites what user passes in
        ,
        dataKey: this.props.dataKey
        // TS is not smart enough to know defaultProps has values due to the explicit Partial type
        ,
        hide: (_this$props$hide = this.props.hide) !== null && _this$props$hide !== void 0 ? _this$props$hide : defaultRadialBarProps.hide,
        angleAxisId: (_this$props$angleAxis = this.props.angleAxisId) !== null && _this$props$angleAxis !== void 0 ? _this$props$angleAxis : defaultRadialBarProps.angleAxisId,
        radiusAxisId: (_this$props$radiusAxi = this.props.radiusAxisId) !== null && _this$props$radiusAxi !== void 0 ? _this$props$radiusAxi : defaultRadialBarProps.radiusAxisId,
        stackId: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__/* .getNormalizedStackId */ .$8)(this.props.stackId),
        barSize: this.props.barSize,
        minPointSize: this.props.minPointSize,
        maxBarSize: this.props.maxBarSize
      }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(SetRadialBarPayloadLegend, this.props), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(RadialBarImpl, _extends({}, this.props, {
        id: id
      })));
    });
  }
}
_defineProperty(RadialBar, "displayName", 'RadialBar');
_defineProperty(RadialBar, "defaultProps", defaultRadialBarProps);

/***/ }),

/***/ 33092:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EI: () => (/* binding */ useActiveTooltipDataPoints),
/* harmony export */   ZI: () => (/* binding */ useXAxis),
/* harmony export */   gi: () => (/* binding */ useYAxis),
/* harmony export */   oM: () => (/* binding */ usePlotArea)
/* harmony export */ });
/* unused harmony exports useActiveTooltipLabel, useOffset, useXAxisDomain, useYAxisDomain */
/* harmony import */ var _state_cartesianAxisSlice__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(94115);
/* harmony import */ var _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(11114);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(49082);
/* harmony import */ var _context_PanoramaContext__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(12070);
/* harmony import */ var _state_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(33032);
/* harmony import */ var _state_selectors_selectChartOffset__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(70475);
/* harmony import */ var _state_selectors_selectPlotArea__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(40357);







var useXAxis = xAxisId => {
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_3__/* .useIsPanorama */ .r)();
  return (0,_state_hooks__WEBPACK_IMPORTED_MODULE_2__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_1__/* .selectAxisWithScale */ .Gx)(state, 'xAxis', xAxisId, isPanorama));
};
var useYAxis = yAxisId => {
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_3__/* .useIsPanorama */ .r)();
  return (0,_state_hooks__WEBPACK_IMPORTED_MODULE_2__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_1__/* .selectAxisWithScale */ .Gx)(state, 'yAxis', yAxisId, isPanorama));
};

/**
 * Returns the active tooltip label. The label is one of the values from the chart data,
 * and is used to display in the tooltip content.
 *
 * Returns undefined if there is no active user interaction or if used outside a chart context
 *
 * @returns string | undefined
 */
var useActiveTooltipLabel = () => {
  return useAppSelector(selectActiveLabel);
};

/**
 * Offset defines the blank space between the chart and the plot area.
 * This blank space is occupied by supporting elements like axes, legends, and brushes.
 * This also includes any margins that might be applied to the chart.
 * If you are interested in the margin alone, use `useMargin` instead.
 *
 * @returns Offset of the chart in pixels, or undefined if used outside a chart context.
 */
var useOffset = () => {
  return useAppSelector(selectChartOffset);
};

/**
 * Plot area is the area where the actual chart data is rendered.
 * This means: bars, lines, scatter points, etc.
 *
 * The plot area is calculated based on the chart dimensions and the offset.
 *
 * @returns Plot area of the chart in pixels, or undefined if used outside a chart context.
 */
var usePlotArea = () => {
  return (0,_state_hooks__WEBPACK_IMPORTED_MODULE_2__/* .useAppSelector */ .G)(_state_selectors_selectPlotArea__WEBPACK_IMPORTED_MODULE_6__/* .selectPlotArea */ .d);
};

/**
 * Returns the currently active data points being displayed in the Tooltip.
 * Active means that it is currently visible; this hook will return `undefined` if there is no current interaction.
 *
 * This follows the `<Tooltip />` props, if the Tooltip element is present in the chart.
 * If there is no `<Tooltip />` then this hook will follow the default Tooltip props.
 *
 * Data point is whatever you pass as an input to the chart using the `data={}` prop.
 *
 * This returns an array because a chart can have multiple graphical items in it (multiple Lines for example)
 * and tooltip with `shared={true}` will display all items at the same time.
 *
 * Returns undefined when used outside a chart context.
 *
 * @returns Data points that are currently visible in a Tooltip
 */
var useActiveTooltipDataPoints = () => {
  return (0,_state_hooks__WEBPACK_IMPORTED_MODULE_2__/* .useAppSelector */ .G)(_state_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_4__/* .selectActiveTooltipDataPoints */ .JG);
};

/**
 * Returns the calculated domain of an X-axis.
 *
 * The domain can be numerical: `[min, max]`, or categorical: `['a', 'b', 'c']`.
 *
 * The type of the domain is defined by the `type` prop of the XAxis.
 *
 * The values of the domain are calculated based on the data and the `dataKey` of the axis.
 *
 * If the chart has a Brush, the domain will be filtered to the brushed indexes if the hook is used outside a Brush context,
 * and the full domain will be returned if the hook is used inside a Brush context.
 *
 * @param xAxisId The `xAxisId` of the X-axis. Defaults to `0` if not provided.
 * @returns The domain of the X-axis, or `undefined` if it cannot be calculated or if used outside a chart context.
 */
var useXAxisDomain = function useXAxisDomain() {
  var xAxisId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultAxisId;
  var isPanorama = useIsPanorama();
  return useAppSelector(state => selectAxisDomain(state, 'xAxis', xAxisId, isPanorama));
};

/**
 * Returns the calculated domain of a Y-axis.
 *
 * The domain can be numerical: `[min, max]`, or categorical: `['a', 'b', 'c']`.
 *
 * The type of the domain is defined by the `type` prop of the YAxis.
 *
 * The values of the domain are calculated based on the data and the `dataKey` of the axis.
 *
 * Does not interact with Brushes, as Y-axes do not support brushing.
 *
 * @param yAxisId The `yAxisId` of the Y-axis. Defaults to `0` if not provided.
 * @returns The domain of the Y-axis, or `undefined` if it cannot be calculated or if used outside a chart context.
 */
var useYAxisDomain = function useYAxisDomain() {
  var yAxisId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultAxisId;
  var isPanorama = useIsPanorama();
  return useAppSelector(state => selectAxisDomain(state, 'yAxis', yAxisId, isPanorama));
};

/***/ }),

/***/ 46344:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   c: () => (/* binding */ defaultPolarAngleAxisProps)
/* harmony export */ });
var defaultPolarAngleAxisProps = {
  allowDuplicatedCategory: true,
  // if I set this to false then Tooltip synchronisation stops working in Radar, wtf
  angleAxisId: 0,
  axisLine: true,
  cx: 0,
  cy: 0,
  orientation: 'outer',
  reversed: false,
  scale: 'auto',
  tick: true,
  tickLine: true,
  tickSize: 8,
  type: 'category'
};

/***/ }),

/***/ 57777:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   j: () => (/* binding */ defaultPolarRadiusAxisProps)
/* harmony export */ });
var defaultPolarRadiusAxisProps = {
  allowDataOverflow: false,
  allowDuplicatedCategory: true,
  angle: 0,
  axisLine: true,
  cx: 0,
  cy: 0,
  orientation: 'right',
  radiusAxisId: 0,
  scale: 'auto',
  stroke: '#ccc',
  tick: true,
  tickCount: 5,
  type: 'number'
};

/***/ }),

/***/ 63161:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   F: () => (/* binding */ Pie),
/* harmony export */   L: () => (/* binding */ computePieSectors)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(80305);
/* harmony import */ var es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);
/* harmony import */ var _state_selectors_pieSelectors__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(18467);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(49082);
/* harmony import */ var _container_Layer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(86069);
/* harmony import */ var _shape_Curve__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(45249);
/* harmony import */ var _component_Text__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(20261);
/* harmony import */ var _component_Cell__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(72050);
/* harmony import */ var _util_ReactUtils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(94501);
/* harmony import */ var _util_Global__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(59938);
/* harmony import */ var _util_PolarUtils__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(14040);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(59744);
/* harmony import */ var _util_ChartUtils__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(33964);
/* harmony import */ var _util_types__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(98940);
/* harmony import */ var _util_ActiveShapeUtils__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(80489);
/* harmony import */ var _context_tooltipContext__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(58008);
/* harmony import */ var _state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(59482);
/* harmony import */ var _state_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(33032);
/* harmony import */ var _state_SetLegendPayload__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(19797);
/* harmony import */ var _util_Constants__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(4364);
/* harmony import */ var _util_useAnimationId__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(8107);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(77404);
/* harmony import */ var _context_RegisterGraphicalItemId__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(84044);
/* harmony import */ var _state_SetGraphicalItem__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(42678);
/* harmony import */ var _util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(55448);
/* harmony import */ var _animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(31528);
/* harmony import */ var _component_LabelList__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(5614);
var _excluded = ["onMouseEnter", "onClick", "onMouseLeave"],
  _excluded2 = ["id"],
  _excluded3 = ["id"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }






























/**
 * The `label` prop in Pie accepts a variety of alternatives.
 */

/**
 * Internal props, combination of external props + defaultProps + private Recharts state
 */

function SetPiePayloadLegend(props) {
  var cells = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_util_ReactUtils__WEBPACK_IMPORTED_MODULE_9__/* .findAllByType */ .aS)(props.children, _component_Cell__WEBPACK_IMPORTED_MODULE_8__/* .Cell */ .f), [props.children]);
  var legendPayload = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_4__/* .useAppSelector */ .G)(state => (0,_state_selectors_pieSelectors__WEBPACK_IMPORTED_MODULE_3__/* .selectPieLegend */ .Ez)(state, props.id, cells));
  if (legendPayload == null) {
    return null;
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetLegendPayload__WEBPACK_IMPORTED_MODULE_19__/* .SetPolarLegendPayload */ ._, {
    legendPayload: legendPayload
  });
}
function getTooltipEntrySettings(props) {
  var {
    dataKey,
    nameKey,
    sectors,
    stroke,
    strokeWidth,
    fill,
    name,
    hide,
    tooltipType
  } = props;
  return {
    dataDefinedOnItem: sectors.map(p => p.tooltipPayload),
    positions: sectors.map(p => p.tooltipPosition),
    settings: {
      stroke,
      strokeWidth,
      fill,
      dataKey,
      nameKey,
      name: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_13__/* .getTooltipNameProp */ .uM)(name, dataKey),
      hide,
      type: tooltipType,
      color: fill,
      unit: '' // why doesn't Pie support unit?
    }
  };
}
var getTextAnchor = (x, cx) => {
  if (x > cx) {
    return 'start';
  }
  if (x < cx) {
    return 'end';
  }
  return 'middle';
};
var getOuterRadius = (dataPoint, outerRadius, maxPieRadius) => {
  if (typeof outerRadius === 'function') {
    return (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_12__/* .getPercentValue */ .F4)(outerRadius(dataPoint), maxPieRadius, maxPieRadius * 0.8);
  }
  return (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_12__/* .getPercentValue */ .F4)(outerRadius, maxPieRadius, maxPieRadius * 0.8);
};
var parseCoordinateOfPie = (pieSettings, offset, dataPoint) => {
  var {
    top,
    left,
    width,
    height
  } = offset;
  var maxPieRadius = (0,_util_PolarUtils__WEBPACK_IMPORTED_MODULE_11__/* .getMaxRadius */ .lY)(width, height);
  var cx = left + (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_12__/* .getPercentValue */ .F4)(pieSettings.cx, width, width / 2);
  var cy = top + (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_12__/* .getPercentValue */ .F4)(pieSettings.cy, height, height / 2);
  var innerRadius = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_12__/* .getPercentValue */ .F4)(pieSettings.innerRadius, maxPieRadius, 0);
  var outerRadius = getOuterRadius(dataPoint, pieSettings.outerRadius, maxPieRadius);
  var maxRadius = pieSettings.maxRadius || Math.sqrt(width * width + height * height) / 2;
  return {
    cx,
    cy,
    innerRadius,
    outerRadius,
    maxRadius
  };
};
var parseDeltaAngle = (startAngle, endAngle) => {
  var sign = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_12__/* .mathSign */ .sA)(endAngle - startAngle);
  var deltaAngle = Math.min(Math.abs(endAngle - startAngle), 360);
  return sign * deltaAngle;
};
function getClassNamePropertyIfExists(u) {
  if (u && typeof u === 'object' && 'className' in u && typeof u.className === 'string') {
    return u.className;
  }
  return '';
}
var renderLabelLineItem = (option, props) => {
  if (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(option)) {
    // @ts-expect-error we can't know if the type of props matches the element
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(option, props);
  }
  if (typeof option === 'function') {
    return option(props);
  }
  var className = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('recharts-pie-label-line', typeof option !== 'boolean' ? option.className : '');
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_shape_Curve__WEBPACK_IMPORTED_MODULE_6__/* .Curve */ .I, _extends({}, props, {
    type: "linear",
    className: className
  }));
};
var renderLabelItem = (option, props, value) => {
  if (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(option)) {
    // @ts-expect-error element cloning is not typed
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(option, props);
  }
  var label = value;
  if (typeof option === 'function') {
    label = option(props);
    if (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(label)) {
      return label;
    }
  }
  var className = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('recharts-pie-label-text', getClassNamePropertyIfExists(option));
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_Text__WEBPACK_IMPORTED_MODULE_7__/* .Text */ .E, _extends({}, props, {
    alignmentBaseline: "middle",
    className: className
  }), label);
};
function PieLabels(_ref) {
  var {
    sectors,
    props,
    showLabels
  } = _ref;
  var {
    label,
    labelLine,
    dataKey
  } = props;
  if (!showLabels || !label || !sectors) {
    return null;
  }
  var pieProps = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_25__/* .svgPropertiesNoEvents */ .uZ)(props);
  var customLabelProps = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_25__/* .svgPropertiesNoEventsFromUnknown */ .ic)(label);
  var customLabelLineProps = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_25__/* .svgPropertiesNoEventsFromUnknown */ .ic)(labelLine);
  var offsetRadius = typeof label === 'object' && 'offsetRadius' in label && typeof label.offsetRadius === 'number' && label.offsetRadius || 20;
  var labels = sectors.map((entry, i) => {
    var midAngle = (entry.startAngle + entry.endAngle) / 2;
    var endPoint = (0,_util_PolarUtils__WEBPACK_IMPORTED_MODULE_11__/* .polarToCartesian */ .IZ)(entry.cx, entry.cy, entry.outerRadius + offsetRadius, midAngle);
    var labelProps = _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, pieProps), entry), {}, {
      // @ts-expect-error customLabelProps is contributing unknown props
      stroke: 'none'
    }, customLabelProps), {}, {
      index: i,
      textAnchor: getTextAnchor(endPoint.x, entry.cx)
    }, endPoint);
    var lineProps = _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, pieProps), entry), {}, {
      // @ts-expect-error customLabelLineProps is contributing unknown props
      fill: 'none',
      // @ts-expect-error customLabelLineProps is contributing unknown props
      stroke: entry.fill
    }, customLabelLineProps), {}, {
      index: i,
      points: [(0,_util_PolarUtils__WEBPACK_IMPORTED_MODULE_11__/* .polarToCartesian */ .IZ)(entry.cx, entry.cy, entry.outerRadius, midAngle), endPoint],
      key: 'line'
    });
    return (
      /*#__PURE__*/
      // eslint-disable-next-line react/no-array-index-key
      react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_5__/* .Layer */ .W, {
        key: "label-".concat(entry.startAngle, "-").concat(entry.endAngle, "-").concat(entry.midAngle, "-").concat(i)
      }, labelLine && renderLabelLineItem(labelLine, lineProps), renderLabelItem(label, labelProps, (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_13__/* .getValueByDataKey */ .kr)(entry, dataKey)))
    );
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_5__/* .Layer */ .W, {
    className: "recharts-pie-labels"
  }, labels);
}
function PieLabelList(_ref2) {
  var {
    sectors,
    props,
    showLabels
  } = _ref2;
  var {
    label
  } = props;
  if (typeof label === 'object' && label != null && 'position' in label) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_LabelList__WEBPACK_IMPORTED_MODULE_27__/* .LabelListFromLabelProp */ .qY, {
      label: label
    });
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(PieLabels, {
    sectors: sectors,
    props: props,
    showLabels: showLabels
  });
}
function PieSectors(props) {
  var {
    sectors,
    activeShape,
    inactiveShape: inactiveShapeProp,
    allOtherPieProps
  } = props;
  var activeIndex = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_4__/* .useAppSelector */ .G)(_state_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_18__/* .selectActiveTooltipIndex */ .A2);
  var {
      onMouseEnter: onMouseEnterFromProps,
      onClick: onItemClickFromProps,
      onMouseLeave: onMouseLeaveFromProps
    } = allOtherPieProps,
    restOfAllOtherProps = _objectWithoutProperties(allOtherPieProps, _excluded);
  var onMouseEnterFromContext = (0,_context_tooltipContext__WEBPACK_IMPORTED_MODULE_16__/* .useMouseEnterItemDispatch */ .Cj)(onMouseEnterFromProps, allOtherPieProps.dataKey);
  var onMouseLeaveFromContext = (0,_context_tooltipContext__WEBPACK_IMPORTED_MODULE_16__/* .useMouseLeaveItemDispatch */ .Pg)(onMouseLeaveFromProps);
  var onClickFromContext = (0,_context_tooltipContext__WEBPACK_IMPORTED_MODULE_16__/* .useMouseClickItemDispatch */ .Ub)(onItemClickFromProps, allOtherPieProps.dataKey);
  if (sectors == null || sectors.length === 0) {
    return null;
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, sectors.map((entry, i) => {
    if ((entry === null || entry === void 0 ? void 0 : entry.startAngle) === 0 && (entry === null || entry === void 0 ? void 0 : entry.endAngle) === 0 && sectors.length !== 1) return null;
    var isSectorActive = activeShape && String(i) === activeIndex;
    var inactiveShape = activeIndex ? inactiveShapeProp : null;
    var sectorOptions = isSectorActive ? activeShape : inactiveShape;
    var sectorProps = _objectSpread(_objectSpread({}, entry), {}, {
      stroke: entry.stroke,
      tabIndex: -1,
      [_util_Constants__WEBPACK_IMPORTED_MODULE_20__/* .DATA_ITEM_INDEX_ATTRIBUTE_NAME */ .F0]: i,
      [_util_Constants__WEBPACK_IMPORTED_MODULE_20__/* .DATA_ITEM_DATAKEY_ATTRIBUTE_NAME */ .um]: allOtherPieProps.dataKey
    });
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_5__/* .Layer */ .W
    // eslint-disable-next-line react/no-array-index-key
    , _extends({
      key: "sector-".concat(entry === null || entry === void 0 ? void 0 : entry.startAngle, "-").concat(entry === null || entry === void 0 ? void 0 : entry.endAngle, "-").concat(entry.midAngle, "-").concat(i),
      tabIndex: -1,
      className: "recharts-pie-sector"
    }, (0,_util_types__WEBPACK_IMPORTED_MODULE_14__/* .adaptEventsOfChild */ .X)(restOfAllOtherProps, entry, i), {
      // @ts-expect-error the types need a bit of attention
      onMouseEnter: onMouseEnterFromContext(entry, i)
      // @ts-expect-error the types need a bit of attention
      ,
      onMouseLeave: onMouseLeaveFromContext(entry, i)
      // @ts-expect-error the types need a bit of attention
      ,
      onClick: onClickFromContext(entry, i)
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_util_ActiveShapeUtils__WEBPACK_IMPORTED_MODULE_15__/* .Shape */ .y, _extends({
      option: sectorOptions,
      isActive: isSectorActive,
      shapeType: "sector"
    }, sectorProps)));
  }));
}
function computePieSectors(_ref3) {
  var _pieSettings$paddingA;
  var {
    pieSettings,
    displayedData,
    cells,
    offset
  } = _ref3;
  var {
    cornerRadius,
    startAngle,
    endAngle,
    dataKey,
    nameKey,
    tooltipType
  } = pieSettings;
  var minAngle = Math.abs(pieSettings.minAngle);
  var deltaAngle = parseDeltaAngle(startAngle, endAngle);
  var absDeltaAngle = Math.abs(deltaAngle);
  var paddingAngle = displayedData.length <= 1 ? 0 : (_pieSettings$paddingA = pieSettings.paddingAngle) !== null && _pieSettings$paddingA !== void 0 ? _pieSettings$paddingA : 0;
  var notZeroItemCount = displayedData.filter(entry => (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_13__/* .getValueByDataKey */ .kr)(entry, dataKey, 0) !== 0).length;
  var totalPaddingAngle = (absDeltaAngle >= 360 ? notZeroItemCount : notZeroItemCount - 1) * paddingAngle;
  var realTotalAngle = absDeltaAngle - notZeroItemCount * minAngle - totalPaddingAngle;
  var sum = displayedData.reduce((result, entry) => {
    var val = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_13__/* .getValueByDataKey */ .kr)(entry, dataKey, 0);
    return result + ((0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_12__/* .isNumber */ .Et)(val) ? val : 0);
  }, 0);
  var sectors;
  if (sum > 0) {
    var prev;
    sectors = displayedData.map((entry, i) => {
      // @ts-expect-error getValueByDataKey does not validate the output type
      var val = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_13__/* .getValueByDataKey */ .kr)(entry, dataKey, 0);
      // @ts-expect-error getValueByDataKey does not validate the output type
      var name = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_13__/* .getValueByDataKey */ .kr)(entry, nameKey, i);
      var coordinate = parseCoordinateOfPie(pieSettings, offset, entry);
      var percent = ((0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_12__/* .isNumber */ .Et)(val) ? val : 0) / sum;
      var tempStartAngle;
      var entryWithCellInfo = _objectSpread(_objectSpread({}, entry), cells && cells[i] && cells[i].props);
      if (i) {
        tempStartAngle = prev.endAngle + (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_12__/* .mathSign */ .sA)(deltaAngle) * paddingAngle * (val !== 0 ? 1 : 0);
      } else {
        tempStartAngle = startAngle;
      }
      var tempEndAngle = tempStartAngle + (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_12__/* .mathSign */ .sA)(deltaAngle) * ((val !== 0 ? minAngle : 0) + percent * realTotalAngle);
      var midAngle = (tempStartAngle + tempEndAngle) / 2;
      var middleRadius = (coordinate.innerRadius + coordinate.outerRadius) / 2;
      var tooltipPayload = [{
        name,
        value: val,
        payload: entryWithCellInfo,
        dataKey,
        type: tooltipType
      }];
      var tooltipPosition = (0,_util_PolarUtils__WEBPACK_IMPORTED_MODULE_11__/* .polarToCartesian */ .IZ)(coordinate.cx, coordinate.cy, middleRadius, midAngle);
      prev = _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, pieSettings.presentationProps), {}, {
        percent,
        cornerRadius,
        name,
        tooltipPayload,
        midAngle,
        middleRadius,
        tooltipPosition
      }, entryWithCellInfo), coordinate), {}, {
        value: val,
        startAngle: tempStartAngle,
        endAngle: tempEndAngle,
        payload: entryWithCellInfo,
        paddingAngle: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_12__/* .mathSign */ .sA)(deltaAngle) * paddingAngle
      });
      return prev;
    });
  }
  return sectors;
}
function PieLabelListProvider(_ref4) {
  var {
    showLabels,
    sectors,
    children
  } = _ref4;
  var labelListEntries = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (!showLabels || !sectors) {
      return [];
    }
    return sectors.map(entry => ({
      value: entry.value,
      payload: entry.payload,
      clockWise: false,
      parentViewBox: undefined,
      viewBox: {
        cx: entry.cx,
        cy: entry.cy,
        innerRadius: entry.innerRadius,
        outerRadius: entry.outerRadius,
        startAngle: entry.startAngle,
        endAngle: entry.endAngle,
        clockWise: false
      },
      fill: entry.fill
    }));
  }, [sectors, showLabels]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_LabelList__WEBPACK_IMPORTED_MODULE_27__/* .PolarLabelListContextProvider */ .dL, {
    value: showLabels ? labelListEntries : undefined
  }, children);
}
function SectorsWithAnimation(_ref5) {
  var {
    props,
    previousSectorsRef
  } = _ref5;
  var {
    sectors,
    isAnimationActive,
    animationBegin,
    animationDuration,
    animationEasing,
    activeShape,
    inactiveShape,
    onAnimationStart,
    onAnimationEnd
  } = props;
  var animationId = (0,_util_useAnimationId__WEBPACK_IMPORTED_MODULE_21__/* .useAnimationId */ .n)(props, 'recharts-pie-');
  var prevSectors = previousSectorsRef.current;
  var [isAnimating, setIsAnimating] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
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
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(PieLabelListProvider, {
    showLabels: !isAnimating,
    sectors: sectors
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_26__/* .JavascriptAnimate */ .J, {
    animationId: animationId,
    begin: animationBegin,
    duration: animationDuration,
    isActive: isAnimationActive,
    easing: animationEasing,
    onAnimationStart: handleAnimationStart,
    onAnimationEnd: handleAnimationEnd,
    key: animationId
  }, t => {
    var stepData = [];
    var first = sectors && sectors[0];
    var curAngle = first === null || first === void 0 ? void 0 : first.startAngle;
    sectors === null || sectors === void 0 || sectors.forEach((entry, index) => {
      var prev = prevSectors && prevSectors[index];
      var paddingAngle = index > 0 ? es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_1___default()(entry, 'paddingAngle', 0) : 0;
      if (prev) {
        var angle = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_12__/* .interpolate */ .GW)(prev.endAngle - prev.startAngle, entry.endAngle - entry.startAngle, t);
        var latest = _objectSpread(_objectSpread({}, entry), {}, {
          startAngle: curAngle + paddingAngle,
          endAngle: curAngle + angle + paddingAngle
        });
        stepData.push(latest);
        curAngle = latest.endAngle;
      } else {
        var {
          endAngle,
          startAngle
        } = entry;
        var deltaAngle = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_12__/* .interpolate */ .GW)(0, endAngle - startAngle, t);
        var _latest = _objectSpread(_objectSpread({}, entry), {}, {
          startAngle: curAngle + paddingAngle,
          endAngle: curAngle + deltaAngle + paddingAngle
        });
        stepData.push(_latest);
        curAngle = _latest.endAngle;
      }
    });

    // eslint-disable-next-line no-param-reassign
    previousSectorsRef.current = stepData;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_5__/* .Layer */ .W, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(PieSectors, {
      sectors: stepData,
      activeShape: activeShape,
      inactiveShape: inactiveShape,
      allOtherPieProps: props
    }));
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(PieLabelList, {
    showLabels: !isAnimating,
    sectors: sectors,
    props: props
  }), props.children);
}
var defaultPieProps = {
  animationBegin: 400,
  animationDuration: 1500,
  animationEasing: 'ease',
  cx: '50%',
  cy: '50%',
  dataKey: 'value',
  endAngle: 360,
  fill: '#808080',
  hide: false,
  innerRadius: 0,
  isAnimationActive: !_util_Global__WEBPACK_IMPORTED_MODULE_10__/* .Global */ .m.isSsr,
  labelLine: true,
  legendType: 'rect',
  minAngle: 0,
  nameKey: 'name',
  outerRadius: '80%',
  paddingAngle: 0,
  rootTabIndex: 0,
  startAngle: 0,
  stroke: '#fff'
};
function PieImpl(props) {
  var {
      id
    } = props,
    propsWithoutId = _objectWithoutProperties(props, _excluded2);
  var {
    hide,
    className,
    rootTabIndex
  } = props;
  var cells = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_util_ReactUtils__WEBPACK_IMPORTED_MODULE_9__/* .findAllByType */ .aS)(props.children, _component_Cell__WEBPACK_IMPORTED_MODULE_8__/* .Cell */ .f), [props.children]);
  var sectors = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_4__/* .useAppSelector */ .G)(state => (0,_state_selectors_pieSelectors__WEBPACK_IMPORTED_MODULE_3__/* .selectPieSectors */ .EX)(state, id, cells));
  var previousSectorsRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  var layerClass = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('recharts-pie', className);
  if (hide || sectors == null) {
    previousSectorsRef.current = null;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_5__/* .Layer */ .W, {
      tabIndex: rootTabIndex,
      className: layerClass
    });
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_17__/* .SetTooltipEntrySettings */ .r, {
    fn: getTooltipEntrySettings,
    args: _objectSpread(_objectSpread({}, props), {}, {
      sectors
    })
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_5__/* .Layer */ .W, {
    tabIndex: rootTabIndex,
    className: layerClass
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(SectorsWithAnimation, {
    props: _objectSpread(_objectSpread({}, propsWithoutId), {}, {
      sectors
    }),
    previousSectorsRef: previousSectorsRef
  })));
}
function Pie(outsideProps) {
  var props = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_22__/* .resolveDefaultProps */ .e)(outsideProps, defaultPieProps);
  var {
      id: externalId
    } = props,
    propsWithoutId = _objectWithoutProperties(props, _excluded3);
  var presentationProps = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_25__/* .svgPropertiesNoEvents */ .uZ)(propsWithoutId);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_RegisterGraphicalItemId__WEBPACK_IMPORTED_MODULE_23__/* .RegisterGraphicalItemId */ .x, {
    id: externalId,
    type: "pie"
  }, id => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetGraphicalItem__WEBPACK_IMPORTED_MODULE_24__/* .SetPolarGraphicalItem */ .v, {
    type: "pie",
    id: id,
    data: propsWithoutId.data,
    dataKey: propsWithoutId.dataKey,
    hide: propsWithoutId.hide,
    angleAxisId: 0,
    radiusAxisId: 0,
    name: propsWithoutId.name,
    nameKey: propsWithoutId.nameKey,
    tooltipType: propsWithoutId.tooltipType,
    legendType: propsWithoutId.legendType,
    fill: propsWithoutId.fill,
    cx: propsWithoutId.cx,
    cy: propsWithoutId.cy,
    startAngle: propsWithoutId.startAngle,
    endAngle: propsWithoutId.endAngle,
    paddingAngle: propsWithoutId.paddingAngle,
    minAngle: propsWithoutId.minAngle,
    innerRadius: propsWithoutId.innerRadius,
    outerRadius: propsWithoutId.outerRadius,
    cornerRadius: propsWithoutId.cornerRadius,
    presentationProps: presentationProps,
    maxRadius: props.maxRadius
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(SetPiePayloadLegend, _extends({}, propsWithoutId, {
    id: id
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(PieImpl, _extends({}, propsWithoutId, {
    id: id
  }))));
}
Pie.displayName = 'Pie';

/***/ }),

/***/ 72085:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Gk: () => (/* reexport */ Area/* Area */.Gk),
  QF: () => (/* reexport */ AreaChart/* AreaChart */.Q),
  yP: () => (/* reexport */ Bar/* Bar */.y),
  Es: () => (/* reexport */ BarChart/* BarChart */.E),
  dC: () => (/* reexport */ CartesianGrid/* CartesianGrid */.d),
  fh: () => (/* reexport */ Cell/* Cell */.f),
  s$: () => (/* reexport */ Legend/* Legend */.s),
  N1: () => (/* reexport */ Line/* Line */.N),
  bl: () => (/* reexport */ LineChart/* LineChart */.b),
  Fq: () => (/* reexport */ Pie/* Pie */.F),
  rW: () => (/* reexport */ PieChart/* PieChart */.r),
  ZB: () => (/* reexport */ RadialBar/* RadialBar */.Z),
  DP: () => (/* reexport */ RadialBarChart/* RadialBarChart */.D),
  uf: () => (/* reexport */ ResponsiveContainer/* ResponsiveContainer */.u),
  m_: () => (/* reexport */ Tooltip/* Tooltip */.m),
  WX: () => (/* reexport */ XAxis/* XAxis */.W),
  h8: () => (/* reexport */ YAxis/* YAxis */.h)
});

// UNUSED EXPORTS: Brush, CartesianAxis, ComposedChart, Cross, Curve, Customized, DefaultLegendContent, DefaultTooltipContent, Dot, ErrorBar, Funnel, FunnelChart, Global, Label, LabelList, Layer, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Polygon, Radar, RadarChart, Rectangle, ReferenceArea, ReferenceDot, ReferenceLine, Sankey, Scatter, ScatterChart, Sector, SunburstChart, Surface, Symbols, Text, Trapezoid, Treemap, ZAxis, getNiceTickValues, useActiveTooltipDataPoints, useActiveTooltipLabel, useChartHeight, useChartWidth, useMargin, useOffset, usePlotArea, useXAxisDomain, useYAxisDomain

// EXTERNAL MODULE: ./node_modules/recharts/es6/container/Surface.js
var Surface = __webpack_require__(49303);
// EXTERNAL MODULE: ./node_modules/recharts/es6/container/Layer.js
var Layer = __webpack_require__(86069);
// EXTERNAL MODULE: ./node_modules/recharts/es6/component/Legend.js + 1 modules
var Legend = __webpack_require__(4520);
// EXTERNAL MODULE: ./node_modules/recharts/es6/component/DefaultLegendContent.js
var DefaultLegendContent = __webpack_require__(7275);
// EXTERNAL MODULE: ./node_modules/recharts/es6/component/Tooltip.js + 3 modules
var Tooltip = __webpack_require__(84399);
// EXTERNAL MODULE: ./node_modules/recharts/es6/component/DefaultTooltipContent.js
var DefaultTooltipContent = __webpack_require__(18689);
// EXTERNAL MODULE: ./node_modules/recharts/es6/component/ResponsiveContainer.js + 1 modules
var ResponsiveContainer = __webpack_require__(28482);
// EXTERNAL MODULE: ./node_modules/recharts/es6/component/Cell.js
var Cell = __webpack_require__(72050);
// EXTERNAL MODULE: ./node_modules/recharts/es6/component/Text.js
var Text = __webpack_require__(20261);
// EXTERNAL MODULE: ./node_modules/recharts/es6/component/Label.js
var Label = __webpack_require__(91706);
// EXTERNAL MODULE: ./node_modules/recharts/es6/component/LabelList.js
var LabelList = __webpack_require__(5614);
// EXTERNAL MODULE: ./node_modules/recharts/es6/component/Customized.js
var Customized = __webpack_require__(80279);
// EXTERNAL MODULE: ./node_modules/recharts/es6/shape/Sector.js
var Sector = __webpack_require__(58522);
// EXTERNAL MODULE: ./node_modules/recharts/es6/shape/Curve.js
var Curve = __webpack_require__(45249);
// EXTERNAL MODULE: ./node_modules/recharts/es6/shape/Rectangle.js
var Rectangle = __webpack_require__(34723);
// EXTERNAL MODULE: ./node_modules/recharts/es6/shape/Polygon.js
var Polygon = __webpack_require__(20852);
// EXTERNAL MODULE: ./node_modules/recharts/es6/shape/Dot.js
var Dot = __webpack_require__(66613);
// EXTERNAL MODULE: ./node_modules/recharts/es6/shape/Cross.js
var Cross = __webpack_require__(35862);
// EXTERNAL MODULE: ./node_modules/recharts/es6/shape/Symbols.js
var Symbols = __webpack_require__(65787);
// EXTERNAL MODULE: ./node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(34164);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/recharts/es6/util/PolarUtils.js
var PolarUtils = __webpack_require__(14040);
// EXTERNAL MODULE: ./node_modules/recharts/es6/state/hooks.js
var hooks = __webpack_require__(49082);
// EXTERNAL MODULE: ./node_modules/recharts/es6/state/selectors/polarGridSelectors.js
var polarGridSelectors = __webpack_require__(16281);
// EXTERNAL MODULE: ./node_modules/recharts/es6/state/selectors/polarAxisSelectors.js
var polarAxisSelectors = __webpack_require__(61270);
// EXTERNAL MODULE: ./node_modules/recharts/es6/util/svgPropertiesNoEvents.js
var svgPropertiesNoEvents = __webpack_require__(55448);
;// ./node_modules/recharts/es6/polar/PolarGrid.js
var _excluded = ["gridType", "radialLines", "angleAxisId", "radiusAxisId", "cx", "cy", "innerRadius", "outerRadius"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }







var getPolygonPath = (radius, cx, cy, polarAngles) => {
  var path = '';
  polarAngles.forEach((angle, i) => {
    var point = (0,PolarUtils/* polarToCartesian */.IZ)(cx, cy, radius, angle);
    if (i) {
      path += "L ".concat(point.x, ",").concat(point.y);
    } else {
      path += "M ".concat(point.x, ",").concat(point.y);
    }
  });
  path += 'Z';
  return path;
};

// Draw axis of radial line
var PolarAngles = props => {
  var {
    cx,
    cy,
    innerRadius,
    outerRadius,
    polarAngles,
    radialLines
  } = props;
  if (!polarAngles || !polarAngles.length || !radialLines) {
    return null;
  }
  var polarAnglesProps = _objectSpread({
    stroke: '#ccc'
  }, (0,svgPropertiesNoEvents/* svgPropertiesNoEvents */.uZ)(props));
  return /*#__PURE__*/react.createElement("g", {
    className: "recharts-polar-grid-angle"
  }, polarAngles.map(entry => {
    var start = (0,PolarUtils/* polarToCartesian */.IZ)(cx, cy, innerRadius, entry);
    var end = (0,PolarUtils/* polarToCartesian */.IZ)(cx, cy, outerRadius, entry);
    return /*#__PURE__*/react.createElement("line", _extends({
      key: "line-".concat(entry)
    }, polarAnglesProps, {
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y
    }));
  }));
};

// Draw concentric circles
var ConcentricCircle = props => {
  var {
    cx,
    cy,
    radius
  } = props;
  var concentricCircleProps = _objectSpread({
    stroke: '#ccc',
    fill: 'none'
  }, (0,svgPropertiesNoEvents/* svgPropertiesNoEvents */.uZ)(props));
  return (
    /*#__PURE__*/
    // @ts-expect-error wrong SVG element type
    react.createElement("circle", _extends({}, concentricCircleProps, {
      className: (0,clsx/* clsx */.$)('recharts-polar-grid-concentric-circle', props.className),
      cx: cx,
      cy: cy,
      r: radius
    }))
  );
};

// Draw concentric polygons
var ConcentricPolygon = props => {
  var {
    radius
  } = props;
  var concentricPolygonProps = _objectSpread({
    stroke: '#ccc',
    fill: 'none'
  }, (0,svgPropertiesNoEvents/* svgPropertiesNoEvents */.uZ)(props));
  return /*#__PURE__*/react.createElement("path", _extends({}, concentricPolygonProps, {
    className: (0,clsx/* clsx */.$)('recharts-polar-grid-concentric-polygon', props.className),
    d: getPolygonPath(radius, props.cx, props.cy, props.polarAngles)
  }));
};

// Draw concentric axis
var ConcentricGridPath = props => {
  var {
    polarRadius,
    gridType
  } = props;
  if (!polarRadius || !polarRadius.length) {
    return null;
  }
  var maxPolarRadius = Math.max(...polarRadius);
  var renderBackground = props.fill && props.fill !== 'none';
  return /*#__PURE__*/react.createElement("g", {
    className: "recharts-polar-grid-concentric"
  }, renderBackground && gridType === 'circle' && /*#__PURE__*/react.createElement(ConcentricCircle, _extends({}, props, {
    radius: maxPolarRadius
  })), renderBackground && gridType !== 'circle' && /*#__PURE__*/react.createElement(ConcentricPolygon, _extends({}, props, {
    radius: maxPolarRadius
  })), polarRadius.map((entry, i) => {
    var key = i;
    if (gridType === 'circle') {
      return /*#__PURE__*/react.createElement(ConcentricCircle, _extends({
        key: key
      }, props, {
        fill: "none",
        radius: entry
      }));
    }
    return /*#__PURE__*/react.createElement(ConcentricPolygon, _extends({
      key: key
    }, props, {
      fill: "none",
      radius: entry
    }));
  }));
};
var PolarGrid = _ref => {
  var _ref2, _polarViewBox$cx, _ref3, _polarViewBox$cy, _ref4, _polarViewBox$innerRa, _ref5, _polarViewBox$outerRa;
  var {
      gridType = 'polygon',
      radialLines = true,
      angleAxisId = 0,
      radiusAxisId = 0,
      cx: cxFromOutside,
      cy: cyFromOutside,
      innerRadius: innerRadiusFromOutside,
      outerRadius: outerRadiusFromOutside
    } = _ref,
    inputs = _objectWithoutProperties(_ref, _excluded);
  var polarViewBox = (0,hooks/* useAppSelector */.G)(polarAxisSelectors/* selectPolarViewBox */.D0);
  var props = _objectSpread({
    cx: (_ref2 = (_polarViewBox$cx = polarViewBox === null || polarViewBox === void 0 ? void 0 : polarViewBox.cx) !== null && _polarViewBox$cx !== void 0 ? _polarViewBox$cx : cxFromOutside) !== null && _ref2 !== void 0 ? _ref2 : 0,
    cy: (_ref3 = (_polarViewBox$cy = polarViewBox === null || polarViewBox === void 0 ? void 0 : polarViewBox.cy) !== null && _polarViewBox$cy !== void 0 ? _polarViewBox$cy : cyFromOutside) !== null && _ref3 !== void 0 ? _ref3 : 0,
    innerRadius: (_ref4 = (_polarViewBox$innerRa = polarViewBox === null || polarViewBox === void 0 ? void 0 : polarViewBox.innerRadius) !== null && _polarViewBox$innerRa !== void 0 ? _polarViewBox$innerRa : innerRadiusFromOutside) !== null && _ref4 !== void 0 ? _ref4 : 0,
    outerRadius: (_ref5 = (_polarViewBox$outerRa = polarViewBox === null || polarViewBox === void 0 ? void 0 : polarViewBox.outerRadius) !== null && _polarViewBox$outerRa !== void 0 ? _polarViewBox$outerRa : outerRadiusFromOutside) !== null && _ref5 !== void 0 ? _ref5 : 0
  }, inputs);
  var {
    polarAngles: polarAnglesInput,
    polarRadius: polarRadiusInput,
    outerRadius
  } = props;
  var polarAnglesFromRedux = (0,hooks/* useAppSelector */.G)(state => (0,polarGridSelectors/* selectPolarGridAngles */.B)(state, angleAxisId));
  var polarRadiiFromRedux = (0,hooks/* useAppSelector */.G)(state => (0,polarGridSelectors/* selectPolarGridRadii */.k)(state, radiusAxisId));
  var polarAngles = Array.isArray(polarAnglesInput) ? polarAnglesInput : polarAnglesFromRedux;
  var polarRadius = Array.isArray(polarRadiusInput) ? polarRadiusInput : polarRadiiFromRedux;
  if (outerRadius <= 0 || polarAngles == null || polarRadius == null) {
    return null;
  }
  return /*#__PURE__*/react.createElement("g", {
    className: "recharts-polar-grid"
  }, /*#__PURE__*/react.createElement(ConcentricGridPath, _extends({
    gridType: gridType,
    radialLines: radialLines
  }, props, {
    polarAngles: polarAngles,
    polarRadius: polarRadius
  })), /*#__PURE__*/react.createElement(PolarAngles, _extends({
    gridType: gridType,
    radialLines: radialLines
  }, props, {
    polarAngles: polarAngles,
    polarRadius: polarRadius
  })));
};
PolarGrid.displayName = 'PolarGrid';
// EXTERNAL MODULE: ./node_modules/es-toolkit/compat/maxBy.js
var maxBy = __webpack_require__(94338);
var maxBy_default = /*#__PURE__*/__webpack_require__.n(maxBy);
// EXTERNAL MODULE: ./node_modules/es-toolkit/compat/minBy.js
var minBy = __webpack_require__(12972);
var minBy_default = /*#__PURE__*/__webpack_require__.n(minBy);
// EXTERNAL MODULE: ./node_modules/recharts/es6/util/types.js
var types = __webpack_require__(98940);
// EXTERNAL MODULE: ./node_modules/recharts/es6/state/polarAxisSlice.js
var polarAxisSlice = __webpack_require__(43337);
// EXTERNAL MODULE: ./node_modules/recharts/es6/state/selectors/polarScaleSelectors.js
var polarScaleSelectors = __webpack_require__(28871);
// EXTERNAL MODULE: ./node_modules/recharts/es6/polar/defaultPolarRadiusAxisProps.js
var defaultPolarRadiusAxisProps = __webpack_require__(57777);
;// ./node_modules/recharts/es6/polar/PolarRadiusAxis.js
var PolarRadiusAxis_excluded = ["cx", "cy", "angle", "axisLine"],
  _excluded2 = ["angle", "tickFormatter", "stroke", "tick"];
function PolarRadiusAxis_extends() { return PolarRadiusAxis_extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, PolarRadiusAxis_extends.apply(null, arguments); }
function PolarRadiusAxis_ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function PolarRadiusAxis_objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? PolarRadiusAxis_ownKeys(Object(t), !0).forEach(function (r) { PolarRadiusAxis_defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : PolarRadiusAxis_ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function PolarRadiusAxis_defineProperty(e, r, t) { return (r = PolarRadiusAxis_toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function PolarRadiusAxis_toPropertyKey(t) { var i = PolarRadiusAxis_toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function PolarRadiusAxis_toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function PolarRadiusAxis_objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = PolarRadiusAxis_objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function PolarRadiusAxis_objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
















var AXIS_TYPE = 'radiusAxis';
function SetRadiusAxisSettings(settings) {
  var dispatch = (0,hooks/* useAppDispatch */.j)();
  (0,react.useEffect)(() => {
    dispatch((0,polarAxisSlice/* addRadiusAxis */.zo)(settings));
    return () => {
      dispatch((0,polarAxisSlice/* removeRadiusAxis */.Sb)(settings));
    };
  });
  return null;
}

/**
 * Calculate the coordinate of tick
 * @param coordinate The radius of tick
 * @param angle from props
 * @param cx from chart
 * @param cy from chart
 * @return (x, y)
 */
var getTickValueCoord = (_ref, angle, cx, cy) => {
  var {
    coordinate
  } = _ref;
  return (0,PolarUtils/* polarToCartesian */.IZ)(cx, cy, coordinate, angle);
};
var getTickTextAnchor = orientation => {
  var textAnchor;
  switch (orientation) {
    case 'left':
      textAnchor = 'end';
      break;
    case 'right':
      textAnchor = 'start';
      break;
    default:
      textAnchor = 'middle';
      break;
  }
  return textAnchor;
};
var getViewBox = (angle, cx, cy, ticks) => {
  var maxRadiusTick = maxBy_default()(ticks, entry => entry.coordinate || 0);
  var minRadiusTick = minBy_default()(ticks, entry => entry.coordinate || 0);
  return {
    cx,
    cy,
    startAngle: angle,
    endAngle: angle,
    innerRadius: minRadiusTick.coordinate || 0,
    outerRadius: maxRadiusTick.coordinate || 0,
    clockWise: false
  };
};
var renderAxisLine = (props, ticks) => {
  var {
      cx,
      cy,
      angle,
      axisLine
    } = props,
    others = PolarRadiusAxis_objectWithoutProperties(props, PolarRadiusAxis_excluded);
  var extent = ticks.reduce((result, entry) => [Math.min(result[0], entry.coordinate), Math.max(result[1], entry.coordinate)], [Infinity, -Infinity]);
  var point0 = (0,PolarUtils/* polarToCartesian */.IZ)(cx, cy, extent[0], angle);
  var point1 = (0,PolarUtils/* polarToCartesian */.IZ)(cx, cy, extent[1], angle);
  var axisLineProps = PolarRadiusAxis_objectSpread(PolarRadiusAxis_objectSpread(PolarRadiusAxis_objectSpread({}, (0,svgPropertiesNoEvents/* svgPropertiesNoEvents */.uZ)(others)), {}, {
    fill: 'none'
  }, (0,svgPropertiesNoEvents/* svgPropertiesNoEvents */.uZ)(axisLine)), {}, {
    x1: point0.x,
    y1: point0.y,
    x2: point1.x,
    y2: point1.y
  });

  // @ts-expect-error wrong SVG element type
  return /*#__PURE__*/react.createElement("line", PolarRadiusAxis_extends({
    className: "recharts-polar-radius-axis-line"
  }, axisLineProps));
};
var renderTickItem = (option, tickProps, value) => {
  var tickItem;
  if (/*#__PURE__*/react.isValidElement(option)) {
    tickItem = /*#__PURE__*/react.cloneElement(option, tickProps);
  } else if (typeof option === 'function') {
    tickItem = option(tickProps);
  } else {
    tickItem = /*#__PURE__*/react.createElement(Text/* Text */.E, PolarRadiusAxis_extends({}, tickProps, {
      className: "recharts-polar-radius-axis-tick-value"
    }), value);
  }
  return tickItem;
};
var renderTicks = (props, ticks) => {
  var {
      angle,
      tickFormatter,
      stroke,
      tick
    } = props,
    others = PolarRadiusAxis_objectWithoutProperties(props, _excluded2);
  var textAnchor = getTickTextAnchor(props.orientation);
  var axisProps = (0,svgPropertiesNoEvents/* svgPropertiesNoEvents */.uZ)(others);
  var customTickProps = (0,svgPropertiesNoEvents/* svgPropertiesNoEventsFromUnknown */.ic)(tick);
  var items = ticks.map((entry, i) => {
    var coord = getTickValueCoord(entry, props.angle, props.cx, props.cy);
    var tickProps = PolarRadiusAxis_objectSpread(PolarRadiusAxis_objectSpread(PolarRadiusAxis_objectSpread(PolarRadiusAxis_objectSpread({
      textAnchor,
      transform: "rotate(".concat(90 - angle, ", ").concat(coord.x, ", ").concat(coord.y, ")")
    }, axisProps), {}, {
      stroke: 'none',
      fill: stroke
    }, customTickProps), {}, {
      index: i
    }, coord), {}, {
      payload: entry
    });
    return /*#__PURE__*/react.createElement(Layer/* Layer */.W, PolarRadiusAxis_extends({
      className: (0,clsx/* clsx */.$)('recharts-polar-radius-axis-tick', (0,PolarUtils/* getTickClassName */.Zk)(tick)),
      key: "tick-".concat(entry.coordinate)
    }, (0,types/* adaptEventsOfChild */.X)(props, entry, i)), renderTickItem(tick, tickProps, tickFormatter ? tickFormatter(entry.value, i) : entry.value));
  });
  return /*#__PURE__*/react.createElement(Layer/* Layer */.W, {
    className: "recharts-polar-radius-axis-ticks"
  }, items);
};
var PolarRadiusAxisWrapper = defaultsAndInputs => {
  var {
    radiusAxisId
  } = defaultsAndInputs;
  var viewBox = (0,hooks/* useAppSelector */.G)(polarAxisSelectors/* selectPolarViewBox */.D0);
  var scale = (0,hooks/* useAppSelector */.G)(state => (0,polarScaleSelectors/* selectPolarAxisScale */.Qr)(state, 'radiusAxis', radiusAxisId));
  var ticks = (0,hooks/* useAppSelector */.G)(state => (0,polarScaleSelectors/* selectPolarAxisTicks */.YF)(state, 'radiusAxis', radiusAxisId, false));
  if (viewBox == null || !ticks || !ticks.length) {
    return null;
  }
  var props = PolarRadiusAxis_objectSpread(PolarRadiusAxis_objectSpread(PolarRadiusAxis_objectSpread({}, defaultsAndInputs), {}, {
    scale
  }, viewBox), {}, {
    radius: viewBox.outerRadius
  });
  var {
    tick,
    axisLine
  } = props;
  return /*#__PURE__*/react.createElement(Layer/* Layer */.W, {
    className: (0,clsx/* clsx */.$)('recharts-polar-radius-axis', AXIS_TYPE, props.className)
  }, axisLine && renderAxisLine(props, ticks), tick && renderTicks(props, ticks), /*#__PURE__*/react.createElement(Label/* PolarLabelContextProvider */.$w, getViewBox(props.angle, props.cx, props.cy, ticks), /*#__PURE__*/react.createElement(Label/* PolarLabelFromLabelProp */.mr, {
    label: props.label
  }), props.children));
};
class PolarRadiusAxis extends react.PureComponent {
  render() {
    return /*#__PURE__*/react.createElement(react.Fragment, null, /*#__PURE__*/react.createElement(SetRadiusAxisSettings, {
      domain: this.props.domain,
      id: this.props.radiusAxisId,
      scale: this.props.scale,
      type: this.props.type,
      dataKey: this.props.dataKey,
      unit: undefined,
      name: this.props.name,
      allowDuplicatedCategory: this.props.allowDuplicatedCategory,
      allowDataOverflow: this.props.allowDataOverflow,
      reversed: this.props.reversed,
      includeHidden: this.props.includeHidden,
      allowDecimals: this.props.allowDecimals,
      tickCount: this.props.tickCount
      // @ts-expect-error the type does not match. Is RadiusAxis really expecting what it says?
      ,
      ticks: this.props.ticks,
      tick: this.props.tick
    }), /*#__PURE__*/react.createElement(PolarRadiusAxisWrapper, this.props));
  }
}
PolarRadiusAxis_defineProperty(PolarRadiusAxis, "displayName", 'PolarRadiusAxis');
PolarRadiusAxis_defineProperty(PolarRadiusAxis, "axisType", AXIS_TYPE);
PolarRadiusAxis_defineProperty(PolarRadiusAxis, "defaultProps", defaultPolarRadiusAxisProps/* defaultPolarRadiusAxisProps */.j);
// EXTERNAL MODULE: ./node_modules/recharts/es6/polar/defaultPolarAngleAxisProps.js
var defaultPolarAngleAxisProps = __webpack_require__(46344);
// EXTERNAL MODULE: ./node_modules/recharts/es6/context/PanoramaContext.js
var PanoramaContext = __webpack_require__(12070);
;// ./node_modules/recharts/es6/polar/PolarAngleAxis.js
var PolarAngleAxis_excluded = ["children"];
function PolarAngleAxis_extends() { return PolarAngleAxis_extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, PolarAngleAxis_extends.apply(null, arguments); }
function PolarAngleAxis_ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function PolarAngleAxis_objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? PolarAngleAxis_ownKeys(Object(t), !0).forEach(function (r) { PolarAngleAxis_defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : PolarAngleAxis_ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function PolarAngleAxis_defineProperty(e, r, t) { return (r = PolarAngleAxis_toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function PolarAngleAxis_toPropertyKey(t) { var i = PolarAngleAxis_toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function PolarAngleAxis_toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function PolarAngleAxis_objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = PolarAngleAxis_objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function PolarAngleAxis_objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
















var eps = 1e-5;
var COS_45 = Math.cos((0,PolarUtils/* degreeToRadian */.zh)(45));

/**
 * These are injected from Redux, are required, but cannot be set by user.
 */

var PolarAngleAxis_AXIS_TYPE = 'angleAxis';
function SetAngleAxisSettings(props) {
  var dispatch = (0,hooks/* useAppDispatch */.j)();
  var settings = (0,react.useMemo)(() => {
    var {
        children
      } = props,
      rest = PolarAngleAxis_objectWithoutProperties(props, PolarAngleAxis_excluded);
    return rest;
  }, [props]);
  var synchronizedSettings = (0,hooks/* useAppSelector */.G)(state => (0,polarAxisSelectors/* selectAngleAxis */.Be)(state, settings.id));
  var settingsAreSynchronized = settings === synchronizedSettings;
  (0,react.useEffect)(() => {
    dispatch((0,polarAxisSlice/* addAngleAxis */.Ys)(settings));
    return () => {
      dispatch((0,polarAxisSlice/* removeAngleAxis */.jx)(settings));
    };
  }, [dispatch, settings]);
  if (settingsAreSynchronized) {
    return props.children;
  }
  return null;
}

/**
 * Calculate the coordinate of line endpoint
 * @param data The data if there are ticks
 * @param props axis settings
 * @return (x1, y1): The point close to text,
 *         (x2, y2): The point close to axis
 */
var getTickLineCoord = (data, props) => {
  var {
    cx,
    cy,
    radius,
    orientation,
    tickSize
  } = props;
  var tickLineSize = tickSize || 8;
  var p1 = (0,PolarUtils/* polarToCartesian */.IZ)(cx, cy, radius, data.coordinate);
  var p2 = (0,PolarUtils/* polarToCartesian */.IZ)(cx, cy, radius + (orientation === 'inner' ? -1 : 1) * tickLineSize, data.coordinate);
  return {
    x1: p1.x,
    y1: p1.y,
    x2: p2.x,
    y2: p2.y
  };
};

/**
 * Get the text-anchor of each tick
 * @param data Data of ticks
 * @param orientation of the axis ticks
 * @return text-anchor
 */
var PolarAngleAxis_getTickTextAnchor = (data, orientation) => {
  var cos = Math.cos((0,PolarUtils/* degreeToRadian */.zh)(-data.coordinate));
  if (cos > eps) {
    return orientation === 'outer' ? 'start' : 'end';
  }
  if (cos < -eps) {
    return orientation === 'outer' ? 'end' : 'start';
  }
  return 'middle';
};

/**
 * Get the text vertical anchor of each tick
 * @param data Data of a tick
 * @return text vertical anchor
 */
var getTickTextVerticalAnchor = data => {
  var cos = Math.cos((0,PolarUtils/* degreeToRadian */.zh)(-data.coordinate));
  var sin = Math.sin((0,PolarUtils/* degreeToRadian */.zh)(-data.coordinate));

  // handle top and bottom sectors: 90±45deg and 270±45deg
  if (Math.abs(cos) <= COS_45) {
    // sin > 0: top sector, sin < 0: bottom sector
    return sin > 0 ? 'start' : 'end';
  }
  return 'middle';
};
var AxisLine = props => {
  var {
    cx,
    cy,
    radius,
    axisLineType,
    axisLine,
    ticks
  } = props;
  if (!axisLine) {
    return null;
  }
  var axisLineProps = PolarAngleAxis_objectSpread(PolarAngleAxis_objectSpread({}, (0,svgPropertiesNoEvents/* svgPropertiesNoEvents */.uZ)(props)), {}, {
    fill: 'none'
  }, (0,svgPropertiesNoEvents/* svgPropertiesNoEvents */.uZ)(axisLine));
  if (axisLineType === 'circle') {
    // @ts-expect-error wrong SVG element type
    return /*#__PURE__*/react.createElement(Dot/* Dot */.c, PolarAngleAxis_extends({
      className: "recharts-polar-angle-axis-line"
    }, axisLineProps, {
      cx: cx,
      cy: cy,
      r: radius
    }));
  }
  var points = ticks.map(entry => (0,PolarUtils/* polarToCartesian */.IZ)(cx, cy, radius, entry.coordinate));

  // @ts-expect-error wrong SVG element type
  return /*#__PURE__*/react.createElement(Polygon/* Polygon */.t, PolarAngleAxis_extends({
    className: "recharts-polar-angle-axis-line"
  }, axisLineProps, {
    points: points
  }));
};
var TickItemText = _ref => {
  var {
    tick,
    tickProps,
    value
  } = _ref;
  if (!tick) {
    return null;
  }
  if (/*#__PURE__*/react.isValidElement(tick)) {
    // @ts-expect-error element cloning makes typescript unhappy and me too
    return /*#__PURE__*/react.cloneElement(tick, tickProps);
  }
  if (typeof tick === 'function') {
    return tick(tickProps);
  }
  return /*#__PURE__*/react.createElement(Text/* Text */.E, PolarAngleAxis_extends({}, tickProps, {
    className: "recharts-polar-angle-axis-tick-value"
  }), value);
};
var Ticks = props => {
  var {
    tick,
    tickLine,
    tickFormatter,
    stroke,
    ticks
  } = props;
  var axisProps = (0,svgPropertiesNoEvents/* svgPropertiesNoEvents */.uZ)(props);
  var customTickProps = (0,svgPropertiesNoEvents/* svgPropertiesNoEventsFromUnknown */.ic)(tick);
  var tickLineProps = PolarAngleAxis_objectSpread(PolarAngleAxis_objectSpread({}, axisProps), {}, {
    fill: 'none'
  }, (0,svgPropertiesNoEvents/* svgPropertiesNoEvents */.uZ)(tickLine));
  var items = ticks.map((entry, i) => {
    var lineCoord = getTickLineCoord(entry, props);
    var textAnchor = PolarAngleAxis_getTickTextAnchor(entry, props.orientation);
    var verticalAnchor = getTickTextVerticalAnchor(entry);
    var tickProps = PolarAngleAxis_objectSpread(PolarAngleAxis_objectSpread(PolarAngleAxis_objectSpread({}, axisProps), {}, {
      // @ts-expect-error customTickProps is contributing unknown props
      textAnchor,
      verticalAnchor,
      // @ts-expect-error customTickProps is contributing unknown props
      stroke: 'none',
      // @ts-expect-error customTickProps is contributing unknown props
      fill: stroke
    }, customTickProps), {}, {
      index: i,
      payload: entry,
      x: lineCoord.x2,
      y: lineCoord.y2
    });
    return /*#__PURE__*/react.createElement(Layer/* Layer */.W, PolarAngleAxis_extends({
      className: (0,clsx/* clsx */.$)('recharts-polar-angle-axis-tick', (0,PolarUtils/* getTickClassName */.Zk)(tick)),
      key: "tick-".concat(entry.coordinate)
    }, (0,types/* adaptEventsOfChild */.X)(props, entry, i)), tickLine && /*#__PURE__*/react.createElement("line", PolarAngleAxis_extends({
      className: "recharts-polar-angle-axis-tick-line"
    }, tickLineProps, lineCoord)), /*#__PURE__*/react.createElement(TickItemText, {
      tick: tick,
      tickProps: tickProps,
      value: tickFormatter ? tickFormatter(entry.value, i) : entry.value
    }));
  });
  return /*#__PURE__*/react.createElement(Layer/* Layer */.W, {
    className: "recharts-polar-angle-axis-ticks"
  }, items);
};
var PolarAngleAxisWrapper = defaultsAndInputs => {
  var {
    angleAxisId
  } = defaultsAndInputs;
  var viewBox = (0,hooks/* useAppSelector */.G)(polarAxisSelectors/* selectPolarViewBox */.D0);
  var scale = (0,hooks/* useAppSelector */.G)(state => (0,polarScaleSelectors/* selectPolarAxisScale */.Qr)(state, 'angleAxis', angleAxisId));
  var isPanorama = (0,PanoramaContext/* useIsPanorama */.r)();
  var ticks = (0,hooks/* useAppSelector */.G)(state => (0,polarScaleSelectors/* selectPolarAxisTicks */.YF)(state, 'angleAxis', angleAxisId, isPanorama));
  if (viewBox == null || !ticks || !ticks.length) {
    return null;
  }
  var props = PolarAngleAxis_objectSpread(PolarAngleAxis_objectSpread(PolarAngleAxis_objectSpread({}, defaultsAndInputs), {}, {
    scale
  }, viewBox), {}, {
    radius: viewBox.outerRadius
  });
  return /*#__PURE__*/react.createElement(Layer/* Layer */.W, {
    className: (0,clsx/* clsx */.$)('recharts-polar-angle-axis', PolarAngleAxis_AXIS_TYPE, props.className)
  }, /*#__PURE__*/react.createElement(AxisLine, PolarAngleAxis_extends({}, props, {
    ticks: ticks
  })), /*#__PURE__*/react.createElement(Ticks, PolarAngleAxis_extends({}, props, {
    ticks: ticks
  })));
};
class PolarAngleAxis extends react.PureComponent {
  render() {
    if (this.props.radius <= 0) return null;
    return /*#__PURE__*/react.createElement(SetAngleAxisSettings, {
      id: this.props.angleAxisId,
      scale: this.props.scale,
      type: this.props.type,
      dataKey: this.props.dataKey,
      unit: undefined,
      name: this.props.name,
      allowDuplicatedCategory: false // Ignoring the prop on purpose because axis calculation behaves as if it was false and Tooltip requires it to be true.
      ,
      allowDataOverflow: false,
      reversed: this.props.reversed,
      includeHidden: false,
      allowDecimals: this.props.allowDecimals,
      tickCount: this.props.tickCount
      // @ts-expect-error the type does not match. Is RadiusAxis really expecting what it says?
      ,
      ticks: this.props.ticks,
      tick: this.props.tick,
      domain: this.props.domain
    }, /*#__PURE__*/react.createElement(PolarAngleAxisWrapper, this.props));
  }
}
PolarAngleAxis_defineProperty(PolarAngleAxis, "displayName", 'PolarAngleAxis');
PolarAngleAxis_defineProperty(PolarAngleAxis, "axisType", PolarAngleAxis_AXIS_TYPE);
PolarAngleAxis_defineProperty(PolarAngleAxis, "defaultProps", defaultPolarAngleAxisProps/* defaultPolarAngleAxisProps */.c);
// EXTERNAL MODULE: ./node_modules/recharts/es6/polar/Pie.js
var Pie = __webpack_require__(63161);
// EXTERNAL MODULE: ./node_modules/recharts/es6/polar/Radar.js
var Radar = __webpack_require__(21567);
// EXTERNAL MODULE: ./node_modules/recharts/es6/polar/RadialBar.js
var RadialBar = __webpack_require__(32351);
// EXTERNAL MODULE: ./node_modules/recharts/es6/cartesian/Brush.js
var Brush = __webpack_require__(3509);
// EXTERNAL MODULE: ./node_modules/recharts/es6/cartesian/ReferenceLine.js
var ReferenceLine = __webpack_require__(57158);
// EXTERNAL MODULE: ./node_modules/recharts/es6/cartesian/ReferenceDot.js
var ReferenceDot = __webpack_require__(45373);
// EXTERNAL MODULE: ./node_modules/recharts/es6/cartesian/ReferenceArea.js
var ReferenceArea = __webpack_require__(88621);
// EXTERNAL MODULE: ./node_modules/recharts/es6/cartesian/CartesianAxis.js
var CartesianAxis = __webpack_require__(99582);
// EXTERNAL MODULE: ./node_modules/recharts/es6/cartesian/CartesianGrid.js
var CartesianGrid = __webpack_require__(69107);
// EXTERNAL MODULE: ./node_modules/recharts/es6/cartesian/Line.js
var Line = __webpack_require__(86279);
// EXTERNAL MODULE: ./node_modules/recharts/es6/cartesian/Area.js
var Area = __webpack_require__(84124);
// EXTERNAL MODULE: ./node_modules/recharts/es6/cartesian/Bar.js
var Bar = __webpack_require__(15344);
// EXTERNAL MODULE: ./node_modules/recharts/es6/cartesian/Scatter.js
var Scatter = __webpack_require__(14799);
// EXTERNAL MODULE: ./node_modules/recharts/es6/cartesian/XAxis.js
var XAxis = __webpack_require__(77984);
// EXTERNAL MODULE: ./node_modules/recharts/es6/cartesian/YAxis.js
var YAxis = __webpack_require__(23495);
// EXTERNAL MODULE: ./node_modules/recharts/es6/cartesian/ZAxis.js
var ZAxis = __webpack_require__(51658);
// EXTERNAL MODULE: ./node_modules/recharts/es6/cartesian/ErrorBar.js
var ErrorBar = __webpack_require__(51738);
// EXTERNAL MODULE: ./node_modules/recharts/es6/chart/LineChart.js
var LineChart = __webpack_require__(45721);
// EXTERNAL MODULE: ./node_modules/recharts/es6/chart/BarChart.js
var BarChart = __webpack_require__(88224);
// EXTERNAL MODULE: ./node_modules/recharts/es6/chart/PieChart.js
var PieChart = __webpack_require__(62209);
// EXTERNAL MODULE: ./node_modules/recharts/es6/chart/Treemap.js
var Treemap = __webpack_require__(33737);
// EXTERNAL MODULE: ./node_modules/recharts/es6/chart/Sankey.js
var Sankey = __webpack_require__(82938);
// EXTERNAL MODULE: ./node_modules/recharts/es6/chart/RadarChart.js
var RadarChart = __webpack_require__(85395);
// EXTERNAL MODULE: ./node_modules/recharts/es6/chart/ScatterChart.js
var ScatterChart = __webpack_require__(59853);
// EXTERNAL MODULE: ./node_modules/recharts/es6/chart/AreaChart.js
var AreaChart = __webpack_require__(50300);
// EXTERNAL MODULE: ./node_modules/recharts/es6/chart/RadialBarChart.js
var RadialBarChart = __webpack_require__(66264);
// EXTERNAL MODULE: ./node_modules/recharts/es6/chart/ComposedChart.js
var ComposedChart = __webpack_require__(98207);
// EXTERNAL MODULE: ./node_modules/recharts/es6/chart/SunburstChart.js
var SunburstChart = __webpack_require__(26435);
// EXTERNAL MODULE: ./node_modules/recharts/es6/cartesian/Funnel.js
var Funnel = __webpack_require__(34429);
// EXTERNAL MODULE: ./node_modules/recharts/es6/chart/FunnelChart.js
var FunnelChart = __webpack_require__(88131);
// EXTERNAL MODULE: ./node_modules/recharts/es6/shape/Trapezoid.js
var Trapezoid = __webpack_require__(88982);
// EXTERNAL MODULE: ./node_modules/recharts/es6/util/Global.js
var Global = __webpack_require__(59938);
// EXTERNAL MODULE: ./node_modules/recharts/es6/util/scale/getNiceTickValues.js + 2 modules
var getNiceTickValues = __webpack_require__(5511);
// EXTERNAL MODULE: ./node_modules/recharts/es6/hooks.js
var es6_hooks = __webpack_require__(33092);
// EXTERNAL MODULE: ./node_modules/recharts/es6/context/chartLayoutContext.js
var chartLayoutContext = __webpack_require__(19287);
;// ./node_modules/recharts/es6/index.js
// "export type" declarations on separate lines are in use
// to workaround babel issue(s) 11465 12578
//

// see https://github.com/babel/babel/issues/11464#issuecomment-617606898






















































/** export getNiceTickValues so this can be used as a replacement for what is in recharts-scale */




/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVuZG9yLWNvbW1vbi1iODczNTYzYy4zNDg0NTA1NDA4MmFjYzNjMzYwNy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQSwwQ0FBMEMsMEJBQTBCLG1EQUFtRCxvQ0FBb0MseUNBQXlDLFlBQVksY0FBYyx3Q0FBd0MscURBQXFEO0FBQzNULCtDQUErQywwQkFBMEIsWUFBWSx1QkFBdUIsOEJBQThCLG1DQUFtQyxlQUFlO0FBQzVMLHlCQUF5Qix3QkFBd0Isb0NBQW9DLHlDQUF5QyxrQ0FBa0MsMERBQTBELDBCQUEwQjtBQUNwUCw0QkFBNEIsZ0JBQWdCLHNCQUFzQixPQUFPLGtEQUFrRCxzREFBc0QsOEJBQThCLG1KQUFtSixxRUFBcUUsS0FBSztBQUM1YSxvQ0FBb0Msb0VBQW9FLDBEQUEwRDtBQUNsSyw2QkFBNkIsbUNBQW1DO0FBQ2hFLDhCQUE4QiwwQ0FBMEMsK0JBQStCLG9CQUFvQixtQ0FBbUMsb0NBQW9DLHVFQUF1RTtBQUN6USxzQkFBc0Isd0VBQXdFLGdCQUFnQixzQkFBc0IsT0FBTyxzQkFBc0Isb0JBQW9CLGdEQUFnRCxXQUFXO0FBQ2hQO0FBQytCO0FBQ3NDO0FBQzNCO0FBQ2Q7QUFDK0I7QUFDbkI7QUFDYztBQUNxQjtBQUNoQztBQUNSO0FBQ1E7QUFDd0Q7QUFDMUM7QUFDa0I7QUFDTDtBQUN0QjtBQUNXO0FBQ087QUFDVjtBQUNxQjtBQUNYO0FBQ0k7QUFDSDtBQUN3QztBQUMzRztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLDhFQUFrQjtBQUM3QjtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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c0JBQVEsR0FBRztBQUMxRDtBQUNBLEdBQUc7QUFDSDtBQUNPLDZCQUE2QixtQkFBYTtBQUNqRDtBQUNBO0FBQ0Esd0JBQXdCLG1CQUFtQjtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLLGVBQWUsbUJBQW1CO0FBQ3ZDO0FBQ0E7QUFDQSw2QkFBZTtBQUNmLDZCQUFlLDZCQUE2Qix3QkFBUztBQUNyRCw2QkFBZSxpQ0FBaUMsNERBQTBCLEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzFRMUU7QUFDQTtBQUNBOztBQUVBO0FBQzhDO0FBQ0o7QUFDRTtBQUM0QjtBQUMxQjtBQUM0QjtBQUNKO0FBQzlCO0FBQ0E7QUFDRTtBQUNRO0FBQ0U7QUFDWjtBQUNGO0FBQ1E7QUFDSjtBQUNSO0FBQ0k7QUFDSTtBQUNJO0FBQ1k7QUFDRjtBQUN0QjtBQUNJO0FBQ1E7QUFDSjtBQUNnQjtBQUNGO0FBQ0U7QUFDQTtBQUNBO0FBQ2xCO0FBQ0E7QUFDRjtBQUNRO0FBQ0o7QUFDQTtBQUNBO0FBQ007QUFDRjtBQUNGO0FBQ0E7QUFDRjtBQUNGO0FBQ1E7QUFDSTtBQUNOO0FBQ1U7QUFDRjtBQUNBO0FBQ1Y7QUFDTTtBQUNKO0FBQ1A7QUFDdkM7QUFDbUU7QUFDaUUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvcG9sYXIvUmFkYXIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3BvbGFyL1JhZGlhbEJhci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvaG9va3MuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3BvbGFyL2RlZmF1bHRQb2xhckFuZ2xlQXhpc1Byb3BzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9wb2xhci9kZWZhdWx0UG9sYXJSYWRpdXNBeGlzUHJvcHMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3BvbGFyL1BpZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvcG9sYXIvUG9sYXJHcmlkLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9wb2xhci9Qb2xhclJhZGl1c0F4aXMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3BvbGFyL1BvbGFyQW5nbGVBeGlzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgX2V4Y2x1ZGVkID0gW1wiaWRcIl07XG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoZSwgdCkgeyBpZiAobnVsbCA9PSBlKSByZXR1cm4ge307IHZhciBvLCByLCBpID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzTG9vc2UoZSwgdCk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBuID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhlKTsgZm9yIChyID0gMDsgciA8IG4ubGVuZ3RoOyByKyspIG8gPSBuW3JdLCAtMSA9PT0gdC5pbmRleE9mKG8pICYmIHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoZSwgbykgJiYgKGlbb10gPSBlW29dKTsgfSByZXR1cm4gaTsgfVxuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzTG9vc2UociwgZSkgeyBpZiAobnVsbCA9PSByKSByZXR1cm4ge307IHZhciB0ID0ge307IGZvciAodmFyIG4gaW4gcikgaWYgKHt9Lmhhc093blByb3BlcnR5LmNhbGwociwgbikpIHsgaWYgKC0xICE9PSBlLmluZGV4T2YobikpIGNvbnRpbnVlOyB0W25dID0gcltuXTsgfSByZXR1cm4gdDsgfVxuZnVuY3Rpb24gb3duS2V5cyhlLCByKSB7IHZhciB0ID0gT2JqZWN0LmtleXMoZSk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBvID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhlKTsgciAmJiAobyA9IG8uZmlsdGVyKGZ1bmN0aW9uIChyKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGUsIHIpLmVudW1lcmFibGU7IH0pKSwgdC5wdXNoLmFwcGx5KHQsIG8pOyB9IHJldHVybiB0OyB9XG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKGUpIHsgZm9yICh2YXIgciA9IDE7IHIgPCBhcmd1bWVudHMubGVuZ3RoOyByKyspIHsgdmFyIHQgPSBudWxsICE9IGFyZ3VtZW50c1tyXSA/IGFyZ3VtZW50c1tyXSA6IHt9OyByICUgMiA/IG93bktleXMoT2JqZWN0KHQpLCAhMCkuZm9yRWFjaChmdW5jdGlvbiAocikgeyBfZGVmaW5lUHJvcGVydHkoZSwgciwgdFtyXSk7IH0pIDogT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhlLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyh0KSkgOiBvd25LZXlzKE9iamVjdCh0KSkuZm9yRWFjaChmdW5jdGlvbiAocikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0LCByKSk7IH0pOyB9IHJldHVybiBlOyB9XG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkoZSwgciwgdCkgeyByZXR1cm4gKHIgPSBfdG9Qcm9wZXJ0eUtleShyKSkgaW4gZSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCB7IHZhbHVlOiB0LCBlbnVtZXJhYmxlOiAhMCwgY29uZmlndXJhYmxlOiAhMCwgd3JpdGFibGU6ICEwIH0pIDogZVtyXSA9IHQsIGU7IH1cbmZ1bmN0aW9uIF90b1Byb3BlcnR5S2V5KHQpIHsgdmFyIGkgPSBfdG9QcmltaXRpdmUodCwgXCJzdHJpbmdcIik7IHJldHVybiBcInN5bWJvbFwiID09IHR5cGVvZiBpID8gaSA6IGkgKyBcIlwiOyB9XG5mdW5jdGlvbiBfdG9QcmltaXRpdmUodCwgcikgeyBpZiAoXCJvYmplY3RcIiAhPSB0eXBlb2YgdCB8fCAhdCkgcmV0dXJuIHQ7IHZhciBlID0gdFtTeW1ib2wudG9QcmltaXRpdmVdOyBpZiAodm9pZCAwICE9PSBlKSB7IHZhciBpID0gZS5jYWxsKHQsIHIgfHwgXCJkZWZhdWx0XCIpOyBpZiAoXCJvYmplY3RcIiAhPSB0eXBlb2YgaSkgcmV0dXJuIGk7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJAQHRvUHJpbWl0aXZlIG11c3QgcmV0dXJuIGEgcHJpbWl0aXZlIHZhbHVlLlwiKTsgfSByZXR1cm4gKFwic3RyaW5nXCIgPT09IHIgPyBTdHJpbmcgOiBOdW1iZXIpKHQpOyB9XG5mdW5jdGlvbiBfZXh0ZW5kcygpIHsgcmV0dXJuIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiA/IE9iamVjdC5hc3NpZ24uYmluZCgpIDogZnVuY3Rpb24gKG4pIHsgZm9yICh2YXIgZSA9IDE7IGUgPCBhcmd1bWVudHMubGVuZ3RoOyBlKyspIHsgdmFyIHQgPSBhcmd1bWVudHNbZV07IGZvciAodmFyIHIgaW4gdCkgKHt9KS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHQsIHIpICYmIChuW3JdID0gdFtyXSk7IH0gcmV0dXJuIG47IH0sIF9leHRlbmRzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7IH1cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBtYXgtY2xhc3Nlcy1wZXItZmlsZVxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgUHVyZUNvbXBvbmVudCwgdXNlQ2FsbGJhY2ssIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgbGFzdCBmcm9tICdlcy10b29sa2l0L2NvbXBhdC9sYXN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IGludGVycG9sYXRlLCBpc051bGxpc2ggfSBmcm9tICcuLi91dGlsL0RhdGFVdGlscyc7XG5pbXBvcnQgeyBHbG9iYWwgfSBmcm9tICcuLi91dGlsL0dsb2JhbCc7XG5pbXBvcnQgeyBwb2xhclRvQ2FydGVzaWFuIH0gZnJvbSAnLi4vdXRpbC9Qb2xhclV0aWxzJztcbmltcG9ydCB7IGdldFRvb2x0aXBOYW1lUHJvcCwgZ2V0VmFsdWVCeURhdGFLZXkgfSBmcm9tICcuLi91dGlsL0NoYXJ0VXRpbHMnO1xuaW1wb3J0IHsgUG9seWdvbiB9IGZyb20gJy4uL3NoYXBlL1BvbHlnb24nO1xuaW1wb3J0IHsgRG90IH0gZnJvbSAnLi4vc2hhcGUvRG90JztcbmltcG9ydCB7IExheWVyIH0gZnJvbSAnLi4vY29udGFpbmVyL0xheWVyJztcbmltcG9ydCB7IExhYmVsTGlzdEZyb21MYWJlbFByb3AsIENhcnRlc2lhbkxhYmVsTGlzdENvbnRleHRQcm92aWRlciB9IGZyb20gJy4uL2NvbXBvbmVudC9MYWJlbExpc3QnO1xuaW1wb3J0IHsgQWN0aXZlUG9pbnRzIH0gZnJvbSAnLi4vY29tcG9uZW50L0FjdGl2ZVBvaW50cyc7XG5pbXBvcnQgeyBTZXRUb29sdGlwRW50cnlTZXR0aW5ncyB9IGZyb20gJy4uL3N0YXRlL1NldFRvb2x0aXBFbnRyeVNldHRpbmdzJztcbmltcG9ydCB7IHNlbGVjdFJhZGFyUG9pbnRzIH0gZnJvbSAnLi4vc3RhdGUvc2VsZWN0b3JzL3JhZGFyU2VsZWN0b3JzJztcbmltcG9ydCB7IHVzZUFwcFNlbGVjdG9yIH0gZnJvbSAnLi4vc3RhdGUvaG9va3MnO1xuaW1wb3J0IHsgdXNlSXNQYW5vcmFtYSB9IGZyb20gJy4uL2NvbnRleHQvUGFub3JhbWFDb250ZXh0JztcbmltcG9ydCB7IFNldFBvbGFyTGVnZW5kUGF5bG9hZCB9IGZyb20gJy4uL3N0YXRlL1NldExlZ2VuZFBheWxvYWQnO1xuaW1wb3J0IHsgdXNlQW5pbWF0aW9uSWQgfSBmcm9tICcuLi91dGlsL3VzZUFuaW1hdGlvbklkJztcbmltcG9ydCB7IFJlZ2lzdGVyR3JhcGhpY2FsSXRlbUlkIH0gZnJvbSAnLi4vY29udGV4dC9SZWdpc3RlckdyYXBoaWNhbEl0ZW1JZCc7XG5pbXBvcnQgeyBTZXRQb2xhckdyYXBoaWNhbEl0ZW0gfSBmcm9tICcuLi9zdGF0ZS9TZXRHcmFwaGljYWxJdGVtJztcbmltcG9ydCB7IHN2Z1Byb3BlcnRpZXNOb0V2ZW50cyB9IGZyb20gJy4uL3V0aWwvc3ZnUHJvcGVydGllc05vRXZlbnRzJztcbmltcG9ydCB7IEphdmFzY3JpcHRBbmltYXRlIH0gZnJvbSAnLi4vYW5pbWF0aW9uL0phdmFzY3JpcHRBbmltYXRlJztcbmltcG9ydCB7IHN2Z1Byb3BlcnRpZXNBbmRFdmVudHMsIHN2Z1Byb3BlcnRpZXNBbmRFdmVudHNGcm9tVW5rbm93biB9IGZyb20gJy4uL3V0aWwvc3ZnUHJvcGVydGllc0FuZEV2ZW50cyc7XG5mdW5jdGlvbiBnZXRMZWdlbmRJdGVtQ29sb3Ioc3Ryb2tlLCBmaWxsKSB7XG4gIHJldHVybiBzdHJva2UgJiYgc3Ryb2tlICE9PSAnbm9uZScgPyBzdHJva2UgOiBmaWxsO1xufVxudmFyIGNvbXB1dGVMZWdlbmRQYXlsb2FkRnJvbVJhZGFyU2VjdG9ycyA9IHByb3BzID0+IHtcbiAgdmFyIHtcbiAgICBkYXRhS2V5LFxuICAgIG5hbWUsXG4gICAgc3Ryb2tlLFxuICAgIGZpbGwsXG4gICAgbGVnZW5kVHlwZSxcbiAgICBoaWRlXG4gIH0gPSBwcm9wcztcbiAgcmV0dXJuIFt7XG4gICAgaW5hY3RpdmU6IGhpZGUsXG4gICAgZGF0YUtleSxcbiAgICB0eXBlOiBsZWdlbmRUeXBlLFxuICAgIGNvbG9yOiBnZXRMZWdlbmRJdGVtQ29sb3Ioc3Ryb2tlLCBmaWxsKSxcbiAgICB2YWx1ZTogZ2V0VG9vbHRpcE5hbWVQcm9wKG5hbWUsIGRhdGFLZXkpLFxuICAgIHBheWxvYWQ6IHByb3BzXG4gIH1dO1xufTtcbmZ1bmN0aW9uIGdldFRvb2x0aXBFbnRyeVNldHRpbmdzKHByb3BzKSB7XG4gIHZhciB7XG4gICAgZGF0YUtleSxcbiAgICBzdHJva2UsXG4gICAgc3Ryb2tlV2lkdGgsXG4gICAgZmlsbCxcbiAgICBuYW1lLFxuICAgIGhpZGUsXG4gICAgdG9vbHRpcFR5cGVcbiAgfSA9IHByb3BzO1xuICByZXR1cm4ge1xuICAgIC8qXG4gICAgICogSSBzdXBwb3NlIHRoaXMgaGVyZSBfY291bGRfIHJldHVybiBwcm9wcy5wb2ludHNcbiAgICAgKiBiZWNhdXNlIHdoaWxlIFJhZGFyIGRvZXMgbm90IHN1cHBvcnQgaXRlbSB0b29sdGlwIG1vZGUsIGl0IF9jb3VsZF8gc3VwcG9ydCBpdC5cbiAgICAgKiBCdXQgd2hlbiBJIGFjdHVhbGx5IGRvIHJldHVybiB0aGUgcG9pbnRzIGhlcmUsIGEgZGVmYXVsdEluZGV4IHRlc3Qgc3RhcnRzIGZhaWxpbmcuXG4gICAgICogU28sIHVuZGVmaW5lZCBpdCBpcy5cbiAgICAgKi9cbiAgICBkYXRhRGVmaW5lZE9uSXRlbTogdW5kZWZpbmVkLFxuICAgIHBvc2l0aW9uczogdW5kZWZpbmVkLFxuICAgIHNldHRpbmdzOiB7XG4gICAgICBzdHJva2UsXG4gICAgICBzdHJva2VXaWR0aCxcbiAgICAgIGZpbGwsXG4gICAgICBuYW1lS2V5OiB1bmRlZmluZWQsXG4gICAgICAvLyBSYWRhckNoYXJ0IGRvZXMgbm90IGhhdmUgbmFtZUtleSB1bmZvcnR1bmF0ZWx5XG4gICAgICBkYXRhS2V5LFxuICAgICAgbmFtZTogZ2V0VG9vbHRpcE5hbWVQcm9wKG5hbWUsIGRhdGFLZXkpLFxuICAgICAgaGlkZSxcbiAgICAgIHR5cGU6IHRvb2x0aXBUeXBlLFxuICAgICAgY29sb3I6IGdldExlZ2VuZEl0ZW1Db2xvcihzdHJva2UsIGZpbGwpLFxuICAgICAgdW5pdDogJycgLy8gd2h5IGRvZXNuJ3QgUmFkYXIgc3VwcG9ydCB1bml0P1xuICAgIH1cbiAgfTtcbn1cbmZ1bmN0aW9uIHJlbmRlckRvdEl0ZW0ob3B0aW9uLCBwcm9wcykge1xuICB2YXIgZG90SXRlbTtcbiAgaWYgKC8qI19fUFVSRV9fKi9SZWFjdC5pc1ZhbGlkRWxlbWVudChvcHRpb24pKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0eXBlc2NyaXB0IGlzIHVuaGFwcHkgd2l0aCBjbG9uZWQgcHJvcHMgdHlwZVxuICAgIGRvdEl0ZW0gPSAvKiNfX1BVUkVfXyovUmVhY3QuY2xvbmVFbGVtZW50KG9wdGlvbiwgcHJvcHMpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICBkb3RJdGVtID0gb3B0aW9uKHByb3BzKTtcbiAgfSBlbHNlIHtcbiAgICBkb3RJdGVtID0gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoRG90LCBfZXh0ZW5kcyh7fSwgcHJvcHMsIHtcbiAgICAgIGNsYXNzTmFtZTogY2xzeCgncmVjaGFydHMtcmFkYXItZG90JywgdHlwZW9mIG9wdGlvbiAhPT0gJ2Jvb2xlYW4nID8gb3B0aW9uLmNsYXNzTmFtZSA6ICcnKVxuICAgIH0pKTtcbiAgfVxuICByZXR1cm4gZG90SXRlbTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlUmFkYXJQb2ludHMoX3JlZikge1xuICB2YXIge1xuICAgIHJhZGl1c0F4aXMsXG4gICAgYW5nbGVBeGlzLFxuICAgIGRpc3BsYXllZERhdGEsXG4gICAgZGF0YUtleSxcbiAgICBiYW5kU2l6ZVxuICB9ID0gX3JlZjtcbiAgdmFyIHtcbiAgICBjeCxcbiAgICBjeVxuICB9ID0gYW5nbGVBeGlzO1xuICB2YXIgaXNSYW5nZSA9IGZhbHNlO1xuICB2YXIgcG9pbnRzID0gW107XG4gIHZhciBhbmdsZUJhbmRTaXplID0gYW5nbGVBeGlzLnR5cGUgIT09ICdudW1iZXInID8gYmFuZFNpemUgIT09IG51bGwgJiYgYmFuZFNpemUgIT09IHZvaWQgMCA/IGJhbmRTaXplIDogMCA6IDA7XG4gIGRpc3BsYXllZERhdGEuZm9yRWFjaCgoZW50cnksIGkpID0+IHtcbiAgICB2YXIgbmFtZSA9IGdldFZhbHVlQnlEYXRhS2V5KGVudHJ5LCBhbmdsZUF4aXMuZGF0YUtleSwgaSk7XG4gICAgdmFyIHZhbHVlID0gZ2V0VmFsdWVCeURhdGFLZXkoZW50cnksIGRhdGFLZXkpO1xuICAgIHZhciBhbmdsZSA9IGFuZ2xlQXhpcy5zY2FsZShuYW1lKSArIGFuZ2xlQmFuZFNpemU7XG4gICAgdmFyIHBvaW50VmFsdWUgPSBBcnJheS5pc0FycmF5KHZhbHVlKSA/IGxhc3QodmFsdWUpIDogdmFsdWU7XG4gICAgdmFyIHJhZGl1cyA9IGlzTnVsbGlzaChwb2ludFZhbHVlKSA/IHVuZGVmaW5lZCA6IHJhZGl1c0F4aXMuc2NhbGUocG9pbnRWYWx1ZSk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA+PSAyKSB7XG4gICAgICBpc1JhbmdlID0gdHJ1ZTtcbiAgICB9XG4gICAgcG9pbnRzLnB1c2goX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBwb2xhclRvQ2FydGVzaWFuKGN4LCBjeSwgcmFkaXVzLCBhbmdsZSkpLCB7fSwge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBnZXRWYWx1ZUJ5RGF0YUtleSBkb2VzIG5vdCB2YWxpZGF0ZSB0aGUgb3V0cHV0IHR5cGVcbiAgICAgIG5hbWUsXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGdldFZhbHVlQnlEYXRhS2V5IGRvZXMgbm90IHZhbGlkYXRlIHRoZSBvdXRwdXQgdHlwZVxuICAgICAgdmFsdWUsXG4gICAgICBjeCxcbiAgICAgIGN5LFxuICAgICAgcmFkaXVzLFxuICAgICAgYW5nbGUsXG4gICAgICBwYXlsb2FkOiBlbnRyeVxuICAgIH0pKTtcbiAgfSk7XG4gIHZhciBiYXNlTGluZVBvaW50cyA9IFtdO1xuICBpZiAoaXNSYW5nZSkge1xuICAgIHBvaW50cy5mb3JFYWNoKHBvaW50ID0+IHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHBvaW50LnZhbHVlKSkge1xuICAgICAgICB2YXIgYmFzZVZhbHVlID0gcG9pbnQudmFsdWVbMF07XG4gICAgICAgIHZhciByYWRpdXMgPSBpc051bGxpc2goYmFzZVZhbHVlKSA/IHVuZGVmaW5lZCA6IHJhZGl1c0F4aXMuc2NhbGUoYmFzZVZhbHVlKTtcbiAgICAgICAgYmFzZUxpbmVQb2ludHMucHVzaChfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIHBvaW50KSwge30sIHtcbiAgICAgICAgICByYWRpdXNcbiAgICAgICAgfSwgcG9sYXJUb0NhcnRlc2lhbihjeCwgY3ksIHJhZGl1cywgcG9pbnQuYW5nbGUpKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBiYXNlTGluZVBvaW50cy5wdXNoKHBvaW50KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICByZXR1cm4ge1xuICAgIHBvaW50cyxcbiAgICBpc1JhbmdlLFxuICAgIGJhc2VMaW5lUG9pbnRzXG4gIH07XG59XG5mdW5jdGlvbiBEb3RzKF9yZWYyKSB7XG4gIHZhciB7XG4gICAgcG9pbnRzLFxuICAgIHByb3BzXG4gIH0gPSBfcmVmMjtcbiAgdmFyIHtcbiAgICBkb3QsXG4gICAgZGF0YUtleVxuICB9ID0gcHJvcHM7XG4gIGlmICghZG90KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIHtcbiAgICAgIGlkXG4gICAgfSA9IHByb3BzLFxuICAgIHByb3BzV2l0aG91dElkID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKHByb3BzLCBfZXhjbHVkZWQpO1xuICB2YXIgYmFzZVByb3BzID0gc3ZnUHJvcGVydGllc05vRXZlbnRzKHByb3BzV2l0aG91dElkKTtcbiAgdmFyIGN1c3RvbURvdFByb3BzID0gc3ZnUHJvcGVydGllc0FuZEV2ZW50c0Zyb21Vbmtub3duKGRvdCk7XG4gIHZhciBkb3RzID0gcG9pbnRzLm1hcCgoZW50cnksIGkpID0+IHtcbiAgICB2YXIgZG90UHJvcHMgPSBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7XG4gICAgICBrZXk6IFwiZG90LVwiLmNvbmNhdChpKSxcbiAgICAgIHI6IDNcbiAgICB9LCBiYXNlUHJvcHMpLCBjdXN0b21Eb3RQcm9wcyksIHt9LCB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHdlJ3JlIHBhc3NpbmcgaW4gYSBkYXRhS2V5IHRoYXQgRG90IGRpZCBub3QgYXNrIGZvclxuICAgICAgZGF0YUtleSxcbiAgICAgIGN4OiBlbnRyeS54LFxuICAgICAgY3k6IGVudHJ5LnksXG4gICAgICBpbmRleDogaSxcbiAgICAgIHBheWxvYWQ6IGVudHJ5XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlbmRlckRvdEl0ZW0oZG90LCBkb3RQcm9wcyk7XG4gIH0pO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGF5ZXIsIHtcbiAgICBjbGFzc05hbWU6IFwicmVjaGFydHMtcmFkYXItZG90c1wiXG4gIH0sIGRvdHMpO1xufVxuZnVuY3Rpb24gUmFkYXJMYWJlbExpc3RQcm92aWRlcihfcmVmMykge1xuICB2YXIge1xuICAgIHNob3dMYWJlbHMsXG4gICAgcG9pbnRzLFxuICAgIGNoaWxkcmVuXG4gIH0gPSBfcmVmMztcbiAgLypcbiAgICogUmFkYXIgcHJvdmlkZXMgYSBDYXJ0ZXNpYW4gbGFiZWwgbGlzdCBjb250ZXh0LiBEbyB3ZSB3YW50IHRvIGFsc28gcHJvdmlkZSBhIHBvbGFyIGxhYmVsIGxpc3QgY29udGV4dD9cbiAgICogVGhhdCB3YXksIHVzZXJzIGNhbiBjaG9vc2UgdG8gdXNlIHBvbGFyIHBvc2l0aW9ucyBmb3IgdGhlIFJhZGFyIGxhYmVscy5cbiAgICovXG4gIC8vIGNvbnN0IGxhYmVsTGlzdEVudHJpZXM6IFJlYWRvbmx5QXJyYXk8UG9sYXJMYWJlbExpc3RFbnRyeT4gPSBwb2ludHMubWFwKFxuICAvLyAgIChwb2ludCk6IFBvbGFyTGFiZWxMaXN0RW50cnkgPT4gKHtcbiAgLy8gICAgIHZhbHVlOiBwb2ludC52YWx1ZSxcbiAgLy8gICAgIHBheWxvYWQ6IHBvaW50LnBheWxvYWQsXG4gIC8vICAgICBwYXJlbnRWaWV3Qm94OiB1bmRlZmluZWQsXG4gIC8vICAgICBjbG9ja1dpc2U6IGZhbHNlLFxuICAvLyAgICAgdmlld0JveDoge1xuICAvLyAgICAgICBjeDogcG9pbnQuY3gsXG4gIC8vICAgICAgIGN5OiBwb2ludC5jeSxcbiAgLy8gICAgICAgaW5uZXJSYWRpdXM6IHBvaW50LnJhZGl1cyxcbiAgLy8gICAgICAgb3V0ZXJSYWRpdXM6IHBvaW50LnJhZGl1cyxcbiAgLy8gICAgICAgc3RhcnRBbmdsZTogcG9pbnQuYW5nbGUsXG4gIC8vICAgICAgIGVuZEFuZ2xlOiBwb2ludC5hbmdsZSxcbiAgLy8gICAgICAgY2xvY2tXaXNlOiBmYWxzZSxcbiAgLy8gICAgIH0sXG4gIC8vICAgfSksXG4gIC8vICk7XG5cbiAgdmFyIGxhYmVsTGlzdEVudHJpZXMgPSBwb2ludHMubWFwKHBvaW50ID0+IHtcbiAgICB2YXIgdmlld0JveCA9IHtcbiAgICAgIHg6IHBvaW50LngsXG4gICAgICB5OiBwb2ludC55LFxuICAgICAgd2lkdGg6IDAsXG4gICAgICBoZWlnaHQ6IDBcbiAgICB9O1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIHZpZXdCb3gpLCB7fSwge1xuICAgICAgdmFsdWU6IHBvaW50LnZhbHVlLFxuICAgICAgcGF5bG9hZDogcG9pbnQucGF5bG9hZCxcbiAgICAgIHBhcmVudFZpZXdCb3g6IHVuZGVmaW5lZCxcbiAgICAgIHZpZXdCb3gsXG4gICAgICBmaWxsOiB1bmRlZmluZWRcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChDYXJ0ZXNpYW5MYWJlbExpc3RDb250ZXh0UHJvdmlkZXIsIHtcbiAgICB2YWx1ZTogc2hvd0xhYmVscyA/IGxhYmVsTGlzdEVudHJpZXMgOiBudWxsXG4gIH0sIGNoaWxkcmVuKTtcbn1cbmZ1bmN0aW9uIFN0YXRpY1BvbHlnb24oX3JlZjQpIHtcbiAgdmFyIHtcbiAgICBwb2ludHMsXG4gICAgYmFzZUxpbmVQb2ludHMsXG4gICAgcHJvcHNcbiAgfSA9IF9yZWY0O1xuICBpZiAocG9pbnRzID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIge1xuICAgIHNoYXBlLFxuICAgIGlzUmFuZ2UsXG4gICAgY29ubmVjdE51bGxzXG4gIH0gPSBwcm9wcztcbiAgdmFyIGhhbmRsZU1vdXNlRW50ZXIgPSBlID0+IHtcbiAgICB2YXIge1xuICAgICAgb25Nb3VzZUVudGVyXG4gICAgfSA9IHByb3BzO1xuICAgIGlmIChvbk1vdXNlRW50ZXIpIHtcbiAgICAgIG9uTW91c2VFbnRlcihwcm9wcywgZSk7XG4gICAgfVxuICB9O1xuICB2YXIgaGFuZGxlTW91c2VMZWF2ZSA9IGUgPT4ge1xuICAgIHZhciB7XG4gICAgICBvbk1vdXNlTGVhdmVcbiAgICB9ID0gcHJvcHM7XG4gICAgaWYgKG9uTW91c2VMZWF2ZSkge1xuICAgICAgb25Nb3VzZUxlYXZlKHByb3BzLCBlKTtcbiAgICB9XG4gIH07XG4gIHZhciByYWRhcjtcbiAgaWYgKC8qI19fUFVSRV9fKi9SZWFjdC5pc1ZhbGlkRWxlbWVudChzaGFwZSkpIHtcbiAgICByYWRhciA9IC8qI19fUFVSRV9fKi9SZWFjdC5jbG9uZUVsZW1lbnQoc2hhcGUsIF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgcHJvcHMpLCB7fSwge1xuICAgICAgcG9pbnRzXG4gICAgfSkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBzaGFwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJhZGFyID0gc2hhcGUoX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBwcm9wcyksIHt9LCB7XG4gICAgICBwb2ludHNcbiAgICB9KSk7XG4gIH0gZWxzZSB7XG4gICAgcmFkYXIgPSAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChQb2x5Z29uLCBfZXh0ZW5kcyh7fSwgc3ZnUHJvcGVydGllc0FuZEV2ZW50cyhwcm9wcyksIHtcbiAgICAgIG9uTW91c2VFbnRlcjogaGFuZGxlTW91c2VFbnRlcixcbiAgICAgIG9uTW91c2VMZWF2ZTogaGFuZGxlTW91c2VMZWF2ZSxcbiAgICAgIHBvaW50czogcG9pbnRzLFxuICAgICAgYmFzZUxpbmVQb2ludHM6IGlzUmFuZ2UgPyBiYXNlTGluZVBvaW50cyA6IHVuZGVmaW5lZCxcbiAgICAgIGNvbm5lY3ROdWxsczogY29ubmVjdE51bGxzXG4gICAgfSkpO1xuICB9XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwge1xuICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1yYWRhci1wb2x5Z29uXCJcbiAgfSwgcmFkYXIsIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KERvdHMsIHtcbiAgICBwcm9wczogcHJvcHMsXG4gICAgcG9pbnRzOiBwb2ludHNcbiAgfSkpO1xufVxudmFyIGludGVycG9sYXRlUG9sYXJQb2ludCA9IChwcmV2UG9pbnRzLCBwcmV2UG9pbnRzRGlmZkZhY3RvciwgdCkgPT4gKGVudHJ5LCBpbmRleCkgPT4ge1xuICB2YXIgcHJldiA9IHByZXZQb2ludHMgJiYgcHJldlBvaW50c1tNYXRoLmZsb29yKGluZGV4ICogcHJldlBvaW50c0RpZmZGYWN0b3IpXTtcbiAgaWYgKHByZXYpIHtcbiAgICByZXR1cm4gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBlbnRyeSksIHt9LCB7XG4gICAgICB4OiBpbnRlcnBvbGF0ZShwcmV2LngsIGVudHJ5LngsIHQpLFxuICAgICAgeTogaW50ZXJwb2xhdGUocHJldi55LCBlbnRyeS55LCB0KVxuICAgIH0pO1xuICB9XG4gIHJldHVybiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGVudHJ5KSwge30sIHtcbiAgICB4OiBpbnRlcnBvbGF0ZShlbnRyeS5jeCwgZW50cnkueCwgdCksXG4gICAgeTogaW50ZXJwb2xhdGUoZW50cnkuY3ksIGVudHJ5LnksIHQpXG4gIH0pO1xufTtcbmZ1bmN0aW9uIFBvbHlnb25XaXRoQW5pbWF0aW9uKF9yZWY1KSB7XG4gIHZhciB7XG4gICAgcHJvcHMsXG4gICAgcHJldmlvdXNQb2ludHNSZWYsXG4gICAgcHJldmlvdXNCYXNlTGluZVBvaW50c1JlZlxuICB9ID0gX3JlZjU7XG4gIHZhciB7XG4gICAgcG9pbnRzLFxuICAgIGJhc2VMaW5lUG9pbnRzLFxuICAgIGlzQW5pbWF0aW9uQWN0aXZlLFxuICAgIGFuaW1hdGlvbkJlZ2luLFxuICAgIGFuaW1hdGlvbkR1cmF0aW9uLFxuICAgIGFuaW1hdGlvbkVhc2luZyxcbiAgICBvbkFuaW1hdGlvbkVuZCxcbiAgICBvbkFuaW1hdGlvblN0YXJ0XG4gIH0gPSBwcm9wcztcbiAgdmFyIHByZXZQb2ludHMgPSBwcmV2aW91c1BvaW50c1JlZi5jdXJyZW50O1xuICB2YXIgcHJldkJhc2VMaW5lUG9pbnRzID0gcHJldmlvdXNCYXNlTGluZVBvaW50c1JlZi5jdXJyZW50O1xuICB2YXIgcHJldlBvaW50c0RpZmZGYWN0b3IgPSBwcmV2UG9pbnRzICYmIHByZXZQb2ludHMubGVuZ3RoIC8gcG9pbnRzLmxlbmd0aDtcbiAgdmFyIHByZXZCYXNlTGluZVBvaW50c0RpZmZGYWN0b3IgPSBwcmV2QmFzZUxpbmVQb2ludHMgJiYgcHJldkJhc2VMaW5lUG9pbnRzLmxlbmd0aCAvIGJhc2VMaW5lUG9pbnRzLmxlbmd0aDtcbiAgdmFyIGFuaW1hdGlvbklkID0gdXNlQW5pbWF0aW9uSWQocHJvcHMsICdyZWNoYXJ0cy1yYWRhci0nKTtcbiAgdmFyIFtpc0FuaW1hdGluZywgc2V0SXNBbmltYXRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICB2YXIgc2hvd0xhYmVscyA9ICFpc0FuaW1hdGluZztcbiAgdmFyIGhhbmRsZUFuaW1hdGlvbkVuZCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAodHlwZW9mIG9uQW5pbWF0aW9uRW5kID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBvbkFuaW1hdGlvbkVuZCgpO1xuICAgIH1cbiAgICBzZXRJc0FuaW1hdGluZyhmYWxzZSk7XG4gIH0sIFtvbkFuaW1hdGlvbkVuZF0pO1xuICB2YXIgaGFuZGxlQW5pbWF0aW9uU3RhcnQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBvbkFuaW1hdGlvblN0YXJ0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBvbkFuaW1hdGlvblN0YXJ0KCk7XG4gICAgfVxuICAgIHNldElzQW5pbWF0aW5nKHRydWUpO1xuICB9LCBbb25BbmltYXRpb25TdGFydF0pO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmFkYXJMYWJlbExpc3RQcm92aWRlciwge1xuICAgIHNob3dMYWJlbHM6IHNob3dMYWJlbHMsXG4gICAgcG9pbnRzOiBwb2ludHNcbiAgfSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoSmF2YXNjcmlwdEFuaW1hdGUsIHtcbiAgICBhbmltYXRpb25JZDogYW5pbWF0aW9uSWQsXG4gICAgYmVnaW46IGFuaW1hdGlvbkJlZ2luLFxuICAgIGR1cmF0aW9uOiBhbmltYXRpb25EdXJhdGlvbixcbiAgICBpc0FjdGl2ZTogaXNBbmltYXRpb25BY3RpdmUsXG4gICAgZWFzaW5nOiBhbmltYXRpb25FYXNpbmcsXG4gICAga2V5OiBcInJhZGFyLVwiLmNvbmNhdChhbmltYXRpb25JZCksXG4gICAgb25BbmltYXRpb25FbmQ6IGhhbmRsZUFuaW1hdGlvbkVuZCxcbiAgICBvbkFuaW1hdGlvblN0YXJ0OiBoYW5kbGVBbmltYXRpb25TdGFydFxuICB9LCB0ID0+IHtcbiAgICB2YXIgc3RlcERhdGEgPSB0ID09PSAxID8gcG9pbnRzIDogcG9pbnRzLm1hcChpbnRlcnBvbGF0ZVBvbGFyUG9pbnQocHJldlBvaW50cywgcHJldlBvaW50c0RpZmZGYWN0b3IsIHQpKTtcbiAgICB2YXIgc3RlcEJhc2VMaW5lUG9pbnRzID0gdCA9PT0gMSA/IGJhc2VMaW5lUG9pbnRzIDogYmFzZUxpbmVQb2ludHMgPT09IG51bGwgfHwgYmFzZUxpbmVQb2ludHMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGJhc2VMaW5lUG9pbnRzLm1hcChpbnRlcnBvbGF0ZVBvbGFyUG9pbnQocHJldkJhc2VMaW5lUG9pbnRzLCBwcmV2QmFzZUxpbmVQb2ludHNEaWZmRmFjdG9yLCB0KSk7XG4gICAgaWYgKHQgPiAwKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICAgIHByZXZpb3VzUG9pbnRzUmVmLmN1cnJlbnQgPSBzdGVwRGF0YTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgICAgcHJldmlvdXNCYXNlTGluZVBvaW50c1JlZi5jdXJyZW50ID0gc3RlcEJhc2VMaW5lUG9pbnRzO1xuICAgIH1cbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU3RhdGljUG9seWdvbiwge1xuICAgICAgcG9pbnRzOiBzdGVwRGF0YSxcbiAgICAgIGJhc2VMaW5lUG9pbnRzOiBzdGVwQmFzZUxpbmVQb2ludHMsXG4gICAgICBwcm9wczogcHJvcHNcbiAgICB9KTtcbiAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExhYmVsTGlzdEZyb21MYWJlbFByb3AsIHtcbiAgICBsYWJlbDogcHJvcHMubGFiZWxcbiAgfSksIHByb3BzLmNoaWxkcmVuKTtcbn1cbmZ1bmN0aW9uIFJlbmRlclBvbHlnb24ocHJvcHMpIHtcbiAgdmFyIHByZXZpb3VzUG9pbnRzUmVmID0gdXNlUmVmKHVuZGVmaW5lZCk7XG4gIHZhciBwcmV2aW91c0Jhc2VMaW5lUG9pbnRzUmVmID0gdXNlUmVmKHVuZGVmaW5lZCk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChQb2x5Z29uV2l0aEFuaW1hdGlvbiwge1xuICAgIHByb3BzOiBwcm9wcyxcbiAgICBwcmV2aW91c1BvaW50c1JlZjogcHJldmlvdXNQb2ludHNSZWYsXG4gICAgcHJldmlvdXNCYXNlTGluZVBvaW50c1JlZjogcHJldmlvdXNCYXNlTGluZVBvaW50c1JlZlxuICB9KTtcbn1cbnZhciBkZWZhdWx0UmFkYXJQcm9wcyA9IHtcbiAgYW5nbGVBeGlzSWQ6IDAsXG4gIHJhZGl1c0F4aXNJZDogMCxcbiAgaGlkZTogZmFsc2UsXG4gIGFjdGl2ZURvdDogdHJ1ZSxcbiAgZG90OiBmYWxzZSxcbiAgbGVnZW5kVHlwZTogJ3JlY3QnLFxuICBpc0FuaW1hdGlvbkFjdGl2ZTogIUdsb2JhbC5pc1NzcixcbiAgYW5pbWF0aW9uQmVnaW46IDAsXG4gIGFuaW1hdGlvbkR1cmF0aW9uOiAxNTAwLFxuICBhbmltYXRpb25FYXNpbmc6ICdlYXNlJ1xufTtcbmNsYXNzIFJhZGFyV2l0aFN0YXRlIGV4dGVuZHMgUHVyZUNvbXBvbmVudCB7XG4gIHJlbmRlcigpIHtcbiAgICB2YXIge1xuICAgICAgaGlkZSxcbiAgICAgIGNsYXNzTmFtZSxcbiAgICAgIHBvaW50c1xuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChoaWRlIHx8IHBvaW50cyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIGxheWVyQ2xhc3MgPSBjbHN4KCdyZWNoYXJ0cy1yYWRhcicsIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkZyYWdtZW50LCBudWxsLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwge1xuICAgICAgY2xhc3NOYW1lOiBsYXllckNsYXNzXG4gICAgfSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVuZGVyUG9seWdvbiwgdGhpcy5wcm9wcykpLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChBY3RpdmVQb2ludHMsIHtcbiAgICAgIHBvaW50czogcG9pbnRzLFxuICAgICAgbWFpbkNvbG9yOiBnZXRMZWdlbmRJdGVtQ29sb3IodGhpcy5wcm9wcy5zdHJva2UsIHRoaXMucHJvcHMuZmlsbCksXG4gICAgICBpdGVtRGF0YUtleTogdGhpcy5wcm9wcy5kYXRhS2V5LFxuICAgICAgYWN0aXZlRG90OiB0aGlzLnByb3BzLmFjdGl2ZURvdFxuICAgIH0pKTtcbiAgfVxufVxuZnVuY3Rpb24gUmFkYXJJbXBsKHByb3BzKSB7XG4gIHZhciBpc1Bhbm9yYW1hID0gdXNlSXNQYW5vcmFtYSgpO1xuICB2YXIgcmFkYXJQb2ludHMgPSB1c2VBcHBTZWxlY3RvcihzdGF0ZSA9PiBzZWxlY3RSYWRhclBvaW50cyhzdGF0ZSwgcHJvcHMucmFkaXVzQXhpc0lkLCBwcm9wcy5hbmdsZUF4aXNJZCwgaXNQYW5vcmFtYSwgcHJvcHMuaWQpKTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJhZGFyV2l0aFN0YXRlLCBfZXh0ZW5kcyh7fSwgcHJvcHMsIHtcbiAgICBwb2ludHM6IHJhZGFyUG9pbnRzID09PSBudWxsIHx8IHJhZGFyUG9pbnRzID09PSB2b2lkIDAgPyB2b2lkIDAgOiByYWRhclBvaW50cy5wb2ludHMsXG4gICAgYmFzZUxpbmVQb2ludHM6IHJhZGFyUG9pbnRzID09PSBudWxsIHx8IHJhZGFyUG9pbnRzID09PSB2b2lkIDAgPyB2b2lkIDAgOiByYWRhclBvaW50cy5iYXNlTGluZVBvaW50cyxcbiAgICBpc1JhbmdlOiByYWRhclBvaW50cyA9PT0gbnVsbCB8fCByYWRhclBvaW50cyA9PT0gdm9pZCAwID8gdm9pZCAwIDogcmFkYXJQb2ludHMuaXNSYW5nZVxuICB9KSk7XG59XG5leHBvcnQgY2xhc3MgUmFkYXIgZXh0ZW5kcyBQdXJlQ29tcG9uZW50IHtcbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWdpc3RlckdyYXBoaWNhbEl0ZW1JZCwge1xuICAgICAgaWQ6IHRoaXMucHJvcHMuaWQsXG4gICAgICB0eXBlOiBcInJhZGFyXCJcbiAgICB9LCBpZCA9PiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5GcmFnbWVudCwgbnVsbCwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2V0UG9sYXJHcmFwaGljYWxJdGVtLCB7XG4gICAgICB0eXBlOiBcInJhZGFyXCIsXG4gICAgICBpZDogaWQsXG4gICAgICBkYXRhOiB1bmRlZmluZWQgLy8gUmFkYXIgZG9lcyBub3QgaGF2ZSBkYXRhIHByb3AsIHdoeT9cbiAgICAgICxcbiAgICAgIGRhdGFLZXk6IHRoaXMucHJvcHMuZGF0YUtleSxcbiAgICAgIGhpZGU6IHRoaXMucHJvcHMuaGlkZSxcbiAgICAgIGFuZ2xlQXhpc0lkOiB0aGlzLnByb3BzLmFuZ2xlQXhpc0lkLFxuICAgICAgcmFkaXVzQXhpc0lkOiB0aGlzLnByb3BzLnJhZGl1c0F4aXNJZFxuICAgIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTZXRQb2xhckxlZ2VuZFBheWxvYWQsIHtcbiAgICAgIGxlZ2VuZFBheWxvYWQ6IGNvbXB1dGVMZWdlbmRQYXlsb2FkRnJvbVJhZGFyU2VjdG9ycyh0aGlzLnByb3BzKVxuICAgIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTZXRUb29sdGlwRW50cnlTZXR0aW5ncywge1xuICAgICAgZm46IGdldFRvb2x0aXBFbnRyeVNldHRpbmdzLFxuICAgICAgYXJnczogdGhpcy5wcm9wc1xuICAgIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSYWRhckltcGwsIF9leHRlbmRzKHt9LCB0aGlzLnByb3BzLCB7XG4gICAgICBpZDogaWRcbiAgICB9KSkpKTtcbiAgfVxufVxuX2RlZmluZVByb3BlcnR5KFJhZGFyLCBcImRpc3BsYXlOYW1lXCIsICdSYWRhcicpO1xuX2RlZmluZVByb3BlcnR5KFJhZGFyLCBcImRlZmF1bHRQcm9wc1wiLCBkZWZhdWx0UmFkYXJQcm9wcyk7IiwidmFyIF9leGNsdWRlZCA9IFtcInNoYXBlXCIsIFwiYWN0aXZlU2hhcGVcIiwgXCJjb3JuZXJSYWRpdXNcIiwgXCJpZFwiXSxcbiAgX2V4Y2x1ZGVkMiA9IFtcIm9uTW91c2VFbnRlclwiLCBcIm9uQ2xpY2tcIiwgXCJvbk1vdXNlTGVhdmVcIl0sXG4gIF9leGNsdWRlZDMgPSBbXCJ2YWx1ZVwiLCBcImJhY2tncm91bmRcIl07XG5mdW5jdGlvbiBfZXh0ZW5kcygpIHsgcmV0dXJuIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiA/IE9iamVjdC5hc3NpZ24uYmluZCgpIDogZnVuY3Rpb24gKG4pIHsgZm9yICh2YXIgZSA9IDE7IGUgPCBhcmd1bWVudHMubGVuZ3RoOyBlKyspIHsgdmFyIHQgPSBhcmd1bWVudHNbZV07IGZvciAodmFyIHIgaW4gdCkgKHt9KS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHQsIHIpICYmIChuW3JdID0gdFtyXSk7IH0gcmV0dXJuIG47IH0sIF9leHRlbmRzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7IH1cbmZ1bmN0aW9uIG93bktleXMoZSwgcikgeyB2YXIgdCA9IE9iamVjdC5rZXlzKGUpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IHIgJiYgKG8gPSBvLmZpbHRlcihmdW5jdGlvbiAocikgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihlLCByKS5lbnVtZXJhYmxlOyB9KSksIHQucHVzaC5hcHBseSh0LCBvKTsgfSByZXR1cm4gdDsgfVxuZnVuY3Rpb24gX29iamVjdFNwcmVhZChlKSB7IGZvciAodmFyIHIgPSAxOyByIDwgYXJndW1lbnRzLmxlbmd0aDsgcisrKSB7IHZhciB0ID0gbnVsbCAhPSBhcmd1bWVudHNbcl0gPyBhcmd1bWVudHNbcl0gOiB7fTsgciAlIDIgPyBvd25LZXlzKE9iamVjdCh0KSwgITApLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgX2RlZmluZVByb3BlcnR5KGUsIHIsIHRbcl0pOyB9KSA6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModCkpIDogb3duS2V5cyhPYmplY3QodCkpLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodCwgcikpOyB9KTsgfSByZXR1cm4gZTsgfVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KGUsIHIsIHQpIHsgcmV0dXJuIChyID0gX3RvUHJvcGVydHlLZXkocikpIGluIGUgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgeyB2YWx1ZTogdCwgZW51bWVyYWJsZTogITAsIGNvbmZpZ3VyYWJsZTogITAsIHdyaXRhYmxlOiAhMCB9KSA6IGVbcl0gPSB0LCBlOyB9XG5mdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleSh0KSB7IHZhciBpID0gX3RvUHJpbWl0aXZlKHQsIFwic3RyaW5nXCIpOyByZXR1cm4gXCJzeW1ib2xcIiA9PSB0eXBlb2YgaSA/IGkgOiBpICsgXCJcIjsgfVxuZnVuY3Rpb24gX3RvUHJpbWl0aXZlKHQsIHIpIHsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIHQgfHwgIXQpIHJldHVybiB0OyB2YXIgZSA9IHRbU3ltYm9sLnRvUHJpbWl0aXZlXTsgaWYgKHZvaWQgMCAhPT0gZSkgeyB2YXIgaSA9IGUuY2FsbCh0LCByIHx8IFwiZGVmYXVsdFwiKTsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIGkpIHJldHVybiBpOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7IH0gcmV0dXJuIChcInN0cmluZ1wiID09PSByID8gU3RyaW5nIDogTnVtYmVyKSh0KTsgfVxuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKGUsIHQpIHsgaWYgKG51bGwgPT0gZSkgcmV0dXJuIHt9OyB2YXIgbywgciwgaSA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKGUsIHQpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IGZvciAociA9IDA7IHIgPCBuLmxlbmd0aDsgcisrKSBvID0gbltyXSwgLTEgPT09IHQuaW5kZXhPZihvKSAmJiB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKGUsIG8pICYmIChpW29dID0gZVtvXSk7IH0gcmV0dXJuIGk7IH1cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKHIsIGUpIHsgaWYgKG51bGwgPT0gcikgcmV0dXJuIHt9OyB2YXIgdCA9IHt9OyBmb3IgKHZhciBuIGluIHIpIGlmICh7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHIsIG4pKSB7IGlmICgtMSAhPT0gZS5pbmRleE9mKG4pKSBjb250aW51ZTsgdFtuXSA9IHJbbl07IH0gcmV0dXJuIHQ7IH1cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBtYXgtY2xhc3Nlcy1wZXItZmlsZVxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgUHVyZUNvbXBvbmVudCwgdXNlQ2FsbGJhY2ssIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBwYXJzZUNvcm5lclJhZGl1cywgUmFkaWFsQmFyU2VjdG9yIH0gZnJvbSAnLi4vdXRpbC9SYWRpYWxCYXJVdGlscyc7XG5pbXBvcnQgeyBMYXllciB9IGZyb20gJy4uL2NvbnRhaW5lci9MYXllcic7XG5pbXBvcnQgeyBmaW5kQWxsQnlUeXBlIH0gZnJvbSAnLi4vdXRpbC9SZWFjdFV0aWxzJztcbmltcG9ydCB7IEdsb2JhbCB9IGZyb20gJy4uL3V0aWwvR2xvYmFsJztcbmltcG9ydCB7IExhYmVsTGlzdEZyb21MYWJlbFByb3AsIFBvbGFyTGFiZWxMaXN0Q29udGV4dFByb3ZpZGVyIH0gZnJvbSAnLi4vY29tcG9uZW50L0xhYmVsTGlzdCc7XG5pbXBvcnQgeyBDZWxsIH0gZnJvbSAnLi4vY29tcG9uZW50L0NlbGwnO1xuaW1wb3J0IHsgbWF0aFNpZ24sIGludGVycG9sYXRlTnVtYmVyIH0gZnJvbSAnLi4vdXRpbC9EYXRhVXRpbHMnO1xuaW1wb3J0IHsgZ2V0Q2F0ZUNvb3JkaW5hdGVPZkJhciwgZ2V0VmFsdWVCeURhdGFLZXksIHRydW5jYXRlQnlEb21haW4sIGdldFRvb2x0aXBOYW1lUHJvcCwgZ2V0Tm9ybWFsaXplZFN0YWNrSWQgfSBmcm9tICcuLi91dGlsL0NoYXJ0VXRpbHMnO1xuaW1wb3J0IHsgYWRhcHRFdmVudHNPZkNoaWxkIH0gZnJvbSAnLi4vdXRpbC90eXBlcyc7XG5pbXBvcnQgeyB1c2VNb3VzZUNsaWNrSXRlbURpc3BhdGNoLCB1c2VNb3VzZUVudGVySXRlbURpc3BhdGNoLCB1c2VNb3VzZUxlYXZlSXRlbURpc3BhdGNoIH0gZnJvbSAnLi4vY29udGV4dC90b29sdGlwQ29udGV4dCc7XG5pbXBvcnQgeyBTZXRUb29sdGlwRW50cnlTZXR0aW5ncyB9IGZyb20gJy4uL3N0YXRlL1NldFRvb2x0aXBFbnRyeVNldHRpbmdzJztcbmltcG9ydCB7IHNlbGVjdFJhZGlhbEJhckxlZ2VuZFBheWxvYWQsIHNlbGVjdFJhZGlhbEJhclNlY3RvcnMgfSBmcm9tICcuLi9zdGF0ZS9zZWxlY3RvcnMvcmFkaWFsQmFyU2VsZWN0b3JzJztcbmltcG9ydCB7IHVzZUFwcFNlbGVjdG9yIH0gZnJvbSAnLi4vc3RhdGUvaG9va3MnO1xuaW1wb3J0IHsgc2VsZWN0QWN0aXZlVG9vbHRpcEluZGV4IH0gZnJvbSAnLi4vc3RhdGUvc2VsZWN0b3JzL3Rvb2x0aXBTZWxlY3RvcnMnO1xuaW1wb3J0IHsgU2V0UG9sYXJMZWdlbmRQYXlsb2FkIH0gZnJvbSAnLi4vc3RhdGUvU2V0TGVnZW5kUGF5bG9hZCc7XG5pbXBvcnQgeyB1c2VBbmltYXRpb25JZCB9IGZyb20gJy4uL3V0aWwvdXNlQW5pbWF0aW9uSWQnO1xuaW1wb3J0IHsgUmVnaXN0ZXJHcmFwaGljYWxJdGVtSWQgfSBmcm9tICcuLi9jb250ZXh0L1JlZ2lzdGVyR3JhcGhpY2FsSXRlbUlkJztcbmltcG9ydCB7IFNldFBvbGFyR3JhcGhpY2FsSXRlbSB9IGZyb20gJy4uL3N0YXRlL1NldEdyYXBoaWNhbEl0ZW0nO1xuaW1wb3J0IHsgc3ZnUHJvcGVydGllc05vRXZlbnRzLCBzdmdQcm9wZXJ0aWVzTm9FdmVudHNGcm9tVW5rbm93biB9IGZyb20gJy4uL3V0aWwvc3ZnUHJvcGVydGllc05vRXZlbnRzJztcbmltcG9ydCB7IEphdmFzY3JpcHRBbmltYXRlIH0gZnJvbSAnLi4vYW5pbWF0aW9uL0phdmFzY3JpcHRBbmltYXRlJztcbnZhciBTVEFCTEVfRU1QVFlfQVJSQVkgPSBbXTtcbmZ1bmN0aW9uIFJhZGlhbEJhckxhYmVsTGlzdFByb3ZpZGVyKF9yZWYpIHtcbiAgdmFyIHtcbiAgICBzaG93TGFiZWxzLFxuICAgIHNlY3RvcnMsXG4gICAgY2hpbGRyZW5cbiAgfSA9IF9yZWY7XG4gIHZhciBsYWJlbExpc3RFbnRyaWVzID0gc2VjdG9ycy5tYXAoc2VjdG9yID0+ICh7XG4gICAgdmFsdWU6IHNlY3Rvci52YWx1ZSxcbiAgICBwYXlsb2FkOiBzZWN0b3IucGF5bG9hZCxcbiAgICBwYXJlbnRWaWV3Qm94OiB1bmRlZmluZWQsXG4gICAgY2xvY2tXaXNlOiBmYWxzZSxcbiAgICB2aWV3Qm94OiB7XG4gICAgICBjeDogc2VjdG9yLmN4LFxuICAgICAgY3k6IHNlY3Rvci5jeSxcbiAgICAgIGlubmVyUmFkaXVzOiBzZWN0b3IuaW5uZXJSYWRpdXMsXG4gICAgICBvdXRlclJhZGl1czogc2VjdG9yLm91dGVyUmFkaXVzLFxuICAgICAgc3RhcnRBbmdsZTogc2VjdG9yLnN0YXJ0QW5nbGUsXG4gICAgICBlbmRBbmdsZTogc2VjdG9yLmVuZEFuZ2xlLFxuICAgICAgY2xvY2tXaXNlOiBmYWxzZVxuICAgIH0sXG4gICAgZmlsbDogc2VjdG9yLmZpbGxcbiAgfSkpO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUG9sYXJMYWJlbExpc3RDb250ZXh0UHJvdmlkZXIsIHtcbiAgICB2YWx1ZTogc2hvd0xhYmVscyA/IGxhYmVsTGlzdEVudHJpZXMgOiBudWxsXG4gIH0sIGNoaWxkcmVuKTtcbn1cbmZ1bmN0aW9uIFJhZGlhbEJhclNlY3RvcnMoX3JlZjIpIHtcbiAgdmFyIHtcbiAgICBzZWN0b3JzLFxuICAgIGFsbE90aGVyUmFkaWFsQmFyUHJvcHMsXG4gICAgc2hvd0xhYmVsc1xuICB9ID0gX3JlZjI7XG4gIHZhciB7XG4gICAgICBzaGFwZSxcbiAgICAgIGFjdGl2ZVNoYXBlLFxuICAgICAgY29ybmVyUmFkaXVzLFxuICAgICAgaWRcbiAgICB9ID0gYWxsT3RoZXJSYWRpYWxCYXJQcm9wcyxcbiAgICBvdGhlcnMgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoYWxsT3RoZXJSYWRpYWxCYXJQcm9wcywgX2V4Y2x1ZGVkKTtcbiAgdmFyIGJhc2VQcm9wcyA9IHN2Z1Byb3BlcnRpZXNOb0V2ZW50cyhvdGhlcnMpO1xuICB2YXIgYWN0aXZlSW5kZXggPSB1c2VBcHBTZWxlY3RvcihzZWxlY3RBY3RpdmVUb29sdGlwSW5kZXgpO1xuICB2YXIge1xuICAgICAgb25Nb3VzZUVudGVyOiBvbk1vdXNlRW50ZXJGcm9tUHJvcHMsXG4gICAgICBvbkNsaWNrOiBvbkl0ZW1DbGlja0Zyb21Qcm9wcyxcbiAgICAgIG9uTW91c2VMZWF2ZTogb25Nb3VzZUxlYXZlRnJvbVByb3BzXG4gICAgfSA9IGFsbE90aGVyUmFkaWFsQmFyUHJvcHMsXG4gICAgcmVzdE9mQWxsT3RoZXJQcm9wcyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhhbGxPdGhlclJhZGlhbEJhclByb3BzLCBfZXhjbHVkZWQyKTtcbiAgdmFyIG9uTW91c2VFbnRlckZyb21Db250ZXh0ID0gdXNlTW91c2VFbnRlckl0ZW1EaXNwYXRjaChvbk1vdXNlRW50ZXJGcm9tUHJvcHMsIGFsbE90aGVyUmFkaWFsQmFyUHJvcHMuZGF0YUtleSk7XG4gIHZhciBvbk1vdXNlTGVhdmVGcm9tQ29udGV4dCA9IHVzZU1vdXNlTGVhdmVJdGVtRGlzcGF0Y2gob25Nb3VzZUxlYXZlRnJvbVByb3BzKTtcbiAgdmFyIG9uQ2xpY2tGcm9tQ29udGV4dCA9IHVzZU1vdXNlQ2xpY2tJdGVtRGlzcGF0Y2gob25JdGVtQ2xpY2tGcm9tUHJvcHMsIGFsbE90aGVyUmFkaWFsQmFyUHJvcHMuZGF0YUtleSk7XG4gIGlmIChzZWN0b3JzID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmFkaWFsQmFyTGFiZWxMaXN0UHJvdmlkZXIsIHtcbiAgICBzaG93TGFiZWxzOiBzaG93TGFiZWxzLFxuICAgIHNlY3RvcnM6IHNlY3RvcnNcbiAgfSwgc2VjdG9ycy5tYXAoKGVudHJ5LCBpKSA9PiB7XG4gICAgdmFyIGlzQWN0aXZlID0gYWN0aXZlU2hhcGUgJiYgYWN0aXZlSW5kZXggPT09IFN0cmluZyhpKTtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRoZSB0eXBlcyBuZWVkIGEgYml0IG9mIGF0dGVudGlvblxuICAgIHZhciBvbk1vdXNlRW50ZXIgPSBvbk1vdXNlRW50ZXJGcm9tQ29udGV4dChlbnRyeSwgaSk7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0aGUgdHlwZXMgbmVlZCBhIGJpdCBvZiBhdHRlbnRpb25cbiAgICB2YXIgb25Nb3VzZUxlYXZlID0gb25Nb3VzZUxlYXZlRnJvbUNvbnRleHQoZW50cnksIGkpO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdGhlIHR5cGVzIG5lZWQgYSBiaXQgb2YgYXR0ZW50aW9uXG4gICAgdmFyIG9uQ2xpY2sgPSBvbkNsaWNrRnJvbUNvbnRleHQoZW50cnksIGkpO1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBjeCB0eXBlcyBhcmUgaW5jb21wYXRpYmxlXG4gICAgdmFyIHJhZGlhbEJhclNlY3RvclByb3BzID0gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgYmFzZVByb3BzKSwge30sIHtcbiAgICAgIGNvcm5lclJhZGl1czogcGFyc2VDb3JuZXJSYWRpdXMoY29ybmVyUmFkaXVzKVxuICAgIH0sIGVudHJ5KSwgYWRhcHRFdmVudHNPZkNoaWxkKHJlc3RPZkFsbE90aGVyUHJvcHMsIGVudHJ5LCBpKSksIHt9LCB7XG4gICAgICBvbk1vdXNlRW50ZXIsXG4gICAgICBvbk1vdXNlTGVhdmUsXG4gICAgICBvbkNsaWNrLFxuICAgICAgY2xhc3NOYW1lOiBcInJlY2hhcnRzLXJhZGlhbC1iYXItc2VjdG9yIFwiLmNvbmNhdChlbnRyeS5jbGFzc05hbWUpLFxuICAgICAgZm9yY2VDb3JuZXJSYWRpdXM6IG90aGVycy5mb3JjZUNvcm5lclJhZGl1cyxcbiAgICAgIGNvcm5lcklzRXh0ZXJuYWw6IG90aGVycy5jb3JuZXJJc0V4dGVybmFsLFxuICAgICAgaXNBY3RpdmUsXG4gICAgICBvcHRpb246IGlzQWN0aXZlID8gYWN0aXZlU2hhcGUgOiBzaGFwZVxuICAgIH0pO1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSYWRpYWxCYXJTZWN0b3IsIF9leHRlbmRzKHtcbiAgICAgIGtleTogXCJzZWN0b3ItXCIuY29uY2F0KGVudHJ5LmN4LCBcIi1cIikuY29uY2F0KGVudHJ5LmN5LCBcIi1cIikuY29uY2F0KGVudHJ5LmlubmVyUmFkaXVzLCBcIi1cIikuY29uY2F0KGVudHJ5Lm91dGVyUmFkaXVzLCBcIi1cIikuY29uY2F0KGVudHJ5LnN0YXJ0QW5nbGUsIFwiLVwiKS5jb25jYXQoZW50cnkuZW5kQW5nbGUsIFwiLVwiKS5jb25jYXQoaSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZWFjdC9uby1hcnJheS1pbmRleC1rZXlcbiAgICB9LCByYWRpYWxCYXJTZWN0b3JQcm9wcykpO1xuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGFiZWxMaXN0RnJvbUxhYmVsUHJvcCwge1xuICAgIGxhYmVsOiBhbGxPdGhlclJhZGlhbEJhclByb3BzLmxhYmVsXG4gIH0pLCBhbGxPdGhlclJhZGlhbEJhclByb3BzLmNoaWxkcmVuKTtcbn1cbmZ1bmN0aW9uIFNlY3RvcnNXaXRoQW5pbWF0aW9uKF9yZWYzKSB7XG4gIHZhciB7XG4gICAgcHJvcHMsXG4gICAgcHJldmlvdXNTZWN0b3JzUmVmXG4gIH0gPSBfcmVmMztcbiAgdmFyIHtcbiAgICBkYXRhLFxuICAgIGlzQW5pbWF0aW9uQWN0aXZlLFxuICAgIGFuaW1hdGlvbkJlZ2luLFxuICAgIGFuaW1hdGlvbkR1cmF0aW9uLFxuICAgIGFuaW1hdGlvbkVhc2luZyxcbiAgICBvbkFuaW1hdGlvbkVuZCxcbiAgICBvbkFuaW1hdGlvblN0YXJ0XG4gIH0gPSBwcm9wcztcbiAgdmFyIGFuaW1hdGlvbklkID0gdXNlQW5pbWF0aW9uSWQocHJvcHMsICdyZWNoYXJ0cy1yYWRpYWxiYXItJyk7XG4gIHZhciBwcmV2RGF0YSA9IHByZXZpb3VzU2VjdG9yc1JlZi5jdXJyZW50O1xuICB2YXIgW2lzQW5pbWF0aW5nLCBzZXRJc0FuaW1hdGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIHZhciBoYW5kbGVBbmltYXRpb25FbmQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBvbkFuaW1hdGlvbkVuZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgb25BbmltYXRpb25FbmQoKTtcbiAgICB9XG4gICAgc2V0SXNBbmltYXRpbmcoZmFsc2UpO1xuICB9LCBbb25BbmltYXRpb25FbmRdKTtcbiAgdmFyIGhhbmRsZUFuaW1hdGlvblN0YXJ0ID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmICh0eXBlb2Ygb25BbmltYXRpb25TdGFydCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgb25BbmltYXRpb25TdGFydCgpO1xuICAgIH1cbiAgICBzZXRJc0FuaW1hdGluZyh0cnVlKTtcbiAgfSwgW29uQW5pbWF0aW9uU3RhcnRdKTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEphdmFzY3JpcHRBbmltYXRlLCB7XG4gICAgYW5pbWF0aW9uSWQ6IGFuaW1hdGlvbklkLFxuICAgIGJlZ2luOiBhbmltYXRpb25CZWdpbixcbiAgICBkdXJhdGlvbjogYW5pbWF0aW9uRHVyYXRpb24sXG4gICAgaXNBY3RpdmU6IGlzQW5pbWF0aW9uQWN0aXZlLFxuICAgIGVhc2luZzogYW5pbWF0aW9uRWFzaW5nLFxuICAgIG9uQW5pbWF0aW9uU3RhcnQ6IGhhbmRsZUFuaW1hdGlvblN0YXJ0LFxuICAgIG9uQW5pbWF0aW9uRW5kOiBoYW5kbGVBbmltYXRpb25FbmQsXG4gICAga2V5OiBhbmltYXRpb25JZFxuICB9LCB0ID0+IHtcbiAgICB2YXIgc3RlcERhdGEgPSB0ID09PSAxID8gZGF0YSA6IChkYXRhICE9PSBudWxsICYmIGRhdGEgIT09IHZvaWQgMCA/IGRhdGEgOiBTVEFCTEVfRU1QVFlfQVJSQVkpLm1hcCgoZW50cnksIGluZGV4KSA9PiB7XG4gICAgICB2YXIgcHJldiA9IHByZXZEYXRhICYmIHByZXZEYXRhW2luZGV4XTtcbiAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgIHZhciBpbnRlcnBvbGF0b3JTdGFydEFuZ2xlID0gaW50ZXJwb2xhdGVOdW1iZXIocHJldi5zdGFydEFuZ2xlLCBlbnRyeS5zdGFydEFuZ2xlKTtcbiAgICAgICAgdmFyIGludGVycG9sYXRvckVuZEFuZ2xlID0gaW50ZXJwb2xhdGVOdW1iZXIocHJldi5lbmRBbmdsZSwgZW50cnkuZW5kQW5nbGUpO1xuICAgICAgICByZXR1cm4gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBlbnRyeSksIHt9LCB7XG4gICAgICAgICAgc3RhcnRBbmdsZTogaW50ZXJwb2xhdG9yU3RhcnRBbmdsZSh0KSxcbiAgICAgICAgICBlbmRBbmdsZTogaW50ZXJwb2xhdG9yRW5kQW5nbGUodClcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB2YXIge1xuICAgICAgICBlbmRBbmdsZSxcbiAgICAgICAgc3RhcnRBbmdsZVxuICAgICAgfSA9IGVudHJ5O1xuICAgICAgdmFyIGludGVycG9sYXRvciA9IGludGVycG9sYXRlTnVtYmVyKHN0YXJ0QW5nbGUsIGVuZEFuZ2xlKTtcbiAgICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGVudHJ5KSwge30sIHtcbiAgICAgICAgZW5kQW5nbGU6IGludGVycG9sYXRvcih0KVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgaWYgKHQgPiAwKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICAgIHByZXZpb3VzU2VjdG9yc1JlZi5jdXJyZW50ID0gc3RlcERhdGEgIT09IG51bGwgJiYgc3RlcERhdGEgIT09IHZvaWQgMCA/IHN0ZXBEYXRhIDogbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExheWVyLCBudWxsLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSYWRpYWxCYXJTZWN0b3JzLCB7XG4gICAgICBzZWN0b3JzOiBzdGVwRGF0YSAhPT0gbnVsbCAmJiBzdGVwRGF0YSAhPT0gdm9pZCAwID8gc3RlcERhdGEgOiBTVEFCTEVfRU1QVFlfQVJSQVksXG4gICAgICBhbGxPdGhlclJhZGlhbEJhclByb3BzOiBwcm9wcyxcbiAgICAgIHNob3dMYWJlbHM6ICFpc0FuaW1hdGluZ1xuICAgIH0pKTtcbiAgfSk7XG59XG5mdW5jdGlvbiBSZW5kZXJTZWN0b3JzKHByb3BzKSB7XG4gIHZhciBwcmV2aW91c1NlY3RvcnNSZWYgPSB1c2VSZWYobnVsbCk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTZWN0b3JzV2l0aEFuaW1hdGlvbiwge1xuICAgIHByb3BzOiBwcm9wcyxcbiAgICBwcmV2aW91c1NlY3RvcnNSZWY6IHByZXZpb3VzU2VjdG9yc1JlZlxuICB9KTtcbn1cbmZ1bmN0aW9uIFNldFJhZGlhbEJhclBheWxvYWRMZWdlbmQocHJvcHMpIHtcbiAgdmFyIGxlZ2VuZFBheWxvYWQgPSB1c2VBcHBTZWxlY3RvcihzdGF0ZSA9PiBzZWxlY3RSYWRpYWxCYXJMZWdlbmRQYXlsb2FkKHN0YXRlLCBwcm9wcy5sZWdlbmRUeXBlKSk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTZXRQb2xhckxlZ2VuZFBheWxvYWQsIHtcbiAgICBsZWdlbmRQYXlsb2FkOiBsZWdlbmRQYXlsb2FkICE9PSBudWxsICYmIGxlZ2VuZFBheWxvYWQgIT09IHZvaWQgMCA/IGxlZ2VuZFBheWxvYWQgOiBbXVxuICB9KTtcbn1cbmZ1bmN0aW9uIGdldFRvb2x0aXBFbnRyeVNldHRpbmdzKHByb3BzKSB7XG4gIHZhciB7XG4gICAgZGF0YUtleSxcbiAgICBkYXRhLFxuICAgIHN0cm9rZSxcbiAgICBzdHJva2VXaWR0aCxcbiAgICBuYW1lLFxuICAgIGhpZGUsXG4gICAgZmlsbCxcbiAgICB0b29sdGlwVHlwZVxuICB9ID0gcHJvcHM7XG4gIHJldHVybiB7XG4gICAgZGF0YURlZmluZWRPbkl0ZW06IGRhdGEsXG4gICAgcG9zaXRpb25zOiB1bmRlZmluZWQsXG4gICAgc2V0dGluZ3M6IHtcbiAgICAgIHN0cm9rZSxcbiAgICAgIHN0cm9rZVdpZHRoLFxuICAgICAgZmlsbCxcbiAgICAgIG5hbWVLZXk6IHVuZGVmaW5lZCxcbiAgICAgIC8vIFJhZGlhbEJhciBkb2VzIG5vdCBoYXZlIG5hbWVLZXksIHdoeT9cbiAgICAgIGRhdGFLZXksXG4gICAgICBuYW1lOiBnZXRUb29sdGlwTmFtZVByb3AobmFtZSwgZGF0YUtleSksXG4gICAgICBoaWRlLFxuICAgICAgdHlwZTogdG9vbHRpcFR5cGUsXG4gICAgICBjb2xvcjogZmlsbCxcbiAgICAgIHVuaXQ6ICcnIC8vIFdoeSBkb2VzIFJhZGlhbEJhciBub3Qgc3VwcG9ydCB1bml0P1xuICAgIH1cbiAgfTtcbn1cbmNsYXNzIFJhZGlhbEJhcldpdGhTdGF0ZSBleHRlbmRzIFB1cmVDb21wb25lbnQge1xuICByZW5kZXJCYWNrZ3JvdW5kKHNlY3RvcnMpIHtcbiAgICBpZiAoc2VjdG9ycyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIHtcbiAgICAgIGNvcm5lclJhZGl1c1xuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIHZhciBiYWNrZ3JvdW5kUHJvcHMgPSBzdmdQcm9wZXJ0aWVzTm9FdmVudHNGcm9tVW5rbm93bih0aGlzLnByb3BzLmJhY2tncm91bmQpO1xuICAgIHJldHVybiBzZWN0b3JzLm1hcCgoZW50cnksIGkpID0+IHtcbiAgICAgIHZhciB7XG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgYmFja2dyb3VuZFxuICAgICAgICB9ID0gZW50cnksXG4gICAgICAgIHJlc3QgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoZW50cnksIF9leGNsdWRlZDMpO1xuICAgICAgaWYgKCFiYWNrZ3JvdW5kKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgdmFyIHByb3BzID0gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHtcbiAgICAgICAgY29ybmVyUmFkaXVzOiBwYXJzZUNvcm5lclJhZGl1cyhjb3JuZXJSYWRpdXMpXG4gICAgICB9LCByZXN0KSwge30sIHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBiYWNrZ3JvdW5kUHJvcHMgaXMgY29udHJpYnV0aW5nIHVua25vd24gcHJvcHNcbiAgICAgICAgZmlsbDogJyNlZWUnXG4gICAgICB9LCBiYWNrZ3JvdW5kKSwgYmFja2dyb3VuZFByb3BzKSwgYWRhcHRFdmVudHNPZkNoaWxkKHRoaXMucHJvcHMsIGVudHJ5LCBpKSksIHt9LCB7XG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBjbGFzc05hbWU6IGNsc3goJ3JlY2hhcnRzLXJhZGlhbC1iYXItYmFja2dyb3VuZC1zZWN0b3InLCBiYWNrZ3JvdW5kUHJvcHMgPT09IG51bGwgfHwgYmFja2dyb3VuZFByb3BzID09PSB2b2lkIDAgPyB2b2lkIDAgOiBiYWNrZ3JvdW5kUHJvcHMuY2xhc3NOYW1lKSxcbiAgICAgICAgb3B0aW9uOiBiYWNrZ3JvdW5kLFxuICAgICAgICBpc0FjdGl2ZTogZmFsc2VcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJhZGlhbEJhclNlY3RvciwgX2V4dGVuZHMoe1xuICAgICAgICBrZXk6IFwiYmFja2dyb3VuZC1cIi5jb25jYXQocmVzdC5jeCwgXCItXCIpLmNvbmNhdChyZXN0LmN5LCBcIi1cIikuY29uY2F0KHJlc3QuaW5uZXJSYWRpdXMsIFwiLVwiKS5jb25jYXQocmVzdC5vdXRlclJhZGl1cywgXCItXCIpLmNvbmNhdChyZXN0LnN0YXJ0QW5nbGUsIFwiLVwiKS5jb25jYXQocmVzdC5lbmRBbmdsZSwgXCItXCIpLmNvbmNhdChpKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHJlYWN0L25vLWFycmF5LWluZGV4LWtleVxuICAgICAgfSwgcHJvcHMpKTtcbiAgICB9KTtcbiAgfVxuICByZW5kZXIoKSB7XG4gICAgdmFyIHtcbiAgICAgIGhpZGUsXG4gICAgICBkYXRhLFxuICAgICAgY2xhc3NOYW1lLFxuICAgICAgYmFja2dyb3VuZFxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChoaWRlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIGxheWVyQ2xhc3MgPSBjbHN4KCdyZWNoYXJ0cy1hcmVhJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGF5ZXIsIHtcbiAgICAgIGNsYXNzTmFtZTogbGF5ZXJDbGFzc1xuICAgIH0sIGJhY2tncm91bmQgJiYgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGF5ZXIsIHtcbiAgICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1yYWRpYWwtYmFyLWJhY2tncm91bmRcIlxuICAgIH0sIHRoaXMucmVuZGVyQmFja2dyb3VuZChkYXRhKSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExheWVyLCB7XG4gICAgICBjbGFzc05hbWU6IFwicmVjaGFydHMtcmFkaWFsLWJhci1zZWN0b3JzXCJcbiAgICB9LCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZW5kZXJTZWN0b3JzLCB0aGlzLnByb3BzKSkpO1xuICB9XG59XG5mdW5jdGlvbiBSYWRpYWxCYXJJbXBsKHByb3BzKSB7XG4gIHZhciBfdXNlQXBwU2VsZWN0b3I7XG4gIHZhciBjZWxscyA9IGZpbmRBbGxCeVR5cGUocHJvcHMuY2hpbGRyZW4sIENlbGwpO1xuICB2YXIgcmFkaWFsQmFyU2V0dGluZ3MgPSB7XG4gICAgZGF0YTogdW5kZWZpbmVkLFxuICAgIGhpZGU6IGZhbHNlLFxuICAgIGlkOiBwcm9wcy5pZCxcbiAgICBkYXRhS2V5OiBwcm9wcy5kYXRhS2V5LFxuICAgIG1pblBvaW50U2l6ZTogcHJvcHMubWluUG9pbnRTaXplLFxuICAgIHN0YWNrSWQ6IGdldE5vcm1hbGl6ZWRTdGFja0lkKHByb3BzLnN0YWNrSWQpLFxuICAgIG1heEJhclNpemU6IHByb3BzLm1heEJhclNpemUsXG4gICAgYmFyU2l6ZTogcHJvcHMuYmFyU2l6ZSxcbiAgICB0eXBlOiAncmFkaWFsQmFyJyxcbiAgICBhbmdsZUF4aXNJZDogcHJvcHMuYW5nbGVBeGlzSWQsXG4gICAgcmFkaXVzQXhpc0lkOiBwcm9wcy5yYWRpdXNBeGlzSWRcbiAgfTtcbiAgdmFyIGRhdGEgPSAoX3VzZUFwcFNlbGVjdG9yID0gdXNlQXBwU2VsZWN0b3Ioc3RhdGUgPT4gc2VsZWN0UmFkaWFsQmFyU2VjdG9ycyhzdGF0ZSwgcHJvcHMucmFkaXVzQXhpc0lkLCBwcm9wcy5hbmdsZUF4aXNJZCwgcmFkaWFsQmFyU2V0dGluZ3MsIGNlbGxzKSkpICE9PSBudWxsICYmIF91c2VBcHBTZWxlY3RvciAhPT0gdm9pZCAwID8gX3VzZUFwcFNlbGVjdG9yIDogU1RBQkxFX0VNUFRZX0FSUkFZO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRnJhZ21lbnQsIG51bGwsIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFNldFRvb2x0aXBFbnRyeVNldHRpbmdzLCB7XG4gICAgZm46IGdldFRvb2x0aXBFbnRyeVNldHRpbmdzLFxuICAgIGFyZ3M6IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgcHJvcHMpLCB7fSwge1xuICAgICAgZGF0YVxuICAgIH0pXG4gIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSYWRpYWxCYXJXaXRoU3RhdGUsIF9leHRlbmRzKHt9LCBwcm9wcywge1xuICAgIGRhdGE6IGRhdGFcbiAgfSkpKTtcbn1cbnZhciBkZWZhdWx0UmFkaWFsQmFyUHJvcHMgPSB7XG4gIGFuZ2xlQXhpc0lkOiAwLFxuICByYWRpdXNBeGlzSWQ6IDAsXG4gIG1pblBvaW50U2l6ZTogMCxcbiAgaGlkZTogZmFsc2UsXG4gIGxlZ2VuZFR5cGU6ICdyZWN0JyxcbiAgZGF0YTogW10sXG4gIGlzQW5pbWF0aW9uQWN0aXZlOiAhR2xvYmFsLmlzU3NyLFxuICBhbmltYXRpb25CZWdpbjogMCxcbiAgYW5pbWF0aW9uRHVyYXRpb246IDE1MDAsXG4gIGFuaW1hdGlvbkVhc2luZzogJ2Vhc2UnLFxuICBmb3JjZUNvcm5lclJhZGl1czogZmFsc2UsXG4gIGNvcm5lcklzRXh0ZXJuYWw6IGZhbHNlXG59O1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVSYWRpYWxCYXJEYXRhSXRlbXMoX3JlZjQpIHtcbiAgdmFyIHtcbiAgICBkaXNwbGF5ZWREYXRhLFxuICAgIHN0YWNrZWREYXRhLFxuICAgIGRhdGFTdGFydEluZGV4LFxuICAgIHN0YWNrZWREb21haW4sXG4gICAgZGF0YUtleSxcbiAgICBiYXNlVmFsdWUsXG4gICAgbGF5b3V0LFxuICAgIHJhZGl1c0F4aXMsXG4gICAgcmFkaXVzQXhpc1RpY2tzLFxuICAgIGJhbmRTaXplLFxuICAgIHBvcyxcbiAgICBhbmdsZUF4aXMsXG4gICAgbWluUG9pbnRTaXplLFxuICAgIGN4LFxuICAgIGN5LFxuICAgIGFuZ2xlQXhpc1RpY2tzLFxuICAgIGNlbGxzLFxuICAgIHN0YXJ0QW5nbGU6IHJvb3RTdGFydEFuZ2xlLFxuICAgIGVuZEFuZ2xlOiByb290RW5kQW5nbGVcbiAgfSA9IF9yZWY0O1xuICByZXR1cm4gKGRpc3BsYXllZERhdGEgIT09IG51bGwgJiYgZGlzcGxheWVkRGF0YSAhPT0gdm9pZCAwID8gZGlzcGxheWVkRGF0YSA6IFtdKS5tYXAoKGVudHJ5LCBpbmRleCkgPT4ge1xuICAgIHZhciB2YWx1ZSwgaW5uZXJSYWRpdXMsIG91dGVyUmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYmFja2dyb3VuZFNlY3RvcjtcbiAgICBpZiAoc3RhY2tlZERhdGEpIHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHJ1bmNhdGVCeURvbWFpbiBleHBlY3RzIG9ubHkgbnVtZXJpY2FsIGRvbWFpbiwgYnV0IGl0IGNhbiByZWNlaXZlZCBjYXRlZ29yaWNhbCBkb21haW4gdG9vXG4gICAgICB2YWx1ZSA9IHRydW5jYXRlQnlEb21haW4oc3RhY2tlZERhdGFbZGF0YVN0YXJ0SW5kZXggKyBpbmRleF0sIHN0YWNrZWREb21haW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSA9IGdldFZhbHVlQnlEYXRhS2V5KGVudHJ5LCBkYXRhS2V5KTtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUgPSBbYmFzZVZhbHVlLCB2YWx1ZV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChsYXlvdXQgPT09ICdyYWRpYWwnKSB7XG4gICAgICBpbm5lclJhZGl1cyA9IGdldENhdGVDb29yZGluYXRlT2ZCYXIoe1xuICAgICAgICBheGlzOiByYWRpdXNBeGlzLFxuICAgICAgICB0aWNrczogcmFkaXVzQXhpc1RpY2tzLFxuICAgICAgICBiYW5kU2l6ZSxcbiAgICAgICAgb2Zmc2V0OiBwb3Mub2Zmc2V0LFxuICAgICAgICBlbnRyeSxcbiAgICAgICAgaW5kZXhcbiAgICAgIH0pO1xuICAgICAgZW5kQW5nbGUgPSBhbmdsZUF4aXMuc2NhbGUodmFsdWVbMV0pO1xuICAgICAgc3RhcnRBbmdsZSA9IGFuZ2xlQXhpcy5zY2FsZSh2YWx1ZVswXSk7XG4gICAgICBvdXRlclJhZGl1cyA9IChpbm5lclJhZGl1cyAhPT0gbnVsbCAmJiBpbm5lclJhZGl1cyAhPT0gdm9pZCAwID8gaW5uZXJSYWRpdXMgOiAwKSArIHBvcy5zaXplO1xuICAgICAgdmFyIGRlbHRhQW5nbGUgPSBlbmRBbmdsZSAtIHN0YXJ0QW5nbGU7XG4gICAgICBpZiAoTWF0aC5hYnMobWluUG9pbnRTaXplKSA+IDAgJiYgTWF0aC5hYnMoZGVsdGFBbmdsZSkgPCBNYXRoLmFicyhtaW5Qb2ludFNpemUpKSB7XG4gICAgICAgIHZhciBkZWx0YSA9IG1hdGhTaWduKGRlbHRhQW5nbGUgfHwgbWluUG9pbnRTaXplKSAqIChNYXRoLmFicyhtaW5Qb2ludFNpemUpIC0gTWF0aC5hYnMoZGVsdGFBbmdsZSkpO1xuICAgICAgICBlbmRBbmdsZSArPSBkZWx0YTtcbiAgICAgIH1cbiAgICAgIGJhY2tncm91bmRTZWN0b3IgPSB7XG4gICAgICAgIGJhY2tncm91bmQ6IHtcbiAgICAgICAgICBjeCxcbiAgICAgICAgICBjeSxcbiAgICAgICAgICBpbm5lclJhZGl1cyxcbiAgICAgICAgICBvdXRlclJhZGl1cyxcbiAgICAgICAgICBzdGFydEFuZ2xlOiByb290U3RhcnRBbmdsZSxcbiAgICAgICAgICBlbmRBbmdsZTogcm9vdEVuZEFuZ2xlXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGlubmVyUmFkaXVzID0gcmFkaXVzQXhpcy5zY2FsZSh2YWx1ZVswXSk7XG4gICAgICBvdXRlclJhZGl1cyA9IHJhZGl1c0F4aXMuc2NhbGUodmFsdWVbMV0pO1xuICAgICAgc3RhcnRBbmdsZSA9IGdldENhdGVDb29yZGluYXRlT2ZCYXIoe1xuICAgICAgICBheGlzOiBhbmdsZUF4aXMsXG4gICAgICAgIHRpY2tzOiBhbmdsZUF4aXNUaWNrcyxcbiAgICAgICAgYmFuZFNpemUsXG4gICAgICAgIG9mZnNldDogcG9zLm9mZnNldCxcbiAgICAgICAgZW50cnksXG4gICAgICAgIGluZGV4XG4gICAgICB9KTtcbiAgICAgIGVuZEFuZ2xlID0gKHN0YXJ0QW5nbGUgIT09IG51bGwgJiYgc3RhcnRBbmdsZSAhPT0gdm9pZCAwID8gc3RhcnRBbmdsZSA6IDApICsgcG9zLnNpemU7XG4gICAgICB2YXIgZGVsdGFSYWRpdXMgPSBvdXRlclJhZGl1cyAtIGlubmVyUmFkaXVzO1xuICAgICAgaWYgKE1hdGguYWJzKG1pblBvaW50U2l6ZSkgPiAwICYmIE1hdGguYWJzKGRlbHRhUmFkaXVzKSA8IE1hdGguYWJzKG1pblBvaW50U2l6ZSkpIHtcbiAgICAgICAgdmFyIF9kZWx0YSA9IG1hdGhTaWduKGRlbHRhUmFkaXVzIHx8IG1pblBvaW50U2l6ZSkgKiAoTWF0aC5hYnMobWluUG9pbnRTaXplKSAtIE1hdGguYWJzKGRlbHRhUmFkaXVzKSk7XG4gICAgICAgIG91dGVyUmFkaXVzICs9IF9kZWx0YTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBlbnRyeSksIGJhY2tncm91bmRTZWN0b3IpLCB7fSwge1xuICAgICAgcGF5bG9hZDogZW50cnksXG4gICAgICB2YWx1ZTogc3RhY2tlZERhdGEgPyB2YWx1ZSA6IHZhbHVlWzFdLFxuICAgICAgY3gsXG4gICAgICBjeSxcbiAgICAgIGlubmVyUmFkaXVzLFxuICAgICAgb3V0ZXJSYWRpdXMsXG4gICAgICBzdGFydEFuZ2xlLFxuICAgICAgZW5kQW5nbGVcbiAgICB9LCBjZWxscyAmJiBjZWxsc1tpbmRleF0gJiYgY2VsbHNbaW5kZXhdLnByb3BzKTtcbiAgfSk7XG59XG5leHBvcnQgY2xhc3MgUmFkaWFsQmFyIGV4dGVuZHMgUHVyZUNvbXBvbmVudCB7XG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVnaXN0ZXJHcmFwaGljYWxJdGVtSWQsIHtcbiAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxuICAgICAgdHlwZTogXCJyYWRpYWxCYXJcIlxuICAgIH0sIGlkID0+IHtcbiAgICAgIHZhciBfdGhpcyRwcm9wcyRoaWRlLCBfdGhpcyRwcm9wcyRhbmdsZUF4aXMsIF90aGlzJHByb3BzJHJhZGl1c0F4aTtcbiAgICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5GcmFnbWVudCwgbnVsbCwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2V0UG9sYXJHcmFwaGljYWxJdGVtLCB7XG4gICAgICAgIHR5cGU6IFwicmFkaWFsQmFyXCIsXG4gICAgICAgIGlkOiBpZFxuICAgICAgICAvLyBUT0RPOiBkbyB3ZSBuZWVkIHRoaXMgYW55bW9yZSBhbmQgaXMgdGhlIGJlbG93IGNvbW1lbnQgdHJ1ZT8gU3RyaWN0IG51bGxzIGNvbXBsYWlucyBhYm91dCBpdFxuICAgICAgICAsXG4gICAgICAgIGRhdGE6IHVuZGVmaW5lZCAvLyBkYXRhIHByb3AgaXMgaW5qZWN0ZWQgdGhyb3VnaCBnZW5lcmF0b3IgYW5kIG92ZXJ3cml0ZXMgd2hhdCB1c2VyIHBhc3NlcyBpblxuICAgICAgICAsXG4gICAgICAgIGRhdGFLZXk6IHRoaXMucHJvcHMuZGF0YUtleVxuICAgICAgICAvLyBUUyBpcyBub3Qgc21hcnQgZW5vdWdoIHRvIGtub3cgZGVmYXVsdFByb3BzIGhhcyB2YWx1ZXMgZHVlIHRvIHRoZSBleHBsaWNpdCBQYXJ0aWFsIHR5cGVcbiAgICAgICAgLFxuICAgICAgICBoaWRlOiAoX3RoaXMkcHJvcHMkaGlkZSA9IHRoaXMucHJvcHMuaGlkZSkgIT09IG51bGwgJiYgX3RoaXMkcHJvcHMkaGlkZSAhPT0gdm9pZCAwID8gX3RoaXMkcHJvcHMkaGlkZSA6IGRlZmF1bHRSYWRpYWxCYXJQcm9wcy5oaWRlLFxuICAgICAgICBhbmdsZUF4aXNJZDogKF90aGlzJHByb3BzJGFuZ2xlQXhpcyA9IHRoaXMucHJvcHMuYW5nbGVBeGlzSWQpICE9PSBudWxsICYmIF90aGlzJHByb3BzJGFuZ2xlQXhpcyAhPT0gdm9pZCAwID8gX3RoaXMkcHJvcHMkYW5nbGVBeGlzIDogZGVmYXVsdFJhZGlhbEJhclByb3BzLmFuZ2xlQXhpc0lkLFxuICAgICAgICByYWRpdXNBeGlzSWQ6IChfdGhpcyRwcm9wcyRyYWRpdXNBeGkgPSB0aGlzLnByb3BzLnJhZGl1c0F4aXNJZCkgIT09IG51bGwgJiYgX3RoaXMkcHJvcHMkcmFkaXVzQXhpICE9PSB2b2lkIDAgPyBfdGhpcyRwcm9wcyRyYWRpdXNBeGkgOiBkZWZhdWx0UmFkaWFsQmFyUHJvcHMucmFkaXVzQXhpc0lkLFxuICAgICAgICBzdGFja0lkOiBnZXROb3JtYWxpemVkU3RhY2tJZCh0aGlzLnByb3BzLnN0YWNrSWQpLFxuICAgICAgICBiYXJTaXplOiB0aGlzLnByb3BzLmJhclNpemUsXG4gICAgICAgIG1pblBvaW50U2l6ZTogdGhpcy5wcm9wcy5taW5Qb2ludFNpemUsXG4gICAgICAgIG1heEJhclNpemU6IHRoaXMucHJvcHMubWF4QmFyU2l6ZVxuICAgICAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFNldFJhZGlhbEJhclBheWxvYWRMZWdlbmQsIHRoaXMucHJvcHMpLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSYWRpYWxCYXJJbXBsLCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywge1xuICAgICAgICBpZDogaWRcbiAgICAgIH0pKSk7XG4gICAgfSk7XG4gIH1cbn1cbl9kZWZpbmVQcm9wZXJ0eShSYWRpYWxCYXIsIFwiZGlzcGxheU5hbWVcIiwgJ1JhZGlhbEJhcicpO1xuX2RlZmluZVByb3BlcnR5KFJhZGlhbEJhciwgXCJkZWZhdWx0UHJvcHNcIiwgZGVmYXVsdFJhZGlhbEJhclByb3BzKTsiLCJpbXBvcnQgeyBkZWZhdWx0QXhpc0lkIH0gZnJvbSAnLi9zdGF0ZS9jYXJ0ZXNpYW5BeGlzU2xpY2UnO1xuaW1wb3J0IHsgc2VsZWN0QXhpc0RvbWFpbiwgc2VsZWN0QXhpc1dpdGhTY2FsZSB9IGZyb20gJy4vc3RhdGUvc2VsZWN0b3JzL2F4aXNTZWxlY3RvcnMnO1xuaW1wb3J0IHsgdXNlQXBwU2VsZWN0b3IgfSBmcm9tICcuL3N0YXRlL2hvb2tzJztcbmltcG9ydCB7IHVzZUlzUGFub3JhbWEgfSBmcm9tICcuL2NvbnRleHQvUGFub3JhbWFDb250ZXh0JztcbmltcG9ydCB7IHNlbGVjdEFjdGl2ZUxhYmVsLCBzZWxlY3RBY3RpdmVUb29sdGlwRGF0YVBvaW50cyB9IGZyb20gJy4vc3RhdGUvc2VsZWN0b3JzL3Rvb2x0aXBTZWxlY3RvcnMnO1xuaW1wb3J0IHsgc2VsZWN0Q2hhcnRPZmZzZXQgfSBmcm9tICcuL3N0YXRlL3NlbGVjdG9ycy9zZWxlY3RDaGFydE9mZnNldCc7XG5pbXBvcnQgeyBzZWxlY3RQbG90QXJlYSB9IGZyb20gJy4vc3RhdGUvc2VsZWN0b3JzL3NlbGVjdFBsb3RBcmVhJztcbmV4cG9ydCB2YXIgdXNlWEF4aXMgPSB4QXhpc0lkID0+IHtcbiAgdmFyIGlzUGFub3JhbWEgPSB1c2VJc1Bhbm9yYW1hKCk7XG4gIHJldHVybiB1c2VBcHBTZWxlY3RvcihzdGF0ZSA9PiBzZWxlY3RBeGlzV2l0aFNjYWxlKHN0YXRlLCAneEF4aXMnLCB4QXhpc0lkLCBpc1Bhbm9yYW1hKSk7XG59O1xuZXhwb3J0IHZhciB1c2VZQXhpcyA9IHlBeGlzSWQgPT4ge1xuICB2YXIgaXNQYW5vcmFtYSA9IHVzZUlzUGFub3JhbWEoKTtcbiAgcmV0dXJuIHVzZUFwcFNlbGVjdG9yKHN0YXRlID0+IHNlbGVjdEF4aXNXaXRoU2NhbGUoc3RhdGUsICd5QXhpcycsIHlBeGlzSWQsIGlzUGFub3JhbWEpKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgYWN0aXZlIHRvb2x0aXAgbGFiZWwuIFRoZSBsYWJlbCBpcyBvbmUgb2YgdGhlIHZhbHVlcyBmcm9tIHRoZSBjaGFydCBkYXRhLFxuICogYW5kIGlzIHVzZWQgdG8gZGlzcGxheSBpbiB0aGUgdG9vbHRpcCBjb250ZW50LlxuICpcbiAqIFJldHVybnMgdW5kZWZpbmVkIGlmIHRoZXJlIGlzIG5vIGFjdGl2ZSB1c2VyIGludGVyYWN0aW9uIG9yIGlmIHVzZWQgb3V0c2lkZSBhIGNoYXJ0IGNvbnRleHRcbiAqXG4gKiBAcmV0dXJucyBzdHJpbmcgfCB1bmRlZmluZWRcbiAqL1xuZXhwb3J0IHZhciB1c2VBY3RpdmVUb29sdGlwTGFiZWwgPSAoKSA9PiB7XG4gIHJldHVybiB1c2VBcHBTZWxlY3RvcihzZWxlY3RBY3RpdmVMYWJlbCk7XG59O1xuXG4vKipcbiAqIE9mZnNldCBkZWZpbmVzIHRoZSBibGFuayBzcGFjZSBiZXR3ZWVuIHRoZSBjaGFydCBhbmQgdGhlIHBsb3QgYXJlYS5cbiAqIFRoaXMgYmxhbmsgc3BhY2UgaXMgb2NjdXBpZWQgYnkgc3VwcG9ydGluZyBlbGVtZW50cyBsaWtlIGF4ZXMsIGxlZ2VuZHMsIGFuZCBicnVzaGVzLlxuICogVGhpcyBhbHNvIGluY2x1ZGVzIGFueSBtYXJnaW5zIHRoYXQgbWlnaHQgYmUgYXBwbGllZCB0byB0aGUgY2hhcnQuXG4gKiBJZiB5b3UgYXJlIGludGVyZXN0ZWQgaW4gdGhlIG1hcmdpbiBhbG9uZSwgdXNlIGB1c2VNYXJnaW5gIGluc3RlYWQuXG4gKlxuICogQHJldHVybnMgT2Zmc2V0IG9mIHRoZSBjaGFydCBpbiBwaXhlbHMsIG9yIHVuZGVmaW5lZCBpZiB1c2VkIG91dHNpZGUgYSBjaGFydCBjb250ZXh0LlxuICovXG5leHBvcnQgdmFyIHVzZU9mZnNldCA9ICgpID0+IHtcbiAgcmV0dXJuIHVzZUFwcFNlbGVjdG9yKHNlbGVjdENoYXJ0T2Zmc2V0KTtcbn07XG5cbi8qKlxuICogUGxvdCBhcmVhIGlzIHRoZSBhcmVhIHdoZXJlIHRoZSBhY3R1YWwgY2hhcnQgZGF0YSBpcyByZW5kZXJlZC5cbiAqIFRoaXMgbWVhbnM6IGJhcnMsIGxpbmVzLCBzY2F0dGVyIHBvaW50cywgZXRjLlxuICpcbiAqIFRoZSBwbG90IGFyZWEgaXMgY2FsY3VsYXRlZCBiYXNlZCBvbiB0aGUgY2hhcnQgZGltZW5zaW9ucyBhbmQgdGhlIG9mZnNldC5cbiAqXG4gKiBAcmV0dXJucyBQbG90IGFyZWEgb2YgdGhlIGNoYXJ0IGluIHBpeGVscywgb3IgdW5kZWZpbmVkIGlmIHVzZWQgb3V0c2lkZSBhIGNoYXJ0IGNvbnRleHQuXG4gKi9cbmV4cG9ydCB2YXIgdXNlUGxvdEFyZWEgPSAoKSA9PiB7XG4gIHJldHVybiB1c2VBcHBTZWxlY3RvcihzZWxlY3RQbG90QXJlYSk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1cnJlbnRseSBhY3RpdmUgZGF0YSBwb2ludHMgYmVpbmcgZGlzcGxheWVkIGluIHRoZSBUb29sdGlwLlxuICogQWN0aXZlIG1lYW5zIHRoYXQgaXQgaXMgY3VycmVudGx5IHZpc2libGU7IHRoaXMgaG9vayB3aWxsIHJldHVybiBgdW5kZWZpbmVkYCBpZiB0aGVyZSBpcyBubyBjdXJyZW50IGludGVyYWN0aW9uLlxuICpcbiAqIFRoaXMgZm9sbG93cyB0aGUgYDxUb29sdGlwIC8+YCBwcm9wcywgaWYgdGhlIFRvb2x0aXAgZWxlbWVudCBpcyBwcmVzZW50IGluIHRoZSBjaGFydC5cbiAqIElmIHRoZXJlIGlzIG5vIGA8VG9vbHRpcCAvPmAgdGhlbiB0aGlzIGhvb2sgd2lsbCBmb2xsb3cgdGhlIGRlZmF1bHQgVG9vbHRpcCBwcm9wcy5cbiAqXG4gKiBEYXRhIHBvaW50IGlzIHdoYXRldmVyIHlvdSBwYXNzIGFzIGFuIGlucHV0IHRvIHRoZSBjaGFydCB1c2luZyB0aGUgYGRhdGE9e31gIHByb3AuXG4gKlxuICogVGhpcyByZXR1cm5zIGFuIGFycmF5IGJlY2F1c2UgYSBjaGFydCBjYW4gaGF2ZSBtdWx0aXBsZSBncmFwaGljYWwgaXRlbXMgaW4gaXQgKG11bHRpcGxlIExpbmVzIGZvciBleGFtcGxlKVxuICogYW5kIHRvb2x0aXAgd2l0aCBgc2hhcmVkPXt0cnVlfWAgd2lsbCBkaXNwbGF5IGFsbCBpdGVtcyBhdCB0aGUgc2FtZSB0aW1lLlxuICpcbiAqIFJldHVybnMgdW5kZWZpbmVkIHdoZW4gdXNlZCBvdXRzaWRlIGEgY2hhcnQgY29udGV4dC5cbiAqXG4gKiBAcmV0dXJucyBEYXRhIHBvaW50cyB0aGF0IGFyZSBjdXJyZW50bHkgdmlzaWJsZSBpbiBhIFRvb2x0aXBcbiAqL1xuZXhwb3J0IHZhciB1c2VBY3RpdmVUb29sdGlwRGF0YVBvaW50cyA9ICgpID0+IHtcbiAgcmV0dXJuIHVzZUFwcFNlbGVjdG9yKHNlbGVjdEFjdGl2ZVRvb2x0aXBEYXRhUG9pbnRzKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY2FsY3VsYXRlZCBkb21haW4gb2YgYW4gWC1heGlzLlxuICpcbiAqIFRoZSBkb21haW4gY2FuIGJlIG51bWVyaWNhbDogYFttaW4sIG1heF1gLCBvciBjYXRlZ29yaWNhbDogYFsnYScsICdiJywgJ2MnXWAuXG4gKlxuICogVGhlIHR5cGUgb2YgdGhlIGRvbWFpbiBpcyBkZWZpbmVkIGJ5IHRoZSBgdHlwZWAgcHJvcCBvZiB0aGUgWEF4aXMuXG4gKlxuICogVGhlIHZhbHVlcyBvZiB0aGUgZG9tYWluIGFyZSBjYWxjdWxhdGVkIGJhc2VkIG9uIHRoZSBkYXRhIGFuZCB0aGUgYGRhdGFLZXlgIG9mIHRoZSBheGlzLlxuICpcbiAqIElmIHRoZSBjaGFydCBoYXMgYSBCcnVzaCwgdGhlIGRvbWFpbiB3aWxsIGJlIGZpbHRlcmVkIHRvIHRoZSBicnVzaGVkIGluZGV4ZXMgaWYgdGhlIGhvb2sgaXMgdXNlZCBvdXRzaWRlIGEgQnJ1c2ggY29udGV4dCxcbiAqIGFuZCB0aGUgZnVsbCBkb21haW4gd2lsbCBiZSByZXR1cm5lZCBpZiB0aGUgaG9vayBpcyB1c2VkIGluc2lkZSBhIEJydXNoIGNvbnRleHQuXG4gKlxuICogQHBhcmFtIHhBeGlzSWQgVGhlIGB4QXhpc0lkYCBvZiB0aGUgWC1heGlzLiBEZWZhdWx0cyB0byBgMGAgaWYgbm90IHByb3ZpZGVkLlxuICogQHJldHVybnMgVGhlIGRvbWFpbiBvZiB0aGUgWC1heGlzLCBvciBgdW5kZWZpbmVkYCBpZiBpdCBjYW5ub3QgYmUgY2FsY3VsYXRlZCBvciBpZiB1c2VkIG91dHNpZGUgYSBjaGFydCBjb250ZXh0LlxuICovXG5leHBvcnQgdmFyIHVzZVhBeGlzRG9tYWluID0gZnVuY3Rpb24gdXNlWEF4aXNEb21haW4oKSB7XG4gIHZhciB4QXhpc0lkID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBkZWZhdWx0QXhpc0lkO1xuICB2YXIgaXNQYW5vcmFtYSA9IHVzZUlzUGFub3JhbWEoKTtcbiAgcmV0dXJuIHVzZUFwcFNlbGVjdG9yKHN0YXRlID0+IHNlbGVjdEF4aXNEb21haW4oc3RhdGUsICd4QXhpcycsIHhBeGlzSWQsIGlzUGFub3JhbWEpKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY2FsY3VsYXRlZCBkb21haW4gb2YgYSBZLWF4aXMuXG4gKlxuICogVGhlIGRvbWFpbiBjYW4gYmUgbnVtZXJpY2FsOiBgW21pbiwgbWF4XWAsIG9yIGNhdGVnb3JpY2FsOiBgWydhJywgJ2InLCAnYyddYC5cbiAqXG4gKiBUaGUgdHlwZSBvZiB0aGUgZG9tYWluIGlzIGRlZmluZWQgYnkgdGhlIGB0eXBlYCBwcm9wIG9mIHRoZSBZQXhpcy5cbiAqXG4gKiBUaGUgdmFsdWVzIG9mIHRoZSBkb21haW4gYXJlIGNhbGN1bGF0ZWQgYmFzZWQgb24gdGhlIGRhdGEgYW5kIHRoZSBgZGF0YUtleWAgb2YgdGhlIGF4aXMuXG4gKlxuICogRG9lcyBub3QgaW50ZXJhY3Qgd2l0aCBCcnVzaGVzLCBhcyBZLWF4ZXMgZG8gbm90IHN1cHBvcnQgYnJ1c2hpbmcuXG4gKlxuICogQHBhcmFtIHlBeGlzSWQgVGhlIGB5QXhpc0lkYCBvZiB0aGUgWS1heGlzLiBEZWZhdWx0cyB0byBgMGAgaWYgbm90IHByb3ZpZGVkLlxuICogQHJldHVybnMgVGhlIGRvbWFpbiBvZiB0aGUgWS1heGlzLCBvciBgdW5kZWZpbmVkYCBpZiBpdCBjYW5ub3QgYmUgY2FsY3VsYXRlZCBvciBpZiB1c2VkIG91dHNpZGUgYSBjaGFydCBjb250ZXh0LlxuICovXG5leHBvcnQgdmFyIHVzZVlBeGlzRG9tYWluID0gZnVuY3Rpb24gdXNlWUF4aXNEb21haW4oKSB7XG4gIHZhciB5QXhpc0lkID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBkZWZhdWx0QXhpc0lkO1xuICB2YXIgaXNQYW5vcmFtYSA9IHVzZUlzUGFub3JhbWEoKTtcbiAgcmV0dXJuIHVzZUFwcFNlbGVjdG9yKHN0YXRlID0+IHNlbGVjdEF4aXNEb21haW4oc3RhdGUsICd5QXhpcycsIHlBeGlzSWQsIGlzUGFub3JhbWEpKTtcbn07IiwiZXhwb3J0IHZhciBkZWZhdWx0UG9sYXJBbmdsZUF4aXNQcm9wcyA9IHtcbiAgYWxsb3dEdXBsaWNhdGVkQ2F0ZWdvcnk6IHRydWUsXG4gIC8vIGlmIEkgc2V0IHRoaXMgdG8gZmFsc2UgdGhlbiBUb29sdGlwIHN5bmNocm9uaXNhdGlvbiBzdG9wcyB3b3JraW5nIGluIFJhZGFyLCB3dGZcbiAgYW5nbGVBeGlzSWQ6IDAsXG4gIGF4aXNMaW5lOiB0cnVlLFxuICBjeDogMCxcbiAgY3k6IDAsXG4gIG9yaWVudGF0aW9uOiAnb3V0ZXInLFxuICByZXZlcnNlZDogZmFsc2UsXG4gIHNjYWxlOiAnYXV0bycsXG4gIHRpY2s6IHRydWUsXG4gIHRpY2tMaW5lOiB0cnVlLFxuICB0aWNrU2l6ZTogOCxcbiAgdHlwZTogJ2NhdGVnb3J5J1xufTsiLCJleHBvcnQgdmFyIGRlZmF1bHRQb2xhclJhZGl1c0F4aXNQcm9wcyA9IHtcbiAgYWxsb3dEYXRhT3ZlcmZsb3c6IGZhbHNlLFxuICBhbGxvd0R1cGxpY2F0ZWRDYXRlZ29yeTogdHJ1ZSxcbiAgYW5nbGU6IDAsXG4gIGF4aXNMaW5lOiB0cnVlLFxuICBjeDogMCxcbiAgY3k6IDAsXG4gIG9yaWVudGF0aW9uOiAncmlnaHQnLFxuICByYWRpdXNBeGlzSWQ6IDAsXG4gIHNjYWxlOiAnYXV0bycsXG4gIHN0cm9rZTogJyNjY2MnLFxuICB0aWNrOiB0cnVlLFxuICB0aWNrQ291bnQ6IDUsXG4gIHR5cGU6ICdudW1iZXInXG59OyIsInZhciBfZXhjbHVkZWQgPSBbXCJvbk1vdXNlRW50ZXJcIiwgXCJvbkNsaWNrXCIsIFwib25Nb3VzZUxlYXZlXCJdLFxuICBfZXhjbHVkZWQyID0gW1wiaWRcIl0sXG4gIF9leGNsdWRlZDMgPSBbXCJpZFwiXTtcbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhlLCB0KSB7IGlmIChudWxsID09IGUpIHJldHVybiB7fTsgdmFyIG8sIHIsIGkgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShlLCB0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG4gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyBmb3IgKHIgPSAwOyByIDwgbi5sZW5ndGg7IHIrKykgbyA9IG5bcl0sIC0xID09PSB0LmluZGV4T2YobykgJiYge30ucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChlLCBvKSAmJiAoaVtvXSA9IGVbb10pOyB9IHJldHVybiBpOyB9XG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShyLCBlKSB7IGlmIChudWxsID09IHIpIHJldHVybiB7fTsgdmFyIHQgPSB7fTsgZm9yICh2YXIgbiBpbiByKSBpZiAoe30uaGFzT3duUHJvcGVydHkuY2FsbChyLCBuKSkgeyBpZiAoLTEgIT09IGUuaW5kZXhPZihuKSkgY29udGludWU7IHRbbl0gPSByW25dOyB9IHJldHVybiB0OyB9XG5mdW5jdGlvbiBvd25LZXlzKGUsIHIpIHsgdmFyIHQgPSBPYmplY3Qua2V5cyhlKTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG8gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyByICYmIChvID0gby5maWx0ZXIoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZSwgcikuZW51bWVyYWJsZTsgfSkpLCB0LnB1c2guYXBwbHkodCwgbyk7IH0gcmV0dXJuIHQ7IH1cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQoZSkgeyBmb3IgKHZhciByID0gMTsgciA8IGFyZ3VtZW50cy5sZW5ndGg7IHIrKykgeyB2YXIgdCA9IG51bGwgIT0gYXJndW1lbnRzW3JdID8gYXJndW1lbnRzW3JdIDoge307IHIgJSAyID8gb3duS2V5cyhPYmplY3QodCksICEwKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0W3JdKTsgfSkgOiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGUsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHQpKSA6IG93bktleXMoT2JqZWN0KHQpKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHQsIHIpKTsgfSk7IH0gcmV0dXJuIGU7IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0KSB7IHJldHVybiAociA9IF90b1Byb3BlcnR5S2V5KHIpKSBpbiBlID8gT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIHsgdmFsdWU6IHQsIGVudW1lcmFibGU6ICEwLCBjb25maWd1cmFibGU6ICEwLCB3cml0YWJsZTogITAgfSkgOiBlW3JdID0gdCwgZTsgfVxuZnVuY3Rpb24gX3RvUHJvcGVydHlLZXkodCkgeyB2YXIgaSA9IF90b1ByaW1pdGl2ZSh0LCBcInN0cmluZ1wiKTsgcmV0dXJuIFwic3ltYm9sXCIgPT0gdHlwZW9mIGkgPyBpIDogaSArIFwiXCI7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZSh0LCByKSB7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiB0IHx8ICF0KSByZXR1cm4gdDsgdmFyIGUgPSB0W1N5bWJvbC50b1ByaW1pdGl2ZV07IGlmICh2b2lkIDAgIT09IGUpIHsgdmFyIGkgPSBlLmNhbGwodCwgciB8fCBcImRlZmF1bHRcIik7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiBpKSByZXR1cm4gaTsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpOyB9IHJldHVybiAoXCJzdHJpbmdcIiA9PT0gciA/IFN0cmluZyA6IE51bWJlcikodCk7IH1cbmZ1bmN0aW9uIF9leHRlbmRzKCkgeyByZXR1cm4gX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduID8gT2JqZWN0LmFzc2lnbi5iaW5kKCkgOiBmdW5jdGlvbiAobikgeyBmb3IgKHZhciBlID0gMTsgZSA8IGFyZ3VtZW50cy5sZW5ndGg7IGUrKykgeyB2YXIgdCA9IGFyZ3VtZW50c1tlXTsgZm9yICh2YXIgciBpbiB0KSAoe30pLmhhc093blByb3BlcnR5LmNhbGwodCwgcikgJiYgKG5bcl0gPSB0W3JdKTsgfSByZXR1cm4gbjsgfSwgX2V4dGVuZHMuYXBwbHkobnVsbCwgYXJndW1lbnRzKTsgfVxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlQ2FsbGJhY2ssIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgZ2V0IGZyb20gJ2VzLXRvb2xraXQvY29tcGF0L2dldCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBzZWxlY3RQaWVMZWdlbmQsIHNlbGVjdFBpZVNlY3RvcnMgfSBmcm9tICcuLi9zdGF0ZS9zZWxlY3RvcnMvcGllU2VsZWN0b3JzJztcbmltcG9ydCB7IHVzZUFwcFNlbGVjdG9yIH0gZnJvbSAnLi4vc3RhdGUvaG9va3MnO1xuaW1wb3J0IHsgTGF5ZXIgfSBmcm9tICcuLi9jb250YWluZXIvTGF5ZXInO1xuaW1wb3J0IHsgQ3VydmUgfSBmcm9tICcuLi9zaGFwZS9DdXJ2ZSc7XG5pbXBvcnQgeyBUZXh0IH0gZnJvbSAnLi4vY29tcG9uZW50L1RleHQnO1xuaW1wb3J0IHsgQ2VsbCB9IGZyb20gJy4uL2NvbXBvbmVudC9DZWxsJztcbmltcG9ydCB7IGZpbmRBbGxCeVR5cGUgfSBmcm9tICcuLi91dGlsL1JlYWN0VXRpbHMnO1xuaW1wb3J0IHsgR2xvYmFsIH0gZnJvbSAnLi4vdXRpbC9HbG9iYWwnO1xuaW1wb3J0IHsgZ2V0TWF4UmFkaXVzLCBwb2xhclRvQ2FydGVzaWFuIH0gZnJvbSAnLi4vdXRpbC9Qb2xhclV0aWxzJztcbmltcG9ydCB7IGdldFBlcmNlbnRWYWx1ZSwgaW50ZXJwb2xhdGUsIGlzTnVtYmVyLCBtYXRoU2lnbiB9IGZyb20gJy4uL3V0aWwvRGF0YVV0aWxzJztcbmltcG9ydCB7IGdldFRvb2x0aXBOYW1lUHJvcCwgZ2V0VmFsdWVCeURhdGFLZXkgfSBmcm9tICcuLi91dGlsL0NoYXJ0VXRpbHMnO1xuaW1wb3J0IHsgYWRhcHRFdmVudHNPZkNoaWxkIH0gZnJvbSAnLi4vdXRpbC90eXBlcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uL3V0aWwvQWN0aXZlU2hhcGVVdGlscyc7XG5pbXBvcnQgeyB1c2VNb3VzZUNsaWNrSXRlbURpc3BhdGNoLCB1c2VNb3VzZUVudGVySXRlbURpc3BhdGNoLCB1c2VNb3VzZUxlYXZlSXRlbURpc3BhdGNoIH0gZnJvbSAnLi4vY29udGV4dC90b29sdGlwQ29udGV4dCc7XG5pbXBvcnQgeyBTZXRUb29sdGlwRW50cnlTZXR0aW5ncyB9IGZyb20gJy4uL3N0YXRlL1NldFRvb2x0aXBFbnRyeVNldHRpbmdzJztcbmltcG9ydCB7IHNlbGVjdEFjdGl2ZVRvb2x0aXBJbmRleCB9IGZyb20gJy4uL3N0YXRlL3NlbGVjdG9ycy90b29sdGlwU2VsZWN0b3JzJztcbmltcG9ydCB7IFNldFBvbGFyTGVnZW5kUGF5bG9hZCB9IGZyb20gJy4uL3N0YXRlL1NldExlZ2VuZFBheWxvYWQnO1xuaW1wb3J0IHsgREFUQV9JVEVNX0RBVEFLRVlfQVRUUklCVVRFX05BTUUsIERBVEFfSVRFTV9JTkRFWF9BVFRSSUJVVEVfTkFNRSB9IGZyb20gJy4uL3V0aWwvQ29uc3RhbnRzJztcbmltcG9ydCB7IHVzZUFuaW1hdGlvbklkIH0gZnJvbSAnLi4vdXRpbC91c2VBbmltYXRpb25JZCc7XG5pbXBvcnQgeyByZXNvbHZlRGVmYXVsdFByb3BzIH0gZnJvbSAnLi4vdXRpbC9yZXNvbHZlRGVmYXVsdFByb3BzJztcbmltcG9ydCB7IFJlZ2lzdGVyR3JhcGhpY2FsSXRlbUlkIH0gZnJvbSAnLi4vY29udGV4dC9SZWdpc3RlckdyYXBoaWNhbEl0ZW1JZCc7XG5pbXBvcnQgeyBTZXRQb2xhckdyYXBoaWNhbEl0ZW0gfSBmcm9tICcuLi9zdGF0ZS9TZXRHcmFwaGljYWxJdGVtJztcbmltcG9ydCB7IHN2Z1Byb3BlcnRpZXNOb0V2ZW50cywgc3ZnUHJvcGVydGllc05vRXZlbnRzRnJvbVVua25vd24gfSBmcm9tICcuLi91dGlsL3N2Z1Byb3BlcnRpZXNOb0V2ZW50cyc7XG5pbXBvcnQgeyBKYXZhc2NyaXB0QW5pbWF0ZSB9IGZyb20gJy4uL2FuaW1hdGlvbi9KYXZhc2NyaXB0QW5pbWF0ZSc7XG5pbXBvcnQgeyBMYWJlbExpc3RGcm9tTGFiZWxQcm9wLCBQb2xhckxhYmVsTGlzdENvbnRleHRQcm92aWRlciB9IGZyb20gJy4uL2NvbXBvbmVudC9MYWJlbExpc3QnO1xuXG4vKipcbiAqIFRoZSBgbGFiZWxgIHByb3AgaW4gUGllIGFjY2VwdHMgYSB2YXJpZXR5IG9mIGFsdGVybmF0aXZlcy5cbiAqL1xuXG4vKipcbiAqIEludGVybmFsIHByb3BzLCBjb21iaW5hdGlvbiBvZiBleHRlcm5hbCBwcm9wcyArIGRlZmF1bHRQcm9wcyArIHByaXZhdGUgUmVjaGFydHMgc3RhdGVcbiAqL1xuXG5mdW5jdGlvbiBTZXRQaWVQYXlsb2FkTGVnZW5kKHByb3BzKSB7XG4gIHZhciBjZWxscyA9IHVzZU1lbW8oKCkgPT4gZmluZEFsbEJ5VHlwZShwcm9wcy5jaGlsZHJlbiwgQ2VsbCksIFtwcm9wcy5jaGlsZHJlbl0pO1xuICB2YXIgbGVnZW5kUGF5bG9hZCA9IHVzZUFwcFNlbGVjdG9yKHN0YXRlID0+IHNlbGVjdFBpZUxlZ2VuZChzdGF0ZSwgcHJvcHMuaWQsIGNlbGxzKSk7XG4gIGlmIChsZWdlbmRQYXlsb2FkID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2V0UG9sYXJMZWdlbmRQYXlsb2FkLCB7XG4gICAgbGVnZW5kUGF5bG9hZDogbGVnZW5kUGF5bG9hZFxuICB9KTtcbn1cbmZ1bmN0aW9uIGdldFRvb2x0aXBFbnRyeVNldHRpbmdzKHByb3BzKSB7XG4gIHZhciB7XG4gICAgZGF0YUtleSxcbiAgICBuYW1lS2V5LFxuICAgIHNlY3RvcnMsXG4gICAgc3Ryb2tlLFxuICAgIHN0cm9rZVdpZHRoLFxuICAgIGZpbGwsXG4gICAgbmFtZSxcbiAgICBoaWRlLFxuICAgIHRvb2x0aXBUeXBlXG4gIH0gPSBwcm9wcztcbiAgcmV0dXJuIHtcbiAgICBkYXRhRGVmaW5lZE9uSXRlbTogc2VjdG9ycy5tYXAocCA9PiBwLnRvb2x0aXBQYXlsb2FkKSxcbiAgICBwb3NpdGlvbnM6IHNlY3RvcnMubWFwKHAgPT4gcC50b29sdGlwUG9zaXRpb24pLFxuICAgIHNldHRpbmdzOiB7XG4gICAgICBzdHJva2UsXG4gICAgICBzdHJva2VXaWR0aCxcbiAgICAgIGZpbGwsXG4gICAgICBkYXRhS2V5LFxuICAgICAgbmFtZUtleSxcbiAgICAgIG5hbWU6IGdldFRvb2x0aXBOYW1lUHJvcChuYW1lLCBkYXRhS2V5KSxcbiAgICAgIGhpZGUsXG4gICAgICB0eXBlOiB0b29sdGlwVHlwZSxcbiAgICAgIGNvbG9yOiBmaWxsLFxuICAgICAgdW5pdDogJycgLy8gd2h5IGRvZXNuJ3QgUGllIHN1cHBvcnQgdW5pdD9cbiAgICB9XG4gIH07XG59XG52YXIgZ2V0VGV4dEFuY2hvciA9ICh4LCBjeCkgPT4ge1xuICBpZiAoeCA+IGN4KSB7XG4gICAgcmV0dXJuICdzdGFydCc7XG4gIH1cbiAgaWYgKHggPCBjeCkge1xuICAgIHJldHVybiAnZW5kJztcbiAgfVxuICByZXR1cm4gJ21pZGRsZSc7XG59O1xudmFyIGdldE91dGVyUmFkaXVzID0gKGRhdGFQb2ludCwgb3V0ZXJSYWRpdXMsIG1heFBpZVJhZGl1cykgPT4ge1xuICBpZiAodHlwZW9mIG91dGVyUmFkaXVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGdldFBlcmNlbnRWYWx1ZShvdXRlclJhZGl1cyhkYXRhUG9pbnQpLCBtYXhQaWVSYWRpdXMsIG1heFBpZVJhZGl1cyAqIDAuOCk7XG4gIH1cbiAgcmV0dXJuIGdldFBlcmNlbnRWYWx1ZShvdXRlclJhZGl1cywgbWF4UGllUmFkaXVzLCBtYXhQaWVSYWRpdXMgKiAwLjgpO1xufTtcbnZhciBwYXJzZUNvb3JkaW5hdGVPZlBpZSA9IChwaWVTZXR0aW5ncywgb2Zmc2V0LCBkYXRhUG9pbnQpID0+IHtcbiAgdmFyIHtcbiAgICB0b3AsXG4gICAgbGVmdCxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHRcbiAgfSA9IG9mZnNldDtcbiAgdmFyIG1heFBpZVJhZGl1cyA9IGdldE1heFJhZGl1cyh3aWR0aCwgaGVpZ2h0KTtcbiAgdmFyIGN4ID0gbGVmdCArIGdldFBlcmNlbnRWYWx1ZShwaWVTZXR0aW5ncy5jeCwgd2lkdGgsIHdpZHRoIC8gMik7XG4gIHZhciBjeSA9IHRvcCArIGdldFBlcmNlbnRWYWx1ZShwaWVTZXR0aW5ncy5jeSwgaGVpZ2h0LCBoZWlnaHQgLyAyKTtcbiAgdmFyIGlubmVyUmFkaXVzID0gZ2V0UGVyY2VudFZhbHVlKHBpZVNldHRpbmdzLmlubmVyUmFkaXVzLCBtYXhQaWVSYWRpdXMsIDApO1xuICB2YXIgb3V0ZXJSYWRpdXMgPSBnZXRPdXRlclJhZGl1cyhkYXRhUG9pbnQsIHBpZVNldHRpbmdzLm91dGVyUmFkaXVzLCBtYXhQaWVSYWRpdXMpO1xuICB2YXIgbWF4UmFkaXVzID0gcGllU2V0dGluZ3MubWF4UmFkaXVzIHx8IE1hdGguc3FydCh3aWR0aCAqIHdpZHRoICsgaGVpZ2h0ICogaGVpZ2h0KSAvIDI7XG4gIHJldHVybiB7XG4gICAgY3gsXG4gICAgY3ksXG4gICAgaW5uZXJSYWRpdXMsXG4gICAgb3V0ZXJSYWRpdXMsXG4gICAgbWF4UmFkaXVzXG4gIH07XG59O1xudmFyIHBhcnNlRGVsdGFBbmdsZSA9IChzdGFydEFuZ2xlLCBlbmRBbmdsZSkgPT4ge1xuICB2YXIgc2lnbiA9IG1hdGhTaWduKGVuZEFuZ2xlIC0gc3RhcnRBbmdsZSk7XG4gIHZhciBkZWx0YUFuZ2xlID0gTWF0aC5taW4oTWF0aC5hYnMoZW5kQW5nbGUgLSBzdGFydEFuZ2xlKSwgMzYwKTtcbiAgcmV0dXJuIHNpZ24gKiBkZWx0YUFuZ2xlO1xufTtcbmZ1bmN0aW9uIGdldENsYXNzTmFtZVByb3BlcnR5SWZFeGlzdHModSkge1xuICBpZiAodSAmJiB0eXBlb2YgdSA9PT0gJ29iamVjdCcgJiYgJ2NsYXNzTmFtZScgaW4gdSAmJiB0eXBlb2YgdS5jbGFzc05hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHUuY2xhc3NOYW1lO1xuICB9XG4gIHJldHVybiAnJztcbn1cbnZhciByZW5kZXJMYWJlbExpbmVJdGVtID0gKG9wdGlvbiwgcHJvcHMpID0+IHtcbiAgaWYgKC8qI19fUFVSRV9fKi9SZWFjdC5pc1ZhbGlkRWxlbWVudChvcHRpb24pKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB3ZSBjYW4ndCBrbm93IGlmIHRoZSB0eXBlIG9mIHByb3BzIG1hdGNoZXMgdGhlIGVsZW1lbnRcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNsb25lRWxlbWVudChvcHRpb24sIHByb3BzKTtcbiAgfVxuICBpZiAodHlwZW9mIG9wdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBvcHRpb24ocHJvcHMpO1xuICB9XG4gIHZhciBjbGFzc05hbWUgPSBjbHN4KCdyZWNoYXJ0cy1waWUtbGFiZWwtbGluZScsIHR5cGVvZiBvcHRpb24gIT09ICdib29sZWFuJyA/IG9wdGlvbi5jbGFzc05hbWUgOiAnJyk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChDdXJ2ZSwgX2V4dGVuZHMoe30sIHByb3BzLCB7XG4gICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICBjbGFzc05hbWU6IGNsYXNzTmFtZVxuICB9KSk7XG59O1xudmFyIHJlbmRlckxhYmVsSXRlbSA9IChvcHRpb24sIHByb3BzLCB2YWx1ZSkgPT4ge1xuICBpZiAoLyojX19QVVJFX18qL1JlYWN0LmlzVmFsaWRFbGVtZW50KG9wdGlvbikpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGVsZW1lbnQgY2xvbmluZyBpcyBub3QgdHlwZWRcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNsb25lRWxlbWVudChvcHRpb24sIHByb3BzKTtcbiAgfVxuICB2YXIgbGFiZWwgPSB2YWx1ZTtcbiAgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICBsYWJlbCA9IG9wdGlvbihwcm9wcyk7XG4gICAgaWYgKC8qI19fUFVSRV9fKi9SZWFjdC5pc1ZhbGlkRWxlbWVudChsYWJlbCkpIHtcbiAgICAgIHJldHVybiBsYWJlbDtcbiAgICB9XG4gIH1cbiAgdmFyIGNsYXNzTmFtZSA9IGNsc3goJ3JlY2hhcnRzLXBpZS1sYWJlbC10ZXh0JywgZ2V0Q2xhc3NOYW1lUHJvcGVydHlJZkV4aXN0cyhvcHRpb24pKTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFRleHQsIF9leHRlbmRzKHt9LCBwcm9wcywge1xuICAgIGFsaWdubWVudEJhc2VsaW5lOiBcIm1pZGRsZVwiLFxuICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lXG4gIH0pLCBsYWJlbCk7XG59O1xuZnVuY3Rpb24gUGllTGFiZWxzKF9yZWYpIHtcbiAgdmFyIHtcbiAgICBzZWN0b3JzLFxuICAgIHByb3BzLFxuICAgIHNob3dMYWJlbHNcbiAgfSA9IF9yZWY7XG4gIHZhciB7XG4gICAgbGFiZWwsXG4gICAgbGFiZWxMaW5lLFxuICAgIGRhdGFLZXlcbiAgfSA9IHByb3BzO1xuICBpZiAoIXNob3dMYWJlbHMgfHwgIWxhYmVsIHx8ICFzZWN0b3JzKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIHBpZVByb3BzID0gc3ZnUHJvcGVydGllc05vRXZlbnRzKHByb3BzKTtcbiAgdmFyIGN1c3RvbUxhYmVsUHJvcHMgPSBzdmdQcm9wZXJ0aWVzTm9FdmVudHNGcm9tVW5rbm93bihsYWJlbCk7XG4gIHZhciBjdXN0b21MYWJlbExpbmVQcm9wcyA9IHN2Z1Byb3BlcnRpZXNOb0V2ZW50c0Zyb21Vbmtub3duKGxhYmVsTGluZSk7XG4gIHZhciBvZmZzZXRSYWRpdXMgPSB0eXBlb2YgbGFiZWwgPT09ICdvYmplY3QnICYmICdvZmZzZXRSYWRpdXMnIGluIGxhYmVsICYmIHR5cGVvZiBsYWJlbC5vZmZzZXRSYWRpdXMgPT09ICdudW1iZXInICYmIGxhYmVsLm9mZnNldFJhZGl1cyB8fCAyMDtcbiAgdmFyIGxhYmVscyA9IHNlY3RvcnMubWFwKChlbnRyeSwgaSkgPT4ge1xuICAgIHZhciBtaWRBbmdsZSA9IChlbnRyeS5zdGFydEFuZ2xlICsgZW50cnkuZW5kQW5nbGUpIC8gMjtcbiAgICB2YXIgZW5kUG9pbnQgPSBwb2xhclRvQ2FydGVzaWFuKGVudHJ5LmN4LCBlbnRyeS5jeSwgZW50cnkub3V0ZXJSYWRpdXMgKyBvZmZzZXRSYWRpdXMsIG1pZEFuZ2xlKTtcbiAgICB2YXIgbGFiZWxQcm9wcyA9IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIHBpZVByb3BzKSwgZW50cnkpLCB7fSwge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBjdXN0b21MYWJlbFByb3BzIGlzIGNvbnRyaWJ1dGluZyB1bmtub3duIHByb3BzXG4gICAgICBzdHJva2U6ICdub25lJ1xuICAgIH0sIGN1c3RvbUxhYmVsUHJvcHMpLCB7fSwge1xuICAgICAgaW5kZXg6IGksXG4gICAgICB0ZXh0QW5jaG9yOiBnZXRUZXh0QW5jaG9yKGVuZFBvaW50LngsIGVudHJ5LmN4KVxuICAgIH0sIGVuZFBvaW50KTtcbiAgICB2YXIgbGluZVByb3BzID0gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgcGllUHJvcHMpLCBlbnRyeSksIHt9LCB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGN1c3RvbUxhYmVsTGluZVByb3BzIGlzIGNvbnRyaWJ1dGluZyB1bmtub3duIHByb3BzXG4gICAgICBmaWxsOiAnbm9uZScsXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGN1c3RvbUxhYmVsTGluZVByb3BzIGlzIGNvbnRyaWJ1dGluZyB1bmtub3duIHByb3BzXG4gICAgICBzdHJva2U6IGVudHJ5LmZpbGxcbiAgICB9LCBjdXN0b21MYWJlbExpbmVQcm9wcyksIHt9LCB7XG4gICAgICBpbmRleDogaSxcbiAgICAgIHBvaW50czogW3BvbGFyVG9DYXJ0ZXNpYW4oZW50cnkuY3gsIGVudHJ5LmN5LCBlbnRyeS5vdXRlclJhZGl1cywgbWlkQW5nbGUpLCBlbmRQb2ludF0sXG4gICAgICBrZXk6ICdsaW5lJ1xuICAgIH0pO1xuICAgIHJldHVybiAoXG4gICAgICAvKiNfX1BVUkVfXyovXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3Qvbm8tYXJyYXktaW5kZXgta2V5XG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KExheWVyLCB7XG4gICAgICAgIGtleTogXCJsYWJlbC1cIi5jb25jYXQoZW50cnkuc3RhcnRBbmdsZSwgXCItXCIpLmNvbmNhdChlbnRyeS5lbmRBbmdsZSwgXCItXCIpLmNvbmNhdChlbnRyeS5taWRBbmdsZSwgXCItXCIpLmNvbmNhdChpKVxuICAgICAgfSwgbGFiZWxMaW5lICYmIHJlbmRlckxhYmVsTGluZUl0ZW0obGFiZWxMaW5lLCBsaW5lUHJvcHMpLCByZW5kZXJMYWJlbEl0ZW0obGFiZWwsIGxhYmVsUHJvcHMsIGdldFZhbHVlQnlEYXRhS2V5KGVudHJ5LCBkYXRhS2V5KSkpXG4gICAgKTtcbiAgfSk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwge1xuICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1waWUtbGFiZWxzXCJcbiAgfSwgbGFiZWxzKTtcbn1cbmZ1bmN0aW9uIFBpZUxhYmVsTGlzdChfcmVmMikge1xuICB2YXIge1xuICAgIHNlY3RvcnMsXG4gICAgcHJvcHMsXG4gICAgc2hvd0xhYmVsc1xuICB9ID0gX3JlZjI7XG4gIHZhciB7XG4gICAgbGFiZWxcbiAgfSA9IHByb3BzO1xuICBpZiAodHlwZW9mIGxhYmVsID09PSAnb2JqZWN0JyAmJiBsYWJlbCAhPSBudWxsICYmICdwb3NpdGlvbicgaW4gbGFiZWwpIHtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGFiZWxMaXN0RnJvbUxhYmVsUHJvcCwge1xuICAgICAgbGFiZWw6IGxhYmVsXG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFBpZUxhYmVscywge1xuICAgIHNlY3RvcnM6IHNlY3RvcnMsXG4gICAgcHJvcHM6IHByb3BzLFxuICAgIHNob3dMYWJlbHM6IHNob3dMYWJlbHNcbiAgfSk7XG59XG5mdW5jdGlvbiBQaWVTZWN0b3JzKHByb3BzKSB7XG4gIHZhciB7XG4gICAgc2VjdG9ycyxcbiAgICBhY3RpdmVTaGFwZSxcbiAgICBpbmFjdGl2ZVNoYXBlOiBpbmFjdGl2ZVNoYXBlUHJvcCxcbiAgICBhbGxPdGhlclBpZVByb3BzXG4gIH0gPSBwcm9wcztcbiAgdmFyIGFjdGl2ZUluZGV4ID0gdXNlQXBwU2VsZWN0b3Ioc2VsZWN0QWN0aXZlVG9vbHRpcEluZGV4KTtcbiAgdmFyIHtcbiAgICAgIG9uTW91c2VFbnRlcjogb25Nb3VzZUVudGVyRnJvbVByb3BzLFxuICAgICAgb25DbGljazogb25JdGVtQ2xpY2tGcm9tUHJvcHMsXG4gICAgICBvbk1vdXNlTGVhdmU6IG9uTW91c2VMZWF2ZUZyb21Qcm9wc1xuICAgIH0gPSBhbGxPdGhlclBpZVByb3BzLFxuICAgIHJlc3RPZkFsbE90aGVyUHJvcHMgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoYWxsT3RoZXJQaWVQcm9wcywgX2V4Y2x1ZGVkKTtcbiAgdmFyIG9uTW91c2VFbnRlckZyb21Db250ZXh0ID0gdXNlTW91c2VFbnRlckl0ZW1EaXNwYXRjaChvbk1vdXNlRW50ZXJGcm9tUHJvcHMsIGFsbE90aGVyUGllUHJvcHMuZGF0YUtleSk7XG4gIHZhciBvbk1vdXNlTGVhdmVGcm9tQ29udGV4dCA9IHVzZU1vdXNlTGVhdmVJdGVtRGlzcGF0Y2gob25Nb3VzZUxlYXZlRnJvbVByb3BzKTtcbiAgdmFyIG9uQ2xpY2tGcm9tQ29udGV4dCA9IHVzZU1vdXNlQ2xpY2tJdGVtRGlzcGF0Y2gob25JdGVtQ2xpY2tGcm9tUHJvcHMsIGFsbE90aGVyUGllUHJvcHMuZGF0YUtleSk7XG4gIGlmIChzZWN0b3JzID09IG51bGwgfHwgc2VjdG9ycy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRnJhZ21lbnQsIG51bGwsIHNlY3RvcnMubWFwKChlbnRyeSwgaSkgPT4ge1xuICAgIGlmICgoZW50cnkgPT09IG51bGwgfHwgZW50cnkgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGVudHJ5LnN0YXJ0QW5nbGUpID09PSAwICYmIChlbnRyeSA9PT0gbnVsbCB8fCBlbnRyeSA9PT0gdm9pZCAwID8gdm9pZCAwIDogZW50cnkuZW5kQW5nbGUpID09PSAwICYmIHNlY3RvcnMubGVuZ3RoICE9PSAxKSByZXR1cm4gbnVsbDtcbiAgICB2YXIgaXNTZWN0b3JBY3RpdmUgPSBhY3RpdmVTaGFwZSAmJiBTdHJpbmcoaSkgPT09IGFjdGl2ZUluZGV4O1xuICAgIHZhciBpbmFjdGl2ZVNoYXBlID0gYWN0aXZlSW5kZXggPyBpbmFjdGl2ZVNoYXBlUHJvcCA6IG51bGw7XG4gICAgdmFyIHNlY3Rvck9wdGlvbnMgPSBpc1NlY3RvckFjdGl2ZSA/IGFjdGl2ZVNoYXBlIDogaW5hY3RpdmVTaGFwZTtcbiAgICB2YXIgc2VjdG9yUHJvcHMgPSBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGVudHJ5KSwge30sIHtcbiAgICAgIHN0cm9rZTogZW50cnkuc3Ryb2tlLFxuICAgICAgdGFiSW5kZXg6IC0xLFxuICAgICAgW0RBVEFfSVRFTV9JTkRFWF9BVFRSSUJVVEVfTkFNRV06IGksXG4gICAgICBbREFUQV9JVEVNX0RBVEFLRVlfQVRUUklCVVRFX05BTUVdOiBhbGxPdGhlclBpZVByb3BzLmRhdGFLZXlcbiAgICB9KTtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGF5ZXJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3Qvbm8tYXJyYXktaW5kZXgta2V5XG4gICAgLCBfZXh0ZW5kcyh7XG4gICAgICBrZXk6IFwic2VjdG9yLVwiLmNvbmNhdChlbnRyeSA9PT0gbnVsbCB8fCBlbnRyeSA9PT0gdm9pZCAwID8gdm9pZCAwIDogZW50cnkuc3RhcnRBbmdsZSwgXCItXCIpLmNvbmNhdChlbnRyeSA9PT0gbnVsbCB8fCBlbnRyeSA9PT0gdm9pZCAwID8gdm9pZCAwIDogZW50cnkuZW5kQW5nbGUsIFwiLVwiKS5jb25jYXQoZW50cnkubWlkQW5nbGUsIFwiLVwiKS5jb25jYXQoaSksXG4gICAgICB0YWJJbmRleDogLTEsXG4gICAgICBjbGFzc05hbWU6IFwicmVjaGFydHMtcGllLXNlY3RvclwiXG4gICAgfSwgYWRhcHRFdmVudHNPZkNoaWxkKHJlc3RPZkFsbE90aGVyUHJvcHMsIGVudHJ5LCBpKSwge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0aGUgdHlwZXMgbmVlZCBhIGJpdCBvZiBhdHRlbnRpb25cbiAgICAgIG9uTW91c2VFbnRlcjogb25Nb3VzZUVudGVyRnJvbUNvbnRleHQoZW50cnksIGkpXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRoZSB0eXBlcyBuZWVkIGEgYml0IG9mIGF0dGVudGlvblxuICAgICAgLFxuICAgICAgb25Nb3VzZUxlYXZlOiBvbk1vdXNlTGVhdmVGcm9tQ29udGV4dChlbnRyeSwgaSlcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdGhlIHR5cGVzIG5lZWQgYSBiaXQgb2YgYXR0ZW50aW9uXG4gICAgICAsXG4gICAgICBvbkNsaWNrOiBvbkNsaWNrRnJvbUNvbnRleHQoZW50cnksIGkpXG4gICAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFNoYXBlLCBfZXh0ZW5kcyh7XG4gICAgICBvcHRpb246IHNlY3Rvck9wdGlvbnMsXG4gICAgICBpc0FjdGl2ZTogaXNTZWN0b3JBY3RpdmUsXG4gICAgICBzaGFwZVR5cGU6IFwic2VjdG9yXCJcbiAgICB9LCBzZWN0b3JQcm9wcykpKTtcbiAgfSkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVQaWVTZWN0b3JzKF9yZWYzKSB7XG4gIHZhciBfcGllU2V0dGluZ3MkcGFkZGluZ0E7XG4gIHZhciB7XG4gICAgcGllU2V0dGluZ3MsXG4gICAgZGlzcGxheWVkRGF0YSxcbiAgICBjZWxscyxcbiAgICBvZmZzZXRcbiAgfSA9IF9yZWYzO1xuICB2YXIge1xuICAgIGNvcm5lclJhZGl1cyxcbiAgICBzdGFydEFuZ2xlLFxuICAgIGVuZEFuZ2xlLFxuICAgIGRhdGFLZXksXG4gICAgbmFtZUtleSxcbiAgICB0b29sdGlwVHlwZVxuICB9ID0gcGllU2V0dGluZ3M7XG4gIHZhciBtaW5BbmdsZSA9IE1hdGguYWJzKHBpZVNldHRpbmdzLm1pbkFuZ2xlKTtcbiAgdmFyIGRlbHRhQW5nbGUgPSBwYXJzZURlbHRhQW5nbGUoc3RhcnRBbmdsZSwgZW5kQW5nbGUpO1xuICB2YXIgYWJzRGVsdGFBbmdsZSA9IE1hdGguYWJzKGRlbHRhQW5nbGUpO1xuICB2YXIgcGFkZGluZ0FuZ2xlID0gZGlzcGxheWVkRGF0YS5sZW5ndGggPD0gMSA/IDAgOiAoX3BpZVNldHRpbmdzJHBhZGRpbmdBID0gcGllU2V0dGluZ3MucGFkZGluZ0FuZ2xlKSAhPT0gbnVsbCAmJiBfcGllU2V0dGluZ3MkcGFkZGluZ0EgIT09IHZvaWQgMCA/IF9waWVTZXR0aW5ncyRwYWRkaW5nQSA6IDA7XG4gIHZhciBub3RaZXJvSXRlbUNvdW50ID0gZGlzcGxheWVkRGF0YS5maWx0ZXIoZW50cnkgPT4gZ2V0VmFsdWVCeURhdGFLZXkoZW50cnksIGRhdGFLZXksIDApICE9PSAwKS5sZW5ndGg7XG4gIHZhciB0b3RhbFBhZGRpbmdBbmdsZSA9IChhYnNEZWx0YUFuZ2xlID49IDM2MCA/IG5vdFplcm9JdGVtQ291bnQgOiBub3RaZXJvSXRlbUNvdW50IC0gMSkgKiBwYWRkaW5nQW5nbGU7XG4gIHZhciByZWFsVG90YWxBbmdsZSA9IGFic0RlbHRhQW5nbGUgLSBub3RaZXJvSXRlbUNvdW50ICogbWluQW5nbGUgLSB0b3RhbFBhZGRpbmdBbmdsZTtcbiAgdmFyIHN1bSA9IGRpc3BsYXllZERhdGEucmVkdWNlKChyZXN1bHQsIGVudHJ5KSA9PiB7XG4gICAgdmFyIHZhbCA9IGdldFZhbHVlQnlEYXRhS2V5KGVudHJ5LCBkYXRhS2V5LCAwKTtcbiAgICByZXR1cm4gcmVzdWx0ICsgKGlzTnVtYmVyKHZhbCkgPyB2YWwgOiAwKTtcbiAgfSwgMCk7XG4gIHZhciBzZWN0b3JzO1xuICBpZiAoc3VtID4gMCkge1xuICAgIHZhciBwcmV2O1xuICAgIHNlY3RvcnMgPSBkaXNwbGF5ZWREYXRhLm1hcCgoZW50cnksIGkpID0+IHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgZ2V0VmFsdWVCeURhdGFLZXkgZG9lcyBub3QgdmFsaWRhdGUgdGhlIG91dHB1dCB0eXBlXG4gICAgICB2YXIgdmFsID0gZ2V0VmFsdWVCeURhdGFLZXkoZW50cnksIGRhdGFLZXksIDApO1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBnZXRWYWx1ZUJ5RGF0YUtleSBkb2VzIG5vdCB2YWxpZGF0ZSB0aGUgb3V0cHV0IHR5cGVcbiAgICAgIHZhciBuYW1lID0gZ2V0VmFsdWVCeURhdGFLZXkoZW50cnksIG5hbWVLZXksIGkpO1xuICAgICAgdmFyIGNvb3JkaW5hdGUgPSBwYXJzZUNvb3JkaW5hdGVPZlBpZShwaWVTZXR0aW5ncywgb2Zmc2V0LCBlbnRyeSk7XG4gICAgICB2YXIgcGVyY2VudCA9IChpc051bWJlcih2YWwpID8gdmFsIDogMCkgLyBzdW07XG4gICAgICB2YXIgdGVtcFN0YXJ0QW5nbGU7XG4gICAgICB2YXIgZW50cnlXaXRoQ2VsbEluZm8gPSBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGVudHJ5KSwgY2VsbHMgJiYgY2VsbHNbaV0gJiYgY2VsbHNbaV0ucHJvcHMpO1xuICAgICAgaWYgKGkpIHtcbiAgICAgICAgdGVtcFN0YXJ0QW5nbGUgPSBwcmV2LmVuZEFuZ2xlICsgbWF0aFNpZ24oZGVsdGFBbmdsZSkgKiBwYWRkaW5nQW5nbGUgKiAodmFsICE9PSAwID8gMSA6IDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGVtcFN0YXJ0QW5nbGUgPSBzdGFydEFuZ2xlO1xuICAgICAgfVxuICAgICAgdmFyIHRlbXBFbmRBbmdsZSA9IHRlbXBTdGFydEFuZ2xlICsgbWF0aFNpZ24oZGVsdGFBbmdsZSkgKiAoKHZhbCAhPT0gMCA/IG1pbkFuZ2xlIDogMCkgKyBwZXJjZW50ICogcmVhbFRvdGFsQW5nbGUpO1xuICAgICAgdmFyIG1pZEFuZ2xlID0gKHRlbXBTdGFydEFuZ2xlICsgdGVtcEVuZEFuZ2xlKSAvIDI7XG4gICAgICB2YXIgbWlkZGxlUmFkaXVzID0gKGNvb3JkaW5hdGUuaW5uZXJSYWRpdXMgKyBjb29yZGluYXRlLm91dGVyUmFkaXVzKSAvIDI7XG4gICAgICB2YXIgdG9vbHRpcFBheWxvYWQgPSBbe1xuICAgICAgICBuYW1lLFxuICAgICAgICB2YWx1ZTogdmFsLFxuICAgICAgICBwYXlsb2FkOiBlbnRyeVdpdGhDZWxsSW5mbyxcbiAgICAgICAgZGF0YUtleSxcbiAgICAgICAgdHlwZTogdG9vbHRpcFR5cGVcbiAgICAgIH1dO1xuICAgICAgdmFyIHRvb2x0aXBQb3NpdGlvbiA9IHBvbGFyVG9DYXJ0ZXNpYW4oY29vcmRpbmF0ZS5jeCwgY29vcmRpbmF0ZS5jeSwgbWlkZGxlUmFkaXVzLCBtaWRBbmdsZSk7XG4gICAgICBwcmV2ID0gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgcGllU2V0dGluZ3MucHJlc2VudGF0aW9uUHJvcHMpLCB7fSwge1xuICAgICAgICBwZXJjZW50LFxuICAgICAgICBjb3JuZXJSYWRpdXMsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHRvb2x0aXBQYXlsb2FkLFxuICAgICAgICBtaWRBbmdsZSxcbiAgICAgICAgbWlkZGxlUmFkaXVzLFxuICAgICAgICB0b29sdGlwUG9zaXRpb25cbiAgICAgIH0sIGVudHJ5V2l0aENlbGxJbmZvKSwgY29vcmRpbmF0ZSksIHt9LCB7XG4gICAgICAgIHZhbHVlOiB2YWwsXG4gICAgICAgIHN0YXJ0QW5nbGU6IHRlbXBTdGFydEFuZ2xlLFxuICAgICAgICBlbmRBbmdsZTogdGVtcEVuZEFuZ2xlLFxuICAgICAgICBwYXlsb2FkOiBlbnRyeVdpdGhDZWxsSW5mbyxcbiAgICAgICAgcGFkZGluZ0FuZ2xlOiBtYXRoU2lnbihkZWx0YUFuZ2xlKSAqIHBhZGRpbmdBbmdsZVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcHJldjtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gc2VjdG9ycztcbn1cbmZ1bmN0aW9uIFBpZUxhYmVsTGlzdFByb3ZpZGVyKF9yZWY0KSB7XG4gIHZhciB7XG4gICAgc2hvd0xhYmVscyxcbiAgICBzZWN0b3JzLFxuICAgIGNoaWxkcmVuXG4gIH0gPSBfcmVmNDtcbiAgdmFyIGxhYmVsTGlzdEVudHJpZXMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBpZiAoIXNob3dMYWJlbHMgfHwgIXNlY3RvcnMpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmV0dXJuIHNlY3RvcnMubWFwKGVudHJ5ID0+ICh7XG4gICAgICB2YWx1ZTogZW50cnkudmFsdWUsXG4gICAgICBwYXlsb2FkOiBlbnRyeS5wYXlsb2FkLFxuICAgICAgY2xvY2tXaXNlOiBmYWxzZSxcbiAgICAgIHBhcmVudFZpZXdCb3g6IHVuZGVmaW5lZCxcbiAgICAgIHZpZXdCb3g6IHtcbiAgICAgICAgY3g6IGVudHJ5LmN4LFxuICAgICAgICBjeTogZW50cnkuY3ksXG4gICAgICAgIGlubmVyUmFkaXVzOiBlbnRyeS5pbm5lclJhZGl1cyxcbiAgICAgICAgb3V0ZXJSYWRpdXM6IGVudHJ5Lm91dGVyUmFkaXVzLFxuICAgICAgICBzdGFydEFuZ2xlOiBlbnRyeS5zdGFydEFuZ2xlLFxuICAgICAgICBlbmRBbmdsZTogZW50cnkuZW5kQW5nbGUsXG4gICAgICAgIGNsb2NrV2lzZTogZmFsc2VcbiAgICAgIH0sXG4gICAgICBmaWxsOiBlbnRyeS5maWxsXG4gICAgfSkpO1xuICB9LCBbc2VjdG9ycywgc2hvd0xhYmVsc10pO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUG9sYXJMYWJlbExpc3RDb250ZXh0UHJvdmlkZXIsIHtcbiAgICB2YWx1ZTogc2hvd0xhYmVscyA/IGxhYmVsTGlzdEVudHJpZXMgOiB1bmRlZmluZWRcbiAgfSwgY2hpbGRyZW4pO1xufVxuZnVuY3Rpb24gU2VjdG9yc1dpdGhBbmltYXRpb24oX3JlZjUpIHtcbiAgdmFyIHtcbiAgICBwcm9wcyxcbiAgICBwcmV2aW91c1NlY3RvcnNSZWZcbiAgfSA9IF9yZWY1O1xuICB2YXIge1xuICAgIHNlY3RvcnMsXG4gICAgaXNBbmltYXRpb25BY3RpdmUsXG4gICAgYW5pbWF0aW9uQmVnaW4sXG4gICAgYW5pbWF0aW9uRHVyYXRpb24sXG4gICAgYW5pbWF0aW9uRWFzaW5nLFxuICAgIGFjdGl2ZVNoYXBlLFxuICAgIGluYWN0aXZlU2hhcGUsXG4gICAgb25BbmltYXRpb25TdGFydCxcbiAgICBvbkFuaW1hdGlvbkVuZFxuICB9ID0gcHJvcHM7XG4gIHZhciBhbmltYXRpb25JZCA9IHVzZUFuaW1hdGlvbklkKHByb3BzLCAncmVjaGFydHMtcGllLScpO1xuICB2YXIgcHJldlNlY3RvcnMgPSBwcmV2aW91c1NlY3RvcnNSZWYuY3VycmVudDtcbiAgdmFyIFtpc0FuaW1hdGluZywgc2V0SXNBbmltYXRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICB2YXIgaGFuZGxlQW5pbWF0aW9uRW5kID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmICh0eXBlb2Ygb25BbmltYXRpb25FbmQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG9uQW5pbWF0aW9uRW5kKCk7XG4gICAgfVxuICAgIHNldElzQW5pbWF0aW5nKGZhbHNlKTtcbiAgfSwgW29uQW5pbWF0aW9uRW5kXSk7XG4gIHZhciBoYW5kbGVBbmltYXRpb25TdGFydCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAodHlwZW9mIG9uQW5pbWF0aW9uU3RhcnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG9uQW5pbWF0aW9uU3RhcnQoKTtcbiAgICB9XG4gICAgc2V0SXNBbmltYXRpbmcodHJ1ZSk7XG4gIH0sIFtvbkFuaW1hdGlvblN0YXJ0XSk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChQaWVMYWJlbExpc3RQcm92aWRlciwge1xuICAgIHNob3dMYWJlbHM6ICFpc0FuaW1hdGluZyxcbiAgICBzZWN0b3JzOiBzZWN0b3JzXG4gIH0sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEphdmFzY3JpcHRBbmltYXRlLCB7XG4gICAgYW5pbWF0aW9uSWQ6IGFuaW1hdGlvbklkLFxuICAgIGJlZ2luOiBhbmltYXRpb25CZWdpbixcbiAgICBkdXJhdGlvbjogYW5pbWF0aW9uRHVyYXRpb24sXG4gICAgaXNBY3RpdmU6IGlzQW5pbWF0aW9uQWN0aXZlLFxuICAgIGVhc2luZzogYW5pbWF0aW9uRWFzaW5nLFxuICAgIG9uQW5pbWF0aW9uU3RhcnQ6IGhhbmRsZUFuaW1hdGlvblN0YXJ0LFxuICAgIG9uQW5pbWF0aW9uRW5kOiBoYW5kbGVBbmltYXRpb25FbmQsXG4gICAga2V5OiBhbmltYXRpb25JZFxuICB9LCB0ID0+IHtcbiAgICB2YXIgc3RlcERhdGEgPSBbXTtcbiAgICB2YXIgZmlyc3QgPSBzZWN0b3JzICYmIHNlY3RvcnNbMF07XG4gICAgdmFyIGN1ckFuZ2xlID0gZmlyc3QgPT09IG51bGwgfHwgZmlyc3QgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGZpcnN0LnN0YXJ0QW5nbGU7XG4gICAgc2VjdG9ycyA9PT0gbnVsbCB8fCBzZWN0b3JzID09PSB2b2lkIDAgfHwgc2VjdG9ycy5mb3JFYWNoKChlbnRyeSwgaW5kZXgpID0+IHtcbiAgICAgIHZhciBwcmV2ID0gcHJldlNlY3RvcnMgJiYgcHJldlNlY3RvcnNbaW5kZXhdO1xuICAgICAgdmFyIHBhZGRpbmdBbmdsZSA9IGluZGV4ID4gMCA/IGdldChlbnRyeSwgJ3BhZGRpbmdBbmdsZScsIDApIDogMDtcbiAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgIHZhciBhbmdsZSA9IGludGVycG9sYXRlKHByZXYuZW5kQW5nbGUgLSBwcmV2LnN0YXJ0QW5nbGUsIGVudHJ5LmVuZEFuZ2xlIC0gZW50cnkuc3RhcnRBbmdsZSwgdCk7XG4gICAgICAgIHZhciBsYXRlc3QgPSBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGVudHJ5KSwge30sIHtcbiAgICAgICAgICBzdGFydEFuZ2xlOiBjdXJBbmdsZSArIHBhZGRpbmdBbmdsZSxcbiAgICAgICAgICBlbmRBbmdsZTogY3VyQW5nbGUgKyBhbmdsZSArIHBhZGRpbmdBbmdsZVxuICAgICAgICB9KTtcbiAgICAgICAgc3RlcERhdGEucHVzaChsYXRlc3QpO1xuICAgICAgICBjdXJBbmdsZSA9IGxhdGVzdC5lbmRBbmdsZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB7XG4gICAgICAgICAgZW5kQW5nbGUsXG4gICAgICAgICAgc3RhcnRBbmdsZVxuICAgICAgICB9ID0gZW50cnk7XG4gICAgICAgIHZhciBkZWx0YUFuZ2xlID0gaW50ZXJwb2xhdGUoMCwgZW5kQW5nbGUgLSBzdGFydEFuZ2xlLCB0KTtcbiAgICAgICAgdmFyIF9sYXRlc3QgPSBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGVudHJ5KSwge30sIHtcbiAgICAgICAgICBzdGFydEFuZ2xlOiBjdXJBbmdsZSArIHBhZGRpbmdBbmdsZSxcbiAgICAgICAgICBlbmRBbmdsZTogY3VyQW5nbGUgKyBkZWx0YUFuZ2xlICsgcGFkZGluZ0FuZ2xlXG4gICAgICAgIH0pO1xuICAgICAgICBzdGVwRGF0YS5wdXNoKF9sYXRlc3QpO1xuICAgICAgICBjdXJBbmdsZSA9IF9sYXRlc3QuZW5kQW5nbGU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICBwcmV2aW91c1NlY3RvcnNSZWYuY3VycmVudCA9IHN0ZXBEYXRhO1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwgbnVsbCwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUGllU2VjdG9ycywge1xuICAgICAgc2VjdG9yczogc3RlcERhdGEsXG4gICAgICBhY3RpdmVTaGFwZTogYWN0aXZlU2hhcGUsXG4gICAgICBpbmFjdGl2ZVNoYXBlOiBpbmFjdGl2ZVNoYXBlLFxuICAgICAgYWxsT3RoZXJQaWVQcm9wczogcHJvcHNcbiAgICB9KSk7XG4gIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChQaWVMYWJlbExpc3QsIHtcbiAgICBzaG93TGFiZWxzOiAhaXNBbmltYXRpbmcsXG4gICAgc2VjdG9yczogc2VjdG9ycyxcbiAgICBwcm9wczogcHJvcHNcbiAgfSksIHByb3BzLmNoaWxkcmVuKTtcbn1cbnZhciBkZWZhdWx0UGllUHJvcHMgPSB7XG4gIGFuaW1hdGlvbkJlZ2luOiA0MDAsXG4gIGFuaW1hdGlvbkR1cmF0aW9uOiAxNTAwLFxuICBhbmltYXRpb25FYXNpbmc6ICdlYXNlJyxcbiAgY3g6ICc1MCUnLFxuICBjeTogJzUwJScsXG4gIGRhdGFLZXk6ICd2YWx1ZScsXG4gIGVuZEFuZ2xlOiAzNjAsXG4gIGZpbGw6ICcjODA4MDgwJyxcbiAgaGlkZTogZmFsc2UsXG4gIGlubmVyUmFkaXVzOiAwLFxuICBpc0FuaW1hdGlvbkFjdGl2ZTogIUdsb2JhbC5pc1NzcixcbiAgbGFiZWxMaW5lOiB0cnVlLFxuICBsZWdlbmRUeXBlOiAncmVjdCcsXG4gIG1pbkFuZ2xlOiAwLFxuICBuYW1lS2V5OiAnbmFtZScsXG4gIG91dGVyUmFkaXVzOiAnODAlJyxcbiAgcGFkZGluZ0FuZ2xlOiAwLFxuICByb290VGFiSW5kZXg6IDAsXG4gIHN0YXJ0QW5nbGU6IDAsXG4gIHN0cm9rZTogJyNmZmYnXG59O1xuZnVuY3Rpb24gUGllSW1wbChwcm9wcykge1xuICB2YXIge1xuICAgICAgaWRcbiAgICB9ID0gcHJvcHMsXG4gICAgcHJvcHNXaXRob3V0SWQgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMocHJvcHMsIF9leGNsdWRlZDIpO1xuICB2YXIge1xuICAgIGhpZGUsXG4gICAgY2xhc3NOYW1lLFxuICAgIHJvb3RUYWJJbmRleFxuICB9ID0gcHJvcHM7XG4gIHZhciBjZWxscyA9IHVzZU1lbW8oKCkgPT4gZmluZEFsbEJ5VHlwZShwcm9wcy5jaGlsZHJlbiwgQ2VsbCksIFtwcm9wcy5jaGlsZHJlbl0pO1xuICB2YXIgc2VjdG9ycyA9IHVzZUFwcFNlbGVjdG9yKHN0YXRlID0+IHNlbGVjdFBpZVNlY3RvcnMoc3RhdGUsIGlkLCBjZWxscykpO1xuICB2YXIgcHJldmlvdXNTZWN0b3JzUmVmID0gdXNlUmVmKG51bGwpO1xuICB2YXIgbGF5ZXJDbGFzcyA9IGNsc3goJ3JlY2hhcnRzLXBpZScsIGNsYXNzTmFtZSk7XG4gIGlmIChoaWRlIHx8IHNlY3RvcnMgPT0gbnVsbCkge1xuICAgIHByZXZpb3VzU2VjdG9yc1JlZi5jdXJyZW50ID0gbnVsbDtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGF5ZXIsIHtcbiAgICAgIHRhYkluZGV4OiByb290VGFiSW5kZXgsXG4gICAgICBjbGFzc05hbWU6IGxheWVyQ2xhc3NcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRnJhZ21lbnQsIG51bGwsIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFNldFRvb2x0aXBFbnRyeVNldHRpbmdzLCB7XG4gICAgZm46IGdldFRvb2x0aXBFbnRyeVNldHRpbmdzLFxuICAgIGFyZ3M6IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgcHJvcHMpLCB7fSwge1xuICAgICAgc2VjdG9yc1xuICAgIH0pXG4gIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwge1xuICAgIHRhYkluZGV4OiByb290VGFiSW5kZXgsXG4gICAgY2xhc3NOYW1lOiBsYXllckNsYXNzXG4gIH0sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFNlY3RvcnNXaXRoQW5pbWF0aW9uLCB7XG4gICAgcHJvcHM6IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgcHJvcHNXaXRob3V0SWQpLCB7fSwge1xuICAgICAgc2VjdG9yc1xuICAgIH0pLFxuICAgIHByZXZpb3VzU2VjdG9yc1JlZjogcHJldmlvdXNTZWN0b3JzUmVmXG4gIH0pKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gUGllKG91dHNpZGVQcm9wcykge1xuICB2YXIgcHJvcHMgPSByZXNvbHZlRGVmYXVsdFByb3BzKG91dHNpZGVQcm9wcywgZGVmYXVsdFBpZVByb3BzKTtcbiAgdmFyIHtcbiAgICAgIGlkOiBleHRlcm5hbElkXG4gICAgfSA9IHByb3BzLFxuICAgIHByb3BzV2l0aG91dElkID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKHByb3BzLCBfZXhjbHVkZWQzKTtcbiAgdmFyIHByZXNlbnRhdGlvblByb3BzID0gc3ZnUHJvcGVydGllc05vRXZlbnRzKHByb3BzV2l0aG91dElkKTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlZ2lzdGVyR3JhcGhpY2FsSXRlbUlkLCB7XG4gICAgaWQ6IGV4dGVybmFsSWQsXG4gICAgdHlwZTogXCJwaWVcIlxuICB9LCBpZCA9PiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5GcmFnbWVudCwgbnVsbCwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2V0UG9sYXJHcmFwaGljYWxJdGVtLCB7XG4gICAgdHlwZTogXCJwaWVcIixcbiAgICBpZDogaWQsXG4gICAgZGF0YTogcHJvcHNXaXRob3V0SWQuZGF0YSxcbiAgICBkYXRhS2V5OiBwcm9wc1dpdGhvdXRJZC5kYXRhS2V5LFxuICAgIGhpZGU6IHByb3BzV2l0aG91dElkLmhpZGUsXG4gICAgYW5nbGVBeGlzSWQ6IDAsXG4gICAgcmFkaXVzQXhpc0lkOiAwLFxuICAgIG5hbWU6IHByb3BzV2l0aG91dElkLm5hbWUsXG4gICAgbmFtZUtleTogcHJvcHNXaXRob3V0SWQubmFtZUtleSxcbiAgICB0b29sdGlwVHlwZTogcHJvcHNXaXRob3V0SWQudG9vbHRpcFR5cGUsXG4gICAgbGVnZW5kVHlwZTogcHJvcHNXaXRob3V0SWQubGVnZW5kVHlwZSxcbiAgICBmaWxsOiBwcm9wc1dpdGhvdXRJZC5maWxsLFxuICAgIGN4OiBwcm9wc1dpdGhvdXRJZC5jeCxcbiAgICBjeTogcHJvcHNXaXRob3V0SWQuY3ksXG4gICAgc3RhcnRBbmdsZTogcHJvcHNXaXRob3V0SWQuc3RhcnRBbmdsZSxcbiAgICBlbmRBbmdsZTogcHJvcHNXaXRob3V0SWQuZW5kQW5nbGUsXG4gICAgcGFkZGluZ0FuZ2xlOiBwcm9wc1dpdGhvdXRJZC5wYWRkaW5nQW5nbGUsXG4gICAgbWluQW5nbGU6IHByb3BzV2l0aG91dElkLm1pbkFuZ2xlLFxuICAgIGlubmVyUmFkaXVzOiBwcm9wc1dpdGhvdXRJZC5pbm5lclJhZGl1cyxcbiAgICBvdXRlclJhZGl1czogcHJvcHNXaXRob3V0SWQub3V0ZXJSYWRpdXMsXG4gICAgY29ybmVyUmFkaXVzOiBwcm9wc1dpdGhvdXRJZC5jb3JuZXJSYWRpdXMsXG4gICAgcHJlc2VudGF0aW9uUHJvcHM6IHByZXNlbnRhdGlvblByb3BzLFxuICAgIG1heFJhZGl1czogcHJvcHMubWF4UmFkaXVzXG4gIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTZXRQaWVQYXlsb2FkTGVnZW5kLCBfZXh0ZW5kcyh7fSwgcHJvcHNXaXRob3V0SWQsIHtcbiAgICBpZDogaWRcbiAgfSkpLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChQaWVJbXBsLCBfZXh0ZW5kcyh7fSwgcHJvcHNXaXRob3V0SWQsIHtcbiAgICBpZDogaWRcbiAgfSkpKSk7XG59XG5QaWUuZGlzcGxheU5hbWUgPSAnUGllJzsiLCJ2YXIgX2V4Y2x1ZGVkID0gW1wiZ3JpZFR5cGVcIiwgXCJyYWRpYWxMaW5lc1wiLCBcImFuZ2xlQXhpc0lkXCIsIFwicmFkaXVzQXhpc0lkXCIsIFwiY3hcIiwgXCJjeVwiLCBcImlubmVyUmFkaXVzXCIsIFwib3V0ZXJSYWRpdXNcIl07XG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoZSwgdCkgeyBpZiAobnVsbCA9PSBlKSByZXR1cm4ge307IHZhciBvLCByLCBpID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzTG9vc2UoZSwgdCk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBuID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhlKTsgZm9yIChyID0gMDsgciA8IG4ubGVuZ3RoOyByKyspIG8gPSBuW3JdLCAtMSA9PT0gdC5pbmRleE9mKG8pICYmIHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoZSwgbykgJiYgKGlbb10gPSBlW29dKTsgfSByZXR1cm4gaTsgfVxuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzTG9vc2UociwgZSkgeyBpZiAobnVsbCA9PSByKSByZXR1cm4ge307IHZhciB0ID0ge307IGZvciAodmFyIG4gaW4gcikgaWYgKHt9Lmhhc093blByb3BlcnR5LmNhbGwociwgbikpIHsgaWYgKC0xICE9PSBlLmluZGV4T2YobikpIGNvbnRpbnVlOyB0W25dID0gcltuXTsgfSByZXR1cm4gdDsgfVxuZnVuY3Rpb24gX2V4dGVuZHMoKSB7IHJldHVybiBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gPyBPYmplY3QuYXNzaWduLmJpbmQoKSA6IGZ1bmN0aW9uIChuKSB7IGZvciAodmFyIGUgPSAxOyBlIDwgYXJndW1lbnRzLmxlbmd0aDsgZSsrKSB7IHZhciB0ID0gYXJndW1lbnRzW2VdOyBmb3IgKHZhciByIGluIHQpICh7fSkuaGFzT3duUHJvcGVydHkuY2FsbCh0LCByKSAmJiAobltyXSA9IHRbcl0pOyB9IHJldHVybiBuOyB9LCBfZXh0ZW5kcy5hcHBseShudWxsLCBhcmd1bWVudHMpOyB9XG5mdW5jdGlvbiBvd25LZXlzKGUsIHIpIHsgdmFyIHQgPSBPYmplY3Qua2V5cyhlKTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG8gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyByICYmIChvID0gby5maWx0ZXIoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZSwgcikuZW51bWVyYWJsZTsgfSkpLCB0LnB1c2guYXBwbHkodCwgbyk7IH0gcmV0dXJuIHQ7IH1cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQoZSkgeyBmb3IgKHZhciByID0gMTsgciA8IGFyZ3VtZW50cy5sZW5ndGg7IHIrKykgeyB2YXIgdCA9IG51bGwgIT0gYXJndW1lbnRzW3JdID8gYXJndW1lbnRzW3JdIDoge307IHIgJSAyID8gb3duS2V5cyhPYmplY3QodCksICEwKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0W3JdKTsgfSkgOiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGUsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHQpKSA6IG93bktleXMoT2JqZWN0KHQpKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHQsIHIpKTsgfSk7IH0gcmV0dXJuIGU7IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0KSB7IHJldHVybiAociA9IF90b1Byb3BlcnR5S2V5KHIpKSBpbiBlID8gT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIHsgdmFsdWU6IHQsIGVudW1lcmFibGU6ICEwLCBjb25maWd1cmFibGU6ICEwLCB3cml0YWJsZTogITAgfSkgOiBlW3JdID0gdCwgZTsgfVxuZnVuY3Rpb24gX3RvUHJvcGVydHlLZXkodCkgeyB2YXIgaSA9IF90b1ByaW1pdGl2ZSh0LCBcInN0cmluZ1wiKTsgcmV0dXJuIFwic3ltYm9sXCIgPT0gdHlwZW9mIGkgPyBpIDogaSArIFwiXCI7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZSh0LCByKSB7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiB0IHx8ICF0KSByZXR1cm4gdDsgdmFyIGUgPSB0W1N5bWJvbC50b1ByaW1pdGl2ZV07IGlmICh2b2lkIDAgIT09IGUpIHsgdmFyIGkgPSBlLmNhbGwodCwgciB8fCBcImRlZmF1bHRcIik7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiBpKSByZXR1cm4gaTsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpOyB9IHJldHVybiAoXCJzdHJpbmdcIiA9PT0gciA/IFN0cmluZyA6IE51bWJlcikodCk7IH1cbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHBvbGFyVG9DYXJ0ZXNpYW4gfSBmcm9tICcuLi91dGlsL1BvbGFyVXRpbHMnO1xuaW1wb3J0IHsgdXNlQXBwU2VsZWN0b3IgfSBmcm9tICcuLi9zdGF0ZS9ob29rcyc7XG5pbXBvcnQgeyBzZWxlY3RQb2xhckdyaWRBbmdsZXMsIHNlbGVjdFBvbGFyR3JpZFJhZGlpIH0gZnJvbSAnLi4vc3RhdGUvc2VsZWN0b3JzL3BvbGFyR3JpZFNlbGVjdG9ycyc7XG5pbXBvcnQgeyBzZWxlY3RQb2xhclZpZXdCb3ggfSBmcm9tICcuLi9zdGF0ZS9zZWxlY3RvcnMvcG9sYXJBeGlzU2VsZWN0b3JzJztcbmltcG9ydCB7IHN2Z1Byb3BlcnRpZXNOb0V2ZW50cyB9IGZyb20gJy4uL3V0aWwvc3ZnUHJvcGVydGllc05vRXZlbnRzJztcbnZhciBnZXRQb2x5Z29uUGF0aCA9IChyYWRpdXMsIGN4LCBjeSwgcG9sYXJBbmdsZXMpID0+IHtcbiAgdmFyIHBhdGggPSAnJztcbiAgcG9sYXJBbmdsZXMuZm9yRWFjaCgoYW5nbGUsIGkpID0+IHtcbiAgICB2YXIgcG9pbnQgPSBwb2xhclRvQ2FydGVzaWFuKGN4LCBjeSwgcmFkaXVzLCBhbmdsZSk7XG4gICAgaWYgKGkpIHtcbiAgICAgIHBhdGggKz0gXCJMIFwiLmNvbmNhdChwb2ludC54LCBcIixcIikuY29uY2F0KHBvaW50LnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXRoICs9IFwiTSBcIi5jb25jYXQocG9pbnQueCwgXCIsXCIpLmNvbmNhdChwb2ludC55KTtcbiAgICB9XG4gIH0pO1xuICBwYXRoICs9ICdaJztcbiAgcmV0dXJuIHBhdGg7XG59O1xuXG4vLyBEcmF3IGF4aXMgb2YgcmFkaWFsIGxpbmVcbnZhciBQb2xhckFuZ2xlcyA9IHByb3BzID0+IHtcbiAgdmFyIHtcbiAgICBjeCxcbiAgICBjeSxcbiAgICBpbm5lclJhZGl1cyxcbiAgICBvdXRlclJhZGl1cyxcbiAgICBwb2xhckFuZ2xlcyxcbiAgICByYWRpYWxMaW5lc1xuICB9ID0gcHJvcHM7XG4gIGlmICghcG9sYXJBbmdsZXMgfHwgIXBvbGFyQW5nbGVzLmxlbmd0aCB8fCAhcmFkaWFsTGluZXMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgcG9sYXJBbmdsZXNQcm9wcyA9IF9vYmplY3RTcHJlYWQoe1xuICAgIHN0cm9rZTogJyNjY2MnXG4gIH0sIHN2Z1Byb3BlcnRpZXNOb0V2ZW50cyhwcm9wcykpO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJnXCIsIHtcbiAgICBjbGFzc05hbWU6IFwicmVjaGFydHMtcG9sYXItZ3JpZC1hbmdsZVwiXG4gIH0sIHBvbGFyQW5nbGVzLm1hcChlbnRyeSA9PiB7XG4gICAgdmFyIHN0YXJ0ID0gcG9sYXJUb0NhcnRlc2lhbihjeCwgY3ksIGlubmVyUmFkaXVzLCBlbnRyeSk7XG4gICAgdmFyIGVuZCA9IHBvbGFyVG9DYXJ0ZXNpYW4oY3gsIGN5LCBvdXRlclJhZGl1cywgZW50cnkpO1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcImxpbmVcIiwgX2V4dGVuZHMoe1xuICAgICAga2V5OiBcImxpbmUtXCIuY29uY2F0KGVudHJ5KVxuICAgIH0sIHBvbGFyQW5nbGVzUHJvcHMsIHtcbiAgICAgIHgxOiBzdGFydC54LFxuICAgICAgeTE6IHN0YXJ0LnksXG4gICAgICB4MjogZW5kLngsXG4gICAgICB5MjogZW5kLnlcbiAgICB9KSk7XG4gIH0pKTtcbn07XG5cbi8vIERyYXcgY29uY2VudHJpYyBjaXJjbGVzXG52YXIgQ29uY2VudHJpY0NpcmNsZSA9IHByb3BzID0+IHtcbiAgdmFyIHtcbiAgICBjeCxcbiAgICBjeSxcbiAgICByYWRpdXNcbiAgfSA9IHByb3BzO1xuICB2YXIgY29uY2VudHJpY0NpcmNsZVByb3BzID0gX29iamVjdFNwcmVhZCh7XG4gICAgc3Ryb2tlOiAnI2NjYycsXG4gICAgZmlsbDogJ25vbmUnXG4gIH0sIHN2Z1Byb3BlcnRpZXNOb0V2ZW50cyhwcm9wcykpO1xuICByZXR1cm4gKFxuICAgIC8qI19fUFVSRV9fKi9cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHdyb25nIFNWRyBlbGVtZW50IHR5cGVcbiAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiY2lyY2xlXCIsIF9leHRlbmRzKHt9LCBjb25jZW50cmljQ2lyY2xlUHJvcHMsIHtcbiAgICAgIGNsYXNzTmFtZTogY2xzeCgncmVjaGFydHMtcG9sYXItZ3JpZC1jb25jZW50cmljLWNpcmNsZScsIHByb3BzLmNsYXNzTmFtZSksXG4gICAgICBjeDogY3gsXG4gICAgICBjeTogY3ksXG4gICAgICByOiByYWRpdXNcbiAgICB9KSlcbiAgKTtcbn07XG5cbi8vIERyYXcgY29uY2VudHJpYyBwb2x5Z29uc1xudmFyIENvbmNlbnRyaWNQb2x5Z29uID0gcHJvcHMgPT4ge1xuICB2YXIge1xuICAgIHJhZGl1c1xuICB9ID0gcHJvcHM7XG4gIHZhciBjb25jZW50cmljUG9seWdvblByb3BzID0gX29iamVjdFNwcmVhZCh7XG4gICAgc3Ryb2tlOiAnI2NjYycsXG4gICAgZmlsbDogJ25vbmUnXG4gIH0sIHN2Z1Byb3BlcnRpZXNOb0V2ZW50cyhwcm9wcykpO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJwYXRoXCIsIF9leHRlbmRzKHt9LCBjb25jZW50cmljUG9seWdvblByb3BzLCB7XG4gICAgY2xhc3NOYW1lOiBjbHN4KCdyZWNoYXJ0cy1wb2xhci1ncmlkLWNvbmNlbnRyaWMtcG9seWdvbicsIHByb3BzLmNsYXNzTmFtZSksXG4gICAgZDogZ2V0UG9seWdvblBhdGgocmFkaXVzLCBwcm9wcy5jeCwgcHJvcHMuY3ksIHByb3BzLnBvbGFyQW5nbGVzKVxuICB9KSk7XG59O1xuXG4vLyBEcmF3IGNvbmNlbnRyaWMgYXhpc1xudmFyIENvbmNlbnRyaWNHcmlkUGF0aCA9IHByb3BzID0+IHtcbiAgdmFyIHtcbiAgICBwb2xhclJhZGl1cyxcbiAgICBncmlkVHlwZVxuICB9ID0gcHJvcHM7XG4gIGlmICghcG9sYXJSYWRpdXMgfHwgIXBvbGFyUmFkaXVzLmxlbmd0aCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciBtYXhQb2xhclJhZGl1cyA9IE1hdGgubWF4KC4uLnBvbGFyUmFkaXVzKTtcbiAgdmFyIHJlbmRlckJhY2tncm91bmQgPSBwcm9wcy5maWxsICYmIHByb3BzLmZpbGwgIT09ICdub25lJztcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFwiZ1wiLCB7XG4gICAgY2xhc3NOYW1lOiBcInJlY2hhcnRzLXBvbGFyLWdyaWQtY29uY2VudHJpY1wiXG4gIH0sIHJlbmRlckJhY2tncm91bmQgJiYgZ3JpZFR5cGUgPT09ICdjaXJjbGUnICYmIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KENvbmNlbnRyaWNDaXJjbGUsIF9leHRlbmRzKHt9LCBwcm9wcywge1xuICAgIHJhZGl1czogbWF4UG9sYXJSYWRpdXNcbiAgfSkpLCByZW5kZXJCYWNrZ3JvdW5kICYmIGdyaWRUeXBlICE9PSAnY2lyY2xlJyAmJiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChDb25jZW50cmljUG9seWdvbiwgX2V4dGVuZHMoe30sIHByb3BzLCB7XG4gICAgcmFkaXVzOiBtYXhQb2xhclJhZGl1c1xuICB9KSksIHBvbGFyUmFkaXVzLm1hcCgoZW50cnksIGkpID0+IHtcbiAgICB2YXIga2V5ID0gaTtcbiAgICBpZiAoZ3JpZFR5cGUgPT09ICdjaXJjbGUnKSB7XG4gICAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQ29uY2VudHJpY0NpcmNsZSwgX2V4dGVuZHMoe1xuICAgICAgICBrZXk6IGtleVxuICAgICAgfSwgcHJvcHMsIHtcbiAgICAgICAgZmlsbDogXCJub25lXCIsXG4gICAgICAgIHJhZGl1czogZW50cnlcbiAgICAgIH0pKTtcbiAgICB9XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KENvbmNlbnRyaWNQb2x5Z29uLCBfZXh0ZW5kcyh7XG4gICAgICBrZXk6IGtleVxuICAgIH0sIHByb3BzLCB7XG4gICAgICBmaWxsOiBcIm5vbmVcIixcbiAgICAgIHJhZGl1czogZW50cnlcbiAgICB9KSk7XG4gIH0pKTtcbn07XG5leHBvcnQgdmFyIFBvbGFyR3JpZCA9IF9yZWYgPT4ge1xuICB2YXIgX3JlZjIsIF9wb2xhclZpZXdCb3gkY3gsIF9yZWYzLCBfcG9sYXJWaWV3Qm94JGN5LCBfcmVmNCwgX3BvbGFyVmlld0JveCRpbm5lclJhLCBfcmVmNSwgX3BvbGFyVmlld0JveCRvdXRlclJhO1xuICB2YXIge1xuICAgICAgZ3JpZFR5cGUgPSAncG9seWdvbicsXG4gICAgICByYWRpYWxMaW5lcyA9IHRydWUsXG4gICAgICBhbmdsZUF4aXNJZCA9IDAsXG4gICAgICByYWRpdXNBeGlzSWQgPSAwLFxuICAgICAgY3g6IGN4RnJvbU91dHNpZGUsXG4gICAgICBjeTogY3lGcm9tT3V0c2lkZSxcbiAgICAgIGlubmVyUmFkaXVzOiBpbm5lclJhZGl1c0Zyb21PdXRzaWRlLFxuICAgICAgb3V0ZXJSYWRpdXM6IG91dGVyUmFkaXVzRnJvbU91dHNpZGVcbiAgICB9ID0gX3JlZixcbiAgICBpbnB1dHMgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoX3JlZiwgX2V4Y2x1ZGVkKTtcbiAgdmFyIHBvbGFyVmlld0JveCA9IHVzZUFwcFNlbGVjdG9yKHNlbGVjdFBvbGFyVmlld0JveCk7XG4gIHZhciBwcm9wcyA9IF9vYmplY3RTcHJlYWQoe1xuICAgIGN4OiAoX3JlZjIgPSAoX3BvbGFyVmlld0JveCRjeCA9IHBvbGFyVmlld0JveCA9PT0gbnVsbCB8fCBwb2xhclZpZXdCb3ggPT09IHZvaWQgMCA/IHZvaWQgMCA6IHBvbGFyVmlld0JveC5jeCkgIT09IG51bGwgJiYgX3BvbGFyVmlld0JveCRjeCAhPT0gdm9pZCAwID8gX3BvbGFyVmlld0JveCRjeCA6IGN4RnJvbU91dHNpZGUpICE9PSBudWxsICYmIF9yZWYyICE9PSB2b2lkIDAgPyBfcmVmMiA6IDAsXG4gICAgY3k6IChfcmVmMyA9IChfcG9sYXJWaWV3Qm94JGN5ID0gcG9sYXJWaWV3Qm94ID09PSBudWxsIHx8IHBvbGFyVmlld0JveCA9PT0gdm9pZCAwID8gdm9pZCAwIDogcG9sYXJWaWV3Qm94LmN5KSAhPT0gbnVsbCAmJiBfcG9sYXJWaWV3Qm94JGN5ICE9PSB2b2lkIDAgPyBfcG9sYXJWaWV3Qm94JGN5IDogY3lGcm9tT3V0c2lkZSkgIT09IG51bGwgJiYgX3JlZjMgIT09IHZvaWQgMCA/IF9yZWYzIDogMCxcbiAgICBpbm5lclJhZGl1czogKF9yZWY0ID0gKF9wb2xhclZpZXdCb3gkaW5uZXJSYSA9IHBvbGFyVmlld0JveCA9PT0gbnVsbCB8fCBwb2xhclZpZXdCb3ggPT09IHZvaWQgMCA/IHZvaWQgMCA6IHBvbGFyVmlld0JveC5pbm5lclJhZGl1cykgIT09IG51bGwgJiYgX3BvbGFyVmlld0JveCRpbm5lclJhICE9PSB2b2lkIDAgPyBfcG9sYXJWaWV3Qm94JGlubmVyUmEgOiBpbm5lclJhZGl1c0Zyb21PdXRzaWRlKSAhPT0gbnVsbCAmJiBfcmVmNCAhPT0gdm9pZCAwID8gX3JlZjQgOiAwLFxuICAgIG91dGVyUmFkaXVzOiAoX3JlZjUgPSAoX3BvbGFyVmlld0JveCRvdXRlclJhID0gcG9sYXJWaWV3Qm94ID09PSBudWxsIHx8IHBvbGFyVmlld0JveCA9PT0gdm9pZCAwID8gdm9pZCAwIDogcG9sYXJWaWV3Qm94Lm91dGVyUmFkaXVzKSAhPT0gbnVsbCAmJiBfcG9sYXJWaWV3Qm94JG91dGVyUmEgIT09IHZvaWQgMCA/IF9wb2xhclZpZXdCb3gkb3V0ZXJSYSA6IG91dGVyUmFkaXVzRnJvbU91dHNpZGUpICE9PSBudWxsICYmIF9yZWY1ICE9PSB2b2lkIDAgPyBfcmVmNSA6IDBcbiAgfSwgaW5wdXRzKTtcbiAgdmFyIHtcbiAgICBwb2xhckFuZ2xlczogcG9sYXJBbmdsZXNJbnB1dCxcbiAgICBwb2xhclJhZGl1czogcG9sYXJSYWRpdXNJbnB1dCxcbiAgICBvdXRlclJhZGl1c1xuICB9ID0gcHJvcHM7XG4gIHZhciBwb2xhckFuZ2xlc0Zyb21SZWR1eCA9IHVzZUFwcFNlbGVjdG9yKHN0YXRlID0+IHNlbGVjdFBvbGFyR3JpZEFuZ2xlcyhzdGF0ZSwgYW5nbGVBeGlzSWQpKTtcbiAgdmFyIHBvbGFyUmFkaWlGcm9tUmVkdXggPSB1c2VBcHBTZWxlY3RvcihzdGF0ZSA9PiBzZWxlY3RQb2xhckdyaWRSYWRpaShzdGF0ZSwgcmFkaXVzQXhpc0lkKSk7XG4gIHZhciBwb2xhckFuZ2xlcyA9IEFycmF5LmlzQXJyYXkocG9sYXJBbmdsZXNJbnB1dCkgPyBwb2xhckFuZ2xlc0lucHV0IDogcG9sYXJBbmdsZXNGcm9tUmVkdXg7XG4gIHZhciBwb2xhclJhZGl1cyA9IEFycmF5LmlzQXJyYXkocG9sYXJSYWRpdXNJbnB1dCkgPyBwb2xhclJhZGl1c0lucHV0IDogcG9sYXJSYWRpaUZyb21SZWR1eDtcbiAgaWYgKG91dGVyUmFkaXVzIDw9IDAgfHwgcG9sYXJBbmdsZXMgPT0gbnVsbCB8fCBwb2xhclJhZGl1cyA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFwiZ1wiLCB7XG4gICAgY2xhc3NOYW1lOiBcInJlY2hhcnRzLXBvbGFyLWdyaWRcIlxuICB9LCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChDb25jZW50cmljR3JpZFBhdGgsIF9leHRlbmRzKHtcbiAgICBncmlkVHlwZTogZ3JpZFR5cGUsXG4gICAgcmFkaWFsTGluZXM6IHJhZGlhbExpbmVzXG4gIH0sIHByb3BzLCB7XG4gICAgcG9sYXJBbmdsZXM6IHBvbGFyQW5nbGVzLFxuICAgIHBvbGFyUmFkaXVzOiBwb2xhclJhZGl1c1xuICB9KSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFBvbGFyQW5nbGVzLCBfZXh0ZW5kcyh7XG4gICAgZ3JpZFR5cGU6IGdyaWRUeXBlLFxuICAgIHJhZGlhbExpbmVzOiByYWRpYWxMaW5lc1xuICB9LCBwcm9wcywge1xuICAgIHBvbGFyQW5nbGVzOiBwb2xhckFuZ2xlcyxcbiAgICBwb2xhclJhZGl1czogcG9sYXJSYWRpdXNcbiAgfSkpKTtcbn07XG5Qb2xhckdyaWQuZGlzcGxheU5hbWUgPSAnUG9sYXJHcmlkJzsiLCJ2YXIgX2V4Y2x1ZGVkID0gW1wiY3hcIiwgXCJjeVwiLCBcImFuZ2xlXCIsIFwiYXhpc0xpbmVcIl0sXG4gIF9leGNsdWRlZDIgPSBbXCJhbmdsZVwiLCBcInRpY2tGb3JtYXR0ZXJcIiwgXCJzdHJva2VcIiwgXCJ0aWNrXCJdO1xuZnVuY3Rpb24gX2V4dGVuZHMoKSB7IHJldHVybiBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gPyBPYmplY3QuYXNzaWduLmJpbmQoKSA6IGZ1bmN0aW9uIChuKSB7IGZvciAodmFyIGUgPSAxOyBlIDwgYXJndW1lbnRzLmxlbmd0aDsgZSsrKSB7IHZhciB0ID0gYXJndW1lbnRzW2VdOyBmb3IgKHZhciByIGluIHQpICh7fSkuaGFzT3duUHJvcGVydHkuY2FsbCh0LCByKSAmJiAobltyXSA9IHRbcl0pOyB9IHJldHVybiBuOyB9LCBfZXh0ZW5kcy5hcHBseShudWxsLCBhcmd1bWVudHMpOyB9XG5mdW5jdGlvbiBvd25LZXlzKGUsIHIpIHsgdmFyIHQgPSBPYmplY3Qua2V5cyhlKTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG8gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyByICYmIChvID0gby5maWx0ZXIoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZSwgcikuZW51bWVyYWJsZTsgfSkpLCB0LnB1c2guYXBwbHkodCwgbyk7IH0gcmV0dXJuIHQ7IH1cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQoZSkgeyBmb3IgKHZhciByID0gMTsgciA8IGFyZ3VtZW50cy5sZW5ndGg7IHIrKykgeyB2YXIgdCA9IG51bGwgIT0gYXJndW1lbnRzW3JdID8gYXJndW1lbnRzW3JdIDoge307IHIgJSAyID8gb3duS2V5cyhPYmplY3QodCksICEwKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0W3JdKTsgfSkgOiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGUsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHQpKSA6IG93bktleXMoT2JqZWN0KHQpKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHQsIHIpKTsgfSk7IH0gcmV0dXJuIGU7IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0KSB7IHJldHVybiAociA9IF90b1Byb3BlcnR5S2V5KHIpKSBpbiBlID8gT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIHsgdmFsdWU6IHQsIGVudW1lcmFibGU6ICEwLCBjb25maWd1cmFibGU6ICEwLCB3cml0YWJsZTogITAgfSkgOiBlW3JdID0gdCwgZTsgfVxuZnVuY3Rpb24gX3RvUHJvcGVydHlLZXkodCkgeyB2YXIgaSA9IF90b1ByaW1pdGl2ZSh0LCBcInN0cmluZ1wiKTsgcmV0dXJuIFwic3ltYm9sXCIgPT0gdHlwZW9mIGkgPyBpIDogaSArIFwiXCI7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZSh0LCByKSB7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiB0IHx8ICF0KSByZXR1cm4gdDsgdmFyIGUgPSB0W1N5bWJvbC50b1ByaW1pdGl2ZV07IGlmICh2b2lkIDAgIT09IGUpIHsgdmFyIGkgPSBlLmNhbGwodCwgciB8fCBcImRlZmF1bHRcIik7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiBpKSByZXR1cm4gaTsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpOyB9IHJldHVybiAoXCJzdHJpbmdcIiA9PT0gciA/IFN0cmluZyA6IE51bWJlcikodCk7IH1cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhlLCB0KSB7IGlmIChudWxsID09IGUpIHJldHVybiB7fTsgdmFyIG8sIHIsIGkgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShlLCB0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG4gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyBmb3IgKHIgPSAwOyByIDwgbi5sZW5ndGg7IHIrKykgbyA9IG5bcl0sIC0xID09PSB0LmluZGV4T2YobykgJiYge30ucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChlLCBvKSAmJiAoaVtvXSA9IGVbb10pOyB9IHJldHVybiBpOyB9XG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShyLCBlKSB7IGlmIChudWxsID09IHIpIHJldHVybiB7fTsgdmFyIHQgPSB7fTsgZm9yICh2YXIgbiBpbiByKSBpZiAoe30uaGFzT3duUHJvcGVydHkuY2FsbChyLCBuKSkgeyBpZiAoLTEgIT09IGUuaW5kZXhPZihuKSkgY29udGludWU7IHRbbl0gPSByW25dOyB9IHJldHVybiB0OyB9XG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBQdXJlQ29tcG9uZW50LCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgbWF4QnkgZnJvbSAnZXMtdG9vbGtpdC9jb21wYXQvbWF4QnknO1xuaW1wb3J0IG1pbkJ5IGZyb20gJ2VzLXRvb2xraXQvY29tcGF0L21pbkJ5JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IFRleHQgfSBmcm9tICcuLi9jb21wb25lbnQvVGV4dCc7XG5pbXBvcnQgeyBQb2xhckxhYmVsQ29udGV4dFByb3ZpZGVyLCBQb2xhckxhYmVsRnJvbUxhYmVsUHJvcCB9IGZyb20gJy4uL2NvbXBvbmVudC9MYWJlbCc7XG5pbXBvcnQgeyBMYXllciB9IGZyb20gJy4uL2NvbnRhaW5lci9MYXllcic7XG5pbXBvcnQgeyBnZXRUaWNrQ2xhc3NOYW1lLCBwb2xhclRvQ2FydGVzaWFuIH0gZnJvbSAnLi4vdXRpbC9Qb2xhclV0aWxzJztcbmltcG9ydCB7IGFkYXB0RXZlbnRzT2ZDaGlsZCB9IGZyb20gJy4uL3V0aWwvdHlwZXMnO1xuaW1wb3J0IHsgYWRkUmFkaXVzQXhpcywgcmVtb3ZlUmFkaXVzQXhpcyB9IGZyb20gJy4uL3N0YXRlL3BvbGFyQXhpc1NsaWNlJztcbmltcG9ydCB7IHVzZUFwcERpc3BhdGNoLCB1c2VBcHBTZWxlY3RvciB9IGZyb20gJy4uL3N0YXRlL2hvb2tzJztcbmltcG9ydCB7IHNlbGVjdFBvbGFyQXhpc1NjYWxlLCBzZWxlY3RQb2xhckF4aXNUaWNrcyB9IGZyb20gJy4uL3N0YXRlL3NlbGVjdG9ycy9wb2xhclNjYWxlU2VsZWN0b3JzJztcbmltcG9ydCB7IHNlbGVjdFBvbGFyVmlld0JveCB9IGZyb20gJy4uL3N0YXRlL3NlbGVjdG9ycy9wb2xhckF4aXNTZWxlY3RvcnMnO1xuaW1wb3J0IHsgZGVmYXVsdFBvbGFyUmFkaXVzQXhpc1Byb3BzIH0gZnJvbSAnLi9kZWZhdWx0UG9sYXJSYWRpdXNBeGlzUHJvcHMnO1xuaW1wb3J0IHsgc3ZnUHJvcGVydGllc05vRXZlbnRzLCBzdmdQcm9wZXJ0aWVzTm9FdmVudHNGcm9tVW5rbm93biB9IGZyb20gJy4uL3V0aWwvc3ZnUHJvcGVydGllc05vRXZlbnRzJztcbnZhciBBWElTX1RZUEUgPSAncmFkaXVzQXhpcyc7XG5mdW5jdGlvbiBTZXRSYWRpdXNBeGlzU2V0dGluZ3Moc2V0dGluZ3MpIHtcbiAgdmFyIGRpc3BhdGNoID0gdXNlQXBwRGlzcGF0Y2goKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBkaXNwYXRjaChhZGRSYWRpdXNBeGlzKHNldHRpbmdzKSk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRpc3BhdGNoKHJlbW92ZVJhZGl1c0F4aXMoc2V0dGluZ3MpKTtcbiAgICB9O1xuICB9KTtcbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlIHRoZSBjb29yZGluYXRlIG9mIHRpY2tcbiAqIEBwYXJhbSBjb29yZGluYXRlIFRoZSByYWRpdXMgb2YgdGlja1xuICogQHBhcmFtIGFuZ2xlIGZyb20gcHJvcHNcbiAqIEBwYXJhbSBjeCBmcm9tIGNoYXJ0XG4gKiBAcGFyYW0gY3kgZnJvbSBjaGFydFxuICogQHJldHVybiAoeCwgeSlcbiAqL1xudmFyIGdldFRpY2tWYWx1ZUNvb3JkID0gKF9yZWYsIGFuZ2xlLCBjeCwgY3kpID0+IHtcbiAgdmFyIHtcbiAgICBjb29yZGluYXRlXG4gIH0gPSBfcmVmO1xuICByZXR1cm4gcG9sYXJUb0NhcnRlc2lhbihjeCwgY3ksIGNvb3JkaW5hdGUsIGFuZ2xlKTtcbn07XG52YXIgZ2V0VGlja1RleHRBbmNob3IgPSBvcmllbnRhdGlvbiA9PiB7XG4gIHZhciB0ZXh0QW5jaG9yO1xuICBzd2l0Y2ggKG9yaWVudGF0aW9uKSB7XG4gICAgY2FzZSAnbGVmdCc6XG4gICAgICB0ZXh0QW5jaG9yID0gJ2VuZCc7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyaWdodCc6XG4gICAgICB0ZXh0QW5jaG9yID0gJ3N0YXJ0JztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0ZXh0QW5jaG9yID0gJ21pZGRsZSc7XG4gICAgICBicmVhaztcbiAgfVxuICByZXR1cm4gdGV4dEFuY2hvcjtcbn07XG52YXIgZ2V0Vmlld0JveCA9IChhbmdsZSwgY3gsIGN5LCB0aWNrcykgPT4ge1xuICB2YXIgbWF4UmFkaXVzVGljayA9IG1heEJ5KHRpY2tzLCBlbnRyeSA9PiBlbnRyeS5jb29yZGluYXRlIHx8IDApO1xuICB2YXIgbWluUmFkaXVzVGljayA9IG1pbkJ5KHRpY2tzLCBlbnRyeSA9PiBlbnRyeS5jb29yZGluYXRlIHx8IDApO1xuICByZXR1cm4ge1xuICAgIGN4LFxuICAgIGN5LFxuICAgIHN0YXJ0QW5nbGU6IGFuZ2xlLFxuICAgIGVuZEFuZ2xlOiBhbmdsZSxcbiAgICBpbm5lclJhZGl1czogbWluUmFkaXVzVGljay5jb29yZGluYXRlIHx8IDAsXG4gICAgb3V0ZXJSYWRpdXM6IG1heFJhZGl1c1RpY2suY29vcmRpbmF0ZSB8fCAwLFxuICAgIGNsb2NrV2lzZTogZmFsc2VcbiAgfTtcbn07XG52YXIgcmVuZGVyQXhpc0xpbmUgPSAocHJvcHMsIHRpY2tzKSA9PiB7XG4gIHZhciB7XG4gICAgICBjeCxcbiAgICAgIGN5LFxuICAgICAgYW5nbGUsXG4gICAgICBheGlzTGluZVxuICAgIH0gPSBwcm9wcyxcbiAgICBvdGhlcnMgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMocHJvcHMsIF9leGNsdWRlZCk7XG4gIHZhciBleHRlbnQgPSB0aWNrcy5yZWR1Y2UoKHJlc3VsdCwgZW50cnkpID0+IFtNYXRoLm1pbihyZXN1bHRbMF0sIGVudHJ5LmNvb3JkaW5hdGUpLCBNYXRoLm1heChyZXN1bHRbMV0sIGVudHJ5LmNvb3JkaW5hdGUpXSwgW0luZmluaXR5LCAtSW5maW5pdHldKTtcbiAgdmFyIHBvaW50MCA9IHBvbGFyVG9DYXJ0ZXNpYW4oY3gsIGN5LCBleHRlbnRbMF0sIGFuZ2xlKTtcbiAgdmFyIHBvaW50MSA9IHBvbGFyVG9DYXJ0ZXNpYW4oY3gsIGN5LCBleHRlbnRbMV0sIGFuZ2xlKTtcbiAgdmFyIGF4aXNMaW5lUHJvcHMgPSBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgc3ZnUHJvcGVydGllc05vRXZlbnRzKG90aGVycykpLCB7fSwge1xuICAgIGZpbGw6ICdub25lJ1xuICB9LCBzdmdQcm9wZXJ0aWVzTm9FdmVudHMoYXhpc0xpbmUpKSwge30sIHtcbiAgICB4MTogcG9pbnQwLngsXG4gICAgeTE6IHBvaW50MC55LFxuICAgIHgyOiBwb2ludDEueCxcbiAgICB5MjogcG9pbnQxLnlcbiAgfSk7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB3cm9uZyBTVkcgZWxlbWVudCB0eXBlXG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcImxpbmVcIiwgX2V4dGVuZHMoe1xuICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1wb2xhci1yYWRpdXMtYXhpcy1saW5lXCJcbiAgfSwgYXhpc0xpbmVQcm9wcykpO1xufTtcbnZhciByZW5kZXJUaWNrSXRlbSA9IChvcHRpb24sIHRpY2tQcm9wcywgdmFsdWUpID0+IHtcbiAgdmFyIHRpY2tJdGVtO1xuICBpZiAoLyojX19QVVJFX18qL1JlYWN0LmlzVmFsaWRFbGVtZW50KG9wdGlvbikpIHtcbiAgICB0aWNrSXRlbSA9IC8qI19fUFVSRV9fKi9SZWFjdC5jbG9uZUVsZW1lbnQob3B0aW9uLCB0aWNrUHJvcHMpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICB0aWNrSXRlbSA9IG9wdGlvbih0aWNrUHJvcHMpO1xuICB9IGVsc2Uge1xuICAgIHRpY2tJdGVtID0gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoVGV4dCwgX2V4dGVuZHMoe30sIHRpY2tQcm9wcywge1xuICAgICAgY2xhc3NOYW1lOiBcInJlY2hhcnRzLXBvbGFyLXJhZGl1cy1heGlzLXRpY2stdmFsdWVcIlxuICAgIH0pLCB2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHRpY2tJdGVtO1xufTtcbnZhciByZW5kZXJUaWNrcyA9IChwcm9wcywgdGlja3MpID0+IHtcbiAgdmFyIHtcbiAgICAgIGFuZ2xlLFxuICAgICAgdGlja0Zvcm1hdHRlcixcbiAgICAgIHN0cm9rZSxcbiAgICAgIHRpY2tcbiAgICB9ID0gcHJvcHMsXG4gICAgb3RoZXJzID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKHByb3BzLCBfZXhjbHVkZWQyKTtcbiAgdmFyIHRleHRBbmNob3IgPSBnZXRUaWNrVGV4dEFuY2hvcihwcm9wcy5vcmllbnRhdGlvbik7XG4gIHZhciBheGlzUHJvcHMgPSBzdmdQcm9wZXJ0aWVzTm9FdmVudHMob3RoZXJzKTtcbiAgdmFyIGN1c3RvbVRpY2tQcm9wcyA9IHN2Z1Byb3BlcnRpZXNOb0V2ZW50c0Zyb21Vbmtub3duKHRpY2spO1xuICB2YXIgaXRlbXMgPSB0aWNrcy5tYXAoKGVudHJ5LCBpKSA9PiB7XG4gICAgdmFyIGNvb3JkID0gZ2V0VGlja1ZhbHVlQ29vcmQoZW50cnksIHByb3BzLmFuZ2xlLCBwcm9wcy5jeCwgcHJvcHMuY3kpO1xuICAgIHZhciB0aWNrUHJvcHMgPSBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHtcbiAgICAgIHRleHRBbmNob3IsXG4gICAgICB0cmFuc2Zvcm06IFwicm90YXRlKFwiLmNvbmNhdCg5MCAtIGFuZ2xlLCBcIiwgXCIpLmNvbmNhdChjb29yZC54LCBcIiwgXCIpLmNvbmNhdChjb29yZC55LCBcIilcIilcbiAgICB9LCBheGlzUHJvcHMpLCB7fSwge1xuICAgICAgc3Ryb2tlOiAnbm9uZScsXG4gICAgICBmaWxsOiBzdHJva2VcbiAgICB9LCBjdXN0b21UaWNrUHJvcHMpLCB7fSwge1xuICAgICAgaW5kZXg6IGlcbiAgICB9LCBjb29yZCksIHt9LCB7XG4gICAgICBwYXlsb2FkOiBlbnRyeVxuICAgIH0pO1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwgX2V4dGVuZHMoe1xuICAgICAgY2xhc3NOYW1lOiBjbHN4KCdyZWNoYXJ0cy1wb2xhci1yYWRpdXMtYXhpcy10aWNrJywgZ2V0VGlja0NsYXNzTmFtZSh0aWNrKSksXG4gICAgICBrZXk6IFwidGljay1cIi5jb25jYXQoZW50cnkuY29vcmRpbmF0ZSlcbiAgICB9LCBhZGFwdEV2ZW50c09mQ2hpbGQocHJvcHMsIGVudHJ5LCBpKSksIHJlbmRlclRpY2tJdGVtKHRpY2ssIHRpY2tQcm9wcywgdGlja0Zvcm1hdHRlciA/IHRpY2tGb3JtYXR0ZXIoZW50cnkudmFsdWUsIGkpIDogZW50cnkudmFsdWUpKTtcbiAgfSk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwge1xuICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1wb2xhci1yYWRpdXMtYXhpcy10aWNrc1wiXG4gIH0sIGl0ZW1zKTtcbn07XG5leHBvcnQgdmFyIFBvbGFyUmFkaXVzQXhpc1dyYXBwZXIgPSBkZWZhdWx0c0FuZElucHV0cyA9PiB7XG4gIHZhciB7XG4gICAgcmFkaXVzQXhpc0lkXG4gIH0gPSBkZWZhdWx0c0FuZElucHV0cztcbiAgdmFyIHZpZXdCb3ggPSB1c2VBcHBTZWxlY3RvcihzZWxlY3RQb2xhclZpZXdCb3gpO1xuICB2YXIgc2NhbGUgPSB1c2VBcHBTZWxlY3RvcihzdGF0ZSA9PiBzZWxlY3RQb2xhckF4aXNTY2FsZShzdGF0ZSwgJ3JhZGl1c0F4aXMnLCByYWRpdXNBeGlzSWQpKTtcbiAgdmFyIHRpY2tzID0gdXNlQXBwU2VsZWN0b3Ioc3RhdGUgPT4gc2VsZWN0UG9sYXJBeGlzVGlja3Moc3RhdGUsICdyYWRpdXNBeGlzJywgcmFkaXVzQXhpc0lkLCBmYWxzZSkpO1xuICBpZiAodmlld0JveCA9PSBudWxsIHx8ICF0aWNrcyB8fCAhdGlja3MubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIHByb3BzID0gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGRlZmF1bHRzQW5kSW5wdXRzKSwge30sIHtcbiAgICBzY2FsZVxuICB9LCB2aWV3Qm94KSwge30sIHtcbiAgICByYWRpdXM6IHZpZXdCb3gub3V0ZXJSYWRpdXNcbiAgfSk7XG4gIHZhciB7XG4gICAgdGljayxcbiAgICBheGlzTGluZVxuICB9ID0gcHJvcHM7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwge1xuICAgIGNsYXNzTmFtZTogY2xzeCgncmVjaGFydHMtcG9sYXItcmFkaXVzLWF4aXMnLCBBWElTX1RZUEUsIHByb3BzLmNsYXNzTmFtZSlcbiAgfSwgYXhpc0xpbmUgJiYgcmVuZGVyQXhpc0xpbmUocHJvcHMsIHRpY2tzKSwgdGljayAmJiByZW5kZXJUaWNrcyhwcm9wcywgdGlja3MpLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChQb2xhckxhYmVsQ29udGV4dFByb3ZpZGVyLCBnZXRWaWV3Qm94KHByb3BzLmFuZ2xlLCBwcm9wcy5jeCwgcHJvcHMuY3ksIHRpY2tzKSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUG9sYXJMYWJlbEZyb21MYWJlbFByb3AsIHtcbiAgICBsYWJlbDogcHJvcHMubGFiZWxcbiAgfSksIHByb3BzLmNoaWxkcmVuKSk7XG59O1xuZXhwb3J0IGNsYXNzIFBvbGFyUmFkaXVzQXhpcyBleHRlbmRzIFB1cmVDb21wb25lbnQge1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkZyYWdtZW50LCBudWxsLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTZXRSYWRpdXNBeGlzU2V0dGluZ3MsIHtcbiAgICAgIGRvbWFpbjogdGhpcy5wcm9wcy5kb21haW4sXG4gICAgICBpZDogdGhpcy5wcm9wcy5yYWRpdXNBeGlzSWQsXG4gICAgICBzY2FsZTogdGhpcy5wcm9wcy5zY2FsZSxcbiAgICAgIHR5cGU6IHRoaXMucHJvcHMudHlwZSxcbiAgICAgIGRhdGFLZXk6IHRoaXMucHJvcHMuZGF0YUtleSxcbiAgICAgIHVuaXQ6IHVuZGVmaW5lZCxcbiAgICAgIG5hbWU6IHRoaXMucHJvcHMubmFtZSxcbiAgICAgIGFsbG93RHVwbGljYXRlZENhdGVnb3J5OiB0aGlzLnByb3BzLmFsbG93RHVwbGljYXRlZENhdGVnb3J5LFxuICAgICAgYWxsb3dEYXRhT3ZlcmZsb3c6IHRoaXMucHJvcHMuYWxsb3dEYXRhT3ZlcmZsb3csXG4gICAgICByZXZlcnNlZDogdGhpcy5wcm9wcy5yZXZlcnNlZCxcbiAgICAgIGluY2x1ZGVIaWRkZW46IHRoaXMucHJvcHMuaW5jbHVkZUhpZGRlbixcbiAgICAgIGFsbG93RGVjaW1hbHM6IHRoaXMucHJvcHMuYWxsb3dEZWNpbWFscyxcbiAgICAgIHRpY2tDb3VudDogdGhpcy5wcm9wcy50aWNrQ291bnRcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdGhlIHR5cGUgZG9lcyBub3QgbWF0Y2guIElzIFJhZGl1c0F4aXMgcmVhbGx5IGV4cGVjdGluZyB3aGF0IGl0IHNheXM/XG4gICAgICAsXG4gICAgICB0aWNrczogdGhpcy5wcm9wcy50aWNrcyxcbiAgICAgIHRpY2s6IHRoaXMucHJvcHMudGlja1xuICAgIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChQb2xhclJhZGl1c0F4aXNXcmFwcGVyLCB0aGlzLnByb3BzKSk7XG4gIH1cbn1cbl9kZWZpbmVQcm9wZXJ0eShQb2xhclJhZGl1c0F4aXMsIFwiZGlzcGxheU5hbWVcIiwgJ1BvbGFyUmFkaXVzQXhpcycpO1xuX2RlZmluZVByb3BlcnR5KFBvbGFyUmFkaXVzQXhpcywgXCJheGlzVHlwZVwiLCBBWElTX1RZUEUpO1xuX2RlZmluZVByb3BlcnR5KFBvbGFyUmFkaXVzQXhpcywgXCJkZWZhdWx0UHJvcHNcIiwgZGVmYXVsdFBvbGFyUmFkaXVzQXhpc1Byb3BzKTsiLCJ2YXIgX2V4Y2x1ZGVkID0gW1wiY2hpbGRyZW5cIl07XG5mdW5jdGlvbiBfZXh0ZW5kcygpIHsgcmV0dXJuIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiA/IE9iamVjdC5hc3NpZ24uYmluZCgpIDogZnVuY3Rpb24gKG4pIHsgZm9yICh2YXIgZSA9IDE7IGUgPCBhcmd1bWVudHMubGVuZ3RoOyBlKyspIHsgdmFyIHQgPSBhcmd1bWVudHNbZV07IGZvciAodmFyIHIgaW4gdCkgKHt9KS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHQsIHIpICYmIChuW3JdID0gdFtyXSk7IH0gcmV0dXJuIG47IH0sIF9leHRlbmRzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7IH1cbmZ1bmN0aW9uIG93bktleXMoZSwgcikgeyB2YXIgdCA9IE9iamVjdC5rZXlzKGUpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IHIgJiYgKG8gPSBvLmZpbHRlcihmdW5jdGlvbiAocikgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihlLCByKS5lbnVtZXJhYmxlOyB9KSksIHQucHVzaC5hcHBseSh0LCBvKTsgfSByZXR1cm4gdDsgfVxuZnVuY3Rpb24gX29iamVjdFNwcmVhZChlKSB7IGZvciAodmFyIHIgPSAxOyByIDwgYXJndW1lbnRzLmxlbmd0aDsgcisrKSB7IHZhciB0ID0gbnVsbCAhPSBhcmd1bWVudHNbcl0gPyBhcmd1bWVudHNbcl0gOiB7fTsgciAlIDIgPyBvd25LZXlzKE9iamVjdCh0KSwgITApLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgX2RlZmluZVByb3BlcnR5KGUsIHIsIHRbcl0pOyB9KSA6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModCkpIDogb3duS2V5cyhPYmplY3QodCkpLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodCwgcikpOyB9KTsgfSByZXR1cm4gZTsgfVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KGUsIHIsIHQpIHsgcmV0dXJuIChyID0gX3RvUHJvcGVydHlLZXkocikpIGluIGUgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgeyB2YWx1ZTogdCwgZW51bWVyYWJsZTogITAsIGNvbmZpZ3VyYWJsZTogITAsIHdyaXRhYmxlOiAhMCB9KSA6IGVbcl0gPSB0LCBlOyB9XG5mdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleSh0KSB7IHZhciBpID0gX3RvUHJpbWl0aXZlKHQsIFwic3RyaW5nXCIpOyByZXR1cm4gXCJzeW1ib2xcIiA9PSB0eXBlb2YgaSA/IGkgOiBpICsgXCJcIjsgfVxuZnVuY3Rpb24gX3RvUHJpbWl0aXZlKHQsIHIpIHsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIHQgfHwgIXQpIHJldHVybiB0OyB2YXIgZSA9IHRbU3ltYm9sLnRvUHJpbWl0aXZlXTsgaWYgKHZvaWQgMCAhPT0gZSkgeyB2YXIgaSA9IGUuY2FsbCh0LCByIHx8IFwiZGVmYXVsdFwiKTsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIGkpIHJldHVybiBpOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7IH0gcmV0dXJuIChcInN0cmluZ1wiID09PSByID8gU3RyaW5nIDogTnVtYmVyKSh0KTsgfVxuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKGUsIHQpIHsgaWYgKG51bGwgPT0gZSkgcmV0dXJuIHt9OyB2YXIgbywgciwgaSA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKGUsIHQpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IGZvciAociA9IDA7IHIgPCBuLmxlbmd0aDsgcisrKSBvID0gbltyXSwgLTEgPT09IHQuaW5kZXhPZihvKSAmJiB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKGUsIG8pICYmIChpW29dID0gZVtvXSk7IH0gcmV0dXJuIGk7IH1cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKHIsIGUpIHsgaWYgKG51bGwgPT0gcikgcmV0dXJuIHt9OyB2YXIgdCA9IHt9OyBmb3IgKHZhciBuIGluIHIpIGlmICh7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHIsIG4pKSB7IGlmICgtMSAhPT0gZS5pbmRleE9mKG4pKSBjb250aW51ZTsgdFtuXSA9IHJbbl07IH0gcmV0dXJuIHQ7IH1cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IFB1cmVDb21wb25lbnQsIHVzZUVmZmVjdCwgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IExheWVyIH0gZnJvbSAnLi4vY29udGFpbmVyL0xheWVyJztcbmltcG9ydCB7IERvdCB9IGZyb20gJy4uL3NoYXBlL0RvdCc7XG5pbXBvcnQgeyBQb2x5Z29uIH0gZnJvbSAnLi4vc2hhcGUvUG9seWdvbic7XG5pbXBvcnQgeyBUZXh0IH0gZnJvbSAnLi4vY29tcG9uZW50L1RleHQnO1xuaW1wb3J0IHsgYWRhcHRFdmVudHNPZkNoaWxkIH0gZnJvbSAnLi4vdXRpbC90eXBlcyc7XG5pbXBvcnQgeyBkZWdyZWVUb1JhZGlhbiwgZ2V0VGlja0NsYXNzTmFtZSwgcG9sYXJUb0NhcnRlc2lhbiB9IGZyb20gJy4uL3V0aWwvUG9sYXJVdGlscyc7XG5pbXBvcnQgeyBhZGRBbmdsZUF4aXMsIHJlbW92ZUFuZ2xlQXhpcyB9IGZyb20gJy4uL3N0YXRlL3BvbGFyQXhpc1NsaWNlJztcbmltcG9ydCB7IHVzZUFwcERpc3BhdGNoLCB1c2VBcHBTZWxlY3RvciB9IGZyb20gJy4uL3N0YXRlL2hvb2tzJztcbmltcG9ydCB7IHNlbGVjdFBvbGFyQXhpc1NjYWxlLCBzZWxlY3RQb2xhckF4aXNUaWNrcyB9IGZyb20gJy4uL3N0YXRlL3NlbGVjdG9ycy9wb2xhclNjYWxlU2VsZWN0b3JzJztcbmltcG9ydCB7IHNlbGVjdEFuZ2xlQXhpcywgc2VsZWN0UG9sYXJWaWV3Qm94IH0gZnJvbSAnLi4vc3RhdGUvc2VsZWN0b3JzL3BvbGFyQXhpc1NlbGVjdG9ycyc7XG5pbXBvcnQgeyBkZWZhdWx0UG9sYXJBbmdsZUF4aXNQcm9wcyB9IGZyb20gJy4vZGVmYXVsdFBvbGFyQW5nbGVBeGlzUHJvcHMnO1xuaW1wb3J0IHsgdXNlSXNQYW5vcmFtYSB9IGZyb20gJy4uL2NvbnRleHQvUGFub3JhbWFDb250ZXh0JztcbmltcG9ydCB7IHN2Z1Byb3BlcnRpZXNOb0V2ZW50cywgc3ZnUHJvcGVydGllc05vRXZlbnRzRnJvbVVua25vd24gfSBmcm9tICcuLi91dGlsL3N2Z1Byb3BlcnRpZXNOb0V2ZW50cyc7XG52YXIgZXBzID0gMWUtNTtcbnZhciBDT1NfNDUgPSBNYXRoLmNvcyhkZWdyZWVUb1JhZGlhbig0NSkpO1xuXG4vKipcbiAqIFRoZXNlIGFyZSBpbmplY3RlZCBmcm9tIFJlZHV4LCBhcmUgcmVxdWlyZWQsIGJ1dCBjYW5ub3QgYmUgc2V0IGJ5IHVzZXIuXG4gKi9cblxudmFyIEFYSVNfVFlQRSA9ICdhbmdsZUF4aXMnO1xuZnVuY3Rpb24gU2V0QW5nbGVBeGlzU2V0dGluZ3MocHJvcHMpIHtcbiAgdmFyIGRpc3BhdGNoID0gdXNlQXBwRGlzcGF0Y2goKTtcbiAgdmFyIHNldHRpbmdzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgdmFyIHtcbiAgICAgICAgY2hpbGRyZW5cbiAgICAgIH0gPSBwcm9wcyxcbiAgICAgIHJlc3QgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMocHJvcHMsIF9leGNsdWRlZCk7XG4gICAgcmV0dXJuIHJlc3Q7XG4gIH0sIFtwcm9wc10pO1xuICB2YXIgc3luY2hyb25pemVkU2V0dGluZ3MgPSB1c2VBcHBTZWxlY3RvcihzdGF0ZSA9PiBzZWxlY3RBbmdsZUF4aXMoc3RhdGUsIHNldHRpbmdzLmlkKSk7XG4gIHZhciBzZXR0aW5nc0FyZVN5bmNocm9uaXplZCA9IHNldHRpbmdzID09PSBzeW5jaHJvbml6ZWRTZXR0aW5ncztcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBkaXNwYXRjaChhZGRBbmdsZUF4aXMoc2V0dGluZ3MpKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgZGlzcGF0Y2gocmVtb3ZlQW5nbGVBeGlzKHNldHRpbmdzKSk7XG4gICAgfTtcbiAgfSwgW2Rpc3BhdGNoLCBzZXR0aW5nc10pO1xuICBpZiAoc2V0dGluZ3NBcmVTeW5jaHJvbml6ZWQpIHtcbiAgICByZXR1cm4gcHJvcHMuY2hpbGRyZW47XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlIHRoZSBjb29yZGluYXRlIG9mIGxpbmUgZW5kcG9pbnRcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIGlmIHRoZXJlIGFyZSB0aWNrc1xuICogQHBhcmFtIHByb3BzIGF4aXMgc2V0dGluZ3NcbiAqIEByZXR1cm4gKHgxLCB5MSk6IFRoZSBwb2ludCBjbG9zZSB0byB0ZXh0LFxuICogICAgICAgICAoeDIsIHkyKTogVGhlIHBvaW50IGNsb3NlIHRvIGF4aXNcbiAqL1xudmFyIGdldFRpY2tMaW5lQ29vcmQgPSAoZGF0YSwgcHJvcHMpID0+IHtcbiAgdmFyIHtcbiAgICBjeCxcbiAgICBjeSxcbiAgICByYWRpdXMsXG4gICAgb3JpZW50YXRpb24sXG4gICAgdGlja1NpemVcbiAgfSA9IHByb3BzO1xuICB2YXIgdGlja0xpbmVTaXplID0gdGlja1NpemUgfHwgODtcbiAgdmFyIHAxID0gcG9sYXJUb0NhcnRlc2lhbihjeCwgY3ksIHJhZGl1cywgZGF0YS5jb29yZGluYXRlKTtcbiAgdmFyIHAyID0gcG9sYXJUb0NhcnRlc2lhbihjeCwgY3ksIHJhZGl1cyArIChvcmllbnRhdGlvbiA9PT0gJ2lubmVyJyA/IC0xIDogMSkgKiB0aWNrTGluZVNpemUsIGRhdGEuY29vcmRpbmF0ZSk7XG4gIHJldHVybiB7XG4gICAgeDE6IHAxLngsXG4gICAgeTE6IHAxLnksXG4gICAgeDI6IHAyLngsXG4gICAgeTI6IHAyLnlcbiAgfTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSB0ZXh0LWFuY2hvciBvZiBlYWNoIHRpY2tcbiAqIEBwYXJhbSBkYXRhIERhdGEgb2YgdGlja3NcbiAqIEBwYXJhbSBvcmllbnRhdGlvbiBvZiB0aGUgYXhpcyB0aWNrc1xuICogQHJldHVybiB0ZXh0LWFuY2hvclxuICovXG52YXIgZ2V0VGlja1RleHRBbmNob3IgPSAoZGF0YSwgb3JpZW50YXRpb24pID0+IHtcbiAgdmFyIGNvcyA9IE1hdGguY29zKGRlZ3JlZVRvUmFkaWFuKC1kYXRhLmNvb3JkaW5hdGUpKTtcbiAgaWYgKGNvcyA+IGVwcykge1xuICAgIHJldHVybiBvcmllbnRhdGlvbiA9PT0gJ291dGVyJyA/ICdzdGFydCcgOiAnZW5kJztcbiAgfVxuICBpZiAoY29zIDwgLWVwcykge1xuICAgIHJldHVybiBvcmllbnRhdGlvbiA9PT0gJ291dGVyJyA/ICdlbmQnIDogJ3N0YXJ0JztcbiAgfVxuICByZXR1cm4gJ21pZGRsZSc7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgdGV4dCB2ZXJ0aWNhbCBhbmNob3Igb2YgZWFjaCB0aWNrXG4gKiBAcGFyYW0gZGF0YSBEYXRhIG9mIGEgdGlja1xuICogQHJldHVybiB0ZXh0IHZlcnRpY2FsIGFuY2hvclxuICovXG52YXIgZ2V0VGlja1RleHRWZXJ0aWNhbEFuY2hvciA9IGRhdGEgPT4ge1xuICB2YXIgY29zID0gTWF0aC5jb3MoZGVncmVlVG9SYWRpYW4oLWRhdGEuY29vcmRpbmF0ZSkpO1xuICB2YXIgc2luID0gTWF0aC5zaW4oZGVncmVlVG9SYWRpYW4oLWRhdGEuY29vcmRpbmF0ZSkpO1xuXG4gIC8vIGhhbmRsZSB0b3AgYW5kIGJvdHRvbSBzZWN0b3JzOiA5MMKxNDVkZWcgYW5kIDI3MMKxNDVkZWdcbiAgaWYgKE1hdGguYWJzKGNvcykgPD0gQ09TXzQ1KSB7XG4gICAgLy8gc2luID4gMDogdG9wIHNlY3Rvciwgc2luIDwgMDogYm90dG9tIHNlY3RvclxuICAgIHJldHVybiBzaW4gPiAwID8gJ3N0YXJ0JyA6ICdlbmQnO1xuICB9XG4gIHJldHVybiAnbWlkZGxlJztcbn07XG52YXIgQXhpc0xpbmUgPSBwcm9wcyA9PiB7XG4gIHZhciB7XG4gICAgY3gsXG4gICAgY3ksXG4gICAgcmFkaXVzLFxuICAgIGF4aXNMaW5lVHlwZSxcbiAgICBheGlzTGluZSxcbiAgICB0aWNrc1xuICB9ID0gcHJvcHM7XG4gIGlmICghYXhpc0xpbmUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgYXhpc0xpbmVQcm9wcyA9IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgc3ZnUHJvcGVydGllc05vRXZlbnRzKHByb3BzKSksIHt9LCB7XG4gICAgZmlsbDogJ25vbmUnXG4gIH0sIHN2Z1Byb3BlcnRpZXNOb0V2ZW50cyhheGlzTGluZSkpO1xuICBpZiAoYXhpc0xpbmVUeXBlID09PSAnY2lyY2xlJykge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3Igd3JvbmcgU1ZHIGVsZW1lbnQgdHlwZVxuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChEb3QsIF9leHRlbmRzKHtcbiAgICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1wb2xhci1hbmdsZS1heGlzLWxpbmVcIlxuICAgIH0sIGF4aXNMaW5lUHJvcHMsIHtcbiAgICAgIGN4OiBjeCxcbiAgICAgIGN5OiBjeSxcbiAgICAgIHI6IHJhZGl1c1xuICAgIH0pKTtcbiAgfVxuICB2YXIgcG9pbnRzID0gdGlja3MubWFwKGVudHJ5ID0+IHBvbGFyVG9DYXJ0ZXNpYW4oY3gsIGN5LCByYWRpdXMsIGVudHJ5LmNvb3JkaW5hdGUpKTtcblxuICAvLyBAdHMtZXhwZWN0LWVycm9yIHdyb25nIFNWRyBlbGVtZW50IHR5cGVcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFBvbHlnb24sIF9leHRlbmRzKHtcbiAgICBjbGFzc05hbWU6IFwicmVjaGFydHMtcG9sYXItYW5nbGUtYXhpcy1saW5lXCJcbiAgfSwgYXhpc0xpbmVQcm9wcywge1xuICAgIHBvaW50czogcG9pbnRzXG4gIH0pKTtcbn07XG52YXIgVGlja0l0ZW1UZXh0ID0gX3JlZiA9PiB7XG4gIHZhciB7XG4gICAgdGljayxcbiAgICB0aWNrUHJvcHMsXG4gICAgdmFsdWVcbiAgfSA9IF9yZWY7XG4gIGlmICghdGljaykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmICgvKiNfX1BVUkVfXyovUmVhY3QuaXNWYWxpZEVsZW1lbnQodGljaykpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGVsZW1lbnQgY2xvbmluZyBtYWtlcyB0eXBlc2NyaXB0IHVuaGFwcHkgYW5kIG1lIHRvb1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY2xvbmVFbGVtZW50KHRpY2ssIHRpY2tQcm9wcyk7XG4gIH1cbiAgaWYgKHR5cGVvZiB0aWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIHRpY2sodGlja1Byb3BzKTtcbiAgfVxuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoVGV4dCwgX2V4dGVuZHMoe30sIHRpY2tQcm9wcywge1xuICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1wb2xhci1hbmdsZS1heGlzLXRpY2stdmFsdWVcIlxuICB9KSwgdmFsdWUpO1xufTtcbnZhciBUaWNrcyA9IHByb3BzID0+IHtcbiAgdmFyIHtcbiAgICB0aWNrLFxuICAgIHRpY2tMaW5lLFxuICAgIHRpY2tGb3JtYXR0ZXIsXG4gICAgc3Ryb2tlLFxuICAgIHRpY2tzXG4gIH0gPSBwcm9wcztcbiAgdmFyIGF4aXNQcm9wcyA9IHN2Z1Byb3BlcnRpZXNOb0V2ZW50cyhwcm9wcyk7XG4gIHZhciBjdXN0b21UaWNrUHJvcHMgPSBzdmdQcm9wZXJ0aWVzTm9FdmVudHNGcm9tVW5rbm93bih0aWNrKTtcbiAgdmFyIHRpY2tMaW5lUHJvcHMgPSBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGF4aXNQcm9wcyksIHt9LCB7XG4gICAgZmlsbDogJ25vbmUnXG4gIH0sIHN2Z1Byb3BlcnRpZXNOb0V2ZW50cyh0aWNrTGluZSkpO1xuICB2YXIgaXRlbXMgPSB0aWNrcy5tYXAoKGVudHJ5LCBpKSA9PiB7XG4gICAgdmFyIGxpbmVDb29yZCA9IGdldFRpY2tMaW5lQ29vcmQoZW50cnksIHByb3BzKTtcbiAgICB2YXIgdGV4dEFuY2hvciA9IGdldFRpY2tUZXh0QW5jaG9yKGVudHJ5LCBwcm9wcy5vcmllbnRhdGlvbik7XG4gICAgdmFyIHZlcnRpY2FsQW5jaG9yID0gZ2V0VGlja1RleHRWZXJ0aWNhbEFuY2hvcihlbnRyeSk7XG4gICAgdmFyIHRpY2tQcm9wcyA9IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBheGlzUHJvcHMpLCB7fSwge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBjdXN0b21UaWNrUHJvcHMgaXMgY29udHJpYnV0aW5nIHVua25vd24gcHJvcHNcbiAgICAgIHRleHRBbmNob3IsXG4gICAgICB2ZXJ0aWNhbEFuY2hvcixcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgY3VzdG9tVGlja1Byb3BzIGlzIGNvbnRyaWJ1dGluZyB1bmtub3duIHByb3BzXG4gICAgICBzdHJva2U6ICdub25lJyxcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgY3VzdG9tVGlja1Byb3BzIGlzIGNvbnRyaWJ1dGluZyB1bmtub3duIHByb3BzXG4gICAgICBmaWxsOiBzdHJva2VcbiAgICB9LCBjdXN0b21UaWNrUHJvcHMpLCB7fSwge1xuICAgICAgaW5kZXg6IGksXG4gICAgICBwYXlsb2FkOiBlbnRyeSxcbiAgICAgIHg6IGxpbmVDb29yZC54MixcbiAgICAgIHk6IGxpbmVDb29yZC55MlxuICAgIH0pO1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwgX2V4dGVuZHMoe1xuICAgICAgY2xhc3NOYW1lOiBjbHN4KCdyZWNoYXJ0cy1wb2xhci1hbmdsZS1heGlzLXRpY2snLCBnZXRUaWNrQ2xhc3NOYW1lKHRpY2spKSxcbiAgICAgIGtleTogXCJ0aWNrLVwiLmNvbmNhdChlbnRyeS5jb29yZGluYXRlKVxuICAgIH0sIGFkYXB0RXZlbnRzT2ZDaGlsZChwcm9wcywgZW50cnksIGkpKSwgdGlja0xpbmUgJiYgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsaW5lXCIsIF9leHRlbmRzKHtcbiAgICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1wb2xhci1hbmdsZS1heGlzLXRpY2stbGluZVwiXG4gICAgfSwgdGlja0xpbmVQcm9wcywgbGluZUNvb3JkKSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFRpY2tJdGVtVGV4dCwge1xuICAgICAgdGljazogdGljayxcbiAgICAgIHRpY2tQcm9wczogdGlja1Byb3BzLFxuICAgICAgdmFsdWU6IHRpY2tGb3JtYXR0ZXIgPyB0aWNrRm9ybWF0dGVyKGVudHJ5LnZhbHVlLCBpKSA6IGVudHJ5LnZhbHVlXG4gICAgfSkpO1xuICB9KTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExheWVyLCB7XG4gICAgY2xhc3NOYW1lOiBcInJlY2hhcnRzLXBvbGFyLWFuZ2xlLWF4aXMtdGlja3NcIlxuICB9LCBpdGVtcyk7XG59O1xuZXhwb3J0IHZhciBQb2xhckFuZ2xlQXhpc1dyYXBwZXIgPSBkZWZhdWx0c0FuZElucHV0cyA9PiB7XG4gIHZhciB7XG4gICAgYW5nbGVBeGlzSWRcbiAgfSA9IGRlZmF1bHRzQW5kSW5wdXRzO1xuICB2YXIgdmlld0JveCA9IHVzZUFwcFNlbGVjdG9yKHNlbGVjdFBvbGFyVmlld0JveCk7XG4gIHZhciBzY2FsZSA9IHVzZUFwcFNlbGVjdG9yKHN0YXRlID0+IHNlbGVjdFBvbGFyQXhpc1NjYWxlKHN0YXRlLCAnYW5nbGVBeGlzJywgYW5nbGVBeGlzSWQpKTtcbiAgdmFyIGlzUGFub3JhbWEgPSB1c2VJc1Bhbm9yYW1hKCk7XG4gIHZhciB0aWNrcyA9IHVzZUFwcFNlbGVjdG9yKHN0YXRlID0+IHNlbGVjdFBvbGFyQXhpc1RpY2tzKHN0YXRlLCAnYW5nbGVBeGlzJywgYW5nbGVBeGlzSWQsIGlzUGFub3JhbWEpKTtcbiAgaWYgKHZpZXdCb3ggPT0gbnVsbCB8fCAhdGlja3MgfHwgIXRpY2tzLmxlbmd0aCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciBwcm9wcyA9IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBkZWZhdWx0c0FuZElucHV0cyksIHt9LCB7XG4gICAgc2NhbGVcbiAgfSwgdmlld0JveCksIHt9LCB7XG4gICAgcmFkaXVzOiB2aWV3Qm94Lm91dGVyUmFkaXVzXG4gIH0pO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGF5ZXIsIHtcbiAgICBjbGFzc05hbWU6IGNsc3goJ3JlY2hhcnRzLXBvbGFyLWFuZ2xlLWF4aXMnLCBBWElTX1RZUEUsIHByb3BzLmNsYXNzTmFtZSlcbiAgfSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQXhpc0xpbmUsIF9leHRlbmRzKHt9LCBwcm9wcywge1xuICAgIHRpY2tzOiB0aWNrc1xuICB9KSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFRpY2tzLCBfZXh0ZW5kcyh7fSwgcHJvcHMsIHtcbiAgICB0aWNrczogdGlja3NcbiAgfSkpKTtcbn07XG5leHBvcnQgY2xhc3MgUG9sYXJBbmdsZUF4aXMgZXh0ZW5kcyBQdXJlQ29tcG9uZW50IHtcbiAgcmVuZGVyKCkge1xuICAgIGlmICh0aGlzLnByb3BzLnJhZGl1cyA8PSAwKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2V0QW5nbGVBeGlzU2V0dGluZ3MsIHtcbiAgICAgIGlkOiB0aGlzLnByb3BzLmFuZ2xlQXhpc0lkLFxuICAgICAgc2NhbGU6IHRoaXMucHJvcHMuc2NhbGUsXG4gICAgICB0eXBlOiB0aGlzLnByb3BzLnR5cGUsXG4gICAgICBkYXRhS2V5OiB0aGlzLnByb3BzLmRhdGFLZXksXG4gICAgICB1bml0OiB1bmRlZmluZWQsXG4gICAgICBuYW1lOiB0aGlzLnByb3BzLm5hbWUsXG4gICAgICBhbGxvd0R1cGxpY2F0ZWRDYXRlZ29yeTogZmFsc2UgLy8gSWdub3JpbmcgdGhlIHByb3Agb24gcHVycG9zZSBiZWNhdXNlIGF4aXMgY2FsY3VsYXRpb24gYmVoYXZlcyBhcyBpZiBpdCB3YXMgZmFsc2UgYW5kIFRvb2x0aXAgcmVxdWlyZXMgaXQgdG8gYmUgdHJ1ZS5cbiAgICAgICxcbiAgICAgIGFsbG93RGF0YU92ZXJmbG93OiBmYWxzZSxcbiAgICAgIHJldmVyc2VkOiB0aGlzLnByb3BzLnJldmVyc2VkLFxuICAgICAgaW5jbHVkZUhpZGRlbjogZmFsc2UsXG4gICAgICBhbGxvd0RlY2ltYWxzOiB0aGlzLnByb3BzLmFsbG93RGVjaW1hbHMsXG4gICAgICB0aWNrQ291bnQ6IHRoaXMucHJvcHMudGlja0NvdW50XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRoZSB0eXBlIGRvZXMgbm90IG1hdGNoLiBJcyBSYWRpdXNBeGlzIHJlYWxseSBleHBlY3Rpbmcgd2hhdCBpdCBzYXlzP1xuICAgICAgLFxuICAgICAgdGlja3M6IHRoaXMucHJvcHMudGlja3MsXG4gICAgICB0aWNrOiB0aGlzLnByb3BzLnRpY2ssXG4gICAgICBkb21haW46IHRoaXMucHJvcHMuZG9tYWluXG4gICAgfSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUG9sYXJBbmdsZUF4aXNXcmFwcGVyLCB0aGlzLnByb3BzKSk7XG4gIH1cbn1cbl9kZWZpbmVQcm9wZXJ0eShQb2xhckFuZ2xlQXhpcywgXCJkaXNwbGF5TmFtZVwiLCAnUG9sYXJBbmdsZUF4aXMnKTtcbl9kZWZpbmVQcm9wZXJ0eShQb2xhckFuZ2xlQXhpcywgXCJheGlzVHlwZVwiLCBBWElTX1RZUEUpO1xuX2RlZmluZVByb3BlcnR5KFBvbGFyQW5nbGVBeGlzLCBcImRlZmF1bHRQcm9wc1wiLCBkZWZhdWx0UG9sYXJBbmdsZUF4aXNQcm9wcyk7IiwiLy8gXCJleHBvcnQgdHlwZVwiIGRlY2xhcmF0aW9ucyBvbiBzZXBhcmF0ZSBsaW5lcyBhcmUgaW4gdXNlXG4vLyB0byB3b3JrYXJvdW5kIGJhYmVsIGlzc3VlKHMpIDExNDY1IDEyNTc4XG4vL1xuXG4vLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2JhYmVsL2JhYmVsL2lzc3Vlcy8xMTQ2NCNpc3N1ZWNvbW1lbnQtNjE3NjA2ODk4XG5leHBvcnQgeyBTdXJmYWNlIH0gZnJvbSAnLi9jb250YWluZXIvU3VyZmFjZSc7XG5leHBvcnQgeyBMYXllciB9IGZyb20gJy4vY29udGFpbmVyL0xheWVyJztcbmV4cG9ydCB7IExlZ2VuZCB9IGZyb20gJy4vY29tcG9uZW50L0xlZ2VuZCc7XG5leHBvcnQgeyBEZWZhdWx0TGVnZW5kQ29udGVudCB9IGZyb20gJy4vY29tcG9uZW50L0RlZmF1bHRMZWdlbmRDb250ZW50JztcbmV4cG9ydCB7IFRvb2x0aXAgfSBmcm9tICcuL2NvbXBvbmVudC9Ub29sdGlwJztcbmV4cG9ydCB7IERlZmF1bHRUb29sdGlwQ29udGVudCB9IGZyb20gJy4vY29tcG9uZW50L0RlZmF1bHRUb29sdGlwQ29udGVudCc7XG5leHBvcnQgeyBSZXNwb25zaXZlQ29udGFpbmVyIH0gZnJvbSAnLi9jb21wb25lbnQvUmVzcG9uc2l2ZUNvbnRhaW5lcic7XG5leHBvcnQgeyBDZWxsIH0gZnJvbSAnLi9jb21wb25lbnQvQ2VsbCc7XG5leHBvcnQgeyBUZXh0IH0gZnJvbSAnLi9jb21wb25lbnQvVGV4dCc7XG5leHBvcnQgeyBMYWJlbCB9IGZyb20gJy4vY29tcG9uZW50L0xhYmVsJztcbmV4cG9ydCB7IExhYmVsTGlzdCB9IGZyb20gJy4vY29tcG9uZW50L0xhYmVsTGlzdCc7XG5leHBvcnQgeyBDdXN0b21pemVkIH0gZnJvbSAnLi9jb21wb25lbnQvQ3VzdG9taXplZCc7XG5leHBvcnQgeyBTZWN0b3IgfSBmcm9tICcuL3NoYXBlL1NlY3Rvcic7XG5leHBvcnQgeyBDdXJ2ZSB9IGZyb20gJy4vc2hhcGUvQ3VydmUnO1xuZXhwb3J0IHsgUmVjdGFuZ2xlIH0gZnJvbSAnLi9zaGFwZS9SZWN0YW5nbGUnO1xuZXhwb3J0IHsgUG9seWdvbiB9IGZyb20gJy4vc2hhcGUvUG9seWdvbic7XG5leHBvcnQgeyBEb3QgfSBmcm9tICcuL3NoYXBlL0RvdCc7XG5leHBvcnQgeyBDcm9zcyB9IGZyb20gJy4vc2hhcGUvQ3Jvc3MnO1xuZXhwb3J0IHsgU3ltYm9scyB9IGZyb20gJy4vc2hhcGUvU3ltYm9scyc7XG5leHBvcnQgeyBQb2xhckdyaWQgfSBmcm9tICcuL3BvbGFyL1BvbGFyR3JpZCc7XG5leHBvcnQgeyBQb2xhclJhZGl1c0F4aXMgfSBmcm9tICcuL3BvbGFyL1BvbGFyUmFkaXVzQXhpcyc7XG5leHBvcnQgeyBQb2xhckFuZ2xlQXhpcyB9IGZyb20gJy4vcG9sYXIvUG9sYXJBbmdsZUF4aXMnO1xuZXhwb3J0IHsgUGllIH0gZnJvbSAnLi9wb2xhci9QaWUnO1xuZXhwb3J0IHsgUmFkYXIgfSBmcm9tICcuL3BvbGFyL1JhZGFyJztcbmV4cG9ydCB7IFJhZGlhbEJhciB9IGZyb20gJy4vcG9sYXIvUmFkaWFsQmFyJztcbmV4cG9ydCB7IEJydXNoIH0gZnJvbSAnLi9jYXJ0ZXNpYW4vQnJ1c2gnO1xuZXhwb3J0IHsgUmVmZXJlbmNlTGluZSB9IGZyb20gJy4vY2FydGVzaWFuL1JlZmVyZW5jZUxpbmUnO1xuZXhwb3J0IHsgUmVmZXJlbmNlRG90IH0gZnJvbSAnLi9jYXJ0ZXNpYW4vUmVmZXJlbmNlRG90JztcbmV4cG9ydCB7IFJlZmVyZW5jZUFyZWEgfSBmcm9tICcuL2NhcnRlc2lhbi9SZWZlcmVuY2VBcmVhJztcbmV4cG9ydCB7IENhcnRlc2lhbkF4aXMgfSBmcm9tICcuL2NhcnRlc2lhbi9DYXJ0ZXNpYW5BeGlzJztcbmV4cG9ydCB7IENhcnRlc2lhbkdyaWQgfSBmcm9tICcuL2NhcnRlc2lhbi9DYXJ0ZXNpYW5HcmlkJztcbmV4cG9ydCB7IExpbmUgfSBmcm9tICcuL2NhcnRlc2lhbi9MaW5lJztcbmV4cG9ydCB7IEFyZWEgfSBmcm9tICcuL2NhcnRlc2lhbi9BcmVhJztcbmV4cG9ydCB7IEJhciB9IGZyb20gJy4vY2FydGVzaWFuL0Jhcic7XG5leHBvcnQgeyBTY2F0dGVyIH0gZnJvbSAnLi9jYXJ0ZXNpYW4vU2NhdHRlcic7XG5leHBvcnQgeyBYQXhpcyB9IGZyb20gJy4vY2FydGVzaWFuL1hBeGlzJztcbmV4cG9ydCB7IFlBeGlzIH0gZnJvbSAnLi9jYXJ0ZXNpYW4vWUF4aXMnO1xuZXhwb3J0IHsgWkF4aXMgfSBmcm9tICcuL2NhcnRlc2lhbi9aQXhpcyc7XG5leHBvcnQgeyBFcnJvckJhciB9IGZyb20gJy4vY2FydGVzaWFuL0Vycm9yQmFyJztcbmV4cG9ydCB7IExpbmVDaGFydCB9IGZyb20gJy4vY2hhcnQvTGluZUNoYXJ0JztcbmV4cG9ydCB7IEJhckNoYXJ0IH0gZnJvbSAnLi9jaGFydC9CYXJDaGFydCc7XG5leHBvcnQgeyBQaWVDaGFydCB9IGZyb20gJy4vY2hhcnQvUGllQ2hhcnQnO1xuZXhwb3J0IHsgVHJlZW1hcCB9IGZyb20gJy4vY2hhcnQvVHJlZW1hcCc7XG5leHBvcnQgeyBTYW5rZXkgfSBmcm9tICcuL2NoYXJ0L1NhbmtleSc7XG5leHBvcnQgeyBSYWRhckNoYXJ0IH0gZnJvbSAnLi9jaGFydC9SYWRhckNoYXJ0JztcbmV4cG9ydCB7IFNjYXR0ZXJDaGFydCB9IGZyb20gJy4vY2hhcnQvU2NhdHRlckNoYXJ0JztcbmV4cG9ydCB7IEFyZWFDaGFydCB9IGZyb20gJy4vY2hhcnQvQXJlYUNoYXJ0JztcbmV4cG9ydCB7IFJhZGlhbEJhckNoYXJ0IH0gZnJvbSAnLi9jaGFydC9SYWRpYWxCYXJDaGFydCc7XG5leHBvcnQgeyBDb21wb3NlZENoYXJ0IH0gZnJvbSAnLi9jaGFydC9Db21wb3NlZENoYXJ0JztcbmV4cG9ydCB7IFN1bmJ1cnN0Q2hhcnQgfSBmcm9tICcuL2NoYXJ0L1N1bmJ1cnN0Q2hhcnQnO1xuZXhwb3J0IHsgRnVubmVsIH0gZnJvbSAnLi9jYXJ0ZXNpYW4vRnVubmVsJztcbmV4cG9ydCB7IEZ1bm5lbENoYXJ0IH0gZnJvbSAnLi9jaGFydC9GdW5uZWxDaGFydCc7XG5leHBvcnQgeyBUcmFwZXpvaWQgfSBmcm9tICcuL3NoYXBlL1RyYXBlem9pZCc7XG5leHBvcnQgeyBHbG9iYWwgfSBmcm9tICcuL3V0aWwvR2xvYmFsJztcbi8qKiBleHBvcnQgZ2V0TmljZVRpY2tWYWx1ZXMgc28gdGhpcyBjYW4gYmUgdXNlZCBhcyBhIHJlcGxhY2VtZW50IGZvciB3aGF0IGlzIGluIHJlY2hhcnRzLXNjYWxlICovXG5leHBvcnQgeyBnZXROaWNlVGlja1ZhbHVlcyB9IGZyb20gJy4vdXRpbC9zY2FsZS9nZXROaWNlVGlja1ZhbHVlcyc7XG5leHBvcnQgeyB1c2VBY3RpdmVUb29sdGlwTGFiZWwsIHVzZU9mZnNldCwgdXNlUGxvdEFyZWEsIHVzZUFjdGl2ZVRvb2x0aXBEYXRhUG9pbnRzLCB1c2VYQXhpc0RvbWFpbiwgdXNlWUF4aXNEb21haW4gfSBmcm9tICcuL2hvb2tzJztcbmV4cG9ydCB7IHVzZUNoYXJ0SGVpZ2h0LCB1c2VDaGFydFdpZHRoLCB1c2VNYXJnaW4gfSBmcm9tICcuL2NvbnRleHQvY2hhcnRMYXlvdXRDb250ZXh0JzsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=