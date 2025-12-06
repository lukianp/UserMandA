"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[1444],{

/***/ 20776:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  GW: () => (/* reexport */ value),
  Xl: () => (/* reexport */ cubehelixLong),
  Dj: () => (/* reexport */ number),
  Zr: () => (/* reexport */ rgb),
  z4: () => (/* reexport */ rgbBasis),
  sH: () => (/* reexport */ round),
  zl: () => (/* reexport */ string),
  TE: () => (/* reexport */ interpolateTransformCss),
  pN: () => (/* reexport */ interpolateTransformSvg),
  p7: () => (/* reexport */ zoom),
  $B: () => (/* reexport */ piecewise)
});

// UNUSED EXPORTS: interpolateArray, interpolateBasis, interpolateBasisClosed, interpolateCubehelix, interpolateDate, interpolateDiscrete, interpolateHcl, interpolateHclLong, interpolateHsl, interpolateHslLong, interpolateHue, interpolateLab, interpolateNumberArray, interpolateObject, interpolateRgbBasisClosed, quantize

// EXTERNAL MODULE: ./node_modules/d3-color/src/index.js + 5 modules
var src = __webpack_require__(75423);
;// ./node_modules/d3-interpolate/src/basis.js
function basis(t1, v0, v1, v2, v3) {
  var t2 = t1 * t1, t3 = t2 * t1;
  return ((1 - 3 * t1 + 3 * t2 - t3) * v0
      + (4 - 6 * t2 + 3 * t3) * v1
      + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2
      + t3 * v3) / 6;
}

/* harmony default export */ function src_basis(values) {
  var n = values.length - 1;
  return function(t) {
    var i = t <= 0 ? (t = 0) : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n),
        v1 = values[i],
        v2 = values[i + 1],
        v0 = i > 0 ? values[i - 1] : 2 * v1 - v2,
        v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}

;// ./node_modules/d3-interpolate/src/basisClosed.js


/* harmony default export */ function basisClosed(values) {
  var n = values.length;
  return function(t) {
    var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n),
        v0 = values[(i + n - 1) % n],
        v1 = values[i % n],
        v2 = values[(i + 1) % n],
        v3 = values[(i + 2) % n];
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}

;// ./node_modules/d3-interpolate/src/constant.js
/* harmony default export */ const constant = (x => () => x);

;// ./node_modules/d3-interpolate/src/color.js


function linear(a, d) {
  return function(t) {
    return a + t * d;
  };
}

function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    return Math.pow(a + t * b, y);
  };
}

function color_hue(a, b) {
  var d = b - a;
  return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant(isNaN(a) ? b : a);
}

function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
  };
}

function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant(isNaN(a) ? b : a);
}

;// ./node_modules/d3-interpolate/src/rgb.js





/* harmony default export */ const rgb = ((function rgbGamma(y) {
  var color = gamma(y);

  function rgb(start, end) {
    var r = color((start = (0,src/* rgb */.Qh)(start)).r, (end = (0,src/* rgb */.Qh)(end)).r),
        g = color(start.g, end.g),
        b = color(start.b, end.b),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.r = r(t);
      start.g = g(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }

  rgb.gamma = rgbGamma;

  return rgb;
})(1));

function rgbSpline(spline) {
  return function(colors) {
    var n = colors.length,
        r = new Array(n),
        g = new Array(n),
        b = new Array(n),
        i, color;
    for (i = 0; i < n; ++i) {
      color = (0,src/* rgb */.Qh)(colors[i]);
      r[i] = color.r || 0;
      g[i] = color.g || 0;
      b[i] = color.b || 0;
    }
    r = spline(r);
    g = spline(g);
    b = spline(b);
    color.opacity = 1;
    return function(t) {
      color.r = r(t);
      color.g = g(t);
      color.b = b(t);
      return color + "";
    };
  };
}

var rgbBasis = rgbSpline(src_basis);
var rgbBasisClosed = rgbSpline(basisClosed);

;// ./node_modules/d3-interpolate/src/numberArray.js
/* harmony default export */ function src_numberArray(a, b) {
  if (!b) b = [];
  var n = a ? Math.min(b.length, a.length) : 0,
      c = b.slice(),
      i;
  return function(t) {
    for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
    return c;
  };
}

function numberArray_isNumberArray(x) {
  return ArrayBuffer.isView(x) && !(x instanceof DataView);
}

;// ./node_modules/d3-interpolate/src/array.js



/* harmony default export */ function array(a, b) {
  return (isNumberArray(b) ? numberArray : genericArray)(a, b);
}

function genericArray(a, b) {
  var nb = b ? b.length : 0,
      na = a ? Math.min(nb, a.length) : 0,
      x = new Array(na),
      c = new Array(nb),
      i;

  for (i = 0; i < na; ++i) x[i] = value(a[i], b[i]);
  for (; i < nb; ++i) c[i] = b[i];

  return function(t) {
    for (i = 0; i < na; ++i) c[i] = x[i](t);
    return c;
  };
}

;// ./node_modules/d3-interpolate/src/date.js
/* harmony default export */ function date(a, b) {
  var d = new Date;
  return a = +a, b = +b, function(t) {
    return d.setTime(a * (1 - t) + b * t), d;
  };
}

;// ./node_modules/d3-interpolate/src/number.js
/* harmony default export */ function number(a, b) {
  return a = +a, b = +b, function(t) {
    return a * (1 - t) + b * t;
  };
}

;// ./node_modules/d3-interpolate/src/object.js


/* harmony default export */ function object(a, b) {
  var i = {},
      c = {},
      k;

  if (a === null || typeof a !== "object") a = {};
  if (b === null || typeof b !== "object") b = {};

  for (k in b) {
    if (k in a) {
      i[k] = value(a[k], b[k]);
    } else {
      c[k] = b[k];
    }
  }

  return function(t) {
    for (k in i) c[k] = i[k](t);
    return c;
  };
}

;// ./node_modules/d3-interpolate/src/string.js


var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
    reB = new RegExp(reA.source, "g");

function zero(b) {
  return function() {
    return b;
  };
}

function one(b) {
  return function(t) {
    return b(t) + "";
  };
}

/* harmony default export */ function string(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
      am, // current match in a
      bm, // current match in b
      bs, // string preceding current number in b, if any
      i = -1, // index in s
      s = [], // string constants and placeholders
      q = []; // number interpolators

  // Coerce inputs to strings.
  a = a + "", b = b + "";

  // Interpolate pairs of numbers in a & b.
  while ((am = reA.exec(a))
      && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) { // a string precedes the next number in b
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
      if (s[i]) s[i] += bm; // coalesce with previous string
      else s[++i] = bm;
    } else { // interpolate non-matching numbers
      s[++i] = null;
      q.push({i: i, x: number(am, bm)});
    }
    bi = reB.lastIndex;
  }

  // Add remains of b.
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs; // coalesce with previous string
    else s[++i] = bs;
  }

  // Special optimization for only a single match.
  // Otherwise, interpolate each of the numbers and rejoin the string.
  return s.length < 2 ? (q[0]
      ? one(q[0].x)
      : zero(b))
      : (b = q.length, function(t) {
          for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
          return s.join("");
        });
}

;// ./node_modules/d3-interpolate/src/value.js










/* harmony default export */ function value(a, b) {
  var t = typeof b, c;
  return b == null || t === "boolean" ? constant(b)
      : (t === "number" ? number
      : t === "string" ? ((c = (0,src/* color */.yW)(b)) ? (b = c, rgb) : string)
      : b instanceof src/* color */.yW ? rgb
      : b instanceof Date ? date
      : numberArray_isNumberArray(b) ? src_numberArray
      : Array.isArray(b) ? genericArray
      : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
      : number)(a, b);
}

;// ./node_modules/d3-interpolate/src/discrete.js
/* harmony default export */ function discrete(range) {
  var n = range.length;
  return function(t) {
    return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
  };
}

;// ./node_modules/d3-interpolate/src/hue.js


/* harmony default export */ function src_hue(a, b) {
  var i = hue(+a, +b);
  return function(t) {
    var x = i(t);
    return x - 360 * Math.floor(x / 360);
  };
}

;// ./node_modules/d3-interpolate/src/round.js
/* harmony default export */ function round(a, b) {
  return a = +a, b = +b, function(t) {
    return Math.round(a * (1 - t) + b * t);
  };
}

;// ./node_modules/d3-interpolate/src/transform/decompose.js
var degrees = 180 / Math.PI;

var identity = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};

/* harmony default export */ function decompose(a, b, c, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX: scaleX,
    scaleY: scaleY
  };
}

;// ./node_modules/d3-interpolate/src/transform/parse.js


var svgNode;

/* eslint-disable no-undef */
function parseCss(value) {
  const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
  return m.isIdentity ? identity : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
}

function parseSvg(value) {
  if (value == null) return identity;
  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
  value = value.matrix;
  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
}

;// ./node_modules/d3-interpolate/src/transform/index.js



function interpolateTransform(parse, pxComma, pxParen, degParen) {

  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }

  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({i: i - 4, x: number(xa, xb)}, {i: i - 2, x: number(ya, yb)});
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }

  function rotate(a, b, s, q) {
    if (a !== b) {
      if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
      q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: number(a, b)});
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }

  function skewX(a, b, s, q) {
    if (a !== b) {
      q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: number(a, b)});
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }

  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({i: i - 4, x: number(xa, xb)}, {i: i - 2, x: number(ya, yb)});
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }

  return function(a, b) {
    var s = [], // string constants and placeholders
        q = []; // number interpolators
    a = parse(a), b = parse(b);
    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null; // gc
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}

var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

;// ./node_modules/d3-interpolate/src/zoom.js
var epsilon2 = 1e-12;

function cosh(x) {
  return ((x = Math.exp(x)) + 1 / x) / 2;
}

function sinh(x) {
  return ((x = Math.exp(x)) - 1 / x) / 2;
}

function tanh(x) {
  return ((x = Math.exp(2 * x)) - 1) / (x + 1);
}

/* harmony default export */ const zoom = ((function zoomRho(rho, rho2, rho4) {

  // p0 = [ux0, uy0, w0]
  // p1 = [ux1, uy1, w1]
  function zoom(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2],
        ux1 = p1[0], uy1 = p1[1], w1 = p1[2],
        dx = ux1 - ux0,
        dy = uy1 - uy0,
        d2 = dx * dx + dy * dy,
        i,
        S;

    // Special case for u0 ≅ u1.
    if (d2 < epsilon2) {
      S = Math.log(w1 / w0) / rho;
      i = function(t) {
        return [
          ux0 + t * dx,
          uy0 + t * dy,
          w0 * Math.exp(rho * t * S)
        ];
      }
    }

    // General case.
    else {
      var d1 = Math.sqrt(d2),
          b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1),
          b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1),
          r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0),
          r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      i = function(t) {
        var s = t * S,
            coshr0 = cosh(r0),
            u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
        return [
          ux0 + u * dx,
          uy0 + u * dy,
          w0 * coshr0 / cosh(rho * s + r0)
        ];
      }
    }

    i.duration = S * 1000 * rho / Math.SQRT2;

    return i;
  }

  zoom.rho = function(_) {
    var _1 = Math.max(1e-3, +_), _2 = _1 * _1, _4 = _2 * _2;
    return zoomRho(_1, _2, _4);
  };

  return zoom;
})(Math.SQRT2, 2, 4));

;// ./node_modules/d3-interpolate/src/hsl.js



function hsl(hue) {
  return function(start, end) {
    var h = hue((start = (0,src/* hsl */.KI)(start)).h, (end = (0,src/* hsl */.KI)(end)).h),
        s = nogamma(start.s, end.s),
        l = nogamma(start.l, end.l),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.h = h(t);
      start.s = s(t);
      start.l = l(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }
}

/* harmony default export */ const src_hsl = (hsl(color_hue));
var hslLong = hsl(nogamma);

;// ./node_modules/d3-interpolate/src/lab.js



function lab(start, end) {
  var l = color((start = colorLab(start)).l, (end = colorLab(end)).l),
      a = color(start.a, end.a),
      b = color(start.b, end.b),
      opacity = color(start.opacity, end.opacity);
  return function(t) {
    start.l = l(t);
    start.a = a(t);
    start.b = b(t);
    start.opacity = opacity(t);
    return start + "";
  };
}

;// ./node_modules/d3-interpolate/src/hcl.js



function hcl(hue) {
  return function(start, end) {
    var h = hue((start = (0,src/* hcl */.aq)(start)).h, (end = (0,src/* hcl */.aq)(end)).h),
        c = nogamma(start.c, end.c),
        l = nogamma(start.l, end.l),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.h = h(t);
      start.c = c(t);
      start.l = l(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }
}

/* harmony default export */ const src_hcl = (hcl(color_hue));
var hclLong = hcl(nogamma);

;// ./node_modules/d3-interpolate/src/cubehelix.js



function cubehelix(hue) {
  return (function cubehelixGamma(y) {
    y = +y;

    function cubehelix(start, end) {
      var h = hue((start = (0,src/* cubehelix */.UB)(start)).h, (end = (0,src/* cubehelix */.UB)(end)).h),
          s = nogamma(start.s, end.s),
          l = nogamma(start.l, end.l),
          opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.h = h(t);
        start.s = s(t);
        start.l = l(Math.pow(t, y));
        start.opacity = opacity(t);
        return start + "";
      };
    }

    cubehelix.gamma = cubehelixGamma;

    return cubehelix;
  })(1);
}

/* harmony default export */ const src_cubehelix = (cubehelix(color_hue));
var cubehelixLong = cubehelix(nogamma);

;// ./node_modules/d3-interpolate/src/piecewise.js


function piecewise(interpolate, values) {
  if (values === undefined) values = interpolate, interpolate = value;
  var i = 0, n = values.length - 1, v = values[0], I = new Array(n < 0 ? 0 : n);
  while (i < n) I[i] = interpolate(v, v = values[++i]);
  return function(t) {
    var i = Math.max(0, Math.min(n - 1, Math.floor(t *= n)));
    return I[i](t - i);
  };
}

;// ./node_modules/d3-interpolate/src/quantize.js
/* harmony default export */ function quantize(interpolator, n) {
  var samples = new Array(n);
  for (var i = 0; i < n; ++i) samples[i] = interpolator(i / (n - 1));
  return samples;
}

;// ./node_modules/d3-interpolate/src/index.js























/***/ }),

/***/ 63188:
/***/ (() => {


// UNUSED EXPORTS: Node, cluster, hierarchy, pack, packEnclose, packSiblings, partition, stratify, tree, treemap, treemapBinary, treemapDice, treemapResquarify, treemapSlice, treemapSliceDice, treemapSquarify

;// ./node_modules/d3-hierarchy/src/cluster.js
function defaultSeparation(a, b) {
  return a.parent === b.parent ? 1 : 2;
}

function meanX(children) {
  return children.reduce(meanXReduce, 0) / children.length;
}

function meanXReduce(x, c) {
  return x + c.x;
}

function maxY(children) {
  return 1 + children.reduce(maxYReduce, 0);
}

function maxYReduce(y, c) {
  return Math.max(y, c.y);
}

function leafLeft(node) {
  var children;
  while (children = node.children) node = children[0];
  return node;
}

function leafRight(node) {
  var children;
  while (children = node.children) node = children[children.length - 1];
  return node;
}

/* harmony default export */ function cluster() {
  var separation = defaultSeparation,
      dx = 1,
      dy = 1,
      nodeSize = false;

  function cluster(root) {
    var previousNode,
        x = 0;

    // First walk, computing the initial x & y values.
    root.eachAfter(function(node) {
      var children = node.children;
      if (children) {
        node.x = meanX(children);
        node.y = maxY(children);
      } else {
        node.x = previousNode ? x += separation(node, previousNode) : 0;
        node.y = 0;
        previousNode = node;
      }
    });

    var left = leafLeft(root),
        right = leafRight(root),
        x0 = left.x - separation(left, right) / 2,
        x1 = right.x + separation(right, left) / 2;

    // Second walk, normalizing x & y to the desired size.
    return root.eachAfter(nodeSize ? function(node) {
      node.x = (node.x - root.x) * dx;
      node.y = (root.y - node.y) * dy;
    } : function(node) {
      node.x = (node.x - x0) / (x1 - x0) * dx;
      node.y = (1 - (root.y ? node.y / root.y : 1)) * dy;
    });
  }

  cluster.separation = function(x) {
    return arguments.length ? (separation = x, cluster) : separation;
  };

  cluster.size = function(x) {
    return arguments.length ? (nodeSize = false, dx = +x[0], dy = +x[1], cluster) : (nodeSize ? null : [dx, dy]);
  };

  cluster.nodeSize = function(x) {
    return arguments.length ? (nodeSize = true, dx = +x[0], dy = +x[1], cluster) : (nodeSize ? [dx, dy] : null);
  };

  return cluster;
}

;// ./node_modules/d3-hierarchy/src/hierarchy/count.js
function count(node) {
  var sum = 0,
      children = node.children,
      i = children && children.length;
  if (!i) sum = 1;
  else while (--i >= 0) sum += children[i].value;
  node.value = sum;
}

/* harmony default export */ function hierarchy_count() {
  return this.eachAfter(count);
}

;// ./node_modules/d3-hierarchy/src/hierarchy/each.js
/* harmony default export */ function each(callback, that) {
  let index = -1;
  for (const node of this) {
    callback.call(that, node, ++index, this);
  }
  return this;
}

;// ./node_modules/d3-hierarchy/src/hierarchy/eachBefore.js
/* harmony default export */ function eachBefore(callback, that) {
  var node = this, nodes = [node], children, i, index = -1;
  while (node = nodes.pop()) {
    callback.call(that, node, ++index, this);
    if (children = node.children) {
      for (i = children.length - 1; i >= 0; --i) {
        nodes.push(children[i]);
      }
    }
  }
  return this;
}

;// ./node_modules/d3-hierarchy/src/hierarchy/eachAfter.js
/* harmony default export */ function eachAfter(callback, that) {
  var node = this, nodes = [node], next = [], children, i, n, index = -1;
  while (node = nodes.pop()) {
    next.push(node);
    if (children = node.children) {
      for (i = 0, n = children.length; i < n; ++i) {
        nodes.push(children[i]);
      }
    }
  }
  while (node = next.pop()) {
    callback.call(that, node, ++index, this);
  }
  return this;
}

;// ./node_modules/d3-hierarchy/src/hierarchy/find.js
/* harmony default export */ function find(callback, that) {
  let index = -1;
  for (const node of this) {
    if (callback.call(that, node, ++index, this)) {
      return node;
    }
  }
}

;// ./node_modules/d3-hierarchy/src/hierarchy/sum.js
/* harmony default export */ function sum(value) {
  return this.eachAfter(function(node) {
    var sum = +value(node.data) || 0,
        children = node.children,
        i = children && children.length;
    while (--i >= 0) sum += children[i].value;
    node.value = sum;
  });
}

;// ./node_modules/d3-hierarchy/src/hierarchy/sort.js
/* harmony default export */ function sort(compare) {
  return this.eachBefore(function(node) {
    if (node.children) {
      node.children.sort(compare);
    }
  });
}

;// ./node_modules/d3-hierarchy/src/hierarchy/path.js
/* harmony default export */ function path(end) {
  var start = this,
      ancestor = leastCommonAncestor(start, end),
      nodes = [start];
  while (start !== ancestor) {
    start = start.parent;
    nodes.push(start);
  }
  var k = nodes.length;
  while (end !== ancestor) {
    nodes.splice(k, 0, end);
    end = end.parent;
  }
  return nodes;
}

function leastCommonAncestor(a, b) {
  if (a === b) return a;
  var aNodes = a.ancestors(),
      bNodes = b.ancestors(),
      c = null;
  a = aNodes.pop();
  b = bNodes.pop();
  while (a === b) {
    c = a;
    a = aNodes.pop();
    b = bNodes.pop();
  }
  return c;
}

;// ./node_modules/d3-hierarchy/src/hierarchy/ancestors.js
/* harmony default export */ function ancestors() {
  var node = this, nodes = [node];
  while (node = node.parent) {
    nodes.push(node);
  }
  return nodes;
}

;// ./node_modules/d3-hierarchy/src/hierarchy/descendants.js
/* harmony default export */ function descendants() {
  return Array.from(this);
}

;// ./node_modules/d3-hierarchy/src/hierarchy/leaves.js
/* harmony default export */ function leaves() {
  var leaves = [];
  this.eachBefore(function(node) {
    if (!node.children) {
      leaves.push(node);
    }
  });
  return leaves;
}

;// ./node_modules/d3-hierarchy/src/hierarchy/links.js
/* harmony default export */ function links() {
  var root = this, links = [];
  root.each(function(node) {
    if (node !== root) { // Don’t include the root’s parent, if any.
      links.push({source: node.parent, target: node});
    }
  });
  return links;
}

;// ./node_modules/d3-hierarchy/src/hierarchy/iterator.js
/* harmony default export */ function* iterator() {
  var node = this, current, next = [node], children, i, n;
  do {
    current = next.reverse(), next = [];
    while (node = current.pop()) {
      yield node;
      if (children = node.children) {
        for (i = 0, n = children.length; i < n; ++i) {
          next.push(children[i]);
        }
      }
    }
  } while (next.length);
}

;// ./node_modules/d3-hierarchy/src/hierarchy/index.js














function hierarchy(data, children) {
  if (data instanceof Map) {
    data = [undefined, data];
    if (children === undefined) children = mapChildren;
  } else if (children === undefined) {
    children = objectChildren;
  }

  var root = new hierarchy_Node(data),
      node,
      nodes = [root],
      child,
      childs,
      i,
      n;

  while (node = nodes.pop()) {
    if ((childs = children(node.data)) && (n = (childs = Array.from(childs)).length)) {
      node.children = childs;
      for (i = n - 1; i >= 0; --i) {
        nodes.push(child = childs[i] = new hierarchy_Node(childs[i]));
        child.parent = node;
        child.depth = node.depth + 1;
      }
    }
  }

  return root.eachBefore(hierarchy_computeHeight);
}

function node_copy() {
  return hierarchy(this).eachBefore(copyData);
}

function objectChildren(d) {
  return d.children;
}

function mapChildren(d) {
  return Array.isArray(d) ? d[1] : null;
}

function copyData(node) {
  if (node.data.value !== undefined) node.value = node.data.value;
  node.data = node.data.data;
}

function hierarchy_computeHeight(node) {
  var height = 0;
  do node.height = height;
  while ((node = node.parent) && (node.height < ++height));
}

function hierarchy_Node(data) {
  this.data = data;
  this.depth =
  this.height = 0;
  this.parent = null;
}

hierarchy_Node.prototype = hierarchy.prototype = {
  constructor: hierarchy_Node,
  count: hierarchy_count,
  each: each,
  eachAfter: eachAfter,
  eachBefore: eachBefore,
  find: find,
  sum: sum,
  sort: sort,
  path: path,
  ancestors: ancestors,
  descendants: descendants,
  leaves: leaves,
  links: links,
  copy: node_copy,
  [Symbol.iterator]: iterator
};

;// ./node_modules/d3-hierarchy/src/accessors.js
function accessors_optional(f) {
  return f == null ? null : accessors_required(f);
}

function accessors_required(f) {
  if (typeof f !== "function") throw new Error;
  return f;
}

;// ./node_modules/d3-hierarchy/src/constant.js
function constant_constantZero() {
  return 0;
}

/* harmony default export */ function src_constant(x) {
  return function() {
    return x;
  };
}

;// ./node_modules/d3-hierarchy/src/lcg.js
// https://en.wikipedia.org/wiki/Linear_congruential_generator#Parameters_in_common_use
const a = 1664525;
const c = 1013904223;
const m = 4294967296; // 2^32

/* harmony default export */ function src_lcg() {
  let s = 1;
  return () => (s = (a * s + c) % m) / m;
}

;// ./node_modules/d3-hierarchy/src/array.js
/* harmony default export */ function src_array(x) {
  return typeof x === "object" && "length" in x
    ? x // Array, TypedArray, NodeList, array-like
    : Array.from(x); // Map, Set, iterable, string, or anything else
}

function array_shuffle(array, random) {
  let m = array.length,
      t,
      i;

  while (m) {
    i = random() * m-- | 0;
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

;// ./node_modules/d3-hierarchy/src/pack/enclose.js



/* harmony default export */ function enclose(circles) {
  return enclose_packEncloseRandom(circles, lcg());
}

function enclose_packEncloseRandom(circles, random) {
  var i = 0, n = (circles = shuffle(Array.from(circles), random)).length, B = [], p, e;

  while (i < n) {
    p = circles[i];
    if (e && enclosesWeak(e, p)) ++i;
    else e = encloseBasis(B = extendBasis(B, p)), i = 0;
  }

  return e;
}

function extendBasis(B, p) {
  var i, j;

  if (enclosesWeakAll(p, B)) return [p];

  // If we get here then B must have at least one element.
  for (i = 0; i < B.length; ++i) {
    if (enclosesNot(p, B[i])
        && enclosesWeakAll(encloseBasis2(B[i], p), B)) {
      return [B[i], p];
    }
  }

  // If we get here then B must have at least two elements.
  for (i = 0; i < B.length - 1; ++i) {
    for (j = i + 1; j < B.length; ++j) {
      if (enclosesNot(encloseBasis2(B[i], B[j]), p)
          && enclosesNot(encloseBasis2(B[i], p), B[j])
          && enclosesNot(encloseBasis2(B[j], p), B[i])
          && enclosesWeakAll(encloseBasis3(B[i], B[j], p), B)) {
        return [B[i], B[j], p];
      }
    }
  }

  // If we get here then something is very wrong.
  throw new Error;
}

function enclosesNot(a, b) {
  var dr = a.r - b.r, dx = b.x - a.x, dy = b.y - a.y;
  return dr < 0 || dr * dr < dx * dx + dy * dy;
}

function enclosesWeak(a, b) {
  var dr = a.r - b.r + Math.max(a.r, b.r, 1) * 1e-9, dx = b.x - a.x, dy = b.y - a.y;
  return dr > 0 && dr * dr > dx * dx + dy * dy;
}

function enclosesWeakAll(a, B) {
  for (var i = 0; i < B.length; ++i) {
    if (!enclosesWeak(a, B[i])) {
      return false;
    }
  }
  return true;
}

function encloseBasis(B) {
  switch (B.length) {
    case 1: return encloseBasis1(B[0]);
    case 2: return encloseBasis2(B[0], B[1]);
    case 3: return encloseBasis3(B[0], B[1], B[2]);
  }
}

function encloseBasis1(a) {
  return {
    x: a.x,
    y: a.y,
    r: a.r
  };
}

function encloseBasis2(a, b) {
  var x1 = a.x, y1 = a.y, r1 = a.r,
      x2 = b.x, y2 = b.y, r2 = b.r,
      x21 = x2 - x1, y21 = y2 - y1, r21 = r2 - r1,
      l = Math.sqrt(x21 * x21 + y21 * y21);
  return {
    x: (x1 + x2 + x21 / l * r21) / 2,
    y: (y1 + y2 + y21 / l * r21) / 2,
    r: (l + r1 + r2) / 2
  };
}

function encloseBasis3(a, b, c) {
  var x1 = a.x, y1 = a.y, r1 = a.r,
      x2 = b.x, y2 = b.y, r2 = b.r,
      x3 = c.x, y3 = c.y, r3 = c.r,
      a2 = x1 - x2,
      a3 = x1 - x3,
      b2 = y1 - y2,
      b3 = y1 - y3,
      c2 = r2 - r1,
      c3 = r3 - r1,
      d1 = x1 * x1 + y1 * y1 - r1 * r1,
      d2 = d1 - x2 * x2 - y2 * y2 + r2 * r2,
      d3 = d1 - x3 * x3 - y3 * y3 + r3 * r3,
      ab = a3 * b2 - a2 * b3,
      xa = (b2 * d3 - b3 * d2) / (ab * 2) - x1,
      xb = (b3 * c2 - b2 * c3) / ab,
      ya = (a3 * d2 - a2 * d3) / (ab * 2) - y1,
      yb = (a2 * c3 - a3 * c2) / ab,
      A = xb * xb + yb * yb - 1,
      B = 2 * (r1 + xa * xb + ya * yb),
      C = xa * xa + ya * ya - r1 * r1,
      r = -(Math.abs(A) > 1e-6 ? (B + Math.sqrt(B * B - 4 * A * C)) / (2 * A) : C / B);
  return {
    x: x1 + xa + xb * r,
    y: y1 + ya + yb * r,
    r: r
  };
}

;// ./node_modules/d3-hierarchy/src/pack/siblings.js




function place(b, a, c) {
  var dx = b.x - a.x, x, a2,
      dy = b.y - a.y, y, b2,
      d2 = dx * dx + dy * dy;
  if (d2) {
    a2 = a.r + c.r, a2 *= a2;
    b2 = b.r + c.r, b2 *= b2;
    if (a2 > b2) {
      x = (d2 + b2 - a2) / (2 * d2);
      y = Math.sqrt(Math.max(0, b2 / d2 - x * x));
      c.x = b.x - x * dx - y * dy;
      c.y = b.y - x * dy + y * dx;
    } else {
      x = (d2 + a2 - b2) / (2 * d2);
      y = Math.sqrt(Math.max(0, a2 / d2 - x * x));
      c.x = a.x + x * dx - y * dy;
      c.y = a.y + x * dy + y * dx;
    }
  } else {
    c.x = a.x + c.r;
    c.y = a.y;
  }
}

function intersects(a, b) {
  var dr = a.r + b.r - 1e-6, dx = b.x - a.x, dy = b.y - a.y;
  return dr > 0 && dr * dr > dx * dx + dy * dy;
}

function score(node) {
  var a = node._,
      b = node.next._,
      ab = a.r + b.r,
      dx = (a.x * b.r + b.x * a.r) / ab,
      dy = (a.y * b.r + b.y * a.r) / ab;
  return dx * dx + dy * dy;
}

function siblings_Node(circle) {
  this._ = circle;
  this.next = null;
  this.previous = null;
}

function siblings_packSiblingsRandom(circles, random) {
  if (!(n = (circles = array(circles)).length)) return 0;

  var a, b, c, n, aa, ca, i, j, k, sj, sk;

  // Place the first circle.
  a = circles[0], a.x = 0, a.y = 0;
  if (!(n > 1)) return a.r;

  // Place the second circle.
  b = circles[1], a.x = -b.r, b.x = a.r, b.y = 0;
  if (!(n > 2)) return a.r + b.r;

  // Place the third circle.
  place(b, a, c = circles[2]);

  // Initialize the front-chain using the first three circles a, b and c.
  a = new siblings_Node(a), b = new siblings_Node(b), c = new siblings_Node(c);
  a.next = c.previous = b;
  b.next = a.previous = c;
  c.next = b.previous = a;

  // Attempt to place each remaining circle…
  pack: for (i = 3; i < n; ++i) {
    place(a._, b._, c = circles[i]), c = new siblings_Node(c);

    // Find the closest intersecting circle on the front-chain, if any.
    // “Closeness” is determined by linear distance along the front-chain.
    // “Ahead” or “behind” is likewise determined by linear distance.
    j = b.next, k = a.previous, sj = b._.r, sk = a._.r;
    do {
      if (sj <= sk) {
        if (intersects(j._, c._)) {
          b = j, a.next = b, b.previous = a, --i;
          continue pack;
        }
        sj += j._.r, j = j.next;
      } else {
        if (intersects(k._, c._)) {
          a = k, a.next = b, b.previous = a, --i;
          continue pack;
        }
        sk += k._.r, k = k.previous;
      }
    } while (j !== k.next);

    // Success! Insert the new circle c between a and b.
    c.previous = a, c.next = b, a.next = b.previous = b = c;

    // Compute the new closest circle pair to the centroid.
    aa = score(a);
    while ((c = c.next) !== b) {
      if ((ca = score(c)) < aa) {
        a = c, aa = ca;
      }
    }
    b = a.next;
  }

  // Compute the enclosing circle of the front chain.
  a = [b._], c = b; while ((c = c.next) !== b) a.push(c._); c = packEncloseRandom(a, random);

  // Translate the circles to put the enclosing circle around the origin.
  for (i = 0; i < n; ++i) a = circles[i], a.x -= c.x, a.y -= c.y;

  return c.r;
}

/* harmony default export */ function siblings(circles) {
  siblings_packSiblingsRandom(circles, lcg());
  return circles;
}

;// ./node_modules/d3-hierarchy/src/pack/index.js





function defaultRadius(d) {
  return Math.sqrt(d.value);
}

/* harmony default export */ function pack() {
  var radius = null,
      dx = 1,
      dy = 1,
      padding = constantZero;

  function pack(root) {
    const random = lcg();
    root.x = dx / 2, root.y = dy / 2;
    if (radius) {
      root.eachBefore(radiusLeaf(radius))
          .eachAfter(packChildrenRandom(padding, 0.5, random))
          .eachBefore(translateChild(1));
    } else {
      root.eachBefore(radiusLeaf(defaultRadius))
          .eachAfter(packChildrenRandom(constantZero, 1, random))
          .eachAfter(packChildrenRandom(padding, root.r / Math.min(dx, dy), random))
          .eachBefore(translateChild(Math.min(dx, dy) / (2 * root.r)));
    }
    return root;
  }

  pack.radius = function(x) {
    return arguments.length ? (radius = optional(x), pack) : radius;
  };

  pack.size = function(x) {
    return arguments.length ? (dx = +x[0], dy = +x[1], pack) : [dx, dy];
  };

  pack.padding = function(x) {
    return arguments.length ? (padding = typeof x === "function" ? x : constant(+x), pack) : padding;
  };

  return pack;
}

function radiusLeaf(radius) {
  return function(node) {
    if (!node.children) {
      node.r = Math.max(0, +radius(node) || 0);
    }
  };
}

function packChildrenRandom(padding, k, random) {
  return function(node) {
    if (children = node.children) {
      var children,
          i,
          n = children.length,
          r = padding(node) * k || 0,
          e;

      if (r) for (i = 0; i < n; ++i) children[i].r += r;
      e = packSiblingsRandom(children, random);
      if (r) for (i = 0; i < n; ++i) children[i].r -= r;
      node.r = e + r;
    }
  };
}

function translateChild(k) {
  return function(node) {
    var parent = node.parent;
    node.r *= k;
    if (parent) {
      node.x = parent.x + k * node.x;
      node.y = parent.y + k * node.y;
    }
  };
}

;// ./node_modules/d3-hierarchy/src/treemap/round.js
/* harmony default export */ function round(node) {
  node.x0 = Math.round(node.x0);
  node.y0 = Math.round(node.y0);
  node.x1 = Math.round(node.x1);
  node.y1 = Math.round(node.y1);
}

;// ./node_modules/d3-hierarchy/src/treemap/dice.js
/* harmony default export */ function treemap_dice(parent, x0, y0, x1, y1) {
  var nodes = parent.children,
      node,
      i = -1,
      n = nodes.length,
      k = parent.value && (x1 - x0) / parent.value;

  while (++i < n) {
    node = nodes[i], node.y0 = y0, node.y1 = y1;
    node.x0 = x0, node.x1 = x0 += node.value * k;
  }
}

;// ./node_modules/d3-hierarchy/src/partition.js



/* harmony default export */ function partition() {
  var dx = 1,
      dy = 1,
      padding = 0,
      round = false;

  function partition(root) {
    var n = root.height + 1;
    root.x0 =
    root.y0 = padding;
    root.x1 = dx;
    root.y1 = dy / n;
    root.eachBefore(positionNode(dy, n));
    if (round) root.eachBefore(roundNode);
    return root;
  }

  function positionNode(dy, n) {
    return function(node) {
      if (node.children) {
        treemapDice(node, node.x0, dy * (node.depth + 1) / n, node.x1, dy * (node.depth + 2) / n);
      }
      var x0 = node.x0,
          y0 = node.y0,
          x1 = node.x1 - padding,
          y1 = node.y1 - padding;
      if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
      if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
      node.x0 = x0;
      node.y0 = y0;
      node.x1 = x1;
      node.y1 = y1;
    };
  }

  partition.round = function(x) {
    return arguments.length ? (round = !!x, partition) : round;
  };

  partition.size = function(x) {
    return arguments.length ? (dx = +x[0], dy = +x[1], partition) : [dx, dy];
  };

  partition.padding = function(x) {
    return arguments.length ? (padding = +x, partition) : padding;
  };

  return partition;
}

;// ./node_modules/d3-hierarchy/src/stratify.js



var preroot = {depth: -1},
    ambiguous = {},
    imputed = {};

function defaultId(d) {
  return d.id;
}

function defaultParentId(d) {
  return d.parentId;
}

/* harmony default export */ function stratify() {
  var id = defaultId,
      parentId = defaultParentId,
      path;

  function stratify(data) {
    var nodes = Array.from(data),
        currentId = id,
        currentParentId = parentId,
        n,
        d,
        i,
        root,
        parent,
        node,
        nodeId,
        nodeKey,
        nodeByKey = new Map;

    if (path != null) {
      const I = nodes.map((d, i) => normalize(path(d, i, data)));
      const P = I.map(parentof);
      const S = new Set(I).add("");
      for (const i of P) {
        if (!S.has(i)) {
          S.add(i);
          I.push(i);
          P.push(parentof(i));
          nodes.push(imputed);
        }
      }
      currentId = (_, i) => I[i];
      currentParentId = (_, i) => P[i];
    }

    for (i = 0, n = nodes.length; i < n; ++i) {
      d = nodes[i], node = nodes[i] = new Node(d);
      if ((nodeId = currentId(d, i, data)) != null && (nodeId += "")) {
        nodeKey = node.id = nodeId;
        nodeByKey.set(nodeKey, nodeByKey.has(nodeKey) ? ambiguous : node);
      }
      if ((nodeId = currentParentId(d, i, data)) != null && (nodeId += "")) {
        node.parent = nodeId;
      }
    }

    for (i = 0; i < n; ++i) {
      node = nodes[i];
      if (nodeId = node.parent) {
        parent = nodeByKey.get(nodeId);
        if (!parent) throw new Error("missing: " + nodeId);
        if (parent === ambiguous) throw new Error("ambiguous: " + nodeId);
        if (parent.children) parent.children.push(node);
        else parent.children = [node];
        node.parent = parent;
      } else {
        if (root) throw new Error("multiple roots");
        root = node;
      }
    }

    if (!root) throw new Error("no root");

    // When imputing internal nodes, only introduce roots if needed.
    // Then replace the imputed marker data with null.
    if (path != null) {
      while (root.data === imputed && root.children.length === 1) {
        root = root.children[0], --n;
      }
      for (let i = nodes.length - 1; i >= 0; --i) {
        node = nodes[i];
        if (node.data !== imputed) break;
        node.data = null;
      }
    }

    root.parent = preroot;
    root.eachBefore(function(node) { node.depth = node.parent.depth + 1; --n; }).eachBefore(computeHeight);
    root.parent = null;
    if (n > 0) throw new Error("cycle");

    return root;
  }

  stratify.id = function(x) {
    return arguments.length ? (id = optional(x), stratify) : id;
  };

  stratify.parentId = function(x) {
    return arguments.length ? (parentId = optional(x), stratify) : parentId;
  };

  stratify.path = function(x) {
    return arguments.length ? (path = optional(x), stratify) : path;
  };

  return stratify;
}

// To normalize a path, we coerce to a string, strip the trailing slash if any
// (as long as the trailing slash is not immediately preceded by another slash),
// and add leading slash if missing.
function normalize(path) {
  path = `${path}`;
  let i = path.length;
  if (slash(path, i - 1) && !slash(path, i - 2)) path = path.slice(0, -1);
  return path[0] === "/" ? path : `/${path}`;
}

// Walk backwards to find the first slash that is not the leading slash, e.g.:
// "/foo/bar" ⇥ "/foo", "/foo" ⇥ "/", "/" ↦ "". (The root is special-cased
// because the id of the root must be a truthy value.)
function parentof(path) {
  let i = path.length;
  if (i < 2) return "";
  while (--i > 1) if (slash(path, i)) break;
  return path.slice(0, i);
}

// Slashes can be escaped; to determine whether a slash is a path delimiter, we
// count the number of preceding backslashes escaping the forward slash: an odd
// number indicates an escaped forward slash.
function slash(path, i) {
  if (path[i] === "/") {
    let k = 0;
    while (i > 0 && path[--i] === "\\") ++k;
    if ((k & 1) === 0) return true;
  }
  return false;
}

;// ./node_modules/d3-hierarchy/src/tree.js


function tree_defaultSeparation(a, b) {
  return a.parent === b.parent ? 1 : 2;
}

// function radialSeparation(a, b) {
//   return (a.parent === b.parent ? 1 : 2) / a.depth;
// }

// This function is used to traverse the left contour of a subtree (or
// subforest). It returns the successor of v on this contour. This successor is
// either given by the leftmost child of v or by the thread of v. The function
// returns null if and only if v is on the highest level of its subtree.
function nextLeft(v) {
  var children = v.children;
  return children ? children[0] : v.t;
}

// This function works analogously to nextLeft.
function nextRight(v) {
  var children = v.children;
  return children ? children[children.length - 1] : v.t;
}

// Shifts the current subtree rooted at w+. This is done by increasing
// prelim(w+) and mod(w+) by shift.
function moveSubtree(wm, wp, shift) {
  var change = shift / (wp.i - wm.i);
  wp.c -= change;
  wp.s += shift;
  wm.c += change;
  wp.z += shift;
  wp.m += shift;
}

// All other shifts, applied to the smaller subtrees between w- and w+, are
// performed by this function. To prepare the shifts, we have to adjust
// change(w+), shift(w+), and change(w-).
function executeShifts(v) {
  var shift = 0,
      change = 0,
      children = v.children,
      i = children.length,
      w;
  while (--i >= 0) {
    w = children[i];
    w.z += shift;
    w.m += shift;
    shift += w.s + (change += w.c);
  }
}

// If vi-’s ancestor is a sibling of v, returns vi-’s ancestor. Otherwise,
// returns the specified (default) ancestor.
function nextAncestor(vim, v, ancestor) {
  return vim.a.parent === v.parent ? vim.a : ancestor;
}

function TreeNode(node, i) {
  this._ = node;
  this.parent = null;
  this.children = null;
  this.A = null; // default ancestor
  this.a = this; // ancestor
  this.z = 0; // prelim
  this.m = 0; // mod
  this.c = 0; // change
  this.s = 0; // shift
  this.t = null; // thread
  this.i = i; // number
}

TreeNode.prototype = Object.create(hierarchy_Node.prototype);

function treeRoot(root) {
  var tree = new TreeNode(root, 0),
      node,
      nodes = [tree],
      child,
      children,
      i,
      n;

  while (node = nodes.pop()) {
    if (children = node._.children) {
      node.children = new Array(n = children.length);
      for (i = n - 1; i >= 0; --i) {
        nodes.push(child = node.children[i] = new TreeNode(children[i], i));
        child.parent = node;
      }
    }
  }

  (tree.parent = new TreeNode(null, 0)).children = [tree];
  return tree;
}

// Node-link tree diagram using the Reingold-Tilford "tidy" algorithm
/* harmony default export */ function tree() {
  var separation = tree_defaultSeparation,
      dx = 1,
      dy = 1,
      nodeSize = null;

  function tree(root) {
    var t = treeRoot(root);

    // Compute the layout using Buchheim et al.’s algorithm.
    t.eachAfter(firstWalk), t.parent.m = -t.z;
    t.eachBefore(secondWalk);

    // If a fixed node size is specified, scale x and y.
    if (nodeSize) root.eachBefore(sizeNode);

    // If a fixed tree size is specified, scale x and y based on the extent.
    // Compute the left-most, right-most, and depth-most nodes for extents.
    else {
      var left = root,
          right = root,
          bottom = root;
      root.eachBefore(function(node) {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
        if (node.depth > bottom.depth) bottom = node;
      });
      var s = left === right ? 1 : separation(left, right) / 2,
          tx = s - left.x,
          kx = dx / (right.x + s + tx),
          ky = dy / (bottom.depth || 1);
      root.eachBefore(function(node) {
        node.x = (node.x + tx) * kx;
        node.y = node.depth * ky;
      });
    }

    return root;
  }

  // Computes a preliminary x-coordinate for v. Before that, FIRST WALK is
  // applied recursively to the children of v, as well as the function
  // APPORTION. After spacing out the children by calling EXECUTE SHIFTS, the
  // node v is placed to the midpoint of its outermost children.
  function firstWalk(v) {
    var children = v.children,
        siblings = v.parent.children,
        w = v.i ? siblings[v.i - 1] : null;
    if (children) {
      executeShifts(v);
      var midpoint = (children[0].z + children[children.length - 1].z) / 2;
      if (w) {
        v.z = w.z + separation(v._, w._);
        v.m = v.z - midpoint;
      } else {
        v.z = midpoint;
      }
    } else if (w) {
      v.z = w.z + separation(v._, w._);
    }
    v.parent.A = apportion(v, w, v.parent.A || siblings[0]);
  }

  // Computes all real x-coordinates by summing up the modifiers recursively.
  function secondWalk(v) {
    v._.x = v.z + v.parent.m;
    v.m += v.parent.m;
  }

  // The core of the algorithm. Here, a new subtree is combined with the
  // previous subtrees. Threads are used to traverse the inside and outside
  // contours of the left and right subtree up to the highest common level. The
  // vertices used for the traversals are vi+, vi-, vo-, and vo+, where the
  // superscript o means outside and i means inside, the subscript - means left
  // subtree and + means right subtree. For summing up the modifiers along the
  // contour, we use respective variables si+, si-, so-, and so+. Whenever two
  // nodes of the inside contours conflict, we compute the left one of the
  // greatest uncommon ancestors using the function ANCESTOR and call MOVE
  // SUBTREE to shift the subtree and prepare the shifts of smaller subtrees.
  // Finally, we add a new thread (if necessary).
  function apportion(v, w, ancestor) {
    if (w) {
      var vip = v,
          vop = v,
          vim = w,
          vom = vip.parent.children[0],
          sip = vip.m,
          sop = vop.m,
          sim = vim.m,
          som = vom.m,
          shift;
      while (vim = nextRight(vim), vip = nextLeft(vip), vim && vip) {
        vom = nextLeft(vom);
        vop = nextRight(vop);
        vop.a = v;
        shift = vim.z + sim - vip.z - sip + separation(vim._, vip._);
        if (shift > 0) {
          moveSubtree(nextAncestor(vim, v, ancestor), v, shift);
          sip += shift;
          sop += shift;
        }
        sim += vim.m;
        sip += vip.m;
        som += vom.m;
        sop += vop.m;
      }
      if (vim && !nextRight(vop)) {
        vop.t = vim;
        vop.m += sim - sop;
      }
      if (vip && !nextLeft(vom)) {
        vom.t = vip;
        vom.m += sip - som;
        ancestor = v;
      }
    }
    return ancestor;
  }

  function sizeNode(node) {
    node.x *= dx;
    node.y = node.depth * dy;
  }

  tree.separation = function(x) {
    return arguments.length ? (separation = x, tree) : separation;
  };

  tree.size = function(x) {
    return arguments.length ? (nodeSize = false, dx = +x[0], dy = +x[1], tree) : (nodeSize ? null : [dx, dy]);
  };

  tree.nodeSize = function(x) {
    return arguments.length ? (nodeSize = true, dx = +x[0], dy = +x[1], tree) : (nodeSize ? [dx, dy] : null);
  };

  return tree;
}

;// ./node_modules/d3-hierarchy/src/treemap/slice.js
/* harmony default export */ function treemap_slice(parent, x0, y0, x1, y1) {
  var nodes = parent.children,
      node,
      i = -1,
      n = nodes.length,
      k = parent.value && (y1 - y0) / parent.value;

  while (++i < n) {
    node = nodes[i], node.x0 = x0, node.x1 = x1;
    node.y0 = y0, node.y1 = y0 += node.value * k;
  }
}

;// ./node_modules/d3-hierarchy/src/treemap/squarify.js



var phi = (1 + Math.sqrt(5)) / 2;

function squarifyRatio(ratio, parent, x0, y0, x1, y1) {
  var rows = [],
      nodes = parent.children,
      row,
      nodeValue,
      i0 = 0,
      i1 = 0,
      n = nodes.length,
      dx, dy,
      value = parent.value,
      sumValue,
      minValue,
      maxValue,
      newRatio,
      minRatio,
      alpha,
      beta;

  while (i0 < n) {
    dx = x1 - x0, dy = y1 - y0;

    // Find the next non-empty node.
    do sumValue = nodes[i1++].value; while (!sumValue && i1 < n);
    minValue = maxValue = sumValue;
    alpha = Math.max(dy / dx, dx / dy) / (value * ratio);
    beta = sumValue * sumValue * alpha;
    minRatio = Math.max(maxValue / beta, beta / minValue);

    // Keep adding nodes while the aspect ratio maintains or improves.
    for (; i1 < n; ++i1) {
      sumValue += nodeValue = nodes[i1].value;
      if (nodeValue < minValue) minValue = nodeValue;
      if (nodeValue > maxValue) maxValue = nodeValue;
      beta = sumValue * sumValue * alpha;
      newRatio = Math.max(maxValue / beta, beta / minValue);
      if (newRatio > minRatio) { sumValue -= nodeValue; break; }
      minRatio = newRatio;
    }

    // Position and record the row orientation.
    rows.push(row = {value: sumValue, dice: dx < dy, children: nodes.slice(i0, i1)});
    if (row.dice) treemap_dice(row, x0, y0, x1, value ? y0 += dy * sumValue / value : y1);
    else treemap_slice(row, x0, y0, value ? x0 += dx * sumValue / value : x1, y1);
    value -= sumValue, i0 = i1;
  }

  return rows;
}

/* harmony default export */ const treemap_squarify = ((function custom(ratio) {

  function squarify(parent, x0, y0, x1, y1) {
    squarifyRatio(ratio, parent, x0, y0, x1, y1);
  }

  squarify.ratio = function(x) {
    return custom((x = +x) > 1 ? x : 1);
  };

  return squarify;
})(phi));

;// ./node_modules/d3-hierarchy/src/treemap/index.js





/* harmony default export */ function treemap() {
  var tile = squarify,
      round = false,
      dx = 1,
      dy = 1,
      paddingStack = [0],
      paddingInner = constantZero,
      paddingTop = constantZero,
      paddingRight = constantZero,
      paddingBottom = constantZero,
      paddingLeft = constantZero;

  function treemap(root) {
    root.x0 =
    root.y0 = 0;
    root.x1 = dx;
    root.y1 = dy;
    root.eachBefore(positionNode);
    paddingStack = [0];
    if (round) root.eachBefore(roundNode);
    return root;
  }

  function positionNode(node) {
    var p = paddingStack[node.depth],
        x0 = node.x0 + p,
        y0 = node.y0 + p,
        x1 = node.x1 - p,
        y1 = node.y1 - p;
    if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
    if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
    node.x0 = x0;
    node.y0 = y0;
    node.x1 = x1;
    node.y1 = y1;
    if (node.children) {
      p = paddingStack[node.depth + 1] = paddingInner(node) / 2;
      x0 += paddingLeft(node) - p;
      y0 += paddingTop(node) - p;
      x1 -= paddingRight(node) - p;
      y1 -= paddingBottom(node) - p;
      if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
      if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
      tile(node, x0, y0, x1, y1);
    }
  }

  treemap.round = function(x) {
    return arguments.length ? (round = !!x, treemap) : round;
  };

  treemap.size = function(x) {
    return arguments.length ? (dx = +x[0], dy = +x[1], treemap) : [dx, dy];
  };

  treemap.tile = function(x) {
    return arguments.length ? (tile = required(x), treemap) : tile;
  };

  treemap.padding = function(x) {
    return arguments.length ? treemap.paddingInner(x).paddingOuter(x) : treemap.paddingInner();
  };

  treemap.paddingInner = function(x) {
    return arguments.length ? (paddingInner = typeof x === "function" ? x : constant(+x), treemap) : paddingInner;
  };

  treemap.paddingOuter = function(x) {
    return arguments.length ? treemap.paddingTop(x).paddingRight(x).paddingBottom(x).paddingLeft(x) : treemap.paddingTop();
  };

  treemap.paddingTop = function(x) {
    return arguments.length ? (paddingTop = typeof x === "function" ? x : constant(+x), treemap) : paddingTop;
  };

  treemap.paddingRight = function(x) {
    return arguments.length ? (paddingRight = typeof x === "function" ? x : constant(+x), treemap) : paddingRight;
  };

  treemap.paddingBottom = function(x) {
    return arguments.length ? (paddingBottom = typeof x === "function" ? x : constant(+x), treemap) : paddingBottom;
  };

  treemap.paddingLeft = function(x) {
    return arguments.length ? (paddingLeft = typeof x === "function" ? x : constant(+x), treemap) : paddingLeft;
  };

  return treemap;
}

;// ./node_modules/d3-hierarchy/src/treemap/binary.js
/* harmony default export */ function binary(parent, x0, y0, x1, y1) {
  var nodes = parent.children,
      i, n = nodes.length,
      sum, sums = new Array(n + 1);

  for (sums[0] = sum = i = 0; i < n; ++i) {
    sums[i + 1] = sum += nodes[i].value;
  }

  partition(0, n, parent.value, x0, y0, x1, y1);

  function partition(i, j, value, x0, y0, x1, y1) {
    if (i >= j - 1) {
      var node = nodes[i];
      node.x0 = x0, node.y0 = y0;
      node.x1 = x1, node.y1 = y1;
      return;
    }

    var valueOffset = sums[i],
        valueTarget = (value / 2) + valueOffset,
        k = i + 1,
        hi = j - 1;

    while (k < hi) {
      var mid = k + hi >>> 1;
      if (sums[mid] < valueTarget) k = mid + 1;
      else hi = mid;
    }

    if ((valueTarget - sums[k - 1]) < (sums[k] - valueTarget) && i + 1 < k) --k;

    var valueLeft = sums[k] - valueOffset,
        valueRight = value - valueLeft;

    if ((x1 - x0) > (y1 - y0)) {
      var xk = value ? (x0 * valueRight + x1 * valueLeft) / value : x1;
      partition(i, k, valueLeft, x0, y0, xk, y1);
      partition(k, j, valueRight, xk, y0, x1, y1);
    } else {
      var yk = value ? (y0 * valueRight + y1 * valueLeft) / value : y1;
      partition(i, k, valueLeft, x0, y0, x1, yk);
      partition(k, j, valueRight, x0, yk, x1, y1);
    }
  }
}

;// ./node_modules/d3-hierarchy/src/treemap/sliceDice.js



/* harmony default export */ function sliceDice(parent, x0, y0, x1, y1) {
  (parent.depth & 1 ? slice : dice)(parent, x0, y0, x1, y1);
}

;// ./node_modules/d3-hierarchy/src/treemap/resquarify.js




/* harmony default export */ const resquarify = ((function custom(ratio) {

  function resquarify(parent, x0, y0, x1, y1) {
    if ((rows = parent._squarify) && (rows.ratio === ratio)) {
      var rows,
          row,
          nodes,
          i,
          j = -1,
          n,
          m = rows.length,
          value = parent.value;

      while (++j < m) {
        row = rows[j], nodes = row.children;
        for (i = row.value = 0, n = nodes.length; i < n; ++i) row.value += nodes[i].value;
        if (row.dice) treemap_dice(row, x0, y0, x1, value ? y0 += (y1 - y0) * row.value / value : y1);
        else treemap_slice(row, x0, y0, value ? x0 += (x1 - x0) * row.value / value : x1, y1);
        value -= row.value;
      }
    } else {
      parent._squarify = rows = squarifyRatio(ratio, parent, x0, y0, x1, y1);
      rows.ratio = ratio;
    }
  }

  resquarify.ratio = function(x) {
    return custom((x = +x) > 1 ? x : 1);
  };

  return resquarify;
})(phi));

;// ./node_modules/d3-hierarchy/src/index.js

















/***/ }),

/***/ 79498:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  wA: () => (/* reexport */ Path)
});

// UNUSED EXPORTS: path, pathRound

;// ./node_modules/d3-path/src/path.js
const pi = Math.PI,
    tau = 2 * pi,
    epsilon = 1e-6,
    tauEpsilon = tau - epsilon;

function append(strings) {
  this._ += strings[0];
  for (let i = 1, n = strings.length; i < n; ++i) {
    this._ += arguments[i] + strings[i];
  }
}

function appendRound(digits) {
  let d = Math.floor(digits);
  if (!(d >= 0)) throw new Error(`invalid digits: ${digits}`);
  if (d > 15) return append;
  const k = 10 ** d;
  return function(strings) {
    this._ += strings[0];
    for (let i = 1, n = strings.length; i < n; ++i) {
      this._ += Math.round(arguments[i] * k) / k + strings[i];
    }
  };
}

class Path {
  constructor(digits) {
    this._x0 = this._y0 = // start of current subpath
    this._x1 = this._y1 = null; // end of current subpath
    this._ = "";
    this._append = digits == null ? append : appendRound(digits);
  }
  moveTo(x, y) {
    this._append`M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}`;
  }
  closePath() {
    if (this._x1 !== null) {
      this._x1 = this._x0, this._y1 = this._y0;
      this._append`Z`;
    }
  }
  lineTo(x, y) {
    this._append`L${this._x1 = +x},${this._y1 = +y}`;
  }
  quadraticCurveTo(x1, y1, x, y) {
    this._append`Q${+x1},${+y1},${this._x1 = +x},${this._y1 = +y}`;
  }
  bezierCurveTo(x1, y1, x2, y2, x, y) {
    this._append`C${+x1},${+y1},${+x2},${+y2},${this._x1 = +x},${this._y1 = +y}`;
  }
  arcTo(x1, y1, x2, y2, r) {
    x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;

    // Is the radius negative? Error.
    if (r < 0) throw new Error(`negative radius: ${r}`);

    let x0 = this._x1,
        y0 = this._y1,
        x21 = x2 - x1,
        y21 = y2 - y1,
        x01 = x0 - x1,
        y01 = y0 - y1,
        l01_2 = x01 * x01 + y01 * y01;

    // Is this path empty? Move to (x1,y1).
    if (this._x1 === null) {
      this._append`M${this._x1 = x1},${this._y1 = y1}`;
    }

    // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
    else if (!(l01_2 > epsilon));

    // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
    // Equivalently, is (x1,y1) coincident with (x2,y2)?
    // Or, is the radius zero? Line to (x1,y1).
    else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
      this._append`L${this._x1 = x1},${this._y1 = y1}`;
    }

    // Otherwise, draw an arc!
    else {
      let x20 = x2 - x0,
          y20 = y2 - y0,
          l21_2 = x21 * x21 + y21 * y21,
          l20_2 = x20 * x20 + y20 * y20,
          l21 = Math.sqrt(l21_2),
          l01 = Math.sqrt(l01_2),
          l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
          t01 = l / l01,
          t21 = l / l21;

      // If the start tangent is not coincident with (x0,y0), line to.
      if (Math.abs(t01 - 1) > epsilon) {
        this._append`L${x1 + t01 * x01},${y1 + t01 * y01}`;
      }

      this._append`A${r},${r},0,0,${+(y01 * x20 > x01 * y20)},${this._x1 = x1 + t21 * x21},${this._y1 = y1 + t21 * y21}`;
    }
  }
  arc(x, y, r, a0, a1, ccw) {
    x = +x, y = +y, r = +r, ccw = !!ccw;

    // Is the radius negative? Error.
    if (r < 0) throw new Error(`negative radius: ${r}`);

    let dx = r * Math.cos(a0),
        dy = r * Math.sin(a0),
        x0 = x + dx,
        y0 = y + dy,
        cw = 1 ^ ccw,
        da = ccw ? a0 - a1 : a1 - a0;

    // Is this path empty? Move to (x0,y0).
    if (this._x1 === null) {
      this._append`M${x0},${y0}`;
    }

    // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
    else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) {
      this._append`L${x0},${y0}`;
    }

    // Is this arc empty? We’re done.
    if (!r) return;

    // Does the angle go the wrong way? Flip the direction.
    if (da < 0) da = da % tau + tau;

    // Is this a complete circle? Draw two arcs to complete the circle.
    if (da > tauEpsilon) {
      this._append`A${r},${r},0,1,${cw},${x - dx},${y - dy}A${r},${r},0,1,${cw},${this._x1 = x0},${this._y1 = y0}`;
    }

    // Is this arc non-empty? Draw an arc!
    else if (da > epsilon) {
      this._append`A${r},${r},0,${+(da >= pi)},${cw},${this._x1 = x + r * Math.cos(a1)},${this._y1 = y + r * Math.sin(a1)}`;
    }
  }
  rect(x, y, w, h) {
    this._append`M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}h${w = +w}v${+h}h${-w}Z`;
  }
  toString() {
    return this._;
  }
}

function path() {
  return new Path;
}

// Allow instanceof d3.path
path.prototype = Path.prototype;

function pathRound(digits = 3) {
  return new Path(+digits);
}

;// ./node_modules/d3-path/src/index.js



/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVuZG9yLWNvbW1vbi0yNTQ1ZWRjNi5kMDQyMGVjZWYzMGYwNzVlYjI5My5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw2QkFBZSxtQkFBUztBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbEJpQzs7QUFFakMsNkJBQWUscUJBQVM7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEI7QUFDQTs7O0FDWkEsK0NBQWUsWUFBWSxFQUFDOzs7QUNBUzs7QUFFckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPLFNBQVMsU0FBRztBQUNuQjtBQUNBLGtGQUFrRixRQUFRO0FBQzFGOztBQUVPO0FBQ1A7QUFDQSwwQ0FBMEMsUUFBUTtBQUNsRDtBQUNBOztBQUVlO0FBQ2Y7QUFDQSw0QkFBNEIsUUFBUTtBQUNwQzs7O0FDNUJ5QztBQUNWO0FBQ1k7QUFDRDs7QUFFMUMsMENBQWU7QUFDZixjQUFjLEtBQUs7O0FBRW5CO0FBQ0EsMkJBQTJCLG1CQUFRLG1CQUFtQixtQkFBUTtBQUM5RDtBQUNBO0FBQ0Esa0JBQWtCLE9BQU87QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLENBQUMsSUFBSSxFQUFDOztBQUVOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE9BQU87QUFDdkIsY0FBYyxtQkFBUTtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTyx5QkFBeUIsU0FBSztBQUM5QiwrQkFBK0IsV0FBVzs7O0FDdERqRCw2QkFBZSx5QkFBUztBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE9BQU87QUFDdkI7QUFDQTtBQUNBOztBQUVPLFNBQVMseUJBQWE7QUFDN0I7QUFDQTs7O0FDYitCO0FBQzZCOztBQUU1RCw2QkFBZSxlQUFTO0FBQ3hCO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGNBQWMsUUFBUSxZQUFZLEtBQUs7QUFDdkMsU0FBUyxRQUFROztBQUVqQjtBQUNBLGdCQUFnQixRQUFRO0FBQ3hCO0FBQ0E7QUFDQTs7O0FDckJBLDZCQUFlLGNBQVM7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTEEsNkJBQWUsZ0JBQVM7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7OztBQ0orQjs7QUFFL0IsNkJBQWUsZ0JBQVM7QUFDeEIsWUFBWTtBQUNaLFlBQVk7QUFDWjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhLEtBQUs7QUFDbEIsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0QmlDOztBQUVqQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw2QkFBZSxnQkFBUztBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjOztBQUVkO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDO0FBQ2hDO0FBQ0EsNEJBQTRCO0FBQzVCO0FBQ0E7QUFDQSx5Q0FBeUM7QUFDekMsNEJBQTRCO0FBQzVCO0FBQ0EsTUFBTSxPQUFPO0FBQ2I7QUFDQSxjQUFjLFNBQVMsTUFBTSxTQUFTO0FBQ3RDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEI7QUFDMUI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsT0FBTztBQUNwQztBQUNBLFNBQVM7QUFDVDs7O0FDL0QrQjtBQUNKO0FBQ2E7QUFDWDtBQUNJO0FBQ0E7QUFDQTtBQUNJO0FBQ3VCOztBQUU1RCw2QkFBZSxlQUFTO0FBQ3hCO0FBQ0Esd0NBQXdDLFFBQVE7QUFDaEQsMEJBQTBCLE1BQU07QUFDaEMsK0JBQStCLHFCQUFLLGVBQWUsR0FBRyxJQUFJLE1BQU07QUFDaEUscUJBQXFCLGlCQUFLLEdBQUcsR0FBRztBQUNoQyw0QkFBNEIsSUFBSTtBQUNoQyxRQUFRLHlCQUFhLE1BQU0sZUFBVztBQUN0QywyQkFBMkIsWUFBWTtBQUN2QywwRkFBMEYsTUFBTTtBQUNoRyxRQUFRLE1BQU07QUFDZDs7O0FDckJBLDZCQUFlLGtCQUFTO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0wrQjs7QUFFL0IsNkJBQWUsaUJBQVM7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNSQSw2QkFBZSxlQUFTO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBOzs7QUNKQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDZCQUFlLG1CQUFTO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pCbUQ7O0FBRW5EOztBQUVBO0FBQ087QUFDUDtBQUNBLHdCQUF3QixRQUFRLEdBQUcsU0FBUztBQUM1Qzs7QUFFTztBQUNQLDRCQUE0QixRQUFRO0FBQ3BDO0FBQ0E7QUFDQSxpRUFBaUUsUUFBUTtBQUN6RTtBQUNBLFNBQVMsU0FBUztBQUNsQjs7O0FDakJrQztBQUNZOztBQUU5Qzs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsY0FBYyxhQUFhLE1BQU0sU0FBUyxHQUFHLGFBQWEsTUFBTSxTQUFTO0FBQ3pFLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGlDQUFpQyxnQ0FBZ0M7QUFDakUsY0FBYyxzREFBc0QsTUFBTSxPQUFPO0FBQ2pGLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGNBQWMscURBQXFELE1BQU0sT0FBTztBQUNoRixNQUFNO0FBQ047QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsYUFBYSxNQUFNLFNBQVMsR0FBRyxhQUFhLE1BQU0sU0FBUztBQUN6RSxNQUFNO0FBQ047QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTyxtREFBbUQsUUFBUTtBQUMzRCxtREFBbUQsUUFBUTs7O0FDOURsRTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSwyQ0FBZTs7QUFFZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxDQUFDLG1CQUFtQixFQUFDOzs7QUN0RW9CO0FBQ0g7O0FBRXRDO0FBQ0E7QUFDQSx5QkFBeUIsbUJBQVEsbUJBQW1CLG1CQUFRO0FBQzVELFlBQVksT0FBSztBQUNqQixZQUFZLE9BQUs7QUFDakIsa0JBQWtCLE9BQUs7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDhDQUFlLElBQUksU0FBRyxDQUFDLEVBQUM7QUFDakIsa0JBQWtCLE9BQUs7OztBQ3BCVztBQUNWOztBQUVoQjtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDZnlDO0FBQ0g7O0FBRXRDO0FBQ0E7QUFDQSx5QkFBeUIsbUJBQVEsbUJBQW1CLG1CQUFRO0FBQzVELFlBQVksT0FBSztBQUNqQixZQUFZLE9BQUs7QUFDakIsa0JBQWtCLE9BQUs7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDhDQUFlLElBQUksU0FBRyxDQUFDLEVBQUM7QUFDakIsa0JBQWtCLE9BQUs7OztBQ3BCdUI7QUFDZjs7QUFFdEM7QUFDQTtBQUNBOztBQUVBO0FBQ0EsMkJBQTJCLHlCQUFjLG1CQUFtQix5QkFBYztBQUMxRSxjQUFjLE9BQUs7QUFDbkIsY0FBYyxPQUFLO0FBQ25CLG9CQUFvQixPQUFLO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxHQUFHO0FBQ0g7O0FBRUEsb0RBQWUsVUFBVSxTQUFHLENBQUMsRUFBQztBQUN2Qiw4QkFBOEIsT0FBSzs7O0FDNUJFOztBQUU3QjtBQUNmLGdFQUFnRSxLQUFLO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNWQSw2QkFBZSxrQkFBUztBQUN4QjtBQUNBLGtCQUFrQixPQUFPO0FBQ3pCO0FBQ0E7OztBQ0prRDtBQUNLO0FBQ0E7QUFDWTtBQUNkO0FBQ1E7QUFDVjtBQUNNO0FBQ1U7QUFDVjtBQUNGO0FBQ0U7QUFDNkI7QUFDakM7QUFDNEU7QUFDL0M7QUFDL0I7QUFDK0I7QUFDd0I7QUFDdEQ7QUFDRjs7Ozs7Ozs7Ozs7O0FDcEJsRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw2QkFBZSxtQkFBVztBQUMxQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7OztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDZCQUFlLDJCQUFXO0FBQzFCO0FBQ0E7OztBQ1hBLDZCQUFlLGNBQVM7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNOQSw2QkFBZSxvQkFBUztBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxRQUFRO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDWEEsNkJBQWUsbUJBQVM7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1Q0FBdUMsT0FBTztBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2RBLDZCQUFlLGNBQVM7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ1BBLDZCQUFlLGFBQVM7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOzs7QUNSQSw2QkFBZSxjQUFTO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOzs7QUNOQSw2QkFBZSxjQUFTO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDN0JBLDZCQUFlLHFCQUFXO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTkEsNkJBQWUsdUJBQVc7QUFDMUI7QUFDQTs7O0FDRkEsNkJBQWUsa0JBQVc7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOzs7QUNSQSw2QkFBZSxpQkFBVztBQUMxQjtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCLGtCQUFrQixrQ0FBa0M7QUFDcEQ7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7O0FDUkEsNkJBQWUscUJBQVk7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUNBQXlDLE9BQU87QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7OztBQ2JvQztBQUNGO0FBQ1k7QUFDRjtBQUNWO0FBQ0Y7QUFDRTtBQUNBO0FBQ1U7QUFDSTtBQUNWO0FBQ0Y7QUFDTTs7QUFFM0I7QUFDZjtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQSxpQkFBaUIsY0FBSTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLFFBQVE7QUFDOUIsMkNBQTJDLGNBQUk7QUFDL0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSx5QkFBeUIsdUJBQWE7QUFDdEM7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRU8sU0FBUyx1QkFBYTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTs7QUFFTyxTQUFTLGNBQUk7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxjQUFJO0FBQ0osZUFBZSxjQUFJO0FBQ25CLFNBQVMsZUFBVTtBQUNuQixRQUFRLElBQVM7QUFDakIsYUFBYSxTQUFjO0FBQzNCLGNBQWMsVUFBZTtBQUM3QixRQUFRLElBQVM7QUFDakIsT0FBTyxHQUFRO0FBQ2YsUUFBUSxJQUFTO0FBQ2pCLFFBQVEsSUFBUztBQUNqQixhQUFhLFNBQWM7QUFDM0IsZUFBZSxXQUFnQjtBQUMvQixVQUFVLE1BQVc7QUFDckIsU0FBUyxLQUFVO0FBQ25CO0FBQ0EscUJBQXFCLFFBQWE7QUFDbEM7OztBQzFGTyxTQUFTLGtCQUFRO0FBQ3hCLDRCQUE0QixrQkFBUTtBQUNwQzs7QUFFTyxTQUFTLGtCQUFRO0FBQ3hCO0FBQ0E7QUFDQTs7O0FDUE8sU0FBUyxxQkFBWTtBQUM1QjtBQUNBOztBQUVBLDZCQUFlLHNCQUFTO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBOzs7QUNSQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0I7O0FBRXRCLDZCQUFlLG1CQUFXO0FBQzFCO0FBQ0E7QUFDQTs7O0FDUkEsNkJBQWUsbUJBQVM7QUFDeEI7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjs7QUFFTyxTQUFTLGFBQU87QUFDdkI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7QUNuQm9DO0FBQ1I7O0FBRTVCLDZCQUFlLGlCQUFTO0FBQ3hCLFNBQVMseUJBQWlCO0FBQzFCOztBQUVPLFNBQVMseUJBQWlCO0FBQ2pDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsY0FBYyxjQUFjO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxjQUFjLGtCQUFrQjtBQUNoQyxvQkFBb0IsY0FBYztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGtCQUFrQixjQUFjO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMxSGdDO0FBQ0o7QUFDbUI7O0FBRS9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUyxhQUFJO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7O0FBRU8sU0FBUywyQkFBa0I7QUFDbEM7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsVUFBVSxhQUFJLGFBQWEsYUFBSSxhQUFhLGFBQUk7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0Esb0JBQW9CLE9BQU87QUFDM0IsNkNBQTZDLGFBQUk7O0FBRWpEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTs7QUFFTjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG9CQUFvQix3Q0FBd0M7O0FBRTVEO0FBQ0EsY0FBYyxPQUFPOztBQUVyQjtBQUNBOztBQUVBLDZCQUFlLGtCQUFTO0FBQ3hCLEVBQUUsMkJBQWtCO0FBQ3BCO0FBQ0E7OztBQ3ZIeUM7QUFDYTtBQUMxQjtBQUNxQjs7QUFFakQ7QUFDQTtBQUNBOztBQUVBLDZCQUFlLGdCQUFXO0FBQzFCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSx5QkFBeUIsT0FBTztBQUNoQztBQUNBLHlCQUF5QixPQUFPO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoRkEsNkJBQWUsZUFBUztBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQSw2QkFBZSxzQkFBUztBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ1gyQztBQUNDOztBQUU1Qyw2QkFBZSxxQkFBVztBQUMxQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7OztBQ25Ed0M7QUFDaUI7O0FBRXpELGVBQWUsVUFBVTtBQUN6QixrQkFBa0I7QUFDbEI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSw2QkFBZSxvQkFBVztBQUMxQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtDQUFrQyxPQUFPO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxnQkFBZ0IsT0FBTztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyxRQUFRO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxxQ0FBcUMsb0NBQW9DLE1BQU07QUFDL0U7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLEtBQUs7QUFDakI7QUFDQTtBQUNBLHNDQUFzQyxLQUFLO0FBQzNDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSwyQkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2hKMEM7O0FBRTFDLFNBQVMsc0JBQWlCO0FBQzFCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCLGlCQUFpQjtBQUNqQixjQUFjO0FBQ2QsY0FBYztBQUNkLGNBQWM7QUFDZCxjQUFjO0FBQ2QsaUJBQWlCO0FBQ2pCLGNBQWM7QUFDZDs7QUFFQSxtQ0FBbUMsY0FBSTs7QUFFdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsUUFBUTtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDZCQUFlLGdCQUFXO0FBQzFCLG1CQUFtQixzQkFBaUI7QUFDcEM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7QUM1T0EsNkJBQWUsdUJBQVM7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNYb0M7QUFDRTs7QUFFL0I7O0FBRUE7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EscUNBQXFDO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsdUJBQXVCO0FBQ3hEO0FBQ0E7O0FBRUE7QUFDQSxxQkFBcUIsOERBQThEO0FBQ25GLGtCQUFrQixZQUFXO0FBQzdCLFNBQVMsYUFBWTtBQUNyQjtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsdURBQWU7O0FBRWY7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLENBQUMsTUFBTSxFQUFDOzs7QUNqRTJCO0FBQ0U7QUFDSTtBQUNhOztBQUV0RCw2QkFBZSxtQkFBVztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7QUM3RkEsNkJBQWUsZ0JBQVM7QUFDeEI7QUFDQTtBQUNBOztBQUVBLDhCQUE4QixPQUFPO0FBQ3JDO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDN0M2QjtBQUNFOztBQUUvQiw2QkFBZSxtQkFBUztBQUN4QjtBQUNBOzs7QUNMb0M7QUFDRTtBQUNXOztBQUVqRCxpREFBZTs7QUFFZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esa0RBQWtELE9BQU87QUFDekQsc0JBQXNCLFlBQVc7QUFDakMsYUFBYSxhQUFZO0FBQ3pCO0FBQ0E7QUFDQSxNQUFNO0FBQ04sZ0NBQWdDLGFBQWE7QUFDN0M7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBQzs7O0FDbkN3QztBQUNnQjtBQUNoQjtBQUNXO0FBQ0Y7QUFDTDtBQUNGO0FBQ1I7QUFDWTtBQUNPO0FBQ0o7QUFDRTtBQUNRO0FBQ0Y7QUFDSTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNkckU7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNDQUFzQyxPQUFPO0FBQzdDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esb0RBQW9ELE9BQU87QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0MsT0FBTztBQUMvQztBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQSxnQ0FBZ0M7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IseUJBQXlCLEdBQUcseUJBQXlCO0FBQ3pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsY0FBYyxHQUFHLGNBQWM7QUFDbkQ7QUFDQTtBQUNBLG9CQUFvQixJQUFJLEdBQUcsSUFBSSxHQUFHLGNBQWMsR0FBRyxjQUFjO0FBQ2pFO0FBQ0E7QUFDQSxvQkFBb0IsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLGNBQWMsR0FBRyxjQUFjO0FBQy9FO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1EQUFtRCxFQUFFOztBQUVyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esc0JBQXNCLGNBQWMsR0FBRyxjQUFjO0FBQ3JEOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsY0FBYyxHQUFHLGNBQWM7QUFDckQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esd0JBQXdCLGVBQWUsR0FBRyxlQUFlO0FBQ3pEOztBQUVBLHNCQUFzQixFQUFFLEdBQUcsRUFBRSxPQUFPLHlCQUF5QixHQUFHLDBCQUEwQixHQUFHLDBCQUEwQjtBQUN2SDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1EQUFtRCxFQUFFOztBQUVyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFzQixHQUFHLEdBQUcsR0FBRztBQUMvQjs7QUFFQTtBQUNBO0FBQ0Esc0JBQXNCLEdBQUcsR0FBRyxHQUFHO0FBQy9COztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esc0JBQXNCLEVBQUUsR0FBRyxFQUFFLE9BQU8sR0FBRyxHQUFHLE9BQU8sR0FBRyxPQUFPLEdBQUcsRUFBRSxHQUFHLEVBQUUsT0FBTyxHQUFHLEdBQUcsY0FBYyxHQUFHLGNBQWM7QUFDakg7O0FBRUE7QUFDQTtBQUNBLHNCQUFzQixFQUFFLEdBQUcsRUFBRSxLQUFLLFlBQVksR0FBRyxHQUFHLEdBQUcsZ0NBQWdDLEdBQUcsZ0NBQWdDO0FBQzFIO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQix5QkFBeUIsR0FBRyx5QkFBeUIsR0FBRyxPQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDL0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTs7QUFFTztBQUNQO0FBQ0E7OztBQzNKZ0QiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvYmFzaXMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2Jhc2lzQ2xvc2VkLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9jb25zdGFudC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvY29sb3IuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3JnYi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvbnVtYmVyQXJyYXkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2FycmF5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9kYXRlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9udW1iZXIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL29iamVjdC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvc3RyaW5nLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy92YWx1ZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvZGlzY3JldGUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2h1ZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvcm91bmQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3RyYW5zZm9ybS9kZWNvbXBvc2UuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3RyYW5zZm9ybS9wYXJzZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvdHJhbnNmb3JtL2luZGV4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy96b29tLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9oc2wuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2xhYi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvaGNsLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9jdWJlaGVsaXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3BpZWNld2lzZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvcXVhbnRpemUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2luZGV4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvY2x1c3Rlci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1oaWVyYXJjaHkvc3JjL2hpZXJhcmNoeS9jb3VudC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1oaWVyYXJjaHkvc3JjL2hpZXJhcmNoeS9lYWNoLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvaGllcmFyY2h5L2VhY2hCZWZvcmUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaGllcmFyY2h5L3NyYy9oaWVyYXJjaHkvZWFjaEFmdGVyLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvaGllcmFyY2h5L2ZpbmQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaGllcmFyY2h5L3NyYy9oaWVyYXJjaHkvc3VtLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvaGllcmFyY2h5L3NvcnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaGllcmFyY2h5L3NyYy9oaWVyYXJjaHkvcGF0aC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1oaWVyYXJjaHkvc3JjL2hpZXJhcmNoeS9hbmNlc3RvcnMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaGllcmFyY2h5L3NyYy9oaWVyYXJjaHkvZGVzY2VuZGFudHMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaGllcmFyY2h5L3NyYy9oaWVyYXJjaHkvbGVhdmVzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvaGllcmFyY2h5L2xpbmtzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvaGllcmFyY2h5L2l0ZXJhdG9yLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvaGllcmFyY2h5L2luZGV4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvYWNjZXNzb3JzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvY29uc3RhbnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaGllcmFyY2h5L3NyYy9sY2cuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaGllcmFyY2h5L3NyYy9hcnJheS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1oaWVyYXJjaHkvc3JjL3BhY2svZW5jbG9zZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1oaWVyYXJjaHkvc3JjL3BhY2svc2libGluZ3MuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaGllcmFyY2h5L3NyYy9wYWNrL2luZGV4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvdHJlZW1hcC9yb3VuZC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1oaWVyYXJjaHkvc3JjL3RyZWVtYXAvZGljZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1oaWVyYXJjaHkvc3JjL3BhcnRpdGlvbi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1oaWVyYXJjaHkvc3JjL3N0cmF0aWZ5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvdHJlZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1oaWVyYXJjaHkvc3JjL3RyZWVtYXAvc2xpY2UuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaGllcmFyY2h5L3NyYy90cmVlbWFwL3NxdWFyaWZ5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvdHJlZW1hcC9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1oaWVyYXJjaHkvc3JjL3RyZWVtYXAvYmluYXJ5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvdHJlZW1hcC9zbGljZURpY2UuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaGllcmFyY2h5L3NyYy90cmVlbWFwL3Jlc3F1YXJpZnkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtaGllcmFyY2h5L3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1wYXRoL3NyYy9wYXRoLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXBhdGgvc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBiYXNpcyh0MSwgdjAsIHYxLCB2MiwgdjMpIHtcbiAgdmFyIHQyID0gdDEgKiB0MSwgdDMgPSB0MiAqIHQxO1xuICByZXR1cm4gKCgxIC0gMyAqIHQxICsgMyAqIHQyIC0gdDMpICogdjBcbiAgICAgICsgKDQgLSA2ICogdDIgKyAzICogdDMpICogdjFcbiAgICAgICsgKDEgKyAzICogdDEgKyAzICogdDIgLSAzICogdDMpICogdjJcbiAgICAgICsgdDMgKiB2MykgLyA2O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgdmFyIG4gPSB2YWx1ZXMubGVuZ3RoIC0gMTtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgaSA9IHQgPD0gMCA/ICh0ID0gMCkgOiB0ID49IDEgPyAodCA9IDEsIG4gLSAxKSA6IE1hdGguZmxvb3IodCAqIG4pLFxuICAgICAgICB2MSA9IHZhbHVlc1tpXSxcbiAgICAgICAgdjIgPSB2YWx1ZXNbaSArIDFdLFxuICAgICAgICB2MCA9IGkgPiAwID8gdmFsdWVzW2kgLSAxXSA6IDIgKiB2MSAtIHYyLFxuICAgICAgICB2MyA9IGkgPCBuIC0gMSA/IHZhbHVlc1tpICsgMl0gOiAyICogdjIgLSB2MTtcbiAgICByZXR1cm4gYmFzaXMoKHQgLSBpIC8gbikgKiBuLCB2MCwgdjEsIHYyLCB2Myk7XG4gIH07XG59XG4iLCJpbXBvcnQge2Jhc2lzfSBmcm9tIFwiLi9iYXNpcy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgdmFyIG4gPSB2YWx1ZXMubGVuZ3RoO1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHZhciBpID0gTWF0aC5mbG9vcigoKHQgJT0gMSkgPCAwID8gKyt0IDogdCkgKiBuKSxcbiAgICAgICAgdjAgPSB2YWx1ZXNbKGkgKyBuIC0gMSkgJSBuXSxcbiAgICAgICAgdjEgPSB2YWx1ZXNbaSAlIG5dLFxuICAgICAgICB2MiA9IHZhbHVlc1soaSArIDEpICUgbl0sXG4gICAgICAgIHYzID0gdmFsdWVzWyhpICsgMikgJSBuXTtcbiAgICByZXR1cm4gYmFzaXMoKHQgLSBpIC8gbikgKiBuLCB2MCwgdjEsIHYyLCB2Myk7XG4gIH07XG59XG4iLCJleHBvcnQgZGVmYXVsdCB4ID0+ICgpID0+IHg7XG4iLCJpbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcblxuZnVuY3Rpb24gbGluZWFyKGEsIGQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gYSArIHQgKiBkO1xuICB9O1xufVxuXG5mdW5jdGlvbiBleHBvbmVudGlhbChhLCBiLCB5KSB7XG4gIHJldHVybiBhID0gTWF0aC5wb3coYSwgeSksIGIgPSBNYXRoLnBvdyhiLCB5KSAtIGEsIHkgPSAxIC8geSwgZnVuY3Rpb24odCkge1xuICAgIHJldHVybiBNYXRoLnBvdyhhICsgdCAqIGIsIHkpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHVlKGEsIGIpIHtcbiAgdmFyIGQgPSBiIC0gYTtcbiAgcmV0dXJuIGQgPyBsaW5lYXIoYSwgZCA+IDE4MCB8fCBkIDwgLTE4MCA/IGQgLSAzNjAgKiBNYXRoLnJvdW5kKGQgLyAzNjApIDogZCkgOiBjb25zdGFudChpc05hTihhKSA/IGIgOiBhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdhbW1hKHkpIHtcbiAgcmV0dXJuICh5ID0gK3kpID09PSAxID8gbm9nYW1tYSA6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gYiAtIGEgPyBleHBvbmVudGlhbChhLCBiLCB5KSA6IGNvbnN0YW50KGlzTmFOKGEpID8gYiA6IGEpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBub2dhbW1hKGEsIGIpIHtcbiAgdmFyIGQgPSBiIC0gYTtcbiAgcmV0dXJuIGQgPyBsaW5lYXIoYSwgZCkgOiBjb25zdGFudChpc05hTihhKSA/IGIgOiBhKTtcbn1cbiIsImltcG9ydCB7cmdiIGFzIGNvbG9yUmdifSBmcm9tIFwiZDMtY29sb3JcIjtcbmltcG9ydCBiYXNpcyBmcm9tIFwiLi9iYXNpcy5qc1wiO1xuaW1wb3J0IGJhc2lzQ2xvc2VkIGZyb20gXCIuL2Jhc2lzQ2xvc2VkLmpzXCI7XG5pbXBvcnQgbm9nYW1tYSwge2dhbW1hfSBmcm9tIFwiLi9jb2xvci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gcmdiR2FtbWEoeSkge1xuICB2YXIgY29sb3IgPSBnYW1tYSh5KTtcblxuICBmdW5jdGlvbiByZ2Ioc3RhcnQsIGVuZCkge1xuICAgIHZhciByID0gY29sb3IoKHN0YXJ0ID0gY29sb3JSZ2Ioc3RhcnQpKS5yLCAoZW5kID0gY29sb3JSZ2IoZW5kKSkuciksXG4gICAgICAgIGcgPSBjb2xvcihzdGFydC5nLCBlbmQuZyksXG4gICAgICAgIGIgPSBjb2xvcihzdGFydC5iLCBlbmQuYiksXG4gICAgICAgIG9wYWNpdHkgPSBub2dhbW1hKHN0YXJ0Lm9wYWNpdHksIGVuZC5vcGFjaXR5KTtcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgc3RhcnQuciA9IHIodCk7XG4gICAgICBzdGFydC5nID0gZyh0KTtcbiAgICAgIHN0YXJ0LmIgPSBiKHQpO1xuICAgICAgc3RhcnQub3BhY2l0eSA9IG9wYWNpdHkodCk7XG4gICAgICByZXR1cm4gc3RhcnQgKyBcIlwiO1xuICAgIH07XG4gIH1cblxuICByZ2IuZ2FtbWEgPSByZ2JHYW1tYTtcblxuICByZXR1cm4gcmdiO1xufSkoMSk7XG5cbmZ1bmN0aW9uIHJnYlNwbGluZShzcGxpbmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGNvbG9ycykge1xuICAgIHZhciBuID0gY29sb3JzLmxlbmd0aCxcbiAgICAgICAgciA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgZyA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgYiA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgaSwgY29sb3I7XG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgY29sb3IgPSBjb2xvclJnYihjb2xvcnNbaV0pO1xuICAgICAgcltpXSA9IGNvbG9yLnIgfHwgMDtcbiAgICAgIGdbaV0gPSBjb2xvci5nIHx8IDA7XG4gICAgICBiW2ldID0gY29sb3IuYiB8fCAwO1xuICAgIH1cbiAgICByID0gc3BsaW5lKHIpO1xuICAgIGcgPSBzcGxpbmUoZyk7XG4gICAgYiA9IHNwbGluZShiKTtcbiAgICBjb2xvci5vcGFjaXR5ID0gMTtcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgY29sb3IuciA9IHIodCk7XG4gICAgICBjb2xvci5nID0gZyh0KTtcbiAgICAgIGNvbG9yLmIgPSBiKHQpO1xuICAgICAgcmV0dXJuIGNvbG9yICsgXCJcIjtcbiAgICB9O1xuICB9O1xufVxuXG5leHBvcnQgdmFyIHJnYkJhc2lzID0gcmdiU3BsaW5lKGJhc2lzKTtcbmV4cG9ydCB2YXIgcmdiQmFzaXNDbG9zZWQgPSByZ2JTcGxpbmUoYmFzaXNDbG9zZWQpO1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICBpZiAoIWIpIGIgPSBbXTtcbiAgdmFyIG4gPSBhID8gTWF0aC5taW4oYi5sZW5ndGgsIGEubGVuZ3RoKSA6IDAsXG4gICAgICBjID0gYi5zbGljZSgpLFxuICAgICAgaTtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSBjW2ldID0gYVtpXSAqICgxIC0gdCkgKyBiW2ldICogdDtcbiAgICByZXR1cm4gYztcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTnVtYmVyQXJyYXkoeCkge1xuICByZXR1cm4gQXJyYXlCdWZmZXIuaXNWaWV3KHgpICYmICEoeCBpbnN0YW5jZW9mIERhdGFWaWV3KTtcbn1cbiIsImltcG9ydCB2YWx1ZSBmcm9tIFwiLi92YWx1ZS5qc1wiO1xuaW1wb3J0IG51bWJlckFycmF5LCB7aXNOdW1iZXJBcnJheX0gZnJvbSBcIi4vbnVtYmVyQXJyYXkuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gKGlzTnVtYmVyQXJyYXkoYikgPyBudW1iZXJBcnJheSA6IGdlbmVyaWNBcnJheSkoYSwgYik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmljQXJyYXkoYSwgYikge1xuICB2YXIgbmIgPSBiID8gYi5sZW5ndGggOiAwLFxuICAgICAgbmEgPSBhID8gTWF0aC5taW4obmIsIGEubGVuZ3RoKSA6IDAsXG4gICAgICB4ID0gbmV3IEFycmF5KG5hKSxcbiAgICAgIGMgPSBuZXcgQXJyYXkobmIpLFxuICAgICAgaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgbmE7ICsraSkgeFtpXSA9IHZhbHVlKGFbaV0sIGJbaV0pO1xuICBmb3IgKDsgaSA8IG5iOyArK2kpIGNbaV0gPSBiW2ldO1xuXG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgZm9yIChpID0gMDsgaSA8IG5hOyArK2kpIGNbaV0gPSB4W2ldKHQpO1xuICAgIHJldHVybiBjO1xuICB9O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgZCA9IG5ldyBEYXRlO1xuICByZXR1cm4gYSA9ICthLCBiID0gK2IsIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gZC5zZXRUaW1lKGEgKiAoMSAtIHQpICsgYiAqIHQpLCBkO1xuICB9O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gYSA9ICthLCBiID0gK2IsIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gYSAqICgxIC0gdCkgKyBiICogdDtcbiAgfTtcbn1cbiIsImltcG9ydCB2YWx1ZSBmcm9tIFwiLi92YWx1ZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciBpID0ge30sXG4gICAgICBjID0ge30sXG4gICAgICBrO1xuXG4gIGlmIChhID09PSBudWxsIHx8IHR5cGVvZiBhICE9PSBcIm9iamVjdFwiKSBhID0ge307XG4gIGlmIChiID09PSBudWxsIHx8IHR5cGVvZiBiICE9PSBcIm9iamVjdFwiKSBiID0ge307XG5cbiAgZm9yIChrIGluIGIpIHtcbiAgICBpZiAoayBpbiBhKSB7XG4gICAgICBpW2tdID0gdmFsdWUoYVtrXSwgYltrXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNba10gPSBiW2tdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgZm9yIChrIGluIGkpIGNba10gPSBpW2tdKHQpO1xuICAgIHJldHVybiBjO1xuICB9O1xufVxuIiwiaW1wb3J0IG51bWJlciBmcm9tIFwiLi9udW1iZXIuanNcIjtcblxudmFyIHJlQSA9IC9bLStdPyg/OlxcZCtcXC4/XFxkKnxcXC4/XFxkKykoPzpbZUVdWy0rXT9cXGQrKT8vZyxcbiAgICByZUIgPSBuZXcgUmVnRXhwKHJlQS5zb3VyY2UsIFwiZ1wiKTtcblxuZnVuY3Rpb24gemVybyhiKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gb25lKGIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gYih0KSArIFwiXCI7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIGJpID0gcmVBLmxhc3RJbmRleCA9IHJlQi5sYXN0SW5kZXggPSAwLCAvLyBzY2FuIGluZGV4IGZvciBuZXh0IG51bWJlciBpbiBiXG4gICAgICBhbSwgLy8gY3VycmVudCBtYXRjaCBpbiBhXG4gICAgICBibSwgLy8gY3VycmVudCBtYXRjaCBpbiBiXG4gICAgICBicywgLy8gc3RyaW5nIHByZWNlZGluZyBjdXJyZW50IG51bWJlciBpbiBiLCBpZiBhbnlcbiAgICAgIGkgPSAtMSwgLy8gaW5kZXggaW4gc1xuICAgICAgcyA9IFtdLCAvLyBzdHJpbmcgY29uc3RhbnRzIGFuZCBwbGFjZWhvbGRlcnNcbiAgICAgIHEgPSBbXTsgLy8gbnVtYmVyIGludGVycG9sYXRvcnNcblxuICAvLyBDb2VyY2UgaW5wdXRzIHRvIHN0cmluZ3MuXG4gIGEgPSBhICsgXCJcIiwgYiA9IGIgKyBcIlwiO1xuXG4gIC8vIEludGVycG9sYXRlIHBhaXJzIG9mIG51bWJlcnMgaW4gYSAmIGIuXG4gIHdoaWxlICgoYW0gPSByZUEuZXhlYyhhKSlcbiAgICAgICYmIChibSA9IHJlQi5leGVjKGIpKSkge1xuICAgIGlmICgoYnMgPSBibS5pbmRleCkgPiBiaSkgeyAvLyBhIHN0cmluZyBwcmVjZWRlcyB0aGUgbmV4dCBudW1iZXIgaW4gYlxuICAgICAgYnMgPSBiLnNsaWNlKGJpLCBicyk7XG4gICAgICBpZiAoc1tpXSkgc1tpXSArPSBiczsgLy8gY29hbGVzY2Ugd2l0aCBwcmV2aW91cyBzdHJpbmdcbiAgICAgIGVsc2Ugc1srK2ldID0gYnM7XG4gICAgfVxuICAgIGlmICgoYW0gPSBhbVswXSkgPT09IChibSA9IGJtWzBdKSkgeyAvLyBudW1iZXJzIGluIGEgJiBiIG1hdGNoXG4gICAgICBpZiAoc1tpXSkgc1tpXSArPSBibTsgLy8gY29hbGVzY2Ugd2l0aCBwcmV2aW91cyBzdHJpbmdcbiAgICAgIGVsc2Ugc1srK2ldID0gYm07XG4gICAgfSBlbHNlIHsgLy8gaW50ZXJwb2xhdGUgbm9uLW1hdGNoaW5nIG51bWJlcnNcbiAgICAgIHNbKytpXSA9IG51bGw7XG4gICAgICBxLnB1c2goe2k6IGksIHg6IG51bWJlcihhbSwgYm0pfSk7XG4gICAgfVxuICAgIGJpID0gcmVCLmxhc3RJbmRleDtcbiAgfVxuXG4gIC8vIEFkZCByZW1haW5zIG9mIGIuXG4gIGlmIChiaSA8IGIubGVuZ3RoKSB7XG4gICAgYnMgPSBiLnNsaWNlKGJpKTtcbiAgICBpZiAoc1tpXSkgc1tpXSArPSBiczsgLy8gY29hbGVzY2Ugd2l0aCBwcmV2aW91cyBzdHJpbmdcbiAgICBlbHNlIHNbKytpXSA9IGJzO1xuICB9XG5cbiAgLy8gU3BlY2lhbCBvcHRpbWl6YXRpb24gZm9yIG9ubHkgYSBzaW5nbGUgbWF0Y2guXG4gIC8vIE90aGVyd2lzZSwgaW50ZXJwb2xhdGUgZWFjaCBvZiB0aGUgbnVtYmVycyBhbmQgcmVqb2luIHRoZSBzdHJpbmcuXG4gIHJldHVybiBzLmxlbmd0aCA8IDIgPyAocVswXVxuICAgICAgPyBvbmUocVswXS54KVxuICAgICAgOiB6ZXJvKGIpKVxuICAgICAgOiAoYiA9IHEubGVuZ3RoLCBmdW5jdGlvbih0KSB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIG87IGkgPCBiOyArK2kpIHNbKG8gPSBxW2ldKS5pXSA9IG8ueCh0KTtcbiAgICAgICAgICByZXR1cm4gcy5qb2luKFwiXCIpO1xuICAgICAgICB9KTtcbn1cbiIsImltcG9ydCB7Y29sb3J9IGZyb20gXCJkMy1jb2xvclwiO1xuaW1wb3J0IHJnYiBmcm9tIFwiLi9yZ2IuanNcIjtcbmltcG9ydCB7Z2VuZXJpY0FycmF5fSBmcm9tIFwiLi9hcnJheS5qc1wiO1xuaW1wb3J0IGRhdGUgZnJvbSBcIi4vZGF0ZS5qc1wiO1xuaW1wb3J0IG51bWJlciBmcm9tIFwiLi9udW1iZXIuanNcIjtcbmltcG9ydCBvYmplY3QgZnJvbSBcIi4vb2JqZWN0LmpzXCI7XG5pbXBvcnQgc3RyaW5nIGZyb20gXCIuL3N0cmluZy5qc1wiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5pbXBvcnQgbnVtYmVyQXJyYXksIHtpc051bWJlckFycmF5fSBmcm9tIFwiLi9udW1iZXJBcnJheS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciB0ID0gdHlwZW9mIGIsIGM7XG4gIHJldHVybiBiID09IG51bGwgfHwgdCA9PT0gXCJib29sZWFuXCIgPyBjb25zdGFudChiKVxuICAgICAgOiAodCA9PT0gXCJudW1iZXJcIiA/IG51bWJlclxuICAgICAgOiB0ID09PSBcInN0cmluZ1wiID8gKChjID0gY29sb3IoYikpID8gKGIgPSBjLCByZ2IpIDogc3RyaW5nKVxuICAgICAgOiBiIGluc3RhbmNlb2YgY29sb3IgPyByZ2JcbiAgICAgIDogYiBpbnN0YW5jZW9mIERhdGUgPyBkYXRlXG4gICAgICA6IGlzTnVtYmVyQXJyYXkoYikgPyBudW1iZXJBcnJheVxuICAgICAgOiBBcnJheS5pc0FycmF5KGIpID8gZ2VuZXJpY0FycmF5XG4gICAgICA6IHR5cGVvZiBiLnZhbHVlT2YgIT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgYi50b1N0cmluZyAhPT0gXCJmdW5jdGlvblwiIHx8IGlzTmFOKGIpID8gb2JqZWN0XG4gICAgICA6IG51bWJlcikoYSwgYik7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihyYW5nZSkge1xuICB2YXIgbiA9IHJhbmdlLmxlbmd0aDtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gcmFuZ2VbTWF0aC5tYXgoMCwgTWF0aC5taW4obiAtIDEsIE1hdGguZmxvb3IodCAqIG4pKSldO1xuICB9O1xufVxuIiwiaW1wb3J0IHtodWV9IGZyb20gXCIuL2NvbG9yLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIGkgPSBodWUoK2EsICtiKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgeCA9IGkodCk7XG4gICAgcmV0dXJuIHggLSAzNjAgKiBNYXRoLmZsb29yKHggLyAzNjApO1xuICB9O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gYSA9ICthLCBiID0gK2IsIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChhICogKDEgLSB0KSArIGIgKiB0KTtcbiAgfTtcbn1cbiIsInZhciBkZWdyZWVzID0gMTgwIC8gTWF0aC5QSTtcblxuZXhwb3J0IHZhciBpZGVudGl0eSA9IHtcbiAgdHJhbnNsYXRlWDogMCxcbiAgdHJhbnNsYXRlWTogMCxcbiAgcm90YXRlOiAwLFxuICBza2V3WDogMCxcbiAgc2NhbGVYOiAxLFxuICBzY2FsZVk6IDFcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgdmFyIHNjYWxlWCwgc2NhbGVZLCBza2V3WDtcbiAgaWYgKHNjYWxlWCA9IE1hdGguc3FydChhICogYSArIGIgKiBiKSkgYSAvPSBzY2FsZVgsIGIgLz0gc2NhbGVYO1xuICBpZiAoc2tld1ggPSBhICogYyArIGIgKiBkKSBjIC09IGEgKiBza2V3WCwgZCAtPSBiICogc2tld1g7XG4gIGlmIChzY2FsZVkgPSBNYXRoLnNxcnQoYyAqIGMgKyBkICogZCkpIGMgLz0gc2NhbGVZLCBkIC89IHNjYWxlWSwgc2tld1ggLz0gc2NhbGVZO1xuICBpZiAoYSAqIGQgPCBiICogYykgYSA9IC1hLCBiID0gLWIsIHNrZXdYID0gLXNrZXdYLCBzY2FsZVggPSAtc2NhbGVYO1xuICByZXR1cm4ge1xuICAgIHRyYW5zbGF0ZVg6IGUsXG4gICAgdHJhbnNsYXRlWTogZixcbiAgICByb3RhdGU6IE1hdGguYXRhbjIoYiwgYSkgKiBkZWdyZWVzLFxuICAgIHNrZXdYOiBNYXRoLmF0YW4oc2tld1gpICogZGVncmVlcyxcbiAgICBzY2FsZVg6IHNjYWxlWCxcbiAgICBzY2FsZVk6IHNjYWxlWVxuICB9O1xufVxuIiwiaW1wb3J0IGRlY29tcG9zZSwge2lkZW50aXR5fSBmcm9tIFwiLi9kZWNvbXBvc2UuanNcIjtcblxudmFyIHN2Z05vZGU7XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDc3ModmFsdWUpIHtcbiAgY29uc3QgbSA9IG5ldyAodHlwZW9mIERPTU1hdHJpeCA9PT0gXCJmdW5jdGlvblwiID8gRE9NTWF0cml4IDogV2ViS2l0Q1NTTWF0cml4KSh2YWx1ZSArIFwiXCIpO1xuICByZXR1cm4gbS5pc0lkZW50aXR5ID8gaWRlbnRpdHkgOiBkZWNvbXBvc2UobS5hLCBtLmIsIG0uYywgbS5kLCBtLmUsIG0uZik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVN2Zyh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIGlkZW50aXR5O1xuICBpZiAoIXN2Z05vZGUpIHN2Z05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImdcIik7XG4gIHN2Z05vZGUuc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsIHZhbHVlKTtcbiAgaWYgKCEodmFsdWUgPSBzdmdOb2RlLnRyYW5zZm9ybS5iYXNlVmFsLmNvbnNvbGlkYXRlKCkpKSByZXR1cm4gaWRlbnRpdHk7XG4gIHZhbHVlID0gdmFsdWUubWF0cml4O1xuICByZXR1cm4gZGVjb21wb3NlKHZhbHVlLmEsIHZhbHVlLmIsIHZhbHVlLmMsIHZhbHVlLmQsIHZhbHVlLmUsIHZhbHVlLmYpO1xufVxuIiwiaW1wb3J0IG51bWJlciBmcm9tIFwiLi4vbnVtYmVyLmpzXCI7XG5pbXBvcnQge3BhcnNlQ3NzLCBwYXJzZVN2Z30gZnJvbSBcIi4vcGFyc2UuanNcIjtcblxuZnVuY3Rpb24gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2UsIHB4Q29tbWEsIHB4UGFyZW4sIGRlZ1BhcmVuKSB7XG5cbiAgZnVuY3Rpb24gcG9wKHMpIHtcbiAgICByZXR1cm4gcy5sZW5ndGggPyBzLnBvcCgpICsgXCIgXCIgOiBcIlwiO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJhbnNsYXRlKHhhLCB5YSwgeGIsIHliLCBzLCBxKSB7XG4gICAgaWYgKHhhICE9PSB4YiB8fCB5YSAhPT0geWIpIHtcbiAgICAgIHZhciBpID0gcy5wdXNoKFwidHJhbnNsYXRlKFwiLCBudWxsLCBweENvbW1hLCBudWxsLCBweFBhcmVuKTtcbiAgICAgIHEucHVzaCh7aTogaSAtIDQsIHg6IG51bWJlcih4YSwgeGIpfSwge2k6IGkgLSAyLCB4OiBudW1iZXIoeWEsIHliKX0pO1xuICAgIH0gZWxzZSBpZiAoeGIgfHwgeWIpIHtcbiAgICAgIHMucHVzaChcInRyYW5zbGF0ZShcIiArIHhiICsgcHhDb21tYSArIHliICsgcHhQYXJlbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcm90YXRlKGEsIGIsIHMsIHEpIHtcbiAgICBpZiAoYSAhPT0gYikge1xuICAgICAgaWYgKGEgLSBiID4gMTgwKSBiICs9IDM2MDsgZWxzZSBpZiAoYiAtIGEgPiAxODApIGEgKz0gMzYwOyAvLyBzaG9ydGVzdCBwYXRoXG4gICAgICBxLnB1c2goe2k6IHMucHVzaChwb3AocykgKyBcInJvdGF0ZShcIiwgbnVsbCwgZGVnUGFyZW4pIC0gMiwgeDogbnVtYmVyKGEsIGIpfSk7XG4gICAgfSBlbHNlIGlmIChiKSB7XG4gICAgICBzLnB1c2gocG9wKHMpICsgXCJyb3RhdGUoXCIgKyBiICsgZGVnUGFyZW4pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNrZXdYKGEsIGIsIHMsIHEpIHtcbiAgICBpZiAoYSAhPT0gYikge1xuICAgICAgcS5wdXNoKHtpOiBzLnB1c2gocG9wKHMpICsgXCJza2V3WChcIiwgbnVsbCwgZGVnUGFyZW4pIC0gMiwgeDogbnVtYmVyKGEsIGIpfSk7XG4gICAgfSBlbHNlIGlmIChiKSB7XG4gICAgICBzLnB1c2gocG9wKHMpICsgXCJza2V3WChcIiArIGIgKyBkZWdQYXJlbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2NhbGUoeGEsIHlhLCB4YiwgeWIsIHMsIHEpIHtcbiAgICBpZiAoeGEgIT09IHhiIHx8IHlhICE9PSB5Yikge1xuICAgICAgdmFyIGkgPSBzLnB1c2gocG9wKHMpICsgXCJzY2FsZShcIiwgbnVsbCwgXCIsXCIsIG51bGwsIFwiKVwiKTtcbiAgICAgIHEucHVzaCh7aTogaSAtIDQsIHg6IG51bWJlcih4YSwgeGIpfSwge2k6IGkgLSAyLCB4OiBudW1iZXIoeWEsIHliKX0pO1xuICAgIH0gZWxzZSBpZiAoeGIgIT09IDEgfHwgeWIgIT09IDEpIHtcbiAgICAgIHMucHVzaChwb3AocykgKyBcInNjYWxlKFwiICsgeGIgKyBcIixcIiArIHliICsgXCIpXCIpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHMgPSBbXSwgLy8gc3RyaW5nIGNvbnN0YW50cyBhbmQgcGxhY2Vob2xkZXJzXG4gICAgICAgIHEgPSBbXTsgLy8gbnVtYmVyIGludGVycG9sYXRvcnNcbiAgICBhID0gcGFyc2UoYSksIGIgPSBwYXJzZShiKTtcbiAgICB0cmFuc2xhdGUoYS50cmFuc2xhdGVYLCBhLnRyYW5zbGF0ZVksIGIudHJhbnNsYXRlWCwgYi50cmFuc2xhdGVZLCBzLCBxKTtcbiAgICByb3RhdGUoYS5yb3RhdGUsIGIucm90YXRlLCBzLCBxKTtcbiAgICBza2V3WChhLnNrZXdYLCBiLnNrZXdYLCBzLCBxKTtcbiAgICBzY2FsZShhLnNjYWxlWCwgYS5zY2FsZVksIGIuc2NhbGVYLCBiLnNjYWxlWSwgcywgcSk7XG4gICAgYSA9IGIgPSBudWxsOyAvLyBnY1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICB2YXIgaSA9IC0xLCBuID0gcS5sZW5ndGgsIG87XG4gICAgICB3aGlsZSAoKytpIDwgbikgc1sobyA9IHFbaV0pLmldID0gby54KHQpO1xuICAgICAgcmV0dXJuIHMuam9pbihcIlwiKTtcbiAgICB9O1xuICB9O1xufVxuXG5leHBvcnQgdmFyIGludGVycG9sYXRlVHJhbnNmb3JtQ3NzID0gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2VDc3MsIFwicHgsIFwiLCBcInB4KVwiLCBcImRlZylcIik7XG5leHBvcnQgdmFyIGludGVycG9sYXRlVHJhbnNmb3JtU3ZnID0gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2VTdmcsIFwiLCBcIiwgXCIpXCIsIFwiKVwiKTtcbiIsInZhciBlcHNpbG9uMiA9IDFlLTEyO1xuXG5mdW5jdGlvbiBjb3NoKHgpIHtcbiAgcmV0dXJuICgoeCA9IE1hdGguZXhwKHgpKSArIDEgLyB4KSAvIDI7XG59XG5cbmZ1bmN0aW9uIHNpbmgoeCkge1xuICByZXR1cm4gKCh4ID0gTWF0aC5leHAoeCkpIC0gMSAvIHgpIC8gMjtcbn1cblxuZnVuY3Rpb24gdGFuaCh4KSB7XG4gIHJldHVybiAoKHggPSBNYXRoLmV4cCgyICogeCkpIC0gMSkgLyAoeCArIDEpO1xufVxuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gem9vbVJobyhyaG8sIHJobzIsIHJobzQpIHtcblxuICAvLyBwMCA9IFt1eDAsIHV5MCwgdzBdXG4gIC8vIHAxID0gW3V4MSwgdXkxLCB3MV1cbiAgZnVuY3Rpb24gem9vbShwMCwgcDEpIHtcbiAgICB2YXIgdXgwID0gcDBbMF0sIHV5MCA9IHAwWzFdLCB3MCA9IHAwWzJdLFxuICAgICAgICB1eDEgPSBwMVswXSwgdXkxID0gcDFbMV0sIHcxID0gcDFbMl0sXG4gICAgICAgIGR4ID0gdXgxIC0gdXgwLFxuICAgICAgICBkeSA9IHV5MSAtIHV5MCxcbiAgICAgICAgZDIgPSBkeCAqIGR4ICsgZHkgKiBkeSxcbiAgICAgICAgaSxcbiAgICAgICAgUztcblxuICAgIC8vIFNwZWNpYWwgY2FzZSBmb3IgdTAg4omFIHUxLlxuICAgIGlmIChkMiA8IGVwc2lsb24yKSB7XG4gICAgICBTID0gTWF0aC5sb2codzEgLyB3MCkgLyByaG87XG4gICAgICBpID0gZnVuY3Rpb24odCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgIHV4MCArIHQgKiBkeCxcbiAgICAgICAgICB1eTAgKyB0ICogZHksXG4gICAgICAgICAgdzAgKiBNYXRoLmV4cChyaG8gKiB0ICogUylcbiAgICAgICAgXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBHZW5lcmFsIGNhc2UuXG4gICAgZWxzZSB7XG4gICAgICB2YXIgZDEgPSBNYXRoLnNxcnQoZDIpLFxuICAgICAgICAgIGIwID0gKHcxICogdzEgLSB3MCAqIHcwICsgcmhvNCAqIGQyKSAvICgyICogdzAgKiByaG8yICogZDEpLFxuICAgICAgICAgIGIxID0gKHcxICogdzEgLSB3MCAqIHcwIC0gcmhvNCAqIGQyKSAvICgyICogdzEgKiByaG8yICogZDEpLFxuICAgICAgICAgIHIwID0gTWF0aC5sb2coTWF0aC5zcXJ0KGIwICogYjAgKyAxKSAtIGIwKSxcbiAgICAgICAgICByMSA9IE1hdGgubG9nKE1hdGguc3FydChiMSAqIGIxICsgMSkgLSBiMSk7XG4gICAgICBTID0gKHIxIC0gcjApIC8gcmhvO1xuICAgICAgaSA9IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgdmFyIHMgPSB0ICogUyxcbiAgICAgICAgICAgIGNvc2hyMCA9IGNvc2gocjApLFxuICAgICAgICAgICAgdSA9IHcwIC8gKHJobzIgKiBkMSkgKiAoY29zaHIwICogdGFuaChyaG8gKiBzICsgcjApIC0gc2luaChyMCkpO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgIHV4MCArIHUgKiBkeCxcbiAgICAgICAgICB1eTAgKyB1ICogZHksXG4gICAgICAgICAgdzAgKiBjb3NocjAgLyBjb3NoKHJobyAqIHMgKyByMClcbiAgICAgICAgXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpLmR1cmF0aW9uID0gUyAqIDEwMDAgKiByaG8gLyBNYXRoLlNRUlQyO1xuXG4gICAgcmV0dXJuIGk7XG4gIH1cblxuICB6b29tLnJobyA9IGZ1bmN0aW9uKF8pIHtcbiAgICB2YXIgXzEgPSBNYXRoLm1heCgxZS0zLCArXyksIF8yID0gXzEgKiBfMSwgXzQgPSBfMiAqIF8yO1xuICAgIHJldHVybiB6b29tUmhvKF8xLCBfMiwgXzQpO1xuICB9O1xuXG4gIHJldHVybiB6b29tO1xufSkoTWF0aC5TUVJUMiwgMiwgNCk7XG4iLCJpbXBvcnQge2hzbCBhcyBjb2xvckhzbH0gZnJvbSBcImQzLWNvbG9yXCI7XG5pbXBvcnQgY29sb3IsIHtodWV9IGZyb20gXCIuL2NvbG9yLmpzXCI7XG5cbmZ1bmN0aW9uIGhzbChodWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcbiAgICB2YXIgaCA9IGh1ZSgoc3RhcnQgPSBjb2xvckhzbChzdGFydCkpLmgsIChlbmQgPSBjb2xvckhzbChlbmQpKS5oKSxcbiAgICAgICAgcyA9IGNvbG9yKHN0YXJ0LnMsIGVuZC5zKSxcbiAgICAgICAgbCA9IGNvbG9yKHN0YXJ0LmwsIGVuZC5sKSxcbiAgICAgICAgb3BhY2l0eSA9IGNvbG9yKHN0YXJ0Lm9wYWNpdHksIGVuZC5vcGFjaXR5KTtcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgc3RhcnQuaCA9IGgodCk7XG4gICAgICBzdGFydC5zID0gcyh0KTtcbiAgICAgIHN0YXJ0LmwgPSBsKHQpO1xuICAgICAgc3RhcnQub3BhY2l0eSA9IG9wYWNpdHkodCk7XG4gICAgICByZXR1cm4gc3RhcnQgKyBcIlwiO1xuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgaHNsKGh1ZSk7XG5leHBvcnQgdmFyIGhzbExvbmcgPSBoc2woY29sb3IpO1xuIiwiaW1wb3J0IHtsYWIgYXMgY29sb3JMYWJ9IGZyb20gXCJkMy1jb2xvclwiO1xuaW1wb3J0IGNvbG9yIGZyb20gXCIuL2NvbG9yLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxhYihzdGFydCwgZW5kKSB7XG4gIHZhciBsID0gY29sb3IoKHN0YXJ0ID0gY29sb3JMYWIoc3RhcnQpKS5sLCAoZW5kID0gY29sb3JMYWIoZW5kKSkubCksXG4gICAgICBhID0gY29sb3Ioc3RhcnQuYSwgZW5kLmEpLFxuICAgICAgYiA9IGNvbG9yKHN0YXJ0LmIsIGVuZC5iKSxcbiAgICAgIG9wYWNpdHkgPSBjb2xvcihzdGFydC5vcGFjaXR5LCBlbmQub3BhY2l0eSk7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgc3RhcnQubCA9IGwodCk7XG4gICAgc3RhcnQuYSA9IGEodCk7XG4gICAgc3RhcnQuYiA9IGIodCk7XG4gICAgc3RhcnQub3BhY2l0eSA9IG9wYWNpdHkodCk7XG4gICAgcmV0dXJuIHN0YXJ0ICsgXCJcIjtcbiAgfTtcbn1cbiIsImltcG9ydCB7aGNsIGFzIGNvbG9ySGNsfSBmcm9tIFwiZDMtY29sb3JcIjtcbmltcG9ydCBjb2xvciwge2h1ZX0gZnJvbSBcIi4vY29sb3IuanNcIjtcblxuZnVuY3Rpb24gaGNsKGh1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuICAgIHZhciBoID0gaHVlKChzdGFydCA9IGNvbG9ySGNsKHN0YXJ0KSkuaCwgKGVuZCA9IGNvbG9ySGNsKGVuZCkpLmgpLFxuICAgICAgICBjID0gY29sb3Ioc3RhcnQuYywgZW5kLmMpLFxuICAgICAgICBsID0gY29sb3Ioc3RhcnQubCwgZW5kLmwpLFxuICAgICAgICBvcGFjaXR5ID0gY29sb3Ioc3RhcnQub3BhY2l0eSwgZW5kLm9wYWNpdHkpO1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICBzdGFydC5oID0gaCh0KTtcbiAgICAgIHN0YXJ0LmMgPSBjKHQpO1xuICAgICAgc3RhcnQubCA9IGwodCk7XG4gICAgICBzdGFydC5vcGFjaXR5ID0gb3BhY2l0eSh0KTtcbiAgICAgIHJldHVybiBzdGFydCArIFwiXCI7XG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBoY2woaHVlKTtcbmV4cG9ydCB2YXIgaGNsTG9uZyA9IGhjbChjb2xvcik7XG4iLCJpbXBvcnQge2N1YmVoZWxpeCBhcyBjb2xvckN1YmVoZWxpeH0gZnJvbSBcImQzLWNvbG9yXCI7XG5pbXBvcnQgY29sb3IsIHtodWV9IGZyb20gXCIuL2NvbG9yLmpzXCI7XG5cbmZ1bmN0aW9uIGN1YmVoZWxpeChodWUpIHtcbiAgcmV0dXJuIChmdW5jdGlvbiBjdWJlaGVsaXhHYW1tYSh5KSB7XG4gICAgeSA9ICt5O1xuXG4gICAgZnVuY3Rpb24gY3ViZWhlbGl4KHN0YXJ0LCBlbmQpIHtcbiAgICAgIHZhciBoID0gaHVlKChzdGFydCA9IGNvbG9yQ3ViZWhlbGl4KHN0YXJ0KSkuaCwgKGVuZCA9IGNvbG9yQ3ViZWhlbGl4KGVuZCkpLmgpLFxuICAgICAgICAgIHMgPSBjb2xvcihzdGFydC5zLCBlbmQucyksXG4gICAgICAgICAgbCA9IGNvbG9yKHN0YXJ0LmwsIGVuZC5sKSxcbiAgICAgICAgICBvcGFjaXR5ID0gY29sb3Ioc3RhcnQub3BhY2l0eSwgZW5kLm9wYWNpdHkpO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgc3RhcnQuaCA9IGgodCk7XG4gICAgICAgIHN0YXJ0LnMgPSBzKHQpO1xuICAgICAgICBzdGFydC5sID0gbChNYXRoLnBvdyh0LCB5KSk7XG4gICAgICAgIHN0YXJ0Lm9wYWNpdHkgPSBvcGFjaXR5KHQpO1xuICAgICAgICByZXR1cm4gc3RhcnQgKyBcIlwiO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBjdWJlaGVsaXguZ2FtbWEgPSBjdWJlaGVsaXhHYW1tYTtcblxuICAgIHJldHVybiBjdWJlaGVsaXg7XG4gIH0pKDEpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjdWJlaGVsaXgoaHVlKTtcbmV4cG9ydCB2YXIgY3ViZWhlbGl4TG9uZyA9IGN1YmVoZWxpeChjb2xvcik7XG4iLCJpbXBvcnQge2RlZmF1bHQgYXMgdmFsdWV9IGZyb20gXCIuL3ZhbHVlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBpZWNld2lzZShpbnRlcnBvbGF0ZSwgdmFsdWVzKSB7XG4gIGlmICh2YWx1ZXMgPT09IHVuZGVmaW5lZCkgdmFsdWVzID0gaW50ZXJwb2xhdGUsIGludGVycG9sYXRlID0gdmFsdWU7XG4gIHZhciBpID0gMCwgbiA9IHZhbHVlcy5sZW5ndGggLSAxLCB2ID0gdmFsdWVzWzBdLCBJID0gbmV3IEFycmF5KG4gPCAwID8gMCA6IG4pO1xuICB3aGlsZSAoaSA8IG4pIElbaV0gPSBpbnRlcnBvbGF0ZSh2LCB2ID0gdmFsdWVzWysraV0pO1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHZhciBpID0gTWF0aC5tYXgoMCwgTWF0aC5taW4obiAtIDEsIE1hdGguZmxvb3IodCAqPSBuKSkpO1xuICAgIHJldHVybiBJW2ldKHQgLSBpKTtcbiAgfTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGludGVycG9sYXRvciwgbikge1xuICB2YXIgc2FtcGxlcyA9IG5ldyBBcnJheShuKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpIHNhbXBsZXNbaV0gPSBpbnRlcnBvbGF0b3IoaSAvIChuIC0gMSkpO1xuICByZXR1cm4gc2FtcGxlcztcbn1cbiIsImV4cG9ydCB7ZGVmYXVsdCBhcyBpbnRlcnBvbGF0ZX0gZnJvbSBcIi4vdmFsdWUuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBpbnRlcnBvbGF0ZUFycmF5fSBmcm9tIFwiLi9hcnJheS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlQmFzaXN9IGZyb20gXCIuL2Jhc2lzLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgaW50ZXJwb2xhdGVCYXNpc0Nsb3NlZH0gZnJvbSBcIi4vYmFzaXNDbG9zZWQuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBpbnRlcnBvbGF0ZURhdGV9IGZyb20gXCIuL2RhdGUuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBpbnRlcnBvbGF0ZURpc2NyZXRlfSBmcm9tIFwiLi9kaXNjcmV0ZS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlSHVlfSBmcm9tIFwiLi9odWUuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBpbnRlcnBvbGF0ZU51bWJlcn0gZnJvbSBcIi4vbnVtYmVyLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgaW50ZXJwb2xhdGVOdW1iZXJBcnJheX0gZnJvbSBcIi4vbnVtYmVyQXJyYXkuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBpbnRlcnBvbGF0ZU9iamVjdH0gZnJvbSBcIi4vb2JqZWN0LmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgaW50ZXJwb2xhdGVSb3VuZH0gZnJvbSBcIi4vcm91bmQuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBpbnRlcnBvbGF0ZVN0cmluZ30gZnJvbSBcIi4vc3RyaW5nLmpzXCI7XG5leHBvcnQge2ludGVycG9sYXRlVHJhbnNmb3JtQ3NzLCBpbnRlcnBvbGF0ZVRyYW5zZm9ybVN2Z30gZnJvbSBcIi4vdHJhbnNmb3JtL2luZGV4LmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgaW50ZXJwb2xhdGVab29tfSBmcm9tIFwiLi96b29tLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgaW50ZXJwb2xhdGVSZ2IsIHJnYkJhc2lzIGFzIGludGVycG9sYXRlUmdiQmFzaXMsIHJnYkJhc2lzQ2xvc2VkIGFzIGludGVycG9sYXRlUmdiQmFzaXNDbG9zZWR9IGZyb20gXCIuL3JnYi5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlSHNsLCBoc2xMb25nIGFzIGludGVycG9sYXRlSHNsTG9uZ30gZnJvbSBcIi4vaHNsLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgaW50ZXJwb2xhdGVMYWJ9IGZyb20gXCIuL2xhYi5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlSGNsLCBoY2xMb25nIGFzIGludGVycG9sYXRlSGNsTG9uZ30gZnJvbSBcIi4vaGNsLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgaW50ZXJwb2xhdGVDdWJlaGVsaXgsIGN1YmVoZWxpeExvbmcgYXMgaW50ZXJwb2xhdGVDdWJlaGVsaXhMb25nfSBmcm9tIFwiLi9jdWJlaGVsaXguanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBwaWVjZXdpc2V9IGZyb20gXCIuL3BpZWNld2lzZS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHF1YW50aXplfSBmcm9tIFwiLi9xdWFudGl6ZS5qc1wiO1xuIiwiZnVuY3Rpb24gZGVmYXVsdFNlcGFyYXRpb24oYSwgYikge1xuICByZXR1cm4gYS5wYXJlbnQgPT09IGIucGFyZW50ID8gMSA6IDI7XG59XG5cbmZ1bmN0aW9uIG1lYW5YKGNoaWxkcmVuKSB7XG4gIHJldHVybiBjaGlsZHJlbi5yZWR1Y2UobWVhblhSZWR1Y2UsIDApIC8gY2hpbGRyZW4ubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiBtZWFuWFJlZHVjZSh4LCBjKSB7XG4gIHJldHVybiB4ICsgYy54O1xufVxuXG5mdW5jdGlvbiBtYXhZKGNoaWxkcmVuKSB7XG4gIHJldHVybiAxICsgY2hpbGRyZW4ucmVkdWNlKG1heFlSZWR1Y2UsIDApO1xufVxuXG5mdW5jdGlvbiBtYXhZUmVkdWNlKHksIGMpIHtcbiAgcmV0dXJuIE1hdGgubWF4KHksIGMueSk7XG59XG5cbmZ1bmN0aW9uIGxlYWZMZWZ0KG5vZGUpIHtcbiAgdmFyIGNoaWxkcmVuO1xuICB3aGlsZSAoY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuKSBub2RlID0gY2hpbGRyZW5bMF07XG4gIHJldHVybiBub2RlO1xufVxuXG5mdW5jdGlvbiBsZWFmUmlnaHQobm9kZSkge1xuICB2YXIgY2hpbGRyZW47XG4gIHdoaWxlIChjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4pIG5vZGUgPSBjaGlsZHJlbltjaGlsZHJlbi5sZW5ndGggLSAxXTtcbiAgcmV0dXJuIG5vZGU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgc2VwYXJhdGlvbiA9IGRlZmF1bHRTZXBhcmF0aW9uLFxuICAgICAgZHggPSAxLFxuICAgICAgZHkgPSAxLFxuICAgICAgbm9kZVNpemUgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBjbHVzdGVyKHJvb3QpIHtcbiAgICB2YXIgcHJldmlvdXNOb2RlLFxuICAgICAgICB4ID0gMDtcblxuICAgIC8vIEZpcnN0IHdhbGssIGNvbXB1dGluZyB0aGUgaW5pdGlhbCB4ICYgeSB2YWx1ZXMuXG4gICAgcm9vdC5lYWNoQWZ0ZXIoZnVuY3Rpb24obm9kZSkge1xuICAgICAgdmFyIGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbjtcbiAgICAgIGlmIChjaGlsZHJlbikge1xuICAgICAgICBub2RlLnggPSBtZWFuWChjaGlsZHJlbik7XG4gICAgICAgIG5vZGUueSA9IG1heFkoY2hpbGRyZW4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZS54ID0gcHJldmlvdXNOb2RlID8geCArPSBzZXBhcmF0aW9uKG5vZGUsIHByZXZpb3VzTm9kZSkgOiAwO1xuICAgICAgICBub2RlLnkgPSAwO1xuICAgICAgICBwcmV2aW91c05vZGUgPSBub2RlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIGxlZnQgPSBsZWFmTGVmdChyb290KSxcbiAgICAgICAgcmlnaHQgPSBsZWFmUmlnaHQocm9vdCksXG4gICAgICAgIHgwID0gbGVmdC54IC0gc2VwYXJhdGlvbihsZWZ0LCByaWdodCkgLyAyLFxuICAgICAgICB4MSA9IHJpZ2h0LnggKyBzZXBhcmF0aW9uKHJpZ2h0LCBsZWZ0KSAvIDI7XG5cbiAgICAvLyBTZWNvbmQgd2Fsaywgbm9ybWFsaXppbmcgeCAmIHkgdG8gdGhlIGRlc2lyZWQgc2l6ZS5cbiAgICByZXR1cm4gcm9vdC5lYWNoQWZ0ZXIobm9kZVNpemUgPyBmdW5jdGlvbihub2RlKSB7XG4gICAgICBub2RlLnggPSAobm9kZS54IC0gcm9vdC54KSAqIGR4O1xuICAgICAgbm9kZS55ID0gKHJvb3QueSAtIG5vZGUueSkgKiBkeTtcbiAgICB9IDogZnVuY3Rpb24obm9kZSkge1xuICAgICAgbm9kZS54ID0gKG5vZGUueCAtIHgwKSAvICh4MSAtIHgwKSAqIGR4O1xuICAgICAgbm9kZS55ID0gKDEgLSAocm9vdC55ID8gbm9kZS55IC8gcm9vdC55IDogMSkpICogZHk7XG4gICAgfSk7XG4gIH1cblxuICBjbHVzdGVyLnNlcGFyYXRpb24gPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoc2VwYXJhdGlvbiA9IHgsIGNsdXN0ZXIpIDogc2VwYXJhdGlvbjtcbiAgfTtcblxuICBjbHVzdGVyLnNpemUgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAobm9kZVNpemUgPSBmYWxzZSwgZHggPSAreFswXSwgZHkgPSAreFsxXSwgY2x1c3RlcikgOiAobm9kZVNpemUgPyBudWxsIDogW2R4LCBkeV0pO1xuICB9O1xuXG4gIGNsdXN0ZXIubm9kZVNpemUgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAobm9kZVNpemUgPSB0cnVlLCBkeCA9ICt4WzBdLCBkeSA9ICt4WzFdLCBjbHVzdGVyKSA6IChub2RlU2l6ZSA/IFtkeCwgZHldIDogbnVsbCk7XG4gIH07XG5cbiAgcmV0dXJuIGNsdXN0ZXI7XG59XG4iLCJmdW5jdGlvbiBjb3VudChub2RlKSB7XG4gIHZhciBzdW0gPSAwLFxuICAgICAgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuLFxuICAgICAgaSA9IGNoaWxkcmVuICYmIGNoaWxkcmVuLmxlbmd0aDtcbiAgaWYgKCFpKSBzdW0gPSAxO1xuICBlbHNlIHdoaWxlICgtLWkgPj0gMCkgc3VtICs9IGNoaWxkcmVuW2ldLnZhbHVlO1xuICBub2RlLnZhbHVlID0gc3VtO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaEFmdGVyKGNvdW50KTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGF0KSB7XG4gIGxldCBpbmRleCA9IC0xO1xuICBmb3IgKGNvbnN0IG5vZGUgb2YgdGhpcykge1xuICAgIGNhbGxiYWNrLmNhbGwodGhhdCwgbm9kZSwgKytpbmRleCwgdGhpcyk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjYWxsYmFjaywgdGhhdCkge1xuICB2YXIgbm9kZSA9IHRoaXMsIG5vZGVzID0gW25vZGVdLCBjaGlsZHJlbiwgaSwgaW5kZXggPSAtMTtcbiAgd2hpbGUgKG5vZGUgPSBub2Rlcy5wb3AoKSkge1xuICAgIGNhbGxiYWNrLmNhbGwodGhhdCwgbm9kZSwgKytpbmRleCwgdGhpcyk7XG4gICAgaWYgKGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbikge1xuICAgICAgZm9yIChpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgbm9kZXMucHVzaChjaGlsZHJlbltpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY2FsbGJhY2ssIHRoYXQpIHtcbiAgdmFyIG5vZGUgPSB0aGlzLCBub2RlcyA9IFtub2RlXSwgbmV4dCA9IFtdLCBjaGlsZHJlbiwgaSwgbiwgaW5kZXggPSAtMTtcbiAgd2hpbGUgKG5vZGUgPSBub2Rlcy5wb3AoKSkge1xuICAgIG5leHQucHVzaChub2RlKTtcbiAgICBpZiAoY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuKSB7XG4gICAgICBmb3IgKGkgPSAwLCBuID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIG5vZGVzLnB1c2goY2hpbGRyZW5baV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICB3aGlsZSAobm9kZSA9IG5leHQucG9wKCkpIHtcbiAgICBjYWxsYmFjay5jYWxsKHRoYXQsIG5vZGUsICsraW5kZXgsIHRoaXMpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY2FsbGJhY2ssIHRoYXQpIHtcbiAgbGV0IGluZGV4ID0gLTE7XG4gIGZvciAoY29uc3Qgbm9kZSBvZiB0aGlzKSB7XG4gICAgaWYgKGNhbGxiYWNrLmNhbGwodGhhdCwgbm9kZSwgKytpbmRleCwgdGhpcykpIHtcbiAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaEFmdGVyKGZ1bmN0aW9uKG5vZGUpIHtcbiAgICB2YXIgc3VtID0gK3ZhbHVlKG5vZGUuZGF0YSkgfHwgMCxcbiAgICAgICAgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuLFxuICAgICAgICBpID0gY2hpbGRyZW4gJiYgY2hpbGRyZW4ubGVuZ3RoO1xuICAgIHdoaWxlICgtLWkgPj0gMCkgc3VtICs9IGNoaWxkcmVuW2ldLnZhbHVlO1xuICAgIG5vZGUudmFsdWUgPSBzdW07XG4gIH0pO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY29tcGFyZSkge1xuICByZXR1cm4gdGhpcy5lYWNoQmVmb3JlKGZ1bmN0aW9uKG5vZGUpIHtcbiAgICBpZiAobm9kZS5jaGlsZHJlbikge1xuICAgICAgbm9kZS5jaGlsZHJlbi5zb3J0KGNvbXBhcmUpO1xuICAgIH1cbiAgfSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihlbmQpIHtcbiAgdmFyIHN0YXJ0ID0gdGhpcyxcbiAgICAgIGFuY2VzdG9yID0gbGVhc3RDb21tb25BbmNlc3RvcihzdGFydCwgZW5kKSxcbiAgICAgIG5vZGVzID0gW3N0YXJ0XTtcbiAgd2hpbGUgKHN0YXJ0ICE9PSBhbmNlc3Rvcikge1xuICAgIHN0YXJ0ID0gc3RhcnQucGFyZW50O1xuICAgIG5vZGVzLnB1c2goc3RhcnQpO1xuICB9XG4gIHZhciBrID0gbm9kZXMubGVuZ3RoO1xuICB3aGlsZSAoZW5kICE9PSBhbmNlc3Rvcikge1xuICAgIG5vZGVzLnNwbGljZShrLCAwLCBlbmQpO1xuICAgIGVuZCA9IGVuZC5wYXJlbnQ7XG4gIH1cbiAgcmV0dXJuIG5vZGVzO1xufVxuXG5mdW5jdGlvbiBsZWFzdENvbW1vbkFuY2VzdG9yKGEsIGIpIHtcbiAgaWYgKGEgPT09IGIpIHJldHVybiBhO1xuICB2YXIgYU5vZGVzID0gYS5hbmNlc3RvcnMoKSxcbiAgICAgIGJOb2RlcyA9IGIuYW5jZXN0b3JzKCksXG4gICAgICBjID0gbnVsbDtcbiAgYSA9IGFOb2Rlcy5wb3AoKTtcbiAgYiA9IGJOb2Rlcy5wb3AoKTtcbiAgd2hpbGUgKGEgPT09IGIpIHtcbiAgICBjID0gYTtcbiAgICBhID0gYU5vZGVzLnBvcCgpO1xuICAgIGIgPSBiTm9kZXMucG9wKCk7XG4gIH1cbiAgcmV0dXJuIGM7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIG5vZGUgPSB0aGlzLCBub2RlcyA9IFtub2RlXTtcbiAgd2hpbGUgKG5vZGUgPSBub2RlLnBhcmVudCkge1xuICAgIG5vZGVzLnB1c2gobm9kZSk7XG4gIH1cbiAgcmV0dXJuIG5vZGVzO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBBcnJheS5mcm9tKHRoaXMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBsZWF2ZXMgPSBbXTtcbiAgdGhpcy5lYWNoQmVmb3JlKGZ1bmN0aW9uKG5vZGUpIHtcbiAgICBpZiAoIW5vZGUuY2hpbGRyZW4pIHtcbiAgICAgIGxlYXZlcy5wdXNoKG5vZGUpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBsZWF2ZXM7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIHJvb3QgPSB0aGlzLCBsaW5rcyA9IFtdO1xuICByb290LmVhY2goZnVuY3Rpb24obm9kZSkge1xuICAgIGlmIChub2RlICE9PSByb290KSB7IC8vIERvbuKAmXQgaW5jbHVkZSB0aGUgcm9vdOKAmXMgcGFyZW50LCBpZiBhbnkuXG4gICAgICBsaW5rcy5wdXNoKHtzb3VyY2U6IG5vZGUucGFyZW50LCB0YXJnZXQ6IG5vZGV9KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gbGlua3M7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiooKSB7XG4gIHZhciBub2RlID0gdGhpcywgY3VycmVudCwgbmV4dCA9IFtub2RlXSwgY2hpbGRyZW4sIGksIG47XG4gIGRvIHtcbiAgICBjdXJyZW50ID0gbmV4dC5yZXZlcnNlKCksIG5leHQgPSBbXTtcbiAgICB3aGlsZSAobm9kZSA9IGN1cnJlbnQucG9wKCkpIHtcbiAgICAgIHlpZWxkIG5vZGU7XG4gICAgICBpZiAoY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgIGZvciAoaSA9IDAsIG4gPSBjaGlsZHJlbi5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgICBuZXh0LnB1c2goY2hpbGRyZW5baV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IHdoaWxlIChuZXh0Lmxlbmd0aCk7XG59XG4iLCJpbXBvcnQgbm9kZV9jb3VudCBmcm9tIFwiLi9jb3VudC5qc1wiO1xuaW1wb3J0IG5vZGVfZWFjaCBmcm9tIFwiLi9lYWNoLmpzXCI7XG5pbXBvcnQgbm9kZV9lYWNoQmVmb3JlIGZyb20gXCIuL2VhY2hCZWZvcmUuanNcIjtcbmltcG9ydCBub2RlX2VhY2hBZnRlciBmcm9tIFwiLi9lYWNoQWZ0ZXIuanNcIjtcbmltcG9ydCBub2RlX2ZpbmQgZnJvbSBcIi4vZmluZC5qc1wiO1xuaW1wb3J0IG5vZGVfc3VtIGZyb20gXCIuL3N1bS5qc1wiO1xuaW1wb3J0IG5vZGVfc29ydCBmcm9tIFwiLi9zb3J0LmpzXCI7XG5pbXBvcnQgbm9kZV9wYXRoIGZyb20gXCIuL3BhdGguanNcIjtcbmltcG9ydCBub2RlX2FuY2VzdG9ycyBmcm9tIFwiLi9hbmNlc3RvcnMuanNcIjtcbmltcG9ydCBub2RlX2Rlc2NlbmRhbnRzIGZyb20gXCIuL2Rlc2NlbmRhbnRzLmpzXCI7XG5pbXBvcnQgbm9kZV9sZWF2ZXMgZnJvbSBcIi4vbGVhdmVzLmpzXCI7XG5pbXBvcnQgbm9kZV9saW5rcyBmcm9tIFwiLi9saW5rcy5qc1wiO1xuaW1wb3J0IG5vZGVfaXRlcmF0b3IgZnJvbSBcIi4vaXRlcmF0b3IuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaGllcmFyY2h5KGRhdGEsIGNoaWxkcmVuKSB7XG4gIGlmIChkYXRhIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgZGF0YSA9IFt1bmRlZmluZWQsIGRhdGFdO1xuICAgIGlmIChjaGlsZHJlbiA9PT0gdW5kZWZpbmVkKSBjaGlsZHJlbiA9IG1hcENoaWxkcmVuO1xuICB9IGVsc2UgaWYgKGNoaWxkcmVuID09PSB1bmRlZmluZWQpIHtcbiAgICBjaGlsZHJlbiA9IG9iamVjdENoaWxkcmVuO1xuICB9XG5cbiAgdmFyIHJvb3QgPSBuZXcgTm9kZShkYXRhKSxcbiAgICAgIG5vZGUsXG4gICAgICBub2RlcyA9IFtyb290XSxcbiAgICAgIGNoaWxkLFxuICAgICAgY2hpbGRzLFxuICAgICAgaSxcbiAgICAgIG47XG5cbiAgd2hpbGUgKG5vZGUgPSBub2Rlcy5wb3AoKSkge1xuICAgIGlmICgoY2hpbGRzID0gY2hpbGRyZW4obm9kZS5kYXRhKSkgJiYgKG4gPSAoY2hpbGRzID0gQXJyYXkuZnJvbShjaGlsZHMpKS5sZW5ndGgpKSB7XG4gICAgICBub2RlLmNoaWxkcmVuID0gY2hpbGRzO1xuICAgICAgZm9yIChpID0gbiAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIG5vZGVzLnB1c2goY2hpbGQgPSBjaGlsZHNbaV0gPSBuZXcgTm9kZShjaGlsZHNbaV0pKTtcbiAgICAgICAgY2hpbGQucGFyZW50ID0gbm9kZTtcbiAgICAgICAgY2hpbGQuZGVwdGggPSBub2RlLmRlcHRoICsgMTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gcm9vdC5lYWNoQmVmb3JlKGNvbXB1dGVIZWlnaHQpO1xufVxuXG5mdW5jdGlvbiBub2RlX2NvcHkoKSB7XG4gIHJldHVybiBoaWVyYXJjaHkodGhpcykuZWFjaEJlZm9yZShjb3B5RGF0YSk7XG59XG5cbmZ1bmN0aW9uIG9iamVjdENoaWxkcmVuKGQpIHtcbiAgcmV0dXJuIGQuY2hpbGRyZW47XG59XG5cbmZ1bmN0aW9uIG1hcENoaWxkcmVuKGQpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoZCkgPyBkWzFdIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gY29weURhdGEobm9kZSkge1xuICBpZiAobm9kZS5kYXRhLnZhbHVlICE9PSB1bmRlZmluZWQpIG5vZGUudmFsdWUgPSBub2RlLmRhdGEudmFsdWU7XG4gIG5vZGUuZGF0YSA9IG5vZGUuZGF0YS5kYXRhO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZUhlaWdodChub2RlKSB7XG4gIHZhciBoZWlnaHQgPSAwO1xuICBkbyBub2RlLmhlaWdodCA9IGhlaWdodDtcbiAgd2hpbGUgKChub2RlID0gbm9kZS5wYXJlbnQpICYmIChub2RlLmhlaWdodCA8ICsraGVpZ2h0KSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBOb2RlKGRhdGEpIHtcbiAgdGhpcy5kYXRhID0gZGF0YTtcbiAgdGhpcy5kZXB0aCA9XG4gIHRoaXMuaGVpZ2h0ID0gMDtcbiAgdGhpcy5wYXJlbnQgPSBudWxsO1xufVxuXG5Ob2RlLnByb3RvdHlwZSA9IGhpZXJhcmNoeS5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBOb2RlLFxuICBjb3VudDogbm9kZV9jb3VudCxcbiAgZWFjaDogbm9kZV9lYWNoLFxuICBlYWNoQWZ0ZXI6IG5vZGVfZWFjaEFmdGVyLFxuICBlYWNoQmVmb3JlOiBub2RlX2VhY2hCZWZvcmUsXG4gIGZpbmQ6IG5vZGVfZmluZCxcbiAgc3VtOiBub2RlX3N1bSxcbiAgc29ydDogbm9kZV9zb3J0LFxuICBwYXRoOiBub2RlX3BhdGgsXG4gIGFuY2VzdG9yczogbm9kZV9hbmNlc3RvcnMsXG4gIGRlc2NlbmRhbnRzOiBub2RlX2Rlc2NlbmRhbnRzLFxuICBsZWF2ZXM6IG5vZGVfbGVhdmVzLFxuICBsaW5rczogbm9kZV9saW5rcyxcbiAgY29weTogbm9kZV9jb3B5LFxuICBbU3ltYm9sLml0ZXJhdG9yXTogbm9kZV9pdGVyYXRvclxufTtcbiIsImV4cG9ydCBmdW5jdGlvbiBvcHRpb25hbChmKSB7XG4gIHJldHVybiBmID09IG51bGwgPyBudWxsIDogcmVxdWlyZWQoZik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXF1aXJlZChmKSB7XG4gIGlmICh0eXBlb2YgZiAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiBmO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGNvbnN0YW50WmVybygpIHtcbiAgcmV0dXJuIDA7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB4O1xuICB9O1xufVxuIiwiLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGluZWFyX2NvbmdydWVudGlhbF9nZW5lcmF0b3IjUGFyYW1ldGVyc19pbl9jb21tb25fdXNlXG5jb25zdCBhID0gMTY2NDUyNTtcbmNvbnN0IGMgPSAxMDEzOTA0MjIzO1xuY29uc3QgbSA9IDQyOTQ5NjcyOTY7IC8vIDJeMzJcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIGxldCBzID0gMTtcbiAgcmV0dXJuICgpID0+IChzID0gKGEgKiBzICsgYykgJSBtKSAvIG07XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih4KSB7XG4gIHJldHVybiB0eXBlb2YgeCA9PT0gXCJvYmplY3RcIiAmJiBcImxlbmd0aFwiIGluIHhcbiAgICA/IHggLy8gQXJyYXksIFR5cGVkQXJyYXksIE5vZGVMaXN0LCBhcnJheS1saWtlXG4gICAgOiBBcnJheS5mcm9tKHgpOyAvLyBNYXAsIFNldCwgaXRlcmFibGUsIHN0cmluZywgb3IgYW55dGhpbmcgZWxzZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2h1ZmZsZShhcnJheSwgcmFuZG9tKSB7XG4gIGxldCBtID0gYXJyYXkubGVuZ3RoLFxuICAgICAgdCxcbiAgICAgIGk7XG5cbiAgd2hpbGUgKG0pIHtcbiAgICBpID0gcmFuZG9tKCkgKiBtLS0gfCAwO1xuICAgIHQgPSBhcnJheVttXTtcbiAgICBhcnJheVttXSA9IGFycmF5W2ldO1xuICAgIGFycmF5W2ldID0gdDtcbiAgfVxuXG4gIHJldHVybiBhcnJheTtcbn1cbiIsImltcG9ydCB7c2h1ZmZsZX0gZnJvbSBcIi4uL2FycmF5LmpzXCI7XG5pbXBvcnQgbGNnIGZyb20gXCIuLi9sY2cuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY2lyY2xlcykge1xuICByZXR1cm4gcGFja0VuY2xvc2VSYW5kb20oY2lyY2xlcywgbGNnKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja0VuY2xvc2VSYW5kb20oY2lyY2xlcywgcmFuZG9tKSB7XG4gIHZhciBpID0gMCwgbiA9IChjaXJjbGVzID0gc2h1ZmZsZShBcnJheS5mcm9tKGNpcmNsZXMpLCByYW5kb20pKS5sZW5ndGgsIEIgPSBbXSwgcCwgZTtcblxuICB3aGlsZSAoaSA8IG4pIHtcbiAgICBwID0gY2lyY2xlc1tpXTtcbiAgICBpZiAoZSAmJiBlbmNsb3Nlc1dlYWsoZSwgcCkpICsraTtcbiAgICBlbHNlIGUgPSBlbmNsb3NlQmFzaXMoQiA9IGV4dGVuZEJhc2lzKEIsIHApKSwgaSA9IDA7XG4gIH1cblxuICByZXR1cm4gZTtcbn1cblxuZnVuY3Rpb24gZXh0ZW5kQmFzaXMoQiwgcCkge1xuICB2YXIgaSwgajtcblxuICBpZiAoZW5jbG9zZXNXZWFrQWxsKHAsIEIpKSByZXR1cm4gW3BdO1xuXG4gIC8vIElmIHdlIGdldCBoZXJlIHRoZW4gQiBtdXN0IGhhdmUgYXQgbGVhc3Qgb25lIGVsZW1lbnQuXG4gIGZvciAoaSA9IDA7IGkgPCBCLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKGVuY2xvc2VzTm90KHAsIEJbaV0pXG4gICAgICAgICYmIGVuY2xvc2VzV2Vha0FsbChlbmNsb3NlQmFzaXMyKEJbaV0sIHApLCBCKSkge1xuICAgICAgcmV0dXJuIFtCW2ldLCBwXTtcbiAgICB9XG4gIH1cblxuICAvLyBJZiB3ZSBnZXQgaGVyZSB0aGVuIEIgbXVzdCBoYXZlIGF0IGxlYXN0IHR3byBlbGVtZW50cy5cbiAgZm9yIChpID0gMDsgaSA8IEIubGVuZ3RoIC0gMTsgKytpKSB7XG4gICAgZm9yIChqID0gaSArIDE7IGogPCBCLmxlbmd0aDsgKytqKSB7XG4gICAgICBpZiAoZW5jbG9zZXNOb3QoZW5jbG9zZUJhc2lzMihCW2ldLCBCW2pdKSwgcClcbiAgICAgICAgICAmJiBlbmNsb3Nlc05vdChlbmNsb3NlQmFzaXMyKEJbaV0sIHApLCBCW2pdKVxuICAgICAgICAgICYmIGVuY2xvc2VzTm90KGVuY2xvc2VCYXNpczIoQltqXSwgcCksIEJbaV0pXG4gICAgICAgICAgJiYgZW5jbG9zZXNXZWFrQWxsKGVuY2xvc2VCYXNpczMoQltpXSwgQltqXSwgcCksIEIpKSB7XG4gICAgICAgIHJldHVybiBbQltpXSwgQltqXSwgcF07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgd2UgZ2V0IGhlcmUgdGhlbiBzb21ldGhpbmcgaXMgdmVyeSB3cm9uZy5cbiAgdGhyb3cgbmV3IEVycm9yO1xufVxuXG5mdW5jdGlvbiBlbmNsb3Nlc05vdChhLCBiKSB7XG4gIHZhciBkciA9IGEuciAtIGIuciwgZHggPSBiLnggLSBhLngsIGR5ID0gYi55IC0gYS55O1xuICByZXR1cm4gZHIgPCAwIHx8IGRyICogZHIgPCBkeCAqIGR4ICsgZHkgKiBkeTtcbn1cblxuZnVuY3Rpb24gZW5jbG9zZXNXZWFrKGEsIGIpIHtcbiAgdmFyIGRyID0gYS5yIC0gYi5yICsgTWF0aC5tYXgoYS5yLCBiLnIsIDEpICogMWUtOSwgZHggPSBiLnggLSBhLngsIGR5ID0gYi55IC0gYS55O1xuICByZXR1cm4gZHIgPiAwICYmIGRyICogZHIgPiBkeCAqIGR4ICsgZHkgKiBkeTtcbn1cblxuZnVuY3Rpb24gZW5jbG9zZXNXZWFrQWxsKGEsIEIpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBCLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKCFlbmNsb3Nlc1dlYWsoYSwgQltpXSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGVuY2xvc2VCYXNpcyhCKSB7XG4gIHN3aXRjaCAoQi5sZW5ndGgpIHtcbiAgICBjYXNlIDE6IHJldHVybiBlbmNsb3NlQmFzaXMxKEJbMF0pO1xuICAgIGNhc2UgMjogcmV0dXJuIGVuY2xvc2VCYXNpczIoQlswXSwgQlsxXSk7XG4gICAgY2FzZSAzOiByZXR1cm4gZW5jbG9zZUJhc2lzMyhCWzBdLCBCWzFdLCBCWzJdKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbmNsb3NlQmFzaXMxKGEpIHtcbiAgcmV0dXJuIHtcbiAgICB4OiBhLngsXG4gICAgeTogYS55LFxuICAgIHI6IGEuclxuICB9O1xufVxuXG5mdW5jdGlvbiBlbmNsb3NlQmFzaXMyKGEsIGIpIHtcbiAgdmFyIHgxID0gYS54LCB5MSA9IGEueSwgcjEgPSBhLnIsXG4gICAgICB4MiA9IGIueCwgeTIgPSBiLnksIHIyID0gYi5yLFxuICAgICAgeDIxID0geDIgLSB4MSwgeTIxID0geTIgLSB5MSwgcjIxID0gcjIgLSByMSxcbiAgICAgIGwgPSBNYXRoLnNxcnQoeDIxICogeDIxICsgeTIxICogeTIxKTtcbiAgcmV0dXJuIHtcbiAgICB4OiAoeDEgKyB4MiArIHgyMSAvIGwgKiByMjEpIC8gMixcbiAgICB5OiAoeTEgKyB5MiArIHkyMSAvIGwgKiByMjEpIC8gMixcbiAgICByOiAobCArIHIxICsgcjIpIC8gMlxuICB9O1xufVxuXG5mdW5jdGlvbiBlbmNsb3NlQmFzaXMzKGEsIGIsIGMpIHtcbiAgdmFyIHgxID0gYS54LCB5MSA9IGEueSwgcjEgPSBhLnIsXG4gICAgICB4MiA9IGIueCwgeTIgPSBiLnksIHIyID0gYi5yLFxuICAgICAgeDMgPSBjLngsIHkzID0gYy55LCByMyA9IGMucixcbiAgICAgIGEyID0geDEgLSB4MixcbiAgICAgIGEzID0geDEgLSB4MyxcbiAgICAgIGIyID0geTEgLSB5MixcbiAgICAgIGIzID0geTEgLSB5MyxcbiAgICAgIGMyID0gcjIgLSByMSxcbiAgICAgIGMzID0gcjMgLSByMSxcbiAgICAgIGQxID0geDEgKiB4MSArIHkxICogeTEgLSByMSAqIHIxLFxuICAgICAgZDIgPSBkMSAtIHgyICogeDIgLSB5MiAqIHkyICsgcjIgKiByMixcbiAgICAgIGQzID0gZDEgLSB4MyAqIHgzIC0geTMgKiB5MyArIHIzICogcjMsXG4gICAgICBhYiA9IGEzICogYjIgLSBhMiAqIGIzLFxuICAgICAgeGEgPSAoYjIgKiBkMyAtIGIzICogZDIpIC8gKGFiICogMikgLSB4MSxcbiAgICAgIHhiID0gKGIzICogYzIgLSBiMiAqIGMzKSAvIGFiLFxuICAgICAgeWEgPSAoYTMgKiBkMiAtIGEyICogZDMpIC8gKGFiICogMikgLSB5MSxcbiAgICAgIHliID0gKGEyICogYzMgLSBhMyAqIGMyKSAvIGFiLFxuICAgICAgQSA9IHhiICogeGIgKyB5YiAqIHliIC0gMSxcbiAgICAgIEIgPSAyICogKHIxICsgeGEgKiB4YiArIHlhICogeWIpLFxuICAgICAgQyA9IHhhICogeGEgKyB5YSAqIHlhIC0gcjEgKiByMSxcbiAgICAgIHIgPSAtKE1hdGguYWJzKEEpID4gMWUtNiA/IChCICsgTWF0aC5zcXJ0KEIgKiBCIC0gNCAqIEEgKiBDKSkgLyAoMiAqIEEpIDogQyAvIEIpO1xuICByZXR1cm4ge1xuICAgIHg6IHgxICsgeGEgKyB4YiAqIHIsXG4gICAgeTogeTEgKyB5YSArIHliICogcixcbiAgICByOiByXG4gIH07XG59XG4iLCJpbXBvcnQgYXJyYXkgZnJvbSBcIi4uL2FycmF5LmpzXCI7XG5pbXBvcnQgbGNnIGZyb20gXCIuLi9sY2cuanNcIjtcbmltcG9ydCB7cGFja0VuY2xvc2VSYW5kb219IGZyb20gXCIuL2VuY2xvc2UuanNcIjtcblxuZnVuY3Rpb24gcGxhY2UoYiwgYSwgYykge1xuICB2YXIgZHggPSBiLnggLSBhLngsIHgsIGEyLFxuICAgICAgZHkgPSBiLnkgLSBhLnksIHksIGIyLFxuICAgICAgZDIgPSBkeCAqIGR4ICsgZHkgKiBkeTtcbiAgaWYgKGQyKSB7XG4gICAgYTIgPSBhLnIgKyBjLnIsIGEyICo9IGEyO1xuICAgIGIyID0gYi5yICsgYy5yLCBiMiAqPSBiMjtcbiAgICBpZiAoYTIgPiBiMikge1xuICAgICAgeCA9IChkMiArIGIyIC0gYTIpIC8gKDIgKiBkMik7XG4gICAgICB5ID0gTWF0aC5zcXJ0KE1hdGgubWF4KDAsIGIyIC8gZDIgLSB4ICogeCkpO1xuICAgICAgYy54ID0gYi54IC0geCAqIGR4IC0geSAqIGR5O1xuICAgICAgYy55ID0gYi55IC0geCAqIGR5ICsgeSAqIGR4O1xuICAgIH0gZWxzZSB7XG4gICAgICB4ID0gKGQyICsgYTIgLSBiMikgLyAoMiAqIGQyKTtcbiAgICAgIHkgPSBNYXRoLnNxcnQoTWF0aC5tYXgoMCwgYTIgLyBkMiAtIHggKiB4KSk7XG4gICAgICBjLnggPSBhLnggKyB4ICogZHggLSB5ICogZHk7XG4gICAgICBjLnkgPSBhLnkgKyB4ICogZHkgKyB5ICogZHg7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGMueCA9IGEueCArIGMucjtcbiAgICBjLnkgPSBhLnk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW50ZXJzZWN0cyhhLCBiKSB7XG4gIHZhciBkciA9IGEuciArIGIuciAtIDFlLTYsIGR4ID0gYi54IC0gYS54LCBkeSA9IGIueSAtIGEueTtcbiAgcmV0dXJuIGRyID4gMCAmJiBkciAqIGRyID4gZHggKiBkeCArIGR5ICogZHk7XG59XG5cbmZ1bmN0aW9uIHNjb3JlKG5vZGUpIHtcbiAgdmFyIGEgPSBub2RlLl8sXG4gICAgICBiID0gbm9kZS5uZXh0Ll8sXG4gICAgICBhYiA9IGEuciArIGIucixcbiAgICAgIGR4ID0gKGEueCAqIGIuciArIGIueCAqIGEucikgLyBhYixcbiAgICAgIGR5ID0gKGEueSAqIGIuciArIGIueSAqIGEucikgLyBhYjtcbiAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xufVxuXG5mdW5jdGlvbiBOb2RlKGNpcmNsZSkge1xuICB0aGlzLl8gPSBjaXJjbGU7XG4gIHRoaXMubmV4dCA9IG51bGw7XG4gIHRoaXMucHJldmlvdXMgPSBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja1NpYmxpbmdzUmFuZG9tKGNpcmNsZXMsIHJhbmRvbSkge1xuICBpZiAoIShuID0gKGNpcmNsZXMgPSBhcnJheShjaXJjbGVzKSkubGVuZ3RoKSkgcmV0dXJuIDA7XG5cbiAgdmFyIGEsIGIsIGMsIG4sIGFhLCBjYSwgaSwgaiwgaywgc2osIHNrO1xuXG4gIC8vIFBsYWNlIHRoZSBmaXJzdCBjaXJjbGUuXG4gIGEgPSBjaXJjbGVzWzBdLCBhLnggPSAwLCBhLnkgPSAwO1xuICBpZiAoIShuID4gMSkpIHJldHVybiBhLnI7XG5cbiAgLy8gUGxhY2UgdGhlIHNlY29uZCBjaXJjbGUuXG4gIGIgPSBjaXJjbGVzWzFdLCBhLnggPSAtYi5yLCBiLnggPSBhLnIsIGIueSA9IDA7XG4gIGlmICghKG4gPiAyKSkgcmV0dXJuIGEuciArIGIucjtcblxuICAvLyBQbGFjZSB0aGUgdGhpcmQgY2lyY2xlLlxuICBwbGFjZShiLCBhLCBjID0gY2lyY2xlc1syXSk7XG5cbiAgLy8gSW5pdGlhbGl6ZSB0aGUgZnJvbnQtY2hhaW4gdXNpbmcgdGhlIGZpcnN0IHRocmVlIGNpcmNsZXMgYSwgYiBhbmQgYy5cbiAgYSA9IG5ldyBOb2RlKGEpLCBiID0gbmV3IE5vZGUoYiksIGMgPSBuZXcgTm9kZShjKTtcbiAgYS5uZXh0ID0gYy5wcmV2aW91cyA9IGI7XG4gIGIubmV4dCA9IGEucHJldmlvdXMgPSBjO1xuICBjLm5leHQgPSBiLnByZXZpb3VzID0gYTtcblxuICAvLyBBdHRlbXB0IHRvIHBsYWNlIGVhY2ggcmVtYWluaW5nIGNpcmNsZeKAplxuICBwYWNrOiBmb3IgKGkgPSAzOyBpIDwgbjsgKytpKSB7XG4gICAgcGxhY2UoYS5fLCBiLl8sIGMgPSBjaXJjbGVzW2ldKSwgYyA9IG5ldyBOb2RlKGMpO1xuXG4gICAgLy8gRmluZCB0aGUgY2xvc2VzdCBpbnRlcnNlY3RpbmcgY2lyY2xlIG9uIHRoZSBmcm9udC1jaGFpbiwgaWYgYW55LlxuICAgIC8vIOKAnENsb3NlbmVzc+KAnSBpcyBkZXRlcm1pbmVkIGJ5IGxpbmVhciBkaXN0YW5jZSBhbG9uZyB0aGUgZnJvbnQtY2hhaW4uXG4gICAgLy8g4oCcQWhlYWTigJ0gb3Ig4oCcYmVoaW5k4oCdIGlzIGxpa2V3aXNlIGRldGVybWluZWQgYnkgbGluZWFyIGRpc3RhbmNlLlxuICAgIGogPSBiLm5leHQsIGsgPSBhLnByZXZpb3VzLCBzaiA9IGIuXy5yLCBzayA9IGEuXy5yO1xuICAgIGRvIHtcbiAgICAgIGlmIChzaiA8PSBzaykge1xuICAgICAgICBpZiAoaW50ZXJzZWN0cyhqLl8sIGMuXykpIHtcbiAgICAgICAgICBiID0gaiwgYS5uZXh0ID0gYiwgYi5wcmV2aW91cyA9IGEsIC0taTtcbiAgICAgICAgICBjb250aW51ZSBwYWNrO1xuICAgICAgICB9XG4gICAgICAgIHNqICs9IGouXy5yLCBqID0gai5uZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGludGVyc2VjdHMoay5fLCBjLl8pKSB7XG4gICAgICAgICAgYSA9IGssIGEubmV4dCA9IGIsIGIucHJldmlvdXMgPSBhLCAtLWk7XG4gICAgICAgICAgY29udGludWUgcGFjaztcbiAgICAgICAgfVxuICAgICAgICBzayArPSBrLl8uciwgayA9IGsucHJldmlvdXM7XG4gICAgICB9XG4gICAgfSB3aGlsZSAoaiAhPT0gay5uZXh0KTtcblxuICAgIC8vIFN1Y2Nlc3MhIEluc2VydCB0aGUgbmV3IGNpcmNsZSBjIGJldHdlZW4gYSBhbmQgYi5cbiAgICBjLnByZXZpb3VzID0gYSwgYy5uZXh0ID0gYiwgYS5uZXh0ID0gYi5wcmV2aW91cyA9IGIgPSBjO1xuXG4gICAgLy8gQ29tcHV0ZSB0aGUgbmV3IGNsb3Nlc3QgY2lyY2xlIHBhaXIgdG8gdGhlIGNlbnRyb2lkLlxuICAgIGFhID0gc2NvcmUoYSk7XG4gICAgd2hpbGUgKChjID0gYy5uZXh0KSAhPT0gYikge1xuICAgICAgaWYgKChjYSA9IHNjb3JlKGMpKSA8IGFhKSB7XG4gICAgICAgIGEgPSBjLCBhYSA9IGNhO1xuICAgICAgfVxuICAgIH1cbiAgICBiID0gYS5uZXh0O1xuICB9XG5cbiAgLy8gQ29tcHV0ZSB0aGUgZW5jbG9zaW5nIGNpcmNsZSBvZiB0aGUgZnJvbnQgY2hhaW4uXG4gIGEgPSBbYi5fXSwgYyA9IGI7IHdoaWxlICgoYyA9IGMubmV4dCkgIT09IGIpIGEucHVzaChjLl8pOyBjID0gcGFja0VuY2xvc2VSYW5kb20oYSwgcmFuZG9tKTtcblxuICAvLyBUcmFuc2xhdGUgdGhlIGNpcmNsZXMgdG8gcHV0IHRoZSBlbmNsb3NpbmcgY2lyY2xlIGFyb3VuZCB0aGUgb3JpZ2luLlxuICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSBhID0gY2lyY2xlc1tpXSwgYS54IC09IGMueCwgYS55IC09IGMueTtcblxuICByZXR1cm4gYy5yO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjaXJjbGVzKSB7XG4gIHBhY2tTaWJsaW5nc1JhbmRvbShjaXJjbGVzLCBsY2coKSk7XG4gIHJldHVybiBjaXJjbGVzO1xufVxuIiwiaW1wb3J0IHtvcHRpb25hbH0gZnJvbSBcIi4uL2FjY2Vzc29ycy5qc1wiO1xuaW1wb3J0IGNvbnN0YW50LCB7Y29uc3RhbnRaZXJvfSBmcm9tIFwiLi4vY29uc3RhbnQuanNcIjtcbmltcG9ydCBsY2cgZnJvbSBcIi4uL2xjZy5qc1wiO1xuaW1wb3J0IHtwYWNrU2libGluZ3NSYW5kb219IGZyb20gXCIuL3NpYmxpbmdzLmpzXCI7XG5cbmZ1bmN0aW9uIGRlZmF1bHRSYWRpdXMoZCkge1xuICByZXR1cm4gTWF0aC5zcXJ0KGQudmFsdWUpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIHJhZGl1cyA9IG51bGwsXG4gICAgICBkeCA9IDEsXG4gICAgICBkeSA9IDEsXG4gICAgICBwYWRkaW5nID0gY29uc3RhbnRaZXJvO1xuXG4gIGZ1bmN0aW9uIHBhY2socm9vdCkge1xuICAgIGNvbnN0IHJhbmRvbSA9IGxjZygpO1xuICAgIHJvb3QueCA9IGR4IC8gMiwgcm9vdC55ID0gZHkgLyAyO1xuICAgIGlmIChyYWRpdXMpIHtcbiAgICAgIHJvb3QuZWFjaEJlZm9yZShyYWRpdXNMZWFmKHJhZGl1cykpXG4gICAgICAgICAgLmVhY2hBZnRlcihwYWNrQ2hpbGRyZW5SYW5kb20ocGFkZGluZywgMC41LCByYW5kb20pKVxuICAgICAgICAgIC5lYWNoQmVmb3JlKHRyYW5zbGF0ZUNoaWxkKDEpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcm9vdC5lYWNoQmVmb3JlKHJhZGl1c0xlYWYoZGVmYXVsdFJhZGl1cykpXG4gICAgICAgICAgLmVhY2hBZnRlcihwYWNrQ2hpbGRyZW5SYW5kb20oY29uc3RhbnRaZXJvLCAxLCByYW5kb20pKVxuICAgICAgICAgIC5lYWNoQWZ0ZXIocGFja0NoaWxkcmVuUmFuZG9tKHBhZGRpbmcsIHJvb3QuciAvIE1hdGgubWluKGR4LCBkeSksIHJhbmRvbSkpXG4gICAgICAgICAgLmVhY2hCZWZvcmUodHJhbnNsYXRlQ2hpbGQoTWF0aC5taW4oZHgsIGR5KSAvICgyICogcm9vdC5yKSkpO1xuICAgIH1cbiAgICByZXR1cm4gcm9vdDtcbiAgfVxuXG4gIHBhY2sucmFkaXVzID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHJhZGl1cyA9IG9wdGlvbmFsKHgpLCBwYWNrKSA6IHJhZGl1cztcbiAgfTtcblxuICBwYWNrLnNpemUgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZHggPSAreFswXSwgZHkgPSAreFsxXSwgcGFjaykgOiBbZHgsIGR5XTtcbiAgfTtcblxuICBwYWNrLnBhZGRpbmcgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocGFkZGluZyA9IHR5cGVvZiB4ID09PSBcImZ1bmN0aW9uXCIgPyB4IDogY29uc3RhbnQoK3gpLCBwYWNrKSA6IHBhZGRpbmc7XG4gIH07XG5cbiAgcmV0dXJuIHBhY2s7XG59XG5cbmZ1bmN0aW9uIHJhZGl1c0xlYWYocmFkaXVzKSB7XG4gIHJldHVybiBmdW5jdGlvbihub2RlKSB7XG4gICAgaWYgKCFub2RlLmNoaWxkcmVuKSB7XG4gICAgICBub2RlLnIgPSBNYXRoLm1heCgwLCArcmFkaXVzKG5vZGUpIHx8IDApO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gcGFja0NoaWxkcmVuUmFuZG9tKHBhZGRpbmcsIGssIHJhbmRvbSkge1xuICByZXR1cm4gZnVuY3Rpb24obm9kZSkge1xuICAgIGlmIChjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgIHZhciBjaGlsZHJlbixcbiAgICAgICAgICBpLFxuICAgICAgICAgIG4gPSBjaGlsZHJlbi5sZW5ndGgsXG4gICAgICAgICAgciA9IHBhZGRpbmcobm9kZSkgKiBrIHx8IDAsXG4gICAgICAgICAgZTtcblxuICAgICAgaWYgKHIpIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIGNoaWxkcmVuW2ldLnIgKz0gcjtcbiAgICAgIGUgPSBwYWNrU2libGluZ3NSYW5kb20oY2hpbGRyZW4sIHJhbmRvbSk7XG4gICAgICBpZiAocikgZm9yIChpID0gMDsgaSA8IG47ICsraSkgY2hpbGRyZW5baV0uciAtPSByO1xuICAgICAgbm9kZS5yID0gZSArIHI7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiB0cmFuc2xhdGVDaGlsZChrKSB7XG4gIHJldHVybiBmdW5jdGlvbihub2RlKSB7XG4gICAgdmFyIHBhcmVudCA9IG5vZGUucGFyZW50O1xuICAgIG5vZGUuciAqPSBrO1xuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgIG5vZGUueCA9IHBhcmVudC54ICsgayAqIG5vZGUueDtcbiAgICAgIG5vZGUueSA9IHBhcmVudC55ICsgayAqIG5vZGUueTtcbiAgICB9XG4gIH07XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihub2RlKSB7XG4gIG5vZGUueDAgPSBNYXRoLnJvdW5kKG5vZGUueDApO1xuICBub2RlLnkwID0gTWF0aC5yb3VuZChub2RlLnkwKTtcbiAgbm9kZS54MSA9IE1hdGgucm91bmQobm9kZS54MSk7XG4gIG5vZGUueTEgPSBNYXRoLnJvdW5kKG5vZGUueTEpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocGFyZW50LCB4MCwgeTAsIHgxLCB5MSkge1xuICB2YXIgbm9kZXMgPSBwYXJlbnQuY2hpbGRyZW4sXG4gICAgICBub2RlLFxuICAgICAgaSA9IC0xLFxuICAgICAgbiA9IG5vZGVzLmxlbmd0aCxcbiAgICAgIGsgPSBwYXJlbnQudmFsdWUgJiYgKHgxIC0geDApIC8gcGFyZW50LnZhbHVlO1xuXG4gIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgbm9kZSA9IG5vZGVzW2ldLCBub2RlLnkwID0geTAsIG5vZGUueTEgPSB5MTtcbiAgICBub2RlLngwID0geDAsIG5vZGUueDEgPSB4MCArPSBub2RlLnZhbHVlICogaztcbiAgfVxufVxuIiwiaW1wb3J0IHJvdW5kTm9kZSBmcm9tIFwiLi90cmVlbWFwL3JvdW5kLmpzXCI7XG5pbXBvcnQgdHJlZW1hcERpY2UgZnJvbSBcIi4vdHJlZW1hcC9kaWNlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgZHggPSAxLFxuICAgICAgZHkgPSAxLFxuICAgICAgcGFkZGluZyA9IDAsXG4gICAgICByb3VuZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIHBhcnRpdGlvbihyb290KSB7XG4gICAgdmFyIG4gPSByb290LmhlaWdodCArIDE7XG4gICAgcm9vdC54MCA9XG4gICAgcm9vdC55MCA9IHBhZGRpbmc7XG4gICAgcm9vdC54MSA9IGR4O1xuICAgIHJvb3QueTEgPSBkeSAvIG47XG4gICAgcm9vdC5lYWNoQmVmb3JlKHBvc2l0aW9uTm9kZShkeSwgbikpO1xuICAgIGlmIChyb3VuZCkgcm9vdC5lYWNoQmVmb3JlKHJvdW5kTm9kZSk7XG4gICAgcmV0dXJuIHJvb3Q7XG4gIH1cblxuICBmdW5jdGlvbiBwb3NpdGlvbk5vZGUoZHksIG4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24obm9kZSkge1xuICAgICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgdHJlZW1hcERpY2Uobm9kZSwgbm9kZS54MCwgZHkgKiAobm9kZS5kZXB0aCArIDEpIC8gbiwgbm9kZS54MSwgZHkgKiAobm9kZS5kZXB0aCArIDIpIC8gbik7XG4gICAgICB9XG4gICAgICB2YXIgeDAgPSBub2RlLngwLFxuICAgICAgICAgIHkwID0gbm9kZS55MCxcbiAgICAgICAgICB4MSA9IG5vZGUueDEgLSBwYWRkaW5nLFxuICAgICAgICAgIHkxID0gbm9kZS55MSAtIHBhZGRpbmc7XG4gICAgICBpZiAoeDEgPCB4MCkgeDAgPSB4MSA9ICh4MCArIHgxKSAvIDI7XG4gICAgICBpZiAoeTEgPCB5MCkgeTAgPSB5MSA9ICh5MCArIHkxKSAvIDI7XG4gICAgICBub2RlLngwID0geDA7XG4gICAgICBub2RlLnkwID0geTA7XG4gICAgICBub2RlLngxID0geDE7XG4gICAgICBub2RlLnkxID0geTE7XG4gICAgfTtcbiAgfVxuXG4gIHBhcnRpdGlvbi5yb3VuZCA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChyb3VuZCA9ICEheCwgcGFydGl0aW9uKSA6IHJvdW5kO1xuICB9O1xuXG4gIHBhcnRpdGlvbi5zaXplID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGR4ID0gK3hbMF0sIGR5ID0gK3hbMV0sIHBhcnRpdGlvbikgOiBbZHgsIGR5XTtcbiAgfTtcblxuICBwYXJ0aXRpb24ucGFkZGluZyA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwYWRkaW5nID0gK3gsIHBhcnRpdGlvbikgOiBwYWRkaW5nO1xuICB9O1xuXG4gIHJldHVybiBwYXJ0aXRpb247XG59XG4iLCJpbXBvcnQge29wdGlvbmFsfSBmcm9tIFwiLi9hY2Nlc3NvcnMuanNcIjtcbmltcG9ydCB7Tm9kZSwgY29tcHV0ZUhlaWdodH0gZnJvbSBcIi4vaGllcmFyY2h5L2luZGV4LmpzXCI7XG5cbnZhciBwcmVyb290ID0ge2RlcHRoOiAtMX0sXG4gICAgYW1iaWd1b3VzID0ge30sXG4gICAgaW1wdXRlZCA9IHt9O1xuXG5mdW5jdGlvbiBkZWZhdWx0SWQoZCkge1xuICByZXR1cm4gZC5pZDtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdFBhcmVudElkKGQpIHtcbiAgcmV0dXJuIGQucGFyZW50SWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgaWQgPSBkZWZhdWx0SWQsXG4gICAgICBwYXJlbnRJZCA9IGRlZmF1bHRQYXJlbnRJZCxcbiAgICAgIHBhdGg7XG5cbiAgZnVuY3Rpb24gc3RyYXRpZnkoZGF0YSkge1xuICAgIHZhciBub2RlcyA9IEFycmF5LmZyb20oZGF0YSksXG4gICAgICAgIGN1cnJlbnRJZCA9IGlkLFxuICAgICAgICBjdXJyZW50UGFyZW50SWQgPSBwYXJlbnRJZCxcbiAgICAgICAgbixcbiAgICAgICAgZCxcbiAgICAgICAgaSxcbiAgICAgICAgcm9vdCxcbiAgICAgICAgcGFyZW50LFxuICAgICAgICBub2RlLFxuICAgICAgICBub2RlSWQsXG4gICAgICAgIG5vZGVLZXksXG4gICAgICAgIG5vZGVCeUtleSA9IG5ldyBNYXA7XG5cbiAgICBpZiAocGF0aCAhPSBudWxsKSB7XG4gICAgICBjb25zdCBJID0gbm9kZXMubWFwKChkLCBpKSA9PiBub3JtYWxpemUocGF0aChkLCBpLCBkYXRhKSkpO1xuICAgICAgY29uc3QgUCA9IEkubWFwKHBhcmVudG9mKTtcbiAgICAgIGNvbnN0IFMgPSBuZXcgU2V0KEkpLmFkZChcIlwiKTtcbiAgICAgIGZvciAoY29uc3QgaSBvZiBQKSB7XG4gICAgICAgIGlmICghUy5oYXMoaSkpIHtcbiAgICAgICAgICBTLmFkZChpKTtcbiAgICAgICAgICBJLnB1c2goaSk7XG4gICAgICAgICAgUC5wdXNoKHBhcmVudG9mKGkpKTtcbiAgICAgICAgICBub2Rlcy5wdXNoKGltcHV0ZWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjdXJyZW50SWQgPSAoXywgaSkgPT4gSVtpXTtcbiAgICAgIGN1cnJlbnRQYXJlbnRJZCA9IChfLCBpKSA9PiBQW2ldO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDAsIG4gPSBub2Rlcy5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgIGQgPSBub2Rlc1tpXSwgbm9kZSA9IG5vZGVzW2ldID0gbmV3IE5vZGUoZCk7XG4gICAgICBpZiAoKG5vZGVJZCA9IGN1cnJlbnRJZChkLCBpLCBkYXRhKSkgIT0gbnVsbCAmJiAobm9kZUlkICs9IFwiXCIpKSB7XG4gICAgICAgIG5vZGVLZXkgPSBub2RlLmlkID0gbm9kZUlkO1xuICAgICAgICBub2RlQnlLZXkuc2V0KG5vZGVLZXksIG5vZGVCeUtleS5oYXMobm9kZUtleSkgPyBhbWJpZ3VvdXMgOiBub2RlKTtcbiAgICAgIH1cbiAgICAgIGlmICgobm9kZUlkID0gY3VycmVudFBhcmVudElkKGQsIGksIGRhdGEpKSAhPSBudWxsICYmIChub2RlSWQgKz0gXCJcIikpIHtcbiAgICAgICAgbm9kZS5wYXJlbnQgPSBub2RlSWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgaWYgKG5vZGVJZCA9IG5vZGUucGFyZW50KSB7XG4gICAgICAgIHBhcmVudCA9IG5vZGVCeUtleS5nZXQobm9kZUlkKTtcbiAgICAgICAgaWYgKCFwYXJlbnQpIHRocm93IG5ldyBFcnJvcihcIm1pc3Npbmc6IFwiICsgbm9kZUlkKTtcbiAgICAgICAgaWYgKHBhcmVudCA9PT0gYW1iaWd1b3VzKSB0aHJvdyBuZXcgRXJyb3IoXCJhbWJpZ3VvdXM6IFwiICsgbm9kZUlkKTtcbiAgICAgICAgaWYgKHBhcmVudC5jaGlsZHJlbikgcGFyZW50LmNoaWxkcmVuLnB1c2gobm9kZSk7XG4gICAgICAgIGVsc2UgcGFyZW50LmNoaWxkcmVuID0gW25vZGVdO1xuICAgICAgICBub2RlLnBhcmVudCA9IHBhcmVudDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChyb290KSB0aHJvdyBuZXcgRXJyb3IoXCJtdWx0aXBsZSByb290c1wiKTtcbiAgICAgICAgcm9vdCA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFyb290KSB0aHJvdyBuZXcgRXJyb3IoXCJubyByb290XCIpO1xuXG4gICAgLy8gV2hlbiBpbXB1dGluZyBpbnRlcm5hbCBub2Rlcywgb25seSBpbnRyb2R1Y2Ugcm9vdHMgaWYgbmVlZGVkLlxuICAgIC8vIFRoZW4gcmVwbGFjZSB0aGUgaW1wdXRlZCBtYXJrZXIgZGF0YSB3aXRoIG51bGwuXG4gICAgaWYgKHBhdGggIT0gbnVsbCkge1xuICAgICAgd2hpbGUgKHJvb3QuZGF0YSA9PT0gaW1wdXRlZCAmJiByb290LmNoaWxkcmVuLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByb290ID0gcm9vdC5jaGlsZHJlblswXSwgLS1uO1xuICAgICAgfVxuICAgICAgZm9yIChsZXQgaSA9IG5vZGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgICAgaWYgKG5vZGUuZGF0YSAhPT0gaW1wdXRlZCkgYnJlYWs7XG4gICAgICAgIG5vZGUuZGF0YSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcm9vdC5wYXJlbnQgPSBwcmVyb290O1xuICAgIHJvb3QuZWFjaEJlZm9yZShmdW5jdGlvbihub2RlKSB7IG5vZGUuZGVwdGggPSBub2RlLnBhcmVudC5kZXB0aCArIDE7IC0tbjsgfSkuZWFjaEJlZm9yZShjb21wdXRlSGVpZ2h0KTtcbiAgICByb290LnBhcmVudCA9IG51bGw7XG4gICAgaWYgKG4gPiAwKSB0aHJvdyBuZXcgRXJyb3IoXCJjeWNsZVwiKTtcblxuICAgIHJldHVybiByb290O1xuICB9XG5cbiAgc3RyYXRpZnkuaWQgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoaWQgPSBvcHRpb25hbCh4KSwgc3RyYXRpZnkpIDogaWQ7XG4gIH07XG5cbiAgc3RyYXRpZnkucGFyZW50SWQgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocGFyZW50SWQgPSBvcHRpb25hbCh4KSwgc3RyYXRpZnkpIDogcGFyZW50SWQ7XG4gIH07XG5cbiAgc3RyYXRpZnkucGF0aCA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwYXRoID0gb3B0aW9uYWwoeCksIHN0cmF0aWZ5KSA6IHBhdGg7XG4gIH07XG5cbiAgcmV0dXJuIHN0cmF0aWZ5O1xufVxuXG4vLyBUbyBub3JtYWxpemUgYSBwYXRoLCB3ZSBjb2VyY2UgdG8gYSBzdHJpbmcsIHN0cmlwIHRoZSB0cmFpbGluZyBzbGFzaCBpZiBhbnlcbi8vIChhcyBsb25nIGFzIHRoZSB0cmFpbGluZyBzbGFzaCBpcyBub3QgaW1tZWRpYXRlbHkgcHJlY2VkZWQgYnkgYW5vdGhlciBzbGFzaCksXG4vLyBhbmQgYWRkIGxlYWRpbmcgc2xhc2ggaWYgbWlzc2luZy5cbmZ1bmN0aW9uIG5vcm1hbGl6ZShwYXRoKSB7XG4gIHBhdGggPSBgJHtwYXRofWA7XG4gIGxldCBpID0gcGF0aC5sZW5ndGg7XG4gIGlmIChzbGFzaChwYXRoLCBpIC0gMSkgJiYgIXNsYXNoKHBhdGgsIGkgLSAyKSkgcGF0aCA9IHBhdGguc2xpY2UoMCwgLTEpO1xuICByZXR1cm4gcGF0aFswXSA9PT0gXCIvXCIgPyBwYXRoIDogYC8ke3BhdGh9YDtcbn1cblxuLy8gV2FsayBiYWNrd2FyZHMgdG8gZmluZCB0aGUgZmlyc3Qgc2xhc2ggdGhhdCBpcyBub3QgdGhlIGxlYWRpbmcgc2xhc2gsIGUuZy46XG4vLyBcIi9mb28vYmFyXCIg4oelIFwiL2Zvb1wiLCBcIi9mb29cIiDih6UgXCIvXCIsIFwiL1wiIOKGpiBcIlwiLiAoVGhlIHJvb3QgaXMgc3BlY2lhbC1jYXNlZFxuLy8gYmVjYXVzZSB0aGUgaWQgb2YgdGhlIHJvb3QgbXVzdCBiZSBhIHRydXRoeSB2YWx1ZS4pXG5mdW5jdGlvbiBwYXJlbnRvZihwYXRoKSB7XG4gIGxldCBpID0gcGF0aC5sZW5ndGg7XG4gIGlmIChpIDwgMikgcmV0dXJuIFwiXCI7XG4gIHdoaWxlICgtLWkgPiAxKSBpZiAoc2xhc2gocGF0aCwgaSkpIGJyZWFrO1xuICByZXR1cm4gcGF0aC5zbGljZSgwLCBpKTtcbn1cblxuLy8gU2xhc2hlcyBjYW4gYmUgZXNjYXBlZDsgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBzbGFzaCBpcyBhIHBhdGggZGVsaW1pdGVyLCB3ZVxuLy8gY291bnQgdGhlIG51bWJlciBvZiBwcmVjZWRpbmcgYmFja3NsYXNoZXMgZXNjYXBpbmcgdGhlIGZvcndhcmQgc2xhc2g6IGFuIG9kZFxuLy8gbnVtYmVyIGluZGljYXRlcyBhbiBlc2NhcGVkIGZvcndhcmQgc2xhc2guXG5mdW5jdGlvbiBzbGFzaChwYXRoLCBpKSB7XG4gIGlmIChwYXRoW2ldID09PSBcIi9cIikge1xuICAgIGxldCBrID0gMDtcbiAgICB3aGlsZSAoaSA+IDAgJiYgcGF0aFstLWldID09PSBcIlxcXFxcIikgKytrO1xuICAgIGlmICgoayAmIDEpID09PSAwKSByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG4iLCJpbXBvcnQge05vZGV9IGZyb20gXCIuL2hpZXJhcmNoeS9pbmRleC5qc1wiO1xuXG5mdW5jdGlvbiBkZWZhdWx0U2VwYXJhdGlvbihhLCBiKSB7XG4gIHJldHVybiBhLnBhcmVudCA9PT0gYi5wYXJlbnQgPyAxIDogMjtcbn1cblxuLy8gZnVuY3Rpb24gcmFkaWFsU2VwYXJhdGlvbihhLCBiKSB7XG4vLyAgIHJldHVybiAoYS5wYXJlbnQgPT09IGIucGFyZW50ID8gMSA6IDIpIC8gYS5kZXB0aDtcbi8vIH1cblxuLy8gVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIHRyYXZlcnNlIHRoZSBsZWZ0IGNvbnRvdXIgb2YgYSBzdWJ0cmVlIChvclxuLy8gc3ViZm9yZXN0KS4gSXQgcmV0dXJucyB0aGUgc3VjY2Vzc29yIG9mIHYgb24gdGhpcyBjb250b3VyLiBUaGlzIHN1Y2Nlc3NvciBpc1xuLy8gZWl0aGVyIGdpdmVuIGJ5IHRoZSBsZWZ0bW9zdCBjaGlsZCBvZiB2IG9yIGJ5IHRoZSB0aHJlYWQgb2Ygdi4gVGhlIGZ1bmN0aW9uXG4vLyByZXR1cm5zIG51bGwgaWYgYW5kIG9ubHkgaWYgdiBpcyBvbiB0aGUgaGlnaGVzdCBsZXZlbCBvZiBpdHMgc3VidHJlZS5cbmZ1bmN0aW9uIG5leHRMZWZ0KHYpIHtcbiAgdmFyIGNoaWxkcmVuID0gdi5jaGlsZHJlbjtcbiAgcmV0dXJuIGNoaWxkcmVuID8gY2hpbGRyZW5bMF0gOiB2LnQ7XG59XG5cbi8vIFRoaXMgZnVuY3Rpb24gd29ya3MgYW5hbG9nb3VzbHkgdG8gbmV4dExlZnQuXG5mdW5jdGlvbiBuZXh0UmlnaHQodikge1xuICB2YXIgY2hpbGRyZW4gPSB2LmNoaWxkcmVuO1xuICByZXR1cm4gY2hpbGRyZW4gPyBjaGlsZHJlbltjaGlsZHJlbi5sZW5ndGggLSAxXSA6IHYudDtcbn1cblxuLy8gU2hpZnRzIHRoZSBjdXJyZW50IHN1YnRyZWUgcm9vdGVkIGF0IHcrLiBUaGlzIGlzIGRvbmUgYnkgaW5jcmVhc2luZ1xuLy8gcHJlbGltKHcrKSBhbmQgbW9kKHcrKSBieSBzaGlmdC5cbmZ1bmN0aW9uIG1vdmVTdWJ0cmVlKHdtLCB3cCwgc2hpZnQpIHtcbiAgdmFyIGNoYW5nZSA9IHNoaWZ0IC8gKHdwLmkgLSB3bS5pKTtcbiAgd3AuYyAtPSBjaGFuZ2U7XG4gIHdwLnMgKz0gc2hpZnQ7XG4gIHdtLmMgKz0gY2hhbmdlO1xuICB3cC56ICs9IHNoaWZ0O1xuICB3cC5tICs9IHNoaWZ0O1xufVxuXG4vLyBBbGwgb3RoZXIgc2hpZnRzLCBhcHBsaWVkIHRvIHRoZSBzbWFsbGVyIHN1YnRyZWVzIGJldHdlZW4gdy0gYW5kIHcrLCBhcmVcbi8vIHBlcmZvcm1lZCBieSB0aGlzIGZ1bmN0aW9uLiBUbyBwcmVwYXJlIHRoZSBzaGlmdHMsIHdlIGhhdmUgdG8gYWRqdXN0XG4vLyBjaGFuZ2UodyspLCBzaGlmdCh3KyksIGFuZCBjaGFuZ2Uody0pLlxuZnVuY3Rpb24gZXhlY3V0ZVNoaWZ0cyh2KSB7XG4gIHZhciBzaGlmdCA9IDAsXG4gICAgICBjaGFuZ2UgPSAwLFxuICAgICAgY2hpbGRyZW4gPSB2LmNoaWxkcmVuLFxuICAgICAgaSA9IGNoaWxkcmVuLmxlbmd0aCxcbiAgICAgIHc7XG4gIHdoaWxlICgtLWkgPj0gMCkge1xuICAgIHcgPSBjaGlsZHJlbltpXTtcbiAgICB3LnogKz0gc2hpZnQ7XG4gICAgdy5tICs9IHNoaWZ0O1xuICAgIHNoaWZ0ICs9IHcucyArIChjaGFuZ2UgKz0gdy5jKTtcbiAgfVxufVxuXG4vLyBJZiB2aS3igJlzIGFuY2VzdG9yIGlzIGEgc2libGluZyBvZiB2LCByZXR1cm5zIHZpLeKAmXMgYW5jZXN0b3IuIE90aGVyd2lzZSxcbi8vIHJldHVybnMgdGhlIHNwZWNpZmllZCAoZGVmYXVsdCkgYW5jZXN0b3IuXG5mdW5jdGlvbiBuZXh0QW5jZXN0b3IodmltLCB2LCBhbmNlc3Rvcikge1xuICByZXR1cm4gdmltLmEucGFyZW50ID09PSB2LnBhcmVudCA/IHZpbS5hIDogYW5jZXN0b3I7XG59XG5cbmZ1bmN0aW9uIFRyZWVOb2RlKG5vZGUsIGkpIHtcbiAgdGhpcy5fID0gbm9kZTtcbiAgdGhpcy5wYXJlbnQgPSBudWxsO1xuICB0aGlzLmNoaWxkcmVuID0gbnVsbDtcbiAgdGhpcy5BID0gbnVsbDsgLy8gZGVmYXVsdCBhbmNlc3RvclxuICB0aGlzLmEgPSB0aGlzOyAvLyBhbmNlc3RvclxuICB0aGlzLnogPSAwOyAvLyBwcmVsaW1cbiAgdGhpcy5tID0gMDsgLy8gbW9kXG4gIHRoaXMuYyA9IDA7IC8vIGNoYW5nZVxuICB0aGlzLnMgPSAwOyAvLyBzaGlmdFxuICB0aGlzLnQgPSBudWxsOyAvLyB0aHJlYWRcbiAgdGhpcy5pID0gaTsgLy8gbnVtYmVyXG59XG5cblRyZWVOb2RlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTm9kZS5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiB0cmVlUm9vdChyb290KSB7XG4gIHZhciB0cmVlID0gbmV3IFRyZWVOb2RlKHJvb3QsIDApLFxuICAgICAgbm9kZSxcbiAgICAgIG5vZGVzID0gW3RyZWVdLFxuICAgICAgY2hpbGQsXG4gICAgICBjaGlsZHJlbixcbiAgICAgIGksXG4gICAgICBuO1xuXG4gIHdoaWxlIChub2RlID0gbm9kZXMucG9wKCkpIHtcbiAgICBpZiAoY2hpbGRyZW4gPSBub2RlLl8uY2hpbGRyZW4pIHtcbiAgICAgIG5vZGUuY2hpbGRyZW4gPSBuZXcgQXJyYXkobiA9IGNoaWxkcmVuLmxlbmd0aCk7XG4gICAgICBmb3IgKGkgPSBuIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgbm9kZXMucHVzaChjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV0gPSBuZXcgVHJlZU5vZGUoY2hpbGRyZW5baV0sIGkpKTtcbiAgICAgICAgY2hpbGQucGFyZW50ID0gbm9kZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAodHJlZS5wYXJlbnQgPSBuZXcgVHJlZU5vZGUobnVsbCwgMCkpLmNoaWxkcmVuID0gW3RyZWVdO1xuICByZXR1cm4gdHJlZTtcbn1cblxuLy8gTm9kZS1saW5rIHRyZWUgZGlhZ3JhbSB1c2luZyB0aGUgUmVpbmdvbGQtVGlsZm9yZCBcInRpZHlcIiBhbGdvcml0aG1cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgc2VwYXJhdGlvbiA9IGRlZmF1bHRTZXBhcmF0aW9uLFxuICAgICAgZHggPSAxLFxuICAgICAgZHkgPSAxLFxuICAgICAgbm9kZVNpemUgPSBudWxsO1xuXG4gIGZ1bmN0aW9uIHRyZWUocm9vdCkge1xuICAgIHZhciB0ID0gdHJlZVJvb3Qocm9vdCk7XG5cbiAgICAvLyBDb21wdXRlIHRoZSBsYXlvdXQgdXNpbmcgQnVjaGhlaW0gZXQgYWwu4oCZcyBhbGdvcml0aG0uXG4gICAgdC5lYWNoQWZ0ZXIoZmlyc3RXYWxrKSwgdC5wYXJlbnQubSA9IC10Lno7XG4gICAgdC5lYWNoQmVmb3JlKHNlY29uZFdhbGspO1xuXG4gICAgLy8gSWYgYSBmaXhlZCBub2RlIHNpemUgaXMgc3BlY2lmaWVkLCBzY2FsZSB4IGFuZCB5LlxuICAgIGlmIChub2RlU2l6ZSkgcm9vdC5lYWNoQmVmb3JlKHNpemVOb2RlKTtcblxuICAgIC8vIElmIGEgZml4ZWQgdHJlZSBzaXplIGlzIHNwZWNpZmllZCwgc2NhbGUgeCBhbmQgeSBiYXNlZCBvbiB0aGUgZXh0ZW50LlxuICAgIC8vIENvbXB1dGUgdGhlIGxlZnQtbW9zdCwgcmlnaHQtbW9zdCwgYW5kIGRlcHRoLW1vc3Qgbm9kZXMgZm9yIGV4dGVudHMuXG4gICAgZWxzZSB7XG4gICAgICB2YXIgbGVmdCA9IHJvb3QsXG4gICAgICAgICAgcmlnaHQgPSByb290LFxuICAgICAgICAgIGJvdHRvbSA9IHJvb3Q7XG4gICAgICByb290LmVhY2hCZWZvcmUoZnVuY3Rpb24obm9kZSkge1xuICAgICAgICBpZiAobm9kZS54IDwgbGVmdC54KSBsZWZ0ID0gbm9kZTtcbiAgICAgICAgaWYgKG5vZGUueCA+IHJpZ2h0LngpIHJpZ2h0ID0gbm9kZTtcbiAgICAgICAgaWYgKG5vZGUuZGVwdGggPiBib3R0b20uZGVwdGgpIGJvdHRvbSA9IG5vZGU7XG4gICAgICB9KTtcbiAgICAgIHZhciBzID0gbGVmdCA9PT0gcmlnaHQgPyAxIDogc2VwYXJhdGlvbihsZWZ0LCByaWdodCkgLyAyLFxuICAgICAgICAgIHR4ID0gcyAtIGxlZnQueCxcbiAgICAgICAgICBreCA9IGR4IC8gKHJpZ2h0LnggKyBzICsgdHgpLFxuICAgICAgICAgIGt5ID0gZHkgLyAoYm90dG9tLmRlcHRoIHx8IDEpO1xuICAgICAgcm9vdC5lYWNoQmVmb3JlKGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgbm9kZS54ID0gKG5vZGUueCArIHR4KSAqIGt4O1xuICAgICAgICBub2RlLnkgPSBub2RlLmRlcHRoICoga3k7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcm9vdDtcbiAgfVxuXG4gIC8vIENvbXB1dGVzIGEgcHJlbGltaW5hcnkgeC1jb29yZGluYXRlIGZvciB2LiBCZWZvcmUgdGhhdCwgRklSU1QgV0FMSyBpc1xuICAvLyBhcHBsaWVkIHJlY3Vyc2l2ZWx5IHRvIHRoZSBjaGlsZHJlbiBvZiB2LCBhcyB3ZWxsIGFzIHRoZSBmdW5jdGlvblxuICAvLyBBUFBPUlRJT04uIEFmdGVyIHNwYWNpbmcgb3V0IHRoZSBjaGlsZHJlbiBieSBjYWxsaW5nIEVYRUNVVEUgU0hJRlRTLCB0aGVcbiAgLy8gbm9kZSB2IGlzIHBsYWNlZCB0byB0aGUgbWlkcG9pbnQgb2YgaXRzIG91dGVybW9zdCBjaGlsZHJlbi5cbiAgZnVuY3Rpb24gZmlyc3RXYWxrKHYpIHtcbiAgICB2YXIgY2hpbGRyZW4gPSB2LmNoaWxkcmVuLFxuICAgICAgICBzaWJsaW5ncyA9IHYucGFyZW50LmNoaWxkcmVuLFxuICAgICAgICB3ID0gdi5pID8gc2libGluZ3Nbdi5pIC0gMV0gOiBudWxsO1xuICAgIGlmIChjaGlsZHJlbikge1xuICAgICAgZXhlY3V0ZVNoaWZ0cyh2KTtcbiAgICAgIHZhciBtaWRwb2ludCA9IChjaGlsZHJlblswXS56ICsgY2hpbGRyZW5bY2hpbGRyZW4ubGVuZ3RoIC0gMV0ueikgLyAyO1xuICAgICAgaWYgKHcpIHtcbiAgICAgICAgdi56ID0gdy56ICsgc2VwYXJhdGlvbih2Ll8sIHcuXyk7XG4gICAgICAgIHYubSA9IHYueiAtIG1pZHBvaW50O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdi56ID0gbWlkcG9pbnQ7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh3KSB7XG4gICAgICB2LnogPSB3LnogKyBzZXBhcmF0aW9uKHYuXywgdy5fKTtcbiAgICB9XG4gICAgdi5wYXJlbnQuQSA9IGFwcG9ydGlvbih2LCB3LCB2LnBhcmVudC5BIHx8IHNpYmxpbmdzWzBdKTtcbiAgfVxuXG4gIC8vIENvbXB1dGVzIGFsbCByZWFsIHgtY29vcmRpbmF0ZXMgYnkgc3VtbWluZyB1cCB0aGUgbW9kaWZpZXJzIHJlY3Vyc2l2ZWx5LlxuICBmdW5jdGlvbiBzZWNvbmRXYWxrKHYpIHtcbiAgICB2Ll8ueCA9IHYueiArIHYucGFyZW50Lm07XG4gICAgdi5tICs9IHYucGFyZW50Lm07XG4gIH1cblxuICAvLyBUaGUgY29yZSBvZiB0aGUgYWxnb3JpdGhtLiBIZXJlLCBhIG5ldyBzdWJ0cmVlIGlzIGNvbWJpbmVkIHdpdGggdGhlXG4gIC8vIHByZXZpb3VzIHN1YnRyZWVzLiBUaHJlYWRzIGFyZSB1c2VkIHRvIHRyYXZlcnNlIHRoZSBpbnNpZGUgYW5kIG91dHNpZGVcbiAgLy8gY29udG91cnMgb2YgdGhlIGxlZnQgYW5kIHJpZ2h0IHN1YnRyZWUgdXAgdG8gdGhlIGhpZ2hlc3QgY29tbW9uIGxldmVsLiBUaGVcbiAgLy8gdmVydGljZXMgdXNlZCBmb3IgdGhlIHRyYXZlcnNhbHMgYXJlIHZpKywgdmktLCB2by0sIGFuZCB2byssIHdoZXJlIHRoZVxuICAvLyBzdXBlcnNjcmlwdCBvIG1lYW5zIG91dHNpZGUgYW5kIGkgbWVhbnMgaW5zaWRlLCB0aGUgc3Vic2NyaXB0IC0gbWVhbnMgbGVmdFxuICAvLyBzdWJ0cmVlIGFuZCArIG1lYW5zIHJpZ2h0IHN1YnRyZWUuIEZvciBzdW1taW5nIHVwIHRoZSBtb2RpZmllcnMgYWxvbmcgdGhlXG4gIC8vIGNvbnRvdXIsIHdlIHVzZSByZXNwZWN0aXZlIHZhcmlhYmxlcyBzaSssIHNpLSwgc28tLCBhbmQgc28rLiBXaGVuZXZlciB0d29cbiAgLy8gbm9kZXMgb2YgdGhlIGluc2lkZSBjb250b3VycyBjb25mbGljdCwgd2UgY29tcHV0ZSB0aGUgbGVmdCBvbmUgb2YgdGhlXG4gIC8vIGdyZWF0ZXN0IHVuY29tbW9uIGFuY2VzdG9ycyB1c2luZyB0aGUgZnVuY3Rpb24gQU5DRVNUT1IgYW5kIGNhbGwgTU9WRVxuICAvLyBTVUJUUkVFIHRvIHNoaWZ0IHRoZSBzdWJ0cmVlIGFuZCBwcmVwYXJlIHRoZSBzaGlmdHMgb2Ygc21hbGxlciBzdWJ0cmVlcy5cbiAgLy8gRmluYWxseSwgd2UgYWRkIGEgbmV3IHRocmVhZCAoaWYgbmVjZXNzYXJ5KS5cbiAgZnVuY3Rpb24gYXBwb3J0aW9uKHYsIHcsIGFuY2VzdG9yKSB7XG4gICAgaWYgKHcpIHtcbiAgICAgIHZhciB2aXAgPSB2LFxuICAgICAgICAgIHZvcCA9IHYsXG4gICAgICAgICAgdmltID0gdyxcbiAgICAgICAgICB2b20gPSB2aXAucGFyZW50LmNoaWxkcmVuWzBdLFxuICAgICAgICAgIHNpcCA9IHZpcC5tLFxuICAgICAgICAgIHNvcCA9IHZvcC5tLFxuICAgICAgICAgIHNpbSA9IHZpbS5tLFxuICAgICAgICAgIHNvbSA9IHZvbS5tLFxuICAgICAgICAgIHNoaWZ0O1xuICAgICAgd2hpbGUgKHZpbSA9IG5leHRSaWdodCh2aW0pLCB2aXAgPSBuZXh0TGVmdCh2aXApLCB2aW0gJiYgdmlwKSB7XG4gICAgICAgIHZvbSA9IG5leHRMZWZ0KHZvbSk7XG4gICAgICAgIHZvcCA9IG5leHRSaWdodCh2b3ApO1xuICAgICAgICB2b3AuYSA9IHY7XG4gICAgICAgIHNoaWZ0ID0gdmltLnogKyBzaW0gLSB2aXAueiAtIHNpcCArIHNlcGFyYXRpb24odmltLl8sIHZpcC5fKTtcbiAgICAgICAgaWYgKHNoaWZ0ID4gMCkge1xuICAgICAgICAgIG1vdmVTdWJ0cmVlKG5leHRBbmNlc3Rvcih2aW0sIHYsIGFuY2VzdG9yKSwgdiwgc2hpZnQpO1xuICAgICAgICAgIHNpcCArPSBzaGlmdDtcbiAgICAgICAgICBzb3AgKz0gc2hpZnQ7XG4gICAgICAgIH1cbiAgICAgICAgc2ltICs9IHZpbS5tO1xuICAgICAgICBzaXAgKz0gdmlwLm07XG4gICAgICAgIHNvbSArPSB2b20ubTtcbiAgICAgICAgc29wICs9IHZvcC5tO1xuICAgICAgfVxuICAgICAgaWYgKHZpbSAmJiAhbmV4dFJpZ2h0KHZvcCkpIHtcbiAgICAgICAgdm9wLnQgPSB2aW07XG4gICAgICAgIHZvcC5tICs9IHNpbSAtIHNvcDtcbiAgICAgIH1cbiAgICAgIGlmICh2aXAgJiYgIW5leHRMZWZ0KHZvbSkpIHtcbiAgICAgICAgdm9tLnQgPSB2aXA7XG4gICAgICAgIHZvbS5tICs9IHNpcCAtIHNvbTtcbiAgICAgICAgYW5jZXN0b3IgPSB2O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYW5jZXN0b3I7XG4gIH1cblxuICBmdW5jdGlvbiBzaXplTm9kZShub2RlKSB7XG4gICAgbm9kZS54ICo9IGR4O1xuICAgIG5vZGUueSA9IG5vZGUuZGVwdGggKiBkeTtcbiAgfVxuXG4gIHRyZWUuc2VwYXJhdGlvbiA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChzZXBhcmF0aW9uID0geCwgdHJlZSkgOiBzZXBhcmF0aW9uO1xuICB9O1xuXG4gIHRyZWUuc2l6ZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChub2RlU2l6ZSA9IGZhbHNlLCBkeCA9ICt4WzBdLCBkeSA9ICt4WzFdLCB0cmVlKSA6IChub2RlU2l6ZSA/IG51bGwgOiBbZHgsIGR5XSk7XG4gIH07XG5cbiAgdHJlZS5ub2RlU2l6ZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChub2RlU2l6ZSA9IHRydWUsIGR4ID0gK3hbMF0sIGR5ID0gK3hbMV0sIHRyZWUpIDogKG5vZGVTaXplID8gW2R4LCBkeV0gOiBudWxsKTtcbiAgfTtcblxuICByZXR1cm4gdHJlZTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHBhcmVudCwgeDAsIHkwLCB4MSwgeTEpIHtcbiAgdmFyIG5vZGVzID0gcGFyZW50LmNoaWxkcmVuLFxuICAgICAgbm9kZSxcbiAgICAgIGkgPSAtMSxcbiAgICAgIG4gPSBub2Rlcy5sZW5ndGgsXG4gICAgICBrID0gcGFyZW50LnZhbHVlICYmICh5MSAtIHkwKSAvIHBhcmVudC52YWx1ZTtcblxuICB3aGlsZSAoKytpIDwgbikge1xuICAgIG5vZGUgPSBub2Rlc1tpXSwgbm9kZS54MCA9IHgwLCBub2RlLngxID0geDE7XG4gICAgbm9kZS55MCA9IHkwLCBub2RlLnkxID0geTAgKz0gbm9kZS52YWx1ZSAqIGs7XG4gIH1cbn1cbiIsImltcG9ydCB0cmVlbWFwRGljZSBmcm9tIFwiLi9kaWNlLmpzXCI7XG5pbXBvcnQgdHJlZW1hcFNsaWNlIGZyb20gXCIuL3NsaWNlLmpzXCI7XG5cbmV4cG9ydCB2YXIgcGhpID0gKDEgKyBNYXRoLnNxcnQoNSkpIC8gMjtcblxuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyaWZ5UmF0aW8ocmF0aW8sIHBhcmVudCwgeDAsIHkwLCB4MSwgeTEpIHtcbiAgdmFyIHJvd3MgPSBbXSxcbiAgICAgIG5vZGVzID0gcGFyZW50LmNoaWxkcmVuLFxuICAgICAgcm93LFxuICAgICAgbm9kZVZhbHVlLFxuICAgICAgaTAgPSAwLFxuICAgICAgaTEgPSAwLFxuICAgICAgbiA9IG5vZGVzLmxlbmd0aCxcbiAgICAgIGR4LCBkeSxcbiAgICAgIHZhbHVlID0gcGFyZW50LnZhbHVlLFxuICAgICAgc3VtVmFsdWUsXG4gICAgICBtaW5WYWx1ZSxcbiAgICAgIG1heFZhbHVlLFxuICAgICAgbmV3UmF0aW8sXG4gICAgICBtaW5SYXRpbyxcbiAgICAgIGFscGhhLFxuICAgICAgYmV0YTtcblxuICB3aGlsZSAoaTAgPCBuKSB7XG4gICAgZHggPSB4MSAtIHgwLCBkeSA9IHkxIC0geTA7XG5cbiAgICAvLyBGaW5kIHRoZSBuZXh0IG5vbi1lbXB0eSBub2RlLlxuICAgIGRvIHN1bVZhbHVlID0gbm9kZXNbaTErK10udmFsdWU7IHdoaWxlICghc3VtVmFsdWUgJiYgaTEgPCBuKTtcbiAgICBtaW5WYWx1ZSA9IG1heFZhbHVlID0gc3VtVmFsdWU7XG4gICAgYWxwaGEgPSBNYXRoLm1heChkeSAvIGR4LCBkeCAvIGR5KSAvICh2YWx1ZSAqIHJhdGlvKTtcbiAgICBiZXRhID0gc3VtVmFsdWUgKiBzdW1WYWx1ZSAqIGFscGhhO1xuICAgIG1pblJhdGlvID0gTWF0aC5tYXgobWF4VmFsdWUgLyBiZXRhLCBiZXRhIC8gbWluVmFsdWUpO1xuXG4gICAgLy8gS2VlcCBhZGRpbmcgbm9kZXMgd2hpbGUgdGhlIGFzcGVjdCByYXRpbyBtYWludGFpbnMgb3IgaW1wcm92ZXMuXG4gICAgZm9yICg7IGkxIDwgbjsgKytpMSkge1xuICAgICAgc3VtVmFsdWUgKz0gbm9kZVZhbHVlID0gbm9kZXNbaTFdLnZhbHVlO1xuICAgICAgaWYgKG5vZGVWYWx1ZSA8IG1pblZhbHVlKSBtaW5WYWx1ZSA9IG5vZGVWYWx1ZTtcbiAgICAgIGlmIChub2RlVmFsdWUgPiBtYXhWYWx1ZSkgbWF4VmFsdWUgPSBub2RlVmFsdWU7XG4gICAgICBiZXRhID0gc3VtVmFsdWUgKiBzdW1WYWx1ZSAqIGFscGhhO1xuICAgICAgbmV3UmF0aW8gPSBNYXRoLm1heChtYXhWYWx1ZSAvIGJldGEsIGJldGEgLyBtaW5WYWx1ZSk7XG4gICAgICBpZiAobmV3UmF0aW8gPiBtaW5SYXRpbykgeyBzdW1WYWx1ZSAtPSBub2RlVmFsdWU7IGJyZWFrOyB9XG4gICAgICBtaW5SYXRpbyA9IG5ld1JhdGlvO1xuICAgIH1cblxuICAgIC8vIFBvc2l0aW9uIGFuZCByZWNvcmQgdGhlIHJvdyBvcmllbnRhdGlvbi5cbiAgICByb3dzLnB1c2gocm93ID0ge3ZhbHVlOiBzdW1WYWx1ZSwgZGljZTogZHggPCBkeSwgY2hpbGRyZW46IG5vZGVzLnNsaWNlKGkwLCBpMSl9KTtcbiAgICBpZiAocm93LmRpY2UpIHRyZWVtYXBEaWNlKHJvdywgeDAsIHkwLCB4MSwgdmFsdWUgPyB5MCArPSBkeSAqIHN1bVZhbHVlIC8gdmFsdWUgOiB5MSk7XG4gICAgZWxzZSB0cmVlbWFwU2xpY2Uocm93LCB4MCwgeTAsIHZhbHVlID8geDAgKz0gZHggKiBzdW1WYWx1ZSAvIHZhbHVlIDogeDEsIHkxKTtcbiAgICB2YWx1ZSAtPSBzdW1WYWx1ZSwgaTAgPSBpMTtcbiAgfVxuXG4gIHJldHVybiByb3dzO1xufVxuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gY3VzdG9tKHJhdGlvKSB7XG5cbiAgZnVuY3Rpb24gc3F1YXJpZnkocGFyZW50LCB4MCwgeTAsIHgxLCB5MSkge1xuICAgIHNxdWFyaWZ5UmF0aW8ocmF0aW8sIHBhcmVudCwgeDAsIHkwLCB4MSwgeTEpO1xuICB9XG5cbiAgc3F1YXJpZnkucmF0aW8gPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIGN1c3RvbSgoeCA9ICt4KSA+IDEgPyB4IDogMSk7XG4gIH07XG5cbiAgcmV0dXJuIHNxdWFyaWZ5O1xufSkocGhpKTtcbiIsImltcG9ydCByb3VuZE5vZGUgZnJvbSBcIi4vcm91bmQuanNcIjtcbmltcG9ydCBzcXVhcmlmeSBmcm9tIFwiLi9zcXVhcmlmeS5qc1wiO1xuaW1wb3J0IHtyZXF1aXJlZH0gZnJvbSBcIi4uL2FjY2Vzc29ycy5qc1wiO1xuaW1wb3J0IGNvbnN0YW50LCB7Y29uc3RhbnRaZXJvfSBmcm9tIFwiLi4vY29uc3RhbnQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciB0aWxlID0gc3F1YXJpZnksXG4gICAgICByb3VuZCA9IGZhbHNlLFxuICAgICAgZHggPSAxLFxuICAgICAgZHkgPSAxLFxuICAgICAgcGFkZGluZ1N0YWNrID0gWzBdLFxuICAgICAgcGFkZGluZ0lubmVyID0gY29uc3RhbnRaZXJvLFxuICAgICAgcGFkZGluZ1RvcCA9IGNvbnN0YW50WmVybyxcbiAgICAgIHBhZGRpbmdSaWdodCA9IGNvbnN0YW50WmVybyxcbiAgICAgIHBhZGRpbmdCb3R0b20gPSBjb25zdGFudFplcm8sXG4gICAgICBwYWRkaW5nTGVmdCA9IGNvbnN0YW50WmVybztcblxuICBmdW5jdGlvbiB0cmVlbWFwKHJvb3QpIHtcbiAgICByb290LngwID1cbiAgICByb290LnkwID0gMDtcbiAgICByb290LngxID0gZHg7XG4gICAgcm9vdC55MSA9IGR5O1xuICAgIHJvb3QuZWFjaEJlZm9yZShwb3NpdGlvbk5vZGUpO1xuICAgIHBhZGRpbmdTdGFjayA9IFswXTtcbiAgICBpZiAocm91bmQpIHJvb3QuZWFjaEJlZm9yZShyb3VuZE5vZGUpO1xuICAgIHJldHVybiByb290O1xuICB9XG5cbiAgZnVuY3Rpb24gcG9zaXRpb25Ob2RlKG5vZGUpIHtcbiAgICB2YXIgcCA9IHBhZGRpbmdTdGFja1tub2RlLmRlcHRoXSxcbiAgICAgICAgeDAgPSBub2RlLngwICsgcCxcbiAgICAgICAgeTAgPSBub2RlLnkwICsgcCxcbiAgICAgICAgeDEgPSBub2RlLngxIC0gcCxcbiAgICAgICAgeTEgPSBub2RlLnkxIC0gcDtcbiAgICBpZiAoeDEgPCB4MCkgeDAgPSB4MSA9ICh4MCArIHgxKSAvIDI7XG4gICAgaWYgKHkxIDwgeTApIHkwID0geTEgPSAoeTAgKyB5MSkgLyAyO1xuICAgIG5vZGUueDAgPSB4MDtcbiAgICBub2RlLnkwID0geTA7XG4gICAgbm9kZS54MSA9IHgxO1xuICAgIG5vZGUueTEgPSB5MTtcbiAgICBpZiAobm9kZS5jaGlsZHJlbikge1xuICAgICAgcCA9IHBhZGRpbmdTdGFja1tub2RlLmRlcHRoICsgMV0gPSBwYWRkaW5nSW5uZXIobm9kZSkgLyAyO1xuICAgICAgeDAgKz0gcGFkZGluZ0xlZnQobm9kZSkgLSBwO1xuICAgICAgeTAgKz0gcGFkZGluZ1RvcChub2RlKSAtIHA7XG4gICAgICB4MSAtPSBwYWRkaW5nUmlnaHQobm9kZSkgLSBwO1xuICAgICAgeTEgLT0gcGFkZGluZ0JvdHRvbShub2RlKSAtIHA7XG4gICAgICBpZiAoeDEgPCB4MCkgeDAgPSB4MSA9ICh4MCArIHgxKSAvIDI7XG4gICAgICBpZiAoeTEgPCB5MCkgeTAgPSB5MSA9ICh5MCArIHkxKSAvIDI7XG4gICAgICB0aWxlKG5vZGUsIHgwLCB5MCwgeDEsIHkxKTtcbiAgICB9XG4gIH1cblxuICB0cmVlbWFwLnJvdW5kID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHJvdW5kID0gISF4LCB0cmVlbWFwKSA6IHJvdW5kO1xuICB9O1xuXG4gIHRyZWVtYXAuc2l6ZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChkeCA9ICt4WzBdLCBkeSA9ICt4WzFdLCB0cmVlbWFwKSA6IFtkeCwgZHldO1xuICB9O1xuXG4gIHRyZWVtYXAudGlsZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh0aWxlID0gcmVxdWlyZWQoeCksIHRyZWVtYXApIDogdGlsZTtcbiAgfTtcblxuICB0cmVlbWFwLnBhZGRpbmcgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyB0cmVlbWFwLnBhZGRpbmdJbm5lcih4KS5wYWRkaW5nT3V0ZXIoeCkgOiB0cmVlbWFwLnBhZGRpbmdJbm5lcigpO1xuICB9O1xuXG4gIHRyZWVtYXAucGFkZGluZ0lubmVyID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBhZGRpbmdJbm5lciA9IHR5cGVvZiB4ID09PSBcImZ1bmN0aW9uXCIgPyB4IDogY29uc3RhbnQoK3gpLCB0cmVlbWFwKSA6IHBhZGRpbmdJbm5lcjtcbiAgfTtcblxuICB0cmVlbWFwLnBhZGRpbmdPdXRlciA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IHRyZWVtYXAucGFkZGluZ1RvcCh4KS5wYWRkaW5nUmlnaHQoeCkucGFkZGluZ0JvdHRvbSh4KS5wYWRkaW5nTGVmdCh4KSA6IHRyZWVtYXAucGFkZGluZ1RvcCgpO1xuICB9O1xuXG4gIHRyZWVtYXAucGFkZGluZ1RvcCA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwYWRkaW5nVG9wID0gdHlwZW9mIHggPT09IFwiZnVuY3Rpb25cIiA/IHggOiBjb25zdGFudCgreCksIHRyZWVtYXApIDogcGFkZGluZ1RvcDtcbiAgfTtcblxuICB0cmVlbWFwLnBhZGRpbmdSaWdodCA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwYWRkaW5nUmlnaHQgPSB0eXBlb2YgeCA9PT0gXCJmdW5jdGlvblwiID8geCA6IGNvbnN0YW50KCt4KSwgdHJlZW1hcCkgOiBwYWRkaW5nUmlnaHQ7XG4gIH07XG5cbiAgdHJlZW1hcC5wYWRkaW5nQm90dG9tID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBhZGRpbmdCb3R0b20gPSB0eXBlb2YgeCA9PT0gXCJmdW5jdGlvblwiID8geCA6IGNvbnN0YW50KCt4KSwgdHJlZW1hcCkgOiBwYWRkaW5nQm90dG9tO1xuICB9O1xuXG4gIHRyZWVtYXAucGFkZGluZ0xlZnQgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocGFkZGluZ0xlZnQgPSB0eXBlb2YgeCA9PT0gXCJmdW5jdGlvblwiID8geCA6IGNvbnN0YW50KCt4KSwgdHJlZW1hcCkgOiBwYWRkaW5nTGVmdDtcbiAgfTtcblxuICByZXR1cm4gdHJlZW1hcDtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHBhcmVudCwgeDAsIHkwLCB4MSwgeTEpIHtcbiAgdmFyIG5vZGVzID0gcGFyZW50LmNoaWxkcmVuLFxuICAgICAgaSwgbiA9IG5vZGVzLmxlbmd0aCxcbiAgICAgIHN1bSwgc3VtcyA9IG5ldyBBcnJheShuICsgMSk7XG5cbiAgZm9yIChzdW1zWzBdID0gc3VtID0gaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICBzdW1zW2kgKyAxXSA9IHN1bSArPSBub2Rlc1tpXS52YWx1ZTtcbiAgfVxuXG4gIHBhcnRpdGlvbigwLCBuLCBwYXJlbnQudmFsdWUsIHgwLCB5MCwgeDEsIHkxKTtcblxuICBmdW5jdGlvbiBwYXJ0aXRpb24oaSwgaiwgdmFsdWUsIHgwLCB5MCwgeDEsIHkxKSB7XG4gICAgaWYgKGkgPj0gaiAtIDEpIHtcbiAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XG4gICAgICBub2RlLngwID0geDAsIG5vZGUueTAgPSB5MDtcbiAgICAgIG5vZGUueDEgPSB4MSwgbm9kZS55MSA9IHkxO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB2YWx1ZU9mZnNldCA9IHN1bXNbaV0sXG4gICAgICAgIHZhbHVlVGFyZ2V0ID0gKHZhbHVlIC8gMikgKyB2YWx1ZU9mZnNldCxcbiAgICAgICAgayA9IGkgKyAxLFxuICAgICAgICBoaSA9IGogLSAxO1xuXG4gICAgd2hpbGUgKGsgPCBoaSkge1xuICAgICAgdmFyIG1pZCA9IGsgKyBoaSA+Pj4gMTtcbiAgICAgIGlmIChzdW1zW21pZF0gPCB2YWx1ZVRhcmdldCkgayA9IG1pZCArIDE7XG4gICAgICBlbHNlIGhpID0gbWlkO1xuICAgIH1cblxuICAgIGlmICgodmFsdWVUYXJnZXQgLSBzdW1zW2sgLSAxXSkgPCAoc3Vtc1trXSAtIHZhbHVlVGFyZ2V0KSAmJiBpICsgMSA8IGspIC0taztcblxuICAgIHZhciB2YWx1ZUxlZnQgPSBzdW1zW2tdIC0gdmFsdWVPZmZzZXQsXG4gICAgICAgIHZhbHVlUmlnaHQgPSB2YWx1ZSAtIHZhbHVlTGVmdDtcblxuICAgIGlmICgoeDEgLSB4MCkgPiAoeTEgLSB5MCkpIHtcbiAgICAgIHZhciB4ayA9IHZhbHVlID8gKHgwICogdmFsdWVSaWdodCArIHgxICogdmFsdWVMZWZ0KSAvIHZhbHVlIDogeDE7XG4gICAgICBwYXJ0aXRpb24oaSwgaywgdmFsdWVMZWZ0LCB4MCwgeTAsIHhrLCB5MSk7XG4gICAgICBwYXJ0aXRpb24oaywgaiwgdmFsdWVSaWdodCwgeGssIHkwLCB4MSwgeTEpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgeWsgPSB2YWx1ZSA/ICh5MCAqIHZhbHVlUmlnaHQgKyB5MSAqIHZhbHVlTGVmdCkgLyB2YWx1ZSA6IHkxO1xuICAgICAgcGFydGl0aW9uKGksIGssIHZhbHVlTGVmdCwgeDAsIHkwLCB4MSwgeWspO1xuICAgICAgcGFydGl0aW9uKGssIGosIHZhbHVlUmlnaHQsIHgwLCB5aywgeDEsIHkxKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCBkaWNlIGZyb20gXCIuL2RpY2UuanNcIjtcbmltcG9ydCBzbGljZSBmcm9tIFwiLi9zbGljZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihwYXJlbnQsIHgwLCB5MCwgeDEsIHkxKSB7XG4gIChwYXJlbnQuZGVwdGggJiAxID8gc2xpY2UgOiBkaWNlKShwYXJlbnQsIHgwLCB5MCwgeDEsIHkxKTtcbn1cbiIsImltcG9ydCB0cmVlbWFwRGljZSBmcm9tIFwiLi9kaWNlLmpzXCI7XG5pbXBvcnQgdHJlZW1hcFNsaWNlIGZyb20gXCIuL3NsaWNlLmpzXCI7XG5pbXBvcnQge3BoaSwgc3F1YXJpZnlSYXRpb30gZnJvbSBcIi4vc3F1YXJpZnkuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgKGZ1bmN0aW9uIGN1c3RvbShyYXRpbykge1xuXG4gIGZ1bmN0aW9uIHJlc3F1YXJpZnkocGFyZW50LCB4MCwgeTAsIHgxLCB5MSkge1xuICAgIGlmICgocm93cyA9IHBhcmVudC5fc3F1YXJpZnkpICYmIChyb3dzLnJhdGlvID09PSByYXRpbykpIHtcbiAgICAgIHZhciByb3dzLFxuICAgICAgICAgIHJvdyxcbiAgICAgICAgICBub2RlcyxcbiAgICAgICAgICBpLFxuICAgICAgICAgIGogPSAtMSxcbiAgICAgICAgICBuLFxuICAgICAgICAgIG0gPSByb3dzLmxlbmd0aCxcbiAgICAgICAgICB2YWx1ZSA9IHBhcmVudC52YWx1ZTtcblxuICAgICAgd2hpbGUgKCsraiA8IG0pIHtcbiAgICAgICAgcm93ID0gcm93c1tqXSwgbm9kZXMgPSByb3cuY2hpbGRyZW47XG4gICAgICAgIGZvciAoaSA9IHJvdy52YWx1ZSA9IDAsIG4gPSBub2Rlcy5sZW5ndGg7IGkgPCBuOyArK2kpIHJvdy52YWx1ZSArPSBub2Rlc1tpXS52YWx1ZTtcbiAgICAgICAgaWYgKHJvdy5kaWNlKSB0cmVlbWFwRGljZShyb3csIHgwLCB5MCwgeDEsIHZhbHVlID8geTAgKz0gKHkxIC0geTApICogcm93LnZhbHVlIC8gdmFsdWUgOiB5MSk7XG4gICAgICAgIGVsc2UgdHJlZW1hcFNsaWNlKHJvdywgeDAsIHkwLCB2YWx1ZSA/IHgwICs9ICh4MSAtIHgwKSAqIHJvdy52YWx1ZSAvIHZhbHVlIDogeDEsIHkxKTtcbiAgICAgICAgdmFsdWUgLT0gcm93LnZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBwYXJlbnQuX3NxdWFyaWZ5ID0gcm93cyA9IHNxdWFyaWZ5UmF0aW8ocmF0aW8sIHBhcmVudCwgeDAsIHkwLCB4MSwgeTEpO1xuICAgICAgcm93cy5yYXRpbyA9IHJhdGlvO1xuICAgIH1cbiAgfVxuXG4gIHJlc3F1YXJpZnkucmF0aW8gPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIGN1c3RvbSgoeCA9ICt4KSA+IDEgPyB4IDogMSk7XG4gIH07XG5cbiAgcmV0dXJuIHJlc3F1YXJpZnk7XG59KShwaGkpO1xuIiwiZXhwb3J0IHtkZWZhdWx0IGFzIGNsdXN0ZXJ9IGZyb20gXCIuL2NsdXN0ZXIuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBoaWVyYXJjaHksIE5vZGV9IGZyb20gXCIuL2hpZXJhcmNoeS9pbmRleC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHBhY2t9IGZyb20gXCIuL3BhY2svaW5kZXguanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBwYWNrU2libGluZ3N9IGZyb20gXCIuL3BhY2svc2libGluZ3MuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBwYWNrRW5jbG9zZX0gZnJvbSBcIi4vcGFjay9lbmNsb3NlLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgcGFydGl0aW9ufSBmcm9tIFwiLi9wYXJ0aXRpb24uanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBzdHJhdGlmeX0gZnJvbSBcIi4vc3RyYXRpZnkuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyB0cmVlfSBmcm9tIFwiLi90cmVlLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgdHJlZW1hcH0gZnJvbSBcIi4vdHJlZW1hcC9pbmRleC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHRyZWVtYXBCaW5hcnl9IGZyb20gXCIuL3RyZWVtYXAvYmluYXJ5LmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgdHJlZW1hcERpY2V9IGZyb20gXCIuL3RyZWVtYXAvZGljZS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHRyZWVtYXBTbGljZX0gZnJvbSBcIi4vdHJlZW1hcC9zbGljZS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHRyZWVtYXBTbGljZURpY2V9IGZyb20gXCIuL3RyZWVtYXAvc2xpY2VEaWNlLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgdHJlZW1hcFNxdWFyaWZ5fSBmcm9tIFwiLi90cmVlbWFwL3NxdWFyaWZ5LmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgdHJlZW1hcFJlc3F1YXJpZnl9IGZyb20gXCIuL3RyZWVtYXAvcmVzcXVhcmlmeS5qc1wiO1xuIiwiY29uc3QgcGkgPSBNYXRoLlBJLFxuICAgIHRhdSA9IDIgKiBwaSxcbiAgICBlcHNpbG9uID0gMWUtNixcbiAgICB0YXVFcHNpbG9uID0gdGF1IC0gZXBzaWxvbjtcblxuZnVuY3Rpb24gYXBwZW5kKHN0cmluZ3MpIHtcbiAgdGhpcy5fICs9IHN0cmluZ3NbMF07XG4gIGZvciAobGV0IGkgPSAxLCBuID0gc3RyaW5ncy5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICB0aGlzLl8gKz0gYXJndW1lbnRzW2ldICsgc3RyaW5nc1tpXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBlbmRSb3VuZChkaWdpdHMpIHtcbiAgbGV0IGQgPSBNYXRoLmZsb29yKGRpZ2l0cyk7XG4gIGlmICghKGQgPj0gMCkpIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBkaWdpdHM6ICR7ZGlnaXRzfWApO1xuICBpZiAoZCA+IDE1KSByZXR1cm4gYXBwZW5kO1xuICBjb25zdCBrID0gMTAgKiogZDtcbiAgcmV0dXJuIGZ1bmN0aW9uKHN0cmluZ3MpIHtcbiAgICB0aGlzLl8gKz0gc3RyaW5nc1swXTtcbiAgICBmb3IgKGxldCBpID0gMSwgbiA9IHN0cmluZ3MubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICB0aGlzLl8gKz0gTWF0aC5yb3VuZChhcmd1bWVudHNbaV0gKiBrKSAvIGsgKyBzdHJpbmdzW2ldO1xuICAgIH1cbiAgfTtcbn1cblxuZXhwb3J0IGNsYXNzIFBhdGgge1xuICBjb25zdHJ1Y3RvcihkaWdpdHMpIHtcbiAgICB0aGlzLl94MCA9IHRoaXMuX3kwID0gLy8gc3RhcnQgb2YgY3VycmVudCBzdWJwYXRoXG4gICAgdGhpcy5feDEgPSB0aGlzLl95MSA9IG51bGw7IC8vIGVuZCBvZiBjdXJyZW50IHN1YnBhdGhcbiAgICB0aGlzLl8gPSBcIlwiO1xuICAgIHRoaXMuX2FwcGVuZCA9IGRpZ2l0cyA9PSBudWxsID8gYXBwZW5kIDogYXBwZW5kUm91bmQoZGlnaXRzKTtcbiAgfVxuICBtb3ZlVG8oeCwgeSkge1xuICAgIHRoaXMuX2FwcGVuZGBNJHt0aGlzLl94MCA9IHRoaXMuX3gxID0gK3h9LCR7dGhpcy5feTAgPSB0aGlzLl95MSA9ICt5fWA7XG4gIH1cbiAgY2xvc2VQYXRoKCkge1xuICAgIGlmICh0aGlzLl94MSAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5feDEgPSB0aGlzLl94MCwgdGhpcy5feTEgPSB0aGlzLl95MDtcbiAgICAgIHRoaXMuX2FwcGVuZGBaYDtcbiAgICB9XG4gIH1cbiAgbGluZVRvKHgsIHkpIHtcbiAgICB0aGlzLl9hcHBlbmRgTCR7dGhpcy5feDEgPSAreH0sJHt0aGlzLl95MSA9ICt5fWA7XG4gIH1cbiAgcXVhZHJhdGljQ3VydmVUbyh4MSwgeTEsIHgsIHkpIHtcbiAgICB0aGlzLl9hcHBlbmRgUSR7K3gxfSwkeyt5MX0sJHt0aGlzLl94MSA9ICt4fSwke3RoaXMuX3kxID0gK3l9YDtcbiAgfVxuICBiZXppZXJDdXJ2ZVRvKHgxLCB5MSwgeDIsIHkyLCB4LCB5KSB7XG4gICAgdGhpcy5fYXBwZW5kYEMkeyt4MX0sJHsreTF9LCR7K3gyfSwkeyt5Mn0sJHt0aGlzLl94MSA9ICt4fSwke3RoaXMuX3kxID0gK3l9YDtcbiAgfVxuICBhcmNUbyh4MSwgeTEsIHgyLCB5Miwgcikge1xuICAgIHgxID0gK3gxLCB5MSA9ICt5MSwgeDIgPSAreDIsIHkyID0gK3kyLCByID0gK3I7XG5cbiAgICAvLyBJcyB0aGUgcmFkaXVzIG5lZ2F0aXZlPyBFcnJvci5cbiAgICBpZiAociA8IDApIHRocm93IG5ldyBFcnJvcihgbmVnYXRpdmUgcmFkaXVzOiAke3J9YCk7XG5cbiAgICBsZXQgeDAgPSB0aGlzLl94MSxcbiAgICAgICAgeTAgPSB0aGlzLl95MSxcbiAgICAgICAgeDIxID0geDIgLSB4MSxcbiAgICAgICAgeTIxID0geTIgLSB5MSxcbiAgICAgICAgeDAxID0geDAgLSB4MSxcbiAgICAgICAgeTAxID0geTAgLSB5MSxcbiAgICAgICAgbDAxXzIgPSB4MDEgKiB4MDEgKyB5MDEgKiB5MDE7XG5cbiAgICAvLyBJcyB0aGlzIHBhdGggZW1wdHk/IE1vdmUgdG8gKHgxLHkxKS5cbiAgICBpZiAodGhpcy5feDEgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2FwcGVuZGBNJHt0aGlzLl94MSA9IHgxfSwke3RoaXMuX3kxID0geTF9YDtcbiAgICB9XG5cbiAgICAvLyBPciwgaXMgKHgxLHkxKSBjb2luY2lkZW50IHdpdGggKHgwLHkwKT8gRG8gbm90aGluZy5cbiAgICBlbHNlIGlmICghKGwwMV8yID4gZXBzaWxvbikpO1xuXG4gICAgLy8gT3IsIGFyZSAoeDAseTApLCAoeDEseTEpIGFuZCAoeDIseTIpIGNvbGxpbmVhcj9cbiAgICAvLyBFcXVpdmFsZW50bHksIGlzICh4MSx5MSkgY29pbmNpZGVudCB3aXRoICh4Mix5Mik/XG4gICAgLy8gT3IsIGlzIHRoZSByYWRpdXMgemVybz8gTGluZSB0byAoeDEseTEpLlxuICAgIGVsc2UgaWYgKCEoTWF0aC5hYnMoeTAxICogeDIxIC0geTIxICogeDAxKSA+IGVwc2lsb24pIHx8ICFyKSB7XG4gICAgICB0aGlzLl9hcHBlbmRgTCR7dGhpcy5feDEgPSB4MX0sJHt0aGlzLl95MSA9IHkxfWA7XG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCBkcmF3IGFuIGFyYyFcbiAgICBlbHNlIHtcbiAgICAgIGxldCB4MjAgPSB4MiAtIHgwLFxuICAgICAgICAgIHkyMCA9IHkyIC0geTAsXG4gICAgICAgICAgbDIxXzIgPSB4MjEgKiB4MjEgKyB5MjEgKiB5MjEsXG4gICAgICAgICAgbDIwXzIgPSB4MjAgKiB4MjAgKyB5MjAgKiB5MjAsXG4gICAgICAgICAgbDIxID0gTWF0aC5zcXJ0KGwyMV8yKSxcbiAgICAgICAgICBsMDEgPSBNYXRoLnNxcnQobDAxXzIpLFxuICAgICAgICAgIGwgPSByICogTWF0aC50YW4oKHBpIC0gTWF0aC5hY29zKChsMjFfMiArIGwwMV8yIC0gbDIwXzIpIC8gKDIgKiBsMjEgKiBsMDEpKSkgLyAyKSxcbiAgICAgICAgICB0MDEgPSBsIC8gbDAxLFxuICAgICAgICAgIHQyMSA9IGwgLyBsMjE7XG5cbiAgICAgIC8vIElmIHRoZSBzdGFydCB0YW5nZW50IGlzIG5vdCBjb2luY2lkZW50IHdpdGggKHgwLHkwKSwgbGluZSB0by5cbiAgICAgIGlmIChNYXRoLmFicyh0MDEgLSAxKSA+IGVwc2lsb24pIHtcbiAgICAgICAgdGhpcy5fYXBwZW5kYEwke3gxICsgdDAxICogeDAxfSwke3kxICsgdDAxICogeTAxfWA7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2FwcGVuZGBBJHtyfSwke3J9LDAsMCwkeysoeTAxICogeDIwID4geDAxICogeTIwKX0sJHt0aGlzLl94MSA9IHgxICsgdDIxICogeDIxfSwke3RoaXMuX3kxID0geTEgKyB0MjEgKiB5MjF9YDtcbiAgICB9XG4gIH1cbiAgYXJjKHgsIHksIHIsIGEwLCBhMSwgY2N3KSB7XG4gICAgeCA9ICt4LCB5ID0gK3ksIHIgPSArciwgY2N3ID0gISFjY3c7XG5cbiAgICAvLyBJcyB0aGUgcmFkaXVzIG5lZ2F0aXZlPyBFcnJvci5cbiAgICBpZiAociA8IDApIHRocm93IG5ldyBFcnJvcihgbmVnYXRpdmUgcmFkaXVzOiAke3J9YCk7XG5cbiAgICBsZXQgZHggPSByICogTWF0aC5jb3MoYTApLFxuICAgICAgICBkeSA9IHIgKiBNYXRoLnNpbihhMCksXG4gICAgICAgIHgwID0geCArIGR4LFxuICAgICAgICB5MCA9IHkgKyBkeSxcbiAgICAgICAgY3cgPSAxIF4gY2N3LFxuICAgICAgICBkYSA9IGNjdyA/IGEwIC0gYTEgOiBhMSAtIGEwO1xuXG4gICAgLy8gSXMgdGhpcyBwYXRoIGVtcHR5PyBNb3ZlIHRvICh4MCx5MCkuXG4gICAgaWYgKHRoaXMuX3gxID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9hcHBlbmRgTSR7eDB9LCR7eTB9YDtcbiAgICB9XG5cbiAgICAvLyBPciwgaXMgKHgwLHkwKSBub3QgY29pbmNpZGVudCB3aXRoIHRoZSBwcmV2aW91cyBwb2ludD8gTGluZSB0byAoeDAseTApLlxuICAgIGVsc2UgaWYgKE1hdGguYWJzKHRoaXMuX3gxIC0geDApID4gZXBzaWxvbiB8fCBNYXRoLmFicyh0aGlzLl95MSAtIHkwKSA+IGVwc2lsb24pIHtcbiAgICAgIHRoaXMuX2FwcGVuZGBMJHt4MH0sJHt5MH1gO1xuICAgIH1cblxuICAgIC8vIElzIHRoaXMgYXJjIGVtcHR5PyBXZeKAmXJlIGRvbmUuXG4gICAgaWYgKCFyKSByZXR1cm47XG5cbiAgICAvLyBEb2VzIHRoZSBhbmdsZSBnbyB0aGUgd3Jvbmcgd2F5PyBGbGlwIHRoZSBkaXJlY3Rpb24uXG4gICAgaWYgKGRhIDwgMCkgZGEgPSBkYSAlIHRhdSArIHRhdTtcblxuICAgIC8vIElzIHRoaXMgYSBjb21wbGV0ZSBjaXJjbGU/IERyYXcgdHdvIGFyY3MgdG8gY29tcGxldGUgdGhlIGNpcmNsZS5cbiAgICBpZiAoZGEgPiB0YXVFcHNpbG9uKSB7XG4gICAgICB0aGlzLl9hcHBlbmRgQSR7cn0sJHtyfSwwLDEsJHtjd30sJHt4IC0gZHh9LCR7eSAtIGR5fUEke3J9LCR7cn0sMCwxLCR7Y3d9LCR7dGhpcy5feDEgPSB4MH0sJHt0aGlzLl95MSA9IHkwfWA7XG4gICAgfVxuXG4gICAgLy8gSXMgdGhpcyBhcmMgbm9uLWVtcHR5PyBEcmF3IGFuIGFyYyFcbiAgICBlbHNlIGlmIChkYSA+IGVwc2lsb24pIHtcbiAgICAgIHRoaXMuX2FwcGVuZGBBJHtyfSwke3J9LDAsJHsrKGRhID49IHBpKX0sJHtjd30sJHt0aGlzLl94MSA9IHggKyByICogTWF0aC5jb3MoYTEpfSwke3RoaXMuX3kxID0geSArIHIgKiBNYXRoLnNpbihhMSl9YDtcbiAgICB9XG4gIH1cbiAgcmVjdCh4LCB5LCB3LCBoKSB7XG4gICAgdGhpcy5fYXBwZW5kYE0ke3RoaXMuX3gwID0gdGhpcy5feDEgPSAreH0sJHt0aGlzLl95MCA9IHRoaXMuX3kxID0gK3l9aCR7dyA9ICt3fXYkeytofWgkey13fVpgO1xuICB9XG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLl87XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhdGgoKSB7XG4gIHJldHVybiBuZXcgUGF0aDtcbn1cblxuLy8gQWxsb3cgaW5zdGFuY2VvZiBkMy5wYXRoXG5wYXRoLnByb3RvdHlwZSA9IFBhdGgucHJvdG90eXBlO1xuXG5leHBvcnQgZnVuY3Rpb24gcGF0aFJvdW5kKGRpZ2l0cyA9IDMpIHtcbiAgcmV0dXJuIG5ldyBQYXRoKCtkaWdpdHMpO1xufVxuIiwiZXhwb3J0IHtQYXRoLCBwYXRoLCBwYXRoUm91bmR9IGZyb20gXCIuL3BhdGguanNcIjtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==