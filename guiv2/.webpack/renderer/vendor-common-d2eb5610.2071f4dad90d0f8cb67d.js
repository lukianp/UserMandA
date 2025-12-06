"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[2723],{

/***/ 3398:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  ph: () => (/* reexport */ Adder),
  Bu: () => (/* reexport */ src/* InternMap */.B),
  V_: () => (/* reexport */ ascending_ascending),
  h1: () => (/* reexport */ src_bisect),
  yl: () => (/* reexport */ bisector),
  Am: () => (/* reexport */ merge),
  YV: () => (/* reexport */ quantile_quantile),
  Z4: () => (/* reexport */ quantileSorted),
  y1: () => (/* reexport */ range),
  lq: () => (/* reexport */ ticks_tickIncrement),
  sG: () => (/* reexport */ tickStep),
  Zc: () => (/* reexport */ ticks_ticks)
});

// UNUSED EXPORTS: InternSet, bin, bisectCenter, bisectLeft, bisectRight, blur, blur2, blurImage, count, cross, cumsum, descending, deviation, difference, disjoint, every, extent, fcumsum, filter, flatGroup, flatRollup, fsum, greatest, greatestIndex, group, groupSort, groups, histogram, index, indexes, intersection, least, leastIndex, map, max, maxIndex, mean, median, medianIndex, min, minIndex, mode, nice, pairs, permute, quantileIndex, quickselect, rank, reduce, reverse, rollup, rollups, scan, shuffle, shuffler, some, sort, subset, sum, superset, thresholdFreedmanDiaconis, thresholdScott, thresholdSturges, transpose, union, variance, zip

;// ./node_modules/d3-array/src/ascending.js
function ascending_ascending(a, b) {
  return a == null || b == null ? NaN : a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

;// ./node_modules/d3-array/src/descending.js
function descending(a, b) {
  return a == null || b == null ? NaN
    : b < a ? -1
    : b > a ? 1
    : b >= a ? 0
    : NaN;
}

;// ./node_modules/d3-array/src/bisector.js



function bisector(f) {
  let compare1, compare2, delta;

  // If an accessor is specified, promote it to a comparator. In this case we
  // can test whether the search value is (self-) comparable. We can’t do this
  // for a comparator (except for specific, known comparators) because we can’t
  // tell if the comparator is symmetric, and an asymmetric comparator can’t be
  // used to test whether a single value is comparable.
  if (f.length !== 2) {
    compare1 = ascending_ascending;
    compare2 = (d, x) => ascending_ascending(f(d), x);
    delta = (d, x) => f(d) - x;
  } else {
    compare1 = f === ascending_ascending || f === descending ? f : zero;
    compare2 = f;
    delta = f;
  }

  function left(a, x, lo = 0, hi = a.length) {
    if (lo < hi) {
      if (compare1(x, x) !== 0) return hi;
      do {
        const mid = (lo + hi) >>> 1;
        if (compare2(a[mid], x) < 0) lo = mid + 1;
        else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }

  function right(a, x, lo = 0, hi = a.length) {
    if (lo < hi) {
      if (compare1(x, x) !== 0) return hi;
      do {
        const mid = (lo + hi) >>> 1;
        if (compare2(a[mid], x) <= 0) lo = mid + 1;
        else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }

  function center(a, x, lo = 0, hi = a.length) {
    const i = left(a, x, lo, hi - 1);
    return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
  }

  return {left, center, right};
}

function zero() {
  return 0;
}

;// ./node_modules/d3-array/src/number.js
function number_number(x) {
  return x === null ? NaN : +x;
}

function* numbers(values, valueof) {
  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        yield value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
        yield value;
      }
    }
  }
}

;// ./node_modules/d3-array/src/bisect.js




const ascendingBisect = bisector(ascending_ascending);
const bisectRight = ascendingBisect.right;
const bisectLeft = ascendingBisect.left;
const bisectCenter = bisector(number_number).center;
/* harmony default export */ const src_bisect = (bisectRight);

;// ./node_modules/d3-array/src/blur.js
function blur_blur(values, r) {
  if (!((r = +r) >= 0)) throw new RangeError("invalid r");
  let length = values.length;
  if (!((length = Math.floor(length)) >= 0)) throw new RangeError("invalid length");
  if (!length || !r) return values;
  const blur = blurf(r);
  const temp = values.slice();
  blur(values, temp, 0, length, 1);
  blur(temp, values, 0, length, 1);
  blur(values, temp, 0, length, 1);
  return values;
}

const blur2 = Blur2(blurf);

const blurImage = Blur2(blurfImage);

function Blur2(blur) {
  return function(data, rx, ry = rx) {
    if (!((rx = +rx) >= 0)) throw new RangeError("invalid rx");
    if (!((ry = +ry) >= 0)) throw new RangeError("invalid ry");
    let {data: values, width, height} = data;
    if (!((width = Math.floor(width)) >= 0)) throw new RangeError("invalid width");
    if (!((height = Math.floor(height !== undefined ? height : values.length / width)) >= 0)) throw new RangeError("invalid height");
    if (!width || !height || (!rx && !ry)) return data;
    const blurx = rx && blur(rx);
    const blury = ry && blur(ry);
    const temp = values.slice();
    if (blurx && blury) {
      blurh(blurx, temp, values, width, height);
      blurh(blurx, values, temp, width, height);
      blurh(blurx, temp, values, width, height);
      blurv(blury, values, temp, width, height);
      blurv(blury, temp, values, width, height);
      blurv(blury, values, temp, width, height);
    } else if (blurx) {
      blurh(blurx, values, temp, width, height);
      blurh(blurx, temp, values, width, height);
      blurh(blurx, values, temp, width, height);
    } else if (blury) {
      blurv(blury, values, temp, width, height);
      blurv(blury, temp, values, width, height);
      blurv(blury, values, temp, width, height);
    }
    return data;
  };
}

function blurh(blur, T, S, w, h) {
  for (let y = 0, n = w * h; y < n;) {
    blur(T, S, y, y += w, 1);
  }
}

function blurv(blur, T, S, w, h) {
  for (let x = 0, n = w * h; x < w; ++x) {
    blur(T, S, x, x + n, w);
  }
}

function blurfImage(radius) {
  const blur = blurf(radius);
  return (T, S, start, stop, step) => {
    start <<= 2, stop <<= 2, step <<= 2;
    blur(T, S, start + 0, stop + 0, step);
    blur(T, S, start + 1, stop + 1, step);
    blur(T, S, start + 2, stop + 2, step);
    blur(T, S, start + 3, stop + 3, step);
  };
}

// Given a target array T, a source array S, sets each value T[i] to the average
// of {S[i - r], …, S[i], …, S[i + r]}, where r = ⌊radius⌋, start <= i < stop,
// for each i, i + step, i + 2 * step, etc., and where S[j] is clamped between
// S[start] (inclusive) and S[stop] (exclusive). If the given radius is not an
// integer, S[i - r - 1] and S[i + r + 1] are added to the sum, each weighted
// according to r - ⌊radius⌋.
function blurf(radius) {
  const radius0 = Math.floor(radius);
  if (radius0 === radius) return bluri(radius);
  const t = radius - radius0;
  const w = 2 * radius + 1;
  return (T, S, start, stop, step) => { // stop must be aligned!
    if (!((stop -= step) >= start)) return; // inclusive stop
    let sum = radius0 * S[start];
    const s0 = step * radius0;
    const s1 = s0 + step;
    for (let i = start, j = start + s0; i < j; i += step) {
      sum += S[Math.min(stop, i)];
    }
    for (let i = start, j = stop; i <= j; i += step) {
      sum += S[Math.min(stop, i + s0)];
      T[i] = (sum + t * (S[Math.max(start, i - s1)] + S[Math.min(stop, i + s1)])) / w;
      sum -= S[Math.max(start, i - s0)];
    }
  };
}

// Like blurf, but optimized for integer radius.
function bluri(radius) {
  const w = 2 * radius + 1;
  return (T, S, start, stop, step) => { // stop must be aligned!
    if (!((stop -= step) >= start)) return; // inclusive stop
    let sum = radius * S[start];
    const s = step * radius;
    for (let i = start, j = start + s; i < j; i += step) {
      sum += S[Math.min(stop, i)];
    }
    for (let i = start, j = stop; i <= j; i += step) {
      sum += S[Math.min(stop, i + s)];
      T[i] = sum / w;
      sum -= S[Math.max(start, i - s)];
    }
  };
}

;// ./node_modules/d3-array/src/count.js
function count_count(values, valueof) {
  let count = 0;
  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        ++count;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
        ++count;
      }
    }
  }
  return count;
}

;// ./node_modules/d3-array/src/cross.js
function cross_length(array) {
  return array.length | 0;
}

function empty(length) {
  return !(length > 0);
}

function arrayify(values) {
  return typeof values !== "object" || "length" in values ? values : Array.from(values);
}

function reducer(reduce) {
  return values => reduce(...values);
}

function cross(...values) {
  const reduce = typeof values[values.length - 1] === "function" && reducer(values.pop());
  values = values.map(arrayify);
  const lengths = values.map(cross_length);
  const j = values.length - 1;
  const index = new Array(j + 1).fill(0);
  const product = [];
  if (j < 0 || lengths.some(empty)) return product;
  while (true) {
    product.push(index.map((j, i) => values[i][j]));
    let i = j;
    while (++index[i] === lengths[i]) {
      if (i === 0) return reduce ? product.map(reduce) : product;
      index[i--] = 0;
    }
  }
}

;// ./node_modules/d3-array/src/cumsum.js
function cumsum(values, valueof) {
  var sum = 0, index = 0;
  return Float64Array.from(values, valueof === undefined
    ? v => (sum += +v || 0)
    : v => (sum += +valueof(v, index++, values) || 0));
}
;// ./node_modules/d3-array/src/variance.js
function variance_variance(values, valueof) {
  let count = 0;
  let delta;
  let mean = 0;
  let sum = 0;
  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        delta = value - mean;
        mean += delta / ++count;
        sum += delta * (value - mean);
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
        delta = value - mean;
        mean += delta / ++count;
        sum += delta * (value - mean);
      }
    }
  }
  if (count > 1) return sum / (count - 1);
}

;// ./node_modules/d3-array/src/deviation.js


function deviation_deviation(values, valueof) {
  const v = variance(values, valueof);
  return v ? Math.sqrt(v) : v;
}

;// ./node_modules/d3-array/src/extent.js
function extent_extent(values, valueof) {
  let min;
  let max;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null) {
        if (min === undefined) {
          if (value >= value) min = max = value;
        } else {
          if (min > value) min = value;
          if (max < value) max = value;
        }
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null) {
        if (min === undefined) {
          if (value >= value) min = max = value;
        } else {
          if (min > value) min = value;
          if (max < value) max = value;
        }
      }
    }
  }
  return [min, max];
}

;// ./node_modules/d3-array/src/fsum.js
// https://github.com/python/cpython/blob/a74eea238f5baba15797e2e8b570d153bc8690a7/Modules/mathmodule.c#L1423
class Adder {
  constructor() {
    this._partials = new Float64Array(32);
    this._n = 0;
  }
  add(x) {
    const p = this._partials;
    let i = 0;
    for (let j = 0; j < this._n && j < 32; j++) {
      const y = p[j],
        hi = x + y,
        lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x);
      if (lo) p[i++] = lo;
      x = hi;
    }
    p[i] = x;
    this._n = i + 1;
    return this;
  }
  valueOf() {
    const p = this._partials;
    let n = this._n, x, y, lo, hi = 0;
    if (n > 0) {
      hi = p[--n];
      while (n > 0) {
        x = hi;
        y = p[--n];
        hi = x + y;
        lo = y - (hi - x);
        if (lo) break;
      }
      if (n > 0 && ((lo < 0 && p[n - 1] < 0) || (lo > 0 && p[n - 1] > 0))) {
        y = lo * 2;
        x = hi + y;
        if (y == x - hi) hi = x;
      }
    }
    return hi;
  }
}

function fsum(values, valueof) {
  const adder = new Adder();
  if (valueof === undefined) {
    for (let value of values) {
      if (value = +value) {
        adder.add(value);
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if (value = +valueof(value, ++index, values)) {
        adder.add(value);
      }
    }
  }
  return +adder;
}

function fcumsum(values, valueof) {
  const adder = new Adder();
  let index = -1;
  return Float64Array.from(values, valueof === undefined
      ? v => adder.add(+v || 0)
      : v => adder.add(+valueof(v, ++index, values) || 0)
  );
}

// EXTERNAL MODULE: ./node_modules/internmap/src/index.js
var src = __webpack_require__(24119);
;// ./node_modules/d3-array/src/identity.js
function identity_identity(x) {
  return x;
}

;// ./node_modules/d3-array/src/group.js



function group_group(values, ...keys) {
  return nest(values, identity, identity, keys);
}

function groups(values, ...keys) {
  return nest(values, Array.from, identity, keys);
}

function flatten(groups, keys) {
  for (let i = 1, n = keys.length; i < n; ++i) {
    groups = groups.flatMap(g => g.pop().map(([key, value]) => [...g, key, value]));
  }
  return groups;
}

function flatGroup(values, ...keys) {
  return flatten(groups(values, ...keys), keys);
}

function flatRollup(values, reduce, ...keys) {
  return flatten(rollups(values, reduce, ...keys), keys);
}

function group_rollup(values, reduce, ...keys) {
  return nest(values, identity, reduce, keys);
}

function rollups(values, reduce, ...keys) {
  return nest(values, Array.from, reduce, keys);
}

function index(values, ...keys) {
  return nest(values, identity, unique, keys);
}

function indexes(values, ...keys) {
  return nest(values, Array.from, unique, keys);
}

function unique(values) {
  if (values.length !== 1) throw new Error("duplicate key");
  return values[0];
}

function nest(values, map, reduce, keys) {
  return (function regroup(values, i) {
    if (i >= keys.length) return reduce(values);
    const groups = new InternMap();
    const keyof = keys[i++];
    let index = -1;
    for (const value of values) {
      const key = keyof(value, ++index, values);
      const group = groups.get(key);
      if (group) group.push(value);
      else groups.set(key, [value]);
    }
    for (const [key, values] of groups) {
      groups.set(key, regroup(values, i));
    }
    return map(groups);
  })(values, 0);
}

;// ./node_modules/d3-array/src/permute.js
function permute_permute(source, keys) {
  return Array.from(keys, key => source[key]);
}

;// ./node_modules/d3-array/src/sort.js



function sort_sort(values, ...F) {
  if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
  values = Array.from(values);
  let [f] = F;
  if ((f && f.length !== 2) || F.length > 1) {
    const index = Uint32Array.from(values, (d, i) => i);
    if (F.length > 1) {
      F = F.map(f => values.map(f));
      index.sort((i, j) => {
        for (const f of F) {
          const c = sort_ascendingDefined(f[i], f[j]);
          if (c) return c;
        }
      });
    } else {
      f = values.map(f);
      index.sort((i, j) => sort_ascendingDefined(f[i], f[j]));
    }
    return permute(values, index);
  }
  return values.sort(sort_compareDefined(f));
}

function sort_compareDefined(compare = ascending_ascending) {
  if (compare === ascending_ascending) return sort_ascendingDefined;
  if (typeof compare !== "function") throw new TypeError("compare is not a function");
  return (a, b) => {
    const x = compare(a, b);
    if (x || x === 0) return x;
    return (compare(b, b) === 0) - (compare(a, a) === 0);
  };
}

function sort_ascendingDefined(a, b) {
  return (a == null || !(a >= a)) - (b == null || !(b >= b)) || (a < b ? -1 : a > b ? 1 : 0);
}

;// ./node_modules/d3-array/src/groupSort.js




function groupSort(values, reduce, key) {
  return (reduce.length !== 2
    ? sort(rollup(values, reduce, key), (([ak, av], [bk, bv]) => ascending(av, bv) || ascending(ak, bk)))
    : sort(group(values, key), (([ak, av], [bk, bv]) => reduce(av, bv) || ascending(ak, bk))))
    .map(([key]) => key);
}

;// ./node_modules/d3-array/src/array.js
var array = Array.prototype;

var array_slice = array.slice;
var map = array.map;

;// ./node_modules/d3-array/src/constant.js
function constant_constant(x) {
  return () => x;
}

;// ./node_modules/d3-array/src/ticks.js
const e10 = Math.sqrt(50),
    e5 = Math.sqrt(10),
    e2 = Math.sqrt(2);

function tickSpec(start, stop, count) {
  const step = (stop - start) / Math.max(0, count),
      power = Math.floor(Math.log10(step)),
      error = step / Math.pow(10, power),
      factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
  let i1, i2, inc;
  if (power < 0) {
    inc = Math.pow(10, -power) / factor;
    i1 = Math.round(start * inc);
    i2 = Math.round(stop * inc);
    if (i1 / inc < start) ++i1;
    if (i2 / inc > stop) --i2;
    inc = -inc;
  } else {
    inc = Math.pow(10, power) * factor;
    i1 = Math.round(start / inc);
    i2 = Math.round(stop / inc);
    if (i1 * inc < start) ++i1;
    if (i2 * inc > stop) --i2;
  }
  if (i2 < i1 && 0.5 <= count && count < 2) return tickSpec(start, stop, count * 2);
  return [i1, i2, inc];
}

function ticks_ticks(start, stop, count) {
  stop = +stop, start = +start, count = +count;
  if (!(count > 0)) return [];
  if (start === stop) return [start];
  const reverse = stop < start, [i1, i2, inc] = reverse ? tickSpec(stop, start, count) : tickSpec(start, stop, count);
  if (!(i2 >= i1)) return [];
  const n = i2 - i1 + 1, ticks = new Array(n);
  if (reverse) {
    if (inc < 0) for (let i = 0; i < n; ++i) ticks[i] = (i2 - i) / -inc;
    else for (let i = 0; i < n; ++i) ticks[i] = (i2 - i) * inc;
  } else {
    if (inc < 0) for (let i = 0; i < n; ++i) ticks[i] = (i1 + i) / -inc;
    else for (let i = 0; i < n; ++i) ticks[i] = (i1 + i) * inc;
  }
  return ticks;
}

function ticks_tickIncrement(start, stop, count) {
  stop = +stop, start = +start, count = +count;
  return tickSpec(start, stop, count)[2];
}

function tickStep(start, stop, count) {
  stop = +stop, start = +start, count = +count;
  const reverse = stop < start, inc = reverse ? ticks_tickIncrement(stop, start, count) : ticks_tickIncrement(start, stop, count);
  return (reverse ? -1 : 1) * (inc < 0 ? 1 / -inc : inc);
}

;// ./node_modules/d3-array/src/nice.js


function nice_nice(start, stop, count) {
  let prestep;
  while (true) {
    const step = tickIncrement(start, stop, count);
    if (step === prestep || step === 0 || !isFinite(step)) {
      return [start, stop];
    } else if (step > 0) {
      start = Math.floor(start / step) * step;
      stop = Math.ceil(stop / step) * step;
    } else if (step < 0) {
      start = Math.ceil(start * step) / step;
      stop = Math.floor(stop * step) / step;
    }
    prestep = step;
  }
}

;// ./node_modules/d3-array/src/threshold/sturges.js


function thresholdSturges(values) {
  return Math.max(1, Math.ceil(Math.log(count(values)) / Math.LN2) + 1);
}

;// ./node_modules/d3-array/src/bin.js









function bin() {
  var value = identity,
      domain = extent,
      threshold = sturges;

  function histogram(data) {
    if (!Array.isArray(data)) data = Array.from(data);

    var i,
        n = data.length,
        x,
        step,
        values = new Array(n);

    for (i = 0; i < n; ++i) {
      values[i] = value(data[i], i, data);
    }

    var xz = domain(values),
        x0 = xz[0],
        x1 = xz[1],
        tz = threshold(values, x0, x1);

    // Convert number of thresholds into uniform thresholds, and nice the
    // default domain accordingly.
    if (!Array.isArray(tz)) {
      const max = x1, tn = +tz;
      if (domain === extent) [x0, x1] = nice(x0, x1, tn);
      tz = ticks(x0, x1, tn);

      // If the domain is aligned with the first tick (which it will by
      // default), then we can use quantization rather than bisection to bin
      // values, which is substantially faster.
      if (tz[0] <= x0) step = tickIncrement(x0, x1, tn);

      // If the last threshold is coincident with the domain’s upper bound, the
      // last bin will be zero-width. If the default domain is used, and this
      // last threshold is coincident with the maximum input value, we can
      // extend the niced upper bound by one tick to ensure uniform bin widths;
      // otherwise, we simply remove the last threshold. Note that we don’t
      // coerce values or the domain to numbers, and thus must be careful to
      // compare order (>=) rather than strict equality (===)!
      if (tz[tz.length - 1] >= x1) {
        if (max >= x1 && domain === extent) {
          const step = tickIncrement(x0, x1, tn);
          if (isFinite(step)) {
            if (step > 0) {
              x1 = (Math.floor(x1 / step) + 1) * step;
            } else if (step < 0) {
              x1 = (Math.ceil(x1 * -step) + 1) / -step;
            }
          }
        } else {
          tz.pop();
        }
      }
    }

    // Remove any thresholds outside the domain.
    // Be careful not to mutate an array owned by the user!
    var m = tz.length, a = 0, b = m;
    while (tz[a] <= x0) ++a;
    while (tz[b - 1] > x1) --b;
    if (a || b < m) tz = tz.slice(a, b), m = b - a;

    var bins = new Array(m + 1),
        bin;

    // Initialize bins.
    for (i = 0; i <= m; ++i) {
      bin = bins[i] = [];
      bin.x0 = i > 0 ? tz[i - 1] : x0;
      bin.x1 = i < m ? tz[i] : x1;
    }

    // Assign data to bins by value, ignoring any outside the domain.
    if (isFinite(step)) {
      if (step > 0) {
        for (i = 0; i < n; ++i) {
          if ((x = values[i]) != null && x0 <= x && x <= x1) {
            bins[Math.min(m, Math.floor((x - x0) / step))].push(data[i]);
          }
        }
      } else if (step < 0) {
        for (i = 0; i < n; ++i) {
          if ((x = values[i]) != null && x0 <= x && x <= x1) {
            const j = Math.floor((x0 - x) * step);
            bins[Math.min(m, j + (tz[j] <= x))].push(data[i]); // handle off-by-one due to rounding
          }
        }
      }
    } else {
      for (i = 0; i < n; ++i) {
        if ((x = values[i]) != null && x0 <= x && x <= x1) {
          bins[bisect(tz, x, 0, m)].push(data[i]);
        }
      }
    }

    return bins;
  }

  histogram.value = function(_) {
    return arguments.length ? (value = typeof _ === "function" ? _ : constant(_), histogram) : value;
  };

  histogram.domain = function(_) {
    return arguments.length ? (domain = typeof _ === "function" ? _ : constant([_[0], _[1]]), histogram) : domain;
  };

  histogram.thresholds = function(_) {
    return arguments.length ? (threshold = typeof _ === "function" ? _ : constant(Array.isArray(_) ? slice.call(_) : _), histogram) : threshold;
  };

  return histogram;
}

;// ./node_modules/d3-array/src/max.js
function max(values, valueof) {
  let max;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null
          && (max < value || (max === undefined && value >= value))) {
        max = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (max < value || (max === undefined && value >= value))) {
        max = value;
      }
    }
  }
  return max;
}

;// ./node_modules/d3-array/src/maxIndex.js
function maxIndex_maxIndex(values, valueof) {
  let max;
  let maxIndex = -1;
  let index = -1;
  if (valueof === undefined) {
    for (const value of values) {
      ++index;
      if (value != null
          && (max < value || (max === undefined && value >= value))) {
        max = value, maxIndex = index;
      }
    }
  } else {
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (max < value || (max === undefined && value >= value))) {
        max = value, maxIndex = index;
      }
    }
  }
  return maxIndex;
}

;// ./node_modules/d3-array/src/min.js
function min_min(values, valueof) {
  let min;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null
          && (min > value || (min === undefined && value >= value))) {
        min = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (min > value || (min === undefined && value >= value))) {
        min = value;
      }
    }
  }
  return min;
}

;// ./node_modules/d3-array/src/minIndex.js
function minIndex_minIndex(values, valueof) {
  let min;
  let minIndex = -1;
  let index = -1;
  if (valueof === undefined) {
    for (const value of values) {
      ++index;
      if (value != null
          && (min > value || (min === undefined && value >= value))) {
        min = value, minIndex = index;
      }
    }
  } else {
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (min > value || (min === undefined && value >= value))) {
        min = value, minIndex = index;
      }
    }
  }
  return minIndex;
}

;// ./node_modules/d3-array/src/quickselect.js


// Based on https://github.com/mourner/quickselect
// ISC license, Copyright 2018 Vladimir Agafonkin.
function quickselect_quickselect(array, k, left = 0, right = Infinity, compare) {
  k = Math.floor(k);
  left = Math.floor(Math.max(0, left));
  right = Math.floor(Math.min(array.length - 1, right));

  if (!(left <= k && k <= right)) return array;

  compare = compare === undefined ? sort_ascendingDefined : sort_compareDefined(compare);

  while (right > left) {
    if (right - left > 600) {
      const n = right - left + 1;
      const m = k - left + 1;
      const z = Math.log(n);
      const s = 0.5 * Math.exp(2 * z / 3);
      const sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
      const newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
      const newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
      quickselect_quickselect(array, k, newLeft, newRight, compare);
    }

    const t = array[k];
    let i = left;
    let j = right;

    swap(array, left, k);
    if (compare(array[right], t) > 0) swap(array, left, right);

    while (i < j) {
      swap(array, i, j), ++i, --j;
      while (compare(array[i], t) < 0) ++i;
      while (compare(array[j], t) > 0) --j;
    }

    if (compare(array[left], t) === 0) swap(array, left, j);
    else ++j, swap(array, j, right);

    if (j <= k) left = j + 1;
    if (k <= j) right = j - 1;
  }

  return array;
}

function swap(array, i, j) {
  const t = array[i];
  array[i] = array[j];
  array[j] = t;
}

;// ./node_modules/d3-array/src/greatest.js


function greatest_greatest(values, compare = ascending) {
  let max;
  let defined = false;
  if (compare.length === 1) {
    let maxValue;
    for (const element of values) {
      const value = compare(element);
      if (defined
          ? ascending(value, maxValue) > 0
          : ascending(value, value) === 0) {
        max = element;
        maxValue = value;
        defined = true;
      }
    }
  } else {
    for (const value of values) {
      if (defined
          ? compare(value, max) > 0
          : compare(value, value) === 0) {
        max = value;
        defined = true;
      }
    }
  }
  return max;
}

;// ./node_modules/d3-array/src/quantile.js









function quantile_quantile(values, p, valueof) {
  values = Float64Array.from(numbers(values, valueof));
  if (!(n = values.length) || isNaN(p = +p)) return;
  if (p <= 0 || n < 2) return min_min(values);
  if (p >= 1) return max(values);
  var n,
      i = (n - 1) * p,
      i0 = Math.floor(i),
      value0 = max(quickselect_quickselect(values, i0).subarray(0, i0 + 1)),
      value1 = min_min(values.subarray(i0 + 1));
  return value0 + (value1 - value0) * (i - i0);
}

function quantileSorted(values, p, valueof = number_number) {
  if (!(n = values.length) || isNaN(p = +p)) return;
  if (p <= 0 || n < 2) return +valueof(values[0], 0, values);
  if (p >= 1) return +valueof(values[n - 1], n - 1, values);
  var n,
      i = (n - 1) * p,
      i0 = Math.floor(i),
      value0 = +valueof(values[i0], i0, values),
      value1 = +valueof(values[i0 + 1], i0 + 1, values);
  return value0 + (value1 - value0) * (i - i0);
}

function quantile_quantileIndex(values, p, valueof = number) {
  if (isNaN(p = +p)) return;
  numbers = Float64Array.from(values, (_, i) => number(valueof(values[i], i, values)));
  if (p <= 0) return minIndex(numbers);
  if (p >= 1) return maxIndex(numbers);
  var numbers,
      index = Uint32Array.from(values, (_, i) => i),
      j = numbers.length - 1,
      i = Math.floor(j * p);
  quickselect(index, i, 0, j, (i, j) => ascendingDefined(numbers[i], numbers[j]));
  i = greatest(index.subarray(0, i + 1), (i) => numbers[i]);
  return i >= 0 ? i : -1;
}

;// ./node_modules/d3-array/src/threshold/freedmanDiaconis.js



function thresholdFreedmanDiaconis(values, min, max) {
  const c = count(values), d = quantile(values, 0.75) - quantile(values, 0.25);
  return c && d ? Math.ceil((max - min) / (2 * d * Math.pow(c, -1 / 3))) : 1;
}

;// ./node_modules/d3-array/src/threshold/scott.js



function thresholdScott(values, min, max) {
  const c = count(values), d = deviation(values);
  return c && d ? Math.ceil((max - min) * Math.cbrt(c) / (3.49 * d)) : 1;
}

;// ./node_modules/d3-array/src/mean.js
function mean(values, valueof) {
  let count = 0;
  let sum = 0;
  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        ++count, sum += value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
        ++count, sum += value;
      }
    }
  }
  if (count) return sum / count;
}

;// ./node_modules/d3-array/src/median.js


function median(values, valueof) {
  return quantile(values, 0.5, valueof);
}

function medianIndex(values, valueof) {
  return quantileIndex(values, 0.5, valueof);
}

;// ./node_modules/d3-array/src/merge.js
function* merge_flatten(arrays) {
  for (const array of arrays) {
    yield* array;
  }
}

function merge(arrays) {
  return Array.from(merge_flatten(arrays));
}

;// ./node_modules/d3-array/src/mode.js


function mode(values, valueof) {
  const counts = new InternMap();
  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && value >= value) {
        counts.set(value, (counts.get(value) || 0) + 1);
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && value >= value) {
        counts.set(value, (counts.get(value) || 0) + 1);
      }
    }
  }
  let modeValue;
  let modeCount = 0;
  for (const [value, count] of counts) {
    if (count > modeCount) {
      modeCount = count;
      modeValue = value;
    }
  }
  return modeValue;
}

;// ./node_modules/d3-array/src/pairs.js
function pairs(values, pairof = pair) {
  const pairs = [];
  let previous;
  let first = false;
  for (const value of values) {
    if (first) pairs.push(pairof(previous, value));
    previous = value;
    first = true;
  }
  return pairs;
}

function pair(a, b) {
  return [a, b];
}

;// ./node_modules/d3-array/src/range.js
function range(start, stop, step) {
  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

  var i = -1,
      n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
      range = new Array(n);

  while (++i < n) {
    range[i] = start + i * step;
  }

  return range;
}

;// ./node_modules/d3-array/src/rank.js



function rank(values, valueof = ascending) {
  if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
  let V = Array.from(values);
  const R = new Float64Array(V.length);
  if (valueof.length !== 2) V = V.map(valueof), valueof = ascending;
  const compareIndex = (i, j) => valueof(V[i], V[j]);
  let k, r;
  values = Uint32Array.from(V, (_, i) => i);
  // Risky chaining due to Safari 14 https://github.com/d3/d3-array/issues/123
  values.sort(valueof === ascending ? (i, j) => ascendingDefined(V[i], V[j]) : compareDefined(compareIndex));
  values.forEach((j, i) => {
      const c = compareIndex(j, k === undefined ? j : k);
      if (c >= 0) {
        if (k === undefined || c > 0) k = j, r = i;
        R[j] = r;
      } else {
        R[j] = NaN;
      }
    });
  return R;
}

;// ./node_modules/d3-array/src/least.js


function least(values, compare = ascending) {
  let min;
  let defined = false;
  if (compare.length === 1) {
    let minValue;
    for (const element of values) {
      const value = compare(element);
      if (defined
          ? ascending(value, minValue) < 0
          : ascending(value, value) === 0) {
        min = element;
        minValue = value;
        defined = true;
      }
    }
  } else {
    for (const value of values) {
      if (defined
          ? compare(value, min) < 0
          : compare(value, value) === 0) {
        min = value;
        defined = true;
      }
    }
  }
  return min;
}

;// ./node_modules/d3-array/src/leastIndex.js



function leastIndex_leastIndex(values, compare = ascending) {
  if (compare.length === 1) return minIndex(values, compare);
  let minValue;
  let min = -1;
  let index = -1;
  for (const value of values) {
    ++index;
    if (min < 0
        ? compare(value, value) === 0
        : compare(value, minValue) < 0) {
      minValue = value;
      min = index;
    }
  }
  return min;
}

;// ./node_modules/d3-array/src/greatestIndex.js



function greatestIndex(values, compare = ascending) {
  if (compare.length === 1) return maxIndex(values, compare);
  let maxValue;
  let max = -1;
  let index = -1;
  for (const value of values) {
    ++index;
    if (max < 0
        ? compare(value, value) === 0
        : compare(value, maxValue) > 0) {
      maxValue = value;
      max = index;
    }
  }
  return max;
}

;// ./node_modules/d3-array/src/scan.js


function scan(values, compare) {
  const index = leastIndex(values, compare);
  return index < 0 ? undefined : index;
}

;// ./node_modules/d3-array/src/shuffle.js
/* harmony default export */ const shuffle = (shuffler(Math.random));

function shuffler(random) {
  return function shuffle(array, i0 = 0, i1 = array.length) {
    let m = i1 - (i0 = +i0);
    while (m) {
      const i = random() * m-- | 0, t = array[m + i0];
      array[m + i0] = array[i + i0];
      array[i + i0] = t;
    }
    return array;
  };
}

;// ./node_modules/d3-array/src/sum.js
function sum(values, valueof) {
  let sum = 0;
  if (valueof === undefined) {
    for (let value of values) {
      if (value = +value) {
        sum += value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if (value = +valueof(value, ++index, values)) {
        sum += value;
      }
    }
  }
  return sum;
}

;// ./node_modules/d3-array/src/transpose.js


function transpose_transpose(matrix) {
  if (!(n = matrix.length)) return [];
  for (var i = -1, m = min(matrix, transpose_length), transpose = new Array(m); ++i < m;) {
    for (var j = -1, n, row = transpose[i] = new Array(n); ++j < n;) {
      row[j] = matrix[j][i];
    }
  }
  return transpose;
}

function transpose_length(d) {
  return d.length;
}

;// ./node_modules/d3-array/src/zip.js


function zip() {
  return transpose(arguments);
}

;// ./node_modules/d3-array/src/every.js
function every(values, test) {
  if (typeof test !== "function") throw new TypeError("test is not a function");
  let index = -1;
  for (const value of values) {
    if (!test(value, ++index, values)) {
      return false;
    }
  }
  return true;
}

;// ./node_modules/d3-array/src/some.js
function some(values, test) {
  if (typeof test !== "function") throw new TypeError("test is not a function");
  let index = -1;
  for (const value of values) {
    if (test(value, ++index, values)) {
      return true;
    }
  }
  return false;
}

;// ./node_modules/d3-array/src/filter.js
function filter(values, test) {
  if (typeof test !== "function") throw new TypeError("test is not a function");
  const array = [];
  let index = -1;
  for (const value of values) {
    if (test(value, ++index, values)) {
      array.push(value);
    }
  }
  return array;
}

;// ./node_modules/d3-array/src/map.js
function map_map(values, mapper) {
  if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
  if (typeof mapper !== "function") throw new TypeError("mapper is not a function");
  return Array.from(values, (value, index) => mapper(value, index, values));
}

;// ./node_modules/d3-array/src/reduce.js
function reduce(values, reducer, value) {
  if (typeof reducer !== "function") throw new TypeError("reducer is not a function");
  const iterator = values[Symbol.iterator]();
  let done, next, index = -1;
  if (arguments.length < 3) {
    ({done, value} = iterator.next());
    if (done) return;
    ++index;
  }
  while (({done, value: next} = iterator.next()), !done) {
    value = reducer(value, next, ++index, values);
  }
  return value;
}

;// ./node_modules/d3-array/src/reverse.js
function reverse(values) {
  if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
  return Array.from(values).reverse();
}

;// ./node_modules/d3-array/src/difference.js


function difference(values, ...others) {
  values = new InternSet(values);
  for (const other of others) {
    for (const value of other) {
      values.delete(value);
    }
  }
  return values;
}

;// ./node_modules/d3-array/src/disjoint.js


function disjoint(values, other) {
  const iterator = other[Symbol.iterator](), set = new InternSet();
  for (const v of values) {
    if (set.has(v)) return false;
    let value, done;
    while (({value, done} = iterator.next())) {
      if (done) break;
      if (Object.is(v, value)) return false;
      set.add(value);
    }
  }
  return true;
}

;// ./node_modules/d3-array/src/intersection.js


function intersection(values, ...others) {
  values = new InternSet(values);
  others = others.map(set);
  out: for (const value of values) {
    for (const other of others) {
      if (!other.has(value)) {
        values.delete(value);
        continue out;
      }
    }
  }
  return values;
}

function set(values) {
  return values instanceof InternSet ? values : new InternSet(values);
}

;// ./node_modules/d3-array/src/superset.js
function superset_superset(values, other) {
  const iterator = values[Symbol.iterator](), set = new Set();
  for (const o of other) {
    const io = intern(o);
    if (set.has(io)) continue;
    let value, done;
    while (({value, done} = iterator.next())) {
      if (done) return false;
      const ivalue = intern(value);
      set.add(ivalue);
      if (Object.is(io, ivalue)) break;
    }
  }
  return true;
}

function intern(value) {
  return value !== null && typeof value === "object" ? value.valueOf() : value;
}

;// ./node_modules/d3-array/src/subset.js


function subset(values, other) {
  return superset(other, values);
}

;// ./node_modules/d3-array/src/union.js


function union(...others) {
  const set = new InternSet();
  for (const other of others) {
    for (const o of other) {
      set.add(o);
    }
  }
  return set;
}

;// ./node_modules/d3-array/src/index.js













 // Deprecated; use bin.






















 // Deprecated; use leastIndex.






















/***/ }),

/***/ 4417:
/***/ ((module) => {



module.exports = function (url, options) {
  if (!options) {
    options = {};
  }
  if (!url) {
    return url;
  }
  url = String(url.__esModule ? url.default : url);

  // If url is already wrapped in quotes, remove them
  if (/^['"].*['"]$/.test(url)) {
    url = url.slice(1, -1);
  }
  if (options.hash) {
    url += options.hash;
  }

  // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls
  if (/["'() \t\n]|(%20)/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), "\"");
  }
  return url;
};

/***/ }),

/***/ 7125:
/***/ ((__unused_webpack___webpack_module__, __unused_webpack___webpack_exports__, __webpack_require__) => {


// UNUSED EXPORTS: contourDensity, contours

// EXTERNAL MODULE: ./node_modules/d3-array/src/index.js + 60 modules
var src = __webpack_require__(3398);
;// ./node_modules/d3-contour/src/array.js
var array = Array.prototype;

var array_slice = array.slice;

;// ./node_modules/d3-contour/src/ascending.js
/* harmony default export */ function src_ascending(a, b) {
  return a - b;
}

;// ./node_modules/d3-contour/src/area.js
/* harmony default export */ function src_area(ring) {
  var i = 0, n = ring.length, area = ring[n - 1][1] * ring[0][0] - ring[n - 1][0] * ring[0][1];
  while (++i < n) area += ring[i - 1][1] * ring[i][0] - ring[i - 1][0] * ring[i][1];
  return area;
}

;// ./node_modules/d3-contour/src/constant.js
/* harmony default export */ const src_constant = (x => () => x);

;// ./node_modules/d3-contour/src/contains.js
/* harmony default export */ function src_contains(ring, hole) {
  var i = -1, n = hole.length, c;
  while (++i < n) if (c = ringContains(ring, hole[i])) return c;
  return 0;
}

function ringContains(ring, point) {
  var x = point[0], y = point[1], contains = -1;
  for (var i = 0, n = ring.length, j = n - 1; i < n; j = i++) {
    var pi = ring[i], xi = pi[0], yi = pi[1], pj = ring[j], xj = pj[0], yj = pj[1];
    if (segmentContains(pi, pj, point)) return 0;
    if (((yi > y) !== (yj > y)) && ((x < (xj - xi) * (y - yi) / (yj - yi) + xi))) contains = -contains;
  }
  return contains;
}

function segmentContains(a, b, c) {
  var i; return collinear(a, b, c) && within(a[i = +(a[0] === b[0])], c[i], b[i]);
}

function collinear(a, b, c) {
  return (b[0] - a[0]) * (c[1] - a[1]) === (c[0] - a[0]) * (b[1] - a[1]);
}

function within(p, q, r) {
  return p <= q && q <= r || r <= q && q <= p;
}

;// ./node_modules/d3-contour/src/noop.js
/* harmony default export */ function src_noop() {}

;// ./node_modules/d3-contour/src/contours.js








var cases = (/* unused pure expression or super */ null && ([
  [],
  [[[1.0, 1.5], [0.5, 1.0]]],
  [[[1.5, 1.0], [1.0, 1.5]]],
  [[[1.5, 1.0], [0.5, 1.0]]],
  [[[1.0, 0.5], [1.5, 1.0]]],
  [[[1.0, 1.5], [0.5, 1.0]], [[1.0, 0.5], [1.5, 1.0]]],
  [[[1.0, 0.5], [1.0, 1.5]]],
  [[[1.0, 0.5], [0.5, 1.0]]],
  [[[0.5, 1.0], [1.0, 0.5]]],
  [[[1.0, 1.5], [1.0, 0.5]]],
  [[[0.5, 1.0], [1.0, 0.5]], [[1.5, 1.0], [1.0, 1.5]]],
  [[[1.5, 1.0], [1.0, 0.5]]],
  [[[0.5, 1.0], [1.5, 1.0]]],
  [[[1.0, 1.5], [1.5, 1.0]]],
  [[[0.5, 1.0], [1.0, 1.5]]],
  []
]));

/* harmony default export */ function contours() {
  var dx = 1,
      dy = 1,
      threshold = thresholdSturges,
      smooth = smoothLinear;

  function contours(values) {
    var tz = threshold(values);

    // Convert number of thresholds into uniform thresholds.
    if (!Array.isArray(tz)) {
      const e = extent(values, finite);
      tz = ticks(...nice(e[0], e[1], tz), tz);
      while (tz[tz.length - 1] >= e[1]) tz.pop();
      while (tz[1] < e[0]) tz.shift();
    } else {
      tz = tz.slice().sort(ascending);
    }

    return tz.map(value => contour(values, value));
  }

  // Accumulate, smooth contour rings, assign holes to exterior rings.
  // Based on https://github.com/mbostock/shapefile/blob/v0.6.2/shp/polygon.js
  function contour(values, value) {
    const v = value == null ? NaN : +value;
    if (isNaN(v)) throw new Error(`invalid value: ${value}`);

    var polygons = [],
        holes = [];

    isorings(values, v, function(ring) {
      smooth(ring, values, v);
      if (area(ring) > 0) polygons.push([ring]);
      else holes.push(ring);
    });

    holes.forEach(function(hole) {
      for (var i = 0, n = polygons.length, polygon; i < n; ++i) {
        if (contains((polygon = polygons[i])[0], hole) !== -1) {
          polygon.push(hole);
          return;
        }
      }
    });

    return {
      type: "MultiPolygon",
      value: value,
      coordinates: polygons
    };
  }

  // Marching squares with isolines stitched into rings.
  // Based on https://github.com/topojson/topojson-client/blob/v3.0.0/src/stitch.js
  function isorings(values, value, callback) {
    var fragmentByStart = new Array,
        fragmentByEnd = new Array,
        x, y, t0, t1, t2, t3;

    // Special case for the first row (y = -1, t2 = t3 = 0).
    x = y = -1;
    t1 = above(values[0], value);
    cases[t1 << 1].forEach(stitch);
    while (++x < dx - 1) {
      t0 = t1, t1 = above(values[x + 1], value);
      cases[t0 | t1 << 1].forEach(stitch);
    }
    cases[t1 << 0].forEach(stitch);

    // General case for the intermediate rows.
    while (++y < dy - 1) {
      x = -1;
      t1 = above(values[y * dx + dx], value);
      t2 = above(values[y * dx], value);
      cases[t1 << 1 | t2 << 2].forEach(stitch);
      while (++x < dx - 1) {
        t0 = t1, t1 = above(values[y * dx + dx + x + 1], value);
        t3 = t2, t2 = above(values[y * dx + x + 1], value);
        cases[t0 | t1 << 1 | t2 << 2 | t3 << 3].forEach(stitch);
      }
      cases[t1 | t2 << 3].forEach(stitch);
    }

    // Special case for the last row (y = dy - 1, t0 = t1 = 0).
    x = -1;
    t2 = values[y * dx] >= value;
    cases[t2 << 2].forEach(stitch);
    while (++x < dx - 1) {
      t3 = t2, t2 = above(values[y * dx + x + 1], value);
      cases[t2 << 2 | t3 << 3].forEach(stitch);
    }
    cases[t2 << 3].forEach(stitch);

    function stitch(line) {
      var start = [line[0][0] + x, line[0][1] + y],
          end = [line[1][0] + x, line[1][1] + y],
          startIndex = index(start),
          endIndex = index(end),
          f, g;
      if (f = fragmentByEnd[startIndex]) {
        if (g = fragmentByStart[endIndex]) {
          delete fragmentByEnd[f.end];
          delete fragmentByStart[g.start];
          if (f === g) {
            f.ring.push(end);
            callback(f.ring);
          } else {
            fragmentByStart[f.start] = fragmentByEnd[g.end] = {start: f.start, end: g.end, ring: f.ring.concat(g.ring)};
          }
        } else {
          delete fragmentByEnd[f.end];
          f.ring.push(end);
          fragmentByEnd[f.end = endIndex] = f;
        }
      } else if (f = fragmentByStart[endIndex]) {
        if (g = fragmentByEnd[startIndex]) {
          delete fragmentByStart[f.start];
          delete fragmentByEnd[g.end];
          if (f === g) {
            f.ring.push(end);
            callback(f.ring);
          } else {
            fragmentByStart[g.start] = fragmentByEnd[f.end] = {start: g.start, end: f.end, ring: g.ring.concat(f.ring)};
          }
        } else {
          delete fragmentByStart[f.start];
          f.ring.unshift(start);
          fragmentByStart[f.start = startIndex] = f;
        }
      } else {
        fragmentByStart[startIndex] = fragmentByEnd[endIndex] = {start: startIndex, end: endIndex, ring: [start, end]};
      }
    }
  }

  function index(point) {
    return point[0] * 2 + point[1] * (dx + 1) * 4;
  }

  function smoothLinear(ring, values, value) {
    ring.forEach(function(point) {
      var x = point[0],
          y = point[1],
          xt = x | 0,
          yt = y | 0,
          v1 = valid(values[yt * dx + xt]);
      if (x > 0 && x < dx && xt === x) {
        point[0] = smooth1(x, valid(values[yt * dx + xt - 1]), v1, value);
      }
      if (y > 0 && y < dy && yt === y) {
        point[1] = smooth1(y, valid(values[(yt - 1) * dx + xt]), v1, value);
      }
    });
  }

  contours.contour = contour;

  contours.size = function(_) {
    if (!arguments.length) return [dx, dy];
    var _0 = Math.floor(_[0]), _1 = Math.floor(_[1]);
    if (!(_0 >= 0 && _1 >= 0)) throw new Error("invalid size");
    return dx = _0, dy = _1, contours;
  };

  contours.thresholds = function(_) {
    return arguments.length ? (threshold = typeof _ === "function" ? _ : Array.isArray(_) ? constant(slice.call(_)) : constant(_), contours) : threshold;
  };

  contours.smooth = function(_) {
    return arguments.length ? (smooth = _ ? smoothLinear : noop, contours) : smooth === smoothLinear;
  };

  return contours;
}

// When computing the extent, ignore infinite values (as well as invalid ones).
function finite(x) {
  return isFinite(x) ? x : NaN;
}

// Is the (possibly invalid) x greater than or equal to the (known valid) value?
// Treat any invalid value as below negative infinity.
function above(x, value) {
  return x == null ? false : +x >= value;
}

// During smoothing, treat any invalid value as negative infinity.
function valid(v) {
  return v == null || isNaN(v = +v) ? -Infinity : v;
}

function smooth1(x, v0, v1, value) {
  const a = value - v0;
  const b = v1 - v0;
  const d = isFinite(a) || isFinite(b) ? a / b : Math.sign(a) / Math.sign(b);
  return isNaN(d) ? x : x + d - 0.5;
}

;// ./node_modules/d3-contour/src/density.js





function defaultX(d) {
  return d[0];
}

function defaultY(d) {
  return d[1];
}

function defaultWeight() {
  return 1;
}

/* harmony default export */ function density() {
  var x = defaultX,
      y = defaultY,
      weight = defaultWeight,
      dx = 960,
      dy = 500,
      r = 20, // blur radius
      k = 2, // log2(grid cell size)
      o = r * 3, // grid offset, to pad for blur
      n = (dx + o * 2) >> k, // grid width
      m = (dy + o * 2) >> k, // grid height
      threshold = constant(20);

  function grid(data) {
    var values = new Float32Array(n * m),
        pow2k = Math.pow(2, -k),
        i = -1;

    for (const d of data) {
      var xi = (x(d, ++i, data) + o) * pow2k,
          yi = (y(d, i, data) + o) * pow2k,
          wi = +weight(d, i, data);
      if (wi && xi >= 0 && xi < n && yi >= 0 && yi < m) {
        var x0 = Math.floor(xi),
            y0 = Math.floor(yi),
            xt = xi - x0 - 0.5,
            yt = yi - y0 - 0.5;
        values[x0 + y0 * n] += (1 - xt) * (1 - yt) * wi;
        values[x0 + 1 + y0 * n] += xt * (1 - yt) * wi;
        values[x0 + 1 + (y0 + 1) * n] += xt * yt * wi;
        values[x0 + (y0 + 1) * n] += (1 - xt) * yt * wi;
      }
    }

    blur2({data: values, width: n, height: m}, r * pow2k);
    return values;
  }

  function density(data) {
    var values = grid(data),
        tz = threshold(values),
        pow4k = Math.pow(2, 2 * k);

    // Convert number of thresholds into uniform thresholds.
    if (!Array.isArray(tz)) {
      tz = ticks(Number.MIN_VALUE, max(values) / pow4k, tz);
    }

    return Contours()
        .size([n, m])
        .thresholds(tz.map(d => d * pow4k))
      (values)
        .map((c, i) => (c.value = +tz[i], transform(c)));
  }

  density.contours = function(data) {
    var values = grid(data),
        contours = Contours().size([n, m]),
        pow4k = Math.pow(2, 2 * k),
        contour = value => {
          value = +value;
          var c = transform(contours.contour(values, value * pow4k));
          c.value = value; // preserve exact threshold value
          return c;
        };
    Object.defineProperty(contour, "max", {get: () => max(values) / pow4k});
    return contour;
  };

  function transform(geometry) {
    geometry.coordinates.forEach(transformPolygon);
    return geometry;
  }

  function transformPolygon(coordinates) {
    coordinates.forEach(transformRing);
  }

  function transformRing(coordinates) {
    coordinates.forEach(transformPoint);
  }

  // TODO Optimize.
  function transformPoint(coordinates) {
    coordinates[0] = coordinates[0] * Math.pow(2, k) - o;
    coordinates[1] = coordinates[1] * Math.pow(2, k) - o;
  }

  function resize() {
    o = r * 3;
    n = (dx + o * 2) >> k;
    m = (dy + o * 2) >> k;
    return density;
  }

  density.x = function(_) {
    return arguments.length ? (x = typeof _ === "function" ? _ : constant(+_), density) : x;
  };

  density.y = function(_) {
    return arguments.length ? (y = typeof _ === "function" ? _ : constant(+_), density) : y;
  };

  density.weight = function(_) {
    return arguments.length ? (weight = typeof _ === "function" ? _ : constant(+_), density) : weight;
  };

  density.size = function(_) {
    if (!arguments.length) return [dx, dy];
    var _0 = +_[0], _1 = +_[1];
    if (!(_0 >= 0 && _1 >= 0)) throw new Error("invalid size");
    return dx = _0, dy = _1, resize();
  };

  density.cellSize = function(_) {
    if (!arguments.length) return 1 << k;
    if (!((_ = +_) >= 1)) throw new Error("invalid cell size");
    return k = Math.floor(Math.log(_) / Math.LN2), resize();
  };

  density.thresholds = function(_) {
    return arguments.length ? (threshold = typeof _ === "function" ? _ : Array.isArray(_) ? constant(slice.call(_)) : constant(_), density) : threshold;
  };

  density.bandwidth = function(_) {
    if (!arguments.length) return Math.sqrt(r * (r + 1));
    if (!((_ = +_) >= 0)) throw new Error("invalid bandwidth");
    return r = (Math.sqrt(4 * _ * _ + 1) - 1) / 2, resize();
  };

  return density;
}

;// ./node_modules/d3-contour/src/index.js




/***/ }),

/***/ 12944:
/***/ ((__unused_webpack___webpack_module__, __unused_webpack___webpack_exports__, __webpack_require__) => {


// UNUSED EXPORTS: chord, chordDirected, chordTranspose, ribbon, ribbonArrow

;// ./node_modules/d3-chord/src/math.js
var math_abs = Math.abs;
var math_cos = Math.cos;
var math_sin = Math.sin;
var pi = Math.PI;
var math_halfPi = pi / 2;
var math_tau = pi * 2;
var math_max = Math.max;
var math_epsilon = 1e-12;

;// ./node_modules/d3-chord/src/chord.js


function range(i, j) {
  return Array.from({length: j - i}, (_, k) => i + k);
}

function compareValue(compare) {
  return function(a, b) {
    return compare(
      a.source.value + a.target.value,
      b.source.value + b.target.value
    );
  };
}

/* harmony default export */ function chord() {
  return chord_chord(false, false);
}

function chordTranspose() {
  return chord_chord(false, true);
}

function chordDirected() {
  return chord_chord(true, false);
}

function chord_chord(directed, transpose) {
  var padAngle = 0,
      sortGroups = null,
      sortSubgroups = null,
      sortChords = null;

  function chord(matrix) {
    var n = matrix.length,
        groupSums = new Array(n),
        groupIndex = range(0, n),
        chords = new Array(n * n),
        groups = new Array(n),
        k = 0, dx;

    matrix = Float64Array.from({length: n * n}, transpose
        ? (_, i) => matrix[i % n][i / n | 0]
        : (_, i) => matrix[i / n | 0][i % n]);

    // Compute the scaling factor from value to angle in [0, 2pi].
    for (let i = 0; i < n; ++i) {
      let x = 0;
      for (let j = 0; j < n; ++j) x += matrix[i * n + j] + directed * matrix[j * n + i];
      k += groupSums[i] = x;
    }
    k = max(0, tau - padAngle * n) / k;
    dx = k ? padAngle : tau / n;

    // Compute the angles for each group and constituent chord.
    {
      let x = 0;
      if (sortGroups) groupIndex.sort((a, b) => sortGroups(groupSums[a], groupSums[b]));
      for (const i of groupIndex) {
        const x0 = x;
        if (directed) {
          const subgroupIndex = range(~n + 1, n).filter(j => j < 0 ? matrix[~j * n + i] : matrix[i * n + j]);
          if (sortSubgroups) subgroupIndex.sort((a, b) => sortSubgroups(a < 0 ? -matrix[~a * n + i] : matrix[i * n + a], b < 0 ? -matrix[~b * n + i] : matrix[i * n + b]));
          for (const j of subgroupIndex) {
            if (j < 0) {
              const chord = chords[~j * n + i] || (chords[~j * n + i] = {source: null, target: null});
              chord.target = {index: i, startAngle: x, endAngle: x += matrix[~j * n + i] * k, value: matrix[~j * n + i]};
            } else {
              const chord = chords[i * n + j] || (chords[i * n + j] = {source: null, target: null});
              chord.source = {index: i, startAngle: x, endAngle: x += matrix[i * n + j] * k, value: matrix[i * n + j]};
            }
          }
          groups[i] = {index: i, startAngle: x0, endAngle: x, value: groupSums[i]};
        } else {
          const subgroupIndex = range(0, n).filter(j => matrix[i * n + j] || matrix[j * n + i]);
          if (sortSubgroups) subgroupIndex.sort((a, b) => sortSubgroups(matrix[i * n + a], matrix[i * n + b]));
          for (const j of subgroupIndex) {
            let chord;
            if (i < j) {
              chord = chords[i * n + j] || (chords[i * n + j] = {source: null, target: null});
              chord.source = {index: i, startAngle: x, endAngle: x += matrix[i * n + j] * k, value: matrix[i * n + j]};
            } else {
              chord = chords[j * n + i] || (chords[j * n + i] = {source: null, target: null});
              chord.target = {index: i, startAngle: x, endAngle: x += matrix[i * n + j] * k, value: matrix[i * n + j]};
              if (i === j) chord.source = chord.target;
            }
            if (chord.source && chord.target && chord.source.value < chord.target.value) {
              const source = chord.source;
              chord.source = chord.target;
              chord.target = source;
            }
          }
          groups[i] = {index: i, startAngle: x0, endAngle: x, value: groupSums[i]};
        }
        x += dx;
      }
    }

    // Remove empty chords.
    chords = Object.values(chords);
    chords.groups = groups;
    return sortChords ? chords.sort(sortChords) : chords;
  }

  chord.padAngle = function(_) {
    return arguments.length ? (padAngle = max(0, _), chord) : padAngle;
  };

  chord.sortGroups = function(_) {
    return arguments.length ? (sortGroups = _, chord) : sortGroups;
  };

  chord.sortSubgroups = function(_) {
    return arguments.length ? (sortSubgroups = _, chord) : sortSubgroups;
  };

  chord.sortChords = function(_) {
    return arguments.length ? (_ == null ? sortChords = null : (sortChords = compareValue(_))._ = _, chord) : sortChords && sortChords._;
  };

  return chord;
}

// EXTERNAL MODULE: ./node_modules/d3-path/src/index.js + 1 modules
var src = __webpack_require__(79498);
;// ./node_modules/d3-chord/src/array.js
var array_slice = Array.prototype.slice;

;// ./node_modules/d3-chord/src/constant.js
/* harmony default export */ function src_constant(x) {
  return function() {
    return x;
  };
}

;// ./node_modules/d3-chord/src/ribbon.js





function defaultSource(d) {
  return d.source;
}

function defaultTarget(d) {
  return d.target;
}

function defaultRadius(d) {
  return d.radius;
}

function defaultStartAngle(d) {
  return d.startAngle;
}

function defaultEndAngle(d) {
  return d.endAngle;
}

function defaultPadAngle() {
  return 0;
}

function defaultArrowheadRadius() {
  return 10;
}

function ribbon(headRadius) {
  var source = defaultSource,
      target = defaultTarget,
      sourceRadius = defaultRadius,
      targetRadius = defaultRadius,
      startAngle = defaultStartAngle,
      endAngle = defaultEndAngle,
      padAngle = defaultPadAngle,
      context = null;

  function ribbon() {
    var buffer,
        s = source.apply(this, arguments),
        t = target.apply(this, arguments),
        ap = padAngle.apply(this, arguments) / 2,
        argv = slice.call(arguments),
        sr = +sourceRadius.apply(this, (argv[0] = s, argv)),
        sa0 = startAngle.apply(this, argv) - halfPi,
        sa1 = endAngle.apply(this, argv) - halfPi,
        tr = +targetRadius.apply(this, (argv[0] = t, argv)),
        ta0 = startAngle.apply(this, argv) - halfPi,
        ta1 = endAngle.apply(this, argv) - halfPi;

    if (!context) context = buffer = path();

    if (ap > epsilon) {
      if (abs(sa1 - sa0) > ap * 2 + epsilon) sa1 > sa0 ? (sa0 += ap, sa1 -= ap) : (sa0 -= ap, sa1 += ap);
      else sa0 = sa1 = (sa0 + sa1) / 2;
      if (abs(ta1 - ta0) > ap * 2 + epsilon) ta1 > ta0 ? (ta0 += ap, ta1 -= ap) : (ta0 -= ap, ta1 += ap);
      else ta0 = ta1 = (ta0 + ta1) / 2;
    }

    context.moveTo(sr * cos(sa0), sr * sin(sa0));
    context.arc(0, 0, sr, sa0, sa1);
    if (sa0 !== ta0 || sa1 !== ta1) {
      if (headRadius) {
        var hr = +headRadius.apply(this, arguments), tr2 = tr - hr, ta2 = (ta0 + ta1) / 2;
        context.quadraticCurveTo(0, 0, tr2 * cos(ta0), tr2 * sin(ta0));
        context.lineTo(tr * cos(ta2), tr * sin(ta2));
        context.lineTo(tr2 * cos(ta1), tr2 * sin(ta1));
      } else {
        context.quadraticCurveTo(0, 0, tr * cos(ta0), tr * sin(ta0));
        context.arc(0, 0, tr, ta0, ta1);
      }
    }
    context.quadraticCurveTo(0, 0, sr * cos(sa0), sr * sin(sa0));
    context.closePath();

    if (buffer) return context = null, buffer + "" || null;
  }

  if (headRadius) ribbon.headRadius = function(_) {
    return arguments.length ? (headRadius = typeof _ === "function" ? _ : constant(+_), ribbon) : headRadius;
  };

  ribbon.radius = function(_) {
    return arguments.length ? (sourceRadius = targetRadius = typeof _ === "function" ? _ : constant(+_), ribbon) : sourceRadius;
  };

  ribbon.sourceRadius = function(_) {
    return arguments.length ? (sourceRadius = typeof _ === "function" ? _ : constant(+_), ribbon) : sourceRadius;
  };

  ribbon.targetRadius = function(_) {
    return arguments.length ? (targetRadius = typeof _ === "function" ? _ : constant(+_), ribbon) : targetRadius;
  };

  ribbon.startAngle = function(_) {
    return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant(+_), ribbon) : startAngle;
  };

  ribbon.endAngle = function(_) {
    return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant(+_), ribbon) : endAngle;
  };

  ribbon.padAngle = function(_) {
    return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant(+_), ribbon) : padAngle;
  };

  ribbon.source = function(_) {
    return arguments.length ? (source = _, ribbon) : source;
  };

  ribbon.target = function(_) {
    return arguments.length ? (target = _, ribbon) : target;
  };

  ribbon.context = function(_) {
    return arguments.length ? ((context = _ == null ? null : _), ribbon) : context;
  };

  return ribbon;
}

/* harmony default export */ function src_ribbon() {
  return ribbon();
}

function ribbonArrow() {
  return ribbon(defaultArrowheadRadius);
}

;// ./node_modules/d3-chord/src/index.js




/***/ }),

/***/ 18246:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  GP: () => (/* reexport */ format),
  s: () => (/* reexport */ formatPrefix),
  Gp: () => (/* reexport */ formatSpecifier),
  RT: () => (/* reexport */ precisionFixed),
  dT: () => (/* reexport */ precisionPrefix),
  Pj: () => (/* reexport */ precisionRound)
});

// UNUSED EXPORTS: FormatSpecifier, formatDefaultLocale, formatLocale

;// ./node_modules/d3-format/src/formatDecimal.js
/* harmony default export */ function formatDecimal(x) {
  return Math.abs(x = Math.round(x)) >= 1e21
      ? x.toLocaleString("en").replace(/,/g, "")
      : x.toString(10);
}

// Computes the decimal coefficient and exponent of the specified number x with
// significant digits p, where x is positive and p is in [1, 21] or undefined.
// For example, formatDecimalParts(1.23) returns ["123", 0].
function formatDecimalParts(x, p) {
  if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
  var i, coefficient = x.slice(0, i);

  // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
  // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
  return [
    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
    +x.slice(i + 1)
  ];
}

;// ./node_modules/d3-format/src/exponent.js


/* harmony default export */ function exponent(x) {
  return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
}

;// ./node_modules/d3-format/src/formatGroup.js
/* harmony default export */ function formatGroup(grouping, thousands) {
  return function(value, width) {
    var i = value.length,
        t = [],
        j = 0,
        g = grouping[0],
        length = 0;

    while (i > 0 && g > 0) {
      if (length + g + 1 > width) g = Math.max(1, width - length);
      t.push(value.substring(i -= g, i + g));
      if ((length += g + 1) > width) break;
      g = grouping[j = (j + 1) % grouping.length];
    }

    return t.reverse().join(thousands);
  };
}

;// ./node_modules/d3-format/src/formatNumerals.js
/* harmony default export */ function formatNumerals(numerals) {
  return function(value) {
    return value.replace(/[0-9]/g, function(i) {
      return numerals[+i];
    });
  };
}

;// ./node_modules/d3-format/src/formatSpecifier.js
// [[fill]align][sign][symbol][0][width][,][.precision][~][type]
var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

function formatSpecifier(specifier) {
  if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
  var match;
  return new FormatSpecifier({
    fill: match[1],
    align: match[2],
    sign: match[3],
    symbol: match[4],
    zero: match[5],
    width: match[6],
    comma: match[7],
    precision: match[8] && match[8].slice(1),
    trim: match[9],
    type: match[10]
  });
}

formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

function FormatSpecifier(specifier) {
  this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
  this.align = specifier.align === undefined ? ">" : specifier.align + "";
  this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
  this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
  this.zero = !!specifier.zero;
  this.width = specifier.width === undefined ? undefined : +specifier.width;
  this.comma = !!specifier.comma;
  this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
  this.trim = !!specifier.trim;
  this.type = specifier.type === undefined ? "" : specifier.type + "";
}

FormatSpecifier.prototype.toString = function() {
  return this.fill
      + this.align
      + this.sign
      + this.symbol
      + (this.zero ? "0" : "")
      + (this.width === undefined ? "" : Math.max(1, this.width | 0))
      + (this.comma ? "," : "")
      + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
      + (this.trim ? "~" : "")
      + this.type;
};

;// ./node_modules/d3-format/src/formatTrim.js
// Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
/* harmony default export */ function formatTrim(s) {
  out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
    switch (s[i]) {
      case ".": i0 = i1 = i; break;
      case "0": if (i0 === 0) i0 = i; i1 = i; break;
      default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
    }
  }
  return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
}

;// ./node_modules/d3-format/src/formatPrefixAuto.js


var prefixExponent;

/* harmony default export */ function formatPrefixAuto(x, p) {
  var d = formatDecimalParts(x, p);
  if (!d) return x + "";
  var coefficient = d[0],
      exponent = d[1],
      i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
      n = coefficient.length;
  return i === n ? coefficient
      : i > n ? coefficient + new Array(i - n + 1).join("0")
      : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
      : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
}

;// ./node_modules/d3-format/src/formatRounded.js


/* harmony default export */ function formatRounded(x, p) {
  var d = formatDecimalParts(x, p);
  if (!d) return x + "";
  var coefficient = d[0],
      exponent = d[1];
  return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
      : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
      : coefficient + new Array(exponent - coefficient.length + 2).join("0");
}

;// ./node_modules/d3-format/src/formatTypes.js




/* harmony default export */ const formatTypes = ({
  "%": (x, p) => (x * 100).toFixed(p),
  "b": (x) => Math.round(x).toString(2),
  "c": (x) => x + "",
  "d": formatDecimal,
  "e": (x, p) => x.toExponential(p),
  "f": (x, p) => x.toFixed(p),
  "g": (x, p) => x.toPrecision(p),
  "o": (x) => Math.round(x).toString(8),
  "p": (x, p) => formatRounded(x * 100, p),
  "r": formatRounded,
  "s": formatPrefixAuto,
  "X": (x) => Math.round(x).toString(16).toUpperCase(),
  "x": (x) => Math.round(x).toString(16)
});

;// ./node_modules/d3-format/src/identity.js
/* harmony default export */ function identity(x) {
  return x;
}

;// ./node_modules/d3-format/src/locale.js









var map = Array.prototype.map,
    prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

/* harmony default export */ function locale(locale) {
  var group = locale.grouping === undefined || locale.thousands === undefined ? identity : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
      currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
      currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
      decimal = locale.decimal === undefined ? "." : locale.decimal + "",
      numerals = locale.numerals === undefined ? identity : formatNumerals(map.call(locale.numerals, String)),
      percent = locale.percent === undefined ? "%" : locale.percent + "",
      minus = locale.minus === undefined ? "−" : locale.minus + "",
      nan = locale.nan === undefined ? "NaN" : locale.nan + "";

  function newFormat(specifier) {
    specifier = formatSpecifier(specifier);

    var fill = specifier.fill,
        align = specifier.align,
        sign = specifier.sign,
        symbol = specifier.symbol,
        zero = specifier.zero,
        width = specifier.width,
        comma = specifier.comma,
        precision = specifier.precision,
        trim = specifier.trim,
        type = specifier.type;

    // The "n" type is an alias for ",g".
    if (type === "n") comma = true, type = "g";

    // The "" type, and any invalid type, is an alias for ".12~g".
    else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

    // If zero fill is specified, padding goes after sign and before digits.
    if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

    // Compute the prefix and suffix.
    // For SI-prefix, the suffix is lazily computed.
    var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
        suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

    // What format function should we use?
    // Is this an integer type?
    // Can this type generate exponential notation?
    var formatType = formatTypes[type],
        maybeSuffix = /[defgprs%]/.test(type);

    // Set the default precision if not specified,
    // or clamp the specified precision to the supported range.
    // For significant precision, it must be in [1, 21].
    // For fixed precision, it must be in [0, 20].
    precision = precision === undefined ? 6
        : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
        : Math.max(0, Math.min(20, precision));

    function format(value) {
      var valuePrefix = prefix,
          valueSuffix = suffix,
          i, n, c;

      if (type === "c") {
        valueSuffix = formatType(value) + valueSuffix;
        value = "";
      } else {
        value = +value;

        // Determine the sign. -0 is not less than 0, but 1 / -0 is!
        var valueNegative = value < 0 || 1 / value < 0;

        // Perform the initial formatting.
        value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

        // Trim insignificant zeros.
        if (trim) value = formatTrim(value);

        // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
        if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

        // Compute the prefix and suffix.
        valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
        valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

        // Break the formatted value into the integer “value” part that can be
        // grouped, and fractional or exponential “suffix” part that is not.
        if (maybeSuffix) {
          i = -1, n = value.length;
          while (++i < n) {
            if (c = value.charCodeAt(i), 48 > c || c > 57) {
              valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
              value = value.slice(0, i);
              break;
            }
          }
        }
      }

      // If the fill character is not "0", grouping is applied before padding.
      if (comma && !zero) value = group(value, Infinity);

      // Compute the padding.
      var length = valuePrefix.length + value.length + valueSuffix.length,
          padding = length < width ? new Array(width - length + 1).join(fill) : "";

      // If the fill character is "0", grouping is applied after padding.
      if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

      // Reconstruct the final output based on the desired alignment.
      switch (align) {
        case "<": value = valuePrefix + value + valueSuffix + padding; break;
        case "=": value = valuePrefix + padding + value + valueSuffix; break;
        case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
        default: value = padding + valuePrefix + value + valueSuffix; break;
      }

      return numerals(value);
    }

    format.toString = function() {
      return specifier + "";
    };

    return format;
  }

  function formatPrefix(specifier, value) {
    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
        e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
        k = Math.pow(10, -e),
        prefix = prefixes[8 + e / 3];
    return function(value) {
      return f(k * value) + prefix;
    };
  }

  return {
    format: newFormat,
    formatPrefix: formatPrefix
  };
}

;// ./node_modules/d3-format/src/defaultLocale.js


var defaultLocale_locale;
var format;
var formatPrefix;

defaultLocale({
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});

function defaultLocale(definition) {
  defaultLocale_locale = locale(definition);
  format = defaultLocale_locale.format;
  formatPrefix = defaultLocale_locale.formatPrefix;
  return defaultLocale_locale;
}

;// ./node_modules/d3-format/src/precisionFixed.js


/* harmony default export */ function precisionFixed(step) {
  return Math.max(0, -exponent(Math.abs(step)));
}

;// ./node_modules/d3-format/src/precisionPrefix.js


/* harmony default export */ function precisionPrefix(step, value) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
}

;// ./node_modules/d3-format/src/precisionRound.js


/* harmony default export */ function precisionRound(step, max) {
  step = Math.abs(step), max = Math.abs(max) - step;
  return Math.max(0, exponent(max) - exponent(step)) + 1;
}

;// ./node_modules/d3-format/src/index.js








/***/ }),

/***/ 45058:
/***/ ((__unused_webpack___webpack_module__, __unused_webpack___webpack_exports__, __webpack_require__) => {


// UNUSED EXPORTS: Delaunay, Voronoi

// EXTERNAL MODULE: ./node_modules/delaunator/index.js
var delaunator = __webpack_require__(40123);
;// ./node_modules/d3-delaunay/src/path.js
const epsilon = 1e-6;

class path_Path {
  constructor() {
    this._x0 = this._y0 = // start of current subpath
    this._x1 = this._y1 = null; // end of current subpath
    this._ = "";
  }
  moveTo(x, y) {
    this._ += `M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}`;
  }
  closePath() {
    if (this._x1 !== null) {
      this._x1 = this._x0, this._y1 = this._y0;
      this._ += "Z";
    }
  }
  lineTo(x, y) {
    this._ += `L${this._x1 = +x},${this._y1 = +y}`;
  }
  arc(x, y, r) {
    x = +x, y = +y, r = +r;
    const x0 = x + r;
    const y0 = y;
    if (r < 0) throw new Error("negative radius");
    if (this._x1 === null) this._ += `M${x0},${y0}`;
    else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) this._ += "L" + x0 + "," + y0;
    if (!r) return;
    this._ += `A${r},${r},0,1,1,${x - r},${y}A${r},${r},0,1,1,${this._x1 = x0},${this._y1 = y0}`;
  }
  rect(x, y, w, h) {
    this._ += `M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}h${+w}v${+h}h${-w}Z`;
  }
  value() {
    return this._ || null;
  }
}

;// ./node_modules/d3-delaunay/src/polygon.js
class polygon_Polygon {
  constructor() {
    this._ = [];
  }
  moveTo(x, y) {
    this._.push([x, y]);
  }
  closePath() {
    this._.push(this._[0].slice());
  }
  lineTo(x, y) {
    this._.push([x, y]);
  }
  value() {
    return this._.length ? this._ : null;
  }
}

;// ./node_modules/d3-delaunay/src/voronoi.js



class voronoi_Voronoi {
  constructor(delaunay, [xmin, ymin, xmax, ymax] = [0, 0, 960, 500]) {
    if (!((xmax = +xmax) >= (xmin = +xmin)) || !((ymax = +ymax) >= (ymin = +ymin))) throw new Error("invalid bounds");
    this.delaunay = delaunay;
    this._circumcenters = new Float64Array(delaunay.points.length * 2);
    this.vectors = new Float64Array(delaunay.points.length * 2);
    this.xmax = xmax, this.xmin = xmin;
    this.ymax = ymax, this.ymin = ymin;
    this._init();
  }
  update() {
    this.delaunay.update();
    this._init();
    return this;
  }
  _init() {
    const {delaunay: {points, hull, triangles}, vectors} = this;
    let bx, by; // lazily computed barycenter of the hull

    // Compute circumcenters.
    const circumcenters = this.circumcenters = this._circumcenters.subarray(0, triangles.length / 3 * 2);
    for (let i = 0, j = 0, n = triangles.length, x, y; i < n; i += 3, j += 2) {
      const t1 = triangles[i] * 2;
      const t2 = triangles[i + 1] * 2;
      const t3 = triangles[i + 2] * 2;
      const x1 = points[t1];
      const y1 = points[t1 + 1];
      const x2 = points[t2];
      const y2 = points[t2 + 1];
      const x3 = points[t3];
      const y3 = points[t3 + 1];

      const dx = x2 - x1;
      const dy = y2 - y1;
      const ex = x3 - x1;
      const ey = y3 - y1;
      const ab = (dx * ey - dy * ex) * 2;

      if (Math.abs(ab) < 1e-9) {
        // For a degenerate triangle, the circumcenter is at the infinity, in a
        // direction orthogonal to the halfedge and away from the “center” of
        // the diagram <bx, by>, defined as the hull’s barycenter.
        if (bx === undefined) {
          bx = by = 0;
          for (const i of hull) bx += points[i * 2], by += points[i * 2 + 1];
          bx /= hull.length, by /= hull.length;
        }
        const a = 1e9 * Math.sign((bx - x1) * ey - (by - y1) * ex);
        x = (x1 + x3) / 2 - a * ey;
        y = (y1 + y3) / 2 + a * ex;
      } else {
        const d = 1 / ab;
        const bl = dx * dx + dy * dy;
        const cl = ex * ex + ey * ey;
        x = x1 + (ey * bl - dy * cl) * d;
        y = y1 + (dx * cl - ex * bl) * d;
      }
      circumcenters[j] = x;
      circumcenters[j + 1] = y;
    }

    // Compute exterior cell rays.
    let h = hull[hull.length - 1];
    let p0, p1 = h * 4;
    let x0, x1 = points[2 * h];
    let y0, y1 = points[2 * h + 1];
    vectors.fill(0);
    for (let i = 0; i < hull.length; ++i) {
      h = hull[i];
      p0 = p1, x0 = x1, y0 = y1;
      p1 = h * 4, x1 = points[2 * h], y1 = points[2 * h + 1];
      vectors[p0 + 2] = vectors[p1] = y0 - y1;
      vectors[p0 + 3] = vectors[p1 + 1] = x1 - x0;
    }
  }
  render(context) {
    const buffer = context == null ? context = new Path : undefined;
    const {delaunay: {halfedges, inedges, hull}, circumcenters, vectors} = this;
    if (hull.length <= 1) return null;
    for (let i = 0, n = halfedges.length; i < n; ++i) {
      const j = halfedges[i];
      if (j < i) continue;
      const ti = Math.floor(i / 3) * 2;
      const tj = Math.floor(j / 3) * 2;
      const xi = circumcenters[ti];
      const yi = circumcenters[ti + 1];
      const xj = circumcenters[tj];
      const yj = circumcenters[tj + 1];
      this._renderSegment(xi, yi, xj, yj, context);
    }
    let h0, h1 = hull[hull.length - 1];
    for (let i = 0; i < hull.length; ++i) {
      h0 = h1, h1 = hull[i];
      const t = Math.floor(inedges[h1] / 3) * 2;
      const x = circumcenters[t];
      const y = circumcenters[t + 1];
      const v = h0 * 4;
      const p = this._project(x, y, vectors[v + 2], vectors[v + 3]);
      if (p) this._renderSegment(x, y, p[0], p[1], context);
    }
    return buffer && buffer.value();
  }
  renderBounds(context) {
    const buffer = context == null ? context = new Path : undefined;
    context.rect(this.xmin, this.ymin, this.xmax - this.xmin, this.ymax - this.ymin);
    return buffer && buffer.value();
  }
  renderCell(i, context) {
    const buffer = context == null ? context = new Path : undefined;
    const points = this._clip(i);
    if (points === null || !points.length) return;
    context.moveTo(points[0], points[1]);
    let n = points.length;
    while (points[0] === points[n-2] && points[1] === points[n-1] && n > 1) n -= 2;
    for (let i = 2; i < n; i += 2) {
      if (points[i] !== points[i-2] || points[i+1] !== points[i-1])
        context.lineTo(points[i], points[i + 1]);
    }
    context.closePath();
    return buffer && buffer.value();
  }
  *cellPolygons() {
    const {delaunay: {points}} = this;
    for (let i = 0, n = points.length / 2; i < n; ++i) {
      const cell = this.cellPolygon(i);
      if (cell) cell.index = i, yield cell;
    }
  }
  cellPolygon(i) {
    const polygon = new Polygon;
    this.renderCell(i, polygon);
    return polygon.value();
  }
  _renderSegment(x0, y0, x1, y1, context) {
    let S;
    const c0 = this._regioncode(x0, y0);
    const c1 = this._regioncode(x1, y1);
    if (c0 === 0 && c1 === 0) {
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
    } else if (S = this._clipSegment(x0, y0, x1, y1, c0, c1)) {
      context.moveTo(S[0], S[1]);
      context.lineTo(S[2], S[3]);
    }
  }
  contains(i, x, y) {
    if ((x = +x, x !== x) || (y = +y, y !== y)) return false;
    return this.delaunay._step(i, x, y) === i;
  }
  *neighbors(i) {
    const ci = this._clip(i);
    if (ci) for (const j of this.delaunay.neighbors(i)) {
      const cj = this._clip(j);
      // find the common edge
      if (cj) loop: for (let ai = 0, li = ci.length; ai < li; ai += 2) {
        for (let aj = 0, lj = cj.length; aj < lj; aj += 2) {
          if (ci[ai] === cj[aj]
              && ci[ai + 1] === cj[aj + 1]
              && ci[(ai + 2) % li] === cj[(aj + lj - 2) % lj]
              && ci[(ai + 3) % li] === cj[(aj + lj - 1) % lj]) {
            yield j;
            break loop;
          }
        }
      }
    }
  }
  _cell(i) {
    const {circumcenters, delaunay: {inedges, halfedges, triangles}} = this;
    const e0 = inedges[i];
    if (e0 === -1) return null; // coincident point
    const points = [];
    let e = e0;
    do {
      const t = Math.floor(e / 3);
      points.push(circumcenters[t * 2], circumcenters[t * 2 + 1]);
      e = e % 3 === 2 ? e - 2 : e + 1;
      if (triangles[e] !== i) break; // bad triangulation
      e = halfedges[e];
    } while (e !== e0 && e !== -1);
    return points;
  }
  _clip(i) {
    // degenerate case (1 valid point: return the box)
    if (i === 0 && this.delaunay.hull.length === 1) {
      return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
    }
    const points = this._cell(i);
    if (points === null) return null;
    const {vectors: V} = this;
    const v = i * 4;
    return this._simplify(V[v] || V[v + 1]
        ? this._clipInfinite(i, points, V[v], V[v + 1], V[v + 2], V[v + 3])
        : this._clipFinite(i, points));
  }
  _clipFinite(i, points) {
    const n = points.length;
    let P = null;
    let x0, y0, x1 = points[n - 2], y1 = points[n - 1];
    let c0, c1 = this._regioncode(x1, y1);
    let e0, e1 = 0;
    for (let j = 0; j < n; j += 2) {
      x0 = x1, y0 = y1, x1 = points[j], y1 = points[j + 1];
      c0 = c1, c1 = this._regioncode(x1, y1);
      if (c0 === 0 && c1 === 0) {
        e0 = e1, e1 = 0;
        if (P) P.push(x1, y1);
        else P = [x1, y1];
      } else {
        let S, sx0, sy0, sx1, sy1;
        if (c0 === 0) {
          if ((S = this._clipSegment(x0, y0, x1, y1, c0, c1)) === null) continue;
          [sx0, sy0, sx1, sy1] = S;
        } else {
          if ((S = this._clipSegment(x1, y1, x0, y0, c1, c0)) === null) continue;
          [sx1, sy1, sx0, sy0] = S;
          e0 = e1, e1 = this._edgecode(sx0, sy0);
          if (e0 && e1) this._edge(i, e0, e1, P, P.length);
          if (P) P.push(sx0, sy0);
          else P = [sx0, sy0];
        }
        e0 = e1, e1 = this._edgecode(sx1, sy1);
        if (e0 && e1) this._edge(i, e0, e1, P, P.length);
        if (P) P.push(sx1, sy1);
        else P = [sx1, sy1];
      }
    }
    if (P) {
      e0 = e1, e1 = this._edgecode(P[0], P[1]);
      if (e0 && e1) this._edge(i, e0, e1, P, P.length);
    } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
      return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
    }
    return P;
  }
  _clipSegment(x0, y0, x1, y1, c0, c1) {
    // for more robustness, always consider the segment in the same order
    const flip = c0 < c1;
    if (flip) [x0, y0, x1, y1, c0, c1] = [x1, y1, x0, y0, c1, c0];
    while (true) {
      if (c0 === 0 && c1 === 0) return flip ? [x1, y1, x0, y0] : [x0, y0, x1, y1];
      if (c0 & c1) return null;
      let x, y, c = c0 || c1;
      if (c & 0b1000) x = x0 + (x1 - x0) * (this.ymax - y0) / (y1 - y0), y = this.ymax;
      else if (c & 0b0100) x = x0 + (x1 - x0) * (this.ymin - y0) / (y1 - y0), y = this.ymin;
      else if (c & 0b0010) y = y0 + (y1 - y0) * (this.xmax - x0) / (x1 - x0), x = this.xmax;
      else y = y0 + (y1 - y0) * (this.xmin - x0) / (x1 - x0), x = this.xmin;
      if (c0) x0 = x, y0 = y, c0 = this._regioncode(x0, y0);
      else x1 = x, y1 = y, c1 = this._regioncode(x1, y1);
    }
  }
  _clipInfinite(i, points, vx0, vy0, vxn, vyn) {
    let P = Array.from(points), p;
    if (p = this._project(P[0], P[1], vx0, vy0)) P.unshift(p[0], p[1]);
    if (p = this._project(P[P.length - 2], P[P.length - 1], vxn, vyn)) P.push(p[0], p[1]);
    if (P = this._clipFinite(i, P)) {
      for (let j = 0, n = P.length, c0, c1 = this._edgecode(P[n - 2], P[n - 1]); j < n; j += 2) {
        c0 = c1, c1 = this._edgecode(P[j], P[j + 1]);
        if (c0 && c1) j = this._edge(i, c0, c1, P, j), n = P.length;
      }
    } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
      P = [this.xmin, this.ymin, this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax];
    }
    return P;
  }
  _edge(i, e0, e1, P, j) {
    while (e0 !== e1) {
      let x, y;
      switch (e0) {
        case 0b0101: e0 = 0b0100; continue; // top-left
        case 0b0100: e0 = 0b0110, x = this.xmax, y = this.ymin; break; // top
        case 0b0110: e0 = 0b0010; continue; // top-right
        case 0b0010: e0 = 0b1010, x = this.xmax, y = this.ymax; break; // right
        case 0b1010: e0 = 0b1000; continue; // bottom-right
        case 0b1000: e0 = 0b1001, x = this.xmin, y = this.ymax; break; // bottom
        case 0b1001: e0 = 0b0001; continue; // bottom-left
        case 0b0001: e0 = 0b0101, x = this.xmin, y = this.ymin; break; // left
      }
      // Note: this implicitly checks for out of bounds: if P[j] or P[j+1] are
      // undefined, the conditional statement will be executed.
      if ((P[j] !== x || P[j + 1] !== y) && this.contains(i, x, y)) {
        P.splice(j, 0, x, y), j += 2;
      }
    }
    return j;
  }
  _project(x0, y0, vx, vy) {
    let t = Infinity, c, x, y;
    if (vy < 0) { // top
      if (y0 <= this.ymin) return null;
      if ((c = (this.ymin - y0) / vy) < t) y = this.ymin, x = x0 + (t = c) * vx;
    } else if (vy > 0) { // bottom
      if (y0 >= this.ymax) return null;
      if ((c = (this.ymax - y0) / vy) < t) y = this.ymax, x = x0 + (t = c) * vx;
    }
    if (vx > 0) { // right
      if (x0 >= this.xmax) return null;
      if ((c = (this.xmax - x0) / vx) < t) x = this.xmax, y = y0 + (t = c) * vy;
    } else if (vx < 0) { // left
      if (x0 <= this.xmin) return null;
      if ((c = (this.xmin - x0) / vx) < t) x = this.xmin, y = y0 + (t = c) * vy;
    }
    return [x, y];
  }
  _edgecode(x, y) {
    return (x === this.xmin ? 0b0001
        : x === this.xmax ? 0b0010 : 0b0000)
        | (y === this.ymin ? 0b0100
        : y === this.ymax ? 0b1000 : 0b0000);
  }
  _regioncode(x, y) {
    return (x < this.xmin ? 0b0001
        : x > this.xmax ? 0b0010 : 0b0000)
        | (y < this.ymin ? 0b0100
        : y > this.ymax ? 0b1000 : 0b0000);
  }
  _simplify(P) {
    if (P && P.length > 4) {
      for (let i = 0; i < P.length; i+= 2) {
        const j = (i + 2) % P.length, k = (i + 4) % P.length;
        if (P[i] === P[j] && P[j] === P[k] || P[i + 1] === P[j + 1] && P[j + 1] === P[k + 1]) {
          P.splice(j, 2), i -= 2;
        }
      }
      if (!P.length) P = null;
    }
    return P;
  }
}

;// ./node_modules/d3-delaunay/src/delaunay.js





const tau = 2 * Math.PI, pow = Math.pow;

function pointX(p) {
  return p[0];
}

function pointY(p) {
  return p[1];
}

// A triangulation is collinear if all its triangles have a non-null area
function collinear(d) {
  const {triangles, coords} = d;
  for (let i = 0; i < triangles.length; i += 3) {
    const a = 2 * triangles[i],
          b = 2 * triangles[i + 1],
          c = 2 * triangles[i + 2],
          cross = (coords[c] - coords[a]) * (coords[b + 1] - coords[a + 1])
                - (coords[b] - coords[a]) * (coords[c + 1] - coords[a + 1]);
    if (cross > 1e-10) return false;
  }
  return true;
}

function jitter(x, y, r) {
  return [x + Math.sin(x + y) * r, y + Math.cos(x - y) * r];
}

class Delaunay {
  static from(points, fx = pointX, fy = pointY, that) {
    return new Delaunay("length" in points
        ? flatArray(points, fx, fy, that)
        : Float64Array.from(flatIterable(points, fx, fy, that)));
  }
  constructor(points) {
    this._delaunator = new Delaunator(points);
    this.inedges = new Int32Array(points.length / 2);
    this._hullIndex = new Int32Array(points.length / 2);
    this.points = this._delaunator.coords;
    this._init();
  }
  update() {
    this._delaunator.update();
    this._init();
    return this;
  }
  _init() {
    const d = this._delaunator, points = this.points;

    // check for collinear
    if (d.hull && d.hull.length > 2 && collinear(d)) {
      this.collinear = Int32Array.from({length: points.length/2}, (_,i) => i)
        .sort((i, j) => points[2 * i] - points[2 * j] || points[2 * i + 1] - points[2 * j + 1]); // for exact neighbors
      const e = this.collinear[0], f = this.collinear[this.collinear.length - 1],
        bounds = [ points[2 * e], points[2 * e + 1], points[2 * f], points[2 * f + 1] ],
        r = 1e-8 * Math.hypot(bounds[3] - bounds[1], bounds[2] - bounds[0]);
      for (let i = 0, n = points.length / 2; i < n; ++i) {
        const p = jitter(points[2 * i], points[2 * i + 1], r);
        points[2 * i] = p[0];
        points[2 * i + 1] = p[1];
      }
      this._delaunator = new Delaunator(points);
    } else {
      delete this.collinear;
    }

    const halfedges = this.halfedges = this._delaunator.halfedges;
    const hull = this.hull = this._delaunator.hull;
    const triangles = this.triangles = this._delaunator.triangles;
    const inedges = this.inedges.fill(-1);
    const hullIndex = this._hullIndex.fill(-1);

    // Compute an index from each point to an (arbitrary) incoming halfedge
    // Used to give the first neighbor of each point; for this reason,
    // on the hull we give priority to exterior halfedges
    for (let e = 0, n = halfedges.length; e < n; ++e) {
      const p = triangles[e % 3 === 2 ? e - 2 : e + 1];
      if (halfedges[e] === -1 || inedges[p] === -1) inedges[p] = e;
    }
    for (let i = 0, n = hull.length; i < n; ++i) {
      hullIndex[hull[i]] = i;
    }

    // degenerate case: 1 or 2 (distinct) points
    if (hull.length <= 2 && hull.length > 0) {
      this.triangles = new Int32Array(3).fill(-1);
      this.halfedges = new Int32Array(3).fill(-1);
      this.triangles[0] = hull[0];
      inedges[hull[0]] = 1;
      if (hull.length === 2) {
        inedges[hull[1]] = 0;
        this.triangles[1] = hull[1];
        this.triangles[2] = hull[1];
      }
    }
  }
  voronoi(bounds) {
    return new Voronoi(this, bounds);
  }
  *neighbors(i) {
    const {inedges, hull, _hullIndex, halfedges, triangles, collinear} = this;

    // degenerate case with several collinear points
    if (collinear) {
      const l = collinear.indexOf(i);
      if (l > 0) yield collinear[l - 1];
      if (l < collinear.length - 1) yield collinear[l + 1];
      return;
    }

    const e0 = inedges[i];
    if (e0 === -1) return; // coincident point
    let e = e0, p0 = -1;
    do {
      yield p0 = triangles[e];
      e = e % 3 === 2 ? e - 2 : e + 1;
      if (triangles[e] !== i) return; // bad triangulation
      e = halfedges[e];
      if (e === -1) {
        const p = hull[(_hullIndex[i] + 1) % hull.length];
        if (p !== p0) yield p;
        return;
      }
    } while (e !== e0);
  }
  find(x, y, i = 0) {
    if ((x = +x, x !== x) || (y = +y, y !== y)) return -1;
    const i0 = i;
    let c;
    while ((c = this._step(i, x, y)) >= 0 && c !== i && c !== i0) i = c;
    return c;
  }
  _step(i, x, y) {
    const {inedges, hull, _hullIndex, halfedges, triangles, points} = this;
    if (inedges[i] === -1 || !points.length) return (i + 1) % (points.length >> 1);
    let c = i;
    let dc = pow(x - points[i * 2], 2) + pow(y - points[i * 2 + 1], 2);
    const e0 = inedges[i];
    let e = e0;
    do {
      let t = triangles[e];
      const dt = pow(x - points[t * 2], 2) + pow(y - points[t * 2 + 1], 2);
      if (dt < dc) dc = dt, c = t;
      e = e % 3 === 2 ? e - 2 : e + 1;
      if (triangles[e] !== i) break; // bad triangulation
      e = halfedges[e];
      if (e === -1) {
        e = hull[(_hullIndex[i] + 1) % hull.length];
        if (e !== t) {
          if (pow(x - points[e * 2], 2) + pow(y - points[e * 2 + 1], 2) < dc) return e;
        }
        break;
      }
    } while (e !== e0);
    return c;
  }
  render(context) {
    const buffer = context == null ? context = new Path : undefined;
    const {points, halfedges, triangles} = this;
    for (let i = 0, n = halfedges.length; i < n; ++i) {
      const j = halfedges[i];
      if (j < i) continue;
      const ti = triangles[i] * 2;
      const tj = triangles[j] * 2;
      context.moveTo(points[ti], points[ti + 1]);
      context.lineTo(points[tj], points[tj + 1]);
    }
    this.renderHull(context);
    return buffer && buffer.value();
  }
  renderPoints(context, r) {
    if (r === undefined && (!context || typeof context.moveTo !== "function")) r = context, context = null;
    r = r == undefined ? 2 : +r;
    const buffer = context == null ? context = new Path : undefined;
    const {points} = this;
    for (let i = 0, n = points.length; i < n; i += 2) {
      const x = points[i], y = points[i + 1];
      context.moveTo(x + r, y);
      context.arc(x, y, r, 0, tau);
    }
    return buffer && buffer.value();
  }
  renderHull(context) {
    const buffer = context == null ? context = new Path : undefined;
    const {hull, points} = this;
    const h = hull[0] * 2, n = hull.length;
    context.moveTo(points[h], points[h + 1]);
    for (let i = 1; i < n; ++i) {
      const h = 2 * hull[i];
      context.lineTo(points[h], points[h + 1]);
    }
    context.closePath();
    return buffer && buffer.value();
  }
  hullPolygon() {
    const polygon = new Polygon;
    this.renderHull(polygon);
    return polygon.value();
  }
  renderTriangle(i, context) {
    const buffer = context == null ? context = new Path : undefined;
    const {points, triangles} = this;
    const t0 = triangles[i *= 3] * 2;
    const t1 = triangles[i + 1] * 2;
    const t2 = triangles[i + 2] * 2;
    context.moveTo(points[t0], points[t0 + 1]);
    context.lineTo(points[t1], points[t1 + 1]);
    context.lineTo(points[t2], points[t2 + 1]);
    context.closePath();
    return buffer && buffer.value();
  }
  *trianglePolygons() {
    const {triangles} = this;
    for (let i = 0, n = triangles.length / 3; i < n; ++i) {
      yield this.trianglePolygon(i);
    }
  }
  trianglePolygon(i) {
    const polygon = new Polygon;
    this.renderTriangle(i, polygon);
    return polygon.value();
  }
}

function flatArray(points, fx, fy, that) {
  const n = points.length;
  const array = new Float64Array(n * 2);
  for (let i = 0; i < n; ++i) {
    const p = points[i];
    array[i * 2] = fx.call(that, p, i, points);
    array[i * 2 + 1] = fy.call(that, p, i, points);
  }
  return array;
}

function* flatIterable(points, fx, fy, that) {
  let i = 0;
  for (const p of points) {
    yield fx.call(that, p, i, points);
    yield fy.call(that, p, i, points);
    ++i;
  }
}

;// ./node_modules/d3-delaunay/src/index.js




/***/ }),

/***/ 57128:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  sw: () => (/* reexport */ csvParse),
  Nu: () => (/* reexport */ tsvParse)
});

// UNUSED EXPORTS: autoType, csvFormat, csvFormatBody, csvFormatRow, csvFormatRows, csvFormatValue, csvParseRows, dsvFormat, tsvFormat, tsvFormatBody, tsvFormatRow, tsvFormatRows, tsvFormatValue, tsvParseRows

;// ./node_modules/d3-dsv/src/dsv.js
var EOL = {},
    EOF = {},
    QUOTE = 34,
    NEWLINE = 10,
    RETURN = 13;

function objectConverter(columns) {
  return new Function("d", "return {" + columns.map(function(name, i) {
    return JSON.stringify(name) + ": d[" + i + "] || \"\"";
  }).join(",") + "}");
}

function customConverter(columns, f) {
  var object = objectConverter(columns);
  return function(row, i) {
    return f(object(row), i, columns);
  };
}

// Compute unique columns in order of discovery.
function inferColumns(rows) {
  var columnSet = Object.create(null),
      columns = [];

  rows.forEach(function(row) {
    for (var column in row) {
      if (!(column in columnSet)) {
        columns.push(columnSet[column] = column);
      }
    }
  });

  return columns;
}

function pad(value, width) {
  var s = value + "", length = s.length;
  return length < width ? new Array(width - length + 1).join(0) + s : s;
}

function formatYear(year) {
  return year < 0 ? "-" + pad(-year, 6)
    : year > 9999 ? "+" + pad(year, 6)
    : pad(year, 4);
}

function formatDate(date) {
  var hours = date.getUTCHours(),
      minutes = date.getUTCMinutes(),
      seconds = date.getUTCSeconds(),
      milliseconds = date.getUTCMilliseconds();
  return isNaN(date) ? "Invalid Date"
      : formatYear(date.getUTCFullYear(), 4) + "-" + pad(date.getUTCMonth() + 1, 2) + "-" + pad(date.getUTCDate(), 2)
      + (milliseconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "." + pad(milliseconds, 3) + "Z"
      : seconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "Z"
      : minutes || hours ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + "Z"
      : "");
}

/* harmony default export */ function dsv(delimiter) {
  var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
      DELIMITER = delimiter.charCodeAt(0);

  function parse(text, f) {
    var convert, columns, rows = parseRows(text, function(row, i) {
      if (convert) return convert(row, i - 1);
      columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
    });
    rows.columns = columns || [];
    return rows;
  }

  function parseRows(text, f) {
    var rows = [], // output rows
        N = text.length,
        I = 0, // current character index
        n = 0, // current line number
        t, // current token
        eof = N <= 0, // current token followed by EOF?
        eol = false; // current token followed by EOL?

    // Strip the trailing newline.
    if (text.charCodeAt(N - 1) === NEWLINE) --N;
    if (text.charCodeAt(N - 1) === RETURN) --N;

    function token() {
      if (eof) return EOF;
      if (eol) return eol = false, EOL;

      // Unescape quotes.
      var i, j = I, c;
      if (text.charCodeAt(j) === QUOTE) {
        while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
        if ((i = I) >= N) eof = true;
        else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
        else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
        return text.slice(j + 1, i - 1).replace(/""/g, "\"");
      }

      // Find next delimiter or newline.
      while (I < N) {
        if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
        else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
        else if (c !== DELIMITER) continue;
        return text.slice(j, i);
      }

      // Return last token before EOF.
      return eof = true, text.slice(j, N);
    }

    while ((t = token()) !== EOF) {
      var row = [];
      while (t !== EOL && t !== EOF) row.push(t), t = token();
      if (f && (row = f(row, n++)) == null) continue;
      rows.push(row);
    }

    return rows;
  }

  function preformatBody(rows, columns) {
    return rows.map(function(row) {
      return columns.map(function(column) {
        return formatValue(row[column]);
      }).join(delimiter);
    });
  }

  function format(rows, columns) {
    if (columns == null) columns = inferColumns(rows);
    return [columns.map(formatValue).join(delimiter)].concat(preformatBody(rows, columns)).join("\n");
  }

  function formatBody(rows, columns) {
    if (columns == null) columns = inferColumns(rows);
    return preformatBody(rows, columns).join("\n");
  }

  function formatRows(rows) {
    return rows.map(formatRow).join("\n");
  }

  function formatRow(row) {
    return row.map(formatValue).join(delimiter);
  }

  function formatValue(value) {
    return value == null ? ""
        : value instanceof Date ? formatDate(value)
        : reFormat.test(value += "") ? "\"" + value.replace(/"/g, "\"\"") + "\""
        : value;
  }

  return {
    parse: parse,
    parseRows: parseRows,
    format: format,
    formatBody: formatBody,
    formatRows: formatRows,
    formatRow: formatRow,
    formatValue: formatValue
  };
}

;// ./node_modules/d3-dsv/src/csv.js


var csv = dsv(",");

var csvParse = csv.parse;
var csvParseRows = csv.parseRows;
var csvFormat = csv.format;
var csvFormatBody = csv.formatBody;
var csvFormatRows = csv.formatRows;
var csvFormatRow = csv.formatRow;
var csvFormatValue = csv.formatValue;

;// ./node_modules/d3-dsv/src/tsv.js


var tsv = dsv("\t");

var tsvParse = tsv.parse;
var tsvParseRows = tsv.parseRows;
var tsvFormat = tsv.format;
var tsvFormatBody = tsv.formatBody;
var tsvFormatRows = tsv.formatRows;
var tsvFormatRow = tsv.formatRow;
var tsvFormatValue = tsv.formatValue;

;// ./node_modules/d3-dsv/src/autoType.js
function autoType(object) {
  for (var key in object) {
    var value = object[key].trim(), number, m;
    if (!value) value = null;
    else if (value === "true") value = true;
    else if (value === "false") value = false;
    else if (value === "NaN") value = NaN;
    else if (!isNaN(number = +value)) value = number;
    else if (m = value.match(/^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/)) {
      if (fixtz && !!m[4] && !m[7]) value = value.replace(/-/g, "/").replace(/T/, " ");
      value = new Date(value);
    }
    else continue;
    object[key] = value;
  }
  return object;
}

// https://github.com/d3/d3-dsv/issues/45
const fixtz = new Date("2019-01-01T00:00").getHours() || new Date("2019-07-01T00:00").getHours();
;// ./node_modules/d3-dsv/src/index.js






/***/ }),

/***/ 68217:
/***/ ((__unused_webpack___webpack_module__, __unused_webpack___webpack_exports__, __webpack_require__) => {


// UNUSED EXPORTS: brush, brushSelection, brushX, brushY

// EXTERNAL MODULE: ./node_modules/d3-dispatch/src/index.js + 1 modules
var src = __webpack_require__(90417);
// EXTERNAL MODULE: ./node_modules/d3-drag/src/index.js + 5 modules
var d3_drag_src = __webpack_require__(97119);
// EXTERNAL MODULE: ./node_modules/d3-interpolate/src/index.js + 25 modules
var d3_interpolate_src = __webpack_require__(20776);
// EXTERNAL MODULE: ./node_modules/d3-selection/src/index.js + 52 modules
var d3_selection_src = __webpack_require__(53363);
// EXTERNAL MODULE: ./node_modules/d3-transition/src/index.js + 28 modules
var d3_transition_src = __webpack_require__(96725);
;// ./node_modules/d3-brush/src/constant.js
/* harmony default export */ const src_constant = (x => () => x);

;// ./node_modules/d3-brush/src/event.js
function event_BrushEvent(type, {
  sourceEvent,
  target,
  selection,
  mode,
  dispatch
}) {
  Object.defineProperties(this, {
    type: {value: type, enumerable: true, configurable: true},
    sourceEvent: {value: sourceEvent, enumerable: true, configurable: true},
    target: {value: target, enumerable: true, configurable: true},
    selection: {value: selection, enumerable: true, configurable: true},
    mode: {value: mode, enumerable: true, configurable: true},
    _: {value: dispatch}
  });
}

;// ./node_modules/d3-brush/src/noevent.js
function noevent_nopropagation(event) {
  event.stopImmediatePropagation();
}

/* harmony default export */ function src_noevent(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

;// ./node_modules/d3-brush/src/brush.js









var MODE_DRAG = {name: "drag"},
    MODE_SPACE = {name: "space"},
    MODE_HANDLE = {name: "handle"},
    MODE_CENTER = {name: "center"};

const {abs, max, min} = Math;

function number1(e) {
  return [+e[0], +e[1]];
}

function number2(e) {
  return [number1(e[0]), number1(e[1])];
}

var X = {
  name: "x",
  handles: ["w", "e"].map(type),
  input: function(x, e) { return x == null ? null : [[+x[0], e[0][1]], [+x[1], e[1][1]]]; },
  output: function(xy) { return xy && [xy[0][0], xy[1][0]]; }
};

var Y = {
  name: "y",
  handles: ["n", "s"].map(type),
  input: function(y, e) { return y == null ? null : [[e[0][0], +y[0]], [e[1][0], +y[1]]]; },
  output: function(xy) { return xy && [xy[0][1], xy[1][1]]; }
};

var XY = {
  name: "xy",
  handles: ["n", "w", "e", "s", "nw", "ne", "sw", "se"].map(type),
  input: function(xy) { return xy == null ? null : number2(xy); },
  output: function(xy) { return xy; }
};

var cursors = {
  overlay: "crosshair",
  selection: "move",
  n: "ns-resize",
  e: "ew-resize",
  s: "ns-resize",
  w: "ew-resize",
  nw: "nwse-resize",
  ne: "nesw-resize",
  se: "nwse-resize",
  sw: "nesw-resize"
};

var flipX = {
  e: "w",
  w: "e",
  nw: "ne",
  ne: "nw",
  se: "sw",
  sw: "se"
};

var flipY = {
  n: "s",
  s: "n",
  nw: "sw",
  ne: "se",
  se: "ne",
  sw: "nw"
};

var signsX = {
  overlay: +1,
  selection: +1,
  n: null,
  e: +1,
  s: null,
  w: -1,
  nw: -1,
  ne: +1,
  se: +1,
  sw: -1
};

var signsY = {
  overlay: +1,
  selection: +1,
  n: -1,
  e: null,
  s: +1,
  w: null,
  nw: -1,
  ne: -1,
  se: +1,
  sw: +1
};

function type(t) {
  return {type: t};
}

// Ignore right-click, since that should open the context menu.
function defaultFilter(event) {
  return !event.ctrlKey && !event.button;
}

function defaultExtent() {
  var svg = this.ownerSVGElement || this;
  if (svg.hasAttribute("viewBox")) {
    svg = svg.viewBox.baseVal;
    return [[svg.x, svg.y], [svg.x + svg.width, svg.y + svg.height]];
  }
  return [[0, 0], [svg.width.baseVal.value, svg.height.baseVal.value]];
}

function defaultTouchable() {
  return navigator.maxTouchPoints || ("ontouchstart" in this);
}

// Like d3.local, but with the name “__brush” rather than auto-generated.
function local(node) {
  while (!node.__brush) if (!(node = node.parentNode)) return;
  return node.__brush;
}

function empty(extent) {
  return extent[0][0] === extent[1][0]
      || extent[0][1] === extent[1][1];
}

function brushSelection(node) {
  var state = node.__brush;
  return state ? state.dim.output(state.selection) : null;
}

function brushX() {
  return brush_brush(X);
}

function brushY() {
  return brush_brush(Y);
}

/* harmony default export */ function brush() {
  return brush_brush(XY);
}

function brush_brush(dim) {
  var extent = defaultExtent,
      filter = defaultFilter,
      touchable = defaultTouchable,
      keys = true,
      listeners = dispatch("start", "brush", "end"),
      handleSize = 6,
      touchending;

  function brush(group) {
    var overlay = group
        .property("__brush", initialize)
      .selectAll(".overlay")
      .data([type("overlay")]);

    overlay.enter().append("rect")
        .attr("class", "overlay")
        .attr("pointer-events", "all")
        .attr("cursor", cursors.overlay)
      .merge(overlay)
        .each(function() {
          var extent = local(this).extent;
          select(this)
              .attr("x", extent[0][0])
              .attr("y", extent[0][1])
              .attr("width", extent[1][0] - extent[0][0])
              .attr("height", extent[1][1] - extent[0][1]);
        });

    group.selectAll(".selection")
      .data([type("selection")])
      .enter().append("rect")
        .attr("class", "selection")
        .attr("cursor", cursors.selection)
        .attr("fill", "#777")
        .attr("fill-opacity", 0.3)
        .attr("stroke", "#fff")
        .attr("shape-rendering", "crispEdges");

    var handle = group.selectAll(".handle")
      .data(dim.handles, function(d) { return d.type; });

    handle.exit().remove();

    handle.enter().append("rect")
        .attr("class", function(d) { return "handle handle--" + d.type; })
        .attr("cursor", function(d) { return cursors[d.type]; });

    group
        .each(redraw)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("mousedown.brush", started)
      .filter(touchable)
        .on("touchstart.brush", started)
        .on("touchmove.brush", touchmoved)
        .on("touchend.brush touchcancel.brush", touchended)
        .style("touch-action", "none")
        .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }

  brush.move = function(group, selection, event) {
    if (group.tween) {
      group
          .on("start.brush", function(event) { emitter(this, arguments).beforestart().start(event); })
          .on("interrupt.brush end.brush", function(event) { emitter(this, arguments).end(event); })
          .tween("brush", function() {
            var that = this,
                state = that.__brush,
                emit = emitter(that, arguments),
                selection0 = state.selection,
                selection1 = dim.input(typeof selection === "function" ? selection.apply(this, arguments) : selection, state.extent),
                i = interpolate(selection0, selection1);

            function tween(t) {
              state.selection = t === 1 && selection1 === null ? null : i(t);
              redraw.call(that);
              emit.brush();
            }

            return selection0 !== null && selection1 !== null ? tween : tween(1);
          });
    } else {
      group
          .each(function() {
            var that = this,
                args = arguments,
                state = that.__brush,
                selection1 = dim.input(typeof selection === "function" ? selection.apply(that, args) : selection, state.extent),
                emit = emitter(that, args).beforestart();

            interrupt(that);
            state.selection = selection1 === null ? null : selection1;
            redraw.call(that);
            emit.start(event).brush(event).end(event);
          });
    }
  };

  brush.clear = function(group, event) {
    brush.move(group, null, event);
  };

  function redraw() {
    var group = select(this),
        selection = local(this).selection;

    if (selection) {
      group.selectAll(".selection")
          .style("display", null)
          .attr("x", selection[0][0])
          .attr("y", selection[0][1])
          .attr("width", selection[1][0] - selection[0][0])
          .attr("height", selection[1][1] - selection[0][1]);

      group.selectAll(".handle")
          .style("display", null)
          .attr("x", function(d) { return d.type[d.type.length - 1] === "e" ? selection[1][0] - handleSize / 2 : selection[0][0] - handleSize / 2; })
          .attr("y", function(d) { return d.type[0] === "s" ? selection[1][1] - handleSize / 2 : selection[0][1] - handleSize / 2; })
          .attr("width", function(d) { return d.type === "n" || d.type === "s" ? selection[1][0] - selection[0][0] + handleSize : handleSize; })
          .attr("height", function(d) { return d.type === "e" || d.type === "w" ? selection[1][1] - selection[0][1] + handleSize : handleSize; });
    }

    else {
      group.selectAll(".selection,.handle")
          .style("display", "none")
          .attr("x", null)
          .attr("y", null)
          .attr("width", null)
          .attr("height", null);
    }
  }

  function emitter(that, args, clean) {
    var emit = that.__brush.emitter;
    return emit && (!clean || !emit.clean) ? emit : new Emitter(that, args, clean);
  }

  function Emitter(that, args, clean) {
    this.that = that;
    this.args = args;
    this.state = that.__brush;
    this.active = 0;
    this.clean = clean;
  }

  Emitter.prototype = {
    beforestart: function() {
      if (++this.active === 1) this.state.emitter = this, this.starting = true;
      return this;
    },
    start: function(event, mode) {
      if (this.starting) this.starting = false, this.emit("start", event, mode);
      else this.emit("brush", event);
      return this;
    },
    brush: function(event, mode) {
      this.emit("brush", event, mode);
      return this;
    },
    end: function(event, mode) {
      if (--this.active === 0) delete this.state.emitter, this.emit("end", event, mode);
      return this;
    },
    emit: function(type, event, mode) {
      var d = select(this.that).datum();
      listeners.call(
        type,
        this.that,
        new BrushEvent(type, {
          sourceEvent: event,
          target: brush,
          selection: dim.output(this.state.selection),
          mode,
          dispatch: listeners
        }),
        d
      );
    }
  };

  function started(event) {
    if (touchending && !event.touches) return;
    if (!filter.apply(this, arguments)) return;

    var that = this,
        type = event.target.__data__.type,
        mode = (keys && event.metaKey ? type = "overlay" : type) === "selection" ? MODE_DRAG : (keys && event.altKey ? MODE_CENTER : MODE_HANDLE),
        signX = dim === Y ? null : signsX[type],
        signY = dim === X ? null : signsY[type],
        state = local(that),
        extent = state.extent,
        selection = state.selection,
        W = extent[0][0], w0, w1,
        N = extent[0][1], n0, n1,
        E = extent[1][0], e0, e1,
        S = extent[1][1], s0, s1,
        dx = 0,
        dy = 0,
        moving,
        shifting = signX && signY && keys && event.shiftKey,
        lockX,
        lockY,
        points = Array.from(event.touches || [event], t => {
          const i = t.identifier;
          t = pointer(t, that);
          t.point0 = t.slice();
          t.identifier = i;
          return t;
        });

    interrupt(that);
    var emit = emitter(that, arguments, true).beforestart();

    if (type === "overlay") {
      if (selection) moving = true;
      const pts = [points[0], points[1] || points[0]];
      state.selection = selection = [[
          w0 = dim === Y ? W : min(pts[0][0], pts[1][0]),
          n0 = dim === X ? N : min(pts[0][1], pts[1][1])
        ], [
          e0 = dim === Y ? E : max(pts[0][0], pts[1][0]),
          s0 = dim === X ? S : max(pts[0][1], pts[1][1])
        ]];
      if (points.length > 1) move(event);
    } else {
      w0 = selection[0][0];
      n0 = selection[0][1];
      e0 = selection[1][0];
      s0 = selection[1][1];
    }

    w1 = w0;
    n1 = n0;
    e1 = e0;
    s1 = s0;

    var group = select(that)
        .attr("pointer-events", "none");

    var overlay = group.selectAll(".overlay")
        .attr("cursor", cursors[type]);

    if (event.touches) {
      emit.moved = moved;
      emit.ended = ended;
    } else {
      var view = select(event.view)
          .on("mousemove.brush", moved, true)
          .on("mouseup.brush", ended, true);
      if (keys) view
          .on("keydown.brush", keydowned, true)
          .on("keyup.brush", keyupped, true)

      dragDisable(event.view);
    }

    redraw.call(that);
    emit.start(event, mode.name);

    function moved(event) {
      for (const p of event.changedTouches || [event]) {
        for (const d of points)
          if (d.identifier === p.identifier) d.cur = pointer(p, that);
      }
      if (shifting && !lockX && !lockY && points.length === 1) {
        const point = points[0];
        if (abs(point.cur[0] - point[0]) > abs(point.cur[1] - point[1]))
          lockY = true;
        else
          lockX = true;
      }
      for (const point of points)
        if (point.cur) point[0] = point.cur[0], point[1] = point.cur[1];
      moving = true;
      noevent(event);
      move(event);
    }

    function move(event) {
      const point = points[0], point0 = point.point0;
      var t;

      dx = point[0] - point0[0];
      dy = point[1] - point0[1];

      switch (mode) {
        case MODE_SPACE:
        case MODE_DRAG: {
          if (signX) dx = max(W - w0, min(E - e0, dx)), w1 = w0 + dx, e1 = e0 + dx;
          if (signY) dy = max(N - n0, min(S - s0, dy)), n1 = n0 + dy, s1 = s0 + dy;
          break;
        }
        case MODE_HANDLE: {
          if (points[1]) {
            if (signX) w1 = max(W, min(E, points[0][0])), e1 = max(W, min(E, points[1][0])), signX = 1;
            if (signY) n1 = max(N, min(S, points[0][1])), s1 = max(N, min(S, points[1][1])), signY = 1;
          } else {
            if (signX < 0) dx = max(W - w0, min(E - w0, dx)), w1 = w0 + dx, e1 = e0;
            else if (signX > 0) dx = max(W - e0, min(E - e0, dx)), w1 = w0, e1 = e0 + dx;
            if (signY < 0) dy = max(N - n0, min(S - n0, dy)), n1 = n0 + dy, s1 = s0;
            else if (signY > 0) dy = max(N - s0, min(S - s0, dy)), n1 = n0, s1 = s0 + dy;
          }
          break;
        }
        case MODE_CENTER: {
          if (signX) w1 = max(W, min(E, w0 - dx * signX)), e1 = max(W, min(E, e0 + dx * signX));
          if (signY) n1 = max(N, min(S, n0 - dy * signY)), s1 = max(N, min(S, s0 + dy * signY));
          break;
        }
      }

      if (e1 < w1) {
        signX *= -1;
        t = w0, w0 = e0, e0 = t;
        t = w1, w1 = e1, e1 = t;
        if (type in flipX) overlay.attr("cursor", cursors[type = flipX[type]]);
      }

      if (s1 < n1) {
        signY *= -1;
        t = n0, n0 = s0, s0 = t;
        t = n1, n1 = s1, s1 = t;
        if (type in flipY) overlay.attr("cursor", cursors[type = flipY[type]]);
      }

      if (state.selection) selection = state.selection; // May be set by brush.move!
      if (lockX) w1 = selection[0][0], e1 = selection[1][0];
      if (lockY) n1 = selection[0][1], s1 = selection[1][1];

      if (selection[0][0] !== w1
          || selection[0][1] !== n1
          || selection[1][0] !== e1
          || selection[1][1] !== s1) {
        state.selection = [[w1, n1], [e1, s1]];
        redraw.call(that);
        emit.brush(event, mode.name);
      }
    }

    function ended(event) {
      nopropagation(event);
      if (event.touches) {
        if (event.touches.length) return;
        if (touchending) clearTimeout(touchending);
        touchending = setTimeout(function() { touchending = null; }, 500); // Ghost clicks are delayed!
      } else {
        dragEnable(event.view, moving);
        view.on("keydown.brush keyup.brush mousemove.brush mouseup.brush", null);
      }
      group.attr("pointer-events", "all");
      overlay.attr("cursor", cursors.overlay);
      if (state.selection) selection = state.selection; // May be set by brush.move (on start)!
      if (empty(selection)) state.selection = null, redraw.call(that);
      emit.end(event, mode.name);
    }

    function keydowned(event) {
      switch (event.keyCode) {
        case 16: { // SHIFT
          shifting = signX && signY;
          break;
        }
        case 18: { // ALT
          if (mode === MODE_HANDLE) {
            if (signX) e0 = e1 - dx * signX, w0 = w1 + dx * signX;
            if (signY) s0 = s1 - dy * signY, n0 = n1 + dy * signY;
            mode = MODE_CENTER;
            move(event);
          }
          break;
        }
        case 32: { // SPACE; takes priority over ALT
          if (mode === MODE_HANDLE || mode === MODE_CENTER) {
            if (signX < 0) e0 = e1 - dx; else if (signX > 0) w0 = w1 - dx;
            if (signY < 0) s0 = s1 - dy; else if (signY > 0) n0 = n1 - dy;
            mode = MODE_SPACE;
            overlay.attr("cursor", cursors.selection);
            move(event);
          }
          break;
        }
        default: return;
      }
      noevent(event);
    }

    function keyupped(event) {
      switch (event.keyCode) {
        case 16: { // SHIFT
          if (shifting) {
            lockX = lockY = shifting = false;
            move(event);
          }
          break;
        }
        case 18: { // ALT
          if (mode === MODE_CENTER) {
            if (signX < 0) e0 = e1; else if (signX > 0) w0 = w1;
            if (signY < 0) s0 = s1; else if (signY > 0) n0 = n1;
            mode = MODE_HANDLE;
            move(event);
          }
          break;
        }
        case 32: { // SPACE
          if (mode === MODE_SPACE) {
            if (event.altKey) {
              if (signX) e0 = e1 - dx * signX, w0 = w1 + dx * signX;
              if (signY) s0 = s1 - dy * signY, n0 = n1 + dy * signY;
              mode = MODE_CENTER;
            } else {
              if (signX < 0) e0 = e1; else if (signX > 0) w0 = w1;
              if (signY < 0) s0 = s1; else if (signY > 0) n0 = n1;
              mode = MODE_HANDLE;
            }
            overlay.attr("cursor", cursors[type]);
            move(event);
          }
          break;
        }
        default: return;
      }
      noevent(event);
    }
  }

  function touchmoved(event) {
    emitter(this, arguments).moved(event);
  }

  function touchended(event) {
    emitter(this, arguments).ended(event);
  }

  function initialize() {
    var state = this.__brush || {selection: null};
    state.extent = number2(extent.apply(this, arguments));
    state.dim = dim;
    return state;
  }

  brush.extent = function(_) {
    return arguments.length ? (extent = typeof _ === "function" ? _ : constant(number2(_)), brush) : extent;
  };

  brush.filter = function(_) {
    return arguments.length ? (filter = typeof _ === "function" ? _ : constant(!!_), brush) : filter;
  };

  brush.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant(!!_), brush) : touchable;
  };

  brush.handleSize = function(_) {
    return arguments.length ? (handleSize = +_, brush) : handleSize;
  };

  brush.keyModifiers = function(_) {
    return arguments.length ? (keys = !!_, brush) : keys;
  };

  brush.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? brush : value;
  };

  return brush;
}

;// ./node_modules/d3-brush/src/index.js



/***/ }),

/***/ 71354:
/***/ ((module) => {



module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ 72058:
/***/ ((__unused_webpack___webpack_module__, __unused_webpack___webpack_exports__, __webpack_require__) => {


// UNUSED EXPORTS: blob, buffer, csv, dsv, html, image, json, svg, text, tsv, xml

;// ./node_modules/d3-fetch/src/blob.js
function responseBlob(response) {
  if (!response.ok) throw new Error(response.status + " " + response.statusText);
  return response.blob();
}

/* harmony default export */ function blob(input, init) {
  return fetch(input, init).then(responseBlob);
}

;// ./node_modules/d3-fetch/src/buffer.js
function responseArrayBuffer(response) {
  if (!response.ok) throw new Error(response.status + " " + response.statusText);
  return response.arrayBuffer();
}

/* harmony default export */ function buffer(input, init) {
  return fetch(input, init).then(responseArrayBuffer);
}

// EXTERNAL MODULE: ./node_modules/d3-dsv/src/index.js + 4 modules
var src = __webpack_require__(57128);
;// ./node_modules/d3-fetch/src/text.js
function responseText(response) {
  if (!response.ok) throw new Error(response.status + " " + response.statusText);
  return response.text();
}

/* harmony default export */ function src_text(input, init) {
  return fetch(input, init).then(responseText);
}

;// ./node_modules/d3-fetch/src/dsv.js



function dsvParse(parse) {
  return function(input, init, row) {
    if (arguments.length === 2 && typeof init === "function") row = init, init = undefined;
    return src_text(input, init).then(function(response) {
      return parse(response, row);
    });
  };
}

function dsv(delimiter, input, init, row) {
  if (arguments.length === 3 && typeof init === "function") row = init, init = undefined;
  var format = dsvFormat(delimiter);
  return text(input, init).then(function(response) {
    return format.parse(response, row);
  });
}

var csv = dsvParse(src/* csvParse */.sw);
var tsv = dsvParse(src/* tsvParse */.Nu);

;// ./node_modules/d3-fetch/src/image.js
/* harmony default export */ function src_image(input, init) {
  return new Promise(function(resolve, reject) {
    var image = new Image;
    for (var key in init) image[key] = init[key];
    image.onerror = reject;
    image.onload = function() { resolve(image); };
    image.src = input;
  });
}

;// ./node_modules/d3-fetch/src/json.js
function responseJson(response) {
  if (!response.ok) throw new Error(response.status + " " + response.statusText);
  if (response.status === 204 || response.status === 205) return;
  return response.json();
}

/* harmony default export */ function json(input, init) {
  return fetch(input, init).then(responseJson);
}

;// ./node_modules/d3-fetch/src/xml.js


function parser(type) {
  return (input, init) => src_text(input, init)
    .then(text => (new DOMParser).parseFromString(text, type));
}

/* harmony default export */ const xml = (parser("application/xml"));

var html = parser("text/html");

var svg = parser("image/svg+xml");

;// ./node_modules/d3-fetch/src/index.js









/***/ }),

/***/ 75423:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  yW: () => (/* reexport */ color),
  UB: () => (/* reexport */ cubehelix),
  aq: () => (/* reexport */ hcl),
  KI: () => (/* reexport */ hsl),
  Qh: () => (/* reexport */ rgb)
});

// UNUSED EXPORTS: gray, lab, lch

;// ./node_modules/d3-color/src/define.js
/* harmony default export */ function src_define(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}

function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}

;// ./node_modules/d3-color/src/color.js


function Color() {}

var darker = 0.7;
var brighter = 1 / darker;

var reI = "\\s*([+-]?\\d+)\\s*",
    reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*",
    reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
    reHex = /^#([0-9a-f]{3,8})$/,
    reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`),
    reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`),
    reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`),
    reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`),
    reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`),
    reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);

var named = {
  aliceblue: 0xf0f8ff,
  antiquewhite: 0xfaebd7,
  aqua: 0x00ffff,
  aquamarine: 0x7fffd4,
  azure: 0xf0ffff,
  beige: 0xf5f5dc,
  bisque: 0xffe4c4,
  black: 0x000000,
  blanchedalmond: 0xffebcd,
  blue: 0x0000ff,
  blueviolet: 0x8a2be2,
  brown: 0xa52a2a,
  burlywood: 0xdeb887,
  cadetblue: 0x5f9ea0,
  chartreuse: 0x7fff00,
  chocolate: 0xd2691e,
  coral: 0xff7f50,
  cornflowerblue: 0x6495ed,
  cornsilk: 0xfff8dc,
  crimson: 0xdc143c,
  cyan: 0x00ffff,
  darkblue: 0x00008b,
  darkcyan: 0x008b8b,
  darkgoldenrod: 0xb8860b,
  darkgray: 0xa9a9a9,
  darkgreen: 0x006400,
  darkgrey: 0xa9a9a9,
  darkkhaki: 0xbdb76b,
  darkmagenta: 0x8b008b,
  darkolivegreen: 0x556b2f,
  darkorange: 0xff8c00,
  darkorchid: 0x9932cc,
  darkred: 0x8b0000,
  darksalmon: 0xe9967a,
  darkseagreen: 0x8fbc8f,
  darkslateblue: 0x483d8b,
  darkslategray: 0x2f4f4f,
  darkslategrey: 0x2f4f4f,
  darkturquoise: 0x00ced1,
  darkviolet: 0x9400d3,
  deeppink: 0xff1493,
  deepskyblue: 0x00bfff,
  dimgray: 0x696969,
  dimgrey: 0x696969,
  dodgerblue: 0x1e90ff,
  firebrick: 0xb22222,
  floralwhite: 0xfffaf0,
  forestgreen: 0x228b22,
  fuchsia: 0xff00ff,
  gainsboro: 0xdcdcdc,
  ghostwhite: 0xf8f8ff,
  gold: 0xffd700,
  goldenrod: 0xdaa520,
  gray: 0x808080,
  green: 0x008000,
  greenyellow: 0xadff2f,
  grey: 0x808080,
  honeydew: 0xf0fff0,
  hotpink: 0xff69b4,
  indianred: 0xcd5c5c,
  indigo: 0x4b0082,
  ivory: 0xfffff0,
  khaki: 0xf0e68c,
  lavender: 0xe6e6fa,
  lavenderblush: 0xfff0f5,
  lawngreen: 0x7cfc00,
  lemonchiffon: 0xfffacd,
  lightblue: 0xadd8e6,
  lightcoral: 0xf08080,
  lightcyan: 0xe0ffff,
  lightgoldenrodyellow: 0xfafad2,
  lightgray: 0xd3d3d3,
  lightgreen: 0x90ee90,
  lightgrey: 0xd3d3d3,
  lightpink: 0xffb6c1,
  lightsalmon: 0xffa07a,
  lightseagreen: 0x20b2aa,
  lightskyblue: 0x87cefa,
  lightslategray: 0x778899,
  lightslategrey: 0x778899,
  lightsteelblue: 0xb0c4de,
  lightyellow: 0xffffe0,
  lime: 0x00ff00,
  limegreen: 0x32cd32,
  linen: 0xfaf0e6,
  magenta: 0xff00ff,
  maroon: 0x800000,
  mediumaquamarine: 0x66cdaa,
  mediumblue: 0x0000cd,
  mediumorchid: 0xba55d3,
  mediumpurple: 0x9370db,
  mediumseagreen: 0x3cb371,
  mediumslateblue: 0x7b68ee,
  mediumspringgreen: 0x00fa9a,
  mediumturquoise: 0x48d1cc,
  mediumvioletred: 0xc71585,
  midnightblue: 0x191970,
  mintcream: 0xf5fffa,
  mistyrose: 0xffe4e1,
  moccasin: 0xffe4b5,
  navajowhite: 0xffdead,
  navy: 0x000080,
  oldlace: 0xfdf5e6,
  olive: 0x808000,
  olivedrab: 0x6b8e23,
  orange: 0xffa500,
  orangered: 0xff4500,
  orchid: 0xda70d6,
  palegoldenrod: 0xeee8aa,
  palegreen: 0x98fb98,
  paleturquoise: 0xafeeee,
  palevioletred: 0xdb7093,
  papayawhip: 0xffefd5,
  peachpuff: 0xffdab9,
  peru: 0xcd853f,
  pink: 0xffc0cb,
  plum: 0xdda0dd,
  powderblue: 0xb0e0e6,
  purple: 0x800080,
  rebeccapurple: 0x663399,
  red: 0xff0000,
  rosybrown: 0xbc8f8f,
  royalblue: 0x4169e1,
  saddlebrown: 0x8b4513,
  salmon: 0xfa8072,
  sandybrown: 0xf4a460,
  seagreen: 0x2e8b57,
  seashell: 0xfff5ee,
  sienna: 0xa0522d,
  silver: 0xc0c0c0,
  skyblue: 0x87ceeb,
  slateblue: 0x6a5acd,
  slategray: 0x708090,
  slategrey: 0x708090,
  snow: 0xfffafa,
  springgreen: 0x00ff7f,
  steelblue: 0x4682b4,
  tan: 0xd2b48c,
  teal: 0x008080,
  thistle: 0xd8bfd8,
  tomato: 0xff6347,
  turquoise: 0x40e0d0,
  violet: 0xee82ee,
  wheat: 0xf5deb3,
  white: 0xffffff,
  whitesmoke: 0xf5f5f5,
  yellow: 0xffff00,
  yellowgreen: 0x9acd32
};

src_define(Color, color, {
  copy(channels) {
    return Object.assign(new this.constructor, this, channels);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: color_formatHex, // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHex8: color_formatHex8,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});

function color_formatHex() {
  return this.rgb().formatHex();
}

function color_formatHex8() {
  return this.rgb().formatHex8();
}

function color_formatHsl() {
  return hslConvert(this).formatHsl();
}

function color_formatRgb() {
  return this.rgb().formatRgb();
}

function color(format) {
  var m, l;
  format = (format + "").trim().toLowerCase();
  return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
      : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
      : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
      : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
      : null) // invalid hex
      : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
      : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
      : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
      : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
      : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
      : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
      : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
      : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
      : null;
}

function rgbn(n) {
  return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
}

function rgba(r, g, b, a) {
  if (a <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a);
}

function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb;
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}

function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}

function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}

src_define(Rgb, rgb, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
  },
  displayable() {
    return (-0.5 <= this.r && this.r < 255.5)
        && (-0.5 <= this.g && this.g < 255.5)
        && (-0.5 <= this.b && this.b < 255.5)
        && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex, // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatHex8: rgb_formatHex8,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));

function rgb_formatHex() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}

function rgb_formatHex8() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}

function rgb_formatRgb() {
  const a = clampa(this.opacity);
  return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
}

function clampa(opacity) {
  return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}

function clampi(value) {
  return Math.max(0, Math.min(255, Math.round(value) || 0));
}

function hex(value) {
  value = clampi(value);
  return (value < 16 ? "0" : "") + value.toString(16);
}

function hsla(h, s, l, a) {
  if (a <= 0) h = s = l = NaN;
  else if (l <= 0 || l >= 1) h = s = NaN;
  else if (s <= 0) h = NaN;
  return new Hsl(h, s, l, a);
}

function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl;
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      h = NaN,
      s = max - min,
      l = (max + min) / 2;
  if (s) {
    if (r === max) h = (g - b) / s + (g < b) * 6;
    else if (g === max) h = (b - r) / s + 2;
    else h = (r - g) / s + 4;
    s /= l < 0.5 ? max + min : 2 - max - min;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}

function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}

function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

src_define(Hsl, hsl, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb() {
    var h = this.h % 360 + (this.h < 0) * 360,
        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
        l = this.l,
        m2 = l + (l < 0.5 ? l : 1 - l) * s,
        m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  clamp() {
    return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s))
        && (0 <= this.l && this.l <= 1)
        && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
  }
}));

function clamph(value) {
  value = (value || 0) % 360;
  return value < 0 ? value + 360 : value;
}

function clampt(value) {
  return Math.max(0, Math.min(1, value || 0));
}

/* From FvD 13.37, CSS Color Module Level 3 */
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60
      : h < 180 ? m2
      : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
      : m1) * 255;
}

;// ./node_modules/d3-color/src/math.js
const radians = Math.PI / 180;
const degrees = 180 / Math.PI;

;// ./node_modules/d3-color/src/lab.js




// https://observablehq.com/@mbostock/lab-and-rgb
const K = 18,
    Xn = 0.96422,
    Yn = 1,
    Zn = 0.82521,
    t0 = 4 / 29,
    t1 = 6 / 29,
    t2 = 3 * t1 * t1,
    t3 = t1 * t1 * t1;

function labConvert(o) {
  if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
  if (o instanceof Hcl) return hcl2lab(o);
  if (!(o instanceof Rgb)) o = rgbConvert(o);
  var r = rgb2lrgb(o.r),
      g = rgb2lrgb(o.g),
      b = rgb2lrgb(o.b),
      y = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn), x, z;
  if (r === g && g === b) x = z = y; else {
    x = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn);
    z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn);
  }
  return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
}

function gray(l, opacity) {
  return new Lab(l, 0, 0, opacity == null ? 1 : opacity);
}

function lab(l, a, b, opacity) {
  return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
}

function Lab(l, a, b, opacity) {
  this.l = +l;
  this.a = +a;
  this.b = +b;
  this.opacity = +opacity;
}

src_define(Lab, lab, extend(Color, {
  brighter(k) {
    return new Lab(this.l + K * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  darker(k) {
    return new Lab(this.l - K * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  rgb() {
    var y = (this.l + 16) / 116,
        x = isNaN(this.a) ? y : y + this.a / 500,
        z = isNaN(this.b) ? y : y - this.b / 200;
    x = Xn * lab2xyz(x);
    y = Yn * lab2xyz(y);
    z = Zn * lab2xyz(z);
    return new Rgb(
      lrgb2rgb( 3.1338561 * x - 1.6168667 * y - 0.4906146 * z),
      lrgb2rgb(-0.9787684 * x + 1.9161415 * y + 0.0334540 * z),
      lrgb2rgb( 0.0719453 * x - 0.2289914 * y + 1.4052427 * z),
      this.opacity
    );
  }
}));

function xyz2lab(t) {
  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
}

function lab2xyz(t) {
  return t > t1 ? t * t * t : t2 * (t - t0);
}

function lrgb2rgb(x) {
  return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
}

function rgb2lrgb(x) {
  return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function hclConvert(o) {
  if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
  if (!(o instanceof Lab)) o = labConvert(o);
  if (o.a === 0 && o.b === 0) return new Hcl(NaN, 0 < o.l && o.l < 100 ? 0 : NaN, o.l, o.opacity);
  var h = Math.atan2(o.b, o.a) * degrees;
  return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
}

function lch(l, c, h, opacity) {
  return arguments.length === 1 ? hclConvert(l) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
}

function hcl(h, c, l, opacity) {
  return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
}

function Hcl(h, c, l, opacity) {
  this.h = +h;
  this.c = +c;
  this.l = +l;
  this.opacity = +opacity;
}

function hcl2lab(o) {
  if (isNaN(o.h)) return new Lab(o.l, 0, 0, o.opacity);
  var h = o.h * radians;
  return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
}

src_define(Hcl, hcl, extend(Color, {
  brighter(k) {
    return new Hcl(this.h, this.c, this.l + K * (k == null ? 1 : k), this.opacity);
  },
  darker(k) {
    return new Hcl(this.h, this.c, this.l - K * (k == null ? 1 : k), this.opacity);
  },
  rgb() {
    return hcl2lab(this).rgb();
  }
}));

;// ./node_modules/d3-color/src/cubehelix.js




var A = -0.14861,
    B = +1.78277,
    C = -0.29227,
    D = -0.90649,
    E = +1.97294,
    ED = E * D,
    EB = E * B,
    BC_DA = B * C - D * A;

function cubehelixConvert(o) {
  if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Rgb)) o = rgbConvert(o);
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
      bl = b - l,
      k = (E * (g - l) - C * bl) / D,
      s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
      h = s ? Math.atan2(k, bl) * degrees - 120 : NaN;
  return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
}

function cubehelix(h, s, l, opacity) {
  return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
}

function Cubehelix(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

src_define(Cubehelix, cubehelix, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  rgb() {
    var h = isNaN(this.h) ? 0 : (this.h + 120) * radians,
        l = +this.l,
        a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
        cosh = Math.cos(h),
        sinh = Math.sin(h);
    return new Rgb(
      255 * (l + a * (A * cosh + B * sinh)),
      255 * (l + a * (C * cosh + D * sinh)),
      255 * (l + a * (E * cosh)),
      this.opacity
    );
  }
}));

;// ./node_modules/d3-color/src/index.js





/***/ }),

/***/ 76314:
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ 77047:
/***/ ((__unused_webpack___webpack_module__, __unused_webpack___webpack_exports__, __webpack_require__) => {


// UNUSED EXPORTS: forceCenter, forceCollide, forceLink, forceManyBody, forceRadial, forceSimulation, forceX, forceY

;// ./node_modules/d3-force/src/center.js
/* harmony default export */ function center(x, y) {
  var nodes, strength = 1;

  if (x == null) x = 0;
  if (y == null) y = 0;

  function force() {
    var i,
        n = nodes.length,
        node,
        sx = 0,
        sy = 0;

    for (i = 0; i < n; ++i) {
      node = nodes[i], sx += node.x, sy += node.y;
    }

    for (sx = (sx / n - x) * strength, sy = (sy / n - y) * strength, i = 0; i < n; ++i) {
      node = nodes[i], node.x -= sx, node.y -= sy;
    }
  }

  force.initialize = function(_) {
    nodes = _;
  };

  force.x = function(_) {
    return arguments.length ? (x = +_, force) : x;
  };

  force.y = function(_) {
    return arguments.length ? (y = +_, force) : y;
  };

  force.strength = function(_) {
    return arguments.length ? (strength = +_, force) : strength;
  };

  return force;
}

// EXTERNAL MODULE: ./node_modules/d3-quadtree/src/index.js + 14 modules
var src = __webpack_require__(80395);
;// ./node_modules/d3-force/src/constant.js
/* harmony default export */ function src_constant(x) {
  return function() {
    return x;
  };
}

;// ./node_modules/d3-force/src/jiggle.js
/* harmony default export */ function src_jiggle(random) {
  return (random() - 0.5) * 1e-6;
}

;// ./node_modules/d3-force/src/collide.js




function collide_x(d) {
  return d.x + d.vx;
}

function collide_y(d) {
  return d.y + d.vy;
}

/* harmony default export */ function collide(radius) {
  var nodes,
      radii,
      random,
      strength = 1,
      iterations = 1;

  if (typeof radius !== "function") radius = constant(radius == null ? 1 : +radius);

  function force() {
    var i, n = nodes.length,
        tree,
        node,
        xi,
        yi,
        ri,
        ri2;

    for (var k = 0; k < iterations; ++k) {
      tree = quadtree(nodes, collide_x, collide_y).visitAfter(prepare);
      for (i = 0; i < n; ++i) {
        node = nodes[i];
        ri = radii[node.index], ri2 = ri * ri;
        xi = node.x + node.vx;
        yi = node.y + node.vy;
        tree.visit(apply);
      }
    }

    function apply(quad, x0, y0, x1, y1) {
      var data = quad.data, rj = quad.r, r = ri + rj;
      if (data) {
        if (data.index > node.index) {
          var x = xi - data.x - data.vx,
              y = yi - data.y - data.vy,
              l = x * x + y * y;
          if (l < r * r) {
            if (x === 0) x = jiggle(random), l += x * x;
            if (y === 0) y = jiggle(random), l += y * y;
            l = (r - (l = Math.sqrt(l))) / l * strength;
            node.vx += (x *= l) * (r = (rj *= rj) / (ri2 + rj));
            node.vy += (y *= l) * r;
            data.vx -= x * (r = 1 - r);
            data.vy -= y * r;
          }
        }
        return;
      }
      return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r;
    }
  }

  function prepare(quad) {
    if (quad.data) return quad.r = radii[quad.data.index];
    for (var i = quad.r = 0; i < 4; ++i) {
      if (quad[i] && quad[i].r > quad.r) {
        quad.r = quad[i].r;
      }
    }
  }

  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length, node;
    radii = new Array(n);
    for (i = 0; i < n; ++i) node = nodes[i], radii[node.index] = +radius(node, i, nodes);
  }

  force.initialize = function(_nodes, _random) {
    nodes = _nodes;
    random = _random;
    initialize();
  };

  force.iterations = function(_) {
    return arguments.length ? (iterations = +_, force) : iterations;
  };

  force.strength = function(_) {
    return arguments.length ? (strength = +_, force) : strength;
  };

  force.radius = function(_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), initialize(), force) : radius;
  };

  return force;
}

;// ./node_modules/d3-force/src/link.js



function index(d) {
  return d.index;
}

function find(nodeById, nodeId) {
  var node = nodeById.get(nodeId);
  if (!node) throw new Error("node not found: " + nodeId);
  return node;
}

/* harmony default export */ function src_link(links) {
  var id = index,
      strength = defaultStrength,
      strengths,
      distance = constant(30),
      distances,
      nodes,
      count,
      bias,
      random,
      iterations = 1;

  if (links == null) links = [];

  function defaultStrength(link) {
    return 1 / Math.min(count[link.source.index], count[link.target.index]);
  }

  function force(alpha) {
    for (var k = 0, n = links.length; k < iterations; ++k) {
      for (var i = 0, link, source, target, x, y, l, b; i < n; ++i) {
        link = links[i], source = link.source, target = link.target;
        x = target.x + target.vx - source.x - source.vx || jiggle(random);
        y = target.y + target.vy - source.y - source.vy || jiggle(random);
        l = Math.sqrt(x * x + y * y);
        l = (l - distances[i]) / l * alpha * strengths[i];
        x *= l, y *= l;
        target.vx -= x * (b = bias[i]);
        target.vy -= y * b;
        source.vx += x * (b = 1 - b);
        source.vy += y * b;
      }
    }
  }

  function initialize() {
    if (!nodes) return;

    var i,
        n = nodes.length,
        m = links.length,
        nodeById = new Map(nodes.map((d, i) => [id(d, i, nodes), d])),
        link;

    for (i = 0, count = new Array(n); i < m; ++i) {
      link = links[i], link.index = i;
      if (typeof link.source !== "object") link.source = find(nodeById, link.source);
      if (typeof link.target !== "object") link.target = find(nodeById, link.target);
      count[link.source.index] = (count[link.source.index] || 0) + 1;
      count[link.target.index] = (count[link.target.index] || 0) + 1;
    }

    for (i = 0, bias = new Array(m); i < m; ++i) {
      link = links[i], bias[i] = count[link.source.index] / (count[link.source.index] + count[link.target.index]);
    }

    strengths = new Array(m), initializeStrength();
    distances = new Array(m), initializeDistance();
  }

  function initializeStrength() {
    if (!nodes) return;

    for (var i = 0, n = links.length; i < n; ++i) {
      strengths[i] = +strength(links[i], i, links);
    }
  }

  function initializeDistance() {
    if (!nodes) return;

    for (var i = 0, n = links.length; i < n; ++i) {
      distances[i] = +distance(links[i], i, links);
    }
  }

  force.initialize = function(_nodes, _random) {
    nodes = _nodes;
    random = _random;
    initialize();
  };

  force.links = function(_) {
    return arguments.length ? (links = _, initialize(), force) : links;
  };

  force.id = function(_) {
    return arguments.length ? (id = _, force) : id;
  };

  force.iterations = function(_) {
    return arguments.length ? (iterations = +_, force) : iterations;
  };

  force.strength = function(_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant(+_), initializeStrength(), force) : strength;
  };

  force.distance = function(_) {
    return arguments.length ? (distance = typeof _ === "function" ? _ : constant(+_), initializeDistance(), force) : distance;
  };

  return force;
}

// EXTERNAL MODULE: ./node_modules/d3-dispatch/src/index.js + 1 modules
var d3_dispatch_src = __webpack_require__(90417);
// EXTERNAL MODULE: ./node_modules/d3-timer/src/index.js + 3 modules
var d3_timer_src = __webpack_require__(55282);
;// ./node_modules/d3-force/src/lcg.js
// https://en.wikipedia.org/wiki/Linear_congruential_generator#Parameters_in_common_use
const a = 1664525;
const c = 1013904223;
const m = 4294967296; // 2^32

/* harmony default export */ function src_lcg() {
  let s = 1;
  return () => (s = (a * s + c) % m) / m;
}

;// ./node_modules/d3-force/src/simulation.js




function simulation_x(d) {
  return d.x;
}

function simulation_y(d) {
  return d.y;
}

var initialRadius = 10,
    initialAngle = Math.PI * (3 - Math.sqrt(5));

/* harmony default export */ function simulation(nodes) {
  var simulation,
      alpha = 1,
      alphaMin = 0.001,
      alphaDecay = 1 - Math.pow(alphaMin, 1 / 300),
      alphaTarget = 0,
      velocityDecay = 0.6,
      forces = new Map(),
      stepper = timer(step),
      event = dispatch("tick", "end"),
      random = lcg();

  if (nodes == null) nodes = [];

  function step() {
    tick();
    event.call("tick", simulation);
    if (alpha < alphaMin) {
      stepper.stop();
      event.call("end", simulation);
    }
  }

  function tick(iterations) {
    var i, n = nodes.length, node;

    if (iterations === undefined) iterations = 1;

    for (var k = 0; k < iterations; ++k) {
      alpha += (alphaTarget - alpha) * alphaDecay;

      forces.forEach(function(force) {
        force(alpha);
      });

      for (i = 0; i < n; ++i) {
        node = nodes[i];
        if (node.fx == null) node.x += node.vx *= velocityDecay;
        else node.x = node.fx, node.vx = 0;
        if (node.fy == null) node.y += node.vy *= velocityDecay;
        else node.y = node.fy, node.vy = 0;
      }
    }

    return simulation;
  }

  function initializeNodes() {
    for (var i = 0, n = nodes.length, node; i < n; ++i) {
      node = nodes[i], node.index = i;
      if (node.fx != null) node.x = node.fx;
      if (node.fy != null) node.y = node.fy;
      if (isNaN(node.x) || isNaN(node.y)) {
        var radius = initialRadius * Math.sqrt(0.5 + i), angle = i * initialAngle;
        node.x = radius * Math.cos(angle);
        node.y = radius * Math.sin(angle);
      }
      if (isNaN(node.vx) || isNaN(node.vy)) {
        node.vx = node.vy = 0;
      }
    }
  }

  function initializeForce(force) {
    if (force.initialize) force.initialize(nodes, random);
    return force;
  }

  initializeNodes();

  return simulation = {
    tick: tick,

    restart: function() {
      return stepper.restart(step), simulation;
    },

    stop: function() {
      return stepper.stop(), simulation;
    },

    nodes: function(_) {
      return arguments.length ? (nodes = _, initializeNodes(), forces.forEach(initializeForce), simulation) : nodes;
    },

    alpha: function(_) {
      return arguments.length ? (alpha = +_, simulation) : alpha;
    },

    alphaMin: function(_) {
      return arguments.length ? (alphaMin = +_, simulation) : alphaMin;
    },

    alphaDecay: function(_) {
      return arguments.length ? (alphaDecay = +_, simulation) : +alphaDecay;
    },

    alphaTarget: function(_) {
      return arguments.length ? (alphaTarget = +_, simulation) : alphaTarget;
    },

    velocityDecay: function(_) {
      return arguments.length ? (velocityDecay = 1 - _, simulation) : 1 - velocityDecay;
    },

    randomSource: function(_) {
      return arguments.length ? (random = _, forces.forEach(initializeForce), simulation) : random;
    },

    force: function(name, _) {
      return arguments.length > 1 ? ((_ == null ? forces.delete(name) : forces.set(name, initializeForce(_))), simulation) : forces.get(name);
    },

    find: function(x, y, radius) {
      var i = 0,
          n = nodes.length,
          dx,
          dy,
          d2,
          node,
          closest;

      if (radius == null) radius = Infinity;
      else radius *= radius;

      for (i = 0; i < n; ++i) {
        node = nodes[i];
        dx = x - node.x;
        dy = y - node.y;
        d2 = dx * dx + dy * dy;
        if (d2 < radius) closest = node, radius = d2;
      }

      return closest;
    },

    on: function(name, _) {
      return arguments.length > 1 ? (event.on(name, _), simulation) : event.on(name);
    }
  };
}

;// ./node_modules/d3-force/src/manyBody.js





/* harmony default export */ function manyBody() {
  var nodes,
      node,
      random,
      alpha,
      strength = constant(-30),
      strengths,
      distanceMin2 = 1,
      distanceMax2 = Infinity,
      theta2 = 0.81;

  function force(_) {
    var i, n = nodes.length, tree = quadtree(nodes, x, y).visitAfter(accumulate);
    for (alpha = _, i = 0; i < n; ++i) node = nodes[i], tree.visit(apply);
  }

  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length, node;
    strengths = new Array(n);
    for (i = 0; i < n; ++i) node = nodes[i], strengths[node.index] = +strength(node, i, nodes);
  }

  function accumulate(quad) {
    var strength = 0, q, c, weight = 0, x, y, i;

    // For internal nodes, accumulate forces from child quadrants.
    if (quad.length) {
      for (x = y = i = 0; i < 4; ++i) {
        if ((q = quad[i]) && (c = Math.abs(q.value))) {
          strength += q.value, weight += c, x += c * q.x, y += c * q.y;
        }
      }
      quad.x = x / weight;
      quad.y = y / weight;
    }

    // For leaf nodes, accumulate forces from coincident quadrants.
    else {
      q = quad;
      q.x = q.data.x;
      q.y = q.data.y;
      do strength += strengths[q.data.index];
      while (q = q.next);
    }

    quad.value = strength;
  }

  function apply(quad, x1, _, x2) {
    if (!quad.value) return true;

    var x = quad.x - node.x,
        y = quad.y - node.y,
        w = x2 - x1,
        l = x * x + y * y;

    // Apply the Barnes-Hut approximation if possible.
    // Limit forces for very close nodes; randomize direction if coincident.
    if (w * w / theta2 < l) {
      if (l < distanceMax2) {
        if (x === 0) x = jiggle(random), l += x * x;
        if (y === 0) y = jiggle(random), l += y * y;
        if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
        node.vx += x * quad.value * alpha / l;
        node.vy += y * quad.value * alpha / l;
      }
      return true;
    }

    // Otherwise, process points directly.
    else if (quad.length || l >= distanceMax2) return;

    // Limit forces for very close nodes; randomize direction if coincident.
    if (quad.data !== node || quad.next) {
      if (x === 0) x = jiggle(random), l += x * x;
      if (y === 0) y = jiggle(random), l += y * y;
      if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
    }

    do if (quad.data !== node) {
      w = strengths[quad.data.index] * alpha / l;
      node.vx += x * w;
      node.vy += y * w;
    } while (quad = quad.next);
  }

  force.initialize = function(_nodes, _random) {
    nodes = _nodes;
    random = _random;
    initialize();
  };

  force.strength = function(_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant(+_), initialize(), force) : strength;
  };

  force.distanceMin = function(_) {
    return arguments.length ? (distanceMin2 = _ * _, force) : Math.sqrt(distanceMin2);
  };

  force.distanceMax = function(_) {
    return arguments.length ? (distanceMax2 = _ * _, force) : Math.sqrt(distanceMax2);
  };

  force.theta = function(_) {
    return arguments.length ? (theta2 = _ * _, force) : Math.sqrt(theta2);
  };

  return force;
}

;// ./node_modules/d3-force/src/radial.js


/* harmony default export */ function radial(radius, x, y) {
  var nodes,
      strength = constant(0.1),
      strengths,
      radiuses;

  if (typeof radius !== "function") radius = constant(+radius);
  if (x == null) x = 0;
  if (y == null) y = 0;

  function force(alpha) {
    for (var i = 0, n = nodes.length; i < n; ++i) {
      var node = nodes[i],
          dx = node.x - x || 1e-6,
          dy = node.y - y || 1e-6,
          r = Math.sqrt(dx * dx + dy * dy),
          k = (radiuses[i] - r) * strengths[i] * alpha / r;
      node.vx += dx * k;
      node.vy += dy * k;
    }
  }

  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length;
    strengths = new Array(n);
    radiuses = new Array(n);
    for (i = 0; i < n; ++i) {
      radiuses[i] = +radius(nodes[i], i, nodes);
      strengths[i] = isNaN(radiuses[i]) ? 0 : +strength(nodes[i], i, nodes);
    }
  }

  force.initialize = function(_) {
    nodes = _, initialize();
  };

  force.strength = function(_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant(+_), initialize(), force) : strength;
  };

  force.radius = function(_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), initialize(), force) : radius;
  };

  force.x = function(_) {
    return arguments.length ? (x = +_, force) : x;
  };

  force.y = function(_) {
    return arguments.length ? (y = +_, force) : y;
  };

  return force;
}

;// ./node_modules/d3-force/src/x.js


/* harmony default export */ function src_x(x) {
  var strength = constant(0.1),
      nodes,
      strengths,
      xz;

  if (typeof x !== "function") x = constant(x == null ? 0 : +x);

  function force(alpha) {
    for (var i = 0, n = nodes.length, node; i < n; ++i) {
      node = nodes[i], node.vx += (xz[i] - node.x) * strengths[i] * alpha;
    }
  }

  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length;
    strengths = new Array(n);
    xz = new Array(n);
    for (i = 0; i < n; ++i) {
      strengths[i] = isNaN(xz[i] = +x(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes);
    }
  }

  force.initialize = function(_) {
    nodes = _;
    initialize();
  };

  force.strength = function(_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant(+_), initialize(), force) : strength;
  };

  force.x = function(_) {
    return arguments.length ? (x = typeof _ === "function" ? _ : constant(+_), initialize(), force) : x;
  };

  return force;
}

;// ./node_modules/d3-force/src/y.js


/* harmony default export */ function src_y(y) {
  var strength = constant(0.1),
      nodes,
      strengths,
      yz;

  if (typeof y !== "function") y = constant(y == null ? 0 : +y);

  function force(alpha) {
    for (var i = 0, n = nodes.length, node; i < n; ++i) {
      node = nodes[i], node.vy += (yz[i] - node.y) * strengths[i] * alpha;
    }
  }

  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length;
    strengths = new Array(n);
    yz = new Array(n);
    for (i = 0; i < n; ++i) {
      strengths[i] = isNaN(yz[i] = +y(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes);
    }
  }

  force.initialize = function(_) {
    nodes = _;
    initialize();
  };

  force.strength = function(_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant(+_), initialize(), force) : strength;
  };

  force.y = function(_) {
    return arguments.length ? (y = typeof _ === "function" ? _ : constant(+_), initialize(), force) : y;
  };

  return force;
}

;// ./node_modules/d3-force/src/index.js










/***/ }),

/***/ 82782:
/***/ (() => {


// UNUSED EXPORTS: axisBottom, axisLeft, axisRight, axisTop

;// ./node_modules/d3-axis/src/identity.js
/* harmony default export */ function src_identity(x) {
  return x;
}

;// ./node_modules/d3-axis/src/axis.js


var axis_top = 1,
    right = 2,
    bottom = 3,
    left = 4,
    epsilon = 1e-6;

function translateX(x) {
  return "translate(" + x + ",0)";
}

function translateY(y) {
  return "translate(0," + y + ")";
}

function number(scale) {
  return d => +scale(d);
}

function center(scale, offset) {
  offset = Math.max(0, scale.bandwidth() - offset * 2) / 2;
  if (scale.round()) offset = Math.round(offset);
  return d => +scale(d) + offset;
}

function entering() {
  return !this.__axis;
}

function axis(orient, scale) {
  var tickArguments = [],
      tickValues = null,
      tickFormat = null,
      tickSizeInner = 6,
      tickSizeOuter = 6,
      tickPadding = 3,
      offset = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 0 : 0.5,
      k = orient === axis_top || orient === left ? -1 : 1,
      x = orient === left || orient === right ? "x" : "y",
      transform = orient === axis_top || orient === bottom ? translateX : translateY;

  function axis(context) {
    var values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues,
        format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity) : tickFormat,
        spacing = Math.max(tickSizeInner, 0) + tickPadding,
        range = scale.range(),
        range0 = +range[0] + offset,
        range1 = +range[range.length - 1] + offset,
        position = (scale.bandwidth ? center : number)(scale.copy(), offset),
        selection = context.selection ? context.selection() : context,
        path = selection.selectAll(".domain").data([null]),
        tick = selection.selectAll(".tick").data(values, scale).order(),
        tickExit = tick.exit(),
        tickEnter = tick.enter().append("g").attr("class", "tick"),
        line = tick.select("line"),
        text = tick.select("text");

    path = path.merge(path.enter().insert("path", ".tick")
        .attr("class", "domain")
        .attr("stroke", "currentColor"));

    tick = tick.merge(tickEnter);

    line = line.merge(tickEnter.append("line")
        .attr("stroke", "currentColor")
        .attr(x + "2", k * tickSizeInner));

    text = text.merge(tickEnter.append("text")
        .attr("fill", "currentColor")
        .attr(x, k * spacing)
        .attr("dy", orient === axis_top ? "0em" : orient === bottom ? "0.71em" : "0.32em"));

    if (context !== selection) {
      path = path.transition(context);
      tick = tick.transition(context);
      line = line.transition(context);
      text = text.transition(context);

      tickExit = tickExit.transition(context)
          .attr("opacity", epsilon)
          .attr("transform", function(d) { return isFinite(d = position(d)) ? transform(d + offset) : this.getAttribute("transform"); });

      tickEnter
          .attr("opacity", epsilon)
          .attr("transform", function(d) { var p = this.parentNode.__axis; return transform((p && isFinite(p = p(d)) ? p : position(d)) + offset); });
    }

    tickExit.remove();

    path
        .attr("d", orient === left || orient === right
            ? (tickSizeOuter ? "M" + k * tickSizeOuter + "," + range0 + "H" + offset + "V" + range1 + "H" + k * tickSizeOuter : "M" + offset + "," + range0 + "V" + range1)
            : (tickSizeOuter ? "M" + range0 + "," + k * tickSizeOuter + "V" + offset + "H" + range1 + "V" + k * tickSizeOuter : "M" + range0 + "," + offset + "H" + range1));

    tick
        .attr("opacity", 1)
        .attr("transform", function(d) { return transform(position(d) + offset); });

    line
        .attr(x + "2", k * tickSizeInner);

    text
        .attr(x, k * spacing)
        .text(format);

    selection.filter(entering)
        .attr("fill", "none")
        .attr("font-size", 10)
        .attr("font-family", "sans-serif")
        .attr("text-anchor", orient === right ? "start" : orient === left ? "end" : "middle");

    selection
        .each(function() { this.__axis = position; });
  }

  axis.scale = function(_) {
    return arguments.length ? (scale = _, axis) : scale;
  };

  axis.ticks = function() {
    return tickArguments = Array.from(arguments), axis;
  };

  axis.tickArguments = function(_) {
    return arguments.length ? (tickArguments = _ == null ? [] : Array.from(_), axis) : tickArguments.slice();
  };

  axis.tickValues = function(_) {
    return arguments.length ? (tickValues = _ == null ? null : Array.from(_), axis) : tickValues && tickValues.slice();
  };

  axis.tickFormat = function(_) {
    return arguments.length ? (tickFormat = _, axis) : tickFormat;
  };

  axis.tickSize = function(_) {
    return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis) : tickSizeInner;
  };

  axis.tickSizeInner = function(_) {
    return arguments.length ? (tickSizeInner = +_, axis) : tickSizeInner;
  };

  axis.tickSizeOuter = function(_) {
    return arguments.length ? (tickSizeOuter = +_, axis) : tickSizeOuter;
  };

  axis.tickPadding = function(_) {
    return arguments.length ? (tickPadding = +_, axis) : tickPadding;
  };

  axis.offset = function(_) {
    return arguments.length ? (offset = +_, axis) : offset;
  };

  return axis;
}

function axisTop(scale) {
  return axis(axis_top, scale);
}

function axisRight(scale) {
  return axis(right, scale);
}

function axisBottom(scale) {
  return axis(bottom, scale);
}

function axisLeft(scale) {
  return axis(left, scale);
}

;// ./node_modules/d3-axis/src/index.js



/***/ }),

/***/ 90417:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  J: () => (/* reexport */ src_dispatch)
});

;// ./node_modules/d3-dispatch/src/dispatch.js
var noop = {value: () => {}};

function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}

function Dispatch(_) {
  this._ = _;
}

function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return {type: t, name: name};
  });
}

Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._,
        T = parseTypenames(typename + "", _),
        t,
        i = -1,
        n = T.length;

    // If no callback was specified, return the callback of the given type and name.
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
      return;
    }

    // If a type was specified, set the callback for the given type and name.
    // Otherwise, if a null callback was specified, remove callbacks of the given name.
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
      else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
    }

    return this;
  },
  copy: function() {
    var copy = {}, _ = this._;
    for (var t in _) copy[t] = _[t].slice();
    return new Dispatch(copy);
  },
  call: function(type, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  }
};

function get(type, name) {
  for (var i = 0, n = type.length, c; i < n; ++i) {
    if ((c = type[i]).name === name) {
      return c.value;
    }
  }
}

function set(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null) type.push({name: name, value: callback});
  return type;
}

/* harmony default export */ const src_dispatch = (dispatch);

;// ./node_modules/d3-dispatch/src/index.js



/***/ }),

/***/ 92754:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  oR: () => (/* reexport */ cubicInOut)
});

// UNUSED EXPORTS: easeBack, easeBackIn, easeBackInOut, easeBackOut, easeBounce, easeBounceIn, easeBounceInOut, easeBounceOut, easeCircle, easeCircleIn, easeCircleInOut, easeCircleOut, easeCubic, easeCubicIn, easeCubicOut, easeElastic, easeElasticIn, easeElasticInOut, easeElasticOut, easeExp, easeExpIn, easeExpInOut, easeExpOut, easeLinear, easePoly, easePolyIn, easePolyInOut, easePolyOut, easeQuad, easeQuadIn, easeQuadInOut, easeQuadOut, easeSin, easeSinIn, easeSinInOut, easeSinOut

;// ./node_modules/d3-ease/src/linear.js
const linear = t => +t;

;// ./node_modules/d3-ease/src/quad.js
function quadIn(t) {
  return t * t;
}

function quadOut(t) {
  return t * (2 - t);
}

function quadInOut(t) {
  return ((t *= 2) <= 1 ? t * t : --t * (2 - t) + 1) / 2;
}

;// ./node_modules/d3-ease/src/cubic.js
function cubicIn(t) {
  return t * t * t;
}

function cubicOut(t) {
  return --t * t * t + 1;
}

function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}

;// ./node_modules/d3-ease/src/poly.js
var exponent = 3;

var polyIn = (function custom(e) {
  e = +e;

  function polyIn(t) {
    return Math.pow(t, e);
  }

  polyIn.exponent = custom;

  return polyIn;
})(exponent);

var polyOut = (function custom(e) {
  e = +e;

  function polyOut(t) {
    return 1 - Math.pow(1 - t, e);
  }

  polyOut.exponent = custom;

  return polyOut;
})(exponent);

var polyInOut = (function custom(e) {
  e = +e;

  function polyInOut(t) {
    return ((t *= 2) <= 1 ? Math.pow(t, e) : 2 - Math.pow(2 - t, e)) / 2;
  }

  polyInOut.exponent = custom;

  return polyInOut;
})(exponent);

;// ./node_modules/d3-ease/src/sin.js
var pi = Math.PI,
    halfPi = pi / 2;

function sinIn(t) {
  return (+t === 1) ? 1 : 1 - Math.cos(t * halfPi);
}

function sinOut(t) {
  return Math.sin(t * halfPi);
}

function sinInOut(t) {
  return (1 - Math.cos(pi * t)) / 2;
}

;// ./node_modules/d3-ease/src/math.js
// tpmt is two power minus ten times t scaled to [0,1]
function math_tpmt(x) {
  return (Math.pow(2, -10 * x) - 0.0009765625) * 1.0009775171065494;
}

;// ./node_modules/d3-ease/src/exp.js


function expIn(t) {
  return tpmt(1 - +t);
}

function expOut(t) {
  return 1 - tpmt(t);
}

function expInOut(t) {
  return ((t *= 2) <= 1 ? tpmt(1 - t) : 2 - tpmt(t - 1)) / 2;
}

;// ./node_modules/d3-ease/src/circle.js
function circleIn(t) {
  return 1 - Math.sqrt(1 - t * t);
}

function circleOut(t) {
  return Math.sqrt(1 - --t * t);
}

function circleInOut(t) {
  return ((t *= 2) <= 1 ? 1 - Math.sqrt(1 - t * t) : Math.sqrt(1 - (t -= 2) * t) + 1) / 2;
}

;// ./node_modules/d3-ease/src/bounce.js
var b1 = 4 / 11,
    b2 = (/* unused pure expression or super */ null && (6 / 11)),
    b3 = (/* unused pure expression or super */ null && (8 / 11)),
    b4 = (/* unused pure expression or super */ null && (3 / 4)),
    b5 = (/* unused pure expression or super */ null && (9 / 11)),
    b6 = (/* unused pure expression or super */ null && (10 / 11)),
    b7 = (/* unused pure expression or super */ null && (15 / 16)),
    b8 = (/* unused pure expression or super */ null && (21 / 22)),
    b9 = (/* unused pure expression or super */ null && (63 / 64)),
    b0 = 1 / b1 / b1;

function bounceIn(t) {
  return 1 - bounceOut(1 - t);
}

function bounceOut(t) {
  return (t = +t) < b1 ? b0 * t * t : t < b3 ? b0 * (t -= b2) * t + b4 : t < b6 ? b0 * (t -= b5) * t + b7 : b0 * (t -= b8) * t + b9;
}

function bounceInOut(t) {
  return ((t *= 2) <= 1 ? 1 - bounceOut(1 - t) : bounceOut(t - 1) + 1) / 2;
}

;// ./node_modules/d3-ease/src/back.js
var overshoot = 1.70158;

var backIn = (function custom(s) {
  s = +s;

  function backIn(t) {
    return (t = +t) * t * (s * (t - 1) + t);
  }

  backIn.overshoot = custom;

  return backIn;
})(overshoot);

var backOut = (function custom(s) {
  s = +s;

  function backOut(t) {
    return --t * t * ((t + 1) * s + t) + 1;
  }

  backOut.overshoot = custom;

  return backOut;
})(overshoot);

var backInOut = (function custom(s) {
  s = +s;

  function backInOut(t) {
    return ((t *= 2) < 1 ? t * t * ((s + 1) * t - s) : (t -= 2) * t * ((s + 1) * t + s) + 2) / 2;
  }

  backInOut.overshoot = custom;

  return backInOut;
})(overshoot);

;// ./node_modules/d3-ease/src/elastic.js


var tau = 2 * Math.PI,
    amplitude = 1,
    period = 0.3;

var elasticIn = (function custom(a, p) {
  var s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau);

  function elasticIn(t) {
    return a * math_tpmt(-(--t)) * Math.sin((s - t) / p);
  }

  elasticIn.amplitude = function(a) { return custom(a, p * tau); };
  elasticIn.period = function(p) { return custom(a, p); };

  return elasticIn;
})(amplitude, period);

var elasticOut = (function custom(a, p) {
  var s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau);

  function elasticOut(t) {
    return 1 - a * math_tpmt(t = +t) * Math.sin((t + s) / p);
  }

  elasticOut.amplitude = function(a) { return custom(a, p * tau); };
  elasticOut.period = function(p) { return custom(a, p); };

  return elasticOut;
})(amplitude, period);

var elasticInOut = (function custom(a, p) {
  var s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau);

  function elasticInOut(t) {
    return ((t = t * 2 - 1) < 0
        ? a * math_tpmt(-t) * Math.sin((s - t) / p)
        : 2 - a * math_tpmt(t) * Math.sin((s + t) / p)) / 2;
  }

  elasticInOut.amplitude = function(a) { return custom(a, p * tau); };
  elasticInOut.period = function(p) { return custom(a, p); };

  return elasticInOut;
})(amplitude, period);

;// ./node_modules/d3-ease/src/index.js





















/***/ }),

/***/ 97119:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  XD: () => (/* reexport */ src_nodrag),
  EH: () => (/* reexport */ nodrag_yesdrag)
});

// UNUSED EXPORTS: drag

// EXTERNAL MODULE: ./node_modules/d3-dispatch/src/index.js + 1 modules
var src = __webpack_require__(90417);
// EXTERNAL MODULE: ./node_modules/d3-selection/src/index.js + 52 modules
var d3_selection_src = __webpack_require__(53363);
;// ./node_modules/d3-drag/src/noevent.js
// These are typically used in conjunction with noevent to ensure that we can
// preventDefault on the event.
const noevent_nonpassive = {passive: false};
const noevent_nonpassivecapture = {capture: true, passive: false};

function noevent_nopropagation(event) {
  event.stopImmediatePropagation();
}

/* harmony default export */ function src_noevent(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

;// ./node_modules/d3-drag/src/nodrag.js



/* harmony default export */ function src_nodrag(view) {
  var root = view.document.documentElement,
      selection = (0,d3_selection_src/* select */.Lt)(view).on("dragstart.drag", src_noevent, noevent_nonpassivecapture);
  if ("onselectstart" in root) {
    selection.on("selectstart.drag", src_noevent, noevent_nonpassivecapture);
  } else {
    root.__noselect = root.style.MozUserSelect;
    root.style.MozUserSelect = "none";
  }
}

function nodrag_yesdrag(view, noclick) {
  var root = view.document.documentElement,
      selection = (0,d3_selection_src/* select */.Lt)(view).on("dragstart.drag", null);
  if (noclick) {
    selection.on("click.drag", src_noevent, noevent_nonpassivecapture);
    setTimeout(function() { selection.on("click.drag", null); }, 0);
  }
  if ("onselectstart" in root) {
    selection.on("selectstart.drag", null);
  } else {
    root.style.MozUserSelect = root.__noselect;
    delete root.__noselect;
  }
}

;// ./node_modules/d3-drag/src/constant.js
/* harmony default export */ const src_constant = (x => () => x);

;// ./node_modules/d3-drag/src/event.js
function event_DragEvent(type, {
  sourceEvent,
  subject,
  target,
  identifier,
  active,
  x, y, dx, dy,
  dispatch
}) {
  Object.defineProperties(this, {
    type: {value: type, enumerable: true, configurable: true},
    sourceEvent: {value: sourceEvent, enumerable: true, configurable: true},
    subject: {value: subject, enumerable: true, configurable: true},
    target: {value: target, enumerable: true, configurable: true},
    identifier: {value: identifier, enumerable: true, configurable: true},
    active: {value: active, enumerable: true, configurable: true},
    x: {value: x, enumerable: true, configurable: true},
    y: {value: y, enumerable: true, configurable: true},
    dx: {value: dx, enumerable: true, configurable: true},
    dy: {value: dy, enumerable: true, configurable: true},
    _: {value: dispatch}
  });
}

event_DragEvent.prototype.on = function() {
  var value = this._.on.apply(this._, arguments);
  return value === this._ ? this : value;
};

;// ./node_modules/d3-drag/src/drag.js







// Ignore right-click, since that should open the context menu.
function defaultFilter(event) {
  return !event.ctrlKey && !event.button;
}

function defaultContainer() {
  return this.parentNode;
}

function defaultSubject(event, d) {
  return d == null ? {x: event.x, y: event.y} : d;
}

function defaultTouchable() {
  return navigator.maxTouchPoints || ("ontouchstart" in this);
}

/* harmony default export */ function drag() {
  var filter = defaultFilter,
      container = defaultContainer,
      subject = defaultSubject,
      touchable = defaultTouchable,
      gestures = {},
      listeners = dispatch("start", "drag", "end"),
      active = 0,
      mousedownx,
      mousedowny,
      mousemoving,
      touchending,
      clickDistance2 = 0;

  function drag(selection) {
    selection
        .on("mousedown.drag", mousedowned)
      .filter(touchable)
        .on("touchstart.drag", touchstarted)
        .on("touchmove.drag", touchmoved, nonpassive)
        .on("touchend.drag touchcancel.drag", touchended)
        .style("touch-action", "none")
        .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }

  function mousedowned(event, d) {
    if (touchending || !filter.call(this, event, d)) return;
    var gesture = beforestart(this, container.call(this, event, d), event, d, "mouse");
    if (!gesture) return;
    select(event.view)
      .on("mousemove.drag", mousemoved, nonpassivecapture)
      .on("mouseup.drag", mouseupped, nonpassivecapture);
    nodrag(event.view);
    nopropagation(event);
    mousemoving = false;
    mousedownx = event.clientX;
    mousedowny = event.clientY;
    gesture("start", event);
  }

  function mousemoved(event) {
    noevent(event);
    if (!mousemoving) {
      var dx = event.clientX - mousedownx, dy = event.clientY - mousedowny;
      mousemoving = dx * dx + dy * dy > clickDistance2;
    }
    gestures.mouse("drag", event);
  }

  function mouseupped(event) {
    select(event.view).on("mousemove.drag mouseup.drag", null);
    yesdrag(event.view, mousemoving);
    noevent(event);
    gestures.mouse("end", event);
  }

  function touchstarted(event, d) {
    if (!filter.call(this, event, d)) return;
    var touches = event.changedTouches,
        c = container.call(this, event, d),
        n = touches.length, i, gesture;

    for (i = 0; i < n; ++i) {
      if (gesture = beforestart(this, c, event, d, touches[i].identifier, touches[i])) {
        nopropagation(event);
        gesture("start", event, touches[i]);
      }
    }
  }

  function touchmoved(event) {
    var touches = event.changedTouches,
        n = touches.length, i, gesture;

    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        noevent(event);
        gesture("drag", event, touches[i]);
      }
    }
  }

  function touchended(event) {
    var touches = event.changedTouches,
        n = touches.length, i, gesture;

    if (touchending) clearTimeout(touchending);
    touchending = setTimeout(function() { touchending = null; }, 500); // Ghost clicks are delayed!
    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        nopropagation(event);
        gesture("end", event, touches[i]);
      }
    }
  }

  function beforestart(that, container, event, d, identifier, touch) {
    var dispatch = listeners.copy(),
        p = pointer(touch || event, container), dx, dy,
        s;

    if ((s = subject.call(that, new DragEvent("beforestart", {
        sourceEvent: event,
        target: drag,
        identifier,
        active,
        x: p[0],
        y: p[1],
        dx: 0,
        dy: 0,
        dispatch
      }), d)) == null) return;

    dx = s.x - p[0] || 0;
    dy = s.y - p[1] || 0;

    return function gesture(type, event, touch) {
      var p0 = p, n;
      switch (type) {
        case "start": gestures[identifier] = gesture, n = active++; break;
        case "end": delete gestures[identifier], --active; // falls through
        case "drag": p = pointer(touch || event, container), n = active; break;
      }
      dispatch.call(
        type,
        that,
        new DragEvent(type, {
          sourceEvent: event,
          subject: s,
          target: drag,
          identifier,
          active: n,
          x: p[0] + dx,
          y: p[1] + dy,
          dx: p[0] - p0[0],
          dy: p[1] - p0[1],
          dispatch
        }),
        d
      );
    };
  }

  drag.filter = function(_) {
    return arguments.length ? (filter = typeof _ === "function" ? _ : constant(!!_), drag) : filter;
  };

  drag.container = function(_) {
    return arguments.length ? (container = typeof _ === "function" ? _ : constant(_), drag) : container;
  };

  drag.subject = function(_) {
    return arguments.length ? (subject = typeof _ === "function" ? _ : constant(_), drag) : subject;
  };

  drag.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant(!!_), drag) : touchable;
  };

  drag.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? drag : value;
  };

  drag.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, drag) : Math.sqrt(clickDistance2);
  };

  return drag;
}

;// ./node_modules/d3-drag/src/index.js




/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVuZG9yLWNvbW1vbi1kMmViNTYxMC43ODlkNWJkZTc3MDI2YmJkZTdhYS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFlLFNBQVMsbUJBQVM7QUFDakM7QUFDQTs7O0FDRmU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ051QztBQUNFOztBQUUxQjtBQUNmOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsbUJBQVM7QUFDeEIseUJBQXlCLG1CQUFTO0FBQ2xDO0FBQ0EsSUFBSTtBQUNKLHFCQUFxQixtQkFBUyxVQUFVLFVBQVU7QUFDbEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsVUFBVTtBQUNWOztBQUVBO0FBQ0E7QUFDQTs7O0FDdkRlLFNBQVMsYUFBTTtBQUM5QjtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25CdUM7QUFDRjtBQUNKOztBQUVqQyx3QkFBd0IsUUFBUSxDQUFDLG1CQUFTO0FBQ25DO0FBQ0E7QUFDQSxxQkFBcUIsUUFBUSxDQUFDLGFBQU07QUFDM0MsaURBQWUsV0FBVyxFQUFDOzs7QUNScEIsU0FBUyxTQUFJO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRU87O0FBRUE7O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTLDZCQUE2QjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsd0RBQXdEO0FBQ3hEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7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SUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSTs7QUFFbkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFVBQU07QUFDTjtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxVQUFNLFdBQVcsTUFBTTtBQUN2QjtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0EsYUFBYSxZQUFZLEVBQUUsWUFBWSxFQUFFLFlBQVk7QUFDckQ7O0FBRUE7QUFDQSxhQUFhLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLG9EQUFvRDtBQUMzRzs7QUFFQTtBQUNBO0FBQ0EsWUFBWSwyQkFBMkIsRUFBRSxlQUFlLElBQUksZUFBZSxJQUFJLGVBQWUsRUFBRSxxQkFBcUIsRUFBRSxHQUFHO0FBQzFIOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxVQUFNLFdBQVcsTUFBTTtBQUN2QjtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxjQUFjLDJCQUEyQixFQUFFLGVBQWUsSUFBSSxxQkFBcUIsS0FBSyxxQkFBcUIsR0FBRyxxQkFBcUIsRUFBRSxHQUFHO0FBQzFJO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzNZTztBQUNBOzs7QUNEb0M7QUFDTztBQUNQOztBQUUzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLEdBQUcsT0FBTyxVQUFVO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUNBQXFDO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBOztBQUVlO0FBQ2Y7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsVUFBTSxXQUFXLE1BQU0sQ0FBQyxLQUFLO0FBQzdCO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsR0FBRztBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQyxPQUFPO0FBQ3hDO0FBQ0E7O0FBRU87QUFDUDtBQUNBOztBQUVPO0FBQ1A7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGdCQUFnQixPQUFPO0FBQ3ZCO0FBQ0E7O0FBRUEsVUFBTSxXQUFXLE1BQU0sQ0FBQyxLQUFLO0FBQzdCO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxDQUFDOzs7QUMxSDBDO0FBQ3lCO0FBQ3pCOztBQUUzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxxQkFBcUIsR0FBRyxPQUFPLFVBQVU7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsT0FBTztBQUN6QztBQUNBOztBQUVlO0FBQ2Y7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsVUFBTSx1QkFBdUIsTUFBTSxDQUFDLEtBQUs7QUFDekM7QUFDQSxvQkFBb0IsUUFBUSxZQUFZLFFBQVE7QUFDaEQ7QUFDQSxHQUFHO0FBQ0g7QUFDQSxvQkFBb0IsTUFBTSxZQUFZLE1BQU07QUFDNUM7QUFDQSxHQUFHO0FBQ0g7QUFDQSxpREFBaUQsT0FBTztBQUN4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsR0FBRztBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOzs7QUM1RHFEO0FBQ0U7QUFDSjs7Ozs7Ozs7QUNGdkM7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFEQUFxRDtBQUNyRDtBQUNBO0FBQ0EsZ0RBQWdEO0FBQ2hEO0FBQ0E7QUFDQSxxRkFBcUY7QUFDckY7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLGlCQUFpQjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIscUJBQXFCO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWLHNGQUFzRixxQkFBcUI7QUFDM0c7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWLGlEQUFpRCxxQkFBcUI7QUFDdEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWLHNEQUFzRCxxQkFBcUI7QUFDM0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFOzs7Ozs7Ozs7OztBQ3BGQSw2QkFBZSxnQkFBUztBQUN4Qjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxnQkFBZ0IsT0FBTztBQUN2QjtBQUNBOztBQUVBLDRFQUE0RSxPQUFPO0FBQ25GO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7QUN2Q0EsNkJBQWUsc0JBQVM7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7OztBQ0pBLDZCQUFlLG9CQUFTO0FBQ3hCO0FBQ0E7OztBQ0ZxQztBQUNBO0FBQ0o7O0FBRWpDLFNBQVMsU0FBQztBQUNWO0FBQ0E7O0FBRUEsU0FBUyxTQUFDO0FBQ1Y7QUFDQTs7QUFFQSw2QkFBZSxpQkFBUztBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsb0JBQW9CLGdCQUFnQjtBQUNwQyw2QkFBNkIsU0FBQyxFQUFFLFNBQUM7QUFDakMsa0JBQWtCLE9BQU87QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDZCQUE2QixPQUFPO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsT0FBTztBQUN2Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7OztBQ25HcUM7QUFDSjs7QUFFakM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsNkJBQWUsa0JBQVM7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0NBQXNDLGdCQUFnQjtBQUN0RCx3REFBd0QsT0FBTztBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsc0NBQXNDLE9BQU87QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHFDQUFxQyxPQUFPO0FBQzVDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsc0NBQXNDLE9BQU87QUFDN0M7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsc0NBQXNDLE9BQU87QUFDN0M7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjs7QUFFdEIsNkJBQWUsbUJBQVc7QUFDMUI7QUFDQTtBQUNBOzs7QUNScUM7QUFDTjtBQUNKOztBQUVwQixTQUFTLFlBQUM7QUFDakI7QUFDQTs7QUFFTyxTQUFTLFlBQUM7QUFDakI7QUFDQTs7QUFFQTtBQUNBOztBQUVBLDZCQUFlLG9CQUFTO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQSxvQkFBb0IsZ0JBQWdCO0FBQ3BDOztBQUVBO0FBQ0E7QUFDQSxPQUFPOztBQUVQLGtCQUFrQixPQUFPO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSw0Q0FBNEMsT0FBTztBQUNuRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxrQkFBa0IsT0FBTztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzNKcUM7QUFDQTtBQUNKO0FBQ0k7O0FBRXJDLDZCQUFlLG9CQUFXO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsMkJBQTJCLE9BQU87QUFDbEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsT0FBTztBQUN2Qjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSwwQkFBMEIsT0FBTztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDBDQUEwQztBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLDBDQUEwQztBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7OztBQ25IcUM7O0FBRXJDLDZCQUFlLGdCQUFTO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNDQUFzQyxPQUFPO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE9BQU87QUFDdkI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7QUN4RHFDOztBQUVyQyw2QkFBZSxlQUFTO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsNENBQTRDLE9BQU87QUFDbkQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsT0FBTztBQUN2QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7QUN4Q3FDOztBQUVyQyw2QkFBZSxlQUFTO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsNENBQTRDLE9BQU87QUFDbkQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsT0FBTztBQUN2QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7QUN4Q21EO0FBQ0U7QUFDTjtBQUNRO0FBQ0o7QUFDUTtBQUNsQjtBQUNBOzs7Ozs7Ozs7Ozs7QUNQekMsNkJBQWUsc0JBQVM7QUFDeEI7QUFDQTs7O0FDRnFDOztBQUVyQyxJQUFJLFFBQUc7QUFDUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLFFBQUc7QUFDeEI7QUFDQSw2QkFBNkIsUUFBRzs7QUFFaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLFFBQUc7O0FBRWxDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDJDQUEyQyw0RkFBNEY7O0FBRXZJO0FBQ0E7QUFDQSwyQ0FBMkMsZ0NBQWdDLHlFQUF5RTtBQUNwSjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EseUNBQXlDLHlDQUF5Qzs7QUFFbEY7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDJCQUEyQix5QkFBeUI7QUFDcEQ7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRU87QUFDUCxjQUFjLFFBQUc7QUFDakI7O0FBRU87QUFDUDtBQUNBOztBQUVPO0FBQ1A7QUFDQTs7QUFFTztBQUNQO0FBQ0E7OztBQ3hLbUI7Ozs7Ozs7Ozs7Ozs7OztBQ0xuQixZQUFZOztBQUVaO0FBQ0EsOENBQThDLEtBQUssT0FBTztBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxHQUFHO0FBQ0g7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLG1GQUFtRixPQUFPO0FBQzFGO0FBQ0EsZ0RBQWdELE9BQU87QUFDdkQsR0FBRztBQUNIO0FBQ0E7QUFDQSxvREFBb0QsT0FBTztBQUMzRDtBQUNBOztBQUVBO0FBQ0Esc0NBQXNDLE9BQU87QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1DQUFtQyxPQUFPO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsNEJBQTRCO0FBQy9EO0FBQ0E7O0FBRUEsbURBQWUsUUFBUSxFQUFDOzs7QUNuRjBCOzs7Ozs7Ozs7Ozs7Ozs7OztBQ0EzQzs7O0FDQUE7QUFDUDtBQUNBOztBQUVPO0FBQ1A7QUFDQTs7QUFFTztBQUNQO0FBQ0E7OztBQ1ZPO0FBQ1A7QUFDQTs7QUFFTztBQUNQO0FBQ0E7O0FBRU87QUFDUDtBQUNBOzs7QUNWQTs7QUFFTztBQUNQOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLENBQUM7O0FBRU07QUFDUDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxDQUFDOztBQUVNO0FBQ1A7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsQ0FBQzs7O0FDcENEO0FBQ0E7O0FBRU87QUFDUDtBQUNBOztBQUVPO0FBQ1A7QUFDQTs7QUFFTztBQUNQO0FBQ0E7OztBQ2JBO0FBQ08sU0FBUyxTQUFJO0FBQ3BCO0FBQ0E7OztBQ0grQjs7QUFFeEI7QUFDUDtBQUNBOztBQUVPO0FBQ1A7QUFDQTs7QUFFTztBQUNQO0FBQ0E7OztBQ1pPO0FBQ1A7QUFDQTs7QUFFTztBQUNQO0FBQ0E7O0FBRU87QUFDUDtBQUNBOzs7QUNWQTtBQUNBLFNBQVMsc0RBQU07QUFDZixTQUFTLHNEQUFNO0FBQ2YsU0FBUyxxREFBSztBQUNkLFNBQVMsc0RBQU07QUFDZixTQUFTLHVEQUFPO0FBQ2hCLFNBQVMsdURBQU87QUFDaEIsU0FBUyx1REFBTztBQUNoQixTQUFTLHVEQUFPO0FBQ2hCOztBQUVPO0FBQ1A7QUFDQTs7QUFFTztBQUNQO0FBQ0E7O0FBRU87QUFDUDtBQUNBOzs7QUNyQkE7O0FBRU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxDQUFDOztBQUVNO0FBQ1A7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsQ0FBQzs7QUFFTTtBQUNQOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLENBQUM7OztBQ3BDOEI7O0FBRS9CO0FBQ0E7QUFDQTs7QUFFTztBQUNQOztBQUVBO0FBQ0EsZUFBZSxTQUFJO0FBQ25COztBQUVBLHNDQUFzQztBQUN0QyxtQ0FBbUM7O0FBRW5DO0FBQ0EsQ0FBQzs7QUFFTTtBQUNQOztBQUVBO0FBQ0EsbUJBQW1CLFNBQUk7QUFDdkI7O0FBRUEsdUNBQXVDO0FBQ3ZDLG9DQUFvQzs7QUFFcEM7QUFDQSxDQUFDOztBQUVNO0FBQ1A7O0FBRUE7QUFDQTtBQUNBLGNBQWMsU0FBSTtBQUNsQixrQkFBa0IsU0FBSTtBQUN0Qjs7QUFFQSx5Q0FBeUM7QUFDekMsc0NBQXNDOztBQUV0QztBQUNBLENBQUM7OztBQzNDb0I7O0FBT0Y7O0FBT0M7O0FBT0Q7O0FBT0Q7O0FBT0E7O0FBT0c7O0FBT0E7O0FBT0Y7O0FBT0c7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNqRXRCO0FBQ0E7QUFDTyxNQUFNLGtCQUFVLElBQUk7QUFDcEIsTUFBTSx5QkFBaUIsSUFBSTs7QUFFM0IsU0FBUyxxQkFBYTtBQUM3QjtBQUNBOztBQUVBLDZCQUFlLHFCQUFTO0FBQ3hCO0FBQ0E7QUFDQTs7O0FDWm9DO0FBQ29COztBQUV4RCw2QkFBZSxvQkFBUztBQUN4QjtBQUNBLGtCQUFrQixtQ0FBTSw0QkFBNEIsV0FBTyxFQUFFLHlCQUFpQjtBQUM5RTtBQUNBLHFDQUFxQyxXQUFPLEVBQUUseUJBQWlCO0FBQy9ELElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7QUFFTyxTQUFTLGNBQU87QUFDdkI7QUFDQSxrQkFBa0IsbUNBQU07QUFDeEI7QUFDQSwrQkFBK0IsV0FBTyxFQUFFLHlCQUFpQjtBQUN6RCw0QkFBNEIsbUNBQW1DO0FBQy9EO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7O0FDM0JBLG1EQUFlLFlBQVksRUFBQzs7O0FDQWIsU0FBUyxlQUFTO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0EsV0FBVyxrREFBa0Q7QUFDN0Qsa0JBQWtCLHlEQUF5RDtBQUMzRSxjQUFjLHFEQUFxRDtBQUNuRSxhQUFhLG9EQUFvRDtBQUNqRSxpQkFBaUIsd0RBQXdEO0FBQ3pFLGFBQWEsb0RBQW9EO0FBQ2pFLFFBQVEsK0NBQStDO0FBQ3ZELFFBQVEsK0NBQStDO0FBQ3ZELFNBQVMsZ0RBQWdEO0FBQ3pELFNBQVMsZ0RBQWdEO0FBQ3pELFFBQVE7QUFDUixHQUFHO0FBQ0g7O0FBRUEsZUFBUztBQUNUO0FBQ0E7QUFDQTs7O0FDM0JxQztBQUNRO0FBQ0Q7QUFDdUM7QUFDOUM7QUFDRjs7QUFFbkM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0JBQXNCLHdCQUF3QjtBQUM5Qzs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsNkJBQWUsZ0JBQVc7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGdCQUFnQixPQUFPO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsZ0JBQWdCLE9BQU87QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDBDQUEwQyxxQkFBcUIsUUFBUTtBQUN2RSxnQkFBZ0IsT0FBTztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esb0VBQW9FO0FBQ3BFLDJEQUEyRDtBQUMzRCx5RUFBeUU7QUFDekU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7O0FDak0wQztBQUNnQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9hc2NlbmRpbmcuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL2Rlc2NlbmRpbmcuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL2Jpc2VjdG9yLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9udW1iZXIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL2Jpc2VjdC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvYmx1ci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvY291bnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL2Nyb3NzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9jdW1zdW0uanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL3ZhcmlhbmNlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9kZXZpYXRpb24uanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL2V4dGVudC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvZnN1bS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvaWRlbnRpdHkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL2dyb3VwLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9wZXJtdXRlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9zb3J0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9ncm91cFNvcnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL2FycmF5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9jb25zdGFudC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvdGlja3MuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL25pY2UuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL3RocmVzaG9sZC9zdHVyZ2VzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9iaW4uanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL21heC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvbWF4SW5kZXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL21pbi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvbWluSW5kZXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL3F1aWNrc2VsZWN0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9ncmVhdGVzdC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvcXVhbnRpbGUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL3RocmVzaG9sZC9mcmVlZG1hbkRpYWNvbmlzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy90aHJlc2hvbGQvc2NvdHQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL21lYW4uanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL21lZGlhbi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvbWVyZ2UuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL21vZGUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL3BhaXJzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9yYW5nZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvcmFuay5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvbGVhc3QuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL2xlYXN0SW5kZXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL2dyZWF0ZXN0SW5kZXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL3NjYW4uanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL3NodWZmbGUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL3N1bS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvdHJhbnNwb3NlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy96aXAuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL2V2ZXJ5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9zb21lLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9maWx0ZXIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL21hcC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvcmVkdWNlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9yZXZlcnNlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9kaWZmZXJlbmNlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9kaXNqb2ludC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvaW50ZXJzZWN0aW9uLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9zdXBlcnNldC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvc3Vic2V0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy91bmlvbi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvZ2V0VXJsLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWNvbnRvdXIvc3JjL2FycmF5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWNvbnRvdXIvc3JjL2FzY2VuZGluZy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1jb250b3VyL3NyYy9hcmVhLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWNvbnRvdXIvc3JjL2NvbnN0YW50LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWNvbnRvdXIvc3JjL2NvbnRhaW5zLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWNvbnRvdXIvc3JjL25vb3AuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtY29udG91ci9zcmMvY29udG91cnMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtY29udG91ci9zcmMvZGVuc2l0eS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1jb250b3VyL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1jaG9yZC9zcmMvbWF0aC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1jaG9yZC9zcmMvY2hvcmQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtY2hvcmQvc3JjL2FycmF5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWNob3JkL3NyYy9jb25zdGFudC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1jaG9yZC9zcmMvcmliYm9uLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWNob3JkL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL2Zvcm1hdERlY2ltYWwuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9leHBvbmVudC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL2Zvcm1hdEdyb3VwLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvZm9ybWF0TnVtZXJhbHMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9mb3JtYXRTcGVjaWZpZXIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9mb3JtYXRUcmltLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvZm9ybWF0UHJlZml4QXV0by5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL2Zvcm1hdFJvdW5kZWQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9mb3JtYXRUeXBlcy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL2lkZW50aXR5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvbG9jYWxlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvZGVmYXVsdExvY2FsZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL3ByZWNpc2lvbkZpeGVkLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvcHJlY2lzaW9uUHJlZml4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvcHJlY2lzaW9uUm91bmQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1kZWxhdW5heS9zcmMvcGF0aC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1kZWxhdW5heS9zcmMvcG9seWdvbi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1kZWxhdW5heS9zcmMvdm9yb25vaS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1kZWxhdW5heS9zcmMvZGVsYXVuYXkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZGVsYXVuYXkvc3JjL2luZGV4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWRzdi9zcmMvZHN2LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWRzdi9zcmMvY3N2LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWRzdi9zcmMvdHN2LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWRzdi9zcmMvYXV0b1R5cGUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZHN2L3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1icnVzaC9zcmMvY29uc3RhbnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYnJ1c2gvc3JjL2V2ZW50LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWJydXNoL3NyYy9ub2V2ZW50LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWJydXNoL3NyYy9icnVzaC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1icnVzaC9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1mZXRjaC9zcmMvYmxvYi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1mZXRjaC9zcmMvYnVmZmVyLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWZldGNoL3NyYy90ZXh0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWZldGNoL3NyYy9kc3YuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZmV0Y2gvc3JjL2ltYWdlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWZldGNoL3NyYy9qc29uLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWZldGNoL3NyYy94bWwuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZmV0Y2gvc3JjL2luZGV4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWNvbG9yL3NyYy9kZWZpbmUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtY29sb3Ivc3JjL2NvbG9yLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWNvbG9yL3NyYy9tYXRoLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWNvbG9yL3NyYy9sYWIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtY29sb3Ivc3JjL2N1YmVoZWxpeC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1jb2xvci9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWZvcmNlL3NyYy9jZW50ZXIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZm9yY2Uvc3JjL2NvbnN0YW50LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWZvcmNlL3NyYy9qaWdnbGUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZm9yY2Uvc3JjL2NvbGxpZGUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZm9yY2Uvc3JjL2xpbmsuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZm9yY2Uvc3JjL2xjZy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1mb3JjZS9zcmMvc2ltdWxhdGlvbi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1mb3JjZS9zcmMvbWFueUJvZHkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZm9yY2Uvc3JjL3JhZGlhbC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1mb3JjZS9zcmMveC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1mb3JjZS9zcmMveS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1mb3JjZS9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXhpcy9zcmMvaWRlbnRpdHkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtYXhpcy9zcmMvYXhpcy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1heGlzL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1kaXNwYXRjaC9zcmMvZGlzcGF0Y2guanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZGlzcGF0Y2gvc3JjL2luZGV4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWVhc2Uvc3JjL2xpbmVhci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1lYXNlL3NyYy9xdWFkLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWVhc2Uvc3JjL2N1YmljLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWVhc2Uvc3JjL3BvbHkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZWFzZS9zcmMvc2luLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWVhc2Uvc3JjL21hdGguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZWFzZS9zcmMvZXhwLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWVhc2Uvc3JjL2NpcmNsZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1lYXNlL3NyYy9ib3VuY2UuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZWFzZS9zcmMvYmFjay5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1lYXNlL3NyYy9lbGFzdGljLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWVhc2Uvc3JjL2luZGV4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWRyYWcvc3JjL25vZXZlbnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZHJhZy9zcmMvbm9kcmFnLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWRyYWcvc3JjL2NvbnN0YW50LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWRyYWcvc3JjL2V2ZW50LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWRyYWcvc3JjL2RyYWcuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZHJhZy9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXNjZW5kaW5nKGEsIGIpIHtcbiAgcmV0dXJuIGEgPT0gbnVsbCB8fCBiID09IG51bGwgPyBOYU4gOiBhIDwgYiA/IC0xIDogYSA+IGIgPyAxIDogYSA+PSBiID8gMCA6IE5hTjtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlc2NlbmRpbmcoYSwgYikge1xuICByZXR1cm4gYSA9PSBudWxsIHx8IGIgPT0gbnVsbCA/IE5hTlxuICAgIDogYiA8IGEgPyAtMVxuICAgIDogYiA+IGEgPyAxXG4gICAgOiBiID49IGEgPyAwXG4gICAgOiBOYU47XG59XG4iLCJpbXBvcnQgYXNjZW5kaW5nIGZyb20gXCIuL2FzY2VuZGluZy5qc1wiO1xuaW1wb3J0IGRlc2NlbmRpbmcgZnJvbSBcIi4vZGVzY2VuZGluZy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBiaXNlY3RvcihmKSB7XG4gIGxldCBjb21wYXJlMSwgY29tcGFyZTIsIGRlbHRhO1xuXG4gIC8vIElmIGFuIGFjY2Vzc29yIGlzIHNwZWNpZmllZCwgcHJvbW90ZSBpdCB0byBhIGNvbXBhcmF0b3IuIEluIHRoaXMgY2FzZSB3ZVxuICAvLyBjYW4gdGVzdCB3aGV0aGVyIHRoZSBzZWFyY2ggdmFsdWUgaXMgKHNlbGYtKSBjb21wYXJhYmxlLiBXZSBjYW7igJl0IGRvIHRoaXNcbiAgLy8gZm9yIGEgY29tcGFyYXRvciAoZXhjZXB0IGZvciBzcGVjaWZpYywga25vd24gY29tcGFyYXRvcnMpIGJlY2F1c2Ugd2UgY2Fu4oCZdFxuICAvLyB0ZWxsIGlmIHRoZSBjb21wYXJhdG9yIGlzIHN5bW1ldHJpYywgYW5kIGFuIGFzeW1tZXRyaWMgY29tcGFyYXRvciBjYW7igJl0IGJlXG4gIC8vIHVzZWQgdG8gdGVzdCB3aGV0aGVyIGEgc2luZ2xlIHZhbHVlIGlzIGNvbXBhcmFibGUuXG4gIGlmIChmLmxlbmd0aCAhPT0gMikge1xuICAgIGNvbXBhcmUxID0gYXNjZW5kaW5nO1xuICAgIGNvbXBhcmUyID0gKGQsIHgpID0+IGFzY2VuZGluZyhmKGQpLCB4KTtcbiAgICBkZWx0YSA9IChkLCB4KSA9PiBmKGQpIC0geDtcbiAgfSBlbHNlIHtcbiAgICBjb21wYXJlMSA9IGYgPT09IGFzY2VuZGluZyB8fCBmID09PSBkZXNjZW5kaW5nID8gZiA6IHplcm87XG4gICAgY29tcGFyZTIgPSBmO1xuICAgIGRlbHRhID0gZjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxlZnQoYSwgeCwgbG8gPSAwLCBoaSA9IGEubGVuZ3RoKSB7XG4gICAgaWYgKGxvIDwgaGkpIHtcbiAgICAgIGlmIChjb21wYXJlMSh4LCB4KSAhPT0gMCkgcmV0dXJuIGhpO1xuICAgICAgZG8ge1xuICAgICAgICBjb25zdCBtaWQgPSAobG8gKyBoaSkgPj4+IDE7XG4gICAgICAgIGlmIChjb21wYXJlMihhW21pZF0sIHgpIDwgMCkgbG8gPSBtaWQgKyAxO1xuICAgICAgICBlbHNlIGhpID0gbWlkO1xuICAgICAgfSB3aGlsZSAobG8gPCBoaSk7XG4gICAgfVxuICAgIHJldHVybiBsbztcbiAgfVxuXG4gIGZ1bmN0aW9uIHJpZ2h0KGEsIHgsIGxvID0gMCwgaGkgPSBhLmxlbmd0aCkge1xuICAgIGlmIChsbyA8IGhpKSB7XG4gICAgICBpZiAoY29tcGFyZTEoeCwgeCkgIT09IDApIHJldHVybiBoaTtcbiAgICAgIGRvIHtcbiAgICAgICAgY29uc3QgbWlkID0gKGxvICsgaGkpID4+PiAxO1xuICAgICAgICBpZiAoY29tcGFyZTIoYVttaWRdLCB4KSA8PSAwKSBsbyA9IG1pZCArIDE7XG4gICAgICAgIGVsc2UgaGkgPSBtaWQ7XG4gICAgICB9IHdoaWxlIChsbyA8IGhpKTtcbiAgICB9XG4gICAgcmV0dXJuIGxvO1xuICB9XG5cbiAgZnVuY3Rpb24gY2VudGVyKGEsIHgsIGxvID0gMCwgaGkgPSBhLmxlbmd0aCkge1xuICAgIGNvbnN0IGkgPSBsZWZ0KGEsIHgsIGxvLCBoaSAtIDEpO1xuICAgIHJldHVybiBpID4gbG8gJiYgZGVsdGEoYVtpIC0gMV0sIHgpID4gLWRlbHRhKGFbaV0sIHgpID8gaSAtIDEgOiBpO1xuICB9XG5cbiAgcmV0dXJuIHtsZWZ0LCBjZW50ZXIsIHJpZ2h0fTtcbn1cblxuZnVuY3Rpb24gemVybygpIHtcbiAgcmV0dXJuIDA7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBudW1iZXIoeCkge1xuICByZXR1cm4geCA9PT0gbnVsbCA/IE5hTiA6ICt4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24qIG51bWJlcnModmFsdWVzLCB2YWx1ZW9mKSB7XG4gIGlmICh2YWx1ZW9mID09PSB1bmRlZmluZWQpIHtcbiAgICBmb3IgKGxldCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICh2YWx1ZSAhPSBudWxsICYmICh2YWx1ZSA9ICt2YWx1ZSkgPj0gdmFsdWUpIHtcbiAgICAgICAgeWllbGQgdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxldCBpbmRleCA9IC0xO1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKCh2YWx1ZSA9IHZhbHVlb2YodmFsdWUsICsraW5kZXgsIHZhbHVlcykpICE9IG51bGwgJiYgKHZhbHVlID0gK3ZhbHVlKSA+PSB2YWx1ZSkge1xuICAgICAgICB5aWVsZCB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCBhc2NlbmRpbmcgZnJvbSBcIi4vYXNjZW5kaW5nLmpzXCI7XG5pbXBvcnQgYmlzZWN0b3IgZnJvbSBcIi4vYmlzZWN0b3IuanNcIjtcbmltcG9ydCBudW1iZXIgZnJvbSBcIi4vbnVtYmVyLmpzXCI7XG5cbmNvbnN0IGFzY2VuZGluZ0Jpc2VjdCA9IGJpc2VjdG9yKGFzY2VuZGluZyk7XG5leHBvcnQgY29uc3QgYmlzZWN0UmlnaHQgPSBhc2NlbmRpbmdCaXNlY3QucmlnaHQ7XG5leHBvcnQgY29uc3QgYmlzZWN0TGVmdCA9IGFzY2VuZGluZ0Jpc2VjdC5sZWZ0O1xuZXhwb3J0IGNvbnN0IGJpc2VjdENlbnRlciA9IGJpc2VjdG9yKG51bWJlcikuY2VudGVyO1xuZXhwb3J0IGRlZmF1bHQgYmlzZWN0UmlnaHQ7XG4iLCJleHBvcnQgZnVuY3Rpb24gYmx1cih2YWx1ZXMsIHIpIHtcbiAgaWYgKCEoKHIgPSArcikgPj0gMCkpIHRocm93IG5ldyBSYW5nZUVycm9yKFwiaW52YWxpZCByXCIpO1xuICBsZXQgbGVuZ3RoID0gdmFsdWVzLmxlbmd0aDtcbiAgaWYgKCEoKGxlbmd0aCA9IE1hdGguZmxvb3IobGVuZ3RoKSkgPj0gMCkpIHRocm93IG5ldyBSYW5nZUVycm9yKFwiaW52YWxpZCBsZW5ndGhcIik7XG4gIGlmICghbGVuZ3RoIHx8ICFyKSByZXR1cm4gdmFsdWVzO1xuICBjb25zdCBibHVyID0gYmx1cmYocik7XG4gIGNvbnN0IHRlbXAgPSB2YWx1ZXMuc2xpY2UoKTtcbiAgYmx1cih2YWx1ZXMsIHRlbXAsIDAsIGxlbmd0aCwgMSk7XG4gIGJsdXIodGVtcCwgdmFsdWVzLCAwLCBsZW5ndGgsIDEpO1xuICBibHVyKHZhbHVlcywgdGVtcCwgMCwgbGVuZ3RoLCAxKTtcbiAgcmV0dXJuIHZhbHVlcztcbn1cblxuZXhwb3J0IGNvbnN0IGJsdXIyID0gQmx1cjIoYmx1cmYpO1xuXG5leHBvcnQgY29uc3QgYmx1ckltYWdlID0gQmx1cjIoYmx1cmZJbWFnZSk7XG5cbmZ1bmN0aW9uIEJsdXIyKGJsdXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEsIHJ4LCByeSA9IHJ4KSB7XG4gICAgaWYgKCEoKHJ4ID0gK3J4KSA+PSAwKSkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJpbnZhbGlkIHJ4XCIpO1xuICAgIGlmICghKChyeSA9ICtyeSkgPj0gMCkpIHRocm93IG5ldyBSYW5nZUVycm9yKFwiaW52YWxpZCByeVwiKTtcbiAgICBsZXQge2RhdGE6IHZhbHVlcywgd2lkdGgsIGhlaWdodH0gPSBkYXRhO1xuICAgIGlmICghKCh3aWR0aCA9IE1hdGguZmxvb3Iod2lkdGgpKSA+PSAwKSkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJpbnZhbGlkIHdpZHRoXCIpO1xuICAgIGlmICghKChoZWlnaHQgPSBNYXRoLmZsb29yKGhlaWdodCAhPT0gdW5kZWZpbmVkID8gaGVpZ2h0IDogdmFsdWVzLmxlbmd0aCAvIHdpZHRoKSkgPj0gMCkpIHRocm93IG5ldyBSYW5nZUVycm9yKFwiaW52YWxpZCBoZWlnaHRcIik7XG4gICAgaWYgKCF3aWR0aCB8fCAhaGVpZ2h0IHx8ICghcnggJiYgIXJ5KSkgcmV0dXJuIGRhdGE7XG4gICAgY29uc3QgYmx1cnggPSByeCAmJiBibHVyKHJ4KTtcbiAgICBjb25zdCBibHVyeSA9IHJ5ICYmIGJsdXIocnkpO1xuICAgIGNvbnN0IHRlbXAgPSB2YWx1ZXMuc2xpY2UoKTtcbiAgICBpZiAoYmx1cnggJiYgYmx1cnkpIHtcbiAgICAgIGJsdXJoKGJsdXJ4LCB0ZW1wLCB2YWx1ZXMsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgYmx1cmgoYmx1cngsIHZhbHVlcywgdGVtcCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICBibHVyaChibHVyeCwgdGVtcCwgdmFsdWVzLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgIGJsdXJ2KGJsdXJ5LCB2YWx1ZXMsIHRlbXAsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgYmx1cnYoYmx1cnksIHRlbXAsIHZhbHVlcywgd2lkdGgsIGhlaWdodCk7XG4gICAgICBibHVydihibHVyeSwgdmFsdWVzLCB0ZW1wLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICB9IGVsc2UgaWYgKGJsdXJ4KSB7XG4gICAgICBibHVyaChibHVyeCwgdmFsdWVzLCB0ZW1wLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgIGJsdXJoKGJsdXJ4LCB0ZW1wLCB2YWx1ZXMsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgYmx1cmgoYmx1cngsIHZhbHVlcywgdGVtcCwgd2lkdGgsIGhlaWdodCk7XG4gICAgfSBlbHNlIGlmIChibHVyeSkge1xuICAgICAgYmx1cnYoYmx1cnksIHZhbHVlcywgdGVtcCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICBibHVydihibHVyeSwgdGVtcCwgdmFsdWVzLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgIGJsdXJ2KGJsdXJ5LCB2YWx1ZXMsIHRlbXAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYmx1cmgoYmx1ciwgVCwgUywgdywgaCkge1xuICBmb3IgKGxldCB5ID0gMCwgbiA9IHcgKiBoOyB5IDwgbjspIHtcbiAgICBibHVyKFQsIFMsIHksIHkgKz0gdywgMSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYmx1cnYoYmx1ciwgVCwgUywgdywgaCkge1xuICBmb3IgKGxldCB4ID0gMCwgbiA9IHcgKiBoOyB4IDwgdzsgKyt4KSB7XG4gICAgYmx1cihULCBTLCB4LCB4ICsgbiwgdyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYmx1cmZJbWFnZShyYWRpdXMpIHtcbiAgY29uc3QgYmx1ciA9IGJsdXJmKHJhZGl1cyk7XG4gIHJldHVybiAoVCwgUywgc3RhcnQsIHN0b3AsIHN0ZXApID0+IHtcbiAgICBzdGFydCA8PD0gMiwgc3RvcCA8PD0gMiwgc3RlcCA8PD0gMjtcbiAgICBibHVyKFQsIFMsIHN0YXJ0ICsgMCwgc3RvcCArIDAsIHN0ZXApO1xuICAgIGJsdXIoVCwgUywgc3RhcnQgKyAxLCBzdG9wICsgMSwgc3RlcCk7XG4gICAgYmx1cihULCBTLCBzdGFydCArIDIsIHN0b3AgKyAyLCBzdGVwKTtcbiAgICBibHVyKFQsIFMsIHN0YXJ0ICsgMywgc3RvcCArIDMsIHN0ZXApO1xuICB9O1xufVxuXG4vLyBHaXZlbiBhIHRhcmdldCBhcnJheSBULCBhIHNvdXJjZSBhcnJheSBTLCBzZXRzIGVhY2ggdmFsdWUgVFtpXSB0byB0aGUgYXZlcmFnZVxuLy8gb2Yge1NbaSAtIHJdLCDigKYsIFNbaV0sIOKApiwgU1tpICsgcl19LCB3aGVyZSByID0g4oyKcmFkaXVz4oyLLCBzdGFydCA8PSBpIDwgc3RvcCxcbi8vIGZvciBlYWNoIGksIGkgKyBzdGVwLCBpICsgMiAqIHN0ZXAsIGV0Yy4sIGFuZCB3aGVyZSBTW2pdIGlzIGNsYW1wZWQgYmV0d2VlblxuLy8gU1tzdGFydF0gKGluY2x1c2l2ZSkgYW5kIFNbc3RvcF0gKGV4Y2x1c2l2ZSkuIElmIHRoZSBnaXZlbiByYWRpdXMgaXMgbm90IGFuXG4vLyBpbnRlZ2VyLCBTW2kgLSByIC0gMV0gYW5kIFNbaSArIHIgKyAxXSBhcmUgYWRkZWQgdG8gdGhlIHN1bSwgZWFjaCB3ZWlnaHRlZFxuLy8gYWNjb3JkaW5nIHRvIHIgLSDijIpyYWRpdXPijIsuXG5mdW5jdGlvbiBibHVyZihyYWRpdXMpIHtcbiAgY29uc3QgcmFkaXVzMCA9IE1hdGguZmxvb3IocmFkaXVzKTtcbiAgaWYgKHJhZGl1czAgPT09IHJhZGl1cykgcmV0dXJuIGJsdXJpKHJhZGl1cyk7XG4gIGNvbnN0IHQgPSByYWRpdXMgLSByYWRpdXMwO1xuICBjb25zdCB3ID0gMiAqIHJhZGl1cyArIDE7XG4gIHJldHVybiAoVCwgUywgc3RhcnQsIHN0b3AsIHN0ZXApID0+IHsgLy8gc3RvcCBtdXN0IGJlIGFsaWduZWQhXG4gICAgaWYgKCEoKHN0b3AgLT0gc3RlcCkgPj0gc3RhcnQpKSByZXR1cm47IC8vIGluY2x1c2l2ZSBzdG9wXG4gICAgbGV0IHN1bSA9IHJhZGl1czAgKiBTW3N0YXJ0XTtcbiAgICBjb25zdCBzMCA9IHN0ZXAgKiByYWRpdXMwO1xuICAgIGNvbnN0IHMxID0gczAgKyBzdGVwO1xuICAgIGZvciAobGV0IGkgPSBzdGFydCwgaiA9IHN0YXJ0ICsgczA7IGkgPCBqOyBpICs9IHN0ZXApIHtcbiAgICAgIHN1bSArPSBTW01hdGgubWluKHN0b3AsIGkpXTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0LCBqID0gc3RvcDsgaSA8PSBqOyBpICs9IHN0ZXApIHtcbiAgICAgIHN1bSArPSBTW01hdGgubWluKHN0b3AsIGkgKyBzMCldO1xuICAgICAgVFtpXSA9IChzdW0gKyB0ICogKFNbTWF0aC5tYXgoc3RhcnQsIGkgLSBzMSldICsgU1tNYXRoLm1pbihzdG9wLCBpICsgczEpXSkpIC8gdztcbiAgICAgIHN1bSAtPSBTW01hdGgubWF4KHN0YXJ0LCBpIC0gczApXTtcbiAgICB9XG4gIH07XG59XG5cbi8vIExpa2UgYmx1cmYsIGJ1dCBvcHRpbWl6ZWQgZm9yIGludGVnZXIgcmFkaXVzLlxuZnVuY3Rpb24gYmx1cmkocmFkaXVzKSB7XG4gIGNvbnN0IHcgPSAyICogcmFkaXVzICsgMTtcbiAgcmV0dXJuIChULCBTLCBzdGFydCwgc3RvcCwgc3RlcCkgPT4geyAvLyBzdG9wIG11c3QgYmUgYWxpZ25lZCFcbiAgICBpZiAoISgoc3RvcCAtPSBzdGVwKSA+PSBzdGFydCkpIHJldHVybjsgLy8gaW5jbHVzaXZlIHN0b3BcbiAgICBsZXQgc3VtID0gcmFkaXVzICogU1tzdGFydF07XG4gICAgY29uc3QgcyA9IHN0ZXAgKiByYWRpdXM7XG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0LCBqID0gc3RhcnQgKyBzOyBpIDwgajsgaSArPSBzdGVwKSB7XG4gICAgICBzdW0gKz0gU1tNYXRoLm1pbihzdG9wLCBpKV07XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSBzdGFydCwgaiA9IHN0b3A7IGkgPD0gajsgaSArPSBzdGVwKSB7XG4gICAgICBzdW0gKz0gU1tNYXRoLm1pbihzdG9wLCBpICsgcyldO1xuICAgICAgVFtpXSA9IHN1bSAvIHc7XG4gICAgICBzdW0gLT0gU1tNYXRoLm1heChzdGFydCwgaSAtIHMpXTtcbiAgICB9XG4gIH07XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb3VudCh2YWx1ZXMsIHZhbHVlb2YpIHtcbiAgbGV0IGNvdW50ID0gMDtcbiAgaWYgKHZhbHVlb2YgPT09IHVuZGVmaW5lZCkge1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHZhbHVlICE9IG51bGwgJiYgKHZhbHVlID0gK3ZhbHVlKSA+PSB2YWx1ZSkge1xuICAgICAgICArK2NvdW50O1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsZXQgaW5kZXggPSAtMTtcbiAgICBmb3IgKGxldCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICgodmFsdWUgPSB2YWx1ZW9mKHZhbHVlLCArK2luZGV4LCB2YWx1ZXMpKSAhPSBudWxsICYmICh2YWx1ZSA9ICt2YWx1ZSkgPj0gdmFsdWUpIHtcbiAgICAgICAgKytjb3VudDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNvdW50O1xufVxuIiwiZnVuY3Rpb24gbGVuZ3RoKGFycmF5KSB7XG4gIHJldHVybiBhcnJheS5sZW5ndGggfCAwO1xufVxuXG5mdW5jdGlvbiBlbXB0eShsZW5ndGgpIHtcbiAgcmV0dXJuICEobGVuZ3RoID4gMCk7XG59XG5cbmZ1bmN0aW9uIGFycmF5aWZ5KHZhbHVlcykge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlcyAhPT0gXCJvYmplY3RcIiB8fCBcImxlbmd0aFwiIGluIHZhbHVlcyA/IHZhbHVlcyA6IEFycmF5LmZyb20odmFsdWVzKTtcbn1cblxuZnVuY3Rpb24gcmVkdWNlcihyZWR1Y2UpIHtcbiAgcmV0dXJuIHZhbHVlcyA9PiByZWR1Y2UoLi4udmFsdWVzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3Jvc3MoLi4udmFsdWVzKSB7XG4gIGNvbnN0IHJlZHVjZSA9IHR5cGVvZiB2YWx1ZXNbdmFsdWVzLmxlbmd0aCAtIDFdID09PSBcImZ1bmN0aW9uXCIgJiYgcmVkdWNlcih2YWx1ZXMucG9wKCkpO1xuICB2YWx1ZXMgPSB2YWx1ZXMubWFwKGFycmF5aWZ5KTtcbiAgY29uc3QgbGVuZ3RocyA9IHZhbHVlcy5tYXAobGVuZ3RoKTtcbiAgY29uc3QgaiA9IHZhbHVlcy5sZW5ndGggLSAxO1xuICBjb25zdCBpbmRleCA9IG5ldyBBcnJheShqICsgMSkuZmlsbCgwKTtcbiAgY29uc3QgcHJvZHVjdCA9IFtdO1xuICBpZiAoaiA8IDAgfHwgbGVuZ3Rocy5zb21lKGVtcHR5KSkgcmV0dXJuIHByb2R1Y3Q7XG4gIHdoaWxlICh0cnVlKSB7XG4gICAgcHJvZHVjdC5wdXNoKGluZGV4Lm1hcCgoaiwgaSkgPT4gdmFsdWVzW2ldW2pdKSk7XG4gICAgbGV0IGkgPSBqO1xuICAgIHdoaWxlICgrK2luZGV4W2ldID09PSBsZW5ndGhzW2ldKSB7XG4gICAgICBpZiAoaSA9PT0gMCkgcmV0dXJuIHJlZHVjZSA/IHByb2R1Y3QubWFwKHJlZHVjZSkgOiBwcm9kdWN0O1xuICAgICAgaW5kZXhbaS0tXSA9IDA7XG4gICAgfVxuICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjdW1zdW0odmFsdWVzLCB2YWx1ZW9mKSB7XG4gIHZhciBzdW0gPSAwLCBpbmRleCA9IDA7XG4gIHJldHVybiBGbG9hdDY0QXJyYXkuZnJvbSh2YWx1ZXMsIHZhbHVlb2YgPT09IHVuZGVmaW5lZFxuICAgID8gdiA9PiAoc3VtICs9ICt2IHx8IDApXG4gICAgOiB2ID0+IChzdW0gKz0gK3ZhbHVlb2YodiwgaW5kZXgrKywgdmFsdWVzKSB8fCAwKSk7XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdmFyaWFuY2UodmFsdWVzLCB2YWx1ZW9mKSB7XG4gIGxldCBjb3VudCA9IDA7XG4gIGxldCBkZWx0YTtcbiAgbGV0IG1lYW4gPSAwO1xuICBsZXQgc3VtID0gMDtcbiAgaWYgKHZhbHVlb2YgPT09IHVuZGVmaW5lZCkge1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHZhbHVlICE9IG51bGwgJiYgKHZhbHVlID0gK3ZhbHVlKSA+PSB2YWx1ZSkge1xuICAgICAgICBkZWx0YSA9IHZhbHVlIC0gbWVhbjtcbiAgICAgICAgbWVhbiArPSBkZWx0YSAvICsrY291bnQ7XG4gICAgICAgIHN1bSArPSBkZWx0YSAqICh2YWx1ZSAtIG1lYW4pO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsZXQgaW5kZXggPSAtMTtcbiAgICBmb3IgKGxldCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICgodmFsdWUgPSB2YWx1ZW9mKHZhbHVlLCArK2luZGV4LCB2YWx1ZXMpKSAhPSBudWxsICYmICh2YWx1ZSA9ICt2YWx1ZSkgPj0gdmFsdWUpIHtcbiAgICAgICAgZGVsdGEgPSB2YWx1ZSAtIG1lYW47XG4gICAgICAgIG1lYW4gKz0gZGVsdGEgLyArK2NvdW50O1xuICAgICAgICBzdW0gKz0gZGVsdGEgKiAodmFsdWUgLSBtZWFuKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKGNvdW50ID4gMSkgcmV0dXJuIHN1bSAvIChjb3VudCAtIDEpO1xufVxuIiwiaW1wb3J0IHZhcmlhbmNlIGZyb20gXCIuL3ZhcmlhbmNlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRldmlhdGlvbih2YWx1ZXMsIHZhbHVlb2YpIHtcbiAgY29uc3QgdiA9IHZhcmlhbmNlKHZhbHVlcywgdmFsdWVvZik7XG4gIHJldHVybiB2ID8gTWF0aC5zcXJ0KHYpIDogdjtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGV4dGVudCh2YWx1ZXMsIHZhbHVlb2YpIHtcbiAgbGV0IG1pbjtcbiAgbGV0IG1heDtcbiAgaWYgKHZhbHVlb2YgPT09IHVuZGVmaW5lZCkge1xuICAgIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICBpZiAobWluID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAodmFsdWUgPj0gdmFsdWUpIG1pbiA9IG1heCA9IHZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChtaW4gPiB2YWx1ZSkgbWluID0gdmFsdWU7XG4gICAgICAgICAgaWYgKG1heCA8IHZhbHVlKSBtYXggPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsZXQgaW5kZXggPSAtMTtcbiAgICBmb3IgKGxldCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICgodmFsdWUgPSB2YWx1ZW9mKHZhbHVlLCArK2luZGV4LCB2YWx1ZXMpKSAhPSBudWxsKSB7XG4gICAgICAgIGlmIChtaW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmICh2YWx1ZSA+PSB2YWx1ZSkgbWluID0gbWF4ID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKG1pbiA+IHZhbHVlKSBtaW4gPSB2YWx1ZTtcbiAgICAgICAgICBpZiAobWF4IDwgdmFsdWUpIG1heCA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBbbWluLCBtYXhdO1xufVxuIiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL3B5dGhvbi9jcHl0aG9uL2Jsb2IvYTc0ZWVhMjM4ZjViYWJhMTU3OTdlMmU4YjU3MGQxNTNiYzg2OTBhNy9Nb2R1bGVzL21hdGhtb2R1bGUuYyNMMTQyM1xuZXhwb3J0IGNsYXNzIEFkZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fcGFydGlhbHMgPSBuZXcgRmxvYXQ2NEFycmF5KDMyKTtcbiAgICB0aGlzLl9uID0gMDtcbiAgfVxuICBhZGQoeCkge1xuICAgIGNvbnN0IHAgPSB0aGlzLl9wYXJ0aWFscztcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLl9uICYmIGogPCAzMjsgaisrKSB7XG4gICAgICBjb25zdCB5ID0gcFtqXSxcbiAgICAgICAgaGkgPSB4ICsgeSxcbiAgICAgICAgbG8gPSBNYXRoLmFicyh4KSA8IE1hdGguYWJzKHkpID8geCAtIChoaSAtIHkpIDogeSAtIChoaSAtIHgpO1xuICAgICAgaWYgKGxvKSBwW2krK10gPSBsbztcbiAgICAgIHggPSBoaTtcbiAgICB9XG4gICAgcFtpXSA9IHg7XG4gICAgdGhpcy5fbiA9IGkgKyAxO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHZhbHVlT2YoKSB7XG4gICAgY29uc3QgcCA9IHRoaXMuX3BhcnRpYWxzO1xuICAgIGxldCBuID0gdGhpcy5fbiwgeCwgeSwgbG8sIGhpID0gMDtcbiAgICBpZiAobiA+IDApIHtcbiAgICAgIGhpID0gcFstLW5dO1xuICAgICAgd2hpbGUgKG4gPiAwKSB7XG4gICAgICAgIHggPSBoaTtcbiAgICAgICAgeSA9IHBbLS1uXTtcbiAgICAgICAgaGkgPSB4ICsgeTtcbiAgICAgICAgbG8gPSB5IC0gKGhpIC0geCk7XG4gICAgICAgIGlmIChsbykgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAobiA+IDAgJiYgKChsbyA8IDAgJiYgcFtuIC0gMV0gPCAwKSB8fCAobG8gPiAwICYmIHBbbiAtIDFdID4gMCkpKSB7XG4gICAgICAgIHkgPSBsbyAqIDI7XG4gICAgICAgIHggPSBoaSArIHk7XG4gICAgICAgIGlmICh5ID09IHggLSBoaSkgaGkgPSB4O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaGk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZzdW0odmFsdWVzLCB2YWx1ZW9mKSB7XG4gIGNvbnN0IGFkZGVyID0gbmV3IEFkZGVyKCk7XG4gIGlmICh2YWx1ZW9mID09PSB1bmRlZmluZWQpIHtcbiAgICBmb3IgKGxldCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICh2YWx1ZSA9ICt2YWx1ZSkge1xuICAgICAgICBhZGRlci5hZGQodmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsZXQgaW5kZXggPSAtMTtcbiAgICBmb3IgKGxldCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICh2YWx1ZSA9ICt2YWx1ZW9mKHZhbHVlLCArK2luZGV4LCB2YWx1ZXMpKSB7XG4gICAgICAgIGFkZGVyLmFkZCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiArYWRkZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmY3Vtc3VtKHZhbHVlcywgdmFsdWVvZikge1xuICBjb25zdCBhZGRlciA9IG5ldyBBZGRlcigpO1xuICBsZXQgaW5kZXggPSAtMTtcbiAgcmV0dXJuIEZsb2F0NjRBcnJheS5mcm9tKHZhbHVlcywgdmFsdWVvZiA9PT0gdW5kZWZpbmVkXG4gICAgICA/IHYgPT4gYWRkZXIuYWRkKCt2IHx8IDApXG4gICAgICA6IHYgPT4gYWRkZXIuYWRkKCt2YWx1ZW9mKHYsICsraW5kZXgsIHZhbHVlcykgfHwgMClcbiAgKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGlkZW50aXR5KHgpIHtcbiAgcmV0dXJuIHg7XG59XG4iLCJpbXBvcnQge0ludGVybk1hcH0gZnJvbSBcImludGVybm1hcFwiO1xuaW1wb3J0IGlkZW50aXR5IGZyb20gXCIuL2lkZW50aXR5LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdyb3VwKHZhbHVlcywgLi4ua2V5cykge1xuICByZXR1cm4gbmVzdCh2YWx1ZXMsIGlkZW50aXR5LCBpZGVudGl0eSwga2V5cyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBncm91cHModmFsdWVzLCAuLi5rZXlzKSB7XG4gIHJldHVybiBuZXN0KHZhbHVlcywgQXJyYXkuZnJvbSwgaWRlbnRpdHksIGtleXMpO1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuKGdyb3Vwcywga2V5cykge1xuICBmb3IgKGxldCBpID0gMSwgbiA9IGtleXMubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgZ3JvdXBzID0gZ3JvdXBzLmZsYXRNYXAoZyA9PiBnLnBvcCgpLm1hcCgoW2tleSwgdmFsdWVdKSA9PiBbLi4uZywga2V5LCB2YWx1ZV0pKTtcbiAgfVxuICByZXR1cm4gZ3JvdXBzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmxhdEdyb3VwKHZhbHVlcywgLi4ua2V5cykge1xuICByZXR1cm4gZmxhdHRlbihncm91cHModmFsdWVzLCAuLi5rZXlzKSwga2V5cyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbGF0Um9sbHVwKHZhbHVlcywgcmVkdWNlLCAuLi5rZXlzKSB7XG4gIHJldHVybiBmbGF0dGVuKHJvbGx1cHModmFsdWVzLCByZWR1Y2UsIC4uLmtleXMpLCBrZXlzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJvbGx1cCh2YWx1ZXMsIHJlZHVjZSwgLi4ua2V5cykge1xuICByZXR1cm4gbmVzdCh2YWx1ZXMsIGlkZW50aXR5LCByZWR1Y2UsIGtleXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcm9sbHVwcyh2YWx1ZXMsIHJlZHVjZSwgLi4ua2V5cykge1xuICByZXR1cm4gbmVzdCh2YWx1ZXMsIEFycmF5LmZyb20sIHJlZHVjZSwga2V5cyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmRleCh2YWx1ZXMsIC4uLmtleXMpIHtcbiAgcmV0dXJuIG5lc3QodmFsdWVzLCBpZGVudGl0eSwgdW5pcXVlLCBrZXlzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluZGV4ZXModmFsdWVzLCAuLi5rZXlzKSB7XG4gIHJldHVybiBuZXN0KHZhbHVlcywgQXJyYXkuZnJvbSwgdW5pcXVlLCBrZXlzKTtcbn1cblxuZnVuY3Rpb24gdW5pcXVlKHZhbHVlcykge1xuICBpZiAodmFsdWVzLmxlbmd0aCAhPT0gMSkgdGhyb3cgbmV3IEVycm9yKFwiZHVwbGljYXRlIGtleVwiKTtcbiAgcmV0dXJuIHZhbHVlc1swXTtcbn1cblxuZnVuY3Rpb24gbmVzdCh2YWx1ZXMsIG1hcCwgcmVkdWNlLCBrZXlzKSB7XG4gIHJldHVybiAoZnVuY3Rpb24gcmVncm91cCh2YWx1ZXMsIGkpIHtcbiAgICBpZiAoaSA+PSBrZXlzLmxlbmd0aCkgcmV0dXJuIHJlZHVjZSh2YWx1ZXMpO1xuICAgIGNvbnN0IGdyb3VwcyA9IG5ldyBJbnRlcm5NYXAoKTtcbiAgICBjb25zdCBrZXlvZiA9IGtleXNbaSsrXTtcbiAgICBsZXQgaW5kZXggPSAtMTtcbiAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgY29uc3Qga2V5ID0ga2V5b2YodmFsdWUsICsraW5kZXgsIHZhbHVlcyk7XG4gICAgICBjb25zdCBncm91cCA9IGdyb3Vwcy5nZXQoa2V5KTtcbiAgICAgIGlmIChncm91cCkgZ3JvdXAucHVzaCh2YWx1ZSk7XG4gICAgICBlbHNlIGdyb3Vwcy5zZXQoa2V5LCBbdmFsdWVdKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZXNdIG9mIGdyb3Vwcykge1xuICAgICAgZ3JvdXBzLnNldChrZXksIHJlZ3JvdXAodmFsdWVzLCBpKSk7XG4gICAgfVxuICAgIHJldHVybiBtYXAoZ3JvdXBzKTtcbiAgfSkodmFsdWVzLCAwKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBlcm11dGUoc291cmNlLCBrZXlzKSB7XG4gIHJldHVybiBBcnJheS5mcm9tKGtleXMsIGtleSA9PiBzb3VyY2Vba2V5XSk7XG59XG4iLCJpbXBvcnQgYXNjZW5kaW5nIGZyb20gXCIuL2FzY2VuZGluZy5qc1wiO1xuaW1wb3J0IHBlcm11dGUgZnJvbSBcIi4vcGVybXV0ZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzb3J0KHZhbHVlcywgLi4uRikge1xuICBpZiAodHlwZW9mIHZhbHVlc1tTeW1ib2wuaXRlcmF0b3JdICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJ2YWx1ZXMgaXMgbm90IGl0ZXJhYmxlXCIpO1xuICB2YWx1ZXMgPSBBcnJheS5mcm9tKHZhbHVlcyk7XG4gIGxldCBbZl0gPSBGO1xuICBpZiAoKGYgJiYgZi5sZW5ndGggIT09IDIpIHx8IEYubGVuZ3RoID4gMSkge1xuICAgIGNvbnN0IGluZGV4ID0gVWludDMyQXJyYXkuZnJvbSh2YWx1ZXMsIChkLCBpKSA9PiBpKTtcbiAgICBpZiAoRi5sZW5ndGggPiAxKSB7XG4gICAgICBGID0gRi5tYXAoZiA9PiB2YWx1ZXMubWFwKGYpKTtcbiAgICAgIGluZGV4LnNvcnQoKGksIGopID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBmIG9mIEYpIHtcbiAgICAgICAgICBjb25zdCBjID0gYXNjZW5kaW5nRGVmaW5lZChmW2ldLCBmW2pdKTtcbiAgICAgICAgICBpZiAoYykgcmV0dXJuIGM7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBmID0gdmFsdWVzLm1hcChmKTtcbiAgICAgIGluZGV4LnNvcnQoKGksIGopID0+IGFzY2VuZGluZ0RlZmluZWQoZltpXSwgZltqXSkpO1xuICAgIH1cbiAgICByZXR1cm4gcGVybXV0ZSh2YWx1ZXMsIGluZGV4KTtcbiAgfVxuICByZXR1cm4gdmFsdWVzLnNvcnQoY29tcGFyZURlZmluZWQoZikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcGFyZURlZmluZWQoY29tcGFyZSA9IGFzY2VuZGluZykge1xuICBpZiAoY29tcGFyZSA9PT0gYXNjZW5kaW5nKSByZXR1cm4gYXNjZW5kaW5nRGVmaW5lZDtcbiAgaWYgKHR5cGVvZiBjb21wYXJlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJjb21wYXJlIGlzIG5vdCBhIGZ1bmN0aW9uXCIpO1xuICByZXR1cm4gKGEsIGIpID0+IHtcbiAgICBjb25zdCB4ID0gY29tcGFyZShhLCBiKTtcbiAgICBpZiAoeCB8fCB4ID09PSAwKSByZXR1cm4geDtcbiAgICByZXR1cm4gKGNvbXBhcmUoYiwgYikgPT09IDApIC0gKGNvbXBhcmUoYSwgYSkgPT09IDApO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNjZW5kaW5nRGVmaW5lZChhLCBiKSB7XG4gIHJldHVybiAoYSA9PSBudWxsIHx8ICEoYSA+PSBhKSkgLSAoYiA9PSBudWxsIHx8ICEoYiA+PSBiKSkgfHwgKGEgPCBiID8gLTEgOiBhID4gYiA/IDEgOiAwKTtcbn1cbiIsImltcG9ydCBhc2NlbmRpbmcgZnJvbSBcIi4vYXNjZW5kaW5nLmpzXCI7XG5pbXBvcnQgZ3JvdXAsIHtyb2xsdXB9IGZyb20gXCIuL2dyb3VwLmpzXCI7XG5pbXBvcnQgc29ydCBmcm9tIFwiLi9zb3J0LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdyb3VwU29ydCh2YWx1ZXMsIHJlZHVjZSwga2V5KSB7XG4gIHJldHVybiAocmVkdWNlLmxlbmd0aCAhPT0gMlxuICAgID8gc29ydChyb2xsdXAodmFsdWVzLCByZWR1Y2UsIGtleSksICgoW2FrLCBhdl0sIFtiaywgYnZdKSA9PiBhc2NlbmRpbmcoYXYsIGJ2KSB8fCBhc2NlbmRpbmcoYWssIGJrKSkpXG4gICAgOiBzb3J0KGdyb3VwKHZhbHVlcywga2V5KSwgKChbYWssIGF2XSwgW2JrLCBidl0pID0+IHJlZHVjZShhdiwgYnYpIHx8IGFzY2VuZGluZyhhaywgYmspKSkpXG4gICAgLm1hcCgoW2tleV0pID0+IGtleSk7XG59XG4iLCJ2YXIgYXJyYXkgPSBBcnJheS5wcm90b3R5cGU7XG5cbmV4cG9ydCB2YXIgc2xpY2UgPSBhcnJheS5zbGljZTtcbmV4cG9ydCB2YXIgbWFwID0gYXJyYXkubWFwO1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29uc3RhbnQoeCkge1xuICByZXR1cm4gKCkgPT4geDtcbn1cbiIsImNvbnN0IGUxMCA9IE1hdGguc3FydCg1MCksXG4gICAgZTUgPSBNYXRoLnNxcnQoMTApLFxuICAgIGUyID0gTWF0aC5zcXJ0KDIpO1xuXG5mdW5jdGlvbiB0aWNrU3BlYyhzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgY29uc3Qgc3RlcCA9IChzdG9wIC0gc3RhcnQpIC8gTWF0aC5tYXgoMCwgY291bnQpLFxuICAgICAgcG93ZXIgPSBNYXRoLmZsb29yKE1hdGgubG9nMTAoc3RlcCkpLFxuICAgICAgZXJyb3IgPSBzdGVwIC8gTWF0aC5wb3coMTAsIHBvd2VyKSxcbiAgICAgIGZhY3RvciA9IGVycm9yID49IGUxMCA/IDEwIDogZXJyb3IgPj0gZTUgPyA1IDogZXJyb3IgPj0gZTIgPyAyIDogMTtcbiAgbGV0IGkxLCBpMiwgaW5jO1xuICBpZiAocG93ZXIgPCAwKSB7XG4gICAgaW5jID0gTWF0aC5wb3coMTAsIC1wb3dlcikgLyBmYWN0b3I7XG4gICAgaTEgPSBNYXRoLnJvdW5kKHN0YXJ0ICogaW5jKTtcbiAgICBpMiA9IE1hdGgucm91bmQoc3RvcCAqIGluYyk7XG4gICAgaWYgKGkxIC8gaW5jIDwgc3RhcnQpICsraTE7XG4gICAgaWYgKGkyIC8gaW5jID4gc3RvcCkgLS1pMjtcbiAgICBpbmMgPSAtaW5jO1xuICB9IGVsc2Uge1xuICAgIGluYyA9IE1hdGgucG93KDEwLCBwb3dlcikgKiBmYWN0b3I7XG4gICAgaTEgPSBNYXRoLnJvdW5kKHN0YXJ0IC8gaW5jKTtcbiAgICBpMiA9IE1hdGgucm91bmQoc3RvcCAvIGluYyk7XG4gICAgaWYgKGkxICogaW5jIDwgc3RhcnQpICsraTE7XG4gICAgaWYgKGkyICogaW5jID4gc3RvcCkgLS1pMjtcbiAgfVxuICBpZiAoaTIgPCBpMSAmJiAwLjUgPD0gY291bnQgJiYgY291bnQgPCAyKSByZXR1cm4gdGlja1NwZWMoc3RhcnQsIHN0b3AsIGNvdW50ICogMik7XG4gIHJldHVybiBbaTEsIGkyLCBpbmNdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0aWNrcyhzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgc3RvcCA9ICtzdG9wLCBzdGFydCA9ICtzdGFydCwgY291bnQgPSArY291bnQ7XG4gIGlmICghKGNvdW50ID4gMCkpIHJldHVybiBbXTtcbiAgaWYgKHN0YXJ0ID09PSBzdG9wKSByZXR1cm4gW3N0YXJ0XTtcbiAgY29uc3QgcmV2ZXJzZSA9IHN0b3AgPCBzdGFydCwgW2kxLCBpMiwgaW5jXSA9IHJldmVyc2UgPyB0aWNrU3BlYyhzdG9wLCBzdGFydCwgY291bnQpIDogdGlja1NwZWMoc3RhcnQsIHN0b3AsIGNvdW50KTtcbiAgaWYgKCEoaTIgPj0gaTEpKSByZXR1cm4gW107XG4gIGNvbnN0IG4gPSBpMiAtIGkxICsgMSwgdGlja3MgPSBuZXcgQXJyYXkobik7XG4gIGlmIChyZXZlcnNlKSB7XG4gICAgaWYgKGluYyA8IDApIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgKytpKSB0aWNrc1tpXSA9IChpMiAtIGkpIC8gLWluYztcbiAgICBlbHNlIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgKytpKSB0aWNrc1tpXSA9IChpMiAtIGkpICogaW5jO1xuICB9IGVsc2Uge1xuICAgIGlmIChpbmMgPCAwKSBmb3IgKGxldCBpID0gMDsgaSA8IG47ICsraSkgdGlja3NbaV0gPSAoaTEgKyBpKSAvIC1pbmM7XG4gICAgZWxzZSBmb3IgKGxldCBpID0gMDsgaSA8IG47ICsraSkgdGlja3NbaV0gPSAoaTEgKyBpKSAqIGluYztcbiAgfVxuICByZXR1cm4gdGlja3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aWNrSW5jcmVtZW50KHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICBzdG9wID0gK3N0b3AsIHN0YXJ0ID0gK3N0YXJ0LCBjb3VudCA9ICtjb3VudDtcbiAgcmV0dXJuIHRpY2tTcGVjKHN0YXJ0LCBzdG9wLCBjb3VudClbMl07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aWNrU3RlcChzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgc3RvcCA9ICtzdG9wLCBzdGFydCA9ICtzdGFydCwgY291bnQgPSArY291bnQ7XG4gIGNvbnN0IHJldmVyc2UgPSBzdG9wIDwgc3RhcnQsIGluYyA9IHJldmVyc2UgPyB0aWNrSW5jcmVtZW50KHN0b3AsIHN0YXJ0LCBjb3VudCkgOiB0aWNrSW5jcmVtZW50KHN0YXJ0LCBzdG9wLCBjb3VudCk7XG4gIHJldHVybiAocmV2ZXJzZSA/IC0xIDogMSkgKiAoaW5jIDwgMCA/IDEgLyAtaW5jIDogaW5jKTtcbn1cbiIsImltcG9ydCB7dGlja0luY3JlbWVudH0gZnJvbSBcIi4vdGlja3MuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbmljZShzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgbGV0IHByZXN0ZXA7XG4gIHdoaWxlICh0cnVlKSB7XG4gICAgY29uc3Qgc3RlcCA9IHRpY2tJbmNyZW1lbnQoc3RhcnQsIHN0b3AsIGNvdW50KTtcbiAgICBpZiAoc3RlcCA9PT0gcHJlc3RlcCB8fCBzdGVwID09PSAwIHx8ICFpc0Zpbml0ZShzdGVwKSkge1xuICAgICAgcmV0dXJuIFtzdGFydCwgc3RvcF07XG4gICAgfSBlbHNlIGlmIChzdGVwID4gMCkge1xuICAgICAgc3RhcnQgPSBNYXRoLmZsb29yKHN0YXJ0IC8gc3RlcCkgKiBzdGVwO1xuICAgICAgc3RvcCA9IE1hdGguY2VpbChzdG9wIC8gc3RlcCkgKiBzdGVwO1xuICAgIH0gZWxzZSBpZiAoc3RlcCA8IDApIHtcbiAgICAgIHN0YXJ0ID0gTWF0aC5jZWlsKHN0YXJ0ICogc3RlcCkgLyBzdGVwO1xuICAgICAgc3RvcCA9IE1hdGguZmxvb3Ioc3RvcCAqIHN0ZXApIC8gc3RlcDtcbiAgICB9XG4gICAgcHJlc3RlcCA9IHN0ZXA7XG4gIH1cbn1cbiIsImltcG9ydCBjb3VudCBmcm9tIFwiLi4vY291bnQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdGhyZXNob2xkU3R1cmdlcyh2YWx1ZXMpIHtcbiAgcmV0dXJuIE1hdGgubWF4KDEsIE1hdGguY2VpbChNYXRoLmxvZyhjb3VudCh2YWx1ZXMpKSAvIE1hdGguTE4yKSArIDEpO1xufVxuIiwiaW1wb3J0IHtzbGljZX0gZnJvbSBcIi4vYXJyYXkuanNcIjtcbmltcG9ydCBiaXNlY3QgZnJvbSBcIi4vYmlzZWN0LmpzXCI7XG5pbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcbmltcG9ydCBleHRlbnQgZnJvbSBcIi4vZXh0ZW50LmpzXCI7XG5pbXBvcnQgaWRlbnRpdHkgZnJvbSBcIi4vaWRlbnRpdHkuanNcIjtcbmltcG9ydCBuaWNlIGZyb20gXCIuL25pY2UuanNcIjtcbmltcG9ydCB0aWNrcywge3RpY2tJbmNyZW1lbnR9IGZyb20gXCIuL3RpY2tzLmpzXCI7XG5pbXBvcnQgc3R1cmdlcyBmcm9tIFwiLi90aHJlc2hvbGQvc3R1cmdlcy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBiaW4oKSB7XG4gIHZhciB2YWx1ZSA9IGlkZW50aXR5LFxuICAgICAgZG9tYWluID0gZXh0ZW50LFxuICAgICAgdGhyZXNob2xkID0gc3R1cmdlcztcblxuICBmdW5jdGlvbiBoaXN0b2dyYW0oZGF0YSkge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShkYXRhKSkgZGF0YSA9IEFycmF5LmZyb20oZGF0YSk7XG5cbiAgICB2YXIgaSxcbiAgICAgICAgbiA9IGRhdGEubGVuZ3RoLFxuICAgICAgICB4LFxuICAgICAgICBzdGVwLFxuICAgICAgICB2YWx1ZXMgPSBuZXcgQXJyYXkobik7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICB2YWx1ZXNbaV0gPSB2YWx1ZShkYXRhW2ldLCBpLCBkYXRhKTtcbiAgICB9XG5cbiAgICB2YXIgeHogPSBkb21haW4odmFsdWVzKSxcbiAgICAgICAgeDAgPSB4elswXSxcbiAgICAgICAgeDEgPSB4elsxXSxcbiAgICAgICAgdHogPSB0aHJlc2hvbGQodmFsdWVzLCB4MCwgeDEpO1xuXG4gICAgLy8gQ29udmVydCBudW1iZXIgb2YgdGhyZXNob2xkcyBpbnRvIHVuaWZvcm0gdGhyZXNob2xkcywgYW5kIG5pY2UgdGhlXG4gICAgLy8gZGVmYXVsdCBkb21haW4gYWNjb3JkaW5nbHkuXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHR6KSkge1xuICAgICAgY29uc3QgbWF4ID0geDEsIHRuID0gK3R6O1xuICAgICAgaWYgKGRvbWFpbiA9PT0gZXh0ZW50KSBbeDAsIHgxXSA9IG5pY2UoeDAsIHgxLCB0bik7XG4gICAgICB0eiA9IHRpY2tzKHgwLCB4MSwgdG4pO1xuXG4gICAgICAvLyBJZiB0aGUgZG9tYWluIGlzIGFsaWduZWQgd2l0aCB0aGUgZmlyc3QgdGljayAod2hpY2ggaXQgd2lsbCBieVxuICAgICAgLy8gZGVmYXVsdCksIHRoZW4gd2UgY2FuIHVzZSBxdWFudGl6YXRpb24gcmF0aGVyIHRoYW4gYmlzZWN0aW9uIHRvIGJpblxuICAgICAgLy8gdmFsdWVzLCB3aGljaCBpcyBzdWJzdGFudGlhbGx5IGZhc3Rlci5cbiAgICAgIGlmICh0elswXSA8PSB4MCkgc3RlcCA9IHRpY2tJbmNyZW1lbnQoeDAsIHgxLCB0bik7XG5cbiAgICAgIC8vIElmIHRoZSBsYXN0IHRocmVzaG9sZCBpcyBjb2luY2lkZW50IHdpdGggdGhlIGRvbWFpbuKAmXMgdXBwZXIgYm91bmQsIHRoZVxuICAgICAgLy8gbGFzdCBiaW4gd2lsbCBiZSB6ZXJvLXdpZHRoLiBJZiB0aGUgZGVmYXVsdCBkb21haW4gaXMgdXNlZCwgYW5kIHRoaXNcbiAgICAgIC8vIGxhc3QgdGhyZXNob2xkIGlzIGNvaW5jaWRlbnQgd2l0aCB0aGUgbWF4aW11bSBpbnB1dCB2YWx1ZSwgd2UgY2FuXG4gICAgICAvLyBleHRlbmQgdGhlIG5pY2VkIHVwcGVyIGJvdW5kIGJ5IG9uZSB0aWNrIHRvIGVuc3VyZSB1bmlmb3JtIGJpbiB3aWR0aHM7XG4gICAgICAvLyBvdGhlcndpc2UsIHdlIHNpbXBseSByZW1vdmUgdGhlIGxhc3QgdGhyZXNob2xkLiBOb3RlIHRoYXQgd2UgZG9u4oCZdFxuICAgICAgLy8gY29lcmNlIHZhbHVlcyBvciB0aGUgZG9tYWluIHRvIG51bWJlcnMsIGFuZCB0aHVzIG11c3QgYmUgY2FyZWZ1bCB0b1xuICAgICAgLy8gY29tcGFyZSBvcmRlciAoPj0pIHJhdGhlciB0aGFuIHN0cmljdCBlcXVhbGl0eSAoPT09KSFcbiAgICAgIGlmICh0elt0ei5sZW5ndGggLSAxXSA+PSB4MSkge1xuICAgICAgICBpZiAobWF4ID49IHgxICYmIGRvbWFpbiA9PT0gZXh0ZW50KSB7XG4gICAgICAgICAgY29uc3Qgc3RlcCA9IHRpY2tJbmNyZW1lbnQoeDAsIHgxLCB0bik7XG4gICAgICAgICAgaWYgKGlzRmluaXRlKHN0ZXApKSB7XG4gICAgICAgICAgICBpZiAoc3RlcCA+IDApIHtcbiAgICAgICAgICAgICAgeDEgPSAoTWF0aC5mbG9vcih4MSAvIHN0ZXApICsgMSkgKiBzdGVwO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzdGVwIDwgMCkge1xuICAgICAgICAgICAgICB4MSA9IChNYXRoLmNlaWwoeDEgKiAtc3RlcCkgKyAxKSAvIC1zdGVwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0ei5wb3AoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlbW92ZSBhbnkgdGhyZXNob2xkcyBvdXRzaWRlIHRoZSBkb21haW4uXG4gICAgLy8gQmUgY2FyZWZ1bCBub3QgdG8gbXV0YXRlIGFuIGFycmF5IG93bmVkIGJ5IHRoZSB1c2VyIVxuICAgIHZhciBtID0gdHoubGVuZ3RoLCBhID0gMCwgYiA9IG07XG4gICAgd2hpbGUgKHR6W2FdIDw9IHgwKSArK2E7XG4gICAgd2hpbGUgKHR6W2IgLSAxXSA+IHgxKSAtLWI7XG4gICAgaWYgKGEgfHwgYiA8IG0pIHR6ID0gdHouc2xpY2UoYSwgYiksIG0gPSBiIC0gYTtcblxuICAgIHZhciBiaW5zID0gbmV3IEFycmF5KG0gKyAxKSxcbiAgICAgICAgYmluO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSBiaW5zLlxuICAgIGZvciAoaSA9IDA7IGkgPD0gbTsgKytpKSB7XG4gICAgICBiaW4gPSBiaW5zW2ldID0gW107XG4gICAgICBiaW4ueDAgPSBpID4gMCA/IHR6W2kgLSAxXSA6IHgwO1xuICAgICAgYmluLngxID0gaSA8IG0gPyB0eltpXSA6IHgxO1xuICAgIH1cblxuICAgIC8vIEFzc2lnbiBkYXRhIHRvIGJpbnMgYnkgdmFsdWUsIGlnbm9yaW5nIGFueSBvdXRzaWRlIHRoZSBkb21haW4uXG4gICAgaWYgKGlzRmluaXRlKHN0ZXApKSB7XG4gICAgICBpZiAoc3RlcCA+IDApIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgICAgIGlmICgoeCA9IHZhbHVlc1tpXSkgIT0gbnVsbCAmJiB4MCA8PSB4ICYmIHggPD0geDEpIHtcbiAgICAgICAgICAgIGJpbnNbTWF0aC5taW4obSwgTWF0aC5mbG9vcigoeCAtIHgwKSAvIHN0ZXApKV0ucHVzaChkYXRhW2ldKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc3RlcCA8IDApIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgICAgIGlmICgoeCA9IHZhbHVlc1tpXSkgIT0gbnVsbCAmJiB4MCA8PSB4ICYmIHggPD0geDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGogPSBNYXRoLmZsb29yKCh4MCAtIHgpICogc3RlcCk7XG4gICAgICAgICAgICBiaW5zW01hdGgubWluKG0sIGogKyAodHpbal0gPD0geCkpXS5wdXNoKGRhdGFbaV0pOyAvLyBoYW5kbGUgb2ZmLWJ5LW9uZSBkdWUgdG8gcm91bmRpbmdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgICBpZiAoKHggPSB2YWx1ZXNbaV0pICE9IG51bGwgJiYgeDAgPD0geCAmJiB4IDw9IHgxKSB7XG4gICAgICAgICAgYmluc1tiaXNlY3QodHosIHgsIDAsIG0pXS5wdXNoKGRhdGFbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJpbnM7XG4gIH1cblxuICBoaXN0b2dyYW0udmFsdWUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodmFsdWUgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KF8pLCBoaXN0b2dyYW0pIDogdmFsdWU7XG4gIH07XG5cbiAgaGlzdG9ncmFtLmRvbWFpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChkb21haW4gPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KFtfWzBdLCBfWzFdXSksIGhpc3RvZ3JhbSkgOiBkb21haW47XG4gIH07XG5cbiAgaGlzdG9ncmFtLnRocmVzaG9sZHMgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodGhyZXNob2xkID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudChBcnJheS5pc0FycmF5KF8pID8gc2xpY2UuY2FsbChfKSA6IF8pLCBoaXN0b2dyYW0pIDogdGhyZXNob2xkO1xuICB9O1xuXG4gIHJldHVybiBoaXN0b2dyYW07XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtYXgodmFsdWVzLCB2YWx1ZW9mKSB7XG4gIGxldCBtYXg7XG4gIGlmICh2YWx1ZW9mID09PSB1bmRlZmluZWQpIHtcbiAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHZhbHVlICE9IG51bGxcbiAgICAgICAgICAmJiAobWF4IDwgdmFsdWUgfHwgKG1heCA9PT0gdW5kZWZpbmVkICYmIHZhbHVlID49IHZhbHVlKSkpIHtcbiAgICAgICAgbWF4ID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxldCBpbmRleCA9IC0xO1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKCh2YWx1ZSA9IHZhbHVlb2YodmFsdWUsICsraW5kZXgsIHZhbHVlcykpICE9IG51bGxcbiAgICAgICAgICAmJiAobWF4IDwgdmFsdWUgfHwgKG1heCA9PT0gdW5kZWZpbmVkICYmIHZhbHVlID49IHZhbHVlKSkpIHtcbiAgICAgICAgbWF4ID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBtYXg7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtYXhJbmRleCh2YWx1ZXMsIHZhbHVlb2YpIHtcbiAgbGV0IG1heDtcbiAgbGV0IG1heEluZGV4ID0gLTE7XG4gIGxldCBpbmRleCA9IC0xO1xuICBpZiAodmFsdWVvZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgICsraW5kZXg7XG4gICAgICBpZiAodmFsdWUgIT0gbnVsbFxuICAgICAgICAgICYmIChtYXggPCB2YWx1ZSB8fCAobWF4ID09PSB1bmRlZmluZWQgJiYgdmFsdWUgPj0gdmFsdWUpKSkge1xuICAgICAgICBtYXggPSB2YWx1ZSwgbWF4SW5kZXggPSBpbmRleDtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZm9yIChsZXQgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICBpZiAoKHZhbHVlID0gdmFsdWVvZih2YWx1ZSwgKytpbmRleCwgdmFsdWVzKSkgIT0gbnVsbFxuICAgICAgICAgICYmIChtYXggPCB2YWx1ZSB8fCAobWF4ID09PSB1bmRlZmluZWQgJiYgdmFsdWUgPj0gdmFsdWUpKSkge1xuICAgICAgICBtYXggPSB2YWx1ZSwgbWF4SW5kZXggPSBpbmRleDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1heEluZGV4O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWluKHZhbHVlcywgdmFsdWVvZikge1xuICBsZXQgbWluO1xuICBpZiAodmFsdWVvZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICh2YWx1ZSAhPSBudWxsXG4gICAgICAgICAgJiYgKG1pbiA+IHZhbHVlIHx8IChtaW4gPT09IHVuZGVmaW5lZCAmJiB2YWx1ZSA+PSB2YWx1ZSkpKSB7XG4gICAgICAgIG1pbiA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsZXQgaW5kZXggPSAtMTtcbiAgICBmb3IgKGxldCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICgodmFsdWUgPSB2YWx1ZW9mKHZhbHVlLCArK2luZGV4LCB2YWx1ZXMpKSAhPSBudWxsXG4gICAgICAgICAgJiYgKG1pbiA+IHZhbHVlIHx8IChtaW4gPT09IHVuZGVmaW5lZCAmJiB2YWx1ZSA+PSB2YWx1ZSkpKSB7XG4gICAgICAgIG1pbiA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbWluO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWluSW5kZXgodmFsdWVzLCB2YWx1ZW9mKSB7XG4gIGxldCBtaW47XG4gIGxldCBtaW5JbmRleCA9IC0xO1xuICBsZXQgaW5kZXggPSAtMTtcbiAgaWYgKHZhbHVlb2YgPT09IHVuZGVmaW5lZCkge1xuICAgIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICArK2luZGV4O1xuICAgICAgaWYgKHZhbHVlICE9IG51bGxcbiAgICAgICAgICAmJiAobWluID4gdmFsdWUgfHwgKG1pbiA9PT0gdW5kZWZpbmVkICYmIHZhbHVlID49IHZhbHVlKSkpIHtcbiAgICAgICAgbWluID0gdmFsdWUsIG1pbkluZGV4ID0gaW5kZXg7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKCh2YWx1ZSA9IHZhbHVlb2YodmFsdWUsICsraW5kZXgsIHZhbHVlcykpICE9IG51bGxcbiAgICAgICAgICAmJiAobWluID4gdmFsdWUgfHwgKG1pbiA9PT0gdW5kZWZpbmVkICYmIHZhbHVlID49IHZhbHVlKSkpIHtcbiAgICAgICAgbWluID0gdmFsdWUsIG1pbkluZGV4ID0gaW5kZXg7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBtaW5JbmRleDtcbn1cbiIsImltcG9ydCB7YXNjZW5kaW5nRGVmaW5lZCwgY29tcGFyZURlZmluZWR9IGZyb20gXCIuL3NvcnQuanNcIjtcblxuLy8gQmFzZWQgb24gaHR0cHM6Ly9naXRodWIuY29tL21vdXJuZXIvcXVpY2tzZWxlY3Rcbi8vIElTQyBsaWNlbnNlLCBDb3B5cmlnaHQgMjAxOCBWbGFkaW1pciBBZ2Fmb25raW4uXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBxdWlja3NlbGVjdChhcnJheSwgaywgbGVmdCA9IDAsIHJpZ2h0ID0gSW5maW5pdHksIGNvbXBhcmUpIHtcbiAgayA9IE1hdGguZmxvb3Ioayk7XG4gIGxlZnQgPSBNYXRoLmZsb29yKE1hdGgubWF4KDAsIGxlZnQpKTtcbiAgcmlnaHQgPSBNYXRoLmZsb29yKE1hdGgubWluKGFycmF5Lmxlbmd0aCAtIDEsIHJpZ2h0KSk7XG5cbiAgaWYgKCEobGVmdCA8PSBrICYmIGsgPD0gcmlnaHQpKSByZXR1cm4gYXJyYXk7XG5cbiAgY29tcGFyZSA9IGNvbXBhcmUgPT09IHVuZGVmaW5lZCA/IGFzY2VuZGluZ0RlZmluZWQgOiBjb21wYXJlRGVmaW5lZChjb21wYXJlKTtcblxuICB3aGlsZSAocmlnaHQgPiBsZWZ0KSB7XG4gICAgaWYgKHJpZ2h0IC0gbGVmdCA+IDYwMCkge1xuICAgICAgY29uc3QgbiA9IHJpZ2h0IC0gbGVmdCArIDE7XG4gICAgICBjb25zdCBtID0gayAtIGxlZnQgKyAxO1xuICAgICAgY29uc3QgeiA9IE1hdGgubG9nKG4pO1xuICAgICAgY29uc3QgcyA9IDAuNSAqIE1hdGguZXhwKDIgKiB6IC8gMyk7XG4gICAgICBjb25zdCBzZCA9IDAuNSAqIE1hdGguc3FydCh6ICogcyAqIChuIC0gcykgLyBuKSAqIChtIC0gbiAvIDIgPCAwID8gLTEgOiAxKTtcbiAgICAgIGNvbnN0IG5ld0xlZnQgPSBNYXRoLm1heChsZWZ0LCBNYXRoLmZsb29yKGsgLSBtICogcyAvIG4gKyBzZCkpO1xuICAgICAgY29uc3QgbmV3UmlnaHQgPSBNYXRoLm1pbihyaWdodCwgTWF0aC5mbG9vcihrICsgKG4gLSBtKSAqIHMgLyBuICsgc2QpKTtcbiAgICAgIHF1aWNrc2VsZWN0KGFycmF5LCBrLCBuZXdMZWZ0LCBuZXdSaWdodCwgY29tcGFyZSk7XG4gICAgfVxuXG4gICAgY29uc3QgdCA9IGFycmF5W2tdO1xuICAgIGxldCBpID0gbGVmdDtcbiAgICBsZXQgaiA9IHJpZ2h0O1xuXG4gICAgc3dhcChhcnJheSwgbGVmdCwgayk7XG4gICAgaWYgKGNvbXBhcmUoYXJyYXlbcmlnaHRdLCB0KSA+IDApIHN3YXAoYXJyYXksIGxlZnQsIHJpZ2h0KTtcblxuICAgIHdoaWxlIChpIDwgaikge1xuICAgICAgc3dhcChhcnJheSwgaSwgaiksICsraSwgLS1qO1xuICAgICAgd2hpbGUgKGNvbXBhcmUoYXJyYXlbaV0sIHQpIDwgMCkgKytpO1xuICAgICAgd2hpbGUgKGNvbXBhcmUoYXJyYXlbal0sIHQpID4gMCkgLS1qO1xuICAgIH1cblxuICAgIGlmIChjb21wYXJlKGFycmF5W2xlZnRdLCB0KSA9PT0gMCkgc3dhcChhcnJheSwgbGVmdCwgaik7XG4gICAgZWxzZSArK2osIHN3YXAoYXJyYXksIGosIHJpZ2h0KTtcblxuICAgIGlmIChqIDw9IGspIGxlZnQgPSBqICsgMTtcbiAgICBpZiAoayA8PSBqKSByaWdodCA9IGogLSAxO1xuICB9XG5cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5mdW5jdGlvbiBzd2FwKGFycmF5LCBpLCBqKSB7XG4gIGNvbnN0IHQgPSBhcnJheVtpXTtcbiAgYXJyYXlbaV0gPSBhcnJheVtqXTtcbiAgYXJyYXlbal0gPSB0O1xufVxuIiwiaW1wb3J0IGFzY2VuZGluZyBmcm9tIFwiLi9hc2NlbmRpbmcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ3JlYXRlc3QodmFsdWVzLCBjb21wYXJlID0gYXNjZW5kaW5nKSB7XG4gIGxldCBtYXg7XG4gIGxldCBkZWZpbmVkID0gZmFsc2U7XG4gIGlmIChjb21wYXJlLmxlbmd0aCA9PT0gMSkge1xuICAgIGxldCBtYXhWYWx1ZTtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgdmFsdWVzKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGNvbXBhcmUoZWxlbWVudCk7XG4gICAgICBpZiAoZGVmaW5lZFxuICAgICAgICAgID8gYXNjZW5kaW5nKHZhbHVlLCBtYXhWYWx1ZSkgPiAwXG4gICAgICAgICAgOiBhc2NlbmRpbmcodmFsdWUsIHZhbHVlKSA9PT0gMCkge1xuICAgICAgICBtYXggPSBlbGVtZW50O1xuICAgICAgICBtYXhWYWx1ZSA9IHZhbHVlO1xuICAgICAgICBkZWZpbmVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmIChkZWZpbmVkXG4gICAgICAgICAgPyBjb21wYXJlKHZhbHVlLCBtYXgpID4gMFxuICAgICAgICAgIDogY29tcGFyZSh2YWx1ZSwgdmFsdWUpID09PSAwKSB7XG4gICAgICAgIG1heCA9IHZhbHVlO1xuICAgICAgICBkZWZpbmVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1heDtcbn1cbiIsImltcG9ydCBtYXggZnJvbSBcIi4vbWF4LmpzXCI7XG5pbXBvcnQgbWF4SW5kZXggZnJvbSBcIi4vbWF4SW5kZXguanNcIjtcbmltcG9ydCBtaW4gZnJvbSBcIi4vbWluLmpzXCI7XG5pbXBvcnQgbWluSW5kZXggZnJvbSBcIi4vbWluSW5kZXguanNcIjtcbmltcG9ydCBxdWlja3NlbGVjdCBmcm9tIFwiLi9xdWlja3NlbGVjdC5qc1wiO1xuaW1wb3J0IG51bWJlciwge251bWJlcnN9IGZyb20gXCIuL251bWJlci5qc1wiO1xuaW1wb3J0IHthc2NlbmRpbmdEZWZpbmVkfSBmcm9tIFwiLi9zb3J0LmpzXCI7XG5pbXBvcnQgZ3JlYXRlc3QgZnJvbSBcIi4vZ3JlYXRlc3QuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcXVhbnRpbGUodmFsdWVzLCBwLCB2YWx1ZW9mKSB7XG4gIHZhbHVlcyA9IEZsb2F0NjRBcnJheS5mcm9tKG51bWJlcnModmFsdWVzLCB2YWx1ZW9mKSk7XG4gIGlmICghKG4gPSB2YWx1ZXMubGVuZ3RoKSB8fCBpc05hTihwID0gK3ApKSByZXR1cm47XG4gIGlmIChwIDw9IDAgfHwgbiA8IDIpIHJldHVybiBtaW4odmFsdWVzKTtcbiAgaWYgKHAgPj0gMSkgcmV0dXJuIG1heCh2YWx1ZXMpO1xuICB2YXIgbixcbiAgICAgIGkgPSAobiAtIDEpICogcCxcbiAgICAgIGkwID0gTWF0aC5mbG9vcihpKSxcbiAgICAgIHZhbHVlMCA9IG1heChxdWlja3NlbGVjdCh2YWx1ZXMsIGkwKS5zdWJhcnJheSgwLCBpMCArIDEpKSxcbiAgICAgIHZhbHVlMSA9IG1pbih2YWx1ZXMuc3ViYXJyYXkoaTAgKyAxKSk7XG4gIHJldHVybiB2YWx1ZTAgKyAodmFsdWUxIC0gdmFsdWUwKSAqIChpIC0gaTApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVhbnRpbGVTb3J0ZWQodmFsdWVzLCBwLCB2YWx1ZW9mID0gbnVtYmVyKSB7XG4gIGlmICghKG4gPSB2YWx1ZXMubGVuZ3RoKSB8fCBpc05hTihwID0gK3ApKSByZXR1cm47XG4gIGlmIChwIDw9IDAgfHwgbiA8IDIpIHJldHVybiArdmFsdWVvZih2YWx1ZXNbMF0sIDAsIHZhbHVlcyk7XG4gIGlmIChwID49IDEpIHJldHVybiArdmFsdWVvZih2YWx1ZXNbbiAtIDFdLCBuIC0gMSwgdmFsdWVzKTtcbiAgdmFyIG4sXG4gICAgICBpID0gKG4gLSAxKSAqIHAsXG4gICAgICBpMCA9IE1hdGguZmxvb3IoaSksXG4gICAgICB2YWx1ZTAgPSArdmFsdWVvZih2YWx1ZXNbaTBdLCBpMCwgdmFsdWVzKSxcbiAgICAgIHZhbHVlMSA9ICt2YWx1ZW9mKHZhbHVlc1tpMCArIDFdLCBpMCArIDEsIHZhbHVlcyk7XG4gIHJldHVybiB2YWx1ZTAgKyAodmFsdWUxIC0gdmFsdWUwKSAqIChpIC0gaTApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVhbnRpbGVJbmRleCh2YWx1ZXMsIHAsIHZhbHVlb2YgPSBudW1iZXIpIHtcbiAgaWYgKGlzTmFOKHAgPSArcCkpIHJldHVybjtcbiAgbnVtYmVycyA9IEZsb2F0NjRBcnJheS5mcm9tKHZhbHVlcywgKF8sIGkpID0+IG51bWJlcih2YWx1ZW9mKHZhbHVlc1tpXSwgaSwgdmFsdWVzKSkpO1xuICBpZiAocCA8PSAwKSByZXR1cm4gbWluSW5kZXgobnVtYmVycyk7XG4gIGlmIChwID49IDEpIHJldHVybiBtYXhJbmRleChudW1iZXJzKTtcbiAgdmFyIG51bWJlcnMsXG4gICAgICBpbmRleCA9IFVpbnQzMkFycmF5LmZyb20odmFsdWVzLCAoXywgaSkgPT4gaSksXG4gICAgICBqID0gbnVtYmVycy5sZW5ndGggLSAxLFxuICAgICAgaSA9IE1hdGguZmxvb3IoaiAqIHApO1xuICBxdWlja3NlbGVjdChpbmRleCwgaSwgMCwgaiwgKGksIGopID0+IGFzY2VuZGluZ0RlZmluZWQobnVtYmVyc1tpXSwgbnVtYmVyc1tqXSkpO1xuICBpID0gZ3JlYXRlc3QoaW5kZXguc3ViYXJyYXkoMCwgaSArIDEpLCAoaSkgPT4gbnVtYmVyc1tpXSk7XG4gIHJldHVybiBpID49IDAgPyBpIDogLTE7XG59XG4iLCJpbXBvcnQgY291bnQgZnJvbSBcIi4uL2NvdW50LmpzXCI7XG5pbXBvcnQgcXVhbnRpbGUgZnJvbSBcIi4uL3F1YW50aWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRocmVzaG9sZEZyZWVkbWFuRGlhY29uaXModmFsdWVzLCBtaW4sIG1heCkge1xuICBjb25zdCBjID0gY291bnQodmFsdWVzKSwgZCA9IHF1YW50aWxlKHZhbHVlcywgMC43NSkgLSBxdWFudGlsZSh2YWx1ZXMsIDAuMjUpO1xuICByZXR1cm4gYyAmJiBkID8gTWF0aC5jZWlsKChtYXggLSBtaW4pIC8gKDIgKiBkICogTWF0aC5wb3coYywgLTEgLyAzKSkpIDogMTtcbn1cbiIsImltcG9ydCBjb3VudCBmcm9tIFwiLi4vY291bnQuanNcIjtcbmltcG9ydCBkZXZpYXRpb24gZnJvbSBcIi4uL2RldmlhdGlvbi5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0aHJlc2hvbGRTY290dCh2YWx1ZXMsIG1pbiwgbWF4KSB7XG4gIGNvbnN0IGMgPSBjb3VudCh2YWx1ZXMpLCBkID0gZGV2aWF0aW9uKHZhbHVlcyk7XG4gIHJldHVybiBjICYmIGQgPyBNYXRoLmNlaWwoKG1heCAtIG1pbikgKiBNYXRoLmNicnQoYykgLyAoMy40OSAqIGQpKSA6IDE7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtZWFuKHZhbHVlcywgdmFsdWVvZikge1xuICBsZXQgY291bnQgPSAwO1xuICBsZXQgc3VtID0gMDtcbiAgaWYgKHZhbHVlb2YgPT09IHVuZGVmaW5lZCkge1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHZhbHVlICE9IG51bGwgJiYgKHZhbHVlID0gK3ZhbHVlKSA+PSB2YWx1ZSkge1xuICAgICAgICArK2NvdW50LCBzdW0gKz0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxldCBpbmRleCA9IC0xO1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKCh2YWx1ZSA9IHZhbHVlb2YodmFsdWUsICsraW5kZXgsIHZhbHVlcykpICE9IG51bGwgJiYgKHZhbHVlID0gK3ZhbHVlKSA+PSB2YWx1ZSkge1xuICAgICAgICArK2NvdW50LCBzdW0gKz0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChjb3VudCkgcmV0dXJuIHN1bSAvIGNvdW50O1xufVxuIiwiaW1wb3J0IHF1YW50aWxlLCB7cXVhbnRpbGVJbmRleH0gZnJvbSBcIi4vcXVhbnRpbGUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWVkaWFuKHZhbHVlcywgdmFsdWVvZikge1xuICByZXR1cm4gcXVhbnRpbGUodmFsdWVzLCAwLjUsIHZhbHVlb2YpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVkaWFuSW5kZXgodmFsdWVzLCB2YWx1ZW9mKSB7XG4gIHJldHVybiBxdWFudGlsZUluZGV4KHZhbHVlcywgMC41LCB2YWx1ZW9mKTtcbn1cbiIsImZ1bmN0aW9uKiBmbGF0dGVuKGFycmF5cykge1xuICBmb3IgKGNvbnN0IGFycmF5IG9mIGFycmF5cykge1xuICAgIHlpZWxkKiBhcnJheTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtZXJnZShhcnJheXMpIHtcbiAgcmV0dXJuIEFycmF5LmZyb20oZmxhdHRlbihhcnJheXMpKTtcbn1cbiIsImltcG9ydCB7SW50ZXJuTWFwfSBmcm9tIFwiaW50ZXJubWFwXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1vZGUodmFsdWVzLCB2YWx1ZW9mKSB7XG4gIGNvbnN0IGNvdW50cyA9IG5ldyBJbnRlcm5NYXAoKTtcbiAgaWYgKHZhbHVlb2YgPT09IHVuZGVmaW5lZCkge1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHZhbHVlICE9IG51bGwgJiYgdmFsdWUgPj0gdmFsdWUpIHtcbiAgICAgICAgY291bnRzLnNldCh2YWx1ZSwgKGNvdW50cy5nZXQodmFsdWUpIHx8IDApICsgMSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxldCBpbmRleCA9IC0xO1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKCh2YWx1ZSA9IHZhbHVlb2YodmFsdWUsICsraW5kZXgsIHZhbHVlcykpICE9IG51bGwgJiYgdmFsdWUgPj0gdmFsdWUpIHtcbiAgICAgICAgY291bnRzLnNldCh2YWx1ZSwgKGNvdW50cy5nZXQodmFsdWUpIHx8IDApICsgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGxldCBtb2RlVmFsdWU7XG4gIGxldCBtb2RlQ291bnQgPSAwO1xuICBmb3IgKGNvbnN0IFt2YWx1ZSwgY291bnRdIG9mIGNvdW50cykge1xuICAgIGlmIChjb3VudCA+IG1vZGVDb3VudCkge1xuICAgICAgbW9kZUNvdW50ID0gY291bnQ7XG4gICAgICBtb2RlVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1vZGVWYWx1ZTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhaXJzKHZhbHVlcywgcGFpcm9mID0gcGFpcikge1xuICBjb25zdCBwYWlycyA9IFtdO1xuICBsZXQgcHJldmlvdXM7XG4gIGxldCBmaXJzdCA9IGZhbHNlO1xuICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgIGlmIChmaXJzdCkgcGFpcnMucHVzaChwYWlyb2YocHJldmlvdXMsIHZhbHVlKSk7XG4gICAgcHJldmlvdXMgPSB2YWx1ZTtcbiAgICBmaXJzdCA9IHRydWU7XG4gIH1cbiAgcmV0dXJuIHBhaXJzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFpcihhLCBiKSB7XG4gIHJldHVybiBbYSwgYl07XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByYW5nZShzdGFydCwgc3RvcCwgc3RlcCkge1xuICBzdGFydCA9ICtzdGFydCwgc3RvcCA9ICtzdG9wLCBzdGVwID0gKG4gPSBhcmd1bWVudHMubGVuZ3RoKSA8IDIgPyAoc3RvcCA9IHN0YXJ0LCBzdGFydCA9IDAsIDEpIDogbiA8IDMgPyAxIDogK3N0ZXA7XG5cbiAgdmFyIGkgPSAtMSxcbiAgICAgIG4gPSBNYXRoLm1heCgwLCBNYXRoLmNlaWwoKHN0b3AgLSBzdGFydCkgLyBzdGVwKSkgfCAwLFxuICAgICAgcmFuZ2UgPSBuZXcgQXJyYXkobik7XG5cbiAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICByYW5nZVtpXSA9IHN0YXJ0ICsgaSAqIHN0ZXA7XG4gIH1cblxuICByZXR1cm4gcmFuZ2U7XG59XG4iLCJpbXBvcnQgYXNjZW5kaW5nIGZyb20gXCIuL2FzY2VuZGluZy5qc1wiO1xuaW1wb3J0IHthc2NlbmRpbmdEZWZpbmVkLCBjb21wYXJlRGVmaW5lZH0gZnJvbSBcIi4vc29ydC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByYW5rKHZhbHVlcywgdmFsdWVvZiA9IGFzY2VuZGluZykge1xuICBpZiAodHlwZW9mIHZhbHVlc1tTeW1ib2wuaXRlcmF0b3JdICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJ2YWx1ZXMgaXMgbm90IGl0ZXJhYmxlXCIpO1xuICBsZXQgViA9IEFycmF5LmZyb20odmFsdWVzKTtcbiAgY29uc3QgUiA9IG5ldyBGbG9hdDY0QXJyYXkoVi5sZW5ndGgpO1xuICBpZiAodmFsdWVvZi5sZW5ndGggIT09IDIpIFYgPSBWLm1hcCh2YWx1ZW9mKSwgdmFsdWVvZiA9IGFzY2VuZGluZztcbiAgY29uc3QgY29tcGFyZUluZGV4ID0gKGksIGopID0+IHZhbHVlb2YoVltpXSwgVltqXSk7XG4gIGxldCBrLCByO1xuICB2YWx1ZXMgPSBVaW50MzJBcnJheS5mcm9tKFYsIChfLCBpKSA9PiBpKTtcbiAgLy8gUmlza3kgY2hhaW5pbmcgZHVlIHRvIFNhZmFyaSAxNCBodHRwczovL2dpdGh1Yi5jb20vZDMvZDMtYXJyYXkvaXNzdWVzLzEyM1xuICB2YWx1ZXMuc29ydCh2YWx1ZW9mID09PSBhc2NlbmRpbmcgPyAoaSwgaikgPT4gYXNjZW5kaW5nRGVmaW5lZChWW2ldLCBWW2pdKSA6IGNvbXBhcmVEZWZpbmVkKGNvbXBhcmVJbmRleCkpO1xuICB2YWx1ZXMuZm9yRWFjaCgoaiwgaSkgPT4ge1xuICAgICAgY29uc3QgYyA9IGNvbXBhcmVJbmRleChqLCBrID09PSB1bmRlZmluZWQgPyBqIDogayk7XG4gICAgICBpZiAoYyA+PSAwKSB7XG4gICAgICAgIGlmIChrID09PSB1bmRlZmluZWQgfHwgYyA+IDApIGsgPSBqLCByID0gaTtcbiAgICAgICAgUltqXSA9IHI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBSW2pdID0gTmFOO1xuICAgICAgfVxuICAgIH0pO1xuICByZXR1cm4gUjtcbn1cbiIsImltcG9ydCBhc2NlbmRpbmcgZnJvbSBcIi4vYXNjZW5kaW5nLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxlYXN0KHZhbHVlcywgY29tcGFyZSA9IGFzY2VuZGluZykge1xuICBsZXQgbWluO1xuICBsZXQgZGVmaW5lZCA9IGZhbHNlO1xuICBpZiAoY29tcGFyZS5sZW5ndGggPT09IDEpIHtcbiAgICBsZXQgbWluVmFsdWU7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHZhbHVlcykge1xuICAgICAgY29uc3QgdmFsdWUgPSBjb21wYXJlKGVsZW1lbnQpO1xuICAgICAgaWYgKGRlZmluZWRcbiAgICAgICAgICA/IGFzY2VuZGluZyh2YWx1ZSwgbWluVmFsdWUpIDwgMFxuICAgICAgICAgIDogYXNjZW5kaW5nKHZhbHVlLCB2YWx1ZSkgPT09IDApIHtcbiAgICAgICAgbWluID0gZWxlbWVudDtcbiAgICAgICAgbWluVmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgZGVmaW5lZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICBpZiAoZGVmaW5lZFxuICAgICAgICAgID8gY29tcGFyZSh2YWx1ZSwgbWluKSA8IDBcbiAgICAgICAgICA6IGNvbXBhcmUodmFsdWUsIHZhbHVlKSA9PT0gMCkge1xuICAgICAgICBtaW4gPSB2YWx1ZTtcbiAgICAgICAgZGVmaW5lZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBtaW47XG59XG4iLCJpbXBvcnQgYXNjZW5kaW5nIGZyb20gXCIuL2FzY2VuZGluZy5qc1wiO1xuaW1wb3J0IG1pbkluZGV4IGZyb20gXCIuL21pbkluZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxlYXN0SW5kZXgodmFsdWVzLCBjb21wYXJlID0gYXNjZW5kaW5nKSB7XG4gIGlmIChjb21wYXJlLmxlbmd0aCA9PT0gMSkgcmV0dXJuIG1pbkluZGV4KHZhbHVlcywgY29tcGFyZSk7XG4gIGxldCBtaW5WYWx1ZTtcbiAgbGV0IG1pbiA9IC0xO1xuICBsZXQgaW5kZXggPSAtMTtcbiAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICArK2luZGV4O1xuICAgIGlmIChtaW4gPCAwXG4gICAgICAgID8gY29tcGFyZSh2YWx1ZSwgdmFsdWUpID09PSAwXG4gICAgICAgIDogY29tcGFyZSh2YWx1ZSwgbWluVmFsdWUpIDwgMCkge1xuICAgICAgbWluVmFsdWUgPSB2YWx1ZTtcbiAgICAgIG1pbiA9IGluZGV4O1xuICAgIH1cbiAgfVxuICByZXR1cm4gbWluO1xufVxuIiwiaW1wb3J0IGFzY2VuZGluZyBmcm9tIFwiLi9hc2NlbmRpbmcuanNcIjtcbmltcG9ydCBtYXhJbmRleCBmcm9tIFwiLi9tYXhJbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBncmVhdGVzdEluZGV4KHZhbHVlcywgY29tcGFyZSA9IGFzY2VuZGluZykge1xuICBpZiAoY29tcGFyZS5sZW5ndGggPT09IDEpIHJldHVybiBtYXhJbmRleCh2YWx1ZXMsIGNvbXBhcmUpO1xuICBsZXQgbWF4VmFsdWU7XG4gIGxldCBtYXggPSAtMTtcbiAgbGV0IGluZGV4ID0gLTE7XG4gIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgKytpbmRleDtcbiAgICBpZiAobWF4IDwgMFxuICAgICAgICA/IGNvbXBhcmUodmFsdWUsIHZhbHVlKSA9PT0gMFxuICAgICAgICA6IGNvbXBhcmUodmFsdWUsIG1heFZhbHVlKSA+IDApIHtcbiAgICAgIG1heFZhbHVlID0gdmFsdWU7XG4gICAgICBtYXggPSBpbmRleDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1heDtcbn1cbiIsImltcG9ydCBsZWFzdEluZGV4IGZyb20gXCIuL2xlYXN0SW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc2Nhbih2YWx1ZXMsIGNvbXBhcmUpIHtcbiAgY29uc3QgaW5kZXggPSBsZWFzdEluZGV4KHZhbHVlcywgY29tcGFyZSk7XG4gIHJldHVybiBpbmRleCA8IDAgPyB1bmRlZmluZWQgOiBpbmRleDtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IHNodWZmbGVyKE1hdGgucmFuZG9tKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHNodWZmbGVyKHJhbmRvbSkge1xuICByZXR1cm4gZnVuY3Rpb24gc2h1ZmZsZShhcnJheSwgaTAgPSAwLCBpMSA9IGFycmF5Lmxlbmd0aCkge1xuICAgIGxldCBtID0gaTEgLSAoaTAgPSAraTApO1xuICAgIHdoaWxlIChtKSB7XG4gICAgICBjb25zdCBpID0gcmFuZG9tKCkgKiBtLS0gfCAwLCB0ID0gYXJyYXlbbSArIGkwXTtcbiAgICAgIGFycmF5W20gKyBpMF0gPSBhcnJheVtpICsgaTBdO1xuICAgICAgYXJyYXlbaSArIGkwXSA9IHQ7XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbiAgfTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHN1bSh2YWx1ZXMsIHZhbHVlb2YpIHtcbiAgbGV0IHN1bSA9IDA7XG4gIGlmICh2YWx1ZW9mID09PSB1bmRlZmluZWQpIHtcbiAgICBmb3IgKGxldCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICh2YWx1ZSA9ICt2YWx1ZSkge1xuICAgICAgICBzdW0gKz0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxldCBpbmRleCA9IC0xO1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHZhbHVlID0gK3ZhbHVlb2YodmFsdWUsICsraW5kZXgsIHZhbHVlcykpIHtcbiAgICAgICAgc3VtICs9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gc3VtO1xufVxuIiwiaW1wb3J0IG1pbiBmcm9tIFwiLi9taW4uanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNwb3NlKG1hdHJpeCkge1xuICBpZiAoIShuID0gbWF0cml4Lmxlbmd0aCkpIHJldHVybiBbXTtcbiAgZm9yICh2YXIgaSA9IC0xLCBtID0gbWluKG1hdHJpeCwgbGVuZ3RoKSwgdHJhbnNwb3NlID0gbmV3IEFycmF5KG0pOyArK2kgPCBtOykge1xuICAgIGZvciAodmFyIGogPSAtMSwgbiwgcm93ID0gdHJhbnNwb3NlW2ldID0gbmV3IEFycmF5KG4pOyArK2ogPCBuOykge1xuICAgICAgcm93W2pdID0gbWF0cml4W2pdW2ldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJhbnNwb3NlO1xufVxuXG5mdW5jdGlvbiBsZW5ndGgoZCkge1xuICByZXR1cm4gZC5sZW5ndGg7XG59XG4iLCJpbXBvcnQgdHJhbnNwb3NlIGZyb20gXCIuL3RyYW5zcG9zZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB6aXAoKSB7XG4gIHJldHVybiB0cmFuc3Bvc2UoYXJndW1lbnRzKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGV2ZXJ5KHZhbHVlcywgdGVzdCkge1xuICBpZiAodHlwZW9mIHRlc3QgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcInRlc3QgaXMgbm90IGEgZnVuY3Rpb25cIik7XG4gIGxldCBpbmRleCA9IC0xO1xuICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgIGlmICghdGVzdCh2YWx1ZSwgKytpbmRleCwgdmFsdWVzKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNvbWUodmFsdWVzLCB0ZXN0KSB7XG4gIGlmICh0eXBlb2YgdGVzdCAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwidGVzdCBpcyBub3QgYSBmdW5jdGlvblwiKTtcbiAgbGV0IGluZGV4ID0gLTE7XG4gIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgaWYgKHRlc3QodmFsdWUsICsraW5kZXgsIHZhbHVlcykpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmaWx0ZXIodmFsdWVzLCB0ZXN0KSB7XG4gIGlmICh0eXBlb2YgdGVzdCAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwidGVzdCBpcyBub3QgYSBmdW5jdGlvblwiKTtcbiAgY29uc3QgYXJyYXkgPSBbXTtcbiAgbGV0IGluZGV4ID0gLTE7XG4gIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgaWYgKHRlc3QodmFsdWUsICsraW5kZXgsIHZhbHVlcykpIHtcbiAgICAgIGFycmF5LnB1c2godmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtYXAodmFsdWVzLCBtYXBwZXIpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZXNbU3ltYm9sLml0ZXJhdG9yXSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwidmFsdWVzIGlzIG5vdCBpdGVyYWJsZVwiKTtcbiAgaWYgKHR5cGVvZiBtYXBwZXIgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIm1hcHBlciBpcyBub3QgYSBmdW5jdGlvblwiKTtcbiAgcmV0dXJuIEFycmF5LmZyb20odmFsdWVzLCAodmFsdWUsIGluZGV4KSA9PiBtYXBwZXIodmFsdWUsIGluZGV4LCB2YWx1ZXMpKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlZHVjZSh2YWx1ZXMsIHJlZHVjZXIsIHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgcmVkdWNlciAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwicmVkdWNlciBpcyBub3QgYSBmdW5jdGlvblwiKTtcbiAgY29uc3QgaXRlcmF0b3IgPSB2YWx1ZXNbU3ltYm9sLml0ZXJhdG9yXSgpO1xuICBsZXQgZG9uZSwgbmV4dCwgaW5kZXggPSAtMTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7XG4gICAgKHtkb25lLCB2YWx1ZX0gPSBpdGVyYXRvci5uZXh0KCkpO1xuICAgIGlmIChkb25lKSByZXR1cm47XG4gICAgKytpbmRleDtcbiAgfVxuICB3aGlsZSAoKHtkb25lLCB2YWx1ZTogbmV4dH0gPSBpdGVyYXRvci5uZXh0KCkpLCAhZG9uZSkge1xuICAgIHZhbHVlID0gcmVkdWNlcih2YWx1ZSwgbmV4dCwgKytpbmRleCwgdmFsdWVzKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZXZlcnNlKHZhbHVlcykge1xuICBpZiAodHlwZW9mIHZhbHVlc1tTeW1ib2wuaXRlcmF0b3JdICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJ2YWx1ZXMgaXMgbm90IGl0ZXJhYmxlXCIpO1xuICByZXR1cm4gQXJyYXkuZnJvbSh2YWx1ZXMpLnJldmVyc2UoKTtcbn1cbiIsImltcG9ydCB7SW50ZXJuU2V0fSBmcm9tIFwiaW50ZXJubWFwXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRpZmZlcmVuY2UodmFsdWVzLCAuLi5vdGhlcnMpIHtcbiAgdmFsdWVzID0gbmV3IEludGVyblNldCh2YWx1ZXMpO1xuICBmb3IgKGNvbnN0IG90aGVyIG9mIG90aGVycykge1xuICAgIGZvciAoY29uc3QgdmFsdWUgb2Ygb3RoZXIpIHtcbiAgICAgIHZhbHVlcy5kZWxldGUodmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsdWVzO1xufVxuIiwiaW1wb3J0IHtJbnRlcm5TZXR9IGZyb20gXCJpbnRlcm5tYXBcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGlzam9pbnQodmFsdWVzLCBvdGhlcikge1xuICBjb25zdCBpdGVyYXRvciA9IG90aGVyW1N5bWJvbC5pdGVyYXRvcl0oKSwgc2V0ID0gbmV3IEludGVyblNldCgpO1xuICBmb3IgKGNvbnN0IHYgb2YgdmFsdWVzKSB7XG4gICAgaWYgKHNldC5oYXModikpIHJldHVybiBmYWxzZTtcbiAgICBsZXQgdmFsdWUsIGRvbmU7XG4gICAgd2hpbGUgKCh7dmFsdWUsIGRvbmV9ID0gaXRlcmF0b3IubmV4dCgpKSkge1xuICAgICAgaWYgKGRvbmUpIGJyZWFrO1xuICAgICAgaWYgKE9iamVjdC5pcyh2LCB2YWx1ZSkpIHJldHVybiBmYWxzZTtcbiAgICAgIHNldC5hZGQodmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbiIsImltcG9ydCB7SW50ZXJuU2V0fSBmcm9tIFwiaW50ZXJubWFwXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGludGVyc2VjdGlvbih2YWx1ZXMsIC4uLm90aGVycykge1xuICB2YWx1ZXMgPSBuZXcgSW50ZXJuU2V0KHZhbHVlcyk7XG4gIG90aGVycyA9IG90aGVycy5tYXAoc2V0KTtcbiAgb3V0OiBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgIGZvciAoY29uc3Qgb3RoZXIgb2Ygb3RoZXJzKSB7XG4gICAgICBpZiAoIW90aGVyLmhhcyh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWVzLmRlbGV0ZSh2YWx1ZSk7XG4gICAgICAgIGNvbnRpbnVlIG91dDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbHVlcztcbn1cblxuZnVuY3Rpb24gc2V0KHZhbHVlcykge1xuICByZXR1cm4gdmFsdWVzIGluc3RhbmNlb2YgSW50ZXJuU2V0ID8gdmFsdWVzIDogbmV3IEludGVyblNldCh2YWx1ZXMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3VwZXJzZXQodmFsdWVzLCBvdGhlcikge1xuICBjb25zdCBpdGVyYXRvciA9IHZhbHVlc1tTeW1ib2wuaXRlcmF0b3JdKCksIHNldCA9IG5ldyBTZXQoKTtcbiAgZm9yIChjb25zdCBvIG9mIG90aGVyKSB7XG4gICAgY29uc3QgaW8gPSBpbnRlcm4obyk7XG4gICAgaWYgKHNldC5oYXMoaW8pKSBjb250aW51ZTtcbiAgICBsZXQgdmFsdWUsIGRvbmU7XG4gICAgd2hpbGUgKCh7dmFsdWUsIGRvbmV9ID0gaXRlcmF0b3IubmV4dCgpKSkge1xuICAgICAgaWYgKGRvbmUpIHJldHVybiBmYWxzZTtcbiAgICAgIGNvbnN0IGl2YWx1ZSA9IGludGVybih2YWx1ZSk7XG4gICAgICBzZXQuYWRkKGl2YWx1ZSk7XG4gICAgICBpZiAoT2JqZWN0LmlzKGlvLCBpdmFsdWUpKSBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGludGVybih2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiID8gdmFsdWUudmFsdWVPZigpIDogdmFsdWU7XG59XG4iLCJpbXBvcnQgc3VwZXJzZXQgZnJvbSBcIi4vc3VwZXJzZXQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3Vic2V0KHZhbHVlcywgb3RoZXIpIHtcbiAgcmV0dXJuIHN1cGVyc2V0KG90aGVyLCB2YWx1ZXMpO1xufVxuIiwiaW1wb3J0IHtJbnRlcm5TZXR9IGZyb20gXCJpbnRlcm5tYXBcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdW5pb24oLi4ub3RoZXJzKSB7XG4gIGNvbnN0IHNldCA9IG5ldyBJbnRlcm5TZXQoKTtcbiAgZm9yIChjb25zdCBvdGhlciBvZiBvdGhlcnMpIHtcbiAgICBmb3IgKGNvbnN0IG8gb2Ygb3RoZXIpIHtcbiAgICAgIHNldC5hZGQobyk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzZXQ7XG59XG4iLCJleHBvcnQge2RlZmF1bHQgYXMgYmlzZWN0LCBiaXNlY3RSaWdodCwgYmlzZWN0TGVmdCwgYmlzZWN0Q2VudGVyfSBmcm9tIFwiLi9iaXNlY3QuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBhc2NlbmRpbmd9IGZyb20gXCIuL2FzY2VuZGluZy5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGJpc2VjdG9yfSBmcm9tIFwiLi9iaXNlY3Rvci5qc1wiO1xuZXhwb3J0IHtibHVyLCBibHVyMiwgYmx1ckltYWdlfSBmcm9tIFwiLi9ibHVyLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgY291bnR9IGZyb20gXCIuL2NvdW50LmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgY3Jvc3N9IGZyb20gXCIuL2Nyb3NzLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgY3Vtc3VtfSBmcm9tIFwiLi9jdW1zdW0uanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBkZXNjZW5kaW5nfSBmcm9tIFwiLi9kZXNjZW5kaW5nLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgZGV2aWF0aW9ufSBmcm9tIFwiLi9kZXZpYXRpb24uanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBleHRlbnR9IGZyb20gXCIuL2V4dGVudC5qc1wiO1xuZXhwb3J0IHtBZGRlciwgZnN1bSwgZmN1bXN1bX0gZnJvbSBcIi4vZnN1bS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGdyb3VwLCBmbGF0R3JvdXAsIGZsYXRSb2xsdXAsIGdyb3VwcywgaW5kZXgsIGluZGV4ZXMsIHJvbGx1cCwgcm9sbHVwc30gZnJvbSBcIi4vZ3JvdXAuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBncm91cFNvcnR9IGZyb20gXCIuL2dyb3VwU29ydC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGJpbiwgZGVmYXVsdCBhcyBoaXN0b2dyYW19IGZyb20gXCIuL2Jpbi5qc1wiOyAvLyBEZXByZWNhdGVkOyB1c2UgYmluLlxuZXhwb3J0IHtkZWZhdWx0IGFzIHRocmVzaG9sZEZyZWVkbWFuRGlhY29uaXN9IGZyb20gXCIuL3RocmVzaG9sZC9mcmVlZG1hbkRpYWNvbmlzLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgdGhyZXNob2xkU2NvdHR9IGZyb20gXCIuL3RocmVzaG9sZC9zY290dC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHRocmVzaG9sZFN0dXJnZXN9IGZyb20gXCIuL3RocmVzaG9sZC9zdHVyZ2VzLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgbWF4fSBmcm9tIFwiLi9tYXguanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBtYXhJbmRleH0gZnJvbSBcIi4vbWF4SW5kZXguanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBtZWFufSBmcm9tIFwiLi9tZWFuLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgbWVkaWFuLCBtZWRpYW5JbmRleH0gZnJvbSBcIi4vbWVkaWFuLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgbWVyZ2V9IGZyb20gXCIuL21lcmdlLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgbWlufSBmcm9tIFwiLi9taW4uanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBtaW5JbmRleH0gZnJvbSBcIi4vbWluSW5kZXguanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBtb2RlfSBmcm9tIFwiLi9tb2RlLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgbmljZX0gZnJvbSBcIi4vbmljZS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHBhaXJzfSBmcm9tIFwiLi9wYWlycy5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHBlcm11dGV9IGZyb20gXCIuL3Blcm11dGUuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBxdWFudGlsZSwgcXVhbnRpbGVJbmRleCwgcXVhbnRpbGVTb3J0ZWR9IGZyb20gXCIuL3F1YW50aWxlLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgcXVpY2tzZWxlY3R9IGZyb20gXCIuL3F1aWNrc2VsZWN0LmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgcmFuZ2V9IGZyb20gXCIuL3JhbmdlLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgcmFua30gZnJvbSBcIi4vcmFuay5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGxlYXN0fSBmcm9tIFwiLi9sZWFzdC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGxlYXN0SW5kZXh9IGZyb20gXCIuL2xlYXN0SW5kZXguanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBncmVhdGVzdH0gZnJvbSBcIi4vZ3JlYXRlc3QuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBncmVhdGVzdEluZGV4fSBmcm9tIFwiLi9ncmVhdGVzdEluZGV4LmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgc2Nhbn0gZnJvbSBcIi4vc2Nhbi5qc1wiOyAvLyBEZXByZWNhdGVkOyB1c2UgbGVhc3RJbmRleC5cbmV4cG9ydCB7ZGVmYXVsdCBhcyBzaHVmZmxlLCBzaHVmZmxlcn0gZnJvbSBcIi4vc2h1ZmZsZS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHN1bX0gZnJvbSBcIi4vc3VtLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgdGlja3MsIHRpY2tJbmNyZW1lbnQsIHRpY2tTdGVwfSBmcm9tIFwiLi90aWNrcy5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHRyYW5zcG9zZX0gZnJvbSBcIi4vdHJhbnNwb3NlLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgdmFyaWFuY2V9IGZyb20gXCIuL3ZhcmlhbmNlLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgemlwfSBmcm9tIFwiLi96aXAuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBldmVyeX0gZnJvbSBcIi4vZXZlcnkuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBzb21lfSBmcm9tIFwiLi9zb21lLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgZmlsdGVyfSBmcm9tIFwiLi9maWx0ZXIuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBtYXB9IGZyb20gXCIuL21hcC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHJlZHVjZX0gZnJvbSBcIi4vcmVkdWNlLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgcmV2ZXJzZX0gZnJvbSBcIi4vcmV2ZXJzZS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHNvcnR9IGZyb20gXCIuL3NvcnQuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBkaWZmZXJlbmNlfSBmcm9tIFwiLi9kaWZmZXJlbmNlLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgZGlzam9pbnR9IGZyb20gXCIuL2Rpc2pvaW50LmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgaW50ZXJzZWN0aW9ufSBmcm9tIFwiLi9pbnRlcnNlY3Rpb24uanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBzdWJzZXR9IGZyb20gXCIuL3N1YnNldC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHN1cGVyc2V0fSBmcm9tIFwiLi9zdXBlcnNldC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHVuaW9ufSBmcm9tIFwiLi91bmlvbi5qc1wiO1xuZXhwb3J0IHtJbnRlcm5NYXAsIEludGVyblNldH0gZnJvbSBcImludGVybm1hcFwiO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0ge307XG4gIH1cbiAgaWYgKCF1cmwpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG4gIHVybCA9IFN0cmluZyh1cmwuX19lc01vZHVsZSA/IHVybC5kZWZhdWx0IDogdXJsKTtcblxuICAvLyBJZiB1cmwgaXMgYWxyZWFkeSB3cmFwcGVkIGluIHF1b3RlcywgcmVtb3ZlIHRoZW1cbiAgaWYgKC9eWydcIl0uKlsnXCJdJC8udGVzdCh1cmwpKSB7XG4gICAgdXJsID0gdXJsLnNsaWNlKDEsIC0xKTtcbiAgfVxuICBpZiAob3B0aW9ucy5oYXNoKSB7XG4gICAgdXJsICs9IG9wdGlvbnMuaGFzaDtcbiAgfVxuXG4gIC8vIFNob3VsZCB1cmwgYmUgd3JhcHBlZD9cbiAgLy8gU2VlIGh0dHBzOi8vZHJhZnRzLmNzc3dnLm9yZy9jc3MtdmFsdWVzLTMvI3VybHNcbiAgaWYgKC9bXCInKCkgXFx0XFxuXXwoJTIwKS8udGVzdCh1cmwpIHx8IG9wdGlvbnMubmVlZFF1b3Rlcykge1xuICAgIHJldHVybiBcIlxcXCJcIi5jb25jYXQodXJsLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKS5yZXBsYWNlKC9cXG4vZywgXCJcXFxcblwiKSwgXCJcXFwiXCIpO1xuICB9XG4gIHJldHVybiB1cmw7XG59OyIsInZhciBhcnJheSA9IEFycmF5LnByb3RvdHlwZTtcblxuZXhwb3J0IHZhciBzbGljZSA9IGFycmF5LnNsaWNlO1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gYSAtIGI7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihyaW5nKSB7XG4gIHZhciBpID0gMCwgbiA9IHJpbmcubGVuZ3RoLCBhcmVhID0gcmluZ1tuIC0gMV1bMV0gKiByaW5nWzBdWzBdIC0gcmluZ1tuIC0gMV1bMF0gKiByaW5nWzBdWzFdO1xuICB3aGlsZSAoKytpIDwgbikgYXJlYSArPSByaW5nW2kgLSAxXVsxXSAqIHJpbmdbaV1bMF0gLSByaW5nW2kgLSAxXVswXSAqIHJpbmdbaV1bMV07XG4gIHJldHVybiBhcmVhO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgeCA9PiAoKSA9PiB4O1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocmluZywgaG9sZSkge1xuICB2YXIgaSA9IC0xLCBuID0gaG9sZS5sZW5ndGgsIGM7XG4gIHdoaWxlICgrK2kgPCBuKSBpZiAoYyA9IHJpbmdDb250YWlucyhyaW5nLCBob2xlW2ldKSkgcmV0dXJuIGM7XG4gIHJldHVybiAwO1xufVxuXG5mdW5jdGlvbiByaW5nQ29udGFpbnMocmluZywgcG9pbnQpIHtcbiAgdmFyIHggPSBwb2ludFswXSwgeSA9IHBvaW50WzFdLCBjb250YWlucyA9IC0xO1xuICBmb3IgKHZhciBpID0gMCwgbiA9IHJpbmcubGVuZ3RoLCBqID0gbiAtIDE7IGkgPCBuOyBqID0gaSsrKSB7XG4gICAgdmFyIHBpID0gcmluZ1tpXSwgeGkgPSBwaVswXSwgeWkgPSBwaVsxXSwgcGogPSByaW5nW2pdLCB4aiA9IHBqWzBdLCB5aiA9IHBqWzFdO1xuICAgIGlmIChzZWdtZW50Q29udGFpbnMocGksIHBqLCBwb2ludCkpIHJldHVybiAwO1xuICAgIGlmICgoKHlpID4geSkgIT09ICh5aiA+IHkpKSAmJiAoKHggPCAoeGogLSB4aSkgKiAoeSAtIHlpKSAvICh5aiAtIHlpKSArIHhpKSkpIGNvbnRhaW5zID0gLWNvbnRhaW5zO1xuICB9XG4gIHJldHVybiBjb250YWlucztcbn1cblxuZnVuY3Rpb24gc2VnbWVudENvbnRhaW5zKGEsIGIsIGMpIHtcbiAgdmFyIGk7IHJldHVybiBjb2xsaW5lYXIoYSwgYiwgYykgJiYgd2l0aGluKGFbaSA9ICsoYVswXSA9PT0gYlswXSldLCBjW2ldLCBiW2ldKTtcbn1cblxuZnVuY3Rpb24gY29sbGluZWFyKGEsIGIsIGMpIHtcbiAgcmV0dXJuIChiWzBdIC0gYVswXSkgKiAoY1sxXSAtIGFbMV0pID09PSAoY1swXSAtIGFbMF0pICogKGJbMV0gLSBhWzFdKTtcbn1cblxuZnVuY3Rpb24gd2l0aGluKHAsIHEsIHIpIHtcbiAgcmV0dXJuIHAgPD0gcSAmJiBxIDw9IHIgfHwgciA8PSBxICYmIHEgPD0gcDtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge31cbiIsImltcG9ydCB7ZXh0ZW50LCBuaWNlLCB0aHJlc2hvbGRTdHVyZ2VzLCB0aWNrc30gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge3NsaWNlfSBmcm9tIFwiLi9hcnJheS5qc1wiO1xuaW1wb3J0IGFzY2VuZGluZyBmcm9tIFwiLi9hc2NlbmRpbmcuanNcIjtcbmltcG9ydCBhcmVhIGZyb20gXCIuL2FyZWEuanNcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuaW1wb3J0IGNvbnRhaW5zIGZyb20gXCIuL2NvbnRhaW5zLmpzXCI7XG5pbXBvcnQgbm9vcCBmcm9tIFwiLi9ub29wLmpzXCI7XG5cbnZhciBjYXNlcyA9IFtcbiAgW10sXG4gIFtbWzEuMCwgMS41XSwgWzAuNSwgMS4wXV1dLFxuICBbW1sxLjUsIDEuMF0sIFsxLjAsIDEuNV1dXSxcbiAgW1tbMS41LCAxLjBdLCBbMC41LCAxLjBdXV0sXG4gIFtbWzEuMCwgMC41XSwgWzEuNSwgMS4wXV1dLFxuICBbW1sxLjAsIDEuNV0sIFswLjUsIDEuMF1dLCBbWzEuMCwgMC41XSwgWzEuNSwgMS4wXV1dLFxuICBbW1sxLjAsIDAuNV0sIFsxLjAsIDEuNV1dXSxcbiAgW1tbMS4wLCAwLjVdLCBbMC41LCAxLjBdXV0sXG4gIFtbWzAuNSwgMS4wXSwgWzEuMCwgMC41XV1dLFxuICBbW1sxLjAsIDEuNV0sIFsxLjAsIDAuNV1dXSxcbiAgW1tbMC41LCAxLjBdLCBbMS4wLCAwLjVdXSwgW1sxLjUsIDEuMF0sIFsxLjAsIDEuNV1dXSxcbiAgW1tbMS41LCAxLjBdLCBbMS4wLCAwLjVdXV0sXG4gIFtbWzAuNSwgMS4wXSwgWzEuNSwgMS4wXV1dLFxuICBbW1sxLjAsIDEuNV0sIFsxLjUsIDEuMF1dXSxcbiAgW1tbMC41LCAxLjBdLCBbMS4wLCAxLjVdXV0sXG4gIFtdXG5dO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIGR4ID0gMSxcbiAgICAgIGR5ID0gMSxcbiAgICAgIHRocmVzaG9sZCA9IHRocmVzaG9sZFN0dXJnZXMsXG4gICAgICBzbW9vdGggPSBzbW9vdGhMaW5lYXI7XG5cbiAgZnVuY3Rpb24gY29udG91cnModmFsdWVzKSB7XG4gICAgdmFyIHR6ID0gdGhyZXNob2xkKHZhbHVlcyk7XG5cbiAgICAvLyBDb252ZXJ0IG51bWJlciBvZiB0aHJlc2hvbGRzIGludG8gdW5pZm9ybSB0aHJlc2hvbGRzLlxuICAgIGlmICghQXJyYXkuaXNBcnJheSh0eikpIHtcbiAgICAgIGNvbnN0IGUgPSBleHRlbnQodmFsdWVzLCBmaW5pdGUpO1xuICAgICAgdHogPSB0aWNrcyguLi5uaWNlKGVbMF0sIGVbMV0sIHR6KSwgdHopO1xuICAgICAgd2hpbGUgKHR6W3R6Lmxlbmd0aCAtIDFdID49IGVbMV0pIHR6LnBvcCgpO1xuICAgICAgd2hpbGUgKHR6WzFdIDwgZVswXSkgdHouc2hpZnQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHogPSB0ei5zbGljZSgpLnNvcnQoYXNjZW5kaW5nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHoubWFwKHZhbHVlID0+IGNvbnRvdXIodmFsdWVzLCB2YWx1ZSkpO1xuICB9XG5cbiAgLy8gQWNjdW11bGF0ZSwgc21vb3RoIGNvbnRvdXIgcmluZ3MsIGFzc2lnbiBob2xlcyB0byBleHRlcmlvciByaW5ncy5cbiAgLy8gQmFzZWQgb24gaHR0cHM6Ly9naXRodWIuY29tL21ib3N0b2NrL3NoYXBlZmlsZS9ibG9iL3YwLjYuMi9zaHAvcG9seWdvbi5qc1xuICBmdW5jdGlvbiBjb250b3VyKHZhbHVlcywgdmFsdWUpIHtcbiAgICBjb25zdCB2ID0gdmFsdWUgPT0gbnVsbCA/IE5hTiA6ICt2YWx1ZTtcbiAgICBpZiAoaXNOYU4odikpIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCB2YWx1ZTogJHt2YWx1ZX1gKTtcblxuICAgIHZhciBwb2x5Z29ucyA9IFtdLFxuICAgICAgICBob2xlcyA9IFtdO1xuXG4gICAgaXNvcmluZ3ModmFsdWVzLCB2LCBmdW5jdGlvbihyaW5nKSB7XG4gICAgICBzbW9vdGgocmluZywgdmFsdWVzLCB2KTtcbiAgICAgIGlmIChhcmVhKHJpbmcpID4gMCkgcG9seWdvbnMucHVzaChbcmluZ10pO1xuICAgICAgZWxzZSBob2xlcy5wdXNoKHJpbmcpO1xuICAgIH0pO1xuXG4gICAgaG9sZXMuZm9yRWFjaChmdW5jdGlvbihob2xlKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbiA9IHBvbHlnb25zLmxlbmd0aCwgcG9seWdvbjsgaSA8IG47ICsraSkge1xuICAgICAgICBpZiAoY29udGFpbnMoKHBvbHlnb24gPSBwb2x5Z29uc1tpXSlbMF0sIGhvbGUpICE9PSAtMSkge1xuICAgICAgICAgIHBvbHlnb24ucHVzaChob2xlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBcIk11bHRpUG9seWdvblwiLFxuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgY29vcmRpbmF0ZXM6IHBvbHlnb25zXG4gICAgfTtcbiAgfVxuXG4gIC8vIE1hcmNoaW5nIHNxdWFyZXMgd2l0aCBpc29saW5lcyBzdGl0Y2hlZCBpbnRvIHJpbmdzLlxuICAvLyBCYXNlZCBvbiBodHRwczovL2dpdGh1Yi5jb20vdG9wb2pzb24vdG9wb2pzb24tY2xpZW50L2Jsb2IvdjMuMC4wL3NyYy9zdGl0Y2guanNcbiAgZnVuY3Rpb24gaXNvcmluZ3ModmFsdWVzLCB2YWx1ZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgZnJhZ21lbnRCeVN0YXJ0ID0gbmV3IEFycmF5LFxuICAgICAgICBmcmFnbWVudEJ5RW5kID0gbmV3IEFycmF5LFxuICAgICAgICB4LCB5LCB0MCwgdDEsIHQyLCB0MztcblxuICAgIC8vIFNwZWNpYWwgY2FzZSBmb3IgdGhlIGZpcnN0IHJvdyAoeSA9IC0xLCB0MiA9IHQzID0gMCkuXG4gICAgeCA9IHkgPSAtMTtcbiAgICB0MSA9IGFib3ZlKHZhbHVlc1swXSwgdmFsdWUpO1xuICAgIGNhc2VzW3QxIDw8IDFdLmZvckVhY2goc3RpdGNoKTtcbiAgICB3aGlsZSAoKyt4IDwgZHggLSAxKSB7XG4gICAgICB0MCA9IHQxLCB0MSA9IGFib3ZlKHZhbHVlc1t4ICsgMV0sIHZhbHVlKTtcbiAgICAgIGNhc2VzW3QwIHwgdDEgPDwgMV0uZm9yRWFjaChzdGl0Y2gpO1xuICAgIH1cbiAgICBjYXNlc1t0MSA8PCAwXS5mb3JFYWNoKHN0aXRjaCk7XG5cbiAgICAvLyBHZW5lcmFsIGNhc2UgZm9yIHRoZSBpbnRlcm1lZGlhdGUgcm93cy5cbiAgICB3aGlsZSAoKyt5IDwgZHkgLSAxKSB7XG4gICAgICB4ID0gLTE7XG4gICAgICB0MSA9IGFib3ZlKHZhbHVlc1t5ICogZHggKyBkeF0sIHZhbHVlKTtcbiAgICAgIHQyID0gYWJvdmUodmFsdWVzW3kgKiBkeF0sIHZhbHVlKTtcbiAgICAgIGNhc2VzW3QxIDw8IDEgfCB0MiA8PCAyXS5mb3JFYWNoKHN0aXRjaCk7XG4gICAgICB3aGlsZSAoKyt4IDwgZHggLSAxKSB7XG4gICAgICAgIHQwID0gdDEsIHQxID0gYWJvdmUodmFsdWVzW3kgKiBkeCArIGR4ICsgeCArIDFdLCB2YWx1ZSk7XG4gICAgICAgIHQzID0gdDIsIHQyID0gYWJvdmUodmFsdWVzW3kgKiBkeCArIHggKyAxXSwgdmFsdWUpO1xuICAgICAgICBjYXNlc1t0MCB8IHQxIDw8IDEgfCB0MiA8PCAyIHwgdDMgPDwgM10uZm9yRWFjaChzdGl0Y2gpO1xuICAgICAgfVxuICAgICAgY2FzZXNbdDEgfCB0MiA8PCAzXS5mb3JFYWNoKHN0aXRjaCk7XG4gICAgfVxuXG4gICAgLy8gU3BlY2lhbCBjYXNlIGZvciB0aGUgbGFzdCByb3cgKHkgPSBkeSAtIDEsIHQwID0gdDEgPSAwKS5cbiAgICB4ID0gLTE7XG4gICAgdDIgPSB2YWx1ZXNbeSAqIGR4XSA+PSB2YWx1ZTtcbiAgICBjYXNlc1t0MiA8PCAyXS5mb3JFYWNoKHN0aXRjaCk7XG4gICAgd2hpbGUgKCsreCA8IGR4IC0gMSkge1xuICAgICAgdDMgPSB0MiwgdDIgPSBhYm92ZSh2YWx1ZXNbeSAqIGR4ICsgeCArIDFdLCB2YWx1ZSk7XG4gICAgICBjYXNlc1t0MiA8PCAyIHwgdDMgPDwgM10uZm9yRWFjaChzdGl0Y2gpO1xuICAgIH1cbiAgICBjYXNlc1t0MiA8PCAzXS5mb3JFYWNoKHN0aXRjaCk7XG5cbiAgICBmdW5jdGlvbiBzdGl0Y2gobGluZSkge1xuICAgICAgdmFyIHN0YXJ0ID0gW2xpbmVbMF1bMF0gKyB4LCBsaW5lWzBdWzFdICsgeV0sXG4gICAgICAgICAgZW5kID0gW2xpbmVbMV1bMF0gKyB4LCBsaW5lWzFdWzFdICsgeV0sXG4gICAgICAgICAgc3RhcnRJbmRleCA9IGluZGV4KHN0YXJ0KSxcbiAgICAgICAgICBlbmRJbmRleCA9IGluZGV4KGVuZCksXG4gICAgICAgICAgZiwgZztcbiAgICAgIGlmIChmID0gZnJhZ21lbnRCeUVuZFtzdGFydEluZGV4XSkge1xuICAgICAgICBpZiAoZyA9IGZyYWdtZW50QnlTdGFydFtlbmRJbmRleF0pIHtcbiAgICAgICAgICBkZWxldGUgZnJhZ21lbnRCeUVuZFtmLmVuZF07XG4gICAgICAgICAgZGVsZXRlIGZyYWdtZW50QnlTdGFydFtnLnN0YXJ0XTtcbiAgICAgICAgICBpZiAoZiA9PT0gZykge1xuICAgICAgICAgICAgZi5yaW5nLnB1c2goZW5kKTtcbiAgICAgICAgICAgIGNhbGxiYWNrKGYucmluZyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZyYWdtZW50QnlTdGFydFtmLnN0YXJ0XSA9IGZyYWdtZW50QnlFbmRbZy5lbmRdID0ge3N0YXJ0OiBmLnN0YXJ0LCBlbmQ6IGcuZW5kLCByaW5nOiBmLnJpbmcuY29uY2F0KGcucmluZyl9O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgZnJhZ21lbnRCeUVuZFtmLmVuZF07XG4gICAgICAgICAgZi5yaW5nLnB1c2goZW5kKTtcbiAgICAgICAgICBmcmFnbWVudEJ5RW5kW2YuZW5kID0gZW5kSW5kZXhdID0gZjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChmID0gZnJhZ21lbnRCeVN0YXJ0W2VuZEluZGV4XSkge1xuICAgICAgICBpZiAoZyA9IGZyYWdtZW50QnlFbmRbc3RhcnRJbmRleF0pIHtcbiAgICAgICAgICBkZWxldGUgZnJhZ21lbnRCeVN0YXJ0W2Yuc3RhcnRdO1xuICAgICAgICAgIGRlbGV0ZSBmcmFnbWVudEJ5RW5kW2cuZW5kXTtcbiAgICAgICAgICBpZiAoZiA9PT0gZykge1xuICAgICAgICAgICAgZi5yaW5nLnB1c2goZW5kKTtcbiAgICAgICAgICAgIGNhbGxiYWNrKGYucmluZyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZyYWdtZW50QnlTdGFydFtnLnN0YXJ0XSA9IGZyYWdtZW50QnlFbmRbZi5lbmRdID0ge3N0YXJ0OiBnLnN0YXJ0LCBlbmQ6IGYuZW5kLCByaW5nOiBnLnJpbmcuY29uY2F0KGYucmluZyl9O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgZnJhZ21lbnRCeVN0YXJ0W2Yuc3RhcnRdO1xuICAgICAgICAgIGYucmluZy51bnNoaWZ0KHN0YXJ0KTtcbiAgICAgICAgICBmcmFnbWVudEJ5U3RhcnRbZi5zdGFydCA9IHN0YXJ0SW5kZXhdID0gZjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnJhZ21lbnRCeVN0YXJ0W3N0YXJ0SW5kZXhdID0gZnJhZ21lbnRCeUVuZFtlbmRJbmRleF0gPSB7c3RhcnQ6IHN0YXJ0SW5kZXgsIGVuZDogZW5kSW5kZXgsIHJpbmc6IFtzdGFydCwgZW5kXX07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5kZXgocG9pbnQpIHtcbiAgICByZXR1cm4gcG9pbnRbMF0gKiAyICsgcG9pbnRbMV0gKiAoZHggKyAxKSAqIDQ7XG4gIH1cblxuICBmdW5jdGlvbiBzbW9vdGhMaW5lYXIocmluZywgdmFsdWVzLCB2YWx1ZSkge1xuICAgIHJpbmcuZm9yRWFjaChmdW5jdGlvbihwb2ludCkge1xuICAgICAgdmFyIHggPSBwb2ludFswXSxcbiAgICAgICAgICB5ID0gcG9pbnRbMV0sXG4gICAgICAgICAgeHQgPSB4IHwgMCxcbiAgICAgICAgICB5dCA9IHkgfCAwLFxuICAgICAgICAgIHYxID0gdmFsaWQodmFsdWVzW3l0ICogZHggKyB4dF0pO1xuICAgICAgaWYgKHggPiAwICYmIHggPCBkeCAmJiB4dCA9PT0geCkge1xuICAgICAgICBwb2ludFswXSA9IHNtb290aDEoeCwgdmFsaWQodmFsdWVzW3l0ICogZHggKyB4dCAtIDFdKSwgdjEsIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIGlmICh5ID4gMCAmJiB5IDwgZHkgJiYgeXQgPT09IHkpIHtcbiAgICAgICAgcG9pbnRbMV0gPSBzbW9vdGgxKHksIHZhbGlkKHZhbHVlc1soeXQgLSAxKSAqIGR4ICsgeHRdKSwgdjEsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNvbnRvdXJzLmNvbnRvdXIgPSBjb250b3VyO1xuXG4gIGNvbnRvdXJzLnNpemUgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gW2R4LCBkeV07XG4gICAgdmFyIF8wID0gTWF0aC5mbG9vcihfWzBdKSwgXzEgPSBNYXRoLmZsb29yKF9bMV0pO1xuICAgIGlmICghKF8wID49IDAgJiYgXzEgPj0gMCkpIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgc2l6ZVwiKTtcbiAgICByZXR1cm4gZHggPSBfMCwgZHkgPSBfMSwgY29udG91cnM7XG4gIH07XG5cbiAgY29udG91cnMudGhyZXNob2xkcyA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh0aHJlc2hvbGQgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IEFycmF5LmlzQXJyYXkoXykgPyBjb25zdGFudChzbGljZS5jYWxsKF8pKSA6IGNvbnN0YW50KF8pLCBjb250b3VycykgOiB0aHJlc2hvbGQ7XG4gIH07XG5cbiAgY29udG91cnMuc21vb3RoID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHNtb290aCA9IF8gPyBzbW9vdGhMaW5lYXIgOiBub29wLCBjb250b3VycykgOiBzbW9vdGggPT09IHNtb290aExpbmVhcjtcbiAgfTtcblxuICByZXR1cm4gY29udG91cnM7XG59XG5cbi8vIFdoZW4gY29tcHV0aW5nIHRoZSBleHRlbnQsIGlnbm9yZSBpbmZpbml0ZSB2YWx1ZXMgKGFzIHdlbGwgYXMgaW52YWxpZCBvbmVzKS5cbmZ1bmN0aW9uIGZpbml0ZSh4KSB7XG4gIHJldHVybiBpc0Zpbml0ZSh4KSA/IHggOiBOYU47XG59XG5cbi8vIElzIHRoZSAocG9zc2libHkgaW52YWxpZCkgeCBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhlIChrbm93biB2YWxpZCkgdmFsdWU/XG4vLyBUcmVhdCBhbnkgaW52YWxpZCB2YWx1ZSBhcyBiZWxvdyBuZWdhdGl2ZSBpbmZpbml0eS5cbmZ1bmN0aW9uIGFib3ZlKHgsIHZhbHVlKSB7XG4gIHJldHVybiB4ID09IG51bGwgPyBmYWxzZSA6ICt4ID49IHZhbHVlO1xufVxuXG4vLyBEdXJpbmcgc21vb3RoaW5nLCB0cmVhdCBhbnkgaW52YWxpZCB2YWx1ZSBhcyBuZWdhdGl2ZSBpbmZpbml0eS5cbmZ1bmN0aW9uIHZhbGlkKHYpIHtcbiAgcmV0dXJuIHYgPT0gbnVsbCB8fCBpc05hTih2ID0gK3YpID8gLUluZmluaXR5IDogdjtcbn1cblxuZnVuY3Rpb24gc21vb3RoMSh4LCB2MCwgdjEsIHZhbHVlKSB7XG4gIGNvbnN0IGEgPSB2YWx1ZSAtIHYwO1xuICBjb25zdCBiID0gdjEgLSB2MDtcbiAgY29uc3QgZCA9IGlzRmluaXRlKGEpIHx8IGlzRmluaXRlKGIpID8gYSAvIGIgOiBNYXRoLnNpZ24oYSkgLyBNYXRoLnNpZ24oYik7XG4gIHJldHVybiBpc05hTihkKSA/IHggOiB4ICsgZCAtIDAuNTtcbn1cbiIsImltcG9ydCB7Ymx1cjIsIG1heCwgdGlja3N9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtzbGljZX0gZnJvbSBcIi4vYXJyYXkuanNcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuaW1wb3J0IENvbnRvdXJzIGZyb20gXCIuL2NvbnRvdXJzLmpzXCI7XG5cbmZ1bmN0aW9uIGRlZmF1bHRYKGQpIHtcbiAgcmV0dXJuIGRbMF07XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRZKGQpIHtcbiAgcmV0dXJuIGRbMV07XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRXZWlnaHQoKSB7XG4gIHJldHVybiAxO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIHggPSBkZWZhdWx0WCxcbiAgICAgIHkgPSBkZWZhdWx0WSxcbiAgICAgIHdlaWdodCA9IGRlZmF1bHRXZWlnaHQsXG4gICAgICBkeCA9IDk2MCxcbiAgICAgIGR5ID0gNTAwLFxuICAgICAgciA9IDIwLCAvLyBibHVyIHJhZGl1c1xuICAgICAgayA9IDIsIC8vIGxvZzIoZ3JpZCBjZWxsIHNpemUpXG4gICAgICBvID0gciAqIDMsIC8vIGdyaWQgb2Zmc2V0LCB0byBwYWQgZm9yIGJsdXJcbiAgICAgIG4gPSAoZHggKyBvICogMikgPj4gaywgLy8gZ3JpZCB3aWR0aFxuICAgICAgbSA9IChkeSArIG8gKiAyKSA+PiBrLCAvLyBncmlkIGhlaWdodFxuICAgICAgdGhyZXNob2xkID0gY29uc3RhbnQoMjApO1xuXG4gIGZ1bmN0aW9uIGdyaWQoZGF0YSkge1xuICAgIHZhciB2YWx1ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG4gKiBtKSxcbiAgICAgICAgcG93MmsgPSBNYXRoLnBvdygyLCAtayksXG4gICAgICAgIGkgPSAtMTtcblxuICAgIGZvciAoY29uc3QgZCBvZiBkYXRhKSB7XG4gICAgICB2YXIgeGkgPSAoeChkLCArK2ksIGRhdGEpICsgbykgKiBwb3cyayxcbiAgICAgICAgICB5aSA9ICh5KGQsIGksIGRhdGEpICsgbykgKiBwb3cyayxcbiAgICAgICAgICB3aSA9ICt3ZWlnaHQoZCwgaSwgZGF0YSk7XG4gICAgICBpZiAod2kgJiYgeGkgPj0gMCAmJiB4aSA8IG4gJiYgeWkgPj0gMCAmJiB5aSA8IG0pIHtcbiAgICAgICAgdmFyIHgwID0gTWF0aC5mbG9vcih4aSksXG4gICAgICAgICAgICB5MCA9IE1hdGguZmxvb3IoeWkpLFxuICAgICAgICAgICAgeHQgPSB4aSAtIHgwIC0gMC41LFxuICAgICAgICAgICAgeXQgPSB5aSAtIHkwIC0gMC41O1xuICAgICAgICB2YWx1ZXNbeDAgKyB5MCAqIG5dICs9ICgxIC0geHQpICogKDEgLSB5dCkgKiB3aTtcbiAgICAgICAgdmFsdWVzW3gwICsgMSArIHkwICogbl0gKz0geHQgKiAoMSAtIHl0KSAqIHdpO1xuICAgICAgICB2YWx1ZXNbeDAgKyAxICsgKHkwICsgMSkgKiBuXSArPSB4dCAqIHl0ICogd2k7XG4gICAgICAgIHZhbHVlc1t4MCArICh5MCArIDEpICogbl0gKz0gKDEgLSB4dCkgKiB5dCAqIHdpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGJsdXIyKHtkYXRhOiB2YWx1ZXMsIHdpZHRoOiBuLCBoZWlnaHQ6IG19LCByICogcG93MmspO1xuICAgIHJldHVybiB2YWx1ZXM7XG4gIH1cblxuICBmdW5jdGlvbiBkZW5zaXR5KGRhdGEpIHtcbiAgICB2YXIgdmFsdWVzID0gZ3JpZChkYXRhKSxcbiAgICAgICAgdHogPSB0aHJlc2hvbGQodmFsdWVzKSxcbiAgICAgICAgcG93NGsgPSBNYXRoLnBvdygyLCAyICogayk7XG5cbiAgICAvLyBDb252ZXJ0IG51bWJlciBvZiB0aHJlc2hvbGRzIGludG8gdW5pZm9ybSB0aHJlc2hvbGRzLlxuICAgIGlmICghQXJyYXkuaXNBcnJheSh0eikpIHtcbiAgICAgIHR6ID0gdGlja3MoTnVtYmVyLk1JTl9WQUxVRSwgbWF4KHZhbHVlcykgLyBwb3c0aywgdHopO1xuICAgIH1cblxuICAgIHJldHVybiBDb250b3VycygpXG4gICAgICAgIC5zaXplKFtuLCBtXSlcbiAgICAgICAgLnRocmVzaG9sZHModHoubWFwKGQgPT4gZCAqIHBvdzRrKSlcbiAgICAgICh2YWx1ZXMpXG4gICAgICAgIC5tYXAoKGMsIGkpID0+IChjLnZhbHVlID0gK3R6W2ldLCB0cmFuc2Zvcm0oYykpKTtcbiAgfVxuXG4gIGRlbnNpdHkuY29udG91cnMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIHZhbHVlcyA9IGdyaWQoZGF0YSksXG4gICAgICAgIGNvbnRvdXJzID0gQ29udG91cnMoKS5zaXplKFtuLCBtXSksXG4gICAgICAgIHBvdzRrID0gTWF0aC5wb3coMiwgMiAqIGspLFxuICAgICAgICBjb250b3VyID0gdmFsdWUgPT4ge1xuICAgICAgICAgIHZhbHVlID0gK3ZhbHVlO1xuICAgICAgICAgIHZhciBjID0gdHJhbnNmb3JtKGNvbnRvdXJzLmNvbnRvdXIodmFsdWVzLCB2YWx1ZSAqIHBvdzRrKSk7XG4gICAgICAgICAgYy52YWx1ZSA9IHZhbHVlOyAvLyBwcmVzZXJ2ZSBleGFjdCB0aHJlc2hvbGQgdmFsdWVcbiAgICAgICAgICByZXR1cm4gYztcbiAgICAgICAgfTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29udG91ciwgXCJtYXhcIiwge2dldDogKCkgPT4gbWF4KHZhbHVlcykgLyBwb3c0a30pO1xuICAgIHJldHVybiBjb250b3VyO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHRyYW5zZm9ybShnZW9tZXRyeSkge1xuICAgIGdlb21ldHJ5LmNvb3JkaW5hdGVzLmZvckVhY2godHJhbnNmb3JtUG9seWdvbik7XG4gICAgcmV0dXJuIGdlb21ldHJ5O1xuICB9XG5cbiAgZnVuY3Rpb24gdHJhbnNmb3JtUG9seWdvbihjb29yZGluYXRlcykge1xuICAgIGNvb3JkaW5hdGVzLmZvckVhY2godHJhbnNmb3JtUmluZyk7XG4gIH1cblxuICBmdW5jdGlvbiB0cmFuc2Zvcm1SaW5nKGNvb3JkaW5hdGVzKSB7XG4gICAgY29vcmRpbmF0ZXMuZm9yRWFjaCh0cmFuc2Zvcm1Qb2ludCk7XG4gIH1cblxuICAvLyBUT0RPIE9wdGltaXplLlxuICBmdW5jdGlvbiB0cmFuc2Zvcm1Qb2ludChjb29yZGluYXRlcykge1xuICAgIGNvb3JkaW5hdGVzWzBdID0gY29vcmRpbmF0ZXNbMF0gKiBNYXRoLnBvdygyLCBrKSAtIG87XG4gICAgY29vcmRpbmF0ZXNbMV0gPSBjb29yZGluYXRlc1sxXSAqIE1hdGgucG93KDIsIGspIC0gbztcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2l6ZSgpIHtcbiAgICBvID0gciAqIDM7XG4gICAgbiA9IChkeCArIG8gKiAyKSA+PiBrO1xuICAgIG0gPSAoZHkgKyBvICogMikgPj4gaztcbiAgICByZXR1cm4gZGVuc2l0eTtcbiAgfVxuXG4gIGRlbnNpdHkueCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh4ID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIGRlbnNpdHkpIDogeDtcbiAgfTtcblxuICBkZW5zaXR5LnkgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoeSA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCBkZW5zaXR5KSA6IHk7XG4gIH07XG5cbiAgZGVuc2l0eS53ZWlnaHQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAod2VpZ2h0ID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIGRlbnNpdHkpIDogd2VpZ2h0O1xuICB9O1xuXG4gIGRlbnNpdHkuc2l6ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBbZHgsIGR5XTtcbiAgICB2YXIgXzAgPSArX1swXSwgXzEgPSArX1sxXTtcbiAgICBpZiAoIShfMCA+PSAwICYmIF8xID49IDApKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIHNpemVcIik7XG4gICAgcmV0dXJuIGR4ID0gXzAsIGR5ID0gXzEsIHJlc2l6ZSgpO1xuICB9O1xuXG4gIGRlbnNpdHkuY2VsbFNpemUgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gMSA8PCBrO1xuICAgIGlmICghKChfID0gK18pID49IDEpKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGNlbGwgc2l6ZVwiKTtcbiAgICByZXR1cm4gayA9IE1hdGguZmxvb3IoTWF0aC5sb2coXykgLyBNYXRoLkxOMiksIHJlc2l6ZSgpO1xuICB9O1xuXG4gIGRlbnNpdHkudGhyZXNob2xkcyA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh0aHJlc2hvbGQgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IEFycmF5LmlzQXJyYXkoXykgPyBjb25zdGFudChzbGljZS5jYWxsKF8pKSA6IGNvbnN0YW50KF8pLCBkZW5zaXR5KSA6IHRocmVzaG9sZDtcbiAgfTtcblxuICBkZW5zaXR5LmJhbmR3aWR0aCA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBNYXRoLnNxcnQociAqIChyICsgMSkpO1xuICAgIGlmICghKChfID0gK18pID49IDApKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGJhbmR3aWR0aFwiKTtcbiAgICByZXR1cm4gciA9IChNYXRoLnNxcnQoNCAqIF8gKiBfICsgMSkgLSAxKSAvIDIsIHJlc2l6ZSgpO1xuICB9O1xuXG4gIHJldHVybiBkZW5zaXR5O1xufVxuIiwiZXhwb3J0IHtkZWZhdWx0IGFzIGNvbnRvdXJzfSBmcm9tIFwiLi9jb250b3Vycy5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGNvbnRvdXJEZW5zaXR5fSBmcm9tIFwiLi9kZW5zaXR5LmpzXCI7XG4iLCJleHBvcnQgdmFyIGFicyA9IE1hdGguYWJzO1xuZXhwb3J0IHZhciBjb3MgPSBNYXRoLmNvcztcbmV4cG9ydCB2YXIgc2luID0gTWF0aC5zaW47XG5leHBvcnQgdmFyIHBpID0gTWF0aC5QSTtcbmV4cG9ydCB2YXIgaGFsZlBpID0gcGkgLyAyO1xuZXhwb3J0IHZhciB0YXUgPSBwaSAqIDI7XG5leHBvcnQgdmFyIG1heCA9IE1hdGgubWF4O1xuZXhwb3J0IHZhciBlcHNpbG9uID0gMWUtMTI7XG4iLCJpbXBvcnQge21heCwgdGF1fSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5cbmZ1bmN0aW9uIHJhbmdlKGksIGopIHtcbiAgcmV0dXJuIEFycmF5LmZyb20oe2xlbmd0aDogaiAtIGl9LCAoXywgaykgPT4gaSArIGspO1xufVxuXG5mdW5jdGlvbiBjb21wYXJlVmFsdWUoY29tcGFyZSkge1xuICByZXR1cm4gZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBjb21wYXJlKFxuICAgICAgYS5zb3VyY2UudmFsdWUgKyBhLnRhcmdldC52YWx1ZSxcbiAgICAgIGIuc291cmNlLnZhbHVlICsgYi50YXJnZXQudmFsdWVcbiAgICApO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGNob3JkKGZhbHNlLCBmYWxzZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaG9yZFRyYW5zcG9zZSgpIHtcbiAgcmV0dXJuIGNob3JkKGZhbHNlLCB0cnVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNob3JkRGlyZWN0ZWQoKSB7XG4gIHJldHVybiBjaG9yZCh0cnVlLCBmYWxzZSk7XG59XG5cbmZ1bmN0aW9uIGNob3JkKGRpcmVjdGVkLCB0cmFuc3Bvc2UpIHtcbiAgdmFyIHBhZEFuZ2xlID0gMCxcbiAgICAgIHNvcnRHcm91cHMgPSBudWxsLFxuICAgICAgc29ydFN1Ymdyb3VwcyA9IG51bGwsXG4gICAgICBzb3J0Q2hvcmRzID0gbnVsbDtcblxuICBmdW5jdGlvbiBjaG9yZChtYXRyaXgpIHtcbiAgICB2YXIgbiA9IG1hdHJpeC5sZW5ndGgsXG4gICAgICAgIGdyb3VwU3VtcyA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgZ3JvdXBJbmRleCA9IHJhbmdlKDAsIG4pLFxuICAgICAgICBjaG9yZHMgPSBuZXcgQXJyYXkobiAqIG4pLFxuICAgICAgICBncm91cHMgPSBuZXcgQXJyYXkobiksXG4gICAgICAgIGsgPSAwLCBkeDtcblxuICAgIG1hdHJpeCA9IEZsb2F0NjRBcnJheS5mcm9tKHtsZW5ndGg6IG4gKiBufSwgdHJhbnNwb3NlXG4gICAgICAgID8gKF8sIGkpID0+IG1hdHJpeFtpICUgbl1baSAvIG4gfCAwXVxuICAgICAgICA6IChfLCBpKSA9PiBtYXRyaXhbaSAvIG4gfCAwXVtpICUgbl0pO1xuXG4gICAgLy8gQ29tcHV0ZSB0aGUgc2NhbGluZyBmYWN0b3IgZnJvbSB2YWx1ZSB0byBhbmdsZSBpbiBbMCwgMnBpXS5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgbGV0IHggPSAwO1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBuOyArK2opIHggKz0gbWF0cml4W2kgKiBuICsgal0gKyBkaXJlY3RlZCAqIG1hdHJpeFtqICogbiArIGldO1xuICAgICAgayArPSBncm91cFN1bXNbaV0gPSB4O1xuICAgIH1cbiAgICBrID0gbWF4KDAsIHRhdSAtIHBhZEFuZ2xlICogbikgLyBrO1xuICAgIGR4ID0gayA/IHBhZEFuZ2xlIDogdGF1IC8gbjtcblxuICAgIC8vIENvbXB1dGUgdGhlIGFuZ2xlcyBmb3IgZWFjaCBncm91cCBhbmQgY29uc3RpdHVlbnQgY2hvcmQuXG4gICAge1xuICAgICAgbGV0IHggPSAwO1xuICAgICAgaWYgKHNvcnRHcm91cHMpIGdyb3VwSW5kZXguc29ydCgoYSwgYikgPT4gc29ydEdyb3Vwcyhncm91cFN1bXNbYV0sIGdyb3VwU3Vtc1tiXSkpO1xuICAgICAgZm9yIChjb25zdCBpIG9mIGdyb3VwSW5kZXgpIHtcbiAgICAgICAgY29uc3QgeDAgPSB4O1xuICAgICAgICBpZiAoZGlyZWN0ZWQpIHtcbiAgICAgICAgICBjb25zdCBzdWJncm91cEluZGV4ID0gcmFuZ2Uofm4gKyAxLCBuKS5maWx0ZXIoaiA9PiBqIDwgMCA/IG1hdHJpeFt+aiAqIG4gKyBpXSA6IG1hdHJpeFtpICogbiArIGpdKTtcbiAgICAgICAgICBpZiAoc29ydFN1Ymdyb3Vwcykgc3ViZ3JvdXBJbmRleC5zb3J0KChhLCBiKSA9PiBzb3J0U3ViZ3JvdXBzKGEgPCAwID8gLW1hdHJpeFt+YSAqIG4gKyBpXSA6IG1hdHJpeFtpICogbiArIGFdLCBiIDwgMCA/IC1tYXRyaXhbfmIgKiBuICsgaV0gOiBtYXRyaXhbaSAqIG4gKyBiXSkpO1xuICAgICAgICAgIGZvciAoY29uc3QgaiBvZiBzdWJncm91cEluZGV4KSB7XG4gICAgICAgICAgICBpZiAoaiA8IDApIHtcbiAgICAgICAgICAgICAgY29uc3QgY2hvcmQgPSBjaG9yZHNbfmogKiBuICsgaV0gfHwgKGNob3Jkc1t+aiAqIG4gKyBpXSA9IHtzb3VyY2U6IG51bGwsIHRhcmdldDogbnVsbH0pO1xuICAgICAgICAgICAgICBjaG9yZC50YXJnZXQgPSB7aW5kZXg6IGksIHN0YXJ0QW5nbGU6IHgsIGVuZEFuZ2xlOiB4ICs9IG1hdHJpeFt+aiAqIG4gKyBpXSAqIGssIHZhbHVlOiBtYXRyaXhbfmogKiBuICsgaV19O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc3QgY2hvcmQgPSBjaG9yZHNbaSAqIG4gKyBqXSB8fCAoY2hvcmRzW2kgKiBuICsgal0gPSB7c291cmNlOiBudWxsLCB0YXJnZXQ6IG51bGx9KTtcbiAgICAgICAgICAgICAgY2hvcmQuc291cmNlID0ge2luZGV4OiBpLCBzdGFydEFuZ2xlOiB4LCBlbmRBbmdsZTogeCArPSBtYXRyaXhbaSAqIG4gKyBqXSAqIGssIHZhbHVlOiBtYXRyaXhbaSAqIG4gKyBqXX07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGdyb3Vwc1tpXSA9IHtpbmRleDogaSwgc3RhcnRBbmdsZTogeDAsIGVuZEFuZ2xlOiB4LCB2YWx1ZTogZ3JvdXBTdW1zW2ldfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBzdWJncm91cEluZGV4ID0gcmFuZ2UoMCwgbikuZmlsdGVyKGogPT4gbWF0cml4W2kgKiBuICsgal0gfHwgbWF0cml4W2ogKiBuICsgaV0pO1xuICAgICAgICAgIGlmIChzb3J0U3ViZ3JvdXBzKSBzdWJncm91cEluZGV4LnNvcnQoKGEsIGIpID0+IHNvcnRTdWJncm91cHMobWF0cml4W2kgKiBuICsgYV0sIG1hdHJpeFtpICogbiArIGJdKSk7XG4gICAgICAgICAgZm9yIChjb25zdCBqIG9mIHN1Ymdyb3VwSW5kZXgpIHtcbiAgICAgICAgICAgIGxldCBjaG9yZDtcbiAgICAgICAgICAgIGlmIChpIDwgaikge1xuICAgICAgICAgICAgICBjaG9yZCA9IGNob3Jkc1tpICogbiArIGpdIHx8IChjaG9yZHNbaSAqIG4gKyBqXSA9IHtzb3VyY2U6IG51bGwsIHRhcmdldDogbnVsbH0pO1xuICAgICAgICAgICAgICBjaG9yZC5zb3VyY2UgPSB7aW5kZXg6IGksIHN0YXJ0QW5nbGU6IHgsIGVuZEFuZ2xlOiB4ICs9IG1hdHJpeFtpICogbiArIGpdICogaywgdmFsdWU6IG1hdHJpeFtpICogbiArIGpdfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNob3JkID0gY2hvcmRzW2ogKiBuICsgaV0gfHwgKGNob3Jkc1tqICogbiArIGldID0ge3NvdXJjZTogbnVsbCwgdGFyZ2V0OiBudWxsfSk7XG4gICAgICAgICAgICAgIGNob3JkLnRhcmdldCA9IHtpbmRleDogaSwgc3RhcnRBbmdsZTogeCwgZW5kQW5nbGU6IHggKz0gbWF0cml4W2kgKiBuICsgal0gKiBrLCB2YWx1ZTogbWF0cml4W2kgKiBuICsgal19O1xuICAgICAgICAgICAgICBpZiAoaSA9PT0gaikgY2hvcmQuc291cmNlID0gY2hvcmQudGFyZ2V0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNob3JkLnNvdXJjZSAmJiBjaG9yZC50YXJnZXQgJiYgY2hvcmQuc291cmNlLnZhbHVlIDwgY2hvcmQudGFyZ2V0LnZhbHVlKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHNvdXJjZSA9IGNob3JkLnNvdXJjZTtcbiAgICAgICAgICAgICAgY2hvcmQuc291cmNlID0gY2hvcmQudGFyZ2V0O1xuICAgICAgICAgICAgICBjaG9yZC50YXJnZXQgPSBzb3VyY2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGdyb3Vwc1tpXSA9IHtpbmRleDogaSwgc3RhcnRBbmdsZTogeDAsIGVuZEFuZ2xlOiB4LCB2YWx1ZTogZ3JvdXBTdW1zW2ldfTtcbiAgICAgICAgfVxuICAgICAgICB4ICs9IGR4O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlbW92ZSBlbXB0eSBjaG9yZHMuXG4gICAgY2hvcmRzID0gT2JqZWN0LnZhbHVlcyhjaG9yZHMpO1xuICAgIGNob3Jkcy5ncm91cHMgPSBncm91cHM7XG4gICAgcmV0dXJuIHNvcnRDaG9yZHMgPyBjaG9yZHMuc29ydChzb3J0Q2hvcmRzKSA6IGNob3JkcztcbiAgfVxuXG4gIGNob3JkLnBhZEFuZ2xlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBhZEFuZ2xlID0gbWF4KDAsIF8pLCBjaG9yZCkgOiBwYWRBbmdsZTtcbiAgfTtcblxuICBjaG9yZC5zb3J0R3JvdXBzID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHNvcnRHcm91cHMgPSBfLCBjaG9yZCkgOiBzb3J0R3JvdXBzO1xuICB9O1xuXG4gIGNob3JkLnNvcnRTdWJncm91cHMgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoc29ydFN1Ymdyb3VwcyA9IF8sIGNob3JkKSA6IHNvcnRTdWJncm91cHM7XG4gIH07XG5cbiAgY2hvcmQuc29ydENob3JkcyA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChfID09IG51bGwgPyBzb3J0Q2hvcmRzID0gbnVsbCA6IChzb3J0Q2hvcmRzID0gY29tcGFyZVZhbHVlKF8pKS5fID0gXywgY2hvcmQpIDogc29ydENob3JkcyAmJiBzb3J0Q2hvcmRzLl87XG4gIH07XG5cbiAgcmV0dXJuIGNob3JkO1xufVxuIiwiZXhwb3J0IHZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB4O1xuICB9O1xufVxuIiwiaW1wb3J0IHtwYXRofSBmcm9tIFwiZDMtcGF0aFwiO1xuaW1wb3J0IHtzbGljZX0gZnJvbSBcIi4vYXJyYXkuanNcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuaW1wb3J0IHthYnMsIGNvcywgZXBzaWxvbiwgaGFsZlBpLCBzaW59IGZyb20gXCIuL21hdGguanNcIjtcblxuZnVuY3Rpb24gZGVmYXVsdFNvdXJjZShkKSB7XG4gIHJldHVybiBkLnNvdXJjZTtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdFRhcmdldChkKSB7XG4gIHJldHVybiBkLnRhcmdldDtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdFJhZGl1cyhkKSB7XG4gIHJldHVybiBkLnJhZGl1cztcbn1cblxuZnVuY3Rpb24gZGVmYXVsdFN0YXJ0QW5nbGUoZCkge1xuICByZXR1cm4gZC5zdGFydEFuZ2xlO1xufVxuXG5mdW5jdGlvbiBkZWZhdWx0RW5kQW5nbGUoZCkge1xuICByZXR1cm4gZC5lbmRBbmdsZTtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdFBhZEFuZ2xlKCkge1xuICByZXR1cm4gMDtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdEFycm93aGVhZFJhZGl1cygpIHtcbiAgcmV0dXJuIDEwO1xufVxuXG5mdW5jdGlvbiByaWJib24oaGVhZFJhZGl1cykge1xuICB2YXIgc291cmNlID0gZGVmYXVsdFNvdXJjZSxcbiAgICAgIHRhcmdldCA9IGRlZmF1bHRUYXJnZXQsXG4gICAgICBzb3VyY2VSYWRpdXMgPSBkZWZhdWx0UmFkaXVzLFxuICAgICAgdGFyZ2V0UmFkaXVzID0gZGVmYXVsdFJhZGl1cyxcbiAgICAgIHN0YXJ0QW5nbGUgPSBkZWZhdWx0U3RhcnRBbmdsZSxcbiAgICAgIGVuZEFuZ2xlID0gZGVmYXVsdEVuZEFuZ2xlLFxuICAgICAgcGFkQW5nbGUgPSBkZWZhdWx0UGFkQW5nbGUsXG4gICAgICBjb250ZXh0ID0gbnVsbDtcblxuICBmdW5jdGlvbiByaWJib24oKSB7XG4gICAgdmFyIGJ1ZmZlcixcbiAgICAgICAgcyA9IHNvdXJjZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpLFxuICAgICAgICB0ID0gdGFyZ2V0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyksXG4gICAgICAgIGFwID0gcGFkQW5nbGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSAvIDIsXG4gICAgICAgIGFyZ3YgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyksXG4gICAgICAgIHNyID0gK3NvdXJjZVJhZGl1cy5hcHBseSh0aGlzLCAoYXJndlswXSA9IHMsIGFyZ3YpKSxcbiAgICAgICAgc2EwID0gc3RhcnRBbmdsZS5hcHBseSh0aGlzLCBhcmd2KSAtIGhhbGZQaSxcbiAgICAgICAgc2ExID0gZW5kQW5nbGUuYXBwbHkodGhpcywgYXJndikgLSBoYWxmUGksXG4gICAgICAgIHRyID0gK3RhcmdldFJhZGl1cy5hcHBseSh0aGlzLCAoYXJndlswXSA9IHQsIGFyZ3YpKSxcbiAgICAgICAgdGEwID0gc3RhcnRBbmdsZS5hcHBseSh0aGlzLCBhcmd2KSAtIGhhbGZQaSxcbiAgICAgICAgdGExID0gZW5kQW5nbGUuYXBwbHkodGhpcywgYXJndikgLSBoYWxmUGk7XG5cbiAgICBpZiAoIWNvbnRleHQpIGNvbnRleHQgPSBidWZmZXIgPSBwYXRoKCk7XG5cbiAgICBpZiAoYXAgPiBlcHNpbG9uKSB7XG4gICAgICBpZiAoYWJzKHNhMSAtIHNhMCkgPiBhcCAqIDIgKyBlcHNpbG9uKSBzYTEgPiBzYTAgPyAoc2EwICs9IGFwLCBzYTEgLT0gYXApIDogKHNhMCAtPSBhcCwgc2ExICs9IGFwKTtcbiAgICAgIGVsc2Ugc2EwID0gc2ExID0gKHNhMCArIHNhMSkgLyAyO1xuICAgICAgaWYgKGFicyh0YTEgLSB0YTApID4gYXAgKiAyICsgZXBzaWxvbikgdGExID4gdGEwID8gKHRhMCArPSBhcCwgdGExIC09IGFwKSA6ICh0YTAgLT0gYXAsIHRhMSArPSBhcCk7XG4gICAgICBlbHNlIHRhMCA9IHRhMSA9ICh0YTAgKyB0YTEpIC8gMjtcbiAgICB9XG5cbiAgICBjb250ZXh0Lm1vdmVUbyhzciAqIGNvcyhzYTApLCBzciAqIHNpbihzYTApKTtcbiAgICBjb250ZXh0LmFyYygwLCAwLCBzciwgc2EwLCBzYTEpO1xuICAgIGlmIChzYTAgIT09IHRhMCB8fCBzYTEgIT09IHRhMSkge1xuICAgICAgaWYgKGhlYWRSYWRpdXMpIHtcbiAgICAgICAgdmFyIGhyID0gK2hlYWRSYWRpdXMuYXBwbHkodGhpcywgYXJndW1lbnRzKSwgdHIyID0gdHIgLSBociwgdGEyID0gKHRhMCArIHRhMSkgLyAyO1xuICAgICAgICBjb250ZXh0LnF1YWRyYXRpY0N1cnZlVG8oMCwgMCwgdHIyICogY29zKHRhMCksIHRyMiAqIHNpbih0YTApKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8odHIgKiBjb3ModGEyKSwgdHIgKiBzaW4odGEyKSk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKHRyMiAqIGNvcyh0YTEpLCB0cjIgKiBzaW4odGExKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZXh0LnF1YWRyYXRpY0N1cnZlVG8oMCwgMCwgdHIgKiBjb3ModGEwKSwgdHIgKiBzaW4odGEwKSk7XG4gICAgICAgIGNvbnRleHQuYXJjKDAsIDAsIHRyLCB0YTAsIHRhMSk7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnRleHQucXVhZHJhdGljQ3VydmVUbygwLCAwLCBzciAqIGNvcyhzYTApLCBzciAqIHNpbihzYTApKTtcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuXG4gICAgaWYgKGJ1ZmZlcikgcmV0dXJuIGNvbnRleHQgPSBudWxsLCBidWZmZXIgKyBcIlwiIHx8IG51bGw7XG4gIH1cblxuICBpZiAoaGVhZFJhZGl1cykgcmliYm9uLmhlYWRSYWRpdXMgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoaGVhZFJhZGl1cyA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCByaWJib24pIDogaGVhZFJhZGl1cztcbiAgfTtcblxuICByaWJib24ucmFkaXVzID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHNvdXJjZVJhZGl1cyA9IHRhcmdldFJhZGl1cyA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCByaWJib24pIDogc291cmNlUmFkaXVzO1xuICB9O1xuXG4gIHJpYmJvbi5zb3VyY2VSYWRpdXMgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoc291cmNlUmFkaXVzID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIHJpYmJvbikgOiBzb3VyY2VSYWRpdXM7XG4gIH07XG5cbiAgcmliYm9uLnRhcmdldFJhZGl1cyA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh0YXJnZXRSYWRpdXMgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgcmliYm9uKSA6IHRhcmdldFJhZGl1cztcbiAgfTtcblxuICByaWJib24uc3RhcnRBbmdsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChzdGFydEFuZ2xlID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIHJpYmJvbikgOiBzdGFydEFuZ2xlO1xuICB9O1xuXG4gIHJpYmJvbi5lbmRBbmdsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChlbmRBbmdsZSA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCByaWJib24pIDogZW5kQW5nbGU7XG4gIH07XG5cbiAgcmliYm9uLnBhZEFuZ2xlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBhZEFuZ2xlID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIHJpYmJvbikgOiBwYWRBbmdsZTtcbiAgfTtcblxuICByaWJib24uc291cmNlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHNvdXJjZSA9IF8sIHJpYmJvbikgOiBzb3VyY2U7XG4gIH07XG5cbiAgcmliYm9uLnRhcmdldCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh0YXJnZXQgPSBfLCByaWJib24pIDogdGFyZ2V0O1xuICB9O1xuXG4gIHJpYmJvbi5jb250ZXh0ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKChjb250ZXh0ID0gXyA9PSBudWxsID8gbnVsbCA6IF8pLCByaWJib24pIDogY29udGV4dDtcbiAgfTtcblxuICByZXR1cm4gcmliYm9uO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHJpYmJvbigpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmliYm9uQXJyb3coKSB7XG4gIHJldHVybiByaWJib24oZGVmYXVsdEFycm93aGVhZFJhZGl1cyk7XG59XG4iLCJleHBvcnQge2RlZmF1bHQgYXMgY2hvcmQsIGNob3JkVHJhbnNwb3NlLCBjaG9yZERpcmVjdGVkfSBmcm9tIFwiLi9jaG9yZC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHJpYmJvbiwgcmliYm9uQXJyb3d9IGZyb20gXCIuL3JpYmJvbi5qc1wiO1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCkge1xuICByZXR1cm4gTWF0aC5hYnMoeCA9IE1hdGgucm91bmQoeCkpID49IDFlMjFcbiAgICAgID8geC50b0xvY2FsZVN0cmluZyhcImVuXCIpLnJlcGxhY2UoLywvZywgXCJcIilcbiAgICAgIDogeC50b1N0cmluZygxMCk7XG59XG5cbi8vIENvbXB1dGVzIHRoZSBkZWNpbWFsIGNvZWZmaWNpZW50IGFuZCBleHBvbmVudCBvZiB0aGUgc3BlY2lmaWVkIG51bWJlciB4IHdpdGhcbi8vIHNpZ25pZmljYW50IGRpZ2l0cyBwLCB3aGVyZSB4IGlzIHBvc2l0aXZlIGFuZCBwIGlzIGluIFsxLCAyMV0gb3IgdW5kZWZpbmVkLlxuLy8gRm9yIGV4YW1wbGUsIGZvcm1hdERlY2ltYWxQYXJ0cygxLjIzKSByZXR1cm5zIFtcIjEyM1wiLCAwXS5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXREZWNpbWFsUGFydHMoeCwgcCkge1xuICBpZiAoKGkgPSAoeCA9IHAgPyB4LnRvRXhwb25lbnRpYWwocCAtIDEpIDogeC50b0V4cG9uZW50aWFsKCkpLmluZGV4T2YoXCJlXCIpKSA8IDApIHJldHVybiBudWxsOyAvLyBOYU4sIMKxSW5maW5pdHlcbiAgdmFyIGksIGNvZWZmaWNpZW50ID0geC5zbGljZSgwLCBpKTtcblxuICAvLyBUaGUgc3RyaW5nIHJldHVybmVkIGJ5IHRvRXhwb25lbnRpYWwgZWl0aGVyIGhhcyB0aGUgZm9ybSBcXGRcXC5cXGQrZVstK11cXGQrXG4gIC8vIChlLmcuLCAxLjJlKzMpIG9yIHRoZSBmb3JtIFxcZGVbLStdXFxkKyAoZS5nLiwgMWUrMykuXG4gIHJldHVybiBbXG4gICAgY29lZmZpY2llbnQubGVuZ3RoID4gMSA/IGNvZWZmaWNpZW50WzBdICsgY29lZmZpY2llbnQuc2xpY2UoMikgOiBjb2VmZmljaWVudCxcbiAgICAreC5zbGljZShpICsgMSlcbiAgXTtcbn1cbiIsImltcG9ydCB7Zm9ybWF0RGVjaW1hbFBhcnRzfSBmcm9tIFwiLi9mb3JtYXREZWNpbWFsLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIHggPSBmb3JtYXREZWNpbWFsUGFydHMoTWF0aC5hYnMoeCkpLCB4ID8geFsxXSA6IE5hTjtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGdyb3VwaW5nLCB0aG91c2FuZHMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCB3aWR0aCkge1xuICAgIHZhciBpID0gdmFsdWUubGVuZ3RoLFxuICAgICAgICB0ID0gW10sXG4gICAgICAgIGogPSAwLFxuICAgICAgICBnID0gZ3JvdXBpbmdbMF0sXG4gICAgICAgIGxlbmd0aCA9IDA7XG5cbiAgICB3aGlsZSAoaSA+IDAgJiYgZyA+IDApIHtcbiAgICAgIGlmIChsZW5ndGggKyBnICsgMSA+IHdpZHRoKSBnID0gTWF0aC5tYXgoMSwgd2lkdGggLSBsZW5ndGgpO1xuICAgICAgdC5wdXNoKHZhbHVlLnN1YnN0cmluZyhpIC09IGcsIGkgKyBnKSk7XG4gICAgICBpZiAoKGxlbmd0aCArPSBnICsgMSkgPiB3aWR0aCkgYnJlYWs7XG4gICAgICBnID0gZ3JvdXBpbmdbaiA9IChqICsgMSkgJSBncm91cGluZy5sZW5ndGhdO1xuICAgIH1cblxuICAgIHJldHVybiB0LnJldmVyc2UoKS5qb2luKHRob3VzYW5kcyk7XG4gIH07XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihudW1lcmFscykge1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvWzAtOV0vZywgZnVuY3Rpb24oaSkge1xuICAgICAgcmV0dXJuIG51bWVyYWxzWytpXTtcbiAgICB9KTtcbiAgfTtcbn1cbiIsIi8vIFtbZmlsbF1hbGlnbl1bc2lnbl1bc3ltYm9sXVswXVt3aWR0aF1bLF1bLnByZWNpc2lvbl1bfl1bdHlwZV1cbnZhciByZSA9IC9eKD86KC4pPyhbPD49Xl0pKT8oWytcXC0oIF0pPyhbJCNdKT8oMCk/KFxcZCspPygsKT8oXFwuXFxkKyk/KH4pPyhbYS16JV0pPyQvaTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZm9ybWF0U3BlY2lmaWVyKHNwZWNpZmllcikge1xuICBpZiAoIShtYXRjaCA9IHJlLmV4ZWMoc3BlY2lmaWVyKSkpIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgZm9ybWF0OiBcIiArIHNwZWNpZmllcik7XG4gIHZhciBtYXRjaDtcbiAgcmV0dXJuIG5ldyBGb3JtYXRTcGVjaWZpZXIoe1xuICAgIGZpbGw6IG1hdGNoWzFdLFxuICAgIGFsaWduOiBtYXRjaFsyXSxcbiAgICBzaWduOiBtYXRjaFszXSxcbiAgICBzeW1ib2w6IG1hdGNoWzRdLFxuICAgIHplcm86IG1hdGNoWzVdLFxuICAgIHdpZHRoOiBtYXRjaFs2XSxcbiAgICBjb21tYTogbWF0Y2hbN10sXG4gICAgcHJlY2lzaW9uOiBtYXRjaFs4XSAmJiBtYXRjaFs4XS5zbGljZSgxKSxcbiAgICB0cmltOiBtYXRjaFs5XSxcbiAgICB0eXBlOiBtYXRjaFsxMF1cbiAgfSk7XG59XG5cbmZvcm1hdFNwZWNpZmllci5wcm90b3R5cGUgPSBGb3JtYXRTcGVjaWZpZXIucHJvdG90eXBlOyAvLyBpbnN0YW5jZW9mXG5cbmV4cG9ydCBmdW5jdGlvbiBGb3JtYXRTcGVjaWZpZXIoc3BlY2lmaWVyKSB7XG4gIHRoaXMuZmlsbCA9IHNwZWNpZmllci5maWxsID09PSB1bmRlZmluZWQgPyBcIiBcIiA6IHNwZWNpZmllci5maWxsICsgXCJcIjtcbiAgdGhpcy5hbGlnbiA9IHNwZWNpZmllci5hbGlnbiA9PT0gdW5kZWZpbmVkID8gXCI+XCIgOiBzcGVjaWZpZXIuYWxpZ24gKyBcIlwiO1xuICB0aGlzLnNpZ24gPSBzcGVjaWZpZXIuc2lnbiA9PT0gdW5kZWZpbmVkID8gXCItXCIgOiBzcGVjaWZpZXIuc2lnbiArIFwiXCI7XG4gIHRoaXMuc3ltYm9sID0gc3BlY2lmaWVyLnN5bWJvbCA9PT0gdW5kZWZpbmVkID8gXCJcIiA6IHNwZWNpZmllci5zeW1ib2wgKyBcIlwiO1xuICB0aGlzLnplcm8gPSAhIXNwZWNpZmllci56ZXJvO1xuICB0aGlzLndpZHRoID0gc3BlY2lmaWVyLndpZHRoID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiArc3BlY2lmaWVyLndpZHRoO1xuICB0aGlzLmNvbW1hID0gISFzcGVjaWZpZXIuY29tbWE7XG4gIHRoaXMucHJlY2lzaW9uID0gc3BlY2lmaWVyLnByZWNpc2lvbiA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogK3NwZWNpZmllci5wcmVjaXNpb247XG4gIHRoaXMudHJpbSA9ICEhc3BlY2lmaWVyLnRyaW07XG4gIHRoaXMudHlwZSA9IHNwZWNpZmllci50eXBlID09PSB1bmRlZmluZWQgPyBcIlwiIDogc3BlY2lmaWVyLnR5cGUgKyBcIlwiO1xufVxuXG5Gb3JtYXRTcGVjaWZpZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmZpbGxcbiAgICAgICsgdGhpcy5hbGlnblxuICAgICAgKyB0aGlzLnNpZ25cbiAgICAgICsgdGhpcy5zeW1ib2xcbiAgICAgICsgKHRoaXMuemVybyA/IFwiMFwiIDogXCJcIilcbiAgICAgICsgKHRoaXMud2lkdGggPT09IHVuZGVmaW5lZCA/IFwiXCIgOiBNYXRoLm1heCgxLCB0aGlzLndpZHRoIHwgMCkpXG4gICAgICArICh0aGlzLmNvbW1hID8gXCIsXCIgOiBcIlwiKVxuICAgICAgKyAodGhpcy5wcmVjaXNpb24gPT09IHVuZGVmaW5lZCA/IFwiXCIgOiBcIi5cIiArIE1hdGgubWF4KDAsIHRoaXMucHJlY2lzaW9uIHwgMCkpXG4gICAgICArICh0aGlzLnRyaW0gPyBcIn5cIiA6IFwiXCIpXG4gICAgICArIHRoaXMudHlwZTtcbn07XG4iLCIvLyBUcmltcyBpbnNpZ25pZmljYW50IHplcm9zLCBlLmcuLCByZXBsYWNlcyAxLjIwMDBrIHdpdGggMS4yay5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHMpIHtcbiAgb3V0OiBmb3IgKHZhciBuID0gcy5sZW5ndGgsIGkgPSAxLCBpMCA9IC0xLCBpMTsgaSA8IG47ICsraSkge1xuICAgIHN3aXRjaCAoc1tpXSkge1xuICAgICAgY2FzZSBcIi5cIjogaTAgPSBpMSA9IGk7IGJyZWFrO1xuICAgICAgY2FzZSBcIjBcIjogaWYgKGkwID09PSAwKSBpMCA9IGk7IGkxID0gaTsgYnJlYWs7XG4gICAgICBkZWZhdWx0OiBpZiAoIStzW2ldKSBicmVhayBvdXQ7IGlmIChpMCA+IDApIGkwID0gMDsgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBpMCA+IDAgPyBzLnNsaWNlKDAsIGkwKSArIHMuc2xpY2UoaTEgKyAxKSA6IHM7XG59XG4iLCJpbXBvcnQge2Zvcm1hdERlY2ltYWxQYXJ0c30gZnJvbSBcIi4vZm9ybWF0RGVjaW1hbC5qc1wiO1xuXG5leHBvcnQgdmFyIHByZWZpeEV4cG9uZW50O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih4LCBwKSB7XG4gIHZhciBkID0gZm9ybWF0RGVjaW1hbFBhcnRzKHgsIHApO1xuICBpZiAoIWQpIHJldHVybiB4ICsgXCJcIjtcbiAgdmFyIGNvZWZmaWNpZW50ID0gZFswXSxcbiAgICAgIGV4cG9uZW50ID0gZFsxXSxcbiAgICAgIGkgPSBleHBvbmVudCAtIChwcmVmaXhFeHBvbmVudCA9IE1hdGgubWF4KC04LCBNYXRoLm1pbig4LCBNYXRoLmZsb29yKGV4cG9uZW50IC8gMykpKSAqIDMpICsgMSxcbiAgICAgIG4gPSBjb2VmZmljaWVudC5sZW5ndGg7XG4gIHJldHVybiBpID09PSBuID8gY29lZmZpY2llbnRcbiAgICAgIDogaSA+IG4gPyBjb2VmZmljaWVudCArIG5ldyBBcnJheShpIC0gbiArIDEpLmpvaW4oXCIwXCIpXG4gICAgICA6IGkgPiAwID8gY29lZmZpY2llbnQuc2xpY2UoMCwgaSkgKyBcIi5cIiArIGNvZWZmaWNpZW50LnNsaWNlKGkpXG4gICAgICA6IFwiMC5cIiArIG5ldyBBcnJheSgxIC0gaSkuam9pbihcIjBcIikgKyBmb3JtYXREZWNpbWFsUGFydHMoeCwgTWF0aC5tYXgoMCwgcCArIGkgLSAxKSlbMF07IC8vIGxlc3MgdGhhbiAxeSFcbn1cbiIsImltcG9ydCB7Zm9ybWF0RGVjaW1hbFBhcnRzfSBmcm9tIFwiLi9mb3JtYXREZWNpbWFsLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgsIHApIHtcbiAgdmFyIGQgPSBmb3JtYXREZWNpbWFsUGFydHMoeCwgcCk7XG4gIGlmICghZCkgcmV0dXJuIHggKyBcIlwiO1xuICB2YXIgY29lZmZpY2llbnQgPSBkWzBdLFxuICAgICAgZXhwb25lbnQgPSBkWzFdO1xuICByZXR1cm4gZXhwb25lbnQgPCAwID8gXCIwLlwiICsgbmV3IEFycmF5KC1leHBvbmVudCkuam9pbihcIjBcIikgKyBjb2VmZmljaWVudFxuICAgICAgOiBjb2VmZmljaWVudC5sZW5ndGggPiBleHBvbmVudCArIDEgPyBjb2VmZmljaWVudC5zbGljZSgwLCBleHBvbmVudCArIDEpICsgXCIuXCIgKyBjb2VmZmljaWVudC5zbGljZShleHBvbmVudCArIDEpXG4gICAgICA6IGNvZWZmaWNpZW50ICsgbmV3IEFycmF5KGV4cG9uZW50IC0gY29lZmZpY2llbnQubGVuZ3RoICsgMikuam9pbihcIjBcIik7XG59XG4iLCJpbXBvcnQgZm9ybWF0RGVjaW1hbCBmcm9tIFwiLi9mb3JtYXREZWNpbWFsLmpzXCI7XG5pbXBvcnQgZm9ybWF0UHJlZml4QXV0byBmcm9tIFwiLi9mb3JtYXRQcmVmaXhBdXRvLmpzXCI7XG5pbXBvcnQgZm9ybWF0Um91bmRlZCBmcm9tIFwiLi9mb3JtYXRSb3VuZGVkLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgXCIlXCI6ICh4LCBwKSA9PiAoeCAqIDEwMCkudG9GaXhlZChwKSxcbiAgXCJiXCI6ICh4KSA9PiBNYXRoLnJvdW5kKHgpLnRvU3RyaW5nKDIpLFxuICBcImNcIjogKHgpID0+IHggKyBcIlwiLFxuICBcImRcIjogZm9ybWF0RGVjaW1hbCxcbiAgXCJlXCI6ICh4LCBwKSA9PiB4LnRvRXhwb25lbnRpYWwocCksXG4gIFwiZlwiOiAoeCwgcCkgPT4geC50b0ZpeGVkKHApLFxuICBcImdcIjogKHgsIHApID0+IHgudG9QcmVjaXNpb24ocCksXG4gIFwib1wiOiAoeCkgPT4gTWF0aC5yb3VuZCh4KS50b1N0cmluZyg4KSxcbiAgXCJwXCI6ICh4LCBwKSA9PiBmb3JtYXRSb3VuZGVkKHggKiAxMDAsIHApLFxuICBcInJcIjogZm9ybWF0Um91bmRlZCxcbiAgXCJzXCI6IGZvcm1hdFByZWZpeEF1dG8sXG4gIFwiWFwiOiAoeCkgPT4gTWF0aC5yb3VuZCh4KS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKSxcbiAgXCJ4XCI6ICh4KSA9PiBNYXRoLnJvdW5kKHgpLnRvU3RyaW5nKDE2KVxufTtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIHg7XG59XG4iLCJpbXBvcnQgZXhwb25lbnQgZnJvbSBcIi4vZXhwb25lbnQuanNcIjtcbmltcG9ydCBmb3JtYXRHcm91cCBmcm9tIFwiLi9mb3JtYXRHcm91cC5qc1wiO1xuaW1wb3J0IGZvcm1hdE51bWVyYWxzIGZyb20gXCIuL2Zvcm1hdE51bWVyYWxzLmpzXCI7XG5pbXBvcnQgZm9ybWF0U3BlY2lmaWVyIGZyb20gXCIuL2Zvcm1hdFNwZWNpZmllci5qc1wiO1xuaW1wb3J0IGZvcm1hdFRyaW0gZnJvbSBcIi4vZm9ybWF0VHJpbS5qc1wiO1xuaW1wb3J0IGZvcm1hdFR5cGVzIGZyb20gXCIuL2Zvcm1hdFR5cGVzLmpzXCI7XG5pbXBvcnQge3ByZWZpeEV4cG9uZW50fSBmcm9tIFwiLi9mb3JtYXRQcmVmaXhBdXRvLmpzXCI7XG5pbXBvcnQgaWRlbnRpdHkgZnJvbSBcIi4vaWRlbnRpdHkuanNcIjtcblxudmFyIG1hcCA9IEFycmF5LnByb3RvdHlwZS5tYXAsXG4gICAgcHJlZml4ZXMgPSBbXCJ5XCIsXCJ6XCIsXCJhXCIsXCJmXCIsXCJwXCIsXCJuXCIsXCLCtVwiLFwibVwiLFwiXCIsXCJrXCIsXCJNXCIsXCJHXCIsXCJUXCIsXCJQXCIsXCJFXCIsXCJaXCIsXCJZXCJdO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihsb2NhbGUpIHtcbiAgdmFyIGdyb3VwID0gbG9jYWxlLmdyb3VwaW5nID09PSB1bmRlZmluZWQgfHwgbG9jYWxlLnRob3VzYW5kcyA9PT0gdW5kZWZpbmVkID8gaWRlbnRpdHkgOiBmb3JtYXRHcm91cChtYXAuY2FsbChsb2NhbGUuZ3JvdXBpbmcsIE51bWJlciksIGxvY2FsZS50aG91c2FuZHMgKyBcIlwiKSxcbiAgICAgIGN1cnJlbmN5UHJlZml4ID0gbG9jYWxlLmN1cnJlbmN5ID09PSB1bmRlZmluZWQgPyBcIlwiIDogbG9jYWxlLmN1cnJlbmN5WzBdICsgXCJcIixcbiAgICAgIGN1cnJlbmN5U3VmZml4ID0gbG9jYWxlLmN1cnJlbmN5ID09PSB1bmRlZmluZWQgPyBcIlwiIDogbG9jYWxlLmN1cnJlbmN5WzFdICsgXCJcIixcbiAgICAgIGRlY2ltYWwgPSBsb2NhbGUuZGVjaW1hbCA9PT0gdW5kZWZpbmVkID8gXCIuXCIgOiBsb2NhbGUuZGVjaW1hbCArIFwiXCIsXG4gICAgICBudW1lcmFscyA9IGxvY2FsZS5udW1lcmFscyA9PT0gdW5kZWZpbmVkID8gaWRlbnRpdHkgOiBmb3JtYXROdW1lcmFscyhtYXAuY2FsbChsb2NhbGUubnVtZXJhbHMsIFN0cmluZykpLFxuICAgICAgcGVyY2VudCA9IGxvY2FsZS5wZXJjZW50ID09PSB1bmRlZmluZWQgPyBcIiVcIiA6IGxvY2FsZS5wZXJjZW50ICsgXCJcIixcbiAgICAgIG1pbnVzID0gbG9jYWxlLm1pbnVzID09PSB1bmRlZmluZWQgPyBcIuKIklwiIDogbG9jYWxlLm1pbnVzICsgXCJcIixcbiAgICAgIG5hbiA9IGxvY2FsZS5uYW4gPT09IHVuZGVmaW5lZCA/IFwiTmFOXCIgOiBsb2NhbGUubmFuICsgXCJcIjtcblxuICBmdW5jdGlvbiBuZXdGb3JtYXQoc3BlY2lmaWVyKSB7XG4gICAgc3BlY2lmaWVyID0gZm9ybWF0U3BlY2lmaWVyKHNwZWNpZmllcik7XG5cbiAgICB2YXIgZmlsbCA9IHNwZWNpZmllci5maWxsLFxuICAgICAgICBhbGlnbiA9IHNwZWNpZmllci5hbGlnbixcbiAgICAgICAgc2lnbiA9IHNwZWNpZmllci5zaWduLFxuICAgICAgICBzeW1ib2wgPSBzcGVjaWZpZXIuc3ltYm9sLFxuICAgICAgICB6ZXJvID0gc3BlY2lmaWVyLnplcm8sXG4gICAgICAgIHdpZHRoID0gc3BlY2lmaWVyLndpZHRoLFxuICAgICAgICBjb21tYSA9IHNwZWNpZmllci5jb21tYSxcbiAgICAgICAgcHJlY2lzaW9uID0gc3BlY2lmaWVyLnByZWNpc2lvbixcbiAgICAgICAgdHJpbSA9IHNwZWNpZmllci50cmltLFxuICAgICAgICB0eXBlID0gc3BlY2lmaWVyLnR5cGU7XG5cbiAgICAvLyBUaGUgXCJuXCIgdHlwZSBpcyBhbiBhbGlhcyBmb3IgXCIsZ1wiLlxuICAgIGlmICh0eXBlID09PSBcIm5cIikgY29tbWEgPSB0cnVlLCB0eXBlID0gXCJnXCI7XG5cbiAgICAvLyBUaGUgXCJcIiB0eXBlLCBhbmQgYW55IGludmFsaWQgdHlwZSwgaXMgYW4gYWxpYXMgZm9yIFwiLjEyfmdcIi5cbiAgICBlbHNlIGlmICghZm9ybWF0VHlwZXNbdHlwZV0pIHByZWNpc2lvbiA9PT0gdW5kZWZpbmVkICYmIChwcmVjaXNpb24gPSAxMiksIHRyaW0gPSB0cnVlLCB0eXBlID0gXCJnXCI7XG5cbiAgICAvLyBJZiB6ZXJvIGZpbGwgaXMgc3BlY2lmaWVkLCBwYWRkaW5nIGdvZXMgYWZ0ZXIgc2lnbiBhbmQgYmVmb3JlIGRpZ2l0cy5cbiAgICBpZiAoemVybyB8fCAoZmlsbCA9PT0gXCIwXCIgJiYgYWxpZ24gPT09IFwiPVwiKSkgemVybyA9IHRydWUsIGZpbGwgPSBcIjBcIiwgYWxpZ24gPSBcIj1cIjtcblxuICAgIC8vIENvbXB1dGUgdGhlIHByZWZpeCBhbmQgc3VmZml4LlxuICAgIC8vIEZvciBTSS1wcmVmaXgsIHRoZSBzdWZmaXggaXMgbGF6aWx5IGNvbXB1dGVkLlxuICAgIHZhciBwcmVmaXggPSBzeW1ib2wgPT09IFwiJFwiID8gY3VycmVuY3lQcmVmaXggOiBzeW1ib2wgPT09IFwiI1wiICYmIC9bYm94WF0vLnRlc3QodHlwZSkgPyBcIjBcIiArIHR5cGUudG9Mb3dlckNhc2UoKSA6IFwiXCIsXG4gICAgICAgIHN1ZmZpeCA9IHN5bWJvbCA9PT0gXCIkXCIgPyBjdXJyZW5jeVN1ZmZpeCA6IC9bJXBdLy50ZXN0KHR5cGUpID8gcGVyY2VudCA6IFwiXCI7XG5cbiAgICAvLyBXaGF0IGZvcm1hdCBmdW5jdGlvbiBzaG91bGQgd2UgdXNlP1xuICAgIC8vIElzIHRoaXMgYW4gaW50ZWdlciB0eXBlP1xuICAgIC8vIENhbiB0aGlzIHR5cGUgZ2VuZXJhdGUgZXhwb25lbnRpYWwgbm90YXRpb24/XG4gICAgdmFyIGZvcm1hdFR5cGUgPSBmb3JtYXRUeXBlc1t0eXBlXSxcbiAgICAgICAgbWF5YmVTdWZmaXggPSAvW2RlZmdwcnMlXS8udGVzdCh0eXBlKTtcblxuICAgIC8vIFNldCB0aGUgZGVmYXVsdCBwcmVjaXNpb24gaWYgbm90IHNwZWNpZmllZCxcbiAgICAvLyBvciBjbGFtcCB0aGUgc3BlY2lmaWVkIHByZWNpc2lvbiB0byB0aGUgc3VwcG9ydGVkIHJhbmdlLlxuICAgIC8vIEZvciBzaWduaWZpY2FudCBwcmVjaXNpb24sIGl0IG11c3QgYmUgaW4gWzEsIDIxXS5cbiAgICAvLyBGb3IgZml4ZWQgcHJlY2lzaW9uLCBpdCBtdXN0IGJlIGluIFswLCAyMF0uXG4gICAgcHJlY2lzaW9uID0gcHJlY2lzaW9uID09PSB1bmRlZmluZWQgPyA2XG4gICAgICAgIDogL1tncHJzXS8udGVzdCh0eXBlKSA/IE1hdGgubWF4KDEsIE1hdGgubWluKDIxLCBwcmVjaXNpb24pKVxuICAgICAgICA6IE1hdGgubWF4KDAsIE1hdGgubWluKDIwLCBwcmVjaXNpb24pKTtcblxuICAgIGZ1bmN0aW9uIGZvcm1hdCh2YWx1ZSkge1xuICAgICAgdmFyIHZhbHVlUHJlZml4ID0gcHJlZml4LFxuICAgICAgICAgIHZhbHVlU3VmZml4ID0gc3VmZml4LFxuICAgICAgICAgIGksIG4sIGM7XG5cbiAgICAgIGlmICh0eXBlID09PSBcImNcIikge1xuICAgICAgICB2YWx1ZVN1ZmZpeCA9IGZvcm1hdFR5cGUodmFsdWUpICsgdmFsdWVTdWZmaXg7XG4gICAgICAgIHZhbHVlID0gXCJcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gK3ZhbHVlO1xuXG4gICAgICAgIC8vIERldGVybWluZSB0aGUgc2lnbi4gLTAgaXMgbm90IGxlc3MgdGhhbiAwLCBidXQgMSAvIC0wIGlzIVxuICAgICAgICB2YXIgdmFsdWVOZWdhdGl2ZSA9IHZhbHVlIDwgMCB8fCAxIC8gdmFsdWUgPCAwO1xuXG4gICAgICAgIC8vIFBlcmZvcm0gdGhlIGluaXRpYWwgZm9ybWF0dGluZy5cbiAgICAgICAgdmFsdWUgPSBpc05hTih2YWx1ZSkgPyBuYW4gOiBmb3JtYXRUeXBlKE1hdGguYWJzKHZhbHVlKSwgcHJlY2lzaW9uKTtcblxuICAgICAgICAvLyBUcmltIGluc2lnbmlmaWNhbnQgemVyb3MuXG4gICAgICAgIGlmICh0cmltKSB2YWx1ZSA9IGZvcm1hdFRyaW0odmFsdWUpO1xuXG4gICAgICAgIC8vIElmIGEgbmVnYXRpdmUgdmFsdWUgcm91bmRzIHRvIHplcm8gYWZ0ZXIgZm9ybWF0dGluZywgYW5kIG5vIGV4cGxpY2l0IHBvc2l0aXZlIHNpZ24gaXMgcmVxdWVzdGVkLCBoaWRlIHRoZSBzaWduLlxuICAgICAgICBpZiAodmFsdWVOZWdhdGl2ZSAmJiArdmFsdWUgPT09IDAgJiYgc2lnbiAhPT0gXCIrXCIpIHZhbHVlTmVnYXRpdmUgPSBmYWxzZTtcblxuICAgICAgICAvLyBDb21wdXRlIHRoZSBwcmVmaXggYW5kIHN1ZmZpeC5cbiAgICAgICAgdmFsdWVQcmVmaXggPSAodmFsdWVOZWdhdGl2ZSA/IChzaWduID09PSBcIihcIiA/IHNpZ24gOiBtaW51cykgOiBzaWduID09PSBcIi1cIiB8fCBzaWduID09PSBcIihcIiA/IFwiXCIgOiBzaWduKSArIHZhbHVlUHJlZml4O1xuICAgICAgICB2YWx1ZVN1ZmZpeCA9ICh0eXBlID09PSBcInNcIiA/IHByZWZpeGVzWzggKyBwcmVmaXhFeHBvbmVudCAvIDNdIDogXCJcIikgKyB2YWx1ZVN1ZmZpeCArICh2YWx1ZU5lZ2F0aXZlICYmIHNpZ24gPT09IFwiKFwiID8gXCIpXCIgOiBcIlwiKTtcblxuICAgICAgICAvLyBCcmVhayB0aGUgZm9ybWF0dGVkIHZhbHVlIGludG8gdGhlIGludGVnZXIg4oCcdmFsdWXigJ0gcGFydCB0aGF0IGNhbiBiZVxuICAgICAgICAvLyBncm91cGVkLCBhbmQgZnJhY3Rpb25hbCBvciBleHBvbmVudGlhbCDigJxzdWZmaXjigJ0gcGFydCB0aGF0IGlzIG5vdC5cbiAgICAgICAgaWYgKG1heWJlU3VmZml4KSB7XG4gICAgICAgICAgaSA9IC0xLCBuID0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgICAgICBpZiAoYyA9IHZhbHVlLmNoYXJDb2RlQXQoaSksIDQ4ID4gYyB8fCBjID4gNTcpIHtcbiAgICAgICAgICAgICAgdmFsdWVTdWZmaXggPSAoYyA9PT0gNDYgPyBkZWNpbWFsICsgdmFsdWUuc2xpY2UoaSArIDEpIDogdmFsdWUuc2xpY2UoaSkpICsgdmFsdWVTdWZmaXg7XG4gICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuc2xpY2UoMCwgaSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgZmlsbCBjaGFyYWN0ZXIgaXMgbm90IFwiMFwiLCBncm91cGluZyBpcyBhcHBsaWVkIGJlZm9yZSBwYWRkaW5nLlxuICAgICAgaWYgKGNvbW1hICYmICF6ZXJvKSB2YWx1ZSA9IGdyb3VwKHZhbHVlLCBJbmZpbml0eSk7XG5cbiAgICAgIC8vIENvbXB1dGUgdGhlIHBhZGRpbmcuXG4gICAgICB2YXIgbGVuZ3RoID0gdmFsdWVQcmVmaXgubGVuZ3RoICsgdmFsdWUubGVuZ3RoICsgdmFsdWVTdWZmaXgubGVuZ3RoLFxuICAgICAgICAgIHBhZGRpbmcgPSBsZW5ndGggPCB3aWR0aCA/IG5ldyBBcnJheSh3aWR0aCAtIGxlbmd0aCArIDEpLmpvaW4oZmlsbCkgOiBcIlwiO1xuXG4gICAgICAvLyBJZiB0aGUgZmlsbCBjaGFyYWN0ZXIgaXMgXCIwXCIsIGdyb3VwaW5nIGlzIGFwcGxpZWQgYWZ0ZXIgcGFkZGluZy5cbiAgICAgIGlmIChjb21tYSAmJiB6ZXJvKSB2YWx1ZSA9IGdyb3VwKHBhZGRpbmcgKyB2YWx1ZSwgcGFkZGluZy5sZW5ndGggPyB3aWR0aCAtIHZhbHVlU3VmZml4Lmxlbmd0aCA6IEluZmluaXR5KSwgcGFkZGluZyA9IFwiXCI7XG5cbiAgICAgIC8vIFJlY29uc3RydWN0IHRoZSBmaW5hbCBvdXRwdXQgYmFzZWQgb24gdGhlIGRlc2lyZWQgYWxpZ25tZW50LlxuICAgICAgc3dpdGNoIChhbGlnbikge1xuICAgICAgICBjYXNlIFwiPFwiOiB2YWx1ZSA9IHZhbHVlUHJlZml4ICsgdmFsdWUgKyB2YWx1ZVN1ZmZpeCArIHBhZGRpbmc7IGJyZWFrO1xuICAgICAgICBjYXNlIFwiPVwiOiB2YWx1ZSA9IHZhbHVlUHJlZml4ICsgcGFkZGluZyArIHZhbHVlICsgdmFsdWVTdWZmaXg7IGJyZWFrO1xuICAgICAgICBjYXNlIFwiXlwiOiB2YWx1ZSA9IHBhZGRpbmcuc2xpY2UoMCwgbGVuZ3RoID0gcGFkZGluZy5sZW5ndGggPj4gMSkgKyB2YWx1ZVByZWZpeCArIHZhbHVlICsgdmFsdWVTdWZmaXggKyBwYWRkaW5nLnNsaWNlKGxlbmd0aCk7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiB2YWx1ZSA9IHBhZGRpbmcgKyB2YWx1ZVByZWZpeCArIHZhbHVlICsgdmFsdWVTdWZmaXg7IGJyZWFrO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVtZXJhbHModmFsdWUpO1xuICAgIH1cblxuICAgIGZvcm1hdC50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHNwZWNpZmllciArIFwiXCI7XG4gICAgfTtcblxuICAgIHJldHVybiBmb3JtYXQ7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRQcmVmaXgoc3BlY2lmaWVyLCB2YWx1ZSkge1xuICAgIHZhciBmID0gbmV3Rm9ybWF0KChzcGVjaWZpZXIgPSBmb3JtYXRTcGVjaWZpZXIoc3BlY2lmaWVyKSwgc3BlY2lmaWVyLnR5cGUgPSBcImZcIiwgc3BlY2lmaWVyKSksXG4gICAgICAgIGUgPSBNYXRoLm1heCgtOCwgTWF0aC5taW4oOCwgTWF0aC5mbG9vcihleHBvbmVudCh2YWx1ZSkgLyAzKSkpICogMyxcbiAgICAgICAgayA9IE1hdGgucG93KDEwLCAtZSksXG4gICAgICAgIHByZWZpeCA9IHByZWZpeGVzWzggKyBlIC8gM107XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gZihrICogdmFsdWUpICsgcHJlZml4O1xuICAgIH07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGZvcm1hdDogbmV3Rm9ybWF0LFxuICAgIGZvcm1hdFByZWZpeDogZm9ybWF0UHJlZml4XG4gIH07XG59XG4iLCJpbXBvcnQgZm9ybWF0TG9jYWxlIGZyb20gXCIuL2xvY2FsZS5qc1wiO1xuXG52YXIgbG9jYWxlO1xuZXhwb3J0IHZhciBmb3JtYXQ7XG5leHBvcnQgdmFyIGZvcm1hdFByZWZpeDtcblxuZGVmYXVsdExvY2FsZSh7XG4gIHRob3VzYW5kczogXCIsXCIsXG4gIGdyb3VwaW5nOiBbM10sXG4gIGN1cnJlbmN5OiBbXCIkXCIsIFwiXCJdXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVmYXVsdExvY2FsZShkZWZpbml0aW9uKSB7XG4gIGxvY2FsZSA9IGZvcm1hdExvY2FsZShkZWZpbml0aW9uKTtcbiAgZm9ybWF0ID0gbG9jYWxlLmZvcm1hdDtcbiAgZm9ybWF0UHJlZml4ID0gbG9jYWxlLmZvcm1hdFByZWZpeDtcbiAgcmV0dXJuIGxvY2FsZTtcbn1cbiIsImltcG9ydCBleHBvbmVudCBmcm9tIFwiLi9leHBvbmVudC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzdGVwKSB7XG4gIHJldHVybiBNYXRoLm1heCgwLCAtZXhwb25lbnQoTWF0aC5hYnMoc3RlcCkpKTtcbn1cbiIsImltcG9ydCBleHBvbmVudCBmcm9tIFwiLi9leHBvbmVudC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzdGVwLCB2YWx1ZSkge1xuICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5tYXgoLTgsIE1hdGgubWluKDgsIE1hdGguZmxvb3IoZXhwb25lbnQodmFsdWUpIC8gMykpKSAqIDMgLSBleHBvbmVudChNYXRoLmFicyhzdGVwKSkpO1xufVxuIiwiaW1wb3J0IGV4cG9uZW50IGZyb20gXCIuL2V4cG9uZW50LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHN0ZXAsIG1heCkge1xuICBzdGVwID0gTWF0aC5hYnMoc3RlcCksIG1heCA9IE1hdGguYWJzKG1heCkgLSBzdGVwO1xuICByZXR1cm4gTWF0aC5tYXgoMCwgZXhwb25lbnQobWF4KSAtIGV4cG9uZW50KHN0ZXApKSArIDE7XG59XG4iLCJleHBvcnQge2RlZmF1bHQgYXMgZm9ybWF0RGVmYXVsdExvY2FsZSwgZm9ybWF0LCBmb3JtYXRQcmVmaXh9IGZyb20gXCIuL2RlZmF1bHRMb2NhbGUuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBmb3JtYXRMb2NhbGV9IGZyb20gXCIuL2xvY2FsZS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGZvcm1hdFNwZWNpZmllciwgRm9ybWF0U3BlY2lmaWVyfSBmcm9tIFwiLi9mb3JtYXRTcGVjaWZpZXIuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBwcmVjaXNpb25GaXhlZH0gZnJvbSBcIi4vcHJlY2lzaW9uRml4ZWQuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBwcmVjaXNpb25QcmVmaXh9IGZyb20gXCIuL3ByZWNpc2lvblByZWZpeC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHByZWNpc2lvblJvdW5kfSBmcm9tIFwiLi9wcmVjaXNpb25Sb3VuZC5qc1wiO1xuIiwiY29uc3QgZXBzaWxvbiA9IDFlLTY7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhdGgge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl94MCA9IHRoaXMuX3kwID0gLy8gc3RhcnQgb2YgY3VycmVudCBzdWJwYXRoXG4gICAgdGhpcy5feDEgPSB0aGlzLl95MSA9IG51bGw7IC8vIGVuZCBvZiBjdXJyZW50IHN1YnBhdGhcbiAgICB0aGlzLl8gPSBcIlwiO1xuICB9XG4gIG1vdmVUbyh4LCB5KSB7XG4gICAgdGhpcy5fICs9IGBNJHt0aGlzLl94MCA9IHRoaXMuX3gxID0gK3h9LCR7dGhpcy5feTAgPSB0aGlzLl95MSA9ICt5fWA7XG4gIH1cbiAgY2xvc2VQYXRoKCkge1xuICAgIGlmICh0aGlzLl94MSAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5feDEgPSB0aGlzLl94MCwgdGhpcy5feTEgPSB0aGlzLl95MDtcbiAgICAgIHRoaXMuXyArPSBcIlpcIjtcbiAgICB9XG4gIH1cbiAgbGluZVRvKHgsIHkpIHtcbiAgICB0aGlzLl8gKz0gYEwke3RoaXMuX3gxID0gK3h9LCR7dGhpcy5feTEgPSAreX1gO1xuICB9XG4gIGFyYyh4LCB5LCByKSB7XG4gICAgeCA9ICt4LCB5ID0gK3ksIHIgPSArcjtcbiAgICBjb25zdCB4MCA9IHggKyByO1xuICAgIGNvbnN0IHkwID0geTtcbiAgICBpZiAociA8IDApIHRocm93IG5ldyBFcnJvcihcIm5lZ2F0aXZlIHJhZGl1c1wiKTtcbiAgICBpZiAodGhpcy5feDEgPT09IG51bGwpIHRoaXMuXyArPSBgTSR7eDB9LCR7eTB9YDtcbiAgICBlbHNlIGlmIChNYXRoLmFicyh0aGlzLl94MSAtIHgwKSA+IGVwc2lsb24gfHwgTWF0aC5hYnModGhpcy5feTEgLSB5MCkgPiBlcHNpbG9uKSB0aGlzLl8gKz0gXCJMXCIgKyB4MCArIFwiLFwiICsgeTA7XG4gICAgaWYgKCFyKSByZXR1cm47XG4gICAgdGhpcy5fICs9IGBBJHtyfSwke3J9LDAsMSwxLCR7eCAtIHJ9LCR7eX1BJHtyfSwke3J9LDAsMSwxLCR7dGhpcy5feDEgPSB4MH0sJHt0aGlzLl95MSA9IHkwfWA7XG4gIH1cbiAgcmVjdCh4LCB5LCB3LCBoKSB7XG4gICAgdGhpcy5fICs9IGBNJHt0aGlzLl94MCA9IHRoaXMuX3gxID0gK3h9LCR7dGhpcy5feTAgPSB0aGlzLl95MSA9ICt5fWgkeyt3fXYkeytofWgkey13fVpgO1xuICB9XG4gIHZhbHVlKCkge1xuICAgIHJldHVybiB0aGlzLl8gfHwgbnVsbDtcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9seWdvbiB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuXyA9IFtdO1xuICB9XG4gIG1vdmVUbyh4LCB5KSB7XG4gICAgdGhpcy5fLnB1c2goW3gsIHldKTtcbiAgfVxuICBjbG9zZVBhdGgoKSB7XG4gICAgdGhpcy5fLnB1c2godGhpcy5fWzBdLnNsaWNlKCkpO1xuICB9XG4gIGxpbmVUbyh4LCB5KSB7XG4gICAgdGhpcy5fLnB1c2goW3gsIHldKTtcbiAgfVxuICB2YWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fLmxlbmd0aCA/IHRoaXMuXyA6IG51bGw7XG4gIH1cbn1cbiIsImltcG9ydCBQYXRoIGZyb20gXCIuL3BhdGguanNcIjtcbmltcG9ydCBQb2x5Z29uIGZyb20gXCIuL3BvbHlnb24uanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVm9yb25vaSB7XG4gIGNvbnN0cnVjdG9yKGRlbGF1bmF5LCBbeG1pbiwgeW1pbiwgeG1heCwgeW1heF0gPSBbMCwgMCwgOTYwLCA1MDBdKSB7XG4gICAgaWYgKCEoKHhtYXggPSAreG1heCkgPj0gKHhtaW4gPSAreG1pbikpIHx8ICEoKHltYXggPSAreW1heCkgPj0gKHltaW4gPSAreW1pbikpKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGJvdW5kc1wiKTtcbiAgICB0aGlzLmRlbGF1bmF5ID0gZGVsYXVuYXk7XG4gICAgdGhpcy5fY2lyY3VtY2VudGVycyA9IG5ldyBGbG9hdDY0QXJyYXkoZGVsYXVuYXkucG9pbnRzLmxlbmd0aCAqIDIpO1xuICAgIHRoaXMudmVjdG9ycyA9IG5ldyBGbG9hdDY0QXJyYXkoZGVsYXVuYXkucG9pbnRzLmxlbmd0aCAqIDIpO1xuICAgIHRoaXMueG1heCA9IHhtYXgsIHRoaXMueG1pbiA9IHhtaW47XG4gICAgdGhpcy55bWF4ID0geW1heCwgdGhpcy55bWluID0geW1pbjtcbiAgICB0aGlzLl9pbml0KCk7XG4gIH1cbiAgdXBkYXRlKCkge1xuICAgIHRoaXMuZGVsYXVuYXkudXBkYXRlKCk7XG4gICAgdGhpcy5faW5pdCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIF9pbml0KCkge1xuICAgIGNvbnN0IHtkZWxhdW5heToge3BvaW50cywgaHVsbCwgdHJpYW5nbGVzfSwgdmVjdG9yc30gPSB0aGlzO1xuICAgIGxldCBieCwgYnk7IC8vIGxhemlseSBjb21wdXRlZCBiYXJ5Y2VudGVyIG9mIHRoZSBodWxsXG5cbiAgICAvLyBDb21wdXRlIGNpcmN1bWNlbnRlcnMuXG4gICAgY29uc3QgY2lyY3VtY2VudGVycyA9IHRoaXMuY2lyY3VtY2VudGVycyA9IHRoaXMuX2NpcmN1bWNlbnRlcnMuc3ViYXJyYXkoMCwgdHJpYW5nbGVzLmxlbmd0aCAvIDMgKiAyKTtcbiAgICBmb3IgKGxldCBpID0gMCwgaiA9IDAsIG4gPSB0cmlhbmdsZXMubGVuZ3RoLCB4LCB5OyBpIDwgbjsgaSArPSAzLCBqICs9IDIpIHtcbiAgICAgIGNvbnN0IHQxID0gdHJpYW5nbGVzW2ldICogMjtcbiAgICAgIGNvbnN0IHQyID0gdHJpYW5nbGVzW2kgKyAxXSAqIDI7XG4gICAgICBjb25zdCB0MyA9IHRyaWFuZ2xlc1tpICsgMl0gKiAyO1xuICAgICAgY29uc3QgeDEgPSBwb2ludHNbdDFdO1xuICAgICAgY29uc3QgeTEgPSBwb2ludHNbdDEgKyAxXTtcbiAgICAgIGNvbnN0IHgyID0gcG9pbnRzW3QyXTtcbiAgICAgIGNvbnN0IHkyID0gcG9pbnRzW3QyICsgMV07XG4gICAgICBjb25zdCB4MyA9IHBvaW50c1t0M107XG4gICAgICBjb25zdCB5MyA9IHBvaW50c1t0MyArIDFdO1xuXG4gICAgICBjb25zdCBkeCA9IHgyIC0geDE7XG4gICAgICBjb25zdCBkeSA9IHkyIC0geTE7XG4gICAgICBjb25zdCBleCA9IHgzIC0geDE7XG4gICAgICBjb25zdCBleSA9IHkzIC0geTE7XG4gICAgICBjb25zdCBhYiA9IChkeCAqIGV5IC0gZHkgKiBleCkgKiAyO1xuXG4gICAgICBpZiAoTWF0aC5hYnMoYWIpIDwgMWUtOSkge1xuICAgICAgICAvLyBGb3IgYSBkZWdlbmVyYXRlIHRyaWFuZ2xlLCB0aGUgY2lyY3VtY2VudGVyIGlzIGF0IHRoZSBpbmZpbml0eSwgaW4gYVxuICAgICAgICAvLyBkaXJlY3Rpb24gb3J0aG9nb25hbCB0byB0aGUgaGFsZmVkZ2UgYW5kIGF3YXkgZnJvbSB0aGUg4oCcY2VudGVy4oCdIG9mXG4gICAgICAgIC8vIHRoZSBkaWFncmFtIDxieCwgYnk+LCBkZWZpbmVkIGFzIHRoZSBodWxs4oCZcyBiYXJ5Y2VudGVyLlxuICAgICAgICBpZiAoYnggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGJ4ID0gYnkgPSAwO1xuICAgICAgICAgIGZvciAoY29uc3QgaSBvZiBodWxsKSBieCArPSBwb2ludHNbaSAqIDJdLCBieSArPSBwb2ludHNbaSAqIDIgKyAxXTtcbiAgICAgICAgICBieCAvPSBodWxsLmxlbmd0aCwgYnkgLz0gaHVsbC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYSA9IDFlOSAqIE1hdGguc2lnbigoYnggLSB4MSkgKiBleSAtIChieSAtIHkxKSAqIGV4KTtcbiAgICAgICAgeCA9ICh4MSArIHgzKSAvIDIgLSBhICogZXk7XG4gICAgICAgIHkgPSAoeTEgKyB5MykgLyAyICsgYSAqIGV4O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZCA9IDEgLyBhYjtcbiAgICAgICAgY29uc3QgYmwgPSBkeCAqIGR4ICsgZHkgKiBkeTtcbiAgICAgICAgY29uc3QgY2wgPSBleCAqIGV4ICsgZXkgKiBleTtcbiAgICAgICAgeCA9IHgxICsgKGV5ICogYmwgLSBkeSAqIGNsKSAqIGQ7XG4gICAgICAgIHkgPSB5MSArIChkeCAqIGNsIC0gZXggKiBibCkgKiBkO1xuICAgICAgfVxuICAgICAgY2lyY3VtY2VudGVyc1tqXSA9IHg7XG4gICAgICBjaXJjdW1jZW50ZXJzW2ogKyAxXSA9IHk7XG4gICAgfVxuXG4gICAgLy8gQ29tcHV0ZSBleHRlcmlvciBjZWxsIHJheXMuXG4gICAgbGV0IGggPSBodWxsW2h1bGwubGVuZ3RoIC0gMV07XG4gICAgbGV0IHAwLCBwMSA9IGggKiA0O1xuICAgIGxldCB4MCwgeDEgPSBwb2ludHNbMiAqIGhdO1xuICAgIGxldCB5MCwgeTEgPSBwb2ludHNbMiAqIGggKyAxXTtcbiAgICB2ZWN0b3JzLmZpbGwoMCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBodWxsLmxlbmd0aDsgKytpKSB7XG4gICAgICBoID0gaHVsbFtpXTtcbiAgICAgIHAwID0gcDEsIHgwID0geDEsIHkwID0geTE7XG4gICAgICBwMSA9IGggKiA0LCB4MSA9IHBvaW50c1syICogaF0sIHkxID0gcG9pbnRzWzIgKiBoICsgMV07XG4gICAgICB2ZWN0b3JzW3AwICsgMl0gPSB2ZWN0b3JzW3AxXSA9IHkwIC0geTE7XG4gICAgICB2ZWN0b3JzW3AwICsgM10gPSB2ZWN0b3JzW3AxICsgMV0gPSB4MSAtIHgwO1xuICAgIH1cbiAgfVxuICByZW5kZXIoY29udGV4dCkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IGNvbnRleHQgPT0gbnVsbCA/IGNvbnRleHQgPSBuZXcgUGF0aCA6IHVuZGVmaW5lZDtcbiAgICBjb25zdCB7ZGVsYXVuYXk6IHtoYWxmZWRnZXMsIGluZWRnZXMsIGh1bGx9LCBjaXJjdW1jZW50ZXJzLCB2ZWN0b3JzfSA9IHRoaXM7XG4gICAgaWYgKGh1bGwubGVuZ3RoIDw9IDEpIHJldHVybiBudWxsO1xuICAgIGZvciAobGV0IGkgPSAwLCBuID0gaGFsZmVkZ2VzLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgY29uc3QgaiA9IGhhbGZlZGdlc1tpXTtcbiAgICAgIGlmIChqIDwgaSkgY29udGludWU7XG4gICAgICBjb25zdCB0aSA9IE1hdGguZmxvb3IoaSAvIDMpICogMjtcbiAgICAgIGNvbnN0IHRqID0gTWF0aC5mbG9vcihqIC8gMykgKiAyO1xuICAgICAgY29uc3QgeGkgPSBjaXJjdW1jZW50ZXJzW3RpXTtcbiAgICAgIGNvbnN0IHlpID0gY2lyY3VtY2VudGVyc1t0aSArIDFdO1xuICAgICAgY29uc3QgeGogPSBjaXJjdW1jZW50ZXJzW3RqXTtcbiAgICAgIGNvbnN0IHlqID0gY2lyY3VtY2VudGVyc1t0aiArIDFdO1xuICAgICAgdGhpcy5fcmVuZGVyU2VnbWVudCh4aSwgeWksIHhqLCB5aiwgY29udGV4dCk7XG4gICAgfVxuICAgIGxldCBoMCwgaDEgPSBodWxsW2h1bGwubGVuZ3RoIC0gMV07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBodWxsLmxlbmd0aDsgKytpKSB7XG4gICAgICBoMCA9IGgxLCBoMSA9IGh1bGxbaV07XG4gICAgICBjb25zdCB0ID0gTWF0aC5mbG9vcihpbmVkZ2VzW2gxXSAvIDMpICogMjtcbiAgICAgIGNvbnN0IHggPSBjaXJjdW1jZW50ZXJzW3RdO1xuICAgICAgY29uc3QgeSA9IGNpcmN1bWNlbnRlcnNbdCArIDFdO1xuICAgICAgY29uc3QgdiA9IGgwICogNDtcbiAgICAgIGNvbnN0IHAgPSB0aGlzLl9wcm9qZWN0KHgsIHksIHZlY3RvcnNbdiArIDJdLCB2ZWN0b3JzW3YgKyAzXSk7XG4gICAgICBpZiAocCkgdGhpcy5fcmVuZGVyU2VnbWVudCh4LCB5LCBwWzBdLCBwWzFdLCBjb250ZXh0KTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZmZlciAmJiBidWZmZXIudmFsdWUoKTtcbiAgfVxuICByZW5kZXJCb3VuZHMoY29udGV4dCkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IGNvbnRleHQgPT0gbnVsbCA/IGNvbnRleHQgPSBuZXcgUGF0aCA6IHVuZGVmaW5lZDtcbiAgICBjb250ZXh0LnJlY3QodGhpcy54bWluLCB0aGlzLnltaW4sIHRoaXMueG1heCAtIHRoaXMueG1pbiwgdGhpcy55bWF4IC0gdGhpcy55bWluKTtcbiAgICByZXR1cm4gYnVmZmVyICYmIGJ1ZmZlci52YWx1ZSgpO1xuICB9XG4gIHJlbmRlckNlbGwoaSwgY29udGV4dCkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IGNvbnRleHQgPT0gbnVsbCA/IGNvbnRleHQgPSBuZXcgUGF0aCA6IHVuZGVmaW5lZDtcbiAgICBjb25zdCBwb2ludHMgPSB0aGlzLl9jbGlwKGkpO1xuICAgIGlmIChwb2ludHMgPT09IG51bGwgfHwgIXBvaW50cy5sZW5ndGgpIHJldHVybjtcbiAgICBjb250ZXh0Lm1vdmVUbyhwb2ludHNbMF0sIHBvaW50c1sxXSk7XG4gICAgbGV0IG4gPSBwb2ludHMubGVuZ3RoO1xuICAgIHdoaWxlIChwb2ludHNbMF0gPT09IHBvaW50c1tuLTJdICYmIHBvaW50c1sxXSA9PT0gcG9pbnRzW24tMV0gJiYgbiA+IDEpIG4gLT0gMjtcbiAgICBmb3IgKGxldCBpID0gMjsgaSA8IG47IGkgKz0gMikge1xuICAgICAgaWYgKHBvaW50c1tpXSAhPT0gcG9pbnRzW2ktMl0gfHwgcG9pbnRzW2krMV0gIT09IHBvaW50c1tpLTFdKVxuICAgICAgICBjb250ZXh0LmxpbmVUbyhwb2ludHNbaV0sIHBvaW50c1tpICsgMV0pO1xuICAgIH1cbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIHJldHVybiBidWZmZXIgJiYgYnVmZmVyLnZhbHVlKCk7XG4gIH1cbiAgKmNlbGxQb2x5Z29ucygpIHtcbiAgICBjb25zdCB7ZGVsYXVuYXk6IHtwb2ludHN9fSA9IHRoaXM7XG4gICAgZm9yIChsZXQgaSA9IDAsIG4gPSBwb2ludHMubGVuZ3RoIC8gMjsgaSA8IG47ICsraSkge1xuICAgICAgY29uc3QgY2VsbCA9IHRoaXMuY2VsbFBvbHlnb24oaSk7XG4gICAgICBpZiAoY2VsbCkgY2VsbC5pbmRleCA9IGksIHlpZWxkIGNlbGw7XG4gICAgfVxuICB9XG4gIGNlbGxQb2x5Z29uKGkpIHtcbiAgICBjb25zdCBwb2x5Z29uID0gbmV3IFBvbHlnb247XG4gICAgdGhpcy5yZW5kZXJDZWxsKGksIHBvbHlnb24pO1xuICAgIHJldHVybiBwb2x5Z29uLnZhbHVlKCk7XG4gIH1cbiAgX3JlbmRlclNlZ21lbnQoeDAsIHkwLCB4MSwgeTEsIGNvbnRleHQpIHtcbiAgICBsZXQgUztcbiAgICBjb25zdCBjMCA9IHRoaXMuX3JlZ2lvbmNvZGUoeDAsIHkwKTtcbiAgICBjb25zdCBjMSA9IHRoaXMuX3JlZ2lvbmNvZGUoeDEsIHkxKTtcbiAgICBpZiAoYzAgPT09IDAgJiYgYzEgPT09IDApIHtcbiAgICAgIGNvbnRleHQubW92ZVRvKHgwLCB5MCk7XG4gICAgICBjb250ZXh0LmxpbmVUbyh4MSwgeTEpO1xuICAgIH0gZWxzZSBpZiAoUyA9IHRoaXMuX2NsaXBTZWdtZW50KHgwLCB5MCwgeDEsIHkxLCBjMCwgYzEpKSB7XG4gICAgICBjb250ZXh0Lm1vdmVUbyhTWzBdLCBTWzFdKTtcbiAgICAgIGNvbnRleHQubGluZVRvKFNbMl0sIFNbM10pO1xuICAgIH1cbiAgfVxuICBjb250YWlucyhpLCB4LCB5KSB7XG4gICAgaWYgKCh4ID0gK3gsIHggIT09IHgpIHx8ICh5ID0gK3ksIHkgIT09IHkpKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXMuZGVsYXVuYXkuX3N0ZXAoaSwgeCwgeSkgPT09IGk7XG4gIH1cbiAgKm5laWdoYm9ycyhpKSB7XG4gICAgY29uc3QgY2kgPSB0aGlzLl9jbGlwKGkpO1xuICAgIGlmIChjaSkgZm9yIChjb25zdCBqIG9mIHRoaXMuZGVsYXVuYXkubmVpZ2hib3JzKGkpKSB7XG4gICAgICBjb25zdCBjaiA9IHRoaXMuX2NsaXAoaik7XG4gICAgICAvLyBmaW5kIHRoZSBjb21tb24gZWRnZVxuICAgICAgaWYgKGNqKSBsb29wOiBmb3IgKGxldCBhaSA9IDAsIGxpID0gY2kubGVuZ3RoOyBhaSA8IGxpOyBhaSArPSAyKSB7XG4gICAgICAgIGZvciAobGV0IGFqID0gMCwgbGogPSBjai5sZW5ndGg7IGFqIDwgbGo7IGFqICs9IDIpIHtcbiAgICAgICAgICBpZiAoY2lbYWldID09PSBjalthal1cbiAgICAgICAgICAgICAgJiYgY2lbYWkgKyAxXSA9PT0gY2pbYWogKyAxXVxuICAgICAgICAgICAgICAmJiBjaVsoYWkgKyAyKSAlIGxpXSA9PT0gY2pbKGFqICsgbGogLSAyKSAlIGxqXVxuICAgICAgICAgICAgICAmJiBjaVsoYWkgKyAzKSAlIGxpXSA9PT0gY2pbKGFqICsgbGogLSAxKSAlIGxqXSkge1xuICAgICAgICAgICAgeWllbGQgajtcbiAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIF9jZWxsKGkpIHtcbiAgICBjb25zdCB7Y2lyY3VtY2VudGVycywgZGVsYXVuYXk6IHtpbmVkZ2VzLCBoYWxmZWRnZXMsIHRyaWFuZ2xlc319ID0gdGhpcztcbiAgICBjb25zdCBlMCA9IGluZWRnZXNbaV07XG4gICAgaWYgKGUwID09PSAtMSkgcmV0dXJuIG51bGw7IC8vIGNvaW5jaWRlbnQgcG9pbnRcbiAgICBjb25zdCBwb2ludHMgPSBbXTtcbiAgICBsZXQgZSA9IGUwO1xuICAgIGRvIHtcbiAgICAgIGNvbnN0IHQgPSBNYXRoLmZsb29yKGUgLyAzKTtcbiAgICAgIHBvaW50cy5wdXNoKGNpcmN1bWNlbnRlcnNbdCAqIDJdLCBjaXJjdW1jZW50ZXJzW3QgKiAyICsgMV0pO1xuICAgICAgZSA9IGUgJSAzID09PSAyID8gZSAtIDIgOiBlICsgMTtcbiAgICAgIGlmICh0cmlhbmdsZXNbZV0gIT09IGkpIGJyZWFrOyAvLyBiYWQgdHJpYW5ndWxhdGlvblxuICAgICAgZSA9IGhhbGZlZGdlc1tlXTtcbiAgICB9IHdoaWxlIChlICE9PSBlMCAmJiBlICE9PSAtMSk7XG4gICAgcmV0dXJuIHBvaW50cztcbiAgfVxuICBfY2xpcChpKSB7XG4gICAgLy8gZGVnZW5lcmF0ZSBjYXNlICgxIHZhbGlkIHBvaW50OiByZXR1cm4gdGhlIGJveClcbiAgICBpZiAoaSA9PT0gMCAmJiB0aGlzLmRlbGF1bmF5Lmh1bGwubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gW3RoaXMueG1heCwgdGhpcy55bWluLCB0aGlzLnhtYXgsIHRoaXMueW1heCwgdGhpcy54bWluLCB0aGlzLnltYXgsIHRoaXMueG1pbiwgdGhpcy55bWluXTtcbiAgICB9XG4gICAgY29uc3QgcG9pbnRzID0gdGhpcy5fY2VsbChpKTtcbiAgICBpZiAocG9pbnRzID09PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCB7dmVjdG9yczogVn0gPSB0aGlzO1xuICAgIGNvbnN0IHYgPSBpICogNDtcbiAgICByZXR1cm4gdGhpcy5fc2ltcGxpZnkoVlt2XSB8fCBWW3YgKyAxXVxuICAgICAgICA/IHRoaXMuX2NsaXBJbmZpbml0ZShpLCBwb2ludHMsIFZbdl0sIFZbdiArIDFdLCBWW3YgKyAyXSwgVlt2ICsgM10pXG4gICAgICAgIDogdGhpcy5fY2xpcEZpbml0ZShpLCBwb2ludHMpKTtcbiAgfVxuICBfY2xpcEZpbml0ZShpLCBwb2ludHMpIHtcbiAgICBjb25zdCBuID0gcG9pbnRzLmxlbmd0aDtcbiAgICBsZXQgUCA9IG51bGw7XG4gICAgbGV0IHgwLCB5MCwgeDEgPSBwb2ludHNbbiAtIDJdLCB5MSA9IHBvaW50c1tuIC0gMV07XG4gICAgbGV0IGMwLCBjMSA9IHRoaXMuX3JlZ2lvbmNvZGUoeDEsIHkxKTtcbiAgICBsZXQgZTAsIGUxID0gMDtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IG47IGogKz0gMikge1xuICAgICAgeDAgPSB4MSwgeTAgPSB5MSwgeDEgPSBwb2ludHNbal0sIHkxID0gcG9pbnRzW2ogKyAxXTtcbiAgICAgIGMwID0gYzEsIGMxID0gdGhpcy5fcmVnaW9uY29kZSh4MSwgeTEpO1xuICAgICAgaWYgKGMwID09PSAwICYmIGMxID09PSAwKSB7XG4gICAgICAgIGUwID0gZTEsIGUxID0gMDtcbiAgICAgICAgaWYgKFApIFAucHVzaCh4MSwgeTEpO1xuICAgICAgICBlbHNlIFAgPSBbeDEsIHkxXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBTLCBzeDAsIHN5MCwgc3gxLCBzeTE7XG4gICAgICAgIGlmIChjMCA9PT0gMCkge1xuICAgICAgICAgIGlmICgoUyA9IHRoaXMuX2NsaXBTZWdtZW50KHgwLCB5MCwgeDEsIHkxLCBjMCwgYzEpKSA9PT0gbnVsbCkgY29udGludWU7XG4gICAgICAgICAgW3N4MCwgc3kwLCBzeDEsIHN5MV0gPSBTO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICgoUyA9IHRoaXMuX2NsaXBTZWdtZW50KHgxLCB5MSwgeDAsIHkwLCBjMSwgYzApKSA9PT0gbnVsbCkgY29udGludWU7XG4gICAgICAgICAgW3N4MSwgc3kxLCBzeDAsIHN5MF0gPSBTO1xuICAgICAgICAgIGUwID0gZTEsIGUxID0gdGhpcy5fZWRnZWNvZGUoc3gwLCBzeTApO1xuICAgICAgICAgIGlmIChlMCAmJiBlMSkgdGhpcy5fZWRnZShpLCBlMCwgZTEsIFAsIFAubGVuZ3RoKTtcbiAgICAgICAgICBpZiAoUCkgUC5wdXNoKHN4MCwgc3kwKTtcbiAgICAgICAgICBlbHNlIFAgPSBbc3gwLCBzeTBdO1xuICAgICAgICB9XG4gICAgICAgIGUwID0gZTEsIGUxID0gdGhpcy5fZWRnZWNvZGUoc3gxLCBzeTEpO1xuICAgICAgICBpZiAoZTAgJiYgZTEpIHRoaXMuX2VkZ2UoaSwgZTAsIGUxLCBQLCBQLmxlbmd0aCk7XG4gICAgICAgIGlmIChQKSBQLnB1c2goc3gxLCBzeTEpO1xuICAgICAgICBlbHNlIFAgPSBbc3gxLCBzeTFdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoUCkge1xuICAgICAgZTAgPSBlMSwgZTEgPSB0aGlzLl9lZGdlY29kZShQWzBdLCBQWzFdKTtcbiAgICAgIGlmIChlMCAmJiBlMSkgdGhpcy5fZWRnZShpLCBlMCwgZTEsIFAsIFAubGVuZ3RoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuY29udGFpbnMoaSwgKHRoaXMueG1pbiArIHRoaXMueG1heCkgLyAyLCAodGhpcy55bWluICsgdGhpcy55bWF4KSAvIDIpKSB7XG4gICAgICByZXR1cm4gW3RoaXMueG1heCwgdGhpcy55bWluLCB0aGlzLnhtYXgsIHRoaXMueW1heCwgdGhpcy54bWluLCB0aGlzLnltYXgsIHRoaXMueG1pbiwgdGhpcy55bWluXTtcbiAgICB9XG4gICAgcmV0dXJuIFA7XG4gIH1cbiAgX2NsaXBTZWdtZW50KHgwLCB5MCwgeDEsIHkxLCBjMCwgYzEpIHtcbiAgICAvLyBmb3IgbW9yZSByb2J1c3RuZXNzLCBhbHdheXMgY29uc2lkZXIgdGhlIHNlZ21lbnQgaW4gdGhlIHNhbWUgb3JkZXJcbiAgICBjb25zdCBmbGlwID0gYzAgPCBjMTtcbiAgICBpZiAoZmxpcCkgW3gwLCB5MCwgeDEsIHkxLCBjMCwgYzFdID0gW3gxLCB5MSwgeDAsIHkwLCBjMSwgYzBdO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAoYzAgPT09IDAgJiYgYzEgPT09IDApIHJldHVybiBmbGlwID8gW3gxLCB5MSwgeDAsIHkwXSA6IFt4MCwgeTAsIHgxLCB5MV07XG4gICAgICBpZiAoYzAgJiBjMSkgcmV0dXJuIG51bGw7XG4gICAgICBsZXQgeCwgeSwgYyA9IGMwIHx8IGMxO1xuICAgICAgaWYgKGMgJiAwYjEwMDApIHggPSB4MCArICh4MSAtIHgwKSAqICh0aGlzLnltYXggLSB5MCkgLyAoeTEgLSB5MCksIHkgPSB0aGlzLnltYXg7XG4gICAgICBlbHNlIGlmIChjICYgMGIwMTAwKSB4ID0geDAgKyAoeDEgLSB4MCkgKiAodGhpcy55bWluIC0geTApIC8gKHkxIC0geTApLCB5ID0gdGhpcy55bWluO1xuICAgICAgZWxzZSBpZiAoYyAmIDBiMDAxMCkgeSA9IHkwICsgKHkxIC0geTApICogKHRoaXMueG1heCAtIHgwKSAvICh4MSAtIHgwKSwgeCA9IHRoaXMueG1heDtcbiAgICAgIGVsc2UgeSA9IHkwICsgKHkxIC0geTApICogKHRoaXMueG1pbiAtIHgwKSAvICh4MSAtIHgwKSwgeCA9IHRoaXMueG1pbjtcbiAgICAgIGlmIChjMCkgeDAgPSB4LCB5MCA9IHksIGMwID0gdGhpcy5fcmVnaW9uY29kZSh4MCwgeTApO1xuICAgICAgZWxzZSB4MSA9IHgsIHkxID0geSwgYzEgPSB0aGlzLl9yZWdpb25jb2RlKHgxLCB5MSk7XG4gICAgfVxuICB9XG4gIF9jbGlwSW5maW5pdGUoaSwgcG9pbnRzLCB2eDAsIHZ5MCwgdnhuLCB2eW4pIHtcbiAgICBsZXQgUCA9IEFycmF5LmZyb20ocG9pbnRzKSwgcDtcbiAgICBpZiAocCA9IHRoaXMuX3Byb2plY3QoUFswXSwgUFsxXSwgdngwLCB2eTApKSBQLnVuc2hpZnQocFswXSwgcFsxXSk7XG4gICAgaWYgKHAgPSB0aGlzLl9wcm9qZWN0KFBbUC5sZW5ndGggLSAyXSwgUFtQLmxlbmd0aCAtIDFdLCB2eG4sIHZ5bikpIFAucHVzaChwWzBdLCBwWzFdKTtcbiAgICBpZiAoUCA9IHRoaXMuX2NsaXBGaW5pdGUoaSwgUCkpIHtcbiAgICAgIGZvciAobGV0IGogPSAwLCBuID0gUC5sZW5ndGgsIGMwLCBjMSA9IHRoaXMuX2VkZ2Vjb2RlKFBbbiAtIDJdLCBQW24gLSAxXSk7IGogPCBuOyBqICs9IDIpIHtcbiAgICAgICAgYzAgPSBjMSwgYzEgPSB0aGlzLl9lZGdlY29kZShQW2pdLCBQW2ogKyAxXSk7XG4gICAgICAgIGlmIChjMCAmJiBjMSkgaiA9IHRoaXMuX2VkZ2UoaSwgYzAsIGMxLCBQLCBqKSwgbiA9IFAubGVuZ3RoO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5jb250YWlucyhpLCAodGhpcy54bWluICsgdGhpcy54bWF4KSAvIDIsICh0aGlzLnltaW4gKyB0aGlzLnltYXgpIC8gMikpIHtcbiAgICAgIFAgPSBbdGhpcy54bWluLCB0aGlzLnltaW4sIHRoaXMueG1heCwgdGhpcy55bWluLCB0aGlzLnhtYXgsIHRoaXMueW1heCwgdGhpcy54bWluLCB0aGlzLnltYXhdO1xuICAgIH1cbiAgICByZXR1cm4gUDtcbiAgfVxuICBfZWRnZShpLCBlMCwgZTEsIFAsIGopIHtcbiAgICB3aGlsZSAoZTAgIT09IGUxKSB7XG4gICAgICBsZXQgeCwgeTtcbiAgICAgIHN3aXRjaCAoZTApIHtcbiAgICAgICAgY2FzZSAwYjAxMDE6IGUwID0gMGIwMTAwOyBjb250aW51ZTsgLy8gdG9wLWxlZnRcbiAgICAgICAgY2FzZSAwYjAxMDA6IGUwID0gMGIwMTEwLCB4ID0gdGhpcy54bWF4LCB5ID0gdGhpcy55bWluOyBicmVhazsgLy8gdG9wXG4gICAgICAgIGNhc2UgMGIwMTEwOiBlMCA9IDBiMDAxMDsgY29udGludWU7IC8vIHRvcC1yaWdodFxuICAgICAgICBjYXNlIDBiMDAxMDogZTAgPSAwYjEwMTAsIHggPSB0aGlzLnhtYXgsIHkgPSB0aGlzLnltYXg7IGJyZWFrOyAvLyByaWdodFxuICAgICAgICBjYXNlIDBiMTAxMDogZTAgPSAwYjEwMDA7IGNvbnRpbnVlOyAvLyBib3R0b20tcmlnaHRcbiAgICAgICAgY2FzZSAwYjEwMDA6IGUwID0gMGIxMDAxLCB4ID0gdGhpcy54bWluLCB5ID0gdGhpcy55bWF4OyBicmVhazsgLy8gYm90dG9tXG4gICAgICAgIGNhc2UgMGIxMDAxOiBlMCA9IDBiMDAwMTsgY29udGludWU7IC8vIGJvdHRvbS1sZWZ0XG4gICAgICAgIGNhc2UgMGIwMDAxOiBlMCA9IDBiMDEwMSwgeCA9IHRoaXMueG1pbiwgeSA9IHRoaXMueW1pbjsgYnJlYWs7IC8vIGxlZnRcbiAgICAgIH1cbiAgICAgIC8vIE5vdGU6IHRoaXMgaW1wbGljaXRseSBjaGVja3MgZm9yIG91dCBvZiBib3VuZHM6IGlmIFBbal0gb3IgUFtqKzFdIGFyZVxuICAgICAgLy8gdW5kZWZpbmVkLCB0aGUgY29uZGl0aW9uYWwgc3RhdGVtZW50IHdpbGwgYmUgZXhlY3V0ZWQuXG4gICAgICBpZiAoKFBbal0gIT09IHggfHwgUFtqICsgMV0gIT09IHkpICYmIHRoaXMuY29udGFpbnMoaSwgeCwgeSkpIHtcbiAgICAgICAgUC5zcGxpY2UoaiwgMCwgeCwgeSksIGogKz0gMjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGo7XG4gIH1cbiAgX3Byb2plY3QoeDAsIHkwLCB2eCwgdnkpIHtcbiAgICBsZXQgdCA9IEluZmluaXR5LCBjLCB4LCB5O1xuICAgIGlmICh2eSA8IDApIHsgLy8gdG9wXG4gICAgICBpZiAoeTAgPD0gdGhpcy55bWluKSByZXR1cm4gbnVsbDtcbiAgICAgIGlmICgoYyA9ICh0aGlzLnltaW4gLSB5MCkgLyB2eSkgPCB0KSB5ID0gdGhpcy55bWluLCB4ID0geDAgKyAodCA9IGMpICogdng7XG4gICAgfSBlbHNlIGlmICh2eSA+IDApIHsgLy8gYm90dG9tXG4gICAgICBpZiAoeTAgPj0gdGhpcy55bWF4KSByZXR1cm4gbnVsbDtcbiAgICAgIGlmICgoYyA9ICh0aGlzLnltYXggLSB5MCkgLyB2eSkgPCB0KSB5ID0gdGhpcy55bWF4LCB4ID0geDAgKyAodCA9IGMpICogdng7XG4gICAgfVxuICAgIGlmICh2eCA+IDApIHsgLy8gcmlnaHRcbiAgICAgIGlmICh4MCA+PSB0aGlzLnhtYXgpIHJldHVybiBudWxsO1xuICAgICAgaWYgKChjID0gKHRoaXMueG1heCAtIHgwKSAvIHZ4KSA8IHQpIHggPSB0aGlzLnhtYXgsIHkgPSB5MCArICh0ID0gYykgKiB2eTtcbiAgICB9IGVsc2UgaWYgKHZ4IDwgMCkgeyAvLyBsZWZ0XG4gICAgICBpZiAoeDAgPD0gdGhpcy54bWluKSByZXR1cm4gbnVsbDtcbiAgICAgIGlmICgoYyA9ICh0aGlzLnhtaW4gLSB4MCkgLyB2eCkgPCB0KSB4ID0gdGhpcy54bWluLCB5ID0geTAgKyAodCA9IGMpICogdnk7XG4gICAgfVxuICAgIHJldHVybiBbeCwgeV07XG4gIH1cbiAgX2VkZ2Vjb2RlKHgsIHkpIHtcbiAgICByZXR1cm4gKHggPT09IHRoaXMueG1pbiA/IDBiMDAwMVxuICAgICAgICA6IHggPT09IHRoaXMueG1heCA/IDBiMDAxMCA6IDBiMDAwMClcbiAgICAgICAgfCAoeSA9PT0gdGhpcy55bWluID8gMGIwMTAwXG4gICAgICAgIDogeSA9PT0gdGhpcy55bWF4ID8gMGIxMDAwIDogMGIwMDAwKTtcbiAgfVxuICBfcmVnaW9uY29kZSh4LCB5KSB7XG4gICAgcmV0dXJuICh4IDwgdGhpcy54bWluID8gMGIwMDAxXG4gICAgICAgIDogeCA+IHRoaXMueG1heCA/IDBiMDAxMCA6IDBiMDAwMClcbiAgICAgICAgfCAoeSA8IHRoaXMueW1pbiA/IDBiMDEwMFxuICAgICAgICA6IHkgPiB0aGlzLnltYXggPyAwYjEwMDAgOiAwYjAwMDApO1xuICB9XG4gIF9zaW1wbGlmeShQKSB7XG4gICAgaWYgKFAgJiYgUC5sZW5ndGggPiA0KSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IFAubGVuZ3RoOyBpKz0gMikge1xuICAgICAgICBjb25zdCBqID0gKGkgKyAyKSAlIFAubGVuZ3RoLCBrID0gKGkgKyA0KSAlIFAubGVuZ3RoO1xuICAgICAgICBpZiAoUFtpXSA9PT0gUFtqXSAmJiBQW2pdID09PSBQW2tdIHx8IFBbaSArIDFdID09PSBQW2ogKyAxXSAmJiBQW2ogKyAxXSA9PT0gUFtrICsgMV0pIHtcbiAgICAgICAgICBQLnNwbGljZShqLCAyKSwgaSAtPSAyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIVAubGVuZ3RoKSBQID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIFA7XG4gIH1cbn1cbiIsImltcG9ydCBEZWxhdW5hdG9yIGZyb20gXCJkZWxhdW5hdG9yXCI7XG5pbXBvcnQgUGF0aCBmcm9tIFwiLi9wYXRoLmpzXCI7XG5pbXBvcnQgUG9seWdvbiBmcm9tIFwiLi9wb2x5Z29uLmpzXCI7XG5pbXBvcnQgVm9yb25vaSBmcm9tIFwiLi92b3Jvbm9pLmpzXCI7XG5cbmNvbnN0IHRhdSA9IDIgKiBNYXRoLlBJLCBwb3cgPSBNYXRoLnBvdztcblxuZnVuY3Rpb24gcG9pbnRYKHApIHtcbiAgcmV0dXJuIHBbMF07XG59XG5cbmZ1bmN0aW9uIHBvaW50WShwKSB7XG4gIHJldHVybiBwWzFdO1xufVxuXG4vLyBBIHRyaWFuZ3VsYXRpb24gaXMgY29sbGluZWFyIGlmIGFsbCBpdHMgdHJpYW5nbGVzIGhhdmUgYSBub24tbnVsbCBhcmVhXG5mdW5jdGlvbiBjb2xsaW5lYXIoZCkge1xuICBjb25zdCB7dHJpYW5nbGVzLCBjb29yZHN9ID0gZDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmlhbmdsZXMubGVuZ3RoOyBpICs9IDMpIHtcbiAgICBjb25zdCBhID0gMiAqIHRyaWFuZ2xlc1tpXSxcbiAgICAgICAgICBiID0gMiAqIHRyaWFuZ2xlc1tpICsgMV0sXG4gICAgICAgICAgYyA9IDIgKiB0cmlhbmdsZXNbaSArIDJdLFxuICAgICAgICAgIGNyb3NzID0gKGNvb3Jkc1tjXSAtIGNvb3Jkc1thXSkgKiAoY29vcmRzW2IgKyAxXSAtIGNvb3Jkc1thICsgMV0pXG4gICAgICAgICAgICAgICAgLSAoY29vcmRzW2JdIC0gY29vcmRzW2FdKSAqIChjb29yZHNbYyArIDFdIC0gY29vcmRzW2EgKyAxXSk7XG4gICAgaWYgKGNyb3NzID4gMWUtMTApIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gaml0dGVyKHgsIHksIHIpIHtcbiAgcmV0dXJuIFt4ICsgTWF0aC5zaW4oeCArIHkpICogciwgeSArIE1hdGguY29zKHggLSB5KSAqIHJdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZWxhdW5heSB7XG4gIHN0YXRpYyBmcm9tKHBvaW50cywgZnggPSBwb2ludFgsIGZ5ID0gcG9pbnRZLCB0aGF0KSB7XG4gICAgcmV0dXJuIG5ldyBEZWxhdW5heShcImxlbmd0aFwiIGluIHBvaW50c1xuICAgICAgICA/IGZsYXRBcnJheShwb2ludHMsIGZ4LCBmeSwgdGhhdClcbiAgICAgICAgOiBGbG9hdDY0QXJyYXkuZnJvbShmbGF0SXRlcmFibGUocG9pbnRzLCBmeCwgZnksIHRoYXQpKSk7XG4gIH1cbiAgY29uc3RydWN0b3IocG9pbnRzKSB7XG4gICAgdGhpcy5fZGVsYXVuYXRvciA9IG5ldyBEZWxhdW5hdG9yKHBvaW50cyk7XG4gICAgdGhpcy5pbmVkZ2VzID0gbmV3IEludDMyQXJyYXkocG9pbnRzLmxlbmd0aCAvIDIpO1xuICAgIHRoaXMuX2h1bGxJbmRleCA9IG5ldyBJbnQzMkFycmF5KHBvaW50cy5sZW5ndGggLyAyKTtcbiAgICB0aGlzLnBvaW50cyA9IHRoaXMuX2RlbGF1bmF0b3IuY29vcmRzO1xuICAgIHRoaXMuX2luaXQoKTtcbiAgfVxuICB1cGRhdGUoKSB7XG4gICAgdGhpcy5fZGVsYXVuYXRvci51cGRhdGUoKTtcbiAgICB0aGlzLl9pbml0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgX2luaXQoKSB7XG4gICAgY29uc3QgZCA9IHRoaXMuX2RlbGF1bmF0b3IsIHBvaW50cyA9IHRoaXMucG9pbnRzO1xuXG4gICAgLy8gY2hlY2sgZm9yIGNvbGxpbmVhclxuICAgIGlmIChkLmh1bGwgJiYgZC5odWxsLmxlbmd0aCA+IDIgJiYgY29sbGluZWFyKGQpKSB7XG4gICAgICB0aGlzLmNvbGxpbmVhciA9IEludDMyQXJyYXkuZnJvbSh7bGVuZ3RoOiBwb2ludHMubGVuZ3RoLzJ9LCAoXyxpKSA9PiBpKVxuICAgICAgICAuc29ydCgoaSwgaikgPT4gcG9pbnRzWzIgKiBpXSAtIHBvaW50c1syICogal0gfHwgcG9pbnRzWzIgKiBpICsgMV0gLSBwb2ludHNbMiAqIGogKyAxXSk7IC8vIGZvciBleGFjdCBuZWlnaGJvcnNcbiAgICAgIGNvbnN0IGUgPSB0aGlzLmNvbGxpbmVhclswXSwgZiA9IHRoaXMuY29sbGluZWFyW3RoaXMuY29sbGluZWFyLmxlbmd0aCAtIDFdLFxuICAgICAgICBib3VuZHMgPSBbIHBvaW50c1syICogZV0sIHBvaW50c1syICogZSArIDFdLCBwb2ludHNbMiAqIGZdLCBwb2ludHNbMiAqIGYgKyAxXSBdLFxuICAgICAgICByID0gMWUtOCAqIE1hdGguaHlwb3QoYm91bmRzWzNdIC0gYm91bmRzWzFdLCBib3VuZHNbMl0gLSBib3VuZHNbMF0pO1xuICAgICAgZm9yIChsZXQgaSA9IDAsIG4gPSBwb2ludHMubGVuZ3RoIC8gMjsgaSA8IG47ICsraSkge1xuICAgICAgICBjb25zdCBwID0gaml0dGVyKHBvaW50c1syICogaV0sIHBvaW50c1syICogaSArIDFdLCByKTtcbiAgICAgICAgcG9pbnRzWzIgKiBpXSA9IHBbMF07XG4gICAgICAgIHBvaW50c1syICogaSArIDFdID0gcFsxXTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2RlbGF1bmF0b3IgPSBuZXcgRGVsYXVuYXRvcihwb2ludHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdGhpcy5jb2xsaW5lYXI7XG4gICAgfVxuXG4gICAgY29uc3QgaGFsZmVkZ2VzID0gdGhpcy5oYWxmZWRnZXMgPSB0aGlzLl9kZWxhdW5hdG9yLmhhbGZlZGdlcztcbiAgICBjb25zdCBodWxsID0gdGhpcy5odWxsID0gdGhpcy5fZGVsYXVuYXRvci5odWxsO1xuICAgIGNvbnN0IHRyaWFuZ2xlcyA9IHRoaXMudHJpYW5nbGVzID0gdGhpcy5fZGVsYXVuYXRvci50cmlhbmdsZXM7XG4gICAgY29uc3QgaW5lZGdlcyA9IHRoaXMuaW5lZGdlcy5maWxsKC0xKTtcbiAgICBjb25zdCBodWxsSW5kZXggPSB0aGlzLl9odWxsSW5kZXguZmlsbCgtMSk7XG5cbiAgICAvLyBDb21wdXRlIGFuIGluZGV4IGZyb20gZWFjaCBwb2ludCB0byBhbiAoYXJiaXRyYXJ5KSBpbmNvbWluZyBoYWxmZWRnZVxuICAgIC8vIFVzZWQgdG8gZ2l2ZSB0aGUgZmlyc3QgbmVpZ2hib3Igb2YgZWFjaCBwb2ludDsgZm9yIHRoaXMgcmVhc29uLFxuICAgIC8vIG9uIHRoZSBodWxsIHdlIGdpdmUgcHJpb3JpdHkgdG8gZXh0ZXJpb3IgaGFsZmVkZ2VzXG4gICAgZm9yIChsZXQgZSA9IDAsIG4gPSBoYWxmZWRnZXMubGVuZ3RoOyBlIDwgbjsgKytlKSB7XG4gICAgICBjb25zdCBwID0gdHJpYW5nbGVzW2UgJSAzID09PSAyID8gZSAtIDIgOiBlICsgMV07XG4gICAgICBpZiAoaGFsZmVkZ2VzW2VdID09PSAtMSB8fCBpbmVkZ2VzW3BdID09PSAtMSkgaW5lZGdlc1twXSA9IGU7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwLCBuID0gaHVsbC5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgIGh1bGxJbmRleFtodWxsW2ldXSA9IGk7XG4gICAgfVxuXG4gICAgLy8gZGVnZW5lcmF0ZSBjYXNlOiAxIG9yIDIgKGRpc3RpbmN0KSBwb2ludHNcbiAgICBpZiAoaHVsbC5sZW5ndGggPD0gMiAmJiBodWxsLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMudHJpYW5nbGVzID0gbmV3IEludDMyQXJyYXkoMykuZmlsbCgtMSk7XG4gICAgICB0aGlzLmhhbGZlZGdlcyA9IG5ldyBJbnQzMkFycmF5KDMpLmZpbGwoLTEpO1xuICAgICAgdGhpcy50cmlhbmdsZXNbMF0gPSBodWxsWzBdO1xuICAgICAgaW5lZGdlc1todWxsWzBdXSA9IDE7XG4gICAgICBpZiAoaHVsbC5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgaW5lZGdlc1todWxsWzFdXSA9IDA7XG4gICAgICAgIHRoaXMudHJpYW5nbGVzWzFdID0gaHVsbFsxXTtcbiAgICAgICAgdGhpcy50cmlhbmdsZXNbMl0gPSBodWxsWzFdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICB2b3Jvbm9pKGJvdW5kcykge1xuICAgIHJldHVybiBuZXcgVm9yb25vaSh0aGlzLCBib3VuZHMpO1xuICB9XG4gICpuZWlnaGJvcnMoaSkge1xuICAgIGNvbnN0IHtpbmVkZ2VzLCBodWxsLCBfaHVsbEluZGV4LCBoYWxmZWRnZXMsIHRyaWFuZ2xlcywgY29sbGluZWFyfSA9IHRoaXM7XG5cbiAgICAvLyBkZWdlbmVyYXRlIGNhc2Ugd2l0aCBzZXZlcmFsIGNvbGxpbmVhciBwb2ludHNcbiAgICBpZiAoY29sbGluZWFyKSB7XG4gICAgICBjb25zdCBsID0gY29sbGluZWFyLmluZGV4T2YoaSk7XG4gICAgICBpZiAobCA+IDApIHlpZWxkIGNvbGxpbmVhcltsIC0gMV07XG4gICAgICBpZiAobCA8IGNvbGxpbmVhci5sZW5ndGggLSAxKSB5aWVsZCBjb2xsaW5lYXJbbCArIDFdO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGUwID0gaW5lZGdlc1tpXTtcbiAgICBpZiAoZTAgPT09IC0xKSByZXR1cm47IC8vIGNvaW5jaWRlbnQgcG9pbnRcbiAgICBsZXQgZSA9IGUwLCBwMCA9IC0xO1xuICAgIGRvIHtcbiAgICAgIHlpZWxkIHAwID0gdHJpYW5nbGVzW2VdO1xuICAgICAgZSA9IGUgJSAzID09PSAyID8gZSAtIDIgOiBlICsgMTtcbiAgICAgIGlmICh0cmlhbmdsZXNbZV0gIT09IGkpIHJldHVybjsgLy8gYmFkIHRyaWFuZ3VsYXRpb25cbiAgICAgIGUgPSBoYWxmZWRnZXNbZV07XG4gICAgICBpZiAoZSA9PT0gLTEpIHtcbiAgICAgICAgY29uc3QgcCA9IGh1bGxbKF9odWxsSW5kZXhbaV0gKyAxKSAlIGh1bGwubGVuZ3RoXTtcbiAgICAgICAgaWYgKHAgIT09IHAwKSB5aWVsZCBwO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfSB3aGlsZSAoZSAhPT0gZTApO1xuICB9XG4gIGZpbmQoeCwgeSwgaSA9IDApIHtcbiAgICBpZiAoKHggPSAreCwgeCAhPT0geCkgfHwgKHkgPSAreSwgeSAhPT0geSkpIHJldHVybiAtMTtcbiAgICBjb25zdCBpMCA9IGk7XG4gICAgbGV0IGM7XG4gICAgd2hpbGUgKChjID0gdGhpcy5fc3RlcChpLCB4LCB5KSkgPj0gMCAmJiBjICE9PSBpICYmIGMgIT09IGkwKSBpID0gYztcbiAgICByZXR1cm4gYztcbiAgfVxuICBfc3RlcChpLCB4LCB5KSB7XG4gICAgY29uc3Qge2luZWRnZXMsIGh1bGwsIF9odWxsSW5kZXgsIGhhbGZlZGdlcywgdHJpYW5nbGVzLCBwb2ludHN9ID0gdGhpcztcbiAgICBpZiAoaW5lZGdlc1tpXSA9PT0gLTEgfHwgIXBvaW50cy5sZW5ndGgpIHJldHVybiAoaSArIDEpICUgKHBvaW50cy5sZW5ndGggPj4gMSk7XG4gICAgbGV0IGMgPSBpO1xuICAgIGxldCBkYyA9IHBvdyh4IC0gcG9pbnRzW2kgKiAyXSwgMikgKyBwb3coeSAtIHBvaW50c1tpICogMiArIDFdLCAyKTtcbiAgICBjb25zdCBlMCA9IGluZWRnZXNbaV07XG4gICAgbGV0IGUgPSBlMDtcbiAgICBkbyB7XG4gICAgICBsZXQgdCA9IHRyaWFuZ2xlc1tlXTtcbiAgICAgIGNvbnN0IGR0ID0gcG93KHggLSBwb2ludHNbdCAqIDJdLCAyKSArIHBvdyh5IC0gcG9pbnRzW3QgKiAyICsgMV0sIDIpO1xuICAgICAgaWYgKGR0IDwgZGMpIGRjID0gZHQsIGMgPSB0O1xuICAgICAgZSA9IGUgJSAzID09PSAyID8gZSAtIDIgOiBlICsgMTtcbiAgICAgIGlmICh0cmlhbmdsZXNbZV0gIT09IGkpIGJyZWFrOyAvLyBiYWQgdHJpYW5ndWxhdGlvblxuICAgICAgZSA9IGhhbGZlZGdlc1tlXTtcbiAgICAgIGlmIChlID09PSAtMSkge1xuICAgICAgICBlID0gaHVsbFsoX2h1bGxJbmRleFtpXSArIDEpICUgaHVsbC5sZW5ndGhdO1xuICAgICAgICBpZiAoZSAhPT0gdCkge1xuICAgICAgICAgIGlmIChwb3coeCAtIHBvaW50c1tlICogMl0sIDIpICsgcG93KHkgLSBwb2ludHNbZSAqIDIgKyAxXSwgMikgPCBkYykgcmV0dXJuIGU7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSB3aGlsZSAoZSAhPT0gZTApO1xuICAgIHJldHVybiBjO1xuICB9XG4gIHJlbmRlcihjb250ZXh0KSB7XG4gICAgY29uc3QgYnVmZmVyID0gY29udGV4dCA9PSBudWxsID8gY29udGV4dCA9IG5ldyBQYXRoIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IHtwb2ludHMsIGhhbGZlZGdlcywgdHJpYW5nbGVzfSA9IHRoaXM7XG4gICAgZm9yIChsZXQgaSA9IDAsIG4gPSBoYWxmZWRnZXMubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICBjb25zdCBqID0gaGFsZmVkZ2VzW2ldO1xuICAgICAgaWYgKGogPCBpKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IHRpID0gdHJpYW5nbGVzW2ldICogMjtcbiAgICAgIGNvbnN0IHRqID0gdHJpYW5nbGVzW2pdICogMjtcbiAgICAgIGNvbnRleHQubW92ZVRvKHBvaW50c1t0aV0sIHBvaW50c1t0aSArIDFdKTtcbiAgICAgIGNvbnRleHQubGluZVRvKHBvaW50c1t0al0sIHBvaW50c1t0aiArIDFdKTtcbiAgICB9XG4gICAgdGhpcy5yZW5kZXJIdWxsKGNvbnRleHQpO1xuICAgIHJldHVybiBidWZmZXIgJiYgYnVmZmVyLnZhbHVlKCk7XG4gIH1cbiAgcmVuZGVyUG9pbnRzKGNvbnRleHQsIHIpIHtcbiAgICBpZiAociA9PT0gdW5kZWZpbmVkICYmICghY29udGV4dCB8fCB0eXBlb2YgY29udGV4dC5tb3ZlVG8gIT09IFwiZnVuY3Rpb25cIikpIHIgPSBjb250ZXh0LCBjb250ZXh0ID0gbnVsbDtcbiAgICByID0gciA9PSB1bmRlZmluZWQgPyAyIDogK3I7XG4gICAgY29uc3QgYnVmZmVyID0gY29udGV4dCA9PSBudWxsID8gY29udGV4dCA9IG5ldyBQYXRoIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IHtwb2ludHN9ID0gdGhpcztcbiAgICBmb3IgKGxldCBpID0gMCwgbiA9IHBvaW50cy5sZW5ndGg7IGkgPCBuOyBpICs9IDIpIHtcbiAgICAgIGNvbnN0IHggPSBwb2ludHNbaV0sIHkgPSBwb2ludHNbaSArIDFdO1xuICAgICAgY29udGV4dC5tb3ZlVG8oeCArIHIsIHkpO1xuICAgICAgY29udGV4dC5hcmMoeCwgeSwgciwgMCwgdGF1KTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZmZlciAmJiBidWZmZXIudmFsdWUoKTtcbiAgfVxuICByZW5kZXJIdWxsKGNvbnRleHQpIHtcbiAgICBjb25zdCBidWZmZXIgPSBjb250ZXh0ID09IG51bGwgPyBjb250ZXh0ID0gbmV3IFBhdGggOiB1bmRlZmluZWQ7XG4gICAgY29uc3Qge2h1bGwsIHBvaW50c30gPSB0aGlzO1xuICAgIGNvbnN0IGggPSBodWxsWzBdICogMiwgbiA9IGh1bGwubGVuZ3RoO1xuICAgIGNvbnRleHQubW92ZVRvKHBvaW50c1toXSwgcG9pbnRzW2ggKyAxXSk7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBuOyArK2kpIHtcbiAgICAgIGNvbnN0IGggPSAyICogaHVsbFtpXTtcbiAgICAgIGNvbnRleHQubGluZVRvKHBvaW50c1toXSwgcG9pbnRzW2ggKyAxXSk7XG4gICAgfVxuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgcmV0dXJuIGJ1ZmZlciAmJiBidWZmZXIudmFsdWUoKTtcbiAgfVxuICBodWxsUG9seWdvbigpIHtcbiAgICBjb25zdCBwb2x5Z29uID0gbmV3IFBvbHlnb247XG4gICAgdGhpcy5yZW5kZXJIdWxsKHBvbHlnb24pO1xuICAgIHJldHVybiBwb2x5Z29uLnZhbHVlKCk7XG4gIH1cbiAgcmVuZGVyVHJpYW5nbGUoaSwgY29udGV4dCkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IGNvbnRleHQgPT0gbnVsbCA/IGNvbnRleHQgPSBuZXcgUGF0aCA6IHVuZGVmaW5lZDtcbiAgICBjb25zdCB7cG9pbnRzLCB0cmlhbmdsZXN9ID0gdGhpcztcbiAgICBjb25zdCB0MCA9IHRyaWFuZ2xlc1tpICo9IDNdICogMjtcbiAgICBjb25zdCB0MSA9IHRyaWFuZ2xlc1tpICsgMV0gKiAyO1xuICAgIGNvbnN0IHQyID0gdHJpYW5nbGVzW2kgKyAyXSAqIDI7XG4gICAgY29udGV4dC5tb3ZlVG8ocG9pbnRzW3QwXSwgcG9pbnRzW3QwICsgMV0pO1xuICAgIGNvbnRleHQubGluZVRvKHBvaW50c1t0MV0sIHBvaW50c1t0MSArIDFdKTtcbiAgICBjb250ZXh0LmxpbmVUbyhwb2ludHNbdDJdLCBwb2ludHNbdDIgKyAxXSk7XG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICByZXR1cm4gYnVmZmVyICYmIGJ1ZmZlci52YWx1ZSgpO1xuICB9XG4gICp0cmlhbmdsZVBvbHlnb25zKCkge1xuICAgIGNvbnN0IHt0cmlhbmdsZXN9ID0gdGhpcztcbiAgICBmb3IgKGxldCBpID0gMCwgbiA9IHRyaWFuZ2xlcy5sZW5ndGggLyAzOyBpIDwgbjsgKytpKSB7XG4gICAgICB5aWVsZCB0aGlzLnRyaWFuZ2xlUG9seWdvbihpKTtcbiAgICB9XG4gIH1cbiAgdHJpYW5nbGVQb2x5Z29uKGkpIHtcbiAgICBjb25zdCBwb2x5Z29uID0gbmV3IFBvbHlnb247XG4gICAgdGhpcy5yZW5kZXJUcmlhbmdsZShpLCBwb2x5Z29uKTtcbiAgICByZXR1cm4gcG9seWdvbi52YWx1ZSgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZsYXRBcnJheShwb2ludHMsIGZ4LCBmeSwgdGhhdCkge1xuICBjb25zdCBuID0gcG9pbnRzLmxlbmd0aDtcbiAgY29uc3QgYXJyYXkgPSBuZXcgRmxvYXQ2NEFycmF5KG4gKiAyKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICBjb25zdCBwID0gcG9pbnRzW2ldO1xuICAgIGFycmF5W2kgKiAyXSA9IGZ4LmNhbGwodGhhdCwgcCwgaSwgcG9pbnRzKTtcbiAgICBhcnJheVtpICogMiArIDFdID0gZnkuY2FsbCh0aGF0LCBwLCBpLCBwb2ludHMpO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuZnVuY3Rpb24qIGZsYXRJdGVyYWJsZShwb2ludHMsIGZ4LCBmeSwgdGhhdCkge1xuICBsZXQgaSA9IDA7XG4gIGZvciAoY29uc3QgcCBvZiBwb2ludHMpIHtcbiAgICB5aWVsZCBmeC5jYWxsKHRoYXQsIHAsIGksIHBvaW50cyk7XG4gICAgeWllbGQgZnkuY2FsbCh0aGF0LCBwLCBpLCBwb2ludHMpO1xuICAgICsraTtcbiAgfVxufVxuIiwiZXhwb3J0IHtkZWZhdWx0IGFzIERlbGF1bmF5fSBmcm9tIFwiLi9kZWxhdW5heS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIFZvcm9ub2l9IGZyb20gXCIuL3Zvcm9ub2kuanNcIjtcbiIsInZhciBFT0wgPSB7fSxcbiAgICBFT0YgPSB7fSxcbiAgICBRVU9URSA9IDM0LFxuICAgIE5FV0xJTkUgPSAxMCxcbiAgICBSRVRVUk4gPSAxMztcblxuZnVuY3Rpb24gb2JqZWN0Q29udmVydGVyKGNvbHVtbnMpIHtcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbihcImRcIiwgXCJyZXR1cm4ge1wiICsgY29sdW1ucy5tYXAoZnVuY3Rpb24obmFtZSwgaSkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShuYW1lKSArIFwiOiBkW1wiICsgaSArIFwiXSB8fCBcXFwiXFxcIlwiO1xuICB9KS5qb2luKFwiLFwiKSArIFwifVwiKTtcbn1cblxuZnVuY3Rpb24gY3VzdG9tQ29udmVydGVyKGNvbHVtbnMsIGYpIHtcbiAgdmFyIG9iamVjdCA9IG9iamVjdENvbnZlcnRlcihjb2x1bW5zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKHJvdywgaSkge1xuICAgIHJldHVybiBmKG9iamVjdChyb3cpLCBpLCBjb2x1bW5zKTtcbiAgfTtcbn1cblxuLy8gQ29tcHV0ZSB1bmlxdWUgY29sdW1ucyBpbiBvcmRlciBvZiBkaXNjb3ZlcnkuXG5mdW5jdGlvbiBpbmZlckNvbHVtbnMocm93cykge1xuICB2YXIgY29sdW1uU2V0ID0gT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICAgIGNvbHVtbnMgPSBbXTtcblxuICByb3dzLmZvckVhY2goZnVuY3Rpb24ocm93KSB7XG4gICAgZm9yICh2YXIgY29sdW1uIGluIHJvdykge1xuICAgICAgaWYgKCEoY29sdW1uIGluIGNvbHVtblNldCkpIHtcbiAgICAgICAgY29sdW1ucy5wdXNoKGNvbHVtblNldFtjb2x1bW5dID0gY29sdW1uKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBjb2x1bW5zO1xufVxuXG5mdW5jdGlvbiBwYWQodmFsdWUsIHdpZHRoKSB7XG4gIHZhciBzID0gdmFsdWUgKyBcIlwiLCBsZW5ndGggPSBzLmxlbmd0aDtcbiAgcmV0dXJuIGxlbmd0aCA8IHdpZHRoID8gbmV3IEFycmF5KHdpZHRoIC0gbGVuZ3RoICsgMSkuam9pbigwKSArIHMgOiBzO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRZZWFyKHllYXIpIHtcbiAgcmV0dXJuIHllYXIgPCAwID8gXCItXCIgKyBwYWQoLXllYXIsIDYpXG4gICAgOiB5ZWFyID4gOTk5OSA/IFwiK1wiICsgcGFkKHllYXIsIDYpXG4gICAgOiBwYWQoeWVhciwgNCk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERhdGUoZGF0ZSkge1xuICB2YXIgaG91cnMgPSBkYXRlLmdldFVUQ0hvdXJzKCksXG4gICAgICBtaW51dGVzID0gZGF0ZS5nZXRVVENNaW51dGVzKCksXG4gICAgICBzZWNvbmRzID0gZGF0ZS5nZXRVVENTZWNvbmRzKCksXG4gICAgICBtaWxsaXNlY29uZHMgPSBkYXRlLmdldFVUQ01pbGxpc2Vjb25kcygpO1xuICByZXR1cm4gaXNOYU4oZGF0ZSkgPyBcIkludmFsaWQgRGF0ZVwiXG4gICAgICA6IGZvcm1hdFllYXIoZGF0ZS5nZXRVVENGdWxsWWVhcigpLCA0KSArIFwiLVwiICsgcGFkKGRhdGUuZ2V0VVRDTW9udGgoKSArIDEsIDIpICsgXCItXCIgKyBwYWQoZGF0ZS5nZXRVVENEYXRlKCksIDIpXG4gICAgICArIChtaWxsaXNlY29uZHMgPyBcIlRcIiArIHBhZChob3VycywgMikgKyBcIjpcIiArIHBhZChtaW51dGVzLCAyKSArIFwiOlwiICsgcGFkKHNlY29uZHMsIDIpICsgXCIuXCIgKyBwYWQobWlsbGlzZWNvbmRzLCAzKSArIFwiWlwiXG4gICAgICA6IHNlY29uZHMgPyBcIlRcIiArIHBhZChob3VycywgMikgKyBcIjpcIiArIHBhZChtaW51dGVzLCAyKSArIFwiOlwiICsgcGFkKHNlY29uZHMsIDIpICsgXCJaXCJcbiAgICAgIDogbWludXRlcyB8fCBob3VycyA/IFwiVFwiICsgcGFkKGhvdXJzLCAyKSArIFwiOlwiICsgcGFkKG1pbnV0ZXMsIDIpICsgXCJaXCJcbiAgICAgIDogXCJcIik7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGRlbGltaXRlcikge1xuICB2YXIgcmVGb3JtYXQgPSBuZXcgUmVnRXhwKFwiW1xcXCJcIiArIGRlbGltaXRlciArIFwiXFxuXFxyXVwiKSxcbiAgICAgIERFTElNSVRFUiA9IGRlbGltaXRlci5jaGFyQ29kZUF0KDApO1xuXG4gIGZ1bmN0aW9uIHBhcnNlKHRleHQsIGYpIHtcbiAgICB2YXIgY29udmVydCwgY29sdW1ucywgcm93cyA9IHBhcnNlUm93cyh0ZXh0LCBmdW5jdGlvbihyb3csIGkpIHtcbiAgICAgIGlmIChjb252ZXJ0KSByZXR1cm4gY29udmVydChyb3csIGkgLSAxKTtcbiAgICAgIGNvbHVtbnMgPSByb3csIGNvbnZlcnQgPSBmID8gY3VzdG9tQ29udmVydGVyKHJvdywgZikgOiBvYmplY3RDb252ZXJ0ZXIocm93KTtcbiAgICB9KTtcbiAgICByb3dzLmNvbHVtbnMgPSBjb2x1bW5zIHx8IFtdO1xuICAgIHJldHVybiByb3dzO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VSb3dzKHRleHQsIGYpIHtcbiAgICB2YXIgcm93cyA9IFtdLCAvLyBvdXRwdXQgcm93c1xuICAgICAgICBOID0gdGV4dC5sZW5ndGgsXG4gICAgICAgIEkgPSAwLCAvLyBjdXJyZW50IGNoYXJhY3RlciBpbmRleFxuICAgICAgICBuID0gMCwgLy8gY3VycmVudCBsaW5lIG51bWJlclxuICAgICAgICB0LCAvLyBjdXJyZW50IHRva2VuXG4gICAgICAgIGVvZiA9IE4gPD0gMCwgLy8gY3VycmVudCB0b2tlbiBmb2xsb3dlZCBieSBFT0Y/XG4gICAgICAgIGVvbCA9IGZhbHNlOyAvLyBjdXJyZW50IHRva2VuIGZvbGxvd2VkIGJ5IEVPTD9cblxuICAgIC8vIFN0cmlwIHRoZSB0cmFpbGluZyBuZXdsaW5lLlxuICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoTiAtIDEpID09PSBORVdMSU5FKSAtLU47XG4gICAgaWYgKHRleHQuY2hhckNvZGVBdChOIC0gMSkgPT09IFJFVFVSTikgLS1OO1xuXG4gICAgZnVuY3Rpb24gdG9rZW4oKSB7XG4gICAgICBpZiAoZW9mKSByZXR1cm4gRU9GO1xuICAgICAgaWYgKGVvbCkgcmV0dXJuIGVvbCA9IGZhbHNlLCBFT0w7XG5cbiAgICAgIC8vIFVuZXNjYXBlIHF1b3Rlcy5cbiAgICAgIHZhciBpLCBqID0gSSwgYztcbiAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaikgPT09IFFVT1RFKSB7XG4gICAgICAgIHdoaWxlIChJKysgPCBOICYmIHRleHQuY2hhckNvZGVBdChJKSAhPT0gUVVPVEUgfHwgdGV4dC5jaGFyQ29kZUF0KCsrSSkgPT09IFFVT1RFKTtcbiAgICAgICAgaWYgKChpID0gSSkgPj0gTikgZW9mID0gdHJ1ZTtcbiAgICAgICAgZWxzZSBpZiAoKGMgPSB0ZXh0LmNoYXJDb2RlQXQoSSsrKSkgPT09IE5FV0xJTkUpIGVvbCA9IHRydWU7XG4gICAgICAgIGVsc2UgaWYgKGMgPT09IFJFVFVSTikgeyBlb2wgPSB0cnVlOyBpZiAodGV4dC5jaGFyQ29kZUF0KEkpID09PSBORVdMSU5FKSArK0k7IH1cbiAgICAgICAgcmV0dXJuIHRleHQuc2xpY2UoaiArIDEsIGkgLSAxKS5yZXBsYWNlKC9cIlwiL2csIFwiXFxcIlwiKTtcbiAgICAgIH1cblxuICAgICAgLy8gRmluZCBuZXh0IGRlbGltaXRlciBvciBuZXdsaW5lLlxuICAgICAgd2hpbGUgKEkgPCBOKSB7XG4gICAgICAgIGlmICgoYyA9IHRleHQuY2hhckNvZGVBdChpID0gSSsrKSkgPT09IE5FV0xJTkUpIGVvbCA9IHRydWU7XG4gICAgICAgIGVsc2UgaWYgKGMgPT09IFJFVFVSTikgeyBlb2wgPSB0cnVlOyBpZiAodGV4dC5jaGFyQ29kZUF0KEkpID09PSBORVdMSU5FKSArK0k7IH1cbiAgICAgICAgZWxzZSBpZiAoYyAhPT0gREVMSU1JVEVSKSBjb250aW51ZTtcbiAgICAgICAgcmV0dXJuIHRleHQuc2xpY2UoaiwgaSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBsYXN0IHRva2VuIGJlZm9yZSBFT0YuXG4gICAgICByZXR1cm4gZW9mID0gdHJ1ZSwgdGV4dC5zbGljZShqLCBOKTtcbiAgICB9XG5cbiAgICB3aGlsZSAoKHQgPSB0b2tlbigpKSAhPT0gRU9GKSB7XG4gICAgICB2YXIgcm93ID0gW107XG4gICAgICB3aGlsZSAodCAhPT0gRU9MICYmIHQgIT09IEVPRikgcm93LnB1c2godCksIHQgPSB0b2tlbigpO1xuICAgICAgaWYgKGYgJiYgKHJvdyA9IGYocm93LCBuKyspKSA9PSBudWxsKSBjb250aW51ZTtcbiAgICAgIHJvd3MucHVzaChyb3cpO1xuICAgIH1cblxuICAgIHJldHVybiByb3dzO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJlZm9ybWF0Qm9keShyb3dzLCBjb2x1bW5zKSB7XG4gICAgcmV0dXJuIHJvd3MubWFwKGZ1bmN0aW9uKHJvdykge1xuICAgICAgcmV0dXJuIGNvbHVtbnMubWFwKGZ1bmN0aW9uKGNvbHVtbikge1xuICAgICAgICByZXR1cm4gZm9ybWF0VmFsdWUocm93W2NvbHVtbl0pO1xuICAgICAgfSkuam9pbihkZWxpbWl0ZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0KHJvd3MsIGNvbHVtbnMpIHtcbiAgICBpZiAoY29sdW1ucyA9PSBudWxsKSBjb2x1bW5zID0gaW5mZXJDb2x1bW5zKHJvd3MpO1xuICAgIHJldHVybiBbY29sdW1ucy5tYXAoZm9ybWF0VmFsdWUpLmpvaW4oZGVsaW1pdGVyKV0uY29uY2F0KHByZWZvcm1hdEJvZHkocm93cywgY29sdW1ucykpLmpvaW4oXCJcXG5cIik7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRCb2R5KHJvd3MsIGNvbHVtbnMpIHtcbiAgICBpZiAoY29sdW1ucyA9PSBudWxsKSBjb2x1bW5zID0gaW5mZXJDb2x1bW5zKHJvd3MpO1xuICAgIHJldHVybiBwcmVmb3JtYXRCb2R5KHJvd3MsIGNvbHVtbnMpLmpvaW4oXCJcXG5cIik7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRSb3dzKHJvd3MpIHtcbiAgICByZXR1cm4gcm93cy5tYXAoZm9ybWF0Um93KS5qb2luKFwiXFxuXCIpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0Um93KHJvdykge1xuICAgIHJldHVybiByb3cubWFwKGZvcm1hdFZhbHVlKS5qb2luKGRlbGltaXRlcik7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRWYWx1ZSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PSBudWxsID8gXCJcIlxuICAgICAgICA6IHZhbHVlIGluc3RhbmNlb2YgRGF0ZSA/IGZvcm1hdERhdGUodmFsdWUpXG4gICAgICAgIDogcmVGb3JtYXQudGVzdCh2YWx1ZSArPSBcIlwiKSA/IFwiXFxcIlwiICsgdmFsdWUucmVwbGFjZSgvXCIvZywgXCJcXFwiXFxcIlwiKSArIFwiXFxcIlwiXG4gICAgICAgIDogdmFsdWU7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHBhcnNlOiBwYXJzZSxcbiAgICBwYXJzZVJvd3M6IHBhcnNlUm93cyxcbiAgICBmb3JtYXQ6IGZvcm1hdCxcbiAgICBmb3JtYXRCb2R5OiBmb3JtYXRCb2R5LFxuICAgIGZvcm1hdFJvd3M6IGZvcm1hdFJvd3MsXG4gICAgZm9ybWF0Um93OiBmb3JtYXRSb3csXG4gICAgZm9ybWF0VmFsdWU6IGZvcm1hdFZhbHVlXG4gIH07XG59XG4iLCJpbXBvcnQgZHN2IGZyb20gXCIuL2Rzdi5qc1wiO1xuXG52YXIgY3N2ID0gZHN2KFwiLFwiKTtcblxuZXhwb3J0IHZhciBjc3ZQYXJzZSA9IGNzdi5wYXJzZTtcbmV4cG9ydCB2YXIgY3N2UGFyc2VSb3dzID0gY3N2LnBhcnNlUm93cztcbmV4cG9ydCB2YXIgY3N2Rm9ybWF0ID0gY3N2LmZvcm1hdDtcbmV4cG9ydCB2YXIgY3N2Rm9ybWF0Qm9keSA9IGNzdi5mb3JtYXRCb2R5O1xuZXhwb3J0IHZhciBjc3ZGb3JtYXRSb3dzID0gY3N2LmZvcm1hdFJvd3M7XG5leHBvcnQgdmFyIGNzdkZvcm1hdFJvdyA9IGNzdi5mb3JtYXRSb3c7XG5leHBvcnQgdmFyIGNzdkZvcm1hdFZhbHVlID0gY3N2LmZvcm1hdFZhbHVlO1xuIiwiaW1wb3J0IGRzdiBmcm9tIFwiLi9kc3YuanNcIjtcblxudmFyIHRzdiA9IGRzdihcIlxcdFwiKTtcblxuZXhwb3J0IHZhciB0c3ZQYXJzZSA9IHRzdi5wYXJzZTtcbmV4cG9ydCB2YXIgdHN2UGFyc2VSb3dzID0gdHN2LnBhcnNlUm93cztcbmV4cG9ydCB2YXIgdHN2Rm9ybWF0ID0gdHN2LmZvcm1hdDtcbmV4cG9ydCB2YXIgdHN2Rm9ybWF0Qm9keSA9IHRzdi5mb3JtYXRCb2R5O1xuZXhwb3J0IHZhciB0c3ZGb3JtYXRSb3dzID0gdHN2LmZvcm1hdFJvd3M7XG5leHBvcnQgdmFyIHRzdkZvcm1hdFJvdyA9IHRzdi5mb3JtYXRSb3c7XG5leHBvcnQgdmFyIHRzdkZvcm1hdFZhbHVlID0gdHN2LmZvcm1hdFZhbHVlO1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXV0b1R5cGUob2JqZWN0KSB7XG4gIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICB2YXIgdmFsdWUgPSBvYmplY3Rba2V5XS50cmltKCksIG51bWJlciwgbTtcbiAgICBpZiAoIXZhbHVlKSB2YWx1ZSA9IG51bGw7XG4gICAgZWxzZSBpZiAodmFsdWUgPT09IFwidHJ1ZVwiKSB2YWx1ZSA9IHRydWU7XG4gICAgZWxzZSBpZiAodmFsdWUgPT09IFwiZmFsc2VcIikgdmFsdWUgPSBmYWxzZTtcbiAgICBlbHNlIGlmICh2YWx1ZSA9PT0gXCJOYU5cIikgdmFsdWUgPSBOYU47XG4gICAgZWxzZSBpZiAoIWlzTmFOKG51bWJlciA9ICt2YWx1ZSkpIHZhbHVlID0gbnVtYmVyO1xuICAgIGVsc2UgaWYgKG0gPSB2YWx1ZS5tYXRjaCgvXihbLStdXFxkezJ9KT9cXGR7NH0oLVxcZHsyfSgtXFxkezJ9KT8pPyhUXFxkezJ9OlxcZHsyfSg6XFxkezJ9KFxcLlxcZHszfSk/KT8oWnxbLStdXFxkezJ9OlxcZHsyfSk/KT8kLykpIHtcbiAgICAgIGlmIChmaXh0eiAmJiAhIW1bNF0gJiYgIW1bN10pIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvLS9nLCBcIi9cIikucmVwbGFjZSgvVC8sIFwiIFwiKTtcbiAgICAgIHZhbHVlID0gbmV3IERhdGUodmFsdWUpO1xuICAgIH1cbiAgICBlbHNlIGNvbnRpbnVlO1xuICAgIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2QzL2QzLWRzdi9pc3N1ZXMvNDVcbmNvbnN0IGZpeHR6ID0gbmV3IERhdGUoXCIyMDE5LTAxLTAxVDAwOjAwXCIpLmdldEhvdXJzKCkgfHwgbmV3IERhdGUoXCIyMDE5LTA3LTAxVDAwOjAwXCIpLmdldEhvdXJzKCk7IiwiZXhwb3J0IHtkZWZhdWx0IGFzIGRzdkZvcm1hdH0gZnJvbSBcIi4vZHN2LmpzXCI7XG5leHBvcnQge2NzdlBhcnNlLCBjc3ZQYXJzZVJvd3MsIGNzdkZvcm1hdCwgY3N2Rm9ybWF0Qm9keSwgY3N2Rm9ybWF0Um93cywgY3N2Rm9ybWF0Um93LCBjc3ZGb3JtYXRWYWx1ZX0gZnJvbSBcIi4vY3N2LmpzXCI7XG5leHBvcnQge3RzdlBhcnNlLCB0c3ZQYXJzZVJvd3MsIHRzdkZvcm1hdCwgdHN2Rm9ybWF0Qm9keSwgdHN2Rm9ybWF0Um93cywgdHN2Rm9ybWF0Um93LCB0c3ZGb3JtYXRWYWx1ZX0gZnJvbSBcIi4vdHN2LmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgYXV0b1R5cGV9IGZyb20gXCIuL2F1dG9UeXBlLmpzXCI7XG4iLCJleHBvcnQgZGVmYXVsdCB4ID0+ICgpID0+IHg7XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBCcnVzaEV2ZW50KHR5cGUsIHtcbiAgc291cmNlRXZlbnQsXG4gIHRhcmdldCxcbiAgc2VsZWN0aW9uLFxuICBtb2RlLFxuICBkaXNwYXRjaFxufSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgdHlwZToge3ZhbHVlOiB0eXBlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWV9LFxuICAgIHNvdXJjZUV2ZW50OiB7dmFsdWU6IHNvdXJjZUV2ZW50LCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWV9LFxuICAgIHRhcmdldDoge3ZhbHVlOiB0YXJnZXQsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZX0sXG4gICAgc2VsZWN0aW9uOiB7dmFsdWU6IHNlbGVjdGlvbiwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlfSxcbiAgICBtb2RlOiB7dmFsdWU6IG1vZGUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZX0sXG4gICAgXzoge3ZhbHVlOiBkaXNwYXRjaH1cbiAgfSk7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gbm9wcm9wYWdhdGlvbihldmVudCkge1xuICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG59XG4iLCJpbXBvcnQge2Rpc3BhdGNofSBmcm9tIFwiZDMtZGlzcGF0Y2hcIjtcbmltcG9ydCB7ZHJhZ0Rpc2FibGUsIGRyYWdFbmFibGV9IGZyb20gXCJkMy1kcmFnXCI7XG5pbXBvcnQge2ludGVycG9sYXRlfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcbmltcG9ydCB7cG9pbnRlciwgc2VsZWN0fSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge2ludGVycnVwdH0gZnJvbSBcImQzLXRyYW5zaXRpb25cIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuaW1wb3J0IEJydXNoRXZlbnQgZnJvbSBcIi4vZXZlbnQuanNcIjtcbmltcG9ydCBub2V2ZW50LCB7bm9wcm9wYWdhdGlvbn0gZnJvbSBcIi4vbm9ldmVudC5qc1wiO1xuXG52YXIgTU9ERV9EUkFHID0ge25hbWU6IFwiZHJhZ1wifSxcbiAgICBNT0RFX1NQQUNFID0ge25hbWU6IFwic3BhY2VcIn0sXG4gICAgTU9ERV9IQU5ETEUgPSB7bmFtZTogXCJoYW5kbGVcIn0sXG4gICAgTU9ERV9DRU5URVIgPSB7bmFtZTogXCJjZW50ZXJcIn07XG5cbmNvbnN0IHthYnMsIG1heCwgbWlufSA9IE1hdGg7XG5cbmZ1bmN0aW9uIG51bWJlcjEoZSkge1xuICByZXR1cm4gWytlWzBdLCArZVsxXV07XG59XG5cbmZ1bmN0aW9uIG51bWJlcjIoZSkge1xuICByZXR1cm4gW251bWJlcjEoZVswXSksIG51bWJlcjEoZVsxXSldO1xufVxuXG52YXIgWCA9IHtcbiAgbmFtZTogXCJ4XCIsXG4gIGhhbmRsZXM6IFtcIndcIiwgXCJlXCJdLm1hcCh0eXBlKSxcbiAgaW5wdXQ6IGZ1bmN0aW9uKHgsIGUpIHsgcmV0dXJuIHggPT0gbnVsbCA/IG51bGwgOiBbWyt4WzBdLCBlWzBdWzFdXSwgWyt4WzFdLCBlWzFdWzFdXV07IH0sXG4gIG91dHB1dDogZnVuY3Rpb24oeHkpIHsgcmV0dXJuIHh5ICYmIFt4eVswXVswXSwgeHlbMV1bMF1dOyB9XG59O1xuXG52YXIgWSA9IHtcbiAgbmFtZTogXCJ5XCIsXG4gIGhhbmRsZXM6IFtcIm5cIiwgXCJzXCJdLm1hcCh0eXBlKSxcbiAgaW5wdXQ6IGZ1bmN0aW9uKHksIGUpIHsgcmV0dXJuIHkgPT0gbnVsbCA/IG51bGwgOiBbW2VbMF1bMF0sICt5WzBdXSwgW2VbMV1bMF0sICt5WzFdXV07IH0sXG4gIG91dHB1dDogZnVuY3Rpb24oeHkpIHsgcmV0dXJuIHh5ICYmIFt4eVswXVsxXSwgeHlbMV1bMV1dOyB9XG59O1xuXG52YXIgWFkgPSB7XG4gIG5hbWU6IFwieHlcIixcbiAgaGFuZGxlczogW1wiblwiLCBcIndcIiwgXCJlXCIsIFwic1wiLCBcIm53XCIsIFwibmVcIiwgXCJzd1wiLCBcInNlXCJdLm1hcCh0eXBlKSxcbiAgaW5wdXQ6IGZ1bmN0aW9uKHh5KSB7IHJldHVybiB4eSA9PSBudWxsID8gbnVsbCA6IG51bWJlcjIoeHkpOyB9LFxuICBvdXRwdXQ6IGZ1bmN0aW9uKHh5KSB7IHJldHVybiB4eTsgfVxufTtcblxudmFyIGN1cnNvcnMgPSB7XG4gIG92ZXJsYXk6IFwiY3Jvc3NoYWlyXCIsXG4gIHNlbGVjdGlvbjogXCJtb3ZlXCIsXG4gIG46IFwibnMtcmVzaXplXCIsXG4gIGU6IFwiZXctcmVzaXplXCIsXG4gIHM6IFwibnMtcmVzaXplXCIsXG4gIHc6IFwiZXctcmVzaXplXCIsXG4gIG53OiBcIm53c2UtcmVzaXplXCIsXG4gIG5lOiBcIm5lc3ctcmVzaXplXCIsXG4gIHNlOiBcIm53c2UtcmVzaXplXCIsXG4gIHN3OiBcIm5lc3ctcmVzaXplXCJcbn07XG5cbnZhciBmbGlwWCA9IHtcbiAgZTogXCJ3XCIsXG4gIHc6IFwiZVwiLFxuICBudzogXCJuZVwiLFxuICBuZTogXCJud1wiLFxuICBzZTogXCJzd1wiLFxuICBzdzogXCJzZVwiXG59O1xuXG52YXIgZmxpcFkgPSB7XG4gIG46IFwic1wiLFxuICBzOiBcIm5cIixcbiAgbnc6IFwic3dcIixcbiAgbmU6IFwic2VcIixcbiAgc2U6IFwibmVcIixcbiAgc3c6IFwibndcIlxufTtcblxudmFyIHNpZ25zWCA9IHtcbiAgb3ZlcmxheTogKzEsXG4gIHNlbGVjdGlvbjogKzEsXG4gIG46IG51bGwsXG4gIGU6ICsxLFxuICBzOiBudWxsLFxuICB3OiAtMSxcbiAgbnc6IC0xLFxuICBuZTogKzEsXG4gIHNlOiArMSxcbiAgc3c6IC0xXG59O1xuXG52YXIgc2lnbnNZID0ge1xuICBvdmVybGF5OiArMSxcbiAgc2VsZWN0aW9uOiArMSxcbiAgbjogLTEsXG4gIGU6IG51bGwsXG4gIHM6ICsxLFxuICB3OiBudWxsLFxuICBudzogLTEsXG4gIG5lOiAtMSxcbiAgc2U6ICsxLFxuICBzdzogKzFcbn07XG5cbmZ1bmN0aW9uIHR5cGUodCkge1xuICByZXR1cm4ge3R5cGU6IHR9O1xufVxuXG4vLyBJZ25vcmUgcmlnaHQtY2xpY2ssIHNpbmNlIHRoYXQgc2hvdWxkIG9wZW4gdGhlIGNvbnRleHQgbWVudS5cbmZ1bmN0aW9uIGRlZmF1bHRGaWx0ZXIoZXZlbnQpIHtcbiAgcmV0dXJuICFldmVudC5jdHJsS2V5ICYmICFldmVudC5idXR0b247XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRFeHRlbnQoKSB7XG4gIHZhciBzdmcgPSB0aGlzLm93bmVyU1ZHRWxlbWVudCB8fCB0aGlzO1xuICBpZiAoc3ZnLmhhc0F0dHJpYnV0ZShcInZpZXdCb3hcIikpIHtcbiAgICBzdmcgPSBzdmcudmlld0JveC5iYXNlVmFsO1xuICAgIHJldHVybiBbW3N2Zy54LCBzdmcueV0sIFtzdmcueCArIHN2Zy53aWR0aCwgc3ZnLnkgKyBzdmcuaGVpZ2h0XV07XG4gIH1cbiAgcmV0dXJuIFtbMCwgMF0sIFtzdmcud2lkdGguYmFzZVZhbC52YWx1ZSwgc3ZnLmhlaWdodC5iYXNlVmFsLnZhbHVlXV07XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRUb3VjaGFibGUoKSB7XG4gIHJldHVybiBuYXZpZ2F0b3IubWF4VG91Y2hQb2ludHMgfHwgKFwib250b3VjaHN0YXJ0XCIgaW4gdGhpcyk7XG59XG5cbi8vIExpa2UgZDMubG9jYWwsIGJ1dCB3aXRoIHRoZSBuYW1lIOKAnF9fYnJ1c2jigJ0gcmF0aGVyIHRoYW4gYXV0by1nZW5lcmF0ZWQuXG5mdW5jdGlvbiBsb2NhbChub2RlKSB7XG4gIHdoaWxlICghbm9kZS5fX2JydXNoKSBpZiAoIShub2RlID0gbm9kZS5wYXJlbnROb2RlKSkgcmV0dXJuO1xuICByZXR1cm4gbm9kZS5fX2JydXNoO1xufVxuXG5mdW5jdGlvbiBlbXB0eShleHRlbnQpIHtcbiAgcmV0dXJuIGV4dGVudFswXVswXSA9PT0gZXh0ZW50WzFdWzBdXG4gICAgICB8fCBleHRlbnRbMF1bMV0gPT09IGV4dGVudFsxXVsxXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJydXNoU2VsZWN0aW9uKG5vZGUpIHtcbiAgdmFyIHN0YXRlID0gbm9kZS5fX2JydXNoO1xuICByZXR1cm4gc3RhdGUgPyBzdGF0ZS5kaW0ub3V0cHV0KHN0YXRlLnNlbGVjdGlvbikgOiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnJ1c2hYKCkge1xuICByZXR1cm4gYnJ1c2goWCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBicnVzaFkoKSB7XG4gIHJldHVybiBicnVzaChZKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBicnVzaChYWSk7XG59XG5cbmZ1bmN0aW9uIGJydXNoKGRpbSkge1xuICB2YXIgZXh0ZW50ID0gZGVmYXVsdEV4dGVudCxcbiAgICAgIGZpbHRlciA9IGRlZmF1bHRGaWx0ZXIsXG4gICAgICB0b3VjaGFibGUgPSBkZWZhdWx0VG91Y2hhYmxlLFxuICAgICAga2V5cyA9IHRydWUsXG4gICAgICBsaXN0ZW5lcnMgPSBkaXNwYXRjaChcInN0YXJ0XCIsIFwiYnJ1c2hcIiwgXCJlbmRcIiksXG4gICAgICBoYW5kbGVTaXplID0gNixcbiAgICAgIHRvdWNoZW5kaW5nO1xuXG4gIGZ1bmN0aW9uIGJydXNoKGdyb3VwKSB7XG4gICAgdmFyIG92ZXJsYXkgPSBncm91cFxuICAgICAgICAucHJvcGVydHkoXCJfX2JydXNoXCIsIGluaXRpYWxpemUpXG4gICAgICAuc2VsZWN0QWxsKFwiLm92ZXJsYXlcIilcbiAgICAgIC5kYXRhKFt0eXBlKFwib3ZlcmxheVwiKV0pO1xuXG4gICAgb3ZlcmxheS5lbnRlcigpLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcIm92ZXJsYXlcIilcbiAgICAgICAgLmF0dHIoXCJwb2ludGVyLWV2ZW50c1wiLCBcImFsbFwiKVxuICAgICAgICAuYXR0cihcImN1cnNvclwiLCBjdXJzb3JzLm92ZXJsYXkpXG4gICAgICAubWVyZ2Uob3ZlcmxheSlcbiAgICAgICAgLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGV4dGVudCA9IGxvY2FsKHRoaXMpLmV4dGVudDtcbiAgICAgICAgICBzZWxlY3QodGhpcylcbiAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIGV4dGVudFswXVswXSlcbiAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIGV4dGVudFswXVsxXSlcbiAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBleHRlbnRbMV1bMF0gLSBleHRlbnRbMF1bMF0pXG4gICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGV4dGVudFsxXVsxXSAtIGV4dGVudFswXVsxXSk7XG4gICAgICAgIH0pO1xuXG4gICAgZ3JvdXAuc2VsZWN0QWxsKFwiLnNlbGVjdGlvblwiKVxuICAgICAgLmRhdGEoW3R5cGUoXCJzZWxlY3Rpb25cIildKVxuICAgICAgLmVudGVyKCkuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwic2VsZWN0aW9uXCIpXG4gICAgICAgIC5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnMuc2VsZWN0aW9uKVxuICAgICAgICAuYXR0cihcImZpbGxcIiwgXCIjNzc3XCIpXG4gICAgICAgIC5hdHRyKFwiZmlsbC1vcGFjaXR5XCIsIDAuMylcbiAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCIjZmZmXCIpXG4gICAgICAgIC5hdHRyKFwic2hhcGUtcmVuZGVyaW5nXCIsIFwiY3Jpc3BFZGdlc1wiKTtcblxuICAgIHZhciBoYW5kbGUgPSBncm91cC5zZWxlY3RBbGwoXCIuaGFuZGxlXCIpXG4gICAgICAuZGF0YShkaW0uaGFuZGxlcywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50eXBlOyB9KTtcblxuICAgIGhhbmRsZS5leGl0KCkucmVtb3ZlKCk7XG5cbiAgICBoYW5kbGUuZW50ZXIoKS5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gXCJoYW5kbGUgaGFuZGxlLS1cIiArIGQudHlwZTsgfSlcbiAgICAgICAgLmF0dHIoXCJjdXJzb3JcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gY3Vyc29yc1tkLnR5cGVdOyB9KTtcblxuICAgIGdyb3VwXG4gICAgICAgIC5lYWNoKHJlZHJhdylcbiAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwibm9uZVwiKVxuICAgICAgICAuYXR0cihcInBvaW50ZXItZXZlbnRzXCIsIFwiYWxsXCIpXG4gICAgICAgIC5vbihcIm1vdXNlZG93bi5icnVzaFwiLCBzdGFydGVkKVxuICAgICAgLmZpbHRlcih0b3VjaGFibGUpXG4gICAgICAgIC5vbihcInRvdWNoc3RhcnQuYnJ1c2hcIiwgc3RhcnRlZClcbiAgICAgICAgLm9uKFwidG91Y2htb3ZlLmJydXNoXCIsIHRvdWNobW92ZWQpXG4gICAgICAgIC5vbihcInRvdWNoZW5kLmJydXNoIHRvdWNoY2FuY2VsLmJydXNoXCIsIHRvdWNoZW5kZWQpXG4gICAgICAgIC5zdHlsZShcInRvdWNoLWFjdGlvblwiLCBcIm5vbmVcIilcbiAgICAgICAgLnN0eWxlKFwiLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yXCIsIFwicmdiYSgwLDAsMCwwKVwiKTtcbiAgfVxuXG4gIGJydXNoLm1vdmUgPSBmdW5jdGlvbihncm91cCwgc2VsZWN0aW9uLCBldmVudCkge1xuICAgIGlmIChncm91cC50d2Vlbikge1xuICAgICAgZ3JvdXBcbiAgICAgICAgICAub24oXCJzdGFydC5icnVzaFwiLCBmdW5jdGlvbihldmVudCkgeyBlbWl0dGVyKHRoaXMsIGFyZ3VtZW50cykuYmVmb3Jlc3RhcnQoKS5zdGFydChldmVudCk7IH0pXG4gICAgICAgICAgLm9uKFwiaW50ZXJydXB0LmJydXNoIGVuZC5icnVzaFwiLCBmdW5jdGlvbihldmVudCkgeyBlbWl0dGVyKHRoaXMsIGFyZ3VtZW50cykuZW5kKGV2ZW50KTsgfSlcbiAgICAgICAgICAudHdlZW4oXCJicnVzaFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IHRoYXQuX19icnVzaCxcbiAgICAgICAgICAgICAgICBlbWl0ID0gZW1pdHRlcih0aGF0LCBhcmd1bWVudHMpLFxuICAgICAgICAgICAgICAgIHNlbGVjdGlvbjAgPSBzdGF0ZS5zZWxlY3Rpb24sXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uMSA9IGRpbS5pbnB1dCh0eXBlb2Ygc2VsZWN0aW9uID09PSBcImZ1bmN0aW9uXCIgPyBzZWxlY3Rpb24uYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IHNlbGVjdGlvbiwgc3RhdGUuZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBpID0gaW50ZXJwb2xhdGUoc2VsZWN0aW9uMCwgc2VsZWN0aW9uMSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHR3ZWVuKHQpIHtcbiAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0aW9uID0gdCA9PT0gMSAmJiBzZWxlY3Rpb24xID09PSBudWxsID8gbnVsbCA6IGkodCk7XG4gICAgICAgICAgICAgIHJlZHJhdy5jYWxsKHRoYXQpO1xuICAgICAgICAgICAgICBlbWl0LmJydXNoKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzZWxlY3Rpb24wICE9PSBudWxsICYmIHNlbGVjdGlvbjEgIT09IG51bGwgPyB0d2VlbiA6IHR3ZWVuKDEpO1xuICAgICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBncm91cFxuICAgICAgICAgIC5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgICAgICAgICAgc3RhdGUgPSB0aGF0Ll9fYnJ1c2gsXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uMSA9IGRpbS5pbnB1dCh0eXBlb2Ygc2VsZWN0aW9uID09PSBcImZ1bmN0aW9uXCIgPyBzZWxlY3Rpb24uYXBwbHkodGhhdCwgYXJncykgOiBzZWxlY3Rpb24sIHN0YXRlLmV4dGVudCksXG4gICAgICAgICAgICAgICAgZW1pdCA9IGVtaXR0ZXIodGhhdCwgYXJncykuYmVmb3Jlc3RhcnQoKTtcblxuICAgICAgICAgICAgaW50ZXJydXB0KHRoYXQpO1xuICAgICAgICAgICAgc3RhdGUuc2VsZWN0aW9uID0gc2VsZWN0aW9uMSA9PT0gbnVsbCA/IG51bGwgOiBzZWxlY3Rpb24xO1xuICAgICAgICAgICAgcmVkcmF3LmNhbGwodGhhdCk7XG4gICAgICAgICAgICBlbWl0LnN0YXJ0KGV2ZW50KS5icnVzaChldmVudCkuZW5kKGV2ZW50KTtcbiAgICAgICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgYnJ1c2guY2xlYXIgPSBmdW5jdGlvbihncm91cCwgZXZlbnQpIHtcbiAgICBicnVzaC5tb3ZlKGdyb3VwLCBudWxsLCBldmVudCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gcmVkcmF3KCkge1xuICAgIHZhciBncm91cCA9IHNlbGVjdCh0aGlzKSxcbiAgICAgICAgc2VsZWN0aW9uID0gbG9jYWwodGhpcykuc2VsZWN0aW9uO1xuXG4gICAgaWYgKHNlbGVjdGlvbikge1xuICAgICAgZ3JvdXAuc2VsZWN0QWxsKFwiLnNlbGVjdGlvblwiKVxuICAgICAgICAgIC5zdHlsZShcImRpc3BsYXlcIiwgbnVsbClcbiAgICAgICAgICAuYXR0cihcInhcIiwgc2VsZWN0aW9uWzBdWzBdKVxuICAgICAgICAgIC5hdHRyKFwieVwiLCBzZWxlY3Rpb25bMF1bMV0pXG4gICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBzZWxlY3Rpb25bMV1bMF0gLSBzZWxlY3Rpb25bMF1bMF0pXG4gICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgc2VsZWN0aW9uWzFdWzFdIC0gc2VsZWN0aW9uWzBdWzFdKTtcblxuICAgICAgZ3JvdXAuc2VsZWN0QWxsKFwiLmhhbmRsZVwiKVxuICAgICAgICAgIC5zdHlsZShcImRpc3BsYXlcIiwgbnVsbClcbiAgICAgICAgICAuYXR0cihcInhcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50eXBlW2QudHlwZS5sZW5ndGggLSAxXSA9PT0gXCJlXCIgPyBzZWxlY3Rpb25bMV1bMF0gLSBoYW5kbGVTaXplIC8gMiA6IHNlbGVjdGlvblswXVswXSAtIGhhbmRsZVNpemUgLyAyOyB9KVxuICAgICAgICAgIC5hdHRyKFwieVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnR5cGVbMF0gPT09IFwic1wiID8gc2VsZWN0aW9uWzFdWzFdIC0gaGFuZGxlU2l6ZSAvIDIgOiBzZWxlY3Rpb25bMF1bMV0gLSBoYW5kbGVTaXplIC8gMjsgfSlcbiAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudHlwZSA9PT0gXCJuXCIgfHwgZC50eXBlID09PSBcInNcIiA/IHNlbGVjdGlvblsxXVswXSAtIHNlbGVjdGlvblswXVswXSArIGhhbmRsZVNpemUgOiBoYW5kbGVTaXplOyB9KVxuICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudHlwZSA9PT0gXCJlXCIgfHwgZC50eXBlID09PSBcIndcIiA/IHNlbGVjdGlvblsxXVsxXSAtIHNlbGVjdGlvblswXVsxXSArIGhhbmRsZVNpemUgOiBoYW5kbGVTaXplOyB9KTtcbiAgICB9XG5cbiAgICBlbHNlIHtcbiAgICAgIGdyb3VwLnNlbGVjdEFsbChcIi5zZWxlY3Rpb24sLmhhbmRsZVwiKVxuICAgICAgICAgIC5zdHlsZShcImRpc3BsYXlcIiwgXCJub25lXCIpXG4gICAgICAgICAgLmF0dHIoXCJ4XCIsIG51bGwpXG4gICAgICAgICAgLmF0dHIoXCJ5XCIsIG51bGwpXG4gICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBudWxsKVxuICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVtaXR0ZXIodGhhdCwgYXJncywgY2xlYW4pIHtcbiAgICB2YXIgZW1pdCA9IHRoYXQuX19icnVzaC5lbWl0dGVyO1xuICAgIHJldHVybiBlbWl0ICYmICghY2xlYW4gfHwgIWVtaXQuY2xlYW4pID8gZW1pdCA6IG5ldyBFbWl0dGVyKHRoYXQsIGFyZ3MsIGNsZWFuKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIEVtaXR0ZXIodGhhdCwgYXJncywgY2xlYW4pIHtcbiAgICB0aGlzLnRoYXQgPSB0aGF0O1xuICAgIHRoaXMuYXJncyA9IGFyZ3M7XG4gICAgdGhpcy5zdGF0ZSA9IHRoYXQuX19icnVzaDtcbiAgICB0aGlzLmFjdGl2ZSA9IDA7XG4gICAgdGhpcy5jbGVhbiA9IGNsZWFuO1xuICB9XG5cbiAgRW1pdHRlci5wcm90b3R5cGUgPSB7XG4gICAgYmVmb3Jlc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCsrdGhpcy5hY3RpdmUgPT09IDEpIHRoaXMuc3RhdGUuZW1pdHRlciA9IHRoaXMsIHRoaXMuc3RhcnRpbmcgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBzdGFydDogZnVuY3Rpb24oZXZlbnQsIG1vZGUpIHtcbiAgICAgIGlmICh0aGlzLnN0YXJ0aW5nKSB0aGlzLnN0YXJ0aW5nID0gZmFsc2UsIHRoaXMuZW1pdChcInN0YXJ0XCIsIGV2ZW50LCBtb2RlKTtcbiAgICAgIGVsc2UgdGhpcy5lbWl0KFwiYnJ1c2hcIiwgZXZlbnQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBicnVzaDogZnVuY3Rpb24oZXZlbnQsIG1vZGUpIHtcbiAgICAgIHRoaXMuZW1pdChcImJydXNoXCIsIGV2ZW50LCBtb2RlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZW5kOiBmdW5jdGlvbihldmVudCwgbW9kZSkge1xuICAgICAgaWYgKC0tdGhpcy5hY3RpdmUgPT09IDApIGRlbGV0ZSB0aGlzLnN0YXRlLmVtaXR0ZXIsIHRoaXMuZW1pdChcImVuZFwiLCBldmVudCwgbW9kZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGVtaXQ6IGZ1bmN0aW9uKHR5cGUsIGV2ZW50LCBtb2RlKSB7XG4gICAgICB2YXIgZCA9IHNlbGVjdCh0aGlzLnRoYXQpLmRhdHVtKCk7XG4gICAgICBsaXN0ZW5lcnMuY2FsbChcbiAgICAgICAgdHlwZSxcbiAgICAgICAgdGhpcy50aGF0LFxuICAgICAgICBuZXcgQnJ1c2hFdmVudCh0eXBlLCB7XG4gICAgICAgICAgc291cmNlRXZlbnQ6IGV2ZW50LFxuICAgICAgICAgIHRhcmdldDogYnJ1c2gsXG4gICAgICAgICAgc2VsZWN0aW9uOiBkaW0ub3V0cHV0KHRoaXMuc3RhdGUuc2VsZWN0aW9uKSxcbiAgICAgICAgICBtb2RlLFxuICAgICAgICAgIGRpc3BhdGNoOiBsaXN0ZW5lcnNcbiAgICAgICAgfSksXG4gICAgICAgIGRcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIHN0YXJ0ZWQoZXZlbnQpIHtcbiAgICBpZiAodG91Y2hlbmRpbmcgJiYgIWV2ZW50LnRvdWNoZXMpIHJldHVybjtcbiAgICBpZiAoIWZpbHRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpKSByZXR1cm47XG5cbiAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgIHR5cGUgPSBldmVudC50YXJnZXQuX19kYXRhX18udHlwZSxcbiAgICAgICAgbW9kZSA9IChrZXlzICYmIGV2ZW50Lm1ldGFLZXkgPyB0eXBlID0gXCJvdmVybGF5XCIgOiB0eXBlKSA9PT0gXCJzZWxlY3Rpb25cIiA/IE1PREVfRFJBRyA6IChrZXlzICYmIGV2ZW50LmFsdEtleSA/IE1PREVfQ0VOVEVSIDogTU9ERV9IQU5ETEUpLFxuICAgICAgICBzaWduWCA9IGRpbSA9PT0gWSA/IG51bGwgOiBzaWduc1hbdHlwZV0sXG4gICAgICAgIHNpZ25ZID0gZGltID09PSBYID8gbnVsbCA6IHNpZ25zWVt0eXBlXSxcbiAgICAgICAgc3RhdGUgPSBsb2NhbCh0aGF0KSxcbiAgICAgICAgZXh0ZW50ID0gc3RhdGUuZXh0ZW50LFxuICAgICAgICBzZWxlY3Rpb24gPSBzdGF0ZS5zZWxlY3Rpb24sXG4gICAgICAgIFcgPSBleHRlbnRbMF1bMF0sIHcwLCB3MSxcbiAgICAgICAgTiA9IGV4dGVudFswXVsxXSwgbjAsIG4xLFxuICAgICAgICBFID0gZXh0ZW50WzFdWzBdLCBlMCwgZTEsXG4gICAgICAgIFMgPSBleHRlbnRbMV1bMV0sIHMwLCBzMSxcbiAgICAgICAgZHggPSAwLFxuICAgICAgICBkeSA9IDAsXG4gICAgICAgIG1vdmluZyxcbiAgICAgICAgc2hpZnRpbmcgPSBzaWduWCAmJiBzaWduWSAmJiBrZXlzICYmIGV2ZW50LnNoaWZ0S2V5LFxuICAgICAgICBsb2NrWCxcbiAgICAgICAgbG9ja1ksXG4gICAgICAgIHBvaW50cyA9IEFycmF5LmZyb20oZXZlbnQudG91Y2hlcyB8fCBbZXZlbnRdLCB0ID0+IHtcbiAgICAgICAgICBjb25zdCBpID0gdC5pZGVudGlmaWVyO1xuICAgICAgICAgIHQgPSBwb2ludGVyKHQsIHRoYXQpO1xuICAgICAgICAgIHQucG9pbnQwID0gdC5zbGljZSgpO1xuICAgICAgICAgIHQuaWRlbnRpZmllciA9IGk7XG4gICAgICAgICAgcmV0dXJuIHQ7XG4gICAgICAgIH0pO1xuXG4gICAgaW50ZXJydXB0KHRoYXQpO1xuICAgIHZhciBlbWl0ID0gZW1pdHRlcih0aGF0LCBhcmd1bWVudHMsIHRydWUpLmJlZm9yZXN0YXJ0KCk7XG5cbiAgICBpZiAodHlwZSA9PT0gXCJvdmVybGF5XCIpIHtcbiAgICAgIGlmIChzZWxlY3Rpb24pIG1vdmluZyA9IHRydWU7XG4gICAgICBjb25zdCBwdHMgPSBbcG9pbnRzWzBdLCBwb2ludHNbMV0gfHwgcG9pbnRzWzBdXTtcbiAgICAgIHN0YXRlLnNlbGVjdGlvbiA9IHNlbGVjdGlvbiA9IFtbXG4gICAgICAgICAgdzAgPSBkaW0gPT09IFkgPyBXIDogbWluKHB0c1swXVswXSwgcHRzWzFdWzBdKSxcbiAgICAgICAgICBuMCA9IGRpbSA9PT0gWCA/IE4gOiBtaW4ocHRzWzBdWzFdLCBwdHNbMV1bMV0pXG4gICAgICAgIF0sIFtcbiAgICAgICAgICBlMCA9IGRpbSA9PT0gWSA/IEUgOiBtYXgocHRzWzBdWzBdLCBwdHNbMV1bMF0pLFxuICAgICAgICAgIHMwID0gZGltID09PSBYID8gUyA6IG1heChwdHNbMF1bMV0sIHB0c1sxXVsxXSlcbiAgICAgICAgXV07XG4gICAgICBpZiAocG9pbnRzLmxlbmd0aCA+IDEpIG1vdmUoZXZlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3MCA9IHNlbGVjdGlvblswXVswXTtcbiAgICAgIG4wID0gc2VsZWN0aW9uWzBdWzFdO1xuICAgICAgZTAgPSBzZWxlY3Rpb25bMV1bMF07XG4gICAgICBzMCA9IHNlbGVjdGlvblsxXVsxXTtcbiAgICB9XG5cbiAgICB3MSA9IHcwO1xuICAgIG4xID0gbjA7XG4gICAgZTEgPSBlMDtcbiAgICBzMSA9IHMwO1xuXG4gICAgdmFyIGdyb3VwID0gc2VsZWN0KHRoYXQpXG4gICAgICAgIC5hdHRyKFwicG9pbnRlci1ldmVudHNcIiwgXCJub25lXCIpO1xuXG4gICAgdmFyIG92ZXJsYXkgPSBncm91cC5zZWxlY3RBbGwoXCIub3ZlcmxheVwiKVxuICAgICAgICAuYXR0cihcImN1cnNvclwiLCBjdXJzb3JzW3R5cGVdKTtcblxuICAgIGlmIChldmVudC50b3VjaGVzKSB7XG4gICAgICBlbWl0Lm1vdmVkID0gbW92ZWQ7XG4gICAgICBlbWl0LmVuZGVkID0gZW5kZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB2aWV3ID0gc2VsZWN0KGV2ZW50LnZpZXcpXG4gICAgICAgICAgLm9uKFwibW91c2Vtb3ZlLmJydXNoXCIsIG1vdmVkLCB0cnVlKVxuICAgICAgICAgIC5vbihcIm1vdXNldXAuYnJ1c2hcIiwgZW5kZWQsIHRydWUpO1xuICAgICAgaWYgKGtleXMpIHZpZXdcbiAgICAgICAgICAub24oXCJrZXlkb3duLmJydXNoXCIsIGtleWRvd25lZCwgdHJ1ZSlcbiAgICAgICAgICAub24oXCJrZXl1cC5icnVzaFwiLCBrZXl1cHBlZCwgdHJ1ZSlcblxuICAgICAgZHJhZ0Rpc2FibGUoZXZlbnQudmlldyk7XG4gICAgfVxuXG4gICAgcmVkcmF3LmNhbGwodGhhdCk7XG4gICAgZW1pdC5zdGFydChldmVudCwgbW9kZS5uYW1lKTtcblxuICAgIGZ1bmN0aW9uIG1vdmVkKGV2ZW50KSB7XG4gICAgICBmb3IgKGNvbnN0IHAgb2YgZXZlbnQuY2hhbmdlZFRvdWNoZXMgfHwgW2V2ZW50XSkge1xuICAgICAgICBmb3IgKGNvbnN0IGQgb2YgcG9pbnRzKVxuICAgICAgICAgIGlmIChkLmlkZW50aWZpZXIgPT09IHAuaWRlbnRpZmllcikgZC5jdXIgPSBwb2ludGVyKHAsIHRoYXQpO1xuICAgICAgfVxuICAgICAgaWYgKHNoaWZ0aW5nICYmICFsb2NrWCAmJiAhbG9ja1kgJiYgcG9pbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBjb25zdCBwb2ludCA9IHBvaW50c1swXTtcbiAgICAgICAgaWYgKGFicyhwb2ludC5jdXJbMF0gLSBwb2ludFswXSkgPiBhYnMocG9pbnQuY3VyWzFdIC0gcG9pbnRbMV0pKVxuICAgICAgICAgIGxvY2tZID0gdHJ1ZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGxvY2tYID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgcG9pbnQgb2YgcG9pbnRzKVxuICAgICAgICBpZiAocG9pbnQuY3VyKSBwb2ludFswXSA9IHBvaW50LmN1clswXSwgcG9pbnRbMV0gPSBwb2ludC5jdXJbMV07XG4gICAgICBtb3ZpbmcgPSB0cnVlO1xuICAgICAgbm9ldmVudChldmVudCk7XG4gICAgICBtb3ZlKGV2ZW50KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtb3ZlKGV2ZW50KSB7XG4gICAgICBjb25zdCBwb2ludCA9IHBvaW50c1swXSwgcG9pbnQwID0gcG9pbnQucG9pbnQwO1xuICAgICAgdmFyIHQ7XG5cbiAgICAgIGR4ID0gcG9pbnRbMF0gLSBwb2ludDBbMF07XG4gICAgICBkeSA9IHBvaW50WzFdIC0gcG9pbnQwWzFdO1xuXG4gICAgICBzd2l0Y2ggKG1vZGUpIHtcbiAgICAgICAgY2FzZSBNT0RFX1NQQUNFOlxuICAgICAgICBjYXNlIE1PREVfRFJBRzoge1xuICAgICAgICAgIGlmIChzaWduWCkgZHggPSBtYXgoVyAtIHcwLCBtaW4oRSAtIGUwLCBkeCkpLCB3MSA9IHcwICsgZHgsIGUxID0gZTAgKyBkeDtcbiAgICAgICAgICBpZiAoc2lnblkpIGR5ID0gbWF4KE4gLSBuMCwgbWluKFMgLSBzMCwgZHkpKSwgbjEgPSBuMCArIGR5LCBzMSA9IHMwICsgZHk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBNT0RFX0hBTkRMRToge1xuICAgICAgICAgIGlmIChwb2ludHNbMV0pIHtcbiAgICAgICAgICAgIGlmIChzaWduWCkgdzEgPSBtYXgoVywgbWluKEUsIHBvaW50c1swXVswXSkpLCBlMSA9IG1heChXLCBtaW4oRSwgcG9pbnRzWzFdWzBdKSksIHNpZ25YID0gMTtcbiAgICAgICAgICAgIGlmIChzaWduWSkgbjEgPSBtYXgoTiwgbWluKFMsIHBvaW50c1swXVsxXSkpLCBzMSA9IG1heChOLCBtaW4oUywgcG9pbnRzWzFdWzFdKSksIHNpZ25ZID0gMTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHNpZ25YIDwgMCkgZHggPSBtYXgoVyAtIHcwLCBtaW4oRSAtIHcwLCBkeCkpLCB3MSA9IHcwICsgZHgsIGUxID0gZTA7XG4gICAgICAgICAgICBlbHNlIGlmIChzaWduWCA+IDApIGR4ID0gbWF4KFcgLSBlMCwgbWluKEUgLSBlMCwgZHgpKSwgdzEgPSB3MCwgZTEgPSBlMCArIGR4O1xuICAgICAgICAgICAgaWYgKHNpZ25ZIDwgMCkgZHkgPSBtYXgoTiAtIG4wLCBtaW4oUyAtIG4wLCBkeSkpLCBuMSA9IG4wICsgZHksIHMxID0gczA7XG4gICAgICAgICAgICBlbHNlIGlmIChzaWduWSA+IDApIGR5ID0gbWF4KE4gLSBzMCwgbWluKFMgLSBzMCwgZHkpKSwgbjEgPSBuMCwgczEgPSBzMCArIGR5O1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIE1PREVfQ0VOVEVSOiB7XG4gICAgICAgICAgaWYgKHNpZ25YKSB3MSA9IG1heChXLCBtaW4oRSwgdzAgLSBkeCAqIHNpZ25YKSksIGUxID0gbWF4KFcsIG1pbihFLCBlMCArIGR4ICogc2lnblgpKTtcbiAgICAgICAgICBpZiAoc2lnblkpIG4xID0gbWF4KE4sIG1pbihTLCBuMCAtIGR5ICogc2lnblkpKSwgczEgPSBtYXgoTiwgbWluKFMsIHMwICsgZHkgKiBzaWduWSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChlMSA8IHcxKSB7XG4gICAgICAgIHNpZ25YICo9IC0xO1xuICAgICAgICB0ID0gdzAsIHcwID0gZTAsIGUwID0gdDtcbiAgICAgICAgdCA9IHcxLCB3MSA9IGUxLCBlMSA9IHQ7XG4gICAgICAgIGlmICh0eXBlIGluIGZsaXBYKSBvdmVybGF5LmF0dHIoXCJjdXJzb3JcIiwgY3Vyc29yc1t0eXBlID0gZmxpcFhbdHlwZV1dKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHMxIDwgbjEpIHtcbiAgICAgICAgc2lnblkgKj0gLTE7XG4gICAgICAgIHQgPSBuMCwgbjAgPSBzMCwgczAgPSB0O1xuICAgICAgICB0ID0gbjEsIG4xID0gczEsIHMxID0gdDtcbiAgICAgICAgaWYgKHR5cGUgaW4gZmxpcFkpIG92ZXJsYXkuYXR0cihcImN1cnNvclwiLCBjdXJzb3JzW3R5cGUgPSBmbGlwWVt0eXBlXV0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUuc2VsZWN0aW9uKSBzZWxlY3Rpb24gPSBzdGF0ZS5zZWxlY3Rpb247IC8vIE1heSBiZSBzZXQgYnkgYnJ1c2gubW92ZSFcbiAgICAgIGlmIChsb2NrWCkgdzEgPSBzZWxlY3Rpb25bMF1bMF0sIGUxID0gc2VsZWN0aW9uWzFdWzBdO1xuICAgICAgaWYgKGxvY2tZKSBuMSA9IHNlbGVjdGlvblswXVsxXSwgczEgPSBzZWxlY3Rpb25bMV1bMV07XG5cbiAgICAgIGlmIChzZWxlY3Rpb25bMF1bMF0gIT09IHcxXG4gICAgICAgICAgfHwgc2VsZWN0aW9uWzBdWzFdICE9PSBuMVxuICAgICAgICAgIHx8IHNlbGVjdGlvblsxXVswXSAhPT0gZTFcbiAgICAgICAgICB8fCBzZWxlY3Rpb25bMV1bMV0gIT09IHMxKSB7XG4gICAgICAgIHN0YXRlLnNlbGVjdGlvbiA9IFtbdzEsIG4xXSwgW2UxLCBzMV1dO1xuICAgICAgICByZWRyYXcuY2FsbCh0aGF0KTtcbiAgICAgICAgZW1pdC5icnVzaChldmVudCwgbW9kZS5uYW1lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlbmRlZChldmVudCkge1xuICAgICAgbm9wcm9wYWdhdGlvbihldmVudCk7XG4gICAgICBpZiAoZXZlbnQudG91Y2hlcykge1xuICAgICAgICBpZiAoZXZlbnQudG91Y2hlcy5sZW5ndGgpIHJldHVybjtcbiAgICAgICAgaWYgKHRvdWNoZW5kaW5nKSBjbGVhclRpbWVvdXQodG91Y2hlbmRpbmcpO1xuICAgICAgICB0b3VjaGVuZGluZyA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHRvdWNoZW5kaW5nID0gbnVsbDsgfSwgNTAwKTsgLy8gR2hvc3QgY2xpY2tzIGFyZSBkZWxheWVkIVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZHJhZ0VuYWJsZShldmVudC52aWV3LCBtb3ZpbmcpO1xuICAgICAgICB2aWV3Lm9uKFwia2V5ZG93bi5icnVzaCBrZXl1cC5icnVzaCBtb3VzZW1vdmUuYnJ1c2ggbW91c2V1cC5icnVzaFwiLCBudWxsKTtcbiAgICAgIH1cbiAgICAgIGdyb3VwLmF0dHIoXCJwb2ludGVyLWV2ZW50c1wiLCBcImFsbFwiKTtcbiAgICAgIG92ZXJsYXkuYXR0cihcImN1cnNvclwiLCBjdXJzb3JzLm92ZXJsYXkpO1xuICAgICAgaWYgKHN0YXRlLnNlbGVjdGlvbikgc2VsZWN0aW9uID0gc3RhdGUuc2VsZWN0aW9uOyAvLyBNYXkgYmUgc2V0IGJ5IGJydXNoLm1vdmUgKG9uIHN0YXJ0KSFcbiAgICAgIGlmIChlbXB0eShzZWxlY3Rpb24pKSBzdGF0ZS5zZWxlY3Rpb24gPSBudWxsLCByZWRyYXcuY2FsbCh0aGF0KTtcbiAgICAgIGVtaXQuZW5kKGV2ZW50LCBtb2RlLm5hbWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGtleWRvd25lZChldmVudCkge1xuICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgIGNhc2UgMTY6IHsgLy8gU0hJRlRcbiAgICAgICAgICBzaGlmdGluZyA9IHNpZ25YICYmIHNpZ25ZO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgMTg6IHsgLy8gQUxUXG4gICAgICAgICAgaWYgKG1vZGUgPT09IE1PREVfSEFORExFKSB7XG4gICAgICAgICAgICBpZiAoc2lnblgpIGUwID0gZTEgLSBkeCAqIHNpZ25YLCB3MCA9IHcxICsgZHggKiBzaWduWDtcbiAgICAgICAgICAgIGlmIChzaWduWSkgczAgPSBzMSAtIGR5ICogc2lnblksIG4wID0gbjEgKyBkeSAqIHNpZ25ZO1xuICAgICAgICAgICAgbW9kZSA9IE1PREVfQ0VOVEVSO1xuICAgICAgICAgICAgbW92ZShldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgMzI6IHsgLy8gU1BBQ0U7IHRha2VzIHByaW9yaXR5IG92ZXIgQUxUXG4gICAgICAgICAgaWYgKG1vZGUgPT09IE1PREVfSEFORExFIHx8IG1vZGUgPT09IE1PREVfQ0VOVEVSKSB7XG4gICAgICAgICAgICBpZiAoc2lnblggPCAwKSBlMCA9IGUxIC0gZHg7IGVsc2UgaWYgKHNpZ25YID4gMCkgdzAgPSB3MSAtIGR4O1xuICAgICAgICAgICAgaWYgKHNpZ25ZIDwgMCkgczAgPSBzMSAtIGR5OyBlbHNlIGlmIChzaWduWSA+IDApIG4wID0gbjEgLSBkeTtcbiAgICAgICAgICAgIG1vZGUgPSBNT0RFX1NQQUNFO1xuICAgICAgICAgICAgb3ZlcmxheS5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnMuc2VsZWN0aW9uKTtcbiAgICAgICAgICAgIG1vdmUoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiByZXR1cm47XG4gICAgICB9XG4gICAgICBub2V2ZW50KGV2ZW50KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBrZXl1cHBlZChldmVudCkge1xuICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgIGNhc2UgMTY6IHsgLy8gU0hJRlRcbiAgICAgICAgICBpZiAoc2hpZnRpbmcpIHtcbiAgICAgICAgICAgIGxvY2tYID0gbG9ja1kgPSBzaGlmdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgbW92ZShldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgMTg6IHsgLy8gQUxUXG4gICAgICAgICAgaWYgKG1vZGUgPT09IE1PREVfQ0VOVEVSKSB7XG4gICAgICAgICAgICBpZiAoc2lnblggPCAwKSBlMCA9IGUxOyBlbHNlIGlmIChzaWduWCA+IDApIHcwID0gdzE7XG4gICAgICAgICAgICBpZiAoc2lnblkgPCAwKSBzMCA9IHMxOyBlbHNlIGlmIChzaWduWSA+IDApIG4wID0gbjE7XG4gICAgICAgICAgICBtb2RlID0gTU9ERV9IQU5ETEU7XG4gICAgICAgICAgICBtb3ZlKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAzMjogeyAvLyBTUEFDRVxuICAgICAgICAgIGlmIChtb2RlID09PSBNT0RFX1NQQUNFKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuYWx0S2V5KSB7XG4gICAgICAgICAgICAgIGlmIChzaWduWCkgZTAgPSBlMSAtIGR4ICogc2lnblgsIHcwID0gdzEgKyBkeCAqIHNpZ25YO1xuICAgICAgICAgICAgICBpZiAoc2lnblkpIHMwID0gczEgLSBkeSAqIHNpZ25ZLCBuMCA9IG4xICsgZHkgKiBzaWduWTtcbiAgICAgICAgICAgICAgbW9kZSA9IE1PREVfQ0VOVEVSO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKHNpZ25YIDwgMCkgZTAgPSBlMTsgZWxzZSBpZiAoc2lnblggPiAwKSB3MCA9IHcxO1xuICAgICAgICAgICAgICBpZiAoc2lnblkgPCAwKSBzMCA9IHMxOyBlbHNlIGlmIChzaWduWSA+IDApIG4wID0gbjE7XG4gICAgICAgICAgICAgIG1vZGUgPSBNT0RFX0hBTkRMRTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG92ZXJsYXkuYXR0cihcImN1cnNvclwiLCBjdXJzb3JzW3R5cGVdKTtcbiAgICAgICAgICAgIG1vdmUoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiByZXR1cm47XG4gICAgICB9XG4gICAgICBub2V2ZW50KGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0b3VjaG1vdmVkKGV2ZW50KSB7XG4gICAgZW1pdHRlcih0aGlzLCBhcmd1bWVudHMpLm1vdmVkKGV2ZW50KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRvdWNoZW5kZWQoZXZlbnQpIHtcbiAgICBlbWl0dGVyKHRoaXMsIGFyZ3VtZW50cykuZW5kZWQoZXZlbnQpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLl9fYnJ1c2ggfHwge3NlbGVjdGlvbjogbnVsbH07XG4gICAgc3RhdGUuZXh0ZW50ID0gbnVtYmVyMihleHRlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgc3RhdGUuZGltID0gZGltO1xuICAgIHJldHVybiBzdGF0ZTtcbiAgfVxuXG4gIGJydXNoLmV4dGVudCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChleHRlbnQgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KG51bWJlcjIoXykpLCBicnVzaCkgOiBleHRlbnQ7XG4gIH07XG5cbiAgYnJ1c2guZmlsdGVyID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGZpbHRlciA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoISFfKSwgYnJ1c2gpIDogZmlsdGVyO1xuICB9O1xuXG4gIGJydXNoLnRvdWNoYWJsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh0b3VjaGFibGUgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCEhXyksIGJydXNoKSA6IHRvdWNoYWJsZTtcbiAgfTtcblxuICBicnVzaC5oYW5kbGVTaXplID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGhhbmRsZVNpemUgPSArXywgYnJ1c2gpIDogaGFuZGxlU2l6ZTtcbiAgfTtcblxuICBicnVzaC5rZXlNb2RpZmllcnMgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoa2V5cyA9ICEhXywgYnJ1c2gpIDoga2V5cztcbiAgfTtcblxuICBicnVzaC5vbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZSA9IGxpc3RlbmVycy5vbi5hcHBseShsaXN0ZW5lcnMsIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHZhbHVlID09PSBsaXN0ZW5lcnMgPyBicnVzaCA6IHZhbHVlO1xuICB9O1xuXG4gIHJldHVybiBicnVzaDtcbn1cbiIsImV4cG9ydCB7XG4gIGRlZmF1bHQgYXMgYnJ1c2gsXG4gIGJydXNoWCxcbiAgYnJ1c2hZLFxuICBicnVzaFNlbGVjdGlvblxufSBmcm9tIFwiLi9icnVzaC5qc1wiO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgdmFyIGNvbnRlbnQgPSBpdGVtWzFdO1xuICB2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG4gIGlmICghY3NzTWFwcGluZykge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG4gIGlmICh0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KGNzc01hcHBpbmcpKSkpO1xuICAgIHZhciBkYXRhID0gXCJzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxcIi5jb25jYXQoYmFzZTY0KTtcbiAgICB2YXIgc291cmNlTWFwcGluZyA9IFwiLyojIFwiLmNvbmNhdChkYXRhLCBcIiAqL1wiKTtcbiAgICByZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oXCJcXG5cIik7XG4gIH1cbiAgcmV0dXJuIFtjb250ZW50XS5qb2luKFwiXFxuXCIpO1xufTsiLCJmdW5jdGlvbiByZXNwb25zZUJsb2IocmVzcG9uc2UpIHtcbiAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKHJlc3BvbnNlLnN0YXR1cyArIFwiIFwiICsgcmVzcG9uc2Uuc3RhdHVzVGV4dCk7XG4gIHJldHVybiByZXNwb25zZS5ibG9iKCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGlucHV0LCBpbml0KSB7XG4gIHJldHVybiBmZXRjaChpbnB1dCwgaW5pdCkudGhlbihyZXNwb25zZUJsb2IpO1xufVxuIiwiZnVuY3Rpb24gcmVzcG9uc2VBcnJheUJ1ZmZlcihyZXNwb25zZSkge1xuICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IocmVzcG9uc2Uuc3RhdHVzICsgXCIgXCIgKyByZXNwb25zZS5zdGF0dXNUZXh0KTtcbiAgcmV0dXJuIHJlc3BvbnNlLmFycmF5QnVmZmVyKCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGlucHV0LCBpbml0KSB7XG4gIHJldHVybiBmZXRjaChpbnB1dCwgaW5pdCkudGhlbihyZXNwb25zZUFycmF5QnVmZmVyKTtcbn1cbiIsImZ1bmN0aW9uIHJlc3BvbnNlVGV4dChyZXNwb25zZSkge1xuICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IocmVzcG9uc2Uuc3RhdHVzICsgXCIgXCIgKyByZXNwb25zZS5zdGF0dXNUZXh0KTtcbiAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5wdXQsIGluaXQpIHtcbiAgcmV0dXJuIGZldGNoKGlucHV0LCBpbml0KS50aGVuKHJlc3BvbnNlVGV4dCk7XG59XG4iLCJpbXBvcnQge2NzdlBhcnNlLCBkc3ZGb3JtYXQsIHRzdlBhcnNlfSBmcm9tIFwiZDMtZHN2XCI7XG5pbXBvcnQgdGV4dCBmcm9tIFwiLi90ZXh0LmpzXCI7XG5cbmZ1bmN0aW9uIGRzdlBhcnNlKHBhcnNlKSB7XG4gIHJldHVybiBmdW5jdGlvbihpbnB1dCwgaW5pdCwgcm93KSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIgJiYgdHlwZW9mIGluaXQgPT09IFwiZnVuY3Rpb25cIikgcm93ID0gaW5pdCwgaW5pdCA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gdGV4dChpbnB1dCwgaW5pdCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgcmV0dXJuIHBhcnNlKHJlc3BvbnNlLCByb3cpO1xuICAgIH0pO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkc3YoZGVsaW1pdGVyLCBpbnB1dCwgaW5pdCwgcm93KSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzICYmIHR5cGVvZiBpbml0ID09PSBcImZ1bmN0aW9uXCIpIHJvdyA9IGluaXQsIGluaXQgPSB1bmRlZmluZWQ7XG4gIHZhciBmb3JtYXQgPSBkc3ZGb3JtYXQoZGVsaW1pdGVyKTtcbiAgcmV0dXJuIHRleHQoaW5wdXQsIGluaXQpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICByZXR1cm4gZm9ybWF0LnBhcnNlKHJlc3BvbnNlLCByb3cpO1xuICB9KTtcbn1cblxuZXhwb3J0IHZhciBjc3YgPSBkc3ZQYXJzZShjc3ZQYXJzZSk7XG5leHBvcnQgdmFyIHRzdiA9IGRzdlBhcnNlKHRzdlBhcnNlKTtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGlucHV0LCBpbml0KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2U7XG4gICAgZm9yICh2YXIga2V5IGluIGluaXQpIGltYWdlW2tleV0gPSBpbml0W2tleV07XG4gICAgaW1hZ2Uub25lcnJvciA9IHJlamVjdDtcbiAgICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbigpIHsgcmVzb2x2ZShpbWFnZSk7IH07XG4gICAgaW1hZ2Uuc3JjID0gaW5wdXQ7XG4gIH0pO1xufVxuIiwiZnVuY3Rpb24gcmVzcG9uc2VKc29uKHJlc3BvbnNlKSB7XG4gIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihyZXNwb25zZS5zdGF0dXMgKyBcIiBcIiArIHJlc3BvbnNlLnN0YXR1c1RleHQpO1xuICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSAyMDQgfHwgcmVzcG9uc2Uuc3RhdHVzID09PSAyMDUpIHJldHVybjtcbiAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5wdXQsIGluaXQpIHtcbiAgcmV0dXJuIGZldGNoKGlucHV0LCBpbml0KS50aGVuKHJlc3BvbnNlSnNvbik7XG59XG4iLCJpbXBvcnQgdGV4dCBmcm9tIFwiLi90ZXh0LmpzXCI7XG5cbmZ1bmN0aW9uIHBhcnNlcih0eXBlKSB7XG4gIHJldHVybiAoaW5wdXQsIGluaXQpID0+IHRleHQoaW5wdXQsIGluaXQpXG4gICAgLnRoZW4odGV4dCA9PiAobmV3IERPTVBhcnNlcikucGFyc2VGcm9tU3RyaW5nKHRleHQsIHR5cGUpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcGFyc2VyKFwiYXBwbGljYXRpb24veG1sXCIpO1xuXG5leHBvcnQgdmFyIGh0bWwgPSBwYXJzZXIoXCJ0ZXh0L2h0bWxcIik7XG5cbmV4cG9ydCB2YXIgc3ZnID0gcGFyc2VyKFwiaW1hZ2Uvc3ZnK3htbFwiKTtcbiIsImV4cG9ydCB7ZGVmYXVsdCBhcyBibG9ifSBmcm9tIFwiLi9ibG9iLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgYnVmZmVyfSBmcm9tIFwiLi9idWZmZXIuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBkc3YsIGNzdiwgdHN2fSBmcm9tIFwiLi9kc3YuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBpbWFnZX0gZnJvbSBcIi4vaW1hZ2UuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBqc29ufSBmcm9tIFwiLi9qc29uLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgdGV4dH0gZnJvbSBcIi4vdGV4dC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHhtbCwgaHRtbCwgc3ZnfSBmcm9tIFwiLi94bWwuanNcIjtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbnN0cnVjdG9yLCBmYWN0b3J5LCBwcm90b3R5cGUpIHtcbiAgY29uc3RydWN0b3IucHJvdG90eXBlID0gZmFjdG9yeS5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gIHByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGNvbnN0cnVjdG9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kKHBhcmVudCwgZGVmaW5pdGlvbikge1xuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShwYXJlbnQucHJvdG90eXBlKTtcbiAgZm9yICh2YXIga2V5IGluIGRlZmluaXRpb24pIHByb3RvdHlwZVtrZXldID0gZGVmaW5pdGlvbltrZXldO1xuICByZXR1cm4gcHJvdG90eXBlO1xufVxuIiwiaW1wb3J0IGRlZmluZSwge2V4dGVuZH0gZnJvbSBcIi4vZGVmaW5lLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBDb2xvcigpIHt9XG5cbmV4cG9ydCB2YXIgZGFya2VyID0gMC43O1xuZXhwb3J0IHZhciBicmlnaHRlciA9IDEgLyBkYXJrZXI7XG5cbnZhciByZUkgPSBcIlxcXFxzKihbKy1dP1xcXFxkKylcXFxccypcIixcbiAgICByZU4gPSBcIlxcXFxzKihbKy1dPyg/OlxcXFxkKlxcXFwuKT9cXFxcZCsoPzpbZUVdWystXT9cXFxcZCspPylcXFxccypcIixcbiAgICByZVAgPSBcIlxcXFxzKihbKy1dPyg/OlxcXFxkKlxcXFwuKT9cXFxcZCsoPzpbZUVdWystXT9cXFxcZCspPyklXFxcXHMqXCIsXG4gICAgcmVIZXggPSAvXiMoWzAtOWEtZl17Myw4fSkkLyxcbiAgICByZVJnYkludGVnZXIgPSBuZXcgUmVnRXhwKGBecmdiXFxcXCgke3JlSX0sJHtyZUl9LCR7cmVJfVxcXFwpJGApLFxuICAgIHJlUmdiUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5yZ2JcXFxcKCR7cmVQfSwke3JlUH0sJHtyZVB9XFxcXCkkYCksXG4gICAgcmVSZ2JhSW50ZWdlciA9IG5ldyBSZWdFeHAoYF5yZ2JhXFxcXCgke3JlSX0sJHtyZUl9LCR7cmVJfSwke3JlTn1cXFxcKSRgKSxcbiAgICByZVJnYmFQZXJjZW50ID0gbmV3IFJlZ0V4cChgXnJnYmFcXFxcKCR7cmVQfSwke3JlUH0sJHtyZVB9LCR7cmVOfVxcXFwpJGApLFxuICAgIHJlSHNsUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5oc2xcXFxcKCR7cmVOfSwke3JlUH0sJHtyZVB9XFxcXCkkYCksXG4gICAgcmVIc2xhUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5oc2xhXFxcXCgke3JlTn0sJHtyZVB9LCR7cmVQfSwke3JlTn1cXFxcKSRgKTtcblxudmFyIG5hbWVkID0ge1xuICBhbGljZWJsdWU6IDB4ZjBmOGZmLFxuICBhbnRpcXVld2hpdGU6IDB4ZmFlYmQ3LFxuICBhcXVhOiAweDAwZmZmZixcbiAgYXF1YW1hcmluZTogMHg3ZmZmZDQsXG4gIGF6dXJlOiAweGYwZmZmZixcbiAgYmVpZ2U6IDB4ZjVmNWRjLFxuICBiaXNxdWU6IDB4ZmZlNGM0LFxuICBibGFjazogMHgwMDAwMDAsXG4gIGJsYW5jaGVkYWxtb25kOiAweGZmZWJjZCxcbiAgYmx1ZTogMHgwMDAwZmYsXG4gIGJsdWV2aW9sZXQ6IDB4OGEyYmUyLFxuICBicm93bjogMHhhNTJhMmEsXG4gIGJ1cmx5d29vZDogMHhkZWI4ODcsXG4gIGNhZGV0Ymx1ZTogMHg1ZjllYTAsXG4gIGNoYXJ0cmV1c2U6IDB4N2ZmZjAwLFxuICBjaG9jb2xhdGU6IDB4ZDI2OTFlLFxuICBjb3JhbDogMHhmZjdmNTAsXG4gIGNvcm5mbG93ZXJibHVlOiAweDY0OTVlZCxcbiAgY29ybnNpbGs6IDB4ZmZmOGRjLFxuICBjcmltc29uOiAweGRjMTQzYyxcbiAgY3lhbjogMHgwMGZmZmYsXG4gIGRhcmtibHVlOiAweDAwMDA4YixcbiAgZGFya2N5YW46IDB4MDA4YjhiLFxuICBkYXJrZ29sZGVucm9kOiAweGI4ODYwYixcbiAgZGFya2dyYXk6IDB4YTlhOWE5LFxuICBkYXJrZ3JlZW46IDB4MDA2NDAwLFxuICBkYXJrZ3JleTogMHhhOWE5YTksXG4gIGRhcmtraGFraTogMHhiZGI3NmIsXG4gIGRhcmttYWdlbnRhOiAweDhiMDA4YixcbiAgZGFya29saXZlZ3JlZW46IDB4NTU2YjJmLFxuICBkYXJrb3JhbmdlOiAweGZmOGMwMCxcbiAgZGFya29yY2hpZDogMHg5OTMyY2MsXG4gIGRhcmtyZWQ6IDB4OGIwMDAwLFxuICBkYXJrc2FsbW9uOiAweGU5OTY3YSxcbiAgZGFya3NlYWdyZWVuOiAweDhmYmM4ZixcbiAgZGFya3NsYXRlYmx1ZTogMHg0ODNkOGIsXG4gIGRhcmtzbGF0ZWdyYXk6IDB4MmY0ZjRmLFxuICBkYXJrc2xhdGVncmV5OiAweDJmNGY0ZixcbiAgZGFya3R1cnF1b2lzZTogMHgwMGNlZDEsXG4gIGRhcmt2aW9sZXQ6IDB4OTQwMGQzLFxuICBkZWVwcGluazogMHhmZjE0OTMsXG4gIGRlZXBza3libHVlOiAweDAwYmZmZixcbiAgZGltZ3JheTogMHg2OTY5NjksXG4gIGRpbWdyZXk6IDB4Njk2OTY5LFxuICBkb2RnZXJibHVlOiAweDFlOTBmZixcbiAgZmlyZWJyaWNrOiAweGIyMjIyMixcbiAgZmxvcmFsd2hpdGU6IDB4ZmZmYWYwLFxuICBmb3Jlc3RncmVlbjogMHgyMjhiMjIsXG4gIGZ1Y2hzaWE6IDB4ZmYwMGZmLFxuICBnYWluc2Jvcm86IDB4ZGNkY2RjLFxuICBnaG9zdHdoaXRlOiAweGY4ZjhmZixcbiAgZ29sZDogMHhmZmQ3MDAsXG4gIGdvbGRlbnJvZDogMHhkYWE1MjAsXG4gIGdyYXk6IDB4ODA4MDgwLFxuICBncmVlbjogMHgwMDgwMDAsXG4gIGdyZWVueWVsbG93OiAweGFkZmYyZixcbiAgZ3JleTogMHg4MDgwODAsXG4gIGhvbmV5ZGV3OiAweGYwZmZmMCxcbiAgaG90cGluazogMHhmZjY5YjQsXG4gIGluZGlhbnJlZDogMHhjZDVjNWMsXG4gIGluZGlnbzogMHg0YjAwODIsXG4gIGl2b3J5OiAweGZmZmZmMCxcbiAga2hha2k6IDB4ZjBlNjhjLFxuICBsYXZlbmRlcjogMHhlNmU2ZmEsXG4gIGxhdmVuZGVyYmx1c2g6IDB4ZmZmMGY1LFxuICBsYXduZ3JlZW46IDB4N2NmYzAwLFxuICBsZW1vbmNoaWZmb246IDB4ZmZmYWNkLFxuICBsaWdodGJsdWU6IDB4YWRkOGU2LFxuICBsaWdodGNvcmFsOiAweGYwODA4MCxcbiAgbGlnaHRjeWFuOiAweGUwZmZmZixcbiAgbGlnaHRnb2xkZW5yb2R5ZWxsb3c6IDB4ZmFmYWQyLFxuICBsaWdodGdyYXk6IDB4ZDNkM2QzLFxuICBsaWdodGdyZWVuOiAweDkwZWU5MCxcbiAgbGlnaHRncmV5OiAweGQzZDNkMyxcbiAgbGlnaHRwaW5rOiAweGZmYjZjMSxcbiAgbGlnaHRzYWxtb246IDB4ZmZhMDdhLFxuICBsaWdodHNlYWdyZWVuOiAweDIwYjJhYSxcbiAgbGlnaHRza3libHVlOiAweDg3Y2VmYSxcbiAgbGlnaHRzbGF0ZWdyYXk6IDB4Nzc4ODk5LFxuICBsaWdodHNsYXRlZ3JleTogMHg3Nzg4OTksXG4gIGxpZ2h0c3RlZWxibHVlOiAweGIwYzRkZSxcbiAgbGlnaHR5ZWxsb3c6IDB4ZmZmZmUwLFxuICBsaW1lOiAweDAwZmYwMCxcbiAgbGltZWdyZWVuOiAweDMyY2QzMixcbiAgbGluZW46IDB4ZmFmMGU2LFxuICBtYWdlbnRhOiAweGZmMDBmZixcbiAgbWFyb29uOiAweDgwMDAwMCxcbiAgbWVkaXVtYXF1YW1hcmluZTogMHg2NmNkYWEsXG4gIG1lZGl1bWJsdWU6IDB4MDAwMGNkLFxuICBtZWRpdW1vcmNoaWQ6IDB4YmE1NWQzLFxuICBtZWRpdW1wdXJwbGU6IDB4OTM3MGRiLFxuICBtZWRpdW1zZWFncmVlbjogMHgzY2IzNzEsXG4gIG1lZGl1bXNsYXRlYmx1ZTogMHg3YjY4ZWUsXG4gIG1lZGl1bXNwcmluZ2dyZWVuOiAweDAwZmE5YSxcbiAgbWVkaXVtdHVycXVvaXNlOiAweDQ4ZDFjYyxcbiAgbWVkaXVtdmlvbGV0cmVkOiAweGM3MTU4NSxcbiAgbWlkbmlnaHRibHVlOiAweDE5MTk3MCxcbiAgbWludGNyZWFtOiAweGY1ZmZmYSxcbiAgbWlzdHlyb3NlOiAweGZmZTRlMSxcbiAgbW9jY2FzaW46IDB4ZmZlNGI1LFxuICBuYXZham93aGl0ZTogMHhmZmRlYWQsXG4gIG5hdnk6IDB4MDAwMDgwLFxuICBvbGRsYWNlOiAweGZkZjVlNixcbiAgb2xpdmU6IDB4ODA4MDAwLFxuICBvbGl2ZWRyYWI6IDB4NmI4ZTIzLFxuICBvcmFuZ2U6IDB4ZmZhNTAwLFxuICBvcmFuZ2VyZWQ6IDB4ZmY0NTAwLFxuICBvcmNoaWQ6IDB4ZGE3MGQ2LFxuICBwYWxlZ29sZGVucm9kOiAweGVlZThhYSxcbiAgcGFsZWdyZWVuOiAweDk4ZmI5OCxcbiAgcGFsZXR1cnF1b2lzZTogMHhhZmVlZWUsXG4gIHBhbGV2aW9sZXRyZWQ6IDB4ZGI3MDkzLFxuICBwYXBheWF3aGlwOiAweGZmZWZkNSxcbiAgcGVhY2hwdWZmOiAweGZmZGFiOSxcbiAgcGVydTogMHhjZDg1M2YsXG4gIHBpbms6IDB4ZmZjMGNiLFxuICBwbHVtOiAweGRkYTBkZCxcbiAgcG93ZGVyYmx1ZTogMHhiMGUwZTYsXG4gIHB1cnBsZTogMHg4MDAwODAsXG4gIHJlYmVjY2FwdXJwbGU6IDB4NjYzMzk5LFxuICByZWQ6IDB4ZmYwMDAwLFxuICByb3N5YnJvd246IDB4YmM4ZjhmLFxuICByb3lhbGJsdWU6IDB4NDE2OWUxLFxuICBzYWRkbGVicm93bjogMHg4YjQ1MTMsXG4gIHNhbG1vbjogMHhmYTgwNzIsXG4gIHNhbmR5YnJvd246IDB4ZjRhNDYwLFxuICBzZWFncmVlbjogMHgyZThiNTcsXG4gIHNlYXNoZWxsOiAweGZmZjVlZSxcbiAgc2llbm5hOiAweGEwNTIyZCxcbiAgc2lsdmVyOiAweGMwYzBjMCxcbiAgc2t5Ymx1ZTogMHg4N2NlZWIsXG4gIHNsYXRlYmx1ZTogMHg2YTVhY2QsXG4gIHNsYXRlZ3JheTogMHg3MDgwOTAsXG4gIHNsYXRlZ3JleTogMHg3MDgwOTAsXG4gIHNub3c6IDB4ZmZmYWZhLFxuICBzcHJpbmdncmVlbjogMHgwMGZmN2YsXG4gIHN0ZWVsYmx1ZTogMHg0NjgyYjQsXG4gIHRhbjogMHhkMmI0OGMsXG4gIHRlYWw6IDB4MDA4MDgwLFxuICB0aGlzdGxlOiAweGQ4YmZkOCxcbiAgdG9tYXRvOiAweGZmNjM0NyxcbiAgdHVycXVvaXNlOiAweDQwZTBkMCxcbiAgdmlvbGV0OiAweGVlODJlZSxcbiAgd2hlYXQ6IDB4ZjVkZWIzLFxuICB3aGl0ZTogMHhmZmZmZmYsXG4gIHdoaXRlc21va2U6IDB4ZjVmNWY1LFxuICB5ZWxsb3c6IDB4ZmZmZjAwLFxuICB5ZWxsb3dncmVlbjogMHg5YWNkMzJcbn07XG5cbmRlZmluZShDb2xvciwgY29sb3IsIHtcbiAgY29weShjaGFubmVscykge1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5ldyB0aGlzLmNvbnN0cnVjdG9yLCB0aGlzLCBjaGFubmVscyk7XG4gIH0sXG4gIGRpc3BsYXlhYmxlKCkge1xuICAgIHJldHVybiB0aGlzLnJnYigpLmRpc3BsYXlhYmxlKCk7XG4gIH0sXG4gIGhleDogY29sb3JfZm9ybWF0SGV4LCAvLyBEZXByZWNhdGVkISBVc2UgY29sb3IuZm9ybWF0SGV4LlxuICBmb3JtYXRIZXg6IGNvbG9yX2Zvcm1hdEhleCxcbiAgZm9ybWF0SGV4ODogY29sb3JfZm9ybWF0SGV4OCxcbiAgZm9ybWF0SHNsOiBjb2xvcl9mb3JtYXRIc2wsXG4gIGZvcm1hdFJnYjogY29sb3JfZm9ybWF0UmdiLFxuICB0b1N0cmluZzogY29sb3JfZm9ybWF0UmdiXG59KTtcblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0SGV4KCkge1xuICByZXR1cm4gdGhpcy5yZ2IoKS5mb3JtYXRIZXgoKTtcbn1cblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0SGV4OCgpIHtcbiAgcmV0dXJuIHRoaXMucmdiKCkuZm9ybWF0SGV4OCgpO1xufVxuXG5mdW5jdGlvbiBjb2xvcl9mb3JtYXRIc2woKSB7XG4gIHJldHVybiBoc2xDb252ZXJ0KHRoaXMpLmZvcm1hdEhzbCgpO1xufVxuXG5mdW5jdGlvbiBjb2xvcl9mb3JtYXRSZ2IoKSB7XG4gIHJldHVybiB0aGlzLnJnYigpLmZvcm1hdFJnYigpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb2xvcihmb3JtYXQpIHtcbiAgdmFyIG0sIGw7XG4gIGZvcm1hdCA9IChmb3JtYXQgKyBcIlwiKS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgcmV0dXJuIChtID0gcmVIZXguZXhlYyhmb3JtYXQpKSA/IChsID0gbVsxXS5sZW5ndGgsIG0gPSBwYXJzZUludChtWzFdLCAxNiksIGwgPT09IDYgPyByZ2JuKG0pIC8vICNmZjAwMDBcbiAgICAgIDogbCA9PT0gMyA/IG5ldyBSZ2IoKG0gPj4gOCAmIDB4ZikgfCAobSA+PiA0ICYgMHhmMCksIChtID4+IDQgJiAweGYpIHwgKG0gJiAweGYwKSwgKChtICYgMHhmKSA8PCA0KSB8IChtICYgMHhmKSwgMSkgLy8gI2YwMFxuICAgICAgOiBsID09PSA4ID8gcmdiYShtID4+IDI0ICYgMHhmZiwgbSA+PiAxNiAmIDB4ZmYsIG0gPj4gOCAmIDB4ZmYsIChtICYgMHhmZikgLyAweGZmKSAvLyAjZmYwMDAwMDBcbiAgICAgIDogbCA9PT0gNCA/IHJnYmEoKG0gPj4gMTIgJiAweGYpIHwgKG0gPj4gOCAmIDB4ZjApLCAobSA+PiA4ICYgMHhmKSB8IChtID4+IDQgJiAweGYwKSwgKG0gPj4gNCAmIDB4ZikgfCAobSAmIDB4ZjApLCAoKChtICYgMHhmKSA8PCA0KSB8IChtICYgMHhmKSkgLyAweGZmKSAvLyAjZjAwMFxuICAgICAgOiBudWxsKSAvLyBpbnZhbGlkIGhleFxuICAgICAgOiAobSA9IHJlUmdiSW50ZWdlci5leGVjKGZvcm1hdCkpID8gbmV3IFJnYihtWzFdLCBtWzJdLCBtWzNdLCAxKSAvLyByZ2IoMjU1LCAwLCAwKVxuICAgICAgOiAobSA9IHJlUmdiUGVyY2VudC5leGVjKGZvcm1hdCkpID8gbmV3IFJnYihtWzFdICogMjU1IC8gMTAwLCBtWzJdICogMjU1IC8gMTAwLCBtWzNdICogMjU1IC8gMTAwLCAxKSAvLyByZ2IoMTAwJSwgMCUsIDAlKVxuICAgICAgOiAobSA9IHJlUmdiYUludGVnZXIuZXhlYyhmb3JtYXQpKSA/IHJnYmEobVsxXSwgbVsyXSwgbVszXSwgbVs0XSkgLy8gcmdiYSgyNTUsIDAsIDAsIDEpXG4gICAgICA6IChtID0gcmVSZ2JhUGVyY2VudC5leGVjKGZvcm1hdCkpID8gcmdiYShtWzFdICogMjU1IC8gMTAwLCBtWzJdICogMjU1IC8gMTAwLCBtWzNdICogMjU1IC8gMTAwLCBtWzRdKSAvLyByZ2IoMTAwJSwgMCUsIDAlLCAxKVxuICAgICAgOiAobSA9IHJlSHNsUGVyY2VudC5leGVjKGZvcm1hdCkpID8gaHNsYShtWzFdLCBtWzJdIC8gMTAwLCBtWzNdIC8gMTAwLCAxKSAvLyBoc2woMTIwLCA1MCUsIDUwJSlcbiAgICAgIDogKG0gPSByZUhzbGFQZXJjZW50LmV4ZWMoZm9ybWF0KSkgPyBoc2xhKG1bMV0sIG1bMl0gLyAxMDAsIG1bM10gLyAxMDAsIG1bNF0pIC8vIGhzbGEoMTIwLCA1MCUsIDUwJSwgMSlcbiAgICAgIDogbmFtZWQuaGFzT3duUHJvcGVydHkoZm9ybWF0KSA/IHJnYm4obmFtZWRbZm9ybWF0XSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbiAgICAgIDogZm9ybWF0ID09PSBcInRyYW5zcGFyZW50XCIgPyBuZXcgUmdiKE5hTiwgTmFOLCBOYU4sIDApXG4gICAgICA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIHJnYm4obikge1xuICByZXR1cm4gbmV3IFJnYihuID4+IDE2ICYgMHhmZiwgbiA+PiA4ICYgMHhmZiwgbiAmIDB4ZmYsIDEpO1xufVxuXG5mdW5jdGlvbiByZ2JhKHIsIGcsIGIsIGEpIHtcbiAgaWYgKGEgPD0gMCkgciA9IGcgPSBiID0gTmFOO1xuICByZXR1cm4gbmV3IFJnYihyLCBnLCBiLCBhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJnYkNvbnZlcnQobykge1xuICBpZiAoIShvIGluc3RhbmNlb2YgQ29sb3IpKSBvID0gY29sb3Iobyk7XG4gIGlmICghbykgcmV0dXJuIG5ldyBSZ2I7XG4gIG8gPSBvLnJnYigpO1xuICByZXR1cm4gbmV3IFJnYihvLnIsIG8uZywgby5iLCBvLm9wYWNpdHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmdiKHIsIGcsIGIsIG9wYWNpdHkpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgPyByZ2JDb252ZXJ0KHIpIDogbmV3IFJnYihyLCBnLCBiLCBvcGFjaXR5ID09IG51bGwgPyAxIDogb3BhY2l0eSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZ2IociwgZywgYiwgb3BhY2l0eSkge1xuICB0aGlzLnIgPSArcjtcbiAgdGhpcy5nID0gK2c7XG4gIHRoaXMuYiA9ICtiO1xuICB0aGlzLm9wYWNpdHkgPSArb3BhY2l0eTtcbn1cblxuZGVmaW5lKFJnYiwgcmdiLCBleHRlbmQoQ29sb3IsIHtcbiAgYnJpZ2h0ZXIoaykge1xuICAgIGsgPSBrID09IG51bGwgPyBicmlnaHRlciA6IE1hdGgucG93KGJyaWdodGVyLCBrKTtcbiAgICByZXR1cm4gbmV3IFJnYih0aGlzLnIgKiBrLCB0aGlzLmcgKiBrLCB0aGlzLmIgKiBrLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICBkYXJrZXIoaykge1xuICAgIGsgPSBrID09IG51bGwgPyBkYXJrZXIgOiBNYXRoLnBvdyhkYXJrZXIsIGspO1xuICAgIHJldHVybiBuZXcgUmdiKHRoaXMuciAqIGssIHRoaXMuZyAqIGssIHRoaXMuYiAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIHJnYigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgY2xhbXAoKSB7XG4gICAgcmV0dXJuIG5ldyBSZ2IoY2xhbXBpKHRoaXMuciksIGNsYW1waSh0aGlzLmcpLCBjbGFtcGkodGhpcy5iKSwgY2xhbXBhKHRoaXMub3BhY2l0eSkpO1xuICB9LFxuICBkaXNwbGF5YWJsZSgpIHtcbiAgICByZXR1cm4gKC0wLjUgPD0gdGhpcy5yICYmIHRoaXMuciA8IDI1NS41KVxuICAgICAgICAmJiAoLTAuNSA8PSB0aGlzLmcgJiYgdGhpcy5nIDwgMjU1LjUpXG4gICAgICAgICYmICgtMC41IDw9IHRoaXMuYiAmJiB0aGlzLmIgPCAyNTUuNSlcbiAgICAgICAgJiYgKDAgPD0gdGhpcy5vcGFjaXR5ICYmIHRoaXMub3BhY2l0eSA8PSAxKTtcbiAgfSxcbiAgaGV4OiByZ2JfZm9ybWF0SGV4LCAvLyBEZXByZWNhdGVkISBVc2UgY29sb3IuZm9ybWF0SGV4LlxuICBmb3JtYXRIZXg6IHJnYl9mb3JtYXRIZXgsXG4gIGZvcm1hdEhleDg6IHJnYl9mb3JtYXRIZXg4LFxuICBmb3JtYXRSZ2I6IHJnYl9mb3JtYXRSZ2IsXG4gIHRvU3RyaW5nOiByZ2JfZm9ybWF0UmdiXG59KSk7XG5cbmZ1bmN0aW9uIHJnYl9mb3JtYXRIZXgoKSB7XG4gIHJldHVybiBgIyR7aGV4KHRoaXMucil9JHtoZXgodGhpcy5nKX0ke2hleCh0aGlzLmIpfWA7XG59XG5cbmZ1bmN0aW9uIHJnYl9mb3JtYXRIZXg4KCkge1xuICByZXR1cm4gYCMke2hleCh0aGlzLnIpfSR7aGV4KHRoaXMuZyl9JHtoZXgodGhpcy5iKX0ke2hleCgoaXNOYU4odGhpcy5vcGFjaXR5KSA/IDEgOiB0aGlzLm9wYWNpdHkpICogMjU1KX1gO1xufVxuXG5mdW5jdGlvbiByZ2JfZm9ybWF0UmdiKCkge1xuICBjb25zdCBhID0gY2xhbXBhKHRoaXMub3BhY2l0eSk7XG4gIHJldHVybiBgJHthID09PSAxID8gXCJyZ2IoXCIgOiBcInJnYmEoXCJ9JHtjbGFtcGkodGhpcy5yKX0sICR7Y2xhbXBpKHRoaXMuZyl9LCAke2NsYW1waSh0aGlzLmIpfSR7YSA9PT0gMSA/IFwiKVwiIDogYCwgJHthfSlgfWA7XG59XG5cbmZ1bmN0aW9uIGNsYW1wYShvcGFjaXR5KSB7XG4gIHJldHVybiBpc05hTihvcGFjaXR5KSA/IDEgOiBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBvcGFjaXR5KSk7XG59XG5cbmZ1bmN0aW9uIGNsYW1waSh2YWx1ZSkge1xuICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4oMjU1LCBNYXRoLnJvdW5kKHZhbHVlKSB8fCAwKSk7XG59XG5cbmZ1bmN0aW9uIGhleCh2YWx1ZSkge1xuICB2YWx1ZSA9IGNsYW1waSh2YWx1ZSk7XG4gIHJldHVybiAodmFsdWUgPCAxNiA/IFwiMFwiIDogXCJcIikgKyB2YWx1ZS50b1N0cmluZygxNik7XG59XG5cbmZ1bmN0aW9uIGhzbGEoaCwgcywgbCwgYSkge1xuICBpZiAoYSA8PSAwKSBoID0gcyA9IGwgPSBOYU47XG4gIGVsc2UgaWYgKGwgPD0gMCB8fCBsID49IDEpIGggPSBzID0gTmFOO1xuICBlbHNlIGlmIChzIDw9IDApIGggPSBOYU47XG4gIHJldHVybiBuZXcgSHNsKGgsIHMsIGwsIGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHNsQ29udmVydChvKSB7XG4gIGlmIChvIGluc3RhbmNlb2YgSHNsKSByZXR1cm4gbmV3IEhzbChvLmgsIG8ucywgby5sLCBvLm9wYWNpdHkpO1xuICBpZiAoIShvIGluc3RhbmNlb2YgQ29sb3IpKSBvID0gY29sb3Iobyk7XG4gIGlmICghbykgcmV0dXJuIG5ldyBIc2w7XG4gIGlmIChvIGluc3RhbmNlb2YgSHNsKSByZXR1cm4gbztcbiAgbyA9IG8ucmdiKCk7XG4gIHZhciByID0gby5yIC8gMjU1LFxuICAgICAgZyA9IG8uZyAvIDI1NSxcbiAgICAgIGIgPSBvLmIgLyAyNTUsXG4gICAgICBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKSxcbiAgICAgIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpLFxuICAgICAgaCA9IE5hTixcbiAgICAgIHMgPSBtYXggLSBtaW4sXG4gICAgICBsID0gKG1heCArIG1pbikgLyAyO1xuICBpZiAocykge1xuICAgIGlmIChyID09PSBtYXgpIGggPSAoZyAtIGIpIC8gcyArIChnIDwgYikgKiA2O1xuICAgIGVsc2UgaWYgKGcgPT09IG1heCkgaCA9IChiIC0gcikgLyBzICsgMjtcbiAgICBlbHNlIGggPSAociAtIGcpIC8gcyArIDQ7XG4gICAgcyAvPSBsIDwgMC41ID8gbWF4ICsgbWluIDogMiAtIG1heCAtIG1pbjtcbiAgICBoICo9IDYwO1xuICB9IGVsc2Uge1xuICAgIHMgPSBsID4gMCAmJiBsIDwgMSA/IDAgOiBoO1xuICB9XG4gIHJldHVybiBuZXcgSHNsKGgsIHMsIGwsIG8ub3BhY2l0eSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoc2woaCwgcywgbCwgb3BhY2l0eSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSA/IGhzbENvbnZlcnQoaCkgOiBuZXcgSHNsKGgsIHMsIGwsIG9wYWNpdHkgPT0gbnVsbCA/IDEgOiBvcGFjaXR5KTtcbn1cblxuZnVuY3Rpb24gSHNsKGgsIHMsIGwsIG9wYWNpdHkpIHtcbiAgdGhpcy5oID0gK2g7XG4gIHRoaXMucyA9ICtzO1xuICB0aGlzLmwgPSArbDtcbiAgdGhpcy5vcGFjaXR5ID0gK29wYWNpdHk7XG59XG5cbmRlZmluZShIc2wsIGhzbCwgZXh0ZW5kKENvbG9yLCB7XG4gIGJyaWdodGVyKGspIHtcbiAgICBrID0gayA9PSBudWxsID8gYnJpZ2h0ZXIgOiBNYXRoLnBvdyhicmlnaHRlciwgayk7XG4gICAgcmV0dXJuIG5ldyBIc2wodGhpcy5oLCB0aGlzLnMsIHRoaXMubCAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIGRhcmtlcihrKSB7XG4gICAgayA9IGsgPT0gbnVsbCA/IGRhcmtlciA6IE1hdGgucG93KGRhcmtlciwgayk7XG4gICAgcmV0dXJuIG5ldyBIc2wodGhpcy5oLCB0aGlzLnMsIHRoaXMubCAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIHJnYigpIHtcbiAgICB2YXIgaCA9IHRoaXMuaCAlIDM2MCArICh0aGlzLmggPCAwKSAqIDM2MCxcbiAgICAgICAgcyA9IGlzTmFOKGgpIHx8IGlzTmFOKHRoaXMucykgPyAwIDogdGhpcy5zLFxuICAgICAgICBsID0gdGhpcy5sLFxuICAgICAgICBtMiA9IGwgKyAobCA8IDAuNSA/IGwgOiAxIC0gbCkgKiBzLFxuICAgICAgICBtMSA9IDIgKiBsIC0gbTI7XG4gICAgcmV0dXJuIG5ldyBSZ2IoXG4gICAgICBoc2wycmdiKGggPj0gMjQwID8gaCAtIDI0MCA6IGggKyAxMjAsIG0xLCBtMiksXG4gICAgICBoc2wycmdiKGgsIG0xLCBtMiksXG4gICAgICBoc2wycmdiKGggPCAxMjAgPyBoICsgMjQwIDogaCAtIDEyMCwgbTEsIG0yKSxcbiAgICAgIHRoaXMub3BhY2l0eVxuICAgICk7XG4gIH0sXG4gIGNsYW1wKCkge1xuICAgIHJldHVybiBuZXcgSHNsKGNsYW1waCh0aGlzLmgpLCBjbGFtcHQodGhpcy5zKSwgY2xhbXB0KHRoaXMubCksIGNsYW1wYSh0aGlzLm9wYWNpdHkpKTtcbiAgfSxcbiAgZGlzcGxheWFibGUoKSB7XG4gICAgcmV0dXJuICgwIDw9IHRoaXMucyAmJiB0aGlzLnMgPD0gMSB8fCBpc05hTih0aGlzLnMpKVxuICAgICAgICAmJiAoMCA8PSB0aGlzLmwgJiYgdGhpcy5sIDw9IDEpXG4gICAgICAgICYmICgwIDw9IHRoaXMub3BhY2l0eSAmJiB0aGlzLm9wYWNpdHkgPD0gMSk7XG4gIH0sXG4gIGZvcm1hdEhzbCgpIHtcbiAgICBjb25zdCBhID0gY2xhbXBhKHRoaXMub3BhY2l0eSk7XG4gICAgcmV0dXJuIGAke2EgPT09IDEgPyBcImhzbChcIiA6IFwiaHNsYShcIn0ke2NsYW1waCh0aGlzLmgpfSwgJHtjbGFtcHQodGhpcy5zKSAqIDEwMH0lLCAke2NsYW1wdCh0aGlzLmwpICogMTAwfSUke2EgPT09IDEgPyBcIilcIiA6IGAsICR7YX0pYH1gO1xuICB9XG59KSk7XG5cbmZ1bmN0aW9uIGNsYW1waCh2YWx1ZSkge1xuICB2YWx1ZSA9ICh2YWx1ZSB8fCAwKSAlIDM2MDtcbiAgcmV0dXJuIHZhbHVlIDwgMCA/IHZhbHVlICsgMzYwIDogdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGNsYW1wdCh2YWx1ZSkge1xuICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgdmFsdWUgfHwgMCkpO1xufVxuXG4vKiBGcm9tIEZ2RCAxMy4zNywgQ1NTIENvbG9yIE1vZHVsZSBMZXZlbCAzICovXG5mdW5jdGlvbiBoc2wycmdiKGgsIG0xLCBtMikge1xuICByZXR1cm4gKGggPCA2MCA/IG0xICsgKG0yIC0gbTEpICogaCAvIDYwXG4gICAgICA6IGggPCAxODAgPyBtMlxuICAgICAgOiBoIDwgMjQwID8gbTEgKyAobTIgLSBtMSkgKiAoMjQwIC0gaCkgLyA2MFxuICAgICAgOiBtMSkgKiAyNTU7XG59XG4iLCJleHBvcnQgY29uc3QgcmFkaWFucyA9IE1hdGguUEkgLyAxODA7XG5leHBvcnQgY29uc3QgZGVncmVlcyA9IDE4MCAvIE1hdGguUEk7XG4iLCJpbXBvcnQgZGVmaW5lLCB7ZXh0ZW5kfSBmcm9tIFwiLi9kZWZpbmUuanNcIjtcbmltcG9ydCB7Q29sb3IsIHJnYkNvbnZlcnQsIFJnYn0gZnJvbSBcIi4vY29sb3IuanNcIjtcbmltcG9ydCB7ZGVncmVlcywgcmFkaWFuc30gZnJvbSBcIi4vbWF0aC5qc1wiO1xuXG4vLyBodHRwczovL29ic2VydmFibGVocS5jb20vQG1ib3N0b2NrL2xhYi1hbmQtcmdiXG5jb25zdCBLID0gMTgsXG4gICAgWG4gPSAwLjk2NDIyLFxuICAgIFluID0gMSxcbiAgICBabiA9IDAuODI1MjEsXG4gICAgdDAgPSA0IC8gMjksXG4gICAgdDEgPSA2IC8gMjksXG4gICAgdDIgPSAzICogdDEgKiB0MSxcbiAgICB0MyA9IHQxICogdDEgKiB0MTtcblxuZnVuY3Rpb24gbGFiQ29udmVydChvKSB7XG4gIGlmIChvIGluc3RhbmNlb2YgTGFiKSByZXR1cm4gbmV3IExhYihvLmwsIG8uYSwgby5iLCBvLm9wYWNpdHkpO1xuICBpZiAobyBpbnN0YW5jZW9mIEhjbCkgcmV0dXJuIGhjbDJsYWIobyk7XG4gIGlmICghKG8gaW5zdGFuY2VvZiBSZ2IpKSBvID0gcmdiQ29udmVydChvKTtcbiAgdmFyIHIgPSByZ2IybHJnYihvLnIpLFxuICAgICAgZyA9IHJnYjJscmdiKG8uZyksXG4gICAgICBiID0gcmdiMmxyZ2Ioby5iKSxcbiAgICAgIHkgPSB4eXoybGFiKCgwLjIyMjUwNDUgKiByICsgMC43MTY4Nzg2ICogZyArIDAuMDYwNjE2OSAqIGIpIC8gWW4pLCB4LCB6O1xuICBpZiAociA9PT0gZyAmJiBnID09PSBiKSB4ID0geiA9IHk7IGVsc2Uge1xuICAgIHggPSB4eXoybGFiKCgwLjQzNjA3NDcgKiByICsgMC4zODUwNjQ5ICogZyArIDAuMTQzMDgwNCAqIGIpIC8gWG4pO1xuICAgIHogPSB4eXoybGFiKCgwLjAxMzkzMjIgKiByICsgMC4wOTcxMDQ1ICogZyArIDAuNzE0MTczMyAqIGIpIC8gWm4pO1xuICB9XG4gIHJldHVybiBuZXcgTGFiKDExNiAqIHkgLSAxNiwgNTAwICogKHggLSB5KSwgMjAwICogKHkgLSB6KSwgby5vcGFjaXR5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdyYXkobCwgb3BhY2l0eSkge1xuICByZXR1cm4gbmV3IExhYihsLCAwLCAwLCBvcGFjaXR5ID09IG51bGwgPyAxIDogb3BhY2l0eSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxhYihsLCBhLCBiLCBvcGFjaXR5KSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID09PSAxID8gbGFiQ29udmVydChsKSA6IG5ldyBMYWIobCwgYSwgYiwgb3BhY2l0eSA9PSBudWxsID8gMSA6IG9wYWNpdHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gTGFiKGwsIGEsIGIsIG9wYWNpdHkpIHtcbiAgdGhpcy5sID0gK2w7XG4gIHRoaXMuYSA9ICthO1xuICB0aGlzLmIgPSArYjtcbiAgdGhpcy5vcGFjaXR5ID0gK29wYWNpdHk7XG59XG5cbmRlZmluZShMYWIsIGxhYiwgZXh0ZW5kKENvbG9yLCB7XG4gIGJyaWdodGVyKGspIHtcbiAgICByZXR1cm4gbmV3IExhYih0aGlzLmwgKyBLICogKGsgPT0gbnVsbCA/IDEgOiBrKSwgdGhpcy5hLCB0aGlzLmIsIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIGRhcmtlcihrKSB7XG4gICAgcmV0dXJuIG5ldyBMYWIodGhpcy5sIC0gSyAqIChrID09IG51bGwgPyAxIDogayksIHRoaXMuYSwgdGhpcy5iLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICByZ2IoKSB7XG4gICAgdmFyIHkgPSAodGhpcy5sICsgMTYpIC8gMTE2LFxuICAgICAgICB4ID0gaXNOYU4odGhpcy5hKSA/IHkgOiB5ICsgdGhpcy5hIC8gNTAwLFxuICAgICAgICB6ID0gaXNOYU4odGhpcy5iKSA/IHkgOiB5IC0gdGhpcy5iIC8gMjAwO1xuICAgIHggPSBYbiAqIGxhYjJ4eXooeCk7XG4gICAgeSA9IFluICogbGFiMnh5eih5KTtcbiAgICB6ID0gWm4gKiBsYWIyeHl6KHopO1xuICAgIHJldHVybiBuZXcgUmdiKFxuICAgICAgbHJnYjJyZ2IoIDMuMTMzODU2MSAqIHggLSAxLjYxNjg2NjcgKiB5IC0gMC40OTA2MTQ2ICogeiksXG4gICAgICBscmdiMnJnYigtMC45Nzg3Njg0ICogeCArIDEuOTE2MTQxNSAqIHkgKyAwLjAzMzQ1NDAgKiB6KSxcbiAgICAgIGxyZ2IycmdiKCAwLjA3MTk0NTMgKiB4IC0gMC4yMjg5OTE0ICogeSArIDEuNDA1MjQyNyAqIHopLFxuICAgICAgdGhpcy5vcGFjaXR5XG4gICAgKTtcbiAgfVxufSkpO1xuXG5mdW5jdGlvbiB4eXoybGFiKHQpIHtcbiAgcmV0dXJuIHQgPiB0MyA/IE1hdGgucG93KHQsIDEgLyAzKSA6IHQgLyB0MiArIHQwO1xufVxuXG5mdW5jdGlvbiBsYWIyeHl6KHQpIHtcbiAgcmV0dXJuIHQgPiB0MSA/IHQgKiB0ICogdCA6IHQyICogKHQgLSB0MCk7XG59XG5cbmZ1bmN0aW9uIGxyZ2IycmdiKHgpIHtcbiAgcmV0dXJuIDI1NSAqICh4IDw9IDAuMDAzMTMwOCA/IDEyLjkyICogeCA6IDEuMDU1ICogTWF0aC5wb3coeCwgMSAvIDIuNCkgLSAwLjA1NSk7XG59XG5cbmZ1bmN0aW9uIHJnYjJscmdiKHgpIHtcbiAgcmV0dXJuICh4IC89IDI1NSkgPD0gMC4wNDA0NSA/IHggLyAxMi45MiA6IE1hdGgucG93KCh4ICsgMC4wNTUpIC8gMS4wNTUsIDIuNCk7XG59XG5cbmZ1bmN0aW9uIGhjbENvbnZlcnQobykge1xuICBpZiAobyBpbnN0YW5jZW9mIEhjbCkgcmV0dXJuIG5ldyBIY2woby5oLCBvLmMsIG8ubCwgby5vcGFjaXR5KTtcbiAgaWYgKCEobyBpbnN0YW5jZW9mIExhYikpIG8gPSBsYWJDb252ZXJ0KG8pO1xuICBpZiAoby5hID09PSAwICYmIG8uYiA9PT0gMCkgcmV0dXJuIG5ldyBIY2woTmFOLCAwIDwgby5sICYmIG8ubCA8IDEwMCA/IDAgOiBOYU4sIG8ubCwgby5vcGFjaXR5KTtcbiAgdmFyIGggPSBNYXRoLmF0YW4yKG8uYiwgby5hKSAqIGRlZ3JlZXM7XG4gIHJldHVybiBuZXcgSGNsKGggPCAwID8gaCArIDM2MCA6IGgsIE1hdGguc3FydChvLmEgKiBvLmEgKyBvLmIgKiBvLmIpLCBvLmwsIG8ub3BhY2l0eSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsY2gobCwgYywgaCwgb3BhY2l0eSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSA/IGhjbENvbnZlcnQobCkgOiBuZXcgSGNsKGgsIGMsIGwsIG9wYWNpdHkgPT0gbnVsbCA/IDEgOiBvcGFjaXR5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhjbChoLCBjLCBsLCBvcGFjaXR5KSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID09PSAxID8gaGNsQ29udmVydChoKSA6IG5ldyBIY2woaCwgYywgbCwgb3BhY2l0eSA9PSBudWxsID8gMSA6IG9wYWNpdHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gSGNsKGgsIGMsIGwsIG9wYWNpdHkpIHtcbiAgdGhpcy5oID0gK2g7XG4gIHRoaXMuYyA9ICtjO1xuICB0aGlzLmwgPSArbDtcbiAgdGhpcy5vcGFjaXR5ID0gK29wYWNpdHk7XG59XG5cbmZ1bmN0aW9uIGhjbDJsYWIobykge1xuICBpZiAoaXNOYU4oby5oKSkgcmV0dXJuIG5ldyBMYWIoby5sLCAwLCAwLCBvLm9wYWNpdHkpO1xuICB2YXIgaCA9IG8uaCAqIHJhZGlhbnM7XG4gIHJldHVybiBuZXcgTGFiKG8ubCwgTWF0aC5jb3MoaCkgKiBvLmMsIE1hdGguc2luKGgpICogby5jLCBvLm9wYWNpdHkpO1xufVxuXG5kZWZpbmUoSGNsLCBoY2wsIGV4dGVuZChDb2xvciwge1xuICBicmlnaHRlcihrKSB7XG4gICAgcmV0dXJuIG5ldyBIY2wodGhpcy5oLCB0aGlzLmMsIHRoaXMubCArIEsgKiAoayA9PSBudWxsID8gMSA6IGspLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICBkYXJrZXIoaykge1xuICAgIHJldHVybiBuZXcgSGNsKHRoaXMuaCwgdGhpcy5jLCB0aGlzLmwgLSBLICogKGsgPT0gbnVsbCA/IDEgOiBrKSwgdGhpcy5vcGFjaXR5KTtcbiAgfSxcbiAgcmdiKCkge1xuICAgIHJldHVybiBoY2wybGFiKHRoaXMpLnJnYigpO1xuICB9XG59KSk7XG4iLCJpbXBvcnQgZGVmaW5lLCB7ZXh0ZW5kfSBmcm9tIFwiLi9kZWZpbmUuanNcIjtcbmltcG9ydCB7Q29sb3IsIHJnYkNvbnZlcnQsIFJnYiwgZGFya2VyLCBicmlnaHRlcn0gZnJvbSBcIi4vY29sb3IuanNcIjtcbmltcG9ydCB7ZGVncmVlcywgcmFkaWFuc30gZnJvbSBcIi4vbWF0aC5qc1wiO1xuXG52YXIgQSA9IC0wLjE0ODYxLFxuICAgIEIgPSArMS43ODI3NyxcbiAgICBDID0gLTAuMjkyMjcsXG4gICAgRCA9IC0wLjkwNjQ5LFxuICAgIEUgPSArMS45NzI5NCxcbiAgICBFRCA9IEUgKiBELFxuICAgIEVCID0gRSAqIEIsXG4gICAgQkNfREEgPSBCICogQyAtIEQgKiBBO1xuXG5mdW5jdGlvbiBjdWJlaGVsaXhDb252ZXJ0KG8pIHtcbiAgaWYgKG8gaW5zdGFuY2VvZiBDdWJlaGVsaXgpIHJldHVybiBuZXcgQ3ViZWhlbGl4KG8uaCwgby5zLCBvLmwsIG8ub3BhY2l0eSk7XG4gIGlmICghKG8gaW5zdGFuY2VvZiBSZ2IpKSBvID0gcmdiQ29udmVydChvKTtcbiAgdmFyIHIgPSBvLnIgLyAyNTUsXG4gICAgICBnID0gby5nIC8gMjU1LFxuICAgICAgYiA9IG8uYiAvIDI1NSxcbiAgICAgIGwgPSAoQkNfREEgKiBiICsgRUQgKiByIC0gRUIgKiBnKSAvIChCQ19EQSArIEVEIC0gRUIpLFxuICAgICAgYmwgPSBiIC0gbCxcbiAgICAgIGsgPSAoRSAqIChnIC0gbCkgLSBDICogYmwpIC8gRCxcbiAgICAgIHMgPSBNYXRoLnNxcnQoayAqIGsgKyBibCAqIGJsKSAvIChFICogbCAqICgxIC0gbCkpLCAvLyBOYU4gaWYgbD0wIG9yIGw9MVxuICAgICAgaCA9IHMgPyBNYXRoLmF0YW4yKGssIGJsKSAqIGRlZ3JlZXMgLSAxMjAgOiBOYU47XG4gIHJldHVybiBuZXcgQ3ViZWhlbGl4KGggPCAwID8gaCArIDM2MCA6IGgsIHMsIGwsIG8ub3BhY2l0eSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGN1YmVoZWxpeChoLCBzLCBsLCBvcGFjaXR5KSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID09PSAxID8gY3ViZWhlbGl4Q29udmVydChoKSA6IG5ldyBDdWJlaGVsaXgoaCwgcywgbCwgb3BhY2l0eSA9PSBudWxsID8gMSA6IG9wYWNpdHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQ3ViZWhlbGl4KGgsIHMsIGwsIG9wYWNpdHkpIHtcbiAgdGhpcy5oID0gK2g7XG4gIHRoaXMucyA9ICtzO1xuICB0aGlzLmwgPSArbDtcbiAgdGhpcy5vcGFjaXR5ID0gK29wYWNpdHk7XG59XG5cbmRlZmluZShDdWJlaGVsaXgsIGN1YmVoZWxpeCwgZXh0ZW5kKENvbG9yLCB7XG4gIGJyaWdodGVyKGspIHtcbiAgICBrID0gayA9PSBudWxsID8gYnJpZ2h0ZXIgOiBNYXRoLnBvdyhicmlnaHRlciwgayk7XG4gICAgcmV0dXJuIG5ldyBDdWJlaGVsaXgodGhpcy5oLCB0aGlzLnMsIHRoaXMubCAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIGRhcmtlcihrKSB7XG4gICAgayA9IGsgPT0gbnVsbCA/IGRhcmtlciA6IE1hdGgucG93KGRhcmtlciwgayk7XG4gICAgcmV0dXJuIG5ldyBDdWJlaGVsaXgodGhpcy5oLCB0aGlzLnMsIHRoaXMubCAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIHJnYigpIHtcbiAgICB2YXIgaCA9IGlzTmFOKHRoaXMuaCkgPyAwIDogKHRoaXMuaCArIDEyMCkgKiByYWRpYW5zLFxuICAgICAgICBsID0gK3RoaXMubCxcbiAgICAgICAgYSA9IGlzTmFOKHRoaXMucykgPyAwIDogdGhpcy5zICogbCAqICgxIC0gbCksXG4gICAgICAgIGNvc2ggPSBNYXRoLmNvcyhoKSxcbiAgICAgICAgc2luaCA9IE1hdGguc2luKGgpO1xuICAgIHJldHVybiBuZXcgUmdiKFxuICAgICAgMjU1ICogKGwgKyBhICogKEEgKiBjb3NoICsgQiAqIHNpbmgpKSxcbiAgICAgIDI1NSAqIChsICsgYSAqIChDICogY29zaCArIEQgKiBzaW5oKSksXG4gICAgICAyNTUgKiAobCArIGEgKiAoRSAqIGNvc2gpKSxcbiAgICAgIHRoaXMub3BhY2l0eVxuICAgICk7XG4gIH1cbn0pKTtcbiIsImV4cG9ydCB7ZGVmYXVsdCBhcyBjb2xvciwgcmdiLCBoc2x9IGZyb20gXCIuL2NvbG9yLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgbGFiLCBoY2wsIGxjaCwgZ3JheX0gZnJvbSBcIi4vbGFiLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgY3ViZWhlbGl4fSBmcm9tIFwiLi9jdWJlaGVsaXguanNcIjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICBBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzV2l0aE1hcHBpbmdUb1N0cmluZykge1xuICB2YXIgbGlzdCA9IFtdO1xuXG4gIC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcbiAgbGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIGNvbnRlbnQgPSBcIlwiO1xuICAgICAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBpdGVtWzVdICE9PSBcInVuZGVmaW5lZFwiO1xuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpO1xuICAgICAgfVxuICAgICAgY29udGVudCArPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pO1xuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKFwiXCIpO1xuICB9O1xuXG4gIC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG4gIGxpc3QuaSA9IGZ1bmN0aW9uIGkobW9kdWxlcywgbWVkaWEsIGRlZHVwZSwgc3VwcG9ydHMsIGxheWVyKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGVzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCB1bmRlZmluZWRdXTtcbiAgICB9XG4gICAgdmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHRoaXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdmFyIGlkID0gdGhpc1trXVswXTtcbiAgICAgICAgaWYgKGlkICE9IG51bGwpIHtcbiAgICAgICAgICBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgX2sgPSAwOyBfayA8IG1vZHVsZXMubGVuZ3RoOyBfaysrKSB7XG4gICAgICB2YXIgaXRlbSA9IFtdLmNvbmNhdChtb2R1bGVzW19rXSk7XG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGxheWVyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbVs1XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG1lZGlhKSB7XG4gICAgICAgIGlmICghaXRlbVsyXSkge1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzdXBwb3J0cykge1xuICAgICAgICBpZiAoIWl0ZW1bNF0pIHtcbiAgICAgICAgICBpdGVtWzRdID0gXCJcIi5jb25jYXQoc3VwcG9ydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs0XSA9IHN1cHBvcnRzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsaXN0LnB1c2goaXRlbSk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gbGlzdDtcbn07IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCwgeSkge1xuICB2YXIgbm9kZXMsIHN0cmVuZ3RoID0gMTtcblxuICBpZiAoeCA9PSBudWxsKSB4ID0gMDtcbiAgaWYgKHkgPT0gbnVsbCkgeSA9IDA7XG5cbiAgZnVuY3Rpb24gZm9yY2UoKSB7XG4gICAgdmFyIGksXG4gICAgICAgIG4gPSBub2Rlcy5sZW5ndGgsXG4gICAgICAgIG5vZGUsXG4gICAgICAgIHN4ID0gMCxcbiAgICAgICAgc3kgPSAwO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgbm9kZSA9IG5vZGVzW2ldLCBzeCArPSBub2RlLngsIHN5ICs9IG5vZGUueTtcbiAgICB9XG5cbiAgICBmb3IgKHN4ID0gKHN4IC8gbiAtIHgpICogc3RyZW5ndGgsIHN5ID0gKHN5IC8gbiAtIHkpICogc3RyZW5ndGgsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBub2RlID0gbm9kZXNbaV0sIG5vZGUueCAtPSBzeCwgbm9kZS55IC09IHN5O1xuICAgIH1cbiAgfVxuXG4gIGZvcmNlLmluaXRpYWxpemUgPSBmdW5jdGlvbihfKSB7XG4gICAgbm9kZXMgPSBfO1xuICB9O1xuXG4gIGZvcmNlLnggPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoeCA9ICtfLCBmb3JjZSkgOiB4O1xuICB9O1xuXG4gIGZvcmNlLnkgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoeSA9ICtfLCBmb3JjZSkgOiB5O1xuICB9O1xuXG4gIGZvcmNlLnN0cmVuZ3RoID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHN0cmVuZ3RoID0gK18sIGZvcmNlKSA6IHN0cmVuZ3RoO1xuICB9O1xuXG4gIHJldHVybiBmb3JjZTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB4O1xuICB9O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocmFuZG9tKSB7XG4gIHJldHVybiAocmFuZG9tKCkgLSAwLjUpICogMWUtNjtcbn1cbiIsImltcG9ydCB7cXVhZHRyZWV9IGZyb20gXCJkMy1xdWFkdHJlZVwiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5pbXBvcnQgamlnZ2xlIGZyb20gXCIuL2ppZ2dsZS5qc1wiO1xuXG5mdW5jdGlvbiB4KGQpIHtcbiAgcmV0dXJuIGQueCArIGQudng7XG59XG5cbmZ1bmN0aW9uIHkoZCkge1xuICByZXR1cm4gZC55ICsgZC52eTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocmFkaXVzKSB7XG4gIHZhciBub2RlcyxcbiAgICAgIHJhZGlpLFxuICAgICAgcmFuZG9tLFxuICAgICAgc3RyZW5ndGggPSAxLFxuICAgICAgaXRlcmF0aW9ucyA9IDE7XG5cbiAgaWYgKHR5cGVvZiByYWRpdXMgIT09IFwiZnVuY3Rpb25cIikgcmFkaXVzID0gY29uc3RhbnQocmFkaXVzID09IG51bGwgPyAxIDogK3JhZGl1cyk7XG5cbiAgZnVuY3Rpb24gZm9yY2UoKSB7XG4gICAgdmFyIGksIG4gPSBub2Rlcy5sZW5ndGgsXG4gICAgICAgIHRyZWUsXG4gICAgICAgIG5vZGUsXG4gICAgICAgIHhpLFxuICAgICAgICB5aSxcbiAgICAgICAgcmksXG4gICAgICAgIHJpMjtcblxuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgaXRlcmF0aW9uczsgKytrKSB7XG4gICAgICB0cmVlID0gcXVhZHRyZWUobm9kZXMsIHgsIHkpLnZpc2l0QWZ0ZXIocHJlcGFyZSk7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgICAgcmkgPSByYWRpaVtub2RlLmluZGV4XSwgcmkyID0gcmkgKiByaTtcbiAgICAgICAgeGkgPSBub2RlLnggKyBub2RlLnZ4O1xuICAgICAgICB5aSA9IG5vZGUueSArIG5vZGUudnk7XG4gICAgICAgIHRyZWUudmlzaXQoYXBwbHkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFwcGx5KHF1YWQsIHgwLCB5MCwgeDEsIHkxKSB7XG4gICAgICB2YXIgZGF0YSA9IHF1YWQuZGF0YSwgcmogPSBxdWFkLnIsIHIgPSByaSArIHJqO1xuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEuaW5kZXggPiBub2RlLmluZGV4KSB7XG4gICAgICAgICAgdmFyIHggPSB4aSAtIGRhdGEueCAtIGRhdGEudngsXG4gICAgICAgICAgICAgIHkgPSB5aSAtIGRhdGEueSAtIGRhdGEudnksXG4gICAgICAgICAgICAgIGwgPSB4ICogeCArIHkgKiB5O1xuICAgICAgICAgIGlmIChsIDwgciAqIHIpIHtcbiAgICAgICAgICAgIGlmICh4ID09PSAwKSB4ID0gamlnZ2xlKHJhbmRvbSksIGwgKz0geCAqIHg7XG4gICAgICAgICAgICBpZiAoeSA9PT0gMCkgeSA9IGppZ2dsZShyYW5kb20pLCBsICs9IHkgKiB5O1xuICAgICAgICAgICAgbCA9IChyIC0gKGwgPSBNYXRoLnNxcnQobCkpKSAvIGwgKiBzdHJlbmd0aDtcbiAgICAgICAgICAgIG5vZGUudnggKz0gKHggKj0gbCkgKiAociA9IChyaiAqPSByaikgLyAocmkyICsgcmopKTtcbiAgICAgICAgICAgIG5vZGUudnkgKz0gKHkgKj0gbCkgKiByO1xuICAgICAgICAgICAgZGF0YS52eCAtPSB4ICogKHIgPSAxIC0gcik7XG4gICAgICAgICAgICBkYXRhLnZ5IC09IHkgKiByO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXR1cm4geDAgPiB4aSArIHIgfHwgeDEgPCB4aSAtIHIgfHwgeTAgPiB5aSArIHIgfHwgeTEgPCB5aSAtIHI7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcHJlcGFyZShxdWFkKSB7XG4gICAgaWYgKHF1YWQuZGF0YSkgcmV0dXJuIHF1YWQuciA9IHJhZGlpW3F1YWQuZGF0YS5pbmRleF07XG4gICAgZm9yICh2YXIgaSA9IHF1YWQuciA9IDA7IGkgPCA0OyArK2kpIHtcbiAgICAgIGlmIChxdWFkW2ldICYmIHF1YWRbaV0uciA+IHF1YWQucikge1xuICAgICAgICBxdWFkLnIgPSBxdWFkW2ldLnI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICBpZiAoIW5vZGVzKSByZXR1cm47XG4gICAgdmFyIGksIG4gPSBub2Rlcy5sZW5ndGgsIG5vZGU7XG4gICAgcmFkaWkgPSBuZXcgQXJyYXkobik7XG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkgbm9kZSA9IG5vZGVzW2ldLCByYWRpaVtub2RlLmluZGV4XSA9ICtyYWRpdXMobm9kZSwgaSwgbm9kZXMpO1xuICB9XG5cbiAgZm9yY2UuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKF9ub2RlcywgX3JhbmRvbSkge1xuICAgIG5vZGVzID0gX25vZGVzO1xuICAgIHJhbmRvbSA9IF9yYW5kb207XG4gICAgaW5pdGlhbGl6ZSgpO1xuICB9O1xuXG4gIGZvcmNlLml0ZXJhdGlvbnMgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoaXRlcmF0aW9ucyA9ICtfLCBmb3JjZSkgOiBpdGVyYXRpb25zO1xuICB9O1xuXG4gIGZvcmNlLnN0cmVuZ3RoID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHN0cmVuZ3RoID0gK18sIGZvcmNlKSA6IHN0cmVuZ3RoO1xuICB9O1xuXG4gIGZvcmNlLnJhZGl1cyA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChyYWRpdXMgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgaW5pdGlhbGl6ZSgpLCBmb3JjZSkgOiByYWRpdXM7XG4gIH07XG5cbiAgcmV0dXJuIGZvcmNlO1xufVxuIiwiaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5pbXBvcnQgamlnZ2xlIGZyb20gXCIuL2ppZ2dsZS5qc1wiO1xuXG5mdW5jdGlvbiBpbmRleChkKSB7XG4gIHJldHVybiBkLmluZGV4O1xufVxuXG5mdW5jdGlvbiBmaW5kKG5vZGVCeUlkLCBub2RlSWQpIHtcbiAgdmFyIG5vZGUgPSBub2RlQnlJZC5nZXQobm9kZUlkKTtcbiAgaWYgKCFub2RlKSB0aHJvdyBuZXcgRXJyb3IoXCJub2RlIG5vdCBmb3VuZDogXCIgKyBub2RlSWQpO1xuICByZXR1cm4gbm9kZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obGlua3MpIHtcbiAgdmFyIGlkID0gaW5kZXgsXG4gICAgICBzdHJlbmd0aCA9IGRlZmF1bHRTdHJlbmd0aCxcbiAgICAgIHN0cmVuZ3RocyxcbiAgICAgIGRpc3RhbmNlID0gY29uc3RhbnQoMzApLFxuICAgICAgZGlzdGFuY2VzLFxuICAgICAgbm9kZXMsXG4gICAgICBjb3VudCxcbiAgICAgIGJpYXMsXG4gICAgICByYW5kb20sXG4gICAgICBpdGVyYXRpb25zID0gMTtcblxuICBpZiAobGlua3MgPT0gbnVsbCkgbGlua3MgPSBbXTtcblxuICBmdW5jdGlvbiBkZWZhdWx0U3RyZW5ndGgobGluaykge1xuICAgIHJldHVybiAxIC8gTWF0aC5taW4oY291bnRbbGluay5zb3VyY2UuaW5kZXhdLCBjb3VudFtsaW5rLnRhcmdldC5pbmRleF0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9yY2UoYWxwaGEpIHtcbiAgICBmb3IgKHZhciBrID0gMCwgbiA9IGxpbmtzLmxlbmd0aDsgayA8IGl0ZXJhdGlvbnM7ICsraykge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxpbmssIHNvdXJjZSwgdGFyZ2V0LCB4LCB5LCBsLCBiOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIGxpbmsgPSBsaW5rc1tpXSwgc291cmNlID0gbGluay5zb3VyY2UsIHRhcmdldCA9IGxpbmsudGFyZ2V0O1xuICAgICAgICB4ID0gdGFyZ2V0LnggKyB0YXJnZXQudnggLSBzb3VyY2UueCAtIHNvdXJjZS52eCB8fCBqaWdnbGUocmFuZG9tKTtcbiAgICAgICAgeSA9IHRhcmdldC55ICsgdGFyZ2V0LnZ5IC0gc291cmNlLnkgLSBzb3VyY2UudnkgfHwgamlnZ2xlKHJhbmRvbSk7XG4gICAgICAgIGwgPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSk7XG4gICAgICAgIGwgPSAobCAtIGRpc3RhbmNlc1tpXSkgLyBsICogYWxwaGEgKiBzdHJlbmd0aHNbaV07XG4gICAgICAgIHggKj0gbCwgeSAqPSBsO1xuICAgICAgICB0YXJnZXQudnggLT0geCAqIChiID0gYmlhc1tpXSk7XG4gICAgICAgIHRhcmdldC52eSAtPSB5ICogYjtcbiAgICAgICAgc291cmNlLnZ4ICs9IHggKiAoYiA9IDEgLSBiKTtcbiAgICAgICAgc291cmNlLnZ5ICs9IHkgKiBiO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgaWYgKCFub2RlcykgcmV0dXJuO1xuXG4gICAgdmFyIGksXG4gICAgICAgIG4gPSBub2Rlcy5sZW5ndGgsXG4gICAgICAgIG0gPSBsaW5rcy5sZW5ndGgsXG4gICAgICAgIG5vZGVCeUlkID0gbmV3IE1hcChub2Rlcy5tYXAoKGQsIGkpID0+IFtpZChkLCBpLCBub2RlcyksIGRdKSksXG4gICAgICAgIGxpbms7XG5cbiAgICBmb3IgKGkgPSAwLCBjb3VudCA9IG5ldyBBcnJheShuKTsgaSA8IG07ICsraSkge1xuICAgICAgbGluayA9IGxpbmtzW2ldLCBsaW5rLmluZGV4ID0gaTtcbiAgICAgIGlmICh0eXBlb2YgbGluay5zb3VyY2UgIT09IFwib2JqZWN0XCIpIGxpbmsuc291cmNlID0gZmluZChub2RlQnlJZCwgbGluay5zb3VyY2UpO1xuICAgICAgaWYgKHR5cGVvZiBsaW5rLnRhcmdldCAhPT0gXCJvYmplY3RcIikgbGluay50YXJnZXQgPSBmaW5kKG5vZGVCeUlkLCBsaW5rLnRhcmdldCk7XG4gICAgICBjb3VudFtsaW5rLnNvdXJjZS5pbmRleF0gPSAoY291bnRbbGluay5zb3VyY2UuaW5kZXhdIHx8IDApICsgMTtcbiAgICAgIGNvdW50W2xpbmsudGFyZ2V0LmluZGV4XSA9IChjb3VudFtsaW5rLnRhcmdldC5pbmRleF0gfHwgMCkgKyAxO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDAsIGJpYXMgPSBuZXcgQXJyYXkobSk7IGkgPCBtOyArK2kpIHtcbiAgICAgIGxpbmsgPSBsaW5rc1tpXSwgYmlhc1tpXSA9IGNvdW50W2xpbmsuc291cmNlLmluZGV4XSAvIChjb3VudFtsaW5rLnNvdXJjZS5pbmRleF0gKyBjb3VudFtsaW5rLnRhcmdldC5pbmRleF0pO1xuICAgIH1cblxuICAgIHN0cmVuZ3RocyA9IG5ldyBBcnJheShtKSwgaW5pdGlhbGl6ZVN0cmVuZ3RoKCk7XG4gICAgZGlzdGFuY2VzID0gbmV3IEFycmF5KG0pLCBpbml0aWFsaXplRGlzdGFuY2UoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemVTdHJlbmd0aCgpIHtcbiAgICBpZiAoIW5vZGVzKSByZXR1cm47XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbiA9IGxpbmtzLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgc3RyZW5ndGhzW2ldID0gK3N0cmVuZ3RoKGxpbmtzW2ldLCBpLCBsaW5rcyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5pdGlhbGl6ZURpc3RhbmNlKCkge1xuICAgIGlmICghbm9kZXMpIHJldHVybjtcblxuICAgIGZvciAodmFyIGkgPSAwLCBuID0gbGlua3MubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICBkaXN0YW5jZXNbaV0gPSArZGlzdGFuY2UobGlua3NbaV0sIGksIGxpbmtzKTtcbiAgICB9XG4gIH1cblxuICBmb3JjZS5pbml0aWFsaXplID0gZnVuY3Rpb24oX25vZGVzLCBfcmFuZG9tKSB7XG4gICAgbm9kZXMgPSBfbm9kZXM7XG4gICAgcmFuZG9tID0gX3JhbmRvbTtcbiAgICBpbml0aWFsaXplKCk7XG4gIH07XG5cbiAgZm9yY2UubGlua3MgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAobGlua3MgPSBfLCBpbml0aWFsaXplKCksIGZvcmNlKSA6IGxpbmtzO1xuICB9O1xuXG4gIGZvcmNlLmlkID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGlkID0gXywgZm9yY2UpIDogaWQ7XG4gIH07XG5cbiAgZm9yY2UuaXRlcmF0aW9ucyA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChpdGVyYXRpb25zID0gK18sIGZvcmNlKSA6IGl0ZXJhdGlvbnM7XG4gIH07XG5cbiAgZm9yY2Uuc3RyZW5ndGggPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoc3RyZW5ndGggPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgaW5pdGlhbGl6ZVN0cmVuZ3RoKCksIGZvcmNlKSA6IHN0cmVuZ3RoO1xuICB9O1xuXG4gIGZvcmNlLmRpc3RhbmNlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGRpc3RhbmNlID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIGluaXRpYWxpemVEaXN0YW5jZSgpLCBmb3JjZSkgOiBkaXN0YW5jZTtcbiAgfTtcblxuICByZXR1cm4gZm9yY2U7XG59XG4iLCIvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaW5lYXJfY29uZ3J1ZW50aWFsX2dlbmVyYXRvciNQYXJhbWV0ZXJzX2luX2NvbW1vbl91c2VcbmNvbnN0IGEgPSAxNjY0NTI1O1xuY29uc3QgYyA9IDEwMTM5MDQyMjM7XG5jb25zdCBtID0gNDI5NDk2NzI5NjsgLy8gMl4zMlxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgbGV0IHMgPSAxO1xuICByZXR1cm4gKCkgPT4gKHMgPSAoYSAqIHMgKyBjKSAlIG0pIC8gbTtcbn1cbiIsImltcG9ydCB7ZGlzcGF0Y2h9IGZyb20gXCJkMy1kaXNwYXRjaFwiO1xuaW1wb3J0IHt0aW1lcn0gZnJvbSBcImQzLXRpbWVyXCI7XG5pbXBvcnQgbGNnIGZyb20gXCIuL2xjZy5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24geChkKSB7XG4gIHJldHVybiBkLng7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB5KGQpIHtcbiAgcmV0dXJuIGQueTtcbn1cblxudmFyIGluaXRpYWxSYWRpdXMgPSAxMCxcbiAgICBpbml0aWFsQW5nbGUgPSBNYXRoLlBJICogKDMgLSBNYXRoLnNxcnQoNSkpO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihub2Rlcykge1xuICB2YXIgc2ltdWxhdGlvbixcbiAgICAgIGFscGhhID0gMSxcbiAgICAgIGFscGhhTWluID0gMC4wMDEsXG4gICAgICBhbHBoYURlY2F5ID0gMSAtIE1hdGgucG93KGFscGhhTWluLCAxIC8gMzAwKSxcbiAgICAgIGFscGhhVGFyZ2V0ID0gMCxcbiAgICAgIHZlbG9jaXR5RGVjYXkgPSAwLjYsXG4gICAgICBmb3JjZXMgPSBuZXcgTWFwKCksXG4gICAgICBzdGVwcGVyID0gdGltZXIoc3RlcCksXG4gICAgICBldmVudCA9IGRpc3BhdGNoKFwidGlja1wiLCBcImVuZFwiKSxcbiAgICAgIHJhbmRvbSA9IGxjZygpO1xuXG4gIGlmIChub2RlcyA9PSBudWxsKSBub2RlcyA9IFtdO1xuXG4gIGZ1bmN0aW9uIHN0ZXAoKSB7XG4gICAgdGljaygpO1xuICAgIGV2ZW50LmNhbGwoXCJ0aWNrXCIsIHNpbXVsYXRpb24pO1xuICAgIGlmIChhbHBoYSA8IGFscGhhTWluKSB7XG4gICAgICBzdGVwcGVyLnN0b3AoKTtcbiAgICAgIGV2ZW50LmNhbGwoXCJlbmRcIiwgc2ltdWxhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdGljayhpdGVyYXRpb25zKSB7XG4gICAgdmFyIGksIG4gPSBub2Rlcy5sZW5ndGgsIG5vZGU7XG5cbiAgICBpZiAoaXRlcmF0aW9ucyA9PT0gdW5kZWZpbmVkKSBpdGVyYXRpb25zID0gMTtcblxuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgaXRlcmF0aW9uczsgKytrKSB7XG4gICAgICBhbHBoYSArPSAoYWxwaGFUYXJnZXQgLSBhbHBoYSkgKiBhbHBoYURlY2F5O1xuXG4gICAgICBmb3JjZXMuZm9yRWFjaChmdW5jdGlvbihmb3JjZSkge1xuICAgICAgICBmb3JjZShhbHBoYSk7XG4gICAgICB9KTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgICBub2RlID0gbm9kZXNbaV07XG4gICAgICAgIGlmIChub2RlLmZ4ID09IG51bGwpIG5vZGUueCArPSBub2RlLnZ4ICo9IHZlbG9jaXR5RGVjYXk7XG4gICAgICAgIGVsc2Ugbm9kZS54ID0gbm9kZS5meCwgbm9kZS52eCA9IDA7XG4gICAgICAgIGlmIChub2RlLmZ5ID09IG51bGwpIG5vZGUueSArPSBub2RlLnZ5ICo9IHZlbG9jaXR5RGVjYXk7XG4gICAgICAgIGVsc2Ugbm9kZS55ID0gbm9kZS5meSwgbm9kZS52eSA9IDA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNpbXVsYXRpb247XG4gIH1cblxuICBmdW5jdGlvbiBpbml0aWFsaXplTm9kZXMoKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSBub2Rlcy5sZW5ndGgsIG5vZGU7IGkgPCBuOyArK2kpIHtcbiAgICAgIG5vZGUgPSBub2Rlc1tpXSwgbm9kZS5pbmRleCA9IGk7XG4gICAgICBpZiAobm9kZS5meCAhPSBudWxsKSBub2RlLnggPSBub2RlLmZ4O1xuICAgICAgaWYgKG5vZGUuZnkgIT0gbnVsbCkgbm9kZS55ID0gbm9kZS5meTtcbiAgICAgIGlmIChpc05hTihub2RlLngpIHx8IGlzTmFOKG5vZGUueSkpIHtcbiAgICAgICAgdmFyIHJhZGl1cyA9IGluaXRpYWxSYWRpdXMgKiBNYXRoLnNxcnQoMC41ICsgaSksIGFuZ2xlID0gaSAqIGluaXRpYWxBbmdsZTtcbiAgICAgICAgbm9kZS54ID0gcmFkaXVzICogTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgICBub2RlLnkgPSByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSk7XG4gICAgICB9XG4gICAgICBpZiAoaXNOYU4obm9kZS52eCkgfHwgaXNOYU4obm9kZS52eSkpIHtcbiAgICAgICAgbm9kZS52eCA9IG5vZGUudnkgPSAwO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemVGb3JjZShmb3JjZSkge1xuICAgIGlmIChmb3JjZS5pbml0aWFsaXplKSBmb3JjZS5pbml0aWFsaXplKG5vZGVzLCByYW5kb20pO1xuICAgIHJldHVybiBmb3JjZTtcbiAgfVxuXG4gIGluaXRpYWxpemVOb2RlcygpO1xuXG4gIHJldHVybiBzaW11bGF0aW9uID0ge1xuICAgIHRpY2s6IHRpY2ssXG5cbiAgICByZXN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBzdGVwcGVyLnJlc3RhcnQoc3RlcCksIHNpbXVsYXRpb247XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHN0ZXBwZXIuc3RvcCgpLCBzaW11bGF0aW9uO1xuICAgIH0sXG5cbiAgICBub2RlczogZnVuY3Rpb24oXykge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAobm9kZXMgPSBfLCBpbml0aWFsaXplTm9kZXMoKSwgZm9yY2VzLmZvckVhY2goaW5pdGlhbGl6ZUZvcmNlKSwgc2ltdWxhdGlvbikgOiBub2RlcztcbiAgICB9LFxuXG4gICAgYWxwaGE6IGZ1bmN0aW9uKF8pIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGFscGhhID0gK18sIHNpbXVsYXRpb24pIDogYWxwaGE7XG4gICAgfSxcblxuICAgIGFscGhhTWluOiBmdW5jdGlvbihfKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChhbHBoYU1pbiA9ICtfLCBzaW11bGF0aW9uKSA6IGFscGhhTWluO1xuICAgIH0sXG5cbiAgICBhbHBoYURlY2F5OiBmdW5jdGlvbihfKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChhbHBoYURlY2F5ID0gK18sIHNpbXVsYXRpb24pIDogK2FscGhhRGVjYXk7XG4gICAgfSxcblxuICAgIGFscGhhVGFyZ2V0OiBmdW5jdGlvbihfKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChhbHBoYVRhcmdldCA9ICtfLCBzaW11bGF0aW9uKSA6IGFscGhhVGFyZ2V0O1xuICAgIH0sXG5cbiAgICB2ZWxvY2l0eURlY2F5OiBmdW5jdGlvbihfKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh2ZWxvY2l0eURlY2F5ID0gMSAtIF8sIHNpbXVsYXRpb24pIDogMSAtIHZlbG9jaXR5RGVjYXk7XG4gICAgfSxcblxuICAgIHJhbmRvbVNvdXJjZTogZnVuY3Rpb24oXykge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocmFuZG9tID0gXywgZm9yY2VzLmZvckVhY2goaW5pdGlhbGl6ZUZvcmNlKSwgc2ltdWxhdGlvbikgOiByYW5kb207XG4gICAgfSxcblxuICAgIGZvcmNlOiBmdW5jdGlvbihuYW1lLCBfKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyAoKF8gPT0gbnVsbCA/IGZvcmNlcy5kZWxldGUobmFtZSkgOiBmb3JjZXMuc2V0KG5hbWUsIGluaXRpYWxpemVGb3JjZShfKSkpLCBzaW11bGF0aW9uKSA6IGZvcmNlcy5nZXQobmFtZSk7XG4gICAgfSxcblxuICAgIGZpbmQ6IGZ1bmN0aW9uKHgsIHksIHJhZGl1cykge1xuICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgIG4gPSBub2Rlcy5sZW5ndGgsXG4gICAgICAgICAgZHgsXG4gICAgICAgICAgZHksXG4gICAgICAgICAgZDIsXG4gICAgICAgICAgbm9kZSxcbiAgICAgICAgICBjbG9zZXN0O1xuXG4gICAgICBpZiAocmFkaXVzID09IG51bGwpIHJhZGl1cyA9IEluZmluaXR5O1xuICAgICAgZWxzZSByYWRpdXMgKj0gcmFkaXVzO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgICAgZHggPSB4IC0gbm9kZS54O1xuICAgICAgICBkeSA9IHkgLSBub2RlLnk7XG4gICAgICAgIGQyID0gZHggKiBkeCArIGR5ICogZHk7XG4gICAgICAgIGlmIChkMiA8IHJhZGl1cykgY2xvc2VzdCA9IG5vZGUsIHJhZGl1cyA9IGQyO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2xvc2VzdDtcbiAgICB9LFxuXG4gICAgb246IGZ1bmN0aW9uKG5hbWUsIF8pIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gMSA/IChldmVudC5vbihuYW1lLCBfKSwgc2ltdWxhdGlvbikgOiBldmVudC5vbihuYW1lKTtcbiAgICB9XG4gIH07XG59XG4iLCJpbXBvcnQge3F1YWR0cmVlfSBmcm9tIFwiZDMtcXVhZHRyZWVcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuaW1wb3J0IGppZ2dsZSBmcm9tIFwiLi9qaWdnbGUuanNcIjtcbmltcG9ydCB7eCwgeX0gZnJvbSBcIi4vc2ltdWxhdGlvbi5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIG5vZGVzLFxuICAgICAgbm9kZSxcbiAgICAgIHJhbmRvbSxcbiAgICAgIGFscGhhLFxuICAgICAgc3RyZW5ndGggPSBjb25zdGFudCgtMzApLFxuICAgICAgc3RyZW5ndGhzLFxuICAgICAgZGlzdGFuY2VNaW4yID0gMSxcbiAgICAgIGRpc3RhbmNlTWF4MiA9IEluZmluaXR5LFxuICAgICAgdGhldGEyID0gMC44MTtcblxuICBmdW5jdGlvbiBmb3JjZShfKSB7XG4gICAgdmFyIGksIG4gPSBub2Rlcy5sZW5ndGgsIHRyZWUgPSBxdWFkdHJlZShub2RlcywgeCwgeSkudmlzaXRBZnRlcihhY2N1bXVsYXRlKTtcbiAgICBmb3IgKGFscGhhID0gXywgaSA9IDA7IGkgPCBuOyArK2kpIG5vZGUgPSBub2Rlc1tpXSwgdHJlZS52aXNpdChhcHBseSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAgIGlmICghbm9kZXMpIHJldHVybjtcbiAgICB2YXIgaSwgbiA9IG5vZGVzLmxlbmd0aCwgbm9kZTtcbiAgICBzdHJlbmd0aHMgPSBuZXcgQXJyYXkobik7XG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkgbm9kZSA9IG5vZGVzW2ldLCBzdHJlbmd0aHNbbm9kZS5pbmRleF0gPSArc3RyZW5ndGgobm9kZSwgaSwgbm9kZXMpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWNjdW11bGF0ZShxdWFkKSB7XG4gICAgdmFyIHN0cmVuZ3RoID0gMCwgcSwgYywgd2VpZ2h0ID0gMCwgeCwgeSwgaTtcblxuICAgIC8vIEZvciBpbnRlcm5hbCBub2RlcywgYWNjdW11bGF0ZSBmb3JjZXMgZnJvbSBjaGlsZCBxdWFkcmFudHMuXG4gICAgaWYgKHF1YWQubGVuZ3RoKSB7XG4gICAgICBmb3IgKHggPSB5ID0gaSA9IDA7IGkgPCA0OyArK2kpIHtcbiAgICAgICAgaWYgKChxID0gcXVhZFtpXSkgJiYgKGMgPSBNYXRoLmFicyhxLnZhbHVlKSkpIHtcbiAgICAgICAgICBzdHJlbmd0aCArPSBxLnZhbHVlLCB3ZWlnaHQgKz0gYywgeCArPSBjICogcS54LCB5ICs9IGMgKiBxLnk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHF1YWQueCA9IHggLyB3ZWlnaHQ7XG4gICAgICBxdWFkLnkgPSB5IC8gd2VpZ2h0O1xuICAgIH1cblxuICAgIC8vIEZvciBsZWFmIG5vZGVzLCBhY2N1bXVsYXRlIGZvcmNlcyBmcm9tIGNvaW5jaWRlbnQgcXVhZHJhbnRzLlxuICAgIGVsc2Uge1xuICAgICAgcSA9IHF1YWQ7XG4gICAgICBxLnggPSBxLmRhdGEueDtcbiAgICAgIHEueSA9IHEuZGF0YS55O1xuICAgICAgZG8gc3RyZW5ndGggKz0gc3RyZW5ndGhzW3EuZGF0YS5pbmRleF07XG4gICAgICB3aGlsZSAocSA9IHEubmV4dCk7XG4gICAgfVxuXG4gICAgcXVhZC52YWx1ZSA9IHN0cmVuZ3RoO1xuICB9XG5cbiAgZnVuY3Rpb24gYXBwbHkocXVhZCwgeDEsIF8sIHgyKSB7XG4gICAgaWYgKCFxdWFkLnZhbHVlKSByZXR1cm4gdHJ1ZTtcblxuICAgIHZhciB4ID0gcXVhZC54IC0gbm9kZS54LFxuICAgICAgICB5ID0gcXVhZC55IC0gbm9kZS55LFxuICAgICAgICB3ID0geDIgLSB4MSxcbiAgICAgICAgbCA9IHggKiB4ICsgeSAqIHk7XG5cbiAgICAvLyBBcHBseSB0aGUgQmFybmVzLUh1dCBhcHByb3hpbWF0aW9uIGlmIHBvc3NpYmxlLlxuICAgIC8vIExpbWl0IGZvcmNlcyBmb3IgdmVyeSBjbG9zZSBub2RlczsgcmFuZG9taXplIGRpcmVjdGlvbiBpZiBjb2luY2lkZW50LlxuICAgIGlmICh3ICogdyAvIHRoZXRhMiA8IGwpIHtcbiAgICAgIGlmIChsIDwgZGlzdGFuY2VNYXgyKSB7XG4gICAgICAgIGlmICh4ID09PSAwKSB4ID0gamlnZ2xlKHJhbmRvbSksIGwgKz0geCAqIHg7XG4gICAgICAgIGlmICh5ID09PSAwKSB5ID0gamlnZ2xlKHJhbmRvbSksIGwgKz0geSAqIHk7XG4gICAgICAgIGlmIChsIDwgZGlzdGFuY2VNaW4yKSBsID0gTWF0aC5zcXJ0KGRpc3RhbmNlTWluMiAqIGwpO1xuICAgICAgICBub2RlLnZ4ICs9IHggKiBxdWFkLnZhbHVlICogYWxwaGEgLyBsO1xuICAgICAgICBub2RlLnZ5ICs9IHkgKiBxdWFkLnZhbHVlICogYWxwaGEgLyBsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCBwcm9jZXNzIHBvaW50cyBkaXJlY3RseS5cbiAgICBlbHNlIGlmIChxdWFkLmxlbmd0aCB8fCBsID49IGRpc3RhbmNlTWF4MikgcmV0dXJuO1xuXG4gICAgLy8gTGltaXQgZm9yY2VzIGZvciB2ZXJ5IGNsb3NlIG5vZGVzOyByYW5kb21pemUgZGlyZWN0aW9uIGlmIGNvaW5jaWRlbnQuXG4gICAgaWYgKHF1YWQuZGF0YSAhPT0gbm9kZSB8fCBxdWFkLm5leHQpIHtcbiAgICAgIGlmICh4ID09PSAwKSB4ID0gamlnZ2xlKHJhbmRvbSksIGwgKz0geCAqIHg7XG4gICAgICBpZiAoeSA9PT0gMCkgeSA9IGppZ2dsZShyYW5kb20pLCBsICs9IHkgKiB5O1xuICAgICAgaWYgKGwgPCBkaXN0YW5jZU1pbjIpIGwgPSBNYXRoLnNxcnQoZGlzdGFuY2VNaW4yICogbCk7XG4gICAgfVxuXG4gICAgZG8gaWYgKHF1YWQuZGF0YSAhPT0gbm9kZSkge1xuICAgICAgdyA9IHN0cmVuZ3Roc1txdWFkLmRhdGEuaW5kZXhdICogYWxwaGEgLyBsO1xuICAgICAgbm9kZS52eCArPSB4ICogdztcbiAgICAgIG5vZGUudnkgKz0geSAqIHc7XG4gICAgfSB3aGlsZSAocXVhZCA9IHF1YWQubmV4dCk7XG4gIH1cblxuICBmb3JjZS5pbml0aWFsaXplID0gZnVuY3Rpb24oX25vZGVzLCBfcmFuZG9tKSB7XG4gICAgbm9kZXMgPSBfbm9kZXM7XG4gICAgcmFuZG9tID0gX3JhbmRvbTtcbiAgICBpbml0aWFsaXplKCk7XG4gIH07XG5cbiAgZm9yY2Uuc3RyZW5ndGggPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoc3RyZW5ndGggPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgaW5pdGlhbGl6ZSgpLCBmb3JjZSkgOiBzdHJlbmd0aDtcbiAgfTtcblxuICBmb3JjZS5kaXN0YW5jZU1pbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChkaXN0YW5jZU1pbjIgPSBfICogXywgZm9yY2UpIDogTWF0aC5zcXJ0KGRpc3RhbmNlTWluMik7XG4gIH07XG5cbiAgZm9yY2UuZGlzdGFuY2VNYXggPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZGlzdGFuY2VNYXgyID0gXyAqIF8sIGZvcmNlKSA6IE1hdGguc3FydChkaXN0YW5jZU1heDIpO1xuICB9O1xuXG4gIGZvcmNlLnRoZXRhID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHRoZXRhMiA9IF8gKiBfLCBmb3JjZSkgOiBNYXRoLnNxcnQodGhldGEyKTtcbiAgfTtcblxuICByZXR1cm4gZm9yY2U7XG59XG4iLCJpbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocmFkaXVzLCB4LCB5KSB7XG4gIHZhciBub2RlcyxcbiAgICAgIHN0cmVuZ3RoID0gY29uc3RhbnQoMC4xKSxcbiAgICAgIHN0cmVuZ3RocyxcbiAgICAgIHJhZGl1c2VzO1xuXG4gIGlmICh0eXBlb2YgcmFkaXVzICE9PSBcImZ1bmN0aW9uXCIpIHJhZGl1cyA9IGNvbnN0YW50KCtyYWRpdXMpO1xuICBpZiAoeCA9PSBudWxsKSB4ID0gMDtcbiAgaWYgKHkgPT0gbnVsbCkgeSA9IDA7XG5cbiAgZnVuY3Rpb24gZm9yY2UoYWxwaGEpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbiA9IG5vZGVzLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXSxcbiAgICAgICAgICBkeCA9IG5vZGUueCAtIHggfHwgMWUtNixcbiAgICAgICAgICBkeSA9IG5vZGUueSAtIHkgfHwgMWUtNixcbiAgICAgICAgICByID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KSxcbiAgICAgICAgICBrID0gKHJhZGl1c2VzW2ldIC0gcikgKiBzdHJlbmd0aHNbaV0gKiBhbHBoYSAvIHI7XG4gICAgICBub2RlLnZ4ICs9IGR4ICogaztcbiAgICAgIG5vZGUudnkgKz0gZHkgKiBrO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgaWYgKCFub2RlcykgcmV0dXJuO1xuICAgIHZhciBpLCBuID0gbm9kZXMubGVuZ3RoO1xuICAgIHN0cmVuZ3RocyA9IG5ldyBBcnJheShuKTtcbiAgICByYWRpdXNlcyA9IG5ldyBBcnJheShuKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICByYWRpdXNlc1tpXSA9ICtyYWRpdXMobm9kZXNbaV0sIGksIG5vZGVzKTtcbiAgICAgIHN0cmVuZ3Roc1tpXSA9IGlzTmFOKHJhZGl1c2VzW2ldKSA/IDAgOiArc3RyZW5ndGgobm9kZXNbaV0sIGksIG5vZGVzKTtcbiAgICB9XG4gIH1cblxuICBmb3JjZS5pbml0aWFsaXplID0gZnVuY3Rpb24oXykge1xuICAgIG5vZGVzID0gXywgaW5pdGlhbGl6ZSgpO1xuICB9O1xuXG4gIGZvcmNlLnN0cmVuZ3RoID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHN0cmVuZ3RoID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIGluaXRpYWxpemUoKSwgZm9yY2UpIDogc3RyZW5ndGg7XG4gIH07XG5cbiAgZm9yY2UucmFkaXVzID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHJhZGl1cyA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCBpbml0aWFsaXplKCksIGZvcmNlKSA6IHJhZGl1cztcbiAgfTtcblxuICBmb3JjZS54ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHggPSArXywgZm9yY2UpIDogeDtcbiAgfTtcblxuICBmb3JjZS55ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHkgPSArXywgZm9yY2UpIDogeTtcbiAgfTtcblxuICByZXR1cm4gZm9yY2U7XG59XG4iLCJpbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCkge1xuICB2YXIgc3RyZW5ndGggPSBjb25zdGFudCgwLjEpLFxuICAgICAgbm9kZXMsXG4gICAgICBzdHJlbmd0aHMsXG4gICAgICB4ejtcblxuICBpZiAodHlwZW9mIHggIT09IFwiZnVuY3Rpb25cIikgeCA9IGNvbnN0YW50KHggPT0gbnVsbCA/IDAgOiAreCk7XG5cbiAgZnVuY3Rpb24gZm9yY2UoYWxwaGEpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbiA9IG5vZGVzLmxlbmd0aCwgbm9kZTsgaSA8IG47ICsraSkge1xuICAgICAgbm9kZSA9IG5vZGVzW2ldLCBub2RlLnZ4ICs9ICh4eltpXSAtIG5vZGUueCkgKiBzdHJlbmd0aHNbaV0gKiBhbHBoYTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAgIGlmICghbm9kZXMpIHJldHVybjtcbiAgICB2YXIgaSwgbiA9IG5vZGVzLmxlbmd0aDtcbiAgICBzdHJlbmd0aHMgPSBuZXcgQXJyYXkobik7XG4gICAgeHogPSBuZXcgQXJyYXkobik7XG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgc3RyZW5ndGhzW2ldID0gaXNOYU4oeHpbaV0gPSAreChub2Rlc1tpXSwgaSwgbm9kZXMpKSA/IDAgOiArc3RyZW5ndGgobm9kZXNbaV0sIGksIG5vZGVzKTtcbiAgICB9XG4gIH1cblxuICBmb3JjZS5pbml0aWFsaXplID0gZnVuY3Rpb24oXykge1xuICAgIG5vZGVzID0gXztcbiAgICBpbml0aWFsaXplKCk7XG4gIH07XG5cbiAgZm9yY2Uuc3RyZW5ndGggPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoc3RyZW5ndGggPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgaW5pdGlhbGl6ZSgpLCBmb3JjZSkgOiBzdHJlbmd0aDtcbiAgfTtcblxuICBmb3JjZS54ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHggPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgaW5pdGlhbGl6ZSgpLCBmb3JjZSkgOiB4O1xuICB9O1xuXG4gIHJldHVybiBmb3JjZTtcbn1cbiIsImltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih5KSB7XG4gIHZhciBzdHJlbmd0aCA9IGNvbnN0YW50KDAuMSksXG4gICAgICBub2RlcyxcbiAgICAgIHN0cmVuZ3RocyxcbiAgICAgIHl6O1xuXG4gIGlmICh0eXBlb2YgeSAhPT0gXCJmdW5jdGlvblwiKSB5ID0gY29uc3RhbnQoeSA9PSBudWxsID8gMCA6ICt5KTtcblxuICBmdW5jdGlvbiBmb3JjZShhbHBoYSkge1xuICAgIGZvciAodmFyIGkgPSAwLCBuID0gbm9kZXMubGVuZ3RoLCBub2RlOyBpIDwgbjsgKytpKSB7XG4gICAgICBub2RlID0gbm9kZXNbaV0sIG5vZGUudnkgKz0gKHl6W2ldIC0gbm9kZS55KSAqIHN0cmVuZ3Roc1tpXSAqIGFscGhhO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgaWYgKCFub2RlcykgcmV0dXJuO1xuICAgIHZhciBpLCBuID0gbm9kZXMubGVuZ3RoO1xuICAgIHN0cmVuZ3RocyA9IG5ldyBBcnJheShuKTtcbiAgICB5eiA9IG5ldyBBcnJheShuKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBzdHJlbmd0aHNbaV0gPSBpc05hTih5eltpXSA9ICt5KG5vZGVzW2ldLCBpLCBub2RlcykpID8gMCA6ICtzdHJlbmd0aChub2Rlc1tpXSwgaSwgbm9kZXMpO1xuICAgIH1cbiAgfVxuXG4gIGZvcmNlLmluaXRpYWxpemUgPSBmdW5jdGlvbihfKSB7XG4gICAgbm9kZXMgPSBfO1xuICAgIGluaXRpYWxpemUoKTtcbiAgfTtcblxuICBmb3JjZS5zdHJlbmd0aCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChzdHJlbmd0aCA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCBpbml0aWFsaXplKCksIGZvcmNlKSA6IHN0cmVuZ3RoO1xuICB9O1xuXG4gIGZvcmNlLnkgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoeSA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCBpbml0aWFsaXplKCksIGZvcmNlKSA6IHk7XG4gIH07XG5cbiAgcmV0dXJuIGZvcmNlO1xufVxuIiwiZXhwb3J0IHtkZWZhdWx0IGFzIGZvcmNlQ2VudGVyfSBmcm9tIFwiLi9jZW50ZXIuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBmb3JjZUNvbGxpZGV9IGZyb20gXCIuL2NvbGxpZGUuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBmb3JjZUxpbmt9IGZyb20gXCIuL2xpbmsuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBmb3JjZU1hbnlCb2R5fSBmcm9tIFwiLi9tYW55Qm9keS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGZvcmNlUmFkaWFsfSBmcm9tIFwiLi9yYWRpYWwuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBmb3JjZVNpbXVsYXRpb259IGZyb20gXCIuL3NpbXVsYXRpb24uanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBmb3JjZVh9IGZyb20gXCIuL3guanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBmb3JjZVl9IGZyb20gXCIuL3kuanNcIjtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIHg7XG59XG4iLCJpbXBvcnQgaWRlbnRpdHkgZnJvbSBcIi4vaWRlbnRpdHkuanNcIjtcblxudmFyIHRvcCA9IDEsXG4gICAgcmlnaHQgPSAyLFxuICAgIGJvdHRvbSA9IDMsXG4gICAgbGVmdCA9IDQsXG4gICAgZXBzaWxvbiA9IDFlLTY7XG5cbmZ1bmN0aW9uIHRyYW5zbGF0ZVgoeCkge1xuICByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyB4ICsgXCIsMClcIjtcbn1cblxuZnVuY3Rpb24gdHJhbnNsYXRlWSh5KSB7XG4gIHJldHVybiBcInRyYW5zbGF0ZSgwLFwiICsgeSArIFwiKVwiO1xufVxuXG5mdW5jdGlvbiBudW1iZXIoc2NhbGUpIHtcbiAgcmV0dXJuIGQgPT4gK3NjYWxlKGQpO1xufVxuXG5mdW5jdGlvbiBjZW50ZXIoc2NhbGUsIG9mZnNldCkge1xuICBvZmZzZXQgPSBNYXRoLm1heCgwLCBzY2FsZS5iYW5kd2lkdGgoKSAtIG9mZnNldCAqIDIpIC8gMjtcbiAgaWYgKHNjYWxlLnJvdW5kKCkpIG9mZnNldCA9IE1hdGgucm91bmQob2Zmc2V0KTtcbiAgcmV0dXJuIGQgPT4gK3NjYWxlKGQpICsgb2Zmc2V0O1xufVxuXG5mdW5jdGlvbiBlbnRlcmluZygpIHtcbiAgcmV0dXJuICF0aGlzLl9fYXhpcztcbn1cblxuZnVuY3Rpb24gYXhpcyhvcmllbnQsIHNjYWxlKSB7XG4gIHZhciB0aWNrQXJndW1lbnRzID0gW10sXG4gICAgICB0aWNrVmFsdWVzID0gbnVsbCxcbiAgICAgIHRpY2tGb3JtYXQgPSBudWxsLFxuICAgICAgdGlja1NpemVJbm5lciA9IDYsXG4gICAgICB0aWNrU2l6ZU91dGVyID0gNixcbiAgICAgIHRpY2tQYWRkaW5nID0gMyxcbiAgICAgIG9mZnNldCA9IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93LmRldmljZVBpeGVsUmF0aW8gPiAxID8gMCA6IDAuNSxcbiAgICAgIGsgPSBvcmllbnQgPT09IHRvcCB8fCBvcmllbnQgPT09IGxlZnQgPyAtMSA6IDEsXG4gICAgICB4ID0gb3JpZW50ID09PSBsZWZ0IHx8IG9yaWVudCA9PT0gcmlnaHQgPyBcInhcIiA6IFwieVwiLFxuICAgICAgdHJhbnNmb3JtID0gb3JpZW50ID09PSB0b3AgfHwgb3JpZW50ID09PSBib3R0b20gPyB0cmFuc2xhdGVYIDogdHJhbnNsYXRlWTtcblxuICBmdW5jdGlvbiBheGlzKGNvbnRleHQpIHtcbiAgICB2YXIgdmFsdWVzID0gdGlja1ZhbHVlcyA9PSBudWxsID8gKHNjYWxlLnRpY2tzID8gc2NhbGUudGlja3MuYXBwbHkoc2NhbGUsIHRpY2tBcmd1bWVudHMpIDogc2NhbGUuZG9tYWluKCkpIDogdGlja1ZhbHVlcyxcbiAgICAgICAgZm9ybWF0ID0gdGlja0Zvcm1hdCA9PSBudWxsID8gKHNjYWxlLnRpY2tGb3JtYXQgPyBzY2FsZS50aWNrRm9ybWF0LmFwcGx5KHNjYWxlLCB0aWNrQXJndW1lbnRzKSA6IGlkZW50aXR5KSA6IHRpY2tGb3JtYXQsXG4gICAgICAgIHNwYWNpbmcgPSBNYXRoLm1heCh0aWNrU2l6ZUlubmVyLCAwKSArIHRpY2tQYWRkaW5nLFxuICAgICAgICByYW5nZSA9IHNjYWxlLnJhbmdlKCksXG4gICAgICAgIHJhbmdlMCA9ICtyYW5nZVswXSArIG9mZnNldCxcbiAgICAgICAgcmFuZ2UxID0gK3JhbmdlW3JhbmdlLmxlbmd0aCAtIDFdICsgb2Zmc2V0LFxuICAgICAgICBwb3NpdGlvbiA9IChzY2FsZS5iYW5kd2lkdGggPyBjZW50ZXIgOiBudW1iZXIpKHNjYWxlLmNvcHkoKSwgb2Zmc2V0KSxcbiAgICAgICAgc2VsZWN0aW9uID0gY29udGV4dC5zZWxlY3Rpb24gPyBjb250ZXh0LnNlbGVjdGlvbigpIDogY29udGV4dCxcbiAgICAgICAgcGF0aCA9IHNlbGVjdGlvbi5zZWxlY3RBbGwoXCIuZG9tYWluXCIpLmRhdGEoW251bGxdKSxcbiAgICAgICAgdGljayA9IHNlbGVjdGlvbi5zZWxlY3RBbGwoXCIudGlja1wiKS5kYXRhKHZhbHVlcywgc2NhbGUpLm9yZGVyKCksXG4gICAgICAgIHRpY2tFeGl0ID0gdGljay5leGl0KCksXG4gICAgICAgIHRpY2tFbnRlciA9IHRpY2suZW50ZXIoKS5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcInRpY2tcIiksXG4gICAgICAgIGxpbmUgPSB0aWNrLnNlbGVjdChcImxpbmVcIiksXG4gICAgICAgIHRleHQgPSB0aWNrLnNlbGVjdChcInRleHRcIik7XG5cbiAgICBwYXRoID0gcGF0aC5tZXJnZShwYXRoLmVudGVyKCkuaW5zZXJ0KFwicGF0aFwiLCBcIi50aWNrXCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJkb21haW5cIilcbiAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCJjdXJyZW50Q29sb3JcIikpO1xuXG4gICAgdGljayA9IHRpY2subWVyZ2UodGlja0VudGVyKTtcblxuICAgIGxpbmUgPSBsaW5lLm1lcmdlKHRpY2tFbnRlci5hcHBlbmQoXCJsaW5lXCIpXG4gICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIFwiY3VycmVudENvbG9yXCIpXG4gICAgICAgIC5hdHRyKHggKyBcIjJcIiwgayAqIHRpY2tTaXplSW5uZXIpKTtcblxuICAgIHRleHQgPSB0ZXh0Lm1lcmdlKHRpY2tFbnRlci5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcImN1cnJlbnRDb2xvclwiKVxuICAgICAgICAuYXR0cih4LCBrICogc3BhY2luZylcbiAgICAgICAgLmF0dHIoXCJkeVwiLCBvcmllbnQgPT09IHRvcCA/IFwiMGVtXCIgOiBvcmllbnQgPT09IGJvdHRvbSA/IFwiMC43MWVtXCIgOiBcIjAuMzJlbVwiKSk7XG5cbiAgICBpZiAoY29udGV4dCAhPT0gc2VsZWN0aW9uKSB7XG4gICAgICBwYXRoID0gcGF0aC50cmFuc2l0aW9uKGNvbnRleHQpO1xuICAgICAgdGljayA9IHRpY2sudHJhbnNpdGlvbihjb250ZXh0KTtcbiAgICAgIGxpbmUgPSBsaW5lLnRyYW5zaXRpb24oY29udGV4dCk7XG4gICAgICB0ZXh0ID0gdGV4dC50cmFuc2l0aW9uKGNvbnRleHQpO1xuXG4gICAgICB0aWNrRXhpdCA9IHRpY2tFeGl0LnRyYW5zaXRpb24oY29udGV4dClcbiAgICAgICAgICAuYXR0cihcIm9wYWNpdHlcIiwgZXBzaWxvbilcbiAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBpc0Zpbml0ZShkID0gcG9zaXRpb24oZCkpID8gdHJhbnNmb3JtKGQgKyBvZmZzZXQpIDogdGhpcy5nZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIik7IH0pO1xuXG4gICAgICB0aWNrRW50ZXJcbiAgICAgICAgICAuYXR0cihcIm9wYWNpdHlcIiwgZXBzaWxvbilcbiAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkKSB7IHZhciBwID0gdGhpcy5wYXJlbnROb2RlLl9fYXhpczsgcmV0dXJuIHRyYW5zZm9ybSgocCAmJiBpc0Zpbml0ZShwID0gcChkKSkgPyBwIDogcG9zaXRpb24oZCkpICsgb2Zmc2V0KTsgfSk7XG4gICAgfVxuXG4gICAgdGlja0V4aXQucmVtb3ZlKCk7XG5cbiAgICBwYXRoXG4gICAgICAgIC5hdHRyKFwiZFwiLCBvcmllbnQgPT09IGxlZnQgfHwgb3JpZW50ID09PSByaWdodFxuICAgICAgICAgICAgPyAodGlja1NpemVPdXRlciA/IFwiTVwiICsgayAqIHRpY2tTaXplT3V0ZXIgKyBcIixcIiArIHJhbmdlMCArIFwiSFwiICsgb2Zmc2V0ICsgXCJWXCIgKyByYW5nZTEgKyBcIkhcIiArIGsgKiB0aWNrU2l6ZU91dGVyIDogXCJNXCIgKyBvZmZzZXQgKyBcIixcIiArIHJhbmdlMCArIFwiVlwiICsgcmFuZ2UxKVxuICAgICAgICAgICAgOiAodGlja1NpemVPdXRlciA/IFwiTVwiICsgcmFuZ2UwICsgXCIsXCIgKyBrICogdGlja1NpemVPdXRlciArIFwiVlwiICsgb2Zmc2V0ICsgXCJIXCIgKyByYW5nZTEgKyBcIlZcIiArIGsgKiB0aWNrU2l6ZU91dGVyIDogXCJNXCIgKyByYW5nZTAgKyBcIixcIiArIG9mZnNldCArIFwiSFwiICsgcmFuZ2UxKSk7XG5cbiAgICB0aWNrXG4gICAgICAgIC5hdHRyKFwib3BhY2l0eVwiLCAxKVxuICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiB0cmFuc2Zvcm0ocG9zaXRpb24oZCkgKyBvZmZzZXQpOyB9KTtcblxuICAgIGxpbmVcbiAgICAgICAgLmF0dHIoeCArIFwiMlwiLCBrICogdGlja1NpemVJbm5lcik7XG5cbiAgICB0ZXh0XG4gICAgICAgIC5hdHRyKHgsIGsgKiBzcGFjaW5nKVxuICAgICAgICAudGV4dChmb3JtYXQpO1xuXG4gICAgc2VsZWN0aW9uLmZpbHRlcihlbnRlcmluZylcbiAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwibm9uZVwiKVxuICAgICAgICAuYXR0cihcImZvbnQtc2l6ZVwiLCAxMClcbiAgICAgICAgLmF0dHIoXCJmb250LWZhbWlseVwiLCBcInNhbnMtc2VyaWZcIilcbiAgICAgICAgLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBvcmllbnQgPT09IHJpZ2h0ID8gXCJzdGFydFwiIDogb3JpZW50ID09PSBsZWZ0ID8gXCJlbmRcIiA6IFwibWlkZGxlXCIpO1xuXG4gICAgc2VsZWN0aW9uXG4gICAgICAgIC5lYWNoKGZ1bmN0aW9uKCkgeyB0aGlzLl9fYXhpcyA9IHBvc2l0aW9uOyB9KTtcbiAgfVxuXG4gIGF4aXMuc2NhbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoc2NhbGUgPSBfLCBheGlzKSA6IHNjYWxlO1xuICB9O1xuXG4gIGF4aXMudGlja3MgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGlja0FyZ3VtZW50cyA9IEFycmF5LmZyb20oYXJndW1lbnRzKSwgYXhpcztcbiAgfTtcblxuICBheGlzLnRpY2tBcmd1bWVudHMgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodGlja0FyZ3VtZW50cyA9IF8gPT0gbnVsbCA/IFtdIDogQXJyYXkuZnJvbShfKSwgYXhpcykgOiB0aWNrQXJndW1lbnRzLnNsaWNlKCk7XG4gIH07XG5cbiAgYXhpcy50aWNrVmFsdWVzID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHRpY2tWYWx1ZXMgPSBfID09IG51bGwgPyBudWxsIDogQXJyYXkuZnJvbShfKSwgYXhpcykgOiB0aWNrVmFsdWVzICYmIHRpY2tWYWx1ZXMuc2xpY2UoKTtcbiAgfTtcblxuICBheGlzLnRpY2tGb3JtYXQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodGlja0Zvcm1hdCA9IF8sIGF4aXMpIDogdGlja0Zvcm1hdDtcbiAgfTtcblxuICBheGlzLnRpY2tTaXplID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHRpY2tTaXplSW5uZXIgPSB0aWNrU2l6ZU91dGVyID0gK18sIGF4aXMpIDogdGlja1NpemVJbm5lcjtcbiAgfTtcblxuICBheGlzLnRpY2tTaXplSW5uZXIgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodGlja1NpemVJbm5lciA9ICtfLCBheGlzKSA6IHRpY2tTaXplSW5uZXI7XG4gIH07XG5cbiAgYXhpcy50aWNrU2l6ZU91dGVyID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHRpY2tTaXplT3V0ZXIgPSArXywgYXhpcykgOiB0aWNrU2l6ZU91dGVyO1xuICB9O1xuXG4gIGF4aXMudGlja1BhZGRpbmcgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodGlja1BhZGRpbmcgPSArXywgYXhpcykgOiB0aWNrUGFkZGluZztcbiAgfTtcblxuICBheGlzLm9mZnNldCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChvZmZzZXQgPSArXywgYXhpcykgOiBvZmZzZXQ7XG4gIH07XG5cbiAgcmV0dXJuIGF4aXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBheGlzVG9wKHNjYWxlKSB7XG4gIHJldHVybiBheGlzKHRvcCwgc2NhbGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXhpc1JpZ2h0KHNjYWxlKSB7XG4gIHJldHVybiBheGlzKHJpZ2h0LCBzY2FsZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBheGlzQm90dG9tKHNjYWxlKSB7XG4gIHJldHVybiBheGlzKGJvdHRvbSwgc2NhbGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXhpc0xlZnQoc2NhbGUpIHtcbiAgcmV0dXJuIGF4aXMobGVmdCwgc2NhbGUpO1xufVxuIiwiZXhwb3J0IHtcbiAgYXhpc1RvcCxcbiAgYXhpc1JpZ2h0LFxuICBheGlzQm90dG9tLFxuICBheGlzTGVmdFxufSBmcm9tIFwiLi9heGlzLmpzXCI7XG4iLCJ2YXIgbm9vcCA9IHt2YWx1ZTogKCkgPT4ge319O1xuXG5mdW5jdGlvbiBkaXNwYXRjaCgpIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSBhcmd1bWVudHMubGVuZ3RoLCBfID0ge30sIHQ7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAoISh0ID0gYXJndW1lbnRzW2ldICsgXCJcIikgfHwgKHQgaW4gXykgfHwgL1tcXHMuXS8udGVzdCh0KSkgdGhyb3cgbmV3IEVycm9yKFwiaWxsZWdhbCB0eXBlOiBcIiArIHQpO1xuICAgIF9bdF0gPSBbXTtcbiAgfVxuICByZXR1cm4gbmV3IERpc3BhdGNoKF8pO1xufVxuXG5mdW5jdGlvbiBEaXNwYXRjaChfKSB7XG4gIHRoaXMuXyA9IF87XG59XG5cbmZ1bmN0aW9uIHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lcywgdHlwZXMpIHtcbiAgcmV0dXJuIHR5cGVuYW1lcy50cmltKCkuc3BsaXQoL158XFxzKy8pLm1hcChmdW5jdGlvbih0KSB7XG4gICAgdmFyIG5hbWUgPSBcIlwiLCBpID0gdC5pbmRleE9mKFwiLlwiKTtcbiAgICBpZiAoaSA+PSAwKSBuYW1lID0gdC5zbGljZShpICsgMSksIHQgPSB0LnNsaWNlKDAsIGkpO1xuICAgIGlmICh0ICYmICF0eXBlcy5oYXNPd25Qcm9wZXJ0eSh0KSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHQpO1xuICAgIHJldHVybiB7dHlwZTogdCwgbmFtZTogbmFtZX07XG4gIH0pO1xufVxuXG5EaXNwYXRjaC5wcm90b3R5cGUgPSBkaXNwYXRjaC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBEaXNwYXRjaCxcbiAgb246IGZ1bmN0aW9uKHR5cGVuYW1lLCBjYWxsYmFjaykge1xuICAgIHZhciBfID0gdGhpcy5fLFxuICAgICAgICBUID0gcGFyc2VUeXBlbmFtZXModHlwZW5hbWUgKyBcIlwiLCBfKSxcbiAgICAgICAgdCxcbiAgICAgICAgaSA9IC0xLFxuICAgICAgICBuID0gVC5sZW5ndGg7XG5cbiAgICAvLyBJZiBubyBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCByZXR1cm4gdGhlIGNhbGxiYWNrIG9mIHRoZSBnaXZlbiB0eXBlIGFuZCBuYW1lLlxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgd2hpbGUgKCsraSA8IG4pIGlmICgodCA9ICh0eXBlbmFtZSA9IFRbaV0pLnR5cGUpICYmICh0ID0gZ2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUpKSkgcmV0dXJuIHQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgYSB0eXBlIHdhcyBzcGVjaWZpZWQsIHNldCB0aGUgY2FsbGJhY2sgZm9yIHRoZSBnaXZlbiB0eXBlIGFuZCBuYW1lLlxuICAgIC8vIE90aGVyd2lzZSwgaWYgYSBudWxsIGNhbGxiYWNrIHdhcyBzcGVjaWZpZWQsIHJlbW92ZSBjYWxsYmFja3Mgb2YgdGhlIGdpdmVuIG5hbWUuXG4gICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgY2FsbGJhY2s6IFwiICsgY2FsbGJhY2spO1xuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICBpZiAodCA9ICh0eXBlbmFtZSA9IFRbaV0pLnR5cGUpIF9bdF0gPSBzZXQoX1t0XSwgdHlwZW5hbWUubmFtZSwgY2FsbGJhY2spO1xuICAgICAgZWxzZSBpZiAoY2FsbGJhY2sgPT0gbnVsbCkgZm9yICh0IGluIF8pIF9bdF0gPSBzZXQoX1t0XSwgdHlwZW5hbWUubmFtZSwgbnVsbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIGNvcHk6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb3B5ID0ge30sIF8gPSB0aGlzLl87XG4gICAgZm9yICh2YXIgdCBpbiBfKSBjb3B5W3RdID0gX1t0XS5zbGljZSgpO1xuICAgIHJldHVybiBuZXcgRGlzcGF0Y2goY29weSk7XG4gIH0sXG4gIGNhbGw6IGZ1bmN0aW9uKHR5cGUsIHRoYXQpIHtcbiAgICBpZiAoKG4gPSBhcmd1bWVudHMubGVuZ3RoIC0gMikgPiAwKSBmb3IgKHZhciBhcmdzID0gbmV3IEFycmF5KG4pLCBpID0gMCwgbiwgdDsgaSA8IG47ICsraSkgYXJnc1tpXSA9IGFyZ3VtZW50c1tpICsgMl07XG4gICAgaWYgKCF0aGlzLl8uaGFzT3duUHJvcGVydHkodHlwZSkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0eXBlKTtcbiAgICBmb3IgKHQgPSB0aGlzLl9bdHlwZV0sIGkgPSAwLCBuID0gdC5sZW5ndGg7IGkgPCBuOyArK2kpIHRbaV0udmFsdWUuYXBwbHkodGhhdCwgYXJncyk7XG4gIH0sXG4gIGFwcGx5OiBmdW5jdGlvbih0eXBlLCB0aGF0LCBhcmdzKSB7XG4gICAgaWYgKCF0aGlzLl8uaGFzT3duUHJvcGVydHkodHlwZSkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0eXBlKTtcbiAgICBmb3IgKHZhciB0ID0gdGhpcy5fW3R5cGVdLCBpID0gMCwgbiA9IHQubGVuZ3RoOyBpIDwgbjsgKytpKSB0W2ldLnZhbHVlLmFwcGx5KHRoYXQsIGFyZ3MpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZXQodHlwZSwgbmFtZSkge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IHR5cGUubGVuZ3RoLCBjOyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKChjID0gdHlwZVtpXSkubmFtZSA9PT0gbmFtZSkge1xuICAgICAgcmV0dXJuIGMudmFsdWU7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldCh0eXBlLCBuYW1lLCBjYWxsYmFjaykge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IHR5cGUubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKHR5cGVbaV0ubmFtZSA9PT0gbmFtZSkge1xuICAgICAgdHlwZVtpXSA9IG5vb3AsIHR5cGUgPSB0eXBlLnNsaWNlKDAsIGkpLmNvbmNhdCh0eXBlLnNsaWNlKGkgKyAxKSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHR5cGUucHVzaCh7bmFtZTogbmFtZSwgdmFsdWU6IGNhbGxiYWNrfSk7XG4gIHJldHVybiB0eXBlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBkaXNwYXRjaDtcbiIsImV4cG9ydCB7ZGVmYXVsdCBhcyBkaXNwYXRjaH0gZnJvbSBcIi4vZGlzcGF0Y2guanNcIjtcbiIsImV4cG9ydCBjb25zdCBsaW5lYXIgPSB0ID0+ICt0O1xuIiwiZXhwb3J0IGZ1bmN0aW9uIHF1YWRJbih0KSB7XG4gIHJldHVybiB0ICogdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1YWRPdXQodCkge1xuICByZXR1cm4gdCAqICgyIC0gdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBxdWFkSW5PdXQodCkge1xuICByZXR1cm4gKCh0ICo9IDIpIDw9IDEgPyB0ICogdCA6IC0tdCAqICgyIC0gdCkgKyAxKSAvIDI7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gY3ViaWNJbih0KSB7XG4gIHJldHVybiB0ICogdCAqIHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjdWJpY091dCh0KSB7XG4gIHJldHVybiAtLXQgKiB0ICogdCArIDE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjdWJpY0luT3V0KHQpIHtcbiAgcmV0dXJuICgodCAqPSAyKSA8PSAxID8gdCAqIHQgKiB0IDogKHQgLT0gMikgKiB0ICogdCArIDIpIC8gMjtcbn1cbiIsInZhciBleHBvbmVudCA9IDM7XG5cbmV4cG9ydCB2YXIgcG9seUluID0gKGZ1bmN0aW9uIGN1c3RvbShlKSB7XG4gIGUgPSArZTtcblxuICBmdW5jdGlvbiBwb2x5SW4odCkge1xuICAgIHJldHVybiBNYXRoLnBvdyh0LCBlKTtcbiAgfVxuXG4gIHBvbHlJbi5leHBvbmVudCA9IGN1c3RvbTtcblxuICByZXR1cm4gcG9seUluO1xufSkoZXhwb25lbnQpO1xuXG5leHBvcnQgdmFyIHBvbHlPdXQgPSAoZnVuY3Rpb24gY3VzdG9tKGUpIHtcbiAgZSA9ICtlO1xuXG4gIGZ1bmN0aW9uIHBvbHlPdXQodCkge1xuICAgIHJldHVybiAxIC0gTWF0aC5wb3coMSAtIHQsIGUpO1xuICB9XG5cbiAgcG9seU91dC5leHBvbmVudCA9IGN1c3RvbTtcblxuICByZXR1cm4gcG9seU91dDtcbn0pKGV4cG9uZW50KTtcblxuZXhwb3J0IHZhciBwb2x5SW5PdXQgPSAoZnVuY3Rpb24gY3VzdG9tKGUpIHtcbiAgZSA9ICtlO1xuXG4gIGZ1bmN0aW9uIHBvbHlJbk91dCh0KSB7XG4gICAgcmV0dXJuICgodCAqPSAyKSA8PSAxID8gTWF0aC5wb3codCwgZSkgOiAyIC0gTWF0aC5wb3coMiAtIHQsIGUpKSAvIDI7XG4gIH1cblxuICBwb2x5SW5PdXQuZXhwb25lbnQgPSBjdXN0b207XG5cbiAgcmV0dXJuIHBvbHlJbk91dDtcbn0pKGV4cG9uZW50KTtcbiIsInZhciBwaSA9IE1hdGguUEksXG4gICAgaGFsZlBpID0gcGkgLyAyO1xuXG5leHBvcnQgZnVuY3Rpb24gc2luSW4odCkge1xuICByZXR1cm4gKCt0ID09PSAxKSA/IDEgOiAxIC0gTWF0aC5jb3ModCAqIGhhbGZQaSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaW5PdXQodCkge1xuICByZXR1cm4gTWF0aC5zaW4odCAqIGhhbGZQaSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaW5Jbk91dCh0KSB7XG4gIHJldHVybiAoMSAtIE1hdGguY29zKHBpICogdCkpIC8gMjtcbn1cbiIsIi8vIHRwbXQgaXMgdHdvIHBvd2VyIG1pbnVzIHRlbiB0aW1lcyB0IHNjYWxlZCB0byBbMCwxXVxuZXhwb3J0IGZ1bmN0aW9uIHRwbXQoeCkge1xuICByZXR1cm4gKE1hdGgucG93KDIsIC0xMCAqIHgpIC0gMC4wMDA5NzY1NjI1KSAqIDEuMDAwOTc3NTE3MTA2NTQ5NDtcbn1cbiIsImltcG9ydCB7dHBtdH0gZnJvbSBcIi4vbWF0aC5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gZXhwSW4odCkge1xuICByZXR1cm4gdHBtdCgxIC0gK3QpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhwT3V0KHQpIHtcbiAgcmV0dXJuIDEgLSB0cG10KHQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhwSW5PdXQodCkge1xuICByZXR1cm4gKCh0ICo9IDIpIDw9IDEgPyB0cG10KDEgLSB0KSA6IDIgLSB0cG10KHQgLSAxKSkgLyAyO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGNpcmNsZUluKHQpIHtcbiAgcmV0dXJuIDEgLSBNYXRoLnNxcnQoMSAtIHQgKiB0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNpcmNsZU91dCh0KSB7XG4gIHJldHVybiBNYXRoLnNxcnQoMSAtIC0tdCAqIHQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2lyY2xlSW5PdXQodCkge1xuICByZXR1cm4gKCh0ICo9IDIpIDw9IDEgPyAxIC0gTWF0aC5zcXJ0KDEgLSB0ICogdCkgOiBNYXRoLnNxcnQoMSAtICh0IC09IDIpICogdCkgKyAxKSAvIDI7XG59XG4iLCJ2YXIgYjEgPSA0IC8gMTEsXG4gICAgYjIgPSA2IC8gMTEsXG4gICAgYjMgPSA4IC8gMTEsXG4gICAgYjQgPSAzIC8gNCxcbiAgICBiNSA9IDkgLyAxMSxcbiAgICBiNiA9IDEwIC8gMTEsXG4gICAgYjcgPSAxNSAvIDE2LFxuICAgIGI4ID0gMjEgLyAyMixcbiAgICBiOSA9IDYzIC8gNjQsXG4gICAgYjAgPSAxIC8gYjEgLyBiMTtcblxuZXhwb3J0IGZ1bmN0aW9uIGJvdW5jZUluKHQpIHtcbiAgcmV0dXJuIDEgLSBib3VuY2VPdXQoMSAtIHQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYm91bmNlT3V0KHQpIHtcbiAgcmV0dXJuICh0ID0gK3QpIDwgYjEgPyBiMCAqIHQgKiB0IDogdCA8IGIzID8gYjAgKiAodCAtPSBiMikgKiB0ICsgYjQgOiB0IDwgYjYgPyBiMCAqICh0IC09IGI1KSAqIHQgKyBiNyA6IGIwICogKHQgLT0gYjgpICogdCArIGI5O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYm91bmNlSW5PdXQodCkge1xuICByZXR1cm4gKCh0ICo9IDIpIDw9IDEgPyAxIC0gYm91bmNlT3V0KDEgLSB0KSA6IGJvdW5jZU91dCh0IC0gMSkgKyAxKSAvIDI7XG59XG4iLCJ2YXIgb3ZlcnNob290ID0gMS43MDE1ODtcblxuZXhwb3J0IHZhciBiYWNrSW4gPSAoZnVuY3Rpb24gY3VzdG9tKHMpIHtcbiAgcyA9ICtzO1xuXG4gIGZ1bmN0aW9uIGJhY2tJbih0KSB7XG4gICAgcmV0dXJuICh0ID0gK3QpICogdCAqIChzICogKHQgLSAxKSArIHQpO1xuICB9XG5cbiAgYmFja0luLm92ZXJzaG9vdCA9IGN1c3RvbTtcblxuICByZXR1cm4gYmFja0luO1xufSkob3ZlcnNob290KTtcblxuZXhwb3J0IHZhciBiYWNrT3V0ID0gKGZ1bmN0aW9uIGN1c3RvbShzKSB7XG4gIHMgPSArcztcblxuICBmdW5jdGlvbiBiYWNrT3V0KHQpIHtcbiAgICByZXR1cm4gLS10ICogdCAqICgodCArIDEpICogcyArIHQpICsgMTtcbiAgfVxuXG4gIGJhY2tPdXQub3ZlcnNob290ID0gY3VzdG9tO1xuXG4gIHJldHVybiBiYWNrT3V0O1xufSkob3ZlcnNob290KTtcblxuZXhwb3J0IHZhciBiYWNrSW5PdXQgPSAoZnVuY3Rpb24gY3VzdG9tKHMpIHtcbiAgcyA9ICtzO1xuXG4gIGZ1bmN0aW9uIGJhY2tJbk91dCh0KSB7XG4gICAgcmV0dXJuICgodCAqPSAyKSA8IDEgPyB0ICogdCAqICgocyArIDEpICogdCAtIHMpIDogKHQgLT0gMikgKiB0ICogKChzICsgMSkgKiB0ICsgcykgKyAyKSAvIDI7XG4gIH1cblxuICBiYWNrSW5PdXQub3ZlcnNob290ID0gY3VzdG9tO1xuXG4gIHJldHVybiBiYWNrSW5PdXQ7XG59KShvdmVyc2hvb3QpO1xuIiwiaW1wb3J0IHt0cG10fSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5cbnZhciB0YXUgPSAyICogTWF0aC5QSSxcbiAgICBhbXBsaXR1ZGUgPSAxLFxuICAgIHBlcmlvZCA9IDAuMztcblxuZXhwb3J0IHZhciBlbGFzdGljSW4gPSAoZnVuY3Rpb24gY3VzdG9tKGEsIHApIHtcbiAgdmFyIHMgPSBNYXRoLmFzaW4oMSAvIChhID0gTWF0aC5tYXgoMSwgYSkpKSAqIChwIC89IHRhdSk7XG5cbiAgZnVuY3Rpb24gZWxhc3RpY0luKHQpIHtcbiAgICByZXR1cm4gYSAqIHRwbXQoLSgtLXQpKSAqIE1hdGguc2luKChzIC0gdCkgLyBwKTtcbiAgfVxuXG4gIGVsYXN0aWNJbi5hbXBsaXR1ZGUgPSBmdW5jdGlvbihhKSB7IHJldHVybiBjdXN0b20oYSwgcCAqIHRhdSk7IH07XG4gIGVsYXN0aWNJbi5wZXJpb2QgPSBmdW5jdGlvbihwKSB7IHJldHVybiBjdXN0b20oYSwgcCk7IH07XG5cbiAgcmV0dXJuIGVsYXN0aWNJbjtcbn0pKGFtcGxpdHVkZSwgcGVyaW9kKTtcblxuZXhwb3J0IHZhciBlbGFzdGljT3V0ID0gKGZ1bmN0aW9uIGN1c3RvbShhLCBwKSB7XG4gIHZhciBzID0gTWF0aC5hc2luKDEgLyAoYSA9IE1hdGgubWF4KDEsIGEpKSkgKiAocCAvPSB0YXUpO1xuXG4gIGZ1bmN0aW9uIGVsYXN0aWNPdXQodCkge1xuICAgIHJldHVybiAxIC0gYSAqIHRwbXQodCA9ICt0KSAqIE1hdGguc2luKCh0ICsgcykgLyBwKTtcbiAgfVxuXG4gIGVsYXN0aWNPdXQuYW1wbGl0dWRlID0gZnVuY3Rpb24oYSkgeyByZXR1cm4gY3VzdG9tKGEsIHAgKiB0YXUpOyB9O1xuICBlbGFzdGljT3V0LnBlcmlvZCA9IGZ1bmN0aW9uKHApIHsgcmV0dXJuIGN1c3RvbShhLCBwKTsgfTtcblxuICByZXR1cm4gZWxhc3RpY091dDtcbn0pKGFtcGxpdHVkZSwgcGVyaW9kKTtcblxuZXhwb3J0IHZhciBlbGFzdGljSW5PdXQgPSAoZnVuY3Rpb24gY3VzdG9tKGEsIHApIHtcbiAgdmFyIHMgPSBNYXRoLmFzaW4oMSAvIChhID0gTWF0aC5tYXgoMSwgYSkpKSAqIChwIC89IHRhdSk7XG5cbiAgZnVuY3Rpb24gZWxhc3RpY0luT3V0KHQpIHtcbiAgICByZXR1cm4gKCh0ID0gdCAqIDIgLSAxKSA8IDBcbiAgICAgICAgPyBhICogdHBtdCgtdCkgKiBNYXRoLnNpbigocyAtIHQpIC8gcClcbiAgICAgICAgOiAyIC0gYSAqIHRwbXQodCkgKiBNYXRoLnNpbigocyArIHQpIC8gcCkpIC8gMjtcbiAgfVxuXG4gIGVsYXN0aWNJbk91dC5hbXBsaXR1ZGUgPSBmdW5jdGlvbihhKSB7IHJldHVybiBjdXN0b20oYSwgcCAqIHRhdSk7IH07XG4gIGVsYXN0aWNJbk91dC5wZXJpb2QgPSBmdW5jdGlvbihwKSB7IHJldHVybiBjdXN0b20oYSwgcCk7IH07XG5cbiAgcmV0dXJuIGVsYXN0aWNJbk91dDtcbn0pKGFtcGxpdHVkZSwgcGVyaW9kKTtcbiIsImV4cG9ydCB7XG4gIGxpbmVhciBhcyBlYXNlTGluZWFyXG59IGZyb20gXCIuL2xpbmVhci5qc1wiO1xuXG5leHBvcnQge1xuICBxdWFkSW5PdXQgYXMgZWFzZVF1YWQsXG4gIHF1YWRJbiBhcyBlYXNlUXVhZEluLFxuICBxdWFkT3V0IGFzIGVhc2VRdWFkT3V0LFxuICBxdWFkSW5PdXQgYXMgZWFzZVF1YWRJbk91dFxufSBmcm9tIFwiLi9xdWFkLmpzXCI7XG5cbmV4cG9ydCB7XG4gIGN1YmljSW5PdXQgYXMgZWFzZUN1YmljLFxuICBjdWJpY0luIGFzIGVhc2VDdWJpY0luLFxuICBjdWJpY091dCBhcyBlYXNlQ3ViaWNPdXQsXG4gIGN1YmljSW5PdXQgYXMgZWFzZUN1YmljSW5PdXRcbn0gZnJvbSBcIi4vY3ViaWMuanNcIjtcblxuZXhwb3J0IHtcbiAgcG9seUluT3V0IGFzIGVhc2VQb2x5LFxuICBwb2x5SW4gYXMgZWFzZVBvbHlJbixcbiAgcG9seU91dCBhcyBlYXNlUG9seU91dCxcbiAgcG9seUluT3V0IGFzIGVhc2VQb2x5SW5PdXRcbn0gZnJvbSBcIi4vcG9seS5qc1wiO1xuXG5leHBvcnQge1xuICBzaW5Jbk91dCBhcyBlYXNlU2luLFxuICBzaW5JbiBhcyBlYXNlU2luSW4sXG4gIHNpbk91dCBhcyBlYXNlU2luT3V0LFxuICBzaW5Jbk91dCBhcyBlYXNlU2luSW5PdXRcbn0gZnJvbSBcIi4vc2luLmpzXCI7XG5cbmV4cG9ydCB7XG4gIGV4cEluT3V0IGFzIGVhc2VFeHAsXG4gIGV4cEluIGFzIGVhc2VFeHBJbixcbiAgZXhwT3V0IGFzIGVhc2VFeHBPdXQsXG4gIGV4cEluT3V0IGFzIGVhc2VFeHBJbk91dFxufSBmcm9tIFwiLi9leHAuanNcIjtcblxuZXhwb3J0IHtcbiAgY2lyY2xlSW5PdXQgYXMgZWFzZUNpcmNsZSxcbiAgY2lyY2xlSW4gYXMgZWFzZUNpcmNsZUluLFxuICBjaXJjbGVPdXQgYXMgZWFzZUNpcmNsZU91dCxcbiAgY2lyY2xlSW5PdXQgYXMgZWFzZUNpcmNsZUluT3V0XG59IGZyb20gXCIuL2NpcmNsZS5qc1wiO1xuXG5leHBvcnQge1xuICBib3VuY2VPdXQgYXMgZWFzZUJvdW5jZSxcbiAgYm91bmNlSW4gYXMgZWFzZUJvdW5jZUluLFxuICBib3VuY2VPdXQgYXMgZWFzZUJvdW5jZU91dCxcbiAgYm91bmNlSW5PdXQgYXMgZWFzZUJvdW5jZUluT3V0XG59IGZyb20gXCIuL2JvdW5jZS5qc1wiO1xuXG5leHBvcnQge1xuICBiYWNrSW5PdXQgYXMgZWFzZUJhY2ssXG4gIGJhY2tJbiBhcyBlYXNlQmFja0luLFxuICBiYWNrT3V0IGFzIGVhc2VCYWNrT3V0LFxuICBiYWNrSW5PdXQgYXMgZWFzZUJhY2tJbk91dFxufSBmcm9tIFwiLi9iYWNrLmpzXCI7XG5cbmV4cG9ydCB7XG4gIGVsYXN0aWNPdXQgYXMgZWFzZUVsYXN0aWMsXG4gIGVsYXN0aWNJbiBhcyBlYXNlRWxhc3RpY0luLFxuICBlbGFzdGljT3V0IGFzIGVhc2VFbGFzdGljT3V0LFxuICBlbGFzdGljSW5PdXQgYXMgZWFzZUVsYXN0aWNJbk91dFxufSBmcm9tIFwiLi9lbGFzdGljLmpzXCI7XG4iLCIvLyBUaGVzZSBhcmUgdHlwaWNhbGx5IHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBub2V2ZW50IHRvIGVuc3VyZSB0aGF0IHdlIGNhblxuLy8gcHJldmVudERlZmF1bHQgb24gdGhlIGV2ZW50LlxuZXhwb3J0IGNvbnN0IG5vbnBhc3NpdmUgPSB7cGFzc2l2ZTogZmFsc2V9O1xuZXhwb3J0IGNvbnN0IG5vbnBhc3NpdmVjYXB0dXJlID0ge2NhcHR1cmU6IHRydWUsIHBhc3NpdmU6IGZhbHNlfTtcblxuZXhwb3J0IGZ1bmN0aW9uIG5vcHJvcGFnYXRpb24oZXZlbnQpIHtcbiAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xufVxuIiwiaW1wb3J0IHtzZWxlY3R9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCBub2V2ZW50LCB7bm9ucGFzc2l2ZWNhcHR1cmV9IGZyb20gXCIuL25vZXZlbnQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmlldykge1xuICB2YXIgcm9vdCA9IHZpZXcuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuICAgICAgc2VsZWN0aW9uID0gc2VsZWN0KHZpZXcpLm9uKFwiZHJhZ3N0YXJ0LmRyYWdcIiwgbm9ldmVudCwgbm9ucGFzc2l2ZWNhcHR1cmUpO1xuICBpZiAoXCJvbnNlbGVjdHN0YXJ0XCIgaW4gcm9vdCkge1xuICAgIHNlbGVjdGlvbi5vbihcInNlbGVjdHN0YXJ0LmRyYWdcIiwgbm9ldmVudCwgbm9ucGFzc2l2ZWNhcHR1cmUpO1xuICB9IGVsc2Uge1xuICAgIHJvb3QuX19ub3NlbGVjdCA9IHJvb3Quc3R5bGUuTW96VXNlclNlbGVjdDtcbiAgICByb290LnN0eWxlLk1velVzZXJTZWxlY3QgPSBcIm5vbmVcIjtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24geWVzZHJhZyh2aWV3LCBub2NsaWNrKSB7XG4gIHZhciByb290ID0gdmlldy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG4gICAgICBzZWxlY3Rpb24gPSBzZWxlY3Qodmlldykub24oXCJkcmFnc3RhcnQuZHJhZ1wiLCBudWxsKTtcbiAgaWYgKG5vY2xpY2spIHtcbiAgICBzZWxlY3Rpb24ub24oXCJjbGljay5kcmFnXCIsIG5vZXZlbnQsIG5vbnBhc3NpdmVjYXB0dXJlKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBzZWxlY3Rpb24ub24oXCJjbGljay5kcmFnXCIsIG51bGwpOyB9LCAwKTtcbiAgfVxuICBpZiAoXCJvbnNlbGVjdHN0YXJ0XCIgaW4gcm9vdCkge1xuICAgIHNlbGVjdGlvbi5vbihcInNlbGVjdHN0YXJ0LmRyYWdcIiwgbnVsbCk7XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5zdHlsZS5Nb3pVc2VyU2VsZWN0ID0gcm9vdC5fX25vc2VsZWN0O1xuICAgIGRlbGV0ZSByb290Ll9fbm9zZWxlY3Q7XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IHggPT4gKCkgPT4geDtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIERyYWdFdmVudCh0eXBlLCB7XG4gIHNvdXJjZUV2ZW50LFxuICBzdWJqZWN0LFxuICB0YXJnZXQsXG4gIGlkZW50aWZpZXIsXG4gIGFjdGl2ZSxcbiAgeCwgeSwgZHgsIGR5LFxuICBkaXNwYXRjaFxufSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgdHlwZToge3ZhbHVlOiB0eXBlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWV9LFxuICAgIHNvdXJjZUV2ZW50OiB7dmFsdWU6IHNvdXJjZUV2ZW50LCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWV9LFxuICAgIHN1YmplY3Q6IHt2YWx1ZTogc3ViamVjdCwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlfSxcbiAgICB0YXJnZXQ6IHt2YWx1ZTogdGFyZ2V0LCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWV9LFxuICAgIGlkZW50aWZpZXI6IHt2YWx1ZTogaWRlbnRpZmllciwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlfSxcbiAgICBhY3RpdmU6IHt2YWx1ZTogYWN0aXZlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWV9LFxuICAgIHg6IHt2YWx1ZTogeCwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlfSxcbiAgICB5OiB7dmFsdWU6IHksIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZX0sXG4gICAgZHg6IHt2YWx1ZTogZHgsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZX0sXG4gICAgZHk6IHt2YWx1ZTogZHksIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZX0sXG4gICAgXzoge3ZhbHVlOiBkaXNwYXRjaH1cbiAgfSk7XG59XG5cbkRyYWdFdmVudC5wcm90b3R5cGUub24gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHZhbHVlID0gdGhpcy5fLm9uLmFwcGx5KHRoaXMuXywgYXJndW1lbnRzKTtcbiAgcmV0dXJuIHZhbHVlID09PSB0aGlzLl8gPyB0aGlzIDogdmFsdWU7XG59O1xuIiwiaW1wb3J0IHtkaXNwYXRjaH0gZnJvbSBcImQzLWRpc3BhdGNoXCI7XG5pbXBvcnQge3NlbGVjdCwgcG9pbnRlcn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IG5vZHJhZywge3llc2RyYWd9IGZyb20gXCIuL25vZHJhZy5qc1wiO1xuaW1wb3J0IG5vZXZlbnQsIHtub25wYXNzaXZlLCBub25wYXNzaXZlY2FwdHVyZSwgbm9wcm9wYWdhdGlvbn0gZnJvbSBcIi4vbm9ldmVudC5qc1wiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5pbXBvcnQgRHJhZ0V2ZW50IGZyb20gXCIuL2V2ZW50LmpzXCI7XG5cbi8vIElnbm9yZSByaWdodC1jbGljaywgc2luY2UgdGhhdCBzaG91bGQgb3BlbiB0aGUgY29udGV4dCBtZW51LlxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlcihldmVudCkge1xuICByZXR1cm4gIWV2ZW50LmN0cmxLZXkgJiYgIWV2ZW50LmJ1dHRvbjtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdENvbnRhaW5lcigpIHtcbiAgcmV0dXJuIHRoaXMucGFyZW50Tm9kZTtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdFN1YmplY3QoZXZlbnQsIGQpIHtcbiAgcmV0dXJuIGQgPT0gbnVsbCA/IHt4OiBldmVudC54LCB5OiBldmVudC55fSA6IGQ7XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRUb3VjaGFibGUoKSB7XG4gIHJldHVybiBuYXZpZ2F0b3IubWF4VG91Y2hQb2ludHMgfHwgKFwib250b3VjaHN0YXJ0XCIgaW4gdGhpcyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgZmlsdGVyID0gZGVmYXVsdEZpbHRlcixcbiAgICAgIGNvbnRhaW5lciA9IGRlZmF1bHRDb250YWluZXIsXG4gICAgICBzdWJqZWN0ID0gZGVmYXVsdFN1YmplY3QsXG4gICAgICB0b3VjaGFibGUgPSBkZWZhdWx0VG91Y2hhYmxlLFxuICAgICAgZ2VzdHVyZXMgPSB7fSxcbiAgICAgIGxpc3RlbmVycyA9IGRpc3BhdGNoKFwic3RhcnRcIiwgXCJkcmFnXCIsIFwiZW5kXCIpLFxuICAgICAgYWN0aXZlID0gMCxcbiAgICAgIG1vdXNlZG93bngsXG4gICAgICBtb3VzZWRvd255LFxuICAgICAgbW91c2Vtb3ZpbmcsXG4gICAgICB0b3VjaGVuZGluZyxcbiAgICAgIGNsaWNrRGlzdGFuY2UyID0gMDtcblxuICBmdW5jdGlvbiBkcmFnKHNlbGVjdGlvbikge1xuICAgIHNlbGVjdGlvblxuICAgICAgICAub24oXCJtb3VzZWRvd24uZHJhZ1wiLCBtb3VzZWRvd25lZClcbiAgICAgIC5maWx0ZXIodG91Y2hhYmxlKVxuICAgICAgICAub24oXCJ0b3VjaHN0YXJ0LmRyYWdcIiwgdG91Y2hzdGFydGVkKVxuICAgICAgICAub24oXCJ0b3VjaG1vdmUuZHJhZ1wiLCB0b3VjaG1vdmVkLCBub25wYXNzaXZlKVxuICAgICAgICAub24oXCJ0b3VjaGVuZC5kcmFnIHRvdWNoY2FuY2VsLmRyYWdcIiwgdG91Y2hlbmRlZClcbiAgICAgICAgLnN0eWxlKFwidG91Y2gtYWN0aW9uXCIsIFwibm9uZVwiKVxuICAgICAgICAuc3R5bGUoXCItd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3JcIiwgXCJyZ2JhKDAsMCwwLDApXCIpO1xuICB9XG5cbiAgZnVuY3Rpb24gbW91c2Vkb3duZWQoZXZlbnQsIGQpIHtcbiAgICBpZiAodG91Y2hlbmRpbmcgfHwgIWZpbHRlci5jYWxsKHRoaXMsIGV2ZW50LCBkKSkgcmV0dXJuO1xuICAgIHZhciBnZXN0dXJlID0gYmVmb3Jlc3RhcnQodGhpcywgY29udGFpbmVyLmNhbGwodGhpcywgZXZlbnQsIGQpLCBldmVudCwgZCwgXCJtb3VzZVwiKTtcbiAgICBpZiAoIWdlc3R1cmUpIHJldHVybjtcbiAgICBzZWxlY3QoZXZlbnQudmlldylcbiAgICAgIC5vbihcIm1vdXNlbW92ZS5kcmFnXCIsIG1vdXNlbW92ZWQsIG5vbnBhc3NpdmVjYXB0dXJlKVxuICAgICAgLm9uKFwibW91c2V1cC5kcmFnXCIsIG1vdXNldXBwZWQsIG5vbnBhc3NpdmVjYXB0dXJlKTtcbiAgICBub2RyYWcoZXZlbnQudmlldyk7XG4gICAgbm9wcm9wYWdhdGlvbihldmVudCk7XG4gICAgbW91c2Vtb3ZpbmcgPSBmYWxzZTtcbiAgICBtb3VzZWRvd254ID0gZXZlbnQuY2xpZW50WDtcbiAgICBtb3VzZWRvd255ID0gZXZlbnQuY2xpZW50WTtcbiAgICBnZXN0dXJlKFwic3RhcnRcIiwgZXZlbnQpO1xuICB9XG5cbiAgZnVuY3Rpb24gbW91c2Vtb3ZlZChldmVudCkge1xuICAgIG5vZXZlbnQoZXZlbnQpO1xuICAgIGlmICghbW91c2Vtb3ZpbmcpIHtcbiAgICAgIHZhciBkeCA9IGV2ZW50LmNsaWVudFggLSBtb3VzZWRvd254LCBkeSA9IGV2ZW50LmNsaWVudFkgLSBtb3VzZWRvd255O1xuICAgICAgbW91c2Vtb3ZpbmcgPSBkeCAqIGR4ICsgZHkgKiBkeSA+IGNsaWNrRGlzdGFuY2UyO1xuICAgIH1cbiAgICBnZXN0dXJlcy5tb3VzZShcImRyYWdcIiwgZXZlbnQpO1xuICB9XG5cbiAgZnVuY3Rpb24gbW91c2V1cHBlZChldmVudCkge1xuICAgIHNlbGVjdChldmVudC52aWV3KS5vbihcIm1vdXNlbW92ZS5kcmFnIG1vdXNldXAuZHJhZ1wiLCBudWxsKTtcbiAgICB5ZXNkcmFnKGV2ZW50LnZpZXcsIG1vdXNlbW92aW5nKTtcbiAgICBub2V2ZW50KGV2ZW50KTtcbiAgICBnZXN0dXJlcy5tb3VzZShcImVuZFwiLCBldmVudCk7XG4gIH1cblxuICBmdW5jdGlvbiB0b3VjaHN0YXJ0ZWQoZXZlbnQsIGQpIHtcbiAgICBpZiAoIWZpbHRlci5jYWxsKHRoaXMsIGV2ZW50LCBkKSkgcmV0dXJuO1xuICAgIHZhciB0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXMsXG4gICAgICAgIGMgPSBjb250YWluZXIuY2FsbCh0aGlzLCBldmVudCwgZCksXG4gICAgICAgIG4gPSB0b3VjaGVzLmxlbmd0aCwgaSwgZ2VzdHVyZTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChnZXN0dXJlID0gYmVmb3Jlc3RhcnQodGhpcywgYywgZXZlbnQsIGQsIHRvdWNoZXNbaV0uaWRlbnRpZmllciwgdG91Y2hlc1tpXSkpIHtcbiAgICAgICAgbm9wcm9wYWdhdGlvbihldmVudCk7XG4gICAgICAgIGdlc3R1cmUoXCJzdGFydFwiLCBldmVudCwgdG91Y2hlc1tpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdG91Y2htb3ZlZChldmVudCkge1xuICAgIHZhciB0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXMsXG4gICAgICAgIG4gPSB0b3VjaGVzLmxlbmd0aCwgaSwgZ2VzdHVyZTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChnZXN0dXJlID0gZ2VzdHVyZXNbdG91Y2hlc1tpXS5pZGVudGlmaWVyXSkge1xuICAgICAgICBub2V2ZW50KGV2ZW50KTtcbiAgICAgICAgZ2VzdHVyZShcImRyYWdcIiwgZXZlbnQsIHRvdWNoZXNbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRvdWNoZW5kZWQoZXZlbnQpIHtcbiAgICB2YXIgdG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzLFxuICAgICAgICBuID0gdG91Y2hlcy5sZW5ndGgsIGksIGdlc3R1cmU7XG5cbiAgICBpZiAodG91Y2hlbmRpbmcpIGNsZWFyVGltZW91dCh0b3VjaGVuZGluZyk7XG4gICAgdG91Y2hlbmRpbmcgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyB0b3VjaGVuZGluZyA9IG51bGw7IH0sIDUwMCk7IC8vIEdob3N0IGNsaWNrcyBhcmUgZGVsYXllZCFcbiAgICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoZ2VzdHVyZSA9IGdlc3R1cmVzW3RvdWNoZXNbaV0uaWRlbnRpZmllcl0pIHtcbiAgICAgICAgbm9wcm9wYWdhdGlvbihldmVudCk7XG4gICAgICAgIGdlc3R1cmUoXCJlbmRcIiwgZXZlbnQsIHRvdWNoZXNbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGJlZm9yZXN0YXJ0KHRoYXQsIGNvbnRhaW5lciwgZXZlbnQsIGQsIGlkZW50aWZpZXIsIHRvdWNoKSB7XG4gICAgdmFyIGRpc3BhdGNoID0gbGlzdGVuZXJzLmNvcHkoKSxcbiAgICAgICAgcCA9IHBvaW50ZXIodG91Y2ggfHwgZXZlbnQsIGNvbnRhaW5lciksIGR4LCBkeSxcbiAgICAgICAgcztcblxuICAgIGlmICgocyA9IHN1YmplY3QuY2FsbCh0aGF0LCBuZXcgRHJhZ0V2ZW50KFwiYmVmb3Jlc3RhcnRcIiwge1xuICAgICAgICBzb3VyY2VFdmVudDogZXZlbnQsXG4gICAgICAgIHRhcmdldDogZHJhZyxcbiAgICAgICAgaWRlbnRpZmllcixcbiAgICAgICAgYWN0aXZlLFxuICAgICAgICB4OiBwWzBdLFxuICAgICAgICB5OiBwWzFdLFxuICAgICAgICBkeDogMCxcbiAgICAgICAgZHk6IDAsXG4gICAgICAgIGRpc3BhdGNoXG4gICAgICB9KSwgZCkpID09IG51bGwpIHJldHVybjtcblxuICAgIGR4ID0gcy54IC0gcFswXSB8fCAwO1xuICAgIGR5ID0gcy55IC0gcFsxXSB8fCAwO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGdlc3R1cmUodHlwZSwgZXZlbnQsIHRvdWNoKSB7XG4gICAgICB2YXIgcDAgPSBwLCBuO1xuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgXCJzdGFydFwiOiBnZXN0dXJlc1tpZGVudGlmaWVyXSA9IGdlc3R1cmUsIG4gPSBhY3RpdmUrKzsgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJlbmRcIjogZGVsZXRlIGdlc3R1cmVzW2lkZW50aWZpZXJdLCAtLWFjdGl2ZTsgLy8gZmFsbHMgdGhyb3VnaFxuICAgICAgICBjYXNlIFwiZHJhZ1wiOiBwID0gcG9pbnRlcih0b3VjaCB8fCBldmVudCwgY29udGFpbmVyKSwgbiA9IGFjdGl2ZTsgYnJlYWs7XG4gICAgICB9XG4gICAgICBkaXNwYXRjaC5jYWxsKFxuICAgICAgICB0eXBlLFxuICAgICAgICB0aGF0LFxuICAgICAgICBuZXcgRHJhZ0V2ZW50KHR5cGUsIHtcbiAgICAgICAgICBzb3VyY2VFdmVudDogZXZlbnQsXG4gICAgICAgICAgc3ViamVjdDogcyxcbiAgICAgICAgICB0YXJnZXQ6IGRyYWcsXG4gICAgICAgICAgaWRlbnRpZmllcixcbiAgICAgICAgICBhY3RpdmU6IG4sXG4gICAgICAgICAgeDogcFswXSArIGR4LFxuICAgICAgICAgIHk6IHBbMV0gKyBkeSxcbiAgICAgICAgICBkeDogcFswXSAtIHAwWzBdLFxuICAgICAgICAgIGR5OiBwWzFdIC0gcDBbMV0sXG4gICAgICAgICAgZGlzcGF0Y2hcbiAgICAgICAgfSksXG4gICAgICAgIGRcbiAgICAgICk7XG4gICAgfTtcbiAgfVxuXG4gIGRyYWcuZmlsdGVyID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGZpbHRlciA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoISFfKSwgZHJhZykgOiBmaWx0ZXI7XG4gIH07XG5cbiAgZHJhZy5jb250YWluZXIgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoY29udGFpbmVyID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudChfKSwgZHJhZykgOiBjb250YWluZXI7XG4gIH07XG5cbiAgZHJhZy5zdWJqZWN0ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHN1YmplY3QgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KF8pLCBkcmFnKSA6IHN1YmplY3Q7XG4gIH07XG5cbiAgZHJhZy50b3VjaGFibGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodG91Y2hhYmxlID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCghIV8pLCBkcmFnKSA6IHRvdWNoYWJsZTtcbiAgfTtcblxuICBkcmFnLm9uID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlID0gbGlzdGVuZXJzLm9uLmFwcGx5KGxpc3RlbmVycywgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdmFsdWUgPT09IGxpc3RlbmVycyA/IGRyYWcgOiB2YWx1ZTtcbiAgfTtcblxuICBkcmFnLmNsaWNrRGlzdGFuY2UgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoY2xpY2tEaXN0YW5jZTIgPSAoXyA9ICtfKSAqIF8sIGRyYWcpIDogTWF0aC5zcXJ0KGNsaWNrRGlzdGFuY2UyKTtcbiAgfTtcblxuICByZXR1cm4gZHJhZztcbn1cbiIsImV4cG9ydCB7ZGVmYXVsdCBhcyBkcmFnfSBmcm9tIFwiLi9kcmFnLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgZHJhZ0Rpc2FibGUsIHllc2RyYWcgYXMgZHJhZ0VuYWJsZX0gZnJvbSBcIi4vbm9kcmFnLmpzXCI7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=