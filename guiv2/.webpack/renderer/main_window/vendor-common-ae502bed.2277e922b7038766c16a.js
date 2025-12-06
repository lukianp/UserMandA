"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[6472],{

/***/ 16199:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  WH: () => (/* reexport */ band),
  Mb: () => (/* reexport */ diverging),
  Cr: () => (/* reexport */ divergingLog),
  yj: () => (/* reexport */ divergingPow),
  q9: () => (/* reexport */ divergingSqrt),
  xh: () => (/* reexport */ divergingSymlog),
  jo: () => (/* reexport */ identity_identity),
  U4: () => (/* reexport */ implicit),
  m4: () => (/* reexport */ linear),
  ZE: () => (/* reexport */ log),
  UM: () => (/* reexport */ ordinal),
  hq: () => (/* reexport */ point),
  RW: () => (/* reexport */ pow),
  QL: () => (/* reexport */ quantile),
  WT: () => (/* reexport */ quantize),
  af: () => (/* reexport */ radial),
  ex: () => (/* reexport */ sequential),
  M3: () => (/* reexport */ sequentialLog),
  ui: () => (/* reexport */ sequentialPow),
  T: () => (/* reexport */ sequentialQuantile),
  ye: () => (/* reexport */ sequentialSqrt),
  nV: () => (/* reexport */ sequentialSymlog),
  Bv: () => (/* reexport */ sqrt),
  aX: () => (/* reexport */ symlog),
  c3: () => (/* reexport */ threshold),
  w7: () => (/* reexport */ time),
  Pp: () => (/* reexport */ utcTime),
  Vr: () => (/* reexport */ tickFormat)
});

// EXTERNAL MODULE: ./node_modules/d3-array/src/index.js + 60 modules
var src = __webpack_require__(3398);
;// ./node_modules/d3-scale/src/init.js
function initRange(domain, range) {
  switch (arguments.length) {
    case 0: break;
    case 1: this.range(domain); break;
    default: this.range(range).domain(domain); break;
  }
  return this;
}

function initInterpolator(domain, interpolator) {
  switch (arguments.length) {
    case 0: break;
    case 1: {
      if (typeof domain === "function") this.interpolator(domain);
      else this.range(domain);
      break;
    }
    default: {
      this.domain(domain);
      if (typeof interpolator === "function") this.interpolator(interpolator);
      else this.range(interpolator);
      break;
    }
  }
  return this;
}

;// ./node_modules/d3-scale/src/ordinal.js



const implicit = Symbol("implicit");

function ordinal() {
  var index = new src/* InternMap */.Bu(),
      domain = [],
      range = [],
      unknown = implicit;

  function scale(d) {
    let i = index.get(d);
    if (i === undefined) {
      if (unknown !== implicit) return unknown;
      index.set(d, i = domain.push(d) - 1);
    }
    return range[i % range.length];
  }

  scale.domain = function(_) {
    if (!arguments.length) return domain.slice();
    domain = [], index = new src/* InternMap */.Bu();
    for (const value of _) {
      if (index.has(value)) continue;
      index.set(value, domain.push(value) - 1);
    }
    return scale;
  };

  scale.range = function(_) {
    return arguments.length ? (range = Array.from(_), scale) : range.slice();
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  scale.copy = function() {
    return ordinal(domain, range).unknown(unknown);
  };

  initRange.apply(scale, arguments);

  return scale;
}

;// ./node_modules/d3-scale/src/band.js




function band() {
  var scale = ordinal().unknown(undefined),
      domain = scale.domain,
      ordinalRange = scale.range,
      r0 = 0,
      r1 = 1,
      step,
      bandwidth,
      round = false,
      paddingInner = 0,
      paddingOuter = 0,
      align = 0.5;

  delete scale.unknown;

  function rescale() {
    var n = domain().length,
        reverse = r1 < r0,
        start = reverse ? r1 : r0,
        stop = reverse ? r0 : r1;
    step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
    if (round) step = Math.floor(step);
    start += (stop - start - step * (n - paddingInner)) * align;
    bandwidth = step * (1 - paddingInner);
    if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
    var values = (0,src/* range */.y1)(n).map(function(i) { return start + step * i; });
    return ordinalRange(reverse ? values.reverse() : values);
  }

  scale.domain = function(_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };

  scale.range = function(_) {
    return arguments.length ? ([r0, r1] = _, r0 = +r0, r1 = +r1, rescale()) : [r0, r1];
  };

  scale.rangeRound = function(_) {
    return [r0, r1] = _, r0 = +r0, r1 = +r1, round = true, rescale();
  };

  scale.bandwidth = function() {
    return bandwidth;
  };

  scale.step = function() {
    return step;
  };

  scale.round = function(_) {
    return arguments.length ? (round = !!_, rescale()) : round;
  };

  scale.padding = function(_) {
    return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_), rescale()) : paddingInner;
  };

  scale.paddingInner = function(_) {
    return arguments.length ? (paddingInner = Math.min(1, _), rescale()) : paddingInner;
  };

  scale.paddingOuter = function(_) {
    return arguments.length ? (paddingOuter = +_, rescale()) : paddingOuter;
  };

  scale.align = function(_) {
    return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
  };

  scale.copy = function() {
    return band(domain(), [r0, r1])
        .round(round)
        .paddingInner(paddingInner)
        .paddingOuter(paddingOuter)
        .align(align);
  };

  return initRange.apply(rescale(), arguments);
}

function pointish(scale) {
  var copy = scale.copy;

  scale.padding = scale.paddingOuter;
  delete scale.paddingInner;
  delete scale.paddingOuter;

  scale.copy = function() {
    return pointish(copy());
  };

  return scale;
}

function point() {
  return pointish(band.apply(null, arguments).paddingInner(1));
}

// EXTERNAL MODULE: ./node_modules/d3-interpolate/src/index.js + 25 modules
var d3_interpolate_src = __webpack_require__(20776);
;// ./node_modules/d3-scale/src/constant.js
function constants(x) {
  return function() {
    return x;
  };
}

;// ./node_modules/d3-scale/src/number.js
function number(x) {
  return +x;
}

;// ./node_modules/d3-scale/src/continuous.js





var unit = [0, 1];

function identity(x) {
  return x;
}

function normalize(a, b) {
  return (b -= (a = +a))
      ? function(x) { return (x - a) / b; }
      : constants(isNaN(b) ? NaN : 0.5);
}

function clamper(a, b) {
  var t;
  if (a > b) t = a, a = b, b = t;
  return function(x) { return Math.max(a, Math.min(b, x)); };
}

// normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
// interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
function bimap(domain, range, interpolate) {
  var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
  if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
  else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
  return function(x) { return r0(d0(x)); };
}

function polymap(domain, range, interpolate) {
  var j = Math.min(domain.length, range.length) - 1,
      d = new Array(j),
      r = new Array(j),
      i = -1;

  // Reverse descending domains.
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range = range.slice().reverse();
  }

  while (++i < j) {
    d[i] = normalize(domain[i], domain[i + 1]);
    r[i] = interpolate(range[i], range[i + 1]);
  }

  return function(x) {
    var i = (0,src/* bisect */.h1)(domain, x, 1, j) - 1;
    return r[i](d[i](x));
  };
}

function copy(source, target) {
  return target
      .domain(source.domain())
      .range(source.range())
      .interpolate(source.interpolate())
      .clamp(source.clamp())
      .unknown(source.unknown());
}

function transformer() {
  var domain = unit,
      range = unit,
      interpolate = d3_interpolate_src/* interpolate */.GW,
      transform,
      untransform,
      unknown,
      clamp = identity,
      piecewise,
      output,
      input;

  function rescale() {
    var n = Math.min(domain.length, range.length);
    if (clamp !== identity) clamp = clamper(domain[0], domain[n - 1]);
    piecewise = n > 2 ? polymap : bimap;
    output = input = null;
    return scale;
  }

  function scale(x) {
    return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate)))(transform(clamp(x)));
  }

  scale.invert = function(y) {
    return clamp(untransform((input || (input = piecewise(range, domain.map(transform), d3_interpolate_src/* interpolateNumber */.Dj)))(y)));
  };

  scale.domain = function(_) {
    return arguments.length ? (domain = Array.from(_, number), rescale()) : domain.slice();
  };

  scale.range = function(_) {
    return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
  };

  scale.rangeRound = function(_) {
    return range = Array.from(_), interpolate = d3_interpolate_src/* interpolateRound */.sH, rescale();
  };

  scale.clamp = function(_) {
    return arguments.length ? (clamp = _ ? true : identity, rescale()) : clamp !== identity;
  };

  scale.interpolate = function(_) {
    return arguments.length ? (interpolate = _, rescale()) : interpolate;
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  return function(t, u) {
    transform = t, untransform = u;
    return rescale();
  };
}

function continuous() {
  return transformer()(identity, identity);
}

// EXTERNAL MODULE: ./node_modules/d3-format/src/index.js + 15 modules
var d3_format_src = __webpack_require__(18246);
;// ./node_modules/d3-scale/src/tickFormat.js



function tickFormat(start, stop, count, specifier) {
  var step = (0,src/* tickStep */.sG)(start, stop, count),
      precision;
  specifier = (0,d3_format_src/* formatSpecifier */.Gp)(specifier == null ? ",f" : specifier);
  switch (specifier.type) {
    case "s": {
      var value = Math.max(Math.abs(start), Math.abs(stop));
      if (specifier.precision == null && !isNaN(precision = (0,d3_format_src/* precisionPrefix */.dT)(step, value))) specifier.precision = precision;
      return (0,d3_format_src/* formatPrefix */.s)(specifier, value);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      if (specifier.precision == null && !isNaN(precision = (0,d3_format_src/* precisionRound */.Pj)(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
      break;
    }
    case "f":
    case "%": {
      if (specifier.precision == null && !isNaN(precision = (0,d3_format_src/* precisionFixed */.RT)(step))) specifier.precision = precision - (specifier.type === "%") * 2;
      break;
    }
  }
  return (0,d3_format_src/* format */.GP)(specifier);
}

;// ./node_modules/d3-scale/src/linear.js





function linearish(scale) {
  var domain = scale.domain;

  scale.ticks = function(count) {
    var d = domain();
    return (0,src/* ticks */.Zc)(d[0], d[d.length - 1], count == null ? 10 : count);
  };

  scale.tickFormat = function(count, specifier) {
    var d = domain();
    return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
  };

  scale.nice = function(count) {
    if (count == null) count = 10;

    var d = domain();
    var i0 = 0;
    var i1 = d.length - 1;
    var start = d[i0];
    var stop = d[i1];
    var prestep;
    var step;
    var maxIter = 10;

    if (stop < start) {
      step = start, start = stop, stop = step;
      step = i0, i0 = i1, i1 = step;
    }
    
    while (maxIter-- > 0) {
      step = (0,src/* tickIncrement */.lq)(start, stop, count);
      if (step === prestep) {
        d[i0] = start
        d[i1] = stop
        return domain(d);
      } else if (step > 0) {
        start = Math.floor(start / step) * step;
        stop = Math.ceil(stop / step) * step;
      } else if (step < 0) {
        start = Math.ceil(start * step) / step;
        stop = Math.floor(stop * step) / step;
      } else {
        break;
      }
      prestep = step;
    }

    return scale;
  };

  return scale;
}

function linear() {
  var scale = continuous();

  scale.copy = function() {
    return copy(scale, linear());
  };

  initRange.apply(scale, arguments);

  return linearish(scale);
}

;// ./node_modules/d3-scale/src/identity.js



function identity_identity(domain) {
  var unknown;

  function scale(x) {
    return x == null || isNaN(x = +x) ? unknown : x;
  }

  scale.invert = scale;

  scale.domain = scale.range = function(_) {
    return arguments.length ? (domain = Array.from(_, number), scale) : domain.slice();
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  scale.copy = function() {
    return identity_identity(domain).unknown(unknown);
  };

  domain = arguments.length ? Array.from(domain, number) : [0, 1];

  return linearish(scale);
}

;// ./node_modules/d3-scale/src/nice.js
function nice(domain, interval) {
  domain = domain.slice();

  var i0 = 0,
      i1 = domain.length - 1,
      x0 = domain[i0],
      x1 = domain[i1],
      t;

  if (x1 < x0) {
    t = i0, i0 = i1, i1 = t;
    t = x0, x0 = x1, x1 = t;
  }

  domain[i0] = interval.floor(x0);
  domain[i1] = interval.ceil(x1);
  return domain;
}

;// ./node_modules/d3-scale/src/log.js






function transformLog(x) {
  return Math.log(x);
}

function transformExp(x) {
  return Math.exp(x);
}

function transformLogn(x) {
  return -Math.log(-x);
}

function transformExpn(x) {
  return -Math.exp(-x);
}

function pow10(x) {
  return isFinite(x) ? +("1e" + x) : x < 0 ? 0 : x;
}

function powp(base) {
  return base === 10 ? pow10
      : base === Math.E ? Math.exp
      : x => Math.pow(base, x);
}

function logp(base) {
  return base === Math.E ? Math.log
      : base === 10 && Math.log10
      || base === 2 && Math.log2
      || (base = Math.log(base), x => Math.log(x) / base);
}

function reflect(f) {
  return (x, k) => -f(-x, k);
}

function loggish(transform) {
  const scale = transform(transformLog, transformExp);
  const domain = scale.domain;
  let base = 10;
  let logs;
  let pows;

  function rescale() {
    logs = logp(base), pows = powp(base);
    if (domain()[0] < 0) {
      logs = reflect(logs), pows = reflect(pows);
      transform(transformLogn, transformExpn);
    } else {
      transform(transformLog, transformExp);
    }
    return scale;
  }

  scale.base = function(_) {
    return arguments.length ? (base = +_, rescale()) : base;
  };

  scale.domain = function(_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };

  scale.ticks = count => {
    const d = domain();
    let u = d[0];
    let v = d[d.length - 1];
    const r = v < u;

    if (r) ([u, v] = [v, u]);

    let i = logs(u);
    let j = logs(v);
    let k;
    let t;
    const n = count == null ? 10 : +count;
    let z = [];

    if (!(base % 1) && j - i < n) {
      i = Math.floor(i), j = Math.ceil(j);
      if (u > 0) for (; i <= j; ++i) {
        for (k = 1; k < base; ++k) {
          t = i < 0 ? k / pows(-i) : k * pows(i);
          if (t < u) continue;
          if (t > v) break;
          z.push(t);
        }
      } else for (; i <= j; ++i) {
        for (k = base - 1; k >= 1; --k) {
          t = i > 0 ? k / pows(-i) : k * pows(i);
          if (t < u) continue;
          if (t > v) break;
          z.push(t);
        }
      }
      if (z.length * 2 < n) z = (0,src/* ticks */.Zc)(u, v, n);
    } else {
      z = (0,src/* ticks */.Zc)(i, j, Math.min(j - i, n)).map(pows);
    }
    return r ? z.reverse() : z;
  };

  scale.tickFormat = (count, specifier) => {
    if (count == null) count = 10;
    if (specifier == null) specifier = base === 10 ? "s" : ",";
    if (typeof specifier !== "function") {
      if (!(base % 1) && (specifier = (0,d3_format_src/* formatSpecifier */.Gp)(specifier)).precision == null) specifier.trim = true;
      specifier = (0,d3_format_src/* format */.GP)(specifier);
    }
    if (count === Infinity) return specifier;
    const k = Math.max(1, base * count / scale.ticks().length); // TODO fast estimate?
    return d => {
      let i = d / pows(Math.round(logs(d)));
      if (i * base < base - 0.5) i *= base;
      return i <= k ? specifier(d) : "";
    };
  };

  scale.nice = () => {
    return domain(nice(domain(), {
      floor: x => pows(Math.floor(logs(x))),
      ceil: x => pows(Math.ceil(logs(x)))
    }));
  };

  return scale;
}

function log() {
  const scale = loggish(transformer()).domain([1, 10]);
  scale.copy = () => copy(scale, log()).base(scale.base());
  initRange.apply(scale, arguments);
  return scale;
}

;// ./node_modules/d3-scale/src/symlog.js




function transformSymlog(c) {
  return function(x) {
    return Math.sign(x) * Math.log1p(Math.abs(x / c));
  };
}

function transformSymexp(c) {
  return function(x) {
    return Math.sign(x) * Math.expm1(Math.abs(x)) * c;
  };
}

function symlogish(transform) {
  var c = 1, scale = transform(transformSymlog(c), transformSymexp(c));

  scale.constant = function(_) {
    return arguments.length ? transform(transformSymlog(c = +_), transformSymexp(c)) : c;
  };

  return linearish(scale);
}

function symlog() {
  var scale = symlogish(transformer());

  scale.copy = function() {
    return copy(scale, symlog()).constant(scale.constant());
  };

  return initRange.apply(scale, arguments);
}

;// ./node_modules/d3-scale/src/pow.js




function transformPow(exponent) {
  return function(x) {
    return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
  };
}

function transformSqrt(x) {
  return x < 0 ? -Math.sqrt(-x) : Math.sqrt(x);
}

function transformSquare(x) {
  return x < 0 ? -x * x : x * x;
}

function powish(transform) {
  var scale = transform(identity, identity),
      exponent = 1;

  function rescale() {
    return exponent === 1 ? transform(identity, identity)
        : exponent === 0.5 ? transform(transformSqrt, transformSquare)
        : transform(transformPow(exponent), transformPow(1 / exponent));
  }

  scale.exponent = function(_) {
    return arguments.length ? (exponent = +_, rescale()) : exponent;
  };

  return linearish(scale);
}

function pow() {
  var scale = powish(transformer());

  scale.copy = function() {
    return copy(scale, pow()).exponent(scale.exponent());
  };

  initRange.apply(scale, arguments);

  return scale;
}

function sqrt() {
  return pow.apply(null, arguments).exponent(0.5);
}

;// ./node_modules/d3-scale/src/radial.js





function square(x) {
  return Math.sign(x) * x * x;
}

function unsquare(x) {
  return Math.sign(x) * Math.sqrt(Math.abs(x));
}

function radial() {
  var squared = continuous(),
      range = [0, 1],
      round = false,
      unknown;

  function scale(x) {
    var y = unsquare(squared(x));
    return isNaN(y) ? unknown : round ? Math.round(y) : y;
  }

  scale.invert = function(y) {
    return squared.invert(square(y));
  };

  scale.domain = function(_) {
    return arguments.length ? (squared.domain(_), scale) : squared.domain();
  };

  scale.range = function(_) {
    return arguments.length ? (squared.range((range = Array.from(_, number)).map(square)), scale) : range.slice();
  };

  scale.rangeRound = function(_) {
    return scale.range(_).round(true);
  };

  scale.round = function(_) {
    return arguments.length ? (round = !!_, scale) : round;
  };

  scale.clamp = function(_) {
    return arguments.length ? (squared.clamp(_), scale) : squared.clamp();
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  scale.copy = function() {
    return radial(squared.domain(), range)
        .round(round)
        .clamp(squared.clamp())
        .unknown(unknown);
  };

  initRange.apply(scale, arguments);

  return linearish(scale);
}

;// ./node_modules/d3-scale/src/quantile.js



function quantile() {
  var domain = [],
      range = [],
      thresholds = [],
      unknown;

  function rescale() {
    var i = 0, n = Math.max(1, range.length);
    thresholds = new Array(n - 1);
    while (++i < n) thresholds[i - 1] = (0,src/* quantileSorted */.Z4)(domain, i / n);
    return scale;
  }

  function scale(x) {
    return x == null || isNaN(x = +x) ? unknown : range[(0,src/* bisect */.h1)(thresholds, x)];
  }

  scale.invertExtent = function(y) {
    var i = range.indexOf(y);
    return i < 0 ? [NaN, NaN] : [
      i > 0 ? thresholds[i - 1] : domain[0],
      i < thresholds.length ? thresholds[i] : domain[domain.length - 1]
    ];
  };

  scale.domain = function(_) {
    if (!arguments.length) return domain.slice();
    domain = [];
    for (let d of _) if (d != null && !isNaN(d = +d)) domain.push(d);
    domain.sort(src/* ascending */.V_);
    return rescale();
  };

  scale.range = function(_) {
    return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  scale.quantiles = function() {
    return thresholds.slice();
  };

  scale.copy = function() {
    return quantile()
        .domain(domain)
        .range(range)
        .unknown(unknown);
  };

  return initRange.apply(scale, arguments);
}

;// ./node_modules/d3-scale/src/quantize.js




function quantize() {
  var x0 = 0,
      x1 = 1,
      n = 1,
      domain = [0.5],
      range = [0, 1],
      unknown;

  function scale(x) {
    return x != null && x <= x ? range[(0,src/* bisect */.h1)(domain, x, 0, n)] : unknown;
  }

  function rescale() {
    var i = -1;
    domain = new Array(n);
    while (++i < n) domain[i] = ((i + 1) * x1 - (i - n) * x0) / (n + 1);
    return scale;
  }

  scale.domain = function(_) {
    return arguments.length ? ([x0, x1] = _, x0 = +x0, x1 = +x1, rescale()) : [x0, x1];
  };

  scale.range = function(_) {
    return arguments.length ? (n = (range = Array.from(_)).length - 1, rescale()) : range.slice();
  };

  scale.invertExtent = function(y) {
    var i = range.indexOf(y);
    return i < 0 ? [NaN, NaN]
        : i < 1 ? [x0, domain[0]]
        : i >= n ? [domain[n - 1], x1]
        : [domain[i - 1], domain[i]];
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : scale;
  };

  scale.thresholds = function() {
    return domain.slice();
  };

  scale.copy = function() {
    return quantize()
        .domain([x0, x1])
        .range(range)
        .unknown(unknown);
  };

  return initRange.apply(linearish(scale), arguments);
}

;// ./node_modules/d3-scale/src/threshold.js



function threshold() {
  var domain = [0.5],
      range = [0, 1],
      unknown,
      n = 1;

  function scale(x) {
    return x != null && x <= x ? range[(0,src/* bisect */.h1)(domain, x, 0, n)] : unknown;
  }

  scale.domain = function(_) {
    return arguments.length ? (domain = Array.from(_), n = Math.min(domain.length, range.length - 1), scale) : domain.slice();
  };

  scale.range = function(_) {
    return arguments.length ? (range = Array.from(_), n = Math.min(domain.length, range.length - 1), scale) : range.slice();
  };

  scale.invertExtent = function(y) {
    var i = range.indexOf(y);
    return [domain[i - 1], domain[i]];
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  scale.copy = function() {
    return threshold()
        .domain(domain)
        .range(range)
        .unknown(unknown);
  };

  return initRange.apply(scale, arguments);
}

// EXTERNAL MODULE: ./node_modules/d3-time/src/index.js + 11 modules
var d3_time_src = __webpack_require__(30552);
// EXTERNAL MODULE: ./node_modules/d3-time-format/src/index.js + 4 modules
var d3_time_format_src = __webpack_require__(91674);
;// ./node_modules/d3-scale/src/time.js






function date(t) {
  return new Date(t);
}

function time_number(t) {
  return t instanceof Date ? +t : +new Date(+t);
}

function calendar(ticks, tickInterval, year, month, week, day, hour, minute, second, format) {
  var scale = continuous(),
      invert = scale.invert,
      domain = scale.domain;

  var formatMillisecond = format(".%L"),
      formatSecond = format(":%S"),
      formatMinute = format("%I:%M"),
      formatHour = format("%I %p"),
      formatDay = format("%a %d"),
      formatWeek = format("%b %d"),
      formatMonth = format("%B"),
      formatYear = format("%Y");

  function tickFormat(date) {
    return (second(date) < date ? formatMillisecond
        : minute(date) < date ? formatSecond
        : hour(date) < date ? formatMinute
        : day(date) < date ? formatHour
        : month(date) < date ? (week(date) < date ? formatDay : formatWeek)
        : year(date) < date ? formatMonth
        : formatYear)(date);
  }

  scale.invert = function(y) {
    return new Date(invert(y));
  };

  scale.domain = function(_) {
    return arguments.length ? domain(Array.from(_, time_number)) : domain().map(date);
  };

  scale.ticks = function(interval) {
    var d = domain();
    return ticks(d[0], d[d.length - 1], interval == null ? 10 : interval);
  };

  scale.tickFormat = function(count, specifier) {
    return specifier == null ? tickFormat : format(specifier);
  };

  scale.nice = function(interval) {
    var d = domain();
    if (!interval || typeof interval.range !== "function") interval = tickInterval(d[0], d[d.length - 1], interval == null ? 10 : interval);
    return interval ? domain(nice(d, interval)) : scale;
  };

  scale.copy = function() {
    return copy(scale, calendar(ticks, tickInterval, year, month, week, day, hour, minute, second, format));
  };

  return scale;
}

function time() {
  return initRange.apply(calendar(d3_time_src/* timeTicks */.Cf, d3_time_src/* timeTickInterval */.yE, d3_time_src/* timeYear */.he, d3_time_src/* timeMonth */.Ui, d3_time_src/* timeWeek */.Kg, d3_time_src/* timeDay */.UA, d3_time_src/* timeHour */.Ag, d3_time_src/* timeMinute */.wX, d3_time_src/* timeSecond */.uc, d3_time_format_src/* timeFormat */.DC).domain([new Date(2000, 0, 1), new Date(2000, 0, 2)]), arguments);
}

;// ./node_modules/d3-scale/src/utcTime.js





function utcTime() {
  return initRange.apply(calendar(d3_time_src/* utcTicks */.$Z, d3_time_src/* utcTickInterval */.lk, d3_time_src/* utcYear */.Mb, d3_time_src/* utcMonth */.R6, d3_time_src/* utcWeek */.zX, d3_time_src/* utcDay */.dA, d3_time_src/* utcHour */.pz, d3_time_src/* utcMinute */.O0, d3_time_src/* utcSecond */.Hn, d3_time_format_src/* utcFormat */.aL).domain([Date.UTC(2000, 0, 1), Date.UTC(2000, 0, 2)]), arguments);
}

;// ./node_modules/d3-scale/src/sequential.js








function sequential_transformer() {
  var x0 = 0,
      x1 = 1,
      t0,
      t1,
      k10,
      transform,
      interpolator = identity,
      clamp = false,
      unknown;

  function scale(x) {
    return x == null || isNaN(x = +x) ? unknown : interpolator(k10 === 0 ? 0.5 : (x = (transform(x) - t0) * k10, clamp ? Math.max(0, Math.min(1, x)) : x));
  }

  scale.domain = function(_) {
    return arguments.length ? ([x0, x1] = _, t0 = transform(x0 = +x0), t1 = transform(x1 = +x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0), scale) : [x0, x1];
  };

  scale.clamp = function(_) {
    return arguments.length ? (clamp = !!_, scale) : clamp;
  };

  scale.interpolator = function(_) {
    return arguments.length ? (interpolator = _, scale) : interpolator;
  };

  function range(interpolate) {
    return function(_) {
      var r0, r1;
      return arguments.length ? ([r0, r1] = _, interpolator = interpolate(r0, r1), scale) : [interpolator(0), interpolator(1)];
    };
  }

  scale.range = range(d3_interpolate_src/* interpolate */.GW);

  scale.rangeRound = range(d3_interpolate_src/* interpolateRound */.sH);

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  return function(t) {
    transform = t, t0 = t(x0), t1 = t(x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0);
    return scale;
  };
}

function sequential_copy(source, target) {
  return target
      .domain(source.domain())
      .interpolator(source.interpolator())
      .clamp(source.clamp())
      .unknown(source.unknown());
}

function sequential() {
  var scale = linearish(sequential_transformer()(identity));

  scale.copy = function() {
    return sequential_copy(scale, sequential());
  };

  return initInterpolator.apply(scale, arguments);
}

function sequentialLog() {
  var scale = loggish(sequential_transformer()).domain([1, 10]);

  scale.copy = function() {
    return sequential_copy(scale, sequentialLog()).base(scale.base());
  };

  return initInterpolator.apply(scale, arguments);
}

function sequentialSymlog() {
  var scale = symlogish(sequential_transformer());

  scale.copy = function() {
    return sequential_copy(scale, sequentialSymlog()).constant(scale.constant());
  };

  return initInterpolator.apply(scale, arguments);
}

function sequentialPow() {
  var scale = powish(sequential_transformer());

  scale.copy = function() {
    return sequential_copy(scale, sequentialPow()).exponent(scale.exponent());
  };

  return initInterpolator.apply(scale, arguments);
}

function sequentialSqrt() {
  return sequentialPow.apply(null, arguments).exponent(0.5);
}

;// ./node_modules/d3-scale/src/sequentialQuantile.js




function sequentialQuantile() {
  var domain = [],
      interpolator = identity;

  function scale(x) {
    if (x != null && !isNaN(x = +x)) return interpolator(((0,src/* bisect */.h1)(domain, x, 1) - 1) / (domain.length - 1));
  }

  scale.domain = function(_) {
    if (!arguments.length) return domain.slice();
    domain = [];
    for (let d of _) if (d != null && !isNaN(d = +d)) domain.push(d);
    domain.sort(src/* ascending */.V_);
    return scale;
  };

  scale.interpolator = function(_) {
    return arguments.length ? (interpolator = _, scale) : interpolator;
  };

  scale.range = function() {
    return domain.map((d, i) => interpolator(i / (domain.length - 1)));
  };

  scale.quantiles = function(n) {
    return Array.from({length: n + 1}, (_, i) => (0,src/* quantile */.YV)(domain, i / n));
  };

  scale.copy = function() {
    return sequentialQuantile(interpolator).domain(domain);
  };

  return initInterpolator.apply(scale, arguments);
}

;// ./node_modules/d3-scale/src/diverging.js









function diverging_transformer() {
  var x0 = 0,
      x1 = 0.5,
      x2 = 1,
      s = 1,
      t0,
      t1,
      t2,
      k10,
      k21,
      interpolator = identity,
      transform,
      clamp = false,
      unknown;

  function scale(x) {
    return isNaN(x = +x) ? unknown : (x = 0.5 + ((x = +transform(x)) - t1) * (s * x < s * t1 ? k10 : k21), interpolator(clamp ? Math.max(0, Math.min(1, x)) : x));
  }

  scale.domain = function(_) {
    return arguments.length ? ([x0, x1, x2] = _, t0 = transform(x0 = +x0), t1 = transform(x1 = +x1), t2 = transform(x2 = +x2), k10 = t0 === t1 ? 0 : 0.5 / (t1 - t0), k21 = t1 === t2 ? 0 : 0.5 / (t2 - t1), s = t1 < t0 ? -1 : 1, scale) : [x0, x1, x2];
  };

  scale.clamp = function(_) {
    return arguments.length ? (clamp = !!_, scale) : clamp;
  };

  scale.interpolator = function(_) {
    return arguments.length ? (interpolator = _, scale) : interpolator;
  };

  function range(interpolate) {
    return function(_) {
      var r0, r1, r2;
      return arguments.length ? ([r0, r1, r2] = _, interpolator = (0,d3_interpolate_src/* piecewise */.$B)(interpolate, [r0, r1, r2]), scale) : [interpolator(0), interpolator(0.5), interpolator(1)];
    };
  }

  scale.range = range(d3_interpolate_src/* interpolate */.GW);

  scale.rangeRound = range(d3_interpolate_src/* interpolateRound */.sH);

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  return function(t) {
    transform = t, t0 = t(x0), t1 = t(x1), t2 = t(x2), k10 = t0 === t1 ? 0 : 0.5 / (t1 - t0), k21 = t1 === t2 ? 0 : 0.5 / (t2 - t1), s = t1 < t0 ? -1 : 1;
    return scale;
  };
}

function diverging() {
  var scale = linearish(diverging_transformer()(identity));

  scale.copy = function() {
    return sequential_copy(scale, diverging());
  };

  return initInterpolator.apply(scale, arguments);
}

function divergingLog() {
  var scale = loggish(diverging_transformer()).domain([0.1, 1, 10]);

  scale.copy = function() {
    return sequential_copy(scale, divergingLog()).base(scale.base());
  };

  return initInterpolator.apply(scale, arguments);
}

function divergingSymlog() {
  var scale = symlogish(diverging_transformer());

  scale.copy = function() {
    return sequential_copy(scale, divergingSymlog()).constant(scale.constant());
  };

  return initInterpolator.apply(scale, arguments);
}

function divergingPow() {
  var scale = powish(diverging_transformer());

  scale.copy = function() {
    return sequential_copy(scale, divergingPow()).exponent(scale.exponent());
  };

  return initInterpolator.apply(scale, arguments);
}

function divergingSqrt() {
  return divergingPow.apply(null, arguments).exponent(0.5);
}

;// ./node_modules/d3-scale/src/index.js



































/***/ }),

/***/ 30552:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  UA: () => (/* reexport */ timeDay),
  Ag: () => (/* reexport */ timeHour),
  wX: () => (/* reexport */ timeMinute),
  AB: () => (/* reexport */ timeMonday),
  Ui: () => (/* reexport */ timeMonth),
  uc: () => (/* reexport */ second),
  YP: () => (/* reexport */ timeSunday),
  Mo: () => (/* reexport */ timeThursday),
  yE: () => (/* reexport */ timeTickInterval),
  Cf: () => (/* reexport */ timeTicks),
  Kg: () => (/* reexport */ timeSunday),
  he: () => (/* reexport */ timeYear),
  dA: () => (/* reexport */ utcDay),
  pz: () => (/* reexport */ utcHour),
  O0: () => (/* reexport */ utcMinute),
  rt: () => (/* reexport */ utcMonday),
  R6: () => (/* reexport */ utcMonth),
  Hn: () => (/* reexport */ second),
  Hl: () => (/* reexport */ utcSunday),
  pT: () => (/* reexport */ utcThursday),
  lk: () => (/* reexport */ utcTickInterval),
  $Z: () => (/* reexport */ utcTicks),
  zX: () => (/* reexport */ utcSunday),
  Mb: () => (/* reexport */ utcYear)
});

// UNUSED EXPORTS: timeDays, timeFriday, timeFridays, timeHours, timeInterval, timeMillisecond, timeMilliseconds, timeMinutes, timeMondays, timeMonths, timeSaturday, timeSaturdays, timeSeconds, timeSundays, timeThursdays, timeTuesday, timeTuesdays, timeWednesday, timeWednesdays, timeWeeks, timeYears, unixDay, unixDays, utcDays, utcFriday, utcFridays, utcHours, utcMillisecond, utcMilliseconds, utcMinutes, utcMondays, utcMonths, utcSaturday, utcSaturdays, utcSeconds, utcSundays, utcThursdays, utcTuesday, utcTuesdays, utcWednesday, utcWednesdays, utcWeeks, utcYears

;// ./node_modules/d3-time/src/interval.js
const t0 = new Date, t1 = new Date;

function timeInterval(floori, offseti, count, field) {

  function interval(date) {
    return floori(date = arguments.length === 0 ? new Date : new Date(+date)), date;
  }

  interval.floor = (date) => {
    return floori(date = new Date(+date)), date;
  };

  interval.ceil = (date) => {
    return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
  };

  interval.round = (date) => {
    const d0 = interval(date), d1 = interval.ceil(date);
    return date - d0 < d1 - date ? d0 : d1;
  };

  interval.offset = (date, step) => {
    return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
  };

  interval.range = (start, stop, step) => {
    const range = [];
    start = interval.ceil(start);
    step = step == null ? 1 : Math.floor(step);
    if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
    let previous;
    do range.push(previous = new Date(+start)), offseti(start, step), floori(start);
    while (previous < start && start < stop);
    return range;
  };

  interval.filter = (test) => {
    return timeInterval((date) => {
      if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
    }, (date, step) => {
      if (date >= date) {
        if (step < 0) while (++step <= 0) {
          while (offseti(date, -1), !test(date)) {} // eslint-disable-line no-empty
        } else while (--step >= 0) {
          while (offseti(date, +1), !test(date)) {} // eslint-disable-line no-empty
        }
      }
    });
  };

  if (count) {
    interval.count = (start, end) => {
      t0.setTime(+start), t1.setTime(+end);
      floori(t0), floori(t1);
      return Math.floor(count(t0, t1));
    };

    interval.every = (step) => {
      step = Math.floor(step);
      return !isFinite(step) || !(step > 0) ? null
          : !(step > 1) ? interval
          : interval.filter(field
              ? (d) => field(d) % step === 0
              : (d) => interval.count(0, d) % step === 0);
    };
  }

  return interval;
}

;// ./node_modules/d3-time/src/millisecond.js


const millisecond = timeInterval(() => {
  // noop
}, (date, step) => {
  date.setTime(+date + step);
}, (start, end) => {
  return end - start;
});

// An optimized implementation for this simple case.
millisecond.every = (k) => {
  k = Math.floor(k);
  if (!isFinite(k) || !(k > 0)) return null;
  if (!(k > 1)) return millisecond;
  return timeInterval((date) => {
    date.setTime(Math.floor(date / k) * k);
  }, (date, step) => {
    date.setTime(+date + step * k);
  }, (start, end) => {
    return (end - start) / k;
  });
};

const milliseconds = millisecond.range;

;// ./node_modules/d3-time/src/duration.js
const durationSecond = 1000;
const durationMinute = durationSecond * 60;
const durationHour = durationMinute * 60;
const durationDay = durationHour * 24;
const durationWeek = durationDay * 7;
const durationMonth = durationDay * 30;
const durationYear = durationDay * 365;

;// ./node_modules/d3-time/src/second.js



const second = timeInterval((date) => {
  date.setTime(date - date.getMilliseconds());
}, (date, step) => {
  date.setTime(+date + step * durationSecond);
}, (start, end) => {
  return (end - start) / durationSecond;
}, (date) => {
  return date.getUTCSeconds();
});

const seconds = second.range;

;// ./node_modules/d3-time/src/minute.js



const timeMinute = timeInterval((date) => {
  date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond);
}, (date, step) => {
  date.setTime(+date + step * durationMinute);
}, (start, end) => {
  return (end - start) / durationMinute;
}, (date) => {
  return date.getMinutes();
});

const timeMinutes = timeMinute.range;

const utcMinute = timeInterval((date) => {
  date.setUTCSeconds(0, 0);
}, (date, step) => {
  date.setTime(+date + step * durationMinute);
}, (start, end) => {
  return (end - start) / durationMinute;
}, (date) => {
  return date.getUTCMinutes();
});

const utcMinutes = utcMinute.range;

;// ./node_modules/d3-time/src/hour.js



const timeHour = timeInterval((date) => {
  date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond - date.getMinutes() * durationMinute);
}, (date, step) => {
  date.setTime(+date + step * durationHour);
}, (start, end) => {
  return (end - start) / durationHour;
}, (date) => {
  return date.getHours();
});

const timeHours = timeHour.range;

const utcHour = timeInterval((date) => {
  date.setUTCMinutes(0, 0, 0);
}, (date, step) => {
  date.setTime(+date + step * durationHour);
}, (start, end) => {
  return (end - start) / durationHour;
}, (date) => {
  return date.getUTCHours();
});

const utcHours = utcHour.range;

;// ./node_modules/d3-time/src/day.js



const timeDay = timeInterval(
  date => date.setHours(0, 0, 0, 0),
  (date, step) => date.setDate(date.getDate() + step),
  (start, end) => (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay,
  date => date.getDate() - 1
);

const timeDays = timeDay.range;

const utcDay = timeInterval((date) => {
  date.setUTCHours(0, 0, 0, 0);
}, (date, step) => {
  date.setUTCDate(date.getUTCDate() + step);
}, (start, end) => {
  return (end - start) / durationDay;
}, (date) => {
  return date.getUTCDate() - 1;
});

const utcDays = utcDay.range;

const unixDay = timeInterval((date) => {
  date.setUTCHours(0, 0, 0, 0);
}, (date, step) => {
  date.setUTCDate(date.getUTCDate() + step);
}, (start, end) => {
  return (end - start) / durationDay;
}, (date) => {
  return Math.floor(date / durationDay);
});

const unixDays = unixDay.range;

;// ./node_modules/d3-time/src/week.js



function timeWeekday(i) {
  return timeInterval((date) => {
    date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
    date.setHours(0, 0, 0, 0);
  }, (date, step) => {
    date.setDate(date.getDate() + step * 7);
  }, (start, end) => {
    return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
  });
}

const timeSunday = timeWeekday(0);
const timeMonday = timeWeekday(1);
const timeTuesday = timeWeekday(2);
const timeWednesday = timeWeekday(3);
const timeThursday = timeWeekday(4);
const timeFriday = timeWeekday(5);
const timeSaturday = timeWeekday(6);

const timeSundays = timeSunday.range;
const timeMondays = timeMonday.range;
const timeTuesdays = timeTuesday.range;
const timeWednesdays = timeWednesday.range;
const timeThursdays = timeThursday.range;
const timeFridays = timeFriday.range;
const timeSaturdays = timeSaturday.range;

function utcWeekday(i) {
  return timeInterval((date) => {
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
    date.setUTCHours(0, 0, 0, 0);
  }, (date, step) => {
    date.setUTCDate(date.getUTCDate() + step * 7);
  }, (start, end) => {
    return (end - start) / durationWeek;
  });
}

const utcSunday = utcWeekday(0);
const utcMonday = utcWeekday(1);
const utcTuesday = utcWeekday(2);
const utcWednesday = utcWeekday(3);
const utcThursday = utcWeekday(4);
const utcFriday = utcWeekday(5);
const utcSaturday = utcWeekday(6);

const utcSundays = utcSunday.range;
const utcMondays = utcMonday.range;
const utcTuesdays = utcTuesday.range;
const utcWednesdays = utcWednesday.range;
const utcThursdays = utcThursday.range;
const utcFridays = utcFriday.range;
const utcSaturdays = utcSaturday.range;

;// ./node_modules/d3-time/src/month.js


const timeMonth = timeInterval((date) => {
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
}, (date, step) => {
  date.setMonth(date.getMonth() + step);
}, (start, end) => {
  return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
}, (date) => {
  return date.getMonth();
});

const timeMonths = timeMonth.range;

const utcMonth = timeInterval((date) => {
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
}, (date, step) => {
  date.setUTCMonth(date.getUTCMonth() + step);
}, (start, end) => {
  return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
}, (date) => {
  return date.getUTCMonth();
});

const utcMonths = utcMonth.range;

;// ./node_modules/d3-time/src/year.js


const timeYear = timeInterval((date) => {
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
}, (date, step) => {
  date.setFullYear(date.getFullYear() + step);
}, (start, end) => {
  return end.getFullYear() - start.getFullYear();
}, (date) => {
  return date.getFullYear();
});

// An optimized implementation for this simple case.
timeYear.every = (k) => {
  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : timeInterval((date) => {
    date.setFullYear(Math.floor(date.getFullYear() / k) * k);
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
  }, (date, step) => {
    date.setFullYear(date.getFullYear() + step * k);
  });
};

const timeYears = timeYear.range;

const utcYear = timeInterval((date) => {
  date.setUTCMonth(0, 1);
  date.setUTCHours(0, 0, 0, 0);
}, (date, step) => {
  date.setUTCFullYear(date.getUTCFullYear() + step);
}, (start, end) => {
  return end.getUTCFullYear() - start.getUTCFullYear();
}, (date) => {
  return date.getUTCFullYear();
});

// An optimized implementation for this simple case.
utcYear.every = (k) => {
  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : timeInterval((date) => {
    date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
  }, (date, step) => {
    date.setUTCFullYear(date.getUTCFullYear() + step * k);
  });
};

const utcYears = utcYear.range;

// EXTERNAL MODULE: ./node_modules/d3-array/src/index.js + 60 modules
var src = __webpack_require__(3398);
;// ./node_modules/d3-time/src/ticks.js











function ticker(year, month, week, day, hour, minute) {

  const tickIntervals = [
    [second,  1,      durationSecond],
    [second,  5,  5 * durationSecond],
    [second, 15, 15 * durationSecond],
    [second, 30, 30 * durationSecond],
    [minute,  1,      durationMinute],
    [minute,  5,  5 * durationMinute],
    [minute, 15, 15 * durationMinute],
    [minute, 30, 30 * durationMinute],
    [  hour,  1,      durationHour  ],
    [  hour,  3,  3 * durationHour  ],
    [  hour,  6,  6 * durationHour  ],
    [  hour, 12, 12 * durationHour  ],
    [   day,  1,      durationDay   ],
    [   day,  2,  2 * durationDay   ],
    [  week,  1,      durationWeek  ],
    [ month,  1,      durationMonth ],
    [ month,  3,  3 * durationMonth ],
    [  year,  1,      durationYear  ]
  ];

  function ticks(start, stop, count) {
    const reverse = stop < start;
    if (reverse) [start, stop] = [stop, start];
    const interval = count && typeof count.range === "function" ? count : tickInterval(start, stop, count);
    const ticks = interval ? interval.range(start, +stop + 1) : []; // inclusive stop
    return reverse ? ticks.reverse() : ticks;
  }

  function tickInterval(start, stop, count) {
    const target = Math.abs(stop - start) / count;
    const i = (0,src/* bisector */.yl)(([,, step]) => step).right(tickIntervals, target);
    if (i === tickIntervals.length) return year.every((0,src/* tickStep */.sG)(start / durationYear, stop / durationYear, count));
    if (i === 0) return millisecond.every(Math.max((0,src/* tickStep */.sG)(start, stop, count), 1));
    const [t, step] = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
    return t.every(step);
  }

  return [ticks, tickInterval];
}

const [utcTicks, utcTickInterval] = ticker(utcYear, utcMonth, utcSunday, unixDay, utcHour, utcMinute);
const [timeTicks, timeTickInterval] = ticker(timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute);



;// ./node_modules/d3-time/src/index.js





















/***/ }),

/***/ 53363:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  jN: () => (/* reexport */ matcher),
  MF: () => (/* reexport */ namespace),
  Wn: () => (/* reexport */ src_pointer),
  Lt: () => (/* reexport */ src_select),
  r1: () => (/* reexport */ src_selection),
  gD: () => (/* reexport */ selector),
  XM: () => (/* reexport */ selectorAll),
  iF: () => (/* reexport */ styleValue)
});

// UNUSED EXPORTS: create, creator, local, namespaces, pointers, selectAll, window

;// ./node_modules/d3-selection/src/namespaces.js
var xhtml = "http://www.w3.org/1999/xhtml";

/* harmony default export */ const namespaces = ({
  svg: "http://www.w3.org/2000/svg",
  xhtml: xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
});

;// ./node_modules/d3-selection/src/namespace.js


/* harmony default export */ function namespace(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
  return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name; // eslint-disable-line no-prototype-builtins
}

;// ./node_modules/d3-selection/src/creator.js



function creatorInherit(name) {
  return function() {
    var document = this.ownerDocument,
        uri = this.namespaceURI;
    return uri === xhtml && document.documentElement.namespaceURI === xhtml
        ? document.createElement(name)
        : document.createElementNS(uri, name);
  };
}

function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}

/* harmony default export */ function src_creator(name) {
  var fullname = namespace(name);
  return (fullname.local
      ? creatorFixed
      : creatorInherit)(fullname);
}

;// ./node_modules/d3-selection/src/selector.js
function none() {}

/* harmony default export */ function selector(selector) {
  return selector == null ? none : function() {
    return this.querySelector(selector);
  };
}

;// ./node_modules/d3-selection/src/selection/select.js



/* harmony default export */ function selection_select(select) {
  if (typeof select !== "function") select = selector(select);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }

  return new selection_Selection(subgroups, this._parents);
}

;// ./node_modules/d3-selection/src/array.js
// Given something array like (or null), returns something that is strictly an
// array. This is used to ensure that array-like objects passed to d3.selectAll
// or selection.selectAll are converted into proper arrays when creating a
// selection; we don’t ever want to create a selection backed by a live
// HTMLCollection or NodeList. However, note that selection.selectAll will use a
// static NodeList as a group, since it safely derived from querySelectorAll.
function array_array(x) {
  return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
}

;// ./node_modules/d3-selection/src/selectorAll.js
function empty() {
  return [];
}

/* harmony default export */ function selectorAll(selector) {
  return selector == null ? empty : function() {
    return this.querySelectorAll(selector);
  };
}

;// ./node_modules/d3-selection/src/selection/selectAll.js




function arrayAll(select) {
  return function() {
    return array_array(select.apply(this, arguments));
  };
}

/* harmony default export */ function selectAll(select) {
  if (typeof select === "function") select = arrayAll(select);
  else select = selectorAll(select);

  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }

  return new selection_Selection(subgroups, parents);
}

;// ./node_modules/d3-selection/src/matcher.js
/* harmony default export */ function matcher(selector) {
  return function() {
    return this.matches(selector);
  };
}

function childMatcher(selector) {
  return function(node) {
    return node.matches(selector);
  };
}


;// ./node_modules/d3-selection/src/selection/selectChild.js


var find = Array.prototype.find;

function childFind(match) {
  return function() {
    return find.call(this.children, match);
  };
}

function childFirst() {
  return this.firstElementChild;
}

/* harmony default export */ function selectChild(match) {
  return this.select(match == null ? childFirst
      : childFind(typeof match === "function" ? match : childMatcher(match)));
}

;// ./node_modules/d3-selection/src/selection/selectChildren.js


var filter = Array.prototype.filter;

function children() {
  return Array.from(this.children);
}

function childrenFilter(match) {
  return function() {
    return filter.call(this.children, match);
  };
}

/* harmony default export */ function selectChildren(match) {
  return this.selectAll(match == null ? children
      : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}

;// ./node_modules/d3-selection/src/selection/filter.js



/* harmony default export */ function selection_filter(match) {
  if (typeof match !== "function") match = matcher(match);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }

  return new selection_Selection(subgroups, this._parents);
}

;// ./node_modules/d3-selection/src/selection/sparse.js
/* harmony default export */ function sparse(update) {
  return new Array(update.length);
}

;// ./node_modules/d3-selection/src/selection/enter.js



/* harmony default export */ function enter() {
  return new selection_Selection(this._enter || this._groups.map(sparse), this._parents);
}

function EnterNode(parent, datum) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum;
}

EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
  insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
  querySelector: function(selector) { return this._parent.querySelector(selector); },
  querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
};

;// ./node_modules/d3-selection/src/constant.js
/* harmony default export */ function constant(x) {
  return function() {
    return x;
  };
}

;// ./node_modules/d3-selection/src/selection/data.js




function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0,
      node,
      groupLength = group.length,
      dataLength = data.length;

  // Put any non-null nodes that fit into update.
  // Put any null nodes into enter.
  // Put any remaining data into enter.
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }

  // Put any non-null nodes that don’t fit into exit.
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}

function bindKey(parent, group, enter, update, exit, data, key) {
  var i,
      node,
      nodeByKeyValue = new Map,
      groupLength = group.length,
      dataLength = data.length,
      keyValues = new Array(groupLength),
      keyValue;

  // Compute the key for each node.
  // If multiple nodes have the same key, the duplicates are added to exit.
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node;
      } else {
        nodeByKeyValue.set(keyValue, node);
      }
    }
  }

  // Compute the key for each datum.
  // If there a node associated with this key, join and add it to update.
  // If there is not (or the key is a duplicate), add it to enter.
  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + "";
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue.delete(keyValue);
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }

  // Add any remaining nodes that were not bound to data to exit.
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && (nodeByKeyValue.get(keyValues[i]) === node)) {
      exit[i] = node;
    }
  }
}

function datum(node) {
  return node.__data__;
}

/* harmony default export */ function data(value, key) {
  if (!arguments.length) return Array.from(this, datum);

  var bind = key ? bindKey : bindIndex,
      parents = this._parents,
      groups = this._groups;

  if (typeof value !== "function") value = constant(value);

  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j],
        group = groups[j],
        groupLength = group.length,
        data = arraylike(value.call(parent, parent && parent.__data__, j, parents)),
        dataLength = data.length,
        enterGroup = enter[j] = new Array(dataLength),
        updateGroup = update[j] = new Array(dataLength),
        exitGroup = exit[j] = new Array(groupLength);

    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

    // Now connect the enter nodes to their following update node, such that
    // appendChild can insert the materialized enter node before this node,
    // rather than at the end of the parent node.
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1) i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength);
        previous._next = next || null;
      }
    }
  }

  update = new selection_Selection(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}

// Given some data, this returns an array-like view of it: an object that
// exposes a length property and allows numeric indexing. Note that unlike
// selectAll, this isn’t worried about “live” collections because the resulting
// array will only be used briefly while data is being bound. (It is possible to
// cause the data to change while iterating by using a key function, but please
// don’t; we’d rather avoid a gratuitous copy.)
function arraylike(data) {
  return typeof data === "object" && "length" in data
    ? data // Array, TypedArray, NodeList, array-like
    : Array.from(data); // Map, Set, iterable, string, or anything else
}

;// ./node_modules/d3-selection/src/selection/exit.js



/* harmony default export */ function exit() {
  return new selection_Selection(this._exit || this._groups.map(sparse), this._parents);
}

;// ./node_modules/d3-selection/src/selection/join.js
/* harmony default export */ function join(onenter, onupdate, onexit) {
  var enter = this.enter(), update = this, exit = this.exit();
  if (typeof onenter === "function") {
    enter = onenter(enter);
    if (enter) enter = enter.selection();
  } else {
    enter = enter.append(onenter + "");
  }
  if (onupdate != null) {
    update = onupdate(update);
    if (update) update = update.selection();
  }
  if (onexit == null) exit.remove(); else onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}

;// ./node_modules/d3-selection/src/selection/merge.js


/* harmony default export */ function merge(context) {
  var selection = context.selection ? context.selection() : context;

  for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }

  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }

  return new selection_Selection(merges, this._parents);
}

;// ./node_modules/d3-selection/src/selection/order.js
/* harmony default export */ function order() {

  for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }

  return this;
}

;// ./node_modules/d3-selection/src/selection/sort.js


/* harmony default export */ function sort(compare) {
  if (!compare) compare = ascending;

  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }

  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }

  return new selection_Selection(sortgroups, this._parents).order();
}

function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

;// ./node_modules/d3-selection/src/selection/call.js
/* harmony default export */ function call() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}

;// ./node_modules/d3-selection/src/selection/nodes.js
/* harmony default export */ function nodes() {
  return Array.from(this);
}

;// ./node_modules/d3-selection/src/selection/node.js
/* harmony default export */ function node() {

  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node) return node;
    }
  }

  return null;
}

;// ./node_modules/d3-selection/src/selection/size.js
/* harmony default export */ function size() {
  let size = 0;
  for (const node of this) ++size; // eslint-disable-line no-unused-vars
  return size;
}

;// ./node_modules/d3-selection/src/selection/empty.js
/* harmony default export */ function selection_empty() {
  return !this.node();
}

;// ./node_modules/d3-selection/src/selection/each.js
/* harmony default export */ function each(callback) {

  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) callback.call(node, node.__data__, i, group);
    }
  }

  return this;
}

;// ./node_modules/d3-selection/src/selection/attr.js


function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}

function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}

function attrConstant(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}

function attrConstantNS(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}

function attrFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttribute(name);
    else this.setAttribute(name, v);
  };
}

function attrFunctionNS(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
    else this.setAttributeNS(fullname.space, fullname.local, v);
  };
}

/* harmony default export */ function attr(name, value) {
  var fullname = namespace(name);

  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local
        ? node.getAttributeNS(fullname.space, fullname.local)
        : node.getAttribute(fullname);
  }

  return this.each((value == null
      ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
      ? (fullname.local ? attrFunctionNS : attrFunction)
      : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
}

;// ./node_modules/d3-selection/src/window.js
/* harmony default export */ function src_window(node) {
  return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
      || (node.document && node) // node is a Window
      || node.defaultView; // node is a Document
}

;// ./node_modules/d3-selection/src/selection/style.js


function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}

function styleConstant(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}

function styleFunction(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.style.removeProperty(name);
    else this.style.setProperty(name, v, priority);
  };
}

/* harmony default export */ function style(name, value, priority) {
  return arguments.length > 1
      ? this.each((value == null
            ? styleRemove : typeof value === "function"
            ? styleFunction
            : styleConstant)(name, value, priority == null ? "" : priority))
      : styleValue(this.node(), name);
}

function styleValue(node, name) {
  return node.style.getPropertyValue(name)
      || src_window(node).getComputedStyle(node, null).getPropertyValue(name);
}

;// ./node_modules/d3-selection/src/selection/property.js
function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}

function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}

function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) delete this[name];
    else this[name] = v;
  };
}

/* harmony default export */ function property(name, value) {
  return arguments.length > 1
      ? this.each((value == null
          ? propertyRemove : typeof value === "function"
          ? propertyFunction
          : propertyConstant)(name, value))
      : this.node()[name];
}

;// ./node_modules/d3-selection/src/selection/classed.js
function classArray(string) {
  return string.trim().split(/^|\s+/);
}

function classList(node) {
  return node.classList || new ClassList(node);
}

function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}

ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};

function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.add(names[i]);
}

function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.remove(names[i]);
}

function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}

function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}

function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}

/* harmony default export */ function classed(name, value) {
  var names = classArray(name + "");

  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n) if (!list.contains(names[i])) return false;
    return true;
  }

  return this.each((typeof value === "function"
      ? classedFunction : value
      ? classedTrue
      : classedFalse)(names, value));
}

;// ./node_modules/d3-selection/src/selection/text.js
function textRemove() {
  this.textContent = "";
}

function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}

function textFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}

/* harmony default export */ function selection_text(value) {
  return arguments.length
      ? this.each(value == null
          ? textRemove : (typeof value === "function"
          ? textFunction
          : textConstant)(value))
      : this.node().textContent;
}

;// ./node_modules/d3-selection/src/selection/html.js
function htmlRemove() {
  this.innerHTML = "";
}

function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}

function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}

/* harmony default export */ function html(value) {
  return arguments.length
      ? this.each(value == null
          ? htmlRemove : (typeof value === "function"
          ? htmlFunction
          : htmlConstant)(value))
      : this.node().innerHTML;
}

;// ./node_modules/d3-selection/src/selection/raise.js
function raise() {
  if (this.nextSibling) this.parentNode.appendChild(this);
}

/* harmony default export */ function selection_raise() {
  return this.each(raise);
}

;// ./node_modules/d3-selection/src/selection/lower.js
function lower() {
  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
}

/* harmony default export */ function selection_lower() {
  return this.each(lower);
}

;// ./node_modules/d3-selection/src/selection/append.js


/* harmony default export */ function append(name) {
  var create = typeof name === "function" ? name : src_creator(name);
  return this.select(function() {
    return this.appendChild(create.apply(this, arguments));
  });
}

;// ./node_modules/d3-selection/src/selection/insert.js



function constantNull() {
  return null;
}

/* harmony default export */ function insert(name, before) {
  var create = typeof name === "function" ? name : src_creator(name),
      select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
  return this.select(function() {
    return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
  });
}

;// ./node_modules/d3-selection/src/selection/remove.js
function remove() {
  var parent = this.parentNode;
  if (parent) parent.removeChild(this);
}

/* harmony default export */ function selection_remove() {
  return this.each(remove);
}

;// ./node_modules/d3-selection/src/selection/clone.js
function selection_cloneShallow() {
  var clone = this.cloneNode(false), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}

function selection_cloneDeep() {
  var clone = this.cloneNode(true), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}

/* harmony default export */ function clone(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}

;// ./node_modules/d3-selection/src/selection/datum.js
/* harmony default export */ function selection_datum(value) {
  return arguments.length
      ? this.property("__data__", value)
      : this.node().__data__;
}

;// ./node_modules/d3-selection/src/selection/on.js
function contextListener(listener) {
  return function(event) {
    listener.call(this, event, this.__data__);
  };
}

function parseTypenames(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    return {type: t, name: name};
  });
}

function onRemove(typename) {
  return function() {
    var on = this.__on;
    if (!on) return;
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
      } else {
        on[++i] = o;
      }
    }
    if (++i) on.length = i;
    else delete this.__on;
  };
}

function onAdd(typename, value, options) {
  return function() {
    var on = this.__on, o, listener = contextListener(value);
    if (on) for (var j = 0, m = on.length; j < m; ++j) {
      if ((o = on[j]).type === typename.type && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
        this.addEventListener(o.type, o.listener = listener, o.options = options);
        o.value = value;
        return;
      }
    }
    this.addEventListener(typename.type, listener, options);
    o = {type: typename.type, name: typename.name, value: value, listener: listener, options: options};
    if (!on) this.__on = [o];
    else on.push(o);
  };
}

/* harmony default export */ function on(typename, value, options) {
  var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
      for (i = 0, o = on[j]; i < n; ++i) {
        if ((t = typenames[i]).type === o.type && t.name === o.name) {
          return o.value;
        }
      }
    }
    return;
  }

  on = value ? onAdd : onRemove;
  for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
  return this;
}

;// ./node_modules/d3-selection/src/selection/dispatch.js


function dispatchEvent(node, type, params) {
  var window = src_window(node),
      event = window.CustomEvent;

  if (typeof event === "function") {
    event = new event(type, params);
  } else {
    event = window.document.createEvent("Event");
    if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
    else event.initEvent(type, false, false);
  }

  node.dispatchEvent(event);
}

function dispatchConstant(type, params) {
  return function() {
    return dispatchEvent(this, type, params);
  };
}

function dispatchFunction(type, params) {
  return function() {
    return dispatchEvent(this, type, params.apply(this, arguments));
  };
}

/* harmony default export */ function dispatch(type, params) {
  return this.each((typeof params === "function"
      ? dispatchFunction
      : dispatchConstant)(type, params));
}

;// ./node_modules/d3-selection/src/selection/iterator.js
/* harmony default export */ function* iterator() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) yield node;
    }
  }
}

;// ./node_modules/d3-selection/src/selection/index.js



































var selection_root = [null];

function selection_Selection(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}

function selection() {
  return new selection_Selection([[document.documentElement]], selection_root);
}

function selection_selection() {
  return this;
}

selection_Selection.prototype = selection.prototype = {
  constructor: selection_Selection,
  select: selection_select,
  selectAll: selectAll,
  selectChild: selectChild,
  selectChildren: selectChildren,
  filter: selection_filter,
  data: data,
  enter: enter,
  exit: exit,
  join: join,
  merge: merge,
  selection: selection_selection,
  order: order,
  sort: sort,
  call: call,
  nodes: nodes,
  node: node,
  size: size,
  empty: selection_empty,
  each: each,
  attr: attr,
  style: style,
  property: property,
  classed: classed,
  text: selection_text,
  html: html,
  raise: selection_raise,
  lower: selection_lower,
  append: append,
  insert: insert,
  remove: selection_remove,
  clone: clone,
  datum: selection_datum,
  on: on,
  dispatch: dispatch,
  [Symbol.iterator]: iterator
};

/* harmony default export */ const src_selection = (selection);

;// ./node_modules/d3-selection/src/select.js


/* harmony default export */ function src_select(selector) {
  return typeof selector === "string"
      ? new selection_Selection([[document.querySelector(selector)]], [document.documentElement])
      : new selection_Selection([[selector]], selection_root);
}

;// ./node_modules/d3-selection/src/create.js



/* harmony default export */ function create(name) {
  return select(creator(name).call(document.documentElement));
}

;// ./node_modules/d3-selection/src/local.js
var nextId = 0;

function local() {
  return new Local;
}

function Local() {
  this._ = "@" + (++nextId).toString(36);
}

Local.prototype = local.prototype = {
  constructor: Local,
  get: function(node) {
    var id = this._;
    while (!(id in node)) if (!(node = node.parentNode)) return;
    return node[id];
  },
  set: function(node, value) {
    return node[this._] = value;
  },
  remove: function(node) {
    return this._ in node && delete node[this._];
  },
  toString: function() {
    return this._;
  }
};

;// ./node_modules/d3-selection/src/sourceEvent.js
/* harmony default export */ function src_sourceEvent(event) {
  let sourceEvent;
  while (sourceEvent = event.sourceEvent) event = sourceEvent;
  return event;
}

;// ./node_modules/d3-selection/src/pointer.js


/* harmony default export */ function src_pointer(event, node) {
  event = src_sourceEvent(event);
  if (node === undefined) node = event.currentTarget;
  if (node) {
    var svg = node.ownerSVGElement || node;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      point.x = event.clientX, point.y = event.clientY;
      point = point.matrixTransform(node.getScreenCTM().inverse());
      return [point.x, point.y];
    }
    if (node.getBoundingClientRect) {
      var rect = node.getBoundingClientRect();
      return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
    }
  }
  return [event.pageX, event.pageY];
}

;// ./node_modules/d3-selection/src/pointers.js



/* harmony default export */ function pointers(events, node) {
  if (events.target) { // i.e., instanceof Event, not TouchList or iterable
    events = sourceEvent(events);
    if (node === undefined) node = events.currentTarget;
    events = events.touches || [events];
  }
  return Array.from(events, event => pointer(event, node));
}

;// ./node_modules/d3-selection/src/selectAll.js



/* harmony default export */ function src_selectAll(selector) {
  return typeof selector === "string"
      ? new Selection([document.querySelectorAll(selector)], [document.documentElement])
      : new Selection([array(selector)], root);
}

;// ./node_modules/d3-selection/src/index.js

















/***/ }),

/***/ 54924:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Wc: () => (/* reexport */ src_area),
  qr: () => (/* reexport */ basis),
  Yu: () => (/* reexport */ basisClosed),
  IA: () => (/* reexport */ basisOpen),
  Wi: () => (/* reexport */ bump_bumpX),
  PG: () => (/* reexport */ bump_bumpY),
  lU: () => (/* reexport */ linear),
  Lx: () => (/* reexport */ linearClosed),
  nV: () => (/* reexport */ monotoneX),
  ux: () => (/* reexport */ monotoneY),
  Xf: () => (/* reexport */ natural),
  GZ: () => (/* reexport */ step),
  UP: () => (/* reexport */ stepAfter),
  dy: () => (/* reexport */ stepBefore),
  n8: () => (/* reexport */ src_line),
  t$: () => (/* reexport */ stack),
  qI: () => (/* reexport */ expand),
  YW: () => (/* reexport */ offset_none),
  e9: () => (/* reexport */ silhouette),
  Re: () => (/* reexport */ wiggle),
  rM: () => (/* reexport */ order_none),
  HR: () => (/* reexport */ symbol_Symbol),
  hK: () => (/* reexport */ circle),
  BV: () => (/* reexport */ cross),
  j: () => (/* reexport */ diamond),
  yD: () => (/* reexport */ square),
  N8: () => (/* reexport */ star),
  ZK: () => (/* reexport */ triangle),
  IJ: () => (/* reexport */ wye)
});

// UNUSED EXPORTS: arc, areaRadial, curveBundle, curveCardinal, curveCardinalClosed, curveCardinalOpen, curveCatmullRom, curveCatmullRomClosed, curveCatmullRomOpen, lineRadial, link, linkHorizontal, linkRadial, linkVertical, pie, pointRadial, radialArea, radialLine, stackOffsetDiverging, stackOrderAppearance, stackOrderAscending, stackOrderDescending, stackOrderInsideOut, stackOrderReverse, symbolAsterisk, symbolDiamond2, symbolPlus, symbolSquare2, symbolTimes, symbolTriangle2, symbolX, symbols, symbolsFill, symbolsStroke

;// ./node_modules/d3-shape/src/constant.js
/* harmony default export */ function src_constant(x) {
  return function constant() {
    return x;
  };
}

;// ./node_modules/d3-shape/src/math.js
const math_abs = Math.abs;
const math_atan2 = Math.atan2;
const math_cos = Math.cos;
const math_max = Math.max;
const math_min = Math.min;
const math_sin = Math.sin;
const math_sqrt = Math.sqrt;

const math_epsilon = 1e-12;
const math_pi = Math.PI;
const math_halfPi = math_pi / 2;
const math_tau = 2 * math_pi;

function math_acos(x) {
  return x > 1 ? 0 : x < -1 ? math_pi : Math.acos(x);
}

function math_asin(x) {
  return x >= 1 ? math_halfPi : x <= -1 ? -math_halfPi : Math.asin(x);
}

// EXTERNAL MODULE: ./node_modules/d3-path/src/index.js + 1 modules
var src = __webpack_require__(79498);
;// ./node_modules/d3-shape/src/path.js


function path_withPath(shape) {
  let digits = 3;

  shape.digits = function(_) {
    if (!arguments.length) return digits;
    if (_ == null) {
      digits = null;
    } else {
      const d = Math.floor(_);
      if (!(d >= 0)) throw new RangeError(`invalid digits: ${_}`);
      digits = d;
    }
    return shape;
  };

  return () => new src/* Path */.wA(digits);
}

;// ./node_modules/d3-shape/src/arc.js




function arcInnerRadius(d) {
  return d.innerRadius;
}

function arcOuterRadius(d) {
  return d.outerRadius;
}

function arcStartAngle(d) {
  return d.startAngle;
}

function arcEndAngle(d) {
  return d.endAngle;
}

function arcPadAngle(d) {
  return d && d.padAngle; // Note: optional!
}

function intersect(x0, y0, x1, y1, x2, y2, x3, y3) {
  var x10 = x1 - x0, y10 = y1 - y0,
      x32 = x3 - x2, y32 = y3 - y2,
      t = y32 * x10 - x32 * y10;
  if (t * t < epsilon) return;
  t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / t;
  return [x0 + t * x10, y0 + t * y10];
}

// Compute perpendicular offset line of length rc.
// http://mathworld.wolfram.com/Circle-LineIntersection.html
function cornerTangents(x0, y0, x1, y1, r1, rc, cw) {
  var x01 = x0 - x1,
      y01 = y0 - y1,
      lo = (cw ? rc : -rc) / sqrt(x01 * x01 + y01 * y01),
      ox = lo * y01,
      oy = -lo * x01,
      x11 = x0 + ox,
      y11 = y0 + oy,
      x10 = x1 + ox,
      y10 = y1 + oy,
      x00 = (x11 + x10) / 2,
      y00 = (y11 + y10) / 2,
      dx = x10 - x11,
      dy = y10 - y11,
      d2 = dx * dx + dy * dy,
      r = r1 - rc,
      D = x11 * y10 - x10 * y11,
      d = (dy < 0 ? -1 : 1) * sqrt(max(0, r * r * d2 - D * D)),
      cx0 = (D * dy - dx * d) / d2,
      cy0 = (-D * dx - dy * d) / d2,
      cx1 = (D * dy + dx * d) / d2,
      cy1 = (-D * dx + dy * d) / d2,
      dx0 = cx0 - x00,
      dy0 = cy0 - y00,
      dx1 = cx1 - x00,
      dy1 = cy1 - y00;

  // Pick the closer of the two intersection points.
  // TODO Is there a faster way to determine which intersection to use?
  if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;

  return {
    cx: cx0,
    cy: cy0,
    x01: -ox,
    y01: -oy,
    x11: cx0 * (r1 / r - 1),
    y11: cy0 * (r1 / r - 1)
  };
}

/* harmony default export */ function arc() {
  var innerRadius = arcInnerRadius,
      outerRadius = arcOuterRadius,
      cornerRadius = constant(0),
      padRadius = null,
      startAngle = arcStartAngle,
      endAngle = arcEndAngle,
      padAngle = arcPadAngle,
      context = null,
      path = withPath(arc);

  function arc() {
    var buffer,
        r,
        r0 = +innerRadius.apply(this, arguments),
        r1 = +outerRadius.apply(this, arguments),
        a0 = startAngle.apply(this, arguments) - halfPi,
        a1 = endAngle.apply(this, arguments) - halfPi,
        da = abs(a1 - a0),
        cw = a1 > a0;

    if (!context) context = buffer = path();

    // Ensure that the outer radius is always larger than the inner radius.
    if (r1 < r0) r = r1, r1 = r0, r0 = r;

    // Is it a point?
    if (!(r1 > epsilon)) context.moveTo(0, 0);

    // Or is it a circle or annulus?
    else if (da > tau - epsilon) {
      context.moveTo(r1 * cos(a0), r1 * sin(a0));
      context.arc(0, 0, r1, a0, a1, !cw);
      if (r0 > epsilon) {
        context.moveTo(r0 * cos(a1), r0 * sin(a1));
        context.arc(0, 0, r0, a1, a0, cw);
      }
    }

    // Or is it a circular or annular sector?
    else {
      var a01 = a0,
          a11 = a1,
          a00 = a0,
          a10 = a1,
          da0 = da,
          da1 = da,
          ap = padAngle.apply(this, arguments) / 2,
          rp = (ap > epsilon) && (padRadius ? +padRadius.apply(this, arguments) : sqrt(r0 * r0 + r1 * r1)),
          rc = min(abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments)),
          rc0 = rc,
          rc1 = rc,
          t0,
          t1;

      // Apply padding? Note that since r1 ≥ r0, da1 ≥ da0.
      if (rp > epsilon) {
        var p0 = asin(rp / r0 * sin(ap)),
            p1 = asin(rp / r1 * sin(ap));
        if ((da0 -= p0 * 2) > epsilon) p0 *= (cw ? 1 : -1), a00 += p0, a10 -= p0;
        else da0 = 0, a00 = a10 = (a0 + a1) / 2;
        if ((da1 -= p1 * 2) > epsilon) p1 *= (cw ? 1 : -1), a01 += p1, a11 -= p1;
        else da1 = 0, a01 = a11 = (a0 + a1) / 2;
      }

      var x01 = r1 * cos(a01),
          y01 = r1 * sin(a01),
          x10 = r0 * cos(a10),
          y10 = r0 * sin(a10);

      // Apply rounded corners?
      if (rc > epsilon) {
        var x11 = r1 * cos(a11),
            y11 = r1 * sin(a11),
            x00 = r0 * cos(a00),
            y00 = r0 * sin(a00),
            oc;

        // Restrict the corner radius according to the sector angle. If this
        // intersection fails, it’s probably because the arc is too small, so
        // disable the corner radius entirely.
        if (da < pi) {
          if (oc = intersect(x01, y01, x00, y00, x11, y11, x10, y10)) {
            var ax = x01 - oc[0],
                ay = y01 - oc[1],
                bx = x11 - oc[0],
                by = y11 - oc[1],
                kc = 1 / sin(acos((ax * bx + ay * by) / (sqrt(ax * ax + ay * ay) * sqrt(bx * bx + by * by))) / 2),
                lc = sqrt(oc[0] * oc[0] + oc[1] * oc[1]);
            rc0 = min(rc, (r0 - lc) / (kc - 1));
            rc1 = min(rc, (r1 - lc) / (kc + 1));
          } else {
            rc0 = rc1 = 0;
          }
        }
      }

      // Is the sector collapsed to a line?
      if (!(da1 > epsilon)) context.moveTo(x01, y01);

      // Does the sector’s outer ring have rounded corners?
      else if (rc1 > epsilon) {
        t0 = cornerTangents(x00, y00, x01, y01, r1, rc1, cw);
        t1 = cornerTangents(x11, y11, x10, y10, r1, rc1, cw);

        context.moveTo(t0.cx + t0.x01, t0.cy + t0.y01);

        // Have the corners merged?
        if (rc1 < rc) context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);

        // Otherwise, draw the two corners and the ring.
        else {
          context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
          context.arc(0, 0, r1, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), !cw);
          context.arc(t1.cx, t1.cy, rc1, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
        }
      }

      // Or is the outer ring just a circular arc?
      else context.moveTo(x01, y01), context.arc(0, 0, r1, a01, a11, !cw);

      // Is there no inner ring, and it’s a circular sector?
      // Or perhaps it’s an annular sector collapsed due to padding?
      if (!(r0 > epsilon) || !(da0 > epsilon)) context.lineTo(x10, y10);

      // Does the sector’s inner ring (or point) have rounded corners?
      else if (rc0 > epsilon) {
        t0 = cornerTangents(x10, y10, x11, y11, r0, -rc0, cw);
        t1 = cornerTangents(x01, y01, x00, y00, r0, -rc0, cw);

        context.lineTo(t0.cx + t0.x01, t0.cy + t0.y01);

        // Have the corners merged?
        if (rc0 < rc) context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);

        // Otherwise, draw the two corners and the ring.
        else {
          context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
          context.arc(0, 0, r0, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), cw);
          context.arc(t1.cx, t1.cy, rc0, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
        }
      }

      // Or is the inner ring just a circular arc?
      else context.arc(0, 0, r0, a10, a00, cw);
    }

    context.closePath();

    if (buffer) return context = null, buffer + "" || null;
  }

  arc.centroid = function() {
    var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2,
        a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - pi / 2;
    return [cos(a) * r, sin(a) * r];
  };

  arc.innerRadius = function(_) {
    return arguments.length ? (innerRadius = typeof _ === "function" ? _ : constant(+_), arc) : innerRadius;
  };

  arc.outerRadius = function(_) {
    return arguments.length ? (outerRadius = typeof _ === "function" ? _ : constant(+_), arc) : outerRadius;
  };

  arc.cornerRadius = function(_) {
    return arguments.length ? (cornerRadius = typeof _ === "function" ? _ : constant(+_), arc) : cornerRadius;
  };

  arc.padRadius = function(_) {
    return arguments.length ? (padRadius = _ == null ? null : typeof _ === "function" ? _ : constant(+_), arc) : padRadius;
  };

  arc.startAngle = function(_) {
    return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant(+_), arc) : startAngle;
  };

  arc.endAngle = function(_) {
    return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant(+_), arc) : endAngle;
  };

  arc.padAngle = function(_) {
    return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant(+_), arc) : padAngle;
  };

  arc.context = function(_) {
    return arguments.length ? ((context = _ == null ? null : _), arc) : context;
  };

  return arc;
}

;// ./node_modules/d3-shape/src/array.js
var array_slice = Array.prototype.slice;

/* harmony default export */ function src_array(x) {
  return typeof x === "object" && "length" in x
    ? x // Array, TypedArray, NodeList, array-like
    : Array.from(x); // Map, Set, iterable, string, or anything else
}

;// ./node_modules/d3-shape/src/curve/linear.js
function Linear(context) {
  this._context = context;
}

Linear.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
      case 1: this._point = 2; // falls through
      default: this._context.lineTo(x, y); break;
    }
  }
};

/* harmony default export */ function linear(context) {
  return new Linear(context);
}

;// ./node_modules/d3-shape/src/point.js
function point_x(p) {
  return p[0];
}

function point_y(p) {
  return p[1];
}

;// ./node_modules/d3-shape/src/line.js






/* harmony default export */ function src_line(x, y) {
  var defined = src_constant(true),
      context = null,
      curve = linear,
      output = null,
      path = path_withPath(line);

  x = typeof x === "function" ? x : (x === undefined) ? point_x : src_constant(x);
  y = typeof y === "function" ? y : (y === undefined) ? point_y : src_constant(y);

  function line(data) {
    var i,
        n = (data = src_array(data)).length,
        d,
        defined0 = false,
        buffer;

    if (context == null) output = curve(buffer = path());

    for (i = 0; i <= n; ++i) {
      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
        if (defined0 = !defined0) output.lineStart();
        else output.lineEnd();
      }
      if (defined0) output.point(+x(d, i, data), +y(d, i, data));
    }

    if (buffer) return output = null, buffer + "" || null;
  }

  line.x = function(_) {
    return arguments.length ? (x = typeof _ === "function" ? _ : src_constant(+_), line) : x;
  };

  line.y = function(_) {
    return arguments.length ? (y = typeof _ === "function" ? _ : src_constant(+_), line) : y;
  };

  line.defined = function(_) {
    return arguments.length ? (defined = typeof _ === "function" ? _ : src_constant(!!_), line) : defined;
  };

  line.curve = function(_) {
    return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
  };

  line.context = function(_) {
    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
  };

  return line;
}

;// ./node_modules/d3-shape/src/area.js







/* harmony default export */ function src_area(x0, y0, y1) {
  var x1 = null,
      defined = src_constant(true),
      context = null,
      curve = linear,
      output = null,
      path = path_withPath(area);

  x0 = typeof x0 === "function" ? x0 : (x0 === undefined) ? point_x : src_constant(+x0);
  y0 = typeof y0 === "function" ? y0 : (y0 === undefined) ? src_constant(0) : src_constant(+y0);
  y1 = typeof y1 === "function" ? y1 : (y1 === undefined) ? point_y : src_constant(+y1);

  function area(data) {
    var i,
        j,
        k,
        n = (data = src_array(data)).length,
        d,
        defined0 = false,
        buffer,
        x0z = new Array(n),
        y0z = new Array(n);

    if (context == null) output = curve(buffer = path());

    for (i = 0; i <= n; ++i) {
      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
        if (defined0 = !defined0) {
          j = i;
          output.areaStart();
          output.lineStart();
        } else {
          output.lineEnd();
          output.lineStart();
          for (k = i - 1; k >= j; --k) {
            output.point(x0z[k], y0z[k]);
          }
          output.lineEnd();
          output.areaEnd();
        }
      }
      if (defined0) {
        x0z[i] = +x0(d, i, data), y0z[i] = +y0(d, i, data);
        output.point(x1 ? +x1(d, i, data) : x0z[i], y1 ? +y1(d, i, data) : y0z[i]);
      }
    }

    if (buffer) return output = null, buffer + "" || null;
  }

  function arealine() {
    return src_line().defined(defined).curve(curve).context(context);
  }

  area.x = function(_) {
    return arguments.length ? (x0 = typeof _ === "function" ? _ : src_constant(+_), x1 = null, area) : x0;
  };

  area.x0 = function(_) {
    return arguments.length ? (x0 = typeof _ === "function" ? _ : src_constant(+_), area) : x0;
  };

  area.x1 = function(_) {
    return arguments.length ? (x1 = _ == null ? null : typeof _ === "function" ? _ : src_constant(+_), area) : x1;
  };

  area.y = function(_) {
    return arguments.length ? (y0 = typeof _ === "function" ? _ : src_constant(+_), y1 = null, area) : y0;
  };

  area.y0 = function(_) {
    return arguments.length ? (y0 = typeof _ === "function" ? _ : src_constant(+_), area) : y0;
  };

  area.y1 = function(_) {
    return arguments.length ? (y1 = _ == null ? null : typeof _ === "function" ? _ : src_constant(+_), area) : y1;
  };

  area.lineX0 =
  area.lineY0 = function() {
    return arealine().x(x0).y(y0);
  };

  area.lineY1 = function() {
    return arealine().x(x0).y(y1);
  };

  area.lineX1 = function() {
    return arealine().x(x1).y(y0);
  };

  area.defined = function(_) {
    return arguments.length ? (defined = typeof _ === "function" ? _ : src_constant(!!_), area) : defined;
  };

  area.curve = function(_) {
    return arguments.length ? (curve = _, context != null && (output = curve(context)), area) : curve;
  };

  area.context = function(_) {
    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), area) : context;
  };

  return area;
}

;// ./node_modules/d3-shape/src/descending.js
/* harmony default export */ function src_descending(a, b) {
  return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
}

;// ./node_modules/d3-shape/src/identity.js
/* harmony default export */ function src_identity(d) {
  return d;
}

;// ./node_modules/d3-shape/src/pie.js






/* harmony default export */ function pie() {
  var value = identity,
      sortValues = descending,
      sort = null,
      startAngle = constant(0),
      endAngle = constant(tau),
      padAngle = constant(0);

  function pie(data) {
    var i,
        n = (data = array(data)).length,
        j,
        k,
        sum = 0,
        index = new Array(n),
        arcs = new Array(n),
        a0 = +startAngle.apply(this, arguments),
        da = Math.min(tau, Math.max(-tau, endAngle.apply(this, arguments) - a0)),
        a1,
        p = Math.min(Math.abs(da) / n, padAngle.apply(this, arguments)),
        pa = p * (da < 0 ? -1 : 1),
        v;

    for (i = 0; i < n; ++i) {
      if ((v = arcs[index[i] = i] = +value(data[i], i, data)) > 0) {
        sum += v;
      }
    }

    // Optionally sort the arcs by previously-computed values or by data.
    if (sortValues != null) index.sort(function(i, j) { return sortValues(arcs[i], arcs[j]); });
    else if (sort != null) index.sort(function(i, j) { return sort(data[i], data[j]); });

    // Compute the arcs! They are stored in the original data's order.
    for (i = 0, k = sum ? (da - n * pa) / sum : 0; i < n; ++i, a0 = a1) {
      j = index[i], v = arcs[j], a1 = a0 + (v > 0 ? v * k : 0) + pa, arcs[j] = {
        data: data[j],
        index: i,
        value: v,
        startAngle: a0,
        endAngle: a1,
        padAngle: p
      };
    }

    return arcs;
  }

  pie.value = function(_) {
    return arguments.length ? (value = typeof _ === "function" ? _ : constant(+_), pie) : value;
  };

  pie.sortValues = function(_) {
    return arguments.length ? (sortValues = _, sort = null, pie) : sortValues;
  };

  pie.sort = function(_) {
    return arguments.length ? (sort = _, sortValues = null, pie) : sort;
  };

  pie.startAngle = function(_) {
    return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant(+_), pie) : startAngle;
  };

  pie.endAngle = function(_) {
    return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant(+_), pie) : endAngle;
  };

  pie.padAngle = function(_) {
    return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant(+_), pie) : padAngle;
  };

  return pie;
}

;// ./node_modules/d3-shape/src/curve/radial.js


var radial_curveRadialLinear = radial_curveRadial(linear);

function Radial(curve) {
  this._curve = curve;
}

Radial.prototype = {
  areaStart: function() {
    this._curve.areaStart();
  },
  areaEnd: function() {
    this._curve.areaEnd();
  },
  lineStart: function() {
    this._curve.lineStart();
  },
  lineEnd: function() {
    this._curve.lineEnd();
  },
  point: function(a, r) {
    this._curve.point(r * Math.sin(a), r * -Math.cos(a));
  }
};

function radial_curveRadial(curve) {

  function radial(context) {
    return new Radial(curve(context));
  }

  radial._curve = curve;

  return radial;
}

;// ./node_modules/d3-shape/src/lineRadial.js



function lineRadial_lineRadial(l) {
  var c = l.curve;

  l.angle = l.x, delete l.x;
  l.radius = l.y, delete l.y;

  l.curve = function(_) {
    return arguments.length ? c(curveRadial(_)) : c()._curve;
  };

  return l;
}

/* harmony default export */ function src_lineRadial() {
  return lineRadial_lineRadial(line().curve(curveRadialLinear));
}

;// ./node_modules/d3-shape/src/areaRadial.js




/* harmony default export */ function areaRadial() {
  var a = area().curve(curveRadialLinear),
      c = a.curve,
      x0 = a.lineX0,
      x1 = a.lineX1,
      y0 = a.lineY0,
      y1 = a.lineY1;

  a.angle = a.x, delete a.x;
  a.startAngle = a.x0, delete a.x0;
  a.endAngle = a.x1, delete a.x1;
  a.radius = a.y, delete a.y;
  a.innerRadius = a.y0, delete a.y0;
  a.outerRadius = a.y1, delete a.y1;
  a.lineStartAngle = function() { return lineRadial(x0()); }, delete a.lineX0;
  a.lineEndAngle = function() { return lineRadial(x1()); }, delete a.lineX1;
  a.lineInnerRadius = function() { return lineRadial(y0()); }, delete a.lineY0;
  a.lineOuterRadius = function() { return lineRadial(y1()); }, delete a.lineY1;

  a.curve = function(_) {
    return arguments.length ? c(curveRadial(_)) : c()._curve;
  };

  return a;
}

;// ./node_modules/d3-shape/src/pointRadial.js
/* harmony default export */ function src_pointRadial(x, y) {
  return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
}

;// ./node_modules/d3-shape/src/curve/bump.js


class Bump {
  constructor(context, x) {
    this._context = context;
    this._x = x;
  }
  areaStart() {
    this._line = 0;
  }
  areaEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._point = 0;
  }
  lineEnd() {
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  }
  point(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: {
        this._point = 1;
        if (this._line) this._context.lineTo(x, y);
        else this._context.moveTo(x, y);
        break;
      }
      case 1: this._point = 2; // falls through
      default: {
        if (this._x) this._context.bezierCurveTo(this._x0 = (this._x0 + x) / 2, this._y0, this._x0, y, x, y);
        else this._context.bezierCurveTo(this._x0, this._y0 = (this._y0 + y) / 2, x, this._y0, x, y);
        break;
      }
    }
    this._x0 = x, this._y0 = y;
  }
}

class BumpRadial {
  constructor(context) {
    this._context = context;
  }
  lineStart() {
    this._point = 0;
  }
  lineEnd() {}
  point(x, y) {
    x = +x, y = +y;
    if (this._point === 0) {
      this._point = 1;
    } else {
      const p0 = pointRadial(this._x0, this._y0);
      const p1 = pointRadial(this._x0, this._y0 = (this._y0 + y) / 2);
      const p2 = pointRadial(x, this._y0);
      const p3 = pointRadial(x, y);
      this._context.moveTo(...p0);
      this._context.bezierCurveTo(...p1, ...p2, ...p3);
    }
    this._x0 = x, this._y0 = y;
  }
}

function bump_bumpX(context) {
  return new Bump(context, true);
}

function bump_bumpY(context) {
  return new Bump(context, false);
}

function bump_bumpRadial(context) {
  return new BumpRadial(context);
}

;// ./node_modules/d3-shape/src/link.js






function linkSource(d) {
  return d.source;
}

function linkTarget(d) {
  return d.target;
}

function link_link(curve) {
  let source = linkSource,
      target = linkTarget,
      x = pointX,
      y = pointY,
      context = null,
      output = null,
      path = withPath(link);

  function link() {
    let buffer;
    const argv = slice.call(arguments);
    const s = source.apply(this, argv);
    const t = target.apply(this, argv);
    if (context == null) output = curve(buffer = path());
    output.lineStart();
    argv[0] = s, output.point(+x.apply(this, argv), +y.apply(this, argv));
    argv[0] = t, output.point(+x.apply(this, argv), +y.apply(this, argv));
    output.lineEnd();
    if (buffer) return output = null, buffer + "" || null;
  }

  link.source = function(_) {
    return arguments.length ? (source = _, link) : source;
  };

  link.target = function(_) {
    return arguments.length ? (target = _, link) : target;
  };

  link.x = function(_) {
    return arguments.length ? (x = typeof _ === "function" ? _ : constant(+_), link) : x;
  };

  link.y = function(_) {
    return arguments.length ? (y = typeof _ === "function" ? _ : constant(+_), link) : y;
  };

  link.context = function(_) {
    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), link) : context;
  };

  return link;
}

function linkHorizontal() {
  return link_link(bumpX);
}

function linkVertical() {
  return link_link(bumpY);
}

function linkRadial() {
  const l = link_link(bumpRadial);
  l.angle = l.x, delete l.x;
  l.radius = l.y, delete l.y;
  return l;
}

;// ./node_modules/d3-shape/src/symbol/asterisk.js


const sqrt3 = math_sqrt(3);

/* harmony default export */ const asterisk = ({
  draw(context, size) {
    const r = math_sqrt(size + math_min(size / 28, 0.75)) * 0.59436;
    const t = r / 2;
    const u = t * sqrt3;
    context.moveTo(0, r);
    context.lineTo(0, -r);
    context.moveTo(-u, -t);
    context.lineTo(u, t);
    context.moveTo(-u, t);
    context.lineTo(u, -t);
  }
});

;// ./node_modules/d3-shape/src/symbol/circle.js


/* harmony default export */ const circle = ({
  draw(context, size) {
    const r = math_sqrt(size / math_pi);
    context.moveTo(r, 0);
    context.arc(0, 0, r, 0, math_tau);
  }
});

;// ./node_modules/d3-shape/src/symbol/cross.js


/* harmony default export */ const cross = ({
  draw(context, size) {
    const r = math_sqrt(size / 5) / 2;
    context.moveTo(-3 * r, -r);
    context.lineTo(-r, -r);
    context.lineTo(-r, -3 * r);
    context.lineTo(r, -3 * r);
    context.lineTo(r, -r);
    context.lineTo(3 * r, -r);
    context.lineTo(3 * r, r);
    context.lineTo(r, r);
    context.lineTo(r, 3 * r);
    context.lineTo(-r, 3 * r);
    context.lineTo(-r, r);
    context.lineTo(-3 * r, r);
    context.closePath();
  }
});

;// ./node_modules/d3-shape/src/symbol/diamond.js


const tan30 = math_sqrt(1 / 3);
const tan30_2 = tan30 * 2;

/* harmony default export */ const diamond = ({
  draw(context, size) {
    const y = math_sqrt(size / tan30_2);
    const x = y * tan30;
    context.moveTo(0, -y);
    context.lineTo(x, 0);
    context.lineTo(0, y);
    context.lineTo(-x, 0);
    context.closePath();
  }
});

;// ./node_modules/d3-shape/src/symbol/diamond2.js


/* harmony default export */ const diamond2 = ({
  draw(context, size) {
    const r = math_sqrt(size) * 0.62625;
    context.moveTo(0, -r);
    context.lineTo(r, 0);
    context.lineTo(0, r);
    context.lineTo(-r, 0);
    context.closePath();
  }
});

;// ./node_modules/d3-shape/src/symbol/plus.js


/* harmony default export */ const plus = ({
  draw(context, size) {
    const r = math_sqrt(size - math_min(size / 7, 2)) * 0.87559;
    context.moveTo(-r, 0);
    context.lineTo(r, 0);
    context.moveTo(0, r);
    context.lineTo(0, -r);
  }
});

;// ./node_modules/d3-shape/src/symbol/square.js


/* harmony default export */ const square = ({
  draw(context, size) {
    const w = math_sqrt(size);
    const x = -w / 2;
    context.rect(x, x, w, w);
  }
});

;// ./node_modules/d3-shape/src/symbol/square2.js


/* harmony default export */ const square2 = ({
  draw(context, size) {
    const r = math_sqrt(size) * 0.4431;
    context.moveTo(r, r);
    context.lineTo(r, -r);
    context.lineTo(-r, -r);
    context.lineTo(-r, r);
    context.closePath();
  }
});

;// ./node_modules/d3-shape/src/symbol/star.js


const ka = 0.89081309152928522810;
const kr = math_sin(math_pi / 10) / math_sin(7 * math_pi / 10);
const kx = math_sin(math_tau / 10) * kr;
const ky = -math_cos(math_tau / 10) * kr;

/* harmony default export */ const star = ({
  draw(context, size) {
    const r = math_sqrt(size * ka);
    const x = kx * r;
    const y = ky * r;
    context.moveTo(0, -r);
    context.lineTo(x, y);
    for (let i = 1; i < 5; ++i) {
      const a = math_tau * i / 5;
      const c = math_cos(a);
      const s = math_sin(a);
      context.lineTo(s * r, -c * r);
      context.lineTo(c * x - s * y, s * x + c * y);
    }
    context.closePath();
  }
});

;// ./node_modules/d3-shape/src/symbol/triangle.js


const triangle_sqrt3 = math_sqrt(3);

/* harmony default export */ const triangle = ({
  draw(context, size) {
    const y = -math_sqrt(size / (triangle_sqrt3 * 3));
    context.moveTo(0, y * 2);
    context.lineTo(-triangle_sqrt3 * y, -y);
    context.lineTo(triangle_sqrt3 * y, -y);
    context.closePath();
  }
});

;// ./node_modules/d3-shape/src/symbol/triangle2.js


const triangle2_sqrt3 = math_sqrt(3);

/* harmony default export */ const triangle2 = ({
  draw(context, size) {
    const s = math_sqrt(size) * 0.6824;
    const t = s  / 2;
    const u = (s * triangle2_sqrt3) / 2; // cos(Math.PI / 6)
    context.moveTo(0, -s);
    context.lineTo(u, t);
    context.lineTo(-u, t);
    context.closePath();
  }
});

;// ./node_modules/d3-shape/src/symbol/wye.js


const c = -0.5;
const s = math_sqrt(3) / 2;
const k = 1 / math_sqrt(12);
const a = (k / 2 + 1) * 3;

/* harmony default export */ const wye = ({
  draw(context, size) {
    const r = math_sqrt(size / a);
    const x0 = r / 2, y0 = r * k;
    const x1 = x0, y1 = r * k + r;
    const x2 = -x1, y2 = y1;
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(c * x0 - s * y0, s * x0 + c * y0);
    context.lineTo(c * x1 - s * y1, s * x1 + c * y1);
    context.lineTo(c * x2 - s * y2, s * x2 + c * y2);
    context.lineTo(c * x0 + s * y0, c * y0 - s * x0);
    context.lineTo(c * x1 + s * y1, c * y1 - s * x1);
    context.lineTo(c * x2 + s * y2, c * y2 - s * x2);
    context.closePath();
  }
});

;// ./node_modules/d3-shape/src/symbol/times.js


/* harmony default export */ const times = ({
  draw(context, size) {
    const r = math_sqrt(size - math_min(size / 6, 1.7)) * 0.6189;
    context.moveTo(-r, -r);
    context.lineTo(r, r);
    context.moveTo(-r, r);
    context.lineTo(r, -r);
  }
});

;// ./node_modules/d3-shape/src/symbol.js
















// These symbols are designed to be filled.
const symbolsFill = [
  circle,
  cross,
  diamond,
  square,
  star,
  triangle,
  wye
];

// These symbols are designed to be stroked (with a width of 1.5px and round caps).
const symbolsStroke = [
  circle,
  plus,
  times,
  triangle2,
  asterisk,
  square2,
  diamond2
];

function symbol_Symbol(type, size) {
  let context = null,
      path = path_withPath(symbol);

  type = typeof type === "function" ? type : src_constant(type || circle);
  size = typeof size === "function" ? size : src_constant(size === undefined ? 64 : +size);

  function symbol() {
    let buffer;
    if (!context) context = buffer = path();
    type.apply(this, arguments).draw(context, +size.apply(this, arguments));
    if (buffer) return context = null, buffer + "" || null;
  }

  symbol.type = function(_) {
    return arguments.length ? (type = typeof _ === "function" ? _ : src_constant(_), symbol) : type;
  };

  symbol.size = function(_) {
    return arguments.length ? (size = typeof _ === "function" ? _ : src_constant(+_), symbol) : size;
  };

  symbol.context = function(_) {
    return arguments.length ? (context = _ == null ? null : _, symbol) : context;
  };

  return symbol;
}

;// ./node_modules/d3-shape/src/noop.js
/* harmony default export */ function noop() {}

;// ./node_modules/d3-shape/src/curve/basis.js
function point(that, x, y) {
  that._context.bezierCurveTo(
    (2 * that._x0 + that._x1) / 3,
    (2 * that._y0 + that._y1) / 3,
    (that._x0 + 2 * that._x1) / 3,
    (that._y0 + 2 * that._y1) / 3,
    (that._x0 + 4 * that._x1 + x) / 6,
    (that._y0 + 4 * that._y1 + y) / 6
  );
}

function Basis(context) {
  this._context = context;
}

Basis.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 =
    this._y0 = this._y1 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 3: point(this, this._x1, this._y1); // falls through
      case 2: this._context.lineTo(this._x1, this._y1); break;
    }
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
      case 1: this._point = 2; break;
      case 2: this._point = 3; this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6); // falls through
      default: point(this, x, y); break;
    }
    this._x0 = this._x1, this._x1 = x;
    this._y0 = this._y1, this._y1 = y;
  }
};

/* harmony default export */ function basis(context) {
  return new Basis(context);
}

;// ./node_modules/d3-shape/src/curve/basisClosed.js



function BasisClosed(context) {
  this._context = context;
}

BasisClosed.prototype = {
  areaStart: noop,
  areaEnd: noop,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 =
    this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x2, this._y2);
        this._context.closePath();
        break;
      }
      case 2: {
        this._context.moveTo((this._x2 + 2 * this._x3) / 3, (this._y2 + 2 * this._y3) / 3);
        this._context.lineTo((this._x3 + 2 * this._x2) / 3, (this._y3 + 2 * this._y2) / 3);
        this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x2, this._y2);
        this.point(this._x3, this._y3);
        this.point(this._x4, this._y4);
        break;
      }
    }
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; this._x2 = x, this._y2 = y; break;
      case 1: this._point = 2; this._x3 = x, this._y3 = y; break;
      case 2: this._point = 3; this._x4 = x, this._y4 = y; this._context.moveTo((this._x0 + 4 * this._x1 + x) / 6, (this._y0 + 4 * this._y1 + y) / 6); break;
      default: point(this, x, y); break;
    }
    this._x0 = this._x1, this._x1 = x;
    this._y0 = this._y1, this._y1 = y;
  }
};

/* harmony default export */ function basisClosed(context) {
  return new BasisClosed(context);
}

;// ./node_modules/d3-shape/src/curve/basisOpen.js


function BasisOpen(context) {
  this._context = context;
}

BasisOpen.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 =
    this._y0 = this._y1 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || (this._line !== 0 && this._point === 3)) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; break;
      case 1: this._point = 2; break;
      case 2: this._point = 3; var x0 = (this._x0 + 4 * this._x1 + x) / 6, y0 = (this._y0 + 4 * this._y1 + y) / 6; this._line ? this._context.lineTo(x0, y0) : this._context.moveTo(x0, y0); break;
      case 3: this._point = 4; // falls through
      default: point(this, x, y); break;
    }
    this._x0 = this._x1, this._x1 = x;
    this._y0 = this._y1, this._y1 = y;
  }
};

/* harmony default export */ function basisOpen(context) {
  return new BasisOpen(context);
}

;// ./node_modules/d3-shape/src/curve/bundle.js


function Bundle(context, beta) {
  this._basis = new Basis(context);
  this._beta = beta;
}

Bundle.prototype = {
  lineStart: function() {
    this._x = [];
    this._y = [];
    this._basis.lineStart();
  },
  lineEnd: function() {
    var x = this._x,
        y = this._y,
        j = x.length - 1;

    if (j > 0) {
      var x0 = x[0],
          y0 = y[0],
          dx = x[j] - x0,
          dy = y[j] - y0,
          i = -1,
          t;

      while (++i <= j) {
        t = i / j;
        this._basis.point(
          this._beta * x[i] + (1 - this._beta) * (x0 + t * dx),
          this._beta * y[i] + (1 - this._beta) * (y0 + t * dy)
        );
      }
    }

    this._x = this._y = null;
    this._basis.lineEnd();
  },
  point: function(x, y) {
    this._x.push(+x);
    this._y.push(+y);
  }
};

/* harmony default export */ const bundle = ((function custom(beta) {

  function bundle(context) {
    return beta === 1 ? new Basis(context) : new Bundle(context, beta);
  }

  bundle.beta = function(beta) {
    return custom(+beta);
  };

  return bundle;
})(0.85));

;// ./node_modules/d3-shape/src/curve/cardinal.js
function cardinal_point(that, x, y) {
  that._context.bezierCurveTo(
    that._x1 + that._k * (that._x2 - that._x0),
    that._y1 + that._k * (that._y2 - that._y0),
    that._x2 + that._k * (that._x1 - x),
    that._y2 + that._k * (that._y1 - y),
    that._x2,
    that._y2
  );
}

function Cardinal(context, tension) {
  this._context = context;
  this._k = (1 - tension) / 6;
}

Cardinal.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 =
    this._y0 = this._y1 = this._y2 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2: this._context.lineTo(this._x2, this._y2); break;
      case 3: cardinal_point(this, this._x1, this._y1); break;
    }
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
      case 1: this._point = 2; this._x1 = x, this._y1 = y; break;
      case 2: this._point = 3; // falls through
      default: cardinal_point(this, x, y); break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
  }
};

/* harmony default export */ const cardinal = ((function custom(tension) {

  function cardinal(context) {
    return new Cardinal(context, tension);
  }

  cardinal.tension = function(tension) {
    return custom(+tension);
  };

  return cardinal;
})(0));

;// ./node_modules/d3-shape/src/curve/cardinalClosed.js



function CardinalClosed(context, tension) {
  this._context = context;
  this._k = (1 - tension) / 6;
}

CardinalClosed.prototype = {
  areaStart: noop,
  areaEnd: noop,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 =
    this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 2: {
        this._context.lineTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x3, this._y3);
        this.point(this._x4, this._y4);
        this.point(this._x5, this._y5);
        break;
      }
    }
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; this._x3 = x, this._y3 = y; break;
      case 1: this._point = 2; this._context.moveTo(this._x4 = x, this._y4 = y); break;
      case 2: this._point = 3; this._x5 = x, this._y5 = y; break;
      default: cardinal_point(this, x, y); break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
  }
};

/* harmony default export */ const cardinalClosed = ((function custom(tension) {

  function cardinal(context) {
    return new CardinalClosed(context, tension);
  }

  cardinal.tension = function(tension) {
    return custom(+tension);
  };

  return cardinal;
})(0));

;// ./node_modules/d3-shape/src/curve/cardinalOpen.js


function CardinalOpen(context, tension) {
  this._context = context;
  this._k = (1 - tension) / 6;
}

CardinalOpen.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 =
    this._y0 = this._y1 = this._y2 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || (this._line !== 0 && this._point === 3)) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; break;
      case 1: this._point = 2; break;
      case 2: this._point = 3; this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2); break;
      case 3: this._point = 4; // falls through
      default: cardinal_point(this, x, y); break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
  }
};

/* harmony default export */ const cardinalOpen = ((function custom(tension) {

  function cardinal(context) {
    return new CardinalOpen(context, tension);
  }

  cardinal.tension = function(tension) {
    return custom(+tension);
  };

  return cardinal;
})(0));

;// ./node_modules/d3-shape/src/curve/catmullRom.js



function catmullRom_point(that, x, y) {
  var x1 = that._x1,
      y1 = that._y1,
      x2 = that._x2,
      y2 = that._y2;

  if (that._l01_a > math_epsilon) {
    var a = 2 * that._l01_2a + 3 * that._l01_a * that._l12_a + that._l12_2a,
        n = 3 * that._l01_a * (that._l01_a + that._l12_a);
    x1 = (x1 * a - that._x0 * that._l12_2a + that._x2 * that._l01_2a) / n;
    y1 = (y1 * a - that._y0 * that._l12_2a + that._y2 * that._l01_2a) / n;
  }

  if (that._l23_a > math_epsilon) {
    var b = 2 * that._l23_2a + 3 * that._l23_a * that._l12_a + that._l12_2a,
        m = 3 * that._l23_a * (that._l23_a + that._l12_a);
    x2 = (x2 * b + that._x1 * that._l23_2a - x * that._l12_2a) / m;
    y2 = (y2 * b + that._y1 * that._l23_2a - y * that._l12_2a) / m;
  }

  that._context.bezierCurveTo(x1, y1, x2, y2, that._x2, that._y2);
}

function CatmullRom(context, alpha) {
  this._context = context;
  this._alpha = alpha;
}

CatmullRom.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 =
    this._y0 = this._y1 = this._y2 = NaN;
    this._l01_a = this._l12_a = this._l23_a =
    this._l01_2a = this._l12_2a = this._l23_2a =
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2: this._context.lineTo(this._x2, this._y2); break;
      case 3: this.point(this._x2, this._y2); break;
    }
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;

    if (this._point) {
      var x23 = this._x2 - x,
          y23 = this._y2 - y;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
    }

    switch (this._point) {
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
      case 1: this._point = 2; break;
      case 2: this._point = 3; // falls through
      default: catmullRom_point(this, x, y); break;
    }

    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
  }
};

/* harmony default export */ const catmullRom = ((function custom(alpha) {

  function catmullRom(context) {
    return alpha ? new CatmullRom(context, alpha) : new Cardinal(context, 0);
  }

  catmullRom.alpha = function(alpha) {
    return custom(+alpha);
  };

  return catmullRom;
})(0.5));

;// ./node_modules/d3-shape/src/curve/catmullRomClosed.js




function CatmullRomClosed(context, alpha) {
  this._context = context;
  this._alpha = alpha;
}

CatmullRomClosed.prototype = {
  areaStart: noop,
  areaEnd: noop,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 =
    this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN;
    this._l01_a = this._l12_a = this._l23_a =
    this._l01_2a = this._l12_2a = this._l23_2a =
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 2: {
        this._context.lineTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x3, this._y3);
        this.point(this._x4, this._y4);
        this.point(this._x5, this._y5);
        break;
      }
    }
  },
  point: function(x, y) {
    x = +x, y = +y;

    if (this._point) {
      var x23 = this._x2 - x,
          y23 = this._y2 - y;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
    }

    switch (this._point) {
      case 0: this._point = 1; this._x3 = x, this._y3 = y; break;
      case 1: this._point = 2; this._context.moveTo(this._x4 = x, this._y4 = y); break;
      case 2: this._point = 3; this._x5 = x, this._y5 = y; break;
      default: catmullRom_point(this, x, y); break;
    }

    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
  }
};

/* harmony default export */ const catmullRomClosed = ((function custom(alpha) {

  function catmullRom(context) {
    return alpha ? new CatmullRomClosed(context, alpha) : new CardinalClosed(context, 0);
  }

  catmullRom.alpha = function(alpha) {
    return custom(+alpha);
  };

  return catmullRom;
})(0.5));

;// ./node_modules/d3-shape/src/curve/catmullRomOpen.js



function CatmullRomOpen(context, alpha) {
  this._context = context;
  this._alpha = alpha;
}

CatmullRomOpen.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 =
    this._y0 = this._y1 = this._y2 = NaN;
    this._l01_a = this._l12_a = this._l23_a =
    this._l01_2a = this._l12_2a = this._l23_2a =
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || (this._line !== 0 && this._point === 3)) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;

    if (this._point) {
      var x23 = this._x2 - x,
          y23 = this._y2 - y;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
    }

    switch (this._point) {
      case 0: this._point = 1; break;
      case 1: this._point = 2; break;
      case 2: this._point = 3; this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2); break;
      case 3: this._point = 4; // falls through
      default: catmullRom_point(this, x, y); break;
    }

    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
  }
};

/* harmony default export */ const catmullRomOpen = ((function custom(alpha) {

  function catmullRom(context) {
    return alpha ? new CatmullRomOpen(context, alpha) : new CardinalOpen(context, 0);
  }

  catmullRom.alpha = function(alpha) {
    return custom(+alpha);
  };

  return catmullRom;
})(0.5));

;// ./node_modules/d3-shape/src/curve/linearClosed.js


function LinearClosed(context) {
  this._context = context;
}

LinearClosed.prototype = {
  areaStart: noop,
  areaEnd: noop,
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._point) this._context.closePath();
  },
  point: function(x, y) {
    x = +x, y = +y;
    if (this._point) this._context.lineTo(x, y);
    else this._point = 1, this._context.moveTo(x, y);
  }
};

/* harmony default export */ function linearClosed(context) {
  return new LinearClosed(context);
}

;// ./node_modules/d3-shape/src/curve/monotone.js
function sign(x) {
  return x < 0 ? -1 : 1;
}

// Calculate the slopes of the tangents (Hermite-type interpolation) based on
// the following paper: Steffen, M. 1990. A Simple Method for Monotonic
// Interpolation in One Dimension. Astronomy and Astrophysics, Vol. 239, NO.
// NOV(II), P. 443, 1990.
function slope3(that, x2, y2) {
  var h0 = that._x1 - that._x0,
      h1 = x2 - that._x1,
      s0 = (that._y1 - that._y0) / (h0 || h1 < 0 && -0),
      s1 = (y2 - that._y1) / (h1 || h0 < 0 && -0),
      p = (s0 * h1 + s1 * h0) / (h0 + h1);
  return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
}

// Calculate a one-sided slope.
function slope2(that, t) {
  var h = that._x1 - that._x0;
  return h ? (3 * (that._y1 - that._y0) / h - t) / 2 : t;
}

// According to https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Representations
// "you can express cubic Hermite interpolation in terms of cubic Bézier curves
// with respect to the four values p0, p0 + m0 / 3, p1 - m1 / 3, p1".
function monotone_point(that, t0, t1) {
  var x0 = that._x0,
      y0 = that._y0,
      x1 = that._x1,
      y1 = that._y1,
      dx = (x1 - x0) / 3;
  that._context.bezierCurveTo(x0 + dx, y0 + dx * t0, x1 - dx, y1 - dx * t1, x1, y1);
}

function MonotoneX(context) {
  this._context = context;
}

MonotoneX.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 =
    this._y0 = this._y1 =
    this._t0 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2: this._context.lineTo(this._x1, this._y1); break;
      case 3: monotone_point(this, this._t0, slope2(this, this._t0)); break;
    }
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    var t1 = NaN;

    x = +x, y = +y;
    if (x === this._x1 && y === this._y1) return; // Ignore coincident points.
    switch (this._point) {
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
      case 1: this._point = 2; break;
      case 2: this._point = 3; monotone_point(this, slope2(this, t1 = slope3(this, x, y)), t1); break;
      default: monotone_point(this, this._t0, t1 = slope3(this, x, y)); break;
    }

    this._x0 = this._x1, this._x1 = x;
    this._y0 = this._y1, this._y1 = y;
    this._t0 = t1;
  }
}

function MonotoneY(context) {
  this._context = new ReflectContext(context);
}

(MonotoneY.prototype = Object.create(MonotoneX.prototype)).point = function(x, y) {
  MonotoneX.prototype.point.call(this, y, x);
};

function ReflectContext(context) {
  this._context = context;
}

ReflectContext.prototype = {
  moveTo: function(x, y) { this._context.moveTo(y, x); },
  closePath: function() { this._context.closePath(); },
  lineTo: function(x, y) { this._context.lineTo(y, x); },
  bezierCurveTo: function(x1, y1, x2, y2, x, y) { this._context.bezierCurveTo(y1, x1, y2, x2, y, x); }
};

function monotoneX(context) {
  return new MonotoneX(context);
}

function monotoneY(context) {
  return new MonotoneY(context);
}

;// ./node_modules/d3-shape/src/curve/natural.js
function Natural(context) {
  this._context = context;
}

Natural.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x = [];
    this._y = [];
  },
  lineEnd: function() {
    var x = this._x,
        y = this._y,
        n = x.length;

    if (n) {
      this._line ? this._context.lineTo(x[0], y[0]) : this._context.moveTo(x[0], y[0]);
      if (n === 2) {
        this._context.lineTo(x[1], y[1]);
      } else {
        var px = controlPoints(x),
            py = controlPoints(y);
        for (var i0 = 0, i1 = 1; i1 < n; ++i0, ++i1) {
          this._context.bezierCurveTo(px[0][i0], py[0][i0], px[1][i0], py[1][i0], x[i1], y[i1]);
        }
      }
    }

    if (this._line || (this._line !== 0 && n === 1)) this._context.closePath();
    this._line = 1 - this._line;
    this._x = this._y = null;
  },
  point: function(x, y) {
    this._x.push(+x);
    this._y.push(+y);
  }
};

// See https://www.particleincell.com/2012/bezier-splines/ for derivation.
function controlPoints(x) {
  var i,
      n = x.length - 1,
      m,
      a = new Array(n),
      b = new Array(n),
      r = new Array(n);
  a[0] = 0, b[0] = 2, r[0] = x[0] + 2 * x[1];
  for (i = 1; i < n - 1; ++i) a[i] = 1, b[i] = 4, r[i] = 4 * x[i] + 2 * x[i + 1];
  a[n - 1] = 2, b[n - 1] = 7, r[n - 1] = 8 * x[n - 1] + x[n];
  for (i = 1; i < n; ++i) m = a[i] / b[i - 1], b[i] -= m, r[i] -= m * r[i - 1];
  a[n - 1] = r[n - 1] / b[n - 1];
  for (i = n - 2; i >= 0; --i) a[i] = (r[i] - a[i + 1]) / b[i];
  b[n - 1] = (x[n] + a[n - 1]) / 2;
  for (i = 0; i < n - 1; ++i) b[i] = 2 * x[i + 1] - a[i + 1];
  return [a, b];
}

/* harmony default export */ function natural(context) {
  return new Natural(context);
}

;// ./node_modules/d3-shape/src/curve/step.js
function Step(context, t) {
  this._context = context;
  this._t = t;
}

Step.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x = this._y = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    if (0 < this._t && this._t < 1 && this._point === 2) this._context.lineTo(this._x, this._y);
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    if (this._line >= 0) this._t = 1 - this._t, this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
      case 1: this._point = 2; // falls through
      default: {
        if (this._t <= 0) {
          this._context.lineTo(this._x, y);
          this._context.lineTo(x, y);
        } else {
          var x1 = this._x * (1 - this._t) + x * this._t;
          this._context.lineTo(x1, this._y);
          this._context.lineTo(x1, y);
        }
        break;
      }
    }
    this._x = x, this._y = y;
  }
};

/* harmony default export */ function step(context) {
  return new Step(context, 0.5);
}

function stepBefore(context) {
  return new Step(context, 0);
}

function stepAfter(context) {
  return new Step(context, 1);
}

;// ./node_modules/d3-shape/src/offset/none.js
/* harmony default export */ function offset_none(series, order) {
  if (!((n = series.length) > 1)) return;
  for (var i = 1, j, s0, s1 = series[order[0]], n, m = s1.length; i < n; ++i) {
    s0 = s1, s1 = series[order[i]];
    for (j = 0; j < m; ++j) {
      s1[j][1] += s1[j][0] = isNaN(s0[j][1]) ? s0[j][0] : s0[j][1];
    }
  }
}

;// ./node_modules/d3-shape/src/order/none.js
/* harmony default export */ function order_none(series) {
  var n = series.length, o = new Array(n);
  while (--n >= 0) o[n] = n;
  return o;
}

;// ./node_modules/d3-shape/src/stack.js





function stackValue(d, key) {
  return d[key];
}

function stackSeries(key) {
  const series = [];
  series.key = key;
  return series;
}

/* harmony default export */ function stack() {
  var keys = src_constant([]),
      order = order_none,
      offset = offset_none,
      value = stackValue;

  function stack(data) {
    var sz = Array.from(keys.apply(this, arguments), stackSeries),
        i, n = sz.length, j = -1,
        oz;

    for (const d of data) {
      for (i = 0, ++j; i < n; ++i) {
        (sz[i][j] = [0, +value(d, sz[i].key, j, data)]).data = d;
      }
    }

    for (i = 0, oz = src_array(order(sz)); i < n; ++i) {
      sz[oz[i]].index = i;
    }

    offset(sz, oz);
    return sz;
  }

  stack.keys = function(_) {
    return arguments.length ? (keys = typeof _ === "function" ? _ : src_constant(Array.from(_)), stack) : keys;
  };

  stack.value = function(_) {
    return arguments.length ? (value = typeof _ === "function" ? _ : src_constant(+_), stack) : value;
  };

  stack.order = function(_) {
    return arguments.length ? (order = _ == null ? order_none : typeof _ === "function" ? _ : src_constant(Array.from(_)), stack) : order;
  };

  stack.offset = function(_) {
    return arguments.length ? (offset = _ == null ? offset_none : _, stack) : offset;
  };

  return stack;
}

;// ./node_modules/d3-shape/src/offset/expand.js


/* harmony default export */ function expand(series, order) {
  if (!((n = series.length) > 0)) return;
  for (var i, n, j = 0, m = series[0].length, y; j < m; ++j) {
    for (y = i = 0; i < n; ++i) y += series[i][j][1] || 0;
    if (y) for (i = 0; i < n; ++i) series[i][j][1] /= y;
  }
  offset_none(series, order);
}

;// ./node_modules/d3-shape/src/offset/diverging.js
/* harmony default export */ function diverging(series, order) {
  if (!((n = series.length) > 0)) return;
  for (var i, j = 0, d, dy, yp, yn, n, m = series[order[0]].length; j < m; ++j) {
    for (yp = yn = 0, i = 0; i < n; ++i) {
      if ((dy = (d = series[order[i]][j])[1] - d[0]) > 0) {
        d[0] = yp, d[1] = yp += dy;
      } else if (dy < 0) {
        d[1] = yn, d[0] = yn += dy;
      } else {
        d[0] = 0, d[1] = dy;
      }
    }
  }
}

;// ./node_modules/d3-shape/src/offset/silhouette.js


/* harmony default export */ function silhouette(series, order) {
  if (!((n = series.length) > 0)) return;
  for (var j = 0, s0 = series[order[0]], n, m = s0.length; j < m; ++j) {
    for (var i = 0, y = 0; i < n; ++i) y += series[i][j][1] || 0;
    s0[j][1] += s0[j][0] = -y / 2;
  }
  offset_none(series, order);
}

;// ./node_modules/d3-shape/src/offset/wiggle.js


/* harmony default export */ function wiggle(series, order) {
  if (!((n = series.length) > 0) || !((m = (s0 = series[order[0]]).length) > 0)) return;
  for (var y = 0, j = 1, s0, m, n; j < m; ++j) {
    for (var i = 0, s1 = 0, s2 = 0; i < n; ++i) {
      var si = series[order[i]],
          sij0 = si[j][1] || 0,
          sij1 = si[j - 1][1] || 0,
          s3 = (sij0 - sij1) / 2;
      for (var k = 0; k < i; ++k) {
        var sk = series[order[k]],
            skj0 = sk[j][1] || 0,
            skj1 = sk[j - 1][1] || 0;
        s3 += skj0 - skj1;
      }
      s1 += sij0, s2 += s3 * sij0;
    }
    s0[j - 1][1] += s0[j - 1][0] = y;
    if (s1) y -= s2 / s1;
  }
  s0[j - 1][1] += s0[j - 1][0] = y;
  offset_none(series, order);
}

;// ./node_modules/d3-shape/src/order/appearance.js


/* harmony default export */ function order_appearance(series) {
  var peaks = series.map(peak);
  return none(series).sort(function(a, b) { return peaks[a] - peaks[b]; });
}

function peak(series) {
  var i = -1, j = 0, n = series.length, vi, vj = -Infinity;
  while (++i < n) if ((vi = +series[i][1]) > vj) vj = vi, j = i;
  return j;
}

;// ./node_modules/d3-shape/src/order/ascending.js


/* harmony default export */ function order_ascending(series) {
  var sums = series.map(ascending_sum);
  return none(series).sort(function(a, b) { return sums[a] - sums[b]; });
}

function ascending_sum(series) {
  var s = 0, i = -1, n = series.length, v;
  while (++i < n) if (v = +series[i][1]) s += v;
  return s;
}

;// ./node_modules/d3-shape/src/order/descending.js


/* harmony default export */ function order_descending(series) {
  return ascending(series).reverse();
}

;// ./node_modules/d3-shape/src/order/insideOut.js



/* harmony default export */ function insideOut(series) {
  var n = series.length,
      i,
      j,
      sums = series.map(sum),
      order = appearance(series),
      top = 0,
      bottom = 0,
      tops = [],
      bottoms = [];

  for (i = 0; i < n; ++i) {
    j = order[i];
    if (top < bottom) {
      top += sums[j];
      tops.push(j);
    } else {
      bottom += sums[j];
      bottoms.push(j);
    }
  }

  return bottoms.reverse().concat(tops);
}

;// ./node_modules/d3-shape/src/order/reverse.js


/* harmony default export */ function reverse(series) {
  return none(series).reverse();
}

;// ./node_modules/d3-shape/src/index.js




 // Note: radialArea is deprecated!
 // Note: radialLine is deprecated!

















































/***/ }),

/***/ 55282:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  tB: () => (/* reexport */ timer_now),
  wR: () => (/* reexport */ src_timeout),
  O1: () => (/* reexport */ timer)
});

// UNUSED EXPORTS: interval, timerFlush

;// ./node_modules/d3-timer/src/timer.js
var timer_frame = 0, // is an animation frame pending?
    timeout = 0, // is a timeout pending?
    interval = 0, // are any timers active?
    pokeDelay = 1000, // how frequently we check for clock skew
    taskHead,
    taskTail,
    clockLast = 0,
    clockNow = 0,
    clockSkew = 0,
    clock = typeof performance === "object" && performance.now ? performance : Date,
    setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

function timer_now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}

function clearNow() {
  clockNow = 0;
}

function timer_Timer() {
  this._call =
  this._time =
  this._next = null;
}

timer_Timer.prototype = timer.prototype = {
  constructor: timer_Timer,
  restart: function(callback, delay, time) {
    if (typeof callback !== "function") throw new TypeError("callback is not a function");
    time = (time == null ? timer_now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail) taskTail._next = this;
      else taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};

function timer(callback, delay, time) {
  var t = new timer_Timer;
  t.restart(callback, delay, time);
  return t;
}

function timerFlush() {
  timer_now(); // Get the current time, if not already set.
  ++timer_frame; // Pretend we’ve set an alarm, if we haven’t already.
  var t = taskHead, e;
  while (t) {
    if ((e = clockNow - t._time) >= 0) t._call.call(undefined, e);
    t = t._next;
  }
  --timer_frame;
}

function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  timer_frame = timeout = 0;
  try {
    timerFlush();
  } finally {
    timer_frame = 0;
    nap();
    clockNow = 0;
  }
}

function poke() {
  var now = clock.now(), delay = now - clockLast;
  if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
}

function nap() {
  var t0, t1 = taskHead, t2, time = Infinity;
  while (t1) {
    if (t1._call) {
      if (time > t1._time) time = t1._time;
      t0 = t1, t1 = t1._next;
    } else {
      t2 = t1._next, t1._next = null;
      t1 = t0 ? t0._next = t2 : taskHead = t2;
    }
  }
  taskTail = t0;
  sleep(time);
}

function sleep(time) {
  if (timer_frame) return; // Soonest alarm already set, or will be.
  if (timeout) timeout = clearTimeout(timeout);
  var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
  if (delay > 24) {
    if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
    if (interval) interval = clearInterval(interval);
  } else {
    if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    timer_frame = 1, setFrame(wake);
  }
}

;// ./node_modules/d3-timer/src/timeout.js


/* harmony default export */ function src_timeout(callback, delay, time) {
  var t = new timer_Timer;
  delay = delay == null ? 0 : +delay;
  t.restart(elapsed => {
    t.stop();
    callback(elapsed + delay);
  }, delay, time);
  return t;
}

;// ./node_modules/d3-timer/src/interval.js


/* harmony default export */ function src_interval(callback, delay, time) {
  var t = new Timer, total = delay;
  if (delay == null) return t.restart(callback, delay, time), t;
  t._restart = t.restart;
  t.restart = function(callback, delay, time) {
    delay = +delay, time = time == null ? now() : +time;
    t._restart(function tick(elapsed) {
      elapsed += total;
      t._restart(tick, total += delay, time);
      callback(elapsed);
    }, delay, time);
  }
  t.restart(callback, delay, time);
  return t;
}

;// ./node_modules/d3-timer/src/index.js







/***/ }),

/***/ 91674:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  DC: () => (/* reexport */ timeFormat),
  aL: () => (/* reexport */ utcFormat)
});

// UNUSED EXPORTS: isoFormat, isoParse, timeFormatDefaultLocale, timeFormatLocale, timeParse, utcParse

// EXTERNAL MODULE: ./node_modules/d3-time/src/index.js + 11 modules
var src = __webpack_require__(30552);
;// ./node_modules/d3-time-format/src/locale.js


function localDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
    date.setFullYear(d.y);
    return date;
  }
  return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
}

function utcDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
    date.setUTCFullYear(d.y);
    return date;
  }
  return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
}

function newDate(y, m, d) {
  return {y: y, m: m, d: d, H: 0, M: 0, S: 0, L: 0};
}

function formatLocale(locale) {
  var locale_dateTime = locale.dateTime,
      locale_date = locale.date,
      locale_time = locale.time,
      locale_periods = locale.periods,
      locale_weekdays = locale.days,
      locale_shortWeekdays = locale.shortDays,
      locale_months = locale.months,
      locale_shortMonths = locale.shortMonths;

  var periodRe = formatRe(locale_periods),
      periodLookup = formatLookup(locale_periods),
      weekdayRe = formatRe(locale_weekdays),
      weekdayLookup = formatLookup(locale_weekdays),
      shortWeekdayRe = formatRe(locale_shortWeekdays),
      shortWeekdayLookup = formatLookup(locale_shortWeekdays),
      monthRe = formatRe(locale_months),
      monthLookup = formatLookup(locale_months),
      shortMonthRe = formatRe(locale_shortMonths),
      shortMonthLookup = formatLookup(locale_shortMonths);

  var formats = {
    "a": formatShortWeekday,
    "A": formatWeekday,
    "b": formatShortMonth,
    "B": formatMonth,
    "c": null,
    "d": formatDayOfMonth,
    "e": formatDayOfMonth,
    "f": formatMicroseconds,
    "g": formatYearISO,
    "G": formatFullYearISO,
    "H": formatHour24,
    "I": formatHour12,
    "j": formatDayOfYear,
    "L": formatMilliseconds,
    "m": formatMonthNumber,
    "M": formatMinutes,
    "p": formatPeriod,
    "q": formatQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatSeconds,
    "u": formatWeekdayNumberMonday,
    "U": formatWeekNumberSunday,
    "V": formatWeekNumberISO,
    "w": formatWeekdayNumberSunday,
    "W": formatWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatYear,
    "Y": formatFullYear,
    "Z": formatZone,
    "%": formatLiteralPercent
  };

  var utcFormats = {
    "a": formatUTCShortWeekday,
    "A": formatUTCWeekday,
    "b": formatUTCShortMonth,
    "B": formatUTCMonth,
    "c": null,
    "d": formatUTCDayOfMonth,
    "e": formatUTCDayOfMonth,
    "f": formatUTCMicroseconds,
    "g": formatUTCYearISO,
    "G": formatUTCFullYearISO,
    "H": formatUTCHour24,
    "I": formatUTCHour12,
    "j": formatUTCDayOfYear,
    "L": formatUTCMilliseconds,
    "m": formatUTCMonthNumber,
    "M": formatUTCMinutes,
    "p": formatUTCPeriod,
    "q": formatUTCQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatUTCSeconds,
    "u": formatUTCWeekdayNumberMonday,
    "U": formatUTCWeekNumberSunday,
    "V": formatUTCWeekNumberISO,
    "w": formatUTCWeekdayNumberSunday,
    "W": formatUTCWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatUTCYear,
    "Y": formatUTCFullYear,
    "Z": formatUTCZone,
    "%": formatLiteralPercent
  };

  var parses = {
    "a": parseShortWeekday,
    "A": parseWeekday,
    "b": parseShortMonth,
    "B": parseMonth,
    "c": parseLocaleDateTime,
    "d": parseDayOfMonth,
    "e": parseDayOfMonth,
    "f": parseMicroseconds,
    "g": parseYear,
    "G": parseFullYear,
    "H": parseHour24,
    "I": parseHour24,
    "j": parseDayOfYear,
    "L": parseMilliseconds,
    "m": parseMonthNumber,
    "M": parseMinutes,
    "p": parsePeriod,
    "q": parseQuarter,
    "Q": parseUnixTimestamp,
    "s": parseUnixTimestampSeconds,
    "S": parseSeconds,
    "u": parseWeekdayNumberMonday,
    "U": parseWeekNumberSunday,
    "V": parseWeekNumberISO,
    "w": parseWeekdayNumberSunday,
    "W": parseWeekNumberMonday,
    "x": parseLocaleDate,
    "X": parseLocaleTime,
    "y": parseYear,
    "Y": parseFullYear,
    "Z": parseZone,
    "%": parseLiteralPercent
  };

  // These recursive directive definitions must be deferred.
  formats.x = newFormat(locale_date, formats);
  formats.X = newFormat(locale_time, formats);
  formats.c = newFormat(locale_dateTime, formats);
  utcFormats.x = newFormat(locale_date, utcFormats);
  utcFormats.X = newFormat(locale_time, utcFormats);
  utcFormats.c = newFormat(locale_dateTime, utcFormats);

  function newFormat(specifier, formats) {
    return function(date) {
      var string = [],
          i = -1,
          j = 0,
          n = specifier.length,
          c,
          pad,
          format;

      if (!(date instanceof Date)) date = new Date(+date);

      while (++i < n) {
        if (specifier.charCodeAt(i) === 37) {
          string.push(specifier.slice(j, i));
          if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
          else pad = c === "e" ? " " : "0";
          if (format = formats[c]) c = format(date, pad);
          string.push(c);
          j = i + 1;
        }
      }

      string.push(specifier.slice(j, i));
      return string.join("");
    };
  }

  function newParse(specifier, Z) {
    return function(string) {
      var d = newDate(1900, undefined, 1),
          i = parseSpecifier(d, specifier, string += "", 0),
          week, day;
      if (i != string.length) return null;

      // If a UNIX timestamp is specified, return it.
      if ("Q" in d) return new Date(d.Q);
      if ("s" in d) return new Date(d.s * 1000 + ("L" in d ? d.L : 0));

      // If this is utcParse, never use the local timezone.
      if (Z && !("Z" in d)) d.Z = 0;

      // The am-pm flag is 0 for AM, and 1 for PM.
      if ("p" in d) d.H = d.H % 12 + d.p * 12;

      // If the month was not specified, inherit from the quarter.
      if (d.m === undefined) d.m = "q" in d ? d.q : 0;

      // Convert day-of-week and week-of-year to day-of-year.
      if ("V" in d) {
        if (d.V < 1 || d.V > 53) return null;
        if (!("w" in d)) d.w = 1;
        if ("Z" in d) {
          week = utcDate(newDate(d.y, 0, 1)), day = week.getUTCDay();
          week = day > 4 || day === 0 ? src/* utcMonday */.rt.ceil(week) : (0,src/* utcMonday */.rt)(week);
          week = src/* utcDay */.dA.offset(week, (d.V - 1) * 7);
          d.y = week.getUTCFullYear();
          d.m = week.getUTCMonth();
          d.d = week.getUTCDate() + (d.w + 6) % 7;
        } else {
          week = localDate(newDate(d.y, 0, 1)), day = week.getDay();
          week = day > 4 || day === 0 ? src/* timeMonday */.AB.ceil(week) : (0,src/* timeMonday */.AB)(week);
          week = src/* timeDay */.UA.offset(week, (d.V - 1) * 7);
          d.y = week.getFullYear();
          d.m = week.getMonth();
          d.d = week.getDate() + (d.w + 6) % 7;
        }
      } else if ("W" in d || "U" in d) {
        if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
        day = "Z" in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay();
        d.m = 0;
        d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day + 5) % 7 : d.w + d.U * 7 - (day + 6) % 7;
      }

      // If a time zone is specified, all fields are interpreted as UTC and then
      // offset according to the specified time zone.
      if ("Z" in d) {
        d.H += d.Z / 100 | 0;
        d.M += d.Z % 100;
        return utcDate(d);
      }

      // Otherwise, all fields are in local time.
      return localDate(d);
    };
  }

  function parseSpecifier(d, specifier, string, j) {
    var i = 0,
        n = specifier.length,
        m = string.length,
        c,
        parse;

    while (i < n) {
      if (j >= m) return -1;
      c = specifier.charCodeAt(i++);
      if (c === 37) {
        c = specifier.charAt(i++);
        parse = parses[c in pads ? specifier.charAt(i++) : c];
        if (!parse || ((j = parse(d, string, j)) < 0)) return -1;
      } else if (c != string.charCodeAt(j++)) {
        return -1;
      }
    }

    return j;
  }

  function parsePeriod(d, string, i) {
    var n = periodRe.exec(string.slice(i));
    return n ? (d.p = periodLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }

  function parseShortWeekday(d, string, i) {
    var n = shortWeekdayRe.exec(string.slice(i));
    return n ? (d.w = shortWeekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }

  function parseWeekday(d, string, i) {
    var n = weekdayRe.exec(string.slice(i));
    return n ? (d.w = weekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }

  function parseShortMonth(d, string, i) {
    var n = shortMonthRe.exec(string.slice(i));
    return n ? (d.m = shortMonthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }

  function parseMonth(d, string, i) {
    var n = monthRe.exec(string.slice(i));
    return n ? (d.m = monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }

  function parseLocaleDateTime(d, string, i) {
    return parseSpecifier(d, locale_dateTime, string, i);
  }

  function parseLocaleDate(d, string, i) {
    return parseSpecifier(d, locale_date, string, i);
  }

  function parseLocaleTime(d, string, i) {
    return parseSpecifier(d, locale_time, string, i);
  }

  function formatShortWeekday(d) {
    return locale_shortWeekdays[d.getDay()];
  }

  function formatWeekday(d) {
    return locale_weekdays[d.getDay()];
  }

  function formatShortMonth(d) {
    return locale_shortMonths[d.getMonth()];
  }

  function formatMonth(d) {
    return locale_months[d.getMonth()];
  }

  function formatPeriod(d) {
    return locale_periods[+(d.getHours() >= 12)];
  }

  function formatQuarter(d) {
    return 1 + ~~(d.getMonth() / 3);
  }

  function formatUTCShortWeekday(d) {
    return locale_shortWeekdays[d.getUTCDay()];
  }

  function formatUTCWeekday(d) {
    return locale_weekdays[d.getUTCDay()];
  }

  function formatUTCShortMonth(d) {
    return locale_shortMonths[d.getUTCMonth()];
  }

  function formatUTCMonth(d) {
    return locale_months[d.getUTCMonth()];
  }

  function formatUTCPeriod(d) {
    return locale_periods[+(d.getUTCHours() >= 12)];
  }

  function formatUTCQuarter(d) {
    return 1 + ~~(d.getUTCMonth() / 3);
  }

  return {
    format: function(specifier) {
      var f = newFormat(specifier += "", formats);
      f.toString = function() { return specifier; };
      return f;
    },
    parse: function(specifier) {
      var p = newParse(specifier += "", false);
      p.toString = function() { return specifier; };
      return p;
    },
    utcFormat: function(specifier) {
      var f = newFormat(specifier += "", utcFormats);
      f.toString = function() { return specifier; };
      return f;
    },
    utcParse: function(specifier) {
      var p = newParse(specifier += "", true);
      p.toString = function() { return specifier; };
      return p;
    }
  };
}

var pads = {"-": "", "_": " ", "0": "0"},
    numberRe = /^\s*\d+/, // note: ignores next directive
    percentRe = /^%/,
    requoteRe = /[\\^$*+?|[\]().{}]/g;

function pad(value, fill, width) {
  var sign = value < 0 ? "-" : "",
      string = (sign ? -value : value) + "",
      length = string.length;
  return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
}

function requote(s) {
  return s.replace(requoteRe, "\\$&");
}

function formatRe(names) {
  return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
}

function formatLookup(names) {
  return new Map(names.map((name, i) => [name.toLowerCase(), i]));
}

function parseWeekdayNumberSunday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.w = +n[0], i + n[0].length) : -1;
}

function parseWeekdayNumberMonday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.u = +n[0], i + n[0].length) : -1;
}

function parseWeekNumberSunday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.U = +n[0], i + n[0].length) : -1;
}

function parseWeekNumberISO(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.V = +n[0], i + n[0].length) : -1;
}

function parseWeekNumberMonday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.W = +n[0], i + n[0].length) : -1;
}

function parseFullYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 4));
  return n ? (d.y = +n[0], i + n[0].length) : -1;
}

function parseYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
}

function parseZone(d, string, i) {
  var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
  return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
}

function parseQuarter(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.q = n[0] * 3 - 3, i + n[0].length) : -1;
}

function parseMonthNumber(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
}

function parseDayOfMonth(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.d = +n[0], i + n[0].length) : -1;
}

function parseDayOfYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 3));
  return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
}

function parseHour24(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.H = +n[0], i + n[0].length) : -1;
}

function parseMinutes(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.M = +n[0], i + n[0].length) : -1;
}

function parseSeconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.S = +n[0], i + n[0].length) : -1;
}

function parseMilliseconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 3));
  return n ? (d.L = +n[0], i + n[0].length) : -1;
}

function parseMicroseconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 6));
  return n ? (d.L = Math.floor(n[0] / 1000), i + n[0].length) : -1;
}

function parseLiteralPercent(d, string, i) {
  var n = percentRe.exec(string.slice(i, i + 1));
  return n ? i + n[0].length : -1;
}

function parseUnixTimestamp(d, string, i) {
  var n = numberRe.exec(string.slice(i));
  return n ? (d.Q = +n[0], i + n[0].length) : -1;
}

function parseUnixTimestampSeconds(d, string, i) {
  var n = numberRe.exec(string.slice(i));
  return n ? (d.s = +n[0], i + n[0].length) : -1;
}

function formatDayOfMonth(d, p) {
  return pad(d.getDate(), p, 2);
}

function formatHour24(d, p) {
  return pad(d.getHours(), p, 2);
}

function formatHour12(d, p) {
  return pad(d.getHours() % 12 || 12, p, 2);
}

function formatDayOfYear(d, p) {
  return pad(1 + src/* timeDay */.UA.count((0,src/* timeYear */.he)(d), d), p, 3);
}

function formatMilliseconds(d, p) {
  return pad(d.getMilliseconds(), p, 3);
}

function formatMicroseconds(d, p) {
  return formatMilliseconds(d, p) + "000";
}

function formatMonthNumber(d, p) {
  return pad(d.getMonth() + 1, p, 2);
}

function formatMinutes(d, p) {
  return pad(d.getMinutes(), p, 2);
}

function formatSeconds(d, p) {
  return pad(d.getSeconds(), p, 2);
}

function formatWeekdayNumberMonday(d) {
  var day = d.getDay();
  return day === 0 ? 7 : day;
}

function formatWeekNumberSunday(d, p) {
  return pad(src/* timeSunday */.YP.count((0,src/* timeYear */.he)(d) - 1, d), p, 2);
}

function dISO(d) {
  var day = d.getDay();
  return (day >= 4 || day === 0) ? (0,src/* timeThursday */.Mo)(d) : src/* timeThursday */.Mo.ceil(d);
}

function formatWeekNumberISO(d, p) {
  d = dISO(d);
  return pad(src/* timeThursday */.Mo.count((0,src/* timeYear */.he)(d), d) + ((0,src/* timeYear */.he)(d).getDay() === 4), p, 2);
}

function formatWeekdayNumberSunday(d) {
  return d.getDay();
}

function formatWeekNumberMonday(d, p) {
  return pad(src/* timeMonday */.AB.count((0,src/* timeYear */.he)(d) - 1, d), p, 2);
}

function formatYear(d, p) {
  return pad(d.getFullYear() % 100, p, 2);
}

function formatYearISO(d, p) {
  d = dISO(d);
  return pad(d.getFullYear() % 100, p, 2);
}

function formatFullYear(d, p) {
  return pad(d.getFullYear() % 10000, p, 4);
}

function formatFullYearISO(d, p) {
  var day = d.getDay();
  d = (day >= 4 || day === 0) ? (0,src/* timeThursday */.Mo)(d) : src/* timeThursday */.Mo.ceil(d);
  return pad(d.getFullYear() % 10000, p, 4);
}

function formatZone(d) {
  var z = d.getTimezoneOffset();
  return (z > 0 ? "-" : (z *= -1, "+"))
      + pad(z / 60 | 0, "0", 2)
      + pad(z % 60, "0", 2);
}

function formatUTCDayOfMonth(d, p) {
  return pad(d.getUTCDate(), p, 2);
}

function formatUTCHour24(d, p) {
  return pad(d.getUTCHours(), p, 2);
}

function formatUTCHour12(d, p) {
  return pad(d.getUTCHours() % 12 || 12, p, 2);
}

function formatUTCDayOfYear(d, p) {
  return pad(1 + src/* utcDay */.dA.count((0,src/* utcYear */.Mb)(d), d), p, 3);
}

function formatUTCMilliseconds(d, p) {
  return pad(d.getUTCMilliseconds(), p, 3);
}

function formatUTCMicroseconds(d, p) {
  return formatUTCMilliseconds(d, p) + "000";
}

function formatUTCMonthNumber(d, p) {
  return pad(d.getUTCMonth() + 1, p, 2);
}

function formatUTCMinutes(d, p) {
  return pad(d.getUTCMinutes(), p, 2);
}

function formatUTCSeconds(d, p) {
  return pad(d.getUTCSeconds(), p, 2);
}

function formatUTCWeekdayNumberMonday(d) {
  var dow = d.getUTCDay();
  return dow === 0 ? 7 : dow;
}

function formatUTCWeekNumberSunday(d, p) {
  return pad(src/* utcSunday */.Hl.count((0,src/* utcYear */.Mb)(d) - 1, d), p, 2);
}

function UTCdISO(d) {
  var day = d.getUTCDay();
  return (day >= 4 || day === 0) ? (0,src/* utcThursday */.pT)(d) : src/* utcThursday */.pT.ceil(d);
}

function formatUTCWeekNumberISO(d, p) {
  d = UTCdISO(d);
  return pad(src/* utcThursday */.pT.count((0,src/* utcYear */.Mb)(d), d) + ((0,src/* utcYear */.Mb)(d).getUTCDay() === 4), p, 2);
}

function formatUTCWeekdayNumberSunday(d) {
  return d.getUTCDay();
}

function formatUTCWeekNumberMonday(d, p) {
  return pad(src/* utcMonday */.rt.count((0,src/* utcYear */.Mb)(d) - 1, d), p, 2);
}

function formatUTCYear(d, p) {
  return pad(d.getUTCFullYear() % 100, p, 2);
}

function formatUTCYearISO(d, p) {
  d = UTCdISO(d);
  return pad(d.getUTCFullYear() % 100, p, 2);
}

function formatUTCFullYear(d, p) {
  return pad(d.getUTCFullYear() % 10000, p, 4);
}

function formatUTCFullYearISO(d, p) {
  var day = d.getUTCDay();
  d = (day >= 4 || day === 0) ? (0,src/* utcThursday */.pT)(d) : src/* utcThursday */.pT.ceil(d);
  return pad(d.getUTCFullYear() % 10000, p, 4);
}

function formatUTCZone() {
  return "+0000";
}

function formatLiteralPercent() {
  return "%";
}

function formatUnixTimestamp(d) {
  return +d;
}

function formatUnixTimestampSeconds(d) {
  return Math.floor(+d / 1000);
}

;// ./node_modules/d3-time-format/src/defaultLocale.js


var locale;
var timeFormat;
var timeParse;
var utcFormat;
var utcParse;

defaultLocale({
  dateTime: "%x, %X",
  date: "%-m/%-d/%Y",
  time: "%-I:%M:%S %p",
  periods: ["AM", "PM"],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});

function defaultLocale(definition) {
  locale = formatLocale(definition);
  timeFormat = locale.format;
  timeParse = locale.parse;
  utcFormat = locale.utcFormat;
  utcParse = locale.utcParse;
  return locale;
}

;// ./node_modules/d3-time-format/src/isoFormat.js


var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";

function formatIsoNative(date) {
  return date.toISOString();
}

var formatIso = Date.prototype.toISOString
    ? formatIsoNative
    : utcFormat(isoSpecifier);

/* harmony default export */ const isoFormat = ((/* unused pure expression or super */ null && (formatIso)));

;// ./node_modules/d3-time-format/src/isoParse.js



function parseIsoNative(string) {
  var date = new Date(string);
  return isNaN(date) ? null : date;
}

var parseIso = +new Date("2000-01-01T00:00:00.000Z")
    ? parseIsoNative
    : utcParse(isoSpecifier);

/* harmony default export */ const isoParse = ((/* unused pure expression or super */ null && (parseIso)));

;// ./node_modules/d3-time-format/src/index.js






/***/ }),

/***/ 94634:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Ltv: () => (/* reexport */ d3_selection_src/* select */.Lt),
  s_O: () => (/* reexport */ zoom)
});

// UNUSED EXPORTS: Adder, Delaunay, FormatSpecifier, InternMap, InternSet, Node, Path, Voronoi, ZoomTransform, active, arc, area, areaRadial, ascending, autoType, axisBottom, axisLeft, axisRight, axisTop, bin, bisect, bisectCenter, bisectLeft, bisectRight, bisector, blob, blur, blur2, blurImage, brush, brushSelection, brushX, brushY, buffer, chord, chordDirected, chordTranspose, cluster, color, contourDensity, contours, count, create, creator, cross, csv, csvFormat, csvFormatBody, csvFormatRow, csvFormatRows, csvFormatValue, csvParse, csvParseRows, cubehelix, cumsum, curveBasis, curveBasisClosed, curveBasisOpen, curveBumpX, curveBumpY, curveBundle, curveCardinal, curveCardinalClosed, curveCardinalOpen, curveCatmullRom, curveCatmullRomClosed, curveCatmullRomOpen, curveLinear, curveLinearClosed, curveMonotoneX, curveMonotoneY, curveNatural, curveStep, curveStepAfter, curveStepBefore, descending, deviation, difference, disjoint, dispatch, drag, dragDisable, dragEnable, dsv, dsvFormat, easeBack, easeBackIn, easeBackInOut, easeBackOut, easeBounce, easeBounceIn, easeBounceInOut, easeBounceOut, easeCircle, easeCircleIn, easeCircleInOut, easeCircleOut, easeCubic, easeCubicIn, easeCubicInOut, easeCubicOut, easeElastic, easeElasticIn, easeElasticInOut, easeElasticOut, easeExp, easeExpIn, easeExpInOut, easeExpOut, easeLinear, easePoly, easePolyIn, easePolyInOut, easePolyOut, easeQuad, easeQuadIn, easeQuadInOut, easeQuadOut, easeSin, easeSinIn, easeSinInOut, easeSinOut, every, extent, fcumsum, filter, flatGroup, flatRollup, forceCenter, forceCollide, forceLink, forceManyBody, forceRadial, forceSimulation, forceX, forceY, format, formatDefaultLocale, formatLocale, formatPrefix, formatSpecifier, fsum, geoAlbers, geoAlbersUsa, geoArea, geoAzimuthalEqualArea, geoAzimuthalEqualAreaRaw, geoAzimuthalEquidistant, geoAzimuthalEquidistantRaw, geoBounds, geoCentroid, geoCircle, geoClipAntimeridian, geoClipCircle, geoClipExtent, geoClipRectangle, geoConicConformal, geoConicConformalRaw, geoConicEqualArea, geoConicEqualAreaRaw, geoConicEquidistant, geoConicEquidistantRaw, geoContains, geoDistance, geoEqualEarth, geoEqualEarthRaw, geoEquirectangular, geoEquirectangularRaw, geoGnomonic, geoGnomonicRaw, geoGraticule, geoGraticule10, geoIdentity, geoInterpolate, geoLength, geoMercator, geoMercatorRaw, geoNaturalEarth1, geoNaturalEarth1Raw, geoOrthographic, geoOrthographicRaw, geoPath, geoProjection, geoProjectionMutator, geoRotation, geoStereographic, geoStereographicRaw, geoStream, geoTransform, geoTransverseMercator, geoTransverseMercatorRaw, gray, greatest, greatestIndex, group, groupSort, groups, hcl, hierarchy, histogram, hsl, html, image, index, indexes, interpolate, interpolateArray, interpolateBasis, interpolateBasisClosed, interpolateBlues, interpolateBrBG, interpolateBuGn, interpolateBuPu, interpolateCividis, interpolateCool, interpolateCubehelix, interpolateCubehelixDefault, interpolateCubehelixLong, interpolateDate, interpolateDiscrete, interpolateGnBu, interpolateGreens, interpolateGreys, interpolateHcl, interpolateHclLong, interpolateHsl, interpolateHslLong, interpolateHue, interpolateInferno, interpolateLab, interpolateMagma, interpolateNumber, interpolateNumberArray, interpolateObject, interpolateOrRd, interpolateOranges, interpolatePRGn, interpolatePiYG, interpolatePlasma, interpolatePuBu, interpolatePuBuGn, interpolatePuOr, interpolatePuRd, interpolatePurples, interpolateRainbow, interpolateRdBu, interpolateRdGy, interpolateRdPu, interpolateRdYlBu, interpolateRdYlGn, interpolateReds, interpolateRgb, interpolateRgbBasis, interpolateRgbBasisClosed, interpolateRound, interpolateSinebow, interpolateSpectral, interpolateString, interpolateTransformCss, interpolateTransformSvg, interpolateTurbo, interpolateViridis, interpolateWarm, interpolateYlGn, interpolateYlGnBu, interpolateYlOrBr, interpolateYlOrRd, interpolateZoom, interrupt, intersection, interval, isoFormat, isoParse, json, lab, lch, least, leastIndex, line, lineRadial, link, linkHorizontal, linkRadial, linkVertical, local, map, matcher, max, maxIndex, mean, median, medianIndex, merge, min, minIndex, mode, namespace, namespaces, nice, now, pack, packEnclose, packSiblings, pairs, partition, path, pathRound, permute, pie, piecewise, pointRadial, pointer, pointers, polygonArea, polygonCentroid, polygonContains, polygonHull, polygonLength, precisionFixed, precisionPrefix, precisionRound, quadtree, quantile, quantileIndex, quantileSorted, quantize, quickselect, radialArea, radialLine, randomBates, randomBernoulli, randomBeta, randomBinomial, randomCauchy, randomExponential, randomGamma, randomGeometric, randomInt, randomIrwinHall, randomLcg, randomLogNormal, randomLogistic, randomNormal, randomPareto, randomPoisson, randomUniform, randomWeibull, range, rank, reduce, reverse, rgb, ribbon, ribbonArrow, rollup, rollups, scaleBand, scaleDiverging, scaleDivergingLog, scaleDivergingPow, scaleDivergingSqrt, scaleDivergingSymlog, scaleIdentity, scaleImplicit, scaleLinear, scaleLog, scaleOrdinal, scalePoint, scalePow, scaleQuantile, scaleQuantize, scaleRadial, scaleSequential, scaleSequentialLog, scaleSequentialPow, scaleSequentialQuantile, scaleSequentialSqrt, scaleSequentialSymlog, scaleSqrt, scaleSymlog, scaleThreshold, scaleTime, scaleUtc, scan, schemeAccent, schemeBlues, schemeBrBG, schemeBuGn, schemeBuPu, schemeCategory10, schemeDark2, schemeGnBu, schemeGreens, schemeGreys, schemeObservable10, schemeOrRd, schemeOranges, schemePRGn, schemePaired, schemePastel1, schemePastel2, schemePiYG, schemePuBu, schemePuBuGn, schemePuOr, schemePuRd, schemePurples, schemeRdBu, schemeRdGy, schemeRdPu, schemeRdYlBu, schemeRdYlGn, schemeReds, schemeSet1, schemeSet2, schemeSet3, schemeSpectral, schemeTableau10, schemeYlGn, schemeYlGnBu, schemeYlOrBr, schemeYlOrRd, selectAll, selection, selector, selectorAll, shuffle, shuffler, some, sort, stack, stackOffsetDiverging, stackOffsetExpand, stackOffsetNone, stackOffsetSilhouette, stackOffsetWiggle, stackOrderAppearance, stackOrderAscending, stackOrderDescending, stackOrderInsideOut, stackOrderNone, stackOrderReverse, stratify, style, subset, sum, superset, svg, symbol, symbolAsterisk, symbolCircle, symbolCross, symbolDiamond, symbolDiamond2, symbolPlus, symbolSquare, symbolSquare2, symbolStar, symbolTimes, symbolTriangle, symbolTriangle2, symbolWye, symbolX, symbols, symbolsFill, symbolsStroke, text, thresholdFreedmanDiaconis, thresholdScott, thresholdSturges, tickFormat, tickIncrement, tickStep, ticks, timeDay, timeDays, timeFormat, timeFormatDefaultLocale, timeFormatLocale, timeFriday, timeFridays, timeHour, timeHours, timeInterval, timeMillisecond, timeMilliseconds, timeMinute, timeMinutes, timeMonday, timeMondays, timeMonth, timeMonths, timeParse, timeSaturday, timeSaturdays, timeSecond, timeSeconds, timeSunday, timeSundays, timeThursday, timeThursdays, timeTickInterval, timeTicks, timeTuesday, timeTuesdays, timeWednesday, timeWednesdays, timeWeek, timeWeeks, timeYear, timeYears, timeout, timer, timerFlush, transition, transpose, tree, treemap, treemapBinary, treemapDice, treemapResquarify, treemapSlice, treemapSliceDice, treemapSquarify, tsv, tsvFormat, tsvFormatBody, tsvFormatRow, tsvFormatRows, tsvFormatValue, tsvParse, tsvParseRows, union, unixDay, unixDays, utcDay, utcDays, utcFormat, utcFriday, utcFridays, utcHour, utcHours, utcMillisecond, utcMilliseconds, utcMinute, utcMinutes, utcMonday, utcMondays, utcMonth, utcMonths, utcParse, utcSaturday, utcSaturdays, utcSecond, utcSeconds, utcSunday, utcSundays, utcThursday, utcThursdays, utcTickInterval, utcTicks, utcTuesday, utcTuesdays, utcWednesday, utcWednesdays, utcWeek, utcWeeks, utcYear, utcYears, variance, window, xml, zip, zoomIdentity, zoomTransform

// EXTERNAL MODULE: ./node_modules/d3-array/src/index.js + 60 modules
var src = __webpack_require__(3398);
// EXTERNAL MODULE: ./node_modules/d3-axis/src/index.js + 2 modules
var d3_axis_src = __webpack_require__(82782);
// EXTERNAL MODULE: ./node_modules/d3-brush/src/index.js + 4 modules
var d3_brush_src = __webpack_require__(68217);
// EXTERNAL MODULE: ./node_modules/d3-chord/src/index.js + 5 modules
var d3_chord_src = __webpack_require__(12944);
// EXTERNAL MODULE: ./node_modules/d3-color/src/index.js + 5 modules
var d3_color_src = __webpack_require__(75423);
// EXTERNAL MODULE: ./node_modules/d3-contour/src/index.js + 8 modules
var d3_contour_src = __webpack_require__(7125);
// EXTERNAL MODULE: ./node_modules/d3-delaunay/src/index.js + 4 modules
var d3_delaunay_src = __webpack_require__(45058);
// EXTERNAL MODULE: ./node_modules/d3-dispatch/src/index.js + 1 modules
var d3_dispatch_src = __webpack_require__(90417);
// EXTERNAL MODULE: ./node_modules/d3-drag/src/index.js + 5 modules
var d3_drag_src = __webpack_require__(97119);
// EXTERNAL MODULE: ./node_modules/d3-dsv/src/index.js + 4 modules
var d3_dsv_src = __webpack_require__(57128);
// EXTERNAL MODULE: ./node_modules/d3-ease/src/index.js + 11 modules
var d3_ease_src = __webpack_require__(92754);
// EXTERNAL MODULE: ./node_modules/d3-fetch/src/index.js + 7 modules
var d3_fetch_src = __webpack_require__(72058);
// EXTERNAL MODULE: ./node_modules/d3-force/src/index.js + 11 modules
var d3_force_src = __webpack_require__(77047);
// EXTERNAL MODULE: ./node_modules/d3-format/src/index.js + 15 modules
var d3_format_src = __webpack_require__(18246);
// EXTERNAL MODULE: ./node_modules/d3-geo/src/index.js + 57 modules
var d3_geo_src = __webpack_require__(8915);
// EXTERNAL MODULE: ./node_modules/d3-hierarchy/src/index.js + 33 modules
var d3_hierarchy_src = __webpack_require__(63188);
// EXTERNAL MODULE: ./node_modules/d3-interpolate/src/index.js + 25 modules
var d3_interpolate_src = __webpack_require__(20776);
// EXTERNAL MODULE: ./node_modules/d3-path/src/index.js + 1 modules
var d3_path_src = __webpack_require__(79498);
// EXTERNAL MODULE: ./node_modules/d3-polygon/src/index.js + 6 modules
var d3_polygon_src = __webpack_require__(18258);
// EXTERNAL MODULE: ./node_modules/d3-quadtree/src/index.js + 14 modules
var d3_quadtree_src = __webpack_require__(80395);
// EXTERNAL MODULE: ./node_modules/d3-random/src/index.js + 19 modules
var d3_random_src = __webpack_require__(85404);
// EXTERNAL MODULE: ./node_modules/d3-scale/src/index.js + 22 modules
var d3_scale_src = __webpack_require__(16199);
;// ./node_modules/d3-scale-chromatic/src/colors.js
/* harmony default export */ function colors(specifier) {
  var n = specifier.length / 6 | 0, colors = new Array(n), i = 0;
  while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
  return colors;
}

;// ./node_modules/d3-scale-chromatic/src/categorical/category10.js


/* harmony default export */ const category10 = (colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf"));

;// ./node_modules/d3-scale-chromatic/src/categorical/Accent.js


/* harmony default export */ const Accent = (colors("7fc97fbeaed4fdc086ffff99386cb0f0027fbf5b17666666"));

;// ./node_modules/d3-scale-chromatic/src/categorical/Dark2.js


/* harmony default export */ const Dark2 = (colors("1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666"));

;// ./node_modules/d3-scale-chromatic/src/categorical/observable10.js


/* harmony default export */ const observable10 = (colors("4269d0efb118ff725c6cc5b03ca951ff8ab7a463f297bbf59c6b4e9498a0"));

;// ./node_modules/d3-scale-chromatic/src/categorical/Paired.js


/* harmony default export */ const Paired = (colors("a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928"));

;// ./node_modules/d3-scale-chromatic/src/categorical/Pastel1.js


/* harmony default export */ const Pastel1 = (colors("fbb4aeb3cde3ccebc5decbe4fed9a6ffffcce5d8bdfddaecf2f2f2"));

;// ./node_modules/d3-scale-chromatic/src/categorical/Pastel2.js


/* harmony default export */ const Pastel2 = (colors("b3e2cdfdcdaccbd5e8f4cae4e6f5c9fff2aef1e2cccccccc"));

;// ./node_modules/d3-scale-chromatic/src/categorical/Set1.js


/* harmony default export */ const Set1 = (colors("e41a1c377eb84daf4a984ea3ff7f00ffff33a65628f781bf999999"));

;// ./node_modules/d3-scale-chromatic/src/categorical/Set2.js


/* harmony default export */ const Set2 = (colors("66c2a5fc8d628da0cbe78ac3a6d854ffd92fe5c494b3b3b3"));

;// ./node_modules/d3-scale-chromatic/src/categorical/Set3.js


/* harmony default export */ const Set3 = (colors("8dd3c7ffffb3bebadafb807280b1d3fdb462b3de69fccde5d9d9d9bc80bdccebc5ffed6f"));

;// ./node_modules/d3-scale-chromatic/src/categorical/Tableau10.js


/* harmony default export */ const Tableau10 = (colors("4e79a7f28e2ce1575976b7b259a14fedc949af7aa1ff9da79c755fbab0ab"));

;// ./node_modules/d3-scale-chromatic/src/ramp.js


/* harmony default export */ const ramp = (scheme => (0,d3_interpolate_src/* interpolateRgbBasis */.z4)(scheme[scheme.length - 1]));

;// ./node_modules/d3-scale-chromatic/src/diverging/BrBG.js



var scheme = new Array(3).concat(
  "d8b365f5f5f55ab4ac",
  "a6611adfc27d80cdc1018571",
  "a6611adfc27df5f5f580cdc1018571",
  "8c510ad8b365f6e8c3c7eae55ab4ac01665e",
  "8c510ad8b365f6e8c3f5f5f5c7eae55ab4ac01665e",
  "8c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e",
  "8c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e",
  "5430058c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e003c30",
  "5430058c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e003c30"
).map(colors);

/* harmony default export */ const BrBG = (ramp(scheme));

;// ./node_modules/d3-scale-chromatic/src/diverging/PRGn.js



var PRGn_scheme = new Array(3).concat(
  "af8dc3f7f7f77fbf7b",
  "7b3294c2a5cfa6dba0008837",
  "7b3294c2a5cff7f7f7a6dba0008837",
  "762a83af8dc3e7d4e8d9f0d37fbf7b1b7837",
  "762a83af8dc3e7d4e8f7f7f7d9f0d37fbf7b1b7837",
  "762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b7837",
  "762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b7837",
  "40004b762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b783700441b",
  "40004b762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b783700441b"
).map(colors);

/* harmony default export */ const PRGn = (ramp(PRGn_scheme));

;// ./node_modules/d3-scale-chromatic/src/diverging/PiYG.js



var PiYG_scheme = new Array(3).concat(
  "e9a3c9f7f7f7a1d76a",
  "d01c8bf1b6dab8e1864dac26",
  "d01c8bf1b6daf7f7f7b8e1864dac26",
  "c51b7de9a3c9fde0efe6f5d0a1d76a4d9221",
  "c51b7de9a3c9fde0eff7f7f7e6f5d0a1d76a4d9221",
  "c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221",
  "c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221",
  "8e0152c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221276419",
  "8e0152c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221276419"
).map(colors);

/* harmony default export */ const PiYG = (ramp(PiYG_scheme));

;// ./node_modules/d3-scale-chromatic/src/diverging/PuOr.js



var PuOr_scheme = new Array(3).concat(
  "998ec3f7f7f7f1a340",
  "5e3c99b2abd2fdb863e66101",
  "5e3c99b2abd2f7f7f7fdb863e66101",
  "542788998ec3d8daebfee0b6f1a340b35806",
  "542788998ec3d8daebf7f7f7fee0b6f1a340b35806",
  "5427888073acb2abd2d8daebfee0b6fdb863e08214b35806",
  "5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b35806",
  "2d004b5427888073acb2abd2d8daebfee0b6fdb863e08214b358067f3b08",
  "2d004b5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b358067f3b08"
).map(colors);

/* harmony default export */ const PuOr = (ramp(PuOr_scheme));

;// ./node_modules/d3-scale-chromatic/src/diverging/RdBu.js



var RdBu_scheme = new Array(3).concat(
  "ef8a62f7f7f767a9cf",
  "ca0020f4a58292c5de0571b0",
  "ca0020f4a582f7f7f792c5de0571b0",
  "b2182bef8a62fddbc7d1e5f067a9cf2166ac",
  "b2182bef8a62fddbc7f7f7f7d1e5f067a9cf2166ac",
  "b2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac",
  "b2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac",
  "67001fb2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac053061",
  "67001fb2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac053061"
).map(colors);

/* harmony default export */ const RdBu = (ramp(RdBu_scheme));

;// ./node_modules/d3-scale-chromatic/src/diverging/RdGy.js



var RdGy_scheme = new Array(3).concat(
  "ef8a62ffffff999999",
  "ca0020f4a582bababa404040",
  "ca0020f4a582ffffffbababa404040",
  "b2182bef8a62fddbc7e0e0e09999994d4d4d",
  "b2182bef8a62fddbc7ffffffe0e0e09999994d4d4d",
  "b2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d",
  "b2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d",
  "67001fb2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d1a1a1a",
  "67001fb2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d1a1a1a"
).map(colors);

/* harmony default export */ const RdGy = (ramp(RdGy_scheme));

;// ./node_modules/d3-scale-chromatic/src/diverging/RdYlBu.js



var RdYlBu_scheme = new Array(3).concat(
  "fc8d59ffffbf91bfdb",
  "d7191cfdae61abd9e92c7bb6",
  "d7191cfdae61ffffbfabd9e92c7bb6",
  "d73027fc8d59fee090e0f3f891bfdb4575b4",
  "d73027fc8d59fee090ffffbfe0f3f891bfdb4575b4",
  "d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4",
  "d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4",
  "a50026d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4313695",
  "a50026d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4313695"
).map(colors);

/* harmony default export */ const RdYlBu = (ramp(RdYlBu_scheme));

;// ./node_modules/d3-scale-chromatic/src/diverging/RdYlGn.js



var RdYlGn_scheme = new Array(3).concat(
  "fc8d59ffffbf91cf60",
  "d7191cfdae61a6d96a1a9641",
  "d7191cfdae61ffffbfa6d96a1a9641",
  "d73027fc8d59fee08bd9ef8b91cf601a9850",
  "d73027fc8d59fee08bffffbfd9ef8b91cf601a9850",
  "d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850",
  "d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850",
  "a50026d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850006837",
  "a50026d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850006837"
).map(colors);

/* harmony default export */ const RdYlGn = (ramp(RdYlGn_scheme));

;// ./node_modules/d3-scale-chromatic/src/diverging/Spectral.js



var Spectral_scheme = new Array(3).concat(
  "fc8d59ffffbf99d594",
  "d7191cfdae61abdda42b83ba",
  "d7191cfdae61ffffbfabdda42b83ba",
  "d53e4ffc8d59fee08be6f59899d5943288bd",
  "d53e4ffc8d59fee08bffffbfe6f59899d5943288bd",
  "d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd",
  "d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd",
  "9e0142d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd5e4fa2",
  "9e0142d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd5e4fa2"
).map(colors);

/* harmony default export */ const Spectral = (ramp(Spectral_scheme));

;// ./node_modules/d3-scale-chromatic/src/sequential-multi/BuGn.js



var BuGn_scheme = new Array(3).concat(
  "e5f5f999d8c92ca25f",
  "edf8fbb2e2e266c2a4238b45",
  "edf8fbb2e2e266c2a42ca25f006d2c",
  "edf8fbccece699d8c966c2a42ca25f006d2c",
  "edf8fbccece699d8c966c2a441ae76238b45005824",
  "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45005824",
  "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45006d2c00441b"
).map(colors);

/* harmony default export */ const BuGn = (ramp(BuGn_scheme));

;// ./node_modules/d3-scale-chromatic/src/sequential-multi/BuPu.js



var BuPu_scheme = new Array(3).concat(
  "e0ecf49ebcda8856a7",
  "edf8fbb3cde38c96c688419d",
  "edf8fbb3cde38c96c68856a7810f7c",
  "edf8fbbfd3e69ebcda8c96c68856a7810f7c",
  "edf8fbbfd3e69ebcda8c96c68c6bb188419d6e016b",
  "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d6e016b",
  "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d810f7c4d004b"
).map(colors);

/* harmony default export */ const BuPu = (ramp(BuPu_scheme));

;// ./node_modules/d3-scale-chromatic/src/sequential-multi/GnBu.js



var GnBu_scheme = new Array(3).concat(
  "e0f3dba8ddb543a2ca",
  "f0f9e8bae4bc7bccc42b8cbe",
  "f0f9e8bae4bc7bccc443a2ca0868ac",
  "f0f9e8ccebc5a8ddb57bccc443a2ca0868ac",
  "f0f9e8ccebc5a8ddb57bccc44eb3d32b8cbe08589e",
  "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe08589e",
  "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe0868ac084081"
).map(colors);

/* harmony default export */ const GnBu = (ramp(GnBu_scheme));

;// ./node_modules/d3-scale-chromatic/src/sequential-multi/OrRd.js



var OrRd_scheme = new Array(3).concat(
  "fee8c8fdbb84e34a33",
  "fef0d9fdcc8afc8d59d7301f",
  "fef0d9fdcc8afc8d59e34a33b30000",
  "fef0d9fdd49efdbb84fc8d59e34a33b30000",
  "fef0d9fdd49efdbb84fc8d59ef6548d7301f990000",
  "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301f990000",
  "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301fb300007f0000"
).map(colors);

/* harmony default export */ const OrRd = (ramp(OrRd_scheme));

;// ./node_modules/d3-scale-chromatic/src/sequential-multi/PuBuGn.js



var PuBuGn_scheme = new Array(3).concat(
  "ece2f0a6bddb1c9099",
  "f6eff7bdc9e167a9cf02818a",
  "f6eff7bdc9e167a9cf1c9099016c59",
  "f6eff7d0d1e6a6bddb67a9cf1c9099016c59",
  "f6eff7d0d1e6a6bddb67a9cf3690c002818a016450",
  "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016450",
  "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016c59014636"
).map(colors);

/* harmony default export */ const PuBuGn = (ramp(PuBuGn_scheme));

;// ./node_modules/d3-scale-chromatic/src/sequential-multi/PuBu.js



var PuBu_scheme = new Array(3).concat(
  "ece7f2a6bddb2b8cbe",
  "f1eef6bdc9e174a9cf0570b0",
  "f1eef6bdc9e174a9cf2b8cbe045a8d",
  "f1eef6d0d1e6a6bddb74a9cf2b8cbe045a8d",
  "f1eef6d0d1e6a6bddb74a9cf3690c00570b0034e7b",
  "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0034e7b",
  "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0045a8d023858"
).map(colors);

/* harmony default export */ const PuBu = (ramp(PuBu_scheme));

;// ./node_modules/d3-scale-chromatic/src/sequential-multi/PuRd.js



var PuRd_scheme = new Array(3).concat(
  "e7e1efc994c7dd1c77",
  "f1eef6d7b5d8df65b0ce1256",
  "f1eef6d7b5d8df65b0dd1c77980043",
  "f1eef6d4b9dac994c7df65b0dd1c77980043",
  "f1eef6d4b9dac994c7df65b0e7298ace125691003f",
  "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125691003f",
  "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125698004367001f"
).map(colors);

/* harmony default export */ const PuRd = (ramp(PuRd_scheme));

;// ./node_modules/d3-scale-chromatic/src/sequential-multi/RdPu.js



var RdPu_scheme = new Array(3).concat(
  "fde0ddfa9fb5c51b8a",
  "feebe2fbb4b9f768a1ae017e",
  "feebe2fbb4b9f768a1c51b8a7a0177",
  "feebe2fcc5c0fa9fb5f768a1c51b8a7a0177",
  "feebe2fcc5c0fa9fb5f768a1dd3497ae017e7a0177",
  "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a0177",
  "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a017749006a"
).map(colors);

/* harmony default export */ const RdPu = (ramp(RdPu_scheme));

;// ./node_modules/d3-scale-chromatic/src/sequential-multi/YlGnBu.js



var YlGnBu_scheme = new Array(3).concat(
  "edf8b17fcdbb2c7fb8",
  "ffffcca1dab441b6c4225ea8",
  "ffffcca1dab441b6c42c7fb8253494",
  "ffffccc7e9b47fcdbb41b6c42c7fb8253494",
  "ffffccc7e9b47fcdbb41b6c41d91c0225ea80c2c84",
  "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea80c2c84",
  "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea8253494081d58"
).map(colors);

/* harmony default export */ const YlGnBu = (ramp(YlGnBu_scheme));

;// ./node_modules/d3-scale-chromatic/src/sequential-multi/YlGn.js



var YlGn_scheme = new Array(3).concat(
  "f7fcb9addd8e31a354",
  "ffffccc2e69978c679238443",
  "ffffccc2e69978c67931a354006837",
  "ffffccd9f0a3addd8e78c67931a354006837",
  "ffffccd9f0a3addd8e78c67941ab5d238443005a32",
  "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443005a32",
  "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443006837004529"
).map(colors);

/* harmony default export */ const YlGn = (ramp(YlGn_scheme));

;// ./node_modules/d3-scale-chromatic/src/sequential-multi/YlOrBr.js



var YlOrBr_scheme = new Array(3).concat(
  "fff7bcfec44fd95f0e",
  "ffffd4fed98efe9929cc4c02",
  "ffffd4fed98efe9929d95f0e993404",
  "ffffd4fee391fec44ffe9929d95f0e993404",
  "ffffd4fee391fec44ffe9929ec7014cc4c028c2d04",
  "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c028c2d04",
  "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c02993404662506"
).map(colors);

/* harmony default export */ const YlOrBr = (ramp(YlOrBr_scheme));

;// ./node_modules/d3-scale-chromatic/src/sequential-multi/YlOrRd.js



var YlOrRd_scheme = new Array(3).concat(
  "ffeda0feb24cf03b20",
  "ffffb2fecc5cfd8d3ce31a1c",
  "ffffb2fecc5cfd8d3cf03b20bd0026",
  "ffffb2fed976feb24cfd8d3cf03b20bd0026",
  "ffffb2fed976feb24cfd8d3cfc4e2ae31a1cb10026",
  "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cb10026",
  "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cbd0026800026"
).map(colors);

/* harmony default export */ const YlOrRd = (ramp(YlOrRd_scheme));

;// ./node_modules/d3-scale-chromatic/src/sequential-single/Blues.js



var Blues_scheme = new Array(3).concat(
  "deebf79ecae13182bd",
  "eff3ffbdd7e76baed62171b5",
  "eff3ffbdd7e76baed63182bd08519c",
  "eff3ffc6dbef9ecae16baed63182bd08519c",
  "eff3ffc6dbef9ecae16baed64292c62171b5084594",
  "f7fbffdeebf7c6dbef9ecae16baed64292c62171b5084594",
  "f7fbffdeebf7c6dbef9ecae16baed64292c62171b508519c08306b"
).map(colors);

/* harmony default export */ const Blues = (ramp(Blues_scheme));

;// ./node_modules/d3-scale-chromatic/src/sequential-single/Greens.js



var Greens_scheme = new Array(3).concat(
  "e5f5e0a1d99b31a354",
  "edf8e9bae4b374c476238b45",
  "edf8e9bae4b374c47631a354006d2c",
  "edf8e9c7e9c0a1d99b74c47631a354006d2c",
  "edf8e9c7e9c0a1d99b74c47641ab5d238b45005a32",
  "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45005a32",
  "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45006d2c00441b"
).map(colors);

/* harmony default export */ const Greens = (ramp(Greens_scheme));

;// ./node_modules/d3-scale-chromatic/src/sequential-single/Greys.js



var Greys_scheme = new Array(3).concat(
  "f0f0f0bdbdbd636363",
  "f7f7f7cccccc969696525252",
  "f7f7f7cccccc969696636363252525",
  "f7f7f7d9d9d9bdbdbd969696636363252525",
  "f7f7f7d9d9d9bdbdbd969696737373525252252525",
  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525",
  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525000000"
).map(colors);

/* harmony default export */ const Greys = (ramp(Greys_scheme));

;// ./node_modules/d3-scale-chromatic/src/sequential-single/Purples.js



var Purples_scheme = new Array(3).concat(
  "efedf5bcbddc756bb1",
  "f2f0f7cbc9e29e9ac86a51a3",
  "f2f0f7cbc9e29e9ac8756bb154278f",
  "f2f0f7dadaebbcbddc9e9ac8756bb154278f",
  "f2f0f7dadaebbcbddc9e9ac8807dba6a51a34a1486",
  "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a34a1486",
  "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a354278f3f007d"
).map(colors);

/* harmony default export */ const Purples = (ramp(Purples_scheme));

;// ./node_modules/d3-scale-chromatic/src/sequential-single/Reds.js



var Reds_scheme = new Array(3).concat(
  "fee0d2fc9272de2d26",
  "fee5d9fcae91fb6a4acb181d",
  "fee5d9fcae91fb6a4ade2d26a50f15",
  "fee5d9fcbba1fc9272fb6a4ade2d26a50f15",
  "fee5d9fcbba1fc9272fb6a4aef3b2ccb181d99000d",
  "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181d99000d",
  "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181da50f1567000d"
).map(colors);

/* harmony default export */ const Reds = (ramp(Reds_scheme));

;// ./node_modules/d3-scale-chromatic/src/sequential-single/Oranges.js



var Oranges_scheme = new Array(3).concat(
  "fee6cefdae6be6550d",
  "feeddefdbe85fd8d3cd94701",
  "feeddefdbe85fd8d3ce6550da63603",
  "feeddefdd0a2fdae6bfd8d3ce6550da63603",
  "feeddefdd0a2fdae6bfd8d3cf16913d948018c2d04",
  "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d948018c2d04",
  "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d94801a636037f2704"
).map(colors);

/* harmony default export */ const Oranges = (ramp(Oranges_scheme));

;// ./node_modules/d3-scale-chromatic/src/sequential-multi/cividis.js
/* harmony default export */ function cividis(t) {
  t = Math.max(0, Math.min(1, t));
  return "rgb("
      + Math.max(0, Math.min(255, Math.round(-4.54 - t * (35.34 - t * (2381.73 - t * (6402.7 - t * (7024.72 - t * 2710.57))))))) + ", "
      + Math.max(0, Math.min(255, Math.round(32.49 + t * (170.73 + t * (52.82 - t * (131.46 - t * (176.58 - t * 67.37))))))) + ", "
      + Math.max(0, Math.min(255, Math.round(81.24 + t * (442.36 - t * (2482.43 - t * (6167.24 - t * (6614.94 - t * 2475.67)))))))
      + ")";
}

;// ./node_modules/d3-scale-chromatic/src/sequential-multi/cubehelix.js



/* harmony default export */ const cubehelix = ((0,d3_interpolate_src/* interpolateCubehelixLong */.Xl)((0,d3_color_src/* cubehelix */.UB)(300, 0.5, 0.0), (0,d3_color_src/* cubehelix */.UB)(-240, 0.5, 1.0)));

;// ./node_modules/d3-scale-chromatic/src/sequential-multi/rainbow.js



var warm = (0,d3_interpolate_src/* interpolateCubehelixLong */.Xl)((0,d3_color_src/* cubehelix */.UB)(-100, 0.75, 0.35), (0,d3_color_src/* cubehelix */.UB)(80, 1.50, 0.8));

var cool = (0,d3_interpolate_src/* interpolateCubehelixLong */.Xl)((0,d3_color_src/* cubehelix */.UB)(260, 0.75, 0.35), (0,d3_color_src/* cubehelix */.UB)(80, 1.50, 0.8));

var c = (0,d3_color_src/* cubehelix */.UB)();

/* harmony default export */ function rainbow(t) {
  if (t < 0 || t > 1) t -= Math.floor(t);
  var ts = Math.abs(t - 0.5);
  c.h = 360 * t - 100;
  c.s = 1.5 - 1.5 * ts;
  c.l = 0.8 - 0.9 * ts;
  return c + "";
}

;// ./node_modules/d3-scale-chromatic/src/sequential-multi/sinebow.js


var sinebow_c = (0,d3_color_src/* rgb */.Qh)(),
    pi_1_3 = Math.PI / 3,
    pi_2_3 = Math.PI * 2 / 3;

/* harmony default export */ function sinebow(t) {
  var x;
  t = (0.5 - t) * Math.PI;
  sinebow_c.r = 255 * (x = Math.sin(t)) * x;
  sinebow_c.g = 255 * (x = Math.sin(t + pi_1_3)) * x;
  sinebow_c.b = 255 * (x = Math.sin(t + pi_2_3)) * x;
  return sinebow_c + "";
}

;// ./node_modules/d3-scale-chromatic/src/sequential-multi/turbo.js
/* harmony default export */ function turbo(t) {
  t = Math.max(0, Math.min(1, t));
  return "rgb("
      + Math.max(0, Math.min(255, Math.round(34.61 + t * (1172.33 - t * (10793.56 - t * (33300.12 - t * (38394.49 - t * 14825.05))))))) + ", "
      + Math.max(0, Math.min(255, Math.round(23.31 + t * (557.33 + t * (1225.33 - t * (3574.96 - t * (1073.77 + t * 707.56))))))) + ", "
      + Math.max(0, Math.min(255, Math.round(27.2 + t * (3211.1 - t * (15327.97 - t * (27814 - t * (22569.18 - t * 6838.66)))))))
      + ")";
}

;// ./node_modules/d3-scale-chromatic/src/sequential-multi/viridis.js


function viridis_ramp(range) {
  var n = range.length;
  return function(t) {
    return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
  };
}

/* harmony default export */ const viridis = (viridis_ramp(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725")));

var magma = viridis_ramp(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));

var inferno = viridis_ramp(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));

var plasma = viridis_ramp(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

;// ./node_modules/d3-scale-chromatic/src/index.js













































// EXTERNAL MODULE: ./node_modules/d3-selection/src/index.js + 52 modules
var d3_selection_src = __webpack_require__(53363);
// EXTERNAL MODULE: ./node_modules/d3-shape/src/index.js + 59 modules
var d3_shape_src = __webpack_require__(54924);
// EXTERNAL MODULE: ./node_modules/d3-time/src/index.js + 11 modules
var d3_time_src = __webpack_require__(30552);
// EXTERNAL MODULE: ./node_modules/d3-time-format/src/index.js + 4 modules
var d3_time_format_src = __webpack_require__(91674);
// EXTERNAL MODULE: ./node_modules/d3-timer/src/index.js + 3 modules
var d3_timer_src = __webpack_require__(55282);
// EXTERNAL MODULE: ./node_modules/d3-transition/src/index.js + 28 modules
var d3_transition_src = __webpack_require__(96725);
;// ./node_modules/d3-zoom/src/constant.js
/* harmony default export */ const constant = (x => () => x);

;// ./node_modules/d3-zoom/src/event.js
function ZoomEvent(type, {
  sourceEvent,
  target,
  transform,
  dispatch
}) {
  Object.defineProperties(this, {
    type: {value: type, enumerable: true, configurable: true},
    sourceEvent: {value: sourceEvent, enumerable: true, configurable: true},
    target: {value: target, enumerable: true, configurable: true},
    transform: {value: transform, enumerable: true, configurable: true},
    _: {value: dispatch}
  });
}

;// ./node_modules/d3-zoom/src/transform.js
function Transform(k, x, y) {
  this.k = k;
  this.x = x;
  this.y = y;
}

Transform.prototype = {
  constructor: Transform,
  scale: function(k) {
    return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
  },
  translate: function(x, y) {
    return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
  },
  apply: function(point) {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y];
  },
  applyX: function(x) {
    return x * this.k + this.x;
  },
  applyY: function(y) {
    return y * this.k + this.y;
  },
  invert: function(location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  invertX: function(x) {
    return (x - this.x) / this.k;
  },
  invertY: function(y) {
    return (y - this.y) / this.k;
  },
  rescaleX: function(x) {
    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
  },
  rescaleY: function(y) {
    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};

var identity = new Transform(1, 0, 0);

transform.prototype = Transform.prototype;

function transform(node) {
  while (!node.__zoom) if (!(node = node.parentNode)) return identity;
  return node.__zoom;
}

;// ./node_modules/d3-zoom/src/noevent.js
function nopropagation(event) {
  event.stopImmediatePropagation();
}

/* harmony default export */ function noevent(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

;// ./node_modules/d3-zoom/src/zoom.js










// Ignore right-click, since that should open the context menu.
// except for pinch-to-zoom, which is sent as a wheel+ctrlKey event
function defaultFilter(event) {
  return (!event.ctrlKey || event.type === 'wheel') && !event.button;
}

function defaultExtent() {
  var e = this;
  if (e instanceof SVGElement) {
    e = e.ownerSVGElement || e;
    if (e.hasAttribute("viewBox")) {
      e = e.viewBox.baseVal;
      return [[e.x, e.y], [e.x + e.width, e.y + e.height]];
    }
    return [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]];
  }
  return [[0, 0], [e.clientWidth, e.clientHeight]];
}

function defaultTransform() {
  return this.__zoom || identity;
}

function defaultWheelDelta(event) {
  return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) * (event.ctrlKey ? 10 : 1);
}

function defaultTouchable() {
  return navigator.maxTouchPoints || ("ontouchstart" in this);
}

function defaultConstrain(transform, extent, translateExtent) {
  var dx0 = transform.invertX(extent[0][0]) - translateExtent[0][0],
      dx1 = transform.invertX(extent[1][0]) - translateExtent[1][0],
      dy0 = transform.invertY(extent[0][1]) - translateExtent[0][1],
      dy1 = transform.invertY(extent[1][1]) - translateExtent[1][1];
  return transform.translate(
    dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
    dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
  );
}

/* harmony default export */ function zoom() {
  var filter = defaultFilter,
      extent = defaultExtent,
      constrain = defaultConstrain,
      wheelDelta = defaultWheelDelta,
      touchable = defaultTouchable,
      scaleExtent = [0, Infinity],
      translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]],
      duration = 250,
      interpolate = d3_interpolate_src/* interpolateZoom */.p7,
      listeners = (0,d3_dispatch_src/* dispatch */.J)("start", "zoom", "end"),
      touchstarting,
      touchfirst,
      touchending,
      touchDelay = 500,
      wheelDelay = 150,
      clickDistance2 = 0,
      tapDistance = 10;

  function zoom(selection) {
    selection
        .property("__zoom", defaultTransform)
        .on("wheel.zoom", wheeled, {passive: false})
        .on("mousedown.zoom", mousedowned)
        .on("dblclick.zoom", dblclicked)
      .filter(touchable)
        .on("touchstart.zoom", touchstarted)
        .on("touchmove.zoom", touchmoved)
        .on("touchend.zoom touchcancel.zoom", touchended)
        .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }

  zoom.transform = function(collection, transform, point, event) {
    var selection = collection.selection ? collection.selection() : collection;
    selection.property("__zoom", defaultTransform);
    if (collection !== selection) {
      schedule(collection, transform, point, event);
    } else {
      selection.interrupt().each(function() {
        gesture(this, arguments)
          .event(event)
          .start()
          .zoom(null, typeof transform === "function" ? transform.apply(this, arguments) : transform)
          .end();
      });
    }
  };

  zoom.scaleBy = function(selection, k, p, event) {
    zoom.scaleTo(selection, function() {
      var k0 = this.__zoom.k,
          k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return k0 * k1;
    }, p, event);
  };

  zoom.scaleTo = function(selection, k, p, event) {
    zoom.transform(selection, function() {
      var e = extent.apply(this, arguments),
          t0 = this.__zoom,
          p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p,
          p1 = t0.invert(p0),
          k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent);
    }, p, event);
  };

  zoom.translateBy = function(selection, x, y, event) {
    zoom.transform(selection, function() {
      return constrain(this.__zoom.translate(
        typeof x === "function" ? x.apply(this, arguments) : x,
        typeof y === "function" ? y.apply(this, arguments) : y
      ), extent.apply(this, arguments), translateExtent);
    }, null, event);
  };

  zoom.translateTo = function(selection, x, y, p, event) {
    zoom.transform(selection, function() {
      var e = extent.apply(this, arguments),
          t = this.__zoom,
          p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p;
      return constrain(identity.translate(p0[0], p0[1]).scale(t.k).translate(
        typeof x === "function" ? -x.apply(this, arguments) : -x,
        typeof y === "function" ? -y.apply(this, arguments) : -y
      ), e, translateExtent);
    }, p, event);
  };

  function scale(transform, k) {
    k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
    return k === transform.k ? transform : new Transform(k, transform.x, transform.y);
  }

  function translate(transform, p0, p1) {
    var x = p0[0] - p1[0] * transform.k, y = p0[1] - p1[1] * transform.k;
    return x === transform.x && y === transform.y ? transform : new Transform(transform.k, x, y);
  }

  function centroid(extent) {
    return [(+extent[0][0] + +extent[1][0]) / 2, (+extent[0][1] + +extent[1][1]) / 2];
  }

  function schedule(transition, transform, point, event) {
    transition
        .on("start.zoom", function() { gesture(this, arguments).event(event).start(); })
        .on("interrupt.zoom end.zoom", function() { gesture(this, arguments).event(event).end(); })
        .tween("zoom", function() {
          var that = this,
              args = arguments,
              g = gesture(that, args).event(event),
              e = extent.apply(that, args),
              p = point == null ? centroid(e) : typeof point === "function" ? point.apply(that, args) : point,
              w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]),
              a = that.__zoom,
              b = typeof transform === "function" ? transform.apply(that, args) : transform,
              i = interpolate(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
          return function(t) {
            if (t === 1) t = b; // Avoid rounding error on end.
            else { var l = i(t), k = w / l[2]; t = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k); }
            g.zoom(null, t);
          };
        });
  }

  function gesture(that, args, clean) {
    return (!clean && that.__zooming) || new Gesture(that, args);
  }

  function Gesture(that, args) {
    this.that = that;
    this.args = args;
    this.active = 0;
    this.sourceEvent = null;
    this.extent = extent.apply(that, args);
    this.taps = 0;
  }

  Gesture.prototype = {
    event: function(event) {
      if (event) this.sourceEvent = event;
      return this;
    },
    start: function() {
      if (++this.active === 1) {
        this.that.__zooming = this;
        this.emit("start");
      }
      return this;
    },
    zoom: function(key, transform) {
      if (this.mouse && key !== "mouse") this.mouse[1] = transform.invert(this.mouse[0]);
      if (this.touch0 && key !== "touch") this.touch0[1] = transform.invert(this.touch0[0]);
      if (this.touch1 && key !== "touch") this.touch1[1] = transform.invert(this.touch1[0]);
      this.that.__zoom = transform;
      this.emit("zoom");
      return this;
    },
    end: function() {
      if (--this.active === 0) {
        delete this.that.__zooming;
        this.emit("end");
      }
      return this;
    },
    emit: function(type) {
      var d = (0,d3_selection_src/* select */.Lt)(this.that).datum();
      listeners.call(
        type,
        this.that,
        new ZoomEvent(type, {
          sourceEvent: this.sourceEvent,
          target: zoom,
          type,
          transform: this.that.__zoom,
          dispatch: listeners
        }),
        d
      );
    }
  };

  function wheeled(event, ...args) {
    if (!filter.apply(this, arguments)) return;
    var g = gesture(this, args).event(event),
        t = this.__zoom,
        k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments)))),
        p = (0,d3_selection_src/* pointer */.Wn)(event);

    // If the mouse is in the same location as before, reuse it.
    // If there were recent wheel events, reset the wheel idle timeout.
    if (g.wheel) {
      if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) {
        g.mouse[1] = t.invert(g.mouse[0] = p);
      }
      clearTimeout(g.wheel);
    }

    // If this wheel event won’t trigger a transform change, ignore it.
    else if (t.k === k) return;

    // Otherwise, capture the mouse point and location at the start.
    else {
      g.mouse = [p, t.invert(p)];
      (0,d3_transition_src/* interrupt */.G)(this);
      g.start();
    }

    noevent(event);
    g.wheel = setTimeout(wheelidled, wheelDelay);
    g.zoom("mouse", constrain(translate(scale(t, k), g.mouse[0], g.mouse[1]), g.extent, translateExtent));

    function wheelidled() {
      g.wheel = null;
      g.end();
    }
  }

  function mousedowned(event, ...args) {
    if (touchending || !filter.apply(this, arguments)) return;
    var currentTarget = event.currentTarget,
        g = gesture(this, args, true).event(event),
        v = (0,d3_selection_src/* select */.Lt)(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true),
        p = (0,d3_selection_src/* pointer */.Wn)(event, currentTarget),
        x0 = event.clientX,
        y0 = event.clientY;

    (0,d3_drag_src/* dragDisable */.XD)(event.view);
    nopropagation(event);
    g.mouse = [p, this.__zoom.invert(p)];
    (0,d3_transition_src/* interrupt */.G)(this);
    g.start();

    function mousemoved(event) {
      noevent(event);
      if (!g.moved) {
        var dx = event.clientX - x0, dy = event.clientY - y0;
        g.moved = dx * dx + dy * dy > clickDistance2;
      }
      g.event(event)
       .zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = (0,d3_selection_src/* pointer */.Wn)(event, currentTarget), g.mouse[1]), g.extent, translateExtent));
    }

    function mouseupped(event) {
      v.on("mousemove.zoom mouseup.zoom", null);
      (0,d3_drag_src/* dragEnable */.EH)(event.view, g.moved);
      noevent(event);
      g.event(event).end();
    }
  }

  function dblclicked(event, ...args) {
    if (!filter.apply(this, arguments)) return;
    var t0 = this.__zoom,
        p0 = (0,d3_selection_src/* pointer */.Wn)(event.changedTouches ? event.changedTouches[0] : event, this),
        p1 = t0.invert(p0),
        k1 = t0.k * (event.shiftKey ? 0.5 : 2),
        t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, args), translateExtent);

    noevent(event);
    if (duration > 0) (0,d3_selection_src/* select */.Lt)(this).transition().duration(duration).call(schedule, t1, p0, event);
    else (0,d3_selection_src/* select */.Lt)(this).call(zoom.transform, t1, p0, event);
  }

  function touchstarted(event, ...args) {
    if (!filter.apply(this, arguments)) return;
    var touches = event.touches,
        n = touches.length,
        g = gesture(this, args, event.changedTouches.length === n).event(event),
        started, i, t, p;

    nopropagation(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = (0,d3_selection_src/* pointer */.Wn)(t, this);
      p = [p, this.__zoom.invert(p), t.identifier];
      if (!g.touch0) g.touch0 = p, started = true, g.taps = 1 + !!touchstarting;
      else if (!g.touch1 && g.touch0[2] !== p[2]) g.touch1 = p, g.taps = 0;
    }

    if (touchstarting) touchstarting = clearTimeout(touchstarting);

    if (started) {
      if (g.taps < 2) touchfirst = p[0], touchstarting = setTimeout(function() { touchstarting = null; }, touchDelay);
      (0,d3_transition_src/* interrupt */.G)(this);
      g.start();
    }
  }

  function touchmoved(event, ...args) {
    if (!this.__zooming) return;
    var g = gesture(this, args).event(event),
        touches = event.changedTouches,
        n = touches.length, i, t, p, l;

    noevent(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = (0,d3_selection_src/* pointer */.Wn)(t, this);
      if (g.touch0 && g.touch0[2] === t.identifier) g.touch0[0] = p;
      else if (g.touch1 && g.touch1[2] === t.identifier) g.touch1[0] = p;
    }
    t = g.that.__zoom;
    if (g.touch1) {
      var p0 = g.touch0[0], l0 = g.touch0[1],
          p1 = g.touch1[0], l1 = g.touch1[1],
          dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp,
          dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
      t = scale(t, Math.sqrt(dp / dl));
      p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
      l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
    }
    else if (g.touch0) p = g.touch0[0], l = g.touch0[1];
    else return;

    g.zoom("touch", constrain(translate(t, p, l), g.extent, translateExtent));
  }

  function touchended(event, ...args) {
    if (!this.__zooming) return;
    var g = gesture(this, args).event(event),
        touches = event.changedTouches,
        n = touches.length, i, t;

    nopropagation(event);
    if (touchending) clearTimeout(touchending);
    touchending = setTimeout(function() { touchending = null; }, touchDelay);
    for (i = 0; i < n; ++i) {
      t = touches[i];
      if (g.touch0 && g.touch0[2] === t.identifier) delete g.touch0;
      else if (g.touch1 && g.touch1[2] === t.identifier) delete g.touch1;
    }
    if (g.touch1 && !g.touch0) g.touch0 = g.touch1, delete g.touch1;
    if (g.touch0) g.touch0[1] = this.__zoom.invert(g.touch0[0]);
    else {
      g.end();
      // If this was a dbltap, reroute to the (optional) dblclick.zoom handler.
      if (g.taps === 2) {
        t = (0,d3_selection_src/* pointer */.Wn)(t, this);
        if (Math.hypot(touchfirst[0] - t[0], touchfirst[1] - t[1]) < tapDistance) {
          var p = (0,d3_selection_src/* select */.Lt)(this).on("dblclick.zoom");
          if (p) p.apply(this, arguments);
        }
      }
    }
  }

  zoom.wheelDelta = function(_) {
    return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant(+_), zoom) : wheelDelta;
  };

  zoom.filter = function(_) {
    return arguments.length ? (filter = typeof _ === "function" ? _ : constant(!!_), zoom) : filter;
  };

  zoom.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant(!!_), zoom) : touchable;
  };

  zoom.extent = function(_) {
    return arguments.length ? (extent = typeof _ === "function" ? _ : constant([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom) : extent;
  };

  zoom.scaleExtent = function(_) {
    return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom) : [scaleExtent[0], scaleExtent[1]];
  };

  zoom.translateExtent = function(_) {
    return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
  };

  zoom.constrain = function(_) {
    return arguments.length ? (constrain = _, zoom) : constrain;
  };

  zoom.duration = function(_) {
    return arguments.length ? (duration = +_, zoom) : duration;
  };

  zoom.interpolate = function(_) {
    return arguments.length ? (interpolate = _, zoom) : interpolate;
  };

  zoom.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? zoom : value;
  };

  zoom.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom) : Math.sqrt(clickDistance2);
  };

  zoom.tapDistance = function(_) {
    return arguments.length ? (tapDistance = +_, zoom) : tapDistance;
  };

  return zoom;
}

;// ./node_modules/d3-zoom/src/index.js



;// ./node_modules/d3/src/index.js
































/***/ }),

/***/ 96725:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  G: () => (/* reexport */ interrupt)
});

// UNUSED EXPORTS: active, transition

// EXTERNAL MODULE: ./node_modules/d3-selection/src/index.js + 52 modules
var src = __webpack_require__(53363);
// EXTERNAL MODULE: ./node_modules/d3-dispatch/src/index.js + 1 modules
var d3_dispatch_src = __webpack_require__(90417);
// EXTERNAL MODULE: ./node_modules/d3-timer/src/index.js + 3 modules
var d3_timer_src = __webpack_require__(55282);
;// ./node_modules/d3-transition/src/transition/schedule.js



var emptyOn = (0,d3_dispatch_src/* dispatch */.J)("start", "end", "cancel", "interrupt");
var emptyTween = [];

var CREATED = 0;
var schedule_SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;

/* harmony default export */ function schedule(node, name, id, index, group, timing) {
  var schedules = node.__transition;
  if (!schedules) node.__transition = {};
  else if (id in schedules) return;
  create(node, id, {
    name: name,
    index: index, // For context during callback.
    group: group, // For context during callback.
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
}

function init(node, id) {
  var schedule = get(node, id);
  if (schedule.state > CREATED) throw new Error("too late; already scheduled");
  return schedule;
}

function set(node, id) {
  var schedule = get(node, id);
  if (schedule.state > STARTED) throw new Error("too late; already running");
  return schedule;
}

function get(node, id) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
  return schedule;
}

function create(node, id, self) {
  var schedules = node.__transition,
      tween;

  // Initialize the self timer when the transition is created.
  // Note the actual delay is not known until the first callback!
  schedules[id] = self;
  self.timer = (0,d3_timer_src/* timer */.O1)(schedule, 0, self.time);

  function schedule(elapsed) {
    self.state = schedule_SCHEDULED;
    self.timer.restart(start, self.delay, self.time);

    // If the elapsed delay is less than our first sleep, start immediately.
    if (self.delay <= elapsed) start(elapsed - self.delay);
  }

  function start(elapsed) {
    var i, j, n, o;

    // If the state is not SCHEDULED, then we previously errored on start.
    if (self.state !== schedule_SCHEDULED) return stop();

    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self.name) continue;

      // While this element already has a starting transition during this frame,
      // defer starting an interrupting transition until that transition has a
      // chance to tick (and possibly end); see d3/d3-transition#54!
      if (o.state === STARTED) return (0,d3_timer_src/* timeout */.wR)(start);

      // Interrupt the active transition, if any.
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }

      // Cancel any pre-empted transitions.
      else if (+i < id) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("cancel", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }
    }

    // Defer the first tick to end of the current frame; see d3/d3#1576.
    // Note the transition may be canceled after start and before the first tick!
    // Note this must be scheduled before the start event; see d3/d3-transition#16!
    // Assuming this is successful, subsequent callbacks go straight to tick.
    (0,d3_timer_src/* timeout */.wR)(function() {
      if (self.state === STARTED) {
        self.state = RUNNING;
        self.timer.restart(tick, self.delay, self.time);
        tick(elapsed);
      }
    });

    // Dispatch the start event.
    // Note this must be done before the tween are initialized.
    self.state = STARTING;
    self.on.call("start", node, node.__data__, self.index, self.group);
    if (self.state !== STARTING) return; // interrupted
    self.state = STARTED;

    // Initialize the tween, deleting null tween.
    tween = new Array(n = self.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }

  function tick(elapsed) {
    var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
        i = -1,
        n = tween.length;

    while (++i < n) {
      tween[i].call(node, t);
    }

    // Dispatch the end event.
    if (self.state === ENDING) {
      self.on.call("end", node, node.__data__, self.index, self.group);
      stop();
    }
  }

  function stop() {
    self.state = ENDED;
    self.timer.stop();
    delete schedules[id];
    for (var i in schedules) return; // eslint-disable-line no-unused-vars
    delete node.__transition;
  }
}

;// ./node_modules/d3-transition/src/interrupt.js


/* harmony default export */ function interrupt(node, name) {
  var schedules = node.__transition,
      schedule,
      active,
      empty = true,
      i;

  if (!schedules) return;

  name = name == null ? null : name + "";

  for (i in schedules) {
    if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
    active = schedule.state > STARTING && schedule.state < ENDING;
    schedule.state = ENDED;
    schedule.timer.stop();
    schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
    delete schedules[i];
  }

  if (empty) delete node.__transition;
}

;// ./node_modules/d3-transition/src/selection/interrupt.js


/* harmony default export */ function selection_interrupt(name) {
  return this.each(function() {
    interrupt(this, name);
  });
}

// EXTERNAL MODULE: ./node_modules/d3-interpolate/src/index.js + 25 modules
var d3_interpolate_src = __webpack_require__(20776);
;// ./node_modules/d3-transition/src/transition/tween.js


function tweenRemove(id, name) {
  var tween0, tween1;
  return function() {
    var schedule = set(this, id),
        tween = schedule.tween;

    // If this node shared tween with the previous node,
    // just assign the updated shared tween and we’re done!
    // Otherwise, copy-on-write.
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }

    schedule.tween = tween1;
  };
}

function tweenFunction(id, name, value) {
  var tween0, tween1;
  if (typeof value !== "function") throw new Error;
  return function() {
    var schedule = set(this, id),
        tween = schedule.tween;

    // If this node shared tween with the previous node,
    // just assign the updated shared tween and we’re done!
    // Otherwise, copy-on-write.
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t;
          break;
        }
      }
      if (i === n) tween1.push(t);
    }

    schedule.tween = tween1;
  };
}

/* harmony default export */ function tween(name, value) {
  var id = this._id;

  name += "";

  if (arguments.length < 2) {
    var tween = get(this.node(), id).tween;
    for (var i = 0, n = tween.length, t; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value;
      }
    }
    return null;
  }

  return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
}

function tweenValue(transition, name, value) {
  var id = transition._id;

  transition.each(function() {
    var schedule = set(this, id);
    (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
  });

  return function(node) {
    return get(node, id).value[name];
  };
}

// EXTERNAL MODULE: ./node_modules/d3-color/src/index.js + 5 modules
var d3_color_src = __webpack_require__(75423);
;// ./node_modules/d3-transition/src/transition/interpolate.js



/* harmony default export */ function interpolate(a, b) {
  var c;
  return (typeof b === "number" ? d3_interpolate_src/* interpolateNumber */.Dj
      : b instanceof d3_color_src/* color */.yW ? d3_interpolate_src/* interpolateRgb */.Zr
      : (c = (0,d3_color_src/* color */.yW)(b)) ? (b = c, d3_interpolate_src/* interpolateRgb */.Zr)
      : d3_interpolate_src/* interpolateString */.zl)(a, b);
}

;// ./node_modules/d3-transition/src/transition/attr.js





function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}

function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}

function attrConstant(name, interpolate, value1) {
  var string00,
      string1 = value1 + "",
      interpolate0;
  return function() {
    var string0 = this.getAttribute(name);
    return string0 === string1 ? null
        : string0 === string00 ? interpolate0
        : interpolate0 = interpolate(string00 = string0, value1);
  };
}

function attrConstantNS(fullname, interpolate, value1) {
  var string00,
      string1 = value1 + "",
      interpolate0;
  return function() {
    var string0 = this.getAttributeNS(fullname.space, fullname.local);
    return string0 === string1 ? null
        : string0 === string00 ? interpolate0
        : interpolate0 = interpolate(string00 = string0, value1);
  };
}

function attrFunction(name, interpolate, value) {
  var string00,
      string10,
      interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttribute(name);
    string0 = this.getAttribute(name);
    string1 = value1 + "";
    return string0 === string1 ? null
        : string0 === string00 && string1 === string10 ? interpolate0
        : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}

function attrFunctionNS(fullname, interpolate, value) {
  var string00,
      string10,
      interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
    string0 = this.getAttributeNS(fullname.space, fullname.local);
    string1 = value1 + "";
    return string0 === string1 ? null
        : string0 === string00 && string1 === string10 ? interpolate0
        : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}

/* harmony default export */ function attr(name, value) {
  var fullname = (0,src/* namespace */.MF)(name), i = fullname === "transform" ? d3_interpolate_src/* interpolateTransformSvg */.pN : interpolate;
  return this.attrTween(name, typeof value === "function"
      ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value))
      : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname)
      : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
}

;// ./node_modules/d3-transition/src/transition/attrTween.js


function attrInterpolate(name, i) {
  return function(t) {
    this.setAttribute(name, i.call(this, t));
  };
}

function attrInterpolateNS(fullname, i) {
  return function(t) {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
  };
}

function attrTweenNS(fullname, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
    return t0;
  }
  tween._value = value;
  return tween;
}

function attrTween(name, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
    return t0;
  }
  tween._value = value;
  return tween;
}

/* harmony default export */ function transition_attrTween(name, value) {
  var key = "attr." + name;
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error;
  var fullname = (0,src/* namespace */.MF)(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
}

;// ./node_modules/d3-transition/src/transition/delay.js


function delayFunction(id, value) {
  return function() {
    init(this, id).delay = +value.apply(this, arguments);
  };
}

function delayConstant(id, value) {
  return value = +value, function() {
    init(this, id).delay = value;
  };
}

/* harmony default export */ function delay(value) {
  var id = this._id;

  return arguments.length
      ? this.each((typeof value === "function"
          ? delayFunction
          : delayConstant)(id, value))
      : get(this.node(), id).delay;
}

;// ./node_modules/d3-transition/src/transition/duration.js


function durationFunction(id, value) {
  return function() {
    set(this, id).duration = +value.apply(this, arguments);
  };
}

function durationConstant(id, value) {
  return value = +value, function() {
    set(this, id).duration = value;
  };
}

/* harmony default export */ function duration(value) {
  var id = this._id;

  return arguments.length
      ? this.each((typeof value === "function"
          ? durationFunction
          : durationConstant)(id, value))
      : get(this.node(), id).duration;
}

;// ./node_modules/d3-transition/src/transition/ease.js


function easeConstant(id, value) {
  if (typeof value !== "function") throw new Error;
  return function() {
    set(this, id).ease = value;
  };
}

/* harmony default export */ function ease(value) {
  var id = this._id;

  return arguments.length
      ? this.each(easeConstant(id, value))
      : get(this.node(), id).ease;
}

;// ./node_modules/d3-transition/src/transition/easeVarying.js


function easeVarying(id, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (typeof v !== "function") throw new Error;
    set(this, id).ease = v;
  };
}

/* harmony default export */ function transition_easeVarying(value) {
  if (typeof value !== "function") throw new Error;
  return this.each(easeVarying(this._id, value));
}

;// ./node_modules/d3-transition/src/transition/filter.js



/* harmony default export */ function filter(match) {
  if (typeof match !== "function") match = (0,src/* matcher */.jN)(match);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }

  return new transition_Transition(subgroups, this._parents, this._name, this._id);
}

;// ./node_modules/d3-transition/src/transition/merge.js


/* harmony default export */ function merge(transition) {
  if (transition._id !== this._id) throw new Error;

  for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }

  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }

  return new transition_Transition(merges, this._parents, this._name, this._id);
}

;// ./node_modules/d3-transition/src/transition/on.js


function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function(t) {
    var i = t.indexOf(".");
    if (i >= 0) t = t.slice(0, i);
    return !t || t === "start";
  });
}

function onFunction(id, name, listener) {
  var on0, on1, sit = start(name) ? init : set;
  return function() {
    var schedule = sit(this, id),
        on = schedule.on;

    // If this node shared a dispatch with the previous node,
    // just assign the updated shared dispatch and we’re done!
    // Otherwise, copy-on-write.
    if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

    schedule.on = on1;
  };
}

/* harmony default export */ function on(name, listener) {
  var id = this._id;

  return arguments.length < 2
      ? get(this.node(), id).on.on(name)
      : this.each(onFunction(id, name, listener));
}

;// ./node_modules/d3-transition/src/transition/remove.js
function removeFunction(id) {
  return function() {
    var parent = this.parentNode;
    for (var i in this.__transition) if (+i !== id) return;
    if (parent) parent.removeChild(this);
  };
}

/* harmony default export */ function remove() {
  return this.on("end.remove", removeFunction(this._id));
}

;// ./node_modules/d3-transition/src/transition/select.js




/* harmony default export */ function transition_select(select) {
  var name = this._name,
      id = this._id;

  if (typeof select !== "function") select = (0,src/* selector */.gD)(select);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        schedule(subgroup[i], name, id, i, subgroup, get(node, id));
      }
    }
  }

  return new transition_Transition(subgroups, this._parents, name, id);
}

;// ./node_modules/d3-transition/src/transition/selectAll.js




/* harmony default export */ function selectAll(select) {
  var name = this._name,
      id = this._id;

  if (typeof select !== "function") select = (0,src/* selectorAll */.XM)(select);

  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        for (var children = select.call(node, node.__data__, i, group), child, inherit = get(node, id), k = 0, l = children.length; k < l; ++k) {
          if (child = children[k]) {
            schedule(child, name, id, k, children, inherit);
          }
        }
        subgroups.push(children);
        parents.push(node);
      }
    }
  }

  return new transition_Transition(subgroups, parents, name, id);
}

;// ./node_modules/d3-transition/src/transition/selection.js


var Selection = src/* selection */.r1.prototype.constructor;

/* harmony default export */ function selection() {
  return new Selection(this._groups, this._parents);
}

;// ./node_modules/d3-transition/src/transition/style.js






function styleNull(name, interpolate) {
  var string00,
      string10,
      interpolate0;
  return function() {
    var string0 = (0,src/* style */.iF)(this, name),
        string1 = (this.style.removeProperty(name), (0,src/* style */.iF)(this, name));
    return string0 === string1 ? null
        : string0 === string00 && string1 === string10 ? interpolate0
        : interpolate0 = interpolate(string00 = string0, string10 = string1);
  };
}

function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}

function styleConstant(name, interpolate, value1) {
  var string00,
      string1 = value1 + "",
      interpolate0;
  return function() {
    var string0 = (0,src/* style */.iF)(this, name);
    return string0 === string1 ? null
        : string0 === string00 ? interpolate0
        : interpolate0 = interpolate(string00 = string0, value1);
  };
}

function styleFunction(name, interpolate, value) {
  var string00,
      string10,
      interpolate0;
  return function() {
    var string0 = (0,src/* style */.iF)(this, name),
        value1 = value(this),
        string1 = value1 + "";
    if (value1 == null) string1 = value1 = (this.style.removeProperty(name), (0,src/* style */.iF)(this, name));
    return string0 === string1 ? null
        : string0 === string00 && string1 === string10 ? interpolate0
        : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}

function styleMaybeRemove(id, name) {
  var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
  return function() {
    var schedule = set(this, id),
        on = schedule.on,
        listener = schedule.value[key] == null ? remove || (remove = styleRemove(name)) : undefined;

    // If this node shared a dispatch with the previous node,
    // just assign the updated shared dispatch and we’re done!
    // Otherwise, copy-on-write.
    if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);

    schedule.on = on1;
  };
}

/* harmony default export */ function style(name, value, priority) {
  var i = (name += "") === "transform" ? d3_interpolate_src/* interpolateTransformCss */.TE : interpolate;
  return value == null ? this
      .styleTween(name, styleNull(name, i))
      .on("end.style." + name, styleRemove(name))
    : typeof value === "function" ? this
      .styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value)))
      .each(styleMaybeRemove(this._id, name))
    : this
      .styleTween(name, styleConstant(name, i, value), priority)
      .on("end.style." + name, null);
}

;// ./node_modules/d3-transition/src/transition/styleTween.js
function styleInterpolate(name, i, priority) {
  return function(t) {
    this.style.setProperty(name, i.call(this, t), priority);
  };
}

function styleTween(name, value, priority) {
  var t, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
    return t;
  }
  tween._value = value;
  return tween;
}

/* harmony default export */ function transition_styleTween(name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error;
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
}

;// ./node_modules/d3-transition/src/transition/text.js


function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}

function textFunction(value) {
  return function() {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}

/* harmony default export */ function transition_text(value) {
  return this.tween("text", typeof value === "function"
      ? textFunction(tweenValue(this, "text", value))
      : textConstant(value == null ? "" : value + ""));
}

;// ./node_modules/d3-transition/src/transition/textTween.js
function textInterpolate(i) {
  return function(t) {
    this.textContent = i.call(this, t);
  };
}

function textTween(value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
    return t0;
  }
  tween._value = value;
  return tween;
}

/* harmony default export */ function transition_textTween(value) {
  var key = "text";
  if (arguments.length < 1) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error;
  return this.tween(key, textTween(value));
}

;// ./node_modules/d3-transition/src/transition/transition.js



/* harmony default export */ function transition() {
  var name = this._name,
      id0 = this._id,
      id1 = newId();

  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        var inherit = get(node, id0);
        schedule(node, name, id1, i, group, {
          time: inherit.time + inherit.delay + inherit.duration,
          delay: 0,
          duration: inherit.duration,
          ease: inherit.ease
        });
      }
    }
  }

  return new transition_Transition(groups, this._parents, name, id1);
}

;// ./node_modules/d3-transition/src/transition/end.js


/* harmony default export */ function end() {
  var on0, on1, that = this, id = that._id, size = that.size();
  return new Promise(function(resolve, reject) {
    var cancel = {value: reject},
        end = {value: function() { if (--size === 0) resolve(); }};

    that.each(function() {
      var schedule = set(this, id),
          on = schedule.on;

      // If this node shared a dispatch with the previous node,
      // just assign the updated shared dispatch and we’re done!
      // Otherwise, copy-on-write.
      if (on !== on0) {
        on1 = (on0 = on).copy();
        on1._.cancel.push(cancel);
        on1._.interrupt.push(cancel);
        on1._.end.push(end);
      }

      schedule.on = on1;
    });

    // The selection was empty, resolve end immediately
    if (size === 0) resolve();
  });
}

;// ./node_modules/d3-transition/src/transition/index.js






















var id = 0;

function transition_Transition(groups, parents, name, id) {
  this._groups = groups;
  this._parents = parents;
  this._name = name;
  this._id = id;
}

function transition_transition(name) {
  return (0,src/* selection */.r1)().transition(name);
}

function newId() {
  return ++id;
}

var selection_prototype = src/* selection */.r1.prototype;

transition_Transition.prototype = transition_transition.prototype = {
  constructor: transition_Transition,
  select: transition_select,
  selectAll: selectAll,
  selectChild: selection_prototype.selectChild,
  selectChildren: selection_prototype.selectChildren,
  filter: filter,
  merge: merge,
  selection: selection,
  transition: transition,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: on,
  attr: attr,
  attrTween: transition_attrTween,
  style: style,
  styleTween: transition_styleTween,
  text: transition_text,
  textTween: transition_textTween,
  remove: remove,
  tween: tween,
  delay: delay,
  duration: duration,
  ease: ease,
  easeVarying: transition_easeVarying,
  end: end,
  [Symbol.iterator]: selection_prototype[Symbol.iterator]
};

// EXTERNAL MODULE: ./node_modules/d3-ease/src/index.js + 11 modules
var d3_ease_src = __webpack_require__(92754);
;// ./node_modules/d3-transition/src/selection/transition.js





var defaultTiming = {
  time: null, // Set on use.
  delay: 0,
  duration: 250,
  ease: d3_ease_src/* easeCubicInOut */.oR
};

function inherit(node, id) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id])) {
    if (!(node = node.parentNode)) {
      throw new Error(`transition ${id} not found`);
    }
  }
  return timing;
}

/* harmony default export */ function selection_transition(name) {
  var id,
      timing;

  if (name instanceof transition_Transition) {
    id = name._id, name = name._name;
  } else {
    id = newId(), (timing = defaultTiming).time = (0,d3_timer_src/* now */.tB)(), name = name == null ? null : name + "";
  }

  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        schedule(node, name, id, i, group, timing || inherit(node, id));
      }
    }
  }

  return new transition_Transition(groups, this._parents, name, id);
}

;// ./node_modules/d3-transition/src/selection/index.js




src/* selection */.r1.prototype.interrupt = selection_interrupt;
src/* selection */.r1.prototype.transition = selection_transition;

;// ./node_modules/d3-transition/src/active.js



var root = (/* unused pure expression or super */ null && ([null]));

/* harmony default export */ function active(node, name) {
  var schedules = node.__transition,
      schedule,
      i;

  if (schedules) {
    name = name == null ? null : name + "";
    for (i in schedules) {
      if ((schedule = schedules[i]).state > SCHEDULED && schedule.name === name) {
        return new Transition([[node]], root, name, +i);
      }
    }
  }

  return null;
}

;// ./node_modules/d3-transition/src/index.js






/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVuZG9yLWNvbW1vbi1hZTUwMmJlZC5hNzJkZTgxM2UzMmRiNDRjZWZlZC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBTztBQUNQO0FBQ0E7QUFDQSxnQ0FBZ0M7QUFDaEMsK0NBQStDO0FBQy9DO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6Qm1DO0FBQ0M7O0FBRTdCOztBQUVRO0FBQ2Ysa0JBQWtCLHFCQUFTO0FBQzNCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw2QkFBNkIscUJBQVM7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEVBQUUsU0FBUzs7QUFFWDtBQUNBOzs7QUM3QzJDO0FBQ1A7QUFDRDs7QUFFcEI7QUFDZixjQUFjLE9BQU87QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIscUJBQVEsc0JBQXNCLDBCQUEwQjtBQUN6RTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFT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QUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQztBQUNoQztBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsZ0NBQWdDO0FBQ2hDO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxnQ0FBZ0M7QUFDaEM7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLGdDQUFnQztBQUNoQztBQUNBO0FBQ0E7QUFDQTs7QUFFQSxZQUFZLDRCQUE0QjtBQUN4QztBQUNBO0FBQ0Esa0NBQWtDOztBQUVsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNB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QUMsRUFBQzs7O0FDYk07QUFDSjs7QUFFdkIsSUFBSSxXQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxNQUFNOztBQUVaLDJDQUFlLElBQUksQ0FBQyxXQUFNLENBQUMsRUFBQzs7O0FDYk07QUFDSjs7QUFFdkIsSUFBSSxhQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxNQUFNOztBQUVaLDZDQUFlLElBQUksQ0FBQyxhQUFNLENBQUMsRUFBQzs7O0FDYk07QUFDSjs7QUFFdkIsSUFBSSxXQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxNQUFNOztBQUVaLDJDQUFlLElBQUksQ0FBQyxXQUFNLENBQUMsRUFBQzs7O0FDYk07QUFDSjs7QUFFdkIsSUFBSSxXQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxNQUFNOztBQUVaLDJDQUFlLElBQUksQ0FBQyxXQUFNLENBQUMsRUFBQzs7O0FDYk07QUFDSjs7QUFFdkIsSUFBSSxXQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxNQUFNOztBQUVaLDJDQUFlLElBQUksQ0FBQyxXQUFNLENBQUMsRUFBQzs7O0FDYk07QUFDSjs7QUFFdkIsSUFBSSxhQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxNQUFNOztBQUVaLDZDQUFlLElBQUksQ0FBQyxhQUFNLENBQUMsRUFBQzs7O0FDYk07QUFDSjs7QUFFdkIsSUFBSSxXQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxNQUFNOztBQUVaLDJDQUFlLElBQUksQ0FBQyxXQUFNLENBQUMsRUFBQzs7O0FDYk07QUFDSjs7QUFFdkIsSUFBSSxhQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxNQUFNOztBQUVaLDZDQUFlLElBQUksQ0FBQyxhQUFNLENBQUMsRUFBQzs7O0FDYk07QUFDSjs7QUFFdkIsSUFBSSxhQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxNQUFNOztBQUVaLDZDQUFlLElBQUksQ0FBQyxhQUFNLENBQUMsRUFBQzs7O0FDYk07QUFDSjs7QUFFdkIsSUFBSSxZQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxNQUFNOztBQUVaLDRDQUFlLElBQUksQ0FBQyxZQUFNLENBQUMsRUFBQzs7O0FDYk07QUFDSjs7QUFFdkIsSUFBSSxhQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxNQUFNOztBQUVaLDZDQUFlLElBQUksQ0FBQyxhQUFNLENBQUMsRUFBQzs7O0FDYk07QUFDSjs7QUFFdkIsSUFBSSxZQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxNQUFNOztBQUVaLDRDQUFlLElBQUksQ0FBQyxZQUFNLENBQUMsRUFBQzs7O0FDYk07QUFDSjs7QUFFdkIsSUFBSSxjQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxNQUFNOztBQUVaLDhDQUFlLElBQUksQ0FBQyxjQUFNLENBQUMsRUFBQzs7O0FDYk07QUFDSjs7QUFFdkIsSUFBSSxXQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxNQUFNOztBQUVaLDJDQUFlLElBQUksQ0FBQyxXQUFNLENBQUMsRUFBQzs7O0FDYk07QUFDSjs7QUFFdkIsSUFBSSxjQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxNQUFNOztBQUVaLDhDQUFlLElBQUksQ0FBQyxjQUFNLENBQUMsRUFBQzs7O0FDYjVCLDZCQUFlLGlCQUFTO0FBQ3hCO0FBQ0E7QUFDQTtB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YyxxQkFBcUI7QUFDbkMsUUFBUSxlQUFlO0FBQ3ZCLGFBQWEsb0JBQW9CO0FBQ2pDLFVBQVUsTUFBaUI7QUFDM0IsU0FBUyxLQUFnQjtBQUN6QixTQUFTLEtBQWdCO0FBQ3pCLFlBQVksUUFBbUI7QUFDL0IsUUFBUSxJQUFlO0FBQ3ZCLGVBQWUsc0JBQXNCO0FBQ3JDLE9BQU8sR0FBYztBQUNyQjtBQUNBOzs7OztBQ3hFeUQ7QUFDUjtBQUNWO0FBQ1Y7O0FBRTdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxrQ0FBYztBQUN0Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxJQUFJO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDZCQUFlLDhCQUFTO0FBQ3hCO0FBQ0E7O0FBRUEsc0JBQXNCLHFCQUFVO0FBQ2hDO0FBQ0EsSUFBSTtBQUNKLFNBQVMsS0FBSyxvQ0FBb0MsNEJBQUc7QUFDckQ7O0FBRUEsNERBQTRELE9BQU87QUFDbkUsK0RBQStELE9BQU87QUFDdEU7QUFDQSxRQUFRLFFBQVE7QUFDaEI7QUFDQTtBQUNBOztBQUVBLGFBQWEscUJBQVU7QUFDdkI7OztBQ3pDdUM7QUFDVTtBQUNFOztBQUVuRCxxQkFBUyx1QkFBdUIsbUJBQW1CO0FBQ25ELHFCQUFTLHdCQUF3QixvQkFBb0I7OztBQ0xKO0FBQ0U7O0FBRW5ELFdBQVcsc0RBQU07O0FBRWpCLDZCQUFlLGdCQUFTO0FBQ3hCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7OztBQ3BCOEI7QUFDOEI7QUFDZDtBQUNNIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL2luaXQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL29yZGluYWwuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL2JhbmQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL2NvbnN0YW50LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9udW1iZXIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL2NvbnRpbnVvdXMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL3RpY2tGb3JtYXQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL2xpbmVhci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvaWRlbnRpdHkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL25pY2UuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL2xvZy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvc3ltbG9nLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9wb3cuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL3JhZGlhbC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvcXVhbnRpbGUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL3F1YW50aXplLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy90aHJlc2hvbGQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL3RpbWUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL3V0Y1RpbWUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL3NlcXVlbnRpYWwuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL3NlcXVlbnRpYWxRdWFudGlsZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvZGl2ZXJnaW5nLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9pbnRlcnZhbC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9taWxsaXNlY29uZC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9kdXJhdGlvbi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9zZWNvbmQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvbWludXRlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL2hvdXIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvZGF5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL3dlZWsuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvbW9udGguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMveWVhci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy90aWNrcy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL25hbWVzcGFjZXMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9uYW1lc3BhY2UuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9jcmVhdG9yLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc2VsZWN0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvYXJyYXkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3RvckFsbC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zZWxlY3RBbGwuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9tYXRjaGVyLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdENoaWxkLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdENoaWxkcmVuLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2ZpbHRlci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zcGFyc2UuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZW50ZXIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9jb25zdGFudC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kYXRhLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2V4aXQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vam9pbi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9tZXJnZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9vcmRlci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zb3J0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2NhbGwuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vbm9kZXMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vbm9kZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zaXplLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2VtcHR5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2VhY2guanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vYXR0ci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3dpbmRvdy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zdHlsZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9wcm9wZXJ0eS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9jbGFzc2VkLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3RleHQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaHRtbC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9yYWlzZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9sb3dlci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9hcHBlbmQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaW5zZXJ0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3JlbW92ZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9jbG9uZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kYXR1bS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9vbi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kaXNwYXRjaC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9pdGVyYXRvci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL2NyZWF0ZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL2xvY2FsLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc291cmNlRXZlbnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9wb2ludGVyLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvcG9pbnRlcnMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3RBbGwuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvY29uc3RhbnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL21hdGguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL3BhdGguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2FyYy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvYXJyYXkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2N1cnZlL2xpbmVhci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvcG9pbnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2xpbmUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2FyZWEuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2Rlc2NlbmRpbmcuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2lkZW50aXR5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9waWUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2N1cnZlL3JhZGlhbC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvbGluZVJhZGlhbC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvYXJlYVJhZGlhbC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvcG9pbnRSYWRpYWwuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2N1cnZlL2J1bXAuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2xpbmsuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL3N5bWJvbC9hc3Rlcmlzay5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvc3ltYm9sL2NpcmNsZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvc3ltYm9sL2Nyb3NzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9zeW1ib2wvZGlhbW9uZC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvc3ltYm9sL2RpYW1vbmQyLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9zeW1ib2wvcGx1cy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvc3ltYm9sL3NxdWFyZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvc3ltYm9sL3NxdWFyZTIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL3N5bWJvbC9zdGFyLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9zeW1ib2wvdHJpYW5nbGUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL3N5bWJvbC90cmlhbmdsZTIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL3N5bWJvbC93eWUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL3N5bWJvbC90aW1lcy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvc3ltYm9sLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9ub29wLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9jdXJ2ZS9iYXNpcy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvY3VydmUvYmFzaXNDbG9zZWQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2N1cnZlL2Jhc2lzT3Blbi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvY3VydmUvYnVuZGxlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9jdXJ2ZS9jYXJkaW5hbC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvY3VydmUvY2FyZGluYWxDbG9zZWQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2N1cnZlL2NhcmRpbmFsT3Blbi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvY3VydmUvY2F0bXVsbFJvbS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvY3VydmUvY2F0bXVsbFJvbUNsb3NlZC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvY3VydmUvY2F0bXVsbFJvbU9wZW4uanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2N1cnZlL2xpbmVhckNsb3NlZC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvY3VydmUvbW9ub3RvbmUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2N1cnZlL25hdHVyYWwuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2N1cnZlL3N0ZXAuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL29mZnNldC9ub25lLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9vcmRlci9ub25lLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9zdGFjay5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvb2Zmc2V0L2V4cGFuZC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvb2Zmc2V0L2RpdmVyZ2luZy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvb2Zmc2V0L3NpbGhvdWV0dGUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL29mZnNldC93aWdnbGUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL29yZGVyL2FwcGVhcmFuY2UuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL29yZGVyL2FzY2VuZGluZy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvb3JkZXIvZGVzY2VuZGluZy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvb3JkZXIvaW5zaWRlT3V0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9vcmRlci9yZXZlcnNlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy10aW1lci9zcmMvdGltZXIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtdGltZXIvc3JjL3RpbWVvdXQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtdGltZXIvc3JjL2ludGVydmFsLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXRpbWVyL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy10aW1lLWZvcm1hdC9zcmMvbG9jYWxlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXRpbWUtZm9ybWF0L3NyYy9kZWZhdWx0TG9jYWxlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXRpbWUtZm9ybWF0L3NyYy9pc29Gb3JtYXQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtdGltZS1mb3JtYXQvc3JjL2lzb1BhcnNlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXRpbWUtZm9ybWF0L3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS1jaHJvbWF0aWMvc3JjL2NvbG9ycy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS1jaHJvbWF0aWMvc3JjL2NhdGVnb3JpY2FsL2NhdGVnb3J5MTAuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUtY2hyb21hdGljL3NyYy9jYXRlZ29yaWNhbC9BY2NlbnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUtY2hyb21hdGljL3NyYy9jYXRlZ29yaWNhbC9EYXJrMi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS1jaHJvbWF0aWMvc3JjL2NhdGVnb3JpY2FsL29ic2VydmFibGUxMC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS1jaHJvbWF0aWMvc3JjL2NhdGVnb3JpY2FsL1BhaXJlZC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS1jaHJvbWF0aWMvc3JjL2NhdGVnb3JpY2FsL1Bhc3RlbDEuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUtY2hyb21hdGljL3NyYy9jYXRlZ29yaWNhbC9QYXN0ZWwyLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlLWNocm9tYXRpYy9zcmMvY2F0ZWdvcmljYWwvU2V0MS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS1jaHJvbWF0aWMvc3JjL2NhdGVnb3JpY2FsL1NldDIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUtY2hyb21hdGljL3NyYy9jYXRlZ29yaWNhbC9TZXQzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlLWNocm9tYXRpYy9zcmMvY2F0ZWdvcmljYWwvVGFibGVhdTEwLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlLWNocm9tYXRpYy9zcmMvcmFtcC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS1jaHJvbWF0aWMvc3JjL2RpdmVyZ2luZy9CckJHLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlLWNocm9tYXRpYy9zcmMvZGl2ZXJnaW5nL1BSR24uanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUtY2hyb21hdGljL3NyYy9kaXZlcmdpbmcvUGlZRy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS1jaHJvbWF0aWMvc3JjL2RpdmVyZ2luZy9QdU9yLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlLWNocm9tYXRpYy9zcmMvZGl2ZXJnaW5nL1JkQnUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUtY2hyb21hdGljL3NyYy9kaXZlcmdpbmcvUmRHeS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS1jaHJvbWF0aWMvc3JjL2RpdmVyZ2luZy9SZFlsQnUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUtY2hyb21hdGljL3NyYy9kaXZlcmdpbmcvUmRZbEduLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlLWNocm9tYXRpYy9zcmMvZGl2ZXJnaW5nL1NwZWN0cmFsLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlLWNocm9tYXRpYy9zcmMvc2VxdWVudGlhbC1tdWx0aS9CdUduLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlLWNocm9tYXRpYy9zcmMvc2VxdWVudGlhbC1tdWx0aS9CdVB1LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlLWNocm9tYXRpYy9zcmMvc2VxdWVudGlhbC1tdWx0aS9HbkJ1LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlLWNocm9tYXRpYy9zcmMvc2VxdWVudGlhbC1tdWx0aS9PclJkLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlLWNocm9tYXRpYy9zcmMvc2VxdWVudGlhbC1tdWx0aS9QdUJ1R24uanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUtY2hyb21hdGljL3NyYy9zZXF1ZW50aWFsLW11bHRpL1B1QnUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUtY2hyb21hdGljL3NyYy9zZXF1ZW50aWFsLW11bHRpL1B1UmQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUtY2hyb21hdGljL3NyYy9zZXF1ZW50aWFsLW11bHRpL1JkUHUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUtY2hyb21hdGljL3NyYy9zZXF1ZW50aWFsLW11bHRpL1lsR25CdS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS1jaHJvbWF0aWMvc3JjL3NlcXVlbnRpYWwtbXVsdGkvWWxHbi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS1jaHJvbWF0aWMvc3JjL3NlcXVlbnRpYWwtbXVsdGkvWWxPckJyLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlLWNocm9tYXRpYy9zcmMvc2VxdWVudGlhbC1tdWx0aS9ZbE9yUmQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUtY2hyb21hdGljL3NyYy9zZXF1ZW50aWFsLXNpbmdsZS9CbHVlcy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS1jaHJvbWF0aWMvc3JjL3NlcXVlbnRpYWwtc2luZ2xlL0dyZWVucy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS1jaHJvbWF0aWMvc3JjL3NlcXVlbnRpYWwtc2luZ2xlL0dyZXlzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlLWNocm9tYXRpYy9zcmMvc2VxdWVudGlhbC1zaW5nbGUvUHVycGxlcy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS1jaHJvbWF0aWMvc3JjL3NlcXVlbnRpYWwtc2luZ2xlL1JlZHMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUtY2hyb21hdGljL3NyYy9zZXF1ZW50aWFsLXNpbmdsZS9PcmFuZ2VzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlLWNocm9tYXRpYy9zcmMvc2VxdWVudGlhbC1tdWx0aS9jaXZpZGlzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlLWNocm9tYXRpYy9zcmMvc2VxdWVudGlhbC1tdWx0aS9jdWJlaGVsaXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUtY2hyb21hdGljL3NyYy9zZXF1ZW50aWFsLW11bHRpL3JhaW5ib3cuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUtY2hyb21hdGljL3NyYy9zZXF1ZW50aWFsLW11bHRpL3NpbmVib3cuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUtY2hyb21hdGljL3NyYy9zZXF1ZW50aWFsLW11bHRpL3R1cmJvLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlLWNocm9tYXRpYy9zcmMvc2VxdWVudGlhbC1tdWx0aS92aXJpZGlzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlLWNocm9tYXRpYy9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtem9vbS9zcmMvY29uc3RhbnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtem9vbS9zcmMvZXZlbnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtem9vbS9zcmMvdHJhbnNmb3JtLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXpvb20vc3JjL25vZXZlbnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtem9vbS9zcmMvem9vbS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy16b29tL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zY2hlZHVsZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy9pbnRlcnJ1cHQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvc2VsZWN0aW9uL2ludGVycnVwdC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3R3ZWVuLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vaW50ZXJwb2xhdGUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9hdHRyLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vYXR0clR3ZWVuLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZGVsYXkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9kdXJhdGlvbi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2Vhc2UuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9lYXNlVmFyeWluZy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2ZpbHRlci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL21lcmdlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vb24uanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9yZW1vdmUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zZWxlY3QuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zZWxlY3RBbGwuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zZWxlY3Rpb24uanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zdHlsZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3N0eWxlVHdlZW4uanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi90ZXh0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdGV4dFR3ZWVuLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdHJhbnNpdGlvbi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2VuZC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2luZGV4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3NlbGVjdGlvbi90cmFuc2l0aW9uLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3NlbGVjdGlvbi9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy9hY3RpdmUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGluaXRSYW5nZShkb21haW4sIHJhbmdlKSB7XG4gIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGNhc2UgMDogYnJlYWs7XG4gICAgY2FzZSAxOiB0aGlzLnJhbmdlKGRvbWFpbik7IGJyZWFrO1xuICAgIGRlZmF1bHQ6IHRoaXMucmFuZ2UocmFuZ2UpLmRvbWFpbihkb21haW4pOyBicmVhaztcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRJbnRlcnBvbGF0b3IoZG9tYWluLCBpbnRlcnBvbGF0b3IpIHtcbiAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiBicmVhaztcbiAgICBjYXNlIDE6IHtcbiAgICAgIGlmICh0eXBlb2YgZG9tYWluID09PSBcImZ1bmN0aW9uXCIpIHRoaXMuaW50ZXJwb2xhdG9yKGRvbWFpbik7XG4gICAgICBlbHNlIHRoaXMucmFuZ2UoZG9tYWluKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBkZWZhdWx0OiB7XG4gICAgICB0aGlzLmRvbWFpbihkb21haW4pO1xuICAgICAgaWYgKHR5cGVvZiBpbnRlcnBvbGF0b3IgPT09IFwiZnVuY3Rpb25cIikgdGhpcy5pbnRlcnBvbGF0b3IoaW50ZXJwb2xhdG9yKTtcbiAgICAgIGVsc2UgdGhpcy5yYW5nZShpbnRlcnBvbGF0b3IpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufVxuIiwiaW1wb3J0IHtJbnRlcm5NYXB9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtpbml0UmFuZ2V9IGZyb20gXCIuL2luaXQuanNcIjtcblxuZXhwb3J0IGNvbnN0IGltcGxpY2l0ID0gU3ltYm9sKFwiaW1wbGljaXRcIik7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9yZGluYWwoKSB7XG4gIHZhciBpbmRleCA9IG5ldyBJbnRlcm5NYXAoKSxcbiAgICAgIGRvbWFpbiA9IFtdLFxuICAgICAgcmFuZ2UgPSBbXSxcbiAgICAgIHVua25vd24gPSBpbXBsaWNpdDtcblxuICBmdW5jdGlvbiBzY2FsZShkKSB7XG4gICAgbGV0IGkgPSBpbmRleC5nZXQoZCk7XG4gICAgaWYgKGkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHVua25vd24gIT09IGltcGxpY2l0KSByZXR1cm4gdW5rbm93bjtcbiAgICAgIGluZGV4LnNldChkLCBpID0gZG9tYWluLnB1c2goZCkgLSAxKTtcbiAgICB9XG4gICAgcmV0dXJuIHJhbmdlW2kgJSByYW5nZS5sZW5ndGhdO1xuICB9XG5cbiAgc2NhbGUuZG9tYWluID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGRvbWFpbi5zbGljZSgpO1xuICAgIGRvbWFpbiA9IFtdLCBpbmRleCA9IG5ldyBJbnRlcm5NYXAoKTtcbiAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIF8pIHtcbiAgICAgIGlmIChpbmRleC5oYXModmFsdWUpKSBjb250aW51ZTtcbiAgICAgIGluZGV4LnNldCh2YWx1ZSwgZG9tYWluLnB1c2godmFsdWUpIC0gMSk7XG4gICAgfVxuICAgIHJldHVybiBzY2FsZTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChyYW5nZSA9IEFycmF5LmZyb20oXyksIHNjYWxlKSA6IHJhbmdlLnNsaWNlKCk7XG4gIH07XG5cbiAgc2NhbGUudW5rbm93biA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh1bmtub3duID0gXywgc2NhbGUpIDogdW5rbm93bjtcbiAgfTtcblxuICBzY2FsZS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG9yZGluYWwoZG9tYWluLCByYW5nZSkudW5rbm93bih1bmtub3duKTtcbiAgfTtcblxuICBpbml0UmFuZ2UuYXBwbHkoc2NhbGUsIGFyZ3VtZW50cyk7XG5cbiAgcmV0dXJuIHNjYWxlO1xufVxuIiwiaW1wb3J0IHtyYW5nZSBhcyBzZXF1ZW5jZX0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2luaXRSYW5nZX0gZnJvbSBcIi4vaW5pdC5qc1wiO1xuaW1wb3J0IG9yZGluYWwgZnJvbSBcIi4vb3JkaW5hbC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBiYW5kKCkge1xuICB2YXIgc2NhbGUgPSBvcmRpbmFsKCkudW5rbm93bih1bmRlZmluZWQpLFxuICAgICAgZG9tYWluID0gc2NhbGUuZG9tYWluLFxuICAgICAgb3JkaW5hbFJhbmdlID0gc2NhbGUucmFuZ2UsXG4gICAgICByMCA9IDAsXG4gICAgICByMSA9IDEsXG4gICAgICBzdGVwLFxuICAgICAgYmFuZHdpZHRoLFxuICAgICAgcm91bmQgPSBmYWxzZSxcbiAgICAgIHBhZGRpbmdJbm5lciA9IDAsXG4gICAgICBwYWRkaW5nT3V0ZXIgPSAwLFxuICAgICAgYWxpZ24gPSAwLjU7XG5cbiAgZGVsZXRlIHNjYWxlLnVua25vd247XG5cbiAgZnVuY3Rpb24gcmVzY2FsZSgpIHtcbiAgICB2YXIgbiA9IGRvbWFpbigpLmxlbmd0aCxcbiAgICAgICAgcmV2ZXJzZSA9IHIxIDwgcjAsXG4gICAgICAgIHN0YXJ0ID0gcmV2ZXJzZSA/IHIxIDogcjAsXG4gICAgICAgIHN0b3AgPSByZXZlcnNlID8gcjAgOiByMTtcbiAgICBzdGVwID0gKHN0b3AgLSBzdGFydCkgLyBNYXRoLm1heCgxLCBuIC0gcGFkZGluZ0lubmVyICsgcGFkZGluZ091dGVyICogMik7XG4gICAgaWYgKHJvdW5kKSBzdGVwID0gTWF0aC5mbG9vcihzdGVwKTtcbiAgICBzdGFydCArPSAoc3RvcCAtIHN0YXJ0IC0gc3RlcCAqIChuIC0gcGFkZGluZ0lubmVyKSkgKiBhbGlnbjtcbiAgICBiYW5kd2lkdGggPSBzdGVwICogKDEgLSBwYWRkaW5nSW5uZXIpO1xuICAgIGlmIChyb3VuZCkgc3RhcnQgPSBNYXRoLnJvdW5kKHN0YXJ0KSwgYmFuZHdpZHRoID0gTWF0aC5yb3VuZChiYW5kd2lkdGgpO1xuICAgIHZhciB2YWx1ZXMgPSBzZXF1ZW5jZShuKS5tYXAoZnVuY3Rpb24oaSkgeyByZXR1cm4gc3RhcnQgKyBzdGVwICogaTsgfSk7XG4gICAgcmV0dXJuIG9yZGluYWxSYW5nZShyZXZlcnNlID8gdmFsdWVzLnJldmVyc2UoKSA6IHZhbHVlcyk7XG4gIH1cblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZG9tYWluKF8pLCByZXNjYWxlKCkpIDogZG9tYWluKCk7XG4gIH07XG5cbiAgc2NhbGUucmFuZ2UgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoW3IwLCByMV0gPSBfLCByMCA9ICtyMCwgcjEgPSArcjEsIHJlc2NhbGUoKSkgOiBbcjAsIHIxXTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZVJvdW5kID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBbcjAsIHIxXSA9IF8sIHIwID0gK3IwLCByMSA9ICtyMSwgcm91bmQgPSB0cnVlLCByZXNjYWxlKCk7XG4gIH07XG5cbiAgc2NhbGUuYmFuZHdpZHRoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGJhbmR3aWR0aDtcbiAgfTtcblxuICBzY2FsZS5zdGVwID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHN0ZXA7XG4gIH07XG5cbiAgc2NhbGUucm91bmQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocm91bmQgPSAhIV8sIHJlc2NhbGUoKSkgOiByb3VuZDtcbiAgfTtcblxuICBzY2FsZS5wYWRkaW5nID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBhZGRpbmdJbm5lciA9IE1hdGgubWluKDEsIHBhZGRpbmdPdXRlciA9ICtfKSwgcmVzY2FsZSgpKSA6IHBhZGRpbmdJbm5lcjtcbiAgfTtcblxuICBzY2FsZS5wYWRkaW5nSW5uZXIgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocGFkZGluZ0lubmVyID0gTWF0aC5taW4oMSwgXyksIHJlc2NhbGUoKSkgOiBwYWRkaW5nSW5uZXI7XG4gIH07XG5cbiAgc2NhbGUucGFkZGluZ091dGVyID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBhZGRpbmdPdXRlciA9ICtfLCByZXNjYWxlKCkpIDogcGFkZGluZ091dGVyO1xuICB9O1xuXG4gIHNjYWxlLmFsaWduID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGFsaWduID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgXykpLCByZXNjYWxlKCkpIDogYWxpZ247XG4gIH07XG5cbiAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBiYW5kKGRvbWFpbigpLCBbcjAsIHIxXSlcbiAgICAgICAgLnJvdW5kKHJvdW5kKVxuICAgICAgICAucGFkZGluZ0lubmVyKHBhZGRpbmdJbm5lcilcbiAgICAgICAgLnBhZGRpbmdPdXRlcihwYWRkaW5nT3V0ZXIpXG4gICAgICAgIC5hbGlnbihhbGlnbik7XG4gIH07XG5cbiAgcmV0dXJuIGluaXRSYW5nZS5hcHBseShyZXNjYWxlKCksIGFyZ3VtZW50cyk7XG59XG5cbmZ1bmN0aW9uIHBvaW50aXNoKHNjYWxlKSB7XG4gIHZhciBjb3B5ID0gc2NhbGUuY29weTtcblxuICBzY2FsZS5wYWRkaW5nID0gc2NhbGUucGFkZGluZ091dGVyO1xuICBkZWxldGUgc2NhbGUucGFkZGluZ0lubmVyO1xuICBkZWxldGUgc2NhbGUucGFkZGluZ091dGVyO1xuXG4gIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcG9pbnRpc2goY29weSgpKTtcbiAgfTtcblxuICByZXR1cm4gc2NhbGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb2ludCgpIHtcbiAgcmV0dXJuIHBvaW50aXNoKGJhbmQuYXBwbHkobnVsbCwgYXJndW1lbnRzKS5wYWRkaW5nSW5uZXIoMSkpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29uc3RhbnRzKHgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB4O1xuICB9O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbnVtYmVyKHgpIHtcbiAgcmV0dXJuICt4O1xufVxuIiwiaW1wb3J0IHtiaXNlY3R9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtpbnRlcnBvbGF0ZSBhcyBpbnRlcnBvbGF0ZVZhbHVlLCBpbnRlcnBvbGF0ZU51bWJlciwgaW50ZXJwb2xhdGVSb3VuZH0gZnJvbSBcImQzLWludGVycG9sYXRlXCI7XG5pbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcbmltcG9ydCBudW1iZXIgZnJvbSBcIi4vbnVtYmVyLmpzXCI7XG5cbnZhciB1bml0ID0gWzAsIDFdO1xuXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkoeCkge1xuICByZXR1cm4geDtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplKGEsIGIpIHtcbiAgcmV0dXJuIChiIC09IChhID0gK2EpKVxuICAgICAgPyBmdW5jdGlvbih4KSB7IHJldHVybiAoeCAtIGEpIC8gYjsgfVxuICAgICAgOiBjb25zdGFudChpc05hTihiKSA/IE5hTiA6IDAuNSk7XG59XG5cbmZ1bmN0aW9uIGNsYW1wZXIoYSwgYikge1xuICB2YXIgdDtcbiAgaWYgKGEgPiBiKSB0ID0gYSwgYSA9IGIsIGIgPSB0O1xuICByZXR1cm4gZnVuY3Rpb24oeCkgeyByZXR1cm4gTWF0aC5tYXgoYSwgTWF0aC5taW4oYiwgeCkpOyB9O1xufVxuXG4vLyBub3JtYWxpemUoYSwgYikoeCkgdGFrZXMgYSBkb21haW4gdmFsdWUgeCBpbiBbYSxiXSBhbmQgcmV0dXJucyB0aGUgY29ycmVzcG9uZGluZyBwYXJhbWV0ZXIgdCBpbiBbMCwxXS5cbi8vIGludGVycG9sYXRlKGEsIGIpKHQpIHRha2VzIGEgcGFyYW1ldGVyIHQgaW4gWzAsMV0gYW5kIHJldHVybnMgdGhlIGNvcnJlc3BvbmRpbmcgcmFuZ2UgdmFsdWUgeCBpbiBbYSxiXS5cbmZ1bmN0aW9uIGJpbWFwKGRvbWFpbiwgcmFuZ2UsIGludGVycG9sYXRlKSB7XG4gIHZhciBkMCA9IGRvbWFpblswXSwgZDEgPSBkb21haW5bMV0sIHIwID0gcmFuZ2VbMF0sIHIxID0gcmFuZ2VbMV07XG4gIGlmIChkMSA8IGQwKSBkMCA9IG5vcm1hbGl6ZShkMSwgZDApLCByMCA9IGludGVycG9sYXRlKHIxLCByMCk7XG4gIGVsc2UgZDAgPSBub3JtYWxpemUoZDAsIGQxKSwgcjAgPSBpbnRlcnBvbGF0ZShyMCwgcjEpO1xuICByZXR1cm4gZnVuY3Rpb24oeCkgeyByZXR1cm4gcjAoZDAoeCkpOyB9O1xufVxuXG5mdW5jdGlvbiBwb2x5bWFwKGRvbWFpbiwgcmFuZ2UsIGludGVycG9sYXRlKSB7XG4gIHZhciBqID0gTWF0aC5taW4oZG9tYWluLmxlbmd0aCwgcmFuZ2UubGVuZ3RoKSAtIDEsXG4gICAgICBkID0gbmV3IEFycmF5KGopLFxuICAgICAgciA9IG5ldyBBcnJheShqKSxcbiAgICAgIGkgPSAtMTtcblxuICAvLyBSZXZlcnNlIGRlc2NlbmRpbmcgZG9tYWlucy5cbiAgaWYgKGRvbWFpbltqXSA8IGRvbWFpblswXSkge1xuICAgIGRvbWFpbiA9IGRvbWFpbi5zbGljZSgpLnJldmVyc2UoKTtcbiAgICByYW5nZSA9IHJhbmdlLnNsaWNlKCkucmV2ZXJzZSgpO1xuICB9XG5cbiAgd2hpbGUgKCsraSA8IGopIHtcbiAgICBkW2ldID0gbm9ybWFsaXplKGRvbWFpbltpXSwgZG9tYWluW2kgKyAxXSk7XG4gICAgcltpXSA9IGludGVycG9sYXRlKHJhbmdlW2ldLCByYW5nZVtpICsgMV0pO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHgpIHtcbiAgICB2YXIgaSA9IGJpc2VjdChkb21haW4sIHgsIDEsIGopIC0gMTtcbiAgICByZXR1cm4gcltpXShkW2ldKHgpKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkoc291cmNlLCB0YXJnZXQpIHtcbiAgcmV0dXJuIHRhcmdldFxuICAgICAgLmRvbWFpbihzb3VyY2UuZG9tYWluKCkpXG4gICAgICAucmFuZ2Uoc291cmNlLnJhbmdlKCkpXG4gICAgICAuaW50ZXJwb2xhdGUoc291cmNlLmludGVycG9sYXRlKCkpXG4gICAgICAuY2xhbXAoc291cmNlLmNsYW1wKCkpXG4gICAgICAudW5rbm93bihzb3VyY2UudW5rbm93bigpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybWVyKCkge1xuICB2YXIgZG9tYWluID0gdW5pdCxcbiAgICAgIHJhbmdlID0gdW5pdCxcbiAgICAgIGludGVycG9sYXRlID0gaW50ZXJwb2xhdGVWYWx1ZSxcbiAgICAgIHRyYW5zZm9ybSxcbiAgICAgIHVudHJhbnNmb3JtLFxuICAgICAgdW5rbm93bixcbiAgICAgIGNsYW1wID0gaWRlbnRpdHksXG4gICAgICBwaWVjZXdpc2UsXG4gICAgICBvdXRwdXQsXG4gICAgICBpbnB1dDtcblxuICBmdW5jdGlvbiByZXNjYWxlKCkge1xuICAgIHZhciBuID0gTWF0aC5taW4oZG9tYWluLmxlbmd0aCwgcmFuZ2UubGVuZ3RoKTtcbiAgICBpZiAoY2xhbXAgIT09IGlkZW50aXR5KSBjbGFtcCA9IGNsYW1wZXIoZG9tYWluWzBdLCBkb21haW5bbiAtIDFdKTtcbiAgICBwaWVjZXdpc2UgPSBuID4gMiA/IHBvbHltYXAgOiBiaW1hcDtcbiAgICBvdXRwdXQgPSBpbnB1dCA9IG51bGw7XG4gICAgcmV0dXJuIHNjYWxlO1xuICB9XG5cbiAgZnVuY3Rpb24gc2NhbGUoeCkge1xuICAgIHJldHVybiB4ID09IG51bGwgfHwgaXNOYU4oeCA9ICt4KSA/IHVua25vd24gOiAob3V0cHV0IHx8IChvdXRwdXQgPSBwaWVjZXdpc2UoZG9tYWluLm1hcCh0cmFuc2Zvcm0pLCByYW5nZSwgaW50ZXJwb2xhdGUpKSkodHJhbnNmb3JtKGNsYW1wKHgpKSk7XG4gIH1cblxuICBzY2FsZS5pbnZlcnQgPSBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuIGNsYW1wKHVudHJhbnNmb3JtKChpbnB1dCB8fCAoaW5wdXQgPSBwaWVjZXdpc2UocmFuZ2UsIGRvbWFpbi5tYXAodHJhbnNmb3JtKSwgaW50ZXJwb2xhdGVOdW1iZXIpKSkoeSkpKTtcbiAgfTtcblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZG9tYWluID0gQXJyYXkuZnJvbShfLCBudW1iZXIpLCByZXNjYWxlKCkpIDogZG9tYWluLnNsaWNlKCk7XG4gIH07XG5cbiAgc2NhbGUucmFuZ2UgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocmFuZ2UgPSBBcnJheS5mcm9tKF8pLCByZXNjYWxlKCkpIDogcmFuZ2Uuc2xpY2UoKTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZVJvdW5kID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiByYW5nZSA9IEFycmF5LmZyb20oXyksIGludGVycG9sYXRlID0gaW50ZXJwb2xhdGVSb3VuZCwgcmVzY2FsZSgpO1xuICB9O1xuXG4gIHNjYWxlLmNsYW1wID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGNsYW1wID0gXyA/IHRydWUgOiBpZGVudGl0eSwgcmVzY2FsZSgpKSA6IGNsYW1wICE9PSBpZGVudGl0eTtcbiAgfTtcblxuICBzY2FsZS5pbnRlcnBvbGF0ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChpbnRlcnBvbGF0ZSA9IF8sIHJlc2NhbGUoKSkgOiBpbnRlcnBvbGF0ZTtcbiAgfTtcblxuICBzY2FsZS51bmtub3duID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHVua25vd24gPSBfLCBzY2FsZSkgOiB1bmtub3duO1xuICB9O1xuXG4gIHJldHVybiBmdW5jdGlvbih0LCB1KSB7XG4gICAgdHJhbnNmb3JtID0gdCwgdW50cmFuc2Zvcm0gPSB1O1xuICAgIHJldHVybiByZXNjYWxlKCk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbnRpbnVvdXMoKSB7XG4gIHJldHVybiB0cmFuc2Zvcm1lcigpKGlkZW50aXR5LCBpZGVudGl0eSk7XG59XG4iLCJpbXBvcnQge3RpY2tTdGVwfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7Zm9ybWF0LCBmb3JtYXRQcmVmaXgsIGZvcm1hdFNwZWNpZmllciwgcHJlY2lzaW9uRml4ZWQsIHByZWNpc2lvblByZWZpeCwgcHJlY2lzaW9uUm91bmR9IGZyb20gXCJkMy1mb3JtYXRcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdGlja0Zvcm1hdChzdGFydCwgc3RvcCwgY291bnQsIHNwZWNpZmllcikge1xuICB2YXIgc3RlcCA9IHRpY2tTdGVwKHN0YXJ0LCBzdG9wLCBjb3VudCksXG4gICAgICBwcmVjaXNpb247XG4gIHNwZWNpZmllciA9IGZvcm1hdFNwZWNpZmllcihzcGVjaWZpZXIgPT0gbnVsbCA/IFwiLGZcIiA6IHNwZWNpZmllcik7XG4gIHN3aXRjaCAoc3BlY2lmaWVyLnR5cGUpIHtcbiAgICBjYXNlIFwic1wiOiB7XG4gICAgICB2YXIgdmFsdWUgPSBNYXRoLm1heChNYXRoLmFicyhzdGFydCksIE1hdGguYWJzKHN0b3ApKTtcbiAgICAgIGlmIChzcGVjaWZpZXIucHJlY2lzaW9uID09IG51bGwgJiYgIWlzTmFOKHByZWNpc2lvbiA9IHByZWNpc2lvblByZWZpeChzdGVwLCB2YWx1ZSkpKSBzcGVjaWZpZXIucHJlY2lzaW9uID0gcHJlY2lzaW9uO1xuICAgICAgcmV0dXJuIGZvcm1hdFByZWZpeChzcGVjaWZpZXIsIHZhbHVlKTtcbiAgICB9XG4gICAgY2FzZSBcIlwiOlxuICAgIGNhc2UgXCJlXCI6XG4gICAgY2FzZSBcImdcIjpcbiAgICBjYXNlIFwicFwiOlxuICAgIGNhc2UgXCJyXCI6IHtcbiAgICAgIGlmIChzcGVjaWZpZXIucHJlY2lzaW9uID09IG51bGwgJiYgIWlzTmFOKHByZWNpc2lvbiA9IHByZWNpc2lvblJvdW5kKHN0ZXAsIE1hdGgubWF4KE1hdGguYWJzKHN0YXJ0KSwgTWF0aC5hYnMoc3RvcCkpKSkpIHNwZWNpZmllci5wcmVjaXNpb24gPSBwcmVjaXNpb24gLSAoc3BlY2lmaWVyLnR5cGUgPT09IFwiZVwiKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjYXNlIFwiZlwiOlxuICAgIGNhc2UgXCIlXCI6IHtcbiAgICAgIGlmIChzcGVjaWZpZXIucHJlY2lzaW9uID09IG51bGwgJiYgIWlzTmFOKHByZWNpc2lvbiA9IHByZWNpc2lvbkZpeGVkKHN0ZXApKSkgc3BlY2lmaWVyLnByZWNpc2lvbiA9IHByZWNpc2lvbiAtIChzcGVjaWZpZXIudHlwZSA9PT0gXCIlXCIpICogMjtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZm9ybWF0KHNwZWNpZmllcik7XG59XG4iLCJpbXBvcnQge3RpY2tzLCB0aWNrSW5jcmVtZW50fSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCBjb250aW51b3VzLCB7Y29weX0gZnJvbSBcIi4vY29udGludW91cy5qc1wiO1xuaW1wb3J0IHtpbml0UmFuZ2V9IGZyb20gXCIuL2luaXQuanNcIjtcbmltcG9ydCB0aWNrRm9ybWF0IGZyb20gXCIuL3RpY2tGb3JtYXQuanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGxpbmVhcmlzaChzY2FsZSkge1xuICB2YXIgZG9tYWluID0gc2NhbGUuZG9tYWluO1xuXG4gIHNjYWxlLnRpY2tzID0gZnVuY3Rpb24oY291bnQpIHtcbiAgICB2YXIgZCA9IGRvbWFpbigpO1xuICAgIHJldHVybiB0aWNrcyhkWzBdLCBkW2QubGVuZ3RoIC0gMV0sIGNvdW50ID09IG51bGwgPyAxMCA6IGNvdW50KTtcbiAgfTtcblxuICBzY2FsZS50aWNrRm9ybWF0ID0gZnVuY3Rpb24oY291bnQsIHNwZWNpZmllcikge1xuICAgIHZhciBkID0gZG9tYWluKCk7XG4gICAgcmV0dXJuIHRpY2tGb3JtYXQoZFswXSwgZFtkLmxlbmd0aCAtIDFdLCBjb3VudCA9PSBudWxsID8gMTAgOiBjb3VudCwgc3BlY2lmaWVyKTtcbiAgfTtcblxuICBzY2FsZS5uaWNlID0gZnVuY3Rpb24oY291bnQpIHtcbiAgICBpZiAoY291bnQgPT0gbnVsbCkgY291bnQgPSAxMDtcblxuICAgIHZhciBkID0gZG9tYWluKCk7XG4gICAgdmFyIGkwID0gMDtcbiAgICB2YXIgaTEgPSBkLmxlbmd0aCAtIDE7XG4gICAgdmFyIHN0YXJ0ID0gZFtpMF07XG4gICAgdmFyIHN0b3AgPSBkW2kxXTtcbiAgICB2YXIgcHJlc3RlcDtcbiAgICB2YXIgc3RlcDtcbiAgICB2YXIgbWF4SXRlciA9IDEwO1xuXG4gICAgaWYgKHN0b3AgPCBzdGFydCkge1xuICAgICAgc3RlcCA9IHN0YXJ0LCBzdGFydCA9IHN0b3AsIHN0b3AgPSBzdGVwO1xuICAgICAgc3RlcCA9IGkwLCBpMCA9IGkxLCBpMSA9IHN0ZXA7XG4gICAgfVxuICAgIFxuICAgIHdoaWxlIChtYXhJdGVyLS0gPiAwKSB7XG4gICAgICBzdGVwID0gdGlja0luY3JlbWVudChzdGFydCwgc3RvcCwgY291bnQpO1xuICAgICAgaWYgKHN0ZXAgPT09IHByZXN0ZXApIHtcbiAgICAgICAgZFtpMF0gPSBzdGFydFxuICAgICAgICBkW2kxXSA9IHN0b3BcbiAgICAgICAgcmV0dXJuIGRvbWFpbihkKTtcbiAgICAgIH0gZWxzZSBpZiAoc3RlcCA+IDApIHtcbiAgICAgICAgc3RhcnQgPSBNYXRoLmZsb29yKHN0YXJ0IC8gc3RlcCkgKiBzdGVwO1xuICAgICAgICBzdG9wID0gTWF0aC5jZWlsKHN0b3AgLyBzdGVwKSAqIHN0ZXA7XG4gICAgICB9IGVsc2UgaWYgKHN0ZXAgPCAwKSB7XG4gICAgICAgIHN0YXJ0ID0gTWF0aC5jZWlsKHN0YXJ0ICogc3RlcCkgLyBzdGVwO1xuICAgICAgICBzdG9wID0gTWF0aC5mbG9vcihzdG9wICogc3RlcCkgLyBzdGVwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBwcmVzdGVwID0gc3RlcDtcbiAgICB9XG5cbiAgICByZXR1cm4gc2NhbGU7XG4gIH07XG5cbiAgcmV0dXJuIHNjYWxlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBsaW5lYXIoKSB7XG4gIHZhciBzY2FsZSA9IGNvbnRpbnVvdXMoKTtcblxuICBzY2FsZS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNvcHkoc2NhbGUsIGxpbmVhcigpKTtcbiAgfTtcblxuICBpbml0UmFuZ2UuYXBwbHkoc2NhbGUsIGFyZ3VtZW50cyk7XG5cbiAgcmV0dXJuIGxpbmVhcmlzaChzY2FsZSk7XG59XG4iLCJpbXBvcnQge2xpbmVhcmlzaH0gZnJvbSBcIi4vbGluZWFyLmpzXCI7XG5pbXBvcnQgbnVtYmVyIGZyb20gXCIuL251bWJlci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpZGVudGl0eShkb21haW4pIHtcbiAgdmFyIHVua25vd247XG5cbiAgZnVuY3Rpb24gc2NhbGUoeCkge1xuICAgIHJldHVybiB4ID09IG51bGwgfHwgaXNOYU4oeCA9ICt4KSA/IHVua25vd24gOiB4O1xuICB9XG5cbiAgc2NhbGUuaW52ZXJ0ID0gc2NhbGU7XG5cbiAgc2NhbGUuZG9tYWluID0gc2NhbGUucmFuZ2UgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZG9tYWluID0gQXJyYXkuZnJvbShfLCBudW1iZXIpLCBzY2FsZSkgOiBkb21haW4uc2xpY2UoKTtcbiAgfTtcblxuICBzY2FsZS51bmtub3duID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHVua25vd24gPSBfLCBzY2FsZSkgOiB1bmtub3duO1xuICB9O1xuXG4gIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gaWRlbnRpdHkoZG9tYWluKS51bmtub3duKHVua25vd24pO1xuICB9O1xuXG4gIGRvbWFpbiA9IGFyZ3VtZW50cy5sZW5ndGggPyBBcnJheS5mcm9tKGRvbWFpbiwgbnVtYmVyKSA6IFswLCAxXTtcblxuICByZXR1cm4gbGluZWFyaXNoKHNjYWxlKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5pY2UoZG9tYWluLCBpbnRlcnZhbCkge1xuICBkb21haW4gPSBkb21haW4uc2xpY2UoKTtcblxuICB2YXIgaTAgPSAwLFxuICAgICAgaTEgPSBkb21haW4ubGVuZ3RoIC0gMSxcbiAgICAgIHgwID0gZG9tYWluW2kwXSxcbiAgICAgIHgxID0gZG9tYWluW2kxXSxcbiAgICAgIHQ7XG5cbiAgaWYgKHgxIDwgeDApIHtcbiAgICB0ID0gaTAsIGkwID0gaTEsIGkxID0gdDtcbiAgICB0ID0geDAsIHgwID0geDEsIHgxID0gdDtcbiAgfVxuXG4gIGRvbWFpbltpMF0gPSBpbnRlcnZhbC5mbG9vcih4MCk7XG4gIGRvbWFpbltpMV0gPSBpbnRlcnZhbC5jZWlsKHgxKTtcbiAgcmV0dXJuIGRvbWFpbjtcbn1cbiIsImltcG9ydCB7dGlja3N9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtmb3JtYXQsIGZvcm1hdFNwZWNpZmllcn0gZnJvbSBcImQzLWZvcm1hdFwiO1xuaW1wb3J0IG5pY2UgZnJvbSBcIi4vbmljZS5qc1wiO1xuaW1wb3J0IHtjb3B5LCB0cmFuc2Zvcm1lcn0gZnJvbSBcIi4vY29udGludW91cy5qc1wiO1xuaW1wb3J0IHtpbml0UmFuZ2V9IGZyb20gXCIuL2luaXQuanNcIjtcblxuZnVuY3Rpb24gdHJhbnNmb3JtTG9nKHgpIHtcbiAgcmV0dXJuIE1hdGgubG9nKHgpO1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1FeHAoeCkge1xuICByZXR1cm4gTWF0aC5leHAoeCk7XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUxvZ24oeCkge1xuICByZXR1cm4gLU1hdGgubG9nKC14KTtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtRXhwbih4KSB7XG4gIHJldHVybiAtTWF0aC5leHAoLXgpO1xufVxuXG5mdW5jdGlvbiBwb3cxMCh4KSB7XG4gIHJldHVybiBpc0Zpbml0ZSh4KSA/ICsoXCIxZVwiICsgeCkgOiB4IDwgMCA/IDAgOiB4O1xufVxuXG5mdW5jdGlvbiBwb3dwKGJhc2UpIHtcbiAgcmV0dXJuIGJhc2UgPT09IDEwID8gcG93MTBcbiAgICAgIDogYmFzZSA9PT0gTWF0aC5FID8gTWF0aC5leHBcbiAgICAgIDogeCA9PiBNYXRoLnBvdyhiYXNlLCB4KTtcbn1cblxuZnVuY3Rpb24gbG9ncChiYXNlKSB7XG4gIHJldHVybiBiYXNlID09PSBNYXRoLkUgPyBNYXRoLmxvZ1xuICAgICAgOiBiYXNlID09PSAxMCAmJiBNYXRoLmxvZzEwXG4gICAgICB8fCBiYXNlID09PSAyICYmIE1hdGgubG9nMlxuICAgICAgfHwgKGJhc2UgPSBNYXRoLmxvZyhiYXNlKSwgeCA9PiBNYXRoLmxvZyh4KSAvIGJhc2UpO1xufVxuXG5mdW5jdGlvbiByZWZsZWN0KGYpIHtcbiAgcmV0dXJuICh4LCBrKSA9PiAtZigteCwgayk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2dnaXNoKHRyYW5zZm9ybSkge1xuICBjb25zdCBzY2FsZSA9IHRyYW5zZm9ybSh0cmFuc2Zvcm1Mb2csIHRyYW5zZm9ybUV4cCk7XG4gIGNvbnN0IGRvbWFpbiA9IHNjYWxlLmRvbWFpbjtcbiAgbGV0IGJhc2UgPSAxMDtcbiAgbGV0IGxvZ3M7XG4gIGxldCBwb3dzO1xuXG4gIGZ1bmN0aW9uIHJlc2NhbGUoKSB7XG4gICAgbG9ncyA9IGxvZ3AoYmFzZSksIHBvd3MgPSBwb3dwKGJhc2UpO1xuICAgIGlmIChkb21haW4oKVswXSA8IDApIHtcbiAgICAgIGxvZ3MgPSByZWZsZWN0KGxvZ3MpLCBwb3dzID0gcmVmbGVjdChwb3dzKTtcbiAgICAgIHRyYW5zZm9ybSh0cmFuc2Zvcm1Mb2duLCB0cmFuc2Zvcm1FeHBuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJhbnNmb3JtKHRyYW5zZm9ybUxvZywgdHJhbnNmb3JtRXhwKTtcbiAgICB9XG4gICAgcmV0dXJuIHNjYWxlO1xuICB9XG5cbiAgc2NhbGUuYmFzZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChiYXNlID0gK18sIHJlc2NhbGUoKSkgOiBiYXNlO1xuICB9O1xuXG4gIHNjYWxlLmRvbWFpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChkb21haW4oXyksIHJlc2NhbGUoKSkgOiBkb21haW4oKTtcbiAgfTtcblxuICBzY2FsZS50aWNrcyA9IGNvdW50ID0+IHtcbiAgICBjb25zdCBkID0gZG9tYWluKCk7XG4gICAgbGV0IHUgPSBkWzBdO1xuICAgIGxldCB2ID0gZFtkLmxlbmd0aCAtIDFdO1xuICAgIGNvbnN0IHIgPSB2IDwgdTtcblxuICAgIGlmIChyKSAoW3UsIHZdID0gW3YsIHVdKTtcblxuICAgIGxldCBpID0gbG9ncyh1KTtcbiAgICBsZXQgaiA9IGxvZ3Modik7XG4gICAgbGV0IGs7XG4gICAgbGV0IHQ7XG4gICAgY29uc3QgbiA9IGNvdW50ID09IG51bGwgPyAxMCA6ICtjb3VudDtcbiAgICBsZXQgeiA9IFtdO1xuXG4gICAgaWYgKCEoYmFzZSAlIDEpICYmIGogLSBpIDwgbikge1xuICAgICAgaSA9IE1hdGguZmxvb3IoaSksIGogPSBNYXRoLmNlaWwoaik7XG4gICAgICBpZiAodSA+IDApIGZvciAoOyBpIDw9IGo7ICsraSkge1xuICAgICAgICBmb3IgKGsgPSAxOyBrIDwgYmFzZTsgKytrKSB7XG4gICAgICAgICAgdCA9IGkgPCAwID8gayAvIHBvd3MoLWkpIDogayAqIHBvd3MoaSk7XG4gICAgICAgICAgaWYgKHQgPCB1KSBjb250aW51ZTtcbiAgICAgICAgICBpZiAodCA+IHYpIGJyZWFrO1xuICAgICAgICAgIHoucHVzaCh0KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGZvciAoOyBpIDw9IGo7ICsraSkge1xuICAgICAgICBmb3IgKGsgPSBiYXNlIC0gMTsgayA+PSAxOyAtLWspIHtcbiAgICAgICAgICB0ID0gaSA+IDAgPyBrIC8gcG93cygtaSkgOiBrICogcG93cyhpKTtcbiAgICAgICAgICBpZiAodCA8IHUpIGNvbnRpbnVlO1xuICAgICAgICAgIGlmICh0ID4gdikgYnJlYWs7XG4gICAgICAgICAgei5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoei5sZW5ndGggKiAyIDwgbikgeiA9IHRpY2tzKHUsIHYsIG4pO1xuICAgIH0gZWxzZSB7XG4gICAgICB6ID0gdGlja3MoaSwgaiwgTWF0aC5taW4oaiAtIGksIG4pKS5tYXAocG93cyk7XG4gICAgfVxuICAgIHJldHVybiByID8gei5yZXZlcnNlKCkgOiB6O1xuICB9O1xuXG4gIHNjYWxlLnRpY2tGb3JtYXQgPSAoY291bnQsIHNwZWNpZmllcikgPT4ge1xuICAgIGlmIChjb3VudCA9PSBudWxsKSBjb3VudCA9IDEwO1xuICAgIGlmIChzcGVjaWZpZXIgPT0gbnVsbCkgc3BlY2lmaWVyID0gYmFzZSA9PT0gMTAgPyBcInNcIiA6IFwiLFwiO1xuICAgIGlmICh0eXBlb2Ygc3BlY2lmaWVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGlmICghKGJhc2UgJSAxKSAmJiAoc3BlY2lmaWVyID0gZm9ybWF0U3BlY2lmaWVyKHNwZWNpZmllcikpLnByZWNpc2lvbiA9PSBudWxsKSBzcGVjaWZpZXIudHJpbSA9IHRydWU7XG4gICAgICBzcGVjaWZpZXIgPSBmb3JtYXQoc3BlY2lmaWVyKTtcbiAgICB9XG4gICAgaWYgKGNvdW50ID09PSBJbmZpbml0eSkgcmV0dXJuIHNwZWNpZmllcjtcbiAgICBjb25zdCBrID0gTWF0aC5tYXgoMSwgYmFzZSAqIGNvdW50IC8gc2NhbGUudGlja3MoKS5sZW5ndGgpOyAvLyBUT0RPIGZhc3QgZXN0aW1hdGU/XG4gICAgcmV0dXJuIGQgPT4ge1xuICAgICAgbGV0IGkgPSBkIC8gcG93cyhNYXRoLnJvdW5kKGxvZ3MoZCkpKTtcbiAgICAgIGlmIChpICogYmFzZSA8IGJhc2UgLSAwLjUpIGkgKj0gYmFzZTtcbiAgICAgIHJldHVybiBpIDw9IGsgPyBzcGVjaWZpZXIoZCkgOiBcIlwiO1xuICAgIH07XG4gIH07XG5cbiAgc2NhbGUubmljZSA9ICgpID0+IHtcbiAgICByZXR1cm4gZG9tYWluKG5pY2UoZG9tYWluKCksIHtcbiAgICAgIGZsb29yOiB4ID0+IHBvd3MoTWF0aC5mbG9vcihsb2dzKHgpKSksXG4gICAgICBjZWlsOiB4ID0+IHBvd3MoTWF0aC5jZWlsKGxvZ3MoeCkpKVxuICAgIH0pKTtcbiAgfTtcblxuICByZXR1cm4gc2NhbGU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxvZygpIHtcbiAgY29uc3Qgc2NhbGUgPSBsb2dnaXNoKHRyYW5zZm9ybWVyKCkpLmRvbWFpbihbMSwgMTBdKTtcbiAgc2NhbGUuY29weSA9ICgpID0+IGNvcHkoc2NhbGUsIGxvZygpKS5iYXNlKHNjYWxlLmJhc2UoKSk7XG4gIGluaXRSYW5nZS5hcHBseShzY2FsZSwgYXJndW1lbnRzKTtcbiAgcmV0dXJuIHNjYWxlO1xufVxuIiwiaW1wb3J0IHtsaW5lYXJpc2h9IGZyb20gXCIuL2xpbmVhci5qc1wiO1xuaW1wb3J0IHtjb3B5LCB0cmFuc2Zvcm1lcn0gZnJvbSBcIi4vY29udGludW91cy5qc1wiO1xuaW1wb3J0IHtpbml0UmFuZ2V9IGZyb20gXCIuL2luaXQuanNcIjtcblxuZnVuY3Rpb24gdHJhbnNmb3JtU3ltbG9nKGMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gTWF0aC5zaWduKHgpICogTWF0aC5sb2cxcChNYXRoLmFicyh4IC8gYykpO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1TeW1leHAoYykge1xuICByZXR1cm4gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiBNYXRoLnNpZ24oeCkgKiBNYXRoLmV4cG0xKE1hdGguYWJzKHgpKSAqIGM7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzeW1sb2dpc2godHJhbnNmb3JtKSB7XG4gIHZhciBjID0gMSwgc2NhbGUgPSB0cmFuc2Zvcm0odHJhbnNmb3JtU3ltbG9nKGMpLCB0cmFuc2Zvcm1TeW1leHAoYykpO1xuXG4gIHNjYWxlLmNvbnN0YW50ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gdHJhbnNmb3JtKHRyYW5zZm9ybVN5bWxvZyhjID0gK18pLCB0cmFuc2Zvcm1TeW1leHAoYykpIDogYztcbiAgfTtcblxuICByZXR1cm4gbGluZWFyaXNoKHNjYWxlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3ltbG9nKCkge1xuICB2YXIgc2NhbGUgPSBzeW1sb2dpc2godHJhbnNmb3JtZXIoKSk7XG5cbiAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjb3B5KHNjYWxlLCBzeW1sb2coKSkuY29uc3RhbnQoc2NhbGUuY29uc3RhbnQoKSk7XG4gIH07XG5cbiAgcmV0dXJuIGluaXRSYW5nZS5hcHBseShzY2FsZSwgYXJndW1lbnRzKTtcbn1cbiIsImltcG9ydCB7bGluZWFyaXNofSBmcm9tIFwiLi9saW5lYXIuanNcIjtcbmltcG9ydCB7Y29weSwgaWRlbnRpdHksIHRyYW5zZm9ybWVyfSBmcm9tIFwiLi9jb250aW51b3VzLmpzXCI7XG5pbXBvcnQge2luaXRSYW5nZX0gZnJvbSBcIi4vaW5pdC5qc1wiO1xuXG5mdW5jdGlvbiB0cmFuc2Zvcm1Qb3coZXhwb25lbnQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4geCA8IDAgPyAtTWF0aC5wb3coLXgsIGV4cG9uZW50KSA6IE1hdGgucG93KHgsIGV4cG9uZW50KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtU3FydCh4KSB7XG4gIHJldHVybiB4IDwgMCA/IC1NYXRoLnNxcnQoLXgpIDogTWF0aC5zcXJ0KHgpO1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1TcXVhcmUoeCkge1xuICByZXR1cm4geCA8IDAgPyAteCAqIHggOiB4ICogeDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBvd2lzaCh0cmFuc2Zvcm0pIHtcbiAgdmFyIHNjYWxlID0gdHJhbnNmb3JtKGlkZW50aXR5LCBpZGVudGl0eSksXG4gICAgICBleHBvbmVudCA9IDE7XG5cbiAgZnVuY3Rpb24gcmVzY2FsZSgpIHtcbiAgICByZXR1cm4gZXhwb25lbnQgPT09IDEgPyB0cmFuc2Zvcm0oaWRlbnRpdHksIGlkZW50aXR5KVxuICAgICAgICA6IGV4cG9uZW50ID09PSAwLjUgPyB0cmFuc2Zvcm0odHJhbnNmb3JtU3FydCwgdHJhbnNmb3JtU3F1YXJlKVxuICAgICAgICA6IHRyYW5zZm9ybSh0cmFuc2Zvcm1Qb3coZXhwb25lbnQpLCB0cmFuc2Zvcm1Qb3coMSAvIGV4cG9uZW50KSk7XG4gIH1cblxuICBzY2FsZS5leHBvbmVudCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChleHBvbmVudCA9ICtfLCByZXNjYWxlKCkpIDogZXhwb25lbnQ7XG4gIH07XG5cbiAgcmV0dXJuIGxpbmVhcmlzaChzY2FsZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBvdygpIHtcbiAgdmFyIHNjYWxlID0gcG93aXNoKHRyYW5zZm9ybWVyKCkpO1xuXG4gIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY29weShzY2FsZSwgcG93KCkpLmV4cG9uZW50KHNjYWxlLmV4cG9uZW50KCkpO1xuICB9O1xuXG4gIGluaXRSYW5nZS5hcHBseShzY2FsZSwgYXJndW1lbnRzKTtcblxuICByZXR1cm4gc2NhbGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcXJ0KCkge1xuICByZXR1cm4gcG93LmFwcGx5KG51bGwsIGFyZ3VtZW50cykuZXhwb25lbnQoMC41KTtcbn1cbiIsImltcG9ydCBjb250aW51b3VzIGZyb20gXCIuL2NvbnRpbnVvdXMuanNcIjtcbmltcG9ydCB7aW5pdFJhbmdlfSBmcm9tIFwiLi9pbml0LmpzXCI7XG5pbXBvcnQge2xpbmVhcmlzaH0gZnJvbSBcIi4vbGluZWFyLmpzXCI7XG5pbXBvcnQgbnVtYmVyIGZyb20gXCIuL251bWJlci5qc1wiO1xuXG5mdW5jdGlvbiBzcXVhcmUoeCkge1xuICByZXR1cm4gTWF0aC5zaWduKHgpICogeCAqIHg7XG59XG5cbmZ1bmN0aW9uIHVuc3F1YXJlKHgpIHtcbiAgcmV0dXJuIE1hdGguc2lnbih4KSAqIE1hdGguc3FydChNYXRoLmFicyh4KSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJhZGlhbCgpIHtcbiAgdmFyIHNxdWFyZWQgPSBjb250aW51b3VzKCksXG4gICAgICByYW5nZSA9IFswLCAxXSxcbiAgICAgIHJvdW5kID0gZmFsc2UsXG4gICAgICB1bmtub3duO1xuXG4gIGZ1bmN0aW9uIHNjYWxlKHgpIHtcbiAgICB2YXIgeSA9IHVuc3F1YXJlKHNxdWFyZWQoeCkpO1xuICAgIHJldHVybiBpc05hTih5KSA/IHVua25vd24gOiByb3VuZCA/IE1hdGgucm91bmQoeSkgOiB5O1xuICB9XG5cbiAgc2NhbGUuaW52ZXJ0ID0gZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiBzcXVhcmVkLmludmVydChzcXVhcmUoeSkpO1xuICB9O1xuXG4gIHNjYWxlLmRvbWFpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChzcXVhcmVkLmRvbWFpbihfKSwgc2NhbGUpIDogc3F1YXJlZC5kb21haW4oKTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChzcXVhcmVkLnJhbmdlKChyYW5nZSA9IEFycmF5LmZyb20oXywgbnVtYmVyKSkubWFwKHNxdWFyZSkpLCBzY2FsZSkgOiByYW5nZS5zbGljZSgpO1xuICB9O1xuXG4gIHNjYWxlLnJhbmdlUm91bmQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIHNjYWxlLnJhbmdlKF8pLnJvdW5kKHRydWUpO1xuICB9O1xuXG4gIHNjYWxlLnJvdW5kID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHJvdW5kID0gISFfLCBzY2FsZSkgOiByb3VuZDtcbiAgfTtcblxuICBzY2FsZS5jbGFtcCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChzcXVhcmVkLmNsYW1wKF8pLCBzY2FsZSkgOiBzcXVhcmVkLmNsYW1wKCk7XG4gIH07XG5cbiAgc2NhbGUudW5rbm93biA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh1bmtub3duID0gXywgc2NhbGUpIDogdW5rbm93bjtcbiAgfTtcblxuICBzY2FsZS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHJhZGlhbChzcXVhcmVkLmRvbWFpbigpLCByYW5nZSlcbiAgICAgICAgLnJvdW5kKHJvdW5kKVxuICAgICAgICAuY2xhbXAoc3F1YXJlZC5jbGFtcCgpKVxuICAgICAgICAudW5rbm93bih1bmtub3duKTtcbiAgfTtcblxuICBpbml0UmFuZ2UuYXBwbHkoc2NhbGUsIGFyZ3VtZW50cyk7XG5cbiAgcmV0dXJuIGxpbmVhcmlzaChzY2FsZSk7XG59XG4iLCJpbXBvcnQge2FzY2VuZGluZywgYmlzZWN0LCBxdWFudGlsZVNvcnRlZCBhcyB0aHJlc2hvbGR9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtpbml0UmFuZ2V9IGZyb20gXCIuL2luaXQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcXVhbnRpbGUoKSB7XG4gIHZhciBkb21haW4gPSBbXSxcbiAgICAgIHJhbmdlID0gW10sXG4gICAgICB0aHJlc2hvbGRzID0gW10sXG4gICAgICB1bmtub3duO1xuXG4gIGZ1bmN0aW9uIHJlc2NhbGUoKSB7XG4gICAgdmFyIGkgPSAwLCBuID0gTWF0aC5tYXgoMSwgcmFuZ2UubGVuZ3RoKTtcbiAgICB0aHJlc2hvbGRzID0gbmV3IEFycmF5KG4gLSAxKTtcbiAgICB3aGlsZSAoKytpIDwgbikgdGhyZXNob2xkc1tpIC0gMV0gPSB0aHJlc2hvbGQoZG9tYWluLCBpIC8gbik7XG4gICAgcmV0dXJuIHNjYWxlO1xuICB9XG5cbiAgZnVuY3Rpb24gc2NhbGUoeCkge1xuICAgIHJldHVybiB4ID09IG51bGwgfHwgaXNOYU4oeCA9ICt4KSA/IHVua25vd24gOiByYW5nZVtiaXNlY3QodGhyZXNob2xkcywgeCldO1xuICB9XG5cbiAgc2NhbGUuaW52ZXJ0RXh0ZW50ID0gZnVuY3Rpb24oeSkge1xuICAgIHZhciBpID0gcmFuZ2UuaW5kZXhPZih5KTtcbiAgICByZXR1cm4gaSA8IDAgPyBbTmFOLCBOYU5dIDogW1xuICAgICAgaSA+IDAgPyB0aHJlc2hvbGRzW2kgLSAxXSA6IGRvbWFpblswXSxcbiAgICAgIGkgPCB0aHJlc2hvbGRzLmxlbmd0aCA/IHRocmVzaG9sZHNbaV0gOiBkb21haW5bZG9tYWluLmxlbmd0aCAtIDFdXG4gICAgXTtcbiAgfTtcblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZG9tYWluLnNsaWNlKCk7XG4gICAgZG9tYWluID0gW107XG4gICAgZm9yIChsZXQgZCBvZiBfKSBpZiAoZCAhPSBudWxsICYmICFpc05hTihkID0gK2QpKSBkb21haW4ucHVzaChkKTtcbiAgICBkb21haW4uc29ydChhc2NlbmRpbmcpO1xuICAgIHJldHVybiByZXNjYWxlKCk7XG4gIH07XG5cbiAgc2NhbGUucmFuZ2UgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocmFuZ2UgPSBBcnJheS5mcm9tKF8pLCByZXNjYWxlKCkpIDogcmFuZ2Uuc2xpY2UoKTtcbiAgfTtcblxuICBzY2FsZS51bmtub3duID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHVua25vd24gPSBfLCBzY2FsZSkgOiB1bmtub3duO1xuICB9O1xuXG4gIHNjYWxlLnF1YW50aWxlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aHJlc2hvbGRzLnNsaWNlKCk7XG4gIH07XG5cbiAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBxdWFudGlsZSgpXG4gICAgICAgIC5kb21haW4oZG9tYWluKVxuICAgICAgICAucmFuZ2UocmFuZ2UpXG4gICAgICAgIC51bmtub3duKHVua25vd24pO1xuICB9O1xuXG4gIHJldHVybiBpbml0UmFuZ2UuYXBwbHkoc2NhbGUsIGFyZ3VtZW50cyk7XG59XG4iLCJpbXBvcnQge2Jpc2VjdH0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2xpbmVhcmlzaH0gZnJvbSBcIi4vbGluZWFyLmpzXCI7XG5pbXBvcnQge2luaXRSYW5nZX0gZnJvbSBcIi4vaW5pdC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBxdWFudGl6ZSgpIHtcbiAgdmFyIHgwID0gMCxcbiAgICAgIHgxID0gMSxcbiAgICAgIG4gPSAxLFxuICAgICAgZG9tYWluID0gWzAuNV0sXG4gICAgICByYW5nZSA9IFswLCAxXSxcbiAgICAgIHVua25vd247XG5cbiAgZnVuY3Rpb24gc2NhbGUoeCkge1xuICAgIHJldHVybiB4ICE9IG51bGwgJiYgeCA8PSB4ID8gcmFuZ2VbYmlzZWN0KGRvbWFpbiwgeCwgMCwgbildIDogdW5rbm93bjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2NhbGUoKSB7XG4gICAgdmFyIGkgPSAtMTtcbiAgICBkb21haW4gPSBuZXcgQXJyYXkobik7XG4gICAgd2hpbGUgKCsraSA8IG4pIGRvbWFpbltpXSA9ICgoaSArIDEpICogeDEgLSAoaSAtIG4pICogeDApIC8gKG4gKyAxKTtcbiAgICByZXR1cm4gc2NhbGU7XG4gIH1cblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoW3gwLCB4MV0gPSBfLCB4MCA9ICt4MCwgeDEgPSAreDEsIHJlc2NhbGUoKSkgOiBbeDAsIHgxXTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChuID0gKHJhbmdlID0gQXJyYXkuZnJvbShfKSkubGVuZ3RoIC0gMSwgcmVzY2FsZSgpKSA6IHJhbmdlLnNsaWNlKCk7XG4gIH07XG5cbiAgc2NhbGUuaW52ZXJ0RXh0ZW50ID0gZnVuY3Rpb24oeSkge1xuICAgIHZhciBpID0gcmFuZ2UuaW5kZXhPZih5KTtcbiAgICByZXR1cm4gaSA8IDAgPyBbTmFOLCBOYU5dXG4gICAgICAgIDogaSA8IDEgPyBbeDAsIGRvbWFpblswXV1cbiAgICAgICAgOiBpID49IG4gPyBbZG9tYWluW24gLSAxXSwgeDFdXG4gICAgICAgIDogW2RvbWFpbltpIC0gMV0sIGRvbWFpbltpXV07XG4gIH07XG5cbiAgc2NhbGUudW5rbm93biA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh1bmtub3duID0gXywgc2NhbGUpIDogc2NhbGU7XG4gIH07XG5cbiAgc2NhbGUudGhyZXNob2xkcyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkb21haW4uc2xpY2UoKTtcbiAgfTtcblxuICBzY2FsZS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHF1YW50aXplKClcbiAgICAgICAgLmRvbWFpbihbeDAsIHgxXSlcbiAgICAgICAgLnJhbmdlKHJhbmdlKVxuICAgICAgICAudW5rbm93bih1bmtub3duKTtcbiAgfTtcblxuICByZXR1cm4gaW5pdFJhbmdlLmFwcGx5KGxpbmVhcmlzaChzY2FsZSksIGFyZ3VtZW50cyk7XG59XG4iLCJpbXBvcnQge2Jpc2VjdH0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2luaXRSYW5nZX0gZnJvbSBcIi4vaW5pdC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0aHJlc2hvbGQoKSB7XG4gIHZhciBkb21haW4gPSBbMC41XSxcbiAgICAgIHJhbmdlID0gWzAsIDFdLFxuICAgICAgdW5rbm93bixcbiAgICAgIG4gPSAxO1xuXG4gIGZ1bmN0aW9uIHNjYWxlKHgpIHtcbiAgICByZXR1cm4geCAhPSBudWxsICYmIHggPD0geCA/IHJhbmdlW2Jpc2VjdChkb21haW4sIHgsIDAsIG4pXSA6IHVua25vd247XG4gIH1cblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZG9tYWluID0gQXJyYXkuZnJvbShfKSwgbiA9IE1hdGgubWluKGRvbWFpbi5sZW5ndGgsIHJhbmdlLmxlbmd0aCAtIDEpLCBzY2FsZSkgOiBkb21haW4uc2xpY2UoKTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChyYW5nZSA9IEFycmF5LmZyb20oXyksIG4gPSBNYXRoLm1pbihkb21haW4ubGVuZ3RoLCByYW5nZS5sZW5ndGggLSAxKSwgc2NhbGUpIDogcmFuZ2Uuc2xpY2UoKTtcbiAgfTtcblxuICBzY2FsZS5pbnZlcnRFeHRlbnQgPSBmdW5jdGlvbih5KSB7XG4gICAgdmFyIGkgPSByYW5nZS5pbmRleE9mKHkpO1xuICAgIHJldHVybiBbZG9tYWluW2kgLSAxXSwgZG9tYWluW2ldXTtcbiAgfTtcblxuICBzY2FsZS51bmtub3duID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHVua25vd24gPSBfLCBzY2FsZSkgOiB1bmtub3duO1xuICB9O1xuXG4gIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhyZXNob2xkKClcbiAgICAgICAgLmRvbWFpbihkb21haW4pXG4gICAgICAgIC5yYW5nZShyYW5nZSlcbiAgICAgICAgLnVua25vd24odW5rbm93bik7XG4gIH07XG5cbiAgcmV0dXJuIGluaXRSYW5nZS5hcHBseShzY2FsZSwgYXJndW1lbnRzKTtcbn1cbiIsImltcG9ydCB7dGltZVllYXIsIHRpbWVNb250aCwgdGltZVdlZWssIHRpbWVEYXksIHRpbWVIb3VyLCB0aW1lTWludXRlLCB0aW1lU2Vjb25kLCB0aW1lVGlja3MsIHRpbWVUaWNrSW50ZXJ2YWx9IGZyb20gXCJkMy10aW1lXCI7XG5pbXBvcnQge3RpbWVGb3JtYXR9IGZyb20gXCJkMy10aW1lLWZvcm1hdFwiO1xuaW1wb3J0IGNvbnRpbnVvdXMsIHtjb3B5fSBmcm9tIFwiLi9jb250aW51b3VzLmpzXCI7XG5pbXBvcnQge2luaXRSYW5nZX0gZnJvbSBcIi4vaW5pdC5qc1wiO1xuaW1wb3J0IG5pY2UgZnJvbSBcIi4vbmljZS5qc1wiO1xuXG5mdW5jdGlvbiBkYXRlKHQpIHtcbiAgcmV0dXJuIG5ldyBEYXRlKHQpO1xufVxuXG5mdW5jdGlvbiBudW1iZXIodCkge1xuICByZXR1cm4gdCBpbnN0YW5jZW9mIERhdGUgPyArdCA6ICtuZXcgRGF0ZSgrdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYWxlbmRhcih0aWNrcywgdGlja0ludGVydmFsLCB5ZWFyLCBtb250aCwgd2VlaywgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgZm9ybWF0KSB7XG4gIHZhciBzY2FsZSA9IGNvbnRpbnVvdXMoKSxcbiAgICAgIGludmVydCA9IHNjYWxlLmludmVydCxcbiAgICAgIGRvbWFpbiA9IHNjYWxlLmRvbWFpbjtcblxuICB2YXIgZm9ybWF0TWlsbGlzZWNvbmQgPSBmb3JtYXQoXCIuJUxcIiksXG4gICAgICBmb3JtYXRTZWNvbmQgPSBmb3JtYXQoXCI6JVNcIiksXG4gICAgICBmb3JtYXRNaW51dGUgPSBmb3JtYXQoXCIlSTolTVwiKSxcbiAgICAgIGZvcm1hdEhvdXIgPSBmb3JtYXQoXCIlSSAlcFwiKSxcbiAgICAgIGZvcm1hdERheSA9IGZvcm1hdChcIiVhICVkXCIpLFxuICAgICAgZm9ybWF0V2VlayA9IGZvcm1hdChcIiViICVkXCIpLFxuICAgICAgZm9ybWF0TW9udGggPSBmb3JtYXQoXCIlQlwiKSxcbiAgICAgIGZvcm1hdFllYXIgPSBmb3JtYXQoXCIlWVwiKTtcblxuICBmdW5jdGlvbiB0aWNrRm9ybWF0KGRhdGUpIHtcbiAgICByZXR1cm4gKHNlY29uZChkYXRlKSA8IGRhdGUgPyBmb3JtYXRNaWxsaXNlY29uZFxuICAgICAgICA6IG1pbnV0ZShkYXRlKSA8IGRhdGUgPyBmb3JtYXRTZWNvbmRcbiAgICAgICAgOiBob3VyKGRhdGUpIDwgZGF0ZSA/IGZvcm1hdE1pbnV0ZVxuICAgICAgICA6IGRheShkYXRlKSA8IGRhdGUgPyBmb3JtYXRIb3VyXG4gICAgICAgIDogbW9udGgoZGF0ZSkgPCBkYXRlID8gKHdlZWsoZGF0ZSkgPCBkYXRlID8gZm9ybWF0RGF5IDogZm9ybWF0V2VlaylcbiAgICAgICAgOiB5ZWFyKGRhdGUpIDwgZGF0ZSA/IGZvcm1hdE1vbnRoXG4gICAgICAgIDogZm9ybWF0WWVhcikoZGF0ZSk7XG4gIH1cblxuICBzY2FsZS5pbnZlcnQgPSBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKGludmVydCh5KSk7XG4gIH07XG5cbiAgc2NhbGUuZG9tYWluID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gZG9tYWluKEFycmF5LmZyb20oXywgbnVtYmVyKSkgOiBkb21haW4oKS5tYXAoZGF0ZSk7XG4gIH07XG5cbiAgc2NhbGUudGlja3MgPSBmdW5jdGlvbihpbnRlcnZhbCkge1xuICAgIHZhciBkID0gZG9tYWluKCk7XG4gICAgcmV0dXJuIHRpY2tzKGRbMF0sIGRbZC5sZW5ndGggLSAxXSwgaW50ZXJ2YWwgPT0gbnVsbCA/IDEwIDogaW50ZXJ2YWwpO1xuICB9O1xuXG4gIHNjYWxlLnRpY2tGb3JtYXQgPSBmdW5jdGlvbihjb3VudCwgc3BlY2lmaWVyKSB7XG4gICAgcmV0dXJuIHNwZWNpZmllciA9PSBudWxsID8gdGlja0Zvcm1hdCA6IGZvcm1hdChzcGVjaWZpZXIpO1xuICB9O1xuXG4gIHNjYWxlLm5pY2UgPSBmdW5jdGlvbihpbnRlcnZhbCkge1xuICAgIHZhciBkID0gZG9tYWluKCk7XG4gICAgaWYgKCFpbnRlcnZhbCB8fCB0eXBlb2YgaW50ZXJ2YWwucmFuZ2UgIT09IFwiZnVuY3Rpb25cIikgaW50ZXJ2YWwgPSB0aWNrSW50ZXJ2YWwoZFswXSwgZFtkLmxlbmd0aCAtIDFdLCBpbnRlcnZhbCA9PSBudWxsID8gMTAgOiBpbnRlcnZhbCk7XG4gICAgcmV0dXJuIGludGVydmFsID8gZG9tYWluKG5pY2UoZCwgaW50ZXJ2YWwpKSA6IHNjYWxlO1xuICB9O1xuXG4gIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY29weShzY2FsZSwgY2FsZW5kYXIodGlja3MsIHRpY2tJbnRlcnZhbCwgeWVhciwgbW9udGgsIHdlZWssIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIGZvcm1hdCkpO1xuICB9O1xuXG4gIHJldHVybiBzY2FsZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdGltZSgpIHtcbiAgcmV0dXJuIGluaXRSYW5nZS5hcHBseShjYWxlbmRhcih0aW1lVGlja3MsIHRpbWVUaWNrSW50ZXJ2YWwsIHRpbWVZZWFyLCB0aW1lTW9udGgsIHRpbWVXZWVrLCB0aW1lRGF5LCB0aW1lSG91ciwgdGltZU1pbnV0ZSwgdGltZVNlY29uZCwgdGltZUZvcm1hdCkuZG9tYWluKFtuZXcgRGF0ZSgyMDAwLCAwLCAxKSwgbmV3IERhdGUoMjAwMCwgMCwgMildKSwgYXJndW1lbnRzKTtcbn1cbiIsImltcG9ydCB7dXRjWWVhciwgdXRjTW9udGgsIHV0Y1dlZWssIHV0Y0RheSwgdXRjSG91ciwgdXRjTWludXRlLCB1dGNTZWNvbmQsIHV0Y1RpY2tzLCB1dGNUaWNrSW50ZXJ2YWx9IGZyb20gXCJkMy10aW1lXCI7XG5pbXBvcnQge3V0Y0Zvcm1hdH0gZnJvbSBcImQzLXRpbWUtZm9ybWF0XCI7XG5pbXBvcnQge2NhbGVuZGFyfSBmcm9tIFwiLi90aW1lLmpzXCI7XG5pbXBvcnQge2luaXRSYW5nZX0gZnJvbSBcIi4vaW5pdC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB1dGNUaW1lKCkge1xuICByZXR1cm4gaW5pdFJhbmdlLmFwcGx5KGNhbGVuZGFyKHV0Y1RpY2tzLCB1dGNUaWNrSW50ZXJ2YWwsIHV0Y1llYXIsIHV0Y01vbnRoLCB1dGNXZWVrLCB1dGNEYXksIHV0Y0hvdXIsIHV0Y01pbnV0ZSwgdXRjU2Vjb25kLCB1dGNGb3JtYXQpLmRvbWFpbihbRGF0ZS5VVEMoMjAwMCwgMCwgMSksIERhdGUuVVRDKDIwMDAsIDAsIDIpXSksIGFyZ3VtZW50cyk7XG59XG4iLCJpbXBvcnQge2ludGVycG9sYXRlLCBpbnRlcnBvbGF0ZVJvdW5kfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcbmltcG9ydCB7aWRlbnRpdHl9IGZyb20gXCIuL2NvbnRpbnVvdXMuanNcIjtcbmltcG9ydCB7aW5pdEludGVycG9sYXRvcn0gZnJvbSBcIi4vaW5pdC5qc1wiO1xuaW1wb3J0IHtsaW5lYXJpc2h9IGZyb20gXCIuL2xpbmVhci5qc1wiO1xuaW1wb3J0IHtsb2dnaXNofSBmcm9tIFwiLi9sb2cuanNcIjtcbmltcG9ydCB7c3ltbG9naXNofSBmcm9tIFwiLi9zeW1sb2cuanNcIjtcbmltcG9ydCB7cG93aXNofSBmcm9tIFwiLi9wb3cuanNcIjtcblxuZnVuY3Rpb24gdHJhbnNmb3JtZXIoKSB7XG4gIHZhciB4MCA9IDAsXG4gICAgICB4MSA9IDEsXG4gICAgICB0MCxcbiAgICAgIHQxLFxuICAgICAgazEwLFxuICAgICAgdHJhbnNmb3JtLFxuICAgICAgaW50ZXJwb2xhdG9yID0gaWRlbnRpdHksXG4gICAgICBjbGFtcCA9IGZhbHNlLFxuICAgICAgdW5rbm93bjtcblxuICBmdW5jdGlvbiBzY2FsZSh4KSB7XG4gICAgcmV0dXJuIHggPT0gbnVsbCB8fCBpc05hTih4ID0gK3gpID8gdW5rbm93biA6IGludGVycG9sYXRvcihrMTAgPT09IDAgPyAwLjUgOiAoeCA9ICh0cmFuc2Zvcm0oeCkgLSB0MCkgKiBrMTAsIGNsYW1wID8gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgeCkpIDogeCkpO1xuICB9XG5cbiAgc2NhbGUuZG9tYWluID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKFt4MCwgeDFdID0gXywgdDAgPSB0cmFuc2Zvcm0oeDAgPSAreDApLCB0MSA9IHRyYW5zZm9ybSh4MSA9ICt4MSksIGsxMCA9IHQwID09PSB0MSA/IDAgOiAxIC8gKHQxIC0gdDApLCBzY2FsZSkgOiBbeDAsIHgxXTtcbiAgfTtcblxuICBzY2FsZS5jbGFtcCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChjbGFtcCA9ICEhXywgc2NhbGUpIDogY2xhbXA7XG4gIH07XG5cbiAgc2NhbGUuaW50ZXJwb2xhdG9yID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGludGVycG9sYXRvciA9IF8sIHNjYWxlKSA6IGludGVycG9sYXRvcjtcbiAgfTtcblxuICBmdW5jdGlvbiByYW5nZShpbnRlcnBvbGF0ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbihfKSB7XG4gICAgICB2YXIgcjAsIHIxO1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoW3IwLCByMV0gPSBfLCBpbnRlcnBvbGF0b3IgPSBpbnRlcnBvbGF0ZShyMCwgcjEpLCBzY2FsZSkgOiBbaW50ZXJwb2xhdG9yKDApLCBpbnRlcnBvbGF0b3IoMSldO1xuICAgIH07XG4gIH1cblxuICBzY2FsZS5yYW5nZSA9IHJhbmdlKGludGVycG9sYXRlKTtcblxuICBzY2FsZS5yYW5nZVJvdW5kID0gcmFuZ2UoaW50ZXJwb2xhdGVSb3VuZCk7XG5cbiAgc2NhbGUudW5rbm93biA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh1bmtub3duID0gXywgc2NhbGUpIDogdW5rbm93bjtcbiAgfTtcblxuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHRyYW5zZm9ybSA9IHQsIHQwID0gdCh4MCksIHQxID0gdCh4MSksIGsxMCA9IHQwID09PSB0MSA/IDAgOiAxIC8gKHQxIC0gdDApO1xuICAgIHJldHVybiBzY2FsZTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkoc291cmNlLCB0YXJnZXQpIHtcbiAgcmV0dXJuIHRhcmdldFxuICAgICAgLmRvbWFpbihzb3VyY2UuZG9tYWluKCkpXG4gICAgICAuaW50ZXJwb2xhdG9yKHNvdXJjZS5pbnRlcnBvbGF0b3IoKSlcbiAgICAgIC5jbGFtcChzb3VyY2UuY2xhbXAoKSlcbiAgICAgIC51bmtub3duKHNvdXJjZS51bmtub3duKCkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzZXF1ZW50aWFsKCkge1xuICB2YXIgc2NhbGUgPSBsaW5lYXJpc2godHJhbnNmb3JtZXIoKShpZGVudGl0eSkpO1xuXG4gIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY29weShzY2FsZSwgc2VxdWVudGlhbCgpKTtcbiAgfTtcblxuICByZXR1cm4gaW5pdEludGVycG9sYXRvci5hcHBseShzY2FsZSwgYXJndW1lbnRzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbnRpYWxMb2coKSB7XG4gIHZhciBzY2FsZSA9IGxvZ2dpc2godHJhbnNmb3JtZXIoKSkuZG9tYWluKFsxLCAxMF0pO1xuXG4gIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY29weShzY2FsZSwgc2VxdWVudGlhbExvZygpKS5iYXNlKHNjYWxlLmJhc2UoKSk7XG4gIH07XG5cbiAgcmV0dXJuIGluaXRJbnRlcnBvbGF0b3IuYXBwbHkoc2NhbGUsIGFyZ3VtZW50cyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW50aWFsU3ltbG9nKCkge1xuICB2YXIgc2NhbGUgPSBzeW1sb2dpc2godHJhbnNmb3JtZXIoKSk7XG5cbiAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjb3B5KHNjYWxlLCBzZXF1ZW50aWFsU3ltbG9nKCkpLmNvbnN0YW50KHNjYWxlLmNvbnN0YW50KCkpO1xuICB9O1xuXG4gIHJldHVybiBpbml0SW50ZXJwb2xhdG9yLmFwcGx5KHNjYWxlLCBhcmd1bWVudHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVudGlhbFBvdygpIHtcbiAgdmFyIHNjYWxlID0gcG93aXNoKHRyYW5zZm9ybWVyKCkpO1xuXG4gIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY29weShzY2FsZSwgc2VxdWVudGlhbFBvdygpKS5leHBvbmVudChzY2FsZS5leHBvbmVudCgpKTtcbiAgfTtcblxuICByZXR1cm4gaW5pdEludGVycG9sYXRvci5hcHBseShzY2FsZSwgYXJndW1lbnRzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbnRpYWxTcXJ0KCkge1xuICByZXR1cm4gc2VxdWVudGlhbFBvdy5hcHBseShudWxsLCBhcmd1bWVudHMpLmV4cG9uZW50KDAuNSk7XG59XG4iLCJpbXBvcnQge2FzY2VuZGluZywgYmlzZWN0LCBxdWFudGlsZX0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2lkZW50aXR5fSBmcm9tIFwiLi9jb250aW51b3VzLmpzXCI7XG5pbXBvcnQge2luaXRJbnRlcnBvbGF0b3J9IGZyb20gXCIuL2luaXQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc2VxdWVudGlhbFF1YW50aWxlKCkge1xuICB2YXIgZG9tYWluID0gW10sXG4gICAgICBpbnRlcnBvbGF0b3IgPSBpZGVudGl0eTtcblxuICBmdW5jdGlvbiBzY2FsZSh4KSB7XG4gICAgaWYgKHggIT0gbnVsbCAmJiAhaXNOYU4oeCA9ICt4KSkgcmV0dXJuIGludGVycG9sYXRvcigoYmlzZWN0KGRvbWFpbiwgeCwgMSkgLSAxKSAvIChkb21haW4ubGVuZ3RoIC0gMSkpO1xuICB9XG5cbiAgc2NhbGUuZG9tYWluID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGRvbWFpbi5zbGljZSgpO1xuICAgIGRvbWFpbiA9IFtdO1xuICAgIGZvciAobGV0IGQgb2YgXykgaWYgKGQgIT0gbnVsbCAmJiAhaXNOYU4oZCA9ICtkKSkgZG9tYWluLnB1c2goZCk7XG4gICAgZG9tYWluLnNvcnQoYXNjZW5kaW5nKTtcbiAgICByZXR1cm4gc2NhbGU7XG4gIH07XG5cbiAgc2NhbGUuaW50ZXJwb2xhdG9yID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGludGVycG9sYXRvciA9IF8sIHNjYWxlKSA6IGludGVycG9sYXRvcjtcbiAgfTtcblxuICBzY2FsZS5yYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkb21haW4ubWFwKChkLCBpKSA9PiBpbnRlcnBvbGF0b3IoaSAvIChkb21haW4ubGVuZ3RoIC0gMSkpKTtcbiAgfTtcblxuICBzY2FsZS5xdWFudGlsZXMgPSBmdW5jdGlvbihuKSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oe2xlbmd0aDogbiArIDF9LCAoXywgaSkgPT4gcXVhbnRpbGUoZG9tYWluLCBpIC8gbikpO1xuICB9O1xuXG4gIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gc2VxdWVudGlhbFF1YW50aWxlKGludGVycG9sYXRvcikuZG9tYWluKGRvbWFpbik7XG4gIH07XG5cbiAgcmV0dXJuIGluaXRJbnRlcnBvbGF0b3IuYXBwbHkoc2NhbGUsIGFyZ3VtZW50cyk7XG59XG4iLCJpbXBvcnQge2ludGVycG9sYXRlLCBpbnRlcnBvbGF0ZVJvdW5kLCBwaWVjZXdpc2V9IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuaW1wb3J0IHtpZGVudGl0eX0gZnJvbSBcIi4vY29udGludW91cy5qc1wiO1xuaW1wb3J0IHtpbml0SW50ZXJwb2xhdG9yfSBmcm9tIFwiLi9pbml0LmpzXCI7XG5pbXBvcnQge2xpbmVhcmlzaH0gZnJvbSBcIi4vbGluZWFyLmpzXCI7XG5pbXBvcnQge2xvZ2dpc2h9IGZyb20gXCIuL2xvZy5qc1wiO1xuaW1wb3J0IHtjb3B5fSBmcm9tIFwiLi9zZXF1ZW50aWFsLmpzXCI7XG5pbXBvcnQge3N5bWxvZ2lzaH0gZnJvbSBcIi4vc3ltbG9nLmpzXCI7XG5pbXBvcnQge3Bvd2lzaH0gZnJvbSBcIi4vcG93LmpzXCI7XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybWVyKCkge1xuICB2YXIgeDAgPSAwLFxuICAgICAgeDEgPSAwLjUsXG4gICAgICB4MiA9IDEsXG4gICAgICBzID0gMSxcbiAgICAgIHQwLFxuICAgICAgdDEsXG4gICAgICB0MixcbiAgICAgIGsxMCxcbiAgICAgIGsyMSxcbiAgICAgIGludGVycG9sYXRvciA9IGlkZW50aXR5LFxuICAgICAgdHJhbnNmb3JtLFxuICAgICAgY2xhbXAgPSBmYWxzZSxcbiAgICAgIHVua25vd247XG5cbiAgZnVuY3Rpb24gc2NhbGUoeCkge1xuICAgIHJldHVybiBpc05hTih4ID0gK3gpID8gdW5rbm93biA6ICh4ID0gMC41ICsgKCh4ID0gK3RyYW5zZm9ybSh4KSkgLSB0MSkgKiAocyAqIHggPCBzICogdDEgPyBrMTAgOiBrMjEpLCBpbnRlcnBvbGF0b3IoY2xhbXAgPyBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCB4KSkgOiB4KSk7XG4gIH1cblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoW3gwLCB4MSwgeDJdID0gXywgdDAgPSB0cmFuc2Zvcm0oeDAgPSAreDApLCB0MSA9IHRyYW5zZm9ybSh4MSA9ICt4MSksIHQyID0gdHJhbnNmb3JtKHgyID0gK3gyKSwgazEwID0gdDAgPT09IHQxID8gMCA6IDAuNSAvICh0MSAtIHQwKSwgazIxID0gdDEgPT09IHQyID8gMCA6IDAuNSAvICh0MiAtIHQxKSwgcyA9IHQxIDwgdDAgPyAtMSA6IDEsIHNjYWxlKSA6IFt4MCwgeDEsIHgyXTtcbiAgfTtcblxuICBzY2FsZS5jbGFtcCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChjbGFtcCA9ICEhXywgc2NhbGUpIDogY2xhbXA7XG4gIH07XG5cbiAgc2NhbGUuaW50ZXJwb2xhdG9yID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGludGVycG9sYXRvciA9IF8sIHNjYWxlKSA6IGludGVycG9sYXRvcjtcbiAgfTtcblxuICBmdW5jdGlvbiByYW5nZShpbnRlcnBvbGF0ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbihfKSB7XG4gICAgICB2YXIgcjAsIHIxLCByMjtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKFtyMCwgcjEsIHIyXSA9IF8sIGludGVycG9sYXRvciA9IHBpZWNld2lzZShpbnRlcnBvbGF0ZSwgW3IwLCByMSwgcjJdKSwgc2NhbGUpIDogW2ludGVycG9sYXRvcigwKSwgaW50ZXJwb2xhdG9yKDAuNSksIGludGVycG9sYXRvcigxKV07XG4gICAgfTtcbiAgfVxuXG4gIHNjYWxlLnJhbmdlID0gcmFuZ2UoaW50ZXJwb2xhdGUpO1xuXG4gIHNjYWxlLnJhbmdlUm91bmQgPSByYW5nZShpbnRlcnBvbGF0ZVJvdW5kKTtcblxuICBzY2FsZS51bmtub3duID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHVua25vd24gPSBfLCBzY2FsZSkgOiB1bmtub3duO1xuICB9O1xuXG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdHJhbnNmb3JtID0gdCwgdDAgPSB0KHgwKSwgdDEgPSB0KHgxKSwgdDIgPSB0KHgyKSwgazEwID0gdDAgPT09IHQxID8gMCA6IDAuNSAvICh0MSAtIHQwKSwgazIxID0gdDEgPT09IHQyID8gMCA6IDAuNSAvICh0MiAtIHQxKSwgcyA9IHQxIDwgdDAgPyAtMSA6IDE7XG4gICAgcmV0dXJuIHNjYWxlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkaXZlcmdpbmcoKSB7XG4gIHZhciBzY2FsZSA9IGxpbmVhcmlzaCh0cmFuc2Zvcm1lcigpKGlkZW50aXR5KSk7XG5cbiAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjb3B5KHNjYWxlLCBkaXZlcmdpbmcoKSk7XG4gIH07XG5cbiAgcmV0dXJuIGluaXRJbnRlcnBvbGF0b3IuYXBwbHkoc2NhbGUsIGFyZ3VtZW50cyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXZlcmdpbmdMb2coKSB7XG4gIHZhciBzY2FsZSA9IGxvZ2dpc2godHJhbnNmb3JtZXIoKSkuZG9tYWluKFswLjEsIDEsIDEwXSk7XG5cbiAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjb3B5KHNjYWxlLCBkaXZlcmdpbmdMb2coKSkuYmFzZShzY2FsZS5iYXNlKCkpO1xuICB9O1xuXG4gIHJldHVybiBpbml0SW50ZXJwb2xhdG9yLmFwcGx5KHNjYWxlLCBhcmd1bWVudHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGl2ZXJnaW5nU3ltbG9nKCkge1xuICB2YXIgc2NhbGUgPSBzeW1sb2dpc2godHJhbnNmb3JtZXIoKSk7XG5cbiAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjb3B5KHNjYWxlLCBkaXZlcmdpbmdTeW1sb2coKSkuY29uc3RhbnQoc2NhbGUuY29uc3RhbnQoKSk7XG4gIH07XG5cbiAgcmV0dXJuIGluaXRJbnRlcnBvbGF0b3IuYXBwbHkoc2NhbGUsIGFyZ3VtZW50cyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXZlcmdpbmdQb3coKSB7XG4gIHZhciBzY2FsZSA9IHBvd2lzaCh0cmFuc2Zvcm1lcigpKTtcblxuICBzY2FsZS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNvcHkoc2NhbGUsIGRpdmVyZ2luZ1BvdygpKS5leHBvbmVudChzY2FsZS5leHBvbmVudCgpKTtcbiAgfTtcblxuICByZXR1cm4gaW5pdEludGVycG9sYXRvci5hcHBseShzY2FsZSwgYXJndW1lbnRzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpdmVyZ2luZ1NxcnQoKSB7XG4gIHJldHVybiBkaXZlcmdpbmdQb3cuYXBwbHkobnVsbCwgYXJndW1lbnRzKS5leHBvbmVudCgwLjUpO1xufVxuIiwiZXhwb3J0IHtcbiAgZGVmYXVsdCBhcyBzY2FsZUJhbmQsXG4gIHBvaW50IGFzIHNjYWxlUG9pbnRcbn0gZnJvbSBcIi4vYmFuZC5qc1wiO1xuXG5leHBvcnQge1xuICBkZWZhdWx0IGFzIHNjYWxlSWRlbnRpdHlcbn0gZnJvbSBcIi4vaWRlbnRpdHkuanNcIjtcblxuZXhwb3J0IHtcbiAgZGVmYXVsdCBhcyBzY2FsZUxpbmVhclxufSBmcm9tIFwiLi9saW5lYXIuanNcIjtcblxuZXhwb3J0IHtcbiAgZGVmYXVsdCBhcyBzY2FsZUxvZ1xufSBmcm9tIFwiLi9sb2cuanNcIjtcblxuZXhwb3J0IHtcbiAgZGVmYXVsdCBhcyBzY2FsZVN5bWxvZ1xufSBmcm9tIFwiLi9zeW1sb2cuanNcIjtcblxuZXhwb3J0IHtcbiAgZGVmYXVsdCBhcyBzY2FsZU9yZGluYWwsXG4gIGltcGxpY2l0IGFzIHNjYWxlSW1wbGljaXRcbn0gZnJvbSBcIi4vb3JkaW5hbC5qc1wiO1xuXG5leHBvcnQge1xuICBkZWZhdWx0IGFzIHNjYWxlUG93LFxuICBzcXJ0IGFzIHNjYWxlU3FydFxufSBmcm9tIFwiLi9wb3cuanNcIjtcblxuZXhwb3J0IHtcbiAgZGVmYXVsdCBhcyBzY2FsZVJhZGlhbFxufSBmcm9tIFwiLi9yYWRpYWwuanNcIjtcblxuZXhwb3J0IHtcbiAgZGVmYXVsdCBhcyBzY2FsZVF1YW50aWxlXG59IGZyb20gXCIuL3F1YW50aWxlLmpzXCI7XG5cbmV4cG9ydCB7XG4gIGRlZmF1bHQgYXMgc2NhbGVRdWFudGl6ZVxufSBmcm9tIFwiLi9xdWFudGl6ZS5qc1wiO1xuXG5leHBvcnQge1xuICBkZWZhdWx0IGFzIHNjYWxlVGhyZXNob2xkXG59IGZyb20gXCIuL3RocmVzaG9sZC5qc1wiO1xuXG5leHBvcnQge1xuICBkZWZhdWx0IGFzIHNjYWxlVGltZVxufSBmcm9tIFwiLi90aW1lLmpzXCI7XG5cbmV4cG9ydCB7XG4gIGRlZmF1bHQgYXMgc2NhbGVVdGNcbn0gZnJvbSBcIi4vdXRjVGltZS5qc1wiO1xuXG5leHBvcnQge1xuICBkZWZhdWx0IGFzIHNjYWxlU2VxdWVudGlhbCxcbiAgc2VxdWVudGlhbExvZyBhcyBzY2FsZVNlcXVlbnRpYWxMb2csXG4gIHNlcXVlbnRpYWxQb3cgYXMgc2NhbGVTZXF1ZW50aWFsUG93LFxuICBzZXF1ZW50aWFsU3FydCBhcyBzY2FsZVNlcXVlbnRpYWxTcXJ0LFxuICBzZXF1ZW50aWFsU3ltbG9nIGFzIHNjYWxlU2VxdWVudGlhbFN5bWxvZ1xufSBmcm9tIFwiLi9zZXF1ZW50aWFsLmpzXCI7XG5cbmV4cG9ydCB7XG4gIGRlZmF1bHQgYXMgc2NhbGVTZXF1ZW50aWFsUXVhbnRpbGVcbn0gZnJvbSBcIi4vc2VxdWVudGlhbFF1YW50aWxlLmpzXCI7XG5cbmV4cG9ydCB7XG4gIGRlZmF1bHQgYXMgc2NhbGVEaXZlcmdpbmcsXG4gIGRpdmVyZ2luZ0xvZyBhcyBzY2FsZURpdmVyZ2luZ0xvZyxcbiAgZGl2ZXJnaW5nUG93IGFzIHNjYWxlRGl2ZXJnaW5nUG93LFxuICBkaXZlcmdpbmdTcXJ0IGFzIHNjYWxlRGl2ZXJnaW5nU3FydCxcbiAgZGl2ZXJnaW5nU3ltbG9nIGFzIHNjYWxlRGl2ZXJnaW5nU3ltbG9nXG59IGZyb20gXCIuL2RpdmVyZ2luZy5qc1wiO1xuXG5leHBvcnQge1xuICBkZWZhdWx0IGFzIHRpY2tGb3JtYXRcbn0gZnJvbSBcIi4vdGlja0Zvcm1hdC5qc1wiO1xuIiwiY29uc3QgdDAgPSBuZXcgRGF0ZSwgdDEgPSBuZXcgRGF0ZTtcblxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVJbnRlcnZhbChmbG9vcmksIG9mZnNldGksIGNvdW50LCBmaWVsZCkge1xuXG4gIGZ1bmN0aW9uIGludGVydmFsKGRhdGUpIHtcbiAgICByZXR1cm4gZmxvb3JpKGRhdGUgPSBhcmd1bWVudHMubGVuZ3RoID09PSAwID8gbmV3IERhdGUgOiBuZXcgRGF0ZSgrZGF0ZSkpLCBkYXRlO1xuICB9XG5cbiAgaW50ZXJ2YWwuZmxvb3IgPSAoZGF0ZSkgPT4ge1xuICAgIHJldHVybiBmbG9vcmkoZGF0ZSA9IG5ldyBEYXRlKCtkYXRlKSksIGRhdGU7XG4gIH07XG5cbiAgaW50ZXJ2YWwuY2VpbCA9IChkYXRlKSA9PiB7XG4gICAgcmV0dXJuIGZsb29yaShkYXRlID0gbmV3IERhdGUoZGF0ZSAtIDEpKSwgb2Zmc2V0aShkYXRlLCAxKSwgZmxvb3JpKGRhdGUpLCBkYXRlO1xuICB9O1xuXG4gIGludGVydmFsLnJvdW5kID0gKGRhdGUpID0+IHtcbiAgICBjb25zdCBkMCA9IGludGVydmFsKGRhdGUpLCBkMSA9IGludGVydmFsLmNlaWwoZGF0ZSk7XG4gICAgcmV0dXJuIGRhdGUgLSBkMCA8IGQxIC0gZGF0ZSA/IGQwIDogZDE7XG4gIH07XG5cbiAgaW50ZXJ2YWwub2Zmc2V0ID0gKGRhdGUsIHN0ZXApID0+IHtcbiAgICByZXR1cm4gb2Zmc2V0aShkYXRlID0gbmV3IERhdGUoK2RhdGUpLCBzdGVwID09IG51bGwgPyAxIDogTWF0aC5mbG9vcihzdGVwKSksIGRhdGU7XG4gIH07XG5cbiAgaW50ZXJ2YWwucmFuZ2UgPSAoc3RhcnQsIHN0b3AsIHN0ZXApID0+IHtcbiAgICBjb25zdCByYW5nZSA9IFtdO1xuICAgIHN0YXJ0ID0gaW50ZXJ2YWwuY2VpbChzdGFydCk7XG4gICAgc3RlcCA9IHN0ZXAgPT0gbnVsbCA/IDEgOiBNYXRoLmZsb29yKHN0ZXApO1xuICAgIGlmICghKHN0YXJ0IDwgc3RvcCkgfHwgIShzdGVwID4gMCkpIHJldHVybiByYW5nZTsgLy8gYWxzbyBoYW5kbGVzIEludmFsaWQgRGF0ZVxuICAgIGxldCBwcmV2aW91cztcbiAgICBkbyByYW5nZS5wdXNoKHByZXZpb3VzID0gbmV3IERhdGUoK3N0YXJ0KSksIG9mZnNldGkoc3RhcnQsIHN0ZXApLCBmbG9vcmkoc3RhcnQpO1xuICAgIHdoaWxlIChwcmV2aW91cyA8IHN0YXJ0ICYmIHN0YXJ0IDwgc3RvcCk7XG4gICAgcmV0dXJuIHJhbmdlO1xuICB9O1xuXG4gIGludGVydmFsLmZpbHRlciA9ICh0ZXN0KSA9PiB7XG4gICAgcmV0dXJuIHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICAgICAgaWYgKGRhdGUgPj0gZGF0ZSkgd2hpbGUgKGZsb29yaShkYXRlKSwgIXRlc3QoZGF0ZSkpIGRhdGUuc2V0VGltZShkYXRlIC0gMSk7XG4gICAgfSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgICAgIGlmIChkYXRlID49IGRhdGUpIHtcbiAgICAgICAgaWYgKHN0ZXAgPCAwKSB3aGlsZSAoKytzdGVwIDw9IDApIHtcbiAgICAgICAgICB3aGlsZSAob2Zmc2V0aShkYXRlLCAtMSksICF0ZXN0KGRhdGUpKSB7fSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWVtcHR5XG4gICAgICAgIH0gZWxzZSB3aGlsZSAoLS1zdGVwID49IDApIHtcbiAgICAgICAgICB3aGlsZSAob2Zmc2V0aShkYXRlLCArMSksICF0ZXN0KGRhdGUpKSB7fSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWVtcHR5XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBpZiAoY291bnQpIHtcbiAgICBpbnRlcnZhbC5jb3VudCA9IChzdGFydCwgZW5kKSA9PiB7XG4gICAgICB0MC5zZXRUaW1lKCtzdGFydCksIHQxLnNldFRpbWUoK2VuZCk7XG4gICAgICBmbG9vcmkodDApLCBmbG9vcmkodDEpO1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IoY291bnQodDAsIHQxKSk7XG4gICAgfTtcblxuICAgIGludGVydmFsLmV2ZXJ5ID0gKHN0ZXApID0+IHtcbiAgICAgIHN0ZXAgPSBNYXRoLmZsb29yKHN0ZXApO1xuICAgICAgcmV0dXJuICFpc0Zpbml0ZShzdGVwKSB8fCAhKHN0ZXAgPiAwKSA/IG51bGxcbiAgICAgICAgICA6ICEoc3RlcCA+IDEpID8gaW50ZXJ2YWxcbiAgICAgICAgICA6IGludGVydmFsLmZpbHRlcihmaWVsZFxuICAgICAgICAgICAgICA/IChkKSA9PiBmaWVsZChkKSAlIHN0ZXAgPT09IDBcbiAgICAgICAgICAgICAgOiAoZCkgPT4gaW50ZXJ2YWwuY291bnQoMCwgZCkgJSBzdGVwID09PSAwKTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGludGVydmFsO1xufVxuIiwiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBtaWxsaXNlY29uZCA9IHRpbWVJbnRlcnZhbCgoKSA9PiB7XG4gIC8vIG5vb3Bcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VGltZSgrZGF0ZSArIHN0ZXApO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIGVuZCAtIHN0YXJ0O1xufSk7XG5cbi8vIEFuIG9wdGltaXplZCBpbXBsZW1lbnRhdGlvbiBmb3IgdGhpcyBzaW1wbGUgY2FzZS5cbm1pbGxpc2Vjb25kLmV2ZXJ5ID0gKGspID0+IHtcbiAgayA9IE1hdGguZmxvb3Ioayk7XG4gIGlmICghaXNGaW5pdGUoaykgfHwgIShrID4gMCkpIHJldHVybiBudWxsO1xuICBpZiAoIShrID4gMSkpIHJldHVybiBtaWxsaXNlY29uZDtcbiAgcmV0dXJuIHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICAgIGRhdGUuc2V0VGltZShNYXRoLmZsb29yKGRhdGUgLyBrKSAqIGspO1xuICB9LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgIGRhdGUuc2V0VGltZSgrZGF0ZSArIHN0ZXAgKiBrKTtcbiAgfSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIGs7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IG1pbGxpc2Vjb25kcyA9IG1pbGxpc2Vjb25kLnJhbmdlO1xuIiwiZXhwb3J0IGNvbnN0IGR1cmF0aW9uU2Vjb25kID0gMTAwMDtcbmV4cG9ydCBjb25zdCBkdXJhdGlvbk1pbnV0ZSA9IGR1cmF0aW9uU2Vjb25kICogNjA7XG5leHBvcnQgY29uc3QgZHVyYXRpb25Ib3VyID0gZHVyYXRpb25NaW51dGUgKiA2MDtcbmV4cG9ydCBjb25zdCBkdXJhdGlvbkRheSA9IGR1cmF0aW9uSG91ciAqIDI0O1xuZXhwb3J0IGNvbnN0IGR1cmF0aW9uV2VlayA9IGR1cmF0aW9uRGF5ICogNztcbmV4cG9ydCBjb25zdCBkdXJhdGlvbk1vbnRoID0gZHVyYXRpb25EYXkgKiAzMDtcbmV4cG9ydCBjb25zdCBkdXJhdGlvblllYXIgPSBkdXJhdGlvbkRheSAqIDM2NTtcbiIsImltcG9ydCB7dGltZUludGVydmFsfSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuaW1wb3J0IHtkdXJhdGlvblNlY29uZH0gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcblxuZXhwb3J0IGNvbnN0IHNlY29uZCA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldFRpbWUoZGF0ZSAtIGRhdGUuZ2V0TWlsbGlzZWNvbmRzKCkpO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCAqIGR1cmF0aW9uU2Vjb25kKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gZHVyYXRpb25TZWNvbmQ7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRVVENTZWNvbmRzKCk7XG59KTtcblxuZXhwb3J0IGNvbnN0IHNlY29uZHMgPSBzZWNvbmQucmFuZ2U7XG4iLCJpbXBvcnQge3RpbWVJbnRlcnZhbH0gZnJvbSBcIi4vaW50ZXJ2YWwuanNcIjtcbmltcG9ydCB7ZHVyYXRpb25NaW51dGUsIGR1cmF0aW9uU2Vjb25kfSBmcm9tIFwiLi9kdXJhdGlvbi5qc1wiO1xuXG5leHBvcnQgY29uc3QgdGltZU1pbnV0ZSA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldFRpbWUoZGF0ZSAtIGRhdGUuZ2V0TWlsbGlzZWNvbmRzKCkgLSBkYXRlLmdldFNlY29uZHMoKSAqIGR1cmF0aW9uU2Vjb25kKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VGltZSgrZGF0ZSArIHN0ZXAgKiBkdXJhdGlvbk1pbnV0ZSk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIGR1cmF0aW9uTWludXRlO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0TWludXRlcygpO1xufSk7XG5cbmV4cG9ydCBjb25zdCB0aW1lTWludXRlcyA9IHRpbWVNaW51dGUucmFuZ2U7XG5cbmV4cG9ydCBjb25zdCB1dGNNaW51dGUgPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRVVENTZWNvbmRzKDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCAqIGR1cmF0aW9uTWludXRlKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gZHVyYXRpb25NaW51dGU7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRVVENNaW51dGVzKCk7XG59KTtcblxuZXhwb3J0IGNvbnN0IHV0Y01pbnV0ZXMgPSB1dGNNaW51dGUucmFuZ2U7XG4iLCJpbXBvcnQge3RpbWVJbnRlcnZhbH0gZnJvbSBcIi4vaW50ZXJ2YWwuanNcIjtcbmltcG9ydCB7ZHVyYXRpb25Ib3VyLCBkdXJhdGlvbk1pbnV0ZSwgZHVyYXRpb25TZWNvbmR9IGZyb20gXCIuL2R1cmF0aW9uLmpzXCI7XG5cbmV4cG9ydCBjb25zdCB0aW1lSG91ciA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldFRpbWUoZGF0ZSAtIGRhdGUuZ2V0TWlsbGlzZWNvbmRzKCkgLSBkYXRlLmdldFNlY29uZHMoKSAqIGR1cmF0aW9uU2Vjb25kIC0gZGF0ZS5nZXRNaW51dGVzKCkgKiBkdXJhdGlvbk1pbnV0ZSk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwICogZHVyYXRpb25Ib3VyKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gZHVyYXRpb25Ib3VyO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0SG91cnMoKTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdGltZUhvdXJzID0gdGltZUhvdXIucmFuZ2U7XG5cbmV4cG9ydCBjb25zdCB1dGNIb3VyID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VVRDTWludXRlcygwLCAwLCAwKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VGltZSgrZGF0ZSArIHN0ZXAgKiBkdXJhdGlvbkhvdXIpO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvbkhvdXI7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRVVENIb3VycygpO1xufSk7XG5cbmV4cG9ydCBjb25zdCB1dGNIb3VycyA9IHV0Y0hvdXIucmFuZ2U7XG4iLCJpbXBvcnQge3RpbWVJbnRlcnZhbH0gZnJvbSBcIi4vaW50ZXJ2YWwuanNcIjtcbmltcG9ydCB7ZHVyYXRpb25EYXksIGR1cmF0aW9uTWludXRlfSBmcm9tIFwiLi9kdXJhdGlvbi5qc1wiO1xuXG5leHBvcnQgY29uc3QgdGltZURheSA9IHRpbWVJbnRlcnZhbChcbiAgZGF0ZSA9PiBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApLFxuICAoZGF0ZSwgc3RlcCkgPT4gZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpICsgc3RlcCksXG4gIChzdGFydCwgZW5kKSA9PiAoZW5kIC0gc3RhcnQgLSAoZW5kLmdldFRpbWV6b25lT2Zmc2V0KCkgLSBzdGFydC5nZXRUaW1lem9uZU9mZnNldCgpKSAqIGR1cmF0aW9uTWludXRlKSAvIGR1cmF0aW9uRGF5LFxuICBkYXRlID0+IGRhdGUuZ2V0RGF0ZSgpIC0gMVxuKTtcblxuZXhwb3J0IGNvbnN0IHRpbWVEYXlzID0gdGltZURheS5yYW5nZTtcblxuZXhwb3J0IGNvbnN0IHV0Y0RheSA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRVVENEYXRlKGRhdGUuZ2V0VVRDRGF0ZSgpICsgc3RlcCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIGR1cmF0aW9uRGF5O1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0VVRDRGF0ZSgpIC0gMTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdXRjRGF5cyA9IHV0Y0RheS5yYW5nZTtcblxuZXhwb3J0IGNvbnN0IHVuaXhEYXkgPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VVRDRGF0ZShkYXRlLmdldFVUQ0RhdGUoKSArIHN0ZXApO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvbkRheTtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBNYXRoLmZsb29yKGRhdGUgLyBkdXJhdGlvbkRheSk7XG59KTtcblxuZXhwb3J0IGNvbnN0IHVuaXhEYXlzID0gdW5peERheS5yYW5nZTtcbiIsImltcG9ydCB7dGltZUludGVydmFsfSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuaW1wb3J0IHtkdXJhdGlvbk1pbnV0ZSwgZHVyYXRpb25XZWVrfSBmcm9tIFwiLi9kdXJhdGlvbi5qc1wiO1xuXG5mdW5jdGlvbiB0aW1lV2Vla2RheShpKSB7XG4gIHJldHVybiB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgLSAoZGF0ZS5nZXREYXkoKSArIDcgLSBpKSAlIDcpO1xuICAgIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG4gIH0sIChkYXRlLCBzdGVwKSA9PiB7XG4gICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpICsgc3RlcCAqIDcpO1xuICB9LCAoc3RhcnQsIGVuZCkgPT4ge1xuICAgIHJldHVybiAoZW5kIC0gc3RhcnQgLSAoZW5kLmdldFRpbWV6b25lT2Zmc2V0KCkgLSBzdGFydC5nZXRUaW1lem9uZU9mZnNldCgpKSAqIGR1cmF0aW9uTWludXRlKSAvIGR1cmF0aW9uV2VlaztcbiAgfSk7XG59XG5cbmV4cG9ydCBjb25zdCB0aW1lU3VuZGF5ID0gdGltZVdlZWtkYXkoMCk7XG5leHBvcnQgY29uc3QgdGltZU1vbmRheSA9IHRpbWVXZWVrZGF5KDEpO1xuZXhwb3J0IGNvbnN0IHRpbWVUdWVzZGF5ID0gdGltZVdlZWtkYXkoMik7XG5leHBvcnQgY29uc3QgdGltZVdlZG5lc2RheSA9IHRpbWVXZWVrZGF5KDMpO1xuZXhwb3J0IGNvbnN0IHRpbWVUaHVyc2RheSA9IHRpbWVXZWVrZGF5KDQpO1xuZXhwb3J0IGNvbnN0IHRpbWVGcmlkYXkgPSB0aW1lV2Vla2RheSg1KTtcbmV4cG9ydCBjb25zdCB0aW1lU2F0dXJkYXkgPSB0aW1lV2Vla2RheSg2KTtcblxuZXhwb3J0IGNvbnN0IHRpbWVTdW5kYXlzID0gdGltZVN1bmRheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB0aW1lTW9uZGF5cyA9IHRpbWVNb25kYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdGltZVR1ZXNkYXlzID0gdGltZVR1ZXNkYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdGltZVdlZG5lc2RheXMgPSB0aW1lV2VkbmVzZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHRpbWVUaHVyc2RheXMgPSB0aW1lVGh1cnNkYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdGltZUZyaWRheXMgPSB0aW1lRnJpZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHRpbWVTYXR1cmRheXMgPSB0aW1lU2F0dXJkYXkucmFuZ2U7XG5cbmZ1bmN0aW9uIHV0Y1dlZWtkYXkoaSkge1xuICByZXR1cm4gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gICAgZGF0ZS5zZXRVVENEYXRlKGRhdGUuZ2V0VVRDRGF0ZSgpIC0gKGRhdGUuZ2V0VVRDRGF5KCkgKyA3IC0gaSkgJSA3KTtcbiAgICBkYXRlLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xuICB9LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgIGRhdGUuc2V0VVRDRGF0ZShkYXRlLmdldFVUQ0RhdGUoKSArIHN0ZXAgKiA3KTtcbiAgfSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIGR1cmF0aW9uV2VlaztcbiAgfSk7XG59XG5cbmV4cG9ydCBjb25zdCB1dGNTdW5kYXkgPSB1dGNXZWVrZGF5KDApO1xuZXhwb3J0IGNvbnN0IHV0Y01vbmRheSA9IHV0Y1dlZWtkYXkoMSk7XG5leHBvcnQgY29uc3QgdXRjVHVlc2RheSA9IHV0Y1dlZWtkYXkoMik7XG5leHBvcnQgY29uc3QgdXRjV2VkbmVzZGF5ID0gdXRjV2Vla2RheSgzKTtcbmV4cG9ydCBjb25zdCB1dGNUaHVyc2RheSA9IHV0Y1dlZWtkYXkoNCk7XG5leHBvcnQgY29uc3QgdXRjRnJpZGF5ID0gdXRjV2Vla2RheSg1KTtcbmV4cG9ydCBjb25zdCB1dGNTYXR1cmRheSA9IHV0Y1dlZWtkYXkoNik7XG5cbmV4cG9ydCBjb25zdCB1dGNTdW5kYXlzID0gdXRjU3VuZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHV0Y01vbmRheXMgPSB1dGNNb25kYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdXRjVHVlc2RheXMgPSB1dGNUdWVzZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHV0Y1dlZG5lc2RheXMgPSB1dGNXZWRuZXNkYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdXRjVGh1cnNkYXlzID0gdXRjVGh1cnNkYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdXRjRnJpZGF5cyA9IHV0Y0ZyaWRheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB1dGNTYXR1cmRheXMgPSB1dGNTYXR1cmRheS5yYW5nZTtcbiIsImltcG9ydCB7dGltZUludGVydmFsfSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuXG5leHBvcnQgY29uc3QgdGltZU1vbnRoID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0RGF0ZSgxKTtcbiAgZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0TW9udGgoZGF0ZS5nZXRNb250aCgpICsgc3RlcCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gZW5kLmdldE1vbnRoKCkgLSBzdGFydC5nZXRNb250aCgpICsgKGVuZC5nZXRGdWxsWWVhcigpIC0gc3RhcnQuZ2V0RnVsbFllYXIoKSkgKiAxMjtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldE1vbnRoKCk7XG59KTtcblxuZXhwb3J0IGNvbnN0IHRpbWVNb250aHMgPSB0aW1lTW9udGgucmFuZ2U7XG5cbmV4cG9ydCBjb25zdCB1dGNNb250aCA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldFVUQ0RhdGUoMSk7XG4gIGRhdGUuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFVUQ01vbnRoKGRhdGUuZ2V0VVRDTW9udGgoKSArIHN0ZXApO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIGVuZC5nZXRVVENNb250aCgpIC0gc3RhcnQuZ2V0VVRDTW9udGgoKSArIChlbmQuZ2V0VVRDRnVsbFllYXIoKSAtIHN0YXJ0LmdldFVUQ0Z1bGxZZWFyKCkpICogMTI7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRVVENNb250aCgpO1xufSk7XG5cbmV4cG9ydCBjb25zdCB1dGNNb250aHMgPSB1dGNNb250aC5yYW5nZTtcbiIsImltcG9ydCB7dGltZUludGVydmFsfSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuXG5leHBvcnQgY29uc3QgdGltZVllYXIgPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRNb250aCgwLCAxKTtcbiAgZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0RnVsbFllYXIoZGF0ZS5nZXRGdWxsWWVhcigpICsgc3RlcCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gZW5kLmdldEZ1bGxZZWFyKCkgLSBzdGFydC5nZXRGdWxsWWVhcigpO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0RnVsbFllYXIoKTtcbn0pO1xuXG4vLyBBbiBvcHRpbWl6ZWQgaW1wbGVtZW50YXRpb24gZm9yIHRoaXMgc2ltcGxlIGNhc2UuXG50aW1lWWVhci5ldmVyeSA9IChrKSA9PiB7XG4gIHJldHVybiAhaXNGaW5pdGUoayA9IE1hdGguZmxvb3IoaykpIHx8ICEoayA+IDApID8gbnVsbCA6IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICAgIGRhdGUuc2V0RnVsbFllYXIoTWF0aC5mbG9vcihkYXRlLmdldEZ1bGxZZWFyKCkgLyBrKSAqIGspO1xuICAgIGRhdGUuc2V0TW9udGgoMCwgMSk7XG4gICAgZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgfSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgICBkYXRlLnNldEZ1bGxZZWFyKGRhdGUuZ2V0RnVsbFllYXIoKSArIHN0ZXAgKiBrKTtcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgdGltZVllYXJzID0gdGltZVllYXIucmFuZ2U7XG5cbmV4cG9ydCBjb25zdCB1dGNZZWFyID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VVRDTW9udGgoMCwgMSk7XG4gIGRhdGUuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFVUQ0Z1bGxZZWFyKGRhdGUuZ2V0VVRDRnVsbFllYXIoKSArIHN0ZXApO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIGVuZC5nZXRVVENGdWxsWWVhcigpIC0gc3RhcnQuZ2V0VVRDRnVsbFllYXIoKTtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldFVUQ0Z1bGxZZWFyKCk7XG59KTtcblxuLy8gQW4gb3B0aW1pemVkIGltcGxlbWVudGF0aW9uIGZvciB0aGlzIHNpbXBsZSBjYXNlLlxudXRjWWVhci5ldmVyeSA9IChrKSA9PiB7XG4gIHJldHVybiAhaXNGaW5pdGUoayA9IE1hdGguZmxvb3IoaykpIHx8ICEoayA+IDApID8gbnVsbCA6IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICAgIGRhdGUuc2V0VVRDRnVsbFllYXIoTWF0aC5mbG9vcihkYXRlLmdldFVUQ0Z1bGxZZWFyKCkgLyBrKSAqIGspO1xuICAgIGRhdGUuc2V0VVRDTW9udGgoMCwgMSk7XG4gICAgZGF0ZS5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbiAgfSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgICBkYXRlLnNldFVUQ0Z1bGxZZWFyKGRhdGUuZ2V0VVRDRnVsbFllYXIoKSArIHN0ZXAgKiBrKTtcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgdXRjWWVhcnMgPSB1dGNZZWFyLnJhbmdlO1xuIiwiaW1wb3J0IHtiaXNlY3RvciwgdGlja1N0ZXB9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtkdXJhdGlvbkRheSwgZHVyYXRpb25Ib3VyLCBkdXJhdGlvbk1pbnV0ZSwgZHVyYXRpb25Nb250aCwgZHVyYXRpb25TZWNvbmQsIGR1cmF0aW9uV2VlaywgZHVyYXRpb25ZZWFyfSBmcm9tIFwiLi9kdXJhdGlvbi5qc1wiO1xuaW1wb3J0IHttaWxsaXNlY29uZH0gZnJvbSBcIi4vbWlsbGlzZWNvbmQuanNcIjtcbmltcG9ydCB7c2Vjb25kfSBmcm9tIFwiLi9zZWNvbmQuanNcIjtcbmltcG9ydCB7dGltZU1pbnV0ZSwgdXRjTWludXRlfSBmcm9tIFwiLi9taW51dGUuanNcIjtcbmltcG9ydCB7dGltZUhvdXIsIHV0Y0hvdXJ9IGZyb20gXCIuL2hvdXIuanNcIjtcbmltcG9ydCB7dGltZURheSwgdW5peERheX0gZnJvbSBcIi4vZGF5LmpzXCI7XG5pbXBvcnQge3RpbWVTdW5kYXksIHV0Y1N1bmRheX0gZnJvbSBcIi4vd2Vlay5qc1wiO1xuaW1wb3J0IHt0aW1lTW9udGgsIHV0Y01vbnRofSBmcm9tIFwiLi9tb250aC5qc1wiO1xuaW1wb3J0IHt0aW1lWWVhciwgdXRjWWVhcn0gZnJvbSBcIi4veWVhci5qc1wiO1xuXG5mdW5jdGlvbiB0aWNrZXIoeWVhciwgbW9udGgsIHdlZWssIGRheSwgaG91ciwgbWludXRlKSB7XG5cbiAgY29uc3QgdGlja0ludGVydmFscyA9IFtcbiAgICBbc2Vjb25kLCAgMSwgICAgICBkdXJhdGlvblNlY29uZF0sXG4gICAgW3NlY29uZCwgIDUsICA1ICogZHVyYXRpb25TZWNvbmRdLFxuICAgIFtzZWNvbmQsIDE1LCAxNSAqIGR1cmF0aW9uU2Vjb25kXSxcbiAgICBbc2Vjb25kLCAzMCwgMzAgKiBkdXJhdGlvblNlY29uZF0sXG4gICAgW21pbnV0ZSwgIDEsICAgICAgZHVyYXRpb25NaW51dGVdLFxuICAgIFttaW51dGUsICA1LCAgNSAqIGR1cmF0aW9uTWludXRlXSxcbiAgICBbbWludXRlLCAxNSwgMTUgKiBkdXJhdGlvbk1pbnV0ZV0sXG4gICAgW21pbnV0ZSwgMzAsIDMwICogZHVyYXRpb25NaW51dGVdLFxuICAgIFsgIGhvdXIsICAxLCAgICAgIGR1cmF0aW9uSG91ciAgXSxcbiAgICBbICBob3VyLCAgMywgIDMgKiBkdXJhdGlvbkhvdXIgIF0sXG4gICAgWyAgaG91ciwgIDYsICA2ICogZHVyYXRpb25Ib3VyICBdLFxuICAgIFsgIGhvdXIsIDEyLCAxMiAqIGR1cmF0aW9uSG91ciAgXSxcbiAgICBbICAgZGF5LCAgMSwgICAgICBkdXJhdGlvbkRheSAgIF0sXG4gICAgWyAgIGRheSwgIDIsICAyICogZHVyYXRpb25EYXkgICBdLFxuICAgIFsgIHdlZWssICAxLCAgICAgIGR1cmF0aW9uV2VlayAgXSxcbiAgICBbIG1vbnRoLCAgMSwgICAgICBkdXJhdGlvbk1vbnRoIF0sXG4gICAgWyBtb250aCwgIDMsICAzICogZHVyYXRpb25Nb250aCBdLFxuICAgIFsgIHllYXIsICAxLCAgICAgIGR1cmF0aW9uWWVhciAgXVxuICBdO1xuXG4gIGZ1bmN0aW9uIHRpY2tzKHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICAgIGNvbnN0IHJldmVyc2UgPSBzdG9wIDwgc3RhcnQ7XG4gICAgaWYgKHJldmVyc2UpIFtzdGFydCwgc3RvcF0gPSBbc3RvcCwgc3RhcnRdO1xuICAgIGNvbnN0IGludGVydmFsID0gY291bnQgJiYgdHlwZW9mIGNvdW50LnJhbmdlID09PSBcImZ1bmN0aW9uXCIgPyBjb3VudCA6IHRpY2tJbnRlcnZhbChzdGFydCwgc3RvcCwgY291bnQpO1xuICAgIGNvbnN0IHRpY2tzID0gaW50ZXJ2YWwgPyBpbnRlcnZhbC5yYW5nZShzdGFydCwgK3N0b3AgKyAxKSA6IFtdOyAvLyBpbmNsdXNpdmUgc3RvcFxuICAgIHJldHVybiByZXZlcnNlID8gdGlja3MucmV2ZXJzZSgpIDogdGlja3M7XG4gIH1cblxuICBmdW5jdGlvbiB0aWNrSW50ZXJ2YWwoc3RhcnQsIHN0b3AsIGNvdW50KSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gTWF0aC5hYnMoc3RvcCAtIHN0YXJ0KSAvIGNvdW50O1xuICAgIGNvbnN0IGkgPSBiaXNlY3RvcigoWywsIHN0ZXBdKSA9PiBzdGVwKS5yaWdodCh0aWNrSW50ZXJ2YWxzLCB0YXJnZXQpO1xuICAgIGlmIChpID09PSB0aWNrSW50ZXJ2YWxzLmxlbmd0aCkgcmV0dXJuIHllYXIuZXZlcnkodGlja1N0ZXAoc3RhcnQgLyBkdXJhdGlvblllYXIsIHN0b3AgLyBkdXJhdGlvblllYXIsIGNvdW50KSk7XG4gICAgaWYgKGkgPT09IDApIHJldHVybiBtaWxsaXNlY29uZC5ldmVyeShNYXRoLm1heCh0aWNrU3RlcChzdGFydCwgc3RvcCwgY291bnQpLCAxKSk7XG4gICAgY29uc3QgW3QsIHN0ZXBdID0gdGlja0ludGVydmFsc1t0YXJnZXQgLyB0aWNrSW50ZXJ2YWxzW2kgLSAxXVsyXSA8IHRpY2tJbnRlcnZhbHNbaV1bMl0gLyB0YXJnZXQgPyBpIC0gMSA6IGldO1xuICAgIHJldHVybiB0LmV2ZXJ5KHN0ZXApO1xuICB9XG5cbiAgcmV0dXJuIFt0aWNrcywgdGlja0ludGVydmFsXTtcbn1cblxuY29uc3QgW3V0Y1RpY2tzLCB1dGNUaWNrSW50ZXJ2YWxdID0gdGlja2VyKHV0Y1llYXIsIHV0Y01vbnRoLCB1dGNTdW5kYXksIHVuaXhEYXksIHV0Y0hvdXIsIHV0Y01pbnV0ZSk7XG5jb25zdCBbdGltZVRpY2tzLCB0aW1lVGlja0ludGVydmFsXSA9IHRpY2tlcih0aW1lWWVhciwgdGltZU1vbnRoLCB0aW1lU3VuZGF5LCB0aW1lRGF5LCB0aW1lSG91ciwgdGltZU1pbnV0ZSk7XG5cbmV4cG9ydCB7dXRjVGlja3MsIHV0Y1RpY2tJbnRlcnZhbCwgdGltZVRpY2tzLCB0aW1lVGlja0ludGVydmFsfTtcbiIsImV4cG9ydCB7XG4gIHRpbWVJbnRlcnZhbFxufSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuXG5leHBvcnQge1xuICBtaWxsaXNlY29uZCBhcyB1dGNNaWxsaXNlY29uZCxcbiAgbWlsbGlzZWNvbmRzIGFzIHV0Y01pbGxpc2Vjb25kcyxcbiAgbWlsbGlzZWNvbmQgYXMgdGltZU1pbGxpc2Vjb25kLFxuICBtaWxsaXNlY29uZHMgYXMgdGltZU1pbGxpc2Vjb25kc1xufSBmcm9tIFwiLi9taWxsaXNlY29uZC5qc1wiO1xuXG5leHBvcnQge1xuICBzZWNvbmQgYXMgdXRjU2Vjb25kLFxuICBzZWNvbmRzIGFzIHV0Y1NlY29uZHMsXG4gIHNlY29uZCBhcyB0aW1lU2Vjb25kLFxuICBzZWNvbmRzIGFzIHRpbWVTZWNvbmRzXG59IGZyb20gXCIuL3NlY29uZC5qc1wiO1xuXG5leHBvcnQge1xuICB0aW1lTWludXRlLFxuICB0aW1lTWludXRlcyxcbiAgdXRjTWludXRlLFxuICB1dGNNaW51dGVzXG59IGZyb20gXCIuL21pbnV0ZS5qc1wiO1xuXG5leHBvcnQge1xuICB0aW1lSG91cixcbiAgdGltZUhvdXJzLFxuICB1dGNIb3VyLFxuICB1dGNIb3Vyc1xufSBmcm9tIFwiLi9ob3VyLmpzXCI7XG5cbmV4cG9ydCB7XG4gIHRpbWVEYXksXG4gIHRpbWVEYXlzLFxuICB1dGNEYXksXG4gIHV0Y0RheXMsXG4gIHVuaXhEYXksXG4gIHVuaXhEYXlzXG59IGZyb20gXCIuL2RheS5qc1wiO1xuXG5leHBvcnQge1xuICB0aW1lU3VuZGF5IGFzIHRpbWVXZWVrLFxuICB0aW1lU3VuZGF5cyBhcyB0aW1lV2Vla3MsXG4gIHRpbWVTdW5kYXksXG4gIHRpbWVTdW5kYXlzLFxuICB0aW1lTW9uZGF5LFxuICB0aW1lTW9uZGF5cyxcbiAgdGltZVR1ZXNkYXksXG4gIHRpbWVUdWVzZGF5cyxcbiAgdGltZVdlZG5lc2RheSxcbiAgdGltZVdlZG5lc2RheXMsXG4gIHRpbWVUaHVyc2RheSxcbiAgdGltZVRodXJzZGF5cyxcbiAgdGltZUZyaWRheSxcbiAgdGltZUZyaWRheXMsXG4gIHRpbWVTYXR1cmRheSxcbiAgdGltZVNhdHVyZGF5cyxcbiAgdXRjU3VuZGF5IGFzIHV0Y1dlZWssXG4gIHV0Y1N1bmRheXMgYXMgdXRjV2Vla3MsXG4gIHV0Y1N1bmRheSxcbiAgdXRjU3VuZGF5cyxcbiAgdXRjTW9uZGF5LFxuICB1dGNNb25kYXlzLFxuICB1dGNUdWVzZGF5LFxuICB1dGNUdWVzZGF5cyxcbiAgdXRjV2VkbmVzZGF5LFxuICB1dGNXZWRuZXNkYXlzLFxuICB1dGNUaHVyc2RheSxcbiAgdXRjVGh1cnNkYXlzLFxuICB1dGNGcmlkYXksXG4gIHV0Y0ZyaWRheXMsXG4gIHV0Y1NhdHVyZGF5LFxuICB1dGNTYXR1cmRheXNcbn0gZnJvbSBcIi4vd2Vlay5qc1wiO1xuXG5leHBvcnQge1xuICB0aW1lTW9udGgsXG4gIHRpbWVNb250aHMsXG4gIHV0Y01vbnRoLFxuICB1dGNNb250aHNcbn0gZnJvbSBcIi4vbW9udGguanNcIjtcblxuZXhwb3J0IHtcbiAgdGltZVllYXIsXG4gIHRpbWVZZWFycyxcbiAgdXRjWWVhcixcbiAgdXRjWWVhcnNcbn0gZnJvbSBcIi4veWVhci5qc1wiO1xuXG5leHBvcnQge1xuICB1dGNUaWNrcyxcbiAgdXRjVGlja0ludGVydmFsLFxuICB0aW1lVGlja3MsXG4gIHRpbWVUaWNrSW50ZXJ2YWxcbn0gZnJvbSBcIi4vdGlja3MuanNcIjtcbiIsImV4cG9ydCB2YXIgeGh0bWwgPSBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBzdmc6IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIixcbiAgeGh0bWw6IHhodG1sLFxuICB4bGluazogXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsXG4gIHhtbDogXCJodHRwOi8vd3d3LnczLm9yZy9YTUwvMTk5OC9uYW1lc3BhY2VcIixcbiAgeG1sbnM6IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC94bWxucy9cIlxufTtcbiIsImltcG9ydCBuYW1lc3BhY2VzIGZyb20gXCIuL25hbWVzcGFjZXMuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICB2YXIgcHJlZml4ID0gbmFtZSArPSBcIlwiLCBpID0gcHJlZml4LmluZGV4T2YoXCI6XCIpO1xuICBpZiAoaSA+PSAwICYmIChwcmVmaXggPSBuYW1lLnNsaWNlKDAsIGkpKSAhPT0gXCJ4bWxuc1wiKSBuYW1lID0gbmFtZS5zbGljZShpICsgMSk7XG4gIHJldHVybiBuYW1lc3BhY2VzLmhhc093blByb3BlcnR5KHByZWZpeCkgPyB7c3BhY2U6IG5hbWVzcGFjZXNbcHJlZml4XSwgbG9jYWw6IG5hbWV9IDogbmFtZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbn1cbiIsImltcG9ydCBuYW1lc3BhY2UgZnJvbSBcIi4vbmFtZXNwYWNlLmpzXCI7XG5pbXBvcnQge3hodG1sfSBmcm9tIFwiLi9uYW1lc3BhY2VzLmpzXCI7XG5cbmZ1bmN0aW9uIGNyZWF0b3JJbmhlcml0KG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBkb2N1bWVudCA9IHRoaXMub3duZXJEb2N1bWVudCxcbiAgICAgICAgdXJpID0gdGhpcy5uYW1lc3BhY2VVUkk7XG4gICAgcmV0dXJuIHVyaSA9PT0geGh0bWwgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm5hbWVzcGFjZVVSSSA9PT0geGh0bWxcbiAgICAgICAgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5hbWUpXG4gICAgICAgIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHVyaSwgbmFtZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0b3JGaXhlZChmdWxsbmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMub3duZXJEb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICB2YXIgZnVsbG5hbWUgPSBuYW1lc3BhY2UobmFtZSk7XG4gIHJldHVybiAoZnVsbG5hbWUubG9jYWxcbiAgICAgID8gY3JlYXRvckZpeGVkXG4gICAgICA6IGNyZWF0b3JJbmhlcml0KShmdWxsbmFtZSk7XG59XG4iLCJmdW5jdGlvbiBub25lKCkge31cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgcmV0dXJuIHNlbGVjdG9yID09IG51bGwgPyBub25lIDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gIH07XG59XG4iLCJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBzZWxlY3RvciBmcm9tIFwiLi4vc2VsZWN0b3IuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0KSB7XG4gIGlmICh0eXBlb2Ygc2VsZWN0ICE9PSBcImZ1bmN0aW9uXCIpIHNlbGVjdCA9IHNlbGVjdG9yKHNlbGVjdCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzdWJncm91cCA9IHN1Ymdyb3Vwc1tqXSA9IG5ldyBBcnJheShuKSwgbm9kZSwgc3Vibm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiAoc3Vibm9kZSA9IHNlbGVjdC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSkpIHtcbiAgICAgICAgaWYgKFwiX19kYXRhX19cIiBpbiBub2RlKSBzdWJub2RlLl9fZGF0YV9fID0gbm9kZS5fX2RhdGFfXztcbiAgICAgICAgc3ViZ3JvdXBbaV0gPSBzdWJub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHN1Ymdyb3VwcywgdGhpcy5fcGFyZW50cyk7XG59XG4iLCIvLyBHaXZlbiBzb21ldGhpbmcgYXJyYXkgbGlrZSAob3IgbnVsbCksIHJldHVybnMgc29tZXRoaW5nIHRoYXQgaXMgc3RyaWN0bHkgYW5cbi8vIGFycmF5LiBUaGlzIGlzIHVzZWQgdG8gZW5zdXJlIHRoYXQgYXJyYXktbGlrZSBvYmplY3RzIHBhc3NlZCB0byBkMy5zZWxlY3RBbGxcbi8vIG9yIHNlbGVjdGlvbi5zZWxlY3RBbGwgYXJlIGNvbnZlcnRlZCBpbnRvIHByb3BlciBhcnJheXMgd2hlbiBjcmVhdGluZyBhXG4vLyBzZWxlY3Rpb247IHdlIGRvbuKAmXQgZXZlciB3YW50IHRvIGNyZWF0ZSBhIHNlbGVjdGlvbiBiYWNrZWQgYnkgYSBsaXZlXG4vLyBIVE1MQ29sbGVjdGlvbiBvciBOb2RlTGlzdC4gSG93ZXZlciwgbm90ZSB0aGF0IHNlbGVjdGlvbi5zZWxlY3RBbGwgd2lsbCB1c2UgYVxuLy8gc3RhdGljIE5vZGVMaXN0IGFzIGEgZ3JvdXAsIHNpbmNlIGl0IHNhZmVseSBkZXJpdmVkIGZyb20gcXVlcnlTZWxlY3RvckFsbC5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFycmF5KHgpIHtcbiAgcmV0dXJuIHggPT0gbnVsbCA/IFtdIDogQXJyYXkuaXNBcnJheSh4KSA/IHggOiBBcnJheS5mcm9tKHgpO1xufVxuIiwiZnVuY3Rpb24gZW1wdHkoKSB7XG4gIHJldHVybiBbXTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgcmV0dXJuIHNlbGVjdG9yID09IG51bGwgPyBlbXB0eSA6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICB9O1xufVxuIiwiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgYXJyYXkgZnJvbSBcIi4uL2FycmF5LmpzXCI7XG5pbXBvcnQgc2VsZWN0b3JBbGwgZnJvbSBcIi4uL3NlbGVjdG9yQWxsLmpzXCI7XG5cbmZ1bmN0aW9uIGFycmF5QWxsKHNlbGVjdCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGFycmF5KHNlbGVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0KSB7XG4gIGlmICh0eXBlb2Ygc2VsZWN0ID09PSBcImZ1bmN0aW9uXCIpIHNlbGVjdCA9IGFycmF5QWxsKHNlbGVjdCk7XG4gIGVsc2Ugc2VsZWN0ID0gc2VsZWN0b3JBbGwoc2VsZWN0KTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBbXSwgcGFyZW50cyA9IFtdLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBzdWJncm91cHMucHVzaChzZWxlY3QuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpO1xuICAgICAgICBwYXJlbnRzLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oc3ViZ3JvdXBzLCBwYXJlbnRzKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaGVzKHNlbGVjdG9yKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoaWxkTWF0Y2hlcihzZWxlY3Rvcikge1xuICByZXR1cm4gZnVuY3Rpb24obm9kZSkge1xuICAgIHJldHVybiBub2RlLm1hdGNoZXMoc2VsZWN0b3IpO1xuICB9O1xufVxuXG4iLCJpbXBvcnQge2NoaWxkTWF0Y2hlcn0gZnJvbSBcIi4uL21hdGNoZXIuanNcIjtcblxudmFyIGZpbmQgPSBBcnJheS5wcm90b3R5cGUuZmluZDtcblxuZnVuY3Rpb24gY2hpbGRGaW5kKG1hdGNoKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZmluZC5jYWxsKHRoaXMuY2hpbGRyZW4sIG1hdGNoKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY2hpbGRGaXJzdCgpIHtcbiAgcmV0dXJuIHRoaXMuZmlyc3RFbGVtZW50Q2hpbGQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG1hdGNoKSB7XG4gIHJldHVybiB0aGlzLnNlbGVjdChtYXRjaCA9PSBudWxsID8gY2hpbGRGaXJzdFxuICAgICAgOiBjaGlsZEZpbmQodHlwZW9mIG1hdGNoID09PSBcImZ1bmN0aW9uXCIgPyBtYXRjaCA6IGNoaWxkTWF0Y2hlcihtYXRjaCkpKTtcbn1cbiIsImltcG9ydCB7Y2hpbGRNYXRjaGVyfSBmcm9tIFwiLi4vbWF0Y2hlci5qc1wiO1xuXG52YXIgZmlsdGVyID0gQXJyYXkucHJvdG90eXBlLmZpbHRlcjtcblxuZnVuY3Rpb24gY2hpbGRyZW4oKSB7XG4gIHJldHVybiBBcnJheS5mcm9tKHRoaXMuY2hpbGRyZW4pO1xufVxuXG5mdW5jdGlvbiBjaGlsZHJlbkZpbHRlcihtYXRjaCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZpbHRlci5jYWxsKHRoaXMuY2hpbGRyZW4sIG1hdGNoKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obWF0Y2gpIHtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0QWxsKG1hdGNoID09IG51bGwgPyBjaGlsZHJlblxuICAgICAgOiBjaGlsZHJlbkZpbHRlcih0eXBlb2YgbWF0Y2ggPT09IFwiZnVuY3Rpb25cIiA/IG1hdGNoIDogY2hpbGRNYXRjaGVyKG1hdGNoKSkpO1xufVxuIiwiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgbWF0Y2hlciBmcm9tIFwiLi4vbWF0Y2hlci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtYXRjaCkge1xuICBpZiAodHlwZW9mIG1hdGNoICE9PSBcImZ1bmN0aW9uXCIpIG1hdGNoID0gbWF0Y2hlcihtYXRjaCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzdWJncm91cCA9IHN1Ymdyb3Vwc1tqXSA9IFtdLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIG1hdGNoLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApKSB7XG4gICAgICAgIHN1Ymdyb3VwLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oc3ViZ3JvdXBzLCB0aGlzLl9wYXJlbnRzKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHVwZGF0ZSkge1xuICByZXR1cm4gbmV3IEFycmF5KHVwZGF0ZS5sZW5ndGgpO1xufVxuIiwiaW1wb3J0IHNwYXJzZSBmcm9tIFwiLi9zcGFyc2UuanNcIjtcbmltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24odGhpcy5fZW50ZXIgfHwgdGhpcy5fZ3JvdXBzLm1hcChzcGFyc2UpLCB0aGlzLl9wYXJlbnRzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEVudGVyTm9kZShwYXJlbnQsIGRhdHVtKSB7XG4gIHRoaXMub3duZXJEb2N1bWVudCA9IHBhcmVudC5vd25lckRvY3VtZW50O1xuICB0aGlzLm5hbWVzcGFjZVVSSSA9IHBhcmVudC5uYW1lc3BhY2VVUkk7XG4gIHRoaXMuX25leHQgPSBudWxsO1xuICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQ7XG4gIHRoaXMuX19kYXRhX18gPSBkYXR1bTtcbn1cblxuRW50ZXJOb2RlLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IEVudGVyTm9kZSxcbiAgYXBwZW5kQ2hpbGQ6IGZ1bmN0aW9uKGNoaWxkKSB7IHJldHVybiB0aGlzLl9wYXJlbnQuaW5zZXJ0QmVmb3JlKGNoaWxkLCB0aGlzLl9uZXh0KTsgfSxcbiAgaW5zZXJ0QmVmb3JlOiBmdW5jdGlvbihjaGlsZCwgbmV4dCkgeyByZXR1cm4gdGhpcy5fcGFyZW50Lmluc2VydEJlZm9yZShjaGlsZCwgbmV4dCk7IH0sXG4gIHF1ZXJ5U2VsZWN0b3I6IGZ1bmN0aW9uKHNlbGVjdG9yKSB7IHJldHVybiB0aGlzLl9wYXJlbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7IH0sXG4gIHF1ZXJ5U2VsZWN0b3JBbGw6IGZ1bmN0aW9uKHNlbGVjdG9yKSB7IHJldHVybiB0aGlzLl9wYXJlbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7IH1cbn07XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih4KSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4geDtcbiAgfTtcbn1cbiIsImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHtFbnRlck5vZGV9IGZyb20gXCIuL2VudGVyLmpzXCI7XG5pbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4uL2NvbnN0YW50LmpzXCI7XG5cbmZ1bmN0aW9uIGJpbmRJbmRleChwYXJlbnQsIGdyb3VwLCBlbnRlciwgdXBkYXRlLCBleGl0LCBkYXRhKSB7XG4gIHZhciBpID0gMCxcbiAgICAgIG5vZGUsXG4gICAgICBncm91cExlbmd0aCA9IGdyb3VwLmxlbmd0aCxcbiAgICAgIGRhdGFMZW5ndGggPSBkYXRhLmxlbmd0aDtcblxuICAvLyBQdXQgYW55IG5vbi1udWxsIG5vZGVzIHRoYXQgZml0IGludG8gdXBkYXRlLlxuICAvLyBQdXQgYW55IG51bGwgbm9kZXMgaW50byBlbnRlci5cbiAgLy8gUHV0IGFueSByZW1haW5pbmcgZGF0YSBpbnRvIGVudGVyLlxuICBmb3IgKDsgaSA8IGRhdGFMZW5ndGg7ICsraSkge1xuICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgIG5vZGUuX19kYXRhX18gPSBkYXRhW2ldO1xuICAgICAgdXBkYXRlW2ldID0gbm9kZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW50ZXJbaV0gPSBuZXcgRW50ZXJOb2RlKHBhcmVudCwgZGF0YVtpXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gUHV0IGFueSBub24tbnVsbCBub2RlcyB0aGF0IGRvbuKAmXQgZml0IGludG8gZXhpdC5cbiAgZm9yICg7IGkgPCBncm91cExlbmd0aDsgKytpKSB7XG4gICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgZXhpdFtpXSA9IG5vZGU7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGJpbmRLZXkocGFyZW50LCBncm91cCwgZW50ZXIsIHVwZGF0ZSwgZXhpdCwgZGF0YSwga2V5KSB7XG4gIHZhciBpLFxuICAgICAgbm9kZSxcbiAgICAgIG5vZGVCeUtleVZhbHVlID0gbmV3IE1hcCxcbiAgICAgIGdyb3VwTGVuZ3RoID0gZ3JvdXAubGVuZ3RoLFxuICAgICAgZGF0YUxlbmd0aCA9IGRhdGEubGVuZ3RoLFxuICAgICAga2V5VmFsdWVzID0gbmV3IEFycmF5KGdyb3VwTGVuZ3RoKSxcbiAgICAgIGtleVZhbHVlO1xuXG4gIC8vIENvbXB1dGUgdGhlIGtleSBmb3IgZWFjaCBub2RlLlxuICAvLyBJZiBtdWx0aXBsZSBub2RlcyBoYXZlIHRoZSBzYW1lIGtleSwgdGhlIGR1cGxpY2F0ZXMgYXJlIGFkZGVkIHRvIGV4aXQuXG4gIGZvciAoaSA9IDA7IGkgPCBncm91cExlbmd0aDsgKytpKSB7XG4gICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAga2V5VmFsdWVzW2ldID0ga2V5VmFsdWUgPSBrZXkuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkgKyBcIlwiO1xuICAgICAgaWYgKG5vZGVCeUtleVZhbHVlLmhhcyhrZXlWYWx1ZSkpIHtcbiAgICAgICAgZXhpdFtpXSA9IG5vZGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub2RlQnlLZXlWYWx1ZS5zZXQoa2V5VmFsdWUsIG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIENvbXB1dGUgdGhlIGtleSBmb3IgZWFjaCBkYXR1bS5cbiAgLy8gSWYgdGhlcmUgYSBub2RlIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGtleSwgam9pbiBhbmQgYWRkIGl0IHRvIHVwZGF0ZS5cbiAgLy8gSWYgdGhlcmUgaXMgbm90IChvciB0aGUga2V5IGlzIGEgZHVwbGljYXRlKSwgYWRkIGl0IHRvIGVudGVyLlxuICBmb3IgKGkgPSAwOyBpIDwgZGF0YUxlbmd0aDsgKytpKSB7XG4gICAga2V5VmFsdWUgPSBrZXkuY2FsbChwYXJlbnQsIGRhdGFbaV0sIGksIGRhdGEpICsgXCJcIjtcbiAgICBpZiAobm9kZSA9IG5vZGVCeUtleVZhbHVlLmdldChrZXlWYWx1ZSkpIHtcbiAgICAgIHVwZGF0ZVtpXSA9IG5vZGU7XG4gICAgICBub2RlLl9fZGF0YV9fID0gZGF0YVtpXTtcbiAgICAgIG5vZGVCeUtleVZhbHVlLmRlbGV0ZShrZXlWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVudGVyW2ldID0gbmV3IEVudGVyTm9kZShwYXJlbnQsIGRhdGFbaV0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIEFkZCBhbnkgcmVtYWluaW5nIG5vZGVzIHRoYXQgd2VyZSBub3QgYm91bmQgdG8gZGF0YSB0byBleGl0LlxuICBmb3IgKGkgPSAwOyBpIDwgZ3JvdXBMZW5ndGg7ICsraSkge1xuICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiAobm9kZUJ5S2V5VmFsdWUuZ2V0KGtleVZhbHVlc1tpXSkgPT09IG5vZGUpKSB7XG4gICAgICBleGl0W2ldID0gbm9kZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZGF0dW0obm9kZSkge1xuICByZXR1cm4gbm9kZS5fX2RhdGFfXztcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBBcnJheS5mcm9tKHRoaXMsIGRhdHVtKTtcblxuICB2YXIgYmluZCA9IGtleSA/IGJpbmRLZXkgOiBiaW5kSW5kZXgsXG4gICAgICBwYXJlbnRzID0gdGhpcy5fcGFyZW50cyxcbiAgICAgIGdyb3VwcyA9IHRoaXMuX2dyb3VwcztcblxuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHZhbHVlID0gY29uc3RhbnQodmFsdWUpO1xuXG4gIGZvciAodmFyIG0gPSBncm91cHMubGVuZ3RoLCB1cGRhdGUgPSBuZXcgQXJyYXkobSksIGVudGVyID0gbmV3IEFycmF5KG0pLCBleGl0ID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIHZhciBwYXJlbnQgPSBwYXJlbnRzW2pdLFxuICAgICAgICBncm91cCA9IGdyb3Vwc1tqXSxcbiAgICAgICAgZ3JvdXBMZW5ndGggPSBncm91cC5sZW5ndGgsXG4gICAgICAgIGRhdGEgPSBhcnJheWxpa2UodmFsdWUuY2FsbChwYXJlbnQsIHBhcmVudCAmJiBwYXJlbnQuX19kYXRhX18sIGosIHBhcmVudHMpKSxcbiAgICAgICAgZGF0YUxlbmd0aCA9IGRhdGEubGVuZ3RoLFxuICAgICAgICBlbnRlckdyb3VwID0gZW50ZXJbal0gPSBuZXcgQXJyYXkoZGF0YUxlbmd0aCksXG4gICAgICAgIHVwZGF0ZUdyb3VwID0gdXBkYXRlW2pdID0gbmV3IEFycmF5KGRhdGFMZW5ndGgpLFxuICAgICAgICBleGl0R3JvdXAgPSBleGl0W2pdID0gbmV3IEFycmF5KGdyb3VwTGVuZ3RoKTtcblxuICAgIGJpbmQocGFyZW50LCBncm91cCwgZW50ZXJHcm91cCwgdXBkYXRlR3JvdXAsIGV4aXRHcm91cCwgZGF0YSwga2V5KTtcblxuICAgIC8vIE5vdyBjb25uZWN0IHRoZSBlbnRlciBub2RlcyB0byB0aGVpciBmb2xsb3dpbmcgdXBkYXRlIG5vZGUsIHN1Y2ggdGhhdFxuICAgIC8vIGFwcGVuZENoaWxkIGNhbiBpbnNlcnQgdGhlIG1hdGVyaWFsaXplZCBlbnRlciBub2RlIGJlZm9yZSB0aGlzIG5vZGUsXG4gICAgLy8gcmF0aGVyIHRoYW4gYXQgdGhlIGVuZCBvZiB0aGUgcGFyZW50IG5vZGUuXG4gICAgZm9yICh2YXIgaTAgPSAwLCBpMSA9IDAsIHByZXZpb3VzLCBuZXh0OyBpMCA8IGRhdGFMZW5ndGg7ICsraTApIHtcbiAgICAgIGlmIChwcmV2aW91cyA9IGVudGVyR3JvdXBbaTBdKSB7XG4gICAgICAgIGlmIChpMCA+PSBpMSkgaTEgPSBpMCArIDE7XG4gICAgICAgIHdoaWxlICghKG5leHQgPSB1cGRhdGVHcm91cFtpMV0pICYmICsraTEgPCBkYXRhTGVuZ3RoKTtcbiAgICAgICAgcHJldmlvdXMuX25leHQgPSBuZXh0IHx8IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlID0gbmV3IFNlbGVjdGlvbih1cGRhdGUsIHBhcmVudHMpO1xuICB1cGRhdGUuX2VudGVyID0gZW50ZXI7XG4gIHVwZGF0ZS5fZXhpdCA9IGV4aXQ7XG4gIHJldHVybiB1cGRhdGU7XG59XG5cbi8vIEdpdmVuIHNvbWUgZGF0YSwgdGhpcyByZXR1cm5zIGFuIGFycmF5LWxpa2UgdmlldyBvZiBpdDogYW4gb2JqZWN0IHRoYXRcbi8vIGV4cG9zZXMgYSBsZW5ndGggcHJvcGVydHkgYW5kIGFsbG93cyBudW1lcmljIGluZGV4aW5nLiBOb3RlIHRoYXQgdW5saWtlXG4vLyBzZWxlY3RBbGwsIHRoaXMgaXNu4oCZdCB3b3JyaWVkIGFib3V0IOKAnGxpdmXigJ0gY29sbGVjdGlvbnMgYmVjYXVzZSB0aGUgcmVzdWx0aW5nXG4vLyBhcnJheSB3aWxsIG9ubHkgYmUgdXNlZCBicmllZmx5IHdoaWxlIGRhdGEgaXMgYmVpbmcgYm91bmQuIChJdCBpcyBwb3NzaWJsZSB0b1xuLy8gY2F1c2UgdGhlIGRhdGEgdG8gY2hhbmdlIHdoaWxlIGl0ZXJhdGluZyBieSB1c2luZyBhIGtleSBmdW5jdGlvbiwgYnV0IHBsZWFzZVxuLy8gZG9u4oCZdDsgd2XigJlkIHJhdGhlciBhdm9pZCBhIGdyYXR1aXRvdXMgY29weS4pXG5mdW5jdGlvbiBhcnJheWxpa2UoZGF0YSkge1xuICByZXR1cm4gdHlwZW9mIGRhdGEgPT09IFwib2JqZWN0XCIgJiYgXCJsZW5ndGhcIiBpbiBkYXRhXG4gICAgPyBkYXRhIC8vIEFycmF5LCBUeXBlZEFycmF5LCBOb2RlTGlzdCwgYXJyYXktbGlrZVxuICAgIDogQXJyYXkuZnJvbShkYXRhKTsgLy8gTWFwLCBTZXQsIGl0ZXJhYmxlLCBzdHJpbmcsIG9yIGFueXRoaW5nIGVsc2Vcbn1cbiIsImltcG9ydCBzcGFyc2UgZnJvbSBcIi4vc3BhcnNlLmpzXCI7XG5pbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHRoaXMuX2V4aXQgfHwgdGhpcy5fZ3JvdXBzLm1hcChzcGFyc2UpLCB0aGlzLl9wYXJlbnRzKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG9uZW50ZXIsIG9udXBkYXRlLCBvbmV4aXQpIHtcbiAgdmFyIGVudGVyID0gdGhpcy5lbnRlcigpLCB1cGRhdGUgPSB0aGlzLCBleGl0ID0gdGhpcy5leGl0KCk7XG4gIGlmICh0eXBlb2Ygb25lbnRlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgZW50ZXIgPSBvbmVudGVyKGVudGVyKTtcbiAgICBpZiAoZW50ZXIpIGVudGVyID0gZW50ZXIuc2VsZWN0aW9uKCk7XG4gIH0gZWxzZSB7XG4gICAgZW50ZXIgPSBlbnRlci5hcHBlbmQob25lbnRlciArIFwiXCIpO1xuICB9XG4gIGlmIChvbnVwZGF0ZSAhPSBudWxsKSB7XG4gICAgdXBkYXRlID0gb251cGRhdGUodXBkYXRlKTtcbiAgICBpZiAodXBkYXRlKSB1cGRhdGUgPSB1cGRhdGUuc2VsZWN0aW9uKCk7XG4gIH1cbiAgaWYgKG9uZXhpdCA9PSBudWxsKSBleGl0LnJlbW92ZSgpOyBlbHNlIG9uZXhpdChleGl0KTtcbiAgcmV0dXJuIGVudGVyICYmIHVwZGF0ZSA/IGVudGVyLm1lcmdlKHVwZGF0ZSkub3JkZXIoKSA6IHVwZGF0ZTtcbn1cbiIsImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjb250ZXh0KSB7XG4gIHZhciBzZWxlY3Rpb24gPSBjb250ZXh0LnNlbGVjdGlvbiA/IGNvbnRleHQuc2VsZWN0aW9uKCkgOiBjb250ZXh0O1xuXG4gIGZvciAodmFyIGdyb3VwczAgPSB0aGlzLl9ncm91cHMsIGdyb3VwczEgPSBzZWxlY3Rpb24uX2dyb3VwcywgbTAgPSBncm91cHMwLmxlbmd0aCwgbTEgPSBncm91cHMxLmxlbmd0aCwgbSA9IE1hdGgubWluKG0wLCBtMSksIG1lcmdlcyA9IG5ldyBBcnJheShtMCksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAwID0gZ3JvdXBzMFtqXSwgZ3JvdXAxID0gZ3JvdXBzMVtqXSwgbiA9IGdyb3VwMC5sZW5ndGgsIG1lcmdlID0gbWVyZ2VzW2pdID0gbmV3IEFycmF5KG4pLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cDBbaV0gfHwgZ3JvdXAxW2ldKSB7XG4gICAgICAgIG1lcmdlW2ldID0gbm9kZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb3IgKDsgaiA8IG0wOyArK2opIHtcbiAgICBtZXJnZXNbal0gPSBncm91cHMwW2pdO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24obWVyZ2VzLCB0aGlzLl9wYXJlbnRzKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgaiA9IC0xLCBtID0gZ3JvdXBzLmxlbmd0aDsgKytqIDwgbTspIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgaSA9IGdyb3VwLmxlbmd0aCAtIDEsIG5leHQgPSBncm91cFtpXSwgbm9kZTsgLS1pID49IDA7KSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIGlmIChuZXh0ICYmIG5vZGUuY29tcGFyZURvY3VtZW50UG9zaXRpb24obmV4dCkgXiA0KSBuZXh0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIG5leHQpO1xuICAgICAgICBuZXh0ID0gbm9kZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn1cbiIsImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjb21wYXJlKSB7XG4gIGlmICghY29tcGFyZSkgY29tcGFyZSA9IGFzY2VuZGluZztcblxuICBmdW5jdGlvbiBjb21wYXJlTm9kZShhLCBiKSB7XG4gICAgcmV0dXJuIGEgJiYgYiA/IGNvbXBhcmUoYS5fX2RhdGFfXywgYi5fX2RhdGFfXykgOiAhYSAtICFiO1xuICB9XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc29ydGdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc29ydGdyb3VwID0gc29ydGdyb3Vwc1tqXSA9IG5ldyBBcnJheShuKSwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgc29ydGdyb3VwW2ldID0gbm9kZTtcbiAgICAgIH1cbiAgICB9XG4gICAgc29ydGdyb3VwLnNvcnQoY29tcGFyZU5vZGUpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oc29ydGdyb3VwcywgdGhpcy5fcGFyZW50cykub3JkZXIoKTtcbn1cblxuZnVuY3Rpb24gYXNjZW5kaW5nKGEsIGIpIHtcbiAgcmV0dXJuIGEgPCBiID8gLTEgOiBhID4gYiA/IDEgOiBhID49IGIgPyAwIDogTmFOO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50c1swXTtcbiAgYXJndW1lbnRzWzBdID0gdGhpcztcbiAgY2FsbGJhY2suYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgcmV0dXJuIHRoaXM7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIEFycmF5LmZyb20odGhpcyk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIGogPSAwLCBtID0gZ3JvdXBzLmxlbmd0aDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gMCwgbiA9IGdyb3VwLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgdmFyIG5vZGUgPSBncm91cFtpXTtcbiAgICAgIGlmIChub2RlKSByZXR1cm4gbm9kZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICBsZXQgc2l6ZSA9IDA7XG4gIGZvciAoY29uc3Qgbm9kZSBvZiB0aGlzKSArK3NpemU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgcmV0dXJuIHNpemU7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICF0aGlzLm5vZGUoKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBqID0gMCwgbSA9IGdyb3Vwcy5sZW5ndGg7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgaSA9IDAsIG4gPSBncm91cC5sZW5ndGgsIG5vZGU7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIGNhbGxiYWNrLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufVxuIiwiaW1wb3J0IG5hbWVzcGFjZSBmcm9tIFwiLi4vbmFtZXNwYWNlLmpzXCI7XG5cbmZ1bmN0aW9uIGF0dHJSZW1vdmUobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJSZW1vdmVOUyhmdWxsbmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyQ29uc3RhbnQobmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckNvbnN0YW50TlMoZnVsbG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldEF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCwgdmFsdWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyRnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodiA9PSBudWxsKSB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICBlbHNlIHRoaXMuc2V0QXR0cmlidXRlKG5hbWUsIHYpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyRnVuY3Rpb25OUyhmdWxsbmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodiA9PSBudWxsKSB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gICAgZWxzZSB0aGlzLnNldEF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCwgdik7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHZhciBmdWxsbmFtZSA9IG5hbWVzcGFjZShuYW1lKTtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMubm9kZSgpO1xuICAgIHJldHVybiBmdWxsbmFtZS5sb2NhbFxuICAgICAgICA/IG5vZGUuZ2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKVxuICAgICAgICA6IG5vZGUuZ2V0QXR0cmlidXRlKGZ1bGxuYW1lKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmVhY2goKHZhbHVlID09IG51bGxcbiAgICAgID8gKGZ1bGxuYW1lLmxvY2FsID8gYXR0clJlbW92ZU5TIDogYXR0clJlbW92ZSkgOiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gKGZ1bGxuYW1lLmxvY2FsID8gYXR0ckZ1bmN0aW9uTlMgOiBhdHRyRnVuY3Rpb24pXG4gICAgICA6IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJDb25zdGFudE5TIDogYXR0ckNvbnN0YW50KSkpKGZ1bGxuYW1lLCB2YWx1ZSkpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obm9kZSkge1xuICByZXR1cm4gKG5vZGUub3duZXJEb2N1bWVudCAmJiBub2RlLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcpIC8vIG5vZGUgaXMgYSBOb2RlXG4gICAgICB8fCAobm9kZS5kb2N1bWVudCAmJiBub2RlKSAvLyBub2RlIGlzIGEgV2luZG93XG4gICAgICB8fCBub2RlLmRlZmF1bHRWaWV3OyAvLyBub2RlIGlzIGEgRG9jdW1lbnRcbn1cbiIsImltcG9ydCBkZWZhdWx0VmlldyBmcm9tIFwiLi4vd2luZG93LmpzXCI7XG5cbmZ1bmN0aW9uIHN0eWxlUmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlQ29uc3RhbnQobmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIHZhbHVlLCBwcmlvcml0eSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlRnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHYgPT0gbnVsbCkgdGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKTtcbiAgICBlbHNlIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkobmFtZSwgdiwgcHJpb3JpdHkpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPiAxXG4gICAgICA/IHRoaXMuZWFjaCgodmFsdWUgPT0gbnVsbFxuICAgICAgICAgICAgPyBzdHlsZVJlbW92ZSA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgICA/IHN0eWxlRnVuY3Rpb25cbiAgICAgICAgICAgIDogc3R5bGVDb25zdGFudCkobmFtZSwgdmFsdWUsIHByaW9yaXR5ID09IG51bGwgPyBcIlwiIDogcHJpb3JpdHkpKVxuICAgICAgOiBzdHlsZVZhbHVlKHRoaXMubm9kZSgpLCBuYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0eWxlVmFsdWUobm9kZSwgbmFtZSkge1xuICByZXR1cm4gbm9kZS5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKG5hbWUpXG4gICAgICB8fCBkZWZhdWx0Vmlldyhub2RlKS5nZXRDb21wdXRlZFN0eWxlKG5vZGUsIG51bGwpLmdldFByb3BlcnR5VmFsdWUobmFtZSk7XG59XG4iLCJmdW5jdGlvbiBwcm9wZXJ0eVJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBkZWxldGUgdGhpc1tuYW1lXTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcHJvcGVydHlDb25zdGFudChuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpc1tuYW1lXSA9IHZhbHVlO1xuICB9O1xufVxuXG5mdW5jdGlvbiBwcm9wZXJ0eUZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHYgPT0gbnVsbCkgZGVsZXRlIHRoaXNbbmFtZV07XG4gICAgZWxzZSB0aGlzW25hbWVdID0gdjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPiAxXG4gICAgICA/IHRoaXMuZWFjaCgodmFsdWUgPT0gbnVsbFxuICAgICAgICAgID8gcHJvcGVydHlSZW1vdmUgOiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgID8gcHJvcGVydHlGdW5jdGlvblxuICAgICAgICAgIDogcHJvcGVydHlDb25zdGFudCkobmFtZSwgdmFsdWUpKVxuICAgICAgOiB0aGlzLm5vZGUoKVtuYW1lXTtcbn1cbiIsImZ1bmN0aW9uIGNsYXNzQXJyYXkoc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcudHJpbSgpLnNwbGl0KC9efFxccysvKTtcbn1cblxuZnVuY3Rpb24gY2xhc3NMaXN0KG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUuY2xhc3NMaXN0IHx8IG5ldyBDbGFzc0xpc3Qobm9kZSk7XG59XG5cbmZ1bmN0aW9uIENsYXNzTGlzdChub2RlKSB7XG4gIHRoaXMuX25vZGUgPSBub2RlO1xuICB0aGlzLl9uYW1lcyA9IGNsYXNzQXJyYXkobm9kZS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSB8fCBcIlwiKTtcbn1cblxuQ2xhc3NMaXN0LnByb3RvdHlwZSA9IHtcbiAgYWRkOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGkgPSB0aGlzLl9uYW1lcy5pbmRleE9mKG5hbWUpO1xuICAgIGlmIChpIDwgMCkge1xuICAgICAgdGhpcy5fbmFtZXMucHVzaChuYW1lKTtcbiAgICAgIHRoaXMuX25vZGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgdGhpcy5fbmFtZXMuam9pbihcIiBcIikpO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGkgPSB0aGlzLl9uYW1lcy5pbmRleE9mKG5hbWUpO1xuICAgIGlmIChpID49IDApIHtcbiAgICAgIHRoaXMuX25hbWVzLnNwbGljZShpLCAxKTtcbiAgICAgIHRoaXMuX25vZGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgdGhpcy5fbmFtZXMuam9pbihcIiBcIikpO1xuICAgIH1cbiAgfSxcbiAgY29udGFpbnM6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fbmFtZXMuaW5kZXhPZihuYW1lKSA+PSAwO1xuICB9XG59O1xuXG5mdW5jdGlvbiBjbGFzc2VkQWRkKG5vZGUsIG5hbWVzKSB7XG4gIHZhciBsaXN0ID0gY2xhc3NMaXN0KG5vZGUpLCBpID0gLTEsIG4gPSBuYW1lcy5sZW5ndGg7XG4gIHdoaWxlICgrK2kgPCBuKSBsaXN0LmFkZChuYW1lc1tpXSk7XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRSZW1vdmUobm9kZSwgbmFtZXMpIHtcbiAgdmFyIGxpc3QgPSBjbGFzc0xpc3Qobm9kZSksIGkgPSAtMSwgbiA9IG5hbWVzLmxlbmd0aDtcbiAgd2hpbGUgKCsraSA8IG4pIGxpc3QucmVtb3ZlKG5hbWVzW2ldKTtcbn1cblxuZnVuY3Rpb24gY2xhc3NlZFRydWUobmFtZXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGNsYXNzZWRBZGQodGhpcywgbmFtZXMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjbGFzc2VkRmFsc2UobmFtZXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGNsYXNzZWRSZW1vdmUodGhpcywgbmFtZXMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjbGFzc2VkRnVuY3Rpb24obmFtZXMsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAodmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKSA/IGNsYXNzZWRBZGQgOiBjbGFzc2VkUmVtb3ZlKSh0aGlzLCBuYW1lcyk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHZhciBuYW1lcyA9IGNsYXNzQXJyYXkobmFtZSArIFwiXCIpO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHZhciBsaXN0ID0gY2xhc3NMaXN0KHRoaXMubm9kZSgpKSwgaSA9IC0xLCBuID0gbmFtZXMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoIWxpc3QuY29udGFpbnMobmFtZXNbaV0pKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gdGhpcy5lYWNoKCh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyBjbGFzc2VkRnVuY3Rpb24gOiB2YWx1ZVxuICAgICAgPyBjbGFzc2VkVHJ1ZVxuICAgICAgOiBjbGFzc2VkRmFsc2UpKG5hbWVzLCB2YWx1ZSkpO1xufVxuIiwiZnVuY3Rpb24gdGV4dFJlbW92ZSgpIHtcbiAgdGhpcy50ZXh0Q29udGVudCA9IFwiXCI7XG59XG5cbmZ1bmN0aW9uIHRleHRDb25zdGFudCh2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IHZhbHVlO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0ZXh0RnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gdiA9PSBudWxsID8gXCJcIiA6IHY7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMuZWFjaCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgPyB0ZXh0UmVtb3ZlIDogKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyB0ZXh0RnVuY3Rpb25cbiAgICAgICAgICA6IHRleHRDb25zdGFudCkodmFsdWUpKVxuICAgICAgOiB0aGlzLm5vZGUoKS50ZXh0Q29udGVudDtcbn1cbiIsImZ1bmN0aW9uIGh0bWxSZW1vdmUoKSB7XG4gIHRoaXMuaW5uZXJIVE1MID0gXCJcIjtcbn1cblxuZnVuY3Rpb24gaHRtbENvbnN0YW50KHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlubmVySFRNTCA9IHZhbHVlO1xuICB9O1xufVxuXG5mdW5jdGlvbiBodG1sRnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLmlubmVySFRNTCA9IHYgPT0gbnVsbCA/IFwiXCIgOiB2O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2godmFsdWUgPT0gbnVsbFxuICAgICAgICAgID8gaHRtbFJlbW92ZSA6ICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgID8gaHRtbEZ1bmN0aW9uXG4gICAgICAgICAgOiBodG1sQ29uc3RhbnQpKHZhbHVlKSlcbiAgICAgIDogdGhpcy5ub2RlKCkuaW5uZXJIVE1MO1xufVxuIiwiZnVuY3Rpb24gcmFpc2UoKSB7XG4gIGlmICh0aGlzLm5leHRTaWJsaW5nKSB0aGlzLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5lYWNoKHJhaXNlKTtcbn1cbiIsImZ1bmN0aW9uIGxvd2VyKCkge1xuICBpZiAodGhpcy5wcmV2aW91c1NpYmxpbmcpIHRoaXMucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcywgdGhpcy5wYXJlbnROb2RlLmZpcnN0Q2hpbGQpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaChsb3dlcik7XG59XG4iLCJpbXBvcnQgY3JlYXRvciBmcm9tIFwiLi4vY3JlYXRvci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBjcmVhdGUgPSB0eXBlb2YgbmFtZSA9PT0gXCJmdW5jdGlvblwiID8gbmFtZSA6IGNyZWF0b3IobmFtZSk7XG4gIHJldHVybiB0aGlzLnNlbGVjdChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5hcHBlbmRDaGlsZChjcmVhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gIH0pO1xufVxuIiwiaW1wb3J0IGNyZWF0b3IgZnJvbSBcIi4uL2NyZWF0b3IuanNcIjtcbmltcG9ydCBzZWxlY3RvciBmcm9tIFwiLi4vc2VsZWN0b3IuanNcIjtcblxuZnVuY3Rpb24gY29uc3RhbnROdWxsKCkge1xuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgYmVmb3JlKSB7XG4gIHZhciBjcmVhdGUgPSB0eXBlb2YgbmFtZSA9PT0gXCJmdW5jdGlvblwiID8gbmFtZSA6IGNyZWF0b3IobmFtZSksXG4gICAgICBzZWxlY3QgPSBiZWZvcmUgPT0gbnVsbCA/IGNvbnN0YW50TnVsbCA6IHR5cGVvZiBiZWZvcmUgPT09IFwiZnVuY3Rpb25cIiA/IGJlZm9yZSA6IHNlbGVjdG9yKGJlZm9yZSk7XG4gIHJldHVybiB0aGlzLnNlbGVjdChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5pbnNlcnRCZWZvcmUoY3JlYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyksIHNlbGVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IG51bGwpO1xuICB9KTtcbn1cbiIsImZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgaWYgKHBhcmVudCkgcGFyZW50LnJlbW92ZUNoaWxkKHRoaXMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaChyZW1vdmUpO1xufVxuIiwiZnVuY3Rpb24gc2VsZWN0aW9uX2Nsb25lU2hhbGxvdygpIHtcbiAgdmFyIGNsb25lID0gdGhpcy5jbG9uZU5vZGUoZmFsc2UpLCBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gIHJldHVybiBwYXJlbnQgPyBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNsb25lLCB0aGlzLm5leHRTaWJsaW5nKSA6IGNsb25lO1xufVxuXG5mdW5jdGlvbiBzZWxlY3Rpb25fY2xvbmVEZWVwKCkge1xuICB2YXIgY2xvbmUgPSB0aGlzLmNsb25lTm9kZSh0cnVlKSwgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICByZXR1cm4gcGFyZW50ID8gcGFyZW50Lmluc2VydEJlZm9yZShjbG9uZSwgdGhpcy5uZXh0U2libGluZykgOiBjbG9uZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oZGVlcCkge1xuICByZXR1cm4gdGhpcy5zZWxlY3QoZGVlcCA/IHNlbGVjdGlvbl9jbG9uZURlZXAgOiBzZWxlY3Rpb25fY2xvbmVTaGFsbG93KTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMucHJvcGVydHkoXCJfX2RhdGFfX1wiLCB2YWx1ZSlcbiAgICAgIDogdGhpcy5ub2RlKCkuX19kYXRhX187XG59XG4iLCJmdW5jdGlvbiBjb250ZXh0TGlzdGVuZXIobGlzdGVuZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgbGlzdGVuZXIuY2FsbCh0aGlzLCBldmVudCwgdGhpcy5fX2RhdGFfXyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lcykge1xuICByZXR1cm4gdHlwZW5hbWVzLnRyaW0oKS5zcGxpdCgvXnxcXHMrLykubWFwKGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgbmFtZSA9IFwiXCIsIGkgPSB0LmluZGV4T2YoXCIuXCIpO1xuICAgIGlmIChpID49IDApIG5hbWUgPSB0LnNsaWNlKGkgKyAxKSwgdCA9IHQuc2xpY2UoMCwgaSk7XG4gICAgcmV0dXJuIHt0eXBlOiB0LCBuYW1lOiBuYW1lfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG9uUmVtb3ZlKHR5cGVuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgb24gPSB0aGlzLl9fb247XG4gICAgaWYgKCFvbikgcmV0dXJuO1xuICAgIGZvciAodmFyIGogPSAwLCBpID0gLTEsIG0gPSBvbi5sZW5ndGgsIG87IGogPCBtOyArK2opIHtcbiAgICAgIGlmIChvID0gb25bal0sICghdHlwZW5hbWUudHlwZSB8fCBvLnR5cGUgPT09IHR5cGVuYW1lLnR5cGUpICYmIG8ubmFtZSA9PT0gdHlwZW5hbWUubmFtZSkge1xuICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoby50eXBlLCBvLmxpc3RlbmVyLCBvLm9wdGlvbnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb25bKytpXSA9IG87XG4gICAgICB9XG4gICAgfVxuICAgIGlmICgrK2kpIG9uLmxlbmd0aCA9IGk7XG4gICAgZWxzZSBkZWxldGUgdGhpcy5fX29uO1xuICB9O1xufVxuXG5mdW5jdGlvbiBvbkFkZCh0eXBlbmFtZSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBvbiA9IHRoaXMuX19vbiwgbywgbGlzdGVuZXIgPSBjb250ZXh0TGlzdGVuZXIodmFsdWUpO1xuICAgIGlmIChvbikgZm9yICh2YXIgaiA9IDAsIG0gPSBvbi5sZW5ndGg7IGogPCBtOyArK2opIHtcbiAgICAgIGlmICgobyA9IG9uW2pdKS50eXBlID09PSB0eXBlbmFtZS50eXBlICYmIG8ubmFtZSA9PT0gdHlwZW5hbWUubmFtZSkge1xuICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoby50eXBlLCBvLmxpc3RlbmVyLCBvLm9wdGlvbnMpO1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoby50eXBlLCBvLmxpc3RlbmVyID0gbGlzdGVuZXIsIG8ub3B0aW9ucyA9IG9wdGlvbnMpO1xuICAgICAgICBvLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKHR5cGVuYW1lLnR5cGUsIGxpc3RlbmVyLCBvcHRpb25zKTtcbiAgICBvID0ge3R5cGU6IHR5cGVuYW1lLnR5cGUsIG5hbWU6IHR5cGVuYW1lLm5hbWUsIHZhbHVlOiB2YWx1ZSwgbGlzdGVuZXI6IGxpc3RlbmVyLCBvcHRpb25zOiBvcHRpb25zfTtcbiAgICBpZiAoIW9uKSB0aGlzLl9fb24gPSBbb107XG4gICAgZWxzZSBvbi5wdXNoKG8pO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0eXBlbmFtZSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGVuYW1lcyA9IHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lICsgXCJcIiksIGksIG4gPSB0eXBlbmFtZXMubGVuZ3RoLCB0O1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHZhciBvbiA9IHRoaXMubm9kZSgpLl9fb247XG4gICAgaWYgKG9uKSBmb3IgKHZhciBqID0gMCwgbSA9IG9uLmxlbmd0aCwgbzsgaiA8IG07ICsraikge1xuICAgICAgZm9yIChpID0gMCwgbyA9IG9uW2pdOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIGlmICgodCA9IHR5cGVuYW1lc1tpXSkudHlwZSA9PT0gby50eXBlICYmIHQubmFtZSA9PT0gby5uYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIG8udmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgb24gPSB2YWx1ZSA/IG9uQWRkIDogb25SZW1vdmU7XG4gIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHRoaXMuZWFjaChvbih0eXBlbmFtZXNbaV0sIHZhbHVlLCBvcHRpb25zKSk7XG4gIHJldHVybiB0aGlzO1xufVxuIiwiaW1wb3J0IGRlZmF1bHRWaWV3IGZyb20gXCIuLi93aW5kb3cuanNcIjtcblxuZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChub2RlLCB0eXBlLCBwYXJhbXMpIHtcbiAgdmFyIHdpbmRvdyA9IGRlZmF1bHRWaWV3KG5vZGUpLFxuICAgICAgZXZlbnQgPSB3aW5kb3cuQ3VzdG9tRXZlbnQ7XG5cbiAgaWYgKHR5cGVvZiBldmVudCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgZXZlbnQgPSBuZXcgZXZlbnQodHlwZSwgcGFyYW1zKTtcbiAgfSBlbHNlIHtcbiAgICBldmVudCA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFdmVudChcIkV2ZW50XCIpO1xuICAgIGlmIChwYXJhbXMpIGV2ZW50LmluaXRFdmVudCh0eXBlLCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUpLCBldmVudC5kZXRhaWwgPSBwYXJhbXMuZGV0YWlsO1xuICAgIGVsc2UgZXZlbnQuaW5pdEV2ZW50KHR5cGUsIGZhbHNlLCBmYWxzZSk7XG4gIH1cblxuICBub2RlLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaENvbnN0YW50KHR5cGUsIHBhcmFtcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRpc3BhdGNoRXZlbnQodGhpcywgdHlwZSwgcGFyYW1zKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2hGdW5jdGlvbih0eXBlLCBwYXJhbXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkaXNwYXRjaEV2ZW50KHRoaXMsIHR5cGUsIHBhcmFtcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odHlwZSwgcGFyYW1zKSB7XG4gIHJldHVybiB0aGlzLmVhY2goKHR5cGVvZiBwYXJhbXMgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyBkaXNwYXRjaEZ1bmN0aW9uXG4gICAgICA6IGRpc3BhdGNoQ29uc3RhbnQpKHR5cGUsIHBhcmFtcykpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24qKCkge1xuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIGogPSAwLCBtID0gZ3JvdXBzLmxlbmd0aDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gMCwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZTsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkgeWllbGQgbm9kZTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCBzZWxlY3Rpb25fc2VsZWN0IGZyb20gXCIuL3NlbGVjdC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zZWxlY3RBbGwgZnJvbSBcIi4vc2VsZWN0QWxsLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NlbGVjdENoaWxkIGZyb20gXCIuL3NlbGVjdENoaWxkLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NlbGVjdENoaWxkcmVuIGZyb20gXCIuL3NlbGVjdENoaWxkcmVuLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2ZpbHRlciBmcm9tIFwiLi9maWx0ZXIuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZGF0YSBmcm9tIFwiLi9kYXRhLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2VudGVyIGZyb20gXCIuL2VudGVyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2V4aXQgZnJvbSBcIi4vZXhpdC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9qb2luIGZyb20gXCIuL2pvaW4uanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fbWVyZ2UgZnJvbSBcIi4vbWVyZ2UuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fb3JkZXIgZnJvbSBcIi4vb3JkZXIuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc29ydCBmcm9tIFwiLi9zb3J0LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2NhbGwgZnJvbSBcIi4vY2FsbC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9ub2RlcyBmcm9tIFwiLi9ub2Rlcy5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9ub2RlIGZyb20gXCIuL25vZGUuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc2l6ZSBmcm9tIFwiLi9zaXplLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2VtcHR5IGZyb20gXCIuL2VtcHR5LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2VhY2ggZnJvbSBcIi4vZWFjaC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9hdHRyIGZyb20gXCIuL2F0dHIuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc3R5bGUgZnJvbSBcIi4vc3R5bGUuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fcHJvcGVydHkgZnJvbSBcIi4vcHJvcGVydHkuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fY2xhc3NlZCBmcm9tIFwiLi9jbGFzc2VkLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3RleHQgZnJvbSBcIi4vdGV4dC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9odG1sIGZyb20gXCIuL2h0bWwuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fcmFpc2UgZnJvbSBcIi4vcmFpc2UuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fbG93ZXIgZnJvbSBcIi4vbG93ZXIuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fYXBwZW5kIGZyb20gXCIuL2FwcGVuZC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9pbnNlcnQgZnJvbSBcIi4vaW5zZXJ0LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3JlbW92ZSBmcm9tIFwiLi9yZW1vdmUuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fY2xvbmUgZnJvbSBcIi4vY2xvbmUuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZGF0dW0gZnJvbSBcIi4vZGF0dW0uanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fb24gZnJvbSBcIi4vb24uanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZGlzcGF0Y2ggZnJvbSBcIi4vZGlzcGF0Y2guanNcIjtcbmltcG9ydCBzZWxlY3Rpb25faXRlcmF0b3IgZnJvbSBcIi4vaXRlcmF0b3IuanNcIjtcblxuZXhwb3J0IHZhciByb290ID0gW251bGxdO1xuXG5leHBvcnQgZnVuY3Rpb24gU2VsZWN0aW9uKGdyb3VwcywgcGFyZW50cykge1xuICB0aGlzLl9ncm91cHMgPSBncm91cHM7XG4gIHRoaXMuX3BhcmVudHMgPSBwYXJlbnRzO1xufVxuXG5mdW5jdGlvbiBzZWxlY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKFtbZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XV0sIHJvb3QpO1xufVxuXG5mdW5jdGlvbiBzZWxlY3Rpb25fc2VsZWN0aW9uKCkge1xuICByZXR1cm4gdGhpcztcbn1cblxuU2VsZWN0aW9uLnByb3RvdHlwZSA9IHNlbGVjdGlvbi5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBTZWxlY3Rpb24sXG4gIHNlbGVjdDogc2VsZWN0aW9uX3NlbGVjdCxcbiAgc2VsZWN0QWxsOiBzZWxlY3Rpb25fc2VsZWN0QWxsLFxuICBzZWxlY3RDaGlsZDogc2VsZWN0aW9uX3NlbGVjdENoaWxkLFxuICBzZWxlY3RDaGlsZHJlbjogc2VsZWN0aW9uX3NlbGVjdENoaWxkcmVuLFxuICBmaWx0ZXI6IHNlbGVjdGlvbl9maWx0ZXIsXG4gIGRhdGE6IHNlbGVjdGlvbl9kYXRhLFxuICBlbnRlcjogc2VsZWN0aW9uX2VudGVyLFxuICBleGl0OiBzZWxlY3Rpb25fZXhpdCxcbiAgam9pbjogc2VsZWN0aW9uX2pvaW4sXG4gIG1lcmdlOiBzZWxlY3Rpb25fbWVyZ2UsXG4gIHNlbGVjdGlvbjogc2VsZWN0aW9uX3NlbGVjdGlvbixcbiAgb3JkZXI6IHNlbGVjdGlvbl9vcmRlcixcbiAgc29ydDogc2VsZWN0aW9uX3NvcnQsXG4gIGNhbGw6IHNlbGVjdGlvbl9jYWxsLFxuICBub2Rlczogc2VsZWN0aW9uX25vZGVzLFxuICBub2RlOiBzZWxlY3Rpb25fbm9kZSxcbiAgc2l6ZTogc2VsZWN0aW9uX3NpemUsXG4gIGVtcHR5OiBzZWxlY3Rpb25fZW1wdHksXG4gIGVhY2g6IHNlbGVjdGlvbl9lYWNoLFxuICBhdHRyOiBzZWxlY3Rpb25fYXR0cixcbiAgc3R5bGU6IHNlbGVjdGlvbl9zdHlsZSxcbiAgcHJvcGVydHk6IHNlbGVjdGlvbl9wcm9wZXJ0eSxcbiAgY2xhc3NlZDogc2VsZWN0aW9uX2NsYXNzZWQsXG4gIHRleHQ6IHNlbGVjdGlvbl90ZXh0LFxuICBodG1sOiBzZWxlY3Rpb25faHRtbCxcbiAgcmFpc2U6IHNlbGVjdGlvbl9yYWlzZSxcbiAgbG93ZXI6IHNlbGVjdGlvbl9sb3dlcixcbiAgYXBwZW5kOiBzZWxlY3Rpb25fYXBwZW5kLFxuICBpbnNlcnQ6IHNlbGVjdGlvbl9pbnNlcnQsXG4gIHJlbW92ZTogc2VsZWN0aW9uX3JlbW92ZSxcbiAgY2xvbmU6IHNlbGVjdGlvbl9jbG9uZSxcbiAgZGF0dW06IHNlbGVjdGlvbl9kYXR1bSxcbiAgb246IHNlbGVjdGlvbl9vbixcbiAgZGlzcGF0Y2g6IHNlbGVjdGlvbl9kaXNwYXRjaCxcbiAgW1N5bWJvbC5pdGVyYXRvcl06IHNlbGVjdGlvbl9pdGVyYXRvclxufTtcblxuZXhwb3J0IGRlZmF1bHQgc2VsZWN0aW9uO1xuIiwiaW1wb3J0IHtTZWxlY3Rpb24sIHJvb3R9IGZyb20gXCIuL3NlbGVjdGlvbi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gdHlwZW9mIHNlbGVjdG9yID09PSBcInN0cmluZ1wiXG4gICAgICA/IG5ldyBTZWxlY3Rpb24oW1tkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKV1dLCBbZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XSlcbiAgICAgIDogbmV3IFNlbGVjdGlvbihbW3NlbGVjdG9yXV0sIHJvb3QpO1xufVxuIiwiaW1wb3J0IGNyZWF0b3IgZnJvbSBcIi4vY3JlYXRvci5qc1wiO1xuaW1wb3J0IHNlbGVjdCBmcm9tIFwiLi9zZWxlY3QuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICByZXR1cm4gc2VsZWN0KGNyZWF0b3IobmFtZSkuY2FsbChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpKTtcbn1cbiIsInZhciBuZXh0SWQgPSAwO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBsb2NhbCgpIHtcbiAgcmV0dXJuIG5ldyBMb2NhbDtcbn1cblxuZnVuY3Rpb24gTG9jYWwoKSB7XG4gIHRoaXMuXyA9IFwiQFwiICsgKCsrbmV4dElkKS50b1N0cmluZygzNik7XG59XG5cbkxvY2FsLnByb3RvdHlwZSA9IGxvY2FsLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IExvY2FsLFxuICBnZXQ6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICB2YXIgaWQgPSB0aGlzLl87XG4gICAgd2hpbGUgKCEoaWQgaW4gbm9kZSkpIGlmICghKG5vZGUgPSBub2RlLnBhcmVudE5vZGUpKSByZXR1cm47XG4gICAgcmV0dXJuIG5vZGVbaWRdO1xuICB9LFxuICBzZXQ6IGZ1bmN0aW9uKG5vZGUsIHZhbHVlKSB7XG4gICAgcmV0dXJuIG5vZGVbdGhpcy5fXSA9IHZhbHVlO1xuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICByZXR1cm4gdGhpcy5fIGluIG5vZGUgJiYgZGVsZXRlIG5vZGVbdGhpcy5fXTtcbiAgfSxcbiAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl87XG4gIH1cbn07XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihldmVudCkge1xuICBsZXQgc291cmNlRXZlbnQ7XG4gIHdoaWxlIChzb3VyY2VFdmVudCA9IGV2ZW50LnNvdXJjZUV2ZW50KSBldmVudCA9IHNvdXJjZUV2ZW50O1xuICByZXR1cm4gZXZlbnQ7XG59XG4iLCJpbXBvcnQgc291cmNlRXZlbnQgZnJvbSBcIi4vc291cmNlRXZlbnQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oZXZlbnQsIG5vZGUpIHtcbiAgZXZlbnQgPSBzb3VyY2VFdmVudChldmVudCk7XG4gIGlmIChub2RlID09PSB1bmRlZmluZWQpIG5vZGUgPSBldmVudC5jdXJyZW50VGFyZ2V0O1xuICBpZiAobm9kZSkge1xuICAgIHZhciBzdmcgPSBub2RlLm93bmVyU1ZHRWxlbWVudCB8fCBub2RlO1xuICAgIGlmIChzdmcuY3JlYXRlU1ZHUG9pbnQpIHtcbiAgICAgIHZhciBwb2ludCA9IHN2Zy5jcmVhdGVTVkdQb2ludCgpO1xuICAgICAgcG9pbnQueCA9IGV2ZW50LmNsaWVudFgsIHBvaW50LnkgPSBldmVudC5jbGllbnRZO1xuICAgICAgcG9pbnQgPSBwb2ludC5tYXRyaXhUcmFuc2Zvcm0obm9kZS5nZXRTY3JlZW5DVE0oKS5pbnZlcnNlKCkpO1xuICAgICAgcmV0dXJuIFtwb2ludC54LCBwb2ludC55XTtcbiAgICB9XG4gICAgaWYgKG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KSB7XG4gICAgICB2YXIgcmVjdCA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICByZXR1cm4gW2V2ZW50LmNsaWVudFggLSByZWN0LmxlZnQgLSBub2RlLmNsaWVudExlZnQsIGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcCAtIG5vZGUuY2xpZW50VG9wXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFtldmVudC5wYWdlWCwgZXZlbnQucGFnZVldO1xufVxuIiwiaW1wb3J0IHBvaW50ZXIgZnJvbSBcIi4vcG9pbnRlci5qc1wiO1xuaW1wb3J0IHNvdXJjZUV2ZW50IGZyb20gXCIuL3NvdXJjZUV2ZW50LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGV2ZW50cywgbm9kZSkge1xuICBpZiAoZXZlbnRzLnRhcmdldCkgeyAvLyBpLmUuLCBpbnN0YW5jZW9mIEV2ZW50LCBub3QgVG91Y2hMaXN0IG9yIGl0ZXJhYmxlXG4gICAgZXZlbnRzID0gc291cmNlRXZlbnQoZXZlbnRzKTtcbiAgICBpZiAobm9kZSA9PT0gdW5kZWZpbmVkKSBub2RlID0gZXZlbnRzLmN1cnJlbnRUYXJnZXQ7XG4gICAgZXZlbnRzID0gZXZlbnRzLnRvdWNoZXMgfHwgW2V2ZW50c107XG4gIH1cbiAgcmV0dXJuIEFycmF5LmZyb20oZXZlbnRzLCBldmVudCA9PiBwb2ludGVyKGV2ZW50LCBub2RlKSk7XG59XG4iLCJpbXBvcnQgYXJyYXkgZnJvbSBcIi4vYXJyYXkuanNcIjtcbmltcG9ydCB7U2VsZWN0aW9uLCByb290fSBmcm9tIFwiLi9zZWxlY3Rpb24vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgcmV0dXJuIHR5cGVvZiBzZWxlY3RvciA9PT0gXCJzdHJpbmdcIlxuICAgICAgPyBuZXcgU2VsZWN0aW9uKFtkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKV0sIFtkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRdKVxuICAgICAgOiBuZXcgU2VsZWN0aW9uKFthcnJheShzZWxlY3RvcildLCByb290KTtcbn1cbiIsImV4cG9ydCB7ZGVmYXVsdCBhcyBjcmVhdGV9IGZyb20gXCIuL2NyZWF0ZS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGNyZWF0b3J9IGZyb20gXCIuL2NyZWF0b3IuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBsb2NhbH0gZnJvbSBcIi4vbG9jYWwuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBtYXRjaGVyfSBmcm9tIFwiLi9tYXRjaGVyLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgbmFtZXNwYWNlfSBmcm9tIFwiLi9uYW1lc3BhY2UuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBuYW1lc3BhY2VzfSBmcm9tIFwiLi9uYW1lc3BhY2VzLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgcG9pbnRlcn0gZnJvbSBcIi4vcG9pbnRlci5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHBvaW50ZXJzfSBmcm9tIFwiLi9wb2ludGVycy5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHNlbGVjdH0gZnJvbSBcIi4vc2VsZWN0LmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgc2VsZWN0QWxsfSBmcm9tIFwiLi9zZWxlY3RBbGwuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBzZWxlY3Rpb259IGZyb20gXCIuL3NlbGVjdGlvbi9pbmRleC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHNlbGVjdG9yfSBmcm9tIFwiLi9zZWxlY3Rvci5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHNlbGVjdG9yQWxsfSBmcm9tIFwiLi9zZWxlY3RvckFsbC5qc1wiO1xuZXhwb3J0IHtzdHlsZVZhbHVlIGFzIHN0eWxlfSBmcm9tIFwiLi9zZWxlY3Rpb24vc3R5bGUuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyB3aW5kb3d9IGZyb20gXCIuL3dpbmRvdy5qc1wiO1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCkge1xuICByZXR1cm4gZnVuY3Rpb24gY29uc3RhbnQoKSB7XG4gICAgcmV0dXJuIHg7XG4gIH07XG59XG4iLCJleHBvcnQgY29uc3QgYWJzID0gTWF0aC5hYnM7XG5leHBvcnQgY29uc3QgYXRhbjIgPSBNYXRoLmF0YW4yO1xuZXhwb3J0IGNvbnN0IGNvcyA9IE1hdGguY29zO1xuZXhwb3J0IGNvbnN0IG1heCA9IE1hdGgubWF4O1xuZXhwb3J0IGNvbnN0IG1pbiA9IE1hdGgubWluO1xuZXhwb3J0IGNvbnN0IHNpbiA9IE1hdGguc2luO1xuZXhwb3J0IGNvbnN0IHNxcnQgPSBNYXRoLnNxcnQ7XG5cbmV4cG9ydCBjb25zdCBlcHNpbG9uID0gMWUtMTI7XG5leHBvcnQgY29uc3QgcGkgPSBNYXRoLlBJO1xuZXhwb3J0IGNvbnN0IGhhbGZQaSA9IHBpIC8gMjtcbmV4cG9ydCBjb25zdCB0YXUgPSAyICogcGk7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY29zKHgpIHtcbiAgcmV0dXJuIHggPiAxID8gMCA6IHggPCAtMSA/IHBpIDogTWF0aC5hY29zKHgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNpbih4KSB7XG4gIHJldHVybiB4ID49IDEgPyBoYWxmUGkgOiB4IDw9IC0xID8gLWhhbGZQaSA6IE1hdGguYXNpbih4KTtcbn1cbiIsImltcG9ydCB7UGF0aH0gZnJvbSBcImQzLXBhdGhcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhQYXRoKHNoYXBlKSB7XG4gIGxldCBkaWdpdHMgPSAzO1xuXG4gIHNoYXBlLmRpZ2l0cyA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBkaWdpdHM7XG4gICAgaWYgKF8gPT0gbnVsbCkge1xuICAgICAgZGlnaXRzID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZCA9IE1hdGguZmxvb3IoXyk7XG4gICAgICBpZiAoIShkID49IDApKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgaW52YWxpZCBkaWdpdHM6ICR7X31gKTtcbiAgICAgIGRpZ2l0cyA9IGQ7XG4gICAgfVxuICAgIHJldHVybiBzaGFwZTtcbiAgfTtcblxuICByZXR1cm4gKCkgPT4gbmV3IFBhdGgoZGlnaXRzKTtcbn1cbiIsImltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuaW1wb3J0IHthYnMsIGFjb3MsIGFzaW4sIGF0YW4yLCBjb3MsIGVwc2lsb24sIGhhbGZQaSwgbWF4LCBtaW4sIHBpLCBzaW4sIHNxcnQsIHRhdX0gZnJvbSBcIi4vbWF0aC5qc1wiO1xuaW1wb3J0IHt3aXRoUGF0aH0gZnJvbSBcIi4vcGF0aC5qc1wiO1xuXG5mdW5jdGlvbiBhcmNJbm5lclJhZGl1cyhkKSB7XG4gIHJldHVybiBkLmlubmVyUmFkaXVzO1xufVxuXG5mdW5jdGlvbiBhcmNPdXRlclJhZGl1cyhkKSB7XG4gIHJldHVybiBkLm91dGVyUmFkaXVzO1xufVxuXG5mdW5jdGlvbiBhcmNTdGFydEFuZ2xlKGQpIHtcbiAgcmV0dXJuIGQuc3RhcnRBbmdsZTtcbn1cblxuZnVuY3Rpb24gYXJjRW5kQW5nbGUoZCkge1xuICByZXR1cm4gZC5lbmRBbmdsZTtcbn1cblxuZnVuY3Rpb24gYXJjUGFkQW5nbGUoZCkge1xuICByZXR1cm4gZCAmJiBkLnBhZEFuZ2xlOyAvLyBOb3RlOiBvcHRpb25hbCFcbn1cblxuZnVuY3Rpb24gaW50ZXJzZWN0KHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIsIHgzLCB5Mykge1xuICB2YXIgeDEwID0geDEgLSB4MCwgeTEwID0geTEgLSB5MCxcbiAgICAgIHgzMiA9IHgzIC0geDIsIHkzMiA9IHkzIC0geTIsXG4gICAgICB0ID0geTMyICogeDEwIC0geDMyICogeTEwO1xuICBpZiAodCAqIHQgPCBlcHNpbG9uKSByZXR1cm47XG4gIHQgPSAoeDMyICogKHkwIC0geTIpIC0geTMyICogKHgwIC0geDIpKSAvIHQ7XG4gIHJldHVybiBbeDAgKyB0ICogeDEwLCB5MCArIHQgKiB5MTBdO1xufVxuXG4vLyBDb21wdXRlIHBlcnBlbmRpY3VsYXIgb2Zmc2V0IGxpbmUgb2YgbGVuZ3RoIHJjLlxuLy8gaHR0cDovL21hdGh3b3JsZC53b2xmcmFtLmNvbS9DaXJjbGUtTGluZUludGVyc2VjdGlvbi5odG1sXG5mdW5jdGlvbiBjb3JuZXJUYW5nZW50cyh4MCwgeTAsIHgxLCB5MSwgcjEsIHJjLCBjdykge1xuICB2YXIgeDAxID0geDAgLSB4MSxcbiAgICAgIHkwMSA9IHkwIC0geTEsXG4gICAgICBsbyA9IChjdyA/IHJjIDogLXJjKSAvIHNxcnQoeDAxICogeDAxICsgeTAxICogeTAxKSxcbiAgICAgIG94ID0gbG8gKiB5MDEsXG4gICAgICBveSA9IC1sbyAqIHgwMSxcbiAgICAgIHgxMSA9IHgwICsgb3gsXG4gICAgICB5MTEgPSB5MCArIG95LFxuICAgICAgeDEwID0geDEgKyBveCxcbiAgICAgIHkxMCA9IHkxICsgb3ksXG4gICAgICB4MDAgPSAoeDExICsgeDEwKSAvIDIsXG4gICAgICB5MDAgPSAoeTExICsgeTEwKSAvIDIsXG4gICAgICBkeCA9IHgxMCAtIHgxMSxcbiAgICAgIGR5ID0geTEwIC0geTExLFxuICAgICAgZDIgPSBkeCAqIGR4ICsgZHkgKiBkeSxcbiAgICAgIHIgPSByMSAtIHJjLFxuICAgICAgRCA9IHgxMSAqIHkxMCAtIHgxMCAqIHkxMSxcbiAgICAgIGQgPSAoZHkgPCAwID8gLTEgOiAxKSAqIHNxcnQobWF4KDAsIHIgKiByICogZDIgLSBEICogRCkpLFxuICAgICAgY3gwID0gKEQgKiBkeSAtIGR4ICogZCkgLyBkMixcbiAgICAgIGN5MCA9ICgtRCAqIGR4IC0gZHkgKiBkKSAvIGQyLFxuICAgICAgY3gxID0gKEQgKiBkeSArIGR4ICogZCkgLyBkMixcbiAgICAgIGN5MSA9ICgtRCAqIGR4ICsgZHkgKiBkKSAvIGQyLFxuICAgICAgZHgwID0gY3gwIC0geDAwLFxuICAgICAgZHkwID0gY3kwIC0geTAwLFxuICAgICAgZHgxID0gY3gxIC0geDAwLFxuICAgICAgZHkxID0gY3kxIC0geTAwO1xuXG4gIC8vIFBpY2sgdGhlIGNsb3NlciBvZiB0aGUgdHdvIGludGVyc2VjdGlvbiBwb2ludHMuXG4gIC8vIFRPRE8gSXMgdGhlcmUgYSBmYXN0ZXIgd2F5IHRvIGRldGVybWluZSB3aGljaCBpbnRlcnNlY3Rpb24gdG8gdXNlP1xuICBpZiAoZHgwICogZHgwICsgZHkwICogZHkwID4gZHgxICogZHgxICsgZHkxICogZHkxKSBjeDAgPSBjeDEsIGN5MCA9IGN5MTtcblxuICByZXR1cm4ge1xuICAgIGN4OiBjeDAsXG4gICAgY3k6IGN5MCxcbiAgICB4MDE6IC1veCxcbiAgICB5MDE6IC1veSxcbiAgICB4MTE6IGN4MCAqIChyMSAvIHIgLSAxKSxcbiAgICB5MTE6IGN5MCAqIChyMSAvIHIgLSAxKVxuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIGlubmVyUmFkaXVzID0gYXJjSW5uZXJSYWRpdXMsXG4gICAgICBvdXRlclJhZGl1cyA9IGFyY091dGVyUmFkaXVzLFxuICAgICAgY29ybmVyUmFkaXVzID0gY29uc3RhbnQoMCksXG4gICAgICBwYWRSYWRpdXMgPSBudWxsLFxuICAgICAgc3RhcnRBbmdsZSA9IGFyY1N0YXJ0QW5nbGUsXG4gICAgICBlbmRBbmdsZSA9IGFyY0VuZEFuZ2xlLFxuICAgICAgcGFkQW5nbGUgPSBhcmNQYWRBbmdsZSxcbiAgICAgIGNvbnRleHQgPSBudWxsLFxuICAgICAgcGF0aCA9IHdpdGhQYXRoKGFyYyk7XG5cbiAgZnVuY3Rpb24gYXJjKCkge1xuICAgIHZhciBidWZmZXIsXG4gICAgICAgIHIsXG4gICAgICAgIHIwID0gK2lubmVyUmFkaXVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyksXG4gICAgICAgIHIxID0gK291dGVyUmFkaXVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyksXG4gICAgICAgIGEwID0gc3RhcnRBbmdsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpIC0gaGFsZlBpLFxuICAgICAgICBhMSA9IGVuZEFuZ2xlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgLSBoYWxmUGksXG4gICAgICAgIGRhID0gYWJzKGExIC0gYTApLFxuICAgICAgICBjdyA9IGExID4gYTA7XG5cbiAgICBpZiAoIWNvbnRleHQpIGNvbnRleHQgPSBidWZmZXIgPSBwYXRoKCk7XG5cbiAgICAvLyBFbnN1cmUgdGhhdCB0aGUgb3V0ZXIgcmFkaXVzIGlzIGFsd2F5cyBsYXJnZXIgdGhhbiB0aGUgaW5uZXIgcmFkaXVzLlxuICAgIGlmIChyMSA8IHIwKSByID0gcjEsIHIxID0gcjAsIHIwID0gcjtcblxuICAgIC8vIElzIGl0IGEgcG9pbnQ/XG4gICAgaWYgKCEocjEgPiBlcHNpbG9uKSkgY29udGV4dC5tb3ZlVG8oMCwgMCk7XG5cbiAgICAvLyBPciBpcyBpdCBhIGNpcmNsZSBvciBhbm51bHVzP1xuICAgIGVsc2UgaWYgKGRhID4gdGF1IC0gZXBzaWxvbikge1xuICAgICAgY29udGV4dC5tb3ZlVG8ocjEgKiBjb3MoYTApLCByMSAqIHNpbihhMCkpO1xuICAgICAgY29udGV4dC5hcmMoMCwgMCwgcjEsIGEwLCBhMSwgIWN3KTtcbiAgICAgIGlmIChyMCA+IGVwc2lsb24pIHtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8ocjAgKiBjb3MoYTEpLCByMCAqIHNpbihhMSkpO1xuICAgICAgICBjb250ZXh0LmFyYygwLCAwLCByMCwgYTEsIGEwLCBjdyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gT3IgaXMgaXQgYSBjaXJjdWxhciBvciBhbm51bGFyIHNlY3Rvcj9cbiAgICBlbHNlIHtcbiAgICAgIHZhciBhMDEgPSBhMCxcbiAgICAgICAgICBhMTEgPSBhMSxcbiAgICAgICAgICBhMDAgPSBhMCxcbiAgICAgICAgICBhMTAgPSBhMSxcbiAgICAgICAgICBkYTAgPSBkYSxcbiAgICAgICAgICBkYTEgPSBkYSxcbiAgICAgICAgICBhcCA9IHBhZEFuZ2xlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgLyAyLFxuICAgICAgICAgIHJwID0gKGFwID4gZXBzaWxvbikgJiYgKHBhZFJhZGl1cyA/ICtwYWRSYWRpdXMuYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IHNxcnQocjAgKiByMCArIHIxICogcjEpKSxcbiAgICAgICAgICByYyA9IG1pbihhYnMocjEgLSByMCkgLyAyLCArY29ybmVyUmFkaXVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpLFxuICAgICAgICAgIHJjMCA9IHJjLFxuICAgICAgICAgIHJjMSA9IHJjLFxuICAgICAgICAgIHQwLFxuICAgICAgICAgIHQxO1xuXG4gICAgICAvLyBBcHBseSBwYWRkaW5nPyBOb3RlIHRoYXQgc2luY2UgcjEg4omlIHIwLCBkYTEg4omlIGRhMC5cbiAgICAgIGlmIChycCA+IGVwc2lsb24pIHtcbiAgICAgICAgdmFyIHAwID0gYXNpbihycCAvIHIwICogc2luKGFwKSksXG4gICAgICAgICAgICBwMSA9IGFzaW4ocnAgLyByMSAqIHNpbihhcCkpO1xuICAgICAgICBpZiAoKGRhMCAtPSBwMCAqIDIpID4gZXBzaWxvbikgcDAgKj0gKGN3ID8gMSA6IC0xKSwgYTAwICs9IHAwLCBhMTAgLT0gcDA7XG4gICAgICAgIGVsc2UgZGEwID0gMCwgYTAwID0gYTEwID0gKGEwICsgYTEpIC8gMjtcbiAgICAgICAgaWYgKChkYTEgLT0gcDEgKiAyKSA+IGVwc2lsb24pIHAxICo9IChjdyA/IDEgOiAtMSksIGEwMSArPSBwMSwgYTExIC09IHAxO1xuICAgICAgICBlbHNlIGRhMSA9IDAsIGEwMSA9IGExMSA9IChhMCArIGExKSAvIDI7XG4gICAgICB9XG5cbiAgICAgIHZhciB4MDEgPSByMSAqIGNvcyhhMDEpLFxuICAgICAgICAgIHkwMSA9IHIxICogc2luKGEwMSksXG4gICAgICAgICAgeDEwID0gcjAgKiBjb3MoYTEwKSxcbiAgICAgICAgICB5MTAgPSByMCAqIHNpbihhMTApO1xuXG4gICAgICAvLyBBcHBseSByb3VuZGVkIGNvcm5lcnM/XG4gICAgICBpZiAocmMgPiBlcHNpbG9uKSB7XG4gICAgICAgIHZhciB4MTEgPSByMSAqIGNvcyhhMTEpLFxuICAgICAgICAgICAgeTExID0gcjEgKiBzaW4oYTExKSxcbiAgICAgICAgICAgIHgwMCA9IHIwICogY29zKGEwMCksXG4gICAgICAgICAgICB5MDAgPSByMCAqIHNpbihhMDApLFxuICAgICAgICAgICAgb2M7XG5cbiAgICAgICAgLy8gUmVzdHJpY3QgdGhlIGNvcm5lciByYWRpdXMgYWNjb3JkaW5nIHRvIHRoZSBzZWN0b3IgYW5nbGUuIElmIHRoaXNcbiAgICAgICAgLy8gaW50ZXJzZWN0aW9uIGZhaWxzLCBpdOKAmXMgcHJvYmFibHkgYmVjYXVzZSB0aGUgYXJjIGlzIHRvbyBzbWFsbCwgc29cbiAgICAgICAgLy8gZGlzYWJsZSB0aGUgY29ybmVyIHJhZGl1cyBlbnRpcmVseS5cbiAgICAgICAgaWYgKGRhIDwgcGkpIHtcbiAgICAgICAgICBpZiAob2MgPSBpbnRlcnNlY3QoeDAxLCB5MDEsIHgwMCwgeTAwLCB4MTEsIHkxMSwgeDEwLCB5MTApKSB7XG4gICAgICAgICAgICB2YXIgYXggPSB4MDEgLSBvY1swXSxcbiAgICAgICAgICAgICAgICBheSA9IHkwMSAtIG9jWzFdLFxuICAgICAgICAgICAgICAgIGJ4ID0geDExIC0gb2NbMF0sXG4gICAgICAgICAgICAgICAgYnkgPSB5MTEgLSBvY1sxXSxcbiAgICAgICAgICAgICAgICBrYyA9IDEgLyBzaW4oYWNvcygoYXggKiBieCArIGF5ICogYnkpIC8gKHNxcnQoYXggKiBheCArIGF5ICogYXkpICogc3FydChieCAqIGJ4ICsgYnkgKiBieSkpKSAvIDIpLFxuICAgICAgICAgICAgICAgIGxjID0gc3FydChvY1swXSAqIG9jWzBdICsgb2NbMV0gKiBvY1sxXSk7XG4gICAgICAgICAgICByYzAgPSBtaW4ocmMsIChyMCAtIGxjKSAvIChrYyAtIDEpKTtcbiAgICAgICAgICAgIHJjMSA9IG1pbihyYywgKHIxIC0gbGMpIC8gKGtjICsgMSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByYzAgPSByYzEgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJcyB0aGUgc2VjdG9yIGNvbGxhcHNlZCB0byBhIGxpbmU/XG4gICAgICBpZiAoIShkYTEgPiBlcHNpbG9uKSkgY29udGV4dC5tb3ZlVG8oeDAxLCB5MDEpO1xuXG4gICAgICAvLyBEb2VzIHRoZSBzZWN0b3LigJlzIG91dGVyIHJpbmcgaGF2ZSByb3VuZGVkIGNvcm5lcnM/XG4gICAgICBlbHNlIGlmIChyYzEgPiBlcHNpbG9uKSB7XG4gICAgICAgIHQwID0gY29ybmVyVGFuZ2VudHMoeDAwLCB5MDAsIHgwMSwgeTAxLCByMSwgcmMxLCBjdyk7XG4gICAgICAgIHQxID0gY29ybmVyVGFuZ2VudHMoeDExLCB5MTEsIHgxMCwgeTEwLCByMSwgcmMxLCBjdyk7XG5cbiAgICAgICAgY29udGV4dC5tb3ZlVG8odDAuY3ggKyB0MC54MDEsIHQwLmN5ICsgdDAueTAxKTtcblxuICAgICAgICAvLyBIYXZlIHRoZSBjb3JuZXJzIG1lcmdlZD9cbiAgICAgICAgaWYgKHJjMSA8IHJjKSBjb250ZXh0LmFyYyh0MC5jeCwgdDAuY3ksIHJjMSwgYXRhbjIodDAueTAxLCB0MC54MDEpLCBhdGFuMih0MS55MDEsIHQxLngwMSksICFjdyk7XG5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBkcmF3IHRoZSB0d28gY29ybmVycyBhbmQgdGhlIHJpbmcuXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGNvbnRleHQuYXJjKHQwLmN4LCB0MC5jeSwgcmMxLCBhdGFuMih0MC55MDEsIHQwLngwMSksIGF0YW4yKHQwLnkxMSwgdDAueDExKSwgIWN3KTtcbiAgICAgICAgICBjb250ZXh0LmFyYygwLCAwLCByMSwgYXRhbjIodDAuY3kgKyB0MC55MTEsIHQwLmN4ICsgdDAueDExKSwgYXRhbjIodDEuY3kgKyB0MS55MTEsIHQxLmN4ICsgdDEueDExKSwgIWN3KTtcbiAgICAgICAgICBjb250ZXh0LmFyYyh0MS5jeCwgdDEuY3ksIHJjMSwgYXRhbjIodDEueTExLCB0MS54MTEpLCBhdGFuMih0MS55MDEsIHQxLngwMSksICFjdyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gT3IgaXMgdGhlIG91dGVyIHJpbmcganVzdCBhIGNpcmN1bGFyIGFyYz9cbiAgICAgIGVsc2UgY29udGV4dC5tb3ZlVG8oeDAxLCB5MDEpLCBjb250ZXh0LmFyYygwLCAwLCByMSwgYTAxLCBhMTEsICFjdyk7XG5cbiAgICAgIC8vIElzIHRoZXJlIG5vIGlubmVyIHJpbmcsIGFuZCBpdOKAmXMgYSBjaXJjdWxhciBzZWN0b3I/XG4gICAgICAvLyBPciBwZXJoYXBzIGl04oCZcyBhbiBhbm51bGFyIHNlY3RvciBjb2xsYXBzZWQgZHVlIHRvIHBhZGRpbmc/XG4gICAgICBpZiAoIShyMCA+IGVwc2lsb24pIHx8ICEoZGEwID4gZXBzaWxvbikpIGNvbnRleHQubGluZVRvKHgxMCwgeTEwKTtcblxuICAgICAgLy8gRG9lcyB0aGUgc2VjdG9y4oCZcyBpbm5lciByaW5nIChvciBwb2ludCkgaGF2ZSByb3VuZGVkIGNvcm5lcnM/XG4gICAgICBlbHNlIGlmIChyYzAgPiBlcHNpbG9uKSB7XG4gICAgICAgIHQwID0gY29ybmVyVGFuZ2VudHMoeDEwLCB5MTAsIHgxMSwgeTExLCByMCwgLXJjMCwgY3cpO1xuICAgICAgICB0MSA9IGNvcm5lclRhbmdlbnRzKHgwMSwgeTAxLCB4MDAsIHkwMCwgcjAsIC1yYzAsIGN3KTtcblxuICAgICAgICBjb250ZXh0LmxpbmVUbyh0MC5jeCArIHQwLngwMSwgdDAuY3kgKyB0MC55MDEpO1xuXG4gICAgICAgIC8vIEhhdmUgdGhlIGNvcm5lcnMgbWVyZ2VkP1xuICAgICAgICBpZiAocmMwIDwgcmMpIGNvbnRleHQuYXJjKHQwLmN4LCB0MC5jeSwgcmMwLCBhdGFuMih0MC55MDEsIHQwLngwMSksIGF0YW4yKHQxLnkwMSwgdDEueDAxKSwgIWN3KTtcblxuICAgICAgICAvLyBPdGhlcndpc2UsIGRyYXcgdGhlIHR3byBjb3JuZXJzIGFuZCB0aGUgcmluZy5cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgY29udGV4dC5hcmModDAuY3gsIHQwLmN5LCByYzAsIGF0YW4yKHQwLnkwMSwgdDAueDAxKSwgYXRhbjIodDAueTExLCB0MC54MTEpLCAhY3cpO1xuICAgICAgICAgIGNvbnRleHQuYXJjKDAsIDAsIHIwLCBhdGFuMih0MC5jeSArIHQwLnkxMSwgdDAuY3ggKyB0MC54MTEpLCBhdGFuMih0MS5jeSArIHQxLnkxMSwgdDEuY3ggKyB0MS54MTEpLCBjdyk7XG4gICAgICAgICAgY29udGV4dC5hcmModDEuY3gsIHQxLmN5LCByYzAsIGF0YW4yKHQxLnkxMSwgdDEueDExKSwgYXRhbjIodDEueTAxLCB0MS54MDEpLCAhY3cpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIE9yIGlzIHRoZSBpbm5lciByaW5nIGp1c3QgYSBjaXJjdWxhciBhcmM/XG4gICAgICBlbHNlIGNvbnRleHQuYXJjKDAsIDAsIHIwLCBhMTAsIGEwMCwgY3cpO1xuICAgIH1cblxuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG5cbiAgICBpZiAoYnVmZmVyKSByZXR1cm4gY29udGV4dCA9IG51bGwsIGJ1ZmZlciArIFwiXCIgfHwgbnVsbDtcbiAgfVxuXG4gIGFyYy5jZW50cm9pZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByID0gKCtpbm5lclJhZGl1cy5hcHBseSh0aGlzLCBhcmd1bWVudHMpICsgK291dGVyUmFkaXVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpIC8gMixcbiAgICAgICAgYSA9ICgrc3RhcnRBbmdsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpICsgK2VuZEFuZ2xlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpIC8gMiAtIHBpIC8gMjtcbiAgICByZXR1cm4gW2NvcyhhKSAqIHIsIHNpbihhKSAqIHJdO1xuICB9O1xuXG4gIGFyYy5pbm5lclJhZGl1cyA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChpbm5lclJhZGl1cyA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCBhcmMpIDogaW5uZXJSYWRpdXM7XG4gIH07XG5cbiAgYXJjLm91dGVyUmFkaXVzID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKG91dGVyUmFkaXVzID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIGFyYykgOiBvdXRlclJhZGl1cztcbiAgfTtcblxuICBhcmMuY29ybmVyUmFkaXVzID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGNvcm5lclJhZGl1cyA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCBhcmMpIDogY29ybmVyUmFkaXVzO1xuICB9O1xuXG4gIGFyYy5wYWRSYWRpdXMgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocGFkUmFkaXVzID0gXyA9PSBudWxsID8gbnVsbCA6IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCBhcmMpIDogcGFkUmFkaXVzO1xuICB9O1xuXG4gIGFyYy5zdGFydEFuZ2xlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHN0YXJ0QW5nbGUgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgYXJjKSA6IHN0YXJ0QW5nbGU7XG4gIH07XG5cbiAgYXJjLmVuZEFuZ2xlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGVuZEFuZ2xlID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIGFyYykgOiBlbmRBbmdsZTtcbiAgfTtcblxuICBhcmMucGFkQW5nbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocGFkQW5nbGUgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgYXJjKSA6IHBhZEFuZ2xlO1xuICB9O1xuXG4gIGFyYy5jb250ZXh0ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKChjb250ZXh0ID0gXyA9PSBudWxsID8gbnVsbCA6IF8pLCBhcmMpIDogY29udGV4dDtcbiAgfTtcblxuICByZXR1cm4gYXJjO1xufVxuIiwiZXhwb3J0IHZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCkge1xuICByZXR1cm4gdHlwZW9mIHggPT09IFwib2JqZWN0XCIgJiYgXCJsZW5ndGhcIiBpbiB4XG4gICAgPyB4IC8vIEFycmF5LCBUeXBlZEFycmF5LCBOb2RlTGlzdCwgYXJyYXktbGlrZVxuICAgIDogQXJyYXkuZnJvbSh4KTsgLy8gTWFwLCBTZXQsIGl0ZXJhYmxlLCBzdHJpbmcsIG9yIGFueXRoaW5nIGVsc2Vcbn1cbiIsImZ1bmN0aW9uIExpbmVhcihjb250ZXh0KSB7XG4gIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xufVxuXG5MaW5lYXIucHJvdG90eXBlID0ge1xuICBhcmVhU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSAwO1xuICB9LFxuICBhcmVhRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gTmFOO1xuICB9LFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3BvaW50ID0gMDtcbiAgfSxcbiAgbGluZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX2xpbmUgfHwgKHRoaXMuX2xpbmUgIT09IDAgJiYgdGhpcy5fcG9pbnQgPT09IDEpKSB0aGlzLl9jb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIHRoaXMuX2xpbmUgPSAxIC0gdGhpcy5fbGluZTtcbiAgfSxcbiAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB4ID0gK3gsIHkgPSAreTtcbiAgICBzd2l0Y2ggKHRoaXMuX3BvaW50KSB7XG4gICAgICBjYXNlIDA6IHRoaXMuX3BvaW50ID0gMTsgdGhpcy5fbGluZSA/IHRoaXMuX2NvbnRleHQubGluZVRvKHgsIHkpIDogdGhpcy5fY29udGV4dC5tb3ZlVG8oeCwgeSk7IGJyZWFrO1xuICAgICAgY2FzZSAxOiB0aGlzLl9wb2ludCA9IDI7IC8vIGZhbGxzIHRocm91Z2hcbiAgICAgIGRlZmF1bHQ6IHRoaXMuX2NvbnRleHQubGluZVRvKHgsIHkpOyBicmVhaztcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgcmV0dXJuIG5ldyBMaW5lYXIoY29udGV4dCk7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24geChwKSB7XG4gIHJldHVybiBwWzBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24geShwKSB7XG4gIHJldHVybiBwWzFdO1xufVxuIiwiaW1wb3J0IGFycmF5IGZyb20gXCIuL2FycmF5LmpzXCI7XG5pbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcbmltcG9ydCBjdXJ2ZUxpbmVhciBmcm9tIFwiLi9jdXJ2ZS9saW5lYXIuanNcIjtcbmltcG9ydCB7d2l0aFBhdGh9IGZyb20gXCIuL3BhdGguanNcIjtcbmltcG9ydCB7eCBhcyBwb2ludFgsIHkgYXMgcG9pbnRZfSBmcm9tIFwiLi9wb2ludC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih4LCB5KSB7XG4gIHZhciBkZWZpbmVkID0gY29uc3RhbnQodHJ1ZSksXG4gICAgICBjb250ZXh0ID0gbnVsbCxcbiAgICAgIGN1cnZlID0gY3VydmVMaW5lYXIsXG4gICAgICBvdXRwdXQgPSBudWxsLFxuICAgICAgcGF0aCA9IHdpdGhQYXRoKGxpbmUpO1xuXG4gIHggPSB0eXBlb2YgeCA9PT0gXCJmdW5jdGlvblwiID8geCA6ICh4ID09PSB1bmRlZmluZWQpID8gcG9pbnRYIDogY29uc3RhbnQoeCk7XG4gIHkgPSB0eXBlb2YgeSA9PT0gXCJmdW5jdGlvblwiID8geSA6ICh5ID09PSB1bmRlZmluZWQpID8gcG9pbnRZIDogY29uc3RhbnQoeSk7XG5cbiAgZnVuY3Rpb24gbGluZShkYXRhKSB7XG4gICAgdmFyIGksXG4gICAgICAgIG4gPSAoZGF0YSA9IGFycmF5KGRhdGEpKS5sZW5ndGgsXG4gICAgICAgIGQsXG4gICAgICAgIGRlZmluZWQwID0gZmFsc2UsXG4gICAgICAgIGJ1ZmZlcjtcblxuICAgIGlmIChjb250ZXh0ID09IG51bGwpIG91dHB1dCA9IGN1cnZlKGJ1ZmZlciA9IHBhdGgoKSk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDw9IG47ICsraSkge1xuICAgICAgaWYgKCEoaSA8IG4gJiYgZGVmaW5lZChkID0gZGF0YVtpXSwgaSwgZGF0YSkpID09PSBkZWZpbmVkMCkge1xuICAgICAgICBpZiAoZGVmaW5lZDAgPSAhZGVmaW5lZDApIG91dHB1dC5saW5lU3RhcnQoKTtcbiAgICAgICAgZWxzZSBvdXRwdXQubGluZUVuZCgpO1xuICAgICAgfVxuICAgICAgaWYgKGRlZmluZWQwKSBvdXRwdXQucG9pbnQoK3goZCwgaSwgZGF0YSksICt5KGQsIGksIGRhdGEpKTtcbiAgICB9XG5cbiAgICBpZiAoYnVmZmVyKSByZXR1cm4gb3V0cHV0ID0gbnVsbCwgYnVmZmVyICsgXCJcIiB8fCBudWxsO1xuICB9XG5cbiAgbGluZS54ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHggPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgbGluZSkgOiB4O1xuICB9O1xuXG4gIGxpbmUueSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh5ID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIGxpbmUpIDogeTtcbiAgfTtcblxuICBsaW5lLmRlZmluZWQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZGVmaW5lZCA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoISFfKSwgbGluZSkgOiBkZWZpbmVkO1xuICB9O1xuXG4gIGxpbmUuY3VydmUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoY3VydmUgPSBfLCBjb250ZXh0ICE9IG51bGwgJiYgKG91dHB1dCA9IGN1cnZlKGNvbnRleHQpKSwgbGluZSkgOiBjdXJ2ZTtcbiAgfTtcblxuICBsaW5lLmNvbnRleHQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoXyA9PSBudWxsID8gY29udGV4dCA9IG91dHB1dCA9IG51bGwgOiBvdXRwdXQgPSBjdXJ2ZShjb250ZXh0ID0gXyksIGxpbmUpIDogY29udGV4dDtcbiAgfTtcblxuICByZXR1cm4gbGluZTtcbn1cbiIsImltcG9ydCBhcnJheSBmcm9tIFwiLi9hcnJheS5qc1wiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5pbXBvcnQgY3VydmVMaW5lYXIgZnJvbSBcIi4vY3VydmUvbGluZWFyLmpzXCI7XG5pbXBvcnQgbGluZSBmcm9tIFwiLi9saW5lLmpzXCI7XG5pbXBvcnQge3dpdGhQYXRofSBmcm9tIFwiLi9wYXRoLmpzXCI7XG5pbXBvcnQge3ggYXMgcG9pbnRYLCB5IGFzIHBvaW50WX0gZnJvbSBcIi4vcG9pbnQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeDAsIHkwLCB5MSkge1xuICB2YXIgeDEgPSBudWxsLFxuICAgICAgZGVmaW5lZCA9IGNvbnN0YW50KHRydWUpLFxuICAgICAgY29udGV4dCA9IG51bGwsXG4gICAgICBjdXJ2ZSA9IGN1cnZlTGluZWFyLFxuICAgICAgb3V0cHV0ID0gbnVsbCxcbiAgICAgIHBhdGggPSB3aXRoUGF0aChhcmVhKTtcblxuICB4MCA9IHR5cGVvZiB4MCA9PT0gXCJmdW5jdGlvblwiID8geDAgOiAoeDAgPT09IHVuZGVmaW5lZCkgPyBwb2ludFggOiBjb25zdGFudCgreDApO1xuICB5MCA9IHR5cGVvZiB5MCA9PT0gXCJmdW5jdGlvblwiID8geTAgOiAoeTAgPT09IHVuZGVmaW5lZCkgPyBjb25zdGFudCgwKSA6IGNvbnN0YW50KCt5MCk7XG4gIHkxID0gdHlwZW9mIHkxID09PSBcImZ1bmN0aW9uXCIgPyB5MSA6ICh5MSA9PT0gdW5kZWZpbmVkKSA/IHBvaW50WSA6IGNvbnN0YW50KCt5MSk7XG5cbiAgZnVuY3Rpb24gYXJlYShkYXRhKSB7XG4gICAgdmFyIGksXG4gICAgICAgIGosXG4gICAgICAgIGssXG4gICAgICAgIG4gPSAoZGF0YSA9IGFycmF5KGRhdGEpKS5sZW5ndGgsXG4gICAgICAgIGQsXG4gICAgICAgIGRlZmluZWQwID0gZmFsc2UsXG4gICAgICAgIGJ1ZmZlcixcbiAgICAgICAgeDB6ID0gbmV3IEFycmF5KG4pLFxuICAgICAgICB5MHogPSBuZXcgQXJyYXkobik7XG5cbiAgICBpZiAoY29udGV4dCA9PSBudWxsKSBvdXRwdXQgPSBjdXJ2ZShidWZmZXIgPSBwYXRoKCkpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8PSBuOyArK2kpIHtcbiAgICAgIGlmICghKGkgPCBuICYmIGRlZmluZWQoZCA9IGRhdGFbaV0sIGksIGRhdGEpKSA9PT0gZGVmaW5lZDApIHtcbiAgICAgICAgaWYgKGRlZmluZWQwID0gIWRlZmluZWQwKSB7XG4gICAgICAgICAgaiA9IGk7XG4gICAgICAgICAgb3V0cHV0LmFyZWFTdGFydCgpO1xuICAgICAgICAgIG91dHB1dC5saW5lU3RhcnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvdXRwdXQubGluZUVuZCgpO1xuICAgICAgICAgIG91dHB1dC5saW5lU3RhcnQoKTtcbiAgICAgICAgICBmb3IgKGsgPSBpIC0gMTsgayA+PSBqOyAtLWspIHtcbiAgICAgICAgICAgIG91dHB1dC5wb2ludCh4MHpba10sIHkweltrXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG91dHB1dC5saW5lRW5kKCk7XG4gICAgICAgICAgb3V0cHV0LmFyZWFFbmQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGRlZmluZWQwKSB7XG4gICAgICAgIHgweltpXSA9ICt4MChkLCBpLCBkYXRhKSwgeTB6W2ldID0gK3kwKGQsIGksIGRhdGEpO1xuICAgICAgICBvdXRwdXQucG9pbnQoeDEgPyAreDEoZCwgaSwgZGF0YSkgOiB4MHpbaV0sIHkxID8gK3kxKGQsIGksIGRhdGEpIDogeTB6W2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYnVmZmVyKSByZXR1cm4gb3V0cHV0ID0gbnVsbCwgYnVmZmVyICsgXCJcIiB8fCBudWxsO1xuICB9XG5cbiAgZnVuY3Rpb24gYXJlYWxpbmUoKSB7XG4gICAgcmV0dXJuIGxpbmUoKS5kZWZpbmVkKGRlZmluZWQpLmN1cnZlKGN1cnZlKS5jb250ZXh0KGNvbnRleHQpO1xuICB9XG5cbiAgYXJlYS54ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHgwID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIHgxID0gbnVsbCwgYXJlYSkgOiB4MDtcbiAgfTtcblxuICBhcmVhLngwID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHgwID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIGFyZWEpIDogeDA7XG4gIH07XG5cbiAgYXJlYS54MSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh4MSA9IF8gPT0gbnVsbCA/IG51bGwgOiB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgYXJlYSkgOiB4MTtcbiAgfTtcblxuICBhcmVhLnkgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoeTAgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgeTEgPSBudWxsLCBhcmVhKSA6IHkwO1xuICB9O1xuXG4gIGFyZWEueTAgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoeTAgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgYXJlYSkgOiB5MDtcbiAgfTtcblxuICBhcmVhLnkxID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHkxID0gXyA9PSBudWxsID8gbnVsbCA6IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCBhcmVhKSA6IHkxO1xuICB9O1xuXG4gIGFyZWEubGluZVgwID1cbiAgYXJlYS5saW5lWTAgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYXJlYWxpbmUoKS54KHgwKS55KHkwKTtcbiAgfTtcblxuICBhcmVhLmxpbmVZMSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBhcmVhbGluZSgpLngoeDApLnkoeTEpO1xuICB9O1xuXG4gIGFyZWEubGluZVgxID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGFyZWFsaW5lKCkueCh4MSkueSh5MCk7XG4gIH07XG5cbiAgYXJlYS5kZWZpbmVkID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGRlZmluZWQgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCEhXyksIGFyZWEpIDogZGVmaW5lZDtcbiAgfTtcblxuICBhcmVhLmN1cnZlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGN1cnZlID0gXywgY29udGV4dCAhPSBudWxsICYmIChvdXRwdXQgPSBjdXJ2ZShjb250ZXh0KSksIGFyZWEpIDogY3VydmU7XG4gIH07XG5cbiAgYXJlYS5jb250ZXh0ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKF8gPT0gbnVsbCA/IGNvbnRleHQgPSBvdXRwdXQgPSBudWxsIDogb3V0cHV0ID0gY3VydmUoY29udGV4dCA9IF8pLCBhcmVhKSA6IGNvbnRleHQ7XG4gIH07XG5cbiAgcmV0dXJuIGFyZWE7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiBiIDwgYSA/IC0xIDogYiA+IGEgPyAxIDogYiA+PSBhID8gMCA6IE5hTjtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGQpIHtcbiAgcmV0dXJuIGQ7XG59XG4iLCJpbXBvcnQgYXJyYXkgZnJvbSBcIi4vYXJyYXkuanNcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuaW1wb3J0IGRlc2NlbmRpbmcgZnJvbSBcIi4vZGVzY2VuZGluZy5qc1wiO1xuaW1wb3J0IGlkZW50aXR5IGZyb20gXCIuL2lkZW50aXR5LmpzXCI7XG5pbXBvcnQge3RhdX0gZnJvbSBcIi4vbWF0aC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIHZhbHVlID0gaWRlbnRpdHksXG4gICAgICBzb3J0VmFsdWVzID0gZGVzY2VuZGluZyxcbiAgICAgIHNvcnQgPSBudWxsLFxuICAgICAgc3RhcnRBbmdsZSA9IGNvbnN0YW50KDApLFxuICAgICAgZW5kQW5nbGUgPSBjb25zdGFudCh0YXUpLFxuICAgICAgcGFkQW5nbGUgPSBjb25zdGFudCgwKTtcblxuICBmdW5jdGlvbiBwaWUoZGF0YSkge1xuICAgIHZhciBpLFxuICAgICAgICBuID0gKGRhdGEgPSBhcnJheShkYXRhKSkubGVuZ3RoLFxuICAgICAgICBqLFxuICAgICAgICBrLFxuICAgICAgICBzdW0gPSAwLFxuICAgICAgICBpbmRleCA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgYXJjcyA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgYTAgPSArc3RhcnRBbmdsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpLFxuICAgICAgICBkYSA9IE1hdGgubWluKHRhdSwgTWF0aC5tYXgoLXRhdSwgZW5kQW5nbGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSAtIGEwKSksXG4gICAgICAgIGExLFxuICAgICAgICBwID0gTWF0aC5taW4oTWF0aC5hYnMoZGEpIC8gbiwgcGFkQW5nbGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSksXG4gICAgICAgIHBhID0gcCAqIChkYSA8IDAgPyAtMSA6IDEpLFxuICAgICAgICB2O1xuXG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKCh2ID0gYXJjc1tpbmRleFtpXSA9IGldID0gK3ZhbHVlKGRhdGFbaV0sIGksIGRhdGEpKSA+IDApIHtcbiAgICAgICAgc3VtICs9IHY7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gT3B0aW9uYWxseSBzb3J0IHRoZSBhcmNzIGJ5IHByZXZpb3VzbHktY29tcHV0ZWQgdmFsdWVzIG9yIGJ5IGRhdGEuXG4gICAgaWYgKHNvcnRWYWx1ZXMgIT0gbnVsbCkgaW5kZXguc29ydChmdW5jdGlvbihpLCBqKSB7IHJldHVybiBzb3J0VmFsdWVzKGFyY3NbaV0sIGFyY3Nbal0pOyB9KTtcbiAgICBlbHNlIGlmIChzb3J0ICE9IG51bGwpIGluZGV4LnNvcnQoZnVuY3Rpb24oaSwgaikgeyByZXR1cm4gc29ydChkYXRhW2ldLCBkYXRhW2pdKTsgfSk7XG5cbiAgICAvLyBDb21wdXRlIHRoZSBhcmNzISBUaGV5IGFyZSBzdG9yZWQgaW4gdGhlIG9yaWdpbmFsIGRhdGEncyBvcmRlci5cbiAgICBmb3IgKGkgPSAwLCBrID0gc3VtID8gKGRhIC0gbiAqIHBhKSAvIHN1bSA6IDA7IGkgPCBuOyArK2ksIGEwID0gYTEpIHtcbiAgICAgIGogPSBpbmRleFtpXSwgdiA9IGFyY3Nbal0sIGExID0gYTAgKyAodiA+IDAgPyB2ICogayA6IDApICsgcGEsIGFyY3Nbal0gPSB7XG4gICAgICAgIGRhdGE6IGRhdGFbal0sXG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICB2YWx1ZTogdixcbiAgICAgICAgc3RhcnRBbmdsZTogYTAsXG4gICAgICAgIGVuZEFuZ2xlOiBhMSxcbiAgICAgICAgcGFkQW5nbGU6IHBcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyY3M7XG4gIH1cblxuICBwaWUudmFsdWUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodmFsdWUgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgcGllKSA6IHZhbHVlO1xuICB9O1xuXG4gIHBpZS5zb3J0VmFsdWVzID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHNvcnRWYWx1ZXMgPSBfLCBzb3J0ID0gbnVsbCwgcGllKSA6IHNvcnRWYWx1ZXM7XG4gIH07XG5cbiAgcGllLnNvcnQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoc29ydCA9IF8sIHNvcnRWYWx1ZXMgPSBudWxsLCBwaWUpIDogc29ydDtcbiAgfTtcblxuICBwaWUuc3RhcnRBbmdsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChzdGFydEFuZ2xlID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIHBpZSkgOiBzdGFydEFuZ2xlO1xuICB9O1xuXG4gIHBpZS5lbmRBbmdsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChlbmRBbmdsZSA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCBwaWUpIDogZW5kQW5nbGU7XG4gIH07XG5cbiAgcGllLnBhZEFuZ2xlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBhZEFuZ2xlID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIHBpZSkgOiBwYWRBbmdsZTtcbiAgfTtcblxuICByZXR1cm4gcGllO1xufVxuIiwiaW1wb3J0IGN1cnZlTGluZWFyIGZyb20gXCIuL2xpbmVhci5qc1wiO1xuXG5leHBvcnQgdmFyIGN1cnZlUmFkaWFsTGluZWFyID0gY3VydmVSYWRpYWwoY3VydmVMaW5lYXIpO1xuXG5mdW5jdGlvbiBSYWRpYWwoY3VydmUpIHtcbiAgdGhpcy5fY3VydmUgPSBjdXJ2ZTtcbn1cblxuUmFkaWFsLnByb3RvdHlwZSA9IHtcbiAgYXJlYVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9jdXJ2ZS5hcmVhU3RhcnQoKTtcbiAgfSxcbiAgYXJlYUVuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fY3VydmUuYXJlYUVuZCgpO1xuICB9LFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2N1cnZlLmxpbmVTdGFydCgpO1xuICB9LFxuICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9jdXJ2ZS5saW5lRW5kKCk7XG4gIH0sXG4gIHBvaW50OiBmdW5jdGlvbihhLCByKSB7XG4gICAgdGhpcy5fY3VydmUucG9pbnQociAqIE1hdGguc2luKGEpLCByICogLU1hdGguY29zKGEpKTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3VydmVSYWRpYWwoY3VydmUpIHtcblxuICBmdW5jdGlvbiByYWRpYWwoY29udGV4dCkge1xuICAgIHJldHVybiBuZXcgUmFkaWFsKGN1cnZlKGNvbnRleHQpKTtcbiAgfVxuXG4gIHJhZGlhbC5fY3VydmUgPSBjdXJ2ZTtcblxuICByZXR1cm4gcmFkaWFsO1xufVxuIiwiaW1wb3J0IGN1cnZlUmFkaWFsLCB7Y3VydmVSYWRpYWxMaW5lYXJ9IGZyb20gXCIuL2N1cnZlL3JhZGlhbC5qc1wiO1xuaW1wb3J0IGxpbmUgZnJvbSBcIi4vbGluZS5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gbGluZVJhZGlhbChsKSB7XG4gIHZhciBjID0gbC5jdXJ2ZTtcblxuICBsLmFuZ2xlID0gbC54LCBkZWxldGUgbC54O1xuICBsLnJhZGl1cyA9IGwueSwgZGVsZXRlIGwueTtcblxuICBsLmN1cnZlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gYyhjdXJ2ZVJhZGlhbChfKSkgOiBjKCkuX2N1cnZlO1xuICB9O1xuXG4gIHJldHVybiBsO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGxpbmVSYWRpYWwobGluZSgpLmN1cnZlKGN1cnZlUmFkaWFsTGluZWFyKSk7XG59XG4iLCJpbXBvcnQgY3VydmVSYWRpYWwsIHtjdXJ2ZVJhZGlhbExpbmVhcn0gZnJvbSBcIi4vY3VydmUvcmFkaWFsLmpzXCI7XG5pbXBvcnQgYXJlYSBmcm9tIFwiLi9hcmVhLmpzXCI7XG5pbXBvcnQge2xpbmVSYWRpYWx9IGZyb20gXCIuL2xpbmVSYWRpYWwuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBhID0gYXJlYSgpLmN1cnZlKGN1cnZlUmFkaWFsTGluZWFyKSxcbiAgICAgIGMgPSBhLmN1cnZlLFxuICAgICAgeDAgPSBhLmxpbmVYMCxcbiAgICAgIHgxID0gYS5saW5lWDEsXG4gICAgICB5MCA9IGEubGluZVkwLFxuICAgICAgeTEgPSBhLmxpbmVZMTtcblxuICBhLmFuZ2xlID0gYS54LCBkZWxldGUgYS54O1xuICBhLnN0YXJ0QW5nbGUgPSBhLngwLCBkZWxldGUgYS54MDtcbiAgYS5lbmRBbmdsZSA9IGEueDEsIGRlbGV0ZSBhLngxO1xuICBhLnJhZGl1cyA9IGEueSwgZGVsZXRlIGEueTtcbiAgYS5pbm5lclJhZGl1cyA9IGEueTAsIGRlbGV0ZSBhLnkwO1xuICBhLm91dGVyUmFkaXVzID0gYS55MSwgZGVsZXRlIGEueTE7XG4gIGEubGluZVN0YXJ0QW5nbGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGxpbmVSYWRpYWwoeDAoKSk7IH0sIGRlbGV0ZSBhLmxpbmVYMDtcbiAgYS5saW5lRW5kQW5nbGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGxpbmVSYWRpYWwoeDEoKSk7IH0sIGRlbGV0ZSBhLmxpbmVYMTtcbiAgYS5saW5lSW5uZXJSYWRpdXMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGxpbmVSYWRpYWwoeTAoKSk7IH0sIGRlbGV0ZSBhLmxpbmVZMDtcbiAgYS5saW5lT3V0ZXJSYWRpdXMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGxpbmVSYWRpYWwoeTEoKSk7IH0sIGRlbGV0ZSBhLmxpbmVZMTtcblxuICBhLmN1cnZlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gYyhjdXJ2ZVJhZGlhbChfKSkgOiBjKCkuX2N1cnZlO1xuICB9O1xuXG4gIHJldHVybiBhO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCwgeSkge1xuICByZXR1cm4gWyh5ID0gK3kpICogTWF0aC5jb3MoeCAtPSBNYXRoLlBJIC8gMiksIHkgKiBNYXRoLnNpbih4KV07XG59XG4iLCJpbXBvcnQgcG9pbnRSYWRpYWwgZnJvbSBcIi4uL3BvaW50UmFkaWFsLmpzXCI7XG5cbmNsYXNzIEJ1bXAge1xuICBjb25zdHJ1Y3Rvcihjb250ZXh0LCB4KSB7XG4gICAgdGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG4gICAgdGhpcy5feCA9IHg7XG4gIH1cbiAgYXJlYVN0YXJ0KCkge1xuICAgIHRoaXMuX2xpbmUgPSAwO1xuICB9XG4gIGFyZWFFbmQoKSB7XG4gICAgdGhpcy5fbGluZSA9IE5hTjtcbiAgfVxuICBsaW5lU3RhcnQoKSB7XG4gICAgdGhpcy5fcG9pbnQgPSAwO1xuICB9XG4gIGxpbmVFbmQoKSB7XG4gICAgaWYgKHRoaXMuX2xpbmUgfHwgKHRoaXMuX2xpbmUgIT09IDAgJiYgdGhpcy5fcG9pbnQgPT09IDEpKSB0aGlzLl9jb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIHRoaXMuX2xpbmUgPSAxIC0gdGhpcy5fbGluZTtcbiAgfVxuICBwb2ludCh4LCB5KSB7XG4gICAgeCA9ICt4LCB5ID0gK3k7XG4gICAgc3dpdGNoICh0aGlzLl9wb2ludCkge1xuICAgICAgY2FzZSAwOiB7XG4gICAgICAgIHRoaXMuX3BvaW50ID0gMTtcbiAgICAgICAgaWYgKHRoaXMuX2xpbmUpIHRoaXMuX2NvbnRleHQubGluZVRvKHgsIHkpO1xuICAgICAgICBlbHNlIHRoaXMuX2NvbnRleHQubW92ZVRvKHgsIHkpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgMTogdGhpcy5fcG9pbnQgPSAyOyAvLyBmYWxscyB0aHJvdWdoXG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIGlmICh0aGlzLl94KSB0aGlzLl9jb250ZXh0LmJlemllckN1cnZlVG8odGhpcy5feDAgPSAodGhpcy5feDAgKyB4KSAvIDIsIHRoaXMuX3kwLCB0aGlzLl94MCwgeSwgeCwgeSk7XG4gICAgICAgIGVsc2UgdGhpcy5fY29udGV4dC5iZXppZXJDdXJ2ZVRvKHRoaXMuX3gwLCB0aGlzLl95MCA9ICh0aGlzLl95MCArIHkpIC8gMiwgeCwgdGhpcy5feTAsIHgsIHkpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5feDAgPSB4LCB0aGlzLl95MCA9IHk7XG4gIH1cbn1cblxuY2xhc3MgQnVtcFJhZGlhbCB7XG4gIGNvbnN0cnVjdG9yKGNvbnRleHQpIHtcbiAgICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbiAgfVxuICBsaW5lU3RhcnQoKSB7XG4gICAgdGhpcy5fcG9pbnQgPSAwO1xuICB9XG4gIGxpbmVFbmQoKSB7fVxuICBwb2ludCh4LCB5KSB7XG4gICAgeCA9ICt4LCB5ID0gK3k7XG4gICAgaWYgKHRoaXMuX3BvaW50ID09PSAwKSB7XG4gICAgICB0aGlzLl9wb2ludCA9IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHAwID0gcG9pbnRSYWRpYWwodGhpcy5feDAsIHRoaXMuX3kwKTtcbiAgICAgIGNvbnN0IHAxID0gcG9pbnRSYWRpYWwodGhpcy5feDAsIHRoaXMuX3kwID0gKHRoaXMuX3kwICsgeSkgLyAyKTtcbiAgICAgIGNvbnN0IHAyID0gcG9pbnRSYWRpYWwoeCwgdGhpcy5feTApO1xuICAgICAgY29uc3QgcDMgPSBwb2ludFJhZGlhbCh4LCB5KTtcbiAgICAgIHRoaXMuX2NvbnRleHQubW92ZVRvKC4uLnAwKTtcbiAgICAgIHRoaXMuX2NvbnRleHQuYmV6aWVyQ3VydmVUbyguLi5wMSwgLi4ucDIsIC4uLnAzKTtcbiAgICB9XG4gICAgdGhpcy5feDAgPSB4LCB0aGlzLl95MCA9IHk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1bXBYKGNvbnRleHQpIHtcbiAgcmV0dXJuIG5ldyBCdW1wKGNvbnRleHQsIHRydWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVtcFkoY29udGV4dCkge1xuICByZXR1cm4gbmV3IEJ1bXAoY29udGV4dCwgZmFsc2UpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVtcFJhZGlhbChjb250ZXh0KSB7XG4gIHJldHVybiBuZXcgQnVtcFJhZGlhbChjb250ZXh0KTtcbn1cbiIsImltcG9ydCB7c2xpY2V9IGZyb20gXCIuL2FycmF5LmpzXCI7XG5pbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcbmltcG9ydCB7YnVtcFgsIGJ1bXBZLCBidW1wUmFkaWFsfSBmcm9tIFwiLi9jdXJ2ZS9idW1wLmpzXCI7XG5pbXBvcnQge3dpdGhQYXRofSBmcm9tIFwiLi9wYXRoLmpzXCI7XG5pbXBvcnQge3ggYXMgcG9pbnRYLCB5IGFzIHBvaW50WX0gZnJvbSBcIi4vcG9pbnQuanNcIjtcblxuZnVuY3Rpb24gbGlua1NvdXJjZShkKSB7XG4gIHJldHVybiBkLnNvdXJjZTtcbn1cblxuZnVuY3Rpb24gbGlua1RhcmdldChkKSB7XG4gIHJldHVybiBkLnRhcmdldDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpbmsoY3VydmUpIHtcbiAgbGV0IHNvdXJjZSA9IGxpbmtTb3VyY2UsXG4gICAgICB0YXJnZXQgPSBsaW5rVGFyZ2V0LFxuICAgICAgeCA9IHBvaW50WCxcbiAgICAgIHkgPSBwb2ludFksXG4gICAgICBjb250ZXh0ID0gbnVsbCxcbiAgICAgIG91dHB1dCA9IG51bGwsXG4gICAgICBwYXRoID0gd2l0aFBhdGgobGluayk7XG5cbiAgZnVuY3Rpb24gbGluaygpIHtcbiAgICBsZXQgYnVmZmVyO1xuICAgIGNvbnN0IGFyZ3YgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgY29uc3QgcyA9IHNvdXJjZS5hcHBseSh0aGlzLCBhcmd2KTtcbiAgICBjb25zdCB0ID0gdGFyZ2V0LmFwcGx5KHRoaXMsIGFyZ3YpO1xuICAgIGlmIChjb250ZXh0ID09IG51bGwpIG91dHB1dCA9IGN1cnZlKGJ1ZmZlciA9IHBhdGgoKSk7XG4gICAgb3V0cHV0LmxpbmVTdGFydCgpO1xuICAgIGFyZ3ZbMF0gPSBzLCBvdXRwdXQucG9pbnQoK3guYXBwbHkodGhpcywgYXJndiksICt5LmFwcGx5KHRoaXMsIGFyZ3YpKTtcbiAgICBhcmd2WzBdID0gdCwgb3V0cHV0LnBvaW50KCt4LmFwcGx5KHRoaXMsIGFyZ3YpLCAreS5hcHBseSh0aGlzLCBhcmd2KSk7XG4gICAgb3V0cHV0LmxpbmVFbmQoKTtcbiAgICBpZiAoYnVmZmVyKSByZXR1cm4gb3V0cHV0ID0gbnVsbCwgYnVmZmVyICsgXCJcIiB8fCBudWxsO1xuICB9XG5cbiAgbGluay5zb3VyY2UgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoc291cmNlID0gXywgbGluaykgOiBzb3VyY2U7XG4gIH07XG5cbiAgbGluay50YXJnZXQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodGFyZ2V0ID0gXywgbGluaykgOiB0YXJnZXQ7XG4gIH07XG5cbiAgbGluay54ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHggPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgbGluaykgOiB4O1xuICB9O1xuXG4gIGxpbmsueSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh5ID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIGxpbmspIDogeTtcbiAgfTtcblxuICBsaW5rLmNvbnRleHQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoXyA9PSBudWxsID8gY29udGV4dCA9IG91dHB1dCA9IG51bGwgOiBvdXRwdXQgPSBjdXJ2ZShjb250ZXh0ID0gXyksIGxpbmspIDogY29udGV4dDtcbiAgfTtcblxuICByZXR1cm4gbGluaztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpbmtIb3Jpem9udGFsKCkge1xuICByZXR1cm4gbGluayhidW1wWCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaW5rVmVydGljYWwoKSB7XG4gIHJldHVybiBsaW5rKGJ1bXBZKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpbmtSYWRpYWwoKSB7XG4gIGNvbnN0IGwgPSBsaW5rKGJ1bXBSYWRpYWwpO1xuICBsLmFuZ2xlID0gbC54LCBkZWxldGUgbC54O1xuICBsLnJhZGl1cyA9IGwueSwgZGVsZXRlIGwueTtcbiAgcmV0dXJuIGw7XG59XG4iLCJpbXBvcnQge21pbiwgc3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcblxuY29uc3Qgc3FydDMgPSBzcXJ0KDMpO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGRyYXcoY29udGV4dCwgc2l6ZSkge1xuICAgIGNvbnN0IHIgPSBzcXJ0KHNpemUgKyBtaW4oc2l6ZSAvIDI4LCAwLjc1KSkgKiAwLjU5NDM2O1xuICAgIGNvbnN0IHQgPSByIC8gMjtcbiAgICBjb25zdCB1ID0gdCAqIHNxcnQzO1xuICAgIGNvbnRleHQubW92ZVRvKDAsIHIpO1xuICAgIGNvbnRleHQubGluZVRvKDAsIC1yKTtcbiAgICBjb250ZXh0Lm1vdmVUbygtdSwgLXQpO1xuICAgIGNvbnRleHQubGluZVRvKHUsIHQpO1xuICAgIGNvbnRleHQubW92ZVRvKC11LCB0KTtcbiAgICBjb250ZXh0LmxpbmVUbyh1LCAtdCk7XG4gIH1cbn07XG4iLCJpbXBvcnQge3BpLCBzcXJ0LCB0YXV9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZHJhdyhjb250ZXh0LCBzaXplKSB7XG4gICAgY29uc3QgciA9IHNxcnQoc2l6ZSAvIHBpKTtcbiAgICBjb250ZXh0Lm1vdmVUbyhyLCAwKTtcbiAgICBjb250ZXh0LmFyYygwLCAwLCByLCAwLCB0YXUpO1xuICB9XG59O1xuIiwiaW1wb3J0IHtzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGRyYXcoY29udGV4dCwgc2l6ZSkge1xuICAgIGNvbnN0IHIgPSBzcXJ0KHNpemUgLyA1KSAvIDI7XG4gICAgY29udGV4dC5tb3ZlVG8oLTMgKiByLCAtcik7XG4gICAgY29udGV4dC5saW5lVG8oLXIsIC1yKTtcbiAgICBjb250ZXh0LmxpbmVUbygtciwgLTMgKiByKTtcbiAgICBjb250ZXh0LmxpbmVUbyhyLCAtMyAqIHIpO1xuICAgIGNvbnRleHQubGluZVRvKHIsIC1yKTtcbiAgICBjb250ZXh0LmxpbmVUbygzICogciwgLXIpO1xuICAgIGNvbnRleHQubGluZVRvKDMgKiByLCByKTtcbiAgICBjb250ZXh0LmxpbmVUbyhyLCByKTtcbiAgICBjb250ZXh0LmxpbmVUbyhyLCAzICogcik7XG4gICAgY29udGV4dC5saW5lVG8oLXIsIDMgKiByKTtcbiAgICBjb250ZXh0LmxpbmVUbygtciwgcik7XG4gICAgY29udGV4dC5saW5lVG8oLTMgKiByLCByKTtcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICB9XG59O1xuIiwiaW1wb3J0IHtzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuXG5jb25zdCB0YW4zMCA9IHNxcnQoMSAvIDMpO1xuY29uc3QgdGFuMzBfMiA9IHRhbjMwICogMjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBkcmF3KGNvbnRleHQsIHNpemUpIHtcbiAgICBjb25zdCB5ID0gc3FydChzaXplIC8gdGFuMzBfMik7XG4gICAgY29uc3QgeCA9IHkgKiB0YW4zMDtcbiAgICBjb250ZXh0Lm1vdmVUbygwLCAteSk7XG4gICAgY29udGV4dC5saW5lVG8oeCwgMCk7XG4gICAgY29udGV4dC5saW5lVG8oMCwgeSk7XG4gICAgY29udGV4dC5saW5lVG8oLXgsIDApO1xuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gIH1cbn07XG4iLCJpbXBvcnQge3NxcnR9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZHJhdyhjb250ZXh0LCBzaXplKSB7XG4gICAgY29uc3QgciA9IHNxcnQoc2l6ZSkgKiAwLjYyNjI1O1xuICAgIGNvbnRleHQubW92ZVRvKDAsIC1yKTtcbiAgICBjb250ZXh0LmxpbmVUbyhyLCAwKTtcbiAgICBjb250ZXh0LmxpbmVUbygwLCByKTtcbiAgICBjb250ZXh0LmxpbmVUbygtciwgMCk7XG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgfVxufTtcbiIsImltcG9ydCB7bWluLCBzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGRyYXcoY29udGV4dCwgc2l6ZSkge1xuICAgIGNvbnN0IHIgPSBzcXJ0KHNpemUgLSBtaW4oc2l6ZSAvIDcsIDIpKSAqIDAuODc1NTk7XG4gICAgY29udGV4dC5tb3ZlVG8oLXIsIDApO1xuICAgIGNvbnRleHQubGluZVRvKHIsIDApO1xuICAgIGNvbnRleHQubW92ZVRvKDAsIHIpO1xuICAgIGNvbnRleHQubGluZVRvKDAsIC1yKTtcbiAgfVxufTtcbiIsImltcG9ydCB7c3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBkcmF3KGNvbnRleHQsIHNpemUpIHtcbiAgICBjb25zdCB3ID0gc3FydChzaXplKTtcbiAgICBjb25zdCB4ID0gLXcgLyAyO1xuICAgIGNvbnRleHQucmVjdCh4LCB4LCB3LCB3KTtcbiAgfVxufTtcbiIsImltcG9ydCB7c3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBkcmF3KGNvbnRleHQsIHNpemUpIHtcbiAgICBjb25zdCByID0gc3FydChzaXplKSAqIDAuNDQzMTtcbiAgICBjb250ZXh0Lm1vdmVUbyhyLCByKTtcbiAgICBjb250ZXh0LmxpbmVUbyhyLCAtcik7XG4gICAgY29udGV4dC5saW5lVG8oLXIsIC1yKTtcbiAgICBjb250ZXh0LmxpbmVUbygtciwgcik7XG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgfVxufTtcbiIsImltcG9ydCB7c2luLCBjb3MsIHNxcnQsIHBpLCB0YXV9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5cbmNvbnN0IGthID0gMC44OTA4MTMwOTE1MjkyODUyMjgxMDtcbmNvbnN0IGtyID0gc2luKHBpIC8gMTApIC8gc2luKDcgKiBwaSAvIDEwKTtcbmNvbnN0IGt4ID0gc2luKHRhdSAvIDEwKSAqIGtyO1xuY29uc3Qga3kgPSAtY29zKHRhdSAvIDEwKSAqIGtyO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGRyYXcoY29udGV4dCwgc2l6ZSkge1xuICAgIGNvbnN0IHIgPSBzcXJ0KHNpemUgKiBrYSk7XG4gICAgY29uc3QgeCA9IGt4ICogcjtcbiAgICBjb25zdCB5ID0ga3kgKiByO1xuICAgIGNvbnRleHQubW92ZVRvKDAsIC1yKTtcbiAgICBjb250ZXh0LmxpbmVUbyh4LCB5KTtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IDU7ICsraSkge1xuICAgICAgY29uc3QgYSA9IHRhdSAqIGkgLyA1O1xuICAgICAgY29uc3QgYyA9IGNvcyhhKTtcbiAgICAgIGNvbnN0IHMgPSBzaW4oYSk7XG4gICAgICBjb250ZXh0LmxpbmVUbyhzICogciwgLWMgKiByKTtcbiAgICAgIGNvbnRleHQubGluZVRvKGMgKiB4IC0gcyAqIHksIHMgKiB4ICsgYyAqIHkpO1xuICAgIH1cbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICB9XG59O1xuIiwiaW1wb3J0IHtzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuXG5jb25zdCBzcXJ0MyA9IHNxcnQoMyk7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZHJhdyhjb250ZXh0LCBzaXplKSB7XG4gICAgY29uc3QgeSA9IC1zcXJ0KHNpemUgLyAoc3FydDMgKiAzKSk7XG4gICAgY29udGV4dC5tb3ZlVG8oMCwgeSAqIDIpO1xuICAgIGNvbnRleHQubGluZVRvKC1zcXJ0MyAqIHksIC15KTtcbiAgICBjb250ZXh0LmxpbmVUbyhzcXJ0MyAqIHksIC15KTtcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICB9XG59O1xuIiwiaW1wb3J0IHtzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuXG5jb25zdCBzcXJ0MyA9IHNxcnQoMyk7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZHJhdyhjb250ZXh0LCBzaXplKSB7XG4gICAgY29uc3QgcyA9IHNxcnQoc2l6ZSkgKiAwLjY4MjQ7XG4gICAgY29uc3QgdCA9IHMgIC8gMjtcbiAgICBjb25zdCB1ID0gKHMgKiBzcXJ0MykgLyAyOyAvLyBjb3MoTWF0aC5QSSAvIDYpXG4gICAgY29udGV4dC5tb3ZlVG8oMCwgLXMpO1xuICAgIGNvbnRleHQubGluZVRvKHUsIHQpO1xuICAgIGNvbnRleHQubGluZVRvKC11LCB0KTtcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICB9XG59O1xuIiwiaW1wb3J0IHtzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuXG5jb25zdCBjID0gLTAuNTtcbmNvbnN0IHMgPSBzcXJ0KDMpIC8gMjtcbmNvbnN0IGsgPSAxIC8gc3FydCgxMik7XG5jb25zdCBhID0gKGsgLyAyICsgMSkgKiAzO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGRyYXcoY29udGV4dCwgc2l6ZSkge1xuICAgIGNvbnN0IHIgPSBzcXJ0KHNpemUgLyBhKTtcbiAgICBjb25zdCB4MCA9IHIgLyAyLCB5MCA9IHIgKiBrO1xuICAgIGNvbnN0IHgxID0geDAsIHkxID0gciAqIGsgKyByO1xuICAgIGNvbnN0IHgyID0gLXgxLCB5MiA9IHkxO1xuICAgIGNvbnRleHQubW92ZVRvKHgwLCB5MCk7XG4gICAgY29udGV4dC5saW5lVG8oeDEsIHkxKTtcbiAgICBjb250ZXh0LmxpbmVUbyh4MiwgeTIpO1xuICAgIGNvbnRleHQubGluZVRvKGMgKiB4MCAtIHMgKiB5MCwgcyAqIHgwICsgYyAqIHkwKTtcbiAgICBjb250ZXh0LmxpbmVUbyhjICogeDEgLSBzICogeTEsIHMgKiB4MSArIGMgKiB5MSk7XG4gICAgY29udGV4dC5saW5lVG8oYyAqIHgyIC0gcyAqIHkyLCBzICogeDIgKyBjICogeTIpO1xuICAgIGNvbnRleHQubGluZVRvKGMgKiB4MCArIHMgKiB5MCwgYyAqIHkwIC0gcyAqIHgwKTtcbiAgICBjb250ZXh0LmxpbmVUbyhjICogeDEgKyBzICogeTEsIGMgKiB5MSAtIHMgKiB4MSk7XG4gICAgY29udGV4dC5saW5lVG8oYyAqIHgyICsgcyAqIHkyLCBjICogeTIgLSBzICogeDIpO1xuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gIH1cbn07XG4iLCJpbXBvcnQge21pbiwgc3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBkcmF3KGNvbnRleHQsIHNpemUpIHtcbiAgICBjb25zdCByID0gc3FydChzaXplIC0gbWluKHNpemUgLyA2LCAxLjcpKSAqIDAuNjE4OTtcbiAgICBjb250ZXh0Lm1vdmVUbygtciwgLXIpO1xuICAgIGNvbnRleHQubGluZVRvKHIsIHIpO1xuICAgIGNvbnRleHQubW92ZVRvKC1yLCByKTtcbiAgICBjb250ZXh0LmxpbmVUbyhyLCAtcik7XG4gIH1cbn07XG4iLCJpbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcbmltcG9ydCB7d2l0aFBhdGh9IGZyb20gXCIuL3BhdGguanNcIjtcbmltcG9ydCBhc3RlcmlzayBmcm9tIFwiLi9zeW1ib2wvYXN0ZXJpc2suanNcIjtcbmltcG9ydCBjaXJjbGUgZnJvbSBcIi4vc3ltYm9sL2NpcmNsZS5qc1wiO1xuaW1wb3J0IGNyb3NzIGZyb20gXCIuL3N5bWJvbC9jcm9zcy5qc1wiO1xuaW1wb3J0IGRpYW1vbmQgZnJvbSBcIi4vc3ltYm9sL2RpYW1vbmQuanNcIjtcbmltcG9ydCBkaWFtb25kMiBmcm9tIFwiLi9zeW1ib2wvZGlhbW9uZDIuanNcIjtcbmltcG9ydCBwbHVzIGZyb20gXCIuL3N5bWJvbC9wbHVzLmpzXCI7XG5pbXBvcnQgc3F1YXJlIGZyb20gXCIuL3N5bWJvbC9zcXVhcmUuanNcIjtcbmltcG9ydCBzcXVhcmUyIGZyb20gXCIuL3N5bWJvbC9zcXVhcmUyLmpzXCI7XG5pbXBvcnQgc3RhciBmcm9tIFwiLi9zeW1ib2wvc3Rhci5qc1wiO1xuaW1wb3J0IHRyaWFuZ2xlIGZyb20gXCIuL3N5bWJvbC90cmlhbmdsZS5qc1wiO1xuaW1wb3J0IHRyaWFuZ2xlMiBmcm9tIFwiLi9zeW1ib2wvdHJpYW5nbGUyLmpzXCI7XG5pbXBvcnQgd3llIGZyb20gXCIuL3N5bWJvbC93eWUuanNcIjtcbmltcG9ydCB0aW1lcyBmcm9tIFwiLi9zeW1ib2wvdGltZXMuanNcIjtcblxuLy8gVGhlc2Ugc3ltYm9scyBhcmUgZGVzaWduZWQgdG8gYmUgZmlsbGVkLlxuZXhwb3J0IGNvbnN0IHN5bWJvbHNGaWxsID0gW1xuICBjaXJjbGUsXG4gIGNyb3NzLFxuICBkaWFtb25kLFxuICBzcXVhcmUsXG4gIHN0YXIsXG4gIHRyaWFuZ2xlLFxuICB3eWVcbl07XG5cbi8vIFRoZXNlIHN5bWJvbHMgYXJlIGRlc2lnbmVkIHRvIGJlIHN0cm9rZWQgKHdpdGggYSB3aWR0aCBvZiAxLjVweCBhbmQgcm91bmQgY2FwcykuXG5leHBvcnQgY29uc3Qgc3ltYm9sc1N0cm9rZSA9IFtcbiAgY2lyY2xlLFxuICBwbHVzLFxuICB0aW1lcyxcbiAgdHJpYW5nbGUyLFxuICBhc3RlcmlzayxcbiAgc3F1YXJlMixcbiAgZGlhbW9uZDJcbl07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFN5bWJvbCh0eXBlLCBzaXplKSB7XG4gIGxldCBjb250ZXh0ID0gbnVsbCxcbiAgICAgIHBhdGggPSB3aXRoUGF0aChzeW1ib2wpO1xuXG4gIHR5cGUgPSB0eXBlb2YgdHlwZSA9PT0gXCJmdW5jdGlvblwiID8gdHlwZSA6IGNvbnN0YW50KHR5cGUgfHwgY2lyY2xlKTtcbiAgc2l6ZSA9IHR5cGVvZiBzaXplID09PSBcImZ1bmN0aW9uXCIgPyBzaXplIDogY29uc3RhbnQoc2l6ZSA9PT0gdW5kZWZpbmVkID8gNjQgOiArc2l6ZSk7XG5cbiAgZnVuY3Rpb24gc3ltYm9sKCkge1xuICAgIGxldCBidWZmZXI7XG4gICAgaWYgKCFjb250ZXh0KSBjb250ZXh0ID0gYnVmZmVyID0gcGF0aCgpO1xuICAgIHR5cGUuYXBwbHkodGhpcywgYXJndW1lbnRzKS5kcmF3KGNvbnRleHQsICtzaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgIGlmIChidWZmZXIpIHJldHVybiBjb250ZXh0ID0gbnVsbCwgYnVmZmVyICsgXCJcIiB8fCBudWxsO1xuICB9XG5cbiAgc3ltYm9sLnR5cGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodHlwZSA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoXyksIHN5bWJvbCkgOiB0eXBlO1xuICB9O1xuXG4gIHN5bWJvbC5zaXplID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHNpemUgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgc3ltYm9sKSA6IHNpemU7XG4gIH07XG5cbiAgc3ltYm9sLmNvbnRleHQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoY29udGV4dCA9IF8gPT0gbnVsbCA/IG51bGwgOiBfLCBzeW1ib2wpIDogY29udGV4dDtcbiAgfTtcblxuICByZXR1cm4gc3ltYm9sO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7fVxuIiwiZXhwb3J0IGZ1bmN0aW9uIHBvaW50KHRoYXQsIHgsIHkpIHtcbiAgdGhhdC5fY29udGV4dC5iZXppZXJDdXJ2ZVRvKFxuICAgICgyICogdGhhdC5feDAgKyB0aGF0Ll94MSkgLyAzLFxuICAgICgyICogdGhhdC5feTAgKyB0aGF0Ll95MSkgLyAzLFxuICAgICh0aGF0Ll94MCArIDIgKiB0aGF0Ll94MSkgLyAzLFxuICAgICh0aGF0Ll95MCArIDIgKiB0aGF0Ll95MSkgLyAzLFxuICAgICh0aGF0Ll94MCArIDQgKiB0aGF0Ll94MSArIHgpIC8gNixcbiAgICAodGhhdC5feTAgKyA0ICogdGhhdC5feTEgKyB5KSAvIDZcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJhc2lzKGNvbnRleHQpIHtcbiAgdGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG59XG5cbkJhc2lzLnByb3RvdHlwZSA9IHtcbiAgYXJlYVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gMDtcbiAgfSxcbiAgYXJlYUVuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fbGluZSA9IE5hTjtcbiAgfSxcbiAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl94MCA9IHRoaXMuX3gxID1cbiAgICB0aGlzLl95MCA9IHRoaXMuX3kxID0gTmFOO1xuICAgIHRoaXMuX3BvaW50ID0gMDtcbiAgfSxcbiAgbGluZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgc3dpdGNoICh0aGlzLl9wb2ludCkge1xuICAgICAgY2FzZSAzOiBwb2ludCh0aGlzLCB0aGlzLl94MSwgdGhpcy5feTEpOyAvLyBmYWxscyB0aHJvdWdoXG4gICAgICBjYXNlIDI6IHRoaXMuX2NvbnRleHQubGluZVRvKHRoaXMuX3gxLCB0aGlzLl95MSk7IGJyZWFrO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbGluZSB8fCAodGhpcy5fbGluZSAhPT0gMCAmJiB0aGlzLl9wb2ludCA9PT0gMSkpIHRoaXMuX2NvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgdGhpcy5fbGluZSA9IDEgLSB0aGlzLl9saW5lO1xuICB9LFxuICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgIHggPSAreCwgeSA9ICt5O1xuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMDogdGhpcy5fcG9pbnQgPSAxOyB0aGlzLl9saW5lID8gdGhpcy5fY29udGV4dC5saW5lVG8oeCwgeSkgOiB0aGlzLl9jb250ZXh0Lm1vdmVUbyh4LCB5KTsgYnJlYWs7XG4gICAgICBjYXNlIDE6IHRoaXMuX3BvaW50ID0gMjsgYnJlYWs7XG4gICAgICBjYXNlIDI6IHRoaXMuX3BvaW50ID0gMzsgdGhpcy5fY29udGV4dC5saW5lVG8oKDUgKiB0aGlzLl94MCArIHRoaXMuX3gxKSAvIDYsICg1ICogdGhpcy5feTAgKyB0aGlzLl95MSkgLyA2KTsgLy8gZmFsbHMgdGhyb3VnaFxuICAgICAgZGVmYXVsdDogcG9pbnQodGhpcywgeCwgeSk7IGJyZWFrO1xuICAgIH1cbiAgICB0aGlzLl94MCA9IHRoaXMuX3gxLCB0aGlzLl94MSA9IHg7XG4gICAgdGhpcy5feTAgPSB0aGlzLl95MSwgdGhpcy5feTEgPSB5O1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjb250ZXh0KSB7XG4gIHJldHVybiBuZXcgQmFzaXMoY29udGV4dCk7XG59XG4iLCJpbXBvcnQgbm9vcCBmcm9tIFwiLi4vbm9vcC5qc1wiO1xuaW1wb3J0IHtwb2ludH0gZnJvbSBcIi4vYmFzaXMuanNcIjtcblxuZnVuY3Rpb24gQmFzaXNDbG9zZWQoY29udGV4dCkge1xuICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbn1cblxuQmFzaXNDbG9zZWQucHJvdG90eXBlID0ge1xuICBhcmVhU3RhcnQ6IG5vb3AsXG4gIGFyZWFFbmQ6IG5vb3AsXG4gIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5feDAgPSB0aGlzLl94MSA9IHRoaXMuX3gyID0gdGhpcy5feDMgPSB0aGlzLl94NCA9XG4gICAgdGhpcy5feTAgPSB0aGlzLl95MSA9IHRoaXMuX3kyID0gdGhpcy5feTMgPSB0aGlzLl95NCA9IE5hTjtcbiAgICB0aGlzLl9wb2ludCA9IDA7XG4gIH0sXG4gIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMToge1xuICAgICAgICB0aGlzLl9jb250ZXh0Lm1vdmVUbyh0aGlzLl94MiwgdGhpcy5feTIpO1xuICAgICAgICB0aGlzLl9jb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgMjoge1xuICAgICAgICB0aGlzLl9jb250ZXh0Lm1vdmVUbygodGhpcy5feDIgKyAyICogdGhpcy5feDMpIC8gMywgKHRoaXMuX3kyICsgMiAqIHRoaXMuX3kzKSAvIDMpO1xuICAgICAgICB0aGlzLl9jb250ZXh0LmxpbmVUbygodGhpcy5feDMgKyAyICogdGhpcy5feDIpIC8gMywgKHRoaXMuX3kzICsgMiAqIHRoaXMuX3kyKSAvIDMpO1xuICAgICAgICB0aGlzLl9jb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgMzoge1xuICAgICAgICB0aGlzLnBvaW50KHRoaXMuX3gyLCB0aGlzLl95Mik7XG4gICAgICAgIHRoaXMucG9pbnQodGhpcy5feDMsIHRoaXMuX3kzKTtcbiAgICAgICAgdGhpcy5wb2ludCh0aGlzLl94NCwgdGhpcy5feTQpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgeCA9ICt4LCB5ID0gK3k7XG4gICAgc3dpdGNoICh0aGlzLl9wb2ludCkge1xuICAgICAgY2FzZSAwOiB0aGlzLl9wb2ludCA9IDE7IHRoaXMuX3gyID0geCwgdGhpcy5feTIgPSB5OyBicmVhaztcbiAgICAgIGNhc2UgMTogdGhpcy5fcG9pbnQgPSAyOyB0aGlzLl94MyA9IHgsIHRoaXMuX3kzID0geTsgYnJlYWs7XG4gICAgICBjYXNlIDI6IHRoaXMuX3BvaW50ID0gMzsgdGhpcy5feDQgPSB4LCB0aGlzLl95NCA9IHk7IHRoaXMuX2NvbnRleHQubW92ZVRvKCh0aGlzLl94MCArIDQgKiB0aGlzLl94MSArIHgpIC8gNiwgKHRoaXMuX3kwICsgNCAqIHRoaXMuX3kxICsgeSkgLyA2KTsgYnJlYWs7XG4gICAgICBkZWZhdWx0OiBwb2ludCh0aGlzLCB4LCB5KTsgYnJlYWs7XG4gICAgfVxuICAgIHRoaXMuX3gwID0gdGhpcy5feDEsIHRoaXMuX3gxID0geDtcbiAgICB0aGlzLl95MCA9IHRoaXMuX3kxLCB0aGlzLl95MSA9IHk7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgcmV0dXJuIG5ldyBCYXNpc0Nsb3NlZChjb250ZXh0KTtcbn1cbiIsImltcG9ydCB7cG9pbnR9IGZyb20gXCIuL2Jhc2lzLmpzXCI7XG5cbmZ1bmN0aW9uIEJhc2lzT3Blbihjb250ZXh0KSB7XG4gIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xufVxuXG5CYXNpc09wZW4ucHJvdG90eXBlID0ge1xuICBhcmVhU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSAwO1xuICB9LFxuICBhcmVhRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gTmFOO1xuICB9LFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3gwID0gdGhpcy5feDEgPVxuICAgIHRoaXMuX3kwID0gdGhpcy5feTEgPSBOYU47XG4gICAgdGhpcy5fcG9pbnQgPSAwO1xuICB9LFxuICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fbGluZSB8fCAodGhpcy5fbGluZSAhPT0gMCAmJiB0aGlzLl9wb2ludCA9PT0gMykpIHRoaXMuX2NvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgdGhpcy5fbGluZSA9IDEgLSB0aGlzLl9saW5lO1xuICB9LFxuICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgIHggPSAreCwgeSA9ICt5O1xuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMDogdGhpcy5fcG9pbnQgPSAxOyBicmVhaztcbiAgICAgIGNhc2UgMTogdGhpcy5fcG9pbnQgPSAyOyBicmVhaztcbiAgICAgIGNhc2UgMjogdGhpcy5fcG9pbnQgPSAzOyB2YXIgeDAgPSAodGhpcy5feDAgKyA0ICogdGhpcy5feDEgKyB4KSAvIDYsIHkwID0gKHRoaXMuX3kwICsgNCAqIHRoaXMuX3kxICsgeSkgLyA2OyB0aGlzLl9saW5lID8gdGhpcy5fY29udGV4dC5saW5lVG8oeDAsIHkwKSA6IHRoaXMuX2NvbnRleHQubW92ZVRvKHgwLCB5MCk7IGJyZWFrO1xuICAgICAgY2FzZSAzOiB0aGlzLl9wb2ludCA9IDQ7IC8vIGZhbGxzIHRocm91Z2hcbiAgICAgIGRlZmF1bHQ6IHBvaW50KHRoaXMsIHgsIHkpOyBicmVhaztcbiAgICB9XG4gICAgdGhpcy5feDAgPSB0aGlzLl94MSwgdGhpcy5feDEgPSB4O1xuICAgIHRoaXMuX3kwID0gdGhpcy5feTEsIHRoaXMuX3kxID0geTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY29udGV4dCkge1xuICByZXR1cm4gbmV3IEJhc2lzT3Blbihjb250ZXh0KTtcbn1cbiIsImltcG9ydCB7QmFzaXN9IGZyb20gXCIuL2Jhc2lzLmpzXCI7XG5cbmZ1bmN0aW9uIEJ1bmRsZShjb250ZXh0LCBiZXRhKSB7XG4gIHRoaXMuX2Jhc2lzID0gbmV3IEJhc2lzKGNvbnRleHQpO1xuICB0aGlzLl9iZXRhID0gYmV0YTtcbn1cblxuQnVuZGxlLnByb3RvdHlwZSA9IHtcbiAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl94ID0gW107XG4gICAgdGhpcy5feSA9IFtdO1xuICAgIHRoaXMuX2Jhc2lzLmxpbmVTdGFydCgpO1xuICB9LFxuICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgeCA9IHRoaXMuX3gsXG4gICAgICAgIHkgPSB0aGlzLl95LFxuICAgICAgICBqID0geC5sZW5ndGggLSAxO1xuXG4gICAgaWYgKGogPiAwKSB7XG4gICAgICB2YXIgeDAgPSB4WzBdLFxuICAgICAgICAgIHkwID0geVswXSxcbiAgICAgICAgICBkeCA9IHhbal0gLSB4MCxcbiAgICAgICAgICBkeSA9IHlbal0gLSB5MCxcbiAgICAgICAgICBpID0gLTEsXG4gICAgICAgICAgdDtcblxuICAgICAgd2hpbGUgKCsraSA8PSBqKSB7XG4gICAgICAgIHQgPSBpIC8gajtcbiAgICAgICAgdGhpcy5fYmFzaXMucG9pbnQoXG4gICAgICAgICAgdGhpcy5fYmV0YSAqIHhbaV0gKyAoMSAtIHRoaXMuX2JldGEpICogKHgwICsgdCAqIGR4KSxcbiAgICAgICAgICB0aGlzLl9iZXRhICogeVtpXSArICgxIC0gdGhpcy5fYmV0YSkgKiAoeTAgKyB0ICogZHkpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5feCA9IHRoaXMuX3kgPSBudWxsO1xuICAgIHRoaXMuX2Jhc2lzLmxpbmVFbmQoKTtcbiAgfSxcbiAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB0aGlzLl94LnB1c2goK3gpO1xuICAgIHRoaXMuX3kucHVzaCgreSk7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IChmdW5jdGlvbiBjdXN0b20oYmV0YSkge1xuXG4gIGZ1bmN0aW9uIGJ1bmRsZShjb250ZXh0KSB7XG4gICAgcmV0dXJuIGJldGEgPT09IDEgPyBuZXcgQmFzaXMoY29udGV4dCkgOiBuZXcgQnVuZGxlKGNvbnRleHQsIGJldGEpO1xuICB9XG5cbiAgYnVuZGxlLmJldGEgPSBmdW5jdGlvbihiZXRhKSB7XG4gICAgcmV0dXJuIGN1c3RvbSgrYmV0YSk7XG4gIH07XG5cbiAgcmV0dXJuIGJ1bmRsZTtcbn0pKDAuODUpO1xuIiwiZXhwb3J0IGZ1bmN0aW9uIHBvaW50KHRoYXQsIHgsIHkpIHtcbiAgdGhhdC5fY29udGV4dC5iZXppZXJDdXJ2ZVRvKFxuICAgIHRoYXQuX3gxICsgdGhhdC5fayAqICh0aGF0Ll94MiAtIHRoYXQuX3gwKSxcbiAgICB0aGF0Ll95MSArIHRoYXQuX2sgKiAodGhhdC5feTIgLSB0aGF0Ll95MCksXG4gICAgdGhhdC5feDIgKyB0aGF0Ll9rICogKHRoYXQuX3gxIC0geCksXG4gICAgdGhhdC5feTIgKyB0aGF0Ll9rICogKHRoYXQuX3kxIC0geSksXG4gICAgdGhhdC5feDIsXG4gICAgdGhhdC5feTJcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENhcmRpbmFsKGNvbnRleHQsIHRlbnNpb24pIHtcbiAgdGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG4gIHRoaXMuX2sgPSAoMSAtIHRlbnNpb24pIC8gNjtcbn1cblxuQ2FyZGluYWwucHJvdG90eXBlID0ge1xuICBhcmVhU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSAwO1xuICB9LFxuICBhcmVhRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gTmFOO1xuICB9LFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3gwID0gdGhpcy5feDEgPSB0aGlzLl94MiA9XG4gICAgdGhpcy5feTAgPSB0aGlzLl95MSA9IHRoaXMuX3kyID0gTmFOO1xuICAgIHRoaXMuX3BvaW50ID0gMDtcbiAgfSxcbiAgbGluZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgc3dpdGNoICh0aGlzLl9wb2ludCkge1xuICAgICAgY2FzZSAyOiB0aGlzLl9jb250ZXh0LmxpbmVUbyh0aGlzLl94MiwgdGhpcy5feTIpOyBicmVhaztcbiAgICAgIGNhc2UgMzogcG9pbnQodGhpcywgdGhpcy5feDEsIHRoaXMuX3kxKTsgYnJlYWs7XG4gICAgfVxuICAgIGlmICh0aGlzLl9saW5lIHx8ICh0aGlzLl9saW5lICE9PSAwICYmIHRoaXMuX3BvaW50ID09PSAxKSkgdGhpcy5fY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICB0aGlzLl9saW5lID0gMSAtIHRoaXMuX2xpbmU7XG4gIH0sXG4gIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgeCA9ICt4LCB5ID0gK3k7XG4gICAgc3dpdGNoICh0aGlzLl9wb2ludCkge1xuICAgICAgY2FzZSAwOiB0aGlzLl9wb2ludCA9IDE7IHRoaXMuX2xpbmUgPyB0aGlzLl9jb250ZXh0LmxpbmVUbyh4LCB5KSA6IHRoaXMuX2NvbnRleHQubW92ZVRvKHgsIHkpOyBicmVhaztcbiAgICAgIGNhc2UgMTogdGhpcy5fcG9pbnQgPSAyOyB0aGlzLl94MSA9IHgsIHRoaXMuX3kxID0geTsgYnJlYWs7XG4gICAgICBjYXNlIDI6IHRoaXMuX3BvaW50ID0gMzsgLy8gZmFsbHMgdGhyb3VnaFxuICAgICAgZGVmYXVsdDogcG9pbnQodGhpcywgeCwgeSk7IGJyZWFrO1xuICAgIH1cbiAgICB0aGlzLl94MCA9IHRoaXMuX3gxLCB0aGlzLl94MSA9IHRoaXMuX3gyLCB0aGlzLl94MiA9IHg7XG4gICAgdGhpcy5feTAgPSB0aGlzLl95MSwgdGhpcy5feTEgPSB0aGlzLl95MiwgdGhpcy5feTIgPSB5O1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gY3VzdG9tKHRlbnNpb24pIHtcblxuICBmdW5jdGlvbiBjYXJkaW5hbChjb250ZXh0KSB7XG4gICAgcmV0dXJuIG5ldyBDYXJkaW5hbChjb250ZXh0LCB0ZW5zaW9uKTtcbiAgfVxuXG4gIGNhcmRpbmFsLnRlbnNpb24gPSBmdW5jdGlvbih0ZW5zaW9uKSB7XG4gICAgcmV0dXJuIGN1c3RvbSgrdGVuc2lvbik7XG4gIH07XG5cbiAgcmV0dXJuIGNhcmRpbmFsO1xufSkoMCk7XG4iLCJpbXBvcnQgbm9vcCBmcm9tIFwiLi4vbm9vcC5qc1wiO1xuaW1wb3J0IHtwb2ludH0gZnJvbSBcIi4vY2FyZGluYWwuanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIENhcmRpbmFsQ2xvc2VkKGNvbnRleHQsIHRlbnNpb24pIHtcbiAgdGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG4gIHRoaXMuX2sgPSAoMSAtIHRlbnNpb24pIC8gNjtcbn1cblxuQ2FyZGluYWxDbG9zZWQucHJvdG90eXBlID0ge1xuICBhcmVhU3RhcnQ6IG5vb3AsXG4gIGFyZWFFbmQ6IG5vb3AsXG4gIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5feDAgPSB0aGlzLl94MSA9IHRoaXMuX3gyID0gdGhpcy5feDMgPSB0aGlzLl94NCA9IHRoaXMuX3g1ID1cbiAgICB0aGlzLl95MCA9IHRoaXMuX3kxID0gdGhpcy5feTIgPSB0aGlzLl95MyA9IHRoaXMuX3k0ID0gdGhpcy5feTUgPSBOYU47XG4gICAgdGhpcy5fcG9pbnQgPSAwO1xuICB9LFxuICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICBzd2l0Y2ggKHRoaXMuX3BvaW50KSB7XG4gICAgICBjYXNlIDE6IHtcbiAgICAgICAgdGhpcy5fY29udGV4dC5tb3ZlVG8odGhpcy5feDMsIHRoaXMuX3kzKTtcbiAgICAgICAgdGhpcy5fY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIDI6IHtcbiAgICAgICAgdGhpcy5fY29udGV4dC5saW5lVG8odGhpcy5feDMsIHRoaXMuX3kzKTtcbiAgICAgICAgdGhpcy5fY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIDM6IHtcbiAgICAgICAgdGhpcy5wb2ludCh0aGlzLl94MywgdGhpcy5feTMpO1xuICAgICAgICB0aGlzLnBvaW50KHRoaXMuX3g0LCB0aGlzLl95NCk7XG4gICAgICAgIHRoaXMucG9pbnQodGhpcy5feDUsIHRoaXMuX3k1KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgIHggPSAreCwgeSA9ICt5O1xuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMDogdGhpcy5fcG9pbnQgPSAxOyB0aGlzLl94MyA9IHgsIHRoaXMuX3kzID0geTsgYnJlYWs7XG4gICAgICBjYXNlIDE6IHRoaXMuX3BvaW50ID0gMjsgdGhpcy5fY29udGV4dC5tb3ZlVG8odGhpcy5feDQgPSB4LCB0aGlzLl95NCA9IHkpOyBicmVhaztcbiAgICAgIGNhc2UgMjogdGhpcy5fcG9pbnQgPSAzOyB0aGlzLl94NSA9IHgsIHRoaXMuX3k1ID0geTsgYnJlYWs7XG4gICAgICBkZWZhdWx0OiBwb2ludCh0aGlzLCB4LCB5KTsgYnJlYWs7XG4gICAgfVxuICAgIHRoaXMuX3gwID0gdGhpcy5feDEsIHRoaXMuX3gxID0gdGhpcy5feDIsIHRoaXMuX3gyID0geDtcbiAgICB0aGlzLl95MCA9IHRoaXMuX3kxLCB0aGlzLl95MSA9IHRoaXMuX3kyLCB0aGlzLl95MiA9IHk7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IChmdW5jdGlvbiBjdXN0b20odGVuc2lvbikge1xuXG4gIGZ1bmN0aW9uIGNhcmRpbmFsKGNvbnRleHQpIHtcbiAgICByZXR1cm4gbmV3IENhcmRpbmFsQ2xvc2VkKGNvbnRleHQsIHRlbnNpb24pO1xuICB9XG5cbiAgY2FyZGluYWwudGVuc2lvbiA9IGZ1bmN0aW9uKHRlbnNpb24pIHtcbiAgICByZXR1cm4gY3VzdG9tKCt0ZW5zaW9uKTtcbiAgfTtcblxuICByZXR1cm4gY2FyZGluYWw7XG59KSgwKTtcbiIsImltcG9ydCB7cG9pbnR9IGZyb20gXCIuL2NhcmRpbmFsLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBDYXJkaW5hbE9wZW4oY29udGV4dCwgdGVuc2lvbikge1xuICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbiAgdGhpcy5fayA9ICgxIC0gdGVuc2lvbikgLyA2O1xufVxuXG5DYXJkaW5hbE9wZW4ucHJvdG90eXBlID0ge1xuICBhcmVhU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSAwO1xuICB9LFxuICBhcmVhRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gTmFOO1xuICB9LFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3gwID0gdGhpcy5feDEgPSB0aGlzLl94MiA9XG4gICAgdGhpcy5feTAgPSB0aGlzLl95MSA9IHRoaXMuX3kyID0gTmFOO1xuICAgIHRoaXMuX3BvaW50ID0gMDtcbiAgfSxcbiAgbGluZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX2xpbmUgfHwgKHRoaXMuX2xpbmUgIT09IDAgJiYgdGhpcy5fcG9pbnQgPT09IDMpKSB0aGlzLl9jb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIHRoaXMuX2xpbmUgPSAxIC0gdGhpcy5fbGluZTtcbiAgfSxcbiAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB4ID0gK3gsIHkgPSAreTtcbiAgICBzd2l0Y2ggKHRoaXMuX3BvaW50KSB7XG4gICAgICBjYXNlIDA6IHRoaXMuX3BvaW50ID0gMTsgYnJlYWs7XG4gICAgICBjYXNlIDE6IHRoaXMuX3BvaW50ID0gMjsgYnJlYWs7XG4gICAgICBjYXNlIDI6IHRoaXMuX3BvaW50ID0gMzsgdGhpcy5fbGluZSA/IHRoaXMuX2NvbnRleHQubGluZVRvKHRoaXMuX3gyLCB0aGlzLl95MikgOiB0aGlzLl9jb250ZXh0Lm1vdmVUbyh0aGlzLl94MiwgdGhpcy5feTIpOyBicmVhaztcbiAgICAgIGNhc2UgMzogdGhpcy5fcG9pbnQgPSA0OyAvLyBmYWxscyB0aHJvdWdoXG4gICAgICBkZWZhdWx0OiBwb2ludCh0aGlzLCB4LCB5KTsgYnJlYWs7XG4gICAgfVxuICAgIHRoaXMuX3gwID0gdGhpcy5feDEsIHRoaXMuX3gxID0gdGhpcy5feDIsIHRoaXMuX3gyID0geDtcbiAgICB0aGlzLl95MCA9IHRoaXMuX3kxLCB0aGlzLl95MSA9IHRoaXMuX3kyLCB0aGlzLl95MiA9IHk7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IChmdW5jdGlvbiBjdXN0b20odGVuc2lvbikge1xuXG4gIGZ1bmN0aW9uIGNhcmRpbmFsKGNvbnRleHQpIHtcbiAgICByZXR1cm4gbmV3IENhcmRpbmFsT3Blbihjb250ZXh0LCB0ZW5zaW9uKTtcbiAgfVxuXG4gIGNhcmRpbmFsLnRlbnNpb24gPSBmdW5jdGlvbih0ZW5zaW9uKSB7XG4gICAgcmV0dXJuIGN1c3RvbSgrdGVuc2lvbik7XG4gIH07XG5cbiAgcmV0dXJuIGNhcmRpbmFsO1xufSkoMCk7XG4iLCJpbXBvcnQge2Vwc2lsb259IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQge0NhcmRpbmFsfSBmcm9tIFwiLi9jYXJkaW5hbC5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gcG9pbnQodGhhdCwgeCwgeSkge1xuICB2YXIgeDEgPSB0aGF0Ll94MSxcbiAgICAgIHkxID0gdGhhdC5feTEsXG4gICAgICB4MiA9IHRoYXQuX3gyLFxuICAgICAgeTIgPSB0aGF0Ll95MjtcblxuICBpZiAodGhhdC5fbDAxX2EgPiBlcHNpbG9uKSB7XG4gICAgdmFyIGEgPSAyICogdGhhdC5fbDAxXzJhICsgMyAqIHRoYXQuX2wwMV9hICogdGhhdC5fbDEyX2EgKyB0aGF0Ll9sMTJfMmEsXG4gICAgICAgIG4gPSAzICogdGhhdC5fbDAxX2EgKiAodGhhdC5fbDAxX2EgKyB0aGF0Ll9sMTJfYSk7XG4gICAgeDEgPSAoeDEgKiBhIC0gdGhhdC5feDAgKiB0aGF0Ll9sMTJfMmEgKyB0aGF0Ll94MiAqIHRoYXQuX2wwMV8yYSkgLyBuO1xuICAgIHkxID0gKHkxICogYSAtIHRoYXQuX3kwICogdGhhdC5fbDEyXzJhICsgdGhhdC5feTIgKiB0aGF0Ll9sMDFfMmEpIC8gbjtcbiAgfVxuXG4gIGlmICh0aGF0Ll9sMjNfYSA+IGVwc2lsb24pIHtcbiAgICB2YXIgYiA9IDIgKiB0aGF0Ll9sMjNfMmEgKyAzICogdGhhdC5fbDIzX2EgKiB0aGF0Ll9sMTJfYSArIHRoYXQuX2wxMl8yYSxcbiAgICAgICAgbSA9IDMgKiB0aGF0Ll9sMjNfYSAqICh0aGF0Ll9sMjNfYSArIHRoYXQuX2wxMl9hKTtcbiAgICB4MiA9ICh4MiAqIGIgKyB0aGF0Ll94MSAqIHRoYXQuX2wyM18yYSAtIHggKiB0aGF0Ll9sMTJfMmEpIC8gbTtcbiAgICB5MiA9ICh5MiAqIGIgKyB0aGF0Ll95MSAqIHRoYXQuX2wyM18yYSAtIHkgKiB0aGF0Ll9sMTJfMmEpIC8gbTtcbiAgfVxuXG4gIHRoYXQuX2NvbnRleHQuYmV6aWVyQ3VydmVUbyh4MSwgeTEsIHgyLCB5MiwgdGhhdC5feDIsIHRoYXQuX3kyKTtcbn1cblxuZnVuY3Rpb24gQ2F0bXVsbFJvbShjb250ZXh0LCBhbHBoYSkge1xuICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbiAgdGhpcy5fYWxwaGEgPSBhbHBoYTtcbn1cblxuQ2F0bXVsbFJvbS5wcm90b3R5cGUgPSB7XG4gIGFyZWFTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fbGluZSA9IDA7XG4gIH0sXG4gIGFyZWFFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSBOYU47XG4gIH0sXG4gIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5feDAgPSB0aGlzLl94MSA9IHRoaXMuX3gyID1cbiAgICB0aGlzLl95MCA9IHRoaXMuX3kxID0gdGhpcy5feTIgPSBOYU47XG4gICAgdGhpcy5fbDAxX2EgPSB0aGlzLl9sMTJfYSA9IHRoaXMuX2wyM19hID1cbiAgICB0aGlzLl9sMDFfMmEgPSB0aGlzLl9sMTJfMmEgPSB0aGlzLl9sMjNfMmEgPVxuICAgIHRoaXMuX3BvaW50ID0gMDtcbiAgfSxcbiAgbGluZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgc3dpdGNoICh0aGlzLl9wb2ludCkge1xuICAgICAgY2FzZSAyOiB0aGlzLl9jb250ZXh0LmxpbmVUbyh0aGlzLl94MiwgdGhpcy5feTIpOyBicmVhaztcbiAgICAgIGNhc2UgMzogdGhpcy5wb2ludCh0aGlzLl94MiwgdGhpcy5feTIpOyBicmVhaztcbiAgICB9XG4gICAgaWYgKHRoaXMuX2xpbmUgfHwgKHRoaXMuX2xpbmUgIT09IDAgJiYgdGhpcy5fcG9pbnQgPT09IDEpKSB0aGlzLl9jb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIHRoaXMuX2xpbmUgPSAxIC0gdGhpcy5fbGluZTtcbiAgfSxcbiAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB4ID0gK3gsIHkgPSAreTtcblxuICAgIGlmICh0aGlzLl9wb2ludCkge1xuICAgICAgdmFyIHgyMyA9IHRoaXMuX3gyIC0geCxcbiAgICAgICAgICB5MjMgPSB0aGlzLl95MiAtIHk7XG4gICAgICB0aGlzLl9sMjNfYSA9IE1hdGguc3FydCh0aGlzLl9sMjNfMmEgPSBNYXRoLnBvdyh4MjMgKiB4MjMgKyB5MjMgKiB5MjMsIHRoaXMuX2FscGhhKSk7XG4gICAgfVxuXG4gICAgc3dpdGNoICh0aGlzLl9wb2ludCkge1xuICAgICAgY2FzZSAwOiB0aGlzLl9wb2ludCA9IDE7IHRoaXMuX2xpbmUgPyB0aGlzLl9jb250ZXh0LmxpbmVUbyh4LCB5KSA6IHRoaXMuX2NvbnRleHQubW92ZVRvKHgsIHkpOyBicmVhaztcbiAgICAgIGNhc2UgMTogdGhpcy5fcG9pbnQgPSAyOyBicmVhaztcbiAgICAgIGNhc2UgMjogdGhpcy5fcG9pbnQgPSAzOyAvLyBmYWxscyB0aHJvdWdoXG4gICAgICBkZWZhdWx0OiBwb2ludCh0aGlzLCB4LCB5KTsgYnJlYWs7XG4gICAgfVxuXG4gICAgdGhpcy5fbDAxX2EgPSB0aGlzLl9sMTJfYSwgdGhpcy5fbDEyX2EgPSB0aGlzLl9sMjNfYTtcbiAgICB0aGlzLl9sMDFfMmEgPSB0aGlzLl9sMTJfMmEsIHRoaXMuX2wxMl8yYSA9IHRoaXMuX2wyM18yYTtcbiAgICB0aGlzLl94MCA9IHRoaXMuX3gxLCB0aGlzLl94MSA9IHRoaXMuX3gyLCB0aGlzLl94MiA9IHg7XG4gICAgdGhpcy5feTAgPSB0aGlzLl95MSwgdGhpcy5feTEgPSB0aGlzLl95MiwgdGhpcy5feTIgPSB5O1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gY3VzdG9tKGFscGhhKSB7XG5cbiAgZnVuY3Rpb24gY2F0bXVsbFJvbShjb250ZXh0KSB7XG4gICAgcmV0dXJuIGFscGhhID8gbmV3IENhdG11bGxSb20oY29udGV4dCwgYWxwaGEpIDogbmV3IENhcmRpbmFsKGNvbnRleHQsIDApO1xuICB9XG5cbiAgY2F0bXVsbFJvbS5hbHBoYSA9IGZ1bmN0aW9uKGFscGhhKSB7XG4gICAgcmV0dXJuIGN1c3RvbSgrYWxwaGEpO1xuICB9O1xuXG4gIHJldHVybiBjYXRtdWxsUm9tO1xufSkoMC41KTtcbiIsImltcG9ydCB7Q2FyZGluYWxDbG9zZWR9IGZyb20gXCIuL2NhcmRpbmFsQ2xvc2VkLmpzXCI7XG5pbXBvcnQgbm9vcCBmcm9tIFwiLi4vbm9vcC5qc1wiO1xuaW1wb3J0IHtwb2ludH0gZnJvbSBcIi4vY2F0bXVsbFJvbS5qc1wiO1xuXG5mdW5jdGlvbiBDYXRtdWxsUm9tQ2xvc2VkKGNvbnRleHQsIGFscGhhKSB7XG4gIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLl9hbHBoYSA9IGFscGhhO1xufVxuXG5DYXRtdWxsUm9tQ2xvc2VkLnByb3RvdHlwZSA9IHtcbiAgYXJlYVN0YXJ0OiBub29wLFxuICBhcmVhRW5kOiBub29wLFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3gwID0gdGhpcy5feDEgPSB0aGlzLl94MiA9IHRoaXMuX3gzID0gdGhpcy5feDQgPSB0aGlzLl94NSA9XG4gICAgdGhpcy5feTAgPSB0aGlzLl95MSA9IHRoaXMuX3kyID0gdGhpcy5feTMgPSB0aGlzLl95NCA9IHRoaXMuX3k1ID0gTmFOO1xuICAgIHRoaXMuX2wwMV9hID0gdGhpcy5fbDEyX2EgPSB0aGlzLl9sMjNfYSA9XG4gICAgdGhpcy5fbDAxXzJhID0gdGhpcy5fbDEyXzJhID0gdGhpcy5fbDIzXzJhID1cbiAgICB0aGlzLl9wb2ludCA9IDA7XG4gIH0sXG4gIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMToge1xuICAgICAgICB0aGlzLl9jb250ZXh0Lm1vdmVUbyh0aGlzLl94MywgdGhpcy5feTMpO1xuICAgICAgICB0aGlzLl9jb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgMjoge1xuICAgICAgICB0aGlzLl9jb250ZXh0LmxpbmVUbyh0aGlzLl94MywgdGhpcy5feTMpO1xuICAgICAgICB0aGlzLl9jb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgMzoge1xuICAgICAgICB0aGlzLnBvaW50KHRoaXMuX3gzLCB0aGlzLl95Myk7XG4gICAgICAgIHRoaXMucG9pbnQodGhpcy5feDQsIHRoaXMuX3k0KTtcbiAgICAgICAgdGhpcy5wb2ludCh0aGlzLl94NSwgdGhpcy5feTUpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgeCA9ICt4LCB5ID0gK3k7XG5cbiAgICBpZiAodGhpcy5fcG9pbnQpIHtcbiAgICAgIHZhciB4MjMgPSB0aGlzLl94MiAtIHgsXG4gICAgICAgICAgeTIzID0gdGhpcy5feTIgLSB5O1xuICAgICAgdGhpcy5fbDIzX2EgPSBNYXRoLnNxcnQodGhpcy5fbDIzXzJhID0gTWF0aC5wb3coeDIzICogeDIzICsgeTIzICogeTIzLCB0aGlzLl9hbHBoYSkpO1xuICAgIH1cblxuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMDogdGhpcy5fcG9pbnQgPSAxOyB0aGlzLl94MyA9IHgsIHRoaXMuX3kzID0geTsgYnJlYWs7XG4gICAgICBjYXNlIDE6IHRoaXMuX3BvaW50ID0gMjsgdGhpcy5fY29udGV4dC5tb3ZlVG8odGhpcy5feDQgPSB4LCB0aGlzLl95NCA9IHkpOyBicmVhaztcbiAgICAgIGNhc2UgMjogdGhpcy5fcG9pbnQgPSAzOyB0aGlzLl94NSA9IHgsIHRoaXMuX3k1ID0geTsgYnJlYWs7XG4gICAgICBkZWZhdWx0OiBwb2ludCh0aGlzLCB4LCB5KTsgYnJlYWs7XG4gICAgfVxuXG4gICAgdGhpcy5fbDAxX2EgPSB0aGlzLl9sMTJfYSwgdGhpcy5fbDEyX2EgPSB0aGlzLl9sMjNfYTtcbiAgICB0aGlzLl9sMDFfMmEgPSB0aGlzLl9sMTJfMmEsIHRoaXMuX2wxMl8yYSA9IHRoaXMuX2wyM18yYTtcbiAgICB0aGlzLl94MCA9IHRoaXMuX3gxLCB0aGlzLl94MSA9IHRoaXMuX3gyLCB0aGlzLl94MiA9IHg7XG4gICAgdGhpcy5feTAgPSB0aGlzLl95MSwgdGhpcy5feTEgPSB0aGlzLl95MiwgdGhpcy5feTIgPSB5O1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gY3VzdG9tKGFscGhhKSB7XG5cbiAgZnVuY3Rpb24gY2F0bXVsbFJvbShjb250ZXh0KSB7XG4gICAgcmV0dXJuIGFscGhhID8gbmV3IENhdG11bGxSb21DbG9zZWQoY29udGV4dCwgYWxwaGEpIDogbmV3IENhcmRpbmFsQ2xvc2VkKGNvbnRleHQsIDApO1xuICB9XG5cbiAgY2F0bXVsbFJvbS5hbHBoYSA9IGZ1bmN0aW9uKGFscGhhKSB7XG4gICAgcmV0dXJuIGN1c3RvbSgrYWxwaGEpO1xuICB9O1xuXG4gIHJldHVybiBjYXRtdWxsUm9tO1xufSkoMC41KTtcbiIsImltcG9ydCB7Q2FyZGluYWxPcGVufSBmcm9tIFwiLi9jYXJkaW5hbE9wZW4uanNcIjtcbmltcG9ydCB7cG9pbnR9IGZyb20gXCIuL2NhdG11bGxSb20uanNcIjtcblxuZnVuY3Rpb24gQ2F0bXVsbFJvbU9wZW4oY29udGV4dCwgYWxwaGEpIHtcbiAgdGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG4gIHRoaXMuX2FscGhhID0gYWxwaGE7XG59XG5cbkNhdG11bGxSb21PcGVuLnByb3RvdHlwZSA9IHtcbiAgYXJlYVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gMDtcbiAgfSxcbiAgYXJlYUVuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fbGluZSA9IE5hTjtcbiAgfSxcbiAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl94MCA9IHRoaXMuX3gxID0gdGhpcy5feDIgPVxuICAgIHRoaXMuX3kwID0gdGhpcy5feTEgPSB0aGlzLl95MiA9IE5hTjtcbiAgICB0aGlzLl9sMDFfYSA9IHRoaXMuX2wxMl9hID0gdGhpcy5fbDIzX2EgPVxuICAgIHRoaXMuX2wwMV8yYSA9IHRoaXMuX2wxMl8yYSA9IHRoaXMuX2wyM18yYSA9XG4gICAgdGhpcy5fcG9pbnQgPSAwO1xuICB9LFxuICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fbGluZSB8fCAodGhpcy5fbGluZSAhPT0gMCAmJiB0aGlzLl9wb2ludCA9PT0gMykpIHRoaXMuX2NvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgdGhpcy5fbGluZSA9IDEgLSB0aGlzLl9saW5lO1xuICB9LFxuICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgIHggPSAreCwgeSA9ICt5O1xuXG4gICAgaWYgKHRoaXMuX3BvaW50KSB7XG4gICAgICB2YXIgeDIzID0gdGhpcy5feDIgLSB4LFxuICAgICAgICAgIHkyMyA9IHRoaXMuX3kyIC0geTtcbiAgICAgIHRoaXMuX2wyM19hID0gTWF0aC5zcXJ0KHRoaXMuX2wyM18yYSA9IE1hdGgucG93KHgyMyAqIHgyMyArIHkyMyAqIHkyMywgdGhpcy5fYWxwaGEpKTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHRoaXMuX3BvaW50KSB7XG4gICAgICBjYXNlIDA6IHRoaXMuX3BvaW50ID0gMTsgYnJlYWs7XG4gICAgICBjYXNlIDE6IHRoaXMuX3BvaW50ID0gMjsgYnJlYWs7XG4gICAgICBjYXNlIDI6IHRoaXMuX3BvaW50ID0gMzsgdGhpcy5fbGluZSA/IHRoaXMuX2NvbnRleHQubGluZVRvKHRoaXMuX3gyLCB0aGlzLl95MikgOiB0aGlzLl9jb250ZXh0Lm1vdmVUbyh0aGlzLl94MiwgdGhpcy5feTIpOyBicmVhaztcbiAgICAgIGNhc2UgMzogdGhpcy5fcG9pbnQgPSA0OyAvLyBmYWxscyB0aHJvdWdoXG4gICAgICBkZWZhdWx0OiBwb2ludCh0aGlzLCB4LCB5KTsgYnJlYWs7XG4gICAgfVxuXG4gICAgdGhpcy5fbDAxX2EgPSB0aGlzLl9sMTJfYSwgdGhpcy5fbDEyX2EgPSB0aGlzLl9sMjNfYTtcbiAgICB0aGlzLl9sMDFfMmEgPSB0aGlzLl9sMTJfMmEsIHRoaXMuX2wxMl8yYSA9IHRoaXMuX2wyM18yYTtcbiAgICB0aGlzLl94MCA9IHRoaXMuX3gxLCB0aGlzLl94MSA9IHRoaXMuX3gyLCB0aGlzLl94MiA9IHg7XG4gICAgdGhpcy5feTAgPSB0aGlzLl95MSwgdGhpcy5feTEgPSB0aGlzLl95MiwgdGhpcy5feTIgPSB5O1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gY3VzdG9tKGFscGhhKSB7XG5cbiAgZnVuY3Rpb24gY2F0bXVsbFJvbShjb250ZXh0KSB7XG4gICAgcmV0dXJuIGFscGhhID8gbmV3IENhdG11bGxSb21PcGVuKGNvbnRleHQsIGFscGhhKSA6IG5ldyBDYXJkaW5hbE9wZW4oY29udGV4dCwgMCk7XG4gIH1cblxuICBjYXRtdWxsUm9tLmFscGhhID0gZnVuY3Rpb24oYWxwaGEpIHtcbiAgICByZXR1cm4gY3VzdG9tKCthbHBoYSk7XG4gIH07XG5cbiAgcmV0dXJuIGNhdG11bGxSb207XG59KSgwLjUpO1xuIiwiaW1wb3J0IG5vb3AgZnJvbSBcIi4uL25vb3AuanNcIjtcblxuZnVuY3Rpb24gTGluZWFyQ2xvc2VkKGNvbnRleHQpIHtcbiAgdGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG59XG5cbkxpbmVhckNsb3NlZC5wcm90b3R5cGUgPSB7XG4gIGFyZWFTdGFydDogbm9vcCxcbiAgYXJlYUVuZDogbm9vcCxcbiAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9wb2ludCA9IDA7XG4gIH0sXG4gIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9wb2ludCkgdGhpcy5fY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgfSxcbiAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB4ID0gK3gsIHkgPSAreTtcbiAgICBpZiAodGhpcy5fcG9pbnQpIHRoaXMuX2NvbnRleHQubGluZVRvKHgsIHkpO1xuICAgIGVsc2UgdGhpcy5fcG9pbnQgPSAxLCB0aGlzLl9jb250ZXh0Lm1vdmVUbyh4LCB5KTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY29udGV4dCkge1xuICByZXR1cm4gbmV3IExpbmVhckNsb3NlZChjb250ZXh0KTtcbn1cbiIsImZ1bmN0aW9uIHNpZ24oeCkge1xuICByZXR1cm4geCA8IDAgPyAtMSA6IDE7XG59XG5cbi8vIENhbGN1bGF0ZSB0aGUgc2xvcGVzIG9mIHRoZSB0YW5nZW50cyAoSGVybWl0ZS10eXBlIGludGVycG9sYXRpb24pIGJhc2VkIG9uXG4vLyB0aGUgZm9sbG93aW5nIHBhcGVyOiBTdGVmZmVuLCBNLiAxOTkwLiBBIFNpbXBsZSBNZXRob2QgZm9yIE1vbm90b25pY1xuLy8gSW50ZXJwb2xhdGlvbiBpbiBPbmUgRGltZW5zaW9uLiBBc3Ryb25vbXkgYW5kIEFzdHJvcGh5c2ljcywgVm9sLiAyMzksIE5PLlxuLy8gTk9WKElJKSwgUC4gNDQzLCAxOTkwLlxuZnVuY3Rpb24gc2xvcGUzKHRoYXQsIHgyLCB5Mikge1xuICB2YXIgaDAgPSB0aGF0Ll94MSAtIHRoYXQuX3gwLFxuICAgICAgaDEgPSB4MiAtIHRoYXQuX3gxLFxuICAgICAgczAgPSAodGhhdC5feTEgLSB0aGF0Ll95MCkgLyAoaDAgfHwgaDEgPCAwICYmIC0wKSxcbiAgICAgIHMxID0gKHkyIC0gdGhhdC5feTEpIC8gKGgxIHx8IGgwIDwgMCAmJiAtMCksXG4gICAgICBwID0gKHMwICogaDEgKyBzMSAqIGgwKSAvIChoMCArIGgxKTtcbiAgcmV0dXJuIChzaWduKHMwKSArIHNpZ24oczEpKSAqIE1hdGgubWluKE1hdGguYWJzKHMwKSwgTWF0aC5hYnMoczEpLCAwLjUgKiBNYXRoLmFicyhwKSkgfHwgMDtcbn1cblxuLy8gQ2FsY3VsYXRlIGEgb25lLXNpZGVkIHNsb3BlLlxuZnVuY3Rpb24gc2xvcGUyKHRoYXQsIHQpIHtcbiAgdmFyIGggPSB0aGF0Ll94MSAtIHRoYXQuX3gwO1xuICByZXR1cm4gaCA/ICgzICogKHRoYXQuX3kxIC0gdGhhdC5feTApIC8gaCAtIHQpIC8gMiA6IHQ7XG59XG5cbi8vIEFjY29yZGluZyB0byBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9DdWJpY19IZXJtaXRlX3NwbGluZSNSZXByZXNlbnRhdGlvbnNcbi8vIFwieW91IGNhbiBleHByZXNzIGN1YmljIEhlcm1pdGUgaW50ZXJwb2xhdGlvbiBpbiB0ZXJtcyBvZiBjdWJpYyBCw6l6aWVyIGN1cnZlc1xuLy8gd2l0aCByZXNwZWN0IHRvIHRoZSBmb3VyIHZhbHVlcyBwMCwgcDAgKyBtMCAvIDMsIHAxIC0gbTEgLyAzLCBwMVwiLlxuZnVuY3Rpb24gcG9pbnQodGhhdCwgdDAsIHQxKSB7XG4gIHZhciB4MCA9IHRoYXQuX3gwLFxuICAgICAgeTAgPSB0aGF0Ll95MCxcbiAgICAgIHgxID0gdGhhdC5feDEsXG4gICAgICB5MSA9IHRoYXQuX3kxLFxuICAgICAgZHggPSAoeDEgLSB4MCkgLyAzO1xuICB0aGF0Ll9jb250ZXh0LmJlemllckN1cnZlVG8oeDAgKyBkeCwgeTAgKyBkeCAqIHQwLCB4MSAtIGR4LCB5MSAtIGR4ICogdDEsIHgxLCB5MSk7XG59XG5cbmZ1bmN0aW9uIE1vbm90b25lWChjb250ZXh0KSB7XG4gIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xufVxuXG5Nb25vdG9uZVgucHJvdG90eXBlID0ge1xuICBhcmVhU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSAwO1xuICB9LFxuICBhcmVhRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gTmFOO1xuICB9LFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3gwID0gdGhpcy5feDEgPVxuICAgIHRoaXMuX3kwID0gdGhpcy5feTEgPVxuICAgIHRoaXMuX3QwID0gTmFOO1xuICAgIHRoaXMuX3BvaW50ID0gMDtcbiAgfSxcbiAgbGluZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgc3dpdGNoICh0aGlzLl9wb2ludCkge1xuICAgICAgY2FzZSAyOiB0aGlzLl9jb250ZXh0LmxpbmVUbyh0aGlzLl94MSwgdGhpcy5feTEpOyBicmVhaztcbiAgICAgIGNhc2UgMzogcG9pbnQodGhpcywgdGhpcy5fdDAsIHNsb3BlMih0aGlzLCB0aGlzLl90MCkpOyBicmVhaztcbiAgICB9XG4gICAgaWYgKHRoaXMuX2xpbmUgfHwgKHRoaXMuX2xpbmUgIT09IDAgJiYgdGhpcy5fcG9pbnQgPT09IDEpKSB0aGlzLl9jb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIHRoaXMuX2xpbmUgPSAxIC0gdGhpcy5fbGluZTtcbiAgfSxcbiAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB2YXIgdDEgPSBOYU47XG5cbiAgICB4ID0gK3gsIHkgPSAreTtcbiAgICBpZiAoeCA9PT0gdGhpcy5feDEgJiYgeSA9PT0gdGhpcy5feTEpIHJldHVybjsgLy8gSWdub3JlIGNvaW5jaWRlbnQgcG9pbnRzLlxuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMDogdGhpcy5fcG9pbnQgPSAxOyB0aGlzLl9saW5lID8gdGhpcy5fY29udGV4dC5saW5lVG8oeCwgeSkgOiB0aGlzLl9jb250ZXh0Lm1vdmVUbyh4LCB5KTsgYnJlYWs7XG4gICAgICBjYXNlIDE6IHRoaXMuX3BvaW50ID0gMjsgYnJlYWs7XG4gICAgICBjYXNlIDI6IHRoaXMuX3BvaW50ID0gMzsgcG9pbnQodGhpcywgc2xvcGUyKHRoaXMsIHQxID0gc2xvcGUzKHRoaXMsIHgsIHkpKSwgdDEpOyBicmVhaztcbiAgICAgIGRlZmF1bHQ6IHBvaW50KHRoaXMsIHRoaXMuX3QwLCB0MSA9IHNsb3BlMyh0aGlzLCB4LCB5KSk7IGJyZWFrO1xuICAgIH1cblxuICAgIHRoaXMuX3gwID0gdGhpcy5feDEsIHRoaXMuX3gxID0geDtcbiAgICB0aGlzLl95MCA9IHRoaXMuX3kxLCB0aGlzLl95MSA9IHk7XG4gICAgdGhpcy5fdDAgPSB0MTtcbiAgfVxufVxuXG5mdW5jdGlvbiBNb25vdG9uZVkoY29udGV4dCkge1xuICB0aGlzLl9jb250ZXh0ID0gbmV3IFJlZmxlY3RDb250ZXh0KGNvbnRleHQpO1xufVxuXG4oTW9ub3RvbmVZLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTW9ub3RvbmVYLnByb3RvdHlwZSkpLnBvaW50ID0gZnVuY3Rpb24oeCwgeSkge1xuICBNb25vdG9uZVgucHJvdG90eXBlLnBvaW50LmNhbGwodGhpcywgeSwgeCk7XG59O1xuXG5mdW5jdGlvbiBSZWZsZWN0Q29udGV4dChjb250ZXh0KSB7XG4gIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xufVxuXG5SZWZsZWN0Q29udGV4dC5wcm90b3R5cGUgPSB7XG4gIG1vdmVUbzogZnVuY3Rpb24oeCwgeSkgeyB0aGlzLl9jb250ZXh0Lm1vdmVUbyh5LCB4KTsgfSxcbiAgY2xvc2VQYXRoOiBmdW5jdGlvbigpIHsgdGhpcy5fY29udGV4dC5jbG9zZVBhdGgoKTsgfSxcbiAgbGluZVRvOiBmdW5jdGlvbih4LCB5KSB7IHRoaXMuX2NvbnRleHQubGluZVRvKHksIHgpOyB9LFxuICBiZXppZXJDdXJ2ZVRvOiBmdW5jdGlvbih4MSwgeTEsIHgyLCB5MiwgeCwgeSkgeyB0aGlzLl9jb250ZXh0LmJlemllckN1cnZlVG8oeTEsIHgxLCB5MiwgeDIsIHksIHgpOyB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gbW9ub3RvbmVYKGNvbnRleHQpIHtcbiAgcmV0dXJuIG5ldyBNb25vdG9uZVgoY29udGV4dCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb25vdG9uZVkoY29udGV4dCkge1xuICByZXR1cm4gbmV3IE1vbm90b25lWShjb250ZXh0KTtcbn1cbiIsImZ1bmN0aW9uIE5hdHVyYWwoY29udGV4dCkge1xuICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbn1cblxuTmF0dXJhbC5wcm90b3R5cGUgPSB7XG4gIGFyZWFTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fbGluZSA9IDA7XG4gIH0sXG4gIGFyZWFFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSBOYU47XG4gIH0sXG4gIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5feCA9IFtdO1xuICAgIHRoaXMuX3kgPSBbXTtcbiAgfSxcbiAgbGluZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHggPSB0aGlzLl94LFxuICAgICAgICB5ID0gdGhpcy5feSxcbiAgICAgICAgbiA9IHgubGVuZ3RoO1xuXG4gICAgaWYgKG4pIHtcbiAgICAgIHRoaXMuX2xpbmUgPyB0aGlzLl9jb250ZXh0LmxpbmVUbyh4WzBdLCB5WzBdKSA6IHRoaXMuX2NvbnRleHQubW92ZVRvKHhbMF0sIHlbMF0pO1xuICAgICAgaWYgKG4gPT09IDIpIHtcbiAgICAgICAgdGhpcy5fY29udGV4dC5saW5lVG8oeFsxXSwgeVsxXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcHggPSBjb250cm9sUG9pbnRzKHgpLFxuICAgICAgICAgICAgcHkgPSBjb250cm9sUG9pbnRzKHkpO1xuICAgICAgICBmb3IgKHZhciBpMCA9IDAsIGkxID0gMTsgaTEgPCBuOyArK2kwLCArK2kxKSB7XG4gICAgICAgICAgdGhpcy5fY29udGV4dC5iZXppZXJDdXJ2ZVRvKHB4WzBdW2kwXSwgcHlbMF1baTBdLCBweFsxXVtpMF0sIHB5WzFdW2kwXSwgeFtpMV0sIHlbaTFdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9saW5lIHx8ICh0aGlzLl9saW5lICE9PSAwICYmIG4gPT09IDEpKSB0aGlzLl9jb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIHRoaXMuX2xpbmUgPSAxIC0gdGhpcy5fbGluZTtcbiAgICB0aGlzLl94ID0gdGhpcy5feSA9IG51bGw7XG4gIH0sXG4gIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgdGhpcy5feC5wdXNoKCt4KTtcbiAgICB0aGlzLl95LnB1c2goK3kpO1xuICB9XG59O1xuXG4vLyBTZWUgaHR0cHM6Ly93d3cucGFydGljbGVpbmNlbGwuY29tLzIwMTIvYmV6aWVyLXNwbGluZXMvIGZvciBkZXJpdmF0aW9uLlxuZnVuY3Rpb24gY29udHJvbFBvaW50cyh4KSB7XG4gIHZhciBpLFxuICAgICAgbiA9IHgubGVuZ3RoIC0gMSxcbiAgICAgIG0sXG4gICAgICBhID0gbmV3IEFycmF5KG4pLFxuICAgICAgYiA9IG5ldyBBcnJheShuKSxcbiAgICAgIHIgPSBuZXcgQXJyYXkobik7XG4gIGFbMF0gPSAwLCBiWzBdID0gMiwgclswXSA9IHhbMF0gKyAyICogeFsxXTtcbiAgZm9yIChpID0gMTsgaSA8IG4gLSAxOyArK2kpIGFbaV0gPSAxLCBiW2ldID0gNCwgcltpXSA9IDQgKiB4W2ldICsgMiAqIHhbaSArIDFdO1xuICBhW24gLSAxXSA9IDIsIGJbbiAtIDFdID0gNywgcltuIC0gMV0gPSA4ICogeFtuIC0gMV0gKyB4W25dO1xuICBmb3IgKGkgPSAxOyBpIDwgbjsgKytpKSBtID0gYVtpXSAvIGJbaSAtIDFdLCBiW2ldIC09IG0sIHJbaV0gLT0gbSAqIHJbaSAtIDFdO1xuICBhW24gLSAxXSA9IHJbbiAtIDFdIC8gYltuIC0gMV07XG4gIGZvciAoaSA9IG4gLSAyOyBpID49IDA7IC0taSkgYVtpXSA9IChyW2ldIC0gYVtpICsgMV0pIC8gYltpXTtcbiAgYltuIC0gMV0gPSAoeFtuXSArIGFbbiAtIDFdKSAvIDI7XG4gIGZvciAoaSA9IDA7IGkgPCBuIC0gMTsgKytpKSBiW2ldID0gMiAqIHhbaSArIDFdIC0gYVtpICsgMV07XG4gIHJldHVybiBbYSwgYl07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgcmV0dXJuIG5ldyBOYXR1cmFsKGNvbnRleHQpO1xufVxuIiwiZnVuY3Rpb24gU3RlcChjb250ZXh0LCB0KSB7XG4gIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLl90ID0gdDtcbn1cblxuU3RlcC5wcm90b3R5cGUgPSB7XG4gIGFyZWFTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fbGluZSA9IDA7XG4gIH0sXG4gIGFyZWFFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSBOYU47XG4gIH0sXG4gIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5feCA9IHRoaXMuX3kgPSBOYU47XG4gICAgdGhpcy5fcG9pbnQgPSAwO1xuICB9LFxuICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoMCA8IHRoaXMuX3QgJiYgdGhpcy5fdCA8IDEgJiYgdGhpcy5fcG9pbnQgPT09IDIpIHRoaXMuX2NvbnRleHQubGluZVRvKHRoaXMuX3gsIHRoaXMuX3kpO1xuICAgIGlmICh0aGlzLl9saW5lIHx8ICh0aGlzLl9saW5lICE9PSAwICYmIHRoaXMuX3BvaW50ID09PSAxKSkgdGhpcy5fY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICBpZiAodGhpcy5fbGluZSA+PSAwKSB0aGlzLl90ID0gMSAtIHRoaXMuX3QsIHRoaXMuX2xpbmUgPSAxIC0gdGhpcy5fbGluZTtcbiAgfSxcbiAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB4ID0gK3gsIHkgPSAreTtcbiAgICBzd2l0Y2ggKHRoaXMuX3BvaW50KSB7XG4gICAgICBjYXNlIDA6IHRoaXMuX3BvaW50ID0gMTsgdGhpcy5fbGluZSA/IHRoaXMuX2NvbnRleHQubGluZVRvKHgsIHkpIDogdGhpcy5fY29udGV4dC5tb3ZlVG8oeCwgeSk7IGJyZWFrO1xuICAgICAgY2FzZSAxOiB0aGlzLl9wb2ludCA9IDI7IC8vIGZhbGxzIHRocm91Z2hcbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgaWYgKHRoaXMuX3QgPD0gMCkge1xuICAgICAgICAgIHRoaXMuX2NvbnRleHQubGluZVRvKHRoaXMuX3gsIHkpO1xuICAgICAgICAgIHRoaXMuX2NvbnRleHQubGluZVRvKHgsIHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciB4MSA9IHRoaXMuX3ggKiAoMSAtIHRoaXMuX3QpICsgeCAqIHRoaXMuX3Q7XG4gICAgICAgICAgdGhpcy5fY29udGV4dC5saW5lVG8oeDEsIHRoaXMuX3kpO1xuICAgICAgICAgIHRoaXMuX2NvbnRleHQubGluZVRvKHgxLCB5KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5feCA9IHgsIHRoaXMuX3kgPSB5O1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjb250ZXh0KSB7XG4gIHJldHVybiBuZXcgU3RlcChjb250ZXh0LCAwLjUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RlcEJlZm9yZShjb250ZXh0KSB7XG4gIHJldHVybiBuZXcgU3RlcChjb250ZXh0LCAwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0ZXBBZnRlcihjb250ZXh0KSB7XG4gIHJldHVybiBuZXcgU3RlcChjb250ZXh0LCAxKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlcmllcywgb3JkZXIpIHtcbiAgaWYgKCEoKG4gPSBzZXJpZXMubGVuZ3RoKSA+IDEpKSByZXR1cm47XG4gIGZvciAodmFyIGkgPSAxLCBqLCBzMCwgczEgPSBzZXJpZXNbb3JkZXJbMF1dLCBuLCBtID0gczEubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgczAgPSBzMSwgczEgPSBzZXJpZXNbb3JkZXJbaV1dO1xuICAgIGZvciAoaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICAgIHMxW2pdWzFdICs9IHMxW2pdWzBdID0gaXNOYU4oczBbal1bMV0pID8gczBbal1bMF0gOiBzMFtqXVsxXTtcbiAgICB9XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlcmllcykge1xuICB2YXIgbiA9IHNlcmllcy5sZW5ndGgsIG8gPSBuZXcgQXJyYXkobik7XG4gIHdoaWxlICgtLW4gPj0gMCkgb1tuXSA9IG47XG4gIHJldHVybiBvO1xufVxuIiwiaW1wb3J0IGFycmF5IGZyb20gXCIuL2FycmF5LmpzXCI7XG5pbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcbmltcG9ydCBvZmZzZXROb25lIGZyb20gXCIuL29mZnNldC9ub25lLmpzXCI7XG5pbXBvcnQgb3JkZXJOb25lIGZyb20gXCIuL29yZGVyL25vbmUuanNcIjtcblxuZnVuY3Rpb24gc3RhY2tWYWx1ZShkLCBrZXkpIHtcbiAgcmV0dXJuIGRba2V5XTtcbn1cblxuZnVuY3Rpb24gc3RhY2tTZXJpZXMoa2V5KSB7XG4gIGNvbnN0IHNlcmllcyA9IFtdO1xuICBzZXJpZXMua2V5ID0ga2V5O1xuICByZXR1cm4gc2VyaWVzO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIGtleXMgPSBjb25zdGFudChbXSksXG4gICAgICBvcmRlciA9IG9yZGVyTm9uZSxcbiAgICAgIG9mZnNldCA9IG9mZnNldE5vbmUsXG4gICAgICB2YWx1ZSA9IHN0YWNrVmFsdWU7XG5cbiAgZnVuY3Rpb24gc3RhY2soZGF0YSkge1xuICAgIHZhciBzeiA9IEFycmF5LmZyb20oa2V5cy5hcHBseSh0aGlzLCBhcmd1bWVudHMpLCBzdGFja1NlcmllcyksXG4gICAgICAgIGksIG4gPSBzei5sZW5ndGgsIGogPSAtMSxcbiAgICAgICAgb3o7XG5cbiAgICBmb3IgKGNvbnN0IGQgb2YgZGF0YSkge1xuICAgICAgZm9yIChpID0gMCwgKytqOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIChzeltpXVtqXSA9IFswLCArdmFsdWUoZCwgc3pbaV0ua2V5LCBqLCBkYXRhKV0pLmRhdGEgPSBkO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoaSA9IDAsIG96ID0gYXJyYXkob3JkZXIoc3opKTsgaSA8IG47ICsraSkge1xuICAgICAgc3pbb3pbaV1dLmluZGV4ID0gaTtcbiAgICB9XG5cbiAgICBvZmZzZXQoc3osIG96KTtcbiAgICByZXR1cm4gc3o7XG4gIH1cblxuICBzdGFjay5rZXlzID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGtleXMgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KEFycmF5LmZyb20oXykpLCBzdGFjaykgOiBrZXlzO1xuICB9O1xuXG4gIHN0YWNrLnZhbHVlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHZhbHVlID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIHN0YWNrKSA6IHZhbHVlO1xuICB9O1xuXG4gIHN0YWNrLm9yZGVyID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKG9yZGVyID0gXyA9PSBudWxsID8gb3JkZXJOb25lIDogdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudChBcnJheS5mcm9tKF8pKSwgc3RhY2spIDogb3JkZXI7XG4gIH07XG5cbiAgc3RhY2sub2Zmc2V0ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKG9mZnNldCA9IF8gPT0gbnVsbCA/IG9mZnNldE5vbmUgOiBfLCBzdGFjaykgOiBvZmZzZXQ7XG4gIH07XG5cbiAgcmV0dXJuIHN0YWNrO1xufVxuIiwiaW1wb3J0IG5vbmUgZnJvbSBcIi4vbm9uZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZXJpZXMsIG9yZGVyKSB7XG4gIGlmICghKChuID0gc2VyaWVzLmxlbmd0aCkgPiAwKSkgcmV0dXJuO1xuICBmb3IgKHZhciBpLCBuLCBqID0gMCwgbSA9IHNlcmllc1swXS5sZW5ndGgsIHk7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHkgPSBpID0gMDsgaSA8IG47ICsraSkgeSArPSBzZXJpZXNbaV1bal1bMV0gfHwgMDtcbiAgICBpZiAoeSkgZm9yIChpID0gMDsgaSA8IG47ICsraSkgc2VyaWVzW2ldW2pdWzFdIC89IHk7XG4gIH1cbiAgbm9uZShzZXJpZXMsIG9yZGVyKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlcmllcywgb3JkZXIpIHtcbiAgaWYgKCEoKG4gPSBzZXJpZXMubGVuZ3RoKSA+IDApKSByZXR1cm47XG4gIGZvciAodmFyIGksIGogPSAwLCBkLCBkeSwgeXAsIHluLCBuLCBtID0gc2VyaWVzW29yZGVyWzBdXS5sZW5ndGg7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHlwID0geW4gPSAwLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKChkeSA9IChkID0gc2VyaWVzW29yZGVyW2ldXVtqXSlbMV0gLSBkWzBdKSA+IDApIHtcbiAgICAgICAgZFswXSA9IHlwLCBkWzFdID0geXAgKz0gZHk7XG4gICAgICB9IGVsc2UgaWYgKGR5IDwgMCkge1xuICAgICAgICBkWzFdID0geW4sIGRbMF0gPSB5biArPSBkeTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRbMF0gPSAwLCBkWzFdID0gZHk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgbm9uZSBmcm9tIFwiLi9ub25lLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlcmllcywgb3JkZXIpIHtcbiAgaWYgKCEoKG4gPSBzZXJpZXMubGVuZ3RoKSA+IDApKSByZXR1cm47XG4gIGZvciAodmFyIGogPSAwLCBzMCA9IHNlcmllc1tvcmRlclswXV0sIG4sIG0gPSBzMC5sZW5ndGg7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBpID0gMCwgeSA9IDA7IGkgPCBuOyArK2kpIHkgKz0gc2VyaWVzW2ldW2pdWzFdIHx8IDA7XG4gICAgczBbal1bMV0gKz0gczBbal1bMF0gPSAteSAvIDI7XG4gIH1cbiAgbm9uZShzZXJpZXMsIG9yZGVyKTtcbn1cbiIsImltcG9ydCBub25lIGZyb20gXCIuL25vbmUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VyaWVzLCBvcmRlcikge1xuICBpZiAoISgobiA9IHNlcmllcy5sZW5ndGgpID4gMCkgfHwgISgobSA9IChzMCA9IHNlcmllc1tvcmRlclswXV0pLmxlbmd0aCkgPiAwKSkgcmV0dXJuO1xuICBmb3IgKHZhciB5ID0gMCwgaiA9IDEsIHMwLCBtLCBuOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIHMxID0gMCwgczIgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICB2YXIgc2kgPSBzZXJpZXNbb3JkZXJbaV1dLFxuICAgICAgICAgIHNpajAgPSBzaVtqXVsxXSB8fCAwLFxuICAgICAgICAgIHNpajEgPSBzaVtqIC0gMV1bMV0gfHwgMCxcbiAgICAgICAgICBzMyA9IChzaWowIC0gc2lqMSkgLyAyO1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBpOyArK2spIHtcbiAgICAgICAgdmFyIHNrID0gc2VyaWVzW29yZGVyW2tdXSxcbiAgICAgICAgICAgIHNrajAgPSBza1tqXVsxXSB8fCAwLFxuICAgICAgICAgICAgc2tqMSA9IHNrW2ogLSAxXVsxXSB8fCAwO1xuICAgICAgICBzMyArPSBza2owIC0gc2tqMTtcbiAgICAgIH1cbiAgICAgIHMxICs9IHNpajAsIHMyICs9IHMzICogc2lqMDtcbiAgICB9XG4gICAgczBbaiAtIDFdWzFdICs9IHMwW2ogLSAxXVswXSA9IHk7XG4gICAgaWYgKHMxKSB5IC09IHMyIC8gczE7XG4gIH1cbiAgczBbaiAtIDFdWzFdICs9IHMwW2ogLSAxXVswXSA9IHk7XG4gIG5vbmUoc2VyaWVzLCBvcmRlcik7XG59XG4iLCJpbXBvcnQgbm9uZSBmcm9tIFwiLi9ub25lLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlcmllcykge1xuICB2YXIgcGVha3MgPSBzZXJpZXMubWFwKHBlYWspO1xuICByZXR1cm4gbm9uZShzZXJpZXMpLnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gcGVha3NbYV0gLSBwZWFrc1tiXTsgfSk7XG59XG5cbmZ1bmN0aW9uIHBlYWsoc2VyaWVzKSB7XG4gIHZhciBpID0gLTEsIGogPSAwLCBuID0gc2VyaWVzLmxlbmd0aCwgdmksIHZqID0gLUluZmluaXR5O1xuICB3aGlsZSAoKytpIDwgbikgaWYgKCh2aSA9ICtzZXJpZXNbaV1bMV0pID4gdmopIHZqID0gdmksIGogPSBpO1xuICByZXR1cm4gajtcbn1cbiIsImltcG9ydCBub25lIGZyb20gXCIuL25vbmUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VyaWVzKSB7XG4gIHZhciBzdW1zID0gc2VyaWVzLm1hcChzdW0pO1xuICByZXR1cm4gbm9uZShzZXJpZXMpLnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gc3Vtc1thXSAtIHN1bXNbYl07IH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VtKHNlcmllcykge1xuICB2YXIgcyA9IDAsIGkgPSAtMSwgbiA9IHNlcmllcy5sZW5ndGgsIHY7XG4gIHdoaWxlICgrK2kgPCBuKSBpZiAodiA9ICtzZXJpZXNbaV1bMV0pIHMgKz0gdjtcbiAgcmV0dXJuIHM7XG59XG4iLCJpbXBvcnQgYXNjZW5kaW5nIGZyb20gXCIuL2FzY2VuZGluZy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZXJpZXMpIHtcbiAgcmV0dXJuIGFzY2VuZGluZyhzZXJpZXMpLnJldmVyc2UoKTtcbn1cbiIsImltcG9ydCBhcHBlYXJhbmNlIGZyb20gXCIuL2FwcGVhcmFuY2UuanNcIjtcbmltcG9ydCB7c3VtfSBmcm9tIFwiLi9hc2NlbmRpbmcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VyaWVzKSB7XG4gIHZhciBuID0gc2VyaWVzLmxlbmd0aCxcbiAgICAgIGksXG4gICAgICBqLFxuICAgICAgc3VtcyA9IHNlcmllcy5tYXAoc3VtKSxcbiAgICAgIG9yZGVyID0gYXBwZWFyYW5jZShzZXJpZXMpLFxuICAgICAgdG9wID0gMCxcbiAgICAgIGJvdHRvbSA9IDAsXG4gICAgICB0b3BzID0gW10sXG4gICAgICBib3R0b21zID0gW107XG5cbiAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgIGogPSBvcmRlcltpXTtcbiAgICBpZiAodG9wIDwgYm90dG9tKSB7XG4gICAgICB0b3AgKz0gc3Vtc1tqXTtcbiAgICAgIHRvcHMucHVzaChqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYm90dG9tICs9IHN1bXNbal07XG4gICAgICBib3R0b21zLnB1c2goaik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJvdHRvbXMucmV2ZXJzZSgpLmNvbmNhdCh0b3BzKTtcbn1cbiIsImltcG9ydCBub25lIGZyb20gXCIuL25vbmUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VyaWVzKSB7XG4gIHJldHVybiBub25lKHNlcmllcykucmV2ZXJzZSgpO1xufVxuIiwiZXhwb3J0IHtkZWZhdWx0IGFzIGFyY30gZnJvbSBcIi4vYXJjLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgYXJlYX0gZnJvbSBcIi4vYXJlYS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGxpbmV9IGZyb20gXCIuL2xpbmUuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBwaWV9IGZyb20gXCIuL3BpZS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGFyZWFSYWRpYWwsIGRlZmF1bHQgYXMgcmFkaWFsQXJlYX0gZnJvbSBcIi4vYXJlYVJhZGlhbC5qc1wiOyAvLyBOb3RlOiByYWRpYWxBcmVhIGlzIGRlcHJlY2F0ZWQhXG5leHBvcnQge2RlZmF1bHQgYXMgbGluZVJhZGlhbCwgZGVmYXVsdCBhcyByYWRpYWxMaW5lfSBmcm9tIFwiLi9saW5lUmFkaWFsLmpzXCI7IC8vIE5vdGU6IHJhZGlhbExpbmUgaXMgZGVwcmVjYXRlZCFcbmV4cG9ydCB7ZGVmYXVsdCBhcyBwb2ludFJhZGlhbH0gZnJvbSBcIi4vcG9pbnRSYWRpYWwuanNcIjtcbmV4cG9ydCB7bGluaywgbGlua0hvcml6b250YWwsIGxpbmtWZXJ0aWNhbCwgbGlua1JhZGlhbH0gZnJvbSBcIi4vbGluay5qc1wiO1xuXG5leHBvcnQge2RlZmF1bHQgYXMgc3ltYm9sLCBzeW1ib2xzU3Ryb2tlLCBzeW1ib2xzRmlsbCwgc3ltYm9sc0ZpbGwgYXMgc3ltYm9sc30gZnJvbSBcIi4vc3ltYm9sLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgc3ltYm9sQXN0ZXJpc2t9IGZyb20gXCIuL3N5bWJvbC9hc3Rlcmlzay5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHN5bWJvbENpcmNsZX0gZnJvbSBcIi4vc3ltYm9sL2NpcmNsZS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHN5bWJvbENyb3NzfSBmcm9tIFwiLi9zeW1ib2wvY3Jvc3MuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBzeW1ib2xEaWFtb25kfSBmcm9tIFwiLi9zeW1ib2wvZGlhbW9uZC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHN5bWJvbERpYW1vbmQyfSBmcm9tIFwiLi9zeW1ib2wvZGlhbW9uZDIuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBzeW1ib2xQbHVzfSBmcm9tIFwiLi9zeW1ib2wvcGx1cy5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHN5bWJvbFNxdWFyZX0gZnJvbSBcIi4vc3ltYm9sL3NxdWFyZS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHN5bWJvbFNxdWFyZTJ9IGZyb20gXCIuL3N5bWJvbC9zcXVhcmUyLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgc3ltYm9sU3Rhcn0gZnJvbSBcIi4vc3ltYm9sL3N0YXIuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBzeW1ib2xUcmlhbmdsZX0gZnJvbSBcIi4vc3ltYm9sL3RyaWFuZ2xlLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgc3ltYm9sVHJpYW5nbGUyfSBmcm9tIFwiLi9zeW1ib2wvdHJpYW5nbGUyLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgc3ltYm9sV3llfSBmcm9tIFwiLi9zeW1ib2wvd3llLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgc3ltYm9sVGltZXMsIGRlZmF1bHQgYXMgc3ltYm9sWH0gZnJvbSBcIi4vc3ltYm9sL3RpbWVzLmpzXCI7XG5cbmV4cG9ydCB7ZGVmYXVsdCBhcyBjdXJ2ZUJhc2lzQ2xvc2VkfSBmcm9tIFwiLi9jdXJ2ZS9iYXNpc0Nsb3NlZC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGN1cnZlQmFzaXNPcGVufSBmcm9tIFwiLi9jdXJ2ZS9iYXNpc09wZW4uanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBjdXJ2ZUJhc2lzfSBmcm9tIFwiLi9jdXJ2ZS9iYXNpcy5qc1wiO1xuZXhwb3J0IHtidW1wWCBhcyBjdXJ2ZUJ1bXBYLCBidW1wWSBhcyBjdXJ2ZUJ1bXBZfSBmcm9tIFwiLi9jdXJ2ZS9idW1wLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgY3VydmVCdW5kbGV9IGZyb20gXCIuL2N1cnZlL2J1bmRsZS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGN1cnZlQ2FyZGluYWxDbG9zZWR9IGZyb20gXCIuL2N1cnZlL2NhcmRpbmFsQ2xvc2VkLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgY3VydmVDYXJkaW5hbE9wZW59IGZyb20gXCIuL2N1cnZlL2NhcmRpbmFsT3Blbi5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGN1cnZlQ2FyZGluYWx9IGZyb20gXCIuL2N1cnZlL2NhcmRpbmFsLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgY3VydmVDYXRtdWxsUm9tQ2xvc2VkfSBmcm9tIFwiLi9jdXJ2ZS9jYXRtdWxsUm9tQ2xvc2VkLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgY3VydmVDYXRtdWxsUm9tT3Blbn0gZnJvbSBcIi4vY3VydmUvY2F0bXVsbFJvbU9wZW4uanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBjdXJ2ZUNhdG11bGxSb219IGZyb20gXCIuL2N1cnZlL2NhdG11bGxSb20uanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBjdXJ2ZUxpbmVhckNsb3NlZH0gZnJvbSBcIi4vY3VydmUvbGluZWFyQ2xvc2VkLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgY3VydmVMaW5lYXJ9IGZyb20gXCIuL2N1cnZlL2xpbmVhci5qc1wiO1xuZXhwb3J0IHttb25vdG9uZVggYXMgY3VydmVNb25vdG9uZVgsIG1vbm90b25lWSBhcyBjdXJ2ZU1vbm90b25lWX0gZnJvbSBcIi4vY3VydmUvbW9ub3RvbmUuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBjdXJ2ZU5hdHVyYWx9IGZyb20gXCIuL2N1cnZlL25hdHVyYWwuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBjdXJ2ZVN0ZXAsIHN0ZXBBZnRlciBhcyBjdXJ2ZVN0ZXBBZnRlciwgc3RlcEJlZm9yZSBhcyBjdXJ2ZVN0ZXBCZWZvcmV9IGZyb20gXCIuL2N1cnZlL3N0ZXAuanNcIjtcblxuZXhwb3J0IHtkZWZhdWx0IGFzIHN0YWNrfSBmcm9tIFwiLi9zdGFjay5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHN0YWNrT2Zmc2V0RXhwYW5kfSBmcm9tIFwiLi9vZmZzZXQvZXhwYW5kLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgc3RhY2tPZmZzZXREaXZlcmdpbmd9IGZyb20gXCIuL29mZnNldC9kaXZlcmdpbmcuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBzdGFja09mZnNldE5vbmV9IGZyb20gXCIuL29mZnNldC9ub25lLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgc3RhY2tPZmZzZXRTaWxob3VldHRlfSBmcm9tIFwiLi9vZmZzZXQvc2lsaG91ZXR0ZS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHN0YWNrT2Zmc2V0V2lnZ2xlfSBmcm9tIFwiLi9vZmZzZXQvd2lnZ2xlLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgc3RhY2tPcmRlckFwcGVhcmFuY2V9IGZyb20gXCIuL29yZGVyL2FwcGVhcmFuY2UuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBzdGFja09yZGVyQXNjZW5kaW5nfSBmcm9tIFwiLi9vcmRlci9hc2NlbmRpbmcuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBzdGFja09yZGVyRGVzY2VuZGluZ30gZnJvbSBcIi4vb3JkZXIvZGVzY2VuZGluZy5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHN0YWNrT3JkZXJJbnNpZGVPdXR9IGZyb20gXCIuL29yZGVyL2luc2lkZU91dC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHN0YWNrT3JkZXJOb25lfSBmcm9tIFwiLi9vcmRlci9ub25lLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgc3RhY2tPcmRlclJldmVyc2V9IGZyb20gXCIuL29yZGVyL3JldmVyc2UuanNcIjtcbiIsInZhciBmcmFtZSA9IDAsIC8vIGlzIGFuIGFuaW1hdGlvbiBmcmFtZSBwZW5kaW5nP1xuICAgIHRpbWVvdXQgPSAwLCAvLyBpcyBhIHRpbWVvdXQgcGVuZGluZz9cbiAgICBpbnRlcnZhbCA9IDAsIC8vIGFyZSBhbnkgdGltZXJzIGFjdGl2ZT9cbiAgICBwb2tlRGVsYXkgPSAxMDAwLCAvLyBob3cgZnJlcXVlbnRseSB3ZSBjaGVjayBmb3IgY2xvY2sgc2tld1xuICAgIHRhc2tIZWFkLFxuICAgIHRhc2tUYWlsLFxuICAgIGNsb2NrTGFzdCA9IDAsXG4gICAgY2xvY2tOb3cgPSAwLFxuICAgIGNsb2NrU2tldyA9IDAsXG4gICAgY2xvY2sgPSB0eXBlb2YgcGVyZm9ybWFuY2UgPT09IFwib2JqZWN0XCIgJiYgcGVyZm9ybWFuY2Uubm93ID8gcGVyZm9ybWFuY2UgOiBEYXRlLFxuICAgIHNldEZyYW1lID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIiAmJiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID8gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZS5iaW5kKHdpbmRvdykgOiBmdW5jdGlvbihmKSB7IHNldFRpbWVvdXQoZiwgMTcpOyB9O1xuXG5leHBvcnQgZnVuY3Rpb24gbm93KCkge1xuICByZXR1cm4gY2xvY2tOb3cgfHwgKHNldEZyYW1lKGNsZWFyTm93KSwgY2xvY2tOb3cgPSBjbG9jay5ub3coKSArIGNsb2NrU2tldyk7XG59XG5cbmZ1bmN0aW9uIGNsZWFyTm93KCkge1xuICBjbG9ja05vdyA9IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUaW1lcigpIHtcbiAgdGhpcy5fY2FsbCA9XG4gIHRoaXMuX3RpbWUgPVxuICB0aGlzLl9uZXh0ID0gbnVsbDtcbn1cblxuVGltZXIucHJvdG90eXBlID0gdGltZXIucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogVGltZXIsXG4gIHJlc3RhcnQ6IGZ1bmN0aW9uKGNhbGxiYWNrLCBkZWxheSwgdGltZSkge1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcImNhbGxiYWNrIGlzIG5vdCBhIGZ1bmN0aW9uXCIpO1xuICAgIHRpbWUgPSAodGltZSA9PSBudWxsID8gbm93KCkgOiArdGltZSkgKyAoZGVsYXkgPT0gbnVsbCA/IDAgOiArZGVsYXkpO1xuICAgIGlmICghdGhpcy5fbmV4dCAmJiB0YXNrVGFpbCAhPT0gdGhpcykge1xuICAgICAgaWYgKHRhc2tUYWlsKSB0YXNrVGFpbC5fbmV4dCA9IHRoaXM7XG4gICAgICBlbHNlIHRhc2tIZWFkID0gdGhpcztcbiAgICAgIHRhc2tUYWlsID0gdGhpcztcbiAgICB9XG4gICAgdGhpcy5fY2FsbCA9IGNhbGxiYWNrO1xuICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgIHNsZWVwKCk7XG4gIH0sXG4gIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9jYWxsKSB7XG4gICAgICB0aGlzLl9jYWxsID0gbnVsbDtcbiAgICAgIHRoaXMuX3RpbWUgPSBJbmZpbml0eTtcbiAgICAgIHNsZWVwKCk7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gdGltZXIoY2FsbGJhY2ssIGRlbGF5LCB0aW1lKSB7XG4gIHZhciB0ID0gbmV3IFRpbWVyO1xuICB0LnJlc3RhcnQoY2FsbGJhY2ssIGRlbGF5LCB0aW1lKTtcbiAgcmV0dXJuIHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aW1lckZsdXNoKCkge1xuICBub3coKTsgLy8gR2V0IHRoZSBjdXJyZW50IHRpbWUsIGlmIG5vdCBhbHJlYWR5IHNldC5cbiAgKytmcmFtZTsgLy8gUHJldGVuZCB3ZeKAmXZlIHNldCBhbiBhbGFybSwgaWYgd2UgaGF2ZW7igJl0IGFscmVhZHkuXG4gIHZhciB0ID0gdGFza0hlYWQsIGU7XG4gIHdoaWxlICh0KSB7XG4gICAgaWYgKChlID0gY2xvY2tOb3cgLSB0Ll90aW1lKSA+PSAwKSB0Ll9jYWxsLmNhbGwodW5kZWZpbmVkLCBlKTtcbiAgICB0ID0gdC5fbmV4dDtcbiAgfVxuICAtLWZyYW1lO1xufVxuXG5mdW5jdGlvbiB3YWtlKCkge1xuICBjbG9ja05vdyA9IChjbG9ja0xhc3QgPSBjbG9jay5ub3coKSkgKyBjbG9ja1NrZXc7XG4gIGZyYW1lID0gdGltZW91dCA9IDA7XG4gIHRyeSB7XG4gICAgdGltZXJGbHVzaCgpO1xuICB9IGZpbmFsbHkge1xuICAgIGZyYW1lID0gMDtcbiAgICBuYXAoKTtcbiAgICBjbG9ja05vdyA9IDA7XG4gIH1cbn1cblxuZnVuY3Rpb24gcG9rZSgpIHtcbiAgdmFyIG5vdyA9IGNsb2NrLm5vdygpLCBkZWxheSA9IG5vdyAtIGNsb2NrTGFzdDtcbiAgaWYgKGRlbGF5ID4gcG9rZURlbGF5KSBjbG9ja1NrZXcgLT0gZGVsYXksIGNsb2NrTGFzdCA9IG5vdztcbn1cblxuZnVuY3Rpb24gbmFwKCkge1xuICB2YXIgdDAsIHQxID0gdGFza0hlYWQsIHQyLCB0aW1lID0gSW5maW5pdHk7XG4gIHdoaWxlICh0MSkge1xuICAgIGlmICh0MS5fY2FsbCkge1xuICAgICAgaWYgKHRpbWUgPiB0MS5fdGltZSkgdGltZSA9IHQxLl90aW1lO1xuICAgICAgdDAgPSB0MSwgdDEgPSB0MS5fbmV4dDtcbiAgICB9IGVsc2Uge1xuICAgICAgdDIgPSB0MS5fbmV4dCwgdDEuX25leHQgPSBudWxsO1xuICAgICAgdDEgPSB0MCA/IHQwLl9uZXh0ID0gdDIgOiB0YXNrSGVhZCA9IHQyO1xuICAgIH1cbiAgfVxuICB0YXNrVGFpbCA9IHQwO1xuICBzbGVlcCh0aW1lKTtcbn1cblxuZnVuY3Rpb24gc2xlZXAodGltZSkge1xuICBpZiAoZnJhbWUpIHJldHVybjsgLy8gU29vbmVzdCBhbGFybSBhbHJlYWR5IHNldCwgb3Igd2lsbCBiZS5cbiAgaWYgKHRpbWVvdXQpIHRpbWVvdXQgPSBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gIHZhciBkZWxheSA9IHRpbWUgLSBjbG9ja05vdzsgLy8gU3RyaWN0bHkgbGVzcyB0aGFuIGlmIHdlIHJlY29tcHV0ZWQgY2xvY2tOb3cuXG4gIGlmIChkZWxheSA+IDI0KSB7XG4gICAgaWYgKHRpbWUgPCBJbmZpbml0eSkgdGltZW91dCA9IHNldFRpbWVvdXQod2FrZSwgdGltZSAtIGNsb2NrLm5vdygpIC0gY2xvY2tTa2V3KTtcbiAgICBpZiAoaW50ZXJ2YWwpIGludGVydmFsID0gY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKCFpbnRlcnZhbCkgY2xvY2tMYXN0ID0gY2xvY2subm93KCksIGludGVydmFsID0gc2V0SW50ZXJ2YWwocG9rZSwgcG9rZURlbGF5KTtcbiAgICBmcmFtZSA9IDEsIHNldEZyYW1lKHdha2UpO1xuICB9XG59XG4iLCJpbXBvcnQge1RpbWVyfSBmcm9tIFwiLi90aW1lci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjYWxsYmFjaywgZGVsYXksIHRpbWUpIHtcbiAgdmFyIHQgPSBuZXcgVGltZXI7XG4gIGRlbGF5ID0gZGVsYXkgPT0gbnVsbCA/IDAgOiArZGVsYXk7XG4gIHQucmVzdGFydChlbGFwc2VkID0+IHtcbiAgICB0LnN0b3AoKTtcbiAgICBjYWxsYmFjayhlbGFwc2VkICsgZGVsYXkpO1xuICB9LCBkZWxheSwgdGltZSk7XG4gIHJldHVybiB0O1xufVxuIiwiaW1wb3J0IHtUaW1lciwgbm93fSBmcm9tIFwiLi90aW1lci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjYWxsYmFjaywgZGVsYXksIHRpbWUpIHtcbiAgdmFyIHQgPSBuZXcgVGltZXIsIHRvdGFsID0gZGVsYXk7XG4gIGlmIChkZWxheSA9PSBudWxsKSByZXR1cm4gdC5yZXN0YXJ0KGNhbGxiYWNrLCBkZWxheSwgdGltZSksIHQ7XG4gIHQuX3Jlc3RhcnQgPSB0LnJlc3RhcnQ7XG4gIHQucmVzdGFydCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBkZWxheSwgdGltZSkge1xuICAgIGRlbGF5ID0gK2RlbGF5LCB0aW1lID0gdGltZSA9PSBudWxsID8gbm93KCkgOiArdGltZTtcbiAgICB0Ll9yZXN0YXJ0KGZ1bmN0aW9uIHRpY2soZWxhcHNlZCkge1xuICAgICAgZWxhcHNlZCArPSB0b3RhbDtcbiAgICAgIHQuX3Jlc3RhcnQodGljaywgdG90YWwgKz0gZGVsYXksIHRpbWUpO1xuICAgICAgY2FsbGJhY2soZWxhcHNlZCk7XG4gICAgfSwgZGVsYXksIHRpbWUpO1xuICB9XG4gIHQucmVzdGFydChjYWxsYmFjaywgZGVsYXksIHRpbWUpO1xuICByZXR1cm4gdDtcbn1cbiIsImV4cG9ydCB7XG4gIG5vdyxcbiAgdGltZXIsXG4gIHRpbWVyRmx1c2hcbn0gZnJvbSBcIi4vdGltZXIuanNcIjtcblxuZXhwb3J0IHtcbiAgZGVmYXVsdCBhcyB0aW1lb3V0XG59IGZyb20gXCIuL3RpbWVvdXQuanNcIjtcblxuZXhwb3J0IHtcbiAgZGVmYXVsdCBhcyBpbnRlcnZhbFxufSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuIiwiaW1wb3J0IHtcbiAgdGltZURheSxcbiAgdGltZVN1bmRheSxcbiAgdGltZU1vbmRheSxcbiAgdGltZVRodXJzZGF5LFxuICB0aW1lWWVhcixcbiAgdXRjRGF5LFxuICB1dGNTdW5kYXksXG4gIHV0Y01vbmRheSxcbiAgdXRjVGh1cnNkYXksXG4gIHV0Y1llYXJcbn0gZnJvbSBcImQzLXRpbWVcIjtcblxuZnVuY3Rpb24gbG9jYWxEYXRlKGQpIHtcbiAgaWYgKDAgPD0gZC55ICYmIGQueSA8IDEwMCkge1xuICAgIHZhciBkYXRlID0gbmV3IERhdGUoLTEsIGQubSwgZC5kLCBkLkgsIGQuTSwgZC5TLCBkLkwpO1xuICAgIGRhdGUuc2V0RnVsbFllYXIoZC55KTtcbiAgICByZXR1cm4gZGF0ZTtcbiAgfVxuICByZXR1cm4gbmV3IERhdGUoZC55LCBkLm0sIGQuZCwgZC5ILCBkLk0sIGQuUywgZC5MKTtcbn1cblxuZnVuY3Rpb24gdXRjRGF0ZShkKSB7XG4gIGlmICgwIDw9IGQueSAmJiBkLnkgPCAxMDApIHtcbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKC0xLCBkLm0sIGQuZCwgZC5ILCBkLk0sIGQuUywgZC5MKSk7XG4gICAgZGF0ZS5zZXRVVENGdWxsWWVhcihkLnkpO1xuICAgIHJldHVybiBkYXRlO1xuICB9XG4gIHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQyhkLnksIGQubSwgZC5kLCBkLkgsIGQuTSwgZC5TLCBkLkwpKTtcbn1cblxuZnVuY3Rpb24gbmV3RGF0ZSh5LCBtLCBkKSB7XG4gIHJldHVybiB7eTogeSwgbTogbSwgZDogZCwgSDogMCwgTTogMCwgUzogMCwgTDogMH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZvcm1hdExvY2FsZShsb2NhbGUpIHtcbiAgdmFyIGxvY2FsZV9kYXRlVGltZSA9IGxvY2FsZS5kYXRlVGltZSxcbiAgICAgIGxvY2FsZV9kYXRlID0gbG9jYWxlLmRhdGUsXG4gICAgICBsb2NhbGVfdGltZSA9IGxvY2FsZS50aW1lLFxuICAgICAgbG9jYWxlX3BlcmlvZHMgPSBsb2NhbGUucGVyaW9kcyxcbiAgICAgIGxvY2FsZV93ZWVrZGF5cyA9IGxvY2FsZS5kYXlzLFxuICAgICAgbG9jYWxlX3Nob3J0V2Vla2RheXMgPSBsb2NhbGUuc2hvcnREYXlzLFxuICAgICAgbG9jYWxlX21vbnRocyA9IGxvY2FsZS5tb250aHMsXG4gICAgICBsb2NhbGVfc2hvcnRNb250aHMgPSBsb2NhbGUuc2hvcnRNb250aHM7XG5cbiAgdmFyIHBlcmlvZFJlID0gZm9ybWF0UmUobG9jYWxlX3BlcmlvZHMpLFxuICAgICAgcGVyaW9kTG9va3VwID0gZm9ybWF0TG9va3VwKGxvY2FsZV9wZXJpb2RzKSxcbiAgICAgIHdlZWtkYXlSZSA9IGZvcm1hdFJlKGxvY2FsZV93ZWVrZGF5cyksXG4gICAgICB3ZWVrZGF5TG9va3VwID0gZm9ybWF0TG9va3VwKGxvY2FsZV93ZWVrZGF5cyksXG4gICAgICBzaG9ydFdlZWtkYXlSZSA9IGZvcm1hdFJlKGxvY2FsZV9zaG9ydFdlZWtkYXlzKSxcbiAgICAgIHNob3J0V2Vla2RheUxvb2t1cCA9IGZvcm1hdExvb2t1cChsb2NhbGVfc2hvcnRXZWVrZGF5cyksXG4gICAgICBtb250aFJlID0gZm9ybWF0UmUobG9jYWxlX21vbnRocyksXG4gICAgICBtb250aExvb2t1cCA9IGZvcm1hdExvb2t1cChsb2NhbGVfbW9udGhzKSxcbiAgICAgIHNob3J0TW9udGhSZSA9IGZvcm1hdFJlKGxvY2FsZV9zaG9ydE1vbnRocyksXG4gICAgICBzaG9ydE1vbnRoTG9va3VwID0gZm9ybWF0TG9va3VwKGxvY2FsZV9zaG9ydE1vbnRocyk7XG5cbiAgdmFyIGZvcm1hdHMgPSB7XG4gICAgXCJhXCI6IGZvcm1hdFNob3J0V2Vla2RheSxcbiAgICBcIkFcIjogZm9ybWF0V2Vla2RheSxcbiAgICBcImJcIjogZm9ybWF0U2hvcnRNb250aCxcbiAgICBcIkJcIjogZm9ybWF0TW9udGgsXG4gICAgXCJjXCI6IG51bGwsXG4gICAgXCJkXCI6IGZvcm1hdERheU9mTW9udGgsXG4gICAgXCJlXCI6IGZvcm1hdERheU9mTW9udGgsXG4gICAgXCJmXCI6IGZvcm1hdE1pY3Jvc2Vjb25kcyxcbiAgICBcImdcIjogZm9ybWF0WWVhcklTTyxcbiAgICBcIkdcIjogZm9ybWF0RnVsbFllYXJJU08sXG4gICAgXCJIXCI6IGZvcm1hdEhvdXIyNCxcbiAgICBcIklcIjogZm9ybWF0SG91cjEyLFxuICAgIFwialwiOiBmb3JtYXREYXlPZlllYXIsXG4gICAgXCJMXCI6IGZvcm1hdE1pbGxpc2Vjb25kcyxcbiAgICBcIm1cIjogZm9ybWF0TW9udGhOdW1iZXIsXG4gICAgXCJNXCI6IGZvcm1hdE1pbnV0ZXMsXG4gICAgXCJwXCI6IGZvcm1hdFBlcmlvZCxcbiAgICBcInFcIjogZm9ybWF0UXVhcnRlcixcbiAgICBcIlFcIjogZm9ybWF0VW5peFRpbWVzdGFtcCxcbiAgICBcInNcIjogZm9ybWF0VW5peFRpbWVzdGFtcFNlY29uZHMsXG4gICAgXCJTXCI6IGZvcm1hdFNlY29uZHMsXG4gICAgXCJ1XCI6IGZvcm1hdFdlZWtkYXlOdW1iZXJNb25kYXksXG4gICAgXCJVXCI6IGZvcm1hdFdlZWtOdW1iZXJTdW5kYXksXG4gICAgXCJWXCI6IGZvcm1hdFdlZWtOdW1iZXJJU08sXG4gICAgXCJ3XCI6IGZvcm1hdFdlZWtkYXlOdW1iZXJTdW5kYXksXG4gICAgXCJXXCI6IGZvcm1hdFdlZWtOdW1iZXJNb25kYXksXG4gICAgXCJ4XCI6IG51bGwsXG4gICAgXCJYXCI6IG51bGwsXG4gICAgXCJ5XCI6IGZvcm1hdFllYXIsXG4gICAgXCJZXCI6IGZvcm1hdEZ1bGxZZWFyLFxuICAgIFwiWlwiOiBmb3JtYXRab25lLFxuICAgIFwiJVwiOiBmb3JtYXRMaXRlcmFsUGVyY2VudFxuICB9O1xuXG4gIHZhciB1dGNGb3JtYXRzID0ge1xuICAgIFwiYVwiOiBmb3JtYXRVVENTaG9ydFdlZWtkYXksXG4gICAgXCJBXCI6IGZvcm1hdFVUQ1dlZWtkYXksXG4gICAgXCJiXCI6IGZvcm1hdFVUQ1Nob3J0TW9udGgsXG4gICAgXCJCXCI6IGZvcm1hdFVUQ01vbnRoLFxuICAgIFwiY1wiOiBudWxsLFxuICAgIFwiZFwiOiBmb3JtYXRVVENEYXlPZk1vbnRoLFxuICAgIFwiZVwiOiBmb3JtYXRVVENEYXlPZk1vbnRoLFxuICAgIFwiZlwiOiBmb3JtYXRVVENNaWNyb3NlY29uZHMsXG4gICAgXCJnXCI6IGZvcm1hdFVUQ1llYXJJU08sXG4gICAgXCJHXCI6IGZvcm1hdFVUQ0Z1bGxZZWFySVNPLFxuICAgIFwiSFwiOiBmb3JtYXRVVENIb3VyMjQsXG4gICAgXCJJXCI6IGZvcm1hdFVUQ0hvdXIxMixcbiAgICBcImpcIjogZm9ybWF0VVRDRGF5T2ZZZWFyLFxuICAgIFwiTFwiOiBmb3JtYXRVVENNaWxsaXNlY29uZHMsXG4gICAgXCJtXCI6IGZvcm1hdFVUQ01vbnRoTnVtYmVyLFxuICAgIFwiTVwiOiBmb3JtYXRVVENNaW51dGVzLFxuICAgIFwicFwiOiBmb3JtYXRVVENQZXJpb2QsXG4gICAgXCJxXCI6IGZvcm1hdFVUQ1F1YXJ0ZXIsXG4gICAgXCJRXCI6IGZvcm1hdFVuaXhUaW1lc3RhbXAsXG4gICAgXCJzXCI6IGZvcm1hdFVuaXhUaW1lc3RhbXBTZWNvbmRzLFxuICAgIFwiU1wiOiBmb3JtYXRVVENTZWNvbmRzLFxuICAgIFwidVwiOiBmb3JtYXRVVENXZWVrZGF5TnVtYmVyTW9uZGF5LFxuICAgIFwiVVwiOiBmb3JtYXRVVENXZWVrTnVtYmVyU3VuZGF5LFxuICAgIFwiVlwiOiBmb3JtYXRVVENXZWVrTnVtYmVySVNPLFxuICAgIFwid1wiOiBmb3JtYXRVVENXZWVrZGF5TnVtYmVyU3VuZGF5LFxuICAgIFwiV1wiOiBmb3JtYXRVVENXZWVrTnVtYmVyTW9uZGF5LFxuICAgIFwieFwiOiBudWxsLFxuICAgIFwiWFwiOiBudWxsLFxuICAgIFwieVwiOiBmb3JtYXRVVENZZWFyLFxuICAgIFwiWVwiOiBmb3JtYXRVVENGdWxsWWVhcixcbiAgICBcIlpcIjogZm9ybWF0VVRDWm9uZSxcbiAgICBcIiVcIjogZm9ybWF0TGl0ZXJhbFBlcmNlbnRcbiAgfTtcblxuICB2YXIgcGFyc2VzID0ge1xuICAgIFwiYVwiOiBwYXJzZVNob3J0V2Vla2RheSxcbiAgICBcIkFcIjogcGFyc2VXZWVrZGF5LFxuICAgIFwiYlwiOiBwYXJzZVNob3J0TW9udGgsXG4gICAgXCJCXCI6IHBhcnNlTW9udGgsXG4gICAgXCJjXCI6IHBhcnNlTG9jYWxlRGF0ZVRpbWUsXG4gICAgXCJkXCI6IHBhcnNlRGF5T2ZNb250aCxcbiAgICBcImVcIjogcGFyc2VEYXlPZk1vbnRoLFxuICAgIFwiZlwiOiBwYXJzZU1pY3Jvc2Vjb25kcyxcbiAgICBcImdcIjogcGFyc2VZZWFyLFxuICAgIFwiR1wiOiBwYXJzZUZ1bGxZZWFyLFxuICAgIFwiSFwiOiBwYXJzZUhvdXIyNCxcbiAgICBcIklcIjogcGFyc2VIb3VyMjQsXG4gICAgXCJqXCI6IHBhcnNlRGF5T2ZZZWFyLFxuICAgIFwiTFwiOiBwYXJzZU1pbGxpc2Vjb25kcyxcbiAgICBcIm1cIjogcGFyc2VNb250aE51bWJlcixcbiAgICBcIk1cIjogcGFyc2VNaW51dGVzLFxuICAgIFwicFwiOiBwYXJzZVBlcmlvZCxcbiAgICBcInFcIjogcGFyc2VRdWFydGVyLFxuICAgIFwiUVwiOiBwYXJzZVVuaXhUaW1lc3RhbXAsXG4gICAgXCJzXCI6IHBhcnNlVW5peFRpbWVzdGFtcFNlY29uZHMsXG4gICAgXCJTXCI6IHBhcnNlU2Vjb25kcyxcbiAgICBcInVcIjogcGFyc2VXZWVrZGF5TnVtYmVyTW9uZGF5LFxuICAgIFwiVVwiOiBwYXJzZVdlZWtOdW1iZXJTdW5kYXksXG4gICAgXCJWXCI6IHBhcnNlV2Vla051bWJlcklTTyxcbiAgICBcIndcIjogcGFyc2VXZWVrZGF5TnVtYmVyU3VuZGF5LFxuICAgIFwiV1wiOiBwYXJzZVdlZWtOdW1iZXJNb25kYXksXG4gICAgXCJ4XCI6IHBhcnNlTG9jYWxlRGF0ZSxcbiAgICBcIlhcIjogcGFyc2VMb2NhbGVUaW1lLFxuICAgIFwieVwiOiBwYXJzZVllYXIsXG4gICAgXCJZXCI6IHBhcnNlRnVsbFllYXIsXG4gICAgXCJaXCI6IHBhcnNlWm9uZSxcbiAgICBcIiVcIjogcGFyc2VMaXRlcmFsUGVyY2VudFxuICB9O1xuXG4gIC8vIFRoZXNlIHJlY3Vyc2l2ZSBkaXJlY3RpdmUgZGVmaW5pdGlvbnMgbXVzdCBiZSBkZWZlcnJlZC5cbiAgZm9ybWF0cy54ID0gbmV3Rm9ybWF0KGxvY2FsZV9kYXRlLCBmb3JtYXRzKTtcbiAgZm9ybWF0cy5YID0gbmV3Rm9ybWF0KGxvY2FsZV90aW1lLCBmb3JtYXRzKTtcbiAgZm9ybWF0cy5jID0gbmV3Rm9ybWF0KGxvY2FsZV9kYXRlVGltZSwgZm9ybWF0cyk7XG4gIHV0Y0Zvcm1hdHMueCA9IG5ld0Zvcm1hdChsb2NhbGVfZGF0ZSwgdXRjRm9ybWF0cyk7XG4gIHV0Y0Zvcm1hdHMuWCA9IG5ld0Zvcm1hdChsb2NhbGVfdGltZSwgdXRjRm9ybWF0cyk7XG4gIHV0Y0Zvcm1hdHMuYyA9IG5ld0Zvcm1hdChsb2NhbGVfZGF0ZVRpbWUsIHV0Y0Zvcm1hdHMpO1xuXG4gIGZ1bmN0aW9uIG5ld0Zvcm1hdChzcGVjaWZpZXIsIGZvcm1hdHMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgdmFyIHN0cmluZyA9IFtdLFxuICAgICAgICAgIGkgPSAtMSxcbiAgICAgICAgICBqID0gMCxcbiAgICAgICAgICBuID0gc3BlY2lmaWVyLmxlbmd0aCxcbiAgICAgICAgICBjLFxuICAgICAgICAgIHBhZCxcbiAgICAgICAgICBmb3JtYXQ7XG5cbiAgICAgIGlmICghKGRhdGUgaW5zdGFuY2VvZiBEYXRlKSkgZGF0ZSA9IG5ldyBEYXRlKCtkYXRlKTtcblxuICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgaWYgKHNwZWNpZmllci5jaGFyQ29kZUF0KGkpID09PSAzNykge1xuICAgICAgICAgIHN0cmluZy5wdXNoKHNwZWNpZmllci5zbGljZShqLCBpKSk7XG4gICAgICAgICAgaWYgKChwYWQgPSBwYWRzW2MgPSBzcGVjaWZpZXIuY2hhckF0KCsraSldKSAhPSBudWxsKSBjID0gc3BlY2lmaWVyLmNoYXJBdCgrK2kpO1xuICAgICAgICAgIGVsc2UgcGFkID0gYyA9PT0gXCJlXCIgPyBcIiBcIiA6IFwiMFwiO1xuICAgICAgICAgIGlmIChmb3JtYXQgPSBmb3JtYXRzW2NdKSBjID0gZm9ybWF0KGRhdGUsIHBhZCk7XG4gICAgICAgICAgc3RyaW5nLnB1c2goYyk7XG4gICAgICAgICAgaiA9IGkgKyAxO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHN0cmluZy5wdXNoKHNwZWNpZmllci5zbGljZShqLCBpKSk7XG4gICAgICByZXR1cm4gc3RyaW5nLmpvaW4oXCJcIik7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5ld1BhcnNlKHNwZWNpZmllciwgWikge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgIHZhciBkID0gbmV3RGF0ZSgxOTAwLCB1bmRlZmluZWQsIDEpLFxuICAgICAgICAgIGkgPSBwYXJzZVNwZWNpZmllcihkLCBzcGVjaWZpZXIsIHN0cmluZyArPSBcIlwiLCAwKSxcbiAgICAgICAgICB3ZWVrLCBkYXk7XG4gICAgICBpZiAoaSAhPSBzdHJpbmcubGVuZ3RoKSByZXR1cm4gbnVsbDtcblxuICAgICAgLy8gSWYgYSBVTklYIHRpbWVzdGFtcCBpcyBzcGVjaWZpZWQsIHJldHVybiBpdC5cbiAgICAgIGlmIChcIlFcIiBpbiBkKSByZXR1cm4gbmV3IERhdGUoZC5RKTtcbiAgICAgIGlmIChcInNcIiBpbiBkKSByZXR1cm4gbmV3IERhdGUoZC5zICogMTAwMCArIChcIkxcIiBpbiBkID8gZC5MIDogMCkpO1xuXG4gICAgICAvLyBJZiB0aGlzIGlzIHV0Y1BhcnNlLCBuZXZlciB1c2UgdGhlIGxvY2FsIHRpbWV6b25lLlxuICAgICAgaWYgKFogJiYgIShcIlpcIiBpbiBkKSkgZC5aID0gMDtcblxuICAgICAgLy8gVGhlIGFtLXBtIGZsYWcgaXMgMCBmb3IgQU0sIGFuZCAxIGZvciBQTS5cbiAgICAgIGlmIChcInBcIiBpbiBkKSBkLkggPSBkLkggJSAxMiArIGQucCAqIDEyO1xuXG4gICAgICAvLyBJZiB0aGUgbW9udGggd2FzIG5vdCBzcGVjaWZpZWQsIGluaGVyaXQgZnJvbSB0aGUgcXVhcnRlci5cbiAgICAgIGlmIChkLm0gPT09IHVuZGVmaW5lZCkgZC5tID0gXCJxXCIgaW4gZCA/IGQucSA6IDA7XG5cbiAgICAgIC8vIENvbnZlcnQgZGF5LW9mLXdlZWsgYW5kIHdlZWstb2YteWVhciB0byBkYXktb2YteWVhci5cbiAgICAgIGlmIChcIlZcIiBpbiBkKSB7XG4gICAgICAgIGlmIChkLlYgPCAxIHx8IGQuViA+IDUzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgaWYgKCEoXCJ3XCIgaW4gZCkpIGQudyA9IDE7XG4gICAgICAgIGlmIChcIlpcIiBpbiBkKSB7XG4gICAgICAgICAgd2VlayA9IHV0Y0RhdGUobmV3RGF0ZShkLnksIDAsIDEpKSwgZGF5ID0gd2Vlay5nZXRVVENEYXkoKTtcbiAgICAgICAgICB3ZWVrID0gZGF5ID4gNCB8fCBkYXkgPT09IDAgPyB1dGNNb25kYXkuY2VpbCh3ZWVrKSA6IHV0Y01vbmRheSh3ZWVrKTtcbiAgICAgICAgICB3ZWVrID0gdXRjRGF5Lm9mZnNldCh3ZWVrLCAoZC5WIC0gMSkgKiA3KTtcbiAgICAgICAgICBkLnkgPSB3ZWVrLmdldFVUQ0Z1bGxZZWFyKCk7XG4gICAgICAgICAgZC5tID0gd2Vlay5nZXRVVENNb250aCgpO1xuICAgICAgICAgIGQuZCA9IHdlZWsuZ2V0VVRDRGF0ZSgpICsgKGQudyArIDYpICUgNztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3ZWVrID0gbG9jYWxEYXRlKG5ld0RhdGUoZC55LCAwLCAxKSksIGRheSA9IHdlZWsuZ2V0RGF5KCk7XG4gICAgICAgICAgd2VlayA9IGRheSA+IDQgfHwgZGF5ID09PSAwID8gdGltZU1vbmRheS5jZWlsKHdlZWspIDogdGltZU1vbmRheSh3ZWVrKTtcbiAgICAgICAgICB3ZWVrID0gdGltZURheS5vZmZzZXQod2VlaywgKGQuViAtIDEpICogNyk7XG4gICAgICAgICAgZC55ID0gd2Vlay5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgIGQubSA9IHdlZWsuZ2V0TW9udGgoKTtcbiAgICAgICAgICBkLmQgPSB3ZWVrLmdldERhdGUoKSArIChkLncgKyA2KSAlIDc7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoXCJXXCIgaW4gZCB8fCBcIlVcIiBpbiBkKSB7XG4gICAgICAgIGlmICghKFwid1wiIGluIGQpKSBkLncgPSBcInVcIiBpbiBkID8gZC51ICUgNyA6IFwiV1wiIGluIGQgPyAxIDogMDtcbiAgICAgICAgZGF5ID0gXCJaXCIgaW4gZCA/IHV0Y0RhdGUobmV3RGF0ZShkLnksIDAsIDEpKS5nZXRVVENEYXkoKSA6IGxvY2FsRGF0ZShuZXdEYXRlKGQueSwgMCwgMSkpLmdldERheSgpO1xuICAgICAgICBkLm0gPSAwO1xuICAgICAgICBkLmQgPSBcIldcIiBpbiBkID8gKGQudyArIDYpICUgNyArIGQuVyAqIDcgLSAoZGF5ICsgNSkgJSA3IDogZC53ICsgZC5VICogNyAtIChkYXkgKyA2KSAlIDc7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGEgdGltZSB6b25lIGlzIHNwZWNpZmllZCwgYWxsIGZpZWxkcyBhcmUgaW50ZXJwcmV0ZWQgYXMgVVRDIGFuZCB0aGVuXG4gICAgICAvLyBvZmZzZXQgYWNjb3JkaW5nIHRvIHRoZSBzcGVjaWZpZWQgdGltZSB6b25lLlxuICAgICAgaWYgKFwiWlwiIGluIGQpIHtcbiAgICAgICAgZC5IICs9IGQuWiAvIDEwMCB8IDA7XG4gICAgICAgIGQuTSArPSBkLlogJSAxMDA7XG4gICAgICAgIHJldHVybiB1dGNEYXRlKGQpO1xuICAgICAgfVxuXG4gICAgICAvLyBPdGhlcndpc2UsIGFsbCBmaWVsZHMgYXJlIGluIGxvY2FsIHRpbWUuXG4gICAgICByZXR1cm4gbG9jYWxEYXRlKGQpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVNwZWNpZmllcihkLCBzcGVjaWZpZXIsIHN0cmluZywgaikge1xuICAgIHZhciBpID0gMCxcbiAgICAgICAgbiA9IHNwZWNpZmllci5sZW5ndGgsXG4gICAgICAgIG0gPSBzdHJpbmcubGVuZ3RoLFxuICAgICAgICBjLFxuICAgICAgICBwYXJzZTtcblxuICAgIHdoaWxlIChpIDwgbikge1xuICAgICAgaWYgKGogPj0gbSkgcmV0dXJuIC0xO1xuICAgICAgYyA9IHNwZWNpZmllci5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICBpZiAoYyA9PT0gMzcpIHtcbiAgICAgICAgYyA9IHNwZWNpZmllci5jaGFyQXQoaSsrKTtcbiAgICAgICAgcGFyc2UgPSBwYXJzZXNbYyBpbiBwYWRzID8gc3BlY2lmaWVyLmNoYXJBdChpKyspIDogY107XG4gICAgICAgIGlmICghcGFyc2UgfHwgKChqID0gcGFyc2UoZCwgc3RyaW5nLCBqKSkgPCAwKSkgcmV0dXJuIC0xO1xuICAgICAgfSBlbHNlIGlmIChjICE9IHN0cmluZy5jaGFyQ29kZUF0KGorKykpIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBqO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VQZXJpb2QoZCwgc3RyaW5nLCBpKSB7XG4gICAgdmFyIG4gPSBwZXJpb2RSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gICAgcmV0dXJuIG4gPyAoZC5wID0gcGVyaW9kTG9va3VwLmdldChuWzBdLnRvTG93ZXJDYXNlKCkpLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVNob3J0V2Vla2RheShkLCBzdHJpbmcsIGkpIHtcbiAgICB2YXIgbiA9IHNob3J0V2Vla2RheVJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgICByZXR1cm4gbiA/IChkLncgPSBzaG9ydFdlZWtkYXlMb29rdXAuZ2V0KG5bMF0udG9Mb3dlckNhc2UoKSksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlV2Vla2RheShkLCBzdHJpbmcsIGkpIHtcbiAgICB2YXIgbiA9IHdlZWtkYXlSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gICAgcmV0dXJuIG4gPyAoZC53ID0gd2Vla2RheUxvb2t1cC5nZXQoblswXS50b0xvd2VyQ2FzZSgpKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VTaG9ydE1vbnRoKGQsIHN0cmluZywgaSkge1xuICAgIHZhciBuID0gc2hvcnRNb250aFJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgICByZXR1cm4gbiA/IChkLm0gPSBzaG9ydE1vbnRoTG9va3VwLmdldChuWzBdLnRvTG93ZXJDYXNlKCkpLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZU1vbnRoKGQsIHN0cmluZywgaSkge1xuICAgIHZhciBuID0gbW9udGhSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gICAgcmV0dXJuIG4gPyAoZC5tID0gbW9udGhMb29rdXAuZ2V0KG5bMF0udG9Mb3dlckNhc2UoKSksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlTG9jYWxlRGF0ZVRpbWUoZCwgc3RyaW5nLCBpKSB7XG4gICAgcmV0dXJuIHBhcnNlU3BlY2lmaWVyKGQsIGxvY2FsZV9kYXRlVGltZSwgc3RyaW5nLCBpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlTG9jYWxlRGF0ZShkLCBzdHJpbmcsIGkpIHtcbiAgICByZXR1cm4gcGFyc2VTcGVjaWZpZXIoZCwgbG9jYWxlX2RhdGUsIHN0cmluZywgaSk7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUxvY2FsZVRpbWUoZCwgc3RyaW5nLCBpKSB7XG4gICAgcmV0dXJuIHBhcnNlU3BlY2lmaWVyKGQsIGxvY2FsZV90aW1lLCBzdHJpbmcsIGkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0U2hvcnRXZWVrZGF5KGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3Nob3J0V2Vla2RheXNbZC5nZXREYXkoKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRXZWVrZGF5KGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3dlZWtkYXlzW2QuZ2V0RGF5KCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0U2hvcnRNb250aChkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV9zaG9ydE1vbnRoc1tkLmdldE1vbnRoKCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0TW9udGgoZCkge1xuICAgIHJldHVybiBsb2NhbGVfbW9udGhzW2QuZ2V0TW9udGgoKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRQZXJpb2QoZCkge1xuICAgIHJldHVybiBsb2NhbGVfcGVyaW9kc1srKGQuZ2V0SG91cnMoKSA+PSAxMildO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0UXVhcnRlcihkKSB7XG4gICAgcmV0dXJuIDEgKyB+fihkLmdldE1vbnRoKCkgLyAzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFVUQ1Nob3J0V2Vla2RheShkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV9zaG9ydFdlZWtkYXlzW2QuZ2V0VVRDRGF5KCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VVRDV2Vla2RheShkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV93ZWVrZGF5c1tkLmdldFVUQ0RheSgpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFVUQ1Nob3J0TW9udGgoZCkge1xuICAgIHJldHVybiBsb2NhbGVfc2hvcnRNb250aHNbZC5nZXRVVENNb250aCgpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFVUQ01vbnRoKGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX21vbnRoc1tkLmdldFVUQ01vbnRoKCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VVRDUGVyaW9kKGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3BlcmlvZHNbKyhkLmdldFVUQ0hvdXJzKCkgPj0gMTIpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFVUQ1F1YXJ0ZXIoZCkge1xuICAgIHJldHVybiAxICsgfn4oZC5nZXRVVENNb250aCgpIC8gMyk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGZvcm1hdDogZnVuY3Rpb24oc3BlY2lmaWVyKSB7XG4gICAgICB2YXIgZiA9IG5ld0Zvcm1hdChzcGVjaWZpZXIgKz0gXCJcIiwgZm9ybWF0cyk7XG4gICAgICBmLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiBzcGVjaWZpZXI7IH07XG4gICAgICByZXR1cm4gZjtcbiAgICB9LFxuICAgIHBhcnNlOiBmdW5jdGlvbihzcGVjaWZpZXIpIHtcbiAgICAgIHZhciBwID0gbmV3UGFyc2Uoc3BlY2lmaWVyICs9IFwiXCIsIGZhbHNlKTtcbiAgICAgIHAudG9TdHJpbmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNwZWNpZmllcjsgfTtcbiAgICAgIHJldHVybiBwO1xuICAgIH0sXG4gICAgdXRjRm9ybWF0OiBmdW5jdGlvbihzcGVjaWZpZXIpIHtcbiAgICAgIHZhciBmID0gbmV3Rm9ybWF0KHNwZWNpZmllciArPSBcIlwiLCB1dGNGb3JtYXRzKTtcbiAgICAgIGYudG9TdHJpbmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNwZWNpZmllcjsgfTtcbiAgICAgIHJldHVybiBmO1xuICAgIH0sXG4gICAgdXRjUGFyc2U6IGZ1bmN0aW9uKHNwZWNpZmllcikge1xuICAgICAgdmFyIHAgPSBuZXdQYXJzZShzcGVjaWZpZXIgKz0gXCJcIiwgdHJ1ZSk7XG4gICAgICBwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiBzcGVjaWZpZXI7IH07XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gIH07XG59XG5cbnZhciBwYWRzID0ge1wiLVwiOiBcIlwiLCBcIl9cIjogXCIgXCIsIFwiMFwiOiBcIjBcIn0sXG4gICAgbnVtYmVyUmUgPSAvXlxccypcXGQrLywgLy8gbm90ZTogaWdub3JlcyBuZXh0IGRpcmVjdGl2ZVxuICAgIHBlcmNlbnRSZSA9IC9eJS8sXG4gICAgcmVxdW90ZVJlID0gL1tcXFxcXiQqKz98W1xcXSgpLnt9XS9nO1xuXG5mdW5jdGlvbiBwYWQodmFsdWUsIGZpbGwsIHdpZHRoKSB7XG4gIHZhciBzaWduID0gdmFsdWUgPCAwID8gXCItXCIgOiBcIlwiLFxuICAgICAgc3RyaW5nID0gKHNpZ24gPyAtdmFsdWUgOiB2YWx1ZSkgKyBcIlwiLFxuICAgICAgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aDtcbiAgcmV0dXJuIHNpZ24gKyAobGVuZ3RoIDwgd2lkdGggPyBuZXcgQXJyYXkod2lkdGggLSBsZW5ndGggKyAxKS5qb2luKGZpbGwpICsgc3RyaW5nIDogc3RyaW5nKTtcbn1cblxuZnVuY3Rpb24gcmVxdW90ZShzKSB7XG4gIHJldHVybiBzLnJlcGxhY2UocmVxdW90ZVJlLCBcIlxcXFwkJlwiKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0UmUobmFtZXMpIHtcbiAgcmV0dXJuIG5ldyBSZWdFeHAoXCJeKD86XCIgKyBuYW1lcy5tYXAocmVxdW90ZSkuam9pbihcInxcIikgKyBcIilcIiwgXCJpXCIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRMb29rdXAobmFtZXMpIHtcbiAgcmV0dXJuIG5ldyBNYXAobmFtZXMubWFwKChuYW1lLCBpKSA9PiBbbmFtZS50b0xvd2VyQ2FzZSgpLCBpXSkpO1xufVxuXG5mdW5jdGlvbiBwYXJzZVdlZWtkYXlOdW1iZXJTdW5kYXkoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDEpKTtcbiAgcmV0dXJuIG4gPyAoZC53ID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VXZWVrZGF5TnVtYmVyTW9uZGF5KGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAxKSk7XG4gIHJldHVybiBuID8gKGQudSA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlV2Vla051bWJlclN1bmRheShkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMikpO1xuICByZXR1cm4gbiA/IChkLlUgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVdlZWtOdW1iZXJJU08oZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5WID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VXZWVrTnVtYmVyTW9uZGF5KGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQuVyA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlRnVsbFllYXIoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDQpKTtcbiAgcmV0dXJuIG4gPyAoZC55ID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VZZWFyKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQueSA9ICtuWzBdICsgKCtuWzBdID4gNjggPyAxOTAwIDogMjAwMCksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2Vab25lKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IC9eKFopfChbKy1dXFxkXFxkKSg/Ojo/KFxcZFxcZCkpPy8uZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDYpKTtcbiAgcmV0dXJuIG4gPyAoZC5aID0gblsxXSA/IDAgOiAtKG5bMl0gKyAoblszXSB8fCBcIjAwXCIpKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVF1YXJ0ZXIoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDEpKTtcbiAgcmV0dXJuIG4gPyAoZC5xID0gblswXSAqIDMgLSAzLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlTW9udGhOdW1iZXIoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5tID0gblswXSAtIDEsIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VEYXlPZk1vbnRoKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQuZCA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlRGF5T2ZZZWFyKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAzKSk7XG4gIHJldHVybiBuID8gKGQubSA9IDAsIGQuZCA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlSG91cjI0KGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQuSCA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlTWludXRlcyhkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMikpO1xuICByZXR1cm4gbiA/IChkLk0gPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVNlY29uZHMoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5TID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VNaWxsaXNlY29uZHMoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDMpKTtcbiAgcmV0dXJuIG4gPyAoZC5MID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VNaWNyb3NlY29uZHMoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDYpKTtcbiAgcmV0dXJuIG4gPyAoZC5MID0gTWF0aC5mbG9vcihuWzBdIC8gMTAwMCksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VMaXRlcmFsUGVyY2VudChkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBwZXJjZW50UmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDEpKTtcbiAgcmV0dXJuIG4gPyBpICsgblswXS5sZW5ndGggOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VVbml4VGltZXN0YW1wKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgcmV0dXJuIG4gPyAoZC5RID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VVbml4VGltZXN0YW1wU2Vjb25kcyhkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gIHJldHVybiBuID8gKGQucyA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERheU9mTW9udGgoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0RGF0ZSgpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0SG91cjI0KGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldEhvdXJzKCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRIb3VyMTIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0SG91cnMoKSAlIDEyIHx8IDEyLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF5T2ZZZWFyKGQsIHApIHtcbiAgcmV0dXJuIHBhZCgxICsgdGltZURheS5jb3VudCh0aW1lWWVhcihkKSwgZCksIHAsIDMpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRNaWxsaXNlY29uZHMoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0TWlsbGlzZWNvbmRzKCksIHAsIDMpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRNaWNyb3NlY29uZHMoZCwgcCkge1xuICByZXR1cm4gZm9ybWF0TWlsbGlzZWNvbmRzKGQsIHApICsgXCIwMDBcIjtcbn1cblxuZnVuY3Rpb24gZm9ybWF0TW9udGhOdW1iZXIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0TW9udGgoKSArIDEsIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRNaW51dGVzKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldE1pbnV0ZXMoKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFNlY29uZHMoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0U2Vjb25kcygpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2Vla2RheU51bWJlck1vbmRheShkKSB7XG4gIHZhciBkYXkgPSBkLmdldERheSgpO1xuICByZXR1cm4gZGF5ID09PSAwID8gNyA6IGRheTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2Vla051bWJlclN1bmRheShkLCBwKSB7XG4gIHJldHVybiBwYWQodGltZVN1bmRheS5jb3VudCh0aW1lWWVhcihkKSAtIDEsIGQpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZElTTyhkKSB7XG4gIHZhciBkYXkgPSBkLmdldERheSgpO1xuICByZXR1cm4gKGRheSA+PSA0IHx8IGRheSA9PT0gMCkgPyB0aW1lVGh1cnNkYXkoZCkgOiB0aW1lVGh1cnNkYXkuY2VpbChkKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2Vla051bWJlcklTTyhkLCBwKSB7XG4gIGQgPSBkSVNPKGQpO1xuICByZXR1cm4gcGFkKHRpbWVUaHVyc2RheS5jb3VudCh0aW1lWWVhcihkKSwgZCkgKyAodGltZVllYXIoZCkuZ2V0RGF5KCkgPT09IDQpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2Vla2RheU51bWJlclN1bmRheShkKSB7XG4gIHJldHVybiBkLmdldERheSgpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRXZWVrTnVtYmVyTW9uZGF5KGQsIHApIHtcbiAgcmV0dXJuIHBhZCh0aW1lTW9uZGF5LmNvdW50KHRpbWVZZWFyKGQpIC0gMSwgZCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRZZWFyKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldEZ1bGxZZWFyKCkgJSAxMDAsIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRZZWFySVNPKGQsIHApIHtcbiAgZCA9IGRJU08oZCk7XG4gIHJldHVybiBwYWQoZC5nZXRGdWxsWWVhcigpICUgMTAwLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RnVsbFllYXIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0RnVsbFllYXIoKSAlIDEwMDAwLCBwLCA0KTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RnVsbFllYXJJU08oZCwgcCkge1xuICB2YXIgZGF5ID0gZC5nZXREYXkoKTtcbiAgZCA9IChkYXkgPj0gNCB8fCBkYXkgPT09IDApID8gdGltZVRodXJzZGF5KGQpIDogdGltZVRodXJzZGF5LmNlaWwoZCk7XG4gIHJldHVybiBwYWQoZC5nZXRGdWxsWWVhcigpICUgMTAwMDAsIHAsIDQpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRab25lKGQpIHtcbiAgdmFyIHogPSBkLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gIHJldHVybiAoeiA+IDAgPyBcIi1cIiA6ICh6ICo9IC0xLCBcIitcIikpXG4gICAgICArIHBhZCh6IC8gNjAgfCAwLCBcIjBcIiwgMilcbiAgICAgICsgcGFkKHogJSA2MCwgXCIwXCIsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENEYXlPZk1vbnRoKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ0RhdGUoKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ0hvdXIyNChkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENIb3VycygpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDSG91cjEyKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ0hvdXJzKCkgJSAxMiB8fCAxMiwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ0RheU9mWWVhcihkLCBwKSB7XG4gIHJldHVybiBwYWQoMSArIHV0Y0RheS5jb3VudCh1dGNZZWFyKGQpLCBkKSwgcCwgMyk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ01pbGxpc2Vjb25kcyhkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENNaWxsaXNlY29uZHMoKSwgcCwgMyk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ01pY3Jvc2Vjb25kcyhkLCBwKSB7XG4gIHJldHVybiBmb3JtYXRVVENNaWxsaXNlY29uZHMoZCwgcCkgKyBcIjAwMFwiO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENNb250aE51bWJlcihkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENNb250aCgpICsgMSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ01pbnV0ZXMoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDTWludXRlcygpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDU2Vjb25kcyhkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENTZWNvbmRzKCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENXZWVrZGF5TnVtYmVyTW9uZGF5KGQpIHtcbiAgdmFyIGRvdyA9IGQuZ2V0VVRDRGF5KCk7XG4gIHJldHVybiBkb3cgPT09IDAgPyA3IDogZG93O1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENXZWVrTnVtYmVyU3VuZGF5KGQsIHApIHtcbiAgcmV0dXJuIHBhZCh1dGNTdW5kYXkuY291bnQodXRjWWVhcihkKSAtIDEsIGQpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gVVRDZElTTyhkKSB7XG4gIHZhciBkYXkgPSBkLmdldFVUQ0RheSgpO1xuICByZXR1cm4gKGRheSA+PSA0IHx8IGRheSA9PT0gMCkgPyB1dGNUaHVyc2RheShkKSA6IHV0Y1RodXJzZGF5LmNlaWwoZCk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1dlZWtOdW1iZXJJU08oZCwgcCkge1xuICBkID0gVVRDZElTTyhkKTtcbiAgcmV0dXJuIHBhZCh1dGNUaHVyc2RheS5jb3VudCh1dGNZZWFyKGQpLCBkKSArICh1dGNZZWFyKGQpLmdldFVUQ0RheSgpID09PSA0KSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1dlZWtkYXlOdW1iZXJTdW5kYXkoZCkge1xuICByZXR1cm4gZC5nZXRVVENEYXkoKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDV2Vla051bWJlck1vbmRheShkLCBwKSB7XG4gIHJldHVybiBwYWQodXRjTW9uZGF5LmNvdW50KHV0Y1llYXIoZCkgLSAxLCBkKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1llYXIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDRnVsbFllYXIoKSAlIDEwMCwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1llYXJJU08oZCwgcCkge1xuICBkID0gVVRDZElTTyhkKTtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ0Z1bGxZZWFyKCkgJSAxMDAsIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENGdWxsWWVhcihkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENGdWxsWWVhcigpICUgMTAwMDAsIHAsIDQpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENGdWxsWWVhcklTTyhkLCBwKSB7XG4gIHZhciBkYXkgPSBkLmdldFVUQ0RheSgpO1xuICBkID0gKGRheSA+PSA0IHx8IGRheSA9PT0gMCkgPyB1dGNUaHVyc2RheShkKSA6IHV0Y1RodXJzZGF5LmNlaWwoZCk7XG4gIHJldHVybiBwYWQoZC5nZXRVVENGdWxsWWVhcigpICUgMTAwMDAsIHAsIDQpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENab25lKCkge1xuICByZXR1cm4gXCIrMDAwMFwiO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRMaXRlcmFsUGVyY2VudCgpIHtcbiAgcmV0dXJuIFwiJVwiO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVbml4VGltZXN0YW1wKGQpIHtcbiAgcmV0dXJuICtkO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVbml4VGltZXN0YW1wU2Vjb25kcyhkKSB7XG4gIHJldHVybiBNYXRoLmZsb29yKCtkIC8gMTAwMCk7XG59XG4iLCJpbXBvcnQgZm9ybWF0TG9jYWxlIGZyb20gXCIuL2xvY2FsZS5qc1wiO1xuXG52YXIgbG9jYWxlO1xuZXhwb3J0IHZhciB0aW1lRm9ybWF0O1xuZXhwb3J0IHZhciB0aW1lUGFyc2U7XG5leHBvcnQgdmFyIHV0Y0Zvcm1hdDtcbmV4cG9ydCB2YXIgdXRjUGFyc2U7XG5cbmRlZmF1bHRMb2NhbGUoe1xuICBkYXRlVGltZTogXCIleCwgJVhcIixcbiAgZGF0ZTogXCIlLW0vJS1kLyVZXCIsXG4gIHRpbWU6IFwiJS1JOiVNOiVTICVwXCIsXG4gIHBlcmlvZHM6IFtcIkFNXCIsIFwiUE1cIl0sXG4gIGRheXM6IFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdLFxuICBzaG9ydERheXM6IFtcIlN1blwiLCBcIk1vblwiLCBcIlR1ZVwiLCBcIldlZFwiLCBcIlRodVwiLCBcIkZyaVwiLCBcIlNhdFwiXSxcbiAgbW9udGhzOiBbXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIiwgXCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiXSxcbiAgc2hvcnRNb250aHM6IFtcIkphblwiLCBcIkZlYlwiLCBcIk1hclwiLCBcIkFwclwiLCBcIk1heVwiLCBcIkp1blwiLCBcIkp1bFwiLCBcIkF1Z1wiLCBcIlNlcFwiLCBcIk9jdFwiLCBcIk5vdlwiLCBcIkRlY1wiXVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlZmF1bHRMb2NhbGUoZGVmaW5pdGlvbikge1xuICBsb2NhbGUgPSBmb3JtYXRMb2NhbGUoZGVmaW5pdGlvbik7XG4gIHRpbWVGb3JtYXQgPSBsb2NhbGUuZm9ybWF0O1xuICB0aW1lUGFyc2UgPSBsb2NhbGUucGFyc2U7XG4gIHV0Y0Zvcm1hdCA9IGxvY2FsZS51dGNGb3JtYXQ7XG4gIHV0Y1BhcnNlID0gbG9jYWxlLnV0Y1BhcnNlO1xuICByZXR1cm4gbG9jYWxlO1xufVxuIiwiaW1wb3J0IHt1dGNGb3JtYXR9IGZyb20gXCIuL2RlZmF1bHRMb2NhbGUuanNcIjtcblxuZXhwb3J0IHZhciBpc29TcGVjaWZpZXIgPSBcIiVZLSVtLSVkVCVIOiVNOiVTLiVMWlwiO1xuXG5mdW5jdGlvbiBmb3JtYXRJc29OYXRpdmUoZGF0ZSkge1xuICByZXR1cm4gZGF0ZS50b0lTT1N0cmluZygpO1xufVxuXG52YXIgZm9ybWF0SXNvID0gRGF0ZS5wcm90b3R5cGUudG9JU09TdHJpbmdcbiAgICA/IGZvcm1hdElzb05hdGl2ZVxuICAgIDogdXRjRm9ybWF0KGlzb1NwZWNpZmllcik7XG5cbmV4cG9ydCBkZWZhdWx0IGZvcm1hdElzbztcbiIsImltcG9ydCB7aXNvU3BlY2lmaWVyfSBmcm9tIFwiLi9pc29Gb3JtYXQuanNcIjtcbmltcG9ydCB7dXRjUGFyc2V9IGZyb20gXCIuL2RlZmF1bHRMb2NhbGUuanNcIjtcblxuZnVuY3Rpb24gcGFyc2VJc29OYXRpdmUoc3RyaW5nKSB7XG4gIHZhciBkYXRlID0gbmV3IERhdGUoc3RyaW5nKTtcbiAgcmV0dXJuIGlzTmFOKGRhdGUpID8gbnVsbCA6IGRhdGU7XG59XG5cbnZhciBwYXJzZUlzbyA9ICtuZXcgRGF0ZShcIjIwMDAtMDEtMDFUMDA6MDA6MDAuMDAwWlwiKVxuICAgID8gcGFyc2VJc29OYXRpdmVcbiAgICA6IHV0Y1BhcnNlKGlzb1NwZWNpZmllcik7XG5cbmV4cG9ydCBkZWZhdWx0IHBhcnNlSXNvO1xuIiwiZXhwb3J0IHtkZWZhdWx0IGFzIHRpbWVGb3JtYXREZWZhdWx0TG9jYWxlLCB0aW1lRm9ybWF0LCB0aW1lUGFyc2UsIHV0Y0Zvcm1hdCwgdXRjUGFyc2V9IGZyb20gXCIuL2RlZmF1bHRMb2NhbGUuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyB0aW1lRm9ybWF0TG9jYWxlfSBmcm9tIFwiLi9sb2NhbGUuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBpc29Gb3JtYXR9IGZyb20gXCIuL2lzb0Zvcm1hdC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGlzb1BhcnNlfSBmcm9tIFwiLi9pc29QYXJzZS5qc1wiO1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc3BlY2lmaWVyKSB7XG4gIHZhciBuID0gc3BlY2lmaWVyLmxlbmd0aCAvIDYgfCAwLCBjb2xvcnMgPSBuZXcgQXJyYXkobiksIGkgPSAwO1xuICB3aGlsZSAoaSA8IG4pIGNvbG9yc1tpXSA9IFwiI1wiICsgc3BlY2lmaWVyLnNsaWNlKGkgKiA2LCArK2kgKiA2KTtcbiAgcmV0dXJuIGNvbG9ycztcbn1cbiIsImltcG9ydCBjb2xvcnMgZnJvbSBcIi4uL2NvbG9ycy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjb2xvcnMoXCIxZjc3YjRmZjdmMGUyY2EwMmNkNjI3Mjg5NDY3YmQ4YzU2NGJlMzc3YzI3ZjdmN2ZiY2JkMjIxN2JlY2ZcIik7XG4iLCJpbXBvcnQgY29sb3JzIGZyb20gXCIuLi9jb2xvcnMuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY29sb3JzKFwiN2ZjOTdmYmVhZWQ0ZmRjMDg2ZmZmZjk5Mzg2Y2IwZjAwMjdmYmY1YjE3NjY2NjY2XCIpO1xuIiwiaW1wb3J0IGNvbG9ycyBmcm9tIFwiLi4vY29sb3JzLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNvbG9ycyhcIjFiOWU3N2Q5NWYwMjc1NzBiM2U3Mjk4YTY2YTYxZWU2YWIwMmE2NzYxZDY2NjY2NlwiKTtcbiIsImltcG9ydCBjb2xvcnMgZnJvbSBcIi4uL2NvbG9ycy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjb2xvcnMoXCI0MjY5ZDBlZmIxMThmZjcyNWM2Y2M1YjAzY2E5NTFmZjhhYjdhNDYzZjI5N2JiZjU5YzZiNGU5NDk4YTBcIik7XG4iLCJpbXBvcnQgY29sb3JzIGZyb20gXCIuLi9jb2xvcnMuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY29sb3JzKFwiYTZjZWUzMWY3OGI0YjJkZjhhMzNhMDJjZmI5YTk5ZTMxYTFjZmRiZjZmZmY3ZjAwY2FiMmQ2NmEzZDlhZmZmZjk5YjE1OTI4XCIpO1xuIiwiaW1wb3J0IGNvbG9ycyBmcm9tIFwiLi4vY29sb3JzLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNvbG9ycyhcImZiYjRhZWIzY2RlM2NjZWJjNWRlY2JlNGZlZDlhNmZmZmZjY2U1ZDhiZGZkZGFlY2YyZjJmMlwiKTtcbiIsImltcG9ydCBjb2xvcnMgZnJvbSBcIi4uL2NvbG9ycy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjb2xvcnMoXCJiM2UyY2RmZGNkYWNjYmQ1ZThmNGNhZTRlNmY1YzlmZmYyYWVmMWUyY2NjY2NjY2NcIik7XG4iLCJpbXBvcnQgY29sb3JzIGZyb20gXCIuLi9jb2xvcnMuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY29sb3JzKFwiZTQxYTFjMzc3ZWI4NGRhZjRhOTg0ZWEzZmY3ZjAwZmZmZjMzYTY1NjI4Zjc4MWJmOTk5OTk5XCIpO1xuIiwiaW1wb3J0IGNvbG9ycyBmcm9tIFwiLi4vY29sb3JzLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNvbG9ycyhcIjY2YzJhNWZjOGQ2MjhkYTBjYmU3OGFjM2E2ZDg1NGZmZDkyZmU1YzQ5NGIzYjNiM1wiKTtcbiIsImltcG9ydCBjb2xvcnMgZnJvbSBcIi4uL2NvbG9ycy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjb2xvcnMoXCI4ZGQzYzdmZmZmYjNiZWJhZGFmYjgwNzI4MGIxZDNmZGI0NjJiM2RlNjlmY2NkZTVkOWQ5ZDliYzgwYmRjY2ViYzVmZmVkNmZcIik7XG4iLCJpbXBvcnQgY29sb3JzIGZyb20gXCIuLi9jb2xvcnMuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY29sb3JzKFwiNGU3OWE3ZjI4ZTJjZTE1NzU5NzZiN2IyNTlhMTRmZWRjOTQ5YWY3YWExZmY5ZGE3OWM3NTVmYmFiMGFiXCIpO1xuIiwiaW1wb3J0IHtpbnRlcnBvbGF0ZVJnYkJhc2lzfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcblxuZXhwb3J0IGRlZmF1bHQgc2NoZW1lID0+IGludGVycG9sYXRlUmdiQmFzaXMoc2NoZW1lW3NjaGVtZS5sZW5ndGggLSAxXSk7XG4iLCJpbXBvcnQgY29sb3JzIGZyb20gXCIuLi9jb2xvcnMuanNcIjtcbmltcG9ydCByYW1wIGZyb20gXCIuLi9yYW1wLmpzXCI7XG5cbmV4cG9ydCB2YXIgc2NoZW1lID0gbmV3IEFycmF5KDMpLmNvbmNhdChcbiAgXCJkOGIzNjVmNWY1ZjU1YWI0YWNcIixcbiAgXCJhNjYxMWFkZmMyN2Q4MGNkYzEwMTg1NzFcIixcbiAgXCJhNjYxMWFkZmMyN2RmNWY1ZjU4MGNkYzEwMTg1NzFcIixcbiAgXCI4YzUxMGFkOGIzNjVmNmU4YzNjN2VhZTU1YWI0YWMwMTY2NWVcIixcbiAgXCI4YzUxMGFkOGIzNjVmNmU4YzNmNWY1ZjVjN2VhZTU1YWI0YWMwMTY2NWVcIixcbiAgXCI4YzUxMGFiZjgxMmRkZmMyN2RmNmU4YzNjN2VhZTU4MGNkYzEzNTk3OGYwMTY2NWVcIixcbiAgXCI4YzUxMGFiZjgxMmRkZmMyN2RmNmU4YzNmNWY1ZjVjN2VhZTU4MGNkYzEzNTk3OGYwMTY2NWVcIixcbiAgXCI1NDMwMDU4YzUxMGFiZjgxMmRkZmMyN2RmNmU4YzNjN2VhZTU4MGNkYzEzNTk3OGYwMTY2NWUwMDNjMzBcIixcbiAgXCI1NDMwMDU4YzUxMGFiZjgxMmRkZmMyN2RmNmU4YzNmNWY1ZjVjN2VhZTU4MGNkYzEzNTk3OGYwMTY2NWUwMDNjMzBcIlxuKS5tYXAoY29sb3JzKTtcblxuZXhwb3J0IGRlZmF1bHQgcmFtcChzY2hlbWUpO1xuIiwiaW1wb3J0IGNvbG9ycyBmcm9tIFwiLi4vY29sb3JzLmpzXCI7XG5pbXBvcnQgcmFtcCBmcm9tIFwiLi4vcmFtcC5qc1wiO1xuXG5leHBvcnQgdmFyIHNjaGVtZSA9IG5ldyBBcnJheSgzKS5jb25jYXQoXG4gIFwiYWY4ZGMzZjdmN2Y3N2ZiZjdiXCIsXG4gIFwiN2IzMjk0YzJhNWNmYTZkYmEwMDA4ODM3XCIsXG4gIFwiN2IzMjk0YzJhNWNmZjdmN2Y3YTZkYmEwMDA4ODM3XCIsXG4gIFwiNzYyYTgzYWY4ZGMzZTdkNGU4ZDlmMGQzN2ZiZjdiMWI3ODM3XCIsXG4gIFwiNzYyYTgzYWY4ZGMzZTdkNGU4ZjdmN2Y3ZDlmMGQzN2ZiZjdiMWI3ODM3XCIsXG4gIFwiNzYyYTgzOTk3MGFiYzJhNWNmZTdkNGU4ZDlmMGQzYTZkYmEwNWFhZTYxMWI3ODM3XCIsXG4gIFwiNzYyYTgzOTk3MGFiYzJhNWNmZTdkNGU4ZjdmN2Y3ZDlmMGQzYTZkYmEwNWFhZTYxMWI3ODM3XCIsXG4gIFwiNDAwMDRiNzYyYTgzOTk3MGFiYzJhNWNmZTdkNGU4ZDlmMGQzYTZkYmEwNWFhZTYxMWI3ODM3MDA0NDFiXCIsXG4gIFwiNDAwMDRiNzYyYTgzOTk3MGFiYzJhNWNmZTdkNGU4ZjdmN2Y3ZDlmMGQzYTZkYmEwNWFhZTYxMWI3ODM3MDA0NDFiXCJcbikubWFwKGNvbG9ycyk7XG5cbmV4cG9ydCBkZWZhdWx0IHJhbXAoc2NoZW1lKTtcbiIsImltcG9ydCBjb2xvcnMgZnJvbSBcIi4uL2NvbG9ycy5qc1wiO1xuaW1wb3J0IHJhbXAgZnJvbSBcIi4uL3JhbXAuanNcIjtcblxuZXhwb3J0IHZhciBzY2hlbWUgPSBuZXcgQXJyYXkoMykuY29uY2F0KFxuICBcImU5YTNjOWY3ZjdmN2ExZDc2YVwiLFxuICBcImQwMWM4YmYxYjZkYWI4ZTE4NjRkYWMyNlwiLFxuICBcImQwMWM4YmYxYjZkYWY3ZjdmN2I4ZTE4NjRkYWMyNlwiLFxuICBcImM1MWI3ZGU5YTNjOWZkZTBlZmU2ZjVkMGExZDc2YTRkOTIyMVwiLFxuICBcImM1MWI3ZGU5YTNjOWZkZTBlZmY3ZjdmN2U2ZjVkMGExZDc2YTRkOTIyMVwiLFxuICBcImM1MWI3ZGRlNzdhZWYxYjZkYWZkZTBlZmU2ZjVkMGI4ZTE4NjdmYmM0MTRkOTIyMVwiLFxuICBcImM1MWI3ZGRlNzdhZWYxYjZkYWZkZTBlZmY3ZjdmN2U2ZjVkMGI4ZTE4NjdmYmM0MTRkOTIyMVwiLFxuICBcIjhlMDE1MmM1MWI3ZGRlNzdhZWYxYjZkYWZkZTBlZmU2ZjVkMGI4ZTE4NjdmYmM0MTRkOTIyMTI3NjQxOVwiLFxuICBcIjhlMDE1MmM1MWI3ZGRlNzdhZWYxYjZkYWZkZTBlZmY3ZjdmN2U2ZjVkMGI4ZTE4NjdmYmM0MTRkOTIyMTI3NjQxOVwiXG4pLm1hcChjb2xvcnMpO1xuXG5leHBvcnQgZGVmYXVsdCByYW1wKHNjaGVtZSk7XG4iLCJpbXBvcnQgY29sb3JzIGZyb20gXCIuLi9jb2xvcnMuanNcIjtcbmltcG9ydCByYW1wIGZyb20gXCIuLi9yYW1wLmpzXCI7XG5cbmV4cG9ydCB2YXIgc2NoZW1lID0gbmV3IEFycmF5KDMpLmNvbmNhdChcbiAgXCI5OThlYzNmN2Y3ZjdmMWEzNDBcIixcbiAgXCI1ZTNjOTliMmFiZDJmZGI4NjNlNjYxMDFcIixcbiAgXCI1ZTNjOTliMmFiZDJmN2Y3ZjdmZGI4NjNlNjYxMDFcIixcbiAgXCI1NDI3ODg5OThlYzNkOGRhZWJmZWUwYjZmMWEzNDBiMzU4MDZcIixcbiAgXCI1NDI3ODg5OThlYzNkOGRhZWJmN2Y3ZjdmZWUwYjZmMWEzNDBiMzU4MDZcIixcbiAgXCI1NDI3ODg4MDczYWNiMmFiZDJkOGRhZWJmZWUwYjZmZGI4NjNlMDgyMTRiMzU4MDZcIixcbiAgXCI1NDI3ODg4MDczYWNiMmFiZDJkOGRhZWJmN2Y3ZjdmZWUwYjZmZGI4NjNlMDgyMTRiMzU4MDZcIixcbiAgXCIyZDAwNGI1NDI3ODg4MDczYWNiMmFiZDJkOGRhZWJmZWUwYjZmZGI4NjNlMDgyMTRiMzU4MDY3ZjNiMDhcIixcbiAgXCIyZDAwNGI1NDI3ODg4MDczYWNiMmFiZDJkOGRhZWJmN2Y3ZjdmZWUwYjZmZGI4NjNlMDgyMTRiMzU4MDY3ZjNiMDhcIlxuKS5tYXAoY29sb3JzKTtcblxuZXhwb3J0IGRlZmF1bHQgcmFtcChzY2hlbWUpO1xuIiwiaW1wb3J0IGNvbG9ycyBmcm9tIFwiLi4vY29sb3JzLmpzXCI7XG5pbXBvcnQgcmFtcCBmcm9tIFwiLi4vcmFtcC5qc1wiO1xuXG5leHBvcnQgdmFyIHNjaGVtZSA9IG5ldyBBcnJheSgzKS5jb25jYXQoXG4gIFwiZWY4YTYyZjdmN2Y3NjdhOWNmXCIsXG4gIFwiY2EwMDIwZjRhNTgyOTJjNWRlMDU3MWIwXCIsXG4gIFwiY2EwMDIwZjRhNTgyZjdmN2Y3OTJjNWRlMDU3MWIwXCIsXG4gIFwiYjIxODJiZWY4YTYyZmRkYmM3ZDFlNWYwNjdhOWNmMjE2NmFjXCIsXG4gIFwiYjIxODJiZWY4YTYyZmRkYmM3ZjdmN2Y3ZDFlNWYwNjdhOWNmMjE2NmFjXCIsXG4gIFwiYjIxODJiZDY2MDRkZjRhNTgyZmRkYmM3ZDFlNWYwOTJjNWRlNDM5M2MzMjE2NmFjXCIsXG4gIFwiYjIxODJiZDY2MDRkZjRhNTgyZmRkYmM3ZjdmN2Y3ZDFlNWYwOTJjNWRlNDM5M2MzMjE2NmFjXCIsXG4gIFwiNjcwMDFmYjIxODJiZDY2MDRkZjRhNTgyZmRkYmM3ZDFlNWYwOTJjNWRlNDM5M2MzMjE2NmFjMDUzMDYxXCIsXG4gIFwiNjcwMDFmYjIxODJiZDY2MDRkZjRhNTgyZmRkYmM3ZjdmN2Y3ZDFlNWYwOTJjNWRlNDM5M2MzMjE2NmFjMDUzMDYxXCJcbikubWFwKGNvbG9ycyk7XG5cbmV4cG9ydCBkZWZhdWx0IHJhbXAoc2NoZW1lKTtcbiIsImltcG9ydCBjb2xvcnMgZnJvbSBcIi4uL2NvbG9ycy5qc1wiO1xuaW1wb3J0IHJhbXAgZnJvbSBcIi4uL3JhbXAuanNcIjtcblxuZXhwb3J0IHZhciBzY2hlbWUgPSBuZXcgQXJyYXkoMykuY29uY2F0KFxuICBcImVmOGE2MmZmZmZmZjk5OTk5OVwiLFxuICBcImNhMDAyMGY0YTU4MmJhYmFiYTQwNDA0MFwiLFxuICBcImNhMDAyMGY0YTU4MmZmZmZmZmJhYmFiYTQwNDA0MFwiLFxuICBcImIyMTgyYmVmOGE2MmZkZGJjN2UwZTBlMDk5OTk5OTRkNGQ0ZFwiLFxuICBcImIyMTgyYmVmOGE2MmZkZGJjN2ZmZmZmZmUwZTBlMDk5OTk5OTRkNGQ0ZFwiLFxuICBcImIyMTgyYmQ2NjA0ZGY0YTU4MmZkZGJjN2UwZTBlMGJhYmFiYTg3ODc4NzRkNGQ0ZFwiLFxuICBcImIyMTgyYmQ2NjA0ZGY0YTU4MmZkZGJjN2ZmZmZmZmUwZTBlMGJhYmFiYTg3ODc4NzRkNGQ0ZFwiLFxuICBcIjY3MDAxZmIyMTgyYmQ2NjA0ZGY0YTU4MmZkZGJjN2UwZTBlMGJhYmFiYTg3ODc4NzRkNGQ0ZDFhMWExYVwiLFxuICBcIjY3MDAxZmIyMTgyYmQ2NjA0ZGY0YTU4MmZkZGJjN2ZmZmZmZmUwZTBlMGJhYmFiYTg3ODc4NzRkNGQ0ZDFhMWExYVwiXG4pLm1hcChjb2xvcnMpO1xuXG5leHBvcnQgZGVmYXVsdCByYW1wKHNjaGVtZSk7XG4iLCJpbXBvcnQgY29sb3JzIGZyb20gXCIuLi9jb2xvcnMuanNcIjtcbmltcG9ydCByYW1wIGZyb20gXCIuLi9yYW1wLmpzXCI7XG5cbmV4cG9ydCB2YXIgc2NoZW1lID0gbmV3IEFycmF5KDMpLmNvbmNhdChcbiAgXCJmYzhkNTlmZmZmYmY5MWJmZGJcIixcbiAgXCJkNzE5MWNmZGFlNjFhYmQ5ZTkyYzdiYjZcIixcbiAgXCJkNzE5MWNmZGFlNjFmZmZmYmZhYmQ5ZTkyYzdiYjZcIixcbiAgXCJkNzMwMjdmYzhkNTlmZWUwOTBlMGYzZjg5MWJmZGI0NTc1YjRcIixcbiAgXCJkNzMwMjdmYzhkNTlmZWUwOTBmZmZmYmZlMGYzZjg5MWJmZGI0NTc1YjRcIixcbiAgXCJkNzMwMjdmNDZkNDNmZGFlNjFmZWUwOTBlMGYzZjhhYmQ5ZTk3NGFkZDE0NTc1YjRcIixcbiAgXCJkNzMwMjdmNDZkNDNmZGFlNjFmZWUwOTBmZmZmYmZlMGYzZjhhYmQ5ZTk3NGFkZDE0NTc1YjRcIixcbiAgXCJhNTAwMjZkNzMwMjdmNDZkNDNmZGFlNjFmZWUwOTBlMGYzZjhhYmQ5ZTk3NGFkZDE0NTc1YjQzMTM2OTVcIixcbiAgXCJhNTAwMjZkNzMwMjdmNDZkNDNmZGFlNjFmZWUwOTBmZmZmYmZlMGYzZjhhYmQ5ZTk3NGFkZDE0NTc1YjQzMTM2OTVcIlxuKS5tYXAoY29sb3JzKTtcblxuZXhwb3J0IGRlZmF1bHQgcmFtcChzY2hlbWUpO1xuIiwiaW1wb3J0IGNvbG9ycyBmcm9tIFwiLi4vY29sb3JzLmpzXCI7XG5pbXBvcnQgcmFtcCBmcm9tIFwiLi4vcmFtcC5qc1wiO1xuXG5leHBvcnQgdmFyIHNjaGVtZSA9IG5ldyBBcnJheSgzKS5jb25jYXQoXG4gIFwiZmM4ZDU5ZmZmZmJmOTFjZjYwXCIsXG4gIFwiZDcxOTFjZmRhZTYxYTZkOTZhMWE5NjQxXCIsXG4gIFwiZDcxOTFjZmRhZTYxZmZmZmJmYTZkOTZhMWE5NjQxXCIsXG4gIFwiZDczMDI3ZmM4ZDU5ZmVlMDhiZDllZjhiOTFjZjYwMWE5ODUwXCIsXG4gIFwiZDczMDI3ZmM4ZDU5ZmVlMDhiZmZmZmJmZDllZjhiOTFjZjYwMWE5ODUwXCIsXG4gIFwiZDczMDI3ZjQ2ZDQzZmRhZTYxZmVlMDhiZDllZjhiYTZkOTZhNjZiZDYzMWE5ODUwXCIsXG4gIFwiZDczMDI3ZjQ2ZDQzZmRhZTYxZmVlMDhiZmZmZmJmZDllZjhiYTZkOTZhNjZiZDYzMWE5ODUwXCIsXG4gIFwiYTUwMDI2ZDczMDI3ZjQ2ZDQzZmRhZTYxZmVlMDhiZDllZjhiYTZkOTZhNjZiZDYzMWE5ODUwMDA2ODM3XCIsXG4gIFwiYTUwMDI2ZDczMDI3ZjQ2ZDQzZmRhZTYxZmVlMDhiZmZmZmJmZDllZjhiYTZkOTZhNjZiZDYzMWE5ODUwMDA2ODM3XCJcbikubWFwKGNvbG9ycyk7XG5cbmV4cG9ydCBkZWZhdWx0IHJhbXAoc2NoZW1lKTtcbiIsImltcG9ydCBjb2xvcnMgZnJvbSBcIi4uL2NvbG9ycy5qc1wiO1xuaW1wb3J0IHJhbXAgZnJvbSBcIi4uL3JhbXAuanNcIjtcblxuZXhwb3J0IHZhciBzY2hlbWUgPSBuZXcgQXJyYXkoMykuY29uY2F0KFxuICBcImZjOGQ1OWZmZmZiZjk5ZDU5NFwiLFxuICBcImQ3MTkxY2ZkYWU2MWFiZGRhNDJiODNiYVwiLFxuICBcImQ3MTkxY2ZkYWU2MWZmZmZiZmFiZGRhNDJiODNiYVwiLFxuICBcImQ1M2U0ZmZjOGQ1OWZlZTA4YmU2ZjU5ODk5ZDU5NDMyODhiZFwiLFxuICBcImQ1M2U0ZmZjOGQ1OWZlZTA4YmZmZmZiZmU2ZjU5ODk5ZDU5NDMyODhiZFwiLFxuICBcImQ1M2U0ZmY0NmQ0M2ZkYWU2MWZlZTA4YmU2ZjU5OGFiZGRhNDY2YzJhNTMyODhiZFwiLFxuICBcImQ1M2U0ZmY0NmQ0M2ZkYWU2MWZlZTA4YmZmZmZiZmU2ZjU5OGFiZGRhNDY2YzJhNTMyODhiZFwiLFxuICBcIjllMDE0MmQ1M2U0ZmY0NmQ0M2ZkYWU2MWZlZTA4YmU2ZjU5OGFiZGRhNDY2YzJhNTMyODhiZDVlNGZhMlwiLFxuICBcIjllMDE0MmQ1M2U0ZmY0NmQ0M2ZkYWU2MWZlZTA4YmZmZmZiZmU2ZjU5OGFiZGRhNDY2YzJhNTMyODhiZDVlNGZhMlwiXG4pLm1hcChjb2xvcnMpO1xuXG5leHBvcnQgZGVmYXVsdCByYW1wKHNjaGVtZSk7XG4iLCJpbXBvcnQgY29sb3JzIGZyb20gXCIuLi9jb2xvcnMuanNcIjtcbmltcG9ydCByYW1wIGZyb20gXCIuLi9yYW1wLmpzXCI7XG5cbmV4cG9ydCB2YXIgc2NoZW1lID0gbmV3IEFycmF5KDMpLmNvbmNhdChcbiAgXCJlNWY1Zjk5OWQ4YzkyY2EyNWZcIixcbiAgXCJlZGY4ZmJiMmUyZTI2NmMyYTQyMzhiNDVcIixcbiAgXCJlZGY4ZmJiMmUyZTI2NmMyYTQyY2EyNWYwMDZkMmNcIixcbiAgXCJlZGY4ZmJjY2VjZTY5OWQ4Yzk2NmMyYTQyY2EyNWYwMDZkMmNcIixcbiAgXCJlZGY4ZmJjY2VjZTY5OWQ4Yzk2NmMyYTQ0MWFlNzYyMzhiNDUwMDU4MjRcIixcbiAgXCJmN2ZjZmRlNWY1ZjljY2VjZTY5OWQ4Yzk2NmMyYTQ0MWFlNzYyMzhiNDUwMDU4MjRcIixcbiAgXCJmN2ZjZmRlNWY1ZjljY2VjZTY5OWQ4Yzk2NmMyYTQ0MWFlNzYyMzhiNDUwMDZkMmMwMDQ0MWJcIlxuKS5tYXAoY29sb3JzKTtcblxuZXhwb3J0IGRlZmF1bHQgcmFtcChzY2hlbWUpO1xuIiwiaW1wb3J0IGNvbG9ycyBmcm9tIFwiLi4vY29sb3JzLmpzXCI7XG5pbXBvcnQgcmFtcCBmcm9tIFwiLi4vcmFtcC5qc1wiO1xuXG5leHBvcnQgdmFyIHNjaGVtZSA9IG5ldyBBcnJheSgzKS5jb25jYXQoXG4gIFwiZTBlY2Y0OWViY2RhODg1NmE3XCIsXG4gIFwiZWRmOGZiYjNjZGUzOGM5NmM2ODg0MTlkXCIsXG4gIFwiZWRmOGZiYjNjZGUzOGM5NmM2ODg1NmE3ODEwZjdjXCIsXG4gIFwiZWRmOGZiYmZkM2U2OWViY2RhOGM5NmM2ODg1NmE3ODEwZjdjXCIsXG4gIFwiZWRmOGZiYmZkM2U2OWViY2RhOGM5NmM2OGM2YmIxODg0MTlkNmUwMTZiXCIsXG4gIFwiZjdmY2ZkZTBlY2Y0YmZkM2U2OWViY2RhOGM5NmM2OGM2YmIxODg0MTlkNmUwMTZiXCIsXG4gIFwiZjdmY2ZkZTBlY2Y0YmZkM2U2OWViY2RhOGM5NmM2OGM2YmIxODg0MTlkODEwZjdjNGQwMDRiXCJcbikubWFwKGNvbG9ycyk7XG5cbmV4cG9ydCBkZWZhdWx0IHJhbXAoc2NoZW1lKTtcbiIsImltcG9ydCBjb2xvcnMgZnJvbSBcIi4uL2NvbG9ycy5qc1wiO1xuaW1wb3J0IHJhbXAgZnJvbSBcIi4uL3JhbXAuanNcIjtcblxuZXhwb3J0IHZhciBzY2hlbWUgPSBuZXcgQXJyYXkoMykuY29uY2F0KFxuICBcImUwZjNkYmE4ZGRiNTQzYTJjYVwiLFxuICBcImYwZjllOGJhZTRiYzdiY2NjNDJiOGNiZVwiLFxuICBcImYwZjllOGJhZTRiYzdiY2NjNDQzYTJjYTA4NjhhY1wiLFxuICBcImYwZjllOGNjZWJjNWE4ZGRiNTdiY2NjNDQzYTJjYTA4NjhhY1wiLFxuICBcImYwZjllOGNjZWJjNWE4ZGRiNTdiY2NjNDRlYjNkMzJiOGNiZTA4NTg5ZVwiLFxuICBcImY3ZmNmMGUwZjNkYmNjZWJjNWE4ZGRiNTdiY2NjNDRlYjNkMzJiOGNiZTA4NTg5ZVwiLFxuICBcImY3ZmNmMGUwZjNkYmNjZWJjNWE4ZGRiNTdiY2NjNDRlYjNkMzJiOGNiZTA4NjhhYzA4NDA4MVwiXG4pLm1hcChjb2xvcnMpO1xuXG5leHBvcnQgZGVmYXVsdCByYW1wKHNjaGVtZSk7XG4iLCJpbXBvcnQgY29sb3JzIGZyb20gXCIuLi9jb2xvcnMuanNcIjtcbmltcG9ydCByYW1wIGZyb20gXCIuLi9yYW1wLmpzXCI7XG5cbmV4cG9ydCB2YXIgc2NoZW1lID0gbmV3IEFycmF5KDMpLmNvbmNhdChcbiAgXCJmZWU4YzhmZGJiODRlMzRhMzNcIixcbiAgXCJmZWYwZDlmZGNjOGFmYzhkNTlkNzMwMWZcIixcbiAgXCJmZWYwZDlmZGNjOGFmYzhkNTllMzRhMzNiMzAwMDBcIixcbiAgXCJmZWYwZDlmZGQ0OWVmZGJiODRmYzhkNTllMzRhMzNiMzAwMDBcIixcbiAgXCJmZWYwZDlmZGQ0OWVmZGJiODRmYzhkNTllZjY1NDhkNzMwMWY5OTAwMDBcIixcbiAgXCJmZmY3ZWNmZWU4YzhmZGQ0OWVmZGJiODRmYzhkNTllZjY1NDhkNzMwMWY5OTAwMDBcIixcbiAgXCJmZmY3ZWNmZWU4YzhmZGQ0OWVmZGJiODRmYzhkNTllZjY1NDhkNzMwMWZiMzAwMDA3ZjAwMDBcIlxuKS5tYXAoY29sb3JzKTtcblxuZXhwb3J0IGRlZmF1bHQgcmFtcChzY2hlbWUpO1xuIiwiaW1wb3J0IGNvbG9ycyBmcm9tIFwiLi4vY29sb3JzLmpzXCI7XG5pbXBvcnQgcmFtcCBmcm9tIFwiLi4vcmFtcC5qc1wiO1xuXG5leHBvcnQgdmFyIHNjaGVtZSA9IG5ldyBBcnJheSgzKS5jb25jYXQoXG4gIFwiZWNlMmYwYTZiZGRiMWM5MDk5XCIsXG4gIFwiZjZlZmY3YmRjOWUxNjdhOWNmMDI4MThhXCIsXG4gIFwiZjZlZmY3YmRjOWUxNjdhOWNmMWM5MDk5MDE2YzU5XCIsXG4gIFwiZjZlZmY3ZDBkMWU2YTZiZGRiNjdhOWNmMWM5MDk5MDE2YzU5XCIsXG4gIFwiZjZlZmY3ZDBkMWU2YTZiZGRiNjdhOWNmMzY5MGMwMDI4MThhMDE2NDUwXCIsXG4gIFwiZmZmN2ZiZWNlMmYwZDBkMWU2YTZiZGRiNjdhOWNmMzY5MGMwMDI4MThhMDE2NDUwXCIsXG4gIFwiZmZmN2ZiZWNlMmYwZDBkMWU2YTZiZGRiNjdhOWNmMzY5MGMwMDI4MThhMDE2YzU5MDE0NjM2XCJcbikubWFwKGNvbG9ycyk7XG5cbmV4cG9ydCBkZWZhdWx0IHJhbXAoc2NoZW1lKTtcbiIsImltcG9ydCBjb2xvcnMgZnJvbSBcIi4uL2NvbG9ycy5qc1wiO1xuaW1wb3J0IHJhbXAgZnJvbSBcIi4uL3JhbXAuanNcIjtcblxuZXhwb3J0IHZhciBzY2hlbWUgPSBuZXcgQXJyYXkoMykuY29uY2F0KFxuICBcImVjZTdmMmE2YmRkYjJiOGNiZVwiLFxuICBcImYxZWVmNmJkYzllMTc0YTljZjA1NzBiMFwiLFxuICBcImYxZWVmNmJkYzllMTc0YTljZjJiOGNiZTA0NWE4ZFwiLFxuICBcImYxZWVmNmQwZDFlNmE2YmRkYjc0YTljZjJiOGNiZTA0NWE4ZFwiLFxuICBcImYxZWVmNmQwZDFlNmE2YmRkYjc0YTljZjM2OTBjMDA1NzBiMDAzNGU3YlwiLFxuICBcImZmZjdmYmVjZTdmMmQwZDFlNmE2YmRkYjc0YTljZjM2OTBjMDA1NzBiMDAzNGU3YlwiLFxuICBcImZmZjdmYmVjZTdmMmQwZDFlNmE2YmRkYjc0YTljZjM2OTBjMDA1NzBiMDA0NWE4ZDAyMzg1OFwiXG4pLm1hcChjb2xvcnMpO1xuXG5leHBvcnQgZGVmYXVsdCByYW1wKHNjaGVtZSk7XG4iLCJpbXBvcnQgY29sb3JzIGZyb20gXCIuLi9jb2xvcnMuanNcIjtcbmltcG9ydCByYW1wIGZyb20gXCIuLi9yYW1wLmpzXCI7XG5cbmV4cG9ydCB2YXIgc2NoZW1lID0gbmV3IEFycmF5KDMpLmNvbmNhdChcbiAgXCJlN2UxZWZjOTk0YzdkZDFjNzdcIixcbiAgXCJmMWVlZjZkN2I1ZDhkZjY1YjBjZTEyNTZcIixcbiAgXCJmMWVlZjZkN2I1ZDhkZjY1YjBkZDFjNzc5ODAwNDNcIixcbiAgXCJmMWVlZjZkNGI5ZGFjOTk0YzdkZjY1YjBkZDFjNzc5ODAwNDNcIixcbiAgXCJmMWVlZjZkNGI5ZGFjOTk0YzdkZjY1YjBlNzI5OGFjZTEyNTY5MTAwM2ZcIixcbiAgXCJmN2Y0ZjllN2UxZWZkNGI5ZGFjOTk0YzdkZjY1YjBlNzI5OGFjZTEyNTY5MTAwM2ZcIixcbiAgXCJmN2Y0ZjllN2UxZWZkNGI5ZGFjOTk0YzdkZjY1YjBlNzI5OGFjZTEyNTY5ODAwNDM2NzAwMWZcIlxuKS5tYXAoY29sb3JzKTtcblxuZXhwb3J0IGRlZmF1bHQgcmFtcChzY2hlbWUpO1xuIiwiaW1wb3J0IGNvbG9ycyBmcm9tIFwiLi4vY29sb3JzLmpzXCI7XG5pbXBvcnQgcmFtcCBmcm9tIFwiLi4vcmFtcC5qc1wiO1xuXG5leHBvcnQgdmFyIHNjaGVtZSA9IG5ldyBBcnJheSgzKS5jb25jYXQoXG4gIFwiZmRlMGRkZmE5ZmI1YzUxYjhhXCIsXG4gIFwiZmVlYmUyZmJiNGI5Zjc2OGExYWUwMTdlXCIsXG4gIFwiZmVlYmUyZmJiNGI5Zjc2OGExYzUxYjhhN2EwMTc3XCIsXG4gIFwiZmVlYmUyZmNjNWMwZmE5ZmI1Zjc2OGExYzUxYjhhN2EwMTc3XCIsXG4gIFwiZmVlYmUyZmNjNWMwZmE5ZmI1Zjc2OGExZGQzNDk3YWUwMTdlN2EwMTc3XCIsXG4gIFwiZmZmN2YzZmRlMGRkZmNjNWMwZmE5ZmI1Zjc2OGExZGQzNDk3YWUwMTdlN2EwMTc3XCIsXG4gIFwiZmZmN2YzZmRlMGRkZmNjNWMwZmE5ZmI1Zjc2OGExZGQzNDk3YWUwMTdlN2EwMTc3NDkwMDZhXCJcbikubWFwKGNvbG9ycyk7XG5cbmV4cG9ydCBkZWZhdWx0IHJhbXAoc2NoZW1lKTtcbiIsImltcG9ydCBjb2xvcnMgZnJvbSBcIi4uL2NvbG9ycy5qc1wiO1xuaW1wb3J0IHJhbXAgZnJvbSBcIi4uL3JhbXAuanNcIjtcblxuZXhwb3J0IHZhciBzY2hlbWUgPSBuZXcgQXJyYXkoMykuY29uY2F0KFxuICBcImVkZjhiMTdmY2RiYjJjN2ZiOFwiLFxuICBcImZmZmZjY2ExZGFiNDQxYjZjNDIyNWVhOFwiLFxuICBcImZmZmZjY2ExZGFiNDQxYjZjNDJjN2ZiODI1MzQ5NFwiLFxuICBcImZmZmZjY2M3ZTliNDdmY2RiYjQxYjZjNDJjN2ZiODI1MzQ5NFwiLFxuICBcImZmZmZjY2M3ZTliNDdmY2RiYjQxYjZjNDFkOTFjMDIyNWVhODBjMmM4NFwiLFxuICBcImZmZmZkOWVkZjhiMWM3ZTliNDdmY2RiYjQxYjZjNDFkOTFjMDIyNWVhODBjMmM4NFwiLFxuICBcImZmZmZkOWVkZjhiMWM3ZTliNDdmY2RiYjQxYjZjNDFkOTFjMDIyNWVhODI1MzQ5NDA4MWQ1OFwiXG4pLm1hcChjb2xvcnMpO1xuXG5leHBvcnQgZGVmYXVsdCByYW1wKHNjaGVtZSk7XG4iLCJpbXBvcnQgY29sb3JzIGZyb20gXCIuLi9jb2xvcnMuanNcIjtcbmltcG9ydCByYW1wIGZyb20gXCIuLi9yYW1wLmpzXCI7XG5cbmV4cG9ydCB2YXIgc2NoZW1lID0gbmV3IEFycmF5KDMpLmNvbmNhdChcbiAgXCJmN2ZjYjlhZGRkOGUzMWEzNTRcIixcbiAgXCJmZmZmY2NjMmU2OTk3OGM2NzkyMzg0NDNcIixcbiAgXCJmZmZmY2NjMmU2OTk3OGM2NzkzMWEzNTQwMDY4MzdcIixcbiAgXCJmZmZmY2NkOWYwYTNhZGRkOGU3OGM2NzkzMWEzNTQwMDY4MzdcIixcbiAgXCJmZmZmY2NkOWYwYTNhZGRkOGU3OGM2Nzk0MWFiNWQyMzg0NDMwMDVhMzJcIixcbiAgXCJmZmZmZTVmN2ZjYjlkOWYwYTNhZGRkOGU3OGM2Nzk0MWFiNWQyMzg0NDMwMDVhMzJcIixcbiAgXCJmZmZmZTVmN2ZjYjlkOWYwYTNhZGRkOGU3OGM2Nzk0MWFiNWQyMzg0NDMwMDY4MzcwMDQ1MjlcIlxuKS5tYXAoY29sb3JzKTtcblxuZXhwb3J0IGRlZmF1bHQgcmFtcChzY2hlbWUpO1xuIiwiaW1wb3J0IGNvbG9ycyBmcm9tIFwiLi4vY29sb3JzLmpzXCI7XG5pbXBvcnQgcmFtcCBmcm9tIFwiLi4vcmFtcC5qc1wiO1xuXG5leHBvcnQgdmFyIHNjaGVtZSA9IG5ldyBBcnJheSgzKS5jb25jYXQoXG4gIFwiZmZmN2JjZmVjNDRmZDk1ZjBlXCIsXG4gIFwiZmZmZmQ0ZmVkOThlZmU5OTI5Y2M0YzAyXCIsXG4gIFwiZmZmZmQ0ZmVkOThlZmU5OTI5ZDk1ZjBlOTkzNDA0XCIsXG4gIFwiZmZmZmQ0ZmVlMzkxZmVjNDRmZmU5OTI5ZDk1ZjBlOTkzNDA0XCIsXG4gIFwiZmZmZmQ0ZmVlMzkxZmVjNDRmZmU5OTI5ZWM3MDE0Y2M0YzAyOGMyZDA0XCIsXG4gIFwiZmZmZmU1ZmZmN2JjZmVlMzkxZmVjNDRmZmU5OTI5ZWM3MDE0Y2M0YzAyOGMyZDA0XCIsXG4gIFwiZmZmZmU1ZmZmN2JjZmVlMzkxZmVjNDRmZmU5OTI5ZWM3MDE0Y2M0YzAyOTkzNDA0NjYyNTA2XCJcbikubWFwKGNvbG9ycyk7XG5cbmV4cG9ydCBkZWZhdWx0IHJhbXAoc2NoZW1lKTtcbiIsImltcG9ydCBjb2xvcnMgZnJvbSBcIi4uL2NvbG9ycy5qc1wiO1xuaW1wb3J0IHJhbXAgZnJvbSBcIi4uL3JhbXAuanNcIjtcblxuZXhwb3J0IHZhciBzY2hlbWUgPSBuZXcgQXJyYXkoMykuY29uY2F0KFxuICBcImZmZWRhMGZlYjI0Y2YwM2IyMFwiLFxuICBcImZmZmZiMmZlY2M1Y2ZkOGQzY2UzMWExY1wiLFxuICBcImZmZmZiMmZlY2M1Y2ZkOGQzY2YwM2IyMGJkMDAyNlwiLFxuICBcImZmZmZiMmZlZDk3NmZlYjI0Y2ZkOGQzY2YwM2IyMGJkMDAyNlwiLFxuICBcImZmZmZiMmZlZDk3NmZlYjI0Y2ZkOGQzY2ZjNGUyYWUzMWExY2IxMDAyNlwiLFxuICBcImZmZmZjY2ZmZWRhMGZlZDk3NmZlYjI0Y2ZkOGQzY2ZjNGUyYWUzMWExY2IxMDAyNlwiLFxuICBcImZmZmZjY2ZmZWRhMGZlZDk3NmZlYjI0Y2ZkOGQzY2ZjNGUyYWUzMWExY2JkMDAyNjgwMDAyNlwiXG4pLm1hcChjb2xvcnMpO1xuXG5leHBvcnQgZGVmYXVsdCByYW1wKHNjaGVtZSk7XG4iLCJpbXBvcnQgY29sb3JzIGZyb20gXCIuLi9jb2xvcnMuanNcIjtcbmltcG9ydCByYW1wIGZyb20gXCIuLi9yYW1wLmpzXCI7XG5cbmV4cG9ydCB2YXIgc2NoZW1lID0gbmV3IEFycmF5KDMpLmNvbmNhdChcbiAgXCJkZWViZjc5ZWNhZTEzMTgyYmRcIixcbiAgXCJlZmYzZmZiZGQ3ZTc2YmFlZDYyMTcxYjVcIixcbiAgXCJlZmYzZmZiZGQ3ZTc2YmFlZDYzMTgyYmQwODUxOWNcIixcbiAgXCJlZmYzZmZjNmRiZWY5ZWNhZTE2YmFlZDYzMTgyYmQwODUxOWNcIixcbiAgXCJlZmYzZmZjNmRiZWY5ZWNhZTE2YmFlZDY0MjkyYzYyMTcxYjUwODQ1OTRcIixcbiAgXCJmN2ZiZmZkZWViZjdjNmRiZWY5ZWNhZTE2YmFlZDY0MjkyYzYyMTcxYjUwODQ1OTRcIixcbiAgXCJmN2ZiZmZkZWViZjdjNmRiZWY5ZWNhZTE2YmFlZDY0MjkyYzYyMTcxYjUwODUxOWMwODMwNmJcIlxuKS5tYXAoY29sb3JzKTtcblxuZXhwb3J0IGRlZmF1bHQgcmFtcChzY2hlbWUpO1xuIiwiaW1wb3J0IGNvbG9ycyBmcm9tIFwiLi4vY29sb3JzLmpzXCI7XG5pbXBvcnQgcmFtcCBmcm9tIFwiLi4vcmFtcC5qc1wiO1xuXG5leHBvcnQgdmFyIHNjaGVtZSA9IG5ldyBBcnJheSgzKS5jb25jYXQoXG4gIFwiZTVmNWUwYTFkOTliMzFhMzU0XCIsXG4gIFwiZWRmOGU5YmFlNGIzNzRjNDc2MjM4YjQ1XCIsXG4gIFwiZWRmOGU5YmFlNGIzNzRjNDc2MzFhMzU0MDA2ZDJjXCIsXG4gIFwiZWRmOGU5YzdlOWMwYTFkOTliNzRjNDc2MzFhMzU0MDA2ZDJjXCIsXG4gIFwiZWRmOGU5YzdlOWMwYTFkOTliNzRjNDc2NDFhYjVkMjM4YjQ1MDA1YTMyXCIsXG4gIFwiZjdmY2Y1ZTVmNWUwYzdlOWMwYTFkOTliNzRjNDc2NDFhYjVkMjM4YjQ1MDA1YTMyXCIsXG4gIFwiZjdmY2Y1ZTVmNWUwYzdlOWMwYTFkOTliNzRjNDc2NDFhYjVkMjM4YjQ1MDA2ZDJjMDA0NDFiXCJcbikubWFwKGNvbG9ycyk7XG5cbmV4cG9ydCBkZWZhdWx0IHJhbXAoc2NoZW1lKTtcbiIsImltcG9ydCBjb2xvcnMgZnJvbSBcIi4uL2NvbG9ycy5qc1wiO1xuaW1wb3J0IHJhbXAgZnJvbSBcIi4uL3JhbXAuanNcIjtcblxuZXhwb3J0IHZhciBzY2hlbWUgPSBuZXcgQXJyYXkoMykuY29uY2F0KFxuICBcImYwZjBmMGJkYmRiZDYzNjM2M1wiLFxuICBcImY3ZjdmN2NjY2NjYzk2OTY5NjUyNTI1MlwiLFxuICBcImY3ZjdmN2NjY2NjYzk2OTY5NjYzNjM2MzI1MjUyNVwiLFxuICBcImY3ZjdmN2Q5ZDlkOWJkYmRiZDk2OTY5NjYzNjM2MzI1MjUyNVwiLFxuICBcImY3ZjdmN2Q5ZDlkOWJkYmRiZDk2OTY5NjczNzM3MzUyNTI1MjI1MjUyNVwiLFxuICBcImZmZmZmZmYwZjBmMGQ5ZDlkOWJkYmRiZDk2OTY5NjczNzM3MzUyNTI1MjI1MjUyNVwiLFxuICBcImZmZmZmZmYwZjBmMGQ5ZDlkOWJkYmRiZDk2OTY5NjczNzM3MzUyNTI1MjI1MjUyNTAwMDAwMFwiXG4pLm1hcChjb2xvcnMpO1xuXG5leHBvcnQgZGVmYXVsdCByYW1wKHNjaGVtZSk7XG4iLCJpbXBvcnQgY29sb3JzIGZyb20gXCIuLi9jb2xvcnMuanNcIjtcbmltcG9ydCByYW1wIGZyb20gXCIuLi9yYW1wLmpzXCI7XG5cbmV4cG9ydCB2YXIgc2NoZW1lID0gbmV3IEFycmF5KDMpLmNvbmNhdChcbiAgXCJlZmVkZjViY2JkZGM3NTZiYjFcIixcbiAgXCJmMmYwZjdjYmM5ZTI5ZTlhYzg2YTUxYTNcIixcbiAgXCJmMmYwZjdjYmM5ZTI5ZTlhYzg3NTZiYjE1NDI3OGZcIixcbiAgXCJmMmYwZjdkYWRhZWJiY2JkZGM5ZTlhYzg3NTZiYjE1NDI3OGZcIixcbiAgXCJmMmYwZjdkYWRhZWJiY2JkZGM5ZTlhYzg4MDdkYmE2YTUxYTM0YTE0ODZcIixcbiAgXCJmY2ZiZmRlZmVkZjVkYWRhZWJiY2JkZGM5ZTlhYzg4MDdkYmE2YTUxYTM0YTE0ODZcIixcbiAgXCJmY2ZiZmRlZmVkZjVkYWRhZWJiY2JkZGM5ZTlhYzg4MDdkYmE2YTUxYTM1NDI3OGYzZjAwN2RcIlxuKS5tYXAoY29sb3JzKTtcblxuZXhwb3J0IGRlZmF1bHQgcmFtcChzY2hlbWUpO1xuIiwiaW1wb3J0IGNvbG9ycyBmcm9tIFwiLi4vY29sb3JzLmpzXCI7XG5pbXBvcnQgcmFtcCBmcm9tIFwiLi4vcmFtcC5qc1wiO1xuXG5leHBvcnQgdmFyIHNjaGVtZSA9IG5ldyBBcnJheSgzKS5jb25jYXQoXG4gIFwiZmVlMGQyZmM5MjcyZGUyZDI2XCIsXG4gIFwiZmVlNWQ5ZmNhZTkxZmI2YTRhY2IxODFkXCIsXG4gIFwiZmVlNWQ5ZmNhZTkxZmI2YTRhZGUyZDI2YTUwZjE1XCIsXG4gIFwiZmVlNWQ5ZmNiYmExZmM5MjcyZmI2YTRhZGUyZDI2YTUwZjE1XCIsXG4gIFwiZmVlNWQ5ZmNiYmExZmM5MjcyZmI2YTRhZWYzYjJjY2IxODFkOTkwMDBkXCIsXG4gIFwiZmZmNWYwZmVlMGQyZmNiYmExZmM5MjcyZmI2YTRhZWYzYjJjY2IxODFkOTkwMDBkXCIsXG4gIFwiZmZmNWYwZmVlMGQyZmNiYmExZmM5MjcyZmI2YTRhZWYzYjJjY2IxODFkYTUwZjE1NjcwMDBkXCJcbikubWFwKGNvbG9ycyk7XG5cbmV4cG9ydCBkZWZhdWx0IHJhbXAoc2NoZW1lKTtcbiIsImltcG9ydCBjb2xvcnMgZnJvbSBcIi4uL2NvbG9ycy5qc1wiO1xuaW1wb3J0IHJhbXAgZnJvbSBcIi4uL3JhbXAuanNcIjtcblxuZXhwb3J0IHZhciBzY2hlbWUgPSBuZXcgQXJyYXkoMykuY29uY2F0KFxuICBcImZlZTZjZWZkYWU2YmU2NTUwZFwiLFxuICBcImZlZWRkZWZkYmU4NWZkOGQzY2Q5NDcwMVwiLFxuICBcImZlZWRkZWZkYmU4NWZkOGQzY2U2NTUwZGE2MzYwM1wiLFxuICBcImZlZWRkZWZkZDBhMmZkYWU2YmZkOGQzY2U2NTUwZGE2MzYwM1wiLFxuICBcImZlZWRkZWZkZDBhMmZkYWU2YmZkOGQzY2YxNjkxM2Q5NDgwMThjMmQwNFwiLFxuICBcImZmZjVlYmZlZTZjZWZkZDBhMmZkYWU2YmZkOGQzY2YxNjkxM2Q5NDgwMThjMmQwNFwiLFxuICBcImZmZjVlYmZlZTZjZWZkZDBhMmZkYWU2YmZkOGQzY2YxNjkxM2Q5NDgwMWE2MzYwMzdmMjcwNFwiXG4pLm1hcChjb2xvcnMpO1xuXG5leHBvcnQgZGVmYXVsdCByYW1wKHNjaGVtZSk7XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0KSB7XG4gIHQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCB0KSk7XG4gIHJldHVybiBcInJnYihcIlxuICAgICAgKyBNYXRoLm1heCgwLCBNYXRoLm1pbigyNTUsIE1hdGgucm91bmQoLTQuNTQgLSB0ICogKDM1LjM0IC0gdCAqICgyMzgxLjczIC0gdCAqICg2NDAyLjcgLSB0ICogKDcwMjQuNzIgLSB0ICogMjcxMC41NykpKSkpKSkgKyBcIiwgXCJcbiAgICAgICsgTWF0aC5tYXgoMCwgTWF0aC5taW4oMjU1LCBNYXRoLnJvdW5kKDMyLjQ5ICsgdCAqICgxNzAuNzMgKyB0ICogKDUyLjgyIC0gdCAqICgxMzEuNDYgLSB0ICogKDE3Ni41OCAtIHQgKiA2Ny4zNykpKSkpKSkgKyBcIiwgXCJcbiAgICAgICsgTWF0aC5tYXgoMCwgTWF0aC5taW4oMjU1LCBNYXRoLnJvdW5kKDgxLjI0ICsgdCAqICg0NDIuMzYgLSB0ICogKDI0ODIuNDMgLSB0ICogKDYxNjcuMjQgLSB0ICogKDY2MTQuOTQgLSB0ICogMjQ3NS42NykpKSkpKSlcbiAgICAgICsgXCIpXCI7XG59XG4iLCJpbXBvcnQge2N1YmVoZWxpeH0gZnJvbSBcImQzLWNvbG9yXCI7XG5pbXBvcnQge2ludGVycG9sYXRlQ3ViZWhlbGl4TG9uZ30gZnJvbSBcImQzLWludGVycG9sYXRlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGludGVycG9sYXRlQ3ViZWhlbGl4TG9uZyhjdWJlaGVsaXgoMzAwLCAwLjUsIDAuMCksIGN1YmVoZWxpeCgtMjQwLCAwLjUsIDEuMCkpO1xuIiwiaW1wb3J0IHtjdWJlaGVsaXh9IGZyb20gXCJkMy1jb2xvclwiO1xuaW1wb3J0IHtpbnRlcnBvbGF0ZUN1YmVoZWxpeExvbmd9IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuXG5leHBvcnQgdmFyIHdhcm0gPSBpbnRlcnBvbGF0ZUN1YmVoZWxpeExvbmcoY3ViZWhlbGl4KC0xMDAsIDAuNzUsIDAuMzUpLCBjdWJlaGVsaXgoODAsIDEuNTAsIDAuOCkpO1xuXG5leHBvcnQgdmFyIGNvb2wgPSBpbnRlcnBvbGF0ZUN1YmVoZWxpeExvbmcoY3ViZWhlbGl4KDI2MCwgMC43NSwgMC4zNSksIGN1YmVoZWxpeCg4MCwgMS41MCwgMC44KSk7XG5cbnZhciBjID0gY3ViZWhlbGl4KCk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHQpIHtcbiAgaWYgKHQgPCAwIHx8IHQgPiAxKSB0IC09IE1hdGguZmxvb3IodCk7XG4gIHZhciB0cyA9IE1hdGguYWJzKHQgLSAwLjUpO1xuICBjLmggPSAzNjAgKiB0IC0gMTAwO1xuICBjLnMgPSAxLjUgLSAxLjUgKiB0cztcbiAgYy5sID0gMC44IC0gMC45ICogdHM7XG4gIHJldHVybiBjICsgXCJcIjtcbn1cbiIsImltcG9ydCB7cmdifSBmcm9tIFwiZDMtY29sb3JcIjtcblxudmFyIGMgPSByZ2IoKSxcbiAgICBwaV8xXzMgPSBNYXRoLlBJIC8gMyxcbiAgICBwaV8yXzMgPSBNYXRoLlBJICogMiAvIDM7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHQpIHtcbiAgdmFyIHg7XG4gIHQgPSAoMC41IC0gdCkgKiBNYXRoLlBJO1xuICBjLnIgPSAyNTUgKiAoeCA9IE1hdGguc2luKHQpKSAqIHg7XG4gIGMuZyA9IDI1NSAqICh4ID0gTWF0aC5zaW4odCArIHBpXzFfMykpICogeDtcbiAgYy5iID0gMjU1ICogKHggPSBNYXRoLnNpbih0ICsgcGlfMl8zKSkgKiB4O1xuICByZXR1cm4gYyArIFwiXCI7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0KSB7XG4gIHQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCB0KSk7XG4gIHJldHVybiBcInJnYihcIlxuICAgICAgKyBNYXRoLm1heCgwLCBNYXRoLm1pbigyNTUsIE1hdGgucm91bmQoMzQuNjEgKyB0ICogKDExNzIuMzMgLSB0ICogKDEwNzkzLjU2IC0gdCAqICgzMzMwMC4xMiAtIHQgKiAoMzgzOTQuNDkgLSB0ICogMTQ4MjUuMDUpKSkpKSkpICsgXCIsIFwiXG4gICAgICArIE1hdGgubWF4KDAsIE1hdGgubWluKDI1NSwgTWF0aC5yb3VuZCgyMy4zMSArIHQgKiAoNTU3LjMzICsgdCAqICgxMjI1LjMzIC0gdCAqICgzNTc0Ljk2IC0gdCAqICgxMDczLjc3ICsgdCAqIDcwNy41NikpKSkpKSkgKyBcIiwgXCJcbiAgICAgICsgTWF0aC5tYXgoMCwgTWF0aC5taW4oMjU1LCBNYXRoLnJvdW5kKDI3LjIgKyB0ICogKDMyMTEuMSAtIHQgKiAoMTUzMjcuOTcgLSB0ICogKDI3ODE0IC0gdCAqICgyMjU2OS4xOCAtIHQgKiA2ODM4LjY2KSkpKSkpKVxuICAgICAgKyBcIilcIjtcbn1cbiIsImltcG9ydCBjb2xvcnMgZnJvbSBcIi4uL2NvbG9ycy5qc1wiO1xuXG5mdW5jdGlvbiByYW1wKHJhbmdlKSB7XG4gIHZhciBuID0gcmFuZ2UubGVuZ3RoO1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHJldHVybiByYW5nZVtNYXRoLm1heCgwLCBNYXRoLm1pbihuIC0gMSwgTWF0aC5mbG9vcih0ICogbikpKV07XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IHJhbXAoY29sb3JzKFwiNDQwMTU0NDQwMjU2NDUwNDU3NDUwNTU5NDYwNzVhNDYwODVjNDYwYTVkNDYwYjVlNDcwZDYwNDcwZTYxNDcxMDYzNDcxMTY0NDcxMzY1NDgxNDY3NDgxNjY4NDgxNzY5NDgxODZhNDgxYTZjNDgxYjZkNDgxYzZlNDgxZDZmNDgxZjcwNDgyMDcxNDgyMTczNDgyMzc0NDgyNDc1NDgyNTc2NDgyNjc3NDgyODc4NDgyOTc5NDcyYTdhNDcyYzdhNDcyZDdiNDcyZTdjNDcyZjdkNDYzMDdlNDYzMjdlNDYzMzdmNDYzNDgwNDUzNTgxNDUzNzgxNDUzODgyNDQzOTgzNDQzYTgzNDQzYjg0NDMzZDg0NDMzZTg1NDIzZjg1NDI0MDg2NDI0MTg2NDE0Mjg3NDE0NDg3NDA0NTg4NDA0Njg4M2Y0Nzg4M2Y0ODg5M2U0OTg5M2U0YTg5M2U0YzhhM2Q0ZDhhM2Q0ZThhM2M0ZjhhM2M1MDhiM2I1MThiM2I1MjhiM2E1MzhiM2E1NDhjMzk1NThjMzk1NjhjMzg1ODhjMzg1OThjMzc1YThjMzc1YjhkMzY1YzhkMzY1ZDhkMzU1ZThkMzU1ZjhkMzQ2MDhkMzQ2MThkMzM2MjhkMzM2MzhkMzI2NDhlMzI2NThlMzE2NjhlMzE2NzhlMzE2ODhlMzA2OThlMzA2YThlMmY2YjhlMmY2YzhlMmU2ZDhlMmU2ZThlMmU2ZjhlMmQ3MDhlMmQ3MThlMmM3MThlMmM3MjhlMmM3MzhlMmI3NDhlMmI3NThlMmE3NjhlMmE3NzhlMmE3ODhlMjk3OThlMjk3YThlMjk3YjhlMjg3YzhlMjg3ZDhlMjc3ZThlMjc3ZjhlMjc4MDhlMjY4MThlMjY4MjhlMjY4MjhlMjU4MzhlMjU4NDhlMjU4NThlMjQ4NjhlMjQ4NzhlMjM4ODhlMjM4OThlMjM4YThkMjI4YjhkMjI4YzhkMjI4ZDhkMjE4ZThkMjE4ZjhkMjE5MDhkMjE5MThjMjA5MjhjMjA5MjhjMjA5MzhjMWY5NDhjMWY5NThiMWY5NjhiMWY5NzhiMWY5ODhiMWY5OThhMWY5YThhMWU5YjhhMWU5Yzg5MWU5ZDg5MWY5ZTg5MWY5Zjg4MWZhMDg4MWZhMTg4MWZhMTg3MWZhMjg3MjBhMzg2MjBhNDg2MjFhNTg1MjFhNjg1MjJhNzg1MjJhODg0MjNhOTgzMjRhYTgzMjVhYjgyMjVhYzgyMjZhZDgxMjdhZDgxMjhhZTgwMjlhZjdmMmFiMDdmMmNiMTdlMmRiMjdkMmViMzdjMmZiNDdjMzFiNTdiMzJiNjdhMzRiNjc5MzViNzc5MzdiODc4MzhiOTc3M2FiYTc2M2JiYjc1M2RiYzc0M2ZiYzczNDBiZDcyNDJiZTcxNDRiZjcwNDZjMDZmNDhjMTZlNGFjMTZkNGNjMjZjNGVjMzZiNTBjNDZhNTJjNTY5NTRjNTY4NTZjNjY3NThjNzY1NWFjODY0NWNjODYzNWVjOTYyNjBjYTYwNjNjYjVmNjVjYjVlNjdjYzVjNjljZDViNmNjZDVhNmVjZTU4NzBjZjU3NzNkMDU2NzVkMDU0NzdkMTUzN2FkMTUxN2NkMjUwN2ZkMzRlODFkMzRkODRkNDRiODZkNTQ5ODlkNTQ4OGJkNjQ2OGVkNjQ1OTBkNzQzOTNkNzQxOTVkODQwOThkODNlOWJkOTNjOWRkOTNiYTBkYTM5YTJkYTM3YTVkYjM2YThkYjM0YWFkYzMyYWRkYzMwYjBkZDJmYjJkZDJkYjVkZTJiYjhkZTI5YmFkZTI4YmRkZjI2YzBkZjI1YzJkZjIzYzVlMDIxYzhlMDIwY2FlMTFmY2RlMTFkZDBlMTFjZDJlMjFiZDVlMjFhZDhlMjE5ZGFlMzE5ZGRlMzE4ZGZlMzE4ZTJlNDE4ZTVlNDE5ZTdlNDE5ZWFlNTFhZWNlNTFiZWZlNTFjZjFlNTFkZjRlNjFlZjZlNjIwZjhlNjIxZmJlNzIzZmRlNzI1XCIpKTtcblxuZXhwb3J0IHZhciBtYWdtYSA9IHJhbXAoY29sb3JzKFwiMDAwMDA0MDEwMDA1MDEwMTA2MDEwMTA4MDIwMTA5MDIwMjBiMDIwMjBkMDMwMzBmMDMwMzEyMDQwNDE0MDUwNDE2MDYwNTE4MDYwNTFhMDcwNjFjMDgwNzFlMDkwNzIwMGEwODIyMGIwOTI0MGMwOTI2MGQwYTI5MGUwYjJiMTAwYjJkMTEwYzJmMTIwZDMxMTMwZDM0MTQwZTM2MTUwZTM4MTYwZjNiMTgwZjNkMTkxMDNmMWExMDQyMWMxMDQ0MWQxMTQ3MWUxMTQ5MjAxMTRiMjExMTRlMjIxMTUwMjQxMjUzMjUxMjU1MjcxMjU4MjkxMTVhMmExMTVjMmMxMTVmMmQxMTYxMmYxMTYzMzExMTY1MzMxMDY3MzQxMDY5MzYxMDZiMzgxMDZjMzkwZjZlM2IwZjcwM2QwZjcxM2YwZjcyNDAwZjc0NDIwZjc1NDQwZjc2NDUxMDc3NDcxMDc4NDkxMDc4NGExMDc5NGMxMTdhNGUxMTdiNGYxMjdiNTExMjdjNTIxMzdjNTQxMzdkNTYxNDdkNTcxNTdlNTkxNTdlNWExNjdlNWMxNjdmNWQxNzdmNWYxODdmNjAxODgwNjIxOTgwNjQxYTgwNjUxYTgwNjcxYjgwNjgxYzgxNmExYzgxNmIxZDgxNmQxZDgxNmUxZTgxNzAxZjgxNzIxZjgxNzMyMDgxNzUyMTgxNzYyMTgxNzgyMjgxNzkyMjgyN2IyMzgyN2MyMzgyN2UyNDgyODAyNTgyODEyNTgxODMyNjgxODQyNjgxODYyNzgxODgyNzgxODkyODgxOGIyOTgxOGMyOTgxOGUyYTgxOTAyYTgxOTEyYjgxOTMyYjgwOTQyYzgwOTYyYzgwOTgyZDgwOTkyZDgwOWIyZTdmOWMyZTdmOWUyZjdmYTAyZjdmYTEzMDdlYTMzMDdlYTUzMTdlYTYzMTdkYTgzMjdkYWEzMzdkYWIzMzdjYWQzNDdjYWUzNDdiYjAzNTdiYjIzNTdiYjMzNjdhYjUzNjdhYjczNzc5YjgzNzc5YmEzODc4YmMzOTc4YmQzOTc3YmYzYTc3YzAzYTc2YzIzYjc1YzQzYzc1YzUzYzc0YzczZDczYzgzZTczY2EzZTcyY2MzZjcxY2Q0MDcxY2Y0MDcwZDA0MTZmZDI0MjZmZDM0MzZlZDU0NDZkZDY0NTZjZDg0NTZjZDk0NjZiZGI0NzZhZGM0ODY5ZGU0OTY4ZGY0YTY4ZTA0YzY3ZTI0ZDY2ZTM0ZTY1ZTQ0ZjY0ZTU1MDY0ZTc1MjYzZTg1MzYyZTk1NDYyZWE1NjYxZWI1NzYwZWM1ODYwZWQ1YTVmZWU1YjVlZWY1ZDVlZjA1ZjVlZjE2MDVkZjI2MjVkZjI2NDVjZjM2NTVjZjQ2NzVjZjQ2OTVjZjU2YjVjZjY2YzVjZjY2ZTVjZjc3MDVjZjc3MjVjZjg3NDVjZjg3NjVjZjk3ODVkZjk3OTVkZjk3YjVkZmE3ZDVlZmE3ZjVlZmE4MTVmZmI4MzVmZmI4NTYwZmI4NzYxZmM4OTYxZmM4YTYyZmM4YzYzZmM4ZTY0ZmM5MDY1ZmQ5MjY2ZmQ5NDY3ZmQ5NjY4ZmQ5ODY5ZmQ5YTZhZmQ5YjZiZmU5ZDZjZmU5ZjZkZmVhMTZlZmVhMzZmZmVhNTcxZmVhNzcyZmVhOTczZmVhYTc0ZmVhYzc2ZmVhZTc3ZmViMDc4ZmViMjdhZmViNDdiZmViNjdjZmViNzdlZmViOTdmZmViYjgxZmViZDgyZmViZjg0ZmVjMTg1ZmVjMjg3ZmVjNDg4ZmVjNjhhZmVjODhjZmVjYThkZmVjYzhmZmVjZDkwZmVjZjkyZmVkMTk0ZmVkMzk1ZmVkNTk3ZmVkNzk5ZmVkODlhZmRkYTljZmRkYzllZmRkZWEwZmRlMGExZmRlMmEzZmRlM2E1ZmRlNWE3ZmRlN2E5ZmRlOWFhZmRlYmFjZmNlY2FlZmNlZWIwZmNmMGIyZmNmMmI0ZmNmNGI2ZmNmNmI4ZmNmN2I5ZmNmOWJiZmNmYmJkZmNmZGJmXCIpKTtcblxuZXhwb3J0IHZhciBpbmZlcm5vID0gcmFtcChjb2xvcnMoXCIwMDAwMDQwMTAwMDUwMTAxMDYwMTAxMDgwMjAxMGEwMjAyMGMwMjAyMGUwMzAyMTAwNDAzMTIwNDAzMTQwNTA0MTcwNjA0MTkwNzA1MWIwODA1MWQwOTA2MWYwYTA3MjIwYjA3MjQwYzA4MjYwZDA4MjkwZTA5MmIxMDA5MmQxMTBhMzAxMjBhMzIxNDBiMzQxNTBiMzcxNjBiMzkxODBjM2MxOTBjM2UxYjBjNDExYzBjNDMxZTBjNDUxZjBjNDgyMTBjNGEyMzBjNGMyNDBjNGYyNjBjNTEyODBiNTMyOTBiNTUyYjBiNTcyZDBiNTkyZjBhNWIzMTBhNWMzMjBhNWUzNDBhNWYzNjA5NjEzODA5NjIzOTA5NjMzYjA5NjQzZDA5NjUzZTA5NjY0MDBhNjc0MjBhNjg0NDBhNjg0NTBhNjk0NzBiNmE0OTBiNmE0YTBjNmI0YzBjNmI0ZDBkNmM0ZjBkNmM1MTBlNmM1MjBlNmQ1NDBmNmQ1NTBmNmQ1NzEwNmU1OTEwNmU1YTExNmU1YzEyNmU1ZDEyNmU1ZjEzNmU2MTEzNmU2MjE0NmU2NDE1NmU2NTE1NmU2NzE2NmU2OTE2NmU2YTE3NmU2YzE4NmU2ZDE4NmU2ZjE5NmU3MTE5NmU3MjFhNmU3NDFhNmU3NTFiNmU3NzFjNmQ3ODFjNmQ3YTFkNmQ3YzFkNmQ3ZDFlNmQ3ZjFlNmM4MDFmNmM4MjIwNmM4NDIwNmI4NTIxNmI4NzIxNmI4ODIyNmE4YTIyNmE4YzIzNjk4ZDIzNjk4ZjI0Njk5MDI1Njg5MjI1Njg5MzI2Njc5NTI2Njc5NzI3NjY5ODI3NjY5YTI4NjU5YjI5NjQ5ZDI5NjQ5ZjJhNjNhMDJhNjNhMjJiNjJhMzJjNjFhNTJjNjBhNjJkNjBhODJlNWZhOTJlNWVhYjJmNWVhZDMwNWRhZTMwNWNiMDMxNWJiMTMyNWFiMzMyNWFiNDMzNTliNjM0NThiNzM1NTdiOTM1NTZiYTM2NTViYzM3NTRiZDM4NTNiZjM5NTJjMDNhNTFjMTNhNTBjMzNiNGZjNDNjNGVjNjNkNGRjNzNlNGNjODNmNGJjYTQwNGFjYjQxNDljYzQyNDhjZTQzNDdjZjQ0NDZkMDQ1NDVkMjQ2NDRkMzQ3NDNkNDQ4NDJkNTRhNDFkNzRiM2ZkODRjM2VkOTRkM2RkYTRlM2NkYjUwM2JkZDUxM2FkZTUyMzhkZjUzMzdlMDU1MzZlMTU2MzVlMjU3MzRlMzU5MzNlNDVhMzFlNTVjMzBlNjVkMmZlNzVlMmVlODYwMmRlOTYxMmJlYTYzMmFlYjY0MjllYjY2MjhlYzY3MjZlZDY5MjVlZTZhMjRlZjZjMjNlZjZlMjFmMDZmMjBmMTcxMWZmMTczMWRmMjc0MWNmMzc2MWJmMzc4MTlmNDc5MThmNTdiMTdmNTdkMTVmNjdlMTRmNjgwMTNmNzgyMTJmNzg0MTBmODg1MGZmODg3MGVmODg5MGNmOThiMGJmOThjMGFmOThlMDlmYTkwMDhmYTkyMDdmYTk0MDdmYjk2MDZmYjk3MDZmYjk5MDZmYjliMDZmYjlkMDdmYzlmMDdmY2ExMDhmY2EzMDlmY2E1MGFmY2E2MGNmY2E4MGRmY2FhMGZmY2FjMTFmY2FlMTJmY2IwMTRmY2IyMTZmY2I0MThmYmI2MWFmYmI4MWRmYmJhMWZmYmJjMjFmYmJlMjNmYWMwMjZmYWMyMjhmYWM0MmFmYWM2MmRmOWM3MmZmOWM5MzJmOWNiMzVmOGNkMzdmOGNmM2FmN2QxM2RmN2QzNDBmNmQ1NDNmNmQ3NDZmNWQ5NDlmNWRiNGNmNGRkNGZmNGRmNTNmNGUxNTZmM2UzNWFmM2U1NWRmMmU2NjFmMmU4NjVmMmVhNjlmMWVjNmRmMWVkNzFmMWVmNzVmMWYxNzlmMmYyN2RmMmY0ODJmM2Y1ODZmM2Y2OGFmNGY4OGVmNWY5OTJmNmZhOTZmOGZiOWFmOWZjOWRmYWZkYTFmY2ZmYTRcIikpO1xuXG5leHBvcnQgdmFyIHBsYXNtYSA9IHJhbXAoY29sb3JzKFwiMGQwODg3MTAwNzg4MTMwNzg5MTYwNzhhMTkwNjhjMWIwNjhkMWQwNjhlMjAwNjhmMjIwNjkwMjQwNjkxMjYwNTkxMjgwNTkyMmEwNTkzMmMwNTk0MmUwNTk1MmYwNTk2MzEwNTk3MzMwNTk3MzUwNDk4MzcwNDk5MzgwNDlhM2EwNDlhM2MwNDliM2UwNDljM2YwNDljNDEwNDlkNDMwMzllNDQwMzllNDYwMzlmNDgwMzlmNDkwM2EwNGIwM2ExNGMwMmExNGUwMmEyNTAwMmEyNTEwMmEzNTMwMmEzNTUwMmE0NTYwMWE0NTgwMWE0NTkwMWE1NWIwMWE1NWMwMWE2NWUwMWE2NjAwMWE2NjEwMGE3NjMwMGE3NjQwMGE3NjYwMGE3NjcwMGE4NjkwMGE4NmEwMGE4NmMwMGE4NmUwMGE4NmYwMGE4NzEwMGE4NzIwMWE4NzQwMWE4NzUwMWE4NzcwMWE4NzgwMWE4N2EwMmE4N2IwMmE4N2QwM2E4N2UwM2E4ODAwNGE4ODEwNGE3ODMwNWE3ODQwNWE3ODYwNmE2ODcwN2E2ODgwOGE2OGEwOWE1OGIwYWE1OGQwYmE1OGUwY2E0OGYwZGE0OTEwZWEzOTIwZmEzOTQxMGEyOTUxMWExOTYxM2ExOTgxNGEwOTkxNTlmOWExNjlmOWMxNzllOWQxODlkOWUxOTlkYTAxYTljYTExYjliYTIxZDlhYTMxZTlhYTUxZjk5YTYyMDk4YTcyMTk3YTgyMjk2YWEyMzk1YWIyNDk0YWMyNjk0YWQyNzkzYWUyODkyYjAyOTkxYjEyYTkwYjIyYjhmYjMyYzhlYjQyZThkYjUyZjhjYjYzMDhiYjczMThhYjgzMjg5YmEzMzg4YmIzNDg4YmMzNTg3YmQzNzg2YmUzODg1YmYzOTg0YzAzYTgzYzEzYjgyYzIzYzgxYzMzZDgwYzQzZTdmYzU0MDdlYzY0MTdkYzc0MjdjYzg0MzdiYzk0NDdhY2E0NTdhY2I0Njc5Y2M0Nzc4Y2M0OTc3Y2Q0YTc2Y2U0Yjc1Y2Y0Yzc0ZDA0ZDczZDE0ZTcyZDI0ZjcxZDM1MTcxZDQ1MjcwZDU1MzZmZDU1NDZlZDY1NTZkZDc1NjZjZDg1NzZiZDk1ODZhZGE1YTZhZGE1YjY5ZGI1YzY4ZGM1ZDY3ZGQ1ZTY2ZGU1ZjY1ZGU2MTY0ZGY2MjYzZTA2MzYzZTE2NDYyZTI2NTYxZTI2NjYwZTM2ODVmZTQ2OTVlZTU2YTVkZTU2YjVkZTY2YzVjZTc2ZTViZTc2ZjVhZTg3MDU5ZTk3MTU4ZTk3MjU3ZWE3NDU3ZWI3NTU2ZWI3NjU1ZWM3NzU0ZWQ3OTUzZWQ3YTUyZWU3YjUxZWY3YzUxZWY3ZTUwZjA3ZjRmZjA4MDRlZjE4MTRkZjE4MzRjZjI4NDRiZjM4NTRiZjM4NzRhZjQ4ODQ5ZjQ4OTQ4ZjU4YjQ3ZjU4YzQ2ZjY4ZDQ1ZjY4ZjQ0Zjc5MDQ0Zjc5MTQzZjc5MzQyZjg5NDQxZjg5NTQwZjk5NzNmZjk5ODNlZjk5YTNlZmE5YjNkZmE5YzNjZmE5ZTNiZmI5ZjNhZmJhMTM5ZmJhMjM4ZmNhMzM4ZmNhNTM3ZmNhNjM2ZmNhODM1ZmNhOTM0ZmRhYjMzZmRhYzMzZmRhZTMyZmRhZjMxZmRiMTMwZmRiMjJmZmRiNDJmZmRiNTJlZmViNzJkZmViODJjZmViYTJjZmViYjJiZmViZDJhZmViZTJhZmVjMDI5ZmRjMjI5ZmRjMzI4ZmRjNTI3ZmRjNjI3ZmRjODI3ZmRjYTI2ZmRjYjI2ZmNjZDI1ZmNjZTI1ZmNkMDI1ZmNkMjI1ZmJkMzI0ZmJkNTI0ZmJkNzI0ZmFkODI0ZmFkYTI0ZjlkYzI0ZjlkZDI1ZjhkZjI1ZjhlMTI1ZjdlMjI1ZjdlNDI1ZjZlNjI2ZjZlODI2ZjVlOTI2ZjVlYjI3ZjRlZDI3ZjNlZTI3ZjNmMDI3ZjJmMjI3ZjFmNDI2ZjFmNTI1ZjBmNzI0ZjBmOTIxXCIpKTtcbiIsImV4cG9ydCB7ZGVmYXVsdCBhcyBzY2hlbWVDYXRlZ29yeTEwfSBmcm9tIFwiLi9jYXRlZ29yaWNhbC9jYXRlZ29yeTEwLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgc2NoZW1lQWNjZW50fSBmcm9tIFwiLi9jYXRlZ29yaWNhbC9BY2NlbnQuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBzY2hlbWVEYXJrMn0gZnJvbSBcIi4vY2F0ZWdvcmljYWwvRGFyazIuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBzY2hlbWVPYnNlcnZhYmxlMTB9IGZyb20gXCIuL2NhdGVnb3JpY2FsL29ic2VydmFibGUxMC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHNjaGVtZVBhaXJlZH0gZnJvbSBcIi4vY2F0ZWdvcmljYWwvUGFpcmVkLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgc2NoZW1lUGFzdGVsMX0gZnJvbSBcIi4vY2F0ZWdvcmljYWwvUGFzdGVsMS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHNjaGVtZVBhc3RlbDJ9IGZyb20gXCIuL2NhdGVnb3JpY2FsL1Bhc3RlbDIuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBzY2hlbWVTZXQxfSBmcm9tIFwiLi9jYXRlZ29yaWNhbC9TZXQxLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgc2NoZW1lU2V0Mn0gZnJvbSBcIi4vY2F0ZWdvcmljYWwvU2V0Mi5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHNjaGVtZVNldDN9IGZyb20gXCIuL2NhdGVnb3JpY2FsL1NldDMuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBzY2hlbWVUYWJsZWF1MTB9IGZyb20gXCIuL2NhdGVnb3JpY2FsL1RhYmxlYXUxMC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlQnJCRywgc2NoZW1lIGFzIHNjaGVtZUJyQkd9IGZyb20gXCIuL2RpdmVyZ2luZy9CckJHLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgaW50ZXJwb2xhdGVQUkduLCBzY2hlbWUgYXMgc2NoZW1lUFJHbn0gZnJvbSBcIi4vZGl2ZXJnaW5nL1BSR24uanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBpbnRlcnBvbGF0ZVBpWUcsIHNjaGVtZSBhcyBzY2hlbWVQaVlHfSBmcm9tIFwiLi9kaXZlcmdpbmcvUGlZRy5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlUHVPciwgc2NoZW1lIGFzIHNjaGVtZVB1T3J9IGZyb20gXCIuL2RpdmVyZ2luZy9QdU9yLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgaW50ZXJwb2xhdGVSZEJ1LCBzY2hlbWUgYXMgc2NoZW1lUmRCdX0gZnJvbSBcIi4vZGl2ZXJnaW5nL1JkQnUuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBpbnRlcnBvbGF0ZVJkR3ksIHNjaGVtZSBhcyBzY2hlbWVSZEd5fSBmcm9tIFwiLi9kaXZlcmdpbmcvUmRHeS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlUmRZbEJ1LCBzY2hlbWUgYXMgc2NoZW1lUmRZbEJ1fSBmcm9tIFwiLi9kaXZlcmdpbmcvUmRZbEJ1LmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgaW50ZXJwb2xhdGVSZFlsR24sIHNjaGVtZSBhcyBzY2hlbWVSZFlsR259IGZyb20gXCIuL2RpdmVyZ2luZy9SZFlsR24uanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBpbnRlcnBvbGF0ZVNwZWN0cmFsLCBzY2hlbWUgYXMgc2NoZW1lU3BlY3RyYWx9IGZyb20gXCIuL2RpdmVyZ2luZy9TcGVjdHJhbC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlQnVHbiwgc2NoZW1lIGFzIHNjaGVtZUJ1R259IGZyb20gXCIuL3NlcXVlbnRpYWwtbXVsdGkvQnVHbi5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlQnVQdSwgc2NoZW1lIGFzIHNjaGVtZUJ1UHV9IGZyb20gXCIuL3NlcXVlbnRpYWwtbXVsdGkvQnVQdS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlR25CdSwgc2NoZW1lIGFzIHNjaGVtZUduQnV9IGZyb20gXCIuL3NlcXVlbnRpYWwtbXVsdGkvR25CdS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlT3JSZCwgc2NoZW1lIGFzIHNjaGVtZU9yUmR9IGZyb20gXCIuL3NlcXVlbnRpYWwtbXVsdGkvT3JSZC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlUHVCdUduLCBzY2hlbWUgYXMgc2NoZW1lUHVCdUdufSBmcm9tIFwiLi9zZXF1ZW50aWFsLW11bHRpL1B1QnVHbi5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlUHVCdSwgc2NoZW1lIGFzIHNjaGVtZVB1QnV9IGZyb20gXCIuL3NlcXVlbnRpYWwtbXVsdGkvUHVCdS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlUHVSZCwgc2NoZW1lIGFzIHNjaGVtZVB1UmR9IGZyb20gXCIuL3NlcXVlbnRpYWwtbXVsdGkvUHVSZC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlUmRQdSwgc2NoZW1lIGFzIHNjaGVtZVJkUHV9IGZyb20gXCIuL3NlcXVlbnRpYWwtbXVsdGkvUmRQdS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlWWxHbkJ1LCBzY2hlbWUgYXMgc2NoZW1lWWxHbkJ1fSBmcm9tIFwiLi9zZXF1ZW50aWFsLW11bHRpL1lsR25CdS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlWWxHbiwgc2NoZW1lIGFzIHNjaGVtZVlsR259IGZyb20gXCIuL3NlcXVlbnRpYWwtbXVsdGkvWWxHbi5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlWWxPckJyLCBzY2hlbWUgYXMgc2NoZW1lWWxPckJyfSBmcm9tIFwiLi9zZXF1ZW50aWFsLW11bHRpL1lsT3JCci5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlWWxPclJkLCBzY2hlbWUgYXMgc2NoZW1lWWxPclJkfSBmcm9tIFwiLi9zZXF1ZW50aWFsLW11bHRpL1lsT3JSZC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlQmx1ZXMsIHNjaGVtZSBhcyBzY2hlbWVCbHVlc30gZnJvbSBcIi4vc2VxdWVudGlhbC1zaW5nbGUvQmx1ZXMuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBpbnRlcnBvbGF0ZUdyZWVucywgc2NoZW1lIGFzIHNjaGVtZUdyZWVuc30gZnJvbSBcIi4vc2VxdWVudGlhbC1zaW5nbGUvR3JlZW5zLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgaW50ZXJwb2xhdGVHcmV5cywgc2NoZW1lIGFzIHNjaGVtZUdyZXlzfSBmcm9tIFwiLi9zZXF1ZW50aWFsLXNpbmdsZS9HcmV5cy5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlUHVycGxlcywgc2NoZW1lIGFzIHNjaGVtZVB1cnBsZXN9IGZyb20gXCIuL3NlcXVlbnRpYWwtc2luZ2xlL1B1cnBsZXMuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBpbnRlcnBvbGF0ZVJlZHMsIHNjaGVtZSBhcyBzY2hlbWVSZWRzfSBmcm9tIFwiLi9zZXF1ZW50aWFsLXNpbmdsZS9SZWRzLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgaW50ZXJwb2xhdGVPcmFuZ2VzLCBzY2hlbWUgYXMgc2NoZW1lT3Jhbmdlc30gZnJvbSBcIi4vc2VxdWVudGlhbC1zaW5nbGUvT3Jhbmdlcy5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlQ2l2aWRpc30gZnJvbSBcIi4vc2VxdWVudGlhbC1tdWx0aS9jaXZpZGlzLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgaW50ZXJwb2xhdGVDdWJlaGVsaXhEZWZhdWx0fSBmcm9tIFwiLi9zZXF1ZW50aWFsLW11bHRpL2N1YmVoZWxpeC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlUmFpbmJvdywgd2FybSBhcyBpbnRlcnBvbGF0ZVdhcm0sIGNvb2wgYXMgaW50ZXJwb2xhdGVDb29sfSBmcm9tIFwiLi9zZXF1ZW50aWFsLW11bHRpL3JhaW5ib3cuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBpbnRlcnBvbGF0ZVNpbmVib3d9IGZyb20gXCIuL3NlcXVlbnRpYWwtbXVsdGkvc2luZWJvdy5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGludGVycG9sYXRlVHVyYm99IGZyb20gXCIuL3NlcXVlbnRpYWwtbXVsdGkvdHVyYm8uanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBpbnRlcnBvbGF0ZVZpcmlkaXMsIG1hZ21hIGFzIGludGVycG9sYXRlTWFnbWEsIGluZmVybm8gYXMgaW50ZXJwb2xhdGVJbmZlcm5vLCBwbGFzbWEgYXMgaW50ZXJwb2xhdGVQbGFzbWF9IGZyb20gXCIuL3NlcXVlbnRpYWwtbXVsdGkvdmlyaWRpcy5qc1wiO1xuIiwiZXhwb3J0IGRlZmF1bHQgeCA9PiAoKSA9PiB4O1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gWm9vbUV2ZW50KHR5cGUsIHtcbiAgc291cmNlRXZlbnQsXG4gIHRhcmdldCxcbiAgdHJhbnNmb3JtLFxuICBkaXNwYXRjaFxufSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgdHlwZToge3ZhbHVlOiB0eXBlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWV9LFxuICAgIHNvdXJjZUV2ZW50OiB7dmFsdWU6IHNvdXJjZUV2ZW50LCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWV9LFxuICAgIHRhcmdldDoge3ZhbHVlOiB0YXJnZXQsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZX0sXG4gICAgdHJhbnNmb3JtOiB7dmFsdWU6IHRyYW5zZm9ybSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlfSxcbiAgICBfOiB7dmFsdWU6IGRpc3BhdGNofVxuICB9KTtcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBUcmFuc2Zvcm0oaywgeCwgeSkge1xuICB0aGlzLmsgPSBrO1xuICB0aGlzLnggPSB4O1xuICB0aGlzLnkgPSB5O1xufVxuXG5UcmFuc2Zvcm0ucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogVHJhbnNmb3JtLFxuICBzY2FsZTogZnVuY3Rpb24oaykge1xuICAgIHJldHVybiBrID09PSAxID8gdGhpcyA6IG5ldyBUcmFuc2Zvcm0odGhpcy5rICogaywgdGhpcy54LCB0aGlzLnkpO1xuICB9LFxuICB0cmFuc2xhdGU6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICByZXR1cm4geCA9PT0gMCAmIHkgPT09IDAgPyB0aGlzIDogbmV3IFRyYW5zZm9ybSh0aGlzLmssIHRoaXMueCArIHRoaXMuayAqIHgsIHRoaXMueSArIHRoaXMuayAqIHkpO1xuICB9LFxuICBhcHBseTogZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gW3BvaW50WzBdICogdGhpcy5rICsgdGhpcy54LCBwb2ludFsxXSAqIHRoaXMuayArIHRoaXMueV07XG4gIH0sXG4gIGFwcGx5WDogZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB4ICogdGhpcy5rICsgdGhpcy54O1xuICB9LFxuICBhcHBseVk6IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4geSAqIHRoaXMuayArIHRoaXMueTtcbiAgfSxcbiAgaW52ZXJ0OiBmdW5jdGlvbihsb2NhdGlvbikge1xuICAgIHJldHVybiBbKGxvY2F0aW9uWzBdIC0gdGhpcy54KSAvIHRoaXMuaywgKGxvY2F0aW9uWzFdIC0gdGhpcy55KSAvIHRoaXMua107XG4gIH0sXG4gIGludmVydFg6IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gKHggLSB0aGlzLngpIC8gdGhpcy5rO1xuICB9LFxuICBpbnZlcnRZOiBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuICh5IC0gdGhpcy55KSAvIHRoaXMuaztcbiAgfSxcbiAgcmVzY2FsZVg6IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4geC5jb3B5KCkuZG9tYWluKHgucmFuZ2UoKS5tYXAodGhpcy5pbnZlcnRYLCB0aGlzKS5tYXAoeC5pbnZlcnQsIHgpKTtcbiAgfSxcbiAgcmVzY2FsZVk6IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4geS5jb3B5KCkuZG9tYWluKHkucmFuZ2UoKS5tYXAodGhpcy5pbnZlcnRZLCB0aGlzKS5tYXAoeS5pbnZlcnQsIHkpKTtcbiAgfSxcbiAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcInRyYW5zbGF0ZShcIiArIHRoaXMueCArIFwiLFwiICsgdGhpcy55ICsgXCIpIHNjYWxlKFwiICsgdGhpcy5rICsgXCIpXCI7XG4gIH1cbn07XG5cbmV4cG9ydCB2YXIgaWRlbnRpdHkgPSBuZXcgVHJhbnNmb3JtKDEsIDAsIDApO1xuXG50cmFuc2Zvcm0ucHJvdG90eXBlID0gVHJhbnNmb3JtLnByb3RvdHlwZTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNmb3JtKG5vZGUpIHtcbiAgd2hpbGUgKCFub2RlLl9fem9vbSkgaWYgKCEobm9kZSA9IG5vZGUucGFyZW50Tm9kZSkpIHJldHVybiBpZGVudGl0eTtcbiAgcmV0dXJuIG5vZGUuX196b29tO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIG5vcHJvcGFnYXRpb24oZXZlbnQpIHtcbiAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xufVxuIiwiaW1wb3J0IHtkaXNwYXRjaH0gZnJvbSBcImQzLWRpc3BhdGNoXCI7XG5pbXBvcnQge2RyYWdEaXNhYmxlLCBkcmFnRW5hYmxlfSBmcm9tIFwiZDMtZHJhZ1wiO1xuaW1wb3J0IHtpbnRlcnBvbGF0ZVpvb219IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuaW1wb3J0IHtzZWxlY3QsIHBvaW50ZXJ9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7aW50ZXJydXB0fSBmcm9tIFwiZDMtdHJhbnNpdGlvblwiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5pbXBvcnQgWm9vbUV2ZW50IGZyb20gXCIuL2V2ZW50LmpzXCI7XG5pbXBvcnQge1RyYW5zZm9ybSwgaWRlbnRpdHl9IGZyb20gXCIuL3RyYW5zZm9ybS5qc1wiO1xuaW1wb3J0IG5vZXZlbnQsIHtub3Byb3BhZ2F0aW9ufSBmcm9tIFwiLi9ub2V2ZW50LmpzXCI7XG5cbi8vIElnbm9yZSByaWdodC1jbGljaywgc2luY2UgdGhhdCBzaG91bGQgb3BlbiB0aGUgY29udGV4dCBtZW51LlxuLy8gZXhjZXB0IGZvciBwaW5jaC10by16b29tLCB3aGljaCBpcyBzZW50IGFzIGEgd2hlZWwrY3RybEtleSBldmVudFxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlcihldmVudCkge1xuICByZXR1cm4gKCFldmVudC5jdHJsS2V5IHx8IGV2ZW50LnR5cGUgPT09ICd3aGVlbCcpICYmICFldmVudC5idXR0b247XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRFeHRlbnQoKSB7XG4gIHZhciBlID0gdGhpcztcbiAgaWYgKGUgaW5zdGFuY2VvZiBTVkdFbGVtZW50KSB7XG4gICAgZSA9IGUub3duZXJTVkdFbGVtZW50IHx8IGU7XG4gICAgaWYgKGUuaGFzQXR0cmlidXRlKFwidmlld0JveFwiKSkge1xuICAgICAgZSA9IGUudmlld0JveC5iYXNlVmFsO1xuICAgICAgcmV0dXJuIFtbZS54LCBlLnldLCBbZS54ICsgZS53aWR0aCwgZS55ICsgZS5oZWlnaHRdXTtcbiAgICB9XG4gICAgcmV0dXJuIFtbMCwgMF0sIFtlLndpZHRoLmJhc2VWYWwudmFsdWUsIGUuaGVpZ2h0LmJhc2VWYWwudmFsdWVdXTtcbiAgfVxuICByZXR1cm4gW1swLCAwXSwgW2UuY2xpZW50V2lkdGgsIGUuY2xpZW50SGVpZ2h0XV07XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRUcmFuc2Zvcm0oKSB7XG4gIHJldHVybiB0aGlzLl9fem9vbSB8fCBpZGVudGl0eTtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdFdoZWVsRGVsdGEoZXZlbnQpIHtcbiAgcmV0dXJuIC1ldmVudC5kZWx0YVkgKiAoZXZlbnQuZGVsdGFNb2RlID09PSAxID8gMC4wNSA6IGV2ZW50LmRlbHRhTW9kZSA/IDEgOiAwLjAwMikgKiAoZXZlbnQuY3RybEtleSA/IDEwIDogMSk7XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRUb3VjaGFibGUoKSB7XG4gIHJldHVybiBuYXZpZ2F0b3IubWF4VG91Y2hQb2ludHMgfHwgKFwib250b3VjaHN0YXJ0XCIgaW4gdGhpcyk7XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRDb25zdHJhaW4odHJhbnNmb3JtLCBleHRlbnQsIHRyYW5zbGF0ZUV4dGVudCkge1xuICB2YXIgZHgwID0gdHJhbnNmb3JtLmludmVydFgoZXh0ZW50WzBdWzBdKSAtIHRyYW5zbGF0ZUV4dGVudFswXVswXSxcbiAgICAgIGR4MSA9IHRyYW5zZm9ybS5pbnZlcnRYKGV4dGVudFsxXVswXSkgLSB0cmFuc2xhdGVFeHRlbnRbMV1bMF0sXG4gICAgICBkeTAgPSB0cmFuc2Zvcm0uaW52ZXJ0WShleHRlbnRbMF1bMV0pIC0gdHJhbnNsYXRlRXh0ZW50WzBdWzFdLFxuICAgICAgZHkxID0gdHJhbnNmb3JtLmludmVydFkoZXh0ZW50WzFdWzFdKSAtIHRyYW5zbGF0ZUV4dGVudFsxXVsxXTtcbiAgcmV0dXJuIHRyYW5zZm9ybS50cmFuc2xhdGUoXG4gICAgZHgxID4gZHgwID8gKGR4MCArIGR4MSkgLyAyIDogTWF0aC5taW4oMCwgZHgwKSB8fCBNYXRoLm1heCgwLCBkeDEpLFxuICAgIGR5MSA+IGR5MCA/IChkeTAgKyBkeTEpIC8gMiA6IE1hdGgubWluKDAsIGR5MCkgfHwgTWF0aC5tYXgoMCwgZHkxKVxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIGZpbHRlciA9IGRlZmF1bHRGaWx0ZXIsXG4gICAgICBleHRlbnQgPSBkZWZhdWx0RXh0ZW50LFxuICAgICAgY29uc3RyYWluID0gZGVmYXVsdENvbnN0cmFpbixcbiAgICAgIHdoZWVsRGVsdGEgPSBkZWZhdWx0V2hlZWxEZWx0YSxcbiAgICAgIHRvdWNoYWJsZSA9IGRlZmF1bHRUb3VjaGFibGUsXG4gICAgICBzY2FsZUV4dGVudCA9IFswLCBJbmZpbml0eV0sXG4gICAgICB0cmFuc2xhdGVFeHRlbnQgPSBbWy1JbmZpbml0eSwgLUluZmluaXR5XSwgW0luZmluaXR5LCBJbmZpbml0eV1dLFxuICAgICAgZHVyYXRpb24gPSAyNTAsXG4gICAgICBpbnRlcnBvbGF0ZSA9IGludGVycG9sYXRlWm9vbSxcbiAgICAgIGxpc3RlbmVycyA9IGRpc3BhdGNoKFwic3RhcnRcIiwgXCJ6b29tXCIsIFwiZW5kXCIpLFxuICAgICAgdG91Y2hzdGFydGluZyxcbiAgICAgIHRvdWNoZmlyc3QsXG4gICAgICB0b3VjaGVuZGluZyxcbiAgICAgIHRvdWNoRGVsYXkgPSA1MDAsXG4gICAgICB3aGVlbERlbGF5ID0gMTUwLFxuICAgICAgY2xpY2tEaXN0YW5jZTIgPSAwLFxuICAgICAgdGFwRGlzdGFuY2UgPSAxMDtcblxuICBmdW5jdGlvbiB6b29tKHNlbGVjdGlvbikge1xuICAgIHNlbGVjdGlvblxuICAgICAgICAucHJvcGVydHkoXCJfX3pvb21cIiwgZGVmYXVsdFRyYW5zZm9ybSlcbiAgICAgICAgLm9uKFwid2hlZWwuem9vbVwiLCB3aGVlbGVkLCB7cGFzc2l2ZTogZmFsc2V9KVxuICAgICAgICAub24oXCJtb3VzZWRvd24uem9vbVwiLCBtb3VzZWRvd25lZClcbiAgICAgICAgLm9uKFwiZGJsY2xpY2suem9vbVwiLCBkYmxjbGlja2VkKVxuICAgICAgLmZpbHRlcih0b3VjaGFibGUpXG4gICAgICAgIC5vbihcInRvdWNoc3RhcnQuem9vbVwiLCB0b3VjaHN0YXJ0ZWQpXG4gICAgICAgIC5vbihcInRvdWNobW92ZS56b29tXCIsIHRvdWNobW92ZWQpXG4gICAgICAgIC5vbihcInRvdWNoZW5kLnpvb20gdG91Y2hjYW5jZWwuem9vbVwiLCB0b3VjaGVuZGVkKVxuICAgICAgICAuc3R5bGUoXCItd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3JcIiwgXCJyZ2JhKDAsMCwwLDApXCIpO1xuICB9XG5cbiAgem9vbS50cmFuc2Zvcm0gPSBmdW5jdGlvbihjb2xsZWN0aW9uLCB0cmFuc2Zvcm0sIHBvaW50LCBldmVudCkge1xuICAgIHZhciBzZWxlY3Rpb24gPSBjb2xsZWN0aW9uLnNlbGVjdGlvbiA/IGNvbGxlY3Rpb24uc2VsZWN0aW9uKCkgOiBjb2xsZWN0aW9uO1xuICAgIHNlbGVjdGlvbi5wcm9wZXJ0eShcIl9fem9vbVwiLCBkZWZhdWx0VHJhbnNmb3JtKTtcbiAgICBpZiAoY29sbGVjdGlvbiAhPT0gc2VsZWN0aW9uKSB7XG4gICAgICBzY2hlZHVsZShjb2xsZWN0aW9uLCB0cmFuc2Zvcm0sIHBvaW50LCBldmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGVjdGlvbi5pbnRlcnJ1cHQoKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICBnZXN0dXJlKHRoaXMsIGFyZ3VtZW50cylcbiAgICAgICAgICAuZXZlbnQoZXZlbnQpXG4gICAgICAgICAgLnN0YXJ0KClcbiAgICAgICAgICAuem9vbShudWxsLCB0eXBlb2YgdHJhbnNmb3JtID09PSBcImZ1bmN0aW9uXCIgPyB0cmFuc2Zvcm0uYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IHRyYW5zZm9ybSlcbiAgICAgICAgICAuZW5kKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgem9vbS5zY2FsZUJ5ID0gZnVuY3Rpb24oc2VsZWN0aW9uLCBrLCBwLCBldmVudCkge1xuICAgIHpvb20uc2NhbGVUbyhzZWxlY3Rpb24sIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGswID0gdGhpcy5fX3pvb20uayxcbiAgICAgICAgICBrMSA9IHR5cGVvZiBrID09PSBcImZ1bmN0aW9uXCIgPyBrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgOiBrO1xuICAgICAgcmV0dXJuIGswICogazE7XG4gICAgfSwgcCwgZXZlbnQpO1xuICB9O1xuXG4gIHpvb20uc2NhbGVUbyA9IGZ1bmN0aW9uKHNlbGVjdGlvbiwgaywgcCwgZXZlbnQpIHtcbiAgICB6b29tLnRyYW5zZm9ybShzZWxlY3Rpb24sIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGUgPSBleHRlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKSxcbiAgICAgICAgICB0MCA9IHRoaXMuX196b29tLFxuICAgICAgICAgIHAwID0gcCA9PSBudWxsID8gY2VudHJvaWQoZSkgOiB0eXBlb2YgcCA9PT0gXCJmdW5jdGlvblwiID8gcC5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDogcCxcbiAgICAgICAgICBwMSA9IHQwLmludmVydChwMCksXG4gICAgICAgICAgazEgPSB0eXBlb2YgayA9PT0gXCJmdW5jdGlvblwiID8gay5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDogaztcbiAgICAgIHJldHVybiBjb25zdHJhaW4odHJhbnNsYXRlKHNjYWxlKHQwLCBrMSksIHAwLCBwMSksIGUsIHRyYW5zbGF0ZUV4dGVudCk7XG4gICAgfSwgcCwgZXZlbnQpO1xuICB9O1xuXG4gIHpvb20udHJhbnNsYXRlQnkgPSBmdW5jdGlvbihzZWxlY3Rpb24sIHgsIHksIGV2ZW50KSB7XG4gICAgem9vbS50cmFuc2Zvcm0oc2VsZWN0aW9uLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjb25zdHJhaW4odGhpcy5fX3pvb20udHJhbnNsYXRlKFxuICAgICAgICB0eXBlb2YgeCA9PT0gXCJmdW5jdGlvblwiID8geC5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDogeCxcbiAgICAgICAgdHlwZW9mIHkgPT09IFwiZnVuY3Rpb25cIiA/IHkuYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IHlcbiAgICAgICksIGV4dGVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpLCB0cmFuc2xhdGVFeHRlbnQpO1xuICAgIH0sIG51bGwsIGV2ZW50KTtcbiAgfTtcblxuICB6b29tLnRyYW5zbGF0ZVRvID0gZnVuY3Rpb24oc2VsZWN0aW9uLCB4LCB5LCBwLCBldmVudCkge1xuICAgIHpvb20udHJhbnNmb3JtKHNlbGVjdGlvbiwgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZSA9IGV4dGVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpLFxuICAgICAgICAgIHQgPSB0aGlzLl9fem9vbSxcbiAgICAgICAgICBwMCA9IHAgPT0gbnVsbCA/IGNlbnRyb2lkKGUpIDogdHlwZW9mIHAgPT09IFwiZnVuY3Rpb25cIiA/IHAuYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IHA7XG4gICAgICByZXR1cm4gY29uc3RyYWluKGlkZW50aXR5LnRyYW5zbGF0ZShwMFswXSwgcDBbMV0pLnNjYWxlKHQuaykudHJhbnNsYXRlKFxuICAgICAgICB0eXBlb2YgeCA9PT0gXCJmdW5jdGlvblwiID8gLXguYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IC14LFxuICAgICAgICB0eXBlb2YgeSA9PT0gXCJmdW5jdGlvblwiID8gLXkuYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IC15XG4gICAgICApLCBlLCB0cmFuc2xhdGVFeHRlbnQpO1xuICAgIH0sIHAsIGV2ZW50KTtcbiAgfTtcblxuICBmdW5jdGlvbiBzY2FsZSh0cmFuc2Zvcm0sIGspIHtcbiAgICBrID0gTWF0aC5tYXgoc2NhbGVFeHRlbnRbMF0sIE1hdGgubWluKHNjYWxlRXh0ZW50WzFdLCBrKSk7XG4gICAgcmV0dXJuIGsgPT09IHRyYW5zZm9ybS5rID8gdHJhbnNmb3JtIDogbmV3IFRyYW5zZm9ybShrLCB0cmFuc2Zvcm0ueCwgdHJhbnNmb3JtLnkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJhbnNsYXRlKHRyYW5zZm9ybSwgcDAsIHAxKSB7XG4gICAgdmFyIHggPSBwMFswXSAtIHAxWzBdICogdHJhbnNmb3JtLmssIHkgPSBwMFsxXSAtIHAxWzFdICogdHJhbnNmb3JtLms7XG4gICAgcmV0dXJuIHggPT09IHRyYW5zZm9ybS54ICYmIHkgPT09IHRyYW5zZm9ybS55ID8gdHJhbnNmb3JtIDogbmV3IFRyYW5zZm9ybSh0cmFuc2Zvcm0uaywgeCwgeSk7XG4gIH1cblxuICBmdW5jdGlvbiBjZW50cm9pZChleHRlbnQpIHtcbiAgICByZXR1cm4gWygrZXh0ZW50WzBdWzBdICsgK2V4dGVudFsxXVswXSkgLyAyLCAoK2V4dGVudFswXVsxXSArICtleHRlbnRbMV1bMV0pIC8gMl07XG4gIH1cblxuICBmdW5jdGlvbiBzY2hlZHVsZSh0cmFuc2l0aW9uLCB0cmFuc2Zvcm0sIHBvaW50LCBldmVudCkge1xuICAgIHRyYW5zaXRpb25cbiAgICAgICAgLm9uKFwic3RhcnQuem9vbVwiLCBmdW5jdGlvbigpIHsgZ2VzdHVyZSh0aGlzLCBhcmd1bWVudHMpLmV2ZW50KGV2ZW50KS5zdGFydCgpOyB9KVxuICAgICAgICAub24oXCJpbnRlcnJ1cHQuem9vbSBlbmQuem9vbVwiLCBmdW5jdGlvbigpIHsgZ2VzdHVyZSh0aGlzLCBhcmd1bWVudHMpLmV2ZW50KGV2ZW50KS5lbmQoKTsgfSlcbiAgICAgICAgLnR3ZWVuKFwiem9vbVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgICAgICAgIGcgPSBnZXN0dXJlKHRoYXQsIGFyZ3MpLmV2ZW50KGV2ZW50KSxcbiAgICAgICAgICAgICAgZSA9IGV4dGVudC5hcHBseSh0aGF0LCBhcmdzKSxcbiAgICAgICAgICAgICAgcCA9IHBvaW50ID09IG51bGwgPyBjZW50cm9pZChlKSA6IHR5cGVvZiBwb2ludCA9PT0gXCJmdW5jdGlvblwiID8gcG9pbnQuYXBwbHkodGhhdCwgYXJncykgOiBwb2ludCxcbiAgICAgICAgICAgICAgdyA9IE1hdGgubWF4KGVbMV1bMF0gLSBlWzBdWzBdLCBlWzFdWzFdIC0gZVswXVsxXSksXG4gICAgICAgICAgICAgIGEgPSB0aGF0Ll9fem9vbSxcbiAgICAgICAgICAgICAgYiA9IHR5cGVvZiB0cmFuc2Zvcm0gPT09IFwiZnVuY3Rpb25cIiA/IHRyYW5zZm9ybS5hcHBseSh0aGF0LCBhcmdzKSA6IHRyYW5zZm9ybSxcbiAgICAgICAgICAgICAgaSA9IGludGVycG9sYXRlKGEuaW52ZXJ0KHApLmNvbmNhdCh3IC8gYS5rKSwgYi5pbnZlcnQocCkuY29uY2F0KHcgLyBiLmspKTtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgICAgICAgaWYgKHQgPT09IDEpIHQgPSBiOyAvLyBBdm9pZCByb3VuZGluZyBlcnJvciBvbiBlbmQuXG4gICAgICAgICAgICBlbHNlIHsgdmFyIGwgPSBpKHQpLCBrID0gdyAvIGxbMl07IHQgPSBuZXcgVHJhbnNmb3JtKGssIHBbMF0gLSBsWzBdICogaywgcFsxXSAtIGxbMV0gKiBrKTsgfVxuICAgICAgICAgICAgZy56b29tKG51bGwsIHQpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VzdHVyZSh0aGF0LCBhcmdzLCBjbGVhbikge1xuICAgIHJldHVybiAoIWNsZWFuICYmIHRoYXQuX196b29taW5nKSB8fCBuZXcgR2VzdHVyZSh0aGF0LCBhcmdzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIEdlc3R1cmUodGhhdCwgYXJncykge1xuICAgIHRoaXMudGhhdCA9IHRoYXQ7XG4gICAgdGhpcy5hcmdzID0gYXJncztcbiAgICB0aGlzLmFjdGl2ZSA9IDA7XG4gICAgdGhpcy5zb3VyY2VFdmVudCA9IG51bGw7XG4gICAgdGhpcy5leHRlbnQgPSBleHRlbnQuYXBwbHkodGhhdCwgYXJncyk7XG4gICAgdGhpcy50YXBzID0gMDtcbiAgfVxuXG4gIEdlc3R1cmUucHJvdG90eXBlID0ge1xuICAgIGV2ZW50OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKGV2ZW50KSB0aGlzLnNvdXJjZUV2ZW50ID0gZXZlbnQ7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgrK3RoaXMuYWN0aXZlID09PSAxKSB7XG4gICAgICAgIHRoaXMudGhhdC5fX3pvb21pbmcgPSB0aGlzO1xuICAgICAgICB0aGlzLmVtaXQoXCJzdGFydFwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgem9vbTogZnVuY3Rpb24oa2V5LCB0cmFuc2Zvcm0pIHtcbiAgICAgIGlmICh0aGlzLm1vdXNlICYmIGtleSAhPT0gXCJtb3VzZVwiKSB0aGlzLm1vdXNlWzFdID0gdHJhbnNmb3JtLmludmVydCh0aGlzLm1vdXNlWzBdKTtcbiAgICAgIGlmICh0aGlzLnRvdWNoMCAmJiBrZXkgIT09IFwidG91Y2hcIikgdGhpcy50b3VjaDBbMV0gPSB0cmFuc2Zvcm0uaW52ZXJ0KHRoaXMudG91Y2gwWzBdKTtcbiAgICAgIGlmICh0aGlzLnRvdWNoMSAmJiBrZXkgIT09IFwidG91Y2hcIikgdGhpcy50b3VjaDFbMV0gPSB0cmFuc2Zvcm0uaW52ZXJ0KHRoaXMudG91Y2gxWzBdKTtcbiAgICAgIHRoaXMudGhhdC5fX3pvb20gPSB0cmFuc2Zvcm07XG4gICAgICB0aGlzLmVtaXQoXCJ6b29tXCIpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBlbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGhpcy5hY3RpdmUgPT09IDApIHtcbiAgICAgICAgZGVsZXRlIHRoaXMudGhhdC5fX3pvb21pbmc7XG4gICAgICAgIHRoaXMuZW1pdChcImVuZFwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZW1pdDogZnVuY3Rpb24odHlwZSkge1xuICAgICAgdmFyIGQgPSBzZWxlY3QodGhpcy50aGF0KS5kYXR1bSgpO1xuICAgICAgbGlzdGVuZXJzLmNhbGwoXG4gICAgICAgIHR5cGUsXG4gICAgICAgIHRoaXMudGhhdCxcbiAgICAgICAgbmV3IFpvb21FdmVudCh0eXBlLCB7XG4gICAgICAgICAgc291cmNlRXZlbnQ6IHRoaXMuc291cmNlRXZlbnQsXG4gICAgICAgICAgdGFyZ2V0OiB6b29tLFxuICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgdHJhbnNmb3JtOiB0aGlzLnRoYXQuX196b29tLFxuICAgICAgICAgIGRpc3BhdGNoOiBsaXN0ZW5lcnNcbiAgICAgICAgfSksXG4gICAgICAgIGRcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIHdoZWVsZWQoZXZlbnQsIC4uLmFyZ3MpIHtcbiAgICBpZiAoIWZpbHRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpKSByZXR1cm47XG4gICAgdmFyIGcgPSBnZXN0dXJlKHRoaXMsIGFyZ3MpLmV2ZW50KGV2ZW50KSxcbiAgICAgICAgdCA9IHRoaXMuX196b29tLFxuICAgICAgICBrID0gTWF0aC5tYXgoc2NhbGVFeHRlbnRbMF0sIE1hdGgubWluKHNjYWxlRXh0ZW50WzFdLCB0LmsgKiBNYXRoLnBvdygyLCB3aGVlbERlbHRhLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpKSksXG4gICAgICAgIHAgPSBwb2ludGVyKGV2ZW50KTtcblxuICAgIC8vIElmIHRoZSBtb3VzZSBpcyBpbiB0aGUgc2FtZSBsb2NhdGlvbiBhcyBiZWZvcmUsIHJldXNlIGl0LlxuICAgIC8vIElmIHRoZXJlIHdlcmUgcmVjZW50IHdoZWVsIGV2ZW50cywgcmVzZXQgdGhlIHdoZWVsIGlkbGUgdGltZW91dC5cbiAgICBpZiAoZy53aGVlbCkge1xuICAgICAgaWYgKGcubW91c2VbMF1bMF0gIT09IHBbMF0gfHwgZy5tb3VzZVswXVsxXSAhPT0gcFsxXSkge1xuICAgICAgICBnLm1vdXNlWzFdID0gdC5pbnZlcnQoZy5tb3VzZVswXSA9IHApO1xuICAgICAgfVxuICAgICAgY2xlYXJUaW1lb3V0KGcud2hlZWwpO1xuICAgIH1cblxuICAgIC8vIElmIHRoaXMgd2hlZWwgZXZlbnQgd29u4oCZdCB0cmlnZ2VyIGEgdHJhbnNmb3JtIGNoYW5nZSwgaWdub3JlIGl0LlxuICAgIGVsc2UgaWYgKHQuayA9PT0gaykgcmV0dXJuO1xuXG4gICAgLy8gT3RoZXJ3aXNlLCBjYXB0dXJlIHRoZSBtb3VzZSBwb2ludCBhbmQgbG9jYXRpb24gYXQgdGhlIHN0YXJ0LlxuICAgIGVsc2Uge1xuICAgICAgZy5tb3VzZSA9IFtwLCB0LmludmVydChwKV07XG4gICAgICBpbnRlcnJ1cHQodGhpcyk7XG4gICAgICBnLnN0YXJ0KCk7XG4gICAgfVxuXG4gICAgbm9ldmVudChldmVudCk7XG4gICAgZy53aGVlbCA9IHNldFRpbWVvdXQod2hlZWxpZGxlZCwgd2hlZWxEZWxheSk7XG4gICAgZy56b29tKFwibW91c2VcIiwgY29uc3RyYWluKHRyYW5zbGF0ZShzY2FsZSh0LCBrKSwgZy5tb3VzZVswXSwgZy5tb3VzZVsxXSksIGcuZXh0ZW50LCB0cmFuc2xhdGVFeHRlbnQpKTtcblxuICAgIGZ1bmN0aW9uIHdoZWVsaWRsZWQoKSB7XG4gICAgICBnLndoZWVsID0gbnVsbDtcbiAgICAgIGcuZW5kKCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbW91c2Vkb3duZWQoZXZlbnQsIC4uLmFyZ3MpIHtcbiAgICBpZiAodG91Y2hlbmRpbmcgfHwgIWZpbHRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpKSByZXR1cm47XG4gICAgdmFyIGN1cnJlbnRUYXJnZXQgPSBldmVudC5jdXJyZW50VGFyZ2V0LFxuICAgICAgICBnID0gZ2VzdHVyZSh0aGlzLCBhcmdzLCB0cnVlKS5ldmVudChldmVudCksXG4gICAgICAgIHYgPSBzZWxlY3QoZXZlbnQudmlldykub24oXCJtb3VzZW1vdmUuem9vbVwiLCBtb3VzZW1vdmVkLCB0cnVlKS5vbihcIm1vdXNldXAuem9vbVwiLCBtb3VzZXVwcGVkLCB0cnVlKSxcbiAgICAgICAgcCA9IHBvaW50ZXIoZXZlbnQsIGN1cnJlbnRUYXJnZXQpLFxuICAgICAgICB4MCA9IGV2ZW50LmNsaWVudFgsXG4gICAgICAgIHkwID0gZXZlbnQuY2xpZW50WTtcblxuICAgIGRyYWdEaXNhYmxlKGV2ZW50LnZpZXcpO1xuICAgIG5vcHJvcGFnYXRpb24oZXZlbnQpO1xuICAgIGcubW91c2UgPSBbcCwgdGhpcy5fX3pvb20uaW52ZXJ0KHApXTtcbiAgICBpbnRlcnJ1cHQodGhpcyk7XG4gICAgZy5zdGFydCgpO1xuXG4gICAgZnVuY3Rpb24gbW91c2Vtb3ZlZChldmVudCkge1xuICAgICAgbm9ldmVudChldmVudCk7XG4gICAgICBpZiAoIWcubW92ZWQpIHtcbiAgICAgICAgdmFyIGR4ID0gZXZlbnQuY2xpZW50WCAtIHgwLCBkeSA9IGV2ZW50LmNsaWVudFkgLSB5MDtcbiAgICAgICAgZy5tb3ZlZCA9IGR4ICogZHggKyBkeSAqIGR5ID4gY2xpY2tEaXN0YW5jZTI7XG4gICAgICB9XG4gICAgICBnLmV2ZW50KGV2ZW50KVxuICAgICAgIC56b29tKFwibW91c2VcIiwgY29uc3RyYWluKHRyYW5zbGF0ZShnLnRoYXQuX196b29tLCBnLm1vdXNlWzBdID0gcG9pbnRlcihldmVudCwgY3VycmVudFRhcmdldCksIGcubW91c2VbMV0pLCBnLmV4dGVudCwgdHJhbnNsYXRlRXh0ZW50KSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbW91c2V1cHBlZChldmVudCkge1xuICAgICAgdi5vbihcIm1vdXNlbW92ZS56b29tIG1vdXNldXAuem9vbVwiLCBudWxsKTtcbiAgICAgIGRyYWdFbmFibGUoZXZlbnQudmlldywgZy5tb3ZlZCk7XG4gICAgICBub2V2ZW50KGV2ZW50KTtcbiAgICAgIGcuZXZlbnQoZXZlbnQpLmVuZCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRibGNsaWNrZWQoZXZlbnQsIC4uLmFyZ3MpIHtcbiAgICBpZiAoIWZpbHRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpKSByZXR1cm47XG4gICAgdmFyIHQwID0gdGhpcy5fX3pvb20sXG4gICAgICAgIHAwID0gcG9pbnRlcihldmVudC5jaGFuZ2VkVG91Y2hlcyA/IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdIDogZXZlbnQsIHRoaXMpLFxuICAgICAgICBwMSA9IHQwLmludmVydChwMCksXG4gICAgICAgIGsxID0gdDAuayAqIChldmVudC5zaGlmdEtleSA/IDAuNSA6IDIpLFxuICAgICAgICB0MSA9IGNvbnN0cmFpbih0cmFuc2xhdGUoc2NhbGUodDAsIGsxKSwgcDAsIHAxKSwgZXh0ZW50LmFwcGx5KHRoaXMsIGFyZ3MpLCB0cmFuc2xhdGVFeHRlbnQpO1xuXG4gICAgbm9ldmVudChldmVudCk7XG4gICAgaWYgKGR1cmF0aW9uID4gMCkgc2VsZWN0KHRoaXMpLnRyYW5zaXRpb24oKS5kdXJhdGlvbihkdXJhdGlvbikuY2FsbChzY2hlZHVsZSwgdDEsIHAwLCBldmVudCk7XG4gICAgZWxzZSBzZWxlY3QodGhpcykuY2FsbCh6b29tLnRyYW5zZm9ybSwgdDEsIHAwLCBldmVudCk7XG4gIH1cblxuICBmdW5jdGlvbiB0b3VjaHN0YXJ0ZWQoZXZlbnQsIC4uLmFyZ3MpIHtcbiAgICBpZiAoIWZpbHRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpKSByZXR1cm47XG4gICAgdmFyIHRvdWNoZXMgPSBldmVudC50b3VjaGVzLFxuICAgICAgICBuID0gdG91Y2hlcy5sZW5ndGgsXG4gICAgICAgIGcgPSBnZXN0dXJlKHRoaXMsIGFyZ3MsIGV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aCA9PT0gbikuZXZlbnQoZXZlbnQpLFxuICAgICAgICBzdGFydGVkLCBpLCB0LCBwO1xuXG4gICAgbm9wcm9wYWdhdGlvbihldmVudCk7XG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgdCA9IHRvdWNoZXNbaV0sIHAgPSBwb2ludGVyKHQsIHRoaXMpO1xuICAgICAgcCA9IFtwLCB0aGlzLl9fem9vbS5pbnZlcnQocCksIHQuaWRlbnRpZmllcl07XG4gICAgICBpZiAoIWcudG91Y2gwKSBnLnRvdWNoMCA9IHAsIHN0YXJ0ZWQgPSB0cnVlLCBnLnRhcHMgPSAxICsgISF0b3VjaHN0YXJ0aW5nO1xuICAgICAgZWxzZSBpZiAoIWcudG91Y2gxICYmIGcudG91Y2gwWzJdICE9PSBwWzJdKSBnLnRvdWNoMSA9IHAsIGcudGFwcyA9IDA7XG4gICAgfVxuXG4gICAgaWYgKHRvdWNoc3RhcnRpbmcpIHRvdWNoc3RhcnRpbmcgPSBjbGVhclRpbWVvdXQodG91Y2hzdGFydGluZyk7XG5cbiAgICBpZiAoc3RhcnRlZCkge1xuICAgICAgaWYgKGcudGFwcyA8IDIpIHRvdWNoZmlyc3QgPSBwWzBdLCB0b3VjaHN0YXJ0aW5nID0gc2V0VGltZW91dChmdW5jdGlvbigpIHsgdG91Y2hzdGFydGluZyA9IG51bGw7IH0sIHRvdWNoRGVsYXkpO1xuICAgICAgaW50ZXJydXB0KHRoaXMpO1xuICAgICAgZy5zdGFydCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRvdWNobW92ZWQoZXZlbnQsIC4uLmFyZ3MpIHtcbiAgICBpZiAoIXRoaXMuX196b29taW5nKSByZXR1cm47XG4gICAgdmFyIGcgPSBnZXN0dXJlKHRoaXMsIGFyZ3MpLmV2ZW50KGV2ZW50KSxcbiAgICAgICAgdG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzLFxuICAgICAgICBuID0gdG91Y2hlcy5sZW5ndGgsIGksIHQsIHAsIGw7XG5cbiAgICBub2V2ZW50KGV2ZW50KTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICB0ID0gdG91Y2hlc1tpXSwgcCA9IHBvaW50ZXIodCwgdGhpcyk7XG4gICAgICBpZiAoZy50b3VjaDAgJiYgZy50b3VjaDBbMl0gPT09IHQuaWRlbnRpZmllcikgZy50b3VjaDBbMF0gPSBwO1xuICAgICAgZWxzZSBpZiAoZy50b3VjaDEgJiYgZy50b3VjaDFbMl0gPT09IHQuaWRlbnRpZmllcikgZy50b3VjaDFbMF0gPSBwO1xuICAgIH1cbiAgICB0ID0gZy50aGF0Ll9fem9vbTtcbiAgICBpZiAoZy50b3VjaDEpIHtcbiAgICAgIHZhciBwMCA9IGcudG91Y2gwWzBdLCBsMCA9IGcudG91Y2gwWzFdLFxuICAgICAgICAgIHAxID0gZy50b3VjaDFbMF0sIGwxID0gZy50b3VjaDFbMV0sXG4gICAgICAgICAgZHAgPSAoZHAgPSBwMVswXSAtIHAwWzBdKSAqIGRwICsgKGRwID0gcDFbMV0gLSBwMFsxXSkgKiBkcCxcbiAgICAgICAgICBkbCA9IChkbCA9IGwxWzBdIC0gbDBbMF0pICogZGwgKyAoZGwgPSBsMVsxXSAtIGwwWzFdKSAqIGRsO1xuICAgICAgdCA9IHNjYWxlKHQsIE1hdGguc3FydChkcCAvIGRsKSk7XG4gICAgICBwID0gWyhwMFswXSArIHAxWzBdKSAvIDIsIChwMFsxXSArIHAxWzFdKSAvIDJdO1xuICAgICAgbCA9IFsobDBbMF0gKyBsMVswXSkgLyAyLCAobDBbMV0gKyBsMVsxXSkgLyAyXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZy50b3VjaDApIHAgPSBnLnRvdWNoMFswXSwgbCA9IGcudG91Y2gwWzFdO1xuICAgIGVsc2UgcmV0dXJuO1xuXG4gICAgZy56b29tKFwidG91Y2hcIiwgY29uc3RyYWluKHRyYW5zbGF0ZSh0LCBwLCBsKSwgZy5leHRlbnQsIHRyYW5zbGF0ZUV4dGVudCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdG91Y2hlbmRlZChldmVudCwgLi4uYXJncykge1xuICAgIGlmICghdGhpcy5fX3pvb21pbmcpIHJldHVybjtcbiAgICB2YXIgZyA9IGdlc3R1cmUodGhpcywgYXJncykuZXZlbnQoZXZlbnQpLFxuICAgICAgICB0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXMsXG4gICAgICAgIG4gPSB0b3VjaGVzLmxlbmd0aCwgaSwgdDtcblxuICAgIG5vcHJvcGFnYXRpb24oZXZlbnQpO1xuICAgIGlmICh0b3VjaGVuZGluZykgY2xlYXJUaW1lb3V0KHRvdWNoZW5kaW5nKTtcbiAgICB0b3VjaGVuZGluZyA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHRvdWNoZW5kaW5nID0gbnVsbDsgfSwgdG91Y2hEZWxheSk7XG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgdCA9IHRvdWNoZXNbaV07XG4gICAgICBpZiAoZy50b3VjaDAgJiYgZy50b3VjaDBbMl0gPT09IHQuaWRlbnRpZmllcikgZGVsZXRlIGcudG91Y2gwO1xuICAgICAgZWxzZSBpZiAoZy50b3VjaDEgJiYgZy50b3VjaDFbMl0gPT09IHQuaWRlbnRpZmllcikgZGVsZXRlIGcudG91Y2gxO1xuICAgIH1cbiAgICBpZiAoZy50b3VjaDEgJiYgIWcudG91Y2gwKSBnLnRvdWNoMCA9IGcudG91Y2gxLCBkZWxldGUgZy50b3VjaDE7XG4gICAgaWYgKGcudG91Y2gwKSBnLnRvdWNoMFsxXSA9IHRoaXMuX196b29tLmludmVydChnLnRvdWNoMFswXSk7XG4gICAgZWxzZSB7XG4gICAgICBnLmVuZCgpO1xuICAgICAgLy8gSWYgdGhpcyB3YXMgYSBkYmx0YXAsIHJlcm91dGUgdG8gdGhlIChvcHRpb25hbCkgZGJsY2xpY2suem9vbSBoYW5kbGVyLlxuICAgICAgaWYgKGcudGFwcyA9PT0gMikge1xuICAgICAgICB0ID0gcG9pbnRlcih0LCB0aGlzKTtcbiAgICAgICAgaWYgKE1hdGguaHlwb3QodG91Y2hmaXJzdFswXSAtIHRbMF0sIHRvdWNoZmlyc3RbMV0gLSB0WzFdKSA8IHRhcERpc3RhbmNlKSB7XG4gICAgICAgICAgdmFyIHAgPSBzZWxlY3QodGhpcykub24oXCJkYmxjbGljay56b29tXCIpO1xuICAgICAgICAgIGlmIChwKSBwLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB6b29tLndoZWVsRGVsdGEgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAod2hlZWxEZWx0YSA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCB6b29tKSA6IHdoZWVsRGVsdGE7XG4gIH07XG5cbiAgem9vbS5maWx0ZXIgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZmlsdGVyID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCghIV8pLCB6b29tKSA6IGZpbHRlcjtcbiAgfTtcblxuICB6b29tLnRvdWNoYWJsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh0b3VjaGFibGUgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCEhXyksIHpvb20pIDogdG91Y2hhYmxlO1xuICB9O1xuXG4gIHpvb20uZXh0ZW50ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGV4dGVudCA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoW1srX1swXVswXSwgK19bMF1bMV1dLCBbK19bMV1bMF0sICtfWzFdWzFdXV0pLCB6b29tKSA6IGV4dGVudDtcbiAgfTtcblxuICB6b29tLnNjYWxlRXh0ZW50ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHNjYWxlRXh0ZW50WzBdID0gK19bMF0sIHNjYWxlRXh0ZW50WzFdID0gK19bMV0sIHpvb20pIDogW3NjYWxlRXh0ZW50WzBdLCBzY2FsZUV4dGVudFsxXV07XG4gIH07XG5cbiAgem9vbS50cmFuc2xhdGVFeHRlbnQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodHJhbnNsYXRlRXh0ZW50WzBdWzBdID0gK19bMF1bMF0sIHRyYW5zbGF0ZUV4dGVudFsxXVswXSA9ICtfWzFdWzBdLCB0cmFuc2xhdGVFeHRlbnRbMF1bMV0gPSArX1swXVsxXSwgdHJhbnNsYXRlRXh0ZW50WzFdWzFdID0gK19bMV1bMV0sIHpvb20pIDogW1t0cmFuc2xhdGVFeHRlbnRbMF1bMF0sIHRyYW5zbGF0ZUV4dGVudFswXVsxXV0sIFt0cmFuc2xhdGVFeHRlbnRbMV1bMF0sIHRyYW5zbGF0ZUV4dGVudFsxXVsxXV1dO1xuICB9O1xuXG4gIHpvb20uY29uc3RyYWluID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGNvbnN0cmFpbiA9IF8sIHpvb20pIDogY29uc3RyYWluO1xuICB9O1xuXG4gIHpvb20uZHVyYXRpb24gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZHVyYXRpb24gPSArXywgem9vbSkgOiBkdXJhdGlvbjtcbiAgfTtcblxuICB6b29tLmludGVycG9sYXRlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGludGVycG9sYXRlID0gXywgem9vbSkgOiBpbnRlcnBvbGF0ZTtcbiAgfTtcblxuICB6b29tLm9uID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlID0gbGlzdGVuZXJzLm9uLmFwcGx5KGxpc3RlbmVycywgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdmFsdWUgPT09IGxpc3RlbmVycyA/IHpvb20gOiB2YWx1ZTtcbiAgfTtcblxuICB6b29tLmNsaWNrRGlzdGFuY2UgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoY2xpY2tEaXN0YW5jZTIgPSAoXyA9ICtfKSAqIF8sIHpvb20pIDogTWF0aC5zcXJ0KGNsaWNrRGlzdGFuY2UyKTtcbiAgfTtcblxuICB6b29tLnRhcERpc3RhbmNlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHRhcERpc3RhbmNlID0gK18sIHpvb20pIDogdGFwRGlzdGFuY2U7XG4gIH07XG5cbiAgcmV0dXJuIHpvb207XG59XG4iLCJleHBvcnQge2RlZmF1bHQgYXMgem9vbX0gZnJvbSBcIi4vem9vbS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHpvb21UcmFuc2Zvcm0sIGlkZW50aXR5IGFzIHpvb21JZGVudGl0eSwgVHJhbnNmb3JtIGFzIFpvb21UcmFuc2Zvcm19IGZyb20gXCIuL3RyYW5zZm9ybS5qc1wiO1xuIiwiZXhwb3J0ICogZnJvbSBcImQzLWFycmF5XCI7XG5leHBvcnQgKiBmcm9tIFwiZDMtYXhpc1wiO1xuZXhwb3J0ICogZnJvbSBcImQzLWJydXNoXCI7XG5leHBvcnQgKiBmcm9tIFwiZDMtY2hvcmRcIjtcbmV4cG9ydCAqIGZyb20gXCJkMy1jb2xvclwiO1xuZXhwb3J0ICogZnJvbSBcImQzLWNvbnRvdXJcIjtcbmV4cG9ydCAqIGZyb20gXCJkMy1kZWxhdW5heVwiO1xuZXhwb3J0ICogZnJvbSBcImQzLWRpc3BhdGNoXCI7XG5leHBvcnQgKiBmcm9tIFwiZDMtZHJhZ1wiO1xuZXhwb3J0ICogZnJvbSBcImQzLWRzdlwiO1xuZXhwb3J0ICogZnJvbSBcImQzLWVhc2VcIjtcbmV4cG9ydCAqIGZyb20gXCJkMy1mZXRjaFwiO1xuZXhwb3J0ICogZnJvbSBcImQzLWZvcmNlXCI7XG5leHBvcnQgKiBmcm9tIFwiZDMtZm9ybWF0XCI7XG5leHBvcnQgKiBmcm9tIFwiZDMtZ2VvXCI7XG5leHBvcnQgKiBmcm9tIFwiZDMtaGllcmFyY2h5XCI7XG5leHBvcnQgKiBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcbmV4cG9ydCAqIGZyb20gXCJkMy1wYXRoXCI7XG5leHBvcnQgKiBmcm9tIFwiZDMtcG9seWdvblwiO1xuZXhwb3J0ICogZnJvbSBcImQzLXF1YWR0cmVlXCI7XG5leHBvcnQgKiBmcm9tIFwiZDMtcmFuZG9tXCI7XG5leHBvcnQgKiBmcm9tIFwiZDMtc2NhbGVcIjtcbmV4cG9ydCAqIGZyb20gXCJkMy1zY2FsZS1jaHJvbWF0aWNcIjtcbmV4cG9ydCAqIGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmV4cG9ydCAqIGZyb20gXCJkMy1zaGFwZVwiO1xuZXhwb3J0ICogZnJvbSBcImQzLXRpbWVcIjtcbmV4cG9ydCAqIGZyb20gXCJkMy10aW1lLWZvcm1hdFwiO1xuZXhwb3J0ICogZnJvbSBcImQzLXRpbWVyXCI7XG5leHBvcnQgKiBmcm9tIFwiZDMtdHJhbnNpdGlvblwiO1xuZXhwb3J0ICogZnJvbSBcImQzLXpvb21cIjtcbiIsImltcG9ydCB7ZGlzcGF0Y2h9IGZyb20gXCJkMy1kaXNwYXRjaFwiO1xuaW1wb3J0IHt0aW1lciwgdGltZW91dH0gZnJvbSBcImQzLXRpbWVyXCI7XG5cbnZhciBlbXB0eU9uID0gZGlzcGF0Y2goXCJzdGFydFwiLCBcImVuZFwiLCBcImNhbmNlbFwiLCBcImludGVycnVwdFwiKTtcbnZhciBlbXB0eVR3ZWVuID0gW107XG5cbmV4cG9ydCB2YXIgQ1JFQVRFRCA9IDA7XG5leHBvcnQgdmFyIFNDSEVEVUxFRCA9IDE7XG5leHBvcnQgdmFyIFNUQVJUSU5HID0gMjtcbmV4cG9ydCB2YXIgU1RBUlRFRCA9IDM7XG5leHBvcnQgdmFyIFJVTk5JTkcgPSA0O1xuZXhwb3J0IHZhciBFTkRJTkcgPSA1O1xuZXhwb3J0IHZhciBFTkRFRCA9IDY7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5vZGUsIG5hbWUsIGlkLCBpbmRleCwgZ3JvdXAsIHRpbWluZykge1xuICB2YXIgc2NoZWR1bGVzID0gbm9kZS5fX3RyYW5zaXRpb247XG4gIGlmICghc2NoZWR1bGVzKSBub2RlLl9fdHJhbnNpdGlvbiA9IHt9O1xuICBlbHNlIGlmIChpZCBpbiBzY2hlZHVsZXMpIHJldHVybjtcbiAgY3JlYXRlKG5vZGUsIGlkLCB7XG4gICAgbmFtZTogbmFtZSxcbiAgICBpbmRleDogaW5kZXgsIC8vIEZvciBjb250ZXh0IGR1cmluZyBjYWxsYmFjay5cbiAgICBncm91cDogZ3JvdXAsIC8vIEZvciBjb250ZXh0IGR1cmluZyBjYWxsYmFjay5cbiAgICBvbjogZW1wdHlPbixcbiAgICB0d2VlbjogZW1wdHlUd2VlbixcbiAgICB0aW1lOiB0aW1pbmcudGltZSxcbiAgICBkZWxheTogdGltaW5nLmRlbGF5LFxuICAgIGR1cmF0aW9uOiB0aW1pbmcuZHVyYXRpb24sXG4gICAgZWFzZTogdGltaW5nLmVhc2UsXG4gICAgdGltZXI6IG51bGwsXG4gICAgc3RhdGU6IENSRUFURURcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0KG5vZGUsIGlkKSB7XG4gIHZhciBzY2hlZHVsZSA9IGdldChub2RlLCBpZCk7XG4gIGlmIChzY2hlZHVsZS5zdGF0ZSA+IENSRUFURUQpIHRocm93IG5ldyBFcnJvcihcInRvbyBsYXRlOyBhbHJlYWR5IHNjaGVkdWxlZFwiKTtcbiAgcmV0dXJuIHNjaGVkdWxlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0KG5vZGUsIGlkKSB7XG4gIHZhciBzY2hlZHVsZSA9IGdldChub2RlLCBpZCk7XG4gIGlmIChzY2hlZHVsZS5zdGF0ZSA+IFNUQVJURUQpIHRocm93IG5ldyBFcnJvcihcInRvbyBsYXRlOyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gIHJldHVybiBzY2hlZHVsZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldChub2RlLCBpZCkge1xuICB2YXIgc2NoZWR1bGUgPSBub2RlLl9fdHJhbnNpdGlvbjtcbiAgaWYgKCFzY2hlZHVsZSB8fCAhKHNjaGVkdWxlID0gc2NoZWR1bGVbaWRdKSkgdGhyb3cgbmV3IEVycm9yKFwidHJhbnNpdGlvbiBub3QgZm91bmRcIik7XG4gIHJldHVybiBzY2hlZHVsZTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlKG5vZGUsIGlkLCBzZWxmKSB7XG4gIHZhciBzY2hlZHVsZXMgPSBub2RlLl9fdHJhbnNpdGlvbixcbiAgICAgIHR3ZWVuO1xuXG4gIC8vIEluaXRpYWxpemUgdGhlIHNlbGYgdGltZXIgd2hlbiB0aGUgdHJhbnNpdGlvbiBpcyBjcmVhdGVkLlxuICAvLyBOb3RlIHRoZSBhY3R1YWwgZGVsYXkgaXMgbm90IGtub3duIHVudGlsIHRoZSBmaXJzdCBjYWxsYmFjayFcbiAgc2NoZWR1bGVzW2lkXSA9IHNlbGY7XG4gIHNlbGYudGltZXIgPSB0aW1lcihzY2hlZHVsZSwgMCwgc2VsZi50aW1lKTtcblxuICBmdW5jdGlvbiBzY2hlZHVsZShlbGFwc2VkKSB7XG4gICAgc2VsZi5zdGF0ZSA9IFNDSEVEVUxFRDtcbiAgICBzZWxmLnRpbWVyLnJlc3RhcnQoc3RhcnQsIHNlbGYuZGVsYXksIHNlbGYudGltZSk7XG5cbiAgICAvLyBJZiB0aGUgZWxhcHNlZCBkZWxheSBpcyBsZXNzIHRoYW4gb3VyIGZpcnN0IHNsZWVwLCBzdGFydCBpbW1lZGlhdGVseS5cbiAgICBpZiAoc2VsZi5kZWxheSA8PSBlbGFwc2VkKSBzdGFydChlbGFwc2VkIC0gc2VsZi5kZWxheSk7XG4gIH1cblxuICBmdW5jdGlvbiBzdGFydChlbGFwc2VkKSB7XG4gICAgdmFyIGksIGosIG4sIG87XG5cbiAgICAvLyBJZiB0aGUgc3RhdGUgaXMgbm90IFNDSEVEVUxFRCwgdGhlbiB3ZSBwcmV2aW91c2x5IGVycm9yZWQgb24gc3RhcnQuXG4gICAgaWYgKHNlbGYuc3RhdGUgIT09IFNDSEVEVUxFRCkgcmV0dXJuIHN0b3AoKTtcblxuICAgIGZvciAoaSBpbiBzY2hlZHVsZXMpIHtcbiAgICAgIG8gPSBzY2hlZHVsZXNbaV07XG4gICAgICBpZiAoby5uYW1lICE9PSBzZWxmLm5hbWUpIGNvbnRpbnVlO1xuXG4gICAgICAvLyBXaGlsZSB0aGlzIGVsZW1lbnQgYWxyZWFkeSBoYXMgYSBzdGFydGluZyB0cmFuc2l0aW9uIGR1cmluZyB0aGlzIGZyYW1lLFxuICAgICAgLy8gZGVmZXIgc3RhcnRpbmcgYW4gaW50ZXJydXB0aW5nIHRyYW5zaXRpb24gdW50aWwgdGhhdCB0cmFuc2l0aW9uIGhhcyBhXG4gICAgICAvLyBjaGFuY2UgdG8gdGljayAoYW5kIHBvc3NpYmx5IGVuZCk7IHNlZSBkMy9kMy10cmFuc2l0aW9uIzU0IVxuICAgICAgaWYgKG8uc3RhdGUgPT09IFNUQVJURUQpIHJldHVybiB0aW1lb3V0KHN0YXJ0KTtcblxuICAgICAgLy8gSW50ZXJydXB0IHRoZSBhY3RpdmUgdHJhbnNpdGlvbiwgaWYgYW55LlxuICAgICAgaWYgKG8uc3RhdGUgPT09IFJVTk5JTkcpIHtcbiAgICAgICAgby5zdGF0ZSA9IEVOREVEO1xuICAgICAgICBvLnRpbWVyLnN0b3AoKTtcbiAgICAgICAgby5vbi5jYWxsKFwiaW50ZXJydXB0XCIsIG5vZGUsIG5vZGUuX19kYXRhX18sIG8uaW5kZXgsIG8uZ3JvdXApO1xuICAgICAgICBkZWxldGUgc2NoZWR1bGVzW2ldO1xuICAgICAgfVxuXG4gICAgICAvLyBDYW5jZWwgYW55IHByZS1lbXB0ZWQgdHJhbnNpdGlvbnMuXG4gICAgICBlbHNlIGlmICgraSA8IGlkKSB7XG4gICAgICAgIG8uc3RhdGUgPSBFTkRFRDtcbiAgICAgICAgby50aW1lci5zdG9wKCk7XG4gICAgICAgIG8ub24uY2FsbChcImNhbmNlbFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBvLmluZGV4LCBvLmdyb3VwKTtcbiAgICAgICAgZGVsZXRlIHNjaGVkdWxlc1tpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZWZlciB0aGUgZmlyc3QgdGljayB0byBlbmQgb2YgdGhlIGN1cnJlbnQgZnJhbWU7IHNlZSBkMy9kMyMxNTc2LlxuICAgIC8vIE5vdGUgdGhlIHRyYW5zaXRpb24gbWF5IGJlIGNhbmNlbGVkIGFmdGVyIHN0YXJ0IGFuZCBiZWZvcmUgdGhlIGZpcnN0IHRpY2shXG4gICAgLy8gTm90ZSB0aGlzIG11c3QgYmUgc2NoZWR1bGVkIGJlZm9yZSB0aGUgc3RhcnQgZXZlbnQ7IHNlZSBkMy9kMy10cmFuc2l0aW9uIzE2IVxuICAgIC8vIEFzc3VtaW5nIHRoaXMgaXMgc3VjY2Vzc2Z1bCwgc3Vic2VxdWVudCBjYWxsYmFja3MgZ28gc3RyYWlnaHQgdG8gdGljay5cbiAgICB0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHNlbGYuc3RhdGUgPT09IFNUQVJURUQpIHtcbiAgICAgICAgc2VsZi5zdGF0ZSA9IFJVTk5JTkc7XG4gICAgICAgIHNlbGYudGltZXIucmVzdGFydCh0aWNrLCBzZWxmLmRlbGF5LCBzZWxmLnRpbWUpO1xuICAgICAgICB0aWNrKGVsYXBzZWQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gRGlzcGF0Y2ggdGhlIHN0YXJ0IGV2ZW50LlxuICAgIC8vIE5vdGUgdGhpcyBtdXN0IGJlIGRvbmUgYmVmb3JlIHRoZSB0d2VlbiBhcmUgaW5pdGlhbGl6ZWQuXG4gICAgc2VsZi5zdGF0ZSA9IFNUQVJUSU5HO1xuICAgIHNlbGYub24uY2FsbChcInN0YXJ0XCIsIG5vZGUsIG5vZGUuX19kYXRhX18sIHNlbGYuaW5kZXgsIHNlbGYuZ3JvdXApO1xuICAgIGlmIChzZWxmLnN0YXRlICE9PSBTVEFSVElORykgcmV0dXJuOyAvLyBpbnRlcnJ1cHRlZFxuICAgIHNlbGYuc3RhdGUgPSBTVEFSVEVEO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgdHdlZW4sIGRlbGV0aW5nIG51bGwgdHdlZW4uXG4gICAgdHdlZW4gPSBuZXcgQXJyYXkobiA9IHNlbGYudHdlZW4ubGVuZ3RoKTtcbiAgICBmb3IgKGkgPSAwLCBqID0gLTE7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChvID0gc2VsZi50d2VlbltpXS52YWx1ZS5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIHNlbGYuaW5kZXgsIHNlbGYuZ3JvdXApKSB7XG4gICAgICAgIHR3ZWVuWysral0gPSBvO1xuICAgICAgfVxuICAgIH1cbiAgICB0d2Vlbi5sZW5ndGggPSBqICsgMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRpY2soZWxhcHNlZCkge1xuICAgIHZhciB0ID0gZWxhcHNlZCA8IHNlbGYuZHVyYXRpb24gPyBzZWxmLmVhc2UuY2FsbChudWxsLCBlbGFwc2VkIC8gc2VsZi5kdXJhdGlvbikgOiAoc2VsZi50aW1lci5yZXN0YXJ0KHN0b3ApLCBzZWxmLnN0YXRlID0gRU5ESU5HLCAxKSxcbiAgICAgICAgaSA9IC0xLFxuICAgICAgICBuID0gdHdlZW4ubGVuZ3RoO1xuXG4gICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgIHR3ZWVuW2ldLmNhbGwobm9kZSwgdCk7XG4gICAgfVxuXG4gICAgLy8gRGlzcGF0Y2ggdGhlIGVuZCBldmVudC5cbiAgICBpZiAoc2VsZi5zdGF0ZSA9PT0gRU5ESU5HKSB7XG4gICAgICBzZWxmLm9uLmNhbGwoXCJlbmRcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgc2VsZi5pbmRleCwgc2VsZi5ncm91cCk7XG4gICAgICBzdG9wKCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc3RvcCgpIHtcbiAgICBzZWxmLnN0YXRlID0gRU5ERUQ7XG4gICAgc2VsZi50aW1lci5zdG9wKCk7XG4gICAgZGVsZXRlIHNjaGVkdWxlc1tpZF07XG4gICAgZm9yICh2YXIgaSBpbiBzY2hlZHVsZXMpIHJldHVybjsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIGRlbGV0ZSBub2RlLl9fdHJhbnNpdGlvbjtcbiAgfVxufVxuIiwiaW1wb3J0IHtTVEFSVElORywgRU5ESU5HLCBFTkRFRH0gZnJvbSBcIi4vdHJhbnNpdGlvbi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihub2RlLCBuYW1lKSB7XG4gIHZhciBzY2hlZHVsZXMgPSBub2RlLl9fdHJhbnNpdGlvbixcbiAgICAgIHNjaGVkdWxlLFxuICAgICAgYWN0aXZlLFxuICAgICAgZW1wdHkgPSB0cnVlLFxuICAgICAgaTtcblxuICBpZiAoIXNjaGVkdWxlcykgcmV0dXJuO1xuXG4gIG5hbWUgPSBuYW1lID09IG51bGwgPyBudWxsIDogbmFtZSArIFwiXCI7XG5cbiAgZm9yIChpIGluIHNjaGVkdWxlcykge1xuICAgIGlmICgoc2NoZWR1bGUgPSBzY2hlZHVsZXNbaV0pLm5hbWUgIT09IG5hbWUpIHsgZW1wdHkgPSBmYWxzZTsgY29udGludWU7IH1cbiAgICBhY3RpdmUgPSBzY2hlZHVsZS5zdGF0ZSA+IFNUQVJUSU5HICYmIHNjaGVkdWxlLnN0YXRlIDwgRU5ESU5HO1xuICAgIHNjaGVkdWxlLnN0YXRlID0gRU5ERUQ7XG4gICAgc2NoZWR1bGUudGltZXIuc3RvcCgpO1xuICAgIHNjaGVkdWxlLm9uLmNhbGwoYWN0aXZlID8gXCJpbnRlcnJ1cHRcIiA6IFwiY2FuY2VsXCIsIG5vZGUsIG5vZGUuX19kYXRhX18sIHNjaGVkdWxlLmluZGV4LCBzY2hlZHVsZS5ncm91cCk7XG4gICAgZGVsZXRlIHNjaGVkdWxlc1tpXTtcbiAgfVxuXG4gIGlmIChlbXB0eSkgZGVsZXRlIG5vZGUuX190cmFuc2l0aW9uO1xufVxuIiwiaW1wb3J0IGludGVycnVwdCBmcm9tIFwiLi4vaW50ZXJydXB0LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICBpbnRlcnJ1cHQodGhpcywgbmFtZSk7XG4gIH0pO1xufVxuIiwiaW1wb3J0IHtnZXQsIHNldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gdHdlZW5SZW1vdmUoaWQsIG5hbWUpIHtcbiAgdmFyIHR3ZWVuMCwgdHdlZW4xO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKSxcbiAgICAgICAgdHdlZW4gPSBzY2hlZHVsZS50d2VlbjtcblxuICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgdHdlZW4gd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAvLyBqdXN0IGFzc2lnbiB0aGUgdXBkYXRlZCBzaGFyZWQgdHdlZW4gYW5kIHdl4oCZcmUgZG9uZSFcbiAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgaWYgKHR3ZWVuICE9PSB0d2VlbjApIHtcbiAgICAgIHR3ZWVuMSA9IHR3ZWVuMCA9IHR3ZWVuO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSB0d2VlbjEubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIGlmICh0d2VlbjFbaV0ubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICAgIHR3ZWVuMSA9IHR3ZWVuMS5zbGljZSgpO1xuICAgICAgICAgIHR3ZWVuMS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBzY2hlZHVsZS50d2VlbiA9IHR3ZWVuMTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdHdlZW5GdW5jdGlvbihpZCwgbmFtZSwgdmFsdWUpIHtcbiAgdmFyIHR3ZWVuMCwgdHdlZW4xO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCksXG4gICAgICAgIHR3ZWVuID0gc2NoZWR1bGUudHdlZW47XG5cbiAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIHR3ZWVuIHdpdGggdGhlIHByZXZpb3VzIG5vZGUsXG4gICAgLy8ganVzdCBhc3NpZ24gdGhlIHVwZGF0ZWQgc2hhcmVkIHR3ZWVuIGFuZCB3ZeKAmXJlIGRvbmUhXG4gICAgLy8gT3RoZXJ3aXNlLCBjb3B5LW9uLXdyaXRlLlxuICAgIGlmICh0d2VlbiAhPT0gdHdlZW4wKSB7XG4gICAgICB0d2VlbjEgPSAodHdlZW4wID0gdHdlZW4pLnNsaWNlKCk7XG4gICAgICBmb3IgKHZhciB0ID0ge25hbWU6IG5hbWUsIHZhbHVlOiB2YWx1ZX0sIGkgPSAwLCBuID0gdHdlZW4xLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgICBpZiAodHdlZW4xW2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICB0d2VlbjFbaV0gPSB0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaSA9PT0gbikgdHdlZW4xLnB1c2godCk7XG4gICAgfVxuXG4gICAgc2NoZWR1bGUudHdlZW4gPSB0d2VlbjE7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHZhciBpZCA9IHRoaXMuX2lkO1xuXG4gIG5hbWUgKz0gXCJcIjtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICB2YXIgdHdlZW4gPSBnZXQodGhpcy5ub2RlKCksIGlkKS50d2VlbjtcbiAgICBmb3IgKHZhciBpID0gMCwgbiA9IHR3ZWVuLmxlbmd0aCwgdDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKCh0ID0gdHdlZW5baV0pLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHQudmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZWFjaCgodmFsdWUgPT0gbnVsbCA/IHR3ZWVuUmVtb3ZlIDogdHdlZW5GdW5jdGlvbikoaWQsIG5hbWUsIHZhbHVlKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0d2VlblZhbHVlKHRyYW5zaXRpb24sIG5hbWUsIHZhbHVlKSB7XG4gIHZhciBpZCA9IHRyYW5zaXRpb24uX2lkO1xuXG4gIHRyYW5zaXRpb24uZWFjaChmdW5jdGlvbigpIHtcbiAgICB2YXIgc2NoZWR1bGUgPSBzZXQodGhpcywgaWQpO1xuICAgIChzY2hlZHVsZS52YWx1ZSB8fCAoc2NoZWR1bGUudmFsdWUgPSB7fSkpW25hbWVdID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICByZXR1cm4gZ2V0KG5vZGUsIGlkKS52YWx1ZVtuYW1lXTtcbiAgfTtcbn1cbiIsImltcG9ydCB7Y29sb3J9IGZyb20gXCJkMy1jb2xvclwiO1xuaW1wb3J0IHtpbnRlcnBvbGF0ZU51bWJlciwgaW50ZXJwb2xhdGVSZ2IsIGludGVycG9sYXRlU3RyaW5nfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgYztcbiAgcmV0dXJuICh0eXBlb2YgYiA9PT0gXCJudW1iZXJcIiA/IGludGVycG9sYXRlTnVtYmVyXG4gICAgICA6IGIgaW5zdGFuY2VvZiBjb2xvciA/IGludGVycG9sYXRlUmdiXG4gICAgICA6IChjID0gY29sb3IoYikpID8gKGIgPSBjLCBpbnRlcnBvbGF0ZVJnYilcbiAgICAgIDogaW50ZXJwb2xhdGVTdHJpbmcpKGEsIGIpO1xufVxuIiwiaW1wb3J0IHtpbnRlcnBvbGF0ZVRyYW5zZm9ybVN2ZyBhcyBpbnRlcnBvbGF0ZVRyYW5zZm9ybX0gZnJvbSBcImQzLWludGVycG9sYXRlXCI7XG5pbXBvcnQge25hbWVzcGFjZX0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHt0d2VlblZhbHVlfSBmcm9tIFwiLi90d2Vlbi5qc1wiO1xuaW1wb3J0IGludGVycG9sYXRlIGZyb20gXCIuL2ludGVycG9sYXRlLmpzXCI7XG5cbmZ1bmN0aW9uIGF0dHJSZW1vdmUobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJSZW1vdmVOUyhmdWxsbmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyQ29uc3RhbnQobmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlMSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIixcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gdGhpcy5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJDb25zdGFudE5TKGZ1bGxuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUxKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSB0aGlzLmdldEF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbihuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMTAsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCwgdmFsdWUxID0gdmFsdWUodGhpcyksIHN0cmluZzE7XG4gICAgaWYgKHZhbHVlMSA9PSBudWxsKSByZXR1cm4gdm9pZCB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICBzdHJpbmcwID0gdGhpcy5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCI7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgJiYgc3RyaW5nMSA9PT0gc3RyaW5nMTAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiAoc3RyaW5nMTAgPSBzdHJpbmcxLCBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyRnVuY3Rpb25OUyhmdWxsbmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEwLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAsIHZhbHVlMSA9IHZhbHVlKHRoaXMpLCBzdHJpbmcxO1xuICAgIGlmICh2YWx1ZTEgPT0gbnVsbCkgcmV0dXJuIHZvaWQgdGhpcy5yZW1vdmVBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICAgIHN0cmluZzAgPSB0aGlzLmdldEF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCI7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgJiYgc3RyaW5nMSA9PT0gc3RyaW5nMTAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiAoc3RyaW5nMTAgPSBzdHJpbmcxLCBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSkpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgZnVsbG5hbWUgPSBuYW1lc3BhY2UobmFtZSksIGkgPSBmdWxsbmFtZSA9PT0gXCJ0cmFuc2Zvcm1cIiA/IGludGVycG9sYXRlVHJhbnNmb3JtIDogaW50ZXJwb2xhdGU7XG4gIHJldHVybiB0aGlzLmF0dHJUd2VlbihuYW1lLCB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyRnVuY3Rpb25OUyA6IGF0dHJGdW5jdGlvbikoZnVsbG5hbWUsIGksIHR3ZWVuVmFsdWUodGhpcywgXCJhdHRyLlwiICsgbmFtZSwgdmFsdWUpKVxuICAgICAgOiB2YWx1ZSA9PSBudWxsID8gKGZ1bGxuYW1lLmxvY2FsID8gYXR0clJlbW92ZU5TIDogYXR0clJlbW92ZSkoZnVsbG5hbWUpXG4gICAgICA6IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJDb25zdGFudE5TIDogYXR0ckNvbnN0YW50KShmdWxsbmFtZSwgaSwgdmFsdWUpKTtcbn1cbiIsImltcG9ydCB7bmFtZXNwYWNlfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5cbmZ1bmN0aW9uIGF0dHJJbnRlcnBvbGF0ZShuYW1lLCBpKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgaS5jYWxsKHRoaXMsIHQpKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckludGVycG9sYXRlTlMoZnVsbG5hbWUsIGkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLnNldEF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCwgaS5jYWxsKHRoaXMsIHQpKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0clR3ZWVuTlMoZnVsbG5hbWUsIHZhbHVlKSB7XG4gIHZhciB0MCwgaTA7XG4gIGZ1bmN0aW9uIHR3ZWVuKCkge1xuICAgIHZhciBpID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoaSAhPT0gaTApIHQwID0gKGkwID0gaSkgJiYgYXR0ckludGVycG9sYXRlTlMoZnVsbG5hbWUsIGkpO1xuICAgIHJldHVybiB0MDtcbiAgfVxuICB0d2Vlbi5fdmFsdWUgPSB2YWx1ZTtcbiAgcmV0dXJuIHR3ZWVuO1xufVxuXG5mdW5jdGlvbiBhdHRyVHdlZW4obmFtZSwgdmFsdWUpIHtcbiAgdmFyIHQwLCBpMDtcbiAgZnVuY3Rpb24gdHdlZW4oKSB7XG4gICAgdmFyIGkgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmIChpICE9PSBpMCkgdDAgPSAoaTAgPSBpKSAmJiBhdHRySW50ZXJwb2xhdGUobmFtZSwgaSk7XG4gICAgcmV0dXJuIHQwO1xuICB9XG4gIHR3ZWVuLl92YWx1ZSA9IHZhbHVlO1xuICByZXR1cm4gdHdlZW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHZhciBrZXkgPSBcImF0dHIuXCIgKyBuYW1lO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHJldHVybiAoa2V5ID0gdGhpcy50d2VlbihrZXkpKSAmJiBrZXkuX3ZhbHVlO1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIHRoaXMudHdlZW4oa2V5LCBudWxsKTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHZhciBmdWxsbmFtZSA9IG5hbWVzcGFjZShuYW1lKTtcbiAgcmV0dXJuIHRoaXMudHdlZW4oa2V5LCAoZnVsbG5hbWUubG9jYWwgPyBhdHRyVHdlZW5OUyA6IGF0dHJUd2VlbikoZnVsbG5hbWUsIHZhbHVlKSk7XG59XG4iLCJpbXBvcnQge2dldCwgaW5pdH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gZGVsYXlGdW5jdGlvbihpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGluaXQodGhpcywgaWQpLmRlbGF5ID0gK3ZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGRlbGF5Q29uc3RhbnQoaWQsIHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9ICt2YWx1ZSwgZnVuY3Rpb24oKSB7XG4gICAgaW5pdCh0aGlzLCBpZCkuZGVsYXkgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKCh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgID8gZGVsYXlGdW5jdGlvblxuICAgICAgICAgIDogZGVsYXlDb25zdGFudCkoaWQsIHZhbHVlKSlcbiAgICAgIDogZ2V0KHRoaXMubm9kZSgpLCBpZCkuZGVsYXk7XG59XG4iLCJpbXBvcnQge2dldCwgc2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiBkdXJhdGlvbkZ1bmN0aW9uKGlkLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgc2V0KHRoaXMsIGlkKS5kdXJhdGlvbiA9ICt2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBkdXJhdGlvbkNvbnN0YW50KGlkLCB2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPSArdmFsdWUsIGZ1bmN0aW9uKCkge1xuICAgIHNldCh0aGlzLCBpZCkuZHVyYXRpb24gPSB2YWx1ZTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKCh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgID8gZHVyYXRpb25GdW5jdGlvblxuICAgICAgICAgIDogZHVyYXRpb25Db25zdGFudCkoaWQsIHZhbHVlKSlcbiAgICAgIDogZ2V0KHRoaXMubm9kZSgpLCBpZCkuZHVyYXRpb247XG59XG4iLCJpbXBvcnQge2dldCwgc2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiBlYXNlQ29uc3RhbnQoaWQsIHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgc2V0KHRoaXMsIGlkKS5lYXNlID0gdmFsdWU7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHZhciBpZCA9IHRoaXMuX2lkO1xuXG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMuZWFjaChlYXNlQ29uc3RhbnQoaWQsIHZhbHVlKSlcbiAgICAgIDogZ2V0KHRoaXMubm9kZSgpLCBpZCkuZWFzZTtcbn1cbiIsImltcG9ydCB7c2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiBlYXNlVmFyeWluZyhpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodHlwZW9mIHYgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICAgIHNldCh0aGlzLCBpZCkuZWFzZSA9IHY7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gdGhpcy5lYWNoKGVhc2VWYXJ5aW5nKHRoaXMuX2lkLCB2YWx1ZSkpO1xufVxuIiwiaW1wb3J0IHttYXRjaGVyfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge1RyYW5zaXRpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG1hdGNoKSB7XG4gIGlmICh0eXBlb2YgbWF0Y2ggIT09IFwiZnVuY3Rpb25cIikgbWF0Y2ggPSBtYXRjaGVyKG1hdGNoKTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHN1Ymdyb3VwID0gc3ViZ3JvdXBzW2pdID0gW10sIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgbWF0Y2guY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpIHtcbiAgICAgICAgc3ViZ3JvdXAucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oc3ViZ3JvdXBzLCB0aGlzLl9wYXJlbnRzLCB0aGlzLl9uYW1lLCB0aGlzLl9pZCk7XG59XG4iLCJpbXBvcnQge1RyYW5zaXRpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHRyYW5zaXRpb24pIHtcbiAgaWYgKHRyYW5zaXRpb24uX2lkICE9PSB0aGlzLl9pZCkgdGhyb3cgbmV3IEVycm9yO1xuXG4gIGZvciAodmFyIGdyb3VwczAgPSB0aGlzLl9ncm91cHMsIGdyb3VwczEgPSB0cmFuc2l0aW9uLl9ncm91cHMsIG0wID0gZ3JvdXBzMC5sZW5ndGgsIG0xID0gZ3JvdXBzMS5sZW5ndGgsIG0gPSBNYXRoLm1pbihtMCwgbTEpLCBtZXJnZXMgPSBuZXcgQXJyYXkobTApLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwMCA9IGdyb3VwczBbal0sIGdyb3VwMSA9IGdyb3VwczFbal0sIG4gPSBncm91cDAubGVuZ3RoLCBtZXJnZSA9IG1lcmdlc1tqXSA9IG5ldyBBcnJheShuKSwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXAwW2ldIHx8IGdyb3VwMVtpXSkge1xuICAgICAgICBtZXJnZVtpXSA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9yICg7IGogPCBtMDsgKytqKSB7XG4gICAgbWVyZ2VzW2pdID0gZ3JvdXBzMFtqXTtcbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihtZXJnZXMsIHRoaXMuX3BhcmVudHMsIHRoaXMuX25hbWUsIHRoaXMuX2lkKTtcbn1cbiIsImltcG9ydCB7Z2V0LCBzZXQsIGluaXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIHN0YXJ0KG5hbWUpIHtcbiAgcmV0dXJuIChuYW1lICsgXCJcIikudHJpbSgpLnNwbGl0KC9efFxccysvKS5ldmVyeShmdW5jdGlvbih0KSB7XG4gICAgdmFyIGkgPSB0LmluZGV4T2YoXCIuXCIpO1xuICAgIGlmIChpID49IDApIHQgPSB0LnNsaWNlKDAsIGkpO1xuICAgIHJldHVybiAhdCB8fCB0ID09PSBcInN0YXJ0XCI7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBvbkZ1bmN0aW9uKGlkLCBuYW1lLCBsaXN0ZW5lcikge1xuICB2YXIgb24wLCBvbjEsIHNpdCA9IHN0YXJ0KG5hbWUpID8gaW5pdCA6IHNldDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNpdCh0aGlzLCBpZCksXG4gICAgICAgIG9uID0gc2NoZWR1bGUub247XG5cbiAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIGEgZGlzcGF0Y2ggd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAvLyBqdXN0IGFzc2lnbiB0aGUgdXBkYXRlZCBzaGFyZWQgZGlzcGF0Y2ggYW5kIHdl4oCZcmUgZG9uZSFcbiAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgaWYgKG9uICE9PSBvbjApIChvbjEgPSAob24wID0gb24pLmNvcHkoKSkub24obmFtZSwgbGlzdGVuZXIpO1xuXG4gICAgc2NoZWR1bGUub24gPSBvbjE7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIGxpc3RlbmVyKSB7XG4gIHZhciBpZCA9IHRoaXMuX2lkO1xuXG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoIDwgMlxuICAgICAgPyBnZXQodGhpcy5ub2RlKCksIGlkKS5vbi5vbihuYW1lKVxuICAgICAgOiB0aGlzLmVhY2gob25GdW5jdGlvbihpZCwgbmFtZSwgbGlzdGVuZXIpKTtcbn1cbiIsImZ1bmN0aW9uIHJlbW92ZUZ1bmN0aW9uKGlkKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICAgIGZvciAodmFyIGkgaW4gdGhpcy5fX3RyYW5zaXRpb24pIGlmICgraSAhPT0gaWQpIHJldHVybjtcbiAgICBpZiAocGFyZW50KSBwYXJlbnQucmVtb3ZlQ2hpbGQodGhpcyk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5vbihcImVuZC5yZW1vdmVcIiwgcmVtb3ZlRnVuY3Rpb24odGhpcy5faWQpKTtcbn1cbiIsImltcG9ydCB7c2VsZWN0b3J9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7VHJhbnNpdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBzY2hlZHVsZSwge2dldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0KSB7XG4gIHZhciBuYW1lID0gdGhpcy5fbmFtZSxcbiAgICAgIGlkID0gdGhpcy5faWQ7XG5cbiAgaWYgKHR5cGVvZiBzZWxlY3QgIT09IFwiZnVuY3Rpb25cIikgc2VsZWN0ID0gc2VsZWN0b3Ioc2VsZWN0KTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHN1Ymdyb3VwID0gc3ViZ3JvdXBzW2pdID0gbmV3IEFycmF5KG4pLCBub2RlLCBzdWJub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIChzdWJub2RlID0gc2VsZWN0LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApKSkge1xuICAgICAgICBpZiAoXCJfX2RhdGFfX1wiIGluIG5vZGUpIHN1Ym5vZGUuX19kYXRhX18gPSBub2RlLl9fZGF0YV9fO1xuICAgICAgICBzdWJncm91cFtpXSA9IHN1Ym5vZGU7XG4gICAgICAgIHNjaGVkdWxlKHN1Ymdyb3VwW2ldLCBuYW1lLCBpZCwgaSwgc3ViZ3JvdXAsIGdldChub2RlLCBpZCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihzdWJncm91cHMsIHRoaXMuX3BhcmVudHMsIG5hbWUsIGlkKTtcbn1cbiIsImltcG9ydCB7c2VsZWN0b3JBbGx9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7VHJhbnNpdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBzY2hlZHVsZSwge2dldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0KSB7XG4gIHZhciBuYW1lID0gdGhpcy5fbmFtZSxcbiAgICAgIGlkID0gdGhpcy5faWQ7XG5cbiAgaWYgKHR5cGVvZiBzZWxlY3QgIT09IFwiZnVuY3Rpb25cIikgc2VsZWN0ID0gc2VsZWN0b3JBbGwoc2VsZWN0KTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBbXSwgcGFyZW50cyA9IFtdLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBmb3IgKHZhciBjaGlsZHJlbiA9IHNlbGVjdC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSwgY2hpbGQsIGluaGVyaXQgPSBnZXQobm9kZSwgaWQpLCBrID0gMCwgbCA9IGNoaWxkcmVuLmxlbmd0aDsgayA8IGw7ICsraykge1xuICAgICAgICAgIGlmIChjaGlsZCA9IGNoaWxkcmVuW2tdKSB7XG4gICAgICAgICAgICBzY2hlZHVsZShjaGlsZCwgbmFtZSwgaWQsIGssIGNoaWxkcmVuLCBpbmhlcml0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3ViZ3JvdXBzLnB1c2goY2hpbGRyZW4pO1xuICAgICAgICBwYXJlbnRzLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKHN1Ymdyb3VwcywgcGFyZW50cywgbmFtZSwgaWQpO1xufVxuIiwiaW1wb3J0IHtzZWxlY3Rpb259IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcblxudmFyIFNlbGVjdGlvbiA9IHNlbGVjdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3I7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdGlvbih0aGlzLl9ncm91cHMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwiaW1wb3J0IHtpbnRlcnBvbGF0ZVRyYW5zZm9ybUNzcyBhcyBpbnRlcnBvbGF0ZVRyYW5zZm9ybX0gZnJvbSBcImQzLWludGVycG9sYXRlXCI7XG5pbXBvcnQge3N0eWxlfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge3NldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcbmltcG9ydCB7dHdlZW5WYWx1ZX0gZnJvbSBcIi4vdHdlZW4uanNcIjtcbmltcG9ydCBpbnRlcnBvbGF0ZSBmcm9tIFwiLi9pbnRlcnBvbGF0ZS5qc1wiO1xuXG5mdW5jdGlvbiBzdHlsZU51bGwobmFtZSwgaW50ZXJwb2xhdGUpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMTAsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCA9IHN0eWxlKHRoaXMsIG5hbWUpLFxuICAgICAgICBzdHJpbmcxID0gKHRoaXMuc3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSksIHN0eWxlKHRoaXMsIG5hbWUpKTtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCAmJiBzdHJpbmcxID09PSBzdHJpbmcxMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgc3RyaW5nMTAgPSBzdHJpbmcxKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVSZW1vdmUobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVDb25zdGFudChuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUxKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSBzdHlsZSh0aGlzLCBuYW1lKTtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVGdW5jdGlvbihuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMTAsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCA9IHN0eWxlKHRoaXMsIG5hbWUpLFxuICAgICAgICB2YWx1ZTEgPSB2YWx1ZSh0aGlzKSxcbiAgICAgICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCI7XG4gICAgaWYgKHZhbHVlMSA9PSBudWxsKSBzdHJpbmcxID0gdmFsdWUxID0gKHRoaXMuc3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSksIHN0eWxlKHRoaXMsIG5hbWUpKTtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCAmJiBzdHJpbmcxID09PSBzdHJpbmcxMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IChzdHJpbmcxMCA9IHN0cmluZzEsIGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlTWF5YmVSZW1vdmUoaWQsIG5hbWUpIHtcbiAgdmFyIG9uMCwgb24xLCBsaXN0ZW5lcjAsIGtleSA9IFwic3R5bGUuXCIgKyBuYW1lLCBldmVudCA9IFwiZW5kLlwiICsga2V5LCByZW1vdmU7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2NoZWR1bGUgPSBzZXQodGhpcywgaWQpLFxuICAgICAgICBvbiA9IHNjaGVkdWxlLm9uLFxuICAgICAgICBsaXN0ZW5lciA9IHNjaGVkdWxlLnZhbHVlW2tleV0gPT0gbnVsbCA/IHJlbW92ZSB8fCAocmVtb3ZlID0gc3R5bGVSZW1vdmUobmFtZSkpIDogdW5kZWZpbmVkO1xuXG4gICAgLy8gSWYgdGhpcyBub2RlIHNoYXJlZCBhIGRpc3BhdGNoIHdpdGggdGhlIHByZXZpb3VzIG5vZGUsXG4gICAgLy8ganVzdCBhc3NpZ24gdGhlIHVwZGF0ZWQgc2hhcmVkIGRpc3BhdGNoIGFuZCB3ZeKAmXJlIGRvbmUhXG4gICAgLy8gT3RoZXJ3aXNlLCBjb3B5LW9uLXdyaXRlLlxuICAgIGlmIChvbiAhPT0gb24wIHx8IGxpc3RlbmVyMCAhPT0gbGlzdGVuZXIpIChvbjEgPSAob24wID0gb24pLmNvcHkoKSkub24oZXZlbnQsIGxpc3RlbmVyMCA9IGxpc3RlbmVyKTtcblxuICAgIHNjaGVkdWxlLm9uID0gb24xO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgdmFyIGkgPSAobmFtZSArPSBcIlwiKSA9PT0gXCJ0cmFuc2Zvcm1cIiA/IGludGVycG9sYXRlVHJhbnNmb3JtIDogaW50ZXJwb2xhdGU7XG4gIHJldHVybiB2YWx1ZSA9PSBudWxsID8gdGhpc1xuICAgICAgLnN0eWxlVHdlZW4obmFtZSwgc3R5bGVOdWxsKG5hbWUsIGkpKVxuICAgICAgLm9uKFwiZW5kLnN0eWxlLlwiICsgbmFtZSwgc3R5bGVSZW1vdmUobmFtZSkpXG4gICAgOiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IHRoaXNcbiAgICAgIC5zdHlsZVR3ZWVuKG5hbWUsIHN0eWxlRnVuY3Rpb24obmFtZSwgaSwgdHdlZW5WYWx1ZSh0aGlzLCBcInN0eWxlLlwiICsgbmFtZSwgdmFsdWUpKSlcbiAgICAgIC5lYWNoKHN0eWxlTWF5YmVSZW1vdmUodGhpcy5faWQsIG5hbWUpKVxuICAgIDogdGhpc1xuICAgICAgLnN0eWxlVHdlZW4obmFtZSwgc3R5bGVDb25zdGFudChuYW1lLCBpLCB2YWx1ZSksIHByaW9yaXR5KVxuICAgICAgLm9uKFwiZW5kLnN0eWxlLlwiICsgbmFtZSwgbnVsbCk7XG59XG4iLCJmdW5jdGlvbiBzdHlsZUludGVycG9sYXRlKG5hbWUsIGksIHByaW9yaXR5KSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy5zdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCBpLmNhbGwodGhpcywgdCksIHByaW9yaXR5KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVUd2VlbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgdmFyIHQsIGkwO1xuICBmdW5jdGlvbiB0d2VlbigpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKGkgIT09IGkwKSB0ID0gKGkwID0gaSkgJiYgc3R5bGVJbnRlcnBvbGF0ZShuYW1lLCBpLCBwcmlvcml0eSk7XG4gICAgcmV0dXJuIHQ7XG4gIH1cbiAgdHdlZW4uX3ZhbHVlID0gdmFsdWU7XG4gIHJldHVybiB0d2Vlbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHZhciBrZXkgPSBcInN0eWxlLlwiICsgKG5hbWUgKz0gXCJcIik7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcmV0dXJuIChrZXkgPSB0aGlzLnR3ZWVuKGtleSkpICYmIGtleS5fdmFsdWU7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gdGhpcy50d2VlbihrZXksIG51bGwpO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIHRoaXMudHdlZW4oa2V5LCBzdHlsZVR3ZWVuKG5hbWUsIHZhbHVlLCBwcmlvcml0eSA9PSBudWxsID8gXCJcIiA6IHByaW9yaXR5KSk7XG59XG4iLCJpbXBvcnQge3R3ZWVuVmFsdWV9IGZyb20gXCIuL3R3ZWVuLmpzXCI7XG5cbmZ1bmN0aW9uIHRleHRDb25zdGFudCh2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IHZhbHVlO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0ZXh0RnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZTEgPSB2YWx1ZSh0aGlzKTtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gdmFsdWUxID09IG51bGwgPyBcIlwiIDogdmFsdWUxO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdGhpcy50d2VlbihcInRleHRcIiwgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gdGV4dEZ1bmN0aW9uKHR3ZWVuVmFsdWUodGhpcywgXCJ0ZXh0XCIsIHZhbHVlKSlcbiAgICAgIDogdGV4dENvbnN0YW50KHZhbHVlID09IG51bGwgPyBcIlwiIDogdmFsdWUgKyBcIlwiKSk7XG59XG4iLCJmdW5jdGlvbiB0ZXh0SW50ZXJwb2xhdGUoaSkge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSBpLmNhbGwodGhpcywgdCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRleHRUd2Vlbih2YWx1ZSkge1xuICB2YXIgdDAsIGkwO1xuICBmdW5jdGlvbiB0d2VlbigpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKGkgIT09IGkwKSB0MCA9IChpMCA9IGkpICYmIHRleHRJbnRlcnBvbGF0ZShpKTtcbiAgICByZXR1cm4gdDA7XG4gIH1cbiAgdHdlZW4uX3ZhbHVlID0gdmFsdWU7XG4gIHJldHVybiB0d2Vlbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgdmFyIGtleSA9IFwidGV4dFwiO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDEpIHJldHVybiAoa2V5ID0gdGhpcy50d2VlbihrZXkpKSAmJiBrZXkuX3ZhbHVlO1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIHRoaXMudHdlZW4oa2V5LCBudWxsKTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgdGV4dFR3ZWVuKHZhbHVlKSk7XG59XG4iLCJpbXBvcnQge1RyYW5zaXRpb24sIG5ld0lkfSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHNjaGVkdWxlLCB7Z2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIG5hbWUgPSB0aGlzLl9uYW1lLFxuICAgICAgaWQwID0gdGhpcy5faWQsXG4gICAgICBpZDEgPSBuZXdJZCgpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIHZhciBpbmhlcml0ID0gZ2V0KG5vZGUsIGlkMCk7XG4gICAgICAgIHNjaGVkdWxlKG5vZGUsIG5hbWUsIGlkMSwgaSwgZ3JvdXAsIHtcbiAgICAgICAgICB0aW1lOiBpbmhlcml0LnRpbWUgKyBpbmhlcml0LmRlbGF5ICsgaW5oZXJpdC5kdXJhdGlvbixcbiAgICAgICAgICBkZWxheTogMCxcbiAgICAgICAgICBkdXJhdGlvbjogaW5oZXJpdC5kdXJhdGlvbixcbiAgICAgICAgICBlYXNlOiBpbmhlcml0LmVhc2VcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKGdyb3VwcywgdGhpcy5fcGFyZW50cywgbmFtZSwgaWQxKTtcbn1cbiIsImltcG9ydCB7c2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIG9uMCwgb24xLCB0aGF0ID0gdGhpcywgaWQgPSB0aGF0Ll9pZCwgc2l6ZSA9IHRoYXQuc2l6ZSgpO1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIGNhbmNlbCA9IHt2YWx1ZTogcmVqZWN0fSxcbiAgICAgICAgZW5kID0ge3ZhbHVlOiBmdW5jdGlvbigpIHsgaWYgKC0tc2l6ZSA9PT0gMCkgcmVzb2x2ZSgpOyB9fTtcblxuICAgIHRoYXQuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCksXG4gICAgICAgICAgb24gPSBzY2hlZHVsZS5vbjtcblxuICAgICAgLy8gSWYgdGhpcyBub2RlIHNoYXJlZCBhIGRpc3BhdGNoIHdpdGggdGhlIHByZXZpb3VzIG5vZGUsXG4gICAgICAvLyBqdXN0IGFzc2lnbiB0aGUgdXBkYXRlZCBzaGFyZWQgZGlzcGF0Y2ggYW5kIHdl4oCZcmUgZG9uZSFcbiAgICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICAgIGlmIChvbiAhPT0gb24wKSB7XG4gICAgICAgIG9uMSA9IChvbjAgPSBvbikuY29weSgpO1xuICAgICAgICBvbjEuXy5jYW5jZWwucHVzaChjYW5jZWwpO1xuICAgICAgICBvbjEuXy5pbnRlcnJ1cHQucHVzaChjYW5jZWwpO1xuICAgICAgICBvbjEuXy5lbmQucHVzaChlbmQpO1xuICAgICAgfVxuXG4gICAgICBzY2hlZHVsZS5vbiA9IG9uMTtcbiAgICB9KTtcblxuICAgIC8vIFRoZSBzZWxlY3Rpb24gd2FzIGVtcHR5LCByZXNvbHZlIGVuZCBpbW1lZGlhdGVseVxuICAgIGlmIChzaXplID09PSAwKSByZXNvbHZlKCk7XG4gIH0pO1xufVxuIiwiaW1wb3J0IHtzZWxlY3Rpb259IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB0cmFuc2l0aW9uX2F0dHIgZnJvbSBcIi4vYXR0ci5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fYXR0clR3ZWVuIGZyb20gXCIuL2F0dHJUd2Vlbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZGVsYXkgZnJvbSBcIi4vZGVsYXkuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2R1cmF0aW9uIGZyb20gXCIuL2R1cmF0aW9uLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9lYXNlIGZyb20gXCIuL2Vhc2UuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2Vhc2VWYXJ5aW5nIGZyb20gXCIuL2Vhc2VWYXJ5aW5nLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9maWx0ZXIgZnJvbSBcIi4vZmlsdGVyLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9tZXJnZSBmcm9tIFwiLi9tZXJnZS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fb24gZnJvbSBcIi4vb24uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3JlbW92ZSBmcm9tIFwiLi9yZW1vdmUuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3NlbGVjdCBmcm9tIFwiLi9zZWxlY3QuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3NlbGVjdEFsbCBmcm9tIFwiLi9zZWxlY3RBbGwuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3NlbGVjdGlvbiBmcm9tIFwiLi9zZWxlY3Rpb24uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3N0eWxlIGZyb20gXCIuL3N0eWxlLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zdHlsZVR3ZWVuIGZyb20gXCIuL3N0eWxlVHdlZW4uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3RleHQgZnJvbSBcIi4vdGV4dC5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fdGV4dFR3ZWVuIGZyb20gXCIuL3RleHRUd2Vlbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fdHJhbnNpdGlvbiBmcm9tIFwiLi90cmFuc2l0aW9uLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl90d2VlbiBmcm9tIFwiLi90d2Vlbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZW5kIGZyb20gXCIuL2VuZC5qc1wiO1xuXG52YXIgaWQgPSAwO1xuXG5leHBvcnQgZnVuY3Rpb24gVHJhbnNpdGlvbihncm91cHMsIHBhcmVudHMsIG5hbWUsIGlkKSB7XG4gIHRoaXMuX2dyb3VwcyA9IGdyb3VwcztcbiAgdGhpcy5fcGFyZW50cyA9IHBhcmVudHM7XG4gIHRoaXMuX25hbWUgPSBuYW1lO1xuICB0aGlzLl9pZCA9IGlkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFuc2l0aW9uKG5hbWUpIHtcbiAgcmV0dXJuIHNlbGVjdGlvbigpLnRyYW5zaXRpb24obmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBuZXdJZCgpIHtcbiAgcmV0dXJuICsraWQ7XG59XG5cbnZhciBzZWxlY3Rpb25fcHJvdG90eXBlID0gc2VsZWN0aW9uLnByb3RvdHlwZTtcblxuVHJhbnNpdGlvbi5wcm90b3R5cGUgPSB0cmFuc2l0aW9uLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IFRyYW5zaXRpb24sXG4gIHNlbGVjdDogdHJhbnNpdGlvbl9zZWxlY3QsXG4gIHNlbGVjdEFsbDogdHJhbnNpdGlvbl9zZWxlY3RBbGwsXG4gIHNlbGVjdENoaWxkOiBzZWxlY3Rpb25fcHJvdG90eXBlLnNlbGVjdENoaWxkLFxuICBzZWxlY3RDaGlsZHJlbjogc2VsZWN0aW9uX3Byb3RvdHlwZS5zZWxlY3RDaGlsZHJlbixcbiAgZmlsdGVyOiB0cmFuc2l0aW9uX2ZpbHRlcixcbiAgbWVyZ2U6IHRyYW5zaXRpb25fbWVyZ2UsXG4gIHNlbGVjdGlvbjogdHJhbnNpdGlvbl9zZWxlY3Rpb24sXG4gIHRyYW5zaXRpb246IHRyYW5zaXRpb25fdHJhbnNpdGlvbixcbiAgY2FsbDogc2VsZWN0aW9uX3Byb3RvdHlwZS5jYWxsLFxuICBub2Rlczogc2VsZWN0aW9uX3Byb3RvdHlwZS5ub2RlcyxcbiAgbm9kZTogc2VsZWN0aW9uX3Byb3RvdHlwZS5ub2RlLFxuICBzaXplOiBzZWxlY3Rpb25fcHJvdG90eXBlLnNpemUsXG4gIGVtcHR5OiBzZWxlY3Rpb25fcHJvdG90eXBlLmVtcHR5LFxuICBlYWNoOiBzZWxlY3Rpb25fcHJvdG90eXBlLmVhY2gsXG4gIG9uOiB0cmFuc2l0aW9uX29uLFxuICBhdHRyOiB0cmFuc2l0aW9uX2F0dHIsXG4gIGF0dHJUd2VlbjogdHJhbnNpdGlvbl9hdHRyVHdlZW4sXG4gIHN0eWxlOiB0cmFuc2l0aW9uX3N0eWxlLFxuICBzdHlsZVR3ZWVuOiB0cmFuc2l0aW9uX3N0eWxlVHdlZW4sXG4gIHRleHQ6IHRyYW5zaXRpb25fdGV4dCxcbiAgdGV4dFR3ZWVuOiB0cmFuc2l0aW9uX3RleHRUd2VlbixcbiAgcmVtb3ZlOiB0cmFuc2l0aW9uX3JlbW92ZSxcbiAgdHdlZW46IHRyYW5zaXRpb25fdHdlZW4sXG4gIGRlbGF5OiB0cmFuc2l0aW9uX2RlbGF5LFxuICBkdXJhdGlvbjogdHJhbnNpdGlvbl9kdXJhdGlvbixcbiAgZWFzZTogdHJhbnNpdGlvbl9lYXNlLFxuICBlYXNlVmFyeWluZzogdHJhbnNpdGlvbl9lYXNlVmFyeWluZyxcbiAgZW5kOiB0cmFuc2l0aW9uX2VuZCxcbiAgW1N5bWJvbC5pdGVyYXRvcl06IHNlbGVjdGlvbl9wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXVxufTtcbiIsImltcG9ydCB7VHJhbnNpdGlvbiwgbmV3SWR9IGZyb20gXCIuLi90cmFuc2l0aW9uL2luZGV4LmpzXCI7XG5pbXBvcnQgc2NoZWR1bGUgZnJvbSBcIi4uL3RyYW5zaXRpb24vc2NoZWR1bGUuanNcIjtcbmltcG9ydCB7ZWFzZUN1YmljSW5PdXR9IGZyb20gXCJkMy1lYXNlXCI7XG5pbXBvcnQge25vd30gZnJvbSBcImQzLXRpbWVyXCI7XG5cbnZhciBkZWZhdWx0VGltaW5nID0ge1xuICB0aW1lOiBudWxsLCAvLyBTZXQgb24gdXNlLlxuICBkZWxheTogMCxcbiAgZHVyYXRpb246IDI1MCxcbiAgZWFzZTogZWFzZUN1YmljSW5PdXRcbn07XG5cbmZ1bmN0aW9uIGluaGVyaXQobm9kZSwgaWQpIHtcbiAgdmFyIHRpbWluZztcbiAgd2hpbGUgKCEodGltaW5nID0gbm9kZS5fX3RyYW5zaXRpb24pIHx8ICEodGltaW5nID0gdGltaW5nW2lkXSkpIHtcbiAgICBpZiAoIShub2RlID0gbm9kZS5wYXJlbnROb2RlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGB0cmFuc2l0aW9uICR7aWR9IG5vdCBmb3VuZGApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGltaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBpZCxcbiAgICAgIHRpbWluZztcblxuICBpZiAobmFtZSBpbnN0YW5jZW9mIFRyYW5zaXRpb24pIHtcbiAgICBpZCA9IG5hbWUuX2lkLCBuYW1lID0gbmFtZS5fbmFtZTtcbiAgfSBlbHNlIHtcbiAgICBpZCA9IG5ld0lkKCksICh0aW1pbmcgPSBkZWZhdWx0VGltaW5nKS50aW1lID0gbm93KCksIG5hbWUgPSBuYW1lID09IG51bGwgPyBudWxsIDogbmFtZSArIFwiXCI7XG4gIH1cblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBzY2hlZHVsZShub2RlLCBuYW1lLCBpZCwgaSwgZ3JvdXAsIHRpbWluZyB8fCBpbmhlcml0KG5vZGUsIGlkKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKGdyb3VwcywgdGhpcy5fcGFyZW50cywgbmFtZSwgaWQpO1xufVxuIiwiaW1wb3J0IHtzZWxlY3Rpb259IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCBzZWxlY3Rpb25faW50ZXJydXB0IGZyb20gXCIuL2ludGVycnVwdC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl90cmFuc2l0aW9uIGZyb20gXCIuL3RyYW5zaXRpb24uanNcIjtcblxuc2VsZWN0aW9uLnByb3RvdHlwZS5pbnRlcnJ1cHQgPSBzZWxlY3Rpb25faW50ZXJydXB0O1xuc2VsZWN0aW9uLnByb3RvdHlwZS50cmFuc2l0aW9uID0gc2VsZWN0aW9uX3RyYW5zaXRpb247XG4iLCJpbXBvcnQge1RyYW5zaXRpb259IGZyb20gXCIuL3RyYW5zaXRpb24vaW5kZXguanNcIjtcbmltcG9ydCB7U0NIRURVTEVEfSBmcm9tIFwiLi90cmFuc2l0aW9uL3NjaGVkdWxlLmpzXCI7XG5cbnZhciByb290ID0gW251bGxdO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihub2RlLCBuYW1lKSB7XG4gIHZhciBzY2hlZHVsZXMgPSBub2RlLl9fdHJhbnNpdGlvbixcbiAgICAgIHNjaGVkdWxlLFxuICAgICAgaTtcblxuICBpZiAoc2NoZWR1bGVzKSB7XG4gICAgbmFtZSA9IG5hbWUgPT0gbnVsbCA/IG51bGwgOiBuYW1lICsgXCJcIjtcbiAgICBmb3IgKGkgaW4gc2NoZWR1bGVzKSB7XG4gICAgICBpZiAoKHNjaGVkdWxlID0gc2NoZWR1bGVzW2ldKS5zdGF0ZSA+IFNDSEVEVUxFRCAmJiBzY2hlZHVsZS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHJhbnNpdGlvbihbW25vZGVdXSwgcm9vdCwgbmFtZSwgK2kpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuIiwiaW1wb3J0IFwiLi9zZWxlY3Rpb24vaW5kZXguanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyB0cmFuc2l0aW9ufSBmcm9tIFwiLi90cmFuc2l0aW9uL2luZGV4LmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgYWN0aXZlfSBmcm9tIFwiLi9hY3RpdmUuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBpbnRlcnJ1cHR9IGZyb20gXCIuL2ludGVycnVwdC5qc1wiO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9