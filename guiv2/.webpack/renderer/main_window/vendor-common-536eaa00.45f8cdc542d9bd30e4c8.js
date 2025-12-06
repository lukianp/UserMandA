(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[7639],{

/***/ 316:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const isIndex = __webpack_require__(18509);
const isArrayLike = __webpack_require__(80058);
const isObject = __webpack_require__(44905);
const eq = __webpack_require__(86761);

function isIterateeCall(value, index, object) {
    if (!isObject.isObject(object)) {
        return false;
    }
    if ((typeof index === 'number' && isArrayLike.isArrayLike(object) && isIndex.isIndex(index) && index < object.length) ||
        (typeof index === 'string' && index in object)) {
        return eq.eq(object[index], value);
    }
    return false;
}

exports.isIterateeCall = isIterateeCall;


/***/ }),

/***/ 1081:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(52810).uniqBy;


/***/ }),

/***/ 1846:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function isObjectLike(value) {
    return typeof value === 'object' && value !== null;
}

exports.isObjectLike = isObjectLike;


/***/ }),

/***/ 1863:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function toString(value) {
    if (value == null) {
        return '';
    }
    if (typeof value === 'string') {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(toString).join(',');
    }
    const result = String(value);
    if (result === '0' && Object.is(Number(value), -0)) {
        return '-0';
    }
    return result;
}

exports.toString = toString;


/***/ }),

/***/ 3025:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const toString = __webpack_require__(1863);
const toKey = __webpack_require__(21465);

function toPath(deepKey) {
    if (Array.isArray(deepKey)) {
        return deepKey.map(toKey.toKey);
    }
    if (typeof deepKey === 'symbol') {
        return [deepKey];
    }
    deepKey = toString.toString(deepKey);
    const result = [];
    const length = deepKey.length;
    if (length === 0) {
        return result;
    }
    let index = 0;
    let key = '';
    let quoteChar = '';
    let bracket = false;
    if (deepKey.charCodeAt(0) === 46) {
        result.push('');
        index++;
    }
    while (index < length) {
        const char = deepKey[index];
        if (quoteChar) {
            if (char === '\\' && index + 1 < length) {
                index++;
                key += deepKey[index];
            }
            else if (char === quoteChar) {
                quoteChar = '';
            }
            else {
                key += char;
            }
        }
        else if (bracket) {
            if (char === '"' || char === "'") {
                quoteChar = char;
            }
            else if (char === ']') {
                bracket = false;
                result.push(key);
                key = '';
            }
            else {
                key += char;
            }
        }
        else {
            if (char === '[') {
                bracket = true;
                if (key) {
                    result.push(key);
                    key = '';
                }
            }
            else if (char === '.') {
                if (key) {
                    result.push(key);
                    key = '';
                }
            }
            else {
                key += char;
            }
        }
        index++;
    }
    if (key) {
        result.push(key);
    }
    return result;
}

exports.toPath = toPath;


/***/ }),

/***/ 3844:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const cloneDeepWith = __webpack_require__(53964);

function cloneDeep(obj) {
    return cloneDeepWith.cloneDeepWithImpl(obj, undefined, obj, new Map(), undefined);
}

exports.cloneDeep = cloneDeep;


/***/ }),

/***/ 5821:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const identity = __webpack_require__(14059);
const property = __webpack_require__(83403);
const matches = __webpack_require__(7861);
const matchesProperty = __webpack_require__(53036);

function iteratee(value) {
    if (value == null) {
        return identity.identity;
    }
    switch (typeof value) {
        case 'function': {
            return value;
        }
        case 'object': {
            if (Array.isArray(value) && value.length === 2) {
                return matchesProperty.matchesProperty(value[0], value[1]);
            }
            return matches.matches(value);
        }
        case 'string':
        case 'symbol':
        case 'number': {
            return property.property(value);
        }
    }
}

exports.iteratee = iteratee;


/***/ }),

/***/ 7861:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const isMatch = __webpack_require__(40717);
const cloneDeep = __webpack_require__(3844);

function matches(source) {
    source = cloneDeep.cloneDeep(source);
    return (target) => {
        return isMatch.isMatch(target, source);
    };
}

exports.matches = matches;


/***/ }),

/***/ 8193:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function isUnsafeProperty(key) {
    return key === '__proto__';
}

exports.isUnsafeProperty = isUnsafeProperty;


/***/ }),

/***/ 8805:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function uniqBy(arr, mapper) {
    const map = new Map();
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const key = mapper(item);
        if (!map.has(key)) {
            map.set(key, item);
        }
    }
    return Array.from(map.values());
}

exports.uniqBy = uniqBy;


/***/ }),

/***/ 10334:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function maxBy(items, getValue) {
    if (items.length === 0) {
        return undefined;
    }
    let maxElement = items[0];
    let max = getValue(maxElement);
    for (let i = 1; i < items.length; i++) {
        const element = items[i];
        const value = getValue(element);
        if (value > max) {
            max = value;
            maxElement = element;
        }
    }
    return maxElement;
}

exports.maxBy = maxBy;


/***/ }),

/***/ 10555:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const isTypedArray$1 = __webpack_require__(83908);

function isTypedArray(x) {
    return isTypedArray$1.isTypedArray(x);
}

exports.isTypedArray = isTypedArray;


/***/ }),

/***/ 11576:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(44167).omit;


/***/ }),

/***/ 12049:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function getTag(value) {
    if (value == null) {
        return value === undefined ? '[object Undefined]' : '[object Null]';
    }
    return Object.prototype.toString.call(value);
}

exports.getTag = getTag;


/***/ }),

/***/ 12972:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(70924).minBy;


/***/ }),

/***/ 14059:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function identity(x) {
    return x;
}

exports.identity = identity;


/***/ }),

/***/ 16166:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const isArrayLike = __webpack_require__(80058);

function flatten(value, depth = 1) {
    const result = [];
    const flooredDepth = Math.floor(depth);
    if (!isArrayLike.isArrayLike(value)) {
        return result;
    }
    const recursive = (arr, currentDepth) => {
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if (currentDepth < flooredDepth &&
                (Array.isArray(item) ||
                    Boolean(item?.[Symbol.isConcatSpreadable]) ||
                    (item !== null && typeof item === 'object' && Object.prototype.toString.call(item) === '[object Arguments]'))) {
                if (Array.isArray(item)) {
                    recursive(item, currentDepth + 1);
                }
                else {
                    recursive(Array.from(item), currentDepth + 1);
                }
            }
            else {
                result.push(item);
            }
        }
    };
    recursive(Array.from(value), 0);
    return result;
}

exports.flatten = flatten;


/***/ }),

/***/ 17324:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const isDeepKey = __webpack_require__(95112);
const isIndex = __webpack_require__(18509);
const isArguments = __webpack_require__(82984);
const toPath = __webpack_require__(3025);

function has(object, path) {
    let resolvedPath;
    if (Array.isArray(path)) {
        resolvedPath = path;
    }
    else if (typeof path === 'string' && isDeepKey.isDeepKey(path) && object?.[path] == null) {
        resolvedPath = toPath.toPath(path);
    }
    else {
        resolvedPath = [path];
    }
    if (resolvedPath.length === 0) {
        return false;
    }
    let current = object;
    for (let i = 0; i < resolvedPath.length; i++) {
        const key = resolvedPath[i];
        if (current == null || !Object.hasOwn(current, key)) {
            const isSparseIndex = (Array.isArray(current) || isArguments.isArguments(current)) && isIndex.isIndex(key) && key < current.length;
            if (!isSparseIndex) {
                return false;
            }
        }
        current = current[key];
    }
    return true;
}

exports.has = has;


/***/ }),

/***/ 18509:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const IS_UNSIGNED_INTEGER = /^(?:0|[1-9]\d*)$/;
function isIndex(value, length = Number.MAX_SAFE_INTEGER) {
    switch (typeof value) {
        case 'number': {
            return Number.isInteger(value) && value >= 0 && value < length;
        }
        case 'symbol': {
            return false;
        }
        case 'string': {
            return IS_UNSIGNED_INTEGER.test(value);
        }
    }
}

exports.isIndex = isIndex;


/***/ }),

/***/ 20025:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(21334).last;


/***/ }),

/***/ 20457:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! @license DOMPurify 2.5.8 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/2.5.8/LICENSE */

(function (global, factory) {
   true && "object" !== 'undefined' ? module.exports = factory() :
   true ? !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
		__WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)) :
  (0);
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
    return _setPrototypeOf(o, p);
  }
  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }
  function _construct(Parent, args, Class) {
    if (_isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }
    return _construct.apply(null, arguments);
  }
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var hasOwnProperty = Object.hasOwnProperty,
    setPrototypeOf = Object.setPrototypeOf,
    isFrozen = Object.isFrozen,
    getPrototypeOf = Object.getPrototypeOf,
    getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  var freeze = Object.freeze,
    seal = Object.seal,
    create = Object.create; // eslint-disable-line import/no-mutable-exports
  var _ref = typeof Reflect !== 'undefined' && Reflect,
    apply = _ref.apply,
    construct = _ref.construct;
  if (!apply) {
    apply = function apply(fun, thisValue, args) {
      return fun.apply(thisValue, args);
    };
  }
  if (!freeze) {
    freeze = function freeze(x) {
      return x;
    };
  }
  if (!seal) {
    seal = function seal(x) {
      return x;
    };
  }
  if (!construct) {
    construct = function construct(Func, args) {
      return _construct(Func, _toConsumableArray(args));
    };
  }
  var arrayForEach = unapply(Array.prototype.forEach);
  var arrayPop = unapply(Array.prototype.pop);
  var arrayPush = unapply(Array.prototype.push);
  var stringToLowerCase = unapply(String.prototype.toLowerCase);
  var stringToString = unapply(String.prototype.toString);
  var stringMatch = unapply(String.prototype.match);
  var stringReplace = unapply(String.prototype.replace);
  var stringIndexOf = unapply(String.prototype.indexOf);
  var stringTrim = unapply(String.prototype.trim);
  var regExpTest = unapply(RegExp.prototype.test);
  var typeErrorCreate = unconstruct(TypeError);
  function unapply(func) {
    return function (thisArg) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      return apply(func, thisArg, args);
    };
  }
  function unconstruct(func) {
    return function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      return construct(func, args);
    };
  }

  /* Add properties to a lookup table */
  function addToSet(set, array, transformCaseFunc) {
    var _transformCaseFunc;
    transformCaseFunc = (_transformCaseFunc = transformCaseFunc) !== null && _transformCaseFunc !== void 0 ? _transformCaseFunc : stringToLowerCase;
    if (setPrototypeOf) {
      // Make 'in' and truthy checks like Boolean(set.constructor)
      // independent of any properties defined on Object.prototype.
      // Prevent prototype setters from intercepting set as a this value.
      setPrototypeOf(set, null);
    }
    var l = array.length;
    while (l--) {
      var element = array[l];
      if (typeof element === 'string') {
        var lcElement = transformCaseFunc(element);
        if (lcElement !== element) {
          // Config presets (e.g. tags.js, attrs.js) are immutable.
          if (!isFrozen(array)) {
            array[l] = lcElement;
          }
          element = lcElement;
        }
      }
      set[element] = true;
    }
    return set;
  }

  /* Shallow clone an object */
  function clone(object) {
    var newObject = create(null);
    var property;
    for (property in object) {
      if (apply(hasOwnProperty, object, [property]) === true) {
        newObject[property] = object[property];
      }
    }
    return newObject;
  }

  /* IE10 doesn't support __lookupGetter__ so lets'
   * simulate it. It also automatically checks
   * if the prop is function or getter and behaves
   * accordingly. */
  function lookupGetter(object, prop) {
    while (object !== null) {
      var desc = getOwnPropertyDescriptor(object, prop);
      if (desc) {
        if (desc.get) {
          return unapply(desc.get);
        }
        if (typeof desc.value === 'function') {
          return unapply(desc.value);
        }
      }
      object = getPrototypeOf(object);
    }
    function fallbackValue(element) {
      console.warn('fallback value for', element);
      return null;
    }
    return fallbackValue;
  }

  var html$1 = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']);

  // SVG
  var svg$1 = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'view', 'vkern']);
  var svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']);

  // List of SVG elements that are disallowed by default.
  // We still need to know them so that we can do namespace
  // checks properly in case one wants to add them to
  // allow-list.
  var svgDisallowed = freeze(['animate', 'color-profile', 'cursor', 'discard', 'fedropshadow', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignobject', 'hatch', 'hatchpath', 'mesh', 'meshgradient', 'meshpatch', 'meshrow', 'missing-glyph', 'script', 'set', 'solidcolor', 'unknown', 'use']);
  var mathMl$1 = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover']);

  // Similarly to SVG, we want to know all MathML elements,
  // even those that we disallow by default.
  var mathMlDisallowed = freeze(['maction', 'maligngroup', 'malignmark', 'mlongdiv', 'mscarries', 'mscarry', 'msgroup', 'mstack', 'msline', 'msrow', 'semantics', 'annotation', 'annotation-xml', 'mprescripts', 'none']);
  var text = freeze(['#text']);

  var html = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background', 'bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'disablepictureinpicture', 'disableremoteplayback', 'download', 'draggable', 'enctype', 'enterkeyhint', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'muted', 'name', 'nonce', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'playsinline', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'xmlns', 'slot']);
  var svg = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clippathunits', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'systemlanguage', 'tabindex', 'targetx', 'targety', 'transform', 'transform-origin', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);
  var mathMl = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);
  var xml = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);

  // eslint-disable-next-line unicorn/better-regex
  var MUSTACHE_EXPR = seal(/\{\{[\w\W]*|[\w\W]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode
  var ERB_EXPR = seal(/<%[\w\W]*|[\w\W]*%>/gm);
  var TMPLIT_EXPR = seal(/\${[\w\W]*}/gm);
  var DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]+$/); // eslint-disable-line no-useless-escape
  var ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape
  var IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
  );
  var IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
  var ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g // eslint-disable-line no-control-regex
  );
  var DOCTYPE_NAME = seal(/^html$/i);
  var CUSTOM_ELEMENT = seal(/^[a-z][.\w]*(-[.\w]+)+$/i);

  var getGlobal = function getGlobal() {
    return typeof window === 'undefined' ? null : window;
  };

  /**
   * Creates a no-op policy for internal use only.
   * Don't export this function outside this module!
   * @param {?TrustedTypePolicyFactory} trustedTypes The policy factory.
   * @param {Document} document The document object (to determine policy name suffix)
   * @return {?TrustedTypePolicy} The policy created (or null, if Trusted Types
   * are not supported).
   */
  var _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, document) {
    if (_typeof(trustedTypes) !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
      return null;
    }

    // Allow the callers to control the unique policy name
    // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
    // Policy creation with duplicate names throws in Trusted Types.
    var suffix = null;
    var ATTR_NAME = 'data-tt-policy-suffix';
    if (document.currentScript && document.currentScript.hasAttribute(ATTR_NAME)) {
      suffix = document.currentScript.getAttribute(ATTR_NAME);
    }
    var policyName = 'dompurify' + (suffix ? '#' + suffix : '');
    try {
      return trustedTypes.createPolicy(policyName, {
        createHTML: function createHTML(html) {
          return html;
        },
        createScriptURL: function createScriptURL(scriptUrl) {
          return scriptUrl;
        }
      });
    } catch (_) {
      // Policy creation failed (most likely another DOMPurify script has
      // already run). Skip creating the policy, as this will only cause errors
      // if TT are enforced.
      console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
      return null;
    }
  };
  function createDOMPurify() {
    var window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();
    var DOMPurify = function DOMPurify(root) {
      return createDOMPurify(root);
    };

    /**
     * Version label, exposed for easier checks
     * if DOMPurify is up to date or not
     */
    DOMPurify.version = '2.5.8';

    /**
     * Array of elements that DOMPurify removed during sanitation.
     * Empty if nothing was removed.
     */
    DOMPurify.removed = [];
    if (!window || !window.document || window.document.nodeType !== 9) {
      // Not running in a browser, provide a factory function
      // so that you can pass your own Window
      DOMPurify.isSupported = false;
      return DOMPurify;
    }
    var originalDocument = window.document;
    var document = window.document;
    var DocumentFragment = window.DocumentFragment,
      HTMLTemplateElement = window.HTMLTemplateElement,
      Node = window.Node,
      Element = window.Element,
      NodeFilter = window.NodeFilter,
      _window$NamedNodeMap = window.NamedNodeMap,
      NamedNodeMap = _window$NamedNodeMap === void 0 ? window.NamedNodeMap || window.MozNamedAttrMap : _window$NamedNodeMap,
      HTMLFormElement = window.HTMLFormElement,
      DOMParser = window.DOMParser,
      trustedTypes = window.trustedTypes;
    var ElementPrototype = Element.prototype;
    var cloneNode = lookupGetter(ElementPrototype, 'cloneNode');
    var getNextSibling = lookupGetter(ElementPrototype, 'nextSibling');
    var getChildNodes = lookupGetter(ElementPrototype, 'childNodes');
    var getParentNode = lookupGetter(ElementPrototype, 'parentNode');

    // As per issue #47, the web-components registry is inherited by a
    // new document created via createHTMLDocument. As per the spec
    // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
    // a new empty registry is used when creating a template contents owner
    // document, so we use that as our parent document to ensure nothing
    // is inherited.
    if (typeof HTMLTemplateElement === 'function') {
      var template = document.createElement('template');
      if (template.content && template.content.ownerDocument) {
        document = template.content.ownerDocument;
      }
    }
    var trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, originalDocument);
    var emptyHTML = trustedTypesPolicy ? trustedTypesPolicy.createHTML('') : '';
    var _document = document,
      implementation = _document.implementation,
      createNodeIterator = _document.createNodeIterator,
      createDocumentFragment = _document.createDocumentFragment,
      getElementsByTagName = _document.getElementsByTagName;
    var importNode = originalDocument.importNode;
    var documentMode = {};
    try {
      documentMode = clone(document).documentMode ? document.documentMode : {};
    } catch (_) {}
    var hooks = {};

    /**
     * Expose whether this browser supports running the full DOMPurify.
     */
    DOMPurify.isSupported = typeof getParentNode === 'function' && implementation && implementation.createHTMLDocument !== undefined && documentMode !== 9;
    var MUSTACHE_EXPR$1 = MUSTACHE_EXPR,
      ERB_EXPR$1 = ERB_EXPR,
      TMPLIT_EXPR$1 = TMPLIT_EXPR,
      DATA_ATTR$1 = DATA_ATTR,
      ARIA_ATTR$1 = ARIA_ATTR,
      IS_SCRIPT_OR_DATA$1 = IS_SCRIPT_OR_DATA,
      ATTR_WHITESPACE$1 = ATTR_WHITESPACE,
      CUSTOM_ELEMENT$1 = CUSTOM_ELEMENT;
    var IS_ALLOWED_URI$1 = IS_ALLOWED_URI;

    /**
     * We consider the elements and attributes below to be safe. Ideally
     * don't add any new ones but feel free to remove unwanted ones.
     */

    /* allowed element names */
    var ALLOWED_TAGS = null;
    var DEFAULT_ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray(html$1), _toConsumableArray(svg$1), _toConsumableArray(svgFilters), _toConsumableArray(mathMl$1), _toConsumableArray(text)));

    /* Allowed attribute names */
    var ALLOWED_ATTR = null;
    var DEFAULT_ALLOWED_ATTR = addToSet({}, [].concat(_toConsumableArray(html), _toConsumableArray(svg), _toConsumableArray(mathMl), _toConsumableArray(xml)));

    /*
     * Configure how DOMPUrify should handle custom elements and their attributes as well as customized built-in elements.
     * @property {RegExp|Function|null} tagNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any custom elements)
     * @property {RegExp|Function|null} attributeNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any attributes not on the allow list)
     * @property {boolean} allowCustomizedBuiltInElements allow custom elements derived from built-ins if they pass CUSTOM_ELEMENT_HANDLING.tagNameCheck. Default: `false`.
     */
    var CUSTOM_ELEMENT_HANDLING = Object.seal(Object.create(null, {
      tagNameCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      },
      attributeNameCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null
      },
      allowCustomizedBuiltInElements: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: false
      }
    }));

    /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */
    var FORBID_TAGS = null;

    /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */
    var FORBID_ATTR = null;

    /* Decide if ARIA attributes are okay */
    var ALLOW_ARIA_ATTR = true;

    /* Decide if custom data attributes are okay */
    var ALLOW_DATA_ATTR = true;

    /* Decide if unknown protocols are okay */
    var ALLOW_UNKNOWN_PROTOCOLS = false;

    /* Decide if self-closing tags in attributes are allowed.
     * Usually removed due to a mXSS issue in jQuery 3.0 */
    var ALLOW_SELF_CLOSE_IN_ATTR = true;

    /* Output should be safe for common template engines.
     * This means, DOMPurify removes data attributes, mustaches and ERB
     */
    var SAFE_FOR_TEMPLATES = false;

    /* Output should be safe even for XML used within HTML and alike.
     * This means, DOMPurify removes comments when containing risky content.
     */
    var SAFE_FOR_XML = true;

    /* Decide if document with <html>... should be returned */
    var WHOLE_DOCUMENT = false;

    /* Track whether config is already set on this instance of DOMPurify. */
    var SET_CONFIG = false;

    /* Decide if all elements (e.g. style, script) must be children of
     * document.body. By default, browsers might move them to document.head */
    var FORCE_BODY = false;

    /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
     * string (or a TrustedHTML object if Trusted Types are supported).
     * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
     */
    var RETURN_DOM = false;

    /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
     * string  (or a TrustedHTML object if Trusted Types are supported) */
    var RETURN_DOM_FRAGMENT = false;

    /* Try to return a Trusted Type object instead of a string, return a string in
     * case Trusted Types are not supported  */
    var RETURN_TRUSTED_TYPE = false;

    /* Output should be free from DOM clobbering attacks?
     * This sanitizes markups named with colliding, clobberable built-in DOM APIs.
     */
    var SANITIZE_DOM = true;

    /* Achieve full DOM Clobbering protection by isolating the namespace of named
     * properties and JS variables, mitigating attacks that abuse the HTML/DOM spec rules.
     *
     * HTML/DOM spec rules that enable DOM Clobbering:
     *   - Named Access on Window (§7.3.3)
     *   - DOM Tree Accessors (§3.1.5)
     *   - Form Element Parent-Child Relations (§4.10.3)
     *   - Iframe srcdoc / Nested WindowProxies (§4.8.5)
     *   - HTMLCollection (§4.2.10.2)
     *
     * Namespace isolation is implemented by prefixing `id` and `name` attributes
     * with a constant string, i.e., `user-content-`
     */
    var SANITIZE_NAMED_PROPS = false;
    var SANITIZE_NAMED_PROPS_PREFIX = 'user-content-';

    /* Keep element content when removing element? */
    var KEEP_CONTENT = true;

    /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
     * of importing it into a new Document and returning a sanitized copy */
    var IN_PLACE = false;

    /* Allow usage of profiles like html, svg and mathMl */
    var USE_PROFILES = {};

    /* Tags to ignore content of when KEEP_CONTENT is true */
    var FORBID_CONTENTS = null;
    var DEFAULT_FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'noscript', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']);

    /* Tags that are safe for data: URIs */
    var DATA_URI_TAGS = null;
    var DEFAULT_DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']);

    /* Attributes safe for values like "javascript:" */
    var URI_SAFE_ATTRIBUTES = null;
    var DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'role', 'summary', 'title', 'value', 'style', 'xmlns']);
    var MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
    var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
    var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
    /* Document namespace */
    var NAMESPACE = HTML_NAMESPACE;
    var IS_EMPTY_INPUT = false;

    /* Allowed XHTML+XML namespaces */
    var ALLOWED_NAMESPACES = null;
    var DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [MATHML_NAMESPACE, SVG_NAMESPACE, HTML_NAMESPACE], stringToString);

    /* Parsing of strict XHTML documents */
    var PARSER_MEDIA_TYPE;
    var SUPPORTED_PARSER_MEDIA_TYPES = ['application/xhtml+xml', 'text/html'];
    var DEFAULT_PARSER_MEDIA_TYPE = 'text/html';
    var transformCaseFunc;

    /* Keep a reference to config to pass to hooks */
    var CONFIG = null;

    /* Ideally, do not touch anything below this line */
    /* ______________________________________________ */

    var formElement = document.createElement('form');
    var isRegexOrFunction = function isRegexOrFunction(testValue) {
      return testValue instanceof RegExp || testValue instanceof Function;
    };

    /**
     * _parseConfig
     *
     * @param  {Object} cfg optional config literal
     */
    // eslint-disable-next-line complexity
    var _parseConfig = function _parseConfig(cfg) {
      if (CONFIG && CONFIG === cfg) {
        return;
      }

      /* Shield configuration object from tampering */
      if (!cfg || _typeof(cfg) !== 'object') {
        cfg = {};
      }

      /* Shield configuration object from prototype pollution */
      cfg = clone(cfg);
      PARSER_MEDIA_TYPE =
      // eslint-disable-next-line unicorn/prefer-includes
      SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? PARSER_MEDIA_TYPE = DEFAULT_PARSER_MEDIA_TYPE : PARSER_MEDIA_TYPE = cfg.PARSER_MEDIA_TYPE;

      // HTML tags and attributes are not case-sensitive, converting to lowercase. Keeping XHTML as is.
      transformCaseFunc = PARSER_MEDIA_TYPE === 'application/xhtml+xml' ? stringToString : stringToLowerCase;

      /* Set configuration parameters */
      ALLOWED_TAGS = 'ALLOWED_TAGS' in cfg ? addToSet({}, cfg.ALLOWED_TAGS, transformCaseFunc) : DEFAULT_ALLOWED_TAGS;
      ALLOWED_ATTR = 'ALLOWED_ATTR' in cfg ? addToSet({}, cfg.ALLOWED_ATTR, transformCaseFunc) : DEFAULT_ALLOWED_ATTR;
      ALLOWED_NAMESPACES = 'ALLOWED_NAMESPACES' in cfg ? addToSet({}, cfg.ALLOWED_NAMESPACES, stringToString) : DEFAULT_ALLOWED_NAMESPACES;
      URI_SAFE_ATTRIBUTES = 'ADD_URI_SAFE_ATTR' in cfg ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES),
      // eslint-disable-line indent
      cfg.ADD_URI_SAFE_ATTR,
      // eslint-disable-line indent
      transformCaseFunc // eslint-disable-line indent
      ) // eslint-disable-line indent
      : DEFAULT_URI_SAFE_ATTRIBUTES;
      DATA_URI_TAGS = 'ADD_DATA_URI_TAGS' in cfg ? addToSet(clone(DEFAULT_DATA_URI_TAGS),
      // eslint-disable-line indent
      cfg.ADD_DATA_URI_TAGS,
      // eslint-disable-line indent
      transformCaseFunc // eslint-disable-line indent
      ) // eslint-disable-line indent
      : DEFAULT_DATA_URI_TAGS;
      FORBID_CONTENTS = 'FORBID_CONTENTS' in cfg ? addToSet({}, cfg.FORBID_CONTENTS, transformCaseFunc) : DEFAULT_FORBID_CONTENTS;
      FORBID_TAGS = 'FORBID_TAGS' in cfg ? addToSet({}, cfg.FORBID_TAGS, transformCaseFunc) : {};
      FORBID_ATTR = 'FORBID_ATTR' in cfg ? addToSet({}, cfg.FORBID_ATTR, transformCaseFunc) : {};
      USE_PROFILES = 'USE_PROFILES' in cfg ? cfg.USE_PROFILES : false;
      ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true
      ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true
      ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false
      ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false; // Default true
      SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false
      SAFE_FOR_XML = cfg.SAFE_FOR_XML !== false; // Default true
      WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false
      RETURN_DOM = cfg.RETURN_DOM || false; // Default false
      RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false
      RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false
      FORCE_BODY = cfg.FORCE_BODY || false; // Default false
      SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true
      SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false; // Default false
      KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true
      IN_PLACE = cfg.IN_PLACE || false; // Default false
      IS_ALLOWED_URI$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI$1;
      NAMESPACE = cfg.NAMESPACE || HTML_NAMESPACE;
      CUSTOM_ELEMENT_HANDLING = cfg.CUSTOM_ELEMENT_HANDLING || {};
      if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck)) {
        CUSTOM_ELEMENT_HANDLING.tagNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck;
      }
      if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)) {
        CUSTOM_ELEMENT_HANDLING.attributeNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck;
      }
      if (cfg.CUSTOM_ELEMENT_HANDLING && typeof cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements === 'boolean') {
        CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements;
      }
      if (SAFE_FOR_TEMPLATES) {
        ALLOW_DATA_ATTR = false;
      }
      if (RETURN_DOM_FRAGMENT) {
        RETURN_DOM = true;
      }

      /* Parse profile info */
      if (USE_PROFILES) {
        ALLOWED_TAGS = addToSet({}, _toConsumableArray(text));
        ALLOWED_ATTR = [];
        if (USE_PROFILES.html === true) {
          addToSet(ALLOWED_TAGS, html$1);
          addToSet(ALLOWED_ATTR, html);
        }
        if (USE_PROFILES.svg === true) {
          addToSet(ALLOWED_TAGS, svg$1);
          addToSet(ALLOWED_ATTR, svg);
          addToSet(ALLOWED_ATTR, xml);
        }
        if (USE_PROFILES.svgFilters === true) {
          addToSet(ALLOWED_TAGS, svgFilters);
          addToSet(ALLOWED_ATTR, svg);
          addToSet(ALLOWED_ATTR, xml);
        }
        if (USE_PROFILES.mathMl === true) {
          addToSet(ALLOWED_TAGS, mathMl$1);
          addToSet(ALLOWED_ATTR, mathMl);
          addToSet(ALLOWED_ATTR, xml);
        }
      }

      /* Merge configuration parameters */
      if (cfg.ADD_TAGS) {
        if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
          ALLOWED_TAGS = clone(ALLOWED_TAGS);
        }
        addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
      }
      if (cfg.ADD_ATTR) {
        if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
          ALLOWED_ATTR = clone(ALLOWED_ATTR);
        }
        addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
      }
      if (cfg.ADD_URI_SAFE_ATTR) {
        addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR, transformCaseFunc);
      }
      if (cfg.FORBID_CONTENTS) {
        if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
          FORBID_CONTENTS = clone(FORBID_CONTENTS);
        }
        addToSet(FORBID_CONTENTS, cfg.FORBID_CONTENTS, transformCaseFunc);
      }

      /* Add #text in case KEEP_CONTENT is set to true */
      if (KEEP_CONTENT) {
        ALLOWED_TAGS['#text'] = true;
      }

      /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */
      if (WHOLE_DOCUMENT) {
        addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
      }

      /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */
      if (ALLOWED_TAGS.table) {
        addToSet(ALLOWED_TAGS, ['tbody']);
        delete FORBID_TAGS.tbody;
      }

      // Prevent further manipulation of configuration.
      // Not available in IE8, Safari 5, etc.
      if (freeze) {
        freeze(cfg);
      }
      CONFIG = cfg;
    };
    var MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, ['mi', 'mo', 'mn', 'ms', 'mtext']);
    var HTML_INTEGRATION_POINTS = addToSet({}, ['annotation-xml']);

    // Certain elements are allowed in both SVG and HTML
    // namespace. We need to specify them explicitly
    // so that they don't get erroneously deleted from
    // HTML namespace.
    var COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, ['title', 'style', 'font', 'a', 'script']);

    /* Keep track of all possible SVG and MathML tags
     * so that we can perform the namespace checks
     * correctly. */
    var ALL_SVG_TAGS = addToSet({}, svg$1);
    addToSet(ALL_SVG_TAGS, svgFilters);
    addToSet(ALL_SVG_TAGS, svgDisallowed);
    var ALL_MATHML_TAGS = addToSet({}, mathMl$1);
    addToSet(ALL_MATHML_TAGS, mathMlDisallowed);

    /**
     *
     *
     * @param  {Element} element a DOM element whose namespace is being checked
     * @returns {boolean} Return false if the element has a
     *  namespace that a spec-compliant parser would never
     *  return. Return true otherwise.
     */
    var _checkValidNamespace = function _checkValidNamespace(element) {
      var parent = getParentNode(element);

      // In JSDOM, if we're inside shadow DOM, then parentNode
      // can be null. We just simulate parent in this case.
      if (!parent || !parent.tagName) {
        parent = {
          namespaceURI: NAMESPACE,
          tagName: 'template'
        };
      }
      var tagName = stringToLowerCase(element.tagName);
      var parentTagName = stringToLowerCase(parent.tagName);
      if (!ALLOWED_NAMESPACES[element.namespaceURI]) {
        return false;
      }
      if (element.namespaceURI === SVG_NAMESPACE) {
        // The only way to switch from HTML namespace to SVG
        // is via <svg>. If it happens via any other tag, then
        // it should be killed.
        if (parent.namespaceURI === HTML_NAMESPACE) {
          return tagName === 'svg';
        }

        // The only way to switch from MathML to SVG is via`
        // svg if parent is either <annotation-xml> or MathML
        // text integration points.
        if (parent.namespaceURI === MATHML_NAMESPACE) {
          return tagName === 'svg' && (parentTagName === 'annotation-xml' || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
        }

        // We only allow elements that are defined in SVG
        // spec. All others are disallowed in SVG namespace.
        return Boolean(ALL_SVG_TAGS[tagName]);
      }
      if (element.namespaceURI === MATHML_NAMESPACE) {
        // The only way to switch from HTML namespace to MathML
        // is via <math>. If it happens via any other tag, then
        // it should be killed.
        if (parent.namespaceURI === HTML_NAMESPACE) {
          return tagName === 'math';
        }

        // The only way to switch from SVG to MathML is via
        // <math> and HTML integration points
        if (parent.namespaceURI === SVG_NAMESPACE) {
          return tagName === 'math' && HTML_INTEGRATION_POINTS[parentTagName];
        }

        // We only allow elements that are defined in MathML
        // spec. All others are disallowed in MathML namespace.
        return Boolean(ALL_MATHML_TAGS[tagName]);
      }
      if (element.namespaceURI === HTML_NAMESPACE) {
        // The only way to switch from SVG to HTML is via
        // HTML integration points, and from MathML to HTML
        // is via MathML text integration points
        if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) {
          return false;
        }
        if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) {
          return false;
        }

        // We disallow tags that are specific for MathML
        // or SVG and should never appear in HTML namespace
        return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
      }

      // For XHTML and XML documents that support custom namespaces
      if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && ALLOWED_NAMESPACES[element.namespaceURI]) {
        return true;
      }

      // The code should never reach this place (this means
      // that the element somehow got namespace that is not
      // HTML, SVG, MathML or allowed via ALLOWED_NAMESPACES).
      // Return false just in case.
      return false;
    };

    /**
     * _forceRemove
     *
     * @param  {Node} node a DOM node
     */
    var _forceRemove = function _forceRemove(node) {
      arrayPush(DOMPurify.removed, {
        element: node
      });
      try {
        // eslint-disable-next-line unicorn/prefer-dom-node-remove
        node.parentNode.removeChild(node);
      } catch (_) {
        try {
          node.outerHTML = emptyHTML;
        } catch (_) {
          node.remove();
        }
      }
    };

    /**
     * _removeAttribute
     *
     * @param  {String} name an Attribute name
     * @param  {Node} node a DOM node
     */
    var _removeAttribute = function _removeAttribute(name, node) {
      try {
        arrayPush(DOMPurify.removed, {
          attribute: node.getAttributeNode(name),
          from: node
        });
      } catch (_) {
        arrayPush(DOMPurify.removed, {
          attribute: null,
          from: node
        });
      }
      node.removeAttribute(name);

      // We void attribute values for unremovable "is"" attributes
      if (name === 'is' && !ALLOWED_ATTR[name]) {
        if (RETURN_DOM || RETURN_DOM_FRAGMENT) {
          try {
            _forceRemove(node);
          } catch (_) {}
        } else {
          try {
            node.setAttribute(name, '');
          } catch (_) {}
        }
      }
    };

    /**
     * _initDocument
     *
     * @param  {String} dirty a string of dirty markup
     * @return {Document} a DOM, filled with the dirty markup
     */
    var _initDocument = function _initDocument(dirty) {
      /* Create a HTML document */
      var doc;
      var leadingWhitespace;
      if (FORCE_BODY) {
        dirty = '<remove></remove>' + dirty;
      } else {
        /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
        var matches = stringMatch(dirty, /^[\r\n\t ]+/);
        leadingWhitespace = matches && matches[0];
      }
      if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && NAMESPACE === HTML_NAMESPACE) {
        // Root of XHTML doc must contain xmlns declaration (see https://www.w3.org/TR/xhtml1/normative.html#strict)
        dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + '</body></html>';
      }
      var dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
      /*
       * Use the DOMParser API by default, fallback later if needs be
       * DOMParser not work for svg when has multiple root element.
       */
      if (NAMESPACE === HTML_NAMESPACE) {
        try {
          doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
        } catch (_) {}
      }

      /* Use createHTMLDocument in case DOMParser is not available */
      if (!doc || !doc.documentElement) {
        doc = implementation.createDocument(NAMESPACE, 'template', null);
        try {
          doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
        } catch (_) {
          // Syntax error if dirtyPayload is invalid xml
        }
      }
      var body = doc.body || doc.documentElement;
      if (dirty && leadingWhitespace) {
        body.insertBefore(document.createTextNode(leadingWhitespace), body.childNodes[0] || null);
      }

      /* Work on whole document or just its body */
      if (NAMESPACE === HTML_NAMESPACE) {
        return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
      }
      return WHOLE_DOCUMENT ? doc.documentElement : body;
    };

    /**
     * _createIterator
     *
     * @param  {Document} root document/fragment to create iterator for
     * @return {Iterator} iterator instance
     */
    var _createIterator = function _createIterator(root) {
      return createNodeIterator.call(root.ownerDocument || root, root,
      // eslint-disable-next-line no-bitwise
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT | NodeFilter.SHOW_PROCESSING_INSTRUCTION | NodeFilter.SHOW_CDATA_SECTION, null, false);
    };

    /**
     * _isClobbered
     *
     * @param  {Node} elm element to check for clobbering attacks
     * @return {Boolean} true if clobbered, false if safe
     */
    var _isClobbered = function _isClobbered(elm) {
      return elm instanceof HTMLFormElement && (typeof elm.nodeName !== 'string' || typeof elm.textContent !== 'string' || typeof elm.removeChild !== 'function' || !(elm.attributes instanceof NamedNodeMap) || typeof elm.removeAttribute !== 'function' || typeof elm.setAttribute !== 'function' || typeof elm.namespaceURI !== 'string' || typeof elm.insertBefore !== 'function' || typeof elm.hasChildNodes !== 'function');
    };

    /**
     * _isNode
     *
     * @param  {Node} obj object to check whether it's a DOM node
     * @return {Boolean} true is object is a DOM node
     */
    var _isNode = function _isNode(object) {
      return _typeof(Node) === 'object' ? object instanceof Node : object && _typeof(object) === 'object' && typeof object.nodeType === 'number' && typeof object.nodeName === 'string';
    };

    /**
     * _executeHook
     * Execute user configurable hooks
     *
     * @param  {String} entryPoint  Name of the hook's entry point
     * @param  {Node} currentNode node to work on with the hook
     * @param  {Object} data additional hook parameters
     */
    var _executeHook = function _executeHook(entryPoint, currentNode, data) {
      if (!hooks[entryPoint]) {
        return;
      }
      arrayForEach(hooks[entryPoint], function (hook) {
        hook.call(DOMPurify, currentNode, data, CONFIG);
      });
    };

    /**
     * _sanitizeElements
     *
     * @protect nodeName
     * @protect textContent
     * @protect removeChild
     *
     * @param   {Node} currentNode to check for permission to exist
     * @return  {Boolean} true if node was killed, false if left alive
     */
    var _sanitizeElements = function _sanitizeElements(currentNode) {
      var content;

      /* Execute a hook if present */
      _executeHook('beforeSanitizeElements', currentNode, null);

      /* Check if element is clobbered or can clobber */
      if (_isClobbered(currentNode)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Check if tagname contains Unicode */
      if (regExpTest(/[\u0080-\uFFFF]/, currentNode.nodeName)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Now let's check the element's type and name */
      var tagName = transformCaseFunc(currentNode.nodeName);

      /* Execute a hook if present */
      _executeHook('uponSanitizeElement', currentNode, {
        tagName: tagName,
        allowedTags: ALLOWED_TAGS
      });

      /* Detect mXSS attempts abusing namespace confusion */
      if (currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && (!_isNode(currentNode.content) || !_isNode(currentNode.content.firstElementChild)) && regExpTest(/<[/\w]/g, currentNode.innerHTML) && regExpTest(/<[/\w]/g, currentNode.textContent)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Mitigate a problem with templates inside select */
      if (tagName === 'select' && regExpTest(/<template/i, currentNode.innerHTML)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Remove any ocurrence of processing instructions */
      if (currentNode.nodeType === 7) {
        _forceRemove(currentNode);
        return true;
      }

      /* Remove any kind of possibly harmful comments */
      if (SAFE_FOR_XML && currentNode.nodeType === 8 && regExpTest(/<[/\w]/g, currentNode.data)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Remove element if anything forbids its presence */
      if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
        /* Check if we have a custom element to handle */
        if (!FORBID_TAGS[tagName] && _basicCustomElementTest(tagName)) {
          if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)) return false;
          if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(tagName)) return false;
        }

        /* Keep content except for bad-listed elements */
        if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
          var parentNode = getParentNode(currentNode) || currentNode.parentNode;
          var childNodes = getChildNodes(currentNode) || currentNode.childNodes;
          if (childNodes && parentNode) {
            var childCount = childNodes.length;
            for (var i = childCount - 1; i >= 0; --i) {
              var childClone = cloneNode(childNodes[i], true);
              childClone.__removalCount = (currentNode.__removalCount || 0) + 1;
              parentNode.insertBefore(childClone, getNextSibling(currentNode));
            }
          }
        }
        _forceRemove(currentNode);
        return true;
      }

      /* Check whether element has a valid namespace */
      if (currentNode instanceof Element && !_checkValidNamespace(currentNode)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Make sure that older browsers don't get fallback-tag mXSS */
      if ((tagName === 'noscript' || tagName === 'noembed' || tagName === 'noframes') && regExpTest(/<\/no(script|embed|frames)/i, currentNode.innerHTML)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Sanitize element content to be template-safe */
      if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
        /* Get the element's text content */
        content = currentNode.textContent;
        content = stringReplace(content, MUSTACHE_EXPR$1, ' ');
        content = stringReplace(content, ERB_EXPR$1, ' ');
        content = stringReplace(content, TMPLIT_EXPR$1, ' ');
        if (currentNode.textContent !== content) {
          arrayPush(DOMPurify.removed, {
            element: currentNode.cloneNode()
          });
          currentNode.textContent = content;
        }
      }

      /* Execute a hook if present */
      _executeHook('afterSanitizeElements', currentNode, null);
      return false;
    };

    /**
     * _isValidAttribute
     *
     * @param  {string} lcTag Lowercase tag name of containing element.
     * @param  {string} lcName Lowercase attribute name.
     * @param  {string} value Attribute value.
     * @return {Boolean} Returns true if `value` is valid, otherwise false.
     */
    // eslint-disable-next-line complexity
    var _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
      /* Make sure attribute cannot clobber */
      if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
        return false;
      }

      /* Allow valid data-* attributes: At least one character after "-"
          (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
          XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
          We don't need to check the value; it's always URI safe. */
      if (ALLOW_DATA_ATTR && !FORBID_ATTR[lcName] && regExpTest(DATA_ATTR$1, lcName)) ; else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR$1, lcName)) ; else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
        if (
        // First condition does a very basic check if a) it's basically a valid custom element tagname AND
        // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
        // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
        _basicCustomElementTest(lcTag) && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(lcTag)) && (CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName) || CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.attributeNameCheck(lcName)) ||
        // Alternative, second condition checks if it's an `is`-attribute, AND
        // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
        lcName === 'is' && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(value))) ; else {
          return false;
        }
        /* Check value is safe. First, is attr inert? If so, is safe */
      } else if (URI_SAFE_ATTRIBUTES[lcName]) ; else if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE$1, ''))) ; else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag]) ; else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA$1, stringReplace(value, ATTR_WHITESPACE$1, ''))) ; else if (value) {
        return false;
      } else ;
      return true;
    };

    /**
     * _basicCustomElementCheck
     * checks if at least one dash is included in tagName, and it's not the first char
     * for more sophisticated checking see https://github.com/sindresorhus/validate-element-name
     * @param {string} tagName name of the tag of the node to sanitize
     */
    var _basicCustomElementTest = function _basicCustomElementTest(tagName) {
      return tagName !== 'annotation-xml' && stringMatch(tagName, CUSTOM_ELEMENT$1);
    };

    /**
     * _sanitizeAttributes
     *
     * @protect attributes
     * @protect nodeName
     * @protect removeAttribute
     * @protect setAttribute
     *
     * @param  {Node} currentNode to sanitize
     */
    var _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
      var attr;
      var value;
      var lcName;
      var l;
      /* Execute a hook if present */
      _executeHook('beforeSanitizeAttributes', currentNode, null);
      var attributes = currentNode.attributes;

      /* Check if we have attributes; if not we might have a text node */
      if (!attributes || _isClobbered(currentNode)) {
        return;
      }
      var hookEvent = {
        attrName: '',
        attrValue: '',
        keepAttr: true,
        allowedAttributes: ALLOWED_ATTR
      };
      l = attributes.length;

      /* Go backwards over all attributes; safely remove bad ones */
      while (l--) {
        attr = attributes[l];
        var _attr = attr,
          name = _attr.name,
          namespaceURI = _attr.namespaceURI;
        value = name === 'value' ? attr.value : stringTrim(attr.value);
        lcName = transformCaseFunc(name);

        /* Execute a hook if present */
        hookEvent.attrName = lcName;
        hookEvent.attrValue = value;
        hookEvent.keepAttr = true;
        hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set
        _executeHook('uponSanitizeAttribute', currentNode, hookEvent);
        value = hookEvent.attrValue;

        /* Did the hooks approve of the attribute? */
        if (hookEvent.forceKeepAttr) {
          continue;
        }

        /* Remove attribute */
        _removeAttribute(name, currentNode);

        /* Did the hooks approve of the attribute? */
        if (!hookEvent.keepAttr) {
          continue;
        }

        /* Work around a security issue in jQuery 3.0 */
        if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(/\/>/i, value)) {
          _removeAttribute(name, currentNode);
          continue;
        }

        /* Sanitize attribute content to be template-safe */
        if (SAFE_FOR_TEMPLATES) {
          value = stringReplace(value, MUSTACHE_EXPR$1, ' ');
          value = stringReplace(value, ERB_EXPR$1, ' ');
          value = stringReplace(value, TMPLIT_EXPR$1, ' ');
        }

        /* Is `value` valid for this attribute? */
        var lcTag = transformCaseFunc(currentNode.nodeName);
        if (!_isValidAttribute(lcTag, lcName, value)) {
          continue;
        }

        /* Full DOM Clobbering protection via namespace isolation,
         * Prefix id and name attributes with `user-content-`
         */
        if (SANITIZE_NAMED_PROPS && (lcName === 'id' || lcName === 'name')) {
          // Remove the attribute with this value
          _removeAttribute(name, currentNode);

          // Prefix the value and later re-create the attribute with the sanitized value
          value = SANITIZE_NAMED_PROPS_PREFIX + value;
        }

        /* Work around a security issue with comments inside attributes */
        if (SAFE_FOR_XML && regExpTest(/((--!?|])>)|<\/(style|title)/i, value)) {
          _removeAttribute(name, currentNode);
          continue;
        }

        /* Handle attributes that require Trusted Types */
        if (trustedTypesPolicy && _typeof(trustedTypes) === 'object' && typeof trustedTypes.getAttributeType === 'function') {
          if (namespaceURI) ; else {
            switch (trustedTypes.getAttributeType(lcTag, lcName)) {
              case 'TrustedHTML':
                {
                  value = trustedTypesPolicy.createHTML(value);
                  break;
                }
              case 'TrustedScriptURL':
                {
                  value = trustedTypesPolicy.createScriptURL(value);
                  break;
                }
            }
          }
        }

        /* Handle invalid data-* attribute set by try-catching it */
        try {
          if (namespaceURI) {
            currentNode.setAttributeNS(namespaceURI, name, value);
          } else {
            /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
            currentNode.setAttribute(name, value);
          }
          if (_isClobbered(currentNode)) {
            _forceRemove(currentNode);
          } else {
            arrayPop(DOMPurify.removed);
          }
        } catch (_) {}
      }

      /* Execute a hook if present */
      _executeHook('afterSanitizeAttributes', currentNode, null);
    };

    /**
     * _sanitizeShadowDOM
     *
     * @param  {DocumentFragment} fragment to iterate over recursively
     */
    var _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
      var shadowNode;
      var shadowIterator = _createIterator(fragment);

      /* Execute a hook if present */
      _executeHook('beforeSanitizeShadowDOM', fragment, null);
      while (shadowNode = shadowIterator.nextNode()) {
        /* Execute a hook if present */
        _executeHook('uponSanitizeShadowNode', shadowNode, null);
        /* Sanitize tags and elements */
        _sanitizeElements(shadowNode);

        /* Check attributes next */
        _sanitizeAttributes(shadowNode);

        /* Deep shadow DOM detected */
        if (shadowNode.content instanceof DocumentFragment) {
          _sanitizeShadowDOM(shadowNode.content);
        }
      }

      /* Execute a hook if present */
      _executeHook('afterSanitizeShadowDOM', fragment, null);
    };

    /**
     * Sanitize
     * Public method providing core sanitation functionality
     *
     * @param {String|Node} dirty string or DOM node
     * @param {Object} configuration object
     */
    // eslint-disable-next-line complexity
    DOMPurify.sanitize = function (dirty) {
      var cfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var body;
      var importedNode;
      var currentNode;
      var oldNode;
      var returnNode;
      /* Make sure we have a string to sanitize.
        DO NOT return early, as this will return the wrong type if
        the user has requested a DOM object rather than a string */
      IS_EMPTY_INPUT = !dirty;
      if (IS_EMPTY_INPUT) {
        dirty = '<!-->';
      }

      /* Stringify, in case dirty is an object */
      if (typeof dirty !== 'string' && !_isNode(dirty)) {
        if (typeof dirty.toString === 'function') {
          dirty = dirty.toString();
          if (typeof dirty !== 'string') {
            throw typeErrorCreate('dirty is not a string, aborting');
          }
        } else {
          throw typeErrorCreate('toString is not a function');
        }
      }

      /* Check we can run. Otherwise fall back or ignore */
      if (!DOMPurify.isSupported) {
        if (_typeof(window.toStaticHTML) === 'object' || typeof window.toStaticHTML === 'function') {
          if (typeof dirty === 'string') {
            return window.toStaticHTML(dirty);
          }
          if (_isNode(dirty)) {
            return window.toStaticHTML(dirty.outerHTML);
          }
        }
        return dirty;
      }

      /* Assign config vars */
      if (!SET_CONFIG) {
        _parseConfig(cfg);
      }

      /* Clean up removed elements */
      DOMPurify.removed = [];

      /* Check if dirty is correctly typed for IN_PLACE */
      if (typeof dirty === 'string') {
        IN_PLACE = false;
      }
      if (IN_PLACE) {
        /* Do some early pre-sanitization to avoid unsafe root nodes */
        if (dirty.nodeName) {
          var tagName = transformCaseFunc(dirty.nodeName);
          if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
            throw typeErrorCreate('root node is forbidden and cannot be sanitized in-place');
          }
        }
      } else if (dirty instanceof Node) {
        /* If dirty is a DOM element, append to an empty document to avoid
           elements being stripped by the parser */
        body = _initDocument('<!---->');
        importedNode = body.ownerDocument.importNode(dirty, true);
        if (importedNode.nodeType === 1 && importedNode.nodeName === 'BODY') {
          /* Node is already a body, use as is */
          body = importedNode;
        } else if (importedNode.nodeName === 'HTML') {
          body = importedNode;
        } else {
          // eslint-disable-next-line unicorn/prefer-dom-node-append
          body.appendChild(importedNode);
        }
      } else {
        /* Exit directly if we have nothing to do */
        if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT &&
        // eslint-disable-next-line unicorn/prefer-includes
        dirty.indexOf('<') === -1) {
          return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
        }

        /* Initialize the document to work on */
        body = _initDocument(dirty);

        /* Check we have a DOM node from the data */
        if (!body) {
          return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : '';
        }
      }

      /* Remove first element node (ours) if FORCE_BODY is set */
      if (body && FORCE_BODY) {
        _forceRemove(body.firstChild);
      }

      /* Get node iterator */
      var nodeIterator = _createIterator(IN_PLACE ? dirty : body);

      /* Now start iterating over the created document */
      while (currentNode = nodeIterator.nextNode()) {
        /* Fix IE's strange behavior with manipulated textNodes #89 */
        if (currentNode.nodeType === 3 && currentNode === oldNode) {
          continue;
        }

        /* Sanitize tags and elements */
        _sanitizeElements(currentNode);

        /* Check attributes next */
        _sanitizeAttributes(currentNode);

        /* Shadow DOM detected, sanitize it */
        if (currentNode.content instanceof DocumentFragment) {
          _sanitizeShadowDOM(currentNode.content);
        }
        oldNode = currentNode;
      }
      oldNode = null;

      /* If we sanitized `dirty` in-place, return it. */
      if (IN_PLACE) {
        return dirty;
      }

      /* Return sanitized string or DOM */
      if (RETURN_DOM) {
        if (RETURN_DOM_FRAGMENT) {
          returnNode = createDocumentFragment.call(body.ownerDocument);
          while (body.firstChild) {
            // eslint-disable-next-line unicorn/prefer-dom-node-append
            returnNode.appendChild(body.firstChild);
          }
        } else {
          returnNode = body;
        }
        if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmod) {
          /*
            AdoptNode() is not used because internal state is not reset
            (e.g. the past names map of a HTMLFormElement), this is safe
            in theory but we would rather not risk another attack vector.
            The state that is cloned by importNode() is explicitly defined
            by the specs.
          */
          returnNode = importNode.call(originalDocument, returnNode, true);
        }
        return returnNode;
      }
      var serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;

      /* Serialize doctype if allowed */
      if (WHOLE_DOCUMENT && ALLOWED_TAGS['!doctype'] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name)) {
        serializedHTML = '<!DOCTYPE ' + body.ownerDocument.doctype.name + '>\n' + serializedHTML;
      }

      /* Sanitize final string template-safe */
      if (SAFE_FOR_TEMPLATES) {
        serializedHTML = stringReplace(serializedHTML, MUSTACHE_EXPR$1, ' ');
        serializedHTML = stringReplace(serializedHTML, ERB_EXPR$1, ' ');
        serializedHTML = stringReplace(serializedHTML, TMPLIT_EXPR$1, ' ');
      }
      return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
    };

    /**
     * Public method to set the configuration once
     * setConfig
     *
     * @param {Object} cfg configuration object
     */
    DOMPurify.setConfig = function (cfg) {
      _parseConfig(cfg);
      SET_CONFIG = true;
    };

    /**
     * Public method to remove the configuration
     * clearConfig
     *
     */
    DOMPurify.clearConfig = function () {
      CONFIG = null;
      SET_CONFIG = false;
    };

    /**
     * Public method to check if an attribute value is valid.
     * Uses last set config, if any. Otherwise, uses config defaults.
     * isValidAttribute
     *
     * @param  {string} tag Tag name of containing element.
     * @param  {string} attr Attribute name.
     * @param  {string} value Attribute value.
     * @return {Boolean} Returns true if `value` is valid. Otherwise, returns false.
     */
    DOMPurify.isValidAttribute = function (tag, attr, value) {
      /* Initialize shared config vars if necessary. */
      if (!CONFIG) {
        _parseConfig({});
      }
      var lcTag = transformCaseFunc(tag);
      var lcName = transformCaseFunc(attr);
      return _isValidAttribute(lcTag, lcName, value);
    };

    /**
     * AddHook
     * Public method to add DOMPurify hooks
     *
     * @param {String} entryPoint entry point for the hook to add
     * @param {Function} hookFunction function to execute
     */
    DOMPurify.addHook = function (entryPoint, hookFunction) {
      if (typeof hookFunction !== 'function') {
        return;
      }
      hooks[entryPoint] = hooks[entryPoint] || [];
      arrayPush(hooks[entryPoint], hookFunction);
    };

    /**
     * RemoveHook
     * Public method to remove a DOMPurify hook at a given entryPoint
     * (pops it from the stack of hooks if more are present)
     *
     * @param {String} entryPoint entry point for the hook to remove
     * @return {Function} removed(popped) hook
     */
    DOMPurify.removeHook = function (entryPoint) {
      if (hooks[entryPoint]) {
        return arrayPop(hooks[entryPoint]);
      }
    };

    /**
     * RemoveHooks
     * Public method to remove all DOMPurify hooks at a given entryPoint
     *
     * @param  {String} entryPoint entry point for the hooks to remove
     */
    DOMPurify.removeHooks = function (entryPoint) {
      if (hooks[entryPoint]) {
        hooks[entryPoint] = [];
      }
    };

    /**
     * RemoveAllHooks
     * Public method to remove all DOMPurify hooks
     *
     */
    DOMPurify.removeAllHooks = function () {
      hooks = {};
    };
    return DOMPurify;
  }
  var purify = createDOMPurify();

  return purify;

}));
//# sourceMappingURL=purify.js.map


/***/ }),

/***/ 21334:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const last$1 = __webpack_require__(60645);
const toArray = __webpack_require__(24483);
const isArrayLike = __webpack_require__(80058);

function last(array) {
    if (!isArrayLike.isArrayLike(array)) {
        return undefined;
    }
    return last$1.last(toArray.toArray(array));
}

exports.last = last;


/***/ }),

/***/ 21465:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function toKey(value) {
    if (typeof value === 'string' || typeof value === 'symbol') {
        return value;
    }
    if (Object.is(value?.valueOf?.(), -0)) {
        return '-0';
    }
    return String(value);
}

exports.toKey = toKey;


/***/ }),

/***/ 23500:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function getPriority(a) {
    if (typeof a === 'symbol') {
        return 1;
    }
    if (a === null) {
        return 2;
    }
    if (a === undefined) {
        return 3;
    }
    if (a !== a) {
        return 4;
    }
    return 0;
}
const compareValues = (a, b, order) => {
    if (a !== b) {
        const aPriority = getPriority(a);
        const bPriority = getPriority(b);
        if (aPriority === bPriority && aPriority === 0) {
            if (a < b) {
                return order === 'desc' ? 1 : -1;
            }
            if (a > b) {
                return order === 'desc' ? -1 : 1;
            }
        }
        return order === 'desc' ? bPriority - aPriority : aPriority - bPriority;
    }
    return 0;
};

exports.compareValues = compareValues;


/***/ }),

/***/ 24483:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function toArray(value) {
    return Array.isArray(value) ? value : Array.from(value);
}

exports.toArray = toArray;


/***/ }),

/***/ 25259:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const debounce = __webpack_require__(70008);

function throttle(func, throttleMs = 0, options = {}) {
    const { leading = true, trailing = true } = options;
    return debounce.debounce(func, throttleMs, {
        leading,
        maxWait: throttleMs,
        trailing,
    });
}

exports.throttle = throttle;


/***/ }),

/***/ 29467:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const cloneDeepWith$1 = __webpack_require__(53964);
const tags = __webpack_require__(99184);

function cloneDeepWith(obj, customizer) {
    return cloneDeepWith$1.cloneDeepWith(obj, (value, key, object, stack) => {
        const cloned = customizer?.(value, key, object, stack);
        if (cloned !== undefined) {
            return cloned;
        }
        if (typeof obj !== 'object') {
            return undefined;
        }
        switch (Object.prototype.toString.call(obj)) {
            case tags.numberTag:
            case tags.stringTag:
            case tags.booleanTag: {
                const result = new obj.constructor(obj?.valueOf());
                cloneDeepWith$1.copyProperties(result, obj);
                return result;
            }
            case tags.argumentsTag: {
                const result = {};
                cloneDeepWith$1.copyProperties(result, obj);
                result.length = obj.length;
                result[Symbol.iterator] = obj[Symbol.iterator];
                return result;
            }
            default: {
                return undefined;
            }
        }
    });
}

exports.cloneDeepWith = cloneDeepWith;


/***/ }),

/***/ 33097:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const compareValues = __webpack_require__(23500);
const isKey = __webpack_require__(93998);
const toPath = __webpack_require__(3025);

function orderBy(collection, criteria, orders, guard) {
    if (collection == null) {
        return [];
    }
    orders = guard ? undefined : orders;
    if (!Array.isArray(collection)) {
        collection = Object.values(collection);
    }
    if (!Array.isArray(criteria)) {
        criteria = criteria == null ? [null] : [criteria];
    }
    if (criteria.length === 0) {
        criteria = [null];
    }
    if (!Array.isArray(orders)) {
        orders = orders == null ? [] : [orders];
    }
    orders = orders.map(order => String(order));
    const getValueByNestedPath = (object, path) => {
        let target = object;
        for (let i = 0; i < path.length && target != null; ++i) {
            target = target[path[i]];
        }
        return target;
    };
    const getValueByCriterion = (criterion, object) => {
        if (object == null || criterion == null) {
            return object;
        }
        if (typeof criterion === 'object' && 'key' in criterion) {
            if (Object.hasOwn(object, criterion.key)) {
                return object[criterion.key];
            }
            return getValueByNestedPath(object, criterion.path);
        }
        if (typeof criterion === 'function') {
            return criterion(object);
        }
        if (Array.isArray(criterion)) {
            return getValueByNestedPath(object, criterion);
        }
        if (typeof object === 'object') {
            return object[criterion];
        }
        return object;
    };
    const preparedCriteria = criteria.map((criterion) => {
        if (Array.isArray(criterion) && criterion.length === 1) {
            criterion = criterion[0];
        }
        if (criterion == null || typeof criterion === 'function' || Array.isArray(criterion) || isKey.isKey(criterion)) {
            return criterion;
        }
        return { key: criterion, path: toPath.toPath(criterion) };
    });
    const preparedCollection = collection.map(item => ({
        original: item,
        criteria: preparedCriteria.map((criterion) => getValueByCriterion(criterion, item)),
    }));
    return preparedCollection
        .slice()
        .sort((a, b) => {
        for (let i = 0; i < preparedCriteria.length; i++) {
            const comparedResult = compareValues.compareValues(a.criteria[i], b.criteria[i], orders[i]);
            if (comparedResult !== 0) {
                return comparedResult;
            }
        }
        return 0;
    })
        .map(item => item.original);
}

exports.orderBy = orderBy;


/***/ }),

/***/ 35938:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const maxBy$1 = __webpack_require__(10334);
const identity = __webpack_require__(14059);
const iteratee = __webpack_require__(5821);

function maxBy(items, iteratee$1) {
    if (items == null) {
        return undefined;
    }
    return maxBy$1.maxBy(Array.from(items), iteratee.iteratee(iteratee$1 ?? identity.identity));
}

exports.maxBy = maxBy;


/***/ }),

/***/ 38240:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function minBy(items, getValue) {
    if (items.length === 0) {
        return undefined;
    }
    let minElement = items[0];
    let min = getValue(minElement);
    for (let i = 1; i < items.length; i++) {
        const element = items[i];
        const value = getValue(element);
        if (value < min) {
            min = value;
            minElement = element;
        }
    }
    return minElement;
}

exports.minBy = minBy;


/***/ }),

/***/ 40717:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const isMatchWith = __webpack_require__(58273);

function isMatch(target, source) {
    return isMatchWith.isMatchWith(target, source, () => undefined);
}

exports.isMatch = isMatch;


/***/ }),

/***/ 43412:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(85012).range;


/***/ }),

/***/ 44167:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const cloneDeepWith = __webpack_require__(29467);
const keysIn = __webpack_require__(51621);
const unset = __webpack_require__(77841);
const getSymbolsIn = __webpack_require__(51875);
const isDeepKey = __webpack_require__(95112);
const flatten = __webpack_require__(16166);
const isPlainObject = __webpack_require__(48695);

function omit(obj, ...keysArr) {
    if (obj == null) {
        return {};
    }
    keysArr = flatten.flatten(keysArr);
    const result = cloneInOmit(obj, keysArr);
    for (let i = 0; i < keysArr.length; i++) {
        let keys = keysArr[i];
        switch (typeof keys) {
            case 'object': {
                if (!Array.isArray(keys)) {
                    keys = Array.from(keys);
                }
                for (let j = 0; j < keys.length; j++) {
                    const key = keys[j];
                    unset.unset(result, key);
                }
                break;
            }
            case 'string':
            case 'symbol':
            case 'number': {
                unset.unset(result, keys);
                break;
            }
        }
    }
    return result;
}
function cloneInOmit(obj, keys) {
    const hasDeepKey = keys.some(key => Array.isArray(key) || isDeepKey.isDeepKey(key));
    if (hasDeepKey) {
        return deepCloneInOmit(obj);
    }
    return shallowCloneInOmit(obj);
}
function shallowCloneInOmit(obj) {
    const result = {};
    const keysToCopy = [...keysIn.keysIn(obj), ...getSymbolsIn.getSymbolsIn(obj)];
    for (let i = 0; i < keysToCopy.length; i++) {
        const key = keysToCopy[i];
        result[key] = obj[key];
    }
    return result;
}
function deepCloneInOmit(obj) {
    const result = {};
    const keysToCopy = [...keysIn.keysIn(obj), ...getSymbolsIn.getSymbolsIn(obj)];
    for (let i = 0; i < keysToCopy.length; i++) {
        const key = keysToCopy[i];
        result[key] = cloneDeepWith.cloneDeepWith(obj[key], valueToClone => {
            if (isPlainObject.isPlainObject(valueToClone)) {
                return undefined;
            }
            return valueToClone;
        });
    }
    return result;
}

exports.omit = omit;


/***/ }),

/***/ 44569:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const toNumber = __webpack_require__(88919);

function toFinite(value) {
    if (!value) {
        return value === 0 ? value : 0;
    }
    value = toNumber.toNumber(value);
    if (value === Infinity || value === -Infinity) {
        const sign = value < 0 ? -1 : 1;
        return sign * Number.MAX_VALUE;
    }
    return value === value ? value : 0;
}

exports.toFinite = toFinite;


/***/ }),

/***/ 44905:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function isObject(value) {
    return value !== null && (typeof value === 'object' || typeof value === 'function');
}

exports.isObject = isObject;


/***/ }),

/***/ 45403:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function isPrototype(value) {
    const constructor = value?.constructor;
    const prototype = typeof constructor === 'function' ? constructor.prototype : Object.prototype;
    return value === prototype;
}

exports.isPrototype = isPrototype;


/***/ }),

/***/ 46248:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  b: () => (/* reexport */ createDragDropManager)
});

// UNUSED EXPORTS: HandlerRole

// EXTERNAL MODULE: ./node_modules/redux/es/redux.js
var redux = __webpack_require__(82960);
// EXTERNAL MODULE: ./node_modules/@react-dnd/invariant/dist/index.js
var dist = __webpack_require__(79396);
;// ./node_modules/dnd-core/dist/utils/js_utils.js
// cheap lodash replacements
/**
 * drop-in replacement for _.get
 * @param obj
 * @param path
 * @param defaultValue
 */ function get(obj, path, defaultValue) {
    return path.split('.').reduce((a, c)=>a && a[c] ? a[c] : defaultValue || null
    , obj);
}
/**
 * drop-in replacement for _.without
 */ function without(items, item) {
    return items.filter((i)=>i !== item
    );
}
/**
 * drop-in replacement for _.isString
 * @param input
 */ function isString(input) {
    return typeof input === 'string';
}
/**
 * drop-in replacement for _.isString
 * @param input
 */ function isObject(input) {
    return typeof input === 'object';
}
/**
 * replacement for _.xor
 * @param itemsA
 * @param itemsB
 */ function xor(itemsA, itemsB) {
    const map = new Map();
    const insertItem = (item)=>{
        map.set(item, map.has(item) ? map.get(item) + 1 : 1);
    };
    itemsA.forEach(insertItem);
    itemsB.forEach(insertItem);
    const result = [];
    map.forEach((count, key)=>{
        if (count === 1) {
            result.push(key);
        }
    });
    return result;
}
/**
 * replacement for _.intersection
 * @param itemsA
 * @param itemsB
 */ function intersection(itemsA, itemsB) {
    return itemsA.filter((t)=>itemsB.indexOf(t) > -1
    );
}

//# sourceMappingURL=js_utils.js.map
;// ./node_modules/dnd-core/dist/actions/dragDrop/types.js
const INIT_COORDS = 'dnd-core/INIT_COORDS';
const BEGIN_DRAG = 'dnd-core/BEGIN_DRAG';
const PUBLISH_DRAG_SOURCE = 'dnd-core/PUBLISH_DRAG_SOURCE';
const HOVER = 'dnd-core/HOVER';
const DROP = 'dnd-core/DROP';
const END_DRAG = 'dnd-core/END_DRAG';

//# sourceMappingURL=types.js.map
;// ./node_modules/dnd-core/dist/actions/dragDrop/local/setClientOffset.js

function setClientOffset(clientOffset, sourceClientOffset) {
    return {
        type: INIT_COORDS,
        payload: {
            sourceClientOffset: sourceClientOffset || null,
            clientOffset: clientOffset || null
        }
    };
}

//# sourceMappingURL=setClientOffset.js.map
;// ./node_modules/dnd-core/dist/actions/dragDrop/beginDrag.js




const ResetCoordinatesAction = {
    type: INIT_COORDS,
    payload: {
        clientOffset: null,
        sourceClientOffset: null
    }
};
function createBeginDrag(manager) {
    return function beginDrag(sourceIds = [], options = {
        publishSource: true
    }) {
        const { publishSource =true , clientOffset , getSourceClientOffset ,  } = options;
        const monitor = manager.getMonitor();
        const registry = manager.getRegistry();
        // Initialize the coordinates using the client offset
        manager.dispatch(setClientOffset(clientOffset));
        verifyInvariants(sourceIds, monitor, registry);
        // Get the draggable source
        const sourceId = getDraggableSource(sourceIds, monitor);
        if (sourceId == null) {
            manager.dispatch(ResetCoordinatesAction);
            return;
        }
        // Get the source client offset
        let sourceClientOffset = null;
        if (clientOffset) {
            if (!getSourceClientOffset) {
                throw new Error('getSourceClientOffset must be defined');
            }
            verifyGetSourceClientOffsetIsFunction(getSourceClientOffset);
            sourceClientOffset = getSourceClientOffset(sourceId);
        }
        // Initialize the full coordinates
        manager.dispatch(setClientOffset(clientOffset, sourceClientOffset));
        const source = registry.getSource(sourceId);
        const item = source.beginDrag(monitor, sourceId);
        // If source.beginDrag returns null, this is an indicator to cancel the drag
        if (item == null) {
            return undefined;
        }
        verifyItemIsObject(item);
        registry.pinSource(sourceId);
        const itemType = registry.getSourceType(sourceId);
        return {
            type: BEGIN_DRAG,
            payload: {
                itemType,
                item,
                sourceId,
                clientOffset: clientOffset || null,
                sourceClientOffset: sourceClientOffset || null,
                isSourcePublic: !!publishSource
            }
        };
    };
}
function verifyInvariants(sourceIds, monitor, registry) {
    (0,dist/* invariant */.V)(!monitor.isDragging(), 'Cannot call beginDrag while dragging.');
    sourceIds.forEach(function(sourceId) {
        (0,dist/* invariant */.V)(registry.getSource(sourceId), 'Expected sourceIds to be registered.');
    });
}
function verifyGetSourceClientOffsetIsFunction(getSourceClientOffset) {
    (0,dist/* invariant */.V)(typeof getSourceClientOffset === 'function', 'When clientOffset is provided, getSourceClientOffset must be a function.');
}
function verifyItemIsObject(item) {
    (0,dist/* invariant */.V)(isObject(item), 'Item must be an object.');
}
function getDraggableSource(sourceIds, monitor) {
    let sourceId = null;
    for(let i = sourceIds.length - 1; i >= 0; i--){
        if (monitor.canDragSource(sourceIds[i])) {
            sourceId = sourceIds[i];
            break;
        }
    }
    return sourceId;
}

//# sourceMappingURL=beginDrag.js.map
;// ./node_modules/dnd-core/dist/actions/dragDrop/drop.js
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty(target, key, source[key]);
        });
    }
    return target;
}



function createDrop(manager) {
    return function drop(options = {}) {
        const monitor = manager.getMonitor();
        const registry = manager.getRegistry();
        drop_verifyInvariants(monitor);
        const targetIds = getDroppableTargets(monitor);
        // Multiple actions are dispatched here, which is why this doesn't return an action
        targetIds.forEach((targetId, index)=>{
            const dropResult = determineDropResult(targetId, index, registry, monitor);
            const action = {
                type: DROP,
                payload: {
                    dropResult: _objectSpread({}, options, dropResult)
                }
            };
            manager.dispatch(action);
        });
    };
}
function drop_verifyInvariants(monitor) {
    (0,dist/* invariant */.V)(monitor.isDragging(), 'Cannot call drop while not dragging.');
    (0,dist/* invariant */.V)(!monitor.didDrop(), 'Cannot call drop twice during one drag operation.');
}
function determineDropResult(targetId, index, registry, monitor) {
    const target = registry.getTarget(targetId);
    let dropResult = target ? target.drop(monitor, targetId) : undefined;
    verifyDropResultType(dropResult);
    if (typeof dropResult === 'undefined') {
        dropResult = index === 0 ? {} : monitor.getDropResult();
    }
    return dropResult;
}
function verifyDropResultType(dropResult) {
    (0,dist/* invariant */.V)(typeof dropResult === 'undefined' || isObject(dropResult), 'Drop result must either be an object or undefined.');
}
function getDroppableTargets(monitor) {
    const targetIds = monitor.getTargetIds().filter(monitor.canDropOnTarget, monitor);
    targetIds.reverse();
    return targetIds;
}

//# sourceMappingURL=drop.js.map
;// ./node_modules/dnd-core/dist/actions/dragDrop/endDrag.js


function createEndDrag(manager) {
    return function endDrag() {
        const monitor = manager.getMonitor();
        const registry = manager.getRegistry();
        verifyIsDragging(monitor);
        const sourceId = monitor.getSourceId();
        if (sourceId != null) {
            const source = registry.getSource(sourceId, true);
            source.endDrag(monitor, sourceId);
            registry.unpinSource();
        }
        return {
            type: END_DRAG
        };
    };
}
function verifyIsDragging(monitor) {
    (0,dist/* invariant */.V)(monitor.isDragging(), 'Cannot call endDrag while not dragging.');
}

//# sourceMappingURL=endDrag.js.map
;// ./node_modules/dnd-core/dist/utils/matchesType.js
function matchesType(targetType, draggedItemType) {
    if (draggedItemType === null) {
        return targetType === null;
    }
    return Array.isArray(targetType) ? targetType.some((t)=>t === draggedItemType
    ) : targetType === draggedItemType;
}

//# sourceMappingURL=matchesType.js.map
;// ./node_modules/dnd-core/dist/actions/dragDrop/hover.js



function createHover(manager) {
    return function hover(targetIdsArg, { clientOffset  } = {}) {
        verifyTargetIdsIsArray(targetIdsArg);
        const targetIds = targetIdsArg.slice(0);
        const monitor = manager.getMonitor();
        const registry = manager.getRegistry();
        const draggedItemType = monitor.getItemType();
        removeNonMatchingTargetIds(targetIds, registry, draggedItemType);
        checkInvariants(targetIds, monitor, registry);
        hoverAllTargets(targetIds, monitor, registry);
        return {
            type: HOVER,
            payload: {
                targetIds,
                clientOffset: clientOffset || null
            }
        };
    };
}
function verifyTargetIdsIsArray(targetIdsArg) {
    (0,dist/* invariant */.V)(Array.isArray(targetIdsArg), 'Expected targetIds to be an array.');
}
function checkInvariants(targetIds, monitor, registry) {
    (0,dist/* invariant */.V)(monitor.isDragging(), 'Cannot call hover while not dragging.');
    (0,dist/* invariant */.V)(!monitor.didDrop(), 'Cannot call hover after drop.');
    for(let i = 0; i < targetIds.length; i++){
        const targetId = targetIds[i];
        (0,dist/* invariant */.V)(targetIds.lastIndexOf(targetId) === i, 'Expected targetIds to be unique in the passed array.');
        const target = registry.getTarget(targetId);
        (0,dist/* invariant */.V)(target, 'Expected targetIds to be registered.');
    }
}
function removeNonMatchingTargetIds(targetIds, registry, draggedItemType) {
    // Remove those targetIds that don't match the targetType.  This
    // fixes shallow isOver which would only be non-shallow because of
    // non-matching targets.
    for(let i = targetIds.length - 1; i >= 0; i--){
        const targetId = targetIds[i];
        const targetType = registry.getTargetType(targetId);
        if (!matchesType(targetType, draggedItemType)) {
            targetIds.splice(i, 1);
        }
    }
}
function hoverAllTargets(targetIds, monitor, registry) {
    // Finally call hover on all matching targets.
    targetIds.forEach(function(targetId) {
        const target = registry.getTarget(targetId);
        target.hover(monitor, targetId);
    });
}

//# sourceMappingURL=hover.js.map
;// ./node_modules/dnd-core/dist/actions/dragDrop/publishDragSource.js

function createPublishDragSource(manager) {
    return function publishDragSource() {
        const monitor = manager.getMonitor();
        if (monitor.isDragging()) {
            return {
                type: PUBLISH_DRAG_SOURCE
            };
        }
        return;
    };
}

//# sourceMappingURL=publishDragSource.js.map
;// ./node_modules/dnd-core/dist/actions/dragDrop/index.js






function createDragDropActions(manager) {
    return {
        beginDrag: createBeginDrag(manager),
        publishDragSource: createPublishDragSource(manager),
        hover: createHover(manager),
        drop: createDrop(manager),
        endDrag: createEndDrag(manager)
    };
}

//# sourceMappingURL=index.js.map
;// ./node_modules/dnd-core/dist/classes/DragDropManagerImpl.js

class DragDropManagerImpl {
    receiveBackend(backend) {
        this.backend = backend;
    }
    getMonitor() {
        return this.monitor;
    }
    getBackend() {
        return this.backend;
    }
    getRegistry() {
        return this.monitor.registry;
    }
    getActions() {
        /* eslint-disable-next-line @typescript-eslint/no-this-alias */ const manager = this;
        const { dispatch  } = this.store;
        function bindActionCreator(actionCreator) {
            return (...args)=>{
                const action = actionCreator.apply(manager, args);
                if (typeof action !== 'undefined') {
                    dispatch(action);
                }
            };
        }
        const actions = createDragDropActions(this);
        return Object.keys(actions).reduce((boundActions, key)=>{
            const action = actions[key];
            boundActions[key] = bindActionCreator(action);
            return boundActions;
        }, {});
    }
    dispatch(action) {
        this.store.dispatch(action);
    }
    constructor(store, monitor){
        this.isSetUp = false;
        this.handleRefCountChange = ()=>{
            const shouldSetUp = this.store.getState().refCount > 0;
            if (this.backend) {
                if (shouldSetUp && !this.isSetUp) {
                    this.backend.setup();
                    this.isSetUp = true;
                } else if (!shouldSetUp && this.isSetUp) {
                    this.backend.teardown();
                    this.isSetUp = false;
                }
            }
        };
        this.store = store;
        this.monitor = monitor;
        store.subscribe(this.handleRefCountChange);
    }
}

//# sourceMappingURL=DragDropManagerImpl.js.map
;// ./node_modules/dnd-core/dist/utils/coords.js
/**
 * Coordinate addition
 * @param a The first coordinate
 * @param b The second coordinate
 */ function add(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y
    };
}
/**
 * Coordinate subtraction
 * @param a The first coordinate
 * @param b The second coordinate
 */ function subtract(a, b) {
    return {
        x: a.x - b.x,
        y: a.y - b.y
    };
}
/**
 * Returns the cartesian distance of the drag source component's position, based on its position
 * at the time when the current drag operation has started, and the movement difference.
 *
 * Returns null if no item is being dragged.
 *
 * @param state The offset state to compute from
 */ function getSourceClientOffset(state) {
    const { clientOffset , initialClientOffset , initialSourceClientOffset  } = state;
    if (!clientOffset || !initialClientOffset || !initialSourceClientOffset) {
        return null;
    }
    return subtract(add(clientOffset, initialSourceClientOffset), initialClientOffset);
}
/**
 * Determines the x,y offset between the client offset and the initial client offset
 *
 * @param state The offset state to compute from
 */ function getDifferenceFromInitialOffset(state) {
    const { clientOffset , initialClientOffset  } = state;
    if (!clientOffset || !initialClientOffset) {
        return null;
    }
    return subtract(clientOffset, initialClientOffset);
}

//# sourceMappingURL=coords.js.map
;// ./node_modules/dnd-core/dist/utils/dirtiness.js

const NONE = [];
const ALL = [];
NONE.__IS_NONE__ = true;
ALL.__IS_ALL__ = true;
/**
 * Determines if the given handler IDs are dirty or not.
 *
 * @param dirtyIds The set of dirty handler ids
 * @param handlerIds The set of handler ids to check
 */ function areDirty(dirtyIds, handlerIds) {
    if (dirtyIds === NONE) {
        return false;
    }
    if (dirtyIds === ALL || typeof handlerIds === 'undefined') {
        return true;
    }
    const commonIds = intersection(handlerIds, dirtyIds);
    return commonIds.length > 0;
}

//# sourceMappingURL=dirtiness.js.map
;// ./node_modules/dnd-core/dist/classes/DragDropMonitorImpl.js




class DragDropMonitorImpl {
    subscribeToStateChange(listener, options = {}) {
        const { handlerIds  } = options;
        (0,dist/* invariant */.V)(typeof listener === 'function', 'listener must be a function.');
        (0,dist/* invariant */.V)(typeof handlerIds === 'undefined' || Array.isArray(handlerIds), 'handlerIds, when specified, must be an array of strings.');
        let prevStateId = this.store.getState().stateId;
        const handleChange = ()=>{
            const state = this.store.getState();
            const currentStateId = state.stateId;
            try {
                const canSkipListener = currentStateId === prevStateId || currentStateId === prevStateId + 1 && !areDirty(state.dirtyHandlerIds, handlerIds);
                if (!canSkipListener) {
                    listener();
                }
            } finally{
                prevStateId = currentStateId;
            }
        };
        return this.store.subscribe(handleChange);
    }
    subscribeToOffsetChange(listener) {
        (0,dist/* invariant */.V)(typeof listener === 'function', 'listener must be a function.');
        let previousState = this.store.getState().dragOffset;
        const handleChange = ()=>{
            const nextState = this.store.getState().dragOffset;
            if (nextState === previousState) {
                return;
            }
            previousState = nextState;
            listener();
        };
        return this.store.subscribe(handleChange);
    }
    canDragSource(sourceId) {
        if (!sourceId) {
            return false;
        }
        const source = this.registry.getSource(sourceId);
        (0,dist/* invariant */.V)(source, `Expected to find a valid source. sourceId=${sourceId}`);
        if (this.isDragging()) {
            return false;
        }
        return source.canDrag(this, sourceId);
    }
    canDropOnTarget(targetId) {
        // undefined on initial render
        if (!targetId) {
            return false;
        }
        const target = this.registry.getTarget(targetId);
        (0,dist/* invariant */.V)(target, `Expected to find a valid target. targetId=${targetId}`);
        if (!this.isDragging() || this.didDrop()) {
            return false;
        }
        const targetType = this.registry.getTargetType(targetId);
        const draggedItemType = this.getItemType();
        return matchesType(targetType, draggedItemType) && target.canDrop(this, targetId);
    }
    isDragging() {
        return Boolean(this.getItemType());
    }
    isDraggingSource(sourceId) {
        // undefined on initial render
        if (!sourceId) {
            return false;
        }
        const source = this.registry.getSource(sourceId, true);
        (0,dist/* invariant */.V)(source, `Expected to find a valid source. sourceId=${sourceId}`);
        if (!this.isDragging() || !this.isSourcePublic()) {
            return false;
        }
        const sourceType = this.registry.getSourceType(sourceId);
        const draggedItemType = this.getItemType();
        if (sourceType !== draggedItemType) {
            return false;
        }
        return source.isDragging(this, sourceId);
    }
    isOverTarget(targetId, options = {
        shallow: false
    }) {
        // undefined on initial render
        if (!targetId) {
            return false;
        }
        const { shallow  } = options;
        if (!this.isDragging()) {
            return false;
        }
        const targetType = this.registry.getTargetType(targetId);
        const draggedItemType = this.getItemType();
        if (draggedItemType && !matchesType(targetType, draggedItemType)) {
            return false;
        }
        const targetIds = this.getTargetIds();
        if (!targetIds.length) {
            return false;
        }
        const index = targetIds.indexOf(targetId);
        if (shallow) {
            return index === targetIds.length - 1;
        } else {
            return index > -1;
        }
    }
    getItemType() {
        return this.store.getState().dragOperation.itemType;
    }
    getItem() {
        return this.store.getState().dragOperation.item;
    }
    getSourceId() {
        return this.store.getState().dragOperation.sourceId;
    }
    getTargetIds() {
        return this.store.getState().dragOperation.targetIds;
    }
    getDropResult() {
        return this.store.getState().dragOperation.dropResult;
    }
    didDrop() {
        return this.store.getState().dragOperation.didDrop;
    }
    isSourcePublic() {
        return Boolean(this.store.getState().dragOperation.isSourcePublic);
    }
    getInitialClientOffset() {
        return this.store.getState().dragOffset.initialClientOffset;
    }
    getInitialSourceClientOffset() {
        return this.store.getState().dragOffset.initialSourceClientOffset;
    }
    getClientOffset() {
        return this.store.getState().dragOffset.clientOffset;
    }
    getSourceClientOffset() {
        return getSourceClientOffset(this.store.getState().dragOffset);
    }
    getDifferenceFromInitialOffset() {
        return getDifferenceFromInitialOffset(this.store.getState().dragOffset);
    }
    constructor(store, registry){
        this.store = store;
        this.registry = registry;
    }
}

//# sourceMappingURL=DragDropMonitorImpl.js.map
// EXTERNAL MODULE: ./node_modules/@react-dnd/asap/dist/index.js + 6 modules
var asap_dist = __webpack_require__(72706);
;// ./node_modules/dnd-core/dist/actions/registry.js
const ADD_SOURCE = 'dnd-core/ADD_SOURCE';
const ADD_TARGET = 'dnd-core/ADD_TARGET';
const REMOVE_SOURCE = 'dnd-core/REMOVE_SOURCE';
const REMOVE_TARGET = 'dnd-core/REMOVE_TARGET';
function addSource(sourceId) {
    return {
        type: ADD_SOURCE,
        payload: {
            sourceId
        }
    };
}
function addTarget(targetId) {
    return {
        type: ADD_TARGET,
        payload: {
            targetId
        }
    };
}
function removeSource(sourceId) {
    return {
        type: REMOVE_SOURCE,
        payload: {
            sourceId
        }
    };
}
function removeTarget(targetId) {
    return {
        type: REMOVE_TARGET,
        payload: {
            targetId
        }
    };
}

//# sourceMappingURL=registry.js.map
;// ./node_modules/dnd-core/dist/contracts.js

function validateSourceContract(source) {
    (0,dist/* invariant */.V)(typeof source.canDrag === 'function', 'Expected canDrag to be a function.');
    (0,dist/* invariant */.V)(typeof source.beginDrag === 'function', 'Expected beginDrag to be a function.');
    (0,dist/* invariant */.V)(typeof source.endDrag === 'function', 'Expected endDrag to be a function.');
}
function validateTargetContract(target) {
    (0,dist/* invariant */.V)(typeof target.canDrop === 'function', 'Expected canDrop to be a function.');
    (0,dist/* invariant */.V)(typeof target.hover === 'function', 'Expected hover to be a function.');
    (0,dist/* invariant */.V)(typeof target.drop === 'function', 'Expected beginDrag to be a function.');
}
function validateType(type, allowArray) {
    if (allowArray && Array.isArray(type)) {
        type.forEach((t)=>validateType(t, false)
        );
        return;
    }
    (0,dist/* invariant */.V)(typeof type === 'string' || typeof type === 'symbol', allowArray ? 'Type can only be a string, a symbol, or an array of either.' : 'Type can only be a string or a symbol.');
}

//# sourceMappingURL=contracts.js.map
;// ./node_modules/dnd-core/dist/interfaces.js
var HandlerRole;
(function(HandlerRole) {
    HandlerRole["SOURCE"] = "SOURCE";
    HandlerRole["TARGET"] = "TARGET";
})(HandlerRole || (HandlerRole = {}));

//# sourceMappingURL=interfaces.js.map
;// ./node_modules/dnd-core/dist/utils/getNextUniqueId.js
let nextUniqueId = 0;
function getNextUniqueId() {
    return nextUniqueId++;
}

//# sourceMappingURL=getNextUniqueId.js.map
;// ./node_modules/dnd-core/dist/classes/HandlerRegistryImpl.js






function getNextHandlerId(role) {
    const id = getNextUniqueId().toString();
    switch(role){
        case HandlerRole.SOURCE:
            return `S${id}`;
        case HandlerRole.TARGET:
            return `T${id}`;
        default:
            throw new Error(`Unknown Handler Role: ${role}`);
    }
}
function parseRoleFromHandlerId(handlerId) {
    switch(handlerId[0]){
        case 'S':
            return HandlerRole.SOURCE;
        case 'T':
            return HandlerRole.TARGET;
        default:
            throw new Error(`Cannot parse handler ID: ${handlerId}`);
    }
}
function mapContainsValue(map, searchValue) {
    const entries = map.entries();
    let isDone = false;
    do {
        const { done , value: [, value] ,  } = entries.next();
        if (value === searchValue) {
            return true;
        }
        isDone = !!done;
    }while (!isDone)
    return false;
}
class HandlerRegistryImpl {
    addSource(type, source) {
        validateType(type);
        validateSourceContract(source);
        const sourceId = this.addHandler(HandlerRole.SOURCE, type, source);
        this.store.dispatch(addSource(sourceId));
        return sourceId;
    }
    addTarget(type, target) {
        validateType(type, true);
        validateTargetContract(target);
        const targetId = this.addHandler(HandlerRole.TARGET, type, target);
        this.store.dispatch(addTarget(targetId));
        return targetId;
    }
    containsHandler(handler) {
        return mapContainsValue(this.dragSources, handler) || mapContainsValue(this.dropTargets, handler);
    }
    getSource(sourceId, includePinned = false) {
        (0,dist/* invariant */.V)(this.isSourceId(sourceId), 'Expected a valid source ID.');
        const isPinned = includePinned && sourceId === this.pinnedSourceId;
        const source = isPinned ? this.pinnedSource : this.dragSources.get(sourceId);
        return source;
    }
    getTarget(targetId) {
        (0,dist/* invariant */.V)(this.isTargetId(targetId), 'Expected a valid target ID.');
        return this.dropTargets.get(targetId);
    }
    getSourceType(sourceId) {
        (0,dist/* invariant */.V)(this.isSourceId(sourceId), 'Expected a valid source ID.');
        return this.types.get(sourceId);
    }
    getTargetType(targetId) {
        (0,dist/* invariant */.V)(this.isTargetId(targetId), 'Expected a valid target ID.');
        return this.types.get(targetId);
    }
    isSourceId(handlerId) {
        const role = parseRoleFromHandlerId(handlerId);
        return role === HandlerRole.SOURCE;
    }
    isTargetId(handlerId) {
        const role = parseRoleFromHandlerId(handlerId);
        return role === HandlerRole.TARGET;
    }
    removeSource(sourceId) {
        (0,dist/* invariant */.V)(this.getSource(sourceId), 'Expected an existing source.');
        this.store.dispatch(removeSource(sourceId));
        (0,asap_dist/* asap */.Id)(()=>{
            this.dragSources.delete(sourceId);
            this.types.delete(sourceId);
        });
    }
    removeTarget(targetId) {
        (0,dist/* invariant */.V)(this.getTarget(targetId), 'Expected an existing target.');
        this.store.dispatch(removeTarget(targetId));
        this.dropTargets.delete(targetId);
        this.types.delete(targetId);
    }
    pinSource(sourceId) {
        const source = this.getSource(sourceId);
        (0,dist/* invariant */.V)(source, 'Expected an existing source.');
        this.pinnedSourceId = sourceId;
        this.pinnedSource = source;
    }
    unpinSource() {
        (0,dist/* invariant */.V)(this.pinnedSource, 'No source is pinned at the time.');
        this.pinnedSourceId = null;
        this.pinnedSource = null;
    }
    addHandler(role, type, handler) {
        const id = getNextHandlerId(role);
        this.types.set(id, type);
        if (role === HandlerRole.SOURCE) {
            this.dragSources.set(id, handler);
        } else if (role === HandlerRole.TARGET) {
            this.dropTargets.set(id, handler);
        }
        return id;
    }
    constructor(store){
        this.types = new Map();
        this.dragSources = new Map();
        this.dropTargets = new Map();
        this.pinnedSourceId = null;
        this.pinnedSource = null;
        this.store = store;
    }
}

//# sourceMappingURL=HandlerRegistryImpl.js.map
;// ./node_modules/dnd-core/dist/utils/equality.js
const strictEquality = (a, b)=>a === b
;
/**
 * Determine if two cartesian coordinate offsets are equal
 * @param offsetA
 * @param offsetB
 */ function areCoordsEqual(offsetA, offsetB) {
    if (!offsetA && !offsetB) {
        return true;
    } else if (!offsetA || !offsetB) {
        return false;
    } else {
        return offsetA.x === offsetB.x && offsetA.y === offsetB.y;
    }
}
/**
 * Determines if two arrays of items are equal
 * @param a The first array of items
 * @param b The second array of items
 */ function areArraysEqual(a, b, isEqual = strictEquality) {
    if (a.length !== b.length) {
        return false;
    }
    for(let i = 0; i < a.length; ++i){
        if (!isEqual(a[i], b[i])) {
            return false;
        }
    }
    return true;
}

//# sourceMappingURL=equality.js.map
;// ./node_modules/dnd-core/dist/reducers/dirtyHandlerIds.js





function reduce(// eslint-disable-next-line @typescript-eslint/no-unused-vars
_state = NONE, action) {
    switch(action.type){
        case HOVER:
            break;
        case ADD_SOURCE:
        case ADD_TARGET:
        case REMOVE_TARGET:
        case REMOVE_SOURCE:
            return NONE;
        case BEGIN_DRAG:
        case PUBLISH_DRAG_SOURCE:
        case END_DRAG:
        case DROP:
        default:
            return ALL;
    }
    const { targetIds =[] , prevTargetIds =[]  } = action.payload;
    const result = xor(targetIds, prevTargetIds);
    const didChange = result.length > 0 || !areArraysEqual(targetIds, prevTargetIds);
    if (!didChange) {
        return NONE;
    }
    // Check the target ids at the innermost position. If they are valid, add them
    // to the result
    const prevInnermostTargetId = prevTargetIds[prevTargetIds.length - 1];
    const innermostTargetId = targetIds[targetIds.length - 1];
    if (prevInnermostTargetId !== innermostTargetId) {
        if (prevInnermostTargetId) {
            result.push(prevInnermostTargetId);
        }
        if (innermostTargetId) {
            result.push(innermostTargetId);
        }
    }
    return result;
}

//# sourceMappingURL=dirtyHandlerIds.js.map
;// ./node_modules/dnd-core/dist/reducers/dragOffset.js
function dragOffset_defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function dragOffset_objectSpread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            dragOffset_defineProperty(target, key, source[key]);
        });
    }
    return target;
}


const initialState = {
    initialSourceClientOffset: null,
    initialClientOffset: null,
    clientOffset: null
};
function dragOffset_reduce(state = initialState, action) {
    const { payload  } = action;
    switch(action.type){
        case INIT_COORDS:
        case BEGIN_DRAG:
            return {
                initialSourceClientOffset: payload.sourceClientOffset,
                initialClientOffset: payload.clientOffset,
                clientOffset: payload.clientOffset
            };
        case HOVER:
            if (areCoordsEqual(state.clientOffset, payload.clientOffset)) {
                return state;
            }
            return dragOffset_objectSpread({}, state, {
                clientOffset: payload.clientOffset
            });
        case END_DRAG:
        case DROP:
            return initialState;
        default:
            return state;
    }
}

//# sourceMappingURL=dragOffset.js.map
;// ./node_modules/dnd-core/dist/reducers/dragOperation.js
function dragOperation_defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function dragOperation_objectSpread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            dragOperation_defineProperty(target, key, source[key]);
        });
    }
    return target;
}



const dragOperation_initialState = {
    itemType: null,
    item: null,
    sourceId: null,
    targetIds: [],
    dropResult: null,
    didDrop: false,
    isSourcePublic: null
};
function dragOperation_reduce(state = dragOperation_initialState, action) {
    const { payload  } = action;
    switch(action.type){
        case BEGIN_DRAG:
            return dragOperation_objectSpread({}, state, {
                itemType: payload.itemType,
                item: payload.item,
                sourceId: payload.sourceId,
                isSourcePublic: payload.isSourcePublic,
                dropResult: null,
                didDrop: false
            });
        case PUBLISH_DRAG_SOURCE:
            return dragOperation_objectSpread({}, state, {
                isSourcePublic: true
            });
        case HOVER:
            return dragOperation_objectSpread({}, state, {
                targetIds: payload.targetIds
            });
        case REMOVE_TARGET:
            if (state.targetIds.indexOf(payload.targetId) === -1) {
                return state;
            }
            return dragOperation_objectSpread({}, state, {
                targetIds: without(state.targetIds, payload.targetId)
            });
        case DROP:
            return dragOperation_objectSpread({}, state, {
                dropResult: payload.dropResult,
                didDrop: true,
                targetIds: []
            });
        case END_DRAG:
            return dragOperation_objectSpread({}, state, {
                itemType: null,
                item: null,
                sourceId: null,
                dropResult: null,
                didDrop: false,
                isSourcePublic: null,
                targetIds: []
            });
        default:
            return state;
    }
}

//# sourceMappingURL=dragOperation.js.map
;// ./node_modules/dnd-core/dist/reducers/refCount.js

function refCount_reduce(state = 0, action) {
    switch(action.type){
        case ADD_SOURCE:
        case ADD_TARGET:
            return state + 1;
        case REMOVE_SOURCE:
        case REMOVE_TARGET:
            return state - 1;
        default:
            return state;
    }
}

//# sourceMappingURL=refCount.js.map
;// ./node_modules/dnd-core/dist/reducers/stateId.js
function stateId_reduce(state = 0) {
    return state + 1;
}

//# sourceMappingURL=stateId.js.map
;// ./node_modules/dnd-core/dist/reducers/index.js
function reducers_defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function reducers_objectSpread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            reducers_defineProperty(target, key, source[key]);
        });
    }
    return target;
}






function reducers_reduce(state = {}, action) {
    return {
        dirtyHandlerIds: reduce(state.dirtyHandlerIds, {
            type: action.type,
            payload: reducers_objectSpread({}, action.payload, {
                prevTargetIds: get(state, 'dragOperation.targetIds', [])
            })
        }),
        dragOffset: dragOffset_reduce(state.dragOffset, action),
        refCount: refCount_reduce(state.refCount, action),
        dragOperation: dragOperation_reduce(state.dragOperation, action),
        stateId: stateId_reduce(state.stateId)
    };
}

//# sourceMappingURL=index.js.map
;// ./node_modules/dnd-core/dist/createDragDropManager.js





function createDragDropManager(backendFactory, globalContext = undefined, backendOptions = {}, debugMode = false) {
    const store = makeStoreInstance(debugMode);
    const monitor = new DragDropMonitorImpl(store, new HandlerRegistryImpl(store));
    const manager = new DragDropManagerImpl(store, monitor);
    const backend = backendFactory(manager, globalContext, backendOptions);
    manager.receiveBackend(backend);
    return manager;
}
function makeStoreInstance(debugMode) {
    // TODO: if we ever make a react-native version of this,
    // we'll need to consider how to pull off dev-tooling
    const reduxDevTools = typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__;
    return (0,redux/* createStore */.y$)(reducers_reduce, debugMode && reduxDevTools && reduxDevTools({
        name: 'dnd-core',
        instanceId: 'dnd-core'
    }));
}

//# sourceMappingURL=createDragDropManager.js.map
;// ./node_modules/dnd-core/dist/index.js



//# sourceMappingURL=index.js.map

/***/ }),

/***/ 47422:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const toFinite = __webpack_require__(44569);

function toInteger(value) {
    const finite = toFinite.toFinite(value);
    const remainder = finite % 1;
    return remainder ? finite - remainder : finite;
}

exports.toInteger = toInteger;


/***/ }),

/***/ 48695:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function isPlainObject(object) {
    if (typeof object !== 'object') {
        return false;
    }
    if (object == null) {
        return false;
    }
    if (Object.getPrototypeOf(object) === null) {
        return true;
    }
    if (Object.prototype.toString.call(object) !== '[object Object]') {
        const tag = object[Symbol.toStringTag];
        if (tag == null) {
            return false;
        }
        const isTagReadonly = !Object.getOwnPropertyDescriptor(object, Symbol.toStringTag)?.writable;
        if (isTagReadonly) {
            return false;
        }
        return object.toString() === `[object ${tag}]`;
    }
    let proto = object;
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(object) === proto;
}

exports.isPlainObject = isPlainObject;


/***/ }),

/***/ 51621:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const isBuffer = __webpack_require__(90623);
const isPrototype = __webpack_require__(45403);
const isArrayLike = __webpack_require__(80058);
const isTypedArray = __webpack_require__(10555);
const times = __webpack_require__(68485);

function keysIn(object) {
    if (object == null) {
        return [];
    }
    switch (typeof object) {
        case 'object':
        case 'function': {
            if (isArrayLike.isArrayLike(object)) {
                return arrayLikeKeysIn(object);
            }
            if (isPrototype.isPrototype(object)) {
                return prototypeKeysIn(object);
            }
            return keysInImpl(object);
        }
        default: {
            return keysInImpl(Object(object));
        }
    }
}
function keysInImpl(object) {
    const result = [];
    for (const key in object) {
        result.push(key);
    }
    return result;
}
function prototypeKeysIn(object) {
    const keys = keysInImpl(object);
    return keys.filter(key => key !== 'constructor');
}
function arrayLikeKeysIn(object) {
    const indices = times.times(object.length, index => `${index}`);
    const filteredKeys = new Set(indices);
    if (isBuffer.isBuffer(object)) {
        filteredKeys.add('offset');
        filteredKeys.add('parent');
    }
    if (isTypedArray.isTypedArray(object)) {
        filteredKeys.add('buffer');
        filteredKeys.add('byteLength');
        filteredKeys.add('byteOffset');
    }
    return [...indices, ...keysInImpl(object).filter(key => !filteredKeys.has(key))];
}

exports.keysIn = keysIn;


/***/ }),

/***/ 51875:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const getSymbols = __webpack_require__(86012);

function getSymbolsIn(object) {
    const result = [];
    while (object) {
        result.push(...getSymbols.getSymbols(object));
        object = Object.getPrototypeOf(object);
    }
    return result;
}

exports.getSymbolsIn = getSymbolsIn;


/***/ }),

/***/ 52067:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(93667).sumBy;


/***/ }),

/***/ 52520:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function isPrimitive(value) {
    return value == null || (typeof value !== 'object' && typeof value !== 'function');
}

exports.isPrimitive = isPrimitive;


/***/ }),

/***/ 52810:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const uniqBy$1 = __webpack_require__(8805);
const identity = __webpack_require__(14059);
const isArrayLikeObject = __webpack_require__(78161);
const iteratee = __webpack_require__(5821);

function uniqBy(array, iteratee$1 = identity.identity) {
    if (!isArrayLikeObject.isArrayLikeObject(array)) {
        return [];
    }
    return uniqBy$1.uniqBy(Array.from(array), iteratee.iteratee(iteratee$1));
}

exports.uniqBy = uniqBy;


/***/ }),

/***/ 53036:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const isMatch = __webpack_require__(40717);
const toKey = __webpack_require__(21465);
const cloneDeep = __webpack_require__(73923);
const get = __webpack_require__(54200);
const has = __webpack_require__(17324);

function matchesProperty(property, source) {
    switch (typeof property) {
        case 'object': {
            if (Object.is(property?.valueOf(), -0)) {
                property = '-0';
            }
            break;
        }
        case 'number': {
            property = toKey.toKey(property);
            break;
        }
    }
    source = cloneDeep.cloneDeep(source);
    return function (target) {
        const result = get.get(target, property);
        if (result === undefined) {
            return has.has(target, property);
        }
        if (source === undefined) {
            return result === undefined;
        }
        return isMatch.isMatch(result, source);
    };
}

exports.matchesProperty = matchesProperty;


/***/ }),

/***/ 53964:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var Buffer = __webpack_require__(42562)["Buffer"];


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const getSymbols = __webpack_require__(86012);
const getTag = __webpack_require__(12049);
const tags = __webpack_require__(99184);
const isPrimitive = __webpack_require__(52520);
const isTypedArray = __webpack_require__(83908);

function cloneDeepWith(obj, cloneValue) {
    return cloneDeepWithImpl(obj, undefined, obj, new Map(), cloneValue);
}
function cloneDeepWithImpl(valueToClone, keyToClone, objectToClone, stack = new Map(), cloneValue = undefined) {
    const cloned = cloneValue?.(valueToClone, keyToClone, objectToClone, stack);
    if (cloned !== undefined) {
        return cloned;
    }
    if (isPrimitive.isPrimitive(valueToClone)) {
        return valueToClone;
    }
    if (stack.has(valueToClone)) {
        return stack.get(valueToClone);
    }
    if (Array.isArray(valueToClone)) {
        const result = new Array(valueToClone.length);
        stack.set(valueToClone, result);
        for (let i = 0; i < valueToClone.length; i++) {
            result[i] = cloneDeepWithImpl(valueToClone[i], i, objectToClone, stack, cloneValue);
        }
        if (Object.hasOwn(valueToClone, 'index')) {
            result.index = valueToClone.index;
        }
        if (Object.hasOwn(valueToClone, 'input')) {
            result.input = valueToClone.input;
        }
        return result;
    }
    if (valueToClone instanceof Date) {
        return new Date(valueToClone.getTime());
    }
    if (valueToClone instanceof RegExp) {
        const result = new RegExp(valueToClone.source, valueToClone.flags);
        result.lastIndex = valueToClone.lastIndex;
        return result;
    }
    if (valueToClone instanceof Map) {
        const result = new Map();
        stack.set(valueToClone, result);
        for (const [key, value] of valueToClone) {
            result.set(key, cloneDeepWithImpl(value, key, objectToClone, stack, cloneValue));
        }
        return result;
    }
    if (valueToClone instanceof Set) {
        const result = new Set();
        stack.set(valueToClone, result);
        for (const value of valueToClone) {
            result.add(cloneDeepWithImpl(value, undefined, objectToClone, stack, cloneValue));
        }
        return result;
    }
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(valueToClone)) {
        return valueToClone.subarray();
    }
    if (isTypedArray.isTypedArray(valueToClone)) {
        const result = new (Object.getPrototypeOf(valueToClone).constructor)(valueToClone.length);
        stack.set(valueToClone, result);
        for (let i = 0; i < valueToClone.length; i++) {
            result[i] = cloneDeepWithImpl(valueToClone[i], i, objectToClone, stack, cloneValue);
        }
        return result;
    }
    if (valueToClone instanceof ArrayBuffer ||
        (typeof SharedArrayBuffer !== 'undefined' && valueToClone instanceof SharedArrayBuffer)) {
        return valueToClone.slice(0);
    }
    if (valueToClone instanceof DataView) {
        const result = new DataView(valueToClone.buffer.slice(0), valueToClone.byteOffset, valueToClone.byteLength);
        stack.set(valueToClone, result);
        copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
        return result;
    }
    if (typeof File !== 'undefined' && valueToClone instanceof File) {
        const result = new File([valueToClone], valueToClone.name, {
            type: valueToClone.type,
        });
        stack.set(valueToClone, result);
        copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
        return result;
    }
    if (typeof Blob !== 'undefined' && valueToClone instanceof Blob) {
        const result = new Blob([valueToClone], { type: valueToClone.type });
        stack.set(valueToClone, result);
        copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
        return result;
    }
    if (valueToClone instanceof Error) {
        const result = new valueToClone.constructor();
        stack.set(valueToClone, result);
        result.message = valueToClone.message;
        result.name = valueToClone.name;
        result.stack = valueToClone.stack;
        result.cause = valueToClone.cause;
        copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
        return result;
    }
    if (valueToClone instanceof Boolean) {
        const result = new Boolean(valueToClone.valueOf());
        stack.set(valueToClone, result);
        copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
        return result;
    }
    if (valueToClone instanceof Number) {
        const result = new Number(valueToClone.valueOf());
        stack.set(valueToClone, result);
        copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
        return result;
    }
    if (valueToClone instanceof String) {
        const result = new String(valueToClone.valueOf());
        stack.set(valueToClone, result);
        copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
        return result;
    }
    if (typeof valueToClone === 'object' && isCloneableObject(valueToClone)) {
        const result = Object.create(Object.getPrototypeOf(valueToClone));
        stack.set(valueToClone, result);
        copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
        return result;
    }
    return valueToClone;
}
function copyProperties(target, source, objectToClone = target, stack, cloneValue) {
    const keys = [...Object.keys(source), ...getSymbols.getSymbols(source)];
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const descriptor = Object.getOwnPropertyDescriptor(target, key);
        if (descriptor == null || descriptor.writable) {
            target[key] = cloneDeepWithImpl(source[key], key, objectToClone, stack, cloneValue);
        }
    }
}
function isCloneableObject(object) {
    switch (getTag.getTag(object)) {
        case tags.argumentsTag:
        case tags.arrayTag:
        case tags.arrayBufferTag:
        case tags.dataViewTag:
        case tags.booleanTag:
        case tags.dateTag:
        case tags.float32ArrayTag:
        case tags.float64ArrayTag:
        case tags.int8ArrayTag:
        case tags.int16ArrayTag:
        case tags.int32ArrayTag:
        case tags.mapTag:
        case tags.numberTag:
        case tags.objectTag:
        case tags.regexpTag:
        case tags.setTag:
        case tags.stringTag:
        case tags.symbolTag:
        case tags.uint8ArrayTag:
        case tags.uint8ClampedArrayTag:
        case tags.uint16ArrayTag:
        case tags.uint32ArrayTag: {
            return true;
        }
        default: {
            return false;
        }
    }
}

exports.cloneDeepWith = cloneDeepWith;
exports.cloneDeepWithImpl = cloneDeepWithImpl;
exports.copyProperties = copyProperties;


/***/ }),

/***/ 54200:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const isUnsafeProperty = __webpack_require__(8193);
const isDeepKey = __webpack_require__(95112);
const toKey = __webpack_require__(21465);
const toPath = __webpack_require__(3025);

function get(object, path, defaultValue) {
    if (object == null) {
        return defaultValue;
    }
    switch (typeof path) {
        case 'string': {
            if (isUnsafeProperty.isUnsafeProperty(path)) {
                return defaultValue;
            }
            const result = object[path];
            if (result === undefined) {
                if (isDeepKey.isDeepKey(path)) {
                    return get(object, toPath.toPath(path), defaultValue);
                }
                else {
                    return defaultValue;
                }
            }
            return result;
        }
        case 'number':
        case 'symbol': {
            if (typeof path === 'number') {
                path = toKey.toKey(path);
            }
            const result = object[path];
            if (result === undefined) {
                return defaultValue;
            }
            return result;
        }
        default: {
            if (Array.isArray(path)) {
                return getWithPath(object, path, defaultValue);
            }
            if (Object.is(path?.valueOf(), -0)) {
                path = '-0';
            }
            else {
                path = String(path);
            }
            if (isUnsafeProperty.isUnsafeProperty(path)) {
                return defaultValue;
            }
            const result = object[path];
            if (result === undefined) {
                return defaultValue;
            }
            return result;
        }
    }
}
function getWithPath(object, path, defaultValue) {
    if (path.length === 0) {
        return defaultValue;
    }
    let current = object;
    for (let index = 0; index < path.length; index++) {
        if (current == null) {
            return defaultValue;
        }
        if (isUnsafeProperty.isUnsafeProperty(path[index])) {
            return defaultValue;
        }
        current = current[path[index]];
    }
    if (current === undefined) {
        return defaultValue;
    }
    return current;
}

exports.get = get;


/***/ }),

/***/ 54259:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const orderBy = __webpack_require__(33097);
const flatten = __webpack_require__(75711);
const isIterateeCall = __webpack_require__(316);

function sortBy(collection, ...criteria) {
    const length = criteria.length;
    if (length > 1 && isIterateeCall.isIterateeCall(collection, criteria[0], criteria[1])) {
        criteria = [];
    }
    else if (length > 2 && isIterateeCall.isIterateeCall(criteria[0], criteria[1], criteria[2])) {
        criteria = [criteria[0]];
    }
    return orderBy.orderBy(collection, flatten.flatten(criteria), ['asc']);
}

exports.sortBy = sortBy;


/***/ }),

/***/ 58273:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const isObject = __webpack_require__(44905);
const isPrimitive = __webpack_require__(52520);
const eq = __webpack_require__(86761);

function isMatchWith(target, source, compare) {
    if (typeof compare !== 'function') {
        return isMatchWith(target, source, () => undefined);
    }
    return isMatchWithInternal(target, source, function doesMatch(objValue, srcValue, key, object, source, stack) {
        const isEqual = compare(objValue, srcValue, key, object, source, stack);
        if (isEqual !== undefined) {
            return Boolean(isEqual);
        }
        return isMatchWithInternal(objValue, srcValue, doesMatch, stack);
    }, new Map());
}
function isMatchWithInternal(target, source, compare, stack) {
    if (source === target) {
        return true;
    }
    switch (typeof source) {
        case 'object': {
            return isObjectMatch(target, source, compare, stack);
        }
        case 'function': {
            const sourceKeys = Object.keys(source);
            if (sourceKeys.length > 0) {
                return isMatchWithInternal(target, { ...source }, compare, stack);
            }
            return eq.eq(target, source);
        }
        default: {
            if (!isObject.isObject(target)) {
                return eq.eq(target, source);
            }
            if (typeof source === 'string') {
                return source === '';
            }
            return true;
        }
    }
}
function isObjectMatch(target, source, compare, stack) {
    if (source == null) {
        return true;
    }
    if (Array.isArray(source)) {
        return isArrayMatch(target, source, compare, stack);
    }
    if (source instanceof Map) {
        return isMapMatch(target, source, compare, stack);
    }
    if (source instanceof Set) {
        return isSetMatch(target, source, compare, stack);
    }
    const keys = Object.keys(source);
    if (target == null) {
        return keys.length === 0;
    }
    if (keys.length === 0) {
        return true;
    }
    if (stack?.has(source)) {
        return stack.get(source) === target;
    }
    stack?.set(source, target);
    try {
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (!isPrimitive.isPrimitive(target) && !(key in target)) {
                return false;
            }
            if (source[key] === undefined && target[key] !== undefined) {
                return false;
            }
            if (source[key] === null && target[key] !== null) {
                return false;
            }
            const isEqual = compare(target[key], source[key], key, target, source, stack);
            if (!isEqual) {
                return false;
            }
        }
        return true;
    }
    finally {
        stack?.delete(source);
    }
}
function isMapMatch(target, source, compare, stack) {
    if (source.size === 0) {
        return true;
    }
    if (!(target instanceof Map)) {
        return false;
    }
    for (const [key, sourceValue] of source.entries()) {
        const targetValue = target.get(key);
        const isEqual = compare(targetValue, sourceValue, key, target, source, stack);
        if (isEqual === false) {
            return false;
        }
    }
    return true;
}
function isArrayMatch(target, source, compare, stack) {
    if (source.length === 0) {
        return true;
    }
    if (!Array.isArray(target)) {
        return false;
    }
    const countedIndex = new Set();
    for (let i = 0; i < source.length; i++) {
        const sourceItem = source[i];
        let found = false;
        for (let j = 0; j < target.length; j++) {
            if (countedIndex.has(j)) {
                continue;
            }
            const targetItem = target[j];
            let matches = false;
            const isEqual = compare(targetItem, sourceItem, i, target, source, stack);
            if (isEqual) {
                matches = true;
            }
            if (matches) {
                countedIndex.add(j);
                found = true;
                break;
            }
        }
        if (!found) {
            return false;
        }
    }
    return true;
}
function isSetMatch(target, source, compare, stack) {
    if (source.size === 0) {
        return true;
    }
    if (!(target instanceof Set)) {
        return false;
    }
    return isArrayMatch([...target], [...source], compare, stack);
}

exports.isMatchWith = isMatchWith;
exports.isSetMatch = isSetMatch;


/***/ }),

/***/ 59181:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function isLength(value) {
    return Number.isSafeInteger(value) && value >= 0;
}

exports.isLength = isLength;


/***/ }),

/***/ 60184:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(54259).sortBy;


/***/ }),

/***/ 60645:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function last(arr) {
    return arr[arr.length - 1];
}

exports.last = last;


/***/ }),

/***/ 61366:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function isSymbol(value) {
    return typeof value === 'symbol' || value instanceof Symbol;
}

exports.isSymbol = isSymbol;


/***/ }),

/***/ 68485:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const toInteger = __webpack_require__(47422);

function times(n, getValue) {
    n = toInteger.toInteger(n);
    if (n < 1 || !Number.isSafeInteger(n)) {
        return [];
    }
    const result = new Array(n);
    for (let i = 0; i < n; i++) {
        result[i] = typeof getValue === 'function' ? getValue(i) : i;
    }
    return result;
}

exports.times = times;


/***/ }),

/***/ 68866:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  n9f: () => (/* reexport */ isNotNil),
  lQ1: () => (/* reexport */ noop_noop)
});

// UNUSED EXPORTS: AbortError, Mutex, Semaphore, TimeoutError, after, ary, assert, asyncNoop, at, attempt, attemptAsync, before, camelCase, capitalize, chunk, clamp, clone, cloneDeep, cloneDeepWith, compact, constantCase, countBy, curry, curryRight, debounce, deburr, delay, difference, differenceBy, differenceWith, drop, dropRight, dropRightWhile, dropWhile, escape, escapeRegExp, fill, findKey, flatMap, flatMapDeep, flatten, flattenDeep, flattenObject, flow, flowRight, forEachRight, groupBy, head, identity, inRange, initial, intersection, intersectionBy, intersectionWith, invariant, invert, isArrayBuffer, isBlob, isBoolean, isBrowser, isBuffer, isDate, isEqual, isEqualWith, isError, isFile, isFunction, isJSON, isJSONArray, isJSONObject, isJSONValue, isLength, isMap, isNil, isNode, isNull, isPlainObject, isPrimitive, isPromise, isRegExp, isSet, isString, isSubset, isSubsetWith, isSymbol, isTypedArray, isUndefined, isWeakMap, isWeakSet, kebabCase, keyBy, last, lowerCase, lowerFirst, mapKeys, mapValues, maxBy, mean, meanBy, median, medianBy, memoize, merge, mergeWith, minBy, negate, omit, omitBy, once, orderBy, pad, partial, partialRight, partition, pascalCase, pick, pickBy, pull, pullAt, random, randomInt, range, rangeRight, remove, rest, retry, reverseString, round, sample, sampleSize, shuffle, snakeCase, sortBy, spread, startCase, sum, sumBy, tail, take, takeRight, takeRightWhile, takeWhile, throttle, timeout, toCamelCaseKeys, toFilled, toMerged, toSnakeCaseKeys, trim, trimEnd, trimStart, unary, unescape, union, unionBy, unionWith, uniq, uniqBy, uniqWith, unzip, unzipWith, upperCase, upperFirst, windowed, withTimeout, without, words, xor, xorBy, xorWith, zip, zipObject, zipWith

;// ./node_modules/es-toolkit/dist/array/at.mjs
function at_at(arr, indices) {
    const result = new Array(indices.length);
    const length = arr.length;
    for (let i = 0; i < indices.length; i++) {
        let index = indices[i];
        index = Number.isInteger(index) ? index : Math.trunc(index) || 0;
        if (index < 0) {
            index += length;
        }
        result[i] = arr[index];
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/array/chunk.mjs
function chunk(arr, size) {
    if (!Number.isInteger(size) || size <= 0) {
        throw new Error('Size must be an integer greater than zero.');
    }
    const chunkLength = Math.ceil(arr.length / size);
    const result = Array(chunkLength);
    for (let index = 0; index < chunkLength; index++) {
        const start = index * size;
        const end = start + size;
        result[index] = arr.slice(start, end);
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/array/compact.mjs
function compact(arr) {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (item) {
            result.push(item);
        }
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/array/countBy.mjs
function countBy(arr, mapper) {
    const result = {};
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const key = mapper(item);
        result[key] = (result[key] ?? 0) + 1;
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/array/difference.mjs
function difference_difference(firstArr, secondArr) {
    const secondSet = new Set(secondArr);
    return firstArr.filter(item => !secondSet.has(item));
}



;// ./node_modules/es-toolkit/dist/array/differenceBy.mjs
function differenceBy_differenceBy(firstArr, secondArr, mapper) {
    const mappedSecondSet = new Set(secondArr.map(item => mapper(item)));
    return firstArr.filter(item => {
        return !mappedSecondSet.has(mapper(item));
    });
}



;// ./node_modules/es-toolkit/dist/array/differenceWith.mjs
function differenceWith_differenceWith(firstArr, secondArr, areItemsEqual) {
    return firstArr.filter(firstItem => {
        return secondArr.every(secondItem => {
            return !areItemsEqual(firstItem, secondItem);
        });
    });
}



;// ./node_modules/es-toolkit/dist/array/drop.mjs
function drop(arr, itemsCount) {
    itemsCount = Math.max(itemsCount, 0);
    return arr.slice(itemsCount);
}



;// ./node_modules/es-toolkit/dist/array/dropRight.mjs
function dropRight(arr, itemsCount) {
    itemsCount = Math.min(-itemsCount, 0);
    if (itemsCount === 0) {
        return arr.slice();
    }
    return arr.slice(0, itemsCount);
}



;// ./node_modules/es-toolkit/dist/array/dropRightWhile.mjs
function dropRightWhile(arr, canContinueDropping) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (!canContinueDropping(arr[i], i, arr)) {
            return arr.slice(0, i + 1);
        }
    }
    return [];
}



;// ./node_modules/es-toolkit/dist/array/dropWhile.mjs
function dropWhile(arr, canContinueDropping) {
    const dropEndIndex = arr.findIndex((item, index, arr) => !canContinueDropping(item, index, arr));
    if (dropEndIndex === -1) {
        return [];
    }
    return arr.slice(dropEndIndex);
}



;// ./node_modules/es-toolkit/dist/array/fill.mjs
function fill(array, value, start = 0, end = array.length) {
    const length = array.length;
    const finalStart = Math.max(start >= 0 ? start : length + start, 0);
    const finalEnd = Math.min(end >= 0 ? end : length + end, length);
    for (let i = finalStart; i < finalEnd; i++) {
        array[i] = value;
    }
    return array;
}



;// ./node_modules/es-toolkit/dist/array/flatten.mjs
function flatten_flatten(arr, depth = 1) {
    const result = [];
    const flooredDepth = Math.floor(depth);
    const recursive = (arr, currentDepth) => {
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if (Array.isArray(item) && currentDepth < flooredDepth) {
                recursive(item, currentDepth + 1);
            }
            else {
                result.push(item);
            }
        }
    };
    recursive(arr, 0);
    return result;
}



;// ./node_modules/es-toolkit/dist/array/flatMap.mjs


function flatMap(arr, iteratee, depth = 1) {
    return flatten(arr.map(item => iteratee(item)), depth);
}



;// ./node_modules/es-toolkit/dist/array/flattenDeep.mjs


function flattenDeep_flattenDeep(arr) {
    return flatten(arr, Infinity);
}



;// ./node_modules/es-toolkit/dist/array/flatMapDeep.mjs


function flatMapDeep(arr, iteratee) {
    return flattenDeep(arr.map((item) => iteratee(item)));
}



;// ./node_modules/es-toolkit/dist/array/forEachRight.mjs
function forEachRight(arr, callback) {
    for (let i = arr.length - 1; i >= 0; i--) {
        const element = arr[i];
        callback(element, i, arr);
    }
}



;// ./node_modules/es-toolkit/dist/array/groupBy.mjs
function groupBy(arr, getKeyFromItem) {
    const result = {};
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const key = getKeyFromItem(item);
        if (!Object.hasOwn(result, key)) {
            result[key] = [];
        }
        result[key].push(item);
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/array/head.mjs
function head(arr) {
    return arr[0];
}



;// ./node_modules/es-toolkit/dist/array/initial.mjs
function initial(arr) {
    return arr.slice(0, -1);
}



;// ./node_modules/es-toolkit/dist/array/intersection.mjs
function intersection_intersection(firstArr, secondArr) {
    const secondSet = new Set(secondArr);
    return firstArr.filter(item => {
        return secondSet.has(item);
    });
}



;// ./node_modules/es-toolkit/dist/array/intersectionBy.mjs
function intersectionBy_intersectionBy(firstArr, secondArr, mapper) {
    const mappedSecondSet = new Set(secondArr.map(mapper));
    return firstArr.filter(item => mappedSecondSet.has(mapper(item)));
}



;// ./node_modules/es-toolkit/dist/array/intersectionWith.mjs
function intersectionWith_intersectionWith(firstArr, secondArr, areItemsEqual) {
    return firstArr.filter(firstItem => {
        return secondArr.some(secondItem => {
            return areItemsEqual(firstItem, secondItem);
        });
    });
}



;// ./node_modules/es-toolkit/dist/array/isSubset.mjs


function isSubset(superset, subset) {
    return difference(subset, superset).length === 0;
}



;// ./node_modules/es-toolkit/dist/array/isSubsetWith.mjs


function isSubsetWith(superset, subset, areItemsEqual) {
    return differenceWith(subset, superset, areItemsEqual).length === 0;
}



;// ./node_modules/es-toolkit/dist/array/keyBy.mjs
function keyBy(arr, getKeyFromItem) {
    const result = {};
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const key = getKeyFromItem(item);
        result[key] = item;
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/array/last.mjs
function last(arr) {
    return arr[arr.length - 1];
}



;// ./node_modules/es-toolkit/dist/array/maxBy.mjs
function maxBy(items, getValue) {
    if (items.length === 0) {
        return undefined;
    }
    let maxElement = items[0];
    let max = getValue(maxElement);
    for (let i = 1; i < items.length; i++) {
        const element = items[i];
        const value = getValue(element);
        if (value > max) {
            max = value;
            maxElement = element;
        }
    }
    return maxElement;
}



;// ./node_modules/es-toolkit/dist/array/minBy.mjs
function minBy(items, getValue) {
    if (items.length === 0) {
        return undefined;
    }
    let minElement = items[0];
    let min = getValue(minElement);
    for (let i = 1; i < items.length; i++) {
        const element = items[i];
        const value = getValue(element);
        if (value < min) {
            min = value;
            minElement = element;
        }
    }
    return minElement;
}



;// ./node_modules/es-toolkit/dist/_internal/compareValues.mjs
function compareValues_compareValues(a, b, order) {
    if (a < b) {
        return order === 'asc' ? -1 : 1;
    }
    if (a > b) {
        return order === 'asc' ? 1 : -1;
    }
    return 0;
}



;// ./node_modules/es-toolkit/dist/array/orderBy.mjs


function orderBy_orderBy(arr, criteria, orders) {
    return arr.slice().sort((a, b) => {
        const ordersLength = orders.length;
        for (let i = 0; i < criteria.length; i++) {
            const order = ordersLength > i ? orders[i] : orders[ordersLength - 1];
            const criterion = criteria[i];
            const criterionIsFunction = typeof criterion === 'function';
            const valueA = criterionIsFunction ? criterion(a) : a[criterion];
            const valueB = criterionIsFunction ? criterion(b) : b[criterion];
            const result = compareValues(valueA, valueB, order);
            if (result !== 0) {
                return result;
            }
        }
        return 0;
    });
}



;// ./node_modules/es-toolkit/dist/array/partition.mjs
function partition(arr, isInTruthy) {
    const truthy = [];
    const falsy = [];
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (isInTruthy(item)) {
            truthy.push(item);
        }
        else {
            falsy.push(item);
        }
    }
    return [truthy, falsy];
}



;// ./node_modules/es-toolkit/dist/array/pull.mjs
function pull(arr, valuesToRemove) {
    const valuesSet = new Set(valuesToRemove);
    let resultIndex = 0;
    for (let i = 0; i < arr.length; i++) {
        if (valuesSet.has(arr[i])) {
            continue;
        }
        if (!Object.hasOwn(arr, i)) {
            delete arr[resultIndex++];
            continue;
        }
        arr[resultIndex++] = arr[i];
    }
    arr.length = resultIndex;
    return arr;
}



;// ./node_modules/es-toolkit/dist/array/pullAt.mjs


function pullAt(arr, indicesToRemove) {
    const removed = at(arr, indicesToRemove);
    const indices = new Set(indicesToRemove.slice().sort((x, y) => y - x));
    for (const index of indices) {
        arr.splice(index, 1);
    }
    return removed;
}



;// ./node_modules/es-toolkit/dist/array/remove.mjs
function remove(arr, shouldRemoveElement) {
    const originalArr = arr.slice();
    const removed = [];
    let resultIndex = 0;
    for (let i = 0; i < arr.length; i++) {
        if (shouldRemoveElement(arr[i], i, originalArr)) {
            removed.push(arr[i]);
            continue;
        }
        if (!Object.hasOwn(arr, i)) {
            delete arr[resultIndex++];
            continue;
        }
        arr[resultIndex++] = arr[i];
    }
    arr.length = resultIndex;
    return removed;
}



;// ./node_modules/es-toolkit/dist/array/sample.mjs
function sample(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}



;// ./node_modules/es-toolkit/dist/math/random.mjs
function random_random(minimum, maximum) {
    if (maximum == null) {
        maximum = minimum;
        minimum = 0;
    }
    if (minimum >= maximum) {
        throw new Error('Invalid input: The maximum value must be greater than the minimum value.');
    }
    return Math.random() * (maximum - minimum) + minimum;
}



;// ./node_modules/es-toolkit/dist/math/randomInt.mjs


function randomInt_randomInt(minimum, maximum) {
    return Math.floor(random(minimum, maximum));
}



;// ./node_modules/es-toolkit/dist/array/sampleSize.mjs


function sampleSize(array, size) {
    if (size > array.length) {
        throw new Error('Size must be less than or equal to the length of array.');
    }
    const result = new Array(size);
    const selected = new Set();
    for (let step = array.length - size, resultIndex = 0; step < array.length; step++, resultIndex++) {
        let index = randomInt(0, step + 1);
        if (selected.has(index)) {
            index = step;
        }
        selected.add(index);
        result[resultIndex] = array[index];
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/array/shuffle.mjs
function shuffle(arr) {
    const result = arr.slice();
    for (let i = result.length - 1; i >= 1; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/array/sortBy.mjs


function sortBy(arr, criteria) {
    return orderBy(arr, criteria, ['asc']);
}



;// ./node_modules/es-toolkit/dist/array/tail.mjs
function tail(arr) {
    return arr.slice(1);
}



;// ./node_modules/es-toolkit/dist/compat/predicate/isSymbol.mjs
function isSymbol_isSymbol(value) {
    return typeof value === 'symbol' || value instanceof Symbol;
}



;// ./node_modules/es-toolkit/dist/compat/util/toNumber.mjs


function toNumber_toNumber(value) {
    if (isSymbol(value)) {
        return NaN;
    }
    return Number(value);
}



;// ./node_modules/es-toolkit/dist/compat/util/toFinite.mjs


function toFinite_toFinite(value) {
    if (!value) {
        return value === 0 ? value : 0;
    }
    value = toNumber(value);
    if (value === Infinity || value === -Infinity) {
        const sign = value < 0 ? -1 : 1;
        return sign * Number.MAX_VALUE;
    }
    return value === value ? value : 0;
}



;// ./node_modules/es-toolkit/dist/compat/util/toInteger.mjs


function toInteger_toInteger(value) {
    const finite = toFinite(value);
    const remainder = finite % 1;
    return remainder ? finite - remainder : finite;
}



;// ./node_modules/es-toolkit/dist/array/take.mjs


function take(arr, count, guard) {
    count = guard || count === undefined ? 1 : toInteger(count);
    return arr.slice(0, count);
}



;// ./node_modules/es-toolkit/dist/array/takeRight.mjs


function takeRight(arr, count, guard) {
    count = guard || count === undefined ? 1 : toInteger(count);
    if (count <= 0 || arr.length === 0) {
        return [];
    }
    return arr.slice(-count);
}



;// ./node_modules/es-toolkit/dist/array/takeRightWhile.mjs
function takeRightWhile(arr, shouldContinueTaking) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (!shouldContinueTaking(arr[i])) {
            return arr.slice(i + 1);
        }
    }
    return arr.slice();
}



;// ./node_modules/es-toolkit/dist/array/takeWhile.mjs
function takeWhile(arr, shouldContinueTaking) {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (!shouldContinueTaking(item)) {
            break;
        }
        result.push(item);
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/array/toFilled.mjs
function toFilled(arr, value, start = 0, end = arr.length) {
    const length = arr.length;
    const finalStart = Math.max(start >= 0 ? start : length + start, 0);
    const finalEnd = Math.min(end >= 0 ? end : length + end, length);
    const newArr = arr.slice();
    for (let i = finalStart; i < finalEnd; i++) {
        newArr[i] = value;
    }
    return newArr;
}



;// ./node_modules/es-toolkit/dist/array/uniq.mjs
function uniq_uniq(arr) {
    return [...new Set(arr)];
}



;// ./node_modules/es-toolkit/dist/array/union.mjs


function union_union(arr1, arr2) {
    return uniq(arr1.concat(arr2));
}



;// ./node_modules/es-toolkit/dist/array/uniqBy.mjs
function uniqBy_uniqBy(arr, mapper) {
    const map = new Map();
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const key = mapper(item);
        if (!map.has(key)) {
            map.set(key, item);
        }
    }
    return Array.from(map.values());
}



;// ./node_modules/es-toolkit/dist/array/unionBy.mjs


function unionBy_unionBy(arr1, arr2, mapper) {
    return uniqBy(arr1.concat(arr2), mapper);
}



;// ./node_modules/es-toolkit/dist/array/uniqWith.mjs
function uniqWith_uniqWith(arr, areItemsEqual) {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const isUniq = result.every(v => !areItemsEqual(v, item));
        if (isUniq) {
            result.push(item);
        }
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/array/unionWith.mjs


function unionWith_unionWith(arr1, arr2, areItemsEqual) {
    return uniqWith(arr1.concat(arr2), areItemsEqual);
}



;// ./node_modules/es-toolkit/dist/array/unzip.mjs
function unzip(zipped) {
    let maxLen = 0;
    for (let i = 0; i < zipped.length; i++) {
        if (zipped[i].length > maxLen) {
            maxLen = zipped[i].length;
        }
    }
    const result = new Array(maxLen);
    for (let i = 0; i < maxLen; i++) {
        result[i] = new Array(zipped.length);
        for (let j = 0; j < zipped.length; j++) {
            result[i][j] = zipped[j][i];
        }
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/array/unzipWith.mjs
function unzipWith(target, iteratee) {
    const maxLength = Math.max(...target.map(innerArray => innerArray.length));
    const result = new Array(maxLength);
    for (let i = 0; i < maxLength; i++) {
        const group = new Array(target.length);
        for (let j = 0; j < target.length; j++) {
            group[j] = target[j][i];
        }
        result[i] = iteratee(...group);
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/array/windowed.mjs
function windowed(arr, size, step = 1, { partialWindows = false } = {}) {
    if (size <= 0 || !Number.isInteger(size)) {
        throw new Error('Size must be a positive integer.');
    }
    if (step <= 0 || !Number.isInteger(step)) {
        throw new Error('Step must be a positive integer.');
    }
    const result = [];
    const end = partialWindows ? arr.length : arr.length - size + 1;
    for (let i = 0; i < end; i += step) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/array/without.mjs


function without(array, ...values) {
    return difference(array, values);
}



;// ./node_modules/es-toolkit/dist/array/xor.mjs




function xor(arr1, arr2) {
    return difference(union(arr1, arr2), intersection(arr1, arr2));
}



;// ./node_modules/es-toolkit/dist/array/xorBy.mjs




function xorBy(arr1, arr2, mapper) {
    const union = unionBy(arr1, arr2, mapper);
    const intersection = intersectionBy(arr1, arr2, mapper);
    return differenceBy(union, intersection, mapper);
}



;// ./node_modules/es-toolkit/dist/array/xorWith.mjs




function xorWith(arr1, arr2, areElementsEqual) {
    const union = unionWith(arr1, arr2, areElementsEqual);
    const intersection = intersectionWith(arr1, arr2, areElementsEqual);
    return differenceWith(union, intersection, areElementsEqual);
}



;// ./node_modules/es-toolkit/dist/array/zip.mjs
function zip(...arrs) {
    let rowCount = 0;
    for (let i = 0; i < arrs.length; i++) {
        if (arrs[i].length > rowCount) {
            rowCount = arrs[i].length;
        }
    }
    const columnCount = arrs.length;
    const result = Array(rowCount);
    for (let i = 0; i < rowCount; ++i) {
        const row = Array(columnCount);
        for (let j = 0; j < columnCount; ++j) {
            row[j] = arrs[j][i];
        }
        result[i] = row;
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/array/zipObject.mjs
function zipObject(keys, values) {
    const result = {};
    for (let i = 0; i < keys.length; i++) {
        result[keys[i]] = values[i];
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/array/zipWith.mjs
function zipWith(arr1, ...rest) {
    const arrs = [arr1, ...rest.slice(0, -1)];
    const combine = rest[rest.length - 1];
    const maxIndex = Math.max(...arrs.map(arr => arr.length));
    const result = Array(maxIndex);
    for (let i = 0; i < maxIndex; i++) {
        const elements = arrs.map(arr => arr[i]);
        result[i] = combine(...elements);
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/error/AbortError.mjs
class AbortError_AbortError extends Error {
    constructor(message = 'The operation was aborted') {
        super(message);
        this.name = 'AbortError';
    }
}



;// ./node_modules/es-toolkit/dist/error/TimeoutError.mjs
class TimeoutError_TimeoutError extends Error {
    constructor(message = 'The operation was timed out') {
        super(message);
        this.name = 'TimeoutError';
    }
}



;// ./node_modules/es-toolkit/dist/function/after.mjs
function after(n, func) {
    if (!Number.isInteger(n) || n < 0) {
        throw new Error(`n must be a non-negative integer.`);
    }
    let counter = 0;
    return (...args) => {
        if (++counter >= n) {
            return func(...args);
        }
        return undefined;
    };
}



;// ./node_modules/es-toolkit/dist/function/ary.mjs
function ary_ary(func, n) {
    return function (...args) {
        return func.apply(this, args.slice(0, n));
    };
}



;// ./node_modules/es-toolkit/dist/function/asyncNoop.mjs
async function asyncNoop() { }



;// ./node_modules/es-toolkit/dist/function/before.mjs
function before(n, func) {
    if (!Number.isInteger(n) || n < 0) {
        throw new Error('n must be a non-negative integer.');
    }
    let counter = 0;
    return (...args) => {
        if (++counter < n) {
            return func(...args);
        }
        return undefined;
    };
}



;// ./node_modules/es-toolkit/dist/function/curry.mjs
function curry(func) {
    if (func.length === 0 || func.length === 1) {
        return func;
    }
    return function (arg) {
        return makeCurry(func, func.length, [arg]);
    };
}
function makeCurry(origin, argsLength, args) {
    if (args.length === argsLength) {
        return origin(...args);
    }
    else {
        const next = function (arg) {
            return makeCurry(origin, argsLength, [...args, arg]);
        };
        return next;
    }
}



;// ./node_modules/es-toolkit/dist/function/curryRight.mjs
function curryRight(func) {
    if (func.length === 0 || func.length === 1) {
        return func;
    }
    return function (arg) {
        return makeCurryRight(func, func.length, [arg]);
    };
}
function makeCurryRight(origin, argsLength, args) {
    if (args.length === argsLength) {
        return origin(...args);
    }
    else {
        const next = function (arg) {
            return makeCurryRight(origin, argsLength, [arg, ...args]);
        };
        return next;
    }
}



;// ./node_modules/es-toolkit/dist/function/debounce.mjs
function debounce_debounce(func, debounceMs, { signal, edges } = {}) {
    let pendingThis = undefined;
    let pendingArgs = null;
    const leading = edges != null && edges.includes('leading');
    const trailing = edges == null || edges.includes('trailing');
    const invoke = () => {
        if (pendingArgs !== null) {
            func.apply(pendingThis, pendingArgs);
            pendingThis = undefined;
            pendingArgs = null;
        }
    };
    const onTimerEnd = () => {
        if (trailing) {
            invoke();
        }
        cancel();
    };
    let timeoutId = null;
    const schedule = () => {
        if (timeoutId != null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            timeoutId = null;
            onTimerEnd();
        }, debounceMs);
    };
    const cancelTimer = () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };
    const cancel = () => {
        cancelTimer();
        pendingThis = undefined;
        pendingArgs = null;
    };
    const flush = () => {
        invoke();
    };
    const debounced = function (...args) {
        if (signal?.aborted) {
            return;
        }
        pendingThis = this;
        pendingArgs = args;
        const isFirstCall = timeoutId == null;
        schedule();
        if (leading && isFirstCall) {
            invoke();
        }
    };
    debounced.schedule = schedule;
    debounced.cancel = cancel;
    debounced.flush = flush;
    signal?.addEventListener('abort', cancel, { once: true });
    return debounced;
}



;// ./node_modules/es-toolkit/dist/function/flow.mjs
function flow_flow(...funcs) {
    return function (...args) {
        let result = funcs.length ? funcs[0].apply(this, args) : args[0];
        for (let i = 1; i < funcs.length; i++) {
            result = funcs[i].call(this, result);
        }
        return result;
    };
}



;// ./node_modules/es-toolkit/dist/function/flowRight.mjs


function flowRight(...funcs) {
    return flow(...funcs.reverse());
}



;// ./node_modules/es-toolkit/dist/function/identity.mjs
function identity(x) {
    return x;
}



;// ./node_modules/es-toolkit/dist/function/memoize.mjs
function memoize(fn, options = {}) {
    const { cache = new Map(), getCacheKey } = options;
    const memoizedFn = function (arg) {
        const key = getCacheKey ? getCacheKey(arg) : arg;
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn.call(this, arg);
        cache.set(key, result);
        return result;
    };
    memoizedFn.cache = cache;
    return memoizedFn;
}



;// ./node_modules/es-toolkit/dist/function/negate.mjs
function negate(func) {
    return ((...args) => !func(...args));
}



;// ./node_modules/es-toolkit/dist/function/noop.mjs
function noop_noop() { }



;// ./node_modules/es-toolkit/dist/function/once.mjs
function once(func) {
    let called = false;
    let cache;
    return function (...args) {
        if (!called) {
            called = true;
            cache = func(...args);
        }
        return cache;
    };
}



;// ./node_modules/es-toolkit/dist/function/partial.mjs
function partial(func, ...partialArgs) {
    return partialImpl(func, placeholderSymbol, ...partialArgs);
}
function partialImpl(func, placeholder, ...partialArgs) {
    const partialed = function (...providedArgs) {
        let providedArgsIndex = 0;
        const substitutedArgs = partialArgs
            .slice()
            .map(arg => (arg === placeholder ? providedArgs[providedArgsIndex++] : arg));
        const remainingArgs = providedArgs.slice(providedArgsIndex);
        return func.apply(this, substitutedArgs.concat(remainingArgs));
    };
    if (func.prototype) {
        partialed.prototype = Object.create(func.prototype);
    }
    return partialed;
}
const placeholderSymbol = Symbol('partial.placeholder');
partial.placeholder = placeholderSymbol;



;// ./node_modules/es-toolkit/dist/function/partialRight.mjs
function partialRight(func, ...partialArgs) {
    return partialRightImpl(func, partialRight_placeholderSymbol, ...partialArgs);
}
function partialRightImpl(func, placeholder, ...partialArgs) {
    const partialedRight = function (...providedArgs) {
        const placeholderLength = partialArgs.filter(arg => arg === placeholder).length;
        const rangeLength = Math.max(providedArgs.length - placeholderLength, 0);
        const remainingArgs = providedArgs.slice(0, rangeLength);
        let providedArgsIndex = rangeLength;
        const substitutedArgs = partialArgs
            .slice()
            .map(arg => (arg === placeholder ? providedArgs[providedArgsIndex++] : arg));
        return func.apply(this, remainingArgs.concat(substitutedArgs));
    };
    if (func.prototype) {
        partialedRight.prototype = Object.create(func.prototype);
    }
    return partialedRight;
}
const partialRight_placeholderSymbol = Symbol('partialRight.placeholder');
partialRight.placeholder = partialRight_placeholderSymbol;



;// ./node_modules/es-toolkit/dist/function/rest.mjs
function rest(func, startIndex = func.length - 1) {
    return function (...args) {
        const rest = args.slice(startIndex);
        const params = args.slice(0, startIndex);
        while (params.length < startIndex) {
            params.push(undefined);
        }
        return func.apply(this, [...params, rest]);
    };
}



;// ./node_modules/es-toolkit/dist/promise/delay.mjs


function delay_delay(ms, { signal } = {}) {
    return new Promise((resolve, reject) => {
        const abortError = () => {
            reject(new AbortError());
        };
        const abortHandler = () => {
            clearTimeout(timeoutId);
            abortError();
        };
        if (signal?.aborted) {
            return abortError();
        }
        const timeoutId = setTimeout(() => {
            signal?.removeEventListener('abort', abortHandler);
            resolve();
        }, ms);
        signal?.addEventListener('abort', abortHandler, { once: true });
    });
}



;// ./node_modules/es-toolkit/dist/function/retry.mjs


const DEFAULT_DELAY = 0;
const DEFAULT_RETRIES = Number.POSITIVE_INFINITY;
async function retry(func, _options) {
    let delay$1;
    let retries;
    let signal;
    if (typeof _options === 'number') {
        delay$1 = DEFAULT_DELAY;
        retries = _options;
        signal = undefined;
    }
    else {
        delay$1 = _options?.delay ?? DEFAULT_DELAY;
        retries = _options?.retries ?? DEFAULT_RETRIES;
        signal = _options?.signal;
    }
    let error;
    for (let attempts = 0; attempts < retries; attempts++) {
        if (signal?.aborted) {
            throw error ?? new Error(`The retry operation was aborted due to an abort signal.`);
        }
        try {
            return await func();
        }
        catch (err) {
            error = err;
            const currentDelay = typeof delay$1 === 'function' ? delay$1(attempts) : delay$1;
            await delay(currentDelay);
        }
    }
    throw error;
}



;// ./node_modules/es-toolkit/dist/function/spread.mjs
function spread(func) {
    return function (argsArr) {
        return func.apply(this, argsArr);
    };
}



;// ./node_modules/es-toolkit/dist/function/throttle.mjs


function throttle(func, throttleMs, { signal, edges = ['leading', 'trailing'] } = {}) {
    let pendingAt = null;
    const debounced = debounce(func, throttleMs, { signal, edges });
    const throttled = function (...args) {
        if (pendingAt == null) {
            pendingAt = Date.now();
        }
        else {
            if (Date.now() - pendingAt >= throttleMs) {
                pendingAt = Date.now();
                debounced.cancel();
            }
        }
        debounced.apply(this, args);
    };
    throttled.cancel = debounced.cancel;
    throttled.flush = debounced.flush;
    return throttled;
}



;// ./node_modules/es-toolkit/dist/function/unary.mjs


function unary(func) {
    return ary(func, 1);
}



;// ./node_modules/es-toolkit/dist/math/clamp.mjs
function clamp(value, bound1, bound2) {
    if (bound2 == null) {
        return Math.min(value, bound1);
    }
    return Math.min(Math.max(value, bound1), bound2);
}



;// ./node_modules/es-toolkit/dist/math/inRange.mjs
function inRange(value, minimum, maximum) {
    if (maximum == null) {
        maximum = minimum;
        minimum = 0;
    }
    if (minimum >= maximum) {
        throw new Error('The maximum value must be greater than the minimum value.');
    }
    return minimum <= value && value < maximum;
}



;// ./node_modules/es-toolkit/dist/math/sum.mjs
function sum_sum(nums) {
    let result = 0;
    for (let i = 0; i < nums.length; i++) {
        result += nums[i];
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/math/mean.mjs


function mean(nums) {
    return sum(nums) / nums.length;
}



;// ./node_modules/es-toolkit/dist/math/sumBy.mjs
function sumBy_sumBy(items, getValue) {
    let result = 0;
    for (let i = 0; i < items.length; i++) {
        result += getValue(items[i], i);
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/math/meanBy.mjs


function meanBy(items, getValue) {
    return sumBy(items, item => getValue(item)) / items.length;
}



;// ./node_modules/es-toolkit/dist/math/median.mjs
function median_median(nums) {
    if (nums.length === 0) {
        return NaN;
    }
    const sorted = nums.slice().sort((a, b) => a - b);
    const middleIndex = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[middleIndex - 1] + sorted[middleIndex]) / 2;
    }
    else {
        return sorted[middleIndex];
    }
}



;// ./node_modules/es-toolkit/dist/math/medianBy.mjs


function medianBy(items, getValue) {
    const nums = items.map(x => getValue(x));
    return median(nums);
}



;// ./node_modules/es-toolkit/dist/math/range.mjs
function range(start, end, step = 1) {
    if (end == null) {
        end = start;
        start = 0;
    }
    if (!Number.isInteger(step) || step === 0) {
        throw new Error(`The step value must be a non-zero integer.`);
    }
    const length = Math.max(Math.ceil((end - start) / step), 0);
    const result = new Array(length);
    for (let i = 0; i < length; i++) {
        result[i] = start + i * step;
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/math/rangeRight.mjs
function rangeRight(start, end, step = 1) {
    if (end == null) {
        end = start;
        start = 0;
    }
    if (!Number.isInteger(step) || step === 0) {
        throw new Error(`The step value must be a non-zero integer.`);
    }
    const length = Math.max(Math.ceil((end - start) / step), 0);
    const result = new Array(length);
    for (let i = 0; i < length; i++) {
        result[i] = start + (length - i - 1) * step;
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/math/round.mjs
function round(value, precision = 0) {
    if (!Number.isInteger(precision)) {
        throw new Error('Precision must be an integer.');
    }
    const multiplier = Math.pow(10, precision);
    return Math.round(value * multiplier) / multiplier;
}



;// ./node_modules/es-toolkit/dist/predicate/isPrimitive.mjs
function isPrimitive_isPrimitive(value) {
    return value == null || (typeof value !== 'object' && typeof value !== 'function');
}



;// ./node_modules/es-toolkit/dist/predicate/isTypedArray.mjs
function isTypedArray_isTypedArray(x) {
    return ArrayBuffer.isView(x) && !(x instanceof DataView);
}



;// ./node_modules/es-toolkit/dist/object/clone.mjs



function clone_clone(obj) {
    if (isPrimitive(obj)) {
        return obj;
    }
    if (Array.isArray(obj) ||
        isTypedArray(obj) ||
        obj instanceof ArrayBuffer ||
        (typeof SharedArrayBuffer !== 'undefined' && obj instanceof SharedArrayBuffer)) {
        return obj.slice(0);
    }
    const prototype = Object.getPrototypeOf(obj);
    const Constructor = prototype.constructor;
    if (obj instanceof Date || obj instanceof Map || obj instanceof Set) {
        return new Constructor(obj);
    }
    if (obj instanceof RegExp) {
        const newRegExp = new Constructor(obj);
        newRegExp.lastIndex = obj.lastIndex;
        return newRegExp;
    }
    if (obj instanceof DataView) {
        return new Constructor(obj.buffer.slice(0));
    }
    if (obj instanceof Error) {
        const newError = new Constructor(obj.message);
        newError.stack = obj.stack;
        newError.name = obj.name;
        newError.cause = obj.cause;
        return newError;
    }
    if (typeof File !== 'undefined' && obj instanceof File) {
        const newFile = new Constructor([obj], obj.name, { type: obj.type, lastModified: obj.lastModified });
        return newFile;
    }
    if (typeof obj === 'object') {
        const newObject = Object.create(prototype);
        return Object.assign(newObject, obj);
    }
    return obj;
}



;// ./node_modules/es-toolkit/dist/compat/_internal/getSymbols.mjs
function getSymbols_getSymbols(object) {
    return Object.getOwnPropertySymbols(object).filter(symbol => Object.prototype.propertyIsEnumerable.call(object, symbol));
}



;// ./node_modules/es-toolkit/dist/compat/_internal/getTag.mjs
function getTag_getTag(value) {
    if (value == null) {
        return value === undefined ? '[object Undefined]' : '[object Null]';
    }
    return Object.prototype.toString.call(value);
}



;// ./node_modules/es-toolkit/dist/compat/_internal/tags.mjs
const tags_regexpTag = '[object RegExp]';
const tags_stringTag = '[object String]';
const tags_numberTag = '[object Number]';
const tags_booleanTag = '[object Boolean]';
const tags_argumentsTag = '[object Arguments]';
const tags_symbolTag = '[object Symbol]';
const tags_dateTag = '[object Date]';
const tags_mapTag = '[object Map]';
const tags_setTag = '[object Set]';
const tags_arrayTag = '[object Array]';
const tags_functionTag = '[object Function]';
const tags_arrayBufferTag = '[object ArrayBuffer]';
const tags_objectTag = '[object Object]';
const tags_errorTag = '[object Error]';
const tags_dataViewTag = '[object DataView]';
const tags_uint8ArrayTag = '[object Uint8Array]';
const tags_uint8ClampedArrayTag = '[object Uint8ClampedArray]';
const tags_uint16ArrayTag = '[object Uint16Array]';
const tags_uint32ArrayTag = '[object Uint32Array]';
const tags_bigUint64ArrayTag = '[object BigUint64Array]';
const tags_int8ArrayTag = '[object Int8Array]';
const tags_int16ArrayTag = '[object Int16Array]';
const tags_int32ArrayTag = '[object Int32Array]';
const tags_bigInt64ArrayTag = '[object BigInt64Array]';
const tags_float32ArrayTag = '[object Float32Array]';
const tags_float64ArrayTag = '[object Float64Array]';



;// ./node_modules/es-toolkit/dist/object/cloneDeepWith.mjs
/* provided dependency */ var Buffer = __webpack_require__(42562)["Buffer"];






function cloneDeepWith(obj, cloneValue) {
    return cloneDeepWith_cloneDeepWithImpl(obj, undefined, obj, new Map(), cloneValue);
}
function cloneDeepWith_cloneDeepWithImpl(valueToClone, keyToClone, objectToClone, stack = new Map(), cloneValue = undefined) {
    const cloned = cloneValue?.(valueToClone, keyToClone, objectToClone, stack);
    if (cloned !== undefined) {
        return cloned;
    }
    if (isPrimitive(valueToClone)) {
        return valueToClone;
    }
    if (stack.has(valueToClone)) {
        return stack.get(valueToClone);
    }
    if (Array.isArray(valueToClone)) {
        const result = new Array(valueToClone.length);
        stack.set(valueToClone, result);
        for (let i = 0; i < valueToClone.length; i++) {
            result[i] = cloneDeepWith_cloneDeepWithImpl(valueToClone[i], i, objectToClone, stack, cloneValue);
        }
        if (Object.hasOwn(valueToClone, 'index')) {
            result.index = valueToClone.index;
        }
        if (Object.hasOwn(valueToClone, 'input')) {
            result.input = valueToClone.input;
        }
        return result;
    }
    if (valueToClone instanceof Date) {
        return new Date(valueToClone.getTime());
    }
    if (valueToClone instanceof RegExp) {
        const result = new RegExp(valueToClone.source, valueToClone.flags);
        result.lastIndex = valueToClone.lastIndex;
        return result;
    }
    if (valueToClone instanceof Map) {
        const result = new Map();
        stack.set(valueToClone, result);
        for (const [key, value] of valueToClone) {
            result.set(key, cloneDeepWith_cloneDeepWithImpl(value, key, objectToClone, stack, cloneValue));
        }
        return result;
    }
    if (valueToClone instanceof Set) {
        const result = new Set();
        stack.set(valueToClone, result);
        for (const value of valueToClone) {
            result.add(cloneDeepWith_cloneDeepWithImpl(value, undefined, objectToClone, stack, cloneValue));
        }
        return result;
    }
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(valueToClone)) {
        return valueToClone.subarray();
    }
    if (isTypedArray(valueToClone)) {
        const result = new (Object.getPrototypeOf(valueToClone).constructor)(valueToClone.length);
        stack.set(valueToClone, result);
        for (let i = 0; i < valueToClone.length; i++) {
            result[i] = cloneDeepWith_cloneDeepWithImpl(valueToClone[i], i, objectToClone, stack, cloneValue);
        }
        return result;
    }
    if (valueToClone instanceof ArrayBuffer ||
        (typeof SharedArrayBuffer !== 'undefined' && valueToClone instanceof SharedArrayBuffer)) {
        return valueToClone.slice(0);
    }
    if (valueToClone instanceof DataView) {
        const result = new DataView(valueToClone.buffer.slice(0), valueToClone.byteOffset, valueToClone.byteLength);
        stack.set(valueToClone, result);
        copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
        return result;
    }
    if (typeof File !== 'undefined' && valueToClone instanceof File) {
        const result = new File([valueToClone], valueToClone.name, {
            type: valueToClone.type,
        });
        stack.set(valueToClone, result);
        copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
        return result;
    }
    if (typeof Blob !== 'undefined' && valueToClone instanceof Blob) {
        const result = new Blob([valueToClone], { type: valueToClone.type });
        stack.set(valueToClone, result);
        copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
        return result;
    }
    if (valueToClone instanceof Error) {
        const result = new valueToClone.constructor();
        stack.set(valueToClone, result);
        result.message = valueToClone.message;
        result.name = valueToClone.name;
        result.stack = valueToClone.stack;
        result.cause = valueToClone.cause;
        copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
        return result;
    }
    if (valueToClone instanceof Boolean) {
        const result = new Boolean(valueToClone.valueOf());
        stack.set(valueToClone, result);
        copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
        return result;
    }
    if (valueToClone instanceof Number) {
        const result = new Number(valueToClone.valueOf());
        stack.set(valueToClone, result);
        copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
        return result;
    }
    if (valueToClone instanceof String) {
        const result = new String(valueToClone.valueOf());
        stack.set(valueToClone, result);
        copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
        return result;
    }
    if (typeof valueToClone === 'object' && isCloneableObject(valueToClone)) {
        const result = Object.create(Object.getPrototypeOf(valueToClone));
        stack.set(valueToClone, result);
        copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
        return result;
    }
    return valueToClone;
}
function copyProperties(target, source, objectToClone = target, stack, cloneValue) {
    const keys = [...Object.keys(source), ...getSymbols(source)];
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const descriptor = Object.getOwnPropertyDescriptor(target, key);
        if (descriptor == null || descriptor.writable) {
            target[key] = cloneDeepWith_cloneDeepWithImpl(source[key], key, objectToClone, stack, cloneValue);
        }
    }
}
function isCloneableObject(object) {
    switch (getTag(object)) {
        case argumentsTag:
        case arrayTag:
        case arrayBufferTag:
        case dataViewTag:
        case booleanTag:
        case dateTag:
        case float32ArrayTag:
        case float64ArrayTag:
        case int8ArrayTag:
        case int16ArrayTag:
        case int32ArrayTag:
        case mapTag:
        case numberTag:
        case objectTag:
        case regexpTag:
        case setTag:
        case stringTag:
        case symbolTag:
        case uint8ArrayTag:
        case uint8ClampedArrayTag:
        case uint16ArrayTag:
        case uint32ArrayTag: {
            return true;
        }
        default: {
            return false;
        }
    }
}



;// ./node_modules/es-toolkit/dist/object/cloneDeep.mjs


function cloneDeep(obj) {
    return cloneDeepWithImpl(obj, undefined, obj, new Map(), undefined);
}



;// ./node_modules/es-toolkit/dist/object/findKey.mjs
function findKey(obj, predicate) {
    const keys = Object.keys(obj);
    return keys.find(key => predicate(obj[key], key, obj));
}



;// ./node_modules/es-toolkit/dist/predicate/isPlainObject.mjs
function isPlainObject_isPlainObject(value) {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const proto = Object.getPrototypeOf(value);
    const hasObjectPrototype = proto === null ||
        proto === Object.prototype ||
        Object.getPrototypeOf(proto) === null;
    if (!hasObjectPrototype) {
        return false;
    }
    return Object.prototype.toString.call(value) === '[object Object]';
}



;// ./node_modules/es-toolkit/dist/object/flattenObject.mjs


function flattenObject(object, { delimiter = '.' } = {}) {
    return flattenObjectImpl(object, '', delimiter);
}
function flattenObjectImpl(object, prefix, delimiter) {
    const result = {};
    const keys = Object.keys(object);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = object[key];
        const prefixedKey = prefix ? `${prefix}${delimiter}${key}` : key;
        if (isPlainObject(value) && Object.keys(value).length > 0) {
            Object.assign(result, flattenObjectImpl(value, prefixedKey, delimiter));
            continue;
        }
        if (Array.isArray(value)) {
            Object.assign(result, flattenObjectImpl(value, prefixedKey, delimiter));
            continue;
        }
        result[prefixedKey] = value;
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/object/invert.mjs
function invert(obj) {
    const result = {};
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = obj[key];
        result[value] = key;
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/object/mapKeys.mjs
function mapKeys(object, getNewKey) {
    const result = {};
    const keys = Object.keys(object);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = object[key];
        result[getNewKey(value, key, object)] = value;
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/object/mapValues.mjs
function mapValues(object, getNewValue) {
    const result = {};
    const keys = Object.keys(object);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = object[key];
        result[key] = getNewValue(value, key, object);
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/_internal/isUnsafeProperty.mjs
function isUnsafeProperty_isUnsafeProperty(key) {
    return key === '__proto__';
}



;// ./node_modules/es-toolkit/dist/object/merge.mjs



function merge(target, source) {
    const sourceKeys = Object.keys(source);
    for (let i = 0; i < sourceKeys.length; i++) {
        const key = sourceKeys[i];
        if (isUnsafeProperty(key)) {
            continue;
        }
        const sourceValue = source[key];
        const targetValue = target[key];
        if (Array.isArray(sourceValue)) {
            if (Array.isArray(targetValue)) {
                target[key] = merge(targetValue, sourceValue);
            }
            else {
                target[key] = merge([], sourceValue);
            }
        }
        else if (isPlainObject(sourceValue)) {
            if (isPlainObject(targetValue)) {
                target[key] = merge(targetValue, sourceValue);
            }
            else {
                target[key] = merge({}, sourceValue);
            }
        }
        else if (targetValue === undefined || sourceValue !== undefined) {
            target[key] = sourceValue;
        }
    }
    return target;
}



;// ./node_modules/es-toolkit/dist/object/mergeWith.mjs



function mergeWith_mergeWith(target, source, merge) {
    const sourceKeys = Object.keys(source);
    for (let i = 0; i < sourceKeys.length; i++) {
        const key = sourceKeys[i];
        if (isUnsafeProperty(key)) {
            continue;
        }
        const sourceValue = source[key];
        const targetValue = target[key];
        const merged = merge(targetValue, sourceValue, key, target, source);
        if (merged !== undefined) {
            target[key] = merged;
        }
        else if (Array.isArray(sourceValue)) {
            if (Array.isArray(targetValue)) {
                target[key] = mergeWith_mergeWith(targetValue ?? [], sourceValue, merge);
            }
            else {
                target[key] = mergeWith_mergeWith([], sourceValue, merge);
            }
        }
        else if (isPlainObject(sourceValue)) {
            if (isPlainObject(targetValue)) {
                target[key] = mergeWith_mergeWith(targetValue, sourceValue, merge);
            }
            else {
                target[key] = mergeWith_mergeWith({}, sourceValue, merge);
            }
        }
        else if (targetValue === undefined || sourceValue !== undefined) {
            target[key] = sourceValue;
        }
    }
    return target;
}



;// ./node_modules/es-toolkit/dist/object/omit.mjs
function omit(obj, keys) {
    const result = { ...obj };
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        delete result[key];
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/object/omitBy.mjs
function omitBy(obj, shouldOmit) {
    const result = {};
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = obj[key];
        if (!shouldOmit(value, key)) {
            result[key] = value;
        }
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/object/pick.mjs
function pick(obj, keys) {
    const result = {};
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (Object.hasOwn(obj, key)) {
            result[key] = obj[key];
        }
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/object/pickBy.mjs
function pickBy(obj, shouldPick) {
    const result = {};
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = obj[key];
        if (shouldPick(value, key)) {
            result[key] = value;
        }
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/compat/predicate/isArray.mjs
function isArray_isArray(value) {
    return Array.isArray(value);
}



;// ./node_modules/es-toolkit/dist/string/capitalize.mjs
function capitalize_capitalize(str) {
    return (str.charAt(0).toUpperCase() + str.slice(1).toLowerCase());
}



;// ./node_modules/es-toolkit/dist/string/words.mjs
const CASE_SPLIT_PATTERN = /\p{Lu}?\p{Ll}+|[0-9]+|\p{Lu}+(?!\p{Ll})|\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{L}+/gu;
function words_words(str) {
    return Array.from(str.match(CASE_SPLIT_PATTERN) ?? []);
}



;// ./node_modules/es-toolkit/dist/string/camelCase.mjs



function camelCase_camelCase(str) {
    const words$1 = words(str);
    if (words$1.length === 0) {
        return '';
    }
    const [first, ...rest] = words$1;
    return `${first.toLowerCase()}${rest.map(word => capitalize(word)).join('')}`;
}



;// ./node_modules/es-toolkit/dist/object/toCamelCaseKeys.mjs




function toCamelCaseKeys(obj) {
    if (isArray(obj)) {
        return obj.map(item => toCamelCaseKeys(item));
    }
    if (isPlainObject(obj)) {
        const result = {};
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const camelKey = camelCase(key);
            const convertedValue = toCamelCaseKeys(obj[key]);
            result[camelKey] = convertedValue;
        }
        return result;
    }
    return obj;
}



;// ./node_modules/es-toolkit/dist/object/toMerged.mjs




function toMerged(target, source) {
    return mergeWith(clone(target), source, function mergeRecursively(targetValue, sourceValue) {
        if (Array.isArray(sourceValue)) {
            if (Array.isArray(targetValue)) {
                return mergeWith(clone(targetValue), sourceValue, mergeRecursively);
            }
            else {
                return mergeWith([], sourceValue, mergeRecursively);
            }
        }
        else if (isPlainObject(sourceValue)) {
            if (isPlainObject(targetValue)) {
                return mergeWith(clone(targetValue), sourceValue, mergeRecursively);
            }
            else {
                return mergeWith({}, sourceValue, mergeRecursively);
            }
        }
    });
}



;// ./node_modules/es-toolkit/dist/compat/predicate/isPlainObject.mjs
function predicate_isPlainObject_isPlainObject(object) {
    if (typeof object !== 'object') {
        return false;
    }
    if (object == null) {
        return false;
    }
    if (Object.getPrototypeOf(object) === null) {
        return true;
    }
    if (Object.prototype.toString.call(object) !== '[object Object]') {
        const tag = object[Symbol.toStringTag];
        if (tag == null) {
            return false;
        }
        const isTagReadonly = !Object.getOwnPropertyDescriptor(object, Symbol.toStringTag)?.writable;
        if (isTagReadonly) {
            return false;
        }
        return object.toString() === `[object ${tag}]`;
    }
    let proto = object;
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(object) === proto;
}



;// ./node_modules/es-toolkit/dist/string/snakeCase.mjs


function snakeCase_snakeCase(str) {
    const words$1 = words(str);
    return words$1.map(word => word.toLowerCase()).join('_');
}



;// ./node_modules/es-toolkit/dist/object/toSnakeCaseKeys.mjs




function toSnakeCaseKeys(obj) {
    if (isArray(obj)) {
        return obj.map(item => toSnakeCaseKeys(item));
    }
    if (isPlainObject(obj)) {
        const result = {};
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const snakeKey = snakeCase(key);
            const convertedValue = toSnakeCaseKeys(obj[key]);
            result[snakeKey] = convertedValue;
        }
        return result;
    }
    return obj;
}



;// ./node_modules/es-toolkit/dist/predicate/isArrayBuffer.mjs
function isArrayBuffer(value) {
    return value instanceof ArrayBuffer;
}



;// ./node_modules/es-toolkit/dist/predicate/isBlob.mjs
function isBlob_isBlob(x) {
    if (typeof Blob === 'undefined') {
        return false;
    }
    return x instanceof Blob;
}



;// ./node_modules/es-toolkit/dist/predicate/isBoolean.mjs
function isBoolean(x) {
    return typeof x === 'boolean';
}



;// ./node_modules/es-toolkit/dist/predicate/isBrowser.mjs
function isBrowser() {
    return typeof window !== 'undefined' && window?.document != null;
}



;// ./node_modules/es-toolkit/dist/predicate/isBuffer.mjs
/* provided dependency */ var isBuffer_Buffer = __webpack_require__(42562)["Buffer"];
function isBuffer(x) {
    return typeof isBuffer_Buffer !== 'undefined' && isBuffer_Buffer.isBuffer(x);
}



;// ./node_modules/es-toolkit/dist/predicate/isDate.mjs
function isDate(value) {
    return value instanceof Date;
}



;// ./node_modules/es-toolkit/dist/compat/util/eq.mjs
function eq_eq(value, other) {
    return value === other || (Number.isNaN(value) && Number.isNaN(other));
}



;// ./node_modules/es-toolkit/dist/predicate/isEqualWith.mjs
/* provided dependency */ var isEqualWith_Buffer = __webpack_require__(42562)["Buffer"];






function isEqualWith_isEqualWith(a, b, areValuesEqual) {
    return isEqualWithImpl(a, b, undefined, undefined, undefined, undefined, areValuesEqual);
}
function isEqualWithImpl(a, b, property, aParent, bParent, stack, areValuesEqual) {
    const result = areValuesEqual(a, b, property, aParent, bParent, stack);
    if (result !== undefined) {
        return result;
    }
    if (typeof a === typeof b) {
        switch (typeof a) {
            case 'bigint':
            case 'string':
            case 'boolean':
            case 'symbol':
            case 'undefined': {
                return a === b;
            }
            case 'number': {
                return a === b || Object.is(a, b);
            }
            case 'function': {
                return a === b;
            }
            case 'object': {
                return areObjectsEqual(a, b, stack, areValuesEqual);
            }
        }
    }
    return areObjectsEqual(a, b, stack, areValuesEqual);
}
function areObjectsEqual(a, b, stack, areValuesEqual) {
    if (Object.is(a, b)) {
        return true;
    }
    let aTag = getTag(a);
    let bTag = getTag(b);
    if (aTag === argumentsTag) {
        aTag = objectTag;
    }
    if (bTag === argumentsTag) {
        bTag = objectTag;
    }
    if (aTag !== bTag) {
        return false;
    }
    switch (aTag) {
        case stringTag:
            return a.toString() === b.toString();
        case numberTag: {
            const x = a.valueOf();
            const y = b.valueOf();
            return eq(x, y);
        }
        case booleanTag:
        case dateTag:
        case symbolTag:
            return Object.is(a.valueOf(), b.valueOf());
        case regexpTag: {
            return a.source === b.source && a.flags === b.flags;
        }
        case functionTag: {
            return a === b;
        }
    }
    stack = stack ?? new Map();
    const aStack = stack.get(a);
    const bStack = stack.get(b);
    if (aStack != null && bStack != null) {
        return aStack === b;
    }
    stack.set(a, b);
    stack.set(b, a);
    try {
        switch (aTag) {
            case mapTag: {
                if (a.size !== b.size) {
                    return false;
                }
                for (const [key, value] of a.entries()) {
                    if (!b.has(key) || !isEqualWithImpl(value, b.get(key), key, a, b, stack, areValuesEqual)) {
                        return false;
                    }
                }
                return true;
            }
            case setTag: {
                if (a.size !== b.size) {
                    return false;
                }
                const aValues = Array.from(a.values());
                const bValues = Array.from(b.values());
                for (let i = 0; i < aValues.length; i++) {
                    const aValue = aValues[i];
                    const index = bValues.findIndex(bValue => {
                        return isEqualWithImpl(aValue, bValue, undefined, a, b, stack, areValuesEqual);
                    });
                    if (index === -1) {
                        return false;
                    }
                    bValues.splice(index, 1);
                }
                return true;
            }
            case arrayTag:
            case uint8ArrayTag:
            case uint8ClampedArrayTag:
            case uint16ArrayTag:
            case uint32ArrayTag:
            case bigUint64ArrayTag:
            case int8ArrayTag:
            case int16ArrayTag:
            case int32ArrayTag:
            case bigInt64ArrayTag:
            case float32ArrayTag:
            case float64ArrayTag: {
                if (typeof isEqualWith_Buffer !== 'undefined' && isEqualWith_Buffer.isBuffer(a) !== isEqualWith_Buffer.isBuffer(b)) {
                    return false;
                }
                if (a.length !== b.length) {
                    return false;
                }
                for (let i = 0; i < a.length; i++) {
                    if (!isEqualWithImpl(a[i], b[i], i, a, b, stack, areValuesEqual)) {
                        return false;
                    }
                }
                return true;
            }
            case arrayBufferTag: {
                if (a.byteLength !== b.byteLength) {
                    return false;
                }
                return areObjectsEqual(new Uint8Array(a), new Uint8Array(b), stack, areValuesEqual);
            }
            case dataViewTag: {
                if (a.byteLength !== b.byteLength || a.byteOffset !== b.byteOffset) {
                    return false;
                }
                return areObjectsEqual(new Uint8Array(a), new Uint8Array(b), stack, areValuesEqual);
            }
            case errorTag: {
                return a.name === b.name && a.message === b.message;
            }
            case objectTag: {
                const areEqualInstances = areObjectsEqual(a.constructor, b.constructor, stack, areValuesEqual) ||
                    (isPlainObject(a) && isPlainObject(b));
                if (!areEqualInstances) {
                    return false;
                }
                const aKeys = [...Object.keys(a), ...getSymbols(a)];
                const bKeys = [...Object.keys(b), ...getSymbols(b)];
                if (aKeys.length !== bKeys.length) {
                    return false;
                }
                for (let i = 0; i < aKeys.length; i++) {
                    const propKey = aKeys[i];
                    const aProp = a[propKey];
                    if (!Object.hasOwn(b, propKey)) {
                        return false;
                    }
                    const bProp = b[propKey];
                    if (!isEqualWithImpl(aProp, bProp, propKey, a, b, stack, areValuesEqual)) {
                        return false;
                    }
                }
                return true;
            }
            default: {
                return false;
            }
        }
    }
    finally {
        stack.delete(a);
        stack.delete(b);
    }
}



;// ./node_modules/es-toolkit/dist/predicate/isEqual.mjs



function isEqual(a, b) {
    return isEqualWith(a, b, noop);
}



;// ./node_modules/es-toolkit/dist/predicate/isError.mjs
function isError(value) {
    return value instanceof Error;
}



;// ./node_modules/es-toolkit/dist/predicate/isFile.mjs


function isFile(x) {
    if (typeof File === 'undefined') {
        return false;
    }
    return isBlob(x) && x instanceof File;
}



;// ./node_modules/es-toolkit/dist/predicate/isFunction.mjs
function isFunction(value) {
    return typeof value === 'function';
}



;// ./node_modules/es-toolkit/dist/predicate/isJSON.mjs
function isJSON(value) {
    if (typeof value !== 'string') {
        return false;
    }
    try {
        JSON.parse(value);
        return true;
    }
    catch {
        return false;
    }
}



;// ./node_modules/es-toolkit/dist/predicate/isJSONValue.mjs


function isJSONValue(value) {
    switch (typeof value) {
        case 'object': {
            return value === null || isJSONArray(value) || isJSONObject(value);
        }
        case 'string':
        case 'number':
        case 'boolean': {
            return true;
        }
        default: {
            return false;
        }
    }
}
function isJSONArray(value) {
    if (!Array.isArray(value)) {
        return false;
    }
    return value.every(item => isJSONValue(item));
}
function isJSONObject(obj) {
    if (!isPlainObject(obj)) {
        return false;
    }
    const keys = Reflect.ownKeys(obj);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = obj[key];
        if (typeof key !== 'string') {
            return false;
        }
        if (!isJSONValue(value)) {
            return false;
        }
    }
    return true;
}



;// ./node_modules/es-toolkit/dist/predicate/isLength.mjs
function isLength(value) {
    return Number.isSafeInteger(value) && value >= 0;
}



;// ./node_modules/es-toolkit/dist/predicate/isMap.mjs
function isMap(value) {
    return value instanceof Map;
}



;// ./node_modules/es-toolkit/dist/predicate/isNil.mjs
function isNil(x) {
    return x == null;
}



;// ./node_modules/es-toolkit/dist/predicate/isNode.mjs
/* provided dependency */ var process = __webpack_require__(68827);
function isNode() {
    return typeof process !== 'undefined' && process?.versions?.node != null;
}



;// ./node_modules/es-toolkit/dist/predicate/isNotNil.mjs
function isNotNil(x) {
    return x != null;
}



;// ./node_modules/es-toolkit/dist/predicate/isNull.mjs
function isNull(x) {
    return x === null;
}



;// ./node_modules/es-toolkit/dist/predicate/isPromise.mjs
function isPromise(value) {
    return value instanceof Promise;
}



;// ./node_modules/es-toolkit/dist/predicate/isRegExp.mjs
function isRegExp(value) {
    return value instanceof RegExp;
}



;// ./node_modules/es-toolkit/dist/predicate/isSet.mjs
function isSet(value) {
    return value instanceof Set;
}



;// ./node_modules/es-toolkit/dist/predicate/isString.mjs
function isString(value) {
    return typeof value === 'string';
}



;// ./node_modules/es-toolkit/dist/predicate/isSymbol.mjs
function predicate_isSymbol_isSymbol(value) {
    return typeof value === 'symbol';
}



;// ./node_modules/es-toolkit/dist/predicate/isUndefined.mjs
function isUndefined(x) {
    return x === undefined;
}



;// ./node_modules/es-toolkit/dist/predicate/isWeakMap.mjs
function isWeakMap(value) {
    return value instanceof WeakMap;
}



;// ./node_modules/es-toolkit/dist/predicate/isWeakSet.mjs
function isWeakSet(value) {
    return value instanceof WeakSet;
}



;// ./node_modules/es-toolkit/dist/promise/semaphore.mjs
class semaphore_Semaphore {
    capacity;
    available;
    deferredTasks = [];
    constructor(capacity) {
        this.capacity = capacity;
        this.available = capacity;
    }
    async acquire() {
        if (this.available > 0) {
            this.available--;
            return;
        }
        return new Promise(resolve => {
            this.deferredTasks.push(resolve);
        });
    }
    release() {
        const deferredTask = this.deferredTasks.shift();
        if (deferredTask != null) {
            deferredTask();
            return;
        }
        if (this.available < this.capacity) {
            this.available++;
        }
    }
}



;// ./node_modules/es-toolkit/dist/promise/mutex.mjs


class Mutex {
    semaphore = new Semaphore(1);
    get isLocked() {
        return this.semaphore.available === 0;
    }
    async acquire() {
        return this.semaphore.acquire();
    }
    release() {
        this.semaphore.release();
    }
}



;// ./node_modules/es-toolkit/dist/promise/timeout.mjs



async function timeout_timeout(ms) {
    await delay(ms);
    throw new TimeoutError();
}



;// ./node_modules/es-toolkit/dist/promise/withTimeout.mjs


async function withTimeout(run, ms) {
    return Promise.race([run(), timeout(ms)]);
}



;// ./node_modules/es-toolkit/dist/string/constantCase.mjs


function constantCase(str) {
    const words$1 = words(str);
    return words$1.map(word => word.toUpperCase()).join('_');
}



;// ./node_modules/es-toolkit/dist/string/deburr.mjs
const deburrMap = new Map(Object.entries({
    Æ: 'Ae',
    Ð: 'D',
    Ø: 'O',
    Þ: 'Th',
    ß: 'ss',
    æ: 'ae',
    ð: 'd',
    ø: 'o',
    þ: 'th',
    Đ: 'D',
    đ: 'd',
    Ħ: 'H',
    ħ: 'h',
    ı: 'i',
    Ĳ: 'IJ',
    ĳ: 'ij',
    ĸ: 'k',
    Ŀ: 'L',
    ŀ: 'l',
    Ł: 'L',
    ł: 'l',
    ŉ: "'n",
    Ŋ: 'N',
    ŋ: 'n',
    Œ: 'Oe',
    œ: 'oe',
    Ŧ: 'T',
    ŧ: 't',
    ſ: 's',
}));
function deburr(str) {
    str = str.normalize('NFD');
    let result = '';
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if ((char >= '\u0300' && char <= '\u036f') || (char >= '\ufe20' && char <= '\ufe23')) {
            continue;
        }
        result += deburrMap.get(char) ?? char;
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/string/escape.mjs
const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};
function escape_escape(str) {
    return str.replace(/[&<>"']/g, match => htmlEscapes[match]);
}



;// ./node_modules/es-toolkit/dist/string/escapeRegExp.mjs
function escapeRegExp(str) {
    return str.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}



;// ./node_modules/es-toolkit/dist/string/kebabCase.mjs


function kebabCase(str) {
    const words$1 = words(str);
    return words$1.map(word => word.toLowerCase()).join('-');
}



;// ./node_modules/es-toolkit/dist/string/lowerCase.mjs


function lowerCase(str) {
    const words$1 = words(str);
    return words$1.map(word => word.toLowerCase()).join(' ');
}



;// ./node_modules/es-toolkit/dist/string/lowerFirst.mjs
function lowerFirst(str) {
    return str.substring(0, 1).toLowerCase() + str.substring(1);
}



;// ./node_modules/es-toolkit/dist/string/pad.mjs
function pad(str, length, chars = ' ') {
    return str.padStart(Math.floor((length - str.length) / 2) + str.length, chars).padEnd(length, chars);
}



;// ./node_modules/es-toolkit/dist/string/pascalCase.mjs



function pascalCase(str) {
    const words$1 = words(str);
    return words$1.map(word => capitalize(word)).join('');
}



;// ./node_modules/es-toolkit/dist/string/reverseString.mjs
function reverseString(value) {
    return [...value].reverse().join('');
}



;// ./node_modules/es-toolkit/dist/string/startCase.mjs


function startCase(str) {
    const words$1 = words(str.trim());
    let result = '';
    for (let i = 0; i < words$1.length; i++) {
        const word = words$1[i];
        if (result) {
            result += ' ';
        }
        result += word[0].toUpperCase() + word.slice(1).toLowerCase();
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/string/trimEnd.mjs
function trimEnd_trimEnd(str, chars) {
    if (chars === undefined) {
        return str.trimEnd();
    }
    let endIndex = str.length;
    switch (typeof chars) {
        case 'string': {
            if (chars.length !== 1) {
                throw new Error(`The 'chars' parameter should be a single character string.`);
            }
            while (endIndex > 0 && str[endIndex - 1] === chars) {
                endIndex--;
            }
            break;
        }
        case 'object': {
            while (endIndex > 0 && chars.includes(str[endIndex - 1])) {
                endIndex--;
            }
        }
    }
    return str.substring(0, endIndex);
}



;// ./node_modules/es-toolkit/dist/string/trimStart.mjs
function trimStart_trimStart(str, chars) {
    if (chars === undefined) {
        return str.trimStart();
    }
    let startIndex = 0;
    switch (typeof chars) {
        case 'string': {
            while (startIndex < str.length && str[startIndex] === chars) {
                startIndex++;
            }
            break;
        }
        case 'object': {
            while (startIndex < str.length && chars.includes(str[startIndex])) {
                startIndex++;
            }
        }
    }
    return str.substring(startIndex);
}



;// ./node_modules/es-toolkit/dist/string/trim.mjs



function trim(str, chars) {
    if (chars === undefined) {
        return str.trim();
    }
    return trimStart(trimEnd(str, chars), chars);
}



;// ./node_modules/es-toolkit/dist/string/unescape.mjs
const htmlUnescapes = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
};
function unescape_unescape(str) {
    return str.replace(/&(?:amp|lt|gt|quot|#(0+)?39);/g, match => htmlUnescapes[match] || "'");
}



;// ./node_modules/es-toolkit/dist/string/upperCase.mjs


function upperCase(str) {
    const words$1 = words(str);
    let result = '';
    for (let i = 0; i < words$1.length; i++) {
        result += words$1[i].toUpperCase();
        if (i < words$1.length - 1) {
            result += ' ';
        }
    }
    return result;
}



;// ./node_modules/es-toolkit/dist/string/upperFirst.mjs
function upperFirst(str) {
    return str.substring(0, 1).toUpperCase() + str.substring(1);
}



;// ./node_modules/es-toolkit/dist/util/attempt.mjs
function attempt(func) {
    try {
        return [null, func()];
    }
    catch (error) {
        return [error, null];
    }
}



;// ./node_modules/es-toolkit/dist/util/attemptAsync.mjs
async function attemptAsync(func) {
    try {
        const result = await func();
        return [null, result];
    }
    catch (error) {
        return [error, null];
    }
}



;// ./node_modules/es-toolkit/dist/util/invariant.mjs
function invariant(condition, message) {
    if (condition) {
        return;
    }
    if (typeof message === 'string') {
        throw new Error(message);
    }
    throw message;
}



;// ./node_modules/es-toolkit/dist/index.mjs














































































































































































/***/ }),

/***/ 70008:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const debounce$1 = __webpack_require__(76773);

function debounce(func, debounceMs = 0, options = {}) {
    if (typeof options !== 'object') {
        options = {};
    }
    const { leading = false, trailing = true, maxWait } = options;
    const edges = Array(2);
    if (leading) {
        edges[0] = 'leading';
    }
    if (trailing) {
        edges[1] = 'trailing';
    }
    let result = undefined;
    let pendingAt = null;
    const _debounced = debounce$1.debounce(function (...args) {
        result = func.apply(this, args);
        pendingAt = null;
    }, debounceMs, { edges });
    const debounced = function (...args) {
        if (maxWait != null) {
            if (pendingAt === null) {
                pendingAt = Date.now();
            }
            if (Date.now() - pendingAt >= maxWait) {
                result = func.apply(this, args);
                pendingAt = Date.now();
                _debounced.cancel();
                _debounced.schedule();
                return result;
            }
        }
        _debounced.apply(this, args);
        return result;
    };
    const flush = () => {
        _debounced.flush();
        return result;
    };
    debounced.cancel = _debounced.cancel;
    debounced.flush = flush;
    return debounced;
}

exports.debounce = debounce;


/***/ }),

/***/ 70924:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const minBy$1 = __webpack_require__(38240);
const identity = __webpack_require__(14059);
const iteratee = __webpack_require__(5821);

function minBy(items, iteratee$1) {
    if (items == null) {
        return undefined;
    }
    return minBy$1.minBy(Array.from(items), iteratee.iteratee(iteratee$1 ?? identity.identity));
}

exports.minBy = minBy;


/***/ }),

/***/ 73923:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const cloneDeepWith = __webpack_require__(29467);

function cloneDeep(obj) {
    return cloneDeepWith.cloneDeepWith(obj);
}

exports.cloneDeep = cloneDeep;


/***/ }),

/***/ 74297:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(25259).throttle;


/***/ }),

/***/ 75711:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function flatten(arr, depth = 1) {
    const result = [];
    const flooredDepth = Math.floor(depth);
    const recursive = (arr, currentDepth) => {
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if (Array.isArray(item) && currentDepth < flooredDepth) {
                recursive(item, currentDepth + 1);
            }
            else {
                result.push(item);
            }
        }
    };
    recursive(arr, 0);
    return result;
}

exports.flatten = flatten;


/***/ }),

/***/ 76773:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function debounce(func, debounceMs, { signal, edges } = {}) {
    let pendingThis = undefined;
    let pendingArgs = null;
    const leading = edges != null && edges.includes('leading');
    const trailing = edges == null || edges.includes('trailing');
    const invoke = () => {
        if (pendingArgs !== null) {
            func.apply(pendingThis, pendingArgs);
            pendingThis = undefined;
            pendingArgs = null;
        }
    };
    const onTimerEnd = () => {
        if (trailing) {
            invoke();
        }
        cancel();
    };
    let timeoutId = null;
    const schedule = () => {
        if (timeoutId != null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            timeoutId = null;
            onTimerEnd();
        }, debounceMs);
    };
    const cancelTimer = () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };
    const cancel = () => {
        cancelTimer();
        pendingThis = undefined;
        pendingArgs = null;
    };
    const flush = () => {
        invoke();
    };
    const debounced = function (...args) {
        if (signal?.aborted) {
            return;
        }
        pendingThis = this;
        pendingArgs = args;
        const isFirstCall = timeoutId == null;
        schedule();
        if (leading && isFirstCall) {
            invoke();
        }
    };
    debounced.schedule = schedule;
    debounced.cancel = cancel;
    debounced.flush = flush;
    signal?.addEventListener('abort', cancel, { once: true });
    return debounced;
}

exports.debounce = debounce;


/***/ }),

/***/ 77841:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const get = __webpack_require__(54200);
const isUnsafeProperty = __webpack_require__(8193);
const isDeepKey = __webpack_require__(95112);
const toKey = __webpack_require__(21465);
const toPath = __webpack_require__(3025);

function unset(obj, path) {
    if (obj == null) {
        return true;
    }
    switch (typeof path) {
        case 'symbol':
        case 'number':
        case 'object': {
            if (Array.isArray(path)) {
                return unsetWithPath(obj, path);
            }
            if (typeof path === 'number') {
                path = toKey.toKey(path);
            }
            else if (typeof path === 'object') {
                if (Object.is(path?.valueOf(), -0)) {
                    path = '-0';
                }
                else {
                    path = String(path);
                }
            }
            if (isUnsafeProperty.isUnsafeProperty(path)) {
                return false;
            }
            if (obj?.[path] === undefined) {
                return true;
            }
            try {
                delete obj[path];
                return true;
            }
            catch {
                return false;
            }
        }
        case 'string': {
            if (obj?.[path] === undefined && isDeepKey.isDeepKey(path)) {
                return unsetWithPath(obj, toPath.toPath(path));
            }
            if (isUnsafeProperty.isUnsafeProperty(path)) {
                return false;
            }
            try {
                delete obj[path];
                return true;
            }
            catch {
                return false;
            }
        }
    }
}
function unsetWithPath(obj, path) {
    const parent = path.length === 1 ? obj : get.get(obj, path.slice(0, -1));
    const lastKey = path[path.length - 1];
    if (parent?.[lastKey] === undefined) {
        return true;
    }
    if (isUnsafeProperty.isUnsafeProperty(lastKey)) {
        return false;
    }
    try {
        delete parent[lastKey];
        return true;
    }
    catch {
        return false;
    }
}

exports.unset = unset;


/***/ }),

/***/ 78161:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const isArrayLike = __webpack_require__(80058);
const isObjectLike = __webpack_require__(1846);

function isArrayLikeObject(value) {
    return isObjectLike.isObjectLike(value) && isArrayLike.isArrayLike(value);
}

exports.isArrayLikeObject = isArrayLikeObject;


/***/ }),

/***/ 80058:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const isLength = __webpack_require__(59181);

function isArrayLike(value) {
    return value != null && typeof value !== 'function' && isLength.isLength(value.length);
}

exports.isArrayLike = isArrayLike;


/***/ }),

/***/ 80305:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(54200).get;


/***/ }),

/***/ 82984:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const getTag = __webpack_require__(12049);

function isArguments(value) {
    return value !== null && typeof value === 'object' && getTag.getTag(value) === '[object Arguments]';
}

exports.isArguments = isArguments;


/***/ }),

/***/ 83403:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const get = __webpack_require__(54200);

function property(path) {
    return function (object) {
        return get.get(object, path);
    };
}

exports.property = property;


/***/ }),

/***/ 83908:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function isTypedArray(x) {
    return ArrayBuffer.isView(x) && !(x instanceof DataView);
}

exports.isTypedArray = isTypedArray;


/***/ }),

/***/ 85012:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const isIterateeCall = __webpack_require__(316);
const toFinite = __webpack_require__(44569);

function range(start, end, step) {
    if (step && typeof step !== 'number' && isIterateeCall.isIterateeCall(start, end, step)) {
        end = step = undefined;
    }
    start = toFinite.toFinite(start);
    if (end === undefined) {
        end = start;
        start = 0;
    }
    else {
        end = toFinite.toFinite(end);
    }
    step = step === undefined ? (start < end ? 1 : -1) : toFinite.toFinite(step);
    const length = Math.max(Math.ceil((end - start) / (step || 1)), 0);
    const result = new Array(length);
    for (let index = 0; index < length; index++) {
        result[index] = start;
        start += step;
    }
    return result;
}

exports.range = range;


/***/ }),

/***/ 86012:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function getSymbols(object) {
    return Object.getOwnPropertySymbols(object).filter(symbol => Object.prototype.propertyIsEnumerable.call(object, symbol));
}

exports.getSymbols = getSymbols;


/***/ }),

/***/ 86761:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function eq(value, other) {
    return value === other || (Number.isNaN(value) && Number.isNaN(other));
}

exports.eq = eq;


/***/ }),

/***/ 88919:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const isSymbol = __webpack_require__(61366);

function toNumber(value) {
    if (isSymbol.isSymbol(value)) {
        return NaN;
    }
    return Number(value);
}

exports.toNumber = toNumber;


/***/ }),

/***/ 90623:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var Buffer = __webpack_require__(42562)["Buffer"];


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function isBuffer(x) {
    return typeof Buffer !== 'undefined' && Buffer.isBuffer(x);
}

exports.isBuffer = isBuffer;


/***/ }),

/***/ 92938:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(48695).isPlainObject;


/***/ }),

/***/ 93667:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const iteratee = __webpack_require__(5821);

function sumBy(array, iteratee$1) {
    if (!array || !array.length) {
        return 0;
    }
    if (iteratee$1 != null) {
        iteratee$1 = iteratee.iteratee(iteratee$1);
    }
    let result = undefined;
    for (let i = 0; i < array.length; i++) {
        const current = iteratee$1 ? iteratee$1(array[i]) : array[i];
        if (current !== undefined) {
            if (result === undefined) {
                result = current;
            }
            else {
                result += current;
            }
        }
    }
    return result;
}

exports.sumBy = sumBy;


/***/ }),

/***/ 93998:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const isSymbol = __webpack_require__(61366);

const regexIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
const regexIsPlainProp = /^\w*$/;
function isKey(value, object) {
    if (Array.isArray(value)) {
        return false;
    }
    if (typeof value === 'number' || typeof value === 'boolean' || value == null || isSymbol.isSymbol(value)) {
        return true;
    }
    return ((typeof value === 'string' && (regexIsPlainProp.test(value) || !regexIsDeepProp.test(value))) ||
        (object != null && Object.hasOwn(object, value)));
}

exports.isKey = isKey;


/***/ }),

/***/ 94338:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(35938).maxBy;


/***/ }),

/***/ 95112:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function isDeepKey(key) {
    switch (typeof key) {
        case 'number':
        case 'symbol': {
            return false;
        }
        case 'string': {
            return key.includes('.') || key.includes('[') || key.includes(']');
        }
    }
}

exports.isDeepKey = isDeepKey;


/***/ }),

/***/ 99184:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const regexpTag = '[object RegExp]';
const stringTag = '[object String]';
const numberTag = '[object Number]';
const booleanTag = '[object Boolean]';
const argumentsTag = '[object Arguments]';
const symbolTag = '[object Symbol]';
const dateTag = '[object Date]';
const mapTag = '[object Map]';
const setTag = '[object Set]';
const arrayTag = '[object Array]';
const functionTag = '[object Function]';
const arrayBufferTag = '[object ArrayBuffer]';
const objectTag = '[object Object]';
const errorTag = '[object Error]';
const dataViewTag = '[object DataView]';
const uint8ArrayTag = '[object Uint8Array]';
const uint8ClampedArrayTag = '[object Uint8ClampedArray]';
const uint16ArrayTag = '[object Uint16Array]';
const uint32ArrayTag = '[object Uint32Array]';
const bigUint64ArrayTag = '[object BigUint64Array]';
const int8ArrayTag = '[object Int8Array]';
const int16ArrayTag = '[object Int16Array]';
const int32ArrayTag = '[object Int32Array]';
const bigInt64ArrayTag = '[object BigInt64Array]';
const float32ArrayTag = '[object Float32Array]';
const float64ArrayTag = '[object Float64Array]';

exports.argumentsTag = argumentsTag;
exports.arrayBufferTag = arrayBufferTag;
exports.arrayTag = arrayTag;
exports.bigInt64ArrayTag = bigInt64ArrayTag;
exports.bigUint64ArrayTag = bigUint64ArrayTag;
exports.booleanTag = booleanTag;
exports.dataViewTag = dataViewTag;
exports.dateTag = dateTag;
exports.errorTag = errorTag;
exports.float32ArrayTag = float32ArrayTag;
exports.float64ArrayTag = float64ArrayTag;
exports.functionTag = functionTag;
exports.int16ArrayTag = int16ArrayTag;
exports.int32ArrayTag = int32ArrayTag;
exports.int8ArrayTag = int8ArrayTag;
exports.mapTag = mapTag;
exports.numberTag = numberTag;
exports.objectTag = objectTag;
exports.regexpTag = regexpTag;
exports.setTag = setTag;
exports.stringTag = stringTag;
exports.symbolTag = symbolTag;
exports.uint16ArrayTag = uint16ArrayTag;
exports.uint32ArrayTag = uint32ArrayTag;
exports.uint8ArrayTag = uint8ArrayTag;
exports.uint8ClampedArrayTag = uint8ClampedArrayTag;


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVuZG9yLWNvbW1vbi01MzZlYWEwMC5lOTQ0ZTFjMjUxNTgxODBkNzhlNC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBYTs7QUFFYixxREFBcUQsaUJBQWlCOztBQUV0RSxnQkFBZ0IsbUJBQU8sQ0FBQyxLQUFjO0FBQ3RDLG9CQUFvQixtQkFBTyxDQUFDLEtBQTZCO0FBQ3pELGlCQUFpQixtQkFBTyxDQUFDLEtBQTBCO0FBQ25ELFdBQVcsbUJBQU8sQ0FBQyxLQUFlOztBQUVsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxzQkFBc0I7Ozs7Ozs7O0FDcEJ0QixrREFBaUU7Ozs7Ozs7OztBQ0FwRDs7QUFFYixxREFBcUQsaUJBQWlCOztBQUV0RTtBQUNBO0FBQ0E7O0FBRUEsb0JBQW9COzs7Ozs7Ozs7QUNSUDs7QUFFYixxREFBcUQsaUJBQWlCOztBQUV0RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxnQkFBZ0I7Ozs7Ozs7OztBQ3JCSDs7QUFFYixxREFBcUQsaUJBQWlCOztBQUV0RSxpQkFBaUIsbUJBQU8sQ0FBQyxJQUFlO0FBQ3hDLGNBQWMsbUJBQU8sQ0FBQyxLQUF1Qjs7QUFFN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDBDQUEwQzs7QUFFMUM7QUFDQTtBQUNBLDBDQUEwQzs7QUFFMUM7QUFDQTtBQUNBLGtCQUFrQixzQkFBc0I7QUFDeEMsa0JBQWtCLHNCQUFzQjtBQUN4QyxrQkFBa0IsU0FBUztBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsNkNB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QTtBQUNBLGdCQUFnQixNQUFNO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxzQ0FBc0M7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsMkNBQTJDO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDO0FBQzdDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0EsVUFBVTtBQUNWOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0Isa0JBQWtCO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLGFBQWE7QUFDNUIsZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLFFBQVE7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixRQUFRO0FBQ3hCLGdCQUFnQixRQUFRO0FBQ3hCLGdCQUFnQixR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QUNBOztBQUVBLGFBQWE7Ozs7Ozs7OztBQzVCQTs7QUFFYixxREFBcUQsaUJBQWlCOztBQUV0RSxpQkFBaUIsbUJBQU8sQ0FBQyxLQUEwQjs7QUFFbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGFBQWE7Ozs7Ozs7O0FDbkJiLGlEQUE4RDs7Ozs7Ozs7O0FDQWpEOztBQUViLHFEQUFxRCxpQkFBaUI7O0FBRXRFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsaUJBQWlCOzs7Ozs7Ozs7QUNoQko7O0FBRWIscURBQXFELGlCQUFpQjs7QUFFdEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxvQkFBb0I7QUFDcEIsc0JBQXNCO0FBQ3RCLGdCQUFnQjtBQUNoQix3QkFBd0I7QUFDeEIseUJBQXlCO0FBQ3pCLGtCQUFrQjtBQUNsQixtQkFBbUI7QUFDbkIsZUFBZTtBQUNmLGdCQUFnQjtBQUNoQix1QkFBdUI7QUFDdkIsdUJBQXVCO0FBQ3ZCLG1CQUFtQjtBQUNuQixxQkFBcUI7QUFDckIscUJBQXFCO0FBQ3JCLG9CQUFvQjtBQUNwQixjQUFjO0FBQ2QsaUJBQWlCO0FBQ2pCLGlCQUFpQjtBQUNqQixpQkFBaUI7QUFDakIsY0FBYztBQUNkLGlCQUFpQjtBQUNqQixpQkFBaUI7QUFDakIsc0JBQXNCO0FBQ3RCLHNCQUFzQjtBQUN0QixxQkFBcUI7QUFDckIsNEJBQTRCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9faW50ZXJuYWwvaXNJdGVyYXRlZUNhbGwuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9jb21wYXQvdW5pcUJ5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9jb21wYXQvcHJlZGljYXRlL2lzT2JqZWN0TGlrZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L3V0aWwvdG9TdHJpbmcuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC91dGlsL3RvUGF0aC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3Qvb2JqZWN0L2Nsb25lRGVlcC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L3V0aWwvaXRlcmF0ZWUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9wcmVkaWNhdGUvbWF0Y2hlcy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvX2ludGVybmFsL2lzVW5zYWZlUHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L3VuaXFCeS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvbWF4QnkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9wcmVkaWNhdGUvaXNUeXBlZEFycmF5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvY29tcGF0L29taXQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9faW50ZXJuYWwvZ2V0VGFnLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvY29tcGF0L21pbkJ5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9mdW5jdGlvbi9pZGVudGl0eS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L2FycmF5L2ZsYXR0ZW4uanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9vYmplY3QvaGFzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9jb21wYXQvX2ludGVybmFsL2lzSW5kZXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9jb21wYXQvbGFzdC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kb21wdXJpZnkvZGlzdC9wdXJpZnkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9hcnJheS9sYXN0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9jb21wYXQvX2ludGVybmFsL3RvS2V5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9jb21wYXQvX2ludGVybmFsL2NvbXBhcmVWYWx1ZXMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9faW50ZXJuYWwvdG9BcnJheS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L2Z1bmN0aW9uL3Rocm90dGxlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9jb21wYXQvb2JqZWN0L2Nsb25lRGVlcFdpdGguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9hcnJheS9vcmRlckJ5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9jb21wYXQvbWF0aC9tYXhCeS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvbWluQnkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9wcmVkaWNhdGUvaXNNYXRjaC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2NvbXBhdC9yYW5nZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L29iamVjdC9vbWl0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9jb21wYXQvdXRpbC90b0Zpbml0ZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L3ByZWRpY2F0ZS9pc09iamVjdC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L19pbnRlcm5hbC9pc1Byb3RvdHlwZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kbmQtY29yZS9kaXN0L3V0aWxzL2pzX3V0aWxzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2RuZC1jb3JlL2Rpc3QvYWN0aW9ucy9kcmFnRHJvcC90eXBlcy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kbmQtY29yZS9kaXN0L2FjdGlvbnMvZHJhZ0Ryb3AvbG9jYWwvc2V0Q2xpZW50T2Zmc2V0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2RuZC1jb3JlL2Rpc3QvYWN0aW9ucy9kcmFnRHJvcC9iZWdpbkRyYWcuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZG5kLWNvcmUvZGlzdC9hY3Rpb25zL2RyYWdEcm9wL2Ryb3AuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZG5kLWNvcmUvZGlzdC9hY3Rpb25zL2RyYWdEcm9wL2VuZERyYWcuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZG5kLWNvcmUvZGlzdC91dGlscy9tYXRjaGVzVHlwZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kbmQtY29yZS9kaXN0L2FjdGlvbnMvZHJhZ0Ryb3AvaG92ZXIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZG5kLWNvcmUvZGlzdC9hY3Rpb25zL2RyYWdEcm9wL3B1Ymxpc2hEcmFnU291cmNlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2RuZC1jb3JlL2Rpc3QvYWN0aW9ucy9kcmFnRHJvcC9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kbmQtY29yZS9kaXN0L2NsYXNzZXMvRHJhZ0Ryb3BNYW5hZ2VySW1wbC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kbmQtY29yZS9kaXN0L3V0aWxzL2Nvb3Jkcy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kbmQtY29yZS9kaXN0L3V0aWxzL2RpcnRpbmVzcy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kbmQtY29yZS9kaXN0L2NsYXNzZXMvRHJhZ0Ryb3BNb25pdG9ySW1wbC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kbmQtY29yZS9kaXN0L2FjdGlvbnMvcmVnaXN0cnkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZG5kLWNvcmUvZGlzdC9jb250cmFjdHMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZG5kLWNvcmUvZGlzdC9pbnRlcmZhY2VzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2RuZC1jb3JlL2Rpc3QvdXRpbHMvZ2V0TmV4dFVuaXF1ZUlkLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2RuZC1jb3JlL2Rpc3QvY2xhc3Nlcy9IYW5kbGVyUmVnaXN0cnlJbXBsLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2RuZC1jb3JlL2Rpc3QvdXRpbHMvZXF1YWxpdHkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZG5kLWNvcmUvZGlzdC9yZWR1Y2Vycy9kaXJ0eUhhbmRsZXJJZHMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZG5kLWNvcmUvZGlzdC9yZWR1Y2Vycy9kcmFnT2Zmc2V0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2RuZC1jb3JlL2Rpc3QvcmVkdWNlcnMvZHJhZ09wZXJhdGlvbi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kbmQtY29yZS9kaXN0L3JlZHVjZXJzL3JlZkNvdW50LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2RuZC1jb3JlL2Rpc3QvcmVkdWNlcnMvc3RhdGVJZC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kbmQtY29yZS9kaXN0L3JlZHVjZXJzL2luZGV4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2RuZC1jb3JlL2Rpc3QvY3JlYXRlRHJhZ0Ryb3BNYW5hZ2VyLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2RuZC1jb3JlL2Rpc3QvaW5kZXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC91dGlsL3RvSW50ZWdlci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L3ByZWRpY2F0ZS9pc1BsYWluT2JqZWN0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9jb21wYXQvb2JqZWN0L2tleXNJbi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L19pbnRlcm5hbC9nZXRTeW1ib2xzSW4uanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9jb21wYXQvc3VtQnkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L3ByZWRpY2F0ZS9pc1ByaW1pdGl2ZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L2FycmF5L3VuaXFCeS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L3ByZWRpY2F0ZS9tYXRjaGVzUHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L29iamVjdC9jbG9uZURlZXBXaXRoLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9jb21wYXQvb2JqZWN0L2dldC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L2FycmF5L3NvcnRCeS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L3ByZWRpY2F0ZS9pc01hdGNoV2l0aC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvcHJlZGljYXRlL2lzTGVuZ3RoLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvY29tcGF0L3NvcnRCeS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvbGFzdC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L3ByZWRpY2F0ZS9pc1N5bWJvbC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L3V0aWwvdGltZXMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L2F0Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvY2h1bmsubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9hcnJheS9jb21wYWN0Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvY291bnRCeS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L2RpZmZlcmVuY2UubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9hcnJheS9kaWZmZXJlbmNlQnkubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9hcnJheS9kaWZmZXJlbmNlV2l0aC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L2Ryb3AubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9hcnJheS9kcm9wUmlnaHQubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9hcnJheS9kcm9wUmlnaHRXaGlsZS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L2Ryb3BXaGlsZS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L2ZpbGwubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9hcnJheS9mbGF0dGVuLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvZmxhdE1hcC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L2ZsYXR0ZW5EZWVwLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvZmxhdE1hcERlZXAubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9hcnJheS9mb3JFYWNoUmlnaHQubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9hcnJheS9ncm91cEJ5Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvaGVhZC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L2luaXRpYWwubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9hcnJheS9pbnRlcnNlY3Rpb24ubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9hcnJheS9pbnRlcnNlY3Rpb25CeS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L2ludGVyc2VjdGlvbldpdGgubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9hcnJheS9pc1N1YnNldC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L2lzU3Vic2V0V2l0aC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L2tleUJ5Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvbGFzdC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L21heEJ5Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvbWluQnkubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9faW50ZXJuYWwvY29tcGFyZVZhbHVlcy5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L29yZGVyQnkubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9hcnJheS9wYXJ0aXRpb24ubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9hcnJheS9wdWxsLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvcHVsbEF0Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvcmVtb3ZlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvc2FtcGxlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvbWF0aC9yYW5kb20ubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9tYXRoL3JhbmRvbUludC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L3NhbXBsZVNpemUubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9hcnJheS9zaHVmZmxlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvc29ydEJ5Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvdGFpbC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9wcmVkaWNhdGUvaXNTeW1ib2wubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9jb21wYXQvdXRpbC90b051bWJlci5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC91dGlsL3RvRmluaXRlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L3V0aWwvdG9JbnRlZ2VyLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvdGFrZS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L3Rha2VSaWdodC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L3Rha2VSaWdodFdoaWxlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvdGFrZVdoaWxlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvdG9GaWxsZWQubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9hcnJheS91bmlxLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvdW5pb24ubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9hcnJheS91bmlxQnkubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9hcnJheS91bmlvbkJ5Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvdW5pcVdpdGgubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9hcnJheS91bmlvbldpdGgubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9hcnJheS91bnppcC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L3VuemlwV2l0aC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L3dpbmRvd2VkLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkvd2l0aG91dC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L3hvci5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L3hvckJ5Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvYXJyYXkveG9yV2l0aC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L3ppcC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L3ppcE9iamVjdC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L3ppcFdpdGgubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9lcnJvci9BYm9ydEVycm9yLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvZXJyb3IvVGltZW91dEVycm9yLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvZnVuY3Rpb24vYWZ0ZXIubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9mdW5jdGlvbi9hcnkubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9mdW5jdGlvbi9hc3luY05vb3AubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9mdW5jdGlvbi9iZWZvcmUubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9mdW5jdGlvbi9jdXJyeS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2Z1bmN0aW9uL2N1cnJ5UmlnaHQubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9mdW5jdGlvbi9kZWJvdW5jZS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2Z1bmN0aW9uL2Zsb3cubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9mdW5jdGlvbi9mbG93UmlnaHQubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9mdW5jdGlvbi9pZGVudGl0eS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2Z1bmN0aW9uL21lbW9pemUubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9mdW5jdGlvbi9uZWdhdGUubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9mdW5jdGlvbi9ub29wLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvZnVuY3Rpb24vb25jZS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2Z1bmN0aW9uL3BhcnRpYWwubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9mdW5jdGlvbi9wYXJ0aWFsUmlnaHQubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9mdW5jdGlvbi9yZXN0Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvcHJvbWlzZS9kZWxheS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2Z1bmN0aW9uL3JldHJ5Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvZnVuY3Rpb24vc3ByZWFkLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvZnVuY3Rpb24vdGhyb3R0bGUubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9mdW5jdGlvbi91bmFyeS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L21hdGgvY2xhbXAubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9tYXRoL2luUmFuZ2UubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9tYXRoL3N1bS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L21hdGgvbWVhbi5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L21hdGgvc3VtQnkubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9tYXRoL21lYW5CeS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L21hdGgvbWVkaWFuLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvbWF0aC9tZWRpYW5CeS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L21hdGgvcmFuZ2UubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9tYXRoL3JhbmdlUmlnaHQubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9tYXRoL3JvdW5kLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvcHJlZGljYXRlL2lzUHJpbWl0aXZlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvcHJlZGljYXRlL2lzVHlwZWRBcnJheS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L29iamVjdC9jbG9uZS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9faW50ZXJuYWwvZ2V0U3ltYm9scy5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9faW50ZXJuYWwvZ2V0VGFnLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L19pbnRlcm5hbC90YWdzLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3Qvb2JqZWN0L2Nsb25lRGVlcFdpdGgubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9vYmplY3QvY2xvbmVEZWVwLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3Qvb2JqZWN0L2ZpbmRLZXkubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9wcmVkaWNhdGUvaXNQbGFpbk9iamVjdC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L29iamVjdC9mbGF0dGVuT2JqZWN0Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3Qvb2JqZWN0L2ludmVydC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L29iamVjdC9tYXBLZXlzLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3Qvb2JqZWN0L21hcFZhbHVlcy5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L19pbnRlcm5hbC9pc1Vuc2FmZVByb3BlcnR5Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3Qvb2JqZWN0L21lcmdlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3Qvb2JqZWN0L21lcmdlV2l0aC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L29iamVjdC9vbWl0Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3Qvb2JqZWN0L29taXRCeS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L29iamVjdC9waWNrLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3Qvb2JqZWN0L3BpY2tCeS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9wcmVkaWNhdGUvaXNBcnJheS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L3N0cmluZy9jYXBpdGFsaXplLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3Qvc3RyaW5nL3dvcmRzLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3Qvc3RyaW5nL2NhbWVsQ2FzZS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L29iamVjdC90b0NhbWVsQ2FzZUtleXMubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9vYmplY3QvdG9NZXJnZWQubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9jb21wYXQvcHJlZGljYXRlL2lzUGxhaW5PYmplY3QubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9zdHJpbmcvc25ha2VDYXNlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3Qvb2JqZWN0L3RvU25ha2VDYXNlS2V5cy5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L3ByZWRpY2F0ZS9pc0FycmF5QnVmZmVyLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvcHJlZGljYXRlL2lzQmxvYi5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L3ByZWRpY2F0ZS9pc0Jvb2xlYW4ubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9wcmVkaWNhdGUvaXNCcm93c2VyLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvcHJlZGljYXRlL2lzQnVmZmVyLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvcHJlZGljYXRlL2lzRGF0ZS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC91dGlsL2VxLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvcHJlZGljYXRlL2lzRXF1YWxXaXRoLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvcHJlZGljYXRlL2lzRXF1YWwubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9wcmVkaWNhdGUvaXNFcnJvci5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L3ByZWRpY2F0ZS9pc0ZpbGUubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9wcmVkaWNhdGUvaXNGdW5jdGlvbi5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L3ByZWRpY2F0ZS9pc0pTT04ubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9wcmVkaWNhdGUvaXNKU09OVmFsdWUubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9wcmVkaWNhdGUvaXNMZW5ndGgubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9wcmVkaWNhdGUvaXNNYXAubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9wcmVkaWNhdGUvaXNOaWwubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9wcmVkaWNhdGUvaXNOb2RlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvcHJlZGljYXRlL2lzTm90TmlsLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvcHJlZGljYXRlL2lzTnVsbC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L3ByZWRpY2F0ZS9pc1Byb21pc2UubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9wcmVkaWNhdGUvaXNSZWdFeHAubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9wcmVkaWNhdGUvaXNTZXQubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9wcmVkaWNhdGUvaXNTdHJpbmcubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9wcmVkaWNhdGUvaXNTeW1ib2wubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9wcmVkaWNhdGUvaXNVbmRlZmluZWQubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9wcmVkaWNhdGUvaXNXZWFrTWFwLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvcHJlZGljYXRlL2lzV2Vha1NldC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L3Byb21pc2Uvc2VtYXBob3JlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvcHJvbWlzZS9tdXRleC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L3Byb21pc2UvdGltZW91dC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L3Byb21pc2Uvd2l0aFRpbWVvdXQubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9zdHJpbmcvY29uc3RhbnRDYXNlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3Qvc3RyaW5nL2RlYnVyci5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L3N0cmluZy9lc2NhcGUubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9zdHJpbmcvZXNjYXBlUmVnRXhwLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3Qvc3RyaW5nL2tlYmFiQ2FzZS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L3N0cmluZy9sb3dlckNhc2UubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9zdHJpbmcvbG93ZXJGaXJzdC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L3N0cmluZy9wYWQubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9zdHJpbmcvcGFzY2FsQ2FzZS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L3N0cmluZy9yZXZlcnNlU3RyaW5nLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3Qvc3RyaW5nL3N0YXJ0Q2FzZS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L3N0cmluZy90cmltRW5kLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3Qvc3RyaW5nL3RyaW1TdGFydC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L3N0cmluZy90cmltLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3Qvc3RyaW5nL3VuZXNjYXBlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3Qvc3RyaW5nL3VwcGVyQ2FzZS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L3N0cmluZy91cHBlckZpcnN0Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvdXRpbC9hdHRlbXB0Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvdXRpbC9hdHRlbXB0QXN5bmMubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC91dGlsL2ludmFyaWFudC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2luZGV4Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L2Z1bmN0aW9uL2RlYm91bmNlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9jb21wYXQvbWF0aC9taW5CeS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L29iamVjdC9jbG9uZURlZXAuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9jb21wYXQvdGhyb3R0bGUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2FycmF5L2ZsYXR0ZW4uanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2Z1bmN0aW9uL2RlYm91bmNlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9jb21wYXQvb2JqZWN0L3Vuc2V0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9jb21wYXQvcHJlZGljYXRlL2lzQXJyYXlMaWtlT2JqZWN0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9jb21wYXQvcHJlZGljYXRlL2lzQXJyYXlMaWtlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvY29tcGF0L2dldC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L3ByZWRpY2F0ZS9pc0FyZ3VtZW50cy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L29iamVjdC9wcm9wZXJ0eS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvcHJlZGljYXRlL2lzVHlwZWRBcnJheS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L21hdGgvcmFuZ2UuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9faW50ZXJuYWwvZ2V0U3ltYm9scy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L3V0aWwvZXEuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC91dGlsL3RvTnVtYmVyLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9wcmVkaWNhdGUvaXNCdWZmZXIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9jb21wYXQvaXNQbGFpbk9iamVjdC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L21hdGgvc3VtQnkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9faW50ZXJuYWwvaXNLZXkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9jb21wYXQvbWF4QnkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9faW50ZXJuYWwvaXNEZWVwS2V5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9jb21wYXQvX2ludGVybmFsL3RhZ3MuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuY29uc3QgaXNJbmRleCA9IHJlcXVpcmUoJy4vaXNJbmRleC5qcycpO1xuY29uc3QgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuLi9wcmVkaWNhdGUvaXNBcnJheUxpa2UuanMnKTtcbmNvbnN0IGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vcHJlZGljYXRlL2lzT2JqZWN0LmpzJyk7XG5jb25zdCBlcSA9IHJlcXVpcmUoJy4uL3V0aWwvZXEuanMnKTtcblxuZnVuY3Rpb24gaXNJdGVyYXRlZUNhbGwodmFsdWUsIGluZGV4LCBvYmplY3QpIHtcbiAgICBpZiAoIWlzT2JqZWN0LmlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoKHR5cGVvZiBpbmRleCA9PT0gJ251bWJlcicgJiYgaXNBcnJheUxpa2UuaXNBcnJheUxpa2Uob2JqZWN0KSAmJiBpc0luZGV4LmlzSW5kZXgoaW5kZXgpICYmIGluZGV4IDwgb2JqZWN0Lmxlbmd0aCkgfHxcbiAgICAgICAgKHR5cGVvZiBpbmRleCA9PT0gJ3N0cmluZycgJiYgaW5kZXggaW4gb2JqZWN0KSkge1xuICAgICAgICByZXR1cm4gZXEuZXEob2JqZWN0W2luZGV4XSwgdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydHMuaXNJdGVyYXRlZUNhbGwgPSBpc0l0ZXJhdGVlQ2FsbDtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vZGlzdC9jb21wYXQvYXJyYXkvdW5pcUJ5LmpzJykudW5pcUJ5O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGw7XG59XG5cbmV4cG9ydHMuaXNPYmplY3RMaWtlID0gaXNPYmplY3RMaWtlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuZnVuY3Rpb24gdG9TdHJpbmcodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS5tYXAodG9TdHJpbmcpLmpvaW4oJywnKTtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0ID0gU3RyaW5nKHZhbHVlKTtcbiAgICBpZiAocmVzdWx0ID09PSAnMCcgJiYgT2JqZWN0LmlzKE51bWJlcih2YWx1ZSksIC0wKSkge1xuICAgICAgICByZXR1cm4gJy0wJztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0cy50b1N0cmluZyA9IHRvU3RyaW5nO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuY29uc3QgdG9TdHJpbmcgPSByZXF1aXJlKCcuL3RvU3RyaW5nLmpzJyk7XG5jb25zdCB0b0tleSA9IHJlcXVpcmUoJy4uL19pbnRlcm5hbC90b0tleS5qcycpO1xuXG5mdW5jdGlvbiB0b1BhdGgoZGVlcEtleSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGRlZXBLZXkpKSB7XG4gICAgICAgIHJldHVybiBkZWVwS2V5Lm1hcCh0b0tleS50b0tleSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgZGVlcEtleSA9PT0gJ3N5bWJvbCcpIHtcbiAgICAgICAgcmV0dXJuIFtkZWVwS2V5XTtcbiAgICB9XG4gICAgZGVlcEtleSA9IHRvU3RyaW5nLnRvU3RyaW5nKGRlZXBLZXkpO1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGNvbnN0IGxlbmd0aCA9IGRlZXBLZXkubGVuZ3RoO1xuICAgIGlmIChsZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgbGV0IGluZGV4ID0gMDtcbiAgICBsZXQga2V5ID0gJyc7XG4gICAgbGV0IHF1b3RlQ2hhciA9ICcnO1xuICAgIGxldCBicmFja2V0ID0gZmFsc2U7XG4gICAgaWYgKGRlZXBLZXkuY2hhckNvZGVBdCgwKSA9PT0gNDYpIHtcbiAgICAgICAgcmVzdWx0LnB1c2goJycpO1xuICAgICAgICBpbmRleCsrO1xuICAgIH1cbiAgICB3aGlsZSAoaW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgY29uc3QgY2hhciA9IGRlZXBLZXlbaW5kZXhdO1xuICAgICAgICBpZiAocXVvdGVDaGFyKSB7XG4gICAgICAgICAgICBpZiAoY2hhciA9PT0gJ1xcXFwnICYmIGluZGV4ICsgMSA8IGxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAga2V5ICs9IGRlZXBLZXlbaW5kZXhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hhciA9PT0gcXVvdGVDaGFyKSB7XG4gICAgICAgICAgICAgICAgcXVvdGVDaGFyID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBrZXkgKz0gY2hhcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChicmFja2V0KSB7XG4gICAgICAgICAgICBpZiAoY2hhciA9PT0gJ1wiJyB8fCBjaGFyID09PSBcIidcIikge1xuICAgICAgICAgICAgICAgIHF1b3RlQ2hhciA9IGNoYXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGFyID09PSAnXScpIHtcbiAgICAgICAgICAgICAgICBicmFja2V0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICAgICAgICAgICAgICBrZXkgPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGtleSArPSBjaGFyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNoYXIgPT09ICdbJykge1xuICAgICAgICAgICAgICAgIGJyYWNrZXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hhciA9PT0gJy4nKSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgICAgICBrZXkgPSAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBrZXkgKz0gY2hhcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpbmRleCsrO1xuICAgIH1cbiAgICBpZiAoa2V5KSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydHMudG9QYXRoID0gdG9QYXRoO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuY29uc3QgY2xvbmVEZWVwV2l0aCA9IHJlcXVpcmUoJy4vY2xvbmVEZWVwV2l0aC5qcycpO1xuXG5mdW5jdGlvbiBjbG9uZURlZXAob2JqKSB7XG4gICAgcmV0dXJuIGNsb25lRGVlcFdpdGguY2xvbmVEZWVwV2l0aEltcGwob2JqLCB1bmRlZmluZWQsIG9iaiwgbmV3IE1hcCgpLCB1bmRlZmluZWQpO1xufVxuXG5leHBvcnRzLmNsb25lRGVlcCA9IGNsb25lRGVlcDtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmNvbnN0IGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vLi4vZnVuY3Rpb24vaWRlbnRpdHkuanMnKTtcbmNvbnN0IHByb3BlcnR5ID0gcmVxdWlyZSgnLi4vb2JqZWN0L3Byb3BlcnR5LmpzJyk7XG5jb25zdCBtYXRjaGVzID0gcmVxdWlyZSgnLi4vcHJlZGljYXRlL21hdGNoZXMuanMnKTtcbmNvbnN0IG1hdGNoZXNQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uL3ByZWRpY2F0ZS9tYXRjaGVzUHJvcGVydHkuanMnKTtcblxuZnVuY3Rpb24gaXRlcmF0ZWUodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gaWRlbnRpdHkuaWRlbnRpdHk7XG4gICAgfVxuICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICAgIGNhc2UgJ2Z1bmN0aW9uJzoge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ29iamVjdCc6IHtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2hlc1Byb3BlcnR5Lm1hdGNoZXNQcm9wZXJ0eSh2YWx1ZVswXSwgdmFsdWVbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXMubWF0Y2hlcyh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgY2FzZSAnc3ltYm9sJzpcbiAgICAgICAgY2FzZSAnbnVtYmVyJzoge1xuICAgICAgICAgICAgcmV0dXJuIHByb3BlcnR5LnByb3BlcnR5KHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0cy5pdGVyYXRlZSA9IGl0ZXJhdGVlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuY29uc3QgaXNNYXRjaCA9IHJlcXVpcmUoJy4vaXNNYXRjaC5qcycpO1xuY29uc3QgY2xvbmVEZWVwID0gcmVxdWlyZSgnLi4vLi4vb2JqZWN0L2Nsb25lRGVlcC5qcycpO1xuXG5mdW5jdGlvbiBtYXRjaGVzKHNvdXJjZSkge1xuICAgIHNvdXJjZSA9IGNsb25lRGVlcC5jbG9uZURlZXAoc291cmNlKTtcbiAgICByZXR1cm4gKHRhcmdldCkgPT4ge1xuICAgICAgICByZXR1cm4gaXNNYXRjaC5pc01hdGNoKHRhcmdldCwgc291cmNlKTtcbiAgICB9O1xufVxuXG5leHBvcnRzLm1hdGNoZXMgPSBtYXRjaGVzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuZnVuY3Rpb24gaXNVbnNhZmVQcm9wZXJ0eShrZXkpIHtcbiAgICByZXR1cm4ga2V5ID09PSAnX19wcm90b19fJztcbn1cblxuZXhwb3J0cy5pc1Vuc2FmZVByb3BlcnR5ID0gaXNVbnNhZmVQcm9wZXJ0eTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmZ1bmN0aW9uIHVuaXFCeShhcnIsIG1hcHBlcikge1xuICAgIGNvbnN0IG1hcCA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBpdGVtID0gYXJyW2ldO1xuICAgICAgICBjb25zdCBrZXkgPSBtYXBwZXIoaXRlbSk7XG4gICAgICAgIGlmICghbWFwLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICBtYXAuc2V0KGtleSwgaXRlbSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIEFycmF5LmZyb20obWFwLnZhbHVlcygpKTtcbn1cblxuZXhwb3J0cy51bmlxQnkgPSB1bmlxQnk7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXG5mdW5jdGlvbiBtYXhCeShpdGVtcywgZ2V0VmFsdWUpIHtcbiAgICBpZiAoaXRlbXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGxldCBtYXhFbGVtZW50ID0gaXRlbXNbMF07XG4gICAgbGV0IG1heCA9IGdldFZhbHVlKG1heEVsZW1lbnQpO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGl0ZW1zW2ldO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGdldFZhbHVlKGVsZW1lbnQpO1xuICAgICAgICBpZiAodmFsdWUgPiBtYXgpIHtcbiAgICAgICAgICAgIG1heCA9IHZhbHVlO1xuICAgICAgICAgICAgbWF4RWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1heEVsZW1lbnQ7XG59XG5cbmV4cG9ydHMubWF4QnkgPSBtYXhCeTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmNvbnN0IGlzVHlwZWRBcnJheSQxID0gcmVxdWlyZSgnLi4vLi4vcHJlZGljYXRlL2lzVHlwZWRBcnJheS5qcycpO1xuXG5mdW5jdGlvbiBpc1R5cGVkQXJyYXkoeCkge1xuICAgIHJldHVybiBpc1R5cGVkQXJyYXkkMS5pc1R5cGVkQXJyYXkoeCk7XG59XG5cbmV4cG9ydHMuaXNUeXBlZEFycmF5ID0gaXNUeXBlZEFycmF5O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9kaXN0L2NvbXBhdC9vYmplY3Qvb21pdC5qcycpLm9taXQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXG5mdW5jdGlvbiBnZXRUYWcodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/ICdbb2JqZWN0IFVuZGVmaW5lZF0nIDogJ1tvYmplY3QgTnVsbF0nO1xuICAgIH1cbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcbn1cblxuZXhwb3J0cy5nZXRUYWcgPSBnZXRUYWc7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL2Rpc3QvY29tcGF0L21hdGgvbWluQnkuanMnKS5taW5CeTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmZ1bmN0aW9uIGlkZW50aXR5KHgpIHtcbiAgICByZXR1cm4geDtcbn1cblxuZXhwb3J0cy5pZGVudGl0eSA9IGlkZW50aXR5O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuY29uc3QgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuLi9wcmVkaWNhdGUvaXNBcnJheUxpa2UuanMnKTtcblxuZnVuY3Rpb24gZmxhdHRlbih2YWx1ZSwgZGVwdGggPSAxKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgY29uc3QgZmxvb3JlZERlcHRoID0gTWF0aC5mbG9vcihkZXB0aCk7XG4gICAgaWYgKCFpc0FycmF5TGlrZS5pc0FycmF5TGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgY29uc3QgcmVjdXJzaXZlID0gKGFyciwgY3VycmVudERlcHRoKSA9PiB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gYXJyW2ldO1xuICAgICAgICAgICAgaWYgKGN1cnJlbnREZXB0aCA8IGZsb29yZWREZXB0aCAmJlxuICAgICAgICAgICAgICAgIChBcnJheS5pc0FycmF5KGl0ZW0pIHx8XG4gICAgICAgICAgICAgICAgICAgIEJvb2xlYW4oaXRlbT8uW1N5bWJvbC5pc0NvbmNhdFNwcmVhZGFibGVdKSB8fFxuICAgICAgICAgICAgICAgICAgICAoaXRlbSAhPT0gbnVsbCAmJiB0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGl0ZW0pID09PSAnW29iamVjdCBBcmd1bWVudHNdJykpKSB7XG4gICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVjdXJzaXZlKGl0ZW0sIGN1cnJlbnREZXB0aCArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVjdXJzaXZlKEFycmF5LmZyb20oaXRlbSksIGN1cnJlbnREZXB0aCArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICByZWN1cnNpdmUoQXJyYXkuZnJvbSh2YWx1ZSksIDApO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydHMuZmxhdHRlbiA9IGZsYXR0ZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXG5jb25zdCBpc0RlZXBLZXkgPSByZXF1aXJlKCcuLi9faW50ZXJuYWwvaXNEZWVwS2V5LmpzJyk7XG5jb25zdCBpc0luZGV4ID0gcmVxdWlyZSgnLi4vX2ludGVybmFsL2lzSW5kZXguanMnKTtcbmNvbnN0IGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi4vcHJlZGljYXRlL2lzQXJndW1lbnRzLmpzJyk7XG5jb25zdCB0b1BhdGggPSByZXF1aXJlKCcuLi91dGlsL3RvUGF0aC5qcycpO1xuXG5mdW5jdGlvbiBoYXMob2JqZWN0LCBwYXRoKSB7XG4gICAgbGV0IHJlc29sdmVkUGF0aDtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShwYXRoKSkge1xuICAgICAgICByZXNvbHZlZFBhdGggPSBwYXRoO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycgJiYgaXNEZWVwS2V5LmlzRGVlcEtleShwYXRoKSAmJiBvYmplY3Q/LltwYXRoXSA9PSBudWxsKSB7XG4gICAgICAgIHJlc29sdmVkUGF0aCA9IHRvUGF0aC50b1BhdGgocGF0aCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXNvbHZlZFBhdGggPSBbcGF0aF07XG4gICAgfVxuICAgIGlmIChyZXNvbHZlZFBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgbGV0IGN1cnJlbnQgPSBvYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXNvbHZlZFBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qga2V5ID0gcmVzb2x2ZWRQYXRoW2ldO1xuICAgICAgICBpZiAoY3VycmVudCA9PSBudWxsIHx8ICFPYmplY3QuaGFzT3duKGN1cnJlbnQsIGtleSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGlzU3BhcnNlSW5kZXggPSAoQXJyYXkuaXNBcnJheShjdXJyZW50KSB8fCBpc0FyZ3VtZW50cy5pc0FyZ3VtZW50cyhjdXJyZW50KSkgJiYgaXNJbmRleC5pc0luZGV4KGtleSkgJiYga2V5IDwgY3VycmVudC5sZW5ndGg7XG4gICAgICAgICAgICBpZiAoIWlzU3BhcnNlSW5kZXgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnRba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydHMuaGFzID0gaGFzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuY29uc3QgSVNfVU5TSUdORURfSU5URUdFUiA9IC9eKD86MHxbMS05XVxcZCopJC87XG5mdW5jdGlvbiBpc0luZGV4KHZhbHVlLCBsZW5ndGggPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUikge1xuICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICAgIGNhc2UgJ251bWJlcic6IHtcbiAgICAgICAgICAgIHJldHVybiBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSAmJiB2YWx1ZSA+PSAwICYmIHZhbHVlIDwgbGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3N5bWJvbCc6IHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdzdHJpbmcnOiB7XG4gICAgICAgICAgICByZXR1cm4gSVNfVU5TSUdORURfSU5URUdFUi50ZXN0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0cy5pc0luZGV4ID0gaXNJbmRleDtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vZGlzdC9jb21wYXQvYXJyYXkvbGFzdC5qcycpLmxhc3Q7XG4iLCIvKiEgQGxpY2Vuc2UgRE9NUHVyaWZ5IDIuNS44IHwgKGMpIEN1cmU1MyBhbmQgb3RoZXIgY29udHJpYnV0b3JzIHwgUmVsZWFzZWQgdW5kZXIgdGhlIEFwYWNoZSBsaWNlbnNlIDIuMCBhbmQgTW96aWxsYSBQdWJsaWMgTGljZW5zZSAyLjAgfCBnaXRodWIuY29tL2N1cmU1My9ET01QdXJpZnkvYmxvYi8yLjUuOC9MSUNFTlNFICovXG5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgKGdsb2JhbCA9IHR5cGVvZiBnbG9iYWxUaGlzICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbFRoaXMgOiBnbG9iYWwgfHwgc2VsZiwgZ2xvYmFsLkRPTVB1cmlmeSA9IGZhY3RvcnkoKSk7XG59KSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbiAgZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgICBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7XG5cbiAgICByZXR1cm4gX3R5cGVvZiA9IFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgU3ltYm9sICYmIFwic3ltYm9sXCIgPT0gdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA/IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygb2JqO1xuICAgIH0gOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgU3ltYm9sICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqO1xuICAgIH0sIF90eXBlb2Yob2JqKTtcbiAgfVxuICBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkge1xuICAgIF9zZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkge1xuICAgICAgby5fX3Byb3RvX18gPSBwO1xuICAgICAgcmV0dXJuIG87XG4gICAgfTtcbiAgICByZXR1cm4gX3NldFByb3RvdHlwZU9mKG8sIHApO1xuICB9XG4gIGZ1bmN0aW9uIF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSB7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcInVuZGVmaW5lZFwiIHx8ICFSZWZsZWN0LmNvbnN0cnVjdCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChSZWZsZWN0LmNvbnN0cnVjdC5zaGFtKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHR5cGVvZiBQcm94eSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZi5jYWxsKFJlZmxlY3QuY29uc3RydWN0KEJvb2xlYW4sIFtdLCBmdW5jdGlvbiAoKSB7fSkpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBfY29uc3RydWN0KFBhcmVudCwgYXJncywgQ2xhc3MpIHtcbiAgICBpZiAoX2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCgpKSB7XG4gICAgICBfY29uc3RydWN0ID0gUmVmbGVjdC5jb25zdHJ1Y3Q7XG4gICAgfSBlbHNlIHtcbiAgICAgIF9jb25zdHJ1Y3QgPSBmdW5jdGlvbiBfY29uc3RydWN0KFBhcmVudCwgYXJncywgQ2xhc3MpIHtcbiAgICAgICAgdmFyIGEgPSBbbnVsbF07XG4gICAgICAgIGEucHVzaC5hcHBseShhLCBhcmdzKTtcbiAgICAgICAgdmFyIENvbnN0cnVjdG9yID0gRnVuY3Rpb24uYmluZC5hcHBseShQYXJlbnQsIGEpO1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgQ29uc3RydWN0b3IoKTtcbiAgICAgICAgaWYgKENsYXNzKSBfc2V0UHJvdG90eXBlT2YoaW5zdGFuY2UsIENsYXNzLnByb3RvdHlwZSk7XG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBfY29uc3RydWN0LmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gIH1cbiAgZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikge1xuICAgIHJldHVybiBfYXJyYXlXaXRob3V0SG9sZXMoYXJyKSB8fCBfaXRlcmFibGVUb0FycmF5KGFycikgfHwgX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KGFycikgfHwgX25vbkl0ZXJhYmxlU3ByZWFkKCk7XG4gIH1cbiAgZnVuY3Rpb24gX2FycmF5V2l0aG91dEhvbGVzKGFycikge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFycikpIHJldHVybiBfYXJyYXlMaWtlVG9BcnJheShhcnIpO1xuICB9XG4gIGZ1bmN0aW9uIF9pdGVyYWJsZVRvQXJyYXkoaXRlcikge1xuICAgIGlmICh0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIGl0ZXJbU3ltYm9sLml0ZXJhdG9yXSAhPSBudWxsIHx8IGl0ZXJbXCJAQGl0ZXJhdG9yXCJdICE9IG51bGwpIHJldHVybiBBcnJheS5mcm9tKGl0ZXIpO1xuICB9XG4gIGZ1bmN0aW9uIF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShvLCBtaW5MZW4pIHtcbiAgICBpZiAoIW8pIHJldHVybjtcbiAgICBpZiAodHlwZW9mIG8gPT09IFwic3RyaW5nXCIpIHJldHVybiBfYXJyYXlMaWtlVG9BcnJheShvLCBtaW5MZW4pO1xuICAgIHZhciBuID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLnNsaWNlKDgsIC0xKTtcbiAgICBpZiAobiA9PT0gXCJPYmplY3RcIiAmJiBvLmNvbnN0cnVjdG9yKSBuID0gby5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIGlmIChuID09PSBcIk1hcFwiIHx8IG4gPT09IFwiU2V0XCIpIHJldHVybiBBcnJheS5mcm9tKG8pO1xuICAgIGlmIChuID09PSBcIkFyZ3VtZW50c1wiIHx8IC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pKSByZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTtcbiAgfVxuICBmdW5jdGlvbiBfYXJyYXlMaWtlVG9BcnJheShhcnIsIGxlbikge1xuICAgIGlmIChsZW4gPT0gbnVsbCB8fCBsZW4gPiBhcnIubGVuZ3RoKSBsZW4gPSBhcnIubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwLCBhcnIyID0gbmV3IEFycmF5KGxlbik7IGkgPCBsZW47IGkrKykgYXJyMltpXSA9IGFycltpXTtcbiAgICByZXR1cm4gYXJyMjtcbiAgfVxuICBmdW5jdGlvbiBfbm9uSXRlcmFibGVTcHJlYWQoKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBzcHJlYWQgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIik7XG4gIH1cblxuICB2YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QuaGFzT3duUHJvcGVydHksXG4gICAgc2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YsXG4gICAgaXNGcm96ZW4gPSBPYmplY3QuaXNGcm96ZW4sXG4gICAgZ2V0UHJvdG90eXBlT2YgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YsXG4gICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbiAgdmFyIGZyZWV6ZSA9IE9iamVjdC5mcmVlemUsXG4gICAgc2VhbCA9IE9iamVjdC5zZWFsLFxuICAgIGNyZWF0ZSA9IE9iamVjdC5jcmVhdGU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgaW1wb3J0L25vLW11dGFibGUtZXhwb3J0c1xuICB2YXIgX3JlZiA9IHR5cGVvZiBSZWZsZWN0ICE9PSAndW5kZWZpbmVkJyAmJiBSZWZsZWN0LFxuICAgIGFwcGx5ID0gX3JlZi5hcHBseSxcbiAgICBjb25zdHJ1Y3QgPSBfcmVmLmNvbnN0cnVjdDtcbiAgaWYgKCFhcHBseSkge1xuICAgIGFwcGx5ID0gZnVuY3Rpb24gYXBwbHkoZnVuLCB0aGlzVmFsdWUsIGFyZ3MpIHtcbiAgICAgIHJldHVybiBmdW4uYXBwbHkodGhpc1ZhbHVlLCBhcmdzKTtcbiAgICB9O1xuICB9XG4gIGlmICghZnJlZXplKSB7XG4gICAgZnJlZXplID0gZnVuY3Rpb24gZnJlZXplKHgpIHtcbiAgICAgIHJldHVybiB4O1xuICAgIH07XG4gIH1cbiAgaWYgKCFzZWFsKSB7XG4gICAgc2VhbCA9IGZ1bmN0aW9uIHNlYWwoeCkge1xuICAgICAgcmV0dXJuIHg7XG4gICAgfTtcbiAgfVxuICBpZiAoIWNvbnN0cnVjdCkge1xuICAgIGNvbnN0cnVjdCA9IGZ1bmN0aW9uIGNvbnN0cnVjdChGdW5jLCBhcmdzKSB7XG4gICAgICByZXR1cm4gX2NvbnN0cnVjdChGdW5jLCBfdG9Db25zdW1hYmxlQXJyYXkoYXJncykpO1xuICAgIH07XG4gIH1cbiAgdmFyIGFycmF5Rm9yRWFjaCA9IHVuYXBwbHkoQXJyYXkucHJvdG90eXBlLmZvckVhY2gpO1xuICB2YXIgYXJyYXlQb3AgPSB1bmFwcGx5KEFycmF5LnByb3RvdHlwZS5wb3ApO1xuICB2YXIgYXJyYXlQdXNoID0gdW5hcHBseShBcnJheS5wcm90b3R5cGUucHVzaCk7XG4gIHZhciBzdHJpbmdUb0xvd2VyQ2FzZSA9IHVuYXBwbHkoU3RyaW5nLnByb3RvdHlwZS50b0xvd2VyQ2FzZSk7XG4gIHZhciBzdHJpbmdUb1N0cmluZyA9IHVuYXBwbHkoU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyk7XG4gIHZhciBzdHJpbmdNYXRjaCA9IHVuYXBwbHkoU3RyaW5nLnByb3RvdHlwZS5tYXRjaCk7XG4gIHZhciBzdHJpbmdSZXBsYWNlID0gdW5hcHBseShTdHJpbmcucHJvdG90eXBlLnJlcGxhY2UpO1xuICB2YXIgc3RyaW5nSW5kZXhPZiA9IHVuYXBwbHkoU3RyaW5nLnByb3RvdHlwZS5pbmRleE9mKTtcbiAgdmFyIHN0cmluZ1RyaW0gPSB1bmFwcGx5KFN0cmluZy5wcm90b3R5cGUudHJpbSk7XG4gIHZhciByZWdFeHBUZXN0ID0gdW5hcHBseShSZWdFeHAucHJvdG90eXBlLnRlc3QpO1xuICB2YXIgdHlwZUVycm9yQ3JlYXRlID0gdW5jb25zdHJ1Y3QoVHlwZUVycm9yKTtcbiAgZnVuY3Rpb24gdW5hcHBseShmdW5jKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0aGlzQXJnKSB7XG4gICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuID4gMSA/IF9sZW4gLSAxIDogMCksIF9rZXkgPSAxOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgIGFyZ3NbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFwcGx5KGZ1bmMsIHRoaXNBcmcsIGFyZ3MpO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gdW5jb25zdHJ1Y3QoZnVuYykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbjIpLCBfa2V5MiA9IDA7IF9rZXkyIDwgX2xlbjI7IF9rZXkyKyspIHtcbiAgICAgICAgYXJnc1tfa2V5Ml0gPSBhcmd1bWVudHNbX2tleTJdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnN0cnVjdChmdW5jLCBhcmdzKTtcbiAgICB9O1xuICB9XG5cbiAgLyogQWRkIHByb3BlcnRpZXMgdG8gYSBsb29rdXAgdGFibGUgKi9cbiAgZnVuY3Rpb24gYWRkVG9TZXQoc2V0LCBhcnJheSwgdHJhbnNmb3JtQ2FzZUZ1bmMpIHtcbiAgICB2YXIgX3RyYW5zZm9ybUNhc2VGdW5jO1xuICAgIHRyYW5zZm9ybUNhc2VGdW5jID0gKF90cmFuc2Zvcm1DYXNlRnVuYyA9IHRyYW5zZm9ybUNhc2VGdW5jKSAhPT0gbnVsbCAmJiBfdHJhbnNmb3JtQ2FzZUZ1bmMgIT09IHZvaWQgMCA/IF90cmFuc2Zvcm1DYXNlRnVuYyA6IHN0cmluZ1RvTG93ZXJDYXNlO1xuICAgIGlmIChzZXRQcm90b3R5cGVPZikge1xuICAgICAgLy8gTWFrZSAnaW4nIGFuZCB0cnV0aHkgY2hlY2tzIGxpa2UgQm9vbGVhbihzZXQuY29uc3RydWN0b3IpXG4gICAgICAvLyBpbmRlcGVuZGVudCBvZiBhbnkgcHJvcGVydGllcyBkZWZpbmVkIG9uIE9iamVjdC5wcm90b3R5cGUuXG4gICAgICAvLyBQcmV2ZW50IHByb3RvdHlwZSBzZXR0ZXJzIGZyb20gaW50ZXJjZXB0aW5nIHNldCBhcyBhIHRoaXMgdmFsdWUuXG4gICAgICBzZXRQcm90b3R5cGVPZihzZXQsIG51bGwpO1xuICAgIH1cbiAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aDtcbiAgICB3aGlsZSAobC0tKSB7XG4gICAgICB2YXIgZWxlbWVudCA9IGFycmF5W2xdO1xuICAgICAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgICB2YXIgbGNFbGVtZW50ID0gdHJhbnNmb3JtQ2FzZUZ1bmMoZWxlbWVudCk7XG4gICAgICAgIGlmIChsY0VsZW1lbnQgIT09IGVsZW1lbnQpIHtcbiAgICAgICAgICAvLyBDb25maWcgcHJlc2V0cyAoZS5nLiB0YWdzLmpzLCBhdHRycy5qcykgYXJlIGltbXV0YWJsZS5cbiAgICAgICAgICBpZiAoIWlzRnJvemVuKGFycmF5KSkge1xuICAgICAgICAgICAgYXJyYXlbbF0gPSBsY0VsZW1lbnQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsZW1lbnQgPSBsY0VsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNldFtlbGVtZW50XSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBzZXQ7XG4gIH1cblxuICAvKiBTaGFsbG93IGNsb25lIGFuIG9iamVjdCAqL1xuICBmdW5jdGlvbiBjbG9uZShvYmplY3QpIHtcbiAgICB2YXIgbmV3T2JqZWN0ID0gY3JlYXRlKG51bGwpO1xuICAgIHZhciBwcm9wZXJ0eTtcbiAgICBmb3IgKHByb3BlcnR5IGluIG9iamVjdCkge1xuICAgICAgaWYgKGFwcGx5KGhhc093blByb3BlcnR5LCBvYmplY3QsIFtwcm9wZXJ0eV0pID09PSB0cnVlKSB7XG4gICAgICAgIG5ld09iamVjdFtwcm9wZXJ0eV0gPSBvYmplY3RbcHJvcGVydHldO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3T2JqZWN0O1xuICB9XG5cbiAgLyogSUUxMCBkb2Vzbid0IHN1cHBvcnQgX19sb29rdXBHZXR0ZXJfXyBzbyBsZXRzJ1xuICAgKiBzaW11bGF0ZSBpdC4gSXQgYWxzbyBhdXRvbWF0aWNhbGx5IGNoZWNrc1xuICAgKiBpZiB0aGUgcHJvcCBpcyBmdW5jdGlvbiBvciBnZXR0ZXIgYW5kIGJlaGF2ZXNcbiAgICogYWNjb3JkaW5nbHkuICovXG4gIGZ1bmN0aW9uIGxvb2t1cEdldHRlcihvYmplY3QsIHByb3ApIHtcbiAgICB3aGlsZSAob2JqZWN0ICE9PSBudWxsKSB7XG4gICAgICB2YXIgZGVzYyA9IGdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3ApO1xuICAgICAgaWYgKGRlc2MpIHtcbiAgICAgICAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgICAgICAgcmV0dXJuIHVuYXBwbHkoZGVzYy5nZXQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZGVzYy52YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHJldHVybiB1bmFwcGx5KGRlc2MudmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBvYmplY3QgPSBnZXRQcm90b3R5cGVPZihvYmplY3QpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBmYWxsYmFja1ZhbHVlKGVsZW1lbnQpIHtcbiAgICAgIGNvbnNvbGUud2FybignZmFsbGJhY2sgdmFsdWUgZm9yJywgZWxlbWVudCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGZhbGxiYWNrVmFsdWU7XG4gIH1cblxuICB2YXIgaHRtbCQxID0gZnJlZXplKFsnYScsICdhYmJyJywgJ2Fjcm9ueW0nLCAnYWRkcmVzcycsICdhcmVhJywgJ2FydGljbGUnLCAnYXNpZGUnLCAnYXVkaW8nLCAnYicsICdiZGknLCAnYmRvJywgJ2JpZycsICdibGluaycsICdibG9ja3F1b3RlJywgJ2JvZHknLCAnYnInLCAnYnV0dG9uJywgJ2NhbnZhcycsICdjYXB0aW9uJywgJ2NlbnRlcicsICdjaXRlJywgJ2NvZGUnLCAnY29sJywgJ2NvbGdyb3VwJywgJ2NvbnRlbnQnLCAnZGF0YScsICdkYXRhbGlzdCcsICdkZCcsICdkZWNvcmF0b3InLCAnZGVsJywgJ2RldGFpbHMnLCAnZGZuJywgJ2RpYWxvZycsICdkaXInLCAnZGl2JywgJ2RsJywgJ2R0JywgJ2VsZW1lbnQnLCAnZW0nLCAnZmllbGRzZXQnLCAnZmlnY2FwdGlvbicsICdmaWd1cmUnLCAnZm9udCcsICdmb290ZXInLCAnZm9ybScsICdoMScsICdoMicsICdoMycsICdoNCcsICdoNScsICdoNicsICdoZWFkJywgJ2hlYWRlcicsICdoZ3JvdXAnLCAnaHInLCAnaHRtbCcsICdpJywgJ2ltZycsICdpbnB1dCcsICdpbnMnLCAna2JkJywgJ2xhYmVsJywgJ2xlZ2VuZCcsICdsaScsICdtYWluJywgJ21hcCcsICdtYXJrJywgJ21hcnF1ZWUnLCAnbWVudScsICdtZW51aXRlbScsICdtZXRlcicsICduYXYnLCAnbm9icicsICdvbCcsICdvcHRncm91cCcsICdvcHRpb24nLCAnb3V0cHV0JywgJ3AnLCAncGljdHVyZScsICdwcmUnLCAncHJvZ3Jlc3MnLCAncScsICdycCcsICdydCcsICdydWJ5JywgJ3MnLCAnc2FtcCcsICdzZWN0aW9uJywgJ3NlbGVjdCcsICdzaGFkb3cnLCAnc21hbGwnLCAnc291cmNlJywgJ3NwYWNlcicsICdzcGFuJywgJ3N0cmlrZScsICdzdHJvbmcnLCAnc3R5bGUnLCAnc3ViJywgJ3N1bW1hcnknLCAnc3VwJywgJ3RhYmxlJywgJ3Rib2R5JywgJ3RkJywgJ3RlbXBsYXRlJywgJ3RleHRhcmVhJywgJ3Rmb290JywgJ3RoJywgJ3RoZWFkJywgJ3RpbWUnLCAndHInLCAndHJhY2snLCAndHQnLCAndScsICd1bCcsICd2YXInLCAndmlkZW8nLCAnd2JyJ10pO1xuXG4gIC8vIFNWR1xuICB2YXIgc3ZnJDEgPSBmcmVlemUoWydzdmcnLCAnYScsICdhbHRnbHlwaCcsICdhbHRnbHlwaGRlZicsICdhbHRnbHlwaGl0ZW0nLCAnYW5pbWF0ZWNvbG9yJywgJ2FuaW1hdGVtb3Rpb24nLCAnYW5pbWF0ZXRyYW5zZm9ybScsICdjaXJjbGUnLCAnY2xpcHBhdGgnLCAnZGVmcycsICdkZXNjJywgJ2VsbGlwc2UnLCAnZmlsdGVyJywgJ2ZvbnQnLCAnZycsICdnbHlwaCcsICdnbHlwaHJlZicsICdoa2VybicsICdpbWFnZScsICdsaW5lJywgJ2xpbmVhcmdyYWRpZW50JywgJ21hcmtlcicsICdtYXNrJywgJ21ldGFkYXRhJywgJ21wYXRoJywgJ3BhdGgnLCAncGF0dGVybicsICdwb2x5Z29uJywgJ3BvbHlsaW5lJywgJ3JhZGlhbGdyYWRpZW50JywgJ3JlY3QnLCAnc3RvcCcsICdzdHlsZScsICdzd2l0Y2gnLCAnc3ltYm9sJywgJ3RleHQnLCAndGV4dHBhdGgnLCAndGl0bGUnLCAndHJlZicsICd0c3BhbicsICd2aWV3JywgJ3ZrZXJuJ10pO1xuICB2YXIgc3ZnRmlsdGVycyA9IGZyZWV6ZShbJ2ZlQmxlbmQnLCAnZmVDb2xvck1hdHJpeCcsICdmZUNvbXBvbmVudFRyYW5zZmVyJywgJ2ZlQ29tcG9zaXRlJywgJ2ZlQ29udm9sdmVNYXRyaXgnLCAnZmVEaWZmdXNlTGlnaHRpbmcnLCAnZmVEaXNwbGFjZW1lbnRNYXAnLCAnZmVEaXN0YW50TGlnaHQnLCAnZmVGbG9vZCcsICdmZUZ1bmNBJywgJ2ZlRnVuY0InLCAnZmVGdW5jRycsICdmZUZ1bmNSJywgJ2ZlR2F1c3NpYW5CbHVyJywgJ2ZlSW1hZ2UnLCAnZmVNZXJnZScsICdmZU1lcmdlTm9kZScsICdmZU1vcnBob2xvZ3knLCAnZmVPZmZzZXQnLCAnZmVQb2ludExpZ2h0JywgJ2ZlU3BlY3VsYXJMaWdodGluZycsICdmZVNwb3RMaWdodCcsICdmZVRpbGUnLCAnZmVUdXJidWxlbmNlJ10pO1xuXG4gIC8vIExpc3Qgb2YgU1ZHIGVsZW1lbnRzIHRoYXQgYXJlIGRpc2FsbG93ZWQgYnkgZGVmYXVsdC5cbiAgLy8gV2Ugc3RpbGwgbmVlZCB0byBrbm93IHRoZW0gc28gdGhhdCB3ZSBjYW4gZG8gbmFtZXNwYWNlXG4gIC8vIGNoZWNrcyBwcm9wZXJseSBpbiBjYXNlIG9uZSB3YW50cyB0byBhZGQgdGhlbSB0b1xuICAvLyBhbGxvdy1saXN0LlxuICB2YXIgc3ZnRGlzYWxsb3dlZCA9IGZyZWV6ZShbJ2FuaW1hdGUnLCAnY29sb3ItcHJvZmlsZScsICdjdXJzb3InLCAnZGlzY2FyZCcsICdmZWRyb3BzaGFkb3cnLCAnZm9udC1mYWNlJywgJ2ZvbnQtZmFjZS1mb3JtYXQnLCAnZm9udC1mYWNlLW5hbWUnLCAnZm9udC1mYWNlLXNyYycsICdmb250LWZhY2UtdXJpJywgJ2ZvcmVpZ25vYmplY3QnLCAnaGF0Y2gnLCAnaGF0Y2hwYXRoJywgJ21lc2gnLCAnbWVzaGdyYWRpZW50JywgJ21lc2hwYXRjaCcsICdtZXNocm93JywgJ21pc3NpbmctZ2x5cGgnLCAnc2NyaXB0JywgJ3NldCcsICdzb2xpZGNvbG9yJywgJ3Vua25vd24nLCAndXNlJ10pO1xuICB2YXIgbWF0aE1sJDEgPSBmcmVlemUoWydtYXRoJywgJ21lbmNsb3NlJywgJ21lcnJvcicsICdtZmVuY2VkJywgJ21mcmFjJywgJ21nbHlwaCcsICdtaScsICdtbGFiZWxlZHRyJywgJ21tdWx0aXNjcmlwdHMnLCAnbW4nLCAnbW8nLCAnbW92ZXInLCAnbXBhZGRlZCcsICdtcGhhbnRvbScsICdtcm9vdCcsICdtcm93JywgJ21zJywgJ21zcGFjZScsICdtc3FydCcsICdtc3R5bGUnLCAnbXN1YicsICdtc3VwJywgJ21zdWJzdXAnLCAnbXRhYmxlJywgJ210ZCcsICdtdGV4dCcsICdtdHInLCAnbXVuZGVyJywgJ211bmRlcm92ZXInXSk7XG5cbiAgLy8gU2ltaWxhcmx5IHRvIFNWRywgd2Ugd2FudCB0byBrbm93IGFsbCBNYXRoTUwgZWxlbWVudHMsXG4gIC8vIGV2ZW4gdGhvc2UgdGhhdCB3ZSBkaXNhbGxvdyBieSBkZWZhdWx0LlxuICB2YXIgbWF0aE1sRGlzYWxsb3dlZCA9IGZyZWV6ZShbJ21hY3Rpb24nLCAnbWFsaWduZ3JvdXAnLCAnbWFsaWdubWFyaycsICdtbG9uZ2RpdicsICdtc2NhcnJpZXMnLCAnbXNjYXJyeScsICdtc2dyb3VwJywgJ21zdGFjaycsICdtc2xpbmUnLCAnbXNyb3cnLCAnc2VtYW50aWNzJywgJ2Fubm90YXRpb24nLCAnYW5ub3RhdGlvbi14bWwnLCAnbXByZXNjcmlwdHMnLCAnbm9uZSddKTtcbiAgdmFyIHRleHQgPSBmcmVlemUoWycjdGV4dCddKTtcblxuICB2YXIgaHRtbCA9IGZyZWV6ZShbJ2FjY2VwdCcsICdhY3Rpb24nLCAnYWxpZ24nLCAnYWx0JywgJ2F1dG9jYXBpdGFsaXplJywgJ2F1dG9jb21wbGV0ZScsICdhdXRvcGljdHVyZWlucGljdHVyZScsICdhdXRvcGxheScsICdiYWNrZ3JvdW5kJywgJ2JnY29sb3InLCAnYm9yZGVyJywgJ2NhcHR1cmUnLCAnY2VsbHBhZGRpbmcnLCAnY2VsbHNwYWNpbmcnLCAnY2hlY2tlZCcsICdjaXRlJywgJ2NsYXNzJywgJ2NsZWFyJywgJ2NvbG9yJywgJ2NvbHMnLCAnY29sc3BhbicsICdjb250cm9scycsICdjb250cm9sc2xpc3QnLCAnY29vcmRzJywgJ2Nyb3Nzb3JpZ2luJywgJ2RhdGV0aW1lJywgJ2RlY29kaW5nJywgJ2RlZmF1bHQnLCAnZGlyJywgJ2Rpc2FibGVkJywgJ2Rpc2FibGVwaWN0dXJlaW5waWN0dXJlJywgJ2Rpc2FibGVyZW1vdGVwbGF5YmFjaycsICdkb3dubG9hZCcsICdkcmFnZ2FibGUnLCAnZW5jdHlwZScsICdlbnRlcmtleWhpbnQnLCAnZmFjZScsICdmb3InLCAnaGVhZGVycycsICdoZWlnaHQnLCAnaGlkZGVuJywgJ2hpZ2gnLCAnaHJlZicsICdocmVmbGFuZycsICdpZCcsICdpbnB1dG1vZGUnLCAnaW50ZWdyaXR5JywgJ2lzbWFwJywgJ2tpbmQnLCAnbGFiZWwnLCAnbGFuZycsICdsaXN0JywgJ2xvYWRpbmcnLCAnbG9vcCcsICdsb3cnLCAnbWF4JywgJ21heGxlbmd0aCcsICdtZWRpYScsICdtZXRob2QnLCAnbWluJywgJ21pbmxlbmd0aCcsICdtdWx0aXBsZScsICdtdXRlZCcsICduYW1lJywgJ25vbmNlJywgJ25vc2hhZGUnLCAnbm92YWxpZGF0ZScsICdub3dyYXAnLCAnb3BlbicsICdvcHRpbXVtJywgJ3BhdHRlcm4nLCAncGxhY2Vob2xkZXInLCAncGxheXNpbmxpbmUnLCAncG9zdGVyJywgJ3ByZWxvYWQnLCAncHViZGF0ZScsICdyYWRpb2dyb3VwJywgJ3JlYWRvbmx5JywgJ3JlbCcsICdyZXF1aXJlZCcsICdyZXYnLCAncmV2ZXJzZWQnLCAncm9sZScsICdyb3dzJywgJ3Jvd3NwYW4nLCAnc3BlbGxjaGVjaycsICdzY29wZScsICdzZWxlY3RlZCcsICdzaGFwZScsICdzaXplJywgJ3NpemVzJywgJ3NwYW4nLCAnc3JjbGFuZycsICdzdGFydCcsICdzcmMnLCAnc3Jjc2V0JywgJ3N0ZXAnLCAnc3R5bGUnLCAnc3VtbWFyeScsICd0YWJpbmRleCcsICd0aXRsZScsICd0cmFuc2xhdGUnLCAndHlwZScsICd1c2VtYXAnLCAndmFsaWduJywgJ3ZhbHVlJywgJ3dpZHRoJywgJ3htbG5zJywgJ3Nsb3QnXSk7XG4gIHZhciBzdmcgPSBmcmVlemUoWydhY2NlbnQtaGVpZ2h0JywgJ2FjY3VtdWxhdGUnLCAnYWRkaXRpdmUnLCAnYWxpZ25tZW50LWJhc2VsaW5lJywgJ2FzY2VudCcsICdhdHRyaWJ1dGVuYW1lJywgJ2F0dHJpYnV0ZXR5cGUnLCAnYXppbXV0aCcsICdiYXNlZnJlcXVlbmN5JywgJ2Jhc2VsaW5lLXNoaWZ0JywgJ2JlZ2luJywgJ2JpYXMnLCAnYnknLCAnY2xhc3MnLCAnY2xpcCcsICdjbGlwcGF0aHVuaXRzJywgJ2NsaXAtcGF0aCcsICdjbGlwLXJ1bGUnLCAnY29sb3InLCAnY29sb3ItaW50ZXJwb2xhdGlvbicsICdjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnMnLCAnY29sb3ItcHJvZmlsZScsICdjb2xvci1yZW5kZXJpbmcnLCAnY3gnLCAnY3knLCAnZCcsICdkeCcsICdkeScsICdkaWZmdXNlY29uc3RhbnQnLCAnZGlyZWN0aW9uJywgJ2Rpc3BsYXknLCAnZGl2aXNvcicsICdkdXInLCAnZWRnZW1vZGUnLCAnZWxldmF0aW9uJywgJ2VuZCcsICdmaWxsJywgJ2ZpbGwtb3BhY2l0eScsICdmaWxsLXJ1bGUnLCAnZmlsdGVyJywgJ2ZpbHRlcnVuaXRzJywgJ2Zsb29kLWNvbG9yJywgJ2Zsb29kLW9wYWNpdHknLCAnZm9udC1mYW1pbHknLCAnZm9udC1zaXplJywgJ2ZvbnQtc2l6ZS1hZGp1c3QnLCAnZm9udC1zdHJldGNoJywgJ2ZvbnQtc3R5bGUnLCAnZm9udC12YXJpYW50JywgJ2ZvbnQtd2VpZ2h0JywgJ2Z4JywgJ2Z5JywgJ2cxJywgJ2cyJywgJ2dseXBoLW5hbWUnLCAnZ2x5cGhyZWYnLCAnZ3JhZGllbnR1bml0cycsICdncmFkaWVudHRyYW5zZm9ybScsICdoZWlnaHQnLCAnaHJlZicsICdpZCcsICdpbWFnZS1yZW5kZXJpbmcnLCAnaW4nLCAnaW4yJywgJ2snLCAnazEnLCAnazInLCAnazMnLCAnazQnLCAna2VybmluZycsICdrZXlwb2ludHMnLCAna2V5c3BsaW5lcycsICdrZXl0aW1lcycsICdsYW5nJywgJ2xlbmd0aGFkanVzdCcsICdsZXR0ZXItc3BhY2luZycsICdrZXJuZWxtYXRyaXgnLCAna2VybmVsdW5pdGxlbmd0aCcsICdsaWdodGluZy1jb2xvcicsICdsb2NhbCcsICdtYXJrZXItZW5kJywgJ21hcmtlci1taWQnLCAnbWFya2VyLXN0YXJ0JywgJ21hcmtlcmhlaWdodCcsICdtYXJrZXJ1bml0cycsICdtYXJrZXJ3aWR0aCcsICdtYXNrY29udGVudHVuaXRzJywgJ21hc2t1bml0cycsICdtYXgnLCAnbWFzaycsICdtZWRpYScsICdtZXRob2QnLCAnbW9kZScsICdtaW4nLCAnbmFtZScsICdudW1vY3RhdmVzJywgJ29mZnNldCcsICdvcGVyYXRvcicsICdvcGFjaXR5JywgJ29yZGVyJywgJ29yaWVudCcsICdvcmllbnRhdGlvbicsICdvcmlnaW4nLCAnb3ZlcmZsb3cnLCAncGFpbnQtb3JkZXInLCAncGF0aCcsICdwYXRobGVuZ3RoJywgJ3BhdHRlcm5jb250ZW50dW5pdHMnLCAncGF0dGVybnRyYW5zZm9ybScsICdwYXR0ZXJudW5pdHMnLCAncG9pbnRzJywgJ3ByZXNlcnZlYWxwaGEnLCAncHJlc2VydmVhc3BlY3RyYXRpbycsICdwcmltaXRpdmV1bml0cycsICdyJywgJ3J4JywgJ3J5JywgJ3JhZGl1cycsICdyZWZ4JywgJ3JlZnknLCAncmVwZWF0Y291bnQnLCAncmVwZWF0ZHVyJywgJ3Jlc3RhcnQnLCAncmVzdWx0JywgJ3JvdGF0ZScsICdzY2FsZScsICdzZWVkJywgJ3NoYXBlLXJlbmRlcmluZycsICdzcGVjdWxhcmNvbnN0YW50JywgJ3NwZWN1bGFyZXhwb25lbnQnLCAnc3ByZWFkbWV0aG9kJywgJ3N0YXJ0b2Zmc2V0JywgJ3N0ZGRldmlhdGlvbicsICdzdGl0Y2h0aWxlcycsICdzdG9wLWNvbG9yJywgJ3N0b3Atb3BhY2l0eScsICdzdHJva2UtZGFzaGFycmF5JywgJ3N0cm9rZS1kYXNob2Zmc2V0JywgJ3N0cm9rZS1saW5lY2FwJywgJ3N0cm9rZS1saW5lam9pbicsICdzdHJva2UtbWl0ZXJsaW1pdCcsICdzdHJva2Utb3BhY2l0eScsICdzdHJva2UnLCAnc3Ryb2tlLXdpZHRoJywgJ3N0eWxlJywgJ3N1cmZhY2VzY2FsZScsICdzeXN0ZW1sYW5ndWFnZScsICd0YWJpbmRleCcsICd0YXJnZXR4JywgJ3RhcmdldHknLCAndHJhbnNmb3JtJywgJ3RyYW5zZm9ybS1vcmlnaW4nLCAndGV4dC1hbmNob3InLCAndGV4dC1kZWNvcmF0aW9uJywgJ3RleHQtcmVuZGVyaW5nJywgJ3RleHRsZW5ndGgnLCAndHlwZScsICd1MScsICd1MicsICd1bmljb2RlJywgJ3ZhbHVlcycsICd2aWV3Ym94JywgJ3Zpc2liaWxpdHknLCAndmVyc2lvbicsICd2ZXJ0LWFkdi15JywgJ3ZlcnQtb3JpZ2luLXgnLCAndmVydC1vcmlnaW4teScsICd3aWR0aCcsICd3b3JkLXNwYWNpbmcnLCAnd3JhcCcsICd3cml0aW5nLW1vZGUnLCAneGNoYW5uZWxzZWxlY3RvcicsICd5Y2hhbm5lbHNlbGVjdG9yJywgJ3gnLCAneDEnLCAneDInLCAneG1sbnMnLCAneScsICd5MScsICd5MicsICd6JywgJ3pvb21hbmRwYW4nXSk7XG4gIHZhciBtYXRoTWwgPSBmcmVlemUoWydhY2NlbnQnLCAnYWNjZW50dW5kZXInLCAnYWxpZ24nLCAnYmV2ZWxsZWQnLCAnY2xvc2UnLCAnY29sdW1uc2FsaWduJywgJ2NvbHVtbmxpbmVzJywgJ2NvbHVtbnNwYW4nLCAnZGVub21hbGlnbicsICdkZXB0aCcsICdkaXInLCAnZGlzcGxheScsICdkaXNwbGF5c3R5bGUnLCAnZW5jb2RpbmcnLCAnZmVuY2UnLCAnZnJhbWUnLCAnaGVpZ2h0JywgJ2hyZWYnLCAnaWQnLCAnbGFyZ2VvcCcsICdsZW5ndGgnLCAnbGluZXRoaWNrbmVzcycsICdsc3BhY2UnLCAnbHF1b3RlJywgJ21hdGhiYWNrZ3JvdW5kJywgJ21hdGhjb2xvcicsICdtYXRoc2l6ZScsICdtYXRodmFyaWFudCcsICdtYXhzaXplJywgJ21pbnNpemUnLCAnbW92YWJsZWxpbWl0cycsICdub3RhdGlvbicsICdudW1hbGlnbicsICdvcGVuJywgJ3Jvd2FsaWduJywgJ3Jvd2xpbmVzJywgJ3Jvd3NwYWNpbmcnLCAncm93c3BhbicsICdyc3BhY2UnLCAncnF1b3RlJywgJ3NjcmlwdGxldmVsJywgJ3NjcmlwdG1pbnNpemUnLCAnc2NyaXB0c2l6ZW11bHRpcGxpZXInLCAnc2VsZWN0aW9uJywgJ3NlcGFyYXRvcicsICdzZXBhcmF0b3JzJywgJ3N0cmV0Y2h5JywgJ3N1YnNjcmlwdHNoaWZ0JywgJ3N1cHNjcmlwdHNoaWZ0JywgJ3N5bW1ldHJpYycsICd2b2Zmc2V0JywgJ3dpZHRoJywgJ3htbG5zJ10pO1xuICB2YXIgeG1sID0gZnJlZXplKFsneGxpbms6aHJlZicsICd4bWw6aWQnLCAneGxpbms6dGl0bGUnLCAneG1sOnNwYWNlJywgJ3htbG5zOnhsaW5rJ10pO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSB1bmljb3JuL2JldHRlci1yZWdleFxuICB2YXIgTVVTVEFDSEVfRVhQUiA9IHNlYWwoL1xce1xce1tcXHdcXFddKnxbXFx3XFxXXSpcXH1cXH0vZ20pOyAvLyBTcGVjaWZ5IHRlbXBsYXRlIGRldGVjdGlvbiByZWdleCBmb3IgU0FGRV9GT1JfVEVNUExBVEVTIG1vZGVcbiAgdmFyIEVSQl9FWFBSID0gc2VhbCgvPCVbXFx3XFxXXSp8W1xcd1xcV10qJT4vZ20pO1xuICB2YXIgVE1QTElUX0VYUFIgPSBzZWFsKC9cXCR7W1xcd1xcV10qfS9nbSk7XG4gIHZhciBEQVRBX0FUVFIgPSBzZWFsKC9eZGF0YS1bXFwtXFx3LlxcdTAwQjctXFx1RkZGRl0rJC8pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVzZWxlc3MtZXNjYXBlXG4gIHZhciBBUklBX0FUVFIgPSBzZWFsKC9eYXJpYS1bXFwtXFx3XSskLyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdXNlbGVzcy1lc2NhcGVcbiAgdmFyIElTX0FMTE9XRURfVVJJID0gc2VhbCgvXig/Oig/Oig/OmZ8aHQpdHBzP3xtYWlsdG98dGVsfGNhbGx0b3xjaWR8eG1wcCk6fFteYS16XXxbYS16Ky5cXC1dKyg/OlteYS16Ky5cXC06XXwkKSkvaSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVzZWxlc3MtZXNjYXBlXG4gICk7XG4gIHZhciBJU19TQ1JJUFRfT1JfREFUQSA9IHNlYWwoL14oPzpcXHcrc2NyaXB0fGRhdGEpOi9pKTtcbiAgdmFyIEFUVFJfV0hJVEVTUEFDRSA9IHNlYWwoL1tcXHUwMDAwLVxcdTAwMjBcXHUwMEEwXFx1MTY4MFxcdTE4MEVcXHUyMDAwLVxcdTIwMjlcXHUyMDVGXFx1MzAwMF0vZyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnRyb2wtcmVnZXhcbiAgKTtcbiAgdmFyIERPQ1RZUEVfTkFNRSA9IHNlYWwoL15odG1sJC9pKTtcbiAgdmFyIENVU1RPTV9FTEVNRU5UID0gc2VhbCgvXlthLXpdWy5cXHddKigtWy5cXHddKykrJC9pKTtcblxuICB2YXIgZ2V0R2xvYmFsID0gZnVuY3Rpb24gZ2V0R2xvYmFsKCkge1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiB3aW5kb3c7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuby1vcCBwb2xpY3kgZm9yIGludGVybmFsIHVzZSBvbmx5LlxuICAgKiBEb24ndCBleHBvcnQgdGhpcyBmdW5jdGlvbiBvdXRzaWRlIHRoaXMgbW9kdWxlIVxuICAgKiBAcGFyYW0gez9UcnVzdGVkVHlwZVBvbGljeUZhY3Rvcnl9IHRydXN0ZWRUeXBlcyBUaGUgcG9saWN5IGZhY3RvcnkuXG4gICAqIEBwYXJhbSB7RG9jdW1lbnR9IGRvY3VtZW50IFRoZSBkb2N1bWVudCBvYmplY3QgKHRvIGRldGVybWluZSBwb2xpY3kgbmFtZSBzdWZmaXgpXG4gICAqIEByZXR1cm4gez9UcnVzdGVkVHlwZVBvbGljeX0gVGhlIHBvbGljeSBjcmVhdGVkIChvciBudWxsLCBpZiBUcnVzdGVkIFR5cGVzXG4gICAqIGFyZSBub3Qgc3VwcG9ydGVkKS5cbiAgICovXG4gIHZhciBfY3JlYXRlVHJ1c3RlZFR5cGVzUG9saWN5ID0gZnVuY3Rpb24gX2NyZWF0ZVRydXN0ZWRUeXBlc1BvbGljeSh0cnVzdGVkVHlwZXMsIGRvY3VtZW50KSB7XG4gICAgaWYgKF90eXBlb2YodHJ1c3RlZFR5cGVzKSAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIHRydXN0ZWRUeXBlcy5jcmVhdGVQb2xpY3kgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIEFsbG93IHRoZSBjYWxsZXJzIHRvIGNvbnRyb2wgdGhlIHVuaXF1ZSBwb2xpY3kgbmFtZVxuICAgIC8vIGJ5IGFkZGluZyBhIGRhdGEtdHQtcG9saWN5LXN1ZmZpeCB0byB0aGUgc2NyaXB0IGVsZW1lbnQgd2l0aCB0aGUgRE9NUHVyaWZ5LlxuICAgIC8vIFBvbGljeSBjcmVhdGlvbiB3aXRoIGR1cGxpY2F0ZSBuYW1lcyB0aHJvd3MgaW4gVHJ1c3RlZCBUeXBlcy5cbiAgICB2YXIgc3VmZml4ID0gbnVsbDtcbiAgICB2YXIgQVRUUl9OQU1FID0gJ2RhdGEtdHQtcG9saWN5LXN1ZmZpeCc7XG4gICAgaWYgKGRvY3VtZW50LmN1cnJlbnRTY3JpcHQgJiYgZG9jdW1lbnQuY3VycmVudFNjcmlwdC5oYXNBdHRyaWJ1dGUoQVRUUl9OQU1FKSkge1xuICAgICAgc3VmZml4ID0gZG9jdW1lbnQuY3VycmVudFNjcmlwdC5nZXRBdHRyaWJ1dGUoQVRUUl9OQU1FKTtcbiAgICB9XG4gICAgdmFyIHBvbGljeU5hbWUgPSAnZG9tcHVyaWZ5JyArIChzdWZmaXggPyAnIycgKyBzdWZmaXggOiAnJyk7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0cnVzdGVkVHlwZXMuY3JlYXRlUG9saWN5KHBvbGljeU5hbWUsIHtcbiAgICAgICAgY3JlYXRlSFRNTDogZnVuY3Rpb24gY3JlYXRlSFRNTChodG1sKSB7XG4gICAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZVNjcmlwdFVSTDogZnVuY3Rpb24gY3JlYXRlU2NyaXB0VVJMKHNjcmlwdFVybCkge1xuICAgICAgICAgIHJldHVybiBzY3JpcHRVcmw7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgIC8vIFBvbGljeSBjcmVhdGlvbiBmYWlsZWQgKG1vc3QgbGlrZWx5IGFub3RoZXIgRE9NUHVyaWZ5IHNjcmlwdCBoYXNcbiAgICAgIC8vIGFscmVhZHkgcnVuKS4gU2tpcCBjcmVhdGluZyB0aGUgcG9saWN5LCBhcyB0aGlzIHdpbGwgb25seSBjYXVzZSBlcnJvcnNcbiAgICAgIC8vIGlmIFRUIGFyZSBlbmZvcmNlZC5cbiAgICAgIGNvbnNvbGUud2FybignVHJ1c3RlZFR5cGVzIHBvbGljeSAnICsgcG9saWN5TmFtZSArICcgY291bGQgbm90IGJlIGNyZWF0ZWQuJyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH07XG4gIGZ1bmN0aW9uIGNyZWF0ZURPTVB1cmlmeSgpIHtcbiAgICB2YXIgd2luZG93ID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBnZXRHbG9iYWwoKTtcbiAgICB2YXIgRE9NUHVyaWZ5ID0gZnVuY3Rpb24gRE9NUHVyaWZ5KHJvb3QpIHtcbiAgICAgIHJldHVybiBjcmVhdGVET01QdXJpZnkocm9vdCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFZlcnNpb24gbGFiZWwsIGV4cG9zZWQgZm9yIGVhc2llciBjaGVja3NcbiAgICAgKiBpZiBET01QdXJpZnkgaXMgdXAgdG8gZGF0ZSBvciBub3RcbiAgICAgKi9cbiAgICBET01QdXJpZnkudmVyc2lvbiA9ICcyLjUuOCc7XG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBvZiBlbGVtZW50cyB0aGF0IERPTVB1cmlmeSByZW1vdmVkIGR1cmluZyBzYW5pdGF0aW9uLlxuICAgICAqIEVtcHR5IGlmIG5vdGhpbmcgd2FzIHJlbW92ZWQuXG4gICAgICovXG4gICAgRE9NUHVyaWZ5LnJlbW92ZWQgPSBbXTtcbiAgICBpZiAoIXdpbmRvdyB8fCAhd2luZG93LmRvY3VtZW50IHx8IHdpbmRvdy5kb2N1bWVudC5ub2RlVHlwZSAhPT0gOSkge1xuICAgICAgLy8gTm90IHJ1bm5pbmcgaW4gYSBicm93c2VyLCBwcm92aWRlIGEgZmFjdG9yeSBmdW5jdGlvblxuICAgICAgLy8gc28gdGhhdCB5b3UgY2FuIHBhc3MgeW91ciBvd24gV2luZG93XG4gICAgICBET01QdXJpZnkuaXNTdXBwb3J0ZWQgPSBmYWxzZTtcbiAgICAgIHJldHVybiBET01QdXJpZnk7XG4gICAgfVxuICAgIHZhciBvcmlnaW5hbERvY3VtZW50ID0gd2luZG93LmRvY3VtZW50O1xuICAgIHZhciBkb2N1bWVudCA9IHdpbmRvdy5kb2N1bWVudDtcbiAgICB2YXIgRG9jdW1lbnRGcmFnbWVudCA9IHdpbmRvdy5Eb2N1bWVudEZyYWdtZW50LFxuICAgICAgSFRNTFRlbXBsYXRlRWxlbWVudCA9IHdpbmRvdy5IVE1MVGVtcGxhdGVFbGVtZW50LFxuICAgICAgTm9kZSA9IHdpbmRvdy5Ob2RlLFxuICAgICAgRWxlbWVudCA9IHdpbmRvdy5FbGVtZW50LFxuICAgICAgTm9kZUZpbHRlciA9IHdpbmRvdy5Ob2RlRmlsdGVyLFxuICAgICAgX3dpbmRvdyROYW1lZE5vZGVNYXAgPSB3aW5kb3cuTmFtZWROb2RlTWFwLFxuICAgICAgTmFtZWROb2RlTWFwID0gX3dpbmRvdyROYW1lZE5vZGVNYXAgPT09IHZvaWQgMCA/IHdpbmRvdy5OYW1lZE5vZGVNYXAgfHwgd2luZG93Lk1vek5hbWVkQXR0ck1hcCA6IF93aW5kb3ckTmFtZWROb2RlTWFwLFxuICAgICAgSFRNTEZvcm1FbGVtZW50ID0gd2luZG93LkhUTUxGb3JtRWxlbWVudCxcbiAgICAgIERPTVBhcnNlciA9IHdpbmRvdy5ET01QYXJzZXIsXG4gICAgICB0cnVzdGVkVHlwZXMgPSB3aW5kb3cudHJ1c3RlZFR5cGVzO1xuICAgIHZhciBFbGVtZW50UHJvdG90eXBlID0gRWxlbWVudC5wcm90b3R5cGU7XG4gICAgdmFyIGNsb25lTm9kZSA9IGxvb2t1cEdldHRlcihFbGVtZW50UHJvdG90eXBlLCAnY2xvbmVOb2RlJyk7XG4gICAgdmFyIGdldE5leHRTaWJsaW5nID0gbG9va3VwR2V0dGVyKEVsZW1lbnRQcm90b3R5cGUsICduZXh0U2libGluZycpO1xuICAgIHZhciBnZXRDaGlsZE5vZGVzID0gbG9va3VwR2V0dGVyKEVsZW1lbnRQcm90b3R5cGUsICdjaGlsZE5vZGVzJyk7XG4gICAgdmFyIGdldFBhcmVudE5vZGUgPSBsb29rdXBHZXR0ZXIoRWxlbWVudFByb3RvdHlwZSwgJ3BhcmVudE5vZGUnKTtcblxuICAgIC8vIEFzIHBlciBpc3N1ZSAjNDcsIHRoZSB3ZWItY29tcG9uZW50cyByZWdpc3RyeSBpcyBpbmhlcml0ZWQgYnkgYVxuICAgIC8vIG5ldyBkb2N1bWVudCBjcmVhdGVkIHZpYSBjcmVhdGVIVE1MRG9jdW1lbnQuIEFzIHBlciB0aGUgc3BlY1xuICAgIC8vIChodHRwOi8vdzNjLmdpdGh1Yi5pby93ZWJjb21wb25lbnRzL3NwZWMvY3VzdG9tLyNjcmVhdGluZy1hbmQtcGFzc2luZy1yZWdpc3RyaWVzKVxuICAgIC8vIGEgbmV3IGVtcHR5IHJlZ2lzdHJ5IGlzIHVzZWQgd2hlbiBjcmVhdGluZyBhIHRlbXBsYXRlIGNvbnRlbnRzIG93bmVyXG4gICAgLy8gZG9jdW1lbnQsIHNvIHdlIHVzZSB0aGF0IGFzIG91ciBwYXJlbnQgZG9jdW1lbnQgdG8gZW5zdXJlIG5vdGhpbmdcbiAgICAvLyBpcyBpbmhlcml0ZWQuXG4gICAgaWYgKHR5cGVvZiBIVE1MVGVtcGxhdGVFbGVtZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICAgICAgaWYgKHRlbXBsYXRlLmNvbnRlbnQgJiYgdGVtcGxhdGUuY29udGVudC5vd25lckRvY3VtZW50KSB7XG4gICAgICAgIGRvY3VtZW50ID0gdGVtcGxhdGUuY29udGVudC5vd25lckRvY3VtZW50O1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgdHJ1c3RlZFR5cGVzUG9saWN5ID0gX2NyZWF0ZVRydXN0ZWRUeXBlc1BvbGljeSh0cnVzdGVkVHlwZXMsIG9yaWdpbmFsRG9jdW1lbnQpO1xuICAgIHZhciBlbXB0eUhUTUwgPSB0cnVzdGVkVHlwZXNQb2xpY3kgPyB0cnVzdGVkVHlwZXNQb2xpY3kuY3JlYXRlSFRNTCgnJykgOiAnJztcbiAgICB2YXIgX2RvY3VtZW50ID0gZG9jdW1lbnQsXG4gICAgICBpbXBsZW1lbnRhdGlvbiA9IF9kb2N1bWVudC5pbXBsZW1lbnRhdGlvbixcbiAgICAgIGNyZWF0ZU5vZGVJdGVyYXRvciA9IF9kb2N1bWVudC5jcmVhdGVOb2RlSXRlcmF0b3IsXG4gICAgICBjcmVhdGVEb2N1bWVudEZyYWdtZW50ID0gX2RvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQsXG4gICAgICBnZXRFbGVtZW50c0J5VGFnTmFtZSA9IF9kb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZTtcbiAgICB2YXIgaW1wb3J0Tm9kZSA9IG9yaWdpbmFsRG9jdW1lbnQuaW1wb3J0Tm9kZTtcbiAgICB2YXIgZG9jdW1lbnRNb2RlID0ge307XG4gICAgdHJ5IHtcbiAgICAgIGRvY3VtZW50TW9kZSA9IGNsb25lKGRvY3VtZW50KS5kb2N1bWVudE1vZGUgPyBkb2N1bWVudC5kb2N1bWVudE1vZGUgOiB7fTtcbiAgICB9IGNhdGNoIChfKSB7fVxuICAgIHZhciBob29rcyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHdoZXRoZXIgdGhpcyBicm93c2VyIHN1cHBvcnRzIHJ1bm5pbmcgdGhlIGZ1bGwgRE9NUHVyaWZ5LlxuICAgICAqL1xuICAgIERPTVB1cmlmeS5pc1N1cHBvcnRlZCA9IHR5cGVvZiBnZXRQYXJlbnROb2RlID09PSAnZnVuY3Rpb24nICYmIGltcGxlbWVudGF0aW9uICYmIGltcGxlbWVudGF0aW9uLmNyZWF0ZUhUTUxEb2N1bWVudCAhPT0gdW5kZWZpbmVkICYmIGRvY3VtZW50TW9kZSAhPT0gOTtcbiAgICB2YXIgTVVTVEFDSEVfRVhQUiQxID0gTVVTVEFDSEVfRVhQUixcbiAgICAgIEVSQl9FWFBSJDEgPSBFUkJfRVhQUixcbiAgICAgIFRNUExJVF9FWFBSJDEgPSBUTVBMSVRfRVhQUixcbiAgICAgIERBVEFfQVRUUiQxID0gREFUQV9BVFRSLFxuICAgICAgQVJJQV9BVFRSJDEgPSBBUklBX0FUVFIsXG4gICAgICBJU19TQ1JJUFRfT1JfREFUQSQxID0gSVNfU0NSSVBUX09SX0RBVEEsXG4gICAgICBBVFRSX1dISVRFU1BBQ0UkMSA9IEFUVFJfV0hJVEVTUEFDRSxcbiAgICAgIENVU1RPTV9FTEVNRU5UJDEgPSBDVVNUT01fRUxFTUVOVDtcbiAgICB2YXIgSVNfQUxMT1dFRF9VUkkkMSA9IElTX0FMTE9XRURfVVJJO1xuXG4gICAgLyoqXG4gICAgICogV2UgY29uc2lkZXIgdGhlIGVsZW1lbnRzIGFuZCBhdHRyaWJ1dGVzIGJlbG93IHRvIGJlIHNhZmUuIElkZWFsbHlcbiAgICAgKiBkb24ndCBhZGQgYW55IG5ldyBvbmVzIGJ1dCBmZWVsIGZyZWUgdG8gcmVtb3ZlIHVud2FudGVkIG9uZXMuXG4gICAgICovXG5cbiAgICAvKiBhbGxvd2VkIGVsZW1lbnQgbmFtZXMgKi9cbiAgICB2YXIgQUxMT1dFRF9UQUdTID0gbnVsbDtcbiAgICB2YXIgREVGQVVMVF9BTExPV0VEX1RBR1MgPSBhZGRUb1NldCh7fSwgW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShodG1sJDEpLCBfdG9Db25zdW1hYmxlQXJyYXkoc3ZnJDEpLCBfdG9Db25zdW1hYmxlQXJyYXkoc3ZnRmlsdGVycyksIF90b0NvbnN1bWFibGVBcnJheShtYXRoTWwkMSksIF90b0NvbnN1bWFibGVBcnJheSh0ZXh0KSkpO1xuXG4gICAgLyogQWxsb3dlZCBhdHRyaWJ1dGUgbmFtZXMgKi9cbiAgICB2YXIgQUxMT1dFRF9BVFRSID0gbnVsbDtcbiAgICB2YXIgREVGQVVMVF9BTExPV0VEX0FUVFIgPSBhZGRUb1NldCh7fSwgW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShodG1sKSwgX3RvQ29uc3VtYWJsZUFycmF5KHN2ZyksIF90b0NvbnN1bWFibGVBcnJheShtYXRoTWwpLCBfdG9Db25zdW1hYmxlQXJyYXkoeG1sKSkpO1xuXG4gICAgLypcbiAgICAgKiBDb25maWd1cmUgaG93IERPTVBVcmlmeSBzaG91bGQgaGFuZGxlIGN1c3RvbSBlbGVtZW50cyBhbmQgdGhlaXIgYXR0cmlidXRlcyBhcyB3ZWxsIGFzIGN1c3RvbWl6ZWQgYnVpbHQtaW4gZWxlbWVudHMuXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB8RnVuY3Rpb258bnVsbH0gdGFnTmFtZUNoZWNrIG9uZSBvZiBbbnVsbCwgcmVnZXhQYXR0ZXJuLCBwcmVkaWNhdGVdLiBEZWZhdWx0OiBgbnVsbGAgKGRpc2FsbG93IGFueSBjdXN0b20gZWxlbWVudHMpXG4gICAgICogQHByb3BlcnR5IHtSZWdFeHB8RnVuY3Rpb258bnVsbH0gYXR0cmlidXRlTmFtZUNoZWNrIG9uZSBvZiBbbnVsbCwgcmVnZXhQYXR0ZXJuLCBwcmVkaWNhdGVdLiBEZWZhdWx0OiBgbnVsbGAgKGRpc2FsbG93IGFueSBhdHRyaWJ1dGVzIG5vdCBvbiB0aGUgYWxsb3cgbGlzdClcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IGFsbG93Q3VzdG9taXplZEJ1aWx0SW5FbGVtZW50cyBhbGxvdyBjdXN0b20gZWxlbWVudHMgZGVyaXZlZCBmcm9tIGJ1aWx0LWlucyBpZiB0aGV5IHBhc3MgQ1VTVE9NX0VMRU1FTlRfSEFORExJTkcudGFnTmFtZUNoZWNrLiBEZWZhdWx0OiBgZmFsc2VgLlxuICAgICAqL1xuICAgIHZhciBDVVNUT01fRUxFTUVOVF9IQU5ETElORyA9IE9iamVjdC5zZWFsKE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgdGFnTmFtZUNoZWNrOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogbnVsbFxuICAgICAgfSxcbiAgICAgIGF0dHJpYnV0ZU5hbWVDaGVjazoge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IG51bGxcbiAgICAgIH0sXG4gICAgICBhbGxvd0N1c3RvbWl6ZWRCdWlsdEluRWxlbWVudHM6IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBmYWxzZVxuICAgICAgfVxuICAgIH0pKTtcblxuICAgIC8qIEV4cGxpY2l0bHkgZm9yYmlkZGVuIHRhZ3MgKG92ZXJyaWRlcyBBTExPV0VEX1RBR1MvQUREX1RBR1MpICovXG4gICAgdmFyIEZPUkJJRF9UQUdTID0gbnVsbDtcblxuICAgIC8qIEV4cGxpY2l0bHkgZm9yYmlkZGVuIGF0dHJpYnV0ZXMgKG92ZXJyaWRlcyBBTExPV0VEX0FUVFIvQUREX0FUVFIpICovXG4gICAgdmFyIEZPUkJJRF9BVFRSID0gbnVsbDtcblxuICAgIC8qIERlY2lkZSBpZiBBUklBIGF0dHJpYnV0ZXMgYXJlIG9rYXkgKi9cbiAgICB2YXIgQUxMT1dfQVJJQV9BVFRSID0gdHJ1ZTtcblxuICAgIC8qIERlY2lkZSBpZiBjdXN0b20gZGF0YSBhdHRyaWJ1dGVzIGFyZSBva2F5ICovXG4gICAgdmFyIEFMTE9XX0RBVEFfQVRUUiA9IHRydWU7XG5cbiAgICAvKiBEZWNpZGUgaWYgdW5rbm93biBwcm90b2NvbHMgYXJlIG9rYXkgKi9cbiAgICB2YXIgQUxMT1dfVU5LTk9XTl9QUk9UT0NPTFMgPSBmYWxzZTtcblxuICAgIC8qIERlY2lkZSBpZiBzZWxmLWNsb3NpbmcgdGFncyBpbiBhdHRyaWJ1dGVzIGFyZSBhbGxvd2VkLlxuICAgICAqIFVzdWFsbHkgcmVtb3ZlZCBkdWUgdG8gYSBtWFNTIGlzc3VlIGluIGpRdWVyeSAzLjAgKi9cbiAgICB2YXIgQUxMT1dfU0VMRl9DTE9TRV9JTl9BVFRSID0gdHJ1ZTtcblxuICAgIC8qIE91dHB1dCBzaG91bGQgYmUgc2FmZSBmb3IgY29tbW9uIHRlbXBsYXRlIGVuZ2luZXMuXG4gICAgICogVGhpcyBtZWFucywgRE9NUHVyaWZ5IHJlbW92ZXMgZGF0YSBhdHRyaWJ1dGVzLCBtdXN0YWNoZXMgYW5kIEVSQlxuICAgICAqL1xuICAgIHZhciBTQUZFX0ZPUl9URU1QTEFURVMgPSBmYWxzZTtcblxuICAgIC8qIE91dHB1dCBzaG91bGQgYmUgc2FmZSBldmVuIGZvciBYTUwgdXNlZCB3aXRoaW4gSFRNTCBhbmQgYWxpa2UuXG4gICAgICogVGhpcyBtZWFucywgRE9NUHVyaWZ5IHJlbW92ZXMgY29tbWVudHMgd2hlbiBjb250YWluaW5nIHJpc2t5IGNvbnRlbnQuXG4gICAgICovXG4gICAgdmFyIFNBRkVfRk9SX1hNTCA9IHRydWU7XG5cbiAgICAvKiBEZWNpZGUgaWYgZG9jdW1lbnQgd2l0aCA8aHRtbD4uLi4gc2hvdWxkIGJlIHJldHVybmVkICovXG4gICAgdmFyIFdIT0xFX0RPQ1VNRU5UID0gZmFsc2U7XG5cbiAgICAvKiBUcmFjayB3aGV0aGVyIGNvbmZpZyBpcyBhbHJlYWR5IHNldCBvbiB0aGlzIGluc3RhbmNlIG9mIERPTVB1cmlmeS4gKi9cbiAgICB2YXIgU0VUX0NPTkZJRyA9IGZhbHNlO1xuXG4gICAgLyogRGVjaWRlIGlmIGFsbCBlbGVtZW50cyAoZS5nLiBzdHlsZSwgc2NyaXB0KSBtdXN0IGJlIGNoaWxkcmVuIG9mXG4gICAgICogZG9jdW1lbnQuYm9keS4gQnkgZGVmYXVsdCwgYnJvd3NlcnMgbWlnaHQgbW92ZSB0aGVtIHRvIGRvY3VtZW50LmhlYWQgKi9cbiAgICB2YXIgRk9SQ0VfQk9EWSA9IGZhbHNlO1xuXG4gICAgLyogRGVjaWRlIGlmIGEgRE9NIGBIVE1MQm9keUVsZW1lbnRgIHNob3VsZCBiZSByZXR1cm5lZCwgaW5zdGVhZCBvZiBhIGh0bWxcbiAgICAgKiBzdHJpbmcgKG9yIGEgVHJ1c3RlZEhUTUwgb2JqZWN0IGlmIFRydXN0ZWQgVHlwZXMgYXJlIHN1cHBvcnRlZCkuXG4gICAgICogSWYgYFdIT0xFX0RPQ1VNRU5UYCBpcyBlbmFibGVkIGEgYEhUTUxIdG1sRWxlbWVudGAgd2lsbCBiZSByZXR1cm5lZCBpbnN0ZWFkXG4gICAgICovXG4gICAgdmFyIFJFVFVSTl9ET00gPSBmYWxzZTtcblxuICAgIC8qIERlY2lkZSBpZiBhIERPTSBgRG9jdW1lbnRGcmFnbWVudGAgc2hvdWxkIGJlIHJldHVybmVkLCBpbnN0ZWFkIG9mIGEgaHRtbFxuICAgICAqIHN0cmluZyAgKG9yIGEgVHJ1c3RlZEhUTUwgb2JqZWN0IGlmIFRydXN0ZWQgVHlwZXMgYXJlIHN1cHBvcnRlZCkgKi9cbiAgICB2YXIgUkVUVVJOX0RPTV9GUkFHTUVOVCA9IGZhbHNlO1xuXG4gICAgLyogVHJ5IHRvIHJldHVybiBhIFRydXN0ZWQgVHlwZSBvYmplY3QgaW5zdGVhZCBvZiBhIHN0cmluZywgcmV0dXJuIGEgc3RyaW5nIGluXG4gICAgICogY2FzZSBUcnVzdGVkIFR5cGVzIGFyZSBub3Qgc3VwcG9ydGVkICAqL1xuICAgIHZhciBSRVRVUk5fVFJVU1RFRF9UWVBFID0gZmFsc2U7XG5cbiAgICAvKiBPdXRwdXQgc2hvdWxkIGJlIGZyZWUgZnJvbSBET00gY2xvYmJlcmluZyBhdHRhY2tzP1xuICAgICAqIFRoaXMgc2FuaXRpemVzIG1hcmt1cHMgbmFtZWQgd2l0aCBjb2xsaWRpbmcsIGNsb2JiZXJhYmxlIGJ1aWx0LWluIERPTSBBUElzLlxuICAgICAqL1xuICAgIHZhciBTQU5JVElaRV9ET00gPSB0cnVlO1xuXG4gICAgLyogQWNoaWV2ZSBmdWxsIERPTSBDbG9iYmVyaW5nIHByb3RlY3Rpb24gYnkgaXNvbGF0aW5nIHRoZSBuYW1lc3BhY2Ugb2YgbmFtZWRcbiAgICAgKiBwcm9wZXJ0aWVzIGFuZCBKUyB2YXJpYWJsZXMsIG1pdGlnYXRpbmcgYXR0YWNrcyB0aGF0IGFidXNlIHRoZSBIVE1ML0RPTSBzcGVjIHJ1bGVzLlxuICAgICAqXG4gICAgICogSFRNTC9ET00gc3BlYyBydWxlcyB0aGF0IGVuYWJsZSBET00gQ2xvYmJlcmluZzpcbiAgICAgKiAgIC0gTmFtZWQgQWNjZXNzIG9uIFdpbmRvdyAowqc3LjMuMylcbiAgICAgKiAgIC0gRE9NIFRyZWUgQWNjZXNzb3JzICjCpzMuMS41KVxuICAgICAqICAgLSBGb3JtIEVsZW1lbnQgUGFyZW50LUNoaWxkIFJlbGF0aW9ucyAowqc0LjEwLjMpXG4gICAgICogICAtIElmcmFtZSBzcmNkb2MgLyBOZXN0ZWQgV2luZG93UHJveGllcyAowqc0LjguNSlcbiAgICAgKiAgIC0gSFRNTENvbGxlY3Rpb24gKMKnNC4yLjEwLjIpXG4gICAgICpcbiAgICAgKiBOYW1lc3BhY2UgaXNvbGF0aW9uIGlzIGltcGxlbWVudGVkIGJ5IHByZWZpeGluZyBgaWRgIGFuZCBgbmFtZWAgYXR0cmlidXRlc1xuICAgICAqIHdpdGggYSBjb25zdGFudCBzdHJpbmcsIGkuZS4sIGB1c2VyLWNvbnRlbnQtYFxuICAgICAqL1xuICAgIHZhciBTQU5JVElaRV9OQU1FRF9QUk9QUyA9IGZhbHNlO1xuICAgIHZhciBTQU5JVElaRV9OQU1FRF9QUk9QU19QUkVGSVggPSAndXNlci1jb250ZW50LSc7XG5cbiAgICAvKiBLZWVwIGVsZW1lbnQgY29udGVudCB3aGVuIHJlbW92aW5nIGVsZW1lbnQ/ICovXG4gICAgdmFyIEtFRVBfQ09OVEVOVCA9IHRydWU7XG5cbiAgICAvKiBJZiBhIGBOb2RlYCBpcyBwYXNzZWQgdG8gc2FuaXRpemUoKSwgdGhlbiBwZXJmb3JtcyBzYW5pdGl6YXRpb24gaW4tcGxhY2UgaW5zdGVhZFxuICAgICAqIG9mIGltcG9ydGluZyBpdCBpbnRvIGEgbmV3IERvY3VtZW50IGFuZCByZXR1cm5pbmcgYSBzYW5pdGl6ZWQgY29weSAqL1xuICAgIHZhciBJTl9QTEFDRSA9IGZhbHNlO1xuXG4gICAgLyogQWxsb3cgdXNhZ2Ugb2YgcHJvZmlsZXMgbGlrZSBodG1sLCBzdmcgYW5kIG1hdGhNbCAqL1xuICAgIHZhciBVU0VfUFJPRklMRVMgPSB7fTtcblxuICAgIC8qIFRhZ3MgdG8gaWdub3JlIGNvbnRlbnQgb2Ygd2hlbiBLRUVQX0NPTlRFTlQgaXMgdHJ1ZSAqL1xuICAgIHZhciBGT1JCSURfQ09OVEVOVFMgPSBudWxsO1xuICAgIHZhciBERUZBVUxUX0ZPUkJJRF9DT05URU5UUyA9IGFkZFRvU2V0KHt9LCBbJ2Fubm90YXRpb24teG1sJywgJ2F1ZGlvJywgJ2NvbGdyb3VwJywgJ2Rlc2MnLCAnZm9yZWlnbm9iamVjdCcsICdoZWFkJywgJ2lmcmFtZScsICdtYXRoJywgJ21pJywgJ21uJywgJ21vJywgJ21zJywgJ210ZXh0JywgJ25vZW1iZWQnLCAnbm9mcmFtZXMnLCAnbm9zY3JpcHQnLCAncGxhaW50ZXh0JywgJ3NjcmlwdCcsICdzdHlsZScsICdzdmcnLCAndGVtcGxhdGUnLCAndGhlYWQnLCAndGl0bGUnLCAndmlkZW8nLCAneG1wJ10pO1xuXG4gICAgLyogVGFncyB0aGF0IGFyZSBzYWZlIGZvciBkYXRhOiBVUklzICovXG4gICAgdmFyIERBVEFfVVJJX1RBR1MgPSBudWxsO1xuICAgIHZhciBERUZBVUxUX0RBVEFfVVJJX1RBR1MgPSBhZGRUb1NldCh7fSwgWydhdWRpbycsICd2aWRlbycsICdpbWcnLCAnc291cmNlJywgJ2ltYWdlJywgJ3RyYWNrJ10pO1xuXG4gICAgLyogQXR0cmlidXRlcyBzYWZlIGZvciB2YWx1ZXMgbGlrZSBcImphdmFzY3JpcHQ6XCIgKi9cbiAgICB2YXIgVVJJX1NBRkVfQVRUUklCVVRFUyA9IG51bGw7XG4gICAgdmFyIERFRkFVTFRfVVJJX1NBRkVfQVRUUklCVVRFUyA9IGFkZFRvU2V0KHt9LCBbJ2FsdCcsICdjbGFzcycsICdmb3InLCAnaWQnLCAnbGFiZWwnLCAnbmFtZScsICdwYXR0ZXJuJywgJ3BsYWNlaG9sZGVyJywgJ3JvbGUnLCAnc3VtbWFyeScsICd0aXRsZScsICd2YWx1ZScsICdzdHlsZScsICd4bWxucyddKTtcbiAgICB2YXIgTUFUSE1MX05BTUVTUEFDRSA9ICdodHRwOi8vd3d3LnczLm9yZy8xOTk4L01hdGgvTWF0aE1MJztcbiAgICB2YXIgU1ZHX05BTUVTUEFDRSA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG4gICAgdmFyIEhUTUxfTkFNRVNQQUNFID0gJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnO1xuICAgIC8qIERvY3VtZW50IG5hbWVzcGFjZSAqL1xuICAgIHZhciBOQU1FU1BBQ0UgPSBIVE1MX05BTUVTUEFDRTtcbiAgICB2YXIgSVNfRU1QVFlfSU5QVVQgPSBmYWxzZTtcblxuICAgIC8qIEFsbG93ZWQgWEhUTUwrWE1MIG5hbWVzcGFjZXMgKi9cbiAgICB2YXIgQUxMT1dFRF9OQU1FU1BBQ0VTID0gbnVsbDtcbiAgICB2YXIgREVGQVVMVF9BTExPV0VEX05BTUVTUEFDRVMgPSBhZGRUb1NldCh7fSwgW01BVEhNTF9OQU1FU1BBQ0UsIFNWR19OQU1FU1BBQ0UsIEhUTUxfTkFNRVNQQUNFXSwgc3RyaW5nVG9TdHJpbmcpO1xuXG4gICAgLyogUGFyc2luZyBvZiBzdHJpY3QgWEhUTUwgZG9jdW1lbnRzICovXG4gICAgdmFyIFBBUlNFUl9NRURJQV9UWVBFO1xuICAgIHZhciBTVVBQT1JURURfUEFSU0VSX01FRElBX1RZUEVTID0gWydhcHBsaWNhdGlvbi94aHRtbCt4bWwnLCAndGV4dC9odG1sJ107XG4gICAgdmFyIERFRkFVTFRfUEFSU0VSX01FRElBX1RZUEUgPSAndGV4dC9odG1sJztcbiAgICB2YXIgdHJhbnNmb3JtQ2FzZUZ1bmM7XG5cbiAgICAvKiBLZWVwIGEgcmVmZXJlbmNlIHRvIGNvbmZpZyB0byBwYXNzIHRvIGhvb2tzICovXG4gICAgdmFyIENPTkZJRyA9IG51bGw7XG5cbiAgICAvKiBJZGVhbGx5LCBkbyBub3QgdG91Y2ggYW55dGhpbmcgYmVsb3cgdGhpcyBsaW5lICovXG4gICAgLyogX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXyAqL1xuXG4gICAgdmFyIGZvcm1FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpO1xuICAgIHZhciBpc1JlZ2V4T3JGdW5jdGlvbiA9IGZ1bmN0aW9uIGlzUmVnZXhPckZ1bmN0aW9uKHRlc3RWYWx1ZSkge1xuICAgICAgcmV0dXJuIHRlc3RWYWx1ZSBpbnN0YW5jZW9mIFJlZ0V4cCB8fCB0ZXN0VmFsdWUgaW5zdGFuY2VvZiBGdW5jdGlvbjtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogX3BhcnNlQ29uZmlnXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IGNmZyBvcHRpb25hbCBjb25maWcgbGl0ZXJhbFxuICAgICAqL1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb21wbGV4aXR5XG4gICAgdmFyIF9wYXJzZUNvbmZpZyA9IGZ1bmN0aW9uIF9wYXJzZUNvbmZpZyhjZmcpIHtcbiAgICAgIGlmIChDT05GSUcgJiYgQ09ORklHID09PSBjZmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvKiBTaGllbGQgY29uZmlndXJhdGlvbiBvYmplY3QgZnJvbSB0YW1wZXJpbmcgKi9cbiAgICAgIGlmICghY2ZnIHx8IF90eXBlb2YoY2ZnKSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgY2ZnID0ge307XG4gICAgICB9XG5cbiAgICAgIC8qIFNoaWVsZCBjb25maWd1cmF0aW9uIG9iamVjdCBmcm9tIHByb3RvdHlwZSBwb2xsdXRpb24gKi9cbiAgICAgIGNmZyA9IGNsb25lKGNmZyk7XG4gICAgICBQQVJTRVJfTUVESUFfVFlQRSA9XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgdW5pY29ybi9wcmVmZXItaW5jbHVkZXNcbiAgICAgIFNVUFBPUlRFRF9QQVJTRVJfTUVESUFfVFlQRVMuaW5kZXhPZihjZmcuUEFSU0VSX01FRElBX1RZUEUpID09PSAtMSA/IFBBUlNFUl9NRURJQV9UWVBFID0gREVGQVVMVF9QQVJTRVJfTUVESUFfVFlQRSA6IFBBUlNFUl9NRURJQV9UWVBFID0gY2ZnLlBBUlNFUl9NRURJQV9UWVBFO1xuXG4gICAgICAvLyBIVE1MIHRhZ3MgYW5kIGF0dHJpYnV0ZXMgYXJlIG5vdCBjYXNlLXNlbnNpdGl2ZSwgY29udmVydGluZyB0byBsb3dlcmNhc2UuIEtlZXBpbmcgWEhUTUwgYXMgaXMuXG4gICAgICB0cmFuc2Zvcm1DYXNlRnVuYyA9IFBBUlNFUl9NRURJQV9UWVBFID09PSAnYXBwbGljYXRpb24veGh0bWwreG1sJyA/IHN0cmluZ1RvU3RyaW5nIDogc3RyaW5nVG9Mb3dlckNhc2U7XG5cbiAgICAgIC8qIFNldCBjb25maWd1cmF0aW9uIHBhcmFtZXRlcnMgKi9cbiAgICAgIEFMTE9XRURfVEFHUyA9ICdBTExPV0VEX1RBR1MnIGluIGNmZyA/IGFkZFRvU2V0KHt9LCBjZmcuQUxMT1dFRF9UQUdTLCB0cmFuc2Zvcm1DYXNlRnVuYykgOiBERUZBVUxUX0FMTE9XRURfVEFHUztcbiAgICAgIEFMTE9XRURfQVRUUiA9ICdBTExPV0VEX0FUVFInIGluIGNmZyA/IGFkZFRvU2V0KHt9LCBjZmcuQUxMT1dFRF9BVFRSLCB0cmFuc2Zvcm1DYXNlRnVuYykgOiBERUZBVUxUX0FMTE9XRURfQVRUUjtcbiAgICAgIEFMTE9XRURfTkFNRVNQQUNFUyA9ICdBTExPV0VEX05BTUVTUEFDRVMnIGluIGNmZyA/IGFkZFRvU2V0KHt9LCBjZmcuQUxMT1dFRF9OQU1FU1BBQ0VTLCBzdHJpbmdUb1N0cmluZykgOiBERUZBVUxUX0FMTE9XRURfTkFNRVNQQUNFUztcbiAgICAgIFVSSV9TQUZFX0FUVFJJQlVURVMgPSAnQUREX1VSSV9TQUZFX0FUVFInIGluIGNmZyA/IGFkZFRvU2V0KGNsb25lKERFRkFVTFRfVVJJX1NBRkVfQVRUUklCVVRFUyksXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGluZGVudFxuICAgICAgY2ZnLkFERF9VUklfU0FGRV9BVFRSLFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBpbmRlbnRcbiAgICAgIHRyYW5zZm9ybUNhc2VGdW5jIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgaW5kZW50XG4gICAgICApIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgaW5kZW50XG4gICAgICA6IERFRkFVTFRfVVJJX1NBRkVfQVRUUklCVVRFUztcbiAgICAgIERBVEFfVVJJX1RBR1MgPSAnQUREX0RBVEFfVVJJX1RBR1MnIGluIGNmZyA/IGFkZFRvU2V0KGNsb25lKERFRkFVTFRfREFUQV9VUklfVEFHUyksXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGluZGVudFxuICAgICAgY2ZnLkFERF9EQVRBX1VSSV9UQUdTLFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBpbmRlbnRcbiAgICAgIHRyYW5zZm9ybUNhc2VGdW5jIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgaW5kZW50XG4gICAgICApIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgaW5kZW50XG4gICAgICA6IERFRkFVTFRfREFUQV9VUklfVEFHUztcbiAgICAgIEZPUkJJRF9DT05URU5UUyA9ICdGT1JCSURfQ09OVEVOVFMnIGluIGNmZyA/IGFkZFRvU2V0KHt9LCBjZmcuRk9SQklEX0NPTlRFTlRTLCB0cmFuc2Zvcm1DYXNlRnVuYykgOiBERUZBVUxUX0ZPUkJJRF9DT05URU5UUztcbiAgICAgIEZPUkJJRF9UQUdTID0gJ0ZPUkJJRF9UQUdTJyBpbiBjZmcgPyBhZGRUb1NldCh7fSwgY2ZnLkZPUkJJRF9UQUdTLCB0cmFuc2Zvcm1DYXNlRnVuYykgOiB7fTtcbiAgICAgIEZPUkJJRF9BVFRSID0gJ0ZPUkJJRF9BVFRSJyBpbiBjZmcgPyBhZGRUb1NldCh7fSwgY2ZnLkZPUkJJRF9BVFRSLCB0cmFuc2Zvcm1DYXNlRnVuYykgOiB7fTtcbiAgICAgIFVTRV9QUk9GSUxFUyA9ICdVU0VfUFJPRklMRVMnIGluIGNmZyA/IGNmZy5VU0VfUFJPRklMRVMgOiBmYWxzZTtcbiAgICAgIEFMTE9XX0FSSUFfQVRUUiA9IGNmZy5BTExPV19BUklBX0FUVFIgIT09IGZhbHNlOyAvLyBEZWZhdWx0IHRydWVcbiAgICAgIEFMTE9XX0RBVEFfQVRUUiA9IGNmZy5BTExPV19EQVRBX0FUVFIgIT09IGZhbHNlOyAvLyBEZWZhdWx0IHRydWVcbiAgICAgIEFMTE9XX1VOS05PV05fUFJPVE9DT0xTID0gY2ZnLkFMTE9XX1VOS05PV05fUFJPVE9DT0xTIHx8IGZhbHNlOyAvLyBEZWZhdWx0IGZhbHNlXG4gICAgICBBTExPV19TRUxGX0NMT1NFX0lOX0FUVFIgPSBjZmcuQUxMT1dfU0VMRl9DTE9TRV9JTl9BVFRSICE9PSBmYWxzZTsgLy8gRGVmYXVsdCB0cnVlXG4gICAgICBTQUZFX0ZPUl9URU1QTEFURVMgPSBjZmcuU0FGRV9GT1JfVEVNUExBVEVTIHx8IGZhbHNlOyAvLyBEZWZhdWx0IGZhbHNlXG4gICAgICBTQUZFX0ZPUl9YTUwgPSBjZmcuU0FGRV9GT1JfWE1MICE9PSBmYWxzZTsgLy8gRGVmYXVsdCB0cnVlXG4gICAgICBXSE9MRV9ET0NVTUVOVCA9IGNmZy5XSE9MRV9ET0NVTUVOVCB8fCBmYWxzZTsgLy8gRGVmYXVsdCBmYWxzZVxuICAgICAgUkVUVVJOX0RPTSA9IGNmZy5SRVRVUk5fRE9NIHx8IGZhbHNlOyAvLyBEZWZhdWx0IGZhbHNlXG4gICAgICBSRVRVUk5fRE9NX0ZSQUdNRU5UID0gY2ZnLlJFVFVSTl9ET01fRlJBR01FTlQgfHwgZmFsc2U7IC8vIERlZmF1bHQgZmFsc2VcbiAgICAgIFJFVFVSTl9UUlVTVEVEX1RZUEUgPSBjZmcuUkVUVVJOX1RSVVNURURfVFlQRSB8fCBmYWxzZTsgLy8gRGVmYXVsdCBmYWxzZVxuICAgICAgRk9SQ0VfQk9EWSA9IGNmZy5GT1JDRV9CT0RZIHx8IGZhbHNlOyAvLyBEZWZhdWx0IGZhbHNlXG4gICAgICBTQU5JVElaRV9ET00gPSBjZmcuU0FOSVRJWkVfRE9NICE9PSBmYWxzZTsgLy8gRGVmYXVsdCB0cnVlXG4gICAgICBTQU5JVElaRV9OQU1FRF9QUk9QUyA9IGNmZy5TQU5JVElaRV9OQU1FRF9QUk9QUyB8fCBmYWxzZTsgLy8gRGVmYXVsdCBmYWxzZVxuICAgICAgS0VFUF9DT05URU5UID0gY2ZnLktFRVBfQ09OVEVOVCAhPT0gZmFsc2U7IC8vIERlZmF1bHQgdHJ1ZVxuICAgICAgSU5fUExBQ0UgPSBjZmcuSU5fUExBQ0UgfHwgZmFsc2U7IC8vIERlZmF1bHQgZmFsc2VcbiAgICAgIElTX0FMTE9XRURfVVJJJDEgPSBjZmcuQUxMT1dFRF9VUklfUkVHRVhQIHx8IElTX0FMTE9XRURfVVJJJDE7XG4gICAgICBOQU1FU1BBQ0UgPSBjZmcuTkFNRVNQQUNFIHx8IEhUTUxfTkFNRVNQQUNFO1xuICAgICAgQ1VTVE9NX0VMRU1FTlRfSEFORExJTkcgPSBjZmcuQ1VTVE9NX0VMRU1FTlRfSEFORExJTkcgfHwge307XG4gICAgICBpZiAoY2ZnLkNVU1RPTV9FTEVNRU5UX0hBTkRMSU5HICYmIGlzUmVnZXhPckZ1bmN0aW9uKGNmZy5DVVNUT01fRUxFTUVOVF9IQU5ETElORy50YWdOYW1lQ2hlY2spKSB7XG4gICAgICAgIENVU1RPTV9FTEVNRU5UX0hBTkRMSU5HLnRhZ05hbWVDaGVjayA9IGNmZy5DVVNUT01fRUxFTUVOVF9IQU5ETElORy50YWdOYW1lQ2hlY2s7XG4gICAgICB9XG4gICAgICBpZiAoY2ZnLkNVU1RPTV9FTEVNRU5UX0hBTkRMSU5HICYmIGlzUmVnZXhPckZ1bmN0aW9uKGNmZy5DVVNUT01fRUxFTUVOVF9IQU5ETElORy5hdHRyaWJ1dGVOYW1lQ2hlY2spKSB7XG4gICAgICAgIENVU1RPTV9FTEVNRU5UX0hBTkRMSU5HLmF0dHJpYnV0ZU5hbWVDaGVjayA9IGNmZy5DVVNUT01fRUxFTUVOVF9IQU5ETElORy5hdHRyaWJ1dGVOYW1lQ2hlY2s7XG4gICAgICB9XG4gICAgICBpZiAoY2ZnLkNVU1RPTV9FTEVNRU5UX0hBTkRMSU5HICYmIHR5cGVvZiBjZmcuQ1VTVE9NX0VMRU1FTlRfSEFORExJTkcuYWxsb3dDdXN0b21pemVkQnVpbHRJbkVsZW1lbnRzID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgQ1VTVE9NX0VMRU1FTlRfSEFORExJTkcuYWxsb3dDdXN0b21pemVkQnVpbHRJbkVsZW1lbnRzID0gY2ZnLkNVU1RPTV9FTEVNRU5UX0hBTkRMSU5HLmFsbG93Q3VzdG9taXplZEJ1aWx0SW5FbGVtZW50cztcbiAgICAgIH1cbiAgICAgIGlmIChTQUZFX0ZPUl9URU1QTEFURVMpIHtcbiAgICAgICAgQUxMT1dfREFUQV9BVFRSID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoUkVUVVJOX0RPTV9GUkFHTUVOVCkge1xuICAgICAgICBSRVRVUk5fRE9NID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLyogUGFyc2UgcHJvZmlsZSBpbmZvICovXG4gICAgICBpZiAoVVNFX1BST0ZJTEVTKSB7XG4gICAgICAgIEFMTE9XRURfVEFHUyA9IGFkZFRvU2V0KHt9LCBfdG9Db25zdW1hYmxlQXJyYXkodGV4dCkpO1xuICAgICAgICBBTExPV0VEX0FUVFIgPSBbXTtcbiAgICAgICAgaWYgKFVTRV9QUk9GSUxFUy5odG1sID09PSB0cnVlKSB7XG4gICAgICAgICAgYWRkVG9TZXQoQUxMT1dFRF9UQUdTLCBodG1sJDEpO1xuICAgICAgICAgIGFkZFRvU2V0KEFMTE9XRURfQVRUUiwgaHRtbCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFVTRV9QUk9GSUxFUy5zdmcgPT09IHRydWUpIHtcbiAgICAgICAgICBhZGRUb1NldChBTExPV0VEX1RBR1MsIHN2ZyQxKTtcbiAgICAgICAgICBhZGRUb1NldChBTExPV0VEX0FUVFIsIHN2Zyk7XG4gICAgICAgICAgYWRkVG9TZXQoQUxMT1dFRF9BVFRSLCB4bWwpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChVU0VfUFJPRklMRVMuc3ZnRmlsdGVycyA9PT0gdHJ1ZSkge1xuICAgICAgICAgIGFkZFRvU2V0KEFMTE9XRURfVEFHUywgc3ZnRmlsdGVycyk7XG4gICAgICAgICAgYWRkVG9TZXQoQUxMT1dFRF9BVFRSLCBzdmcpO1xuICAgICAgICAgIGFkZFRvU2V0KEFMTE9XRURfQVRUUiwgeG1sKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoVVNFX1BST0ZJTEVTLm1hdGhNbCA9PT0gdHJ1ZSkge1xuICAgICAgICAgIGFkZFRvU2V0KEFMTE9XRURfVEFHUywgbWF0aE1sJDEpO1xuICAgICAgICAgIGFkZFRvU2V0KEFMTE9XRURfQVRUUiwgbWF0aE1sKTtcbiAgICAgICAgICBhZGRUb1NldChBTExPV0VEX0FUVFIsIHhtbCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyogTWVyZ2UgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXJzICovXG4gICAgICBpZiAoY2ZnLkFERF9UQUdTKSB7XG4gICAgICAgIGlmIChBTExPV0VEX1RBR1MgPT09IERFRkFVTFRfQUxMT1dFRF9UQUdTKSB7XG4gICAgICAgICAgQUxMT1dFRF9UQUdTID0gY2xvbmUoQUxMT1dFRF9UQUdTKTtcbiAgICAgICAgfVxuICAgICAgICBhZGRUb1NldChBTExPV0VEX1RBR1MsIGNmZy5BRERfVEFHUywgdHJhbnNmb3JtQ2FzZUZ1bmMpO1xuICAgICAgfVxuICAgICAgaWYgKGNmZy5BRERfQVRUUikge1xuICAgICAgICBpZiAoQUxMT1dFRF9BVFRSID09PSBERUZBVUxUX0FMTE9XRURfQVRUUikge1xuICAgICAgICAgIEFMTE9XRURfQVRUUiA9IGNsb25lKEFMTE9XRURfQVRUUik7XG4gICAgICAgIH1cbiAgICAgICAgYWRkVG9TZXQoQUxMT1dFRF9BVFRSLCBjZmcuQUREX0FUVFIsIHRyYW5zZm9ybUNhc2VGdW5jKTtcbiAgICAgIH1cbiAgICAgIGlmIChjZmcuQUREX1VSSV9TQUZFX0FUVFIpIHtcbiAgICAgICAgYWRkVG9TZXQoVVJJX1NBRkVfQVRUUklCVVRFUywgY2ZnLkFERF9VUklfU0FGRV9BVFRSLCB0cmFuc2Zvcm1DYXNlRnVuYyk7XG4gICAgICB9XG4gICAgICBpZiAoY2ZnLkZPUkJJRF9DT05URU5UUykge1xuICAgICAgICBpZiAoRk9SQklEX0NPTlRFTlRTID09PSBERUZBVUxUX0ZPUkJJRF9DT05URU5UUykge1xuICAgICAgICAgIEZPUkJJRF9DT05URU5UUyA9IGNsb25lKEZPUkJJRF9DT05URU5UUyk7XG4gICAgICAgIH1cbiAgICAgICAgYWRkVG9TZXQoRk9SQklEX0NPTlRFTlRTLCBjZmcuRk9SQklEX0NPTlRFTlRTLCB0cmFuc2Zvcm1DYXNlRnVuYyk7XG4gICAgICB9XG5cbiAgICAgIC8qIEFkZCAjdGV4dCBpbiBjYXNlIEtFRVBfQ09OVEVOVCBpcyBzZXQgdG8gdHJ1ZSAqL1xuICAgICAgaWYgKEtFRVBfQ09OVEVOVCkge1xuICAgICAgICBBTExPV0VEX1RBR1NbJyN0ZXh0J10gPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvKiBBZGQgaHRtbCwgaGVhZCBhbmQgYm9keSB0byBBTExPV0VEX1RBR1MgaW4gY2FzZSBXSE9MRV9ET0NVTUVOVCBpcyB0cnVlICovXG4gICAgICBpZiAoV0hPTEVfRE9DVU1FTlQpIHtcbiAgICAgICAgYWRkVG9TZXQoQUxMT1dFRF9UQUdTLCBbJ2h0bWwnLCAnaGVhZCcsICdib2R5J10pO1xuICAgICAgfVxuXG4gICAgICAvKiBBZGQgdGJvZHkgdG8gQUxMT1dFRF9UQUdTIGluIGNhc2UgdGFibGVzIGFyZSBwZXJtaXR0ZWQsIHNlZSAjMjg2LCAjMzY1ICovXG4gICAgICBpZiAoQUxMT1dFRF9UQUdTLnRhYmxlKSB7XG4gICAgICAgIGFkZFRvU2V0KEFMTE9XRURfVEFHUywgWyd0Ym9keSddKTtcbiAgICAgICAgZGVsZXRlIEZPUkJJRF9UQUdTLnRib2R5O1xuICAgICAgfVxuXG4gICAgICAvLyBQcmV2ZW50IGZ1cnRoZXIgbWFuaXB1bGF0aW9uIG9mIGNvbmZpZ3VyYXRpb24uXG4gICAgICAvLyBOb3QgYXZhaWxhYmxlIGluIElFOCwgU2FmYXJpIDUsIGV0Yy5cbiAgICAgIGlmIChmcmVlemUpIHtcbiAgICAgICAgZnJlZXplKGNmZyk7XG4gICAgICB9XG4gICAgICBDT05GSUcgPSBjZmc7XG4gICAgfTtcbiAgICB2YXIgTUFUSE1MX1RFWFRfSU5URUdSQVRJT05fUE9JTlRTID0gYWRkVG9TZXQoe30sIFsnbWknLCAnbW8nLCAnbW4nLCAnbXMnLCAnbXRleHQnXSk7XG4gICAgdmFyIEhUTUxfSU5URUdSQVRJT05fUE9JTlRTID0gYWRkVG9TZXQoe30sIFsnYW5ub3RhdGlvbi14bWwnXSk7XG5cbiAgICAvLyBDZXJ0YWluIGVsZW1lbnRzIGFyZSBhbGxvd2VkIGluIGJvdGggU1ZHIGFuZCBIVE1MXG4gICAgLy8gbmFtZXNwYWNlLiBXZSBuZWVkIHRvIHNwZWNpZnkgdGhlbSBleHBsaWNpdGx5XG4gICAgLy8gc28gdGhhdCB0aGV5IGRvbid0IGdldCBlcnJvbmVvdXNseSBkZWxldGVkIGZyb21cbiAgICAvLyBIVE1MIG5hbWVzcGFjZS5cbiAgICB2YXIgQ09NTU9OX1NWR19BTkRfSFRNTF9FTEVNRU5UUyA9IGFkZFRvU2V0KHt9LCBbJ3RpdGxlJywgJ3N0eWxlJywgJ2ZvbnQnLCAnYScsICdzY3JpcHQnXSk7XG5cbiAgICAvKiBLZWVwIHRyYWNrIG9mIGFsbCBwb3NzaWJsZSBTVkcgYW5kIE1hdGhNTCB0YWdzXG4gICAgICogc28gdGhhdCB3ZSBjYW4gcGVyZm9ybSB0aGUgbmFtZXNwYWNlIGNoZWNrc1xuICAgICAqIGNvcnJlY3RseS4gKi9cbiAgICB2YXIgQUxMX1NWR19UQUdTID0gYWRkVG9TZXQoe30sIHN2ZyQxKTtcbiAgICBhZGRUb1NldChBTExfU1ZHX1RBR1MsIHN2Z0ZpbHRlcnMpO1xuICAgIGFkZFRvU2V0KEFMTF9TVkdfVEFHUywgc3ZnRGlzYWxsb3dlZCk7XG4gICAgdmFyIEFMTF9NQVRITUxfVEFHUyA9IGFkZFRvU2V0KHt9LCBtYXRoTWwkMSk7XG4gICAgYWRkVG9TZXQoQUxMX01BVEhNTF9UQUdTLCBtYXRoTWxEaXNhbGxvd2VkKTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtFbGVtZW50fSBlbGVtZW50IGEgRE9NIGVsZW1lbnQgd2hvc2UgbmFtZXNwYWNlIGlzIGJlaW5nIGNoZWNrZWRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJuIGZhbHNlIGlmIHRoZSBlbGVtZW50IGhhcyBhXG4gICAgICogIG5hbWVzcGFjZSB0aGF0IGEgc3BlYy1jb21wbGlhbnQgcGFyc2VyIHdvdWxkIG5ldmVyXG4gICAgICogIHJldHVybi4gUmV0dXJuIHRydWUgb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHZhciBfY2hlY2tWYWxpZE5hbWVzcGFjZSA9IGZ1bmN0aW9uIF9jaGVja1ZhbGlkTmFtZXNwYWNlKGVsZW1lbnQpIHtcbiAgICAgIHZhciBwYXJlbnQgPSBnZXRQYXJlbnROb2RlKGVsZW1lbnQpO1xuXG4gICAgICAvLyBJbiBKU0RPTSwgaWYgd2UncmUgaW5zaWRlIHNoYWRvdyBET00sIHRoZW4gcGFyZW50Tm9kZVxuICAgICAgLy8gY2FuIGJlIG51bGwuIFdlIGp1c3Qgc2ltdWxhdGUgcGFyZW50IGluIHRoaXMgY2FzZS5cbiAgICAgIGlmICghcGFyZW50IHx8ICFwYXJlbnQudGFnTmFtZSkge1xuICAgICAgICBwYXJlbnQgPSB7XG4gICAgICAgICAgbmFtZXNwYWNlVVJJOiBOQU1FU1BBQ0UsXG4gICAgICAgICAgdGFnTmFtZTogJ3RlbXBsYXRlJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgdmFyIHRhZ05hbWUgPSBzdHJpbmdUb0xvd2VyQ2FzZShlbGVtZW50LnRhZ05hbWUpO1xuICAgICAgdmFyIHBhcmVudFRhZ05hbWUgPSBzdHJpbmdUb0xvd2VyQ2FzZShwYXJlbnQudGFnTmFtZSk7XG4gICAgICBpZiAoIUFMTE9XRURfTkFNRVNQQUNFU1tlbGVtZW50Lm5hbWVzcGFjZVVSSV0pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGVsZW1lbnQubmFtZXNwYWNlVVJJID09PSBTVkdfTkFNRVNQQUNFKSB7XG4gICAgICAgIC8vIFRoZSBvbmx5IHdheSB0byBzd2l0Y2ggZnJvbSBIVE1MIG5hbWVzcGFjZSB0byBTVkdcbiAgICAgICAgLy8gaXMgdmlhIDxzdmc+LiBJZiBpdCBoYXBwZW5zIHZpYSBhbnkgb3RoZXIgdGFnLCB0aGVuXG4gICAgICAgIC8vIGl0IHNob3VsZCBiZSBraWxsZWQuXG4gICAgICAgIGlmIChwYXJlbnQubmFtZXNwYWNlVVJJID09PSBIVE1MX05BTUVTUEFDRSkge1xuICAgICAgICAgIHJldHVybiB0YWdOYW1lID09PSAnc3ZnJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBvbmx5IHdheSB0byBzd2l0Y2ggZnJvbSBNYXRoTUwgdG8gU1ZHIGlzIHZpYWBcbiAgICAgICAgLy8gc3ZnIGlmIHBhcmVudCBpcyBlaXRoZXIgPGFubm90YXRpb24teG1sPiBvciBNYXRoTUxcbiAgICAgICAgLy8gdGV4dCBpbnRlZ3JhdGlvbiBwb2ludHMuXG4gICAgICAgIGlmIChwYXJlbnQubmFtZXNwYWNlVVJJID09PSBNQVRITUxfTkFNRVNQQUNFKSB7XG4gICAgICAgICAgcmV0dXJuIHRhZ05hbWUgPT09ICdzdmcnICYmIChwYXJlbnRUYWdOYW1lID09PSAnYW5ub3RhdGlvbi14bWwnIHx8IE1BVEhNTF9URVhUX0lOVEVHUkFUSU9OX1BPSU5UU1twYXJlbnRUYWdOYW1lXSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXZSBvbmx5IGFsbG93IGVsZW1lbnRzIHRoYXQgYXJlIGRlZmluZWQgaW4gU1ZHXG4gICAgICAgIC8vIHNwZWMuIEFsbCBvdGhlcnMgYXJlIGRpc2FsbG93ZWQgaW4gU1ZHIG5hbWVzcGFjZS5cbiAgICAgICAgcmV0dXJuIEJvb2xlYW4oQUxMX1NWR19UQUdTW3RhZ05hbWVdKTtcbiAgICAgIH1cbiAgICAgIGlmIChlbGVtZW50Lm5hbWVzcGFjZVVSSSA9PT0gTUFUSE1MX05BTUVTUEFDRSkge1xuICAgICAgICAvLyBUaGUgb25seSB3YXkgdG8gc3dpdGNoIGZyb20gSFRNTCBuYW1lc3BhY2UgdG8gTWF0aE1MXG4gICAgICAgIC8vIGlzIHZpYSA8bWF0aD4uIElmIGl0IGhhcHBlbnMgdmlhIGFueSBvdGhlciB0YWcsIHRoZW5cbiAgICAgICAgLy8gaXQgc2hvdWxkIGJlIGtpbGxlZC5cbiAgICAgICAgaWYgKHBhcmVudC5uYW1lc3BhY2VVUkkgPT09IEhUTUxfTkFNRVNQQUNFKSB7XG4gICAgICAgICAgcmV0dXJuIHRhZ05hbWUgPT09ICdtYXRoJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBvbmx5IHdheSB0byBzd2l0Y2ggZnJvbSBTVkcgdG8gTWF0aE1MIGlzIHZpYVxuICAgICAgICAvLyA8bWF0aD4gYW5kIEhUTUwgaW50ZWdyYXRpb24gcG9pbnRzXG4gICAgICAgIGlmIChwYXJlbnQubmFtZXNwYWNlVVJJID09PSBTVkdfTkFNRVNQQUNFKSB7XG4gICAgICAgICAgcmV0dXJuIHRhZ05hbWUgPT09ICdtYXRoJyAmJiBIVE1MX0lOVEVHUkFUSU9OX1BPSU5UU1twYXJlbnRUYWdOYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdlIG9ubHkgYWxsb3cgZWxlbWVudHMgdGhhdCBhcmUgZGVmaW5lZCBpbiBNYXRoTUxcbiAgICAgICAgLy8gc3BlYy4gQWxsIG90aGVycyBhcmUgZGlzYWxsb3dlZCBpbiBNYXRoTUwgbmFtZXNwYWNlLlxuICAgICAgICByZXR1cm4gQm9vbGVhbihBTExfTUFUSE1MX1RBR1NbdGFnTmFtZV0pO1xuICAgICAgfVxuICAgICAgaWYgKGVsZW1lbnQubmFtZXNwYWNlVVJJID09PSBIVE1MX05BTUVTUEFDRSkge1xuICAgICAgICAvLyBUaGUgb25seSB3YXkgdG8gc3dpdGNoIGZyb20gU1ZHIHRvIEhUTUwgaXMgdmlhXG4gICAgICAgIC8vIEhUTUwgaW50ZWdyYXRpb24gcG9pbnRzLCBhbmQgZnJvbSBNYXRoTUwgdG8gSFRNTFxuICAgICAgICAvLyBpcyB2aWEgTWF0aE1MIHRleHQgaW50ZWdyYXRpb24gcG9pbnRzXG4gICAgICAgIGlmIChwYXJlbnQubmFtZXNwYWNlVVJJID09PSBTVkdfTkFNRVNQQUNFICYmICFIVE1MX0lOVEVHUkFUSU9OX1BPSU5UU1twYXJlbnRUYWdOYW1lXSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyZW50Lm5hbWVzcGFjZVVSSSA9PT0gTUFUSE1MX05BTUVTUEFDRSAmJiAhTUFUSE1MX1RFWFRfSU5URUdSQVRJT05fUE9JTlRTW3BhcmVudFRhZ05hbWVdKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2UgZGlzYWxsb3cgdGFncyB0aGF0IGFyZSBzcGVjaWZpYyBmb3IgTWF0aE1MXG4gICAgICAgIC8vIG9yIFNWRyBhbmQgc2hvdWxkIG5ldmVyIGFwcGVhciBpbiBIVE1MIG5hbWVzcGFjZVxuICAgICAgICByZXR1cm4gIUFMTF9NQVRITUxfVEFHU1t0YWdOYW1lXSAmJiAoQ09NTU9OX1NWR19BTkRfSFRNTF9FTEVNRU5UU1t0YWdOYW1lXSB8fCAhQUxMX1NWR19UQUdTW3RhZ05hbWVdKTtcbiAgICAgIH1cblxuICAgICAgLy8gRm9yIFhIVE1MIGFuZCBYTUwgZG9jdW1lbnRzIHRoYXQgc3VwcG9ydCBjdXN0b20gbmFtZXNwYWNlc1xuICAgICAgaWYgKFBBUlNFUl9NRURJQV9UWVBFID09PSAnYXBwbGljYXRpb24veGh0bWwreG1sJyAmJiBBTExPV0VEX05BTUVTUEFDRVNbZWxlbWVudC5uYW1lc3BhY2VVUkldKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29kZSBzaG91bGQgbmV2ZXIgcmVhY2ggdGhpcyBwbGFjZSAodGhpcyBtZWFuc1xuICAgICAgLy8gdGhhdCB0aGUgZWxlbWVudCBzb21laG93IGdvdCBuYW1lc3BhY2UgdGhhdCBpcyBub3RcbiAgICAgIC8vIEhUTUwsIFNWRywgTWF0aE1MIG9yIGFsbG93ZWQgdmlhIEFMTE9XRURfTkFNRVNQQUNFUykuXG4gICAgICAvLyBSZXR1cm4gZmFsc2UganVzdCBpbiBjYXNlLlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBfZm9yY2VSZW1vdmVcbiAgICAgKlxuICAgICAqIEBwYXJhbSAge05vZGV9IG5vZGUgYSBET00gbm9kZVxuICAgICAqL1xuICAgIHZhciBfZm9yY2VSZW1vdmUgPSBmdW5jdGlvbiBfZm9yY2VSZW1vdmUobm9kZSkge1xuICAgICAgYXJyYXlQdXNoKERPTVB1cmlmeS5yZW1vdmVkLCB7XG4gICAgICAgIGVsZW1lbnQ6IG5vZGVcbiAgICAgIH0pO1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHVuaWNvcm4vcHJlZmVyLWRvbS1ub2RlLXJlbW92ZVxuICAgICAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbm9kZS5vdXRlckhUTUwgPSBlbXB0eUhUTUw7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICBub2RlLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIF9yZW1vdmVBdHRyaWJ1dGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZSBhbiBBdHRyaWJ1dGUgbmFtZVxuICAgICAqIEBwYXJhbSAge05vZGV9IG5vZGUgYSBET00gbm9kZVxuICAgICAqL1xuICAgIHZhciBfcmVtb3ZlQXR0cmlidXRlID0gZnVuY3Rpb24gX3JlbW92ZUF0dHJpYnV0ZShuYW1lLCBub2RlKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhcnJheVB1c2goRE9NUHVyaWZ5LnJlbW92ZWQsIHtcbiAgICAgICAgICBhdHRyaWJ1dGU6IG5vZGUuZ2V0QXR0cmlidXRlTm9kZShuYW1lKSxcbiAgICAgICAgICBmcm9tOiBub2RlXG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICBhcnJheVB1c2goRE9NUHVyaWZ5LnJlbW92ZWQsIHtcbiAgICAgICAgICBhdHRyaWJ1dGU6IG51bGwsXG4gICAgICAgICAgZnJvbTogbm9kZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuXG4gICAgICAvLyBXZSB2b2lkIGF0dHJpYnV0ZSB2YWx1ZXMgZm9yIHVucmVtb3ZhYmxlIFwiaXNcIlwiIGF0dHJpYnV0ZXNcbiAgICAgIGlmIChuYW1lID09PSAnaXMnICYmICFBTExPV0VEX0FUVFJbbmFtZV0pIHtcbiAgICAgICAgaWYgKFJFVFVSTl9ET00gfHwgUkVUVVJOX0RPTV9GUkFHTUVOVCkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBfZm9yY2VSZW1vdmUobm9kZSk7XG4gICAgICAgICAgfSBjYXRjaCAoXykge31cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUobmFtZSwgJycpO1xuICAgICAgICAgIH0gY2F0Y2ggKF8pIHt9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogX2luaXREb2N1bWVudFxuICAgICAqXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBkaXJ0eSBhIHN0cmluZyBvZiBkaXJ0eSBtYXJrdXBcbiAgICAgKiBAcmV0dXJuIHtEb2N1bWVudH0gYSBET00sIGZpbGxlZCB3aXRoIHRoZSBkaXJ0eSBtYXJrdXBcbiAgICAgKi9cbiAgICB2YXIgX2luaXREb2N1bWVudCA9IGZ1bmN0aW9uIF9pbml0RG9jdW1lbnQoZGlydHkpIHtcbiAgICAgIC8qIENyZWF0ZSBhIEhUTUwgZG9jdW1lbnQgKi9cbiAgICAgIHZhciBkb2M7XG4gICAgICB2YXIgbGVhZGluZ1doaXRlc3BhY2U7XG4gICAgICBpZiAoRk9SQ0VfQk9EWSkge1xuICAgICAgICBkaXJ0eSA9ICc8cmVtb3ZlPjwvcmVtb3ZlPicgKyBkaXJ0eTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qIElmIEZPUkNFX0JPRFkgaXNuJ3QgdXNlZCwgbGVhZGluZyB3aGl0ZXNwYWNlIG5lZWRzIHRvIGJlIHByZXNlcnZlZCBtYW51YWxseSAqL1xuICAgICAgICB2YXIgbWF0Y2hlcyA9IHN0cmluZ01hdGNoKGRpcnR5LCAvXltcXHJcXG5cXHQgXSsvKTtcbiAgICAgICAgbGVhZGluZ1doaXRlc3BhY2UgPSBtYXRjaGVzICYmIG1hdGNoZXNbMF07XG4gICAgICB9XG4gICAgICBpZiAoUEFSU0VSX01FRElBX1RZUEUgPT09ICdhcHBsaWNhdGlvbi94aHRtbCt4bWwnICYmIE5BTUVTUEFDRSA9PT0gSFRNTF9OQU1FU1BBQ0UpIHtcbiAgICAgICAgLy8gUm9vdCBvZiBYSFRNTCBkb2MgbXVzdCBjb250YWluIHhtbG5zIGRlY2xhcmF0aW9uIChzZWUgaHR0cHM6Ly93d3cudzMub3JnL1RSL3hodG1sMS9ub3JtYXRpdmUuaHRtbCNzdHJpY3QpXG4gICAgICAgIGRpcnR5ID0gJzxodG1sIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiPjxoZWFkPjwvaGVhZD48Ym9keT4nICsgZGlydHkgKyAnPC9ib2R5PjwvaHRtbD4nO1xuICAgICAgfVxuICAgICAgdmFyIGRpcnR5UGF5bG9hZCA9IHRydXN0ZWRUeXBlc1BvbGljeSA/IHRydXN0ZWRUeXBlc1BvbGljeS5jcmVhdGVIVE1MKGRpcnR5KSA6IGRpcnR5O1xuICAgICAgLypcbiAgICAgICAqIFVzZSB0aGUgRE9NUGFyc2VyIEFQSSBieSBkZWZhdWx0LCBmYWxsYmFjayBsYXRlciBpZiBuZWVkcyBiZVxuICAgICAgICogRE9NUGFyc2VyIG5vdCB3b3JrIGZvciBzdmcgd2hlbiBoYXMgbXVsdGlwbGUgcm9vdCBlbGVtZW50LlxuICAgICAgICovXG4gICAgICBpZiAoTkFNRVNQQUNFID09PSBIVE1MX05BTUVTUEFDRSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGRvYyA9IG5ldyBET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcoZGlydHlQYXlsb2FkLCBQQVJTRVJfTUVESUFfVFlQRSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHt9XG4gICAgICB9XG5cbiAgICAgIC8qIFVzZSBjcmVhdGVIVE1MRG9jdW1lbnQgaW4gY2FzZSBET01QYXJzZXIgaXMgbm90IGF2YWlsYWJsZSAqL1xuICAgICAgaWYgKCFkb2MgfHwgIWRvYy5kb2N1bWVudEVsZW1lbnQpIHtcbiAgICAgICAgZG9jID0gaW1wbGVtZW50YXRpb24uY3JlYXRlRG9jdW1lbnQoTkFNRVNQQUNFLCAndGVtcGxhdGUnLCBudWxsKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBkb2MuZG9jdW1lbnRFbGVtZW50LmlubmVySFRNTCA9IElTX0VNUFRZX0lOUFVUID8gZW1wdHlIVE1MIDogZGlydHlQYXlsb2FkO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgLy8gU3ludGF4IGVycm9yIGlmIGRpcnR5UGF5bG9hZCBpcyBpbnZhbGlkIHhtbFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgYm9keSA9IGRvYy5ib2R5IHx8IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICBpZiAoZGlydHkgJiYgbGVhZGluZ1doaXRlc3BhY2UpIHtcbiAgICAgICAgYm9keS5pbnNlcnRCZWZvcmUoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobGVhZGluZ1doaXRlc3BhY2UpLCBib2R5LmNoaWxkTm9kZXNbMF0gfHwgbnVsbCk7XG4gICAgICB9XG5cbiAgICAgIC8qIFdvcmsgb24gd2hvbGUgZG9jdW1lbnQgb3IganVzdCBpdHMgYm9keSAqL1xuICAgICAgaWYgKE5BTUVTUEFDRSA9PT0gSFRNTF9OQU1FU1BBQ0UpIHtcbiAgICAgICAgcmV0dXJuIGdldEVsZW1lbnRzQnlUYWdOYW1lLmNhbGwoZG9jLCBXSE9MRV9ET0NVTUVOVCA/ICdodG1sJyA6ICdib2R5JylbMF07XG4gICAgICB9XG4gICAgICByZXR1cm4gV0hPTEVfRE9DVU1FTlQgPyBkb2MuZG9jdW1lbnRFbGVtZW50IDogYm9keTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogX2NyZWF0ZUl0ZXJhdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtEb2N1bWVudH0gcm9vdCBkb2N1bWVudC9mcmFnbWVudCB0byBjcmVhdGUgaXRlcmF0b3IgZm9yXG4gICAgICogQHJldHVybiB7SXRlcmF0b3J9IGl0ZXJhdG9yIGluc3RhbmNlXG4gICAgICovXG4gICAgdmFyIF9jcmVhdGVJdGVyYXRvciA9IGZ1bmN0aW9uIF9jcmVhdGVJdGVyYXRvcihyb290KSB7XG4gICAgICByZXR1cm4gY3JlYXRlTm9kZUl0ZXJhdG9yLmNhbGwocm9vdC5vd25lckRvY3VtZW50IHx8IHJvb3QsIHJvb3QsXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYml0d2lzZVxuICAgICAgTm9kZUZpbHRlci5TSE9XX0VMRU1FTlQgfCBOb2RlRmlsdGVyLlNIT1dfQ09NTUVOVCB8IE5vZGVGaWx0ZXIuU0hPV19URVhUIHwgTm9kZUZpbHRlci5TSE9XX1BST0NFU1NJTkdfSU5TVFJVQ1RJT04gfCBOb2RlRmlsdGVyLlNIT1dfQ0RBVEFfU0VDVElPTiwgbnVsbCwgZmFsc2UpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBfaXNDbG9iYmVyZWRcbiAgICAgKlxuICAgICAqIEBwYXJhbSAge05vZGV9IGVsbSBlbGVtZW50IHRvIGNoZWNrIGZvciBjbG9iYmVyaW5nIGF0dGFja3NcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGNsb2JiZXJlZCwgZmFsc2UgaWYgc2FmZVxuICAgICAqL1xuICAgIHZhciBfaXNDbG9iYmVyZWQgPSBmdW5jdGlvbiBfaXNDbG9iYmVyZWQoZWxtKSB7XG4gICAgICByZXR1cm4gZWxtIGluc3RhbmNlb2YgSFRNTEZvcm1FbGVtZW50ICYmICh0eXBlb2YgZWxtLm5vZGVOYW1lICE9PSAnc3RyaW5nJyB8fCB0eXBlb2YgZWxtLnRleHRDb250ZW50ICE9PSAnc3RyaW5nJyB8fCB0eXBlb2YgZWxtLnJlbW92ZUNoaWxkICE9PSAnZnVuY3Rpb24nIHx8ICEoZWxtLmF0dHJpYnV0ZXMgaW5zdGFuY2VvZiBOYW1lZE5vZGVNYXApIHx8IHR5cGVvZiBlbG0ucmVtb3ZlQXR0cmlidXRlICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlbG0uc2V0QXR0cmlidXRlICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlbG0ubmFtZXNwYWNlVVJJICE9PSAnc3RyaW5nJyB8fCB0eXBlb2YgZWxtLmluc2VydEJlZm9yZSAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgZWxtLmhhc0NoaWxkTm9kZXMgIT09ICdmdW5jdGlvbicpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBfaXNOb2RlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtOb2RlfSBvYmogb2JqZWN0IHRvIGNoZWNrIHdoZXRoZXIgaXQncyBhIERPTSBub2RlXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZSBpcyBvYmplY3QgaXMgYSBET00gbm9kZVxuICAgICAqL1xuICAgIHZhciBfaXNOb2RlID0gZnVuY3Rpb24gX2lzTm9kZShvYmplY3QpIHtcbiAgICAgIHJldHVybiBfdHlwZW9mKE5vZGUpID09PSAnb2JqZWN0JyA/IG9iamVjdCBpbnN0YW5jZW9mIE5vZGUgOiBvYmplY3QgJiYgX3R5cGVvZihvYmplY3QpID09PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb2JqZWN0Lm5vZGVUeXBlID09PSAnbnVtYmVyJyAmJiB0eXBlb2Ygb2JqZWN0Lm5vZGVOYW1lID09PSAnc3RyaW5nJztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogX2V4ZWN1dGVIb29rXG4gICAgICogRXhlY3V0ZSB1c2VyIGNvbmZpZ3VyYWJsZSBob29rc1xuICAgICAqXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBlbnRyeVBvaW50ICBOYW1lIG9mIHRoZSBob29rJ3MgZW50cnkgcG9pbnRcbiAgICAgKiBAcGFyYW0gIHtOb2RlfSBjdXJyZW50Tm9kZSBub2RlIHRvIHdvcmsgb24gd2l0aCB0aGUgaG9va1xuICAgICAqIEBwYXJhbSAge09iamVjdH0gZGF0YSBhZGRpdGlvbmFsIGhvb2sgcGFyYW1ldGVyc1xuICAgICAqL1xuICAgIHZhciBfZXhlY3V0ZUhvb2sgPSBmdW5jdGlvbiBfZXhlY3V0ZUhvb2soZW50cnlQb2ludCwgY3VycmVudE5vZGUsIGRhdGEpIHtcbiAgICAgIGlmICghaG9va3NbZW50cnlQb2ludF0pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXJyYXlGb3JFYWNoKGhvb2tzW2VudHJ5UG9pbnRdLCBmdW5jdGlvbiAoaG9vaykge1xuICAgICAgICBob29rLmNhbGwoRE9NUHVyaWZ5LCBjdXJyZW50Tm9kZSwgZGF0YSwgQ09ORklHKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBfc2FuaXRpemVFbGVtZW50c1xuICAgICAqXG4gICAgICogQHByb3RlY3Qgbm9kZU5hbWVcbiAgICAgKiBAcHJvdGVjdCB0ZXh0Q29udGVudFxuICAgICAqIEBwcm90ZWN0IHJlbW92ZUNoaWxkXG4gICAgICpcbiAgICAgKiBAcGFyYW0gICB7Tm9kZX0gY3VycmVudE5vZGUgdG8gY2hlY2sgZm9yIHBlcm1pc3Npb24gdG8gZXhpc3RcbiAgICAgKiBAcmV0dXJuICB7Qm9vbGVhbn0gdHJ1ZSBpZiBub2RlIHdhcyBraWxsZWQsIGZhbHNlIGlmIGxlZnQgYWxpdmVcbiAgICAgKi9cbiAgICB2YXIgX3Nhbml0aXplRWxlbWVudHMgPSBmdW5jdGlvbiBfc2FuaXRpemVFbGVtZW50cyhjdXJyZW50Tm9kZSkge1xuICAgICAgdmFyIGNvbnRlbnQ7XG5cbiAgICAgIC8qIEV4ZWN1dGUgYSBob29rIGlmIHByZXNlbnQgKi9cbiAgICAgIF9leGVjdXRlSG9vaygnYmVmb3JlU2FuaXRpemVFbGVtZW50cycsIGN1cnJlbnROb2RlLCBudWxsKTtcblxuICAgICAgLyogQ2hlY2sgaWYgZWxlbWVudCBpcyBjbG9iYmVyZWQgb3IgY2FuIGNsb2JiZXIgKi9cbiAgICAgIGlmIChfaXNDbG9iYmVyZWQoY3VycmVudE5vZGUpKSB7XG4gICAgICAgIF9mb3JjZVJlbW92ZShjdXJyZW50Tm9kZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvKiBDaGVjayBpZiB0YWduYW1lIGNvbnRhaW5zIFVuaWNvZGUgKi9cbiAgICAgIGlmIChyZWdFeHBUZXN0KC9bXFx1MDA4MC1cXHVGRkZGXS8sIGN1cnJlbnROb2RlLm5vZGVOYW1lKSkge1xuICAgICAgICBfZm9yY2VSZW1vdmUoY3VycmVudE5vZGUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLyogTm93IGxldCdzIGNoZWNrIHRoZSBlbGVtZW50J3MgdHlwZSBhbmQgbmFtZSAqL1xuICAgICAgdmFyIHRhZ05hbWUgPSB0cmFuc2Zvcm1DYXNlRnVuYyhjdXJyZW50Tm9kZS5ub2RlTmFtZSk7XG5cbiAgICAgIC8qIEV4ZWN1dGUgYSBob29rIGlmIHByZXNlbnQgKi9cbiAgICAgIF9leGVjdXRlSG9vaygndXBvblNhbml0aXplRWxlbWVudCcsIGN1cnJlbnROb2RlLCB7XG4gICAgICAgIHRhZ05hbWU6IHRhZ05hbWUsXG4gICAgICAgIGFsbG93ZWRUYWdzOiBBTExPV0VEX1RBR1NcbiAgICAgIH0pO1xuXG4gICAgICAvKiBEZXRlY3QgbVhTUyBhdHRlbXB0cyBhYnVzaW5nIG5hbWVzcGFjZSBjb25mdXNpb24gKi9cbiAgICAgIGlmIChjdXJyZW50Tm9kZS5oYXNDaGlsZE5vZGVzKCkgJiYgIV9pc05vZGUoY3VycmVudE5vZGUuZmlyc3RFbGVtZW50Q2hpbGQpICYmICghX2lzTm9kZShjdXJyZW50Tm9kZS5jb250ZW50KSB8fCAhX2lzTm9kZShjdXJyZW50Tm9kZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkKSkgJiYgcmVnRXhwVGVzdCgvPFsvXFx3XS9nLCBjdXJyZW50Tm9kZS5pbm5lckhUTUwpICYmIHJlZ0V4cFRlc3QoLzxbL1xcd10vZywgY3VycmVudE5vZGUudGV4dENvbnRlbnQpKSB7XG4gICAgICAgIF9mb3JjZVJlbW92ZShjdXJyZW50Tm9kZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvKiBNaXRpZ2F0ZSBhIHByb2JsZW0gd2l0aCB0ZW1wbGF0ZXMgaW5zaWRlIHNlbGVjdCAqL1xuICAgICAgaWYgKHRhZ05hbWUgPT09ICdzZWxlY3QnICYmIHJlZ0V4cFRlc3QoLzx0ZW1wbGF0ZS9pLCBjdXJyZW50Tm9kZS5pbm5lckhUTUwpKSB7XG4gICAgICAgIF9mb3JjZVJlbW92ZShjdXJyZW50Tm9kZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvKiBSZW1vdmUgYW55IG9jdXJyZW5jZSBvZiBwcm9jZXNzaW5nIGluc3RydWN0aW9ucyAqL1xuICAgICAgaWYgKGN1cnJlbnROb2RlLm5vZGVUeXBlID09PSA3KSB7XG4gICAgICAgIF9mb3JjZVJlbW92ZShjdXJyZW50Tm9kZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvKiBSZW1vdmUgYW55IGtpbmQgb2YgcG9zc2libHkgaGFybWZ1bCBjb21tZW50cyAqL1xuICAgICAgaWYgKFNBRkVfRk9SX1hNTCAmJiBjdXJyZW50Tm9kZS5ub2RlVHlwZSA9PT0gOCAmJiByZWdFeHBUZXN0KC88Wy9cXHddL2csIGN1cnJlbnROb2RlLmRhdGEpKSB7XG4gICAgICAgIF9mb3JjZVJlbW92ZShjdXJyZW50Tm9kZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvKiBSZW1vdmUgZWxlbWVudCBpZiBhbnl0aGluZyBmb3JiaWRzIGl0cyBwcmVzZW5jZSAqL1xuICAgICAgaWYgKCFBTExPV0VEX1RBR1NbdGFnTmFtZV0gfHwgRk9SQklEX1RBR1NbdGFnTmFtZV0pIHtcbiAgICAgICAgLyogQ2hlY2sgaWYgd2UgaGF2ZSBhIGN1c3RvbSBlbGVtZW50IHRvIGhhbmRsZSAqL1xuICAgICAgICBpZiAoIUZPUkJJRF9UQUdTW3RhZ05hbWVdICYmIF9iYXNpY0N1c3RvbUVsZW1lbnRUZXN0KHRhZ05hbWUpKSB7XG4gICAgICAgICAgaWYgKENVU1RPTV9FTEVNRU5UX0hBTkRMSU5HLnRhZ05hbWVDaGVjayBpbnN0YW5jZW9mIFJlZ0V4cCAmJiByZWdFeHBUZXN0KENVU1RPTV9FTEVNRU5UX0hBTkRMSU5HLnRhZ05hbWVDaGVjaywgdGFnTmFtZSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICBpZiAoQ1VTVE9NX0VMRU1FTlRfSEFORExJTkcudGFnTmFtZUNoZWNrIGluc3RhbmNlb2YgRnVuY3Rpb24gJiYgQ1VTVE9NX0VMRU1FTlRfSEFORExJTkcudGFnTmFtZUNoZWNrKHRhZ05hbWUpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBLZWVwIGNvbnRlbnQgZXhjZXB0IGZvciBiYWQtbGlzdGVkIGVsZW1lbnRzICovXG4gICAgICAgIGlmIChLRUVQX0NPTlRFTlQgJiYgIUZPUkJJRF9DT05URU5UU1t0YWdOYW1lXSkge1xuICAgICAgICAgIHZhciBwYXJlbnROb2RlID0gZ2V0UGFyZW50Tm9kZShjdXJyZW50Tm9kZSkgfHwgY3VycmVudE5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgICB2YXIgY2hpbGROb2RlcyA9IGdldENoaWxkTm9kZXMoY3VycmVudE5vZGUpIHx8IGN1cnJlbnROb2RlLmNoaWxkTm9kZXM7XG4gICAgICAgICAgaWYgKGNoaWxkTm9kZXMgJiYgcGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgdmFyIGNoaWxkQ291bnQgPSBjaGlsZE5vZGVzLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBjaGlsZENvdW50IC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgICAgdmFyIGNoaWxkQ2xvbmUgPSBjbG9uZU5vZGUoY2hpbGROb2Rlc1tpXSwgdHJ1ZSk7XG4gICAgICAgICAgICAgIGNoaWxkQ2xvbmUuX19yZW1vdmFsQ291bnQgPSAoY3VycmVudE5vZGUuX19yZW1vdmFsQ291bnQgfHwgMCkgKyAxO1xuICAgICAgICAgICAgICBwYXJlbnROb2RlLmluc2VydEJlZm9yZShjaGlsZENsb25lLCBnZXROZXh0U2libGluZyhjdXJyZW50Tm9kZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBfZm9yY2VSZW1vdmUoY3VycmVudE5vZGUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLyogQ2hlY2sgd2hldGhlciBlbGVtZW50IGhhcyBhIHZhbGlkIG5hbWVzcGFjZSAqL1xuICAgICAgaWYgKGN1cnJlbnROb2RlIGluc3RhbmNlb2YgRWxlbWVudCAmJiAhX2NoZWNrVmFsaWROYW1lc3BhY2UoY3VycmVudE5vZGUpKSB7XG4gICAgICAgIF9mb3JjZVJlbW92ZShjdXJyZW50Tm9kZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvKiBNYWtlIHN1cmUgdGhhdCBvbGRlciBicm93c2VycyBkb24ndCBnZXQgZmFsbGJhY2stdGFnIG1YU1MgKi9cbiAgICAgIGlmICgodGFnTmFtZSA9PT0gJ25vc2NyaXB0JyB8fCB0YWdOYW1lID09PSAnbm9lbWJlZCcgfHwgdGFnTmFtZSA9PT0gJ25vZnJhbWVzJykgJiYgcmVnRXhwVGVzdCgvPFxcL25vKHNjcmlwdHxlbWJlZHxmcmFtZXMpL2ksIGN1cnJlbnROb2RlLmlubmVySFRNTCkpIHtcbiAgICAgICAgX2ZvcmNlUmVtb3ZlKGN1cnJlbnROb2RlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8qIFNhbml0aXplIGVsZW1lbnQgY29udGVudCB0byBiZSB0ZW1wbGF0ZS1zYWZlICovXG4gICAgICBpZiAoU0FGRV9GT1JfVEVNUExBVEVTICYmIGN1cnJlbnROb2RlLm5vZGVUeXBlID09PSAzKSB7XG4gICAgICAgIC8qIEdldCB0aGUgZWxlbWVudCdzIHRleHQgY29udGVudCAqL1xuICAgICAgICBjb250ZW50ID0gY3VycmVudE5vZGUudGV4dENvbnRlbnQ7XG4gICAgICAgIGNvbnRlbnQgPSBzdHJpbmdSZXBsYWNlKGNvbnRlbnQsIE1VU1RBQ0hFX0VYUFIkMSwgJyAnKTtcbiAgICAgICAgY29udGVudCA9IHN0cmluZ1JlcGxhY2UoY29udGVudCwgRVJCX0VYUFIkMSwgJyAnKTtcbiAgICAgICAgY29udGVudCA9IHN0cmluZ1JlcGxhY2UoY29udGVudCwgVE1QTElUX0VYUFIkMSwgJyAnKTtcbiAgICAgICAgaWYgKGN1cnJlbnROb2RlLnRleHRDb250ZW50ICE9PSBjb250ZW50KSB7XG4gICAgICAgICAgYXJyYXlQdXNoKERPTVB1cmlmeS5yZW1vdmVkLCB7XG4gICAgICAgICAgICBlbGVtZW50OiBjdXJyZW50Tm9kZS5jbG9uZU5vZGUoKVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGN1cnJlbnROb2RlLnRleHRDb250ZW50ID0gY29udGVudDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKiBFeGVjdXRlIGEgaG9vayBpZiBwcmVzZW50ICovXG4gICAgICBfZXhlY3V0ZUhvb2soJ2FmdGVyU2FuaXRpemVFbGVtZW50cycsIGN1cnJlbnROb2RlLCBudWxsKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogX2lzVmFsaWRBdHRyaWJ1dGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gbGNUYWcgTG93ZXJjYXNlIHRhZyBuYW1lIG9mIGNvbnRhaW5pbmcgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IGxjTmFtZSBMb3dlcmNhc2UgYXR0cmlidXRlIG5hbWUuXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSB2YWx1ZSBBdHRyaWJ1dGUgdmFsdWUuXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gUmV0dXJucyB0cnVlIGlmIGB2YWx1ZWAgaXMgdmFsaWQsIG90aGVyd2lzZSBmYWxzZS5cbiAgICAgKi9cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29tcGxleGl0eVxuICAgIHZhciBfaXNWYWxpZEF0dHJpYnV0ZSA9IGZ1bmN0aW9uIF9pc1ZhbGlkQXR0cmlidXRlKGxjVGFnLCBsY05hbWUsIHZhbHVlKSB7XG4gICAgICAvKiBNYWtlIHN1cmUgYXR0cmlidXRlIGNhbm5vdCBjbG9iYmVyICovXG4gICAgICBpZiAoU0FOSVRJWkVfRE9NICYmIChsY05hbWUgPT09ICdpZCcgfHwgbGNOYW1lID09PSAnbmFtZScpICYmICh2YWx1ZSBpbiBkb2N1bWVudCB8fCB2YWx1ZSBpbiBmb3JtRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvKiBBbGxvdyB2YWxpZCBkYXRhLSogYXR0cmlidXRlczogQXQgbGVhc3Qgb25lIGNoYXJhY3RlciBhZnRlciBcIi1cIlxuICAgICAgICAgIChodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9kb20uaHRtbCNlbWJlZGRpbmctY3VzdG9tLW5vbi12aXNpYmxlLWRhdGEtd2l0aC10aGUtZGF0YS0qLWF0dHJpYnV0ZXMpXG4gICAgICAgICAgWE1MLWNvbXBhdGlibGUgKGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2luZnJhc3RydWN0dXJlLmh0bWwjeG1sLWNvbXBhdGlibGUgYW5kIGh0dHA6Ly93d3cudzMub3JnL1RSL3htbC8jZDBlODA0KVxuICAgICAgICAgIFdlIGRvbid0IG5lZWQgdG8gY2hlY2sgdGhlIHZhbHVlOyBpdCdzIGFsd2F5cyBVUkkgc2FmZS4gKi9cbiAgICAgIGlmIChBTExPV19EQVRBX0FUVFIgJiYgIUZPUkJJRF9BVFRSW2xjTmFtZV0gJiYgcmVnRXhwVGVzdChEQVRBX0FUVFIkMSwgbGNOYW1lKSkgOyBlbHNlIGlmIChBTExPV19BUklBX0FUVFIgJiYgcmVnRXhwVGVzdChBUklBX0FUVFIkMSwgbGNOYW1lKSkgOyBlbHNlIGlmICghQUxMT1dFRF9BVFRSW2xjTmFtZV0gfHwgRk9SQklEX0FUVFJbbGNOYW1lXSkge1xuICAgICAgICBpZiAoXG4gICAgICAgIC8vIEZpcnN0IGNvbmRpdGlvbiBkb2VzIGEgdmVyeSBiYXNpYyBjaGVjayBpZiBhKSBpdCdzIGJhc2ljYWxseSBhIHZhbGlkIGN1c3RvbSBlbGVtZW50IHRhZ25hbWUgQU5EXG4gICAgICAgIC8vIGIpIGlmIHRoZSB0YWdOYW1lIHBhc3NlcyB3aGF0ZXZlciB0aGUgdXNlciBoYXMgY29uZmlndXJlZCBmb3IgQ1VTVE9NX0VMRU1FTlRfSEFORExJTkcudGFnTmFtZUNoZWNrXG4gICAgICAgIC8vIGFuZCBjKSBpZiB0aGUgYXR0cmlidXRlIG5hbWUgcGFzc2VzIHdoYXRldmVyIHRoZSB1c2VyIGhhcyBjb25maWd1cmVkIGZvciBDVVNUT01fRUxFTUVOVF9IQU5ETElORy5hdHRyaWJ1dGVOYW1lQ2hlY2tcbiAgICAgICAgX2Jhc2ljQ3VzdG9tRWxlbWVudFRlc3QobGNUYWcpICYmIChDVVNUT01fRUxFTUVOVF9IQU5ETElORy50YWdOYW1lQ2hlY2sgaW5zdGFuY2VvZiBSZWdFeHAgJiYgcmVnRXhwVGVzdChDVVNUT01fRUxFTUVOVF9IQU5ETElORy50YWdOYW1lQ2hlY2ssIGxjVGFnKSB8fCBDVVNUT01fRUxFTUVOVF9IQU5ETElORy50YWdOYW1lQ2hlY2sgaW5zdGFuY2VvZiBGdW5jdGlvbiAmJiBDVVNUT01fRUxFTUVOVF9IQU5ETElORy50YWdOYW1lQ2hlY2sobGNUYWcpKSAmJiAoQ1VTVE9NX0VMRU1FTlRfSEFORExJTkcuYXR0cmlidXRlTmFtZUNoZWNrIGluc3RhbmNlb2YgUmVnRXhwICYmIHJlZ0V4cFRlc3QoQ1VTVE9NX0VMRU1FTlRfSEFORExJTkcuYXR0cmlidXRlTmFtZUNoZWNrLCBsY05hbWUpIHx8IENVU1RPTV9FTEVNRU5UX0hBTkRMSU5HLmF0dHJpYnV0ZU5hbWVDaGVjayBpbnN0YW5jZW9mIEZ1bmN0aW9uICYmIENVU1RPTV9FTEVNRU5UX0hBTkRMSU5HLmF0dHJpYnV0ZU5hbWVDaGVjayhsY05hbWUpKSB8fFxuICAgICAgICAvLyBBbHRlcm5hdGl2ZSwgc2Vjb25kIGNvbmRpdGlvbiBjaGVja3MgaWYgaXQncyBhbiBgaXNgLWF0dHJpYnV0ZSwgQU5EXG4gICAgICAgIC8vIHRoZSB2YWx1ZSBwYXNzZXMgd2hhdGV2ZXIgdGhlIHVzZXIgaGFzIGNvbmZpZ3VyZWQgZm9yIENVU1RPTV9FTEVNRU5UX0hBTkRMSU5HLnRhZ05hbWVDaGVja1xuICAgICAgICBsY05hbWUgPT09ICdpcycgJiYgQ1VTVE9NX0VMRU1FTlRfSEFORExJTkcuYWxsb3dDdXN0b21pemVkQnVpbHRJbkVsZW1lbnRzICYmIChDVVNUT01fRUxFTUVOVF9IQU5ETElORy50YWdOYW1lQ2hlY2sgaW5zdGFuY2VvZiBSZWdFeHAgJiYgcmVnRXhwVGVzdChDVVNUT01fRUxFTUVOVF9IQU5ETElORy50YWdOYW1lQ2hlY2ssIHZhbHVlKSB8fCBDVVNUT01fRUxFTUVOVF9IQU5ETElORy50YWdOYW1lQ2hlY2sgaW5zdGFuY2VvZiBGdW5jdGlvbiAmJiBDVVNUT01fRUxFTUVOVF9IQU5ETElORy50YWdOYW1lQ2hlY2sodmFsdWUpKSkgOyBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLyogQ2hlY2sgdmFsdWUgaXMgc2FmZS4gRmlyc3QsIGlzIGF0dHIgaW5lcnQ/IElmIHNvLCBpcyBzYWZlICovXG4gICAgICB9IGVsc2UgaWYgKFVSSV9TQUZFX0FUVFJJQlVURVNbbGNOYW1lXSkgOyBlbHNlIGlmIChyZWdFeHBUZXN0KElTX0FMTE9XRURfVVJJJDEsIHN0cmluZ1JlcGxhY2UodmFsdWUsIEFUVFJfV0hJVEVTUEFDRSQxLCAnJykpKSA7IGVsc2UgaWYgKChsY05hbWUgPT09ICdzcmMnIHx8IGxjTmFtZSA9PT0gJ3hsaW5rOmhyZWYnIHx8IGxjTmFtZSA9PT0gJ2hyZWYnKSAmJiBsY1RhZyAhPT0gJ3NjcmlwdCcgJiYgc3RyaW5nSW5kZXhPZih2YWx1ZSwgJ2RhdGE6JykgPT09IDAgJiYgREFUQV9VUklfVEFHU1tsY1RhZ10pIDsgZWxzZSBpZiAoQUxMT1dfVU5LTk9XTl9QUk9UT0NPTFMgJiYgIXJlZ0V4cFRlc3QoSVNfU0NSSVBUX09SX0RBVEEkMSwgc3RyaW5nUmVwbGFjZSh2YWx1ZSwgQVRUUl9XSElURVNQQUNFJDEsICcnKSkpIDsgZWxzZSBpZiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSBlbHNlIDtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBfYmFzaWNDdXN0b21FbGVtZW50Q2hlY2tcbiAgICAgKiBjaGVja3MgaWYgYXQgbGVhc3Qgb25lIGRhc2ggaXMgaW5jbHVkZWQgaW4gdGFnTmFtZSwgYW5kIGl0J3Mgbm90IHRoZSBmaXJzdCBjaGFyXG4gICAgICogZm9yIG1vcmUgc29waGlzdGljYXRlZCBjaGVja2luZyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy92YWxpZGF0ZS1lbGVtZW50LW5hbWVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnTmFtZSBuYW1lIG9mIHRoZSB0YWcgb2YgdGhlIG5vZGUgdG8gc2FuaXRpemVcbiAgICAgKi9cbiAgICB2YXIgX2Jhc2ljQ3VzdG9tRWxlbWVudFRlc3QgPSBmdW5jdGlvbiBfYmFzaWNDdXN0b21FbGVtZW50VGVzdCh0YWdOYW1lKSB7XG4gICAgICByZXR1cm4gdGFnTmFtZSAhPT0gJ2Fubm90YXRpb24teG1sJyAmJiBzdHJpbmdNYXRjaCh0YWdOYW1lLCBDVVNUT01fRUxFTUVOVCQxKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogX3Nhbml0aXplQXR0cmlidXRlc1xuICAgICAqXG4gICAgICogQHByb3RlY3QgYXR0cmlidXRlc1xuICAgICAqIEBwcm90ZWN0IG5vZGVOYW1lXG4gICAgICogQHByb3RlY3QgcmVtb3ZlQXR0cmlidXRlXG4gICAgICogQHByb3RlY3Qgc2V0QXR0cmlidXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtOb2RlfSBjdXJyZW50Tm9kZSB0byBzYW5pdGl6ZVxuICAgICAqL1xuICAgIHZhciBfc2FuaXRpemVBdHRyaWJ1dGVzID0gZnVuY3Rpb24gX3Nhbml0aXplQXR0cmlidXRlcyhjdXJyZW50Tm9kZSkge1xuICAgICAgdmFyIGF0dHI7XG4gICAgICB2YXIgdmFsdWU7XG4gICAgICB2YXIgbGNOYW1lO1xuICAgICAgdmFyIGw7XG4gICAgICAvKiBFeGVjdXRlIGEgaG9vayBpZiBwcmVzZW50ICovXG4gICAgICBfZXhlY3V0ZUhvb2soJ2JlZm9yZVNhbml0aXplQXR0cmlidXRlcycsIGN1cnJlbnROb2RlLCBudWxsKTtcbiAgICAgIHZhciBhdHRyaWJ1dGVzID0gY3VycmVudE5vZGUuYXR0cmlidXRlcztcblxuICAgICAgLyogQ2hlY2sgaWYgd2UgaGF2ZSBhdHRyaWJ1dGVzOyBpZiBub3Qgd2UgbWlnaHQgaGF2ZSBhIHRleHQgbm9kZSAqL1xuICAgICAgaWYgKCFhdHRyaWJ1dGVzIHx8IF9pc0Nsb2JiZXJlZChjdXJyZW50Tm9kZSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIGhvb2tFdmVudCA9IHtcbiAgICAgICAgYXR0ck5hbWU6ICcnLFxuICAgICAgICBhdHRyVmFsdWU6ICcnLFxuICAgICAgICBrZWVwQXR0cjogdHJ1ZSxcbiAgICAgICAgYWxsb3dlZEF0dHJpYnV0ZXM6IEFMTE9XRURfQVRUUlxuICAgICAgfTtcbiAgICAgIGwgPSBhdHRyaWJ1dGVzLmxlbmd0aDtcblxuICAgICAgLyogR28gYmFja3dhcmRzIG92ZXIgYWxsIGF0dHJpYnV0ZXM7IHNhZmVseSByZW1vdmUgYmFkIG9uZXMgKi9cbiAgICAgIHdoaWxlIChsLS0pIHtcbiAgICAgICAgYXR0ciA9IGF0dHJpYnV0ZXNbbF07XG4gICAgICAgIHZhciBfYXR0ciA9IGF0dHIsXG4gICAgICAgICAgbmFtZSA9IF9hdHRyLm5hbWUsXG4gICAgICAgICAgbmFtZXNwYWNlVVJJID0gX2F0dHIubmFtZXNwYWNlVVJJO1xuICAgICAgICB2YWx1ZSA9IG5hbWUgPT09ICd2YWx1ZScgPyBhdHRyLnZhbHVlIDogc3RyaW5nVHJpbShhdHRyLnZhbHVlKTtcbiAgICAgICAgbGNOYW1lID0gdHJhbnNmb3JtQ2FzZUZ1bmMobmFtZSk7XG5cbiAgICAgICAgLyogRXhlY3V0ZSBhIGhvb2sgaWYgcHJlc2VudCAqL1xuICAgICAgICBob29rRXZlbnQuYXR0ck5hbWUgPSBsY05hbWU7XG4gICAgICAgIGhvb2tFdmVudC5hdHRyVmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgaG9va0V2ZW50LmtlZXBBdHRyID0gdHJ1ZTtcbiAgICAgICAgaG9va0V2ZW50LmZvcmNlS2VlcEF0dHIgPSB1bmRlZmluZWQ7IC8vIEFsbG93cyBkZXZlbG9wZXJzIHRvIHNlZSB0aGlzIGlzIGEgcHJvcGVydHkgdGhleSBjYW4gc2V0XG4gICAgICAgIF9leGVjdXRlSG9vaygndXBvblNhbml0aXplQXR0cmlidXRlJywgY3VycmVudE5vZGUsIGhvb2tFdmVudCk7XG4gICAgICAgIHZhbHVlID0gaG9va0V2ZW50LmF0dHJWYWx1ZTtcblxuICAgICAgICAvKiBEaWQgdGhlIGhvb2tzIGFwcHJvdmUgb2YgdGhlIGF0dHJpYnV0ZT8gKi9cbiAgICAgICAgaWYgKGhvb2tFdmVudC5mb3JjZUtlZXBBdHRyKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBSZW1vdmUgYXR0cmlidXRlICovXG4gICAgICAgIF9yZW1vdmVBdHRyaWJ1dGUobmFtZSwgY3VycmVudE5vZGUpO1xuXG4gICAgICAgIC8qIERpZCB0aGUgaG9va3MgYXBwcm92ZSBvZiB0aGUgYXR0cmlidXRlPyAqL1xuICAgICAgICBpZiAoIWhvb2tFdmVudC5rZWVwQXR0cikge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogV29yayBhcm91bmQgYSBzZWN1cml0eSBpc3N1ZSBpbiBqUXVlcnkgMy4wICovXG4gICAgICAgIGlmICghQUxMT1dfU0VMRl9DTE9TRV9JTl9BVFRSICYmIHJlZ0V4cFRlc3QoL1xcLz4vaSwgdmFsdWUpKSB7XG4gICAgICAgICAgX3JlbW92ZUF0dHJpYnV0ZShuYW1lLCBjdXJyZW50Tm9kZSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBTYW5pdGl6ZSBhdHRyaWJ1dGUgY29udGVudCB0byBiZSB0ZW1wbGF0ZS1zYWZlICovXG4gICAgICAgIGlmIChTQUZFX0ZPUl9URU1QTEFURVMpIHtcbiAgICAgICAgICB2YWx1ZSA9IHN0cmluZ1JlcGxhY2UodmFsdWUsIE1VU1RBQ0hFX0VYUFIkMSwgJyAnKTtcbiAgICAgICAgICB2YWx1ZSA9IHN0cmluZ1JlcGxhY2UodmFsdWUsIEVSQl9FWFBSJDEsICcgJyk7XG4gICAgICAgICAgdmFsdWUgPSBzdHJpbmdSZXBsYWNlKHZhbHVlLCBUTVBMSVRfRVhQUiQxLCAnICcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogSXMgYHZhbHVlYCB2YWxpZCBmb3IgdGhpcyBhdHRyaWJ1dGU/ICovXG4gICAgICAgIHZhciBsY1RhZyA9IHRyYW5zZm9ybUNhc2VGdW5jKGN1cnJlbnROb2RlLm5vZGVOYW1lKTtcbiAgICAgICAgaWYgKCFfaXNWYWxpZEF0dHJpYnV0ZShsY1RhZywgbGNOYW1lLCB2YWx1ZSkpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEZ1bGwgRE9NIENsb2JiZXJpbmcgcHJvdGVjdGlvbiB2aWEgbmFtZXNwYWNlIGlzb2xhdGlvbixcbiAgICAgICAgICogUHJlZml4IGlkIGFuZCBuYW1lIGF0dHJpYnV0ZXMgd2l0aCBgdXNlci1jb250ZW50LWBcbiAgICAgICAgICovXG4gICAgICAgIGlmIChTQU5JVElaRV9OQU1FRF9QUk9QUyAmJiAobGNOYW1lID09PSAnaWQnIHx8IGxjTmFtZSA9PT0gJ25hbWUnKSkge1xuICAgICAgICAgIC8vIFJlbW92ZSB0aGUgYXR0cmlidXRlIHdpdGggdGhpcyB2YWx1ZVxuICAgICAgICAgIF9yZW1vdmVBdHRyaWJ1dGUobmFtZSwgY3VycmVudE5vZGUpO1xuXG4gICAgICAgICAgLy8gUHJlZml4IHRoZSB2YWx1ZSBhbmQgbGF0ZXIgcmUtY3JlYXRlIHRoZSBhdHRyaWJ1dGUgd2l0aCB0aGUgc2FuaXRpemVkIHZhbHVlXG4gICAgICAgICAgdmFsdWUgPSBTQU5JVElaRV9OQU1FRF9QUk9QU19QUkVGSVggKyB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFdvcmsgYXJvdW5kIGEgc2VjdXJpdHkgaXNzdWUgd2l0aCBjb21tZW50cyBpbnNpZGUgYXR0cmlidXRlcyAqL1xuICAgICAgICBpZiAoU0FGRV9GT1JfWE1MICYmIHJlZ0V4cFRlc3QoLygoLS0hP3xdKT4pfDxcXC8oc3R5bGV8dGl0bGUpL2ksIHZhbHVlKSkge1xuICAgICAgICAgIF9yZW1vdmVBdHRyaWJ1dGUobmFtZSwgY3VycmVudE5vZGUpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogSGFuZGxlIGF0dHJpYnV0ZXMgdGhhdCByZXF1aXJlIFRydXN0ZWQgVHlwZXMgKi9cbiAgICAgICAgaWYgKHRydXN0ZWRUeXBlc1BvbGljeSAmJiBfdHlwZW9mKHRydXN0ZWRUeXBlcykgPT09ICdvYmplY3QnICYmIHR5cGVvZiB0cnVzdGVkVHlwZXMuZ2V0QXR0cmlidXRlVHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGlmIChuYW1lc3BhY2VVUkkpIDsgZWxzZSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHRydXN0ZWRUeXBlcy5nZXRBdHRyaWJ1dGVUeXBlKGxjVGFnLCBsY05hbWUpKSB7XG4gICAgICAgICAgICAgIGNhc2UgJ1RydXN0ZWRIVE1MJzpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB2YWx1ZSA9IHRydXN0ZWRUeXBlc1BvbGljeS5jcmVhdGVIVE1MKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY2FzZSAnVHJ1c3RlZFNjcmlwdFVSTCc6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdmFsdWUgPSB0cnVzdGVkVHlwZXNQb2xpY3kuY3JlYXRlU2NyaXB0VVJMKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBIYW5kbGUgaW52YWxpZCBkYXRhLSogYXR0cmlidXRlIHNldCBieSB0cnktY2F0Y2hpbmcgaXQgKi9cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAobmFtZXNwYWNlVVJJKSB7XG4gICAgICAgICAgICBjdXJyZW50Tm9kZS5zZXRBdHRyaWJ1dGVOUyhuYW1lc3BhY2VVUkksIG5hbWUsIHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLyogRmFsbGJhY2sgdG8gc2V0QXR0cmlidXRlKCkgZm9yIGJyb3dzZXItdW5yZWNvZ25pemVkIG5hbWVzcGFjZXMgZS5nLiBcIngtc2NoZW1hXCIuICovXG4gICAgICAgICAgICBjdXJyZW50Tm9kZS5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoX2lzQ2xvYmJlcmVkKGN1cnJlbnROb2RlKSkge1xuICAgICAgICAgICAgX2ZvcmNlUmVtb3ZlKGN1cnJlbnROb2RlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXJyYXlQb3AoRE9NUHVyaWZ5LnJlbW92ZWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoXykge31cbiAgICAgIH1cblxuICAgICAgLyogRXhlY3V0ZSBhIGhvb2sgaWYgcHJlc2VudCAqL1xuICAgICAgX2V4ZWN1dGVIb29rKCdhZnRlclNhbml0aXplQXR0cmlidXRlcycsIGN1cnJlbnROb2RlLCBudWxsKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogX3Nhbml0aXplU2hhZG93RE9NXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtEb2N1bWVudEZyYWdtZW50fSBmcmFnbWVudCB0byBpdGVyYXRlIG92ZXIgcmVjdXJzaXZlbHlcbiAgICAgKi9cbiAgICB2YXIgX3Nhbml0aXplU2hhZG93RE9NID0gZnVuY3Rpb24gX3Nhbml0aXplU2hhZG93RE9NKGZyYWdtZW50KSB7XG4gICAgICB2YXIgc2hhZG93Tm9kZTtcbiAgICAgIHZhciBzaGFkb3dJdGVyYXRvciA9IF9jcmVhdGVJdGVyYXRvcihmcmFnbWVudCk7XG5cbiAgICAgIC8qIEV4ZWN1dGUgYSBob29rIGlmIHByZXNlbnQgKi9cbiAgICAgIF9leGVjdXRlSG9vaygnYmVmb3JlU2FuaXRpemVTaGFkb3dET00nLCBmcmFnbWVudCwgbnVsbCk7XG4gICAgICB3aGlsZSAoc2hhZG93Tm9kZSA9IHNoYWRvd0l0ZXJhdG9yLm5leHROb2RlKCkpIHtcbiAgICAgICAgLyogRXhlY3V0ZSBhIGhvb2sgaWYgcHJlc2VudCAqL1xuICAgICAgICBfZXhlY3V0ZUhvb2soJ3Vwb25TYW5pdGl6ZVNoYWRvd05vZGUnLCBzaGFkb3dOb2RlLCBudWxsKTtcbiAgICAgICAgLyogU2FuaXRpemUgdGFncyBhbmQgZWxlbWVudHMgKi9cbiAgICAgICAgX3Nhbml0aXplRWxlbWVudHMoc2hhZG93Tm9kZSk7XG5cbiAgICAgICAgLyogQ2hlY2sgYXR0cmlidXRlcyBuZXh0ICovXG4gICAgICAgIF9zYW5pdGl6ZUF0dHJpYnV0ZXMoc2hhZG93Tm9kZSk7XG5cbiAgICAgICAgLyogRGVlcCBzaGFkb3cgRE9NIGRldGVjdGVkICovXG4gICAgICAgIGlmIChzaGFkb3dOb2RlLmNvbnRlbnQgaW5zdGFuY2VvZiBEb2N1bWVudEZyYWdtZW50KSB7XG4gICAgICAgICAgX3Nhbml0aXplU2hhZG93RE9NKHNoYWRvd05vZGUuY29udGVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyogRXhlY3V0ZSBhIGhvb2sgaWYgcHJlc2VudCAqL1xuICAgICAgX2V4ZWN1dGVIb29rKCdhZnRlclNhbml0aXplU2hhZG93RE9NJywgZnJhZ21lbnQsIG51bGwpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTYW5pdGl6ZVxuICAgICAqIFB1YmxpYyBtZXRob2QgcHJvdmlkaW5nIGNvcmUgc2FuaXRhdGlvbiBmdW5jdGlvbmFsaXR5XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xOb2RlfSBkaXJ0eSBzdHJpbmcgb3IgRE9NIG5vZGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlndXJhdGlvbiBvYmplY3RcbiAgICAgKi9cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29tcGxleGl0eVxuICAgIERPTVB1cmlmeS5zYW5pdGl6ZSA9IGZ1bmN0aW9uIChkaXJ0eSkge1xuICAgICAgdmFyIGNmZyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gICAgICB2YXIgYm9keTtcbiAgICAgIHZhciBpbXBvcnRlZE5vZGU7XG4gICAgICB2YXIgY3VycmVudE5vZGU7XG4gICAgICB2YXIgb2xkTm9kZTtcbiAgICAgIHZhciByZXR1cm5Ob2RlO1xuICAgICAgLyogTWFrZSBzdXJlIHdlIGhhdmUgYSBzdHJpbmcgdG8gc2FuaXRpemUuXG4gICAgICAgIERPIE5PVCByZXR1cm4gZWFybHksIGFzIHRoaXMgd2lsbCByZXR1cm4gdGhlIHdyb25nIHR5cGUgaWZcbiAgICAgICAgdGhlIHVzZXIgaGFzIHJlcXVlc3RlZCBhIERPTSBvYmplY3QgcmF0aGVyIHRoYW4gYSBzdHJpbmcgKi9cbiAgICAgIElTX0VNUFRZX0lOUFVUID0gIWRpcnR5O1xuICAgICAgaWYgKElTX0VNUFRZX0lOUFVUKSB7XG4gICAgICAgIGRpcnR5ID0gJzwhLS0+JztcbiAgICAgIH1cblxuICAgICAgLyogU3RyaW5naWZ5LCBpbiBjYXNlIGRpcnR5IGlzIGFuIG9iamVjdCAqL1xuICAgICAgaWYgKHR5cGVvZiBkaXJ0eSAhPT0gJ3N0cmluZycgJiYgIV9pc05vZGUoZGlydHkpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZGlydHkudG9TdHJpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBkaXJ0eSA9IGRpcnR5LnRvU3RyaW5nKCk7XG4gICAgICAgICAgaWYgKHR5cGVvZiBkaXJ0eSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRocm93IHR5cGVFcnJvckNyZWF0ZSgnZGlydHkgaXMgbm90IGEgc3RyaW5nLCBhYm9ydGluZycpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyB0eXBlRXJyb3JDcmVhdGUoJ3RvU3RyaW5nIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyogQ2hlY2sgd2UgY2FuIHJ1bi4gT3RoZXJ3aXNlIGZhbGwgYmFjayBvciBpZ25vcmUgKi9cbiAgICAgIGlmICghRE9NUHVyaWZ5LmlzU3VwcG9ydGVkKSB7XG4gICAgICAgIGlmIChfdHlwZW9mKHdpbmRvdy50b1N0YXRpY0hUTUwpID09PSAnb2JqZWN0JyB8fCB0eXBlb2Ygd2luZG93LnRvU3RhdGljSFRNTCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGlmICh0eXBlb2YgZGlydHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gd2luZG93LnRvU3RhdGljSFRNTChkaXJ0eSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChfaXNOb2RlKGRpcnR5KSkge1xuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy50b1N0YXRpY0hUTUwoZGlydHkub3V0ZXJIVE1MKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRpcnR5O1xuICAgICAgfVxuXG4gICAgICAvKiBBc3NpZ24gY29uZmlnIHZhcnMgKi9cbiAgICAgIGlmICghU0VUX0NPTkZJRykge1xuICAgICAgICBfcGFyc2VDb25maWcoY2ZnKTtcbiAgICAgIH1cblxuICAgICAgLyogQ2xlYW4gdXAgcmVtb3ZlZCBlbGVtZW50cyAqL1xuICAgICAgRE9NUHVyaWZ5LnJlbW92ZWQgPSBbXTtcblxuICAgICAgLyogQ2hlY2sgaWYgZGlydHkgaXMgY29ycmVjdGx5IHR5cGVkIGZvciBJTl9QTEFDRSAqL1xuICAgICAgaWYgKHR5cGVvZiBkaXJ0eSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgSU5fUExBQ0UgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChJTl9QTEFDRSkge1xuICAgICAgICAvKiBEbyBzb21lIGVhcmx5IHByZS1zYW5pdGl6YXRpb24gdG8gYXZvaWQgdW5zYWZlIHJvb3Qgbm9kZXMgKi9cbiAgICAgICAgaWYgKGRpcnR5Lm5vZGVOYW1lKSB7XG4gICAgICAgICAgdmFyIHRhZ05hbWUgPSB0cmFuc2Zvcm1DYXNlRnVuYyhkaXJ0eS5ub2RlTmFtZSk7XG4gICAgICAgICAgaWYgKCFBTExPV0VEX1RBR1NbdGFnTmFtZV0gfHwgRk9SQklEX1RBR1NbdGFnTmFtZV0pIHtcbiAgICAgICAgICAgIHRocm93IHR5cGVFcnJvckNyZWF0ZSgncm9vdCBub2RlIGlzIGZvcmJpZGRlbiBhbmQgY2Fubm90IGJlIHNhbml0aXplZCBpbi1wbGFjZScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChkaXJ0eSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgLyogSWYgZGlydHkgaXMgYSBET00gZWxlbWVudCwgYXBwZW5kIHRvIGFuIGVtcHR5IGRvY3VtZW50IHRvIGF2b2lkXG4gICAgICAgICAgIGVsZW1lbnRzIGJlaW5nIHN0cmlwcGVkIGJ5IHRoZSBwYXJzZXIgKi9cbiAgICAgICAgYm9keSA9IF9pbml0RG9jdW1lbnQoJzwhLS0tLT4nKTtcbiAgICAgICAgaW1wb3J0ZWROb2RlID0gYm9keS5vd25lckRvY3VtZW50LmltcG9ydE5vZGUoZGlydHksIHRydWUpO1xuICAgICAgICBpZiAoaW1wb3J0ZWROb2RlLm5vZGVUeXBlID09PSAxICYmIGltcG9ydGVkTm9kZS5ub2RlTmFtZSA9PT0gJ0JPRFknKSB7XG4gICAgICAgICAgLyogTm9kZSBpcyBhbHJlYWR5IGEgYm9keSwgdXNlIGFzIGlzICovXG4gICAgICAgICAgYm9keSA9IGltcG9ydGVkTm9kZTtcbiAgICAgICAgfSBlbHNlIGlmIChpbXBvcnRlZE5vZGUubm9kZU5hbWUgPT09ICdIVE1MJykge1xuICAgICAgICAgIGJvZHkgPSBpbXBvcnRlZE5vZGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHVuaWNvcm4vcHJlZmVyLWRvbS1ub2RlLWFwcGVuZFxuICAgICAgICAgIGJvZHkuYXBwZW5kQ2hpbGQoaW1wb3J0ZWROb2RlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLyogRXhpdCBkaXJlY3RseSBpZiB3ZSBoYXZlIG5vdGhpbmcgdG8gZG8gKi9cbiAgICAgICAgaWYgKCFSRVRVUk5fRE9NICYmICFTQUZFX0ZPUl9URU1QTEFURVMgJiYgIVdIT0xFX0RPQ1VNRU5UICYmXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSB1bmljb3JuL3ByZWZlci1pbmNsdWRlc1xuICAgICAgICBkaXJ0eS5pbmRleE9mKCc8JykgPT09IC0xKSB7XG4gICAgICAgICAgcmV0dXJuIHRydXN0ZWRUeXBlc1BvbGljeSAmJiBSRVRVUk5fVFJVU1RFRF9UWVBFID8gdHJ1c3RlZFR5cGVzUG9saWN5LmNyZWF0ZUhUTUwoZGlydHkpIDogZGlydHk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBJbml0aWFsaXplIHRoZSBkb2N1bWVudCB0byB3b3JrIG9uICovXG4gICAgICAgIGJvZHkgPSBfaW5pdERvY3VtZW50KGRpcnR5KTtcblxuICAgICAgICAvKiBDaGVjayB3ZSBoYXZlIGEgRE9NIG5vZGUgZnJvbSB0aGUgZGF0YSAqL1xuICAgICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgICByZXR1cm4gUkVUVVJOX0RPTSA/IG51bGwgOiBSRVRVUk5fVFJVU1RFRF9UWVBFID8gZW1wdHlIVE1MIDogJyc7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyogUmVtb3ZlIGZpcnN0IGVsZW1lbnQgbm9kZSAob3VycykgaWYgRk9SQ0VfQk9EWSBpcyBzZXQgKi9cbiAgICAgIGlmIChib2R5ICYmIEZPUkNFX0JPRFkpIHtcbiAgICAgICAgX2ZvcmNlUmVtb3ZlKGJvZHkuZmlyc3RDaGlsZCk7XG4gICAgICB9XG5cbiAgICAgIC8qIEdldCBub2RlIGl0ZXJhdG9yICovXG4gICAgICB2YXIgbm9kZUl0ZXJhdG9yID0gX2NyZWF0ZUl0ZXJhdG9yKElOX1BMQUNFID8gZGlydHkgOiBib2R5KTtcblxuICAgICAgLyogTm93IHN0YXJ0IGl0ZXJhdGluZyBvdmVyIHRoZSBjcmVhdGVkIGRvY3VtZW50ICovXG4gICAgICB3aGlsZSAoY3VycmVudE5vZGUgPSBub2RlSXRlcmF0b3IubmV4dE5vZGUoKSkge1xuICAgICAgICAvKiBGaXggSUUncyBzdHJhbmdlIGJlaGF2aW9yIHdpdGggbWFuaXB1bGF0ZWQgdGV4dE5vZGVzICM4OSAqL1xuICAgICAgICBpZiAoY3VycmVudE5vZGUubm9kZVR5cGUgPT09IDMgJiYgY3VycmVudE5vZGUgPT09IG9sZE5vZGUpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFNhbml0aXplIHRhZ3MgYW5kIGVsZW1lbnRzICovXG4gICAgICAgIF9zYW5pdGl6ZUVsZW1lbnRzKGN1cnJlbnROb2RlKTtcblxuICAgICAgICAvKiBDaGVjayBhdHRyaWJ1dGVzIG5leHQgKi9cbiAgICAgICAgX3Nhbml0aXplQXR0cmlidXRlcyhjdXJyZW50Tm9kZSk7XG5cbiAgICAgICAgLyogU2hhZG93IERPTSBkZXRlY3RlZCwgc2FuaXRpemUgaXQgKi9cbiAgICAgICAgaWYgKGN1cnJlbnROb2RlLmNvbnRlbnQgaW5zdGFuY2VvZiBEb2N1bWVudEZyYWdtZW50KSB7XG4gICAgICAgICAgX3Nhbml0aXplU2hhZG93RE9NKGN1cnJlbnROb2RlLmNvbnRlbnQpO1xuICAgICAgICB9XG4gICAgICAgIG9sZE5vZGUgPSBjdXJyZW50Tm9kZTtcbiAgICAgIH1cbiAgICAgIG9sZE5vZGUgPSBudWxsO1xuXG4gICAgICAvKiBJZiB3ZSBzYW5pdGl6ZWQgYGRpcnR5YCBpbi1wbGFjZSwgcmV0dXJuIGl0LiAqL1xuICAgICAgaWYgKElOX1BMQUNFKSB7XG4gICAgICAgIHJldHVybiBkaXJ0eTtcbiAgICAgIH1cblxuICAgICAgLyogUmV0dXJuIHNhbml0aXplZCBzdHJpbmcgb3IgRE9NICovXG4gICAgICBpZiAoUkVUVVJOX0RPTSkge1xuICAgICAgICBpZiAoUkVUVVJOX0RPTV9GUkFHTUVOVCkge1xuICAgICAgICAgIHJldHVybk5vZGUgPSBjcmVhdGVEb2N1bWVudEZyYWdtZW50LmNhbGwoYm9keS5vd25lckRvY3VtZW50KTtcbiAgICAgICAgICB3aGlsZSAoYm9keS5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgdW5pY29ybi9wcmVmZXItZG9tLW5vZGUtYXBwZW5kXG4gICAgICAgICAgICByZXR1cm5Ob2RlLmFwcGVuZENoaWxkKGJvZHkuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybk5vZGUgPSBib2R5O1xuICAgICAgICB9XG4gICAgICAgIGlmIChBTExPV0VEX0FUVFIuc2hhZG93cm9vdCB8fCBBTExPV0VEX0FUVFIuc2hhZG93cm9vdG1vZCkge1xuICAgICAgICAgIC8qXG4gICAgICAgICAgICBBZG9wdE5vZGUoKSBpcyBub3QgdXNlZCBiZWNhdXNlIGludGVybmFsIHN0YXRlIGlzIG5vdCByZXNldFxuICAgICAgICAgICAgKGUuZy4gdGhlIHBhc3QgbmFtZXMgbWFwIG9mIGEgSFRNTEZvcm1FbGVtZW50KSwgdGhpcyBpcyBzYWZlXG4gICAgICAgICAgICBpbiB0aGVvcnkgYnV0IHdlIHdvdWxkIHJhdGhlciBub3QgcmlzayBhbm90aGVyIGF0dGFjayB2ZWN0b3IuXG4gICAgICAgICAgICBUaGUgc3RhdGUgdGhhdCBpcyBjbG9uZWQgYnkgaW1wb3J0Tm9kZSgpIGlzIGV4cGxpY2l0bHkgZGVmaW5lZFxuICAgICAgICAgICAgYnkgdGhlIHNwZWNzLlxuICAgICAgICAgICovXG4gICAgICAgICAgcmV0dXJuTm9kZSA9IGltcG9ydE5vZGUuY2FsbChvcmlnaW5hbERvY3VtZW50LCByZXR1cm5Ob2RlLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0dXJuTm9kZTtcbiAgICAgIH1cbiAgICAgIHZhciBzZXJpYWxpemVkSFRNTCA9IFdIT0xFX0RPQ1VNRU5UID8gYm9keS5vdXRlckhUTUwgOiBib2R5LmlubmVySFRNTDtcblxuICAgICAgLyogU2VyaWFsaXplIGRvY3R5cGUgaWYgYWxsb3dlZCAqL1xuICAgICAgaWYgKFdIT0xFX0RPQ1VNRU5UICYmIEFMTE9XRURfVEFHU1snIWRvY3R5cGUnXSAmJiBib2R5Lm93bmVyRG9jdW1lbnQgJiYgYm9keS5vd25lckRvY3VtZW50LmRvY3R5cGUgJiYgYm9keS5vd25lckRvY3VtZW50LmRvY3R5cGUubmFtZSAmJiByZWdFeHBUZXN0KERPQ1RZUEVfTkFNRSwgYm9keS5vd25lckRvY3VtZW50LmRvY3R5cGUubmFtZSkpIHtcbiAgICAgICAgc2VyaWFsaXplZEhUTUwgPSAnPCFET0NUWVBFICcgKyBib2R5Lm93bmVyRG9jdW1lbnQuZG9jdHlwZS5uYW1lICsgJz5cXG4nICsgc2VyaWFsaXplZEhUTUw7XG4gICAgICB9XG5cbiAgICAgIC8qIFNhbml0aXplIGZpbmFsIHN0cmluZyB0ZW1wbGF0ZS1zYWZlICovXG4gICAgICBpZiAoU0FGRV9GT1JfVEVNUExBVEVTKSB7XG4gICAgICAgIHNlcmlhbGl6ZWRIVE1MID0gc3RyaW5nUmVwbGFjZShzZXJpYWxpemVkSFRNTCwgTVVTVEFDSEVfRVhQUiQxLCAnICcpO1xuICAgICAgICBzZXJpYWxpemVkSFRNTCA9IHN0cmluZ1JlcGxhY2Uoc2VyaWFsaXplZEhUTUwsIEVSQl9FWFBSJDEsICcgJyk7XG4gICAgICAgIHNlcmlhbGl6ZWRIVE1MID0gc3RyaW5nUmVwbGFjZShzZXJpYWxpemVkSFRNTCwgVE1QTElUX0VYUFIkMSwgJyAnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVzdGVkVHlwZXNQb2xpY3kgJiYgUkVUVVJOX1RSVVNURURfVFlQRSA/IHRydXN0ZWRUeXBlc1BvbGljeS5jcmVhdGVIVE1MKHNlcmlhbGl6ZWRIVE1MKSA6IHNlcmlhbGl6ZWRIVE1MO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaWMgbWV0aG9kIHRvIHNldCB0aGUgY29uZmlndXJhdGlvbiBvbmNlXG4gICAgICogc2V0Q29uZmlnXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY2ZnIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG4gICAgICovXG4gICAgRE9NUHVyaWZ5LnNldENvbmZpZyA9IGZ1bmN0aW9uIChjZmcpIHtcbiAgICAgIF9wYXJzZUNvbmZpZyhjZmcpO1xuICAgICAgU0VUX0NPTkZJRyA9IHRydWU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBtZXRob2QgdG8gcmVtb3ZlIHRoZSBjb25maWd1cmF0aW9uXG4gICAgICogY2xlYXJDb25maWdcbiAgICAgKlxuICAgICAqL1xuICAgIERPTVB1cmlmeS5jbGVhckNvbmZpZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIENPTkZJRyA9IG51bGw7XG4gICAgICBTRVRfQ09ORklHID0gZmFsc2U7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBtZXRob2QgdG8gY2hlY2sgaWYgYW4gYXR0cmlidXRlIHZhbHVlIGlzIHZhbGlkLlxuICAgICAqIFVzZXMgbGFzdCBzZXQgY29uZmlnLCBpZiBhbnkuIE90aGVyd2lzZSwgdXNlcyBjb25maWcgZGVmYXVsdHMuXG4gICAgICogaXNWYWxpZEF0dHJpYnV0ZVxuICAgICAqXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSB0YWcgVGFnIG5hbWUgb2YgY29udGFpbmluZyBlbGVtZW50LlxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gYXR0ciBBdHRyaWJ1dGUgbmFtZS5cbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHZhbHVlIEF0dHJpYnV0ZSB2YWx1ZS5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBSZXR1cm5zIHRydWUgaWYgYHZhbHVlYCBpcyB2YWxpZC4gT3RoZXJ3aXNlLCByZXR1cm5zIGZhbHNlLlxuICAgICAqL1xuICAgIERPTVB1cmlmeS5pc1ZhbGlkQXR0cmlidXRlID0gZnVuY3Rpb24gKHRhZywgYXR0ciwgdmFsdWUpIHtcbiAgICAgIC8qIEluaXRpYWxpemUgc2hhcmVkIGNvbmZpZyB2YXJzIGlmIG5lY2Vzc2FyeS4gKi9cbiAgICAgIGlmICghQ09ORklHKSB7XG4gICAgICAgIF9wYXJzZUNvbmZpZyh7fSk7XG4gICAgICB9XG4gICAgICB2YXIgbGNUYWcgPSB0cmFuc2Zvcm1DYXNlRnVuYyh0YWcpO1xuICAgICAgdmFyIGxjTmFtZSA9IHRyYW5zZm9ybUNhc2VGdW5jKGF0dHIpO1xuICAgICAgcmV0dXJuIF9pc1ZhbGlkQXR0cmlidXRlKGxjVGFnLCBsY05hbWUsIHZhbHVlKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkSG9va1xuICAgICAqIFB1YmxpYyBtZXRob2QgdG8gYWRkIERPTVB1cmlmeSBob29rc1xuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGVudHJ5UG9pbnQgZW50cnkgcG9pbnQgZm9yIHRoZSBob29rIHRvIGFkZFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGhvb2tGdW5jdGlvbiBmdW5jdGlvbiB0byBleGVjdXRlXG4gICAgICovXG4gICAgRE9NUHVyaWZ5LmFkZEhvb2sgPSBmdW5jdGlvbiAoZW50cnlQb2ludCwgaG9va0Z1bmN0aW9uKSB7XG4gICAgICBpZiAodHlwZW9mIGhvb2tGdW5jdGlvbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBob29rc1tlbnRyeVBvaW50XSA9IGhvb2tzW2VudHJ5UG9pbnRdIHx8IFtdO1xuICAgICAgYXJyYXlQdXNoKGhvb2tzW2VudHJ5UG9pbnRdLCBob29rRnVuY3Rpb24pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVIb29rXG4gICAgICogUHVibGljIG1ldGhvZCB0byByZW1vdmUgYSBET01QdXJpZnkgaG9vayBhdCBhIGdpdmVuIGVudHJ5UG9pbnRcbiAgICAgKiAocG9wcyBpdCBmcm9tIHRoZSBzdGFjayBvZiBob29rcyBpZiBtb3JlIGFyZSBwcmVzZW50KVxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGVudHJ5UG9pbnQgZW50cnkgcG9pbnQgZm9yIHRoZSBob29rIHRvIHJlbW92ZVxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSByZW1vdmVkKHBvcHBlZCkgaG9va1xuICAgICAqL1xuICAgIERPTVB1cmlmeS5yZW1vdmVIb29rID0gZnVuY3Rpb24gKGVudHJ5UG9pbnQpIHtcbiAgICAgIGlmIChob29rc1tlbnRyeVBvaW50XSkge1xuICAgICAgICByZXR1cm4gYXJyYXlQb3AoaG9va3NbZW50cnlQb2ludF0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVIb29rc1xuICAgICAqIFB1YmxpYyBtZXRob2QgdG8gcmVtb3ZlIGFsbCBET01QdXJpZnkgaG9va3MgYXQgYSBnaXZlbiBlbnRyeVBvaW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IGVudHJ5UG9pbnQgZW50cnkgcG9pbnQgZm9yIHRoZSBob29rcyB0byByZW1vdmVcbiAgICAgKi9cbiAgICBET01QdXJpZnkucmVtb3ZlSG9va3MgPSBmdW5jdGlvbiAoZW50cnlQb2ludCkge1xuICAgICAgaWYgKGhvb2tzW2VudHJ5UG9pbnRdKSB7XG4gICAgICAgIGhvb2tzW2VudHJ5UG9pbnRdID0gW107XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZUFsbEhvb2tzXG4gICAgICogUHVibGljIG1ldGhvZCB0byByZW1vdmUgYWxsIERPTVB1cmlmeSBob29rc1xuICAgICAqXG4gICAgICovXG4gICAgRE9NUHVyaWZ5LnJlbW92ZUFsbEhvb2tzID0gZnVuY3Rpb24gKCkge1xuICAgICAgaG9va3MgPSB7fTtcbiAgICB9O1xuICAgIHJldHVybiBET01QdXJpZnk7XG4gIH1cbiAgdmFyIHB1cmlmeSA9IGNyZWF0ZURPTVB1cmlmeSgpO1xuXG4gIHJldHVybiBwdXJpZnk7XG5cbn0pKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXB1cmlmeS5qcy5tYXBcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmNvbnN0IGxhc3QkMSA9IHJlcXVpcmUoJy4uLy4uL2FycmF5L2xhc3QuanMnKTtcbmNvbnN0IHRvQXJyYXkgPSByZXF1aXJlKCcuLi9faW50ZXJuYWwvdG9BcnJheS5qcycpO1xuY29uc3QgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuLi9wcmVkaWNhdGUvaXNBcnJheUxpa2UuanMnKTtcblxuZnVuY3Rpb24gbGFzdChhcnJheSkge1xuICAgIGlmICghaXNBcnJheUxpa2UuaXNBcnJheUxpa2UoYXJyYXkpKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBsYXN0JDEubGFzdCh0b0FycmF5LnRvQXJyYXkoYXJyYXkpKTtcbn1cblxuZXhwb3J0cy5sYXN0ID0gbGFzdDtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmZ1bmN0aW9uIHRvS2V5KHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbHVlID09PSAnc3ltYm9sJykge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIGlmIChPYmplY3QuaXModmFsdWU/LnZhbHVlT2Y/LigpLCAtMCkpIHtcbiAgICAgICAgcmV0dXJuICctMCc7XG4gICAgfVxuICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xufVxuXG5leHBvcnRzLnRvS2V5ID0gdG9LZXk7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXG5mdW5jdGlvbiBnZXRQcmlvcml0eShhKSB7XG4gICAgaWYgKHR5cGVvZiBhID09PSAnc3ltYm9sJykge1xuICAgICAgICByZXR1cm4gMTtcbiAgICB9XG4gICAgaWYgKGEgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIDI7XG4gICAgfVxuICAgIGlmIChhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIDM7XG4gICAgfVxuICAgIGlmIChhICE9PSBhKSB7XG4gICAgICAgIHJldHVybiA0O1xuICAgIH1cbiAgICByZXR1cm4gMDtcbn1cbmNvbnN0IGNvbXBhcmVWYWx1ZXMgPSAoYSwgYiwgb3JkZXIpID0+IHtcbiAgICBpZiAoYSAhPT0gYikge1xuICAgICAgICBjb25zdCBhUHJpb3JpdHkgPSBnZXRQcmlvcml0eShhKTtcbiAgICAgICAgY29uc3QgYlByaW9yaXR5ID0gZ2V0UHJpb3JpdHkoYik7XG4gICAgICAgIGlmIChhUHJpb3JpdHkgPT09IGJQcmlvcml0eSAmJiBhUHJpb3JpdHkgPT09IDApIHtcbiAgICAgICAgICAgIGlmIChhIDwgYikge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcmRlciA9PT0gJ2Rlc2MnID8gMSA6IC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGEgPiBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yZGVyID09PSAnZGVzYycgPyAtMSA6IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9yZGVyID09PSAnZGVzYycgPyBiUHJpb3JpdHkgLSBhUHJpb3JpdHkgOiBhUHJpb3JpdHkgLSBiUHJpb3JpdHk7XG4gICAgfVxuICAgIHJldHVybiAwO1xufTtcblxuZXhwb3J0cy5jb21wYXJlVmFsdWVzID0gY29tcGFyZVZhbHVlcztcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmZ1bmN0aW9uIHRvQXJyYXkodmFsdWUpIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IEFycmF5LmZyb20odmFsdWUpO1xufVxuXG5leHBvcnRzLnRvQXJyYXkgPSB0b0FycmF5O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuY29uc3QgZGVib3VuY2UgPSByZXF1aXJlKCcuL2RlYm91bmNlLmpzJyk7XG5cbmZ1bmN0aW9uIHRocm90dGxlKGZ1bmMsIHRocm90dGxlTXMgPSAwLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB7IGxlYWRpbmcgPSB0cnVlLCB0cmFpbGluZyA9IHRydWUgfSA9IG9wdGlvbnM7XG4gICAgcmV0dXJuIGRlYm91bmNlLmRlYm91bmNlKGZ1bmMsIHRocm90dGxlTXMsIHtcbiAgICAgICAgbGVhZGluZyxcbiAgICAgICAgbWF4V2FpdDogdGhyb3R0bGVNcyxcbiAgICAgICAgdHJhaWxpbmcsXG4gICAgfSk7XG59XG5cbmV4cG9ydHMudGhyb3R0bGUgPSB0aHJvdHRsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmNvbnN0IGNsb25lRGVlcFdpdGgkMSA9IHJlcXVpcmUoJy4uLy4uL29iamVjdC9jbG9uZURlZXBXaXRoLmpzJyk7XG5jb25zdCB0YWdzID0gcmVxdWlyZSgnLi4vX2ludGVybmFsL3RhZ3MuanMnKTtcblxuZnVuY3Rpb24gY2xvbmVEZWVwV2l0aChvYmosIGN1c3RvbWl6ZXIpIHtcbiAgICByZXR1cm4gY2xvbmVEZWVwV2l0aCQxLmNsb25lRGVlcFdpdGgob2JqLCAodmFsdWUsIGtleSwgb2JqZWN0LCBzdGFjaykgPT4ge1xuICAgICAgICBjb25zdCBjbG9uZWQgPSBjdXN0b21pemVyPy4odmFsdWUsIGtleSwgb2JqZWN0LCBzdGFjayk7XG4gICAgICAgIGlmIChjbG9uZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGNsb25lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSkge1xuICAgICAgICAgICAgY2FzZSB0YWdzLm51bWJlclRhZzpcbiAgICAgICAgICAgIGNhc2UgdGFncy5zdHJpbmdUYWc6XG4gICAgICAgICAgICBjYXNlIHRhZ3MuYm9vbGVhblRhZzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBvYmouY29uc3RydWN0b3Iob2JqPy52YWx1ZU9mKCkpO1xuICAgICAgICAgICAgICAgIGNsb25lRGVlcFdpdGgkMS5jb3B5UHJvcGVydGllcyhyZXN1bHQsIG9iaik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgdGFncy5hcmd1bWVudHNUYWc6IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICAgICAgICAgICAgICBjbG9uZURlZXBXaXRoJDEuY29weVByb3BlcnRpZXMocmVzdWx0LCBvYmopO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5sZW5ndGggPSBvYmoubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtTeW1ib2wuaXRlcmF0b3JdID0gb2JqW1N5bWJvbC5pdGVyYXRvcl07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmV4cG9ydHMuY2xvbmVEZWVwV2l0aCA9IGNsb25lRGVlcFdpdGg7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXG5jb25zdCBjb21wYXJlVmFsdWVzID0gcmVxdWlyZSgnLi4vX2ludGVybmFsL2NvbXBhcmVWYWx1ZXMuanMnKTtcbmNvbnN0IGlzS2V5ID0gcmVxdWlyZSgnLi4vX2ludGVybmFsL2lzS2V5LmpzJyk7XG5jb25zdCB0b1BhdGggPSByZXF1aXJlKCcuLi91dGlsL3RvUGF0aC5qcycpO1xuXG5mdW5jdGlvbiBvcmRlckJ5KGNvbGxlY3Rpb24sIGNyaXRlcmlhLCBvcmRlcnMsIGd1YXJkKSB7XG4gICAgaWYgKGNvbGxlY3Rpb24gPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIG9yZGVycyA9IGd1YXJkID8gdW5kZWZpbmVkIDogb3JkZXJzO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShjb2xsZWN0aW9uKSkge1xuICAgICAgICBjb2xsZWN0aW9uID0gT2JqZWN0LnZhbHVlcyhjb2xsZWN0aW9uKTtcbiAgICB9XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGNyaXRlcmlhKSkge1xuICAgICAgICBjcml0ZXJpYSA9IGNyaXRlcmlhID09IG51bGwgPyBbbnVsbF0gOiBbY3JpdGVyaWFdO1xuICAgIH1cbiAgICBpZiAoY3JpdGVyaWEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNyaXRlcmlhID0gW251bGxdO1xuICAgIH1cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkob3JkZXJzKSkge1xuICAgICAgICBvcmRlcnMgPSBvcmRlcnMgPT0gbnVsbCA/IFtdIDogW29yZGVyc107XG4gICAgfVxuICAgIG9yZGVycyA9IG9yZGVycy5tYXAob3JkZXIgPT4gU3RyaW5nKG9yZGVyKSk7XG4gICAgY29uc3QgZ2V0VmFsdWVCeU5lc3RlZFBhdGggPSAob2JqZWN0LCBwYXRoKSA9PiB7XG4gICAgICAgIGxldCB0YXJnZXQgPSBvYmplY3Q7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGF0aC5sZW5ndGggJiYgdGFyZ2V0ICE9IG51bGw7ICsraSkge1xuICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0W3BhdGhbaV1dO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfTtcbiAgICBjb25zdCBnZXRWYWx1ZUJ5Q3JpdGVyaW9uID0gKGNyaXRlcmlvbiwgb2JqZWN0KSA9PiB7XG4gICAgICAgIGlmIChvYmplY3QgPT0gbnVsbCB8fCBjcml0ZXJpb24gPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGNyaXRlcmlvbiA9PT0gJ29iamVjdCcgJiYgJ2tleScgaW4gY3JpdGVyaW9uKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093bihvYmplY3QsIGNyaXRlcmlvbi5rZXkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iamVjdFtjcml0ZXJpb24ua2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBnZXRWYWx1ZUJ5TmVzdGVkUGF0aChvYmplY3QsIGNyaXRlcmlvbi5wYXRoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGNyaXRlcmlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIGNyaXRlcmlvbihvYmplY3QpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNyaXRlcmlvbikpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRWYWx1ZUJ5TmVzdGVkUGF0aChvYmplY3QsIGNyaXRlcmlvbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0W2NyaXRlcmlvbl07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9O1xuICAgIGNvbnN0IHByZXBhcmVkQ3JpdGVyaWEgPSBjcml0ZXJpYS5tYXAoKGNyaXRlcmlvbikgPT4ge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjcml0ZXJpb24pICYmIGNyaXRlcmlvbi5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIGNyaXRlcmlvbiA9IGNyaXRlcmlvblswXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3JpdGVyaW9uID09IG51bGwgfHwgdHlwZW9mIGNyaXRlcmlvbiA9PT0gJ2Z1bmN0aW9uJyB8fCBBcnJheS5pc0FycmF5KGNyaXRlcmlvbikgfHwgaXNLZXkuaXNLZXkoY3JpdGVyaW9uKSkge1xuICAgICAgICAgICAgcmV0dXJuIGNyaXRlcmlvbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBrZXk6IGNyaXRlcmlvbiwgcGF0aDogdG9QYXRoLnRvUGF0aChjcml0ZXJpb24pIH07XG4gICAgfSk7XG4gICAgY29uc3QgcHJlcGFyZWRDb2xsZWN0aW9uID0gY29sbGVjdGlvbi5tYXAoaXRlbSA9PiAoe1xuICAgICAgICBvcmlnaW5hbDogaXRlbSxcbiAgICAgICAgY3JpdGVyaWE6IHByZXBhcmVkQ3JpdGVyaWEubWFwKChjcml0ZXJpb24pID0+IGdldFZhbHVlQnlDcml0ZXJpb24oY3JpdGVyaW9uLCBpdGVtKSksXG4gICAgfSkpO1xuICAgIHJldHVybiBwcmVwYXJlZENvbGxlY3Rpb25cbiAgICAgICAgLnNsaWNlKClcbiAgICAgICAgLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVwYXJlZENyaXRlcmlhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjb21wYXJlZFJlc3VsdCA9IGNvbXBhcmVWYWx1ZXMuY29tcGFyZVZhbHVlcyhhLmNyaXRlcmlhW2ldLCBiLmNyaXRlcmlhW2ldLCBvcmRlcnNbaV0pO1xuICAgICAgICAgICAgaWYgKGNvbXBhcmVkUmVzdWx0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBhcmVkUmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgIH0pXG4gICAgICAgIC5tYXAoaXRlbSA9PiBpdGVtLm9yaWdpbmFsKTtcbn1cblxuZXhwb3J0cy5vcmRlckJ5ID0gb3JkZXJCeTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmNvbnN0IG1heEJ5JDEgPSByZXF1aXJlKCcuLi8uLi9hcnJheS9tYXhCeS5qcycpO1xuY29uc3QgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi8uLi9mdW5jdGlvbi9pZGVudGl0eS5qcycpO1xuY29uc3QgaXRlcmF0ZWUgPSByZXF1aXJlKCcuLi91dGlsL2l0ZXJhdGVlLmpzJyk7XG5cbmZ1bmN0aW9uIG1heEJ5KGl0ZW1zLCBpdGVyYXRlZSQxKSB7XG4gICAgaWYgKGl0ZW1zID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIG1heEJ5JDEubWF4QnkoQXJyYXkuZnJvbShpdGVtcyksIGl0ZXJhdGVlLml0ZXJhdGVlKGl0ZXJhdGVlJDEgPz8gaWRlbnRpdHkuaWRlbnRpdHkpKTtcbn1cblxuZXhwb3J0cy5tYXhCeSA9IG1heEJ5O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuZnVuY3Rpb24gbWluQnkoaXRlbXMsIGdldFZhbHVlKSB7XG4gICAgaWYgKGl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBsZXQgbWluRWxlbWVudCA9IGl0ZW1zWzBdO1xuICAgIGxldCBtaW4gPSBnZXRWYWx1ZShtaW5FbGVtZW50KTtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBpdGVtc1tpXTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBnZXRWYWx1ZShlbGVtZW50KTtcbiAgICAgICAgaWYgKHZhbHVlIDwgbWluKSB7XG4gICAgICAgICAgICBtaW4gPSB2YWx1ZTtcbiAgICAgICAgICAgIG1pbkVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtaW5FbGVtZW50O1xufVxuXG5leHBvcnRzLm1pbkJ5ID0gbWluQnk7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXG5jb25zdCBpc01hdGNoV2l0aCA9IHJlcXVpcmUoJy4vaXNNYXRjaFdpdGguanMnKTtcblxuZnVuY3Rpb24gaXNNYXRjaCh0YXJnZXQsIHNvdXJjZSkge1xuICAgIHJldHVybiBpc01hdGNoV2l0aC5pc01hdGNoV2l0aCh0YXJnZXQsIHNvdXJjZSwgKCkgPT4gdW5kZWZpbmVkKTtcbn1cblxuZXhwb3J0cy5pc01hdGNoID0gaXNNYXRjaDtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vZGlzdC9jb21wYXQvbWF0aC9yYW5nZS5qcycpLnJhbmdlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuY29uc3QgY2xvbmVEZWVwV2l0aCA9IHJlcXVpcmUoJy4vY2xvbmVEZWVwV2l0aC5qcycpO1xuY29uc3Qga2V5c0luID0gcmVxdWlyZSgnLi9rZXlzSW4uanMnKTtcbmNvbnN0IHVuc2V0ID0gcmVxdWlyZSgnLi91bnNldC5qcycpO1xuY29uc3QgZ2V0U3ltYm9sc0luID0gcmVxdWlyZSgnLi4vX2ludGVybmFsL2dldFN5bWJvbHNJbi5qcycpO1xuY29uc3QgaXNEZWVwS2V5ID0gcmVxdWlyZSgnLi4vX2ludGVybmFsL2lzRGVlcEtleS5qcycpO1xuY29uc3QgZmxhdHRlbiA9IHJlcXVpcmUoJy4uL2FycmF5L2ZsYXR0ZW4uanMnKTtcbmNvbnN0IGlzUGxhaW5PYmplY3QgPSByZXF1aXJlKCcuLi9wcmVkaWNhdGUvaXNQbGFpbk9iamVjdC5qcycpO1xuXG5mdW5jdGlvbiBvbWl0KG9iaiwgLi4ua2V5c0Fycikge1xuICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGtleXNBcnIgPSBmbGF0dGVuLmZsYXR0ZW4oa2V5c0Fycik7XG4gICAgY29uc3QgcmVzdWx0ID0gY2xvbmVJbk9taXQob2JqLCBrZXlzQXJyKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXNBcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IGtleXMgPSBrZXlzQXJyW2ldO1xuICAgICAgICBzd2l0Y2ggKHR5cGVvZiBrZXlzKSB7XG4gICAgICAgICAgICBjYXNlICdvYmplY3QnOiB7XG4gICAgICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGtleXMpKSB7XG4gICAgICAgICAgICAgICAgICAgIGtleXMgPSBBcnJheS5mcm9tKGtleXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGtleXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0ga2V5c1tqXTtcbiAgICAgICAgICAgICAgICAgICAgdW5zZXQudW5zZXQocmVzdWx0LCBrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICBjYXNlICdzeW1ib2wnOlxuICAgICAgICAgICAgY2FzZSAnbnVtYmVyJzoge1xuICAgICAgICAgICAgICAgIHVuc2V0LnVuc2V0KHJlc3VsdCwga2V5cyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGNsb25lSW5PbWl0KG9iaiwga2V5cykge1xuICAgIGNvbnN0IGhhc0RlZXBLZXkgPSBrZXlzLnNvbWUoa2V5ID0+IEFycmF5LmlzQXJyYXkoa2V5KSB8fCBpc0RlZXBLZXkuaXNEZWVwS2V5KGtleSkpO1xuICAgIGlmIChoYXNEZWVwS2V5KSB7XG4gICAgICAgIHJldHVybiBkZWVwQ2xvbmVJbk9taXQob2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIHNoYWxsb3dDbG9uZUluT21pdChvYmopO1xufVxuZnVuY3Rpb24gc2hhbGxvd0Nsb25lSW5PbWl0KG9iaikge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGNvbnN0IGtleXNUb0NvcHkgPSBbLi4ua2V5c0luLmtleXNJbihvYmopLCAuLi5nZXRTeW1ib2xzSW4uZ2V0U3ltYm9sc0luKG9iaildO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5c1RvQ29weS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBrZXkgPSBrZXlzVG9Db3B5W2ldO1xuICAgICAgICByZXN1bHRba2V5XSA9IG9ialtrZXldO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gZGVlcENsb25lSW5PbWl0KG9iaikge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGNvbnN0IGtleXNUb0NvcHkgPSBbLi4ua2V5c0luLmtleXNJbihvYmopLCAuLi5nZXRTeW1ib2xzSW4uZ2V0U3ltYm9sc0luKG9iaildO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5c1RvQ29weS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBrZXkgPSBrZXlzVG9Db3B5W2ldO1xuICAgICAgICByZXN1bHRba2V5XSA9IGNsb25lRGVlcFdpdGguY2xvbmVEZWVwV2l0aChvYmpba2V5XSwgdmFsdWVUb0Nsb25lID0+IHtcbiAgICAgICAgICAgIGlmIChpc1BsYWluT2JqZWN0LmlzUGxhaW5PYmplY3QodmFsdWVUb0Nsb25lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVUb0Nsb25lO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0cy5vbWl0ID0gb21pdDtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmNvbnN0IHRvTnVtYmVyID0gcmVxdWlyZSgnLi90b051bWJlci5qcycpO1xuXG5mdW5jdGlvbiB0b0Zpbml0ZSh2YWx1ZSkge1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlID09PSAwID8gdmFsdWUgOiAwO1xuICAgIH1cbiAgICB2YWx1ZSA9IHRvTnVtYmVyLnRvTnVtYmVyKHZhbHVlKTtcbiAgICBpZiAodmFsdWUgPT09IEluZmluaXR5IHx8IHZhbHVlID09PSAtSW5maW5pdHkpIHtcbiAgICAgICAgY29uc3Qgc2lnbiA9IHZhbHVlIDwgMCA/IC0xIDogMTtcbiAgICAgICAgcmV0dXJuIHNpZ24gKiBOdW1iZXIuTUFYX1ZBTFVFO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWUgPT09IHZhbHVlID8gdmFsdWUgOiAwO1xufVxuXG5leHBvcnRzLnRvRmluaXRlID0gdG9GaW5pdGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpO1xufVxuXG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXG5mdW5jdGlvbiBpc1Byb3RvdHlwZSh2YWx1ZSkge1xuICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdmFsdWU/LmNvbnN0cnVjdG9yO1xuICAgIGNvbnN0IHByb3RvdHlwZSA9IHR5cGVvZiBjb25zdHJ1Y3RvciA9PT0gJ2Z1bmN0aW9uJyA/IGNvbnN0cnVjdG9yLnByb3RvdHlwZSA6IE9iamVjdC5wcm90b3R5cGU7XG4gICAgcmV0dXJuIHZhbHVlID09PSBwcm90b3R5cGU7XG59XG5cbmV4cG9ydHMuaXNQcm90b3R5cGUgPSBpc1Byb3RvdHlwZTtcbiIsIi8vIGNoZWFwIGxvZGFzaCByZXBsYWNlbWVudHNcbi8qKlxuICogZHJvcC1pbiByZXBsYWNlbWVudCBmb3IgXy5nZXRcbiAqIEBwYXJhbSBvYmpcbiAqIEBwYXJhbSBwYXRoXG4gKiBAcGFyYW0gZGVmYXVsdFZhbHVlXG4gKi8gZXhwb3J0IGZ1bmN0aW9uIGdldChvYmosIHBhdGgsIGRlZmF1bHRWYWx1ZSkge1xuICAgIHJldHVybiBwYXRoLnNwbGl0KCcuJykucmVkdWNlKChhLCBjKT0+YSAmJiBhW2NdID8gYVtjXSA6IGRlZmF1bHRWYWx1ZSB8fCBudWxsXG4gICAgLCBvYmopO1xufVxuLyoqXG4gKiBkcm9wLWluIHJlcGxhY2VtZW50IGZvciBfLndpdGhvdXRcbiAqLyBleHBvcnQgZnVuY3Rpb24gd2l0aG91dChpdGVtcywgaXRlbSkge1xuICAgIHJldHVybiBpdGVtcy5maWx0ZXIoKGkpPT5pICE9PSBpdGVtXG4gICAgKTtcbn1cbi8qKlxuICogZHJvcC1pbiByZXBsYWNlbWVudCBmb3IgXy5pc1N0cmluZ1xuICogQHBhcmFtIGlucHV0XG4gKi8gZXhwb3J0IGZ1bmN0aW9uIGlzU3RyaW5nKGlucHV0KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZyc7XG59XG4vKipcbiAqIGRyb3AtaW4gcmVwbGFjZW1lbnQgZm9yIF8uaXNTdHJpbmdcbiAqIEBwYXJhbSBpbnB1dFxuICovIGV4cG9ydCBmdW5jdGlvbiBpc09iamVjdChpbnB1dCkge1xuICAgIHJldHVybiB0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnO1xufVxuLyoqXG4gKiByZXBsYWNlbWVudCBmb3IgXy54b3JcbiAqIEBwYXJhbSBpdGVtc0FcbiAqIEBwYXJhbSBpdGVtc0JcbiAqLyBleHBvcnQgZnVuY3Rpb24geG9yKGl0ZW1zQSwgaXRlbXNCKSB7XG4gICAgY29uc3QgbWFwID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IGluc2VydEl0ZW0gPSAoaXRlbSk9PntcbiAgICAgICAgbWFwLnNldChpdGVtLCBtYXAuaGFzKGl0ZW0pID8gbWFwLmdldChpdGVtKSArIDEgOiAxKTtcbiAgICB9O1xuICAgIGl0ZW1zQS5mb3JFYWNoKGluc2VydEl0ZW0pO1xuICAgIGl0ZW1zQi5mb3JFYWNoKGluc2VydEl0ZW0pO1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIG1hcC5mb3JFYWNoKChjb3VudCwga2V5KT0+e1xuICAgICAgICBpZiAoY291bnQgPT09IDEpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuLyoqXG4gKiByZXBsYWNlbWVudCBmb3IgXy5pbnRlcnNlY3Rpb25cbiAqIEBwYXJhbSBpdGVtc0FcbiAqIEBwYXJhbSBpdGVtc0JcbiAqLyBleHBvcnQgZnVuY3Rpb24gaW50ZXJzZWN0aW9uKGl0ZW1zQSwgaXRlbXNCKSB7XG4gICAgcmV0dXJuIGl0ZW1zQS5maWx0ZXIoKHQpPT5pdGVtc0IuaW5kZXhPZih0KSA+IC0xXG4gICAgKTtcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9anNfdXRpbHMuanMubWFwIiwiZXhwb3J0IGNvbnN0IElOSVRfQ09PUkRTID0gJ2RuZC1jb3JlL0lOSVRfQ09PUkRTJztcbmV4cG9ydCBjb25zdCBCRUdJTl9EUkFHID0gJ2RuZC1jb3JlL0JFR0lOX0RSQUcnO1xuZXhwb3J0IGNvbnN0IFBVQkxJU0hfRFJBR19TT1VSQ0UgPSAnZG5kLWNvcmUvUFVCTElTSF9EUkFHX1NPVVJDRSc7XG5leHBvcnQgY29uc3QgSE9WRVIgPSAnZG5kLWNvcmUvSE9WRVInO1xuZXhwb3J0IGNvbnN0IERST1AgPSAnZG5kLWNvcmUvRFJPUCc7XG5leHBvcnQgY29uc3QgRU5EX0RSQUcgPSAnZG5kLWNvcmUvRU5EX0RSQUcnO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD10eXBlcy5qcy5tYXAiLCJpbXBvcnQgeyBJTklUX0NPT1JEUyB9IGZyb20gJy4uL3R5cGVzLmpzJztcbmV4cG9ydCBmdW5jdGlvbiBzZXRDbGllbnRPZmZzZXQoY2xpZW50T2Zmc2V0LCBzb3VyY2VDbGllbnRPZmZzZXQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBJTklUX0NPT1JEUyxcbiAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgc291cmNlQ2xpZW50T2Zmc2V0OiBzb3VyY2VDbGllbnRPZmZzZXQgfHwgbnVsbCxcbiAgICAgICAgICAgIGNsaWVudE9mZnNldDogY2xpZW50T2Zmc2V0IHx8IG51bGxcbiAgICAgICAgfVxuICAgIH07XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNldENsaWVudE9mZnNldC5qcy5tYXAiLCJpbXBvcnQgeyBpbnZhcmlhbnQgfSBmcm9tICdAcmVhY3QtZG5kL2ludmFyaWFudCc7XG5pbXBvcnQgeyBpc09iamVjdCB9IGZyb20gJy4uLy4uL3V0aWxzL2pzX3V0aWxzLmpzJztcbmltcG9ydCB7IHNldENsaWVudE9mZnNldCB9IGZyb20gJy4vbG9jYWwvc2V0Q2xpZW50T2Zmc2V0LmpzJztcbmltcG9ydCB7IEJFR0lOX0RSQUcsIElOSVRfQ09PUkRTIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5jb25zdCBSZXNldENvb3JkaW5hdGVzQWN0aW9uID0ge1xuICAgIHR5cGU6IElOSVRfQ09PUkRTLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgICAgY2xpZW50T2Zmc2V0OiBudWxsLFxuICAgICAgICBzb3VyY2VDbGllbnRPZmZzZXQ6IG51bGxcbiAgICB9XG59O1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJlZ2luRHJhZyhtYW5hZ2VyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGJlZ2luRHJhZyhzb3VyY2VJZHMgPSBbXSwgb3B0aW9ucyA9IHtcbiAgICAgICAgcHVibGlzaFNvdXJjZTogdHJ1ZVxuICAgIH0pIHtcbiAgICAgICAgY29uc3QgeyBwdWJsaXNoU291cmNlID10cnVlICwgY2xpZW50T2Zmc2V0ICwgZ2V0U291cmNlQ2xpZW50T2Zmc2V0ICwgIH0gPSBvcHRpb25zO1xuICAgICAgICBjb25zdCBtb25pdG9yID0gbWFuYWdlci5nZXRNb25pdG9yKCk7XG4gICAgICAgIGNvbnN0IHJlZ2lzdHJ5ID0gbWFuYWdlci5nZXRSZWdpc3RyeSgpO1xuICAgICAgICAvLyBJbml0aWFsaXplIHRoZSBjb29yZGluYXRlcyB1c2luZyB0aGUgY2xpZW50IG9mZnNldFxuICAgICAgICBtYW5hZ2VyLmRpc3BhdGNoKHNldENsaWVudE9mZnNldChjbGllbnRPZmZzZXQpKTtcbiAgICAgICAgdmVyaWZ5SW52YXJpYW50cyhzb3VyY2VJZHMsIG1vbml0b3IsIHJlZ2lzdHJ5KTtcbiAgICAgICAgLy8gR2V0IHRoZSBkcmFnZ2FibGUgc291cmNlXG4gICAgICAgIGNvbnN0IHNvdXJjZUlkID0gZ2V0RHJhZ2dhYmxlU291cmNlKHNvdXJjZUlkcywgbW9uaXRvcik7XG4gICAgICAgIGlmIChzb3VyY2VJZCA9PSBudWxsKSB7XG4gICAgICAgICAgICBtYW5hZ2VyLmRpc3BhdGNoKFJlc2V0Q29vcmRpbmF0ZXNBY3Rpb24pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIEdldCB0aGUgc291cmNlIGNsaWVudCBvZmZzZXRcbiAgICAgICAgbGV0IHNvdXJjZUNsaWVudE9mZnNldCA9IG51bGw7XG4gICAgICAgIGlmIChjbGllbnRPZmZzZXQpIHtcbiAgICAgICAgICAgIGlmICghZ2V0U291cmNlQ2xpZW50T2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdnZXRTb3VyY2VDbGllbnRPZmZzZXQgbXVzdCBiZSBkZWZpbmVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2ZXJpZnlHZXRTb3VyY2VDbGllbnRPZmZzZXRJc0Z1bmN0aW9uKGdldFNvdXJjZUNsaWVudE9mZnNldCk7XG4gICAgICAgICAgICBzb3VyY2VDbGllbnRPZmZzZXQgPSBnZXRTb3VyY2VDbGllbnRPZmZzZXQoc291cmNlSWQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEluaXRpYWxpemUgdGhlIGZ1bGwgY29vcmRpbmF0ZXNcbiAgICAgICAgbWFuYWdlci5kaXNwYXRjaChzZXRDbGllbnRPZmZzZXQoY2xpZW50T2Zmc2V0LCBzb3VyY2VDbGllbnRPZmZzZXQpKTtcbiAgICAgICAgY29uc3Qgc291cmNlID0gcmVnaXN0cnkuZ2V0U291cmNlKHNvdXJjZUlkKTtcbiAgICAgICAgY29uc3QgaXRlbSA9IHNvdXJjZS5iZWdpbkRyYWcobW9uaXRvciwgc291cmNlSWQpO1xuICAgICAgICAvLyBJZiBzb3VyY2UuYmVnaW5EcmFnIHJldHVybnMgbnVsbCwgdGhpcyBpcyBhbiBpbmRpY2F0b3IgdG8gY2FuY2VsIHRoZSBkcmFnXG4gICAgICAgIGlmIChpdGVtID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgdmVyaWZ5SXRlbUlzT2JqZWN0KGl0ZW0pO1xuICAgICAgICByZWdpc3RyeS5waW5Tb3VyY2Uoc291cmNlSWQpO1xuICAgICAgICBjb25zdCBpdGVtVHlwZSA9IHJlZ2lzdHJ5LmdldFNvdXJjZVR5cGUoc291cmNlSWQpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHlwZTogQkVHSU5fRFJBRyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgICBpdGVtVHlwZSxcbiAgICAgICAgICAgICAgICBpdGVtLFxuICAgICAgICAgICAgICAgIHNvdXJjZUlkLFxuICAgICAgICAgICAgICAgIGNsaWVudE9mZnNldDogY2xpZW50T2Zmc2V0IHx8IG51bGwsXG4gICAgICAgICAgICAgICAgc291cmNlQ2xpZW50T2Zmc2V0OiBzb3VyY2VDbGllbnRPZmZzZXQgfHwgbnVsbCxcbiAgICAgICAgICAgICAgICBpc1NvdXJjZVB1YmxpYzogISFwdWJsaXNoU291cmNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHZlcmlmeUludmFyaWFudHMoc291cmNlSWRzLCBtb25pdG9yLCByZWdpc3RyeSkge1xuICAgIGludmFyaWFudCghbW9uaXRvci5pc0RyYWdnaW5nKCksICdDYW5ub3QgY2FsbCBiZWdpbkRyYWcgd2hpbGUgZHJhZ2dpbmcuJyk7XG4gICAgc291cmNlSWRzLmZvckVhY2goZnVuY3Rpb24oc291cmNlSWQpIHtcbiAgICAgICAgaW52YXJpYW50KHJlZ2lzdHJ5LmdldFNvdXJjZShzb3VyY2VJZCksICdFeHBlY3RlZCBzb3VyY2VJZHMgdG8gYmUgcmVnaXN0ZXJlZC4nKTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIHZlcmlmeUdldFNvdXJjZUNsaWVudE9mZnNldElzRnVuY3Rpb24oZ2V0U291cmNlQ2xpZW50T2Zmc2V0KSB7XG4gICAgaW52YXJpYW50KHR5cGVvZiBnZXRTb3VyY2VDbGllbnRPZmZzZXQgPT09ICdmdW5jdGlvbicsICdXaGVuIGNsaWVudE9mZnNldCBpcyBwcm92aWRlZCwgZ2V0U291cmNlQ2xpZW50T2Zmc2V0IG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbn1cbmZ1bmN0aW9uIHZlcmlmeUl0ZW1Jc09iamVjdChpdGVtKSB7XG4gICAgaW52YXJpYW50KGlzT2JqZWN0KGl0ZW0pLCAnSXRlbSBtdXN0IGJlIGFuIG9iamVjdC4nKTtcbn1cbmZ1bmN0aW9uIGdldERyYWdnYWJsZVNvdXJjZShzb3VyY2VJZHMsIG1vbml0b3IpIHtcbiAgICBsZXQgc291cmNlSWQgPSBudWxsO1xuICAgIGZvcihsZXQgaSA9IHNvdXJjZUlkcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSl7XG4gICAgICAgIGlmIChtb25pdG9yLmNhbkRyYWdTb3VyY2Uoc291cmNlSWRzW2ldKSkge1xuICAgICAgICAgICAgc291cmNlSWQgPSBzb3VyY2VJZHNbaV07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc291cmNlSWQ7XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJlZ2luRHJhZy5qcy5tYXAiLCJmdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7XG4gICAgaWYgKGtleSBpbiBvYmopIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7XG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb2JqW2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbn1cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQodGFyZ2V0KSB7XG4gICAgZm9yKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKyl7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV0gIT0gbnVsbCA/IGFyZ3VtZW50c1tpXSA6IHt9O1xuICAgICAgICB2YXIgb3duS2V5cyA9IE9iamVjdC5rZXlzKHNvdXJjZSk7XG4gICAgICAgIGlmICh0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgb3duS2V5cyA9IG93bktleXMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoc291cmNlKS5maWx0ZXIoZnVuY3Rpb24oc3ltKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBzeW0pLmVudW1lcmFibGU7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgb3duS2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgX2RlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBzb3VyY2Vba2V5XSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xufVxuaW1wb3J0IHsgaW52YXJpYW50IH0gZnJvbSAnQHJlYWN0LWRuZC9pbnZhcmlhbnQnO1xuaW1wb3J0IHsgaXNPYmplY3QgfSBmcm9tICcuLi8uLi91dGlscy9qc191dGlscy5qcyc7XG5pbXBvcnQgeyBEUk9QIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRHJvcChtYW5hZ2VyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGRyb3Aob3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IG1vbml0b3IgPSBtYW5hZ2VyLmdldE1vbml0b3IoKTtcbiAgICAgICAgY29uc3QgcmVnaXN0cnkgPSBtYW5hZ2VyLmdldFJlZ2lzdHJ5KCk7XG4gICAgICAgIHZlcmlmeUludmFyaWFudHMobW9uaXRvcik7XG4gICAgICAgIGNvbnN0IHRhcmdldElkcyA9IGdldERyb3BwYWJsZVRhcmdldHMobW9uaXRvcik7XG4gICAgICAgIC8vIE11bHRpcGxlIGFjdGlvbnMgYXJlIGRpc3BhdGNoZWQgaGVyZSwgd2hpY2ggaXMgd2h5IHRoaXMgZG9lc24ndCByZXR1cm4gYW4gYWN0aW9uXG4gICAgICAgIHRhcmdldElkcy5mb3JFYWNoKCh0YXJnZXRJZCwgaW5kZXgpPT57XG4gICAgICAgICAgICBjb25zdCBkcm9wUmVzdWx0ID0gZGV0ZXJtaW5lRHJvcFJlc3VsdCh0YXJnZXRJZCwgaW5kZXgsIHJlZ2lzdHJ5LCBtb25pdG9yKTtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBEUk9QLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgZHJvcFJlc3VsdDogX29iamVjdFNwcmVhZCh7fSwgb3B0aW9ucywgZHJvcFJlc3VsdClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbWFuYWdlci5kaXNwYXRjaChhY3Rpb24pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuZnVuY3Rpb24gdmVyaWZ5SW52YXJpYW50cyhtb25pdG9yKSB7XG4gICAgaW52YXJpYW50KG1vbml0b3IuaXNEcmFnZ2luZygpLCAnQ2Fubm90IGNhbGwgZHJvcCB3aGlsZSBub3QgZHJhZ2dpbmcuJyk7XG4gICAgaW52YXJpYW50KCFtb25pdG9yLmRpZERyb3AoKSwgJ0Nhbm5vdCBjYWxsIGRyb3AgdHdpY2UgZHVyaW5nIG9uZSBkcmFnIG9wZXJhdGlvbi4nKTtcbn1cbmZ1bmN0aW9uIGRldGVybWluZURyb3BSZXN1bHQodGFyZ2V0SWQsIGluZGV4LCByZWdpc3RyeSwgbW9uaXRvcikge1xuICAgIGNvbnN0IHRhcmdldCA9IHJlZ2lzdHJ5LmdldFRhcmdldCh0YXJnZXRJZCk7XG4gICAgbGV0IGRyb3BSZXN1bHQgPSB0YXJnZXQgPyB0YXJnZXQuZHJvcChtb25pdG9yLCB0YXJnZXRJZCkgOiB1bmRlZmluZWQ7XG4gICAgdmVyaWZ5RHJvcFJlc3VsdFR5cGUoZHJvcFJlc3VsdCk7XG4gICAgaWYgKHR5cGVvZiBkcm9wUmVzdWx0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBkcm9wUmVzdWx0ID0gaW5kZXggPT09IDAgPyB7fSA6IG1vbml0b3IuZ2V0RHJvcFJlc3VsdCgpO1xuICAgIH1cbiAgICByZXR1cm4gZHJvcFJlc3VsdDtcbn1cbmZ1bmN0aW9uIHZlcmlmeURyb3BSZXN1bHRUeXBlKGRyb3BSZXN1bHQpIHtcbiAgICBpbnZhcmlhbnQodHlwZW9mIGRyb3BSZXN1bHQgPT09ICd1bmRlZmluZWQnIHx8IGlzT2JqZWN0KGRyb3BSZXN1bHQpLCAnRHJvcCByZXN1bHQgbXVzdCBlaXRoZXIgYmUgYW4gb2JqZWN0IG9yIHVuZGVmaW5lZC4nKTtcbn1cbmZ1bmN0aW9uIGdldERyb3BwYWJsZVRhcmdldHMobW9uaXRvcikge1xuICAgIGNvbnN0IHRhcmdldElkcyA9IG1vbml0b3IuZ2V0VGFyZ2V0SWRzKCkuZmlsdGVyKG1vbml0b3IuY2FuRHJvcE9uVGFyZ2V0LCBtb25pdG9yKTtcbiAgICB0YXJnZXRJZHMucmV2ZXJzZSgpO1xuICAgIHJldHVybiB0YXJnZXRJZHM7XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRyb3AuanMubWFwIiwiaW1wb3J0IHsgaW52YXJpYW50IH0gZnJvbSAnQHJlYWN0LWRuZC9pbnZhcmlhbnQnO1xuaW1wb3J0IHsgRU5EX0RSQUcgfSBmcm9tICcuL3R5cGVzLmpzJztcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFbmREcmFnKG1hbmFnZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gZW5kRHJhZygpIHtcbiAgICAgICAgY29uc3QgbW9uaXRvciA9IG1hbmFnZXIuZ2V0TW9uaXRvcigpO1xuICAgICAgICBjb25zdCByZWdpc3RyeSA9IG1hbmFnZXIuZ2V0UmVnaXN0cnkoKTtcbiAgICAgICAgdmVyaWZ5SXNEcmFnZ2luZyhtb25pdG9yKTtcbiAgICAgICAgY29uc3Qgc291cmNlSWQgPSBtb25pdG9yLmdldFNvdXJjZUlkKCk7XG4gICAgICAgIGlmIChzb3VyY2VJZCAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBzb3VyY2UgPSByZWdpc3RyeS5nZXRTb3VyY2Uoc291cmNlSWQsIHRydWUpO1xuICAgICAgICAgICAgc291cmNlLmVuZERyYWcobW9uaXRvciwgc291cmNlSWQpO1xuICAgICAgICAgICAgcmVnaXN0cnkudW5waW5Tb3VyY2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHlwZTogRU5EX0RSQUdcbiAgICAgICAgfTtcbiAgICB9O1xufVxuZnVuY3Rpb24gdmVyaWZ5SXNEcmFnZ2luZyhtb25pdG9yKSB7XG4gICAgaW52YXJpYW50KG1vbml0b3IuaXNEcmFnZ2luZygpLCAnQ2Fubm90IGNhbGwgZW5kRHJhZyB3aGlsZSBub3QgZHJhZ2dpbmcuJyk7XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVuZERyYWcuanMubWFwIiwiZXhwb3J0IGZ1bmN0aW9uIG1hdGNoZXNUeXBlKHRhcmdldFR5cGUsIGRyYWdnZWRJdGVtVHlwZSkge1xuICAgIGlmIChkcmFnZ2VkSXRlbVR5cGUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldFR5cGUgPT09IG51bGw7XG4gICAgfVxuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHRhcmdldFR5cGUpID8gdGFyZ2V0VHlwZS5zb21lKCh0KT0+dCA9PT0gZHJhZ2dlZEl0ZW1UeXBlXG4gICAgKSA6IHRhcmdldFR5cGUgPT09IGRyYWdnZWRJdGVtVHlwZTtcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWF0Y2hlc1R5cGUuanMubWFwIiwiaW1wb3J0IHsgaW52YXJpYW50IH0gZnJvbSAnQHJlYWN0LWRuZC9pbnZhcmlhbnQnO1xuaW1wb3J0IHsgbWF0Y2hlc1R5cGUgfSBmcm9tICcuLi8uLi91dGlscy9tYXRjaGVzVHlwZS5qcyc7XG5pbXBvcnQgeyBIT1ZFUiB9IGZyb20gJy4vdHlwZXMuanMnO1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhvdmVyKG1hbmFnZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gaG92ZXIodGFyZ2V0SWRzQXJnLCB7IGNsaWVudE9mZnNldCAgfSA9IHt9KSB7XG4gICAgICAgIHZlcmlmeVRhcmdldElkc0lzQXJyYXkodGFyZ2V0SWRzQXJnKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0SWRzID0gdGFyZ2V0SWRzQXJnLnNsaWNlKDApO1xuICAgICAgICBjb25zdCBtb25pdG9yID0gbWFuYWdlci5nZXRNb25pdG9yKCk7XG4gICAgICAgIGNvbnN0IHJlZ2lzdHJ5ID0gbWFuYWdlci5nZXRSZWdpc3RyeSgpO1xuICAgICAgICBjb25zdCBkcmFnZ2VkSXRlbVR5cGUgPSBtb25pdG9yLmdldEl0ZW1UeXBlKCk7XG4gICAgICAgIHJlbW92ZU5vbk1hdGNoaW5nVGFyZ2V0SWRzKHRhcmdldElkcywgcmVnaXN0cnksIGRyYWdnZWRJdGVtVHlwZSk7XG4gICAgICAgIGNoZWNrSW52YXJpYW50cyh0YXJnZXRJZHMsIG1vbml0b3IsIHJlZ2lzdHJ5KTtcbiAgICAgICAgaG92ZXJBbGxUYXJnZXRzKHRhcmdldElkcywgbW9uaXRvciwgcmVnaXN0cnkpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHlwZTogSE9WRVIsXG4gICAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0SWRzLFxuICAgICAgICAgICAgICAgIGNsaWVudE9mZnNldDogY2xpZW50T2Zmc2V0IHx8IG51bGxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xufVxuZnVuY3Rpb24gdmVyaWZ5VGFyZ2V0SWRzSXNBcnJheSh0YXJnZXRJZHNBcmcpIHtcbiAgICBpbnZhcmlhbnQoQXJyYXkuaXNBcnJheSh0YXJnZXRJZHNBcmcpLCAnRXhwZWN0ZWQgdGFyZ2V0SWRzIHRvIGJlIGFuIGFycmF5LicpO1xufVxuZnVuY3Rpb24gY2hlY2tJbnZhcmlhbnRzKHRhcmdldElkcywgbW9uaXRvciwgcmVnaXN0cnkpIHtcbiAgICBpbnZhcmlhbnQobW9uaXRvci5pc0RyYWdnaW5nKCksICdDYW5ub3QgY2FsbCBob3ZlciB3aGlsZSBub3QgZHJhZ2dpbmcuJyk7XG4gICAgaW52YXJpYW50KCFtb25pdG9yLmRpZERyb3AoKSwgJ0Nhbm5vdCBjYWxsIGhvdmVyIGFmdGVyIGRyb3AuJyk7XG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHRhcmdldElkcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgIGNvbnN0IHRhcmdldElkID0gdGFyZ2V0SWRzW2ldO1xuICAgICAgICBpbnZhcmlhbnQodGFyZ2V0SWRzLmxhc3RJbmRleE9mKHRhcmdldElkKSA9PT0gaSwgJ0V4cGVjdGVkIHRhcmdldElkcyB0byBiZSB1bmlxdWUgaW4gdGhlIHBhc3NlZCBhcnJheS4nKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gcmVnaXN0cnkuZ2V0VGFyZ2V0KHRhcmdldElkKTtcbiAgICAgICAgaW52YXJpYW50KHRhcmdldCwgJ0V4cGVjdGVkIHRhcmdldElkcyB0byBiZSByZWdpc3RlcmVkLicpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHJlbW92ZU5vbk1hdGNoaW5nVGFyZ2V0SWRzKHRhcmdldElkcywgcmVnaXN0cnksIGRyYWdnZWRJdGVtVHlwZSkge1xuICAgIC8vIFJlbW92ZSB0aG9zZSB0YXJnZXRJZHMgdGhhdCBkb24ndCBtYXRjaCB0aGUgdGFyZ2V0VHlwZS4gIFRoaXNcbiAgICAvLyBmaXhlcyBzaGFsbG93IGlzT3ZlciB3aGljaCB3b3VsZCBvbmx5IGJlIG5vbi1zaGFsbG93IGJlY2F1c2Ugb2ZcbiAgICAvLyBub24tbWF0Y2hpbmcgdGFyZ2V0cy5cbiAgICBmb3IobGV0IGkgPSB0YXJnZXRJZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pe1xuICAgICAgICBjb25zdCB0YXJnZXRJZCA9IHRhcmdldElkc1tpXTtcbiAgICAgICAgY29uc3QgdGFyZ2V0VHlwZSA9IHJlZ2lzdHJ5LmdldFRhcmdldFR5cGUodGFyZ2V0SWQpO1xuICAgICAgICBpZiAoIW1hdGNoZXNUeXBlKHRhcmdldFR5cGUsIGRyYWdnZWRJdGVtVHlwZSkpIHtcbiAgICAgICAgICAgIHRhcmdldElkcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBob3ZlckFsbFRhcmdldHModGFyZ2V0SWRzLCBtb25pdG9yLCByZWdpc3RyeSkge1xuICAgIC8vIEZpbmFsbHkgY2FsbCBob3ZlciBvbiBhbGwgbWF0Y2hpbmcgdGFyZ2V0cy5cbiAgICB0YXJnZXRJZHMuZm9yRWFjaChmdW5jdGlvbih0YXJnZXRJZCkge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSByZWdpc3RyeS5nZXRUYXJnZXQodGFyZ2V0SWQpO1xuICAgICAgICB0YXJnZXQuaG92ZXIobW9uaXRvciwgdGFyZ2V0SWQpO1xuICAgIH0pO1xufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1ob3Zlci5qcy5tYXAiLCJpbXBvcnQgeyBQVUJMSVNIX0RSQUdfU09VUkNFIH0gZnJvbSAnLi90eXBlcy5qcyc7XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHVibGlzaERyYWdTb3VyY2UobWFuYWdlcikge1xuICAgIHJldHVybiBmdW5jdGlvbiBwdWJsaXNoRHJhZ1NvdXJjZSgpIHtcbiAgICAgICAgY29uc3QgbW9uaXRvciA9IG1hbmFnZXIuZ2V0TW9uaXRvcigpO1xuICAgICAgICBpZiAobW9uaXRvci5pc0RyYWdnaW5nKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogUFVCTElTSF9EUkFHX1NPVVJDRVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfTtcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHVibGlzaERyYWdTb3VyY2UuanMubWFwIiwiaW1wb3J0IHsgY3JlYXRlQmVnaW5EcmFnIH0gZnJvbSAnLi9iZWdpbkRyYWcuanMnO1xuaW1wb3J0IHsgY3JlYXRlRHJvcCB9IGZyb20gJy4vZHJvcC5qcyc7XG5pbXBvcnQgeyBjcmVhdGVFbmREcmFnIH0gZnJvbSAnLi9lbmREcmFnLmpzJztcbmltcG9ydCB7IGNyZWF0ZUhvdmVyIH0gZnJvbSAnLi9ob3Zlci5qcyc7XG5pbXBvcnQgeyBjcmVhdGVQdWJsaXNoRHJhZ1NvdXJjZSB9IGZyb20gJy4vcHVibGlzaERyYWdTb3VyY2UuanMnO1xuZXhwb3J0ICogZnJvbSAnLi90eXBlcy5qcyc7XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRHJhZ0Ryb3BBY3Rpb25zKG1hbmFnZXIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBiZWdpbkRyYWc6IGNyZWF0ZUJlZ2luRHJhZyhtYW5hZ2VyKSxcbiAgICAgICAgcHVibGlzaERyYWdTb3VyY2U6IGNyZWF0ZVB1Ymxpc2hEcmFnU291cmNlKG1hbmFnZXIpLFxuICAgICAgICBob3ZlcjogY3JlYXRlSG92ZXIobWFuYWdlciksXG4gICAgICAgIGRyb3A6IGNyZWF0ZURyb3AobWFuYWdlciksXG4gICAgICAgIGVuZERyYWc6IGNyZWF0ZUVuZERyYWcobWFuYWdlcilcbiAgICB9O1xufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCJpbXBvcnQgeyBjcmVhdGVEcmFnRHJvcEFjdGlvbnMgfSBmcm9tICcuLi9hY3Rpb25zL2RyYWdEcm9wL2luZGV4LmpzJztcbmV4cG9ydCBjbGFzcyBEcmFnRHJvcE1hbmFnZXJJbXBsIHtcbiAgICByZWNlaXZlQmFja2VuZChiYWNrZW5kKSB7XG4gICAgICAgIHRoaXMuYmFja2VuZCA9IGJhY2tlbmQ7XG4gICAgfVxuICAgIGdldE1vbml0b3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vbml0b3I7XG4gICAgfVxuICAgIGdldEJhY2tlbmQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJhY2tlbmQ7XG4gICAgfVxuICAgIGdldFJlZ2lzdHJ5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tb25pdG9yLnJlZ2lzdHJ5O1xuICAgIH1cbiAgICBnZXRBY3Rpb25zKCkge1xuICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXMgKi8gY29uc3QgbWFuYWdlciA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHsgZGlzcGF0Y2ggIH0gPSB0aGlzLnN0b3JlO1xuICAgICAgICBmdW5jdGlvbiBiaW5kQWN0aW9uQ3JlYXRvcihhY3Rpb25DcmVhdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gKC4uLmFyZ3MpPT57XG4gICAgICAgICAgICAgICAgY29uc3QgYWN0aW9uID0gYWN0aW9uQ3JlYXRvci5hcHBseShtYW5hZ2VyLCBhcmdzKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGFjdGlvbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2goYWN0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFjdGlvbnMgPSBjcmVhdGVEcmFnRHJvcEFjdGlvbnModGhpcyk7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhhY3Rpb25zKS5yZWR1Y2UoKGJvdW5kQWN0aW9ucywga2V5KT0+e1xuICAgICAgICAgICAgY29uc3QgYWN0aW9uID0gYWN0aW9uc1trZXldO1xuICAgICAgICAgICAgYm91bmRBY3Rpb25zW2tleV0gPSBiaW5kQWN0aW9uQ3JlYXRvcihhY3Rpb24pO1xuICAgICAgICAgICAgcmV0dXJuIGJvdW5kQWN0aW9ucztcbiAgICAgICAgfSwge30pO1xuICAgIH1cbiAgICBkaXNwYXRjaChhY3Rpb24pIHtcbiAgICAgICAgdGhpcy5zdG9yZS5kaXNwYXRjaChhY3Rpb24pO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcihzdG9yZSwgbW9uaXRvcil7XG4gICAgICAgIHRoaXMuaXNTZXRVcCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmhhbmRsZVJlZkNvdW50Q2hhbmdlID0gKCk9PntcbiAgICAgICAgICAgIGNvbnN0IHNob3VsZFNldFVwID0gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLnJlZkNvdW50ID4gMDtcbiAgICAgICAgICAgIGlmICh0aGlzLmJhY2tlbmQpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkU2V0VXAgJiYgIXRoaXMuaXNTZXRVcCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJhY2tlbmQuc2V0dXAoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NldFVwID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFzaG91bGRTZXRVcCAmJiB0aGlzLmlzU2V0VXApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWNrZW5kLnRlYXJkb3duKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTZXRVcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zdG9yZSA9IHN0b3JlO1xuICAgICAgICB0aGlzLm1vbml0b3IgPSBtb25pdG9yO1xuICAgICAgICBzdG9yZS5zdWJzY3JpYmUodGhpcy5oYW5kbGVSZWZDb3VudENoYW5nZSk7XG4gICAgfVxufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1EcmFnRHJvcE1hbmFnZXJJbXBsLmpzLm1hcCIsIi8qKlxuICogQ29vcmRpbmF0ZSBhZGRpdGlvblxuICogQHBhcmFtIGEgVGhlIGZpcnN0IGNvb3JkaW5hdGVcbiAqIEBwYXJhbSBiIFRoZSBzZWNvbmQgY29vcmRpbmF0ZVxuICovIGV4cG9ydCBmdW5jdGlvbiBhZGQoYSwgYikge1xuICAgIHJldHVybiB7XG4gICAgICAgIHg6IGEueCArIGIueCxcbiAgICAgICAgeTogYS55ICsgYi55XG4gICAgfTtcbn1cbi8qKlxuICogQ29vcmRpbmF0ZSBzdWJ0cmFjdGlvblxuICogQHBhcmFtIGEgVGhlIGZpcnN0IGNvb3JkaW5hdGVcbiAqIEBwYXJhbSBiIFRoZSBzZWNvbmQgY29vcmRpbmF0ZVxuICovIGV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChhLCBiKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogYS54IC0gYi54LFxuICAgICAgICB5OiBhLnkgLSBiLnlcbiAgICB9O1xufVxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjYXJ0ZXNpYW4gZGlzdGFuY2Ugb2YgdGhlIGRyYWcgc291cmNlIGNvbXBvbmVudCdzIHBvc2l0aW9uLCBiYXNlZCBvbiBpdHMgcG9zaXRpb25cbiAqIGF0IHRoZSB0aW1lIHdoZW4gdGhlIGN1cnJlbnQgZHJhZyBvcGVyYXRpb24gaGFzIHN0YXJ0ZWQsIGFuZCB0aGUgbW92ZW1lbnQgZGlmZmVyZW5jZS5cbiAqXG4gKiBSZXR1cm5zIG51bGwgaWYgbm8gaXRlbSBpcyBiZWluZyBkcmFnZ2VkLlxuICpcbiAqIEBwYXJhbSBzdGF0ZSBUaGUgb2Zmc2V0IHN0YXRlIHRvIGNvbXB1dGUgZnJvbVxuICovIGV4cG9ydCBmdW5jdGlvbiBnZXRTb3VyY2VDbGllbnRPZmZzZXQoc3RhdGUpIHtcbiAgICBjb25zdCB7IGNsaWVudE9mZnNldCAsIGluaXRpYWxDbGllbnRPZmZzZXQgLCBpbml0aWFsU291cmNlQ2xpZW50T2Zmc2V0ICB9ID0gc3RhdGU7XG4gICAgaWYgKCFjbGllbnRPZmZzZXQgfHwgIWluaXRpYWxDbGllbnRPZmZzZXQgfHwgIWluaXRpYWxTb3VyY2VDbGllbnRPZmZzZXQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBzdWJ0cmFjdChhZGQoY2xpZW50T2Zmc2V0LCBpbml0aWFsU291cmNlQ2xpZW50T2Zmc2V0KSwgaW5pdGlhbENsaWVudE9mZnNldCk7XG59XG4vKipcbiAqIERldGVybWluZXMgdGhlIHgseSBvZmZzZXQgYmV0d2VlbiB0aGUgY2xpZW50IG9mZnNldCBhbmQgdGhlIGluaXRpYWwgY2xpZW50IG9mZnNldFxuICpcbiAqIEBwYXJhbSBzdGF0ZSBUaGUgb2Zmc2V0IHN0YXRlIHRvIGNvbXB1dGUgZnJvbVxuICovIGV4cG9ydCBmdW5jdGlvbiBnZXREaWZmZXJlbmNlRnJvbUluaXRpYWxPZmZzZXQoc3RhdGUpIHtcbiAgICBjb25zdCB7IGNsaWVudE9mZnNldCAsIGluaXRpYWxDbGllbnRPZmZzZXQgIH0gPSBzdGF0ZTtcbiAgICBpZiAoIWNsaWVudE9mZnNldCB8fCAhaW5pdGlhbENsaWVudE9mZnNldCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHN1YnRyYWN0KGNsaWVudE9mZnNldCwgaW5pdGlhbENsaWVudE9mZnNldCk7XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvb3Jkcy5qcy5tYXAiLCJpbXBvcnQgeyBpbnRlcnNlY3Rpb24gfSBmcm9tICcuL2pzX3V0aWxzLmpzJztcbmV4cG9ydCBjb25zdCBOT05FID0gW107XG5leHBvcnQgY29uc3QgQUxMID0gW107XG5OT05FLl9fSVNfTk9ORV9fID0gdHJ1ZTtcbkFMTC5fX0lTX0FMTF9fID0gdHJ1ZTtcbi8qKlxuICogRGV0ZXJtaW5lcyBpZiB0aGUgZ2l2ZW4gaGFuZGxlciBJRHMgYXJlIGRpcnR5IG9yIG5vdC5cbiAqXG4gKiBAcGFyYW0gZGlydHlJZHMgVGhlIHNldCBvZiBkaXJ0eSBoYW5kbGVyIGlkc1xuICogQHBhcmFtIGhhbmRsZXJJZHMgVGhlIHNldCBvZiBoYW5kbGVyIGlkcyB0byBjaGVja1xuICovIGV4cG9ydCBmdW5jdGlvbiBhcmVEaXJ0eShkaXJ0eUlkcywgaGFuZGxlcklkcykge1xuICAgIGlmIChkaXJ0eUlkcyA9PT0gTk9ORSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChkaXJ0eUlkcyA9PT0gQUxMIHx8IHR5cGVvZiBoYW5kbGVySWRzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgY29uc3QgY29tbW9uSWRzID0gaW50ZXJzZWN0aW9uKGhhbmRsZXJJZHMsIGRpcnR5SWRzKTtcbiAgICByZXR1cm4gY29tbW9uSWRzLmxlbmd0aCA+IDA7XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRpcnRpbmVzcy5qcy5tYXAiLCJpbXBvcnQgeyBpbnZhcmlhbnQgfSBmcm9tICdAcmVhY3QtZG5kL2ludmFyaWFudCc7XG5pbXBvcnQgeyBnZXREaWZmZXJlbmNlRnJvbUluaXRpYWxPZmZzZXQsIGdldFNvdXJjZUNsaWVudE9mZnNldCB9IGZyb20gJy4uL3V0aWxzL2Nvb3Jkcy5qcyc7XG5pbXBvcnQgeyBhcmVEaXJ0eSB9IGZyb20gJy4uL3V0aWxzL2RpcnRpbmVzcy5qcyc7XG5pbXBvcnQgeyBtYXRjaGVzVHlwZSB9IGZyb20gJy4uL3V0aWxzL21hdGNoZXNUeXBlLmpzJztcbmV4cG9ydCBjbGFzcyBEcmFnRHJvcE1vbml0b3JJbXBsIHtcbiAgICBzdWJzY3JpYmVUb1N0YXRlQ2hhbmdlKGxpc3RlbmVyLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgY29uc3QgeyBoYW5kbGVySWRzICB9ID0gb3B0aW9ucztcbiAgICAgICAgaW52YXJpYW50KHR5cGVvZiBsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJywgJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgICAgICAgaW52YXJpYW50KHR5cGVvZiBoYW5kbGVySWRzID09PSAndW5kZWZpbmVkJyB8fCBBcnJheS5pc0FycmF5KGhhbmRsZXJJZHMpLCAnaGFuZGxlcklkcywgd2hlbiBzcGVjaWZpZWQsIG11c3QgYmUgYW4gYXJyYXkgb2Ygc3RyaW5ncy4nKTtcbiAgICAgICAgbGV0IHByZXZTdGF0ZUlkID0gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLnN0YXRlSWQ7XG4gICAgICAgIGNvbnN0IGhhbmRsZUNoYW5nZSA9ICgpPT57XG4gICAgICAgICAgICBjb25zdCBzdGF0ZSA9IHRoaXMuc3RvcmUuZ2V0U3RhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRTdGF0ZUlkID0gc3RhdGUuc3RhdGVJZDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2FuU2tpcExpc3RlbmVyID0gY3VycmVudFN0YXRlSWQgPT09IHByZXZTdGF0ZUlkIHx8IGN1cnJlbnRTdGF0ZUlkID09PSBwcmV2U3RhdGVJZCArIDEgJiYgIWFyZURpcnR5KHN0YXRlLmRpcnR5SGFuZGxlcklkcywgaGFuZGxlcklkcyk7XG4gICAgICAgICAgICAgICAgaWYgKCFjYW5Ta2lwTGlzdGVuZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGZpbmFsbHl7XG4gICAgICAgICAgICAgICAgcHJldlN0YXRlSWQgPSBjdXJyZW50U3RhdGVJZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmUuc3Vic2NyaWJlKGhhbmRsZUNoYW5nZSk7XG4gICAgfVxuICAgIHN1YnNjcmliZVRvT2Zmc2V0Q2hhbmdlKGxpc3RlbmVyKSB7XG4gICAgICAgIGludmFyaWFudCh0eXBlb2YgbGlzdGVuZXIgPT09ICdmdW5jdGlvbicsICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24uJyk7XG4gICAgICAgIGxldCBwcmV2aW91c1N0YXRlID0gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLmRyYWdPZmZzZXQ7XG4gICAgICAgIGNvbnN0IGhhbmRsZUNoYW5nZSA9ICgpPT57XG4gICAgICAgICAgICBjb25zdCBuZXh0U3RhdGUgPSB0aGlzLnN0b3JlLmdldFN0YXRlKCkuZHJhZ09mZnNldDtcbiAgICAgICAgICAgIGlmIChuZXh0U3RhdGUgPT09IHByZXZpb3VzU3RhdGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmV2aW91c1N0YXRlID0gbmV4dFN0YXRlO1xuICAgICAgICAgICAgbGlzdGVuZXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmUuc3Vic2NyaWJlKGhhbmRsZUNoYW5nZSk7XG4gICAgfVxuICAgIGNhbkRyYWdTb3VyY2Uoc291cmNlSWQpIHtcbiAgICAgICAgaWYgKCFzb3VyY2VJZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IHRoaXMucmVnaXN0cnkuZ2V0U291cmNlKHNvdXJjZUlkKTtcbiAgICAgICAgaW52YXJpYW50KHNvdXJjZSwgYEV4cGVjdGVkIHRvIGZpbmQgYSB2YWxpZCBzb3VyY2UuIHNvdXJjZUlkPSR7c291cmNlSWR9YCk7XG4gICAgICAgIGlmICh0aGlzLmlzRHJhZ2dpbmcoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzb3VyY2UuY2FuRHJhZyh0aGlzLCBzb3VyY2VJZCk7XG4gICAgfVxuICAgIGNhbkRyb3BPblRhcmdldCh0YXJnZXRJZCkge1xuICAgICAgICAvLyB1bmRlZmluZWQgb24gaW5pdGlhbCByZW5kZXJcbiAgICAgICAgaWYgKCF0YXJnZXRJZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMucmVnaXN0cnkuZ2V0VGFyZ2V0KHRhcmdldElkKTtcbiAgICAgICAgaW52YXJpYW50KHRhcmdldCwgYEV4cGVjdGVkIHRvIGZpbmQgYSB2YWxpZCB0YXJnZXQuIHRhcmdldElkPSR7dGFyZ2V0SWR9YCk7XG4gICAgICAgIGlmICghdGhpcy5pc0RyYWdnaW5nKCkgfHwgdGhpcy5kaWREcm9wKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0YXJnZXRUeXBlID0gdGhpcy5yZWdpc3RyeS5nZXRUYXJnZXRUeXBlKHRhcmdldElkKTtcbiAgICAgICAgY29uc3QgZHJhZ2dlZEl0ZW1UeXBlID0gdGhpcy5nZXRJdGVtVHlwZSgpO1xuICAgICAgICByZXR1cm4gbWF0Y2hlc1R5cGUodGFyZ2V0VHlwZSwgZHJhZ2dlZEl0ZW1UeXBlKSAmJiB0YXJnZXQuY2FuRHJvcCh0aGlzLCB0YXJnZXRJZCk7XG4gICAgfVxuICAgIGlzRHJhZ2dpbmcoKSB7XG4gICAgICAgIHJldHVybiBCb29sZWFuKHRoaXMuZ2V0SXRlbVR5cGUoKSk7XG4gICAgfVxuICAgIGlzRHJhZ2dpbmdTb3VyY2Uoc291cmNlSWQpIHtcbiAgICAgICAgLy8gdW5kZWZpbmVkIG9uIGluaXRpYWwgcmVuZGVyXG4gICAgICAgIGlmICghc291cmNlSWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzb3VyY2UgPSB0aGlzLnJlZ2lzdHJ5LmdldFNvdXJjZShzb3VyY2VJZCwgdHJ1ZSk7XG4gICAgICAgIGludmFyaWFudChzb3VyY2UsIGBFeHBlY3RlZCB0byBmaW5kIGEgdmFsaWQgc291cmNlLiBzb3VyY2VJZD0ke3NvdXJjZUlkfWApO1xuICAgICAgICBpZiAoIXRoaXMuaXNEcmFnZ2luZygpIHx8ICF0aGlzLmlzU291cmNlUHVibGljKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzb3VyY2VUeXBlID0gdGhpcy5yZWdpc3RyeS5nZXRTb3VyY2VUeXBlKHNvdXJjZUlkKTtcbiAgICAgICAgY29uc3QgZHJhZ2dlZEl0ZW1UeXBlID0gdGhpcy5nZXRJdGVtVHlwZSgpO1xuICAgICAgICBpZiAoc291cmNlVHlwZSAhPT0gZHJhZ2dlZEl0ZW1UeXBlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNvdXJjZS5pc0RyYWdnaW5nKHRoaXMsIHNvdXJjZUlkKTtcbiAgICB9XG4gICAgaXNPdmVyVGFyZ2V0KHRhcmdldElkLCBvcHRpb25zID0ge1xuICAgICAgICBzaGFsbG93OiBmYWxzZVxuICAgIH0pIHtcbiAgICAgICAgLy8gdW5kZWZpbmVkIG9uIGluaXRpYWwgcmVuZGVyXG4gICAgICAgIGlmICghdGFyZ2V0SWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IHNoYWxsb3cgIH0gPSBvcHRpb25zO1xuICAgICAgICBpZiAoIXRoaXMuaXNEcmFnZ2luZygpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGFyZ2V0VHlwZSA9IHRoaXMucmVnaXN0cnkuZ2V0VGFyZ2V0VHlwZSh0YXJnZXRJZCk7XG4gICAgICAgIGNvbnN0IGRyYWdnZWRJdGVtVHlwZSA9IHRoaXMuZ2V0SXRlbVR5cGUoKTtcbiAgICAgICAgaWYgKGRyYWdnZWRJdGVtVHlwZSAmJiAhbWF0Y2hlc1R5cGUodGFyZ2V0VHlwZSwgZHJhZ2dlZEl0ZW1UeXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRhcmdldElkcyA9IHRoaXMuZ2V0VGFyZ2V0SWRzKCk7XG4gICAgICAgIGlmICghdGFyZ2V0SWRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGFyZ2V0SWRzLmluZGV4T2YodGFyZ2V0SWQpO1xuICAgICAgICBpZiAoc2hhbGxvdykge1xuICAgICAgICAgICAgcmV0dXJuIGluZGV4ID09PSB0YXJnZXRJZHMubGVuZ3RoIC0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpbmRleCA+IC0xO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldEl0ZW1UeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLmRyYWdPcGVyYXRpb24uaXRlbVR5cGU7XG4gICAgfVxuICAgIGdldEl0ZW0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JlLmdldFN0YXRlKCkuZHJhZ09wZXJhdGlvbi5pdGVtO1xuICAgIH1cbiAgICBnZXRTb3VyY2VJZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmUuZ2V0U3RhdGUoKS5kcmFnT3BlcmF0aW9uLnNvdXJjZUlkO1xuICAgIH1cbiAgICBnZXRUYXJnZXRJZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JlLmdldFN0YXRlKCkuZHJhZ09wZXJhdGlvbi50YXJnZXRJZHM7XG4gICAgfVxuICAgIGdldERyb3BSZXN1bHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JlLmdldFN0YXRlKCkuZHJhZ09wZXJhdGlvbi5kcm9wUmVzdWx0O1xuICAgIH1cbiAgICBkaWREcm9wKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLmRyYWdPcGVyYXRpb24uZGlkRHJvcDtcbiAgICB9XG4gICAgaXNTb3VyY2VQdWJsaWMoKSB7XG4gICAgICAgIHJldHVybiBCb29sZWFuKHRoaXMuc3RvcmUuZ2V0U3RhdGUoKS5kcmFnT3BlcmF0aW9uLmlzU291cmNlUHVibGljKTtcbiAgICB9XG4gICAgZ2V0SW5pdGlhbENsaWVudE9mZnNldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmUuZ2V0U3RhdGUoKS5kcmFnT2Zmc2V0LmluaXRpYWxDbGllbnRPZmZzZXQ7XG4gICAgfVxuICAgIGdldEluaXRpYWxTb3VyY2VDbGllbnRPZmZzZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JlLmdldFN0YXRlKCkuZHJhZ09mZnNldC5pbml0aWFsU291cmNlQ2xpZW50T2Zmc2V0O1xuICAgIH1cbiAgICBnZXRDbGllbnRPZmZzZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JlLmdldFN0YXRlKCkuZHJhZ09mZnNldC5jbGllbnRPZmZzZXQ7XG4gICAgfVxuICAgIGdldFNvdXJjZUNsaWVudE9mZnNldCgpIHtcbiAgICAgICAgcmV0dXJuIGdldFNvdXJjZUNsaWVudE9mZnNldCh0aGlzLnN0b3JlLmdldFN0YXRlKCkuZHJhZ09mZnNldCk7XG4gICAgfVxuICAgIGdldERpZmZlcmVuY2VGcm9tSW5pdGlhbE9mZnNldCgpIHtcbiAgICAgICAgcmV0dXJuIGdldERpZmZlcmVuY2VGcm9tSW5pdGlhbE9mZnNldCh0aGlzLnN0b3JlLmdldFN0YXRlKCkuZHJhZ09mZnNldCk7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKHN0b3JlLCByZWdpc3RyeSl7XG4gICAgICAgIHRoaXMuc3RvcmUgPSBzdG9yZTtcbiAgICAgICAgdGhpcy5yZWdpc3RyeSA9IHJlZ2lzdHJ5O1xuICAgIH1cbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9RHJhZ0Ryb3BNb25pdG9ySW1wbC5qcy5tYXAiLCJleHBvcnQgY29uc3QgQUREX1NPVVJDRSA9ICdkbmQtY29yZS9BRERfU09VUkNFJztcbmV4cG9ydCBjb25zdCBBRERfVEFSR0VUID0gJ2RuZC1jb3JlL0FERF9UQVJHRVQnO1xuZXhwb3J0IGNvbnN0IFJFTU9WRV9TT1VSQ0UgPSAnZG5kLWNvcmUvUkVNT1ZFX1NPVVJDRSc7XG5leHBvcnQgY29uc3QgUkVNT1ZFX1RBUkdFVCA9ICdkbmQtY29yZS9SRU1PVkVfVEFSR0VUJztcbmV4cG9ydCBmdW5jdGlvbiBhZGRTb3VyY2Uoc291cmNlSWQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBBRERfU09VUkNFLFxuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICBzb3VyY2VJZFxuICAgICAgICB9XG4gICAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBhZGRUYXJnZXQodGFyZ2V0SWQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBBRERfVEFSR0VULFxuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICB0YXJnZXRJZFxuICAgICAgICB9XG4gICAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVTb3VyY2Uoc291cmNlSWQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBSRU1PVkVfU09VUkNFLFxuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICBzb3VyY2VJZFxuICAgICAgICB9XG4gICAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVUYXJnZXQodGFyZ2V0SWQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBSRU1PVkVfVEFSR0VULFxuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICB0YXJnZXRJZFxuICAgICAgICB9XG4gICAgfTtcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVnaXN0cnkuanMubWFwIiwiaW1wb3J0IHsgaW52YXJpYW50IH0gZnJvbSAnQHJlYWN0LWRuZC9pbnZhcmlhbnQnO1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU291cmNlQ29udHJhY3Qoc291cmNlKSB7XG4gICAgaW52YXJpYW50KHR5cGVvZiBzb3VyY2UuY2FuRHJhZyA9PT0gJ2Z1bmN0aW9uJywgJ0V4cGVjdGVkIGNhbkRyYWcgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgICBpbnZhcmlhbnQodHlwZW9mIHNvdXJjZS5iZWdpbkRyYWcgPT09ICdmdW5jdGlvbicsICdFeHBlY3RlZCBiZWdpbkRyYWcgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgICBpbnZhcmlhbnQodHlwZW9mIHNvdXJjZS5lbmREcmFnID09PSAnZnVuY3Rpb24nLCAnRXhwZWN0ZWQgZW5kRHJhZyB0byBiZSBhIGZ1bmN0aW9uLicpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlVGFyZ2V0Q29udHJhY3QodGFyZ2V0KSB7XG4gICAgaW52YXJpYW50KHR5cGVvZiB0YXJnZXQuY2FuRHJvcCA9PT0gJ2Z1bmN0aW9uJywgJ0V4cGVjdGVkIGNhbkRyb3AgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgICBpbnZhcmlhbnQodHlwZW9mIHRhcmdldC5ob3ZlciA9PT0gJ2Z1bmN0aW9uJywgJ0V4cGVjdGVkIGhvdmVyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gICAgaW52YXJpYW50KHR5cGVvZiB0YXJnZXQuZHJvcCA9PT0gJ2Z1bmN0aW9uJywgJ0V4cGVjdGVkIGJlZ2luRHJhZyB0byBiZSBhIGZ1bmN0aW9uLicpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlVHlwZSh0eXBlLCBhbGxvd0FycmF5KSB7XG4gICAgaWYgKGFsbG93QXJyYXkgJiYgQXJyYXkuaXNBcnJheSh0eXBlKSkge1xuICAgICAgICB0eXBlLmZvckVhY2goKHQpPT52YWxpZGF0ZVR5cGUodCwgZmFsc2UpXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaW52YXJpYW50KHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdHlwZSA9PT0gJ3N5bWJvbCcsIGFsbG93QXJyYXkgPyAnVHlwZSBjYW4gb25seSBiZSBhIHN0cmluZywgYSBzeW1ib2wsIG9yIGFuIGFycmF5IG9mIGVpdGhlci4nIDogJ1R5cGUgY2FuIG9ubHkgYmUgYSBzdHJpbmcgb3IgYSBzeW1ib2wuJyk7XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbnRyYWN0cy5qcy5tYXAiLCJleHBvcnQgdmFyIEhhbmRsZXJSb2xlO1xuKGZ1bmN0aW9uKEhhbmRsZXJSb2xlKSB7XG4gICAgSGFuZGxlclJvbGVbXCJTT1VSQ0VcIl0gPSBcIlNPVVJDRVwiO1xuICAgIEhhbmRsZXJSb2xlW1wiVEFSR0VUXCJdID0gXCJUQVJHRVRcIjtcbn0pKEhhbmRsZXJSb2xlIHx8IChIYW5kbGVyUm9sZSA9IHt9KSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWludGVyZmFjZXMuanMubWFwIiwibGV0IG5leHRVbmlxdWVJZCA9IDA7XG5leHBvcnQgZnVuY3Rpb24gZ2V0TmV4dFVuaXF1ZUlkKCkge1xuICAgIHJldHVybiBuZXh0VW5pcXVlSWQrKztcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2V0TmV4dFVuaXF1ZUlkLmpzLm1hcCIsImltcG9ydCB7IGFzYXAgfSBmcm9tICdAcmVhY3QtZG5kL2FzYXAnO1xuaW1wb3J0IHsgaW52YXJpYW50IH0gZnJvbSAnQHJlYWN0LWRuZC9pbnZhcmlhbnQnO1xuaW1wb3J0IHsgYWRkU291cmNlLCBhZGRUYXJnZXQsIHJlbW92ZVNvdXJjZSwgcmVtb3ZlVGFyZ2V0IH0gZnJvbSAnLi4vYWN0aW9ucy9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgeyB2YWxpZGF0ZVNvdXJjZUNvbnRyYWN0LCB2YWxpZGF0ZVRhcmdldENvbnRyYWN0LCB2YWxpZGF0ZVR5cGUgfSBmcm9tICcuLi9jb250cmFjdHMuanMnO1xuaW1wb3J0IHsgSGFuZGxlclJvbGUgfSBmcm9tICcuLi9pbnRlcmZhY2VzLmpzJztcbmltcG9ydCB7IGdldE5leHRVbmlxdWVJZCB9IGZyb20gJy4uL3V0aWxzL2dldE5leHRVbmlxdWVJZC5qcyc7XG5mdW5jdGlvbiBnZXROZXh0SGFuZGxlcklkKHJvbGUpIHtcbiAgICBjb25zdCBpZCA9IGdldE5leHRVbmlxdWVJZCgpLnRvU3RyaW5nKCk7XG4gICAgc3dpdGNoKHJvbGUpe1xuICAgICAgICBjYXNlIEhhbmRsZXJSb2xlLlNPVVJDRTpcbiAgICAgICAgICAgIHJldHVybiBgUyR7aWR9YDtcbiAgICAgICAgY2FzZSBIYW5kbGVyUm9sZS5UQVJHRVQ6XG4gICAgICAgICAgICByZXR1cm4gYFQke2lkfWA7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gSGFuZGxlciBSb2xlOiAke3JvbGV9YCk7XG4gICAgfVxufVxuZnVuY3Rpb24gcGFyc2VSb2xlRnJvbUhhbmRsZXJJZChoYW5kbGVySWQpIHtcbiAgICBzd2l0Y2goaGFuZGxlcklkWzBdKXtcbiAgICAgICAgY2FzZSAnUyc6XG4gICAgICAgICAgICByZXR1cm4gSGFuZGxlclJvbGUuU09VUkNFO1xuICAgICAgICBjYXNlICdUJzpcbiAgICAgICAgICAgIHJldHVybiBIYW5kbGVyUm9sZS5UQVJHRVQ7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBwYXJzZSBoYW5kbGVyIElEOiAke2hhbmRsZXJJZH1gKTtcbiAgICB9XG59XG5mdW5jdGlvbiBtYXBDb250YWluc1ZhbHVlKG1hcCwgc2VhcmNoVmFsdWUpIHtcbiAgICBjb25zdCBlbnRyaWVzID0gbWFwLmVudHJpZXMoKTtcbiAgICBsZXQgaXNEb25lID0gZmFsc2U7XG4gICAgZG8ge1xuICAgICAgICBjb25zdCB7IGRvbmUgLCB2YWx1ZTogWywgdmFsdWVdICwgIH0gPSBlbnRyaWVzLm5leHQoKTtcbiAgICAgICAgaWYgKHZhbHVlID09PSBzZWFyY2hWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaXNEb25lID0gISFkb25lO1xuICAgIH13aGlsZSAoIWlzRG9uZSlcbiAgICByZXR1cm4gZmFsc2U7XG59XG5leHBvcnQgY2xhc3MgSGFuZGxlclJlZ2lzdHJ5SW1wbCB7XG4gICAgYWRkU291cmNlKHR5cGUsIHNvdXJjZSkge1xuICAgICAgICB2YWxpZGF0ZVR5cGUodHlwZSk7XG4gICAgICAgIHZhbGlkYXRlU291cmNlQ29udHJhY3Qoc291cmNlKTtcbiAgICAgICAgY29uc3Qgc291cmNlSWQgPSB0aGlzLmFkZEhhbmRsZXIoSGFuZGxlclJvbGUuU09VUkNFLCB0eXBlLCBzb3VyY2UpO1xuICAgICAgICB0aGlzLnN0b3JlLmRpc3BhdGNoKGFkZFNvdXJjZShzb3VyY2VJZCkpO1xuICAgICAgICByZXR1cm4gc291cmNlSWQ7XG4gICAgfVxuICAgIGFkZFRhcmdldCh0eXBlLCB0YXJnZXQpIHtcbiAgICAgICAgdmFsaWRhdGVUeXBlKHR5cGUsIHRydWUpO1xuICAgICAgICB2YWxpZGF0ZVRhcmdldENvbnRyYWN0KHRhcmdldCk7XG4gICAgICAgIGNvbnN0IHRhcmdldElkID0gdGhpcy5hZGRIYW5kbGVyKEhhbmRsZXJSb2xlLlRBUkdFVCwgdHlwZSwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5zdG9yZS5kaXNwYXRjaChhZGRUYXJnZXQodGFyZ2V0SWQpKTtcbiAgICAgICAgcmV0dXJuIHRhcmdldElkO1xuICAgIH1cbiAgICBjb250YWluc0hhbmRsZXIoaGFuZGxlcikge1xuICAgICAgICByZXR1cm4gbWFwQ29udGFpbnNWYWx1ZSh0aGlzLmRyYWdTb3VyY2VzLCBoYW5kbGVyKSB8fCBtYXBDb250YWluc1ZhbHVlKHRoaXMuZHJvcFRhcmdldHMsIGhhbmRsZXIpO1xuICAgIH1cbiAgICBnZXRTb3VyY2Uoc291cmNlSWQsIGluY2x1ZGVQaW5uZWQgPSBmYWxzZSkge1xuICAgICAgICBpbnZhcmlhbnQodGhpcy5pc1NvdXJjZUlkKHNvdXJjZUlkKSwgJ0V4cGVjdGVkIGEgdmFsaWQgc291cmNlIElELicpO1xuICAgICAgICBjb25zdCBpc1Bpbm5lZCA9IGluY2x1ZGVQaW5uZWQgJiYgc291cmNlSWQgPT09IHRoaXMucGlubmVkU291cmNlSWQ7XG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IGlzUGlubmVkID8gdGhpcy5waW5uZWRTb3VyY2UgOiB0aGlzLmRyYWdTb3VyY2VzLmdldChzb3VyY2VJZCk7XG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgfVxuICAgIGdldFRhcmdldCh0YXJnZXRJZCkge1xuICAgICAgICBpbnZhcmlhbnQodGhpcy5pc1RhcmdldElkKHRhcmdldElkKSwgJ0V4cGVjdGVkIGEgdmFsaWQgdGFyZ2V0IElELicpO1xuICAgICAgICByZXR1cm4gdGhpcy5kcm9wVGFyZ2V0cy5nZXQodGFyZ2V0SWQpO1xuICAgIH1cbiAgICBnZXRTb3VyY2VUeXBlKHNvdXJjZUlkKSB7XG4gICAgICAgIGludmFyaWFudCh0aGlzLmlzU291cmNlSWQoc291cmNlSWQpLCAnRXhwZWN0ZWQgYSB2YWxpZCBzb3VyY2UgSUQuJyk7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGVzLmdldChzb3VyY2VJZCk7XG4gICAgfVxuICAgIGdldFRhcmdldFR5cGUodGFyZ2V0SWQpIHtcbiAgICAgICAgaW52YXJpYW50KHRoaXMuaXNUYXJnZXRJZCh0YXJnZXRJZCksICdFeHBlY3RlZCBhIHZhbGlkIHRhcmdldCBJRC4nKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZXMuZ2V0KHRhcmdldElkKTtcbiAgICB9XG4gICAgaXNTb3VyY2VJZChoYW5kbGVySWQpIHtcbiAgICAgICAgY29uc3Qgcm9sZSA9IHBhcnNlUm9sZUZyb21IYW5kbGVySWQoaGFuZGxlcklkKTtcbiAgICAgICAgcmV0dXJuIHJvbGUgPT09IEhhbmRsZXJSb2xlLlNPVVJDRTtcbiAgICB9XG4gICAgaXNUYXJnZXRJZChoYW5kbGVySWQpIHtcbiAgICAgICAgY29uc3Qgcm9sZSA9IHBhcnNlUm9sZUZyb21IYW5kbGVySWQoaGFuZGxlcklkKTtcbiAgICAgICAgcmV0dXJuIHJvbGUgPT09IEhhbmRsZXJSb2xlLlRBUkdFVDtcbiAgICB9XG4gICAgcmVtb3ZlU291cmNlKHNvdXJjZUlkKSB7XG4gICAgICAgIGludmFyaWFudCh0aGlzLmdldFNvdXJjZShzb3VyY2VJZCksICdFeHBlY3RlZCBhbiBleGlzdGluZyBzb3VyY2UuJyk7XG4gICAgICAgIHRoaXMuc3RvcmUuZGlzcGF0Y2gocmVtb3ZlU291cmNlKHNvdXJjZUlkKSk7XG4gICAgICAgIGFzYXAoKCk9PntcbiAgICAgICAgICAgIHRoaXMuZHJhZ1NvdXJjZXMuZGVsZXRlKHNvdXJjZUlkKTtcbiAgICAgICAgICAgIHRoaXMudHlwZXMuZGVsZXRlKHNvdXJjZUlkKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlbW92ZVRhcmdldCh0YXJnZXRJZCkge1xuICAgICAgICBpbnZhcmlhbnQodGhpcy5nZXRUYXJnZXQodGFyZ2V0SWQpLCAnRXhwZWN0ZWQgYW4gZXhpc3RpbmcgdGFyZ2V0LicpO1xuICAgICAgICB0aGlzLnN0b3JlLmRpc3BhdGNoKHJlbW92ZVRhcmdldCh0YXJnZXRJZCkpO1xuICAgICAgICB0aGlzLmRyb3BUYXJnZXRzLmRlbGV0ZSh0YXJnZXRJZCk7XG4gICAgICAgIHRoaXMudHlwZXMuZGVsZXRlKHRhcmdldElkKTtcbiAgICB9XG4gICAgcGluU291cmNlKHNvdXJjZUlkKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IHRoaXMuZ2V0U291cmNlKHNvdXJjZUlkKTtcbiAgICAgICAgaW52YXJpYW50KHNvdXJjZSwgJ0V4cGVjdGVkIGFuIGV4aXN0aW5nIHNvdXJjZS4nKTtcbiAgICAgICAgdGhpcy5waW5uZWRTb3VyY2VJZCA9IHNvdXJjZUlkO1xuICAgICAgICB0aGlzLnBpbm5lZFNvdXJjZSA9IHNvdXJjZTtcbiAgICB9XG4gICAgdW5waW5Tb3VyY2UoKSB7XG4gICAgICAgIGludmFyaWFudCh0aGlzLnBpbm5lZFNvdXJjZSwgJ05vIHNvdXJjZSBpcyBwaW5uZWQgYXQgdGhlIHRpbWUuJyk7XG4gICAgICAgIHRoaXMucGlubmVkU291cmNlSWQgPSBudWxsO1xuICAgICAgICB0aGlzLnBpbm5lZFNvdXJjZSA9IG51bGw7XG4gICAgfVxuICAgIGFkZEhhbmRsZXIocm9sZSwgdHlwZSwgaGFuZGxlcikge1xuICAgICAgICBjb25zdCBpZCA9IGdldE5leHRIYW5kbGVySWQocm9sZSk7XG4gICAgICAgIHRoaXMudHlwZXMuc2V0KGlkLCB0eXBlKTtcbiAgICAgICAgaWYgKHJvbGUgPT09IEhhbmRsZXJSb2xlLlNPVVJDRSkge1xuICAgICAgICAgICAgdGhpcy5kcmFnU291cmNlcy5zZXQoaWQsIGhhbmRsZXIpO1xuICAgICAgICB9IGVsc2UgaWYgKHJvbGUgPT09IEhhbmRsZXJSb2xlLlRBUkdFVCkge1xuICAgICAgICAgICAgdGhpcy5kcm9wVGFyZ2V0cy5zZXQoaWQsIGhhbmRsZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpZDtcbiAgICB9XG4gICAgY29uc3RydWN0b3Ioc3RvcmUpe1xuICAgICAgICB0aGlzLnR5cGVzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLmRyYWdTb3VyY2VzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLmRyb3BUYXJnZXRzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLnBpbm5lZFNvdXJjZUlkID0gbnVsbDtcbiAgICAgICAgdGhpcy5waW5uZWRTb3VyY2UgPSBudWxsO1xuICAgICAgICB0aGlzLnN0b3JlID0gc3RvcmU7XG4gICAgfVxufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1IYW5kbGVyUmVnaXN0cnlJbXBsLmpzLm1hcCIsImV4cG9ydCBjb25zdCBzdHJpY3RFcXVhbGl0eSA9IChhLCBiKT0+YSA9PT0gYlxuO1xuLyoqXG4gKiBEZXRlcm1pbmUgaWYgdHdvIGNhcnRlc2lhbiBjb29yZGluYXRlIG9mZnNldHMgYXJlIGVxdWFsXG4gKiBAcGFyYW0gb2Zmc2V0QVxuICogQHBhcmFtIG9mZnNldEJcbiAqLyBleHBvcnQgZnVuY3Rpb24gYXJlQ29vcmRzRXF1YWwob2Zmc2V0QSwgb2Zmc2V0Qikge1xuICAgIGlmICghb2Zmc2V0QSAmJiAhb2Zmc2V0Qikge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKCFvZmZzZXRBIHx8ICFvZmZzZXRCKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb2Zmc2V0QS54ID09PSBvZmZzZXRCLnggJiYgb2Zmc2V0QS55ID09PSBvZmZzZXRCLnk7XG4gICAgfVxufVxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHR3byBhcnJheXMgb2YgaXRlbXMgYXJlIGVxdWFsXG4gKiBAcGFyYW0gYSBUaGUgZmlyc3QgYXJyYXkgb2YgaXRlbXNcbiAqIEBwYXJhbSBiIFRoZSBzZWNvbmQgYXJyYXkgb2YgaXRlbXNcbiAqLyBleHBvcnQgZnVuY3Rpb24gYXJlQXJyYXlzRXF1YWwoYSwgYiwgaXNFcXVhbCA9IHN0cmljdEVxdWFsaXR5KSB7XG4gICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgKytpKXtcbiAgICAgICAgaWYgKCFpc0VxdWFsKGFbaV0sIGJbaV0pKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVxdWFsaXR5LmpzLm1hcCIsImltcG9ydCB7IEJFR0lOX0RSQUcsIERST1AsIEVORF9EUkFHLCBIT1ZFUiwgUFVCTElTSF9EUkFHX1NPVVJDRSB9IGZyb20gJy4uL2FjdGlvbnMvZHJhZ0Ryb3AvaW5kZXguanMnO1xuaW1wb3J0IHsgQUREX1NPVVJDRSwgQUREX1RBUkdFVCwgUkVNT1ZFX1NPVVJDRSwgUkVNT1ZFX1RBUkdFVCB9IGZyb20gJy4uL2FjdGlvbnMvcmVnaXN0cnkuanMnO1xuaW1wb3J0IHsgQUxMLCBOT05FIH0gZnJvbSAnLi4vdXRpbHMvZGlydGluZXNzLmpzJztcbmltcG9ydCB7IGFyZUFycmF5c0VxdWFsIH0gZnJvbSAnLi4vdXRpbHMvZXF1YWxpdHkuanMnO1xuaW1wb3J0IHsgeG9yIH0gZnJvbSAnLi4vdXRpbHMvanNfdXRpbHMuanMnO1xuZXhwb3J0IGZ1bmN0aW9uIHJlZHVjZSgvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5fc3RhdGUgPSBOT05FLCBhY3Rpb24pIHtcbiAgICBzd2l0Y2goYWN0aW9uLnR5cGUpe1xuICAgICAgICBjYXNlIEhPVkVSOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQUREX1NPVVJDRTpcbiAgICAgICAgY2FzZSBBRERfVEFSR0VUOlxuICAgICAgICBjYXNlIFJFTU9WRV9UQVJHRVQ6XG4gICAgICAgIGNhc2UgUkVNT1ZFX1NPVVJDRTpcbiAgICAgICAgICAgIHJldHVybiBOT05FO1xuICAgICAgICBjYXNlIEJFR0lOX0RSQUc6XG4gICAgICAgIGNhc2UgUFVCTElTSF9EUkFHX1NPVVJDRTpcbiAgICAgICAgY2FzZSBFTkRfRFJBRzpcbiAgICAgICAgY2FzZSBEUk9QOlxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIEFMTDtcbiAgICB9XG4gICAgY29uc3QgeyB0YXJnZXRJZHMgPVtdICwgcHJldlRhcmdldElkcyA9W10gIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICBjb25zdCByZXN1bHQgPSB4b3IodGFyZ2V0SWRzLCBwcmV2VGFyZ2V0SWRzKTtcbiAgICBjb25zdCBkaWRDaGFuZ2UgPSByZXN1bHQubGVuZ3RoID4gMCB8fCAhYXJlQXJyYXlzRXF1YWwodGFyZ2V0SWRzLCBwcmV2VGFyZ2V0SWRzKTtcbiAgICBpZiAoIWRpZENoYW5nZSkge1xuICAgICAgICByZXR1cm4gTk9ORTtcbiAgICB9XG4gICAgLy8gQ2hlY2sgdGhlIHRhcmdldCBpZHMgYXQgdGhlIGlubmVybW9zdCBwb3NpdGlvbi4gSWYgdGhleSBhcmUgdmFsaWQsIGFkZCB0aGVtXG4gICAgLy8gdG8gdGhlIHJlc3VsdFxuICAgIGNvbnN0IHByZXZJbm5lcm1vc3RUYXJnZXRJZCA9IHByZXZUYXJnZXRJZHNbcHJldlRhcmdldElkcy5sZW5ndGggLSAxXTtcbiAgICBjb25zdCBpbm5lcm1vc3RUYXJnZXRJZCA9IHRhcmdldElkc1t0YXJnZXRJZHMubGVuZ3RoIC0gMV07XG4gICAgaWYgKHByZXZJbm5lcm1vc3RUYXJnZXRJZCAhPT0gaW5uZXJtb3N0VGFyZ2V0SWQpIHtcbiAgICAgICAgaWYgKHByZXZJbm5lcm1vc3RUYXJnZXRJZCkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2gocHJldklubmVybW9zdFRhcmdldElkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5uZXJtb3N0VGFyZ2V0SWQpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGlubmVybW9zdFRhcmdldElkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kaXJ0eUhhbmRsZXJJZHMuanMubWFwIiwiZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkge1xuICAgIGlmIChrZXkgaW4gb2JqKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG9ialtrZXldID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG59XG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKHRhcmdldCkge1xuICAgIGZvcih2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspe1xuICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldICE9IG51bGwgPyBhcmd1bWVudHNbaV0gOiB7fTtcbiAgICAgICAgdmFyIG93bktleXMgPSBPYmplY3Qua2V5cyhzb3VyY2UpO1xuICAgICAgICBpZiAodHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIG93bktleXMgPSBvd25LZXlzLmNvbmNhdChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHNvdXJjZSkuZmlsdGVyKGZ1bmN0aW9uKHN5bSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwgc3ltKS5lbnVtZXJhYmxlO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIG93bktleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIF9kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbn1cbmltcG9ydCB7IEJFR0lOX0RSQUcsIERST1AsIEVORF9EUkFHLCBIT1ZFUiwgSU5JVF9DT09SRFMgfSBmcm9tICcuLi9hY3Rpb25zL2RyYWdEcm9wL2luZGV4LmpzJztcbmltcG9ydCB7IGFyZUNvb3Jkc0VxdWFsIH0gZnJvbSAnLi4vdXRpbHMvZXF1YWxpdHkuanMnO1xuY29uc3QgaW5pdGlhbFN0YXRlID0ge1xuICAgIGluaXRpYWxTb3VyY2VDbGllbnRPZmZzZXQ6IG51bGwsXG4gICAgaW5pdGlhbENsaWVudE9mZnNldDogbnVsbCxcbiAgICBjbGllbnRPZmZzZXQ6IG51bGxcbn07XG5leHBvcnQgZnVuY3Rpb24gcmVkdWNlKHN0YXRlID0gaW5pdGlhbFN0YXRlLCBhY3Rpb24pIHtcbiAgICBjb25zdCB7IHBheWxvYWQgIH0gPSBhY3Rpb247XG4gICAgc3dpdGNoKGFjdGlvbi50eXBlKXtcbiAgICAgICAgY2FzZSBJTklUX0NPT1JEUzpcbiAgICAgICAgY2FzZSBCRUdJTl9EUkFHOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpbml0aWFsU291cmNlQ2xpZW50T2Zmc2V0OiBwYXlsb2FkLnNvdXJjZUNsaWVudE9mZnNldCxcbiAgICAgICAgICAgICAgICBpbml0aWFsQ2xpZW50T2Zmc2V0OiBwYXlsb2FkLmNsaWVudE9mZnNldCxcbiAgICAgICAgICAgICAgICBjbGllbnRPZmZzZXQ6IHBheWxvYWQuY2xpZW50T2Zmc2V0XG4gICAgICAgICAgICB9O1xuICAgICAgICBjYXNlIEhPVkVSOlxuICAgICAgICAgICAgaWYgKGFyZUNvb3Jkc0VxdWFsKHN0YXRlLmNsaWVudE9mZnNldCwgcGF5bG9hZC5jbGllbnRPZmZzZXQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIHN0YXRlLCB7XG4gICAgICAgICAgICAgICAgY2xpZW50T2Zmc2V0OiBwYXlsb2FkLmNsaWVudE9mZnNldFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIGNhc2UgRU5EX0RSQUc6XG4gICAgICAgIGNhc2UgRFJPUDpcbiAgICAgICAgICAgIHJldHVybiBpbml0aWFsU3RhdGU7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kcmFnT2Zmc2V0LmpzLm1hcCIsImZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHtcbiAgICBpZiAoa2V5IGluIG9iaikge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBvYmpba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xufVxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHtcbiAgICBmb3IodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307XG4gICAgICAgIHZhciBvd25LZXlzID0gT2JqZWN0LmtleXMoc291cmNlKTtcbiAgICAgICAgaWYgKHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBvd25LZXlzID0gb3duS2V5cy5jb25jYXQoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzb3VyY2UpLmZpbHRlcihmdW5jdGlvbihzeW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIHN5bSkuZW51bWVyYWJsZTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICBvd25LZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICBfZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG59XG5pbXBvcnQgeyBCRUdJTl9EUkFHLCBEUk9QLCBFTkRfRFJBRywgSE9WRVIsIFBVQkxJU0hfRFJBR19TT1VSQ0UgfSBmcm9tICcuLi9hY3Rpb25zL2RyYWdEcm9wL2luZGV4LmpzJztcbmltcG9ydCB7IFJFTU9WRV9UQVJHRVQgfSBmcm9tICcuLi9hY3Rpb25zL3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB7IHdpdGhvdXQgfSBmcm9tICcuLi91dGlscy9qc191dGlscy5qcyc7XG5jb25zdCBpbml0aWFsU3RhdGUgPSB7XG4gICAgaXRlbVR5cGU6IG51bGwsXG4gICAgaXRlbTogbnVsbCxcbiAgICBzb3VyY2VJZDogbnVsbCxcbiAgICB0YXJnZXRJZHM6IFtdLFxuICAgIGRyb3BSZXN1bHQ6IG51bGwsXG4gICAgZGlkRHJvcDogZmFsc2UsXG4gICAgaXNTb3VyY2VQdWJsaWM6IG51bGxcbn07XG5leHBvcnQgZnVuY3Rpb24gcmVkdWNlKHN0YXRlID0gaW5pdGlhbFN0YXRlLCBhY3Rpb24pIHtcbiAgICBjb25zdCB7IHBheWxvYWQgIH0gPSBhY3Rpb247XG4gICAgc3dpdGNoKGFjdGlvbi50eXBlKXtcbiAgICAgICAgY2FzZSBCRUdJTl9EUkFHOlxuICAgICAgICAgICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIHN0YXRlLCB7XG4gICAgICAgICAgICAgICAgaXRlbVR5cGU6IHBheWxvYWQuaXRlbVR5cGUsXG4gICAgICAgICAgICAgICAgaXRlbTogcGF5bG9hZC5pdGVtLFxuICAgICAgICAgICAgICAgIHNvdXJjZUlkOiBwYXlsb2FkLnNvdXJjZUlkLFxuICAgICAgICAgICAgICAgIGlzU291cmNlUHVibGljOiBwYXlsb2FkLmlzU291cmNlUHVibGljLFxuICAgICAgICAgICAgICAgIGRyb3BSZXN1bHQ6IG51bGwsXG4gICAgICAgICAgICAgICAgZGlkRHJvcDogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBjYXNlIFBVQkxJU0hfRFJBR19TT1VSQ0U6XG4gICAgICAgICAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgc3RhdGUsIHtcbiAgICAgICAgICAgICAgICBpc1NvdXJjZVB1YmxpYzogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIGNhc2UgSE9WRVI6XG4gICAgICAgICAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgc3RhdGUsIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRJZHM6IHBheWxvYWQudGFyZ2V0SWRzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgY2FzZSBSRU1PVkVfVEFSR0VUOlxuICAgICAgICAgICAgaWYgKHN0YXRlLnRhcmdldElkcy5pbmRleE9mKHBheWxvYWQudGFyZ2V0SWQpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKHt9LCBzdGF0ZSwge1xuICAgICAgICAgICAgICAgIHRhcmdldElkczogd2l0aG91dChzdGF0ZS50YXJnZXRJZHMsIHBheWxvYWQudGFyZ2V0SWQpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgY2FzZSBEUk9QOlxuICAgICAgICAgICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIHN0YXRlLCB7XG4gICAgICAgICAgICAgICAgZHJvcFJlc3VsdDogcGF5bG9hZC5kcm9wUmVzdWx0LFxuICAgICAgICAgICAgICAgIGRpZERyb3A6IHRydWUsXG4gICAgICAgICAgICAgICAgdGFyZ2V0SWRzOiBbXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIGNhc2UgRU5EX0RSQUc6XG4gICAgICAgICAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgc3RhdGUsIHtcbiAgICAgICAgICAgICAgICBpdGVtVHlwZTogbnVsbCxcbiAgICAgICAgICAgICAgICBpdGVtOiBudWxsLFxuICAgICAgICAgICAgICAgIHNvdXJjZUlkOiBudWxsLFxuICAgICAgICAgICAgICAgIGRyb3BSZXN1bHQ6IG51bGwsXG4gICAgICAgICAgICAgICAgZGlkRHJvcDogZmFsc2UsXG4gICAgICAgICAgICAgICAgaXNTb3VyY2VQdWJsaWM6IG51bGwsXG4gICAgICAgICAgICAgICAgdGFyZ2V0SWRzOiBbXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kcmFnT3BlcmF0aW9uLmpzLm1hcCIsImltcG9ydCB7IEFERF9TT1VSQ0UsIEFERF9UQVJHRVQsIFJFTU9WRV9TT1VSQ0UsIFJFTU9WRV9UQVJHRVQgfSBmcm9tICcuLi9hY3Rpb25zL3JlZ2lzdHJ5LmpzJztcbmV4cG9ydCBmdW5jdGlvbiByZWR1Y2Uoc3RhdGUgPSAwLCBhY3Rpb24pIHtcbiAgICBzd2l0Y2goYWN0aW9uLnR5cGUpe1xuICAgICAgICBjYXNlIEFERF9TT1VSQ0U6XG4gICAgICAgIGNhc2UgQUREX1RBUkdFVDpcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZSArIDE7XG4gICAgICAgIGNhc2UgUkVNT1ZFX1NPVVJDRTpcbiAgICAgICAgY2FzZSBSRU1PVkVfVEFSR0VUOlxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlIC0gMTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlZkNvdW50LmpzLm1hcCIsImV4cG9ydCBmdW5jdGlvbiByZWR1Y2Uoc3RhdGUgPSAwKSB7XG4gICAgcmV0dXJuIHN0YXRlICsgMTtcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3RhdGVJZC5qcy5tYXAiLCJmdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7XG4gICAgaWYgKGtleSBpbiBvYmopIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7XG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb2JqW2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbn1cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQodGFyZ2V0KSB7XG4gICAgZm9yKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKyl7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV0gIT0gbnVsbCA/IGFyZ3VtZW50c1tpXSA6IHt9O1xuICAgICAgICB2YXIgb3duS2V5cyA9IE9iamVjdC5rZXlzKHNvdXJjZSk7XG4gICAgICAgIGlmICh0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgb3duS2V5cyA9IG93bktleXMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoc291cmNlKS5maWx0ZXIoZnVuY3Rpb24oc3ltKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBzeW0pLmVudW1lcmFibGU7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgb3duS2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgX2RlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBzb3VyY2Vba2V5XSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xufVxuaW1wb3J0IHsgZ2V0IH0gZnJvbSAnLi4vdXRpbHMvanNfdXRpbHMuanMnO1xuaW1wb3J0IHsgcmVkdWNlIGFzIGRpcnR5SGFuZGxlcklkcyB9IGZyb20gJy4vZGlydHlIYW5kbGVySWRzLmpzJztcbmltcG9ydCB7IHJlZHVjZSBhcyBkcmFnT2Zmc2V0IH0gZnJvbSAnLi9kcmFnT2Zmc2V0LmpzJztcbmltcG9ydCB7IHJlZHVjZSBhcyBkcmFnT3BlcmF0aW9uIH0gZnJvbSAnLi9kcmFnT3BlcmF0aW9uLmpzJztcbmltcG9ydCB7IHJlZHVjZSBhcyByZWZDb3VudCB9IGZyb20gJy4vcmVmQ291bnQuanMnO1xuaW1wb3J0IHsgcmVkdWNlIGFzIHN0YXRlSWQgfSBmcm9tICcuL3N0YXRlSWQuanMnO1xuZXhwb3J0IGZ1bmN0aW9uIHJlZHVjZShzdGF0ZSA9IHt9LCBhY3Rpb24pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBkaXJ0eUhhbmRsZXJJZHM6IGRpcnR5SGFuZGxlcklkcyhzdGF0ZS5kaXJ0eUhhbmRsZXJJZHMsIHtcbiAgICAgICAgICAgIHR5cGU6IGFjdGlvbi50eXBlLFxuICAgICAgICAgICAgcGF5bG9hZDogX29iamVjdFNwcmVhZCh7fSwgYWN0aW9uLnBheWxvYWQsIHtcbiAgICAgICAgICAgICAgICBwcmV2VGFyZ2V0SWRzOiBnZXQoc3RhdGUsICdkcmFnT3BlcmF0aW9uLnRhcmdldElkcycsIFtdKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSksXG4gICAgICAgIGRyYWdPZmZzZXQ6IGRyYWdPZmZzZXQoc3RhdGUuZHJhZ09mZnNldCwgYWN0aW9uKSxcbiAgICAgICAgcmVmQ291bnQ6IHJlZkNvdW50KHN0YXRlLnJlZkNvdW50LCBhY3Rpb24pLFxuICAgICAgICBkcmFnT3BlcmF0aW9uOiBkcmFnT3BlcmF0aW9uKHN0YXRlLmRyYWdPcGVyYXRpb24sIGFjdGlvbiksXG4gICAgICAgIHN0YXRlSWQ6IHN0YXRlSWQoc3RhdGUuc3RhdGVJZClcbiAgICB9O1xufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCJpbXBvcnQgeyBjcmVhdGVTdG9yZSB9IGZyb20gJ3JlZHV4JztcbmltcG9ydCB7IERyYWdEcm9wTWFuYWdlckltcGwgfSBmcm9tICcuL2NsYXNzZXMvRHJhZ0Ryb3BNYW5hZ2VySW1wbC5qcyc7XG5pbXBvcnQgeyBEcmFnRHJvcE1vbml0b3JJbXBsIH0gZnJvbSAnLi9jbGFzc2VzL0RyYWdEcm9wTW9uaXRvckltcGwuanMnO1xuaW1wb3J0IHsgSGFuZGxlclJlZ2lzdHJ5SW1wbCB9IGZyb20gJy4vY2xhc3Nlcy9IYW5kbGVyUmVnaXN0cnlJbXBsLmpzJztcbmltcG9ydCB7IHJlZHVjZSB9IGZyb20gJy4vcmVkdWNlcnMvaW5kZXguanMnO1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURyYWdEcm9wTWFuYWdlcihiYWNrZW5kRmFjdG9yeSwgZ2xvYmFsQ29udGV4dCA9IHVuZGVmaW5lZCwgYmFja2VuZE9wdGlvbnMgPSB7fSwgZGVidWdNb2RlID0gZmFsc2UpIHtcbiAgICBjb25zdCBzdG9yZSA9IG1ha2VTdG9yZUluc3RhbmNlKGRlYnVnTW9kZSk7XG4gICAgY29uc3QgbW9uaXRvciA9IG5ldyBEcmFnRHJvcE1vbml0b3JJbXBsKHN0b3JlLCBuZXcgSGFuZGxlclJlZ2lzdHJ5SW1wbChzdG9yZSkpO1xuICAgIGNvbnN0IG1hbmFnZXIgPSBuZXcgRHJhZ0Ryb3BNYW5hZ2VySW1wbChzdG9yZSwgbW9uaXRvcik7XG4gICAgY29uc3QgYmFja2VuZCA9IGJhY2tlbmRGYWN0b3J5KG1hbmFnZXIsIGdsb2JhbENvbnRleHQsIGJhY2tlbmRPcHRpb25zKTtcbiAgICBtYW5hZ2VyLnJlY2VpdmVCYWNrZW5kKGJhY2tlbmQpO1xuICAgIHJldHVybiBtYW5hZ2VyO1xufVxuZnVuY3Rpb24gbWFrZVN0b3JlSW5zdGFuY2UoZGVidWdNb2RlKSB7XG4gICAgLy8gVE9ETzogaWYgd2UgZXZlciBtYWtlIGEgcmVhY3QtbmF0aXZlIHZlcnNpb24gb2YgdGhpcyxcbiAgICAvLyB3ZSdsbCBuZWVkIHRvIGNvbnNpZGVyIGhvdyB0byBwdWxsIG9mZiBkZXYtdG9vbGluZ1xuICAgIGNvbnN0IHJlZHV4RGV2VG9vbHMgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuX19SRURVWF9ERVZUT09MU19FWFRFTlNJT05fXztcbiAgICByZXR1cm4gY3JlYXRlU3RvcmUocmVkdWNlLCBkZWJ1Z01vZGUgJiYgcmVkdXhEZXZUb29scyAmJiByZWR1eERldlRvb2xzKHtcbiAgICAgICAgbmFtZTogJ2RuZC1jb3JlJyxcbiAgICAgICAgaW5zdGFuY2VJZDogJ2RuZC1jb3JlJ1xuICAgIH0pKTtcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y3JlYXRlRHJhZ0Ryb3BNYW5hZ2VyLmpzLm1hcCIsImV4cG9ydCAqIGZyb20gJy4vY3JlYXRlRHJhZ0Ryb3BNYW5hZ2VyLmpzJztcbmV4cG9ydCAqIGZyb20gJy4vaW50ZXJmYWNlcy5qcyc7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmNvbnN0IHRvRmluaXRlID0gcmVxdWlyZSgnLi90b0Zpbml0ZS5qcycpO1xuXG5mdW5jdGlvbiB0b0ludGVnZXIodmFsdWUpIHtcbiAgICBjb25zdCBmaW5pdGUgPSB0b0Zpbml0ZS50b0Zpbml0ZSh2YWx1ZSk7XG4gICAgY29uc3QgcmVtYWluZGVyID0gZmluaXRlICUgMTtcbiAgICByZXR1cm4gcmVtYWluZGVyID8gZmluaXRlIC0gcmVtYWluZGVyIDogZmluaXRlO1xufVxuXG5leHBvcnRzLnRvSW50ZWdlciA9IHRvSW50ZWdlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qob2JqZWN0KSB7XG4gICAgaWYgKHR5cGVvZiBvYmplY3QgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICAgIGNvbnN0IHRhZyA9IG9iamVjdFtTeW1ib2wudG9TdHJpbmdUYWddO1xuICAgICAgICBpZiAodGFnID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpc1RhZ1JlYWRvbmx5ID0gIU9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBTeW1ib2wudG9TdHJpbmdUYWcpPy53cml0YWJsZTtcbiAgICAgICAgaWYgKGlzVGFnUmVhZG9ubHkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqZWN0LnRvU3RyaW5nKCkgPT09IGBbb2JqZWN0ICR7dGFnfV1gO1xuICAgIH1cbiAgICBsZXQgcHJvdG8gPSBvYmplY3Q7XG4gICAgd2hpbGUgKE9iamVjdC5nZXRQcm90b3R5cGVPZihwcm90bykgIT09IG51bGwpIHtcbiAgICAgICAgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YocHJvdG8pO1xuICAgIH1cbiAgICByZXR1cm4gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCkgPT09IHByb3RvO1xufVxuXG5leHBvcnRzLmlzUGxhaW5PYmplY3QgPSBpc1BsYWluT2JqZWN0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuY29uc3QgaXNCdWZmZXIgPSByZXF1aXJlKCcuLi8uLi9wcmVkaWNhdGUvaXNCdWZmZXIuanMnKTtcbmNvbnN0IGlzUHJvdG90eXBlID0gcmVxdWlyZSgnLi4vX2ludGVybmFsL2lzUHJvdG90eXBlLmpzJyk7XG5jb25zdCBpc0FycmF5TGlrZSA9IHJlcXVpcmUoJy4uL3ByZWRpY2F0ZS9pc0FycmF5TGlrZS5qcycpO1xuY29uc3QgaXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi4vcHJlZGljYXRlL2lzVHlwZWRBcnJheS5qcycpO1xuY29uc3QgdGltZXMgPSByZXF1aXJlKCcuLi91dGlsL3RpbWVzLmpzJyk7XG5cbmZ1bmN0aW9uIGtleXNJbihvYmplY3QpIHtcbiAgICBpZiAob2JqZWN0ID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBzd2l0Y2ggKHR5cGVvZiBvYmplY3QpIHtcbiAgICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgY2FzZSAnZnVuY3Rpb24nOiB7XG4gICAgICAgICAgICBpZiAoaXNBcnJheUxpa2UuaXNBcnJheUxpa2Uob2JqZWN0KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhcnJheUxpa2VLZXlzSW4ob2JqZWN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc1Byb3RvdHlwZS5pc1Byb3RvdHlwZShvYmplY3QpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb3RvdHlwZUtleXNJbihvYmplY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGtleXNJbkltcGwob2JqZWN0KTtcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICByZXR1cm4ga2V5c0luSW1wbChPYmplY3Qob2JqZWN0KSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBrZXlzSW5JbXBsKG9iamVjdCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGZvciAoY29uc3Qga2V5IGluIG9iamVjdCkge1xuICAgICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gcHJvdG90eXBlS2V5c0luKG9iamVjdCkge1xuICAgIGNvbnN0IGtleXMgPSBrZXlzSW5JbXBsKG9iamVjdCk7XG4gICAgcmV0dXJuIGtleXMuZmlsdGVyKGtleSA9PiBrZXkgIT09ICdjb25zdHJ1Y3RvcicpO1xufVxuZnVuY3Rpb24gYXJyYXlMaWtlS2V5c0luKG9iamVjdCkge1xuICAgIGNvbnN0IGluZGljZXMgPSB0aW1lcy50aW1lcyhvYmplY3QubGVuZ3RoLCBpbmRleCA9PiBgJHtpbmRleH1gKTtcbiAgICBjb25zdCBmaWx0ZXJlZEtleXMgPSBuZXcgU2V0KGluZGljZXMpO1xuICAgIGlmIChpc0J1ZmZlci5pc0J1ZmZlcihvYmplY3QpKSB7XG4gICAgICAgIGZpbHRlcmVkS2V5cy5hZGQoJ29mZnNldCcpO1xuICAgICAgICBmaWx0ZXJlZEtleXMuYWRkKCdwYXJlbnQnKTtcbiAgICB9XG4gICAgaWYgKGlzVHlwZWRBcnJheS5pc1R5cGVkQXJyYXkob2JqZWN0KSkge1xuICAgICAgICBmaWx0ZXJlZEtleXMuYWRkKCdidWZmZXInKTtcbiAgICAgICAgZmlsdGVyZWRLZXlzLmFkZCgnYnl0ZUxlbmd0aCcpO1xuICAgICAgICBmaWx0ZXJlZEtleXMuYWRkKCdieXRlT2Zmc2V0Jyk7XG4gICAgfVxuICAgIHJldHVybiBbLi4uaW5kaWNlcywgLi4ua2V5c0luSW1wbChvYmplY3QpLmZpbHRlcihrZXkgPT4gIWZpbHRlcmVkS2V5cy5oYXMoa2V5KSldO1xufVxuXG5leHBvcnRzLmtleXNJbiA9IGtleXNJbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmNvbnN0IGdldFN5bWJvbHMgPSByZXF1aXJlKCcuL2dldFN5bWJvbHMuanMnKTtcblxuZnVuY3Rpb24gZ2V0U3ltYm9sc0luKG9iamVjdCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIHdoaWxlIChvYmplY3QpIHtcbiAgICAgICAgcmVzdWx0LnB1c2goLi4uZ2V0U3ltYm9scy5nZXRTeW1ib2xzKG9iamVjdCkpO1xuICAgICAgICBvYmplY3QgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0cy5nZXRTeW1ib2xzSW4gPSBnZXRTeW1ib2xzSW47XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL2Rpc3QvY29tcGF0L21hdGgvc3VtQnkuanMnKS5zdW1CeTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09IG51bGwgfHwgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIHZhbHVlICE9PSAnZnVuY3Rpb24nKTtcbn1cblxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuY29uc3QgdW5pcUJ5JDEgPSByZXF1aXJlKCcuLi8uLi9hcnJheS91bmlxQnkuanMnKTtcbmNvbnN0IGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vLi4vZnVuY3Rpb24vaWRlbnRpdHkuanMnKTtcbmNvbnN0IGlzQXJyYXlMaWtlT2JqZWN0ID0gcmVxdWlyZSgnLi4vcHJlZGljYXRlL2lzQXJyYXlMaWtlT2JqZWN0LmpzJyk7XG5jb25zdCBpdGVyYXRlZSA9IHJlcXVpcmUoJy4uL3V0aWwvaXRlcmF0ZWUuanMnKTtcblxuZnVuY3Rpb24gdW5pcUJ5KGFycmF5LCBpdGVyYXRlZSQxID0gaWRlbnRpdHkuaWRlbnRpdHkpIHtcbiAgICBpZiAoIWlzQXJyYXlMaWtlT2JqZWN0LmlzQXJyYXlMaWtlT2JqZWN0KGFycmF5KSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiB1bmlxQnkkMS51bmlxQnkoQXJyYXkuZnJvbShhcnJheSksIGl0ZXJhdGVlLml0ZXJhdGVlKGl0ZXJhdGVlJDEpKTtcbn1cblxuZXhwb3J0cy51bmlxQnkgPSB1bmlxQnk7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXG5jb25zdCBpc01hdGNoID0gcmVxdWlyZSgnLi9pc01hdGNoLmpzJyk7XG5jb25zdCB0b0tleSA9IHJlcXVpcmUoJy4uL19pbnRlcm5hbC90b0tleS5qcycpO1xuY29uc3QgY2xvbmVEZWVwID0gcmVxdWlyZSgnLi4vb2JqZWN0L2Nsb25lRGVlcC5qcycpO1xuY29uc3QgZ2V0ID0gcmVxdWlyZSgnLi4vb2JqZWN0L2dldC5qcycpO1xuY29uc3QgaGFzID0gcmVxdWlyZSgnLi4vb2JqZWN0L2hhcy5qcycpO1xuXG5mdW5jdGlvbiBtYXRjaGVzUHJvcGVydHkocHJvcGVydHksIHNvdXJjZSkge1xuICAgIHN3aXRjaCAodHlwZW9mIHByb3BlcnR5KSB7XG4gICAgICAgIGNhc2UgJ29iamVjdCc6IHtcbiAgICAgICAgICAgIGlmIChPYmplY3QuaXMocHJvcGVydHk/LnZhbHVlT2YoKSwgLTApKSB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHkgPSAnLTAnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnbnVtYmVyJzoge1xuICAgICAgICAgICAgcHJvcGVydHkgPSB0b0tleS50b0tleShwcm9wZXJ0eSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBzb3VyY2UgPSBjbG9uZURlZXAuY2xvbmVEZWVwKHNvdXJjZSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZ2V0LmdldCh0YXJnZXQsIHByb3BlcnR5KTtcbiAgICAgICAgaWYgKHJlc3VsdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gaGFzLmhhcyh0YXJnZXQsIHByb3BlcnR5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQgPT09IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNNYXRjaC5pc01hdGNoKHJlc3VsdCwgc291cmNlKTtcbiAgICB9O1xufVxuXG5leHBvcnRzLm1hdGNoZXNQcm9wZXJ0eSA9IG1hdGNoZXNQcm9wZXJ0eTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmNvbnN0IGdldFN5bWJvbHMgPSByZXF1aXJlKCcuLi9jb21wYXQvX2ludGVybmFsL2dldFN5bWJvbHMuanMnKTtcbmNvbnN0IGdldFRhZyA9IHJlcXVpcmUoJy4uL2NvbXBhdC9faW50ZXJuYWwvZ2V0VGFnLmpzJyk7XG5jb25zdCB0YWdzID0gcmVxdWlyZSgnLi4vY29tcGF0L19pbnRlcm5hbC90YWdzLmpzJyk7XG5jb25zdCBpc1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4uL3ByZWRpY2F0ZS9pc1ByaW1pdGl2ZS5qcycpO1xuY29uc3QgaXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi4vcHJlZGljYXRlL2lzVHlwZWRBcnJheS5qcycpO1xuXG5mdW5jdGlvbiBjbG9uZURlZXBXaXRoKG9iaiwgY2xvbmVWYWx1ZSkge1xuICAgIHJldHVybiBjbG9uZURlZXBXaXRoSW1wbChvYmosIHVuZGVmaW5lZCwgb2JqLCBuZXcgTWFwKCksIGNsb25lVmFsdWUpO1xufVxuZnVuY3Rpb24gY2xvbmVEZWVwV2l0aEltcGwodmFsdWVUb0Nsb25lLCBrZXlUb0Nsb25lLCBvYmplY3RUb0Nsb25lLCBzdGFjayA9IG5ldyBNYXAoKSwgY2xvbmVWYWx1ZSA9IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IGNsb25lZCA9IGNsb25lVmFsdWU/Lih2YWx1ZVRvQ2xvbmUsIGtleVRvQ2xvbmUsIG9iamVjdFRvQ2xvbmUsIHN0YWNrKTtcbiAgICBpZiAoY2xvbmVkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGNsb25lZDtcbiAgICB9XG4gICAgaWYgKGlzUHJpbWl0aXZlLmlzUHJpbWl0aXZlKHZhbHVlVG9DbG9uZSkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlVG9DbG9uZTtcbiAgICB9XG4gICAgaWYgKHN0YWNrLmhhcyh2YWx1ZVRvQ2xvbmUpKSB7XG4gICAgICAgIHJldHVybiBzdGFjay5nZXQodmFsdWVUb0Nsb25lKTtcbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWVUb0Nsb25lKSkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBuZXcgQXJyYXkodmFsdWVUb0Nsb25lLmxlbmd0aCk7XG4gICAgICAgIHN0YWNrLnNldCh2YWx1ZVRvQ2xvbmUsIHJlc3VsdCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWVUb0Nsb25lLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICByZXN1bHRbaV0gPSBjbG9uZURlZXBXaXRoSW1wbCh2YWx1ZVRvQ2xvbmVbaV0sIGksIG9iamVjdFRvQ2xvbmUsIHN0YWNrLCBjbG9uZVZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoT2JqZWN0Lmhhc093bih2YWx1ZVRvQ2xvbmUsICdpbmRleCcpKSB7XG4gICAgICAgICAgICByZXN1bHQuaW5kZXggPSB2YWx1ZVRvQ2xvbmUuaW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKE9iamVjdC5oYXNPd24odmFsdWVUb0Nsb25lLCAnaW5wdXQnKSkge1xuICAgICAgICAgICAgcmVzdWx0LmlucHV0ID0gdmFsdWVUb0Nsb25lLmlucHV0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGlmICh2YWx1ZVRvQ2xvbmUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSh2YWx1ZVRvQ2xvbmUuZ2V0VGltZSgpKTtcbiAgICB9XG4gICAgaWYgKHZhbHVlVG9DbG9uZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBuZXcgUmVnRXhwKHZhbHVlVG9DbG9uZS5zb3VyY2UsIHZhbHVlVG9DbG9uZS5mbGFncyk7XG4gICAgICAgIHJlc3VsdC5sYXN0SW5kZXggPSB2YWx1ZVRvQ2xvbmUubGFzdEluZGV4O1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBpZiAodmFsdWVUb0Nsb25lIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBNYXAoKTtcbiAgICAgICAgc3RhY2suc2V0KHZhbHVlVG9DbG9uZSwgcmVzdWx0KTtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgdmFsdWVUb0Nsb25lKSB7XG4gICAgICAgICAgICByZXN1bHQuc2V0KGtleSwgY2xvbmVEZWVwV2l0aEltcGwodmFsdWUsIGtleSwgb2JqZWN0VG9DbG9uZSwgc3RhY2ssIGNsb25lVmFsdWUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBpZiAodmFsdWVUb0Nsb25lIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBTZXQoKTtcbiAgICAgICAgc3RhY2suc2V0KHZhbHVlVG9DbG9uZSwgcmVzdWx0KTtcbiAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZVRvQ2xvbmUpIHtcbiAgICAgICAgICAgIHJlc3VsdC5hZGQoY2xvbmVEZWVwV2l0aEltcGwodmFsdWUsIHVuZGVmaW5lZCwgb2JqZWN0VG9DbG9uZSwgc3RhY2ssIGNsb25lVmFsdWUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIEJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgQnVmZmVyLmlzQnVmZmVyKHZhbHVlVG9DbG9uZSkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlVG9DbG9uZS5zdWJhcnJheSgpO1xuICAgIH1cbiAgICBpZiAoaXNUeXBlZEFycmF5LmlzVHlwZWRBcnJheSh2YWx1ZVRvQ2xvbmUpKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyAoT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlVG9DbG9uZSkuY29uc3RydWN0b3IpKHZhbHVlVG9DbG9uZS5sZW5ndGgpO1xuICAgICAgICBzdGFjay5zZXQodmFsdWVUb0Nsb25lLCByZXN1bHQpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlVG9DbG9uZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcmVzdWx0W2ldID0gY2xvbmVEZWVwV2l0aEltcGwodmFsdWVUb0Nsb25lW2ldLCBpLCBvYmplY3RUb0Nsb25lLCBzdGFjaywgY2xvbmVWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgaWYgKHZhbHVlVG9DbG9uZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyIHx8XG4gICAgICAgICh0eXBlb2YgU2hhcmVkQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlVG9DbG9uZSBpbnN0YW5jZW9mIFNoYXJlZEFycmF5QnVmZmVyKSkge1xuICAgICAgICByZXR1cm4gdmFsdWVUb0Nsb25lLnNsaWNlKDApO1xuICAgIH1cbiAgICBpZiAodmFsdWVUb0Nsb25lIGluc3RhbmNlb2YgRGF0YVZpZXcpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IERhdGFWaWV3KHZhbHVlVG9DbG9uZS5idWZmZXIuc2xpY2UoMCksIHZhbHVlVG9DbG9uZS5ieXRlT2Zmc2V0LCB2YWx1ZVRvQ2xvbmUuYnl0ZUxlbmd0aCk7XG4gICAgICAgIHN0YWNrLnNldCh2YWx1ZVRvQ2xvbmUsIHJlc3VsdCk7XG4gICAgICAgIGNvcHlQcm9wZXJ0aWVzKHJlc3VsdCwgdmFsdWVUb0Nsb25lLCBvYmplY3RUb0Nsb25lLCBzdGFjaywgY2xvbmVWYWx1ZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgRmlsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWVUb0Nsb25lIGluc3RhbmNlb2YgRmlsZSkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBuZXcgRmlsZShbdmFsdWVUb0Nsb25lXSwgdmFsdWVUb0Nsb25lLm5hbWUsIHtcbiAgICAgICAgICAgIHR5cGU6IHZhbHVlVG9DbG9uZS50eXBlLFxuICAgICAgICB9KTtcbiAgICAgICAgc3RhY2suc2V0KHZhbHVlVG9DbG9uZSwgcmVzdWx0KTtcbiAgICAgICAgY29weVByb3BlcnRpZXMocmVzdWx0LCB2YWx1ZVRvQ2xvbmUsIG9iamVjdFRvQ2xvbmUsIHN0YWNrLCBjbG9uZVZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBCbG9iICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZVRvQ2xvbmUgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBCbG9iKFt2YWx1ZVRvQ2xvbmVdLCB7IHR5cGU6IHZhbHVlVG9DbG9uZS50eXBlIH0pO1xuICAgICAgICBzdGFjay5zZXQodmFsdWVUb0Nsb25lLCByZXN1bHQpO1xuICAgICAgICBjb3B5UHJvcGVydGllcyhyZXN1bHQsIHZhbHVlVG9DbG9uZSwgb2JqZWN0VG9DbG9uZSwgc3RhY2ssIGNsb25lVmFsdWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBpZiAodmFsdWVUb0Nsb25lIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IHZhbHVlVG9DbG9uZS5jb25zdHJ1Y3RvcigpO1xuICAgICAgICBzdGFjay5zZXQodmFsdWVUb0Nsb25lLCByZXN1bHQpO1xuICAgICAgICByZXN1bHQubWVzc2FnZSA9IHZhbHVlVG9DbG9uZS5tZXNzYWdlO1xuICAgICAgICByZXN1bHQubmFtZSA9IHZhbHVlVG9DbG9uZS5uYW1lO1xuICAgICAgICByZXN1bHQuc3RhY2sgPSB2YWx1ZVRvQ2xvbmUuc3RhY2s7XG4gICAgICAgIHJlc3VsdC5jYXVzZSA9IHZhbHVlVG9DbG9uZS5jYXVzZTtcbiAgICAgICAgY29weVByb3BlcnRpZXMocmVzdWx0LCB2YWx1ZVRvQ2xvbmUsIG9iamVjdFRvQ2xvbmUsIHN0YWNrLCBjbG9uZVZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgaWYgKHZhbHVlVG9DbG9uZSBpbnN0YW5jZW9mIEJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IEJvb2xlYW4odmFsdWVUb0Nsb25lLnZhbHVlT2YoKSk7XG4gICAgICAgIHN0YWNrLnNldCh2YWx1ZVRvQ2xvbmUsIHJlc3VsdCk7XG4gICAgICAgIGNvcHlQcm9wZXJ0aWVzKHJlc3VsdCwgdmFsdWVUb0Nsb25lLCBvYmplY3RUb0Nsb25lLCBzdGFjaywgY2xvbmVWYWx1ZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGlmICh2YWx1ZVRvQ2xvbmUgaW5zdGFuY2VvZiBOdW1iZXIpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IE51bWJlcih2YWx1ZVRvQ2xvbmUudmFsdWVPZigpKTtcbiAgICAgICAgc3RhY2suc2V0KHZhbHVlVG9DbG9uZSwgcmVzdWx0KTtcbiAgICAgICAgY29weVByb3BlcnRpZXMocmVzdWx0LCB2YWx1ZVRvQ2xvbmUsIG9iamVjdFRvQ2xvbmUsIHN0YWNrLCBjbG9uZVZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgaWYgKHZhbHVlVG9DbG9uZSBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBuZXcgU3RyaW5nKHZhbHVlVG9DbG9uZS52YWx1ZU9mKCkpO1xuICAgICAgICBzdGFjay5zZXQodmFsdWVUb0Nsb25lLCByZXN1bHQpO1xuICAgICAgICBjb3B5UHJvcGVydGllcyhyZXN1bHQsIHZhbHVlVG9DbG9uZSwgb2JqZWN0VG9DbG9uZSwgc3RhY2ssIGNsb25lVmFsdWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHZhbHVlVG9DbG9uZSA9PT0gJ29iamVjdCcgJiYgaXNDbG9uZWFibGVPYmplY3QodmFsdWVUb0Nsb25lKSkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBPYmplY3QuY3JlYXRlKE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZVRvQ2xvbmUpKTtcbiAgICAgICAgc3RhY2suc2V0KHZhbHVlVG9DbG9uZSwgcmVzdWx0KTtcbiAgICAgICAgY29weVByb3BlcnRpZXMocmVzdWx0LCB2YWx1ZVRvQ2xvbmUsIG9iamVjdFRvQ2xvbmUsIHN0YWNrLCBjbG9uZVZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlVG9DbG9uZTtcbn1cbmZ1bmN0aW9uIGNvcHlQcm9wZXJ0aWVzKHRhcmdldCwgc291cmNlLCBvYmplY3RUb0Nsb25lID0gdGFyZ2V0LCBzdGFjaywgY2xvbmVWYWx1ZSkge1xuICAgIGNvbnN0IGtleXMgPSBbLi4uT2JqZWN0LmtleXMoc291cmNlKSwgLi4uZ2V0U3ltYm9scy5nZXRTeW1ib2xzKHNvdXJjZSldO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBrZXkgPSBrZXlzW2ldO1xuICAgICAgICBjb25zdCBkZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSk7XG4gICAgICAgIGlmIChkZXNjcmlwdG9yID09IG51bGwgfHwgZGVzY3JpcHRvci53cml0YWJsZSkge1xuICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBjbG9uZURlZXBXaXRoSW1wbChzb3VyY2Vba2V5XSwga2V5LCBvYmplY3RUb0Nsb25lLCBzdGFjaywgY2xvbmVWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBpc0Nsb25lYWJsZU9iamVjdChvYmplY3QpIHtcbiAgICBzd2l0Y2ggKGdldFRhZy5nZXRUYWcob2JqZWN0KSkge1xuICAgICAgICBjYXNlIHRhZ3MuYXJndW1lbnRzVGFnOlxuICAgICAgICBjYXNlIHRhZ3MuYXJyYXlUYWc6XG4gICAgICAgIGNhc2UgdGFncy5hcnJheUJ1ZmZlclRhZzpcbiAgICAgICAgY2FzZSB0YWdzLmRhdGFWaWV3VGFnOlxuICAgICAgICBjYXNlIHRhZ3MuYm9vbGVhblRhZzpcbiAgICAgICAgY2FzZSB0YWdzLmRhdGVUYWc6XG4gICAgICAgIGNhc2UgdGFncy5mbG9hdDMyQXJyYXlUYWc6XG4gICAgICAgIGNhc2UgdGFncy5mbG9hdDY0QXJyYXlUYWc6XG4gICAgICAgIGNhc2UgdGFncy5pbnQ4QXJyYXlUYWc6XG4gICAgICAgIGNhc2UgdGFncy5pbnQxNkFycmF5VGFnOlxuICAgICAgICBjYXNlIHRhZ3MuaW50MzJBcnJheVRhZzpcbiAgICAgICAgY2FzZSB0YWdzLm1hcFRhZzpcbiAgICAgICAgY2FzZSB0YWdzLm51bWJlclRhZzpcbiAgICAgICAgY2FzZSB0YWdzLm9iamVjdFRhZzpcbiAgICAgICAgY2FzZSB0YWdzLnJlZ2V4cFRhZzpcbiAgICAgICAgY2FzZSB0YWdzLnNldFRhZzpcbiAgICAgICAgY2FzZSB0YWdzLnN0cmluZ1RhZzpcbiAgICAgICAgY2FzZSB0YWdzLnN5bWJvbFRhZzpcbiAgICAgICAgY2FzZSB0YWdzLnVpbnQ4QXJyYXlUYWc6XG4gICAgICAgIGNhc2UgdGFncy51aW50OENsYW1wZWRBcnJheVRhZzpcbiAgICAgICAgY2FzZSB0YWdzLnVpbnQxNkFycmF5VGFnOlxuICAgICAgICBjYXNlIHRhZ3MudWludDMyQXJyYXlUYWc6IHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0cy5jbG9uZURlZXBXaXRoID0gY2xvbmVEZWVwV2l0aDtcbmV4cG9ydHMuY2xvbmVEZWVwV2l0aEltcGwgPSBjbG9uZURlZXBXaXRoSW1wbDtcbmV4cG9ydHMuY29weVByb3BlcnRpZXMgPSBjb3B5UHJvcGVydGllcztcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmNvbnN0IGlzVW5zYWZlUHJvcGVydHkgPSByZXF1aXJlKCcuLi8uLi9faW50ZXJuYWwvaXNVbnNhZmVQcm9wZXJ0eS5qcycpO1xuY29uc3QgaXNEZWVwS2V5ID0gcmVxdWlyZSgnLi4vX2ludGVybmFsL2lzRGVlcEtleS5qcycpO1xuY29uc3QgdG9LZXkgPSByZXF1aXJlKCcuLi9faW50ZXJuYWwvdG9LZXkuanMnKTtcbmNvbnN0IHRvUGF0aCA9IHJlcXVpcmUoJy4uL3V0aWwvdG9QYXRoLmpzJyk7XG5cbmZ1bmN0aW9uIGdldChvYmplY3QsIHBhdGgsIGRlZmF1bHRWYWx1ZSkge1xuICAgIGlmIChvYmplY3QgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgIH1cbiAgICBzd2l0Y2ggKHR5cGVvZiBwYXRoKSB7XG4gICAgICAgIGNhc2UgJ3N0cmluZyc6IHtcbiAgICAgICAgICAgIGlmIChpc1Vuc2FmZVByb3BlcnR5LmlzVW5zYWZlUHJvcGVydHkocGF0aCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gb2JqZWN0W3BhdGhdO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRGVlcEtleS5pc0RlZXBLZXkocGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdldChvYmplY3QsIHRvUGF0aC50b1BhdGgocGF0aCksIGRlZmF1bHRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgY2FzZSAnc3ltYm9sJzoge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXRoID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIHBhdGggPSB0b0tleS50b0tleShwYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG9iamVjdFtwYXRoXTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHBhdGgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldFdpdGhQYXRoKG9iamVjdCwgcGF0aCwgZGVmYXVsdFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChPYmplY3QuaXMocGF0aD8udmFsdWVPZigpLCAtMCkpIHtcbiAgICAgICAgICAgICAgICBwYXRoID0gJy0wJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhdGggPSBTdHJpbmcocGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNVbnNhZmVQcm9wZXJ0eS5pc1Vuc2FmZVByb3BlcnR5KHBhdGgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG9iamVjdFtwYXRoXTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gZ2V0V2l0aFBhdGgob2JqZWN0LCBwYXRoLCBkZWZhdWx0VmFsdWUpIHtcbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICB9XG4gICAgbGV0IGN1cnJlbnQgPSBvYmplY3Q7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHBhdGgubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGlmIChjdXJyZW50ID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzVW5zYWZlUHJvcGVydHkuaXNVbnNhZmVQcm9wZXJ0eShwYXRoW2luZGV4XSkpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnRbcGF0aFtpbmRleF1dO1xuICAgIH1cbiAgICBpZiAoY3VycmVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBjdXJyZW50O1xufVxuXG5leHBvcnRzLmdldCA9IGdldDtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmNvbnN0IG9yZGVyQnkgPSByZXF1aXJlKCcuL29yZGVyQnkuanMnKTtcbmNvbnN0IGZsYXR0ZW4gPSByZXF1aXJlKCcuLi8uLi9hcnJheS9mbGF0dGVuLmpzJyk7XG5jb25zdCBpc0l0ZXJhdGVlQ2FsbCA9IHJlcXVpcmUoJy4uL19pbnRlcm5hbC9pc0l0ZXJhdGVlQ2FsbC5qcycpO1xuXG5mdW5jdGlvbiBzb3J0QnkoY29sbGVjdGlvbiwgLi4uY3JpdGVyaWEpIHtcbiAgICBjb25zdCBsZW5ndGggPSBjcml0ZXJpYS5sZW5ndGg7XG4gICAgaWYgKGxlbmd0aCA+IDEgJiYgaXNJdGVyYXRlZUNhbGwuaXNJdGVyYXRlZUNhbGwoY29sbGVjdGlvbiwgY3JpdGVyaWFbMF0sIGNyaXRlcmlhWzFdKSkge1xuICAgICAgICBjcml0ZXJpYSA9IFtdO1xuICAgIH1cbiAgICBlbHNlIGlmIChsZW5ndGggPiAyICYmIGlzSXRlcmF0ZWVDYWxsLmlzSXRlcmF0ZWVDYWxsKGNyaXRlcmlhWzBdLCBjcml0ZXJpYVsxXSwgY3JpdGVyaWFbMl0pKSB7XG4gICAgICAgIGNyaXRlcmlhID0gW2NyaXRlcmlhWzBdXTtcbiAgICB9XG4gICAgcmV0dXJuIG9yZGVyQnkub3JkZXJCeShjb2xsZWN0aW9uLCBmbGF0dGVuLmZsYXR0ZW4oY3JpdGVyaWEpLCBbJ2FzYyddKTtcbn1cblxuZXhwb3J0cy5zb3J0QnkgPSBzb3J0Qnk7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXG5jb25zdCBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QuanMnKTtcbmNvbnN0IGlzUHJpbWl0aXZlID0gcmVxdWlyZSgnLi4vLi4vcHJlZGljYXRlL2lzUHJpbWl0aXZlLmpzJyk7XG5jb25zdCBlcSA9IHJlcXVpcmUoJy4uL3V0aWwvZXEuanMnKTtcblxuZnVuY3Rpb24gaXNNYXRjaFdpdGgodGFyZ2V0LCBzb3VyY2UsIGNvbXBhcmUpIHtcbiAgICBpZiAodHlwZW9mIGNvbXBhcmUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIGlzTWF0Y2hXaXRoKHRhcmdldCwgc291cmNlLCAoKSA9PiB1bmRlZmluZWQpO1xuICAgIH1cbiAgICByZXR1cm4gaXNNYXRjaFdpdGhJbnRlcm5hbCh0YXJnZXQsIHNvdXJjZSwgZnVuY3Rpb24gZG9lc01hdGNoKG9ialZhbHVlLCBzcmNWYWx1ZSwga2V5LCBvYmplY3QsIHNvdXJjZSwgc3RhY2spIHtcbiAgICAgICAgY29uc3QgaXNFcXVhbCA9IGNvbXBhcmUob2JqVmFsdWUsIHNyY1ZhbHVlLCBrZXksIG9iamVjdCwgc291cmNlLCBzdGFjayk7XG4gICAgICAgIGlmIChpc0VxdWFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBCb29sZWFuKGlzRXF1YWwpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpc01hdGNoV2l0aEludGVybmFsKG9ialZhbHVlLCBzcmNWYWx1ZSwgZG9lc01hdGNoLCBzdGFjayk7XG4gICAgfSwgbmV3IE1hcCgpKTtcbn1cbmZ1bmN0aW9uIGlzTWF0Y2hXaXRoSW50ZXJuYWwodGFyZ2V0LCBzb3VyY2UsIGNvbXBhcmUsIHN0YWNrKSB7XG4gICAgaWYgKHNvdXJjZSA9PT0gdGFyZ2V0KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBzd2l0Y2ggKHR5cGVvZiBzb3VyY2UpIHtcbiAgICAgICAgY2FzZSAnb2JqZWN0Jzoge1xuICAgICAgICAgICAgcmV0dXJuIGlzT2JqZWN0TWF0Y2godGFyZ2V0LCBzb3VyY2UsIGNvbXBhcmUsIHN0YWNrKTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdmdW5jdGlvbic6IHtcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZUtleXMgPSBPYmplY3Qua2V5cyhzb3VyY2UpO1xuICAgICAgICAgICAgaWYgKHNvdXJjZUtleXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpc01hdGNoV2l0aEludGVybmFsKHRhcmdldCwgeyAuLi5zb3VyY2UgfSwgY29tcGFyZSwgc3RhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVxLmVxKHRhcmdldCwgc291cmNlKTtcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBpZiAoIWlzT2JqZWN0LmlzT2JqZWN0KHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXEuZXEodGFyZ2V0LCBzb3VyY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNvdXJjZSA9PT0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGlzT2JqZWN0TWF0Y2godGFyZ2V0LCBzb3VyY2UsIGNvbXBhcmUsIHN0YWNrKSB7XG4gICAgaWYgKHNvdXJjZSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICAgIHJldHVybiBpc0FycmF5TWF0Y2godGFyZ2V0LCBzb3VyY2UsIGNvbXBhcmUsIHN0YWNrKTtcbiAgICB9XG4gICAgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICByZXR1cm4gaXNNYXBNYXRjaCh0YXJnZXQsIHNvdXJjZSwgY29tcGFyZSwgc3RhY2spO1xuICAgIH1cbiAgICBpZiAoc291cmNlIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgIHJldHVybiBpc1NldE1hdGNoKHRhcmdldCwgc291cmNlLCBjb21wYXJlLCBzdGFjayk7XG4gICAgfVxuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhzb3VyY2UpO1xuICAgIGlmICh0YXJnZXQgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4ga2V5cy5sZW5ndGggPT09IDA7XG4gICAgfVxuICAgIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHN0YWNrPy5oYXMoc291cmNlKSkge1xuICAgICAgICByZXR1cm4gc3RhY2suZ2V0KHNvdXJjZSkgPT09IHRhcmdldDtcbiAgICB9XG4gICAgc3RhY2s/LnNldChzb3VyY2UsIHRhcmdldCk7XG4gICAgdHJ5IHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgICAgaWYgKCFpc1ByaW1pdGl2ZS5pc1ByaW1pdGl2ZSh0YXJnZXQpICYmICEoa2V5IGluIHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc291cmNlW2tleV0gPT09IHVuZGVmaW5lZCAmJiB0YXJnZXRba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNvdXJjZVtrZXldID09PSBudWxsICYmIHRhcmdldFtrZXldICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgaXNFcXVhbCA9IGNvbXBhcmUodGFyZ2V0W2tleV0sIHNvdXJjZVtrZXldLCBrZXksIHRhcmdldCwgc291cmNlLCBzdGFjayk7XG4gICAgICAgICAgICBpZiAoIWlzRXF1YWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICBzdGFjaz8uZGVsZXRlKHNvdXJjZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gaXNNYXBNYXRjaCh0YXJnZXQsIHNvdXJjZSwgY29tcGFyZSwgc3RhY2spIHtcbiAgICBpZiAoc291cmNlLnNpemUgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIE1hcCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IFtrZXksIHNvdXJjZVZhbHVlXSBvZiBzb3VyY2UuZW50cmllcygpKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldFZhbHVlID0gdGFyZ2V0LmdldChrZXkpO1xuICAgICAgICBjb25zdCBpc0VxdWFsID0gY29tcGFyZSh0YXJnZXRWYWx1ZSwgc291cmNlVmFsdWUsIGtleSwgdGFyZ2V0LCBzb3VyY2UsIHN0YWNrKTtcbiAgICAgICAgaWYgKGlzRXF1YWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5mdW5jdGlvbiBpc0FycmF5TWF0Y2godGFyZ2V0LCBzb3VyY2UsIGNvbXBhcmUsIHN0YWNrKSB7XG4gICAgaWYgKHNvdXJjZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICghQXJyYXkuaXNBcnJheSh0YXJnZXQpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgY291bnRlZEluZGV4ID0gbmV3IFNldCgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc291cmNlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZUl0ZW0gPSBzb3VyY2VbaV07XG4gICAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRhcmdldC5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKGNvdW50ZWRJbmRleC5oYXMoaikpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHRhcmdldEl0ZW0gPSB0YXJnZXRbal07XG4gICAgICAgICAgICBsZXQgbWF0Y2hlcyA9IGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgaXNFcXVhbCA9IGNvbXBhcmUodGFyZ2V0SXRlbSwgc291cmNlSXRlbSwgaSwgdGFyZ2V0LCBzb3VyY2UsIHN0YWNrKTtcbiAgICAgICAgICAgIGlmIChpc0VxdWFsKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2hlcyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICAgIGNvdW50ZWRJbmRleC5hZGQoaik7XG4gICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghZm91bmQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGlzU2V0TWF0Y2godGFyZ2V0LCBzb3VyY2UsIGNvbXBhcmUsIHN0YWNrKSB7XG4gICAgaWYgKHNvdXJjZS5zaXplID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBTZXQpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGlzQXJyYXlNYXRjaChbLi4udGFyZ2V0XSwgWy4uLnNvdXJjZV0sIGNvbXBhcmUsIHN0YWNrKTtcbn1cblxuZXhwb3J0cy5pc01hdGNoV2l0aCA9IGlzTWF0Y2hXaXRoO1xuZXhwb3J0cy5pc1NldE1hdGNoID0gaXNTZXRNYXRjaDtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmZ1bmN0aW9uIGlzTGVuZ3RoKHZhbHVlKSB7XG4gICAgcmV0dXJuIE51bWJlci5pc1NhZmVJbnRlZ2VyKHZhbHVlKSAmJiB2YWx1ZSA+PSAwO1xufVxuXG5leHBvcnRzLmlzTGVuZ3RoID0gaXNMZW5ndGg7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL2Rpc3QvY29tcGF0L2FycmF5L3NvcnRCeS5qcycpLnNvcnRCeTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmZ1bmN0aW9uIGxhc3QoYXJyKSB7XG4gICAgcmV0dXJuIGFyclthcnIubGVuZ3RoIC0gMV07XG59XG5cbmV4cG9ydHMubGFzdCA9IGxhc3Q7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXG5mdW5jdGlvbiBpc1N5bWJvbCh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzeW1ib2wnIHx8IHZhbHVlIGluc3RhbmNlb2YgU3ltYm9sO1xufVxuXG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXG5jb25zdCB0b0ludGVnZXIgPSByZXF1aXJlKCcuL3RvSW50ZWdlci5qcycpO1xuXG5mdW5jdGlvbiB0aW1lcyhuLCBnZXRWYWx1ZSkge1xuICAgIG4gPSB0b0ludGVnZXIudG9JbnRlZ2VyKG4pO1xuICAgIGlmIChuIDwgMSB8fCAhTnVtYmVyLmlzU2FmZUludGVnZXIobikpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHQgPSBuZXcgQXJyYXkobik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgcmVzdWx0W2ldID0gdHlwZW9mIGdldFZhbHVlID09PSAnZnVuY3Rpb24nID8gZ2V0VmFsdWUoaSkgOiBpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnRzLnRpbWVzID0gdGltZXM7XG4iLCJmdW5jdGlvbiBhdChhcnIsIGluZGljZXMpIHtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgQXJyYXkoaW5kaWNlcy5sZW5ndGgpO1xuICAgIGNvbnN0IGxlbmd0aCA9IGFyci5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbmRpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBpbmRleCA9IGluZGljZXNbaV07XG4gICAgICAgIGluZGV4ID0gTnVtYmVyLmlzSW50ZWdlcihpbmRleCkgPyBpbmRleCA6IE1hdGgudHJ1bmMoaW5kZXgpIHx8IDA7XG4gICAgICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgICAgICAgIGluZGV4ICs9IGxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRbaV0gPSBhcnJbaW5kZXhdO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgeyBhdCB9O1xuIiwiZnVuY3Rpb24gY2h1bmsoYXJyLCBzaXplKSB7XG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKHNpemUpIHx8IHNpemUgPD0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NpemUgbXVzdCBiZSBhbiBpbnRlZ2VyIGdyZWF0ZXIgdGhhbiB6ZXJvLicpO1xuICAgIH1cbiAgICBjb25zdCBjaHVua0xlbmd0aCA9IE1hdGguY2VpbChhcnIubGVuZ3RoIC8gc2l6ZSk7XG4gICAgY29uc3QgcmVzdWx0ID0gQXJyYXkoY2h1bmtMZW5ndGgpO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBjaHVua0xlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBzdGFydCA9IGluZGV4ICogc2l6ZTtcbiAgICAgICAgY29uc3QgZW5kID0gc3RhcnQgKyBzaXplO1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gYXJyLnNsaWNlKHN0YXJ0LCBlbmQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgeyBjaHVuayB9O1xuIiwiZnVuY3Rpb24gY29tcGFjdChhcnIpIHtcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBpdGVtID0gYXJyW2ldO1xuICAgICAgICBpZiAoaXRlbSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goaXRlbSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IHsgY29tcGFjdCB9O1xuIiwiZnVuY3Rpb24gY291bnRCeShhcnIsIG1hcHBlcikge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBhcnJbaV07XG4gICAgICAgIGNvbnN0IGtleSA9IG1hcHBlcihpdGVtKTtcbiAgICAgICAgcmVzdWx0W2tleV0gPSAocmVzdWx0W2tleV0gPz8gMCkgKyAxO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgeyBjb3VudEJ5IH07XG4iLCJmdW5jdGlvbiBkaWZmZXJlbmNlKGZpcnN0QXJyLCBzZWNvbmRBcnIpIHtcbiAgICBjb25zdCBzZWNvbmRTZXQgPSBuZXcgU2V0KHNlY29uZEFycik7XG4gICAgcmV0dXJuIGZpcnN0QXJyLmZpbHRlcihpdGVtID0+ICFzZWNvbmRTZXQuaGFzKGl0ZW0pKTtcbn1cblxuZXhwb3J0IHsgZGlmZmVyZW5jZSB9O1xuIiwiZnVuY3Rpb24gZGlmZmVyZW5jZUJ5KGZpcnN0QXJyLCBzZWNvbmRBcnIsIG1hcHBlcikge1xuICAgIGNvbnN0IG1hcHBlZFNlY29uZFNldCA9IG5ldyBTZXQoc2Vjb25kQXJyLm1hcChpdGVtID0+IG1hcHBlcihpdGVtKSkpO1xuICAgIHJldHVybiBmaXJzdEFyci5maWx0ZXIoaXRlbSA9PiB7XG4gICAgICAgIHJldHVybiAhbWFwcGVkU2Vjb25kU2V0LmhhcyhtYXBwZXIoaXRlbSkpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgeyBkaWZmZXJlbmNlQnkgfTtcbiIsImZ1bmN0aW9uIGRpZmZlcmVuY2VXaXRoKGZpcnN0QXJyLCBzZWNvbmRBcnIsIGFyZUl0ZW1zRXF1YWwpIHtcbiAgICByZXR1cm4gZmlyc3RBcnIuZmlsdGVyKGZpcnN0SXRlbSA9PiB7XG4gICAgICAgIHJldHVybiBzZWNvbmRBcnIuZXZlcnkoc2Vjb25kSXRlbSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIWFyZUl0ZW1zRXF1YWwoZmlyc3RJdGVtLCBzZWNvbmRJdGVtKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCB7IGRpZmZlcmVuY2VXaXRoIH07XG4iLCJmdW5jdGlvbiBkcm9wKGFyciwgaXRlbXNDb3VudCkge1xuICAgIGl0ZW1zQ291bnQgPSBNYXRoLm1heChpdGVtc0NvdW50LCAwKTtcbiAgICByZXR1cm4gYXJyLnNsaWNlKGl0ZW1zQ291bnQpO1xufVxuXG5leHBvcnQgeyBkcm9wIH07XG4iLCJmdW5jdGlvbiBkcm9wUmlnaHQoYXJyLCBpdGVtc0NvdW50KSB7XG4gICAgaXRlbXNDb3VudCA9IE1hdGgubWluKC1pdGVtc0NvdW50LCAwKTtcbiAgICBpZiAoaXRlbXNDb3VudCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gYXJyLnNsaWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBhcnIuc2xpY2UoMCwgaXRlbXNDb3VudCk7XG59XG5cbmV4cG9ydCB7IGRyb3BSaWdodCB9O1xuIiwiZnVuY3Rpb24gZHJvcFJpZ2h0V2hpbGUoYXJyLCBjYW5Db250aW51ZURyb3BwaW5nKSB7XG4gICAgZm9yIChsZXQgaSA9IGFyci5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBpZiAoIWNhbkNvbnRpbnVlRHJvcHBpbmcoYXJyW2ldLCBpLCBhcnIpKSB7XG4gICAgICAgICAgICByZXR1cm4gYXJyLnNsaWNlKDAsIGkgKyAxKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gW107XG59XG5cbmV4cG9ydCB7IGRyb3BSaWdodFdoaWxlIH07XG4iLCJmdW5jdGlvbiBkcm9wV2hpbGUoYXJyLCBjYW5Db250aW51ZURyb3BwaW5nKSB7XG4gICAgY29uc3QgZHJvcEVuZEluZGV4ID0gYXJyLmZpbmRJbmRleCgoaXRlbSwgaW5kZXgsIGFycikgPT4gIWNhbkNvbnRpbnVlRHJvcHBpbmcoaXRlbSwgaW5kZXgsIGFycikpO1xuICAgIGlmIChkcm9wRW5kSW5kZXggPT09IC0xKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmV0dXJuIGFyci5zbGljZShkcm9wRW5kSW5kZXgpO1xufVxuXG5leHBvcnQgeyBkcm9wV2hpbGUgfTtcbiIsImZ1bmN0aW9uIGZpbGwoYXJyYXksIHZhbHVlLCBzdGFydCA9IDAsIGVuZCA9IGFycmF5Lmxlbmd0aCkge1xuICAgIGNvbnN0IGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgICBjb25zdCBmaW5hbFN0YXJ0ID0gTWF0aC5tYXgoc3RhcnQgPj0gMCA/IHN0YXJ0IDogbGVuZ3RoICsgc3RhcnQsIDApO1xuICAgIGNvbnN0IGZpbmFsRW5kID0gTWF0aC5taW4oZW5kID49IDAgPyBlbmQgOiBsZW5ndGggKyBlbmQsIGxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IGZpbmFsU3RhcnQ7IGkgPCBmaW5hbEVuZDsgaSsrKSB7XG4gICAgICAgIGFycmF5W2ldID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbn1cblxuZXhwb3J0IHsgZmlsbCB9O1xuIiwiZnVuY3Rpb24gZmxhdHRlbihhcnIsIGRlcHRoID0gMSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGNvbnN0IGZsb29yZWREZXB0aCA9IE1hdGguZmxvb3IoZGVwdGgpO1xuICAgIGNvbnN0IHJlY3Vyc2l2ZSA9IChhcnIsIGN1cnJlbnREZXB0aCkgPT4ge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgaXRlbSA9IGFycltpXTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGl0ZW0pICYmIGN1cnJlbnREZXB0aCA8IGZsb29yZWREZXB0aCkge1xuICAgICAgICAgICAgICAgIHJlY3Vyc2l2ZShpdGVtLCBjdXJyZW50RGVwdGggKyAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICByZWN1cnNpdmUoYXJyLCAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgeyBmbGF0dGVuIH07XG4iLCJpbXBvcnQgeyBmbGF0dGVuIH0gZnJvbSAnLi9mbGF0dGVuLm1qcyc7XG5cbmZ1bmN0aW9uIGZsYXRNYXAoYXJyLCBpdGVyYXRlZSwgZGVwdGggPSAxKSB7XG4gICAgcmV0dXJuIGZsYXR0ZW4oYXJyLm1hcChpdGVtID0+IGl0ZXJhdGVlKGl0ZW0pKSwgZGVwdGgpO1xufVxuXG5leHBvcnQgeyBmbGF0TWFwIH07XG4iLCJpbXBvcnQgeyBmbGF0dGVuIH0gZnJvbSAnLi9mbGF0dGVuLm1qcyc7XG5cbmZ1bmN0aW9uIGZsYXR0ZW5EZWVwKGFycikge1xuICAgIHJldHVybiBmbGF0dGVuKGFyciwgSW5maW5pdHkpO1xufVxuXG5leHBvcnQgeyBmbGF0dGVuRGVlcCB9O1xuIiwiaW1wb3J0IHsgZmxhdHRlbkRlZXAgfSBmcm9tICcuL2ZsYXR0ZW5EZWVwLm1qcyc7XG5cbmZ1bmN0aW9uIGZsYXRNYXBEZWVwKGFyciwgaXRlcmF0ZWUpIHtcbiAgICByZXR1cm4gZmxhdHRlbkRlZXAoYXJyLm1hcCgoaXRlbSkgPT4gaXRlcmF0ZWUoaXRlbSkpKTtcbn1cblxuZXhwb3J0IHsgZmxhdE1hcERlZXAgfTtcbiIsImZ1bmN0aW9uIGZvckVhY2hSaWdodChhcnIsIGNhbGxiYWNrKSB7XG4gICAgZm9yIChsZXQgaSA9IGFyci5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gYXJyW2ldO1xuICAgICAgICBjYWxsYmFjayhlbGVtZW50LCBpLCBhcnIpO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgZm9yRWFjaFJpZ2h0IH07XG4iLCJmdW5jdGlvbiBncm91cEJ5KGFyciwgZ2V0S2V5RnJvbUl0ZW0pIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBpdGVtID0gYXJyW2ldO1xuICAgICAgICBjb25zdCBrZXkgPSBnZXRLZXlGcm9tSXRlbShpdGVtKTtcbiAgICAgICAgaWYgKCFPYmplY3QuaGFzT3duKHJlc3VsdCwga2V5KSkge1xuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRba2V5XS5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgeyBncm91cEJ5IH07XG4iLCJmdW5jdGlvbiBoZWFkKGFycikge1xuICAgIHJldHVybiBhcnJbMF07XG59XG5cbmV4cG9ydCB7IGhlYWQgfTtcbiIsImZ1bmN0aW9uIGluaXRpYWwoYXJyKSB7XG4gICAgcmV0dXJuIGFyci5zbGljZSgwLCAtMSk7XG59XG5cbmV4cG9ydCB7IGluaXRpYWwgfTtcbiIsImZ1bmN0aW9uIGludGVyc2VjdGlvbihmaXJzdEFyciwgc2Vjb25kQXJyKSB7XG4gICAgY29uc3Qgc2Vjb25kU2V0ID0gbmV3IFNldChzZWNvbmRBcnIpO1xuICAgIHJldHVybiBmaXJzdEFyci5maWx0ZXIoaXRlbSA9PiB7XG4gICAgICAgIHJldHVybiBzZWNvbmRTZXQuaGFzKGl0ZW0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgeyBpbnRlcnNlY3Rpb24gfTtcbiIsImZ1bmN0aW9uIGludGVyc2VjdGlvbkJ5KGZpcnN0QXJyLCBzZWNvbmRBcnIsIG1hcHBlcikge1xuICAgIGNvbnN0IG1hcHBlZFNlY29uZFNldCA9IG5ldyBTZXQoc2Vjb25kQXJyLm1hcChtYXBwZXIpKTtcbiAgICByZXR1cm4gZmlyc3RBcnIuZmlsdGVyKGl0ZW0gPT4gbWFwcGVkU2Vjb25kU2V0LmhhcyhtYXBwZXIoaXRlbSkpKTtcbn1cblxuZXhwb3J0IHsgaW50ZXJzZWN0aW9uQnkgfTtcbiIsImZ1bmN0aW9uIGludGVyc2VjdGlvbldpdGgoZmlyc3RBcnIsIHNlY29uZEFyciwgYXJlSXRlbXNFcXVhbCkge1xuICAgIHJldHVybiBmaXJzdEFyci5maWx0ZXIoZmlyc3RJdGVtID0+IHtcbiAgICAgICAgcmV0dXJuIHNlY29uZEFyci5zb21lKHNlY29uZEl0ZW0gPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFyZUl0ZW1zRXF1YWwoZmlyc3RJdGVtLCBzZWNvbmRJdGVtKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCB7IGludGVyc2VjdGlvbldpdGggfTtcbiIsImltcG9ydCB7IGRpZmZlcmVuY2UgfSBmcm9tICcuL2RpZmZlcmVuY2UubWpzJztcblxuZnVuY3Rpb24gaXNTdWJzZXQoc3VwZXJzZXQsIHN1YnNldCkge1xuICAgIHJldHVybiBkaWZmZXJlbmNlKHN1YnNldCwgc3VwZXJzZXQpLmxlbmd0aCA9PT0gMDtcbn1cblxuZXhwb3J0IHsgaXNTdWJzZXQgfTtcbiIsImltcG9ydCB7IGRpZmZlcmVuY2VXaXRoIH0gZnJvbSAnLi9kaWZmZXJlbmNlV2l0aC5tanMnO1xuXG5mdW5jdGlvbiBpc1N1YnNldFdpdGgoc3VwZXJzZXQsIHN1YnNldCwgYXJlSXRlbXNFcXVhbCkge1xuICAgIHJldHVybiBkaWZmZXJlbmNlV2l0aChzdWJzZXQsIHN1cGVyc2V0LCBhcmVJdGVtc0VxdWFsKS5sZW5ndGggPT09IDA7XG59XG5cbmV4cG9ydCB7IGlzU3Vic2V0V2l0aCB9O1xuIiwiZnVuY3Rpb24ga2V5QnkoYXJyLCBnZXRLZXlGcm9tSXRlbSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBhcnJbaV07XG4gICAgICAgIGNvbnN0IGtleSA9IGdldEtleUZyb21JdGVtKGl0ZW0pO1xuICAgICAgICByZXN1bHRba2V5XSA9IGl0ZW07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCB7IGtleUJ5IH07XG4iLCJmdW5jdGlvbiBsYXN0KGFycikge1xuICAgIHJldHVybiBhcnJbYXJyLmxlbmd0aCAtIDFdO1xufVxuXG5leHBvcnQgeyBsYXN0IH07XG4iLCJmdW5jdGlvbiBtYXhCeShpdGVtcywgZ2V0VmFsdWUpIHtcbiAgICBpZiAoaXRlbXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGxldCBtYXhFbGVtZW50ID0gaXRlbXNbMF07XG4gICAgbGV0IG1heCA9IGdldFZhbHVlKG1heEVsZW1lbnQpO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGl0ZW1zW2ldO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGdldFZhbHVlKGVsZW1lbnQpO1xuICAgICAgICBpZiAodmFsdWUgPiBtYXgpIHtcbiAgICAgICAgICAgIG1heCA9IHZhbHVlO1xuICAgICAgICAgICAgbWF4RWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1heEVsZW1lbnQ7XG59XG5cbmV4cG9ydCB7IG1heEJ5IH07XG4iLCJmdW5jdGlvbiBtaW5CeShpdGVtcywgZ2V0VmFsdWUpIHtcbiAgICBpZiAoaXRlbXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGxldCBtaW5FbGVtZW50ID0gaXRlbXNbMF07XG4gICAgbGV0IG1pbiA9IGdldFZhbHVlKG1pbkVsZW1lbnQpO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGl0ZW1zW2ldO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGdldFZhbHVlKGVsZW1lbnQpO1xuICAgICAgICBpZiAodmFsdWUgPCBtaW4pIHtcbiAgICAgICAgICAgIG1pbiA9IHZhbHVlO1xuICAgICAgICAgICAgbWluRWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1pbkVsZW1lbnQ7XG59XG5cbmV4cG9ydCB7IG1pbkJ5IH07XG4iLCJmdW5jdGlvbiBjb21wYXJlVmFsdWVzKGEsIGIsIG9yZGVyKSB7XG4gICAgaWYgKGEgPCBiKSB7XG4gICAgICAgIHJldHVybiBvcmRlciA9PT0gJ2FzYycgPyAtMSA6IDE7XG4gICAgfVxuICAgIGlmIChhID4gYikge1xuICAgICAgICByZXR1cm4gb3JkZXIgPT09ICdhc2MnID8gMSA6IC0xO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbn1cblxuZXhwb3J0IHsgY29tcGFyZVZhbHVlcyB9O1xuIiwiaW1wb3J0IHsgY29tcGFyZVZhbHVlcyB9IGZyb20gJy4uL19pbnRlcm5hbC9jb21wYXJlVmFsdWVzLm1qcyc7XG5cbmZ1bmN0aW9uIG9yZGVyQnkoYXJyLCBjcml0ZXJpYSwgb3JkZXJzKSB7XG4gICAgcmV0dXJuIGFyci5zbGljZSgpLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgY29uc3Qgb3JkZXJzTGVuZ3RoID0gb3JkZXJzLmxlbmd0aDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjcml0ZXJpYS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgb3JkZXIgPSBvcmRlcnNMZW5ndGggPiBpID8gb3JkZXJzW2ldIDogb3JkZXJzW29yZGVyc0xlbmd0aCAtIDFdO1xuICAgICAgICAgICAgY29uc3QgY3JpdGVyaW9uID0gY3JpdGVyaWFbaV07XG4gICAgICAgICAgICBjb25zdCBjcml0ZXJpb25Jc0Z1bmN0aW9uID0gdHlwZW9mIGNyaXRlcmlvbiA9PT0gJ2Z1bmN0aW9uJztcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlQSA9IGNyaXRlcmlvbklzRnVuY3Rpb24gPyBjcml0ZXJpb24oYSkgOiBhW2NyaXRlcmlvbl07XG4gICAgICAgICAgICBjb25zdCB2YWx1ZUIgPSBjcml0ZXJpb25Jc0Z1bmN0aW9uID8gY3JpdGVyaW9uKGIpIDogYltjcml0ZXJpb25dO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gY29tcGFyZVZhbHVlcyh2YWx1ZUEsIHZhbHVlQiwgb3JkZXIpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfSk7XG59XG5cbmV4cG9ydCB7IG9yZGVyQnkgfTtcbiIsImZ1bmN0aW9uIHBhcnRpdGlvbihhcnIsIGlzSW5UcnV0aHkpIHtcbiAgICBjb25zdCB0cnV0aHkgPSBbXTtcbiAgICBjb25zdCBmYWxzeSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBhcnJbaV07XG4gICAgICAgIGlmIChpc0luVHJ1dGh5KGl0ZW0pKSB7XG4gICAgICAgICAgICB0cnV0aHkucHVzaChpdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZhbHN5LnB1c2goaXRlbSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFt0cnV0aHksIGZhbHN5XTtcbn1cblxuZXhwb3J0IHsgcGFydGl0aW9uIH07XG4iLCJmdW5jdGlvbiBwdWxsKGFyciwgdmFsdWVzVG9SZW1vdmUpIHtcbiAgICBjb25zdCB2YWx1ZXNTZXQgPSBuZXcgU2V0KHZhbHVlc1RvUmVtb3ZlKTtcbiAgICBsZXQgcmVzdWx0SW5kZXggPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh2YWx1ZXNTZXQuaGFzKGFycltpXSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghT2JqZWN0Lmhhc093bihhcnIsIGkpKSB7XG4gICAgICAgICAgICBkZWxldGUgYXJyW3Jlc3VsdEluZGV4KytdO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgYXJyW3Jlc3VsdEluZGV4KytdID0gYXJyW2ldO1xuICAgIH1cbiAgICBhcnIubGVuZ3RoID0gcmVzdWx0SW5kZXg7XG4gICAgcmV0dXJuIGFycjtcbn1cblxuZXhwb3J0IHsgcHVsbCB9O1xuIiwiaW1wb3J0IHsgYXQgfSBmcm9tICcuL2F0Lm1qcyc7XG5cbmZ1bmN0aW9uIHB1bGxBdChhcnIsIGluZGljZXNUb1JlbW92ZSkge1xuICAgIGNvbnN0IHJlbW92ZWQgPSBhdChhcnIsIGluZGljZXNUb1JlbW92ZSk7XG4gICAgY29uc3QgaW5kaWNlcyA9IG5ldyBTZXQoaW5kaWNlc1RvUmVtb3ZlLnNsaWNlKCkuc29ydCgoeCwgeSkgPT4geSAtIHgpKTtcbiAgICBmb3IgKGNvbnN0IGluZGV4IG9mIGluZGljZXMpIHtcbiAgICAgICAgYXJyLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIHJldHVybiByZW1vdmVkO1xufVxuXG5leHBvcnQgeyBwdWxsQXQgfTtcbiIsImZ1bmN0aW9uIHJlbW92ZShhcnIsIHNob3VsZFJlbW92ZUVsZW1lbnQpIHtcbiAgICBjb25zdCBvcmlnaW5hbEFyciA9IGFyci5zbGljZSgpO1xuICAgIGNvbnN0IHJlbW92ZWQgPSBbXTtcbiAgICBsZXQgcmVzdWx0SW5kZXggPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzaG91bGRSZW1vdmVFbGVtZW50KGFycltpXSwgaSwgb3JpZ2luYWxBcnIpKSB7XG4gICAgICAgICAgICByZW1vdmVkLnB1c2goYXJyW2ldKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghT2JqZWN0Lmhhc093bihhcnIsIGkpKSB7XG4gICAgICAgICAgICBkZWxldGUgYXJyW3Jlc3VsdEluZGV4KytdO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgYXJyW3Jlc3VsdEluZGV4KytdID0gYXJyW2ldO1xuICAgIH1cbiAgICBhcnIubGVuZ3RoID0gcmVzdWx0SW5kZXg7XG4gICAgcmV0dXJuIHJlbW92ZWQ7XG59XG5cbmV4cG9ydCB7IHJlbW92ZSB9O1xuIiwiZnVuY3Rpb24gc2FtcGxlKGFycikge1xuICAgIGNvbnN0IHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXJyLmxlbmd0aCk7XG4gICAgcmV0dXJuIGFycltyYW5kb21JbmRleF07XG59XG5cbmV4cG9ydCB7IHNhbXBsZSB9O1xuIiwiZnVuY3Rpb24gcmFuZG9tKG1pbmltdW0sIG1heGltdW0pIHtcbiAgICBpZiAobWF4aW11bSA9PSBudWxsKSB7XG4gICAgICAgIG1heGltdW0gPSBtaW5pbXVtO1xuICAgICAgICBtaW5pbXVtID0gMDtcbiAgICB9XG4gICAgaWYgKG1pbmltdW0gPj0gbWF4aW11bSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5wdXQ6IFRoZSBtYXhpbXVtIHZhbHVlIG11c3QgYmUgZ3JlYXRlciB0aGFuIHRoZSBtaW5pbXVtIHZhbHVlLicpO1xuICAgIH1cbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIChtYXhpbXVtIC0gbWluaW11bSkgKyBtaW5pbXVtO1xufVxuXG5leHBvcnQgeyByYW5kb20gfTtcbiIsImltcG9ydCB7IHJhbmRvbSB9IGZyb20gJy4vcmFuZG9tLm1qcyc7XG5cbmZ1bmN0aW9uIHJhbmRvbUludChtaW5pbXVtLCBtYXhpbXVtKSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IocmFuZG9tKG1pbmltdW0sIG1heGltdW0pKTtcbn1cblxuZXhwb3J0IHsgcmFuZG9tSW50IH07XG4iLCJpbXBvcnQgeyByYW5kb21JbnQgfSBmcm9tICcuLi9tYXRoL3JhbmRvbUludC5tanMnO1xuXG5mdW5jdGlvbiBzYW1wbGVTaXplKGFycmF5LCBzaXplKSB7XG4gICAgaWYgKHNpemUgPiBhcnJheS5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTaXplIG11c3QgYmUgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSBsZW5ndGggb2YgYXJyYXkuJyk7XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBBcnJheShzaXplKTtcbiAgICBjb25zdCBzZWxlY3RlZCA9IG5ldyBTZXQoKTtcbiAgICBmb3IgKGxldCBzdGVwID0gYXJyYXkubGVuZ3RoIC0gc2l6ZSwgcmVzdWx0SW5kZXggPSAwOyBzdGVwIDwgYXJyYXkubGVuZ3RoOyBzdGVwKyssIHJlc3VsdEluZGV4KyspIHtcbiAgICAgICAgbGV0IGluZGV4ID0gcmFuZG9tSW50KDAsIHN0ZXAgKyAxKTtcbiAgICAgICAgaWYgKHNlbGVjdGVkLmhhcyhpbmRleCkpIHtcbiAgICAgICAgICAgIGluZGV4ID0gc3RlcDtcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3RlZC5hZGQoaW5kZXgpO1xuICAgICAgICByZXN1bHRbcmVzdWx0SW5kZXhdID0gYXJyYXlbaW5kZXhdO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgeyBzYW1wbGVTaXplIH07XG4iLCJmdW5jdGlvbiBzaHVmZmxlKGFycikge1xuICAgIGNvbnN0IHJlc3VsdCA9IGFyci5zbGljZSgpO1xuICAgIGZvciAobGV0IGkgPSByZXN1bHQubGVuZ3RoIC0gMTsgaSA+PSAxOyBpLS0pIHtcbiAgICAgICAgY29uc3QgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xuICAgICAgICBbcmVzdWx0W2ldLCByZXN1bHRbal1dID0gW3Jlc3VsdFtqXSwgcmVzdWx0W2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IHsgc2h1ZmZsZSB9O1xuIiwiaW1wb3J0IHsgb3JkZXJCeSB9IGZyb20gJy4vb3JkZXJCeS5tanMnO1xuXG5mdW5jdGlvbiBzb3J0QnkoYXJyLCBjcml0ZXJpYSkge1xuICAgIHJldHVybiBvcmRlckJ5KGFyciwgY3JpdGVyaWEsIFsnYXNjJ10pO1xufVxuXG5leHBvcnQgeyBzb3J0QnkgfTtcbiIsImZ1bmN0aW9uIHRhaWwoYXJyKSB7XG4gICAgcmV0dXJuIGFyci5zbGljZSgxKTtcbn1cblxuZXhwb3J0IHsgdGFpbCB9O1xuIiwiZnVuY3Rpb24gaXNTeW1ib2wodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3ltYm9sJyB8fCB2YWx1ZSBpbnN0YW5jZW9mIFN5bWJvbDtcbn1cblxuZXhwb3J0IHsgaXNTeW1ib2wgfTtcbiIsImltcG9ydCB7IGlzU3ltYm9sIH0gZnJvbSAnLi4vcHJlZGljYXRlL2lzU3ltYm9sLm1qcyc7XG5cbmZ1bmN0aW9uIHRvTnVtYmVyKHZhbHVlKSB7XG4gICAgaWYgKGlzU3ltYm9sKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gTmFOO1xuICAgIH1cbiAgICByZXR1cm4gTnVtYmVyKHZhbHVlKTtcbn1cblxuZXhwb3J0IHsgdG9OdW1iZXIgfTtcbiIsImltcG9ydCB7IHRvTnVtYmVyIH0gZnJvbSAnLi90b051bWJlci5tanMnO1xuXG5mdW5jdGlvbiB0b0Zpbml0ZSh2YWx1ZSkge1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlID09PSAwID8gdmFsdWUgOiAwO1xuICAgIH1cbiAgICB2YWx1ZSA9IHRvTnVtYmVyKHZhbHVlKTtcbiAgICBpZiAodmFsdWUgPT09IEluZmluaXR5IHx8IHZhbHVlID09PSAtSW5maW5pdHkpIHtcbiAgICAgICAgY29uc3Qgc2lnbiA9IHZhbHVlIDwgMCA/IC0xIDogMTtcbiAgICAgICAgcmV0dXJuIHNpZ24gKiBOdW1iZXIuTUFYX1ZBTFVFO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWUgPT09IHZhbHVlID8gdmFsdWUgOiAwO1xufVxuXG5leHBvcnQgeyB0b0Zpbml0ZSB9O1xuIiwiaW1wb3J0IHsgdG9GaW5pdGUgfSBmcm9tICcuL3RvRmluaXRlLm1qcyc7XG5cbmZ1bmN0aW9uIHRvSW50ZWdlcih2YWx1ZSkge1xuICAgIGNvbnN0IGZpbml0ZSA9IHRvRmluaXRlKHZhbHVlKTtcbiAgICBjb25zdCByZW1haW5kZXIgPSBmaW5pdGUgJSAxO1xuICAgIHJldHVybiByZW1haW5kZXIgPyBmaW5pdGUgLSByZW1haW5kZXIgOiBmaW5pdGU7XG59XG5cbmV4cG9ydCB7IHRvSW50ZWdlciB9O1xuIiwiaW1wb3J0IHsgdG9JbnRlZ2VyIH0gZnJvbSAnLi4vY29tcGF0L3V0aWwvdG9JbnRlZ2VyLm1qcyc7XG5cbmZ1bmN0aW9uIHRha2UoYXJyLCBjb3VudCwgZ3VhcmQpIHtcbiAgICBjb3VudCA9IGd1YXJkIHx8IGNvdW50ID09PSB1bmRlZmluZWQgPyAxIDogdG9JbnRlZ2VyKGNvdW50KTtcbiAgICByZXR1cm4gYXJyLnNsaWNlKDAsIGNvdW50KTtcbn1cblxuZXhwb3J0IHsgdGFrZSB9O1xuIiwiaW1wb3J0IHsgdG9JbnRlZ2VyIH0gZnJvbSAnLi4vY29tcGF0L3V0aWwvdG9JbnRlZ2VyLm1qcyc7XG5cbmZ1bmN0aW9uIHRha2VSaWdodChhcnIsIGNvdW50LCBndWFyZCkge1xuICAgIGNvdW50ID0gZ3VhcmQgfHwgY291bnQgPT09IHVuZGVmaW5lZCA/IDEgOiB0b0ludGVnZXIoY291bnQpO1xuICAgIGlmIChjb3VudCA8PSAwIHx8IGFyci5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICByZXR1cm4gYXJyLnNsaWNlKC1jb3VudCk7XG59XG5cbmV4cG9ydCB7IHRha2VSaWdodCB9O1xuIiwiZnVuY3Rpb24gdGFrZVJpZ2h0V2hpbGUoYXJyLCBzaG91bGRDb250aW51ZVRha2luZykge1xuICAgIGZvciAobGV0IGkgPSBhcnIubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgaWYgKCFzaG91bGRDb250aW51ZVRha2luZyhhcnJbaV0pKSB7XG4gICAgICAgICAgICByZXR1cm4gYXJyLnNsaWNlKGkgKyAxKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyLnNsaWNlKCk7XG59XG5cbmV4cG9ydCB7IHRha2VSaWdodFdoaWxlIH07XG4iLCJmdW5jdGlvbiB0YWtlV2hpbGUoYXJyLCBzaG91bGRDb250aW51ZVRha2luZykge1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBhcnJbaV07XG4gICAgICAgIGlmICghc2hvdWxkQ29udGludWVUYWtpbmcoaXRlbSkpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgeyB0YWtlV2hpbGUgfTtcbiIsImZ1bmN0aW9uIHRvRmlsbGVkKGFyciwgdmFsdWUsIHN0YXJ0ID0gMCwgZW5kID0gYXJyLmxlbmd0aCkge1xuICAgIGNvbnN0IGxlbmd0aCA9IGFyci5sZW5ndGg7XG4gICAgY29uc3QgZmluYWxTdGFydCA9IE1hdGgubWF4KHN0YXJ0ID49IDAgPyBzdGFydCA6IGxlbmd0aCArIHN0YXJ0LCAwKTtcbiAgICBjb25zdCBmaW5hbEVuZCA9IE1hdGgubWluKGVuZCA+PSAwID8gZW5kIDogbGVuZ3RoICsgZW5kLCBsZW5ndGgpO1xuICAgIGNvbnN0IG5ld0FyciA9IGFyci5zbGljZSgpO1xuICAgIGZvciAobGV0IGkgPSBmaW5hbFN0YXJ0OyBpIDwgZmluYWxFbmQ7IGkrKykge1xuICAgICAgICBuZXdBcnJbaV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld0Fycjtcbn1cblxuZXhwb3J0IHsgdG9GaWxsZWQgfTtcbiIsImZ1bmN0aW9uIHVuaXEoYXJyKSB7XG4gICAgcmV0dXJuIFsuLi5uZXcgU2V0KGFycildO1xufVxuXG5leHBvcnQgeyB1bmlxIH07XG4iLCJpbXBvcnQgeyB1bmlxIH0gZnJvbSAnLi91bmlxLm1qcyc7XG5cbmZ1bmN0aW9uIHVuaW9uKGFycjEsIGFycjIpIHtcbiAgICByZXR1cm4gdW5pcShhcnIxLmNvbmNhdChhcnIyKSk7XG59XG5cbmV4cG9ydCB7IHVuaW9uIH07XG4iLCJmdW5jdGlvbiB1bmlxQnkoYXJyLCBtYXBwZXIpIHtcbiAgICBjb25zdCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGFycltpXTtcbiAgICAgICAgY29uc3Qga2V5ID0gbWFwcGVyKGl0ZW0pO1xuICAgICAgICBpZiAoIW1hcC5oYXMoa2V5KSkge1xuICAgICAgICAgICAgbWFwLnNldChrZXksIGl0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBBcnJheS5mcm9tKG1hcC52YWx1ZXMoKSk7XG59XG5cbmV4cG9ydCB7IHVuaXFCeSB9O1xuIiwiaW1wb3J0IHsgdW5pcUJ5IH0gZnJvbSAnLi91bmlxQnkubWpzJztcblxuZnVuY3Rpb24gdW5pb25CeShhcnIxLCBhcnIyLCBtYXBwZXIpIHtcbiAgICByZXR1cm4gdW5pcUJ5KGFycjEuY29uY2F0KGFycjIpLCBtYXBwZXIpO1xufVxuXG5leHBvcnQgeyB1bmlvbkJ5IH07XG4iLCJmdW5jdGlvbiB1bmlxV2l0aChhcnIsIGFyZUl0ZW1zRXF1YWwpIHtcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBpdGVtID0gYXJyW2ldO1xuICAgICAgICBjb25zdCBpc1VuaXEgPSByZXN1bHQuZXZlcnkodiA9PiAhYXJlSXRlbXNFcXVhbCh2LCBpdGVtKSk7XG4gICAgICAgIGlmIChpc1VuaXEpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGl0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCB7IHVuaXFXaXRoIH07XG4iLCJpbXBvcnQgeyB1bmlxV2l0aCB9IGZyb20gJy4vdW5pcVdpdGgubWpzJztcblxuZnVuY3Rpb24gdW5pb25XaXRoKGFycjEsIGFycjIsIGFyZUl0ZW1zRXF1YWwpIHtcbiAgICByZXR1cm4gdW5pcVdpdGgoYXJyMS5jb25jYXQoYXJyMiksIGFyZUl0ZW1zRXF1YWwpO1xufVxuXG5leHBvcnQgeyB1bmlvbldpdGggfTtcbiIsImZ1bmN0aW9uIHVuemlwKHppcHBlZCkge1xuICAgIGxldCBtYXhMZW4gPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgemlwcGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh6aXBwZWRbaV0ubGVuZ3RoID4gbWF4TGVuKSB7XG4gICAgICAgICAgICBtYXhMZW4gPSB6aXBwZWRbaV0ubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBBcnJheShtYXhMZW4pO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWF4TGVuOyBpKyspIHtcbiAgICAgICAgcmVzdWx0W2ldID0gbmV3IEFycmF5KHppcHBlZC5sZW5ndGgpO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHppcHBlZC5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgcmVzdWx0W2ldW2pdID0gemlwcGVkW2pdW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCB7IHVuemlwIH07XG4iLCJmdW5jdGlvbiB1bnppcFdpdGgodGFyZ2V0LCBpdGVyYXRlZSkge1xuICAgIGNvbnN0IG1heExlbmd0aCA9IE1hdGgubWF4KC4uLnRhcmdldC5tYXAoaW5uZXJBcnJheSA9PiBpbm5lckFycmF5Lmxlbmd0aCkpO1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBBcnJheShtYXhMZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWF4TGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZ3JvdXAgPSBuZXcgQXJyYXkodGFyZ2V0Lmxlbmd0aCk7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGFyZ2V0Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBncm91cFtqXSA9IHRhcmdldFtqXVtpXTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRbaV0gPSBpdGVyYXRlZSguLi5ncm91cCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCB7IHVuemlwV2l0aCB9O1xuIiwiZnVuY3Rpb24gd2luZG93ZWQoYXJyLCBzaXplLCBzdGVwID0gMSwgeyBwYXJ0aWFsV2luZG93cyA9IGZhbHNlIH0gPSB7fSkge1xuICAgIGlmIChzaXplIDw9IDAgfHwgIU51bWJlci5pc0ludGVnZXIoc2l6ZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTaXplIG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyLicpO1xuICAgIH1cbiAgICBpZiAoc3RlcCA8PSAwIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKHN0ZXApKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU3RlcCBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlci4nKTtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgY29uc3QgZW5kID0gcGFydGlhbFdpbmRvd3MgPyBhcnIubGVuZ3RoIDogYXJyLmxlbmd0aCAtIHNpemUgKyAxO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZW5kOyBpICs9IHN0ZXApIHtcbiAgICAgICAgcmVzdWx0LnB1c2goYXJyLnNsaWNlKGksIGkgKyBzaXplKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCB7IHdpbmRvd2VkIH07XG4iLCJpbXBvcnQgeyBkaWZmZXJlbmNlIH0gZnJvbSAnLi9kaWZmZXJlbmNlLm1qcyc7XG5cbmZ1bmN0aW9uIHdpdGhvdXQoYXJyYXksIC4uLnZhbHVlcykge1xuICAgIHJldHVybiBkaWZmZXJlbmNlKGFycmF5LCB2YWx1ZXMpO1xufVxuXG5leHBvcnQgeyB3aXRob3V0IH07XG4iLCJpbXBvcnQgeyBkaWZmZXJlbmNlIH0gZnJvbSAnLi9kaWZmZXJlbmNlLm1qcyc7XG5pbXBvcnQgeyBpbnRlcnNlY3Rpb24gfSBmcm9tICcuL2ludGVyc2VjdGlvbi5tanMnO1xuaW1wb3J0IHsgdW5pb24gfSBmcm9tICcuL3VuaW9uLm1qcyc7XG5cbmZ1bmN0aW9uIHhvcihhcnIxLCBhcnIyKSB7XG4gICAgcmV0dXJuIGRpZmZlcmVuY2UodW5pb24oYXJyMSwgYXJyMiksIGludGVyc2VjdGlvbihhcnIxLCBhcnIyKSk7XG59XG5cbmV4cG9ydCB7IHhvciB9O1xuIiwiaW1wb3J0IHsgZGlmZmVyZW5jZUJ5IH0gZnJvbSAnLi9kaWZmZXJlbmNlQnkubWpzJztcbmltcG9ydCB7IGludGVyc2VjdGlvbkJ5IH0gZnJvbSAnLi9pbnRlcnNlY3Rpb25CeS5tanMnO1xuaW1wb3J0IHsgdW5pb25CeSB9IGZyb20gJy4vdW5pb25CeS5tanMnO1xuXG5mdW5jdGlvbiB4b3JCeShhcnIxLCBhcnIyLCBtYXBwZXIpIHtcbiAgICBjb25zdCB1bmlvbiA9IHVuaW9uQnkoYXJyMSwgYXJyMiwgbWFwcGVyKTtcbiAgICBjb25zdCBpbnRlcnNlY3Rpb24gPSBpbnRlcnNlY3Rpb25CeShhcnIxLCBhcnIyLCBtYXBwZXIpO1xuICAgIHJldHVybiBkaWZmZXJlbmNlQnkodW5pb24sIGludGVyc2VjdGlvbiwgbWFwcGVyKTtcbn1cblxuZXhwb3J0IHsgeG9yQnkgfTtcbiIsImltcG9ydCB7IGRpZmZlcmVuY2VXaXRoIH0gZnJvbSAnLi9kaWZmZXJlbmNlV2l0aC5tanMnO1xuaW1wb3J0IHsgaW50ZXJzZWN0aW9uV2l0aCB9IGZyb20gJy4vaW50ZXJzZWN0aW9uV2l0aC5tanMnO1xuaW1wb3J0IHsgdW5pb25XaXRoIH0gZnJvbSAnLi91bmlvbldpdGgubWpzJztcblxuZnVuY3Rpb24geG9yV2l0aChhcnIxLCBhcnIyLCBhcmVFbGVtZW50c0VxdWFsKSB7XG4gICAgY29uc3QgdW5pb24gPSB1bmlvbldpdGgoYXJyMSwgYXJyMiwgYXJlRWxlbWVudHNFcXVhbCk7XG4gICAgY29uc3QgaW50ZXJzZWN0aW9uID0gaW50ZXJzZWN0aW9uV2l0aChhcnIxLCBhcnIyLCBhcmVFbGVtZW50c0VxdWFsKTtcbiAgICByZXR1cm4gZGlmZmVyZW5jZVdpdGgodW5pb24sIGludGVyc2VjdGlvbiwgYXJlRWxlbWVudHNFcXVhbCk7XG59XG5cbmV4cG9ydCB7IHhvcldpdGggfTtcbiIsImZ1bmN0aW9uIHppcCguLi5hcnJzKSB7XG4gICAgbGV0IHJvd0NvdW50ID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFycnNbaV0ubGVuZ3RoID4gcm93Q291bnQpIHtcbiAgICAgICAgICAgIHJvd0NvdW50ID0gYXJyc1tpXS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgY29sdW1uQ291bnQgPSBhcnJzLmxlbmd0aDtcbiAgICBjb25zdCByZXN1bHQgPSBBcnJheShyb3dDb3VudCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3dDb3VudDsgKytpKSB7XG4gICAgICAgIGNvbnN0IHJvdyA9IEFycmF5KGNvbHVtbkNvdW50KTtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBjb2x1bW5Db3VudDsgKytqKSB7XG4gICAgICAgICAgICByb3dbal0gPSBhcnJzW2pdW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdFtpXSA9IHJvdztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IHsgemlwIH07XG4iLCJmdW5jdGlvbiB6aXBPYmplY3Qoa2V5cywgdmFsdWVzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlc3VsdFtrZXlzW2ldXSA9IHZhbHVlc1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IHsgemlwT2JqZWN0IH07XG4iLCJmdW5jdGlvbiB6aXBXaXRoKGFycjEsIC4uLnJlc3QpIHtcbiAgICBjb25zdCBhcnJzID0gW2FycjEsIC4uLnJlc3Quc2xpY2UoMCwgLTEpXTtcbiAgICBjb25zdCBjb21iaW5lID0gcmVzdFtyZXN0Lmxlbmd0aCAtIDFdO1xuICAgIGNvbnN0IG1heEluZGV4ID0gTWF0aC5tYXgoLi4uYXJycy5tYXAoYXJyID0+IGFyci5sZW5ndGgpKTtcbiAgICBjb25zdCByZXN1bHQgPSBBcnJheShtYXhJbmRleCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtYXhJbmRleDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gYXJycy5tYXAoYXJyID0+IGFycltpXSk7XG4gICAgICAgIHJlc3VsdFtpXSA9IGNvbWJpbmUoLi4uZWxlbWVudHMpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgeyB6aXBXaXRoIH07XG4iLCJjbGFzcyBBYm9ydEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSAnVGhlIG9wZXJhdGlvbiB3YXMgYWJvcnRlZCcpIHtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdBYm9ydEVycm9yJztcbiAgICB9XG59XG5cbmV4cG9ydCB7IEFib3J0RXJyb3IgfTtcbiIsImNsYXNzIFRpbWVvdXRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gJ1RoZSBvcGVyYXRpb24gd2FzIHRpbWVkIG91dCcpIHtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdUaW1lb3V0RXJyb3InO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgVGltZW91dEVycm9yIH07XG4iLCJmdW5jdGlvbiBhZnRlcihuLCBmdW5jKSB7XG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKG4pIHx8IG4gPCAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgbiBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXIuYCk7XG4gICAgfVxuICAgIGxldCBjb3VudGVyID0gMDtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgaWYgKCsrY291bnRlciA+PSBuKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuYyguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG59XG5cbmV4cG9ydCB7IGFmdGVyIH07XG4iLCJmdW5jdGlvbiBhcnkoZnVuYywgbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzLnNsaWNlKDAsIG4pKTtcbiAgICB9O1xufVxuXG5leHBvcnQgeyBhcnkgfTtcbiIsImFzeW5jIGZ1bmN0aW9uIGFzeW5jTm9vcCgpIHsgfVxuXG5leHBvcnQgeyBhc3luY05vb3AgfTtcbiIsImZ1bmN0aW9uIGJlZm9yZShuLCBmdW5jKSB7XG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKG4pIHx8IG4gPCAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbiBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXIuJyk7XG4gICAgfVxuICAgIGxldCBjb3VudGVyID0gMDtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgaWYgKCsrY291bnRlciA8IG4pIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfTtcbn1cblxuZXhwb3J0IHsgYmVmb3JlIH07XG4iLCJmdW5jdGlvbiBjdXJyeShmdW5jKSB7XG4gICAgaWYgKGZ1bmMubGVuZ3RoID09PSAwIHx8IGZ1bmMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHVybiBmdW5jO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gKGFyZykge1xuICAgICAgICByZXR1cm4gbWFrZUN1cnJ5KGZ1bmMsIGZ1bmMubGVuZ3RoLCBbYXJnXSk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIG1ha2VDdXJyeShvcmlnaW4sIGFyZ3NMZW5ndGgsIGFyZ3MpIHtcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IGFyZ3NMZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG9yaWdpbiguLi5hcmdzKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IG5leHQgPSBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgICAgICByZXR1cm4gbWFrZUN1cnJ5KG9yaWdpbiwgYXJnc0xlbmd0aCwgWy4uLmFyZ3MsIGFyZ10pO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gbmV4dDtcbiAgICB9XG59XG5cbmV4cG9ydCB7IGN1cnJ5IH07XG4iLCJmdW5jdGlvbiBjdXJyeVJpZ2h0KGZ1bmMpIHtcbiAgICBpZiAoZnVuYy5sZW5ndGggPT09IDAgfHwgZnVuYy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmM7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgIHJldHVybiBtYWtlQ3VycnlSaWdodChmdW5jLCBmdW5jLmxlbmd0aCwgW2FyZ10pO1xuICAgIH07XG59XG5mdW5jdGlvbiBtYWtlQ3VycnlSaWdodChvcmlnaW4sIGFyZ3NMZW5ndGgsIGFyZ3MpIHtcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IGFyZ3NMZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG9yaWdpbiguLi5hcmdzKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IG5leHQgPSBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgICAgICByZXR1cm4gbWFrZUN1cnJ5UmlnaHQob3JpZ2luLCBhcmdzTGVuZ3RoLCBbYXJnLCAuLi5hcmdzXSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBuZXh0O1xuICAgIH1cbn1cblxuZXhwb3J0IHsgY3VycnlSaWdodCB9O1xuIiwiZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgZGVib3VuY2VNcywgeyBzaWduYWwsIGVkZ2VzIH0gPSB7fSkge1xuICAgIGxldCBwZW5kaW5nVGhpcyA9IHVuZGVmaW5lZDtcbiAgICBsZXQgcGVuZGluZ0FyZ3MgPSBudWxsO1xuICAgIGNvbnN0IGxlYWRpbmcgPSBlZGdlcyAhPSBudWxsICYmIGVkZ2VzLmluY2x1ZGVzKCdsZWFkaW5nJyk7XG4gICAgY29uc3QgdHJhaWxpbmcgPSBlZGdlcyA9PSBudWxsIHx8IGVkZ2VzLmluY2x1ZGVzKCd0cmFpbGluZycpO1xuICAgIGNvbnN0IGludm9rZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKHBlbmRpbmdBcmdzICE9PSBudWxsKSB7XG4gICAgICAgICAgICBmdW5jLmFwcGx5KHBlbmRpbmdUaGlzLCBwZW5kaW5nQXJncyk7XG4gICAgICAgICAgICBwZW5kaW5nVGhpcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHBlbmRpbmdBcmdzID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3Qgb25UaW1lckVuZCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRyYWlsaW5nKSB7XG4gICAgICAgICAgICBpbnZva2UoKTtcbiAgICAgICAgfVxuICAgICAgICBjYW5jZWwoKTtcbiAgICB9O1xuICAgIGxldCB0aW1lb3V0SWQgPSBudWxsO1xuICAgIGNvbnN0IHNjaGVkdWxlID0gKCkgPT4ge1xuICAgICAgICBpZiAodGltZW91dElkICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICB9XG4gICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGltZW91dElkID0gbnVsbDtcbiAgICAgICAgICAgIG9uVGltZXJFbmQoKTtcbiAgICAgICAgfSwgZGVib3VuY2VNcyk7XG4gICAgfTtcbiAgICBjb25zdCBjYW5jZWxUaW1lciA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRpbWVvdXRJZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICB0aW1lb3V0SWQgPSBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBjYW5jZWwgPSAoKSA9PiB7XG4gICAgICAgIGNhbmNlbFRpbWVyKCk7XG4gICAgICAgIHBlbmRpbmdUaGlzID0gdW5kZWZpbmVkO1xuICAgICAgICBwZW5kaW5nQXJncyA9IG51bGw7XG4gICAgfTtcbiAgICBjb25zdCBmbHVzaCA9ICgpID0+IHtcbiAgICAgICAgaW52b2tlKCk7XG4gICAgfTtcbiAgICBjb25zdCBkZWJvdW5jZWQgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICBpZiAoc2lnbmFsPy5hYm9ydGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcGVuZGluZ1RoaXMgPSB0aGlzO1xuICAgICAgICBwZW5kaW5nQXJncyA9IGFyZ3M7XG4gICAgICAgIGNvbnN0IGlzRmlyc3RDYWxsID0gdGltZW91dElkID09IG51bGw7XG4gICAgICAgIHNjaGVkdWxlKCk7XG4gICAgICAgIGlmIChsZWFkaW5nICYmIGlzRmlyc3RDYWxsKSB7XG4gICAgICAgICAgICBpbnZva2UoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgZGVib3VuY2VkLnNjaGVkdWxlID0gc2NoZWR1bGU7XG4gICAgZGVib3VuY2VkLmNhbmNlbCA9IGNhbmNlbDtcbiAgICBkZWJvdW5jZWQuZmx1c2ggPSBmbHVzaDtcbiAgICBzaWduYWw/LmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgY2FuY2VsLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgcmV0dXJuIGRlYm91bmNlZDtcbn1cblxuZXhwb3J0IHsgZGVib3VuY2UgfTtcbiIsImZ1bmN0aW9uIGZsb3coLi4uZnVuY3MpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IGZ1bmNzLmxlbmd0aCA/IGZ1bmNzWzBdLmFwcGx5KHRoaXMsIGFyZ3MpIDogYXJnc1swXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBmdW5jcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcmVzdWx0ID0gZnVuY3NbaV0uY2FsbCh0aGlzLCByZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbn1cblxuZXhwb3J0IHsgZmxvdyB9O1xuIiwiaW1wb3J0IHsgZmxvdyB9IGZyb20gJy4vZmxvdy5tanMnO1xuXG5mdW5jdGlvbiBmbG93UmlnaHQoLi4uZnVuY3MpIHtcbiAgICByZXR1cm4gZmxvdyguLi5mdW5jcy5yZXZlcnNlKCkpO1xufVxuXG5leHBvcnQgeyBmbG93UmlnaHQgfTtcbiIsImZ1bmN0aW9uIGlkZW50aXR5KHgpIHtcbiAgICByZXR1cm4geDtcbn1cblxuZXhwb3J0IHsgaWRlbnRpdHkgfTtcbiIsImZ1bmN0aW9uIG1lbW9pemUoZm4sIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHsgY2FjaGUgPSBuZXcgTWFwKCksIGdldENhY2hlS2V5IH0gPSBvcHRpb25zO1xuICAgIGNvbnN0IG1lbW9pemVkRm4gPSBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGdldENhY2hlS2V5ID8gZ2V0Q2FjaGVLZXkoYXJnKSA6IGFyZztcbiAgICAgICAgaWYgKGNhY2hlLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FjaGUuZ2V0KGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZm4uY2FsbCh0aGlzLCBhcmcpO1xuICAgICAgICBjYWNoZS5zZXQoa2V5LCByZXN1bHQpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgbWVtb2l6ZWRGbi5jYWNoZSA9IGNhY2hlO1xuICAgIHJldHVybiBtZW1vaXplZEZuO1xufVxuXG5leHBvcnQgeyBtZW1vaXplIH07XG4iLCJmdW5jdGlvbiBuZWdhdGUoZnVuYykge1xuICAgIHJldHVybiAoKC4uLmFyZ3MpID0+ICFmdW5jKC4uLmFyZ3MpKTtcbn1cblxuZXhwb3J0IHsgbmVnYXRlIH07XG4iLCJmdW5jdGlvbiBub29wKCkgeyB9XG5cbmV4cG9ydCB7IG5vb3AgfTtcbiIsImZ1bmN0aW9uIG9uY2UoZnVuYykge1xuICAgIGxldCBjYWxsZWQgPSBmYWxzZTtcbiAgICBsZXQgY2FjaGU7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgIGlmICghY2FsbGVkKSB7XG4gICAgICAgICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgY2FjaGUgPSBmdW5jKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWNoZTtcbiAgICB9O1xufVxuXG5leHBvcnQgeyBvbmNlIH07XG4iLCJmdW5jdGlvbiBwYXJ0aWFsKGZ1bmMsIC4uLnBhcnRpYWxBcmdzKSB7XG4gICAgcmV0dXJuIHBhcnRpYWxJbXBsKGZ1bmMsIHBsYWNlaG9sZGVyU3ltYm9sLCAuLi5wYXJ0aWFsQXJncyk7XG59XG5mdW5jdGlvbiBwYXJ0aWFsSW1wbChmdW5jLCBwbGFjZWhvbGRlciwgLi4ucGFydGlhbEFyZ3MpIHtcbiAgICBjb25zdCBwYXJ0aWFsZWQgPSBmdW5jdGlvbiAoLi4ucHJvdmlkZWRBcmdzKSB7XG4gICAgICAgIGxldCBwcm92aWRlZEFyZ3NJbmRleCA9IDA7XG4gICAgICAgIGNvbnN0IHN1YnN0aXR1dGVkQXJncyA9IHBhcnRpYWxBcmdzXG4gICAgICAgICAgICAuc2xpY2UoKVxuICAgICAgICAgICAgLm1hcChhcmcgPT4gKGFyZyA9PT0gcGxhY2Vob2xkZXIgPyBwcm92aWRlZEFyZ3NbcHJvdmlkZWRBcmdzSW5kZXgrK10gOiBhcmcpKTtcbiAgICAgICAgY29uc3QgcmVtYWluaW5nQXJncyA9IHByb3ZpZGVkQXJncy5zbGljZShwcm92aWRlZEFyZ3NJbmRleCk7XG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIHN1YnN0aXR1dGVkQXJncy5jb25jYXQocmVtYWluaW5nQXJncykpO1xuICAgIH07XG4gICAgaWYgKGZ1bmMucHJvdG90eXBlKSB7XG4gICAgICAgIHBhcnRpYWxlZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKGZ1bmMucHJvdG90eXBlKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnRpYWxlZDtcbn1cbmNvbnN0IHBsYWNlaG9sZGVyU3ltYm9sID0gU3ltYm9sKCdwYXJ0aWFsLnBsYWNlaG9sZGVyJyk7XG5wYXJ0aWFsLnBsYWNlaG9sZGVyID0gcGxhY2Vob2xkZXJTeW1ib2w7XG5cbmV4cG9ydCB7IHBhcnRpYWwsIHBhcnRpYWxJbXBsIH07XG4iLCJmdW5jdGlvbiBwYXJ0aWFsUmlnaHQoZnVuYywgLi4ucGFydGlhbEFyZ3MpIHtcbiAgICByZXR1cm4gcGFydGlhbFJpZ2h0SW1wbChmdW5jLCBwbGFjZWhvbGRlclN5bWJvbCwgLi4ucGFydGlhbEFyZ3MpO1xufVxuZnVuY3Rpb24gcGFydGlhbFJpZ2h0SW1wbChmdW5jLCBwbGFjZWhvbGRlciwgLi4ucGFydGlhbEFyZ3MpIHtcbiAgICBjb25zdCBwYXJ0aWFsZWRSaWdodCA9IGZ1bmN0aW9uICguLi5wcm92aWRlZEFyZ3MpIHtcbiAgICAgICAgY29uc3QgcGxhY2Vob2xkZXJMZW5ndGggPSBwYXJ0aWFsQXJncy5maWx0ZXIoYXJnID0+IGFyZyA9PT0gcGxhY2Vob2xkZXIpLmxlbmd0aDtcbiAgICAgICAgY29uc3QgcmFuZ2VMZW5ndGggPSBNYXRoLm1heChwcm92aWRlZEFyZ3MubGVuZ3RoIC0gcGxhY2Vob2xkZXJMZW5ndGgsIDApO1xuICAgICAgICBjb25zdCByZW1haW5pbmdBcmdzID0gcHJvdmlkZWRBcmdzLnNsaWNlKDAsIHJhbmdlTGVuZ3RoKTtcbiAgICAgICAgbGV0IHByb3ZpZGVkQXJnc0luZGV4ID0gcmFuZ2VMZW5ndGg7XG4gICAgICAgIGNvbnN0IHN1YnN0aXR1dGVkQXJncyA9IHBhcnRpYWxBcmdzXG4gICAgICAgICAgICAuc2xpY2UoKVxuICAgICAgICAgICAgLm1hcChhcmcgPT4gKGFyZyA9PT0gcGxhY2Vob2xkZXIgPyBwcm92aWRlZEFyZ3NbcHJvdmlkZWRBcmdzSW5kZXgrK10gOiBhcmcpKTtcbiAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgcmVtYWluaW5nQXJncy5jb25jYXQoc3Vic3RpdHV0ZWRBcmdzKSk7XG4gICAgfTtcbiAgICBpZiAoZnVuYy5wcm90b3R5cGUpIHtcbiAgICAgICAgcGFydGlhbGVkUmlnaHQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShmdW5jLnByb3RvdHlwZSk7XG4gICAgfVxuICAgIHJldHVybiBwYXJ0aWFsZWRSaWdodDtcbn1cbmNvbnN0IHBsYWNlaG9sZGVyU3ltYm9sID0gU3ltYm9sKCdwYXJ0aWFsUmlnaHQucGxhY2Vob2xkZXInKTtcbnBhcnRpYWxSaWdodC5wbGFjZWhvbGRlciA9IHBsYWNlaG9sZGVyU3ltYm9sO1xuXG5leHBvcnQgeyBwYXJ0aWFsUmlnaHQsIHBhcnRpYWxSaWdodEltcGwgfTtcbiIsImZ1bmN0aW9uIHJlc3QoZnVuYywgc3RhcnRJbmRleCA9IGZ1bmMubGVuZ3RoIC0gMSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICBjb25zdCByZXN0ID0gYXJncy5zbGljZShzdGFydEluZGV4KTtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gYXJncy5zbGljZSgwLCBzdGFydEluZGV4KTtcbiAgICAgICAgd2hpbGUgKHBhcmFtcy5sZW5ndGggPCBzdGFydEluZGV4KSB7XG4gICAgICAgICAgICBwYXJhbXMucHVzaCh1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIFsuLi5wYXJhbXMsIHJlc3RdKTtcbiAgICB9O1xufVxuXG5leHBvcnQgeyByZXN0IH07XG4iLCJpbXBvcnQgeyBBYm9ydEVycm9yIH0gZnJvbSAnLi4vZXJyb3IvQWJvcnRFcnJvci5tanMnO1xuXG5mdW5jdGlvbiBkZWxheShtcywgeyBzaWduYWwgfSA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgYWJvcnRFcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChuZXcgQWJvcnRFcnJvcigpKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgYWJvcnRIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICBhYm9ydEVycm9yKCk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChzaWduYWw/LmFib3J0ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBhYm9ydEVycm9yKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBzaWduYWw/LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgYWJvcnRIYW5kbGVyKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSwgbXMpO1xuICAgICAgICBzaWduYWw/LmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgYWJvcnRIYW5kbGVyLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCB7IGRlbGF5IH07XG4iLCJpbXBvcnQgeyBkZWxheSB9IGZyb20gJy4uL3Byb21pc2UvZGVsYXkubWpzJztcblxuY29uc3QgREVGQVVMVF9ERUxBWSA9IDA7XG5jb25zdCBERUZBVUxUX1JFVFJJRVMgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG5hc3luYyBmdW5jdGlvbiByZXRyeShmdW5jLCBfb3B0aW9ucykge1xuICAgIGxldCBkZWxheSQxO1xuICAgIGxldCByZXRyaWVzO1xuICAgIGxldCBzaWduYWw7XG4gICAgaWYgKHR5cGVvZiBfb3B0aW9ucyA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgZGVsYXkkMSA9IERFRkFVTFRfREVMQVk7XG4gICAgICAgIHJldHJpZXMgPSBfb3B0aW9ucztcbiAgICAgICAgc2lnbmFsID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZGVsYXkkMSA9IF9vcHRpb25zPy5kZWxheSA/PyBERUZBVUxUX0RFTEFZO1xuICAgICAgICByZXRyaWVzID0gX29wdGlvbnM/LnJldHJpZXMgPz8gREVGQVVMVF9SRVRSSUVTO1xuICAgICAgICBzaWduYWwgPSBfb3B0aW9ucz8uc2lnbmFsO1xuICAgIH1cbiAgICBsZXQgZXJyb3I7XG4gICAgZm9yIChsZXQgYXR0ZW1wdHMgPSAwOyBhdHRlbXB0cyA8IHJldHJpZXM7IGF0dGVtcHRzKyspIHtcbiAgICAgICAgaWYgKHNpZ25hbD8uYWJvcnRlZCkge1xuICAgICAgICAgICAgdGhyb3cgZXJyb3IgPz8gbmV3IEVycm9yKGBUaGUgcmV0cnkgb3BlcmF0aW9uIHdhcyBhYm9ydGVkIGR1ZSB0byBhbiBhYm9ydCBzaWduYWwuYCk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBmdW5jKCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgZXJyb3IgPSBlcnI7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RGVsYXkgPSB0eXBlb2YgZGVsYXkkMSA9PT0gJ2Z1bmN0aW9uJyA/IGRlbGF5JDEoYXR0ZW1wdHMpIDogZGVsYXkkMTtcbiAgICAgICAgICAgIGF3YWl0IGRlbGF5KGN1cnJlbnREZWxheSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhyb3cgZXJyb3I7XG59XG5cbmV4cG9ydCB7IHJldHJ5IH07XG4iLCJmdW5jdGlvbiBzcHJlYWQoZnVuYykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoYXJnc0Fycikge1xuICAgICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzQXJyKTtcbiAgICB9O1xufVxuXG5leHBvcnQgeyBzcHJlYWQgfTtcbiIsImltcG9ydCB7IGRlYm91bmNlIH0gZnJvbSAnLi9kZWJvdW5jZS5tanMnO1xuXG5mdW5jdGlvbiB0aHJvdHRsZShmdW5jLCB0aHJvdHRsZU1zLCB7IHNpZ25hbCwgZWRnZXMgPSBbJ2xlYWRpbmcnLCAndHJhaWxpbmcnXSB9ID0ge30pIHtcbiAgICBsZXQgcGVuZGluZ0F0ID0gbnVsbDtcbiAgICBjb25zdCBkZWJvdW5jZWQgPSBkZWJvdW5jZShmdW5jLCB0aHJvdHRsZU1zLCB7IHNpZ25hbCwgZWRnZXMgfSk7XG4gICAgY29uc3QgdGhyb3R0bGVkID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKHBlbmRpbmdBdCA9PSBudWxsKSB7XG4gICAgICAgICAgICBwZW5kaW5nQXQgPSBEYXRlLm5vdygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKERhdGUubm93KCkgLSBwZW5kaW5nQXQgPj0gdGhyb3R0bGVNcykge1xuICAgICAgICAgICAgICAgIHBlbmRpbmdBdCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgZGVib3VuY2VkLmNhbmNlbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGRlYm91bmNlZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9O1xuICAgIHRocm90dGxlZC5jYW5jZWwgPSBkZWJvdW5jZWQuY2FuY2VsO1xuICAgIHRocm90dGxlZC5mbHVzaCA9IGRlYm91bmNlZC5mbHVzaDtcbiAgICByZXR1cm4gdGhyb3R0bGVkO1xufVxuXG5leHBvcnQgeyB0aHJvdHRsZSB9O1xuIiwiaW1wb3J0IHsgYXJ5IH0gZnJvbSAnLi9hcnkubWpzJztcblxuZnVuY3Rpb24gdW5hcnkoZnVuYykge1xuICAgIHJldHVybiBhcnkoZnVuYywgMSk7XG59XG5cbmV4cG9ydCB7IHVuYXJ5IH07XG4iLCJmdW5jdGlvbiBjbGFtcCh2YWx1ZSwgYm91bmQxLCBib3VuZDIpIHtcbiAgICBpZiAoYm91bmQyID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKHZhbHVlLCBib3VuZDEpO1xuICAgIH1cbiAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgodmFsdWUsIGJvdW5kMSksIGJvdW5kMik7XG59XG5cbmV4cG9ydCB7IGNsYW1wIH07XG4iLCJmdW5jdGlvbiBpblJhbmdlKHZhbHVlLCBtaW5pbXVtLCBtYXhpbXVtKSB7XG4gICAgaWYgKG1heGltdW0gPT0gbnVsbCkge1xuICAgICAgICBtYXhpbXVtID0gbWluaW11bTtcbiAgICAgICAgbWluaW11bSA9IDA7XG4gICAgfVxuICAgIGlmIChtaW5pbXVtID49IG1heGltdW0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgbWF4aW11bSB2YWx1ZSBtdXN0IGJlIGdyZWF0ZXIgdGhhbiB0aGUgbWluaW11bSB2YWx1ZS4nKTtcbiAgICB9XG4gICAgcmV0dXJuIG1pbmltdW0gPD0gdmFsdWUgJiYgdmFsdWUgPCBtYXhpbXVtO1xufVxuXG5leHBvcnQgeyBpblJhbmdlIH07XG4iLCJmdW5jdGlvbiBzdW0obnVtcykge1xuICAgIGxldCByZXN1bHQgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICByZXN1bHQgKz0gbnVtc1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IHsgc3VtIH07XG4iLCJpbXBvcnQgeyBzdW0gfSBmcm9tICcuL3N1bS5tanMnO1xuXG5mdW5jdGlvbiBtZWFuKG51bXMpIHtcbiAgICByZXR1cm4gc3VtKG51bXMpIC8gbnVtcy5sZW5ndGg7XG59XG5cbmV4cG9ydCB7IG1lYW4gfTtcbiIsImZ1bmN0aW9uIHN1bUJ5KGl0ZW1zLCBnZXRWYWx1ZSkge1xuICAgIGxldCByZXN1bHQgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVzdWx0ICs9IGdldFZhbHVlKGl0ZW1zW2ldLCBpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IHsgc3VtQnkgfTtcbiIsImltcG9ydCB7IHN1bUJ5IH0gZnJvbSAnLi9zdW1CeS5tanMnO1xuXG5mdW5jdGlvbiBtZWFuQnkoaXRlbXMsIGdldFZhbHVlKSB7XG4gICAgcmV0dXJuIHN1bUJ5KGl0ZW1zLCBpdGVtID0+IGdldFZhbHVlKGl0ZW0pKSAvIGl0ZW1zLmxlbmd0aDtcbn1cblxuZXhwb3J0IHsgbWVhbkJ5IH07XG4iLCJmdW5jdGlvbiBtZWRpYW4obnVtcykge1xuICAgIGlmIChudW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gTmFOO1xuICAgIH1cbiAgICBjb25zdCBzb3J0ZWQgPSBudW1zLnNsaWNlKCkuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xuICAgIGNvbnN0IG1pZGRsZUluZGV4ID0gTWF0aC5mbG9vcihzb3J0ZWQubGVuZ3RoIC8gMik7XG4gICAgaWYgKHNvcnRlZC5sZW5ndGggJSAyID09PSAwKSB7XG4gICAgICAgIHJldHVybiAoc29ydGVkW21pZGRsZUluZGV4IC0gMV0gKyBzb3J0ZWRbbWlkZGxlSW5kZXhdKSAvIDI7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gc29ydGVkW21pZGRsZUluZGV4XTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IG1lZGlhbiB9O1xuIiwiaW1wb3J0IHsgbWVkaWFuIH0gZnJvbSAnLi9tZWRpYW4ubWpzJztcblxuZnVuY3Rpb24gbWVkaWFuQnkoaXRlbXMsIGdldFZhbHVlKSB7XG4gICAgY29uc3QgbnVtcyA9IGl0ZW1zLm1hcCh4ID0+IGdldFZhbHVlKHgpKTtcbiAgICByZXR1cm4gbWVkaWFuKG51bXMpO1xufVxuXG5leHBvcnQgeyBtZWRpYW5CeSB9O1xuIiwiZnVuY3Rpb24gcmFuZ2Uoc3RhcnQsIGVuZCwgc3RlcCA9IDEpIHtcbiAgICBpZiAoZW5kID09IG51bGwpIHtcbiAgICAgICAgZW5kID0gc3RhcnQ7XG4gICAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKHN0ZXApIHx8IHN0ZXAgPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgc3RlcCB2YWx1ZSBtdXN0IGJlIGEgbm9uLXplcm8gaW50ZWdlci5gKTtcbiAgICB9XG4gICAgY29uc3QgbGVuZ3RoID0gTWF0aC5tYXgoTWF0aC5jZWlsKChlbmQgLSBzdGFydCkgLyBzdGVwKSwgMCk7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICByZXN1bHRbaV0gPSBzdGFydCArIGkgKiBzdGVwO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgeyByYW5nZSB9O1xuIiwiZnVuY3Rpb24gcmFuZ2VSaWdodChzdGFydCwgZW5kLCBzdGVwID0gMSkge1xuICAgIGlmIChlbmQgPT0gbnVsbCkge1xuICAgICAgICBlbmQgPSBzdGFydDtcbiAgICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICBpZiAoIU51bWJlci5pc0ludGVnZXIoc3RlcCkgfHwgc3RlcCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBzdGVwIHZhbHVlIG11c3QgYmUgYSBub24temVybyBpbnRlZ2VyLmApO1xuICAgIH1cbiAgICBjb25zdCBsZW5ndGggPSBNYXRoLm1heChNYXRoLmNlaWwoKGVuZCAtIHN0YXJ0KSAvIHN0ZXApLCAwKTtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlc3VsdFtpXSA9IHN0YXJ0ICsgKGxlbmd0aCAtIGkgLSAxKSAqIHN0ZXA7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCB7IHJhbmdlUmlnaHQgfTtcbiIsImZ1bmN0aW9uIHJvdW5kKHZhbHVlLCBwcmVjaXNpb24gPSAwKSB7XG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKHByZWNpc2lvbikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQcmVjaXNpb24gbXVzdCBiZSBhbiBpbnRlZ2VyLicpO1xuICAgIH1cbiAgICBjb25zdCBtdWx0aXBsaWVyID0gTWF0aC5wb3coMTAsIHByZWNpc2lvbik7XG4gICAgcmV0dXJuIE1hdGgucm91bmQodmFsdWUgKiBtdWx0aXBsaWVyKSAvIG11bHRpcGxpZXI7XG59XG5cbmV4cG9ydCB7IHJvdW5kIH07XG4iLCJmdW5jdGlvbiBpc1ByaW1pdGl2ZSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PSBudWxsIHx8ICh0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnICYmIHR5cGVvZiB2YWx1ZSAhPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbmV4cG9ydCB7IGlzUHJpbWl0aXZlIH07XG4iLCJmdW5jdGlvbiBpc1R5cGVkQXJyYXkoeCkge1xuICAgIHJldHVybiBBcnJheUJ1ZmZlci5pc1ZpZXcoeCkgJiYgISh4IGluc3RhbmNlb2YgRGF0YVZpZXcpO1xufVxuXG5leHBvcnQgeyBpc1R5cGVkQXJyYXkgfTtcbiIsImltcG9ydCB7IGlzUHJpbWl0aXZlIH0gZnJvbSAnLi4vcHJlZGljYXRlL2lzUHJpbWl0aXZlLm1qcyc7XG5pbXBvcnQgeyBpc1R5cGVkQXJyYXkgfSBmcm9tICcuLi9wcmVkaWNhdGUvaXNUeXBlZEFycmF5Lm1qcyc7XG5cbmZ1bmN0aW9uIGNsb25lKG9iaikge1xuICAgIGlmIChpc1ByaW1pdGl2ZShvYmopKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KG9iaikgfHxcbiAgICAgICAgaXNUeXBlZEFycmF5KG9iaikgfHxcbiAgICAgICAgb2JqIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgfHxcbiAgICAgICAgKHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgb2JqIGluc3RhbmNlb2YgU2hhcmVkQXJyYXlCdWZmZXIpKSB7XG4gICAgICAgIHJldHVybiBvYmouc2xpY2UoMCk7XG4gICAgfVxuICAgIGNvbnN0IHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopO1xuICAgIGNvbnN0IENvbnN0cnVjdG9yID0gcHJvdG90eXBlLmNvbnN0cnVjdG9yO1xuICAgIGlmIChvYmogaW5zdGFuY2VvZiBEYXRlIHx8IG9iaiBpbnN0YW5jZW9mIE1hcCB8fCBvYmogaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb25zdHJ1Y3RvcihvYmopO1xuICAgIH1cbiAgICBpZiAob2JqIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAgIGNvbnN0IG5ld1JlZ0V4cCA9IG5ldyBDb25zdHJ1Y3RvcihvYmopO1xuICAgICAgICBuZXdSZWdFeHAubGFzdEluZGV4ID0gb2JqLmxhc3RJbmRleDtcbiAgICAgICAgcmV0dXJuIG5ld1JlZ0V4cDtcbiAgICB9XG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mIERhdGFWaWV3KSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29uc3RydWN0b3Iob2JqLmJ1ZmZlci5zbGljZSgwKSk7XG4gICAgfVxuICAgIGlmIChvYmogaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICBjb25zdCBuZXdFcnJvciA9IG5ldyBDb25zdHJ1Y3RvcihvYmoubWVzc2FnZSk7XG4gICAgICAgIG5ld0Vycm9yLnN0YWNrID0gb2JqLnN0YWNrO1xuICAgICAgICBuZXdFcnJvci5uYW1lID0gb2JqLm5hbWU7XG4gICAgICAgIG5ld0Vycm9yLmNhdXNlID0gb2JqLmNhdXNlO1xuICAgICAgICByZXR1cm4gbmV3RXJyb3I7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgRmlsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgb2JqIGluc3RhbmNlb2YgRmlsZSkge1xuICAgICAgICBjb25zdCBuZXdGaWxlID0gbmV3IENvbnN0cnVjdG9yKFtvYmpdLCBvYmoubmFtZSwgeyB0eXBlOiBvYmoudHlwZSwgbGFzdE1vZGlmaWVkOiBvYmoubGFzdE1vZGlmaWVkIH0pO1xuICAgICAgICByZXR1cm4gbmV3RmlsZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGNvbnN0IG5ld09iamVjdCA9IE9iamVjdC5jcmVhdGUocHJvdG90eXBlKTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obmV3T2JqZWN0LCBvYmopO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xufVxuXG5leHBvcnQgeyBjbG9uZSB9O1xuIiwiZnVuY3Rpb24gZ2V0U3ltYm9scyhvYmplY3QpIHtcbiAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpLmZpbHRlcihzeW1ib2wgPT4gT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKG9iamVjdCwgc3ltYm9sKSk7XG59XG5cbmV4cG9ydCB7IGdldFN5bWJvbHMgfTtcbiIsImZ1bmN0aW9uIGdldFRhZyh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gJ1tvYmplY3QgVW5kZWZpbmVkXScgOiAnW29iamVjdCBOdWxsXSc7XG4gICAgfVxuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xufVxuXG5leHBvcnQgeyBnZXRUYWcgfTtcbiIsImNvbnN0IHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nO1xuY29uc3Qgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXSc7XG5jb25zdCBudW1iZXJUYWcgPSAnW29iamVjdCBOdW1iZXJdJztcbmNvbnN0IGJvb2xlYW5UYWcgPSAnW29iamVjdCBCb29sZWFuXSc7XG5jb25zdCBhcmd1bWVudHNUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJztcbmNvbnN0IHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuY29uc3QgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJztcbmNvbnN0IG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nO1xuY29uc3Qgc2V0VGFnID0gJ1tvYmplY3QgU2V0XSc7XG5jb25zdCBhcnJheVRhZyA9ICdbb2JqZWN0IEFycmF5XSc7XG5jb25zdCBmdW5jdGlvblRhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG5jb25zdCBhcnJheUJ1ZmZlclRhZyA9ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG5jb25zdCBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcbmNvbnN0IGVycm9yVGFnID0gJ1tvYmplY3QgRXJyb3JdJztcbmNvbnN0IGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJztcbmNvbnN0IHVpbnQ4QXJyYXlUYWcgPSAnW29iamVjdCBVaW50OEFycmF5XSc7XG5jb25zdCB1aW50OENsYW1wZWRBcnJheVRhZyA9ICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XSc7XG5jb25zdCB1aW50MTZBcnJheVRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XSc7XG5jb25zdCB1aW50MzJBcnJheVRhZyA9ICdbb2JqZWN0IFVpbnQzMkFycmF5XSc7XG5jb25zdCBiaWdVaW50NjRBcnJheVRhZyA9ICdbb2JqZWN0IEJpZ1VpbnQ2NEFycmF5XSc7XG5jb25zdCBpbnQ4QXJyYXlUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJztcbmNvbnN0IGludDE2QXJyYXlUYWcgPSAnW29iamVjdCBJbnQxNkFycmF5XSc7XG5jb25zdCBpbnQzMkFycmF5VGFnID0gJ1tvYmplY3QgSW50MzJBcnJheV0nO1xuY29uc3QgYmlnSW50NjRBcnJheVRhZyA9ICdbb2JqZWN0IEJpZ0ludDY0QXJyYXldJztcbmNvbnN0IGZsb2F0MzJBcnJheVRhZyA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nO1xuY29uc3QgZmxvYXQ2NEFycmF5VGFnID0gJ1tvYmplY3QgRmxvYXQ2NEFycmF5XSc7XG5cbmV4cG9ydCB7IGFyZ3VtZW50c1RhZywgYXJyYXlCdWZmZXJUYWcsIGFycmF5VGFnLCBiaWdJbnQ2NEFycmF5VGFnLCBiaWdVaW50NjRBcnJheVRhZywgYm9vbGVhblRhZywgZGF0YVZpZXdUYWcsIGRhdGVUYWcsIGVycm9yVGFnLCBmbG9hdDMyQXJyYXlUYWcsIGZsb2F0NjRBcnJheVRhZywgZnVuY3Rpb25UYWcsIGludDE2QXJyYXlUYWcsIGludDMyQXJyYXlUYWcsIGludDhBcnJheVRhZywgbWFwVGFnLCBudW1iZXJUYWcsIG9iamVjdFRhZywgcmVnZXhwVGFnLCBzZXRUYWcsIHN0cmluZ1RhZywgc3ltYm9sVGFnLCB1aW50MTZBcnJheVRhZywgdWludDMyQXJyYXlUYWcsIHVpbnQ4QXJyYXlUYWcsIHVpbnQ4Q2xhbXBlZEFycmF5VGFnIH07XG4iLCJpbXBvcnQgeyBnZXRTeW1ib2xzIH0gZnJvbSAnLi4vY29tcGF0L19pbnRlcm5hbC9nZXRTeW1ib2xzLm1qcyc7XG5pbXBvcnQgeyBnZXRUYWcgfSBmcm9tICcuLi9jb21wYXQvX2ludGVybmFsL2dldFRhZy5tanMnO1xuaW1wb3J0IHsgdWludDMyQXJyYXlUYWcsIHVpbnQxNkFycmF5VGFnLCB1aW50OENsYW1wZWRBcnJheVRhZywgdWludDhBcnJheVRhZywgc3ltYm9sVGFnLCBzdHJpbmdUYWcsIHNldFRhZywgcmVnZXhwVGFnLCBvYmplY3RUYWcsIG51bWJlclRhZywgbWFwVGFnLCBpbnQzMkFycmF5VGFnLCBpbnQxNkFycmF5VGFnLCBpbnQ4QXJyYXlUYWcsIGZsb2F0NjRBcnJheVRhZywgZmxvYXQzMkFycmF5VGFnLCBkYXRlVGFnLCBib29sZWFuVGFnLCBkYXRhVmlld1RhZywgYXJyYXlCdWZmZXJUYWcsIGFycmF5VGFnLCBhcmd1bWVudHNUYWcgfSBmcm9tICcuLi9jb21wYXQvX2ludGVybmFsL3RhZ3MubWpzJztcbmltcG9ydCB7IGlzUHJpbWl0aXZlIH0gZnJvbSAnLi4vcHJlZGljYXRlL2lzUHJpbWl0aXZlLm1qcyc7XG5pbXBvcnQgeyBpc1R5cGVkQXJyYXkgfSBmcm9tICcuLi9wcmVkaWNhdGUvaXNUeXBlZEFycmF5Lm1qcyc7XG5cbmZ1bmN0aW9uIGNsb25lRGVlcFdpdGgob2JqLCBjbG9uZVZhbHVlKSB7XG4gICAgcmV0dXJuIGNsb25lRGVlcFdpdGhJbXBsKG9iaiwgdW5kZWZpbmVkLCBvYmosIG5ldyBNYXAoKSwgY2xvbmVWYWx1ZSk7XG59XG5mdW5jdGlvbiBjbG9uZURlZXBXaXRoSW1wbCh2YWx1ZVRvQ2xvbmUsIGtleVRvQ2xvbmUsIG9iamVjdFRvQ2xvbmUsIHN0YWNrID0gbmV3IE1hcCgpLCBjbG9uZVZhbHVlID0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgY2xvbmVkID0gY2xvbmVWYWx1ZT8uKHZhbHVlVG9DbG9uZSwga2V5VG9DbG9uZSwgb2JqZWN0VG9DbG9uZSwgc3RhY2spO1xuICAgIGlmIChjbG9uZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gY2xvbmVkO1xuICAgIH1cbiAgICBpZiAoaXNQcmltaXRpdmUodmFsdWVUb0Nsb25lKSkge1xuICAgICAgICByZXR1cm4gdmFsdWVUb0Nsb25lO1xuICAgIH1cbiAgICBpZiAoc3RhY2suaGFzKHZhbHVlVG9DbG9uZSkpIHtcbiAgICAgICAgcmV0dXJuIHN0YWNrLmdldCh2YWx1ZVRvQ2xvbmUpO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZVRvQ2xvbmUpKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBBcnJheSh2YWx1ZVRvQ2xvbmUubGVuZ3RoKTtcbiAgICAgICAgc3RhY2suc2V0KHZhbHVlVG9DbG9uZSwgcmVzdWx0KTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZVRvQ2xvbmUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHJlc3VsdFtpXSA9IGNsb25lRGVlcFdpdGhJbXBsKHZhbHVlVG9DbG9uZVtpXSwgaSwgb2JqZWN0VG9DbG9uZSwgc3RhY2ssIGNsb25lVmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duKHZhbHVlVG9DbG9uZSwgJ2luZGV4JykpIHtcbiAgICAgICAgICAgIHJlc3VsdC5pbmRleCA9IHZhbHVlVG9DbG9uZS5pbmRleDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoT2JqZWN0Lmhhc093bih2YWx1ZVRvQ2xvbmUsICdpbnB1dCcpKSB7XG4gICAgICAgICAgICByZXN1bHQuaW5wdXQgPSB2YWx1ZVRvQ2xvbmUuaW5wdXQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgaWYgKHZhbHVlVG9DbG9uZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHZhbHVlVG9DbG9uZS5nZXRUaW1lKCkpO1xuICAgIH1cbiAgICBpZiAodmFsdWVUb0Nsb25lIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBSZWdFeHAodmFsdWVUb0Nsb25lLnNvdXJjZSwgdmFsdWVUb0Nsb25lLmZsYWdzKTtcbiAgICAgICAgcmVzdWx0Lmxhc3RJbmRleCA9IHZhbHVlVG9DbG9uZS5sYXN0SW5kZXg7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGlmICh2YWx1ZVRvQ2xvbmUgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IE1hcCgpO1xuICAgICAgICBzdGFjay5zZXQodmFsdWVUb0Nsb25lLCByZXN1bHQpO1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiB2YWx1ZVRvQ2xvbmUpIHtcbiAgICAgICAgICAgIHJlc3VsdC5zZXQoa2V5LCBjbG9uZURlZXBXaXRoSW1wbCh2YWx1ZSwga2V5LCBvYmplY3RUb0Nsb25lLCBzdGFjaywgY2xvbmVWYWx1ZSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGlmICh2YWx1ZVRvQ2xvbmUgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IFNldCgpO1xuICAgICAgICBzdGFjay5zZXQodmFsdWVUb0Nsb25lLCByZXN1bHQpO1xuICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlVG9DbG9uZSkge1xuICAgICAgICAgICAgcmVzdWx0LmFkZChjbG9uZURlZXBXaXRoSW1wbCh2YWx1ZSwgdW5kZWZpbmVkLCBvYmplY3RUb0Nsb25lLCBzdGFjaywgY2xvbmVWYWx1ZSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgQnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiBCdWZmZXIuaXNCdWZmZXIodmFsdWVUb0Nsb25lKSkge1xuICAgICAgICByZXR1cm4gdmFsdWVUb0Nsb25lLnN1YmFycmF5KCk7XG4gICAgfVxuICAgIGlmIChpc1R5cGVkQXJyYXkodmFsdWVUb0Nsb25lKSkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBuZXcgKE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZVRvQ2xvbmUpLmNvbnN0cnVjdG9yKSh2YWx1ZVRvQ2xvbmUubGVuZ3RoKTtcbiAgICAgICAgc3RhY2suc2V0KHZhbHVlVG9DbG9uZSwgcmVzdWx0KTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZVRvQ2xvbmUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHJlc3VsdFtpXSA9IGNsb25lRGVlcFdpdGhJbXBsKHZhbHVlVG9DbG9uZVtpXSwgaSwgb2JqZWN0VG9DbG9uZSwgc3RhY2ssIGNsb25lVmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGlmICh2YWx1ZVRvQ2xvbmUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciB8fFxuICAgICAgICAodHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZVRvQ2xvbmUgaW5zdGFuY2VvZiBTaGFyZWRBcnJheUJ1ZmZlcikpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlVG9DbG9uZS5zbGljZSgwKTtcbiAgICB9XG4gICAgaWYgKHZhbHVlVG9DbG9uZSBpbnN0YW5jZW9mIERhdGFWaWV3KSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBEYXRhVmlldyh2YWx1ZVRvQ2xvbmUuYnVmZmVyLnNsaWNlKDApLCB2YWx1ZVRvQ2xvbmUuYnl0ZU9mZnNldCwgdmFsdWVUb0Nsb25lLmJ5dGVMZW5ndGgpO1xuICAgICAgICBzdGFjay5zZXQodmFsdWVUb0Nsb25lLCByZXN1bHQpO1xuICAgICAgICBjb3B5UHJvcGVydGllcyhyZXN1bHQsIHZhbHVlVG9DbG9uZSwgb2JqZWN0VG9DbG9uZSwgc3RhY2ssIGNsb25lVmFsdWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIEZpbGUgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlVG9DbG9uZSBpbnN0YW5jZW9mIEZpbGUpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IEZpbGUoW3ZhbHVlVG9DbG9uZV0sIHZhbHVlVG9DbG9uZS5uYW1lLCB7XG4gICAgICAgICAgICB0eXBlOiB2YWx1ZVRvQ2xvbmUudHlwZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHN0YWNrLnNldCh2YWx1ZVRvQ2xvbmUsIHJlc3VsdCk7XG4gICAgICAgIGNvcHlQcm9wZXJ0aWVzKHJlc3VsdCwgdmFsdWVUb0Nsb25lLCBvYmplY3RUb0Nsb25lLCBzdGFjaywgY2xvbmVWYWx1ZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgQmxvYiAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWVUb0Nsb25lIGluc3RhbmNlb2YgQmxvYikge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBuZXcgQmxvYihbdmFsdWVUb0Nsb25lXSwgeyB0eXBlOiB2YWx1ZVRvQ2xvbmUudHlwZSB9KTtcbiAgICAgICAgc3RhY2suc2V0KHZhbHVlVG9DbG9uZSwgcmVzdWx0KTtcbiAgICAgICAgY29weVByb3BlcnRpZXMocmVzdWx0LCB2YWx1ZVRvQ2xvbmUsIG9iamVjdFRvQ2xvbmUsIHN0YWNrLCBjbG9uZVZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgaWYgKHZhbHVlVG9DbG9uZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyB2YWx1ZVRvQ2xvbmUuY29uc3RydWN0b3IoKTtcbiAgICAgICAgc3RhY2suc2V0KHZhbHVlVG9DbG9uZSwgcmVzdWx0KTtcbiAgICAgICAgcmVzdWx0Lm1lc3NhZ2UgPSB2YWx1ZVRvQ2xvbmUubWVzc2FnZTtcbiAgICAgICAgcmVzdWx0Lm5hbWUgPSB2YWx1ZVRvQ2xvbmUubmFtZTtcbiAgICAgICAgcmVzdWx0LnN0YWNrID0gdmFsdWVUb0Nsb25lLnN0YWNrO1xuICAgICAgICByZXN1bHQuY2F1c2UgPSB2YWx1ZVRvQ2xvbmUuY2F1c2U7XG4gICAgICAgIGNvcHlQcm9wZXJ0aWVzKHJlc3VsdCwgdmFsdWVUb0Nsb25lLCBvYmplY3RUb0Nsb25lLCBzdGFjaywgY2xvbmVWYWx1ZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGlmICh2YWx1ZVRvQ2xvbmUgaW5zdGFuY2VvZiBCb29sZWFuKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBCb29sZWFuKHZhbHVlVG9DbG9uZS52YWx1ZU9mKCkpO1xuICAgICAgICBzdGFjay5zZXQodmFsdWVUb0Nsb25lLCByZXN1bHQpO1xuICAgICAgICBjb3B5UHJvcGVydGllcyhyZXN1bHQsIHZhbHVlVG9DbG9uZSwgb2JqZWN0VG9DbG9uZSwgc3RhY2ssIGNsb25lVmFsdWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBpZiAodmFsdWVUb0Nsb25lIGluc3RhbmNlb2YgTnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBOdW1iZXIodmFsdWVUb0Nsb25lLnZhbHVlT2YoKSk7XG4gICAgICAgIHN0YWNrLnNldCh2YWx1ZVRvQ2xvbmUsIHJlc3VsdCk7XG4gICAgICAgIGNvcHlQcm9wZXJ0aWVzKHJlc3VsdCwgdmFsdWVUb0Nsb25lLCBvYmplY3RUb0Nsb25lLCBzdGFjaywgY2xvbmVWYWx1ZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGlmICh2YWx1ZVRvQ2xvbmUgaW5zdGFuY2VvZiBTdHJpbmcpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IFN0cmluZyh2YWx1ZVRvQ2xvbmUudmFsdWVPZigpKTtcbiAgICAgICAgc3RhY2suc2V0KHZhbHVlVG9DbG9uZSwgcmVzdWx0KTtcbiAgICAgICAgY29weVByb3BlcnRpZXMocmVzdWx0LCB2YWx1ZVRvQ2xvbmUsIG9iamVjdFRvQ2xvbmUsIHN0YWNrLCBjbG9uZVZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZVRvQ2xvbmUgPT09ICdvYmplY3QnICYmIGlzQ2xvbmVhYmxlT2JqZWN0KHZhbHVlVG9DbG9uZSkpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gT2JqZWN0LmNyZWF0ZShPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWVUb0Nsb25lKSk7XG4gICAgICAgIHN0YWNrLnNldCh2YWx1ZVRvQ2xvbmUsIHJlc3VsdCk7XG4gICAgICAgIGNvcHlQcm9wZXJ0aWVzKHJlc3VsdCwgdmFsdWVUb0Nsb25lLCBvYmplY3RUb0Nsb25lLCBzdGFjaywgY2xvbmVWYWx1ZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVRvQ2xvbmU7XG59XG5mdW5jdGlvbiBjb3B5UHJvcGVydGllcyh0YXJnZXQsIHNvdXJjZSwgb2JqZWN0VG9DbG9uZSA9IHRhcmdldCwgc3RhY2ssIGNsb25lVmFsdWUpIHtcbiAgICBjb25zdCBrZXlzID0gWy4uLk9iamVjdC5rZXlzKHNvdXJjZSksIC4uLmdldFN5bWJvbHMoc291cmNlKV07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGtleXNbaV07XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KTtcbiAgICAgICAgaWYgKGRlc2NyaXB0b3IgPT0gbnVsbCB8fCBkZXNjcmlwdG9yLndyaXRhYmxlKSB7XG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IGNsb25lRGVlcFdpdGhJbXBsKHNvdXJjZVtrZXldLCBrZXksIG9iamVjdFRvQ2xvbmUsIHN0YWNrLCBjbG9uZVZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGlzQ2xvbmVhYmxlT2JqZWN0KG9iamVjdCkge1xuICAgIHN3aXRjaCAoZ2V0VGFnKG9iamVjdCkpIHtcbiAgICAgICAgY2FzZSBhcmd1bWVudHNUYWc6XG4gICAgICAgIGNhc2UgYXJyYXlUYWc6XG4gICAgICAgIGNhc2UgYXJyYXlCdWZmZXJUYWc6XG4gICAgICAgIGNhc2UgZGF0YVZpZXdUYWc6XG4gICAgICAgIGNhc2UgYm9vbGVhblRhZzpcbiAgICAgICAgY2FzZSBkYXRlVGFnOlxuICAgICAgICBjYXNlIGZsb2F0MzJBcnJheVRhZzpcbiAgICAgICAgY2FzZSBmbG9hdDY0QXJyYXlUYWc6XG4gICAgICAgIGNhc2UgaW50OEFycmF5VGFnOlxuICAgICAgICBjYXNlIGludDE2QXJyYXlUYWc6XG4gICAgICAgIGNhc2UgaW50MzJBcnJheVRhZzpcbiAgICAgICAgY2FzZSBtYXBUYWc6XG4gICAgICAgIGNhc2UgbnVtYmVyVGFnOlxuICAgICAgICBjYXNlIG9iamVjdFRhZzpcbiAgICAgICAgY2FzZSByZWdleHBUYWc6XG4gICAgICAgIGNhc2Ugc2V0VGFnOlxuICAgICAgICBjYXNlIHN0cmluZ1RhZzpcbiAgICAgICAgY2FzZSBzeW1ib2xUYWc6XG4gICAgICAgIGNhc2UgdWludDhBcnJheVRhZzpcbiAgICAgICAgY2FzZSB1aW50OENsYW1wZWRBcnJheVRhZzpcbiAgICAgICAgY2FzZSB1aW50MTZBcnJheVRhZzpcbiAgICAgICAgY2FzZSB1aW50MzJBcnJheVRhZzoge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgeyBjbG9uZURlZXBXaXRoLCBjbG9uZURlZXBXaXRoSW1wbCwgY29weVByb3BlcnRpZXMgfTtcbiIsImltcG9ydCB7IGNsb25lRGVlcFdpdGhJbXBsIH0gZnJvbSAnLi9jbG9uZURlZXBXaXRoLm1qcyc7XG5cbmZ1bmN0aW9uIGNsb25lRGVlcChvYmopIHtcbiAgICByZXR1cm4gY2xvbmVEZWVwV2l0aEltcGwob2JqLCB1bmRlZmluZWQsIG9iaiwgbmV3IE1hcCgpLCB1bmRlZmluZWQpO1xufVxuXG5leHBvcnQgeyBjbG9uZURlZXAgfTtcbiIsImZ1bmN0aW9uIGZpbmRLZXkob2JqLCBwcmVkaWNhdGUpIHtcbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcbiAgICByZXR1cm4ga2V5cy5maW5kKGtleSA9PiBwcmVkaWNhdGUob2JqW2tleV0sIGtleSwgb2JqKSk7XG59XG5cbmV4cG9ydCB7IGZpbmRLZXkgfTtcbiIsImZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZSk7XG4gICAgY29uc3QgaGFzT2JqZWN0UHJvdG90eXBlID0gcHJvdG8gPT09IG51bGwgfHxcbiAgICAgICAgcHJvdG8gPT09IE9iamVjdC5wcm90b3R5cGUgfHxcbiAgICAgICAgT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvKSA9PT0gbnVsbDtcbiAgICBpZiAoIWhhc09iamVjdFByb3RvdHlwZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBPYmplY3RdJztcbn1cblxuZXhwb3J0IHsgaXNQbGFpbk9iamVjdCB9O1xuIiwiaW1wb3J0IHsgaXNQbGFpbk9iamVjdCB9IGZyb20gJy4uL3ByZWRpY2F0ZS9pc1BsYWluT2JqZWN0Lm1qcyc7XG5cbmZ1bmN0aW9uIGZsYXR0ZW5PYmplY3Qob2JqZWN0LCB7IGRlbGltaXRlciA9ICcuJyB9ID0ge30pIHtcbiAgICByZXR1cm4gZmxhdHRlbk9iamVjdEltcGwob2JqZWN0LCAnJywgZGVsaW1pdGVyKTtcbn1cbmZ1bmN0aW9uIGZsYXR0ZW5PYmplY3RJbXBsKG9iamVjdCwgcHJlZml4LCBkZWxpbWl0ZXIpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBvYmplY3Rba2V5XTtcbiAgICAgICAgY29uc3QgcHJlZml4ZWRLZXkgPSBwcmVmaXggPyBgJHtwcmVmaXh9JHtkZWxpbWl0ZXJ9JHtrZXl9YCA6IGtleTtcbiAgICAgICAgaWYgKGlzUGxhaW5PYmplY3QodmFsdWUpICYmIE9iamVjdC5rZXlzKHZhbHVlKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHJlc3VsdCwgZmxhdHRlbk9iamVjdEltcGwodmFsdWUsIHByZWZpeGVkS2V5LCBkZWxpbWl0ZXIpKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihyZXN1bHQsIGZsYXR0ZW5PYmplY3RJbXBsKHZhbHVlLCBwcmVmaXhlZEtleSwgZGVsaW1pdGVyKSk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRbcHJlZml4ZWRLZXldID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCB7IGZsYXR0ZW5PYmplY3QgfTtcbiIsImZ1bmN0aW9uIGludmVydChvYmopIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBvYmpba2V5XTtcbiAgICAgICAgcmVzdWx0W3ZhbHVlXSA9IGtleTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IHsgaW52ZXJ0IH07XG4iLCJmdW5jdGlvbiBtYXBLZXlzKG9iamVjdCwgZ2V0TmV3S2V5KSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGtleXNbaV07XG4gICAgICAgIGNvbnN0IHZhbHVlID0gb2JqZWN0W2tleV07XG4gICAgICAgIHJlc3VsdFtnZXROZXdLZXkodmFsdWUsIGtleSwgb2JqZWN0KV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IHsgbWFwS2V5cyB9O1xuIiwiZnVuY3Rpb24gbWFwVmFsdWVzKG9iamVjdCwgZ2V0TmV3VmFsdWUpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBvYmplY3Rba2V5XTtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBnZXROZXdWYWx1ZSh2YWx1ZSwga2V5LCBvYmplY3QpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgeyBtYXBWYWx1ZXMgfTtcbiIsImZ1bmN0aW9uIGlzVW5zYWZlUHJvcGVydHkoa2V5KSB7XG4gICAgcmV0dXJuIGtleSA9PT0gJ19fcHJvdG9fXyc7XG59XG5cbmV4cG9ydCB7IGlzVW5zYWZlUHJvcGVydHkgfTtcbiIsImltcG9ydCB7IGlzVW5zYWZlUHJvcGVydHkgfSBmcm9tICcuLi9faW50ZXJuYWwvaXNVbnNhZmVQcm9wZXJ0eS5tanMnO1xuaW1wb3J0IHsgaXNQbGFpbk9iamVjdCB9IGZyb20gJy4uL3ByZWRpY2F0ZS9pc1BsYWluT2JqZWN0Lm1qcyc7XG5cbmZ1bmN0aW9uIG1lcmdlKHRhcmdldCwgc291cmNlKSB7XG4gICAgY29uc3Qgc291cmNlS2V5cyA9IE9iamVjdC5rZXlzKHNvdXJjZSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzb3VyY2VLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHNvdXJjZUtleXNbaV07XG4gICAgICAgIGlmIChpc1Vuc2FmZVByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNvdXJjZVZhbHVlID0gc291cmNlW2tleV07XG4gICAgICAgIGNvbnN0IHRhcmdldFZhbHVlID0gdGFyZ2V0W2tleV07XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHNvdXJjZVZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGFyZ2V0VmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBtZXJnZSh0YXJnZXRWYWx1ZSwgc291cmNlVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBtZXJnZShbXSwgc291cmNlVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzUGxhaW5PYmplY3Qoc291cmNlVmFsdWUpKSB7XG4gICAgICAgICAgICBpZiAoaXNQbGFpbk9iamVjdCh0YXJnZXRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IG1lcmdlKHRhcmdldFZhbHVlLCBzb3VyY2VWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IG1lcmdlKHt9LCBzb3VyY2VWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGFyZ2V0VmFsdWUgPT09IHVuZGVmaW5lZCB8fCBzb3VyY2VWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG59XG5cbmV4cG9ydCB7IG1lcmdlIH07XG4iLCJpbXBvcnQgeyBpc1Vuc2FmZVByb3BlcnR5IH0gZnJvbSAnLi4vX2ludGVybmFsL2lzVW5zYWZlUHJvcGVydHkubWpzJztcbmltcG9ydCB7IGlzUGxhaW5PYmplY3QgfSBmcm9tICcuLi9wcmVkaWNhdGUvaXNQbGFpbk9iamVjdC5tanMnO1xuXG5mdW5jdGlvbiBtZXJnZVdpdGgodGFyZ2V0LCBzb3VyY2UsIG1lcmdlKSB7XG4gICAgY29uc3Qgc291cmNlS2V5cyA9IE9iamVjdC5rZXlzKHNvdXJjZSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzb3VyY2VLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHNvdXJjZUtleXNbaV07XG4gICAgICAgIGlmIChpc1Vuc2FmZVByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNvdXJjZVZhbHVlID0gc291cmNlW2tleV07XG4gICAgICAgIGNvbnN0IHRhcmdldFZhbHVlID0gdGFyZ2V0W2tleV07XG4gICAgICAgIGNvbnN0IG1lcmdlZCA9IG1lcmdlKHRhcmdldFZhbHVlLCBzb3VyY2VWYWx1ZSwga2V5LCB0YXJnZXQsIHNvdXJjZSk7XG4gICAgICAgIGlmIChtZXJnZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBtZXJnZWQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShzb3VyY2VWYWx1ZSkpIHtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRhcmdldFZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gbWVyZ2VXaXRoKHRhcmdldFZhbHVlID8/IFtdLCBzb3VyY2VWYWx1ZSwgbWVyZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBtZXJnZVdpdGgoW10sIHNvdXJjZVZhbHVlLCBtZXJnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNQbGFpbk9iamVjdChzb3VyY2VWYWx1ZSkpIHtcbiAgICAgICAgICAgIGlmIChpc1BsYWluT2JqZWN0KHRhcmdldFZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gbWVyZ2VXaXRoKHRhcmdldFZhbHVlLCBzb3VyY2VWYWx1ZSwgbWVyZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBtZXJnZVdpdGgoe30sIHNvdXJjZVZhbHVlLCBtZXJnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGFyZ2V0VmFsdWUgPT09IHVuZGVmaW5lZCB8fCBzb3VyY2VWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG59XG5cbmV4cG9ydCB7IG1lcmdlV2l0aCB9O1xuIiwiZnVuY3Rpb24gb21pdChvYmosIGtleXMpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7IC4uLm9iaiB9O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBrZXkgPSBrZXlzW2ldO1xuICAgICAgICBkZWxldGUgcmVzdWx0W2tleV07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCB7IG9taXQgfTtcbiIsImZ1bmN0aW9uIG9taXRCeShvYmosIHNob3VsZE9taXQpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBvYmpba2V5XTtcbiAgICAgICAgaWYgKCFzaG91bGRPbWl0KHZhbHVlLCBrZXkpKSB7XG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCB7IG9taXRCeSB9O1xuIiwiZnVuY3Rpb24gcGljayhvYmosIGtleXMpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgaWYgKE9iamVjdC5oYXNPd24ob2JqLCBrZXkpKSB7XG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IG9ialtrZXldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCB7IHBpY2sgfTtcbiIsImZ1bmN0aW9uIHBpY2tCeShvYmosIHNob3VsZFBpY2spIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBvYmpba2V5XTtcbiAgICAgICAgaWYgKHNob3VsZFBpY2sodmFsdWUsIGtleSkpIHtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IHsgcGlja0J5IH07XG4iLCJmdW5jdGlvbiBpc0FycmF5KHZhbHVlKSB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpO1xufVxuXG5leHBvcnQgeyBpc0FycmF5IH07XG4iLCJmdW5jdGlvbiBjYXBpdGFsaXplKHN0cikge1xuICAgIHJldHVybiAoc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpLnRvTG93ZXJDYXNlKCkpO1xufVxuXG5leHBvcnQgeyBjYXBpdGFsaXplIH07XG4iLCJjb25zdCBDQVNFX1NQTElUX1BBVFRFUk4gPSAvXFxwe0x1fT9cXHB7TGx9K3xbMC05XSt8XFxwe0x1fSsoPyFcXHB7TGx9KXxcXHB7RW1vamlfUHJlc2VudGF0aW9ufXxcXHB7RXh0ZW5kZWRfUGljdG9ncmFwaGljfXxcXHB7TH0rL2d1O1xuZnVuY3Rpb24gd29yZHMoc3RyKSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oc3RyLm1hdGNoKENBU0VfU1BMSVRfUEFUVEVSTikgPz8gW10pO1xufVxuXG5leHBvcnQgeyBDQVNFX1NQTElUX1BBVFRFUk4sIHdvcmRzIH07XG4iLCJpbXBvcnQgeyBjYXBpdGFsaXplIH0gZnJvbSAnLi9jYXBpdGFsaXplLm1qcyc7XG5pbXBvcnQgeyB3b3JkcyB9IGZyb20gJy4vd29yZHMubWpzJztcblxuZnVuY3Rpb24gY2FtZWxDYXNlKHN0cikge1xuICAgIGNvbnN0IHdvcmRzJDEgPSB3b3JkcyhzdHIpO1xuICAgIGlmICh3b3JkcyQxLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGNvbnN0IFtmaXJzdCwgLi4ucmVzdF0gPSB3b3JkcyQxO1xuICAgIHJldHVybiBgJHtmaXJzdC50b0xvd2VyQ2FzZSgpfSR7cmVzdC5tYXAod29yZCA9PiBjYXBpdGFsaXplKHdvcmQpKS5qb2luKCcnKX1gO1xufVxuXG5leHBvcnQgeyBjYW1lbENhc2UgfTtcbiIsImltcG9ydCB7IGlzQXJyYXkgfSBmcm9tICcuLi9jb21wYXQvcHJlZGljYXRlL2lzQXJyYXkubWpzJztcbmltcG9ydCB7IGlzUGxhaW5PYmplY3QgfSBmcm9tICcuLi9wcmVkaWNhdGUvaXNQbGFpbk9iamVjdC5tanMnO1xuaW1wb3J0IHsgY2FtZWxDYXNlIH0gZnJvbSAnLi4vc3RyaW5nL2NhbWVsQ2FzZS5tanMnO1xuXG5mdW5jdGlvbiB0b0NhbWVsQ2FzZUtleXMob2JqKSB7XG4gICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICByZXR1cm4gb2JqLm1hcChpdGVtID0+IHRvQ2FtZWxDYXNlS2V5cyhpdGVtKSk7XG4gICAgfVxuICAgIGlmIChpc1BsYWluT2JqZWN0KG9iaikpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGtleXNbaV07XG4gICAgICAgICAgICBjb25zdCBjYW1lbEtleSA9IGNhbWVsQ2FzZShrZXkpO1xuICAgICAgICAgICAgY29uc3QgY29udmVydGVkVmFsdWUgPSB0b0NhbWVsQ2FzZUtleXMob2JqW2tleV0pO1xuICAgICAgICAgICAgcmVzdWx0W2NhbWVsS2V5XSA9IGNvbnZlcnRlZFZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG59XG5cbmV4cG9ydCB7IHRvQ2FtZWxDYXNlS2V5cyB9O1xuIiwiaW1wb3J0IHsgY2xvbmUgfSBmcm9tICcuL2Nsb25lLm1qcyc7XG5pbXBvcnQgeyBtZXJnZVdpdGggfSBmcm9tICcuL21lcmdlV2l0aC5tanMnO1xuaW1wb3J0IHsgaXNQbGFpbk9iamVjdCB9IGZyb20gJy4uL3ByZWRpY2F0ZS9pc1BsYWluT2JqZWN0Lm1qcyc7XG5cbmZ1bmN0aW9uIHRvTWVyZ2VkKHRhcmdldCwgc291cmNlKSB7XG4gICAgcmV0dXJuIG1lcmdlV2l0aChjbG9uZSh0YXJnZXQpLCBzb3VyY2UsIGZ1bmN0aW9uIG1lcmdlUmVjdXJzaXZlbHkodGFyZ2V0VmFsdWUsIHNvdXJjZVZhbHVlKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHNvdXJjZVZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGFyZ2V0VmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lcmdlV2l0aChjbG9uZSh0YXJnZXRWYWx1ZSksIHNvdXJjZVZhbHVlLCBtZXJnZVJlY3Vyc2l2ZWx5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBtZXJnZVdpdGgoW10sIHNvdXJjZVZhbHVlLCBtZXJnZVJlY3Vyc2l2ZWx5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHNvdXJjZVZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKGlzUGxhaW5PYmplY3QodGFyZ2V0VmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lcmdlV2l0aChjbG9uZSh0YXJnZXRWYWx1ZSksIHNvdXJjZVZhbHVlLCBtZXJnZVJlY3Vyc2l2ZWx5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBtZXJnZVdpdGgoe30sIHNvdXJjZVZhbHVlLCBtZXJnZVJlY3Vyc2l2ZWx5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5leHBvcnQgeyB0b01lcmdlZCB9O1xuIiwiZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvYmplY3QpIHtcbiAgICBpZiAodHlwZW9mIG9iamVjdCAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAob2JqZWN0ID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCkgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgICAgY29uc3QgdGFnID0gb2JqZWN0W1N5bWJvbC50b1N0cmluZ1RhZ107XG4gICAgICAgIGlmICh0YWcgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlzVGFnUmVhZG9ubHkgPSAhT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIFN5bWJvbC50b1N0cmluZ1RhZyk/LndyaXRhYmxlO1xuICAgICAgICBpZiAoaXNUYWdSZWFkb25seSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvYmplY3QudG9TdHJpbmcoKSA9PT0gYFtvYmplY3QgJHt0YWd9XWA7XG4gICAgfVxuICAgIGxldCBwcm90byA9IG9iamVjdDtcbiAgICB3aGlsZSAoT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvKSAhPT0gbnVsbCkge1xuICAgICAgICBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwcm90byk7XG4gICAgfVxuICAgIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KSA9PT0gcHJvdG87XG59XG5cbmV4cG9ydCB7IGlzUGxhaW5PYmplY3QgfTtcbiIsImltcG9ydCB7IHdvcmRzIH0gZnJvbSAnLi93b3Jkcy5tanMnO1xuXG5mdW5jdGlvbiBzbmFrZUNhc2Uoc3RyKSB7XG4gICAgY29uc3Qgd29yZHMkMSA9IHdvcmRzKHN0cik7XG4gICAgcmV0dXJuIHdvcmRzJDEubWFwKHdvcmQgPT4gd29yZC50b0xvd2VyQ2FzZSgpKS5qb2luKCdfJyk7XG59XG5cbmV4cG9ydCB7IHNuYWtlQ2FzZSB9O1xuIiwiaW1wb3J0IHsgaXNBcnJheSB9IGZyb20gJy4uL2NvbXBhdC9wcmVkaWNhdGUvaXNBcnJheS5tanMnO1xuaW1wb3J0IHsgaXNQbGFpbk9iamVjdCB9IGZyb20gJy4uL2NvbXBhdC9wcmVkaWNhdGUvaXNQbGFpbk9iamVjdC5tanMnO1xuaW1wb3J0IHsgc25ha2VDYXNlIH0gZnJvbSAnLi4vc3RyaW5nL3NuYWtlQ2FzZS5tanMnO1xuXG5mdW5jdGlvbiB0b1NuYWtlQ2FzZUtleXMob2JqKSB7XG4gICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICByZXR1cm4gb2JqLm1hcChpdGVtID0+IHRvU25ha2VDYXNlS2V5cyhpdGVtKSk7XG4gICAgfVxuICAgIGlmIChpc1BsYWluT2JqZWN0KG9iaikpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGtleXNbaV07XG4gICAgICAgICAgICBjb25zdCBzbmFrZUtleSA9IHNuYWtlQ2FzZShrZXkpO1xuICAgICAgICAgICAgY29uc3QgY29udmVydGVkVmFsdWUgPSB0b1NuYWtlQ2FzZUtleXMob2JqW2tleV0pO1xuICAgICAgICAgICAgcmVzdWx0W3NuYWtlS2V5XSA9IGNvbnZlcnRlZFZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG59XG5cbmV4cG9ydCB7IHRvU25ha2VDYXNlS2V5cyB9O1xuIiwiZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyO1xufVxuXG5leHBvcnQgeyBpc0FycmF5QnVmZmVyIH07XG4iLCJmdW5jdGlvbiBpc0Jsb2IoeCkge1xuICAgIGlmICh0eXBlb2YgQmxvYiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4geCBpbnN0YW5jZW9mIEJsb2I7XG59XG5cbmV4cG9ydCB7IGlzQmxvYiB9O1xuIiwiZnVuY3Rpb24gaXNCb29sZWFuKHgpIHtcbiAgICByZXR1cm4gdHlwZW9mIHggPT09ICdib29sZWFuJztcbn1cblxuZXhwb3J0IHsgaXNCb29sZWFuIH07XG4iLCJmdW5jdGlvbiBpc0Jyb3dzZXIoKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdz8uZG9jdW1lbnQgIT0gbnVsbDtcbn1cblxuZXhwb3J0IHsgaXNCcm93c2VyIH07XG4iLCJmdW5jdGlvbiBpc0J1ZmZlcih4KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIEJ1ZmZlci5pc0J1ZmZlcih4KTtcbn1cblxuZXhwb3J0IHsgaXNCdWZmZXIgfTtcbiIsImZ1bmN0aW9uIGlzRGF0ZSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIERhdGU7XG59XG5cbmV4cG9ydCB7IGlzRGF0ZSB9O1xuIiwiZnVuY3Rpb24gZXEodmFsdWUsIG90aGVyKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSBvdGhlciB8fCAoTnVtYmVyLmlzTmFOKHZhbHVlKSAmJiBOdW1iZXIuaXNOYU4ob3RoZXIpKTtcbn1cblxuZXhwb3J0IHsgZXEgfTtcbiIsImltcG9ydCB7IGlzUGxhaW5PYmplY3QgfSBmcm9tICcuL2lzUGxhaW5PYmplY3QubWpzJztcbmltcG9ydCB7IGdldFN5bWJvbHMgfSBmcm9tICcuLi9jb21wYXQvX2ludGVybmFsL2dldFN5bWJvbHMubWpzJztcbmltcG9ydCB7IGdldFRhZyB9IGZyb20gJy4uL2NvbXBhdC9faW50ZXJuYWwvZ2V0VGFnLm1qcyc7XG5pbXBvcnQgeyBmdW5jdGlvblRhZywgcmVnZXhwVGFnLCBzeW1ib2xUYWcsIGRhdGVUYWcsIGJvb2xlYW5UYWcsIG51bWJlclRhZywgc3RyaW5nVGFnLCBvYmplY3RUYWcsIGVycm9yVGFnLCBkYXRhVmlld1RhZywgYXJyYXlCdWZmZXJUYWcsIGZsb2F0NjRBcnJheVRhZywgZmxvYXQzMkFycmF5VGFnLCBiaWdJbnQ2NEFycmF5VGFnLCBpbnQzMkFycmF5VGFnLCBpbnQxNkFycmF5VGFnLCBpbnQ4QXJyYXlUYWcsIGJpZ1VpbnQ2NEFycmF5VGFnLCB1aW50MzJBcnJheVRhZywgdWludDE2QXJyYXlUYWcsIHVpbnQ4Q2xhbXBlZEFycmF5VGFnLCB1aW50OEFycmF5VGFnLCBhcnJheVRhZywgc2V0VGFnLCBtYXBUYWcsIGFyZ3VtZW50c1RhZyB9IGZyb20gJy4uL2NvbXBhdC9faW50ZXJuYWwvdGFncy5tanMnO1xuaW1wb3J0IHsgZXEgfSBmcm9tICcuLi9jb21wYXQvdXRpbC9lcS5tanMnO1xuXG5mdW5jdGlvbiBpc0VxdWFsV2l0aChhLCBiLCBhcmVWYWx1ZXNFcXVhbCkge1xuICAgIHJldHVybiBpc0VxdWFsV2l0aEltcGwoYSwgYiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBhcmVWYWx1ZXNFcXVhbCk7XG59XG5mdW5jdGlvbiBpc0VxdWFsV2l0aEltcGwoYSwgYiwgcHJvcGVydHksIGFQYXJlbnQsIGJQYXJlbnQsIHN0YWNrLCBhcmVWYWx1ZXNFcXVhbCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGFyZVZhbHVlc0VxdWFsKGEsIGIsIHByb3BlcnR5LCBhUGFyZW50LCBiUGFyZW50LCBzdGFjayk7XG4gICAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgYSA9PT0gdHlwZW9mIGIpIHtcbiAgICAgICAgc3dpdGNoICh0eXBlb2YgYSkge1xuICAgICAgICAgICAgY2FzZSAnYmlnaW50JzpcbiAgICAgICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgICAgIGNhc2UgJ3N5bWJvbCc6XG4gICAgICAgICAgICBjYXNlICd1bmRlZmluZWQnOiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEgPT09IGI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdudW1iZXInOiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEgPT09IGIgfHwgT2JqZWN0LmlzKGEsIGIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnZnVuY3Rpb24nOiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEgPT09IGI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdvYmplY3QnOiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFyZU9iamVjdHNFcXVhbChhLCBiLCBzdGFjaywgYXJlVmFsdWVzRXF1YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcmVPYmplY3RzRXF1YWwoYSwgYiwgc3RhY2ssIGFyZVZhbHVlc0VxdWFsKTtcbn1cbmZ1bmN0aW9uIGFyZU9iamVjdHNFcXVhbChhLCBiLCBzdGFjaywgYXJlVmFsdWVzRXF1YWwpIHtcbiAgICBpZiAoT2JqZWN0LmlzKGEsIGIpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBsZXQgYVRhZyA9IGdldFRhZyhhKTtcbiAgICBsZXQgYlRhZyA9IGdldFRhZyhiKTtcbiAgICBpZiAoYVRhZyA9PT0gYXJndW1lbnRzVGFnKSB7XG4gICAgICAgIGFUYWcgPSBvYmplY3RUYWc7XG4gICAgfVxuICAgIGlmIChiVGFnID09PSBhcmd1bWVudHNUYWcpIHtcbiAgICAgICAgYlRhZyA9IG9iamVjdFRhZztcbiAgICB9XG4gICAgaWYgKGFUYWcgIT09IGJUYWcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBzd2l0Y2ggKGFUYWcpIHtcbiAgICAgICAgY2FzZSBzdHJpbmdUYWc6XG4gICAgICAgICAgICByZXR1cm4gYS50b1N0cmluZygpID09PSBiLnRvU3RyaW5nKCk7XG4gICAgICAgIGNhc2UgbnVtYmVyVGFnOiB7XG4gICAgICAgICAgICBjb25zdCB4ID0gYS52YWx1ZU9mKCk7XG4gICAgICAgICAgICBjb25zdCB5ID0gYi52YWx1ZU9mKCk7XG4gICAgICAgICAgICByZXR1cm4gZXEoeCwgeSk7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBib29sZWFuVGFnOlxuICAgICAgICBjYXNlIGRhdGVUYWc6XG4gICAgICAgIGNhc2Ugc3ltYm9sVGFnOlxuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5pcyhhLnZhbHVlT2YoKSwgYi52YWx1ZU9mKCkpO1xuICAgICAgICBjYXNlIHJlZ2V4cFRhZzoge1xuICAgICAgICAgICAgcmV0dXJuIGEuc291cmNlID09PSBiLnNvdXJjZSAmJiBhLmZsYWdzID09PSBiLmZsYWdzO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgZnVuY3Rpb25UYWc6IHtcbiAgICAgICAgICAgIHJldHVybiBhID09PSBiO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YWNrID0gc3RhY2sgPz8gbmV3IE1hcCgpO1xuICAgIGNvbnN0IGFTdGFjayA9IHN0YWNrLmdldChhKTtcbiAgICBjb25zdCBiU3RhY2sgPSBzdGFjay5nZXQoYik7XG4gICAgaWYgKGFTdGFjayAhPSBudWxsICYmIGJTdGFjayAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBhU3RhY2sgPT09IGI7XG4gICAgfVxuICAgIHN0YWNrLnNldChhLCBiKTtcbiAgICBzdGFjay5zZXQoYiwgYSk7XG4gICAgdHJ5IHtcbiAgICAgICAgc3dpdGNoIChhVGFnKSB7XG4gICAgICAgICAgICBjYXNlIG1hcFRhZzoge1xuICAgICAgICAgICAgICAgIGlmIChhLnNpemUgIT09IGIuc2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIGEuZW50cmllcygpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghYi5oYXMoa2V5KSB8fCAhaXNFcXVhbFdpdGhJbXBsKHZhbHVlLCBiLmdldChrZXkpLCBrZXksIGEsIGIsIHN0YWNrLCBhcmVWYWx1ZXNFcXVhbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2Ugc2V0VGFnOiB7XG4gICAgICAgICAgICAgICAgaWYgKGEuc2l6ZSAhPT0gYi5zaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgYVZhbHVlcyA9IEFycmF5LmZyb20oYS52YWx1ZXMoKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgYlZhbHVlcyA9IEFycmF5LmZyb20oYi52YWx1ZXMoKSk7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhVmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFWYWx1ZSA9IGFWYWx1ZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gYlZhbHVlcy5maW5kSW5kZXgoYlZhbHVlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpc0VxdWFsV2l0aEltcGwoYVZhbHVlLCBiVmFsdWUsIHVuZGVmaW5lZCwgYSwgYiwgc3RhY2ssIGFyZVZhbHVlc0VxdWFsKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBiVmFsdWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBhcnJheVRhZzpcbiAgICAgICAgICAgIGNhc2UgdWludDhBcnJheVRhZzpcbiAgICAgICAgICAgIGNhc2UgdWludDhDbGFtcGVkQXJyYXlUYWc6XG4gICAgICAgICAgICBjYXNlIHVpbnQxNkFycmF5VGFnOlxuICAgICAgICAgICAgY2FzZSB1aW50MzJBcnJheVRhZzpcbiAgICAgICAgICAgIGNhc2UgYmlnVWludDY0QXJyYXlUYWc6XG4gICAgICAgICAgICBjYXNlIGludDhBcnJheVRhZzpcbiAgICAgICAgICAgIGNhc2UgaW50MTZBcnJheVRhZzpcbiAgICAgICAgICAgIGNhc2UgaW50MzJBcnJheVRhZzpcbiAgICAgICAgICAgIGNhc2UgYmlnSW50NjRBcnJheVRhZzpcbiAgICAgICAgICAgIGNhc2UgZmxvYXQzMkFycmF5VGFnOlxuICAgICAgICAgICAgY2FzZSBmbG9hdDY0QXJyYXlUYWc6IHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIEJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgQnVmZmVyLmlzQnVmZmVyKGEpICE9PSBCdWZmZXIuaXNCdWZmZXIoYikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNFcXVhbFdpdGhJbXBsKGFbaV0sIGJbaV0sIGksIGEsIGIsIHN0YWNrLCBhcmVWYWx1ZXNFcXVhbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgYXJyYXlCdWZmZXJUYWc6IHtcbiAgICAgICAgICAgICAgICBpZiAoYS5ieXRlTGVuZ3RoICE9PSBiLmJ5dGVMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYXJlT2JqZWN0c0VxdWFsKG5ldyBVaW50OEFycmF5KGEpLCBuZXcgVWludDhBcnJheShiKSwgc3RhY2ssIGFyZVZhbHVlc0VxdWFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgZGF0YVZpZXdUYWc6IHtcbiAgICAgICAgICAgICAgICBpZiAoYS5ieXRlTGVuZ3RoICE9PSBiLmJ5dGVMZW5ndGggfHwgYS5ieXRlT2Zmc2V0ICE9PSBiLmJ5dGVPZmZzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYXJlT2JqZWN0c0VxdWFsKG5ldyBVaW50OEFycmF5KGEpLCBuZXcgVWludDhBcnJheShiKSwgc3RhY2ssIGFyZVZhbHVlc0VxdWFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgZXJyb3JUYWc6IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYS5uYW1lID09PSBiLm5hbWUgJiYgYS5tZXNzYWdlID09PSBiLm1lc3NhZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIG9iamVjdFRhZzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFyZUVxdWFsSW5zdGFuY2VzID0gYXJlT2JqZWN0c0VxdWFsKGEuY29uc3RydWN0b3IsIGIuY29uc3RydWN0b3IsIHN0YWNrLCBhcmVWYWx1ZXNFcXVhbCkgfHxcbiAgICAgICAgICAgICAgICAgICAgKGlzUGxhaW5PYmplY3QoYSkgJiYgaXNQbGFpbk9iamVjdChiKSk7XG4gICAgICAgICAgICAgICAgaWYgKCFhcmVFcXVhbEluc3RhbmNlcykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGFLZXlzID0gWy4uLk9iamVjdC5rZXlzKGEpLCAuLi5nZXRTeW1ib2xzKGEpXTtcbiAgICAgICAgICAgICAgICBjb25zdCBiS2V5cyA9IFsuLi5PYmplY3Qua2V5cyhiKSwgLi4uZ2V0U3ltYm9scyhiKV07XG4gICAgICAgICAgICAgICAgaWYgKGFLZXlzLmxlbmd0aCAhPT0gYktleXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhS2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wS2V5ID0gYUtleXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFQcm9wID0gYVtwcm9wS2V5XTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFPYmplY3QuaGFzT3duKGIsIHByb3BLZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYlByb3AgPSBiW3Byb3BLZXldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRXF1YWxXaXRoSW1wbChhUHJvcCwgYlByb3AsIHByb3BLZXksIGEsIGIsIHN0YWNrLCBhcmVWYWx1ZXNFcXVhbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIHN0YWNrLmRlbGV0ZShhKTtcbiAgICAgICAgc3RhY2suZGVsZXRlKGIpO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgaXNFcXVhbFdpdGggfTtcbiIsImltcG9ydCB7IGlzRXF1YWxXaXRoIH0gZnJvbSAnLi9pc0VxdWFsV2l0aC5tanMnO1xuaW1wb3J0IHsgbm9vcCB9IGZyb20gJy4uL2Z1bmN0aW9uL25vb3AubWpzJztcblxuZnVuY3Rpb24gaXNFcXVhbChhLCBiKSB7XG4gICAgcmV0dXJuIGlzRXF1YWxXaXRoKGEsIGIsIG5vb3ApO1xufVxuXG5leHBvcnQgeyBpc0VxdWFsIH07XG4iLCJmdW5jdGlvbiBpc0Vycm9yKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgRXJyb3I7XG59XG5cbmV4cG9ydCB7IGlzRXJyb3IgfTtcbiIsImltcG9ydCB7IGlzQmxvYiB9IGZyb20gJy4vaXNCbG9iLm1qcyc7XG5cbmZ1bmN0aW9uIGlzRmlsZSh4KSB7XG4gICAgaWYgKHR5cGVvZiBGaWxlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBpc0Jsb2IoeCkgJiYgeCBpbnN0YW5jZW9mIEZpbGU7XG59XG5cbmV4cG9ydCB7IGlzRmlsZSB9O1xuIiwiZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59XG5cbmV4cG9ydCB7IGlzRnVuY3Rpb24gfTtcbiIsImZ1bmN0aW9uIGlzSlNPTih2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IGlzSlNPTiB9O1xuIiwiaW1wb3J0IHsgaXNQbGFpbk9iamVjdCB9IGZyb20gJy4vaXNQbGFpbk9iamVjdC5tanMnO1xuXG5mdW5jdGlvbiBpc0pTT05WYWx1ZSh2YWx1ZSkge1xuICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICAgIGNhc2UgJ29iamVjdCc6IHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSA9PT0gbnVsbCB8fCBpc0pTT05BcnJheSh2YWx1ZSkgfHwgaXNKU09OT2JqZWN0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICBjYXNlICdib29sZWFuJzoge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gaXNKU09OQXJyYXkodmFsdWUpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlLmV2ZXJ5KGl0ZW0gPT4gaXNKU09OVmFsdWUoaXRlbSkpO1xufVxuZnVuY3Rpb24gaXNKU09OT2JqZWN0KG9iaikge1xuICAgIGlmICghaXNQbGFpbk9iamVjdChvYmopKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3Qga2V5cyA9IFJlZmxlY3Qub3duS2V5cyhvYmopO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBrZXkgPSBrZXlzW2ldO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IG9ialtrZXldO1xuICAgICAgICBpZiAodHlwZW9mIGtleSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzSlNPTlZhbHVlKHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgeyBpc0pTT05BcnJheSwgaXNKU09OT2JqZWN0LCBpc0pTT05WYWx1ZSB9O1xuIiwiZnVuY3Rpb24gaXNMZW5ndGgodmFsdWUpIHtcbiAgICByZXR1cm4gTnVtYmVyLmlzU2FmZUludGVnZXIodmFsdWUpICYmIHZhbHVlID49IDA7XG59XG5cbmV4cG9ydCB7IGlzTGVuZ3RoIH07XG4iLCJmdW5jdGlvbiBpc01hcCh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIE1hcDtcbn1cblxuZXhwb3J0IHsgaXNNYXAgfTtcbiIsImZ1bmN0aW9uIGlzTmlsKHgpIHtcbiAgICByZXR1cm4geCA9PSBudWxsO1xufVxuXG5leHBvcnQgeyBpc05pbCB9O1xuIiwiZnVuY3Rpb24gaXNOb2RlKCkge1xuICAgIHJldHVybiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvY2Vzcz8udmVyc2lvbnM/Lm5vZGUgIT0gbnVsbDtcbn1cblxuZXhwb3J0IHsgaXNOb2RlIH07XG4iLCJmdW5jdGlvbiBpc05vdE5pbCh4KSB7XG4gICAgcmV0dXJuIHggIT0gbnVsbDtcbn1cblxuZXhwb3J0IHsgaXNOb3ROaWwgfTtcbiIsImZ1bmN0aW9uIGlzTnVsbCh4KSB7XG4gICAgcmV0dXJuIHggPT09IG51bGw7XG59XG5cbmV4cG9ydCB7IGlzTnVsbCB9O1xuIiwiZnVuY3Rpb24gaXNQcm9taXNlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZTtcbn1cblxuZXhwb3J0IHsgaXNQcm9taXNlIH07XG4iLCJmdW5jdGlvbiBpc1JlZ0V4cCh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFJlZ0V4cDtcbn1cblxuZXhwb3J0IHsgaXNSZWdFeHAgfTtcbiIsImZ1bmN0aW9uIGlzU2V0KHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgU2V0O1xufVxuXG5leHBvcnQgeyBpc1NldCB9O1xuIiwiZnVuY3Rpb24gaXNTdHJpbmcodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbn1cblxuZXhwb3J0IHsgaXNTdHJpbmcgfTtcbiIsImZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N5bWJvbCc7XG59XG5cbmV4cG9ydCB7IGlzU3ltYm9sIH07XG4iLCJmdW5jdGlvbiBpc1VuZGVmaW5lZCh4KSB7XG4gICAgcmV0dXJuIHggPT09IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IHsgaXNVbmRlZmluZWQgfTtcbiIsImZ1bmN0aW9uIGlzV2Vha01hcCh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFdlYWtNYXA7XG59XG5cbmV4cG9ydCB7IGlzV2Vha01hcCB9O1xuIiwiZnVuY3Rpb24gaXNXZWFrU2V0KHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgV2Vha1NldDtcbn1cblxuZXhwb3J0IHsgaXNXZWFrU2V0IH07XG4iLCJjbGFzcyBTZW1hcGhvcmUge1xuICAgIGNhcGFjaXR5O1xuICAgIGF2YWlsYWJsZTtcbiAgICBkZWZlcnJlZFRhc2tzID0gW107XG4gICAgY29uc3RydWN0b3IoY2FwYWNpdHkpIHtcbiAgICAgICAgdGhpcy5jYXBhY2l0eSA9IGNhcGFjaXR5O1xuICAgICAgICB0aGlzLmF2YWlsYWJsZSA9IGNhcGFjaXR5O1xuICAgIH1cbiAgICBhc3luYyBhY3F1aXJlKCkge1xuICAgICAgICBpZiAodGhpcy5hdmFpbGFibGUgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmF2YWlsYWJsZS0tO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGVmZXJyZWRUYXNrcy5wdXNoKHJlc29sdmUpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVsZWFzZSgpIHtcbiAgICAgICAgY29uc3QgZGVmZXJyZWRUYXNrID0gdGhpcy5kZWZlcnJlZFRhc2tzLnNoaWZ0KCk7XG4gICAgICAgIGlmIChkZWZlcnJlZFRhc2sgIT0gbnVsbCkge1xuICAgICAgICAgICAgZGVmZXJyZWRUYXNrKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYXZhaWxhYmxlIDwgdGhpcy5jYXBhY2l0eSkge1xuICAgICAgICAgICAgdGhpcy5hdmFpbGFibGUrKztcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IHsgU2VtYXBob3JlIH07XG4iLCJpbXBvcnQgeyBTZW1hcGhvcmUgfSBmcm9tICcuL3NlbWFwaG9yZS5tanMnO1xuXG5jbGFzcyBNdXRleCB7XG4gICAgc2VtYXBob3JlID0gbmV3IFNlbWFwaG9yZSgxKTtcbiAgICBnZXQgaXNMb2NrZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbWFwaG9yZS5hdmFpbGFibGUgPT09IDA7XG4gICAgfVxuICAgIGFzeW5jIGFjcXVpcmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbWFwaG9yZS5hY3F1aXJlKCk7XG4gICAgfVxuICAgIHJlbGVhc2UoKSB7XG4gICAgICAgIHRoaXMuc2VtYXBob3JlLnJlbGVhc2UoKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IE11dGV4IH07XG4iLCJpbXBvcnQgeyBkZWxheSB9IGZyb20gJy4vZGVsYXkubWpzJztcbmltcG9ydCB7IFRpbWVvdXRFcnJvciB9IGZyb20gJy4uL2Vycm9yL1RpbWVvdXRFcnJvci5tanMnO1xuXG5hc3luYyBmdW5jdGlvbiB0aW1lb3V0KG1zKSB7XG4gICAgYXdhaXQgZGVsYXkobXMpO1xuICAgIHRocm93IG5ldyBUaW1lb3V0RXJyb3IoKTtcbn1cblxuZXhwb3J0IHsgdGltZW91dCB9O1xuIiwiaW1wb3J0IHsgdGltZW91dCB9IGZyb20gJy4vdGltZW91dC5tanMnO1xuXG5hc3luYyBmdW5jdGlvbiB3aXRoVGltZW91dChydW4sIG1zKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmFjZShbcnVuKCksIHRpbWVvdXQobXMpXSk7XG59XG5cbmV4cG9ydCB7IHdpdGhUaW1lb3V0IH07XG4iLCJpbXBvcnQgeyB3b3JkcyB9IGZyb20gJy4vd29yZHMubWpzJztcblxuZnVuY3Rpb24gY29uc3RhbnRDYXNlKHN0cikge1xuICAgIGNvbnN0IHdvcmRzJDEgPSB3b3JkcyhzdHIpO1xuICAgIHJldHVybiB3b3JkcyQxLm1hcCh3b3JkID0+IHdvcmQudG9VcHBlckNhc2UoKSkuam9pbignXycpO1xufVxuXG5leHBvcnQgeyBjb25zdGFudENhc2UgfTtcbiIsImNvbnN0IGRlYnVyck1hcCA9IG5ldyBNYXAoT2JqZWN0LmVudHJpZXMoe1xuICAgIMOGOiAnQWUnLFxuICAgIMOQOiAnRCcsXG4gICAgw5g6ICdPJyxcbiAgICDDnjogJ1RoJyxcbiAgICDDnzogJ3NzJyxcbiAgICDDpjogJ2FlJyxcbiAgICDDsDogJ2QnLFxuICAgIMO4OiAnbycsXG4gICAgw746ICd0aCcsXG4gICAgxJA6ICdEJyxcbiAgICDEkTogJ2QnLFxuICAgIMSmOiAnSCcsXG4gICAgxKc6ICdoJyxcbiAgICDEsTogJ2knLFxuICAgIMSyOiAnSUonLFxuICAgIMSzOiAnaWonLFxuICAgIMS4OiAnaycsXG4gICAgxL86ICdMJyxcbiAgICDFgDogJ2wnLFxuICAgIMWBOiAnTCcsXG4gICAgxYI6ICdsJyxcbiAgICDFiTogXCInblwiLFxuICAgIMWKOiAnTicsXG4gICAgxYs6ICduJyxcbiAgICDFkjogJ09lJyxcbiAgICDFkzogJ29lJyxcbiAgICDFpjogJ1QnLFxuICAgIMWnOiAndCcsXG4gICAgxb86ICdzJyxcbn0pKTtcbmZ1bmN0aW9uIGRlYnVycihzdHIpIHtcbiAgICBzdHIgPSBzdHIubm9ybWFsaXplKCdORkQnKTtcbiAgICBsZXQgcmVzdWx0ID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgY2hhciA9IHN0cltpXTtcbiAgICAgICAgaWYgKChjaGFyID49ICdcXHUwMzAwJyAmJiBjaGFyIDw9ICdcXHUwMzZmJykgfHwgKGNoYXIgPj0gJ1xcdWZlMjAnICYmIGNoYXIgPD0gJ1xcdWZlMjMnKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ICs9IGRlYnVyck1hcC5nZXQoY2hhcikgPz8gY2hhcjtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IHsgZGVidXJyIH07XG4iLCJjb25zdCBodG1sRXNjYXBlcyA9IHtcbiAgICAnJic6ICcmYW1wOycsXG4gICAgJzwnOiAnJmx0OycsXG4gICAgJz4nOiAnJmd0OycsXG4gICAgJ1wiJzogJyZxdW90OycsXG4gICAgXCInXCI6ICcmIzM5OycsXG59O1xuZnVuY3Rpb24gZXNjYXBlKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvWyY8PlwiJ10vZywgbWF0Y2ggPT4gaHRtbEVzY2FwZXNbbWF0Y2hdKTtcbn1cblxuZXhwb3J0IHsgZXNjYXBlIH07XG4iLCJmdW5jdGlvbiBlc2NhcGVSZWdFeHAoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZywgJ1xcXFwkJicpO1xufVxuXG5leHBvcnQgeyBlc2NhcGVSZWdFeHAgfTtcbiIsImltcG9ydCB7IHdvcmRzIH0gZnJvbSAnLi93b3Jkcy5tanMnO1xuXG5mdW5jdGlvbiBrZWJhYkNhc2Uoc3RyKSB7XG4gICAgY29uc3Qgd29yZHMkMSA9IHdvcmRzKHN0cik7XG4gICAgcmV0dXJuIHdvcmRzJDEubWFwKHdvcmQgPT4gd29yZC50b0xvd2VyQ2FzZSgpKS5qb2luKCctJyk7XG59XG5cbmV4cG9ydCB7IGtlYmFiQ2FzZSB9O1xuIiwiaW1wb3J0IHsgd29yZHMgfSBmcm9tICcuL3dvcmRzLm1qcyc7XG5cbmZ1bmN0aW9uIGxvd2VyQ2FzZShzdHIpIHtcbiAgICBjb25zdCB3b3JkcyQxID0gd29yZHMoc3RyKTtcbiAgICByZXR1cm4gd29yZHMkMS5tYXAod29yZCA9PiB3b3JkLnRvTG93ZXJDYXNlKCkpLmpvaW4oJyAnKTtcbn1cblxuZXhwb3J0IHsgbG93ZXJDYXNlIH07XG4iLCJmdW5jdGlvbiBsb3dlckZpcnN0KHN0cikge1xuICAgIHJldHVybiBzdHIuc3Vic3RyaW5nKDAsIDEpLnRvTG93ZXJDYXNlKCkgKyBzdHIuc3Vic3RyaW5nKDEpO1xufVxuXG5leHBvcnQgeyBsb3dlckZpcnN0IH07XG4iLCJmdW5jdGlvbiBwYWQoc3RyLCBsZW5ndGgsIGNoYXJzID0gJyAnKSB7XG4gICAgcmV0dXJuIHN0ci5wYWRTdGFydChNYXRoLmZsb29yKChsZW5ndGggLSBzdHIubGVuZ3RoKSAvIDIpICsgc3RyLmxlbmd0aCwgY2hhcnMpLnBhZEVuZChsZW5ndGgsIGNoYXJzKTtcbn1cblxuZXhwb3J0IHsgcGFkIH07XG4iLCJpbXBvcnQgeyBjYXBpdGFsaXplIH0gZnJvbSAnLi9jYXBpdGFsaXplLm1qcyc7XG5pbXBvcnQgeyB3b3JkcyB9IGZyb20gJy4vd29yZHMubWpzJztcblxuZnVuY3Rpb24gcGFzY2FsQ2FzZShzdHIpIHtcbiAgICBjb25zdCB3b3JkcyQxID0gd29yZHMoc3RyKTtcbiAgICByZXR1cm4gd29yZHMkMS5tYXAod29yZCA9PiBjYXBpdGFsaXplKHdvcmQpKS5qb2luKCcnKTtcbn1cblxuZXhwb3J0IHsgcGFzY2FsQ2FzZSB9O1xuIiwiZnVuY3Rpb24gcmV2ZXJzZVN0cmluZyh2YWx1ZSkge1xuICAgIHJldHVybiBbLi4udmFsdWVdLnJldmVyc2UoKS5qb2luKCcnKTtcbn1cblxuZXhwb3J0IHsgcmV2ZXJzZVN0cmluZyB9O1xuIiwiaW1wb3J0IHsgd29yZHMgfSBmcm9tICcuL3dvcmRzLm1qcyc7XG5cbmZ1bmN0aW9uIHN0YXJ0Q2FzZShzdHIpIHtcbiAgICBjb25zdCB3b3JkcyQxID0gd29yZHMoc3RyLnRyaW0oKSk7XG4gICAgbGV0IHJlc3VsdCA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd29yZHMkMS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCB3b3JkID0gd29yZHMkMVtpXTtcbiAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgcmVzdWx0ICs9ICcgJztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgKz0gd29yZFswXS50b1VwcGVyQ2FzZSgpICsgd29yZC5zbGljZSgxKS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgeyBzdGFydENhc2UgfTtcbiIsImZ1bmN0aW9uIHRyaW1FbmQoc3RyLCBjaGFycykge1xuICAgIGlmIChjaGFycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBzdHIudHJpbUVuZCgpO1xuICAgIH1cbiAgICBsZXQgZW5kSW5kZXggPSBzdHIubGVuZ3RoO1xuICAgIHN3aXRjaCAodHlwZW9mIGNoYXJzKSB7XG4gICAgICAgIGNhc2UgJ3N0cmluZyc6IHtcbiAgICAgICAgICAgIGlmIChjaGFycy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSAnY2hhcnMnIHBhcmFtZXRlciBzaG91bGQgYmUgYSBzaW5nbGUgY2hhcmFjdGVyIHN0cmluZy5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlIChlbmRJbmRleCA+IDAgJiYgc3RyW2VuZEluZGV4IC0gMV0gPT09IGNoYXJzKSB7XG4gICAgICAgICAgICAgICAgZW5kSW5kZXgtLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ29iamVjdCc6IHtcbiAgICAgICAgICAgIHdoaWxlIChlbmRJbmRleCA+IDAgJiYgY2hhcnMuaW5jbHVkZXMoc3RyW2VuZEluZGV4IC0gMV0pKSB7XG4gICAgICAgICAgICAgICAgZW5kSW5kZXgtLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3RyLnN1YnN0cmluZygwLCBlbmRJbmRleCk7XG59XG5cbmV4cG9ydCB7IHRyaW1FbmQgfTtcbiIsImZ1bmN0aW9uIHRyaW1TdGFydChzdHIsIGNoYXJzKSB7XG4gICAgaWYgKGNoYXJzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHN0ci50cmltU3RhcnQoKTtcbiAgICB9XG4gICAgbGV0IHN0YXJ0SW5kZXggPSAwO1xuICAgIHN3aXRjaCAodHlwZW9mIGNoYXJzKSB7XG4gICAgICAgIGNhc2UgJ3N0cmluZyc6IHtcbiAgICAgICAgICAgIHdoaWxlIChzdGFydEluZGV4IDwgc3RyLmxlbmd0aCAmJiBzdHJbc3RhcnRJbmRleF0gPT09IGNoYXJzKSB7XG4gICAgICAgICAgICAgICAgc3RhcnRJbmRleCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnb2JqZWN0Jzoge1xuICAgICAgICAgICAgd2hpbGUgKHN0YXJ0SW5kZXggPCBzdHIubGVuZ3RoICYmIGNoYXJzLmluY2x1ZGVzKHN0cltzdGFydEluZGV4XSkpIHtcbiAgICAgICAgICAgICAgICBzdGFydEluZGV4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0ci5zdWJzdHJpbmcoc3RhcnRJbmRleCk7XG59XG5cbmV4cG9ydCB7IHRyaW1TdGFydCB9O1xuIiwiaW1wb3J0IHsgdHJpbUVuZCB9IGZyb20gJy4vdHJpbUVuZC5tanMnO1xuaW1wb3J0IHsgdHJpbVN0YXJ0IH0gZnJvbSAnLi90cmltU3RhcnQubWpzJztcblxuZnVuY3Rpb24gdHJpbShzdHIsIGNoYXJzKSB7XG4gICAgaWYgKGNoYXJzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHN0ci50cmltKCk7XG4gICAgfVxuICAgIHJldHVybiB0cmltU3RhcnQodHJpbUVuZChzdHIsIGNoYXJzKSwgY2hhcnMpO1xufVxuXG5leHBvcnQgeyB0cmltIH07XG4iLCJjb25zdCBodG1sVW5lc2NhcGVzID0ge1xuICAgICcmYW1wOyc6ICcmJyxcbiAgICAnJmx0Oyc6ICc8JyxcbiAgICAnJmd0Oyc6ICc+JyxcbiAgICAnJnF1b3Q7JzogJ1wiJyxcbiAgICAnJiMzOTsnOiBcIidcIixcbn07XG5mdW5jdGlvbiB1bmVzY2FwZShzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyYoPzphbXB8bHR8Z3R8cXVvdHwjKDArKT8zOSk7L2csIG1hdGNoID0+IGh0bWxVbmVzY2FwZXNbbWF0Y2hdIHx8IFwiJ1wiKTtcbn1cblxuZXhwb3J0IHsgdW5lc2NhcGUgfTtcbiIsImltcG9ydCB7IHdvcmRzIH0gZnJvbSAnLi93b3Jkcy5tanMnO1xuXG5mdW5jdGlvbiB1cHBlckNhc2Uoc3RyKSB7XG4gICAgY29uc3Qgd29yZHMkMSA9IHdvcmRzKHN0cik7XG4gICAgbGV0IHJlc3VsdCA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd29yZHMkMS5sZW5ndGg7IGkrKykge1xuICAgICAgICByZXN1bHQgKz0gd29yZHMkMVtpXS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICBpZiAoaSA8IHdvcmRzJDEubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgcmVzdWx0ICs9ICcgJztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgeyB1cHBlckNhc2UgfTtcbiIsImZ1bmN0aW9uIHVwcGVyRmlyc3Qoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5zdWJzdHJpbmcoMCwgMSkudG9VcHBlckNhc2UoKSArIHN0ci5zdWJzdHJpbmcoMSk7XG59XG5cbmV4cG9ydCB7IHVwcGVyRmlyc3QgfTtcbiIsImZ1bmN0aW9uIGF0dGVtcHQoZnVuYykge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBbbnVsbCwgZnVuYygpXTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBbZXJyb3IsIG51bGxdO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgYXR0ZW1wdCB9O1xuIiwiYXN5bmMgZnVuY3Rpb24gYXR0ZW1wdEFzeW5jKGZ1bmMpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBmdW5jKCk7XG4gICAgICAgIHJldHVybiBbbnVsbCwgcmVzdWx0XTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBbZXJyb3IsIG51bGxdO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgYXR0ZW1wdEFzeW5jIH07XG4iLCJmdW5jdGlvbiBpbnZhcmlhbnQoY29uZGl0aW9uLCBtZXNzYWdlKSB7XG4gICAgaWYgKGNvbmRpdGlvbikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIH1cbiAgICB0aHJvdyBtZXNzYWdlO1xufVxuXG5leHBvcnQgeyBpbnZhcmlhbnQgfTtcbiIsImV4cG9ydCB7IGF0IH0gZnJvbSAnLi9hcnJheS9hdC5tanMnO1xuZXhwb3J0IHsgY2h1bmsgfSBmcm9tICcuL2FycmF5L2NodW5rLm1qcyc7XG5leHBvcnQgeyBjb21wYWN0IH0gZnJvbSAnLi9hcnJheS9jb21wYWN0Lm1qcyc7XG5leHBvcnQgeyBjb3VudEJ5IH0gZnJvbSAnLi9hcnJheS9jb3VudEJ5Lm1qcyc7XG5leHBvcnQgeyBkaWZmZXJlbmNlIH0gZnJvbSAnLi9hcnJheS9kaWZmZXJlbmNlLm1qcyc7XG5leHBvcnQgeyBkaWZmZXJlbmNlQnkgfSBmcm9tICcuL2FycmF5L2RpZmZlcmVuY2VCeS5tanMnO1xuZXhwb3J0IHsgZGlmZmVyZW5jZVdpdGggfSBmcm9tICcuL2FycmF5L2RpZmZlcmVuY2VXaXRoLm1qcyc7XG5leHBvcnQgeyBkcm9wIH0gZnJvbSAnLi9hcnJheS9kcm9wLm1qcyc7XG5leHBvcnQgeyBkcm9wUmlnaHQgfSBmcm9tICcuL2FycmF5L2Ryb3BSaWdodC5tanMnO1xuZXhwb3J0IHsgZHJvcFJpZ2h0V2hpbGUgfSBmcm9tICcuL2FycmF5L2Ryb3BSaWdodFdoaWxlLm1qcyc7XG5leHBvcnQgeyBkcm9wV2hpbGUgfSBmcm9tICcuL2FycmF5L2Ryb3BXaGlsZS5tanMnO1xuZXhwb3J0IHsgZmlsbCB9IGZyb20gJy4vYXJyYXkvZmlsbC5tanMnO1xuZXhwb3J0IHsgZmxhdE1hcCB9IGZyb20gJy4vYXJyYXkvZmxhdE1hcC5tanMnO1xuZXhwb3J0IHsgZmxhdE1hcERlZXAgfSBmcm9tICcuL2FycmF5L2ZsYXRNYXBEZWVwLm1qcyc7XG5leHBvcnQgeyBmbGF0dGVuIH0gZnJvbSAnLi9hcnJheS9mbGF0dGVuLm1qcyc7XG5leHBvcnQgeyBmbGF0dGVuRGVlcCB9IGZyb20gJy4vYXJyYXkvZmxhdHRlbkRlZXAubWpzJztcbmV4cG9ydCB7IGZvckVhY2hSaWdodCB9IGZyb20gJy4vYXJyYXkvZm9yRWFjaFJpZ2h0Lm1qcyc7XG5leHBvcnQgeyBncm91cEJ5IH0gZnJvbSAnLi9hcnJheS9ncm91cEJ5Lm1qcyc7XG5leHBvcnQgeyBoZWFkIH0gZnJvbSAnLi9hcnJheS9oZWFkLm1qcyc7XG5leHBvcnQgeyBpbml0aWFsIH0gZnJvbSAnLi9hcnJheS9pbml0aWFsLm1qcyc7XG5leHBvcnQgeyBpbnRlcnNlY3Rpb24gfSBmcm9tICcuL2FycmF5L2ludGVyc2VjdGlvbi5tanMnO1xuZXhwb3J0IHsgaW50ZXJzZWN0aW9uQnkgfSBmcm9tICcuL2FycmF5L2ludGVyc2VjdGlvbkJ5Lm1qcyc7XG5leHBvcnQgeyBpbnRlcnNlY3Rpb25XaXRoIH0gZnJvbSAnLi9hcnJheS9pbnRlcnNlY3Rpb25XaXRoLm1qcyc7XG5leHBvcnQgeyBpc1N1YnNldCB9IGZyb20gJy4vYXJyYXkvaXNTdWJzZXQubWpzJztcbmV4cG9ydCB7IGlzU3Vic2V0V2l0aCB9IGZyb20gJy4vYXJyYXkvaXNTdWJzZXRXaXRoLm1qcyc7XG5leHBvcnQgeyBrZXlCeSB9IGZyb20gJy4vYXJyYXkva2V5QnkubWpzJztcbmV4cG9ydCB7IGxhc3QgfSBmcm9tICcuL2FycmF5L2xhc3QubWpzJztcbmV4cG9ydCB7IG1heEJ5IH0gZnJvbSAnLi9hcnJheS9tYXhCeS5tanMnO1xuZXhwb3J0IHsgbWluQnkgfSBmcm9tICcuL2FycmF5L21pbkJ5Lm1qcyc7XG5leHBvcnQgeyBvcmRlckJ5IH0gZnJvbSAnLi9hcnJheS9vcmRlckJ5Lm1qcyc7XG5leHBvcnQgeyBwYXJ0aXRpb24gfSBmcm9tICcuL2FycmF5L3BhcnRpdGlvbi5tanMnO1xuZXhwb3J0IHsgcHVsbCB9IGZyb20gJy4vYXJyYXkvcHVsbC5tanMnO1xuZXhwb3J0IHsgcHVsbEF0IH0gZnJvbSAnLi9hcnJheS9wdWxsQXQubWpzJztcbmV4cG9ydCB7IHJlbW92ZSB9IGZyb20gJy4vYXJyYXkvcmVtb3ZlLm1qcyc7XG5leHBvcnQgeyBzYW1wbGUgfSBmcm9tICcuL2FycmF5L3NhbXBsZS5tanMnO1xuZXhwb3J0IHsgc2FtcGxlU2l6ZSB9IGZyb20gJy4vYXJyYXkvc2FtcGxlU2l6ZS5tanMnO1xuZXhwb3J0IHsgc2h1ZmZsZSB9IGZyb20gJy4vYXJyYXkvc2h1ZmZsZS5tanMnO1xuZXhwb3J0IHsgc29ydEJ5IH0gZnJvbSAnLi9hcnJheS9zb3J0QnkubWpzJztcbmV4cG9ydCB7IHRhaWwgfSBmcm9tICcuL2FycmF5L3RhaWwubWpzJztcbmV4cG9ydCB7IHRha2UgfSBmcm9tICcuL2FycmF5L3Rha2UubWpzJztcbmV4cG9ydCB7IHRha2VSaWdodCB9IGZyb20gJy4vYXJyYXkvdGFrZVJpZ2h0Lm1qcyc7XG5leHBvcnQgeyB0YWtlUmlnaHRXaGlsZSB9IGZyb20gJy4vYXJyYXkvdGFrZVJpZ2h0V2hpbGUubWpzJztcbmV4cG9ydCB7IHRha2VXaGlsZSB9IGZyb20gJy4vYXJyYXkvdGFrZVdoaWxlLm1qcyc7XG5leHBvcnQgeyB0b0ZpbGxlZCB9IGZyb20gJy4vYXJyYXkvdG9GaWxsZWQubWpzJztcbmV4cG9ydCB7IHVuaW9uIH0gZnJvbSAnLi9hcnJheS91bmlvbi5tanMnO1xuZXhwb3J0IHsgdW5pb25CeSB9IGZyb20gJy4vYXJyYXkvdW5pb25CeS5tanMnO1xuZXhwb3J0IHsgdW5pb25XaXRoIH0gZnJvbSAnLi9hcnJheS91bmlvbldpdGgubWpzJztcbmV4cG9ydCB7IHVuaXEgfSBmcm9tICcuL2FycmF5L3VuaXEubWpzJztcbmV4cG9ydCB7IHVuaXFCeSB9IGZyb20gJy4vYXJyYXkvdW5pcUJ5Lm1qcyc7XG5leHBvcnQgeyB1bmlxV2l0aCB9IGZyb20gJy4vYXJyYXkvdW5pcVdpdGgubWpzJztcbmV4cG9ydCB7IHVuemlwIH0gZnJvbSAnLi9hcnJheS91bnppcC5tanMnO1xuZXhwb3J0IHsgdW56aXBXaXRoIH0gZnJvbSAnLi9hcnJheS91bnppcFdpdGgubWpzJztcbmV4cG9ydCB7IHdpbmRvd2VkIH0gZnJvbSAnLi9hcnJheS93aW5kb3dlZC5tanMnO1xuZXhwb3J0IHsgd2l0aG91dCB9IGZyb20gJy4vYXJyYXkvd2l0aG91dC5tanMnO1xuZXhwb3J0IHsgeG9yIH0gZnJvbSAnLi9hcnJheS94b3IubWpzJztcbmV4cG9ydCB7IHhvckJ5IH0gZnJvbSAnLi9hcnJheS94b3JCeS5tanMnO1xuZXhwb3J0IHsgeG9yV2l0aCB9IGZyb20gJy4vYXJyYXkveG9yV2l0aC5tanMnO1xuZXhwb3J0IHsgemlwIH0gZnJvbSAnLi9hcnJheS96aXAubWpzJztcbmV4cG9ydCB7IHppcE9iamVjdCB9IGZyb20gJy4vYXJyYXkvemlwT2JqZWN0Lm1qcyc7XG5leHBvcnQgeyB6aXBXaXRoIH0gZnJvbSAnLi9hcnJheS96aXBXaXRoLm1qcyc7XG5leHBvcnQgeyBBYm9ydEVycm9yIH0gZnJvbSAnLi9lcnJvci9BYm9ydEVycm9yLm1qcyc7XG5leHBvcnQgeyBUaW1lb3V0RXJyb3IgfSBmcm9tICcuL2Vycm9yL1RpbWVvdXRFcnJvci5tanMnO1xuZXhwb3J0IHsgYWZ0ZXIgfSBmcm9tICcuL2Z1bmN0aW9uL2FmdGVyLm1qcyc7XG5leHBvcnQgeyBhcnkgfSBmcm9tICcuL2Z1bmN0aW9uL2FyeS5tanMnO1xuZXhwb3J0IHsgYXN5bmNOb29wIH0gZnJvbSAnLi9mdW5jdGlvbi9hc3luY05vb3AubWpzJztcbmV4cG9ydCB7IGJlZm9yZSB9IGZyb20gJy4vZnVuY3Rpb24vYmVmb3JlLm1qcyc7XG5leHBvcnQgeyBjdXJyeSB9IGZyb20gJy4vZnVuY3Rpb24vY3VycnkubWpzJztcbmV4cG9ydCB7IGN1cnJ5UmlnaHQgfSBmcm9tICcuL2Z1bmN0aW9uL2N1cnJ5UmlnaHQubWpzJztcbmV4cG9ydCB7IGRlYm91bmNlIH0gZnJvbSAnLi9mdW5jdGlvbi9kZWJvdW5jZS5tanMnO1xuZXhwb3J0IHsgZmxvdyB9IGZyb20gJy4vZnVuY3Rpb24vZmxvdy5tanMnO1xuZXhwb3J0IHsgZmxvd1JpZ2h0IH0gZnJvbSAnLi9mdW5jdGlvbi9mbG93UmlnaHQubWpzJztcbmV4cG9ydCB7IGlkZW50aXR5IH0gZnJvbSAnLi9mdW5jdGlvbi9pZGVudGl0eS5tanMnO1xuZXhwb3J0IHsgbWVtb2l6ZSB9IGZyb20gJy4vZnVuY3Rpb24vbWVtb2l6ZS5tanMnO1xuZXhwb3J0IHsgbmVnYXRlIH0gZnJvbSAnLi9mdW5jdGlvbi9uZWdhdGUubWpzJztcbmV4cG9ydCB7IG5vb3AgfSBmcm9tICcuL2Z1bmN0aW9uL25vb3AubWpzJztcbmV4cG9ydCB7IG9uY2UgfSBmcm9tICcuL2Z1bmN0aW9uL29uY2UubWpzJztcbmV4cG9ydCB7IHBhcnRpYWwgfSBmcm9tICcuL2Z1bmN0aW9uL3BhcnRpYWwubWpzJztcbmV4cG9ydCB7IHBhcnRpYWxSaWdodCB9IGZyb20gJy4vZnVuY3Rpb24vcGFydGlhbFJpZ2h0Lm1qcyc7XG5leHBvcnQgeyByZXN0IH0gZnJvbSAnLi9mdW5jdGlvbi9yZXN0Lm1qcyc7XG5leHBvcnQgeyByZXRyeSB9IGZyb20gJy4vZnVuY3Rpb24vcmV0cnkubWpzJztcbmV4cG9ydCB7IHNwcmVhZCB9IGZyb20gJy4vZnVuY3Rpb24vc3ByZWFkLm1qcyc7XG5leHBvcnQgeyB0aHJvdHRsZSB9IGZyb20gJy4vZnVuY3Rpb24vdGhyb3R0bGUubWpzJztcbmV4cG9ydCB7IHVuYXJ5IH0gZnJvbSAnLi9mdW5jdGlvbi91bmFyeS5tanMnO1xuZXhwb3J0IHsgY2xhbXAgfSBmcm9tICcuL21hdGgvY2xhbXAubWpzJztcbmV4cG9ydCB7IGluUmFuZ2UgfSBmcm9tICcuL21hdGgvaW5SYW5nZS5tanMnO1xuZXhwb3J0IHsgbWVhbiB9IGZyb20gJy4vbWF0aC9tZWFuLm1qcyc7XG5leHBvcnQgeyBtZWFuQnkgfSBmcm9tICcuL21hdGgvbWVhbkJ5Lm1qcyc7XG5leHBvcnQgeyBtZWRpYW4gfSBmcm9tICcuL21hdGgvbWVkaWFuLm1qcyc7XG5leHBvcnQgeyBtZWRpYW5CeSB9IGZyb20gJy4vbWF0aC9tZWRpYW5CeS5tanMnO1xuZXhwb3J0IHsgcmFuZG9tIH0gZnJvbSAnLi9tYXRoL3JhbmRvbS5tanMnO1xuZXhwb3J0IHsgcmFuZG9tSW50IH0gZnJvbSAnLi9tYXRoL3JhbmRvbUludC5tanMnO1xuZXhwb3J0IHsgcmFuZ2UgfSBmcm9tICcuL21hdGgvcmFuZ2UubWpzJztcbmV4cG9ydCB7IHJhbmdlUmlnaHQgfSBmcm9tICcuL21hdGgvcmFuZ2VSaWdodC5tanMnO1xuZXhwb3J0IHsgcm91bmQgfSBmcm9tICcuL21hdGgvcm91bmQubWpzJztcbmV4cG9ydCB7IHN1bSB9IGZyb20gJy4vbWF0aC9zdW0ubWpzJztcbmV4cG9ydCB7IHN1bUJ5IH0gZnJvbSAnLi9tYXRoL3N1bUJ5Lm1qcyc7XG5leHBvcnQgeyBjbG9uZSB9IGZyb20gJy4vb2JqZWN0L2Nsb25lLm1qcyc7XG5leHBvcnQgeyBjbG9uZURlZXAgfSBmcm9tICcuL29iamVjdC9jbG9uZURlZXAubWpzJztcbmV4cG9ydCB7IGNsb25lRGVlcFdpdGggfSBmcm9tICcuL29iamVjdC9jbG9uZURlZXBXaXRoLm1qcyc7XG5leHBvcnQgeyBmaW5kS2V5IH0gZnJvbSAnLi9vYmplY3QvZmluZEtleS5tanMnO1xuZXhwb3J0IHsgZmxhdHRlbk9iamVjdCB9IGZyb20gJy4vb2JqZWN0L2ZsYXR0ZW5PYmplY3QubWpzJztcbmV4cG9ydCB7IGludmVydCB9IGZyb20gJy4vb2JqZWN0L2ludmVydC5tanMnO1xuZXhwb3J0IHsgbWFwS2V5cyB9IGZyb20gJy4vb2JqZWN0L21hcEtleXMubWpzJztcbmV4cG9ydCB7IG1hcFZhbHVlcyB9IGZyb20gJy4vb2JqZWN0L21hcFZhbHVlcy5tanMnO1xuZXhwb3J0IHsgbWVyZ2UgfSBmcm9tICcuL29iamVjdC9tZXJnZS5tanMnO1xuZXhwb3J0IHsgbWVyZ2VXaXRoIH0gZnJvbSAnLi9vYmplY3QvbWVyZ2VXaXRoLm1qcyc7XG5leHBvcnQgeyBvbWl0IH0gZnJvbSAnLi9vYmplY3Qvb21pdC5tanMnO1xuZXhwb3J0IHsgb21pdEJ5IH0gZnJvbSAnLi9vYmplY3Qvb21pdEJ5Lm1qcyc7XG5leHBvcnQgeyBwaWNrIH0gZnJvbSAnLi9vYmplY3QvcGljay5tanMnO1xuZXhwb3J0IHsgcGlja0J5IH0gZnJvbSAnLi9vYmplY3QvcGlja0J5Lm1qcyc7XG5leHBvcnQgeyB0b0NhbWVsQ2FzZUtleXMgfSBmcm9tICcuL29iamVjdC90b0NhbWVsQ2FzZUtleXMubWpzJztcbmV4cG9ydCB7IHRvTWVyZ2VkIH0gZnJvbSAnLi9vYmplY3QvdG9NZXJnZWQubWpzJztcbmV4cG9ydCB7IHRvU25ha2VDYXNlS2V5cyB9IGZyb20gJy4vb2JqZWN0L3RvU25ha2VDYXNlS2V5cy5tanMnO1xuZXhwb3J0IHsgaXNBcnJheUJ1ZmZlciB9IGZyb20gJy4vcHJlZGljYXRlL2lzQXJyYXlCdWZmZXIubWpzJztcbmV4cG9ydCB7IGlzQmxvYiB9IGZyb20gJy4vcHJlZGljYXRlL2lzQmxvYi5tanMnO1xuZXhwb3J0IHsgaXNCb29sZWFuIH0gZnJvbSAnLi9wcmVkaWNhdGUvaXNCb29sZWFuLm1qcyc7XG5leHBvcnQgeyBpc0Jyb3dzZXIgfSBmcm9tICcuL3ByZWRpY2F0ZS9pc0Jyb3dzZXIubWpzJztcbmV4cG9ydCB7IGlzQnVmZmVyIH0gZnJvbSAnLi9wcmVkaWNhdGUvaXNCdWZmZXIubWpzJztcbmV4cG9ydCB7IGlzRGF0ZSB9IGZyb20gJy4vcHJlZGljYXRlL2lzRGF0ZS5tanMnO1xuZXhwb3J0IHsgaXNFcXVhbCB9IGZyb20gJy4vcHJlZGljYXRlL2lzRXF1YWwubWpzJztcbmV4cG9ydCB7IGlzRXF1YWxXaXRoIH0gZnJvbSAnLi9wcmVkaWNhdGUvaXNFcXVhbFdpdGgubWpzJztcbmV4cG9ydCB7IGlzRXJyb3IgfSBmcm9tICcuL3ByZWRpY2F0ZS9pc0Vycm9yLm1qcyc7XG5leHBvcnQgeyBpc0ZpbGUgfSBmcm9tICcuL3ByZWRpY2F0ZS9pc0ZpbGUubWpzJztcbmV4cG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICcuL3ByZWRpY2F0ZS9pc0Z1bmN0aW9uLm1qcyc7XG5leHBvcnQgeyBpc0pTT04gfSBmcm9tICcuL3ByZWRpY2F0ZS9pc0pTT04ubWpzJztcbmV4cG9ydCB7IGlzSlNPTkFycmF5LCBpc0pTT05PYmplY3QsIGlzSlNPTlZhbHVlIH0gZnJvbSAnLi9wcmVkaWNhdGUvaXNKU09OVmFsdWUubWpzJztcbmV4cG9ydCB7IGlzTGVuZ3RoIH0gZnJvbSAnLi9wcmVkaWNhdGUvaXNMZW5ndGgubWpzJztcbmV4cG9ydCB7IGlzTWFwIH0gZnJvbSAnLi9wcmVkaWNhdGUvaXNNYXAubWpzJztcbmV4cG9ydCB7IGlzTmlsIH0gZnJvbSAnLi9wcmVkaWNhdGUvaXNOaWwubWpzJztcbmV4cG9ydCB7IGlzTm9kZSB9IGZyb20gJy4vcHJlZGljYXRlL2lzTm9kZS5tanMnO1xuZXhwb3J0IHsgaXNOb3ROaWwgfSBmcm9tICcuL3ByZWRpY2F0ZS9pc05vdE5pbC5tanMnO1xuZXhwb3J0IHsgaXNOdWxsIH0gZnJvbSAnLi9wcmVkaWNhdGUvaXNOdWxsLm1qcyc7XG5leHBvcnQgeyBpc1BsYWluT2JqZWN0IH0gZnJvbSAnLi9wcmVkaWNhdGUvaXNQbGFpbk9iamVjdC5tanMnO1xuZXhwb3J0IHsgaXNQcmltaXRpdmUgfSBmcm9tICcuL3ByZWRpY2F0ZS9pc1ByaW1pdGl2ZS5tanMnO1xuZXhwb3J0IHsgaXNQcm9taXNlIH0gZnJvbSAnLi9wcmVkaWNhdGUvaXNQcm9taXNlLm1qcyc7XG5leHBvcnQgeyBpc1JlZ0V4cCB9IGZyb20gJy4vcHJlZGljYXRlL2lzUmVnRXhwLm1qcyc7XG5leHBvcnQgeyBpc1NldCB9IGZyb20gJy4vcHJlZGljYXRlL2lzU2V0Lm1qcyc7XG5leHBvcnQgeyBpc1N0cmluZyB9IGZyb20gJy4vcHJlZGljYXRlL2lzU3RyaW5nLm1qcyc7XG5leHBvcnQgeyBpc1N5bWJvbCB9IGZyb20gJy4vcHJlZGljYXRlL2lzU3ltYm9sLm1qcyc7XG5leHBvcnQgeyBpc1R5cGVkQXJyYXkgfSBmcm9tICcuL3ByZWRpY2F0ZS9pc1R5cGVkQXJyYXkubWpzJztcbmV4cG9ydCB7IGlzVW5kZWZpbmVkIH0gZnJvbSAnLi9wcmVkaWNhdGUvaXNVbmRlZmluZWQubWpzJztcbmV4cG9ydCB7IGlzV2Vha01hcCB9IGZyb20gJy4vcHJlZGljYXRlL2lzV2Vha01hcC5tanMnO1xuZXhwb3J0IHsgaXNXZWFrU2V0IH0gZnJvbSAnLi9wcmVkaWNhdGUvaXNXZWFrU2V0Lm1qcyc7XG5leHBvcnQgeyBkZWxheSB9IGZyb20gJy4vcHJvbWlzZS9kZWxheS5tanMnO1xuZXhwb3J0IHsgTXV0ZXggfSBmcm9tICcuL3Byb21pc2UvbXV0ZXgubWpzJztcbmV4cG9ydCB7IFNlbWFwaG9yZSB9IGZyb20gJy4vcHJvbWlzZS9zZW1hcGhvcmUubWpzJztcbmV4cG9ydCB7IHRpbWVvdXQgfSBmcm9tICcuL3Byb21pc2UvdGltZW91dC5tanMnO1xuZXhwb3J0IHsgd2l0aFRpbWVvdXQgfSBmcm9tICcuL3Byb21pc2Uvd2l0aFRpbWVvdXQubWpzJztcbmV4cG9ydCB7IGNhbWVsQ2FzZSB9IGZyb20gJy4vc3RyaW5nL2NhbWVsQ2FzZS5tanMnO1xuZXhwb3J0IHsgY2FwaXRhbGl6ZSB9IGZyb20gJy4vc3RyaW5nL2NhcGl0YWxpemUubWpzJztcbmV4cG9ydCB7IGNvbnN0YW50Q2FzZSB9IGZyb20gJy4vc3RyaW5nL2NvbnN0YW50Q2FzZS5tanMnO1xuZXhwb3J0IHsgZGVidXJyIH0gZnJvbSAnLi9zdHJpbmcvZGVidXJyLm1qcyc7XG5leHBvcnQgeyBlc2NhcGUgfSBmcm9tICcuL3N0cmluZy9lc2NhcGUubWpzJztcbmV4cG9ydCB7IGVzY2FwZVJlZ0V4cCB9IGZyb20gJy4vc3RyaW5nL2VzY2FwZVJlZ0V4cC5tanMnO1xuZXhwb3J0IHsga2ViYWJDYXNlIH0gZnJvbSAnLi9zdHJpbmcva2ViYWJDYXNlLm1qcyc7XG5leHBvcnQgeyBsb3dlckNhc2UgfSBmcm9tICcuL3N0cmluZy9sb3dlckNhc2UubWpzJztcbmV4cG9ydCB7IGxvd2VyRmlyc3QgfSBmcm9tICcuL3N0cmluZy9sb3dlckZpcnN0Lm1qcyc7XG5leHBvcnQgeyBwYWQgfSBmcm9tICcuL3N0cmluZy9wYWQubWpzJztcbmV4cG9ydCB7IHBhc2NhbENhc2UgfSBmcm9tICcuL3N0cmluZy9wYXNjYWxDYXNlLm1qcyc7XG5leHBvcnQgeyByZXZlcnNlU3RyaW5nIH0gZnJvbSAnLi9zdHJpbmcvcmV2ZXJzZVN0cmluZy5tanMnO1xuZXhwb3J0IHsgc25ha2VDYXNlIH0gZnJvbSAnLi9zdHJpbmcvc25ha2VDYXNlLm1qcyc7XG5leHBvcnQgeyBzdGFydENhc2UgfSBmcm9tICcuL3N0cmluZy9zdGFydENhc2UubWpzJztcbmV4cG9ydCB7IHRyaW0gfSBmcm9tICcuL3N0cmluZy90cmltLm1qcyc7XG5leHBvcnQgeyB0cmltRW5kIH0gZnJvbSAnLi9zdHJpbmcvdHJpbUVuZC5tanMnO1xuZXhwb3J0IHsgdHJpbVN0YXJ0IH0gZnJvbSAnLi9zdHJpbmcvdHJpbVN0YXJ0Lm1qcyc7XG5leHBvcnQgeyB1bmVzY2FwZSB9IGZyb20gJy4vc3RyaW5nL3VuZXNjYXBlLm1qcyc7XG5leHBvcnQgeyB1cHBlckNhc2UgfSBmcm9tICcuL3N0cmluZy91cHBlckNhc2UubWpzJztcbmV4cG9ydCB7IHVwcGVyRmlyc3QgfSBmcm9tICcuL3N0cmluZy91cHBlckZpcnN0Lm1qcyc7XG5leHBvcnQgeyB3b3JkcyB9IGZyb20gJy4vc3RyaW5nL3dvcmRzLm1qcyc7XG5leHBvcnQgeyBhdHRlbXB0IH0gZnJvbSAnLi91dGlsL2F0dGVtcHQubWpzJztcbmV4cG9ydCB7IGF0dGVtcHRBc3luYyB9IGZyb20gJy4vdXRpbC9hdHRlbXB0QXN5bmMubWpzJztcbmV4cG9ydCB7IGludmFyaWFudCBhcyBhc3NlcnQsIGludmFyaWFudCB9IGZyb20gJy4vdXRpbC9pbnZhcmlhbnQubWpzJztcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmNvbnN0IGRlYm91bmNlJDEgPSByZXF1aXJlKCcuLi8uLi9mdW5jdGlvbi9kZWJvdW5jZS5qcycpO1xuXG5mdW5jdGlvbiBkZWJvdW5jZShmdW5jLCBkZWJvdW5jZU1zID0gMCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0Jykge1xuICAgICAgICBvcHRpb25zID0ge307XG4gICAgfVxuICAgIGNvbnN0IHsgbGVhZGluZyA9IGZhbHNlLCB0cmFpbGluZyA9IHRydWUsIG1heFdhaXQgfSA9IG9wdGlvbnM7XG4gICAgY29uc3QgZWRnZXMgPSBBcnJheSgyKTtcbiAgICBpZiAobGVhZGluZykge1xuICAgICAgICBlZGdlc1swXSA9ICdsZWFkaW5nJztcbiAgICB9XG4gICAgaWYgKHRyYWlsaW5nKSB7XG4gICAgICAgIGVkZ2VzWzFdID0gJ3RyYWlsaW5nJztcbiAgICB9XG4gICAgbGV0IHJlc3VsdCA9IHVuZGVmaW5lZDtcbiAgICBsZXQgcGVuZGluZ0F0ID0gbnVsbDtcbiAgICBjb25zdCBfZGVib3VuY2VkID0gZGVib3VuY2UkMS5kZWJvdW5jZShmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICBwZW5kaW5nQXQgPSBudWxsO1xuICAgIH0sIGRlYm91bmNlTXMsIHsgZWRnZXMgfSk7XG4gICAgY29uc3QgZGVib3VuY2VkID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKG1heFdhaXQgIT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKHBlbmRpbmdBdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHBlbmRpbmdBdCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIHBlbmRpbmdBdCA+PSBtYXhXYWl0KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgICBwZW5kaW5nQXQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIF9kZWJvdW5jZWQuY2FuY2VsKCk7XG4gICAgICAgICAgICAgICAgX2RlYm91bmNlZC5zY2hlZHVsZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgX2RlYm91bmNlZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIGNvbnN0IGZsdXNoID0gKCkgPT4ge1xuICAgICAgICBfZGVib3VuY2VkLmZsdXNoKCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICBkZWJvdW5jZWQuY2FuY2VsID0gX2RlYm91bmNlZC5jYW5jZWw7XG4gICAgZGVib3VuY2VkLmZsdXNoID0gZmx1c2g7XG4gICAgcmV0dXJuIGRlYm91bmNlZDtcbn1cblxuZXhwb3J0cy5kZWJvdW5jZSA9IGRlYm91bmNlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuY29uc3QgbWluQnkkMSA9IHJlcXVpcmUoJy4uLy4uL2FycmF5L21pbkJ5LmpzJyk7XG5jb25zdCBpZGVudGl0eSA9IHJlcXVpcmUoJy4uLy4uL2Z1bmN0aW9uL2lkZW50aXR5LmpzJyk7XG5jb25zdCBpdGVyYXRlZSA9IHJlcXVpcmUoJy4uL3V0aWwvaXRlcmF0ZWUuanMnKTtcblxuZnVuY3Rpb24gbWluQnkoaXRlbXMsIGl0ZXJhdGVlJDEpIHtcbiAgICBpZiAoaXRlbXMgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gbWluQnkkMS5taW5CeShBcnJheS5mcm9tKGl0ZW1zKSwgaXRlcmF0ZWUuaXRlcmF0ZWUoaXRlcmF0ZWUkMSA/PyBpZGVudGl0eS5pZGVudGl0eSkpO1xufVxuXG5leHBvcnRzLm1pbkJ5ID0gbWluQnk7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXG5jb25zdCBjbG9uZURlZXBXaXRoID0gcmVxdWlyZSgnLi9jbG9uZURlZXBXaXRoLmpzJyk7XG5cbmZ1bmN0aW9uIGNsb25lRGVlcChvYmopIHtcbiAgICByZXR1cm4gY2xvbmVEZWVwV2l0aC5jbG9uZURlZXBXaXRoKG9iaik7XG59XG5cbmV4cG9ydHMuY2xvbmVEZWVwID0gY2xvbmVEZWVwO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9kaXN0L2NvbXBhdC9mdW5jdGlvbi90aHJvdHRsZS5qcycpLnRocm90dGxlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuZnVuY3Rpb24gZmxhdHRlbihhcnIsIGRlcHRoID0gMSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGNvbnN0IGZsb29yZWREZXB0aCA9IE1hdGguZmxvb3IoZGVwdGgpO1xuICAgIGNvbnN0IHJlY3Vyc2l2ZSA9IChhcnIsIGN1cnJlbnREZXB0aCkgPT4ge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgaXRlbSA9IGFycltpXTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGl0ZW0pICYmIGN1cnJlbnREZXB0aCA8IGZsb29yZWREZXB0aCkge1xuICAgICAgICAgICAgICAgIHJlY3Vyc2l2ZShpdGVtLCBjdXJyZW50RGVwdGggKyAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICByZWN1cnNpdmUoYXJyLCAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnRzLmZsYXR0ZW4gPSBmbGF0dGVuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgZGVib3VuY2VNcywgeyBzaWduYWwsIGVkZ2VzIH0gPSB7fSkge1xuICAgIGxldCBwZW5kaW5nVGhpcyA9IHVuZGVmaW5lZDtcbiAgICBsZXQgcGVuZGluZ0FyZ3MgPSBudWxsO1xuICAgIGNvbnN0IGxlYWRpbmcgPSBlZGdlcyAhPSBudWxsICYmIGVkZ2VzLmluY2x1ZGVzKCdsZWFkaW5nJyk7XG4gICAgY29uc3QgdHJhaWxpbmcgPSBlZGdlcyA9PSBudWxsIHx8IGVkZ2VzLmluY2x1ZGVzKCd0cmFpbGluZycpO1xuICAgIGNvbnN0IGludm9rZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKHBlbmRpbmdBcmdzICE9PSBudWxsKSB7XG4gICAgICAgICAgICBmdW5jLmFwcGx5KHBlbmRpbmdUaGlzLCBwZW5kaW5nQXJncyk7XG4gICAgICAgICAgICBwZW5kaW5nVGhpcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHBlbmRpbmdBcmdzID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3Qgb25UaW1lckVuZCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRyYWlsaW5nKSB7XG4gICAgICAgICAgICBpbnZva2UoKTtcbiAgICAgICAgfVxuICAgICAgICBjYW5jZWwoKTtcbiAgICB9O1xuICAgIGxldCB0aW1lb3V0SWQgPSBudWxsO1xuICAgIGNvbnN0IHNjaGVkdWxlID0gKCkgPT4ge1xuICAgICAgICBpZiAodGltZW91dElkICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICB9XG4gICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGltZW91dElkID0gbnVsbDtcbiAgICAgICAgICAgIG9uVGltZXJFbmQoKTtcbiAgICAgICAgfSwgZGVib3VuY2VNcyk7XG4gICAgfTtcbiAgICBjb25zdCBjYW5jZWxUaW1lciA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRpbWVvdXRJZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICB0aW1lb3V0SWQgPSBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBjYW5jZWwgPSAoKSA9PiB7XG4gICAgICAgIGNhbmNlbFRpbWVyKCk7XG4gICAgICAgIHBlbmRpbmdUaGlzID0gdW5kZWZpbmVkO1xuICAgICAgICBwZW5kaW5nQXJncyA9IG51bGw7XG4gICAgfTtcbiAgICBjb25zdCBmbHVzaCA9ICgpID0+IHtcbiAgICAgICAgaW52b2tlKCk7XG4gICAgfTtcbiAgICBjb25zdCBkZWJvdW5jZWQgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICBpZiAoc2lnbmFsPy5hYm9ydGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcGVuZGluZ1RoaXMgPSB0aGlzO1xuICAgICAgICBwZW5kaW5nQXJncyA9IGFyZ3M7XG4gICAgICAgIGNvbnN0IGlzRmlyc3RDYWxsID0gdGltZW91dElkID09IG51bGw7XG4gICAgICAgIHNjaGVkdWxlKCk7XG4gICAgICAgIGlmIChsZWFkaW5nICYmIGlzRmlyc3RDYWxsKSB7XG4gICAgICAgICAgICBpbnZva2UoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgZGVib3VuY2VkLnNjaGVkdWxlID0gc2NoZWR1bGU7XG4gICAgZGVib3VuY2VkLmNhbmNlbCA9IGNhbmNlbDtcbiAgICBkZWJvdW5jZWQuZmx1c2ggPSBmbHVzaDtcbiAgICBzaWduYWw/LmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgY2FuY2VsLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgcmV0dXJuIGRlYm91bmNlZDtcbn1cblxuZXhwb3J0cy5kZWJvdW5jZSA9IGRlYm91bmNlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuY29uc3QgZ2V0ID0gcmVxdWlyZSgnLi9nZXQuanMnKTtcbmNvbnN0IGlzVW5zYWZlUHJvcGVydHkgPSByZXF1aXJlKCcuLi8uLi9faW50ZXJuYWwvaXNVbnNhZmVQcm9wZXJ0eS5qcycpO1xuY29uc3QgaXNEZWVwS2V5ID0gcmVxdWlyZSgnLi4vX2ludGVybmFsL2lzRGVlcEtleS5qcycpO1xuY29uc3QgdG9LZXkgPSByZXF1aXJlKCcuLi9faW50ZXJuYWwvdG9LZXkuanMnKTtcbmNvbnN0IHRvUGF0aCA9IHJlcXVpcmUoJy4uL3V0aWwvdG9QYXRoLmpzJyk7XG5cbmZ1bmN0aW9uIHVuc2V0KG9iaiwgcGF0aCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgc3dpdGNoICh0eXBlb2YgcGF0aCkge1xuICAgICAgICBjYXNlICdzeW1ib2wnOlxuICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICBjYXNlICdvYmplY3QnOiB7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwYXRoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bnNldFdpdGhQYXRoKG9iaiwgcGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgcGF0aCA9IHRvS2V5LnRvS2V5KHBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHBhdGggPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5pcyhwYXRoPy52YWx1ZU9mKCksIC0wKSkge1xuICAgICAgICAgICAgICAgICAgICBwYXRoID0gJy0wJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHBhdGggPSBTdHJpbmcocGF0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzVW5zYWZlUHJvcGVydHkuaXNVbnNhZmVQcm9wZXJ0eShwYXRoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvYmo/LltwYXRoXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBvYmpbcGF0aF07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3N0cmluZyc6IHtcbiAgICAgICAgICAgIGlmIChvYmo/LltwYXRoXSA9PT0gdW5kZWZpbmVkICYmIGlzRGVlcEtleS5pc0RlZXBLZXkocGF0aCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5zZXRXaXRoUGF0aChvYmosIHRvUGF0aC50b1BhdGgocGF0aCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzVW5zYWZlUHJvcGVydHkuaXNVbnNhZmVQcm9wZXJ0eShwYXRoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG9ialtwYXRoXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiB1bnNldFdpdGhQYXRoKG9iaiwgcGF0aCkge1xuICAgIGNvbnN0IHBhcmVudCA9IHBhdGgubGVuZ3RoID09PSAxID8gb2JqIDogZ2V0LmdldChvYmosIHBhdGguc2xpY2UoMCwgLTEpKTtcbiAgICBjb25zdCBsYXN0S2V5ID0gcGF0aFtwYXRoLmxlbmd0aCAtIDFdO1xuICAgIGlmIChwYXJlbnQ/LltsYXN0S2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoaXNVbnNhZmVQcm9wZXJ0eS5pc1Vuc2FmZVByb3BlcnR5KGxhc3RLZXkpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgZGVsZXRlIHBhcmVudFtsYXN0S2V5XTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuZXhwb3J0cy51bnNldCA9IHVuc2V0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuY29uc3QgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlLmpzJyk7XG5jb25zdCBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZS5qcycpO1xuXG5mdW5jdGlvbiBpc0FycmF5TGlrZU9iamVjdCh2YWx1ZSkge1xuICAgIHJldHVybiBpc09iamVjdExpa2UuaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBpc0FycmF5TGlrZS5pc0FycmF5TGlrZSh2YWx1ZSk7XG59XG5cbmV4cG9ydHMuaXNBcnJheUxpa2VPYmplY3QgPSBpc0FycmF5TGlrZU9iamVjdDtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmNvbnN0IGlzTGVuZ3RoID0gcmVxdWlyZSgnLi4vLi4vcHJlZGljYXRlL2lzTGVuZ3RoLmpzJyk7XG5cbmZ1bmN0aW9uIGlzQXJyYXlMaWtlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlICE9PSAnZnVuY3Rpb24nICYmIGlzTGVuZ3RoLmlzTGVuZ3RoKHZhbHVlLmxlbmd0aCk7XG59XG5cbmV4cG9ydHMuaXNBcnJheUxpa2UgPSBpc0FycmF5TGlrZTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vZGlzdC9jb21wYXQvb2JqZWN0L2dldC5qcycpLmdldDtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmNvbnN0IGdldFRhZyA9IHJlcXVpcmUoJy4uL19pbnRlcm5hbC9nZXRUYWcuanMnKTtcblxuZnVuY3Rpb24gaXNBcmd1bWVudHModmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiBnZXRUYWcuZ2V0VGFnKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG59XG5cbmV4cG9ydHMuaXNBcmd1bWVudHMgPSBpc0FyZ3VtZW50cztcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmNvbnN0IGdldCA9IHJlcXVpcmUoJy4vZ2V0LmpzJyk7XG5cbmZ1bmN0aW9uIHByb3BlcnR5KHBhdGgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgICAgICByZXR1cm4gZ2V0LmdldChvYmplY3QsIHBhdGgpO1xuICAgIH07XG59XG5cbmV4cG9ydHMucHJvcGVydHkgPSBwcm9wZXJ0eTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmZ1bmN0aW9uIGlzVHlwZWRBcnJheSh4KSB7XG4gICAgcmV0dXJuIEFycmF5QnVmZmVyLmlzVmlldyh4KSAmJiAhKHggaW5zdGFuY2VvZiBEYXRhVmlldyk7XG59XG5cbmV4cG9ydHMuaXNUeXBlZEFycmF5ID0gaXNUeXBlZEFycmF5O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuY29uc3QgaXNJdGVyYXRlZUNhbGwgPSByZXF1aXJlKCcuLi9faW50ZXJuYWwvaXNJdGVyYXRlZUNhbGwuanMnKTtcbmNvbnN0IHRvRmluaXRlID0gcmVxdWlyZSgnLi4vdXRpbC90b0Zpbml0ZS5qcycpO1xuXG5mdW5jdGlvbiByYW5nZShzdGFydCwgZW5kLCBzdGVwKSB7XG4gICAgaWYgKHN0ZXAgJiYgdHlwZW9mIHN0ZXAgIT09ICdudW1iZXInICYmIGlzSXRlcmF0ZWVDYWxsLmlzSXRlcmF0ZWVDYWxsKHN0YXJ0LCBlbmQsIHN0ZXApKSB7XG4gICAgICAgIGVuZCA9IHN0ZXAgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHN0YXJ0ID0gdG9GaW5pdGUudG9GaW5pdGUoc3RhcnQpO1xuICAgIGlmIChlbmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBlbmQgPSBzdGFydDtcbiAgICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZW5kID0gdG9GaW5pdGUudG9GaW5pdGUoZW5kKTtcbiAgICB9XG4gICAgc3RlcCA9IHN0ZXAgPT09IHVuZGVmaW5lZCA/IChzdGFydCA8IGVuZCA/IDEgOiAtMSkgOiB0b0Zpbml0ZS50b0Zpbml0ZShzdGVwKTtcbiAgICBjb25zdCBsZW5ndGggPSBNYXRoLm1heChNYXRoLmNlaWwoKGVuZCAtIHN0YXJ0KSAvIChzdGVwIHx8IDEpKSwgMCk7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gc3RhcnQ7XG4gICAgICAgIHN0YXJ0ICs9IHN0ZXA7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydHMucmFuZ2UgPSByYW5nZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cbmZ1bmN0aW9uIGdldFN5bWJvbHMob2JqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KS5maWx0ZXIoc3ltYm9sID0+IE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChvYmplY3QsIHN5bWJvbCkpO1xufVxuXG5leHBvcnRzLmdldFN5bWJvbHMgPSBnZXRTeW1ib2xzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuZnVuY3Rpb24gZXEodmFsdWUsIG90aGVyKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSBvdGhlciB8fCAoTnVtYmVyLmlzTmFOKHZhbHVlKSAmJiBOdW1iZXIuaXNOYU4ob3RoZXIpKTtcbn1cblxuZXhwb3J0cy5lcSA9IGVxO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuY29uc3QgaXNTeW1ib2wgPSByZXF1aXJlKCcuLi9wcmVkaWNhdGUvaXNTeW1ib2wuanMnKTtcblxuZnVuY3Rpb24gdG9OdW1iZXIodmFsdWUpIHtcbiAgICBpZiAoaXNTeW1ib2wuaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBOYU47XG4gICAgfVxuICAgIHJldHVybiBOdW1iZXIodmFsdWUpO1xufVxuXG5leHBvcnRzLnRvTnVtYmVyID0gdG9OdW1iZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXG5mdW5jdGlvbiBpc0J1ZmZlcih4KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIEJ1ZmZlci5pc0J1ZmZlcih4KTtcbn1cblxuZXhwb3J0cy5pc0J1ZmZlciA9IGlzQnVmZmVyO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9kaXN0L2NvbXBhdC9wcmVkaWNhdGUvaXNQbGFpbk9iamVjdC5qcycpLmlzUGxhaW5PYmplY3Q7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXG5jb25zdCBpdGVyYXRlZSA9IHJlcXVpcmUoJy4uL3V0aWwvaXRlcmF0ZWUuanMnKTtcblxuZnVuY3Rpb24gc3VtQnkoYXJyYXksIGl0ZXJhdGVlJDEpIHtcbiAgICBpZiAoIWFycmF5IHx8ICFhcnJheS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGlmIChpdGVyYXRlZSQxICE9IG51bGwpIHtcbiAgICAgICAgaXRlcmF0ZWUkMSA9IGl0ZXJhdGVlLml0ZXJhdGVlKGl0ZXJhdGVlJDEpO1xuICAgIH1cbiAgICBsZXQgcmVzdWx0ID0gdW5kZWZpbmVkO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IGl0ZXJhdGVlJDEgPyBpdGVyYXRlZSQxKGFycmF5W2ldKSA6IGFycmF5W2ldO1xuICAgICAgICBpZiAoY3VycmVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBjdXJyZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IGN1cnJlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0cy5zdW1CeSA9IHN1bUJ5O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuY29uc3QgaXNTeW1ib2wgPSByZXF1aXJlKCcuLi9wcmVkaWNhdGUvaXNTeW1ib2wuanMnKTtcblxuY29uc3QgcmVnZXhJc0RlZXBQcm9wID0gL1xcLnxcXFsoPzpbXltcXF1dKnwoW1wiJ10pKD86KD8hXFwxKVteXFxcXF18XFxcXC4pKj9cXDEpXFxdLztcbmNvbnN0IHJlZ2V4SXNQbGFpblByb3AgPSAvXlxcdyokLztcbmZ1bmN0aW9uIGlzS2V5KHZhbHVlLCBvYmplY3QpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJyB8fCB2YWx1ZSA9PSBudWxsIHx8IGlzU3ltYm9sLmlzU3ltYm9sKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuICgodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiAocmVnZXhJc1BsYWluUHJvcC50ZXN0KHZhbHVlKSB8fCAhcmVnZXhJc0RlZXBQcm9wLnRlc3QodmFsdWUpKSkgfHxcbiAgICAgICAgKG9iamVjdCAhPSBudWxsICYmIE9iamVjdC5oYXNPd24ob2JqZWN0LCB2YWx1ZSkpKTtcbn1cblxuZXhwb3J0cy5pc0tleSA9IGlzS2V5O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9kaXN0L2NvbXBhdC9tYXRoL21heEJ5LmpzJykubWF4Qnk7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXG5mdW5jdGlvbiBpc0RlZXBLZXkoa2V5KSB7XG4gICAgc3dpdGNoICh0eXBlb2Yga2V5KSB7XG4gICAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICAgIGNhc2UgJ3N5bWJvbCc6IHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdzdHJpbmcnOiB7XG4gICAgICAgICAgICByZXR1cm4ga2V5LmluY2x1ZGVzKCcuJykgfHwga2V5LmluY2x1ZGVzKCdbJykgfHwga2V5LmluY2x1ZGVzKCddJyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydHMuaXNEZWVwS2V5ID0gaXNEZWVwS2V5O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblxuY29uc3QgcmVnZXhwVGFnID0gJ1tvYmplY3QgUmVnRXhwXSc7XG5jb25zdCBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJztcbmNvbnN0IG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nO1xuY29uc3QgYm9vbGVhblRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJztcbmNvbnN0IGFyZ3VtZW50c1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuY29uc3Qgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXSc7XG5jb25zdCBkYXRlVGFnID0gJ1tvYmplY3QgRGF0ZV0nO1xuY29uc3QgbWFwVGFnID0gJ1tvYmplY3QgTWFwXSc7XG5jb25zdCBzZXRUYWcgPSAnW29iamVjdCBTZXRdJztcbmNvbnN0IGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJztcbmNvbnN0IGZ1bmN0aW9uVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbmNvbnN0IGFycmF5QnVmZmVyVGFnID0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbmNvbnN0IG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nO1xuY29uc3QgZXJyb3JUYWcgPSAnW29iamVjdCBFcnJvcl0nO1xuY29uc3QgZGF0YVZpZXdUYWcgPSAnW29iamVjdCBEYXRhVmlld10nO1xuY29uc3QgdWludDhBcnJheVRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJztcbmNvbnN0IHVpbnQ4Q2xhbXBlZEFycmF5VGFnID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJztcbmNvbnN0IHVpbnQxNkFycmF5VGFnID0gJ1tvYmplY3QgVWludDE2QXJyYXldJztcbmNvbnN0IHVpbnQzMkFycmF5VGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcbmNvbnN0IGJpZ1VpbnQ2NEFycmF5VGFnID0gJ1tvYmplY3QgQmlnVWludDY0QXJyYXldJztcbmNvbnN0IGludDhBcnJheVRhZyA9ICdbb2JqZWN0IEludDhBcnJheV0nO1xuY29uc3QgaW50MTZBcnJheVRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJztcbmNvbnN0IGludDMyQXJyYXlUYWcgPSAnW29iamVjdCBJbnQzMkFycmF5XSc7XG5jb25zdCBiaWdJbnQ2NEFycmF5VGFnID0gJ1tvYmplY3QgQmlnSW50NjRBcnJheV0nO1xuY29uc3QgZmxvYXQzMkFycmF5VGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XSc7XG5jb25zdCBmbG9hdDY0QXJyYXlUYWcgPSAnW29iamVjdCBGbG9hdDY0QXJyYXldJztcblxuZXhwb3J0cy5hcmd1bWVudHNUYWcgPSBhcmd1bWVudHNUYWc7XG5leHBvcnRzLmFycmF5QnVmZmVyVGFnID0gYXJyYXlCdWZmZXJUYWc7XG5leHBvcnRzLmFycmF5VGFnID0gYXJyYXlUYWc7XG5leHBvcnRzLmJpZ0ludDY0QXJyYXlUYWcgPSBiaWdJbnQ2NEFycmF5VGFnO1xuZXhwb3J0cy5iaWdVaW50NjRBcnJheVRhZyA9IGJpZ1VpbnQ2NEFycmF5VGFnO1xuZXhwb3J0cy5ib29sZWFuVGFnID0gYm9vbGVhblRhZztcbmV4cG9ydHMuZGF0YVZpZXdUYWcgPSBkYXRhVmlld1RhZztcbmV4cG9ydHMuZGF0ZVRhZyA9IGRhdGVUYWc7XG5leHBvcnRzLmVycm9yVGFnID0gZXJyb3JUYWc7XG5leHBvcnRzLmZsb2F0MzJBcnJheVRhZyA9IGZsb2F0MzJBcnJheVRhZztcbmV4cG9ydHMuZmxvYXQ2NEFycmF5VGFnID0gZmxvYXQ2NEFycmF5VGFnO1xuZXhwb3J0cy5mdW5jdGlvblRhZyA9IGZ1bmN0aW9uVGFnO1xuZXhwb3J0cy5pbnQxNkFycmF5VGFnID0gaW50MTZBcnJheVRhZztcbmV4cG9ydHMuaW50MzJBcnJheVRhZyA9IGludDMyQXJyYXlUYWc7XG5leHBvcnRzLmludDhBcnJheVRhZyA9IGludDhBcnJheVRhZztcbmV4cG9ydHMubWFwVGFnID0gbWFwVGFnO1xuZXhwb3J0cy5udW1iZXJUYWcgPSBudW1iZXJUYWc7XG5leHBvcnRzLm9iamVjdFRhZyA9IG9iamVjdFRhZztcbmV4cG9ydHMucmVnZXhwVGFnID0gcmVnZXhwVGFnO1xuZXhwb3J0cy5zZXRUYWcgPSBzZXRUYWc7XG5leHBvcnRzLnN0cmluZ1RhZyA9IHN0cmluZ1RhZztcbmV4cG9ydHMuc3ltYm9sVGFnID0gc3ltYm9sVGFnO1xuZXhwb3J0cy51aW50MTZBcnJheVRhZyA9IHVpbnQxNkFycmF5VGFnO1xuZXhwb3J0cy51aW50MzJBcnJheVRhZyA9IHVpbnQzMkFycmF5VGFnO1xuZXhwb3J0cy51aW50OEFycmF5VGFnID0gdWludDhBcnJheVRhZztcbmV4cG9ydHMudWludDhDbGFtcGVkQXJyYXlUYWcgPSB1aW50OENsYW1wZWRBcnJheVRhZztcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==