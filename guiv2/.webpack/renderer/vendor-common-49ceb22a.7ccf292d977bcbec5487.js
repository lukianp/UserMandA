"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[8248],{

/***/ 3509:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* unused harmony export Brush */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34164);
/* harmony import */ var victory_vendor_d3_scale__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(39625);
/* harmony import */ var es_toolkit_compat_range__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(43412);
/* harmony import */ var es_toolkit_compat_range__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(es_toolkit_compat_range__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _container_Layer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(86069);
/* harmony import */ var _component_Text__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(20261);
/* harmony import */ var _util_ChartUtils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(33964);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(59744);
/* harmony import */ var _util_CssPrefixUtils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(50357);
/* harmony import */ var _context_chartDataContext__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(67965);
/* harmony import */ var _context_brushUpdateContext__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(31230);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(49082);
/* harmony import */ var _state_chartDataSlice__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(46446);
/* harmony import */ var _state_brushSlice__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(2658);
/* harmony import */ var _context_PanoramaContext__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(12070);
/* harmony import */ var _state_selectors_brushSelectors__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(76461);
/* harmony import */ var _synchronisation_useChartSynchronisation__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(63042);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(77404);
/* harmony import */ var _util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(55448);
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }





















// Why is this tickFormatter different from the other TickFormatters? This one allows to return numbers too for some reason.

function DefaultTraveller(props) {
  var {
    x,
    y,
    width,
    height,
    stroke
  } = props;
  var lineY = Math.floor(y + height / 2) - 1;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("rect", {
    x: x,
    y: y,
    width: width,
    height: height,
    fill: stroke,
    stroke: "none"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("line", {
    x1: x + 1,
    y1: lineY,
    x2: x + width - 1,
    y2: lineY,
    fill: "none",
    stroke: "#fff"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("line", {
    x1: x + 1,
    y1: lineY + 2,
    x2: x + width - 1,
    y2: lineY + 2,
    fill: "none",
    stroke: "#fff"
  }));
}
function Traveller(props) {
  var {
    travellerProps,
    travellerType
  } = props;
  if (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(travellerType)) {
    // @ts-expect-error element cloning disagrees with the types (and it should)
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(travellerType, travellerProps);
  }
  if (typeof travellerType === 'function') {
    return travellerType(travellerProps);
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(DefaultTraveller, travellerProps);
}
function TravellerLayer(_ref) {
  var _data$startIndex, _data$endIndex;
  var {
    otherProps,
    travellerX,
    id,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onTouchStart,
    onTravellerMoveKeyboard,
    onFocus,
    onBlur
  } = _ref;
  var {
    y,
    x: xFromProps,
    travellerWidth,
    height,
    traveller,
    ariaLabel,
    data,
    startIndex,
    endIndex
  } = otherProps;
  var x = Math.max(travellerX, xFromProps);
  var travellerProps = _objectSpread(_objectSpread({}, (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_18__/* .svgPropertiesNoEvents */ .uZ)(otherProps)), {}, {
    x,
    y,
    width: travellerWidth,
    height
  });
  var ariaLabelBrush = ariaLabel || "Min value: ".concat((_data$startIndex = data[startIndex]) === null || _data$startIndex === void 0 ? void 0 : _data$startIndex.name, ", Max value: ").concat((_data$endIndex = data[endIndex]) === null || _data$endIndex === void 0 ? void 0 : _data$endIndex.name);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_4__/* .Layer */ .W, {
    tabIndex: 0,
    role: "slider",
    "aria-label": ariaLabelBrush,
    "aria-valuenow": travellerX,
    className: "recharts-brush-traveller",
    onMouseEnter: onMouseEnter,
    onMouseLeave: onMouseLeave,
    onMouseDown: onMouseDown,
    onTouchStart: onTouchStart,
    onKeyDown: e => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      onTravellerMoveKeyboard(e.key === 'ArrowRight' ? 1 : -1, id);
    },
    onFocus: onFocus,
    onBlur: onBlur,
    style: {
      cursor: 'col-resize'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(Traveller, {
    travellerType: traveller,
    travellerProps: travellerProps
  }));
}
/*
 * This one cannot be a React Component because React is not happy with it returning only string | number.
 * React wants a full React.JSX.Element but that is not compatible with Text component.
 */
function getTextOfTick(props) {
  var {
    index,
    data,
    tickFormatter,
    dataKey
  } = props;
  // @ts-expect-error getValueByDataKey does not validate the output type
  var text = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_6__/* .getValueByDataKey */ .kr)(data[index], dataKey, index);
  return typeof tickFormatter === 'function' ? tickFormatter(text, index) : text;
}
function getIndexInRange(valueRange, x) {
  var len = valueRange.length;
  var start = 0;
  var end = len - 1;
  while (end - start > 1) {
    var middle = Math.floor((start + end) / 2);
    if (valueRange[middle] > x) {
      end = middle;
    } else {
      start = middle;
    }
  }
  return x >= valueRange[end] ? end : start;
}
function getIndex(_ref2) {
  var {
    startX,
    endX,
    scaleValues,
    gap,
    data
  } = _ref2;
  var lastIndex = data.length - 1;
  var min = Math.min(startX, endX);
  var max = Math.max(startX, endX);
  var minIndex = getIndexInRange(scaleValues, min);
  var maxIndex = getIndexInRange(scaleValues, max);
  return {
    startIndex: minIndex - minIndex % gap,
    endIndex: maxIndex === lastIndex ? lastIndex : maxIndex - maxIndex % gap
  };
}
function Background(_ref3) {
  var {
    x,
    y,
    width,
    height,
    fill,
    stroke
  } = _ref3;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("rect", {
    stroke: stroke,
    fill: fill,
    x: x,
    y: y,
    width: width,
    height: height
  });
}
function BrushText(_ref4) {
  var {
    startIndex,
    endIndex,
    y,
    height,
    travellerWidth,
    stroke,
    tickFormatter,
    dataKey,
    data,
    startX,
    endX
  } = _ref4;
  var offset = 5;
  var attrs = {
    pointerEvents: 'none',
    fill: stroke
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_4__/* .Layer */ .W, {
    className: "recharts-brush-texts"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_Text__WEBPACK_IMPORTED_MODULE_5__/* .Text */ .E, _extends({
    textAnchor: "end",
    verticalAnchor: "middle",
    x: Math.min(startX, endX) - offset,
    y: y + height / 2
  }, attrs), getTextOfTick({
    index: startIndex,
    tickFormatter,
    dataKey,
    data
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_Text__WEBPACK_IMPORTED_MODULE_5__/* .Text */ .E, _extends({
    textAnchor: "start",
    verticalAnchor: "middle",
    x: Math.max(startX, endX) + travellerWidth + offset,
    y: y + height / 2
  }, attrs), getTextOfTick({
    index: endIndex,
    tickFormatter,
    dataKey,
    data
  })));
}
function Slide(_ref5) {
  var {
    y,
    height,
    stroke,
    travellerWidth,
    startX,
    endX,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onTouchStart
  } = _ref5;
  var x = Math.min(startX, endX) + travellerWidth;
  var width = Math.max(Math.abs(endX - startX) - travellerWidth, 0);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("rect", {
    className: "recharts-brush-slide",
    onMouseEnter: onMouseEnter,
    onMouseLeave: onMouseLeave,
    onMouseDown: onMouseDown,
    onTouchStart: onTouchStart,
    style: {
      cursor: 'move'
    },
    stroke: "none",
    fill: stroke,
    fillOpacity: 0.2,
    x: x,
    y: y,
    width: width,
    height: height
  });
}
function Panorama(_ref6) {
  var {
    x,
    y,
    width,
    height,
    data,
    children,
    padding
  } = _ref6;
  var isPanoramic = react__WEBPACK_IMPORTED_MODULE_0__.Children.count(children) === 1;
  if (!isPanoramic) {
    return null;
  }
  var chartElement = react__WEBPACK_IMPORTED_MODULE_0__.Children.only(children);
  if (!chartElement) {
    return null;
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(chartElement, {
    x,
    y,
    width,
    height,
    margin: padding,
    compact: true,
    data
  });
}
var createScale = _ref7 => {
  var {
    data,
    startIndex,
    endIndex,
    x,
    width,
    travellerWidth
  } = _ref7;
  if (!data || !data.length) {
    return {};
  }
  var len = data.length;
  var scale = (0,victory_vendor_d3_scale__WEBPACK_IMPORTED_MODULE_2__.scalePoint)().domain(es_toolkit_compat_range__WEBPACK_IMPORTED_MODULE_3___default()(0, len)).range([x, x + width - travellerWidth]);
  var scaleValues = scale.domain().map(entry => scale(entry));
  return {
    isTextActive: false,
    isSlideMoving: false,
    isTravellerMoving: false,
    isTravellerFocused: false,
    startX: scale(startIndex),
    endX: scale(endIndex),
    scale,
    scaleValues
  };
};
var isTouch = e => e.changedTouches && !!e.changedTouches.length;
class BrushWithState extends react__WEBPACK_IMPORTED_MODULE_0__.PureComponent {
  constructor(props) {
    super(props);
    _defineProperty(this, "handleDrag", e => {
      if (this.leaveTimer) {
        clearTimeout(this.leaveTimer);
        this.leaveTimer = null;
      }
      if (this.state.isTravellerMoving) {
        this.handleTravellerMove(e);
      } else if (this.state.isSlideMoving) {
        this.handleSlideDrag(e);
      }
    });
    _defineProperty(this, "handleTouchMove", e => {
      if (e.changedTouches != null && e.changedTouches.length > 0) {
        this.handleDrag(e.changedTouches[0]);
      }
    });
    _defineProperty(this, "handleDragEnd", () => {
      this.setState({
        isTravellerMoving: false,
        isSlideMoving: false
      }, () => {
        var {
          endIndex,
          onDragEnd,
          startIndex
        } = this.props;
        onDragEnd === null || onDragEnd === void 0 || onDragEnd({
          endIndex,
          startIndex
        });
      });
      this.detachDragEndListener();
    });
    _defineProperty(this, "handleLeaveWrapper", () => {
      if (this.state.isTravellerMoving || this.state.isSlideMoving) {
        this.leaveTimer = window.setTimeout(this.handleDragEnd, this.props.leaveTimeOut);
      }
    });
    _defineProperty(this, "handleEnterSlideOrTraveller", () => {
      this.setState({
        isTextActive: true
      });
    });
    _defineProperty(this, "handleLeaveSlideOrTraveller", () => {
      this.setState({
        isTextActive: false
      });
    });
    _defineProperty(this, "handleSlideDragStart", e => {
      var event = isTouch(e) ? e.changedTouches[0] : e;
      this.setState({
        isTravellerMoving: false,
        isSlideMoving: true,
        slideMoveStartX: event.pageX
      });
      this.attachDragEndListener();
    });
    _defineProperty(this, "handleTravellerMoveKeyboard", (direction, id) => {
      var {
        data,
        gap,
        startIndex,
        endIndex
      } = this.props;
      // scaleValues are a list of coordinates. For example: [65, 250, 435, 620, 805, 990].
      var {
        scaleValues,
        startX,
        endX
      } = this.state;
      if (scaleValues == null) {
        return;
      }

      // unless we search for the closest scaleValue to the current coordinate
      // we need to move travelers via index when using the keyboard
      var currentIndex = -1;
      if (id === 'startX') {
        currentIndex = startIndex;
      } else if (id === 'endX') {
        currentIndex = endIndex;
      }
      if (currentIndex < 0 || currentIndex >= data.length) {
        return;
      }
      var newIndex = currentIndex + direction;
      if (newIndex === -1 || newIndex >= scaleValues.length) {
        return;
      }
      var newScaleValue = scaleValues[newIndex];

      // Prevent travellers from being on top of each other or overlapping
      if (id === 'startX' && newScaleValue >= endX || id === 'endX' && newScaleValue <= startX) {
        return;
      }
      this.setState(
      // @ts-expect-error not sure why typescript is not happy with this, partial update is fine in React
      {
        [id]: newScaleValue
      }, () => {
        this.props.onChange(getIndex({
          startX: this.state.startX,
          endX: this.state.endX,
          data,
          gap,
          scaleValues
        }));
      });
    });
    this.travellerDragStartHandlers = {
      startX: this.handleTravellerDragStart.bind(this, 'startX'),
      endX: this.handleTravellerDragStart.bind(this, 'endX')
    };
    this.state = {
      brushMoveStartX: 0,
      movingTravellerId: undefined,
      endX: 0,
      startX: 0,
      slideMoveStartX: 0
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    var {
      data,
      width,
      x,
      travellerWidth,
      startIndex,
      endIndex,
      startIndexControlledFromProps,
      endIndexControlledFromProps
    } = nextProps;
    if (data !== prevState.prevData) {
      return _objectSpread({
        prevData: data,
        prevTravellerWidth: travellerWidth,
        prevX: x,
        prevWidth: width
      }, data && data.length ? createScale({
        data,
        width,
        x,
        travellerWidth,
        startIndex,
        endIndex
      }) : {
        scale: undefined,
        scaleValues: undefined
      });
    }
    var prevScale = prevState.scale;
    if (prevScale && (width !== prevState.prevWidth || x !== prevState.prevX || travellerWidth !== prevState.prevTravellerWidth)) {
      prevScale.range([x, x + width - travellerWidth]);
      var scaleValues = prevScale.domain().map(entry => prevScale(entry)).filter(value => value != null);
      return {
        prevData: data,
        prevTravellerWidth: travellerWidth,
        prevX: x,
        prevWidth: width,
        startX: prevScale(nextProps.startIndex),
        endX: prevScale(nextProps.endIndex),
        scaleValues
      };
    }
    if (prevState.scale && !prevState.isSlideMoving && !prevState.isTravellerMoving && !prevState.isTravellerFocused && !prevState.isTextActive) {
      /*
       * If the startIndex or endIndex are controlled from the outside,
       * we need to keep the startX and end up to date.
       * Also we do not want to do that while user is interacting in the brush,
       * because this will trigger re-render and interrupt the drag&drop.
       */
      if (startIndexControlledFromProps != null && prevState.prevStartIndexControlledFromProps !== startIndexControlledFromProps) {
        return {
          startX: prevState.scale(startIndexControlledFromProps),
          prevStartIndexControlledFromProps: startIndexControlledFromProps
        };
      }
      if (endIndexControlledFromProps != null && prevState.prevEndIndexControlledFromProps !== endIndexControlledFromProps) {
        return {
          endX: prevState.scale(endIndexControlledFromProps),
          prevEndIndexControlledFromProps: endIndexControlledFromProps
        };
      }
    }
    return null;
  }
  componentWillUnmount() {
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }
    this.detachDragEndListener();
  }
  attachDragEndListener() {
    window.addEventListener('mouseup', this.handleDragEnd, true);
    window.addEventListener('touchend', this.handleDragEnd, true);
    window.addEventListener('mousemove', this.handleDrag, true);
  }
  detachDragEndListener() {
    window.removeEventListener('mouseup', this.handleDragEnd, true);
    window.removeEventListener('touchend', this.handleDragEnd, true);
    window.removeEventListener('mousemove', this.handleDrag, true);
  }
  handleSlideDrag(e) {
    var {
      slideMoveStartX,
      startX,
      endX,
      scaleValues
    } = this.state;
    if (scaleValues == null) {
      return;
    }
    var {
      x,
      width,
      travellerWidth,
      startIndex,
      endIndex,
      onChange,
      data,
      gap
    } = this.props;
    var delta = e.pageX - slideMoveStartX;
    if (delta > 0) {
      delta = Math.min(delta, x + width - travellerWidth - endX, x + width - travellerWidth - startX);
    } else if (delta < 0) {
      delta = Math.max(delta, x - startX, x - endX);
    }
    var newIndex = getIndex({
      startX: startX + delta,
      endX: endX + delta,
      data,
      gap,
      scaleValues
    });
    if ((newIndex.startIndex !== startIndex || newIndex.endIndex !== endIndex) && onChange) {
      onChange(newIndex);
    }
    this.setState({
      startX: startX + delta,
      endX: endX + delta,
      slideMoveStartX: e.pageX
    });
  }
  handleTravellerDragStart(id, e) {
    var event = isTouch(e) ? e.changedTouches[0] : e;
    this.setState({
      isSlideMoving: false,
      isTravellerMoving: true,
      movingTravellerId: id,
      brushMoveStartX: event.pageX
    });
    this.attachDragEndListener();
  }
  handleTravellerMove(e) {
    var {
      brushMoveStartX,
      movingTravellerId,
      endX,
      startX,
      scaleValues
    } = this.state;
    if (movingTravellerId == null) {
      return;
    }
    var prevValue = this.state[movingTravellerId];
    var {
      x,
      width,
      travellerWidth,
      onChange,
      gap,
      data
    } = this.props;
    var params = {
      startX: this.state.startX,
      endX: this.state.endX,
      data,
      gap,
      scaleValues
    };
    var delta = e.pageX - brushMoveStartX;
    if (delta > 0) {
      delta = Math.min(delta, x + width - travellerWidth - prevValue);
    } else if (delta < 0) {
      delta = Math.max(delta, x - prevValue);
    }
    params[movingTravellerId] = prevValue + delta;
    var newIndex = getIndex(params);
    var {
      startIndex,
      endIndex
    } = newIndex;
    var isFullGap = () => {
      var lastIndex = data.length - 1;
      if (movingTravellerId === 'startX' && (endX > startX ? startIndex % gap === 0 : endIndex % gap === 0) || endX < startX && endIndex === lastIndex || movingTravellerId === 'endX' && (endX > startX ? endIndex % gap === 0 : startIndex % gap === 0) || endX > startX && endIndex === lastIndex) {
        return true;
      }
      return false;
    };
    this.setState(
    // @ts-expect-error not sure why typescript is not happy with this, partial update is fine in React
    {
      [movingTravellerId]: prevValue + delta,
      brushMoveStartX: e.pageX
    }, () => {
      if (onChange) {
        if (isFullGap()) {
          onChange(newIndex);
        }
      }
    });
  }
  render() {
    var {
      data,
      className,
      children,
      x,
      y,
      dy,
      width,
      height,
      alwaysShowText,
      fill,
      stroke,
      startIndex,
      endIndex,
      travellerWidth,
      tickFormatter,
      dataKey,
      padding
    } = this.props;
    var {
      startX,
      endX,
      isTextActive,
      isSlideMoving,
      isTravellerMoving,
      isTravellerFocused
    } = this.state;
    if (!data || !data.length || !(0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_7__/* .isNumber */ .Et)(x) || !(0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_7__/* .isNumber */ .Et)(y) || !(0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_7__/* .isNumber */ .Et)(width) || !(0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_7__/* .isNumber */ .Et)(height) || width <= 0 || height <= 0) {
      return null;
    }
    var layerClass = (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)('recharts-brush', className);
    var style = (0,_util_CssPrefixUtils__WEBPACK_IMPORTED_MODULE_8__/* .generatePrefixStyle */ .t)('userSelect', 'none');
    var calculatedY = y + (dy !== null && dy !== void 0 ? dy : 0);
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_4__/* .Layer */ .W, {
      className: layerClass,
      onMouseLeave: this.handleLeaveWrapper,
      onTouchMove: this.handleTouchMove,
      style: style
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(Background, {
      x: x,
      y: calculatedY,
      width: width,
      height: height,
      fill: fill,
      stroke: stroke
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_14__/* .PanoramaContextProvider */ .U, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(Panorama, {
      x: x,
      y: calculatedY,
      width: width,
      height: height,
      data: data,
      padding: padding
    }, children)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(Slide, {
      y: calculatedY,
      height: height,
      stroke: stroke,
      travellerWidth: travellerWidth,
      startX: startX,
      endX: endX,
      onMouseEnter: this.handleEnterSlideOrTraveller,
      onMouseLeave: this.handleLeaveSlideOrTraveller,
      onMouseDown: this.handleSlideDragStart,
      onTouchStart: this.handleSlideDragStart
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(TravellerLayer, {
      travellerX: startX,
      id: "startX",
      otherProps: _objectSpread(_objectSpread({}, this.props), {}, {
        y: calculatedY
      }),
      onMouseEnter: this.handleEnterSlideOrTraveller,
      onMouseLeave: this.handleLeaveSlideOrTraveller,
      onMouseDown: this.travellerDragStartHandlers.startX,
      onTouchStart: this.travellerDragStartHandlers.startX,
      onTravellerMoveKeyboard: this.handleTravellerMoveKeyboard,
      onFocus: () => {
        this.setState({
          isTravellerFocused: true
        });
      },
      onBlur: () => {
        this.setState({
          isTravellerFocused: false
        });
      }
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(TravellerLayer, {
      travellerX: endX,
      id: "endX",
      otherProps: _objectSpread(_objectSpread({}, this.props), {}, {
        y: calculatedY
      }),
      onMouseEnter: this.handleEnterSlideOrTraveller,
      onMouseLeave: this.handleLeaveSlideOrTraveller,
      onMouseDown: this.travellerDragStartHandlers.endX,
      onTouchStart: this.travellerDragStartHandlers.endX,
      onTravellerMoveKeyboard: this.handleTravellerMoveKeyboard,
      onFocus: () => {
        this.setState({
          isTravellerFocused: true
        });
      },
      onBlur: () => {
        this.setState({
          isTravellerFocused: false
        });
      }
    }), (isTextActive || isSlideMoving || isTravellerMoving || isTravellerFocused || alwaysShowText) && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(BrushText, {
      startIndex: startIndex,
      endIndex: endIndex,
      y: calculatedY,
      height: height,
      travellerWidth: travellerWidth,
      stroke: stroke,
      tickFormatter: tickFormatter,
      dataKey: dataKey,
      data: data,
      startX: startX,
      endX: endX
    }));
  }
}
function BrushInternal(props) {
  var dispatch = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_11__/* .useAppDispatch */ .j)();
  var chartData = (0,_context_chartDataContext__WEBPACK_IMPORTED_MODULE_9__/* .useChartData */ .Oo)();
  var dataIndexes = (0,_context_chartDataContext__WEBPACK_IMPORTED_MODULE_9__/* .useDataIndex */ .eE)();
  var onChangeFromContext = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(_context_brushUpdateContext__WEBPACK_IMPORTED_MODULE_10__/* .BrushUpdateDispatchContext */ .D);
  var onChangeFromProps = props.onChange;
  var {
    startIndex: startIndexFromProps,
    endIndex: endIndexFromProps
  } = props;
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    // start and end index can be controlled from props, and we need them to stay up-to-date in the Redux state too
    dispatch((0,_state_chartDataSlice__WEBPACK_IMPORTED_MODULE_12__/* .setDataStartEndIndexes */ .M)({
      startIndex: startIndexFromProps,
      endIndex: endIndexFromProps
    }));
  }, [dispatch, endIndexFromProps, startIndexFromProps]);
  (0,_synchronisation_useChartSynchronisation__WEBPACK_IMPORTED_MODULE_16__/* .useBrushChartSynchronisation */ .fx)();
  var onChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(nextState => {
    if (dataIndexes == null) {
      return;
    }
    var {
      startIndex,
      endIndex
    } = dataIndexes;
    if (nextState.startIndex !== startIndex || nextState.endIndex !== endIndex) {
      onChangeFromContext === null || onChangeFromContext === void 0 || onChangeFromContext(nextState);
      onChangeFromProps === null || onChangeFromProps === void 0 || onChangeFromProps(nextState);
      dispatch((0,_state_chartDataSlice__WEBPACK_IMPORTED_MODULE_12__/* .setDataStartEndIndexes */ .M)(nextState));
    }
  }, [onChangeFromProps, onChangeFromContext, dispatch, dataIndexes]);
  var brushDimensions = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_11__/* .useAppSelector */ .G)(_state_selectors_brushSelectors__WEBPACK_IMPORTED_MODULE_15__/* .selectBrushDimensions */ .U);
  if (brushDimensions == null || dataIndexes == null || chartData == null || !chartData.length) {
    return null;
  }
  var {
    startIndex,
    endIndex
  } = dataIndexes;
  var {
    x,
    y,
    width
  } = brushDimensions;
  var contextProperties = {
    data: chartData,
    x,
    y,
    width,
    startIndex,
    endIndex,
    onChange
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(BrushWithState, _extends({}, props, contextProperties, {
    startIndexControlledFromProps: startIndexFromProps !== null && startIndexFromProps !== void 0 ? startIndexFromProps : undefined,
    endIndexControlledFromProps: endIndexFromProps !== null && endIndexFromProps !== void 0 ? endIndexFromProps : undefined
  }));
}
function BrushSettingsDispatcher(props) {
  var dispatch = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_11__/* .useAppDispatch */ .j)();
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    dispatch((0,_state_brushSlice__WEBPACK_IMPORTED_MODULE_13__/* .setBrushSettings */ .A3)(props));
    return () => {
      dispatch((0,_state_brushSlice__WEBPACK_IMPORTED_MODULE_13__/* .setBrushSettings */ .A3)(null));
    };
  }, [dispatch, props]);
  return null;
}
var defaultBrushProps = {
  height: 40,
  travellerWidth: 5,
  gap: 1,
  fill: '#fff',
  stroke: '#666',
  padding: {
    top: 1,
    right: 1,
    bottom: 1,
    left: 1
  },
  leaveTimeOut: 1000,
  alwaysShowText: false
};
function Brush(outsideProps) {
  var props = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_17__/* .resolveDefaultProps */ .e)(outsideProps, defaultBrushProps);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(BrushSettingsDispatcher, {
    height: props.height,
    x: props.x,
    y: props.y,
    width: props.width,
    padding: props.padding
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(BrushInternal, props));
}
Brush.displayName = 'Brush';

/***/ }),

/***/ 15344:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   L: () => (/* binding */ computeBarRectangles),
/* harmony export */   y: () => (/* binding */ Bar)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34164);
/* harmony import */ var _container_Layer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(86069);
/* harmony import */ var _component_Cell__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(72050);
/* harmony import */ var _component_LabelList__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(5614);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(59744);
/* harmony import */ var _util_ReactUtils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(94501);
/* harmony import */ var _util_Global__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(59938);
/* harmony import */ var _util_ChartUtils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(33964);
/* harmony import */ var _util_types__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(98940);
/* harmony import */ var _util_BarUtils__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(69767);
/* harmony import */ var _context_tooltipContext__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(58008);
/* harmony import */ var _state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(59482);
/* harmony import */ var _context_ErrorBarContext__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(5298);
/* harmony import */ var _GraphicalItemClipPath__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(31754);
/* harmony import */ var _context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(19287);
/* harmony import */ var _state_selectors_barSelectors__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(76398);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(49082);
/* harmony import */ var _context_PanoramaContext__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(12070);
/* harmony import */ var _state_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(33032);
/* harmony import */ var _state_SetLegendPayload__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(19797);
/* harmony import */ var _util_useAnimationId__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(8107);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(77404);
/* harmony import */ var _context_RegisterGraphicalItemId__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(84044);
/* harmony import */ var _state_SetGraphicalItem__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(42678);
/* harmony import */ var _util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(55448);
/* harmony import */ var _animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(31528);
var _excluded = ["onMouseEnter", "onMouseLeave", "onClick"],
  _excluded2 = ["value", "background", "tooltipPosition"],
  _excluded3 = ["id"],
  _excluded4 = ["onMouseEnter", "onClick", "onMouseLeave"];
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }




























var computeLegendPayloadFromBarData = props => {
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
    value: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_8__/* .getTooltipNameProp */ .uM)(name, dataKey),
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
    unit
  } = props;
  return {
    dataDefinedOnItem: undefined,
    positions: undefined,
    settings: {
      stroke,
      strokeWidth,
      fill,
      dataKey,
      nameKey: undefined,
      name: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_8__/* .getTooltipNameProp */ .uM)(name, dataKey),
      hide,
      type: props.tooltipType,
      color: props.fill,
      unit
    }
  };
}
function BarBackground(props) {
  var activeIndex = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_17__/* .useAppSelector */ .G)(_state_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_19__/* .selectActiveTooltipIndex */ .A2);
  var {
    data,
    dataKey,
    background: backgroundFromProps,
    allOtherBarProps
  } = props;
  var {
      onMouseEnter: onMouseEnterFromProps,
      onMouseLeave: onMouseLeaveFromProps,
      onClick: onItemClickFromProps
    } = allOtherBarProps,
    restOfAllOtherProps = _objectWithoutProperties(allOtherBarProps, _excluded);

  // @ts-expect-error bar mouse events are not compatible with recharts mouse events
  var onMouseEnterFromContext = (0,_context_tooltipContext__WEBPACK_IMPORTED_MODULE_11__/* .useMouseEnterItemDispatch */ .Cj)(onMouseEnterFromProps, dataKey);
  // @ts-expect-error bar mouse events are not compatible with recharts mouse events
  var onMouseLeaveFromContext = (0,_context_tooltipContext__WEBPACK_IMPORTED_MODULE_11__/* .useMouseLeaveItemDispatch */ .Pg)(onMouseLeaveFromProps);
  // @ts-expect-error bar mouse events are not compatible with recharts mouse events
  var onClickFromContext = (0,_context_tooltipContext__WEBPACK_IMPORTED_MODULE_11__/* .useMouseClickItemDispatch */ .Ub)(onItemClickFromProps, dataKey);
  if (!backgroundFromProps || data == null) {
    return null;
  }
  var backgroundProps = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_25__/* .svgPropertiesNoEventsFromUnknown */ .ic)(backgroundFromProps);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, data.map((entry, i) => {
    var {
        value,
        background: backgroundFromDataEntry,
        tooltipPosition
      } = entry,
      rest = _objectWithoutProperties(entry, _excluded2);
    if (!backgroundFromDataEntry) {
      return null;
    }

    // @ts-expect-error BarRectangleItem type definition says it's missing properties, but I can see them present in debugger!
    var onMouseEnter = onMouseEnterFromContext(entry, i);
    // @ts-expect-error BarRectangleItem type definition says it's missing properties, but I can see them present in debugger!
    var onMouseLeave = onMouseLeaveFromContext(entry, i);
    // @ts-expect-error BarRectangleItem type definition says it's missing properties, but I can see them present in debugger!
    var onClick = onClickFromContext(entry, i);
    var barRectangleProps = _objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread({
      option: backgroundFromProps,
      isActive: String(i) === activeIndex
    }, rest), {}, {
      // @ts-expect-error backgroundProps is contributing unknown props
      fill: '#eee'
    }, backgroundFromDataEntry), backgroundProps), (0,_util_types__WEBPACK_IMPORTED_MODULE_9__/* .adaptEventsOfChild */ .X)(restOfAllOtherProps, entry, i)), {}, {
      onMouseEnter,
      onMouseLeave,
      onClick,
      dataKey,
      index: i,
      className: 'recharts-bar-background-rectangle'
    });
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_util_BarUtils__WEBPACK_IMPORTED_MODULE_10__/* .BarRectangle */ .z, _extends({
      key: "background-bar-".concat(i)
    }, barRectangleProps));
  }));
}
function BarLabelListProvider(_ref) {
  var {
    showLabels,
    children,
    rects
  } = _ref;
  var labelListEntries = rects === null || rects === void 0 ? void 0 : rects.map(entry => {
    var viewBox = {
      x: entry.x,
      y: entry.y,
      width: entry.width,
      height: entry.height
    };
    return _objectSpread(_objectSpread({}, viewBox), {}, {
      value: entry.value,
      payload: entry.payload,
      parentViewBox: entry.parentViewBox,
      viewBox,
      fill: entry.fill
    });
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_LabelList__WEBPACK_IMPORTED_MODULE_4__/* .CartesianLabelListContextProvider */ .h8, {
    value: showLabels ? labelListEntries : undefined
  }, children);
}
function BarRectangleWithActiveState(props) {
  var {
    shape,
    activeBar,
    baseProps,
    entry,
    index,
    dataKey
  } = props;
  var activeIndex = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_17__/* .useAppSelector */ .G)(_state_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_19__/* .selectActiveTooltipIndex */ .A2);
  var activeDataKey = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_17__/* .useAppSelector */ .G)(_state_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_19__/* .selectActiveTooltipDataKey */ .Xb);
  /*
   * Bars support stacking, meaning that there can be multiple bars at the same x value.
   * With Tooltip shared=false we only want to highlight the currently active Bar, not all.
   *
   * Also, if the tooltip is shared, we want to highlight all bars at the same x value
   * regardless of the dataKey.
   *
   * With shared Tooltip, the activeDataKey is undefined.
   */
  var isActive = activeBar && String(index) === activeIndex && (activeDataKey == null || dataKey === activeDataKey);
  var option = isActive ? activeBar : shape;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_util_BarUtils__WEBPACK_IMPORTED_MODULE_10__/* .BarRectangle */ .z, _extends({}, baseProps, {
    name: String(baseProps.name)
  }, entry, {
    isActive: isActive,
    option: option,
    index: index,
    dataKey: dataKey
  }));
}
function BarRectangleNeverActive(props) {
  var {
    shape,
    baseProps,
    entry,
    index,
    dataKey
  } = props;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_util_BarUtils__WEBPACK_IMPORTED_MODULE_10__/* .BarRectangle */ .z, _extends({}, baseProps, {
    name: String(baseProps.name)
  }, entry, {
    isActive: false,
    option: shape,
    index: index,
    dataKey: dataKey
  }));
}
function BarRectangles(_ref2) {
  var {
    data,
    props
  } = _ref2;
  var _svgPropertiesNoEvent = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_25__/* .svgPropertiesNoEvents */ .uZ)(props),
    {
      id
    } = _svgPropertiesNoEvent,
    baseProps = _objectWithoutProperties(_svgPropertiesNoEvent, _excluded3);
  var {
    shape,
    dataKey,
    activeBar
  } = props;
  var {
      onMouseEnter: onMouseEnterFromProps,
      onClick: onItemClickFromProps,
      onMouseLeave: onMouseLeaveFromProps
    } = props,
    restOfAllOtherProps = _objectWithoutProperties(props, _excluded4);

  // @ts-expect-error bar mouse events are not compatible with recharts mouse events
  var onMouseEnterFromContext = (0,_context_tooltipContext__WEBPACK_IMPORTED_MODULE_11__/* .useMouseEnterItemDispatch */ .Cj)(onMouseEnterFromProps, dataKey);
  // @ts-expect-error bar mouse events are not compatible with recharts mouse events
  var onMouseLeaveFromContext = (0,_context_tooltipContext__WEBPACK_IMPORTED_MODULE_11__/* .useMouseLeaveItemDispatch */ .Pg)(onMouseLeaveFromProps);
  // @ts-expect-error bar mouse events are not compatible with recharts mouse events
  var onClickFromContext = (0,_context_tooltipContext__WEBPACK_IMPORTED_MODULE_11__/* .useMouseClickItemDispatch */ .Ub)(onItemClickFromProps, dataKey);
  if (!data) {
    return null;
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, data.map((entry, i) => {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_2__/* .Layer */ .W
    // https://github.com/recharts/recharts/issues/5415
    // eslint-disable-next-line react/no-array-index-key
    , _extends({
      key: "rectangle-".concat(entry === null || entry === void 0 ? void 0 : entry.x, "-").concat(entry === null || entry === void 0 ? void 0 : entry.y, "-").concat(entry === null || entry === void 0 ? void 0 : entry.value, "-").concat(i),
      className: "recharts-bar-rectangle"
    }, (0,_util_types__WEBPACK_IMPORTED_MODULE_9__/* .adaptEventsOfChild */ .X)(restOfAllOtherProps, entry, i), {
      // @ts-expect-error BarRectangleItem type definition says it's missing properties, but I can see them present in debugger!
      onMouseEnter: onMouseEnterFromContext(entry, i)
      // @ts-expect-error BarRectangleItem type definition says it's missing properties, but I can see them present in debugger!
      ,
      onMouseLeave: onMouseLeaveFromContext(entry, i)
      // @ts-expect-error BarRectangleItem type definition says it's missing properties, but I can see them present in debugger!
      ,
      onClick: onClickFromContext(entry, i)
    }), activeBar ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(BarRectangleWithActiveState, {
      shape: shape,
      activeBar: activeBar,
      baseProps: baseProps,
      entry: entry,
      index: i,
      dataKey: dataKey
    }) :
    /*#__PURE__*/
    /*
     * If the `activeBar` prop is falsy, then let's call the variant without hooks.
     * Using the `selectActiveTooltipIndex` selector is usually fast
     * but in charts with large-ish amount of data even the few nanoseconds add up to a noticeable jank.
     * If the activeBar is false then we don't need to know which index is active - because we won't use it anyway.
     * So let's just skip the hooks altogether. That way, React can skip rendering the component,
     * and can skip the tree reconciliation for its children too.
     * Because we can't call hooks conditionally, we need to have a separate component for that.
     */
    react__WEBPACK_IMPORTED_MODULE_0__.createElement(BarRectangleNeverActive, {
      shape: shape,
      baseProps: baseProps,
      entry: entry,
      index: i,
      dataKey: dataKey
    }));
  }));
}
function RectanglesWithAnimation(_ref3) {
  var {
    props,
    previousRectanglesRef
  } = _ref3;
  var {
    data,
    layout,
    isAnimationActive,
    animationBegin,
    animationDuration,
    animationEasing,
    onAnimationEnd,
    onAnimationStart
  } = props;
  var prevData = previousRectanglesRef.current;
  var animationId = (0,_util_useAnimationId__WEBPACK_IMPORTED_MODULE_21__/* .useAnimationId */ .n)(props, 'recharts-bar-');
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
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(BarLabelListProvider, {
    showLabels: showLabels,
    rects: data
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_26__/* .JavascriptAnimate */ .J, {
    animationId: animationId,
    begin: animationBegin,
    duration: animationDuration,
    isActive: isAnimationActive,
    easing: animationEasing,
    onAnimationEnd: handleAnimationEnd,
    onAnimationStart: handleAnimationStart,
    key: animationId
  }, t => {
    var stepData = t === 1 ? data : data === null || data === void 0 ? void 0 : data.map((entry, index) => {
      var prev = prevData && prevData[index];
      if (prev) {
        return _objectSpread(_objectSpread({}, entry), {}, {
          x: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .interpolate */ .GW)(prev.x, entry.x, t),
          y: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .interpolate */ .GW)(prev.y, entry.y, t),
          width: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .interpolate */ .GW)(prev.width, entry.width, t),
          height: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .interpolate */ .GW)(prev.height, entry.height, t)
        });
      }
      if (layout === 'horizontal') {
        var h = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .interpolate */ .GW)(0, entry.height, t);
        return _objectSpread(_objectSpread({}, entry), {}, {
          y: entry.y + entry.height - h,
          height: h
        });
      }
      var w = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .interpolate */ .GW)(0, entry.width, t);
      return _objectSpread(_objectSpread({}, entry), {}, {
        width: w
      });
    });
    if (t > 0) {
      // eslint-disable-next-line no-param-reassign
      previousRectanglesRef.current = stepData !== null && stepData !== void 0 ? stepData : null;
    }
    if (stepData == null) {
      return null;
    }
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_2__/* .Layer */ .W, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(BarRectangles, {
      props: props,
      data: stepData
    }));
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_LabelList__WEBPACK_IMPORTED_MODULE_4__/* .LabelListFromLabelProp */ .qY, {
    label: props.label
  }), props.children);
}
function RenderRectangles(props) {
  var previousRectanglesRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(RectanglesWithAnimation, {
    previousRectanglesRef: previousRectanglesRef,
    props: props
  });
}
var defaultMinPointSize = 0;
var errorBarDataPointFormatter = (dataPoint, dataKey) => {
  /**
   * if the value coming from `selectBarRectangles` is an array then this is a stacked bar chart.
   * arr[1] represents end value of the bar since the data is in the form of [startValue, endValue].
   * */
  var value = Array.isArray(dataPoint.value) ? dataPoint.value[1] : dataPoint.value;
  return {
    x: dataPoint.x,
    y: dataPoint.y,
    value,
    // @ts-expect-error getValueByDataKey does not validate the output type
    errorVal: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_8__/* .getValueByDataKey */ .kr)(dataPoint, dataKey)
  };
};
class BarWithState extends react__WEBPACK_IMPORTED_MODULE_0__.PureComponent {
  render() {
    var {
      hide,
      data,
      dataKey,
      className,
      xAxisId,
      yAxisId,
      needClip,
      background,
      id
    } = this.props;
    if (hide || data == null) {
      return null;
    }
    var layerClass = (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)('recharts-bar', className);
    var clipPathId = id;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_2__/* .Layer */ .W, {
      className: layerClass,
      id: id
    }, needClip && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("defs", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_GraphicalItemClipPath__WEBPACK_IMPORTED_MODULE_14__/* .GraphicalItemClipPath */ .Q, {
      clipPathId: clipPathId,
      xAxisId: xAxisId,
      yAxisId: yAxisId
    })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_2__/* .Layer */ .W, {
      className: "recharts-bar-rectangles",
      clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : undefined
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(BarBackground, {
      data: data,
      dataKey: dataKey,
      background: background,
      allOtherBarProps: this.props
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(RenderRectangles, this.props)));
  }
}
var defaultBarProps = {
  activeBar: false,
  animationBegin: 0,
  animationDuration: 400,
  animationEasing: 'ease',
  hide: false,
  isAnimationActive: !_util_Global__WEBPACK_IMPORTED_MODULE_7__/* .Global */ .m.isSsr,
  legendType: 'rect',
  minPointSize: defaultMinPointSize,
  xAxisId: 0,
  yAxisId: 0
};
function BarImpl(props) {
  var {
    xAxisId,
    yAxisId,
    hide,
    legendType,
    minPointSize,
    activeBar,
    animationBegin,
    animationDuration,
    animationEasing,
    isAnimationActive
  } = props;
  var {
    needClip
  } = (0,_GraphicalItemClipPath__WEBPACK_IMPORTED_MODULE_14__/* .useNeedsClip */ .l)(xAxisId, yAxisId);
  var layout = (0,_context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_15__/* .useChartLayout */ .WX)();
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_18__/* .useIsPanorama */ .r)();
  var cells = (0,_util_ReactUtils__WEBPACK_IMPORTED_MODULE_6__/* .findAllByType */ .aS)(props.children, _component_Cell__WEBPACK_IMPORTED_MODULE_3__/* .Cell */ .f);
  var rects = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_17__/* .useAppSelector */ .G)(state => (0,_state_selectors_barSelectors__WEBPACK_IMPORTED_MODULE_16__/* .selectBarRectangles */ .OS)(state, xAxisId, yAxisId, isPanorama, props.id, cells));
  if (layout !== 'vertical' && layout !== 'horizontal') {
    return null;
  }
  var errorBarOffset;
  var firstDataPoint = rects === null || rects === void 0 ? void 0 : rects[0];
  if (firstDataPoint == null || firstDataPoint.height == null || firstDataPoint.width == null) {
    errorBarOffset = 0;
  } else {
    errorBarOffset = layout === 'vertical' ? firstDataPoint.height / 2 : firstDataPoint.width / 2;
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_ErrorBarContext__WEBPACK_IMPORTED_MODULE_13__/* .SetErrorBarContext */ .zk, {
    xAxisId: xAxisId,
    yAxisId: yAxisId,
    data: rects,
    dataPointFormatter: errorBarDataPointFormatter,
    errorBarOffset: errorBarOffset
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(BarWithState, _extends({}, props, {
    layout: layout,
    needClip: needClip,
    data: rects,
    xAxisId: xAxisId,
    yAxisId: yAxisId,
    hide: hide,
    legendType: legendType,
    minPointSize: minPointSize,
    activeBar: activeBar,
    animationBegin: animationBegin,
    animationDuration: animationDuration,
    animationEasing: animationEasing,
    isAnimationActive: isAnimationActive
  })));
}
function computeBarRectangles(_ref4) {
  var {
    layout,
    barSettings: {
      dataKey,
      minPointSize: minPointSizeProp
    },
    pos,
    bandSize,
    xAxis,
    yAxis,
    xAxisTicks,
    yAxisTicks,
    stackedData,
    displayedData,
    offset,
    cells,
    parentViewBox
  } = _ref4;
  var numericAxis = layout === 'horizontal' ? yAxis : xAxis;
  // @ts-expect-error this assumes that the domain is always numeric, but doesn't check for it
  var stackedDomain = stackedData ? numericAxis.scale.domain() : null;
  var baseValue = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_8__/* .getBaseValueOfBar */ .DW)({
    numericAxis
  });
  return displayedData.map((entry, index) => {
    var value, x, y, width, height, background;
    if (stackedData) {
      // we don't need to use dataStartIndex here, because stackedData is already sliced from the selector
      value = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_8__/* .truncateByDomain */ ._f)(stackedData[index], stackedDomain);
    } else {
      value = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_8__/* .getValueByDataKey */ .kr)(entry, dataKey);
      if (!Array.isArray(value)) {
        value = [baseValue, value];
      }
    }
    var minPointSize = (0,_util_BarUtils__WEBPACK_IMPORTED_MODULE_10__/* .minPointSizeCallback */ .l)(minPointSizeProp, defaultMinPointSize)(value[1], index);
    if (layout === 'horizontal') {
      var _ref5;
      var [baseValueScale, currentValueScale] = [yAxis.scale(value[0]), yAxis.scale(value[1])];
      x = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_8__/* .getCateCoordinateOfBar */ .y2)({
        axis: xAxis,
        ticks: xAxisTicks,
        bandSize,
        offset: pos.offset,
        entry,
        index
      });
      y = (_ref5 = currentValueScale !== null && currentValueScale !== void 0 ? currentValueScale : baseValueScale) !== null && _ref5 !== void 0 ? _ref5 : undefined;
      width = pos.size;
      var computedHeight = baseValueScale - currentValueScale;
      height = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .isNan */ .M8)(computedHeight) ? 0 : computedHeight;
      background = {
        x,
        y: offset.top,
        width,
        height: offset.height
      };
      if (Math.abs(minPointSize) > 0 && Math.abs(height) < Math.abs(minPointSize)) {
        var delta = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .mathSign */ .sA)(height || minPointSize) * (Math.abs(minPointSize) - Math.abs(height));
        y -= delta;
        height += delta;
      }
    } else {
      var [_baseValueScale, _currentValueScale] = [xAxis.scale(value[0]), xAxis.scale(value[1])];
      x = _baseValueScale;
      y = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_8__/* .getCateCoordinateOfBar */ .y2)({
        axis: yAxis,
        ticks: yAxisTicks,
        bandSize,
        offset: pos.offset,
        entry,
        index
      });
      width = _currentValueScale - _baseValueScale;
      height = pos.size;
      background = {
        x: offset.left,
        y,
        width: offset.width,
        height
      };
      if (Math.abs(minPointSize) > 0 && Math.abs(width) < Math.abs(minPointSize)) {
        var _delta = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .mathSign */ .sA)(width || minPointSize) * (Math.abs(minPointSize) - Math.abs(width));
        width += _delta;
      }
    }
    if (x == null || y == null || width == null || height == null) {
      return null;
    }
    var barRectangleItem = _objectSpread(_objectSpread({}, entry), {}, {
      x,
      y,
      width,
      height,
      value: stackedData ? value : value[1],
      payload: entry,
      background,
      tooltipPosition: {
        x: x + width / 2,
        y: y + height / 2
      },
      parentViewBox
    }, cells && cells[index] && cells[index].props);
    return barRectangleItem;
  }).filter(Boolean);
}
function BarFn(outsideProps) {
  var props = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_22__/* .resolveDefaultProps */ .e)(outsideProps, defaultBarProps);
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_18__/* .useIsPanorama */ .r)();
  // Report all props to Redux store first, before calling any hooks, to avoid circular dependencies.
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_RegisterGraphicalItemId__WEBPACK_IMPORTED_MODULE_23__/* .RegisterGraphicalItemId */ .x, {
    id: props.id,
    type: "bar"
  }, id => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetLegendPayload__WEBPACK_IMPORTED_MODULE_20__/* .SetLegendPayload */ .A, {
    legendPayload: computeLegendPayloadFromBarData(props)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_12__/* .SetTooltipEntrySettings */ .r, {
    fn: getTooltipEntrySettings,
    args: props
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetGraphicalItem__WEBPACK_IMPORTED_MODULE_24__/* .SetCartesianGraphicalItem */ .p, {
    type: "bar",
    id: id
    // Bar does not allow setting data directly on the graphical item (why?)
    ,
    data: undefined,
    xAxisId: props.xAxisId,
    yAxisId: props.yAxisId,
    zAxisId: 0,
    dataKey: props.dataKey,
    stackId: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_8__/* .getNormalizedStackId */ .$8)(props.stackId),
    hide: props.hide,
    barSize: props.barSize,
    minPointSize: props.minPointSize,
    maxBarSize: props.maxBarSize,
    isPanorama: isPanorama
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(BarImpl, _extends({}, props, {
    id: id
  }))));
}
var Bar = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.memo(BarFn);
Bar.displayName = 'Bar';

/***/ }),

/***/ 23014:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  L: () => (/* binding */ useAnimationManager)
});

// UNUSED EXPORTS: AnimationManagerContext

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
;// ./node_modules/recharts/es6/animation/AnimationManager.js
/**
 * Represents a single item in the ReactSmoothQueue.
 * The item can be:
 * - A number representing a delay in milliseconds.
 * - An object representing a style change
 * - A StartAnimationFunction that starts eased transition and calls different render
 *      because of course in Recharts we have to have three ways to do everything
 * - An arbitrary function to be executed
 */

function createAnimateManager(timeoutController) {
  var currStyle;
  var handleChange = () => null;
  var shouldStop = false;
  var cancelTimeout = null;
  var setStyle = _style => {
    if (shouldStop) {
      return;
    }
    if (Array.isArray(_style)) {
      if (!_style.length) {
        return;
      }
      var styles = _style;
      var [curr, ...restStyles] = styles;
      if (typeof curr === 'number') {
        cancelTimeout = timeoutController.setTimeout(setStyle.bind(null, restStyles), curr);
        return;
      }
      setStyle(curr);
      cancelTimeout = timeoutController.setTimeout(setStyle.bind(null, restStyles));
      return;
    }
    if (typeof _style === 'string') {
      currStyle = _style;
      handleChange(currStyle);
    }
    if (typeof _style === 'object') {
      currStyle = _style;
      handleChange(currStyle);
    }
    if (typeof _style === 'function') {
      _style();
    }
  };
  return {
    stop: () => {
      shouldStop = true;
    },
    start: style => {
      shouldStop = false;
      if (cancelTimeout) {
        cancelTimeout();
        cancelTimeout = null;
      }
      setStyle(style);
    },
    subscribe: _handleChange => {
      handleChange = _handleChange;
      return () => {
        handleChange = () => null;
      };
    },
    getTimeoutController: () => timeoutController
  };
}
;// ./node_modules/recharts/es6/animation/timeoutController.js
/**
 * Callback type for the timeout function.
 * Receives current time in milliseconds as an argument.
 */

/**
 * A function that, when called, cancels the timeout.
 */

class RequestAnimationFrameTimeoutController {
  setTimeout(callback) {
    var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var startTime = performance.now();
    var requestId = null;
    var executeCallback = now => {
      if (now - startTime >= delay) {
        callback(now);
        // tests fail without the extra if, even when five lines below it's not needed
        // TODO finish transition to the mocked timeout controller and then remove this condition
      } else if (typeof requestAnimationFrame === 'function') {
        requestId = requestAnimationFrame(executeCallback);
      }
    };
    requestId = requestAnimationFrame(executeCallback);
    return () => {
      cancelAnimationFrame(requestId);
    };
  }
}
;// ./node_modules/recharts/es6/animation/createDefaultAnimationManager.js


function createDefaultAnimationManager() {
  return createAnimateManager(new RequestAnimationFrameTimeoutController());
}
;// ./node_modules/recharts/es6/animation/useAnimationManager.js


var AnimationManagerContext = /*#__PURE__*/(0,react.createContext)(createDefaultAnimationManager);
function useAnimationManager(animationId, animationManagerFromProps) {
  var contextAnimationManager = (0,react.useContext)(AnimationManagerContext);
  return (0,react.useMemo)(() => animationManagerFromProps !== null && animationManagerFromProps !== void 0 ? animationManagerFromProps : contextAnimationManager(animationId), [animationId, animationManagerFromProps, contextAnimationManager]);
}

/***/ }),

/***/ 23929:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   dl: () => (/* binding */ getTransitionVal),
/* harmony export */   mP: () => (/* binding */ getIntersectionKeys),
/* harmony export */   s8: () => (/* binding */ mapObject)
/* harmony export */ });
/* unused harmony export getDashCase */
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/*
 * @description: convert camel case to dash case
 * string => string
 */
var getDashCase = name => name.replace(/([A-Z])/g, v => "-".concat(v.toLowerCase()));
var getTransitionVal = (props, duration, easing) => props.map(prop => "".concat(getDashCase(prop), " ").concat(duration, "ms ").concat(easing)).join(',');

/**
 * Finds the intersection of keys between two objects
 * @param {object} preObj previous object
 * @param {object} nextObj next object
 * @returns an array of keys that exist in both objects
 */
var getIntersectionKeys = (preObj, nextObj) => [Object.keys(preObj), Object.keys(nextObj)].reduce((a, b) => a.filter(c => b.includes(c)));

/**
 * Maps an object to another object
 * @param {function} fn function to map
 * @param {object} obj object to map
 * @returns mapped object
 */
var mapObject = (fn, obj) => Object.keys(obj).reduce((res, key) => _objectSpread(_objectSpread({}, res), {}, {
  [key]: fn(key, obj[key])
}), {});

/***/ }),

/***/ 31528:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  J: () => (/* binding */ JavascriptAnimate)
});

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/es-toolkit/dist/index.mjs + 184 modules
var dist = __webpack_require__(68866);
// EXTERNAL MODULE: ./node_modules/recharts/es6/util/resolveDefaultProps.js
var resolveDefaultProps = __webpack_require__(77404);
// EXTERNAL MODULE: ./node_modules/recharts/es6/animation/util.js
var util = __webpack_require__(23929);
;// ./node_modules/recharts/es6/animation/configUpdate.js
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }

var alpha = (begin, end, k) => begin + (end - begin) * k;
var needContinue = _ref => {
  var {
    from,
    to
  } = _ref;
  return from !== to;
};
/*
 * @description: cal new from value and velocity in each stepper
 * @return: { [styleProperty]: { from, to, velocity } }
 */
var calStepperVals = (easing, preVals, steps) => {
  var nextStepVals = (0,util/* mapObject */.s8)((key, val) => {
    if (needContinue(val)) {
      var [newX, newV] = easing(val.from, val.to, val.velocity);
      return _objectSpread(_objectSpread({}, val), {}, {
        from: newX,
        velocity: newV
      });
    }
    return val;
  }, preVals);
  if (steps < 1) {
    return (0,util/* mapObject */.s8)((key, val) => {
      if (needContinue(val)) {
        return _objectSpread(_objectSpread({}, val), {}, {
          velocity: alpha(val.velocity, nextStepVals[key].velocity, steps),
          from: alpha(val.from, nextStepVals[key].from, steps)
        });
      }
      return val;
    }, preVals);
  }
  return calStepperVals(easing, nextStepVals, steps - 1);
};
function createStepperUpdate(from, to, easing, interKeys, render, timeoutController) {
  var preTime;
  var stepperStyle = interKeys.reduce((res, key) => _objectSpread(_objectSpread({}, res), {}, {
    [key]: {
      from: from[key],
      velocity: 0,
      to: to[key]
    }
  }), {});
  var getCurrStyle = () => (0,util/* mapObject */.s8)((key, val) => val.from, stepperStyle);
  var shouldStopAnimation = () => !Object.values(stepperStyle).filter(needContinue).length;
  var stopAnimation = null;
  var stepperUpdate = now => {
    if (!preTime) {
      preTime = now;
    }
    var deltaTime = now - preTime;
    var steps = deltaTime / easing.dt;
    stepperStyle = calStepperVals(easing, stepperStyle, steps);
    // get union set and add compatible prefix
    render(_objectSpread(_objectSpread(_objectSpread({}, from), to), getCurrStyle()));
    preTime = now;
    if (!shouldStopAnimation()) {
      stopAnimation = timeoutController.setTimeout(stepperUpdate);
    }
  };

  // return start animation method
  return () => {
    stopAnimation = timeoutController.setTimeout(stepperUpdate);

    // return stop animation method
    return () => {
      stopAnimation();
    };
  };
}
function createTimingUpdate(from, to, easing, duration, interKeys, render, timeoutController) {
  var stopAnimation = null;
  var timingStyle = interKeys.reduce((res, key) => _objectSpread(_objectSpread({}, res), {}, {
    [key]: [from[key], to[key]]
  }), {});
  var beginTime;
  var timingUpdate = now => {
    if (!beginTime) {
      beginTime = now;
    }
    var t = (now - beginTime) / duration;
    var currStyle = (0,util/* mapObject */.s8)((key, val) => alpha(...val, easing(t)), timingStyle);

    // get union set and add compatible prefix
    render(_objectSpread(_objectSpread(_objectSpread({}, from), to), currStyle));
    if (t < 1) {
      stopAnimation = timeoutController.setTimeout(timingUpdate);
    } else {
      var finalStyle = (0,util/* mapObject */.s8)((key, val) => alpha(...val, easing(1)), timingStyle);
      render(_objectSpread(_objectSpread(_objectSpread({}, from), to), finalStyle));
    }
  };

  // return start animation method
  return () => {
    stopAnimation = timeoutController.setTimeout(timingUpdate);

    // return stop animation method
    return () => {
      stopAnimation();
    };
  };
}

// configure update function
// eslint-disable-next-line import/no-default-export
/* harmony default export */ const configUpdate = ((from, to, easing, duration, render, timeoutController) => {
  var interKeys = (0,util/* getIntersectionKeys */.mP)(from, to);
  return easing.isStepper === true ? createStepperUpdate(from, to, easing, interKeys, render, timeoutController) : createTimingUpdate(from, to, easing, duration, interKeys, render, timeoutController);
});
;// ./node_modules/recharts/es6/animation/easing.js
var ACCURACY = 1e-4;
var cubicBezierFactor = (c1, c2) => [0, 3 * c1, 3 * c2 - 6 * c1, 3 * c1 - 3 * c2 + 1];
var evaluatePolynomial = (params, t) => params.map((param, i) => param * t ** i).reduce((pre, curr) => pre + curr);
var cubicBezier = (c1, c2) => t => {
  var params = cubicBezierFactor(c1, c2);
  return evaluatePolynomial(params, t);
};
var derivativeCubicBezier = (c1, c2) => t => {
  var params = cubicBezierFactor(c1, c2);
  var newParams = [...params.map((param, i) => param * i).slice(1), 0];
  return evaluatePolynomial(newParams, t);
};
// calculate cubic-bezier using Newton's method
var configBezier = function configBezier() {
  var x1, x2, y1, y2;
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  if (args.length === 1) {
    switch (args[0]) {
      case 'linear':
        [x1, y1, x2, y2] = [0.0, 0.0, 1.0, 1.0];
        break;
      case 'ease':
        [x1, y1, x2, y2] = [0.25, 0.1, 0.25, 1.0];
        break;
      case 'ease-in':
        [x1, y1, x2, y2] = [0.42, 0.0, 1.0, 1.0];
        break;
      case 'ease-out':
        [x1, y1, x2, y2] = [0.42, 0.0, 0.58, 1.0];
        break;
      case 'ease-in-out':
        [x1, y1, x2, y2] = [0.0, 0.0, 0.58, 1.0];
        break;
      default:
        {
          var easing = args[0].split('(');
          if (easing[0] === 'cubic-bezier' && easing[1].split(')')[0].split(',').length === 4) {
            [x1, y1, x2, y2] = easing[1].split(')')[0].split(',').map(x => parseFloat(x));
          }
        }
    }
  } else if (args.length === 4) {
    [x1, y1, x2, y2] = args;
  }
  var curveX = cubicBezier(x1, x2);
  var curveY = cubicBezier(y1, y2);
  var derCurveX = derivativeCubicBezier(x1, x2);
  var rangeValue = value => {
    if (value > 1) {
      return 1;
    }
    if (value < 0) {
      return 0;
    }
    return value;
  };
  var bezier = _t => {
    var t = _t > 1 ? 1 : _t;
    var x = t;
    for (var i = 0; i < 8; ++i) {
      var evalT = curveX(x) - t;
      var derVal = derCurveX(x);
      if (Math.abs(evalT - t) < ACCURACY || derVal < ACCURACY) {
        return curveY(x);
      }
      x = rangeValue(x - evalT / derVal);
    }
    return curveY(x);
  };
  bezier.isStepper = false;
  return bezier;
};
var configSpring = function configSpring() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var {
    stiff = 100,
    damping = 8,
    dt = 17
  } = config;
  var stepper = (currX, destX, currV) => {
    var FSpring = -(currX - destX) * stiff;
    var FDamping = currV * damping;
    var newV = currV + (FSpring - FDamping) * dt / 1000;
    var newX = currV * dt / 1000 + currX;
    if (Math.abs(newX - destX) < ACCURACY && Math.abs(newV) < ACCURACY) {
      return [destX, 0];
    }
    return [newX, newV];
  };
  stepper.isStepper = true;
  stepper.dt = dt;
  return stepper;
};
var configEasing = easing => {
  if (typeof easing === 'string') {
    switch (easing) {
      case 'ease':
      case 'ease-in-out':
      case 'ease-out':
      case 'ease-in':
      case 'linear':
        return configBezier(easing);
      case 'spring':
        return configSpring();
      default:
        if (easing.split('(')[0] === 'cubic-bezier') {
          return configBezier(easing);
        }
    }
  }
  if (typeof easing === 'function') {
    return easing;
  }
  return null;
};
// EXTERNAL MODULE: ./node_modules/recharts/es6/animation/useAnimationManager.js + 3 modules
var useAnimationManager = __webpack_require__(23014);
;// ./node_modules/recharts/es6/animation/JavascriptAnimate.js






var defaultJavascriptAnimateProps = {
  begin: 0,
  duration: 1000,
  easing: 'ease',
  isActive: true,
  canBegin: true,
  onAnimationEnd: () => {},
  onAnimationStart: () => {}
};
var from = {
  t: 0
};
var to = {
  t: 1
};
function JavascriptAnimate(outsideProps) {
  var props = (0,resolveDefaultProps/* resolveDefaultProps */.e)(outsideProps, defaultJavascriptAnimateProps);
  var {
    isActive,
    canBegin,
    duration,
    easing,
    begin,
    onAnimationEnd,
    onAnimationStart,
    children
  } = props;
  var animationManager = (0,useAnimationManager/* useAnimationManager */.L)(props.animationId, props.animationManager);
  var [style, setStyle] = (0,react.useState)(isActive ? from : to);
  var stopJSAnimation = (0,react.useRef)(null);
  (0,react.useEffect)(() => {
    if (!isActive) {
      setStyle(to);
    }
  }, [isActive]);
  (0,react.useEffect)(() => {
    if (!isActive || !canBegin) {
      return dist/* noop */.lQ1;
    }
    var startAnimation = configUpdate(from, to, configEasing(easing), duration, setStyle, animationManager.getTimeoutController());
    var onAnimationActive = () => {
      stopJSAnimation.current = startAnimation();
    };
    animationManager.start([onAnimationStart, begin, onAnimationActive, duration, onAnimationEnd]);
    return () => {
      animationManager.stop();
      if (stopJSAnimation.current) {
        stopJSAnimation.current();
      }
      onAnimationEnd();
    };
  }, [isActive, canBegin, duration, easing, begin, onAnimationStart, onAnimationEnd, animationManager]);
  return children(style.t);
}

/***/ }),

/***/ 31754:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Q: () => (/* binding */ GraphicalItemClipPath),
/* harmony export */   l: () => (/* binding */ useNeedsClip)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(49082);
/* harmony import */ var _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(11114);
/* harmony import */ var _hooks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(33092);




function useNeedsClip(xAxisId, yAxisId) {
  var _xAxis$allowDataOverf, _yAxis$allowDataOverf;
  var xAxis = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_1__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_2__/* .selectXAxisSettings */ .Rl)(state, xAxisId));
  var yAxis = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_1__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_2__/* .selectYAxisSettings */ .sf)(state, yAxisId));
  var needClipX = (_xAxis$allowDataOverf = xAxis === null || xAxis === void 0 ? void 0 : xAxis.allowDataOverflow) !== null && _xAxis$allowDataOverf !== void 0 ? _xAxis$allowDataOverf : _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_2__/* .implicitXAxis */ .PU.allowDataOverflow;
  var needClipY = (_yAxis$allowDataOverf = yAxis === null || yAxis === void 0 ? void 0 : yAxis.allowDataOverflow) !== null && _yAxis$allowDataOverf !== void 0 ? _yAxis$allowDataOverf : _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_2__/* .implicitYAxis */ .cd.allowDataOverflow;
  var needClip = needClipX || needClipY;
  return {
    needClip,
    needClipX,
    needClipY
  };
}
function GraphicalItemClipPath(_ref) {
  var {
    xAxisId,
    yAxisId,
    clipPathId
  } = _ref;
  var plotArea = (0,_hooks__WEBPACK_IMPORTED_MODULE_3__/* .usePlotArea */ .oM)();
  var {
    needClipX,
    needClipY,
    needClip
  } = useNeedsClip(xAxisId, yAxisId);
  if (!needClip) {
    return null;
  }
  var {
    x,
    y,
    width,
    height
  } = plotArea;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("clipPath", {
    id: "clipPath-".concat(clipPathId)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("rect", {
    x: needClipX ? x : x - width / 2,
    y: needClipY ? y : y - height / 2,
    width: needClipX ? width : width * 2,
    height: needClipY ? height : height * 2
  }));
}

/***/ }),

/***/ 34429:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   lf: () => (/* binding */ computeFunnelTrapezoids)
/* harmony export */ });
/* unused harmony exports FunnelWithState, Funnel */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var es_toolkit_compat_omit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(11576);
/* harmony import */ var es_toolkit_compat_omit__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(es_toolkit_compat_omit__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);
/* harmony import */ var _state_selectors_selectors__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(87997);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(49082);
/* harmony import */ var _container_Layer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(86069);
/* harmony import */ var _component_LabelList__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(5614);
/* harmony import */ var _util_Global__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(59938);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(59744);
/* harmony import */ var _util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(33964);
/* harmony import */ var _util_types__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(98940);
/* harmony import */ var _util_FunnelUtils__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(91640);
/* harmony import */ var _context_tooltipContext__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(58008);
/* harmony import */ var _state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(59482);
/* harmony import */ var _state_selectors_funnelSelectors__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(66561);
/* harmony import */ var _util_ReactUtils__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(94501);
/* harmony import */ var _component_Cell__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(72050);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(77404);
/* harmony import */ var _hooks__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(33092);
/* harmony import */ var _util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(55448);
/* harmony import */ var _animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(31528);
/* harmony import */ var _util_useAnimationId__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(8107);
var _excluded = ["onMouseEnter", "onClick", "onMouseLeave", "shape", "activeShape"],
  _excluded2 = ["stroke", "fill", "legendType", "hide", "isAnimationActive", "animationBegin", "animationDuration", "animationEasing", "nameKey", "lastShapeType"];
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/* eslint-disable max-classes-per-file */
























/**
 * Internal props, combination of external props + defaultProps + private Recharts state
 */

/**
 * External props, intended for end users to fill in
 */

function getTooltipEntrySettings(props) {
  var {
    dataKey,
    nameKey,
    stroke,
    strokeWidth,
    fill,
    name,
    hide,
    tooltipType,
    data
  } = props;
  return {
    dataDefinedOnItem: data,
    positions: props.trapezoids.map(_ref => {
      var {
        tooltipPosition
      } = _ref;
      return tooltipPosition;
    }),
    settings: {
      stroke,
      strokeWidth,
      fill,
      dataKey,
      name,
      nameKey,
      hide,
      type: tooltipType,
      color: fill,
      unit: '' // Funnel does not have unit, why?
    }
  };
}
function FunnelLabelListProvider(_ref2) {
  var {
    showLabels,
    trapezoids,
    children
  } = _ref2;
  var labelListEntries = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (!showLabels) {
      return undefined;
    }
    return trapezoids === null || trapezoids === void 0 ? void 0 : trapezoids.map(entry => {
      var viewBox = {
        x: entry.x,
        y: entry.y,
        // Label positions in Funnel are calculated relative to upperWidth so that's what we need to pass here as "width"
        width: entry.upperWidth,
        height: entry.height
      };
      return _objectSpread(_objectSpread({}, viewBox), {}, {
        value: entry.name,
        payload: entry.payload,
        parentViewBox: undefined,
        viewBox,
        fill: entry.fill
      });
    });
  }, [showLabels, trapezoids]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_LabelList__WEBPACK_IMPORTED_MODULE_6__/* .CartesianLabelListContextProvider */ .h8, {
    value: labelListEntries
  }, children);
}
function FunnelTrapezoids(props) {
  var {
    trapezoids,
    allOtherFunnelProps
  } = props;
  var activeItemIndex = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_4__/* .useAppSelector */ .G)(state => (0,_state_selectors_selectors__WEBPACK_IMPORTED_MODULE_3__/* .selectActiveIndex */ .rb)(state, 'item', state.tooltip.settings.trigger, undefined));
  var {
      onMouseEnter: onMouseEnterFromProps,
      onClick: onItemClickFromProps,
      onMouseLeave: onMouseLeaveFromProps,
      shape,
      activeShape
    } = allOtherFunnelProps,
    restOfAllOtherProps = _objectWithoutProperties(allOtherFunnelProps, _excluded);
  var onMouseEnterFromContext = (0,_context_tooltipContext__WEBPACK_IMPORTED_MODULE_12__/* .useMouseEnterItemDispatch */ .Cj)(onMouseEnterFromProps, allOtherFunnelProps.dataKey);
  var onMouseLeaveFromContext = (0,_context_tooltipContext__WEBPACK_IMPORTED_MODULE_12__/* .useMouseLeaveItemDispatch */ .Pg)(onMouseLeaveFromProps);
  var onClickFromContext = (0,_context_tooltipContext__WEBPACK_IMPORTED_MODULE_12__/* .useMouseClickItemDispatch */ .Ub)(onItemClickFromProps, allOtherFunnelProps.dataKey);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, trapezoids.map((entry, i) => {
    var isActiveIndex = Boolean(activeShape) && activeItemIndex === String(i);
    var trapezoidOptions = isActiveIndex ? activeShape : shape;
    var trapezoidProps = _objectSpread(_objectSpread({}, entry), {}, {
      option: trapezoidOptions,
      isActive: isActiveIndex,
      stroke: entry.stroke
    });
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_5__/* .Layer */ .W, _extends({
      key: "trapezoid-".concat(entry === null || entry === void 0 ? void 0 : entry.x, "-").concat(entry === null || entry === void 0 ? void 0 : entry.y, "-").concat(entry === null || entry === void 0 ? void 0 : entry.name, "-").concat(entry === null || entry === void 0 ? void 0 : entry.value),
      className: "recharts-funnel-trapezoid"
    }, (0,_util_types__WEBPACK_IMPORTED_MODULE_10__/* .adaptEventsOfChild */ .X)(restOfAllOtherProps, entry, i), {
      // @ts-expect-error the types need a bit of attention
      onMouseEnter: onMouseEnterFromContext(entry, i)
      // @ts-expect-error the types need a bit of attention
      ,
      onMouseLeave: onMouseLeaveFromContext(entry, i)
      // @ts-expect-error the types need a bit of attention
      ,
      onClick: onClickFromContext(entry, i)
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_util_FunnelUtils__WEBPACK_IMPORTED_MODULE_11__/* .FunnelTrapezoid */ .t, trapezoidProps));
  }));
}
function TrapezoidsWithAnimation(_ref3) {
  var {
    previousTrapezoidsRef,
    props
  } = _ref3;
  var {
    trapezoids,
    isAnimationActive,
    animationBegin,
    animationDuration,
    animationEasing,
    onAnimationEnd,
    onAnimationStart
  } = props;
  var prevTrapezoids = previousTrapezoidsRef.current;
  var [isAnimating, setIsAnimating] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  var showLabels = !isAnimating;
  var animationId = (0,_util_useAnimationId__WEBPACK_IMPORTED_MODULE_21__/* .useAnimationId */ .n)(trapezoids, 'recharts-funnel-');
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
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(FunnelLabelListProvider, {
    showLabels: showLabels,
    trapezoids: trapezoids
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_20__/* .JavascriptAnimate */ .J, {
    animationId: animationId,
    begin: animationBegin,
    duration: animationDuration,
    isActive: isAnimationActive,
    easing: animationEasing,
    key: animationId,
    onAnimationStart: handleAnimationStart,
    onAnimationEnd: handleAnimationEnd
  }, t => {
    var stepData = t === 1 ? trapezoids : trapezoids.map((entry, index) => {
      var prev = prevTrapezoids && prevTrapezoids[index];
      if (prev) {
        return _objectSpread(_objectSpread({}, entry), {}, {
          x: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_8__/* .interpolate */ .GW)(prev.x, entry.x, t),
          y: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_8__/* .interpolate */ .GW)(prev.y, entry.y, t),
          upperWidth: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_8__/* .interpolate */ .GW)(prev.upperWidth, entry.upperWidth, t),
          lowerWidth: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_8__/* .interpolate */ .GW)(prev.lowerWidth, entry.lowerWidth, t),
          height: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_8__/* .interpolate */ .GW)(prev.height, entry.height, t)
        });
      }
      return _objectSpread(_objectSpread({}, entry), {}, {
        x: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_8__/* .interpolate */ .GW)(entry.x + entry.upperWidth / 2, entry.x, t),
        y: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_8__/* .interpolate */ .GW)(entry.y + entry.height / 2, entry.y, t),
        upperWidth: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_8__/* .interpolate */ .GW)(0, entry.upperWidth, t),
        lowerWidth: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_8__/* .interpolate */ .GW)(0, entry.lowerWidth, t),
        height: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_8__/* .interpolate */ .GW)(0, entry.height, t)
      });
    });
    if (t > 0) {
      // eslint-disable-next-line no-param-reassign
      previousTrapezoidsRef.current = stepData;
    }
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_5__/* .Layer */ .W, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(FunnelTrapezoids, {
      trapezoids: stepData,
      allOtherFunnelProps: props
    }));
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_LabelList__WEBPACK_IMPORTED_MODULE_6__/* .LabelListFromLabelProp */ .qY, {
    label: props.label
  }), props.children);
}
function RenderTrapezoids(props) {
  var previousTrapezoidsRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(undefined);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(TrapezoidsWithAnimation, {
    props: props,
    previousTrapezoidsRef: previousTrapezoidsRef
  });
}
var getRealWidthHeight = (customWidth, offset) => {
  var {
    width,
    height,
    left,
    right,
    top,
    bottom
  } = offset;
  var realHeight = height;
  var realWidth = width;
  if ((0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_8__/* .isNumber */ .Et)(customWidth)) {
    realWidth = customWidth;
  } else if (typeof customWidth === 'string') {
    realWidth = realWidth * parseFloat(customWidth) / 100;
  }
  return {
    realWidth: realWidth - left - right - 50,
    realHeight: realHeight - bottom - top,
    offsetX: (width - realWidth) / 2,
    offsetY: (height - realHeight) / 2
  };
};
class FunnelWithState extends react__WEBPACK_IMPORTED_MODULE_0__.PureComponent {
  render() {
    var {
      className
    } = this.props;
    var layerClass = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('recharts-trapezoids', className);
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_5__/* .Layer */ .W, {
      className: layerClass
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(RenderTrapezoids, this.props));
  }
}
var defaultFunnelProps = {
  stroke: '#fff',
  fill: '#808080',
  legendType: 'rect',
  hide: false,
  isAnimationActive: !_util_Global__WEBPACK_IMPORTED_MODULE_7__/* .Global */ .m.isSsr,
  animationBegin: 400,
  animationDuration: 1500,
  animationEasing: 'ease',
  nameKey: 'name',
  lastShapeType: 'triangle'
};
function FunnelImpl(props) {
  var plotArea = (0,_hooks__WEBPACK_IMPORTED_MODULE_18__/* .usePlotArea */ .oM)();
  var _resolveDefaultProps = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_17__/* .resolveDefaultProps */ .e)(props, defaultFunnelProps),
    {
      stroke,
      fill,
      legendType,
      hide,
      isAnimationActive,
      animationBegin,
      animationDuration,
      animationEasing,
      nameKey,
      lastShapeType
    } = _resolveDefaultProps,
    everythingElse = _objectWithoutProperties(_resolveDefaultProps, _excluded2);
  var presentationProps = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_19__/* .svgPropertiesNoEvents */ .uZ)(props);
  var cells = (0,_util_ReactUtils__WEBPACK_IMPORTED_MODULE_15__/* .findAllByType */ .aS)(props.children, _component_Cell__WEBPACK_IMPORTED_MODULE_16__/* .Cell */ .f);
  var funnelSettings = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => ({
    dataKey: props.dataKey,
    nameKey,
    data: props.data,
    tooltipType: props.tooltipType,
    lastShapeType,
    reversed: props.reversed,
    customWidth: props.width,
    cells,
    presentationProps
  }), [props.dataKey, nameKey, props.data, props.tooltipType, lastShapeType, props.reversed, props.width, cells, presentationProps]);
  var trapezoids = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_4__/* .useAppSelector */ .G)(state => (0,_state_selectors_funnelSelectors__WEBPACK_IMPORTED_MODULE_14__/* .selectFunnelTrapezoids */ .C)(state, funnelSettings));
  if (hide || !trapezoids || !trapezoids.length || !plotArea) {
    return null;
  }
  var {
    height,
    width
  } = plotArea;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_13__/* .SetTooltipEntrySettings */ .r, {
    fn: getTooltipEntrySettings,
    args: _objectSpread(_objectSpread({}, props), {}, {
      trapezoids
    })
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(FunnelWithState, _extends({}, everythingElse, {
    stroke: stroke,
    fill: fill,
    nameKey: nameKey,
    lastShapeType: lastShapeType,
    animationBegin: animationBegin,
    animationDuration: animationDuration,
    animationEasing: animationEasing,
    isAnimationActive: isAnimationActive,
    hide: hide,
    legendType: legendType,
    height: height,
    width: width,
    trapezoids: trapezoids
  })));
}
function computeFunnelTrapezoids(_ref4) {
  var {
    dataKey,
    nameKey,
    displayedData,
    tooltipType,
    lastShapeType,
    reversed,
    offset,
    customWidth
  } = _ref4;
  var {
    left,
    top
  } = offset;
  var {
    realHeight,
    realWidth,
    offsetX,
    offsetY
  } = getRealWidthHeight(customWidth, offset);
  var maxValue = Math.max.apply(null, displayedData.map(entry => (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__/* .getValueByDataKey */ .kr)(entry, dataKey, 0)));
  var len = displayedData.length;
  var rowHeight = realHeight / len;
  var parentViewBox = {
    x: offset.left,
    y: offset.top,
    width: offset.width,
    height: offset.height
  };
  var trapezoids = displayedData.map((entry, i) => {
    var rawVal = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__/* .getValueByDataKey */ .kr)(entry, dataKey, 0);
    var name = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__/* .getValueByDataKey */ .kr)(entry, nameKey, i);
    var val = rawVal;
    var nextVal;
    if (i !== len - 1) {
      nextVal = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__/* .getValueByDataKey */ .kr)(displayedData[i + 1], dataKey, 0);
      if (nextVal instanceof Array) {
        [nextVal] = nextVal;
      }
    } else if (rawVal instanceof Array && rawVal.length === 2) {
      [val, nextVal] = rawVal;
    } else if (lastShapeType === 'rectangle') {
      nextVal = val;
    } else {
      nextVal = 0;
    }

    // @ts-expect-error getValueByDataKey does not validate the output type
    var x = (maxValue - val) * realWidth / (2 * maxValue) + top + 25 + offsetX;
    var y = rowHeight * i + left + offsetY;
    // @ts-expect-error getValueByDataKey does not validate the output type
    var upperWidth = val / maxValue * realWidth;
    var lowerWidth = nextVal / maxValue * realWidth;
    var tooltipPayload = [{
      name,
      value: val,
      payload: entry,
      dataKey,
      type: tooltipType
    }];
    var tooltipPosition = {
      x: x + upperWidth / 2,
      y: y + rowHeight / 2
    };
    return _objectSpread(_objectSpread({
      x,
      y,
      width: Math.max(upperWidth, lowerWidth),
      upperWidth,
      lowerWidth,
      height: rowHeight,
      // @ts-expect-error getValueByDataKey does not validate the output type
      name,
      val,
      tooltipPayload,
      tooltipPosition
    }, es_toolkit_compat_omit__WEBPACK_IMPORTED_MODULE_1___default()(entry, ['width'])), {}, {
      payload: entry,
      parentViewBox,
      labelViewBox: {
        x: x + (upperWidth - lowerWidth) / 4,
        y,
        width: Math.abs(upperWidth - lowerWidth) / 2 + Math.min(upperWidth, lowerWidth),
        height: rowHeight
      }
    });
  });
  if (reversed) {
    trapezoids = trapezoids.map((entry, index) => {
      var newY = entry.y - index * rowHeight + (len - 1 - index) * rowHeight;
      return _objectSpread(_objectSpread({}, entry), {}, {
        upperWidth: entry.lowerWidth,
        lowerWidth: entry.upperWidth,
        x: entry.x - (entry.lowerWidth - entry.upperWidth) / 2,
        y: entry.y - index * rowHeight + (len - 1 - index) * rowHeight,
        tooltipPosition: _objectSpread(_objectSpread({}, entry.tooltipPosition), {}, {
          y: newY + rowHeight / 2
        }),
        labelViewBox: _objectSpread(_objectSpread({}, entry.labelViewBox), {}, {
          y: newY
        })
      });
    });
  }
  return trapezoids;
}
class Funnel extends react__WEBPACK_IMPORTED_MODULE_0__.PureComponent {
  render() {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(FunnelImpl, this.props);
  }
}
_defineProperty(Funnel, "displayName", 'Funnel');
_defineProperty(Funnel, "defaultProps", defaultFunnelProps);

/***/ }),

/***/ 43270:
/***/ ((__unused_webpack___webpack_module__, __unused_webpack___webpack_exports__, __webpack_require__) => {


// UNUSED EXPORTS: clamp, snapValueToStep, toFixedNumber, useControlledState

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
;// ./node_modules/@react-stately/utils/dist/useControlledState.mjs


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
function $458b0a5536c1a7cf$export$40bfa8c7b0832715(value, defaultValue, onChange) {
    let [stateValue, setStateValue] = (0, $3whtM$useState)(value || defaultValue);
    let isControlledRef = (0, $3whtM$useRef)(value !== undefined);
    let isControlled = value !== undefined;
    (0, $3whtM$useEffect)(()=>{
        let wasControlled = isControlledRef.current;
        if (wasControlled !== isControlled && "development" !== 'production') console.warn(`WARN: A component changed from ${wasControlled ? 'controlled' : 'uncontrolled'} to ${isControlled ? 'controlled' : 'uncontrolled'}.`);
        isControlledRef.current = isControlled;
    }, [
        isControlled
    ]);
    let currentValue = isControlled ? value : stateValue;
    let setValue = (0, $3whtM$useCallback)((value, ...args)=>{
        let onChangeCaller = (value, ...onChangeArgs)=>{
            if (onChange) {
                if (!Object.is(currentValue, value)) onChange(value, ...onChangeArgs);
            }
            if (!isControlled) // If uncontrolled, mutate the currentValue local variable so that
            // calling setState multiple times with the same value only emits onChange once.
            // We do not use a ref for this because we specifically _do_ want the value to
            // reset every render, and assigning to a ref in render breaks aborted suspended renders.
            // eslint-disable-next-line react-hooks/exhaustive-deps
            currentValue = value;
        };
        if (typeof value === 'function') {
            if (true) console.warn('We can not support a function callback. See Github Issues for details https://github.com/adobe/react-spectrum/issues/2320');
            // this supports functional updates https://reactjs.org/docs/hooks-reference.html#functional-updates
            // when someone using useControlledState calls setControlledState(myFunc)
            // this will call our useState setState with a function as well which invokes myFunc and calls onChange with the value from myFunc
            // if we're in an uncontrolled state, then we also return the value of myFunc which to setState looks as though it was just called with myFunc from the beginning
            // otherwise we just return the controlled value, which won't cause a rerender because React knows to bail out when the value is the same
            let updateFunction = (oldValue, ...functionArgs)=>{
                let interceptedValue = value(isControlled ? currentValue : oldValue, ...functionArgs);
                onChangeCaller(interceptedValue, ...args);
                if (!isControlled) return interceptedValue;
                return oldValue;
            };
            setStateValue(updateFunction);
        } else {
            if (!isControlled) setStateValue(value);
            onChangeCaller(value, ...args);
        }
    }, [
        isControlled,
        currentValue,
        onChange
    ]);
    return [
        currentValue,
        setValue
    ];
}



//# sourceMappingURL=useControlledState.module.js.map

;// ./node_modules/@react-stately/utils/dist/number.mjs
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
 * Takes a value and forces it to the closest min/max if it's outside. Also forces it to the closest valid step.
 */ function $9446cca9a3875146$export$7d15b64cf5a3a4c4(value, min = -Infinity, max = Infinity) {
    let newValue = Math.min(Math.max(value, min), max);
    return newValue;
}
function $9446cca9a3875146$export$e1a7b8e69ef6c52f(value, step) {
    let roundedValue = value;
    let precision = 0;
    let stepString = step.toString();
    // Handle negative exponents in exponential notation (e.g., "1e-7" → precision 8)
    let eIndex = stepString.toLowerCase().indexOf('e-');
    if (eIndex > 0) precision = Math.abs(Math.floor(Math.log10(Math.abs(step)))) + eIndex;
    else {
        let pointIndex = stepString.indexOf('.');
        if (pointIndex >= 0) precision = stepString.length - pointIndex;
    }
    if (precision > 0) {
        let pow = Math.pow(10, precision);
        roundedValue = Math.round(roundedValue * pow) / pow;
    }
    return roundedValue;
}
function $9446cca9a3875146$export$cb6e0bb50bc19463(value, min, max, step) {
    min = Number(min);
    max = Number(max);
    let remainder = (value - (isNaN(min) ? 0 : min)) % step;
    let snappedValue = $9446cca9a3875146$export$e1a7b8e69ef6c52f(Math.abs(remainder) * 2 >= step ? value + Math.sign(remainder) * (step - Math.abs(remainder)) : value - remainder, step);
    if (!isNaN(min)) {
        if (snappedValue < min) snappedValue = min;
        else if (!isNaN(max) && snappedValue > max) snappedValue = min + Math.floor($9446cca9a3875146$export$e1a7b8e69ef6c52f((max - min) / step, step)) * step;
    } else if (!isNaN(max) && snappedValue > max) snappedValue = Math.floor($9446cca9a3875146$export$e1a7b8e69ef6c52f(max / step, step)) * step;
    // correct floating point behavior by rounding to step precision
    snappedValue = $9446cca9a3875146$export$e1a7b8e69ef6c52f(snappedValue, step);
    return snappedValue;
}
function $9446cca9a3875146$export$b6268554fba451f(value, digits, base = 10) {
    const pow = Math.pow(base, digits);
    return Math.round(value * pow) / pow;
}



//# sourceMappingURL=number.module.js.map

;// ./node_modules/@react-stately/utils/dist/import.mjs



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

/***/ 51738:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* unused harmony export ErrorBar */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _container_Layer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(86069);
/* harmony import */ var _context_ErrorBarContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5298);
/* harmony import */ var _hooks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(33092);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(77404);
/* harmony import */ var _util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(55448);
/* harmony import */ var _context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(19287);
/* harmony import */ var _animation_CSSTransitionAnimate__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(97950);
var _excluded = ["direction", "width", "dataKey", "isAnimationActive", "animationBegin", "animationDuration", "animationEasing"];
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
/**
 * @fileOverview Render a group of error bar
 */










/**
 * So usually the direction is decided by the chart layout.
 * Horizontal layout means error bars are vertical means direction=y
 * Vertical layout means error bars are horizontal means direction=x
 *
 * Except! In Scatter chart, error bars can go both ways.
 *
 * So this property is only ever used in Scatter chart, and ignored elsewhere.
 */

/**
 * External ErrorBar props, visible for users of the library
 */

/**
 * Props after defaults, and required props have been applied.
 */

function ErrorBarImpl(props) {
  var {
      direction,
      width,
      dataKey,
      isAnimationActive,
      animationBegin,
      animationDuration,
      animationEasing
    } = props,
    others = _objectWithoutProperties(props, _excluded);
  var svgProps = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_5__/* .svgPropertiesNoEvents */ .uZ)(others);
  var {
    data,
    dataPointFormatter,
    xAxisId,
    yAxisId,
    errorBarOffset: offset
  } = (0,_context_ErrorBarContext__WEBPACK_IMPORTED_MODULE_2__/* .useErrorBarContext */ .G9)();
  var xAxis = (0,_hooks__WEBPACK_IMPORTED_MODULE_3__/* .useXAxis */ .ZI)(xAxisId);
  var yAxis = (0,_hooks__WEBPACK_IMPORTED_MODULE_3__/* .useYAxis */ .gi)(yAxisId);
  if ((xAxis === null || xAxis === void 0 ? void 0 : xAxis.scale) == null || (yAxis === null || yAxis === void 0 ? void 0 : yAxis.scale) == null || data == null) {
    return null;
  }

  // ErrorBar requires type number XAxis, why?
  if (direction === 'x' && xAxis.type !== 'number') {
    return null;
  }
  var errorBars = data.map(entry => {
    var {
      x,
      y,
      value,
      errorVal
    } = dataPointFormatter(entry, dataKey, direction);
    if (!errorVal || x == null || y == null) {
      return null;
    }
    var lineCoordinates = [];
    var lowBound, highBound;
    if (Array.isArray(errorVal)) {
      [lowBound, highBound] = errorVal;
    } else {
      lowBound = highBound = errorVal;
    }
    if (direction === 'x') {
      // error bar for horizontal charts, the y is fixed, x is a range value
      var {
        scale
      } = xAxis;
      var yMid = y + offset;
      var yMin = yMid + width;
      var yMax = yMid - width;
      var xMin = scale(value - lowBound);
      var xMax = scale(value + highBound);

      // the right line of |--|
      lineCoordinates.push({
        x1: xMax,
        y1: yMin,
        x2: xMax,
        y2: yMax
      });
      // the middle line of |--|
      lineCoordinates.push({
        x1: xMin,
        y1: yMid,
        x2: xMax,
        y2: yMid
      });
      // the left line of |--|
      lineCoordinates.push({
        x1: xMin,
        y1: yMin,
        x2: xMin,
        y2: yMax
      });
    } else if (direction === 'y') {
      // error bar for horizontal charts, the x is fixed, y is a range value
      var {
        scale: _scale
      } = yAxis;
      var xMid = x + offset;
      var _xMin = xMid - width;
      var _xMax = xMid + width;
      var _yMin = _scale(value - lowBound);
      var _yMax = _scale(value + highBound);

      // the top line
      lineCoordinates.push({
        x1: _xMin,
        y1: _yMax,
        x2: _xMax,
        y2: _yMax
      });
      // the middle line
      lineCoordinates.push({
        x1: xMid,
        y1: _yMin,
        x2: xMid,
        y2: _yMax
      });
      // the bottom line
      lineCoordinates.push({
        x1: _xMin,
        y1: _yMin,
        x2: _xMax,
        y2: _yMin
      });
    }
    var scaleDirection = direction === 'x' ? 'scaleX' : 'scaleY';
    var transformOrigin = "".concat(x + offset, "px ").concat(y + offset, "px");
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_1__/* .Layer */ .W, _extends({
      className: "recharts-errorBar",
      key: "bar-".concat(lineCoordinates.map(c => "".concat(c.x1, "-").concat(c.x2, "-").concat(c.y1, "-").concat(c.y2)))
    }, svgProps), lineCoordinates.map(c => {
      var lineStyle = isAnimationActive ? {
        transformOrigin
      } : undefined;
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_animation_CSSTransitionAnimate__WEBPACK_IMPORTED_MODULE_7__/* .CSSTransitionAnimate */ .a, {
        animationId: "error-bar-".concat(direction, "_").concat(c.x1, "-").concat(c.x2, "-").concat(c.y1, "-").concat(c.y2),
        from: "".concat(scaleDirection, "(0)"),
        to: "".concat(scaleDirection, "(1)"),
        attributeName: "transform",
        begin: animationBegin,
        easing: animationEasing,
        isActive: isAnimationActive,
        duration: animationDuration,
        key: "errorbar-".concat(c.x1, "-").concat(c.x2, "-").concat(c.y1, "-").concat(c.y2)
      }, style => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("line", _extends({}, c, {
        style: _objectSpread(_objectSpread({}, lineStyle), style)
      })));
    }));
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_1__/* .Layer */ .W, {
    className: "recharts-errorBars"
  }, errorBars);
}
function useErrorBarDirection(directionFromProps) {
  var layout = (0,_context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_6__/* .useChartLayout */ .WX)();
  if (directionFromProps != null) {
    return directionFromProps;
  }
  if (layout != null) {
    return layout === 'horizontal' ? 'y' : 'x';
  }
  return 'x';
}
var errorBarDefaultProps = {
  stroke: 'black',
  strokeWidth: 1.5,
  width: 5,
  offset: 0,
  isAnimationActive: true,
  animationBegin: 0,
  animationDuration: 400,
  animationEasing: 'ease-in-out'
};
function ErrorBarInternal(props) {
  var realDirection = useErrorBarDirection(props.direction);
  var {
    width,
    isAnimationActive,
    animationBegin,
    animationDuration,
    animationEasing
  } = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_4__/* .resolveDefaultProps */ .e)(props, errorBarDefaultProps);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_ErrorBarContext__WEBPACK_IMPORTED_MODULE_2__/* .ReportErrorBarSettings */ .pU, {
    dataKey: props.dataKey,
    direction: realDirection
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ErrorBarImpl, _extends({}, props, {
    direction: realDirection,
    width: width,
    isAnimationActive: isAnimationActive,
    animationBegin: animationBegin,
    animationDuration: animationDuration,
    animationEasing: animationEasing
  })));
}

// eslint-disable-next-line react/prefer-stateless-function
class ErrorBar extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
  render() {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ErrorBarInternal, this.props);
  }
}
_defineProperty(ErrorBar, "defaultProps", errorBarDefaultProps);
_defineProperty(ErrorBar, "displayName", 'ErrorBar');

/***/ }),

/***/ 69107:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   d: () => (/* binding */ CartesianGrid)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _util_LogUtils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6634);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(59744);
/* harmony import */ var _util_ChartUtils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(33964);
/* harmony import */ var _getTicks__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(11386);
/* harmony import */ var _CartesianAxis__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(99582);
/* harmony import */ var _context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(19287);
/* harmony import */ var _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(11114);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(49082);
/* harmony import */ var _context_PanoramaContext__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(12070);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(77404);
/* harmony import */ var _util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(55448);
var _excluded = ["x1", "y1", "x2", "y2", "key"],
  _excluded2 = ["offset"],
  _excluded3 = ["xAxisId", "yAxisId"],
  _excluded4 = ["xAxisId", "yAxisId"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
/**
 * @fileOverview Cartesian Grid
 */













/**
 * The <CartesianGrid horizontal
 */

var Background = props => {
  var {
    fill
  } = props;
  if (!fill || fill === 'none') {
    return null;
  }
  var {
    fillOpacity,
    x,
    y,
    width,
    height,
    ry
  } = props;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("rect", {
    x: x,
    y: y,
    ry: ry,
    width: width,
    height: height,
    stroke: "none",
    fill: fill,
    fillOpacity: fillOpacity,
    className: "recharts-cartesian-grid-bg"
  });
};
function renderLineItem(option, props) {
  var lineItem;
  if (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(option)) {
    // @ts-expect-error typescript does not see the props type when cloning an element
    lineItem = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(option, props);
  } else if (typeof option === 'function') {
    lineItem = option(props);
  } else {
    var {
        x1,
        y1,
        x2,
        y2,
        key
      } = props,
      others = _objectWithoutProperties(props, _excluded);
    var _svgPropertiesNoEvent = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_11__/* .svgPropertiesNoEvents */ .uZ)(others),
      {
        offset: __
      } = _svgPropertiesNoEvent,
      restOfFilteredProps = _objectWithoutProperties(_svgPropertiesNoEvent, _excluded2);
    lineItem = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("line", _extends({}, restOfFilteredProps, {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      fill: "none",
      key: key
    }));
  }
  return lineItem;
}
function HorizontalGridLines(props) {
  var {
    x,
    width,
    horizontal = true,
    horizontalPoints
  } = props;
  if (!horizontal || !horizontalPoints || !horizontalPoints.length) {
    return null;
  }
  var {
      xAxisId,
      yAxisId
    } = props,
    otherLineItemProps = _objectWithoutProperties(props, _excluded3);
  var items = horizontalPoints.map((entry, i) => {
    var lineItemProps = _objectSpread(_objectSpread({}, otherLineItemProps), {}, {
      x1: x,
      y1: entry,
      x2: x + width,
      y2: entry,
      key: "line-".concat(i),
      index: i
    });
    return renderLineItem(horizontal, lineItemProps);
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("g", {
    className: "recharts-cartesian-grid-horizontal"
  }, items);
}
function VerticalGridLines(props) {
  var {
    y,
    height,
    vertical = true,
    verticalPoints
  } = props;
  if (!vertical || !verticalPoints || !verticalPoints.length) {
    return null;
  }
  var {
      xAxisId,
      yAxisId
    } = props,
    otherLineItemProps = _objectWithoutProperties(props, _excluded4);
  var items = verticalPoints.map((entry, i) => {
    var lineItemProps = _objectSpread(_objectSpread({}, otherLineItemProps), {}, {
      x1: entry,
      y1: y,
      x2: entry,
      y2: y + height,
      key: "line-".concat(i),
      index: i
    });
    return renderLineItem(vertical, lineItemProps);
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("g", {
    className: "recharts-cartesian-grid-vertical"
  }, items);
}
function HorizontalStripes(props) {
  var {
    horizontalFill,
    fillOpacity,
    x,
    y,
    width,
    height,
    horizontalPoints,
    horizontal = true
  } = props;
  if (!horizontal || !horizontalFill || !horizontalFill.length) {
    return null;
  }

  // Why =y -y? I was trying to find any difference that this makes, with floating point numbers and edge cases but ... nothing.
  var roundedSortedHorizontalPoints = horizontalPoints.map(e => Math.round(e + y - y)).sort((a, b) => a - b);
  // Why is this condition `!==` instead of `<=` ?
  if (y !== roundedSortedHorizontalPoints[0]) {
    roundedSortedHorizontalPoints.unshift(0);
  }
  var items = roundedSortedHorizontalPoints.map((entry, i) => {
    // Why do we strip only the last stripe if it is invisible, and not all invisible stripes?
    var lastStripe = !roundedSortedHorizontalPoints[i + 1];
    var lineHeight = lastStripe ? y + height - entry : roundedSortedHorizontalPoints[i + 1] - entry;
    if (lineHeight <= 0) {
      return null;
    }
    var colorIndex = i % horizontalFill.length;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("rect", {
      key: "react-".concat(i) // eslint-disable-line react/no-array-index-key
      ,
      y: entry,
      x: x,
      height: lineHeight,
      width: width,
      stroke: "none",
      fill: horizontalFill[colorIndex],
      fillOpacity: fillOpacity,
      className: "recharts-cartesian-grid-bg"
    });
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("g", {
    className: "recharts-cartesian-gridstripes-horizontal"
  }, items);
}
function VerticalStripes(props) {
  var {
    vertical = true,
    verticalFill,
    fillOpacity,
    x,
    y,
    width,
    height,
    verticalPoints
  } = props;
  if (!vertical || !verticalFill || !verticalFill.length) {
    return null;
  }
  var roundedSortedVerticalPoints = verticalPoints.map(e => Math.round(e + x - x)).sort((a, b) => a - b);
  if (x !== roundedSortedVerticalPoints[0]) {
    roundedSortedVerticalPoints.unshift(0);
  }
  var items = roundedSortedVerticalPoints.map((entry, i) => {
    var lastStripe = !roundedSortedVerticalPoints[i + 1];
    var lineWidth = lastStripe ? x + width - entry : roundedSortedVerticalPoints[i + 1] - entry;
    if (lineWidth <= 0) {
      return null;
    }
    var colorIndex = i % verticalFill.length;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("rect", {
      key: "react-".concat(i) // eslint-disable-line react/no-array-index-key
      ,
      x: entry,
      y: y,
      width: lineWidth,
      height: height,
      stroke: "none",
      fill: verticalFill[colorIndex],
      fillOpacity: fillOpacity,
      className: "recharts-cartesian-grid-bg"
    });
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("g", {
    className: "recharts-cartesian-gridstripes-vertical"
  }, items);
}
var defaultVerticalCoordinatesGenerator = (_ref, syncWithTicks) => {
  var {
    xAxis,
    width,
    height,
    offset
  } = _ref;
  return (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_3__/* .getCoordinatesOfGrid */ .PW)((0,_getTicks__WEBPACK_IMPORTED_MODULE_4__/* .getTicks */ .f)(_objectSpread(_objectSpread(_objectSpread({}, _CartesianAxis__WEBPACK_IMPORTED_MODULE_5__/* .defaultCartesianAxisProps */ .F), xAxis), {}, {
    ticks: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_3__/* .getTicksOfAxis */ .Rh)(xAxis, true),
    viewBox: {
      x: 0,
      y: 0,
      width,
      height
    }
  })), offset.left, offset.left + offset.width, syncWithTicks);
};
var defaultHorizontalCoordinatesGenerator = (_ref2, syncWithTicks) => {
  var {
    yAxis,
    width,
    height,
    offset
  } = _ref2;
  return (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_3__/* .getCoordinatesOfGrid */ .PW)((0,_getTicks__WEBPACK_IMPORTED_MODULE_4__/* .getTicks */ .f)(_objectSpread(_objectSpread(_objectSpread({}, _CartesianAxis__WEBPACK_IMPORTED_MODULE_5__/* .defaultCartesianAxisProps */ .F), yAxis), {}, {
    ticks: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_3__/* .getTicksOfAxis */ .Rh)(yAxis, true),
    viewBox: {
      x: 0,
      y: 0,
      width,
      height
    }
  })), offset.top, offset.top + offset.height, syncWithTicks);
};
var defaultProps = {
  horizontal: true,
  vertical: true,
  // The ordinates of horizontal grid lines
  horizontalPoints: [],
  // The abscissas of vertical grid lines
  verticalPoints: [],
  stroke: '#ccc',
  fill: 'none',
  // The fill of colors of grid lines
  verticalFill: [],
  horizontalFill: [],
  xAxisId: 0,
  yAxisId: 0
};
function CartesianGrid(props) {
  var chartWidth = (0,_context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_6__/* .useChartWidth */ .yi)();
  var chartHeight = (0,_context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_6__/* .useChartHeight */ .rY)();
  var offset = (0,_context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_6__/* .useOffsetInternal */ .W7)();
  var propsIncludingDefaults = _objectSpread(_objectSpread({}, (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_10__/* .resolveDefaultProps */ .e)(props, defaultProps)), {}, {
    x: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_2__/* .isNumber */ .Et)(props.x) ? props.x : offset.left,
    y: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_2__/* .isNumber */ .Et)(props.y) ? props.y : offset.top,
    width: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_2__/* .isNumber */ .Et)(props.width) ? props.width : offset.width,
    height: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_2__/* .isNumber */ .Et)(props.height) ? props.height : offset.height
  });
  var {
    xAxisId,
    yAxisId,
    x,
    y,
    width,
    height,
    syncWithTicks,
    horizontalValues,
    verticalValues
  } = propsIncludingDefaults;
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_9__/* .useIsPanorama */ .r)();
  var xAxis = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_8__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_7__/* .selectAxisPropsNeededForCartesianGridTicksGenerator */ .ZB)(state, 'xAxis', xAxisId, isPanorama));
  var yAxis = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_8__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_7__/* .selectAxisPropsNeededForCartesianGridTicksGenerator */ .ZB)(state, 'yAxis', yAxisId, isPanorama));
  if (!(0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_2__/* .isNumber */ .Et)(width) || width <= 0 || !(0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_2__/* .isNumber */ .Et)(height) || height <= 0 || !(0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_2__/* .isNumber */ .Et)(x) || x !== +x || !(0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_2__/* .isNumber */ .Et)(y) || y !== +y) {
    return null;
  }

  /*
   * verticalCoordinatesGenerator and horizontalCoordinatesGenerator are defined
   * outside the propsIncludingDefaults because they were never part of the original props
   * and they were never passed as a prop down to horizontal/vertical custom elements.
   * If we add these two to propsIncludingDefaults then we are changing public API.
   * Not a bad thing per se but also not necessary.
   */
  var verticalCoordinatesGenerator = propsIncludingDefaults.verticalCoordinatesGenerator || defaultVerticalCoordinatesGenerator;
  var horizontalCoordinatesGenerator = propsIncludingDefaults.horizontalCoordinatesGenerator || defaultHorizontalCoordinatesGenerator;
  var {
    horizontalPoints,
    verticalPoints
  } = propsIncludingDefaults;

  // No horizontal points are specified
  if ((!horizontalPoints || !horizontalPoints.length) && typeof horizontalCoordinatesGenerator === 'function') {
    var isHorizontalValues = horizontalValues && horizontalValues.length;
    var generatorResult = horizontalCoordinatesGenerator({
      yAxis: yAxis ? _objectSpread(_objectSpread({}, yAxis), {}, {
        ticks: isHorizontalValues ? horizontalValues : yAxis.ticks
      }) : undefined,
      width: chartWidth,
      height: chartHeight,
      offset
    }, isHorizontalValues ? true : syncWithTicks);
    (0,_util_LogUtils__WEBPACK_IMPORTED_MODULE_1__/* .warn */ .R)(Array.isArray(generatorResult), "horizontalCoordinatesGenerator should return Array but instead it returned [".concat(typeof generatorResult, "]"));
    if (Array.isArray(generatorResult)) {
      horizontalPoints = generatorResult;
    }
  }

  // No vertical points are specified
  if ((!verticalPoints || !verticalPoints.length) && typeof verticalCoordinatesGenerator === 'function') {
    var isVerticalValues = verticalValues && verticalValues.length;
    var _generatorResult = verticalCoordinatesGenerator({
      xAxis: xAxis ? _objectSpread(_objectSpread({}, xAxis), {}, {
        ticks: isVerticalValues ? verticalValues : xAxis.ticks
      }) : undefined,
      width: chartWidth,
      height: chartHeight,
      offset
    }, isVerticalValues ? true : syncWithTicks);
    (0,_util_LogUtils__WEBPACK_IMPORTED_MODULE_1__/* .warn */ .R)(Array.isArray(_generatorResult), "verticalCoordinatesGenerator should return Array but instead it returned [".concat(typeof _generatorResult, "]"));
    if (Array.isArray(_generatorResult)) {
      verticalPoints = _generatorResult;
    }
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("g", {
    className: "recharts-cartesian-grid"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(Background, {
    fill: propsIncludingDefaults.fill,
    fillOpacity: propsIncludingDefaults.fillOpacity,
    x: propsIncludingDefaults.x,
    y: propsIncludingDefaults.y,
    width: propsIncludingDefaults.width,
    height: propsIncludingDefaults.height,
    ry: propsIncludingDefaults.ry
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(HorizontalStripes, _extends({}, propsIncludingDefaults, {
    horizontalPoints: horizontalPoints
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(VerticalStripes, _extends({}, propsIncludingDefaults, {
    verticalPoints: verticalPoints
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(HorizontalGridLines, _extends({}, propsIncludingDefaults, {
    offset: offset,
    horizontalPoints: horizontalPoints,
    xAxis: xAxis,
    yAxis: yAxis
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(VerticalGridLines, _extends({}, propsIncludingDefaults, {
    offset: offset,
    verticalPoints: verticalPoints,
    xAxis: xAxis,
    yAxis: yAxis
  })));
}
CartesianGrid.displayName = 'CartesianGrid';

/***/ }),

/***/ 84124:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Gk: () => (/* binding */ Area),
/* harmony export */   Vf: () => (/* binding */ computeArea)
/* harmony export */ });
/* unused harmony export getBaseValue */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34164);
/* harmony import */ var _shape_Curve__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(45249);
/* harmony import */ var _shape_Dot__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(66613);
/* harmony import */ var _container_Layer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(86069);
/* harmony import */ var _component_LabelList__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(5614);
/* harmony import */ var _util_Global__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(59938);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(59744);
/* harmony import */ var _util_ChartUtils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(33964);
/* harmony import */ var _util_ReactUtils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(94501);
/* harmony import */ var _component_ActivePoints__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(85695);
/* harmony import */ var _state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(59482);
/* harmony import */ var _GraphicalItemClipPath__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(31754);
/* harmony import */ var _state_selectors_areaSelectors__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(25386);
/* harmony import */ var _context_PanoramaContext__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(12070);
/* harmony import */ var _context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(19287);
/* harmony import */ var _state_selectors_selectors__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(87997);
/* harmony import */ var _state_SetLegendPayload__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(19797);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(49082);
/* harmony import */ var _util_useAnimationId__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(8107);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(77404);
/* harmony import */ var _util_isWellBehavedNumber__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(8813);
/* harmony import */ var _hooks__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(33092);
/* harmony import */ var _context_RegisterGraphicalItemId__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(84044);
/* harmony import */ var _state_SetGraphicalItem__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(42678);
/* harmony import */ var _util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(55448);
/* harmony import */ var _animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(31528);
/* harmony import */ var _util_getRadiusAndStrokeWidthFromDot__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(99989);
/* harmony import */ var _util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(80196);
var _excluded = ["id"],
  _excluded2 = ["activeDot", "animationBegin", "animationDuration", "animationEasing", "connectNulls", "dot", "fill", "fillOpacity", "hide", "isAnimationActive", "legendType", "stroke", "xAxisId", "yAxisId"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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

function getLegendItemColor(stroke, fill) {
  return stroke && stroke !== 'none' ? stroke : fill;
}
var computeLegendPayloadFromAreaData = props => {
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
    value: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_8__/* .getTooltipNameProp */ .uM)(name, dataKey),
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
      name: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_8__/* .getTooltipNameProp */ .uM)(name, dataKey),
      hide,
      type: props.tooltipType,
      color: getLegendItemColor(stroke, fill),
      unit
    }
  };
}
var renderDotItem = (option, props) => {
  var dotItem;
  if (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(option)) {
    // @ts-expect-error when cloning, the event handler types do not match
    dotItem = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(option, props);
  } else if (typeof option === 'function') {
    dotItem = option(props);
  } else {
    var className = (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)('recharts-area-dot', typeof option !== 'boolean' ? option.className : '');
    dotItem = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_shape_Dot__WEBPACK_IMPORTED_MODULE_3__/* .Dot */ .c, _extends({}, props, {
      className: className
    }));
  }
  return dotItem;
};
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
    needClip,
    dot,
    dataKey
  } = props;
  if (!shouldRenderDots(points, dot)) {
    return null;
  }
  var clipDot = (0,_util_ReactUtils__WEBPACK_IMPORTED_MODULE_9__/* .isClipDot */ .y$)(dot);
  var areaProps = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_25__/* .svgPropertiesNoEvents */ .uZ)(props);
  var customDotProps = (0,_util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_28__/* .svgPropertiesAndEventsFromUnknown */ .y)(dot);
  var dots = points.map((entry, i) => {
    var dotProps = _objectSpread(_objectSpread(_objectSpread({
      key: "dot-".concat(i),
      r: 3
    }, areaProps), customDotProps), {}, {
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
    className: "recharts-area-dots"
  }, dotsProps), dots);
}
function AreaLabelListProvider(_ref2) {
  var {
    showLabels,
    children,
    points
  } = _ref2;
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
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_LabelList__WEBPACK_IMPORTED_MODULE_5__/* .CartesianLabelListContextProvider */ .h8, {
    value: showLabels ? labelListEntries : null
  }, children);
}
function StaticArea(_ref3) {
  var {
    points,
    baseLine,
    needClip,
    clipPathId,
    props
  } = _ref3;
  var {
    layout,
    type,
    stroke,
    connectNulls,
    isRange
  } = props;
  var {
      id
    } = props,
    propsWithoutId = _objectWithoutProperties(props, _excluded);
  var allOtherProps = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_25__/* .svgPropertiesNoEvents */ .uZ)(propsWithoutId);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (points === null || points === void 0 ? void 0 : points.length) > 1 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_4__/* .Layer */ .W, {
    clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : undefined
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_shape_Curve__WEBPACK_IMPORTED_MODULE_2__/* .Curve */ .I, _extends({}, allOtherProps, {
    id: id,
    points: points,
    connectNulls: connectNulls,
    type: type,
    baseLine: baseLine,
    layout: layout,
    stroke: "none",
    className: "recharts-area-area"
  })), stroke !== 'none' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_shape_Curve__WEBPACK_IMPORTED_MODULE_2__/* .Curve */ .I, _extends({}, allOtherProps, {
    className: "recharts-area-curve",
    layout: layout,
    type: type,
    connectNulls: connectNulls,
    fill: "none",
    points: points
  })), stroke !== 'none' && isRange && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_shape_Curve__WEBPACK_IMPORTED_MODULE_2__/* .Curve */ .I, _extends({}, allOtherProps, {
    className: "recharts-area-curve",
    layout: layout,
    type: type,
    connectNulls: connectNulls,
    fill: "none",
    points: baseLine
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(Dots, {
    points: points,
    props: propsWithoutId,
    clipPathId: clipPathId
  }));
}
function VerticalRect(_ref4) {
  var {
    alpha,
    baseLine,
    points,
    strokeWidth
  } = _ref4;
  var startY = points[0].y;
  var endY = points[points.length - 1].y;
  if (!(0,_util_isWellBehavedNumber__WEBPACK_IMPORTED_MODULE_21__/* .isWellBehavedNumber */ .H)(startY) || !(0,_util_isWellBehavedNumber__WEBPACK_IMPORTED_MODULE_21__/* .isWellBehavedNumber */ .H)(endY)) {
    return null;
  }
  var height = alpha * Math.abs(startY - endY);
  var maxX = Math.max(...points.map(entry => entry.x || 0));
  if ((0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_7__/* .isNumber */ .Et)(baseLine)) {
    maxX = Math.max(baseLine, maxX);
  } else if (baseLine && Array.isArray(baseLine) && baseLine.length) {
    maxX = Math.max(...baseLine.map(entry => entry.x || 0), maxX);
  }
  if ((0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_7__/* .isNumber */ .Et)(maxX)) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("rect", {
      x: 0,
      y: startY < endY ? startY : startY - height,
      width: maxX + (strokeWidth ? parseInt("".concat(strokeWidth), 10) : 1),
      height: Math.floor(height)
    });
  }
  return null;
}
function HorizontalRect(_ref5) {
  var {
    alpha,
    baseLine,
    points,
    strokeWidth
  } = _ref5;
  var startX = points[0].x;
  var endX = points[points.length - 1].x;
  if (!(0,_util_isWellBehavedNumber__WEBPACK_IMPORTED_MODULE_21__/* .isWellBehavedNumber */ .H)(startX) || !(0,_util_isWellBehavedNumber__WEBPACK_IMPORTED_MODULE_21__/* .isWellBehavedNumber */ .H)(endX)) {
    return null;
  }
  var width = alpha * Math.abs(startX - endX);
  var maxY = Math.max(...points.map(entry => entry.y || 0));
  if ((0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_7__/* .isNumber */ .Et)(baseLine)) {
    maxY = Math.max(baseLine, maxY);
  } else if (baseLine && Array.isArray(baseLine) && baseLine.length) {
    maxY = Math.max(...baseLine.map(entry => entry.y || 0), maxY);
  }
  if ((0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_7__/* .isNumber */ .Et)(maxY)) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("rect", {
      x: startX < endX ? startX : startX - width,
      y: 0,
      width: width,
      height: Math.floor(maxY + (strokeWidth ? parseInt("".concat(strokeWidth), 10) : 1))
    });
  }
  return null;
}
function ClipRect(_ref6) {
  var {
    alpha,
    layout,
    points,
    baseLine,
    strokeWidth
  } = _ref6;
  if (layout === 'vertical') {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(VerticalRect, {
      alpha: alpha,
      points: points,
      baseLine: baseLine,
      strokeWidth: strokeWidth
    });
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(HorizontalRect, {
    alpha: alpha,
    points: points,
    baseLine: baseLine,
    strokeWidth: strokeWidth
  });
}
function AreaWithAnimation(_ref7) {
  var {
    needClip,
    clipPathId,
    props,
    previousPointsRef,
    previousBaselineRef
  } = _ref7;
  var {
    points,
    baseLine,
    isAnimationActive,
    animationBegin,
    animationDuration,
    animationEasing,
    onAnimationStart,
    onAnimationEnd
  } = props;
  var animationId = (0,_util_useAnimationId__WEBPACK_IMPORTED_MODULE_19__/* .useAnimationId */ .n)(props, 'recharts-area-');
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
  var prevPoints = previousPointsRef.current;
  var prevBaseLine = previousBaselineRef.current;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(AreaLabelListProvider, {
    showLabels: showLabels,
    points: points
  }, props.children, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_26__/* .JavascriptAnimate */ .J, {
    animationId: animationId,
    begin: animationBegin,
    duration: animationDuration,
    isActive: isAnimationActive,
    easing: animationEasing,
    onAnimationEnd: handleAnimationEnd,
    onAnimationStart: handleAnimationStart,
    key: animationId
  }, t => {
    if (prevPoints) {
      var prevPointsDiffFactor = prevPoints.length / points.length;
      var stepPoints =
      /*
       * Here it is important that at the very end of the animation, on the last frame,
       * we render the original points without any interpolation.
       * This is needed because the code above is checking for reference equality to decide if the animation should run
       * and if we create a new array instance (even if the numbers were the same)
       * then we would break animations.
       */
      t === 1 ? points : points.map((entry, index) => {
        var prevPointIndex = Math.floor(index * prevPointsDiffFactor);
        if (prevPoints[prevPointIndex]) {
          var prev = prevPoints[prevPointIndex];
          return _objectSpread(_objectSpread({}, entry), {}, {
            x: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_7__/* .interpolate */ .GW)(prev.x, entry.x, t),
            y: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_7__/* .interpolate */ .GW)(prev.y, entry.y, t)
          });
        }
        return entry;
      });
      var stepBaseLine;
      if ((0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_7__/* .isNumber */ .Et)(baseLine)) {
        stepBaseLine = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_7__/* .interpolate */ .GW)(prevBaseLine, baseLine, t);
      } else if ((0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_7__/* .isNullish */ .uy)(baseLine) || (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_7__/* .isNan */ .M8)(baseLine)) {
        stepBaseLine = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_7__/* .interpolate */ .GW)(prevBaseLine, 0, t);
      } else {
        stepBaseLine = baseLine.map((entry, index) => {
          var prevPointIndex = Math.floor(index * prevPointsDiffFactor);
          if (Array.isArray(prevBaseLine) && prevBaseLine[prevPointIndex]) {
            var prev = prevBaseLine[prevPointIndex];
            return _objectSpread(_objectSpread({}, entry), {}, {
              x: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_7__/* .interpolate */ .GW)(prev.x, entry.x, t),
              y: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_7__/* .interpolate */ .GW)(prev.y, entry.y, t)
            });
          }
          return entry;
        });
      }
      if (t > 0) {
        /*
         * We need to keep the refs in the parent component because we need to remember the last shape of the animation
         * even if AreaWithAnimation is unmounted as that happens when changing props.
         *
         * And we need to update the refs here because here is where the interpolation is computed.
         * Eslint doesn't like changing function arguments, but we need it so here is an eslint-disable.
         */
        // eslint-disable-next-line no-param-reassign
        previousPointsRef.current = stepPoints;
        // eslint-disable-next-line no-param-reassign
        previousBaselineRef.current = stepBaseLine;
      }
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(StaticArea, {
        points: stepPoints,
        baseLine: stepBaseLine,
        needClip: needClip,
        clipPathId: clipPathId,
        props: props
      });
    }
    if (t > 0) {
      // eslint-disable-next-line no-param-reassign
      previousPointsRef.current = points;
      // eslint-disable-next-line no-param-reassign
      previousBaselineRef.current = baseLine;
    }
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_4__/* .Layer */ .W, null, isAnimationActive && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("defs", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("clipPath", {
      id: "animationClipPath-".concat(clipPathId)
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ClipRect, {
      alpha: t,
      points: points,
      baseLine: baseLine,
      layout: props.layout,
      strokeWidth: props.strokeWidth
    }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_4__/* .Layer */ .W, {
      clipPath: "url(#animationClipPath-".concat(clipPathId, ")")
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(StaticArea, {
      points: points,
      baseLine: baseLine,
      needClip: needClip,
      clipPathId: clipPathId,
      props: props
    })));
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_LabelList__WEBPACK_IMPORTED_MODULE_5__/* .LabelListFromLabelProp */ .qY, {
    label: props.label
  }));
}

/*
 * This components decides if the area should be animated or not.
 * It also holds the state of the animation.
 */
function RenderArea(_ref8) {
  var {
    needClip,
    clipPathId,
    props
  } = _ref8;
  /*
   * These two must be refs, not state!
   * Because we want to store the most recent shape of the animation in case we have to interrupt the animation;
   * that happens when user initiates another animation before the current one finishes.
   *
   * If this was a useState, then every step in the animation would trigger a re-render.
   * So, useRef it is.
   */
  var previousPointsRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  var previousBaselineRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)();
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(AreaWithAnimation, {
    needClip: needClip,
    clipPathId: clipPathId,
    props: props,
    previousPointsRef: previousPointsRef,
    previousBaselineRef: previousBaselineRef
  });
}
class AreaWithState extends react__WEBPACK_IMPORTED_MODULE_0__.PureComponent {
  render() {
    var {
      hide,
      dot,
      points,
      className,
      top,
      left,
      needClip,
      xAxisId,
      yAxisId,
      width,
      height,
      id,
      baseLine
    } = this.props;
    if (hide) {
      return null;
    }
    var layerClass = (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)('recharts-area', className);
    var clipPathId = id;
    var {
      r,
      strokeWidth
    } = (0,_util_getRadiusAndStrokeWidthFromDot__WEBPACK_IMPORTED_MODULE_27__/* .getRadiusAndStrokeWidthFromDot */ .x)(dot);
    var clipDot = (0,_util_ReactUtils__WEBPACK_IMPORTED_MODULE_9__/* .isClipDot */ .y$)(dot);
    var dotSize = r * 2 + strokeWidth;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_4__/* .Layer */ .W, {
      className: layerClass
    }, needClip && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("defs", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_GraphicalItemClipPath__WEBPACK_IMPORTED_MODULE_12__/* .GraphicalItemClipPath */ .Q, {
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
    }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(RenderArea, {
      needClip: needClip,
      clipPathId: clipPathId,
      props: this.props
    })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_ActivePoints__WEBPACK_IMPORTED_MODULE_10__/* .ActivePoints */ .W, {
      points: points,
      mainColor: getLegendItemColor(this.props.stroke, this.props.fill),
      itemDataKey: this.props.dataKey,
      activeDot: this.props.activeDot
    }), this.props.isRange && Array.isArray(baseLine) && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_ActivePoints__WEBPACK_IMPORTED_MODULE_10__/* .ActivePoints */ .W, {
      points: baseLine,
      mainColor: getLegendItemColor(this.props.stroke, this.props.fill),
      itemDataKey: this.props.dataKey,
      activeDot: this.props.activeDot
    }));
  }
}
var defaultAreaProps = {
  activeDot: true,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'ease',
  connectNulls: false,
  dot: false,
  fill: '#3182bd',
  fillOpacity: 0.6,
  hide: false,
  isAnimationActive: !_util_Global__WEBPACK_IMPORTED_MODULE_6__/* .Global */ .m.isSsr,
  legendType: 'line',
  stroke: '#3182bd',
  xAxisId: 0,
  yAxisId: 0
};
function AreaImpl(props) {
  var _useAppSelector;
  var _resolveDefaultProps = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_20__/* .resolveDefaultProps */ .e)(props, defaultAreaProps),
    {
      activeDot,
      animationBegin,
      animationDuration,
      animationEasing,
      connectNulls,
      dot,
      fill,
      fillOpacity,
      hide,
      isAnimationActive,
      legendType,
      stroke,
      xAxisId,
      yAxisId
    } = _resolveDefaultProps,
    everythingElse = _objectWithoutProperties(_resolveDefaultProps, _excluded2);
  var layout = (0,_context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_15__/* .useChartLayout */ .WX)();
  var chartName = (0,_state_selectors_selectors__WEBPACK_IMPORTED_MODULE_16__/* .useChartName */ .fW)();
  var {
    needClip
  } = (0,_GraphicalItemClipPath__WEBPACK_IMPORTED_MODULE_12__/* .useNeedsClip */ .l)(xAxisId, yAxisId);
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_14__/* .useIsPanorama */ .r)();
  var {
    points,
    isRange,
    baseLine
  } = (_useAppSelector = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_18__/* .useAppSelector */ .G)(state => (0,_state_selectors_areaSelectors__WEBPACK_IMPORTED_MODULE_13__/* .selectArea */ .k)(state, xAxisId, yAxisId, isPanorama, props.id))) !== null && _useAppSelector !== void 0 ? _useAppSelector : {};
  var plotArea = (0,_hooks__WEBPACK_IMPORTED_MODULE_22__/* .usePlotArea */ .oM)();
  if (layout !== 'horizontal' && layout !== 'vertical' || plotArea == null) {
    // Can't render Area in an unsupported layout
    return null;
  }
  if (chartName !== 'AreaChart' && chartName !== 'ComposedChart') {
    // There is nothing stopping us from rendering Area in other charts, except for historical reasons. Do we want to allow that?
    return null;
  }
  var {
    height,
    width,
    x: left,
    y: top
  } = plotArea;
  if (!points || !points.length) {
    return null;
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(AreaWithState, _extends({}, everythingElse, {
    activeDot: activeDot,
    animationBegin: animationBegin,
    animationDuration: animationDuration,
    animationEasing: animationEasing,
    baseLine: baseLine,
    connectNulls: connectNulls,
    dot: dot,
    fill: fill,
    fillOpacity: fillOpacity,
    height: height,
    hide: hide,
    layout: layout,
    isAnimationActive: isAnimationActive,
    isRange: isRange,
    legendType: legendType,
    needClip: needClip,
    points: points,
    stroke: stroke,
    width: width,
    left: left,
    top: top,
    xAxisId: xAxisId,
    yAxisId: yAxisId
  }));
}
var getBaseValue = (layout, chartBaseValue, itemBaseValue, xAxis, yAxis) => {
  // The baseValue can be defined both on the AreaChart, and on the Area.
  // The value for the item takes precedence.
  var baseValue = itemBaseValue !== null && itemBaseValue !== void 0 ? itemBaseValue : chartBaseValue;
  if ((0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_7__/* .isNumber */ .Et)(baseValue)) {
    return baseValue;
  }
  var numericAxis = layout === 'horizontal' ? yAxis : xAxis;
  // @ts-expect-error d3scale .domain() returns unknown, Math.max expects number
  var domain = numericAxis.scale.domain();
  if (numericAxis.type === 'number') {
    var domainMax = Math.max(domain[0], domain[1]);
    var domainMin = Math.min(domain[0], domain[1]);
    if (baseValue === 'dataMin') {
      return domainMin;
    }
    if (baseValue === 'dataMax') {
      return domainMax;
    }
    return domainMax < 0 ? domainMax : Math.max(Math.min(domain[0], domain[1]), 0);
  }
  if (baseValue === 'dataMin') {
    return domain[0];
  }
  if (baseValue === 'dataMax') {
    return domain[1];
  }
  return domain[0];
};
function computeArea(_ref9) {
  var {
    areaSettings: {
      connectNulls,
      baseValue: itemBaseValue,
      dataKey
    },
    stackedData,
    layout,
    chartBaseValue,
    xAxis,
    yAxis,
    displayedData,
    dataStartIndex,
    xAxisTicks,
    yAxisTicks,
    bandSize
  } = _ref9;
  var hasStack = stackedData && stackedData.length;
  var baseValue = getBaseValue(layout, chartBaseValue, itemBaseValue, xAxis, yAxis);
  var isHorizontalLayout = layout === 'horizontal';
  var isRange = false;
  var points = displayedData.map((entry, index) => {
    var value;
    if (hasStack) {
      value = stackedData[dataStartIndex + index];
    } else {
      value = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_8__/* .getValueByDataKey */ .kr)(entry, dataKey);
      if (!Array.isArray(value)) {
        value = [baseValue, value];
      } else {
        isRange = true;
      }
    }
    var isBreakPoint = value[1] == null || hasStack && !connectNulls && (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_8__/* .getValueByDataKey */ .kr)(entry, dataKey) == null;
    if (isHorizontalLayout) {
      return {
        x: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_8__/* .getCateCoordinateOfLine */ .nb)({
          axis: xAxis,
          ticks: xAxisTicks,
          bandSize,
          entry,
          index
        }),
        y: isBreakPoint ? null : yAxis.scale(value[1]),
        value,
        payload: entry
      };
    }
    return {
      x: isBreakPoint ? null : xAxis.scale(value[1]),
      y: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_8__/* .getCateCoordinateOfLine */ .nb)({
        axis: yAxis,
        ticks: yAxisTicks,
        bandSize,
        entry,
        index
      }),
      value,
      payload: entry
    };
  });
  var baseLine;
  if (hasStack || isRange) {
    baseLine = points.map(entry => {
      var x = Array.isArray(entry.value) ? entry.value[0] : null;
      if (isHorizontalLayout) {
        return {
          x: entry.x,
          y: x != null && entry.y != null ? yAxis.scale(x) : null,
          payload: entry.payload
        };
      }
      return {
        x: x != null ? xAxis.scale(x) : null,
        y: entry.y,
        payload: entry.payload
      };
    });
  } else {
    baseLine = isHorizontalLayout ? yAxis.scale(baseValue) : xAxis.scale(baseValue);
  }
  return {
    points,
    baseLine,
    isRange
  };
}
function AreaFn(outsideProps) {
  var props = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_20__/* .resolveDefaultProps */ .e)(outsideProps, defaultAreaProps);
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_14__/* .useIsPanorama */ .r)();
  // Report all props to Redux store first, before calling any hooks, to avoid circular dependencies.
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_RegisterGraphicalItemId__WEBPACK_IMPORTED_MODULE_23__/* .RegisterGraphicalItemId */ .x, {
    id: props.id,
    type: "area"
  }, id => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetLegendPayload__WEBPACK_IMPORTED_MODULE_17__/* .SetLegendPayload */ .A, {
    legendPayload: computeLegendPayloadFromAreaData(props)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_11__/* .SetTooltipEntrySettings */ .r, {
    fn: getTooltipEntrySettings,
    args: props
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetGraphicalItem__WEBPACK_IMPORTED_MODULE_24__/* .SetCartesianGraphicalItem */ .p, {
    type: "area",
    id: id,
    data: props.data,
    dataKey: props.dataKey,
    xAxisId: props.xAxisId,
    yAxisId: props.yAxisId,
    zAxisId: 0,
    stackId: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_8__/* .getNormalizedStackId */ .$8)(props.stackId),
    hide: props.hide,
    barSize: undefined,
    baseValue: props.baseValue,
    isPanorama: isPanorama,
    connectNulls: props.connectNulls
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(AreaImpl, _extends({}, props, {
    id: id
  }))));
}
var Area = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.memo(AreaFn);
Area.displayName = 'Area';

/***/ }),

/***/ 93399:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Nf: () => (/* binding */ $f4e2df6bd15f8569$export$98658e8c59125e6a)
/* harmony export */ });
/* unused harmony exports enableTableNestedRows, tableNestedRows, enableShadowDOM */
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
 */ let $f4e2df6bd15f8569$var$_tableNestedRows = false;
let $f4e2df6bd15f8569$var$_shadowDOM = false;
function $f4e2df6bd15f8569$export$d9d8a0f82de49530() {
    $f4e2df6bd15f8569$var$_tableNestedRows = true;
}
function $f4e2df6bd15f8569$export$1b00cb14a96194e6() {
    return $f4e2df6bd15f8569$var$_tableNestedRows;
}
function $f4e2df6bd15f8569$export$12b151d9882e9985() {
    $f4e2df6bd15f8569$var$_shadowDOM = true;
}
function $f4e2df6bd15f8569$export$98658e8c59125e6a() {
    return $f4e2df6bd15f8569$var$_shadowDOM;
}



//# sourceMappingURL=module.js.map


/***/ }),

/***/ 97950:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   a: () => (/* binding */ CSSTransitionAnimate)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var es_toolkit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(68866);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(77404);
/* harmony import */ var _useAnimationManager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(23014);
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(23929);





var defaultProps = {
  begin: 0,
  duration: 1000,
  easing: 'ease',
  isActive: true,
  canBegin: true,
  onAnimationEnd: () => {},
  onAnimationStart: () => {}
};
function CSSTransitionAnimate(outsideProps) {
  var props = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_2__/* .resolveDefaultProps */ .e)(outsideProps, defaultProps);
  var {
    animationId,
    from,
    to,
    attributeName,
    isActive,
    canBegin,
    duration,
    easing,
    begin,
    onAnimationEnd,
    onAnimationStart: onAnimationStartFromProps,
    children
  } = props;
  var animationManager = (0,_useAnimationManager__WEBPACK_IMPORTED_MODULE_3__/* .useAnimationManager */ .L)(animationId + attributeName, props.animationManager);
  var [style, setStyle] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(() => {
    if (!isActive) {
      return to;
    }
    return from;
  });
  var initialized = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(false);
  var onAnimationStart = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    setStyle(from);
    onAnimationStartFromProps();
  }, [from, onAnimationStartFromProps]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!isActive || !canBegin) {
      return es_toolkit__WEBPACK_IMPORTED_MODULE_1__/* .noop */ .lQ1;
    }
    initialized.current = true;
    var unsubscribe = animationManager.subscribe(setStyle);
    animationManager.start([onAnimationStart, begin, to, duration, onAnimationEnd]);
    return () => {
      animationManager.stop();
      if (unsubscribe) {
        unsubscribe();
      }
      onAnimationEnd();
    };
  }, [isActive, canBegin, duration, easing, begin, onAnimationStart, onAnimationEnd, animationManager, to, from]);
  if (!isActive) {
    /*
     * With isActive=false, the component always renders with the final style, immediately,
     * and ignores all other props.
     * Also there is no transition applied.
     */
    return children({
      [attributeName]: to
    });
  }
  if (!canBegin) {
    return children({
      [attributeName]: from
    });
  }
  if (initialized.current) {
    var transition = (0,_util__WEBPACK_IMPORTED_MODULE_4__/* .getTransitionVal */ .dl)([attributeName], duration, easing);
    return children({
      transition,
      [attributeName]: style
    });
  }
  return children({
    [attributeName]: from
  });
}

/***/ }),

/***/ 99582:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   F: () => (/* binding */ defaultCartesianAxisProps),
/* harmony export */   u: () => (/* binding */ CartesianAxis)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(80305);
/* harmony import */ var es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);
/* harmony import */ var _util_ShallowEqual__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(23521);
/* harmony import */ var _container_Layer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(86069);
/* harmony import */ var _component_Text__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(20261);
/* harmony import */ var _component_Label__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(91706);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(59744);
/* harmony import */ var _util_types__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(98940);
/* harmony import */ var _getTicks__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(11386);
/* harmony import */ var _util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(55448);
/* harmony import */ var _util_YAxisUtils__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(57794);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(77404);
var _excluded = ["axisLine", "width", "height", "className", "hide", "ticks"],
  _excluded2 = ["viewBox"],
  _excluded3 = ["viewBox"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @fileOverview Cartesian Axis
 */















/** The orientation of the axis in correspondence to the chart */

/** A unit to be appended to a value */

/** The formatter function of tick */

var defaultCartesianAxisProps = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  viewBox: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  // The orientation of axis
  orientation: 'bottom',
  // The ticks
  ticks: [],
  stroke: '#666',
  tickLine: true,
  axisLine: true,
  tick: true,
  mirror: false,
  minTickGap: 5,
  // The width or height of tick
  tickSize: 6,
  tickMargin: 2,
  interval: 'preserveEnd'
};

/*
 * `viewBox` and `scale` are SVG attributes.
 * Recharts however - unfortunately - has its own attributes named `viewBox` and `scale`
 * that are completely different data shape and different purpose.
 */

function AxisLine(axisLineProps) {
  var {
    x,
    y,
    width,
    height,
    orientation,
    mirror,
    axisLine,
    otherSvgProps
  } = axisLineProps;
  if (!axisLine) {
    return null;
  }
  var props = _objectSpread(_objectSpread(_objectSpread({}, otherSvgProps), (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_10__/* .svgPropertiesNoEvents */ .uZ)(axisLine)), {}, {
    fill: 'none'
  });
  if (orientation === 'top' || orientation === 'bottom') {
    var needHeight = +(orientation === 'top' && !mirror || orientation === 'bottom' && mirror);
    props = _objectSpread(_objectSpread({}, props), {}, {
      x1: x,
      y1: y + needHeight * height,
      x2: x + width,
      y2: y + needHeight * height
    });
  } else {
    var needWidth = +(orientation === 'left' && !mirror || orientation === 'right' && mirror);
    props = _objectSpread(_objectSpread({}, props), {}, {
      x1: x + needWidth * width,
      y1: y,
      x2: x + needWidth * width,
      y2: y + height
    });
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("line", _extends({}, props, {
    className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('recharts-cartesian-axis-line', es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_1___default()(axisLine, 'className'))
  }));
}

/**
 * Calculate the coordinates of endpoints in ticks.
 * @param data The data of a simple tick.
 * @param x The x-coordinate of the axis.
 * @param y The y-coordinate of the axis.
 * @param width The width of the axis.
 * @param height The height of the axis.
 * @param orientation The orientation of the axis.
 * @param tickSize The length of the tick line.
 * @param mirror If true, the ticks are mirrored.
 * @param tickMargin The margin between the tick line and the tick text.
 * @returns An object with `line` and `tick` coordinates.
 * `line` is the coordinates for the tick line, and `tick` is the coordinate for the tick text.
 */
function getTickLineCoord(data, x, y, width, height, orientation, tickSize, mirror, tickMargin) {
  var x1, x2, y1, y2, tx, ty;
  var sign = mirror ? -1 : 1;
  var finalTickSize = data.tickSize || tickSize;
  var tickCoord = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_7__/* .isNumber */ .Et)(data.tickCoord) ? data.tickCoord : data.coordinate;
  switch (orientation) {
    case 'top':
      x1 = x2 = data.coordinate;
      y2 = y + +!mirror * height;
      y1 = y2 - sign * finalTickSize;
      ty = y1 - sign * tickMargin;
      tx = tickCoord;
      break;
    case 'left':
      y1 = y2 = data.coordinate;
      x2 = x + +!mirror * width;
      x1 = x2 - sign * finalTickSize;
      tx = x1 - sign * tickMargin;
      ty = tickCoord;
      break;
    case 'right':
      y1 = y2 = data.coordinate;
      x2 = x + +mirror * width;
      x1 = x2 + sign * finalTickSize;
      tx = x1 + sign * tickMargin;
      ty = tickCoord;
      break;
    default:
      x1 = x2 = data.coordinate;
      y2 = y + +mirror * height;
      y1 = y2 + sign * finalTickSize;
      ty = y1 + sign * tickMargin;
      tx = tickCoord;
      break;
  }
  return {
    line: {
      x1,
      y1,
      x2,
      y2
    },
    tick: {
      x: tx,
      y: ty
    }
  };
}

/**
 * @param orientation The orientation of the axis.
 * @param mirror If true, the ticks are mirrored.
 * @returns The text anchor of the tick.
 */
function getTickTextAnchor(orientation, mirror) {
  switch (orientation) {
    case 'left':
      return mirror ? 'start' : 'end';
    case 'right':
      return mirror ? 'end' : 'start';
    default:
      return 'middle';
  }
}

/**
 * @param orientation The orientation of the axis.
 * @param mirror If true, the ticks are mirrored.
 * @returns The vertical text anchor of the tick.
 */
function getTickVerticalAnchor(orientation, mirror) {
  switch (orientation) {
    case 'left':
    case 'right':
      return 'middle';
    case 'top':
      return mirror ? 'start' : 'end';
    default:
      return mirror ? 'end' : 'start';
  }
}
function TickItem(props) {
  var {
    option,
    tickProps,
    value
  } = props;
  var tickItem;
  var combinedClassName = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(tickProps.className, 'recharts-cartesian-axis-tick-value');
  if (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(option)) {
    // @ts-expect-error element cloning is not typed
    tickItem = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(option, _objectSpread(_objectSpread({}, tickProps), {}, {
      className: combinedClassName
    }));
  } else if (typeof option === 'function') {
    tickItem = option(_objectSpread(_objectSpread({}, tickProps), {}, {
      className: combinedClassName
    }));
  } else {
    var className = 'recharts-cartesian-axis-tick-value';
    if (typeof option !== 'boolean') {
      className = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(className, option === null || option === void 0 ? void 0 : option.className);
    }
    tickItem = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_Text__WEBPACK_IMPORTED_MODULE_5__/* .Text */ .E, _extends({}, tickProps, {
      className: className
    }), value);
  }
  return tickItem;
}
function Ticks(props) {
  var {
    ticks = [],
    tick,
    tickLine,
    stroke,
    tickFormatter,
    unit,
    padding,
    tickTextProps,
    orientation,
    mirror,
    x,
    y,
    width,
    height,
    tickSize,
    tickMargin,
    fontSize,
    letterSpacing,
    getTicksConfig,
    events
  } = props;
  // @ts-expect-error some properties are optional in props but required in getTicks
  var finalTicks = (0,_getTicks__WEBPACK_IMPORTED_MODULE_9__/* .getTicks */ .f)(_objectSpread(_objectSpread({}, getTicksConfig), {}, {
    ticks
  }), fontSize, letterSpacing);
  var textAnchor = getTickTextAnchor(orientation, mirror);
  var verticalAnchor = getTickVerticalAnchor(orientation, mirror);
  var axisProps = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_10__/* .svgPropertiesNoEvents */ .uZ)(getTicksConfig);
  var customTickProps = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_10__/* .svgPropertiesNoEventsFromUnknown */ .ic)(tick);
  var tickLinePropsObject = {};
  if (typeof tickLine === 'object') {
    tickLinePropsObject = tickLine;
  }
  var tickLineProps = _objectSpread(_objectSpread({}, axisProps), {}, {
    fill: 'none'
  }, tickLinePropsObject);
  var items = finalTicks.map((entry, i) => {
    var {
      line: lineCoord,
      tick: tickCoord
    } = getTickLineCoord(entry, x, y, width, height, orientation, tickSize, mirror, tickMargin);
    var tickProps = _objectSpread(_objectSpread(_objectSpread(_objectSpread({
      // @ts-expect-error textAnchor from axisProps is typed as `string` but Text wants type `TextAnchor`
      textAnchor,
      verticalAnchor
    }, axisProps), {}, {
      // @ts-expect-error customTickProps is contributing unknown props
      stroke: 'none',
      // @ts-expect-error customTickProps is contributing unknown props
      fill: stroke
    }, customTickProps), tickCoord), {}, {
      index: i,
      payload: entry,
      visibleTicksCount: finalTicks.length,
      tickFormatter,
      padding
    }, tickTextProps);
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_4__/* .Layer */ .W, _extends({
      className: "recharts-cartesian-axis-tick",
      key: "tick-".concat(entry.value, "-").concat(entry.coordinate, "-").concat(entry.tickCoord)
    }, (0,_util_types__WEBPACK_IMPORTED_MODULE_8__/* .adaptEventsOfChild */ .X)(events, entry, i)), tickLine && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("line", _extends({}, tickLineProps, lineCoord, {
      className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('recharts-cartesian-axis-tick-line', es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_1___default()(tickLine, 'className'))
    })), tick && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(TickItem, {
      option: tick,
      tickProps: tickProps,
      value: "".concat(typeof tickFormatter === 'function' ? tickFormatter(entry.value, i) : entry.value).concat(unit || '')
    }));
  });
  if (items.length > 0) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("g", {
      className: "recharts-cartesian-axis-ticks"
    }, items);
  }
  return null;
}
var CartesianAxisComponent = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)((props, ref) => {
  var {
      axisLine,
      width,
      height,
      className,
      hide,
      ticks
    } = props,
    rest = _objectWithoutProperties(props, _excluded);
  var [fontSize, setFontSize] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  var [letterSpacing, setLetterSpacing] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  var tickRefs = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useImperativeHandle)(ref, () => ({
    getCalculatedWidth: () => {
      var _props$labelRef;
      return (0,_util_YAxisUtils__WEBPACK_IMPORTED_MODULE_11__/* .getCalculatedYAxisWidth */ .z)({
        ticks: tickRefs.current,
        label: (_props$labelRef = props.labelRef) === null || _props$labelRef === void 0 ? void 0 : _props$labelRef.current,
        labelGapWithTick: 5,
        tickSize: props.tickSize,
        tickMargin: props.tickMargin
      });
    }
  }));
  var layerRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(el => {
    if (el) {
      var tickNodes = el.getElementsByClassName('recharts-cartesian-axis-tick-value');
      tickRefs.current = tickNodes;
      var tick = tickNodes[0];
      if (tick) {
        var computedStyle = window.getComputedStyle(tick);
        var calculatedFontSize = computedStyle.fontSize;
        var calculatedLetterSpacing = computedStyle.letterSpacing;
        if (calculatedFontSize !== fontSize || calculatedLetterSpacing !== letterSpacing) {
          setFontSize(calculatedFontSize);
          setLetterSpacing(calculatedLetterSpacing);
        }
      }
    }
  }, [fontSize, letterSpacing]);
  if (hide) {
    return null;
  }

  /*
   * This is different condition from what validateWidthHeight is doing;
   * the CartesianAxis does allow width or height to be undefined.
   */
  if (width != null && width <= 0 || height != null && height <= 0) {
    return null;
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_4__/* .Layer */ .W, {
    className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('recharts-cartesian-axis', className),
    ref: layerRef
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(AxisLine, {
    x: props.x,
    y: props.y,
    width: width,
    height: height,
    orientation: props.orientation,
    mirror: props.mirror,
    axisLine: axisLine,
    otherSvgProps: (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_10__/* .svgPropertiesNoEvents */ .uZ)(props)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(Ticks, {
    ticks: ticks,
    tick: props.tick,
    tickLine: props.tickLine,
    stroke: props.stroke,
    tickFormatter: props.tickFormatter,
    unit: props.unit,
    padding: props.padding,
    tickTextProps: props.tickTextProps,
    orientation: props.orientation,
    mirror: props.mirror,
    x: props.x,
    y: props.y,
    width: props.width,
    height: props.height,
    tickSize: props.tickSize,
    tickMargin: props.tickMargin,
    fontSize: fontSize,
    letterSpacing: letterSpacing,
    getTicksConfig: props,
    events: rest
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_Label__WEBPACK_IMPORTED_MODULE_6__/* .CartesianLabelContextProvider */ .zJ, {
    x: props.x,
    y: props.y,
    width: props.width,
    height: props.height
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_Label__WEBPACK_IMPORTED_MODULE_6__/* .CartesianLabelFromLabelProp */ ._I, {
    label: props.label,
    labelRef: props.labelRef
  }), props.children));
});
var MemoCartesianAxis = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.memo(CartesianAxisComponent, (prevProps, nextProps) => {
  var {
      viewBox: prevViewBox
    } = prevProps,
    prevRestProps = _objectWithoutProperties(prevProps, _excluded2);
  var {
      viewBox: nextViewBox
    } = nextProps,
    nextRestProps = _objectWithoutProperties(nextProps, _excluded3);
  return (0,_util_ShallowEqual__WEBPACK_IMPORTED_MODULE_3__/* .shallowEqual */ .b)(prevViewBox, nextViewBox) && (0,_util_ShallowEqual__WEBPACK_IMPORTED_MODULE_3__/* .shallowEqual */ .b)(prevRestProps, nextRestProps);
});
var CartesianAxis = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((outsideProps, ref) => {
  var props = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_12__/* .resolveDefaultProps */ .e)(outsideProps, defaultCartesianAxisProps);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(MemoCartesianAxis, _extends({}, props, {
    ref: ref
  }));
});
CartesianAxis.displayName = 'CartesianAxis';

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVuZG9yLWNvbW1vbi00OWNlYjIyYS43MGQ2ODAxNGFhMWQzNGI5NTE2My5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxzQkFBc0Isd0VBQXdFLGdCQUFnQixzQkFBc0IsT0FBTyxzQkFBc0Isb0JBQW9CLGdEQUFnRCxXQUFXO0FBQ2hQLHlCQUF5Qix3QkFBd0Isb0NBQW9DLHlDQUF5QyxrQ0FBa0MsMERBQTBELDBCQUEwQjtBQUNwUCw0QkFBNEIsZ0JBQWdCLHNCQUFzQixPQUFPLGtEQUFrRCxzREFBc0QsOEJBQThCLG1KQUFtSixxRUFBcUUsS0FBSztBQUM1YSxvQ0FBb0Msb0VBQW9FLDBEQUEwRDtBQUNsSyw2QkFBNkIsbUNBQW1DO0FBQ2hFLDhCQUE4QiwwQ0FBMEMsK0JBQStCLG9CQUFvQixtQ0FBbUMsb0NBQW9DLHVFQUF1RTtBQUMxTztBQUNxRDtBQUN4RDtBQUN5QjtBQUNUO0FBQ0Q7QUFDRjtBQUNjO0FBQ1Y7QUFDZ0I7QUFDWTtBQUNFO0FBQ1g7QUFDQztBQUNWO0FBQ2M7QUFDSztBQUNnQjtBQUN4QjtBQUNJOztBQUV0RTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBLHNCQUFzQixnREFBbUIsQ0FBQywyQ0FBYyxxQkFBcUIsZ0RBQW1CO0FBQ2hHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUcsZ0JBQWdCLGdEQUFtQjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHLGdCQUFnQixnREFBbUI7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0osbUJBQW1CLGlEQUFvQjtBQUN2QztBQUNBLHdCQUF3QiwrQ0FBa0I7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsZ0RBQW1CO0FBQ3pDO0FBQ0E7QUFDQTtBQUNB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O0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsT0FBTztBQUNQO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ04sa0NBQWtDLG1FQUFRLFFBQVEsbUVBQVEsUUFBUSxtRUFBUSxZQUFZLG1FQUFRO0FBQzlGO0FBQ0E7QUFDQSxxQkFBcUIsbURBQUk7QUFDekIsZ0JBQWdCLGtGQUFtQjtBQUNuQztBQUNBLHdCQUF3QixnREFBbUIsQ0FBQyw0REFBSztBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUssZUFBZSxnREFBbUI7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSyxnQkFBZ0IsZ0RBQW1CLENBQUMsdUZBQXVCLHFCQUFxQixnREFBbUI7QUFDeEc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSywyQkFBMkIsZ0RBQW1CO0FBQ25EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSyxnQkFBZ0IsZ0RBQW1CO0FBQ3hDO0FBQ0E7QUFDQSxnREFBZ0QsaUJBQWlCO0FBQ2pFO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLEtBQUssZ0JBQWdCLGdEQUFtQjtBQUN4QztBQUNBO0FBQ0EsZ0RBQWdELGlCQUFpQjtBQUNqRTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxLQUFLLGdIQUFnSCxnREFBbUI7QUFDeEk7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsc0VBQWM7QUFDL0Isa0JBQWtCLGlGQUFZO0FBQzlCLG9CQUFvQixpRkFBWTtBQUNoQyw0QkFBNEIsaURBQVUsQ0FBQyw2RkFBMEI7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0osRUFBRSxnREFBUztBQUNYO0FBQ0EsYUFBYSx1RkFBc0I7QUFDbkM7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0gsRUFBRSxpSEFBNEI7QUFDOUIsaUJBQWlCLGtEQUFXO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxlQUFlLHVGQUFzQjtBQUNyQztBQUNBLEdBQUc7QUFDSCx3QkFBd0Isc0VBQWMsQ0FBQyw0RkFBcUI7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixnREFBbUIsNEJBQTRCO0FBQ3JFO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLGlCQUFpQixzRUFBYztBQUMvQixFQUFFLGdEQUFTO0FBQ1gsYUFBYSw4RUFBZ0I7QUFDN0I7QUFDQSxlQUFlLDhFQUFnQjtBQUMvQjtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDTztBQUNQLGNBQWMsd0ZBQW1CO0FBQ2pDLHNCQUFzQixnREFBbUIsQ0FBQywyQ0FBYyxxQkFBcUIsZ0RBQW1CO0FBQ2hHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHLGdCQUFnQixnREFBbUI7QUFDdEM7QUFDQSw0Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoMkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLHdFQUF3RSxnQkFBZ0Isc0JBQXNCLE9BQU8sc0JBQXNCLG9CQUFvQixnREFBZ0QsV0FBVztBQUNoUCx5QkFBeUIsd0JBQXdCLG9DQUFvQyx5Q0FBeUMsa0NBQWtDLDBEQUEwRCwwQkFBMEI7QUFDcFAsNEJBQTRCLGdCQUFnQixzQkFBc0IsT0FBTyxrREFBa0Qsc0RBQXNELDhCQUE4QixtSkFBbUoscUVBQXFFLEtBQUs7QUFDNWEsb0NBQW9DLG9FQUFvRSwwREFBMEQ7QUFDbEssNkJBQTZCLG1DQUFtQztBQUNoRSw4QkFBOEIsMENBQTBDLCtCQUErQixvQkFBb0IsbUNBQW1DLG9DQUFvQyx1RUFBdUU7QUFDelEsMENBQTBDLDBCQUEwQixtREFBbUQsb0NBQW9DLHlDQUF5QyxZQUFZLGNBQWMsd0NBQXdDLHFEQUFxRDtBQUMzVCwrQ0FBK0MsMEJBQTBCLFlBQVksdUJBQXVCLDhCQUE4QixtQ0FBbUMsZUFBZTtBQUM3SjtBQUNzQztBQUN6QztBQUNlO0FBQ0Y7QUFDMEQ7QUFDbEM7QUFDZDtBQUNYO0FBQ3NIO0FBQzNHO0FBQ21CO0FBQ3NEO0FBQ2pEO0FBQ1g7QUFDYztBQUNmO0FBQ087QUFDdEI7QUFDVztBQUNnRDtBQUM5QztBQUNMO0FBQ1U7QUFDVztBQUNQO0FBQ2tDO0FBQ3JDO0FBQ25FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLDhFQUFrQjtBQUM3QjtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLDhFQUFrQjtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLHNFQUFjLENBQUMsa0dBQXdCO0FBQzNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047O0FBRUE7QUFDQSxnQ0FBZ0MsNkZBQXlCO0FBQ3pEO0FBQ0EsZ0NBQWdDLDZGQUF5QjtBQUN6RDtBQUNBLDJCQUEyQiw2RkFBeUI7QUFDcEQ7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHdHQUFnQztBQUN4RCxzQkFBc0IsZ0RBQW1CLENBQUMsMkNBQWM7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSyxXQUFXO0FBQ2hCO0FBQ0E7QUFDQSxLQUFLLDhDQUE4Qyx3RUFBa0Isb0NBQW9DO0FBQ3pHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCx3QkFBd0IsZ0RBQW1CLENBQUMsa0VBQVk7QUFDeEQ7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QyxjQUFjO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNILHNCQUFzQixnREFBbUIsQ0FBQyw2RkFBaUM7QUFDM0U7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKLG9CQUFvQixzRUFBYyxDQUFDLGtHQUF3QjtBQUMzRCxzQkFBc0Isc0VBQWMsQ0FBQyxvR0FBMEI7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixnREFBbUIsQ0FBQyxrRUFBWSxhQUFhO0FBQ25FO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0osc0JBQXNCLGdEQUFtQixDQUFDLGtFQUFZLGFBQWE7QUFDbkU7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSiw4QkFBOEIsNkZBQXFCO0FBQ25EO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjs7QUFFQTtBQUNBLGdDQUFnQyw2RkFBeUI7QUFDekQ7QUFDQSxnQ0FBZ0MsNkZBQXlCO0FBQ3pEO0FBQ0EsMkJBQTJCLDZGQUF5QjtBQUNwRDtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsZ0RBQW1CLENBQUMsMkNBQWM7QUFDeEQsd0JBQXdCLGdEQUFtQixDQUFDLDREQUFLO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLLEVBQUUsd0VBQWtCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLLDRCQUE0QixnREFBbUI7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxnREFBbUI7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQSxvQkFBb0IsOEVBQWM7QUFDbEMsc0NBQXNDLCtDQUFRO0FBQzlDO0FBQ0EsMkJBQTJCLGtEQUFXO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNILDZCQUE2QixrREFBVztBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxzQkFBc0IsZ0RBQW1CO0FBQ3pDO0FBQ0E7QUFDQSxHQUFHLGVBQWUsZ0RBQW1CLENBQUMscUZBQWlCO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLFlBQVk7QUFDekQsYUFBYSxzRUFBVztBQUN4QixhQUFhLHNFQUFXO0FBQ3hCLGlCQUFpQixzRUFBVztBQUM1QixrQkFBa0Isc0VBQVc7QUFDN0IsU0FBUztBQUNUO0FBQ0E7QUFDQSxnQkFBZ0Isc0VBQVc7QUFDM0IsNkNBQTZDLFlBQVk7QUFDekQ7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLGNBQWMsc0VBQVc7QUFDekIsMkNBQTJDLFlBQVk7QUFDdkQ7QUFDQSxPQUFPO0FBQ1AsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdEQUFtQixDQUFDLDREQUFLLHFCQUFxQixnREFBbUI7QUFDekY7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHLGdCQUFnQixnREFBbUIsQ0FBQyxrRkFBc0I7QUFDN0Q7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLDhCQUE4Qiw2Q0FBTTtBQUNwQyxzQkFBc0IsZ0RBQW1CO0FBQ3pDO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLDZFQUFpQjtBQUMvQjtBQUNBO0FBQ0EsMkJBQTJCLGdEQUFhO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0EscUJBQXFCLG1EQUFJO0FBQ3pCO0FBQ0Esd0JBQXdCLGdEQUFtQixDQUFDLDREQUFLO0FBQ2pEO0FBQ0E7QUFDQSxLQUFLLDJCQUEyQixnREFBbUIsNEJBQTRCLGdEQUFtQixDQUFDLG1GQUFxQjtBQUN4SDtBQUNBO0FBQ0E7QUFDQSxLQUFLLGlCQUFpQixnREFBbUIsQ0FBQyw0REFBSztBQUMvQztBQUNBO0FBQ0EsS0FBSyxlQUFlLGdEQUFtQjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUssZ0JBQWdCLGdEQUFtQjtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLHlEQUFNO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBLElBQUksRUFBRSw4RUFBWTtBQUNsQixlQUFlLHNGQUFjO0FBQzdCLG1CQUFtQixpRkFBYTtBQUNoQyxjQUFjLHlFQUFhLGlCQUFpQiwwREFBSTtBQUNoRCxjQUFjLHNFQUFjLFVBQVUsNkZBQW1CO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxzQkFBc0IsZ0RBQW1CLENBQUMsbUZBQWtCO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHLGVBQWUsZ0RBQW1CLDBCQUEwQjtBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQiw2RUFBaUI7QUFDbkM7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLDRFQUFnQjtBQUM5QixNQUFNO0FBQ04sY0FBYyw2RUFBaUI7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsOEVBQW9CO0FBQzNDO0FBQ0E7QUFDQTtBQUNBLFVBQVUsa0ZBQXNCO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxlQUFlLGdFQUFLO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLG1FQUFRO0FBQzVCO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsVUFBVSxrRkFBc0I7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixtRUFBUTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5REFBeUQsWUFBWTtBQUNyRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLEtBQUs7QUFDTDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsY0FBYyx3RkFBbUI7QUFDakMsbUJBQW1CLGlGQUFhO0FBQ2hDO0FBQ0Esc0JBQXNCLGdEQUFtQixDQUFDLCtGQUF1QjtBQUNqRTtBQUNBO0FBQ0EsR0FBRyxxQkFBcUIsZ0RBQW1CLENBQUMsMkNBQWMscUJBQXFCLGdEQUFtQixDQUFDLCtFQUFnQjtBQUNuSDtBQUNBLEdBQUcsZ0JBQWdCLGdEQUFtQixDQUFDLDZGQUF1QjtBQUM5RDtBQUNBO0FBQ0EsR0FBRyxnQkFBZ0IsZ0RBQW1CLENBQUMsd0ZBQXlCO0FBQ2hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsZ0ZBQW9CO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHLGdCQUFnQixnREFBbUIscUJBQXFCO0FBQzNEO0FBQ0EsR0FBRztBQUNIO0FBQ08sdUJBQXVCLHVDQUFVO0FBQ3hDLHdCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMzbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEM7O0FDakVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQzs7QUM1QjBEO0FBQ21CO0FBQ3RFO0FBQ1AsU0FBUyxvQkFBb0IsS0FBSyxzQ0FBc0M7QUFDeEUsQzs7QUNKMkQ7QUFDcUI7QUFDekUsMkNBQTJDLHVCQUFhLENBQUMsNkJBQTZCO0FBQ3RGO0FBQ1AsZ0NBQWdDLG9CQUFVO0FBQzFDLFNBQVMsaUJBQU87QUFDaEIsQzs7Ozs7Ozs7Ozs7OztBQ05BLHlCQUF5Qix3QkFBd0Isb0NBQW9DLHlDQUF5QyxrQ0FBa0MsMERBQTBELDBCQUEwQjtBQUNwUCw0QkFBNEIsZ0JBQWdCLHNCQUFzQixPQUFPLGtEQUFrRCxzREFBc0QsOEJBQThCLG1KQUFtSixxRUFBcUUsS0FBSztBQUM1YSxvQ0FBb0Msb0VBQW9FLDBEQUEwRDtBQUNsSyw2QkFBNkIsbUNBQW1DO0FBQ2hFLDhCQUE4QiwwQ0FBMEMsK0JBQStCLG9CQUFvQixtQ0FBbUMsb0NBQW9DLHVFQUF1RTtBQUN6UTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ0E7O0FBRVA7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkI7QUFDQTtBQUNPOztBQUVQO0FBQ0E7QUFDQSxXQUFXLFVBQVU7QUFDckIsV0FBVyxRQUFRO0FBQ25CO0FBQ0E7QUFDTyxpR0FBaUcsVUFBVTtBQUNsSDtBQUNBLENBQUMsS0FBSyxFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDNUJOLHlCQUF5Qix3QkFBd0Isb0NBQW9DLHlDQUF5QyxrQ0FBa0MsMERBQTBELDBCQUEwQjtBQUNwUCw0QkFBNEIsZ0JBQWdCLHNCQUFzQixPQUFPLGtEQUFrRCxzREFBc0QsOEJBQThCLG1KQUFtSixxRUFBcUUsS0FBSztBQUM1YSxvQ0FBb0Msb0VBQW9FLDBEQUEwRDtBQUNsSyw2QkFBNkIsbUNBQW1DO0FBQ2hFLDhCQUE4QiwwQ0FBMEMsK0JBQStCLG9CQUFvQixtQ0FBbUMsb0NBQW9DLHVFQUF1RTtBQUNqTjtBQUNqRDtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyxtQkFBbUI7QUFDakM7QUFDQTtBQUNBLHFCQUFxQiwwQkFBUztBQUM5QjtBQUNBO0FBQ0EsMkNBQTJDLFVBQVU7QUFDckQ7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsV0FBVywwQkFBUztBQUNwQjtBQUNBLDZDQUE2QyxVQUFVO0FBQ3ZEO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0ZBQWtGLFVBQVU7QUFDNUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUcsS0FBSztBQUNSLDJCQUEyQiwwQkFBUztBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVEQUF1RDtBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUZBQWlGLFVBQVU7QUFDM0Y7QUFDQSxHQUFHLEtBQUs7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsMEJBQVM7O0FBRTdCO0FBQ0EsdURBQXVEO0FBQ3ZEO0FBQ0E7QUFDQSxNQUFNO0FBQ04sdUJBQXVCLDBCQUFTO0FBQ2hDLHlEQUF5RDtBQUN6RDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG1EQUFlO0FBQ2Ysa0JBQWtCLG9DQUFtQjtBQUNyQztBQUNBLENBQUMsRTs7QUN0SE07QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0Esc0VBQXNFLGFBQWE7QUFDbkY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsT0FBTztBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEU7Ozs7QUNwSG9EO0FBQ2xCO0FBQ2dDO0FBQ3hCO0FBQ0Y7QUFDb0I7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQLGNBQWMsa0RBQW1CO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSix5QkFBeUIsa0RBQW1CO0FBQzVDLDBCQUEwQixrQkFBUTtBQUNsQyx3QkFBd0IsZ0JBQU07QUFDOUIsRUFBRSxtQkFBUztBQUNYO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxFQUFFLG1CQUFTO0FBQ1g7QUFDQSxhQUFhLGtCQUFJO0FBQ2pCO0FBQ0EseUJBQXlCLFlBQVksV0FBVyxZQUFZO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxDOzs7Ozs7Ozs7Ozs7Ozs7QUMzRCtCO0FBQ2lCO0FBQzBFO0FBQ25GO0FBQ2hDO0FBQ1A7QUFDQSxjQUFjLHFFQUFjLFVBQVUsNkZBQW1CO0FBQ3pELGNBQWMscUVBQWMsVUFBVSw2RkFBbUI7QUFDekQseUxBQXlMLG1GQUFhO0FBQ3RNLHlMQUF5TCxtRkFBYTtBQUN0TTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0osaUJBQWlCLDZEQUFXO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0osc0JBQXNCLGdEQUFtQjtBQUN6QztBQUNBLEdBQUcsZUFBZSxnREFBbUI7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlDQTtBQUNBO0FBQ0Esc0JBQXNCLHdFQUF3RSxnQkFBZ0Isc0JBQXNCLE9BQU8sc0JBQXNCLG9CQUFvQixnREFBZ0QsV0FBVztBQUNoUCwwQ0FBMEMsMEJBQTBCLG1EQUFtRCxvQ0FBb0MseUNBQXlDLFlBQVksY0FBYyx3Q0FBd0MscURBQXFEO0FBQzNULCtDQUErQywwQkFBMEIsWUFBWSx1QkFBdUIsOEJBQThCLG1DQUFtQyxlQUFlO0FBQzVMLHlCQUF5Qix3QkFBd0Isb0NBQW9DLHlDQUF5QyxrQ0FBa0MsMERBQTBELDBCQUEwQjtBQUNwUCw0QkFBNEIsZ0JBQWdCLHNCQUFzQixPQUFPLGtEQUFrRCxzREFBc0QsOEJBQThCLG1KQUFtSixxRUFBcUUsS0FBSztBQUM1YSxvQ0FBb0Msb0VBQW9FLDBEQUEwRDtBQUNsSyw2QkFBNkIsbUNBQW1DO0FBQ2hFLDhCQUE4QiwwQ0FBMEMsK0JBQStCLG9CQUFvQixtQ0FBbUMsb0NBQW9DLHVFQUF1RTtBQUN6UTtBQUMrQjtBQUMrQztBQUNwQztBQUNkO0FBQ3FDO0FBQ2pCO0FBQ0w7QUFDd0Q7QUFDM0Q7QUFDa0I7QUFDSDtBQUNKO0FBQ0c7QUFDc0U7QUFDakQ7QUFDQztBQUN6QjtBQUNWO0FBQ3lCO0FBQzNCO0FBQytCO0FBQ0g7QUFDWDs7QUFFeEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0oseUJBQXlCLDhDQUFPO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsY0FBYztBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTCxHQUFHO0FBQ0gsc0JBQXNCLGdEQUFtQixDQUFDLDZGQUFpQztBQUMzRTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKLHdCQUF3QixxRUFBYyxVQUFVLHVGQUFpQjtBQUNqRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxnQ0FBZ0MsNkZBQXlCO0FBQ3pELGdDQUFnQyw2RkFBeUI7QUFDekQsMkJBQTJCLDZGQUF5QjtBQUNwRCxzQkFBc0IsZ0RBQW1CLENBQUMsMkNBQWM7QUFDeEQ7QUFDQTtBQUNBLHVEQUF1RCxZQUFZO0FBQ25FO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCx3QkFBd0IsZ0RBQW1CLENBQUMsNERBQUs7QUFDakQ7QUFDQTtBQUNBLEtBQUssRUFBRSx5RUFBa0I7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUssZ0JBQWdCLGdEQUFtQixDQUFDLHdFQUFlO0FBQ3hELEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQSxzQ0FBc0MsK0NBQVE7QUFDOUM7QUFDQSxvQkFBb0IsOEVBQWM7QUFDbEMsMkJBQTJCLGtEQUFXO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNILDZCQUE2QixrREFBVztBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxzQkFBc0IsZ0RBQW1CO0FBQ3pDO0FBQ0E7QUFDQSxHQUFHLGVBQWUsZ0RBQW1CLENBQUMscUZBQWlCO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLFlBQVk7QUFDekQsYUFBYSxzRUFBVztBQUN4QixhQUFhLHNFQUFXO0FBQ3hCLHNCQUFzQixzRUFBVztBQUNqQyxzQkFBc0Isc0VBQVc7QUFDakMsa0JBQWtCLHNFQUFXO0FBQzdCLFNBQVM7QUFDVDtBQUNBLDJDQUEyQyxZQUFZO0FBQ3ZELFdBQVcsc0VBQVc7QUFDdEIsV0FBVyxzRUFBVztBQUN0QixvQkFBb0Isc0VBQVc7QUFDL0Isb0JBQW9CLHNFQUFXO0FBQy9CLGdCQUFnQixzRUFBVztBQUMzQixPQUFPO0FBQ1AsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdEQUFtQixDQUFDLDREQUFLLHFCQUFxQixnREFBbUI7QUFDekY7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHLGdCQUFnQixnREFBbUIsQ0FBQyxrRkFBc0I7QUFDN0Q7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLDhCQUE4Qiw2Q0FBTTtBQUNwQyxzQkFBc0IsZ0RBQW1CO0FBQ3pDO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxNQUFNLG1FQUFRO0FBQ2Q7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sOEJBQThCLGdEQUFhO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTixxQkFBcUIsbURBQUk7QUFDekIsd0JBQXdCLGdEQUFtQixDQUFDLDREQUFLO0FBQ2pEO0FBQ0EsS0FBSyxlQUFlLGdEQUFtQjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQix5REFBTTtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQiw4REFBVztBQUM1Qiw2QkFBNkIsd0ZBQW1CO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSwwQkFBMEIsNkZBQXFCO0FBQy9DLGNBQWMsMEVBQWEsaUJBQWlCLDJEQUFJO0FBQ2hELHVCQUF1Qiw4Q0FBTztBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsbUJBQW1CLHFFQUFjLFVBQVUsa0dBQXNCO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSixzQkFBc0IsZ0RBQW1CLENBQUMsMkNBQWMscUJBQXFCLGdEQUFtQixDQUFDLDZGQUF1QjtBQUN4SDtBQUNBLHdDQUF3QyxZQUFZO0FBQ3BEO0FBQ0EsS0FBSztBQUNMLEdBQUcsZ0JBQWdCLGdEQUFtQiw2QkFBNkI7QUFDbkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSixpRUFBaUUsNkVBQWlCO0FBQ2xGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQiw2RUFBaUI7QUFDbEMsZUFBZSw2RUFBaUI7QUFDaEM7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLDZFQUFpQjtBQUNqQztBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLLEVBQUUsNkRBQUksdUJBQXVCO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxZQUFZO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdURBQXVELDRCQUE0QjtBQUNuRjtBQUNBLFNBQVM7QUFDVCxvREFBb0QseUJBQXlCO0FBQzdFO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ08scUJBQXFCLGdEQUFhO0FBQ3pDO0FBQ0Esd0JBQXdCLGdEQUFtQjtBQUMzQztBQUNBO0FBQ0E7QUFDQSw0RDs7Ozs7Ozs7Ozs7OztBQzliNkk7O0FBRTdJO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsYUFBb0Isa0VBQWtFLCtDQUErQyxLQUFLLDZDQUE2QztBQUNyTztBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixJQUFxQztBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR3lFO0FBQ3pFOzs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHd1A7QUFDeFA7OztBQ3JEeUc7QUFDZ0c7O0FBRXpNO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJc1A7QUFDdFA7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDbEJBO0FBQ0Esc0JBQXNCLHdFQUF3RSxnQkFBZ0Isc0JBQXNCLE9BQU8sc0JBQXNCLG9CQUFvQixnREFBZ0QsV0FBVztBQUNoUCx5QkFBeUIsd0JBQXdCLG9DQUFvQyx5Q0FBeUMsa0NBQWtDLDBEQUEwRCwwQkFBMEI7QUFDcFAsNEJBQTRCLGdCQUFnQixzQkFBc0IsT0FBTyxrREFBa0Qsc0RBQXNELDhCQUE4QixtSkFBbUoscUVBQXFFLEtBQUs7QUFDNWEsb0NBQW9DLG9FQUFvRSwwREFBMEQ7QUFDbEssNkJBQTZCLG1DQUFtQztBQUNoRSw4QkFBOEIsMENBQTBDLCtCQUErQixvQkFBb0IsbUNBQW1DLG9DQUFvQyx1RUFBdUU7QUFDelEsMENBQTBDLDBCQUEwQixtREFBbUQsb0NBQW9DLHlDQUF5QyxZQUFZLGNBQWMsd0NBQXdDLHFEQUFxRDtBQUMzVCwrQ0FBK0MsMEJBQTBCLFlBQVksdUJBQXVCLDhCQUE4QixtQ0FBbUMsZUFBZTtBQUM1TDtBQUNBO0FBQ0E7QUFDK0I7QUFDRztBQUNTO0FBQzZDO0FBQzFDO0FBQ29CO0FBQ0k7QUFDUDtBQUNVOztBQUV6RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxpQkFBaUIsNEZBQXFCO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksRUFBRSxzRkFBa0I7QUFDeEIsY0FBYywwREFBUTtBQUN0QixjQUFjLDBEQUFRO0FBQ3RCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUCxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdEQUFtQixDQUFDLDREQUFLO0FBQ2pEO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFFBQVE7QUFDUiwwQkFBMEIsZ0RBQW1CLENBQUMsMEZBQW9CO0FBQ2xFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sd0JBQXdCLGdEQUFtQixvQkFBb0I7QUFDdEUsNkNBQTZDO0FBQzdDLE9BQU87QUFDUCxLQUFLO0FBQ0wsR0FBRztBQUNILHNCQUFzQixnREFBbUIsQ0FBQyw0REFBSztBQUMvQztBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsZUFBZSxxRkFBYztBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxFQUFFLHVGQUFtQjtBQUN6QixzQkFBc0IsZ0RBQW1CLENBQUMsMkNBQWMscUJBQXFCLGdEQUFtQixDQUFDLHNGQUFzQjtBQUN2SDtBQUNBO0FBQ0EsR0FBRyxnQkFBZ0IsZ0RBQW1CLDBCQUEwQjtBQUNoRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDTyx1QkFBdUIsNENBQVM7QUFDdkM7QUFDQSx3QkFBd0IsZ0RBQW1CO0FBQzNDO0FBQ0E7QUFDQTtBQUNBLHFEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLHdCQUF3QixvQ0FBb0MseUNBQXlDLGtDQUFrQywwREFBMEQsMEJBQTBCO0FBQ3BQLDRCQUE0QixnQkFBZ0Isc0JBQXNCLE9BQU8sa0RBQWtELHNEQUFzRCw4QkFBOEIsbUpBQW1KLHFFQUFxRSxLQUFLO0FBQzVhLG9DQUFvQyxvRUFBb0UsMERBQTBEO0FBQ2xLLDZCQUE2QixtQ0FBbUM7QUFDaEUsOEJBQThCLDBDQUEwQywrQkFBK0Isb0JBQW9CLG1DQUFtQyxvQ0FBb0MsdUVBQXVFO0FBQ3pRLHNCQUFzQix3RUFBd0UsZ0JBQWdCLHNCQUFzQixPQUFPLHNCQUFzQixvQkFBb0IsZ0RBQWdELFdBQVc7QUFDaFAsMENBQTBDLDBCQUEwQixtREFBbUQsb0NBQW9DLHlDQUF5QyxZQUFZLGNBQWMsd0NBQXdDLHFEQUFxRDtBQUMzVCwrQ0FBK0MsMEJBQTBCLFlBQVksdUJBQXVCLDhCQUE4QixtQ0FBbUMsZUFBZTtBQUM1TDtBQUNBO0FBQ0E7QUFDK0I7QUFDUztBQUNLO0FBQzZCO0FBQ3BDO0FBQ3NCO0FBQ3FDO0FBQ007QUFDdkQ7QUFDVztBQUNPO0FBQ0k7O0FBRXRFO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0osc0JBQXNCLGdEQUFtQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLGlEQUFvQjtBQUN2QztBQUNBLDRCQUE0QiwrQ0FBa0I7QUFDOUMsSUFBSTtBQUNKO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBLGdDQUFnQyw2RkFBcUI7QUFDckQ7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBLDRCQUE0QixnREFBbUIsb0JBQW9CO0FBQ25FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxzREFBc0QseUJBQXlCO0FBQy9FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEdBQUc7QUFDSCxzQkFBc0IsZ0RBQW1CO0FBQ3pDO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0Esc0RBQXNELHlCQUF5QjtBQUMvRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxHQUFHO0FBQ0gsc0JBQXNCLGdEQUFtQjtBQUN6QztBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdEQUFtQjtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0gsc0JBQXNCLGdEQUFtQjtBQUN6QztBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0RBQW1CO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7QUFDSCxzQkFBc0IsZ0RBQW1CO0FBQ3pDO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKLFNBQVMsZ0ZBQW9CLENBQUMsNERBQVEsNkNBQTZDLEVBQUUsOEVBQXlCLGFBQWE7QUFDM0gsV0FBVywwRUFBYztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0osU0FBUyxnRkFBb0IsQ0FBQyw0REFBUSw2Q0FBNkMsRUFBRSw4RUFBeUIsYUFBYTtBQUMzSCxXQUFXLDBFQUFjO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1AsbUJBQW1CLG9GQUFhO0FBQ2hDLG9CQUFvQixxRkFBYztBQUNsQyxlQUFlLHdGQUFpQjtBQUNoQyw2REFBNkQsRUFBRSx3RkFBbUIsMEJBQTBCO0FBQzVHLE9BQU8sbUVBQVE7QUFDZixPQUFPLG1FQUFRO0FBQ2YsV0FBVyxtRUFBUTtBQUNuQixZQUFZLG1FQUFRO0FBQ3BCLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSixtQkFBbUIsZ0ZBQWE7QUFDaEMsY0FBYyxxRUFBYyxVQUFVLDZIQUFtRDtBQUN6RixjQUFjLHFFQUFjLFVBQVUsNkhBQW1EO0FBQ3pGLE9BQU8sbUVBQVEsMEJBQTBCLG1FQUFRLDRCQUE0QixtRUFBUSxvQkFBb0IsbUVBQVE7QUFDakg7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbURBQW1ELFlBQVk7QUFDL0Q7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLElBQUksNkRBQUk7QUFDUjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1EQUFtRCxZQUFZO0FBQy9EO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxJQUFJLDZEQUFJO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsZ0RBQW1CO0FBQ3pDO0FBQ0EsR0FBRyxlQUFlLGdEQUFtQjtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUcsZ0JBQWdCLGdEQUFtQiwrQkFBK0I7QUFDckU7QUFDQSxHQUFHLGlCQUFpQixnREFBbUIsNkJBQTZCO0FBQ3BFO0FBQ0EsR0FBRyxpQkFBaUIsZ0RBQW1CLGlDQUFpQztBQUN4RTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUcsaUJBQWlCLGdEQUFtQiwrQkFBK0I7QUFDdEU7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSw0Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNyWUE7QUFDQTtBQUNBLDBDQUEwQywwQkFBMEIsbURBQW1ELG9DQUFvQyx5Q0FBeUMsWUFBWSxjQUFjLHdDQUF3QyxxREFBcUQ7QUFDM1QsK0NBQStDLDBCQUEwQixZQUFZLHVCQUF1Qiw4QkFBOEIsbUNBQW1DLGVBQWU7QUFDNUwseUJBQXlCLHdCQUF3QixvQ0FBb0MseUNBQXlDLGtDQUFrQywwREFBMEQsMEJBQTBCO0FBQ3BQLDRCQUE0QixnQkFBZ0Isc0JBQXNCLE9BQU8sa0RBQWtELHNEQUFzRCw4QkFBOEIsbUpBQW1KLHFFQUFxRSxLQUFLO0FBQzVhLG9DQUFvQyxvRUFBb0UsMERBQTBEO0FBQ2xLLDZCQUE2QixtQ0FBbUM7QUFDaEUsOEJBQThCLDBDQUEwQywrQkFBK0Isb0JBQW9CLG1DQUFtQyxvQ0FBb0MsdUVBQXVFO0FBQ3pRLHNCQUFzQix3RUFBd0UsZ0JBQWdCLHNCQUFzQixPQUFPLHNCQUFzQixvQkFBb0IsZ0RBQWdELFdBQVc7QUFDak47QUFDc0M7QUFDekM7QUFDVztBQUNKO0FBQ1E7QUFDd0Q7QUFDM0Q7QUFDb0M7QUFDOEM7QUFDM0U7QUFDVTtBQUNrQjtBQUNHO0FBQ2hCO0FBQ0g7QUFDSTtBQUNIO0FBQ0M7QUFDYjtBQUNRO0FBQ1U7QUFDQTtBQUMzQjtBQUNzQztBQUNQO0FBQ0E7QUFDSDtBQUNxQjtBQUNMOztBQUVuRjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLDhFQUFrQjtBQUM3QjtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksOEVBQWtCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixpREFBb0I7QUFDdkM7QUFDQSwyQkFBMkIsK0NBQWtCO0FBQzdDLElBQUk7QUFDSjtBQUNBLElBQUk7QUFDSixvQkFBb0IsbURBQUk7QUFDeEIsMkJBQTJCLGdEQUFtQixDQUFDLG9EQUFHLGFBQWE7QUFDL0Q7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IscUVBQVM7QUFDekIsa0JBQWtCLDZGQUFxQjtBQUN2Qyx1QkFBdUIseUdBQWlDO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSyxpQ0FBaUM7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsZ0RBQW1CLENBQUMsNERBQUs7QUFDL0M7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUNBQXlDLGNBQWM7QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0gsc0JBQXNCLGdEQUFtQixDQUFDLDZGQUFpQztBQUMzRTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0Esc0JBQXNCLDZGQUFxQjtBQUMzQyxzQkFBc0IsZ0RBQW1CLENBQUMsMkNBQWMsNEZBQTRGLGdEQUFtQixDQUFDLDREQUFLO0FBQzdLO0FBQ0EsR0FBRyxlQUFlLGdEQUFtQixDQUFDLHdEQUFLLGFBQWE7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUcsc0NBQXNDLGdEQUFtQixDQUFDLHdEQUFLLGFBQWE7QUFDL0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRyxpREFBaUQsZ0RBQW1CLENBQUMsd0RBQUssYUFBYTtBQUMxRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHLGtCQUFrQixnREFBbUI7QUFDeEM7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxPQUFPLHdGQUFtQixhQUFhLHdGQUFtQjtBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sbUVBQVE7QUFDZDtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0EsTUFBTSxtRUFBUTtBQUNkLHdCQUF3QixnREFBbUI7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxPQUFPLHdGQUFtQixhQUFhLHdGQUFtQjtBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sbUVBQVE7QUFDZDtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0EsTUFBTSxtRUFBUTtBQUNkLHdCQUF3QixnREFBbUI7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQSx3QkFBd0IsZ0RBQW1CO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0Esc0JBQXNCLGdEQUFtQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSixvQkFBb0IsOEVBQWM7QUFDbEMsc0NBQXNDLCtDQUFRO0FBQzlDO0FBQ0EsMkJBQTJCLGtEQUFXO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNILDZCQUE2QixrREFBVztBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0Esc0JBQXNCLGdEQUFtQjtBQUN6QztBQUNBO0FBQ0EsR0FBRywrQkFBK0IsZ0RBQW1CLENBQUMscUZBQWlCO0FBQ3ZFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtDQUErQyxZQUFZO0FBQzNELGVBQWUsc0VBQVc7QUFDMUIsZUFBZSxzRUFBVztBQUMxQixXQUFXO0FBQ1g7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLFVBQVUsbUVBQVE7QUFDbEIsdUJBQXVCLHNFQUFXO0FBQ2xDLFFBQVEsU0FBUyxvRUFBUyxjQUFjLGdFQUFLO0FBQzdDLHVCQUF1QixzRUFBVztBQUNsQyxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpREFBaUQsWUFBWTtBQUM3RCxpQkFBaUIsc0VBQVc7QUFDNUIsaUJBQWlCLHNFQUFXO0FBQzVCLGFBQWE7QUFDYjtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsZ0RBQW1CO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0RBQW1CLENBQUMsNERBQUssMENBQTBDLGdEQUFtQiw0QkFBNEIsZ0RBQW1CO0FBQzdKO0FBQ0EsS0FBSyxlQUFlLGdEQUFtQjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSyxrQkFBa0IsZ0RBQW1CLENBQUMsNERBQUs7QUFDaEQ7QUFDQSxLQUFLLGVBQWUsZ0RBQW1CO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRyxnQkFBZ0IsZ0RBQW1CLENBQUMsa0ZBQXNCO0FBQzdEO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLDZDQUFNO0FBQ2hDLDRCQUE0Qiw2Q0FBTTtBQUNsQyxzQkFBc0IsZ0RBQW1CO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSw0QkFBNEIsZ0RBQWE7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixtREFBSTtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sRUFBRSw4R0FBOEI7QUFDdEMsa0JBQWtCLHFFQUFTO0FBQzNCO0FBQ0Esd0JBQXdCLGdEQUFtQixDQUFDLDJDQUFjLHFCQUFxQixnREFBbUIsQ0FBQyw0REFBSztBQUN4RztBQUNBLEtBQUssMkJBQTJCLGdEQUFtQiw0QkFBNEIsZ0RBQW1CLENBQUMsbUZBQXFCO0FBQ3hIO0FBQ0E7QUFDQTtBQUNBLEtBQUssNEJBQTRCLGdEQUFtQjtBQUNwRDtBQUNBLEtBQUssZUFBZSxnREFBbUI7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLLGtCQUFrQixnREFBbUI7QUFDMUM7QUFDQTtBQUNBO0FBQ0EsS0FBSyxpQkFBaUIsZ0RBQW1CLENBQUMsMkVBQVk7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLLGlFQUFpRSxnREFBbUIsQ0FBQywyRUFBWTtBQUN0RztBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IseURBQU07QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsd0ZBQW1CO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLGVBQWUsc0ZBQWM7QUFDN0Isa0JBQWtCLG1GQUFZO0FBQzlCO0FBQ0E7QUFDQSxJQUFJLEVBQUUsOEVBQVk7QUFDbEIsbUJBQW1CLGlGQUFhO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxxQkFBcUIsc0VBQWMsVUFBVSxvRkFBVTtBQUMzRCxpQkFBaUIsOERBQVc7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLGdEQUFtQiwyQkFBMkI7QUFDcEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsTUFBTSxtRUFBUTtBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOLGNBQWMsNkVBQWlCO0FBQy9CO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0Esd0VBQXdFLDZFQUFpQjtBQUN6RjtBQUNBO0FBQ0EsV0FBVyxtRkFBdUI7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsbUZBQXVCO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLHdGQUFtQjtBQUNqQyxtQkFBbUIsaUZBQWE7QUFDaEM7QUFDQSxzQkFBc0IsZ0RBQW1CLENBQUMsK0ZBQXVCO0FBQ2pFO0FBQ0E7QUFDQSxHQUFHLHFCQUFxQixnREFBbUIsQ0FBQywyQ0FBYyxxQkFBcUIsZ0RBQW1CLENBQUMsK0VBQWdCO0FBQ25IO0FBQ0EsR0FBRyxnQkFBZ0IsZ0RBQW1CLENBQUMsNkZBQXVCO0FBQzlEO0FBQ0E7QUFDQSxHQUFHLGdCQUFnQixnREFBbUIsQ0FBQyx3RkFBeUI7QUFDaEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLGdGQUFvQjtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRyxnQkFBZ0IsZ0RBQW1CLHNCQUFzQjtBQUM1RDtBQUNBLEdBQUc7QUFDSDtBQUNPLHdCQUF3Qix1Q0FBVTtBQUN6QywwQjs7Ozs7Ozs7Ozs7QUNoeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR2dRO0FBQ2hROzs7Ozs7Ozs7Ozs7Ozs7O0FDM0JpRTtBQUMvQjtBQUNnQztBQUNOO0FBQ2xCO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQjtBQUMxQjtBQUNBO0FBQ087QUFDUCxjQUFjLHVGQUFtQjtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSix5QkFBeUIsa0ZBQW1CO0FBQzVDLDBCQUEwQiwrQ0FBUTtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxvQkFBb0IsNkNBQU07QUFDMUIseUJBQXlCLGtEQUFXO0FBQ3BDO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsRUFBRSxnREFBUztBQUNYO0FBQ0EsYUFBYSx1REFBSTtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLHFCQUFxQixpRUFBZ0I7QUFDckM7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQywwQkFBMEIsbURBQW1ELG9DQUFvQyx5Q0FBeUMsWUFBWSxjQUFjLHdDQUF3QyxxREFBcUQ7QUFDM1QsK0NBQStDLDBCQUEwQixZQUFZLHVCQUF1Qiw4QkFBOEIsbUNBQW1DLGVBQWU7QUFDNUwsc0JBQXNCLHdFQUF3RSxnQkFBZ0Isc0JBQXNCLE9BQU8sc0JBQXNCLG9CQUFvQixnREFBZ0QsV0FBVztBQUNoUCx5QkFBeUIsd0JBQXdCLG9DQUFvQyx5Q0FBeUMsa0NBQWtDLDBEQUEwRCwwQkFBMEI7QUFDcFAsNEJBQTRCLGdCQUFnQixzQkFBc0IsT0FBTyxrREFBa0Qsc0RBQXNELDhCQUE4QixtSkFBbUoscUVBQXFFLEtBQUs7QUFDNWEsb0NBQW9DLG9FQUFvRSwwREFBMEQ7QUFDbEssNkJBQTZCLG1DQUFtQztBQUNoRSw4QkFBOEIsMENBQTBDLCtCQUErQixvQkFBb0IsbUNBQW1DLG9DQUFvQyx1RUFBdUU7QUFDelE7QUFDQTtBQUNBO0FBQytCO0FBQ3dEO0FBQy9DO0FBQ1o7QUFDd0I7QUFDVDtBQUNGO0FBQ3VEO0FBQ25EO0FBQ007QUFDYjtBQUNrRTtBQUMzQztBQUNLOztBQUVsRTs7QUFFQTs7QUFFQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSwwREFBMEQsa0JBQWtCLDZGQUFxQixlQUFlO0FBQ2hIO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSwwQ0FBMEMsWUFBWTtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxJQUFJO0FBQ0o7QUFDQSwwQ0FBMEMsWUFBWTtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLHNCQUFzQixnREFBbUIsb0JBQW9CO0FBQzdELGVBQWUsbURBQUksaUNBQWlDLDREQUFHO0FBQ3ZELEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsbUVBQVE7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0EsMEJBQTBCLG1EQUFJO0FBQzlCLG1CQUFtQixpREFBb0I7QUFDdkM7QUFDQSw0QkFBNEIsK0NBQWtCLHVDQUF1QyxnQkFBZ0I7QUFDckc7QUFDQSxLQUFLO0FBQ0wsSUFBSTtBQUNKLG9EQUFvRCxnQkFBZ0I7QUFDcEU7QUFDQSxLQUFLO0FBQ0wsSUFBSTtBQUNKO0FBQ0E7QUFDQSxrQkFBa0IsbURBQUk7QUFDdEI7QUFDQSw0QkFBNEIsZ0RBQW1CLENBQUMsMERBQUksYUFBYTtBQUNqRTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBLG1CQUFtQiw0REFBUSwrQkFBK0IscUJBQXFCO0FBQy9FO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxrQkFBa0IsNkZBQXFCO0FBQ3ZDLHdCQUF3Qix3R0FBZ0M7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvREFBb0QsZ0JBQWdCO0FBQ3BFO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSyxnQkFBZ0I7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLLGtDQUFrQztBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLHdCQUF3QixnREFBbUIsQ0FBQyw0REFBSztBQUNqRDtBQUNBO0FBQ0EsS0FBSyxFQUFFLHdFQUFrQiw4Q0FBOEMsZ0RBQW1CLG9CQUFvQjtBQUM5RyxpQkFBaUIsbURBQUksc0NBQXNDLDREQUFHO0FBQzlELEtBQUsseUJBQXlCLGdEQUFtQjtBQUNqRDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0Esd0JBQXdCLGdEQUFtQjtBQUMzQztBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsaURBQVU7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxnQ0FBZ0MsK0NBQVE7QUFDeEMsMENBQTBDLCtDQUFRO0FBQ2xELGlCQUFpQiw2Q0FBTTtBQUN2QixFQUFFLDBEQUFtQjtBQUNyQjtBQUNBO0FBQ0EsYUFBYSxtRkFBdUI7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLEdBQUc7QUFDSCxpQkFBaUIsa0RBQVc7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsZ0RBQW1CLENBQUMsNERBQUs7QUFDL0MsZUFBZSxtREFBSTtBQUNuQjtBQUNBLEdBQUcsZUFBZSxnREFBbUI7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsNkZBQXFCO0FBQ3hDLEdBQUcsZ0JBQWdCLGdEQUFtQjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRyxnQkFBZ0IsZ0RBQW1CLENBQUMscUZBQTZCO0FBQ3BFO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRyxlQUFlLGdEQUFtQixDQUFDLG1GQUEyQjtBQUNqRTtBQUNBO0FBQ0EsR0FBRztBQUNILENBQUM7QUFDRCxxQ0FBcUMsdUNBQVU7QUFDL0M7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxTQUFTLHlFQUFZLDhCQUE4Qix5RUFBWTtBQUMvRCxDQUFDO0FBQ00saUNBQWlDLDZDQUFnQjtBQUN4RCxjQUFjLHdGQUFtQjtBQUNqQyxzQkFBc0IsZ0RBQW1CLCtCQUErQjtBQUN4RTtBQUNBLEdBQUc7QUFDSCxDQUFDO0FBQ0QsNEMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvY2FydGVzaWFuL0JydXNoLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9jYXJ0ZXNpYW4vQmFyLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9hbmltYXRpb24vQW5pbWF0aW9uTWFuYWdlci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvYW5pbWF0aW9uL3RpbWVvdXRDb250cm9sbGVyLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9hbmltYXRpb24vY3JlYXRlRGVmYXVsdEFuaW1hdGlvbk1hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L2FuaW1hdGlvbi91c2VBbmltYXRpb25NYW5hZ2VyLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9hbmltYXRpb24vdXRpbC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvYW5pbWF0aW9uL2NvbmZpZ1VwZGF0ZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvYW5pbWF0aW9uL2Vhc2luZy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvYW5pbWF0aW9uL0phdmFzY3JpcHRBbmltYXRlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9jYXJ0ZXNpYW4vR3JhcGhpY2FsSXRlbUNsaXBQYXRoLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9jYXJ0ZXNpYW4vRnVubmVsLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1zdGF0ZWx5L3V0aWxzL2Rpc3QvdXNlQ29udHJvbGxlZFN0YXRlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3Qtc3RhdGVseS91dGlscy9kaXN0L251bWJlci5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LXN0YXRlbHkvdXRpbHMvZGlzdC9pbXBvcnQubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9jYXJ0ZXNpYW4vRXJyb3JCYXIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L2NhcnRlc2lhbi9DYXJ0ZXNpYW5HcmlkLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9jYXJ0ZXNpYW4vQXJlYS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3Qtc3RhdGVseS9mbGFncy9kaXN0L2ltcG9ydC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L2FuaW1hdGlvbi9DU1NUcmFuc2l0aW9uQW5pbWF0ZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvY2FydGVzaWFuL0NhcnRlc2lhbkF4aXMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gX2V4dGVuZHMoKSB7IHJldHVybiBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gPyBPYmplY3QuYXNzaWduLmJpbmQoKSA6IGZ1bmN0aW9uIChuKSB7IGZvciAodmFyIGUgPSAxOyBlIDwgYXJndW1lbnRzLmxlbmd0aDsgZSsrKSB7IHZhciB0ID0gYXJndW1lbnRzW2VdOyBmb3IgKHZhciByIGluIHQpICh7fSkuaGFzT3duUHJvcGVydHkuY2FsbCh0LCByKSAmJiAobltyXSA9IHRbcl0pOyB9IHJldHVybiBuOyB9LCBfZXh0ZW5kcy5hcHBseShudWxsLCBhcmd1bWVudHMpOyB9XG5mdW5jdGlvbiBvd25LZXlzKGUsIHIpIHsgdmFyIHQgPSBPYmplY3Qua2V5cyhlKTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG8gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyByICYmIChvID0gby5maWx0ZXIoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZSwgcikuZW51bWVyYWJsZTsgfSkpLCB0LnB1c2guYXBwbHkodCwgbyk7IH0gcmV0dXJuIHQ7IH1cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQoZSkgeyBmb3IgKHZhciByID0gMTsgciA8IGFyZ3VtZW50cy5sZW5ndGg7IHIrKykgeyB2YXIgdCA9IG51bGwgIT0gYXJndW1lbnRzW3JdID8gYXJndW1lbnRzW3JdIDoge307IHIgJSAyID8gb3duS2V5cyhPYmplY3QodCksICEwKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0W3JdKTsgfSkgOiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGUsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHQpKSA6IG93bktleXMoT2JqZWN0KHQpKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHQsIHIpKTsgfSk7IH0gcmV0dXJuIGU7IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0KSB7IHJldHVybiAociA9IF90b1Byb3BlcnR5S2V5KHIpKSBpbiBlID8gT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIHsgdmFsdWU6IHQsIGVudW1lcmFibGU6ICEwLCBjb25maWd1cmFibGU6ICEwLCB3cml0YWJsZTogITAgfSkgOiBlW3JdID0gdCwgZTsgfVxuZnVuY3Rpb24gX3RvUHJvcGVydHlLZXkodCkgeyB2YXIgaSA9IF90b1ByaW1pdGl2ZSh0LCBcInN0cmluZ1wiKTsgcmV0dXJuIFwic3ltYm9sXCIgPT0gdHlwZW9mIGkgPyBpIDogaSArIFwiXCI7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZSh0LCByKSB7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiB0IHx8ICF0KSByZXR1cm4gdDsgdmFyIGUgPSB0W1N5bWJvbC50b1ByaW1pdGl2ZV07IGlmICh2b2lkIDAgIT09IGUpIHsgdmFyIGkgPSBlLmNhbGwodCwgciB8fCBcImRlZmF1bHRcIik7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiBpKSByZXR1cm4gaTsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpOyB9IHJldHVybiAoXCJzdHJpbmdcIiA9PT0gciA/IFN0cmluZyA6IE51bWJlcikodCk7IH1cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IENoaWxkcmVuLCBQdXJlQ29tcG9uZW50LCB1c2VDYWxsYmFjaywgdXNlQ29udGV4dCwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgc2NhbGVQb2ludCB9IGZyb20gJ3ZpY3RvcnktdmVuZG9yL2QzLXNjYWxlJztcbmltcG9ydCByYW5nZSBmcm9tICdlcy10b29sa2l0L2NvbXBhdC9yYW5nZSc7XG5pbXBvcnQgeyBMYXllciB9IGZyb20gJy4uL2NvbnRhaW5lci9MYXllcic7XG5pbXBvcnQgeyBUZXh0IH0gZnJvbSAnLi4vY29tcG9uZW50L1RleHQnO1xuaW1wb3J0IHsgZ2V0VmFsdWVCeURhdGFLZXkgfSBmcm9tICcuLi91dGlsL0NoYXJ0VXRpbHMnO1xuaW1wb3J0IHsgaXNOdW1iZXIgfSBmcm9tICcuLi91dGlsL0RhdGFVdGlscyc7XG5pbXBvcnQgeyBnZW5lcmF0ZVByZWZpeFN0eWxlIH0gZnJvbSAnLi4vdXRpbC9Dc3NQcmVmaXhVdGlscyc7XG5pbXBvcnQgeyB1c2VDaGFydERhdGEsIHVzZURhdGFJbmRleCB9IGZyb20gJy4uL2NvbnRleHQvY2hhcnREYXRhQ29udGV4dCc7XG5pbXBvcnQgeyBCcnVzaFVwZGF0ZURpc3BhdGNoQ29udGV4dCB9IGZyb20gJy4uL2NvbnRleHQvYnJ1c2hVcGRhdGVDb250ZXh0JztcbmltcG9ydCB7IHVzZUFwcERpc3BhdGNoLCB1c2VBcHBTZWxlY3RvciB9IGZyb20gJy4uL3N0YXRlL2hvb2tzJztcbmltcG9ydCB7IHNldERhdGFTdGFydEVuZEluZGV4ZXMgfSBmcm9tICcuLi9zdGF0ZS9jaGFydERhdGFTbGljZSc7XG5pbXBvcnQgeyBzZXRCcnVzaFNldHRpbmdzIH0gZnJvbSAnLi4vc3RhdGUvYnJ1c2hTbGljZSc7XG5pbXBvcnQgeyBQYW5vcmFtYUNvbnRleHRQcm92aWRlciB9IGZyb20gJy4uL2NvbnRleHQvUGFub3JhbWFDb250ZXh0JztcbmltcG9ydCB7IHNlbGVjdEJydXNoRGltZW5zaW9ucyB9IGZyb20gJy4uL3N0YXRlL3NlbGVjdG9ycy9icnVzaFNlbGVjdG9ycyc7XG5pbXBvcnQgeyB1c2VCcnVzaENoYXJ0U3luY2hyb25pc2F0aW9uIH0gZnJvbSAnLi4vc3luY2hyb25pc2F0aW9uL3VzZUNoYXJ0U3luY2hyb25pc2F0aW9uJztcbmltcG9ydCB7IHJlc29sdmVEZWZhdWx0UHJvcHMgfSBmcm9tICcuLi91dGlsL3Jlc29sdmVEZWZhdWx0UHJvcHMnO1xuaW1wb3J0IHsgc3ZnUHJvcGVydGllc05vRXZlbnRzIH0gZnJvbSAnLi4vdXRpbC9zdmdQcm9wZXJ0aWVzTm9FdmVudHMnO1xuXG4vLyBXaHkgaXMgdGhpcyB0aWNrRm9ybWF0dGVyIGRpZmZlcmVudCBmcm9tIHRoZSBvdGhlciBUaWNrRm9ybWF0dGVycz8gVGhpcyBvbmUgYWxsb3dzIHRvIHJldHVybiBudW1iZXJzIHRvbyBmb3Igc29tZSByZWFzb24uXG5cbmZ1bmN0aW9uIERlZmF1bHRUcmF2ZWxsZXIocHJvcHMpIHtcbiAgdmFyIHtcbiAgICB4LFxuICAgIHksXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIHN0cm9rZVxuICB9ID0gcHJvcHM7XG4gIHZhciBsaW5lWSA9IE1hdGguZmxvb3IoeSArIGhlaWdodCAvIDIpIC0gMTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkZyYWdtZW50LCBudWxsLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcInJlY3RcIiwge1xuICAgIHg6IHgsXG4gICAgeTogeSxcbiAgICB3aWR0aDogd2lkdGgsXG4gICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgZmlsbDogc3Ryb2tlLFxuICAgIHN0cm9rZTogXCJub25lXCJcbiAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFwibGluZVwiLCB7XG4gICAgeDE6IHggKyAxLFxuICAgIHkxOiBsaW5lWSxcbiAgICB4MjogeCArIHdpZHRoIC0gMSxcbiAgICB5MjogbGluZVksXG4gICAgZmlsbDogXCJub25lXCIsXG4gICAgc3Ryb2tlOiBcIiNmZmZcIlxuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsaW5lXCIsIHtcbiAgICB4MTogeCArIDEsXG4gICAgeTE6IGxpbmVZICsgMixcbiAgICB4MjogeCArIHdpZHRoIC0gMSxcbiAgICB5MjogbGluZVkgKyAyLFxuICAgIGZpbGw6IFwibm9uZVwiLFxuICAgIHN0cm9rZTogXCIjZmZmXCJcbiAgfSkpO1xufVxuZnVuY3Rpb24gVHJhdmVsbGVyKHByb3BzKSB7XG4gIHZhciB7XG4gICAgdHJhdmVsbGVyUHJvcHMsXG4gICAgdHJhdmVsbGVyVHlwZVxuICB9ID0gcHJvcHM7XG4gIGlmICgvKiNfX1BVUkVfXyovUmVhY3QuaXNWYWxpZEVsZW1lbnQodHJhdmVsbGVyVHlwZSkpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGVsZW1lbnQgY2xvbmluZyBkaXNhZ3JlZXMgd2l0aCB0aGUgdHlwZXMgKGFuZCBpdCBzaG91bGQpXG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jbG9uZUVsZW1lbnQodHJhdmVsbGVyVHlwZSwgdHJhdmVsbGVyUHJvcHMpO1xuICB9XG4gIGlmICh0eXBlb2YgdHJhdmVsbGVyVHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiB0cmF2ZWxsZXJUeXBlKHRyYXZlbGxlclByb3BzKTtcbiAgfVxuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoRGVmYXVsdFRyYXZlbGxlciwgdHJhdmVsbGVyUHJvcHMpO1xufVxuZnVuY3Rpb24gVHJhdmVsbGVyTGF5ZXIoX3JlZikge1xuICB2YXIgX2RhdGEkc3RhcnRJbmRleCwgX2RhdGEkZW5kSW5kZXg7XG4gIHZhciB7XG4gICAgb3RoZXJQcm9wcyxcbiAgICB0cmF2ZWxsZXJYLFxuICAgIGlkLFxuICAgIG9uTW91c2VFbnRlcixcbiAgICBvbk1vdXNlTGVhdmUsXG4gICAgb25Nb3VzZURvd24sXG4gICAgb25Ub3VjaFN0YXJ0LFxuICAgIG9uVHJhdmVsbGVyTW92ZUtleWJvYXJkLFxuICAgIG9uRm9jdXMsXG4gICAgb25CbHVyXG4gIH0gPSBfcmVmO1xuICB2YXIge1xuICAgIHksXG4gICAgeDogeEZyb21Qcm9wcyxcbiAgICB0cmF2ZWxsZXJXaWR0aCxcbiAgICBoZWlnaHQsXG4gICAgdHJhdmVsbGVyLFxuICAgIGFyaWFMYWJlbCxcbiAgICBkYXRhLFxuICAgIHN0YXJ0SW5kZXgsXG4gICAgZW5kSW5kZXhcbiAgfSA9IG90aGVyUHJvcHM7XG4gIHZhciB4ID0gTWF0aC5tYXgodHJhdmVsbGVyWCwgeEZyb21Qcm9wcyk7XG4gIHZhciB0cmF2ZWxsZXJQcm9wcyA9IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgc3ZnUHJvcGVydGllc05vRXZlbnRzKG90aGVyUHJvcHMpKSwge30sIHtcbiAgICB4LFxuICAgIHksXG4gICAgd2lkdGg6IHRyYXZlbGxlcldpZHRoLFxuICAgIGhlaWdodFxuICB9KTtcbiAgdmFyIGFyaWFMYWJlbEJydXNoID0gYXJpYUxhYmVsIHx8IFwiTWluIHZhbHVlOiBcIi5jb25jYXQoKF9kYXRhJHN0YXJ0SW5kZXggPSBkYXRhW3N0YXJ0SW5kZXhdKSA9PT0gbnVsbCB8fCBfZGF0YSRzdGFydEluZGV4ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZGF0YSRzdGFydEluZGV4Lm5hbWUsIFwiLCBNYXggdmFsdWU6IFwiKS5jb25jYXQoKF9kYXRhJGVuZEluZGV4ID0gZGF0YVtlbmRJbmRleF0pID09PSBudWxsIHx8IF9kYXRhJGVuZEluZGV4ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZGF0YSRlbmRJbmRleC5uYW1lKTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExheWVyLCB7XG4gICAgdGFiSW5kZXg6IDAsXG4gICAgcm9sZTogXCJzbGlkZXJcIixcbiAgICBcImFyaWEtbGFiZWxcIjogYXJpYUxhYmVsQnJ1c2gsXG4gICAgXCJhcmlhLXZhbHVlbm93XCI6IHRyYXZlbGxlclgsXG4gICAgY2xhc3NOYW1lOiBcInJlY2hhcnRzLWJydXNoLXRyYXZlbGxlclwiLFxuICAgIG9uTW91c2VFbnRlcjogb25Nb3VzZUVudGVyLFxuICAgIG9uTW91c2VMZWF2ZTogb25Nb3VzZUxlYXZlLFxuICAgIG9uTW91c2VEb3duOiBvbk1vdXNlRG93bixcbiAgICBvblRvdWNoU3RhcnQ6IG9uVG91Y2hTdGFydCxcbiAgICBvbktleURvd246IGUgPT4ge1xuICAgICAgaWYgKCFbJ0Fycm93TGVmdCcsICdBcnJvd1JpZ2h0J10uaW5jbHVkZXMoZS5rZXkpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBvblRyYXZlbGxlck1vdmVLZXlib2FyZChlLmtleSA9PT0gJ0Fycm93UmlnaHQnID8gMSA6IC0xLCBpZCk7XG4gICAgfSxcbiAgICBvbkZvY3VzOiBvbkZvY3VzLFxuICAgIG9uQmx1cjogb25CbHVyLFxuICAgIHN0eWxlOiB7XG4gICAgICBjdXJzb3I6ICdjb2wtcmVzaXplJ1xuICAgIH1cbiAgfSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoVHJhdmVsbGVyLCB7XG4gICAgdHJhdmVsbGVyVHlwZTogdHJhdmVsbGVyLFxuICAgIHRyYXZlbGxlclByb3BzOiB0cmF2ZWxsZXJQcm9wc1xuICB9KSk7XG59XG4vKlxuICogVGhpcyBvbmUgY2Fubm90IGJlIGEgUmVhY3QgQ29tcG9uZW50IGJlY2F1c2UgUmVhY3QgaXMgbm90IGhhcHB5IHdpdGggaXQgcmV0dXJuaW5nIG9ubHkgc3RyaW5nIHwgbnVtYmVyLlxuICogUmVhY3Qgd2FudHMgYSBmdWxsIFJlYWN0LkpTWC5FbGVtZW50IGJ1dCB0aGF0IGlzIG5vdCBjb21wYXRpYmxlIHdpdGggVGV4dCBjb21wb25lbnQuXG4gKi9cbmZ1bmN0aW9uIGdldFRleHRPZlRpY2socHJvcHMpIHtcbiAgdmFyIHtcbiAgICBpbmRleCxcbiAgICBkYXRhLFxuICAgIHRpY2tGb3JtYXR0ZXIsXG4gICAgZGF0YUtleVxuICB9ID0gcHJvcHM7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgZ2V0VmFsdWVCeURhdGFLZXkgZG9lcyBub3QgdmFsaWRhdGUgdGhlIG91dHB1dCB0eXBlXG4gIHZhciB0ZXh0ID0gZ2V0VmFsdWVCeURhdGFLZXkoZGF0YVtpbmRleF0sIGRhdGFLZXksIGluZGV4KTtcbiAgcmV0dXJuIHR5cGVvZiB0aWNrRm9ybWF0dGVyID09PSAnZnVuY3Rpb24nID8gdGlja0Zvcm1hdHRlcih0ZXh0LCBpbmRleCkgOiB0ZXh0O1xufVxuZnVuY3Rpb24gZ2V0SW5kZXhJblJhbmdlKHZhbHVlUmFuZ2UsIHgpIHtcbiAgdmFyIGxlbiA9IHZhbHVlUmFuZ2UubGVuZ3RoO1xuICB2YXIgc3RhcnQgPSAwO1xuICB2YXIgZW5kID0gbGVuIC0gMTtcbiAgd2hpbGUgKGVuZCAtIHN0YXJ0ID4gMSkge1xuICAgIHZhciBtaWRkbGUgPSBNYXRoLmZsb29yKChzdGFydCArIGVuZCkgLyAyKTtcbiAgICBpZiAodmFsdWVSYW5nZVttaWRkbGVdID4geCkge1xuICAgICAgZW5kID0gbWlkZGxlO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGFydCA9IG1pZGRsZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHggPj0gdmFsdWVSYW5nZVtlbmRdID8gZW5kIDogc3RhcnQ7XG59XG5mdW5jdGlvbiBnZXRJbmRleChfcmVmMikge1xuICB2YXIge1xuICAgIHN0YXJ0WCxcbiAgICBlbmRYLFxuICAgIHNjYWxlVmFsdWVzLFxuICAgIGdhcCxcbiAgICBkYXRhXG4gIH0gPSBfcmVmMjtcbiAgdmFyIGxhc3RJbmRleCA9IGRhdGEubGVuZ3RoIC0gMTtcbiAgdmFyIG1pbiA9IE1hdGgubWluKHN0YXJ0WCwgZW5kWCk7XG4gIHZhciBtYXggPSBNYXRoLm1heChzdGFydFgsIGVuZFgpO1xuICB2YXIgbWluSW5kZXggPSBnZXRJbmRleEluUmFuZ2Uoc2NhbGVWYWx1ZXMsIG1pbik7XG4gIHZhciBtYXhJbmRleCA9IGdldEluZGV4SW5SYW5nZShzY2FsZVZhbHVlcywgbWF4KTtcbiAgcmV0dXJuIHtcbiAgICBzdGFydEluZGV4OiBtaW5JbmRleCAtIG1pbkluZGV4ICUgZ2FwLFxuICAgIGVuZEluZGV4OiBtYXhJbmRleCA9PT0gbGFzdEluZGV4ID8gbGFzdEluZGV4IDogbWF4SW5kZXggLSBtYXhJbmRleCAlIGdhcFxuICB9O1xufVxuZnVuY3Rpb24gQmFja2dyb3VuZChfcmVmMykge1xuICB2YXIge1xuICAgIHgsXG4gICAgeSxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgZmlsbCxcbiAgICBzdHJva2VcbiAgfSA9IF9yZWYzO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJyZWN0XCIsIHtcbiAgICBzdHJva2U6IHN0cm9rZSxcbiAgICBmaWxsOiBmaWxsLFxuICAgIHg6IHgsXG4gICAgeTogeSxcbiAgICB3aWR0aDogd2lkdGgsXG4gICAgaGVpZ2h0OiBoZWlnaHRcbiAgfSk7XG59XG5mdW5jdGlvbiBCcnVzaFRleHQoX3JlZjQpIHtcbiAgdmFyIHtcbiAgICBzdGFydEluZGV4LFxuICAgIGVuZEluZGV4LFxuICAgIHksXG4gICAgaGVpZ2h0LFxuICAgIHRyYXZlbGxlcldpZHRoLFxuICAgIHN0cm9rZSxcbiAgICB0aWNrRm9ybWF0dGVyLFxuICAgIGRhdGFLZXksXG4gICAgZGF0YSxcbiAgICBzdGFydFgsXG4gICAgZW5kWFxuICB9ID0gX3JlZjQ7XG4gIHZhciBvZmZzZXQgPSA1O1xuICB2YXIgYXR0cnMgPSB7XG4gICAgcG9pbnRlckV2ZW50czogJ25vbmUnLFxuICAgIGZpbGw6IHN0cm9rZVxuICB9O1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGF5ZXIsIHtcbiAgICBjbGFzc05hbWU6IFwicmVjaGFydHMtYnJ1c2gtdGV4dHNcIlxuICB9LCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChUZXh0LCBfZXh0ZW5kcyh7XG4gICAgdGV4dEFuY2hvcjogXCJlbmRcIixcbiAgICB2ZXJ0aWNhbEFuY2hvcjogXCJtaWRkbGVcIixcbiAgICB4OiBNYXRoLm1pbihzdGFydFgsIGVuZFgpIC0gb2Zmc2V0LFxuICAgIHk6IHkgKyBoZWlnaHQgLyAyXG4gIH0sIGF0dHJzKSwgZ2V0VGV4dE9mVGljayh7XG4gICAgaW5kZXg6IHN0YXJ0SW5kZXgsXG4gICAgdGlja0Zvcm1hdHRlcixcbiAgICBkYXRhS2V5LFxuICAgIGRhdGFcbiAgfSkpLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChUZXh0LCBfZXh0ZW5kcyh7XG4gICAgdGV4dEFuY2hvcjogXCJzdGFydFwiLFxuICAgIHZlcnRpY2FsQW5jaG9yOiBcIm1pZGRsZVwiLFxuICAgIHg6IE1hdGgubWF4KHN0YXJ0WCwgZW5kWCkgKyB0cmF2ZWxsZXJXaWR0aCArIG9mZnNldCxcbiAgICB5OiB5ICsgaGVpZ2h0IC8gMlxuICB9LCBhdHRycyksIGdldFRleHRPZlRpY2soe1xuICAgIGluZGV4OiBlbmRJbmRleCxcbiAgICB0aWNrRm9ybWF0dGVyLFxuICAgIGRhdGFLZXksXG4gICAgZGF0YVxuICB9KSkpO1xufVxuZnVuY3Rpb24gU2xpZGUoX3JlZjUpIHtcbiAgdmFyIHtcbiAgICB5LFxuICAgIGhlaWdodCxcbiAgICBzdHJva2UsXG4gICAgdHJhdmVsbGVyV2lkdGgsXG4gICAgc3RhcnRYLFxuICAgIGVuZFgsXG4gICAgb25Nb3VzZUVudGVyLFxuICAgIG9uTW91c2VMZWF2ZSxcbiAgICBvbk1vdXNlRG93bixcbiAgICBvblRvdWNoU3RhcnRcbiAgfSA9IF9yZWY1O1xuICB2YXIgeCA9IE1hdGgubWluKHN0YXJ0WCwgZW5kWCkgKyB0cmF2ZWxsZXJXaWR0aDtcbiAgdmFyIHdpZHRoID0gTWF0aC5tYXgoTWF0aC5hYnMoZW5kWCAtIHN0YXJ0WCkgLSB0cmF2ZWxsZXJXaWR0aCwgMCk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcInJlY3RcIiwge1xuICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1icnVzaC1zbGlkZVwiLFxuICAgIG9uTW91c2VFbnRlcjogb25Nb3VzZUVudGVyLFxuICAgIG9uTW91c2VMZWF2ZTogb25Nb3VzZUxlYXZlLFxuICAgIG9uTW91c2VEb3duOiBvbk1vdXNlRG93bixcbiAgICBvblRvdWNoU3RhcnQ6IG9uVG91Y2hTdGFydCxcbiAgICBzdHlsZToge1xuICAgICAgY3Vyc29yOiAnbW92ZSdcbiAgICB9LFxuICAgIHN0cm9rZTogXCJub25lXCIsXG4gICAgZmlsbDogc3Ryb2tlLFxuICAgIGZpbGxPcGFjaXR5OiAwLjIsXG4gICAgeDogeCxcbiAgICB5OiB5LFxuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBoZWlnaHQ6IGhlaWdodFxuICB9KTtcbn1cbmZ1bmN0aW9uIFBhbm9yYW1hKF9yZWY2KSB7XG4gIHZhciB7XG4gICAgeCxcbiAgICB5LFxuICAgIHdpZHRoLFxuICAgIGhlaWdodCxcbiAgICBkYXRhLFxuICAgIGNoaWxkcmVuLFxuICAgIHBhZGRpbmdcbiAgfSA9IF9yZWY2O1xuICB2YXIgaXNQYW5vcmFtaWMgPSBSZWFjdC5DaGlsZHJlbi5jb3VudChjaGlsZHJlbikgPT09IDE7XG4gIGlmICghaXNQYW5vcmFtaWMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgY2hhcnRFbGVtZW50ID0gQ2hpbGRyZW4ub25seShjaGlsZHJlbik7XG4gIGlmICghY2hhcnRFbGVtZW50KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jbG9uZUVsZW1lbnQoY2hhcnRFbGVtZW50LCB7XG4gICAgeCxcbiAgICB5LFxuICAgIHdpZHRoLFxuICAgIGhlaWdodCxcbiAgICBtYXJnaW46IHBhZGRpbmcsXG4gICAgY29tcGFjdDogdHJ1ZSxcbiAgICBkYXRhXG4gIH0pO1xufVxudmFyIGNyZWF0ZVNjYWxlID0gX3JlZjcgPT4ge1xuICB2YXIge1xuICAgIGRhdGEsXG4gICAgc3RhcnRJbmRleCxcbiAgICBlbmRJbmRleCxcbiAgICB4LFxuICAgIHdpZHRoLFxuICAgIHRyYXZlbGxlcldpZHRoXG4gIH0gPSBfcmVmNztcbiAgaWYgKCFkYXRhIHx8ICFkYXRhLmxlbmd0aCkge1xuICAgIHJldHVybiB7fTtcbiAgfVxuICB2YXIgbGVuID0gZGF0YS5sZW5ndGg7XG4gIHZhciBzY2FsZSA9IHNjYWxlUG9pbnQoKS5kb21haW4ocmFuZ2UoMCwgbGVuKSkucmFuZ2UoW3gsIHggKyB3aWR0aCAtIHRyYXZlbGxlcldpZHRoXSk7XG4gIHZhciBzY2FsZVZhbHVlcyA9IHNjYWxlLmRvbWFpbigpLm1hcChlbnRyeSA9PiBzY2FsZShlbnRyeSkpO1xuICByZXR1cm4ge1xuICAgIGlzVGV4dEFjdGl2ZTogZmFsc2UsXG4gICAgaXNTbGlkZU1vdmluZzogZmFsc2UsXG4gICAgaXNUcmF2ZWxsZXJNb3Zpbmc6IGZhbHNlLFxuICAgIGlzVHJhdmVsbGVyRm9jdXNlZDogZmFsc2UsXG4gICAgc3RhcnRYOiBzY2FsZShzdGFydEluZGV4KSxcbiAgICBlbmRYOiBzY2FsZShlbmRJbmRleCksXG4gICAgc2NhbGUsXG4gICAgc2NhbGVWYWx1ZXNcbiAgfTtcbn07XG52YXIgaXNUb3VjaCA9IGUgPT4gZS5jaGFuZ2VkVG91Y2hlcyAmJiAhIWUuY2hhbmdlZFRvdWNoZXMubGVuZ3RoO1xuY2xhc3MgQnJ1c2hXaXRoU3RhdGUgZXh0ZW5kcyBQdXJlQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgX2RlZmluZVByb3BlcnR5KHRoaXMsIFwiaGFuZGxlRHJhZ1wiLCBlID0+IHtcbiAgICAgIGlmICh0aGlzLmxlYXZlVGltZXIpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMubGVhdmVUaW1lcik7XG4gICAgICAgIHRoaXMubGVhdmVUaW1lciA9IG51bGw7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zdGF0ZS5pc1RyYXZlbGxlck1vdmluZykge1xuICAgICAgICB0aGlzLmhhbmRsZVRyYXZlbGxlck1vdmUoZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuaXNTbGlkZU1vdmluZykge1xuICAgICAgICB0aGlzLmhhbmRsZVNsaWRlRHJhZyhlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBfZGVmaW5lUHJvcGVydHkodGhpcywgXCJoYW5kbGVUb3VjaE1vdmVcIiwgZSA9PiB7XG4gICAgICBpZiAoZS5jaGFuZ2VkVG91Y2hlcyAhPSBudWxsICYmIGUuY2hhbmdlZFRvdWNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLmhhbmRsZURyYWcoZS5jaGFuZ2VkVG91Y2hlc1swXSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgX2RlZmluZVByb3BlcnR5KHRoaXMsIFwiaGFuZGxlRHJhZ0VuZFwiLCAoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaXNUcmF2ZWxsZXJNb3Zpbmc6IGZhbHNlLFxuICAgICAgICBpc1NsaWRlTW92aW5nOiBmYWxzZVxuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICB2YXIge1xuICAgICAgICAgIGVuZEluZGV4LFxuICAgICAgICAgIG9uRHJhZ0VuZCxcbiAgICAgICAgICBzdGFydEluZGV4XG4gICAgICAgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBvbkRyYWdFbmQgPT09IG51bGwgfHwgb25EcmFnRW5kID09PSB2b2lkIDAgfHwgb25EcmFnRW5kKHtcbiAgICAgICAgICBlbmRJbmRleCxcbiAgICAgICAgICBzdGFydEluZGV4XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmRldGFjaERyYWdFbmRMaXN0ZW5lcigpO1xuICAgIH0pO1xuICAgIF9kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImhhbmRsZUxlYXZlV3JhcHBlclwiLCAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5pc1RyYXZlbGxlck1vdmluZyB8fCB0aGlzLnN0YXRlLmlzU2xpZGVNb3ZpbmcpIHtcbiAgICAgICAgdGhpcy5sZWF2ZVRpbWVyID0gd2luZG93LnNldFRpbWVvdXQodGhpcy5oYW5kbGVEcmFnRW5kLCB0aGlzLnByb3BzLmxlYXZlVGltZU91dCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgX2RlZmluZVByb3BlcnR5KHRoaXMsIFwiaGFuZGxlRW50ZXJTbGlkZU9yVHJhdmVsbGVyXCIsICgpID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpc1RleHRBY3RpdmU6IHRydWVcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIF9kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImhhbmRsZUxlYXZlU2xpZGVPclRyYXZlbGxlclwiLCAoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaXNUZXh0QWN0aXZlOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgX2RlZmluZVByb3BlcnR5KHRoaXMsIFwiaGFuZGxlU2xpZGVEcmFnU3RhcnRcIiwgZSA9PiB7XG4gICAgICB2YXIgZXZlbnQgPSBpc1RvdWNoKGUpID8gZS5jaGFuZ2VkVG91Y2hlc1swXSA6IGU7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaXNUcmF2ZWxsZXJNb3Zpbmc6IGZhbHNlLFxuICAgICAgICBpc1NsaWRlTW92aW5nOiB0cnVlLFxuICAgICAgICBzbGlkZU1vdmVTdGFydFg6IGV2ZW50LnBhZ2VYXG4gICAgICB9KTtcbiAgICAgIHRoaXMuYXR0YWNoRHJhZ0VuZExpc3RlbmVyKCk7XG4gICAgfSk7XG4gICAgX2RlZmluZVByb3BlcnR5KHRoaXMsIFwiaGFuZGxlVHJhdmVsbGVyTW92ZUtleWJvYXJkXCIsIChkaXJlY3Rpb24sIGlkKSA9PiB7XG4gICAgICB2YXIge1xuICAgICAgICBkYXRhLFxuICAgICAgICBnYXAsXG4gICAgICAgIHN0YXJ0SW5kZXgsXG4gICAgICAgIGVuZEluZGV4XG4gICAgICB9ID0gdGhpcy5wcm9wcztcbiAgICAgIC8vIHNjYWxlVmFsdWVzIGFyZSBhIGxpc3Qgb2YgY29vcmRpbmF0ZXMuIEZvciBleGFtcGxlOiBbNjUsIDI1MCwgNDM1LCA2MjAsIDgwNSwgOTkwXS5cbiAgICAgIHZhciB7XG4gICAgICAgIHNjYWxlVmFsdWVzLFxuICAgICAgICBzdGFydFgsXG4gICAgICAgIGVuZFhcbiAgICAgIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgaWYgKHNjYWxlVmFsdWVzID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyB1bmxlc3Mgd2Ugc2VhcmNoIGZvciB0aGUgY2xvc2VzdCBzY2FsZVZhbHVlIHRvIHRoZSBjdXJyZW50IGNvb3JkaW5hdGVcbiAgICAgIC8vIHdlIG5lZWQgdG8gbW92ZSB0cmF2ZWxlcnMgdmlhIGluZGV4IHdoZW4gdXNpbmcgdGhlIGtleWJvYXJkXG4gICAgICB2YXIgY3VycmVudEluZGV4ID0gLTE7XG4gICAgICBpZiAoaWQgPT09ICdzdGFydFgnKSB7XG4gICAgICAgIGN1cnJlbnRJbmRleCA9IHN0YXJ0SW5kZXg7XG4gICAgICB9IGVsc2UgaWYgKGlkID09PSAnZW5kWCcpIHtcbiAgICAgICAgY3VycmVudEluZGV4ID0gZW5kSW5kZXg7XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudEluZGV4IDwgMCB8fCBjdXJyZW50SW5kZXggPj0gZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIG5ld0luZGV4ID0gY3VycmVudEluZGV4ICsgZGlyZWN0aW9uO1xuICAgICAgaWYgKG5ld0luZGV4ID09PSAtMSB8fCBuZXdJbmRleCA+PSBzY2FsZVZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIG5ld1NjYWxlVmFsdWUgPSBzY2FsZVZhbHVlc1tuZXdJbmRleF07XG5cbiAgICAgIC8vIFByZXZlbnQgdHJhdmVsbGVycyBmcm9tIGJlaW5nIG9uIHRvcCBvZiBlYWNoIG90aGVyIG9yIG92ZXJsYXBwaW5nXG4gICAgICBpZiAoaWQgPT09ICdzdGFydFgnICYmIG5ld1NjYWxlVmFsdWUgPj0gZW5kWCB8fCBpZCA9PT0gJ2VuZFgnICYmIG5ld1NjYWxlVmFsdWUgPD0gc3RhcnRYKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIG5vdCBzdXJlIHdoeSB0eXBlc2NyaXB0IGlzIG5vdCBoYXBweSB3aXRoIHRoaXMsIHBhcnRpYWwgdXBkYXRlIGlzIGZpbmUgaW4gUmVhY3RcbiAgICAgIHtcbiAgICAgICAgW2lkXTogbmV3U2NhbGVWYWx1ZVxuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKGdldEluZGV4KHtcbiAgICAgICAgICBzdGFydFg6IHRoaXMuc3RhdGUuc3RhcnRYLFxuICAgICAgICAgIGVuZFg6IHRoaXMuc3RhdGUuZW5kWCxcbiAgICAgICAgICBkYXRhLFxuICAgICAgICAgIGdhcCxcbiAgICAgICAgICBzY2FsZVZhbHVlc1xuICAgICAgICB9KSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLnRyYXZlbGxlckRyYWdTdGFydEhhbmRsZXJzID0ge1xuICAgICAgc3RhcnRYOiB0aGlzLmhhbmRsZVRyYXZlbGxlckRyYWdTdGFydC5iaW5kKHRoaXMsICdzdGFydFgnKSxcbiAgICAgIGVuZFg6IHRoaXMuaGFuZGxlVHJhdmVsbGVyRHJhZ1N0YXJ0LmJpbmQodGhpcywgJ2VuZFgnKVxuICAgIH07XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGJydXNoTW92ZVN0YXJ0WDogMCxcbiAgICAgIG1vdmluZ1RyYXZlbGxlcklkOiB1bmRlZmluZWQsXG4gICAgICBlbmRYOiAwLFxuICAgICAgc3RhcnRYOiAwLFxuICAgICAgc2xpZGVNb3ZlU3RhcnRYOiAwXG4gICAgfTtcbiAgfVxuICBzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKG5leHRQcm9wcywgcHJldlN0YXRlKSB7XG4gICAgdmFyIHtcbiAgICAgIGRhdGEsXG4gICAgICB3aWR0aCxcbiAgICAgIHgsXG4gICAgICB0cmF2ZWxsZXJXaWR0aCxcbiAgICAgIHN0YXJ0SW5kZXgsXG4gICAgICBlbmRJbmRleCxcbiAgICAgIHN0YXJ0SW5kZXhDb250cm9sbGVkRnJvbVByb3BzLFxuICAgICAgZW5kSW5kZXhDb250cm9sbGVkRnJvbVByb3BzXG4gICAgfSA9IG5leHRQcm9wcztcbiAgICBpZiAoZGF0YSAhPT0gcHJldlN0YXRlLnByZXZEYXRhKSB7XG4gICAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7XG4gICAgICAgIHByZXZEYXRhOiBkYXRhLFxuICAgICAgICBwcmV2VHJhdmVsbGVyV2lkdGg6IHRyYXZlbGxlcldpZHRoLFxuICAgICAgICBwcmV2WDogeCxcbiAgICAgICAgcHJldldpZHRoOiB3aWR0aFxuICAgICAgfSwgZGF0YSAmJiBkYXRhLmxlbmd0aCA/IGNyZWF0ZVNjYWxlKHtcbiAgICAgICAgZGF0YSxcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIHgsXG4gICAgICAgIHRyYXZlbGxlcldpZHRoLFxuICAgICAgICBzdGFydEluZGV4LFxuICAgICAgICBlbmRJbmRleFxuICAgICAgfSkgOiB7XG4gICAgICAgIHNjYWxlOiB1bmRlZmluZWQsXG4gICAgICAgIHNjYWxlVmFsdWVzOiB1bmRlZmluZWRcbiAgICAgIH0pO1xuICAgIH1cbiAgICB2YXIgcHJldlNjYWxlID0gcHJldlN0YXRlLnNjYWxlO1xuICAgIGlmIChwcmV2U2NhbGUgJiYgKHdpZHRoICE9PSBwcmV2U3RhdGUucHJldldpZHRoIHx8IHggIT09IHByZXZTdGF0ZS5wcmV2WCB8fCB0cmF2ZWxsZXJXaWR0aCAhPT0gcHJldlN0YXRlLnByZXZUcmF2ZWxsZXJXaWR0aCkpIHtcbiAgICAgIHByZXZTY2FsZS5yYW5nZShbeCwgeCArIHdpZHRoIC0gdHJhdmVsbGVyV2lkdGhdKTtcbiAgICAgIHZhciBzY2FsZVZhbHVlcyA9IHByZXZTY2FsZS5kb21haW4oKS5tYXAoZW50cnkgPT4gcHJldlNjYWxlKGVudHJ5KSkuZmlsdGVyKHZhbHVlID0+IHZhbHVlICE9IG51bGwpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcHJldkRhdGE6IGRhdGEsXG4gICAgICAgIHByZXZUcmF2ZWxsZXJXaWR0aDogdHJhdmVsbGVyV2lkdGgsXG4gICAgICAgIHByZXZYOiB4LFxuICAgICAgICBwcmV2V2lkdGg6IHdpZHRoLFxuICAgICAgICBzdGFydFg6IHByZXZTY2FsZShuZXh0UHJvcHMuc3RhcnRJbmRleCksXG4gICAgICAgIGVuZFg6IHByZXZTY2FsZShuZXh0UHJvcHMuZW5kSW5kZXgpLFxuICAgICAgICBzY2FsZVZhbHVlc1xuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKHByZXZTdGF0ZS5zY2FsZSAmJiAhcHJldlN0YXRlLmlzU2xpZGVNb3ZpbmcgJiYgIXByZXZTdGF0ZS5pc1RyYXZlbGxlck1vdmluZyAmJiAhcHJldlN0YXRlLmlzVHJhdmVsbGVyRm9jdXNlZCAmJiAhcHJldlN0YXRlLmlzVGV4dEFjdGl2ZSkge1xuICAgICAgLypcbiAgICAgICAqIElmIHRoZSBzdGFydEluZGV4IG9yIGVuZEluZGV4IGFyZSBjb250cm9sbGVkIGZyb20gdGhlIG91dHNpZGUsXG4gICAgICAgKiB3ZSBuZWVkIHRvIGtlZXAgdGhlIHN0YXJ0WCBhbmQgZW5kIHVwIHRvIGRhdGUuXG4gICAgICAgKiBBbHNvIHdlIGRvIG5vdCB3YW50IHRvIGRvIHRoYXQgd2hpbGUgdXNlciBpcyBpbnRlcmFjdGluZyBpbiB0aGUgYnJ1c2gsXG4gICAgICAgKiBiZWNhdXNlIHRoaXMgd2lsbCB0cmlnZ2VyIHJlLXJlbmRlciBhbmQgaW50ZXJydXB0IHRoZSBkcmFnJmRyb3AuXG4gICAgICAgKi9cbiAgICAgIGlmIChzdGFydEluZGV4Q29udHJvbGxlZEZyb21Qcm9wcyAhPSBudWxsICYmIHByZXZTdGF0ZS5wcmV2U3RhcnRJbmRleENvbnRyb2xsZWRGcm9tUHJvcHMgIT09IHN0YXJ0SW5kZXhDb250cm9sbGVkRnJvbVByb3BzKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3RhcnRYOiBwcmV2U3RhdGUuc2NhbGUoc3RhcnRJbmRleENvbnRyb2xsZWRGcm9tUHJvcHMpLFxuICAgICAgICAgIHByZXZTdGFydEluZGV4Q29udHJvbGxlZEZyb21Qcm9wczogc3RhcnRJbmRleENvbnRyb2xsZWRGcm9tUHJvcHNcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlbmRJbmRleENvbnRyb2xsZWRGcm9tUHJvcHMgIT0gbnVsbCAmJiBwcmV2U3RhdGUucHJldkVuZEluZGV4Q29udHJvbGxlZEZyb21Qcm9wcyAhPT0gZW5kSW5kZXhDb250cm9sbGVkRnJvbVByb3BzKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZW5kWDogcHJldlN0YXRlLnNjYWxlKGVuZEluZGV4Q29udHJvbGxlZEZyb21Qcm9wcyksXG4gICAgICAgICAgcHJldkVuZEluZGV4Q29udHJvbGxlZEZyb21Qcm9wczogZW5kSW5kZXhDb250cm9sbGVkRnJvbVByb3BzXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIGlmICh0aGlzLmxlYXZlVGltZXIpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmxlYXZlVGltZXIpO1xuICAgICAgdGhpcy5sZWF2ZVRpbWVyID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5kZXRhY2hEcmFnRW5kTGlzdGVuZXIoKTtcbiAgfVxuICBhdHRhY2hEcmFnRW5kTGlzdGVuZXIoKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLmhhbmRsZURyYWdFbmQsIHRydWUpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuaGFuZGxlRHJhZ0VuZCwgdHJ1ZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuaGFuZGxlRHJhZywgdHJ1ZSk7XG4gIH1cbiAgZGV0YWNoRHJhZ0VuZExpc3RlbmVyKCkge1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5oYW5kbGVEcmFnRW5kLCB0cnVlKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLmhhbmRsZURyYWdFbmQsIHRydWUpO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLmhhbmRsZURyYWcsIHRydWUpO1xuICB9XG4gIGhhbmRsZVNsaWRlRHJhZyhlKSB7XG4gICAgdmFyIHtcbiAgICAgIHNsaWRlTW92ZVN0YXJ0WCxcbiAgICAgIHN0YXJ0WCxcbiAgICAgIGVuZFgsXG4gICAgICBzY2FsZVZhbHVlc1xuICAgIH0gPSB0aGlzLnN0YXRlO1xuICAgIGlmIChzY2FsZVZhbHVlcyA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB7XG4gICAgICB4LFxuICAgICAgd2lkdGgsXG4gICAgICB0cmF2ZWxsZXJXaWR0aCxcbiAgICAgIHN0YXJ0SW5kZXgsXG4gICAgICBlbmRJbmRleCxcbiAgICAgIG9uQ2hhbmdlLFxuICAgICAgZGF0YSxcbiAgICAgIGdhcFxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIHZhciBkZWx0YSA9IGUucGFnZVggLSBzbGlkZU1vdmVTdGFydFg7XG4gICAgaWYgKGRlbHRhID4gMCkge1xuICAgICAgZGVsdGEgPSBNYXRoLm1pbihkZWx0YSwgeCArIHdpZHRoIC0gdHJhdmVsbGVyV2lkdGggLSBlbmRYLCB4ICsgd2lkdGggLSB0cmF2ZWxsZXJXaWR0aCAtIHN0YXJ0WCk7XG4gICAgfSBlbHNlIGlmIChkZWx0YSA8IDApIHtcbiAgICAgIGRlbHRhID0gTWF0aC5tYXgoZGVsdGEsIHggLSBzdGFydFgsIHggLSBlbmRYKTtcbiAgICB9XG4gICAgdmFyIG5ld0luZGV4ID0gZ2V0SW5kZXgoe1xuICAgICAgc3RhcnRYOiBzdGFydFggKyBkZWx0YSxcbiAgICAgIGVuZFg6IGVuZFggKyBkZWx0YSxcbiAgICAgIGRhdGEsXG4gICAgICBnYXAsXG4gICAgICBzY2FsZVZhbHVlc1xuICAgIH0pO1xuICAgIGlmICgobmV3SW5kZXguc3RhcnRJbmRleCAhPT0gc3RhcnRJbmRleCB8fCBuZXdJbmRleC5lbmRJbmRleCAhPT0gZW5kSW5kZXgpICYmIG9uQ2hhbmdlKSB7XG4gICAgICBvbkNoYW5nZShuZXdJbmRleCk7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc3RhcnRYOiBzdGFydFggKyBkZWx0YSxcbiAgICAgIGVuZFg6IGVuZFggKyBkZWx0YSxcbiAgICAgIHNsaWRlTW92ZVN0YXJ0WDogZS5wYWdlWFxuICAgIH0pO1xuICB9XG4gIGhhbmRsZVRyYXZlbGxlckRyYWdTdGFydChpZCwgZSkge1xuICAgIHZhciBldmVudCA9IGlzVG91Y2goZSkgPyBlLmNoYW5nZWRUb3VjaGVzWzBdIDogZTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzU2xpZGVNb3Zpbmc6IGZhbHNlLFxuICAgICAgaXNUcmF2ZWxsZXJNb3Zpbmc6IHRydWUsXG4gICAgICBtb3ZpbmdUcmF2ZWxsZXJJZDogaWQsXG4gICAgICBicnVzaE1vdmVTdGFydFg6IGV2ZW50LnBhZ2VYXG4gICAgfSk7XG4gICAgdGhpcy5hdHRhY2hEcmFnRW5kTGlzdGVuZXIoKTtcbiAgfVxuICBoYW5kbGVUcmF2ZWxsZXJNb3ZlKGUpIHtcbiAgICB2YXIge1xuICAgICAgYnJ1c2hNb3ZlU3RhcnRYLFxuICAgICAgbW92aW5nVHJhdmVsbGVySWQsXG4gICAgICBlbmRYLFxuICAgICAgc3RhcnRYLFxuICAgICAgc2NhbGVWYWx1ZXNcbiAgICB9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAobW92aW5nVHJhdmVsbGVySWQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgcHJldlZhbHVlID0gdGhpcy5zdGF0ZVttb3ZpbmdUcmF2ZWxsZXJJZF07XG4gICAgdmFyIHtcbiAgICAgIHgsXG4gICAgICB3aWR0aCxcbiAgICAgIHRyYXZlbGxlcldpZHRoLFxuICAgICAgb25DaGFuZ2UsXG4gICAgICBnYXAsXG4gICAgICBkYXRhXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgdmFyIHBhcmFtcyA9IHtcbiAgICAgIHN0YXJ0WDogdGhpcy5zdGF0ZS5zdGFydFgsXG4gICAgICBlbmRYOiB0aGlzLnN0YXRlLmVuZFgsXG4gICAgICBkYXRhLFxuICAgICAgZ2FwLFxuICAgICAgc2NhbGVWYWx1ZXNcbiAgICB9O1xuICAgIHZhciBkZWx0YSA9IGUucGFnZVggLSBicnVzaE1vdmVTdGFydFg7XG4gICAgaWYgKGRlbHRhID4gMCkge1xuICAgICAgZGVsdGEgPSBNYXRoLm1pbihkZWx0YSwgeCArIHdpZHRoIC0gdHJhdmVsbGVyV2lkdGggLSBwcmV2VmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoZGVsdGEgPCAwKSB7XG4gICAgICBkZWx0YSA9IE1hdGgubWF4KGRlbHRhLCB4IC0gcHJldlZhbHVlKTtcbiAgICB9XG4gICAgcGFyYW1zW21vdmluZ1RyYXZlbGxlcklkXSA9IHByZXZWYWx1ZSArIGRlbHRhO1xuICAgIHZhciBuZXdJbmRleCA9IGdldEluZGV4KHBhcmFtcyk7XG4gICAgdmFyIHtcbiAgICAgIHN0YXJ0SW5kZXgsXG4gICAgICBlbmRJbmRleFxuICAgIH0gPSBuZXdJbmRleDtcbiAgICB2YXIgaXNGdWxsR2FwID0gKCkgPT4ge1xuICAgICAgdmFyIGxhc3RJbmRleCA9IGRhdGEubGVuZ3RoIC0gMTtcbiAgICAgIGlmIChtb3ZpbmdUcmF2ZWxsZXJJZCA9PT0gJ3N0YXJ0WCcgJiYgKGVuZFggPiBzdGFydFggPyBzdGFydEluZGV4ICUgZ2FwID09PSAwIDogZW5kSW5kZXggJSBnYXAgPT09IDApIHx8IGVuZFggPCBzdGFydFggJiYgZW5kSW5kZXggPT09IGxhc3RJbmRleCB8fCBtb3ZpbmdUcmF2ZWxsZXJJZCA9PT0gJ2VuZFgnICYmIChlbmRYID4gc3RhcnRYID8gZW5kSW5kZXggJSBnYXAgPT09IDAgOiBzdGFydEluZGV4ICUgZ2FwID09PSAwKSB8fCBlbmRYID4gc3RhcnRYICYmIGVuZEluZGV4ID09PSBsYXN0SW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgICB0aGlzLnNldFN0YXRlKFxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3Igbm90IHN1cmUgd2h5IHR5cGVzY3JpcHQgaXMgbm90IGhhcHB5IHdpdGggdGhpcywgcGFydGlhbCB1cGRhdGUgaXMgZmluZSBpbiBSZWFjdFxuICAgIHtcbiAgICAgIFttb3ZpbmdUcmF2ZWxsZXJJZF06IHByZXZWYWx1ZSArIGRlbHRhLFxuICAgICAgYnJ1c2hNb3ZlU3RhcnRYOiBlLnBhZ2VYXG4gICAgfSwgKCkgPT4ge1xuICAgICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICAgIGlmIChpc0Z1bGxHYXAoKSkge1xuICAgICAgICAgIG9uQ2hhbmdlKG5ld0luZGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJlbmRlcigpIHtcbiAgICB2YXIge1xuICAgICAgZGF0YSxcbiAgICAgIGNsYXNzTmFtZSxcbiAgICAgIGNoaWxkcmVuLFxuICAgICAgeCxcbiAgICAgIHksXG4gICAgICBkeSxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgYWx3YXlzU2hvd1RleHQsXG4gICAgICBmaWxsLFxuICAgICAgc3Ryb2tlLFxuICAgICAgc3RhcnRJbmRleCxcbiAgICAgIGVuZEluZGV4LFxuICAgICAgdHJhdmVsbGVyV2lkdGgsXG4gICAgICB0aWNrRm9ybWF0dGVyLFxuICAgICAgZGF0YUtleSxcbiAgICAgIHBhZGRpbmdcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICB2YXIge1xuICAgICAgc3RhcnRYLFxuICAgICAgZW5kWCxcbiAgICAgIGlzVGV4dEFjdGl2ZSxcbiAgICAgIGlzU2xpZGVNb3ZpbmcsXG4gICAgICBpc1RyYXZlbGxlck1vdmluZyxcbiAgICAgIGlzVHJhdmVsbGVyRm9jdXNlZFxuICAgIH0gPSB0aGlzLnN0YXRlO1xuICAgIGlmICghZGF0YSB8fCAhZGF0YS5sZW5ndGggfHwgIWlzTnVtYmVyKHgpIHx8ICFpc051bWJlcih5KSB8fCAhaXNOdW1iZXIod2lkdGgpIHx8ICFpc051bWJlcihoZWlnaHQpIHx8IHdpZHRoIDw9IDAgfHwgaGVpZ2h0IDw9IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB2YXIgbGF5ZXJDbGFzcyA9IGNsc3goJ3JlY2hhcnRzLWJydXNoJywgY2xhc3NOYW1lKTtcbiAgICB2YXIgc3R5bGUgPSBnZW5lcmF0ZVByZWZpeFN0eWxlKCd1c2VyU2VsZWN0JywgJ25vbmUnKTtcbiAgICB2YXIgY2FsY3VsYXRlZFkgPSB5ICsgKGR5ICE9PSBudWxsICYmIGR5ICE9PSB2b2lkIDAgPyBkeSA6IDApO1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwge1xuICAgICAgY2xhc3NOYW1lOiBsYXllckNsYXNzLFxuICAgICAgb25Nb3VzZUxlYXZlOiB0aGlzLmhhbmRsZUxlYXZlV3JhcHBlcixcbiAgICAgIG9uVG91Y2hNb3ZlOiB0aGlzLmhhbmRsZVRvdWNoTW92ZSxcbiAgICAgIHN0eWxlOiBzdHlsZVxuICAgIH0sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEJhY2tncm91bmQsIHtcbiAgICAgIHg6IHgsXG4gICAgICB5OiBjYWxjdWxhdGVkWSxcbiAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgZmlsbDogZmlsbCxcbiAgICAgIHN0cm9rZTogc3Ryb2tlXG4gICAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFBhbm9yYW1hQ29udGV4dFByb3ZpZGVyLCBudWxsLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChQYW5vcmFtYSwge1xuICAgICAgeDogeCxcbiAgICAgIHk6IGNhbGN1bGF0ZWRZLFxuICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICBkYXRhOiBkYXRhLFxuICAgICAgcGFkZGluZzogcGFkZGluZ1xuICAgIH0sIGNoaWxkcmVuKSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFNsaWRlLCB7XG4gICAgICB5OiBjYWxjdWxhdGVkWSxcbiAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgc3Ryb2tlOiBzdHJva2UsXG4gICAgICB0cmF2ZWxsZXJXaWR0aDogdHJhdmVsbGVyV2lkdGgsXG4gICAgICBzdGFydFg6IHN0YXJ0WCxcbiAgICAgIGVuZFg6IGVuZFgsXG4gICAgICBvbk1vdXNlRW50ZXI6IHRoaXMuaGFuZGxlRW50ZXJTbGlkZU9yVHJhdmVsbGVyLFxuICAgICAgb25Nb3VzZUxlYXZlOiB0aGlzLmhhbmRsZUxlYXZlU2xpZGVPclRyYXZlbGxlcixcbiAgICAgIG9uTW91c2VEb3duOiB0aGlzLmhhbmRsZVNsaWRlRHJhZ1N0YXJ0LFxuICAgICAgb25Ub3VjaFN0YXJ0OiB0aGlzLmhhbmRsZVNsaWRlRHJhZ1N0YXJ0XG4gICAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFRyYXZlbGxlckxheWVyLCB7XG4gICAgICB0cmF2ZWxsZXJYOiBzdGFydFgsXG4gICAgICBpZDogXCJzdGFydFhcIixcbiAgICAgIG90aGVyUHJvcHM6IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgdGhpcy5wcm9wcyksIHt9LCB7XG4gICAgICAgIHk6IGNhbGN1bGF0ZWRZXG4gICAgICB9KSxcbiAgICAgIG9uTW91c2VFbnRlcjogdGhpcy5oYW5kbGVFbnRlclNsaWRlT3JUcmF2ZWxsZXIsXG4gICAgICBvbk1vdXNlTGVhdmU6IHRoaXMuaGFuZGxlTGVhdmVTbGlkZU9yVHJhdmVsbGVyLFxuICAgICAgb25Nb3VzZURvd246IHRoaXMudHJhdmVsbGVyRHJhZ1N0YXJ0SGFuZGxlcnMuc3RhcnRYLFxuICAgICAgb25Ub3VjaFN0YXJ0OiB0aGlzLnRyYXZlbGxlckRyYWdTdGFydEhhbmRsZXJzLnN0YXJ0WCxcbiAgICAgIG9uVHJhdmVsbGVyTW92ZUtleWJvYXJkOiB0aGlzLmhhbmRsZVRyYXZlbGxlck1vdmVLZXlib2FyZCxcbiAgICAgIG9uRm9jdXM6ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgaXNUcmF2ZWxsZXJGb2N1c2VkOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIG9uQmx1cjogKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBpc1RyYXZlbGxlckZvY3VzZWQ6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChUcmF2ZWxsZXJMYXllciwge1xuICAgICAgdHJhdmVsbGVyWDogZW5kWCxcbiAgICAgIGlkOiBcImVuZFhcIixcbiAgICAgIG90aGVyUHJvcHM6IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgdGhpcy5wcm9wcyksIHt9LCB7XG4gICAgICAgIHk6IGNhbGN1bGF0ZWRZXG4gICAgICB9KSxcbiAgICAgIG9uTW91c2VFbnRlcjogdGhpcy5oYW5kbGVFbnRlclNsaWRlT3JUcmF2ZWxsZXIsXG4gICAgICBvbk1vdXNlTGVhdmU6IHRoaXMuaGFuZGxlTGVhdmVTbGlkZU9yVHJhdmVsbGVyLFxuICAgICAgb25Nb3VzZURvd246IHRoaXMudHJhdmVsbGVyRHJhZ1N0YXJ0SGFuZGxlcnMuZW5kWCxcbiAgICAgIG9uVG91Y2hTdGFydDogdGhpcy50cmF2ZWxsZXJEcmFnU3RhcnRIYW5kbGVycy5lbmRYLFxuICAgICAgb25UcmF2ZWxsZXJNb3ZlS2V5Ym9hcmQ6IHRoaXMuaGFuZGxlVHJhdmVsbGVyTW92ZUtleWJvYXJkLFxuICAgICAgb25Gb2N1czogKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBpc1RyYXZlbGxlckZvY3VzZWQ6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgb25CbHVyOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGlzVHJhdmVsbGVyRm9jdXNlZDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSksIChpc1RleHRBY3RpdmUgfHwgaXNTbGlkZU1vdmluZyB8fCBpc1RyYXZlbGxlck1vdmluZyB8fCBpc1RyYXZlbGxlckZvY3VzZWQgfHwgYWx3YXlzU2hvd1RleHQpICYmIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEJydXNoVGV4dCwge1xuICAgICAgc3RhcnRJbmRleDogc3RhcnRJbmRleCxcbiAgICAgIGVuZEluZGV4OiBlbmRJbmRleCxcbiAgICAgIHk6IGNhbGN1bGF0ZWRZLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICB0cmF2ZWxsZXJXaWR0aDogdHJhdmVsbGVyV2lkdGgsXG4gICAgICBzdHJva2U6IHN0cm9rZSxcbiAgICAgIHRpY2tGb3JtYXR0ZXI6IHRpY2tGb3JtYXR0ZXIsXG4gICAgICBkYXRhS2V5OiBkYXRhS2V5LFxuICAgICAgZGF0YTogZGF0YSxcbiAgICAgIHN0YXJ0WDogc3RhcnRYLFxuICAgICAgZW5kWDogZW5kWFxuICAgIH0pKTtcbiAgfVxufVxuZnVuY3Rpb24gQnJ1c2hJbnRlcm5hbChwcm9wcykge1xuICB2YXIgZGlzcGF0Y2ggPSB1c2VBcHBEaXNwYXRjaCgpO1xuICB2YXIgY2hhcnREYXRhID0gdXNlQ2hhcnREYXRhKCk7XG4gIHZhciBkYXRhSW5kZXhlcyA9IHVzZURhdGFJbmRleCgpO1xuICB2YXIgb25DaGFuZ2VGcm9tQ29udGV4dCA9IHVzZUNvbnRleHQoQnJ1c2hVcGRhdGVEaXNwYXRjaENvbnRleHQpO1xuICB2YXIgb25DaGFuZ2VGcm9tUHJvcHMgPSBwcm9wcy5vbkNoYW5nZTtcbiAgdmFyIHtcbiAgICBzdGFydEluZGV4OiBzdGFydEluZGV4RnJvbVByb3BzLFxuICAgIGVuZEluZGV4OiBlbmRJbmRleEZyb21Qcm9wc1xuICB9ID0gcHJvcHM7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgLy8gc3RhcnQgYW5kIGVuZCBpbmRleCBjYW4gYmUgY29udHJvbGxlZCBmcm9tIHByb3BzLCBhbmQgd2UgbmVlZCB0aGVtIHRvIHN0YXkgdXAtdG8tZGF0ZSBpbiB0aGUgUmVkdXggc3RhdGUgdG9vXG4gICAgZGlzcGF0Y2goc2V0RGF0YVN0YXJ0RW5kSW5kZXhlcyh7XG4gICAgICBzdGFydEluZGV4OiBzdGFydEluZGV4RnJvbVByb3BzLFxuICAgICAgZW5kSW5kZXg6IGVuZEluZGV4RnJvbVByb3BzXG4gICAgfSkpO1xuICB9LCBbZGlzcGF0Y2gsIGVuZEluZGV4RnJvbVByb3BzLCBzdGFydEluZGV4RnJvbVByb3BzXSk7XG4gIHVzZUJydXNoQ2hhcnRTeW5jaHJvbmlzYXRpb24oKTtcbiAgdmFyIG9uQ2hhbmdlID0gdXNlQ2FsbGJhY2sobmV4dFN0YXRlID0+IHtcbiAgICBpZiAoZGF0YUluZGV4ZXMgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIge1xuICAgICAgc3RhcnRJbmRleCxcbiAgICAgIGVuZEluZGV4XG4gICAgfSA9IGRhdGFJbmRleGVzO1xuICAgIGlmIChuZXh0U3RhdGUuc3RhcnRJbmRleCAhPT0gc3RhcnRJbmRleCB8fCBuZXh0U3RhdGUuZW5kSW5kZXggIT09IGVuZEluZGV4KSB7XG4gICAgICBvbkNoYW5nZUZyb21Db250ZXh0ID09PSBudWxsIHx8IG9uQ2hhbmdlRnJvbUNvbnRleHQgPT09IHZvaWQgMCB8fCBvbkNoYW5nZUZyb21Db250ZXh0KG5leHRTdGF0ZSk7XG4gICAgICBvbkNoYW5nZUZyb21Qcm9wcyA9PT0gbnVsbCB8fCBvbkNoYW5nZUZyb21Qcm9wcyA9PT0gdm9pZCAwIHx8IG9uQ2hhbmdlRnJvbVByb3BzKG5leHRTdGF0ZSk7XG4gICAgICBkaXNwYXRjaChzZXREYXRhU3RhcnRFbmRJbmRleGVzKG5leHRTdGF0ZSkpO1xuICAgIH1cbiAgfSwgW29uQ2hhbmdlRnJvbVByb3BzLCBvbkNoYW5nZUZyb21Db250ZXh0LCBkaXNwYXRjaCwgZGF0YUluZGV4ZXNdKTtcbiAgdmFyIGJydXNoRGltZW5zaW9ucyA9IHVzZUFwcFNlbGVjdG9yKHNlbGVjdEJydXNoRGltZW5zaW9ucyk7XG4gIGlmIChicnVzaERpbWVuc2lvbnMgPT0gbnVsbCB8fCBkYXRhSW5kZXhlcyA9PSBudWxsIHx8IGNoYXJ0RGF0YSA9PSBudWxsIHx8ICFjaGFydERhdGEubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIHtcbiAgICBzdGFydEluZGV4LFxuICAgIGVuZEluZGV4XG4gIH0gPSBkYXRhSW5kZXhlcztcbiAgdmFyIHtcbiAgICB4LFxuICAgIHksXG4gICAgd2lkdGhcbiAgfSA9IGJydXNoRGltZW5zaW9ucztcbiAgdmFyIGNvbnRleHRQcm9wZXJ0aWVzID0ge1xuICAgIGRhdGE6IGNoYXJ0RGF0YSxcbiAgICB4LFxuICAgIHksXG4gICAgd2lkdGgsXG4gICAgc3RhcnRJbmRleCxcbiAgICBlbmRJbmRleCxcbiAgICBvbkNoYW5nZVxuICB9O1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQnJ1c2hXaXRoU3RhdGUsIF9leHRlbmRzKHt9LCBwcm9wcywgY29udGV4dFByb3BlcnRpZXMsIHtcbiAgICBzdGFydEluZGV4Q29udHJvbGxlZEZyb21Qcm9wczogc3RhcnRJbmRleEZyb21Qcm9wcyAhPT0gbnVsbCAmJiBzdGFydEluZGV4RnJvbVByb3BzICE9PSB2b2lkIDAgPyBzdGFydEluZGV4RnJvbVByb3BzIDogdW5kZWZpbmVkLFxuICAgIGVuZEluZGV4Q29udHJvbGxlZEZyb21Qcm9wczogZW5kSW5kZXhGcm9tUHJvcHMgIT09IG51bGwgJiYgZW5kSW5kZXhGcm9tUHJvcHMgIT09IHZvaWQgMCA/IGVuZEluZGV4RnJvbVByb3BzIDogdW5kZWZpbmVkXG4gIH0pKTtcbn1cbmZ1bmN0aW9uIEJydXNoU2V0dGluZ3NEaXNwYXRjaGVyKHByb3BzKSB7XG4gIHZhciBkaXNwYXRjaCA9IHVzZUFwcERpc3BhdGNoKCk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgZGlzcGF0Y2goc2V0QnJ1c2hTZXR0aW5ncyhwcm9wcykpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBkaXNwYXRjaChzZXRCcnVzaFNldHRpbmdzKG51bGwpKTtcbiAgICB9O1xuICB9LCBbZGlzcGF0Y2gsIHByb3BzXSk7XG4gIHJldHVybiBudWxsO1xufVxudmFyIGRlZmF1bHRCcnVzaFByb3BzID0ge1xuICBoZWlnaHQ6IDQwLFxuICB0cmF2ZWxsZXJXaWR0aDogNSxcbiAgZ2FwOiAxLFxuICBmaWxsOiAnI2ZmZicsXG4gIHN0cm9rZTogJyM2NjYnLFxuICBwYWRkaW5nOiB7XG4gICAgdG9wOiAxLFxuICAgIHJpZ2h0OiAxLFxuICAgIGJvdHRvbTogMSxcbiAgICBsZWZ0OiAxXG4gIH0sXG4gIGxlYXZlVGltZU91dDogMTAwMCxcbiAgYWx3YXlzU2hvd1RleHQ6IGZhbHNlXG59O1xuZXhwb3J0IGZ1bmN0aW9uIEJydXNoKG91dHNpZGVQcm9wcykge1xuICB2YXIgcHJvcHMgPSByZXNvbHZlRGVmYXVsdFByb3BzKG91dHNpZGVQcm9wcywgZGVmYXVsdEJydXNoUHJvcHMpO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRnJhZ21lbnQsIG51bGwsIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEJydXNoU2V0dGluZ3NEaXNwYXRjaGVyLCB7XG4gICAgaGVpZ2h0OiBwcm9wcy5oZWlnaHQsXG4gICAgeDogcHJvcHMueCxcbiAgICB5OiBwcm9wcy55LFxuICAgIHdpZHRoOiBwcm9wcy53aWR0aCxcbiAgICBwYWRkaW5nOiBwcm9wcy5wYWRkaW5nXG4gIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChCcnVzaEludGVybmFsLCBwcm9wcykpO1xufVxuQnJ1c2guZGlzcGxheU5hbWUgPSAnQnJ1c2gnOyIsInZhciBfZXhjbHVkZWQgPSBbXCJvbk1vdXNlRW50ZXJcIiwgXCJvbk1vdXNlTGVhdmVcIiwgXCJvbkNsaWNrXCJdLFxuICBfZXhjbHVkZWQyID0gW1widmFsdWVcIiwgXCJiYWNrZ3JvdW5kXCIsIFwidG9vbHRpcFBvc2l0aW9uXCJdLFxuICBfZXhjbHVkZWQzID0gW1wiaWRcIl0sXG4gIF9leGNsdWRlZDQgPSBbXCJvbk1vdXNlRW50ZXJcIiwgXCJvbkNsaWNrXCIsIFwib25Nb3VzZUxlYXZlXCJdO1xuZnVuY3Rpb24gX2V4dGVuZHMoKSB7IHJldHVybiBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gPyBPYmplY3QuYXNzaWduLmJpbmQoKSA6IGZ1bmN0aW9uIChuKSB7IGZvciAodmFyIGUgPSAxOyBlIDwgYXJndW1lbnRzLmxlbmd0aDsgZSsrKSB7IHZhciB0ID0gYXJndW1lbnRzW2VdOyBmb3IgKHZhciByIGluIHQpICh7fSkuaGFzT3duUHJvcGVydHkuY2FsbCh0LCByKSAmJiAobltyXSA9IHRbcl0pOyB9IHJldHVybiBuOyB9LCBfZXh0ZW5kcy5hcHBseShudWxsLCBhcmd1bWVudHMpOyB9XG5mdW5jdGlvbiBvd25LZXlzKGUsIHIpIHsgdmFyIHQgPSBPYmplY3Qua2V5cyhlKTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG8gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyByICYmIChvID0gby5maWx0ZXIoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZSwgcikuZW51bWVyYWJsZTsgfSkpLCB0LnB1c2guYXBwbHkodCwgbyk7IH0gcmV0dXJuIHQ7IH1cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQoZSkgeyBmb3IgKHZhciByID0gMTsgciA8IGFyZ3VtZW50cy5sZW5ndGg7IHIrKykgeyB2YXIgdCA9IG51bGwgIT0gYXJndW1lbnRzW3JdID8gYXJndW1lbnRzW3JdIDoge307IHIgJSAyID8gb3duS2V5cyhPYmplY3QodCksICEwKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0W3JdKTsgfSkgOiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGUsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHQpKSA6IG93bktleXMoT2JqZWN0KHQpKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHQsIHIpKTsgfSk7IH0gcmV0dXJuIGU7IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0KSB7IHJldHVybiAociA9IF90b1Byb3BlcnR5S2V5KHIpKSBpbiBlID8gT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIHsgdmFsdWU6IHQsIGVudW1lcmFibGU6ICEwLCBjb25maWd1cmFibGU6ICEwLCB3cml0YWJsZTogITAgfSkgOiBlW3JdID0gdCwgZTsgfVxuZnVuY3Rpb24gX3RvUHJvcGVydHlLZXkodCkgeyB2YXIgaSA9IF90b1ByaW1pdGl2ZSh0LCBcInN0cmluZ1wiKTsgcmV0dXJuIFwic3ltYm9sXCIgPT0gdHlwZW9mIGkgPyBpIDogaSArIFwiXCI7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZSh0LCByKSB7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiB0IHx8ICF0KSByZXR1cm4gdDsgdmFyIGUgPSB0W1N5bWJvbC50b1ByaW1pdGl2ZV07IGlmICh2b2lkIDAgIT09IGUpIHsgdmFyIGkgPSBlLmNhbGwodCwgciB8fCBcImRlZmF1bHRcIik7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiBpKSByZXR1cm4gaTsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpOyB9IHJldHVybiAoXCJzdHJpbmdcIiA9PT0gciA/IFN0cmluZyA6IE51bWJlcikodCk7IH1cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhlLCB0KSB7IGlmIChudWxsID09IGUpIHJldHVybiB7fTsgdmFyIG8sIHIsIGkgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShlLCB0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG4gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyBmb3IgKHIgPSAwOyByIDwgbi5sZW5ndGg7IHIrKykgbyA9IG5bcl0sIC0xID09PSB0LmluZGV4T2YobykgJiYge30ucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChlLCBvKSAmJiAoaVtvXSA9IGVbb10pOyB9IHJldHVybiBpOyB9XG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShyLCBlKSB7IGlmIChudWxsID09IHIpIHJldHVybiB7fTsgdmFyIHQgPSB7fTsgZm9yICh2YXIgbiBpbiByKSBpZiAoe30uaGFzT3duUHJvcGVydHkuY2FsbChyLCBuKSkgeyBpZiAoLTEgIT09IGUuaW5kZXhPZihuKSkgY29udGludWU7IHRbbl0gPSByW25dOyB9IHJldHVybiB0OyB9XG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBQdXJlQ29tcG9uZW50LCB1c2VDYWxsYmFjaywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IExheWVyIH0gZnJvbSAnLi4vY29udGFpbmVyL0xheWVyJztcbmltcG9ydCB7IENlbGwgfSBmcm9tICcuLi9jb21wb25lbnQvQ2VsbCc7XG5pbXBvcnQgeyBDYXJ0ZXNpYW5MYWJlbExpc3RDb250ZXh0UHJvdmlkZXIsIExhYmVsTGlzdEZyb21MYWJlbFByb3AgfSBmcm9tICcuLi9jb21wb25lbnQvTGFiZWxMaXN0JztcbmltcG9ydCB7IGludGVycG9sYXRlLCBpc05hbiwgbWF0aFNpZ24gfSBmcm9tICcuLi91dGlsL0RhdGFVdGlscyc7XG5pbXBvcnQgeyBmaW5kQWxsQnlUeXBlIH0gZnJvbSAnLi4vdXRpbC9SZWFjdFV0aWxzJztcbmltcG9ydCB7IEdsb2JhbCB9IGZyb20gJy4uL3V0aWwvR2xvYmFsJztcbmltcG9ydCB7IGdldEJhc2VWYWx1ZU9mQmFyLCBnZXRDYXRlQ29vcmRpbmF0ZU9mQmFyLCBnZXROb3JtYWxpemVkU3RhY2tJZCwgZ2V0VG9vbHRpcE5hbWVQcm9wLCBnZXRWYWx1ZUJ5RGF0YUtleSwgdHJ1bmNhdGVCeURvbWFpbiB9IGZyb20gJy4uL3V0aWwvQ2hhcnRVdGlscyc7XG5pbXBvcnQgeyBhZGFwdEV2ZW50c09mQ2hpbGQgfSBmcm9tICcuLi91dGlsL3R5cGVzJztcbmltcG9ydCB7IEJhclJlY3RhbmdsZSwgbWluUG9pbnRTaXplQ2FsbGJhY2sgfSBmcm9tICcuLi91dGlsL0JhclV0aWxzJztcbmltcG9ydCB7IHVzZU1vdXNlQ2xpY2tJdGVtRGlzcGF0Y2gsIHVzZU1vdXNlRW50ZXJJdGVtRGlzcGF0Y2gsIHVzZU1vdXNlTGVhdmVJdGVtRGlzcGF0Y2ggfSBmcm9tICcuLi9jb250ZXh0L3Rvb2x0aXBDb250ZXh0JztcbmltcG9ydCB7IFNldFRvb2x0aXBFbnRyeVNldHRpbmdzIH0gZnJvbSAnLi4vc3RhdGUvU2V0VG9vbHRpcEVudHJ5U2V0dGluZ3MnO1xuaW1wb3J0IHsgU2V0RXJyb3JCYXJDb250ZXh0IH0gZnJvbSAnLi4vY29udGV4dC9FcnJvckJhckNvbnRleHQnO1xuaW1wb3J0IHsgR3JhcGhpY2FsSXRlbUNsaXBQYXRoLCB1c2VOZWVkc0NsaXAgfSBmcm9tICcuL0dyYXBoaWNhbEl0ZW1DbGlwUGF0aCc7XG5pbXBvcnQgeyB1c2VDaGFydExheW91dCB9IGZyb20gJy4uL2NvbnRleHQvY2hhcnRMYXlvdXRDb250ZXh0JztcbmltcG9ydCB7IHNlbGVjdEJhclJlY3RhbmdsZXMgfSBmcm9tICcuLi9zdGF0ZS9zZWxlY3RvcnMvYmFyU2VsZWN0b3JzJztcbmltcG9ydCB7IHVzZUFwcFNlbGVjdG9yIH0gZnJvbSAnLi4vc3RhdGUvaG9va3MnO1xuaW1wb3J0IHsgdXNlSXNQYW5vcmFtYSB9IGZyb20gJy4uL2NvbnRleHQvUGFub3JhbWFDb250ZXh0JztcbmltcG9ydCB7IHNlbGVjdEFjdGl2ZVRvb2x0aXBEYXRhS2V5LCBzZWxlY3RBY3RpdmVUb29sdGlwSW5kZXggfSBmcm9tICcuLi9zdGF0ZS9zZWxlY3RvcnMvdG9vbHRpcFNlbGVjdG9ycyc7XG5pbXBvcnQgeyBTZXRMZWdlbmRQYXlsb2FkIH0gZnJvbSAnLi4vc3RhdGUvU2V0TGVnZW5kUGF5bG9hZCc7XG5pbXBvcnQgeyB1c2VBbmltYXRpb25JZCB9IGZyb20gJy4uL3V0aWwvdXNlQW5pbWF0aW9uSWQnO1xuaW1wb3J0IHsgcmVzb2x2ZURlZmF1bHRQcm9wcyB9IGZyb20gJy4uL3V0aWwvcmVzb2x2ZURlZmF1bHRQcm9wcyc7XG5pbXBvcnQgeyBSZWdpc3RlckdyYXBoaWNhbEl0ZW1JZCB9IGZyb20gJy4uL2NvbnRleHQvUmVnaXN0ZXJHcmFwaGljYWxJdGVtSWQnO1xuaW1wb3J0IHsgU2V0Q2FydGVzaWFuR3JhcGhpY2FsSXRlbSB9IGZyb20gJy4uL3N0YXRlL1NldEdyYXBoaWNhbEl0ZW0nO1xuaW1wb3J0IHsgc3ZnUHJvcGVydGllc05vRXZlbnRzLCBzdmdQcm9wZXJ0aWVzTm9FdmVudHNGcm9tVW5rbm93biB9IGZyb20gJy4uL3V0aWwvc3ZnUHJvcGVydGllc05vRXZlbnRzJztcbmltcG9ydCB7IEphdmFzY3JpcHRBbmltYXRlIH0gZnJvbSAnLi4vYW5pbWF0aW9uL0phdmFzY3JpcHRBbmltYXRlJztcbnZhciBjb21wdXRlTGVnZW5kUGF5bG9hZEZyb21CYXJEYXRhID0gcHJvcHMgPT4ge1xuICB2YXIge1xuICAgIGRhdGFLZXksXG4gICAgbmFtZSxcbiAgICBmaWxsLFxuICAgIGxlZ2VuZFR5cGUsXG4gICAgaGlkZVxuICB9ID0gcHJvcHM7XG4gIHJldHVybiBbe1xuICAgIGluYWN0aXZlOiBoaWRlLFxuICAgIGRhdGFLZXksXG4gICAgdHlwZTogbGVnZW5kVHlwZSxcbiAgICBjb2xvcjogZmlsbCxcbiAgICB2YWx1ZTogZ2V0VG9vbHRpcE5hbWVQcm9wKG5hbWUsIGRhdGFLZXkpLFxuICAgIHBheWxvYWQ6IHByb3BzXG4gIH1dO1xufTtcbmZ1bmN0aW9uIGdldFRvb2x0aXBFbnRyeVNldHRpbmdzKHByb3BzKSB7XG4gIHZhciB7XG4gICAgZGF0YUtleSxcbiAgICBzdHJva2UsXG4gICAgc3Ryb2tlV2lkdGgsXG4gICAgZmlsbCxcbiAgICBuYW1lLFxuICAgIGhpZGUsXG4gICAgdW5pdFxuICB9ID0gcHJvcHM7XG4gIHJldHVybiB7XG4gICAgZGF0YURlZmluZWRPbkl0ZW06IHVuZGVmaW5lZCxcbiAgICBwb3NpdGlvbnM6IHVuZGVmaW5lZCxcbiAgICBzZXR0aW5nczoge1xuICAgICAgc3Ryb2tlLFxuICAgICAgc3Ryb2tlV2lkdGgsXG4gICAgICBmaWxsLFxuICAgICAgZGF0YUtleSxcbiAgICAgIG5hbWVLZXk6IHVuZGVmaW5lZCxcbiAgICAgIG5hbWU6IGdldFRvb2x0aXBOYW1lUHJvcChuYW1lLCBkYXRhS2V5KSxcbiAgICAgIGhpZGUsXG4gICAgICB0eXBlOiBwcm9wcy50b29sdGlwVHlwZSxcbiAgICAgIGNvbG9yOiBwcm9wcy5maWxsLFxuICAgICAgdW5pdFxuICAgIH1cbiAgfTtcbn1cbmZ1bmN0aW9uIEJhckJhY2tncm91bmQocHJvcHMpIHtcbiAgdmFyIGFjdGl2ZUluZGV4ID0gdXNlQXBwU2VsZWN0b3Ioc2VsZWN0QWN0aXZlVG9vbHRpcEluZGV4KTtcbiAgdmFyIHtcbiAgICBkYXRhLFxuICAgIGRhdGFLZXksXG4gICAgYmFja2dyb3VuZDogYmFja2dyb3VuZEZyb21Qcm9wcyxcbiAgICBhbGxPdGhlckJhclByb3BzXG4gIH0gPSBwcm9wcztcbiAgdmFyIHtcbiAgICAgIG9uTW91c2VFbnRlcjogb25Nb3VzZUVudGVyRnJvbVByb3BzLFxuICAgICAgb25Nb3VzZUxlYXZlOiBvbk1vdXNlTGVhdmVGcm9tUHJvcHMsXG4gICAgICBvbkNsaWNrOiBvbkl0ZW1DbGlja0Zyb21Qcm9wc1xuICAgIH0gPSBhbGxPdGhlckJhclByb3BzLFxuICAgIHJlc3RPZkFsbE90aGVyUHJvcHMgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoYWxsT3RoZXJCYXJQcm9wcywgX2V4Y2x1ZGVkKTtcblxuICAvLyBAdHMtZXhwZWN0LWVycm9yIGJhciBtb3VzZSBldmVudHMgYXJlIG5vdCBjb21wYXRpYmxlIHdpdGggcmVjaGFydHMgbW91c2UgZXZlbnRzXG4gIHZhciBvbk1vdXNlRW50ZXJGcm9tQ29udGV4dCA9IHVzZU1vdXNlRW50ZXJJdGVtRGlzcGF0Y2gob25Nb3VzZUVudGVyRnJvbVByb3BzLCBkYXRhS2V5KTtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciBiYXIgbW91c2UgZXZlbnRzIGFyZSBub3QgY29tcGF0aWJsZSB3aXRoIHJlY2hhcnRzIG1vdXNlIGV2ZW50c1xuICB2YXIgb25Nb3VzZUxlYXZlRnJvbUNvbnRleHQgPSB1c2VNb3VzZUxlYXZlSXRlbURpc3BhdGNoKG9uTW91c2VMZWF2ZUZyb21Qcm9wcyk7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgYmFyIG1vdXNlIGV2ZW50cyBhcmUgbm90IGNvbXBhdGlibGUgd2l0aCByZWNoYXJ0cyBtb3VzZSBldmVudHNcbiAgdmFyIG9uQ2xpY2tGcm9tQ29udGV4dCA9IHVzZU1vdXNlQ2xpY2tJdGVtRGlzcGF0Y2gob25JdGVtQ2xpY2tGcm9tUHJvcHMsIGRhdGFLZXkpO1xuICBpZiAoIWJhY2tncm91bmRGcm9tUHJvcHMgfHwgZGF0YSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIGJhY2tncm91bmRQcm9wcyA9IHN2Z1Byb3BlcnRpZXNOb0V2ZW50c0Zyb21Vbmtub3duKGJhY2tncm91bmRGcm9tUHJvcHMpO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRnJhZ21lbnQsIG51bGwsIGRhdGEubWFwKChlbnRyeSwgaSkgPT4ge1xuICAgIHZhciB7XG4gICAgICAgIHZhbHVlLFxuICAgICAgICBiYWNrZ3JvdW5kOiBiYWNrZ3JvdW5kRnJvbURhdGFFbnRyeSxcbiAgICAgICAgdG9vbHRpcFBvc2l0aW9uXG4gICAgICB9ID0gZW50cnksXG4gICAgICByZXN0ID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKGVudHJ5LCBfZXhjbHVkZWQyKTtcbiAgICBpZiAoIWJhY2tncm91bmRGcm9tRGF0YUVudHJ5KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIEJhclJlY3RhbmdsZUl0ZW0gdHlwZSBkZWZpbml0aW9uIHNheXMgaXQncyBtaXNzaW5nIHByb3BlcnRpZXMsIGJ1dCBJIGNhbiBzZWUgdGhlbSBwcmVzZW50IGluIGRlYnVnZ2VyIVxuICAgIHZhciBvbk1vdXNlRW50ZXIgPSBvbk1vdXNlRW50ZXJGcm9tQ29udGV4dChlbnRyeSwgaSk7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBCYXJSZWN0YW5nbGVJdGVtIHR5cGUgZGVmaW5pdGlvbiBzYXlzIGl0J3MgbWlzc2luZyBwcm9wZXJ0aWVzLCBidXQgSSBjYW4gc2VlIHRoZW0gcHJlc2VudCBpbiBkZWJ1Z2dlciFcbiAgICB2YXIgb25Nb3VzZUxlYXZlID0gb25Nb3VzZUxlYXZlRnJvbUNvbnRleHQoZW50cnksIGkpO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgQmFyUmVjdGFuZ2xlSXRlbSB0eXBlIGRlZmluaXRpb24gc2F5cyBpdCdzIG1pc3NpbmcgcHJvcGVydGllcywgYnV0IEkgY2FuIHNlZSB0aGVtIHByZXNlbnQgaW4gZGVidWdnZXIhXG4gICAgdmFyIG9uQ2xpY2sgPSBvbkNsaWNrRnJvbUNvbnRleHQoZW50cnksIGkpO1xuICAgIHZhciBiYXJSZWN0YW5nbGVQcm9wcyA9IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7XG4gICAgICBvcHRpb246IGJhY2tncm91bmRGcm9tUHJvcHMsXG4gICAgICBpc0FjdGl2ZTogU3RyaW5nKGkpID09PSBhY3RpdmVJbmRleFxuICAgIH0sIHJlc3QpLCB7fSwge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBiYWNrZ3JvdW5kUHJvcHMgaXMgY29udHJpYnV0aW5nIHVua25vd24gcHJvcHNcbiAgICAgIGZpbGw6ICcjZWVlJ1xuICAgIH0sIGJhY2tncm91bmRGcm9tRGF0YUVudHJ5KSwgYmFja2dyb3VuZFByb3BzKSwgYWRhcHRFdmVudHNPZkNoaWxkKHJlc3RPZkFsbE90aGVyUHJvcHMsIGVudHJ5LCBpKSksIHt9LCB7XG4gICAgICBvbk1vdXNlRW50ZXIsXG4gICAgICBvbk1vdXNlTGVhdmUsXG4gICAgICBvbkNsaWNrLFxuICAgICAgZGF0YUtleSxcbiAgICAgIGluZGV4OiBpLFxuICAgICAgY2xhc3NOYW1lOiAncmVjaGFydHMtYmFyLWJhY2tncm91bmQtcmVjdGFuZ2xlJ1xuICAgIH0pO1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChCYXJSZWN0YW5nbGUsIF9leHRlbmRzKHtcbiAgICAgIGtleTogXCJiYWNrZ3JvdW5kLWJhci1cIi5jb25jYXQoaSlcbiAgICB9LCBiYXJSZWN0YW5nbGVQcm9wcykpO1xuICB9KSk7XG59XG5mdW5jdGlvbiBCYXJMYWJlbExpc3RQcm92aWRlcihfcmVmKSB7XG4gIHZhciB7XG4gICAgc2hvd0xhYmVscyxcbiAgICBjaGlsZHJlbixcbiAgICByZWN0c1xuICB9ID0gX3JlZjtcbiAgdmFyIGxhYmVsTGlzdEVudHJpZXMgPSByZWN0cyA9PT0gbnVsbCB8fCByZWN0cyA9PT0gdm9pZCAwID8gdm9pZCAwIDogcmVjdHMubWFwKGVudHJ5ID0+IHtcbiAgICB2YXIgdmlld0JveCA9IHtcbiAgICAgIHg6IGVudHJ5LngsXG4gICAgICB5OiBlbnRyeS55LFxuICAgICAgd2lkdGg6IGVudHJ5LndpZHRoLFxuICAgICAgaGVpZ2h0OiBlbnRyeS5oZWlnaHRcbiAgICB9O1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIHZpZXdCb3gpLCB7fSwge1xuICAgICAgdmFsdWU6IGVudHJ5LnZhbHVlLFxuICAgICAgcGF5bG9hZDogZW50cnkucGF5bG9hZCxcbiAgICAgIHBhcmVudFZpZXdCb3g6IGVudHJ5LnBhcmVudFZpZXdCb3gsXG4gICAgICB2aWV3Qm94LFxuICAgICAgZmlsbDogZW50cnkuZmlsbFxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KENhcnRlc2lhbkxhYmVsTGlzdENvbnRleHRQcm92aWRlciwge1xuICAgIHZhbHVlOiBzaG93TGFiZWxzID8gbGFiZWxMaXN0RW50cmllcyA6IHVuZGVmaW5lZFxuICB9LCBjaGlsZHJlbik7XG59XG5mdW5jdGlvbiBCYXJSZWN0YW5nbGVXaXRoQWN0aXZlU3RhdGUocHJvcHMpIHtcbiAgdmFyIHtcbiAgICBzaGFwZSxcbiAgICBhY3RpdmVCYXIsXG4gICAgYmFzZVByb3BzLFxuICAgIGVudHJ5LFxuICAgIGluZGV4LFxuICAgIGRhdGFLZXlcbiAgfSA9IHByb3BzO1xuICB2YXIgYWN0aXZlSW5kZXggPSB1c2VBcHBTZWxlY3RvcihzZWxlY3RBY3RpdmVUb29sdGlwSW5kZXgpO1xuICB2YXIgYWN0aXZlRGF0YUtleSA9IHVzZUFwcFNlbGVjdG9yKHNlbGVjdEFjdGl2ZVRvb2x0aXBEYXRhS2V5KTtcbiAgLypcbiAgICogQmFycyBzdXBwb3J0IHN0YWNraW5nLCBtZWFuaW5nIHRoYXQgdGhlcmUgY2FuIGJlIG11bHRpcGxlIGJhcnMgYXQgdGhlIHNhbWUgeCB2YWx1ZS5cbiAgICogV2l0aCBUb29sdGlwIHNoYXJlZD1mYWxzZSB3ZSBvbmx5IHdhbnQgdG8gaGlnaGxpZ2h0IHRoZSBjdXJyZW50bHkgYWN0aXZlIEJhciwgbm90IGFsbC5cbiAgICpcbiAgICogQWxzbywgaWYgdGhlIHRvb2x0aXAgaXMgc2hhcmVkLCB3ZSB3YW50IHRvIGhpZ2hsaWdodCBhbGwgYmFycyBhdCB0aGUgc2FtZSB4IHZhbHVlXG4gICAqIHJlZ2FyZGxlc3Mgb2YgdGhlIGRhdGFLZXkuXG4gICAqXG4gICAqIFdpdGggc2hhcmVkIFRvb2x0aXAsIHRoZSBhY3RpdmVEYXRhS2V5IGlzIHVuZGVmaW5lZC5cbiAgICovXG4gIHZhciBpc0FjdGl2ZSA9IGFjdGl2ZUJhciAmJiBTdHJpbmcoaW5kZXgpID09PSBhY3RpdmVJbmRleCAmJiAoYWN0aXZlRGF0YUtleSA9PSBudWxsIHx8IGRhdGFLZXkgPT09IGFjdGl2ZURhdGFLZXkpO1xuICB2YXIgb3B0aW9uID0gaXNBY3RpdmUgPyBhY3RpdmVCYXIgOiBzaGFwZTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEJhclJlY3RhbmdsZSwgX2V4dGVuZHMoe30sIGJhc2VQcm9wcywge1xuICAgIG5hbWU6IFN0cmluZyhiYXNlUHJvcHMubmFtZSlcbiAgfSwgZW50cnksIHtcbiAgICBpc0FjdGl2ZTogaXNBY3RpdmUsXG4gICAgb3B0aW9uOiBvcHRpb24sXG4gICAgaW5kZXg6IGluZGV4LFxuICAgIGRhdGFLZXk6IGRhdGFLZXlcbiAgfSkpO1xufVxuZnVuY3Rpb24gQmFyUmVjdGFuZ2xlTmV2ZXJBY3RpdmUocHJvcHMpIHtcbiAgdmFyIHtcbiAgICBzaGFwZSxcbiAgICBiYXNlUHJvcHMsXG4gICAgZW50cnksXG4gICAgaW5kZXgsXG4gICAgZGF0YUtleVxuICB9ID0gcHJvcHM7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChCYXJSZWN0YW5nbGUsIF9leHRlbmRzKHt9LCBiYXNlUHJvcHMsIHtcbiAgICBuYW1lOiBTdHJpbmcoYmFzZVByb3BzLm5hbWUpXG4gIH0sIGVudHJ5LCB7XG4gICAgaXNBY3RpdmU6IGZhbHNlLFxuICAgIG9wdGlvbjogc2hhcGUsXG4gICAgaW5kZXg6IGluZGV4LFxuICAgIGRhdGFLZXk6IGRhdGFLZXlcbiAgfSkpO1xufVxuZnVuY3Rpb24gQmFyUmVjdGFuZ2xlcyhfcmVmMikge1xuICB2YXIge1xuICAgIGRhdGEsXG4gICAgcHJvcHNcbiAgfSA9IF9yZWYyO1xuICB2YXIgX3N2Z1Byb3BlcnRpZXNOb0V2ZW50ID0gc3ZnUHJvcGVydGllc05vRXZlbnRzKHByb3BzKSxcbiAgICB7XG4gICAgICBpZFxuICAgIH0gPSBfc3ZnUHJvcGVydGllc05vRXZlbnQsXG4gICAgYmFzZVByb3BzID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKF9zdmdQcm9wZXJ0aWVzTm9FdmVudCwgX2V4Y2x1ZGVkMyk7XG4gIHZhciB7XG4gICAgc2hhcGUsXG4gICAgZGF0YUtleSxcbiAgICBhY3RpdmVCYXJcbiAgfSA9IHByb3BzO1xuICB2YXIge1xuICAgICAgb25Nb3VzZUVudGVyOiBvbk1vdXNlRW50ZXJGcm9tUHJvcHMsXG4gICAgICBvbkNsaWNrOiBvbkl0ZW1DbGlja0Zyb21Qcm9wcyxcbiAgICAgIG9uTW91c2VMZWF2ZTogb25Nb3VzZUxlYXZlRnJvbVByb3BzXG4gICAgfSA9IHByb3BzLFxuICAgIHJlc3RPZkFsbE90aGVyUHJvcHMgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMocHJvcHMsIF9leGNsdWRlZDQpO1xuXG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgYmFyIG1vdXNlIGV2ZW50cyBhcmUgbm90IGNvbXBhdGlibGUgd2l0aCByZWNoYXJ0cyBtb3VzZSBldmVudHNcbiAgdmFyIG9uTW91c2VFbnRlckZyb21Db250ZXh0ID0gdXNlTW91c2VFbnRlckl0ZW1EaXNwYXRjaChvbk1vdXNlRW50ZXJGcm9tUHJvcHMsIGRhdGFLZXkpO1xuICAvLyBAdHMtZXhwZWN0LWVycm9yIGJhciBtb3VzZSBldmVudHMgYXJlIG5vdCBjb21wYXRpYmxlIHdpdGggcmVjaGFydHMgbW91c2UgZXZlbnRzXG4gIHZhciBvbk1vdXNlTGVhdmVGcm9tQ29udGV4dCA9IHVzZU1vdXNlTGVhdmVJdGVtRGlzcGF0Y2gob25Nb3VzZUxlYXZlRnJvbVByb3BzKTtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciBiYXIgbW91c2UgZXZlbnRzIGFyZSBub3QgY29tcGF0aWJsZSB3aXRoIHJlY2hhcnRzIG1vdXNlIGV2ZW50c1xuICB2YXIgb25DbGlja0Zyb21Db250ZXh0ID0gdXNlTW91c2VDbGlja0l0ZW1EaXNwYXRjaChvbkl0ZW1DbGlja0Zyb21Qcm9wcywgZGF0YUtleSk7XG4gIGlmICghZGF0YSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5GcmFnbWVudCwgbnVsbCwgZGF0YS5tYXAoKGVudHJ5LCBpKSA9PiB7XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExheWVyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3JlY2hhcnRzL3JlY2hhcnRzL2lzc3Vlcy81NDE1XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0L25vLWFycmF5LWluZGV4LWtleVxuICAgICwgX2V4dGVuZHMoe1xuICAgICAga2V5OiBcInJlY3RhbmdsZS1cIi5jb25jYXQoZW50cnkgPT09IG51bGwgfHwgZW50cnkgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGVudHJ5LngsIFwiLVwiKS5jb25jYXQoZW50cnkgPT09IG51bGwgfHwgZW50cnkgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGVudHJ5LnksIFwiLVwiKS5jb25jYXQoZW50cnkgPT09IG51bGwgfHwgZW50cnkgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGVudHJ5LnZhbHVlLCBcIi1cIikuY29uY2F0KGkpLFxuICAgICAgY2xhc3NOYW1lOiBcInJlY2hhcnRzLWJhci1yZWN0YW5nbGVcIlxuICAgIH0sIGFkYXB0RXZlbnRzT2ZDaGlsZChyZXN0T2ZBbGxPdGhlclByb3BzLCBlbnRyeSwgaSksIHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgQmFyUmVjdGFuZ2xlSXRlbSB0eXBlIGRlZmluaXRpb24gc2F5cyBpdCdzIG1pc3NpbmcgcHJvcGVydGllcywgYnV0IEkgY2FuIHNlZSB0aGVtIHByZXNlbnQgaW4gZGVidWdnZXIhXG4gICAgICBvbk1vdXNlRW50ZXI6IG9uTW91c2VFbnRlckZyb21Db250ZXh0KGVudHJ5LCBpKVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBCYXJSZWN0YW5nbGVJdGVtIHR5cGUgZGVmaW5pdGlvbiBzYXlzIGl0J3MgbWlzc2luZyBwcm9wZXJ0aWVzLCBidXQgSSBjYW4gc2VlIHRoZW0gcHJlc2VudCBpbiBkZWJ1Z2dlciFcbiAgICAgICxcbiAgICAgIG9uTW91c2VMZWF2ZTogb25Nb3VzZUxlYXZlRnJvbUNvbnRleHQoZW50cnksIGkpXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIEJhclJlY3RhbmdsZUl0ZW0gdHlwZSBkZWZpbml0aW9uIHNheXMgaXQncyBtaXNzaW5nIHByb3BlcnRpZXMsIGJ1dCBJIGNhbiBzZWUgdGhlbSBwcmVzZW50IGluIGRlYnVnZ2VyIVxuICAgICAgLFxuICAgICAgb25DbGljazogb25DbGlja0Zyb21Db250ZXh0KGVudHJ5LCBpKVxuICAgIH0pLCBhY3RpdmVCYXIgPyAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChCYXJSZWN0YW5nbGVXaXRoQWN0aXZlU3RhdGUsIHtcbiAgICAgIHNoYXBlOiBzaGFwZSxcbiAgICAgIGFjdGl2ZUJhcjogYWN0aXZlQmFyLFxuICAgICAgYmFzZVByb3BzOiBiYXNlUHJvcHMsXG4gICAgICBlbnRyeTogZW50cnksXG4gICAgICBpbmRleDogaSxcbiAgICAgIGRhdGFLZXk6IGRhdGFLZXlcbiAgICB9KSA6XG4gICAgLyojX19QVVJFX18qL1xuICAgIC8qXG4gICAgICogSWYgdGhlIGBhY3RpdmVCYXJgIHByb3AgaXMgZmFsc3ksIHRoZW4gbGV0J3MgY2FsbCB0aGUgdmFyaWFudCB3aXRob3V0IGhvb2tzLlxuICAgICAqIFVzaW5nIHRoZSBgc2VsZWN0QWN0aXZlVG9vbHRpcEluZGV4YCBzZWxlY3RvciBpcyB1c3VhbGx5IGZhc3RcbiAgICAgKiBidXQgaW4gY2hhcnRzIHdpdGggbGFyZ2UtaXNoIGFtb3VudCBvZiBkYXRhIGV2ZW4gdGhlIGZldyBuYW5vc2Vjb25kcyBhZGQgdXAgdG8gYSBub3RpY2VhYmxlIGphbmsuXG4gICAgICogSWYgdGhlIGFjdGl2ZUJhciBpcyBmYWxzZSB0aGVuIHdlIGRvbid0IG5lZWQgdG8ga25vdyB3aGljaCBpbmRleCBpcyBhY3RpdmUgLSBiZWNhdXNlIHdlIHdvbid0IHVzZSBpdCBhbnl3YXkuXG4gICAgICogU28gbGV0J3MganVzdCBza2lwIHRoZSBob29rcyBhbHRvZ2V0aGVyLiBUaGF0IHdheSwgUmVhY3QgY2FuIHNraXAgcmVuZGVyaW5nIHRoZSBjb21wb25lbnQsXG4gICAgICogYW5kIGNhbiBza2lwIHRoZSB0cmVlIHJlY29uY2lsaWF0aW9uIGZvciBpdHMgY2hpbGRyZW4gdG9vLlxuICAgICAqIEJlY2F1c2Ugd2UgY2FuJ3QgY2FsbCBob29rcyBjb25kaXRpb25hbGx5LCB3ZSBuZWVkIHRvIGhhdmUgYSBzZXBhcmF0ZSBjb21wb25lbnQgZm9yIHRoYXQuXG4gICAgICovXG4gICAgUmVhY3QuY3JlYXRlRWxlbWVudChCYXJSZWN0YW5nbGVOZXZlckFjdGl2ZSwge1xuICAgICAgc2hhcGU6IHNoYXBlLFxuICAgICAgYmFzZVByb3BzOiBiYXNlUHJvcHMsXG4gICAgICBlbnRyeTogZW50cnksXG4gICAgICBpbmRleDogaSxcbiAgICAgIGRhdGFLZXk6IGRhdGFLZXlcbiAgICB9KSk7XG4gIH0pKTtcbn1cbmZ1bmN0aW9uIFJlY3RhbmdsZXNXaXRoQW5pbWF0aW9uKF9yZWYzKSB7XG4gIHZhciB7XG4gICAgcHJvcHMsXG4gICAgcHJldmlvdXNSZWN0YW5nbGVzUmVmXG4gIH0gPSBfcmVmMztcbiAgdmFyIHtcbiAgICBkYXRhLFxuICAgIGxheW91dCxcbiAgICBpc0FuaW1hdGlvbkFjdGl2ZSxcbiAgICBhbmltYXRpb25CZWdpbixcbiAgICBhbmltYXRpb25EdXJhdGlvbixcbiAgICBhbmltYXRpb25FYXNpbmcsXG4gICAgb25BbmltYXRpb25FbmQsXG4gICAgb25BbmltYXRpb25TdGFydFxuICB9ID0gcHJvcHM7XG4gIHZhciBwcmV2RGF0YSA9IHByZXZpb3VzUmVjdGFuZ2xlc1JlZi5jdXJyZW50O1xuICB2YXIgYW5pbWF0aW9uSWQgPSB1c2VBbmltYXRpb25JZChwcm9wcywgJ3JlY2hhcnRzLWJhci0nKTtcbiAgdmFyIFtpc0FuaW1hdGluZywgc2V0SXNBbmltYXRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICB2YXIgc2hvd0xhYmVscyA9ICFpc0FuaW1hdGluZztcbiAgdmFyIGhhbmRsZUFuaW1hdGlvbkVuZCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAodHlwZW9mIG9uQW5pbWF0aW9uRW5kID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBvbkFuaW1hdGlvbkVuZCgpO1xuICAgIH1cbiAgICBzZXRJc0FuaW1hdGluZyhmYWxzZSk7XG4gIH0sIFtvbkFuaW1hdGlvbkVuZF0pO1xuICB2YXIgaGFuZGxlQW5pbWF0aW9uU3RhcnQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBvbkFuaW1hdGlvblN0YXJ0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBvbkFuaW1hdGlvblN0YXJ0KCk7XG4gICAgfVxuICAgIHNldElzQW5pbWF0aW5nKHRydWUpO1xuICB9LCBbb25BbmltYXRpb25TdGFydF0pO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQmFyTGFiZWxMaXN0UHJvdmlkZXIsIHtcbiAgICBzaG93TGFiZWxzOiBzaG93TGFiZWxzLFxuICAgIHJlY3RzOiBkYXRhXG4gIH0sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEphdmFzY3JpcHRBbmltYXRlLCB7XG4gICAgYW5pbWF0aW9uSWQ6IGFuaW1hdGlvbklkLFxuICAgIGJlZ2luOiBhbmltYXRpb25CZWdpbixcbiAgICBkdXJhdGlvbjogYW5pbWF0aW9uRHVyYXRpb24sXG4gICAgaXNBY3RpdmU6IGlzQW5pbWF0aW9uQWN0aXZlLFxuICAgIGVhc2luZzogYW5pbWF0aW9uRWFzaW5nLFxuICAgIG9uQW5pbWF0aW9uRW5kOiBoYW5kbGVBbmltYXRpb25FbmQsXG4gICAgb25BbmltYXRpb25TdGFydDogaGFuZGxlQW5pbWF0aW9uU3RhcnQsXG4gICAga2V5OiBhbmltYXRpb25JZFxuICB9LCB0ID0+IHtcbiAgICB2YXIgc3RlcERhdGEgPSB0ID09PSAxID8gZGF0YSA6IGRhdGEgPT09IG51bGwgfHwgZGF0YSA9PT0gdm9pZCAwID8gdm9pZCAwIDogZGF0YS5tYXAoKGVudHJ5LCBpbmRleCkgPT4ge1xuICAgICAgdmFyIHByZXYgPSBwcmV2RGF0YSAmJiBwcmV2RGF0YVtpbmRleF07XG4gICAgICBpZiAocHJldikge1xuICAgICAgICByZXR1cm4gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBlbnRyeSksIHt9LCB7XG4gICAgICAgICAgeDogaW50ZXJwb2xhdGUocHJldi54LCBlbnRyeS54LCB0KSxcbiAgICAgICAgICB5OiBpbnRlcnBvbGF0ZShwcmV2LnksIGVudHJ5LnksIHQpLFxuICAgICAgICAgIHdpZHRoOiBpbnRlcnBvbGF0ZShwcmV2LndpZHRoLCBlbnRyeS53aWR0aCwgdCksXG4gICAgICAgICAgaGVpZ2h0OiBpbnRlcnBvbGF0ZShwcmV2LmhlaWdodCwgZW50cnkuaGVpZ2h0LCB0KVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmIChsYXlvdXQgPT09ICdob3Jpem9udGFsJykge1xuICAgICAgICB2YXIgaCA9IGludGVycG9sYXRlKDAsIGVudHJ5LmhlaWdodCwgdCk7XG4gICAgICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGVudHJ5KSwge30sIHtcbiAgICAgICAgICB5OiBlbnRyeS55ICsgZW50cnkuaGVpZ2h0IC0gaCxcbiAgICAgICAgICBoZWlnaHQ6IGhcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB2YXIgdyA9IGludGVycG9sYXRlKDAsIGVudHJ5LndpZHRoLCB0KTtcbiAgICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGVudHJ5KSwge30sIHtcbiAgICAgICAgd2lkdGg6IHdcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmICh0ID4gMCkge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgICBwcmV2aW91c1JlY3RhbmdsZXNSZWYuY3VycmVudCA9IHN0ZXBEYXRhICE9PSBudWxsICYmIHN0ZXBEYXRhICE9PSB2b2lkIDAgPyBzdGVwRGF0YSA6IG51bGw7XG4gICAgfVxuICAgIGlmIChzdGVwRGF0YSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExheWVyLCBudWxsLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChCYXJSZWN0YW5nbGVzLCB7XG4gICAgICBwcm9wczogcHJvcHMsXG4gICAgICBkYXRhOiBzdGVwRGF0YVxuICAgIH0pKTtcbiAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExhYmVsTGlzdEZyb21MYWJlbFByb3AsIHtcbiAgICBsYWJlbDogcHJvcHMubGFiZWxcbiAgfSksIHByb3BzLmNoaWxkcmVuKTtcbn1cbmZ1bmN0aW9uIFJlbmRlclJlY3RhbmdsZXMocHJvcHMpIHtcbiAgdmFyIHByZXZpb3VzUmVjdGFuZ2xlc1JlZiA9IHVzZVJlZihudWxsKTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlY3RhbmdsZXNXaXRoQW5pbWF0aW9uLCB7XG4gICAgcHJldmlvdXNSZWN0YW5nbGVzUmVmOiBwcmV2aW91c1JlY3RhbmdsZXNSZWYsXG4gICAgcHJvcHM6IHByb3BzXG4gIH0pO1xufVxudmFyIGRlZmF1bHRNaW5Qb2ludFNpemUgPSAwO1xudmFyIGVycm9yQmFyRGF0YVBvaW50Rm9ybWF0dGVyID0gKGRhdGFQb2ludCwgZGF0YUtleSkgPT4ge1xuICAvKipcbiAgICogaWYgdGhlIHZhbHVlIGNvbWluZyBmcm9tIGBzZWxlY3RCYXJSZWN0YW5nbGVzYCBpcyBhbiBhcnJheSB0aGVuIHRoaXMgaXMgYSBzdGFja2VkIGJhciBjaGFydC5cbiAgICogYXJyWzFdIHJlcHJlc2VudHMgZW5kIHZhbHVlIG9mIHRoZSBiYXIgc2luY2UgdGhlIGRhdGEgaXMgaW4gdGhlIGZvcm0gb2YgW3N0YXJ0VmFsdWUsIGVuZFZhbHVlXS5cbiAgICogKi9cbiAgdmFyIHZhbHVlID0gQXJyYXkuaXNBcnJheShkYXRhUG9pbnQudmFsdWUpID8gZGF0YVBvaW50LnZhbHVlWzFdIDogZGF0YVBvaW50LnZhbHVlO1xuICByZXR1cm4ge1xuICAgIHg6IGRhdGFQb2ludC54LFxuICAgIHk6IGRhdGFQb2ludC55LFxuICAgIHZhbHVlLFxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgZ2V0VmFsdWVCeURhdGFLZXkgZG9lcyBub3QgdmFsaWRhdGUgdGhlIG91dHB1dCB0eXBlXG4gICAgZXJyb3JWYWw6IGdldFZhbHVlQnlEYXRhS2V5KGRhdGFQb2ludCwgZGF0YUtleSlcbiAgfTtcbn07XG5jbGFzcyBCYXJXaXRoU3RhdGUgZXh0ZW5kcyBQdXJlQ29tcG9uZW50IHtcbiAgcmVuZGVyKCkge1xuICAgIHZhciB7XG4gICAgICBoaWRlLFxuICAgICAgZGF0YSxcbiAgICAgIGRhdGFLZXksXG4gICAgICBjbGFzc05hbWUsXG4gICAgICB4QXhpc0lkLFxuICAgICAgeUF4aXNJZCxcbiAgICAgIG5lZWRDbGlwLFxuICAgICAgYmFja2dyb3VuZCxcbiAgICAgIGlkXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKGhpZGUgfHwgZGF0YSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIGxheWVyQ2xhc3MgPSBjbHN4KCdyZWNoYXJ0cy1iYXInLCBjbGFzc05hbWUpO1xuICAgIHZhciBjbGlwUGF0aElkID0gaWQ7XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExheWVyLCB7XG4gICAgICBjbGFzc05hbWU6IGxheWVyQ2xhc3MsXG4gICAgICBpZDogaWRcbiAgICB9LCBuZWVkQ2xpcCAmJiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcImRlZnNcIiwgbnVsbCwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoR3JhcGhpY2FsSXRlbUNsaXBQYXRoLCB7XG4gICAgICBjbGlwUGF0aElkOiBjbGlwUGF0aElkLFxuICAgICAgeEF4aXNJZDogeEF4aXNJZCxcbiAgICAgIHlBeGlzSWQ6IHlBeGlzSWRcbiAgICB9KSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExheWVyLCB7XG4gICAgICBjbGFzc05hbWU6IFwicmVjaGFydHMtYmFyLXJlY3RhbmdsZXNcIixcbiAgICAgIGNsaXBQYXRoOiBuZWVkQ2xpcCA/IFwidXJsKCNjbGlwUGF0aC1cIi5jb25jYXQoY2xpcFBhdGhJZCwgXCIpXCIpIDogdW5kZWZpbmVkXG4gICAgfSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQmFyQmFja2dyb3VuZCwge1xuICAgICAgZGF0YTogZGF0YSxcbiAgICAgIGRhdGFLZXk6IGRhdGFLZXksXG4gICAgICBiYWNrZ3JvdW5kOiBiYWNrZ3JvdW5kLFxuICAgICAgYWxsT3RoZXJCYXJQcm9wczogdGhpcy5wcm9wc1xuICAgIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZW5kZXJSZWN0YW5nbGVzLCB0aGlzLnByb3BzKSkpO1xuICB9XG59XG52YXIgZGVmYXVsdEJhclByb3BzID0ge1xuICBhY3RpdmVCYXI6IGZhbHNlLFxuICBhbmltYXRpb25CZWdpbjogMCxcbiAgYW5pbWF0aW9uRHVyYXRpb246IDQwMCxcbiAgYW5pbWF0aW9uRWFzaW5nOiAnZWFzZScsXG4gIGhpZGU6IGZhbHNlLFxuICBpc0FuaW1hdGlvbkFjdGl2ZTogIUdsb2JhbC5pc1NzcixcbiAgbGVnZW5kVHlwZTogJ3JlY3QnLFxuICBtaW5Qb2ludFNpemU6IGRlZmF1bHRNaW5Qb2ludFNpemUsXG4gIHhBeGlzSWQ6IDAsXG4gIHlBeGlzSWQ6IDBcbn07XG5mdW5jdGlvbiBCYXJJbXBsKHByb3BzKSB7XG4gIHZhciB7XG4gICAgeEF4aXNJZCxcbiAgICB5QXhpc0lkLFxuICAgIGhpZGUsXG4gICAgbGVnZW5kVHlwZSxcbiAgICBtaW5Qb2ludFNpemUsXG4gICAgYWN0aXZlQmFyLFxuICAgIGFuaW1hdGlvbkJlZ2luLFxuICAgIGFuaW1hdGlvbkR1cmF0aW9uLFxuICAgIGFuaW1hdGlvbkVhc2luZyxcbiAgICBpc0FuaW1hdGlvbkFjdGl2ZVxuICB9ID0gcHJvcHM7XG4gIHZhciB7XG4gICAgbmVlZENsaXBcbiAgfSA9IHVzZU5lZWRzQ2xpcCh4QXhpc0lkLCB5QXhpc0lkKTtcbiAgdmFyIGxheW91dCA9IHVzZUNoYXJ0TGF5b3V0KCk7XG4gIHZhciBpc1Bhbm9yYW1hID0gdXNlSXNQYW5vcmFtYSgpO1xuICB2YXIgY2VsbHMgPSBmaW5kQWxsQnlUeXBlKHByb3BzLmNoaWxkcmVuLCBDZWxsKTtcbiAgdmFyIHJlY3RzID0gdXNlQXBwU2VsZWN0b3Ioc3RhdGUgPT4gc2VsZWN0QmFyUmVjdGFuZ2xlcyhzdGF0ZSwgeEF4aXNJZCwgeUF4aXNJZCwgaXNQYW5vcmFtYSwgcHJvcHMuaWQsIGNlbGxzKSk7XG4gIGlmIChsYXlvdXQgIT09ICd2ZXJ0aWNhbCcgJiYgbGF5b3V0ICE9PSAnaG9yaXpvbnRhbCcpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgZXJyb3JCYXJPZmZzZXQ7XG4gIHZhciBmaXJzdERhdGFQb2ludCA9IHJlY3RzID09PSBudWxsIHx8IHJlY3RzID09PSB2b2lkIDAgPyB2b2lkIDAgOiByZWN0c1swXTtcbiAgaWYgKGZpcnN0RGF0YVBvaW50ID09IG51bGwgfHwgZmlyc3REYXRhUG9pbnQuaGVpZ2h0ID09IG51bGwgfHwgZmlyc3REYXRhUG9pbnQud2lkdGggPT0gbnVsbCkge1xuICAgIGVycm9yQmFyT2Zmc2V0ID0gMDtcbiAgfSBlbHNlIHtcbiAgICBlcnJvckJhck9mZnNldCA9IGxheW91dCA9PT0gJ3ZlcnRpY2FsJyA/IGZpcnN0RGF0YVBvaW50LmhlaWdodCAvIDIgOiBmaXJzdERhdGFQb2ludC53aWR0aCAvIDI7XG4gIH1cbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFNldEVycm9yQmFyQ29udGV4dCwge1xuICAgIHhBeGlzSWQ6IHhBeGlzSWQsXG4gICAgeUF4aXNJZDogeUF4aXNJZCxcbiAgICBkYXRhOiByZWN0cyxcbiAgICBkYXRhUG9pbnRGb3JtYXR0ZXI6IGVycm9yQmFyRGF0YVBvaW50Rm9ybWF0dGVyLFxuICAgIGVycm9yQmFyT2Zmc2V0OiBlcnJvckJhck9mZnNldFxuICB9LCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChCYXJXaXRoU3RhdGUsIF9leHRlbmRzKHt9LCBwcm9wcywge1xuICAgIGxheW91dDogbGF5b3V0LFxuICAgIG5lZWRDbGlwOiBuZWVkQ2xpcCxcbiAgICBkYXRhOiByZWN0cyxcbiAgICB4QXhpc0lkOiB4QXhpc0lkLFxuICAgIHlBeGlzSWQ6IHlBeGlzSWQsXG4gICAgaGlkZTogaGlkZSxcbiAgICBsZWdlbmRUeXBlOiBsZWdlbmRUeXBlLFxuICAgIG1pblBvaW50U2l6ZTogbWluUG9pbnRTaXplLFxuICAgIGFjdGl2ZUJhcjogYWN0aXZlQmFyLFxuICAgIGFuaW1hdGlvbkJlZ2luOiBhbmltYXRpb25CZWdpbixcbiAgICBhbmltYXRpb25EdXJhdGlvbjogYW5pbWF0aW9uRHVyYXRpb24sXG4gICAgYW5pbWF0aW9uRWFzaW5nOiBhbmltYXRpb25FYXNpbmcsXG4gICAgaXNBbmltYXRpb25BY3RpdmU6IGlzQW5pbWF0aW9uQWN0aXZlXG4gIH0pKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZUJhclJlY3RhbmdsZXMoX3JlZjQpIHtcbiAgdmFyIHtcbiAgICBsYXlvdXQsXG4gICAgYmFyU2V0dGluZ3M6IHtcbiAgICAgIGRhdGFLZXksXG4gICAgICBtaW5Qb2ludFNpemU6IG1pblBvaW50U2l6ZVByb3BcbiAgICB9LFxuICAgIHBvcyxcbiAgICBiYW5kU2l6ZSxcbiAgICB4QXhpcyxcbiAgICB5QXhpcyxcbiAgICB4QXhpc1RpY2tzLFxuICAgIHlBeGlzVGlja3MsXG4gICAgc3RhY2tlZERhdGEsXG4gICAgZGlzcGxheWVkRGF0YSxcbiAgICBvZmZzZXQsXG4gICAgY2VsbHMsXG4gICAgcGFyZW50Vmlld0JveFxuICB9ID0gX3JlZjQ7XG4gIHZhciBudW1lcmljQXhpcyA9IGxheW91dCA9PT0gJ2hvcml6b250YWwnID8geUF4aXMgOiB4QXhpcztcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0aGlzIGFzc3VtZXMgdGhhdCB0aGUgZG9tYWluIGlzIGFsd2F5cyBudW1lcmljLCBidXQgZG9lc24ndCBjaGVjayBmb3IgaXRcbiAgdmFyIHN0YWNrZWREb21haW4gPSBzdGFja2VkRGF0YSA/IG51bWVyaWNBeGlzLnNjYWxlLmRvbWFpbigpIDogbnVsbDtcbiAgdmFyIGJhc2VWYWx1ZSA9IGdldEJhc2VWYWx1ZU9mQmFyKHtcbiAgICBudW1lcmljQXhpc1xuICB9KTtcbiAgcmV0dXJuIGRpc3BsYXllZERhdGEubWFwKChlbnRyeSwgaW5kZXgpID0+IHtcbiAgICB2YXIgdmFsdWUsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGJhY2tncm91bmQ7XG4gICAgaWYgKHN0YWNrZWREYXRhKSB7XG4gICAgICAvLyB3ZSBkb24ndCBuZWVkIHRvIHVzZSBkYXRhU3RhcnRJbmRleCBoZXJlLCBiZWNhdXNlIHN0YWNrZWREYXRhIGlzIGFscmVhZHkgc2xpY2VkIGZyb20gdGhlIHNlbGVjdG9yXG4gICAgICB2YWx1ZSA9IHRydW5jYXRlQnlEb21haW4oc3RhY2tlZERhdGFbaW5kZXhdLCBzdGFja2VkRG9tYWluKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgPSBnZXRWYWx1ZUJ5RGF0YUtleShlbnRyeSwgZGF0YUtleSk7XG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHZhbHVlID0gW2Jhc2VWYWx1ZSwgdmFsdWVdO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgbWluUG9pbnRTaXplID0gbWluUG9pbnRTaXplQ2FsbGJhY2sobWluUG9pbnRTaXplUHJvcCwgZGVmYXVsdE1pblBvaW50U2l6ZSkodmFsdWVbMV0sIGluZGV4KTtcbiAgICBpZiAobGF5b3V0ID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgIHZhciBfcmVmNTtcbiAgICAgIHZhciBbYmFzZVZhbHVlU2NhbGUsIGN1cnJlbnRWYWx1ZVNjYWxlXSA9IFt5QXhpcy5zY2FsZSh2YWx1ZVswXSksIHlBeGlzLnNjYWxlKHZhbHVlWzFdKV07XG4gICAgICB4ID0gZ2V0Q2F0ZUNvb3JkaW5hdGVPZkJhcih7XG4gICAgICAgIGF4aXM6IHhBeGlzLFxuICAgICAgICB0aWNrczogeEF4aXNUaWNrcyxcbiAgICAgICAgYmFuZFNpemUsXG4gICAgICAgIG9mZnNldDogcG9zLm9mZnNldCxcbiAgICAgICAgZW50cnksXG4gICAgICAgIGluZGV4XG4gICAgICB9KTtcbiAgICAgIHkgPSAoX3JlZjUgPSBjdXJyZW50VmFsdWVTY2FsZSAhPT0gbnVsbCAmJiBjdXJyZW50VmFsdWVTY2FsZSAhPT0gdm9pZCAwID8gY3VycmVudFZhbHVlU2NhbGUgOiBiYXNlVmFsdWVTY2FsZSkgIT09IG51bGwgJiYgX3JlZjUgIT09IHZvaWQgMCA/IF9yZWY1IDogdW5kZWZpbmVkO1xuICAgICAgd2lkdGggPSBwb3Muc2l6ZTtcbiAgICAgIHZhciBjb21wdXRlZEhlaWdodCA9IGJhc2VWYWx1ZVNjYWxlIC0gY3VycmVudFZhbHVlU2NhbGU7XG4gICAgICBoZWlnaHQgPSBpc05hbihjb21wdXRlZEhlaWdodCkgPyAwIDogY29tcHV0ZWRIZWlnaHQ7XG4gICAgICBiYWNrZ3JvdW5kID0ge1xuICAgICAgICB4LFxuICAgICAgICB5OiBvZmZzZXQudG9wLFxuICAgICAgICB3aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBvZmZzZXQuaGVpZ2h0XG4gICAgICB9O1xuICAgICAgaWYgKE1hdGguYWJzKG1pblBvaW50U2l6ZSkgPiAwICYmIE1hdGguYWJzKGhlaWdodCkgPCBNYXRoLmFicyhtaW5Qb2ludFNpemUpKSB7XG4gICAgICAgIHZhciBkZWx0YSA9IG1hdGhTaWduKGhlaWdodCB8fCBtaW5Qb2ludFNpemUpICogKE1hdGguYWJzKG1pblBvaW50U2l6ZSkgLSBNYXRoLmFicyhoZWlnaHQpKTtcbiAgICAgICAgeSAtPSBkZWx0YTtcbiAgICAgICAgaGVpZ2h0ICs9IGRlbHRhO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgW19iYXNlVmFsdWVTY2FsZSwgX2N1cnJlbnRWYWx1ZVNjYWxlXSA9IFt4QXhpcy5zY2FsZSh2YWx1ZVswXSksIHhBeGlzLnNjYWxlKHZhbHVlWzFdKV07XG4gICAgICB4ID0gX2Jhc2VWYWx1ZVNjYWxlO1xuICAgICAgeSA9IGdldENhdGVDb29yZGluYXRlT2ZCYXIoe1xuICAgICAgICBheGlzOiB5QXhpcyxcbiAgICAgICAgdGlja3M6IHlBeGlzVGlja3MsXG4gICAgICAgIGJhbmRTaXplLFxuICAgICAgICBvZmZzZXQ6IHBvcy5vZmZzZXQsXG4gICAgICAgIGVudHJ5LFxuICAgICAgICBpbmRleFxuICAgICAgfSk7XG4gICAgICB3aWR0aCA9IF9jdXJyZW50VmFsdWVTY2FsZSAtIF9iYXNlVmFsdWVTY2FsZTtcbiAgICAgIGhlaWdodCA9IHBvcy5zaXplO1xuICAgICAgYmFja2dyb3VuZCA9IHtcbiAgICAgICAgeDogb2Zmc2V0LmxlZnQsXG4gICAgICAgIHksXG4gICAgICAgIHdpZHRoOiBvZmZzZXQud2lkdGgsXG4gICAgICAgIGhlaWdodFxuICAgICAgfTtcbiAgICAgIGlmIChNYXRoLmFicyhtaW5Qb2ludFNpemUpID4gMCAmJiBNYXRoLmFicyh3aWR0aCkgPCBNYXRoLmFicyhtaW5Qb2ludFNpemUpKSB7XG4gICAgICAgIHZhciBfZGVsdGEgPSBtYXRoU2lnbih3aWR0aCB8fCBtaW5Qb2ludFNpemUpICogKE1hdGguYWJzKG1pblBvaW50U2l6ZSkgLSBNYXRoLmFicyh3aWR0aCkpO1xuICAgICAgICB3aWR0aCArPSBfZGVsdGE7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh4ID09IG51bGwgfHwgeSA9PSBudWxsIHx8IHdpZHRoID09IG51bGwgfHwgaGVpZ2h0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB2YXIgYmFyUmVjdGFuZ2xlSXRlbSA9IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgZW50cnkpLCB7fSwge1xuICAgICAgeCxcbiAgICAgIHksXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIHZhbHVlOiBzdGFja2VkRGF0YSA/IHZhbHVlIDogdmFsdWVbMV0sXG4gICAgICBwYXlsb2FkOiBlbnRyeSxcbiAgICAgIGJhY2tncm91bmQsXG4gICAgICB0b29sdGlwUG9zaXRpb246IHtcbiAgICAgICAgeDogeCArIHdpZHRoIC8gMixcbiAgICAgICAgeTogeSArIGhlaWdodCAvIDJcbiAgICAgIH0sXG4gICAgICBwYXJlbnRWaWV3Qm94XG4gICAgfSwgY2VsbHMgJiYgY2VsbHNbaW5kZXhdICYmIGNlbGxzW2luZGV4XS5wcm9wcyk7XG4gICAgcmV0dXJuIGJhclJlY3RhbmdsZUl0ZW07XG4gIH0pLmZpbHRlcihCb29sZWFuKTtcbn1cbmZ1bmN0aW9uIEJhckZuKG91dHNpZGVQcm9wcykge1xuICB2YXIgcHJvcHMgPSByZXNvbHZlRGVmYXVsdFByb3BzKG91dHNpZGVQcm9wcywgZGVmYXVsdEJhclByb3BzKTtcbiAgdmFyIGlzUGFub3JhbWEgPSB1c2VJc1Bhbm9yYW1hKCk7XG4gIC8vIFJlcG9ydCBhbGwgcHJvcHMgdG8gUmVkdXggc3RvcmUgZmlyc3QsIGJlZm9yZSBjYWxsaW5nIGFueSBob29rcywgdG8gYXZvaWQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLlxuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVnaXN0ZXJHcmFwaGljYWxJdGVtSWQsIHtcbiAgICBpZDogcHJvcHMuaWQsXG4gICAgdHlwZTogXCJiYXJcIlxuICB9LCBpZCA9PiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5GcmFnbWVudCwgbnVsbCwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2V0TGVnZW5kUGF5bG9hZCwge1xuICAgIGxlZ2VuZFBheWxvYWQ6IGNvbXB1dGVMZWdlbmRQYXlsb2FkRnJvbUJhckRhdGEocHJvcHMpXG4gIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTZXRUb29sdGlwRW50cnlTZXR0aW5ncywge1xuICAgIGZuOiBnZXRUb29sdGlwRW50cnlTZXR0aW5ncyxcbiAgICBhcmdzOiBwcm9wc1xuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2V0Q2FydGVzaWFuR3JhcGhpY2FsSXRlbSwge1xuICAgIHR5cGU6IFwiYmFyXCIsXG4gICAgaWQ6IGlkXG4gICAgLy8gQmFyIGRvZXMgbm90IGFsbG93IHNldHRpbmcgZGF0YSBkaXJlY3RseSBvbiB0aGUgZ3JhcGhpY2FsIGl0ZW0gKHdoeT8pXG4gICAgLFxuICAgIGRhdGE6IHVuZGVmaW5lZCxcbiAgICB4QXhpc0lkOiBwcm9wcy54QXhpc0lkLFxuICAgIHlBeGlzSWQ6IHByb3BzLnlBeGlzSWQsXG4gICAgekF4aXNJZDogMCxcbiAgICBkYXRhS2V5OiBwcm9wcy5kYXRhS2V5LFxuICAgIHN0YWNrSWQ6IGdldE5vcm1hbGl6ZWRTdGFja0lkKHByb3BzLnN0YWNrSWQpLFxuICAgIGhpZGU6IHByb3BzLmhpZGUsXG4gICAgYmFyU2l6ZTogcHJvcHMuYmFyU2l6ZSxcbiAgICBtaW5Qb2ludFNpemU6IHByb3BzLm1pblBvaW50U2l6ZSxcbiAgICBtYXhCYXJTaXplOiBwcm9wcy5tYXhCYXJTaXplLFxuICAgIGlzUGFub3JhbWE6IGlzUGFub3JhbWFcbiAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEJhckltcGwsIF9leHRlbmRzKHt9LCBwcm9wcywge1xuICAgIGlkOiBpZFxuICB9KSkpKTtcbn1cbmV4cG9ydCB2YXIgQmFyID0gLyojX19QVVJFX18qL1JlYWN0Lm1lbW8oQmFyRm4pO1xuQmFyLmRpc3BsYXlOYW1lID0gJ0Jhcic7IiwiLyoqXG4gKiBSZXByZXNlbnRzIGEgc2luZ2xlIGl0ZW0gaW4gdGhlIFJlYWN0U21vb3RoUXVldWUuXG4gKiBUaGUgaXRlbSBjYW4gYmU6XG4gKiAtIEEgbnVtYmVyIHJlcHJlc2VudGluZyBhIGRlbGF5IGluIG1pbGxpc2Vjb25kcy5cbiAqIC0gQW4gb2JqZWN0IHJlcHJlc2VudGluZyBhIHN0eWxlIGNoYW5nZVxuICogLSBBIFN0YXJ0QW5pbWF0aW9uRnVuY3Rpb24gdGhhdCBzdGFydHMgZWFzZWQgdHJhbnNpdGlvbiBhbmQgY2FsbHMgZGlmZmVyZW50IHJlbmRlclxuICogICAgICBiZWNhdXNlIG9mIGNvdXJzZSBpbiBSZWNoYXJ0cyB3ZSBoYXZlIHRvIGhhdmUgdGhyZWUgd2F5cyB0byBkbyBldmVyeXRoaW5nXG4gKiAtIEFuIGFyYml0cmFyeSBmdW5jdGlvbiB0byBiZSBleGVjdXRlZFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBbmltYXRlTWFuYWdlcih0aW1lb3V0Q29udHJvbGxlcikge1xuICB2YXIgY3VyclN0eWxlO1xuICB2YXIgaGFuZGxlQ2hhbmdlID0gKCkgPT4gbnVsbDtcbiAgdmFyIHNob3VsZFN0b3AgPSBmYWxzZTtcbiAgdmFyIGNhbmNlbFRpbWVvdXQgPSBudWxsO1xuICB2YXIgc2V0U3R5bGUgPSBfc3R5bGUgPT4ge1xuICAgIGlmIChzaG91bGRTdG9wKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KF9zdHlsZSkpIHtcbiAgICAgIGlmICghX3N0eWxlLmxlbmd0aCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgc3R5bGVzID0gX3N0eWxlO1xuICAgICAgdmFyIFtjdXJyLCAuLi5yZXN0U3R5bGVzXSA9IHN0eWxlcztcbiAgICAgIGlmICh0eXBlb2YgY3VyciA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgY2FuY2VsVGltZW91dCA9IHRpbWVvdXRDb250cm9sbGVyLnNldFRpbWVvdXQoc2V0U3R5bGUuYmluZChudWxsLCByZXN0U3R5bGVzKSwgY3Vycik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNldFN0eWxlKGN1cnIpO1xuICAgICAgY2FuY2VsVGltZW91dCA9IHRpbWVvdXRDb250cm9sbGVyLnNldFRpbWVvdXQoc2V0U3R5bGUuYmluZChudWxsLCByZXN0U3R5bGVzKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0eXBlb2YgX3N0eWxlID09PSAnc3RyaW5nJykge1xuICAgICAgY3VyclN0eWxlID0gX3N0eWxlO1xuICAgICAgaGFuZGxlQ2hhbmdlKGN1cnJTdHlsZSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgX3N0eWxlID09PSAnb2JqZWN0Jykge1xuICAgICAgY3VyclN0eWxlID0gX3N0eWxlO1xuICAgICAgaGFuZGxlQ2hhbmdlKGN1cnJTdHlsZSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgX3N0eWxlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBfc3R5bGUoKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiB7XG4gICAgc3RvcDogKCkgPT4ge1xuICAgICAgc2hvdWxkU3RvcCA9IHRydWU7XG4gICAgfSxcbiAgICBzdGFydDogc3R5bGUgPT4ge1xuICAgICAgc2hvdWxkU3RvcCA9IGZhbHNlO1xuICAgICAgaWYgKGNhbmNlbFRpbWVvdXQpIHtcbiAgICAgICAgY2FuY2VsVGltZW91dCgpO1xuICAgICAgICBjYW5jZWxUaW1lb3V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHNldFN0eWxlKHN0eWxlKTtcbiAgICB9LFxuICAgIHN1YnNjcmliZTogX2hhbmRsZUNoYW5nZSA9PiB7XG4gICAgICBoYW5kbGVDaGFuZ2UgPSBfaGFuZGxlQ2hhbmdlO1xuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgaGFuZGxlQ2hhbmdlID0gKCkgPT4gbnVsbDtcbiAgICAgIH07XG4gICAgfSxcbiAgICBnZXRUaW1lb3V0Q29udHJvbGxlcjogKCkgPT4gdGltZW91dENvbnRyb2xsZXJcbiAgfTtcbn0iLCIvKipcbiAqIENhbGxiYWNrIHR5cGUgZm9yIHRoZSB0aW1lb3V0IGZ1bmN0aW9uLlxuICogUmVjZWl2ZXMgY3VycmVudCB0aW1lIGluIG1pbGxpc2Vjb25kcyBhcyBhbiBhcmd1bWVudC5cbiAqL1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsIGNhbmNlbHMgdGhlIHRpbWVvdXQuXG4gKi9cblxuZXhwb3J0IGNsYXNzIFJlcXVlc3RBbmltYXRpb25GcmFtZVRpbWVvdXRDb250cm9sbGVyIHtcbiAgc2V0VGltZW91dChjYWxsYmFjaykge1xuICAgIHZhciBkZWxheSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcbiAgICB2YXIgc3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgdmFyIHJlcXVlc3RJZCA9IG51bGw7XG4gICAgdmFyIGV4ZWN1dGVDYWxsYmFjayA9IG5vdyA9PiB7XG4gICAgICBpZiAobm93IC0gc3RhcnRUaW1lID49IGRlbGF5KSB7XG4gICAgICAgIGNhbGxiYWNrKG5vdyk7XG4gICAgICAgIC8vIHRlc3RzIGZhaWwgd2l0aG91dCB0aGUgZXh0cmEgaWYsIGV2ZW4gd2hlbiBmaXZlIGxpbmVzIGJlbG93IGl0J3Mgbm90IG5lZWRlZFxuICAgICAgICAvLyBUT0RPIGZpbmlzaCB0cmFuc2l0aW9uIHRvIHRoZSBtb2NrZWQgdGltZW91dCBjb250cm9sbGVyIGFuZCB0aGVuIHJlbW92ZSB0aGlzIGNvbmRpdGlvblxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJlcXVlc3RJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShleGVjdXRlQ2FsbGJhY2spO1xuICAgICAgfVxuICAgIH07XG4gICAgcmVxdWVzdElkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGV4ZWN1dGVDYWxsYmFjayk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHJlcXVlc3RJZCk7XG4gICAgfTtcbiAgfVxufSIsImltcG9ydCB7IGNyZWF0ZUFuaW1hdGVNYW5hZ2VyIH0gZnJvbSAnLi9BbmltYXRpb25NYW5hZ2VyJztcbmltcG9ydCB7IFJlcXVlc3RBbmltYXRpb25GcmFtZVRpbWVvdXRDb250cm9sbGVyIH0gZnJvbSAnLi90aW1lb3V0Q29udHJvbGxlcic7XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGVmYXVsdEFuaW1hdGlvbk1hbmFnZXIoKSB7XG4gIHJldHVybiBjcmVhdGVBbmltYXRlTWFuYWdlcihuZXcgUmVxdWVzdEFuaW1hdGlvbkZyYW1lVGltZW91dENvbnRyb2xsZXIoKSk7XG59IiwiaW1wb3J0IHsgY3JlYXRlQ29udGV4dCwgdXNlQ29udGV4dCwgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNyZWF0ZURlZmF1bHRBbmltYXRpb25NYW5hZ2VyIH0gZnJvbSAnLi9jcmVhdGVEZWZhdWx0QW5pbWF0aW9uTWFuYWdlcic7XG5leHBvcnQgdmFyIEFuaW1hdGlvbk1hbmFnZXJDb250ZXh0ID0gLyojX19QVVJFX18qL2NyZWF0ZUNvbnRleHQoY3JlYXRlRGVmYXVsdEFuaW1hdGlvbk1hbmFnZXIpO1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUFuaW1hdGlvbk1hbmFnZXIoYW5pbWF0aW9uSWQsIGFuaW1hdGlvbk1hbmFnZXJGcm9tUHJvcHMpIHtcbiAgdmFyIGNvbnRleHRBbmltYXRpb25NYW5hZ2VyID0gdXNlQ29udGV4dChBbmltYXRpb25NYW5hZ2VyQ29udGV4dCk7XG4gIHJldHVybiB1c2VNZW1vKCgpID0+IGFuaW1hdGlvbk1hbmFnZXJGcm9tUHJvcHMgIT09IG51bGwgJiYgYW5pbWF0aW9uTWFuYWdlckZyb21Qcm9wcyAhPT0gdm9pZCAwID8gYW5pbWF0aW9uTWFuYWdlckZyb21Qcm9wcyA6IGNvbnRleHRBbmltYXRpb25NYW5hZ2VyKGFuaW1hdGlvbklkKSwgW2FuaW1hdGlvbklkLCBhbmltYXRpb25NYW5hZ2VyRnJvbVByb3BzLCBjb250ZXh0QW5pbWF0aW9uTWFuYWdlcl0pO1xufSIsImZ1bmN0aW9uIG93bktleXMoZSwgcikgeyB2YXIgdCA9IE9iamVjdC5rZXlzKGUpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IHIgJiYgKG8gPSBvLmZpbHRlcihmdW5jdGlvbiAocikgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihlLCByKS5lbnVtZXJhYmxlOyB9KSksIHQucHVzaC5hcHBseSh0LCBvKTsgfSByZXR1cm4gdDsgfVxuZnVuY3Rpb24gX29iamVjdFNwcmVhZChlKSB7IGZvciAodmFyIHIgPSAxOyByIDwgYXJndW1lbnRzLmxlbmd0aDsgcisrKSB7IHZhciB0ID0gbnVsbCAhPSBhcmd1bWVudHNbcl0gPyBhcmd1bWVudHNbcl0gOiB7fTsgciAlIDIgPyBvd25LZXlzKE9iamVjdCh0KSwgITApLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgX2RlZmluZVByb3BlcnR5KGUsIHIsIHRbcl0pOyB9KSA6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModCkpIDogb3duS2V5cyhPYmplY3QodCkpLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodCwgcikpOyB9KTsgfSByZXR1cm4gZTsgfVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KGUsIHIsIHQpIHsgcmV0dXJuIChyID0gX3RvUHJvcGVydHlLZXkocikpIGluIGUgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgeyB2YWx1ZTogdCwgZW51bWVyYWJsZTogITAsIGNvbmZpZ3VyYWJsZTogITAsIHdyaXRhYmxlOiAhMCB9KSA6IGVbcl0gPSB0LCBlOyB9XG5mdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleSh0KSB7IHZhciBpID0gX3RvUHJpbWl0aXZlKHQsIFwic3RyaW5nXCIpOyByZXR1cm4gXCJzeW1ib2xcIiA9PSB0eXBlb2YgaSA/IGkgOiBpICsgXCJcIjsgfVxuZnVuY3Rpb24gX3RvUHJpbWl0aXZlKHQsIHIpIHsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIHQgfHwgIXQpIHJldHVybiB0OyB2YXIgZSA9IHRbU3ltYm9sLnRvUHJpbWl0aXZlXTsgaWYgKHZvaWQgMCAhPT0gZSkgeyB2YXIgaSA9IGUuY2FsbCh0LCByIHx8IFwiZGVmYXVsdFwiKTsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIGkpIHJldHVybiBpOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7IH0gcmV0dXJuIChcInN0cmluZ1wiID09PSByID8gU3RyaW5nIDogTnVtYmVyKSh0KTsgfVxuLypcbiAqIEBkZXNjcmlwdGlvbjogY29udmVydCBjYW1lbCBjYXNlIHRvIGRhc2ggY2FzZVxuICogc3RyaW5nID0+IHN0cmluZ1xuICovXG5leHBvcnQgdmFyIGdldERhc2hDYXNlID0gbmFtZSA9PiBuYW1lLnJlcGxhY2UoLyhbQS1aXSkvZywgdiA9PiBcIi1cIi5jb25jYXQodi50b0xvd2VyQ2FzZSgpKSk7XG5leHBvcnQgdmFyIGdldFRyYW5zaXRpb25WYWwgPSAocHJvcHMsIGR1cmF0aW9uLCBlYXNpbmcpID0+IHByb3BzLm1hcChwcm9wID0+IFwiXCIuY29uY2F0KGdldERhc2hDYXNlKHByb3ApLCBcIiBcIikuY29uY2F0KGR1cmF0aW9uLCBcIm1zIFwiKS5jb25jYXQoZWFzaW5nKSkuam9pbignLCcpO1xuXG4vKipcbiAqIEZpbmRzIHRoZSBpbnRlcnNlY3Rpb24gb2Yga2V5cyBiZXR3ZWVuIHR3byBvYmplY3RzXG4gKiBAcGFyYW0ge29iamVjdH0gcHJlT2JqIHByZXZpb3VzIG9iamVjdFxuICogQHBhcmFtIHtvYmplY3R9IG5leHRPYmogbmV4dCBvYmplY3RcbiAqIEByZXR1cm5zIGFuIGFycmF5IG9mIGtleXMgdGhhdCBleGlzdCBpbiBib3RoIG9iamVjdHNcbiAqL1xuZXhwb3J0IHZhciBnZXRJbnRlcnNlY3Rpb25LZXlzID0gKHByZU9iaiwgbmV4dE9iaikgPT4gW09iamVjdC5rZXlzKHByZU9iaiksIE9iamVjdC5rZXlzKG5leHRPYmopXS5yZWR1Y2UoKGEsIGIpID0+IGEuZmlsdGVyKGMgPT4gYi5pbmNsdWRlcyhjKSkpO1xuXG4vKipcbiAqIE1hcHMgYW4gb2JqZWN0IHRvIGFub3RoZXIgb2JqZWN0XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBmbiBmdW5jdGlvbiB0byBtYXBcbiAqIEBwYXJhbSB7b2JqZWN0fSBvYmogb2JqZWN0IHRvIG1hcFxuICogQHJldHVybnMgbWFwcGVkIG9iamVjdFxuICovXG5leHBvcnQgdmFyIG1hcE9iamVjdCA9IChmbiwgb2JqKSA9PiBPYmplY3Qua2V5cyhvYmopLnJlZHVjZSgocmVzLCBrZXkpID0+IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgcmVzKSwge30sIHtcbiAgW2tleV06IGZuKGtleSwgb2JqW2tleV0pXG59KSwge30pOyIsImZ1bmN0aW9uIG93bktleXMoZSwgcikgeyB2YXIgdCA9IE9iamVjdC5rZXlzKGUpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IHIgJiYgKG8gPSBvLmZpbHRlcihmdW5jdGlvbiAocikgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihlLCByKS5lbnVtZXJhYmxlOyB9KSksIHQucHVzaC5hcHBseSh0LCBvKTsgfSByZXR1cm4gdDsgfVxuZnVuY3Rpb24gX29iamVjdFNwcmVhZChlKSB7IGZvciAodmFyIHIgPSAxOyByIDwgYXJndW1lbnRzLmxlbmd0aDsgcisrKSB7IHZhciB0ID0gbnVsbCAhPSBhcmd1bWVudHNbcl0gPyBhcmd1bWVudHNbcl0gOiB7fTsgciAlIDIgPyBvd25LZXlzKE9iamVjdCh0KSwgITApLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgX2RlZmluZVByb3BlcnR5KGUsIHIsIHRbcl0pOyB9KSA6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModCkpIDogb3duS2V5cyhPYmplY3QodCkpLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodCwgcikpOyB9KTsgfSByZXR1cm4gZTsgfVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KGUsIHIsIHQpIHsgcmV0dXJuIChyID0gX3RvUHJvcGVydHlLZXkocikpIGluIGUgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgeyB2YWx1ZTogdCwgZW51bWVyYWJsZTogITAsIGNvbmZpZ3VyYWJsZTogITAsIHdyaXRhYmxlOiAhMCB9KSA6IGVbcl0gPSB0LCBlOyB9XG5mdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleSh0KSB7IHZhciBpID0gX3RvUHJpbWl0aXZlKHQsIFwic3RyaW5nXCIpOyByZXR1cm4gXCJzeW1ib2xcIiA9PSB0eXBlb2YgaSA/IGkgOiBpICsgXCJcIjsgfVxuZnVuY3Rpb24gX3RvUHJpbWl0aXZlKHQsIHIpIHsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIHQgfHwgIXQpIHJldHVybiB0OyB2YXIgZSA9IHRbU3ltYm9sLnRvUHJpbWl0aXZlXTsgaWYgKHZvaWQgMCAhPT0gZSkgeyB2YXIgaSA9IGUuY2FsbCh0LCByIHx8IFwiZGVmYXVsdFwiKTsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIGkpIHJldHVybiBpOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7IH0gcmV0dXJuIChcInN0cmluZ1wiID09PSByID8gU3RyaW5nIDogTnVtYmVyKSh0KTsgfVxuaW1wb3J0IHsgZ2V0SW50ZXJzZWN0aW9uS2V5cywgbWFwT2JqZWN0IH0gZnJvbSAnLi91dGlsJztcbmV4cG9ydCB2YXIgYWxwaGEgPSAoYmVnaW4sIGVuZCwgaykgPT4gYmVnaW4gKyAoZW5kIC0gYmVnaW4pICogaztcbnZhciBuZWVkQ29udGludWUgPSBfcmVmID0+IHtcbiAgdmFyIHtcbiAgICBmcm9tLFxuICAgIHRvXG4gIH0gPSBfcmVmO1xuICByZXR1cm4gZnJvbSAhPT0gdG87XG59O1xuLypcbiAqIEBkZXNjcmlwdGlvbjogY2FsIG5ldyBmcm9tIHZhbHVlIGFuZCB2ZWxvY2l0eSBpbiBlYWNoIHN0ZXBwZXJcbiAqIEByZXR1cm46IHsgW3N0eWxlUHJvcGVydHldOiB7IGZyb20sIHRvLCB2ZWxvY2l0eSB9IH1cbiAqL1xudmFyIGNhbFN0ZXBwZXJWYWxzID0gKGVhc2luZywgcHJlVmFscywgc3RlcHMpID0+IHtcbiAgdmFyIG5leHRTdGVwVmFscyA9IG1hcE9iamVjdCgoa2V5LCB2YWwpID0+IHtcbiAgICBpZiAobmVlZENvbnRpbnVlKHZhbCkpIHtcbiAgICAgIHZhciBbbmV3WCwgbmV3Vl0gPSBlYXNpbmcodmFsLmZyb20sIHZhbC50bywgdmFsLnZlbG9jaXR5KTtcbiAgICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIHZhbCksIHt9LCB7XG4gICAgICAgIGZyb206IG5ld1gsXG4gICAgICAgIHZlbG9jaXR5OiBuZXdWXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbDtcbiAgfSwgcHJlVmFscyk7XG4gIGlmIChzdGVwcyA8IDEpIHtcbiAgICByZXR1cm4gbWFwT2JqZWN0KChrZXksIHZhbCkgPT4ge1xuICAgICAgaWYgKG5lZWRDb250aW51ZSh2YWwpKSB7XG4gICAgICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIHZhbCksIHt9LCB7XG4gICAgICAgICAgdmVsb2NpdHk6IGFscGhhKHZhbC52ZWxvY2l0eSwgbmV4dFN0ZXBWYWxzW2tleV0udmVsb2NpdHksIHN0ZXBzKSxcbiAgICAgICAgICBmcm9tOiBhbHBoYSh2YWwuZnJvbSwgbmV4dFN0ZXBWYWxzW2tleV0uZnJvbSwgc3RlcHMpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9LCBwcmVWYWxzKTtcbiAgfVxuICByZXR1cm4gY2FsU3RlcHBlclZhbHMoZWFzaW5nLCBuZXh0U3RlcFZhbHMsIHN0ZXBzIC0gMSk7XG59O1xuZnVuY3Rpb24gY3JlYXRlU3RlcHBlclVwZGF0ZShmcm9tLCB0bywgZWFzaW5nLCBpbnRlcktleXMsIHJlbmRlciwgdGltZW91dENvbnRyb2xsZXIpIHtcbiAgdmFyIHByZVRpbWU7XG4gIHZhciBzdGVwcGVyU3R5bGUgPSBpbnRlcktleXMucmVkdWNlKChyZXMsIGtleSkgPT4gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCByZXMpLCB7fSwge1xuICAgIFtrZXldOiB7XG4gICAgICBmcm9tOiBmcm9tW2tleV0sXG4gICAgICB2ZWxvY2l0eTogMCxcbiAgICAgIHRvOiB0b1trZXldXG4gICAgfVxuICB9KSwge30pO1xuICB2YXIgZ2V0Q3VyclN0eWxlID0gKCkgPT4gbWFwT2JqZWN0KChrZXksIHZhbCkgPT4gdmFsLmZyb20sIHN0ZXBwZXJTdHlsZSk7XG4gIHZhciBzaG91bGRTdG9wQW5pbWF0aW9uID0gKCkgPT4gIU9iamVjdC52YWx1ZXMoc3RlcHBlclN0eWxlKS5maWx0ZXIobmVlZENvbnRpbnVlKS5sZW5ndGg7XG4gIHZhciBzdG9wQW5pbWF0aW9uID0gbnVsbDtcbiAgdmFyIHN0ZXBwZXJVcGRhdGUgPSBub3cgPT4ge1xuICAgIGlmICghcHJlVGltZSkge1xuICAgICAgcHJlVGltZSA9IG5vdztcbiAgICB9XG4gICAgdmFyIGRlbHRhVGltZSA9IG5vdyAtIHByZVRpbWU7XG4gICAgdmFyIHN0ZXBzID0gZGVsdGFUaW1lIC8gZWFzaW5nLmR0O1xuICAgIHN0ZXBwZXJTdHlsZSA9IGNhbFN0ZXBwZXJWYWxzKGVhc2luZywgc3RlcHBlclN0eWxlLCBzdGVwcyk7XG4gICAgLy8gZ2V0IHVuaW9uIHNldCBhbmQgYWRkIGNvbXBhdGlibGUgcHJlZml4XG4gICAgcmVuZGVyKF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBmcm9tKSwgdG8pLCBnZXRDdXJyU3R5bGUoKSkpO1xuICAgIHByZVRpbWUgPSBub3c7XG4gICAgaWYgKCFzaG91bGRTdG9wQW5pbWF0aW9uKCkpIHtcbiAgICAgIHN0b3BBbmltYXRpb24gPSB0aW1lb3V0Q29udHJvbGxlci5zZXRUaW1lb3V0KHN0ZXBwZXJVcGRhdGUpO1xuICAgIH1cbiAgfTtcblxuICAvLyByZXR1cm4gc3RhcnQgYW5pbWF0aW9uIG1ldGhvZFxuICByZXR1cm4gKCkgPT4ge1xuICAgIHN0b3BBbmltYXRpb24gPSB0aW1lb3V0Q29udHJvbGxlci5zZXRUaW1lb3V0KHN0ZXBwZXJVcGRhdGUpO1xuXG4gICAgLy8gcmV0dXJuIHN0b3AgYW5pbWF0aW9uIG1ldGhvZFxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBzdG9wQW5pbWF0aW9uKCk7XG4gICAgfTtcbiAgfTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZVRpbWluZ1VwZGF0ZShmcm9tLCB0bywgZWFzaW5nLCBkdXJhdGlvbiwgaW50ZXJLZXlzLCByZW5kZXIsIHRpbWVvdXRDb250cm9sbGVyKSB7XG4gIHZhciBzdG9wQW5pbWF0aW9uID0gbnVsbDtcbiAgdmFyIHRpbWluZ1N0eWxlID0gaW50ZXJLZXlzLnJlZHVjZSgocmVzLCBrZXkpID0+IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgcmVzKSwge30sIHtcbiAgICBba2V5XTogW2Zyb21ba2V5XSwgdG9ba2V5XV1cbiAgfSksIHt9KTtcbiAgdmFyIGJlZ2luVGltZTtcbiAgdmFyIHRpbWluZ1VwZGF0ZSA9IG5vdyA9PiB7XG4gICAgaWYgKCFiZWdpblRpbWUpIHtcbiAgICAgIGJlZ2luVGltZSA9IG5vdztcbiAgICB9XG4gICAgdmFyIHQgPSAobm93IC0gYmVnaW5UaW1lKSAvIGR1cmF0aW9uO1xuICAgIHZhciBjdXJyU3R5bGUgPSBtYXBPYmplY3QoKGtleSwgdmFsKSA9PiBhbHBoYSguLi52YWwsIGVhc2luZyh0KSksIHRpbWluZ1N0eWxlKTtcblxuICAgIC8vIGdldCB1bmlvbiBzZXQgYW5kIGFkZCBjb21wYXRpYmxlIHByZWZpeFxuICAgIHJlbmRlcihfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgZnJvbSksIHRvKSwgY3VyclN0eWxlKSk7XG4gICAgaWYgKHQgPCAxKSB7XG4gICAgICBzdG9wQW5pbWF0aW9uID0gdGltZW91dENvbnRyb2xsZXIuc2V0VGltZW91dCh0aW1pbmdVcGRhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZmluYWxTdHlsZSA9IG1hcE9iamVjdCgoa2V5LCB2YWwpID0+IGFscGhhKC4uLnZhbCwgZWFzaW5nKDEpKSwgdGltaW5nU3R5bGUpO1xuICAgICAgcmVuZGVyKF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBmcm9tKSwgdG8pLCBmaW5hbFN0eWxlKSk7XG4gICAgfVxuICB9O1xuXG4gIC8vIHJldHVybiBzdGFydCBhbmltYXRpb24gbWV0aG9kXG4gIHJldHVybiAoKSA9PiB7XG4gICAgc3RvcEFuaW1hdGlvbiA9IHRpbWVvdXRDb250cm9sbGVyLnNldFRpbWVvdXQodGltaW5nVXBkYXRlKTtcblxuICAgIC8vIHJldHVybiBzdG9wIGFuaW1hdGlvbiBtZXRob2RcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgc3RvcEFuaW1hdGlvbigpO1xuICAgIH07XG4gIH07XG59XG5cbi8vIGNvbmZpZ3VyZSB1cGRhdGUgZnVuY3Rpb25cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZGVmYXVsdC1leHBvcnRcbmV4cG9ydCBkZWZhdWx0IChmcm9tLCB0bywgZWFzaW5nLCBkdXJhdGlvbiwgcmVuZGVyLCB0aW1lb3V0Q29udHJvbGxlcikgPT4ge1xuICB2YXIgaW50ZXJLZXlzID0gZ2V0SW50ZXJzZWN0aW9uS2V5cyhmcm9tLCB0byk7XG4gIHJldHVybiBlYXNpbmcuaXNTdGVwcGVyID09PSB0cnVlID8gY3JlYXRlU3RlcHBlclVwZGF0ZShmcm9tLCB0bywgZWFzaW5nLCBpbnRlcktleXMsIHJlbmRlciwgdGltZW91dENvbnRyb2xsZXIpIDogY3JlYXRlVGltaW5nVXBkYXRlKGZyb20sIHRvLCBlYXNpbmcsIGR1cmF0aW9uLCBpbnRlcktleXMsIHJlbmRlciwgdGltZW91dENvbnRyb2xsZXIpO1xufTsiLCJleHBvcnQgdmFyIEFDQ1VSQUNZID0gMWUtNDtcbnZhciBjdWJpY0JlemllckZhY3RvciA9IChjMSwgYzIpID0+IFswLCAzICogYzEsIDMgKiBjMiAtIDYgKiBjMSwgMyAqIGMxIC0gMyAqIGMyICsgMV07XG52YXIgZXZhbHVhdGVQb2x5bm9taWFsID0gKHBhcmFtcywgdCkgPT4gcGFyYW1zLm1hcCgocGFyYW0sIGkpID0+IHBhcmFtICogdCAqKiBpKS5yZWR1Y2UoKHByZSwgY3VycikgPT4gcHJlICsgY3Vycik7XG52YXIgY3ViaWNCZXppZXIgPSAoYzEsIGMyKSA9PiB0ID0+IHtcbiAgdmFyIHBhcmFtcyA9IGN1YmljQmV6aWVyRmFjdG9yKGMxLCBjMik7XG4gIHJldHVybiBldmFsdWF0ZVBvbHlub21pYWwocGFyYW1zLCB0KTtcbn07XG52YXIgZGVyaXZhdGl2ZUN1YmljQmV6aWVyID0gKGMxLCBjMikgPT4gdCA9PiB7XG4gIHZhciBwYXJhbXMgPSBjdWJpY0JlemllckZhY3RvcihjMSwgYzIpO1xuICB2YXIgbmV3UGFyYW1zID0gWy4uLnBhcmFtcy5tYXAoKHBhcmFtLCBpKSA9PiBwYXJhbSAqIGkpLnNsaWNlKDEpLCAwXTtcbiAgcmV0dXJuIGV2YWx1YXRlUG9seW5vbWlhbChuZXdQYXJhbXMsIHQpO1xufTtcbi8vIGNhbGN1bGF0ZSBjdWJpYy1iZXppZXIgdXNpbmcgTmV3dG9uJ3MgbWV0aG9kXG5leHBvcnQgdmFyIGNvbmZpZ0JlemllciA9IGZ1bmN0aW9uIGNvbmZpZ0JlemllcigpIHtcbiAgdmFyIHgxLCB4MiwgeTEsIHkyO1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG4gIGlmIChhcmdzLmxlbmd0aCA9PT0gMSkge1xuICAgIHN3aXRjaCAoYXJnc1swXSkge1xuICAgICAgY2FzZSAnbGluZWFyJzpcbiAgICAgICAgW3gxLCB5MSwgeDIsIHkyXSA9IFswLjAsIDAuMCwgMS4wLCAxLjBdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Vhc2UnOlxuICAgICAgICBbeDEsIHkxLCB4MiwgeTJdID0gWzAuMjUsIDAuMSwgMC4yNSwgMS4wXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdlYXNlLWluJzpcbiAgICAgICAgW3gxLCB5MSwgeDIsIHkyXSA9IFswLjQyLCAwLjAsIDEuMCwgMS4wXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdlYXNlLW91dCc6XG4gICAgICAgIFt4MSwgeTEsIHgyLCB5Ml0gPSBbMC40MiwgMC4wLCAwLjU4LCAxLjBdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Vhc2UtaW4tb3V0JzpcbiAgICAgICAgW3gxLCB5MSwgeDIsIHkyXSA9IFswLjAsIDAuMCwgMC41OCwgMS4wXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB7XG4gICAgICAgICAgdmFyIGVhc2luZyA9IGFyZ3NbMF0uc3BsaXQoJygnKTtcbiAgICAgICAgICBpZiAoZWFzaW5nWzBdID09PSAnY3ViaWMtYmV6aWVyJyAmJiBlYXNpbmdbMV0uc3BsaXQoJyknKVswXS5zcGxpdCgnLCcpLmxlbmd0aCA9PT0gNCkge1xuICAgICAgICAgICAgW3gxLCB5MSwgeDIsIHkyXSA9IGVhc2luZ1sxXS5zcGxpdCgnKScpWzBdLnNwbGl0KCcsJykubWFwKHggPT4gcGFyc2VGbG9hdCh4KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSA0KSB7XG4gICAgW3gxLCB5MSwgeDIsIHkyXSA9IGFyZ3M7XG4gIH1cbiAgdmFyIGN1cnZlWCA9IGN1YmljQmV6aWVyKHgxLCB4Mik7XG4gIHZhciBjdXJ2ZVkgPSBjdWJpY0Jlemllcih5MSwgeTIpO1xuICB2YXIgZGVyQ3VydmVYID0gZGVyaXZhdGl2ZUN1YmljQmV6aWVyKHgxLCB4Mik7XG4gIHZhciByYW5nZVZhbHVlID0gdmFsdWUgPT4ge1xuICAgIGlmICh2YWx1ZSA+IDEpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH1cbiAgICBpZiAodmFsdWUgPCAwKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuICB2YXIgYmV6aWVyID0gX3QgPT4ge1xuICAgIHZhciB0ID0gX3QgPiAxID8gMSA6IF90O1xuICAgIHZhciB4ID0gdDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDg7ICsraSkge1xuICAgICAgdmFyIGV2YWxUID0gY3VydmVYKHgpIC0gdDtcbiAgICAgIHZhciBkZXJWYWwgPSBkZXJDdXJ2ZVgoeCk7XG4gICAgICBpZiAoTWF0aC5hYnMoZXZhbFQgLSB0KSA8IEFDQ1VSQUNZIHx8IGRlclZhbCA8IEFDQ1VSQUNZKSB7XG4gICAgICAgIHJldHVybiBjdXJ2ZVkoeCk7XG4gICAgICB9XG4gICAgICB4ID0gcmFuZ2VWYWx1ZSh4IC0gZXZhbFQgLyBkZXJWYWwpO1xuICAgIH1cbiAgICByZXR1cm4gY3VydmVZKHgpO1xuICB9O1xuICBiZXppZXIuaXNTdGVwcGVyID0gZmFsc2U7XG4gIHJldHVybiBiZXppZXI7XG59O1xuZXhwb3J0IHZhciBjb25maWdTcHJpbmcgPSBmdW5jdGlvbiBjb25maWdTcHJpbmcoKSB7XG4gIHZhciBjb25maWcgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICB2YXIge1xuICAgIHN0aWZmID0gMTAwLFxuICAgIGRhbXBpbmcgPSA4LFxuICAgIGR0ID0gMTdcbiAgfSA9IGNvbmZpZztcbiAgdmFyIHN0ZXBwZXIgPSAoY3VyclgsIGRlc3RYLCBjdXJyVikgPT4ge1xuICAgIHZhciBGU3ByaW5nID0gLShjdXJyWCAtIGRlc3RYKSAqIHN0aWZmO1xuICAgIHZhciBGRGFtcGluZyA9IGN1cnJWICogZGFtcGluZztcbiAgICB2YXIgbmV3ViA9IGN1cnJWICsgKEZTcHJpbmcgLSBGRGFtcGluZykgKiBkdCAvIDEwMDA7XG4gICAgdmFyIG5ld1ggPSBjdXJyViAqIGR0IC8gMTAwMCArIGN1cnJYO1xuICAgIGlmIChNYXRoLmFicyhuZXdYIC0gZGVzdFgpIDwgQUNDVVJBQ1kgJiYgTWF0aC5hYnMobmV3VikgPCBBQ0NVUkFDWSkge1xuICAgICAgcmV0dXJuIFtkZXN0WCwgMF07XG4gICAgfVxuICAgIHJldHVybiBbbmV3WCwgbmV3Vl07XG4gIH07XG4gIHN0ZXBwZXIuaXNTdGVwcGVyID0gdHJ1ZTtcbiAgc3RlcHBlci5kdCA9IGR0O1xuICByZXR1cm4gc3RlcHBlcjtcbn07XG5leHBvcnQgdmFyIGNvbmZpZ0Vhc2luZyA9IGVhc2luZyA9PiB7XG4gIGlmICh0eXBlb2YgZWFzaW5nID09PSAnc3RyaW5nJykge1xuICAgIHN3aXRjaCAoZWFzaW5nKSB7XG4gICAgICBjYXNlICdlYXNlJzpcbiAgICAgIGNhc2UgJ2Vhc2UtaW4tb3V0JzpcbiAgICAgIGNhc2UgJ2Vhc2Utb3V0JzpcbiAgICAgIGNhc2UgJ2Vhc2UtaW4nOlxuICAgICAgY2FzZSAnbGluZWFyJzpcbiAgICAgICAgcmV0dXJuIGNvbmZpZ0JlemllcihlYXNpbmcpO1xuICAgICAgY2FzZSAnc3ByaW5nJzpcbiAgICAgICAgcmV0dXJuIGNvbmZpZ1NwcmluZygpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGVhc2luZy5zcGxpdCgnKCcpWzBdID09PSAnY3ViaWMtYmV6aWVyJykge1xuICAgICAgICAgIHJldHVybiBjb25maWdCZXppZXIoZWFzaW5nKTtcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAodHlwZW9mIGVhc2luZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBlYXNpbmc7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59OyIsImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IG5vb3AgfSBmcm9tICdlcy10b29sa2l0JztcbmltcG9ydCB7IHJlc29sdmVEZWZhdWx0UHJvcHMgfSBmcm9tICcuLi91dGlsL3Jlc29sdmVEZWZhdWx0UHJvcHMnO1xuaW1wb3J0IGNvbmZpZ1VwZGF0ZSBmcm9tICcuL2NvbmZpZ1VwZGF0ZSc7XG5pbXBvcnQgeyBjb25maWdFYXNpbmcgfSBmcm9tICcuL2Vhc2luZyc7XG5pbXBvcnQgeyB1c2VBbmltYXRpb25NYW5hZ2VyIH0gZnJvbSAnLi91c2VBbmltYXRpb25NYW5hZ2VyJztcbnZhciBkZWZhdWx0SmF2YXNjcmlwdEFuaW1hdGVQcm9wcyA9IHtcbiAgYmVnaW46IDAsXG4gIGR1cmF0aW9uOiAxMDAwLFxuICBlYXNpbmc6ICdlYXNlJyxcbiAgaXNBY3RpdmU6IHRydWUsXG4gIGNhbkJlZ2luOiB0cnVlLFxuICBvbkFuaW1hdGlvbkVuZDogKCkgPT4ge30sXG4gIG9uQW5pbWF0aW9uU3RhcnQ6ICgpID0+IHt9XG59O1xudmFyIGZyb20gPSB7XG4gIHQ6IDBcbn07XG52YXIgdG8gPSB7XG4gIHQ6IDFcbn07XG5leHBvcnQgZnVuY3Rpb24gSmF2YXNjcmlwdEFuaW1hdGUob3V0c2lkZVByb3BzKSB7XG4gIHZhciBwcm9wcyA9IHJlc29sdmVEZWZhdWx0UHJvcHMob3V0c2lkZVByb3BzLCBkZWZhdWx0SmF2YXNjcmlwdEFuaW1hdGVQcm9wcyk7XG4gIHZhciB7XG4gICAgaXNBY3RpdmUsXG4gICAgY2FuQmVnaW4sXG4gICAgZHVyYXRpb24sXG4gICAgZWFzaW5nLFxuICAgIGJlZ2luLFxuICAgIG9uQW5pbWF0aW9uRW5kLFxuICAgIG9uQW5pbWF0aW9uU3RhcnQsXG4gICAgY2hpbGRyZW5cbiAgfSA9IHByb3BzO1xuICB2YXIgYW5pbWF0aW9uTWFuYWdlciA9IHVzZUFuaW1hdGlvbk1hbmFnZXIocHJvcHMuYW5pbWF0aW9uSWQsIHByb3BzLmFuaW1hdGlvbk1hbmFnZXIpO1xuICB2YXIgW3N0eWxlLCBzZXRTdHlsZV0gPSB1c2VTdGF0ZShpc0FjdGl2ZSA/IGZyb20gOiB0byk7XG4gIHZhciBzdG9wSlNBbmltYXRpb24gPSB1c2VSZWYobnVsbCk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFpc0FjdGl2ZSkge1xuICAgICAgc2V0U3R5bGUodG8pO1xuICAgIH1cbiAgfSwgW2lzQWN0aXZlXSk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFpc0FjdGl2ZSB8fCAhY2FuQmVnaW4pIHtcbiAgICAgIHJldHVybiBub29wO1xuICAgIH1cbiAgICB2YXIgc3RhcnRBbmltYXRpb24gPSBjb25maWdVcGRhdGUoZnJvbSwgdG8sIGNvbmZpZ0Vhc2luZyhlYXNpbmcpLCBkdXJhdGlvbiwgc2V0U3R5bGUsIGFuaW1hdGlvbk1hbmFnZXIuZ2V0VGltZW91dENvbnRyb2xsZXIoKSk7XG4gICAgdmFyIG9uQW5pbWF0aW9uQWN0aXZlID0gKCkgPT4ge1xuICAgICAgc3RvcEpTQW5pbWF0aW9uLmN1cnJlbnQgPSBzdGFydEFuaW1hdGlvbigpO1xuICAgIH07XG4gICAgYW5pbWF0aW9uTWFuYWdlci5zdGFydChbb25BbmltYXRpb25TdGFydCwgYmVnaW4sIG9uQW5pbWF0aW9uQWN0aXZlLCBkdXJhdGlvbiwgb25BbmltYXRpb25FbmRdKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgYW5pbWF0aW9uTWFuYWdlci5zdG9wKCk7XG4gICAgICBpZiAoc3RvcEpTQW5pbWF0aW9uLmN1cnJlbnQpIHtcbiAgICAgICAgc3RvcEpTQW5pbWF0aW9uLmN1cnJlbnQoKTtcbiAgICAgIH1cbiAgICAgIG9uQW5pbWF0aW9uRW5kKCk7XG4gICAgfTtcbiAgfSwgW2lzQWN0aXZlLCBjYW5CZWdpbiwgZHVyYXRpb24sIGVhc2luZywgYmVnaW4sIG9uQW5pbWF0aW9uU3RhcnQsIG9uQW5pbWF0aW9uRW5kLCBhbmltYXRpb25NYW5hZ2VyXSk7XG4gIHJldHVybiBjaGlsZHJlbihzdHlsZS50KTtcbn0iLCJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VBcHBTZWxlY3RvciB9IGZyb20gJy4uL3N0YXRlL2hvb2tzJztcbmltcG9ydCB7IGltcGxpY2l0WEF4aXMsIGltcGxpY2l0WUF4aXMsIHNlbGVjdFhBeGlzU2V0dGluZ3MsIHNlbGVjdFlBeGlzU2V0dGluZ3MgfSBmcm9tICcuLi9zdGF0ZS9zZWxlY3RvcnMvYXhpc1NlbGVjdG9ycyc7XG5pbXBvcnQgeyB1c2VQbG90QXJlYSB9IGZyb20gJy4uL2hvb2tzJztcbmV4cG9ydCBmdW5jdGlvbiB1c2VOZWVkc0NsaXAoeEF4aXNJZCwgeUF4aXNJZCkge1xuICB2YXIgX3hBeGlzJGFsbG93RGF0YU92ZXJmLCBfeUF4aXMkYWxsb3dEYXRhT3ZlcmY7XG4gIHZhciB4QXhpcyA9IHVzZUFwcFNlbGVjdG9yKHN0YXRlID0+IHNlbGVjdFhBeGlzU2V0dGluZ3Moc3RhdGUsIHhBeGlzSWQpKTtcbiAgdmFyIHlBeGlzID0gdXNlQXBwU2VsZWN0b3Ioc3RhdGUgPT4gc2VsZWN0WUF4aXNTZXR0aW5ncyhzdGF0ZSwgeUF4aXNJZCkpO1xuICB2YXIgbmVlZENsaXBYID0gKF94QXhpcyRhbGxvd0RhdGFPdmVyZiA9IHhBeGlzID09PSBudWxsIHx8IHhBeGlzID09PSB2b2lkIDAgPyB2b2lkIDAgOiB4QXhpcy5hbGxvd0RhdGFPdmVyZmxvdykgIT09IG51bGwgJiYgX3hBeGlzJGFsbG93RGF0YU92ZXJmICE9PSB2b2lkIDAgPyBfeEF4aXMkYWxsb3dEYXRhT3ZlcmYgOiBpbXBsaWNpdFhBeGlzLmFsbG93RGF0YU92ZXJmbG93O1xuICB2YXIgbmVlZENsaXBZID0gKF95QXhpcyRhbGxvd0RhdGFPdmVyZiA9IHlBeGlzID09PSBudWxsIHx8IHlBeGlzID09PSB2b2lkIDAgPyB2b2lkIDAgOiB5QXhpcy5hbGxvd0RhdGFPdmVyZmxvdykgIT09IG51bGwgJiYgX3lBeGlzJGFsbG93RGF0YU92ZXJmICE9PSB2b2lkIDAgPyBfeUF4aXMkYWxsb3dEYXRhT3ZlcmYgOiBpbXBsaWNpdFlBeGlzLmFsbG93RGF0YU92ZXJmbG93O1xuICB2YXIgbmVlZENsaXAgPSBuZWVkQ2xpcFggfHwgbmVlZENsaXBZO1xuICByZXR1cm4ge1xuICAgIG5lZWRDbGlwLFxuICAgIG5lZWRDbGlwWCxcbiAgICBuZWVkQ2xpcFlcbiAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBHcmFwaGljYWxJdGVtQ2xpcFBhdGgoX3JlZikge1xuICB2YXIge1xuICAgIHhBeGlzSWQsXG4gICAgeUF4aXNJZCxcbiAgICBjbGlwUGF0aElkXG4gIH0gPSBfcmVmO1xuICB2YXIgcGxvdEFyZWEgPSB1c2VQbG90QXJlYSgpO1xuICB2YXIge1xuICAgIG5lZWRDbGlwWCxcbiAgICBuZWVkQ2xpcFksXG4gICAgbmVlZENsaXBcbiAgfSA9IHVzZU5lZWRzQ2xpcCh4QXhpc0lkLCB5QXhpc0lkKTtcbiAgaWYgKCFuZWVkQ2xpcCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciB7XG4gICAgeCxcbiAgICB5LFxuICAgIHdpZHRoLFxuICAgIGhlaWdodFxuICB9ID0gcGxvdEFyZWE7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcImNsaXBQYXRoXCIsIHtcbiAgICBpZDogXCJjbGlwUGF0aC1cIi5jb25jYXQoY2xpcFBhdGhJZClcbiAgfSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJyZWN0XCIsIHtcbiAgICB4OiBuZWVkQ2xpcFggPyB4IDogeCAtIHdpZHRoIC8gMixcbiAgICB5OiBuZWVkQ2xpcFkgPyB5IDogeSAtIGhlaWdodCAvIDIsXG4gICAgd2lkdGg6IG5lZWRDbGlwWCA/IHdpZHRoIDogd2lkdGggKiAyLFxuICAgIGhlaWdodDogbmVlZENsaXBZID8gaGVpZ2h0IDogaGVpZ2h0ICogMlxuICB9KSk7XG59IiwidmFyIF9leGNsdWRlZCA9IFtcIm9uTW91c2VFbnRlclwiLCBcIm9uQ2xpY2tcIiwgXCJvbk1vdXNlTGVhdmVcIiwgXCJzaGFwZVwiLCBcImFjdGl2ZVNoYXBlXCJdLFxuICBfZXhjbHVkZWQyID0gW1wic3Ryb2tlXCIsIFwiZmlsbFwiLCBcImxlZ2VuZFR5cGVcIiwgXCJoaWRlXCIsIFwiaXNBbmltYXRpb25BY3RpdmVcIiwgXCJhbmltYXRpb25CZWdpblwiLCBcImFuaW1hdGlvbkR1cmF0aW9uXCIsIFwiYW5pbWF0aW9uRWFzaW5nXCIsIFwibmFtZUtleVwiLCBcImxhc3RTaGFwZVR5cGVcIl07XG5mdW5jdGlvbiBfZXh0ZW5kcygpIHsgcmV0dXJuIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiA/IE9iamVjdC5hc3NpZ24uYmluZCgpIDogZnVuY3Rpb24gKG4pIHsgZm9yICh2YXIgZSA9IDE7IGUgPCBhcmd1bWVudHMubGVuZ3RoOyBlKyspIHsgdmFyIHQgPSBhcmd1bWVudHNbZV07IGZvciAodmFyIHIgaW4gdCkgKHt9KS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHQsIHIpICYmIChuW3JdID0gdFtyXSk7IH0gcmV0dXJuIG47IH0sIF9leHRlbmRzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7IH1cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhlLCB0KSB7IGlmIChudWxsID09IGUpIHJldHVybiB7fTsgdmFyIG8sIHIsIGkgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShlLCB0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG4gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyBmb3IgKHIgPSAwOyByIDwgbi5sZW5ndGg7IHIrKykgbyA9IG5bcl0sIC0xID09PSB0LmluZGV4T2YobykgJiYge30ucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChlLCBvKSAmJiAoaVtvXSA9IGVbb10pOyB9IHJldHVybiBpOyB9XG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShyLCBlKSB7IGlmIChudWxsID09IHIpIHJldHVybiB7fTsgdmFyIHQgPSB7fTsgZm9yICh2YXIgbiBpbiByKSBpZiAoe30uaGFzT3duUHJvcGVydHkuY2FsbChyLCBuKSkgeyBpZiAoLTEgIT09IGUuaW5kZXhPZihuKSkgY29udGludWU7IHRbbl0gPSByW25dOyB9IHJldHVybiB0OyB9XG5mdW5jdGlvbiBvd25LZXlzKGUsIHIpIHsgdmFyIHQgPSBPYmplY3Qua2V5cyhlKTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG8gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyByICYmIChvID0gby5maWx0ZXIoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZSwgcikuZW51bWVyYWJsZTsgfSkpLCB0LnB1c2guYXBwbHkodCwgbyk7IH0gcmV0dXJuIHQ7IH1cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQoZSkgeyBmb3IgKHZhciByID0gMTsgciA8IGFyZ3VtZW50cy5sZW5ndGg7IHIrKykgeyB2YXIgdCA9IG51bGwgIT0gYXJndW1lbnRzW3JdID8gYXJndW1lbnRzW3JdIDoge307IHIgJSAyID8gb3duS2V5cyhPYmplY3QodCksICEwKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0W3JdKTsgfSkgOiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGUsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHQpKSA6IG93bktleXMoT2JqZWN0KHQpKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHQsIHIpKTsgfSk7IH0gcmV0dXJuIGU7IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0KSB7IHJldHVybiAociA9IF90b1Byb3BlcnR5S2V5KHIpKSBpbiBlID8gT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIHsgdmFsdWU6IHQsIGVudW1lcmFibGU6ICEwLCBjb25maWd1cmFibGU6ICEwLCB3cml0YWJsZTogITAgfSkgOiBlW3JdID0gdCwgZTsgfVxuZnVuY3Rpb24gX3RvUHJvcGVydHlLZXkodCkgeyB2YXIgaSA9IF90b1ByaW1pdGl2ZSh0LCBcInN0cmluZ1wiKTsgcmV0dXJuIFwic3ltYm9sXCIgPT0gdHlwZW9mIGkgPyBpIDogaSArIFwiXCI7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZSh0LCByKSB7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiB0IHx8ICF0KSByZXR1cm4gdDsgdmFyIGUgPSB0W1N5bWJvbC50b1ByaW1pdGl2ZV07IGlmICh2b2lkIDAgIT09IGUpIHsgdmFyIGkgPSBlLmNhbGwodCwgciB8fCBcImRlZmF1bHRcIik7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiBpKSByZXR1cm4gaTsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpOyB9IHJldHVybiAoXCJzdHJpbmdcIiA9PT0gciA/IFN0cmluZyA6IE51bWJlcikodCk7IH1cbi8qIGVzbGludC1kaXNhYmxlIG1heC1jbGFzc2VzLXBlci1maWxlICovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBQdXJlQ29tcG9uZW50LCB1c2VDYWxsYmFjaywgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBvbWl0IGZyb20gJ2VzLXRvb2xraXQvY29tcGF0L29taXQnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgc2VsZWN0QWN0aXZlSW5kZXggfSBmcm9tICcuLi9zdGF0ZS9zZWxlY3RvcnMvc2VsZWN0b3JzJztcbmltcG9ydCB7IHVzZUFwcFNlbGVjdG9yIH0gZnJvbSAnLi4vc3RhdGUvaG9va3MnO1xuaW1wb3J0IHsgTGF5ZXIgfSBmcm9tICcuLi9jb250YWluZXIvTGF5ZXInO1xuaW1wb3J0IHsgQ2FydGVzaWFuTGFiZWxMaXN0Q29udGV4dFByb3ZpZGVyLCBMYWJlbExpc3RGcm9tTGFiZWxQcm9wIH0gZnJvbSAnLi4vY29tcG9uZW50L0xhYmVsTGlzdCc7XG5pbXBvcnQgeyBHbG9iYWwgfSBmcm9tICcuLi91dGlsL0dsb2JhbCc7XG5pbXBvcnQgeyBpbnRlcnBvbGF0ZSwgaXNOdW1iZXIgfSBmcm9tICcuLi91dGlsL0RhdGFVdGlscyc7XG5pbXBvcnQgeyBnZXRWYWx1ZUJ5RGF0YUtleSB9IGZyb20gJy4uL3V0aWwvQ2hhcnRVdGlscyc7XG5pbXBvcnQgeyBhZGFwdEV2ZW50c09mQ2hpbGQgfSBmcm9tICcuLi91dGlsL3R5cGVzJztcbmltcG9ydCB7IEZ1bm5lbFRyYXBlem9pZCB9IGZyb20gJy4uL3V0aWwvRnVubmVsVXRpbHMnO1xuaW1wb3J0IHsgdXNlTW91c2VDbGlja0l0ZW1EaXNwYXRjaCwgdXNlTW91c2VFbnRlckl0ZW1EaXNwYXRjaCwgdXNlTW91c2VMZWF2ZUl0ZW1EaXNwYXRjaCB9IGZyb20gJy4uL2NvbnRleHQvdG9vbHRpcENvbnRleHQnO1xuaW1wb3J0IHsgU2V0VG9vbHRpcEVudHJ5U2V0dGluZ3MgfSBmcm9tICcuLi9zdGF0ZS9TZXRUb29sdGlwRW50cnlTZXR0aW5ncyc7XG5pbXBvcnQgeyBzZWxlY3RGdW5uZWxUcmFwZXpvaWRzIH0gZnJvbSAnLi4vc3RhdGUvc2VsZWN0b3JzL2Z1bm5lbFNlbGVjdG9ycyc7XG5pbXBvcnQgeyBmaW5kQWxsQnlUeXBlIH0gZnJvbSAnLi4vdXRpbC9SZWFjdFV0aWxzJztcbmltcG9ydCB7IENlbGwgfSBmcm9tICcuLi9jb21wb25lbnQvQ2VsbCc7XG5pbXBvcnQgeyByZXNvbHZlRGVmYXVsdFByb3BzIH0gZnJvbSAnLi4vdXRpbC9yZXNvbHZlRGVmYXVsdFByb3BzJztcbmltcG9ydCB7IHVzZVBsb3RBcmVhIH0gZnJvbSAnLi4vaG9va3MnO1xuaW1wb3J0IHsgc3ZnUHJvcGVydGllc05vRXZlbnRzIH0gZnJvbSAnLi4vdXRpbC9zdmdQcm9wZXJ0aWVzTm9FdmVudHMnO1xuaW1wb3J0IHsgSmF2YXNjcmlwdEFuaW1hdGUgfSBmcm9tICcuLi9hbmltYXRpb24vSmF2YXNjcmlwdEFuaW1hdGUnO1xuaW1wb3J0IHsgdXNlQW5pbWF0aW9uSWQgfSBmcm9tICcuLi91dGlsL3VzZUFuaW1hdGlvbklkJztcblxuLyoqXG4gKiBJbnRlcm5hbCBwcm9wcywgY29tYmluYXRpb24gb2YgZXh0ZXJuYWwgcHJvcHMgKyBkZWZhdWx0UHJvcHMgKyBwcml2YXRlIFJlY2hhcnRzIHN0YXRlXG4gKi9cblxuLyoqXG4gKiBFeHRlcm5hbCBwcm9wcywgaW50ZW5kZWQgZm9yIGVuZCB1c2VycyB0byBmaWxsIGluXG4gKi9cblxuZnVuY3Rpb24gZ2V0VG9vbHRpcEVudHJ5U2V0dGluZ3MocHJvcHMpIHtcbiAgdmFyIHtcbiAgICBkYXRhS2V5LFxuICAgIG5hbWVLZXksXG4gICAgc3Ryb2tlLFxuICAgIHN0cm9rZVdpZHRoLFxuICAgIGZpbGwsXG4gICAgbmFtZSxcbiAgICBoaWRlLFxuICAgIHRvb2x0aXBUeXBlLFxuICAgIGRhdGFcbiAgfSA9IHByb3BzO1xuICByZXR1cm4ge1xuICAgIGRhdGFEZWZpbmVkT25JdGVtOiBkYXRhLFxuICAgIHBvc2l0aW9uczogcHJvcHMudHJhcGV6b2lkcy5tYXAoX3JlZiA9PiB7XG4gICAgICB2YXIge1xuICAgICAgICB0b29sdGlwUG9zaXRpb25cbiAgICAgIH0gPSBfcmVmO1xuICAgICAgcmV0dXJuIHRvb2x0aXBQb3NpdGlvbjtcbiAgICB9KSxcbiAgICBzZXR0aW5nczoge1xuICAgICAgc3Ryb2tlLFxuICAgICAgc3Ryb2tlV2lkdGgsXG4gICAgICBmaWxsLFxuICAgICAgZGF0YUtleSxcbiAgICAgIG5hbWUsXG4gICAgICBuYW1lS2V5LFxuICAgICAgaGlkZSxcbiAgICAgIHR5cGU6IHRvb2x0aXBUeXBlLFxuICAgICAgY29sb3I6IGZpbGwsXG4gICAgICB1bml0OiAnJyAvLyBGdW5uZWwgZG9lcyBub3QgaGF2ZSB1bml0LCB3aHk/XG4gICAgfVxuICB9O1xufVxuZnVuY3Rpb24gRnVubmVsTGFiZWxMaXN0UHJvdmlkZXIoX3JlZjIpIHtcbiAgdmFyIHtcbiAgICBzaG93TGFiZWxzLFxuICAgIHRyYXBlem9pZHMsXG4gICAgY2hpbGRyZW5cbiAgfSA9IF9yZWYyO1xuICB2YXIgbGFiZWxMaXN0RW50cmllcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGlmICghc2hvd0xhYmVscykge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIHRyYXBlem9pZHMgPT09IG51bGwgfHwgdHJhcGV6b2lkcyA9PT0gdm9pZCAwID8gdm9pZCAwIDogdHJhcGV6b2lkcy5tYXAoZW50cnkgPT4ge1xuICAgICAgdmFyIHZpZXdCb3ggPSB7XG4gICAgICAgIHg6IGVudHJ5LngsXG4gICAgICAgIHk6IGVudHJ5LnksXG4gICAgICAgIC8vIExhYmVsIHBvc2l0aW9ucyBpbiBGdW5uZWwgYXJlIGNhbGN1bGF0ZWQgcmVsYXRpdmUgdG8gdXBwZXJXaWR0aCBzbyB0aGF0J3Mgd2hhdCB3ZSBuZWVkIHRvIHBhc3MgaGVyZSBhcyBcIndpZHRoXCJcbiAgICAgICAgd2lkdGg6IGVudHJ5LnVwcGVyV2lkdGgsXG4gICAgICAgIGhlaWdodDogZW50cnkuaGVpZ2h0XG4gICAgICB9O1xuICAgICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgdmlld0JveCksIHt9LCB7XG4gICAgICAgIHZhbHVlOiBlbnRyeS5uYW1lLFxuICAgICAgICBwYXlsb2FkOiBlbnRyeS5wYXlsb2FkLFxuICAgICAgICBwYXJlbnRWaWV3Qm94OiB1bmRlZmluZWQsXG4gICAgICAgIHZpZXdCb3gsXG4gICAgICAgIGZpbGw6IGVudHJ5LmZpbGxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LCBbc2hvd0xhYmVscywgdHJhcGV6b2lkc10pO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQ2FydGVzaWFuTGFiZWxMaXN0Q29udGV4dFByb3ZpZGVyLCB7XG4gICAgdmFsdWU6IGxhYmVsTGlzdEVudHJpZXNcbiAgfSwgY2hpbGRyZW4pO1xufVxuZnVuY3Rpb24gRnVubmVsVHJhcGV6b2lkcyhwcm9wcykge1xuICB2YXIge1xuICAgIHRyYXBlem9pZHMsXG4gICAgYWxsT3RoZXJGdW5uZWxQcm9wc1xuICB9ID0gcHJvcHM7XG4gIHZhciBhY3RpdmVJdGVtSW5kZXggPSB1c2VBcHBTZWxlY3RvcihzdGF0ZSA9PiBzZWxlY3RBY3RpdmVJbmRleChzdGF0ZSwgJ2l0ZW0nLCBzdGF0ZS50b29sdGlwLnNldHRpbmdzLnRyaWdnZXIsIHVuZGVmaW5lZCkpO1xuICB2YXIge1xuICAgICAgb25Nb3VzZUVudGVyOiBvbk1vdXNlRW50ZXJGcm9tUHJvcHMsXG4gICAgICBvbkNsaWNrOiBvbkl0ZW1DbGlja0Zyb21Qcm9wcyxcbiAgICAgIG9uTW91c2VMZWF2ZTogb25Nb3VzZUxlYXZlRnJvbVByb3BzLFxuICAgICAgc2hhcGUsXG4gICAgICBhY3RpdmVTaGFwZVxuICAgIH0gPSBhbGxPdGhlckZ1bm5lbFByb3BzLFxuICAgIHJlc3RPZkFsbE90aGVyUHJvcHMgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoYWxsT3RoZXJGdW5uZWxQcm9wcywgX2V4Y2x1ZGVkKTtcbiAgdmFyIG9uTW91c2VFbnRlckZyb21Db250ZXh0ID0gdXNlTW91c2VFbnRlckl0ZW1EaXNwYXRjaChvbk1vdXNlRW50ZXJGcm9tUHJvcHMsIGFsbE90aGVyRnVubmVsUHJvcHMuZGF0YUtleSk7XG4gIHZhciBvbk1vdXNlTGVhdmVGcm9tQ29udGV4dCA9IHVzZU1vdXNlTGVhdmVJdGVtRGlzcGF0Y2gob25Nb3VzZUxlYXZlRnJvbVByb3BzKTtcbiAgdmFyIG9uQ2xpY2tGcm9tQ29udGV4dCA9IHVzZU1vdXNlQ2xpY2tJdGVtRGlzcGF0Y2gob25JdGVtQ2xpY2tGcm9tUHJvcHMsIGFsbE90aGVyRnVubmVsUHJvcHMuZGF0YUtleSk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5GcmFnbWVudCwgbnVsbCwgdHJhcGV6b2lkcy5tYXAoKGVudHJ5LCBpKSA9PiB7XG4gICAgdmFyIGlzQWN0aXZlSW5kZXggPSBCb29sZWFuKGFjdGl2ZVNoYXBlKSAmJiBhY3RpdmVJdGVtSW5kZXggPT09IFN0cmluZyhpKTtcbiAgICB2YXIgdHJhcGV6b2lkT3B0aW9ucyA9IGlzQWN0aXZlSW5kZXggPyBhY3RpdmVTaGFwZSA6IHNoYXBlO1xuICAgIHZhciB0cmFwZXpvaWRQcm9wcyA9IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgZW50cnkpLCB7fSwge1xuICAgICAgb3B0aW9uOiB0cmFwZXpvaWRPcHRpb25zLFxuICAgICAgaXNBY3RpdmU6IGlzQWN0aXZlSW5kZXgsXG4gICAgICBzdHJva2U6IGVudHJ5LnN0cm9rZVxuICAgIH0pO1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwgX2V4dGVuZHMoe1xuICAgICAga2V5OiBcInRyYXBlem9pZC1cIi5jb25jYXQoZW50cnkgPT09IG51bGwgfHwgZW50cnkgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGVudHJ5LngsIFwiLVwiKS5jb25jYXQoZW50cnkgPT09IG51bGwgfHwgZW50cnkgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGVudHJ5LnksIFwiLVwiKS5jb25jYXQoZW50cnkgPT09IG51bGwgfHwgZW50cnkgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGVudHJ5Lm5hbWUsIFwiLVwiKS5jb25jYXQoZW50cnkgPT09IG51bGwgfHwgZW50cnkgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGVudHJ5LnZhbHVlKSxcbiAgICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1mdW5uZWwtdHJhcGV6b2lkXCJcbiAgICB9LCBhZGFwdEV2ZW50c09mQ2hpbGQocmVzdE9mQWxsT3RoZXJQcm9wcywgZW50cnksIGkpLCB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRoZSB0eXBlcyBuZWVkIGEgYml0IG9mIGF0dGVudGlvblxuICAgICAgb25Nb3VzZUVudGVyOiBvbk1vdXNlRW50ZXJGcm9tQ29udGV4dChlbnRyeSwgaSlcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdGhlIHR5cGVzIG5lZWQgYSBiaXQgb2YgYXR0ZW50aW9uXG4gICAgICAsXG4gICAgICBvbk1vdXNlTGVhdmU6IG9uTW91c2VMZWF2ZUZyb21Db250ZXh0KGVudHJ5LCBpKVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0aGUgdHlwZXMgbmVlZCBhIGJpdCBvZiBhdHRlbnRpb25cbiAgICAgICxcbiAgICAgIG9uQ2xpY2s6IG9uQ2xpY2tGcm9tQ29udGV4dChlbnRyeSwgaSlcbiAgICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoRnVubmVsVHJhcGV6b2lkLCB0cmFwZXpvaWRQcm9wcykpO1xuICB9KSk7XG59XG5mdW5jdGlvbiBUcmFwZXpvaWRzV2l0aEFuaW1hdGlvbihfcmVmMykge1xuICB2YXIge1xuICAgIHByZXZpb3VzVHJhcGV6b2lkc1JlZixcbiAgICBwcm9wc1xuICB9ID0gX3JlZjM7XG4gIHZhciB7XG4gICAgdHJhcGV6b2lkcyxcbiAgICBpc0FuaW1hdGlvbkFjdGl2ZSxcbiAgICBhbmltYXRpb25CZWdpbixcbiAgICBhbmltYXRpb25EdXJhdGlvbixcbiAgICBhbmltYXRpb25FYXNpbmcsXG4gICAgb25BbmltYXRpb25FbmQsXG4gICAgb25BbmltYXRpb25TdGFydFxuICB9ID0gcHJvcHM7XG4gIHZhciBwcmV2VHJhcGV6b2lkcyA9IHByZXZpb3VzVHJhcGV6b2lkc1JlZi5jdXJyZW50O1xuICB2YXIgW2lzQW5pbWF0aW5nLCBzZXRJc0FuaW1hdGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIHZhciBzaG93TGFiZWxzID0gIWlzQW5pbWF0aW5nO1xuICB2YXIgYW5pbWF0aW9uSWQgPSB1c2VBbmltYXRpb25JZCh0cmFwZXpvaWRzLCAncmVjaGFydHMtZnVubmVsLScpO1xuICB2YXIgaGFuZGxlQW5pbWF0aW9uRW5kID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmICh0eXBlb2Ygb25BbmltYXRpb25FbmQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG9uQW5pbWF0aW9uRW5kKCk7XG4gICAgfVxuICAgIHNldElzQW5pbWF0aW5nKGZhbHNlKTtcbiAgfSwgW29uQW5pbWF0aW9uRW5kXSk7XG4gIHZhciBoYW5kbGVBbmltYXRpb25TdGFydCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAodHlwZW9mIG9uQW5pbWF0aW9uU3RhcnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG9uQW5pbWF0aW9uU3RhcnQoKTtcbiAgICB9XG4gICAgc2V0SXNBbmltYXRpbmcodHJ1ZSk7XG4gIH0sIFtvbkFuaW1hdGlvblN0YXJ0XSk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChGdW5uZWxMYWJlbExpc3RQcm92aWRlciwge1xuICAgIHNob3dMYWJlbHM6IHNob3dMYWJlbHMsXG4gICAgdHJhcGV6b2lkczogdHJhcGV6b2lkc1xuICB9LCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChKYXZhc2NyaXB0QW5pbWF0ZSwge1xuICAgIGFuaW1hdGlvbklkOiBhbmltYXRpb25JZCxcbiAgICBiZWdpbjogYW5pbWF0aW9uQmVnaW4sXG4gICAgZHVyYXRpb246IGFuaW1hdGlvbkR1cmF0aW9uLFxuICAgIGlzQWN0aXZlOiBpc0FuaW1hdGlvbkFjdGl2ZSxcbiAgICBlYXNpbmc6IGFuaW1hdGlvbkVhc2luZyxcbiAgICBrZXk6IGFuaW1hdGlvbklkLFxuICAgIG9uQW5pbWF0aW9uU3RhcnQ6IGhhbmRsZUFuaW1hdGlvblN0YXJ0LFxuICAgIG9uQW5pbWF0aW9uRW5kOiBoYW5kbGVBbmltYXRpb25FbmRcbiAgfSwgdCA9PiB7XG4gICAgdmFyIHN0ZXBEYXRhID0gdCA9PT0gMSA/IHRyYXBlem9pZHMgOiB0cmFwZXpvaWRzLm1hcCgoZW50cnksIGluZGV4KSA9PiB7XG4gICAgICB2YXIgcHJldiA9IHByZXZUcmFwZXpvaWRzICYmIHByZXZUcmFwZXpvaWRzW2luZGV4XTtcbiAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGVudHJ5KSwge30sIHtcbiAgICAgICAgICB4OiBpbnRlcnBvbGF0ZShwcmV2LngsIGVudHJ5LngsIHQpLFxuICAgICAgICAgIHk6IGludGVycG9sYXRlKHByZXYueSwgZW50cnkueSwgdCksXG4gICAgICAgICAgdXBwZXJXaWR0aDogaW50ZXJwb2xhdGUocHJldi51cHBlcldpZHRoLCBlbnRyeS51cHBlcldpZHRoLCB0KSxcbiAgICAgICAgICBsb3dlcldpZHRoOiBpbnRlcnBvbGF0ZShwcmV2Lmxvd2VyV2lkdGgsIGVudHJ5Lmxvd2VyV2lkdGgsIHQpLFxuICAgICAgICAgIGhlaWdodDogaW50ZXJwb2xhdGUocHJldi5oZWlnaHQsIGVudHJ5LmhlaWdodCwgdClcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBlbnRyeSksIHt9LCB7XG4gICAgICAgIHg6IGludGVycG9sYXRlKGVudHJ5LnggKyBlbnRyeS51cHBlcldpZHRoIC8gMiwgZW50cnkueCwgdCksXG4gICAgICAgIHk6IGludGVycG9sYXRlKGVudHJ5LnkgKyBlbnRyeS5oZWlnaHQgLyAyLCBlbnRyeS55LCB0KSxcbiAgICAgICAgdXBwZXJXaWR0aDogaW50ZXJwb2xhdGUoMCwgZW50cnkudXBwZXJXaWR0aCwgdCksXG4gICAgICAgIGxvd2VyV2lkdGg6IGludGVycG9sYXRlKDAsIGVudHJ5Lmxvd2VyV2lkdGgsIHQpLFxuICAgICAgICBoZWlnaHQ6IGludGVycG9sYXRlKDAsIGVudHJ5LmhlaWdodCwgdClcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmICh0ID4gMCkge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgICBwcmV2aW91c1RyYXBlem9pZHNSZWYuY3VycmVudCA9IHN0ZXBEYXRhO1xuICAgIH1cbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGF5ZXIsIG51bGwsIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEZ1bm5lbFRyYXBlem9pZHMsIHtcbiAgICAgIHRyYXBlem9pZHM6IHN0ZXBEYXRhLFxuICAgICAgYWxsT3RoZXJGdW5uZWxQcm9wczogcHJvcHNcbiAgICB9KSk7XG4gIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYWJlbExpc3RGcm9tTGFiZWxQcm9wLCB7XG4gICAgbGFiZWw6IHByb3BzLmxhYmVsXG4gIH0pLCBwcm9wcy5jaGlsZHJlbik7XG59XG5mdW5jdGlvbiBSZW5kZXJUcmFwZXpvaWRzKHByb3BzKSB7XG4gIHZhciBwcmV2aW91c1RyYXBlem9pZHNSZWYgPSB1c2VSZWYodW5kZWZpbmVkKTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFRyYXBlem9pZHNXaXRoQW5pbWF0aW9uLCB7XG4gICAgcHJvcHM6IHByb3BzLFxuICAgIHByZXZpb3VzVHJhcGV6b2lkc1JlZjogcHJldmlvdXNUcmFwZXpvaWRzUmVmXG4gIH0pO1xufVxudmFyIGdldFJlYWxXaWR0aEhlaWdodCA9IChjdXN0b21XaWR0aCwgb2Zmc2V0KSA9PiB7XG4gIHZhciB7XG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIGxlZnQsXG4gICAgcmlnaHQsXG4gICAgdG9wLFxuICAgIGJvdHRvbVxuICB9ID0gb2Zmc2V0O1xuICB2YXIgcmVhbEhlaWdodCA9IGhlaWdodDtcbiAgdmFyIHJlYWxXaWR0aCA9IHdpZHRoO1xuICBpZiAoaXNOdW1iZXIoY3VzdG9tV2lkdGgpKSB7XG4gICAgcmVhbFdpZHRoID0gY3VzdG9tV2lkdGg7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGN1c3RvbVdpZHRoID09PSAnc3RyaW5nJykge1xuICAgIHJlYWxXaWR0aCA9IHJlYWxXaWR0aCAqIHBhcnNlRmxvYXQoY3VzdG9tV2lkdGgpIC8gMTAwO1xuICB9XG4gIHJldHVybiB7XG4gICAgcmVhbFdpZHRoOiByZWFsV2lkdGggLSBsZWZ0IC0gcmlnaHQgLSA1MCxcbiAgICByZWFsSGVpZ2h0OiByZWFsSGVpZ2h0IC0gYm90dG9tIC0gdG9wLFxuICAgIG9mZnNldFg6ICh3aWR0aCAtIHJlYWxXaWR0aCkgLyAyLFxuICAgIG9mZnNldFk6IChoZWlnaHQgLSByZWFsSGVpZ2h0KSAvIDJcbiAgfTtcbn07XG5leHBvcnQgY2xhc3MgRnVubmVsV2l0aFN0YXRlIGV4dGVuZHMgUHVyZUNvbXBvbmVudCB7XG4gIHJlbmRlcigpIHtcbiAgICB2YXIge1xuICAgICAgY2xhc3NOYW1lXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgdmFyIGxheWVyQ2xhc3MgPSBjbHN4KCdyZWNoYXJ0cy10cmFwZXpvaWRzJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGF5ZXIsIHtcbiAgICAgIGNsYXNzTmFtZTogbGF5ZXJDbGFzc1xuICAgIH0sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlbmRlclRyYXBlem9pZHMsIHRoaXMucHJvcHMpKTtcbiAgfVxufVxudmFyIGRlZmF1bHRGdW5uZWxQcm9wcyA9IHtcbiAgc3Ryb2tlOiAnI2ZmZicsXG4gIGZpbGw6ICcjODA4MDgwJyxcbiAgbGVnZW5kVHlwZTogJ3JlY3QnLFxuICBoaWRlOiBmYWxzZSxcbiAgaXNBbmltYXRpb25BY3RpdmU6ICFHbG9iYWwuaXNTc3IsXG4gIGFuaW1hdGlvbkJlZ2luOiA0MDAsXG4gIGFuaW1hdGlvbkR1cmF0aW9uOiAxNTAwLFxuICBhbmltYXRpb25FYXNpbmc6ICdlYXNlJyxcbiAgbmFtZUtleTogJ25hbWUnLFxuICBsYXN0U2hhcGVUeXBlOiAndHJpYW5nbGUnXG59O1xuZnVuY3Rpb24gRnVubmVsSW1wbChwcm9wcykge1xuICB2YXIgcGxvdEFyZWEgPSB1c2VQbG90QXJlYSgpO1xuICB2YXIgX3Jlc29sdmVEZWZhdWx0UHJvcHMgPSByZXNvbHZlRGVmYXVsdFByb3BzKHByb3BzLCBkZWZhdWx0RnVubmVsUHJvcHMpLFxuICAgIHtcbiAgICAgIHN0cm9rZSxcbiAgICAgIGZpbGwsXG4gICAgICBsZWdlbmRUeXBlLFxuICAgICAgaGlkZSxcbiAgICAgIGlzQW5pbWF0aW9uQWN0aXZlLFxuICAgICAgYW5pbWF0aW9uQmVnaW4sXG4gICAgICBhbmltYXRpb25EdXJhdGlvbixcbiAgICAgIGFuaW1hdGlvbkVhc2luZyxcbiAgICAgIG5hbWVLZXksXG4gICAgICBsYXN0U2hhcGVUeXBlXG4gICAgfSA9IF9yZXNvbHZlRGVmYXVsdFByb3BzLFxuICAgIGV2ZXJ5dGhpbmdFbHNlID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKF9yZXNvbHZlRGVmYXVsdFByb3BzLCBfZXhjbHVkZWQyKTtcbiAgdmFyIHByZXNlbnRhdGlvblByb3BzID0gc3ZnUHJvcGVydGllc05vRXZlbnRzKHByb3BzKTtcbiAgdmFyIGNlbGxzID0gZmluZEFsbEJ5VHlwZShwcm9wcy5jaGlsZHJlbiwgQ2VsbCk7XG4gIHZhciBmdW5uZWxTZXR0aW5ncyA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICBkYXRhS2V5OiBwcm9wcy5kYXRhS2V5LFxuICAgIG5hbWVLZXksXG4gICAgZGF0YTogcHJvcHMuZGF0YSxcbiAgICB0b29sdGlwVHlwZTogcHJvcHMudG9vbHRpcFR5cGUsXG4gICAgbGFzdFNoYXBlVHlwZSxcbiAgICByZXZlcnNlZDogcHJvcHMucmV2ZXJzZWQsXG4gICAgY3VzdG9tV2lkdGg6IHByb3BzLndpZHRoLFxuICAgIGNlbGxzLFxuICAgIHByZXNlbnRhdGlvblByb3BzXG4gIH0pLCBbcHJvcHMuZGF0YUtleSwgbmFtZUtleSwgcHJvcHMuZGF0YSwgcHJvcHMudG9vbHRpcFR5cGUsIGxhc3RTaGFwZVR5cGUsIHByb3BzLnJldmVyc2VkLCBwcm9wcy53aWR0aCwgY2VsbHMsIHByZXNlbnRhdGlvblByb3BzXSk7XG4gIHZhciB0cmFwZXpvaWRzID0gdXNlQXBwU2VsZWN0b3Ioc3RhdGUgPT4gc2VsZWN0RnVubmVsVHJhcGV6b2lkcyhzdGF0ZSwgZnVubmVsU2V0dGluZ3MpKTtcbiAgaWYgKGhpZGUgfHwgIXRyYXBlem9pZHMgfHwgIXRyYXBlem9pZHMubGVuZ3RoIHx8ICFwbG90QXJlYSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciB7XG4gICAgaGVpZ2h0LFxuICAgIHdpZHRoXG4gIH0gPSBwbG90QXJlYTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkZyYWdtZW50LCBudWxsLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTZXRUb29sdGlwRW50cnlTZXR0aW5ncywge1xuICAgIGZuOiBnZXRUb29sdGlwRW50cnlTZXR0aW5ncyxcbiAgICBhcmdzOiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIHByb3BzKSwge30sIHtcbiAgICAgIHRyYXBlem9pZHNcbiAgICB9KVxuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoRnVubmVsV2l0aFN0YXRlLCBfZXh0ZW5kcyh7fSwgZXZlcnl0aGluZ0Vsc2UsIHtcbiAgICBzdHJva2U6IHN0cm9rZSxcbiAgICBmaWxsOiBmaWxsLFxuICAgIG5hbWVLZXk6IG5hbWVLZXksXG4gICAgbGFzdFNoYXBlVHlwZTogbGFzdFNoYXBlVHlwZSxcbiAgICBhbmltYXRpb25CZWdpbjogYW5pbWF0aW9uQmVnaW4sXG4gICAgYW5pbWF0aW9uRHVyYXRpb246IGFuaW1hdGlvbkR1cmF0aW9uLFxuICAgIGFuaW1hdGlvbkVhc2luZzogYW5pbWF0aW9uRWFzaW5nLFxuICAgIGlzQW5pbWF0aW9uQWN0aXZlOiBpc0FuaW1hdGlvbkFjdGl2ZSxcbiAgICBoaWRlOiBoaWRlLFxuICAgIGxlZ2VuZFR5cGU6IGxlZ2VuZFR5cGUsXG4gICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgd2lkdGg6IHdpZHRoLFxuICAgIHRyYXBlem9pZHM6IHRyYXBlem9pZHNcbiAgfSkpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlRnVubmVsVHJhcGV6b2lkcyhfcmVmNCkge1xuICB2YXIge1xuICAgIGRhdGFLZXksXG4gICAgbmFtZUtleSxcbiAgICBkaXNwbGF5ZWREYXRhLFxuICAgIHRvb2x0aXBUeXBlLFxuICAgIGxhc3RTaGFwZVR5cGUsXG4gICAgcmV2ZXJzZWQsXG4gICAgb2Zmc2V0LFxuICAgIGN1c3RvbVdpZHRoXG4gIH0gPSBfcmVmNDtcbiAgdmFyIHtcbiAgICBsZWZ0LFxuICAgIHRvcFxuICB9ID0gb2Zmc2V0O1xuICB2YXIge1xuICAgIHJlYWxIZWlnaHQsXG4gICAgcmVhbFdpZHRoLFxuICAgIG9mZnNldFgsXG4gICAgb2Zmc2V0WVxuICB9ID0gZ2V0UmVhbFdpZHRoSGVpZ2h0KGN1c3RvbVdpZHRoLCBvZmZzZXQpO1xuICB2YXIgbWF4VmFsdWUgPSBNYXRoLm1heC5hcHBseShudWxsLCBkaXNwbGF5ZWREYXRhLm1hcChlbnRyeSA9PiBnZXRWYWx1ZUJ5RGF0YUtleShlbnRyeSwgZGF0YUtleSwgMCkpKTtcbiAgdmFyIGxlbiA9IGRpc3BsYXllZERhdGEubGVuZ3RoO1xuICB2YXIgcm93SGVpZ2h0ID0gcmVhbEhlaWdodCAvIGxlbjtcbiAgdmFyIHBhcmVudFZpZXdCb3ggPSB7XG4gICAgeDogb2Zmc2V0LmxlZnQsXG4gICAgeTogb2Zmc2V0LnRvcCxcbiAgICB3aWR0aDogb2Zmc2V0LndpZHRoLFxuICAgIGhlaWdodDogb2Zmc2V0LmhlaWdodFxuICB9O1xuICB2YXIgdHJhcGV6b2lkcyA9IGRpc3BsYXllZERhdGEubWFwKChlbnRyeSwgaSkgPT4ge1xuICAgIHZhciByYXdWYWwgPSBnZXRWYWx1ZUJ5RGF0YUtleShlbnRyeSwgZGF0YUtleSwgMCk7XG4gICAgdmFyIG5hbWUgPSBnZXRWYWx1ZUJ5RGF0YUtleShlbnRyeSwgbmFtZUtleSwgaSk7XG4gICAgdmFyIHZhbCA9IHJhd1ZhbDtcbiAgICB2YXIgbmV4dFZhbDtcbiAgICBpZiAoaSAhPT0gbGVuIC0gMSkge1xuICAgICAgbmV4dFZhbCA9IGdldFZhbHVlQnlEYXRhS2V5KGRpc3BsYXllZERhdGFbaSArIDFdLCBkYXRhS2V5LCAwKTtcbiAgICAgIGlmIChuZXh0VmFsIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgW25leHRWYWxdID0gbmV4dFZhbDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHJhd1ZhbCBpbnN0YW5jZW9mIEFycmF5ICYmIHJhd1ZhbC5sZW5ndGggPT09IDIpIHtcbiAgICAgIFt2YWwsIG5leHRWYWxdID0gcmF3VmFsO1xuICAgIH0gZWxzZSBpZiAobGFzdFNoYXBlVHlwZSA9PT0gJ3JlY3RhbmdsZScpIHtcbiAgICAgIG5leHRWYWwgPSB2YWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHRWYWwgPSAwO1xuICAgIH1cblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgZ2V0VmFsdWVCeURhdGFLZXkgZG9lcyBub3QgdmFsaWRhdGUgdGhlIG91dHB1dCB0eXBlXG4gICAgdmFyIHggPSAobWF4VmFsdWUgLSB2YWwpICogcmVhbFdpZHRoIC8gKDIgKiBtYXhWYWx1ZSkgKyB0b3AgKyAyNSArIG9mZnNldFg7XG4gICAgdmFyIHkgPSByb3dIZWlnaHQgKiBpICsgbGVmdCArIG9mZnNldFk7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBnZXRWYWx1ZUJ5RGF0YUtleSBkb2VzIG5vdCB2YWxpZGF0ZSB0aGUgb3V0cHV0IHR5cGVcbiAgICB2YXIgdXBwZXJXaWR0aCA9IHZhbCAvIG1heFZhbHVlICogcmVhbFdpZHRoO1xuICAgIHZhciBsb3dlcldpZHRoID0gbmV4dFZhbCAvIG1heFZhbHVlICogcmVhbFdpZHRoO1xuICAgIHZhciB0b29sdGlwUGF5bG9hZCA9IFt7XG4gICAgICBuYW1lLFxuICAgICAgdmFsdWU6IHZhbCxcbiAgICAgIHBheWxvYWQ6IGVudHJ5LFxuICAgICAgZGF0YUtleSxcbiAgICAgIHR5cGU6IHRvb2x0aXBUeXBlXG4gICAgfV07XG4gICAgdmFyIHRvb2x0aXBQb3NpdGlvbiA9IHtcbiAgICAgIHg6IHggKyB1cHBlcldpZHRoIC8gMixcbiAgICAgIHk6IHkgKyByb3dIZWlnaHQgLyAyXG4gICAgfTtcbiAgICByZXR1cm4gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHtcbiAgICAgIHgsXG4gICAgICB5LFxuICAgICAgd2lkdGg6IE1hdGgubWF4KHVwcGVyV2lkdGgsIGxvd2VyV2lkdGgpLFxuICAgICAgdXBwZXJXaWR0aCxcbiAgICAgIGxvd2VyV2lkdGgsXG4gICAgICBoZWlnaHQ6IHJvd0hlaWdodCxcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgZ2V0VmFsdWVCeURhdGFLZXkgZG9lcyBub3QgdmFsaWRhdGUgdGhlIG91dHB1dCB0eXBlXG4gICAgICBuYW1lLFxuICAgICAgdmFsLFxuICAgICAgdG9vbHRpcFBheWxvYWQsXG4gICAgICB0b29sdGlwUG9zaXRpb25cbiAgICB9LCBvbWl0KGVudHJ5LCBbJ3dpZHRoJ10pKSwge30sIHtcbiAgICAgIHBheWxvYWQ6IGVudHJ5LFxuICAgICAgcGFyZW50Vmlld0JveCxcbiAgICAgIGxhYmVsVmlld0JveDoge1xuICAgICAgICB4OiB4ICsgKHVwcGVyV2lkdGggLSBsb3dlcldpZHRoKSAvIDQsXG4gICAgICAgIHksXG4gICAgICAgIHdpZHRoOiBNYXRoLmFicyh1cHBlcldpZHRoIC0gbG93ZXJXaWR0aCkgLyAyICsgTWF0aC5taW4odXBwZXJXaWR0aCwgbG93ZXJXaWR0aCksXG4gICAgICAgIGhlaWdodDogcm93SGVpZ2h0XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuICBpZiAocmV2ZXJzZWQpIHtcbiAgICB0cmFwZXpvaWRzID0gdHJhcGV6b2lkcy5tYXAoKGVudHJ5LCBpbmRleCkgPT4ge1xuICAgICAgdmFyIG5ld1kgPSBlbnRyeS55IC0gaW5kZXggKiByb3dIZWlnaHQgKyAobGVuIC0gMSAtIGluZGV4KSAqIHJvd0hlaWdodDtcbiAgICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGVudHJ5KSwge30sIHtcbiAgICAgICAgdXBwZXJXaWR0aDogZW50cnkubG93ZXJXaWR0aCxcbiAgICAgICAgbG93ZXJXaWR0aDogZW50cnkudXBwZXJXaWR0aCxcbiAgICAgICAgeDogZW50cnkueCAtIChlbnRyeS5sb3dlcldpZHRoIC0gZW50cnkudXBwZXJXaWR0aCkgLyAyLFxuICAgICAgICB5OiBlbnRyeS55IC0gaW5kZXggKiByb3dIZWlnaHQgKyAobGVuIC0gMSAtIGluZGV4KSAqIHJvd0hlaWdodCxcbiAgICAgICAgdG9vbHRpcFBvc2l0aW9uOiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGVudHJ5LnRvb2x0aXBQb3NpdGlvbiksIHt9LCB7XG4gICAgICAgICAgeTogbmV3WSArIHJvd0hlaWdodCAvIDJcbiAgICAgICAgfSksXG4gICAgICAgIGxhYmVsVmlld0JveDogX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBlbnRyeS5sYWJlbFZpZXdCb3gpLCB7fSwge1xuICAgICAgICAgIHk6IG5ld1lcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiB0cmFwZXpvaWRzO1xufVxuZXhwb3J0IGNsYXNzIEZ1bm5lbCBleHRlbmRzIFB1cmVDb21wb25lbnQge1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEZ1bm5lbEltcGwsIHRoaXMucHJvcHMpO1xuICB9XG59XG5fZGVmaW5lUHJvcGVydHkoRnVubmVsLCBcImRpc3BsYXlOYW1lXCIsICdGdW5uZWwnKTtcbl9kZWZpbmVQcm9wZXJ0eShGdW5uZWwsIFwiZGVmYXVsdFByb3BzXCIsIGRlZmF1bHRGdW5uZWxQcm9wcyk7IiwiaW1wb3J0IHt1c2VTdGF0ZSBhcyAkM3dodE0kdXNlU3RhdGUsIHVzZVJlZiBhcyAkM3dodE0kdXNlUmVmLCB1c2VFZmZlY3QgYXMgJDN3aHRNJHVzZUVmZmVjdCwgdXNlQ2FsbGJhY2sgYXMgJDN3aHRNJHVzZUNhbGxiYWNrfSBmcm9tIFwicmVhY3RcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIwIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuZnVuY3Rpb24gJDQ1OGIwYTU1MzZjMWE3Y2YkZXhwb3J0JDQwYmZhOGM3YjA4MzI3MTUodmFsdWUsIGRlZmF1bHRWYWx1ZSwgb25DaGFuZ2UpIHtcbiAgICBsZXQgW3N0YXRlVmFsdWUsIHNldFN0YXRlVmFsdWVdID0gKDAsICQzd2h0TSR1c2VTdGF0ZSkodmFsdWUgfHwgZGVmYXVsdFZhbHVlKTtcbiAgICBsZXQgaXNDb250cm9sbGVkUmVmID0gKDAsICQzd2h0TSR1c2VSZWYpKHZhbHVlICE9PSB1bmRlZmluZWQpO1xuICAgIGxldCBpc0NvbnRyb2xsZWQgPSB2YWx1ZSAhPT0gdW5kZWZpbmVkO1xuICAgICgwLCAkM3dodE0kdXNlRWZmZWN0KSgoKT0+e1xuICAgICAgICBsZXQgd2FzQ29udHJvbGxlZCA9IGlzQ29udHJvbGxlZFJlZi5jdXJyZW50O1xuICAgICAgICBpZiAod2FzQ29udHJvbGxlZCAhPT0gaXNDb250cm9sbGVkICYmIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUud2FybihgV0FSTjogQSBjb21wb25lbnQgY2hhbmdlZCBmcm9tICR7d2FzQ29udHJvbGxlZCA/ICdjb250cm9sbGVkJyA6ICd1bmNvbnRyb2xsZWQnfSB0byAke2lzQ29udHJvbGxlZCA/ICdjb250cm9sbGVkJyA6ICd1bmNvbnRyb2xsZWQnfS5gKTtcbiAgICAgICAgaXNDb250cm9sbGVkUmVmLmN1cnJlbnQgPSBpc0NvbnRyb2xsZWQ7XG4gICAgfSwgW1xuICAgICAgICBpc0NvbnRyb2xsZWRcbiAgICBdKTtcbiAgICBsZXQgY3VycmVudFZhbHVlID0gaXNDb250cm9sbGVkID8gdmFsdWUgOiBzdGF0ZVZhbHVlO1xuICAgIGxldCBzZXRWYWx1ZSA9ICgwLCAkM3dodE0kdXNlQ2FsbGJhY2spKCh2YWx1ZSwgLi4uYXJncyk9PntcbiAgICAgICAgbGV0IG9uQ2hhbmdlQ2FsbGVyID0gKHZhbHVlLCAuLi5vbkNoYW5nZUFyZ3MpPT57XG4gICAgICAgICAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoIU9iamVjdC5pcyhjdXJyZW50VmFsdWUsIHZhbHVlKSkgb25DaGFuZ2UodmFsdWUsIC4uLm9uQ2hhbmdlQXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzQ29udHJvbGxlZCkgLy8gSWYgdW5jb250cm9sbGVkLCBtdXRhdGUgdGhlIGN1cnJlbnRWYWx1ZSBsb2NhbCB2YXJpYWJsZSBzbyB0aGF0XG4gICAgICAgICAgICAvLyBjYWxsaW5nIHNldFN0YXRlIG11bHRpcGxlIHRpbWVzIHdpdGggdGhlIHNhbWUgdmFsdWUgb25seSBlbWl0cyBvbkNoYW5nZSBvbmNlLlxuICAgICAgICAgICAgLy8gV2UgZG8gbm90IHVzZSBhIHJlZiBmb3IgdGhpcyBiZWNhdXNlIHdlIHNwZWNpZmljYWxseSBfZG9fIHdhbnQgdGhlIHZhbHVlIHRvXG4gICAgICAgICAgICAvLyByZXNldCBldmVyeSByZW5kZXIsIGFuZCBhc3NpZ25pbmcgdG8gYSByZWYgaW4gcmVuZGVyIGJyZWFrcyBhYm9ydGVkIHN1c3BlbmRlZCByZW5kZXJzLlxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICAgICAgICAgICAgY3VycmVudFZhbHVlID0gdmFsdWU7XG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLndhcm4oJ1dlIGNhbiBub3Qgc3VwcG9ydCBhIGZ1bmN0aW9uIGNhbGxiYWNrLiBTZWUgR2l0aHViIElzc3VlcyBmb3IgZGV0YWlscyBodHRwczovL2dpdGh1Yi5jb20vYWRvYmUvcmVhY3Qtc3BlY3RydW0vaXNzdWVzLzIzMjAnKTtcbiAgICAgICAgICAgIC8vIHRoaXMgc3VwcG9ydHMgZnVuY3Rpb25hbCB1cGRhdGVzIGh0dHBzOi8vcmVhY3Rqcy5vcmcvZG9jcy9ob29rcy1yZWZlcmVuY2UuaHRtbCNmdW5jdGlvbmFsLXVwZGF0ZXNcbiAgICAgICAgICAgIC8vIHdoZW4gc29tZW9uZSB1c2luZyB1c2VDb250cm9sbGVkU3RhdGUgY2FsbHMgc2V0Q29udHJvbGxlZFN0YXRlKG15RnVuYylcbiAgICAgICAgICAgIC8vIHRoaXMgd2lsbCBjYWxsIG91ciB1c2VTdGF0ZSBzZXRTdGF0ZSB3aXRoIGEgZnVuY3Rpb24gYXMgd2VsbCB3aGljaCBpbnZva2VzIG15RnVuYyBhbmQgY2FsbHMgb25DaGFuZ2Ugd2l0aCB0aGUgdmFsdWUgZnJvbSBteUZ1bmNcbiAgICAgICAgICAgIC8vIGlmIHdlJ3JlIGluIGFuIHVuY29udHJvbGxlZCBzdGF0ZSwgdGhlbiB3ZSBhbHNvIHJldHVybiB0aGUgdmFsdWUgb2YgbXlGdW5jIHdoaWNoIHRvIHNldFN0YXRlIGxvb2tzIGFzIHRob3VnaCBpdCB3YXMganVzdCBjYWxsZWQgd2l0aCBteUZ1bmMgZnJvbSB0aGUgYmVnaW5uaW5nXG4gICAgICAgICAgICAvLyBvdGhlcndpc2Ugd2UganVzdCByZXR1cm4gdGhlIGNvbnRyb2xsZWQgdmFsdWUsIHdoaWNoIHdvbid0IGNhdXNlIGEgcmVyZW5kZXIgYmVjYXVzZSBSZWFjdCBrbm93cyB0byBiYWlsIG91dCB3aGVuIHRoZSB2YWx1ZSBpcyB0aGUgc2FtZVxuICAgICAgICAgICAgbGV0IHVwZGF0ZUZ1bmN0aW9uID0gKG9sZFZhbHVlLCAuLi5mdW5jdGlvbkFyZ3MpPT57XG4gICAgICAgICAgICAgICAgbGV0IGludGVyY2VwdGVkVmFsdWUgPSB2YWx1ZShpc0NvbnRyb2xsZWQgPyBjdXJyZW50VmFsdWUgOiBvbGRWYWx1ZSwgLi4uZnVuY3Rpb25BcmdzKTtcbiAgICAgICAgICAgICAgICBvbkNoYW5nZUNhbGxlcihpbnRlcmNlcHRlZFZhbHVlLCAuLi5hcmdzKTtcbiAgICAgICAgICAgICAgICBpZiAoIWlzQ29udHJvbGxlZCkgcmV0dXJuIGludGVyY2VwdGVkVmFsdWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9sZFZhbHVlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHNldFN0YXRlVmFsdWUodXBkYXRlRnVuY3Rpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCFpc0NvbnRyb2xsZWQpIHNldFN0YXRlVmFsdWUodmFsdWUpO1xuICAgICAgICAgICAgb25DaGFuZ2VDYWxsZXIodmFsdWUsIC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgfSwgW1xuICAgICAgICBpc0NvbnRyb2xsZWQsXG4gICAgICAgIGN1cnJlbnRWYWx1ZSxcbiAgICAgICAgb25DaGFuZ2VcbiAgICBdKTtcbiAgICByZXR1cm4gW1xuICAgICAgICBjdXJyZW50VmFsdWUsXG4gICAgICAgIHNldFZhbHVlXG4gICAgXTtcbn1cblxuXG5leHBvcnQgeyQ0NThiMGE1NTM2YzFhN2NmJGV4cG9ydCQ0MGJmYThjN2IwODMyNzE1IGFzIHVzZUNvbnRyb2xsZWRTdGF0ZX07XG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VDb250cm9sbGVkU3RhdGUubW9kdWxlLmpzLm1hcFxuIiwiLypcbiAqIENvcHlyaWdodCAyMDIwIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIC8qKlxuICogVGFrZXMgYSB2YWx1ZSBhbmQgZm9yY2VzIGl0IHRvIHRoZSBjbG9zZXN0IG1pbi9tYXggaWYgaXQncyBvdXRzaWRlLiBBbHNvIGZvcmNlcyBpdCB0byB0aGUgY2xvc2VzdCB2YWxpZCBzdGVwLlxuICovIGZ1bmN0aW9uICQ5NDQ2Y2NhOWEzODc1MTQ2JGV4cG9ydCQ3ZDE1YjY0Y2Y1YTNhNGM0KHZhbHVlLCBtaW4gPSAtSW5maW5pdHksIG1heCA9IEluZmluaXR5KSB7XG4gICAgbGV0IG5ld1ZhbHVlID0gTWF0aC5taW4oTWF0aC5tYXgodmFsdWUsIG1pbiksIG1heCk7XG4gICAgcmV0dXJuIG5ld1ZhbHVlO1xufVxuZnVuY3Rpb24gJDk0NDZjY2E5YTM4NzUxNDYkZXhwb3J0JGUxYTdiOGU2OWVmNmM1MmYodmFsdWUsIHN0ZXApIHtcbiAgICBsZXQgcm91bmRlZFZhbHVlID0gdmFsdWU7XG4gICAgbGV0IHByZWNpc2lvbiA9IDA7XG4gICAgbGV0IHN0ZXBTdHJpbmcgPSBzdGVwLnRvU3RyaW5nKCk7XG4gICAgLy8gSGFuZGxlIG5lZ2F0aXZlIGV4cG9uZW50cyBpbiBleHBvbmVudGlhbCBub3RhdGlvbiAoZS5nLiwgXCIxZS03XCIg4oaSIHByZWNpc2lvbiA4KVxuICAgIGxldCBlSW5kZXggPSBzdGVwU3RyaW5nLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignZS0nKTtcbiAgICBpZiAoZUluZGV4ID4gMCkgcHJlY2lzaW9uID0gTWF0aC5hYnMoTWF0aC5mbG9vcihNYXRoLmxvZzEwKE1hdGguYWJzKHN0ZXApKSkpICsgZUluZGV4O1xuICAgIGVsc2Uge1xuICAgICAgICBsZXQgcG9pbnRJbmRleCA9IHN0ZXBTdHJpbmcuaW5kZXhPZignLicpO1xuICAgICAgICBpZiAocG9pbnRJbmRleCA+PSAwKSBwcmVjaXNpb24gPSBzdGVwU3RyaW5nLmxlbmd0aCAtIHBvaW50SW5kZXg7XG4gICAgfVxuICAgIGlmIChwcmVjaXNpb24gPiAwKSB7XG4gICAgICAgIGxldCBwb3cgPSBNYXRoLnBvdygxMCwgcHJlY2lzaW9uKTtcbiAgICAgICAgcm91bmRlZFZhbHVlID0gTWF0aC5yb3VuZChyb3VuZGVkVmFsdWUgKiBwb3cpIC8gcG93O1xuICAgIH1cbiAgICByZXR1cm4gcm91bmRlZFZhbHVlO1xufVxuZnVuY3Rpb24gJDk0NDZjY2E5YTM4NzUxNDYkZXhwb3J0JGNiNmUwYmI1MGJjMTk0NjModmFsdWUsIG1pbiwgbWF4LCBzdGVwKSB7XG4gICAgbWluID0gTnVtYmVyKG1pbik7XG4gICAgbWF4ID0gTnVtYmVyKG1heCk7XG4gICAgbGV0IHJlbWFpbmRlciA9ICh2YWx1ZSAtIChpc05hTihtaW4pID8gMCA6IG1pbikpICUgc3RlcDtcbiAgICBsZXQgc25hcHBlZFZhbHVlID0gJDk0NDZjY2E5YTM4NzUxNDYkZXhwb3J0JGUxYTdiOGU2OWVmNmM1MmYoTWF0aC5hYnMocmVtYWluZGVyKSAqIDIgPj0gc3RlcCA/IHZhbHVlICsgTWF0aC5zaWduKHJlbWFpbmRlcikgKiAoc3RlcCAtIE1hdGguYWJzKHJlbWFpbmRlcikpIDogdmFsdWUgLSByZW1haW5kZXIsIHN0ZXApO1xuICAgIGlmICghaXNOYU4obWluKSkge1xuICAgICAgICBpZiAoc25hcHBlZFZhbHVlIDwgbWluKSBzbmFwcGVkVmFsdWUgPSBtaW47XG4gICAgICAgIGVsc2UgaWYgKCFpc05hTihtYXgpICYmIHNuYXBwZWRWYWx1ZSA+IG1heCkgc25hcHBlZFZhbHVlID0gbWluICsgTWF0aC5mbG9vcigkOTQ0NmNjYTlhMzg3NTE0NiRleHBvcnQkZTFhN2I4ZTY5ZWY2YzUyZigobWF4IC0gbWluKSAvIHN0ZXAsIHN0ZXApKSAqIHN0ZXA7XG4gICAgfSBlbHNlIGlmICghaXNOYU4obWF4KSAmJiBzbmFwcGVkVmFsdWUgPiBtYXgpIHNuYXBwZWRWYWx1ZSA9IE1hdGguZmxvb3IoJDk0NDZjY2E5YTM4NzUxNDYkZXhwb3J0JGUxYTdiOGU2OWVmNmM1MmYobWF4IC8gc3RlcCwgc3RlcCkpICogc3RlcDtcbiAgICAvLyBjb3JyZWN0IGZsb2F0aW5nIHBvaW50IGJlaGF2aW9yIGJ5IHJvdW5kaW5nIHRvIHN0ZXAgcHJlY2lzaW9uXG4gICAgc25hcHBlZFZhbHVlID0gJDk0NDZjY2E5YTM4NzUxNDYkZXhwb3J0JGUxYTdiOGU2OWVmNmM1MmYoc25hcHBlZFZhbHVlLCBzdGVwKTtcbiAgICByZXR1cm4gc25hcHBlZFZhbHVlO1xufVxuZnVuY3Rpb24gJDk0NDZjY2E5YTM4NzUxNDYkZXhwb3J0JGI2MjY4NTU0ZmJhNDUxZih2YWx1ZSwgZGlnaXRzLCBiYXNlID0gMTApIHtcbiAgICBjb25zdCBwb3cgPSBNYXRoLnBvdyhiYXNlLCBkaWdpdHMpO1xuICAgIHJldHVybiBNYXRoLnJvdW5kKHZhbHVlICogcG93KSAvIHBvdztcbn1cblxuXG5leHBvcnQgeyQ5NDQ2Y2NhOWEzODc1MTQ2JGV4cG9ydCQ3ZDE1YjY0Y2Y1YTNhNGM0IGFzIGNsYW1wLCAkOTQ0NmNjYTlhMzg3NTE0NiRleHBvcnQkZTFhN2I4ZTY5ZWY2YzUyZiBhcyByb3VuZFRvU3RlcFByZWNpc2lvbiwgJDk0NDZjY2E5YTM4NzUxNDYkZXhwb3J0JGNiNmUwYmI1MGJjMTk0NjMgYXMgc25hcFZhbHVlVG9TdGVwLCAkOTQ0NmNjYTlhMzg3NTE0NiRleHBvcnQkYjYyNjg1NTRmYmE0NTFmIGFzIHRvRml4ZWROdW1iZXJ9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bnVtYmVyLm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCB7dXNlQ29udHJvbGxlZFN0YXRlIGFzICQ0NThiMGE1NTM2YzFhN2NmJGV4cG9ydCQ0MGJmYThjN2IwODMyNzE1fSBmcm9tIFwiLi91c2VDb250cm9sbGVkU3RhdGUubWpzXCI7XG5pbXBvcnQge2NsYW1wIGFzICQ5NDQ2Y2NhOWEzODc1MTQ2JGV4cG9ydCQ3ZDE1YjY0Y2Y1YTNhNGM0LCBzbmFwVmFsdWVUb1N0ZXAgYXMgJDk0NDZjY2E5YTM4NzUxNDYkZXhwb3J0JGNiNmUwYmI1MGJjMTk0NjMsIHRvRml4ZWROdW1iZXIgYXMgJDk0NDZjY2E5YTM4NzUxNDYkZXhwb3J0JGI2MjY4NTU0ZmJhNDUxZn0gZnJvbSBcIi4vbnVtYmVyLm1qc1wiO1xuXG4vKlxuICogQ29weXJpZ2h0IDIwMjAgQWRvYmUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGZpbGUgaXMgbGljZW5zZWQgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weVxuICogb2YgdGhlIExpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlclxuICogdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgUkVQUkVTRU5UQVRJT05TXG4gKiBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2VcbiAqIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi8gXG5cblxuXG5leHBvcnQgeyQ0NThiMGE1NTM2YzFhN2NmJGV4cG9ydCQ0MGJmYThjN2IwODMyNzE1IGFzIHVzZUNvbnRyb2xsZWRTdGF0ZSwgJDk0NDZjY2E5YTM4NzUxNDYkZXhwb3J0JDdkMTViNjRjZjVhM2E0YzQgYXMgY2xhbXAsICQ5NDQ2Y2NhOWEzODc1MTQ2JGV4cG9ydCRjYjZlMGJiNTBiYzE5NDYzIGFzIHNuYXBWYWx1ZVRvU3RlcCwgJDk0NDZjY2E5YTM4NzUxNDYkZXhwb3J0JGI2MjY4NTU0ZmJhNDUxZiBhcyB0b0ZpeGVkTnVtYmVyfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1vZHVsZS5qcy5tYXBcbiIsInZhciBfZXhjbHVkZWQgPSBbXCJkaXJlY3Rpb25cIiwgXCJ3aWR0aFwiLCBcImRhdGFLZXlcIiwgXCJpc0FuaW1hdGlvbkFjdGl2ZVwiLCBcImFuaW1hdGlvbkJlZ2luXCIsIFwiYW5pbWF0aW9uRHVyYXRpb25cIiwgXCJhbmltYXRpb25FYXNpbmdcIl07XG5mdW5jdGlvbiBfZXh0ZW5kcygpIHsgcmV0dXJuIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiA/IE9iamVjdC5hc3NpZ24uYmluZCgpIDogZnVuY3Rpb24gKG4pIHsgZm9yICh2YXIgZSA9IDE7IGUgPCBhcmd1bWVudHMubGVuZ3RoOyBlKyspIHsgdmFyIHQgPSBhcmd1bWVudHNbZV07IGZvciAodmFyIHIgaW4gdCkgKHt9KS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHQsIHIpICYmIChuW3JdID0gdFtyXSk7IH0gcmV0dXJuIG47IH0sIF9leHRlbmRzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7IH1cbmZ1bmN0aW9uIG93bktleXMoZSwgcikgeyB2YXIgdCA9IE9iamVjdC5rZXlzKGUpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IHIgJiYgKG8gPSBvLmZpbHRlcihmdW5jdGlvbiAocikgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihlLCByKS5lbnVtZXJhYmxlOyB9KSksIHQucHVzaC5hcHBseSh0LCBvKTsgfSByZXR1cm4gdDsgfVxuZnVuY3Rpb24gX29iamVjdFNwcmVhZChlKSB7IGZvciAodmFyIHIgPSAxOyByIDwgYXJndW1lbnRzLmxlbmd0aDsgcisrKSB7IHZhciB0ID0gbnVsbCAhPSBhcmd1bWVudHNbcl0gPyBhcmd1bWVudHNbcl0gOiB7fTsgciAlIDIgPyBvd25LZXlzKE9iamVjdCh0KSwgITApLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgX2RlZmluZVByb3BlcnR5KGUsIHIsIHRbcl0pOyB9KSA6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModCkpIDogb3duS2V5cyhPYmplY3QodCkpLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodCwgcikpOyB9KTsgfSByZXR1cm4gZTsgfVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KGUsIHIsIHQpIHsgcmV0dXJuIChyID0gX3RvUHJvcGVydHlLZXkocikpIGluIGUgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgeyB2YWx1ZTogdCwgZW51bWVyYWJsZTogITAsIGNvbmZpZ3VyYWJsZTogITAsIHdyaXRhYmxlOiAhMCB9KSA6IGVbcl0gPSB0LCBlOyB9XG5mdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleSh0KSB7IHZhciBpID0gX3RvUHJpbWl0aXZlKHQsIFwic3RyaW5nXCIpOyByZXR1cm4gXCJzeW1ib2xcIiA9PSB0eXBlb2YgaSA/IGkgOiBpICsgXCJcIjsgfVxuZnVuY3Rpb24gX3RvUHJpbWl0aXZlKHQsIHIpIHsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIHQgfHwgIXQpIHJldHVybiB0OyB2YXIgZSA9IHRbU3ltYm9sLnRvUHJpbWl0aXZlXTsgaWYgKHZvaWQgMCAhPT0gZSkgeyB2YXIgaSA9IGUuY2FsbCh0LCByIHx8IFwiZGVmYXVsdFwiKTsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIGkpIHJldHVybiBpOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7IH0gcmV0dXJuIChcInN0cmluZ1wiID09PSByID8gU3RyaW5nIDogTnVtYmVyKSh0KTsgfVxuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKGUsIHQpIHsgaWYgKG51bGwgPT0gZSkgcmV0dXJuIHt9OyB2YXIgbywgciwgaSA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKGUsIHQpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IGZvciAociA9IDA7IHIgPCBuLmxlbmd0aDsgcisrKSBvID0gbltyXSwgLTEgPT09IHQuaW5kZXhPZihvKSAmJiB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKGUsIG8pICYmIChpW29dID0gZVtvXSk7IH0gcmV0dXJuIGk7IH1cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKHIsIGUpIHsgaWYgKG51bGwgPT0gcikgcmV0dXJuIHt9OyB2YXIgdCA9IHt9OyBmb3IgKHZhciBuIGluIHIpIGlmICh7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHIsIG4pKSB7IGlmICgtMSAhPT0gZS5pbmRleE9mKG4pKSBjb250aW51ZTsgdFtuXSA9IHJbbl07IH0gcmV0dXJuIHQ7IH1cbi8qKlxuICogQGZpbGVPdmVydmlldyBSZW5kZXIgYSBncm91cCBvZiBlcnJvciBiYXJcbiAqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgTGF5ZXIgfSBmcm9tICcuLi9jb250YWluZXIvTGF5ZXInO1xuaW1wb3J0IHsgUmVwb3J0RXJyb3JCYXJTZXR0aW5ncywgdXNlRXJyb3JCYXJDb250ZXh0IH0gZnJvbSAnLi4vY29udGV4dC9FcnJvckJhckNvbnRleHQnO1xuaW1wb3J0IHsgdXNlWEF4aXMsIHVzZVlBeGlzIH0gZnJvbSAnLi4vaG9va3MnO1xuaW1wb3J0IHsgcmVzb2x2ZURlZmF1bHRQcm9wcyB9IGZyb20gJy4uL3V0aWwvcmVzb2x2ZURlZmF1bHRQcm9wcyc7XG5pbXBvcnQgeyBzdmdQcm9wZXJ0aWVzTm9FdmVudHMgfSBmcm9tICcuLi91dGlsL3N2Z1Byb3BlcnRpZXNOb0V2ZW50cyc7XG5pbXBvcnQgeyB1c2VDaGFydExheW91dCB9IGZyb20gJy4uL2NvbnRleHQvY2hhcnRMYXlvdXRDb250ZXh0JztcbmltcG9ydCB7IENTU1RyYW5zaXRpb25BbmltYXRlIH0gZnJvbSAnLi4vYW5pbWF0aW9uL0NTU1RyYW5zaXRpb25BbmltYXRlJztcblxuLyoqXG4gKiBTbyB1c3VhbGx5IHRoZSBkaXJlY3Rpb24gaXMgZGVjaWRlZCBieSB0aGUgY2hhcnQgbGF5b3V0LlxuICogSG9yaXpvbnRhbCBsYXlvdXQgbWVhbnMgZXJyb3IgYmFycyBhcmUgdmVydGljYWwgbWVhbnMgZGlyZWN0aW9uPXlcbiAqIFZlcnRpY2FsIGxheW91dCBtZWFucyBlcnJvciBiYXJzIGFyZSBob3Jpem9udGFsIG1lYW5zIGRpcmVjdGlvbj14XG4gKlxuICogRXhjZXB0ISBJbiBTY2F0dGVyIGNoYXJ0LCBlcnJvciBiYXJzIGNhbiBnbyBib3RoIHdheXMuXG4gKlxuICogU28gdGhpcyBwcm9wZXJ0eSBpcyBvbmx5IGV2ZXIgdXNlZCBpbiBTY2F0dGVyIGNoYXJ0LCBhbmQgaWdub3JlZCBlbHNld2hlcmUuXG4gKi9cblxuLyoqXG4gKiBFeHRlcm5hbCBFcnJvckJhciBwcm9wcywgdmlzaWJsZSBmb3IgdXNlcnMgb2YgdGhlIGxpYnJhcnlcbiAqL1xuXG4vKipcbiAqIFByb3BzIGFmdGVyIGRlZmF1bHRzLCBhbmQgcmVxdWlyZWQgcHJvcHMgaGF2ZSBiZWVuIGFwcGxpZWQuXG4gKi9cblxuZnVuY3Rpb24gRXJyb3JCYXJJbXBsKHByb3BzKSB7XG4gIHZhciB7XG4gICAgICBkaXJlY3Rpb24sXG4gICAgICB3aWR0aCxcbiAgICAgIGRhdGFLZXksXG4gICAgICBpc0FuaW1hdGlvbkFjdGl2ZSxcbiAgICAgIGFuaW1hdGlvbkJlZ2luLFxuICAgICAgYW5pbWF0aW9uRHVyYXRpb24sXG4gICAgICBhbmltYXRpb25FYXNpbmdcbiAgICB9ID0gcHJvcHMsXG4gICAgb3RoZXJzID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKHByb3BzLCBfZXhjbHVkZWQpO1xuICB2YXIgc3ZnUHJvcHMgPSBzdmdQcm9wZXJ0aWVzTm9FdmVudHMob3RoZXJzKTtcbiAgdmFyIHtcbiAgICBkYXRhLFxuICAgIGRhdGFQb2ludEZvcm1hdHRlcixcbiAgICB4QXhpc0lkLFxuICAgIHlBeGlzSWQsXG4gICAgZXJyb3JCYXJPZmZzZXQ6IG9mZnNldFxuICB9ID0gdXNlRXJyb3JCYXJDb250ZXh0KCk7XG4gIHZhciB4QXhpcyA9IHVzZVhBeGlzKHhBeGlzSWQpO1xuICB2YXIgeUF4aXMgPSB1c2VZQXhpcyh5QXhpc0lkKTtcbiAgaWYgKCh4QXhpcyA9PT0gbnVsbCB8fCB4QXhpcyA9PT0gdm9pZCAwID8gdm9pZCAwIDogeEF4aXMuc2NhbGUpID09IG51bGwgfHwgKHlBeGlzID09PSBudWxsIHx8IHlBeGlzID09PSB2b2lkIDAgPyB2b2lkIDAgOiB5QXhpcy5zY2FsZSkgPT0gbnVsbCB8fCBkYXRhID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIEVycm9yQmFyIHJlcXVpcmVzIHR5cGUgbnVtYmVyIFhBeGlzLCB3aHk/XG4gIGlmIChkaXJlY3Rpb24gPT09ICd4JyAmJiB4QXhpcy50eXBlICE9PSAnbnVtYmVyJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciBlcnJvckJhcnMgPSBkYXRhLm1hcChlbnRyeSA9PiB7XG4gICAgdmFyIHtcbiAgICAgIHgsXG4gICAgICB5LFxuICAgICAgdmFsdWUsXG4gICAgICBlcnJvclZhbFxuICAgIH0gPSBkYXRhUG9pbnRGb3JtYXR0ZXIoZW50cnksIGRhdGFLZXksIGRpcmVjdGlvbik7XG4gICAgaWYgKCFlcnJvclZhbCB8fCB4ID09IG51bGwgfHwgeSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIGxpbmVDb29yZGluYXRlcyA9IFtdO1xuICAgIHZhciBsb3dCb3VuZCwgaGlnaEJvdW5kO1xuICAgIGlmIChBcnJheS5pc0FycmF5KGVycm9yVmFsKSkge1xuICAgICAgW2xvd0JvdW5kLCBoaWdoQm91bmRdID0gZXJyb3JWYWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvd0JvdW5kID0gaGlnaEJvdW5kID0gZXJyb3JWYWw7XG4gICAgfVxuICAgIGlmIChkaXJlY3Rpb24gPT09ICd4Jykge1xuICAgICAgLy8gZXJyb3IgYmFyIGZvciBob3Jpem9udGFsIGNoYXJ0cywgdGhlIHkgaXMgZml4ZWQsIHggaXMgYSByYW5nZSB2YWx1ZVxuICAgICAgdmFyIHtcbiAgICAgICAgc2NhbGVcbiAgICAgIH0gPSB4QXhpcztcbiAgICAgIHZhciB5TWlkID0geSArIG9mZnNldDtcbiAgICAgIHZhciB5TWluID0geU1pZCArIHdpZHRoO1xuICAgICAgdmFyIHlNYXggPSB5TWlkIC0gd2lkdGg7XG4gICAgICB2YXIgeE1pbiA9IHNjYWxlKHZhbHVlIC0gbG93Qm91bmQpO1xuICAgICAgdmFyIHhNYXggPSBzY2FsZSh2YWx1ZSArIGhpZ2hCb3VuZCk7XG5cbiAgICAgIC8vIHRoZSByaWdodCBsaW5lIG9mIHwtLXxcbiAgICAgIGxpbmVDb29yZGluYXRlcy5wdXNoKHtcbiAgICAgICAgeDE6IHhNYXgsXG4gICAgICAgIHkxOiB5TWluLFxuICAgICAgICB4MjogeE1heCxcbiAgICAgICAgeTI6IHlNYXhcbiAgICAgIH0pO1xuICAgICAgLy8gdGhlIG1pZGRsZSBsaW5lIG9mIHwtLXxcbiAgICAgIGxpbmVDb29yZGluYXRlcy5wdXNoKHtcbiAgICAgICAgeDE6IHhNaW4sXG4gICAgICAgIHkxOiB5TWlkLFxuICAgICAgICB4MjogeE1heCxcbiAgICAgICAgeTI6IHlNaWRcbiAgICAgIH0pO1xuICAgICAgLy8gdGhlIGxlZnQgbGluZSBvZiB8LS18XG4gICAgICBsaW5lQ29vcmRpbmF0ZXMucHVzaCh7XG4gICAgICAgIHgxOiB4TWluLFxuICAgICAgICB5MTogeU1pbixcbiAgICAgICAgeDI6IHhNaW4sXG4gICAgICAgIHkyOiB5TWF4XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gJ3knKSB7XG4gICAgICAvLyBlcnJvciBiYXIgZm9yIGhvcml6b250YWwgY2hhcnRzLCB0aGUgeCBpcyBmaXhlZCwgeSBpcyBhIHJhbmdlIHZhbHVlXG4gICAgICB2YXIge1xuICAgICAgICBzY2FsZTogX3NjYWxlXG4gICAgICB9ID0geUF4aXM7XG4gICAgICB2YXIgeE1pZCA9IHggKyBvZmZzZXQ7XG4gICAgICB2YXIgX3hNaW4gPSB4TWlkIC0gd2lkdGg7XG4gICAgICB2YXIgX3hNYXggPSB4TWlkICsgd2lkdGg7XG4gICAgICB2YXIgX3lNaW4gPSBfc2NhbGUodmFsdWUgLSBsb3dCb3VuZCk7XG4gICAgICB2YXIgX3lNYXggPSBfc2NhbGUodmFsdWUgKyBoaWdoQm91bmQpO1xuXG4gICAgICAvLyB0aGUgdG9wIGxpbmVcbiAgICAgIGxpbmVDb29yZGluYXRlcy5wdXNoKHtcbiAgICAgICAgeDE6IF94TWluLFxuICAgICAgICB5MTogX3lNYXgsXG4gICAgICAgIHgyOiBfeE1heCxcbiAgICAgICAgeTI6IF95TWF4XG4gICAgICB9KTtcbiAgICAgIC8vIHRoZSBtaWRkbGUgbGluZVxuICAgICAgbGluZUNvb3JkaW5hdGVzLnB1c2goe1xuICAgICAgICB4MTogeE1pZCxcbiAgICAgICAgeTE6IF95TWluLFxuICAgICAgICB4MjogeE1pZCxcbiAgICAgICAgeTI6IF95TWF4XG4gICAgICB9KTtcbiAgICAgIC8vIHRoZSBib3R0b20gbGluZVxuICAgICAgbGluZUNvb3JkaW5hdGVzLnB1c2goe1xuICAgICAgICB4MTogX3hNaW4sXG4gICAgICAgIHkxOiBfeU1pbixcbiAgICAgICAgeDI6IF94TWF4LFxuICAgICAgICB5MjogX3lNaW5cbiAgICAgIH0pO1xuICAgIH1cbiAgICB2YXIgc2NhbGVEaXJlY3Rpb24gPSBkaXJlY3Rpb24gPT09ICd4JyA/ICdzY2FsZVgnIDogJ3NjYWxlWSc7XG4gICAgdmFyIHRyYW5zZm9ybU9yaWdpbiA9IFwiXCIuY29uY2F0KHggKyBvZmZzZXQsIFwicHggXCIpLmNvbmNhdCh5ICsgb2Zmc2V0LCBcInB4XCIpO1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwgX2V4dGVuZHMoe1xuICAgICAgY2xhc3NOYW1lOiBcInJlY2hhcnRzLWVycm9yQmFyXCIsXG4gICAgICBrZXk6IFwiYmFyLVwiLmNvbmNhdChsaW5lQ29vcmRpbmF0ZXMubWFwKGMgPT4gXCJcIi5jb25jYXQoYy54MSwgXCItXCIpLmNvbmNhdChjLngyLCBcIi1cIikuY29uY2F0KGMueTEsIFwiLVwiKS5jb25jYXQoYy55MikpKVxuICAgIH0sIHN2Z1Byb3BzKSwgbGluZUNvb3JkaW5hdGVzLm1hcChjID0+IHtcbiAgICAgIHZhciBsaW5lU3R5bGUgPSBpc0FuaW1hdGlvbkFjdGl2ZSA/IHtcbiAgICAgICAgdHJhbnNmb3JtT3JpZ2luXG4gICAgICB9IDogdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KENTU1RyYW5zaXRpb25BbmltYXRlLCB7XG4gICAgICAgIGFuaW1hdGlvbklkOiBcImVycm9yLWJhci1cIi5jb25jYXQoZGlyZWN0aW9uLCBcIl9cIikuY29uY2F0KGMueDEsIFwiLVwiKS5jb25jYXQoYy54MiwgXCItXCIpLmNvbmNhdChjLnkxLCBcIi1cIikuY29uY2F0KGMueTIpLFxuICAgICAgICBmcm9tOiBcIlwiLmNvbmNhdChzY2FsZURpcmVjdGlvbiwgXCIoMClcIiksXG4gICAgICAgIHRvOiBcIlwiLmNvbmNhdChzY2FsZURpcmVjdGlvbiwgXCIoMSlcIiksXG4gICAgICAgIGF0dHJpYnV0ZU5hbWU6IFwidHJhbnNmb3JtXCIsXG4gICAgICAgIGJlZ2luOiBhbmltYXRpb25CZWdpbixcbiAgICAgICAgZWFzaW5nOiBhbmltYXRpb25FYXNpbmcsXG4gICAgICAgIGlzQWN0aXZlOiBpc0FuaW1hdGlvbkFjdGl2ZSxcbiAgICAgICAgZHVyYXRpb246IGFuaW1hdGlvbkR1cmF0aW9uLFxuICAgICAgICBrZXk6IFwiZXJyb3JiYXItXCIuY29uY2F0KGMueDEsIFwiLVwiKS5jb25jYXQoYy54MiwgXCItXCIpLmNvbmNhdChjLnkxLCBcIi1cIikuY29uY2F0KGMueTIpXG4gICAgICB9LCBzdHlsZSA9PiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcImxpbmVcIiwgX2V4dGVuZHMoe30sIGMsIHtcbiAgICAgICAgc3R5bGU6IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgbGluZVN0eWxlKSwgc3R5bGUpXG4gICAgICB9KSkpO1xuICAgIH0pKTtcbiAgfSk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwge1xuICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1lcnJvckJhcnNcIlxuICB9LCBlcnJvckJhcnMpO1xufVxuZnVuY3Rpb24gdXNlRXJyb3JCYXJEaXJlY3Rpb24oZGlyZWN0aW9uRnJvbVByb3BzKSB7XG4gIHZhciBsYXlvdXQgPSB1c2VDaGFydExheW91dCgpO1xuICBpZiAoZGlyZWN0aW9uRnJvbVByb3BzICE9IG51bGwpIHtcbiAgICByZXR1cm4gZGlyZWN0aW9uRnJvbVByb3BzO1xuICB9XG4gIGlmIChsYXlvdXQgIT0gbnVsbCkge1xuICAgIHJldHVybiBsYXlvdXQgPT09ICdob3Jpem9udGFsJyA/ICd5JyA6ICd4JztcbiAgfVxuICByZXR1cm4gJ3gnO1xufVxudmFyIGVycm9yQmFyRGVmYXVsdFByb3BzID0ge1xuICBzdHJva2U6ICdibGFjaycsXG4gIHN0cm9rZVdpZHRoOiAxLjUsXG4gIHdpZHRoOiA1LFxuICBvZmZzZXQ6IDAsXG4gIGlzQW5pbWF0aW9uQWN0aXZlOiB0cnVlLFxuICBhbmltYXRpb25CZWdpbjogMCxcbiAgYW5pbWF0aW9uRHVyYXRpb246IDQwMCxcbiAgYW5pbWF0aW9uRWFzaW5nOiAnZWFzZS1pbi1vdXQnXG59O1xuZnVuY3Rpb24gRXJyb3JCYXJJbnRlcm5hbChwcm9wcykge1xuICB2YXIgcmVhbERpcmVjdGlvbiA9IHVzZUVycm9yQmFyRGlyZWN0aW9uKHByb3BzLmRpcmVjdGlvbik7XG4gIHZhciB7XG4gICAgd2lkdGgsXG4gICAgaXNBbmltYXRpb25BY3RpdmUsXG4gICAgYW5pbWF0aW9uQmVnaW4sXG4gICAgYW5pbWF0aW9uRHVyYXRpb24sXG4gICAgYW5pbWF0aW9uRWFzaW5nXG4gIH0gPSByZXNvbHZlRGVmYXVsdFByb3BzKHByb3BzLCBlcnJvckJhckRlZmF1bHRQcm9wcyk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5GcmFnbWVudCwgbnVsbCwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVwb3J0RXJyb3JCYXJTZXR0aW5ncywge1xuICAgIGRhdGFLZXk6IHByb3BzLmRhdGFLZXksXG4gICAgZGlyZWN0aW9uOiByZWFsRGlyZWN0aW9uXG4gIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChFcnJvckJhckltcGwsIF9leHRlbmRzKHt9LCBwcm9wcywge1xuICAgIGRpcmVjdGlvbjogcmVhbERpcmVjdGlvbixcbiAgICB3aWR0aDogd2lkdGgsXG4gICAgaXNBbmltYXRpb25BY3RpdmU6IGlzQW5pbWF0aW9uQWN0aXZlLFxuICAgIGFuaW1hdGlvbkJlZ2luOiBhbmltYXRpb25CZWdpbixcbiAgICBhbmltYXRpb25EdXJhdGlvbjogYW5pbWF0aW9uRHVyYXRpb24sXG4gICAgYW5pbWF0aW9uRWFzaW5nOiBhbmltYXRpb25FYXNpbmdcbiAgfSkpKTtcbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0L3ByZWZlci1zdGF0ZWxlc3MtZnVuY3Rpb25cbmV4cG9ydCBjbGFzcyBFcnJvckJhciBleHRlbmRzIENvbXBvbmVudCB7XG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoRXJyb3JCYXJJbnRlcm5hbCwgdGhpcy5wcm9wcyk7XG4gIH1cbn1cbl9kZWZpbmVQcm9wZXJ0eShFcnJvckJhciwgXCJkZWZhdWx0UHJvcHNcIiwgZXJyb3JCYXJEZWZhdWx0UHJvcHMpO1xuX2RlZmluZVByb3BlcnR5KEVycm9yQmFyLCBcImRpc3BsYXlOYW1lXCIsICdFcnJvckJhcicpOyIsInZhciBfZXhjbHVkZWQgPSBbXCJ4MVwiLCBcInkxXCIsIFwieDJcIiwgXCJ5MlwiLCBcImtleVwiXSxcbiAgX2V4Y2x1ZGVkMiA9IFtcIm9mZnNldFwiXSxcbiAgX2V4Y2x1ZGVkMyA9IFtcInhBeGlzSWRcIiwgXCJ5QXhpc0lkXCJdLFxuICBfZXhjbHVkZWQ0ID0gW1wieEF4aXNJZFwiLCBcInlBeGlzSWRcIl07XG5mdW5jdGlvbiBvd25LZXlzKGUsIHIpIHsgdmFyIHQgPSBPYmplY3Qua2V5cyhlKTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG8gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyByICYmIChvID0gby5maWx0ZXIoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZSwgcikuZW51bWVyYWJsZTsgfSkpLCB0LnB1c2guYXBwbHkodCwgbyk7IH0gcmV0dXJuIHQ7IH1cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQoZSkgeyBmb3IgKHZhciByID0gMTsgciA8IGFyZ3VtZW50cy5sZW5ndGg7IHIrKykgeyB2YXIgdCA9IG51bGwgIT0gYXJndW1lbnRzW3JdID8gYXJndW1lbnRzW3JdIDoge307IHIgJSAyID8gb3duS2V5cyhPYmplY3QodCksICEwKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0W3JdKTsgfSkgOiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGUsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHQpKSA6IG93bktleXMoT2JqZWN0KHQpKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHQsIHIpKTsgfSk7IH0gcmV0dXJuIGU7IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0KSB7IHJldHVybiAociA9IF90b1Byb3BlcnR5S2V5KHIpKSBpbiBlID8gT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIHsgdmFsdWU6IHQsIGVudW1lcmFibGU6ICEwLCBjb25maWd1cmFibGU6ICEwLCB3cml0YWJsZTogITAgfSkgOiBlW3JdID0gdCwgZTsgfVxuZnVuY3Rpb24gX3RvUHJvcGVydHlLZXkodCkgeyB2YXIgaSA9IF90b1ByaW1pdGl2ZSh0LCBcInN0cmluZ1wiKTsgcmV0dXJuIFwic3ltYm9sXCIgPT0gdHlwZW9mIGkgPyBpIDogaSArIFwiXCI7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZSh0LCByKSB7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiB0IHx8ICF0KSByZXR1cm4gdDsgdmFyIGUgPSB0W1N5bWJvbC50b1ByaW1pdGl2ZV07IGlmICh2b2lkIDAgIT09IGUpIHsgdmFyIGkgPSBlLmNhbGwodCwgciB8fCBcImRlZmF1bHRcIik7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiBpKSByZXR1cm4gaTsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpOyB9IHJldHVybiAoXCJzdHJpbmdcIiA9PT0gciA/IFN0cmluZyA6IE51bWJlcikodCk7IH1cbmZ1bmN0aW9uIF9leHRlbmRzKCkgeyByZXR1cm4gX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduID8gT2JqZWN0LmFzc2lnbi5iaW5kKCkgOiBmdW5jdGlvbiAobikgeyBmb3IgKHZhciBlID0gMTsgZSA8IGFyZ3VtZW50cy5sZW5ndGg7IGUrKykgeyB2YXIgdCA9IGFyZ3VtZW50c1tlXTsgZm9yICh2YXIgciBpbiB0KSAoe30pLmhhc093blByb3BlcnR5LmNhbGwodCwgcikgJiYgKG5bcl0gPSB0W3JdKTsgfSByZXR1cm4gbjsgfSwgX2V4dGVuZHMuYXBwbHkobnVsbCwgYXJndW1lbnRzKTsgfVxuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKGUsIHQpIHsgaWYgKG51bGwgPT0gZSkgcmV0dXJuIHt9OyB2YXIgbywgciwgaSA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKGUsIHQpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IGZvciAociA9IDA7IHIgPCBuLmxlbmd0aDsgcisrKSBvID0gbltyXSwgLTEgPT09IHQuaW5kZXhPZihvKSAmJiB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKGUsIG8pICYmIChpW29dID0gZVtvXSk7IH0gcmV0dXJuIGk7IH1cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKHIsIGUpIHsgaWYgKG51bGwgPT0gcikgcmV0dXJuIHt9OyB2YXIgdCA9IHt9OyBmb3IgKHZhciBuIGluIHIpIGlmICh7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHIsIG4pKSB7IGlmICgtMSAhPT0gZS5pbmRleE9mKG4pKSBjb250aW51ZTsgdFtuXSA9IHJbbl07IH0gcmV0dXJuIHQ7IH1cbi8qKlxuICogQGZpbGVPdmVydmlldyBDYXJ0ZXNpYW4gR3JpZFxuICovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB3YXJuIH0gZnJvbSAnLi4vdXRpbC9Mb2dVdGlscyc7XG5pbXBvcnQgeyBpc051bWJlciB9IGZyb20gJy4uL3V0aWwvRGF0YVV0aWxzJztcbmltcG9ydCB7IGdldENvb3JkaW5hdGVzT2ZHcmlkLCBnZXRUaWNrc09mQXhpcyB9IGZyb20gJy4uL3V0aWwvQ2hhcnRVdGlscyc7XG5pbXBvcnQgeyBnZXRUaWNrcyB9IGZyb20gJy4vZ2V0VGlja3MnO1xuaW1wb3J0IHsgZGVmYXVsdENhcnRlc2lhbkF4aXNQcm9wcyB9IGZyb20gJy4vQ2FydGVzaWFuQXhpcyc7XG5pbXBvcnQgeyB1c2VDaGFydEhlaWdodCwgdXNlQ2hhcnRXaWR0aCwgdXNlT2Zmc2V0SW50ZXJuYWwgfSBmcm9tICcuLi9jb250ZXh0L2NoYXJ0TGF5b3V0Q29udGV4dCc7XG5pbXBvcnQgeyBzZWxlY3RBeGlzUHJvcHNOZWVkZWRGb3JDYXJ0ZXNpYW5HcmlkVGlja3NHZW5lcmF0b3IgfSBmcm9tICcuLi9zdGF0ZS9zZWxlY3RvcnMvYXhpc1NlbGVjdG9ycyc7XG5pbXBvcnQgeyB1c2VBcHBTZWxlY3RvciB9IGZyb20gJy4uL3N0YXRlL2hvb2tzJztcbmltcG9ydCB7IHVzZUlzUGFub3JhbWEgfSBmcm9tICcuLi9jb250ZXh0L1Bhbm9yYW1hQ29udGV4dCc7XG5pbXBvcnQgeyByZXNvbHZlRGVmYXVsdFByb3BzIH0gZnJvbSAnLi4vdXRpbC9yZXNvbHZlRGVmYXVsdFByb3BzJztcbmltcG9ydCB7IHN2Z1Byb3BlcnRpZXNOb0V2ZW50cyB9IGZyb20gJy4uL3V0aWwvc3ZnUHJvcGVydGllc05vRXZlbnRzJztcblxuLyoqXG4gKiBUaGUgPENhcnRlc2lhbkdyaWQgaG9yaXpvbnRhbFxuICovXG5cbnZhciBCYWNrZ3JvdW5kID0gcHJvcHMgPT4ge1xuICB2YXIge1xuICAgIGZpbGxcbiAgfSA9IHByb3BzO1xuICBpZiAoIWZpbGwgfHwgZmlsbCA9PT0gJ25vbmUnKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIHtcbiAgICBmaWxsT3BhY2l0eSxcbiAgICB4LFxuICAgIHksXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIHJ5XG4gIH0gPSBwcm9wcztcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFwicmVjdFwiLCB7XG4gICAgeDogeCxcbiAgICB5OiB5LFxuICAgIHJ5OiByeSxcbiAgICB3aWR0aDogd2lkdGgsXG4gICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgc3Ryb2tlOiBcIm5vbmVcIixcbiAgICBmaWxsOiBmaWxsLFxuICAgIGZpbGxPcGFjaXR5OiBmaWxsT3BhY2l0eSxcbiAgICBjbGFzc05hbWU6IFwicmVjaGFydHMtY2FydGVzaWFuLWdyaWQtYmdcIlxuICB9KTtcbn07XG5mdW5jdGlvbiByZW5kZXJMaW5lSXRlbShvcHRpb24sIHByb3BzKSB7XG4gIHZhciBsaW5lSXRlbTtcbiAgaWYgKC8qI19fUFVSRV9fKi9SZWFjdC5pc1ZhbGlkRWxlbWVudChvcHRpb24pKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0eXBlc2NyaXB0IGRvZXMgbm90IHNlZSB0aGUgcHJvcHMgdHlwZSB3aGVuIGNsb25pbmcgYW4gZWxlbWVudFxuICAgIGxpbmVJdGVtID0gLyojX19QVVJFX18qL1JlYWN0LmNsb25lRWxlbWVudChvcHRpb24sIHByb3BzKTtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgbGluZUl0ZW0gPSBvcHRpb24ocHJvcHMpO1xuICB9IGVsc2Uge1xuICAgIHZhciB7XG4gICAgICAgIHgxLFxuICAgICAgICB5MSxcbiAgICAgICAgeDIsXG4gICAgICAgIHkyLFxuICAgICAgICBrZXlcbiAgICAgIH0gPSBwcm9wcyxcbiAgICAgIG90aGVycyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhwcm9wcywgX2V4Y2x1ZGVkKTtcbiAgICB2YXIgX3N2Z1Byb3BlcnRpZXNOb0V2ZW50ID0gc3ZnUHJvcGVydGllc05vRXZlbnRzKG90aGVycyksXG4gICAgICB7XG4gICAgICAgIG9mZnNldDogX19cbiAgICAgIH0gPSBfc3ZnUHJvcGVydGllc05vRXZlbnQsXG4gICAgICByZXN0T2ZGaWx0ZXJlZFByb3BzID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKF9zdmdQcm9wZXJ0aWVzTm9FdmVudCwgX2V4Y2x1ZGVkMik7XG4gICAgbGluZUl0ZW0gPSAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcImxpbmVcIiwgX2V4dGVuZHMoe30sIHJlc3RPZkZpbHRlcmVkUHJvcHMsIHtcbiAgICAgIHgxOiB4MSxcbiAgICAgIHkxOiB5MSxcbiAgICAgIHgyOiB4MixcbiAgICAgIHkyOiB5MixcbiAgICAgIGZpbGw6IFwibm9uZVwiLFxuICAgICAga2V5OiBrZXlcbiAgICB9KSk7XG4gIH1cbiAgcmV0dXJuIGxpbmVJdGVtO1xufVxuZnVuY3Rpb24gSG9yaXpvbnRhbEdyaWRMaW5lcyhwcm9wcykge1xuICB2YXIge1xuICAgIHgsXG4gICAgd2lkdGgsXG4gICAgaG9yaXpvbnRhbCA9IHRydWUsXG4gICAgaG9yaXpvbnRhbFBvaW50c1xuICB9ID0gcHJvcHM7XG4gIGlmICghaG9yaXpvbnRhbCB8fCAhaG9yaXpvbnRhbFBvaW50cyB8fCAhaG9yaXpvbnRhbFBvaW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIge1xuICAgICAgeEF4aXNJZCxcbiAgICAgIHlBeGlzSWRcbiAgICB9ID0gcHJvcHMsXG4gICAgb3RoZXJMaW5lSXRlbVByb3BzID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKHByb3BzLCBfZXhjbHVkZWQzKTtcbiAgdmFyIGl0ZW1zID0gaG9yaXpvbnRhbFBvaW50cy5tYXAoKGVudHJ5LCBpKSA9PiB7XG4gICAgdmFyIGxpbmVJdGVtUHJvcHMgPSBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIG90aGVyTGluZUl0ZW1Qcm9wcyksIHt9LCB7XG4gICAgICB4MTogeCxcbiAgICAgIHkxOiBlbnRyeSxcbiAgICAgIHgyOiB4ICsgd2lkdGgsXG4gICAgICB5MjogZW50cnksXG4gICAgICBrZXk6IFwibGluZS1cIi5jb25jYXQoaSksXG4gICAgICBpbmRleDogaVxuICAgIH0pO1xuICAgIHJldHVybiByZW5kZXJMaW5lSXRlbShob3Jpem9udGFsLCBsaW5lSXRlbVByb3BzKTtcbiAgfSk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcImdcIiwge1xuICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1jYXJ0ZXNpYW4tZ3JpZC1ob3Jpem9udGFsXCJcbiAgfSwgaXRlbXMpO1xufVxuZnVuY3Rpb24gVmVydGljYWxHcmlkTGluZXMocHJvcHMpIHtcbiAgdmFyIHtcbiAgICB5LFxuICAgIGhlaWdodCxcbiAgICB2ZXJ0aWNhbCA9IHRydWUsXG4gICAgdmVydGljYWxQb2ludHNcbiAgfSA9IHByb3BzO1xuICBpZiAoIXZlcnRpY2FsIHx8ICF2ZXJ0aWNhbFBvaW50cyB8fCAhdmVydGljYWxQb2ludHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIHtcbiAgICAgIHhBeGlzSWQsXG4gICAgICB5QXhpc0lkXG4gICAgfSA9IHByb3BzLFxuICAgIG90aGVyTGluZUl0ZW1Qcm9wcyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhwcm9wcywgX2V4Y2x1ZGVkNCk7XG4gIHZhciBpdGVtcyA9IHZlcnRpY2FsUG9pbnRzLm1hcCgoZW50cnksIGkpID0+IHtcbiAgICB2YXIgbGluZUl0ZW1Qcm9wcyA9IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgb3RoZXJMaW5lSXRlbVByb3BzKSwge30sIHtcbiAgICAgIHgxOiBlbnRyeSxcbiAgICAgIHkxOiB5LFxuICAgICAgeDI6IGVudHJ5LFxuICAgICAgeTI6IHkgKyBoZWlnaHQsXG4gICAgICBrZXk6IFwibGluZS1cIi5jb25jYXQoaSksXG4gICAgICBpbmRleDogaVxuICAgIH0pO1xuICAgIHJldHVybiByZW5kZXJMaW5lSXRlbSh2ZXJ0aWNhbCwgbGluZUl0ZW1Qcm9wcyk7XG4gIH0pO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJnXCIsIHtcbiAgICBjbGFzc05hbWU6IFwicmVjaGFydHMtY2FydGVzaWFuLWdyaWQtdmVydGljYWxcIlxuICB9LCBpdGVtcyk7XG59XG5mdW5jdGlvbiBIb3Jpem9udGFsU3RyaXBlcyhwcm9wcykge1xuICB2YXIge1xuICAgIGhvcml6b250YWxGaWxsLFxuICAgIGZpbGxPcGFjaXR5LFxuICAgIHgsXG4gICAgeSxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgaG9yaXpvbnRhbFBvaW50cyxcbiAgICBob3Jpem9udGFsID0gdHJ1ZVxuICB9ID0gcHJvcHM7XG4gIGlmICghaG9yaXpvbnRhbCB8fCAhaG9yaXpvbnRhbEZpbGwgfHwgIWhvcml6b250YWxGaWxsLmxlbmd0aCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gV2h5ID15IC15PyBJIHdhcyB0cnlpbmcgdG8gZmluZCBhbnkgZGlmZmVyZW5jZSB0aGF0IHRoaXMgbWFrZXMsIHdpdGggZmxvYXRpbmcgcG9pbnQgbnVtYmVycyBhbmQgZWRnZSBjYXNlcyBidXQgLi4uIG5vdGhpbmcuXG4gIHZhciByb3VuZGVkU29ydGVkSG9yaXpvbnRhbFBvaW50cyA9IGhvcml6b250YWxQb2ludHMubWFwKGUgPT4gTWF0aC5yb3VuZChlICsgeSAtIHkpKS5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gIC8vIFdoeSBpcyB0aGlzIGNvbmRpdGlvbiBgIT09YCBpbnN0ZWFkIG9mIGA8PWAgP1xuICBpZiAoeSAhPT0gcm91bmRlZFNvcnRlZEhvcml6b250YWxQb2ludHNbMF0pIHtcbiAgICByb3VuZGVkU29ydGVkSG9yaXpvbnRhbFBvaW50cy51bnNoaWZ0KDApO1xuICB9XG4gIHZhciBpdGVtcyA9IHJvdW5kZWRTb3J0ZWRIb3Jpem9udGFsUG9pbnRzLm1hcCgoZW50cnksIGkpID0+IHtcbiAgICAvLyBXaHkgZG8gd2Ugc3RyaXAgb25seSB0aGUgbGFzdCBzdHJpcGUgaWYgaXQgaXMgaW52aXNpYmxlLCBhbmQgbm90IGFsbCBpbnZpc2libGUgc3RyaXBlcz9cbiAgICB2YXIgbGFzdFN0cmlwZSA9ICFyb3VuZGVkU29ydGVkSG9yaXpvbnRhbFBvaW50c1tpICsgMV07XG4gICAgdmFyIGxpbmVIZWlnaHQgPSBsYXN0U3RyaXBlID8geSArIGhlaWdodCAtIGVudHJ5IDogcm91bmRlZFNvcnRlZEhvcml6b250YWxQb2ludHNbaSArIDFdIC0gZW50cnk7XG4gICAgaWYgKGxpbmVIZWlnaHQgPD0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHZhciBjb2xvckluZGV4ID0gaSAlIGhvcml6b250YWxGaWxsLmxlbmd0aDtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJyZWN0XCIsIHtcbiAgICAgIGtleTogXCJyZWFjdC1cIi5jb25jYXQoaSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZWFjdC9uby1hcnJheS1pbmRleC1rZXlcbiAgICAgICxcbiAgICAgIHk6IGVudHJ5LFxuICAgICAgeDogeCxcbiAgICAgIGhlaWdodDogbGluZUhlaWdodCxcbiAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgIHN0cm9rZTogXCJub25lXCIsXG4gICAgICBmaWxsOiBob3Jpem9udGFsRmlsbFtjb2xvckluZGV4XSxcbiAgICAgIGZpbGxPcGFjaXR5OiBmaWxsT3BhY2l0eSxcbiAgICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1jYXJ0ZXNpYW4tZ3JpZC1iZ1wiXG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJnXCIsIHtcbiAgICBjbGFzc05hbWU6IFwicmVjaGFydHMtY2FydGVzaWFuLWdyaWRzdHJpcGVzLWhvcml6b250YWxcIlxuICB9LCBpdGVtcyk7XG59XG5mdW5jdGlvbiBWZXJ0aWNhbFN0cmlwZXMocHJvcHMpIHtcbiAgdmFyIHtcbiAgICB2ZXJ0aWNhbCA9IHRydWUsXG4gICAgdmVydGljYWxGaWxsLFxuICAgIGZpbGxPcGFjaXR5LFxuICAgIHgsXG4gICAgeSxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgdmVydGljYWxQb2ludHNcbiAgfSA9IHByb3BzO1xuICBpZiAoIXZlcnRpY2FsIHx8ICF2ZXJ0aWNhbEZpbGwgfHwgIXZlcnRpY2FsRmlsbC5sZW5ndGgpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgcm91bmRlZFNvcnRlZFZlcnRpY2FsUG9pbnRzID0gdmVydGljYWxQb2ludHMubWFwKGUgPT4gTWF0aC5yb3VuZChlICsgeCAtIHgpKS5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gIGlmICh4ICE9PSByb3VuZGVkU29ydGVkVmVydGljYWxQb2ludHNbMF0pIHtcbiAgICByb3VuZGVkU29ydGVkVmVydGljYWxQb2ludHMudW5zaGlmdCgwKTtcbiAgfVxuICB2YXIgaXRlbXMgPSByb3VuZGVkU29ydGVkVmVydGljYWxQb2ludHMubWFwKChlbnRyeSwgaSkgPT4ge1xuICAgIHZhciBsYXN0U3RyaXBlID0gIXJvdW5kZWRTb3J0ZWRWZXJ0aWNhbFBvaW50c1tpICsgMV07XG4gICAgdmFyIGxpbmVXaWR0aCA9IGxhc3RTdHJpcGUgPyB4ICsgd2lkdGggLSBlbnRyeSA6IHJvdW5kZWRTb3J0ZWRWZXJ0aWNhbFBvaW50c1tpICsgMV0gLSBlbnRyeTtcbiAgICBpZiAobGluZVdpZHRoIDw9IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB2YXIgY29sb3JJbmRleCA9IGkgJSB2ZXJ0aWNhbEZpbGwubGVuZ3RoO1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcInJlY3RcIiwge1xuICAgICAga2V5OiBcInJlYWN0LVwiLmNvbmNhdChpKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHJlYWN0L25vLWFycmF5LWluZGV4LWtleVxuICAgICAgLFxuICAgICAgeDogZW50cnksXG4gICAgICB5OiB5LFxuICAgICAgd2lkdGg6IGxpbmVXaWR0aCxcbiAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgc3Ryb2tlOiBcIm5vbmVcIixcbiAgICAgIGZpbGw6IHZlcnRpY2FsRmlsbFtjb2xvckluZGV4XSxcbiAgICAgIGZpbGxPcGFjaXR5OiBmaWxsT3BhY2l0eSxcbiAgICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1jYXJ0ZXNpYW4tZ3JpZC1iZ1wiXG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJnXCIsIHtcbiAgICBjbGFzc05hbWU6IFwicmVjaGFydHMtY2FydGVzaWFuLWdyaWRzdHJpcGVzLXZlcnRpY2FsXCJcbiAgfSwgaXRlbXMpO1xufVxudmFyIGRlZmF1bHRWZXJ0aWNhbENvb3JkaW5hdGVzR2VuZXJhdG9yID0gKF9yZWYsIHN5bmNXaXRoVGlja3MpID0+IHtcbiAgdmFyIHtcbiAgICB4QXhpcyxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgb2Zmc2V0XG4gIH0gPSBfcmVmO1xuICByZXR1cm4gZ2V0Q29vcmRpbmF0ZXNPZkdyaWQoZ2V0VGlja3MoX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGRlZmF1bHRDYXJ0ZXNpYW5BeGlzUHJvcHMpLCB4QXhpcyksIHt9LCB7XG4gICAgdGlja3M6IGdldFRpY2tzT2ZBeGlzKHhBeGlzLCB0cnVlKSxcbiAgICB2aWV3Qm94OiB7XG4gICAgICB4OiAwLFxuICAgICAgeTogMCxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0XG4gICAgfVxuICB9KSksIG9mZnNldC5sZWZ0LCBvZmZzZXQubGVmdCArIG9mZnNldC53aWR0aCwgc3luY1dpdGhUaWNrcyk7XG59O1xudmFyIGRlZmF1bHRIb3Jpem9udGFsQ29vcmRpbmF0ZXNHZW5lcmF0b3IgPSAoX3JlZjIsIHN5bmNXaXRoVGlja3MpID0+IHtcbiAgdmFyIHtcbiAgICB5QXhpcyxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgb2Zmc2V0XG4gIH0gPSBfcmVmMjtcbiAgcmV0dXJuIGdldENvb3JkaW5hdGVzT2ZHcmlkKGdldFRpY2tzKF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBkZWZhdWx0Q2FydGVzaWFuQXhpc1Byb3BzKSwgeUF4aXMpLCB7fSwge1xuICAgIHRpY2tzOiBnZXRUaWNrc09mQXhpcyh5QXhpcywgdHJ1ZSksXG4gICAgdmlld0JveDoge1xuICAgICAgeDogMCxcbiAgICAgIHk6IDAsXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodFxuICAgIH1cbiAgfSkpLCBvZmZzZXQudG9wLCBvZmZzZXQudG9wICsgb2Zmc2V0LmhlaWdodCwgc3luY1dpdGhUaWNrcyk7XG59O1xudmFyIGRlZmF1bHRQcm9wcyA9IHtcbiAgaG9yaXpvbnRhbDogdHJ1ZSxcbiAgdmVydGljYWw6IHRydWUsXG4gIC8vIFRoZSBvcmRpbmF0ZXMgb2YgaG9yaXpvbnRhbCBncmlkIGxpbmVzXG4gIGhvcml6b250YWxQb2ludHM6IFtdLFxuICAvLyBUaGUgYWJzY2lzc2FzIG9mIHZlcnRpY2FsIGdyaWQgbGluZXNcbiAgdmVydGljYWxQb2ludHM6IFtdLFxuICBzdHJva2U6ICcjY2NjJyxcbiAgZmlsbDogJ25vbmUnLFxuICAvLyBUaGUgZmlsbCBvZiBjb2xvcnMgb2YgZ3JpZCBsaW5lc1xuICB2ZXJ0aWNhbEZpbGw6IFtdLFxuICBob3Jpem9udGFsRmlsbDogW10sXG4gIHhBeGlzSWQ6IDAsXG4gIHlBeGlzSWQ6IDBcbn07XG5leHBvcnQgZnVuY3Rpb24gQ2FydGVzaWFuR3JpZChwcm9wcykge1xuICB2YXIgY2hhcnRXaWR0aCA9IHVzZUNoYXJ0V2lkdGgoKTtcbiAgdmFyIGNoYXJ0SGVpZ2h0ID0gdXNlQ2hhcnRIZWlnaHQoKTtcbiAgdmFyIG9mZnNldCA9IHVzZU9mZnNldEludGVybmFsKCk7XG4gIHZhciBwcm9wc0luY2x1ZGluZ0RlZmF1bHRzID0gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCByZXNvbHZlRGVmYXVsdFByb3BzKHByb3BzLCBkZWZhdWx0UHJvcHMpKSwge30sIHtcbiAgICB4OiBpc051bWJlcihwcm9wcy54KSA/IHByb3BzLnggOiBvZmZzZXQubGVmdCxcbiAgICB5OiBpc051bWJlcihwcm9wcy55KSA/IHByb3BzLnkgOiBvZmZzZXQudG9wLFxuICAgIHdpZHRoOiBpc051bWJlcihwcm9wcy53aWR0aCkgPyBwcm9wcy53aWR0aCA6IG9mZnNldC53aWR0aCxcbiAgICBoZWlnaHQ6IGlzTnVtYmVyKHByb3BzLmhlaWdodCkgPyBwcm9wcy5oZWlnaHQgOiBvZmZzZXQuaGVpZ2h0XG4gIH0pO1xuICB2YXIge1xuICAgIHhBeGlzSWQsXG4gICAgeUF4aXNJZCxcbiAgICB4LFxuICAgIHksXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIHN5bmNXaXRoVGlja3MsXG4gICAgaG9yaXpvbnRhbFZhbHVlcyxcbiAgICB2ZXJ0aWNhbFZhbHVlc1xuICB9ID0gcHJvcHNJbmNsdWRpbmdEZWZhdWx0cztcbiAgdmFyIGlzUGFub3JhbWEgPSB1c2VJc1Bhbm9yYW1hKCk7XG4gIHZhciB4QXhpcyA9IHVzZUFwcFNlbGVjdG9yKHN0YXRlID0+IHNlbGVjdEF4aXNQcm9wc05lZWRlZEZvckNhcnRlc2lhbkdyaWRUaWNrc0dlbmVyYXRvcihzdGF0ZSwgJ3hBeGlzJywgeEF4aXNJZCwgaXNQYW5vcmFtYSkpO1xuICB2YXIgeUF4aXMgPSB1c2VBcHBTZWxlY3RvcihzdGF0ZSA9PiBzZWxlY3RBeGlzUHJvcHNOZWVkZWRGb3JDYXJ0ZXNpYW5HcmlkVGlja3NHZW5lcmF0b3Ioc3RhdGUsICd5QXhpcycsIHlBeGlzSWQsIGlzUGFub3JhbWEpKTtcbiAgaWYgKCFpc051bWJlcih3aWR0aCkgfHwgd2lkdGggPD0gMCB8fCAhaXNOdW1iZXIoaGVpZ2h0KSB8fCBoZWlnaHQgPD0gMCB8fCAhaXNOdW1iZXIoeCkgfHwgeCAhPT0gK3ggfHwgIWlzTnVtYmVyKHkpIHx8IHkgIT09ICt5KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKlxuICAgKiB2ZXJ0aWNhbENvb3JkaW5hdGVzR2VuZXJhdG9yIGFuZCBob3Jpem9udGFsQ29vcmRpbmF0ZXNHZW5lcmF0b3IgYXJlIGRlZmluZWRcbiAgICogb3V0c2lkZSB0aGUgcHJvcHNJbmNsdWRpbmdEZWZhdWx0cyBiZWNhdXNlIHRoZXkgd2VyZSBuZXZlciBwYXJ0IG9mIHRoZSBvcmlnaW5hbCBwcm9wc1xuICAgKiBhbmQgdGhleSB3ZXJlIG5ldmVyIHBhc3NlZCBhcyBhIHByb3AgZG93biB0byBob3Jpem9udGFsL3ZlcnRpY2FsIGN1c3RvbSBlbGVtZW50cy5cbiAgICogSWYgd2UgYWRkIHRoZXNlIHR3byB0byBwcm9wc0luY2x1ZGluZ0RlZmF1bHRzIHRoZW4gd2UgYXJlIGNoYW5naW5nIHB1YmxpYyBBUEkuXG4gICAqIE5vdCBhIGJhZCB0aGluZyBwZXIgc2UgYnV0IGFsc28gbm90IG5lY2Vzc2FyeS5cbiAgICovXG4gIHZhciB2ZXJ0aWNhbENvb3JkaW5hdGVzR2VuZXJhdG9yID0gcHJvcHNJbmNsdWRpbmdEZWZhdWx0cy52ZXJ0aWNhbENvb3JkaW5hdGVzR2VuZXJhdG9yIHx8IGRlZmF1bHRWZXJ0aWNhbENvb3JkaW5hdGVzR2VuZXJhdG9yO1xuICB2YXIgaG9yaXpvbnRhbENvb3JkaW5hdGVzR2VuZXJhdG9yID0gcHJvcHNJbmNsdWRpbmdEZWZhdWx0cy5ob3Jpem9udGFsQ29vcmRpbmF0ZXNHZW5lcmF0b3IgfHwgZGVmYXVsdEhvcml6b250YWxDb29yZGluYXRlc0dlbmVyYXRvcjtcbiAgdmFyIHtcbiAgICBob3Jpem9udGFsUG9pbnRzLFxuICAgIHZlcnRpY2FsUG9pbnRzXG4gIH0gPSBwcm9wc0luY2x1ZGluZ0RlZmF1bHRzO1xuXG4gIC8vIE5vIGhvcml6b250YWwgcG9pbnRzIGFyZSBzcGVjaWZpZWRcbiAgaWYgKCghaG9yaXpvbnRhbFBvaW50cyB8fCAhaG9yaXpvbnRhbFBvaW50cy5sZW5ndGgpICYmIHR5cGVvZiBob3Jpem9udGFsQ29vcmRpbmF0ZXNHZW5lcmF0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICB2YXIgaXNIb3Jpem9udGFsVmFsdWVzID0gaG9yaXpvbnRhbFZhbHVlcyAmJiBob3Jpem9udGFsVmFsdWVzLmxlbmd0aDtcbiAgICB2YXIgZ2VuZXJhdG9yUmVzdWx0ID0gaG9yaXpvbnRhbENvb3JkaW5hdGVzR2VuZXJhdG9yKHtcbiAgICAgIHlBeGlzOiB5QXhpcyA/IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgeUF4aXMpLCB7fSwge1xuICAgICAgICB0aWNrczogaXNIb3Jpem9udGFsVmFsdWVzID8gaG9yaXpvbnRhbFZhbHVlcyA6IHlBeGlzLnRpY2tzXG4gICAgICB9KSA6IHVuZGVmaW5lZCxcbiAgICAgIHdpZHRoOiBjaGFydFdpZHRoLFxuICAgICAgaGVpZ2h0OiBjaGFydEhlaWdodCxcbiAgICAgIG9mZnNldFxuICAgIH0sIGlzSG9yaXpvbnRhbFZhbHVlcyA/IHRydWUgOiBzeW5jV2l0aFRpY2tzKTtcbiAgICB3YXJuKEFycmF5LmlzQXJyYXkoZ2VuZXJhdG9yUmVzdWx0KSwgXCJob3Jpem9udGFsQ29vcmRpbmF0ZXNHZW5lcmF0b3Igc2hvdWxkIHJldHVybiBBcnJheSBidXQgaW5zdGVhZCBpdCByZXR1cm5lZCBbXCIuY29uY2F0KHR5cGVvZiBnZW5lcmF0b3JSZXN1bHQsIFwiXVwiKSk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZ2VuZXJhdG9yUmVzdWx0KSkge1xuICAgICAgaG9yaXpvbnRhbFBvaW50cyA9IGdlbmVyYXRvclJlc3VsdDtcbiAgICB9XG4gIH1cblxuICAvLyBObyB2ZXJ0aWNhbCBwb2ludHMgYXJlIHNwZWNpZmllZFxuICBpZiAoKCF2ZXJ0aWNhbFBvaW50cyB8fCAhdmVydGljYWxQb2ludHMubGVuZ3RoKSAmJiB0eXBlb2YgdmVydGljYWxDb29yZGluYXRlc0dlbmVyYXRvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHZhciBpc1ZlcnRpY2FsVmFsdWVzID0gdmVydGljYWxWYWx1ZXMgJiYgdmVydGljYWxWYWx1ZXMubGVuZ3RoO1xuICAgIHZhciBfZ2VuZXJhdG9yUmVzdWx0ID0gdmVydGljYWxDb29yZGluYXRlc0dlbmVyYXRvcih7XG4gICAgICB4QXhpczogeEF4aXMgPyBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIHhBeGlzKSwge30sIHtcbiAgICAgICAgdGlja3M6IGlzVmVydGljYWxWYWx1ZXMgPyB2ZXJ0aWNhbFZhbHVlcyA6IHhBeGlzLnRpY2tzXG4gICAgICB9KSA6IHVuZGVmaW5lZCxcbiAgICAgIHdpZHRoOiBjaGFydFdpZHRoLFxuICAgICAgaGVpZ2h0OiBjaGFydEhlaWdodCxcbiAgICAgIG9mZnNldFxuICAgIH0sIGlzVmVydGljYWxWYWx1ZXMgPyB0cnVlIDogc3luY1dpdGhUaWNrcyk7XG4gICAgd2FybihBcnJheS5pc0FycmF5KF9nZW5lcmF0b3JSZXN1bHQpLCBcInZlcnRpY2FsQ29vcmRpbmF0ZXNHZW5lcmF0b3Igc2hvdWxkIHJldHVybiBBcnJheSBidXQgaW5zdGVhZCBpdCByZXR1cm5lZCBbXCIuY29uY2F0KHR5cGVvZiBfZ2VuZXJhdG9yUmVzdWx0LCBcIl1cIikpO1xuICAgIGlmIChBcnJheS5pc0FycmF5KF9nZW5lcmF0b3JSZXN1bHQpKSB7XG4gICAgICB2ZXJ0aWNhbFBvaW50cyA9IF9nZW5lcmF0b3JSZXN1bHQ7XG4gICAgfVxuICB9XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcImdcIiwge1xuICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1jYXJ0ZXNpYW4tZ3JpZFwiXG4gIH0sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEJhY2tncm91bmQsIHtcbiAgICBmaWxsOiBwcm9wc0luY2x1ZGluZ0RlZmF1bHRzLmZpbGwsXG4gICAgZmlsbE9wYWNpdHk6IHByb3BzSW5jbHVkaW5nRGVmYXVsdHMuZmlsbE9wYWNpdHksXG4gICAgeDogcHJvcHNJbmNsdWRpbmdEZWZhdWx0cy54LFxuICAgIHk6IHByb3BzSW5jbHVkaW5nRGVmYXVsdHMueSxcbiAgICB3aWR0aDogcHJvcHNJbmNsdWRpbmdEZWZhdWx0cy53aWR0aCxcbiAgICBoZWlnaHQ6IHByb3BzSW5jbHVkaW5nRGVmYXVsdHMuaGVpZ2h0LFxuICAgIHJ5OiBwcm9wc0luY2x1ZGluZ0RlZmF1bHRzLnJ5XG4gIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChIb3Jpem9udGFsU3RyaXBlcywgX2V4dGVuZHMoe30sIHByb3BzSW5jbHVkaW5nRGVmYXVsdHMsIHtcbiAgICBob3Jpem9udGFsUG9pbnRzOiBob3Jpem9udGFsUG9pbnRzXG4gIH0pKSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoVmVydGljYWxTdHJpcGVzLCBfZXh0ZW5kcyh7fSwgcHJvcHNJbmNsdWRpbmdEZWZhdWx0cywge1xuICAgIHZlcnRpY2FsUG9pbnRzOiB2ZXJ0aWNhbFBvaW50c1xuICB9KSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEhvcml6b250YWxHcmlkTGluZXMsIF9leHRlbmRzKHt9LCBwcm9wc0luY2x1ZGluZ0RlZmF1bHRzLCB7XG4gICAgb2Zmc2V0OiBvZmZzZXQsXG4gICAgaG9yaXpvbnRhbFBvaW50czogaG9yaXpvbnRhbFBvaW50cyxcbiAgICB4QXhpczogeEF4aXMsXG4gICAgeUF4aXM6IHlBeGlzXG4gIH0pKSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoVmVydGljYWxHcmlkTGluZXMsIF9leHRlbmRzKHt9LCBwcm9wc0luY2x1ZGluZ0RlZmF1bHRzLCB7XG4gICAgb2Zmc2V0OiBvZmZzZXQsXG4gICAgdmVydGljYWxQb2ludHM6IHZlcnRpY2FsUG9pbnRzLFxuICAgIHhBeGlzOiB4QXhpcyxcbiAgICB5QXhpczogeUF4aXNcbiAgfSkpKTtcbn1cbkNhcnRlc2lhbkdyaWQuZGlzcGxheU5hbWUgPSAnQ2FydGVzaWFuR3JpZCc7IiwidmFyIF9leGNsdWRlZCA9IFtcImlkXCJdLFxuICBfZXhjbHVkZWQyID0gW1wiYWN0aXZlRG90XCIsIFwiYW5pbWF0aW9uQmVnaW5cIiwgXCJhbmltYXRpb25EdXJhdGlvblwiLCBcImFuaW1hdGlvbkVhc2luZ1wiLCBcImNvbm5lY3ROdWxsc1wiLCBcImRvdFwiLCBcImZpbGxcIiwgXCJmaWxsT3BhY2l0eVwiLCBcImhpZGVcIiwgXCJpc0FuaW1hdGlvbkFjdGl2ZVwiLCBcImxlZ2VuZFR5cGVcIiwgXCJzdHJva2VcIiwgXCJ4QXhpc0lkXCIsIFwieUF4aXNJZFwiXTtcbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhlLCB0KSB7IGlmIChudWxsID09IGUpIHJldHVybiB7fTsgdmFyIG8sIHIsIGkgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShlLCB0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG4gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyBmb3IgKHIgPSAwOyByIDwgbi5sZW5ndGg7IHIrKykgbyA9IG5bcl0sIC0xID09PSB0LmluZGV4T2YobykgJiYge30ucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChlLCBvKSAmJiAoaVtvXSA9IGVbb10pOyB9IHJldHVybiBpOyB9XG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShyLCBlKSB7IGlmIChudWxsID09IHIpIHJldHVybiB7fTsgdmFyIHQgPSB7fTsgZm9yICh2YXIgbiBpbiByKSBpZiAoe30uaGFzT3duUHJvcGVydHkuY2FsbChyLCBuKSkgeyBpZiAoLTEgIT09IGUuaW5kZXhPZihuKSkgY29udGludWU7IHRbbl0gPSByW25dOyB9IHJldHVybiB0OyB9XG5mdW5jdGlvbiBvd25LZXlzKGUsIHIpIHsgdmFyIHQgPSBPYmplY3Qua2V5cyhlKTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG8gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyByICYmIChvID0gby5maWx0ZXIoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZSwgcikuZW51bWVyYWJsZTsgfSkpLCB0LnB1c2guYXBwbHkodCwgbyk7IH0gcmV0dXJuIHQ7IH1cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQoZSkgeyBmb3IgKHZhciByID0gMTsgciA8IGFyZ3VtZW50cy5sZW5ndGg7IHIrKykgeyB2YXIgdCA9IG51bGwgIT0gYXJndW1lbnRzW3JdID8gYXJndW1lbnRzW3JdIDoge307IHIgJSAyID8gb3duS2V5cyhPYmplY3QodCksICEwKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0W3JdKTsgfSkgOiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGUsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHQpKSA6IG93bktleXMoT2JqZWN0KHQpKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHQsIHIpKTsgfSk7IH0gcmV0dXJuIGU7IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0KSB7IHJldHVybiAociA9IF90b1Byb3BlcnR5S2V5KHIpKSBpbiBlID8gT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIHsgdmFsdWU6IHQsIGVudW1lcmFibGU6ICEwLCBjb25maWd1cmFibGU6ICEwLCB3cml0YWJsZTogITAgfSkgOiBlW3JdID0gdCwgZTsgfVxuZnVuY3Rpb24gX3RvUHJvcGVydHlLZXkodCkgeyB2YXIgaSA9IF90b1ByaW1pdGl2ZSh0LCBcInN0cmluZ1wiKTsgcmV0dXJuIFwic3ltYm9sXCIgPT0gdHlwZW9mIGkgPyBpIDogaSArIFwiXCI7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZSh0LCByKSB7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiB0IHx8ICF0KSByZXR1cm4gdDsgdmFyIGUgPSB0W1N5bWJvbC50b1ByaW1pdGl2ZV07IGlmICh2b2lkIDAgIT09IGUpIHsgdmFyIGkgPSBlLmNhbGwodCwgciB8fCBcImRlZmF1bHRcIik7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiBpKSByZXR1cm4gaTsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpOyB9IHJldHVybiAoXCJzdHJpbmdcIiA9PT0gciA/IFN0cmluZyA6IE51bWJlcikodCk7IH1cbmZ1bmN0aW9uIF9leHRlbmRzKCkgeyByZXR1cm4gX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduID8gT2JqZWN0LmFzc2lnbi5iaW5kKCkgOiBmdW5jdGlvbiAobikgeyBmb3IgKHZhciBlID0gMTsgZSA8IGFyZ3VtZW50cy5sZW5ndGg7IGUrKykgeyB2YXIgdCA9IGFyZ3VtZW50c1tlXTsgZm9yICh2YXIgciBpbiB0KSAoe30pLmhhc093blByb3BlcnR5LmNhbGwodCwgcikgJiYgKG5bcl0gPSB0W3JdKTsgfSByZXR1cm4gbjsgfSwgX2V4dGVuZHMuYXBwbHkobnVsbCwgYXJndW1lbnRzKTsgfVxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgUHVyZUNvbXBvbmVudCwgdXNlQ2FsbGJhY2ssIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBDdXJ2ZSB9IGZyb20gJy4uL3NoYXBlL0N1cnZlJztcbmltcG9ydCB7IERvdCB9IGZyb20gJy4uL3NoYXBlL0RvdCc7XG5pbXBvcnQgeyBMYXllciB9IGZyb20gJy4uL2NvbnRhaW5lci9MYXllcic7XG5pbXBvcnQgeyBDYXJ0ZXNpYW5MYWJlbExpc3RDb250ZXh0UHJvdmlkZXIsIExhYmVsTGlzdEZyb21MYWJlbFByb3AgfSBmcm9tICcuLi9jb21wb25lbnQvTGFiZWxMaXN0JztcbmltcG9ydCB7IEdsb2JhbCB9IGZyb20gJy4uL3V0aWwvR2xvYmFsJztcbmltcG9ydCB7IGludGVycG9sYXRlLCBpc05hbiwgaXNOdWxsaXNoLCBpc051bWJlciB9IGZyb20gJy4uL3V0aWwvRGF0YVV0aWxzJztcbmltcG9ydCB7IGdldENhdGVDb29yZGluYXRlT2ZMaW5lLCBnZXROb3JtYWxpemVkU3RhY2tJZCwgZ2V0VG9vbHRpcE5hbWVQcm9wLCBnZXRWYWx1ZUJ5RGF0YUtleSB9IGZyb20gJy4uL3V0aWwvQ2hhcnRVdGlscyc7XG5pbXBvcnQgeyBpc0NsaXBEb3QgfSBmcm9tICcuLi91dGlsL1JlYWN0VXRpbHMnO1xuaW1wb3J0IHsgQWN0aXZlUG9pbnRzIH0gZnJvbSAnLi4vY29tcG9uZW50L0FjdGl2ZVBvaW50cyc7XG5pbXBvcnQgeyBTZXRUb29sdGlwRW50cnlTZXR0aW5ncyB9IGZyb20gJy4uL3N0YXRlL1NldFRvb2x0aXBFbnRyeVNldHRpbmdzJztcbmltcG9ydCB7IEdyYXBoaWNhbEl0ZW1DbGlwUGF0aCwgdXNlTmVlZHNDbGlwIH0gZnJvbSAnLi9HcmFwaGljYWxJdGVtQ2xpcFBhdGgnO1xuaW1wb3J0IHsgc2VsZWN0QXJlYSB9IGZyb20gJy4uL3N0YXRlL3NlbGVjdG9ycy9hcmVhU2VsZWN0b3JzJztcbmltcG9ydCB7IHVzZUlzUGFub3JhbWEgfSBmcm9tICcuLi9jb250ZXh0L1Bhbm9yYW1hQ29udGV4dCc7XG5pbXBvcnQgeyB1c2VDaGFydExheW91dCB9IGZyb20gJy4uL2NvbnRleHQvY2hhcnRMYXlvdXRDb250ZXh0JztcbmltcG9ydCB7IHVzZUNoYXJ0TmFtZSB9IGZyb20gJy4uL3N0YXRlL3NlbGVjdG9ycy9zZWxlY3RvcnMnO1xuaW1wb3J0IHsgU2V0TGVnZW5kUGF5bG9hZCB9IGZyb20gJy4uL3N0YXRlL1NldExlZ2VuZFBheWxvYWQnO1xuaW1wb3J0IHsgdXNlQXBwU2VsZWN0b3IgfSBmcm9tICcuLi9zdGF0ZS9ob29rcyc7XG5pbXBvcnQgeyB1c2VBbmltYXRpb25JZCB9IGZyb20gJy4uL3V0aWwvdXNlQW5pbWF0aW9uSWQnO1xuaW1wb3J0IHsgcmVzb2x2ZURlZmF1bHRQcm9wcyB9IGZyb20gJy4uL3V0aWwvcmVzb2x2ZURlZmF1bHRQcm9wcyc7XG5pbXBvcnQgeyBpc1dlbGxCZWhhdmVkTnVtYmVyIH0gZnJvbSAnLi4vdXRpbC9pc1dlbGxCZWhhdmVkTnVtYmVyJztcbmltcG9ydCB7IHVzZVBsb3RBcmVhIH0gZnJvbSAnLi4vaG9va3MnO1xuaW1wb3J0IHsgUmVnaXN0ZXJHcmFwaGljYWxJdGVtSWQgfSBmcm9tICcuLi9jb250ZXh0L1JlZ2lzdGVyR3JhcGhpY2FsSXRlbUlkJztcbmltcG9ydCB7IFNldENhcnRlc2lhbkdyYXBoaWNhbEl0ZW0gfSBmcm9tICcuLi9zdGF0ZS9TZXRHcmFwaGljYWxJdGVtJztcbmltcG9ydCB7IHN2Z1Byb3BlcnRpZXNOb0V2ZW50cyB9IGZyb20gJy4uL3V0aWwvc3ZnUHJvcGVydGllc05vRXZlbnRzJztcbmltcG9ydCB7IEphdmFzY3JpcHRBbmltYXRlIH0gZnJvbSAnLi4vYW5pbWF0aW9uL0phdmFzY3JpcHRBbmltYXRlJztcbmltcG9ydCB7IGdldFJhZGl1c0FuZFN0cm9rZVdpZHRoRnJvbURvdCB9IGZyb20gJy4uL3V0aWwvZ2V0UmFkaXVzQW5kU3Ryb2tlV2lkdGhGcm9tRG90JztcbmltcG9ydCB7IHN2Z1Byb3BlcnRpZXNBbmRFdmVudHNGcm9tVW5rbm93biB9IGZyb20gJy4uL3V0aWwvc3ZnUHJvcGVydGllc0FuZEV2ZW50cyc7XG5cbi8qKlxuICogSW50ZXJuYWwgcHJvcHMsIGNvbWJpbmF0aW9uIG9mIGV4dGVybmFsIHByb3BzICsgZGVmYXVsdFByb3BzICsgcHJpdmF0ZSBSZWNoYXJ0cyBzdGF0ZVxuICovXG5cbi8qKlxuICogRXh0ZXJuYWwgcHJvcHMsIGludGVuZGVkIGZvciBlbmQgdXNlcnMgdG8gZmlsbCBpblxuICovXG5cbi8qKlxuICogQmVjYXVzZSBvZiBuYW1pbmcgY29uZmxpY3QsIHdlIGFyZSBmb3JjZWQgdG8gaWdub3JlIGNlcnRhaW4gKHZhbGlkKSBTVkcgYXR0cmlidXRlcy5cbiAqL1xuXG5mdW5jdGlvbiBnZXRMZWdlbmRJdGVtQ29sb3Ioc3Ryb2tlLCBmaWxsKSB7XG4gIHJldHVybiBzdHJva2UgJiYgc3Ryb2tlICE9PSAnbm9uZScgPyBzdHJva2UgOiBmaWxsO1xufVxudmFyIGNvbXB1dGVMZWdlbmRQYXlsb2FkRnJvbUFyZWFEYXRhID0gcHJvcHMgPT4ge1xuICB2YXIge1xuICAgIGRhdGFLZXksXG4gICAgbmFtZSxcbiAgICBzdHJva2UsXG4gICAgZmlsbCxcbiAgICBsZWdlbmRUeXBlLFxuICAgIGhpZGVcbiAgfSA9IHByb3BzO1xuICByZXR1cm4gW3tcbiAgICBpbmFjdGl2ZTogaGlkZSxcbiAgICBkYXRhS2V5LFxuICAgIHR5cGU6IGxlZ2VuZFR5cGUsXG4gICAgY29sb3I6IGdldExlZ2VuZEl0ZW1Db2xvcihzdHJva2UsIGZpbGwpLFxuICAgIHZhbHVlOiBnZXRUb29sdGlwTmFtZVByb3AobmFtZSwgZGF0YUtleSksXG4gICAgcGF5bG9hZDogcHJvcHNcbiAgfV07XG59O1xuZnVuY3Rpb24gZ2V0VG9vbHRpcEVudHJ5U2V0dGluZ3MocHJvcHMpIHtcbiAgdmFyIHtcbiAgICBkYXRhS2V5LFxuICAgIGRhdGEsXG4gICAgc3Ryb2tlLFxuICAgIHN0cm9rZVdpZHRoLFxuICAgIGZpbGwsXG4gICAgbmFtZSxcbiAgICBoaWRlLFxuICAgIHVuaXRcbiAgfSA9IHByb3BzO1xuICByZXR1cm4ge1xuICAgIGRhdGFEZWZpbmVkT25JdGVtOiBkYXRhLFxuICAgIHBvc2l0aW9uczogdW5kZWZpbmVkLFxuICAgIHNldHRpbmdzOiB7XG4gICAgICBzdHJva2UsXG4gICAgICBzdHJva2VXaWR0aCxcbiAgICAgIGZpbGwsXG4gICAgICBkYXRhS2V5LFxuICAgICAgbmFtZUtleTogdW5kZWZpbmVkLFxuICAgICAgbmFtZTogZ2V0VG9vbHRpcE5hbWVQcm9wKG5hbWUsIGRhdGFLZXkpLFxuICAgICAgaGlkZSxcbiAgICAgIHR5cGU6IHByb3BzLnRvb2x0aXBUeXBlLFxuICAgICAgY29sb3I6IGdldExlZ2VuZEl0ZW1Db2xvcihzdHJva2UsIGZpbGwpLFxuICAgICAgdW5pdFxuICAgIH1cbiAgfTtcbn1cbnZhciByZW5kZXJEb3RJdGVtID0gKG9wdGlvbiwgcHJvcHMpID0+IHtcbiAgdmFyIGRvdEl0ZW07XG4gIGlmICgvKiNfX1BVUkVfXyovUmVhY3QuaXNWYWxpZEVsZW1lbnQob3B0aW9uKSkge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3Igd2hlbiBjbG9uaW5nLCB0aGUgZXZlbnQgaGFuZGxlciB0eXBlcyBkbyBub3QgbWF0Y2hcbiAgICBkb3RJdGVtID0gLyojX19QVVJFX18qL1JlYWN0LmNsb25lRWxlbWVudChvcHRpb24sIHByb3BzKTtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZG90SXRlbSA9IG9wdGlvbihwcm9wcyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGNsYXNzTmFtZSA9IGNsc3goJ3JlY2hhcnRzLWFyZWEtZG90JywgdHlwZW9mIG9wdGlvbiAhPT0gJ2Jvb2xlYW4nID8gb3B0aW9uLmNsYXNzTmFtZSA6ICcnKTtcbiAgICBkb3RJdGVtID0gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoRG90LCBfZXh0ZW5kcyh7fSwgcHJvcHMsIHtcbiAgICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lXG4gICAgfSkpO1xuICB9XG4gIHJldHVybiBkb3RJdGVtO1xufTtcbmZ1bmN0aW9uIHNob3VsZFJlbmRlckRvdHMocG9pbnRzLCBkb3QpIHtcbiAgaWYgKHBvaW50cyA9PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChkb3QpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gcG9pbnRzLmxlbmd0aCA9PT0gMTtcbn1cbmZ1bmN0aW9uIERvdHMoX3JlZikge1xuICB2YXIge1xuICAgIGNsaXBQYXRoSWQsXG4gICAgcG9pbnRzLFxuICAgIHByb3BzXG4gIH0gPSBfcmVmO1xuICB2YXIge1xuICAgIG5lZWRDbGlwLFxuICAgIGRvdCxcbiAgICBkYXRhS2V5XG4gIH0gPSBwcm9wcztcbiAgaWYgKCFzaG91bGRSZW5kZXJEb3RzKHBvaW50cywgZG90KSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciBjbGlwRG90ID0gaXNDbGlwRG90KGRvdCk7XG4gIHZhciBhcmVhUHJvcHMgPSBzdmdQcm9wZXJ0aWVzTm9FdmVudHMocHJvcHMpO1xuICB2YXIgY3VzdG9tRG90UHJvcHMgPSBzdmdQcm9wZXJ0aWVzQW5kRXZlbnRzRnJvbVVua25vd24oZG90KTtcbiAgdmFyIGRvdHMgPSBwb2ludHMubWFwKChlbnRyeSwgaSkgPT4ge1xuICAgIHZhciBkb3RQcm9wcyA9IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHtcbiAgICAgIGtleTogXCJkb3QtXCIuY29uY2F0KGkpLFxuICAgICAgcjogM1xuICAgIH0sIGFyZWFQcm9wcyksIGN1c3RvbURvdFByb3BzKSwge30sIHtcbiAgICAgIGluZGV4OiBpLFxuICAgICAgY3g6IGVudHJ5LngsXG4gICAgICBjeTogZW50cnkueSxcbiAgICAgIGRhdGFLZXksXG4gICAgICB2YWx1ZTogZW50cnkudmFsdWUsXG4gICAgICBwYXlsb2FkOiBlbnRyeS5wYXlsb2FkLFxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB3ZSdyZSBwYXNzaW5nIGV4dHJhIHByb3BlcnR5ICdwb2ludHMnIHRoYXQgdGhlIHByb3BzIGFyZSBub3QgZXhwZWN0aW5nXG4gICAgICBwb2ludHNcbiAgICB9KTtcbiAgICByZXR1cm4gcmVuZGVyRG90SXRlbShkb3QsIGRvdFByb3BzKTtcbiAgfSk7XG4gIHZhciBkb3RzUHJvcHMgPSB7XG4gICAgY2xpcFBhdGg6IG5lZWRDbGlwID8gXCJ1cmwoI2NsaXBQYXRoLVwiLmNvbmNhdChjbGlwRG90ID8gJycgOiAnZG90cy0nKS5jb25jYXQoY2xpcFBhdGhJZCwgXCIpXCIpIDogdW5kZWZpbmVkXG4gIH07XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwgX2V4dGVuZHMoe1xuICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1hcmVhLWRvdHNcIlxuICB9LCBkb3RzUHJvcHMpLCBkb3RzKTtcbn1cbmZ1bmN0aW9uIEFyZWFMYWJlbExpc3RQcm92aWRlcihfcmVmMikge1xuICB2YXIge1xuICAgIHNob3dMYWJlbHMsXG4gICAgY2hpbGRyZW4sXG4gICAgcG9pbnRzXG4gIH0gPSBfcmVmMjtcbiAgdmFyIGxhYmVsTGlzdEVudHJpZXMgPSBwb2ludHMubWFwKHBvaW50ID0+IHtcbiAgICB2YXIgdmlld0JveCA9IHtcbiAgICAgIHg6IHBvaW50LngsXG4gICAgICB5OiBwb2ludC55LFxuICAgICAgd2lkdGg6IDAsXG4gICAgICBoZWlnaHQ6IDBcbiAgICB9O1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIHZpZXdCb3gpLCB7fSwge1xuICAgICAgdmFsdWU6IHBvaW50LnZhbHVlLFxuICAgICAgcGF5bG9hZDogcG9pbnQucGF5bG9hZCxcbiAgICAgIHBhcmVudFZpZXdCb3g6IHVuZGVmaW5lZCxcbiAgICAgIHZpZXdCb3gsXG4gICAgICBmaWxsOiB1bmRlZmluZWRcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChDYXJ0ZXNpYW5MYWJlbExpc3RDb250ZXh0UHJvdmlkZXIsIHtcbiAgICB2YWx1ZTogc2hvd0xhYmVscyA/IGxhYmVsTGlzdEVudHJpZXMgOiBudWxsXG4gIH0sIGNoaWxkcmVuKTtcbn1cbmZ1bmN0aW9uIFN0YXRpY0FyZWEoX3JlZjMpIHtcbiAgdmFyIHtcbiAgICBwb2ludHMsXG4gICAgYmFzZUxpbmUsXG4gICAgbmVlZENsaXAsXG4gICAgY2xpcFBhdGhJZCxcbiAgICBwcm9wc1xuICB9ID0gX3JlZjM7XG4gIHZhciB7XG4gICAgbGF5b3V0LFxuICAgIHR5cGUsXG4gICAgc3Ryb2tlLFxuICAgIGNvbm5lY3ROdWxscyxcbiAgICBpc1JhbmdlXG4gIH0gPSBwcm9wcztcbiAgdmFyIHtcbiAgICAgIGlkXG4gICAgfSA9IHByb3BzLFxuICAgIHByb3BzV2l0aG91dElkID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKHByb3BzLCBfZXhjbHVkZWQpO1xuICB2YXIgYWxsT3RoZXJQcm9wcyA9IHN2Z1Byb3BlcnRpZXNOb0V2ZW50cyhwcm9wc1dpdGhvdXRJZCk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5GcmFnbWVudCwgbnVsbCwgKHBvaW50cyA9PT0gbnVsbCB8fCBwb2ludHMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHBvaW50cy5sZW5ndGgpID4gMSAmJiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwge1xuICAgIGNsaXBQYXRoOiBuZWVkQ2xpcCA/IFwidXJsKCNjbGlwUGF0aC1cIi5jb25jYXQoY2xpcFBhdGhJZCwgXCIpXCIpIDogdW5kZWZpbmVkXG4gIH0sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEN1cnZlLCBfZXh0ZW5kcyh7fSwgYWxsT3RoZXJQcm9wcywge1xuICAgIGlkOiBpZCxcbiAgICBwb2ludHM6IHBvaW50cyxcbiAgICBjb25uZWN0TnVsbHM6IGNvbm5lY3ROdWxscyxcbiAgICB0eXBlOiB0eXBlLFxuICAgIGJhc2VMaW5lOiBiYXNlTGluZSxcbiAgICBsYXlvdXQ6IGxheW91dCxcbiAgICBzdHJva2U6IFwibm9uZVwiLFxuICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1hcmVhLWFyZWFcIlxuICB9KSksIHN0cm9rZSAhPT0gJ25vbmUnICYmIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEN1cnZlLCBfZXh0ZW5kcyh7fSwgYWxsT3RoZXJQcm9wcywge1xuICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1hcmVhLWN1cnZlXCIsXG4gICAgbGF5b3V0OiBsYXlvdXQsXG4gICAgdHlwZTogdHlwZSxcbiAgICBjb25uZWN0TnVsbHM6IGNvbm5lY3ROdWxscyxcbiAgICBmaWxsOiBcIm5vbmVcIixcbiAgICBwb2ludHM6IHBvaW50c1xuICB9KSksIHN0cm9rZSAhPT0gJ25vbmUnICYmIGlzUmFuZ2UgJiYgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQ3VydmUsIF9leHRlbmRzKHt9LCBhbGxPdGhlclByb3BzLCB7XG4gICAgY2xhc3NOYW1lOiBcInJlY2hhcnRzLWFyZWEtY3VydmVcIixcbiAgICBsYXlvdXQ6IGxheW91dCxcbiAgICB0eXBlOiB0eXBlLFxuICAgIGNvbm5lY3ROdWxsczogY29ubmVjdE51bGxzLFxuICAgIGZpbGw6IFwibm9uZVwiLFxuICAgIHBvaW50czogYmFzZUxpbmVcbiAgfSkpKSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoRG90cywge1xuICAgIHBvaW50czogcG9pbnRzLFxuICAgIHByb3BzOiBwcm9wc1dpdGhvdXRJZCxcbiAgICBjbGlwUGF0aElkOiBjbGlwUGF0aElkXG4gIH0pKTtcbn1cbmZ1bmN0aW9uIFZlcnRpY2FsUmVjdChfcmVmNCkge1xuICB2YXIge1xuICAgIGFscGhhLFxuICAgIGJhc2VMaW5lLFxuICAgIHBvaW50cyxcbiAgICBzdHJva2VXaWR0aFxuICB9ID0gX3JlZjQ7XG4gIHZhciBzdGFydFkgPSBwb2ludHNbMF0ueTtcbiAgdmFyIGVuZFkgPSBwb2ludHNbcG9pbnRzLmxlbmd0aCAtIDFdLnk7XG4gIGlmICghaXNXZWxsQmVoYXZlZE51bWJlcihzdGFydFkpIHx8ICFpc1dlbGxCZWhhdmVkTnVtYmVyKGVuZFkpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIGhlaWdodCA9IGFscGhhICogTWF0aC5hYnMoc3RhcnRZIC0gZW5kWSk7XG4gIHZhciBtYXhYID0gTWF0aC5tYXgoLi4ucG9pbnRzLm1hcChlbnRyeSA9PiBlbnRyeS54IHx8IDApKTtcbiAgaWYgKGlzTnVtYmVyKGJhc2VMaW5lKSkge1xuICAgIG1heFggPSBNYXRoLm1heChiYXNlTGluZSwgbWF4WCk7XG4gIH0gZWxzZSBpZiAoYmFzZUxpbmUgJiYgQXJyYXkuaXNBcnJheShiYXNlTGluZSkgJiYgYmFzZUxpbmUubGVuZ3RoKSB7XG4gICAgbWF4WCA9IE1hdGgubWF4KC4uLmJhc2VMaW5lLm1hcChlbnRyeSA9PiBlbnRyeS54IHx8IDApLCBtYXhYKTtcbiAgfVxuICBpZiAoaXNOdW1iZXIobWF4WCkpIHtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJyZWN0XCIsIHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiBzdGFydFkgPCBlbmRZID8gc3RhcnRZIDogc3RhcnRZIC0gaGVpZ2h0LFxuICAgICAgd2lkdGg6IG1heFggKyAoc3Ryb2tlV2lkdGggPyBwYXJzZUludChcIlwiLmNvbmNhdChzdHJva2VXaWR0aCksIDEwKSA6IDEpLFxuICAgICAgaGVpZ2h0OiBNYXRoLmZsb29yKGhlaWdodClcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cbmZ1bmN0aW9uIEhvcml6b250YWxSZWN0KF9yZWY1KSB7XG4gIHZhciB7XG4gICAgYWxwaGEsXG4gICAgYmFzZUxpbmUsXG4gICAgcG9pbnRzLFxuICAgIHN0cm9rZVdpZHRoXG4gIH0gPSBfcmVmNTtcbiAgdmFyIHN0YXJ0WCA9IHBvaW50c1swXS54O1xuICB2YXIgZW5kWCA9IHBvaW50c1twb2ludHMubGVuZ3RoIC0gMV0ueDtcbiAgaWYgKCFpc1dlbGxCZWhhdmVkTnVtYmVyKHN0YXJ0WCkgfHwgIWlzV2VsbEJlaGF2ZWROdW1iZXIoZW5kWCkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgd2lkdGggPSBhbHBoYSAqIE1hdGguYWJzKHN0YXJ0WCAtIGVuZFgpO1xuICB2YXIgbWF4WSA9IE1hdGgubWF4KC4uLnBvaW50cy5tYXAoZW50cnkgPT4gZW50cnkueSB8fCAwKSk7XG4gIGlmIChpc051bWJlcihiYXNlTGluZSkpIHtcbiAgICBtYXhZID0gTWF0aC5tYXgoYmFzZUxpbmUsIG1heFkpO1xuICB9IGVsc2UgaWYgKGJhc2VMaW5lICYmIEFycmF5LmlzQXJyYXkoYmFzZUxpbmUpICYmIGJhc2VMaW5lLmxlbmd0aCkge1xuICAgIG1heFkgPSBNYXRoLm1heCguLi5iYXNlTGluZS5tYXAoZW50cnkgPT4gZW50cnkueSB8fCAwKSwgbWF4WSk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKG1heFkpKSB7XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFwicmVjdFwiLCB7XG4gICAgICB4OiBzdGFydFggPCBlbmRYID8gc3RhcnRYIDogc3RhcnRYIC0gd2lkdGgsXG4gICAgICB5OiAwLFxuICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgaGVpZ2h0OiBNYXRoLmZsb29yKG1heFkgKyAoc3Ryb2tlV2lkdGggPyBwYXJzZUludChcIlwiLmNvbmNhdChzdHJva2VXaWR0aCksIDEwKSA6IDEpKVxuICAgIH0pO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuZnVuY3Rpb24gQ2xpcFJlY3QoX3JlZjYpIHtcbiAgdmFyIHtcbiAgICBhbHBoYSxcbiAgICBsYXlvdXQsXG4gICAgcG9pbnRzLFxuICAgIGJhc2VMaW5lLFxuICAgIHN0cm9rZVdpZHRoXG4gIH0gPSBfcmVmNjtcbiAgaWYgKGxheW91dCA9PT0gJ3ZlcnRpY2FsJykge1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChWZXJ0aWNhbFJlY3QsIHtcbiAgICAgIGFscGhhOiBhbHBoYSxcbiAgICAgIHBvaW50czogcG9pbnRzLFxuICAgICAgYmFzZUxpbmU6IGJhc2VMaW5lLFxuICAgICAgc3Ryb2tlV2lkdGg6IHN0cm9rZVdpZHRoXG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEhvcml6b250YWxSZWN0LCB7XG4gICAgYWxwaGE6IGFscGhhLFxuICAgIHBvaW50czogcG9pbnRzLFxuICAgIGJhc2VMaW5lOiBiYXNlTGluZSxcbiAgICBzdHJva2VXaWR0aDogc3Ryb2tlV2lkdGhcbiAgfSk7XG59XG5mdW5jdGlvbiBBcmVhV2l0aEFuaW1hdGlvbihfcmVmNykge1xuICB2YXIge1xuICAgIG5lZWRDbGlwLFxuICAgIGNsaXBQYXRoSWQsXG4gICAgcHJvcHMsXG4gICAgcHJldmlvdXNQb2ludHNSZWYsXG4gICAgcHJldmlvdXNCYXNlbGluZVJlZlxuICB9ID0gX3JlZjc7XG4gIHZhciB7XG4gICAgcG9pbnRzLFxuICAgIGJhc2VMaW5lLFxuICAgIGlzQW5pbWF0aW9uQWN0aXZlLFxuICAgIGFuaW1hdGlvbkJlZ2luLFxuICAgIGFuaW1hdGlvbkR1cmF0aW9uLFxuICAgIGFuaW1hdGlvbkVhc2luZyxcbiAgICBvbkFuaW1hdGlvblN0YXJ0LFxuICAgIG9uQW5pbWF0aW9uRW5kXG4gIH0gPSBwcm9wcztcbiAgdmFyIGFuaW1hdGlvbklkID0gdXNlQW5pbWF0aW9uSWQocHJvcHMsICdyZWNoYXJ0cy1hcmVhLScpO1xuICB2YXIgW2lzQW5pbWF0aW5nLCBzZXRJc0FuaW1hdGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIHZhciBzaG93TGFiZWxzID0gIWlzQW5pbWF0aW5nO1xuICB2YXIgaGFuZGxlQW5pbWF0aW9uRW5kID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmICh0eXBlb2Ygb25BbmltYXRpb25FbmQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG9uQW5pbWF0aW9uRW5kKCk7XG4gICAgfVxuICAgIHNldElzQW5pbWF0aW5nKGZhbHNlKTtcbiAgfSwgW29uQW5pbWF0aW9uRW5kXSk7XG4gIHZhciBoYW5kbGVBbmltYXRpb25TdGFydCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAodHlwZW9mIG9uQW5pbWF0aW9uU3RhcnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG9uQW5pbWF0aW9uU3RhcnQoKTtcbiAgICB9XG4gICAgc2V0SXNBbmltYXRpbmcodHJ1ZSk7XG4gIH0sIFtvbkFuaW1hdGlvblN0YXJ0XSk7XG4gIHZhciBwcmV2UG9pbnRzID0gcHJldmlvdXNQb2ludHNSZWYuY3VycmVudDtcbiAgdmFyIHByZXZCYXNlTGluZSA9IHByZXZpb3VzQmFzZWxpbmVSZWYuY3VycmVudDtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEFyZWFMYWJlbExpc3RQcm92aWRlciwge1xuICAgIHNob3dMYWJlbHM6IHNob3dMYWJlbHMsXG4gICAgcG9pbnRzOiBwb2ludHNcbiAgfSwgcHJvcHMuY2hpbGRyZW4sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEphdmFzY3JpcHRBbmltYXRlLCB7XG4gICAgYW5pbWF0aW9uSWQ6IGFuaW1hdGlvbklkLFxuICAgIGJlZ2luOiBhbmltYXRpb25CZWdpbixcbiAgICBkdXJhdGlvbjogYW5pbWF0aW9uRHVyYXRpb24sXG4gICAgaXNBY3RpdmU6IGlzQW5pbWF0aW9uQWN0aXZlLFxuICAgIGVhc2luZzogYW5pbWF0aW9uRWFzaW5nLFxuICAgIG9uQW5pbWF0aW9uRW5kOiBoYW5kbGVBbmltYXRpb25FbmQsXG4gICAgb25BbmltYXRpb25TdGFydDogaGFuZGxlQW5pbWF0aW9uU3RhcnQsXG4gICAga2V5OiBhbmltYXRpb25JZFxuICB9LCB0ID0+IHtcbiAgICBpZiAocHJldlBvaW50cykge1xuICAgICAgdmFyIHByZXZQb2ludHNEaWZmRmFjdG9yID0gcHJldlBvaW50cy5sZW5ndGggLyBwb2ludHMubGVuZ3RoO1xuICAgICAgdmFyIHN0ZXBQb2ludHMgPVxuICAgICAgLypcbiAgICAgICAqIEhlcmUgaXQgaXMgaW1wb3J0YW50IHRoYXQgYXQgdGhlIHZlcnkgZW5kIG9mIHRoZSBhbmltYXRpb24sIG9uIHRoZSBsYXN0IGZyYW1lLFxuICAgICAgICogd2UgcmVuZGVyIHRoZSBvcmlnaW5hbCBwb2ludHMgd2l0aG91dCBhbnkgaW50ZXJwb2xhdGlvbi5cbiAgICAgICAqIFRoaXMgaXMgbmVlZGVkIGJlY2F1c2UgdGhlIGNvZGUgYWJvdmUgaXMgY2hlY2tpbmcgZm9yIHJlZmVyZW5jZSBlcXVhbGl0eSB0byBkZWNpZGUgaWYgdGhlIGFuaW1hdGlvbiBzaG91bGQgcnVuXG4gICAgICAgKiBhbmQgaWYgd2UgY3JlYXRlIGEgbmV3IGFycmF5IGluc3RhbmNlIChldmVuIGlmIHRoZSBudW1iZXJzIHdlcmUgdGhlIHNhbWUpXG4gICAgICAgKiB0aGVuIHdlIHdvdWxkIGJyZWFrIGFuaW1hdGlvbnMuXG4gICAgICAgKi9cbiAgICAgIHQgPT09IDEgPyBwb2ludHMgOiBwb2ludHMubWFwKChlbnRyeSwgaW5kZXgpID0+IHtcbiAgICAgICAgdmFyIHByZXZQb2ludEluZGV4ID0gTWF0aC5mbG9vcihpbmRleCAqIHByZXZQb2ludHNEaWZmRmFjdG9yKTtcbiAgICAgICAgaWYgKHByZXZQb2ludHNbcHJldlBvaW50SW5kZXhdKSB7XG4gICAgICAgICAgdmFyIHByZXYgPSBwcmV2UG9pbnRzW3ByZXZQb2ludEluZGV4XTtcbiAgICAgICAgICByZXR1cm4gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBlbnRyeSksIHt9LCB7XG4gICAgICAgICAgICB4OiBpbnRlcnBvbGF0ZShwcmV2LngsIGVudHJ5LngsIHQpLFxuICAgICAgICAgICAgeTogaW50ZXJwb2xhdGUocHJldi55LCBlbnRyeS55LCB0KVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbnRyeTtcbiAgICAgIH0pO1xuICAgICAgdmFyIHN0ZXBCYXNlTGluZTtcbiAgICAgIGlmIChpc051bWJlcihiYXNlTGluZSkpIHtcbiAgICAgICAgc3RlcEJhc2VMaW5lID0gaW50ZXJwb2xhdGUocHJldkJhc2VMaW5lLCBiYXNlTGluZSwgdCk7XG4gICAgICB9IGVsc2UgaWYgKGlzTnVsbGlzaChiYXNlTGluZSkgfHwgaXNOYW4oYmFzZUxpbmUpKSB7XG4gICAgICAgIHN0ZXBCYXNlTGluZSA9IGludGVycG9sYXRlKHByZXZCYXNlTGluZSwgMCwgdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGVwQmFzZUxpbmUgPSBiYXNlTGluZS5tYXAoKGVudHJ5LCBpbmRleCkgPT4ge1xuICAgICAgICAgIHZhciBwcmV2UG9pbnRJbmRleCA9IE1hdGguZmxvb3IoaW5kZXggKiBwcmV2UG9pbnRzRGlmZkZhY3Rvcik7XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocHJldkJhc2VMaW5lKSAmJiBwcmV2QmFzZUxpbmVbcHJldlBvaW50SW5kZXhdKSB7XG4gICAgICAgICAgICB2YXIgcHJldiA9IHByZXZCYXNlTGluZVtwcmV2UG9pbnRJbmRleF07XG4gICAgICAgICAgICByZXR1cm4gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBlbnRyeSksIHt9LCB7XG4gICAgICAgICAgICAgIHg6IGludGVycG9sYXRlKHByZXYueCwgZW50cnkueCwgdCksXG4gICAgICAgICAgICAgIHk6IGludGVycG9sYXRlKHByZXYueSwgZW50cnkueSwgdClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZW50cnk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKHQgPiAwKSB7XG4gICAgICAgIC8qXG4gICAgICAgICAqIFdlIG5lZWQgdG8ga2VlcCB0aGUgcmVmcyBpbiB0aGUgcGFyZW50IGNvbXBvbmVudCBiZWNhdXNlIHdlIG5lZWQgdG8gcmVtZW1iZXIgdGhlIGxhc3Qgc2hhcGUgb2YgdGhlIGFuaW1hdGlvblxuICAgICAgICAgKiBldmVuIGlmIEFyZWFXaXRoQW5pbWF0aW9uIGlzIHVubW91bnRlZCBhcyB0aGF0IGhhcHBlbnMgd2hlbiBjaGFuZ2luZyBwcm9wcy5cbiAgICAgICAgICpcbiAgICAgICAgICogQW5kIHdlIG5lZWQgdG8gdXBkYXRlIHRoZSByZWZzIGhlcmUgYmVjYXVzZSBoZXJlIGlzIHdoZXJlIHRoZSBpbnRlcnBvbGF0aW9uIGlzIGNvbXB1dGVkLlxuICAgICAgICAgKiBFc2xpbnQgZG9lc24ndCBsaWtlIGNoYW5naW5nIGZ1bmN0aW9uIGFyZ3VtZW50cywgYnV0IHdlIG5lZWQgaXQgc28gaGVyZSBpcyBhbiBlc2xpbnQtZGlzYWJsZS5cbiAgICAgICAgICovXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgICAgICBwcmV2aW91c1BvaW50c1JlZi5jdXJyZW50ID0gc3RlcFBvaW50cztcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgICAgIHByZXZpb3VzQmFzZWxpbmVSZWYuY3VycmVudCA9IHN0ZXBCYXNlTGluZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTdGF0aWNBcmVhLCB7XG4gICAgICAgIHBvaW50czogc3RlcFBvaW50cyxcbiAgICAgICAgYmFzZUxpbmU6IHN0ZXBCYXNlTGluZSxcbiAgICAgICAgbmVlZENsaXA6IG5lZWRDbGlwLFxuICAgICAgICBjbGlwUGF0aElkOiBjbGlwUGF0aElkLFxuICAgICAgICBwcm9wczogcHJvcHNcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodCA+IDApIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgICAgcHJldmlvdXNQb2ludHNSZWYuY3VycmVudCA9IHBvaW50cztcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgICAgcHJldmlvdXNCYXNlbGluZVJlZi5jdXJyZW50ID0gYmFzZUxpbmU7XG4gICAgfVxuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwgbnVsbCwgaXNBbmltYXRpb25BY3RpdmUgJiYgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkZWZzXCIsIG51bGwsIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFwiY2xpcFBhdGhcIiwge1xuICAgICAgaWQ6IFwiYW5pbWF0aW9uQ2xpcFBhdGgtXCIuY29uY2F0KGNsaXBQYXRoSWQpXG4gICAgfSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQ2xpcFJlY3QsIHtcbiAgICAgIGFscGhhOiB0LFxuICAgICAgcG9pbnRzOiBwb2ludHMsXG4gICAgICBiYXNlTGluZTogYmFzZUxpbmUsXG4gICAgICBsYXlvdXQ6IHByb3BzLmxheW91dCxcbiAgICAgIHN0cm9rZVdpZHRoOiBwcm9wcy5zdHJva2VXaWR0aFxuICAgIH0pKSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExheWVyLCB7XG4gICAgICBjbGlwUGF0aDogXCJ1cmwoI2FuaW1hdGlvbkNsaXBQYXRoLVwiLmNvbmNhdChjbGlwUGF0aElkLCBcIilcIilcbiAgICB9LCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTdGF0aWNBcmVhLCB7XG4gICAgICBwb2ludHM6IHBvaW50cyxcbiAgICAgIGJhc2VMaW5lOiBiYXNlTGluZSxcbiAgICAgIG5lZWRDbGlwOiBuZWVkQ2xpcCxcbiAgICAgIGNsaXBQYXRoSWQ6IGNsaXBQYXRoSWQsXG4gICAgICBwcm9wczogcHJvcHNcbiAgICB9KSkpO1xuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGFiZWxMaXN0RnJvbUxhYmVsUHJvcCwge1xuICAgIGxhYmVsOiBwcm9wcy5sYWJlbFxuICB9KSk7XG59XG5cbi8qXG4gKiBUaGlzIGNvbXBvbmVudHMgZGVjaWRlcyBpZiB0aGUgYXJlYSBzaG91bGQgYmUgYW5pbWF0ZWQgb3Igbm90LlxuICogSXQgYWxzbyBob2xkcyB0aGUgc3RhdGUgb2YgdGhlIGFuaW1hdGlvbi5cbiAqL1xuZnVuY3Rpb24gUmVuZGVyQXJlYShfcmVmOCkge1xuICB2YXIge1xuICAgIG5lZWRDbGlwLFxuICAgIGNsaXBQYXRoSWQsXG4gICAgcHJvcHNcbiAgfSA9IF9yZWY4O1xuICAvKlxuICAgKiBUaGVzZSB0d28gbXVzdCBiZSByZWZzLCBub3Qgc3RhdGUhXG4gICAqIEJlY2F1c2Ugd2Ugd2FudCB0byBzdG9yZSB0aGUgbW9zdCByZWNlbnQgc2hhcGUgb2YgdGhlIGFuaW1hdGlvbiBpbiBjYXNlIHdlIGhhdmUgdG8gaW50ZXJydXB0IHRoZSBhbmltYXRpb247XG4gICAqIHRoYXQgaGFwcGVucyB3aGVuIHVzZXIgaW5pdGlhdGVzIGFub3RoZXIgYW5pbWF0aW9uIGJlZm9yZSB0aGUgY3VycmVudCBvbmUgZmluaXNoZXMuXG4gICAqXG4gICAqIElmIHRoaXMgd2FzIGEgdXNlU3RhdGUsIHRoZW4gZXZlcnkgc3RlcCBpbiB0aGUgYW5pbWF0aW9uIHdvdWxkIHRyaWdnZXIgYSByZS1yZW5kZXIuXG4gICAqIFNvLCB1c2VSZWYgaXQgaXMuXG4gICAqL1xuICB2YXIgcHJldmlvdXNQb2ludHNSZWYgPSB1c2VSZWYobnVsbCk7XG4gIHZhciBwcmV2aW91c0Jhc2VsaW5lUmVmID0gdXNlUmVmKCk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChBcmVhV2l0aEFuaW1hdGlvbiwge1xuICAgIG5lZWRDbGlwOiBuZWVkQ2xpcCxcbiAgICBjbGlwUGF0aElkOiBjbGlwUGF0aElkLFxuICAgIHByb3BzOiBwcm9wcyxcbiAgICBwcmV2aW91c1BvaW50c1JlZjogcHJldmlvdXNQb2ludHNSZWYsXG4gICAgcHJldmlvdXNCYXNlbGluZVJlZjogcHJldmlvdXNCYXNlbGluZVJlZlxuICB9KTtcbn1cbmNsYXNzIEFyZWFXaXRoU3RhdGUgZXh0ZW5kcyBQdXJlQ29tcG9uZW50IHtcbiAgcmVuZGVyKCkge1xuICAgIHZhciB7XG4gICAgICBoaWRlLFxuICAgICAgZG90LFxuICAgICAgcG9pbnRzLFxuICAgICAgY2xhc3NOYW1lLFxuICAgICAgdG9wLFxuICAgICAgbGVmdCxcbiAgICAgIG5lZWRDbGlwLFxuICAgICAgeEF4aXNJZCxcbiAgICAgIHlBeGlzSWQsXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIGlkLFxuICAgICAgYmFzZUxpbmVcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoaGlkZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHZhciBsYXllckNsYXNzID0gY2xzeCgncmVjaGFydHMtYXJlYScsIGNsYXNzTmFtZSk7XG4gICAgdmFyIGNsaXBQYXRoSWQgPSBpZDtcbiAgICB2YXIge1xuICAgICAgcixcbiAgICAgIHN0cm9rZVdpZHRoXG4gICAgfSA9IGdldFJhZGl1c0FuZFN0cm9rZVdpZHRoRnJvbURvdChkb3QpO1xuICAgIHZhciBjbGlwRG90ID0gaXNDbGlwRG90KGRvdCk7XG4gICAgdmFyIGRvdFNpemUgPSByICogMiArIHN0cm9rZVdpZHRoO1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5GcmFnbWVudCwgbnVsbCwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGF5ZXIsIHtcbiAgICAgIGNsYXNzTmFtZTogbGF5ZXJDbGFzc1xuICAgIH0sIG5lZWRDbGlwICYmIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFwiZGVmc1wiLCBudWxsLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChHcmFwaGljYWxJdGVtQ2xpcFBhdGgsIHtcbiAgICAgIGNsaXBQYXRoSWQ6IGNsaXBQYXRoSWQsXG4gICAgICB4QXhpc0lkOiB4QXhpc0lkLFxuICAgICAgeUF4aXNJZDogeUF4aXNJZFxuICAgIH0pLCAhY2xpcERvdCAmJiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcImNsaXBQYXRoXCIsIHtcbiAgICAgIGlkOiBcImNsaXBQYXRoLWRvdHMtXCIuY29uY2F0KGNsaXBQYXRoSWQpXG4gICAgfSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJyZWN0XCIsIHtcbiAgICAgIHg6IGxlZnQgLSBkb3RTaXplIC8gMixcbiAgICAgIHk6IHRvcCAtIGRvdFNpemUgLyAyLFxuICAgICAgd2lkdGg6IHdpZHRoICsgZG90U2l6ZSxcbiAgICAgIGhlaWdodDogaGVpZ2h0ICsgZG90U2l6ZVxuICAgIH0pKSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlbmRlckFyZWEsIHtcbiAgICAgIG5lZWRDbGlwOiBuZWVkQ2xpcCxcbiAgICAgIGNsaXBQYXRoSWQ6IGNsaXBQYXRoSWQsXG4gICAgICBwcm9wczogdGhpcy5wcm9wc1xuICAgIH0pKSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQWN0aXZlUG9pbnRzLCB7XG4gICAgICBwb2ludHM6IHBvaW50cyxcbiAgICAgIG1haW5Db2xvcjogZ2V0TGVnZW5kSXRlbUNvbG9yKHRoaXMucHJvcHMuc3Ryb2tlLCB0aGlzLnByb3BzLmZpbGwpLFxuICAgICAgaXRlbURhdGFLZXk6IHRoaXMucHJvcHMuZGF0YUtleSxcbiAgICAgIGFjdGl2ZURvdDogdGhpcy5wcm9wcy5hY3RpdmVEb3RcbiAgICB9KSwgdGhpcy5wcm9wcy5pc1JhbmdlICYmIEFycmF5LmlzQXJyYXkoYmFzZUxpbmUpICYmIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEFjdGl2ZVBvaW50cywge1xuICAgICAgcG9pbnRzOiBiYXNlTGluZSxcbiAgICAgIG1haW5Db2xvcjogZ2V0TGVnZW5kSXRlbUNvbG9yKHRoaXMucHJvcHMuc3Ryb2tlLCB0aGlzLnByb3BzLmZpbGwpLFxuICAgICAgaXRlbURhdGFLZXk6IHRoaXMucHJvcHMuZGF0YUtleSxcbiAgICAgIGFjdGl2ZURvdDogdGhpcy5wcm9wcy5hY3RpdmVEb3RcbiAgICB9KSk7XG4gIH1cbn1cbnZhciBkZWZhdWx0QXJlYVByb3BzID0ge1xuICBhY3RpdmVEb3Q6IHRydWUsXG4gIGFuaW1hdGlvbkJlZ2luOiAwLFxuICBhbmltYXRpb25EdXJhdGlvbjogMTUwMCxcbiAgYW5pbWF0aW9uRWFzaW5nOiAnZWFzZScsXG4gIGNvbm5lY3ROdWxsczogZmFsc2UsXG4gIGRvdDogZmFsc2UsXG4gIGZpbGw6ICcjMzE4MmJkJyxcbiAgZmlsbE9wYWNpdHk6IDAuNixcbiAgaGlkZTogZmFsc2UsXG4gIGlzQW5pbWF0aW9uQWN0aXZlOiAhR2xvYmFsLmlzU3NyLFxuICBsZWdlbmRUeXBlOiAnbGluZScsXG4gIHN0cm9rZTogJyMzMTgyYmQnLFxuICB4QXhpc0lkOiAwLFxuICB5QXhpc0lkOiAwXG59O1xuZnVuY3Rpb24gQXJlYUltcGwocHJvcHMpIHtcbiAgdmFyIF91c2VBcHBTZWxlY3RvcjtcbiAgdmFyIF9yZXNvbHZlRGVmYXVsdFByb3BzID0gcmVzb2x2ZURlZmF1bHRQcm9wcyhwcm9wcywgZGVmYXVsdEFyZWFQcm9wcyksXG4gICAge1xuICAgICAgYWN0aXZlRG90LFxuICAgICAgYW5pbWF0aW9uQmVnaW4sXG4gICAgICBhbmltYXRpb25EdXJhdGlvbixcbiAgICAgIGFuaW1hdGlvbkVhc2luZyxcbiAgICAgIGNvbm5lY3ROdWxscyxcbiAgICAgIGRvdCxcbiAgICAgIGZpbGwsXG4gICAgICBmaWxsT3BhY2l0eSxcbiAgICAgIGhpZGUsXG4gICAgICBpc0FuaW1hdGlvbkFjdGl2ZSxcbiAgICAgIGxlZ2VuZFR5cGUsXG4gICAgICBzdHJva2UsXG4gICAgICB4QXhpc0lkLFxuICAgICAgeUF4aXNJZFxuICAgIH0gPSBfcmVzb2x2ZURlZmF1bHRQcm9wcyxcbiAgICBldmVyeXRoaW5nRWxzZSA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhfcmVzb2x2ZURlZmF1bHRQcm9wcywgX2V4Y2x1ZGVkMik7XG4gIHZhciBsYXlvdXQgPSB1c2VDaGFydExheW91dCgpO1xuICB2YXIgY2hhcnROYW1lID0gdXNlQ2hhcnROYW1lKCk7XG4gIHZhciB7XG4gICAgbmVlZENsaXBcbiAgfSA9IHVzZU5lZWRzQ2xpcCh4QXhpc0lkLCB5QXhpc0lkKTtcbiAgdmFyIGlzUGFub3JhbWEgPSB1c2VJc1Bhbm9yYW1hKCk7XG4gIHZhciB7XG4gICAgcG9pbnRzLFxuICAgIGlzUmFuZ2UsXG4gICAgYmFzZUxpbmVcbiAgfSA9IChfdXNlQXBwU2VsZWN0b3IgPSB1c2VBcHBTZWxlY3RvcihzdGF0ZSA9PiBzZWxlY3RBcmVhKHN0YXRlLCB4QXhpc0lkLCB5QXhpc0lkLCBpc1Bhbm9yYW1hLCBwcm9wcy5pZCkpKSAhPT0gbnVsbCAmJiBfdXNlQXBwU2VsZWN0b3IgIT09IHZvaWQgMCA/IF91c2VBcHBTZWxlY3RvciA6IHt9O1xuICB2YXIgcGxvdEFyZWEgPSB1c2VQbG90QXJlYSgpO1xuICBpZiAobGF5b3V0ICE9PSAnaG9yaXpvbnRhbCcgJiYgbGF5b3V0ICE9PSAndmVydGljYWwnIHx8IHBsb3RBcmVhID09IG51bGwpIHtcbiAgICAvLyBDYW4ndCByZW5kZXIgQXJlYSBpbiBhbiB1bnN1cHBvcnRlZCBsYXlvdXRcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAoY2hhcnROYW1lICE9PSAnQXJlYUNoYXJ0JyAmJiBjaGFydE5hbWUgIT09ICdDb21wb3NlZENoYXJ0Jykge1xuICAgIC8vIFRoZXJlIGlzIG5vdGhpbmcgc3RvcHBpbmcgdXMgZnJvbSByZW5kZXJpbmcgQXJlYSBpbiBvdGhlciBjaGFydHMsIGV4Y2VwdCBmb3IgaGlzdG9yaWNhbCByZWFzb25zLiBEbyB3ZSB3YW50IHRvIGFsbG93IHRoYXQ/XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIHtcbiAgICBoZWlnaHQsXG4gICAgd2lkdGgsXG4gICAgeDogbGVmdCxcbiAgICB5OiB0b3BcbiAgfSA9IHBsb3RBcmVhO1xuICBpZiAoIXBvaW50cyB8fCAhcG9pbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChBcmVhV2l0aFN0YXRlLCBfZXh0ZW5kcyh7fSwgZXZlcnl0aGluZ0Vsc2UsIHtcbiAgICBhY3RpdmVEb3Q6IGFjdGl2ZURvdCxcbiAgICBhbmltYXRpb25CZWdpbjogYW5pbWF0aW9uQmVnaW4sXG4gICAgYW5pbWF0aW9uRHVyYXRpb246IGFuaW1hdGlvbkR1cmF0aW9uLFxuICAgIGFuaW1hdGlvbkVhc2luZzogYW5pbWF0aW9uRWFzaW5nLFxuICAgIGJhc2VMaW5lOiBiYXNlTGluZSxcbiAgICBjb25uZWN0TnVsbHM6IGNvbm5lY3ROdWxscyxcbiAgICBkb3Q6IGRvdCxcbiAgICBmaWxsOiBmaWxsLFxuICAgIGZpbGxPcGFjaXR5OiBmaWxsT3BhY2l0eSxcbiAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICBoaWRlOiBoaWRlLFxuICAgIGxheW91dDogbGF5b3V0LFxuICAgIGlzQW5pbWF0aW9uQWN0aXZlOiBpc0FuaW1hdGlvbkFjdGl2ZSxcbiAgICBpc1JhbmdlOiBpc1JhbmdlLFxuICAgIGxlZ2VuZFR5cGU6IGxlZ2VuZFR5cGUsXG4gICAgbmVlZENsaXA6IG5lZWRDbGlwLFxuICAgIHBvaW50czogcG9pbnRzLFxuICAgIHN0cm9rZTogc3Ryb2tlLFxuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBsZWZ0OiBsZWZ0LFxuICAgIHRvcDogdG9wLFxuICAgIHhBeGlzSWQ6IHhBeGlzSWQsXG4gICAgeUF4aXNJZDogeUF4aXNJZFxuICB9KSk7XG59XG5leHBvcnQgdmFyIGdldEJhc2VWYWx1ZSA9IChsYXlvdXQsIGNoYXJ0QmFzZVZhbHVlLCBpdGVtQmFzZVZhbHVlLCB4QXhpcywgeUF4aXMpID0+IHtcbiAgLy8gVGhlIGJhc2VWYWx1ZSBjYW4gYmUgZGVmaW5lZCBib3RoIG9uIHRoZSBBcmVhQ2hhcnQsIGFuZCBvbiB0aGUgQXJlYS5cbiAgLy8gVGhlIHZhbHVlIGZvciB0aGUgaXRlbSB0YWtlcyBwcmVjZWRlbmNlLlxuICB2YXIgYmFzZVZhbHVlID0gaXRlbUJhc2VWYWx1ZSAhPT0gbnVsbCAmJiBpdGVtQmFzZVZhbHVlICE9PSB2b2lkIDAgPyBpdGVtQmFzZVZhbHVlIDogY2hhcnRCYXNlVmFsdWU7XG4gIGlmIChpc051bWJlcihiYXNlVmFsdWUpKSB7XG4gICAgcmV0dXJuIGJhc2VWYWx1ZTtcbiAgfVxuICB2YXIgbnVtZXJpY0F4aXMgPSBsYXlvdXQgPT09ICdob3Jpem9udGFsJyA/IHlBeGlzIDogeEF4aXM7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgZDNzY2FsZSAuZG9tYWluKCkgcmV0dXJucyB1bmtub3duLCBNYXRoLm1heCBleHBlY3RzIG51bWJlclxuICB2YXIgZG9tYWluID0gbnVtZXJpY0F4aXMuc2NhbGUuZG9tYWluKCk7XG4gIGlmIChudW1lcmljQXhpcy50eXBlID09PSAnbnVtYmVyJykge1xuICAgIHZhciBkb21haW5NYXggPSBNYXRoLm1heChkb21haW5bMF0sIGRvbWFpblsxXSk7XG4gICAgdmFyIGRvbWFpbk1pbiA9IE1hdGgubWluKGRvbWFpblswXSwgZG9tYWluWzFdKTtcbiAgICBpZiAoYmFzZVZhbHVlID09PSAnZGF0YU1pbicpIHtcbiAgICAgIHJldHVybiBkb21haW5NaW47XG4gICAgfVxuICAgIGlmIChiYXNlVmFsdWUgPT09ICdkYXRhTWF4Jykge1xuICAgICAgcmV0dXJuIGRvbWFpbk1heDtcbiAgICB9XG4gICAgcmV0dXJuIGRvbWFpbk1heCA8IDAgPyBkb21haW5NYXggOiBNYXRoLm1heChNYXRoLm1pbihkb21haW5bMF0sIGRvbWFpblsxXSksIDApO1xuICB9XG4gIGlmIChiYXNlVmFsdWUgPT09ICdkYXRhTWluJykge1xuICAgIHJldHVybiBkb21haW5bMF07XG4gIH1cbiAgaWYgKGJhc2VWYWx1ZSA9PT0gJ2RhdGFNYXgnKSB7XG4gICAgcmV0dXJuIGRvbWFpblsxXTtcbiAgfVxuICByZXR1cm4gZG9tYWluWzBdO1xufTtcbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlQXJlYShfcmVmOSkge1xuICB2YXIge1xuICAgIGFyZWFTZXR0aW5nczoge1xuICAgICAgY29ubmVjdE51bGxzLFxuICAgICAgYmFzZVZhbHVlOiBpdGVtQmFzZVZhbHVlLFxuICAgICAgZGF0YUtleVxuICAgIH0sXG4gICAgc3RhY2tlZERhdGEsXG4gICAgbGF5b3V0LFxuICAgIGNoYXJ0QmFzZVZhbHVlLFxuICAgIHhBeGlzLFxuICAgIHlBeGlzLFxuICAgIGRpc3BsYXllZERhdGEsXG4gICAgZGF0YVN0YXJ0SW5kZXgsXG4gICAgeEF4aXNUaWNrcyxcbiAgICB5QXhpc1RpY2tzLFxuICAgIGJhbmRTaXplXG4gIH0gPSBfcmVmOTtcbiAgdmFyIGhhc1N0YWNrID0gc3RhY2tlZERhdGEgJiYgc3RhY2tlZERhdGEubGVuZ3RoO1xuICB2YXIgYmFzZVZhbHVlID0gZ2V0QmFzZVZhbHVlKGxheW91dCwgY2hhcnRCYXNlVmFsdWUsIGl0ZW1CYXNlVmFsdWUsIHhBeGlzLCB5QXhpcyk7XG4gIHZhciBpc0hvcml6b250YWxMYXlvdXQgPSBsYXlvdXQgPT09ICdob3Jpem9udGFsJztcbiAgdmFyIGlzUmFuZ2UgPSBmYWxzZTtcbiAgdmFyIHBvaW50cyA9IGRpc3BsYXllZERhdGEubWFwKChlbnRyeSwgaW5kZXgpID0+IHtcbiAgICB2YXIgdmFsdWU7XG4gICAgaWYgKGhhc1N0YWNrKSB7XG4gICAgICB2YWx1ZSA9IHN0YWNrZWREYXRhW2RhdGFTdGFydEluZGV4ICsgaW5kZXhdO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSA9IGdldFZhbHVlQnlEYXRhS2V5KGVudHJ5LCBkYXRhS2V5KTtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUgPSBbYmFzZVZhbHVlLCB2YWx1ZV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc1JhbmdlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIGlzQnJlYWtQb2ludCA9IHZhbHVlWzFdID09IG51bGwgfHwgaGFzU3RhY2sgJiYgIWNvbm5lY3ROdWxscyAmJiBnZXRWYWx1ZUJ5RGF0YUtleShlbnRyeSwgZGF0YUtleSkgPT0gbnVsbDtcbiAgICBpZiAoaXNIb3Jpem9udGFsTGF5b3V0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiBnZXRDYXRlQ29vcmRpbmF0ZU9mTGluZSh7XG4gICAgICAgICAgYXhpczogeEF4aXMsXG4gICAgICAgICAgdGlja3M6IHhBeGlzVGlja3MsXG4gICAgICAgICAgYmFuZFNpemUsXG4gICAgICAgICAgZW50cnksXG4gICAgICAgICAgaW5kZXhcbiAgICAgICAgfSksXG4gICAgICAgIHk6IGlzQnJlYWtQb2ludCA/IG51bGwgOiB5QXhpcy5zY2FsZSh2YWx1ZVsxXSksXG4gICAgICAgIHZhbHVlLFxuICAgICAgICBwYXlsb2FkOiBlbnRyeVxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IGlzQnJlYWtQb2ludCA/IG51bGwgOiB4QXhpcy5zY2FsZSh2YWx1ZVsxXSksXG4gICAgICB5OiBnZXRDYXRlQ29vcmRpbmF0ZU9mTGluZSh7XG4gICAgICAgIGF4aXM6IHlBeGlzLFxuICAgICAgICB0aWNrczogeUF4aXNUaWNrcyxcbiAgICAgICAgYmFuZFNpemUsXG4gICAgICAgIGVudHJ5LFxuICAgICAgICBpbmRleFxuICAgICAgfSksXG4gICAgICB2YWx1ZSxcbiAgICAgIHBheWxvYWQ6IGVudHJ5XG4gICAgfTtcbiAgfSk7XG4gIHZhciBiYXNlTGluZTtcbiAgaWYgKGhhc1N0YWNrIHx8IGlzUmFuZ2UpIHtcbiAgICBiYXNlTGluZSA9IHBvaW50cy5tYXAoZW50cnkgPT4ge1xuICAgICAgdmFyIHggPSBBcnJheS5pc0FycmF5KGVudHJ5LnZhbHVlKSA/IGVudHJ5LnZhbHVlWzBdIDogbnVsbDtcbiAgICAgIGlmIChpc0hvcml6b250YWxMYXlvdXQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB4OiBlbnRyeS54LFxuICAgICAgICAgIHk6IHggIT0gbnVsbCAmJiBlbnRyeS55ICE9IG51bGwgPyB5QXhpcy5zY2FsZSh4KSA6IG51bGwsXG4gICAgICAgICAgcGF5bG9hZDogZW50cnkucGF5bG9hZFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogeCAhPSBudWxsID8geEF4aXMuc2NhbGUoeCkgOiBudWxsLFxuICAgICAgICB5OiBlbnRyeS55LFxuICAgICAgICBwYXlsb2FkOiBlbnRyeS5wYXlsb2FkXG4gICAgICB9O1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGJhc2VMaW5lID0gaXNIb3Jpem9udGFsTGF5b3V0ID8geUF4aXMuc2NhbGUoYmFzZVZhbHVlKSA6IHhBeGlzLnNjYWxlKGJhc2VWYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBwb2ludHMsXG4gICAgYmFzZUxpbmUsXG4gICAgaXNSYW5nZVxuICB9O1xufVxuZnVuY3Rpb24gQXJlYUZuKG91dHNpZGVQcm9wcykge1xuICB2YXIgcHJvcHMgPSByZXNvbHZlRGVmYXVsdFByb3BzKG91dHNpZGVQcm9wcywgZGVmYXVsdEFyZWFQcm9wcyk7XG4gIHZhciBpc1Bhbm9yYW1hID0gdXNlSXNQYW5vcmFtYSgpO1xuICAvLyBSZXBvcnQgYWxsIHByb3BzIHRvIFJlZHV4IHN0b3JlIGZpcnN0LCBiZWZvcmUgY2FsbGluZyBhbnkgaG9va3MsIHRvIGF2b2lkIGNpcmN1bGFyIGRlcGVuZGVuY2llcy5cbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlZ2lzdGVyR3JhcGhpY2FsSXRlbUlkLCB7XG4gICAgaWQ6IHByb3BzLmlkLFxuICAgIHR5cGU6IFwiYXJlYVwiXG4gIH0sIGlkID0+IC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkZyYWdtZW50LCBudWxsLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTZXRMZWdlbmRQYXlsb2FkLCB7XG4gICAgbGVnZW5kUGF5bG9hZDogY29tcHV0ZUxlZ2VuZFBheWxvYWRGcm9tQXJlYURhdGEocHJvcHMpXG4gIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTZXRUb29sdGlwRW50cnlTZXR0aW5ncywge1xuICAgIGZuOiBnZXRUb29sdGlwRW50cnlTZXR0aW5ncyxcbiAgICBhcmdzOiBwcm9wc1xuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2V0Q2FydGVzaWFuR3JhcGhpY2FsSXRlbSwge1xuICAgIHR5cGU6IFwiYXJlYVwiLFxuICAgIGlkOiBpZCxcbiAgICBkYXRhOiBwcm9wcy5kYXRhLFxuICAgIGRhdGFLZXk6IHByb3BzLmRhdGFLZXksXG4gICAgeEF4aXNJZDogcHJvcHMueEF4aXNJZCxcbiAgICB5QXhpc0lkOiBwcm9wcy55QXhpc0lkLFxuICAgIHpBeGlzSWQ6IDAsXG4gICAgc3RhY2tJZDogZ2V0Tm9ybWFsaXplZFN0YWNrSWQocHJvcHMuc3RhY2tJZCksXG4gICAgaGlkZTogcHJvcHMuaGlkZSxcbiAgICBiYXJTaXplOiB1bmRlZmluZWQsXG4gICAgYmFzZVZhbHVlOiBwcm9wcy5iYXNlVmFsdWUsXG4gICAgaXNQYW5vcmFtYTogaXNQYW5vcmFtYSxcbiAgICBjb25uZWN0TnVsbHM6IHByb3BzLmNvbm5lY3ROdWxsc1xuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQXJlYUltcGwsIF9leHRlbmRzKHt9LCBwcm9wcywge1xuICAgIGlkOiBpZFxuICB9KSkpKTtcbn1cbmV4cG9ydCB2YXIgQXJlYSA9IC8qI19fUFVSRV9fKi9SZWFjdC5tZW1vKEFyZWFGbik7XG5BcmVhLmRpc3BsYXlOYW1lID0gJ0FyZWEnOyIsIi8qXG4gKiBDb3B5cmlnaHQgMjAyMyBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyBsZXQgJGY0ZTJkZjZiZDE1Zjg1NjkkdmFyJF90YWJsZU5lc3RlZFJvd3MgPSBmYWxzZTtcbmxldCAkZjRlMmRmNmJkMTVmODU2OSR2YXIkX3NoYWRvd0RPTSA9IGZhbHNlO1xuZnVuY3Rpb24gJGY0ZTJkZjZiZDE1Zjg1NjkkZXhwb3J0JGQ5ZDhhMGY4MmRlNDk1MzAoKSB7XG4gICAgJGY0ZTJkZjZiZDE1Zjg1NjkkdmFyJF90YWJsZU5lc3RlZFJvd3MgPSB0cnVlO1xufVxuZnVuY3Rpb24gJGY0ZTJkZjZiZDE1Zjg1NjkkZXhwb3J0JDFiMDBjYjE0YTk2MTk0ZTYoKSB7XG4gICAgcmV0dXJuICRmNGUyZGY2YmQxNWY4NTY5JHZhciRfdGFibGVOZXN0ZWRSb3dzO1xufVxuZnVuY3Rpb24gJGY0ZTJkZjZiZDE1Zjg1NjkkZXhwb3J0JDEyYjE1MWQ5ODgyZTk5ODUoKSB7XG4gICAgJGY0ZTJkZjZiZDE1Zjg1NjkkdmFyJF9zaGFkb3dET00gPSB0cnVlO1xufVxuZnVuY3Rpb24gJGY0ZTJkZjZiZDE1Zjg1NjkkZXhwb3J0JDk4NjU4ZThjNTkxMjVlNmEoKSB7XG4gICAgcmV0dXJuICRmNGUyZGY2YmQxNWY4NTY5JHZhciRfc2hhZG93RE9NO1xufVxuXG5cbmV4cG9ydCB7JGY0ZTJkZjZiZDE1Zjg1NjkkZXhwb3J0JGQ5ZDhhMGY4MmRlNDk1MzAgYXMgZW5hYmxlVGFibGVOZXN0ZWRSb3dzLCAkZjRlMmRmNmJkMTVmODU2OSRleHBvcnQkMWIwMGNiMTRhOTYxOTRlNiBhcyB0YWJsZU5lc3RlZFJvd3MsICRmNGUyZGY2YmQxNWY4NTY5JGV4cG9ydCQxMmIxNTFkOTg4MmU5OTg1IGFzIGVuYWJsZVNoYWRvd0RPTSwgJGY0ZTJkZjZiZDE1Zjg1NjkkZXhwb3J0JDk4NjU4ZThjNTkxMjVlNmEgYXMgc2hhZG93RE9NfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCB7IHVzZUNhbGxiYWNrLCB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBub29wIH0gZnJvbSAnZXMtdG9vbGtpdCc7XG5pbXBvcnQgeyByZXNvbHZlRGVmYXVsdFByb3BzIH0gZnJvbSAnLi4vdXRpbC9yZXNvbHZlRGVmYXVsdFByb3BzJztcbmltcG9ydCB7IHVzZUFuaW1hdGlvbk1hbmFnZXIgfSBmcm9tICcuL3VzZUFuaW1hdGlvbk1hbmFnZXInO1xuaW1wb3J0IHsgZ2V0VHJhbnNpdGlvblZhbCB9IGZyb20gJy4vdXRpbCc7XG52YXIgZGVmYXVsdFByb3BzID0ge1xuICBiZWdpbjogMCxcbiAgZHVyYXRpb246IDEwMDAsXG4gIGVhc2luZzogJ2Vhc2UnLFxuICBpc0FjdGl2ZTogdHJ1ZSxcbiAgY2FuQmVnaW46IHRydWUsXG4gIG9uQW5pbWF0aW9uRW5kOiAoKSA9PiB7fSxcbiAgb25BbmltYXRpb25TdGFydDogKCkgPT4ge31cbn07XG5leHBvcnQgZnVuY3Rpb24gQ1NTVHJhbnNpdGlvbkFuaW1hdGUob3V0c2lkZVByb3BzKSB7XG4gIHZhciBwcm9wcyA9IHJlc29sdmVEZWZhdWx0UHJvcHMob3V0c2lkZVByb3BzLCBkZWZhdWx0UHJvcHMpO1xuICB2YXIge1xuICAgIGFuaW1hdGlvbklkLFxuICAgIGZyb20sXG4gICAgdG8sXG4gICAgYXR0cmlidXRlTmFtZSxcbiAgICBpc0FjdGl2ZSxcbiAgICBjYW5CZWdpbixcbiAgICBkdXJhdGlvbixcbiAgICBlYXNpbmcsXG4gICAgYmVnaW4sXG4gICAgb25BbmltYXRpb25FbmQsXG4gICAgb25BbmltYXRpb25TdGFydDogb25BbmltYXRpb25TdGFydEZyb21Qcm9wcyxcbiAgICBjaGlsZHJlblxuICB9ID0gcHJvcHM7XG4gIHZhciBhbmltYXRpb25NYW5hZ2VyID0gdXNlQW5pbWF0aW9uTWFuYWdlcihhbmltYXRpb25JZCArIGF0dHJpYnV0ZU5hbWUsIHByb3BzLmFuaW1hdGlvbk1hbmFnZXIpO1xuICB2YXIgW3N0eWxlLCBzZXRTdHlsZV0gPSB1c2VTdGF0ZSgoKSA9PiB7XG4gICAgaWYgKCFpc0FjdGl2ZSkge1xuICAgICAgcmV0dXJuIHRvO1xuICAgIH1cbiAgICByZXR1cm4gZnJvbTtcbiAgfSk7XG4gIHZhciBpbml0aWFsaXplZCA9IHVzZVJlZihmYWxzZSk7XG4gIHZhciBvbkFuaW1hdGlvblN0YXJ0ID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFN0eWxlKGZyb20pO1xuICAgIG9uQW5pbWF0aW9uU3RhcnRGcm9tUHJvcHMoKTtcbiAgfSwgW2Zyb20sIG9uQW5pbWF0aW9uU3RhcnRGcm9tUHJvcHNdKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWlzQWN0aXZlIHx8ICFjYW5CZWdpbikge1xuICAgICAgcmV0dXJuIG5vb3A7XG4gICAgfVxuICAgIGluaXRpYWxpemVkLmN1cnJlbnQgPSB0cnVlO1xuICAgIHZhciB1bnN1YnNjcmliZSA9IGFuaW1hdGlvbk1hbmFnZXIuc3Vic2NyaWJlKHNldFN0eWxlKTtcbiAgICBhbmltYXRpb25NYW5hZ2VyLnN0YXJ0KFtvbkFuaW1hdGlvblN0YXJ0LCBiZWdpbiwgdG8sIGR1cmF0aW9uLCBvbkFuaW1hdGlvbkVuZF0pO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBhbmltYXRpb25NYW5hZ2VyLnN0b3AoKTtcbiAgICAgIGlmICh1bnN1YnNjcmliZSkge1xuICAgICAgICB1bnN1YnNjcmliZSgpO1xuICAgICAgfVxuICAgICAgb25BbmltYXRpb25FbmQoKTtcbiAgICB9O1xuICB9LCBbaXNBY3RpdmUsIGNhbkJlZ2luLCBkdXJhdGlvbiwgZWFzaW5nLCBiZWdpbiwgb25BbmltYXRpb25TdGFydCwgb25BbmltYXRpb25FbmQsIGFuaW1hdGlvbk1hbmFnZXIsIHRvLCBmcm9tXSk7XG4gIGlmICghaXNBY3RpdmUpIHtcbiAgICAvKlxuICAgICAqIFdpdGggaXNBY3RpdmU9ZmFsc2UsIHRoZSBjb21wb25lbnQgYWx3YXlzIHJlbmRlcnMgd2l0aCB0aGUgZmluYWwgc3R5bGUsIGltbWVkaWF0ZWx5LFxuICAgICAqIGFuZCBpZ25vcmVzIGFsbCBvdGhlciBwcm9wcy5cbiAgICAgKiBBbHNvIHRoZXJlIGlzIG5vIHRyYW5zaXRpb24gYXBwbGllZC5cbiAgICAgKi9cbiAgICByZXR1cm4gY2hpbGRyZW4oe1xuICAgICAgW2F0dHJpYnV0ZU5hbWVdOiB0b1xuICAgIH0pO1xuICB9XG4gIGlmICghY2FuQmVnaW4pIHtcbiAgICByZXR1cm4gY2hpbGRyZW4oe1xuICAgICAgW2F0dHJpYnV0ZU5hbWVdOiBmcm9tXG4gICAgfSk7XG4gIH1cbiAgaWYgKGluaXRpYWxpemVkLmN1cnJlbnQpIHtcbiAgICB2YXIgdHJhbnNpdGlvbiA9IGdldFRyYW5zaXRpb25WYWwoW2F0dHJpYnV0ZU5hbWVdLCBkdXJhdGlvbiwgZWFzaW5nKTtcbiAgICByZXR1cm4gY2hpbGRyZW4oe1xuICAgICAgdHJhbnNpdGlvbixcbiAgICAgIFthdHRyaWJ1dGVOYW1lXTogc3R5bGVcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gY2hpbGRyZW4oe1xuICAgIFthdHRyaWJ1dGVOYW1lXTogZnJvbVxuICB9KTtcbn0iLCJ2YXIgX2V4Y2x1ZGVkID0gW1wiYXhpc0xpbmVcIiwgXCJ3aWR0aFwiLCBcImhlaWdodFwiLCBcImNsYXNzTmFtZVwiLCBcImhpZGVcIiwgXCJ0aWNrc1wiXSxcbiAgX2V4Y2x1ZGVkMiA9IFtcInZpZXdCb3hcIl0sXG4gIF9leGNsdWRlZDMgPSBbXCJ2aWV3Qm94XCJdO1xuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKGUsIHQpIHsgaWYgKG51bGwgPT0gZSkgcmV0dXJuIHt9OyB2YXIgbywgciwgaSA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKGUsIHQpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IGZvciAociA9IDA7IHIgPCBuLmxlbmd0aDsgcisrKSBvID0gbltyXSwgLTEgPT09IHQuaW5kZXhPZihvKSAmJiB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKGUsIG8pICYmIChpW29dID0gZVtvXSk7IH0gcmV0dXJuIGk7IH1cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKHIsIGUpIHsgaWYgKG51bGwgPT0gcikgcmV0dXJuIHt9OyB2YXIgdCA9IHt9OyBmb3IgKHZhciBuIGluIHIpIGlmICh7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHIsIG4pKSB7IGlmICgtMSAhPT0gZS5pbmRleE9mKG4pKSBjb250aW51ZTsgdFtuXSA9IHJbbl07IH0gcmV0dXJuIHQ7IH1cbmZ1bmN0aW9uIF9leHRlbmRzKCkgeyByZXR1cm4gX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduID8gT2JqZWN0LmFzc2lnbi5iaW5kKCkgOiBmdW5jdGlvbiAobikgeyBmb3IgKHZhciBlID0gMTsgZSA8IGFyZ3VtZW50cy5sZW5ndGg7IGUrKykgeyB2YXIgdCA9IGFyZ3VtZW50c1tlXTsgZm9yICh2YXIgciBpbiB0KSAoe30pLmhhc093blByb3BlcnR5LmNhbGwodCwgcikgJiYgKG5bcl0gPSB0W3JdKTsgfSByZXR1cm4gbjsgfSwgX2V4dGVuZHMuYXBwbHkobnVsbCwgYXJndW1lbnRzKTsgfVxuZnVuY3Rpb24gb3duS2V5cyhlLCByKSB7IHZhciB0ID0gT2JqZWN0LmtleXMoZSk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBvID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhlKTsgciAmJiAobyA9IG8uZmlsdGVyKGZ1bmN0aW9uIChyKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGUsIHIpLmVudW1lcmFibGU7IH0pKSwgdC5wdXNoLmFwcGx5KHQsIG8pOyB9IHJldHVybiB0OyB9XG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKGUpIHsgZm9yICh2YXIgciA9IDE7IHIgPCBhcmd1bWVudHMubGVuZ3RoOyByKyspIHsgdmFyIHQgPSBudWxsICE9IGFyZ3VtZW50c1tyXSA/IGFyZ3VtZW50c1tyXSA6IHt9OyByICUgMiA/IG93bktleXMoT2JqZWN0KHQpLCAhMCkuZm9yRWFjaChmdW5jdGlvbiAocikgeyBfZGVmaW5lUHJvcGVydHkoZSwgciwgdFtyXSk7IH0pIDogT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhlLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyh0KSkgOiBvd25LZXlzKE9iamVjdCh0KSkuZm9yRWFjaChmdW5jdGlvbiAocikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0LCByKSk7IH0pOyB9IHJldHVybiBlOyB9XG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkoZSwgciwgdCkgeyByZXR1cm4gKHIgPSBfdG9Qcm9wZXJ0eUtleShyKSkgaW4gZSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCB7IHZhbHVlOiB0LCBlbnVtZXJhYmxlOiAhMCwgY29uZmlndXJhYmxlOiAhMCwgd3JpdGFibGU6ICEwIH0pIDogZVtyXSA9IHQsIGU7IH1cbmZ1bmN0aW9uIF90b1Byb3BlcnR5S2V5KHQpIHsgdmFyIGkgPSBfdG9QcmltaXRpdmUodCwgXCJzdHJpbmdcIik7IHJldHVybiBcInN5bWJvbFwiID09IHR5cGVvZiBpID8gaSA6IGkgKyBcIlwiOyB9XG5mdW5jdGlvbiBfdG9QcmltaXRpdmUodCwgcikgeyBpZiAoXCJvYmplY3RcIiAhPSB0eXBlb2YgdCB8fCAhdCkgcmV0dXJuIHQ7IHZhciBlID0gdFtTeW1ib2wudG9QcmltaXRpdmVdOyBpZiAodm9pZCAwICE9PSBlKSB7IHZhciBpID0gZS5jYWxsKHQsIHIgfHwgXCJkZWZhdWx0XCIpOyBpZiAoXCJvYmplY3RcIiAhPSB0eXBlb2YgaSkgcmV0dXJuIGk7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJAQHRvUHJpbWl0aXZlIG11c3QgcmV0dXJuIGEgcHJpbWl0aXZlIHZhbHVlLlwiKTsgfSByZXR1cm4gKFwic3RyaW5nXCIgPT09IHIgPyBTdHJpbmcgOiBOdW1iZXIpKHQpOyB9XG4vKipcbiAqIEBmaWxlT3ZlcnZpZXcgQ2FydGVzaWFuIEF4aXNcbiAqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZVJlZiwgdXNlQ2FsbGJhY2ssIGZvcndhcmRSZWYsIHVzZUltcGVyYXRpdmVIYW5kbGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgZ2V0IGZyb20gJ2VzLXRvb2xraXQvY29tcGF0L2dldCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBzaGFsbG93RXF1YWwgfSBmcm9tICcuLi91dGlsL1NoYWxsb3dFcXVhbCc7XG5pbXBvcnQgeyBMYXllciB9IGZyb20gJy4uL2NvbnRhaW5lci9MYXllcic7XG5pbXBvcnQgeyBUZXh0IH0gZnJvbSAnLi4vY29tcG9uZW50L1RleHQnO1xuaW1wb3J0IHsgQ2FydGVzaWFuTGFiZWxDb250ZXh0UHJvdmlkZXIsIENhcnRlc2lhbkxhYmVsRnJvbUxhYmVsUHJvcCB9IGZyb20gJy4uL2NvbXBvbmVudC9MYWJlbCc7XG5pbXBvcnQgeyBpc051bWJlciB9IGZyb20gJy4uL3V0aWwvRGF0YVV0aWxzJztcbmltcG9ydCB7IGFkYXB0RXZlbnRzT2ZDaGlsZCB9IGZyb20gJy4uL3V0aWwvdHlwZXMnO1xuaW1wb3J0IHsgZ2V0VGlja3MgfSBmcm9tICcuL2dldFRpY2tzJztcbmltcG9ydCB7IHN2Z1Byb3BlcnRpZXNOb0V2ZW50cywgc3ZnUHJvcGVydGllc05vRXZlbnRzRnJvbVVua25vd24gfSBmcm9tICcuLi91dGlsL3N2Z1Byb3BlcnRpZXNOb0V2ZW50cyc7XG5pbXBvcnQgeyBnZXRDYWxjdWxhdGVkWUF4aXNXaWR0aCB9IGZyb20gJy4uL3V0aWwvWUF4aXNVdGlscyc7XG5pbXBvcnQgeyByZXNvbHZlRGVmYXVsdFByb3BzIH0gZnJvbSAnLi4vdXRpbC9yZXNvbHZlRGVmYXVsdFByb3BzJztcblxuLyoqIFRoZSBvcmllbnRhdGlvbiBvZiB0aGUgYXhpcyBpbiBjb3JyZXNwb25kZW5jZSB0byB0aGUgY2hhcnQgKi9cblxuLyoqIEEgdW5pdCB0byBiZSBhcHBlbmRlZCB0byBhIHZhbHVlICovXG5cbi8qKiBUaGUgZm9ybWF0dGVyIGZ1bmN0aW9uIG9mIHRpY2sgKi9cblxuZXhwb3J0IHZhciBkZWZhdWx0Q2FydGVzaWFuQXhpc1Byb3BzID0ge1xuICB4OiAwLFxuICB5OiAwLFxuICB3aWR0aDogMCxcbiAgaGVpZ2h0OiAwLFxuICB2aWV3Qm94OiB7XG4gICAgeDogMCxcbiAgICB5OiAwLFxuICAgIHdpZHRoOiAwLFxuICAgIGhlaWdodDogMFxuICB9LFxuICAvLyBUaGUgb3JpZW50YXRpb24gb2YgYXhpc1xuICBvcmllbnRhdGlvbjogJ2JvdHRvbScsXG4gIC8vIFRoZSB0aWNrc1xuICB0aWNrczogW10sXG4gIHN0cm9rZTogJyM2NjYnLFxuICB0aWNrTGluZTogdHJ1ZSxcbiAgYXhpc0xpbmU6IHRydWUsXG4gIHRpY2s6IHRydWUsXG4gIG1pcnJvcjogZmFsc2UsXG4gIG1pblRpY2tHYXA6IDUsXG4gIC8vIFRoZSB3aWR0aCBvciBoZWlnaHQgb2YgdGlja1xuICB0aWNrU2l6ZTogNixcbiAgdGlja01hcmdpbjogMixcbiAgaW50ZXJ2YWw6ICdwcmVzZXJ2ZUVuZCdcbn07XG5cbi8qXG4gKiBgdmlld0JveGAgYW5kIGBzY2FsZWAgYXJlIFNWRyBhdHRyaWJ1dGVzLlxuICogUmVjaGFydHMgaG93ZXZlciAtIHVuZm9ydHVuYXRlbHkgLSBoYXMgaXRzIG93biBhdHRyaWJ1dGVzIG5hbWVkIGB2aWV3Qm94YCBhbmQgYHNjYWxlYFxuICogdGhhdCBhcmUgY29tcGxldGVseSBkaWZmZXJlbnQgZGF0YSBzaGFwZSBhbmQgZGlmZmVyZW50IHB1cnBvc2UuXG4gKi9cblxuZnVuY3Rpb24gQXhpc0xpbmUoYXhpc0xpbmVQcm9wcykge1xuICB2YXIge1xuICAgIHgsXG4gICAgeSxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgb3JpZW50YXRpb24sXG4gICAgbWlycm9yLFxuICAgIGF4aXNMaW5lLFxuICAgIG90aGVyU3ZnUHJvcHNcbiAgfSA9IGF4aXNMaW5lUHJvcHM7XG4gIGlmICghYXhpc0xpbmUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgcHJvcHMgPSBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgb3RoZXJTdmdQcm9wcyksIHN2Z1Byb3BlcnRpZXNOb0V2ZW50cyhheGlzTGluZSkpLCB7fSwge1xuICAgIGZpbGw6ICdub25lJ1xuICB9KTtcbiAgaWYgKG9yaWVudGF0aW9uID09PSAndG9wJyB8fCBvcmllbnRhdGlvbiA9PT0gJ2JvdHRvbScpIHtcbiAgICB2YXIgbmVlZEhlaWdodCA9ICsob3JpZW50YXRpb24gPT09ICd0b3AnICYmICFtaXJyb3IgfHwgb3JpZW50YXRpb24gPT09ICdib3R0b20nICYmIG1pcnJvcik7XG4gICAgcHJvcHMgPSBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIHByb3BzKSwge30sIHtcbiAgICAgIHgxOiB4LFxuICAgICAgeTE6IHkgKyBuZWVkSGVpZ2h0ICogaGVpZ2h0LFxuICAgICAgeDI6IHggKyB3aWR0aCxcbiAgICAgIHkyOiB5ICsgbmVlZEhlaWdodCAqIGhlaWdodFxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHZhciBuZWVkV2lkdGggPSArKG9yaWVudGF0aW9uID09PSAnbGVmdCcgJiYgIW1pcnJvciB8fCBvcmllbnRhdGlvbiA9PT0gJ3JpZ2h0JyAmJiBtaXJyb3IpO1xuICAgIHByb3BzID0gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBwcm9wcyksIHt9LCB7XG4gICAgICB4MTogeCArIG5lZWRXaWR0aCAqIHdpZHRoLFxuICAgICAgeTE6IHksXG4gICAgICB4MjogeCArIG5lZWRXaWR0aCAqIHdpZHRoLFxuICAgICAgeTI6IHkgKyBoZWlnaHRcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsaW5lXCIsIF9leHRlbmRzKHt9LCBwcm9wcywge1xuICAgIGNsYXNzTmFtZTogY2xzeCgncmVjaGFydHMtY2FydGVzaWFuLWF4aXMtbGluZScsIGdldChheGlzTGluZSwgJ2NsYXNzTmFtZScpKVxuICB9KSk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlIHRoZSBjb29yZGluYXRlcyBvZiBlbmRwb2ludHMgaW4gdGlja3MuXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSBvZiBhIHNpbXBsZSB0aWNrLlxuICogQHBhcmFtIHggVGhlIHgtY29vcmRpbmF0ZSBvZiB0aGUgYXhpcy5cbiAqIEBwYXJhbSB5IFRoZSB5LWNvb3JkaW5hdGUgb2YgdGhlIGF4aXMuXG4gKiBAcGFyYW0gd2lkdGggVGhlIHdpZHRoIG9mIHRoZSBheGlzLlxuICogQHBhcmFtIGhlaWdodCBUaGUgaGVpZ2h0IG9mIHRoZSBheGlzLlxuICogQHBhcmFtIG9yaWVudGF0aW9uIFRoZSBvcmllbnRhdGlvbiBvZiB0aGUgYXhpcy5cbiAqIEBwYXJhbSB0aWNrU2l6ZSBUaGUgbGVuZ3RoIG9mIHRoZSB0aWNrIGxpbmUuXG4gKiBAcGFyYW0gbWlycm9yIElmIHRydWUsIHRoZSB0aWNrcyBhcmUgbWlycm9yZWQuXG4gKiBAcGFyYW0gdGlja01hcmdpbiBUaGUgbWFyZ2luIGJldHdlZW4gdGhlIHRpY2sgbGluZSBhbmQgdGhlIHRpY2sgdGV4dC5cbiAqIEByZXR1cm5zIEFuIG9iamVjdCB3aXRoIGBsaW5lYCBhbmQgYHRpY2tgIGNvb3JkaW5hdGVzLlxuICogYGxpbmVgIGlzIHRoZSBjb29yZGluYXRlcyBmb3IgdGhlIHRpY2sgbGluZSwgYW5kIGB0aWNrYCBpcyB0aGUgY29vcmRpbmF0ZSBmb3IgdGhlIHRpY2sgdGV4dC5cbiAqL1xuZnVuY3Rpb24gZ2V0VGlja0xpbmVDb29yZChkYXRhLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBvcmllbnRhdGlvbiwgdGlja1NpemUsIG1pcnJvciwgdGlja01hcmdpbikge1xuICB2YXIgeDEsIHgyLCB5MSwgeTIsIHR4LCB0eTtcbiAgdmFyIHNpZ24gPSBtaXJyb3IgPyAtMSA6IDE7XG4gIHZhciBmaW5hbFRpY2tTaXplID0gZGF0YS50aWNrU2l6ZSB8fCB0aWNrU2l6ZTtcbiAgdmFyIHRpY2tDb29yZCA9IGlzTnVtYmVyKGRhdGEudGlja0Nvb3JkKSA/IGRhdGEudGlja0Nvb3JkIDogZGF0YS5jb29yZGluYXRlO1xuICBzd2l0Y2ggKG9yaWVudGF0aW9uKSB7XG4gICAgY2FzZSAndG9wJzpcbiAgICAgIHgxID0geDIgPSBkYXRhLmNvb3JkaW5hdGU7XG4gICAgICB5MiA9IHkgKyArIW1pcnJvciAqIGhlaWdodDtcbiAgICAgIHkxID0geTIgLSBzaWduICogZmluYWxUaWNrU2l6ZTtcbiAgICAgIHR5ID0geTEgLSBzaWduICogdGlja01hcmdpbjtcbiAgICAgIHR4ID0gdGlja0Nvb3JkO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbGVmdCc6XG4gICAgICB5MSA9IHkyID0gZGF0YS5jb29yZGluYXRlO1xuICAgICAgeDIgPSB4ICsgKyFtaXJyb3IgKiB3aWR0aDtcbiAgICAgIHgxID0geDIgLSBzaWduICogZmluYWxUaWNrU2l6ZTtcbiAgICAgIHR4ID0geDEgLSBzaWduICogdGlja01hcmdpbjtcbiAgICAgIHR5ID0gdGlja0Nvb3JkO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmlnaHQnOlxuICAgICAgeTEgPSB5MiA9IGRhdGEuY29vcmRpbmF0ZTtcbiAgICAgIHgyID0geCArICttaXJyb3IgKiB3aWR0aDtcbiAgICAgIHgxID0geDIgKyBzaWduICogZmluYWxUaWNrU2l6ZTtcbiAgICAgIHR4ID0geDEgKyBzaWduICogdGlja01hcmdpbjtcbiAgICAgIHR5ID0gdGlja0Nvb3JkO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHgxID0geDIgPSBkYXRhLmNvb3JkaW5hdGU7XG4gICAgICB5MiA9IHkgKyArbWlycm9yICogaGVpZ2h0O1xuICAgICAgeTEgPSB5MiArIHNpZ24gKiBmaW5hbFRpY2tTaXplO1xuICAgICAgdHkgPSB5MSArIHNpZ24gKiB0aWNrTWFyZ2luO1xuICAgICAgdHggPSB0aWNrQ29vcmQ7XG4gICAgICBicmVhaztcbiAgfVxuICByZXR1cm4ge1xuICAgIGxpbmU6IHtcbiAgICAgIHgxLFxuICAgICAgeTEsXG4gICAgICB4MixcbiAgICAgIHkyXG4gICAgfSxcbiAgICB0aWNrOiB7XG4gICAgICB4OiB0eCxcbiAgICAgIHk6IHR5XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIEBwYXJhbSBvcmllbnRhdGlvbiBUaGUgb3JpZW50YXRpb24gb2YgdGhlIGF4aXMuXG4gKiBAcGFyYW0gbWlycm9yIElmIHRydWUsIHRoZSB0aWNrcyBhcmUgbWlycm9yZWQuXG4gKiBAcmV0dXJucyBUaGUgdGV4dCBhbmNob3Igb2YgdGhlIHRpY2suXG4gKi9cbmZ1bmN0aW9uIGdldFRpY2tUZXh0QW5jaG9yKG9yaWVudGF0aW9uLCBtaXJyb3IpIHtcbiAgc3dpdGNoIChvcmllbnRhdGlvbikge1xuICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgcmV0dXJuIG1pcnJvciA/ICdzdGFydCcgOiAnZW5kJztcbiAgICBjYXNlICdyaWdodCc6XG4gICAgICByZXR1cm4gbWlycm9yID8gJ2VuZCcgOiAnc3RhcnQnO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJ21pZGRsZSc7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0gb3JpZW50YXRpb24gVGhlIG9yaWVudGF0aW9uIG9mIHRoZSBheGlzLlxuICogQHBhcmFtIG1pcnJvciBJZiB0cnVlLCB0aGUgdGlja3MgYXJlIG1pcnJvcmVkLlxuICogQHJldHVybnMgVGhlIHZlcnRpY2FsIHRleHQgYW5jaG9yIG9mIHRoZSB0aWNrLlxuICovXG5mdW5jdGlvbiBnZXRUaWNrVmVydGljYWxBbmNob3Iob3JpZW50YXRpb24sIG1pcnJvcikge1xuICBzd2l0Y2ggKG9yaWVudGF0aW9uKSB7XG4gICAgY2FzZSAnbGVmdCc6XG4gICAgY2FzZSAncmlnaHQnOlxuICAgICAgcmV0dXJuICdtaWRkbGUnO1xuICAgIGNhc2UgJ3RvcCc6XG4gICAgICByZXR1cm4gbWlycm9yID8gJ3N0YXJ0JyA6ICdlbmQnO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbWlycm9yID8gJ2VuZCcgOiAnc3RhcnQnO1xuICB9XG59XG5mdW5jdGlvbiBUaWNrSXRlbShwcm9wcykge1xuICB2YXIge1xuICAgIG9wdGlvbixcbiAgICB0aWNrUHJvcHMsXG4gICAgdmFsdWVcbiAgfSA9IHByb3BzO1xuICB2YXIgdGlja0l0ZW07XG4gIHZhciBjb21iaW5lZENsYXNzTmFtZSA9IGNsc3godGlja1Byb3BzLmNsYXNzTmFtZSwgJ3JlY2hhcnRzLWNhcnRlc2lhbi1heGlzLXRpY2stdmFsdWUnKTtcbiAgaWYgKC8qI19fUFVSRV9fKi9SZWFjdC5pc1ZhbGlkRWxlbWVudChvcHRpb24pKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBlbGVtZW50IGNsb25pbmcgaXMgbm90IHR5cGVkXG4gICAgdGlja0l0ZW0gPSAvKiNfX1BVUkVfXyovUmVhY3QuY2xvbmVFbGVtZW50KG9wdGlvbiwgX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCB0aWNrUHJvcHMpLCB7fSwge1xuICAgICAgY2xhc3NOYW1lOiBjb21iaW5lZENsYXNzTmFtZVxuICAgIH0pKTtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdGlja0l0ZW0gPSBvcHRpb24oX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCB0aWNrUHJvcHMpLCB7fSwge1xuICAgICAgY2xhc3NOYW1lOiBjb21iaW5lZENsYXNzTmFtZVxuICAgIH0pKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgY2xhc3NOYW1lID0gJ3JlY2hhcnRzLWNhcnRlc2lhbi1heGlzLXRpY2stdmFsdWUnO1xuICAgIGlmICh0eXBlb2Ygb3B0aW9uICE9PSAnYm9vbGVhbicpIHtcbiAgICAgIGNsYXNzTmFtZSA9IGNsc3goY2xhc3NOYW1lLCBvcHRpb24gPT09IG51bGwgfHwgb3B0aW9uID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb24uY2xhc3NOYW1lKTtcbiAgICB9XG4gICAgdGlja0l0ZW0gPSAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChUZXh0LCBfZXh0ZW5kcyh7fSwgdGlja1Byb3BzLCB7XG4gICAgICBjbGFzc05hbWU6IGNsYXNzTmFtZVxuICAgIH0pLCB2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHRpY2tJdGVtO1xufVxuZnVuY3Rpb24gVGlja3MocHJvcHMpIHtcbiAgdmFyIHtcbiAgICB0aWNrcyA9IFtdLFxuICAgIHRpY2ssXG4gICAgdGlja0xpbmUsXG4gICAgc3Ryb2tlLFxuICAgIHRpY2tGb3JtYXR0ZXIsXG4gICAgdW5pdCxcbiAgICBwYWRkaW5nLFxuICAgIHRpY2tUZXh0UHJvcHMsXG4gICAgb3JpZW50YXRpb24sXG4gICAgbWlycm9yLFxuICAgIHgsXG4gICAgeSxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgdGlja1NpemUsXG4gICAgdGlja01hcmdpbixcbiAgICBmb250U2l6ZSxcbiAgICBsZXR0ZXJTcGFjaW5nLFxuICAgIGdldFRpY2tzQ29uZmlnLFxuICAgIGV2ZW50c1xuICB9ID0gcHJvcHM7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3Igc29tZSBwcm9wZXJ0aWVzIGFyZSBvcHRpb25hbCBpbiBwcm9wcyBidXQgcmVxdWlyZWQgaW4gZ2V0VGlja3NcbiAgdmFyIGZpbmFsVGlja3MgPSBnZXRUaWNrcyhfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGdldFRpY2tzQ29uZmlnKSwge30sIHtcbiAgICB0aWNrc1xuICB9KSwgZm9udFNpemUsIGxldHRlclNwYWNpbmcpO1xuICB2YXIgdGV4dEFuY2hvciA9IGdldFRpY2tUZXh0QW5jaG9yKG9yaWVudGF0aW9uLCBtaXJyb3IpO1xuICB2YXIgdmVydGljYWxBbmNob3IgPSBnZXRUaWNrVmVydGljYWxBbmNob3Iob3JpZW50YXRpb24sIG1pcnJvcik7XG4gIHZhciBheGlzUHJvcHMgPSBzdmdQcm9wZXJ0aWVzTm9FdmVudHMoZ2V0VGlja3NDb25maWcpO1xuICB2YXIgY3VzdG9tVGlja1Byb3BzID0gc3ZnUHJvcGVydGllc05vRXZlbnRzRnJvbVVua25vd24odGljayk7XG4gIHZhciB0aWNrTGluZVByb3BzT2JqZWN0ID0ge307XG4gIGlmICh0eXBlb2YgdGlja0xpbmUgPT09ICdvYmplY3QnKSB7XG4gICAgdGlja0xpbmVQcm9wc09iamVjdCA9IHRpY2tMaW5lO1xuICB9XG4gIHZhciB0aWNrTGluZVByb3BzID0gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBheGlzUHJvcHMpLCB7fSwge1xuICAgIGZpbGw6ICdub25lJ1xuICB9LCB0aWNrTGluZVByb3BzT2JqZWN0KTtcbiAgdmFyIGl0ZW1zID0gZmluYWxUaWNrcy5tYXAoKGVudHJ5LCBpKSA9PiB7XG4gICAgdmFyIHtcbiAgICAgIGxpbmU6IGxpbmVDb29yZCxcbiAgICAgIHRpY2s6IHRpY2tDb29yZFxuICAgIH0gPSBnZXRUaWNrTGluZUNvb3JkKGVudHJ5LCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBvcmllbnRhdGlvbiwgdGlja1NpemUsIG1pcnJvciwgdGlja01hcmdpbik7XG4gICAgdmFyIHRpY2tQcm9wcyA9IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0ZXh0QW5jaG9yIGZyb20gYXhpc1Byb3BzIGlzIHR5cGVkIGFzIGBzdHJpbmdgIGJ1dCBUZXh0IHdhbnRzIHR5cGUgYFRleHRBbmNob3JgXG4gICAgICB0ZXh0QW5jaG9yLFxuICAgICAgdmVydGljYWxBbmNob3JcbiAgICB9LCBheGlzUHJvcHMpLCB7fSwge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBjdXN0b21UaWNrUHJvcHMgaXMgY29udHJpYnV0aW5nIHVua25vd24gcHJvcHNcbiAgICAgIHN0cm9rZTogJ25vbmUnLFxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBjdXN0b21UaWNrUHJvcHMgaXMgY29udHJpYnV0aW5nIHVua25vd24gcHJvcHNcbiAgICAgIGZpbGw6IHN0cm9rZVxuICAgIH0sIGN1c3RvbVRpY2tQcm9wcyksIHRpY2tDb29yZCksIHt9LCB7XG4gICAgICBpbmRleDogaSxcbiAgICAgIHBheWxvYWQ6IGVudHJ5LFxuICAgICAgdmlzaWJsZVRpY2tzQ291bnQ6IGZpbmFsVGlja3MubGVuZ3RoLFxuICAgICAgdGlja0Zvcm1hdHRlcixcbiAgICAgIHBhZGRpbmdcbiAgICB9LCB0aWNrVGV4dFByb3BzKTtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGF5ZXIsIF9leHRlbmRzKHtcbiAgICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1jYXJ0ZXNpYW4tYXhpcy10aWNrXCIsXG4gICAgICBrZXk6IFwidGljay1cIi5jb25jYXQoZW50cnkudmFsdWUsIFwiLVwiKS5jb25jYXQoZW50cnkuY29vcmRpbmF0ZSwgXCItXCIpLmNvbmNhdChlbnRyeS50aWNrQ29vcmQpXG4gICAgfSwgYWRhcHRFdmVudHNPZkNoaWxkKGV2ZW50cywgZW50cnksIGkpKSwgdGlja0xpbmUgJiYgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsaW5lXCIsIF9leHRlbmRzKHt9LCB0aWNrTGluZVByb3BzLCBsaW5lQ29vcmQsIHtcbiAgICAgIGNsYXNzTmFtZTogY2xzeCgncmVjaGFydHMtY2FydGVzaWFuLWF4aXMtdGljay1saW5lJywgZ2V0KHRpY2tMaW5lLCAnY2xhc3NOYW1lJykpXG4gICAgfSkpLCB0aWNrICYmIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFRpY2tJdGVtLCB7XG4gICAgICBvcHRpb246IHRpY2ssXG4gICAgICB0aWNrUHJvcHM6IHRpY2tQcm9wcyxcbiAgICAgIHZhbHVlOiBcIlwiLmNvbmNhdCh0eXBlb2YgdGlja0Zvcm1hdHRlciA9PT0gJ2Z1bmN0aW9uJyA/IHRpY2tGb3JtYXR0ZXIoZW50cnkudmFsdWUsIGkpIDogZW50cnkudmFsdWUpLmNvbmNhdCh1bml0IHx8ICcnKVxuICAgIH0pKTtcbiAgfSk7XG4gIGlmIChpdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFwiZ1wiLCB7XG4gICAgICBjbGFzc05hbWU6IFwicmVjaGFydHMtY2FydGVzaWFuLWF4aXMtdGlja3NcIlxuICAgIH0sIGl0ZW1zKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cbnZhciBDYXJ0ZXNpYW5BeGlzQ29tcG9uZW50ID0gLyojX19QVVJFX18qL2ZvcndhcmRSZWYoKHByb3BzLCByZWYpID0+IHtcbiAgdmFyIHtcbiAgICAgIGF4aXNMaW5lLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBjbGFzc05hbWUsXG4gICAgICBoaWRlLFxuICAgICAgdGlja3NcbiAgICB9ID0gcHJvcHMsXG4gICAgcmVzdCA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhwcm9wcywgX2V4Y2x1ZGVkKTtcbiAgdmFyIFtmb250U2l6ZSwgc2V0Rm9udFNpemVdID0gdXNlU3RhdGUoJycpO1xuICB2YXIgW2xldHRlclNwYWNpbmcsIHNldExldHRlclNwYWNpbmddID0gdXNlU3RhdGUoJycpO1xuICB2YXIgdGlja1JlZnMgPSB1c2VSZWYobnVsbCk7XG4gIHVzZUltcGVyYXRpdmVIYW5kbGUocmVmLCAoKSA9PiAoe1xuICAgIGdldENhbGN1bGF0ZWRXaWR0aDogKCkgPT4ge1xuICAgICAgdmFyIF9wcm9wcyRsYWJlbFJlZjtcbiAgICAgIHJldHVybiBnZXRDYWxjdWxhdGVkWUF4aXNXaWR0aCh7XG4gICAgICAgIHRpY2tzOiB0aWNrUmVmcy5jdXJyZW50LFxuICAgICAgICBsYWJlbDogKF9wcm9wcyRsYWJlbFJlZiA9IHByb3BzLmxhYmVsUmVmKSA9PT0gbnVsbCB8fCBfcHJvcHMkbGFiZWxSZWYgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9wcm9wcyRsYWJlbFJlZi5jdXJyZW50LFxuICAgICAgICBsYWJlbEdhcFdpdGhUaWNrOiA1LFxuICAgICAgICB0aWNrU2l6ZTogcHJvcHMudGlja1NpemUsXG4gICAgICAgIHRpY2tNYXJnaW46IHByb3BzLnRpY2tNYXJnaW5cbiAgICAgIH0pO1xuICAgIH1cbiAgfSkpO1xuICB2YXIgbGF5ZXJSZWYgPSB1c2VDYWxsYmFjayhlbCA9PiB7XG4gICAgaWYgKGVsKSB7XG4gICAgICB2YXIgdGlja05vZGVzID0gZWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncmVjaGFydHMtY2FydGVzaWFuLWF4aXMtdGljay12YWx1ZScpO1xuICAgICAgdGlja1JlZnMuY3VycmVudCA9IHRpY2tOb2RlcztcbiAgICAgIHZhciB0aWNrID0gdGlja05vZGVzWzBdO1xuICAgICAgaWYgKHRpY2spIHtcbiAgICAgICAgdmFyIGNvbXB1dGVkU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aWNrKTtcbiAgICAgICAgdmFyIGNhbGN1bGF0ZWRGb250U2l6ZSA9IGNvbXB1dGVkU3R5bGUuZm9udFNpemU7XG4gICAgICAgIHZhciBjYWxjdWxhdGVkTGV0dGVyU3BhY2luZyA9IGNvbXB1dGVkU3R5bGUubGV0dGVyU3BhY2luZztcbiAgICAgICAgaWYgKGNhbGN1bGF0ZWRGb250U2l6ZSAhPT0gZm9udFNpemUgfHwgY2FsY3VsYXRlZExldHRlclNwYWNpbmcgIT09IGxldHRlclNwYWNpbmcpIHtcbiAgICAgICAgICBzZXRGb250U2l6ZShjYWxjdWxhdGVkRm9udFNpemUpO1xuICAgICAgICAgIHNldExldHRlclNwYWNpbmcoY2FsY3VsYXRlZExldHRlclNwYWNpbmcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCBbZm9udFNpemUsIGxldHRlclNwYWNpbmddKTtcbiAgaWYgKGhpZGUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qXG4gICAqIFRoaXMgaXMgZGlmZmVyZW50IGNvbmRpdGlvbiBmcm9tIHdoYXQgdmFsaWRhdGVXaWR0aEhlaWdodCBpcyBkb2luZztcbiAgICogdGhlIENhcnRlc2lhbkF4aXMgZG9lcyBhbGxvdyB3aWR0aCBvciBoZWlnaHQgdG8gYmUgdW5kZWZpbmVkLlxuICAgKi9cbiAgaWYgKHdpZHRoICE9IG51bGwgJiYgd2lkdGggPD0gMCB8fCBoZWlnaHQgIT0gbnVsbCAmJiBoZWlnaHQgPD0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwge1xuICAgIGNsYXNzTmFtZTogY2xzeCgncmVjaGFydHMtY2FydGVzaWFuLWF4aXMnLCBjbGFzc05hbWUpLFxuICAgIHJlZjogbGF5ZXJSZWZcbiAgfSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQXhpc0xpbmUsIHtcbiAgICB4OiBwcm9wcy54LFxuICAgIHk6IHByb3BzLnksXG4gICAgd2lkdGg6IHdpZHRoLFxuICAgIGhlaWdodDogaGVpZ2h0LFxuICAgIG9yaWVudGF0aW9uOiBwcm9wcy5vcmllbnRhdGlvbixcbiAgICBtaXJyb3I6IHByb3BzLm1pcnJvcixcbiAgICBheGlzTGluZTogYXhpc0xpbmUsXG4gICAgb3RoZXJTdmdQcm9wczogc3ZnUHJvcGVydGllc05vRXZlbnRzKHByb3BzKVxuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoVGlja3MsIHtcbiAgICB0aWNrczogdGlja3MsXG4gICAgdGljazogcHJvcHMudGljayxcbiAgICB0aWNrTGluZTogcHJvcHMudGlja0xpbmUsXG4gICAgc3Ryb2tlOiBwcm9wcy5zdHJva2UsXG4gICAgdGlja0Zvcm1hdHRlcjogcHJvcHMudGlja0Zvcm1hdHRlcixcbiAgICB1bml0OiBwcm9wcy51bml0LFxuICAgIHBhZGRpbmc6IHByb3BzLnBhZGRpbmcsXG4gICAgdGlja1RleHRQcm9wczogcHJvcHMudGlja1RleHRQcm9wcyxcbiAgICBvcmllbnRhdGlvbjogcHJvcHMub3JpZW50YXRpb24sXG4gICAgbWlycm9yOiBwcm9wcy5taXJyb3IsXG4gICAgeDogcHJvcHMueCxcbiAgICB5OiBwcm9wcy55LFxuICAgIHdpZHRoOiBwcm9wcy53aWR0aCxcbiAgICBoZWlnaHQ6IHByb3BzLmhlaWdodCxcbiAgICB0aWNrU2l6ZTogcHJvcHMudGlja1NpemUsXG4gICAgdGlja01hcmdpbjogcHJvcHMudGlja01hcmdpbixcbiAgICBmb250U2l6ZTogZm9udFNpemUsXG4gICAgbGV0dGVyU3BhY2luZzogbGV0dGVyU3BhY2luZyxcbiAgICBnZXRUaWNrc0NvbmZpZzogcHJvcHMsXG4gICAgZXZlbnRzOiByZXN0XG4gIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChDYXJ0ZXNpYW5MYWJlbENvbnRleHRQcm92aWRlciwge1xuICAgIHg6IHByb3BzLngsXG4gICAgeTogcHJvcHMueSxcbiAgICB3aWR0aDogcHJvcHMud2lkdGgsXG4gICAgaGVpZ2h0OiBwcm9wcy5oZWlnaHRcbiAgfSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQ2FydGVzaWFuTGFiZWxGcm9tTGFiZWxQcm9wLCB7XG4gICAgbGFiZWw6IHByb3BzLmxhYmVsLFxuICAgIGxhYmVsUmVmOiBwcm9wcy5sYWJlbFJlZlxuICB9KSwgcHJvcHMuY2hpbGRyZW4pKTtcbn0pO1xudmFyIE1lbW9DYXJ0ZXNpYW5BeGlzID0gLyojX19QVVJFX18qL1JlYWN0Lm1lbW8oQ2FydGVzaWFuQXhpc0NvbXBvbmVudCwgKHByZXZQcm9wcywgbmV4dFByb3BzKSA9PiB7XG4gIHZhciB7XG4gICAgICB2aWV3Qm94OiBwcmV2Vmlld0JveFxuICAgIH0gPSBwcmV2UHJvcHMsXG4gICAgcHJldlJlc3RQcm9wcyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhwcmV2UHJvcHMsIF9leGNsdWRlZDIpO1xuICB2YXIge1xuICAgICAgdmlld0JveDogbmV4dFZpZXdCb3hcbiAgICB9ID0gbmV4dFByb3BzLFxuICAgIG5leHRSZXN0UHJvcHMgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMobmV4dFByb3BzLCBfZXhjbHVkZWQzKTtcbiAgcmV0dXJuIHNoYWxsb3dFcXVhbChwcmV2Vmlld0JveCwgbmV4dFZpZXdCb3gpICYmIHNoYWxsb3dFcXVhbChwcmV2UmVzdFByb3BzLCBuZXh0UmVzdFByb3BzKTtcbn0pO1xuZXhwb3J0IHZhciBDYXJ0ZXNpYW5BeGlzID0gLyojX19QVVJFX18qL1JlYWN0LmZvcndhcmRSZWYoKG91dHNpZGVQcm9wcywgcmVmKSA9PiB7XG4gIHZhciBwcm9wcyA9IHJlc29sdmVEZWZhdWx0UHJvcHMob3V0c2lkZVByb3BzLCBkZWZhdWx0Q2FydGVzaWFuQXhpc1Byb3BzKTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KE1lbW9DYXJ0ZXNpYW5BeGlzLCBfZXh0ZW5kcyh7fSwgcHJvcHMsIHtcbiAgICByZWY6IHJlZlxuICB9KSk7XG59KTtcbkNhcnRlc2lhbkF4aXMuZGlzcGxheU5hbWUgPSAnQ2FydGVzaWFuQXhpcyc7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9