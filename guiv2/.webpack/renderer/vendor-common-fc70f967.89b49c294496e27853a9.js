"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[4460],{

/***/ 36507:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   L: () => (/* binding */ CategoricalChart)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _container_RootSurface__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(81943);
/* harmony import */ var _RechartsWrapper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(41940);
/* harmony import */ var _container_ClipPathProvider__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(84518);
/* harmony import */ var _util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(55448);
/* harmony import */ var _context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(19287);
var _excluded = ["width", "height", "responsive", "children", "className", "style", "compact", "title", "desc"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }







var CategoricalChart = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)((props, ref) => {
  var {
      width,
      height,
      responsive,
      children,
      className,
      style,
      compact,
      title,
      desc
    } = props,
    others = _objectWithoutProperties(props, _excluded);
  var attrs = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_4__/* .svgPropertiesNoEvents */ .uZ)(others);

  /*
   * The "compact" mode is used as the panorama within Brush.
   * However because `compact` is a public prop, let's assume that it can render outside of Brush too.
   */
  if (compact) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_5__/* .ReportChartSize */ .A3, {
      width: width,
      height: height
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_RootSurface__WEBPACK_IMPORTED_MODULE_1__/* .RootSurface */ .a, {
      otherAttributes: attrs,
      title: title,
      desc: desc
    }, children));
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_RechartsWrapper__WEBPACK_IMPORTED_MODULE_2__/* .RechartsWrapper */ .A, {
    className: className,
    style: style,
    width: width,
    height: height,
    responsive: responsive,
    onClick: props.onClick,
    onMouseLeave: props.onMouseLeave,
    onMouseEnter: props.onMouseEnter,
    onMouseMove: props.onMouseMove,
    onMouseDown: props.onMouseDown,
    onMouseUp: props.onMouseUp,
    onContextMenu: props.onContextMenu,
    onDoubleClick: props.onDoubleClick,
    onTouchStart: props.onTouchStart,
    onTouchMove: props.onTouchMove,
    onTouchEnd: props.onTouchEnd
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_RootSurface__WEBPACK_IMPORTED_MODULE_1__/* .RootSurface */ .a, {
    otherAttributes: attrs,
    title: title,
    desc: desc,
    ref: ref
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_ClipPathProvider__WEBPACK_IMPORTED_MODULE_3__/* .ClipPathProvider */ .f, null, children)));
});

/***/ }),

/***/ 41940:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ RechartsWrapper)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34164);
/* harmony import */ var _state_tooltipSlice__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(74531);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(49082);
/* harmony import */ var _state_mouseEventsMiddleware__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(8596);
/* harmony import */ var _synchronisation_useChartSynchronisation__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(63042);
/* harmony import */ var _state_keyboardEventsMiddleware__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(77232);
/* harmony import */ var _util_useReportScale__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(56956);
/* harmony import */ var _state_externalEventsMiddleware__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(73102);
/* harmony import */ var _state_touchEventsMiddleware__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(21077);
/* harmony import */ var _context_tooltipPortalContext__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(74354);
/* harmony import */ var _context_legendPortalContext__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(55846);
/* harmony import */ var _context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(19287);
/* harmony import */ var _component_ResponsiveContainer__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(28482);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(59744);
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
















var EventSynchronizer = () => {
  (0,_synchronisation_useChartSynchronisation__WEBPACK_IMPORTED_MODULE_5__/* .useSynchronisedEventsFromOtherCharts */ .l3)();
  return null;
};
function getNumberOrZero(value) {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    var parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return 0;
}
var ResponsiveDiv = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)((props, ref) => {
  var _props$style, _props$style2;
  var observerRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  var [sizes, setSizes] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
    containerWidth: getNumberOrZero((_props$style = props.style) === null || _props$style === void 0 ? void 0 : _props$style.width),
    containerHeight: getNumberOrZero((_props$style2 = props.style) === null || _props$style2 === void 0 ? void 0 : _props$style2.height)
  });
  var setContainerSize = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((newWidth, newHeight) => {
    setSizes(prevState => {
      var roundedWidth = Math.round(newWidth);
      var roundedHeight = Math.round(newHeight);
      if (prevState.containerWidth === roundedWidth && prevState.containerHeight === roundedHeight) {
        return prevState;
      }
      return {
        containerWidth: roundedWidth,
        containerHeight: roundedHeight
      };
    });
  }, []);
  var innerRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(node => {
    if (typeof ref === 'function') {
      ref(node);
    }
    if (node != null) {
      var {
        width: containerWidth,
        height: containerHeight
      } = node.getBoundingClientRect();
      setContainerSize(containerWidth, containerHeight);
      var callback = entries => {
        var {
          width,
          height
        } = entries[0].contentRect;
        setContainerSize(width, height);
      };
      var observer = new ResizeObserver(callback);
      observer.observe(node);
      observerRef.current = observer;
    }
  }, [ref, setContainerSize]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    return () => {
      var observer = observerRef.current;
      if (observer != null) {
        observer.disconnect();
      }
    };
  }, [setContainerSize]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_12__/* .ReportChartSize */ .A3, {
    width: sizes.containerWidth,
    height: sizes.containerHeight
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", _extends({
    ref: innerRef
  }, props)));
});
var ReadSizeOnceDiv = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)((props, ref) => {
  var {
    width,
    height
  } = props;
  var [sizes, setSizes] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
    containerWidth: getNumberOrZero(width),
    containerHeight: getNumberOrZero(height)
  });
  var setContainerSize = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((newWidth, newHeight) => {
    setSizes(prevState => {
      var roundedWidth = Math.round(newWidth);
      var roundedHeight = Math.round(newHeight);
      if (prevState.containerWidth === roundedWidth && prevState.containerHeight === roundedHeight) {
        return prevState;
      }
      return {
        containerWidth: roundedWidth,
        containerHeight: roundedHeight
      };
    });
  }, []);
  var innerRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(node => {
    if (typeof ref === 'function') {
      ref(node);
    }
    if (node != null) {
      var {
        width: containerWidth,
        height: containerHeight
      } = node.getBoundingClientRect();
      setContainerSize(containerWidth, containerHeight);
    }
  }, [ref, setContainerSize]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_12__/* .ReportChartSize */ .A3, {
    width: sizes.containerWidth,
    height: sizes.containerHeight
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", _extends({
    ref: innerRef
  }, props)));
});
var StaticDiv = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)((props, ref) => {
  var {
    width,
    height
  } = props;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_12__/* .ReportChartSize */ .A3, {
    width: width,
    height: height
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", _extends({
    ref: ref
  }, props)));
});
var NonResponsiveDiv = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)((props, ref) => {
  var {
    width,
    height
  } = props;
  if ((0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_14__/* .isPercent */ ._3)(width) || (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_14__/* .isPercent */ ._3)(height)) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ReadSizeOnceDiv, _extends({}, props, {
      ref: ref
    }));
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(StaticDiv, _extends({}, props, {
    ref: ref
  }));
});
function getWrapperDivComponent(responsive) {
  return responsive === true ? ResponsiveDiv : NonResponsiveDiv;
}
var RechartsWrapper = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)((props, ref) => {
  var {
    children,
    className,
    height: heightFromProps,
    onClick,
    onContextMenu,
    onDoubleClick,
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
    onMouseUp,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
    style,
    width: widthFromProps,
    responsive,
    dispatchTouchEvents = true
  } = props;
  var containerRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  var dispatch = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_3__/* .useAppDispatch */ .j)();
  var [tooltipPortal, setTooltipPortal] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  var [legendPortal, setLegendPortal] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  var setScaleRef = (0,_util_useReportScale__WEBPACK_IMPORTED_MODULE_7__/* .useReportScale */ .C)();
  var responsiveContainerCalculations = (0,_component_ResponsiveContainer__WEBPACK_IMPORTED_MODULE_13__/* .useResponsiveContainerContext */ .w)();
  var width = (responsiveContainerCalculations === null || responsiveContainerCalculations === void 0 ? void 0 : responsiveContainerCalculations.width) > 0 ? responsiveContainerCalculations.width : widthFromProps;
  var height = (responsiveContainerCalculations === null || responsiveContainerCalculations === void 0 ? void 0 : responsiveContainerCalculations.height) > 0 ? responsiveContainerCalculations.height : heightFromProps;
  var innerRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(node => {
    setScaleRef(node);
    if (typeof ref === 'function') {
      ref(node);
    }
    setTooltipPortal(node);
    setLegendPortal(node);
    if (node != null) {
      containerRef.current = node;
    }
  }, [setScaleRef, ref, setTooltipPortal, setLegendPortal]);
  var myOnClick = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(e => {
    dispatch((0,_state_mouseEventsMiddleware__WEBPACK_IMPORTED_MODULE_4__/* .mouseClickAction */ .ky)(e));
    dispatch((0,_state_externalEventsMiddleware__WEBPACK_IMPORTED_MODULE_8__/* .externalEventAction */ .y)({
      handler: onClick,
      reactEvent: e
    }));
  }, [dispatch, onClick]);
  var myOnMouseEnter = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(e => {
    dispatch((0,_state_mouseEventsMiddleware__WEBPACK_IMPORTED_MODULE_4__/* .mouseMoveAction */ .dj)(e));
    dispatch((0,_state_externalEventsMiddleware__WEBPACK_IMPORTED_MODULE_8__/* .externalEventAction */ .y)({
      handler: onMouseEnter,
      reactEvent: e
    }));
  }, [dispatch, onMouseEnter]);
  var myOnMouseLeave = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(e => {
    dispatch((0,_state_tooltipSlice__WEBPACK_IMPORTED_MODULE_2__/* .mouseLeaveChart */ .xS)());
    dispatch((0,_state_externalEventsMiddleware__WEBPACK_IMPORTED_MODULE_8__/* .externalEventAction */ .y)({
      handler: onMouseLeave,
      reactEvent: e
    }));
  }, [dispatch, onMouseLeave]);
  var myOnMouseMove = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(e => {
    dispatch((0,_state_mouseEventsMiddleware__WEBPACK_IMPORTED_MODULE_4__/* .mouseMoveAction */ .dj)(e));
    dispatch((0,_state_externalEventsMiddleware__WEBPACK_IMPORTED_MODULE_8__/* .externalEventAction */ .y)({
      handler: onMouseMove,
      reactEvent: e
    }));
  }, [dispatch, onMouseMove]);
  var onFocus = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    dispatch((0,_state_keyboardEventsMiddleware__WEBPACK_IMPORTED_MODULE_6__/* .focusAction */ .Ru)());
  }, [dispatch]);
  var onKeyDown = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(e => {
    dispatch((0,_state_keyboardEventsMiddleware__WEBPACK_IMPORTED_MODULE_6__/* .keyDownAction */ .uZ)(e.key));
  }, [dispatch]);
  var myOnContextMenu = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(e => {
    dispatch((0,_state_externalEventsMiddleware__WEBPACK_IMPORTED_MODULE_8__/* .externalEventAction */ .y)({
      handler: onContextMenu,
      reactEvent: e
    }));
  }, [dispatch, onContextMenu]);
  var myOnDoubleClick = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(e => {
    dispatch((0,_state_externalEventsMiddleware__WEBPACK_IMPORTED_MODULE_8__/* .externalEventAction */ .y)({
      handler: onDoubleClick,
      reactEvent: e
    }));
  }, [dispatch, onDoubleClick]);
  var myOnMouseDown = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(e => {
    dispatch((0,_state_externalEventsMiddleware__WEBPACK_IMPORTED_MODULE_8__/* .externalEventAction */ .y)({
      handler: onMouseDown,
      reactEvent: e
    }));
  }, [dispatch, onMouseDown]);
  var myOnMouseUp = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(e => {
    dispatch((0,_state_externalEventsMiddleware__WEBPACK_IMPORTED_MODULE_8__/* .externalEventAction */ .y)({
      handler: onMouseUp,
      reactEvent: e
    }));
  }, [dispatch, onMouseUp]);
  var myOnTouchStart = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(e => {
    dispatch((0,_state_externalEventsMiddleware__WEBPACK_IMPORTED_MODULE_8__/* .externalEventAction */ .y)({
      handler: onTouchStart,
      reactEvent: e
    }));
  }, [dispatch, onTouchStart]);

  /*
   * onTouchMove is special because it behaves different from mouse events.
   * Mouse events have 'enter' + 'leave' combo that notify us when the mouse is over
   * a certain element. Touch events don't have that; touch only gives us
   * start (finger down), end (finger up) and move (finger moving).
   * So we need to figure out which element the user is touching
   * ourselves. Fortunately, there's a convenient method for that:
   * https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint
   */
  var myOnTouchMove = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(e => {
    if (dispatchTouchEvents) {
      dispatch((0,_state_touchEventsMiddleware__WEBPACK_IMPORTED_MODULE_9__/* .touchEventAction */ .e)(e));
    }
    dispatch((0,_state_externalEventsMiddleware__WEBPACK_IMPORTED_MODULE_8__/* .externalEventAction */ .y)({
      handler: onTouchMove,
      reactEvent: e
    }));
  }, [dispatch, dispatchTouchEvents, onTouchMove]);
  var myOnTouchEnd = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(e => {
    dispatch((0,_state_externalEventsMiddleware__WEBPACK_IMPORTED_MODULE_8__/* .externalEventAction */ .y)({
      handler: onTouchEnd,
      reactEvent: e
    }));
  }, [dispatch, onTouchEnd]);
  var WrapperDiv = getWrapperDivComponent(responsive);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_tooltipPortalContext__WEBPACK_IMPORTED_MODULE_10__/* .TooltipPortalContext */ .$.Provider, {
    value: tooltipPortal
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_legendPortalContext__WEBPACK_IMPORTED_MODULE_11__/* .LegendPortalContext */ .t.Provider, {
    value: legendPortal
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(WrapperDiv, {
    width: width !== null && width !== void 0 ? width : style === null || style === void 0 ? void 0 : style.width,
    height: height !== null && height !== void 0 ? height : style === null || style === void 0 ? void 0 : style.height,
    className: (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)('recharts-wrapper', className),
    style: _objectSpread({
      position: 'relative',
      cursor: 'default',
      width,
      height
    }, style),
    onClick: myOnClick,
    onContextMenu: myOnContextMenu,
    onDoubleClick: myOnDoubleClick,
    onFocus: onFocus,
    onKeyDown: onKeyDown,
    onMouseDown: myOnMouseDown,
    onMouseEnter: myOnMouseEnter,
    onMouseLeave: myOnMouseLeave,
    onMouseMove: myOnMouseMove,
    onMouseUp: myOnMouseUp,
    onTouchEnd: myOnTouchEnd,
    onTouchMove: myOnTouchMove,
    onTouchStart: myOnTouchStart,
    ref: innerRef
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(EventSynchronizer, null), children)));
});

/***/ }),

/***/ 45721:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   b: () => (/* binding */ LineChart)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _state_optionsSlice__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(26960);
/* harmony import */ var _CartesianChart__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(72685);




var allowedTooltipTypes = ['axis'];
var LineChart = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)((props, ref) => {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_CartesianChart__WEBPACK_IMPORTED_MODULE_2__/* .CartesianChart */ .P, {
    chartName: "LineChart",
    defaultTooltipEventType: "axis",
    validateTooltipEventTypes: allowedTooltipTypes,
    tooltipPayloadSearcher: _state_optionsSlice__WEBPACK_IMPORTED_MODULE_1__/* .arrayTooltipSearcher */ .uN,
    categoricalChartProps: props,
    ref: ref
  });
});

/***/ }),

/***/ 50300:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Q: () => (/* binding */ AreaChart)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _state_optionsSlice__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(26960);
/* harmony import */ var _CartesianChart__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(72685);




var allowedTooltipTypes = ['axis'];
var AreaChart = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)((props, ref) => {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_CartesianChart__WEBPACK_IMPORTED_MODULE_2__/* .CartesianChart */ .P, {
    chartName: "AreaChart",
    defaultTooltipEventType: "axis",
    validateTooltipEventTypes: allowedTooltipTypes,
    tooltipPayloadSearcher: _state_optionsSlice__WEBPACK_IMPORTED_MODULE_1__/* .arrayTooltipSearcher */ .uN,
    categoricalChartProps: props,
    ref: ref
  });
});

/***/ }),

/***/ 62209:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   r: () => (/* binding */ PieChart)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _state_optionsSlice__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(26960);
/* harmony import */ var _PolarChart__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(92139);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(77404);





var allowedTooltipTypes = ['item'];
var defaultProps = {
  layout: 'centric',
  startAngle: 0,
  endAngle: 360,
  cx: '50%',
  cy: '50%',
  innerRadius: 0,
  outerRadius: '80%'
};
var PieChart = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)((props, ref) => {
  var propsWithDefaults = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_3__/* .resolveDefaultProps */ .e)(props, defaultProps);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_PolarChart__WEBPACK_IMPORTED_MODULE_2__/* .PolarChart */ .t, {
    chartName: "PieChart",
    defaultTooltipEventType: "item",
    validateTooltipEventTypes: allowedTooltipTypes,
    tooltipPayloadSearcher: _state_optionsSlice__WEBPACK_IMPORTED_MODULE_1__/* .arrayTooltipSearcher */ .uN,
    categoricalChartProps: propsWithDefaults,
    ref: ref
  });
});

/***/ }),

/***/ 66264:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   D: () => (/* binding */ RadialBarChart)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _state_optionsSlice__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(26960);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(77404);
/* harmony import */ var _PolarChart__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(92139);





var allowedTooltipTypes = ['axis', 'item'];
var defaultProps = {
  layout: 'radial',
  startAngle: 0,
  endAngle: 360,
  cx: '50%',
  cy: '50%',
  innerRadius: 0,
  outerRadius: '80%'
};
var RadialBarChart = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)((props, ref) => {
  var propsWithDefaults = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_2__/* .resolveDefaultProps */ .e)(props, defaultProps);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_PolarChart__WEBPACK_IMPORTED_MODULE_3__/* .PolarChart */ .t, {
    chartName: "RadialBarChart",
    defaultTooltipEventType: "axis",
    validateTooltipEventTypes: allowedTooltipTypes,
    tooltipPayloadSearcher: _state_optionsSlice__WEBPACK_IMPORTED_MODULE_1__/* .arrayTooltipSearcher */ .uN,
    categoricalChartProps: propsWithDefaults,
    ref: ref
  });
});

/***/ }),

/***/ 72685:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   P: () => (/* binding */ CartesianChart)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _state_RechartsStoreProvider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(11970);
/* harmony import */ var _context_chartDataContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(67965);
/* harmony import */ var _state_ReportMainChartProps__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2613);
/* harmony import */ var _state_ReportChartProps__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(69264);
/* harmony import */ var _CategoricalChart__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(36507);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(77404);
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }








var defaultMargin = {
  top: 5,
  right: 5,
  bottom: 5,
  left: 5
};
var defaultProps = {
  accessibilityLayer: true,
  layout: 'horizontal',
  stackOffset: 'none',
  barCategoryGap: '10%',
  barGap: 4,
  margin: defaultMargin,
  reverseStackOrder: false,
  syncMethod: 'index',
  responsive: false
};

/**
 * These are one-time, immutable options that decide the chart's behavior.
 * Users who wish to call CartesianChart may decide to pass these options explicitly,
 * but usually we would expect that they use one of the convenience components like BarChart, LineChart, etc.
 */

var CartesianChart = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)(function CartesianChart(props, ref) {
  var _categoricalChartProp;
  var rootChartProps = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_6__/* .resolveDefaultProps */ .e)(props.categoricalChartProps, defaultProps);
  var {
    chartName,
    defaultTooltipEventType,
    validateTooltipEventTypes,
    tooltipPayloadSearcher,
    categoricalChartProps
  } = props;
  var options = {
    chartName,
    defaultTooltipEventType,
    validateTooltipEventTypes,
    tooltipPayloadSearcher,
    eventEmitter: undefined
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_RechartsStoreProvider__WEBPACK_IMPORTED_MODULE_1__/* .RechartsStoreProvider */ .J, {
    preloadedState: {
      options
    },
    reduxStoreName: (_categoricalChartProp = categoricalChartProps.id) !== null && _categoricalChartProp !== void 0 ? _categoricalChartProp : chartName
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_chartDataContext__WEBPACK_IMPORTED_MODULE_2__/* .ChartDataContextProvider */ .TK, {
    chartData: categoricalChartProps.data
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_ReportMainChartProps__WEBPACK_IMPORTED_MODULE_3__/* .ReportMainChartProps */ .s, {
    layout: rootChartProps.layout,
    margin: rootChartProps.margin
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_ReportChartProps__WEBPACK_IMPORTED_MODULE_4__/* .ReportChartProps */ .p, {
    accessibilityLayer: rootChartProps.accessibilityLayer,
    barCategoryGap: rootChartProps.barCategoryGap,
    maxBarSize: rootChartProps.maxBarSize,
    stackOffset: rootChartProps.stackOffset,
    barGap: rootChartProps.barGap,
    barSize: rootChartProps.barSize,
    syncId: rootChartProps.syncId,
    syncMethod: rootChartProps.syncMethod,
    className: rootChartProps.className
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_CategoricalChart__WEBPACK_IMPORTED_MODULE_5__/* .CategoricalChart */ .L, _extends({}, rootChartProps, {
    ref: ref
  })));
});

/***/ }),

/***/ 82938:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* unused harmony exports sankeyPayloadSearcher, Sankey */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var es_toolkit_compat_maxBy__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(94338);
/* harmony import */ var es_toolkit_compat_maxBy__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(es_toolkit_compat_maxBy__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var es_toolkit_compat_sumBy__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(52067);
/* harmony import */ var es_toolkit_compat_sumBy__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(es_toolkit_compat_sumBy__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(80305);
/* harmony import */ var es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _container_Surface__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(49303);
/* harmony import */ var _container_Layer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(86069);
/* harmony import */ var _shape_Rectangle__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(34723);
/* harmony import */ var _util_ChartUtils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(33964);
/* harmony import */ var _context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(19287);
/* harmony import */ var _context_tooltipPortalContext__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(74354);
/* harmony import */ var _RechartsWrapper__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(41940);
/* harmony import */ var _state_RechartsStoreProvider__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(11970);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(49082);
/* harmony import */ var _state_tooltipSlice__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(74531);
/* harmony import */ var _state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(59482);
/* harmony import */ var _context_chartDataContext__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(67965);
/* harmony import */ var _util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(55448);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(77404);
/* harmony import */ var _util_isWellBehavedNumber__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(8813);
var _excluded = ["sourceX", "sourceY", "sourceControlX", "targetX", "targetY", "targetControlX", "linkWidth"],
  _excluded2 = ["className", "style", "children"];
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }




















var interpolationGenerator = (a, b) => {
  var ka = +a;
  var kb = b - ka;
  return t => ka + kb * t;
};
var centerY = node => node.y + node.dy / 2;
var getValue = entry => entry && entry.value || 0;
var getSumOfIds = (links, ids) => ids.reduce((result, id) => result + getValue(links[id]), 0);
var getSumWithWeightedSource = (tree, links, ids) => ids.reduce((result, id) => {
  var link = links[id];
  var sourceNode = tree[link.source];
  return result + centerY(sourceNode) * getValue(links[id]);
}, 0);
var getSumWithWeightedTarget = (tree, links, ids) => ids.reduce((result, id) => {
  var link = links[id];
  var targetNode = tree[link.target];
  return result + centerY(targetNode) * getValue(links[id]);
}, 0);
var ascendingY = (a, b) => a.y - b.y;
var searchTargetsAndSources = (links, id) => {
  var sourceNodes = [];
  var sourceLinks = [];
  var targetNodes = [];
  var targetLinks = [];
  for (var i = 0, len = links.length; i < len; i++) {
    var link = links[i];
    if (link.source === id) {
      targetNodes.push(link.target);
      targetLinks.push(i);
    }
    if (link.target === id) {
      sourceNodes.push(link.source);
      sourceLinks.push(i);
    }
  }
  return {
    sourceNodes,
    sourceLinks,
    targetLinks,
    targetNodes
  };
};
var updateDepthOfTargets = (tree, curNode) => {
  var {
    targetNodes
  } = curNode;
  for (var i = 0, len = targetNodes.length; i < len; i++) {
    var target = tree[targetNodes[i]];
    if (target) {
      target.depth = Math.max(curNode.depth + 1, target.depth);
      updateDepthOfTargets(tree, target);
    }
  }
};
var getNodesTree = (_ref, width, nodeWidth) => {
  var _maxBy$depth, _maxBy;
  var {
    nodes,
    links
  } = _ref;
  var tree = nodes.map((entry, index) => {
    var result = searchTargetsAndSources(links, index);
    return _objectSpread(_objectSpread(_objectSpread({}, entry), result), {}, {
      value: Math.max(getSumOfIds(links, result.sourceLinks), getSumOfIds(links, result.targetLinks)),
      depth: 0
    });
  });
  for (var i = 0, len = tree.length; i < len; i++) {
    var node = tree[i];
    if (!node.sourceNodes.length) {
      updateDepthOfTargets(tree, node);
    }
  }
  var maxDepth = (_maxBy$depth = (_maxBy = es_toolkit_compat_maxBy__WEBPACK_IMPORTED_MODULE_1___default()(tree, entry => entry.depth)) === null || _maxBy === void 0 ? void 0 : _maxBy.depth) !== null && _maxBy$depth !== void 0 ? _maxBy$depth : 0;
  if (maxDepth >= 1) {
    var childWidth = (width - nodeWidth) / maxDepth;
    for (var _i = 0, _len = tree.length; _i < _len; _i++) {
      var _node = tree[_i];
      if (!_node.targetNodes.length) {
        _node.depth = maxDepth;
      }
      _node.x = _node.depth * childWidth;
      _node.dx = nodeWidth;
    }
  }
  return {
    tree,
    maxDepth
  };
};
var getDepthTree = tree => {
  var result = [];
  for (var i = 0, len = tree.length; i < len; i++) {
    var node = tree[i];
    if (!result[node.depth]) {
      result[node.depth] = [];
    }
    result[node.depth].push(node);
  }
  return result;
};
var updateYOfTree = (depthTree, height, nodePadding, links) => {
  var yRatio = Math.min(...depthTree.map(nodes => (height - (nodes.length - 1) * nodePadding) / es_toolkit_compat_sumBy__WEBPACK_IMPORTED_MODULE_2___default()(nodes, getValue)));
  for (var d = 0, maxDepth = depthTree.length; d < maxDepth; d++) {
    for (var i = 0, len = depthTree[d].length; i < len; i++) {
      var node = depthTree[d][i];
      node.y = i;
      node.dy = node.value * yRatio;
    }
  }
  return links.map(link => _objectSpread(_objectSpread({}, link), {}, {
    dy: getValue(link) * yRatio
  }));
};
var resolveCollisions = function resolveCollisions(depthTree, height, nodePadding) {
  var sort = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
  for (var i = 0, len = depthTree.length; i < len; i++) {
    var nodes = depthTree[i];
    var n = nodes.length;

    // Sort by the value of y
    if (sort) {
      nodes.sort(ascendingY);
    }
    var y0 = 0;
    for (var j = 0; j < n; j++) {
      var node = nodes[j];
      var dy = y0 - node.y;
      if (dy > 0) {
        node.y += dy;
      }
      y0 = node.y + node.dy + nodePadding;
    }
    y0 = height + nodePadding;
    for (var _j = n - 1; _j >= 0; _j--) {
      var _node2 = nodes[_j];
      var _dy = _node2.y + _node2.dy + nodePadding - y0;
      if (_dy > 0) {
        _node2.y -= _dy;
        y0 = _node2.y;
      } else {
        break;
      }
    }
  }
};
var relaxLeftToRight = (tree, depthTree, links, alpha) => {
  for (var i = 0, maxDepth = depthTree.length; i < maxDepth; i++) {
    var nodes = depthTree[i];
    for (var j = 0, len = nodes.length; j < len; j++) {
      var node = nodes[j];
      if (node.sourceLinks.length) {
        var sourceSum = getSumOfIds(links, node.sourceLinks);
        var weightedSum = getSumWithWeightedSource(tree, links, node.sourceLinks);
        var y = weightedSum / sourceSum;
        node.y += (y - centerY(node)) * alpha;
      }
    }
  }
};
var relaxRightToLeft = (tree, depthTree, links, alpha) => {
  for (var i = depthTree.length - 1; i >= 0; i--) {
    var nodes = depthTree[i];
    for (var j = 0, len = nodes.length; j < len; j++) {
      var node = nodes[j];
      if (node.targetLinks.length) {
        var targetSum = getSumOfIds(links, node.targetLinks);
        var weightedSum = getSumWithWeightedTarget(tree, links, node.targetLinks);
        var y = weightedSum / targetSum;
        node.y += (y - centerY(node)) * alpha;
      }
    }
  }
};
var updateYOfLinks = (tree, links) => {
  for (var i = 0, len = tree.length; i < len; i++) {
    var node = tree[i];
    var sy = 0;
    var ty = 0;
    node.targetLinks.sort((a, b) => tree[links[a].target].y - tree[links[b].target].y);
    node.sourceLinks.sort((a, b) => tree[links[a].source].y - tree[links[b].source].y);
    for (var j = 0, tLen = node.targetLinks.length; j < tLen; j++) {
      var link = links[node.targetLinks[j]];
      if (link) {
        // @ts-expect-error we should refactor this to immutable
        link.sy = sy;
        sy += link.dy;
      }
    }
    for (var _j2 = 0, sLen = node.sourceLinks.length; _j2 < sLen; _j2++) {
      var _link = links[node.sourceLinks[_j2]];
      if (_link) {
        // @ts-expect-error we should refactor this to immutable
        _link.ty = ty;
        ty += _link.dy;
      }
    }
  }
};
var computeData = _ref2 => {
  var {
    data,
    width,
    height,
    iterations,
    nodeWidth,
    nodePadding,
    sort
  } = _ref2;
  var {
    links
  } = data;
  var {
    tree
  } = getNodesTree(data, width, nodeWidth);
  var depthTree = getDepthTree(tree);
  var linksWithDy = updateYOfTree(depthTree, height, nodePadding, links);
  resolveCollisions(depthTree, height, nodePadding, sort);
  var alpha = 1;
  for (var i = 1; i <= iterations; i++) {
    relaxRightToLeft(tree, depthTree, linksWithDy, alpha *= 0.99);
    resolveCollisions(depthTree, height, nodePadding, sort);
    relaxLeftToRight(tree, depthTree, linksWithDy, alpha);
    resolveCollisions(depthTree, height, nodePadding, sort);
  }
  updateYOfLinks(tree, linksWithDy);
  // @ts-expect-error updateYOfLinks modifies the links array to add sy and ty in place
  var newLinks = linksWithDy;
  return {
    nodes: tree,
    links: newLinks
  };
};
var getNodeCoordinateOfTooltip = item => {
  return {
    x: +item.x + +item.width / 2,
    y: +item.y + +item.height / 2
  };
};
var getLinkCoordinateOfTooltip = item => {
  return 'sourceX' in item ? {
    x: (item.sourceX + item.targetX) / 2,
    y: (item.sourceY + item.targetY) / 2
  } : undefined;
};
var getPayloadOfTooltip = (item, type, nameKey) => {
  var {
    payload
  } = item;
  if (type === 'node') {
    return {
      payload,
      name: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_7__/* .getValueByDataKey */ .kr)(payload, nameKey, ''),
      value: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_7__/* .getValueByDataKey */ .kr)(payload, 'value')
    };
  }
  if ('source' in payload && payload.source && payload.target) {
    var sourceName = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_7__/* .getValueByDataKey */ .kr)(payload.source, nameKey, '');
    var targetName = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_7__/* .getValueByDataKey */ .kr)(payload.target, nameKey, '');
    return {
      payload,
      name: "".concat(sourceName, " - ").concat(targetName),
      value: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_7__/* .getValueByDataKey */ .kr)(payload, 'value')
    };
  }
  return undefined;
};
var sankeyPayloadSearcher = (_, activeIndex, computedData, nameKey) => {
  if (activeIndex == null || typeof activeIndex !== 'string') {
    return undefined;
  }
  var splitIndex = activeIndex.split('-');
  var [targetType, index] = splitIndex;
  var item = es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_3___default()(computedData, "".concat(targetType, "s[").concat(index, "]"));
  if (item) {
    var payload = getPayloadOfTooltip(item, targetType, nameKey);
    return payload;
  }
  return undefined;
};
var options = {
  chartName: 'Sankey',
  defaultTooltipEventType: 'item',
  validateTooltipEventTypes: ['item'],
  tooltipPayloadSearcher: sankeyPayloadSearcher,
  eventEmitter: undefined
};
function getTooltipEntrySettings(props) {
  var {
    dataKey,
    nameKey,
    stroke,
    strokeWidth,
    fill,
    name,
    data
  } = props;
  return {
    dataDefinedOnItem: data,
    positions: undefined,
    settings: {
      stroke,
      strokeWidth,
      fill,
      dataKey,
      name,
      nameKey,
      color: fill,
      unit: '' // Sankey does not have unit, why?
    }
  };
}

// TODO: improve types - NodeOptions uses SankeyNode, LinkOptions uses LinkProps. Standardize.

// Why is margin not a Sankey prop? No clue. Probably it should be
var defaultSankeyMargin = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
};
function renderLinkItem(option, props) {
  if (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(option)) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(option, props);
  }
  if (typeof option === 'function') {
    return option(props);
  }
  var {
      sourceX,
      sourceY,
      sourceControlX,
      targetX,
      targetY,
      targetControlX,
      linkWidth
    } = props,
    others = _objectWithoutProperties(props, _excluded);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", _extends({
    className: "recharts-sankey-link",
    d: "\n          M".concat(sourceX, ",").concat(sourceY, "\n          C").concat(sourceControlX, ",").concat(sourceY, " ").concat(targetControlX, ",").concat(targetY, " ").concat(targetX, ",").concat(targetY, "\n        "),
    fill: "none",
    stroke: "#333",
    strokeWidth: linkWidth,
    strokeOpacity: "0.2"
  }, (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_16__/* .svgPropertiesNoEvents */ .uZ)(others)));
}
var buildLinkProps = _ref3 => {
  var {
    link,
    nodes,
    left,
    top,
    i,
    linkContent,
    linkCurvature
  } = _ref3;
  var {
    sy: sourceRelativeY,
    ty: targetRelativeY,
    dy: linkWidth
  } = link;
  var sourceNode = nodes[link.source];
  var targetNode = nodes[link.target];
  var sourceX = sourceNode.x + sourceNode.dx + left;
  var targetX = targetNode.x + left;
  var interpolationFunc = interpolationGenerator(sourceX, targetX);
  var sourceControlX = interpolationFunc(linkCurvature);
  var targetControlX = interpolationFunc(1 - linkCurvature);
  var sourceY = sourceNode.y + sourceRelativeY + linkWidth / 2 + top;
  var targetY = targetNode.y + targetRelativeY + linkWidth / 2 + top;
  var linkProps = _objectSpread({
    sourceX,
    // @ts-expect-error the linkContent from below is contributing unknown props
    targetX,
    sourceY,
    // @ts-expect-error the linkContent from below is contributing unknown props
    targetY,
    sourceControlX,
    targetControlX,
    sourceRelativeY,
    targetRelativeY,
    linkWidth,
    index: i,
    payload: _objectSpread(_objectSpread({}, link), {}, {
      source: sourceNode,
      target: targetNode
    })
  }, (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_16__/* .svgPropertiesNoEventsFromUnknown */ .ic)(linkContent));
  return linkProps;
};
function SankeyLinkElement(_ref4) {
  var {
    props,
    i,
    linkContent,
    onMouseEnter: _onMouseEnter,
    onMouseLeave: _onMouseLeave,
    onClick: _onClick,
    dataKey
  } = _ref4;
  var activeCoordinate = getLinkCoordinateOfTooltip(props);
  var activeIndex = "link-".concat(i);
  var dispatch = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_12__/* .useAppDispatch */ .j)();
  var events = {
    onMouseEnter: e => {
      dispatch((0,_state_tooltipSlice__WEBPACK_IMPORTED_MODULE_13__/* .setActiveMouseOverItemIndex */ .RD)({
        activeIndex,
        activeDataKey: dataKey,
        activeCoordinate
      }));
      _onMouseEnter(props, e);
    },
    onMouseLeave: e => {
      dispatch((0,_state_tooltipSlice__WEBPACK_IMPORTED_MODULE_13__/* .mouseLeaveItem */ .oP)());
      _onMouseLeave(props, e);
    },
    onClick: e => {
      dispatch((0,_state_tooltipSlice__WEBPACK_IMPORTED_MODULE_13__/* .setActiveClickItemIndex */ .ML)({
        activeIndex,
        activeDataKey: dataKey,
        activeCoordinate
      }));
      _onClick(props, e);
    }
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_5__/* .Layer */ .W, events, renderLinkItem(linkContent, props));
}
function AllSankeyLinkElements(_ref5) {
  var {
    modifiedLinks,
    links,
    linkContent,
    onMouseEnter,
    onMouseLeave,
    onClick,
    dataKey
  } = _ref5;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_5__/* .Layer */ .W, {
    className: "recharts-sankey-links",
    key: "recharts-sankey-links"
  }, links.map((link, i) => {
    var linkProps = modifiedLinks[i];
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(SankeyLinkElement, {
      key: "link-".concat(link.source, "-").concat(link.target, "-").concat(link.value),
      props: linkProps,
      linkContent: linkContent,
      i: i,
      onMouseEnter: onMouseEnter,
      onMouseLeave: onMouseLeave,
      onClick: onClick,
      dataKey: dataKey
    });
  }));
}
function renderNodeItem(option, props) {
  if (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(option)) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(option, props);
  }
  if (typeof option === 'function') {
    return option(props);
  }
  return (
    /*#__PURE__*/
    // @ts-expect-error recharts radius is not compatible with SVG radius
    react__WEBPACK_IMPORTED_MODULE_0__.createElement(_shape_Rectangle__WEBPACK_IMPORTED_MODULE_6__/* .Rectangle */ .M, _extends({
      className: "recharts-sankey-node",
      fill: "#0088fe",
      fillOpacity: "0.8"
    }, (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_16__/* .svgPropertiesNoEvents */ .uZ)(props)))
  );
}
var buildNodeProps = _ref6 => {
  var {
    node,
    nodeContent,
    top,
    left,
    i
  } = _ref6;
  var {
    x,
    y,
    dx,
    dy
  } = node;
  // @ts-expect-error nodeContent is passing in unknown props
  var nodeProps = _objectSpread(_objectSpread({}, (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_16__/* .svgPropertiesNoEventsFromUnknown */ .ic)(nodeContent)), {}, {
    x: x + left,
    y: y + top,
    width: dx,
    height: dy,
    index: i,
    payload: node
  });
  return nodeProps;
};
function NodeElement(_ref7) {
  var {
    props,
    nodeContent,
    i,
    onMouseEnter: _onMouseEnter2,
    onMouseLeave: _onMouseLeave2,
    onClick: _onClick2,
    dataKey
  } = _ref7;
  var dispatch = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_12__/* .useAppDispatch */ .j)();
  var activeCoordinate = getNodeCoordinateOfTooltip(props);
  var activeIndex = "node-".concat(i);
  var events = {
    onMouseEnter: e => {
      dispatch((0,_state_tooltipSlice__WEBPACK_IMPORTED_MODULE_13__/* .setActiveMouseOverItemIndex */ .RD)({
        activeIndex,
        activeDataKey: dataKey,
        activeCoordinate
      }));
      _onMouseEnter2(props, e);
    },
    onMouseLeave: e => {
      dispatch((0,_state_tooltipSlice__WEBPACK_IMPORTED_MODULE_13__/* .mouseLeaveItem */ .oP)());
      _onMouseLeave2(props, e);
    },
    onClick: e => {
      dispatch((0,_state_tooltipSlice__WEBPACK_IMPORTED_MODULE_13__/* .setActiveClickItemIndex */ .ML)({
        activeIndex,
        activeDataKey: dataKey,
        activeCoordinate
      }));
      _onClick2(props, e);
    }
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_5__/* .Layer */ .W, events, renderNodeItem(nodeContent, props));
}
function AllNodeElements(_ref8) {
  var {
    modifiedNodes,
    nodeContent,
    onMouseEnter,
    onMouseLeave,
    onClick,
    dataKey
  } = _ref8;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_5__/* .Layer */ .W, {
    className: "recharts-sankey-nodes",
    key: "recharts-sankey-nodes"
  }, modifiedNodes.map((modifiedNode, i) => {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(NodeElement, {
      key: "node-".concat(modifiedNode.index, "-").concat(modifiedNode.x, "-").concat(modifiedNode.y),
      props: modifiedNode,
      nodeContent: nodeContent,
      i: i,
      onMouseEnter: onMouseEnter,
      onMouseLeave: onMouseLeave,
      onClick: onClick,
      dataKey: dataKey
    });
  }));
}
var sankeyDefaultProps = {
  nameKey: 'name',
  dataKey: 'value',
  nodePadding: 10,
  nodeWidth: 10,
  linkCurvature: 0.5,
  iterations: 32,
  margin: {
    top: 5,
    right: 5,
    bottom: 5,
    left: 5
  },
  sort: true
};
function SankeyImpl(props) {
  var {
      className,
      style,
      children
    } = props,
    others = _objectWithoutProperties(props, _excluded2);
  var {
    link,
    dataKey,
    node,
    onMouseEnter,
    onMouseLeave,
    onClick,
    data,
    iterations,
    nodeWidth,
    nodePadding,
    sort,
    linkCurvature,
    margin
  } = props;
  var attrs = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_16__/* .svgPropertiesNoEvents */ .uZ)(others);
  var width = (0,_context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_8__/* .useChartWidth */ .yi)();
  var height = (0,_context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_8__/* .useChartHeight */ .rY)();
  var {
    links,
    modifiedLinks,
    modifiedNodes
  } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    var _margin$left, _margin$right, _margin$top, _margin$bottom;
    if (!data || !width || !height || width <= 0 || height <= 0) {
      return {
        nodes: [],
        links: [],
        modifiedLinks: [],
        modifiedNodes: []
      };
    }
    var contentWidth = width - ((_margin$left = margin.left) !== null && _margin$left !== void 0 ? _margin$left : 0) - ((_margin$right = margin.right) !== null && _margin$right !== void 0 ? _margin$right : 0);
    var contentHeight = height - ((_margin$top = margin.top) !== null && _margin$top !== void 0 ? _margin$top : 0) - ((_margin$bottom = margin.bottom) !== null && _margin$bottom !== void 0 ? _margin$bottom : 0);
    var computed = computeData({
      data,
      width: contentWidth,
      height: contentHeight,
      iterations,
      nodeWidth,
      nodePadding,
      sort
    });
    var top = margin.top || 0;
    var left = margin.left || 0;
    var newModifiedLinks = computed.links.map((l, i) => {
      return buildLinkProps({
        link: l,
        nodes: computed.nodes,
        i,
        top,
        left,
        linkContent: link,
        linkCurvature
      });
    });
    var newModifiedNodes = computed.nodes.map((n, i) => {
      return buildNodeProps({
        node: n,
        nodeContent: node,
        i,
        top,
        left
      });
    });
    return {
      nodes: computed.nodes,
      links: computed.links,
      modifiedLinks: newModifiedLinks,
      modifiedNodes: newModifiedNodes
    };
  }, [data, width, height, margin, iterations, nodeWidth, nodePadding, sort, link, node, linkCurvature]);
  var handleMouseEnter = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((item, type, e) => {
    if (onMouseEnter) {
      onMouseEnter(item, type, e);
    }
  }, [onMouseEnter]);
  var handleMouseLeave = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((item, type, e) => {
    if (onMouseLeave) {
      onMouseLeave(item, type, e);
    }
  }, [onMouseLeave]);
  var handleClick = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((item, type, e) => {
    if (onClick) {
      onClick(item, type, e);
    }
  }, [onClick]);
  if (!(0,_util_isWellBehavedNumber__WEBPACK_IMPORTED_MODULE_18__/* .isPositiveNumber */ .F)(width) || !(0,_util_isWellBehavedNumber__WEBPACK_IMPORTED_MODULE_18__/* .isPositiveNumber */ .F)(height) || !data || !data.links || !data.nodes) {
    return null;
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_chartDataContext__WEBPACK_IMPORTED_MODULE_15__/* .SetComputedData */ .qG, {
    computedData: {
      links: modifiedLinks,
      nodes: modifiedNodes
    }
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Surface__WEBPACK_IMPORTED_MODULE_4__/* .Surface */ .u, _extends({}, attrs, {
    width: width,
    height: height
  }), children, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(AllSankeyLinkElements, {
    links: links,
    modifiedLinks: modifiedLinks,
    linkContent: link,
    dataKey: dataKey,
    onMouseEnter: (linkProps, e) => handleMouseEnter(linkProps, 'link', e),
    onMouseLeave: (linkProps, e) => handleMouseLeave(linkProps, 'link', e),
    onClick: (linkProps, e) => handleClick(linkProps, 'link', e)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(AllNodeElements, {
    modifiedNodes: modifiedNodes,
    nodeContent: node,
    dataKey: dataKey,
    onMouseEnter: (nodeProps, e) => handleMouseEnter(nodeProps, 'node', e),
    onMouseLeave: (nodeProps, e) => handleMouseLeave(nodeProps, 'node', e),
    onClick: (nodeProps, e) => handleClick(nodeProps, 'node', e)
  })));
}
function Sankey(outsideProps) {
  var props = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_17__/* .resolveDefaultProps */ .e)(outsideProps, sankeyDefaultProps);
  var {
    width,
    height,
    style,
    className
  } = props;
  var [tooltipPortal, setTooltipPortal] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_RechartsStoreProvider__WEBPACK_IMPORTED_MODULE_11__/* .RechartsStoreProvider */ .J, {
    preloadedState: {
      options
    },
    reduxStoreName: className !== null && className !== void 0 ? className : 'Sankey'
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_14__/* .SetTooltipEntrySettings */ .r, {
    fn: getTooltipEntrySettings,
    args: props
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_8__/* .ReportChartSize */ .A3, {
    width: width,
    height: height
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_8__/* .ReportChartMargin */ .Ft, {
    margin: defaultSankeyMargin
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_RechartsWrapper__WEBPACK_IMPORTED_MODULE_10__/* .RechartsWrapper */ .A, {
    className: className,
    style: style,
    width: width,
    height: height
    /*
     * Sankey, same as Treemap, suffers from overfilling the container
     * and causing infinite render loops where the chart keeps growing.
     */,
    responsive: false,
    ref: node => {
      if (node && !tooltipPortal) {
        setTooltipPortal(node);
      }
    },
    onMouseEnter: undefined,
    onMouseLeave: undefined,
    onClick: undefined,
    onMouseMove: undefined,
    onMouseDown: undefined,
    onMouseUp: undefined,
    onContextMenu: undefined,
    onDoubleClick: undefined,
    onTouchStart: undefined,
    onTouchMove: undefined,
    onTouchEnd: undefined
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_tooltipPortalContext__WEBPACK_IMPORTED_MODULE_9__/* .TooltipPortalContext */ .$.Provider, {
    value: tooltipPortal
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(SankeyImpl, props))));
}
Sankey.displayName = 'Sankey';

/***/ }),

/***/ 85395:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* unused harmony export RadarChart */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _state_optionsSlice__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(26960);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(77404);
/* harmony import */ var _PolarChart__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(92139);





var allowedTooltipTypes = (/* unused pure expression or super */ null && (['axis']));
var defaultProps = {
  layout: 'centric',
  startAngle: 90,
  endAngle: -270,
  cx: '50%',
  cy: '50%',
  innerRadius: 0,
  outerRadius: '80%'
};
var RadarChart = /*#__PURE__*/(/* unused pure expression or super */ null && (forwardRef((props, ref) => {
  var propsWithDefaults = resolveDefaultProps(props, defaultProps);
  return /*#__PURE__*/React.createElement(PolarChart, {
    chartName: "RadarChart",
    defaultTooltipEventType: "axis",
    validateTooltipEventTypes: allowedTooltipTypes,
    tooltipPayloadSearcher: arrayTooltipSearcher,
    categoricalChartProps: propsWithDefaults,
    ref: ref
  });
})));

/***/ }),

/***/ 88131:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* unused harmony export FunnelChart */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _state_optionsSlice__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(26960);
/* harmony import */ var _CartesianChart__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(72685);




var allowedTooltipTypes = (/* unused pure expression or super */ null && (['item']));
var FunnelChart = /*#__PURE__*/(/* unused pure expression or super */ null && (forwardRef((props, ref) => {
  return /*#__PURE__*/React.createElement(CartesianChart, {
    chartName: "FunnelChart",
    defaultTooltipEventType: "item",
    validateTooltipEventTypes: allowedTooltipTypes,
    tooltipPayloadSearcher: arrayTooltipSearcher,
    categoricalChartProps: props,
    ref: ref
  });
})));

/***/ }),

/***/ 88224:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   E: () => (/* binding */ BarChart)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _state_optionsSlice__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(26960);
/* harmony import */ var _CartesianChart__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(72685);




var allowedTooltipTypes = ['axis', 'item'];
var BarChart = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)((props, ref) => {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_CartesianChart__WEBPACK_IMPORTED_MODULE_2__/* .CartesianChart */ .P, {
    chartName: "BarChart",
    defaultTooltipEventType: "axis",
    validateTooltipEventTypes: allowedTooltipTypes,
    tooltipPayloadSearcher: _state_optionsSlice__WEBPACK_IMPORTED_MODULE_1__/* .arrayTooltipSearcher */ .uN,
    categoricalChartProps: props,
    ref: ref
  });
});

/***/ }),

/***/ 92139:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   t: () => (/* binding */ PolarChart)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _state_RechartsStoreProvider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(11970);
/* harmony import */ var _context_chartDataContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(67965);
/* harmony import */ var _state_ReportMainChartProps__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2613);
/* harmony import */ var _state_ReportChartProps__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(69264);
/* harmony import */ var _state_ReportPolarOptions__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(15036);
/* harmony import */ var _CategoricalChart__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(36507);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(77404);
var _excluded = ["layout"];
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }









var defaultMargin = {
  top: 5,
  right: 5,
  bottom: 5,
  left: 5
};

/**
 * These default props are the same for all PolarChart components.
 */
var defaultProps = {
  accessibilityLayer: true,
  stackOffset: 'none',
  barCategoryGap: '10%',
  barGap: 4,
  margin: defaultMargin,
  reverseStackOrder: false,
  syncMethod: 'index',
  layout: 'radial',
  responsive: false
};

/**
 * These props are required for the PolarChart to function correctly.
 * Users usually would not need to specify these explicitly,
 * because the convenience components like PieChart, RadarChart, etc.
 * will provide these defaults.
 * We can't have the defaults in this file because each of those convenience components
 * have their own opinions about what they should be.
 */

/**
 * These are one-time, immutable options that decide the chart's behavior.
 * Users who wish to call CartesianChart may decide to pass these options explicitly,
 * but usually we would expect that they use one of the convenience components like PieChart, RadarChart, etc.
 */

var PolarChart = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)(function PolarChart(props, ref) {
  var _polarChartProps$id;
  var polarChartProps = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_7__/* .resolveDefaultProps */ .e)(props.categoricalChartProps, defaultProps);
  var {
      layout
    } = polarChartProps,
    otherCategoricalProps = _objectWithoutProperties(polarChartProps, _excluded);
  var {
    chartName,
    defaultTooltipEventType,
    validateTooltipEventTypes,
    tooltipPayloadSearcher
  } = props;
  var options = {
    chartName,
    defaultTooltipEventType,
    validateTooltipEventTypes,
    tooltipPayloadSearcher,
    eventEmitter: undefined
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_RechartsStoreProvider__WEBPACK_IMPORTED_MODULE_1__/* .RechartsStoreProvider */ .J, {
    preloadedState: {
      options
    },
    reduxStoreName: (_polarChartProps$id = polarChartProps.id) !== null && _polarChartProps$id !== void 0 ? _polarChartProps$id : chartName
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_chartDataContext__WEBPACK_IMPORTED_MODULE_2__/* .ChartDataContextProvider */ .TK, {
    chartData: polarChartProps.data
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_ReportMainChartProps__WEBPACK_IMPORTED_MODULE_3__/* .ReportMainChartProps */ .s, {
    layout: layout,
    margin: polarChartProps.margin
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_ReportChartProps__WEBPACK_IMPORTED_MODULE_4__/* .ReportChartProps */ .p, {
    accessibilityLayer: polarChartProps.accessibilityLayer,
    barCategoryGap: polarChartProps.barCategoryGap,
    maxBarSize: polarChartProps.maxBarSize,
    stackOffset: polarChartProps.stackOffset,
    barGap: polarChartProps.barGap,
    barSize: polarChartProps.barSize,
    syncId: polarChartProps.syncId,
    syncMethod: polarChartProps.syncMethod,
    className: polarChartProps.className
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_ReportPolarOptions__WEBPACK_IMPORTED_MODULE_5__/* .ReportPolarOptions */ .P, {
    cx: polarChartProps.cx,
    cy: polarChartProps.cy,
    startAngle: polarChartProps.startAngle,
    endAngle: polarChartProps.endAngle,
    innerRadius: polarChartProps.innerRadius,
    outerRadius: polarChartProps.outerRadius
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_CategoricalChart__WEBPACK_IMPORTED_MODULE_6__/* .CategoricalChart */ .L, _extends({}, otherCategoricalProps, {
    ref: ref
  })));
});

/***/ }),

/***/ 98207:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* unused harmony export ComposedChart */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _state_optionsSlice__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(26960);
/* harmony import */ var _CartesianChart__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(72685);




var allowedTooltipTypes = (/* unused pure expression or super */ null && (['axis']));
var ComposedChart = /*#__PURE__*/(/* unused pure expression or super */ null && (forwardRef((props, ref) => {
  return /*#__PURE__*/React.createElement(CartesianChart, {
    chartName: "ComposedChart",
    defaultTooltipEventType: "axis",
    validateTooltipEventTypes: allowedTooltipTypes,
    tooltipPayloadSearcher: arrayTooltipSearcher,
    categoricalChartProps: props,
    ref: ref
  });
})));

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVuZG9yLWNvbW1vbi1mYzcwZjk2Ny5kMGFmMzc2ZTg4ZjI2ODg1Yzk1Zi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBLDBDQUEwQywwQkFBMEIsbURBQW1ELG9DQUFvQyx5Q0FBeUMsWUFBWSxjQUFjLHdDQUF3QyxxREFBcUQ7QUFDM1QsK0NBQStDLDBCQUEwQixZQUFZLHVCQUF1Qiw4QkFBOEIsbUNBQW1DLGVBQWU7QUFDN0o7QUFDSTtBQUNvQjtBQUNIO0FBQ2E7QUFDSztBQUNOO0FBQ3pELG9DQUFvQyxpREFBVTtBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLGNBQWMsNEZBQXFCOztBQUVuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdEQUFtQixDQUFDLDJDQUFjLHFCQUFxQixnREFBbUIsQ0FBQyxrRkFBZTtBQUNsSDtBQUNBO0FBQ0EsS0FBSyxnQkFBZ0IsZ0RBQW1CLENBQUMsd0VBQVc7QUFDcEQ7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0Esc0JBQXNCLGdEQUFtQixDQUFDLHNFQUFlO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRyxlQUFlLGdEQUFtQixDQUFDLHdFQUFXO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRyxlQUFlLGdEQUFtQixDQUFDLGtGQUFnQjtBQUN0RCxDQUFDLEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM5REQseUJBQXlCLHdCQUF3QixvQ0FBb0MseUNBQXlDLGtDQUFrQywwREFBMEQsMEJBQTBCO0FBQ3BQLDRCQUE0QixnQkFBZ0Isc0JBQXNCLE9BQU8sa0RBQWtELHNEQUFzRCw4QkFBOEIsbUpBQW1KLHFFQUFxRSxLQUFLO0FBQzVhLG9DQUFvQyxvRUFBb0UsMERB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QUNBO0FBQ0EsR0FBRyxnQkFBZ0IsZ0RBQW1CLENBQUMsd0VBQWdCLGFBQWE7QUFDcEU7QUFDQSxHQUFHO0FBQ0gsQ0FBQyxFOzs7Ozs7Ozs7OztBQ3BHOEI7QUFDSTtBQUMwQjtBQUNYO0FBQ2xELDBCQUEwQix3REFBUTtBQUMzQixpQ0FBaUM7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsQ0FBQyxDQUFDLEciLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvY2hhcnQvQ2F0ZWdvcmljYWxDaGFydC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvY2hhcnQvUmVjaGFydHNXcmFwcGVyLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9jaGFydC9MaW5lQ2hhcnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L2NoYXJ0L0FyZWFDaGFydC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvY2hhcnQvUGllQ2hhcnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L2NoYXJ0L1JhZGlhbEJhckNoYXJ0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9jaGFydC9DYXJ0ZXNpYW5DaGFydC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvY2hhcnQvU2Fua2V5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9jaGFydC9SYWRhckNoYXJ0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9jaGFydC9GdW5uZWxDaGFydC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvY2hhcnQvQmFyQ2hhcnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L2NoYXJ0L1BvbGFyQ2hhcnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L2NoYXJ0L0NvbXBvc2VkQ2hhcnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIF9leGNsdWRlZCA9IFtcIndpZHRoXCIsIFwiaGVpZ2h0XCIsIFwicmVzcG9uc2l2ZVwiLCBcImNoaWxkcmVuXCIsIFwiY2xhc3NOYW1lXCIsIFwic3R5bGVcIiwgXCJjb21wYWN0XCIsIFwidGl0bGVcIiwgXCJkZXNjXCJdO1xuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKGUsIHQpIHsgaWYgKG51bGwgPT0gZSkgcmV0dXJuIHt9OyB2YXIgbywgciwgaSA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKGUsIHQpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IGZvciAociA9IDA7IHIgPCBuLmxlbmd0aDsgcisrKSBvID0gbltyXSwgLTEgPT09IHQuaW5kZXhPZihvKSAmJiB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKGUsIG8pICYmIChpW29dID0gZVtvXSk7IH0gcmV0dXJuIGk7IH1cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKHIsIGUpIHsgaWYgKG51bGwgPT0gcikgcmV0dXJuIHt9OyB2YXIgdCA9IHt9OyBmb3IgKHZhciBuIGluIHIpIGlmICh7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHIsIG4pKSB7IGlmICgtMSAhPT0gZS5pbmRleE9mKG4pKSBjb250aW51ZTsgdFtuXSA9IHJbbl07IH0gcmV0dXJuIHQ7IH1cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGZvcndhcmRSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBSb290U3VyZmFjZSB9IGZyb20gJy4uL2NvbnRhaW5lci9Sb290U3VyZmFjZSc7XG5pbXBvcnQgeyBSZWNoYXJ0c1dyYXBwZXIgfSBmcm9tICcuL1JlY2hhcnRzV3JhcHBlcic7XG5pbXBvcnQgeyBDbGlwUGF0aFByb3ZpZGVyIH0gZnJvbSAnLi4vY29udGFpbmVyL0NsaXBQYXRoUHJvdmlkZXInO1xuaW1wb3J0IHsgc3ZnUHJvcGVydGllc05vRXZlbnRzIH0gZnJvbSAnLi4vdXRpbC9zdmdQcm9wZXJ0aWVzTm9FdmVudHMnO1xuaW1wb3J0IHsgUmVwb3J0Q2hhcnRTaXplIH0gZnJvbSAnLi4vY29udGV4dC9jaGFydExheW91dENvbnRleHQnO1xuZXhwb3J0IHZhciBDYXRlZ29yaWNhbENoYXJ0ID0gLyojX19QVVJFX18qL2ZvcndhcmRSZWYoKHByb3BzLCByZWYpID0+IHtcbiAgdmFyIHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgcmVzcG9uc2l2ZSxcbiAgICAgIGNoaWxkcmVuLFxuICAgICAgY2xhc3NOYW1lLFxuICAgICAgc3R5bGUsXG4gICAgICBjb21wYWN0LFxuICAgICAgdGl0bGUsXG4gICAgICBkZXNjXG4gICAgfSA9IHByb3BzLFxuICAgIG90aGVycyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhwcm9wcywgX2V4Y2x1ZGVkKTtcbiAgdmFyIGF0dHJzID0gc3ZnUHJvcGVydGllc05vRXZlbnRzKG90aGVycyk7XG5cbiAgLypcbiAgICogVGhlIFwiY29tcGFjdFwiIG1vZGUgaXMgdXNlZCBhcyB0aGUgcGFub3JhbWEgd2l0aGluIEJydXNoLlxuICAgKiBIb3dldmVyIGJlY2F1c2UgYGNvbXBhY3RgIGlzIGEgcHVibGljIHByb3AsIGxldCdzIGFzc3VtZSB0aGF0IGl0IGNhbiByZW5kZXIgb3V0c2lkZSBvZiBCcnVzaCB0b28uXG4gICAqL1xuICBpZiAoY29tcGFjdCkge1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5GcmFnbWVudCwgbnVsbCwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVwb3J0Q2hhcnRTaXplLCB7XG4gICAgICB3aWR0aDogd2lkdGgsXG4gICAgICBoZWlnaHQ6IGhlaWdodFxuICAgIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSb290U3VyZmFjZSwge1xuICAgICAgb3RoZXJBdHRyaWJ1dGVzOiBhdHRycyxcbiAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgIGRlc2M6IGRlc2NcbiAgICB9LCBjaGlsZHJlbikpO1xuICB9XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWNoYXJ0c1dyYXBwZXIsIHtcbiAgICBjbGFzc05hbWU6IGNsYXNzTmFtZSxcbiAgICBzdHlsZTogc3R5bGUsXG4gICAgd2lkdGg6IHdpZHRoLFxuICAgIGhlaWdodDogaGVpZ2h0LFxuICAgIHJlc3BvbnNpdmU6IHJlc3BvbnNpdmUsXG4gICAgb25DbGljazogcHJvcHMub25DbGljayxcbiAgICBvbk1vdXNlTGVhdmU6IHByb3BzLm9uTW91c2VMZWF2ZSxcbiAgICBvbk1vdXNlRW50ZXI6IHByb3BzLm9uTW91c2VFbnRlcixcbiAgICBvbk1vdXNlTW92ZTogcHJvcHMub25Nb3VzZU1vdmUsXG4gICAgb25Nb3VzZURvd246IHByb3BzLm9uTW91c2VEb3duLFxuICAgIG9uTW91c2VVcDogcHJvcHMub25Nb3VzZVVwLFxuICAgIG9uQ29udGV4dE1lbnU6IHByb3BzLm9uQ29udGV4dE1lbnUsXG4gICAgb25Eb3VibGVDbGljazogcHJvcHMub25Eb3VibGVDbGljayxcbiAgICBvblRvdWNoU3RhcnQ6IHByb3BzLm9uVG91Y2hTdGFydCxcbiAgICBvblRvdWNoTW92ZTogcHJvcHMub25Ub3VjaE1vdmUsXG4gICAgb25Ub3VjaEVuZDogcHJvcHMub25Ub3VjaEVuZFxuICB9LCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSb290U3VyZmFjZSwge1xuICAgIG90aGVyQXR0cmlidXRlczogYXR0cnMsXG4gICAgdGl0bGU6IHRpdGxlLFxuICAgIGRlc2M6IGRlc2MsXG4gICAgcmVmOiByZWZcbiAgfSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQ2xpcFBhdGhQcm92aWRlciwgbnVsbCwgY2hpbGRyZW4pKSk7XG59KTsiLCJmdW5jdGlvbiBvd25LZXlzKGUsIHIpIHsgdmFyIHQgPSBPYmplY3Qua2V5cyhlKTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG8gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyByICYmIChvID0gby5maWx0ZXIoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZSwgcikuZW51bWVyYWJsZTsgfSkpLCB0LnB1c2guYXBwbHkodCwgbyk7IH0gcmV0dXJuIHQ7IH1cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQoZSkgeyBmb3IgKHZhciByID0gMTsgciA8IGFyZ3VtZW50cy5sZW5ndGg7IHIrKykgeyB2YXIgdCA9IG51bGwgIT0gYXJndW1lbnRzW3JdID8gYXJndW1lbnRzW3JdIDoge307IHIgJSAyID8gb3duS2V5cyhPYmplY3QodCksICEwKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0W3JdKTsgfSkgOiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGUsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHQpKSA6IG93bktleXMoT2JqZWN0KHQpKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHQsIHIpKTsgfSk7IH0gcmV0dXJuIGU7IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0KSB7IHJldHVybiAociA9IF90b1Byb3BlcnR5S2V5KHIpKSBpbiBlID8gT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIHsgdmFsdWU6IHQsIGVudW1lcmFibGU6ICEwLCBjb25maWd1cmFibGU6ICEwLCB3cml0YWJsZTogITAgfSkgOiBlW3JdID0gdCwgZTsgfVxuZnVuY3Rpb24gX3RvUHJvcGVydHlLZXkodCkgeyB2YXIgaSA9IF90b1ByaW1pdGl2ZSh0LCBcInN0cmluZ1wiKTsgcmV0dXJuIFwic3ltYm9sXCIgPT0gdHlwZW9mIGkgPyBpIDogaSArIFwiXCI7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZSh0LCByKSB7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiB0IHx8ICF0KSByZXR1cm4gdDsgdmFyIGUgPSB0W1N5bWJvbC50b1ByaW1pdGl2ZV07IGlmICh2b2lkIDAgIT09IGUpIHsgdmFyIGkgPSBlLmNhbGwodCwgciB8fCBcImRlZmF1bHRcIik7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiBpKSByZXR1cm4gaTsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpOyB9IHJldHVybiAoXCJzdHJpbmdcIiA9PT0gciA/IFN0cmluZyA6IE51bWJlcikodCk7IH1cbmZ1bmN0aW9uIF9leHRlbmRzKCkgeyByZXR1cm4gX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduID8gT2JqZWN0LmFzc2lnbi5iaW5kKCkgOiBmdW5jdGlvbiAobikgeyBmb3IgKHZhciBlID0gMTsgZSA8IGFyZ3VtZW50cy5sZW5ndGg7IGUrKykgeyB2YXIgdCA9IGFyZ3VtZW50c1tlXTsgZm9yICh2YXIgciBpbiB0KSAoe30pLmhhc093blByb3BlcnR5LmNhbGwodCwgcikgJiYgKG5bcl0gPSB0W3JdKTsgfSByZXR1cm4gbjsgfSwgX2V4dGVuZHMuYXBwbHkobnVsbCwgYXJndW1lbnRzKTsgfVxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgZm9yd2FyZFJlZiwgdXNlQ2FsbGJhY2ssIHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IG1vdXNlTGVhdmVDaGFydCB9IGZyb20gJy4uL3N0YXRlL3Rvb2x0aXBTbGljZSc7XG5pbXBvcnQgeyB1c2VBcHBEaXNwYXRjaCB9IGZyb20gJy4uL3N0YXRlL2hvb2tzJztcbmltcG9ydCB7IG1vdXNlQ2xpY2tBY3Rpb24sIG1vdXNlTW92ZUFjdGlvbiB9IGZyb20gJy4uL3N0YXRlL21vdXNlRXZlbnRzTWlkZGxld2FyZSc7XG5pbXBvcnQgeyB1c2VTeW5jaHJvbmlzZWRFdmVudHNGcm9tT3RoZXJDaGFydHMgfSBmcm9tICcuLi9zeW5jaHJvbmlzYXRpb24vdXNlQ2hhcnRTeW5jaHJvbmlzYXRpb24nO1xuaW1wb3J0IHsgZm9jdXNBY3Rpb24sIGtleURvd25BY3Rpb24gfSBmcm9tICcuLi9zdGF0ZS9rZXlib2FyZEV2ZW50c01pZGRsZXdhcmUnO1xuaW1wb3J0IHsgdXNlUmVwb3J0U2NhbGUgfSBmcm9tICcuLi91dGlsL3VzZVJlcG9ydFNjYWxlJztcbmltcG9ydCB7IGV4dGVybmFsRXZlbnRBY3Rpb24gfSBmcm9tICcuLi9zdGF0ZS9leHRlcm5hbEV2ZW50c01pZGRsZXdhcmUnO1xuaW1wb3J0IHsgdG91Y2hFdmVudEFjdGlvbiB9IGZyb20gJy4uL3N0YXRlL3RvdWNoRXZlbnRzTWlkZGxld2FyZSc7XG5pbXBvcnQgeyBUb29sdGlwUG9ydGFsQ29udGV4dCB9IGZyb20gJy4uL2NvbnRleHQvdG9vbHRpcFBvcnRhbENvbnRleHQnO1xuaW1wb3J0IHsgTGVnZW5kUG9ydGFsQ29udGV4dCB9IGZyb20gJy4uL2NvbnRleHQvbGVnZW5kUG9ydGFsQ29udGV4dCc7XG5pbXBvcnQgeyBSZXBvcnRDaGFydFNpemUgfSBmcm9tICcuLi9jb250ZXh0L2NoYXJ0TGF5b3V0Q29udGV4dCc7XG5pbXBvcnQgeyB1c2VSZXNwb25zaXZlQ29udGFpbmVyQ29udGV4dCB9IGZyb20gJy4uL2NvbXBvbmVudC9SZXNwb25zaXZlQ29udGFpbmVyJztcbmltcG9ydCB7IGlzUGVyY2VudCB9IGZyb20gJy4uL3V0aWwvRGF0YVV0aWxzJztcbnZhciBFdmVudFN5bmNocm9uaXplciA9ICgpID0+IHtcbiAgdXNlU3luY2hyb25pc2VkRXZlbnRzRnJvbU90aGVyQ2hhcnRzKCk7XG4gIHJldHVybiBudWxsO1xufTtcbmZ1bmN0aW9uIGdldE51bWJlck9yWmVybyh2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHZhciBwYXJzZWQgPSBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICBpZiAoIU51bWJlci5pc05hTihwYXJzZWQpKSB7XG4gICAgICByZXR1cm4gcGFyc2VkO1xuICAgIH1cbiAgfVxuICByZXR1cm4gMDtcbn1cbnZhciBSZXNwb25zaXZlRGl2ID0gLyojX19QVVJFX18qL2ZvcndhcmRSZWYoKHByb3BzLCByZWYpID0+IHtcbiAgdmFyIF9wcm9wcyRzdHlsZSwgX3Byb3BzJHN0eWxlMjtcbiAgdmFyIG9ic2VydmVyUmVmID0gdXNlUmVmKG51bGwpO1xuICB2YXIgW3NpemVzLCBzZXRTaXplc10gPSB1c2VTdGF0ZSh7XG4gICAgY29udGFpbmVyV2lkdGg6IGdldE51bWJlck9yWmVybygoX3Byb3BzJHN0eWxlID0gcHJvcHMuc3R5bGUpID09PSBudWxsIHx8IF9wcm9wcyRzdHlsZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX3Byb3BzJHN0eWxlLndpZHRoKSxcbiAgICBjb250YWluZXJIZWlnaHQ6IGdldE51bWJlck9yWmVybygoX3Byb3BzJHN0eWxlMiA9IHByb3BzLnN0eWxlKSA9PT0gbnVsbCB8fCBfcHJvcHMkc3R5bGUyID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfcHJvcHMkc3R5bGUyLmhlaWdodClcbiAgfSk7XG4gIHZhciBzZXRDb250YWluZXJTaXplID0gdXNlQ2FsbGJhY2soKG5ld1dpZHRoLCBuZXdIZWlnaHQpID0+IHtcbiAgICBzZXRTaXplcyhwcmV2U3RhdGUgPT4ge1xuICAgICAgdmFyIHJvdW5kZWRXaWR0aCA9IE1hdGgucm91bmQobmV3V2lkdGgpO1xuICAgICAgdmFyIHJvdW5kZWRIZWlnaHQgPSBNYXRoLnJvdW5kKG5ld0hlaWdodCk7XG4gICAgICBpZiAocHJldlN0YXRlLmNvbnRhaW5lcldpZHRoID09PSByb3VuZGVkV2lkdGggJiYgcHJldlN0YXRlLmNvbnRhaW5lckhlaWdodCA9PT0gcm91bmRlZEhlaWdodCkge1xuICAgICAgICByZXR1cm4gcHJldlN0YXRlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29udGFpbmVyV2lkdGg6IHJvdW5kZWRXaWR0aCxcbiAgICAgICAgY29udGFpbmVySGVpZ2h0OiByb3VuZGVkSGVpZ2h0XG4gICAgICB9O1xuICAgIH0pO1xuICB9LCBbXSk7XG4gIHZhciBpbm5lclJlZiA9IHVzZUNhbGxiYWNrKG5vZGUgPT4ge1xuICAgIGlmICh0eXBlb2YgcmVmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZWYobm9kZSk7XG4gICAgfVxuICAgIGlmIChub2RlICE9IG51bGwpIHtcbiAgICAgIHZhciB7XG4gICAgICAgIHdpZHRoOiBjb250YWluZXJXaWR0aCxcbiAgICAgICAgaGVpZ2h0OiBjb250YWluZXJIZWlnaHRcbiAgICAgIH0gPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgc2V0Q29udGFpbmVyU2l6ZShjb250YWluZXJXaWR0aCwgY29udGFpbmVySGVpZ2h0KTtcbiAgICAgIHZhciBjYWxsYmFjayA9IGVudHJpZXMgPT4ge1xuICAgICAgICB2YXIge1xuICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgIGhlaWdodFxuICAgICAgICB9ID0gZW50cmllc1swXS5jb250ZW50UmVjdDtcbiAgICAgICAgc2V0Q29udGFpbmVyU2l6ZSh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgIH07XG4gICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoY2FsbGJhY2spO1xuICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShub2RlKTtcbiAgICAgIG9ic2VydmVyUmVmLmN1cnJlbnQgPSBvYnNlcnZlcjtcbiAgICB9XG4gIH0sIFtyZWYsIHNldENvbnRhaW5lclNpemVdKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgdmFyIG9ic2VydmVyID0gb2JzZXJ2ZXJSZWYuY3VycmVudDtcbiAgICAgIGlmIChvYnNlcnZlciAhPSBudWxsKSB7XG4gICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9LCBbc2V0Q29udGFpbmVyU2l6ZV0pO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRnJhZ21lbnQsIG51bGwsIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlcG9ydENoYXJ0U2l6ZSwge1xuICAgIHdpZHRoOiBzaXplcy5jb250YWluZXJXaWR0aCxcbiAgICBoZWlnaHQ6IHNpemVzLmNvbnRhaW5lckhlaWdodFxuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgX2V4dGVuZHMoe1xuICAgIHJlZjogaW5uZXJSZWZcbiAgfSwgcHJvcHMpKSk7XG59KTtcbnZhciBSZWFkU2l6ZU9uY2VEaXYgPSAvKiNfX1BVUkVfXyovZm9yd2FyZFJlZigocHJvcHMsIHJlZikgPT4ge1xuICB2YXIge1xuICAgIHdpZHRoLFxuICAgIGhlaWdodFxuICB9ID0gcHJvcHM7XG4gIHZhciBbc2l6ZXMsIHNldFNpemVzXSA9IHVzZVN0YXRlKHtcbiAgICBjb250YWluZXJXaWR0aDogZ2V0TnVtYmVyT3JaZXJvKHdpZHRoKSxcbiAgICBjb250YWluZXJIZWlnaHQ6IGdldE51bWJlck9yWmVybyhoZWlnaHQpXG4gIH0pO1xuICB2YXIgc2V0Q29udGFpbmVyU2l6ZSA9IHVzZUNhbGxiYWNrKChuZXdXaWR0aCwgbmV3SGVpZ2h0KSA9PiB7XG4gICAgc2V0U2l6ZXMocHJldlN0YXRlID0+IHtcbiAgICAgIHZhciByb3VuZGVkV2lkdGggPSBNYXRoLnJvdW5kKG5ld1dpZHRoKTtcbiAgICAgIHZhciByb3VuZGVkSGVpZ2h0ID0gTWF0aC5yb3VuZChuZXdIZWlnaHQpO1xuICAgICAgaWYgKHByZXZTdGF0ZS5jb250YWluZXJXaWR0aCA9PT0gcm91bmRlZFdpZHRoICYmIHByZXZTdGF0ZS5jb250YWluZXJIZWlnaHQgPT09IHJvdW5kZWRIZWlnaHQpIHtcbiAgICAgICAgcmV0dXJuIHByZXZTdGF0ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRhaW5lcldpZHRoOiByb3VuZGVkV2lkdGgsXG4gICAgICAgIGNvbnRhaW5lckhlaWdodDogcm91bmRlZEhlaWdodFxuICAgICAgfTtcbiAgICB9KTtcbiAgfSwgW10pO1xuICB2YXIgaW5uZXJSZWYgPSB1c2VDYWxsYmFjayhub2RlID0+IHtcbiAgICBpZiAodHlwZW9mIHJlZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVmKG5vZGUpO1xuICAgIH1cbiAgICBpZiAobm9kZSAhPSBudWxsKSB7XG4gICAgICB2YXIge1xuICAgICAgICB3aWR0aDogY29udGFpbmVyV2lkdGgsXG4gICAgICAgIGhlaWdodDogY29udGFpbmVySGVpZ2h0XG4gICAgICB9ID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHNldENvbnRhaW5lclNpemUoY29udGFpbmVyV2lkdGgsIGNvbnRhaW5lckhlaWdodCk7XG4gICAgfVxuICB9LCBbcmVmLCBzZXRDb250YWluZXJTaXplXSk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5GcmFnbWVudCwgbnVsbCwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVwb3J0Q2hhcnRTaXplLCB7XG4gICAgd2lkdGg6IHNpemVzLmNvbnRhaW5lcldpZHRoLFxuICAgIGhlaWdodDogc2l6ZXMuY29udGFpbmVySGVpZ2h0XG4gIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBfZXh0ZW5kcyh7XG4gICAgcmVmOiBpbm5lclJlZlxuICB9LCBwcm9wcykpKTtcbn0pO1xudmFyIFN0YXRpY0RpdiA9IC8qI19fUFVSRV9fKi9mb3J3YXJkUmVmKChwcm9wcywgcmVmKSA9PiB7XG4gIHZhciB7XG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0XG4gIH0gPSBwcm9wcztcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkZyYWdtZW50LCBudWxsLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZXBvcnRDaGFydFNpemUsIHtcbiAgICB3aWR0aDogd2lkdGgsXG4gICAgaGVpZ2h0OiBoZWlnaHRcbiAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIF9leHRlbmRzKHtcbiAgICByZWY6IHJlZlxuICB9LCBwcm9wcykpKTtcbn0pO1xudmFyIE5vblJlc3BvbnNpdmVEaXYgPSAvKiNfX1BVUkVfXyovZm9yd2FyZFJlZigocHJvcHMsIHJlZikgPT4ge1xuICB2YXIge1xuICAgIHdpZHRoLFxuICAgIGhlaWdodFxuICB9ID0gcHJvcHM7XG4gIGlmIChpc1BlcmNlbnQod2lkdGgpIHx8IGlzUGVyY2VudChoZWlnaHQpKSB7XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlYWRTaXplT25jZURpdiwgX2V4dGVuZHMoe30sIHByb3BzLCB7XG4gICAgICByZWY6IHJlZlxuICAgIH0pKTtcbiAgfVxuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU3RhdGljRGl2LCBfZXh0ZW5kcyh7fSwgcHJvcHMsIHtcbiAgICByZWY6IHJlZlxuICB9KSk7XG59KTtcbmZ1bmN0aW9uIGdldFdyYXBwZXJEaXZDb21wb25lbnQocmVzcG9uc2l2ZSkge1xuICByZXR1cm4gcmVzcG9uc2l2ZSA9PT0gdHJ1ZSA/IFJlc3BvbnNpdmVEaXYgOiBOb25SZXNwb25zaXZlRGl2O1xufVxuZXhwb3J0IHZhciBSZWNoYXJ0c1dyYXBwZXIgPSAvKiNfX1BVUkVfXyovZm9yd2FyZFJlZigocHJvcHMsIHJlZikgPT4ge1xuICB2YXIge1xuICAgIGNoaWxkcmVuLFxuICAgIGNsYXNzTmFtZSxcbiAgICBoZWlnaHQ6IGhlaWdodEZyb21Qcm9wcyxcbiAgICBvbkNsaWNrLFxuICAgIG9uQ29udGV4dE1lbnUsXG4gICAgb25Eb3VibGVDbGljayxcbiAgICBvbk1vdXNlRG93bixcbiAgICBvbk1vdXNlRW50ZXIsXG4gICAgb25Nb3VzZUxlYXZlLFxuICAgIG9uTW91c2VNb3ZlLFxuICAgIG9uTW91c2VVcCxcbiAgICBvblRvdWNoRW5kLFxuICAgIG9uVG91Y2hNb3ZlLFxuICAgIG9uVG91Y2hTdGFydCxcbiAgICBzdHlsZSxcbiAgICB3aWR0aDogd2lkdGhGcm9tUHJvcHMsXG4gICAgcmVzcG9uc2l2ZSxcbiAgICBkaXNwYXRjaFRvdWNoRXZlbnRzID0gdHJ1ZVxuICB9ID0gcHJvcHM7XG4gIHZhciBjb250YWluZXJSZWYgPSB1c2VSZWYobnVsbCk7XG4gIHZhciBkaXNwYXRjaCA9IHVzZUFwcERpc3BhdGNoKCk7XG4gIHZhciBbdG9vbHRpcFBvcnRhbCwgc2V0VG9vbHRpcFBvcnRhbF0gPSB1c2VTdGF0ZShudWxsKTtcbiAgdmFyIFtsZWdlbmRQb3J0YWwsIHNldExlZ2VuZFBvcnRhbF0gPSB1c2VTdGF0ZShudWxsKTtcbiAgdmFyIHNldFNjYWxlUmVmID0gdXNlUmVwb3J0U2NhbGUoKTtcbiAgdmFyIHJlc3BvbnNpdmVDb250YWluZXJDYWxjdWxhdGlvbnMgPSB1c2VSZXNwb25zaXZlQ29udGFpbmVyQ29udGV4dCgpO1xuICB2YXIgd2lkdGggPSAocmVzcG9uc2l2ZUNvbnRhaW5lckNhbGN1bGF0aW9ucyA9PT0gbnVsbCB8fCByZXNwb25zaXZlQ29udGFpbmVyQ2FsY3VsYXRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiByZXNwb25zaXZlQ29udGFpbmVyQ2FsY3VsYXRpb25zLndpZHRoKSA+IDAgPyByZXNwb25zaXZlQ29udGFpbmVyQ2FsY3VsYXRpb25zLndpZHRoIDogd2lkdGhGcm9tUHJvcHM7XG4gIHZhciBoZWlnaHQgPSAocmVzcG9uc2l2ZUNvbnRhaW5lckNhbGN1bGF0aW9ucyA9PT0gbnVsbCB8fCByZXNwb25zaXZlQ29udGFpbmVyQ2FsY3VsYXRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiByZXNwb25zaXZlQ29udGFpbmVyQ2FsY3VsYXRpb25zLmhlaWdodCkgPiAwID8gcmVzcG9uc2l2ZUNvbnRhaW5lckNhbGN1bGF0aW9ucy5oZWlnaHQgOiBoZWlnaHRGcm9tUHJvcHM7XG4gIHZhciBpbm5lclJlZiA9IHVzZUNhbGxiYWNrKG5vZGUgPT4ge1xuICAgIHNldFNjYWxlUmVmKG5vZGUpO1xuICAgIGlmICh0eXBlb2YgcmVmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZWYobm9kZSk7XG4gICAgfVxuICAgIHNldFRvb2x0aXBQb3J0YWwobm9kZSk7XG4gICAgc2V0TGVnZW5kUG9ydGFsKG5vZGUpO1xuICAgIGlmIChub2RlICE9IG51bGwpIHtcbiAgICAgIGNvbnRhaW5lclJlZi5jdXJyZW50ID0gbm9kZTtcbiAgICB9XG4gIH0sIFtzZXRTY2FsZVJlZiwgcmVmLCBzZXRUb29sdGlwUG9ydGFsLCBzZXRMZWdlbmRQb3J0YWxdKTtcbiAgdmFyIG15T25DbGljayA9IHVzZUNhbGxiYWNrKGUgPT4ge1xuICAgIGRpc3BhdGNoKG1vdXNlQ2xpY2tBY3Rpb24oZSkpO1xuICAgIGRpc3BhdGNoKGV4dGVybmFsRXZlbnRBY3Rpb24oe1xuICAgICAgaGFuZGxlcjogb25DbGljayxcbiAgICAgIHJlYWN0RXZlbnQ6IGVcbiAgICB9KSk7XG4gIH0sIFtkaXNwYXRjaCwgb25DbGlja10pO1xuICB2YXIgbXlPbk1vdXNlRW50ZXIgPSB1c2VDYWxsYmFjayhlID0+IHtcbiAgICBkaXNwYXRjaChtb3VzZU1vdmVBY3Rpb24oZSkpO1xuICAgIGRpc3BhdGNoKGV4dGVybmFsRXZlbnRBY3Rpb24oe1xuICAgICAgaGFuZGxlcjogb25Nb3VzZUVudGVyLFxuICAgICAgcmVhY3RFdmVudDogZVxuICAgIH0pKTtcbiAgfSwgW2Rpc3BhdGNoLCBvbk1vdXNlRW50ZXJdKTtcbiAgdmFyIG15T25Nb3VzZUxlYXZlID0gdXNlQ2FsbGJhY2soZSA9PiB7XG4gICAgZGlzcGF0Y2gobW91c2VMZWF2ZUNoYXJ0KCkpO1xuICAgIGRpc3BhdGNoKGV4dGVybmFsRXZlbnRBY3Rpb24oe1xuICAgICAgaGFuZGxlcjogb25Nb3VzZUxlYXZlLFxuICAgICAgcmVhY3RFdmVudDogZVxuICAgIH0pKTtcbiAgfSwgW2Rpc3BhdGNoLCBvbk1vdXNlTGVhdmVdKTtcbiAgdmFyIG15T25Nb3VzZU1vdmUgPSB1c2VDYWxsYmFjayhlID0+IHtcbiAgICBkaXNwYXRjaChtb3VzZU1vdmVBY3Rpb24oZSkpO1xuICAgIGRpc3BhdGNoKGV4dGVybmFsRXZlbnRBY3Rpb24oe1xuICAgICAgaGFuZGxlcjogb25Nb3VzZU1vdmUsXG4gICAgICByZWFjdEV2ZW50OiBlXG4gICAgfSkpO1xuICB9LCBbZGlzcGF0Y2gsIG9uTW91c2VNb3ZlXSk7XG4gIHZhciBvbkZvY3VzID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGRpc3BhdGNoKGZvY3VzQWN0aW9uKCkpO1xuICB9LCBbZGlzcGF0Y2hdKTtcbiAgdmFyIG9uS2V5RG93biA9IHVzZUNhbGxiYWNrKGUgPT4ge1xuICAgIGRpc3BhdGNoKGtleURvd25BY3Rpb24oZS5rZXkpKTtcbiAgfSwgW2Rpc3BhdGNoXSk7XG4gIHZhciBteU9uQ29udGV4dE1lbnUgPSB1c2VDYWxsYmFjayhlID0+IHtcbiAgICBkaXNwYXRjaChleHRlcm5hbEV2ZW50QWN0aW9uKHtcbiAgICAgIGhhbmRsZXI6IG9uQ29udGV4dE1lbnUsXG4gICAgICByZWFjdEV2ZW50OiBlXG4gICAgfSkpO1xuICB9LCBbZGlzcGF0Y2gsIG9uQ29udGV4dE1lbnVdKTtcbiAgdmFyIG15T25Eb3VibGVDbGljayA9IHVzZUNhbGxiYWNrKGUgPT4ge1xuICAgIGRpc3BhdGNoKGV4dGVybmFsRXZlbnRBY3Rpb24oe1xuICAgICAgaGFuZGxlcjogb25Eb3VibGVDbGljayxcbiAgICAgIHJlYWN0RXZlbnQ6IGVcbiAgICB9KSk7XG4gIH0sIFtkaXNwYXRjaCwgb25Eb3VibGVDbGlja10pO1xuICB2YXIgbXlPbk1vdXNlRG93biA9IHVzZUNhbGxiYWNrKGUgPT4ge1xuICAgIGRpc3BhdGNoKGV4dGVybmFsRXZlbnRBY3Rpb24oe1xuICAgICAgaGFuZGxlcjogb25Nb3VzZURvd24sXG4gICAgICByZWFjdEV2ZW50OiBlXG4gICAgfSkpO1xuICB9LCBbZGlzcGF0Y2gsIG9uTW91c2VEb3duXSk7XG4gIHZhciBteU9uTW91c2VVcCA9IHVzZUNhbGxiYWNrKGUgPT4ge1xuICAgIGRpc3BhdGNoKGV4dGVybmFsRXZlbnRBY3Rpb24oe1xuICAgICAgaGFuZGxlcjogb25Nb3VzZVVwLFxuICAgICAgcmVhY3RFdmVudDogZVxuICAgIH0pKTtcbiAgfSwgW2Rpc3BhdGNoLCBvbk1vdXNlVXBdKTtcbiAgdmFyIG15T25Ub3VjaFN0YXJ0ID0gdXNlQ2FsbGJhY2soZSA9PiB7XG4gICAgZGlzcGF0Y2goZXh0ZXJuYWxFdmVudEFjdGlvbih7XG4gICAgICBoYW5kbGVyOiBvblRvdWNoU3RhcnQsXG4gICAgICByZWFjdEV2ZW50OiBlXG4gICAgfSkpO1xuICB9LCBbZGlzcGF0Y2gsIG9uVG91Y2hTdGFydF0pO1xuXG4gIC8qXG4gICAqIG9uVG91Y2hNb3ZlIGlzIHNwZWNpYWwgYmVjYXVzZSBpdCBiZWhhdmVzIGRpZmZlcmVudCBmcm9tIG1vdXNlIGV2ZW50cy5cbiAgICogTW91c2UgZXZlbnRzIGhhdmUgJ2VudGVyJyArICdsZWF2ZScgY29tYm8gdGhhdCBub3RpZnkgdXMgd2hlbiB0aGUgbW91c2UgaXMgb3ZlclxuICAgKiBhIGNlcnRhaW4gZWxlbWVudC4gVG91Y2ggZXZlbnRzIGRvbid0IGhhdmUgdGhhdDsgdG91Y2ggb25seSBnaXZlcyB1c1xuICAgKiBzdGFydCAoZmluZ2VyIGRvd24pLCBlbmQgKGZpbmdlciB1cCkgYW5kIG1vdmUgKGZpbmdlciBtb3ZpbmcpLlxuICAgKiBTbyB3ZSBuZWVkIHRvIGZpZ3VyZSBvdXQgd2hpY2ggZWxlbWVudCB0aGUgdXNlciBpcyB0b3VjaGluZ1xuICAgKiBvdXJzZWx2ZXMuIEZvcnR1bmF0ZWx5LCB0aGVyZSdzIGEgY29udmVuaWVudCBtZXRob2QgZm9yIHRoYXQ6XG4gICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Eb2N1bWVudC9lbGVtZW50RnJvbVBvaW50XG4gICAqL1xuICB2YXIgbXlPblRvdWNoTW92ZSA9IHVzZUNhbGxiYWNrKGUgPT4ge1xuICAgIGlmIChkaXNwYXRjaFRvdWNoRXZlbnRzKSB7XG4gICAgICBkaXNwYXRjaCh0b3VjaEV2ZW50QWN0aW9uKGUpKTtcbiAgICB9XG4gICAgZGlzcGF0Y2goZXh0ZXJuYWxFdmVudEFjdGlvbih7XG4gICAgICBoYW5kbGVyOiBvblRvdWNoTW92ZSxcbiAgICAgIHJlYWN0RXZlbnQ6IGVcbiAgICB9KSk7XG4gIH0sIFtkaXNwYXRjaCwgZGlzcGF0Y2hUb3VjaEV2ZW50cywgb25Ub3VjaE1vdmVdKTtcbiAgdmFyIG15T25Ub3VjaEVuZCA9IHVzZUNhbGxiYWNrKGUgPT4ge1xuICAgIGRpc3BhdGNoKGV4dGVybmFsRXZlbnRBY3Rpb24oe1xuICAgICAgaGFuZGxlcjogb25Ub3VjaEVuZCxcbiAgICAgIHJlYWN0RXZlbnQ6IGVcbiAgICB9KSk7XG4gIH0sIFtkaXNwYXRjaCwgb25Ub3VjaEVuZF0pO1xuICB2YXIgV3JhcHBlckRpdiA9IGdldFdyYXBwZXJEaXZDb21wb25lbnQocmVzcG9uc2l2ZSk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChUb29sdGlwUG9ydGFsQ29udGV4dC5Qcm92aWRlciwge1xuICAgIHZhbHVlOiB0b29sdGlwUG9ydGFsXG4gIH0sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExlZ2VuZFBvcnRhbENvbnRleHQuUHJvdmlkZXIsIHtcbiAgICB2YWx1ZTogbGVnZW5kUG9ydGFsXG4gIH0sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFdyYXBwZXJEaXYsIHtcbiAgICB3aWR0aDogd2lkdGggIT09IG51bGwgJiYgd2lkdGggIT09IHZvaWQgMCA/IHdpZHRoIDogc3R5bGUgPT09IG51bGwgfHwgc3R5bGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHN0eWxlLndpZHRoLFxuICAgIGhlaWdodDogaGVpZ2h0ICE9PSBudWxsICYmIGhlaWdodCAhPT0gdm9pZCAwID8gaGVpZ2h0IDogc3R5bGUgPT09IG51bGwgfHwgc3R5bGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHN0eWxlLmhlaWdodCxcbiAgICBjbGFzc05hbWU6IGNsc3goJ3JlY2hhcnRzLXdyYXBwZXInLCBjbGFzc05hbWUpLFxuICAgIHN0eWxlOiBfb2JqZWN0U3ByZWFkKHtcbiAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgY3Vyc29yOiAnZGVmYXVsdCcsXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodFxuICAgIH0sIHN0eWxlKSxcbiAgICBvbkNsaWNrOiBteU9uQ2xpY2ssXG4gICAgb25Db250ZXh0TWVudTogbXlPbkNvbnRleHRNZW51LFxuICAgIG9uRG91YmxlQ2xpY2s6IG15T25Eb3VibGVDbGljayxcbiAgICBvbkZvY3VzOiBvbkZvY3VzLFxuICAgIG9uS2V5RG93bjogb25LZXlEb3duLFxuICAgIG9uTW91c2VEb3duOiBteU9uTW91c2VEb3duLFxuICAgIG9uTW91c2VFbnRlcjogbXlPbk1vdXNlRW50ZXIsXG4gICAgb25Nb3VzZUxlYXZlOiBteU9uTW91c2VMZWF2ZSxcbiAgICBvbk1vdXNlTW92ZTogbXlPbk1vdXNlTW92ZSxcbiAgICBvbk1vdXNlVXA6IG15T25Nb3VzZVVwLFxuICAgIG9uVG91Y2hFbmQ6IG15T25Ub3VjaEVuZCxcbiAgICBvblRvdWNoTW92ZTogbXlPblRvdWNoTW92ZSxcbiAgICBvblRvdWNoU3RhcnQ6IG15T25Ub3VjaFN0YXJ0LFxuICAgIHJlZjogaW5uZXJSZWZcbiAgfSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoRXZlbnRTeW5jaHJvbml6ZXIsIG51bGwpLCBjaGlsZHJlbikpKTtcbn0pOyIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGZvcndhcmRSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBhcnJheVRvb2x0aXBTZWFyY2hlciB9IGZyb20gJy4uL3N0YXRlL29wdGlvbnNTbGljZSc7XG5pbXBvcnQgeyBDYXJ0ZXNpYW5DaGFydCB9IGZyb20gJy4vQ2FydGVzaWFuQ2hhcnQnO1xudmFyIGFsbG93ZWRUb29sdGlwVHlwZXMgPSBbJ2F4aXMnXTtcbmV4cG9ydCB2YXIgTGluZUNoYXJ0ID0gLyojX19QVVJFX18qL2ZvcndhcmRSZWYoKHByb3BzLCByZWYpID0+IHtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KENhcnRlc2lhbkNoYXJ0LCB7XG4gICAgY2hhcnROYW1lOiBcIkxpbmVDaGFydFwiLFxuICAgIGRlZmF1bHRUb29sdGlwRXZlbnRUeXBlOiBcImF4aXNcIixcbiAgICB2YWxpZGF0ZVRvb2x0aXBFdmVudFR5cGVzOiBhbGxvd2VkVG9vbHRpcFR5cGVzLFxuICAgIHRvb2x0aXBQYXlsb2FkU2VhcmNoZXI6IGFycmF5VG9vbHRpcFNlYXJjaGVyLFxuICAgIGNhdGVnb3JpY2FsQ2hhcnRQcm9wczogcHJvcHMsXG4gICAgcmVmOiByZWZcbiAgfSk7XG59KTsiLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBmb3J3YXJkUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgYXJyYXlUb29sdGlwU2VhcmNoZXIgfSBmcm9tICcuLi9zdGF0ZS9vcHRpb25zU2xpY2UnO1xuaW1wb3J0IHsgQ2FydGVzaWFuQ2hhcnQgfSBmcm9tICcuL0NhcnRlc2lhbkNoYXJ0JztcbnZhciBhbGxvd2VkVG9vbHRpcFR5cGVzID0gWydheGlzJ107XG5leHBvcnQgdmFyIEFyZWFDaGFydCA9IC8qI19fUFVSRV9fKi9mb3J3YXJkUmVmKChwcm9wcywgcmVmKSA9PiB7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChDYXJ0ZXNpYW5DaGFydCwge1xuICAgIGNoYXJ0TmFtZTogXCJBcmVhQ2hhcnRcIixcbiAgICBkZWZhdWx0VG9vbHRpcEV2ZW50VHlwZTogXCJheGlzXCIsXG4gICAgdmFsaWRhdGVUb29sdGlwRXZlbnRUeXBlczogYWxsb3dlZFRvb2x0aXBUeXBlcyxcbiAgICB0b29sdGlwUGF5bG9hZFNlYXJjaGVyOiBhcnJheVRvb2x0aXBTZWFyY2hlcixcbiAgICBjYXRlZ29yaWNhbENoYXJ0UHJvcHM6IHByb3BzLFxuICAgIHJlZjogcmVmXG4gIH0pO1xufSk7IiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgZm9yd2FyZFJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGFycmF5VG9vbHRpcFNlYXJjaGVyIH0gZnJvbSAnLi4vc3RhdGUvb3B0aW9uc1NsaWNlJztcbmltcG9ydCB7IFBvbGFyQ2hhcnQgfSBmcm9tICcuL1BvbGFyQ2hhcnQnO1xuaW1wb3J0IHsgcmVzb2x2ZURlZmF1bHRQcm9wcyB9IGZyb20gJy4uL3V0aWwvcmVzb2x2ZURlZmF1bHRQcm9wcyc7XG52YXIgYWxsb3dlZFRvb2x0aXBUeXBlcyA9IFsnaXRlbSddO1xudmFyIGRlZmF1bHRQcm9wcyA9IHtcbiAgbGF5b3V0OiAnY2VudHJpYycsXG4gIHN0YXJ0QW5nbGU6IDAsXG4gIGVuZEFuZ2xlOiAzNjAsXG4gIGN4OiAnNTAlJyxcbiAgY3k6ICc1MCUnLFxuICBpbm5lclJhZGl1czogMCxcbiAgb3V0ZXJSYWRpdXM6ICc4MCUnXG59O1xuZXhwb3J0IHZhciBQaWVDaGFydCA9IC8qI19fUFVSRV9fKi9mb3J3YXJkUmVmKChwcm9wcywgcmVmKSA9PiB7XG4gIHZhciBwcm9wc1dpdGhEZWZhdWx0cyA9IHJlc29sdmVEZWZhdWx0UHJvcHMocHJvcHMsIGRlZmF1bHRQcm9wcyk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChQb2xhckNoYXJ0LCB7XG4gICAgY2hhcnROYW1lOiBcIlBpZUNoYXJ0XCIsXG4gICAgZGVmYXVsdFRvb2x0aXBFdmVudFR5cGU6IFwiaXRlbVwiLFxuICAgIHZhbGlkYXRlVG9vbHRpcEV2ZW50VHlwZXM6IGFsbG93ZWRUb29sdGlwVHlwZXMsXG4gICAgdG9vbHRpcFBheWxvYWRTZWFyY2hlcjogYXJyYXlUb29sdGlwU2VhcmNoZXIsXG4gICAgY2F0ZWdvcmljYWxDaGFydFByb3BzOiBwcm9wc1dpdGhEZWZhdWx0cyxcbiAgICByZWY6IHJlZlxuICB9KTtcbn0pOyIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGZvcndhcmRSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBhcnJheVRvb2x0aXBTZWFyY2hlciB9IGZyb20gJy4uL3N0YXRlL29wdGlvbnNTbGljZSc7XG5pbXBvcnQgeyByZXNvbHZlRGVmYXVsdFByb3BzIH0gZnJvbSAnLi4vdXRpbC9yZXNvbHZlRGVmYXVsdFByb3BzJztcbmltcG9ydCB7IFBvbGFyQ2hhcnQgfSBmcm9tICcuL1BvbGFyQ2hhcnQnO1xudmFyIGFsbG93ZWRUb29sdGlwVHlwZXMgPSBbJ2F4aXMnLCAnaXRlbSddO1xudmFyIGRlZmF1bHRQcm9wcyA9IHtcbiAgbGF5b3V0OiAncmFkaWFsJyxcbiAgc3RhcnRBbmdsZTogMCxcbiAgZW5kQW5nbGU6IDM2MCxcbiAgY3g6ICc1MCUnLFxuICBjeTogJzUwJScsXG4gIGlubmVyUmFkaXVzOiAwLFxuICBvdXRlclJhZGl1czogJzgwJSdcbn07XG5leHBvcnQgdmFyIFJhZGlhbEJhckNoYXJ0ID0gLyojX19QVVJFX18qL2ZvcndhcmRSZWYoKHByb3BzLCByZWYpID0+IHtcbiAgdmFyIHByb3BzV2l0aERlZmF1bHRzID0gcmVzb2x2ZURlZmF1bHRQcm9wcyhwcm9wcywgZGVmYXVsdFByb3BzKTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFBvbGFyQ2hhcnQsIHtcbiAgICBjaGFydE5hbWU6IFwiUmFkaWFsQmFyQ2hhcnRcIixcbiAgICBkZWZhdWx0VG9vbHRpcEV2ZW50VHlwZTogXCJheGlzXCIsXG4gICAgdmFsaWRhdGVUb29sdGlwRXZlbnRUeXBlczogYWxsb3dlZFRvb2x0aXBUeXBlcyxcbiAgICB0b29sdGlwUGF5bG9hZFNlYXJjaGVyOiBhcnJheVRvb2x0aXBTZWFyY2hlcixcbiAgICBjYXRlZ29yaWNhbENoYXJ0UHJvcHM6IHByb3BzV2l0aERlZmF1bHRzLFxuICAgIHJlZjogcmVmXG4gIH0pO1xufSk7IiwiZnVuY3Rpb24gX2V4dGVuZHMoKSB7IHJldHVybiBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gPyBPYmplY3QuYXNzaWduLmJpbmQoKSA6IGZ1bmN0aW9uIChuKSB7IGZvciAodmFyIGUgPSAxOyBlIDwgYXJndW1lbnRzLmxlbmd0aDsgZSsrKSB7IHZhciB0ID0gYXJndW1lbnRzW2VdOyBmb3IgKHZhciByIGluIHQpICh7fSkuaGFzT3duUHJvcGVydHkuY2FsbCh0LCByKSAmJiAobltyXSA9IHRbcl0pOyB9IHJldHVybiBuOyB9LCBfZXh0ZW5kcy5hcHBseShudWxsLCBhcmd1bWVudHMpOyB9XG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBmb3J3YXJkUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgUmVjaGFydHNTdG9yZVByb3ZpZGVyIH0gZnJvbSAnLi4vc3RhdGUvUmVjaGFydHNTdG9yZVByb3ZpZGVyJztcbmltcG9ydCB7IENoYXJ0RGF0YUNvbnRleHRQcm92aWRlciB9IGZyb20gJy4uL2NvbnRleHQvY2hhcnREYXRhQ29udGV4dCc7XG5pbXBvcnQgeyBSZXBvcnRNYWluQ2hhcnRQcm9wcyB9IGZyb20gJy4uL3N0YXRlL1JlcG9ydE1haW5DaGFydFByb3BzJztcbmltcG9ydCB7IFJlcG9ydENoYXJ0UHJvcHMgfSBmcm9tICcuLi9zdGF0ZS9SZXBvcnRDaGFydFByb3BzJztcbmltcG9ydCB7IENhdGVnb3JpY2FsQ2hhcnQgfSBmcm9tICcuL0NhdGVnb3JpY2FsQ2hhcnQnO1xuaW1wb3J0IHsgcmVzb2x2ZURlZmF1bHRQcm9wcyB9IGZyb20gJy4uL3V0aWwvcmVzb2x2ZURlZmF1bHRQcm9wcyc7XG52YXIgZGVmYXVsdE1hcmdpbiA9IHtcbiAgdG9wOiA1LFxuICByaWdodDogNSxcbiAgYm90dG9tOiA1LFxuICBsZWZ0OiA1XG59O1xudmFyIGRlZmF1bHRQcm9wcyA9IHtcbiAgYWNjZXNzaWJpbGl0eUxheWVyOiB0cnVlLFxuICBsYXlvdXQ6ICdob3Jpem9udGFsJyxcbiAgc3RhY2tPZmZzZXQ6ICdub25lJyxcbiAgYmFyQ2F0ZWdvcnlHYXA6ICcxMCUnLFxuICBiYXJHYXA6IDQsXG4gIG1hcmdpbjogZGVmYXVsdE1hcmdpbixcbiAgcmV2ZXJzZVN0YWNrT3JkZXI6IGZhbHNlLFxuICBzeW5jTWV0aG9kOiAnaW5kZXgnLFxuICByZXNwb25zaXZlOiBmYWxzZVxufTtcblxuLyoqXG4gKiBUaGVzZSBhcmUgb25lLXRpbWUsIGltbXV0YWJsZSBvcHRpb25zIHRoYXQgZGVjaWRlIHRoZSBjaGFydCdzIGJlaGF2aW9yLlxuICogVXNlcnMgd2hvIHdpc2ggdG8gY2FsbCBDYXJ0ZXNpYW5DaGFydCBtYXkgZGVjaWRlIHRvIHBhc3MgdGhlc2Ugb3B0aW9ucyBleHBsaWNpdGx5LFxuICogYnV0IHVzdWFsbHkgd2Ugd291bGQgZXhwZWN0IHRoYXQgdGhleSB1c2Ugb25lIG9mIHRoZSBjb252ZW5pZW5jZSBjb21wb25lbnRzIGxpa2UgQmFyQ2hhcnQsIExpbmVDaGFydCwgZXRjLlxuICovXG5cbmV4cG9ydCB2YXIgQ2FydGVzaWFuQ2hhcnQgPSAvKiNfX1BVUkVfXyovZm9yd2FyZFJlZihmdW5jdGlvbiBDYXJ0ZXNpYW5DaGFydChwcm9wcywgcmVmKSB7XG4gIHZhciBfY2F0ZWdvcmljYWxDaGFydFByb3A7XG4gIHZhciByb290Q2hhcnRQcm9wcyA9IHJlc29sdmVEZWZhdWx0UHJvcHMocHJvcHMuY2F0ZWdvcmljYWxDaGFydFByb3BzLCBkZWZhdWx0UHJvcHMpO1xuICB2YXIge1xuICAgIGNoYXJ0TmFtZSxcbiAgICBkZWZhdWx0VG9vbHRpcEV2ZW50VHlwZSxcbiAgICB2YWxpZGF0ZVRvb2x0aXBFdmVudFR5cGVzLFxuICAgIHRvb2x0aXBQYXlsb2FkU2VhcmNoZXIsXG4gICAgY2F0ZWdvcmljYWxDaGFydFByb3BzXG4gIH0gPSBwcm9wcztcbiAgdmFyIG9wdGlvbnMgPSB7XG4gICAgY2hhcnROYW1lLFxuICAgIGRlZmF1bHRUb29sdGlwRXZlbnRUeXBlLFxuICAgIHZhbGlkYXRlVG9vbHRpcEV2ZW50VHlwZXMsXG4gICAgdG9vbHRpcFBheWxvYWRTZWFyY2hlcixcbiAgICBldmVudEVtaXR0ZXI6IHVuZGVmaW5lZFxuICB9O1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVjaGFydHNTdG9yZVByb3ZpZGVyLCB7XG4gICAgcHJlbG9hZGVkU3RhdGU6IHtcbiAgICAgIG9wdGlvbnNcbiAgICB9LFxuICAgIHJlZHV4U3RvcmVOYW1lOiAoX2NhdGVnb3JpY2FsQ2hhcnRQcm9wID0gY2F0ZWdvcmljYWxDaGFydFByb3BzLmlkKSAhPT0gbnVsbCAmJiBfY2F0ZWdvcmljYWxDaGFydFByb3AgIT09IHZvaWQgMCA/IF9jYXRlZ29yaWNhbENoYXJ0UHJvcCA6IGNoYXJ0TmFtZVxuICB9LCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChDaGFydERhdGFDb250ZXh0UHJvdmlkZXIsIHtcbiAgICBjaGFydERhdGE6IGNhdGVnb3JpY2FsQ2hhcnRQcm9wcy5kYXRhXG4gIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZXBvcnRNYWluQ2hhcnRQcm9wcywge1xuICAgIGxheW91dDogcm9vdENoYXJ0UHJvcHMubGF5b3V0LFxuICAgIG1hcmdpbjogcm9vdENoYXJ0UHJvcHMubWFyZ2luXG4gIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZXBvcnRDaGFydFByb3BzLCB7XG4gICAgYWNjZXNzaWJpbGl0eUxheWVyOiByb290Q2hhcnRQcm9wcy5hY2Nlc3NpYmlsaXR5TGF5ZXIsXG4gICAgYmFyQ2F0ZWdvcnlHYXA6IHJvb3RDaGFydFByb3BzLmJhckNhdGVnb3J5R2FwLFxuICAgIG1heEJhclNpemU6IHJvb3RDaGFydFByb3BzLm1heEJhclNpemUsXG4gICAgc3RhY2tPZmZzZXQ6IHJvb3RDaGFydFByb3BzLnN0YWNrT2Zmc2V0LFxuICAgIGJhckdhcDogcm9vdENoYXJ0UHJvcHMuYmFyR2FwLFxuICAgIGJhclNpemU6IHJvb3RDaGFydFByb3BzLmJhclNpemUsXG4gICAgc3luY0lkOiByb290Q2hhcnRQcm9wcy5zeW5jSWQsXG4gICAgc3luY01ldGhvZDogcm9vdENoYXJ0UHJvcHMuc3luY01ldGhvZCxcbiAgICBjbGFzc05hbWU6IHJvb3RDaGFydFByb3BzLmNsYXNzTmFtZVxuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQ2F0ZWdvcmljYWxDaGFydCwgX2V4dGVuZHMoe30sIHJvb3RDaGFydFByb3BzLCB7XG4gICAgcmVmOiByZWZcbiAgfSkpKTtcbn0pOyIsInZhciBfZXhjbHVkZWQgPSBbXCJzb3VyY2VYXCIsIFwic291cmNlWVwiLCBcInNvdXJjZUNvbnRyb2xYXCIsIFwidGFyZ2V0WFwiLCBcInRhcmdldFlcIiwgXCJ0YXJnZXRDb250cm9sWFwiLCBcImxpbmtXaWR0aFwiXSxcbiAgX2V4Y2x1ZGVkMiA9IFtcImNsYXNzTmFtZVwiLCBcInN0eWxlXCIsIFwiY2hpbGRyZW5cIl07XG5mdW5jdGlvbiBfZXh0ZW5kcygpIHsgcmV0dXJuIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiA/IE9iamVjdC5hc3NpZ24uYmluZCgpIDogZnVuY3Rpb24gKG4pIHsgZm9yICh2YXIgZSA9IDE7IGUgPCBhcmd1bWVudHMubGVuZ3RoOyBlKyspIHsgdmFyIHQgPSBhcmd1bWVudHNbZV07IGZvciAodmFyIHIgaW4gdCkgKHt9KS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHQsIHIpICYmIChuW3JdID0gdFtyXSk7IH0gcmV0dXJuIG47IH0sIF9leHRlbmRzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7IH1cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhlLCB0KSB7IGlmIChudWxsID09IGUpIHJldHVybiB7fTsgdmFyIG8sIHIsIGkgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShlLCB0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG4gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyBmb3IgKHIgPSAwOyByIDwgbi5sZW5ndGg7IHIrKykgbyA9IG5bcl0sIC0xID09PSB0LmluZGV4T2YobykgJiYge30ucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChlLCBvKSAmJiAoaVtvXSA9IGVbb10pOyB9IHJldHVybiBpOyB9XG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShyLCBlKSB7IGlmIChudWxsID09IHIpIHJldHVybiB7fTsgdmFyIHQgPSB7fTsgZm9yICh2YXIgbiBpbiByKSBpZiAoe30uaGFzT3duUHJvcGVydHkuY2FsbChyLCBuKSkgeyBpZiAoLTEgIT09IGUuaW5kZXhPZihuKSkgY29udGludWU7IHRbbl0gPSByW25dOyB9IHJldHVybiB0OyB9XG5mdW5jdGlvbiBvd25LZXlzKGUsIHIpIHsgdmFyIHQgPSBPYmplY3Qua2V5cyhlKTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG8gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyByICYmIChvID0gby5maWx0ZXIoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZSwgcikuZW51bWVyYWJsZTsgfSkpLCB0LnB1c2guYXBwbHkodCwgbyk7IH0gcmV0dXJuIHQ7IH1cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQoZSkgeyBmb3IgKHZhciByID0gMTsgciA8IGFyZ3VtZW50cy5sZW5ndGg7IHIrKykgeyB2YXIgdCA9IG51bGwgIT0gYXJndW1lbnRzW3JdID8gYXJndW1lbnRzW3JdIDoge307IHIgJSAyID8gb3duS2V5cyhPYmplY3QodCksICEwKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0W3JdKTsgfSkgOiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGUsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHQpKSA6IG93bktleXMoT2JqZWN0KHQpKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHQsIHIpKTsgfSk7IH0gcmV0dXJuIGU7IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0KSB7IHJldHVybiAociA9IF90b1Byb3BlcnR5S2V5KHIpKSBpbiBlID8gT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIHsgdmFsdWU6IHQsIGVudW1lcmFibGU6ICEwLCBjb25maWd1cmFibGU6ICEwLCB3cml0YWJsZTogITAgfSkgOiBlW3JdID0gdCwgZTsgfVxuZnVuY3Rpb24gX3RvUHJvcGVydHlLZXkodCkgeyB2YXIgaSA9IF90b1ByaW1pdGl2ZSh0LCBcInN0cmluZ1wiKTsgcmV0dXJuIFwic3ltYm9sXCIgPT0gdHlwZW9mIGkgPyBpIDogaSArIFwiXCI7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZSh0LCByKSB7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiB0IHx8ICF0KSByZXR1cm4gdDsgdmFyIGUgPSB0W1N5bWJvbC50b1ByaW1pdGl2ZV07IGlmICh2b2lkIDAgIT09IGUpIHsgdmFyIGkgPSBlLmNhbGwodCwgciB8fCBcImRlZmF1bHRcIik7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiBpKSByZXR1cm4gaTsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpOyB9IHJldHVybiAoXCJzdHJpbmdcIiA9PT0gciA/IFN0cmluZyA6IE51bWJlcikodCk7IH1cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZUNhbGxiYWNrLCB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBtYXhCeSBmcm9tICdlcy10b29sa2l0L2NvbXBhdC9tYXhCeSc7XG5pbXBvcnQgc3VtQnkgZnJvbSAnZXMtdG9vbGtpdC9jb21wYXQvc3VtQnknO1xuaW1wb3J0IGdldCBmcm9tICdlcy10b29sa2l0L2NvbXBhdC9nZXQnO1xuaW1wb3J0IHsgU3VyZmFjZSB9IGZyb20gJy4uL2NvbnRhaW5lci9TdXJmYWNlJztcbmltcG9ydCB7IExheWVyIH0gZnJvbSAnLi4vY29udGFpbmVyL0xheWVyJztcbmltcG9ydCB7IFJlY3RhbmdsZSB9IGZyb20gJy4uL3NoYXBlL1JlY3RhbmdsZSc7XG5pbXBvcnQgeyBnZXRWYWx1ZUJ5RGF0YUtleSB9IGZyb20gJy4uL3V0aWwvQ2hhcnRVdGlscyc7XG5pbXBvcnQgeyBSZXBvcnRDaGFydE1hcmdpbiwgUmVwb3J0Q2hhcnRTaXplLCB1c2VDaGFydEhlaWdodCwgdXNlQ2hhcnRXaWR0aCB9IGZyb20gJy4uL2NvbnRleHQvY2hhcnRMYXlvdXRDb250ZXh0JztcbmltcG9ydCB7IFRvb2x0aXBQb3J0YWxDb250ZXh0IH0gZnJvbSAnLi4vY29udGV4dC90b29sdGlwUG9ydGFsQ29udGV4dCc7XG5pbXBvcnQgeyBSZWNoYXJ0c1dyYXBwZXIgfSBmcm9tICcuL1JlY2hhcnRzV3JhcHBlcic7XG5pbXBvcnQgeyBSZWNoYXJ0c1N0b3JlUHJvdmlkZXIgfSBmcm9tICcuLi9zdGF0ZS9SZWNoYXJ0c1N0b3JlUHJvdmlkZXInO1xuaW1wb3J0IHsgdXNlQXBwRGlzcGF0Y2ggfSBmcm9tICcuLi9zdGF0ZS9ob29rcyc7XG5pbXBvcnQgeyBtb3VzZUxlYXZlSXRlbSwgc2V0QWN0aXZlQ2xpY2tJdGVtSW5kZXgsIHNldEFjdGl2ZU1vdXNlT3Zlckl0ZW1JbmRleCB9IGZyb20gJy4uL3N0YXRlL3Rvb2x0aXBTbGljZSc7XG5pbXBvcnQgeyBTZXRUb29sdGlwRW50cnlTZXR0aW5ncyB9IGZyb20gJy4uL3N0YXRlL1NldFRvb2x0aXBFbnRyeVNldHRpbmdzJztcbmltcG9ydCB7IFNldENvbXB1dGVkRGF0YSB9IGZyb20gJy4uL2NvbnRleHQvY2hhcnREYXRhQ29udGV4dCc7XG5pbXBvcnQgeyBzdmdQcm9wZXJ0aWVzTm9FdmVudHMsIHN2Z1Byb3BlcnRpZXNOb0V2ZW50c0Zyb21Vbmtub3duIH0gZnJvbSAnLi4vdXRpbC9zdmdQcm9wZXJ0aWVzTm9FdmVudHMnO1xuaW1wb3J0IHsgcmVzb2x2ZURlZmF1bHRQcm9wcyB9IGZyb20gJy4uL3V0aWwvcmVzb2x2ZURlZmF1bHRQcm9wcyc7XG5pbXBvcnQgeyBpc1Bvc2l0aXZlTnVtYmVyIH0gZnJvbSAnLi4vdXRpbC9pc1dlbGxCZWhhdmVkTnVtYmVyJztcbnZhciBpbnRlcnBvbGF0aW9uR2VuZXJhdG9yID0gKGEsIGIpID0+IHtcbiAgdmFyIGthID0gK2E7XG4gIHZhciBrYiA9IGIgLSBrYTtcbiAgcmV0dXJuIHQgPT4ga2EgKyBrYiAqIHQ7XG59O1xudmFyIGNlbnRlclkgPSBub2RlID0+IG5vZGUueSArIG5vZGUuZHkgLyAyO1xudmFyIGdldFZhbHVlID0gZW50cnkgPT4gZW50cnkgJiYgZW50cnkudmFsdWUgfHwgMDtcbnZhciBnZXRTdW1PZklkcyA9IChsaW5rcywgaWRzKSA9PiBpZHMucmVkdWNlKChyZXN1bHQsIGlkKSA9PiByZXN1bHQgKyBnZXRWYWx1ZShsaW5rc1tpZF0pLCAwKTtcbnZhciBnZXRTdW1XaXRoV2VpZ2h0ZWRTb3VyY2UgPSAodHJlZSwgbGlua3MsIGlkcykgPT4gaWRzLnJlZHVjZSgocmVzdWx0LCBpZCkgPT4ge1xuICB2YXIgbGluayA9IGxpbmtzW2lkXTtcbiAgdmFyIHNvdXJjZU5vZGUgPSB0cmVlW2xpbmsuc291cmNlXTtcbiAgcmV0dXJuIHJlc3VsdCArIGNlbnRlclkoc291cmNlTm9kZSkgKiBnZXRWYWx1ZShsaW5rc1tpZF0pO1xufSwgMCk7XG52YXIgZ2V0U3VtV2l0aFdlaWdodGVkVGFyZ2V0ID0gKHRyZWUsIGxpbmtzLCBpZHMpID0+IGlkcy5yZWR1Y2UoKHJlc3VsdCwgaWQpID0+IHtcbiAgdmFyIGxpbmsgPSBsaW5rc1tpZF07XG4gIHZhciB0YXJnZXROb2RlID0gdHJlZVtsaW5rLnRhcmdldF07XG4gIHJldHVybiByZXN1bHQgKyBjZW50ZXJZKHRhcmdldE5vZGUpICogZ2V0VmFsdWUobGlua3NbaWRdKTtcbn0sIDApO1xudmFyIGFzY2VuZGluZ1kgPSAoYSwgYikgPT4gYS55IC0gYi55O1xudmFyIHNlYXJjaFRhcmdldHNBbmRTb3VyY2VzID0gKGxpbmtzLCBpZCkgPT4ge1xuICB2YXIgc291cmNlTm9kZXMgPSBbXTtcbiAgdmFyIHNvdXJjZUxpbmtzID0gW107XG4gIHZhciB0YXJnZXROb2RlcyA9IFtdO1xuICB2YXIgdGFyZ2V0TGlua3MgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGxpbmtzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdmFyIGxpbmsgPSBsaW5rc1tpXTtcbiAgICBpZiAobGluay5zb3VyY2UgPT09IGlkKSB7XG4gICAgICB0YXJnZXROb2Rlcy5wdXNoKGxpbmsudGFyZ2V0KTtcbiAgICAgIHRhcmdldExpbmtzLnB1c2goaSk7XG4gICAgfVxuICAgIGlmIChsaW5rLnRhcmdldCA9PT0gaWQpIHtcbiAgICAgIHNvdXJjZU5vZGVzLnB1c2gobGluay5zb3VyY2UpO1xuICAgICAgc291cmNlTGlua3MucHVzaChpKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBzb3VyY2VOb2RlcyxcbiAgICBzb3VyY2VMaW5rcyxcbiAgICB0YXJnZXRMaW5rcyxcbiAgICB0YXJnZXROb2Rlc1xuICB9O1xufTtcbnZhciB1cGRhdGVEZXB0aE9mVGFyZ2V0cyA9ICh0cmVlLCBjdXJOb2RlKSA9PiB7XG4gIHZhciB7XG4gICAgdGFyZ2V0Tm9kZXNcbiAgfSA9IGN1ck5vZGU7XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0YXJnZXROb2Rlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIHZhciB0YXJnZXQgPSB0cmVlW3RhcmdldE5vZGVzW2ldXTtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICB0YXJnZXQuZGVwdGggPSBNYXRoLm1heChjdXJOb2RlLmRlcHRoICsgMSwgdGFyZ2V0LmRlcHRoKTtcbiAgICAgIHVwZGF0ZURlcHRoT2ZUYXJnZXRzKHRyZWUsIHRhcmdldCk7XG4gICAgfVxuICB9XG59O1xudmFyIGdldE5vZGVzVHJlZSA9IChfcmVmLCB3aWR0aCwgbm9kZVdpZHRoKSA9PiB7XG4gIHZhciBfbWF4QnkkZGVwdGgsIF9tYXhCeTtcbiAgdmFyIHtcbiAgICBub2RlcyxcbiAgICBsaW5rc1xuICB9ID0gX3JlZjtcbiAgdmFyIHRyZWUgPSBub2Rlcy5tYXAoKGVudHJ5LCBpbmRleCkgPT4ge1xuICAgIHZhciByZXN1bHQgPSBzZWFyY2hUYXJnZXRzQW5kU291cmNlcyhsaW5rcywgaW5kZXgpO1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgZW50cnkpLCByZXN1bHQpLCB7fSwge1xuICAgICAgdmFsdWU6IE1hdGgubWF4KGdldFN1bU9mSWRzKGxpbmtzLCByZXN1bHQuc291cmNlTGlua3MpLCBnZXRTdW1PZklkcyhsaW5rcywgcmVzdWx0LnRhcmdldExpbmtzKSksXG4gICAgICBkZXB0aDogMFxuICAgIH0pO1xuICB9KTtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRyZWUubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICB2YXIgbm9kZSA9IHRyZWVbaV07XG4gICAgaWYgKCFub2RlLnNvdXJjZU5vZGVzLmxlbmd0aCkge1xuICAgICAgdXBkYXRlRGVwdGhPZlRhcmdldHModHJlZSwgbm9kZSk7XG4gICAgfVxuICB9XG4gIHZhciBtYXhEZXB0aCA9IChfbWF4QnkkZGVwdGggPSAoX21heEJ5ID0gbWF4QnkodHJlZSwgZW50cnkgPT4gZW50cnkuZGVwdGgpKSA9PT0gbnVsbCB8fCBfbWF4QnkgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9tYXhCeS5kZXB0aCkgIT09IG51bGwgJiYgX21heEJ5JGRlcHRoICE9PSB2b2lkIDAgPyBfbWF4QnkkZGVwdGggOiAwO1xuICBpZiAobWF4RGVwdGggPj0gMSkge1xuICAgIHZhciBjaGlsZFdpZHRoID0gKHdpZHRoIC0gbm9kZVdpZHRoKSAvIG1heERlcHRoO1xuICAgIGZvciAodmFyIF9pID0gMCwgX2xlbiA9IHRyZWUubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgIHZhciBfbm9kZSA9IHRyZWVbX2ldO1xuICAgICAgaWYgKCFfbm9kZS50YXJnZXROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgX25vZGUuZGVwdGggPSBtYXhEZXB0aDtcbiAgICAgIH1cbiAgICAgIF9ub2RlLnggPSBfbm9kZS5kZXB0aCAqIGNoaWxkV2lkdGg7XG4gICAgICBfbm9kZS5keCA9IG5vZGVXaWR0aDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtcbiAgICB0cmVlLFxuICAgIG1heERlcHRoXG4gIH07XG59O1xudmFyIGdldERlcHRoVHJlZSA9IHRyZWUgPT4ge1xuICB2YXIgcmVzdWx0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0cmVlLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdmFyIG5vZGUgPSB0cmVlW2ldO1xuICAgIGlmICghcmVzdWx0W25vZGUuZGVwdGhdKSB7XG4gICAgICByZXN1bHRbbm9kZS5kZXB0aF0gPSBbXTtcbiAgICB9XG4gICAgcmVzdWx0W25vZGUuZGVwdGhdLnB1c2gobm9kZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG52YXIgdXBkYXRlWU9mVHJlZSA9IChkZXB0aFRyZWUsIGhlaWdodCwgbm9kZVBhZGRpbmcsIGxpbmtzKSA9PiB7XG4gIHZhciB5UmF0aW8gPSBNYXRoLm1pbiguLi5kZXB0aFRyZWUubWFwKG5vZGVzID0+IChoZWlnaHQgLSAobm9kZXMubGVuZ3RoIC0gMSkgKiBub2RlUGFkZGluZykgLyBzdW1CeShub2RlcywgZ2V0VmFsdWUpKSk7XG4gIGZvciAodmFyIGQgPSAwLCBtYXhEZXB0aCA9IGRlcHRoVHJlZS5sZW5ndGg7IGQgPCBtYXhEZXB0aDsgZCsrKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGRlcHRoVHJlZVtkXS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgdmFyIG5vZGUgPSBkZXB0aFRyZWVbZF1baV07XG4gICAgICBub2RlLnkgPSBpO1xuICAgICAgbm9kZS5keSA9IG5vZGUudmFsdWUgKiB5UmF0aW87XG4gICAgfVxuICB9XG4gIHJldHVybiBsaW5rcy5tYXAobGluayA9PiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGxpbmspLCB7fSwge1xuICAgIGR5OiBnZXRWYWx1ZShsaW5rKSAqIHlSYXRpb1xuICB9KSk7XG59O1xudmFyIHJlc29sdmVDb2xsaXNpb25zID0gZnVuY3Rpb24gcmVzb2x2ZUNvbGxpc2lvbnMoZGVwdGhUcmVlLCBoZWlnaHQsIG5vZGVQYWRkaW5nKSB7XG4gIHZhciBzb3J0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiB0cnVlO1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gZGVwdGhUcmVlLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdmFyIG5vZGVzID0gZGVwdGhUcmVlW2ldO1xuICAgIHZhciBuID0gbm9kZXMubGVuZ3RoO1xuXG4gICAgLy8gU29ydCBieSB0aGUgdmFsdWUgb2YgeVxuICAgIGlmIChzb3J0KSB7XG4gICAgICBub2Rlcy5zb3J0KGFzY2VuZGluZ1kpO1xuICAgIH1cbiAgICB2YXIgeTAgPSAwO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgbjsgaisrKSB7XG4gICAgICB2YXIgbm9kZSA9IG5vZGVzW2pdO1xuICAgICAgdmFyIGR5ID0geTAgLSBub2RlLnk7XG4gICAgICBpZiAoZHkgPiAwKSB7XG4gICAgICAgIG5vZGUueSArPSBkeTtcbiAgICAgIH1cbiAgICAgIHkwID0gbm9kZS55ICsgbm9kZS5keSArIG5vZGVQYWRkaW5nO1xuICAgIH1cbiAgICB5MCA9IGhlaWdodCArIG5vZGVQYWRkaW5nO1xuICAgIGZvciAodmFyIF9qID0gbiAtIDE7IF9qID49IDA7IF9qLS0pIHtcbiAgICAgIHZhciBfbm9kZTIgPSBub2Rlc1tfal07XG4gICAgICB2YXIgX2R5ID0gX25vZGUyLnkgKyBfbm9kZTIuZHkgKyBub2RlUGFkZGluZyAtIHkwO1xuICAgICAgaWYgKF9keSA+IDApIHtcbiAgICAgICAgX25vZGUyLnkgLT0gX2R5O1xuICAgICAgICB5MCA9IF9ub2RlMi55O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xudmFyIHJlbGF4TGVmdFRvUmlnaHQgPSAodHJlZSwgZGVwdGhUcmVlLCBsaW5rcywgYWxwaGEpID0+IHtcbiAgZm9yICh2YXIgaSA9IDAsIG1heERlcHRoID0gZGVwdGhUcmVlLmxlbmd0aDsgaSA8IG1heERlcHRoOyBpKyspIHtcbiAgICB2YXIgbm9kZXMgPSBkZXB0aFRyZWVbaV07XG4gICAgZm9yICh2YXIgaiA9IDAsIGxlbiA9IG5vZGVzLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICB2YXIgbm9kZSA9IG5vZGVzW2pdO1xuICAgICAgaWYgKG5vZGUuc291cmNlTGlua3MubGVuZ3RoKSB7XG4gICAgICAgIHZhciBzb3VyY2VTdW0gPSBnZXRTdW1PZklkcyhsaW5rcywgbm9kZS5zb3VyY2VMaW5rcyk7XG4gICAgICAgIHZhciB3ZWlnaHRlZFN1bSA9IGdldFN1bVdpdGhXZWlnaHRlZFNvdXJjZSh0cmVlLCBsaW5rcywgbm9kZS5zb3VyY2VMaW5rcyk7XG4gICAgICAgIHZhciB5ID0gd2VpZ2h0ZWRTdW0gLyBzb3VyY2VTdW07XG4gICAgICAgIG5vZGUueSArPSAoeSAtIGNlbnRlclkobm9kZSkpICogYWxwaGE7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xudmFyIHJlbGF4UmlnaHRUb0xlZnQgPSAodHJlZSwgZGVwdGhUcmVlLCBsaW5rcywgYWxwaGEpID0+IHtcbiAgZm9yICh2YXIgaSA9IGRlcHRoVHJlZS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHZhciBub2RlcyA9IGRlcHRoVHJlZVtpXTtcbiAgICBmb3IgKHZhciBqID0gMCwgbGVuID0gbm9kZXMubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIHZhciBub2RlID0gbm9kZXNbal07XG4gICAgICBpZiAobm9kZS50YXJnZXRMaW5rcy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIHRhcmdldFN1bSA9IGdldFN1bU9mSWRzKGxpbmtzLCBub2RlLnRhcmdldExpbmtzKTtcbiAgICAgICAgdmFyIHdlaWdodGVkU3VtID0gZ2V0U3VtV2l0aFdlaWdodGVkVGFyZ2V0KHRyZWUsIGxpbmtzLCBub2RlLnRhcmdldExpbmtzKTtcbiAgICAgICAgdmFyIHkgPSB3ZWlnaHRlZFN1bSAvIHRhcmdldFN1bTtcbiAgICAgICAgbm9kZS55ICs9ICh5IC0gY2VudGVyWShub2RlKSkgKiBhbHBoYTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG52YXIgdXBkYXRlWU9mTGlua3MgPSAodHJlZSwgbGlua3MpID0+IHtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRyZWUubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICB2YXIgbm9kZSA9IHRyZWVbaV07XG4gICAgdmFyIHN5ID0gMDtcbiAgICB2YXIgdHkgPSAwO1xuICAgIG5vZGUudGFyZ2V0TGlua3Muc29ydCgoYSwgYikgPT4gdHJlZVtsaW5rc1thXS50YXJnZXRdLnkgLSB0cmVlW2xpbmtzW2JdLnRhcmdldF0ueSk7XG4gICAgbm9kZS5zb3VyY2VMaW5rcy5zb3J0KChhLCBiKSA9PiB0cmVlW2xpbmtzW2FdLnNvdXJjZV0ueSAtIHRyZWVbbGlua3NbYl0uc291cmNlXS55KTtcbiAgICBmb3IgKHZhciBqID0gMCwgdExlbiA9IG5vZGUudGFyZ2V0TGlua3MubGVuZ3RoOyBqIDwgdExlbjsgaisrKSB7XG4gICAgICB2YXIgbGluayA9IGxpbmtzW25vZGUudGFyZ2V0TGlua3Nbal1dO1xuICAgICAgaWYgKGxpbmspIHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB3ZSBzaG91bGQgcmVmYWN0b3IgdGhpcyB0byBpbW11dGFibGVcbiAgICAgICAgbGluay5zeSA9IHN5O1xuICAgICAgICBzeSArPSBsaW5rLmR5O1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBfajIgPSAwLCBzTGVuID0gbm9kZS5zb3VyY2VMaW5rcy5sZW5ndGg7IF9qMiA8IHNMZW47IF9qMisrKSB7XG4gICAgICB2YXIgX2xpbmsgPSBsaW5rc1tub2RlLnNvdXJjZUxpbmtzW19qMl1dO1xuICAgICAgaWYgKF9saW5rKSB7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3Igd2Ugc2hvdWxkIHJlZmFjdG9yIHRoaXMgdG8gaW1tdXRhYmxlXG4gICAgICAgIF9saW5rLnR5ID0gdHk7XG4gICAgICAgIHR5ICs9IF9saW5rLmR5O1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcbnZhciBjb21wdXRlRGF0YSA9IF9yZWYyID0+IHtcbiAgdmFyIHtcbiAgICBkYXRhLFxuICAgIHdpZHRoLFxuICAgIGhlaWdodCxcbiAgICBpdGVyYXRpb25zLFxuICAgIG5vZGVXaWR0aCxcbiAgICBub2RlUGFkZGluZyxcbiAgICBzb3J0XG4gIH0gPSBfcmVmMjtcbiAgdmFyIHtcbiAgICBsaW5rc1xuICB9ID0gZGF0YTtcbiAgdmFyIHtcbiAgICB0cmVlXG4gIH0gPSBnZXROb2Rlc1RyZWUoZGF0YSwgd2lkdGgsIG5vZGVXaWR0aCk7XG4gIHZhciBkZXB0aFRyZWUgPSBnZXREZXB0aFRyZWUodHJlZSk7XG4gIHZhciBsaW5rc1dpdGhEeSA9IHVwZGF0ZVlPZlRyZWUoZGVwdGhUcmVlLCBoZWlnaHQsIG5vZGVQYWRkaW5nLCBsaW5rcyk7XG4gIHJlc29sdmVDb2xsaXNpb25zKGRlcHRoVHJlZSwgaGVpZ2h0LCBub2RlUGFkZGluZywgc29ydCk7XG4gIHZhciBhbHBoYSA9IDE7XG4gIGZvciAodmFyIGkgPSAxOyBpIDw9IGl0ZXJhdGlvbnM7IGkrKykge1xuICAgIHJlbGF4UmlnaHRUb0xlZnQodHJlZSwgZGVwdGhUcmVlLCBsaW5rc1dpdGhEeSwgYWxwaGEgKj0gMC45OSk7XG4gICAgcmVzb2x2ZUNvbGxpc2lvbnMoZGVwdGhUcmVlLCBoZWlnaHQsIG5vZGVQYWRkaW5nLCBzb3J0KTtcbiAgICByZWxheExlZnRUb1JpZ2h0KHRyZWUsIGRlcHRoVHJlZSwgbGlua3NXaXRoRHksIGFscGhhKTtcbiAgICByZXNvbHZlQ29sbGlzaW9ucyhkZXB0aFRyZWUsIGhlaWdodCwgbm9kZVBhZGRpbmcsIHNvcnQpO1xuICB9XG4gIHVwZGF0ZVlPZkxpbmtzKHRyZWUsIGxpbmtzV2l0aER5KTtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB1cGRhdGVZT2ZMaW5rcyBtb2RpZmllcyB0aGUgbGlua3MgYXJyYXkgdG8gYWRkIHN5IGFuZCB0eSBpbiBwbGFjZVxuICB2YXIgbmV3TGlua3MgPSBsaW5rc1dpdGhEeTtcbiAgcmV0dXJuIHtcbiAgICBub2RlczogdHJlZSxcbiAgICBsaW5rczogbmV3TGlua3NcbiAgfTtcbn07XG52YXIgZ2V0Tm9kZUNvb3JkaW5hdGVPZlRvb2x0aXAgPSBpdGVtID0+IHtcbiAgcmV0dXJuIHtcbiAgICB4OiAraXRlbS54ICsgK2l0ZW0ud2lkdGggLyAyLFxuICAgIHk6ICtpdGVtLnkgKyAraXRlbS5oZWlnaHQgLyAyXG4gIH07XG59O1xudmFyIGdldExpbmtDb29yZGluYXRlT2ZUb29sdGlwID0gaXRlbSA9PiB7XG4gIHJldHVybiAnc291cmNlWCcgaW4gaXRlbSA/IHtcbiAgICB4OiAoaXRlbS5zb3VyY2VYICsgaXRlbS50YXJnZXRYKSAvIDIsXG4gICAgeTogKGl0ZW0uc291cmNlWSArIGl0ZW0udGFyZ2V0WSkgLyAyXG4gIH0gOiB1bmRlZmluZWQ7XG59O1xudmFyIGdldFBheWxvYWRPZlRvb2x0aXAgPSAoaXRlbSwgdHlwZSwgbmFtZUtleSkgPT4ge1xuICB2YXIge1xuICAgIHBheWxvYWRcbiAgfSA9IGl0ZW07XG4gIGlmICh0eXBlID09PSAnbm9kZScpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcGF5bG9hZCxcbiAgICAgIG5hbWU6IGdldFZhbHVlQnlEYXRhS2V5KHBheWxvYWQsIG5hbWVLZXksICcnKSxcbiAgICAgIHZhbHVlOiBnZXRWYWx1ZUJ5RGF0YUtleShwYXlsb2FkLCAndmFsdWUnKVxuICAgIH07XG4gIH1cbiAgaWYgKCdzb3VyY2UnIGluIHBheWxvYWQgJiYgcGF5bG9hZC5zb3VyY2UgJiYgcGF5bG9hZC50YXJnZXQpIHtcbiAgICB2YXIgc291cmNlTmFtZSA9IGdldFZhbHVlQnlEYXRhS2V5KHBheWxvYWQuc291cmNlLCBuYW1lS2V5LCAnJyk7XG4gICAgdmFyIHRhcmdldE5hbWUgPSBnZXRWYWx1ZUJ5RGF0YUtleShwYXlsb2FkLnRhcmdldCwgbmFtZUtleSwgJycpO1xuICAgIHJldHVybiB7XG4gICAgICBwYXlsb2FkLFxuICAgICAgbmFtZTogXCJcIi5jb25jYXQoc291cmNlTmFtZSwgXCIgLSBcIikuY29uY2F0KHRhcmdldE5hbWUpLFxuICAgICAgdmFsdWU6IGdldFZhbHVlQnlEYXRhS2V5KHBheWxvYWQsICd2YWx1ZScpXG4gICAgfTtcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufTtcbmV4cG9ydCB2YXIgc2Fua2V5UGF5bG9hZFNlYXJjaGVyID0gKF8sIGFjdGl2ZUluZGV4LCBjb21wdXRlZERhdGEsIG5hbWVLZXkpID0+IHtcbiAgaWYgKGFjdGl2ZUluZGV4ID09IG51bGwgfHwgdHlwZW9mIGFjdGl2ZUluZGV4ICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgdmFyIHNwbGl0SW5kZXggPSBhY3RpdmVJbmRleC5zcGxpdCgnLScpO1xuICB2YXIgW3RhcmdldFR5cGUsIGluZGV4XSA9IHNwbGl0SW5kZXg7XG4gIHZhciBpdGVtID0gZ2V0KGNvbXB1dGVkRGF0YSwgXCJcIi5jb25jYXQodGFyZ2V0VHlwZSwgXCJzW1wiKS5jb25jYXQoaW5kZXgsIFwiXVwiKSk7XG4gIGlmIChpdGVtKSB7XG4gICAgdmFyIHBheWxvYWQgPSBnZXRQYXlsb2FkT2ZUb29sdGlwKGl0ZW0sIHRhcmdldFR5cGUsIG5hbWVLZXkpO1xuICAgIHJldHVybiBwYXlsb2FkO1xuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59O1xudmFyIG9wdGlvbnMgPSB7XG4gIGNoYXJ0TmFtZTogJ1NhbmtleScsXG4gIGRlZmF1bHRUb29sdGlwRXZlbnRUeXBlOiAnaXRlbScsXG4gIHZhbGlkYXRlVG9vbHRpcEV2ZW50VHlwZXM6IFsnaXRlbSddLFxuICB0b29sdGlwUGF5bG9hZFNlYXJjaGVyOiBzYW5rZXlQYXlsb2FkU2VhcmNoZXIsXG4gIGV2ZW50RW1pdHRlcjogdW5kZWZpbmVkXG59O1xuZnVuY3Rpb24gZ2V0VG9vbHRpcEVudHJ5U2V0dGluZ3MocHJvcHMpIHtcbiAgdmFyIHtcbiAgICBkYXRhS2V5LFxuICAgIG5hbWVLZXksXG4gICAgc3Ryb2tlLFxuICAgIHN0cm9rZVdpZHRoLFxuICAgIGZpbGwsXG4gICAgbmFtZSxcbiAgICBkYXRhXG4gIH0gPSBwcm9wcztcbiAgcmV0dXJuIHtcbiAgICBkYXRhRGVmaW5lZE9uSXRlbTogZGF0YSxcbiAgICBwb3NpdGlvbnM6IHVuZGVmaW5lZCxcbiAgICBzZXR0aW5nczoge1xuICAgICAgc3Ryb2tlLFxuICAgICAgc3Ryb2tlV2lkdGgsXG4gICAgICBmaWxsLFxuICAgICAgZGF0YUtleSxcbiAgICAgIG5hbWUsXG4gICAgICBuYW1lS2V5LFxuICAgICAgY29sb3I6IGZpbGwsXG4gICAgICB1bml0OiAnJyAvLyBTYW5rZXkgZG9lcyBub3QgaGF2ZSB1bml0LCB3aHk/XG4gICAgfVxuICB9O1xufVxuXG4vLyBUT0RPOiBpbXByb3ZlIHR5cGVzIC0gTm9kZU9wdGlvbnMgdXNlcyBTYW5rZXlOb2RlLCBMaW5rT3B0aW9ucyB1c2VzIExpbmtQcm9wcy4gU3RhbmRhcmRpemUuXG5cbi8vIFdoeSBpcyBtYXJnaW4gbm90IGEgU2Fua2V5IHByb3A/IE5vIGNsdWUuIFByb2JhYmx5IGl0IHNob3VsZCBiZVxudmFyIGRlZmF1bHRTYW5rZXlNYXJnaW4gPSB7XG4gIHRvcDogMCxcbiAgcmlnaHQ6IDAsXG4gIGJvdHRvbTogMCxcbiAgbGVmdDogMFxufTtcbmZ1bmN0aW9uIHJlbmRlckxpbmtJdGVtKG9wdGlvbiwgcHJvcHMpIHtcbiAgaWYgKC8qI19fUFVSRV9fKi9SZWFjdC5pc1ZhbGlkRWxlbWVudChvcHRpb24pKSB7XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jbG9uZUVsZW1lbnQob3B0aW9uLCBwcm9wcyk7XG4gIH1cbiAgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gb3B0aW9uKHByb3BzKTtcbiAgfVxuICB2YXIge1xuICAgICAgc291cmNlWCxcbiAgICAgIHNvdXJjZVksXG4gICAgICBzb3VyY2VDb250cm9sWCxcbiAgICAgIHRhcmdldFgsXG4gICAgICB0YXJnZXRZLFxuICAgICAgdGFyZ2V0Q29udHJvbFgsXG4gICAgICBsaW5rV2lkdGhcbiAgICB9ID0gcHJvcHMsXG4gICAgb3RoZXJzID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKHByb3BzLCBfZXhjbHVkZWQpO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJwYXRoXCIsIF9leHRlbmRzKHtcbiAgICBjbGFzc05hbWU6IFwicmVjaGFydHMtc2Fua2V5LWxpbmtcIixcbiAgICBkOiBcIlxcbiAgICAgICAgICBNXCIuY29uY2F0KHNvdXJjZVgsIFwiLFwiKS5jb25jYXQoc291cmNlWSwgXCJcXG4gICAgICAgICAgQ1wiKS5jb25jYXQoc291cmNlQ29udHJvbFgsIFwiLFwiKS5jb25jYXQoc291cmNlWSwgXCIgXCIpLmNvbmNhdCh0YXJnZXRDb250cm9sWCwgXCIsXCIpLmNvbmNhdCh0YXJnZXRZLCBcIiBcIikuY29uY2F0KHRhcmdldFgsIFwiLFwiKS5jb25jYXQodGFyZ2V0WSwgXCJcXG4gICAgICAgIFwiKSxcbiAgICBmaWxsOiBcIm5vbmVcIixcbiAgICBzdHJva2U6IFwiIzMzM1wiLFxuICAgIHN0cm9rZVdpZHRoOiBsaW5rV2lkdGgsXG4gICAgc3Ryb2tlT3BhY2l0eTogXCIwLjJcIlxuICB9LCBzdmdQcm9wZXJ0aWVzTm9FdmVudHMob3RoZXJzKSkpO1xufVxudmFyIGJ1aWxkTGlua1Byb3BzID0gX3JlZjMgPT4ge1xuICB2YXIge1xuICAgIGxpbmssXG4gICAgbm9kZXMsXG4gICAgbGVmdCxcbiAgICB0b3AsXG4gICAgaSxcbiAgICBsaW5rQ29udGVudCxcbiAgICBsaW5rQ3VydmF0dXJlXG4gIH0gPSBfcmVmMztcbiAgdmFyIHtcbiAgICBzeTogc291cmNlUmVsYXRpdmVZLFxuICAgIHR5OiB0YXJnZXRSZWxhdGl2ZVksXG4gICAgZHk6IGxpbmtXaWR0aFxuICB9ID0gbGluaztcbiAgdmFyIHNvdXJjZU5vZGUgPSBub2Rlc1tsaW5rLnNvdXJjZV07XG4gIHZhciB0YXJnZXROb2RlID0gbm9kZXNbbGluay50YXJnZXRdO1xuICB2YXIgc291cmNlWCA9IHNvdXJjZU5vZGUueCArIHNvdXJjZU5vZGUuZHggKyBsZWZ0O1xuICB2YXIgdGFyZ2V0WCA9IHRhcmdldE5vZGUueCArIGxlZnQ7XG4gIHZhciBpbnRlcnBvbGF0aW9uRnVuYyA9IGludGVycG9sYXRpb25HZW5lcmF0b3Ioc291cmNlWCwgdGFyZ2V0WCk7XG4gIHZhciBzb3VyY2VDb250cm9sWCA9IGludGVycG9sYXRpb25GdW5jKGxpbmtDdXJ2YXR1cmUpO1xuICB2YXIgdGFyZ2V0Q29udHJvbFggPSBpbnRlcnBvbGF0aW9uRnVuYygxIC0gbGlua0N1cnZhdHVyZSk7XG4gIHZhciBzb3VyY2VZID0gc291cmNlTm9kZS55ICsgc291cmNlUmVsYXRpdmVZICsgbGlua1dpZHRoIC8gMiArIHRvcDtcbiAgdmFyIHRhcmdldFkgPSB0YXJnZXROb2RlLnkgKyB0YXJnZXRSZWxhdGl2ZVkgKyBsaW5rV2lkdGggLyAyICsgdG9wO1xuICB2YXIgbGlua1Byb3BzID0gX29iamVjdFNwcmVhZCh7XG4gICAgc291cmNlWCxcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRoZSBsaW5rQ29udGVudCBmcm9tIGJlbG93IGlzIGNvbnRyaWJ1dGluZyB1bmtub3duIHByb3BzXG4gICAgdGFyZ2V0WCxcbiAgICBzb3VyY2VZLFxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdGhlIGxpbmtDb250ZW50IGZyb20gYmVsb3cgaXMgY29udHJpYnV0aW5nIHVua25vd24gcHJvcHNcbiAgICB0YXJnZXRZLFxuICAgIHNvdXJjZUNvbnRyb2xYLFxuICAgIHRhcmdldENvbnRyb2xYLFxuICAgIHNvdXJjZVJlbGF0aXZlWSxcbiAgICB0YXJnZXRSZWxhdGl2ZVksXG4gICAgbGlua1dpZHRoLFxuICAgIGluZGV4OiBpLFxuICAgIHBheWxvYWQ6IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgbGluayksIHt9LCB7XG4gICAgICBzb3VyY2U6IHNvdXJjZU5vZGUsXG4gICAgICB0YXJnZXQ6IHRhcmdldE5vZGVcbiAgICB9KVxuICB9LCBzdmdQcm9wZXJ0aWVzTm9FdmVudHNGcm9tVW5rbm93bihsaW5rQ29udGVudCkpO1xuICByZXR1cm4gbGlua1Byb3BzO1xufTtcbmZ1bmN0aW9uIFNhbmtleUxpbmtFbGVtZW50KF9yZWY0KSB7XG4gIHZhciB7XG4gICAgcHJvcHMsXG4gICAgaSxcbiAgICBsaW5rQ29udGVudCxcbiAgICBvbk1vdXNlRW50ZXI6IF9vbk1vdXNlRW50ZXIsXG4gICAgb25Nb3VzZUxlYXZlOiBfb25Nb3VzZUxlYXZlLFxuICAgIG9uQ2xpY2s6IF9vbkNsaWNrLFxuICAgIGRhdGFLZXlcbiAgfSA9IF9yZWY0O1xuICB2YXIgYWN0aXZlQ29vcmRpbmF0ZSA9IGdldExpbmtDb29yZGluYXRlT2ZUb29sdGlwKHByb3BzKTtcbiAgdmFyIGFjdGl2ZUluZGV4ID0gXCJsaW5rLVwiLmNvbmNhdChpKTtcbiAgdmFyIGRpc3BhdGNoID0gdXNlQXBwRGlzcGF0Y2goKTtcbiAgdmFyIGV2ZW50cyA9IHtcbiAgICBvbk1vdXNlRW50ZXI6IGUgPT4ge1xuICAgICAgZGlzcGF0Y2goc2V0QWN0aXZlTW91c2VPdmVySXRlbUluZGV4KHtcbiAgICAgICAgYWN0aXZlSW5kZXgsXG4gICAgICAgIGFjdGl2ZURhdGFLZXk6IGRhdGFLZXksXG4gICAgICAgIGFjdGl2ZUNvb3JkaW5hdGVcbiAgICAgIH0pKTtcbiAgICAgIF9vbk1vdXNlRW50ZXIocHJvcHMsIGUpO1xuICAgIH0sXG4gICAgb25Nb3VzZUxlYXZlOiBlID0+IHtcbiAgICAgIGRpc3BhdGNoKG1vdXNlTGVhdmVJdGVtKCkpO1xuICAgICAgX29uTW91c2VMZWF2ZShwcm9wcywgZSk7XG4gICAgfSxcbiAgICBvbkNsaWNrOiBlID0+IHtcbiAgICAgIGRpc3BhdGNoKHNldEFjdGl2ZUNsaWNrSXRlbUluZGV4KHtcbiAgICAgICAgYWN0aXZlSW5kZXgsXG4gICAgICAgIGFjdGl2ZURhdGFLZXk6IGRhdGFLZXksXG4gICAgICAgIGFjdGl2ZUNvb3JkaW5hdGVcbiAgICAgIH0pKTtcbiAgICAgIF9vbkNsaWNrKHByb3BzLCBlKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwgZXZlbnRzLCByZW5kZXJMaW5rSXRlbShsaW5rQ29udGVudCwgcHJvcHMpKTtcbn1cbmZ1bmN0aW9uIEFsbFNhbmtleUxpbmtFbGVtZW50cyhfcmVmNSkge1xuICB2YXIge1xuICAgIG1vZGlmaWVkTGlua3MsXG4gICAgbGlua3MsXG4gICAgbGlua0NvbnRlbnQsXG4gICAgb25Nb3VzZUVudGVyLFxuICAgIG9uTW91c2VMZWF2ZSxcbiAgICBvbkNsaWNrLFxuICAgIGRhdGFLZXlcbiAgfSA9IF9yZWY1O1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGF5ZXIsIHtcbiAgICBjbGFzc05hbWU6IFwicmVjaGFydHMtc2Fua2V5LWxpbmtzXCIsXG4gICAga2V5OiBcInJlY2hhcnRzLXNhbmtleS1saW5rc1wiXG4gIH0sIGxpbmtzLm1hcCgobGluaywgaSkgPT4ge1xuICAgIHZhciBsaW5rUHJvcHMgPSBtb2RpZmllZExpbmtzW2ldO1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTYW5rZXlMaW5rRWxlbWVudCwge1xuICAgICAga2V5OiBcImxpbmstXCIuY29uY2F0KGxpbmsuc291cmNlLCBcIi1cIikuY29uY2F0KGxpbmsudGFyZ2V0LCBcIi1cIikuY29uY2F0KGxpbmsudmFsdWUpLFxuICAgICAgcHJvcHM6IGxpbmtQcm9wcyxcbiAgICAgIGxpbmtDb250ZW50OiBsaW5rQ29udGVudCxcbiAgICAgIGk6IGksXG4gICAgICBvbk1vdXNlRW50ZXI6IG9uTW91c2VFbnRlcixcbiAgICAgIG9uTW91c2VMZWF2ZTogb25Nb3VzZUxlYXZlLFxuICAgICAgb25DbGljazogb25DbGljayxcbiAgICAgIGRhdGFLZXk6IGRhdGFLZXlcbiAgICB9KTtcbiAgfSkpO1xufVxuZnVuY3Rpb24gcmVuZGVyTm9kZUl0ZW0ob3B0aW9uLCBwcm9wcykge1xuICBpZiAoLyojX19QVVJFX18qL1JlYWN0LmlzVmFsaWRFbGVtZW50KG9wdGlvbikpIHtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNsb25lRWxlbWVudChvcHRpb24sIHByb3BzKTtcbiAgfVxuICBpZiAodHlwZW9mIG9wdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBvcHRpb24ocHJvcHMpO1xuICB9XG4gIHJldHVybiAoXG4gICAgLyojX19QVVJFX18qL1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgcmVjaGFydHMgcmFkaXVzIGlzIG5vdCBjb21wYXRpYmxlIHdpdGggU1ZHIHJhZGl1c1xuICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVjdGFuZ2xlLCBfZXh0ZW5kcyh7XG4gICAgICBjbGFzc05hbWU6IFwicmVjaGFydHMtc2Fua2V5LW5vZGVcIixcbiAgICAgIGZpbGw6IFwiIzAwODhmZVwiLFxuICAgICAgZmlsbE9wYWNpdHk6IFwiMC44XCJcbiAgICB9LCBzdmdQcm9wZXJ0aWVzTm9FdmVudHMocHJvcHMpKSlcbiAgKTtcbn1cbnZhciBidWlsZE5vZGVQcm9wcyA9IF9yZWY2ID0+IHtcbiAgdmFyIHtcbiAgICBub2RlLFxuICAgIG5vZGVDb250ZW50LFxuICAgIHRvcCxcbiAgICBsZWZ0LFxuICAgIGlcbiAgfSA9IF9yZWY2O1xuICB2YXIge1xuICAgIHgsXG4gICAgeSxcbiAgICBkeCxcbiAgICBkeVxuICB9ID0gbm9kZTtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciBub2RlQ29udGVudCBpcyBwYXNzaW5nIGluIHVua25vd24gcHJvcHNcbiAgdmFyIG5vZGVQcm9wcyA9IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgc3ZnUHJvcGVydGllc05vRXZlbnRzRnJvbVVua25vd24obm9kZUNvbnRlbnQpKSwge30sIHtcbiAgICB4OiB4ICsgbGVmdCxcbiAgICB5OiB5ICsgdG9wLFxuICAgIHdpZHRoOiBkeCxcbiAgICBoZWlnaHQ6IGR5LFxuICAgIGluZGV4OiBpLFxuICAgIHBheWxvYWQ6IG5vZGVcbiAgfSk7XG4gIHJldHVybiBub2RlUHJvcHM7XG59O1xuZnVuY3Rpb24gTm9kZUVsZW1lbnQoX3JlZjcpIHtcbiAgdmFyIHtcbiAgICBwcm9wcyxcbiAgICBub2RlQ29udGVudCxcbiAgICBpLFxuICAgIG9uTW91c2VFbnRlcjogX29uTW91c2VFbnRlcjIsXG4gICAgb25Nb3VzZUxlYXZlOiBfb25Nb3VzZUxlYXZlMixcbiAgICBvbkNsaWNrOiBfb25DbGljazIsXG4gICAgZGF0YUtleVxuICB9ID0gX3JlZjc7XG4gIHZhciBkaXNwYXRjaCA9IHVzZUFwcERpc3BhdGNoKCk7XG4gIHZhciBhY3RpdmVDb29yZGluYXRlID0gZ2V0Tm9kZUNvb3JkaW5hdGVPZlRvb2x0aXAocHJvcHMpO1xuICB2YXIgYWN0aXZlSW5kZXggPSBcIm5vZGUtXCIuY29uY2F0KGkpO1xuICB2YXIgZXZlbnRzID0ge1xuICAgIG9uTW91c2VFbnRlcjogZSA9PiB7XG4gICAgICBkaXNwYXRjaChzZXRBY3RpdmVNb3VzZU92ZXJJdGVtSW5kZXgoe1xuICAgICAgICBhY3RpdmVJbmRleCxcbiAgICAgICAgYWN0aXZlRGF0YUtleTogZGF0YUtleSxcbiAgICAgICAgYWN0aXZlQ29vcmRpbmF0ZVxuICAgICAgfSkpO1xuICAgICAgX29uTW91c2VFbnRlcjIocHJvcHMsIGUpO1xuICAgIH0sXG4gICAgb25Nb3VzZUxlYXZlOiBlID0+IHtcbiAgICAgIGRpc3BhdGNoKG1vdXNlTGVhdmVJdGVtKCkpO1xuICAgICAgX29uTW91c2VMZWF2ZTIocHJvcHMsIGUpO1xuICAgIH0sXG4gICAgb25DbGljazogZSA9PiB7XG4gICAgICBkaXNwYXRjaChzZXRBY3RpdmVDbGlja0l0ZW1JbmRleCh7XG4gICAgICAgIGFjdGl2ZUluZGV4LFxuICAgICAgICBhY3RpdmVEYXRhS2V5OiBkYXRhS2V5LFxuICAgICAgICBhY3RpdmVDb29yZGluYXRlXG4gICAgICB9KSk7XG4gICAgICBfb25DbGljazIocHJvcHMsIGUpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExheWVyLCBldmVudHMsIHJlbmRlck5vZGVJdGVtKG5vZGVDb250ZW50LCBwcm9wcykpO1xufVxuZnVuY3Rpb24gQWxsTm9kZUVsZW1lbnRzKF9yZWY4KSB7XG4gIHZhciB7XG4gICAgbW9kaWZpZWROb2RlcyxcbiAgICBub2RlQ29udGVudCxcbiAgICBvbk1vdXNlRW50ZXIsXG4gICAgb25Nb3VzZUxlYXZlLFxuICAgIG9uQ2xpY2ssXG4gICAgZGF0YUtleVxuICB9ID0gX3JlZjg7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwge1xuICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1zYW5rZXktbm9kZXNcIixcbiAgICBrZXk6IFwicmVjaGFydHMtc2Fua2V5LW5vZGVzXCJcbiAgfSwgbW9kaWZpZWROb2Rlcy5tYXAoKG1vZGlmaWVkTm9kZSwgaSkgPT4ge1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChOb2RlRWxlbWVudCwge1xuICAgICAga2V5OiBcIm5vZGUtXCIuY29uY2F0KG1vZGlmaWVkTm9kZS5pbmRleCwgXCItXCIpLmNvbmNhdChtb2RpZmllZE5vZGUueCwgXCItXCIpLmNvbmNhdChtb2RpZmllZE5vZGUueSksXG4gICAgICBwcm9wczogbW9kaWZpZWROb2RlLFxuICAgICAgbm9kZUNvbnRlbnQ6IG5vZGVDb250ZW50LFxuICAgICAgaTogaSxcbiAgICAgIG9uTW91c2VFbnRlcjogb25Nb3VzZUVudGVyLFxuICAgICAgb25Nb3VzZUxlYXZlOiBvbk1vdXNlTGVhdmUsXG4gICAgICBvbkNsaWNrOiBvbkNsaWNrLFxuICAgICAgZGF0YUtleTogZGF0YUtleVxuICAgIH0pO1xuICB9KSk7XG59XG52YXIgc2Fua2V5RGVmYXVsdFByb3BzID0ge1xuICBuYW1lS2V5OiAnbmFtZScsXG4gIGRhdGFLZXk6ICd2YWx1ZScsXG4gIG5vZGVQYWRkaW5nOiAxMCxcbiAgbm9kZVdpZHRoOiAxMCxcbiAgbGlua0N1cnZhdHVyZTogMC41LFxuICBpdGVyYXRpb25zOiAzMixcbiAgbWFyZ2luOiB7XG4gICAgdG9wOiA1LFxuICAgIHJpZ2h0OiA1LFxuICAgIGJvdHRvbTogNSxcbiAgICBsZWZ0OiA1XG4gIH0sXG4gIHNvcnQ6IHRydWVcbn07XG5mdW5jdGlvbiBTYW5rZXlJbXBsKHByb3BzKSB7XG4gIHZhciB7XG4gICAgICBjbGFzc05hbWUsXG4gICAgICBzdHlsZSxcbiAgICAgIGNoaWxkcmVuXG4gICAgfSA9IHByb3BzLFxuICAgIG90aGVycyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhwcm9wcywgX2V4Y2x1ZGVkMik7XG4gIHZhciB7XG4gICAgbGluayxcbiAgICBkYXRhS2V5LFxuICAgIG5vZGUsXG4gICAgb25Nb3VzZUVudGVyLFxuICAgIG9uTW91c2VMZWF2ZSxcbiAgICBvbkNsaWNrLFxuICAgIGRhdGEsXG4gICAgaXRlcmF0aW9ucyxcbiAgICBub2RlV2lkdGgsXG4gICAgbm9kZVBhZGRpbmcsXG4gICAgc29ydCxcbiAgICBsaW5rQ3VydmF0dXJlLFxuICAgIG1hcmdpblxuICB9ID0gcHJvcHM7XG4gIHZhciBhdHRycyA9IHN2Z1Byb3BlcnRpZXNOb0V2ZW50cyhvdGhlcnMpO1xuICB2YXIgd2lkdGggPSB1c2VDaGFydFdpZHRoKCk7XG4gIHZhciBoZWlnaHQgPSB1c2VDaGFydEhlaWdodCgpO1xuICB2YXIge1xuICAgIGxpbmtzLFxuICAgIG1vZGlmaWVkTGlua3MsXG4gICAgbW9kaWZpZWROb2Rlc1xuICB9ID0gdXNlTWVtbygoKSA9PiB7XG4gICAgdmFyIF9tYXJnaW4kbGVmdCwgX21hcmdpbiRyaWdodCwgX21hcmdpbiR0b3AsIF9tYXJnaW4kYm90dG9tO1xuICAgIGlmICghZGF0YSB8fCAhd2lkdGggfHwgIWhlaWdodCB8fCB3aWR0aCA8PSAwIHx8IGhlaWdodCA8PSAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBub2RlczogW10sXG4gICAgICAgIGxpbmtzOiBbXSxcbiAgICAgICAgbW9kaWZpZWRMaW5rczogW10sXG4gICAgICAgIG1vZGlmaWVkTm9kZXM6IFtdXG4gICAgICB9O1xuICAgIH1cbiAgICB2YXIgY29udGVudFdpZHRoID0gd2lkdGggLSAoKF9tYXJnaW4kbGVmdCA9IG1hcmdpbi5sZWZ0KSAhPT0gbnVsbCAmJiBfbWFyZ2luJGxlZnQgIT09IHZvaWQgMCA/IF9tYXJnaW4kbGVmdCA6IDApIC0gKChfbWFyZ2luJHJpZ2h0ID0gbWFyZ2luLnJpZ2h0KSAhPT0gbnVsbCAmJiBfbWFyZ2luJHJpZ2h0ICE9PSB2b2lkIDAgPyBfbWFyZ2luJHJpZ2h0IDogMCk7XG4gICAgdmFyIGNvbnRlbnRIZWlnaHQgPSBoZWlnaHQgLSAoKF9tYXJnaW4kdG9wID0gbWFyZ2luLnRvcCkgIT09IG51bGwgJiYgX21hcmdpbiR0b3AgIT09IHZvaWQgMCA/IF9tYXJnaW4kdG9wIDogMCkgLSAoKF9tYXJnaW4kYm90dG9tID0gbWFyZ2luLmJvdHRvbSkgIT09IG51bGwgJiYgX21hcmdpbiRib3R0b20gIT09IHZvaWQgMCA/IF9tYXJnaW4kYm90dG9tIDogMCk7XG4gICAgdmFyIGNvbXB1dGVkID0gY29tcHV0ZURhdGEoe1xuICAgICAgZGF0YSxcbiAgICAgIHdpZHRoOiBjb250ZW50V2lkdGgsXG4gICAgICBoZWlnaHQ6IGNvbnRlbnRIZWlnaHQsXG4gICAgICBpdGVyYXRpb25zLFxuICAgICAgbm9kZVdpZHRoLFxuICAgICAgbm9kZVBhZGRpbmcsXG4gICAgICBzb3J0XG4gICAgfSk7XG4gICAgdmFyIHRvcCA9IG1hcmdpbi50b3AgfHwgMDtcbiAgICB2YXIgbGVmdCA9IG1hcmdpbi5sZWZ0IHx8IDA7XG4gICAgdmFyIG5ld01vZGlmaWVkTGlua3MgPSBjb21wdXRlZC5saW5rcy5tYXAoKGwsIGkpID0+IHtcbiAgICAgIHJldHVybiBidWlsZExpbmtQcm9wcyh7XG4gICAgICAgIGxpbms6IGwsXG4gICAgICAgIG5vZGVzOiBjb21wdXRlZC5ub2RlcyxcbiAgICAgICAgaSxcbiAgICAgICAgdG9wLFxuICAgICAgICBsZWZ0LFxuICAgICAgICBsaW5rQ29udGVudDogbGluayxcbiAgICAgICAgbGlua0N1cnZhdHVyZVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdmFyIG5ld01vZGlmaWVkTm9kZXMgPSBjb21wdXRlZC5ub2Rlcy5tYXAoKG4sIGkpID0+IHtcbiAgICAgIHJldHVybiBidWlsZE5vZGVQcm9wcyh7XG4gICAgICAgIG5vZGU6IG4sXG4gICAgICAgIG5vZGVDb250ZW50OiBub2RlLFxuICAgICAgICBpLFxuICAgICAgICB0b3AsXG4gICAgICAgIGxlZnRcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICBub2RlczogY29tcHV0ZWQubm9kZXMsXG4gICAgICBsaW5rczogY29tcHV0ZWQubGlua3MsXG4gICAgICBtb2RpZmllZExpbmtzOiBuZXdNb2RpZmllZExpbmtzLFxuICAgICAgbW9kaWZpZWROb2RlczogbmV3TW9kaWZpZWROb2Rlc1xuICAgIH07XG4gIH0sIFtkYXRhLCB3aWR0aCwgaGVpZ2h0LCBtYXJnaW4sIGl0ZXJhdGlvbnMsIG5vZGVXaWR0aCwgbm9kZVBhZGRpbmcsIHNvcnQsIGxpbmssIG5vZGUsIGxpbmtDdXJ2YXR1cmVdKTtcbiAgdmFyIGhhbmRsZU1vdXNlRW50ZXIgPSB1c2VDYWxsYmFjaygoaXRlbSwgdHlwZSwgZSkgPT4ge1xuICAgIGlmIChvbk1vdXNlRW50ZXIpIHtcbiAgICAgIG9uTW91c2VFbnRlcihpdGVtLCB0eXBlLCBlKTtcbiAgICB9XG4gIH0sIFtvbk1vdXNlRW50ZXJdKTtcbiAgdmFyIGhhbmRsZU1vdXNlTGVhdmUgPSB1c2VDYWxsYmFjaygoaXRlbSwgdHlwZSwgZSkgPT4ge1xuICAgIGlmIChvbk1vdXNlTGVhdmUpIHtcbiAgICAgIG9uTW91c2VMZWF2ZShpdGVtLCB0eXBlLCBlKTtcbiAgICB9XG4gIH0sIFtvbk1vdXNlTGVhdmVdKTtcbiAgdmFyIGhhbmRsZUNsaWNrID0gdXNlQ2FsbGJhY2soKGl0ZW0sIHR5cGUsIGUpID0+IHtcbiAgICBpZiAob25DbGljaykge1xuICAgICAgb25DbGljayhpdGVtLCB0eXBlLCBlKTtcbiAgICB9XG4gIH0sIFtvbkNsaWNrXSk7XG4gIGlmICghaXNQb3NpdGl2ZU51bWJlcih3aWR0aCkgfHwgIWlzUG9zaXRpdmVOdW1iZXIoaGVpZ2h0KSB8fCAhZGF0YSB8fCAhZGF0YS5saW5rcyB8fCAhZGF0YS5ub2Rlcykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5GcmFnbWVudCwgbnVsbCwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2V0Q29tcHV0ZWREYXRhLCB7XG4gICAgY29tcHV0ZWREYXRhOiB7XG4gICAgICBsaW5rczogbW9kaWZpZWRMaW5rcyxcbiAgICAgIG5vZGVzOiBtb2RpZmllZE5vZGVzXG4gICAgfVxuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU3VyZmFjZSwgX2V4dGVuZHMoe30sIGF0dHJzLCB7XG4gICAgd2lkdGg6IHdpZHRoLFxuICAgIGhlaWdodDogaGVpZ2h0XG4gIH0pLCBjaGlsZHJlbiwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQWxsU2Fua2V5TGlua0VsZW1lbnRzLCB7XG4gICAgbGlua3M6IGxpbmtzLFxuICAgIG1vZGlmaWVkTGlua3M6IG1vZGlmaWVkTGlua3MsXG4gICAgbGlua0NvbnRlbnQ6IGxpbmssXG4gICAgZGF0YUtleTogZGF0YUtleSxcbiAgICBvbk1vdXNlRW50ZXI6IChsaW5rUHJvcHMsIGUpID0+IGhhbmRsZU1vdXNlRW50ZXIobGlua1Byb3BzLCAnbGluaycsIGUpLFxuICAgIG9uTW91c2VMZWF2ZTogKGxpbmtQcm9wcywgZSkgPT4gaGFuZGxlTW91c2VMZWF2ZShsaW5rUHJvcHMsICdsaW5rJywgZSksXG4gICAgb25DbGljazogKGxpbmtQcm9wcywgZSkgPT4gaGFuZGxlQ2xpY2sobGlua1Byb3BzLCAnbGluaycsIGUpXG4gIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChBbGxOb2RlRWxlbWVudHMsIHtcbiAgICBtb2RpZmllZE5vZGVzOiBtb2RpZmllZE5vZGVzLFxuICAgIG5vZGVDb250ZW50OiBub2RlLFxuICAgIGRhdGFLZXk6IGRhdGFLZXksXG4gICAgb25Nb3VzZUVudGVyOiAobm9kZVByb3BzLCBlKSA9PiBoYW5kbGVNb3VzZUVudGVyKG5vZGVQcm9wcywgJ25vZGUnLCBlKSxcbiAgICBvbk1vdXNlTGVhdmU6IChub2RlUHJvcHMsIGUpID0+IGhhbmRsZU1vdXNlTGVhdmUobm9kZVByb3BzLCAnbm9kZScsIGUpLFxuICAgIG9uQ2xpY2s6IChub2RlUHJvcHMsIGUpID0+IGhhbmRsZUNsaWNrKG5vZGVQcm9wcywgJ25vZGUnLCBlKVxuICB9KSkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIFNhbmtleShvdXRzaWRlUHJvcHMpIHtcbiAgdmFyIHByb3BzID0gcmVzb2x2ZURlZmF1bHRQcm9wcyhvdXRzaWRlUHJvcHMsIHNhbmtleURlZmF1bHRQcm9wcyk7XG4gIHZhciB7XG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIHN0eWxlLFxuICAgIGNsYXNzTmFtZVxuICB9ID0gcHJvcHM7XG4gIHZhciBbdG9vbHRpcFBvcnRhbCwgc2V0VG9vbHRpcFBvcnRhbF0gPSB1c2VTdGF0ZShudWxsKTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlY2hhcnRzU3RvcmVQcm92aWRlciwge1xuICAgIHByZWxvYWRlZFN0YXRlOiB7XG4gICAgICBvcHRpb25zXG4gICAgfSxcbiAgICByZWR1eFN0b3JlTmFtZTogY2xhc3NOYW1lICE9PSBudWxsICYmIGNsYXNzTmFtZSAhPT0gdm9pZCAwID8gY2xhc3NOYW1lIDogJ1NhbmtleSdcbiAgfSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2V0VG9vbHRpcEVudHJ5U2V0dGluZ3MsIHtcbiAgICBmbjogZ2V0VG9vbHRpcEVudHJ5U2V0dGluZ3MsXG4gICAgYXJnczogcHJvcHNcbiAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlcG9ydENoYXJ0U2l6ZSwge1xuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBoZWlnaHQ6IGhlaWdodFxuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVwb3J0Q2hhcnRNYXJnaW4sIHtcbiAgICBtYXJnaW46IGRlZmF1bHRTYW5rZXlNYXJnaW5cbiAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlY2hhcnRzV3JhcHBlciwge1xuICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lLFxuICAgIHN0eWxlOiBzdHlsZSxcbiAgICB3aWR0aDogd2lkdGgsXG4gICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAvKlxuICAgICAqIFNhbmtleSwgc2FtZSBhcyBUcmVlbWFwLCBzdWZmZXJzIGZyb20gb3ZlcmZpbGxpbmcgdGhlIGNvbnRhaW5lclxuICAgICAqIGFuZCBjYXVzaW5nIGluZmluaXRlIHJlbmRlciBsb29wcyB3aGVyZSB0aGUgY2hhcnQga2VlcHMgZ3Jvd2luZy5cbiAgICAgKi8sXG4gICAgcmVzcG9uc2l2ZTogZmFsc2UsXG4gICAgcmVmOiBub2RlID0+IHtcbiAgICAgIGlmIChub2RlICYmICF0b29sdGlwUG9ydGFsKSB7XG4gICAgICAgIHNldFRvb2x0aXBQb3J0YWwobm9kZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBvbk1vdXNlRW50ZXI6IHVuZGVmaW5lZCxcbiAgICBvbk1vdXNlTGVhdmU6IHVuZGVmaW5lZCxcbiAgICBvbkNsaWNrOiB1bmRlZmluZWQsXG4gICAgb25Nb3VzZU1vdmU6IHVuZGVmaW5lZCxcbiAgICBvbk1vdXNlRG93bjogdW5kZWZpbmVkLFxuICAgIG9uTW91c2VVcDogdW5kZWZpbmVkLFxuICAgIG9uQ29udGV4dE1lbnU6IHVuZGVmaW5lZCxcbiAgICBvbkRvdWJsZUNsaWNrOiB1bmRlZmluZWQsXG4gICAgb25Ub3VjaFN0YXJ0OiB1bmRlZmluZWQsXG4gICAgb25Ub3VjaE1vdmU6IHVuZGVmaW5lZCxcbiAgICBvblRvdWNoRW5kOiB1bmRlZmluZWRcbiAgfSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoVG9vbHRpcFBvcnRhbENvbnRleHQuUHJvdmlkZXIsIHtcbiAgICB2YWx1ZTogdG9vbHRpcFBvcnRhbFxuICB9LCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTYW5rZXlJbXBsLCBwcm9wcykpKSk7XG59XG5TYW5rZXkuZGlzcGxheU5hbWUgPSAnU2Fua2V5JzsiLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBmb3J3YXJkUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgYXJyYXlUb29sdGlwU2VhcmNoZXIgfSBmcm9tICcuLi9zdGF0ZS9vcHRpb25zU2xpY2UnO1xuaW1wb3J0IHsgcmVzb2x2ZURlZmF1bHRQcm9wcyB9IGZyb20gJy4uL3V0aWwvcmVzb2x2ZURlZmF1bHRQcm9wcyc7XG5pbXBvcnQgeyBQb2xhckNoYXJ0IH0gZnJvbSAnLi9Qb2xhckNoYXJ0JztcbnZhciBhbGxvd2VkVG9vbHRpcFR5cGVzID0gWydheGlzJ107XG52YXIgZGVmYXVsdFByb3BzID0ge1xuICBsYXlvdXQ6ICdjZW50cmljJyxcbiAgc3RhcnRBbmdsZTogOTAsXG4gIGVuZEFuZ2xlOiAtMjcwLFxuICBjeDogJzUwJScsXG4gIGN5OiAnNTAlJyxcbiAgaW5uZXJSYWRpdXM6IDAsXG4gIG91dGVyUmFkaXVzOiAnODAlJ1xufTtcbmV4cG9ydCB2YXIgUmFkYXJDaGFydCA9IC8qI19fUFVSRV9fKi9mb3J3YXJkUmVmKChwcm9wcywgcmVmKSA9PiB7XG4gIHZhciBwcm9wc1dpdGhEZWZhdWx0cyA9IHJlc29sdmVEZWZhdWx0UHJvcHMocHJvcHMsIGRlZmF1bHRQcm9wcyk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChQb2xhckNoYXJ0LCB7XG4gICAgY2hhcnROYW1lOiBcIlJhZGFyQ2hhcnRcIixcbiAgICBkZWZhdWx0VG9vbHRpcEV2ZW50VHlwZTogXCJheGlzXCIsXG4gICAgdmFsaWRhdGVUb29sdGlwRXZlbnRUeXBlczogYWxsb3dlZFRvb2x0aXBUeXBlcyxcbiAgICB0b29sdGlwUGF5bG9hZFNlYXJjaGVyOiBhcnJheVRvb2x0aXBTZWFyY2hlcixcbiAgICBjYXRlZ29yaWNhbENoYXJ0UHJvcHM6IHByb3BzV2l0aERlZmF1bHRzLFxuICAgIHJlZjogcmVmXG4gIH0pO1xufSk7IiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgZm9yd2FyZFJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGFycmF5VG9vbHRpcFNlYXJjaGVyIH0gZnJvbSAnLi4vc3RhdGUvb3B0aW9uc1NsaWNlJztcbmltcG9ydCB7IENhcnRlc2lhbkNoYXJ0IH0gZnJvbSAnLi9DYXJ0ZXNpYW5DaGFydCc7XG52YXIgYWxsb3dlZFRvb2x0aXBUeXBlcyA9IFsnaXRlbSddO1xuZXhwb3J0IHZhciBGdW5uZWxDaGFydCA9IC8qI19fUFVSRV9fKi9mb3J3YXJkUmVmKChwcm9wcywgcmVmKSA9PiB7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChDYXJ0ZXNpYW5DaGFydCwge1xuICAgIGNoYXJ0TmFtZTogXCJGdW5uZWxDaGFydFwiLFxuICAgIGRlZmF1bHRUb29sdGlwRXZlbnRUeXBlOiBcIml0ZW1cIixcbiAgICB2YWxpZGF0ZVRvb2x0aXBFdmVudFR5cGVzOiBhbGxvd2VkVG9vbHRpcFR5cGVzLFxuICAgIHRvb2x0aXBQYXlsb2FkU2VhcmNoZXI6IGFycmF5VG9vbHRpcFNlYXJjaGVyLFxuICAgIGNhdGVnb3JpY2FsQ2hhcnRQcm9wczogcHJvcHMsXG4gICAgcmVmOiByZWZcbiAgfSk7XG59KTsiLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBmb3J3YXJkUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgYXJyYXlUb29sdGlwU2VhcmNoZXIgfSBmcm9tICcuLi9zdGF0ZS9vcHRpb25zU2xpY2UnO1xuaW1wb3J0IHsgQ2FydGVzaWFuQ2hhcnQgfSBmcm9tICcuL0NhcnRlc2lhbkNoYXJ0JztcbnZhciBhbGxvd2VkVG9vbHRpcFR5cGVzID0gWydheGlzJywgJ2l0ZW0nXTtcbmV4cG9ydCB2YXIgQmFyQ2hhcnQgPSAvKiNfX1BVUkVfXyovZm9yd2FyZFJlZigocHJvcHMsIHJlZikgPT4ge1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQ2FydGVzaWFuQ2hhcnQsIHtcbiAgICBjaGFydE5hbWU6IFwiQmFyQ2hhcnRcIixcbiAgICBkZWZhdWx0VG9vbHRpcEV2ZW50VHlwZTogXCJheGlzXCIsXG4gICAgdmFsaWRhdGVUb29sdGlwRXZlbnRUeXBlczogYWxsb3dlZFRvb2x0aXBUeXBlcyxcbiAgICB0b29sdGlwUGF5bG9hZFNlYXJjaGVyOiBhcnJheVRvb2x0aXBTZWFyY2hlcixcbiAgICBjYXRlZ29yaWNhbENoYXJ0UHJvcHM6IHByb3BzLFxuICAgIHJlZjogcmVmXG4gIH0pO1xufSk7IiwidmFyIF9leGNsdWRlZCA9IFtcImxheW91dFwiXTtcbmZ1bmN0aW9uIF9leHRlbmRzKCkgeyByZXR1cm4gX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduID8gT2JqZWN0LmFzc2lnbi5iaW5kKCkgOiBmdW5jdGlvbiAobikgeyBmb3IgKHZhciBlID0gMTsgZSA8IGFyZ3VtZW50cy5sZW5ndGg7IGUrKykgeyB2YXIgdCA9IGFyZ3VtZW50c1tlXTsgZm9yICh2YXIgciBpbiB0KSAoe30pLmhhc093blByb3BlcnR5LmNhbGwodCwgcikgJiYgKG5bcl0gPSB0W3JdKTsgfSByZXR1cm4gbjsgfSwgX2V4dGVuZHMuYXBwbHkobnVsbCwgYXJndW1lbnRzKTsgfVxuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKGUsIHQpIHsgaWYgKG51bGwgPT0gZSkgcmV0dXJuIHt9OyB2YXIgbywgciwgaSA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKGUsIHQpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IGZvciAociA9IDA7IHIgPCBuLmxlbmd0aDsgcisrKSBvID0gbltyXSwgLTEgPT09IHQuaW5kZXhPZihvKSAmJiB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKGUsIG8pICYmIChpW29dID0gZVtvXSk7IH0gcmV0dXJuIGk7IH1cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKHIsIGUpIHsgaWYgKG51bGwgPT0gcikgcmV0dXJuIHt9OyB2YXIgdCA9IHt9OyBmb3IgKHZhciBuIGluIHIpIGlmICh7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHIsIG4pKSB7IGlmICgtMSAhPT0gZS5pbmRleE9mKG4pKSBjb250aW51ZTsgdFtuXSA9IHJbbl07IH0gcmV0dXJuIHQ7IH1cbmltcG9ydCB7IGZvcndhcmRSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBSZWNoYXJ0c1N0b3JlUHJvdmlkZXIgfSBmcm9tICcuLi9zdGF0ZS9SZWNoYXJ0c1N0b3JlUHJvdmlkZXInO1xuaW1wb3J0IHsgQ2hhcnREYXRhQ29udGV4dFByb3ZpZGVyIH0gZnJvbSAnLi4vY29udGV4dC9jaGFydERhdGFDb250ZXh0JztcbmltcG9ydCB7IFJlcG9ydE1haW5DaGFydFByb3BzIH0gZnJvbSAnLi4vc3RhdGUvUmVwb3J0TWFpbkNoYXJ0UHJvcHMnO1xuaW1wb3J0IHsgUmVwb3J0Q2hhcnRQcm9wcyB9IGZyb20gJy4uL3N0YXRlL1JlcG9ydENoYXJ0UHJvcHMnO1xuaW1wb3J0IHsgUmVwb3J0UG9sYXJPcHRpb25zIH0gZnJvbSAnLi4vc3RhdGUvUmVwb3J0UG9sYXJPcHRpb25zJztcbmltcG9ydCB7IENhdGVnb3JpY2FsQ2hhcnQgfSBmcm9tICcuL0NhdGVnb3JpY2FsQ2hhcnQnO1xuaW1wb3J0IHsgcmVzb2x2ZURlZmF1bHRQcm9wcyB9IGZyb20gJy4uL3V0aWwvcmVzb2x2ZURlZmF1bHRQcm9wcyc7XG52YXIgZGVmYXVsdE1hcmdpbiA9IHtcbiAgdG9wOiA1LFxuICByaWdodDogNSxcbiAgYm90dG9tOiA1LFxuICBsZWZ0OiA1XG59O1xuXG4vKipcbiAqIFRoZXNlIGRlZmF1bHQgcHJvcHMgYXJlIHRoZSBzYW1lIGZvciBhbGwgUG9sYXJDaGFydCBjb21wb25lbnRzLlxuICovXG52YXIgZGVmYXVsdFByb3BzID0ge1xuICBhY2Nlc3NpYmlsaXR5TGF5ZXI6IHRydWUsXG4gIHN0YWNrT2Zmc2V0OiAnbm9uZScsXG4gIGJhckNhdGVnb3J5R2FwOiAnMTAlJyxcbiAgYmFyR2FwOiA0LFxuICBtYXJnaW46IGRlZmF1bHRNYXJnaW4sXG4gIHJldmVyc2VTdGFja09yZGVyOiBmYWxzZSxcbiAgc3luY01ldGhvZDogJ2luZGV4JyxcbiAgbGF5b3V0OiAncmFkaWFsJyxcbiAgcmVzcG9uc2l2ZTogZmFsc2Vcbn07XG5cbi8qKlxuICogVGhlc2UgcHJvcHMgYXJlIHJlcXVpcmVkIGZvciB0aGUgUG9sYXJDaGFydCB0byBmdW5jdGlvbiBjb3JyZWN0bHkuXG4gKiBVc2VycyB1c3VhbGx5IHdvdWxkIG5vdCBuZWVkIHRvIHNwZWNpZnkgdGhlc2UgZXhwbGljaXRseSxcbiAqIGJlY2F1c2UgdGhlIGNvbnZlbmllbmNlIGNvbXBvbmVudHMgbGlrZSBQaWVDaGFydCwgUmFkYXJDaGFydCwgZXRjLlxuICogd2lsbCBwcm92aWRlIHRoZXNlIGRlZmF1bHRzLlxuICogV2UgY2FuJ3QgaGF2ZSB0aGUgZGVmYXVsdHMgaW4gdGhpcyBmaWxlIGJlY2F1c2UgZWFjaCBvZiB0aG9zZSBjb252ZW5pZW5jZSBjb21wb25lbnRzXG4gKiBoYXZlIHRoZWlyIG93biBvcGluaW9ucyBhYm91dCB3aGF0IHRoZXkgc2hvdWxkIGJlLlxuICovXG5cbi8qKlxuICogVGhlc2UgYXJlIG9uZS10aW1lLCBpbW11dGFibGUgb3B0aW9ucyB0aGF0IGRlY2lkZSB0aGUgY2hhcnQncyBiZWhhdmlvci5cbiAqIFVzZXJzIHdobyB3aXNoIHRvIGNhbGwgQ2FydGVzaWFuQ2hhcnQgbWF5IGRlY2lkZSB0byBwYXNzIHRoZXNlIG9wdGlvbnMgZXhwbGljaXRseSxcbiAqIGJ1dCB1c3VhbGx5IHdlIHdvdWxkIGV4cGVjdCB0aGF0IHRoZXkgdXNlIG9uZSBvZiB0aGUgY29udmVuaWVuY2UgY29tcG9uZW50cyBsaWtlIFBpZUNoYXJ0LCBSYWRhckNoYXJ0LCBldGMuXG4gKi9cblxuZXhwb3J0IHZhciBQb2xhckNoYXJ0ID0gLyojX19QVVJFX18qL2ZvcndhcmRSZWYoZnVuY3Rpb24gUG9sYXJDaGFydChwcm9wcywgcmVmKSB7XG4gIHZhciBfcG9sYXJDaGFydFByb3BzJGlkO1xuICB2YXIgcG9sYXJDaGFydFByb3BzID0gcmVzb2x2ZURlZmF1bHRQcm9wcyhwcm9wcy5jYXRlZ29yaWNhbENoYXJ0UHJvcHMsIGRlZmF1bHRQcm9wcyk7XG4gIHZhciB7XG4gICAgICBsYXlvdXRcbiAgICB9ID0gcG9sYXJDaGFydFByb3BzLFxuICAgIG90aGVyQ2F0ZWdvcmljYWxQcm9wcyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhwb2xhckNoYXJ0UHJvcHMsIF9leGNsdWRlZCk7XG4gIHZhciB7XG4gICAgY2hhcnROYW1lLFxuICAgIGRlZmF1bHRUb29sdGlwRXZlbnRUeXBlLFxuICAgIHZhbGlkYXRlVG9vbHRpcEV2ZW50VHlwZXMsXG4gICAgdG9vbHRpcFBheWxvYWRTZWFyY2hlclxuICB9ID0gcHJvcHM7XG4gIHZhciBvcHRpb25zID0ge1xuICAgIGNoYXJ0TmFtZSxcbiAgICBkZWZhdWx0VG9vbHRpcEV2ZW50VHlwZSxcbiAgICB2YWxpZGF0ZVRvb2x0aXBFdmVudFR5cGVzLFxuICAgIHRvb2x0aXBQYXlsb2FkU2VhcmNoZXIsXG4gICAgZXZlbnRFbWl0dGVyOiB1bmRlZmluZWRcbiAgfTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlY2hhcnRzU3RvcmVQcm92aWRlciwge1xuICAgIHByZWxvYWRlZFN0YXRlOiB7XG4gICAgICBvcHRpb25zXG4gICAgfSxcbiAgICByZWR1eFN0b3JlTmFtZTogKF9wb2xhckNoYXJ0UHJvcHMkaWQgPSBwb2xhckNoYXJ0UHJvcHMuaWQpICE9PSBudWxsICYmIF9wb2xhckNoYXJ0UHJvcHMkaWQgIT09IHZvaWQgMCA/IF9wb2xhckNoYXJ0UHJvcHMkaWQgOiBjaGFydE5hbWVcbiAgfSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQ2hhcnREYXRhQ29udGV4dFByb3ZpZGVyLCB7XG4gICAgY2hhcnREYXRhOiBwb2xhckNoYXJ0UHJvcHMuZGF0YVxuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVwb3J0TWFpbkNoYXJ0UHJvcHMsIHtcbiAgICBsYXlvdXQ6IGxheW91dCxcbiAgICBtYXJnaW46IHBvbGFyQ2hhcnRQcm9wcy5tYXJnaW5cbiAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlcG9ydENoYXJ0UHJvcHMsIHtcbiAgICBhY2Nlc3NpYmlsaXR5TGF5ZXI6IHBvbGFyQ2hhcnRQcm9wcy5hY2Nlc3NpYmlsaXR5TGF5ZXIsXG4gICAgYmFyQ2F0ZWdvcnlHYXA6IHBvbGFyQ2hhcnRQcm9wcy5iYXJDYXRlZ29yeUdhcCxcbiAgICBtYXhCYXJTaXplOiBwb2xhckNoYXJ0UHJvcHMubWF4QmFyU2l6ZSxcbiAgICBzdGFja09mZnNldDogcG9sYXJDaGFydFByb3BzLnN0YWNrT2Zmc2V0LFxuICAgIGJhckdhcDogcG9sYXJDaGFydFByb3BzLmJhckdhcCxcbiAgICBiYXJTaXplOiBwb2xhckNoYXJ0UHJvcHMuYmFyU2l6ZSxcbiAgICBzeW5jSWQ6IHBvbGFyQ2hhcnRQcm9wcy5zeW5jSWQsXG4gICAgc3luY01ldGhvZDogcG9sYXJDaGFydFByb3BzLnN5bmNNZXRob2QsXG4gICAgY2xhc3NOYW1lOiBwb2xhckNoYXJ0UHJvcHMuY2xhc3NOYW1lXG4gIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZXBvcnRQb2xhck9wdGlvbnMsIHtcbiAgICBjeDogcG9sYXJDaGFydFByb3BzLmN4LFxuICAgIGN5OiBwb2xhckNoYXJ0UHJvcHMuY3ksXG4gICAgc3RhcnRBbmdsZTogcG9sYXJDaGFydFByb3BzLnN0YXJ0QW5nbGUsXG4gICAgZW5kQW5nbGU6IHBvbGFyQ2hhcnRQcm9wcy5lbmRBbmdsZSxcbiAgICBpbm5lclJhZGl1czogcG9sYXJDaGFydFByb3BzLmlubmVyUmFkaXVzLFxuICAgIG91dGVyUmFkaXVzOiBwb2xhckNoYXJ0UHJvcHMub3V0ZXJSYWRpdXNcbiAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KENhdGVnb3JpY2FsQ2hhcnQsIF9leHRlbmRzKHt9LCBvdGhlckNhdGVnb3JpY2FsUHJvcHMsIHtcbiAgICByZWY6IHJlZlxuICB9KSkpO1xufSk7IiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgZm9yd2FyZFJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGFycmF5VG9vbHRpcFNlYXJjaGVyIH0gZnJvbSAnLi4vc3RhdGUvb3B0aW9uc1NsaWNlJztcbmltcG9ydCB7IENhcnRlc2lhbkNoYXJ0IH0gZnJvbSAnLi9DYXJ0ZXNpYW5DaGFydCc7XG52YXIgYWxsb3dlZFRvb2x0aXBUeXBlcyA9IFsnYXhpcyddO1xuZXhwb3J0IHZhciBDb21wb3NlZENoYXJ0ID0gLyojX19QVVJFX18qL2ZvcndhcmRSZWYoKHByb3BzLCByZWYpID0+IHtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KENhcnRlc2lhbkNoYXJ0LCB7XG4gICAgY2hhcnROYW1lOiBcIkNvbXBvc2VkQ2hhcnRcIixcbiAgICBkZWZhdWx0VG9vbHRpcEV2ZW50VHlwZTogXCJheGlzXCIsXG4gICAgdmFsaWRhdGVUb29sdGlwRXZlbnRUeXBlczogYWxsb3dlZFRvb2x0aXBUeXBlcyxcbiAgICB0b29sdGlwUGF5bG9hZFNlYXJjaGVyOiBhcnJheVRvb2x0aXBTZWFyY2hlcixcbiAgICBjYXRlZ29yaWNhbENoYXJ0UHJvcHM6IHByb3BzLFxuICAgIHJlZjogcmVmXG4gIH0pO1xufSk7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9