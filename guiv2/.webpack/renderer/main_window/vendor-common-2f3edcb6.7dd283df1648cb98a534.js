"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[9685],{

/***/ 26435:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* unused harmony exports payloadSearcher, addToSunburstNodeIndex, SunburstChart */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var victory_vendor_d3_scale__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(39625);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);
/* harmony import */ var es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(80305);
/* harmony import */ var es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _container_Surface__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(49303);
/* harmony import */ var _container_Layer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(86069);
/* harmony import */ var _shape_Sector__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(58522);
/* harmony import */ var _component_Text__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(20261);
/* harmony import */ var _util_PolarUtils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(14040);
/* harmony import */ var _context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(19287);
/* harmony import */ var _context_tooltipPortalContext__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(74354);
/* harmony import */ var _RechartsWrapper__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(41940);
/* harmony import */ var _state_tooltipSlice__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(74531);
/* harmony import */ var _state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(59482);
/* harmony import */ var _state_RechartsStoreProvider__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(11970);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(49082);
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }

















var defaultTextProps = {
  fontWeight: 'bold',
  paintOrder: 'stroke fill',
  fontSize: '.75rem',
  stroke: '#FFF',
  fill: 'black',
  pointerEvents: 'none'
};
function getMaxDepthOf(node) {
  if (!node.children || node.children.length === 0) return 1;

  // Calculate depth for each child and find the maximum
  var childDepths = node.children.map(d => getMaxDepthOf(d));
  return 1 + Math.max(...childDepths);
}
function convertMapToRecord(map) {
  var record = {};
  map.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}
function getTooltipEntrySettings(_ref) {
  var {
    dataKey,
    nameKey,
    data,
    stroke,
    fill,
    positions
  } = _ref;
  return {
    dataDefinedOnItem: data.children,
    // Redux store will not accept a Map because it's not serializable
    positions: convertMapToRecord(positions),
    // Sunburst does not support many of the properties as other charts do so there's plenty of defaults here
    settings: {
      stroke,
      strokeWidth: undefined,
      fill,
      nameKey,
      dataKey,
      // if there is a nameKey use it, otherwise make the name of the tooltip the dataKey itself
      name: nameKey ? undefined : dataKey,
      hide: false,
      type: undefined,
      color: fill,
      unit: ''
    }
  };
}

// Why is margin not a sunburst prop? No clue. Probably it should be
var defaultSunburstMargin = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
};
var payloadSearcher = (data, activeIndex) => {
  return es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_3___default()(data, activeIndex);
};
var addToSunburstNodeIndex = function addToSunburstNodeIndex(indexInChildrenArr) {
  var activeTooltipIndexSoFar = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  return "".concat(activeTooltipIndexSoFar, "children[").concat(indexInChildrenArr, "]");
};
var preloadedState = {
  options: {
    validateTooltipEventTypes: ['item'],
    defaultTooltipEventType: 'item',
    chartName: 'Sunburst',
    tooltipPayloadSearcher: payloadSearcher,
    eventEmitter: undefined
  }
};
var SunburstChartImpl = _ref2 => {
  var {
    className,
    data,
    children,
    padding = 2,
    dataKey = 'value',
    nameKey = 'name',
    ringPadding = 2,
    innerRadius = 50,
    fill = '#333',
    stroke = '#FFF',
    textOptions = defaultTextProps,
    outerRadius: outerRadiusFromProps,
    cx: cxFromProps,
    cy: cyFromProps,
    startAngle = 0,
    endAngle = 360,
    onClick,
    onMouseEnter,
    onMouseLeave,
    responsive = false,
    style
  } = _ref2;
  var dispatch = useAppDispatch();
  var width = useChartWidth();
  var height = useChartHeight();
  var outerRadius = outerRadiusFromProps !== null && outerRadiusFromProps !== void 0 ? outerRadiusFromProps : Math.min(width, height) / 2;
  var cx = cxFromProps !== null && cxFromProps !== void 0 ? cxFromProps : width / 2;
  var cy = cyFromProps !== null && cyFromProps !== void 0 ? cyFromProps : height / 2;
  var rScale = scaleLinear([0, data[dataKey]], [0, endAngle]);
  var treeDepth = getMaxDepthOf(data);
  var thickness = (outerRadius - innerRadius) / treeDepth;
  var sectors = [];
  var positions = new Map([]);
  var [tooltipPortal, setTooltipPortal] = useState(null);
  // event handlers
  function handleMouseEnter(node, e) {
    if (onMouseEnter) onMouseEnter(node, e);
    dispatch(setActiveMouseOverItemIndex({
      activeIndex: node.tooltipIndex,
      activeDataKey: dataKey,
      activeCoordinate: positions.get(node.name)
    }));
  }
  function handleMouseLeave(node, e) {
    if (onMouseLeave) onMouseLeave(node, e);
    dispatch(mouseLeaveItem());
  }
  function handleClick(node) {
    if (onClick) onClick(node);
    dispatch(setActiveClickItemIndex({
      activeIndex: node.tooltipIndex,
      activeDataKey: dataKey,
      activeCoordinate: positions.get(node.name)
    }));
  }

  // recursively add nodes for each data point and its children
  function drawArcs(childNodes, options) {
    var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    var {
      radius,
      innerR,
      initialAngle,
      childColor,
      nestedActiveTooltipIndex
    } = options;
    var currentAngle = initialAngle;
    if (!childNodes) return; // base case: no children of this node

    childNodes.forEach((d, i) => {
      var _ref3, _d$fill;
      var currentTooltipIndex = depth === 1 ? "[".concat(i, "]") : addToSunburstNodeIndex(i, nestedActiveTooltipIndex);
      var nodeWithIndex = _objectSpread(_objectSpread({}, d), {}, {
        tooltipIndex: currentTooltipIndex
      });
      var arcLength = rScale(d[dataKey]);
      var start = currentAngle;
      // color priority - if there's a color on the individual point use that, otherwise use parent color or default
      var fillColor = (_ref3 = (_d$fill = d === null || d === void 0 ? void 0 : d.fill) !== null && _d$fill !== void 0 ? _d$fill : childColor) !== null && _ref3 !== void 0 ? _ref3 : fill;
      var {
        x: textX,
        y: textY
      } = polarToCartesian(0, 0, innerR + radius / 2, -(start + arcLength - arcLength / 2));
      currentAngle += arcLength;
      sectors.push(
      /*#__PURE__*/
      // eslint-disable-next-line react/no-array-index-key
      React.createElement("g", {
        key: "sunburst-sector-".concat(d.name, "-").concat(i)
      }, /*#__PURE__*/React.createElement(Sector, {
        onClick: () => handleClick(nodeWithIndex),
        onMouseEnter: e => handleMouseEnter(nodeWithIndex, e),
        onMouseLeave: e => handleMouseLeave(nodeWithIndex, e),
        fill: fillColor,
        stroke: stroke,
        strokeWidth: padding,
        startAngle: start,
        endAngle: start + arcLength,
        innerRadius: innerR,
        outerRadius: innerR + radius,
        cx: cx,
        cy: cy
      }), /*#__PURE__*/React.createElement(Text, _extends({}, textOptions, {
        alignmentBaseline: "middle",
        textAnchor: "middle",
        x: textX + cx,
        y: cy - textY
      }), d[dataKey])));
      var {
        x: tooltipX,
        y: tooltipY
      } = polarToCartesian(cx, cy, innerR + radius / 2, start);
      positions.set(d.name, {
        x: tooltipX,
        y: tooltipY
      });
      return drawArcs(d.children, {
        radius,
        innerR: innerR + radius + ringPadding,
        initialAngle: start,
        childColor: fillColor,
        nestedActiveTooltipIndex: currentTooltipIndex
      }, depth + 1);
    });
  }
  drawArcs(data.children, {
    radius: thickness,
    innerR: innerRadius,
    initialAngle: startAngle
  });
  var layerClass = clsx('recharts-sunburst', className);
  return /*#__PURE__*/React.createElement(TooltipPortalContext.Provider, {
    value: tooltipPortal
  }, /*#__PURE__*/React.createElement(RechartsWrapper, {
    className: className,
    width: width,
    height: height,
    responsive: responsive,
    style: style,
    ref: node => {
      if (tooltipPortal == null && node != null) {
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
  }, /*#__PURE__*/React.createElement(Surface, {
    width: width,
    height: height
  }, /*#__PURE__*/React.createElement(Layer, {
    className: layerClass
  }, sectors), /*#__PURE__*/React.createElement(SetTooltipEntrySettings, {
    fn: getTooltipEntrySettings,
    args: {
      dataKey,
      data,
      stroke,
      fill,
      nameKey,
      positions
    }
  }), children)));
};
var SunburstChart = props => {
  var _props$className;
  return /*#__PURE__*/React.createElement(RechartsStoreProvider, {
    preloadedState: preloadedState,
    reduxStoreName: (_props$className = props.className) !== null && _props$className !== void 0 ? _props$className : 'SunburstChart'
  }, /*#__PURE__*/React.createElement(ReportChartSize, {
    width: props.width,
    height: props.height
  }), /*#__PURE__*/React.createElement(ReportChartMargin, {
    margin: defaultSunburstMargin
  }), /*#__PURE__*/React.createElement(SunburstChartImpl, props));
};

/***/ }),

/***/ 33737:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* unused harmony exports treemapPayloadSearcher, addToTreemapNodeIndex, computeNode, Treemap */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var es_toolkit_compat_omit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(11576);
/* harmony import */ var es_toolkit_compat_omit__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(es_toolkit_compat_omit__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(80305);
/* harmony import */ var es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _container_Layer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(86069);
/* harmony import */ var _container_Surface__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(49303);
/* harmony import */ var _shape_Polygon__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(20852);
/* harmony import */ var _shape_Rectangle__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(34723);
/* harmony import */ var _util_ChartUtils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(33964);
/* harmony import */ var _util_Constants__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(4364);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(59744);
/* harmony import */ var _util_DOMUtils__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(81636);
/* harmony import */ var _util_Global__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(59938);
/* harmony import */ var _context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(19287);
/* harmony import */ var _context_tooltipPortalContext__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(74354);
/* harmony import */ var _RechartsWrapper__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(41940);
/* harmony import */ var _state_tooltipSlice__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(74531);
/* harmony import */ var _state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(59482);
/* harmony import */ var _state_RechartsStoreProvider__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(11970);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(49082);
/* harmony import */ var _util_isWellBehavedNumber__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(8813);
/* harmony import */ var _util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(55448);
/* harmony import */ var _animation_CSSTransitionAnimate__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(97950);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(77404);
var _excluded = ["width", "height", "className", "style", "children", "type"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
























var NODE_VALUE_KEY = 'value';

/**
 * This is what end users defines as `data` on Treemap.
 */

/**
 * This is what is returned from `squarify`, the final treemap data structure
 * that gets rendered and is stored in
 */

var treemapPayloadSearcher = (data, activeIndex) => {
  if (!data || !activeIndex) {
    return undefined;
  }
  return es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_2___default()(data, activeIndex);
};
var addToTreemapNodeIndex = function addToTreemapNodeIndex(indexInChildrenArr) {
  var activeTooltipIndexSoFar = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  return "".concat(activeTooltipIndexSoFar, "children[").concat(indexInChildrenArr, "]");
};
var options = {
  chartName: 'Treemap',
  defaultTooltipEventType: 'item',
  validateTooltipEventTypes: ['item'],
  tooltipPayloadSearcher: treemapPayloadSearcher,
  eventEmitter: undefined
};
var computeNode = _ref => {
  var {
    depth,
    node,
    index,
    dataKey,
    nameKey,
    nestedActiveTooltipIndex
  } = _ref;
  var currentTooltipIndex = depth === 0 ? '' : addToTreemapNodeIndex(index, nestedActiveTooltipIndex);
  var {
    children
  } = node;
  var childDepth = depth + 1;
  var computedChildren = children && children.length ? children.map((child, i) => computeNode({
    depth: childDepth,
    node: child,
    index: i,
    dataKey,
    nameKey,
    nestedActiveTooltipIndex: currentTooltipIndex
  })) : null;
  var nodeValue;
  if (computedChildren && computedChildren.length) {
    nodeValue = computedChildren.reduce((result, child) => result + child[NODE_VALUE_KEY], 0);
  } else {
    // TODO need to verify dataKey
    nodeValue = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_9__/* .isNan */ .M8)(node[dataKey]) || node[dataKey] <= 0 ? 0 : node[dataKey];
  }
  return _objectSpread(_objectSpread({}, node), {}, {
    children: computedChildren,
    // @ts-expect-error getValueByDataKey does not validate the output type
    name: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_7__/* .getValueByDataKey */ .kr)(node, nameKey, ''),
    [NODE_VALUE_KEY]: nodeValue,
    depth,
    index,
    tooltipIndex: currentTooltipIndex
  });
};
var filterRect = node => ({
  x: node.x,
  y: node.y,
  width: node.width,
  height: node.height
});
// Compute the area for each child based on value & scale.
var getAreaOfChildren = (children, areaValueRatio) => {
  var ratio = areaValueRatio < 0 ? 0 : areaValueRatio;
  return children.map(child => {
    var area = child[NODE_VALUE_KEY] * ratio;
    return _objectSpread(_objectSpread({}, child), {}, {
      area: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_9__/* .isNan */ .M8)(area) || area <= 0 ? 0 : area
    });
  });
};

// Computes the score for the specified row, as the worst aspect ratio.
var getWorstScore = (row, parentSize, aspectRatio) => {
  var parentArea = parentSize * parentSize;
  var rowArea = row.area * row.area;
  var {
    min,
    max
  } = row.reduce((result, child) => ({
    min: Math.min(result.min, child.area),
    max: Math.max(result.max, child.area)
  }), {
    min: Infinity,
    max: 0
  });
  return rowArea ? Math.max(parentArea * max * aspectRatio / rowArea, rowArea / (parentArea * min * aspectRatio)) : Infinity;
};
var horizontalPosition = (row, parentSize, parentRect, isFlush) => {
  var rowHeight = parentSize ? Math.round(row.area / parentSize) : 0;
  if (isFlush || rowHeight > parentRect.height) {
    rowHeight = parentRect.height;
  }
  var curX = parentRect.x;
  var child;
  for (var i = 0, len = row.length; i < len; i++) {
    child = row[i];
    child.x = curX;
    child.y = parentRect.y;
    child.height = rowHeight;
    child.width = Math.min(rowHeight ? Math.round(child.area / rowHeight) : 0, parentRect.x + parentRect.width - curX);
    curX += child.width;
  }
  // add the remain x to the last one of row
  if (child != null) {
    child.width += parentRect.x + parentRect.width - curX;
  }
  return _objectSpread(_objectSpread({}, parentRect), {}, {
    y: parentRect.y + rowHeight,
    height: parentRect.height - rowHeight
  });
};
var verticalPosition = (row, parentSize, parentRect, isFlush) => {
  var rowWidth = parentSize ? Math.round(row.area / parentSize) : 0;
  if (isFlush || rowWidth > parentRect.width) {
    rowWidth = parentRect.width;
  }
  var curY = parentRect.y;
  var child;
  for (var i = 0, len = row.length; i < len; i++) {
    child = row[i];
    child.x = parentRect.x;
    child.y = curY;
    child.width = rowWidth;
    child.height = Math.min(rowWidth ? Math.round(child.area / rowWidth) : 0, parentRect.y + parentRect.height - curY);
    curY += child.height;
  }
  if (child) {
    child.height += parentRect.y + parentRect.height - curY;
  }
  return _objectSpread(_objectSpread({}, parentRect), {}, {
    x: parentRect.x + rowWidth,
    width: parentRect.width - rowWidth
  });
};
var position = (row, parentSize, parentRect, isFlush) => {
  if (parentSize === parentRect.width) {
    return horizontalPosition(row, parentSize, parentRect, isFlush);
  }
  return verticalPosition(row, parentSize, parentRect, isFlush);
};
// Recursively arranges the specified node's children into squarified rows.
var squarify = (node, aspectRatio) => {
  var {
    children
  } = node;
  if (children && children.length) {
    var rect = filterRect(node);
    // @ts-expect-error we can't create an array with static property on a single line so typescript will complain.
    var row = [];
    var best = Infinity; // the best row score so far
    var child, score; // the current row score
    var size = Math.min(rect.width, rect.height); // initial orientation
    var scaleChildren = getAreaOfChildren(children, rect.width * rect.height / node[NODE_VALUE_KEY]);
    var tempChildren = scaleChildren.slice();

    // why are we setting static properties on an array?
    row.area = 0;
    while (tempChildren.length > 0) {
      // row first
      // eslint-disable-next-line prefer-destructuring
      row.push(child = tempChildren[0]);
      row.area += child.area;
      score = getWorstScore(row, size, aspectRatio);
      if (score <= best) {
        // continue with this orientation
        tempChildren.shift();
        best = score;
      } else {
        var _row$pop$area, _row$pop;
        // abort, and try a different orientation
        row.area -= (_row$pop$area = (_row$pop = row.pop()) === null || _row$pop === void 0 ? void 0 : _row$pop.area) !== null && _row$pop$area !== void 0 ? _row$pop$area : 0;
        rect = position(row, size, rect, false);
        size = Math.min(rect.width, rect.height);
        row.length = row.area = 0;
        best = Infinity;
      }
    }
    if (row.length) {
      rect = position(row, size, rect, true);
      row.length = row.area = 0;
    }
    return _objectSpread(_objectSpread({}, node), {}, {
      children: scaleChildren.map(c => squarify(c, aspectRatio))
    });
  }
  return node;
};
var defaultTreeMapProps = {
  aspectRatio: 0.5 * (1 + Math.sqrt(5)),
  dataKey: 'value',
  nameKey: 'name',
  type: 'flat',
  isAnimationActive: !_util_Global__WEBPACK_IMPORTED_MODULE_11__/* .Global */ .m.isSsr,
  isUpdateAnimationActive: !_util_Global__WEBPACK_IMPORTED_MODULE_11__/* .Global */ .m.isSsr,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'linear'
};
var defaultState = {
  isAnimationFinished: false,
  formatRoot: null,
  currentRoot: null,
  nestIndex: [],
  prevAspectRatio: defaultTreeMapProps.aspectRatio,
  prevDataKey: defaultTreeMapProps.dataKey
};
function ContentItem(_ref2) {
  var {
    content,
    nodeProps,
    type,
    colorPanel,
    onMouseEnter,
    onMouseLeave,
    onClick
  } = _ref2;
  if (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(content)) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_3__/* .Layer */ .W, {
      onMouseEnter: onMouseEnter,
      onMouseLeave: onMouseLeave,
      onClick: onClick
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(content, nodeProps));
  }
  if (typeof content === 'function') {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_3__/* .Layer */ .W, {
      onMouseEnter: onMouseEnter,
      onMouseLeave: onMouseLeave,
      onClick: onClick
    }, content(nodeProps));
  }
  // optimize default shape
  var {
    x,
    y,
    width,
    height,
    index
  } = nodeProps;
  var arrow = null;
  if (width > 10 && height > 10 && nodeProps.children && type === 'nest') {
    arrow = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_shape_Polygon__WEBPACK_IMPORTED_MODULE_5__/* .Polygon */ .t, {
      points: [{
        x: x + 2,
        y: y + height / 2
      }, {
        x: x + 6,
        y: y + height / 2 + 3
      }, {
        x: x + 2,
        y: y + height / 2 + 6
      }]
    });
  }
  var text = null;
  var nameSize = (0,_util_DOMUtils__WEBPACK_IMPORTED_MODULE_10__/* .getStringSize */ .Pu)(nodeProps.name);
  if (width > 20 && height > 20 && nameSize.width < width && nameSize.height < height) {
    text = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("text", {
      x: x + 8,
      y: y + height / 2 + 7,
      fontSize: 14
    }, nodeProps.name);
  }
  var colors = colorPanel || _util_Constants__WEBPACK_IMPORTED_MODULE_8__/* .COLOR_PANEL */ .dc;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("g", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_shape_Rectangle__WEBPACK_IMPORTED_MODULE_6__/* .Rectangle */ .M, _extends({
    fill: nodeProps.depth < 2 ? colors[index % colors.length] : 'rgba(255,255,255,0)',
    stroke: "#fff"
  }, es_toolkit_compat_omit__WEBPACK_IMPORTED_MODULE_1___default()(nodeProps, ['children']), {
    onMouseEnter: onMouseEnter,
    onMouseLeave: onMouseLeave,
    onClick: onClick,
    "data-recharts-item-index": nodeProps.tooltipIndex
  })), arrow, text);
}
function ContentItemWithEvents(props) {
  var dispatch = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_18__/* .useAppDispatch */ .j)();
  var activeCoordinate = {
    x: props.nodeProps.x + props.nodeProps.width / 2,
    y: props.nodeProps.y + props.nodeProps.height / 2
  };
  var onMouseEnter = () => {
    dispatch((0,_state_tooltipSlice__WEBPACK_IMPORTED_MODULE_15__/* .setActiveMouseOverItemIndex */ .RD)({
      activeIndex: props.nodeProps.tooltipIndex,
      activeDataKey: props.dataKey,
      activeCoordinate
    }));
  };
  var onMouseLeave = () => {
    // clearing state on mouseLeaveItem causes re-rendering issues
    // we don't actually want to do this for TreeMap - we clear state when we leave the entire chart instead
  };
  var onClick = () => {
    dispatch((0,_state_tooltipSlice__WEBPACK_IMPORTED_MODULE_15__/* .setActiveClickItemIndex */ .ML)({
      activeIndex: props.nodeProps.tooltipIndex,
      activeDataKey: props.dataKey,
      activeCoordinate
    }));
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ContentItem, _extends({}, props, {
    onMouseEnter: onMouseEnter,
    onMouseLeave: onMouseLeave,
    onClick: onClick
  }));
}
function getTooltipEntrySettings(_ref3) {
  var {
    props,
    currentRoot
  } = _ref3;
  var {
    dataKey,
    nameKey,
    stroke,
    fill
  } = props;
  return {
    dataDefinedOnItem: currentRoot,
    positions: undefined,
    // TODO I think Treemap has the capability of computing positions and supporting defaultIndex? Except it doesn't yet
    settings: {
      stroke,
      strokeWidth: undefined,
      fill,
      dataKey,
      nameKey,
      name: undefined,
      // Each TreemapNode has its own name
      hide: false,
      type: undefined,
      color: fill,
      unit: ''
    }
  };
}

// Why is margin not a treemap prop? No clue. Probably it should be
var defaultTreemapMargin = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
};
function TreemapItem(_ref4) {
  var {
    content,
    nodeProps,
    isLeaf,
    treemapProps,
    onNestClick
  } = _ref4;
  var {
    isAnimationActive,
    animationBegin,
    animationDuration,
    animationEasing,
    isUpdateAnimationActive,
    type,
    colorPanel,
    dataKey,
    onAnimationStart,
    onAnimationEnd,
    onMouseEnter: onMouseEnterFromProps,
    onClick: onItemClickFromProps,
    onMouseLeave: onMouseLeaveFromProps
  } = treemapProps;
  var {
    width,
    height,
    x,
    y
  } = nodeProps;
  var translateX = -x - width;
  var translateY = 0;
  var onMouseEnter = e => {
    if ((isLeaf || type === 'nest') && typeof onMouseEnterFromProps === 'function') {
      onMouseEnterFromProps(nodeProps, e);
    }
  };
  var onMouseLeave = e => {
    if ((isLeaf || type === 'nest') && typeof onMouseLeaveFromProps === 'function') {
      onMouseLeaveFromProps(nodeProps, e);
    }
  };
  var onClick = () => {
    if (type === 'nest') {
      onNestClick(nodeProps);
    }
    if ((isLeaf || type === 'nest') && typeof onItemClickFromProps === 'function') {
      onItemClickFromProps(nodeProps);
    }
  };
  var handleAnimationEnd = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    if (typeof onAnimationEnd === 'function') {
      onAnimationEnd();
    }
  }, [onAnimationEnd]);
  var handleAnimationStart = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    if (typeof onAnimationStart === 'function') {
      onAnimationStart();
    }
  }, [onAnimationStart]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_animation_CSSTransitionAnimate__WEBPACK_IMPORTED_MODULE_21__/* .CSSTransitionAnimate */ .a, {
    animationId: "treemap-".concat(nodeProps.tooltipIndex),
    from: "translate(".concat(translateX, "px, ").concat(translateY, "px)"),
    to: "translate(0, 0)",
    attributeName: "transform",
    begin: animationBegin,
    easing: animationEasing,
    isActive: isAnimationActive,
    duration: animationDuration,
    onAnimationStart: handleAnimationStart,
    onAnimationEnd: handleAnimationEnd
  }, style => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_3__/* .Layer */ .W, {
    onMouseEnter: onMouseEnter,
    onMouseLeave: onMouseLeave,
    onClick: onClick,
    style: _objectSpread(_objectSpread({}, style), {}, {
      transformOrigin: "".concat(x, " ").concat(y)
    })
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ContentItemWithEvents, {
    content: content,
    dataKey: dataKey,
    nodeProps: _objectSpread(_objectSpread({}, nodeProps), {}, {
      isAnimationActive,
      isUpdateAnimationActive: !isUpdateAnimationActive,
      width,
      height,
      x,
      y
    }),
    type: type,
    colorPanel: colorPanel
  })));
}
class TreemapWithState extends react__WEBPACK_IMPORTED_MODULE_0__.PureComponent {
  constructor() {
    super(...arguments);
    _defineProperty(this, "state", _objectSpread({}, defaultState));
    _defineProperty(this, "handleClick", node => {
      var {
        onClick,
        type
      } = this.props;
      if (type === 'nest' && node.children) {
        var {
          width,
          height,
          dataKey,
          nameKey,
          aspectRatio
        } = this.props;
        var root = computeNode({
          depth: 0,
          node: _objectSpread(_objectSpread({}, node), {}, {
            x: 0,
            y: 0,
            width,
            height
          }),
          index: 0,
          dataKey,
          nameKey,
          // with Treemap nesting, should this continue nesting the index or start from empty string?
          nestedActiveTooltipIndex: node.tooltipIndex
        });
        var formatRoot = squarify(root, aspectRatio);
        var {
          nestIndex
        } = this.state;
        nestIndex.push(node);
        this.setState({
          formatRoot,
          currentRoot: root,
          nestIndex
        });
      }
      if (onClick) {
        onClick(node);
      }
    });
    _defineProperty(this, "handleTouchMove", e => {
      var touchEvent = e.touches[0];
      var target = document.elementFromPoint(touchEvent.clientX, touchEvent.clientY);
      if (!target || !target.getAttribute || this.state.formatRoot == null) {
        return;
      }
      var itemIndex = target.getAttribute('data-recharts-item-index');
      var activeNode = treemapPayloadSearcher(this.state.formatRoot, itemIndex);
      if (!activeNode) {
        return;
      }
      var {
        dataKey,
        dispatch
      } = this.props;
      var activeCoordinate = {
        x: activeNode.x + activeNode.width / 2,
        y: activeNode.y + activeNode.height / 2
      };

      // Treemap does not support onTouchMove prop, but it could
      // onTouchMove?.(activeNode, Number(itemIndex), e);
      dispatch((0,_state_tooltipSlice__WEBPACK_IMPORTED_MODULE_15__/* .setActiveMouseOverItemIndex */ .RD)({
        activeIndex: itemIndex,
        activeDataKey: dataKey,
        activeCoordinate
      }));
    });
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.data !== prevState.prevData || nextProps.type !== prevState.prevType || nextProps.width !== prevState.prevWidth || nextProps.height !== prevState.prevHeight || nextProps.dataKey !== prevState.prevDataKey || nextProps.aspectRatio !== prevState.prevAspectRatio) {
      var root = computeNode({
        depth: 0,
        // @ts-expect-error missing properties
        node: {
          children: nextProps.data,
          x: 0,
          y: 0,
          width: nextProps.width,
          height: nextProps.height
        },
        index: 0,
        dataKey: nextProps.dataKey,
        nameKey: nextProps.nameKey
      });
      var formatRoot = squarify(root, nextProps.aspectRatio);
      return _objectSpread(_objectSpread({}, prevState), {}, {
        formatRoot,
        currentRoot: root,
        nestIndex: [root],
        prevAspectRatio: nextProps.aspectRatio,
        prevData: nextProps.data,
        prevWidth: nextProps.width,
        prevHeight: nextProps.height,
        prevDataKey: nextProps.dataKey,
        prevType: nextProps.type
      });
    }
    return null;
  }
  handleNestIndex(node, i) {
    var {
      nestIndex
    } = this.state;
    var {
      width,
      height,
      dataKey,
      nameKey,
      aspectRatio
    } = this.props;
    var root = computeNode({
      depth: 0,
      node: _objectSpread(_objectSpread({}, node), {}, {
        x: 0,
        y: 0,
        width,
        height
      }),
      index: 0,
      dataKey,
      nameKey,
      // with Treemap nesting, should this continue nesting the index or start from empty string?
      nestedActiveTooltipIndex: node.tooltipIndex
    });
    var formatRoot = squarify(root, aspectRatio);
    nestIndex = nestIndex.slice(0, i + 1);
    this.setState({
      formatRoot,
      currentRoot: node,
      nestIndex
    });
  }
  renderNode(root, node) {
    var {
      content,
      type
    } = this.props;
    var nodeProps = _objectSpread(_objectSpread(_objectSpread({}, (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_20__/* .svgPropertiesNoEvents */ .uZ)(this.props)), node), {}, {
      root
    });
    var isLeaf = !node.children || !node.children.length;
    var {
      currentRoot
    } = this.state;
    var isCurrentRootChild = ((currentRoot === null || currentRoot === void 0 ? void 0 : currentRoot.children) || []).filter(item => item.depth === node.depth && item.name === node.name);
    if (!isCurrentRootChild.length && root.depth && type === 'nest') {
      return null;
    }
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_3__/* .Layer */ .W, {
      key: "recharts-treemap-node-".concat(nodeProps.x, "-").concat(nodeProps.y, "-").concat(nodeProps.name),
      className: "recharts-treemap-depth-".concat(node.depth)
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(TreemapItem, {
      isLeaf: isLeaf,
      content: content,
      nodeProps: nodeProps,
      treemapProps: this.props,
      onNestClick: this.handleClick
    }), node.children && node.children.length ? node.children.map(child => this.renderNode(node, child)) : null);
  }
  renderAllNodes() {
    var {
      formatRoot
    } = this.state;
    if (!formatRoot) {
      return null;
    }
    return this.renderNode(formatRoot, formatRoot);
  }

  // render nest treemap
  renderNestIndex() {
    var {
      nameKey,
      nestIndexContent
    } = this.props;
    var {
      nestIndex
    } = this.state;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
      className: "recharts-treemap-nest-index-wrapper",
      style: {
        marginTop: '8px',
        textAlign: 'center'
      }
    }, nestIndex.map((item, i) => {
      // TODO need to verify nameKey type
      var name = es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_2___default()(item, nameKey, 'root');
      var content;
      if (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(nestIndexContent)) {
        // the cloned content is ignored at all times - let's remove it?
        content = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(nestIndexContent, item, i);
      }
      if (typeof nestIndexContent === 'function') {
        content = nestIndexContent(item, i);
      } else {
        content = name;
      }
      return (
        /*#__PURE__*/
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
          onClick: this.handleNestIndex.bind(this, item, i),
          key: "nest-index-".concat((0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_9__/* .uniqueId */ .NF)()),
          className: "recharts-treemap-nest-index-box",
          style: {
            cursor: 'pointer',
            display: 'inline-block',
            padding: '0 7px',
            background: '#000',
            color: '#fff',
            marginRight: '3px'
          }
        }, content)
      );
    }));
  }
  render() {
    var _this$props = this.props,
      {
        width,
        height,
        className,
        style,
        children,
        type
      } = _this$props,
      others = _objectWithoutProperties(_this$props, _excluded);
    var attrs = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_20__/* .svgPropertiesNoEvents */ .uZ)(others);
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_16__/* .SetTooltipEntrySettings */ .r, {
      fn: getTooltipEntrySettings,
      args: {
        props: this.props,
        currentRoot: this.state.currentRoot
      }
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Surface__WEBPACK_IMPORTED_MODULE_4__/* .Surface */ .u, _extends({}, attrs, {
      width: width,
      height: type === 'nest' ? height - 30 : height,
      onTouchMove: this.handleTouchMove
    }), this.renderAllNodes(), children), type === 'nest' && this.renderNestIndex());
  }
}
_defineProperty(TreemapWithState, "displayName", 'Treemap');
function TreemapDispatchInject(props) {
  var dispatch = useAppDispatch();
  var width = useChartWidth();
  var height = useChartHeight();
  if (!isPositiveNumber(width) || !isPositiveNumber(height)) {
    return null;
  }
  return /*#__PURE__*/React.createElement(TreemapWithState, _extends({}, props, {
    width: width,
    height: height,
    dispatch: dispatch
  }));
}
function Treemap(outsideProps) {
  var _props$className;
  var props = resolveDefaultProps(outsideProps, defaultTreeMapProps);
  var {
    className,
    style,
    width,
    height
  } = props;
  var [tooltipPortal, setTooltipPortal] = useState(null);
  return /*#__PURE__*/React.createElement(RechartsStoreProvider, {
    preloadedState: {
      options
    },
    reduxStoreName: (_props$className = props.className) !== null && _props$className !== void 0 ? _props$className : 'Treemap'
  }, /*#__PURE__*/React.createElement(ReportChartMargin, {
    margin: defaultTreemapMargin
  }), /*#__PURE__*/React.createElement(RechartsWrapper, {
    dispatchTouchEvents: false,
    className: className,
    style: style,
    width: width,
    height: height
    /*
     * Treemap has a bug where it doesn't include strokeWidth in its dimension calculation
     * which makes the actual chart exactly {strokeWidth} larger than asked for.
     * It's not a huge deal usually, but it makes the responsive option cycle infinitely.
     */,
    responsive: false,
    ref: node => {
      if (tooltipPortal == null && node != null) {
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
  }, /*#__PURE__*/React.createElement(TooltipPortalContext.Provider, {
    value: tooltipPortal
  }, /*#__PURE__*/React.createElement(TreemapDispatchInject, props))));
}

/***/ }),

/***/ 59853:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* unused harmony export ScatterChart */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _state_optionsSlice__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(26960);
/* harmony import */ var _CartesianChart__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(72685);




var allowedTooltipTypes = (/* unused pure expression or super */ null && (['item']));
var ScatterChart = /*#__PURE__*/(/* unused pure expression or super */ null && (forwardRef((props, ref) => {
  return /*#__PURE__*/React.createElement(CartesianChart, {
    chartName: "ScatterChart",
    defaultTooltipEventType: "item",
    validateTooltipEventTypes: allowedTooltipTypes,
    tooltipPayloadSearcher: arrayTooltipSearcher,
    categoricalChartProps: props,
    ref: ref
  });
})));

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVuZG9yLWNvbW1vbi0yZjNlZGNiNi4wMGI2MzNlYjRmN2U0MGNhYTI1Ni5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxzQkFBc0Isd0VBQXdFLGdCQUFnQixzQkFBc0IsT0FBTyxzQkFBc0Isb0JBQW9CLGdEQUFnRCxXQUFXO0FBQ2hQLHlCQUF5Qix3QkFBd0Isb0NBQW9DLHlDQUF5QyxrQ0FBa0MsMERBQTBELDBCQUEwQjtBQUNwUCw0QkFBNEIsZ0JBQWdCLHNCQUFzQixPQUFPLGtEQUFrRCxzREFBc0QsOEJBQThCLG1KQUFtSixxRUFBcUUsS0FBSztBQUM1YSxvQ0FBb0Msb0VBQW9FLDBEQUEwRDtBQUNsSyw2QkFBNkIsbUNBQW1DO0FBQ2hFLDhCQUE4QiwwQ0FBMEMsK0JBQStCLG9CQUFvQixtQ0FBbUMsb0NBQW9DLHVFQUF1RTtBQUMxTztBQUNFO0FBQ3FCO0FBQzFCO0FBQ1k7QUFDTztBQUNKO0FBQ0Y7QUFDQTtBQUNhO0FBQzREO0FBQzNDO0FBQ25CO0FBQ3lEO0FBQ2xDO0FBQ0o7QUFDdkI7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUCxTQUFTLDREQUFHO0FBQ1o7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSw2QkFBNkI7O0FBRTdCO0FBQ0E7QUFDQTtBQUNBLHdEQUF3RCxRQUFRO0FBQ2hFO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLHFEQUFxRDtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFD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RUFBTyxhQUFhO0FBQzdEO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVFQUF1RTtBQUN2RTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLGFBQWE7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSCxDOzs7Ozs7Ozs7OztBQ3J4QitCO0FBQ0k7QUFDMEI7QUFDWDtBQUNsRCwwQkFBMEIsd0RBQVE7QUFDM0IsZ0NBQWdDO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNILENBQUMsQ0FBQyxHIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L2NoYXJ0L1N1bmJ1cnN0Q2hhcnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L2NoYXJ0L1RyZWVtYXAuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L2NoYXJ0L1NjYXR0ZXJDaGFydC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBfZXh0ZW5kcygpIHsgcmV0dXJuIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiA/IE9iamVjdC5hc3NpZ24uYmluZCgpIDogZnVuY3Rpb24gKG4pIHsgZm9yICh2YXIgZSA9IDE7IGUgPCBhcmd1bWVudHMubGVuZ3RoOyBlKyspIHsgdmFyIHQgPSBhcmd1bWVudHNbZV07IGZvciAodmFyIHIgaW4gdCkgKHt9KS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHQsIHIpICYmIChuW3JdID0gdFtyXSk7IH0gcmV0dXJuIG47IH0sIF9leHRlbmRzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7IH1cbmZ1bmN0aW9uIG93bktleXMoZSwgcikgeyB2YXIgdCA9IE9iamVjdC5rZXlzKGUpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IHIgJiYgKG8gPSBvLmZpbHRlcihmdW5jdGlvbiAocikgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihlLCByKS5lbnVtZXJhYmxlOyB9KSksIHQucHVzaC5hcHBseSh0LCBvKTsgfSByZXR1cm4gdDsgfVxuZnVuY3Rpb24gX29iamVjdFNwcmVhZChlKSB7IGZvciAodmFyIHIgPSAxOyByIDwgYXJndW1lbnRzLmxlbmd0aDsgcisrKSB7IHZhciB0ID0gbnVsbCAhPSBhcmd1bWVudHNbcl0gPyBhcmd1bWVudHNbcl0gOiB7fTsgciAlIDIgPyBvd25LZXlzKE9iamVjdCh0KSwgITApLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgX2RlZmluZVByb3BlcnR5KGUsIHIsIHRbcl0pOyB9KSA6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModCkpIDogb3duS2V5cyhPYmplY3QodCkpLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodCwgcikpOyB9KTsgfSByZXR1cm4gZTsgfVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KGUsIHIsIHQpIHsgcmV0dXJuIChyID0gX3RvUHJvcGVydHlLZXkocikpIGluIGUgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgeyB2YWx1ZTogdCwgZW51bWVyYWJsZTogITAsIGNvbmZpZ3VyYWJsZTogITAsIHdyaXRhYmxlOiAhMCB9KSA6IGVbcl0gPSB0LCBlOyB9XG5mdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleSh0KSB7IHZhciBpID0gX3RvUHJpbWl0aXZlKHQsIFwic3RyaW5nXCIpOyByZXR1cm4gXCJzeW1ib2xcIiA9PSB0eXBlb2YgaSA/IGkgOiBpICsgXCJcIjsgfVxuZnVuY3Rpb24gX3RvUHJpbWl0aXZlKHQsIHIpIHsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIHQgfHwgIXQpIHJldHVybiB0OyB2YXIgZSA9IHRbU3ltYm9sLnRvUHJpbWl0aXZlXTsgaWYgKHZvaWQgMCAhPT0gZSkgeyB2YXIgaSA9IGUuY2FsbCh0LCByIHx8IFwiZGVmYXVsdFwiKTsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIGkpIHJldHVybiBpOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7IH0gcmV0dXJuIChcInN0cmluZ1wiID09PSByID8gU3RyaW5nIDogTnVtYmVyKSh0KTsgfVxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBzY2FsZUxpbmVhciB9IGZyb20gJ3ZpY3RvcnktdmVuZG9yL2QzLXNjYWxlJztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCBnZXQgZnJvbSAnZXMtdG9vbGtpdC9jb21wYXQvZ2V0JztcbmltcG9ydCB7IFN1cmZhY2UgfSBmcm9tICcuLi9jb250YWluZXIvU3VyZmFjZSc7XG5pbXBvcnQgeyBMYXllciB9IGZyb20gJy4uL2NvbnRhaW5lci9MYXllcic7XG5pbXBvcnQgeyBTZWN0b3IgfSBmcm9tICcuLi9zaGFwZS9TZWN0b3InO1xuaW1wb3J0IHsgVGV4dCB9IGZyb20gJy4uL2NvbXBvbmVudC9UZXh0JztcbmltcG9ydCB7IHBvbGFyVG9DYXJ0ZXNpYW4gfSBmcm9tICcuLi91dGlsL1BvbGFyVXRpbHMnO1xuaW1wb3J0IHsgUmVwb3J0Q2hhcnRNYXJnaW4sIFJlcG9ydENoYXJ0U2l6ZSwgdXNlQ2hhcnRIZWlnaHQsIHVzZUNoYXJ0V2lkdGggfSBmcm9tICcuLi9jb250ZXh0L2NoYXJ0TGF5b3V0Q29udGV4dCc7XG5pbXBvcnQgeyBUb29sdGlwUG9ydGFsQ29udGV4dCB9IGZyb20gJy4uL2NvbnRleHQvdG9vbHRpcFBvcnRhbENvbnRleHQnO1xuaW1wb3J0IHsgUmVjaGFydHNXcmFwcGVyIH0gZnJvbSAnLi9SZWNoYXJ0c1dyYXBwZXInO1xuaW1wb3J0IHsgbW91c2VMZWF2ZUl0ZW0sIHNldEFjdGl2ZUNsaWNrSXRlbUluZGV4LCBzZXRBY3RpdmVNb3VzZU92ZXJJdGVtSW5kZXggfSBmcm9tICcuLi9zdGF0ZS90b29sdGlwU2xpY2UnO1xuaW1wb3J0IHsgU2V0VG9vbHRpcEVudHJ5U2V0dGluZ3MgfSBmcm9tICcuLi9zdGF0ZS9TZXRUb29sdGlwRW50cnlTZXR0aW5ncyc7XG5pbXBvcnQgeyBSZWNoYXJ0c1N0b3JlUHJvdmlkZXIgfSBmcm9tICcuLi9zdGF0ZS9SZWNoYXJ0c1N0b3JlUHJvdmlkZXInO1xuaW1wb3J0IHsgdXNlQXBwRGlzcGF0Y2ggfSBmcm9tICcuLi9zdGF0ZS9ob29rcyc7XG52YXIgZGVmYXVsdFRleHRQcm9wcyA9IHtcbiAgZm9udFdlaWdodDogJ2JvbGQnLFxuICBwYWludE9yZGVyOiAnc3Ryb2tlIGZpbGwnLFxuICBmb250U2l6ZTogJy43NXJlbScsXG4gIHN0cm9rZTogJyNGRkYnLFxuICBmaWxsOiAnYmxhY2snLFxuICBwb2ludGVyRXZlbnRzOiAnbm9uZSdcbn07XG5mdW5jdGlvbiBnZXRNYXhEZXB0aE9mKG5vZGUpIHtcbiAgaWYgKCFub2RlLmNoaWxkcmVuIHx8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSByZXR1cm4gMTtcblxuICAvLyBDYWxjdWxhdGUgZGVwdGggZm9yIGVhY2ggY2hpbGQgYW5kIGZpbmQgdGhlIG1heGltdW1cbiAgdmFyIGNoaWxkRGVwdGhzID0gbm9kZS5jaGlsZHJlbi5tYXAoZCA9PiBnZXRNYXhEZXB0aE9mKGQpKTtcbiAgcmV0dXJuIDEgKyBNYXRoLm1heCguLi5jaGlsZERlcHRocyk7XG59XG5mdW5jdGlvbiBjb252ZXJ0TWFwVG9SZWNvcmQobWFwKSB7XG4gIHZhciByZWNvcmQgPSB7fTtcbiAgbWFwLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICByZWNvcmRba2V5XSA9IHZhbHVlO1xuICB9KTtcbiAgcmV0dXJuIHJlY29yZDtcbn1cbmZ1bmN0aW9uIGdldFRvb2x0aXBFbnRyeVNldHRpbmdzKF9yZWYpIHtcbiAgdmFyIHtcbiAgICBkYXRhS2V5LFxuICAgIG5hbWVLZXksXG4gICAgZGF0YSxcbiAgICBzdHJva2UsXG4gICAgZmlsbCxcbiAgICBwb3NpdGlvbnNcbiAgfSA9IF9yZWY7XG4gIHJldHVybiB7XG4gICAgZGF0YURlZmluZWRPbkl0ZW06IGRhdGEuY2hpbGRyZW4sXG4gICAgLy8gUmVkdXggc3RvcmUgd2lsbCBub3QgYWNjZXB0IGEgTWFwIGJlY2F1c2UgaXQncyBub3Qgc2VyaWFsaXphYmxlXG4gICAgcG9zaXRpb25zOiBjb252ZXJ0TWFwVG9SZWNvcmQocG9zaXRpb25zKSxcbiAgICAvLyBTdW5idXJzdCBkb2VzIG5vdCBzdXBwb3J0IG1hbnkgb2YgdGhlIHByb3BlcnRpZXMgYXMgb3RoZXIgY2hhcnRzIGRvIHNvIHRoZXJlJ3MgcGxlbnR5IG9mIGRlZmF1bHRzIGhlcmVcbiAgICBzZXR0aW5nczoge1xuICAgICAgc3Ryb2tlLFxuICAgICAgc3Ryb2tlV2lkdGg6IHVuZGVmaW5lZCxcbiAgICAgIGZpbGwsXG4gICAgICBuYW1lS2V5LFxuICAgICAgZGF0YUtleSxcbiAgICAgIC8vIGlmIHRoZXJlIGlzIGEgbmFtZUtleSB1c2UgaXQsIG90aGVyd2lzZSBtYWtlIHRoZSBuYW1lIG9mIHRoZSB0b29sdGlwIHRoZSBkYXRhS2V5IGl0c2VsZlxuICAgICAgbmFtZTogbmFtZUtleSA/IHVuZGVmaW5lZCA6IGRhdGFLZXksXG4gICAgICBoaWRlOiBmYWxzZSxcbiAgICAgIHR5cGU6IHVuZGVmaW5lZCxcbiAgICAgIGNvbG9yOiBmaWxsLFxuICAgICAgdW5pdDogJydcbiAgICB9XG4gIH07XG59XG5cbi8vIFdoeSBpcyBtYXJnaW4gbm90IGEgc3VuYnVyc3QgcHJvcD8gTm8gY2x1ZS4gUHJvYmFibHkgaXQgc2hvdWxkIGJlXG52YXIgZGVmYXVsdFN1bmJ1cnN0TWFyZ2luID0ge1xuICB0b3A6IDAsXG4gIHJpZ2h0OiAwLFxuICBib3R0b206IDAsXG4gIGxlZnQ6IDBcbn07XG5leHBvcnQgdmFyIHBheWxvYWRTZWFyY2hlciA9IChkYXRhLCBhY3RpdmVJbmRleCkgPT4ge1xuICByZXR1cm4gZ2V0KGRhdGEsIGFjdGl2ZUluZGV4KTtcbn07XG5leHBvcnQgdmFyIGFkZFRvU3VuYnVyc3ROb2RlSW5kZXggPSBmdW5jdGlvbiBhZGRUb1N1bmJ1cnN0Tm9kZUluZGV4KGluZGV4SW5DaGlsZHJlbkFycikge1xuICB2YXIgYWN0aXZlVG9vbHRpcEluZGV4U29GYXIgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6ICcnO1xuICByZXR1cm4gXCJcIi5jb25jYXQoYWN0aXZlVG9vbHRpcEluZGV4U29GYXIsIFwiY2hpbGRyZW5bXCIpLmNvbmNhdChpbmRleEluQ2hpbGRyZW5BcnIsIFwiXVwiKTtcbn07XG52YXIgcHJlbG9hZGVkU3RhdGUgPSB7XG4gIG9wdGlvbnM6IHtcbiAgICB2YWxpZGF0ZVRvb2x0aXBFdmVudFR5cGVzOiBbJ2l0ZW0nXSxcbiAgICBkZWZhdWx0VG9vbHRpcEV2ZW50VHlwZTogJ2l0ZW0nLFxuICAgIGNoYXJ0TmFtZTogJ1N1bmJ1cnN0JyxcbiAgICB0b29sdGlwUGF5bG9hZFNlYXJjaGVyOiBwYXlsb2FkU2VhcmNoZXIsXG4gICAgZXZlbnRFbWl0dGVyOiB1bmRlZmluZWRcbiAgfVxufTtcbnZhciBTdW5idXJzdENoYXJ0SW1wbCA9IF9yZWYyID0+IHtcbiAgdmFyIHtcbiAgICBjbGFzc05hbWUsXG4gICAgZGF0YSxcbiAgICBjaGlsZHJlbixcbiAgICBwYWRkaW5nID0gMixcbiAgICBkYXRhS2V5ID0gJ3ZhbHVlJyxcbiAgICBuYW1lS2V5ID0gJ25hbWUnLFxuICAgIHJpbmdQYWRkaW5nID0gMixcbiAgICBpbm5lclJhZGl1cyA9IDUwLFxuICAgIGZpbGwgPSAnIzMzMycsXG4gICAgc3Ryb2tlID0gJyNGRkYnLFxuICAgIHRleHRPcHRpb25zID0gZGVmYXVsdFRleHRQcm9wcyxcbiAgICBvdXRlclJhZGl1czogb3V0ZXJSYWRpdXNGcm9tUHJvcHMsXG4gICAgY3g6IGN4RnJvbVByb3BzLFxuICAgIGN5OiBjeUZyb21Qcm9wcyxcbiAgICBzdGFydEFuZ2xlID0gMCxcbiAgICBlbmRBbmdsZSA9IDM2MCxcbiAgICBvbkNsaWNrLFxuICAgIG9uTW91c2VFbnRlcixcbiAgICBvbk1vdXNlTGVhdmUsXG4gICAgcmVzcG9uc2l2ZSA9IGZhbHNlLFxuICAgIHN0eWxlXG4gIH0gPSBfcmVmMjtcbiAgdmFyIGRpc3BhdGNoID0gdXNlQXBwRGlzcGF0Y2goKTtcbiAgdmFyIHdpZHRoID0gdXNlQ2hhcnRXaWR0aCgpO1xuICB2YXIgaGVpZ2h0ID0gdXNlQ2hhcnRIZWlnaHQoKTtcbiAgdmFyIG91dGVyUmFkaXVzID0gb3V0ZXJSYWRpdXNGcm9tUHJvcHMgIT09IG51bGwgJiYgb3V0ZXJSYWRpdXNGcm9tUHJvcHMgIT09IHZvaWQgMCA/IG91dGVyUmFkaXVzRnJvbVByb3BzIDogTWF0aC5taW4od2lkdGgsIGhlaWdodCkgLyAyO1xuICB2YXIgY3ggPSBjeEZyb21Qcm9wcyAhPT0gbnVsbCAmJiBjeEZyb21Qcm9wcyAhPT0gdm9pZCAwID8gY3hGcm9tUHJvcHMgOiB3aWR0aCAvIDI7XG4gIHZhciBjeSA9IGN5RnJvbVByb3BzICE9PSBudWxsICYmIGN5RnJvbVByb3BzICE9PSB2b2lkIDAgPyBjeUZyb21Qcm9wcyA6IGhlaWdodCAvIDI7XG4gIHZhciByU2NhbGUgPSBzY2FsZUxpbmVhcihbMCwgZGF0YVtkYXRhS2V5XV0sIFswLCBlbmRBbmdsZV0pO1xuICB2YXIgdHJlZURlcHRoID0gZ2V0TWF4RGVwdGhPZihkYXRhKTtcbiAgdmFyIHRoaWNrbmVzcyA9IChvdXRlclJhZGl1cyAtIGlubmVyUmFkaXVzKSAvIHRyZWVEZXB0aDtcbiAgdmFyIHNlY3RvcnMgPSBbXTtcbiAgdmFyIHBvc2l0aW9ucyA9IG5ldyBNYXAoW10pO1xuICB2YXIgW3Rvb2x0aXBQb3J0YWwsIHNldFRvb2x0aXBQb3J0YWxdID0gdXNlU3RhdGUobnVsbCk7XG4gIC8vIGV2ZW50IGhhbmRsZXJzXG4gIGZ1bmN0aW9uIGhhbmRsZU1vdXNlRW50ZXIobm9kZSwgZSkge1xuICAgIGlmIChvbk1vdXNlRW50ZXIpIG9uTW91c2VFbnRlcihub2RlLCBlKTtcbiAgICBkaXNwYXRjaChzZXRBY3RpdmVNb3VzZU92ZXJJdGVtSW5kZXgoe1xuICAgICAgYWN0aXZlSW5kZXg6IG5vZGUudG9vbHRpcEluZGV4LFxuICAgICAgYWN0aXZlRGF0YUtleTogZGF0YUtleSxcbiAgICAgIGFjdGl2ZUNvb3JkaW5hdGU6IHBvc2l0aW9ucy5nZXQobm9kZS5uYW1lKVxuICAgIH0pKTtcbiAgfVxuICBmdW5jdGlvbiBoYW5kbGVNb3VzZUxlYXZlKG5vZGUsIGUpIHtcbiAgICBpZiAob25Nb3VzZUxlYXZlKSBvbk1vdXNlTGVhdmUobm9kZSwgZSk7XG4gICAgZGlzcGF0Y2gobW91c2VMZWF2ZUl0ZW0oKSk7XG4gIH1cbiAgZnVuY3Rpb24gaGFuZGxlQ2xpY2sobm9kZSkge1xuICAgIGlmIChvbkNsaWNrKSBvbkNsaWNrKG5vZGUpO1xuICAgIGRpc3BhdGNoKHNldEFjdGl2ZUNsaWNrSXRlbUluZGV4KHtcbiAgICAgIGFjdGl2ZUluZGV4OiBub2RlLnRvb2x0aXBJbmRleCxcbiAgICAgIGFjdGl2ZURhdGFLZXk6IGRhdGFLZXksXG4gICAgICBhY3RpdmVDb29yZGluYXRlOiBwb3NpdGlvbnMuZ2V0KG5vZGUubmFtZSlcbiAgICB9KSk7XG4gIH1cblxuICAvLyByZWN1cnNpdmVseSBhZGQgbm9kZXMgZm9yIGVhY2ggZGF0YSBwb2ludCBhbmQgaXRzIGNoaWxkcmVuXG4gIGZ1bmN0aW9uIGRyYXdBcmNzKGNoaWxkTm9kZXMsIG9wdGlvbnMpIHtcbiAgICB2YXIgZGVwdGggPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IDE7XG4gICAgdmFyIHtcbiAgICAgIHJhZGl1cyxcbiAgICAgIGlubmVyUixcbiAgICAgIGluaXRpYWxBbmdsZSxcbiAgICAgIGNoaWxkQ29sb3IsXG4gICAgICBuZXN0ZWRBY3RpdmVUb29sdGlwSW5kZXhcbiAgICB9ID0gb3B0aW9ucztcbiAgICB2YXIgY3VycmVudEFuZ2xlID0gaW5pdGlhbEFuZ2xlO1xuICAgIGlmICghY2hpbGROb2RlcykgcmV0dXJuOyAvLyBiYXNlIGNhc2U6IG5vIGNoaWxkcmVuIG9mIHRoaXMgbm9kZVxuXG4gICAgY2hpbGROb2Rlcy5mb3JFYWNoKChkLCBpKSA9PiB7XG4gICAgICB2YXIgX3JlZjMsIF9kJGZpbGw7XG4gICAgICB2YXIgY3VycmVudFRvb2x0aXBJbmRleCA9IGRlcHRoID09PSAxID8gXCJbXCIuY29uY2F0KGksIFwiXVwiKSA6IGFkZFRvU3VuYnVyc3ROb2RlSW5kZXgoaSwgbmVzdGVkQWN0aXZlVG9vbHRpcEluZGV4KTtcbiAgICAgIHZhciBub2RlV2l0aEluZGV4ID0gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBkKSwge30sIHtcbiAgICAgICAgdG9vbHRpcEluZGV4OiBjdXJyZW50VG9vbHRpcEluZGV4XG4gICAgICB9KTtcbiAgICAgIHZhciBhcmNMZW5ndGggPSByU2NhbGUoZFtkYXRhS2V5XSk7XG4gICAgICB2YXIgc3RhcnQgPSBjdXJyZW50QW5nbGU7XG4gICAgICAvLyBjb2xvciBwcmlvcml0eSAtIGlmIHRoZXJlJ3MgYSBjb2xvciBvbiB0aGUgaW5kaXZpZHVhbCBwb2ludCB1c2UgdGhhdCwgb3RoZXJ3aXNlIHVzZSBwYXJlbnQgY29sb3Igb3IgZGVmYXVsdFxuICAgICAgdmFyIGZpbGxDb2xvciA9IChfcmVmMyA9IChfZCRmaWxsID0gZCA9PT0gbnVsbCB8fCBkID09PSB2b2lkIDAgPyB2b2lkIDAgOiBkLmZpbGwpICE9PSBudWxsICYmIF9kJGZpbGwgIT09IHZvaWQgMCA/IF9kJGZpbGwgOiBjaGlsZENvbG9yKSAhPT0gbnVsbCAmJiBfcmVmMyAhPT0gdm9pZCAwID8gX3JlZjMgOiBmaWxsO1xuICAgICAgdmFyIHtcbiAgICAgICAgeDogdGV4dFgsXG4gICAgICAgIHk6IHRleHRZXG4gICAgICB9ID0gcG9sYXJUb0NhcnRlc2lhbigwLCAwLCBpbm5lclIgKyByYWRpdXMgLyAyLCAtKHN0YXJ0ICsgYXJjTGVuZ3RoIC0gYXJjTGVuZ3RoIC8gMikpO1xuICAgICAgY3VycmVudEFuZ2xlICs9IGFyY0xlbmd0aDtcbiAgICAgIHNlY3RvcnMucHVzaChcbiAgICAgIC8qI19fUFVSRV9fKi9cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC9uby1hcnJheS1pbmRleC1rZXlcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJnXCIsIHtcbiAgICAgICAga2V5OiBcInN1bmJ1cnN0LXNlY3Rvci1cIi5jb25jYXQoZC5uYW1lLCBcIi1cIikuY29uY2F0KGkpXG4gICAgICB9LCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTZWN0b3IsIHtcbiAgICAgICAgb25DbGljazogKCkgPT4gaGFuZGxlQ2xpY2sobm9kZVdpdGhJbmRleCksXG4gICAgICAgIG9uTW91c2VFbnRlcjogZSA9PiBoYW5kbGVNb3VzZUVudGVyKG5vZGVXaXRoSW5kZXgsIGUpLFxuICAgICAgICBvbk1vdXNlTGVhdmU6IGUgPT4gaGFuZGxlTW91c2VMZWF2ZShub2RlV2l0aEluZGV4LCBlKSxcbiAgICAgICAgZmlsbDogZmlsbENvbG9yLFxuICAgICAgICBzdHJva2U6IHN0cm9rZSxcbiAgICAgICAgc3Ryb2tlV2lkdGg6IHBhZGRpbmcsXG4gICAgICAgIHN0YXJ0QW5nbGU6IHN0YXJ0LFxuICAgICAgICBlbmRBbmdsZTogc3RhcnQgKyBhcmNMZW5ndGgsXG4gICAgICAgIGlubmVyUmFkaXVzOiBpbm5lclIsXG4gICAgICAgIG91dGVyUmFkaXVzOiBpbm5lclIgKyByYWRpdXMsXG4gICAgICAgIGN4OiBjeCxcbiAgICAgICAgY3k6IGN5XG4gICAgICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoVGV4dCwgX2V4dGVuZHMoe30sIHRleHRPcHRpb25zLCB7XG4gICAgICAgIGFsaWdubWVudEJhc2VsaW5lOiBcIm1pZGRsZVwiLFxuICAgICAgICB0ZXh0QW5jaG9yOiBcIm1pZGRsZVwiLFxuICAgICAgICB4OiB0ZXh0WCArIGN4LFxuICAgICAgICB5OiBjeSAtIHRleHRZXG4gICAgICB9KSwgZFtkYXRhS2V5XSkpKTtcbiAgICAgIHZhciB7XG4gICAgICAgIHg6IHRvb2x0aXBYLFxuICAgICAgICB5OiB0b29sdGlwWVxuICAgICAgfSA9IHBvbGFyVG9DYXJ0ZXNpYW4oY3gsIGN5LCBpbm5lclIgKyByYWRpdXMgLyAyLCBzdGFydCk7XG4gICAgICBwb3NpdGlvbnMuc2V0KGQubmFtZSwge1xuICAgICAgICB4OiB0b29sdGlwWCxcbiAgICAgICAgeTogdG9vbHRpcFlcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGRyYXdBcmNzKGQuY2hpbGRyZW4sIHtcbiAgICAgICAgcmFkaXVzLFxuICAgICAgICBpbm5lclI6IGlubmVyUiArIHJhZGl1cyArIHJpbmdQYWRkaW5nLFxuICAgICAgICBpbml0aWFsQW5nbGU6IHN0YXJ0LFxuICAgICAgICBjaGlsZENvbG9yOiBmaWxsQ29sb3IsXG4gICAgICAgIG5lc3RlZEFjdGl2ZVRvb2x0aXBJbmRleDogY3VycmVudFRvb2x0aXBJbmRleFxuICAgICAgfSwgZGVwdGggKyAxKTtcbiAgICB9KTtcbiAgfVxuICBkcmF3QXJjcyhkYXRhLmNoaWxkcmVuLCB7XG4gICAgcmFkaXVzOiB0aGlja25lc3MsXG4gICAgaW5uZXJSOiBpbm5lclJhZGl1cyxcbiAgICBpbml0aWFsQW5nbGU6IHN0YXJ0QW5nbGVcbiAgfSk7XG4gIHZhciBsYXllckNsYXNzID0gY2xzeCgncmVjaGFydHMtc3VuYnVyc3QnLCBjbGFzc05hbWUpO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoVG9vbHRpcFBvcnRhbENvbnRleHQuUHJvdmlkZXIsIHtcbiAgICB2YWx1ZTogdG9vbHRpcFBvcnRhbFxuICB9LCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWNoYXJ0c1dyYXBwZXIsIHtcbiAgICBjbGFzc05hbWU6IGNsYXNzTmFtZSxcbiAgICB3aWR0aDogd2lkdGgsXG4gICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgcmVzcG9uc2l2ZTogcmVzcG9uc2l2ZSxcbiAgICBzdHlsZTogc3R5bGUsXG4gICAgcmVmOiBub2RlID0+IHtcbiAgICAgIGlmICh0b29sdGlwUG9ydGFsID09IG51bGwgJiYgbm9kZSAhPSBudWxsKSB7XG4gICAgICAgIHNldFRvb2x0aXBQb3J0YWwobm9kZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBvbk1vdXNlRW50ZXI6IHVuZGVmaW5lZCxcbiAgICBvbk1vdXNlTGVhdmU6IHVuZGVmaW5lZCxcbiAgICBvbkNsaWNrOiB1bmRlZmluZWQsXG4gICAgb25Nb3VzZU1vdmU6IHVuZGVmaW5lZCxcbiAgICBvbk1vdXNlRG93bjogdW5kZWZpbmVkLFxuICAgIG9uTW91c2VVcDogdW5kZWZpbmVkLFxuICAgIG9uQ29udGV4dE1lbnU6IHVuZGVmaW5lZCxcbiAgICBvbkRvdWJsZUNsaWNrOiB1bmRlZmluZWQsXG4gICAgb25Ub3VjaFN0YXJ0OiB1bmRlZmluZWQsXG4gICAgb25Ub3VjaE1vdmU6IHVuZGVmaW5lZCxcbiAgICBvblRvdWNoRW5kOiB1bmRlZmluZWRcbiAgfSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU3VyZmFjZSwge1xuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBoZWlnaHQ6IGhlaWdodFxuICB9LCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwge1xuICAgIGNsYXNzTmFtZTogbGF5ZXJDbGFzc1xuICB9LCBzZWN0b3JzKSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2V0VG9vbHRpcEVudHJ5U2V0dGluZ3MsIHtcbiAgICBmbjogZ2V0VG9vbHRpcEVudHJ5U2V0dGluZ3MsXG4gICAgYXJnczoge1xuICAgICAgZGF0YUtleSxcbiAgICAgIGRhdGEsXG4gICAgICBzdHJva2UsXG4gICAgICBmaWxsLFxuICAgICAgbmFtZUtleSxcbiAgICAgIHBvc2l0aW9uc1xuICAgIH1cbiAgfSksIGNoaWxkcmVuKSkpO1xufTtcbmV4cG9ydCB2YXIgU3VuYnVyc3RDaGFydCA9IHByb3BzID0+IHtcbiAgdmFyIF9wcm9wcyRjbGFzc05hbWU7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWNoYXJ0c1N0b3JlUHJvdmlkZXIsIHtcbiAgICBwcmVsb2FkZWRTdGF0ZTogcHJlbG9hZGVkU3RhdGUsXG4gICAgcmVkdXhTdG9yZU5hbWU6IChfcHJvcHMkY2xhc3NOYW1lID0gcHJvcHMuY2xhc3NOYW1lKSAhPT0gbnVsbCAmJiBfcHJvcHMkY2xhc3NOYW1lICE9PSB2b2lkIDAgPyBfcHJvcHMkY2xhc3NOYW1lIDogJ1N1bmJ1cnN0Q2hhcnQnXG4gIH0sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlcG9ydENoYXJ0U2l6ZSwge1xuICAgIHdpZHRoOiBwcm9wcy53aWR0aCxcbiAgICBoZWlnaHQ6IHByb3BzLmhlaWdodFxuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVwb3J0Q2hhcnRNYXJnaW4sIHtcbiAgICBtYXJnaW46IGRlZmF1bHRTdW5idXJzdE1hcmdpblxuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU3VuYnVyc3RDaGFydEltcGwsIHByb3BzKSk7XG59OyIsInZhciBfZXhjbHVkZWQgPSBbXCJ3aWR0aFwiLCBcImhlaWdodFwiLCBcImNsYXNzTmFtZVwiLCBcInN0eWxlXCIsIFwiY2hpbGRyZW5cIiwgXCJ0eXBlXCJdO1xuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKGUsIHQpIHsgaWYgKG51bGwgPT0gZSkgcmV0dXJuIHt9OyB2YXIgbywgciwgaSA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKGUsIHQpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IGZvciAociA9IDA7IHIgPCBuLmxlbmd0aDsgcisrKSBvID0gbltyXSwgLTEgPT09IHQuaW5kZXhPZihvKSAmJiB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKGUsIG8pICYmIChpW29dID0gZVtvXSk7IH0gcmV0dXJuIGk7IH1cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKHIsIGUpIHsgaWYgKG51bGwgPT0gcikgcmV0dXJuIHt9OyB2YXIgdCA9IHt9OyBmb3IgKHZhciBuIGluIHIpIGlmICh7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHIsIG4pKSB7IGlmICgtMSAhPT0gZS5pbmRleE9mKG4pKSBjb250aW51ZTsgdFtuXSA9IHJbbl07IH0gcmV0dXJuIHQ7IH1cbmZ1bmN0aW9uIF9leHRlbmRzKCkgeyByZXR1cm4gX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduID8gT2JqZWN0LmFzc2lnbi5iaW5kKCkgOiBmdW5jdGlvbiAobikgeyBmb3IgKHZhciBlID0gMTsgZSA8IGFyZ3VtZW50cy5sZW5ndGg7IGUrKykgeyB2YXIgdCA9IGFyZ3VtZW50c1tlXTsgZm9yICh2YXIgciBpbiB0KSAoe30pLmhhc093blByb3BlcnR5LmNhbGwodCwgcikgJiYgKG5bcl0gPSB0W3JdKTsgfSByZXR1cm4gbjsgfSwgX2V4dGVuZHMuYXBwbHkobnVsbCwgYXJndW1lbnRzKTsgfVxuZnVuY3Rpb24gb3duS2V5cyhlLCByKSB7IHZhciB0ID0gT2JqZWN0LmtleXMoZSk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBvID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhlKTsgciAmJiAobyA9IG8uZmlsdGVyKGZ1bmN0aW9uIChyKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGUsIHIpLmVudW1lcmFibGU7IH0pKSwgdC5wdXNoLmFwcGx5KHQsIG8pOyB9IHJldHVybiB0OyB9XG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKGUpIHsgZm9yICh2YXIgciA9IDE7IHIgPCBhcmd1bWVudHMubGVuZ3RoOyByKyspIHsgdmFyIHQgPSBudWxsICE9IGFyZ3VtZW50c1tyXSA/IGFyZ3VtZW50c1tyXSA6IHt9OyByICUgMiA/IG93bktleXMoT2JqZWN0KHQpLCAhMCkuZm9yRWFjaChmdW5jdGlvbiAocikgeyBfZGVmaW5lUHJvcGVydHkoZSwgciwgdFtyXSk7IH0pIDogT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhlLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyh0KSkgOiBvd25LZXlzKE9iamVjdCh0KSkuZm9yRWFjaChmdW5jdGlvbiAocikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0LCByKSk7IH0pOyB9IHJldHVybiBlOyB9XG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkoZSwgciwgdCkgeyByZXR1cm4gKHIgPSBfdG9Qcm9wZXJ0eUtleShyKSkgaW4gZSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCB7IHZhbHVlOiB0LCBlbnVtZXJhYmxlOiAhMCwgY29uZmlndXJhYmxlOiAhMCwgd3JpdGFibGU6ICEwIH0pIDogZVtyXSA9IHQsIGU7IH1cbmZ1bmN0aW9uIF90b1Byb3BlcnR5S2V5KHQpIHsgdmFyIGkgPSBfdG9QcmltaXRpdmUodCwgXCJzdHJpbmdcIik7IHJldHVybiBcInN5bWJvbFwiID09IHR5cGVvZiBpID8gaSA6IGkgKyBcIlwiOyB9XG5mdW5jdGlvbiBfdG9QcmltaXRpdmUodCwgcikgeyBpZiAoXCJvYmplY3RcIiAhPSB0eXBlb2YgdCB8fCAhdCkgcmV0dXJuIHQ7IHZhciBlID0gdFtTeW1ib2wudG9QcmltaXRpdmVdOyBpZiAodm9pZCAwICE9PSBlKSB7IHZhciBpID0gZS5jYWxsKHQsIHIgfHwgXCJkZWZhdWx0XCIpOyBpZiAoXCJvYmplY3RcIiAhPSB0eXBlb2YgaSkgcmV0dXJuIGk7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJAQHRvUHJpbWl0aXZlIG11c3QgcmV0dXJuIGEgcHJpbWl0aXZlIHZhbHVlLlwiKTsgfSByZXR1cm4gKFwic3RyaW5nXCIgPT09IHIgPyBTdHJpbmcgOiBOdW1iZXIpKHQpOyB9XG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBQdXJlQ29tcG9uZW50LCB1c2VDYWxsYmFjaywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgb21pdCBmcm9tICdlcy10b29sa2l0L2NvbXBhdC9vbWl0JztcbmltcG9ydCBnZXQgZnJvbSAnZXMtdG9vbGtpdC9jb21wYXQvZ2V0JztcbmltcG9ydCB7IExheWVyIH0gZnJvbSAnLi4vY29udGFpbmVyL0xheWVyJztcbmltcG9ydCB7IFN1cmZhY2UgfSBmcm9tICcuLi9jb250YWluZXIvU3VyZmFjZSc7XG5pbXBvcnQgeyBQb2x5Z29uIH0gZnJvbSAnLi4vc2hhcGUvUG9seWdvbic7XG5pbXBvcnQgeyBSZWN0YW5nbGUgfSBmcm9tICcuLi9zaGFwZS9SZWN0YW5nbGUnO1xuaW1wb3J0IHsgZ2V0VmFsdWVCeURhdGFLZXkgfSBmcm9tICcuLi91dGlsL0NoYXJ0VXRpbHMnO1xuaW1wb3J0IHsgQ09MT1JfUEFORUwgfSBmcm9tICcuLi91dGlsL0NvbnN0YW50cyc7XG5pbXBvcnQgeyBpc05hbiwgdW5pcXVlSWQgfSBmcm9tICcuLi91dGlsL0RhdGFVdGlscyc7XG5pbXBvcnQgeyBnZXRTdHJpbmdTaXplIH0gZnJvbSAnLi4vdXRpbC9ET01VdGlscyc7XG5pbXBvcnQgeyBHbG9iYWwgfSBmcm9tICcuLi91dGlsL0dsb2JhbCc7XG5pbXBvcnQgeyBSZXBvcnRDaGFydE1hcmdpbiwgdXNlQ2hhcnRIZWlnaHQsIHVzZUNoYXJ0V2lkdGggfSBmcm9tICcuLi9jb250ZXh0L2NoYXJ0TGF5b3V0Q29udGV4dCc7XG5pbXBvcnQgeyBUb29sdGlwUG9ydGFsQ29udGV4dCB9IGZyb20gJy4uL2NvbnRleHQvdG9vbHRpcFBvcnRhbENvbnRleHQnO1xuaW1wb3J0IHsgUmVjaGFydHNXcmFwcGVyIH0gZnJvbSAnLi9SZWNoYXJ0c1dyYXBwZXInO1xuaW1wb3J0IHsgc2V0QWN0aXZlQ2xpY2tJdGVtSW5kZXgsIHNldEFjdGl2ZU1vdXNlT3Zlckl0ZW1JbmRleCB9IGZyb20gJy4uL3N0YXRlL3Rvb2x0aXBTbGljZSc7XG5pbXBvcnQgeyBTZXRUb29sdGlwRW50cnlTZXR0aW5ncyB9IGZyb20gJy4uL3N0YXRlL1NldFRvb2x0aXBFbnRyeVNldHRpbmdzJztcbmltcG9ydCB7IFJlY2hhcnRzU3RvcmVQcm92aWRlciB9IGZyb20gJy4uL3N0YXRlL1JlY2hhcnRzU3RvcmVQcm92aWRlcic7XG5pbXBvcnQgeyB1c2VBcHBEaXNwYXRjaCB9IGZyb20gJy4uL3N0YXRlL2hvb2tzJztcbmltcG9ydCB7IGlzUG9zaXRpdmVOdW1iZXIgfSBmcm9tICcuLi91dGlsL2lzV2VsbEJlaGF2ZWROdW1iZXInO1xuaW1wb3J0IHsgc3ZnUHJvcGVydGllc05vRXZlbnRzIH0gZnJvbSAnLi4vdXRpbC9zdmdQcm9wZXJ0aWVzTm9FdmVudHMnO1xuaW1wb3J0IHsgQ1NTVHJhbnNpdGlvbkFuaW1hdGUgfSBmcm9tICcuLi9hbmltYXRpb24vQ1NTVHJhbnNpdGlvbkFuaW1hdGUnO1xuaW1wb3J0IHsgcmVzb2x2ZURlZmF1bHRQcm9wcyB9IGZyb20gJy4uL3V0aWwvcmVzb2x2ZURlZmF1bHRQcm9wcyc7XG52YXIgTk9ERV9WQUxVRV9LRVkgPSAndmFsdWUnO1xuXG4vKipcbiAqIFRoaXMgaXMgd2hhdCBlbmQgdXNlcnMgZGVmaW5lcyBhcyBgZGF0YWAgb24gVHJlZW1hcC5cbiAqL1xuXG4vKipcbiAqIFRoaXMgaXMgd2hhdCBpcyByZXR1cm5lZCBmcm9tIGBzcXVhcmlmeWAsIHRoZSBmaW5hbCB0cmVlbWFwIGRhdGEgc3RydWN0dXJlXG4gKiB0aGF0IGdldHMgcmVuZGVyZWQgYW5kIGlzIHN0b3JlZCBpblxuICovXG5cbmV4cG9ydCB2YXIgdHJlZW1hcFBheWxvYWRTZWFyY2hlciA9IChkYXRhLCBhY3RpdmVJbmRleCkgPT4ge1xuICBpZiAoIWRhdGEgfHwgIWFjdGl2ZUluZGV4KSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gZ2V0KGRhdGEsIGFjdGl2ZUluZGV4KTtcbn07XG5leHBvcnQgdmFyIGFkZFRvVHJlZW1hcE5vZGVJbmRleCA9IGZ1bmN0aW9uIGFkZFRvVHJlZW1hcE5vZGVJbmRleChpbmRleEluQ2hpbGRyZW5BcnIpIHtcbiAgdmFyIGFjdGl2ZVRvb2x0aXBJbmRleFNvRmFyID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAnJztcbiAgcmV0dXJuIFwiXCIuY29uY2F0KGFjdGl2ZVRvb2x0aXBJbmRleFNvRmFyLCBcImNoaWxkcmVuW1wiKS5jb25jYXQoaW5kZXhJbkNoaWxkcmVuQXJyLCBcIl1cIik7XG59O1xudmFyIG9wdGlvbnMgPSB7XG4gIGNoYXJ0TmFtZTogJ1RyZWVtYXAnLFxuICBkZWZhdWx0VG9vbHRpcEV2ZW50VHlwZTogJ2l0ZW0nLFxuICB2YWxpZGF0ZVRvb2x0aXBFdmVudFR5cGVzOiBbJ2l0ZW0nXSxcbiAgdG9vbHRpcFBheWxvYWRTZWFyY2hlcjogdHJlZW1hcFBheWxvYWRTZWFyY2hlcixcbiAgZXZlbnRFbWl0dGVyOiB1bmRlZmluZWRcbn07XG5leHBvcnQgdmFyIGNvbXB1dGVOb2RlID0gX3JlZiA9PiB7XG4gIHZhciB7XG4gICAgZGVwdGgsXG4gICAgbm9kZSxcbiAgICBpbmRleCxcbiAgICBkYXRhS2V5LFxuICAgIG5hbWVLZXksXG4gICAgbmVzdGVkQWN0aXZlVG9vbHRpcEluZGV4XG4gIH0gPSBfcmVmO1xuICB2YXIgY3VycmVudFRvb2x0aXBJbmRleCA9IGRlcHRoID09PSAwID8gJycgOiBhZGRUb1RyZWVtYXBOb2RlSW5kZXgoaW5kZXgsIG5lc3RlZEFjdGl2ZVRvb2x0aXBJbmRleCk7XG4gIHZhciB7XG4gICAgY2hpbGRyZW5cbiAgfSA9IG5vZGU7XG4gIHZhciBjaGlsZERlcHRoID0gZGVwdGggKyAxO1xuICB2YXIgY29tcHV0ZWRDaGlsZHJlbiA9IGNoaWxkcmVuICYmIGNoaWxkcmVuLmxlbmd0aCA/IGNoaWxkcmVuLm1hcCgoY2hpbGQsIGkpID0+IGNvbXB1dGVOb2RlKHtcbiAgICBkZXB0aDogY2hpbGREZXB0aCxcbiAgICBub2RlOiBjaGlsZCxcbiAgICBpbmRleDogaSxcbiAgICBkYXRhS2V5LFxuICAgIG5hbWVLZXksXG4gICAgbmVzdGVkQWN0aXZlVG9vbHRpcEluZGV4OiBjdXJyZW50VG9vbHRpcEluZGV4XG4gIH0pKSA6IG51bGw7XG4gIHZhciBub2RlVmFsdWU7XG4gIGlmIChjb21wdXRlZENoaWxkcmVuICYmIGNvbXB1dGVkQ2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgbm9kZVZhbHVlID0gY29tcHV0ZWRDaGlsZHJlbi5yZWR1Y2UoKHJlc3VsdCwgY2hpbGQpID0+IHJlc3VsdCArIGNoaWxkW05PREVfVkFMVUVfS0VZXSwgMCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gVE9ETyBuZWVkIHRvIHZlcmlmeSBkYXRhS2V5XG4gICAgbm9kZVZhbHVlID0gaXNOYW4obm9kZVtkYXRhS2V5XSkgfHwgbm9kZVtkYXRhS2V5XSA8PSAwID8gMCA6IG5vZGVbZGF0YUtleV07XG4gIH1cbiAgcmV0dXJuIF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgbm9kZSksIHt9LCB7XG4gICAgY2hpbGRyZW46IGNvbXB1dGVkQ2hpbGRyZW4sXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBnZXRWYWx1ZUJ5RGF0YUtleSBkb2VzIG5vdCB2YWxpZGF0ZSB0aGUgb3V0cHV0IHR5cGVcbiAgICBuYW1lOiBnZXRWYWx1ZUJ5RGF0YUtleShub2RlLCBuYW1lS2V5LCAnJyksXG4gICAgW05PREVfVkFMVUVfS0VZXTogbm9kZVZhbHVlLFxuICAgIGRlcHRoLFxuICAgIGluZGV4LFxuICAgIHRvb2x0aXBJbmRleDogY3VycmVudFRvb2x0aXBJbmRleFxuICB9KTtcbn07XG52YXIgZmlsdGVyUmVjdCA9IG5vZGUgPT4gKHtcbiAgeDogbm9kZS54LFxuICB5OiBub2RlLnksXG4gIHdpZHRoOiBub2RlLndpZHRoLFxuICBoZWlnaHQ6IG5vZGUuaGVpZ2h0XG59KTtcbi8vIENvbXB1dGUgdGhlIGFyZWEgZm9yIGVhY2ggY2hpbGQgYmFzZWQgb24gdmFsdWUgJiBzY2FsZS5cbnZhciBnZXRBcmVhT2ZDaGlsZHJlbiA9IChjaGlsZHJlbiwgYXJlYVZhbHVlUmF0aW8pID0+IHtcbiAgdmFyIHJhdGlvID0gYXJlYVZhbHVlUmF0aW8gPCAwID8gMCA6IGFyZWFWYWx1ZVJhdGlvO1xuICByZXR1cm4gY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcbiAgICB2YXIgYXJlYSA9IGNoaWxkW05PREVfVkFMVUVfS0VZXSAqIHJhdGlvO1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGNoaWxkKSwge30sIHtcbiAgICAgIGFyZWE6IGlzTmFuKGFyZWEpIHx8IGFyZWEgPD0gMCA/IDAgOiBhcmVhXG4gICAgfSk7XG4gIH0pO1xufTtcblxuLy8gQ29tcHV0ZXMgdGhlIHNjb3JlIGZvciB0aGUgc3BlY2lmaWVkIHJvdywgYXMgdGhlIHdvcnN0IGFzcGVjdCByYXRpby5cbnZhciBnZXRXb3JzdFNjb3JlID0gKHJvdywgcGFyZW50U2l6ZSwgYXNwZWN0UmF0aW8pID0+IHtcbiAgdmFyIHBhcmVudEFyZWEgPSBwYXJlbnRTaXplICogcGFyZW50U2l6ZTtcbiAgdmFyIHJvd0FyZWEgPSByb3cuYXJlYSAqIHJvdy5hcmVhO1xuICB2YXIge1xuICAgIG1pbixcbiAgICBtYXhcbiAgfSA9IHJvdy5yZWR1Y2UoKHJlc3VsdCwgY2hpbGQpID0+ICh7XG4gICAgbWluOiBNYXRoLm1pbihyZXN1bHQubWluLCBjaGlsZC5hcmVhKSxcbiAgICBtYXg6IE1hdGgubWF4KHJlc3VsdC5tYXgsIGNoaWxkLmFyZWEpXG4gIH0pLCB7XG4gICAgbWluOiBJbmZpbml0eSxcbiAgICBtYXg6IDBcbiAgfSk7XG4gIHJldHVybiByb3dBcmVhID8gTWF0aC5tYXgocGFyZW50QXJlYSAqIG1heCAqIGFzcGVjdFJhdGlvIC8gcm93QXJlYSwgcm93QXJlYSAvIChwYXJlbnRBcmVhICogbWluICogYXNwZWN0UmF0aW8pKSA6IEluZmluaXR5O1xufTtcbnZhciBob3Jpem9udGFsUG9zaXRpb24gPSAocm93LCBwYXJlbnRTaXplLCBwYXJlbnRSZWN0LCBpc0ZsdXNoKSA9PiB7XG4gIHZhciByb3dIZWlnaHQgPSBwYXJlbnRTaXplID8gTWF0aC5yb3VuZChyb3cuYXJlYSAvIHBhcmVudFNpemUpIDogMDtcbiAgaWYgKGlzRmx1c2ggfHwgcm93SGVpZ2h0ID4gcGFyZW50UmVjdC5oZWlnaHQpIHtcbiAgICByb3dIZWlnaHQgPSBwYXJlbnRSZWN0LmhlaWdodDtcbiAgfVxuICB2YXIgY3VyWCA9IHBhcmVudFJlY3QueDtcbiAgdmFyIGNoaWxkO1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gcm93Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY2hpbGQgPSByb3dbaV07XG4gICAgY2hpbGQueCA9IGN1clg7XG4gICAgY2hpbGQueSA9IHBhcmVudFJlY3QueTtcbiAgICBjaGlsZC5oZWlnaHQgPSByb3dIZWlnaHQ7XG4gICAgY2hpbGQud2lkdGggPSBNYXRoLm1pbihyb3dIZWlnaHQgPyBNYXRoLnJvdW5kKGNoaWxkLmFyZWEgLyByb3dIZWlnaHQpIDogMCwgcGFyZW50UmVjdC54ICsgcGFyZW50UmVjdC53aWR0aCAtIGN1clgpO1xuICAgIGN1clggKz0gY2hpbGQud2lkdGg7XG4gIH1cbiAgLy8gYWRkIHRoZSByZW1haW4geCB0byB0aGUgbGFzdCBvbmUgb2Ygcm93XG4gIGlmIChjaGlsZCAhPSBudWxsKSB7XG4gICAgY2hpbGQud2lkdGggKz0gcGFyZW50UmVjdC54ICsgcGFyZW50UmVjdC53aWR0aCAtIGN1clg7XG4gIH1cbiAgcmV0dXJuIF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgcGFyZW50UmVjdCksIHt9LCB7XG4gICAgeTogcGFyZW50UmVjdC55ICsgcm93SGVpZ2h0LFxuICAgIGhlaWdodDogcGFyZW50UmVjdC5oZWlnaHQgLSByb3dIZWlnaHRcbiAgfSk7XG59O1xudmFyIHZlcnRpY2FsUG9zaXRpb24gPSAocm93LCBwYXJlbnRTaXplLCBwYXJlbnRSZWN0LCBpc0ZsdXNoKSA9PiB7XG4gIHZhciByb3dXaWR0aCA9IHBhcmVudFNpemUgPyBNYXRoLnJvdW5kKHJvdy5hcmVhIC8gcGFyZW50U2l6ZSkgOiAwO1xuICBpZiAoaXNGbHVzaCB8fCByb3dXaWR0aCA+IHBhcmVudFJlY3Qud2lkdGgpIHtcbiAgICByb3dXaWR0aCA9IHBhcmVudFJlY3Qud2lkdGg7XG4gIH1cbiAgdmFyIGN1clkgPSBwYXJlbnRSZWN0Lnk7XG4gIHZhciBjaGlsZDtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHJvdy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGNoaWxkID0gcm93W2ldO1xuICAgIGNoaWxkLnggPSBwYXJlbnRSZWN0Lng7XG4gICAgY2hpbGQueSA9IGN1clk7XG4gICAgY2hpbGQud2lkdGggPSByb3dXaWR0aDtcbiAgICBjaGlsZC5oZWlnaHQgPSBNYXRoLm1pbihyb3dXaWR0aCA/IE1hdGgucm91bmQoY2hpbGQuYXJlYSAvIHJvd1dpZHRoKSA6IDAsIHBhcmVudFJlY3QueSArIHBhcmVudFJlY3QuaGVpZ2h0IC0gY3VyWSk7XG4gICAgY3VyWSArPSBjaGlsZC5oZWlnaHQ7XG4gIH1cbiAgaWYgKGNoaWxkKSB7XG4gICAgY2hpbGQuaGVpZ2h0ICs9IHBhcmVudFJlY3QueSArIHBhcmVudFJlY3QuaGVpZ2h0IC0gY3VyWTtcbiAgfVxuICByZXR1cm4gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBwYXJlbnRSZWN0KSwge30sIHtcbiAgICB4OiBwYXJlbnRSZWN0LnggKyByb3dXaWR0aCxcbiAgICB3aWR0aDogcGFyZW50UmVjdC53aWR0aCAtIHJvd1dpZHRoXG4gIH0pO1xufTtcbnZhciBwb3NpdGlvbiA9IChyb3csIHBhcmVudFNpemUsIHBhcmVudFJlY3QsIGlzRmx1c2gpID0+IHtcbiAgaWYgKHBhcmVudFNpemUgPT09IHBhcmVudFJlY3Qud2lkdGgpIHtcbiAgICByZXR1cm4gaG9yaXpvbnRhbFBvc2l0aW9uKHJvdywgcGFyZW50U2l6ZSwgcGFyZW50UmVjdCwgaXNGbHVzaCk7XG4gIH1cbiAgcmV0dXJuIHZlcnRpY2FsUG9zaXRpb24ocm93LCBwYXJlbnRTaXplLCBwYXJlbnRSZWN0LCBpc0ZsdXNoKTtcbn07XG4vLyBSZWN1cnNpdmVseSBhcnJhbmdlcyB0aGUgc3BlY2lmaWVkIG5vZGUncyBjaGlsZHJlbiBpbnRvIHNxdWFyaWZpZWQgcm93cy5cbnZhciBzcXVhcmlmeSA9IChub2RlLCBhc3BlY3RSYXRpbykgPT4ge1xuICB2YXIge1xuICAgIGNoaWxkcmVuXG4gIH0gPSBub2RlO1xuICBpZiAoY2hpbGRyZW4gJiYgY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgdmFyIHJlY3QgPSBmaWx0ZXJSZWN0KG5vZGUpO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3Igd2UgY2FuJ3QgY3JlYXRlIGFuIGFycmF5IHdpdGggc3RhdGljIHByb3BlcnR5IG9uIGEgc2luZ2xlIGxpbmUgc28gdHlwZXNjcmlwdCB3aWxsIGNvbXBsYWluLlxuICAgIHZhciByb3cgPSBbXTtcbiAgICB2YXIgYmVzdCA9IEluZmluaXR5OyAvLyB0aGUgYmVzdCByb3cgc2NvcmUgc28gZmFyXG4gICAgdmFyIGNoaWxkLCBzY29yZTsgLy8gdGhlIGN1cnJlbnQgcm93IHNjb3JlXG4gICAgdmFyIHNpemUgPSBNYXRoLm1pbihyZWN0LndpZHRoLCByZWN0LmhlaWdodCk7IC8vIGluaXRpYWwgb3JpZW50YXRpb25cbiAgICB2YXIgc2NhbGVDaGlsZHJlbiA9IGdldEFyZWFPZkNoaWxkcmVuKGNoaWxkcmVuLCByZWN0LndpZHRoICogcmVjdC5oZWlnaHQgLyBub2RlW05PREVfVkFMVUVfS0VZXSk7XG4gICAgdmFyIHRlbXBDaGlsZHJlbiA9IHNjYWxlQ2hpbGRyZW4uc2xpY2UoKTtcblxuICAgIC8vIHdoeSBhcmUgd2Ugc2V0dGluZyBzdGF0aWMgcHJvcGVydGllcyBvbiBhbiBhcnJheT9cbiAgICByb3cuYXJlYSA9IDA7XG4gICAgd2hpbGUgKHRlbXBDaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAvLyByb3cgZmlyc3RcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItZGVzdHJ1Y3R1cmluZ1xuICAgICAgcm93LnB1c2goY2hpbGQgPSB0ZW1wQ2hpbGRyZW5bMF0pO1xuICAgICAgcm93LmFyZWEgKz0gY2hpbGQuYXJlYTtcbiAgICAgIHNjb3JlID0gZ2V0V29yc3RTY29yZShyb3csIHNpemUsIGFzcGVjdFJhdGlvKTtcbiAgICAgIGlmIChzY29yZSA8PSBiZXN0KSB7XG4gICAgICAgIC8vIGNvbnRpbnVlIHdpdGggdGhpcyBvcmllbnRhdGlvblxuICAgICAgICB0ZW1wQ2hpbGRyZW4uc2hpZnQoKTtcbiAgICAgICAgYmVzdCA9IHNjb3JlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIF9yb3ckcG9wJGFyZWEsIF9yb3ckcG9wO1xuICAgICAgICAvLyBhYm9ydCwgYW5kIHRyeSBhIGRpZmZlcmVudCBvcmllbnRhdGlvblxuICAgICAgICByb3cuYXJlYSAtPSAoX3JvdyRwb3AkYXJlYSA9IChfcm93JHBvcCA9IHJvdy5wb3AoKSkgPT09IG51bGwgfHwgX3JvdyRwb3AgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9yb3ckcG9wLmFyZWEpICE9PSBudWxsICYmIF9yb3ckcG9wJGFyZWEgIT09IHZvaWQgMCA/IF9yb3ckcG9wJGFyZWEgOiAwO1xuICAgICAgICByZWN0ID0gcG9zaXRpb24ocm93LCBzaXplLCByZWN0LCBmYWxzZSk7XG4gICAgICAgIHNpemUgPSBNYXRoLm1pbihyZWN0LndpZHRoLCByZWN0LmhlaWdodCk7XG4gICAgICAgIHJvdy5sZW5ndGggPSByb3cuYXJlYSA9IDA7XG4gICAgICAgIGJlc3QgPSBJbmZpbml0eTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHJvdy5sZW5ndGgpIHtcbiAgICAgIHJlY3QgPSBwb3NpdGlvbihyb3csIHNpemUsIHJlY3QsIHRydWUpO1xuICAgICAgcm93Lmxlbmd0aCA9IHJvdy5hcmVhID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgbm9kZSksIHt9LCB7XG4gICAgICBjaGlsZHJlbjogc2NhbGVDaGlsZHJlbi5tYXAoYyA9PiBzcXVhcmlmeShjLCBhc3BlY3RSYXRpbykpXG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIG5vZGU7XG59O1xudmFyIGRlZmF1bHRUcmVlTWFwUHJvcHMgPSB7XG4gIGFzcGVjdFJhdGlvOiAwLjUgKiAoMSArIE1hdGguc3FydCg1KSksXG4gIGRhdGFLZXk6ICd2YWx1ZScsXG4gIG5hbWVLZXk6ICduYW1lJyxcbiAgdHlwZTogJ2ZsYXQnLFxuICBpc0FuaW1hdGlvbkFjdGl2ZTogIUdsb2JhbC5pc1NzcixcbiAgaXNVcGRhdGVBbmltYXRpb25BY3RpdmU6ICFHbG9iYWwuaXNTc3IsXG4gIGFuaW1hdGlvbkJlZ2luOiAwLFxuICBhbmltYXRpb25EdXJhdGlvbjogMTUwMCxcbiAgYW5pbWF0aW9uRWFzaW5nOiAnbGluZWFyJ1xufTtcbnZhciBkZWZhdWx0U3RhdGUgPSB7XG4gIGlzQW5pbWF0aW9uRmluaXNoZWQ6IGZhbHNlLFxuICBmb3JtYXRSb290OiBudWxsLFxuICBjdXJyZW50Um9vdDogbnVsbCxcbiAgbmVzdEluZGV4OiBbXSxcbiAgcHJldkFzcGVjdFJhdGlvOiBkZWZhdWx0VHJlZU1hcFByb3BzLmFzcGVjdFJhdGlvLFxuICBwcmV2RGF0YUtleTogZGVmYXVsdFRyZWVNYXBQcm9wcy5kYXRhS2V5XG59O1xuZnVuY3Rpb24gQ29udGVudEl0ZW0oX3JlZjIpIHtcbiAgdmFyIHtcbiAgICBjb250ZW50LFxuICAgIG5vZGVQcm9wcyxcbiAgICB0eXBlLFxuICAgIGNvbG9yUGFuZWwsXG4gICAgb25Nb3VzZUVudGVyLFxuICAgIG9uTW91c2VMZWF2ZSxcbiAgICBvbkNsaWNrXG4gIH0gPSBfcmVmMjtcbiAgaWYgKC8qI19fUFVSRV9fKi9SZWFjdC5pc1ZhbGlkRWxlbWVudChjb250ZW50KSkge1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwge1xuICAgICAgb25Nb3VzZUVudGVyOiBvbk1vdXNlRW50ZXIsXG4gICAgICBvbk1vdXNlTGVhdmU6IG9uTW91c2VMZWF2ZSxcbiAgICAgIG9uQ2xpY2s6IG9uQ2xpY2tcbiAgICB9LCAvKiNfX1BVUkVfXyovUmVhY3QuY2xvbmVFbGVtZW50KGNvbnRlbnQsIG5vZGVQcm9wcykpO1xuICB9XG4gIGlmICh0eXBlb2YgY29udGVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwge1xuICAgICAgb25Nb3VzZUVudGVyOiBvbk1vdXNlRW50ZXIsXG4gICAgICBvbk1vdXNlTGVhdmU6IG9uTW91c2VMZWF2ZSxcbiAgICAgIG9uQ2xpY2s6IG9uQ2xpY2tcbiAgICB9LCBjb250ZW50KG5vZGVQcm9wcykpO1xuICB9XG4gIC8vIG9wdGltaXplIGRlZmF1bHQgc2hhcGVcbiAgdmFyIHtcbiAgICB4LFxuICAgIHksXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIGluZGV4XG4gIH0gPSBub2RlUHJvcHM7XG4gIHZhciBhcnJvdyA9IG51bGw7XG4gIGlmICh3aWR0aCA+IDEwICYmIGhlaWdodCA+IDEwICYmIG5vZGVQcm9wcy5jaGlsZHJlbiAmJiB0eXBlID09PSAnbmVzdCcpIHtcbiAgICBhcnJvdyA9IC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFBvbHlnb24sIHtcbiAgICAgIHBvaW50czogW3tcbiAgICAgICAgeDogeCArIDIsXG4gICAgICAgIHk6IHkgKyBoZWlnaHQgLyAyXG4gICAgICB9LCB7XG4gICAgICAgIHg6IHggKyA2LFxuICAgICAgICB5OiB5ICsgaGVpZ2h0IC8gMiArIDNcbiAgICAgIH0sIHtcbiAgICAgICAgeDogeCArIDIsXG4gICAgICAgIHk6IHkgKyBoZWlnaHQgLyAyICsgNlxuICAgICAgfV1cbiAgICB9KTtcbiAgfVxuICB2YXIgdGV4dCA9IG51bGw7XG4gIHZhciBuYW1lU2l6ZSA9IGdldFN0cmluZ1NpemUobm9kZVByb3BzLm5hbWUpO1xuICBpZiAod2lkdGggPiAyMCAmJiBoZWlnaHQgPiAyMCAmJiBuYW1lU2l6ZS53aWR0aCA8IHdpZHRoICYmIG5hbWVTaXplLmhlaWdodCA8IGhlaWdodCkge1xuICAgIHRleHQgPSAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcInRleHRcIiwge1xuICAgICAgeDogeCArIDgsXG4gICAgICB5OiB5ICsgaGVpZ2h0IC8gMiArIDcsXG4gICAgICBmb250U2l6ZTogMTRcbiAgICB9LCBub2RlUHJvcHMubmFtZSk7XG4gIH1cbiAgdmFyIGNvbG9ycyA9IGNvbG9yUGFuZWwgfHwgQ09MT1JfUEFORUw7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcImdcIiwgbnVsbCwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVjdGFuZ2xlLCBfZXh0ZW5kcyh7XG4gICAgZmlsbDogbm9kZVByb3BzLmRlcHRoIDwgMiA/IGNvbG9yc1tpbmRleCAlIGNvbG9ycy5sZW5ndGhdIDogJ3JnYmEoMjU1LDI1NSwyNTUsMCknLFxuICAgIHN0cm9rZTogXCIjZmZmXCJcbiAgfSwgb21pdChub2RlUHJvcHMsIFsnY2hpbGRyZW4nXSksIHtcbiAgICBvbk1vdXNlRW50ZXI6IG9uTW91c2VFbnRlcixcbiAgICBvbk1vdXNlTGVhdmU6IG9uTW91c2VMZWF2ZSxcbiAgICBvbkNsaWNrOiBvbkNsaWNrLFxuICAgIFwiZGF0YS1yZWNoYXJ0cy1pdGVtLWluZGV4XCI6IG5vZGVQcm9wcy50b29sdGlwSW5kZXhcbiAgfSkpLCBhcnJvdywgdGV4dCk7XG59XG5mdW5jdGlvbiBDb250ZW50SXRlbVdpdGhFdmVudHMocHJvcHMpIHtcbiAgdmFyIGRpc3BhdGNoID0gdXNlQXBwRGlzcGF0Y2goKTtcbiAgdmFyIGFjdGl2ZUNvb3JkaW5hdGUgPSB7XG4gICAgeDogcHJvcHMubm9kZVByb3BzLnggKyBwcm9wcy5ub2RlUHJvcHMud2lkdGggLyAyLFxuICAgIHk6IHByb3BzLm5vZGVQcm9wcy55ICsgcHJvcHMubm9kZVByb3BzLmhlaWdodCAvIDJcbiAgfTtcbiAgdmFyIG9uTW91c2VFbnRlciA9ICgpID0+IHtcbiAgICBkaXNwYXRjaChzZXRBY3RpdmVNb3VzZU92ZXJJdGVtSW5kZXgoe1xuICAgICAgYWN0aXZlSW5kZXg6IHByb3BzLm5vZGVQcm9wcy50b29sdGlwSW5kZXgsXG4gICAgICBhY3RpdmVEYXRhS2V5OiBwcm9wcy5kYXRhS2V5LFxuICAgICAgYWN0aXZlQ29vcmRpbmF0ZVxuICAgIH0pKTtcbiAgfTtcbiAgdmFyIG9uTW91c2VMZWF2ZSA9ICgpID0+IHtcbiAgICAvLyBjbGVhcmluZyBzdGF0ZSBvbiBtb3VzZUxlYXZlSXRlbSBjYXVzZXMgcmUtcmVuZGVyaW5nIGlzc3Vlc1xuICAgIC8vIHdlIGRvbid0IGFjdHVhbGx5IHdhbnQgdG8gZG8gdGhpcyBmb3IgVHJlZU1hcCAtIHdlIGNsZWFyIHN0YXRlIHdoZW4gd2UgbGVhdmUgdGhlIGVudGlyZSBjaGFydCBpbnN0ZWFkXG4gIH07XG4gIHZhciBvbkNsaWNrID0gKCkgPT4ge1xuICAgIGRpc3BhdGNoKHNldEFjdGl2ZUNsaWNrSXRlbUluZGV4KHtcbiAgICAgIGFjdGl2ZUluZGV4OiBwcm9wcy5ub2RlUHJvcHMudG9vbHRpcEluZGV4LFxuICAgICAgYWN0aXZlRGF0YUtleTogcHJvcHMuZGF0YUtleSxcbiAgICAgIGFjdGl2ZUNvb3JkaW5hdGVcbiAgICB9KSk7XG4gIH07XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChDb250ZW50SXRlbSwgX2V4dGVuZHMoe30sIHByb3BzLCB7XG4gICAgb25Nb3VzZUVudGVyOiBvbk1vdXNlRW50ZXIsXG4gICAgb25Nb3VzZUxlYXZlOiBvbk1vdXNlTGVhdmUsXG4gICAgb25DbGljazogb25DbGlja1xuICB9KSk7XG59XG5mdW5jdGlvbiBnZXRUb29sdGlwRW50cnlTZXR0aW5ncyhfcmVmMykge1xuICB2YXIge1xuICAgIHByb3BzLFxuICAgIGN1cnJlbnRSb290XG4gIH0gPSBfcmVmMztcbiAgdmFyIHtcbiAgICBkYXRhS2V5LFxuICAgIG5hbWVLZXksXG4gICAgc3Ryb2tlLFxuICAgIGZpbGxcbiAgfSA9IHByb3BzO1xuICByZXR1cm4ge1xuICAgIGRhdGFEZWZpbmVkT25JdGVtOiBjdXJyZW50Um9vdCxcbiAgICBwb3NpdGlvbnM6IHVuZGVmaW5lZCxcbiAgICAvLyBUT0RPIEkgdGhpbmsgVHJlZW1hcCBoYXMgdGhlIGNhcGFiaWxpdHkgb2YgY29tcHV0aW5nIHBvc2l0aW9ucyBhbmQgc3VwcG9ydGluZyBkZWZhdWx0SW5kZXg/IEV4Y2VwdCBpdCBkb2Vzbid0IHlldFxuICAgIHNldHRpbmdzOiB7XG4gICAgICBzdHJva2UsXG4gICAgICBzdHJva2VXaWR0aDogdW5kZWZpbmVkLFxuICAgICAgZmlsbCxcbiAgICAgIGRhdGFLZXksXG4gICAgICBuYW1lS2V5LFxuICAgICAgbmFtZTogdW5kZWZpbmVkLFxuICAgICAgLy8gRWFjaCBUcmVlbWFwTm9kZSBoYXMgaXRzIG93biBuYW1lXG4gICAgICBoaWRlOiBmYWxzZSxcbiAgICAgIHR5cGU6IHVuZGVmaW5lZCxcbiAgICAgIGNvbG9yOiBmaWxsLFxuICAgICAgdW5pdDogJydcbiAgICB9XG4gIH07XG59XG5cbi8vIFdoeSBpcyBtYXJnaW4gbm90IGEgdHJlZW1hcCBwcm9wPyBObyBjbHVlLiBQcm9iYWJseSBpdCBzaG91bGQgYmVcbnZhciBkZWZhdWx0VHJlZW1hcE1hcmdpbiA9IHtcbiAgdG9wOiAwLFxuICByaWdodDogMCxcbiAgYm90dG9tOiAwLFxuICBsZWZ0OiAwXG59O1xuZnVuY3Rpb24gVHJlZW1hcEl0ZW0oX3JlZjQpIHtcbiAgdmFyIHtcbiAgICBjb250ZW50LFxuICAgIG5vZGVQcm9wcyxcbiAgICBpc0xlYWYsXG4gICAgdHJlZW1hcFByb3BzLFxuICAgIG9uTmVzdENsaWNrXG4gIH0gPSBfcmVmNDtcbiAgdmFyIHtcbiAgICBpc0FuaW1hdGlvbkFjdGl2ZSxcbiAgICBhbmltYXRpb25CZWdpbixcbiAgICBhbmltYXRpb25EdXJhdGlvbixcbiAgICBhbmltYXRpb25FYXNpbmcsXG4gICAgaXNVcGRhdGVBbmltYXRpb25BY3RpdmUsXG4gICAgdHlwZSxcbiAgICBjb2xvclBhbmVsLFxuICAgIGRhdGFLZXksXG4gICAgb25BbmltYXRpb25TdGFydCxcbiAgICBvbkFuaW1hdGlvbkVuZCxcbiAgICBvbk1vdXNlRW50ZXI6IG9uTW91c2VFbnRlckZyb21Qcm9wcyxcbiAgICBvbkNsaWNrOiBvbkl0ZW1DbGlja0Zyb21Qcm9wcyxcbiAgICBvbk1vdXNlTGVhdmU6IG9uTW91c2VMZWF2ZUZyb21Qcm9wc1xuICB9ID0gdHJlZW1hcFByb3BzO1xuICB2YXIge1xuICAgIHdpZHRoLFxuICAgIGhlaWdodCxcbiAgICB4LFxuICAgIHlcbiAgfSA9IG5vZGVQcm9wcztcbiAgdmFyIHRyYW5zbGF0ZVggPSAteCAtIHdpZHRoO1xuICB2YXIgdHJhbnNsYXRlWSA9IDA7XG4gIHZhciBvbk1vdXNlRW50ZXIgPSBlID0+IHtcbiAgICBpZiAoKGlzTGVhZiB8fCB0eXBlID09PSAnbmVzdCcpICYmIHR5cGVvZiBvbk1vdXNlRW50ZXJGcm9tUHJvcHMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG9uTW91c2VFbnRlckZyb21Qcm9wcyhub2RlUHJvcHMsIGUpO1xuICAgIH1cbiAgfTtcbiAgdmFyIG9uTW91c2VMZWF2ZSA9IGUgPT4ge1xuICAgIGlmICgoaXNMZWFmIHx8IHR5cGUgPT09ICduZXN0JykgJiYgdHlwZW9mIG9uTW91c2VMZWF2ZUZyb21Qcm9wcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgb25Nb3VzZUxlYXZlRnJvbVByb3BzKG5vZGVQcm9wcywgZSk7XG4gICAgfVxuICB9O1xuICB2YXIgb25DbGljayA9ICgpID0+IHtcbiAgICBpZiAodHlwZSA9PT0gJ25lc3QnKSB7XG4gICAgICBvbk5lc3RDbGljayhub2RlUHJvcHMpO1xuICAgIH1cbiAgICBpZiAoKGlzTGVhZiB8fCB0eXBlID09PSAnbmVzdCcpICYmIHR5cGVvZiBvbkl0ZW1DbGlja0Zyb21Qcm9wcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgb25JdGVtQ2xpY2tGcm9tUHJvcHMobm9kZVByb3BzKTtcbiAgICB9XG4gIH07XG4gIHZhciBoYW5kbGVBbmltYXRpb25FbmQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBvbkFuaW1hdGlvbkVuZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgb25BbmltYXRpb25FbmQoKTtcbiAgICB9XG4gIH0sIFtvbkFuaW1hdGlvbkVuZF0pO1xuICB2YXIgaGFuZGxlQW5pbWF0aW9uU3RhcnQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBvbkFuaW1hdGlvblN0YXJ0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBvbkFuaW1hdGlvblN0YXJ0KCk7XG4gICAgfVxuICB9LCBbb25BbmltYXRpb25TdGFydF0pO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQ1NTVHJhbnNpdGlvbkFuaW1hdGUsIHtcbiAgICBhbmltYXRpb25JZDogXCJ0cmVlbWFwLVwiLmNvbmNhdChub2RlUHJvcHMudG9vbHRpcEluZGV4KSxcbiAgICBmcm9tOiBcInRyYW5zbGF0ZShcIi5jb25jYXQodHJhbnNsYXRlWCwgXCJweCwgXCIpLmNvbmNhdCh0cmFuc2xhdGVZLCBcInB4KVwiKSxcbiAgICB0bzogXCJ0cmFuc2xhdGUoMCwgMClcIixcbiAgICBhdHRyaWJ1dGVOYW1lOiBcInRyYW5zZm9ybVwiLFxuICAgIGJlZ2luOiBhbmltYXRpb25CZWdpbixcbiAgICBlYXNpbmc6IGFuaW1hdGlvbkVhc2luZyxcbiAgICBpc0FjdGl2ZTogaXNBbmltYXRpb25BY3RpdmUsXG4gICAgZHVyYXRpb246IGFuaW1hdGlvbkR1cmF0aW9uLFxuICAgIG9uQW5pbWF0aW9uU3RhcnQ6IGhhbmRsZUFuaW1hdGlvblN0YXJ0LFxuICAgIG9uQW5pbWF0aW9uRW5kOiBoYW5kbGVBbmltYXRpb25FbmRcbiAgfSwgc3R5bGUgPT4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGF5ZXIsIHtcbiAgICBvbk1vdXNlRW50ZXI6IG9uTW91c2VFbnRlcixcbiAgICBvbk1vdXNlTGVhdmU6IG9uTW91c2VMZWF2ZSxcbiAgICBvbkNsaWNrOiBvbkNsaWNrLFxuICAgIHN0eWxlOiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIHN0eWxlKSwge30sIHtcbiAgICAgIHRyYW5zZm9ybU9yaWdpbjogXCJcIi5jb25jYXQoeCwgXCIgXCIpLmNvbmNhdCh5KVxuICAgIH0pXG4gIH0sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KENvbnRlbnRJdGVtV2l0aEV2ZW50cywge1xuICAgIGNvbnRlbnQ6IGNvbnRlbnQsXG4gICAgZGF0YUtleTogZGF0YUtleSxcbiAgICBub2RlUHJvcHM6IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgbm9kZVByb3BzKSwge30sIHtcbiAgICAgIGlzQW5pbWF0aW9uQWN0aXZlLFxuICAgICAgaXNVcGRhdGVBbmltYXRpb25BY3RpdmU6ICFpc1VwZGF0ZUFuaW1hdGlvbkFjdGl2ZSxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgeCxcbiAgICAgIHlcbiAgICB9KSxcbiAgICB0eXBlOiB0eXBlLFxuICAgIGNvbG9yUGFuZWw6IGNvbG9yUGFuZWxcbiAgfSkpKTtcbn1cbmNsYXNzIFRyZWVtYXBXaXRoU3RhdGUgZXh0ZW5kcyBQdXJlQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICBfZGVmaW5lUHJvcGVydHkodGhpcywgXCJzdGF0ZVwiLCBfb2JqZWN0U3ByZWFkKHt9LCBkZWZhdWx0U3RhdGUpKTtcbiAgICBfZGVmaW5lUHJvcGVydHkodGhpcywgXCJoYW5kbGVDbGlja1wiLCBub2RlID0+IHtcbiAgICAgIHZhciB7XG4gICAgICAgIG9uQ2xpY2ssXG4gICAgICAgIHR5cGVcbiAgICAgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgaWYgKHR5cGUgPT09ICduZXN0JyAmJiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgIHZhciB7XG4gICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgIGRhdGFLZXksXG4gICAgICAgICAgbmFtZUtleSxcbiAgICAgICAgICBhc3BlY3RSYXRpb1xuICAgICAgICB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIHJvb3QgPSBjb21wdXRlTm9kZSh7XG4gICAgICAgICAgZGVwdGg6IDAsXG4gICAgICAgICAgbm9kZTogX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBub2RlKSwge30sIHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwLFxuICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHRcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBpbmRleDogMCxcbiAgICAgICAgICBkYXRhS2V5LFxuICAgICAgICAgIG5hbWVLZXksXG4gICAgICAgICAgLy8gd2l0aCBUcmVlbWFwIG5lc3RpbmcsIHNob3VsZCB0aGlzIGNvbnRpbnVlIG5lc3RpbmcgdGhlIGluZGV4IG9yIHN0YXJ0IGZyb20gZW1wdHkgc3RyaW5nP1xuICAgICAgICAgIG5lc3RlZEFjdGl2ZVRvb2x0aXBJbmRleDogbm9kZS50b29sdGlwSW5kZXhcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBmb3JtYXRSb290ID0gc3F1YXJpZnkocm9vdCwgYXNwZWN0UmF0aW8pO1xuICAgICAgICB2YXIge1xuICAgICAgICAgIG5lc3RJbmRleFxuICAgICAgICB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgbmVzdEluZGV4LnB1c2gobm9kZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGZvcm1hdFJvb3QsXG4gICAgICAgICAgY3VycmVudFJvb3Q6IHJvb3QsXG4gICAgICAgICAgbmVzdEluZGV4XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKG9uQ2xpY2spIHtcbiAgICAgICAgb25DbGljayhub2RlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBfZGVmaW5lUHJvcGVydHkodGhpcywgXCJoYW5kbGVUb3VjaE1vdmVcIiwgZSA9PiB7XG4gICAgICB2YXIgdG91Y2hFdmVudCA9IGUudG91Y2hlc1swXTtcbiAgICAgIHZhciB0YXJnZXQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHRvdWNoRXZlbnQuY2xpZW50WCwgdG91Y2hFdmVudC5jbGllbnRZKTtcbiAgICAgIGlmICghdGFyZ2V0IHx8ICF0YXJnZXQuZ2V0QXR0cmlidXRlIHx8IHRoaXMuc3RhdGUuZm9ybWF0Um9vdCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBpdGVtSW5kZXggPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXJlY2hhcnRzLWl0ZW0taW5kZXgnKTtcbiAgICAgIHZhciBhY3RpdmVOb2RlID0gdHJlZW1hcFBheWxvYWRTZWFyY2hlcih0aGlzLnN0YXRlLmZvcm1hdFJvb3QsIGl0ZW1JbmRleCk7XG4gICAgICBpZiAoIWFjdGl2ZU5vZGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIHtcbiAgICAgICAgZGF0YUtleSxcbiAgICAgICAgZGlzcGF0Y2hcbiAgICAgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgdmFyIGFjdGl2ZUNvb3JkaW5hdGUgPSB7XG4gICAgICAgIHg6IGFjdGl2ZU5vZGUueCArIGFjdGl2ZU5vZGUud2lkdGggLyAyLFxuICAgICAgICB5OiBhY3RpdmVOb2RlLnkgKyBhY3RpdmVOb2RlLmhlaWdodCAvIDJcbiAgICAgIH07XG5cbiAgICAgIC8vIFRyZWVtYXAgZG9lcyBub3Qgc3VwcG9ydCBvblRvdWNoTW92ZSBwcm9wLCBidXQgaXQgY291bGRcbiAgICAgIC8vIG9uVG91Y2hNb3ZlPy4oYWN0aXZlTm9kZSwgTnVtYmVyKGl0ZW1JbmRleCksIGUpO1xuICAgICAgZGlzcGF0Y2goc2V0QWN0aXZlTW91c2VPdmVySXRlbUluZGV4KHtcbiAgICAgICAgYWN0aXZlSW5kZXg6IGl0ZW1JbmRleCxcbiAgICAgICAgYWN0aXZlRGF0YUtleTogZGF0YUtleSxcbiAgICAgICAgYWN0aXZlQ29vcmRpbmF0ZVxuICAgICAgfSkpO1xuICAgIH0pO1xuICB9XG4gIHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMobmV4dFByb3BzLCBwcmV2U3RhdGUpIHtcbiAgICBpZiAobmV4dFByb3BzLmRhdGEgIT09IHByZXZTdGF0ZS5wcmV2RGF0YSB8fCBuZXh0UHJvcHMudHlwZSAhPT0gcHJldlN0YXRlLnByZXZUeXBlIHx8IG5leHRQcm9wcy53aWR0aCAhPT0gcHJldlN0YXRlLnByZXZXaWR0aCB8fCBuZXh0UHJvcHMuaGVpZ2h0ICE9PSBwcmV2U3RhdGUucHJldkhlaWdodCB8fCBuZXh0UHJvcHMuZGF0YUtleSAhPT0gcHJldlN0YXRlLnByZXZEYXRhS2V5IHx8IG5leHRQcm9wcy5hc3BlY3RSYXRpbyAhPT0gcHJldlN0YXRlLnByZXZBc3BlY3RSYXRpbykge1xuICAgICAgdmFyIHJvb3QgPSBjb21wdXRlTm9kZSh7XG4gICAgICAgIGRlcHRoOiAwLFxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIG1pc3NpbmcgcHJvcGVydGllc1xuICAgICAgICBub2RlOiB7XG4gICAgICAgICAgY2hpbGRyZW46IG5leHRQcm9wcy5kYXRhLFxuICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgeTogMCxcbiAgICAgICAgICB3aWR0aDogbmV4dFByb3BzLndpZHRoLFxuICAgICAgICAgIGhlaWdodDogbmV4dFByb3BzLmhlaWdodFxuICAgICAgICB9LFxuICAgICAgICBpbmRleDogMCxcbiAgICAgICAgZGF0YUtleTogbmV4dFByb3BzLmRhdGFLZXksXG4gICAgICAgIG5hbWVLZXk6IG5leHRQcm9wcy5uYW1lS2V5XG4gICAgICB9KTtcbiAgICAgIHZhciBmb3JtYXRSb290ID0gc3F1YXJpZnkocm9vdCwgbmV4dFByb3BzLmFzcGVjdFJhdGlvKTtcbiAgICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIHByZXZTdGF0ZSksIHt9LCB7XG4gICAgICAgIGZvcm1hdFJvb3QsXG4gICAgICAgIGN1cnJlbnRSb290OiByb290LFxuICAgICAgICBuZXN0SW5kZXg6IFtyb290XSxcbiAgICAgICAgcHJldkFzcGVjdFJhdGlvOiBuZXh0UHJvcHMuYXNwZWN0UmF0aW8sXG4gICAgICAgIHByZXZEYXRhOiBuZXh0UHJvcHMuZGF0YSxcbiAgICAgICAgcHJldldpZHRoOiBuZXh0UHJvcHMud2lkdGgsXG4gICAgICAgIHByZXZIZWlnaHQ6IG5leHRQcm9wcy5oZWlnaHQsXG4gICAgICAgIHByZXZEYXRhS2V5OiBuZXh0UHJvcHMuZGF0YUtleSxcbiAgICAgICAgcHJldlR5cGU6IG5leHRQcm9wcy50eXBlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaGFuZGxlTmVzdEluZGV4KG5vZGUsIGkpIHtcbiAgICB2YXIge1xuICAgICAgbmVzdEluZGV4XG4gICAgfSA9IHRoaXMuc3RhdGU7XG4gICAgdmFyIHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgZGF0YUtleSxcbiAgICAgIG5hbWVLZXksXG4gICAgICBhc3BlY3RSYXRpb1xuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIHZhciByb290ID0gY29tcHV0ZU5vZGUoe1xuICAgICAgZGVwdGg6IDAsXG4gICAgICBub2RlOiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIG5vZGUpLCB7fSwge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwLFxuICAgICAgICB3aWR0aCxcbiAgICAgICAgaGVpZ2h0XG4gICAgICB9KSxcbiAgICAgIGluZGV4OiAwLFxuICAgICAgZGF0YUtleSxcbiAgICAgIG5hbWVLZXksXG4gICAgICAvLyB3aXRoIFRyZWVtYXAgbmVzdGluZywgc2hvdWxkIHRoaXMgY29udGludWUgbmVzdGluZyB0aGUgaW5kZXggb3Igc3RhcnQgZnJvbSBlbXB0eSBzdHJpbmc/XG4gICAgICBuZXN0ZWRBY3RpdmVUb29sdGlwSW5kZXg6IG5vZGUudG9vbHRpcEluZGV4XG4gICAgfSk7XG4gICAgdmFyIGZvcm1hdFJvb3QgPSBzcXVhcmlmeShyb290LCBhc3BlY3RSYXRpbyk7XG4gICAgbmVzdEluZGV4ID0gbmVzdEluZGV4LnNsaWNlKDAsIGkgKyAxKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZvcm1hdFJvb3QsXG4gICAgICBjdXJyZW50Um9vdDogbm9kZSxcbiAgICAgIG5lc3RJbmRleFxuICAgIH0pO1xuICB9XG4gIHJlbmRlck5vZGUocm9vdCwgbm9kZSkge1xuICAgIHZhciB7XG4gICAgICBjb250ZW50LFxuICAgICAgdHlwZVxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIHZhciBub2RlUHJvcHMgPSBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgc3ZnUHJvcGVydGllc05vRXZlbnRzKHRoaXMucHJvcHMpKSwgbm9kZSksIHt9LCB7XG4gICAgICByb290XG4gICAgfSk7XG4gICAgdmFyIGlzTGVhZiA9ICFub2RlLmNoaWxkcmVuIHx8ICFub2RlLmNoaWxkcmVuLmxlbmd0aDtcbiAgICB2YXIge1xuICAgICAgY3VycmVudFJvb3RcbiAgICB9ID0gdGhpcy5zdGF0ZTtcbiAgICB2YXIgaXNDdXJyZW50Um9vdENoaWxkID0gKChjdXJyZW50Um9vdCA9PT0gbnVsbCB8fCBjdXJyZW50Um9vdCA9PT0gdm9pZCAwID8gdm9pZCAwIDogY3VycmVudFJvb3QuY2hpbGRyZW4pIHx8IFtdKS5maWx0ZXIoaXRlbSA9PiBpdGVtLmRlcHRoID09PSBub2RlLmRlcHRoICYmIGl0ZW0ubmFtZSA9PT0gbm9kZS5uYW1lKTtcbiAgICBpZiAoIWlzQ3VycmVudFJvb3RDaGlsZC5sZW5ndGggJiYgcm9vdC5kZXB0aCAmJiB0eXBlID09PSAnbmVzdCcpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGF5ZXIsIHtcbiAgICAgIGtleTogXCJyZWNoYXJ0cy10cmVlbWFwLW5vZGUtXCIuY29uY2F0KG5vZGVQcm9wcy54LCBcIi1cIikuY29uY2F0KG5vZGVQcm9wcy55LCBcIi1cIikuY29uY2F0KG5vZGVQcm9wcy5uYW1lKSxcbiAgICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy10cmVlbWFwLWRlcHRoLVwiLmNvbmNhdChub2RlLmRlcHRoKVxuICAgIH0sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFRyZWVtYXBJdGVtLCB7XG4gICAgICBpc0xlYWY6IGlzTGVhZixcbiAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXG4gICAgICBub2RlUHJvcHM6IG5vZGVQcm9wcyxcbiAgICAgIHRyZWVtYXBQcm9wczogdGhpcy5wcm9wcyxcbiAgICAgIG9uTmVzdENsaWNrOiB0aGlzLmhhbmRsZUNsaWNrXG4gICAgfSksIG5vZGUuY2hpbGRyZW4gJiYgbm9kZS5jaGlsZHJlbi5sZW5ndGggPyBub2RlLmNoaWxkcmVuLm1hcChjaGlsZCA9PiB0aGlzLnJlbmRlck5vZGUobm9kZSwgY2hpbGQpKSA6IG51bGwpO1xuICB9XG4gIHJlbmRlckFsbE5vZGVzKCkge1xuICAgIHZhciB7XG4gICAgICBmb3JtYXRSb290XG4gICAgfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKCFmb3JtYXRSb290KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyTm9kZShmb3JtYXRSb290LCBmb3JtYXRSb290KTtcbiAgfVxuXG4gIC8vIHJlbmRlciBuZXN0IHRyZWVtYXBcbiAgcmVuZGVyTmVzdEluZGV4KCkge1xuICAgIHZhciB7XG4gICAgICBuYW1lS2V5LFxuICAgICAgbmVzdEluZGV4Q29udGVudFxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIHZhciB7XG4gICAgICBuZXN0SW5kZXhcbiAgICB9ID0gdGhpcy5zdGF0ZTtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgY2xhc3NOYW1lOiBcInJlY2hhcnRzLXRyZWVtYXAtbmVzdC1pbmRleC13cmFwcGVyXCIsXG4gICAgICBzdHlsZToge1xuICAgICAgICBtYXJnaW5Ub3A6ICc4cHgnLFxuICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInXG4gICAgICB9XG4gICAgfSwgbmVzdEluZGV4Lm1hcCgoaXRlbSwgaSkgPT4ge1xuICAgICAgLy8gVE9ETyBuZWVkIHRvIHZlcmlmeSBuYW1lS2V5IHR5cGVcbiAgICAgIHZhciBuYW1lID0gZ2V0KGl0ZW0sIG5hbWVLZXksICdyb290Jyk7XG4gICAgICB2YXIgY29udGVudDtcbiAgICAgIGlmICgvKiNfX1BVUkVfXyovUmVhY3QuaXNWYWxpZEVsZW1lbnQobmVzdEluZGV4Q29udGVudCkpIHtcbiAgICAgICAgLy8gdGhlIGNsb25lZCBjb250ZW50IGlzIGlnbm9yZWQgYXQgYWxsIHRpbWVzIC0gbGV0J3MgcmVtb3ZlIGl0P1xuICAgICAgICBjb250ZW50ID0gLyojX19QVVJFX18qL1JlYWN0LmNsb25lRWxlbWVudChuZXN0SW5kZXhDb250ZW50LCBpdGVtLCBpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbmVzdEluZGV4Q29udGVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb250ZW50ID0gbmVzdEluZGV4Q29udGVudChpdGVtLCBpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRlbnQgPSBuYW1lO1xuICAgICAgfVxuICAgICAgcmV0dXJuIChcbiAgICAgICAgLyojX19QVVJFX18qL1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUganN4LWExMXkvY2xpY2stZXZlbnRzLWhhdmUta2V5LWV2ZW50cywganN4LWExMXkvbm8tc3RhdGljLWVsZW1lbnQtaW50ZXJhY3Rpb25zXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgICAgIG9uQ2xpY2s6IHRoaXMuaGFuZGxlTmVzdEluZGV4LmJpbmQodGhpcywgaXRlbSwgaSksXG4gICAgICAgICAga2V5OiBcIm5lc3QtaW5kZXgtXCIuY29uY2F0KHVuaXF1ZUlkKCkpLFxuICAgICAgICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy10cmVlbWFwLW5lc3QtaW5kZXgtYm94XCIsXG4gICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgICAgICAgICBwYWRkaW5nOiAnMCA3cHgnLFxuICAgICAgICAgICAgYmFja2dyb3VuZDogJyMwMDAnLFxuICAgICAgICAgICAgY29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgIG1hcmdpblJpZ2h0OiAnM3B4J1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgY29udGVudClcbiAgICAgICk7XG4gICAgfSkpO1xuICB9XG4gIHJlbmRlcigpIHtcbiAgICB2YXIgX3RoaXMkcHJvcHMgPSB0aGlzLnByb3BzLFxuICAgICAge1xuICAgICAgICB3aWR0aCxcbiAgICAgICAgaGVpZ2h0LFxuICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgIHN0eWxlLFxuICAgICAgICBjaGlsZHJlbixcbiAgICAgICAgdHlwZVxuICAgICAgfSA9IF90aGlzJHByb3BzLFxuICAgICAgb3RoZXJzID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKF90aGlzJHByb3BzLCBfZXhjbHVkZWQpO1xuICAgIHZhciBhdHRycyA9IHN2Z1Byb3BlcnRpZXNOb0V2ZW50cyhvdGhlcnMpO1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5GcmFnbWVudCwgbnVsbCwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2V0VG9vbHRpcEVudHJ5U2V0dGluZ3MsIHtcbiAgICAgIGZuOiBnZXRUb29sdGlwRW50cnlTZXR0aW5ncyxcbiAgICAgIGFyZ3M6IHtcbiAgICAgICAgcHJvcHM6IHRoaXMucHJvcHMsXG4gICAgICAgIGN1cnJlbnRSb290OiB0aGlzLnN0YXRlLmN1cnJlbnRSb290XG4gICAgICB9XG4gICAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFN1cmZhY2UsIF9leHRlbmRzKHt9LCBhdHRycywge1xuICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgaGVpZ2h0OiB0eXBlID09PSAnbmVzdCcgPyBoZWlnaHQgLSAzMCA6IGhlaWdodCxcbiAgICAgIG9uVG91Y2hNb3ZlOiB0aGlzLmhhbmRsZVRvdWNoTW92ZVxuICAgIH0pLCB0aGlzLnJlbmRlckFsbE5vZGVzKCksIGNoaWxkcmVuKSwgdHlwZSA9PT0gJ25lc3QnICYmIHRoaXMucmVuZGVyTmVzdEluZGV4KCkpO1xuICB9XG59XG5fZGVmaW5lUHJvcGVydHkoVHJlZW1hcFdpdGhTdGF0ZSwgXCJkaXNwbGF5TmFtZVwiLCAnVHJlZW1hcCcpO1xuZnVuY3Rpb24gVHJlZW1hcERpc3BhdGNoSW5qZWN0KHByb3BzKSB7XG4gIHZhciBkaXNwYXRjaCA9IHVzZUFwcERpc3BhdGNoKCk7XG4gIHZhciB3aWR0aCA9IHVzZUNoYXJ0V2lkdGgoKTtcbiAgdmFyIGhlaWdodCA9IHVzZUNoYXJ0SGVpZ2h0KCk7XG4gIGlmICghaXNQb3NpdGl2ZU51bWJlcih3aWR0aCkgfHwgIWlzUG9zaXRpdmVOdW1iZXIoaGVpZ2h0KSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChUcmVlbWFwV2l0aFN0YXRlLCBfZXh0ZW5kcyh7fSwgcHJvcHMsIHtcbiAgICB3aWR0aDogd2lkdGgsXG4gICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgZGlzcGF0Y2g6IGRpc3BhdGNoXG4gIH0pKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBUcmVlbWFwKG91dHNpZGVQcm9wcykge1xuICB2YXIgX3Byb3BzJGNsYXNzTmFtZTtcbiAgdmFyIHByb3BzID0gcmVzb2x2ZURlZmF1bHRQcm9wcyhvdXRzaWRlUHJvcHMsIGRlZmF1bHRUcmVlTWFwUHJvcHMpO1xuICB2YXIge1xuICAgIGNsYXNzTmFtZSxcbiAgICBzdHlsZSxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHRcbiAgfSA9IHByb3BzO1xuICB2YXIgW3Rvb2x0aXBQb3J0YWwsIHNldFRvb2x0aXBQb3J0YWxdID0gdXNlU3RhdGUobnVsbCk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWNoYXJ0c1N0b3JlUHJvdmlkZXIsIHtcbiAgICBwcmVsb2FkZWRTdGF0ZToge1xuICAgICAgb3B0aW9uc1xuICAgIH0sXG4gICAgcmVkdXhTdG9yZU5hbWU6IChfcHJvcHMkY2xhc3NOYW1lID0gcHJvcHMuY2xhc3NOYW1lKSAhPT0gbnVsbCAmJiBfcHJvcHMkY2xhc3NOYW1lICE9PSB2b2lkIDAgPyBfcHJvcHMkY2xhc3NOYW1lIDogJ1RyZWVtYXAnXG4gIH0sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlcG9ydENoYXJ0TWFyZ2luLCB7XG4gICAgbWFyZ2luOiBkZWZhdWx0VHJlZW1hcE1hcmdpblxuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVjaGFydHNXcmFwcGVyLCB7XG4gICAgZGlzcGF0Y2hUb3VjaEV2ZW50czogZmFsc2UsXG4gICAgY2xhc3NOYW1lOiBjbGFzc05hbWUsXG4gICAgc3R5bGU6IHN0eWxlLFxuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBoZWlnaHQ6IGhlaWdodFxuICAgIC8qXG4gICAgICogVHJlZW1hcCBoYXMgYSBidWcgd2hlcmUgaXQgZG9lc24ndCBpbmNsdWRlIHN0cm9rZVdpZHRoIGluIGl0cyBkaW1lbnNpb24gY2FsY3VsYXRpb25cbiAgICAgKiB3aGljaCBtYWtlcyB0aGUgYWN0dWFsIGNoYXJ0IGV4YWN0bHkge3N0cm9rZVdpZHRofSBsYXJnZXIgdGhhbiBhc2tlZCBmb3IuXG4gICAgICogSXQncyBub3QgYSBodWdlIGRlYWwgdXN1YWxseSwgYnV0IGl0IG1ha2VzIHRoZSByZXNwb25zaXZlIG9wdGlvbiBjeWNsZSBpbmZpbml0ZWx5LlxuICAgICAqLyxcbiAgICByZXNwb25zaXZlOiBmYWxzZSxcbiAgICByZWY6IG5vZGUgPT4ge1xuICAgICAgaWYgKHRvb2x0aXBQb3J0YWwgPT0gbnVsbCAmJiBub2RlICE9IG51bGwpIHtcbiAgICAgICAgc2V0VG9vbHRpcFBvcnRhbChub2RlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG9uTW91c2VFbnRlcjogdW5kZWZpbmVkLFxuICAgIG9uTW91c2VMZWF2ZTogdW5kZWZpbmVkLFxuICAgIG9uQ2xpY2s6IHVuZGVmaW5lZCxcbiAgICBvbk1vdXNlTW92ZTogdW5kZWZpbmVkLFxuICAgIG9uTW91c2VEb3duOiB1bmRlZmluZWQsXG4gICAgb25Nb3VzZVVwOiB1bmRlZmluZWQsXG4gICAgb25Db250ZXh0TWVudTogdW5kZWZpbmVkLFxuICAgIG9uRG91YmxlQ2xpY2s6IHVuZGVmaW5lZCxcbiAgICBvblRvdWNoU3RhcnQ6IHVuZGVmaW5lZCxcbiAgICBvblRvdWNoTW92ZTogdW5kZWZpbmVkLFxuICAgIG9uVG91Y2hFbmQ6IHVuZGVmaW5lZFxuICB9LCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChUb29sdGlwUG9ydGFsQ29udGV4dC5Qcm92aWRlciwge1xuICAgIHZhbHVlOiB0b29sdGlwUG9ydGFsXG4gIH0sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFRyZWVtYXBEaXNwYXRjaEluamVjdCwgcHJvcHMpKSkpO1xufSIsImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGZvcndhcmRSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBhcnJheVRvb2x0aXBTZWFyY2hlciB9IGZyb20gJy4uL3N0YXRlL29wdGlvbnNTbGljZSc7XG5pbXBvcnQgeyBDYXJ0ZXNpYW5DaGFydCB9IGZyb20gJy4vQ2FydGVzaWFuQ2hhcnQnO1xudmFyIGFsbG93ZWRUb29sdGlwVHlwZXMgPSBbJ2l0ZW0nXTtcbmV4cG9ydCB2YXIgU2NhdHRlckNoYXJ0ID0gLyojX19QVVJFX18qL2ZvcndhcmRSZWYoKHByb3BzLCByZWYpID0+IHtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KENhcnRlc2lhbkNoYXJ0LCB7XG4gICAgY2hhcnROYW1lOiBcIlNjYXR0ZXJDaGFydFwiLFxuICAgIGRlZmF1bHRUb29sdGlwRXZlbnRUeXBlOiBcIml0ZW1cIixcbiAgICB2YWxpZGF0ZVRvb2x0aXBFdmVudFR5cGVzOiBhbGxvd2VkVG9vbHRpcFR5cGVzLFxuICAgIHRvb2x0aXBQYXlsb2FkU2VhcmNoZXI6IGFycmF5VG9vbHRpcFNlYXJjaGVyLFxuICAgIGNhdGVnb3JpY2FsQ2hhcnRQcm9wczogcHJvcHMsXG4gICAgcmVmOiByZWZcbiAgfSk7XG59KTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=