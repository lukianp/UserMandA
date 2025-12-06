"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[3794],{

/***/ 4058:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BV: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.BV),
/* harmony export */   GZ: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.GZ),
/* harmony export */   HR: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.HR),
/* harmony export */   IA: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.IA),
/* harmony export */   IJ: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.IJ),
/* harmony export */   Lx: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.Lx),
/* harmony export */   N8: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.N8),
/* harmony export */   PG: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.PG),
/* harmony export */   Re: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.Re),
/* harmony export */   UP: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.UP),
/* harmony export */   Wc: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.Wc),
/* harmony export */   Wi: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.Wi),
/* harmony export */   Xf: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.Xf),
/* harmony export */   YW: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.YW),
/* harmony export */   Yu: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.Yu),
/* harmony export */   ZK: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.ZK),
/* harmony export */   dy: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.dy),
/* harmony export */   e9: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.e9),
/* harmony export */   hK: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.hK),
/* harmony export */   j: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.j),
/* harmony export */   lU: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.lU),
/* harmony export */   n8: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.n8),
/* harmony export */   nV: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.nV),
/* harmony export */   qI: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.qI),
/* harmony export */   qr: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.qr),
/* harmony export */   rM: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.rM),
/* harmony export */   t$: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.t$),
/* harmony export */   ux: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.ux),
/* harmony export */   yD: () => (/* reexport safe */ d3_shape__WEBPACK_IMPORTED_MODULE_0__.yD)
/* harmony export */ });
/* harmony import */ var d3_shape__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(54924);

// `victory-vendor/d3-shape` (ESM)
// See upstream license: https://github.com/d3/d3-shape/blob/main/LICENSE
//
// Our ESM package uses the underlying installed dependencies of `node_modules/d3-shape`



/***/ }),

/***/ 6923:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* unused harmony export _ */
function _class_extract_field_descriptor(receiver, privateMap, action) {
    if (!privateMap.has(receiver)) throw new TypeError("attempted to " + action + " private field on non-instance");

    return privateMap.get(receiver);
}



/***/ }),

/***/ 9897:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   D: () => (/* binding */ immer)
/* harmony export */ });
/* harmony import */ var immer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1932);


const immerImpl = (initializer) => (set, get, store) => {
  store.setState = (updater, replace, ...args) => {
    const nextState = typeof updater === "function" ? (0,immer__WEBPACK_IMPORTED_MODULE_0__/* .produce */ .jM)(updater) : updater;
    return set(nextState, replace, ...args);
  };
  return initializer(store.setState, get, store);
};
const immer = immerImpl;




/***/ }),

/***/ 10540:
/***/ ((module) => {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ 11561:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ invariant)
/* harmony export */ });
var isProduction = "development" === 'production';
var prefix = 'Invariant failed';
function invariant(condition, message) {
    if (condition) {
        return;
    }
    if (isProduction) {
        throw new Error(prefix);
    }
    var provided = typeof message === 'function' ? message() : message;
    var value = provided ? "".concat(prefix, ": ").concat(provided) : prefix;
    throw new Error(value);
}




/***/ }),

/***/ 19888:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



if (false) // removed by dead control flow
{} else {
  module.exports = __webpack_require__(85845);
}


/***/ }),

/***/ 34635:
/***/ ((module) => {



var defaultParseOptions = {
  decodeValues: true,
  map: false,
  silent: false,
};

function isForbiddenKey(key) {
  return typeof key !== "string" || key in {};
}

function createNullObj() {
  return Object.create(null);
}

function isNonEmptyString(str) {
  return typeof str === "string" && !!str.trim();
}

function parseString(setCookieValue, options) {
  var parts = setCookieValue.split(";").filter(isNonEmptyString);

  var nameValuePairStr = parts.shift();
  var parsed = parseNameValuePair(nameValuePairStr);
  var name = parsed.name;
  var value = parsed.value;

  options = options
    ? Object.assign({}, defaultParseOptions, options)
    : defaultParseOptions;

  if (isForbiddenKey(name)) {
    return null;
  }

  try {
    value = options.decodeValues ? decodeURIComponent(value) : value; // decode cookie value
  } catch (e) {
    console.error(
      "set-cookie-parser: failed to decode cookie value. Set options.decodeValues=false to disable decoding.",
      e
    );
  }

  var cookie = createNullObj();
  cookie.name = name;
  cookie.value = value;

  parts.forEach(function (part) {
    var sides = part.split("=");
    var key = sides.shift().trimLeft().toLowerCase();
    if (isForbiddenKey(key)) {
      return;
    }
    var value = sides.join("=");
    if (key === "expires") {
      cookie.expires = new Date(value);
    } else if (key === "max-age") {
      var n = parseInt(value, 10);
      if (!Number.isNaN(n)) cookie.maxAge = n;
    } else if (key === "secure") {
      cookie.secure = true;
    } else if (key === "httponly") {
      cookie.httpOnly = true;
    } else if (key === "samesite") {
      cookie.sameSite = value;
    } else if (key === "partitioned") {
      cookie.partitioned = true;
    } else if (key) {
      cookie[key] = value;
    }
  });

  return cookie;
}

function parseNameValuePair(nameValuePairStr) {
  // Parses name-value-pair according to rfc6265bis draft

  var name = "";
  var value = "";
  var nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift();
    value = nameValueArr.join("="); // everything after the first =, joined by a "=" if there was more than one part
  } else {
    value = nameValuePairStr;
  }

  return { name: name, value: value };
}

function parse(input, options) {
  options = options
    ? Object.assign({}, defaultParseOptions, options)
    : defaultParseOptions;

  if (!input) {
    if (!options.map) {
      return [];
    } else {
      return createNullObj();
    }
  }

  if (input.headers) {
    if (typeof input.headers.getSetCookie === "function") {
      // for fetch responses - they combine headers of the same type in the headers array,
      // but getSetCookie returns an uncombined array
      input = input.headers.getSetCookie();
    } else if (input.headers["set-cookie"]) {
      // fast-path for node.js (which automatically normalizes header names to lower-case)
      input = input.headers["set-cookie"];
    } else {
      // slow-path for other environments - see #25
      var sch =
        input.headers[
          Object.keys(input.headers).find(function (key) {
            return key.toLowerCase() === "set-cookie";
          })
        ];
      // warn if called on a request-like object with a cookie header rather than a set-cookie header - see #34, 36
      if (!sch && input.headers.cookie && !options.silent) {
        console.warn(
          "Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning."
        );
      }
      input = sch;
    }
  }
  if (!Array.isArray(input)) {
    input = [input];
  }

  if (!options.map) {
    return input
      .filter(isNonEmptyString)
      .map(function (str) {
        return parseString(str, options);
      })
      .filter(Boolean);
  } else {
    var cookies = createNullObj();
    return input.filter(isNonEmptyString).reduce(function (cookies, str) {
      var cookie = parseString(str, options);
      if (cookie && !isForbiddenKey(cookie.name)) {
        cookies[cookie.name] = cookie;
      }
      return cookies;
    }, cookies);
  }
}

/*
  Set-Cookie header field-values are sometimes comma joined in one string. This splits them without choking on commas
  that are within a single set-cookie field-value, such as in the Expires portion.

  This is uncommon, but explicitly allowed - see https://tools.ietf.org/html/rfc2616#section-4.2
  Node.js does this for every header *except* set-cookie - see https://github.com/nodejs/node/blob/d5e363b77ebaf1caf67cd7528224b651c86815c1/lib/_http_incoming.js#L128
  React Native's fetch does this for *every* header, including set-cookie.

  Based on: https://github.com/google/j2objc/commit/16820fdbc8f76ca0c33472810ce0cb03d20efe25
  Credits to: https://github.com/tomball for original and https://github.com/chrusart for JavaScript implementation
*/
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString;
  }
  if (typeof cookiesString !== "string") {
    return [];
  }

  var cookiesStrings = [];
  var pos = 0;
  var start;
  var ch;
  var lastComma;
  var nextStart;
  var cookiesSeparatorFound;

  function skipWhitespace() {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  }

  function notSpecialChar() {
    ch = cookiesString.charAt(pos);

    return ch !== "=" && ch !== ";" && ch !== ",";
  }

  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;

    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        // ',' is a cookie separator if we have later first '=', not ';' or ','
        lastComma = pos;
        pos += 1;

        skipWhitespace();
        nextStart = pos;

        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }

        // currently special character
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          // we found cookies separator
          cookiesSeparatorFound = true;
          // pos is inside the next cookie, so back up and return it.
          pos = nextStart;
          cookiesStrings.push(cookiesString.substring(start, lastComma));
          start = pos;
        } else {
          // in param ',' or param separator ';',
          // we continue from that comma
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }

    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
    }
  }

  return cookiesStrings;
}

module.exports = parse;
module.exports.parse = parse;
module.exports.parseString = parseString;
module.exports.splitCookiesString = splitCookiesString;


/***/ }),

/***/ 39625:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   scaleBand: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.WH),
/* harmony export */   scaleDiverging: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.Mb),
/* harmony export */   scaleDivergingLog: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.Cr),
/* harmony export */   scaleDivergingPow: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.yj),
/* harmony export */   scaleDivergingSqrt: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.q9),
/* harmony export */   scaleDivergingSymlog: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.xh),
/* harmony export */   scaleIdentity: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.jo),
/* harmony export */   scaleImplicit: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.U4),
/* harmony export */   scaleLinear: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.m4),
/* harmony export */   scaleLog: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.ZE),
/* harmony export */   scaleOrdinal: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.UM),
/* harmony export */   scalePoint: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.hq),
/* harmony export */   scalePow: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.RW),
/* harmony export */   scaleQuantile: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.QL),
/* harmony export */   scaleQuantize: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.WT),
/* harmony export */   scaleRadial: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.af),
/* harmony export */   scaleSequential: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.ex),
/* harmony export */   scaleSequentialLog: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.M3),
/* harmony export */   scaleSequentialPow: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.ui),
/* harmony export */   scaleSequentialQuantile: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.T),
/* harmony export */   scaleSequentialSqrt: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.ye),
/* harmony export */   scaleSequentialSymlog: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.nV),
/* harmony export */   scaleSqrt: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.Bv),
/* harmony export */   scaleSymlog: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.aX),
/* harmony export */   scaleThreshold: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.c3),
/* harmony export */   scaleTime: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.w7),
/* harmony export */   scaleUtc: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.Pp),
/* harmony export */   tickFormat: () => (/* reexport safe */ d3_scale__WEBPACK_IMPORTED_MODULE_0__.Vr)
/* harmony export */ });
/* harmony import */ var d3_scale__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(16199);

// `victory-vendor/d3-scale` (ESM)
// See upstream license: https://github.com/d3/d3-scale/blob/main/LICENSE
//
// Our ESM package uses the underlying installed dependencies of `node_modules/d3-scale`



/***/ }),

/***/ 41113:
/***/ ((module) => {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ }),

/***/ 49054:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* unused harmony exports focusable, getTabIndex, isFocusable, isTabbable, tabbable */
/*!
* tabbable 6.3.0
* @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
*/
// NOTE: separate `:not()` selectors has broader browser support than the newer
//  `:not([inert], [inert] *)` (Feb 2023)
// CAREFUL: JSDom does not support `:not([inert] *)` as a selector; using it causes
//  the entire query to fail, resulting in no nodes found, which will break a lot
//  of things... so we have to rely on JS to identify nodes inside an inert container
var candidateSelectors = (/* unused pure expression or super */ null && (['input:not([inert])', 'select:not([inert])', 'textarea:not([inert])', 'a[href]:not([inert])', 'button:not([inert])', '[tabindex]:not(slot):not([inert])', 'audio[controls]:not([inert])', 'video[controls]:not([inert])', '[contenteditable]:not([contenteditable="false"]):not([inert])', 'details>summary:first-of-type:not([inert])', 'details:not([inert])']));
var candidateSelector = /* #__PURE__ */(/* unused pure expression or super */ null && (candidateSelectors.join(',')));
var NoElement = typeof Element === 'undefined';
var matches = NoElement ? function () {} : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
var getRootNode = !NoElement && Element.prototype.getRootNode ? function (element) {
  var _element$getRootNode;
  return element === null || element === void 0 ? void 0 : (_element$getRootNode = element.getRootNode) === null || _element$getRootNode === void 0 ? void 0 : _element$getRootNode.call(element);
} : function (element) {
  return element === null || element === void 0 ? void 0 : element.ownerDocument;
};

/**
 * Determines if a node is inert or in an inert ancestor.
 * @param {Element} [node]
 * @param {boolean} [lookUp] If true and `node` is not inert, looks up at ancestors to
 *  see if any of them are inert. If false, only `node` itself is considered.
 * @returns {boolean} True if inert itself or by way of being in an inert ancestor.
 *  False if `node` is falsy.
 */
var _isInert = function isInert(node, lookUp) {
  var _node$getAttribute;
  if (lookUp === void 0) {
    lookUp = true;
  }
  // CAREFUL: JSDom does not support inert at all, so we can't use the `HTMLElement.inert`
  //  JS API property; we have to check the attribute, which can either be empty or 'true';
  //  if it's `null` (not specified) or 'false', it's an active element
  var inertAtt = node === null || node === void 0 ? void 0 : (_node$getAttribute = node.getAttribute) === null || _node$getAttribute === void 0 ? void 0 : _node$getAttribute.call(node, 'inert');
  var inert = inertAtt === '' || inertAtt === 'true';

  // NOTE: this could also be handled with `node.matches('[inert], :is([inert] *)')`
  //  if it weren't for `matches()` not being a function on shadow roots; the following
  //  code works for any kind of node
  // CAREFUL: JSDom does not appear to support certain selectors like `:not([inert] *)`
  //  so it likely would not support `:is([inert] *)` either...
  var result = inert || lookUp && node && _isInert(node.parentNode); // recursive

  return result;
};

/**
 * Determines if a node's content is editable.
 * @param {Element} [node]
 * @returns True if it's content-editable; false if it's not or `node` is falsy.
 */
var isContentEditable = function isContentEditable(node) {
  var _node$getAttribute2;
  // CAREFUL: JSDom does not support the `HTMLElement.isContentEditable` API so we have
  //  to use the attribute directly to check for this, which can either be empty or 'true';
  //  if it's `null` (not specified) or 'false', it's a non-editable element
  var attValue = node === null || node === void 0 ? void 0 : (_node$getAttribute2 = node.getAttribute) === null || _node$getAttribute2 === void 0 ? void 0 : _node$getAttribute2.call(node, 'contenteditable');
  return attValue === '' || attValue === 'true';
};

/**
 * @param {Element} el container to check in
 * @param {boolean} includeContainer add container to check
 * @param {(node: Element) => boolean} filter filter candidates
 * @returns {Element[]}
 */
var getCandidates = function getCandidates(el, includeContainer, filter) {
  // even if `includeContainer=false`, we still have to check it for inertness because
  //  if it's inert, all its children are inert
  if (_isInert(el)) {
    return [];
  }
  var candidates = Array.prototype.slice.apply(el.querySelectorAll(candidateSelector));
  if (includeContainer && matches.call(el, candidateSelector)) {
    candidates.unshift(el);
  }
  candidates = candidates.filter(filter);
  return candidates;
};

/**
 * @callback GetShadowRoot
 * @param {Element} element to check for shadow root
 * @returns {ShadowRoot|boolean} ShadowRoot if available or boolean indicating if a shadowRoot is attached but not available.
 */

/**
 * @callback ShadowRootFilter
 * @param {Element} shadowHostNode the element which contains shadow content
 * @returns {boolean} true if a shadow root could potentially contain valid candidates.
 */

/**
 * @typedef {Object} CandidateScope
 * @property {Element} scopeParent contains inner candidates
 * @property {Element[]} candidates list of candidates found in the scope parent
 */

/**
 * @typedef {Object} IterativeOptions
 * @property {GetShadowRoot|boolean} getShadowRoot true if shadow support is enabled; falsy if not;
 *  if a function, implies shadow support is enabled and either returns the shadow root of an element
 *  or a boolean stating if it has an undisclosed shadow root
 * @property {(node: Element) => boolean} filter filter candidates
 * @property {boolean} flatten if true then result will flatten any CandidateScope into the returned list
 * @property {ShadowRootFilter} shadowRootFilter filter shadow roots;
 */

/**
 * @param {Element[]} elements list of element containers to match candidates from
 * @param {boolean} includeContainer add container list to check
 * @param {IterativeOptions} options
 * @returns {Array.<Element|CandidateScope>}
 */
var _getCandidatesIteratively = function getCandidatesIteratively(elements, includeContainer, options) {
  var candidates = [];
  var elementsToCheck = Array.from(elements);
  while (elementsToCheck.length) {
    var element = elementsToCheck.shift();
    if (_isInert(element, false)) {
      // no need to look up since we're drilling down
      // anything inside this container will also be inert
      continue;
    }
    if (element.tagName === 'SLOT') {
      // add shadow dom slot scope (slot itself cannot be focusable)
      var assigned = element.assignedElements();
      var content = assigned.length ? assigned : element.children;
      var nestedCandidates = _getCandidatesIteratively(content, true, options);
      if (options.flatten) {
        candidates.push.apply(candidates, nestedCandidates);
      } else {
        candidates.push({
          scopeParent: element,
          candidates: nestedCandidates
        });
      }
    } else {
      // check candidate element
      var validCandidate = matches.call(element, candidateSelector);
      if (validCandidate && options.filter(element) && (includeContainer || !elements.includes(element))) {
        candidates.push(element);
      }

      // iterate over shadow content if possible
      var shadowRoot = element.shadowRoot ||
      // check for an undisclosed shadow
      typeof options.getShadowRoot === 'function' && options.getShadowRoot(element);

      // no inert look up because we're already drilling down and checking for inertness
      //  on the way down, so all containers to this root node should have already been
      //  vetted as non-inert
      var validShadowRoot = !_isInert(shadowRoot, false) && (!options.shadowRootFilter || options.shadowRootFilter(element));
      if (shadowRoot && validShadowRoot) {
        // add shadow dom scope IIF a shadow root node was given; otherwise, an undisclosed
        //  shadow exists, so look at light dom children as fallback BUT create a scope for any
        //  child candidates found because they're likely slotted elements (elements that are
        //  children of the web component element (which has the shadow), in the light dom, but
        //  slotted somewhere _inside_ the undisclosed shadow) -- the scope is created below,
        //  _after_ we return from this recursive call
        var _nestedCandidates = _getCandidatesIteratively(shadowRoot === true ? element.children : shadowRoot.children, true, options);
        if (options.flatten) {
          candidates.push.apply(candidates, _nestedCandidates);
        } else {
          candidates.push({
            scopeParent: element,
            candidates: _nestedCandidates
          });
        }
      } else {
        // there's not shadow so just dig into the element's (light dom) children
        //  __without__ giving the element special scope treatment
        elementsToCheck.unshift.apply(elementsToCheck, element.children);
      }
    }
  }
  return candidates;
};

/**
 * @private
 * Determines if the node has an explicitly specified `tabindex` attribute.
 * @param {HTMLElement} node
 * @returns {boolean} True if so; false if not.
 */
var hasTabIndex = function hasTabIndex(node) {
  return !isNaN(parseInt(node.getAttribute('tabindex'), 10));
};

/**
 * Determine the tab index of a given node.
 * @param {HTMLElement} node
 * @returns {number} Tab order (negative, 0, or positive number).
 * @throws {Error} If `node` is falsy.
 */
var getTabIndex = function getTabIndex(node) {
  if (!node) {
    throw new Error('No node provided');
  }
  if (node.tabIndex < 0) {
    // in Chrome, <details/>, <audio controls/> and <video controls/> elements get a default
    // `tabIndex` of -1 when the 'tabindex' attribute isn't specified in the DOM,
    // yet they are still part of the regular tab order; in FF, they get a default
    // `tabIndex` of 0; since Chrome still puts those elements in the regular tab
    // order, consider their tab index to be 0.
    // Also browsers do not return `tabIndex` correctly for contentEditable nodes;
    // so if they don't have a tabindex attribute specifically set, assume it's 0.
    if ((/^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) || isContentEditable(node)) && !hasTabIndex(node)) {
      return 0;
    }
  }
  return node.tabIndex;
};

/**
 * Determine the tab index of a given node __for sort order purposes__.
 * @param {HTMLElement} node
 * @param {boolean} [isScope] True for a custom element with shadow root or slot that, by default,
 *  has tabIndex -1, but needs to be sorted by document order in order for its content to be
 *  inserted into the correct sort position.
 * @returns {number} Tab order (negative, 0, or positive number).
 */
var getSortOrderTabIndex = function getSortOrderTabIndex(node, isScope) {
  var tabIndex = getTabIndex(node);
  if (tabIndex < 0 && isScope && !hasTabIndex(node)) {
    return 0;
  }
  return tabIndex;
};
var sortOrderedTabbables = function sortOrderedTabbables(a, b) {
  return a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex;
};
var isInput = function isInput(node) {
  return node.tagName === 'INPUT';
};
var isHiddenInput = function isHiddenInput(node) {
  return isInput(node) && node.type === 'hidden';
};
var isDetailsWithSummary = function isDetailsWithSummary(node) {
  var r = node.tagName === 'DETAILS' && Array.prototype.slice.apply(node.children).some(function (child) {
    return child.tagName === 'SUMMARY';
  });
  return r;
};
var getCheckedRadio = function getCheckedRadio(nodes, form) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].checked && nodes[i].form === form) {
      return nodes[i];
    }
  }
};
var isTabbableRadio = function isTabbableRadio(node) {
  if (!node.name) {
    return true;
  }
  var radioScope = node.form || getRootNode(node);
  var queryRadios = function queryRadios(name) {
    return radioScope.querySelectorAll('input[type="radio"][name="' + name + '"]');
  };
  var radioSet;
  if (typeof window !== 'undefined' && typeof window.CSS !== 'undefined' && typeof window.CSS.escape === 'function') {
    radioSet = queryRadios(window.CSS.escape(node.name));
  } else {
    try {
      radioSet = queryRadios(node.name);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s', err.message);
      return false;
    }
  }
  var checked = getCheckedRadio(radioSet, node.form);
  return !checked || checked === node;
};
var isRadio = function isRadio(node) {
  return isInput(node) && node.type === 'radio';
};
var isNonTabbableRadio = function isNonTabbableRadio(node) {
  return isRadio(node) && !isTabbableRadio(node);
};

// determines if a node is ultimately attached to the window's document
var isNodeAttached = function isNodeAttached(node) {
  var _nodeRoot;
  // The root node is the shadow root if the node is in a shadow DOM; some document otherwise
  //  (but NOT _the_ document; see second 'If' comment below for more).
  // If rootNode is shadow root, it'll have a host, which is the element to which the shadow
  //  is attached, and the one we need to check if it's in the document or not (because the
  //  shadow, and all nodes it contains, is never considered in the document since shadows
  //  behave like self-contained DOMs; but if the shadow's HOST, which is part of the document,
  //  is hidden, or is not in the document itself but is detached, it will affect the shadow's
  //  visibility, including all the nodes it contains). The host could be any normal node,
  //  or a custom element (i.e. web component). Either way, that's the one that is considered
  //  part of the document, not the shadow root, nor any of its children (i.e. the node being
  //  tested).
  // To further complicate things, we have to look all the way up until we find a shadow HOST
  //  that is attached (or find none) because the node might be in nested shadows...
  // If rootNode is not a shadow root, it won't have a host, and so rootNode should be the
  //  document (per the docs) and while it's a Document-type object, that document does not
  //  appear to be the same as the node's `ownerDocument` for some reason, so it's safer
  //  to ignore the rootNode at this point, and use `node.ownerDocument`. Otherwise,
  //  using `rootNode.contains(node)` will _always_ be true we'll get false-positives when
  //  node is actually detached.
  // NOTE: If `nodeRootHost` or `node` happens to be the `document` itself (which is possible
  //  if a tabbable/focusable node was quickly added to the DOM, focused, and then removed
  //  from the DOM as in https://github.com/focus-trap/focus-trap-react/issues/905), then
  //  `ownerDocument` will be `null`, hence the optional chaining on it.
  var nodeRoot = node && getRootNode(node);
  var nodeRootHost = (_nodeRoot = nodeRoot) === null || _nodeRoot === void 0 ? void 0 : _nodeRoot.host;

  // in some cases, a detached node will return itself as the root instead of a document or
  //  shadow root object, in which case, we shouldn't try to look further up the host chain
  var attached = false;
  if (nodeRoot && nodeRoot !== node) {
    var _nodeRootHost, _nodeRootHost$ownerDo, _node$ownerDocument;
    attached = !!((_nodeRootHost = nodeRootHost) !== null && _nodeRootHost !== void 0 && (_nodeRootHost$ownerDo = _nodeRootHost.ownerDocument) !== null && _nodeRootHost$ownerDo !== void 0 && _nodeRootHost$ownerDo.contains(nodeRootHost) || node !== null && node !== void 0 && (_node$ownerDocument = node.ownerDocument) !== null && _node$ownerDocument !== void 0 && _node$ownerDocument.contains(node));
    while (!attached && nodeRootHost) {
      var _nodeRoot2, _nodeRootHost2, _nodeRootHost2$ownerD;
      // since it's not attached and we have a root host, the node MUST be in a nested shadow DOM,
      //  which means we need to get the host's host and check if that parent host is contained
      //  in (i.e. attached to) the document
      nodeRoot = getRootNode(nodeRootHost);
      nodeRootHost = (_nodeRoot2 = nodeRoot) === null || _nodeRoot2 === void 0 ? void 0 : _nodeRoot2.host;
      attached = !!((_nodeRootHost2 = nodeRootHost) !== null && _nodeRootHost2 !== void 0 && (_nodeRootHost2$ownerD = _nodeRootHost2.ownerDocument) !== null && _nodeRootHost2$ownerD !== void 0 && _nodeRootHost2$ownerD.contains(nodeRootHost));
    }
  }
  return attached;
};
var isZeroArea = function isZeroArea(node) {
  var _node$getBoundingClie = node.getBoundingClientRect(),
    width = _node$getBoundingClie.width,
    height = _node$getBoundingClie.height;
  return width === 0 && height === 0;
};
var isHidden = function isHidden(node, _ref) {
  var displayCheck = _ref.displayCheck,
    getShadowRoot = _ref.getShadowRoot;
  if (displayCheck === 'full-native') {
    if ('checkVisibility' in node) {
      // Chrome >= 105, Edge >= 105, Firefox >= 106, Safari >= 17.4
      // @see https://developer.mozilla.org/en-US/docs/Web/API/Element/checkVisibility#browser_compatibility
      var visible = node.checkVisibility({
        // Checking opacity might be desirable for some use cases, but natively,
        // opacity zero elements _are_ focusable and tabbable.
        checkOpacity: false,
        opacityProperty: false,
        contentVisibilityAuto: true,
        visibilityProperty: true,
        // This is an alias for `visibilityProperty`. Contemporary browsers
        // support both. However, this alias has wider browser support (Chrome
        // >= 105 and Firefox >= 106, vs. Chrome >= 121 and Firefox >= 122), so
        // we include it anyway.
        checkVisibilityCSS: true
      });
      return !visible;
    }
    // Fall through to manual visibility checks
  }

  // NOTE: visibility will be `undefined` if node is detached from the document
  //  (see notes about this further down), which means we will consider it visible
  //  (this is legacy behavior from a very long way back)
  // NOTE: we check this regardless of `displayCheck="none"` because this is a
  //  _visibility_ check, not a _display_ check
  if (getComputedStyle(node).visibility === 'hidden') {
    return true;
  }
  var isDirectSummary = matches.call(node, 'details>summary:first-of-type');
  var nodeUnderDetails = isDirectSummary ? node.parentElement : node;
  if (matches.call(nodeUnderDetails, 'details:not([open]) *')) {
    return true;
  }
  if (!displayCheck || displayCheck === 'full' ||
  // full-native can run this branch when it falls through in case
  // Element#checkVisibility is unsupported
  displayCheck === 'full-native' || displayCheck === 'legacy-full') {
    if (typeof getShadowRoot === 'function') {
      // figure out if we should consider the node to be in an undisclosed shadow and use the
      //  'non-zero-area' fallback
      var originalNode = node;
      while (node) {
        var parentElement = node.parentElement;
        var rootNode = getRootNode(node);
        if (parentElement && !parentElement.shadowRoot && getShadowRoot(parentElement) === true // check if there's an undisclosed shadow
        ) {
          // node has an undisclosed shadow which means we can only treat it as a black box, so we
          //  fall back to a non-zero-area test
          return isZeroArea(node);
        } else if (node.assignedSlot) {
          // iterate up slot
          node = node.assignedSlot;
        } else if (!parentElement && rootNode !== node.ownerDocument) {
          // cross shadow boundary
          node = rootNode.host;
        } else {
          // iterate up normal dom
          node = parentElement;
        }
      }
      node = originalNode;
    }
    // else, `getShadowRoot` might be true, but all that does is enable shadow DOM support
    //  (i.e. it does not also presume that all nodes might have undisclosed shadows); or
    //  it might be a falsy value, which means shadow DOM support is disabled

    // Since we didn't find it sitting in an undisclosed shadow (or shadows are disabled)
    //  now we can just test to see if it would normally be visible or not, provided it's
    //  attached to the main document.
    // NOTE: We must consider case where node is inside a shadow DOM and given directly to
    //  `isTabbable()` or `isFocusable()` -- regardless of `getShadowRoot` option setting.

    if (isNodeAttached(node)) {
      // this works wherever the node is: if there's at least one client rect, it's
      //  somehow displayed; it also covers the CSS 'display: contents' case where the
      //  node itself is hidden in place of its contents; and there's no need to search
      //  up the hierarchy either
      return !node.getClientRects().length;
    }

    // Else, the node isn't attached to the document, which means the `getClientRects()`
    //  API will __always__ return zero rects (this can happen, for example, if React
    //  is used to render nodes onto a detached tree, as confirmed in this thread:
    //  https://github.com/facebook/react/issues/9117#issuecomment-284228870)
    //
    // It also means that even window.getComputedStyle(node).display will return `undefined`
    //  because styles are only computed for nodes that are in the document.
    //
    // NOTE: THIS HAS BEEN THE CASE FOR YEARS. It is not new, nor is it caused by tabbable
    //  somehow. Though it was never stated officially, anyone who has ever used tabbable
    //  APIs on nodes in detached containers has actually implicitly used tabbable in what
    //  was later (as of v5.2.0 on Apr 9, 2021) called `displayCheck="none"` mode -- essentially
    //  considering __everything__ to be visible because of the innability to determine styles.
    //
    // v6.0.0: As of this major release, the default 'full' option __no longer treats detached
    //  nodes as visible with the 'none' fallback.__
    if (displayCheck !== 'legacy-full') {
      return true; // hidden
    }
    // else, fallback to 'none' mode and consider the node visible
  } else if (displayCheck === 'non-zero-area') {
    // NOTE: Even though this tests that the node's client rect is non-zero to determine
    //  whether it's displayed, and that a detached node will __always__ have a zero-area
    //  client rect, we don't special-case for whether the node is attached or not. In
    //  this mode, we do want to consider nodes that have a zero area to be hidden at all
    //  times, and that includes attached or not.
    return isZeroArea(node);
  }

  // visible, as far as we can tell, or per current `displayCheck=none` mode, we assume
  //  it's visible
  return false;
};

// form fields (nested) inside a disabled fieldset are not focusable/tabbable
//  unless they are in the _first_ <legend> element of the top-most disabled
//  fieldset
var isDisabledFromFieldset = function isDisabledFromFieldset(node) {
  if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(node.tagName)) {
    var parentNode = node.parentElement;
    // check if `node` is contained in a disabled <fieldset>
    while (parentNode) {
      if (parentNode.tagName === 'FIELDSET' && parentNode.disabled) {
        // look for the first <legend> among the children of the disabled <fieldset>
        for (var i = 0; i < parentNode.children.length; i++) {
          var child = parentNode.children.item(i);
          // when the first <legend> (in document order) is found
          if (child.tagName === 'LEGEND') {
            // if its parent <fieldset> is not nested in another disabled <fieldset>,
            // return whether `node` is a descendant of its first <legend>
            return matches.call(parentNode, 'fieldset[disabled] *') ? true : !child.contains(node);
          }
        }
        // the disabled <fieldset> containing `node` has no <legend>
        return true;
      }
      parentNode = parentNode.parentElement;
    }
  }

  // else, node's tabbable/focusable state should not be affected by a fieldset's
  //  enabled/disabled state
  return false;
};
var isNodeMatchingSelectorFocusable = function isNodeMatchingSelectorFocusable(options, node) {
  if (node.disabled ||
  // we must do an inert look up to filter out any elements inside an inert ancestor
  //  because we're limited in the type of selectors we can use in JSDom (see related
  //  note related to `candidateSelectors`)
  _isInert(node) || isHiddenInput(node) || isHidden(node, options) ||
  // For a details element with a summary, the summary element gets the focus
  isDetailsWithSummary(node) || isDisabledFromFieldset(node)) {
    return false;
  }
  return true;
};
var isNodeMatchingSelectorTabbable = function isNodeMatchingSelectorTabbable(options, node) {
  if (isNonTabbableRadio(node) || getTabIndex(node) < 0 || !isNodeMatchingSelectorFocusable(options, node)) {
    return false;
  }
  return true;
};
var isShadowRootTabbable = function isShadowRootTabbable(shadowHostNode) {
  var tabIndex = parseInt(shadowHostNode.getAttribute('tabindex'), 10);
  if (isNaN(tabIndex) || tabIndex >= 0) {
    return true;
  }
  // If a custom element has an explicit negative tabindex,
  // browsers will not allow tab targeting said element's children.
  return false;
};

/**
 * @param {Array.<Element|CandidateScope>} candidates
 * @returns Element[]
 */
var _sortByOrder = function sortByOrder(candidates) {
  var regularTabbables = [];
  var orderedTabbables = [];
  candidates.forEach(function (item, i) {
    var isScope = !!item.scopeParent;
    var element = isScope ? item.scopeParent : item;
    var candidateTabindex = getSortOrderTabIndex(element, isScope);
    var elements = isScope ? _sortByOrder(item.candidates) : element;
    if (candidateTabindex === 0) {
      isScope ? regularTabbables.push.apply(regularTabbables, elements) : regularTabbables.push(element);
    } else {
      orderedTabbables.push({
        documentOrder: i,
        tabIndex: candidateTabindex,
        item: item,
        isScope: isScope,
        content: elements
      });
    }
  });
  return orderedTabbables.sort(sortOrderedTabbables).reduce(function (acc, sortable) {
    sortable.isScope ? acc.push.apply(acc, sortable.content) : acc.push(sortable.content);
    return acc;
  }, []).concat(regularTabbables);
};
var tabbable = function tabbable(container, options) {
  options = options || {};
  var candidates;
  if (options.getShadowRoot) {
    candidates = _getCandidatesIteratively([container], options.includeContainer, {
      filter: isNodeMatchingSelectorTabbable.bind(null, options),
      flatten: false,
      getShadowRoot: options.getShadowRoot,
      shadowRootFilter: isShadowRootTabbable
    });
  } else {
    candidates = getCandidates(container, options.includeContainer, isNodeMatchingSelectorTabbable.bind(null, options));
  }
  return _sortByOrder(candidates);
};
var focusable = function focusable(container, options) {
  options = options || {};
  var candidates;
  if (options.getShadowRoot) {
    candidates = _getCandidatesIteratively([container], options.includeContainer, {
      filter: isNodeMatchingSelectorFocusable.bind(null, options),
      flatten: true,
      getShadowRoot: options.getShadowRoot
    });
  } else {
    candidates = getCandidates(container, options.includeContainer, isNodeMatchingSelectorFocusable.bind(null, options));
  }
  return candidates;
};
var isTabbable = function isTabbable(node, options) {
  options = options || {};
  if (!node) {
    throw new Error('No node provided');
  }
  if (matches.call(node, candidateSelector) === false) {
    return false;
  }
  return isNodeMatchingSelectorTabbable(options, node);
};
var focusableCandidateSelector = /* #__PURE__ */(/* unused pure expression or super */ null && (candidateSelectors.concat('iframe').join(',')));
var isFocusable = function isFocusable(node, options) {
  options = options || {};
  if (!node) {
    throw new Error('No node provided');
  }
  if (matches.call(node, focusableCandidateSelector) === false) {
    return false;
  }
  return isNodeMatchingSelectorFocusable(options, node);
};


//# sourceMappingURL=index.esm.js.map


/***/ }),

/***/ 50501:
/***/ (() => {


// UNUSED EXPORTS: _

;// ./node_modules/@swc/helpers/esm/_check_private_redeclaration.js
function _check_private_redeclaration_check_private_redeclaration(obj, privateCollection) {
    if (privateCollection.has(obj)) {
        throw new TypeError("Cannot initialize the same private elements twice on an object");
    }
}


;// ./node_modules/@swc/helpers/esm/_class_private_field_init.js


function _class_private_field_init(obj, privateMap, value) {
    _check_private_redeclaration(obj, privateMap);
    privateMap.set(obj, value);
}



/***/ }),

/***/ 50856:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   QP: () => (/* binding */ twMerge)
/* harmony export */ });
/* unused harmony exports createTailwindMerge, extendTailwindMerge, fromTheme, getDefaultConfig, mergeConfigs, twJoin, validators */
const CLASS_PART_SEPARATOR = '-';
const createClassGroupUtils = config => {
  const classMap = createClassMap(config);
  const {
    conflictingClassGroups,
    conflictingClassGroupModifiers
  } = config;
  const getClassGroupId = className => {
    const classParts = className.split(CLASS_PART_SEPARATOR);
    // Classes like `-inset-1` produce an empty string as first classPart. We assume that classes for negative values are used correctly and remove it from classParts.
    if (classParts[0] === '' && classParts.length !== 1) {
      classParts.shift();
    }
    return getGroupRecursive(classParts, classMap) || getGroupIdForArbitraryProperty(className);
  };
  const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
    const conflicts = conflictingClassGroups[classGroupId] || [];
    if (hasPostfixModifier && conflictingClassGroupModifiers[classGroupId]) {
      return [...conflicts, ...conflictingClassGroupModifiers[classGroupId]];
    }
    return conflicts;
  };
  return {
    getClassGroupId,
    getConflictingClassGroupIds
  };
};
const getGroupRecursive = (classParts, classPartObject) => {
  if (classParts.length === 0) {
    return classPartObject.classGroupId;
  }
  const currentClassPart = classParts[0];
  const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
  const classGroupFromNextClassPart = nextClassPartObject ? getGroupRecursive(classParts.slice(1), nextClassPartObject) : undefined;
  if (classGroupFromNextClassPart) {
    return classGroupFromNextClassPart;
  }
  if (classPartObject.validators.length === 0) {
    return undefined;
  }
  const classRest = classParts.join(CLASS_PART_SEPARATOR);
  return classPartObject.validators.find(({
    validator
  }) => validator(classRest))?.classGroupId;
};
const arbitraryPropertyRegex = /^\[(.+)\]$/;
const getGroupIdForArbitraryProperty = className => {
  if (arbitraryPropertyRegex.test(className)) {
    const arbitraryPropertyClassName = arbitraryPropertyRegex.exec(className)[1];
    const property = arbitraryPropertyClassName?.substring(0, arbitraryPropertyClassName.indexOf(':'));
    if (property) {
      // I use two dots here because one dot is used as prefix for class groups in plugins
      return 'arbitrary..' + property;
    }
  }
};
/**
 * Exported for testing only
 */
const createClassMap = config => {
  const {
    theme,
    classGroups
  } = config;
  const classMap = {
    nextPart: new Map(),
    validators: []
  };
  for (const classGroupId in classGroups) {
    processClassesRecursively(classGroups[classGroupId], classMap, classGroupId, theme);
  }
  return classMap;
};
const processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
  classGroup.forEach(classDefinition => {
    if (typeof classDefinition === 'string') {
      const classPartObjectToEdit = classDefinition === '' ? classPartObject : getPart(classPartObject, classDefinition);
      classPartObjectToEdit.classGroupId = classGroupId;
      return;
    }
    if (typeof classDefinition === 'function') {
      if (isThemeGetter(classDefinition)) {
        processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
        return;
      }
      classPartObject.validators.push({
        validator: classDefinition,
        classGroupId
      });
      return;
    }
    Object.entries(classDefinition).forEach(([key, classGroup]) => {
      processClassesRecursively(classGroup, getPart(classPartObject, key), classGroupId, theme);
    });
  });
};
const getPart = (classPartObject, path) => {
  let currentClassPartObject = classPartObject;
  path.split(CLASS_PART_SEPARATOR).forEach(pathPart => {
    if (!currentClassPartObject.nextPart.has(pathPart)) {
      currentClassPartObject.nextPart.set(pathPart, {
        nextPart: new Map(),
        validators: []
      });
    }
    currentClassPartObject = currentClassPartObject.nextPart.get(pathPart);
  });
  return currentClassPartObject;
};
const isThemeGetter = func => func.isThemeGetter;

// LRU cache inspired from hashlru (https://github.com/dominictarr/hashlru/blob/v1.0.4/index.js) but object replaced with Map to improve performance
const createLruCache = maxCacheSize => {
  if (maxCacheSize < 1) {
    return {
      get: () => undefined,
      set: () => {}
    };
  }
  let cacheSize = 0;
  let cache = new Map();
  let previousCache = new Map();
  const update = (key, value) => {
    cache.set(key, value);
    cacheSize++;
    if (cacheSize > maxCacheSize) {
      cacheSize = 0;
      previousCache = cache;
      cache = new Map();
    }
  };
  return {
    get(key) {
      let value = cache.get(key);
      if (value !== undefined) {
        return value;
      }
      if ((value = previousCache.get(key)) !== undefined) {
        update(key, value);
        return value;
      }
    },
    set(key, value) {
      if (cache.has(key)) {
        cache.set(key, value);
      } else {
        update(key, value);
      }
    }
  };
};
const IMPORTANT_MODIFIER = '!';
const MODIFIER_SEPARATOR = ':';
const MODIFIER_SEPARATOR_LENGTH = MODIFIER_SEPARATOR.length;
const createParseClassName = config => {
  const {
    prefix,
    experimentalParseClassName
  } = config;
  /**
   * Parse class name into parts.
   *
   * Inspired by `splitAtTopLevelOnly` used in Tailwind CSS
   * @see https://github.com/tailwindlabs/tailwindcss/blob/v3.2.2/src/util/splitAtTopLevelOnly.js
   */
  let parseClassName = className => {
    const modifiers = [];
    let bracketDepth = 0;
    let parenDepth = 0;
    let modifierStart = 0;
    let postfixModifierPosition;
    for (let index = 0; index < className.length; index++) {
      let currentCharacter = className[index];
      if (bracketDepth === 0 && parenDepth === 0) {
        if (currentCharacter === MODIFIER_SEPARATOR) {
          modifiers.push(className.slice(modifierStart, index));
          modifierStart = index + MODIFIER_SEPARATOR_LENGTH;
          continue;
        }
        if (currentCharacter === '/') {
          postfixModifierPosition = index;
          continue;
        }
      }
      if (currentCharacter === '[') {
        bracketDepth++;
      } else if (currentCharacter === ']') {
        bracketDepth--;
      } else if (currentCharacter === '(') {
        parenDepth++;
      } else if (currentCharacter === ')') {
        parenDepth--;
      }
    }
    const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.substring(modifierStart);
    const baseClassName = stripImportantModifier(baseClassNameWithImportantModifier);
    const hasImportantModifier = baseClassName !== baseClassNameWithImportantModifier;
    const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : undefined;
    return {
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    };
  };
  if (prefix) {
    const fullPrefix = prefix + MODIFIER_SEPARATOR;
    const parseClassNameOriginal = parseClassName;
    parseClassName = className => className.startsWith(fullPrefix) ? parseClassNameOriginal(className.substring(fullPrefix.length)) : {
      isExternal: true,
      modifiers: [],
      hasImportantModifier: false,
      baseClassName: className,
      maybePostfixModifierPosition: undefined
    };
  }
  if (experimentalParseClassName) {
    const parseClassNameOriginal = parseClassName;
    parseClassName = className => experimentalParseClassName({
      className,
      parseClassName: parseClassNameOriginal
    });
  }
  return parseClassName;
};
const stripImportantModifier = baseClassName => {
  if (baseClassName.endsWith(IMPORTANT_MODIFIER)) {
    return baseClassName.substring(0, baseClassName.length - 1);
  }
  /**
   * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
   * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
   */
  if (baseClassName.startsWith(IMPORTANT_MODIFIER)) {
    return baseClassName.substring(1);
  }
  return baseClassName;
};

/**
 * Sorts modifiers according to following schema:
 * - Predefined modifiers are sorted alphabetically
 * - When an arbitrary variant appears, it must be preserved which modifiers are before and after it
 */
const createSortModifiers = config => {
  const orderSensitiveModifiers = Object.fromEntries(config.orderSensitiveModifiers.map(modifier => [modifier, true]));
  const sortModifiers = modifiers => {
    if (modifiers.length <= 1) {
      return modifiers;
    }
    const sortedModifiers = [];
    let unsortedModifiers = [];
    modifiers.forEach(modifier => {
      const isPositionSensitive = modifier[0] === '[' || orderSensitiveModifiers[modifier];
      if (isPositionSensitive) {
        sortedModifiers.push(...unsortedModifiers.sort(), modifier);
        unsortedModifiers = [];
      } else {
        unsortedModifiers.push(modifier);
      }
    });
    sortedModifiers.push(...unsortedModifiers.sort());
    return sortedModifiers;
  };
  return sortModifiers;
};
const createConfigUtils = config => ({
  cache: createLruCache(config.cacheSize),
  parseClassName: createParseClassName(config),
  sortModifiers: createSortModifiers(config),
  ...createClassGroupUtils(config)
});
const SPLIT_CLASSES_REGEX = /\s+/;
const mergeClassList = (classList, configUtils) => {
  const {
    parseClassName,
    getClassGroupId,
    getConflictingClassGroupIds,
    sortModifiers
  } = configUtils;
  /**
   * Set of classGroupIds in following format:
   * `{importantModifier}{variantModifiers}{classGroupId}`
   * @example 'float'
   * @example 'hover:focus:bg-color'
   * @example 'md:!pr'
   */
  const classGroupsInConflict = [];
  const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
  let result = '';
  for (let index = classNames.length - 1; index >= 0; index -= 1) {
    const originalClassName = classNames[index];
    const {
      isExternal,
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    } = parseClassName(originalClassName);
    if (isExternal) {
      result = originalClassName + (result.length > 0 ? ' ' + result : result);
      continue;
    }
    let hasPostfixModifier = !!maybePostfixModifierPosition;
    let classGroupId = getClassGroupId(hasPostfixModifier ? baseClassName.substring(0, maybePostfixModifierPosition) : baseClassName);
    if (!classGroupId) {
      if (!hasPostfixModifier) {
        // Not a Tailwind class
        result = originalClassName + (result.length > 0 ? ' ' + result : result);
        continue;
      }
      classGroupId = getClassGroupId(baseClassName);
      if (!classGroupId) {
        // Not a Tailwind class
        result = originalClassName + (result.length > 0 ? ' ' + result : result);
        continue;
      }
      hasPostfixModifier = false;
    }
    const variantModifier = sortModifiers(modifiers).join(':');
    const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
    const classId = modifierId + classGroupId;
    if (classGroupsInConflict.includes(classId)) {
      // Tailwind class omitted due to conflict
      continue;
    }
    classGroupsInConflict.push(classId);
    const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
    for (let i = 0; i < conflictGroups.length; ++i) {
      const group = conflictGroups[i];
      classGroupsInConflict.push(modifierId + group);
    }
    // Tailwind class not in conflict
    result = originalClassName + (result.length > 0 ? ' ' + result : result);
  }
  return result;
};

/**
 * The code in this file is copied from https://github.com/lukeed/clsx and modified to suit the needs of tailwind-merge better.
 *
 * Specifically:
 * - Runtime code from https://github.com/lukeed/clsx/blob/v1.2.1/src/index.js
 * - TypeScript types from https://github.com/lukeed/clsx/blob/v1.2.1/clsx.d.ts
 *
 * Original code has MIT license: Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)
 */
function twJoin() {
  let index = 0;
  let argument;
  let resolvedValue;
  let string = '';
  while (index < arguments.length) {
    if (argument = arguments[index++]) {
      if (resolvedValue = toValue(argument)) {
        string && (string += ' ');
        string += resolvedValue;
      }
    }
  }
  return string;
}
const toValue = mix => {
  if (typeof mix === 'string') {
    return mix;
  }
  let resolvedValue;
  let string = '';
  for (let k = 0; k < mix.length; k++) {
    if (mix[k]) {
      if (resolvedValue = toValue(mix[k])) {
        string && (string += ' ');
        string += resolvedValue;
      }
    }
  }
  return string;
};
function createTailwindMerge(createConfigFirst, ...createConfigRest) {
  let configUtils;
  let cacheGet;
  let cacheSet;
  let functionToCall = initTailwindMerge;
  function initTailwindMerge(classList) {
    const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
    configUtils = createConfigUtils(config);
    cacheGet = configUtils.cache.get;
    cacheSet = configUtils.cache.set;
    functionToCall = tailwindMerge;
    return tailwindMerge(classList);
  }
  function tailwindMerge(classList) {
    const cachedResult = cacheGet(classList);
    if (cachedResult) {
      return cachedResult;
    }
    const result = mergeClassList(classList, configUtils);
    cacheSet(classList, result);
    return result;
  }
  return function callTailwindMerge() {
    return functionToCall(twJoin.apply(null, arguments));
  };
}
const fromTheme = key => {
  const themeGetter = theme => theme[key] || [];
  themeGetter.isThemeGetter = true;
  return themeGetter;
};
const arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
const arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
const fractionRegex = /^\d+\/\d+$/;
const tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
const lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
const colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/;
// Shadow always begins with x and y offset separated by underscore optionally prepended by inset
const shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
const imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
const isFraction = value => fractionRegex.test(value);
const isNumber = value => !!value && !Number.isNaN(Number(value));
const isInteger = value => !!value && Number.isInteger(Number(value));
const isPercent = value => value.endsWith('%') && isNumber(value.slice(0, -1));
const isTshirtSize = value => tshirtUnitRegex.test(value);
const isAny = () => true;
const isLengthOnly = value =>
// `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
// For example, `hsl(0 0% 0%)` would be classified as a length without this check.
// I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
lengthUnitRegex.test(value) && !colorFunctionRegex.test(value);
const isNever = () => false;
const isShadow = value => shadowRegex.test(value);
const isImage = value => imageRegex.test(value);
const isAnyNonArbitrary = value => !isArbitraryValue(value) && !isArbitraryVariable(value);
const isArbitrarySize = value => getIsArbitraryValue(value, isLabelSize, isNever);
const isArbitraryValue = value => arbitraryValueRegex.test(value);
const isArbitraryLength = value => getIsArbitraryValue(value, isLabelLength, isLengthOnly);
const isArbitraryNumber = value => getIsArbitraryValue(value, isLabelNumber, isNumber);
const isArbitraryPosition = value => getIsArbitraryValue(value, isLabelPosition, isNever);
const isArbitraryImage = value => getIsArbitraryValue(value, isLabelImage, isImage);
const isArbitraryShadow = value => getIsArbitraryValue(value, isLabelShadow, isShadow);
const isArbitraryVariable = value => arbitraryVariableRegex.test(value);
const isArbitraryVariableLength = value => getIsArbitraryVariable(value, isLabelLength);
const isArbitraryVariableFamilyName = value => getIsArbitraryVariable(value, isLabelFamilyName);
const isArbitraryVariablePosition = value => getIsArbitraryVariable(value, isLabelPosition);
const isArbitraryVariableSize = value => getIsArbitraryVariable(value, isLabelSize);
const isArbitraryVariableImage = value => getIsArbitraryVariable(value, isLabelImage);
const isArbitraryVariableShadow = value => getIsArbitraryVariable(value, isLabelShadow, true);
// Helpers
const getIsArbitraryValue = (value, testLabel, testValue) => {
  const result = arbitraryValueRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return testValue(result[2]);
  }
  return false;
};
const getIsArbitraryVariable = (value, testLabel, shouldMatchNoLabel = false) => {
  const result = arbitraryVariableRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return shouldMatchNoLabel;
  }
  return false;
};
// Labels
const isLabelPosition = label => label === 'position' || label === 'percentage';
const isLabelImage = label => label === 'image' || label === 'url';
const isLabelSize = label => label === 'length' || label === 'size' || label === 'bg-size';
const isLabelLength = label => label === 'length';
const isLabelNumber = label => label === 'number';
const isLabelFamilyName = label => label === 'family-name';
const isLabelShadow = label => label === 'shadow';
const validators = /*#__PURE__*/Object.defineProperty({
  __proto__: null,
  isAny,
  isAnyNonArbitrary,
  isArbitraryImage,
  isArbitraryLength,
  isArbitraryNumber,
  isArbitraryPosition,
  isArbitraryShadow,
  isArbitrarySize,
  isArbitraryValue,
  isArbitraryVariable,
  isArbitraryVariableFamilyName,
  isArbitraryVariableImage,
  isArbitraryVariableLength,
  isArbitraryVariablePosition,
  isArbitraryVariableShadow,
  isArbitraryVariableSize,
  isFraction,
  isInteger,
  isNumber,
  isPercent,
  isTshirtSize
}, Symbol.toStringTag, {
  value: 'Module'
});
const getDefaultConfig = () => {
  /**
   * Theme getters for theme variable namespaces
   * @see https://tailwindcss.com/docs/theme#theme-variable-namespaces
   */
  /***/
  const themeColor = fromTheme('color');
  const themeFont = fromTheme('font');
  const themeText = fromTheme('text');
  const themeFontWeight = fromTheme('font-weight');
  const themeTracking = fromTheme('tracking');
  const themeLeading = fromTheme('leading');
  const themeBreakpoint = fromTheme('breakpoint');
  const themeContainer = fromTheme('container');
  const themeSpacing = fromTheme('spacing');
  const themeRadius = fromTheme('radius');
  const themeShadow = fromTheme('shadow');
  const themeInsetShadow = fromTheme('inset-shadow');
  const themeTextShadow = fromTheme('text-shadow');
  const themeDropShadow = fromTheme('drop-shadow');
  const themeBlur = fromTheme('blur');
  const themePerspective = fromTheme('perspective');
  const themeAspect = fromTheme('aspect');
  const themeEase = fromTheme('ease');
  const themeAnimate = fromTheme('animate');
  /**
   * Helpers to avoid repeating the same scales
   *
   * We use functions that create a new array every time they're called instead of static arrays.
   * This ensures that users who modify any scale by mutating the array (e.g. with `array.push(element)`) don't accidentally mutate arrays in other parts of the config.
   */
  /***/
  const scaleBreak = () => ['auto', 'avoid', 'all', 'avoid-page', 'page', 'left', 'right', 'column'];
  const scalePosition = () => ['center', 'top', 'bottom', 'left', 'right', 'top-left',
  // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
  'left-top', 'top-right',
  // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
  'right-top', 'bottom-right',
  // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
  'right-bottom', 'bottom-left',
  // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
  'left-bottom'];
  const scalePositionWithArbitrary = () => [...scalePosition(), isArbitraryVariable, isArbitraryValue];
  const scaleOverflow = () => ['auto', 'hidden', 'clip', 'visible', 'scroll'];
  const scaleOverscroll = () => ['auto', 'contain', 'none'];
  const scaleUnambiguousSpacing = () => [isArbitraryVariable, isArbitraryValue, themeSpacing];
  const scaleInset = () => [isFraction, 'full', 'auto', ...scaleUnambiguousSpacing()];
  const scaleGridTemplateColsRows = () => [isInteger, 'none', 'subgrid', isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartAndEnd = () => ['auto', {
    span: ['full', isInteger, isArbitraryVariable, isArbitraryValue]
  }, isInteger, isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartOrEnd = () => [isInteger, 'auto', isArbitraryVariable, isArbitraryValue];
  const scaleGridAutoColsRows = () => ['auto', 'min', 'max', 'fr', isArbitraryVariable, isArbitraryValue];
  const scaleAlignPrimaryAxis = () => ['start', 'end', 'center', 'between', 'around', 'evenly', 'stretch', 'baseline', 'center-safe', 'end-safe'];
  const scaleAlignSecondaryAxis = () => ['start', 'end', 'center', 'stretch', 'center-safe', 'end-safe'];
  const scaleMargin = () => ['auto', ...scaleUnambiguousSpacing()];
  const scaleSizing = () => [isFraction, 'auto', 'full', 'dvw', 'dvh', 'lvw', 'lvh', 'svw', 'svh', 'min', 'max', 'fit', ...scaleUnambiguousSpacing()];
  const scaleColor = () => [themeColor, isArbitraryVariable, isArbitraryValue];
  const scaleBgPosition = () => [...scalePosition(), isArbitraryVariablePosition, isArbitraryPosition, {
    position: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleBgRepeat = () => ['no-repeat', {
    repeat: ['', 'x', 'y', 'space', 'round']
  }];
  const scaleBgSize = () => ['auto', 'cover', 'contain', isArbitraryVariableSize, isArbitrarySize, {
    size: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleGradientStopPosition = () => [isPercent, isArbitraryVariableLength, isArbitraryLength];
  const scaleRadius = () => [
  // Deprecated since Tailwind CSS v4.0.0
  '', 'none', 'full', themeRadius, isArbitraryVariable, isArbitraryValue];
  const scaleBorderWidth = () => ['', isNumber, isArbitraryVariableLength, isArbitraryLength];
  const scaleLineStyle = () => ['solid', 'dashed', 'dotted', 'double'];
  const scaleBlendMode = () => ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'];
  const scaleMaskImagePosition = () => [isNumber, isPercent, isArbitraryVariablePosition, isArbitraryPosition];
  const scaleBlur = () => [
  // Deprecated since Tailwind CSS v4.0.0
  '', 'none', themeBlur, isArbitraryVariable, isArbitraryValue];
  const scaleRotate = () => ['none', isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleScale = () => ['none', isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleSkew = () => [isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleTranslate = () => [isFraction, 'full', ...scaleUnambiguousSpacing()];
  return {
    cacheSize: 500,
    theme: {
      animate: ['spin', 'ping', 'pulse', 'bounce'],
      aspect: ['video'],
      blur: [isTshirtSize],
      breakpoint: [isTshirtSize],
      color: [isAny],
      container: [isTshirtSize],
      'drop-shadow': [isTshirtSize],
      ease: ['in', 'out', 'in-out'],
      font: [isAnyNonArbitrary],
      'font-weight': ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'],
      'inset-shadow': [isTshirtSize],
      leading: ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'],
      perspective: ['dramatic', 'near', 'normal', 'midrange', 'distant', 'none'],
      radius: [isTshirtSize],
      shadow: [isTshirtSize],
      spacing: ['px', isNumber],
      text: [isTshirtSize],
      'text-shadow': [isTshirtSize],
      tracking: ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest']
    },
    classGroups: {
      // --------------
      // --- Layout ---
      // --------------
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ['auto', 'square', isFraction, isArbitraryValue, isArbitraryVariable, themeAspect]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       * @deprecated since Tailwind CSS v4.0.0
       */
      container: ['container'],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [isNumber, isArbitraryValue, isArbitraryVariable, themeContainer]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      'break-after': [{
        'break-after': scaleBreak()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      'break-before': [{
        'break-before': scaleBreak()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      'break-inside': [{
        'break-inside': ['auto', 'avoid', 'avoid-page', 'avoid-column']
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      'box-decoration': [{
        'box-decoration': ['slice', 'clone']
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ['border', 'content']
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'table', 'inline-table', 'table-caption', 'table-cell', 'table-column', 'table-column-group', 'table-footer-group', 'table-header-group', 'table-row-group', 'table-row', 'flow-root', 'grid', 'inline-grid', 'contents', 'list-item', 'hidden'],
      /**
       * Screen Reader Only
       * @see https://tailwindcss.com/docs/display#screen-reader-only
       */
      sr: ['sr-only', 'not-sr-only'],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ['right', 'left', 'none', 'start', 'end']
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ['left', 'right', 'both', 'none', 'start', 'end']
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ['isolate', 'isolation-auto'],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      'object-fit': [{
        object: ['contain', 'cover', 'fill', 'none', 'scale-down']
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      'object-position': [{
        object: scalePositionWithArbitrary()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: scaleOverflow()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      'overflow-x': [{
        'overflow-x': scaleOverflow()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      'overflow-y': [{
        'overflow-y': scaleOverflow()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: scaleOverscroll()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      'overscroll-x': [{
        'overscroll-x': scaleOverscroll()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      'overscroll-y': [{
        'overscroll-y': scaleOverscroll()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ['static', 'fixed', 'absolute', 'relative', 'sticky'],
      /**
       * Top / Right / Bottom / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: scaleInset()
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-x': [{
        'inset-x': scaleInset()
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-y': [{
        'inset-y': scaleInset()
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: scaleInset()
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: scaleInset()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: scaleInset()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: scaleInset()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: scaleInset()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: scaleInset()
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ['visible', 'invisible', 'collapse'],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: [isInteger, 'auto', isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [isFraction, 'full', 'auto', themeContainer, ...scaleUnambiguousSpacing()]
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      'flex-direction': [{
        flex: ['row', 'row-reverse', 'col', 'col-reverse']
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      'flex-wrap': [{
        flex: ['nowrap', 'wrap', 'wrap-reverse']
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: [isNumber, isFraction, 'auto', 'initial', 'none', isArbitraryValue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [isInteger, 'first', 'last', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      'grid-cols': [{
        'grid-cols': scaleGridTemplateColsRows()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-start-end': [{
        col: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-start': [{
        'col-start': scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-end': [{
        'col-end': scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      'grid-rows': [{
        'grid-rows': scaleGridTemplateColsRows()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-start-end': [{
        row: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-start': [{
        'row-start': scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-end': [{
        'row-end': scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      'grid-flow': [{
        'grid-flow': ['row', 'col', 'dense', 'row-dense', 'col-dense']
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      'auto-cols': [{
        'auto-cols': scaleGridAutoColsRows()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      'auto-rows': [{
        'auto-rows': scaleGridAutoColsRows()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: scaleUnambiguousSpacing()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-x': [{
        'gap-x': scaleUnambiguousSpacing()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-y': [{
        'gap-y': scaleUnambiguousSpacing()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      'justify-content': [{
        justify: [...scaleAlignPrimaryAxis(), 'normal']
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      'justify-items': [{
        'justify-items': [...scaleAlignSecondaryAxis(), 'normal']
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      'justify-self': [{
        'justify-self': ['auto', ...scaleAlignSecondaryAxis()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      'align-content': [{
        content: ['normal', ...scaleAlignPrimaryAxis()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      'align-items': [{
        items: [...scaleAlignSecondaryAxis(), {
          baseline: ['', 'last']
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      'align-self': [{
        self: ['auto', ...scaleAlignSecondaryAxis(), {
          baseline: ['', 'last']
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      'place-content': [{
        'place-content': scaleAlignPrimaryAxis()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      'place-items': [{
        'place-items': [...scaleAlignSecondaryAxis(), 'baseline']
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      'place-self': [{
        'place-self': ['auto', ...scaleAlignSecondaryAxis()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: scaleUnambiguousSpacing()
      }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: scaleUnambiguousSpacing()
      }],
      /**
       * Padding End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: scaleUnambiguousSpacing()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: scaleMargin()
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: scaleMargin()
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: scaleMargin()
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: scaleMargin()
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: scaleMargin()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: scaleMargin()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: scaleMargin()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: scaleMargin()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: scaleMargin()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-x': [{
        'space-x': scaleUnambiguousSpacing()
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-x-reverse': ['space-x-reverse'],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-y': [{
        'space-y': scaleUnambiguousSpacing()
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-y-reverse': ['space-y-reverse'],
      // --------------
      // --- Sizing ---
      // --------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
       */
      size: [{
        size: scaleSizing()
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [themeContainer, 'screen', ...scaleSizing()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      'min-w': [{
        'min-w': [themeContainer, 'screen', /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
        'none', ...scaleSizing()]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      'max-w': [{
        'max-w': [themeContainer, 'screen', 'none', /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
        'prose', /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
        {
          screen: [themeBreakpoint]
        }, ...scaleSizing()]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ['screen', 'lh', ...scaleSizing()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      'min-h': [{
        'min-h': ['screen', 'lh', 'none', ...scaleSizing()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      'max-h': [{
        'max-h': ['screen', 'lh', ...scaleSizing()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      'font-size': [{
        text: ['base', themeText, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      'font-smoothing': ['antialiased', 'subpixel-antialiased'],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      'font-style': ['italic', 'not-italic'],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      'font-weight': [{
        font: [themeFontWeight, isArbitraryVariable, isArbitraryNumber]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      'font-stretch': [{
        'font-stretch': ['ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'normal', 'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded', isPercent, isArbitraryValue]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      'font-family': [{
        font: [isArbitraryVariableFamilyName, isArbitraryValue, themeFont]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-normal': ['normal-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-ordinal': ['ordinal'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-slashed-zero': ['slashed-zero'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-figure': ['lining-nums', 'oldstyle-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-spacing': ['proportional-nums', 'tabular-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-fraction': ['diagonal-fractions', 'stacked-fractions'],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: [themeTracking, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      'line-clamp': [{
        'line-clamp': [isNumber, 'none', isArbitraryVariable, isArbitraryNumber]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [/** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
        themeLeading, ...scaleUnambiguousSpacing()]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      'list-image': [{
        'list-image': ['none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      'list-style-position': [{
        list: ['inside', 'outside']
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      'list-style-type': [{
        list: ['disc', 'decimal', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      'text-alignment': [{
        text: ['left', 'center', 'right', 'justify', 'start', 'end']
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://v3.tailwindcss.com/docs/placeholder-color
       */
      'placeholder-color': [{
        placeholder: scaleColor()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      'text-color': [{
        text: scaleColor()
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      'text-decoration': ['underline', 'overline', 'line-through', 'no-underline'],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      'text-decoration-style': [{
        decoration: [...scaleLineStyle(), 'wavy']
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      'text-decoration-thickness': [{
        decoration: [isNumber, 'from-font', 'auto', isArbitraryVariable, isArbitraryLength]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      'text-decoration-color': [{
        decoration: scaleColor()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      'underline-offset': [{
        'underline-offset': [isNumber, 'auto', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      'text-transform': ['uppercase', 'lowercase', 'capitalize', 'normal-case'],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      'text-overflow': ['truncate', 'text-ellipsis', 'text-clip'],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      'text-wrap': [{
        text: ['wrap', 'nowrap', 'balance', 'pretty']
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: scaleUnambiguousSpacing()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      'vertical-align': [{
        align: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces']
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ['normal', 'words', 'all', 'keep']
      }],
      /**
       * Overflow Wrap
       * @see https://tailwindcss.com/docs/overflow-wrap
       */
      wrap: [{
        wrap: ['break-word', 'anywhere', 'normal']
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ['none', 'manual', 'auto']
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ['none', isArbitraryVariable, isArbitraryValue]
      }],
      // -------------------
      // --- Backgrounds ---
      // -------------------
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      'bg-attachment': [{
        bg: ['fixed', 'local', 'scroll']
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      'bg-clip': [{
        'bg-clip': ['border', 'padding', 'content', 'text']
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      'bg-origin': [{
        'bg-origin': ['border', 'padding', 'content']
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      'bg-position': [{
        bg: scaleBgPosition()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      'bg-repeat': [{
        bg: scaleBgRepeat()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      'bg-size': [{
        bg: scaleBgSize()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      'bg-image': [{
        bg: ['none', {
          linear: [{
            to: ['t', 'tr', 'r', 'br', 'b', 'bl', 'l', 'tl']
          }, isInteger, isArbitraryVariable, isArbitraryValue],
          radial: ['', isArbitraryVariable, isArbitraryValue],
          conic: [isInteger, isArbitraryVariable, isArbitraryValue]
        }, isArbitraryVariableImage, isArbitraryImage]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      'bg-color': [{
        bg: scaleColor()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-from-pos': [{
        from: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-via-pos': [{
        via: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-to-pos': [{
        to: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-from': [{
        from: scaleColor()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-via': [{
        via: scaleColor()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-to': [{
        to: scaleColor()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: scaleRadius()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-s': [{
        'rounded-s': scaleRadius()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-e': [{
        'rounded-e': scaleRadius()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-t': [{
        'rounded-t': scaleRadius()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-r': [{
        'rounded-r': scaleRadius()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-b': [{
        'rounded-b': scaleRadius()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-l': [{
        'rounded-l': scaleRadius()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-ss': [{
        'rounded-ss': scaleRadius()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-se': [{
        'rounded-se': scaleRadius()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-ee': [{
        'rounded-ee': scaleRadius()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-es': [{
        'rounded-es': scaleRadius()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-tl': [{
        'rounded-tl': scaleRadius()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-tr': [{
        'rounded-tr': scaleRadius()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-br': [{
        'rounded-br': scaleRadius()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-bl': [{
        'rounded-bl': scaleRadius()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w': [{
        border: scaleBorderWidth()
      }],
      /**
       * Border Width X
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-x': [{
        'border-x': scaleBorderWidth()
      }],
      /**
       * Border Width Y
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-y': [{
        'border-y': scaleBorderWidth()
      }],
      /**
       * Border Width Start
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-s': [{
        'border-s': scaleBorderWidth()
      }],
      /**
       * Border Width End
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-e': [{
        'border-e': scaleBorderWidth()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-t': [{
        'border-t': scaleBorderWidth()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-r': [{
        'border-r': scaleBorderWidth()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-b': [{
        'border-b': scaleBorderWidth()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-l': [{
        'border-l': scaleBorderWidth()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      'divide-x': [{
        'divide-x': scaleBorderWidth()
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      'divide-x-reverse': ['divide-x-reverse'],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      'divide-y': [{
        'divide-y': scaleBorderWidth()
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      'divide-y-reverse': ['divide-y-reverse'],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      'border-style': [{
        border: [...scaleLineStyle(), 'hidden', 'none']
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      'divide-style': [{
        divide: [...scaleLineStyle(), 'hidden', 'none']
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color': [{
        border: scaleColor()
      }],
      /**
       * Border Color X
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-x': [{
        'border-x': scaleColor()
      }],
      /**
       * Border Color Y
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-y': [{
        'border-y': scaleColor()
      }],
      /**
       * Border Color S
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-s': [{
        'border-s': scaleColor()
      }],
      /**
       * Border Color E
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-e': [{
        'border-e': scaleColor()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-t': [{
        'border-t': scaleColor()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-r': [{
        'border-r': scaleColor()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-b': [{
        'border-b': scaleColor()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-l': [{
        'border-l': scaleColor()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      'divide-color': [{
        divide: scaleColor()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      'outline-style': [{
        outline: [...scaleLineStyle(), 'none', 'hidden']
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      'outline-offset': [{
        'outline-offset': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      'outline-w': [{
        outline: ['', isNumber, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      'outline-color': [{
        outline: scaleColor()
      }],
      // ---------------
      // --- Effects ---
      // ---------------
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: [
        // Deprecated since Tailwind CSS v4.0.0
        '', 'none', themeShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      'shadow-color': [{
        shadow: scaleColor()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      'inset-shadow': [{
        'inset-shadow': ['none', themeInsetShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      'inset-shadow-color': [{
        'inset-shadow': scaleColor()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      'ring-w': [{
        ring: scaleBorderWidth()
      }],
      /**
       * Ring Width Inset
       * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      'ring-w-inset': ['ring-inset'],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
       */
      'ring-color': [{
        ring: scaleColor()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      'ring-offset-w': [{
        'ring-offset': [isNumber, isArbitraryLength]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      'ring-offset-color': [{
        'ring-offset': scaleColor()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      'inset-ring-w': [{
        'inset-ring': scaleBorderWidth()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      'inset-ring-color': [{
        'inset-ring': scaleColor()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      'text-shadow': [{
        'text-shadow': ['none', themeTextShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      'text-shadow-color': [{
        'text-shadow': scaleColor()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      'mix-blend': [{
        'mix-blend': [...scaleBlendMode(), 'plus-darker', 'plus-lighter']
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      'bg-blend': [{
        'bg-blend': scaleBlendMode()
      }],
      /**
       * Mask Clip
       * @see https://tailwindcss.com/docs/mask-clip
       */
      'mask-clip': [{
        'mask-clip': ['border', 'padding', 'content', 'fill', 'stroke', 'view']
      }, 'mask-no-clip'],
      /**
       * Mask Composite
       * @see https://tailwindcss.com/docs/mask-composite
       */
      'mask-composite': [{
        mask: ['add', 'subtract', 'intersect', 'exclude']
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      'mask-image-linear-pos': [{
        'mask-linear': [isNumber]
      }],
      'mask-image-linear-from-pos': [{
        'mask-linear-from': scaleMaskImagePosition()
      }],
      'mask-image-linear-to-pos': [{
        'mask-linear-to': scaleMaskImagePosition()
      }],
      'mask-image-linear-from-color': [{
        'mask-linear-from': scaleColor()
      }],
      'mask-image-linear-to-color': [{
        'mask-linear-to': scaleColor()
      }],
      'mask-image-t-from-pos': [{
        'mask-t-from': scaleMaskImagePosition()
      }],
      'mask-image-t-to-pos': [{
        'mask-t-to': scaleMaskImagePosition()
      }],
      'mask-image-t-from-color': [{
        'mask-t-from': scaleColor()
      }],
      'mask-image-t-to-color': [{
        'mask-t-to': scaleColor()
      }],
      'mask-image-r-from-pos': [{
        'mask-r-from': scaleMaskImagePosition()
      }],
      'mask-image-r-to-pos': [{
        'mask-r-to': scaleMaskImagePosition()
      }],
      'mask-image-r-from-color': [{
        'mask-r-from': scaleColor()
      }],
      'mask-image-r-to-color': [{
        'mask-r-to': scaleColor()
      }],
      'mask-image-b-from-pos': [{
        'mask-b-from': scaleMaskImagePosition()
      }],
      'mask-image-b-to-pos': [{
        'mask-b-to': scaleMaskImagePosition()
      }],
      'mask-image-b-from-color': [{
        'mask-b-from': scaleColor()
      }],
      'mask-image-b-to-color': [{
        'mask-b-to': scaleColor()
      }],
      'mask-image-l-from-pos': [{
        'mask-l-from': scaleMaskImagePosition()
      }],
      'mask-image-l-to-pos': [{
        'mask-l-to': scaleMaskImagePosition()
      }],
      'mask-image-l-from-color': [{
        'mask-l-from': scaleColor()
      }],
      'mask-image-l-to-color': [{
        'mask-l-to': scaleColor()
      }],
      'mask-image-x-from-pos': [{
        'mask-x-from': scaleMaskImagePosition()
      }],
      'mask-image-x-to-pos': [{
        'mask-x-to': scaleMaskImagePosition()
      }],
      'mask-image-x-from-color': [{
        'mask-x-from': scaleColor()
      }],
      'mask-image-x-to-color': [{
        'mask-x-to': scaleColor()
      }],
      'mask-image-y-from-pos': [{
        'mask-y-from': scaleMaskImagePosition()
      }],
      'mask-image-y-to-pos': [{
        'mask-y-to': scaleMaskImagePosition()
      }],
      'mask-image-y-from-color': [{
        'mask-y-from': scaleColor()
      }],
      'mask-image-y-to-color': [{
        'mask-y-to': scaleColor()
      }],
      'mask-image-radial': [{
        'mask-radial': [isArbitraryVariable, isArbitraryValue]
      }],
      'mask-image-radial-from-pos': [{
        'mask-radial-from': scaleMaskImagePosition()
      }],
      'mask-image-radial-to-pos': [{
        'mask-radial-to': scaleMaskImagePosition()
      }],
      'mask-image-radial-from-color': [{
        'mask-radial-from': scaleColor()
      }],
      'mask-image-radial-to-color': [{
        'mask-radial-to': scaleColor()
      }],
      'mask-image-radial-shape': [{
        'mask-radial': ['circle', 'ellipse']
      }],
      'mask-image-radial-size': [{
        'mask-radial': [{
          closest: ['side', 'corner'],
          farthest: ['side', 'corner']
        }]
      }],
      'mask-image-radial-pos': [{
        'mask-radial-at': scalePosition()
      }],
      'mask-image-conic-pos': [{
        'mask-conic': [isNumber]
      }],
      'mask-image-conic-from-pos': [{
        'mask-conic-from': scaleMaskImagePosition()
      }],
      'mask-image-conic-to-pos': [{
        'mask-conic-to': scaleMaskImagePosition()
      }],
      'mask-image-conic-from-color': [{
        'mask-conic-from': scaleColor()
      }],
      'mask-image-conic-to-color': [{
        'mask-conic-to': scaleColor()
      }],
      /**
       * Mask Mode
       * @see https://tailwindcss.com/docs/mask-mode
       */
      'mask-mode': [{
        mask: ['alpha', 'luminance', 'match']
      }],
      /**
       * Mask Origin
       * @see https://tailwindcss.com/docs/mask-origin
       */
      'mask-origin': [{
        'mask-origin': ['border', 'padding', 'content', 'fill', 'stroke', 'view']
      }],
      /**
       * Mask Position
       * @see https://tailwindcss.com/docs/mask-position
       */
      'mask-position': [{
        mask: scaleBgPosition()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      'mask-repeat': [{
        mask: scaleBgRepeat()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      'mask-size': [{
        mask: scaleBgSize()
      }],
      /**
       * Mask Type
       * @see https://tailwindcss.com/docs/mask-type
       */
      'mask-type': [{
        'mask-type': ['alpha', 'luminance']
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      'mask-image': [{
        mask: ['none', isArbitraryVariable, isArbitraryValue]
      }],
      // ---------------
      // --- Filters ---
      // ---------------
      /**
       * Filter
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: [
        // Deprecated since Tailwind CSS v3.0.0
        '', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: scaleBlur()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      'drop-shadow': [{
        'drop-shadow': [
        // Deprecated since Tailwind CSS v4.0.0
        '', 'none', themeDropShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      'drop-shadow-color': [{
        'drop-shadow': scaleColor()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      'hue-rotate': [{
        'hue-rotate': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Filter
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      'backdrop-filter': [{
        'backdrop-filter': [
        // Deprecated since Tailwind CSS v3.0.0
        '', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      'backdrop-blur': [{
        'backdrop-blur': scaleBlur()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      'backdrop-brightness': [{
        'backdrop-brightness': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      'backdrop-contrast': [{
        'backdrop-contrast': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      'backdrop-grayscale': [{
        'backdrop-grayscale': ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      'backdrop-hue-rotate': [{
        'backdrop-hue-rotate': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      'backdrop-invert': [{
        'backdrop-invert': ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      'backdrop-opacity': [{
        'backdrop-opacity': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      'backdrop-saturate': [{
        'backdrop-saturate': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      'backdrop-sepia': [{
        'backdrop-sepia': ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      // --------------
      // --- Tables ---
      // --------------
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      'border-collapse': [{
        border: ['collapse', 'separate']
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing': [{
        'border-spacing': scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing-x': [{
        'border-spacing-x': scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing-y': [{
        'border-spacing-y': scaleUnambiguousSpacing()
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      'table-layout': [{
        table: ['auto', 'fixed']
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ['top', 'bottom']
      }],
      // ---------------------------------
      // --- Transitions and Animation ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ['', 'all', 'colors', 'opacity', 'shadow', 'transform', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Behavior
       * @see https://tailwindcss.com/docs/transition-behavior
       */
      'transition-behavior': [{
        transition: ['normal', 'discrete']
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: [isNumber, 'initial', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ['linear', 'initial', themeEase, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ['none', themeAnimate, isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------
      // --- Transforms ---
      // ------------------
      /**
       * Backface Visibility
       * @see https://tailwindcss.com/docs/backface-visibility
       */
      backface: [{
        backface: ['hidden', 'visible']
      }],
      /**
       * Perspective
       * @see https://tailwindcss.com/docs/perspective
       */
      perspective: [{
        perspective: [themePerspective, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      'perspective-origin': [{
        'perspective-origin': scalePositionWithArbitrary()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: scaleRotate()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      'rotate-x': [{
        'rotate-x': scaleRotate()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      'rotate-y': [{
        'rotate-y': scaleRotate()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      'rotate-z': [{
        'rotate-z': scaleRotate()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: scaleScale()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-x': [{
        'scale-x': scaleScale()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-y': [{
        'scale-y': scaleScale()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-z': [{
        'scale-z': scaleScale()
      }],
      /**
       * Scale 3D
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-3d': ['scale-3d'],
      /**
       * Skew
       * @see https://tailwindcss.com/docs/skew
       */
      skew: [{
        skew: scaleSkew()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      'skew-x': [{
        'skew-x': scaleSkew()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      'skew-y': [{
        'skew-y': scaleSkew()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [isArbitraryVariable, isArbitraryValue, '', 'none', 'gpu', 'cpu']
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      'transform-origin': [{
        origin: scalePositionWithArbitrary()
      }],
      /**
       * Transform Style
       * @see https://tailwindcss.com/docs/transform-style
       */
      'transform-style': [{
        transform: ['3d', 'flat']
      }],
      /**
       * Translate
       * @see https://tailwindcss.com/docs/translate
       */
      translate: [{
        translate: scaleTranslate()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-x': [{
        'translate-x': scaleTranslate()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-y': [{
        'translate-y': scaleTranslate()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-z': [{
        'translate-z': scaleTranslate()
      }],
      /**
       * Translate None
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-none': ['translate-none'],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: scaleColor()
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ['none', 'auto']
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      'caret-color': [{
        caret: scaleColor()
      }],
      /**
       * Color Scheme
       * @see https://tailwindcss.com/docs/color-scheme
       */
      'color-scheme': [{
        scheme: ['normal', 'dark', 'light', 'light-dark', 'only-dark', 'only-light']
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ['auto', 'default', 'pointer', 'wait', 'text', 'move', 'help', 'not-allowed', 'none', 'context-menu', 'progress', 'cell', 'crosshair', 'vertical-text', 'alias', 'copy', 'no-drop', 'grab', 'grabbing', 'all-scroll', 'col-resize', 'row-resize', 'n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'sw-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'zoom-in', 'zoom-out', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Field Sizing
       * @see https://tailwindcss.com/docs/field-sizing
       */
      'field-sizing': [{
        'field-sizing': ['fixed', 'content']
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      'pointer-events': [{
        'pointer-events': ['auto', 'none']
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ['none', '', 'y', 'x']
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      'scroll-behavior': [{
        scroll: ['auto', 'smooth']
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-m': [{
        'scroll-m': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mx': [{
        'scroll-mx': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-my': [{
        'scroll-my': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-ms': [{
        'scroll-ms': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-me': [{
        'scroll-me': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mt': [{
        'scroll-mt': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mr': [{
        'scroll-mr': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mb': [{
        'scroll-mb': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-ml': [{
        'scroll-ml': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-p': [{
        'scroll-p': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-px': [{
        'scroll-px': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-py': [{
        'scroll-py': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-ps': [{
        'scroll-ps': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pe': [{
        'scroll-pe': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pt': [{
        'scroll-pt': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pr': [{
        'scroll-pr': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pb': [{
        'scroll-pb': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pl': [{
        'scroll-pl': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      'snap-align': [{
        snap: ['start', 'end', 'center', 'align-none']
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      'snap-stop': [{
        snap: ['normal', 'always']
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      'snap-type': [{
        snap: ['none', 'x', 'y', 'both']
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      'snap-strictness': [{
        snap: ['mandatory', 'proximity']
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ['auto', 'none', 'manipulation']
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-x': [{
        'touch-pan': ['x', 'left', 'right']
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-y': [{
        'touch-pan': ['y', 'up', 'down']
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-pz': ['touch-pinch-zoom'],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ['none', 'text', 'all', 'auto']
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      'will-change': [{
        'will-change': ['auto', 'scroll', 'contents', 'transform', isArbitraryVariable, isArbitraryValue]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ['none', ...scaleColor()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      'stroke-w': [{
        stroke: [isNumber, isArbitraryVariableLength, isArbitraryLength, isArbitraryNumber]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ['none', ...scaleColor()]
      }],
      // ---------------------
      // --- Accessibility ---
      // ---------------------
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      'forced-color-adjust': [{
        'forced-color-adjust': ['auto', 'none']
      }]
    },
    conflictingClassGroups: {
      overflow: ['overflow-x', 'overflow-y'],
      overscroll: ['overscroll-x', 'overscroll-y'],
      inset: ['inset-x', 'inset-y', 'start', 'end', 'top', 'right', 'bottom', 'left'],
      'inset-x': ['right', 'left'],
      'inset-y': ['top', 'bottom'],
      flex: ['basis', 'grow', 'shrink'],
      gap: ['gap-x', 'gap-y'],
      p: ['px', 'py', 'ps', 'pe', 'pt', 'pr', 'pb', 'pl'],
      px: ['pr', 'pl'],
      py: ['pt', 'pb'],
      m: ['mx', 'my', 'ms', 'me', 'mt', 'mr', 'mb', 'ml'],
      mx: ['mr', 'ml'],
      my: ['mt', 'mb'],
      size: ['w', 'h'],
      'font-size': ['leading'],
      'fvn-normal': ['fvn-ordinal', 'fvn-slashed-zero', 'fvn-figure', 'fvn-spacing', 'fvn-fraction'],
      'fvn-ordinal': ['fvn-normal'],
      'fvn-slashed-zero': ['fvn-normal'],
      'fvn-figure': ['fvn-normal'],
      'fvn-spacing': ['fvn-normal'],
      'fvn-fraction': ['fvn-normal'],
      'line-clamp': ['display', 'overflow'],
      rounded: ['rounded-s', 'rounded-e', 'rounded-t', 'rounded-r', 'rounded-b', 'rounded-l', 'rounded-ss', 'rounded-se', 'rounded-ee', 'rounded-es', 'rounded-tl', 'rounded-tr', 'rounded-br', 'rounded-bl'],
      'rounded-s': ['rounded-ss', 'rounded-es'],
      'rounded-e': ['rounded-se', 'rounded-ee'],
      'rounded-t': ['rounded-tl', 'rounded-tr'],
      'rounded-r': ['rounded-tr', 'rounded-br'],
      'rounded-b': ['rounded-br', 'rounded-bl'],
      'rounded-l': ['rounded-tl', 'rounded-bl'],
      'border-spacing': ['border-spacing-x', 'border-spacing-y'],
      'border-w': ['border-w-x', 'border-w-y', 'border-w-s', 'border-w-e', 'border-w-t', 'border-w-r', 'border-w-b', 'border-w-l'],
      'border-w-x': ['border-w-r', 'border-w-l'],
      'border-w-y': ['border-w-t', 'border-w-b'],
      'border-color': ['border-color-x', 'border-color-y', 'border-color-s', 'border-color-e', 'border-color-t', 'border-color-r', 'border-color-b', 'border-color-l'],
      'border-color-x': ['border-color-r', 'border-color-l'],
      'border-color-y': ['border-color-t', 'border-color-b'],
      translate: ['translate-x', 'translate-y', 'translate-none'],
      'translate-none': ['translate', 'translate-x', 'translate-y', 'translate-z'],
      'scroll-m': ['scroll-mx', 'scroll-my', 'scroll-ms', 'scroll-me', 'scroll-mt', 'scroll-mr', 'scroll-mb', 'scroll-ml'],
      'scroll-mx': ['scroll-mr', 'scroll-ml'],
      'scroll-my': ['scroll-mt', 'scroll-mb'],
      'scroll-p': ['scroll-px', 'scroll-py', 'scroll-ps', 'scroll-pe', 'scroll-pt', 'scroll-pr', 'scroll-pb', 'scroll-pl'],
      'scroll-px': ['scroll-pr', 'scroll-pl'],
      'scroll-py': ['scroll-pt', 'scroll-pb'],
      touch: ['touch-x', 'touch-y', 'touch-pz'],
      'touch-x': ['touch'],
      'touch-y': ['touch'],
      'touch-pz': ['touch']
    },
    conflictingClassGroupModifiers: {
      'font-size': ['leading']
    },
    orderSensitiveModifiers: ['*', '**', 'after', 'backdrop', 'before', 'details-content', 'file', 'first-letter', 'first-line', 'marker', 'placeholder', 'selection']
  };
};

/**
 * @param baseConfig Config where other config will be merged into. This object will be mutated.
 * @param configExtension Partial config to merge into the `baseConfig`.
 */
const mergeConfigs = (baseConfig, {
  cacheSize,
  prefix,
  experimentalParseClassName,
  extend = {},
  override = {}
}) => {
  overrideProperty(baseConfig, 'cacheSize', cacheSize);
  overrideProperty(baseConfig, 'prefix', prefix);
  overrideProperty(baseConfig, 'experimentalParseClassName', experimentalParseClassName);
  overrideConfigProperties(baseConfig.theme, override.theme);
  overrideConfigProperties(baseConfig.classGroups, override.classGroups);
  overrideConfigProperties(baseConfig.conflictingClassGroups, override.conflictingClassGroups);
  overrideConfigProperties(baseConfig.conflictingClassGroupModifiers, override.conflictingClassGroupModifiers);
  overrideProperty(baseConfig, 'orderSensitiveModifiers', override.orderSensitiveModifiers);
  mergeConfigProperties(baseConfig.theme, extend.theme);
  mergeConfigProperties(baseConfig.classGroups, extend.classGroups);
  mergeConfigProperties(baseConfig.conflictingClassGroups, extend.conflictingClassGroups);
  mergeConfigProperties(baseConfig.conflictingClassGroupModifiers, extend.conflictingClassGroupModifiers);
  mergeArrayProperties(baseConfig, extend, 'orderSensitiveModifiers');
  return baseConfig;
};
const overrideProperty = (baseObject, overrideKey, overrideValue) => {
  if (overrideValue !== undefined) {
    baseObject[overrideKey] = overrideValue;
  }
};
const overrideConfigProperties = (baseObject, overrideObject) => {
  if (overrideObject) {
    for (const key in overrideObject) {
      overrideProperty(baseObject, key, overrideObject[key]);
    }
  }
};
const mergeConfigProperties = (baseObject, mergeObject) => {
  if (mergeObject) {
    for (const key in mergeObject) {
      mergeArrayProperties(baseObject, mergeObject, key);
    }
  }
};
const mergeArrayProperties = (baseObject, mergeObject, key) => {
  const mergeValue = mergeObject[key];
  if (mergeValue !== undefined) {
    baseObject[key] = baseObject[key] ? baseObject[key].concat(mergeValue) : mergeValue;
  }
};
const extendTailwindMerge = (configExtension, ...createConfig) => typeof configExtension === 'function' ? createTailwindMerge(getDefaultConfig, configExtension, ...createConfig) : createTailwindMerge(() => mergeConfigs(getDefaultConfig(), configExtension), ...createConfig);
const twMerge = /*#__PURE__*/createTailwindMerge(getDefaultConfig);

//# sourceMappingURL=bundle-mjs.mjs.map


/***/ }),

/***/ 52852:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   dD: () => (/* binding */ processCanvasRGBA)
/* harmony export */ });
/* unused harmony exports BlurStack, canvasRGB, image, imageDataRGB, imageDataRGBA */
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/* eslint-disable no-bitwise -- used for calculations */

/* eslint-disable unicorn/prefer-query-selector -- aiming at
  backward-compatibility */

/**
* StackBlur - a fast almost Gaussian Blur For Canvas
*
* In case you find this class useful - especially in commercial projects -
* I am not totally unhappy for a small donation to my PayPal account
* mario@quasimondo.de
*
* Or support me on flattr:
* {@link https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript}.
*
* @module StackBlur
* @author Mario Klingemann
* Contact: mario@quasimondo.com
* Website: {@link http://www.quasimondo.com/StackBlurForCanvas/StackBlurDemo.html}
* Twitter: @quasimondo
*
* @copyright (c) 2010 Mario Klingemann
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/
var mulTable = [512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];
var shgTable = [9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];
/**
 * @param {string|HTMLImageElement} img
 * @param {string|HTMLCanvasElement} canvas
 * @param {Float} radius
 * @param {boolean} blurAlphaChannel
 * @param {boolean} useOffset
 * @param {boolean} skipStyles
 * @returns {undefined}
 */

function processImage(img, canvas, radius, blurAlphaChannel, useOffset, skipStyles) {
  if (typeof img === 'string') {
    img = document.getElementById(img);
  }

  if (!img || Object.prototype.toString.call(img).slice(8, -1) === 'HTMLImageElement' && !('naturalWidth' in img)) {
    return;
  }

  var dimensionType = useOffset ? 'offset' : 'natural';
  var w = img[dimensionType + 'Width'];
  var h = img[dimensionType + 'Height']; // add ImageBitmap support,can blur texture source

  if (Object.prototype.toString.call(img).slice(8, -1) === 'ImageBitmap') {
    w = img.width;
    h = img.height;
  }

  if (typeof canvas === 'string') {
    canvas = document.getElementById(canvas);
  }

  if (!canvas || !('getContext' in canvas)) {
    return;
  }

  if (!skipStyles) {
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
  }

  canvas.width = w;
  canvas.height = h;
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, w, h);
  context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, w, h);

  if (isNaN(radius) || radius < 1) {
    return;
  }

  if (blurAlphaChannel) {
    processCanvasRGBA(canvas, 0, 0, w, h, radius);
  } else {
    processCanvasRGB(canvas, 0, 0, w, h, radius);
  }
}
/**
 * @param {string|HTMLCanvasElement} canvas
 * @param {Integer} topX
 * @param {Integer} topY
 * @param {Integer} width
 * @param {Integer} height
 * @throws {Error|TypeError}
 * @returns {ImageData} See {@link https://html.spec.whatwg.org/multipage/canvas.html#imagedata}
 */


function getImageDataFromCanvas(canvas, topX, topY, width, height) {
  if (typeof canvas === 'string') {
    canvas = document.getElementById(canvas);
  }

  if (!canvas || _typeof(canvas) !== 'object' || !('getContext' in canvas)) {
    throw new TypeError('Expecting canvas with `getContext` method ' + 'in processCanvasRGB(A) calls!');
  }

  var context = canvas.getContext('2d');

  try {
    return context.getImageData(topX, topY, width, height);
  } catch (e) {
    throw new Error('unable to access image data: ' + e);
  }
}
/**
 * @param {HTMLCanvasElement} canvas
 * @param {Integer} topX
 * @param {Integer} topY
 * @param {Integer} width
 * @param {Integer} height
 * @param {Float} radius
 * @returns {undefined}
 */


function processCanvasRGBA(canvas, topX, topY, width, height, radius) {
  if (isNaN(radius) || radius < 1) {
    return;
  }

  radius |= 0;
  var imageData = getImageDataFromCanvas(canvas, topX, topY, width, height);
  imageData = processImageDataRGBA(imageData, topX, topY, width, height, radius);
  canvas.getContext('2d').putImageData(imageData, topX, topY);
}
/**
 * @param {ImageData} imageData
 * @param {Integer} topX
 * @param {Integer} topY
 * @param {Integer} width
 * @param {Integer} height
 * @param {Float} radius
 * @returns {ImageData}
 */


function processImageDataRGBA(imageData, topX, topY, width, height, radius) {
  var pixels = imageData.data;
  var div = 2 * radius + 1; // const w4 = width << 2;

  var widthMinus1 = width - 1;
  var heightMinus1 = height - 1;
  var radiusPlus1 = radius + 1;
  var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
  var stackStart = new BlurStack();
  var stack = stackStart;
  var stackEnd;

  for (var i = 1; i < div; i++) {
    stack = stack.next = new BlurStack();

    if (i === radiusPlus1) {
      stackEnd = stack;
    }
  }

  stack.next = stackStart;
  var stackIn = null,
      stackOut = null,
      yw = 0,
      yi = 0;
  var mulSum = mulTable[radius];
  var shgSum = shgTable[radius];

  for (var y = 0; y < height; y++) {
    stack = stackStart;
    var pr = pixels[yi],
        pg = pixels[yi + 1],
        pb = pixels[yi + 2],
        pa = pixels[yi + 3];

    for (var _i = 0; _i < radiusPlus1; _i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack.a = pa;
      stack = stack.next;
    }

    var rInSum = 0,
        gInSum = 0,
        bInSum = 0,
        aInSum = 0,
        rOutSum = radiusPlus1 * pr,
        gOutSum = radiusPlus1 * pg,
        bOutSum = radiusPlus1 * pb,
        aOutSum = radiusPlus1 * pa,
        rSum = sumFactor * pr,
        gSum = sumFactor * pg,
        bSum = sumFactor * pb,
        aSum = sumFactor * pa;

    for (var _i2 = 1; _i2 < radiusPlus1; _i2++) {
      var p = yi + ((widthMinus1 < _i2 ? widthMinus1 : _i2) << 2);
      var r = pixels[p],
          g = pixels[p + 1],
          b = pixels[p + 2],
          a = pixels[p + 3];
      var rbs = radiusPlus1 - _i2;
      rSum += (stack.r = r) * rbs;
      gSum += (stack.g = g) * rbs;
      bSum += (stack.b = b) * rbs;
      aSum += (stack.a = a) * rbs;
      rInSum += r;
      gInSum += g;
      bInSum += b;
      aInSum += a;
      stack = stack.next;
    }

    stackIn = stackStart;
    stackOut = stackEnd;

    for (var x = 0; x < width; x++) {
      var paInitial = aSum * mulSum >>> shgSum;
      pixels[yi + 3] = paInitial;

      if (paInitial !== 0) {
        var _a2 = 255 / paInitial;

        pixels[yi] = (rSum * mulSum >>> shgSum) * _a2;
        pixels[yi + 1] = (gSum * mulSum >>> shgSum) * _a2;
        pixels[yi + 2] = (bSum * mulSum >>> shgSum) * _a2;
      } else {
        pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
      }

      rSum -= rOutSum;
      gSum -= gOutSum;
      bSum -= bOutSum;
      aSum -= aOutSum;
      rOutSum -= stackIn.r;
      gOutSum -= stackIn.g;
      bOutSum -= stackIn.b;
      aOutSum -= stackIn.a;

      var _p = x + radius + 1;

      _p = yw + (_p < widthMinus1 ? _p : widthMinus1) << 2;
      rInSum += stackIn.r = pixels[_p];
      gInSum += stackIn.g = pixels[_p + 1];
      bInSum += stackIn.b = pixels[_p + 2];
      aInSum += stackIn.a = pixels[_p + 3];
      rSum += rInSum;
      gSum += gInSum;
      bSum += bInSum;
      aSum += aInSum;
      stackIn = stackIn.next;
      var _stackOut = stackOut,
          _r = _stackOut.r,
          _g = _stackOut.g,
          _b = _stackOut.b,
          _a = _stackOut.a;
      rOutSum += _r;
      gOutSum += _g;
      bOutSum += _b;
      aOutSum += _a;
      rInSum -= _r;
      gInSum -= _g;
      bInSum -= _b;
      aInSum -= _a;
      stackOut = stackOut.next;
      yi += 4;
    }

    yw += width;
  }

  for (var _x = 0; _x < width; _x++) {
    yi = _x << 2;

    var _pr = pixels[yi],
        _pg = pixels[yi + 1],
        _pb = pixels[yi + 2],
        _pa = pixels[yi + 3],
        _rOutSum = radiusPlus1 * _pr,
        _gOutSum = radiusPlus1 * _pg,
        _bOutSum = radiusPlus1 * _pb,
        _aOutSum = radiusPlus1 * _pa,
        _rSum = sumFactor * _pr,
        _gSum = sumFactor * _pg,
        _bSum = sumFactor * _pb,
        _aSum = sumFactor * _pa;

    stack = stackStart;

    for (var _i3 = 0; _i3 < radiusPlus1; _i3++) {
      stack.r = _pr;
      stack.g = _pg;
      stack.b = _pb;
      stack.a = _pa;
      stack = stack.next;
    }

    var yp = width;
    var _gInSum = 0,
        _bInSum = 0,
        _aInSum = 0,
        _rInSum = 0;

    for (var _i4 = 1; _i4 <= radius; _i4++) {
      yi = yp + _x << 2;

      var _rbs = radiusPlus1 - _i4;

      _rSum += (stack.r = _pr = pixels[yi]) * _rbs;
      _gSum += (stack.g = _pg = pixels[yi + 1]) * _rbs;
      _bSum += (stack.b = _pb = pixels[yi + 2]) * _rbs;
      _aSum += (stack.a = _pa = pixels[yi + 3]) * _rbs;
      _rInSum += _pr;
      _gInSum += _pg;
      _bInSum += _pb;
      _aInSum += _pa;
      stack = stack.next;

      if (_i4 < heightMinus1) {
        yp += width;
      }
    }

    yi = _x;
    stackIn = stackStart;
    stackOut = stackEnd;

    for (var _y = 0; _y < height; _y++) {
      var _p2 = yi << 2;

      pixels[_p2 + 3] = _pa = _aSum * mulSum >>> shgSum;

      if (_pa > 0) {
        _pa = 255 / _pa;
        pixels[_p2] = (_rSum * mulSum >>> shgSum) * _pa;
        pixels[_p2 + 1] = (_gSum * mulSum >>> shgSum) * _pa;
        pixels[_p2 + 2] = (_bSum * mulSum >>> shgSum) * _pa;
      } else {
        pixels[_p2] = pixels[_p2 + 1] = pixels[_p2 + 2] = 0;
      }

      _rSum -= _rOutSum;
      _gSum -= _gOutSum;
      _bSum -= _bOutSum;
      _aSum -= _aOutSum;
      _rOutSum -= stackIn.r;
      _gOutSum -= stackIn.g;
      _bOutSum -= stackIn.b;
      _aOutSum -= stackIn.a;
      _p2 = _x + ((_p2 = _y + radiusPlus1) < heightMinus1 ? _p2 : heightMinus1) * width << 2;
      _rSum += _rInSum += stackIn.r = pixels[_p2];
      _gSum += _gInSum += stackIn.g = pixels[_p2 + 1];
      _bSum += _bInSum += stackIn.b = pixels[_p2 + 2];
      _aSum += _aInSum += stackIn.a = pixels[_p2 + 3];
      stackIn = stackIn.next;
      _rOutSum += _pr = stackOut.r;
      _gOutSum += _pg = stackOut.g;
      _bOutSum += _pb = stackOut.b;
      _aOutSum += _pa = stackOut.a;
      _rInSum -= _pr;
      _gInSum -= _pg;
      _bInSum -= _pb;
      _aInSum -= _pa;
      stackOut = stackOut.next;
      yi += width;
    }
  }

  return imageData;
}
/**
 * @param {HTMLCanvasElement} canvas
 * @param {Integer} topX
 * @param {Integer} topY
 * @param {Integer} width
 * @param {Integer} height
 * @param {Float} radius
 * @returns {undefined}
 */


function processCanvasRGB(canvas, topX, topY, width, height, radius) {
  if (isNaN(radius) || radius < 1) {
    return;
  }

  radius |= 0;
  var imageData = getImageDataFromCanvas(canvas, topX, topY, width, height);
  imageData = processImageDataRGB(imageData, topX, topY, width, height, radius);
  canvas.getContext('2d').putImageData(imageData, topX, topY);
}
/**
 * @param {ImageData} imageData
 * @param {Integer} topX
 * @param {Integer} topY
 * @param {Integer} width
 * @param {Integer} height
 * @param {Float} radius
 * @returns {ImageData}
 */


function processImageDataRGB(imageData, topX, topY, width, height, radius) {
  var pixels = imageData.data;
  var div = 2 * radius + 1; // const w4 = width << 2;

  var widthMinus1 = width - 1;
  var heightMinus1 = height - 1;
  var radiusPlus1 = radius + 1;
  var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
  var stackStart = new BlurStack();
  var stack = stackStart;
  var stackEnd;

  for (var i = 1; i < div; i++) {
    stack = stack.next = new BlurStack();

    if (i === radiusPlus1) {
      stackEnd = stack;
    }
  }

  stack.next = stackStart;
  var stackIn = null;
  var stackOut = null;
  var mulSum = mulTable[radius];
  var shgSum = shgTable[radius];
  var p, rbs;
  var yw = 0,
      yi = 0;

  for (var y = 0; y < height; y++) {
    var pr = pixels[yi],
        pg = pixels[yi + 1],
        pb = pixels[yi + 2],
        rOutSum = radiusPlus1 * pr,
        gOutSum = radiusPlus1 * pg,
        bOutSum = radiusPlus1 * pb,
        rSum = sumFactor * pr,
        gSum = sumFactor * pg,
        bSum = sumFactor * pb;
    stack = stackStart;

    for (var _i5 = 0; _i5 < radiusPlus1; _i5++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack = stack.next;
    }

    var rInSum = 0,
        gInSum = 0,
        bInSum = 0;

    for (var _i6 = 1; _i6 < radiusPlus1; _i6++) {
      p = yi + ((widthMinus1 < _i6 ? widthMinus1 : _i6) << 2);
      rSum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - _i6);
      gSum += (stack.g = pg = pixels[p + 1]) * rbs;
      bSum += (stack.b = pb = pixels[p + 2]) * rbs;
      rInSum += pr;
      gInSum += pg;
      bInSum += pb;
      stack = stack.next;
    }

    stackIn = stackStart;
    stackOut = stackEnd;

    for (var x = 0; x < width; x++) {
      pixels[yi] = rSum * mulSum >>> shgSum;
      pixels[yi + 1] = gSum * mulSum >>> shgSum;
      pixels[yi + 2] = bSum * mulSum >>> shgSum;
      rSum -= rOutSum;
      gSum -= gOutSum;
      bSum -= bOutSum;
      rOutSum -= stackIn.r;
      gOutSum -= stackIn.g;
      bOutSum -= stackIn.b;
      p = yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1) << 2;
      rInSum += stackIn.r = pixels[p];
      gInSum += stackIn.g = pixels[p + 1];
      bInSum += stackIn.b = pixels[p + 2];
      rSum += rInSum;
      gSum += gInSum;
      bSum += bInSum;
      stackIn = stackIn.next;
      rOutSum += pr = stackOut.r;
      gOutSum += pg = stackOut.g;
      bOutSum += pb = stackOut.b;
      rInSum -= pr;
      gInSum -= pg;
      bInSum -= pb;
      stackOut = stackOut.next;
      yi += 4;
    }

    yw += width;
  }

  for (var _x2 = 0; _x2 < width; _x2++) {
    yi = _x2 << 2;

    var _pr2 = pixels[yi],
        _pg2 = pixels[yi + 1],
        _pb2 = pixels[yi + 2],
        _rOutSum2 = radiusPlus1 * _pr2,
        _gOutSum2 = radiusPlus1 * _pg2,
        _bOutSum2 = radiusPlus1 * _pb2,
        _rSum2 = sumFactor * _pr2,
        _gSum2 = sumFactor * _pg2,
        _bSum2 = sumFactor * _pb2;

    stack = stackStart;

    for (var _i7 = 0; _i7 < radiusPlus1; _i7++) {
      stack.r = _pr2;
      stack.g = _pg2;
      stack.b = _pb2;
      stack = stack.next;
    }

    var _rInSum2 = 0,
        _gInSum2 = 0,
        _bInSum2 = 0;

    for (var _i8 = 1, yp = width; _i8 <= radius; _i8++) {
      yi = yp + _x2 << 2;
      _rSum2 += (stack.r = _pr2 = pixels[yi]) * (rbs = radiusPlus1 - _i8);
      _gSum2 += (stack.g = _pg2 = pixels[yi + 1]) * rbs;
      _bSum2 += (stack.b = _pb2 = pixels[yi + 2]) * rbs;
      _rInSum2 += _pr2;
      _gInSum2 += _pg2;
      _bInSum2 += _pb2;
      stack = stack.next;

      if (_i8 < heightMinus1) {
        yp += width;
      }
    }

    yi = _x2;
    stackIn = stackStart;
    stackOut = stackEnd;

    for (var _y2 = 0; _y2 < height; _y2++) {
      p = yi << 2;
      pixels[p] = _rSum2 * mulSum >>> shgSum;
      pixels[p + 1] = _gSum2 * mulSum >>> shgSum;
      pixels[p + 2] = _bSum2 * mulSum >>> shgSum;
      _rSum2 -= _rOutSum2;
      _gSum2 -= _gOutSum2;
      _bSum2 -= _bOutSum2;
      _rOutSum2 -= stackIn.r;
      _gOutSum2 -= stackIn.g;
      _bOutSum2 -= stackIn.b;
      p = _x2 + ((p = _y2 + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;
      _rSum2 += _rInSum2 += stackIn.r = pixels[p];
      _gSum2 += _gInSum2 += stackIn.g = pixels[p + 1];
      _bSum2 += _bInSum2 += stackIn.b = pixels[p + 2];
      stackIn = stackIn.next;
      _rOutSum2 += _pr2 = stackOut.r;
      _gOutSum2 += _pg2 = stackOut.g;
      _bOutSum2 += _pb2 = stackOut.b;
      _rInSum2 -= _pr2;
      _gInSum2 -= _pg2;
      _bInSum2 -= _pb2;
      stackOut = stackOut.next;
      yi += width;
    }
  }

  return imageData;
}
/**
 *
 */


var BlurStack =
/**
 * Set properties.
 */
function BlurStack() {
  _classCallCheck(this, BlurStack);

  this.r = 0;
  this.g = 0;
  this.b = 0;
  this.a = 0;
  this.next = null;
};




/***/ }),

/***/ 55056:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ 55618:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  vt: () => (/* reexport */ create)
});

// UNUSED EXPORTS: createStore, useStore

;// ./node_modules/zustand/esm/vanilla.mjs
const createStoreImpl = (createState) => {
  let state;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const api = { setState, getState, getInitialState, subscribe };
  const initialState = state = createState(setState, getState, api);
  return api;
};
const createStore = ((createState) => createState ? createStoreImpl(createState) : createStoreImpl);



// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
;// ./node_modules/zustand/esm/react.mjs



const identity = (arg) => arg;
function useStore(api, selector = identity) {
  const slice = react.useSyncExternalStore(
    api.subscribe,
    react.useCallback(() => selector(api.getState()), [api, selector]),
    react.useCallback(() => selector(api.getInitialState()), [api, selector])
  );
  react.useDebugValue(slice);
  return slice;
}
const createImpl = (createState) => {
  const api = createStore(createState);
  const useBoundStore = (selector) => useStore(api, selector);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
const create = ((createState) => createState ? createImpl(createState) : createImpl);



;// ./node_modules/zustand/esm/index.mjs




/***/ }),

/***/ 63711:
/***/ ((__unused_webpack___webpack_module__, __unused_webpack___webpack_exports__, __webpack_require__) => {


// UNUSED EXPORTS: _

;// ./node_modules/@swc/helpers/esm/_class_apply_descriptor_get.js
function _class_apply_descriptor_get_class_apply_descriptor_get(receiver, descriptor) {
    if (descriptor.get) return descriptor.get.call(receiver);

    return descriptor.value;
}


// EXTERNAL MODULE: ./node_modules/@swc/helpers/esm/_class_extract_field_descriptor.js
var esm_class_extract_field_descriptor = __webpack_require__(6923);
;// ./node_modules/@swc/helpers/esm/_class_private_field_get.js



function _class_private_field_get(receiver, privateMap) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "get");
    return _class_apply_descriptor_get(receiver, descriptor);
}



/***/ }),

/***/ 69242:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



if (false) // removed by dead control flow
{} else {
  module.exports = __webpack_require__(83160);
}


/***/ }),

/***/ 72181:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Te: () => (/* binding */ useVirtualizer)
});

// UNUSED EXPORTS: Virtualizer, approxEqual, debounce, defaultKeyExtractor, defaultRangeExtractor, elementScroll, measureElement, memo, notUndefined, observeElementOffset, observeElementRect, observeWindowOffset, observeWindowRect, useWindowVirtualizer, windowScroll

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/react-dom/index.js
var react_dom = __webpack_require__(40961);
;// ./node_modules/@tanstack/virtual-core/dist/esm/utils.js
function memo(getDeps, fn, opts) {
  let deps = opts.initialDeps ?? [];
  let result;
  function memoizedFunction() {
    var _a, _b, _c, _d;
    let depTime;
    if (opts.key && ((_a = opts.debug) == null ? void 0 : _a.call(opts))) depTime = Date.now();
    const newDeps = getDeps();
    const depsChanged = newDeps.length !== deps.length || newDeps.some((dep, index) => deps[index] !== dep);
    if (!depsChanged) {
      return result;
    }
    deps = newDeps;
    let resultTime;
    if (opts.key && ((_b = opts.debug) == null ? void 0 : _b.call(opts))) resultTime = Date.now();
    result = fn(...newDeps);
    if (opts.key && ((_c = opts.debug) == null ? void 0 : _c.call(opts))) {
      const depEndTime = Math.round((Date.now() - depTime) * 100) / 100;
      const resultEndTime = Math.round((Date.now() - resultTime) * 100) / 100;
      const resultFpsPercentage = resultEndTime / 16;
      const pad = (str, num) => {
        str = String(str);
        while (str.length < num) {
          str = " " + str;
        }
        return str;
      };
      console.info(
        `%c⏱ ${pad(resultEndTime, 5)} /${pad(depEndTime, 5)} ms`,
        `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(
          0,
          Math.min(120 - 120 * resultFpsPercentage, 120)
        )}deg 100% 31%);`,
        opts == null ? void 0 : opts.key
      );
    }
    (_d = opts == null ? void 0 : opts.onChange) == null ? void 0 : _d.call(opts, result);
    return result;
  }
  memoizedFunction.updateDeps = (newDeps) => {
    deps = newDeps;
  };
  return memoizedFunction;
}
function notUndefined(value, msg) {
  if (value === void 0) {
    throw new Error(`Unexpected undefined${msg ? `: ${msg}` : ""}`);
  } else {
    return value;
  }
}
const approxEqual = (a, b) => Math.abs(a - b) < 1.01;
const utils_debounce = (targetWindow, fn, ms) => {
  let timeoutId;
  return function(...args) {
    targetWindow.clearTimeout(timeoutId);
    timeoutId = targetWindow.setTimeout(() => fn.apply(this, args), ms);
  };
};

//# sourceMappingURL=utils.js.map

;// ./node_modules/@tanstack/virtual-core/dist/esm/index.js

const getRect = (element) => {
  const { offsetWidth, offsetHeight } = element;
  return { width: offsetWidth, height: offsetHeight };
};
const defaultKeyExtractor = (index) => index;
const defaultRangeExtractor = (range) => {
  const start = Math.max(range.startIndex - range.overscan, 0);
  const end = Math.min(range.endIndex + range.overscan, range.count - 1);
  const arr = [];
  for (let i = start; i <= end; i++) {
    arr.push(i);
  }
  return arr;
};
const observeElementRect = (instance, cb) => {
  const element = instance.scrollElement;
  if (!element) {
    return;
  }
  const targetWindow = instance.targetWindow;
  if (!targetWindow) {
    return;
  }
  const handler = (rect) => {
    const { width, height } = rect;
    cb({ width: Math.round(width), height: Math.round(height) });
  };
  handler(getRect(element));
  if (!targetWindow.ResizeObserver) {
    return () => {
    };
  }
  const observer = new targetWindow.ResizeObserver((entries) => {
    const run = () => {
      const entry = entries[0];
      if (entry == null ? void 0 : entry.borderBoxSize) {
        const box = entry.borderBoxSize[0];
        if (box) {
          handler({ width: box.inlineSize, height: box.blockSize });
          return;
        }
      }
      handler(getRect(element));
    };
    instance.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(run) : run();
  });
  observer.observe(element, { box: "border-box" });
  return () => {
    observer.unobserve(element);
  };
};
const addEventListenerOptions = {
  passive: true
};
const esm_observeWindowRect = (instance, cb) => {
  const element = instance.scrollElement;
  if (!element) {
    return;
  }
  const handler = () => {
    cb({ width: element.innerWidth, height: element.innerHeight });
  };
  handler();
  element.addEventListener("resize", handler, addEventListenerOptions);
  return () => {
    element.removeEventListener("resize", handler);
  };
};
const supportsScrollend = typeof window == "undefined" ? true : "onscrollend" in window;
const observeElementOffset = (instance, cb) => {
  const element = instance.scrollElement;
  if (!element) {
    return;
  }
  const targetWindow = instance.targetWindow;
  if (!targetWindow) {
    return;
  }
  let offset = 0;
  const fallback = instance.options.useScrollendEvent && supportsScrollend ? () => void 0 : utils_debounce(
    targetWindow,
    () => {
      cb(offset, false);
    },
    instance.options.isScrollingResetDelay
  );
  const createHandler = (isScrolling) => () => {
    const { horizontal, isRtl } = instance.options;
    offset = horizontal ? element["scrollLeft"] * (isRtl && -1 || 1) : element["scrollTop"];
    fallback();
    cb(offset, isScrolling);
  };
  const handler = createHandler(true);
  const endHandler = createHandler(false);
  endHandler();
  element.addEventListener("scroll", handler, addEventListenerOptions);
  const registerScrollendEvent = instance.options.useScrollendEvent && supportsScrollend;
  if (registerScrollendEvent) {
    element.addEventListener("scrollend", endHandler, addEventListenerOptions);
  }
  return () => {
    element.removeEventListener("scroll", handler);
    if (registerScrollendEvent) {
      element.removeEventListener("scrollend", endHandler);
    }
  };
};
const esm_observeWindowOffset = (instance, cb) => {
  const element = instance.scrollElement;
  if (!element) {
    return;
  }
  const targetWindow = instance.targetWindow;
  if (!targetWindow) {
    return;
  }
  let offset = 0;
  const fallback = instance.options.useScrollendEvent && supportsScrollend ? () => void 0 : debounce(
    targetWindow,
    () => {
      cb(offset, false);
    },
    instance.options.isScrollingResetDelay
  );
  const createHandler = (isScrolling) => () => {
    offset = element[instance.options.horizontal ? "scrollX" : "scrollY"];
    fallback();
    cb(offset, isScrolling);
  };
  const handler = createHandler(true);
  const endHandler = createHandler(false);
  endHandler();
  element.addEventListener("scroll", handler, addEventListenerOptions);
  const registerScrollendEvent = instance.options.useScrollendEvent && supportsScrollend;
  if (registerScrollendEvent) {
    element.addEventListener("scrollend", endHandler, addEventListenerOptions);
  }
  return () => {
    element.removeEventListener("scroll", handler);
    if (registerScrollendEvent) {
      element.removeEventListener("scrollend", endHandler);
    }
  };
};
const measureElement = (element, entry, instance) => {
  if (entry == null ? void 0 : entry.borderBoxSize) {
    const box = entry.borderBoxSize[0];
    if (box) {
      const size = Math.round(
        box[instance.options.horizontal ? "inlineSize" : "blockSize"]
      );
      return size;
    }
  }
  return element[instance.options.horizontal ? "offsetWidth" : "offsetHeight"];
};
const esm_windowScroll = (offset, {
  adjustments = 0,
  behavior
}, instance) => {
  var _a, _b;
  const toOffset = offset + adjustments;
  (_b = (_a = instance.scrollElement) == null ? void 0 : _a.scrollTo) == null ? void 0 : _b.call(_a, {
    [instance.options.horizontal ? "left" : "top"]: toOffset,
    behavior
  });
};
const elementScroll = (offset, {
  adjustments = 0,
  behavior
}, instance) => {
  var _a, _b;
  const toOffset = offset + adjustments;
  (_b = (_a = instance.scrollElement) == null ? void 0 : _a.scrollTo) == null ? void 0 : _b.call(_a, {
    [instance.options.horizontal ? "left" : "top"]: toOffset,
    behavior
  });
};
class Virtualizer {
  constructor(opts) {
    this.unsubs = [];
    this.scrollElement = null;
    this.targetWindow = null;
    this.isScrolling = false;
    this.measurementsCache = [];
    this.itemSizeCache = /* @__PURE__ */ new Map();
    this.pendingMeasuredCacheIndexes = [];
    this.scrollRect = null;
    this.scrollOffset = null;
    this.scrollDirection = null;
    this.scrollAdjustments = 0;
    this.elementsCache = /* @__PURE__ */ new Map();
    this.observer = /* @__PURE__ */ (() => {
      let _ro = null;
      const get = () => {
        if (_ro) {
          return _ro;
        }
        if (!this.targetWindow || !this.targetWindow.ResizeObserver) {
          return null;
        }
        return _ro = new this.targetWindow.ResizeObserver((entries) => {
          entries.forEach((entry) => {
            const run = () => {
              this._measureElement(entry.target, entry);
            };
            this.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(run) : run();
          });
        });
      };
      return {
        disconnect: () => {
          var _a;
          (_a = get()) == null ? void 0 : _a.disconnect();
          _ro = null;
        },
        observe: (target) => {
          var _a;
          return (_a = get()) == null ? void 0 : _a.observe(target, { box: "border-box" });
        },
        unobserve: (target) => {
          var _a;
          return (_a = get()) == null ? void 0 : _a.unobserve(target);
        }
      };
    })();
    this.range = null;
    this.setOptions = (opts2) => {
      Object.entries(opts2).forEach(([key, value]) => {
        if (typeof value === "undefined") delete opts2[key];
      });
      this.options = {
        debug: false,
        initialOffset: 0,
        overscan: 1,
        paddingStart: 0,
        paddingEnd: 0,
        scrollPaddingStart: 0,
        scrollPaddingEnd: 0,
        horizontal: false,
        getItemKey: defaultKeyExtractor,
        rangeExtractor: defaultRangeExtractor,
        onChange: () => {
        },
        measureElement,
        initialRect: { width: 0, height: 0 },
        scrollMargin: 0,
        gap: 0,
        indexAttribute: "data-index",
        initialMeasurementsCache: [],
        lanes: 1,
        isScrollingResetDelay: 150,
        enabled: true,
        isRtl: false,
        useScrollendEvent: false,
        useAnimationFrameWithResizeObserver: false,
        ...opts2
      };
    };
    this.notify = (sync) => {
      var _a, _b;
      (_b = (_a = this.options).onChange) == null ? void 0 : _b.call(_a, this, sync);
    };
    this.maybeNotify = memo(
      () => {
        this.calculateRange();
        return [
          this.isScrolling,
          this.range ? this.range.startIndex : null,
          this.range ? this.range.endIndex : null
        ];
      },
      (isScrolling) => {
        this.notify(isScrolling);
      },
      {
        key:  true && "maybeNotify",
        debug: () => this.options.debug,
        initialDeps: [
          this.isScrolling,
          this.range ? this.range.startIndex : null,
          this.range ? this.range.endIndex : null
        ]
      }
    );
    this.cleanup = () => {
      this.unsubs.filter(Boolean).forEach((d) => d());
      this.unsubs = [];
      this.observer.disconnect();
      this.scrollElement = null;
      this.targetWindow = null;
    };
    this._didMount = () => {
      return () => {
        this.cleanup();
      };
    };
    this._willUpdate = () => {
      var _a;
      const scrollElement = this.options.enabled ? this.options.getScrollElement() : null;
      if (this.scrollElement !== scrollElement) {
        this.cleanup();
        if (!scrollElement) {
          this.maybeNotify();
          return;
        }
        this.scrollElement = scrollElement;
        if (this.scrollElement && "ownerDocument" in this.scrollElement) {
          this.targetWindow = this.scrollElement.ownerDocument.defaultView;
        } else {
          this.targetWindow = ((_a = this.scrollElement) == null ? void 0 : _a.window) ?? null;
        }
        this.elementsCache.forEach((cached) => {
          this.observer.observe(cached);
        });
        this._scrollToOffset(this.getScrollOffset(), {
          adjustments: void 0,
          behavior: void 0
        });
        this.unsubs.push(
          this.options.observeElementRect(this, (rect) => {
            this.scrollRect = rect;
            this.maybeNotify();
          })
        );
        this.unsubs.push(
          this.options.observeElementOffset(this, (offset, isScrolling) => {
            this.scrollAdjustments = 0;
            this.scrollDirection = isScrolling ? this.getScrollOffset() < offset ? "forward" : "backward" : null;
            this.scrollOffset = offset;
            this.isScrolling = isScrolling;
            this.maybeNotify();
          })
        );
      }
    };
    this.getSize = () => {
      if (!this.options.enabled) {
        this.scrollRect = null;
        return 0;
      }
      this.scrollRect = this.scrollRect ?? this.options.initialRect;
      return this.scrollRect[this.options.horizontal ? "width" : "height"];
    };
    this.getScrollOffset = () => {
      if (!this.options.enabled) {
        this.scrollOffset = null;
        return 0;
      }
      this.scrollOffset = this.scrollOffset ?? (typeof this.options.initialOffset === "function" ? this.options.initialOffset() : this.options.initialOffset);
      return this.scrollOffset;
    };
    this.getFurthestMeasurement = (measurements, index) => {
      const furthestMeasurementsFound = /* @__PURE__ */ new Map();
      const furthestMeasurements = /* @__PURE__ */ new Map();
      for (let m = index - 1; m >= 0; m--) {
        const measurement = measurements[m];
        if (furthestMeasurementsFound.has(measurement.lane)) {
          continue;
        }
        const previousFurthestMeasurement = furthestMeasurements.get(
          measurement.lane
        );
        if (previousFurthestMeasurement == null || measurement.end > previousFurthestMeasurement.end) {
          furthestMeasurements.set(measurement.lane, measurement);
        } else if (measurement.end < previousFurthestMeasurement.end) {
          furthestMeasurementsFound.set(measurement.lane, true);
        }
        if (furthestMeasurementsFound.size === this.options.lanes) {
          break;
        }
      }
      return furthestMeasurements.size === this.options.lanes ? Array.from(furthestMeasurements.values()).sort((a, b) => {
        if (a.end === b.end) {
          return a.index - b.index;
        }
        return a.end - b.end;
      })[0] : void 0;
    };
    this.getMeasurementOptions = memo(
      () => [
        this.options.count,
        this.options.paddingStart,
        this.options.scrollMargin,
        this.options.getItemKey,
        this.options.enabled
      ],
      (count, paddingStart, scrollMargin, getItemKey, enabled) => {
        this.pendingMeasuredCacheIndexes = [];
        return {
          count,
          paddingStart,
          scrollMargin,
          getItemKey,
          enabled
        };
      },
      {
        key: false
      }
    );
    this.getMeasurements = memo(
      () => [this.getMeasurementOptions(), this.itemSizeCache],
      ({ count, paddingStart, scrollMargin, getItemKey, enabled }, itemSizeCache) => {
        if (!enabled) {
          this.measurementsCache = [];
          this.itemSizeCache.clear();
          return [];
        }
        if (this.measurementsCache.length === 0) {
          this.measurementsCache = this.options.initialMeasurementsCache;
          this.measurementsCache.forEach((item) => {
            this.itemSizeCache.set(item.key, item.size);
          });
        }
        const min = this.pendingMeasuredCacheIndexes.length > 0 ? Math.min(...this.pendingMeasuredCacheIndexes) : 0;
        this.pendingMeasuredCacheIndexes = [];
        const measurements = this.measurementsCache.slice(0, min);
        for (let i = min; i < count; i++) {
          const key = getItemKey(i);
          const furthestMeasurement = this.options.lanes === 1 ? measurements[i - 1] : this.getFurthestMeasurement(measurements, i);
          const start = furthestMeasurement ? furthestMeasurement.end + this.options.gap : paddingStart + scrollMargin;
          const measuredSize = itemSizeCache.get(key);
          const size = typeof measuredSize === "number" ? measuredSize : this.options.estimateSize(i);
          const end = start + size;
          const lane = furthestMeasurement ? furthestMeasurement.lane : i % this.options.lanes;
          measurements[i] = {
            index: i,
            start,
            size,
            end,
            key,
            lane
          };
        }
        this.measurementsCache = measurements;
        return measurements;
      },
      {
        key:  true && "getMeasurements",
        debug: () => this.options.debug
      }
    );
    this.calculateRange = memo(
      () => [
        this.getMeasurements(),
        this.getSize(),
        this.getScrollOffset(),
        this.options.lanes
      ],
      (measurements, outerSize, scrollOffset, lanes) => {
        return this.range = measurements.length > 0 && outerSize > 0 ? calculateRange({
          measurements,
          outerSize,
          scrollOffset,
          lanes
        }) : null;
      },
      {
        key:  true && "calculateRange",
        debug: () => this.options.debug
      }
    );
    this.getVirtualIndexes = memo(
      () => {
        let startIndex = null;
        let endIndex = null;
        const range = this.calculateRange();
        if (range) {
          startIndex = range.startIndex;
          endIndex = range.endIndex;
        }
        this.maybeNotify.updateDeps([this.isScrolling, startIndex, endIndex]);
        return [
          this.options.rangeExtractor,
          this.options.overscan,
          this.options.count,
          startIndex,
          endIndex
        ];
      },
      (rangeExtractor, overscan, count, startIndex, endIndex) => {
        return startIndex === null || endIndex === null ? [] : rangeExtractor({
          startIndex,
          endIndex,
          overscan,
          count
        });
      },
      {
        key:  true && "getVirtualIndexes",
        debug: () => this.options.debug
      }
    );
    this.indexFromElement = (node) => {
      const attributeName = this.options.indexAttribute;
      const indexStr = node.getAttribute(attributeName);
      if (!indexStr) {
        console.warn(
          `Missing attribute name '${attributeName}={index}' on measured element.`
        );
        return -1;
      }
      return parseInt(indexStr, 10);
    };
    this._measureElement = (node, entry) => {
      const index = this.indexFromElement(node);
      const item = this.measurementsCache[index];
      if (!item) {
        return;
      }
      const key = item.key;
      const prevNode = this.elementsCache.get(key);
      if (prevNode !== node) {
        if (prevNode) {
          this.observer.unobserve(prevNode);
        }
        this.observer.observe(node);
        this.elementsCache.set(key, node);
      }
      if (node.isConnected) {
        this.resizeItem(index, this.options.measureElement(node, entry, this));
      }
    };
    this.resizeItem = (index, size) => {
      const item = this.measurementsCache[index];
      if (!item) {
        return;
      }
      const itemSize = this.itemSizeCache.get(item.key) ?? item.size;
      const delta = size - itemSize;
      if (delta !== 0) {
        if (this.shouldAdjustScrollPositionOnItemSizeChange !== void 0 ? this.shouldAdjustScrollPositionOnItemSizeChange(item, delta, this) : item.start < this.getScrollOffset() + this.scrollAdjustments) {
          if ( true && this.options.debug) {
            console.info("correction", delta);
          }
          this._scrollToOffset(this.getScrollOffset(), {
            adjustments: this.scrollAdjustments += delta,
            behavior: void 0
          });
        }
        this.pendingMeasuredCacheIndexes.push(item.index);
        this.itemSizeCache = new Map(this.itemSizeCache.set(item.key, size));
        this.notify(false);
      }
    };
    this.measureElement = (node) => {
      if (!node) {
        this.elementsCache.forEach((cached, key) => {
          if (!cached.isConnected) {
            this.observer.unobserve(cached);
            this.elementsCache.delete(key);
          }
        });
        return;
      }
      this._measureElement(node, void 0);
    };
    this.getVirtualItems = memo(
      () => [this.getVirtualIndexes(), this.getMeasurements()],
      (indexes, measurements) => {
        const virtualItems = [];
        for (let k = 0, len = indexes.length; k < len; k++) {
          const i = indexes[k];
          const measurement = measurements[i];
          virtualItems.push(measurement);
        }
        return virtualItems;
      },
      {
        key:  true && "getVirtualItems",
        debug: () => this.options.debug
      }
    );
    this.getVirtualItemForOffset = (offset) => {
      const measurements = this.getMeasurements();
      if (measurements.length === 0) {
        return void 0;
      }
      return notUndefined(
        measurements[findNearestBinarySearch(
          0,
          measurements.length - 1,
          (index) => notUndefined(measurements[index]).start,
          offset
        )]
      );
    };
    this.getOffsetForAlignment = (toOffset, align, itemSize = 0) => {
      const size = this.getSize();
      const scrollOffset = this.getScrollOffset();
      if (align === "auto") {
        align = toOffset >= scrollOffset + size ? "end" : "start";
      }
      if (align === "center") {
        toOffset += (itemSize - size) / 2;
      } else if (align === "end") {
        toOffset -= size;
      }
      const maxOffset = this.getTotalSize() + this.options.scrollMargin - size;
      return Math.max(Math.min(maxOffset, toOffset), 0);
    };
    this.getOffsetForIndex = (index, align = "auto") => {
      index = Math.max(0, Math.min(index, this.options.count - 1));
      const item = this.measurementsCache[index];
      if (!item) {
        return void 0;
      }
      const size = this.getSize();
      const scrollOffset = this.getScrollOffset();
      if (align === "auto") {
        if (item.end >= scrollOffset + size - this.options.scrollPaddingEnd) {
          align = "end";
        } else if (item.start <= scrollOffset + this.options.scrollPaddingStart) {
          align = "start";
        } else {
          return [scrollOffset, align];
        }
      }
      const toOffset = align === "end" ? item.end + this.options.scrollPaddingEnd : item.start - this.options.scrollPaddingStart;
      return [
        this.getOffsetForAlignment(toOffset, align, item.size),
        align
      ];
    };
    this.isDynamicMode = () => this.elementsCache.size > 0;
    this.scrollToOffset = (toOffset, { align = "start", behavior } = {}) => {
      if (behavior === "smooth" && this.isDynamicMode()) {
        console.warn(
          "The `smooth` scroll behavior is not fully supported with dynamic size."
        );
      }
      this._scrollToOffset(this.getOffsetForAlignment(toOffset, align), {
        adjustments: void 0,
        behavior
      });
    };
    this.scrollToIndex = (index, { align: initialAlign = "auto", behavior } = {}) => {
      if (behavior === "smooth" && this.isDynamicMode()) {
        console.warn(
          "The `smooth` scroll behavior is not fully supported with dynamic size."
        );
      }
      index = Math.max(0, Math.min(index, this.options.count - 1));
      let attempts = 0;
      const maxAttempts = 10;
      const tryScroll = (currentAlign) => {
        if (!this.targetWindow) return;
        const offsetInfo = this.getOffsetForIndex(index, currentAlign);
        if (!offsetInfo) {
          console.warn("Failed to get offset for index:", index);
          return;
        }
        const [offset, align] = offsetInfo;
        this._scrollToOffset(offset, { adjustments: void 0, behavior });
        this.targetWindow.requestAnimationFrame(() => {
          const currentOffset = this.getScrollOffset();
          const afterInfo = this.getOffsetForIndex(index, align);
          if (!afterInfo) {
            console.warn("Failed to get offset for index:", index);
            return;
          }
          if (!approxEqual(afterInfo[0], currentOffset)) {
            scheduleRetry(align);
          }
        });
      };
      const scheduleRetry = (align) => {
        if (!this.targetWindow) return;
        attempts++;
        if (attempts < maxAttempts) {
          if ( true && this.options.debug) {
            console.info("Schedule retry", attempts, maxAttempts);
          }
          this.targetWindow.requestAnimationFrame(() => tryScroll(align));
        } else {
          console.warn(
            `Failed to scroll to index ${index} after ${maxAttempts} attempts.`
          );
        }
      };
      tryScroll(initialAlign);
    };
    this.scrollBy = (delta, { behavior } = {}) => {
      if (behavior === "smooth" && this.isDynamicMode()) {
        console.warn(
          "The `smooth` scroll behavior is not fully supported with dynamic size."
        );
      }
      this._scrollToOffset(this.getScrollOffset() + delta, {
        adjustments: void 0,
        behavior
      });
    };
    this.getTotalSize = () => {
      var _a;
      const measurements = this.getMeasurements();
      let end;
      if (measurements.length === 0) {
        end = this.options.paddingStart;
      } else if (this.options.lanes === 1) {
        end = ((_a = measurements[measurements.length - 1]) == null ? void 0 : _a.end) ?? 0;
      } else {
        const endByLane = Array(this.options.lanes).fill(null);
        let endIndex = measurements.length - 1;
        while (endIndex >= 0 && endByLane.some((val) => val === null)) {
          const item = measurements[endIndex];
          if (endByLane[item.lane] === null) {
            endByLane[item.lane] = item.end;
          }
          endIndex--;
        }
        end = Math.max(...endByLane.filter((val) => val !== null));
      }
      return Math.max(
        end - this.options.scrollMargin + this.options.paddingEnd,
        0
      );
    };
    this._scrollToOffset = (offset, {
      adjustments,
      behavior
    }) => {
      this.options.scrollToFn(offset, { behavior, adjustments }, this);
    };
    this.measure = () => {
      this.itemSizeCache = /* @__PURE__ */ new Map();
      this.notify(false);
    };
    this.setOptions(opts);
  }
}
const findNearestBinarySearch = (low, high, getCurrentValue, value) => {
  while (low <= high) {
    const middle = (low + high) / 2 | 0;
    const currentValue = getCurrentValue(middle);
    if (currentValue < value) {
      low = middle + 1;
    } else if (currentValue > value) {
      high = middle - 1;
    } else {
      return middle;
    }
  }
  if (low > 0) {
    return low - 1;
  } else {
    return 0;
  }
};
function calculateRange({
  measurements,
  outerSize,
  scrollOffset,
  lanes
}) {
  const lastIndex = measurements.length - 1;
  const getOffset = (index) => measurements[index].start;
  if (measurements.length <= lanes) {
    return {
      startIndex: 0,
      endIndex: lastIndex
    };
  }
  let startIndex = findNearestBinarySearch(
    0,
    lastIndex,
    getOffset,
    scrollOffset
  );
  let endIndex = startIndex;
  if (lanes === 1) {
    while (endIndex < lastIndex && measurements[endIndex].end < scrollOffset + outerSize) {
      endIndex++;
    }
  } else if (lanes > 1) {
    const endPerLane = Array(lanes).fill(0);
    while (endIndex < lastIndex && endPerLane.some((pos) => pos < scrollOffset + outerSize)) {
      const item = measurements[endIndex];
      endPerLane[item.lane] = item.end;
      endIndex++;
    }
    const startPerLane = Array(lanes).fill(scrollOffset + outerSize);
    while (startIndex >= 0 && startPerLane.some((pos) => pos >= scrollOffset)) {
      const item = measurements[startIndex];
      startPerLane[item.lane] = item.start;
      startIndex--;
    }
    startIndex = Math.max(0, startIndex - startIndex % lanes);
    endIndex = Math.min(lastIndex, endIndex + (lanes - 1 - endIndex % lanes));
  }
  return { startIndex, endIndex };
}

//# sourceMappingURL=index.js.map

;// ./node_modules/@tanstack/react-virtual/dist/esm/index.js




const useIsomorphicLayoutEffect = typeof document !== "undefined" ? react.useLayoutEffect : react.useEffect;
function useVirtualizerBase(options) {
  const rerender = react.useReducer(() => ({}), {})[1];
  const resolvedOptions = {
    ...options,
    onChange: (instance2, sync) => {
      var _a;
      if (sync) {
        (0,react_dom.flushSync)(rerender);
      } else {
        rerender();
      }
      (_a = options.onChange) == null ? void 0 : _a.call(options, instance2, sync);
    }
  };
  const [instance] = react.useState(
    () => new Virtualizer(resolvedOptions)
  );
  instance.setOptions(resolvedOptions);
  useIsomorphicLayoutEffect(() => {
    return instance._didMount();
  }, []);
  useIsomorphicLayoutEffect(() => {
    return instance._willUpdate();
  });
  return instance;
}
function useVirtualizer(options) {
  return useVirtualizerBase({
    observeElementRect: observeElementRect,
    observeElementOffset: observeElementOffset,
    scrollToFn: elementScroll,
    ...options
  });
}
function useWindowVirtualizer(options) {
  return useVirtualizerBase({
    getScrollElement: () => typeof document !== "undefined" ? window : null,
    observeElementRect: observeWindowRect,
    observeElementOffset: observeWindowOffset,
    scrollToFn: windowScroll,
    initialOffset: () => typeof document !== "undefined" ? window.scrollY : 0,
    ...options
  });
}

//# sourceMappingURL=index.js.map


/***/ }),

/***/ 75098:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/**
 * @license React
 * use-sync-external-store-with-selector.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


 true &&
  (function () {
    function is(x, y) {
      return (x === y && (0 !== x || 1 / x === 1 / y)) || (x !== x && y !== y);
    }
    "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ &&
      "function" ===
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart &&
      __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
    var React = __webpack_require__(96540),
      objectIs = "function" === typeof Object.is ? Object.is : is,
      useSyncExternalStore = React.useSyncExternalStore,
      useRef = React.useRef,
      useEffect = React.useEffect,
      useMemo = React.useMemo,
      useDebugValue = React.useDebugValue;
    exports.useSyncExternalStoreWithSelector = function (
      subscribe,
      getSnapshot,
      getServerSnapshot,
      selector,
      isEqual
    ) {
      var instRef = useRef(null);
      if (null === instRef.current) {
        var inst = { hasValue: !1, value: null };
        instRef.current = inst;
      } else inst = instRef.current;
      instRef = useMemo(
        function () {
          function memoizedSelector(nextSnapshot) {
            if (!hasMemo) {
              hasMemo = !0;
              memoizedSnapshot = nextSnapshot;
              nextSnapshot = selector(nextSnapshot);
              if (void 0 !== isEqual && inst.hasValue) {
                var currentSelection = inst.value;
                if (isEqual(currentSelection, nextSnapshot))
                  return (memoizedSelection = currentSelection);
              }
              return (memoizedSelection = nextSnapshot);
            }
            currentSelection = memoizedSelection;
            if (objectIs(memoizedSnapshot, nextSnapshot))
              return currentSelection;
            var nextSelection = selector(nextSnapshot);
            if (void 0 !== isEqual && isEqual(currentSelection, nextSelection))
              return (memoizedSnapshot = nextSnapshot), currentSelection;
            memoizedSnapshot = nextSnapshot;
            return (memoizedSelection = nextSelection);
          }
          var hasMemo = !1,
            memoizedSnapshot,
            memoizedSelection,
            maybeGetServerSnapshot =
              void 0 === getServerSnapshot ? null : getServerSnapshot;
          return [
            function () {
              return memoizedSelector(getSnapshot());
            },
            null === maybeGetServerSnapshot
              ? void 0
              : function () {
                  return memoizedSelector(maybeGetServerSnapshot());
                }
          ];
        },
        [getSnapshot, getServerSnapshot, selector, isEqual]
      );
      var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
      useEffect(
        function () {
          inst.hasValue = !0;
          inst.value = value;
        },
        [value]
      );
      useDebugValue(value);
      return value;
    };
    "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ &&
      "function" ===
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop &&
      __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
  })();


/***/ }),

/***/ 77659:
/***/ ((module) => {



var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ 78418:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



if (false) // removed by dead control flow
{} else {
  module.exports = __webpack_require__(75098);
}


/***/ }),

/***/ 82923:
/***/ ((__unused_webpack___webpack_module__, __unused_webpack___webpack_exports__, __webpack_require__) => {


// UNUSED EXPORTS: _

;// ./node_modules/@swc/helpers/esm/_class_apply_descriptor_set.js
function _class_apply_descriptor_set_class_apply_descriptor_set(receiver, descriptor, value) {
    if (descriptor.set) descriptor.set.call(receiver, value);
    else {
        if (!descriptor.writable) {
            // This should only throw in strict mode, but class bodies are
            // always strict and private fields can only be used inside
            // class bodies.
            throw new TypeError("attempted to set read only private field");
        }
        descriptor.value = value;
    }
}


// EXTERNAL MODULE: ./node_modules/@swc/helpers/esm/_class_extract_field_descriptor.js
var esm_class_extract_field_descriptor = __webpack_require__(6923);
;// ./node_modules/@swc/helpers/esm/_class_private_field_set.js



function _class_private_field_set(receiver, privateMap, value) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "set");
    _class_apply_descriptor_set(receiver, descriptor, value);
    return value;
}



/***/ }),

/***/ 83160:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/**
 * @license React
 * use-sync-external-store-shim/with-selector.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


 true &&
  (function () {
    function is(x, y) {
      return (x === y && (0 !== x || 1 / x === 1 / y)) || (x !== x && y !== y);
    }
    "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ &&
      "function" ===
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart &&
      __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
    var React = __webpack_require__(96540),
      shim = __webpack_require__(19888),
      objectIs = "function" === typeof Object.is ? Object.is : is,
      useSyncExternalStore = shim.useSyncExternalStore,
      useRef = React.useRef,
      useEffect = React.useEffect,
      useMemo = React.useMemo,
      useDebugValue = React.useDebugValue;
    exports.useSyncExternalStoreWithSelector = function (
      subscribe,
      getSnapshot,
      getServerSnapshot,
      selector,
      isEqual
    ) {
      var instRef = useRef(null);
      if (null === instRef.current) {
        var inst = { hasValue: !1, value: null };
        instRef.current = inst;
      } else inst = instRef.current;
      instRef = useMemo(
        function () {
          function memoizedSelector(nextSnapshot) {
            if (!hasMemo) {
              hasMemo = !0;
              memoizedSnapshot = nextSnapshot;
              nextSnapshot = selector(nextSnapshot);
              if (void 0 !== isEqual && inst.hasValue) {
                var currentSelection = inst.value;
                if (isEqual(currentSelection, nextSnapshot))
                  return (memoizedSelection = currentSelection);
              }
              return (memoizedSelection = nextSnapshot);
            }
            currentSelection = memoizedSelection;
            if (objectIs(memoizedSnapshot, nextSnapshot))
              return currentSelection;
            var nextSelection = selector(nextSnapshot);
            if (void 0 !== isEqual && isEqual(currentSelection, nextSelection))
              return (memoizedSnapshot = nextSnapshot), currentSelection;
            memoizedSnapshot = nextSnapshot;
            return (memoizedSelection = nextSelection);
          }
          var hasMemo = !1,
            memoizedSnapshot,
            memoizedSelection,
            maybeGetServerSnapshot =
              void 0 === getServerSnapshot ? null : getServerSnapshot;
          return [
            function () {
              return memoizedSelector(getSnapshot());
            },
            null === maybeGetServerSnapshot
              ? void 0
              : function () {
                  return memoizedSelector(maybeGetServerSnapshot());
                }
          ];
        },
        [getSnapshot, getServerSnapshot, selector, isEqual]
      );
      var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
      useEffect(
        function () {
          inst.hasValue = !0;
          inst.value = value;
        },
        [value]
      );
      useDebugValue(value);
      return value;
    };
    "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ &&
      "function" ===
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop &&
      __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
  })();


/***/ }),

/***/ 85072:
/***/ ((module) => {



var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ 85845:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/**
 * @license React
 * use-sync-external-store-shim.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


 true &&
  (function () {
    function is(x, y) {
      return (x === y && (0 !== x || 1 / x === 1 / y)) || (x !== x && y !== y);
    }
    function useSyncExternalStore$2(subscribe, getSnapshot) {
      didWarnOld18Alpha ||
        void 0 === React.startTransition ||
        ((didWarnOld18Alpha = !0),
        console.error(
          "You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."
        ));
      var value = getSnapshot();
      if (!didWarnUncachedGetSnapshot) {
        var cachedValue = getSnapshot();
        objectIs(value, cachedValue) ||
          (console.error(
            "The result of getSnapshot should be cached to avoid an infinite loop"
          ),
          (didWarnUncachedGetSnapshot = !0));
      }
      cachedValue = useState({
        inst: { value: value, getSnapshot: getSnapshot }
      });
      var inst = cachedValue[0].inst,
        forceUpdate = cachedValue[1];
      useLayoutEffect(
        function () {
          inst.value = value;
          inst.getSnapshot = getSnapshot;
          checkIfSnapshotChanged(inst) && forceUpdate({ inst: inst });
        },
        [subscribe, value, getSnapshot]
      );
      useEffect(
        function () {
          checkIfSnapshotChanged(inst) && forceUpdate({ inst: inst });
          return subscribe(function () {
            checkIfSnapshotChanged(inst) && forceUpdate({ inst: inst });
          });
        },
        [subscribe]
      );
      useDebugValue(value);
      return value;
    }
    function checkIfSnapshotChanged(inst) {
      var latestGetSnapshot = inst.getSnapshot;
      inst = inst.value;
      try {
        var nextValue = latestGetSnapshot();
        return !objectIs(inst, nextValue);
      } catch (error) {
        return !0;
      }
    }
    function useSyncExternalStore$1(subscribe, getSnapshot) {
      return getSnapshot();
    }
    "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ &&
      "function" ===
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart &&
      __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
    var React = __webpack_require__(96540),
      objectIs = "function" === typeof Object.is ? Object.is : is,
      useState = React.useState,
      useEffect = React.useEffect,
      useLayoutEffect = React.useLayoutEffect,
      useDebugValue = React.useDebugValue,
      didWarnOld18Alpha = !1,
      didWarnUncachedGetSnapshot = !1,
      shim =
        "undefined" === typeof window ||
        "undefined" === typeof window.document ||
        "undefined" === typeof window.document.createElement
          ? useSyncExternalStore$1
          : useSyncExternalStore$2;
    exports.useSyncExternalStore =
      void 0 !== React.useSyncExternalStore ? React.useSyncExternalStore : shim;
    "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ &&
      "function" ===
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop &&
      __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
  })();


/***/ }),

/***/ 87134:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Zr: () => (/* binding */ persist),
/* harmony export */   eh: () => (/* binding */ subscribeWithSelector),
/* harmony export */   lt: () => (/* binding */ devtools)
/* harmony export */ });
/* unused harmony exports combine, createJSONStorage, redux */
const reduxImpl = (reducer, initial) => (set, _get, api) => {
  api.dispatch = (action) => {
    set((state) => reducer(state, action), false, action);
    return action;
  };
  api.dispatchFromDevtools = true;
  return { dispatch: (...args) => api.dispatch(...args), ...initial };
};
const redux = (/* unused pure expression or super */ null && (reduxImpl));

const trackedConnections = /* @__PURE__ */ new Map();
const getTrackedConnectionState = (name) => {
  const api = trackedConnections.get(name);
  if (!api) return {};
  return Object.fromEntries(
    Object.entries(api.stores).map(([key, api2]) => [key, api2.getState()])
  );
};
const extractConnectionInformation = (store, extensionConnector, options) => {
  if (store === void 0) {
    return {
      type: "untracked",
      connection: extensionConnector.connect(options)
    };
  }
  const existingConnection = trackedConnections.get(options.name);
  if (existingConnection) {
    return { type: "tracked", store, ...existingConnection };
  }
  const newConnection = {
    connection: extensionConnector.connect(options),
    stores: {}
  };
  trackedConnections.set(options.name, newConnection);
  return { type: "tracked", store, ...newConnection };
};
const removeStoreFromTrackedConnections = (name, store) => {
  if (store === void 0) return;
  const connectionInfo = trackedConnections.get(name);
  if (!connectionInfo) return;
  delete connectionInfo.stores[store];
  if (Object.keys(connectionInfo.stores).length === 0) {
    trackedConnections.delete(name);
  }
};
const findCallerName = (stack) => {
  var _a, _b;
  if (!stack) return void 0;
  const traceLines = stack.split("\n");
  const apiSetStateLineIndex = traceLines.findIndex(
    (traceLine) => traceLine.includes("api.setState")
  );
  if (apiSetStateLineIndex < 0) return void 0;
  const callerLine = ((_a = traceLines[apiSetStateLineIndex + 1]) == null ? void 0 : _a.trim()) || "";
  return (_b = /.+ (.+) .+/.exec(callerLine)) == null ? void 0 : _b[1];
};
const devtoolsImpl = (fn, devtoolsOptions = {}) => (set, get, api) => {
  const { enabled, anonymousActionType, store, ...options } = devtoolsOptions;
  let extensionConnector;
  try {
    extensionConnector = (enabled != null ? enabled : ( false ? 0 : void 0) !== "production") && window.__REDUX_DEVTOOLS_EXTENSION__;
  } catch (e) {
  }
  if (!extensionConnector) {
    return fn(set, get, api);
  }
  const { connection, ...connectionInformation } = extractConnectionInformation(store, extensionConnector, options);
  let isRecording = true;
  api.setState = ((state, replace, nameOrAction) => {
    const r = set(state, replace);
    if (!isRecording) return r;
    const action = nameOrAction === void 0 ? {
      type: anonymousActionType || findCallerName(new Error().stack) || "anonymous"
    } : typeof nameOrAction === "string" ? { type: nameOrAction } : nameOrAction;
    if (store === void 0) {
      connection == null ? void 0 : connection.send(action, get());
      return r;
    }
    connection == null ? void 0 : connection.send(
      {
        ...action,
        type: `${store}/${action.type}`
      },
      {
        ...getTrackedConnectionState(options.name),
        [store]: api.getState()
      }
    );
    return r;
  });
  api.devtools = {
    cleanup: () => {
      if (connection && typeof connection.unsubscribe === "function") {
        connection.unsubscribe();
      }
      removeStoreFromTrackedConnections(options.name, store);
    }
  };
  const setStateFromDevtools = (...a) => {
    const originalIsRecording = isRecording;
    isRecording = false;
    set(...a);
    isRecording = originalIsRecording;
  };
  const initialState = fn(api.setState, get, api);
  if (connectionInformation.type === "untracked") {
    connection == null ? void 0 : connection.init(initialState);
  } else {
    connectionInformation.stores[connectionInformation.store] = api;
    connection == null ? void 0 : connection.init(
      Object.fromEntries(
        Object.entries(connectionInformation.stores).map(([key, store2]) => [
          key,
          key === connectionInformation.store ? initialState : store2.getState()
        ])
      )
    );
  }
  if (api.dispatchFromDevtools && typeof api.dispatch === "function") {
    let didWarnAboutReservedActionType = false;
    const originalDispatch = api.dispatch;
    api.dispatch = (...args) => {
      if (( false ? 0 : void 0) !== "production" && args[0].type === "__setState" && !didWarnAboutReservedActionType) {
        console.warn(
          '[zustand devtools middleware] "__setState" action type is reserved to set state from the devtools. Avoid using it.'
        );
        didWarnAboutReservedActionType = true;
      }
      originalDispatch(...args);
    };
  }
  connection.subscribe((message) => {
    var _a;
    switch (message.type) {
      case "ACTION":
        if (typeof message.payload !== "string") {
          console.error(
            "[zustand devtools middleware] Unsupported action format"
          );
          return;
        }
        return parseJsonThen(
          message.payload,
          (action) => {
            if (action.type === "__setState") {
              if (store === void 0) {
                setStateFromDevtools(action.state);
                return;
              }
              if (Object.keys(action.state).length !== 1) {
                console.error(
                  `
                    [zustand devtools middleware] Unsupported __setState action format.
                    When using 'store' option in devtools(), the 'state' should have only one key, which is a value of 'store' that was passed in devtools(),
                    and value of this only key should be a state object. Example: { "type": "__setState", "state": { "abc123Store": { "foo": "bar" } } }
                    `
                );
              }
              const stateFromDevtools = action.state[store];
              if (stateFromDevtools === void 0 || stateFromDevtools === null) {
                return;
              }
              if (JSON.stringify(api.getState()) !== JSON.stringify(stateFromDevtools)) {
                setStateFromDevtools(stateFromDevtools);
              }
              return;
            }
            if (!api.dispatchFromDevtools) return;
            if (typeof api.dispatch !== "function") return;
            api.dispatch(action);
          }
        );
      case "DISPATCH":
        switch (message.payload.type) {
          case "RESET":
            setStateFromDevtools(initialState);
            if (store === void 0) {
              return connection == null ? void 0 : connection.init(api.getState());
            }
            return connection == null ? void 0 : connection.init(getTrackedConnectionState(options.name));
          case "COMMIT":
            if (store === void 0) {
              connection == null ? void 0 : connection.init(api.getState());
              return;
            }
            return connection == null ? void 0 : connection.init(getTrackedConnectionState(options.name));
          case "ROLLBACK":
            return parseJsonThen(message.state, (state) => {
              if (store === void 0) {
                setStateFromDevtools(state);
                connection == null ? void 0 : connection.init(api.getState());
                return;
              }
              setStateFromDevtools(state[store]);
              connection == null ? void 0 : connection.init(getTrackedConnectionState(options.name));
            });
          case "JUMP_TO_STATE":
          case "JUMP_TO_ACTION":
            return parseJsonThen(message.state, (state) => {
              if (store === void 0) {
                setStateFromDevtools(state);
                return;
              }
              if (JSON.stringify(api.getState()) !== JSON.stringify(state[store])) {
                setStateFromDevtools(state[store]);
              }
            });
          case "IMPORT_STATE": {
            const { nextLiftedState } = message.payload;
            const lastComputedState = (_a = nextLiftedState.computedStates.slice(-1)[0]) == null ? void 0 : _a.state;
            if (!lastComputedState) return;
            if (store === void 0) {
              setStateFromDevtools(lastComputedState);
            } else {
              setStateFromDevtools(lastComputedState[store]);
            }
            connection == null ? void 0 : connection.send(
              null,
              // FIXME no-any
              nextLiftedState
            );
            return;
          }
          case "PAUSE_RECORDING":
            return isRecording = !isRecording;
        }
        return;
    }
  });
  return initialState;
};
const devtools = devtoolsImpl;
const parseJsonThen = (stringified, fn) => {
  let parsed;
  try {
    parsed = JSON.parse(stringified);
  } catch (e) {
    console.error(
      "[zustand devtools middleware] Could not parse the received json",
      e
    );
  }
  if (parsed !== void 0) fn(parsed);
};

const subscribeWithSelectorImpl = (fn) => (set, get, api) => {
  const origSubscribe = api.subscribe;
  api.subscribe = ((selector, optListener, options) => {
    let listener = selector;
    if (optListener) {
      const equalityFn = (options == null ? void 0 : options.equalityFn) || Object.is;
      let currentSlice = selector(api.getState());
      listener = (state) => {
        const nextSlice = selector(state);
        if (!equalityFn(currentSlice, nextSlice)) {
          const previousSlice = currentSlice;
          optListener(currentSlice = nextSlice, previousSlice);
        }
      };
      if (options == null ? void 0 : options.fireImmediately) {
        optListener(currentSlice, currentSlice);
      }
    }
    return origSubscribe(listener);
  });
  const initialState = fn(set, get, api);
  return initialState;
};
const subscribeWithSelector = subscribeWithSelectorImpl;

function combine(initialState, create) {
  return (...args) => Object.assign({}, initialState, create(...args));
}

function createJSONStorage(getStorage, options) {
  let storage;
  try {
    storage = getStorage();
  } catch (e) {
    return;
  }
  const persistStorage = {
    getItem: (name) => {
      var _a;
      const parse = (str2) => {
        if (str2 === null) {
          return null;
        }
        return JSON.parse(str2, options == null ? void 0 : options.reviver);
      };
      const str = (_a = storage.getItem(name)) != null ? _a : null;
      if (str instanceof Promise) {
        return str.then(parse);
      }
      return parse(str);
    },
    setItem: (name, newValue) => storage.setItem(name, JSON.stringify(newValue, options == null ? void 0 : options.replacer)),
    removeItem: (name) => storage.removeItem(name)
  };
  return persistStorage;
}
const toThenable = (fn) => (input) => {
  try {
    const result = fn(input);
    if (result instanceof Promise) {
      return result;
    }
    return {
      then(onFulfilled) {
        return toThenable(onFulfilled)(result);
      },
      catch(_onRejected) {
        return this;
      }
    };
  } catch (e) {
    return {
      then(_onFulfilled) {
        return this;
      },
      catch(onRejected) {
        return toThenable(onRejected)(e);
      }
    };
  }
};
const persistImpl = (config, baseOptions) => (set, get, api) => {
  let options = {
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => state,
    version: 0,
    merge: (persistedState, currentState) => ({
      ...currentState,
      ...persistedState
    }),
    ...baseOptions
  };
  let hasHydrated = false;
  const hydrationListeners = /* @__PURE__ */ new Set();
  const finishHydrationListeners = /* @__PURE__ */ new Set();
  let storage = options.storage;
  if (!storage) {
    return config(
      (...args) => {
        console.warn(
          `[zustand persist middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`
        );
        set(...args);
      },
      get,
      api
    );
  }
  const setItem = () => {
    const state = options.partialize({ ...get() });
    return storage.setItem(options.name, {
      state,
      version: options.version
    });
  };
  const savedSetState = api.setState;
  api.setState = (state, replace) => {
    savedSetState(state, replace);
    return setItem();
  };
  const configResult = config(
    (...args) => {
      set(...args);
      return setItem();
    },
    get,
    api
  );
  api.getInitialState = () => configResult;
  let stateFromStorage;
  const hydrate = () => {
    var _a, _b;
    if (!storage) return;
    hasHydrated = false;
    hydrationListeners.forEach((cb) => {
      var _a2;
      return cb((_a2 = get()) != null ? _a2 : configResult);
    });
    const postRehydrationCallback = ((_b = options.onRehydrateStorage) == null ? void 0 : _b.call(options, (_a = get()) != null ? _a : configResult)) || void 0;
    return toThenable(storage.getItem.bind(storage))(options.name).then((deserializedStorageValue) => {
      if (deserializedStorageValue) {
        if (typeof deserializedStorageValue.version === "number" && deserializedStorageValue.version !== options.version) {
          if (options.migrate) {
            const migration = options.migrate(
              deserializedStorageValue.state,
              deserializedStorageValue.version
            );
            if (migration instanceof Promise) {
              return migration.then((result) => [true, result]);
            }
            return [true, migration];
          }
          console.error(
            `State loaded from storage couldn't be migrated since no migrate function was provided`
          );
        } else {
          return [false, deserializedStorageValue.state];
        }
      }
      return [false, void 0];
    }).then((migrationResult) => {
      var _a2;
      const [migrated, migratedState] = migrationResult;
      stateFromStorage = options.merge(
        migratedState,
        (_a2 = get()) != null ? _a2 : configResult
      );
      set(stateFromStorage, true);
      if (migrated) {
        return setItem();
      }
    }).then(() => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(stateFromStorage, void 0);
      stateFromStorage = get();
      hasHydrated = true;
      finishHydrationListeners.forEach((cb) => cb(stateFromStorage));
    }).catch((e) => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(void 0, e);
    });
  };
  api.persist = {
    setOptions: (newOptions) => {
      options = {
        ...options,
        ...newOptions
      };
      if (newOptions.storage) {
        storage = newOptions.storage;
      }
    },
    clearStorage: () => {
      storage == null ? void 0 : storage.removeItem(options.name);
    },
    getOptions: () => options,
    rehydrate: () => hydrate(),
    hasHydrated: () => hasHydrated,
    onHydrate: (cb) => {
      hydrationListeners.add(cb);
      return () => {
        hydrationListeners.delete(cb);
      };
    },
    onFinishHydration: (cb) => {
      finishHydrationListeners.add(cb);
      return () => {
        finishHydrationListeners.delete(cb);
      };
    }
  };
  if (!options.skipHydration) {
    hydrate();
  }
  return stateFromStorage || configResult;
};
const persist = persistImpl;




/***/ }),

/***/ 97825:
/***/ ((module) => {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ 99849:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LQ: () => (/* binding */ _)
/* harmony export */ });
/* unused harmony exports COMMAND_ARG_COUNTS, SVGPathDataParser, SVGPathDataTransformer, encodeSVGPath */
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var t=function(r,e){return(t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,r){t.__proto__=r}||function(t,r){for(var e in r)Object.prototype.hasOwnProperty.call(r,e)&&(t[e]=r[e])})(r,e)};function r(r,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function i(){this.constructor=r}t(r,e),r.prototype=null===e?Object.create(e):(i.prototype=e.prototype,new i)}function e(t){var r="";Array.isArray(t)||(t=[t]);for(var e=0;e<t.length;e++){var i=t[e];if(i.type===_.CLOSE_PATH)r+="z";else if(i.type===_.HORIZ_LINE_TO)r+=(i.relative?"h":"H")+i.x;else if(i.type===_.VERT_LINE_TO)r+=(i.relative?"v":"V")+i.y;else if(i.type===_.MOVE_TO)r+=(i.relative?"m":"M")+i.x+" "+i.y;else if(i.type===_.LINE_TO)r+=(i.relative?"l":"L")+i.x+" "+i.y;else if(i.type===_.CURVE_TO)r+=(i.relative?"c":"C")+i.x1+" "+i.y1+" "+i.x2+" "+i.y2+" "+i.x+" "+i.y;else if(i.type===_.SMOOTH_CURVE_TO)r+=(i.relative?"s":"S")+i.x2+" "+i.y2+" "+i.x+" "+i.y;else if(i.type===_.QUAD_TO)r+=(i.relative?"q":"Q")+i.x1+" "+i.y1+" "+i.x+" "+i.y;else if(i.type===_.SMOOTH_QUAD_TO)r+=(i.relative?"t":"T")+i.x+" "+i.y;else{if(i.type!==_.ARC)throw new Error('Unexpected command type "'+i.type+'" at index '+e+".");r+=(i.relative?"a":"A")+i.rX+" "+i.rY+" "+i.xRot+" "+ +i.lArcFlag+" "+ +i.sweepFlag+" "+i.x+" "+i.y}}return r}function i(t,r){var e=t[0],i=t[1];return[e*Math.cos(r)-i*Math.sin(r),e*Math.sin(r)+i*Math.cos(r)]}function a(){for(var t=[],r=0;r<arguments.length;r++)t[r]=arguments[r];for(var e=0;e<t.length;e++)if("number"!=typeof t[e])throw new Error("assertNumbers arguments["+e+"] is not a number. "+typeof t[e]+" == typeof "+t[e]);return!0}var n=Math.PI;function o(t,r,e){t.lArcFlag=0===t.lArcFlag?0:1,t.sweepFlag=0===t.sweepFlag?0:1;var a=t.rX,o=t.rY,s=t.x,u=t.y;a=Math.abs(t.rX),o=Math.abs(t.rY);var h=i([(r-s)/2,(e-u)/2],-t.xRot/180*n),c=h[0],y=h[1],p=Math.pow(c,2)/Math.pow(a,2)+Math.pow(y,2)/Math.pow(o,2);1<p&&(a*=Math.sqrt(p),o*=Math.sqrt(p)),t.rX=a,t.rY=o;var m=Math.pow(a,2)*Math.pow(y,2)+Math.pow(o,2)*Math.pow(c,2),O=(t.lArcFlag!==t.sweepFlag?1:-1)*Math.sqrt(Math.max(0,(Math.pow(a,2)*Math.pow(o,2)-m)/m)),l=a*y/o*O,T=-o*c/a*O,v=i([l,T],t.xRot/180*n);t.cX=v[0]+(r+s)/2,t.cY=v[1]+(e+u)/2,t.phi1=Math.atan2((y-T)/o,(c-l)/a),t.phi2=Math.atan2((-y-T)/o,(-c-l)/a),0===t.sweepFlag&&t.phi2>t.phi1&&(t.phi2-=2*n),1===t.sweepFlag&&t.phi2<t.phi1&&(t.phi2+=2*n),t.phi1*=180/n,t.phi2*=180/n}function s(t,r,e){a(t,r,e);var i=t*t+r*r-e*e;if(0>i)return[];if(0===i)return[[t*e/(t*t+r*r),r*e/(t*t+r*r)]];var n=Math.sqrt(i);return[[(t*e+r*n)/(t*t+r*r),(r*e-t*n)/(t*t+r*r)],[(t*e-r*n)/(t*t+r*r),(r*e+t*n)/(t*t+r*r)]]}var u,h=Math.PI/180;function c(t,r,e){return(1-e)*t+e*r}function y(t,r,e,i){return t+Math.cos(i/180*n)*r+Math.sin(i/180*n)*e}function p(t,r,e,i){var a=1e-6,n=r-t,o=e-r,s=3*n+3*(i-e)-6*o,u=6*(o-n),h=3*n;return Math.abs(s)<a?[-h/u]:function(t,r,e){void 0===e&&(e=1e-6);var i=t*t/4-r;if(i<-e)return[];if(i<=e)return[-t/2];var a=Math.sqrt(i);return[-t/2-a,-t/2+a]}(u/s,h/s,a)}function m(t,r,e,i,a){var n=1-a;return t*(n*n*n)+r*(3*n*n*a)+e*(3*n*a*a)+i*(a*a*a)}!function(t){function r(){return u((function(t,r,e){return t.relative&&(void 0!==t.x1&&(t.x1+=r),void 0!==t.y1&&(t.y1+=e),void 0!==t.x2&&(t.x2+=r),void 0!==t.y2&&(t.y2+=e),void 0!==t.x&&(t.x+=r),void 0!==t.y&&(t.y+=e),t.relative=!1),t}))}function e(){var t=NaN,r=NaN,e=NaN,i=NaN;return u((function(a,n,o){return a.type&_.SMOOTH_CURVE_TO&&(a.type=_.CURVE_TO,t=isNaN(t)?n:t,r=isNaN(r)?o:r,a.x1=a.relative?n-t:2*n-t,a.y1=a.relative?o-r:2*o-r),a.type&_.CURVE_TO?(t=a.relative?n+a.x2:a.x2,r=a.relative?o+a.y2:a.y2):(t=NaN,r=NaN),a.type&_.SMOOTH_QUAD_TO&&(a.type=_.QUAD_TO,e=isNaN(e)?n:e,i=isNaN(i)?o:i,a.x1=a.relative?n-e:2*n-e,a.y1=a.relative?o-i:2*o-i),a.type&_.QUAD_TO?(e=a.relative?n+a.x1:a.x1,i=a.relative?o+a.y1:a.y1):(e=NaN,i=NaN),a}))}function n(){var t=NaN,r=NaN;return u((function(e,i,a){if(e.type&_.SMOOTH_QUAD_TO&&(e.type=_.QUAD_TO,t=isNaN(t)?i:t,r=isNaN(r)?a:r,e.x1=e.relative?i-t:2*i-t,e.y1=e.relative?a-r:2*a-r),e.type&_.QUAD_TO){t=e.relative?i+e.x1:e.x1,r=e.relative?a+e.y1:e.y1;var n=e.x1,o=e.y1;e.type=_.CURVE_TO,e.x1=((e.relative?0:i)+2*n)/3,e.y1=((e.relative?0:a)+2*o)/3,e.x2=(e.x+2*n)/3,e.y2=(e.y+2*o)/3}else t=NaN,r=NaN;return e}))}function u(t){var r=0,e=0,i=NaN,a=NaN;return function(n){if(isNaN(i)&&!(n.type&_.MOVE_TO))throw new Error("path must start with moveto");var o=t(n,r,e,i,a);return n.type&_.CLOSE_PATH&&(r=i,e=a),void 0!==n.x&&(r=n.relative?r+n.x:n.x),void 0!==n.y&&(e=n.relative?e+n.y:n.y),n.type&_.MOVE_TO&&(i=r,a=e),o}}function O(t,r,e,i,n,o){return a(t,r,e,i,n,o),u((function(a,s,u,h){var c=a.x1,y=a.x2,p=a.relative&&!isNaN(h),m=void 0!==a.x?a.x:p?0:s,O=void 0!==a.y?a.y:p?0:u;function l(t){return t*t}a.type&_.HORIZ_LINE_TO&&0!==r&&(a.type=_.LINE_TO,a.y=a.relative?0:u),a.type&_.VERT_LINE_TO&&0!==e&&(a.type=_.LINE_TO,a.x=a.relative?0:s),void 0!==a.x&&(a.x=a.x*t+O*e+(p?0:n)),void 0!==a.y&&(a.y=m*r+a.y*i+(p?0:o)),void 0!==a.x1&&(a.x1=a.x1*t+a.y1*e+(p?0:n)),void 0!==a.y1&&(a.y1=c*r+a.y1*i+(p?0:o)),void 0!==a.x2&&(a.x2=a.x2*t+a.y2*e+(p?0:n)),void 0!==a.y2&&(a.y2=y*r+a.y2*i+(p?0:o));var T=t*i-r*e;if(void 0!==a.xRot&&(1!==t||0!==r||0!==e||1!==i))if(0===T)delete a.rX,delete a.rY,delete a.xRot,delete a.lArcFlag,delete a.sweepFlag,a.type=_.LINE_TO;else{var v=a.xRot*Math.PI/180,f=Math.sin(v),N=Math.cos(v),x=1/l(a.rX),d=1/l(a.rY),E=l(N)*x+l(f)*d,A=2*f*N*(x-d),C=l(f)*x+l(N)*d,M=E*i*i-A*r*i+C*r*r,R=A*(t*i+r*e)-2*(E*e*i+C*t*r),g=E*e*e-A*t*e+C*t*t,I=(Math.atan2(R,M-g)+Math.PI)%Math.PI/2,S=Math.sin(I),L=Math.cos(I);a.rX=Math.abs(T)/Math.sqrt(M*l(L)+R*S*L+g*l(S)),a.rY=Math.abs(T)/Math.sqrt(M*l(S)-R*S*L+g*l(L)),a.xRot=180*I/Math.PI}return void 0!==a.sweepFlag&&0>T&&(a.sweepFlag=+!a.sweepFlag),a}))}function l(){return function(t){var r={};for(var e in t)r[e]=t[e];return r}}t.ROUND=function(t){function r(r){return Math.round(r*t)/t}return void 0===t&&(t=1e13),a(t),function(t){return void 0!==t.x1&&(t.x1=r(t.x1)),void 0!==t.y1&&(t.y1=r(t.y1)),void 0!==t.x2&&(t.x2=r(t.x2)),void 0!==t.y2&&(t.y2=r(t.y2)),void 0!==t.x&&(t.x=r(t.x)),void 0!==t.y&&(t.y=r(t.y)),void 0!==t.rX&&(t.rX=r(t.rX)),void 0!==t.rY&&(t.rY=r(t.rY)),t}},t.TO_ABS=r,t.TO_REL=function(){return u((function(t,r,e){return t.relative||(void 0!==t.x1&&(t.x1-=r),void 0!==t.y1&&(t.y1-=e),void 0!==t.x2&&(t.x2-=r),void 0!==t.y2&&(t.y2-=e),void 0!==t.x&&(t.x-=r),void 0!==t.y&&(t.y-=e),t.relative=!0),t}))},t.NORMALIZE_HVZ=function(t,r,e){return void 0===t&&(t=!0),void 0===r&&(r=!0),void 0===e&&(e=!0),u((function(i,a,n,o,s){if(isNaN(o)&&!(i.type&_.MOVE_TO))throw new Error("path must start with moveto");return r&&i.type&_.HORIZ_LINE_TO&&(i.type=_.LINE_TO,i.y=i.relative?0:n),e&&i.type&_.VERT_LINE_TO&&(i.type=_.LINE_TO,i.x=i.relative?0:a),t&&i.type&_.CLOSE_PATH&&(i.type=_.LINE_TO,i.x=i.relative?o-a:o,i.y=i.relative?s-n:s),i.type&_.ARC&&(0===i.rX||0===i.rY)&&(i.type=_.LINE_TO,delete i.rX,delete i.rY,delete i.xRot,delete i.lArcFlag,delete i.sweepFlag),i}))},t.NORMALIZE_ST=e,t.QT_TO_C=n,t.INFO=u,t.SANITIZE=function(t){void 0===t&&(t=0),a(t);var r=NaN,e=NaN,i=NaN,n=NaN;return u((function(a,o,s,u,h){var c=Math.abs,y=!1,p=0,m=0;if(a.type&_.SMOOTH_CURVE_TO&&(p=isNaN(r)?0:o-r,m=isNaN(e)?0:s-e),a.type&(_.CURVE_TO|_.SMOOTH_CURVE_TO)?(r=a.relative?o+a.x2:a.x2,e=a.relative?s+a.y2:a.y2):(r=NaN,e=NaN),a.type&_.SMOOTH_QUAD_TO?(i=isNaN(i)?o:2*o-i,n=isNaN(n)?s:2*s-n):a.type&_.QUAD_TO?(i=a.relative?o+a.x1:a.x1,n=a.relative?s+a.y1:a.y2):(i=NaN,n=NaN),a.type&_.LINE_COMMANDS||a.type&_.ARC&&(0===a.rX||0===a.rY||!a.lArcFlag)||a.type&_.CURVE_TO||a.type&_.SMOOTH_CURVE_TO||a.type&_.QUAD_TO||a.type&_.SMOOTH_QUAD_TO){var O=void 0===a.x?0:a.relative?a.x:a.x-o,l=void 0===a.y?0:a.relative?a.y:a.y-s;p=isNaN(i)?void 0===a.x1?p:a.relative?a.x:a.x1-o:i-o,m=isNaN(n)?void 0===a.y1?m:a.relative?a.y:a.y1-s:n-s;var T=void 0===a.x2?0:a.relative?a.x:a.x2-o,v=void 0===a.y2?0:a.relative?a.y:a.y2-s;c(O)<=t&&c(l)<=t&&c(p)<=t&&c(m)<=t&&c(T)<=t&&c(v)<=t&&(y=!0)}return a.type&_.CLOSE_PATH&&c(o-u)<=t&&c(s-h)<=t&&(y=!0),y?[]:a}))},t.MATRIX=O,t.ROTATE=function(t,r,e){void 0===r&&(r=0),void 0===e&&(e=0),a(t,r,e);var i=Math.sin(t),n=Math.cos(t);return O(n,i,-i,n,r-r*n+e*i,e-r*i-e*n)},t.TRANSLATE=function(t,r){return void 0===r&&(r=0),a(t,r),O(1,0,0,1,t,r)},t.SCALE=function(t,r){return void 0===r&&(r=t),a(t,r),O(t,0,0,r,0,0)},t.SKEW_X=function(t){return a(t),O(1,0,Math.atan(t),1,0,0)},t.SKEW_Y=function(t){return a(t),O(1,Math.atan(t),0,1,0,0)},t.X_AXIS_SYMMETRY=function(t){return void 0===t&&(t=0),a(t),O(-1,0,0,1,t,0)},t.Y_AXIS_SYMMETRY=function(t){return void 0===t&&(t=0),a(t),O(1,0,0,-1,0,t)},t.A_TO_C=function(){return u((function(t,r,e){return _.ARC===t.type?function(t,r,e){var a,n,s,u;t.cX||o(t,r,e);for(var y=Math.min(t.phi1,t.phi2),p=Math.max(t.phi1,t.phi2)-y,m=Math.ceil(p/90),O=new Array(m),l=r,T=e,v=0;v<m;v++){var f=c(t.phi1,t.phi2,v/m),N=c(t.phi1,t.phi2,(v+1)/m),x=N-f,d=4/3*Math.tan(x*h/4),E=[Math.cos(f*h)-d*Math.sin(f*h),Math.sin(f*h)+d*Math.cos(f*h)],A=E[0],C=E[1],M=[Math.cos(N*h),Math.sin(N*h)],R=M[0],g=M[1],I=[R+d*Math.sin(N*h),g-d*Math.cos(N*h)],S=I[0],L=I[1];O[v]={relative:t.relative,type:_.CURVE_TO};var H=function(r,e){var a=i([r*t.rX,e*t.rY],t.xRot),n=a[0],o=a[1];return[t.cX+n,t.cY+o]};a=H(A,C),O[v].x1=a[0],O[v].y1=a[1],n=H(S,L),O[v].x2=n[0],O[v].y2=n[1],s=H(R,g),O[v].x=s[0],O[v].y=s[1],t.relative&&(O[v].x1-=l,O[v].y1-=T,O[v].x2-=l,O[v].y2-=T,O[v].x-=l,O[v].y-=T),l=(u=[O[v].x,O[v].y])[0],T=u[1]}return O}(t,t.relative?0:r,t.relative?0:e):t}))},t.ANNOTATE_ARCS=function(){return u((function(t,r,e){return t.relative&&(r=0,e=0),_.ARC===t.type&&o(t,r,e),t}))},t.CLONE=l,t.CALCULATE_BOUNDS=function(){var t=function(t){var r={};for(var e in t)r[e]=t[e];return r},i=r(),a=n(),h=e(),c=u((function(r,e,n){var u=h(a(i(t(r))));function O(t){t>c.maxX&&(c.maxX=t),t<c.minX&&(c.minX=t)}function l(t){t>c.maxY&&(c.maxY=t),t<c.minY&&(c.minY=t)}if(u.type&_.DRAWING_COMMANDS&&(O(e),l(n)),u.type&_.HORIZ_LINE_TO&&O(u.x),u.type&_.VERT_LINE_TO&&l(u.y),u.type&_.LINE_TO&&(O(u.x),l(u.y)),u.type&_.CURVE_TO){O(u.x),l(u.y);for(var T=0,v=p(e,u.x1,u.x2,u.x);T<v.length;T++){0<(w=v[T])&&1>w&&O(m(e,u.x1,u.x2,u.x,w))}for(var f=0,N=p(n,u.y1,u.y2,u.y);f<N.length;f++){0<(w=N[f])&&1>w&&l(m(n,u.y1,u.y2,u.y,w))}}if(u.type&_.ARC){O(u.x),l(u.y),o(u,e,n);for(var x=u.xRot/180*Math.PI,d=Math.cos(x)*u.rX,E=Math.sin(x)*u.rX,A=-Math.sin(x)*u.rY,C=Math.cos(x)*u.rY,M=u.phi1<u.phi2?[u.phi1,u.phi2]:-180>u.phi2?[u.phi2+360,u.phi1+360]:[u.phi2,u.phi1],R=M[0],g=M[1],I=function(t){var r=t[0],e=t[1],i=180*Math.atan2(e,r)/Math.PI;return i<R?i+360:i},S=0,L=s(A,-d,0).map(I);S<L.length;S++){(w=L[S])>R&&w<g&&O(y(u.cX,d,A,w))}for(var H=0,U=s(C,-E,0).map(I);H<U.length;H++){var w;(w=U[H])>R&&w<g&&l(y(u.cY,E,C,w))}}return r}));return c.minX=1/0,c.maxX=-1/0,c.minY=1/0,c.maxY=-1/0,c}}(u||(u={}));var O,l=function(){function t(){}return t.prototype.round=function(t){return this.transform(u.ROUND(t))},t.prototype.toAbs=function(){return this.transform(u.TO_ABS())},t.prototype.toRel=function(){return this.transform(u.TO_REL())},t.prototype.normalizeHVZ=function(t,r,e){return this.transform(u.NORMALIZE_HVZ(t,r,e))},t.prototype.normalizeST=function(){return this.transform(u.NORMALIZE_ST())},t.prototype.qtToC=function(){return this.transform(u.QT_TO_C())},t.prototype.aToC=function(){return this.transform(u.A_TO_C())},t.prototype.sanitize=function(t){return this.transform(u.SANITIZE(t))},t.prototype.translate=function(t,r){return this.transform(u.TRANSLATE(t,r))},t.prototype.scale=function(t,r){return this.transform(u.SCALE(t,r))},t.prototype.rotate=function(t,r,e){return this.transform(u.ROTATE(t,r,e))},t.prototype.matrix=function(t,r,e,i,a,n){return this.transform(u.MATRIX(t,r,e,i,a,n))},t.prototype.skewX=function(t){return this.transform(u.SKEW_X(t))},t.prototype.skewY=function(t){return this.transform(u.SKEW_Y(t))},t.prototype.xSymmetry=function(t){return this.transform(u.X_AXIS_SYMMETRY(t))},t.prototype.ySymmetry=function(t){return this.transform(u.Y_AXIS_SYMMETRY(t))},t.prototype.annotateArcs=function(){return this.transform(u.ANNOTATE_ARCS())},t}(),T=function(t){return" "===t||"\t"===t||"\r"===t||"\n"===t},v=function(t){return"0".charCodeAt(0)<=t.charCodeAt(0)&&t.charCodeAt(0)<="9".charCodeAt(0)},f=function(t){function e(){var r=t.call(this)||this;return r.curNumber="",r.curCommandType=-1,r.curCommandRelative=!1,r.canParseCommandOrComma=!0,r.curNumberHasExp=!1,r.curNumberHasExpDigits=!1,r.curNumberHasDecimal=!1,r.curArgs=[],r}return r(e,t),e.prototype.finish=function(t){if(void 0===t&&(t=[]),this.parse(" ",t),0!==this.curArgs.length||!this.canParseCommandOrComma)throw new SyntaxError("Unterminated command at the path end.");return t},e.prototype.parse=function(t,r){var e=this;void 0===r&&(r=[]);for(var i=function(t){r.push(t),e.curArgs.length=0,e.canParseCommandOrComma=!0},a=0;a<t.length;a++){var n=t[a],o=!(this.curCommandType!==_.ARC||3!==this.curArgs.length&&4!==this.curArgs.length||1!==this.curNumber.length||"0"!==this.curNumber&&"1"!==this.curNumber),s=v(n)&&("0"===this.curNumber&&"0"===n||o);if(!v(n)||s)if("e"!==n&&"E"!==n)if("-"!==n&&"+"!==n||!this.curNumberHasExp||this.curNumberHasExpDigits)if("."!==n||this.curNumberHasExp||this.curNumberHasDecimal||o){if(this.curNumber&&-1!==this.curCommandType){var u=Number(this.curNumber);if(isNaN(u))throw new SyntaxError("Invalid number ending at "+a);if(this.curCommandType===_.ARC)if(0===this.curArgs.length||1===this.curArgs.length){if(0>u)throw new SyntaxError('Expected positive number, got "'+u+'" at index "'+a+'"')}else if((3===this.curArgs.length||4===this.curArgs.length)&&"0"!==this.curNumber&&"1"!==this.curNumber)throw new SyntaxError('Expected a flag, got "'+this.curNumber+'" at index "'+a+'"');this.curArgs.push(u),this.curArgs.length===N[this.curCommandType]&&(_.HORIZ_LINE_TO===this.curCommandType?i({type:_.HORIZ_LINE_TO,relative:this.curCommandRelative,x:u}):_.VERT_LINE_TO===this.curCommandType?i({type:_.VERT_LINE_TO,relative:this.curCommandRelative,y:u}):this.curCommandType===_.MOVE_TO||this.curCommandType===_.LINE_TO||this.curCommandType===_.SMOOTH_QUAD_TO?(i({type:this.curCommandType,relative:this.curCommandRelative,x:this.curArgs[0],y:this.curArgs[1]}),_.MOVE_TO===this.curCommandType&&(this.curCommandType=_.LINE_TO)):this.curCommandType===_.CURVE_TO?i({type:_.CURVE_TO,relative:this.curCommandRelative,x1:this.curArgs[0],y1:this.curArgs[1],x2:this.curArgs[2],y2:this.curArgs[3],x:this.curArgs[4],y:this.curArgs[5]}):this.curCommandType===_.SMOOTH_CURVE_TO?i({type:_.SMOOTH_CURVE_TO,relative:this.curCommandRelative,x2:this.curArgs[0],y2:this.curArgs[1],x:this.curArgs[2],y:this.curArgs[3]}):this.curCommandType===_.QUAD_TO?i({type:_.QUAD_TO,relative:this.curCommandRelative,x1:this.curArgs[0],y1:this.curArgs[1],x:this.curArgs[2],y:this.curArgs[3]}):this.curCommandType===_.ARC&&i({type:_.ARC,relative:this.curCommandRelative,rX:this.curArgs[0],rY:this.curArgs[1],xRot:this.curArgs[2],lArcFlag:this.curArgs[3],sweepFlag:this.curArgs[4],x:this.curArgs[5],y:this.curArgs[6]})),this.curNumber="",this.curNumberHasExpDigits=!1,this.curNumberHasExp=!1,this.curNumberHasDecimal=!1,this.canParseCommandOrComma=!0}if(!T(n))if(","===n&&this.canParseCommandOrComma)this.canParseCommandOrComma=!1;else if("+"!==n&&"-"!==n&&"."!==n)if(s)this.curNumber=n,this.curNumberHasDecimal=!1;else{if(0!==this.curArgs.length)throw new SyntaxError("Unterminated command at index "+a+".");if(!this.canParseCommandOrComma)throw new SyntaxError('Unexpected character "'+n+'" at index '+a+". Command cannot follow comma");if(this.canParseCommandOrComma=!1,"z"!==n&&"Z"!==n)if("h"===n||"H"===n)this.curCommandType=_.HORIZ_LINE_TO,this.curCommandRelative="h"===n;else if("v"===n||"V"===n)this.curCommandType=_.VERT_LINE_TO,this.curCommandRelative="v"===n;else if("m"===n||"M"===n)this.curCommandType=_.MOVE_TO,this.curCommandRelative="m"===n;else if("l"===n||"L"===n)this.curCommandType=_.LINE_TO,this.curCommandRelative="l"===n;else if("c"===n||"C"===n)this.curCommandType=_.CURVE_TO,this.curCommandRelative="c"===n;else if("s"===n||"S"===n)this.curCommandType=_.SMOOTH_CURVE_TO,this.curCommandRelative="s"===n;else if("q"===n||"Q"===n)this.curCommandType=_.QUAD_TO,this.curCommandRelative="q"===n;else if("t"===n||"T"===n)this.curCommandType=_.SMOOTH_QUAD_TO,this.curCommandRelative="t"===n;else{if("a"!==n&&"A"!==n)throw new SyntaxError('Unexpected character "'+n+'" at index '+a+".");this.curCommandType=_.ARC,this.curCommandRelative="a"===n}else r.push({type:_.CLOSE_PATH}),this.canParseCommandOrComma=!0,this.curCommandType=-1}else this.curNumber=n,this.curNumberHasDecimal="."===n}else this.curNumber+=n,this.curNumberHasDecimal=!0;else this.curNumber+=n;else this.curNumber+=n,this.curNumberHasExp=!0;else this.curNumber+=n,this.curNumberHasExpDigits=this.curNumberHasExp}return r},e.prototype.transform=function(t){return Object.create(this,{parse:{value:function(r,e){void 0===e&&(e=[]);for(var i=0,a=Object.getPrototypeOf(this).parse.call(this,r);i<a.length;i++){var n=a[i],o=t(n);Array.isArray(o)?e.push.apply(e,o):e.push(o)}return e}}})},e}(l),_=function(t){function i(r){var e=t.call(this)||this;return e.commands="string"==typeof r?i.parse(r):r,e}return r(i,t),i.prototype.encode=function(){return i.encode(this.commands)},i.prototype.getBounds=function(){var t=u.CALCULATE_BOUNDS();return this.transform(t),t},i.prototype.transform=function(t){for(var r=[],e=0,i=this.commands;e<i.length;e++){var a=t(i[e]);Array.isArray(a)?r.push.apply(r,a):r.push(a)}return this.commands=r,this},i.encode=function(t){return e(t)},i.parse=function(t){var r=new f,e=[];return r.parse(t,e),r.finish(e),e},i.CLOSE_PATH=1,i.MOVE_TO=2,i.HORIZ_LINE_TO=4,i.VERT_LINE_TO=8,i.LINE_TO=16,i.CURVE_TO=32,i.SMOOTH_CURVE_TO=64,i.QUAD_TO=128,i.SMOOTH_QUAD_TO=256,i.ARC=512,i.LINE_COMMANDS=i.LINE_TO|i.HORIZ_LINE_TO|i.VERT_LINE_TO,i.DRAWING_COMMANDS=i.HORIZ_LINE_TO|i.VERT_LINE_TO|i.LINE_TO|i.CURVE_TO|i.SMOOTH_CURVE_TO|i.QUAD_TO|i.SMOOTH_QUAD_TO|i.ARC,i}(l),N=((O={})[_.MOVE_TO]=2,O[_.LINE_TO]=2,O[_.HORIZ_LINE_TO]=1,O[_.VERT_LINE_TO]=1,O[_.CLOSE_PATH]=0,O[_.QUAD_TO]=4,O[_.SMOOTH_QUAD_TO]=2,O[_.CURVE_TO]=6,O[_.SMOOTH_CURVE_TO]=4,O[_.ARC]=7,O);
//# sourceMappingURL=SVGPathData.module.js.map


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVuZG9yLWNvbW1vbi0yMjllYWZiNS4xODE1MTVlNzI3Mjk0YWUxMzQyZC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUN5Qjs7Ozs7Ozs7O0FDTHpCO0FBQ0E7O0FBRUE7QUFDQTtBQUNnRDs7Ozs7Ozs7Ozs7O0FDTGhCOztBQUVoQztBQUNBO0FBQ0Esc0RBQXNELHdEQUFPO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRWlCOzs7Ozs7OztBQ1hKOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0M7Ozs7Ozs7Ozs7QUNUQSxtQkFBbUIsYUFBb0I7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVnQzs7Ozs7Ozs7QUNkbkI7O0FBRWIsSUFBSSxLQUFxQyxFQUFFO0FBQUEsRUFFMUMsQ0FBQztBQUNGLEVBQUUsMkNBQThFO0FBQ2hGOzs7Ozs7OztBQ05hOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxxQ0FBcUM7O0FBRXJDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0JBQXNCO0FBQ3RCOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNFQUFzRTtBQUN0RSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTs7QUFFQTtBQUNB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QUNBO0FBQ0E7QUFDQSxnREFBZ0QsNkZBQTZDO0FBQzdGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVxRTtBQUNyRTs7Ozs7Ozs7Ozs7O0FDbmxCQSxTQUFTLHdEQUE0QjtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUM2Qzs7O0FDTHlDOztBQUV0RjtBQUNBO0FBQ0E7QUFDQTtBQUMwQzs7Ozs7Ozs7Ozs7O0FDTjFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QiwwQkFBMEI7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBLFFBQVE7QUFDUjtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBLE9BQU8sbUJBQW1CLGtCQUFrQixhQUFhO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDLFlBQVk7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQiwyQkFBMkI7QUFDL0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsZ0JBQWdCO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSx1QkFBbUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNLGdCQUFZO0FBQ2xCO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWCxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxzRUFBc0UsbUJBQW1CO0FBQ3pGLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLHVCQUF1QixxQkFBcUI7QUFDNUM7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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlFQUFpRSxhQUFhO0FBQzlFO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1QyxVQUFVO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FB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QUE0QywrQkFBK0Isa0NBQWtDLDJCQUEyQiwyQkFBMkIsbUNBQW1DLGlDQUFpQyxXQUFXLEtBQUssY0FBYyw2Q0FBNkMsNEJBQTRCLHNCQUFzQixZQUFZLHFCQUFxQixpQkFBaUIsa0NBQWtDLGlWQUFpVixZQUFZLG1MQUEwUztBQUNoempCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvdmljdG9yeS12ZW5kb3IvZXMvZDMtc2hhcGUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHN3Yy9oZWxwZXJzL2VzbS9fY2xhc3NfZXh0cmFjdF9maWVsZF9kZXNjcmlwdG9yLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3p1c3RhbmQvZXNtL21pZGRsZXdhcmUvaW1tZXIubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3RpbnktaW52YXJpYW50L2Rpc3QvZXNtL3RpbnktaW52YXJpYW50LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3VzZS1zeW5jLWV4dGVybmFsLXN0b3JlL3NoaW0vaW5kZXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvc2V0LWNvb2tpZS1wYXJzZXIvbGliL3NldC1jb29raWUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvdmljdG9yeS12ZW5kb3IvZXMvZDMtc2NhbGUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy90YWJiYWJsZS9kaXN0L2luZGV4LmVzbS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9Ac3djL2hlbHBlcnMvZXNtL19jaGVja19wcml2YXRlX3JlZGVjbGFyYXRpb24uanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHN3Yy9oZWxwZXJzL2VzbS9fY2xhc3NfcHJpdmF0ZV9maWVsZF9pbml0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3RhaWx3aW5kLW1lcmdlL2Rpc3QvYnVuZGxlLW1qcy5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvc3RhY2tibHVyLWNhbnZhcy9kaXN0L3N0YWNrYmx1ci1lcy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy96dXN0YW5kL2VzbS92YW5pbGxhLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy96dXN0YW5kL2VzbS9yZWFjdC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvenVzdGFuZC9lc20vaW5kZXgubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0Bzd2MvaGVscGVycy9lc20vX2NsYXNzX2FwcGx5X2Rlc2NyaXB0b3JfZ2V0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0Bzd2MvaGVscGVycy9lc20vX2NsYXNzX3ByaXZhdGVfZmllbGRfZ2V0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3VzZS1zeW5jLWV4dGVybmFsLXN0b3JlL3NoaW0vd2l0aC1zZWxlY3Rvci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AdGFuc3RhY2svdmlydHVhbC1jb3JlL2Rpc3QvZXNtL3V0aWxzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0B0YW5zdGFjay92aXJ0dWFsLWNvcmUvZGlzdC9lc20vaW5kZXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHRhbnN0YWNrL3JlYWN0LXZpcnR1YWwvZGlzdC9lc20vaW5kZXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvdXNlLXN5bmMtZXh0ZXJuYWwtc3RvcmUvY2pzL3VzZS1zeW5jLWV4dGVybmFsLXN0b3JlLXdpdGgtc2VsZWN0b3IuZGV2ZWxvcG1lbnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3VzZS1zeW5jLWV4dGVybmFsLXN0b3JlL3dpdGgtc2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHN3Yy9oZWxwZXJzL2VzbS9fY2xhc3NfYXBwbHlfZGVzY3JpcHRvcl9zZXQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHN3Yy9oZWxwZXJzL2VzbS9fY2xhc3NfcHJpdmF0ZV9maWVsZF9zZXQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvdXNlLXN5bmMtZXh0ZXJuYWwtc3RvcmUvY2pzL3VzZS1zeW5jLWV4dGVybmFsLXN0b3JlLXNoaW0vd2l0aC1zZWxlY3Rvci5kZXZlbG9wbWVudC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy91c2Utc3luYy1leHRlcm5hbC1zdG9yZS9janMvdXNlLXN5bmMtZXh0ZXJuYWwtc3RvcmUtc2hpbS5kZXZlbG9wbWVudC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy96dXN0YW5kL2VzbS9taWRkbGV3YXJlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3N2Zy1wYXRoZGF0YS9saWIvU1ZHUGF0aERhdGEubW9kdWxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxuLy8gYHZpY3RvcnktdmVuZG9yL2QzLXNoYXBlYCAoRVNNKVxuLy8gU2VlIHVwc3RyZWFtIGxpY2Vuc2U6IGh0dHBzOi8vZ2l0aHViLmNvbS9kMy9kMy1zaGFwZS9ibG9iL21haW4vTElDRU5TRVxuLy9cbi8vIE91ciBFU00gcGFja2FnZSB1c2VzIHRoZSB1bmRlcmx5aW5nIGluc3RhbGxlZCBkZXBlbmRlbmNpZXMgb2YgYG5vZGVfbW9kdWxlcy9kMy1zaGFwZWBcbmV4cG9ydCAqIGZyb20gXCJkMy1zaGFwZVwiO1xuIiwiZnVuY3Rpb24gX2NsYXNzX2V4dHJhY3RfZmllbGRfZGVzY3JpcHRvcihyZWNlaXZlciwgcHJpdmF0ZU1hcCwgYWN0aW9uKSB7XG4gICAgaWYgKCFwcml2YXRlTWFwLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJhdHRlbXB0ZWQgdG8gXCIgKyBhY3Rpb24gKyBcIiBwcml2YXRlIGZpZWxkIG9uIG5vbi1pbnN0YW5jZVwiKTtcblxuICAgIHJldHVybiBwcml2YXRlTWFwLmdldChyZWNlaXZlcik7XG59XG5leHBvcnQgeyBfY2xhc3NfZXh0cmFjdF9maWVsZF9kZXNjcmlwdG9yIGFzIF8gfTtcbiIsImltcG9ydCB7IHByb2R1Y2UgfSBmcm9tICdpbW1lcic7XG5cbmNvbnN0IGltbWVySW1wbCA9IChpbml0aWFsaXplcikgPT4gKHNldCwgZ2V0LCBzdG9yZSkgPT4ge1xuICBzdG9yZS5zZXRTdGF0ZSA9ICh1cGRhdGVyLCByZXBsYWNlLCAuLi5hcmdzKSA9PiB7XG4gICAgY29uc3QgbmV4dFN0YXRlID0gdHlwZW9mIHVwZGF0ZXIgPT09IFwiZnVuY3Rpb25cIiA/IHByb2R1Y2UodXBkYXRlcikgOiB1cGRhdGVyO1xuICAgIHJldHVybiBzZXQobmV4dFN0YXRlLCByZXBsYWNlLCAuLi5hcmdzKTtcbiAgfTtcbiAgcmV0dXJuIGluaXRpYWxpemVyKHN0b3JlLnNldFN0YXRlLCBnZXQsIHN0b3JlKTtcbn07XG5jb25zdCBpbW1lciA9IGltbWVySW1wbDtcblxuZXhwb3J0IHsgaW1tZXIgfTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBvcHRpb25zLnNldEF0dHJpYnV0ZXMoZWxlbWVudCwgb3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgb3B0aW9ucy5pbnNlcnQoZWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydFN0eWxlRWxlbWVudDsiLCJ2YXIgaXNQcm9kdWN0aW9uID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJztcbnZhciBwcmVmaXggPSAnSW52YXJpYW50IGZhaWxlZCc7XG5mdW5jdGlvbiBpbnZhcmlhbnQoY29uZGl0aW9uLCBtZXNzYWdlKSB7XG4gICAgaWYgKGNvbmRpdGlvbikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChpc1Byb2R1Y3Rpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHByZWZpeCk7XG4gICAgfVxuICAgIHZhciBwcm92aWRlZCA9IHR5cGVvZiBtZXNzYWdlID09PSAnZnVuY3Rpb24nID8gbWVzc2FnZSgpIDogbWVzc2FnZTtcbiAgICB2YXIgdmFsdWUgPSBwcm92aWRlZCA/IFwiXCIuY29uY2F0KHByZWZpeCwgXCI6IFwiKS5jb25jYXQocHJvdmlkZWQpIDogcHJlZml4O1xuICAgIHRocm93IG5ldyBFcnJvcih2YWx1ZSk7XG59XG5cbmV4cG9ydCB7IGludmFyaWFudCBhcyBkZWZhdWx0IH07XG4iLCIndXNlIHN0cmljdCc7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vY2pzL3VzZS1zeW5jLWV4dGVybmFsLXN0b3JlLXNoaW0ucHJvZHVjdGlvbi5qcycpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9janMvdXNlLXN5bmMtZXh0ZXJuYWwtc3RvcmUtc2hpbS5kZXZlbG9wbWVudC5qcycpO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBkZWZhdWx0UGFyc2VPcHRpb25zID0ge1xuICBkZWNvZGVWYWx1ZXM6IHRydWUsXG4gIG1hcDogZmFsc2UsXG4gIHNpbGVudDogZmFsc2UsXG59O1xuXG5mdW5jdGlvbiBpc0ZvcmJpZGRlbktleShrZXkpIHtcbiAgcmV0dXJuIHR5cGVvZiBrZXkgIT09IFwic3RyaW5nXCIgfHwga2V5IGluIHt9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVOdWxsT2JqKCkge1xuICByZXR1cm4gT2JqZWN0LmNyZWF0ZShudWxsKTtcbn1cblxuZnVuY3Rpb24gaXNOb25FbXB0eVN0cmluZyhzdHIpIHtcbiAgcmV0dXJuIHR5cGVvZiBzdHIgPT09IFwic3RyaW5nXCIgJiYgISFzdHIudHJpbSgpO1xufVxuXG5mdW5jdGlvbiBwYXJzZVN0cmluZyhzZXRDb29raWVWYWx1ZSwgb3B0aW9ucykge1xuICB2YXIgcGFydHMgPSBzZXRDb29raWVWYWx1ZS5zcGxpdChcIjtcIikuZmlsdGVyKGlzTm9uRW1wdHlTdHJpbmcpO1xuXG4gIHZhciBuYW1lVmFsdWVQYWlyU3RyID0gcGFydHMuc2hpZnQoKTtcbiAgdmFyIHBhcnNlZCA9IHBhcnNlTmFtZVZhbHVlUGFpcihuYW1lVmFsdWVQYWlyU3RyKTtcbiAgdmFyIG5hbWUgPSBwYXJzZWQubmFtZTtcbiAgdmFyIHZhbHVlID0gcGFyc2VkLnZhbHVlO1xuXG4gIG9wdGlvbnMgPSBvcHRpb25zXG4gICAgPyBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0UGFyc2VPcHRpb25zLCBvcHRpb25zKVxuICAgIDogZGVmYXVsdFBhcnNlT3B0aW9ucztcblxuICBpZiAoaXNGb3JiaWRkZW5LZXkobmFtZSkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHRyeSB7XG4gICAgdmFsdWUgPSBvcHRpb25zLmRlY29kZVZhbHVlcyA/IGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkgOiB2YWx1ZTsgLy8gZGVjb2RlIGNvb2tpZSB2YWx1ZVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgIFwic2V0LWNvb2tpZS1wYXJzZXI6IGZhaWxlZCB0byBkZWNvZGUgY29va2llIHZhbHVlLiBTZXQgb3B0aW9ucy5kZWNvZGVWYWx1ZXM9ZmFsc2UgdG8gZGlzYWJsZSBkZWNvZGluZy5cIixcbiAgICAgIGVcbiAgICApO1xuICB9XG5cbiAgdmFyIGNvb2tpZSA9IGNyZWF0ZU51bGxPYmooKTtcbiAgY29va2llLm5hbWUgPSBuYW1lO1xuICBjb29raWUudmFsdWUgPSB2YWx1ZTtcblxuICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgdmFyIHNpZGVzID0gcGFydC5zcGxpdChcIj1cIik7XG4gICAgdmFyIGtleSA9IHNpZGVzLnNoaWZ0KCkudHJpbUxlZnQoKS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChpc0ZvcmJpZGRlbktleShrZXkpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB2YWx1ZSA9IHNpZGVzLmpvaW4oXCI9XCIpO1xuICAgIGlmIChrZXkgPT09IFwiZXhwaXJlc1wiKSB7XG4gICAgICBjb29raWUuZXhwaXJlcyA9IG5ldyBEYXRlKHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJtYXgtYWdlXCIpIHtcbiAgICAgIHZhciBuID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcbiAgICAgIGlmICghTnVtYmVyLmlzTmFOKG4pKSBjb29raWUubWF4QWdlID0gbjtcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJzZWN1cmVcIikge1xuICAgICAgY29va2llLnNlY3VyZSA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChrZXkgPT09IFwiaHR0cG9ubHlcIikge1xuICAgICAgY29va2llLmh0dHBPbmx5ID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJzYW1lc2l0ZVwiKSB7XG4gICAgICBjb29raWUuc2FtZVNpdGUgPSB2YWx1ZTtcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJwYXJ0aXRpb25lZFwiKSB7XG4gICAgICBjb29raWUucGFydGl0aW9uZWQgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoa2V5KSB7XG4gICAgICBjb29raWVba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGNvb2tpZTtcbn1cblxuZnVuY3Rpb24gcGFyc2VOYW1lVmFsdWVQYWlyKG5hbWVWYWx1ZVBhaXJTdHIpIHtcbiAgLy8gUGFyc2VzIG5hbWUtdmFsdWUtcGFpciBhY2NvcmRpbmcgdG8gcmZjNjI2NWJpcyBkcmFmdFxuXG4gIHZhciBuYW1lID0gXCJcIjtcbiAgdmFyIHZhbHVlID0gXCJcIjtcbiAgdmFyIG5hbWVWYWx1ZUFyciA9IG5hbWVWYWx1ZVBhaXJTdHIuc3BsaXQoXCI9XCIpO1xuICBpZiAobmFtZVZhbHVlQXJyLmxlbmd0aCA+IDEpIHtcbiAgICBuYW1lID0gbmFtZVZhbHVlQXJyLnNoaWZ0KCk7XG4gICAgdmFsdWUgPSBuYW1lVmFsdWVBcnIuam9pbihcIj1cIik7IC8vIGV2ZXJ5dGhpbmcgYWZ0ZXIgdGhlIGZpcnN0ID0sIGpvaW5lZCBieSBhIFwiPVwiIGlmIHRoZXJlIHdhcyBtb3JlIHRoYW4gb25lIHBhcnRcbiAgfSBlbHNlIHtcbiAgICB2YWx1ZSA9IG5hbWVWYWx1ZVBhaXJTdHI7XG4gIH1cblxuICByZXR1cm4geyBuYW1lOiBuYW1lLCB2YWx1ZTogdmFsdWUgfTtcbn1cblxuZnVuY3Rpb24gcGFyc2UoaW5wdXQsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnNcbiAgICA/IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRQYXJzZU9wdGlvbnMsIG9wdGlvbnMpXG4gICAgOiBkZWZhdWx0UGFyc2VPcHRpb25zO1xuXG4gIGlmICghaW5wdXQpIHtcbiAgICBpZiAoIW9wdGlvbnMubWFwKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjcmVhdGVOdWxsT2JqKCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKGlucHV0LmhlYWRlcnMpIHtcbiAgICBpZiAodHlwZW9mIGlucHV0LmhlYWRlcnMuZ2V0U2V0Q29va2llID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIC8vIGZvciBmZXRjaCByZXNwb25zZXMgLSB0aGV5IGNvbWJpbmUgaGVhZGVycyBvZiB0aGUgc2FtZSB0eXBlIGluIHRoZSBoZWFkZXJzIGFycmF5LFxuICAgICAgLy8gYnV0IGdldFNldENvb2tpZSByZXR1cm5zIGFuIHVuY29tYmluZWQgYXJyYXlcbiAgICAgIGlucHV0ID0gaW5wdXQuaGVhZGVycy5nZXRTZXRDb29raWUoKTtcbiAgICB9IGVsc2UgaWYgKGlucHV0LmhlYWRlcnNbXCJzZXQtY29va2llXCJdKSB7XG4gICAgICAvLyBmYXN0LXBhdGggZm9yIG5vZGUuanMgKHdoaWNoIGF1dG9tYXRpY2FsbHkgbm9ybWFsaXplcyBoZWFkZXIgbmFtZXMgdG8gbG93ZXItY2FzZSlcbiAgICAgIGlucHV0ID0gaW5wdXQuaGVhZGVyc1tcInNldC1jb29raWVcIl07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHNsb3ctcGF0aCBmb3Igb3RoZXIgZW52aXJvbm1lbnRzIC0gc2VlICMyNVxuICAgICAgdmFyIHNjaCA9XG4gICAgICAgIGlucHV0LmhlYWRlcnNbXG4gICAgICAgICAgT2JqZWN0LmtleXMoaW5wdXQuaGVhZGVycykuZmluZChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4ga2V5LnRvTG93ZXJDYXNlKCkgPT09IFwic2V0LWNvb2tpZVwiO1xuICAgICAgICAgIH0pXG4gICAgICAgIF07XG4gICAgICAvLyB3YXJuIGlmIGNhbGxlZCBvbiBhIHJlcXVlc3QtbGlrZSBvYmplY3Qgd2l0aCBhIGNvb2tpZSBoZWFkZXIgcmF0aGVyIHRoYW4gYSBzZXQtY29va2llIGhlYWRlciAtIHNlZSAjMzQsIDM2XG4gICAgICBpZiAoIXNjaCAmJiBpbnB1dC5oZWFkZXJzLmNvb2tpZSAmJiAhb3B0aW9ucy5zaWxlbnQpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIFwiV2FybmluZzogc2V0LWNvb2tpZS1wYXJzZXIgYXBwZWFycyB0byBoYXZlIGJlZW4gY2FsbGVkIG9uIGEgcmVxdWVzdCBvYmplY3QuIEl0IGlzIGRlc2lnbmVkIHRvIHBhcnNlIFNldC1Db29raWUgaGVhZGVycyBmcm9tIHJlc3BvbnNlcywgbm90IENvb2tpZSBoZWFkZXJzIGZyb20gcmVxdWVzdHMuIFNldCB0aGUgb3B0aW9uIHtzaWxlbnQ6IHRydWV9IHRvIHN1cHByZXNzIHRoaXMgd2FybmluZy5cIlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaW5wdXQgPSBzY2g7XG4gICAgfVxuICB9XG4gIGlmICghQXJyYXkuaXNBcnJheShpbnB1dCkpIHtcbiAgICBpbnB1dCA9IFtpbnB1dF07XG4gIH1cblxuICBpZiAoIW9wdGlvbnMubWFwKSB7XG4gICAgcmV0dXJuIGlucHV0XG4gICAgICAuZmlsdGVyKGlzTm9uRW1wdHlTdHJpbmcpXG4gICAgICAubWFwKGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlU3RyaW5nKHN0ciwgb3B0aW9ucyk7XG4gICAgICB9KVxuICAgICAgLmZpbHRlcihCb29sZWFuKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgY29va2llcyA9IGNyZWF0ZU51bGxPYmooKTtcbiAgICByZXR1cm4gaW5wdXQuZmlsdGVyKGlzTm9uRW1wdHlTdHJpbmcpLnJlZHVjZShmdW5jdGlvbiAoY29va2llcywgc3RyKSB7XG4gICAgICB2YXIgY29va2llID0gcGFyc2VTdHJpbmcoc3RyLCBvcHRpb25zKTtcbiAgICAgIGlmIChjb29raWUgJiYgIWlzRm9yYmlkZGVuS2V5KGNvb2tpZS5uYW1lKSkge1xuICAgICAgICBjb29raWVzW2Nvb2tpZS5uYW1lXSA9IGNvb2tpZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb29raWVzO1xuICAgIH0sIGNvb2tpZXMpO1xuICB9XG59XG5cbi8qXG4gIFNldC1Db29raWUgaGVhZGVyIGZpZWxkLXZhbHVlcyBhcmUgc29tZXRpbWVzIGNvbW1hIGpvaW5lZCBpbiBvbmUgc3RyaW5nLiBUaGlzIHNwbGl0cyB0aGVtIHdpdGhvdXQgY2hva2luZyBvbiBjb21tYXNcbiAgdGhhdCBhcmUgd2l0aGluIGEgc2luZ2xlIHNldC1jb29raWUgZmllbGQtdmFsdWUsIHN1Y2ggYXMgaW4gdGhlIEV4cGlyZXMgcG9ydGlvbi5cblxuICBUaGlzIGlzIHVuY29tbW9uLCBidXQgZXhwbGljaXRseSBhbGxvd2VkIC0gc2VlIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMyNjE2I3NlY3Rpb24tNC4yXG4gIE5vZGUuanMgZG9lcyB0aGlzIGZvciBldmVyeSBoZWFkZXIgKmV4Y2VwdCogc2V0LWNvb2tpZSAtIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvYmxvYi9kNWUzNjNiNzdlYmFmMWNhZjY3Y2Q3NTI4MjI0YjY1MWM4NjgxNWMxL2xpYi9faHR0cF9pbmNvbWluZy5qcyNMMTI4XG4gIFJlYWN0IE5hdGl2ZSdzIGZldGNoIGRvZXMgdGhpcyBmb3IgKmV2ZXJ5KiBoZWFkZXIsIGluY2x1ZGluZyBzZXQtY29va2llLlxuXG4gIEJhc2VkIG9uOiBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL2oyb2JqYy9jb21taXQvMTY4MjBmZGJjOGY3NmNhMGMzMzQ3MjgxMGNlMGNiMDNkMjBlZmUyNVxuICBDcmVkaXRzIHRvOiBodHRwczovL2dpdGh1Yi5jb20vdG9tYmFsbCBmb3Igb3JpZ2luYWwgYW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9jaHJ1c2FydCBmb3IgSmF2YVNjcmlwdCBpbXBsZW1lbnRhdGlvblxuKi9cbmZ1bmN0aW9uIHNwbGl0Q29va2llc1N0cmluZyhjb29raWVzU3RyaW5nKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGNvb2tpZXNTdHJpbmcpKSB7XG4gICAgcmV0dXJuIGNvb2tpZXNTdHJpbmc7XG4gIH1cbiAgaWYgKHR5cGVvZiBjb29raWVzU3RyaW5nICE9PSBcInN0cmluZ1wiKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgdmFyIGNvb2tpZXNTdHJpbmdzID0gW107XG4gIHZhciBwb3MgPSAwO1xuICB2YXIgc3RhcnQ7XG4gIHZhciBjaDtcbiAgdmFyIGxhc3RDb21tYTtcbiAgdmFyIG5leHRTdGFydDtcbiAgdmFyIGNvb2tpZXNTZXBhcmF0b3JGb3VuZDtcblxuICBmdW5jdGlvbiBza2lwV2hpdGVzcGFjZSgpIHtcbiAgICB3aGlsZSAocG9zIDwgY29va2llc1N0cmluZy5sZW5ndGggJiYgL1xccy8udGVzdChjb29raWVzU3RyaW5nLmNoYXJBdChwb3MpKSkge1xuICAgICAgcG9zICs9IDE7XG4gICAgfVxuICAgIHJldHVybiBwb3MgPCBjb29raWVzU3RyaW5nLmxlbmd0aDtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vdFNwZWNpYWxDaGFyKCkge1xuICAgIGNoID0gY29va2llc1N0cmluZy5jaGFyQXQocG9zKTtcblxuICAgIHJldHVybiBjaCAhPT0gXCI9XCIgJiYgY2ggIT09IFwiO1wiICYmIGNoICE9PSBcIixcIjtcbiAgfVxuXG4gIHdoaWxlIChwb3MgPCBjb29raWVzU3RyaW5nLmxlbmd0aCkge1xuICAgIHN0YXJ0ID0gcG9zO1xuICAgIGNvb2tpZXNTZXBhcmF0b3JGb3VuZCA9IGZhbHNlO1xuXG4gICAgd2hpbGUgKHNraXBXaGl0ZXNwYWNlKCkpIHtcbiAgICAgIGNoID0gY29va2llc1N0cmluZy5jaGFyQXQocG9zKTtcbiAgICAgIGlmIChjaCA9PT0gXCIsXCIpIHtcbiAgICAgICAgLy8gJywnIGlzIGEgY29va2llIHNlcGFyYXRvciBpZiB3ZSBoYXZlIGxhdGVyIGZpcnN0ICc9Jywgbm90ICc7JyBvciAnLCdcbiAgICAgICAgbGFzdENvbW1hID0gcG9zO1xuICAgICAgICBwb3MgKz0gMTtcblxuICAgICAgICBza2lwV2hpdGVzcGFjZSgpO1xuICAgICAgICBuZXh0U3RhcnQgPSBwb3M7XG5cbiAgICAgICAgd2hpbGUgKHBvcyA8IGNvb2tpZXNTdHJpbmcubGVuZ3RoICYmIG5vdFNwZWNpYWxDaGFyKCkpIHtcbiAgICAgICAgICBwb3MgKz0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGN1cnJlbnRseSBzcGVjaWFsIGNoYXJhY3RlclxuICAgICAgICBpZiAocG9zIDwgY29va2llc1N0cmluZy5sZW5ndGggJiYgY29va2llc1N0cmluZy5jaGFyQXQocG9zKSA9PT0gXCI9XCIpIHtcbiAgICAgICAgICAvLyB3ZSBmb3VuZCBjb29raWVzIHNlcGFyYXRvclxuICAgICAgICAgIGNvb2tpZXNTZXBhcmF0b3JGb3VuZCA9IHRydWU7XG4gICAgICAgICAgLy8gcG9zIGlzIGluc2lkZSB0aGUgbmV4dCBjb29raWUsIHNvIGJhY2sgdXAgYW5kIHJldHVybiBpdC5cbiAgICAgICAgICBwb3MgPSBuZXh0U3RhcnQ7XG4gICAgICAgICAgY29va2llc1N0cmluZ3MucHVzaChjb29raWVzU3RyaW5nLnN1YnN0cmluZyhzdGFydCwgbGFzdENvbW1hKSk7XG4gICAgICAgICAgc3RhcnQgPSBwb3M7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gaW4gcGFyYW0gJywnIG9yIHBhcmFtIHNlcGFyYXRvciAnOycsXG4gICAgICAgICAgLy8gd2UgY29udGludWUgZnJvbSB0aGF0IGNvbW1hXG4gICAgICAgICAgcG9zID0gbGFzdENvbW1hICsgMTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcG9zICs9IDE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFjb29raWVzU2VwYXJhdG9yRm91bmQgfHwgcG9zID49IGNvb2tpZXNTdHJpbmcubGVuZ3RoKSB7XG4gICAgICBjb29raWVzU3RyaW5ncy5wdXNoKGNvb2tpZXNTdHJpbmcuc3Vic3RyaW5nKHN0YXJ0LCBjb29raWVzU3RyaW5nLmxlbmd0aCkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb29raWVzU3RyaW5ncztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZTtcbm1vZHVsZS5leHBvcnRzLnBhcnNlID0gcGFyc2U7XG5tb2R1bGUuZXhwb3J0cy5wYXJzZVN0cmluZyA9IHBhcnNlU3RyaW5nO1xubW9kdWxlLmV4cG9ydHMuc3BsaXRDb29raWVzU3RyaW5nID0gc3BsaXRDb29raWVzU3RyaW5nO1xuIiwiXG4vLyBgdmljdG9yeS12ZW5kb3IvZDMtc2NhbGVgIChFU00pXG4vLyBTZWUgdXBzdHJlYW0gbGljZW5zZTogaHR0cHM6Ly9naXRodWIuY29tL2QzL2QzLXNjYWxlL2Jsb2IvbWFpbi9MSUNFTlNFXG4vL1xuLy8gT3VyIEVTTSBwYWNrYWdlIHVzZXMgdGhlIHVuZGVybHlpbmcgaW5zdGFsbGVkIGRlcGVuZGVuY2llcyBvZiBgbm9kZV9tb2R1bGVzL2QzLXNjYWxlYFxuZXhwb3J0ICogZnJvbSBcImQzLXNjYWxlXCI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCkge1xuICBpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICB9XG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlVGFnVHJhbnNmb3JtOyIsIi8qIVxuKiB0YWJiYWJsZSA2LjMuMFxuKiBAbGljZW5zZSBNSVQsIGh0dHBzOi8vZ2l0aHViLmNvbS9mb2N1cy10cmFwL3RhYmJhYmxlL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiovXG4vLyBOT1RFOiBzZXBhcmF0ZSBgOm5vdCgpYCBzZWxlY3RvcnMgaGFzIGJyb2FkZXIgYnJvd3NlciBzdXBwb3J0IHRoYW4gdGhlIG5ld2VyXG4vLyAgYDpub3QoW2luZXJ0XSwgW2luZXJ0XSAqKWAgKEZlYiAyMDIzKVxuLy8gQ0FSRUZVTDogSlNEb20gZG9lcyBub3Qgc3VwcG9ydCBgOm5vdChbaW5lcnRdICopYCBhcyBhIHNlbGVjdG9yOyB1c2luZyBpdCBjYXVzZXNcbi8vICB0aGUgZW50aXJlIHF1ZXJ5IHRvIGZhaWwsIHJlc3VsdGluZyBpbiBubyBub2RlcyBmb3VuZCwgd2hpY2ggd2lsbCBicmVhayBhIGxvdFxuLy8gIG9mIHRoaW5ncy4uLiBzbyB3ZSBoYXZlIHRvIHJlbHkgb24gSlMgdG8gaWRlbnRpZnkgbm9kZXMgaW5zaWRlIGFuIGluZXJ0IGNvbnRhaW5lclxudmFyIGNhbmRpZGF0ZVNlbGVjdG9ycyA9IFsnaW5wdXQ6bm90KFtpbmVydF0pJywgJ3NlbGVjdDpub3QoW2luZXJ0XSknLCAndGV4dGFyZWE6bm90KFtpbmVydF0pJywgJ2FbaHJlZl06bm90KFtpbmVydF0pJywgJ2J1dHRvbjpub3QoW2luZXJ0XSknLCAnW3RhYmluZGV4XTpub3Qoc2xvdCk6bm90KFtpbmVydF0pJywgJ2F1ZGlvW2NvbnRyb2xzXTpub3QoW2luZXJ0XSknLCAndmlkZW9bY29udHJvbHNdOm5vdChbaW5lcnRdKScsICdbY29udGVudGVkaXRhYmxlXTpub3QoW2NvbnRlbnRlZGl0YWJsZT1cImZhbHNlXCJdKTpub3QoW2luZXJ0XSknLCAnZGV0YWlscz5zdW1tYXJ5OmZpcnN0LW9mLXR5cGU6bm90KFtpbmVydF0pJywgJ2RldGFpbHM6bm90KFtpbmVydF0pJ107XG52YXIgY2FuZGlkYXRlU2VsZWN0b3IgPSAvKiAjX19QVVJFX18gKi9jYW5kaWRhdGVTZWxlY3RvcnMuam9pbignLCcpO1xudmFyIE5vRWxlbWVudCA9IHR5cGVvZiBFbGVtZW50ID09PSAndW5kZWZpbmVkJztcbnZhciBtYXRjaGVzID0gTm9FbGVtZW50ID8gZnVuY3Rpb24gKCkge30gOiBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzIHx8IEVsZW1lbnQucHJvdG90eXBlLm1zTWF0Y2hlc1NlbGVjdG9yIHx8IEVsZW1lbnQucHJvdG90eXBlLndlYmtpdE1hdGNoZXNTZWxlY3RvcjtcbnZhciBnZXRSb290Tm9kZSA9ICFOb0VsZW1lbnQgJiYgRWxlbWVudC5wcm90b3R5cGUuZ2V0Um9vdE5vZGUgPyBmdW5jdGlvbiAoZWxlbWVudCkge1xuICB2YXIgX2VsZW1lbnQkZ2V0Um9vdE5vZGU7XG4gIHJldHVybiBlbGVtZW50ID09PSBudWxsIHx8IGVsZW1lbnQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IChfZWxlbWVudCRnZXRSb290Tm9kZSA9IGVsZW1lbnQuZ2V0Um9vdE5vZGUpID09PSBudWxsIHx8IF9lbGVtZW50JGdldFJvb3ROb2RlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZWxlbWVudCRnZXRSb290Tm9kZS5jYWxsKGVsZW1lbnQpO1xufSA6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIHJldHVybiBlbGVtZW50ID09PSBudWxsIHx8IGVsZW1lbnQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGVsZW1lbnQub3duZXJEb2N1bWVudDtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiBhIG5vZGUgaXMgaW5lcnQgb3IgaW4gYW4gaW5lcnQgYW5jZXN0b3IuXG4gKiBAcGFyYW0ge0VsZW1lbnR9IFtub2RlXVxuICogQHBhcmFtIHtib29sZWFufSBbbG9va1VwXSBJZiB0cnVlIGFuZCBgbm9kZWAgaXMgbm90IGluZXJ0LCBsb29rcyB1cCBhdCBhbmNlc3RvcnMgdG9cbiAqICBzZWUgaWYgYW55IG9mIHRoZW0gYXJlIGluZXJ0LiBJZiBmYWxzZSwgb25seSBgbm9kZWAgaXRzZWxmIGlzIGNvbnNpZGVyZWQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBpbmVydCBpdHNlbGYgb3IgYnkgd2F5IG9mIGJlaW5nIGluIGFuIGluZXJ0IGFuY2VzdG9yLlxuICogIEZhbHNlIGlmIGBub2RlYCBpcyBmYWxzeS5cbiAqL1xudmFyIF9pc0luZXJ0ID0gZnVuY3Rpb24gaXNJbmVydChub2RlLCBsb29rVXApIHtcbiAgdmFyIF9ub2RlJGdldEF0dHJpYnV0ZTtcbiAgaWYgKGxvb2tVcCA9PT0gdm9pZCAwKSB7XG4gICAgbG9va1VwID0gdHJ1ZTtcbiAgfVxuICAvLyBDQVJFRlVMOiBKU0RvbSBkb2VzIG5vdCBzdXBwb3J0IGluZXJ0IGF0IGFsbCwgc28gd2UgY2FuJ3QgdXNlIHRoZSBgSFRNTEVsZW1lbnQuaW5lcnRgXG4gIC8vICBKUyBBUEkgcHJvcGVydHk7IHdlIGhhdmUgdG8gY2hlY2sgdGhlIGF0dHJpYnV0ZSwgd2hpY2ggY2FuIGVpdGhlciBiZSBlbXB0eSBvciAndHJ1ZSc7XG4gIC8vICBpZiBpdCdzIGBudWxsYCAobm90IHNwZWNpZmllZCkgb3IgJ2ZhbHNlJywgaXQncyBhbiBhY3RpdmUgZWxlbWVudFxuICB2YXIgaW5lcnRBdHQgPSBub2RlID09PSBudWxsIHx8IG5vZGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IChfbm9kZSRnZXRBdHRyaWJ1dGUgPSBub2RlLmdldEF0dHJpYnV0ZSkgPT09IG51bGwgfHwgX25vZGUkZ2V0QXR0cmlidXRlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfbm9kZSRnZXRBdHRyaWJ1dGUuY2FsbChub2RlLCAnaW5lcnQnKTtcbiAgdmFyIGluZXJ0ID0gaW5lcnRBdHQgPT09ICcnIHx8IGluZXJ0QXR0ID09PSAndHJ1ZSc7XG5cbiAgLy8gTk9URTogdGhpcyBjb3VsZCBhbHNvIGJlIGhhbmRsZWQgd2l0aCBgbm9kZS5tYXRjaGVzKCdbaW5lcnRdLCA6aXMoW2luZXJ0XSAqKScpYFxuICAvLyAgaWYgaXQgd2VyZW4ndCBmb3IgYG1hdGNoZXMoKWAgbm90IGJlaW5nIGEgZnVuY3Rpb24gb24gc2hhZG93IHJvb3RzOyB0aGUgZm9sbG93aW5nXG4gIC8vICBjb2RlIHdvcmtzIGZvciBhbnkga2luZCBvZiBub2RlXG4gIC8vIENBUkVGVUw6IEpTRG9tIGRvZXMgbm90IGFwcGVhciB0byBzdXBwb3J0IGNlcnRhaW4gc2VsZWN0b3JzIGxpa2UgYDpub3QoW2luZXJ0XSAqKWBcbiAgLy8gIHNvIGl0IGxpa2VseSB3b3VsZCBub3Qgc3VwcG9ydCBgOmlzKFtpbmVydF0gKilgIGVpdGhlci4uLlxuICB2YXIgcmVzdWx0ID0gaW5lcnQgfHwgbG9va1VwICYmIG5vZGUgJiYgX2lzSW5lcnQobm9kZS5wYXJlbnROb2RlKTsgLy8gcmVjdXJzaXZlXG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiBhIG5vZGUncyBjb250ZW50IGlzIGVkaXRhYmxlLlxuICogQHBhcmFtIHtFbGVtZW50fSBbbm9kZV1cbiAqIEByZXR1cm5zIFRydWUgaWYgaXQncyBjb250ZW50LWVkaXRhYmxlOyBmYWxzZSBpZiBpdCdzIG5vdCBvciBgbm9kZWAgaXMgZmFsc3kuXG4gKi9cbnZhciBpc0NvbnRlbnRFZGl0YWJsZSA9IGZ1bmN0aW9uIGlzQ29udGVudEVkaXRhYmxlKG5vZGUpIHtcbiAgdmFyIF9ub2RlJGdldEF0dHJpYnV0ZTI7XG4gIC8vIENBUkVGVUw6IEpTRG9tIGRvZXMgbm90IHN1cHBvcnQgdGhlIGBIVE1MRWxlbWVudC5pc0NvbnRlbnRFZGl0YWJsZWAgQVBJIHNvIHdlIGhhdmVcbiAgLy8gIHRvIHVzZSB0aGUgYXR0cmlidXRlIGRpcmVjdGx5IHRvIGNoZWNrIGZvciB0aGlzLCB3aGljaCBjYW4gZWl0aGVyIGJlIGVtcHR5IG9yICd0cnVlJztcbiAgLy8gIGlmIGl0J3MgYG51bGxgIChub3Qgc3BlY2lmaWVkKSBvciAnZmFsc2UnLCBpdCdzIGEgbm9uLWVkaXRhYmxlIGVsZW1lbnRcbiAgdmFyIGF0dFZhbHVlID0gbm9kZSA9PT0gbnVsbCB8fCBub2RlID09PSB2b2lkIDAgPyB2b2lkIDAgOiAoX25vZGUkZ2V0QXR0cmlidXRlMiA9IG5vZGUuZ2V0QXR0cmlidXRlKSA9PT0gbnVsbCB8fCBfbm9kZSRnZXRBdHRyaWJ1dGUyID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfbm9kZSRnZXRBdHRyaWJ1dGUyLmNhbGwobm9kZSwgJ2NvbnRlbnRlZGl0YWJsZScpO1xuICByZXR1cm4gYXR0VmFsdWUgPT09ICcnIHx8IGF0dFZhbHVlID09PSAndHJ1ZSc7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWwgY29udGFpbmVyIHRvIGNoZWNrIGluXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGluY2x1ZGVDb250YWluZXIgYWRkIGNvbnRhaW5lciB0byBjaGVja1xuICogQHBhcmFtIHsobm9kZTogRWxlbWVudCkgPT4gYm9vbGVhbn0gZmlsdGVyIGZpbHRlciBjYW5kaWRhdGVzXG4gKiBAcmV0dXJucyB7RWxlbWVudFtdfVxuICovXG52YXIgZ2V0Q2FuZGlkYXRlcyA9IGZ1bmN0aW9uIGdldENhbmRpZGF0ZXMoZWwsIGluY2x1ZGVDb250YWluZXIsIGZpbHRlcikge1xuICAvLyBldmVuIGlmIGBpbmNsdWRlQ29udGFpbmVyPWZhbHNlYCwgd2Ugc3RpbGwgaGF2ZSB0byBjaGVjayBpdCBmb3IgaW5lcnRuZXNzIGJlY2F1c2VcbiAgLy8gIGlmIGl0J3MgaW5lcnQsIGFsbCBpdHMgY2hpbGRyZW4gYXJlIGluZXJ0XG4gIGlmIChfaXNJbmVydChlbCkpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgdmFyIGNhbmRpZGF0ZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuYXBwbHkoZWwucXVlcnlTZWxlY3RvckFsbChjYW5kaWRhdGVTZWxlY3RvcikpO1xuICBpZiAoaW5jbHVkZUNvbnRhaW5lciAmJiBtYXRjaGVzLmNhbGwoZWwsIGNhbmRpZGF0ZVNlbGVjdG9yKSkge1xuICAgIGNhbmRpZGF0ZXMudW5zaGlmdChlbCk7XG4gIH1cbiAgY2FuZGlkYXRlcyA9IGNhbmRpZGF0ZXMuZmlsdGVyKGZpbHRlcik7XG4gIHJldHVybiBjYW5kaWRhdGVzO1xufTtcblxuLyoqXG4gKiBAY2FsbGJhY2sgR2V0U2hhZG93Um9vdFxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IHRvIGNoZWNrIGZvciBzaGFkb3cgcm9vdFxuICogQHJldHVybnMge1NoYWRvd1Jvb3R8Ym9vbGVhbn0gU2hhZG93Um9vdCBpZiBhdmFpbGFibGUgb3IgYm9vbGVhbiBpbmRpY2F0aW5nIGlmIGEgc2hhZG93Um9vdCBpcyBhdHRhY2hlZCBidXQgbm90IGF2YWlsYWJsZS5cbiAqL1xuXG4vKipcbiAqIEBjYWxsYmFjayBTaGFkb3dSb290RmlsdGVyXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHNoYWRvd0hvc3ROb2RlIHRoZSBlbGVtZW50IHdoaWNoIGNvbnRhaW5zIHNoYWRvdyBjb250ZW50XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBhIHNoYWRvdyByb290IGNvdWxkIHBvdGVudGlhbGx5IGNvbnRhaW4gdmFsaWQgY2FuZGlkYXRlcy5cbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IENhbmRpZGF0ZVNjb3BlXG4gKiBAcHJvcGVydHkge0VsZW1lbnR9IHNjb3BlUGFyZW50IGNvbnRhaW5zIGlubmVyIGNhbmRpZGF0ZXNcbiAqIEBwcm9wZXJ0eSB7RWxlbWVudFtdfSBjYW5kaWRhdGVzIGxpc3Qgb2YgY2FuZGlkYXRlcyBmb3VuZCBpbiB0aGUgc2NvcGUgcGFyZW50XG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBJdGVyYXRpdmVPcHRpb25zXG4gKiBAcHJvcGVydHkge0dldFNoYWRvd1Jvb3R8Ym9vbGVhbn0gZ2V0U2hhZG93Um9vdCB0cnVlIGlmIHNoYWRvdyBzdXBwb3J0IGlzIGVuYWJsZWQ7IGZhbHN5IGlmIG5vdDtcbiAqICBpZiBhIGZ1bmN0aW9uLCBpbXBsaWVzIHNoYWRvdyBzdXBwb3J0IGlzIGVuYWJsZWQgYW5kIGVpdGhlciByZXR1cm5zIHRoZSBzaGFkb3cgcm9vdCBvZiBhbiBlbGVtZW50XG4gKiAgb3IgYSBib29sZWFuIHN0YXRpbmcgaWYgaXQgaGFzIGFuIHVuZGlzY2xvc2VkIHNoYWRvdyByb290XG4gKiBAcHJvcGVydHkgeyhub2RlOiBFbGVtZW50KSA9PiBib29sZWFufSBmaWx0ZXIgZmlsdGVyIGNhbmRpZGF0ZXNcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gZmxhdHRlbiBpZiB0cnVlIHRoZW4gcmVzdWx0IHdpbGwgZmxhdHRlbiBhbnkgQ2FuZGlkYXRlU2NvcGUgaW50byB0aGUgcmV0dXJuZWQgbGlzdFxuICogQHByb3BlcnR5IHtTaGFkb3dSb290RmlsdGVyfSBzaGFkb3dSb290RmlsdGVyIGZpbHRlciBzaGFkb3cgcm9vdHM7XG4gKi9cblxuLyoqXG4gKiBAcGFyYW0ge0VsZW1lbnRbXX0gZWxlbWVudHMgbGlzdCBvZiBlbGVtZW50IGNvbnRhaW5lcnMgdG8gbWF0Y2ggY2FuZGlkYXRlcyBmcm9tXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGluY2x1ZGVDb250YWluZXIgYWRkIGNvbnRhaW5lciBsaXN0IHRvIGNoZWNrXG4gKiBAcGFyYW0ge0l0ZXJhdGl2ZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtBcnJheS48RWxlbWVudHxDYW5kaWRhdGVTY29wZT59XG4gKi9cbnZhciBfZ2V0Q2FuZGlkYXRlc0l0ZXJhdGl2ZWx5ID0gZnVuY3Rpb24gZ2V0Q2FuZGlkYXRlc0l0ZXJhdGl2ZWx5KGVsZW1lbnRzLCBpbmNsdWRlQ29udGFpbmVyLCBvcHRpb25zKSB7XG4gIHZhciBjYW5kaWRhdGVzID0gW107XG4gIHZhciBlbGVtZW50c1RvQ2hlY2sgPSBBcnJheS5mcm9tKGVsZW1lbnRzKTtcbiAgd2hpbGUgKGVsZW1lbnRzVG9DaGVjay5sZW5ndGgpIHtcbiAgICB2YXIgZWxlbWVudCA9IGVsZW1lbnRzVG9DaGVjay5zaGlmdCgpO1xuICAgIGlmIChfaXNJbmVydChlbGVtZW50LCBmYWxzZSkpIHtcbiAgICAgIC8vIG5vIG5lZWQgdG8gbG9vayB1cCBzaW5jZSB3ZSdyZSBkcmlsbGluZyBkb3duXG4gICAgICAvLyBhbnl0aGluZyBpbnNpZGUgdGhpcyBjb250YWluZXIgd2lsbCBhbHNvIGJlIGluZXJ0XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PT0gJ1NMT1QnKSB7XG4gICAgICAvLyBhZGQgc2hhZG93IGRvbSBzbG90IHNjb3BlIChzbG90IGl0c2VsZiBjYW5ub3QgYmUgZm9jdXNhYmxlKVxuICAgICAgdmFyIGFzc2lnbmVkID0gZWxlbWVudC5hc3NpZ25lZEVsZW1lbnRzKCk7XG4gICAgICB2YXIgY29udGVudCA9IGFzc2lnbmVkLmxlbmd0aCA/IGFzc2lnbmVkIDogZWxlbWVudC5jaGlsZHJlbjtcbiAgICAgIHZhciBuZXN0ZWRDYW5kaWRhdGVzID0gX2dldENhbmRpZGF0ZXNJdGVyYXRpdmVseShjb250ZW50LCB0cnVlLCBvcHRpb25zKTtcbiAgICAgIGlmIChvcHRpb25zLmZsYXR0ZW4pIHtcbiAgICAgICAgY2FuZGlkYXRlcy5wdXNoLmFwcGx5KGNhbmRpZGF0ZXMsIG5lc3RlZENhbmRpZGF0ZXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FuZGlkYXRlcy5wdXNoKHtcbiAgICAgICAgICBzY29wZVBhcmVudDogZWxlbWVudCxcbiAgICAgICAgICBjYW5kaWRhdGVzOiBuZXN0ZWRDYW5kaWRhdGVzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjaGVjayBjYW5kaWRhdGUgZWxlbWVudFxuICAgICAgdmFyIHZhbGlkQ2FuZGlkYXRlID0gbWF0Y2hlcy5jYWxsKGVsZW1lbnQsIGNhbmRpZGF0ZVNlbGVjdG9yKTtcbiAgICAgIGlmICh2YWxpZENhbmRpZGF0ZSAmJiBvcHRpb25zLmZpbHRlcihlbGVtZW50KSAmJiAoaW5jbHVkZUNvbnRhaW5lciB8fCAhZWxlbWVudHMuaW5jbHVkZXMoZWxlbWVudCkpKSB7XG4gICAgICAgIGNhbmRpZGF0ZXMucHVzaChlbGVtZW50KTtcbiAgICAgIH1cblxuICAgICAgLy8gaXRlcmF0ZSBvdmVyIHNoYWRvdyBjb250ZW50IGlmIHBvc3NpYmxlXG4gICAgICB2YXIgc2hhZG93Um9vdCA9IGVsZW1lbnQuc2hhZG93Um9vdCB8fFxuICAgICAgLy8gY2hlY2sgZm9yIGFuIHVuZGlzY2xvc2VkIHNoYWRvd1xuICAgICAgdHlwZW9mIG9wdGlvbnMuZ2V0U2hhZG93Um9vdCA9PT0gJ2Z1bmN0aW9uJyAmJiBvcHRpb25zLmdldFNoYWRvd1Jvb3QoZWxlbWVudCk7XG5cbiAgICAgIC8vIG5vIGluZXJ0IGxvb2sgdXAgYmVjYXVzZSB3ZSdyZSBhbHJlYWR5IGRyaWxsaW5nIGRvd24gYW5kIGNoZWNraW5nIGZvciBpbmVydG5lc3NcbiAgICAgIC8vICBvbiB0aGUgd2F5IGRvd24sIHNvIGFsbCBjb250YWluZXJzIHRvIHRoaXMgcm9vdCBub2RlIHNob3VsZCBoYXZlIGFscmVhZHkgYmVlblxuICAgICAgLy8gIHZldHRlZCBhcyBub24taW5lcnRcbiAgICAgIHZhciB2YWxpZFNoYWRvd1Jvb3QgPSAhX2lzSW5lcnQoc2hhZG93Um9vdCwgZmFsc2UpICYmICghb3B0aW9ucy5zaGFkb3dSb290RmlsdGVyIHx8IG9wdGlvbnMuc2hhZG93Um9vdEZpbHRlcihlbGVtZW50KSk7XG4gICAgICBpZiAoc2hhZG93Um9vdCAmJiB2YWxpZFNoYWRvd1Jvb3QpIHtcbiAgICAgICAgLy8gYWRkIHNoYWRvdyBkb20gc2NvcGUgSUlGIGEgc2hhZG93IHJvb3Qgbm9kZSB3YXMgZ2l2ZW47IG90aGVyd2lzZSwgYW4gdW5kaXNjbG9zZWRcbiAgICAgICAgLy8gIHNoYWRvdyBleGlzdHMsIHNvIGxvb2sgYXQgbGlnaHQgZG9tIGNoaWxkcmVuIGFzIGZhbGxiYWNrIEJVVCBjcmVhdGUgYSBzY29wZSBmb3IgYW55XG4gICAgICAgIC8vICBjaGlsZCBjYW5kaWRhdGVzIGZvdW5kIGJlY2F1c2UgdGhleSdyZSBsaWtlbHkgc2xvdHRlZCBlbGVtZW50cyAoZWxlbWVudHMgdGhhdCBhcmVcbiAgICAgICAgLy8gIGNoaWxkcmVuIG9mIHRoZSB3ZWIgY29tcG9uZW50IGVsZW1lbnQgKHdoaWNoIGhhcyB0aGUgc2hhZG93KSwgaW4gdGhlIGxpZ2h0IGRvbSwgYnV0XG4gICAgICAgIC8vICBzbG90dGVkIHNvbWV3aGVyZSBfaW5zaWRlXyB0aGUgdW5kaXNjbG9zZWQgc2hhZG93KSAtLSB0aGUgc2NvcGUgaXMgY3JlYXRlZCBiZWxvdyxcbiAgICAgICAgLy8gIF9hZnRlcl8gd2UgcmV0dXJuIGZyb20gdGhpcyByZWN1cnNpdmUgY2FsbFxuICAgICAgICB2YXIgX25lc3RlZENhbmRpZGF0ZXMgPSBfZ2V0Q2FuZGlkYXRlc0l0ZXJhdGl2ZWx5KHNoYWRvd1Jvb3QgPT09IHRydWUgPyBlbGVtZW50LmNoaWxkcmVuIDogc2hhZG93Um9vdC5jaGlsZHJlbiwgdHJ1ZSwgb3B0aW9ucyk7XG4gICAgICAgIGlmIChvcHRpb25zLmZsYXR0ZW4pIHtcbiAgICAgICAgICBjYW5kaWRhdGVzLnB1c2guYXBwbHkoY2FuZGlkYXRlcywgX25lc3RlZENhbmRpZGF0ZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNhbmRpZGF0ZXMucHVzaCh7XG4gICAgICAgICAgICBzY29wZVBhcmVudDogZWxlbWVudCxcbiAgICAgICAgICAgIGNhbmRpZGF0ZXM6IF9uZXN0ZWRDYW5kaWRhdGVzXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHRoZXJlJ3Mgbm90IHNoYWRvdyBzbyBqdXN0IGRpZyBpbnRvIHRoZSBlbGVtZW50J3MgKGxpZ2h0IGRvbSkgY2hpbGRyZW5cbiAgICAgICAgLy8gIF9fd2l0aG91dF9fIGdpdmluZyB0aGUgZWxlbWVudCBzcGVjaWFsIHNjb3BlIHRyZWF0bWVudFxuICAgICAgICBlbGVtZW50c1RvQ2hlY2sudW5zaGlmdC5hcHBseShlbGVtZW50c1RvQ2hlY2ssIGVsZW1lbnQuY2hpbGRyZW4pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gY2FuZGlkYXRlcztcbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIERldGVybWluZXMgaWYgdGhlIG5vZGUgaGFzIGFuIGV4cGxpY2l0bHkgc3BlY2lmaWVkIGB0YWJpbmRleGAgYXR0cmlidXRlLlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gbm9kZVxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgc287IGZhbHNlIGlmIG5vdC5cbiAqL1xudmFyIGhhc1RhYkluZGV4ID0gZnVuY3Rpb24gaGFzVGFiSW5kZXgobm9kZSkge1xuICByZXR1cm4gIWlzTmFOKHBhcnNlSW50KG5vZGUuZ2V0QXR0cmlidXRlKCd0YWJpbmRleCcpLCAxMCkpO1xufTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgdGhlIHRhYiBpbmRleCBvZiBhIGdpdmVuIG5vZGUuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBub2RlXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBUYWIgb3JkZXIgKG5lZ2F0aXZlLCAwLCBvciBwb3NpdGl2ZSBudW1iZXIpLlxuICogQHRocm93cyB7RXJyb3J9IElmIGBub2RlYCBpcyBmYWxzeS5cbiAqL1xudmFyIGdldFRhYkluZGV4ID0gZnVuY3Rpb24gZ2V0VGFiSW5kZXgobm9kZSkge1xuICBpZiAoIW5vZGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIG5vZGUgcHJvdmlkZWQnKTtcbiAgfVxuICBpZiAobm9kZS50YWJJbmRleCA8IDApIHtcbiAgICAvLyBpbiBDaHJvbWUsIDxkZXRhaWxzLz4sIDxhdWRpbyBjb250cm9scy8+IGFuZCA8dmlkZW8gY29udHJvbHMvPiBlbGVtZW50cyBnZXQgYSBkZWZhdWx0XG4gICAgLy8gYHRhYkluZGV4YCBvZiAtMSB3aGVuIHRoZSAndGFiaW5kZXgnIGF0dHJpYnV0ZSBpc24ndCBzcGVjaWZpZWQgaW4gdGhlIERPTSxcbiAgICAvLyB5ZXQgdGhleSBhcmUgc3RpbGwgcGFydCBvZiB0aGUgcmVndWxhciB0YWIgb3JkZXI7IGluIEZGLCB0aGV5IGdldCBhIGRlZmF1bHRcbiAgICAvLyBgdGFiSW5kZXhgIG9mIDA7IHNpbmNlIENocm9tZSBzdGlsbCBwdXRzIHRob3NlIGVsZW1lbnRzIGluIHRoZSByZWd1bGFyIHRhYlxuICAgIC8vIG9yZGVyLCBjb25zaWRlciB0aGVpciB0YWIgaW5kZXggdG8gYmUgMC5cbiAgICAvLyBBbHNvIGJyb3dzZXJzIGRvIG5vdCByZXR1cm4gYHRhYkluZGV4YCBjb3JyZWN0bHkgZm9yIGNvbnRlbnRFZGl0YWJsZSBub2RlcztcbiAgICAvLyBzbyBpZiB0aGV5IGRvbid0IGhhdmUgYSB0YWJpbmRleCBhdHRyaWJ1dGUgc3BlY2lmaWNhbGx5IHNldCwgYXNzdW1lIGl0J3MgMC5cbiAgICBpZiAoKC9eKEFVRElPfFZJREVPfERFVEFJTFMpJC8udGVzdChub2RlLnRhZ05hbWUpIHx8IGlzQ29udGVudEVkaXRhYmxlKG5vZGUpKSAmJiAhaGFzVGFiSW5kZXgobm9kZSkpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbm9kZS50YWJJbmRleDtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIHRoZSB0YWIgaW5kZXggb2YgYSBnaXZlbiBub2RlIF9fZm9yIHNvcnQgb3JkZXIgcHVycG9zZXNfXy5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IG5vZGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzU2NvcGVdIFRydWUgZm9yIGEgY3VzdG9tIGVsZW1lbnQgd2l0aCBzaGFkb3cgcm9vdCBvciBzbG90IHRoYXQsIGJ5IGRlZmF1bHQsXG4gKiAgaGFzIHRhYkluZGV4IC0xLCBidXQgbmVlZHMgdG8gYmUgc29ydGVkIGJ5IGRvY3VtZW50IG9yZGVyIGluIG9yZGVyIGZvciBpdHMgY29udGVudCB0byBiZVxuICogIGluc2VydGVkIGludG8gdGhlIGNvcnJlY3Qgc29ydCBwb3NpdGlvbi5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFRhYiBvcmRlciAobmVnYXRpdmUsIDAsIG9yIHBvc2l0aXZlIG51bWJlcikuXG4gKi9cbnZhciBnZXRTb3J0T3JkZXJUYWJJbmRleCA9IGZ1bmN0aW9uIGdldFNvcnRPcmRlclRhYkluZGV4KG5vZGUsIGlzU2NvcGUpIHtcbiAgdmFyIHRhYkluZGV4ID0gZ2V0VGFiSW5kZXgobm9kZSk7XG4gIGlmICh0YWJJbmRleCA8IDAgJiYgaXNTY29wZSAmJiAhaGFzVGFiSW5kZXgobm9kZSkpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuICByZXR1cm4gdGFiSW5kZXg7XG59O1xudmFyIHNvcnRPcmRlcmVkVGFiYmFibGVzID0gZnVuY3Rpb24gc29ydE9yZGVyZWRUYWJiYWJsZXMoYSwgYikge1xuICByZXR1cm4gYS50YWJJbmRleCA9PT0gYi50YWJJbmRleCA/IGEuZG9jdW1lbnRPcmRlciAtIGIuZG9jdW1lbnRPcmRlciA6IGEudGFiSW5kZXggLSBiLnRhYkluZGV4O1xufTtcbnZhciBpc0lucHV0ID0gZnVuY3Rpb24gaXNJbnB1dChub2RlKSB7XG4gIHJldHVybiBub2RlLnRhZ05hbWUgPT09ICdJTlBVVCc7XG59O1xudmFyIGlzSGlkZGVuSW5wdXQgPSBmdW5jdGlvbiBpc0hpZGRlbklucHV0KG5vZGUpIHtcbiAgcmV0dXJuIGlzSW5wdXQobm9kZSkgJiYgbm9kZS50eXBlID09PSAnaGlkZGVuJztcbn07XG52YXIgaXNEZXRhaWxzV2l0aFN1bW1hcnkgPSBmdW5jdGlvbiBpc0RldGFpbHNXaXRoU3VtbWFyeShub2RlKSB7XG4gIHZhciByID0gbm9kZS50YWdOYW1lID09PSAnREVUQUlMUycgJiYgQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KG5vZGUuY2hpbGRyZW4pLnNvbWUoZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgcmV0dXJuIGNoaWxkLnRhZ05hbWUgPT09ICdTVU1NQVJZJztcbiAgfSk7XG4gIHJldHVybiByO1xufTtcbnZhciBnZXRDaGVja2VkUmFkaW8gPSBmdW5jdGlvbiBnZXRDaGVja2VkUmFkaW8obm9kZXMsIGZvcm0pIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChub2Rlc1tpXS5jaGVja2VkICYmIG5vZGVzW2ldLmZvcm0gPT09IGZvcm0pIHtcbiAgICAgIHJldHVybiBub2Rlc1tpXTtcbiAgICB9XG4gIH1cbn07XG52YXIgaXNUYWJiYWJsZVJhZGlvID0gZnVuY3Rpb24gaXNUYWJiYWJsZVJhZGlvKG5vZGUpIHtcbiAgaWYgKCFub2RlLm5hbWUpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB2YXIgcmFkaW9TY29wZSA9IG5vZGUuZm9ybSB8fCBnZXRSb290Tm9kZShub2RlKTtcbiAgdmFyIHF1ZXJ5UmFkaW9zID0gZnVuY3Rpb24gcXVlcnlSYWRpb3MobmFtZSkge1xuICAgIHJldHVybiByYWRpb1Njb3BlLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9XCJyYWRpb1wiXVtuYW1lPVwiJyArIG5hbWUgKyAnXCJdJyk7XG4gIH07XG4gIHZhciByYWRpb1NldDtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB3aW5kb3cuQ1NTICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygd2luZG93LkNTUy5lc2NhcGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICByYWRpb1NldCA9IHF1ZXJ5UmFkaW9zKHdpbmRvdy5DU1MuZXNjYXBlKG5vZGUubmFtZSkpO1xuICB9IGVsc2Uge1xuICAgIHRyeSB7XG4gICAgICByYWRpb1NldCA9IHF1ZXJ5UmFkaW9zKG5vZGUubmFtZSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgY29uc29sZS5lcnJvcignTG9va3MgbGlrZSB5b3UgaGF2ZSBhIHJhZGlvIGJ1dHRvbiB3aXRoIGEgbmFtZSBhdHRyaWJ1dGUgY29udGFpbmluZyBpbnZhbGlkIENTUyBzZWxlY3RvciBjaGFyYWN0ZXJzIGFuZCBuZWVkIHRoZSBDU1MuZXNjYXBlIHBvbHlmaWxsOiAlcycsIGVyci5tZXNzYWdlKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgdmFyIGNoZWNrZWQgPSBnZXRDaGVja2VkUmFkaW8ocmFkaW9TZXQsIG5vZGUuZm9ybSk7XG4gIHJldHVybiAhY2hlY2tlZCB8fCBjaGVja2VkID09PSBub2RlO1xufTtcbnZhciBpc1JhZGlvID0gZnVuY3Rpb24gaXNSYWRpbyhub2RlKSB7XG4gIHJldHVybiBpc0lucHV0KG5vZGUpICYmIG5vZGUudHlwZSA9PT0gJ3JhZGlvJztcbn07XG52YXIgaXNOb25UYWJiYWJsZVJhZGlvID0gZnVuY3Rpb24gaXNOb25UYWJiYWJsZVJhZGlvKG5vZGUpIHtcbiAgcmV0dXJuIGlzUmFkaW8obm9kZSkgJiYgIWlzVGFiYmFibGVSYWRpbyhub2RlKTtcbn07XG5cbi8vIGRldGVybWluZXMgaWYgYSBub2RlIGlzIHVsdGltYXRlbHkgYXR0YWNoZWQgdG8gdGhlIHdpbmRvdydzIGRvY3VtZW50XG52YXIgaXNOb2RlQXR0YWNoZWQgPSBmdW5jdGlvbiBpc05vZGVBdHRhY2hlZChub2RlKSB7XG4gIHZhciBfbm9kZVJvb3Q7XG4gIC8vIFRoZSByb290IG5vZGUgaXMgdGhlIHNoYWRvdyByb290IGlmIHRoZSBub2RlIGlzIGluIGEgc2hhZG93IERPTTsgc29tZSBkb2N1bWVudCBvdGhlcndpc2VcbiAgLy8gIChidXQgTk9UIF90aGVfIGRvY3VtZW50OyBzZWUgc2Vjb25kICdJZicgY29tbWVudCBiZWxvdyBmb3IgbW9yZSkuXG4gIC8vIElmIHJvb3ROb2RlIGlzIHNoYWRvdyByb290LCBpdCdsbCBoYXZlIGEgaG9zdCwgd2hpY2ggaXMgdGhlIGVsZW1lbnQgdG8gd2hpY2ggdGhlIHNoYWRvd1xuICAvLyAgaXMgYXR0YWNoZWQsIGFuZCB0aGUgb25lIHdlIG5lZWQgdG8gY2hlY2sgaWYgaXQncyBpbiB0aGUgZG9jdW1lbnQgb3Igbm90IChiZWNhdXNlIHRoZVxuICAvLyAgc2hhZG93LCBhbmQgYWxsIG5vZGVzIGl0IGNvbnRhaW5zLCBpcyBuZXZlciBjb25zaWRlcmVkIGluIHRoZSBkb2N1bWVudCBzaW5jZSBzaGFkb3dzXG4gIC8vICBiZWhhdmUgbGlrZSBzZWxmLWNvbnRhaW5lZCBET01zOyBidXQgaWYgdGhlIHNoYWRvdydzIEhPU1QsIHdoaWNoIGlzIHBhcnQgb2YgdGhlIGRvY3VtZW50LFxuICAvLyAgaXMgaGlkZGVuLCBvciBpcyBub3QgaW4gdGhlIGRvY3VtZW50IGl0c2VsZiBidXQgaXMgZGV0YWNoZWQsIGl0IHdpbGwgYWZmZWN0IHRoZSBzaGFkb3cnc1xuICAvLyAgdmlzaWJpbGl0eSwgaW5jbHVkaW5nIGFsbCB0aGUgbm9kZXMgaXQgY29udGFpbnMpLiBUaGUgaG9zdCBjb3VsZCBiZSBhbnkgbm9ybWFsIG5vZGUsXG4gIC8vICBvciBhIGN1c3RvbSBlbGVtZW50IChpLmUuIHdlYiBjb21wb25lbnQpLiBFaXRoZXIgd2F5LCB0aGF0J3MgdGhlIG9uZSB0aGF0IGlzIGNvbnNpZGVyZWRcbiAgLy8gIHBhcnQgb2YgdGhlIGRvY3VtZW50LCBub3QgdGhlIHNoYWRvdyByb290LCBub3IgYW55IG9mIGl0cyBjaGlsZHJlbiAoaS5lLiB0aGUgbm9kZSBiZWluZ1xuICAvLyAgdGVzdGVkKS5cbiAgLy8gVG8gZnVydGhlciBjb21wbGljYXRlIHRoaW5ncywgd2UgaGF2ZSB0byBsb29rIGFsbCB0aGUgd2F5IHVwIHVudGlsIHdlIGZpbmQgYSBzaGFkb3cgSE9TVFxuICAvLyAgdGhhdCBpcyBhdHRhY2hlZCAob3IgZmluZCBub25lKSBiZWNhdXNlIHRoZSBub2RlIG1pZ2h0IGJlIGluIG5lc3RlZCBzaGFkb3dzLi4uXG4gIC8vIElmIHJvb3ROb2RlIGlzIG5vdCBhIHNoYWRvdyByb290LCBpdCB3b24ndCBoYXZlIGEgaG9zdCwgYW5kIHNvIHJvb3ROb2RlIHNob3VsZCBiZSB0aGVcbiAgLy8gIGRvY3VtZW50IChwZXIgdGhlIGRvY3MpIGFuZCB3aGlsZSBpdCdzIGEgRG9jdW1lbnQtdHlwZSBvYmplY3QsIHRoYXQgZG9jdW1lbnQgZG9lcyBub3RcbiAgLy8gIGFwcGVhciB0byBiZSB0aGUgc2FtZSBhcyB0aGUgbm9kZSdzIGBvd25lckRvY3VtZW50YCBmb3Igc29tZSByZWFzb24sIHNvIGl0J3Mgc2FmZXJcbiAgLy8gIHRvIGlnbm9yZSB0aGUgcm9vdE5vZGUgYXQgdGhpcyBwb2ludCwgYW5kIHVzZSBgbm9kZS5vd25lckRvY3VtZW50YC4gT3RoZXJ3aXNlLFxuICAvLyAgdXNpbmcgYHJvb3ROb2RlLmNvbnRhaW5zKG5vZGUpYCB3aWxsIF9hbHdheXNfIGJlIHRydWUgd2UnbGwgZ2V0IGZhbHNlLXBvc2l0aXZlcyB3aGVuXG4gIC8vICBub2RlIGlzIGFjdHVhbGx5IGRldGFjaGVkLlxuICAvLyBOT1RFOiBJZiBgbm9kZVJvb3RIb3N0YCBvciBgbm9kZWAgaGFwcGVucyB0byBiZSB0aGUgYGRvY3VtZW50YCBpdHNlbGYgKHdoaWNoIGlzIHBvc3NpYmxlXG4gIC8vICBpZiBhIHRhYmJhYmxlL2ZvY3VzYWJsZSBub2RlIHdhcyBxdWlja2x5IGFkZGVkIHRvIHRoZSBET00sIGZvY3VzZWQsIGFuZCB0aGVuIHJlbW92ZWRcbiAgLy8gIGZyb20gdGhlIERPTSBhcyBpbiBodHRwczovL2dpdGh1Yi5jb20vZm9jdXMtdHJhcC9mb2N1cy10cmFwLXJlYWN0L2lzc3Vlcy85MDUpLCB0aGVuXG4gIC8vICBgb3duZXJEb2N1bWVudGAgd2lsbCBiZSBgbnVsbGAsIGhlbmNlIHRoZSBvcHRpb25hbCBjaGFpbmluZyBvbiBpdC5cbiAgdmFyIG5vZGVSb290ID0gbm9kZSAmJiBnZXRSb290Tm9kZShub2RlKTtcbiAgdmFyIG5vZGVSb290SG9zdCA9IChfbm9kZVJvb3QgPSBub2RlUm9vdCkgPT09IG51bGwgfHwgX25vZGVSb290ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfbm9kZVJvb3QuaG9zdDtcblxuICAvLyBpbiBzb21lIGNhc2VzLCBhIGRldGFjaGVkIG5vZGUgd2lsbCByZXR1cm4gaXRzZWxmIGFzIHRoZSByb290IGluc3RlYWQgb2YgYSBkb2N1bWVudCBvclxuICAvLyAgc2hhZG93IHJvb3Qgb2JqZWN0LCBpbiB3aGljaCBjYXNlLCB3ZSBzaG91bGRuJ3QgdHJ5IHRvIGxvb2sgZnVydGhlciB1cCB0aGUgaG9zdCBjaGFpblxuICB2YXIgYXR0YWNoZWQgPSBmYWxzZTtcbiAgaWYgKG5vZGVSb290ICYmIG5vZGVSb290ICE9PSBub2RlKSB7XG4gICAgdmFyIF9ub2RlUm9vdEhvc3QsIF9ub2RlUm9vdEhvc3Qkb3duZXJEbywgX25vZGUkb3duZXJEb2N1bWVudDtcbiAgICBhdHRhY2hlZCA9ICEhKChfbm9kZVJvb3RIb3N0ID0gbm9kZVJvb3RIb3N0KSAhPT0gbnVsbCAmJiBfbm9kZVJvb3RIb3N0ICE9PSB2b2lkIDAgJiYgKF9ub2RlUm9vdEhvc3Qkb3duZXJEbyA9IF9ub2RlUm9vdEhvc3Qub3duZXJEb2N1bWVudCkgIT09IG51bGwgJiYgX25vZGVSb290SG9zdCRvd25lckRvICE9PSB2b2lkIDAgJiYgX25vZGVSb290SG9zdCRvd25lckRvLmNvbnRhaW5zKG5vZGVSb290SG9zdCkgfHwgbm9kZSAhPT0gbnVsbCAmJiBub2RlICE9PSB2b2lkIDAgJiYgKF9ub2RlJG93bmVyRG9jdW1lbnQgPSBub2RlLm93bmVyRG9jdW1lbnQpICE9PSBudWxsICYmIF9ub2RlJG93bmVyRG9jdW1lbnQgIT09IHZvaWQgMCAmJiBfbm9kZSRvd25lckRvY3VtZW50LmNvbnRhaW5zKG5vZGUpKTtcbiAgICB3aGlsZSAoIWF0dGFjaGVkICYmIG5vZGVSb290SG9zdCkge1xuICAgICAgdmFyIF9ub2RlUm9vdDIsIF9ub2RlUm9vdEhvc3QyLCBfbm9kZVJvb3RIb3N0MiRvd25lckQ7XG4gICAgICAvLyBzaW5jZSBpdCdzIG5vdCBhdHRhY2hlZCBhbmQgd2UgaGF2ZSBhIHJvb3QgaG9zdCwgdGhlIG5vZGUgTVVTVCBiZSBpbiBhIG5lc3RlZCBzaGFkb3cgRE9NLFxuICAgICAgLy8gIHdoaWNoIG1lYW5zIHdlIG5lZWQgdG8gZ2V0IHRoZSBob3N0J3MgaG9zdCBhbmQgY2hlY2sgaWYgdGhhdCBwYXJlbnQgaG9zdCBpcyBjb250YWluZWRcbiAgICAgIC8vICBpbiAoaS5lLiBhdHRhY2hlZCB0bykgdGhlIGRvY3VtZW50XG4gICAgICBub2RlUm9vdCA9IGdldFJvb3ROb2RlKG5vZGVSb290SG9zdCk7XG4gICAgICBub2RlUm9vdEhvc3QgPSAoX25vZGVSb290MiA9IG5vZGVSb290KSA9PT0gbnVsbCB8fCBfbm9kZVJvb3QyID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfbm9kZVJvb3QyLmhvc3Q7XG4gICAgICBhdHRhY2hlZCA9ICEhKChfbm9kZVJvb3RIb3N0MiA9IG5vZGVSb290SG9zdCkgIT09IG51bGwgJiYgX25vZGVSb290SG9zdDIgIT09IHZvaWQgMCAmJiAoX25vZGVSb290SG9zdDIkb3duZXJEID0gX25vZGVSb290SG9zdDIub3duZXJEb2N1bWVudCkgIT09IG51bGwgJiYgX25vZGVSb290SG9zdDIkb3duZXJEICE9PSB2b2lkIDAgJiYgX25vZGVSb290SG9zdDIkb3duZXJELmNvbnRhaW5zKG5vZGVSb290SG9zdCkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXR0YWNoZWQ7XG59O1xudmFyIGlzWmVyb0FyZWEgPSBmdW5jdGlvbiBpc1plcm9BcmVhKG5vZGUpIHtcbiAgdmFyIF9ub2RlJGdldEJvdW5kaW5nQ2xpZSA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgd2lkdGggPSBfbm9kZSRnZXRCb3VuZGluZ0NsaWUud2lkdGgsXG4gICAgaGVpZ2h0ID0gX25vZGUkZ2V0Qm91bmRpbmdDbGllLmhlaWdodDtcbiAgcmV0dXJuIHdpZHRoID09PSAwICYmIGhlaWdodCA9PT0gMDtcbn07XG52YXIgaXNIaWRkZW4gPSBmdW5jdGlvbiBpc0hpZGRlbihub2RlLCBfcmVmKSB7XG4gIHZhciBkaXNwbGF5Q2hlY2sgPSBfcmVmLmRpc3BsYXlDaGVjayxcbiAgICBnZXRTaGFkb3dSb290ID0gX3JlZi5nZXRTaGFkb3dSb290O1xuICBpZiAoZGlzcGxheUNoZWNrID09PSAnZnVsbC1uYXRpdmUnKSB7XG4gICAgaWYgKCdjaGVja1Zpc2liaWxpdHknIGluIG5vZGUpIHtcbiAgICAgIC8vIENocm9tZSA+PSAxMDUsIEVkZ2UgPj0gMTA1LCBGaXJlZm94ID49IDEwNiwgU2FmYXJpID49IDE3LjRcbiAgICAgIC8vIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0VsZW1lbnQvY2hlY2tWaXNpYmlsaXR5I2Jyb3dzZXJfY29tcGF0aWJpbGl0eVxuICAgICAgdmFyIHZpc2libGUgPSBub2RlLmNoZWNrVmlzaWJpbGl0eSh7XG4gICAgICAgIC8vIENoZWNraW5nIG9wYWNpdHkgbWlnaHQgYmUgZGVzaXJhYmxlIGZvciBzb21lIHVzZSBjYXNlcywgYnV0IG5hdGl2ZWx5LFxuICAgICAgICAvLyBvcGFjaXR5IHplcm8gZWxlbWVudHMgX2FyZV8gZm9jdXNhYmxlIGFuZCB0YWJiYWJsZS5cbiAgICAgICAgY2hlY2tPcGFjaXR5OiBmYWxzZSxcbiAgICAgICAgb3BhY2l0eVByb3BlcnR5OiBmYWxzZSxcbiAgICAgICAgY29udGVudFZpc2liaWxpdHlBdXRvOiB0cnVlLFxuICAgICAgICB2aXNpYmlsaXR5UHJvcGVydHk6IHRydWUsXG4gICAgICAgIC8vIFRoaXMgaXMgYW4gYWxpYXMgZm9yIGB2aXNpYmlsaXR5UHJvcGVydHlgLiBDb250ZW1wb3JhcnkgYnJvd3NlcnNcbiAgICAgICAgLy8gc3VwcG9ydCBib3RoLiBIb3dldmVyLCB0aGlzIGFsaWFzIGhhcyB3aWRlciBicm93c2VyIHN1cHBvcnQgKENocm9tZVxuICAgICAgICAvLyA+PSAxMDUgYW5kIEZpcmVmb3ggPj0gMTA2LCB2cy4gQ2hyb21lID49IDEyMSBhbmQgRmlyZWZveCA+PSAxMjIpLCBzb1xuICAgICAgICAvLyB3ZSBpbmNsdWRlIGl0IGFueXdheS5cbiAgICAgICAgY2hlY2tWaXNpYmlsaXR5Q1NTOiB0cnVlXG4gICAgICB9KTtcbiAgICAgIHJldHVybiAhdmlzaWJsZTtcbiAgICB9XG4gICAgLy8gRmFsbCB0aHJvdWdoIHRvIG1hbnVhbCB2aXNpYmlsaXR5IGNoZWNrc1xuICB9XG5cbiAgLy8gTk9URTogdmlzaWJpbGl0eSB3aWxsIGJlIGB1bmRlZmluZWRgIGlmIG5vZGUgaXMgZGV0YWNoZWQgZnJvbSB0aGUgZG9jdW1lbnRcbiAgLy8gIChzZWUgbm90ZXMgYWJvdXQgdGhpcyBmdXJ0aGVyIGRvd24pLCB3aGljaCBtZWFucyB3ZSB3aWxsIGNvbnNpZGVyIGl0IHZpc2libGVcbiAgLy8gICh0aGlzIGlzIGxlZ2FjeSBiZWhhdmlvciBmcm9tIGEgdmVyeSBsb25nIHdheSBiYWNrKVxuICAvLyBOT1RFOiB3ZSBjaGVjayB0aGlzIHJlZ2FyZGxlc3Mgb2YgYGRpc3BsYXlDaGVjaz1cIm5vbmVcImAgYmVjYXVzZSB0aGlzIGlzIGFcbiAgLy8gIF92aXNpYmlsaXR5XyBjaGVjaywgbm90IGEgX2Rpc3BsYXlfIGNoZWNrXG4gIGlmIChnZXRDb21wdXRlZFN0eWxlKG5vZGUpLnZpc2liaWxpdHkgPT09ICdoaWRkZW4nKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdmFyIGlzRGlyZWN0U3VtbWFyeSA9IG1hdGNoZXMuY2FsbChub2RlLCAnZGV0YWlscz5zdW1tYXJ5OmZpcnN0LW9mLXR5cGUnKTtcbiAgdmFyIG5vZGVVbmRlckRldGFpbHMgPSBpc0RpcmVjdFN1bW1hcnkgPyBub2RlLnBhcmVudEVsZW1lbnQgOiBub2RlO1xuICBpZiAobWF0Y2hlcy5jYWxsKG5vZGVVbmRlckRldGFpbHMsICdkZXRhaWxzOm5vdChbb3Blbl0pIConKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmICghZGlzcGxheUNoZWNrIHx8IGRpc3BsYXlDaGVjayA9PT0gJ2Z1bGwnIHx8XG4gIC8vIGZ1bGwtbmF0aXZlIGNhbiBydW4gdGhpcyBicmFuY2ggd2hlbiBpdCBmYWxscyB0aHJvdWdoIGluIGNhc2VcbiAgLy8gRWxlbWVudCNjaGVja1Zpc2liaWxpdHkgaXMgdW5zdXBwb3J0ZWRcbiAgZGlzcGxheUNoZWNrID09PSAnZnVsbC1uYXRpdmUnIHx8IGRpc3BsYXlDaGVjayA9PT0gJ2xlZ2FjeS1mdWxsJykge1xuICAgIGlmICh0eXBlb2YgZ2V0U2hhZG93Um9vdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gZmlndXJlIG91dCBpZiB3ZSBzaG91bGQgY29uc2lkZXIgdGhlIG5vZGUgdG8gYmUgaW4gYW4gdW5kaXNjbG9zZWQgc2hhZG93IGFuZCB1c2UgdGhlXG4gICAgICAvLyAgJ25vbi16ZXJvLWFyZWEnIGZhbGxiYWNrXG4gICAgICB2YXIgb3JpZ2luYWxOb2RlID0gbm9kZTtcbiAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIHZhciBwYXJlbnRFbGVtZW50ID0gbm9kZS5wYXJlbnRFbGVtZW50O1xuICAgICAgICB2YXIgcm9vdE5vZGUgPSBnZXRSb290Tm9kZShub2RlKTtcbiAgICAgICAgaWYgKHBhcmVudEVsZW1lbnQgJiYgIXBhcmVudEVsZW1lbnQuc2hhZG93Um9vdCAmJiBnZXRTaGFkb3dSb290KHBhcmVudEVsZW1lbnQpID09PSB0cnVlIC8vIGNoZWNrIGlmIHRoZXJlJ3MgYW4gdW5kaXNjbG9zZWQgc2hhZG93XG4gICAgICAgICkge1xuICAgICAgICAgIC8vIG5vZGUgaGFzIGFuIHVuZGlzY2xvc2VkIHNoYWRvdyB3aGljaCBtZWFucyB3ZSBjYW4gb25seSB0cmVhdCBpdCBhcyBhIGJsYWNrIGJveCwgc28gd2VcbiAgICAgICAgICAvLyAgZmFsbCBiYWNrIHRvIGEgbm9uLXplcm8tYXJlYSB0ZXN0XG4gICAgICAgICAgcmV0dXJuIGlzWmVyb0FyZWEobm9kZSk7XG4gICAgICAgIH0gZWxzZSBpZiAobm9kZS5hc3NpZ25lZFNsb3QpIHtcbiAgICAgICAgICAvLyBpdGVyYXRlIHVwIHNsb3RcbiAgICAgICAgICBub2RlID0gbm9kZS5hc3NpZ25lZFNsb3Q7XG4gICAgICAgIH0gZWxzZSBpZiAoIXBhcmVudEVsZW1lbnQgJiYgcm9vdE5vZGUgIT09IG5vZGUub3duZXJEb2N1bWVudCkge1xuICAgICAgICAgIC8vIGNyb3NzIHNoYWRvdyBib3VuZGFyeVxuICAgICAgICAgIG5vZGUgPSByb290Tm9kZS5ob3N0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGl0ZXJhdGUgdXAgbm9ybWFsIGRvbVxuICAgICAgICAgIG5vZGUgPSBwYXJlbnRFbGVtZW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBub2RlID0gb3JpZ2luYWxOb2RlO1xuICAgIH1cbiAgICAvLyBlbHNlLCBgZ2V0U2hhZG93Um9vdGAgbWlnaHQgYmUgdHJ1ZSwgYnV0IGFsbCB0aGF0IGRvZXMgaXMgZW5hYmxlIHNoYWRvdyBET00gc3VwcG9ydFxuICAgIC8vICAoaS5lLiBpdCBkb2VzIG5vdCBhbHNvIHByZXN1bWUgdGhhdCBhbGwgbm9kZXMgbWlnaHQgaGF2ZSB1bmRpc2Nsb3NlZCBzaGFkb3dzKTsgb3JcbiAgICAvLyAgaXQgbWlnaHQgYmUgYSBmYWxzeSB2YWx1ZSwgd2hpY2ggbWVhbnMgc2hhZG93IERPTSBzdXBwb3J0IGlzIGRpc2FibGVkXG5cbiAgICAvLyBTaW5jZSB3ZSBkaWRuJ3QgZmluZCBpdCBzaXR0aW5nIGluIGFuIHVuZGlzY2xvc2VkIHNoYWRvdyAob3Igc2hhZG93cyBhcmUgZGlzYWJsZWQpXG4gICAgLy8gIG5vdyB3ZSBjYW4ganVzdCB0ZXN0IHRvIHNlZSBpZiBpdCB3b3VsZCBub3JtYWxseSBiZSB2aXNpYmxlIG9yIG5vdCwgcHJvdmlkZWQgaXQnc1xuICAgIC8vICBhdHRhY2hlZCB0byB0aGUgbWFpbiBkb2N1bWVudC5cbiAgICAvLyBOT1RFOiBXZSBtdXN0IGNvbnNpZGVyIGNhc2Ugd2hlcmUgbm9kZSBpcyBpbnNpZGUgYSBzaGFkb3cgRE9NIGFuZCBnaXZlbiBkaXJlY3RseSB0b1xuICAgIC8vICBgaXNUYWJiYWJsZSgpYCBvciBgaXNGb2N1c2FibGUoKWAgLS0gcmVnYXJkbGVzcyBvZiBgZ2V0U2hhZG93Um9vdGAgb3B0aW9uIHNldHRpbmcuXG5cbiAgICBpZiAoaXNOb2RlQXR0YWNoZWQobm9kZSkpIHtcbiAgICAgIC8vIHRoaXMgd29ya3Mgd2hlcmV2ZXIgdGhlIG5vZGUgaXM6IGlmIHRoZXJlJ3MgYXQgbGVhc3Qgb25lIGNsaWVudCByZWN0LCBpdCdzXG4gICAgICAvLyAgc29tZWhvdyBkaXNwbGF5ZWQ7IGl0IGFsc28gY292ZXJzIHRoZSBDU1MgJ2Rpc3BsYXk6IGNvbnRlbnRzJyBjYXNlIHdoZXJlIHRoZVxuICAgICAgLy8gIG5vZGUgaXRzZWxmIGlzIGhpZGRlbiBpbiBwbGFjZSBvZiBpdHMgY29udGVudHM7IGFuZCB0aGVyZSdzIG5vIG5lZWQgdG8gc2VhcmNoXG4gICAgICAvLyAgdXAgdGhlIGhpZXJhcmNoeSBlaXRoZXJcbiAgICAgIHJldHVybiAhbm9kZS5nZXRDbGllbnRSZWN0cygpLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvLyBFbHNlLCB0aGUgbm9kZSBpc24ndCBhdHRhY2hlZCB0byB0aGUgZG9jdW1lbnQsIHdoaWNoIG1lYW5zIHRoZSBgZ2V0Q2xpZW50UmVjdHMoKWBcbiAgICAvLyAgQVBJIHdpbGwgX19hbHdheXNfXyByZXR1cm4gemVybyByZWN0cyAodGhpcyBjYW4gaGFwcGVuLCBmb3IgZXhhbXBsZSwgaWYgUmVhY3RcbiAgICAvLyAgaXMgdXNlZCB0byByZW5kZXIgbm9kZXMgb250byBhIGRldGFjaGVkIHRyZWUsIGFzIGNvbmZpcm1lZCBpbiB0aGlzIHRocmVhZDpcbiAgICAvLyAgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0L2lzc3Vlcy85MTE3I2lzc3VlY29tbWVudC0yODQyMjg4NzApXG4gICAgLy9cbiAgICAvLyBJdCBhbHNvIG1lYW5zIHRoYXQgZXZlbiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShub2RlKS5kaXNwbGF5IHdpbGwgcmV0dXJuIGB1bmRlZmluZWRgXG4gICAgLy8gIGJlY2F1c2Ugc3R5bGVzIGFyZSBvbmx5IGNvbXB1dGVkIGZvciBub2RlcyB0aGF0IGFyZSBpbiB0aGUgZG9jdW1lbnQuXG4gICAgLy9cbiAgICAvLyBOT1RFOiBUSElTIEhBUyBCRUVOIFRIRSBDQVNFIEZPUiBZRUFSUy4gSXQgaXMgbm90IG5ldywgbm9yIGlzIGl0IGNhdXNlZCBieSB0YWJiYWJsZVxuICAgIC8vICBzb21laG93LiBUaG91Z2ggaXQgd2FzIG5ldmVyIHN0YXRlZCBvZmZpY2lhbGx5LCBhbnlvbmUgd2hvIGhhcyBldmVyIHVzZWQgdGFiYmFibGVcbiAgICAvLyAgQVBJcyBvbiBub2RlcyBpbiBkZXRhY2hlZCBjb250YWluZXJzIGhhcyBhY3R1YWxseSBpbXBsaWNpdGx5IHVzZWQgdGFiYmFibGUgaW4gd2hhdFxuICAgIC8vICB3YXMgbGF0ZXIgKGFzIG9mIHY1LjIuMCBvbiBBcHIgOSwgMjAyMSkgY2FsbGVkIGBkaXNwbGF5Q2hlY2s9XCJub25lXCJgIG1vZGUgLS0gZXNzZW50aWFsbHlcbiAgICAvLyAgY29uc2lkZXJpbmcgX19ldmVyeXRoaW5nX18gdG8gYmUgdmlzaWJsZSBiZWNhdXNlIG9mIHRoZSBpbm5hYmlsaXR5IHRvIGRldGVybWluZSBzdHlsZXMuXG4gICAgLy9cbiAgICAvLyB2Ni4wLjA6IEFzIG9mIHRoaXMgbWFqb3IgcmVsZWFzZSwgdGhlIGRlZmF1bHQgJ2Z1bGwnIG9wdGlvbiBfX25vIGxvbmdlciB0cmVhdHMgZGV0YWNoZWRcbiAgICAvLyAgbm9kZXMgYXMgdmlzaWJsZSB3aXRoIHRoZSAnbm9uZScgZmFsbGJhY2suX19cbiAgICBpZiAoZGlzcGxheUNoZWNrICE9PSAnbGVnYWN5LWZ1bGwnKSB7XG4gICAgICByZXR1cm4gdHJ1ZTsgLy8gaGlkZGVuXG4gICAgfVxuICAgIC8vIGVsc2UsIGZhbGxiYWNrIHRvICdub25lJyBtb2RlIGFuZCBjb25zaWRlciB0aGUgbm9kZSB2aXNpYmxlXG4gIH0gZWxzZSBpZiAoZGlzcGxheUNoZWNrID09PSAnbm9uLXplcm8tYXJlYScpIHtcbiAgICAvLyBOT1RFOiBFdmVuIHRob3VnaCB0aGlzIHRlc3RzIHRoYXQgdGhlIG5vZGUncyBjbGllbnQgcmVjdCBpcyBub24temVybyB0byBkZXRlcm1pbmVcbiAgICAvLyAgd2hldGhlciBpdCdzIGRpc3BsYXllZCwgYW5kIHRoYXQgYSBkZXRhY2hlZCBub2RlIHdpbGwgX19hbHdheXNfXyBoYXZlIGEgemVyby1hcmVhXG4gICAgLy8gIGNsaWVudCByZWN0LCB3ZSBkb24ndCBzcGVjaWFsLWNhc2UgZm9yIHdoZXRoZXIgdGhlIG5vZGUgaXMgYXR0YWNoZWQgb3Igbm90LiBJblxuICAgIC8vICB0aGlzIG1vZGUsIHdlIGRvIHdhbnQgdG8gY29uc2lkZXIgbm9kZXMgdGhhdCBoYXZlIGEgemVybyBhcmVhIHRvIGJlIGhpZGRlbiBhdCBhbGxcbiAgICAvLyAgdGltZXMsIGFuZCB0aGF0IGluY2x1ZGVzIGF0dGFjaGVkIG9yIG5vdC5cbiAgICByZXR1cm4gaXNaZXJvQXJlYShub2RlKTtcbiAgfVxuXG4gIC8vIHZpc2libGUsIGFzIGZhciBhcyB3ZSBjYW4gdGVsbCwgb3IgcGVyIGN1cnJlbnQgYGRpc3BsYXlDaGVjaz1ub25lYCBtb2RlLCB3ZSBhc3N1bWVcbiAgLy8gIGl0J3MgdmlzaWJsZVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vLyBmb3JtIGZpZWxkcyAobmVzdGVkKSBpbnNpZGUgYSBkaXNhYmxlZCBmaWVsZHNldCBhcmUgbm90IGZvY3VzYWJsZS90YWJiYWJsZVxuLy8gIHVubGVzcyB0aGV5IGFyZSBpbiB0aGUgX2ZpcnN0XyA8bGVnZW5kPiBlbGVtZW50IG9mIHRoZSB0b3AtbW9zdCBkaXNhYmxlZFxuLy8gIGZpZWxkc2V0XG52YXIgaXNEaXNhYmxlZEZyb21GaWVsZHNldCA9IGZ1bmN0aW9uIGlzRGlzYWJsZWRGcm9tRmllbGRzZXQobm9kZSkge1xuICBpZiAoL14oSU5QVVR8QlVUVE9OfFNFTEVDVHxURVhUQVJFQSkkLy50ZXN0KG5vZGUudGFnTmFtZSkpIHtcbiAgICB2YXIgcGFyZW50Tm9kZSA9IG5vZGUucGFyZW50RWxlbWVudDtcbiAgICAvLyBjaGVjayBpZiBgbm9kZWAgaXMgY29udGFpbmVkIGluIGEgZGlzYWJsZWQgPGZpZWxkc2V0PlxuICAgIHdoaWxlIChwYXJlbnROb2RlKSB7XG4gICAgICBpZiAocGFyZW50Tm9kZS50YWdOYW1lID09PSAnRklFTERTRVQnICYmIHBhcmVudE5vZGUuZGlzYWJsZWQpIHtcbiAgICAgICAgLy8gbG9vayBmb3IgdGhlIGZpcnN0IDxsZWdlbmQ+IGFtb25nIHRoZSBjaGlsZHJlbiBvZiB0aGUgZGlzYWJsZWQgPGZpZWxkc2V0PlxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmVudE5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgY2hpbGQgPSBwYXJlbnROb2RlLmNoaWxkcmVuLml0ZW0oaSk7XG4gICAgICAgICAgLy8gd2hlbiB0aGUgZmlyc3QgPGxlZ2VuZD4gKGluIGRvY3VtZW50IG9yZGVyKSBpcyBmb3VuZFxuICAgICAgICAgIGlmIChjaGlsZC50YWdOYW1lID09PSAnTEVHRU5EJykge1xuICAgICAgICAgICAgLy8gaWYgaXRzIHBhcmVudCA8ZmllbGRzZXQ+IGlzIG5vdCBuZXN0ZWQgaW4gYW5vdGhlciBkaXNhYmxlZCA8ZmllbGRzZXQ+LFxuICAgICAgICAgICAgLy8gcmV0dXJuIHdoZXRoZXIgYG5vZGVgIGlzIGEgZGVzY2VuZGFudCBvZiBpdHMgZmlyc3QgPGxlZ2VuZD5cbiAgICAgICAgICAgIHJldHVybiBtYXRjaGVzLmNhbGwocGFyZW50Tm9kZSwgJ2ZpZWxkc2V0W2Rpc2FibGVkXSAqJykgPyB0cnVlIDogIWNoaWxkLmNvbnRhaW5zKG5vZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyB0aGUgZGlzYWJsZWQgPGZpZWxkc2V0PiBjb250YWluaW5nIGBub2RlYCBoYXMgbm8gPGxlZ2VuZD5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBwYXJlbnROb2RlID0gcGFyZW50Tm9kZS5wYXJlbnRFbGVtZW50O1xuICAgIH1cbiAgfVxuXG4gIC8vIGVsc2UsIG5vZGUncyB0YWJiYWJsZS9mb2N1c2FibGUgc3RhdGUgc2hvdWxkIG5vdCBiZSBhZmZlY3RlZCBieSBhIGZpZWxkc2V0J3NcbiAgLy8gIGVuYWJsZWQvZGlzYWJsZWQgc3RhdGVcbiAgcmV0dXJuIGZhbHNlO1xufTtcbnZhciBpc05vZGVNYXRjaGluZ1NlbGVjdG9yRm9jdXNhYmxlID0gZnVuY3Rpb24gaXNOb2RlTWF0Y2hpbmdTZWxlY3RvckZvY3VzYWJsZShvcHRpb25zLCBub2RlKSB7XG4gIGlmIChub2RlLmRpc2FibGVkIHx8XG4gIC8vIHdlIG11c3QgZG8gYW4gaW5lcnQgbG9vayB1cCB0byBmaWx0ZXIgb3V0IGFueSBlbGVtZW50cyBpbnNpZGUgYW4gaW5lcnQgYW5jZXN0b3JcbiAgLy8gIGJlY2F1c2Ugd2UncmUgbGltaXRlZCBpbiB0aGUgdHlwZSBvZiBzZWxlY3RvcnMgd2UgY2FuIHVzZSBpbiBKU0RvbSAoc2VlIHJlbGF0ZWRcbiAgLy8gIG5vdGUgcmVsYXRlZCB0byBgY2FuZGlkYXRlU2VsZWN0b3JzYClcbiAgX2lzSW5lcnQobm9kZSkgfHwgaXNIaWRkZW5JbnB1dChub2RlKSB8fCBpc0hpZGRlbihub2RlLCBvcHRpb25zKSB8fFxuICAvLyBGb3IgYSBkZXRhaWxzIGVsZW1lbnQgd2l0aCBhIHN1bW1hcnksIHRoZSBzdW1tYXJ5IGVsZW1lbnQgZ2V0cyB0aGUgZm9jdXNcbiAgaXNEZXRhaWxzV2l0aFN1bW1hcnkobm9kZSkgfHwgaXNEaXNhYmxlZEZyb21GaWVsZHNldChub2RlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG52YXIgaXNOb2RlTWF0Y2hpbmdTZWxlY3RvclRhYmJhYmxlID0gZnVuY3Rpb24gaXNOb2RlTWF0Y2hpbmdTZWxlY3RvclRhYmJhYmxlKG9wdGlvbnMsIG5vZGUpIHtcbiAgaWYgKGlzTm9uVGFiYmFibGVSYWRpbyhub2RlKSB8fCBnZXRUYWJJbmRleChub2RlKSA8IDAgfHwgIWlzTm9kZU1hdGNoaW5nU2VsZWN0b3JGb2N1c2FibGUob3B0aW9ucywgbm9kZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xudmFyIGlzU2hhZG93Um9vdFRhYmJhYmxlID0gZnVuY3Rpb24gaXNTaGFkb3dSb290VGFiYmFibGUoc2hhZG93SG9zdE5vZGUpIHtcbiAgdmFyIHRhYkluZGV4ID0gcGFyc2VJbnQoc2hhZG93SG9zdE5vZGUuZ2V0QXR0cmlidXRlKCd0YWJpbmRleCcpLCAxMCk7XG4gIGlmIChpc05hTih0YWJJbmRleCkgfHwgdGFiSW5kZXggPj0gMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIC8vIElmIGEgY3VzdG9tIGVsZW1lbnQgaGFzIGFuIGV4cGxpY2l0IG5lZ2F0aXZlIHRhYmluZGV4LFxuICAvLyBicm93c2VycyB3aWxsIG5vdCBhbGxvdyB0YWIgdGFyZ2V0aW5nIHNhaWQgZWxlbWVudCdzIGNoaWxkcmVuLlxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7QXJyYXkuPEVsZW1lbnR8Q2FuZGlkYXRlU2NvcGU+fSBjYW5kaWRhdGVzXG4gKiBAcmV0dXJucyBFbGVtZW50W11cbiAqL1xudmFyIF9zb3J0QnlPcmRlciA9IGZ1bmN0aW9uIHNvcnRCeU9yZGVyKGNhbmRpZGF0ZXMpIHtcbiAgdmFyIHJlZ3VsYXJUYWJiYWJsZXMgPSBbXTtcbiAgdmFyIG9yZGVyZWRUYWJiYWJsZXMgPSBbXTtcbiAgY2FuZGlkYXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgdmFyIGlzU2NvcGUgPSAhIWl0ZW0uc2NvcGVQYXJlbnQ7XG4gICAgdmFyIGVsZW1lbnQgPSBpc1Njb3BlID8gaXRlbS5zY29wZVBhcmVudCA6IGl0ZW07XG4gICAgdmFyIGNhbmRpZGF0ZVRhYmluZGV4ID0gZ2V0U29ydE9yZGVyVGFiSW5kZXgoZWxlbWVudCwgaXNTY29wZSk7XG4gICAgdmFyIGVsZW1lbnRzID0gaXNTY29wZSA/IF9zb3J0QnlPcmRlcihpdGVtLmNhbmRpZGF0ZXMpIDogZWxlbWVudDtcbiAgICBpZiAoY2FuZGlkYXRlVGFiaW5kZXggPT09IDApIHtcbiAgICAgIGlzU2NvcGUgPyByZWd1bGFyVGFiYmFibGVzLnB1c2guYXBwbHkocmVndWxhclRhYmJhYmxlcywgZWxlbWVudHMpIDogcmVndWxhclRhYmJhYmxlcy5wdXNoKGVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcmRlcmVkVGFiYmFibGVzLnB1c2goe1xuICAgICAgICBkb2N1bWVudE9yZGVyOiBpLFxuICAgICAgICB0YWJJbmRleDogY2FuZGlkYXRlVGFiaW5kZXgsXG4gICAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICAgIGlzU2NvcGU6IGlzU2NvcGUsXG4gICAgICAgIGNvbnRlbnQ6IGVsZW1lbnRzXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3JkZXJlZFRhYmJhYmxlcy5zb3J0KHNvcnRPcmRlcmVkVGFiYmFibGVzKS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgc29ydGFibGUpIHtcbiAgICBzb3J0YWJsZS5pc1Njb3BlID8gYWNjLnB1c2guYXBwbHkoYWNjLCBzb3J0YWJsZS5jb250ZW50KSA6IGFjYy5wdXNoKHNvcnRhYmxlLmNvbnRlbnQpO1xuICAgIHJldHVybiBhY2M7XG4gIH0sIFtdKS5jb25jYXQocmVndWxhclRhYmJhYmxlcyk7XG59O1xudmFyIHRhYmJhYmxlID0gZnVuY3Rpb24gdGFiYmFibGUoY29udGFpbmVyLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgY2FuZGlkYXRlcztcbiAgaWYgKG9wdGlvbnMuZ2V0U2hhZG93Um9vdCkge1xuICAgIGNhbmRpZGF0ZXMgPSBfZ2V0Q2FuZGlkYXRlc0l0ZXJhdGl2ZWx5KFtjb250YWluZXJdLCBvcHRpb25zLmluY2x1ZGVDb250YWluZXIsIHtcbiAgICAgIGZpbHRlcjogaXNOb2RlTWF0Y2hpbmdTZWxlY3RvclRhYmJhYmxlLmJpbmQobnVsbCwgb3B0aW9ucyksXG4gICAgICBmbGF0dGVuOiBmYWxzZSxcbiAgICAgIGdldFNoYWRvd1Jvb3Q6IG9wdGlvbnMuZ2V0U2hhZG93Um9vdCxcbiAgICAgIHNoYWRvd1Jvb3RGaWx0ZXI6IGlzU2hhZG93Um9vdFRhYmJhYmxlXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgY2FuZGlkYXRlcyA9IGdldENhbmRpZGF0ZXMoY29udGFpbmVyLCBvcHRpb25zLmluY2x1ZGVDb250YWluZXIsIGlzTm9kZU1hdGNoaW5nU2VsZWN0b3JUYWJiYWJsZS5iaW5kKG51bGwsIG9wdGlvbnMpKTtcbiAgfVxuICByZXR1cm4gX3NvcnRCeU9yZGVyKGNhbmRpZGF0ZXMpO1xufTtcbnZhciBmb2N1c2FibGUgPSBmdW5jdGlvbiBmb2N1c2FibGUoY29udGFpbmVyLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgY2FuZGlkYXRlcztcbiAgaWYgKG9wdGlvbnMuZ2V0U2hhZG93Um9vdCkge1xuICAgIGNhbmRpZGF0ZXMgPSBfZ2V0Q2FuZGlkYXRlc0l0ZXJhdGl2ZWx5KFtjb250YWluZXJdLCBvcHRpb25zLmluY2x1ZGVDb250YWluZXIsIHtcbiAgICAgIGZpbHRlcjogaXNOb2RlTWF0Y2hpbmdTZWxlY3RvckZvY3VzYWJsZS5iaW5kKG51bGwsIG9wdGlvbnMpLFxuICAgICAgZmxhdHRlbjogdHJ1ZSxcbiAgICAgIGdldFNoYWRvd1Jvb3Q6IG9wdGlvbnMuZ2V0U2hhZG93Um9vdFxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGNhbmRpZGF0ZXMgPSBnZXRDYW5kaWRhdGVzKGNvbnRhaW5lciwgb3B0aW9ucy5pbmNsdWRlQ29udGFpbmVyLCBpc05vZGVNYXRjaGluZ1NlbGVjdG9yRm9jdXNhYmxlLmJpbmQobnVsbCwgb3B0aW9ucykpO1xuICB9XG4gIHJldHVybiBjYW5kaWRhdGVzO1xufTtcbnZhciBpc1RhYmJhYmxlID0gZnVuY3Rpb24gaXNUYWJiYWJsZShub2RlLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBpZiAoIW5vZGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIG5vZGUgcHJvdmlkZWQnKTtcbiAgfVxuICBpZiAobWF0Y2hlcy5jYWxsKG5vZGUsIGNhbmRpZGF0ZVNlbGVjdG9yKSA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGlzTm9kZU1hdGNoaW5nU2VsZWN0b3JUYWJiYWJsZShvcHRpb25zLCBub2RlKTtcbn07XG52YXIgZm9jdXNhYmxlQ2FuZGlkYXRlU2VsZWN0b3IgPSAvKiAjX19QVVJFX18gKi9jYW5kaWRhdGVTZWxlY3RvcnMuY29uY2F0KCdpZnJhbWUnKS5qb2luKCcsJyk7XG52YXIgaXNGb2N1c2FibGUgPSBmdW5jdGlvbiBpc0ZvY3VzYWJsZShub2RlLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBpZiAoIW5vZGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIG5vZGUgcHJvdmlkZWQnKTtcbiAgfVxuICBpZiAobWF0Y2hlcy5jYWxsKG5vZGUsIGZvY3VzYWJsZUNhbmRpZGF0ZVNlbGVjdG9yKSA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGlzTm9kZU1hdGNoaW5nU2VsZWN0b3JGb2N1c2FibGUob3B0aW9ucywgbm9kZSk7XG59O1xuXG5leHBvcnQgeyBmb2N1c2FibGUsIGdldFRhYkluZGV4LCBpc0ZvY3VzYWJsZSwgaXNUYWJiYWJsZSwgdGFiYmFibGUgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmVzbS5qcy5tYXBcbiIsImZ1bmN0aW9uIF9jaGVja19wcml2YXRlX3JlZGVjbGFyYXRpb24ob2JqLCBwcml2YXRlQ29sbGVjdGlvbikge1xuICAgIGlmIChwcml2YXRlQ29sbGVjdGlvbi5oYXMob2JqKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGluaXRpYWxpemUgdGhlIHNhbWUgcHJpdmF0ZSBlbGVtZW50cyB0d2ljZSBvbiBhbiBvYmplY3RcIik7XG4gICAgfVxufVxuZXhwb3J0IHsgX2NoZWNrX3ByaXZhdGVfcmVkZWNsYXJhdGlvbiBhcyBfIH07XG4iLCJpbXBvcnQgeyBfIGFzIF9jaGVja19wcml2YXRlX3JlZGVjbGFyYXRpb24gfSBmcm9tIFwiLi9fY2hlY2tfcHJpdmF0ZV9yZWRlY2xhcmF0aW9uLmpzXCI7XG5cbmZ1bmN0aW9uIF9jbGFzc19wcml2YXRlX2ZpZWxkX2luaXQob2JqLCBwcml2YXRlTWFwLCB2YWx1ZSkge1xuICAgIF9jaGVja19wcml2YXRlX3JlZGVjbGFyYXRpb24ob2JqLCBwcml2YXRlTWFwKTtcbiAgICBwcml2YXRlTWFwLnNldChvYmosIHZhbHVlKTtcbn1cbmV4cG9ydCB7IF9jbGFzc19wcml2YXRlX2ZpZWxkX2luaXQgYXMgXyB9O1xuIiwiY29uc3QgQ0xBU1NfUEFSVF9TRVBBUkFUT1IgPSAnLSc7XG5jb25zdCBjcmVhdGVDbGFzc0dyb3VwVXRpbHMgPSBjb25maWcgPT4ge1xuICBjb25zdCBjbGFzc01hcCA9IGNyZWF0ZUNsYXNzTWFwKGNvbmZpZyk7XG4gIGNvbnN0IHtcbiAgICBjb25mbGljdGluZ0NsYXNzR3JvdXBzLFxuICAgIGNvbmZsaWN0aW5nQ2xhc3NHcm91cE1vZGlmaWVyc1xuICB9ID0gY29uZmlnO1xuICBjb25zdCBnZXRDbGFzc0dyb3VwSWQgPSBjbGFzc05hbWUgPT4ge1xuICAgIGNvbnN0IGNsYXNzUGFydHMgPSBjbGFzc05hbWUuc3BsaXQoQ0xBU1NfUEFSVF9TRVBBUkFUT1IpO1xuICAgIC8vIENsYXNzZXMgbGlrZSBgLWluc2V0LTFgIHByb2R1Y2UgYW4gZW1wdHkgc3RyaW5nIGFzIGZpcnN0IGNsYXNzUGFydC4gV2UgYXNzdW1lIHRoYXQgY2xhc3NlcyBmb3IgbmVnYXRpdmUgdmFsdWVzIGFyZSB1c2VkIGNvcnJlY3RseSBhbmQgcmVtb3ZlIGl0IGZyb20gY2xhc3NQYXJ0cy5cbiAgICBpZiAoY2xhc3NQYXJ0c1swXSA9PT0gJycgJiYgY2xhc3NQYXJ0cy5sZW5ndGggIT09IDEpIHtcbiAgICAgIGNsYXNzUGFydHMuc2hpZnQoKTtcbiAgICB9XG4gICAgcmV0dXJuIGdldEdyb3VwUmVjdXJzaXZlKGNsYXNzUGFydHMsIGNsYXNzTWFwKSB8fCBnZXRHcm91cElkRm9yQXJiaXRyYXJ5UHJvcGVydHkoY2xhc3NOYW1lKTtcbiAgfTtcbiAgY29uc3QgZ2V0Q29uZmxpY3RpbmdDbGFzc0dyb3VwSWRzID0gKGNsYXNzR3JvdXBJZCwgaGFzUG9zdGZpeE1vZGlmaWVyKSA9PiB7XG4gICAgY29uc3QgY29uZmxpY3RzID0gY29uZmxpY3RpbmdDbGFzc0dyb3Vwc1tjbGFzc0dyb3VwSWRdIHx8IFtdO1xuICAgIGlmIChoYXNQb3N0Zml4TW9kaWZpZXIgJiYgY29uZmxpY3RpbmdDbGFzc0dyb3VwTW9kaWZpZXJzW2NsYXNzR3JvdXBJZF0pIHtcbiAgICAgIHJldHVybiBbLi4uY29uZmxpY3RzLCAuLi5jb25mbGljdGluZ0NsYXNzR3JvdXBNb2RpZmllcnNbY2xhc3NHcm91cElkXV07XG4gICAgfVxuICAgIHJldHVybiBjb25mbGljdHM7XG4gIH07XG4gIHJldHVybiB7XG4gICAgZ2V0Q2xhc3NHcm91cElkLFxuICAgIGdldENvbmZsaWN0aW5nQ2xhc3NHcm91cElkc1xuICB9O1xufTtcbmNvbnN0IGdldEdyb3VwUmVjdXJzaXZlID0gKGNsYXNzUGFydHMsIGNsYXNzUGFydE9iamVjdCkgPT4ge1xuICBpZiAoY2xhc3NQYXJ0cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gY2xhc3NQYXJ0T2JqZWN0LmNsYXNzR3JvdXBJZDtcbiAgfVxuICBjb25zdCBjdXJyZW50Q2xhc3NQYXJ0ID0gY2xhc3NQYXJ0c1swXTtcbiAgY29uc3QgbmV4dENsYXNzUGFydE9iamVjdCA9IGNsYXNzUGFydE9iamVjdC5uZXh0UGFydC5nZXQoY3VycmVudENsYXNzUGFydCk7XG4gIGNvbnN0IGNsYXNzR3JvdXBGcm9tTmV4dENsYXNzUGFydCA9IG5leHRDbGFzc1BhcnRPYmplY3QgPyBnZXRHcm91cFJlY3Vyc2l2ZShjbGFzc1BhcnRzLnNsaWNlKDEpLCBuZXh0Q2xhc3NQYXJ0T2JqZWN0KSA6IHVuZGVmaW5lZDtcbiAgaWYgKGNsYXNzR3JvdXBGcm9tTmV4dENsYXNzUGFydCkge1xuICAgIHJldHVybiBjbGFzc0dyb3VwRnJvbU5leHRDbGFzc1BhcnQ7XG4gIH1cbiAgaWYgKGNsYXNzUGFydE9iamVjdC52YWxpZGF0b3JzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgY29uc3QgY2xhc3NSZXN0ID0gY2xhc3NQYXJ0cy5qb2luKENMQVNTX1BBUlRfU0VQQVJBVE9SKTtcbiAgcmV0dXJuIGNsYXNzUGFydE9iamVjdC52YWxpZGF0b3JzLmZpbmQoKHtcbiAgICB2YWxpZGF0b3JcbiAgfSkgPT4gdmFsaWRhdG9yKGNsYXNzUmVzdCkpPy5jbGFzc0dyb3VwSWQ7XG59O1xuY29uc3QgYXJiaXRyYXJ5UHJvcGVydHlSZWdleCA9IC9eXFxbKC4rKVxcXSQvO1xuY29uc3QgZ2V0R3JvdXBJZEZvckFyYml0cmFyeVByb3BlcnR5ID0gY2xhc3NOYW1lID0+IHtcbiAgaWYgKGFyYml0cmFyeVByb3BlcnR5UmVnZXgudGVzdChjbGFzc05hbWUpKSB7XG4gICAgY29uc3QgYXJiaXRyYXJ5UHJvcGVydHlDbGFzc05hbWUgPSBhcmJpdHJhcnlQcm9wZXJ0eVJlZ2V4LmV4ZWMoY2xhc3NOYW1lKVsxXTtcbiAgICBjb25zdCBwcm9wZXJ0eSA9IGFyYml0cmFyeVByb3BlcnR5Q2xhc3NOYW1lPy5zdWJzdHJpbmcoMCwgYXJiaXRyYXJ5UHJvcGVydHlDbGFzc05hbWUuaW5kZXhPZignOicpKTtcbiAgICBpZiAocHJvcGVydHkpIHtcbiAgICAgIC8vIEkgdXNlIHR3byBkb3RzIGhlcmUgYmVjYXVzZSBvbmUgZG90IGlzIHVzZWQgYXMgcHJlZml4IGZvciBjbGFzcyBncm91cHMgaW4gcGx1Z2luc1xuICAgICAgcmV0dXJuICdhcmJpdHJhcnkuLicgKyBwcm9wZXJ0eTtcbiAgICB9XG4gIH1cbn07XG4vKipcbiAqIEV4cG9ydGVkIGZvciB0ZXN0aW5nIG9ubHlcbiAqL1xuY29uc3QgY3JlYXRlQ2xhc3NNYXAgPSBjb25maWcgPT4ge1xuICBjb25zdCB7XG4gICAgdGhlbWUsXG4gICAgY2xhc3NHcm91cHNcbiAgfSA9IGNvbmZpZztcbiAgY29uc3QgY2xhc3NNYXAgPSB7XG4gICAgbmV4dFBhcnQ6IG5ldyBNYXAoKSxcbiAgICB2YWxpZGF0b3JzOiBbXVxuICB9O1xuICBmb3IgKGNvbnN0IGNsYXNzR3JvdXBJZCBpbiBjbGFzc0dyb3Vwcykge1xuICAgIHByb2Nlc3NDbGFzc2VzUmVjdXJzaXZlbHkoY2xhc3NHcm91cHNbY2xhc3NHcm91cElkXSwgY2xhc3NNYXAsIGNsYXNzR3JvdXBJZCwgdGhlbWUpO1xuICB9XG4gIHJldHVybiBjbGFzc01hcDtcbn07XG5jb25zdCBwcm9jZXNzQ2xhc3Nlc1JlY3Vyc2l2ZWx5ID0gKGNsYXNzR3JvdXAsIGNsYXNzUGFydE9iamVjdCwgY2xhc3NHcm91cElkLCB0aGVtZSkgPT4ge1xuICBjbGFzc0dyb3VwLmZvckVhY2goY2xhc3NEZWZpbml0aW9uID0+IHtcbiAgICBpZiAodHlwZW9mIGNsYXNzRGVmaW5pdGlvbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IGNsYXNzUGFydE9iamVjdFRvRWRpdCA9IGNsYXNzRGVmaW5pdGlvbiA9PT0gJycgPyBjbGFzc1BhcnRPYmplY3QgOiBnZXRQYXJ0KGNsYXNzUGFydE9iamVjdCwgY2xhc3NEZWZpbml0aW9uKTtcbiAgICAgIGNsYXNzUGFydE9iamVjdFRvRWRpdC5jbGFzc0dyb3VwSWQgPSBjbGFzc0dyb3VwSWQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY2xhc3NEZWZpbml0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAoaXNUaGVtZUdldHRlcihjbGFzc0RlZmluaXRpb24pKSB7XG4gICAgICAgIHByb2Nlc3NDbGFzc2VzUmVjdXJzaXZlbHkoY2xhc3NEZWZpbml0aW9uKHRoZW1lKSwgY2xhc3NQYXJ0T2JqZWN0LCBjbGFzc0dyb3VwSWQsIHRoZW1lKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY2xhc3NQYXJ0T2JqZWN0LnZhbGlkYXRvcnMucHVzaCh7XG4gICAgICAgIHZhbGlkYXRvcjogY2xhc3NEZWZpbml0aW9uLFxuICAgICAgICBjbGFzc0dyb3VwSWRcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBPYmplY3QuZW50cmllcyhjbGFzc0RlZmluaXRpb24pLmZvckVhY2goKFtrZXksIGNsYXNzR3JvdXBdKSA9PiB7XG4gICAgICBwcm9jZXNzQ2xhc3Nlc1JlY3Vyc2l2ZWx5KGNsYXNzR3JvdXAsIGdldFBhcnQoY2xhc3NQYXJ0T2JqZWN0LCBrZXkpLCBjbGFzc0dyb3VwSWQsIHRoZW1lKTtcbiAgICB9KTtcbiAgfSk7XG59O1xuY29uc3QgZ2V0UGFydCA9IChjbGFzc1BhcnRPYmplY3QsIHBhdGgpID0+IHtcbiAgbGV0IGN1cnJlbnRDbGFzc1BhcnRPYmplY3QgPSBjbGFzc1BhcnRPYmplY3Q7XG4gIHBhdGguc3BsaXQoQ0xBU1NfUEFSVF9TRVBBUkFUT1IpLmZvckVhY2gocGF0aFBhcnQgPT4ge1xuICAgIGlmICghY3VycmVudENsYXNzUGFydE9iamVjdC5uZXh0UGFydC5oYXMocGF0aFBhcnQpKSB7XG4gICAgICBjdXJyZW50Q2xhc3NQYXJ0T2JqZWN0Lm5leHRQYXJ0LnNldChwYXRoUGFydCwge1xuICAgICAgICBuZXh0UGFydDogbmV3IE1hcCgpLFxuICAgICAgICB2YWxpZGF0b3JzOiBbXVxuICAgICAgfSk7XG4gICAgfVxuICAgIGN1cnJlbnRDbGFzc1BhcnRPYmplY3QgPSBjdXJyZW50Q2xhc3NQYXJ0T2JqZWN0Lm5leHRQYXJ0LmdldChwYXRoUGFydCk7XG4gIH0pO1xuICByZXR1cm4gY3VycmVudENsYXNzUGFydE9iamVjdDtcbn07XG5jb25zdCBpc1RoZW1lR2V0dGVyID0gZnVuYyA9PiBmdW5jLmlzVGhlbWVHZXR0ZXI7XG5cbi8vIExSVSBjYWNoZSBpbnNwaXJlZCBmcm9tIGhhc2hscnUgKGh0dHBzOi8vZ2l0aHViLmNvbS9kb21pbmljdGFyci9oYXNobHJ1L2Jsb2IvdjEuMC40L2luZGV4LmpzKSBidXQgb2JqZWN0IHJlcGxhY2VkIHdpdGggTWFwIHRvIGltcHJvdmUgcGVyZm9ybWFuY2VcbmNvbnN0IGNyZWF0ZUxydUNhY2hlID0gbWF4Q2FjaGVTaXplID0+IHtcbiAgaWYgKG1heENhY2hlU2l6ZSA8IDEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZ2V0OiAoKSA9PiB1bmRlZmluZWQsXG4gICAgICBzZXQ6ICgpID0+IHt9XG4gICAgfTtcbiAgfVxuICBsZXQgY2FjaGVTaXplID0gMDtcbiAgbGV0IGNhY2hlID0gbmV3IE1hcCgpO1xuICBsZXQgcHJldmlvdXNDYWNoZSA9IG5ldyBNYXAoKTtcbiAgY29uc3QgdXBkYXRlID0gKGtleSwgdmFsdWUpID0+IHtcbiAgICBjYWNoZS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgY2FjaGVTaXplKys7XG4gICAgaWYgKGNhY2hlU2l6ZSA+IG1heENhY2hlU2l6ZSkge1xuICAgICAgY2FjaGVTaXplID0gMDtcbiAgICAgIHByZXZpb3VzQ2FjaGUgPSBjYWNoZTtcbiAgICAgIGNhY2hlID0gbmV3IE1hcCgpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHtcbiAgICBnZXQoa2V5KSB7XG4gICAgICBsZXQgdmFsdWUgPSBjYWNoZS5nZXQoa2V5KTtcbiAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIGlmICgodmFsdWUgPSBwcmV2aW91c0NhY2hlLmdldChrZXkpKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHVwZGF0ZShrZXksIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgIH0sXG4gICAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICAgIGlmIChjYWNoZS5oYXMoa2V5KSkge1xuICAgICAgICBjYWNoZS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1cGRhdGUoa2V5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufTtcbmNvbnN0IElNUE9SVEFOVF9NT0RJRklFUiA9ICchJztcbmNvbnN0IE1PRElGSUVSX1NFUEFSQVRPUiA9ICc6JztcbmNvbnN0IE1PRElGSUVSX1NFUEFSQVRPUl9MRU5HVEggPSBNT0RJRklFUl9TRVBBUkFUT1IubGVuZ3RoO1xuY29uc3QgY3JlYXRlUGFyc2VDbGFzc05hbWUgPSBjb25maWcgPT4ge1xuICBjb25zdCB7XG4gICAgcHJlZml4LFxuICAgIGV4cGVyaW1lbnRhbFBhcnNlQ2xhc3NOYW1lXG4gIH0gPSBjb25maWc7XG4gIC8qKlxuICAgKiBQYXJzZSBjbGFzcyBuYW1lIGludG8gcGFydHMuXG4gICAqXG4gICAqIEluc3BpcmVkIGJ5IGBzcGxpdEF0VG9wTGV2ZWxPbmx5YCB1c2VkIGluIFRhaWx3aW5kIENTU1xuICAgKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS90YWlsd2luZGxhYnMvdGFpbHdpbmRjc3MvYmxvYi92My4yLjIvc3JjL3V0aWwvc3BsaXRBdFRvcExldmVsT25seS5qc1xuICAgKi9cbiAgbGV0IHBhcnNlQ2xhc3NOYW1lID0gY2xhc3NOYW1lID0+IHtcbiAgICBjb25zdCBtb2RpZmllcnMgPSBbXTtcbiAgICBsZXQgYnJhY2tldERlcHRoID0gMDtcbiAgICBsZXQgcGFyZW5EZXB0aCA9IDA7XG4gICAgbGV0IG1vZGlmaWVyU3RhcnQgPSAwO1xuICAgIGxldCBwb3N0Zml4TW9kaWZpZXJQb3NpdGlvbjtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY2xhc3NOYW1lLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgbGV0IGN1cnJlbnRDaGFyYWN0ZXIgPSBjbGFzc05hbWVbaW5kZXhdO1xuICAgICAgaWYgKGJyYWNrZXREZXB0aCA9PT0gMCAmJiBwYXJlbkRlcHRoID09PSAwKSB7XG4gICAgICAgIGlmIChjdXJyZW50Q2hhcmFjdGVyID09PSBNT0RJRklFUl9TRVBBUkFUT1IpIHtcbiAgICAgICAgICBtb2RpZmllcnMucHVzaChjbGFzc05hbWUuc2xpY2UobW9kaWZpZXJTdGFydCwgaW5kZXgpKTtcbiAgICAgICAgICBtb2RpZmllclN0YXJ0ID0gaW5kZXggKyBNT0RJRklFUl9TRVBBUkFUT1JfTEVOR1RIO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjdXJyZW50Q2hhcmFjdGVyID09PSAnLycpIHtcbiAgICAgICAgICBwb3N0Zml4TW9kaWZpZXJQb3NpdGlvbiA9IGluZGV4O1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudENoYXJhY3RlciA9PT0gJ1snKSB7XG4gICAgICAgIGJyYWNrZXREZXB0aCsrO1xuICAgICAgfSBlbHNlIGlmIChjdXJyZW50Q2hhcmFjdGVyID09PSAnXScpIHtcbiAgICAgICAgYnJhY2tldERlcHRoLS07XG4gICAgICB9IGVsc2UgaWYgKGN1cnJlbnRDaGFyYWN0ZXIgPT09ICcoJykge1xuICAgICAgICBwYXJlbkRlcHRoKys7XG4gICAgICB9IGVsc2UgaWYgKGN1cnJlbnRDaGFyYWN0ZXIgPT09ICcpJykge1xuICAgICAgICBwYXJlbkRlcHRoLS07XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGJhc2VDbGFzc05hbWVXaXRoSW1wb3J0YW50TW9kaWZpZXIgPSBtb2RpZmllcnMubGVuZ3RoID09PSAwID8gY2xhc3NOYW1lIDogY2xhc3NOYW1lLnN1YnN0cmluZyhtb2RpZmllclN0YXJ0KTtcbiAgICBjb25zdCBiYXNlQ2xhc3NOYW1lID0gc3RyaXBJbXBvcnRhbnRNb2RpZmllcihiYXNlQ2xhc3NOYW1lV2l0aEltcG9ydGFudE1vZGlmaWVyKTtcbiAgICBjb25zdCBoYXNJbXBvcnRhbnRNb2RpZmllciA9IGJhc2VDbGFzc05hbWUgIT09IGJhc2VDbGFzc05hbWVXaXRoSW1wb3J0YW50TW9kaWZpZXI7XG4gICAgY29uc3QgbWF5YmVQb3N0Zml4TW9kaWZpZXJQb3NpdGlvbiA9IHBvc3RmaXhNb2RpZmllclBvc2l0aW9uICYmIHBvc3RmaXhNb2RpZmllclBvc2l0aW9uID4gbW9kaWZpZXJTdGFydCA/IHBvc3RmaXhNb2RpZmllclBvc2l0aW9uIC0gbW9kaWZpZXJTdGFydCA6IHVuZGVmaW5lZDtcbiAgICByZXR1cm4ge1xuICAgICAgbW9kaWZpZXJzLFxuICAgICAgaGFzSW1wb3J0YW50TW9kaWZpZXIsXG4gICAgICBiYXNlQ2xhc3NOYW1lLFxuICAgICAgbWF5YmVQb3N0Zml4TW9kaWZpZXJQb3NpdGlvblxuICAgIH07XG4gIH07XG4gIGlmIChwcmVmaXgpIHtcbiAgICBjb25zdCBmdWxsUHJlZml4ID0gcHJlZml4ICsgTU9ESUZJRVJfU0VQQVJBVE9SO1xuICAgIGNvbnN0IHBhcnNlQ2xhc3NOYW1lT3JpZ2luYWwgPSBwYXJzZUNsYXNzTmFtZTtcbiAgICBwYXJzZUNsYXNzTmFtZSA9IGNsYXNzTmFtZSA9PiBjbGFzc05hbWUuc3RhcnRzV2l0aChmdWxsUHJlZml4KSA/IHBhcnNlQ2xhc3NOYW1lT3JpZ2luYWwoY2xhc3NOYW1lLnN1YnN0cmluZyhmdWxsUHJlZml4Lmxlbmd0aCkpIDoge1xuICAgICAgaXNFeHRlcm5hbDogdHJ1ZSxcbiAgICAgIG1vZGlmaWVyczogW10sXG4gICAgICBoYXNJbXBvcnRhbnRNb2RpZmllcjogZmFsc2UsXG4gICAgICBiYXNlQ2xhc3NOYW1lOiBjbGFzc05hbWUsXG4gICAgICBtYXliZVBvc3RmaXhNb2RpZmllclBvc2l0aW9uOiB1bmRlZmluZWRcbiAgICB9O1xuICB9XG4gIGlmIChleHBlcmltZW50YWxQYXJzZUNsYXNzTmFtZSkge1xuICAgIGNvbnN0IHBhcnNlQ2xhc3NOYW1lT3JpZ2luYWwgPSBwYXJzZUNsYXNzTmFtZTtcbiAgICBwYXJzZUNsYXNzTmFtZSA9IGNsYXNzTmFtZSA9PiBleHBlcmltZW50YWxQYXJzZUNsYXNzTmFtZSh7XG4gICAgICBjbGFzc05hbWUsXG4gICAgICBwYXJzZUNsYXNzTmFtZTogcGFyc2VDbGFzc05hbWVPcmlnaW5hbFxuICAgIH0pO1xuICB9XG4gIHJldHVybiBwYXJzZUNsYXNzTmFtZTtcbn07XG5jb25zdCBzdHJpcEltcG9ydGFudE1vZGlmaWVyID0gYmFzZUNsYXNzTmFtZSA9PiB7XG4gIGlmIChiYXNlQ2xhc3NOYW1lLmVuZHNXaXRoKElNUE9SVEFOVF9NT0RJRklFUikpIHtcbiAgICByZXR1cm4gYmFzZUNsYXNzTmFtZS5zdWJzdHJpbmcoMCwgYmFzZUNsYXNzTmFtZS5sZW5ndGggLSAxKTtcbiAgfVxuICAvKipcbiAgICogSW4gVGFpbHdpbmQgQ1NTIHYzIHRoZSBpbXBvcnRhbnQgbW9kaWZpZXIgd2FzIGF0IHRoZSBzdGFydCBvZiB0aGUgYmFzZSBjbGFzcyBuYW1lLiBUaGlzIGlzIHN0aWxsIHN1cHBvcnRlZCBmb3IgbGVnYWN5IHJlYXNvbnMuXG4gICAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2RjYXN0aWwvdGFpbHdpbmQtbWVyZ2UvaXNzdWVzLzUxMyNpc3N1ZWNvbW1lbnQtMjYxNDAyOTg2NFxuICAgKi9cbiAgaWYgKGJhc2VDbGFzc05hbWUuc3RhcnRzV2l0aChJTVBPUlRBTlRfTU9ESUZJRVIpKSB7XG4gICAgcmV0dXJuIGJhc2VDbGFzc05hbWUuc3Vic3RyaW5nKDEpO1xuICB9XG4gIHJldHVybiBiYXNlQ2xhc3NOYW1lO1xufTtcblxuLyoqXG4gKiBTb3J0cyBtb2RpZmllcnMgYWNjb3JkaW5nIHRvIGZvbGxvd2luZyBzY2hlbWE6XG4gKiAtIFByZWRlZmluZWQgbW9kaWZpZXJzIGFyZSBzb3J0ZWQgYWxwaGFiZXRpY2FsbHlcbiAqIC0gV2hlbiBhbiBhcmJpdHJhcnkgdmFyaWFudCBhcHBlYXJzLCBpdCBtdXN0IGJlIHByZXNlcnZlZCB3aGljaCBtb2RpZmllcnMgYXJlIGJlZm9yZSBhbmQgYWZ0ZXIgaXRcbiAqL1xuY29uc3QgY3JlYXRlU29ydE1vZGlmaWVycyA9IGNvbmZpZyA9PiB7XG4gIGNvbnN0IG9yZGVyU2Vuc2l0aXZlTW9kaWZpZXJzID0gT2JqZWN0LmZyb21FbnRyaWVzKGNvbmZpZy5vcmRlclNlbnNpdGl2ZU1vZGlmaWVycy5tYXAobW9kaWZpZXIgPT4gW21vZGlmaWVyLCB0cnVlXSkpO1xuICBjb25zdCBzb3J0TW9kaWZpZXJzID0gbW9kaWZpZXJzID0+IHtcbiAgICBpZiAobW9kaWZpZXJzLmxlbmd0aCA8PSAxKSB7XG4gICAgICByZXR1cm4gbW9kaWZpZXJzO1xuICAgIH1cbiAgICBjb25zdCBzb3J0ZWRNb2RpZmllcnMgPSBbXTtcbiAgICBsZXQgdW5zb3J0ZWRNb2RpZmllcnMgPSBbXTtcbiAgICBtb2RpZmllcnMuZm9yRWFjaChtb2RpZmllciA9PiB7XG4gICAgICBjb25zdCBpc1Bvc2l0aW9uU2Vuc2l0aXZlID0gbW9kaWZpZXJbMF0gPT09ICdbJyB8fCBvcmRlclNlbnNpdGl2ZU1vZGlmaWVyc1ttb2RpZmllcl07XG4gICAgICBpZiAoaXNQb3NpdGlvblNlbnNpdGl2ZSkge1xuICAgICAgICBzb3J0ZWRNb2RpZmllcnMucHVzaCguLi51bnNvcnRlZE1vZGlmaWVycy5zb3J0KCksIG1vZGlmaWVyKTtcbiAgICAgICAgdW5zb3J0ZWRNb2RpZmllcnMgPSBbXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVuc29ydGVkTW9kaWZpZXJzLnB1c2gobW9kaWZpZXIpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHNvcnRlZE1vZGlmaWVycy5wdXNoKC4uLnVuc29ydGVkTW9kaWZpZXJzLnNvcnQoKSk7XG4gICAgcmV0dXJuIHNvcnRlZE1vZGlmaWVycztcbiAgfTtcbiAgcmV0dXJuIHNvcnRNb2RpZmllcnM7XG59O1xuY29uc3QgY3JlYXRlQ29uZmlnVXRpbHMgPSBjb25maWcgPT4gKHtcbiAgY2FjaGU6IGNyZWF0ZUxydUNhY2hlKGNvbmZpZy5jYWNoZVNpemUpLFxuICBwYXJzZUNsYXNzTmFtZTogY3JlYXRlUGFyc2VDbGFzc05hbWUoY29uZmlnKSxcbiAgc29ydE1vZGlmaWVyczogY3JlYXRlU29ydE1vZGlmaWVycyhjb25maWcpLFxuICAuLi5jcmVhdGVDbGFzc0dyb3VwVXRpbHMoY29uZmlnKVxufSk7XG5jb25zdCBTUExJVF9DTEFTU0VTX1JFR0VYID0gL1xccysvO1xuY29uc3QgbWVyZ2VDbGFzc0xpc3QgPSAoY2xhc3NMaXN0LCBjb25maWdVdGlscykgPT4ge1xuICBjb25zdCB7XG4gICAgcGFyc2VDbGFzc05hbWUsXG4gICAgZ2V0Q2xhc3NHcm91cElkLFxuICAgIGdldENvbmZsaWN0aW5nQ2xhc3NHcm91cElkcyxcbiAgICBzb3J0TW9kaWZpZXJzXG4gIH0gPSBjb25maWdVdGlscztcbiAgLyoqXG4gICAqIFNldCBvZiBjbGFzc0dyb3VwSWRzIGluIGZvbGxvd2luZyBmb3JtYXQ6XG4gICAqIGB7aW1wb3J0YW50TW9kaWZpZXJ9e3ZhcmlhbnRNb2RpZmllcnN9e2NsYXNzR3JvdXBJZH1gXG4gICAqIEBleGFtcGxlICdmbG9hdCdcbiAgICogQGV4YW1wbGUgJ2hvdmVyOmZvY3VzOmJnLWNvbG9yJ1xuICAgKiBAZXhhbXBsZSAnbWQ6IXByJ1xuICAgKi9cbiAgY29uc3QgY2xhc3NHcm91cHNJbkNvbmZsaWN0ID0gW107XG4gIGNvbnN0IGNsYXNzTmFtZXMgPSBjbGFzc0xpc3QudHJpbSgpLnNwbGl0KFNQTElUX0NMQVNTRVNfUkVHRVgpO1xuICBsZXQgcmVzdWx0ID0gJyc7XG4gIGZvciAobGV0IGluZGV4ID0gY2xhc3NOYW1lcy5sZW5ndGggLSAxOyBpbmRleCA+PSAwOyBpbmRleCAtPSAxKSB7XG4gICAgY29uc3Qgb3JpZ2luYWxDbGFzc05hbWUgPSBjbGFzc05hbWVzW2luZGV4XTtcbiAgICBjb25zdCB7XG4gICAgICBpc0V4dGVybmFsLFxuICAgICAgbW9kaWZpZXJzLFxuICAgICAgaGFzSW1wb3J0YW50TW9kaWZpZXIsXG4gICAgICBiYXNlQ2xhc3NOYW1lLFxuICAgICAgbWF5YmVQb3N0Zml4TW9kaWZpZXJQb3NpdGlvblxuICAgIH0gPSBwYXJzZUNsYXNzTmFtZShvcmlnaW5hbENsYXNzTmFtZSk7XG4gICAgaWYgKGlzRXh0ZXJuYWwpIHtcbiAgICAgIHJlc3VsdCA9IG9yaWdpbmFsQ2xhc3NOYW1lICsgKHJlc3VsdC5sZW5ndGggPiAwID8gJyAnICsgcmVzdWx0IDogcmVzdWx0KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBsZXQgaGFzUG9zdGZpeE1vZGlmaWVyID0gISFtYXliZVBvc3RmaXhNb2RpZmllclBvc2l0aW9uO1xuICAgIGxldCBjbGFzc0dyb3VwSWQgPSBnZXRDbGFzc0dyb3VwSWQoaGFzUG9zdGZpeE1vZGlmaWVyID8gYmFzZUNsYXNzTmFtZS5zdWJzdHJpbmcoMCwgbWF5YmVQb3N0Zml4TW9kaWZpZXJQb3NpdGlvbikgOiBiYXNlQ2xhc3NOYW1lKTtcbiAgICBpZiAoIWNsYXNzR3JvdXBJZCkge1xuICAgICAgaWYgKCFoYXNQb3N0Zml4TW9kaWZpZXIpIHtcbiAgICAgICAgLy8gTm90IGEgVGFpbHdpbmQgY2xhc3NcbiAgICAgICAgcmVzdWx0ID0gb3JpZ2luYWxDbGFzc05hbWUgKyAocmVzdWx0Lmxlbmd0aCA+IDAgPyAnICcgKyByZXN1bHQgOiByZXN1bHQpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNsYXNzR3JvdXBJZCA9IGdldENsYXNzR3JvdXBJZChiYXNlQ2xhc3NOYW1lKTtcbiAgICAgIGlmICghY2xhc3NHcm91cElkKSB7XG4gICAgICAgIC8vIE5vdCBhIFRhaWx3aW5kIGNsYXNzXG4gICAgICAgIHJlc3VsdCA9IG9yaWdpbmFsQ2xhc3NOYW1lICsgKHJlc3VsdC5sZW5ndGggPiAwID8gJyAnICsgcmVzdWx0IDogcmVzdWx0KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBoYXNQb3N0Zml4TW9kaWZpZXIgPSBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgdmFyaWFudE1vZGlmaWVyID0gc29ydE1vZGlmaWVycyhtb2RpZmllcnMpLmpvaW4oJzonKTtcbiAgICBjb25zdCBtb2RpZmllcklkID0gaGFzSW1wb3J0YW50TW9kaWZpZXIgPyB2YXJpYW50TW9kaWZpZXIgKyBJTVBPUlRBTlRfTU9ESUZJRVIgOiB2YXJpYW50TW9kaWZpZXI7XG4gICAgY29uc3QgY2xhc3NJZCA9IG1vZGlmaWVySWQgKyBjbGFzc0dyb3VwSWQ7XG4gICAgaWYgKGNsYXNzR3JvdXBzSW5Db25mbGljdC5pbmNsdWRlcyhjbGFzc0lkKSkge1xuICAgICAgLy8gVGFpbHdpbmQgY2xhc3Mgb21pdHRlZCBkdWUgdG8gY29uZmxpY3RcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBjbGFzc0dyb3Vwc0luQ29uZmxpY3QucHVzaChjbGFzc0lkKTtcbiAgICBjb25zdCBjb25mbGljdEdyb3VwcyA9IGdldENvbmZsaWN0aW5nQ2xhc3NHcm91cElkcyhjbGFzc0dyb3VwSWQsIGhhc1Bvc3RmaXhNb2RpZmllcik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb25mbGljdEdyb3Vwcy5sZW5ndGg7ICsraSkge1xuICAgICAgY29uc3QgZ3JvdXAgPSBjb25mbGljdEdyb3Vwc1tpXTtcbiAgICAgIGNsYXNzR3JvdXBzSW5Db25mbGljdC5wdXNoKG1vZGlmaWVySWQgKyBncm91cCk7XG4gICAgfVxuICAgIC8vIFRhaWx3aW5kIGNsYXNzIG5vdCBpbiBjb25mbGljdFxuICAgIHJlc3VsdCA9IG9yaWdpbmFsQ2xhc3NOYW1lICsgKHJlc3VsdC5sZW5ndGggPiAwID8gJyAnICsgcmVzdWx0IDogcmVzdWx0KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBUaGUgY29kZSBpbiB0aGlzIGZpbGUgaXMgY29waWVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2x1a2VlZC9jbHN4IGFuZCBtb2RpZmllZCB0byBzdWl0IHRoZSBuZWVkcyBvZiB0YWlsd2luZC1tZXJnZSBiZXR0ZXIuXG4gKlxuICogU3BlY2lmaWNhbGx5OlxuICogLSBSdW50aW1lIGNvZGUgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbHVrZWVkL2Nsc3gvYmxvYi92MS4yLjEvc3JjL2luZGV4LmpzXG4gKiAtIFR5cGVTY3JpcHQgdHlwZXMgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbHVrZWVkL2Nsc3gvYmxvYi92MS4yLjEvY2xzeC5kLnRzXG4gKlxuICogT3JpZ2luYWwgY29kZSBoYXMgTUlUIGxpY2Vuc2U6IENvcHlyaWdodCAoYykgTHVrZSBFZHdhcmRzIDxsdWtlLmVkd2FyZHMwNUBnbWFpbC5jb20+IChsdWtlZWQuY29tKVxuICovXG5mdW5jdGlvbiB0d0pvaW4oKSB7XG4gIGxldCBpbmRleCA9IDA7XG4gIGxldCBhcmd1bWVudDtcbiAgbGV0IHJlc29sdmVkVmFsdWU7XG4gIGxldCBzdHJpbmcgPSAnJztcbiAgd2hpbGUgKGluZGV4IDwgYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGlmIChhcmd1bWVudCA9IGFyZ3VtZW50c1tpbmRleCsrXSkge1xuICAgICAgaWYgKHJlc29sdmVkVmFsdWUgPSB0b1ZhbHVlKGFyZ3VtZW50KSkge1xuICAgICAgICBzdHJpbmcgJiYgKHN0cmluZyArPSAnICcpO1xuICAgICAgICBzdHJpbmcgKz0gcmVzb2x2ZWRWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cmluZztcbn1cbmNvbnN0IHRvVmFsdWUgPSBtaXggPT4ge1xuICBpZiAodHlwZW9mIG1peCA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gbWl4O1xuICB9XG4gIGxldCByZXNvbHZlZFZhbHVlO1xuICBsZXQgc3RyaW5nID0gJyc7XG4gIGZvciAobGV0IGsgPSAwOyBrIDwgbWl4Lmxlbmd0aDsgaysrKSB7XG4gICAgaWYgKG1peFtrXSkge1xuICAgICAgaWYgKHJlc29sdmVkVmFsdWUgPSB0b1ZhbHVlKG1peFtrXSkpIHtcbiAgICAgICAgc3RyaW5nICYmIChzdHJpbmcgKz0gJyAnKTtcbiAgICAgICAgc3RyaW5nICs9IHJlc29sdmVkVmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHJpbmc7XG59O1xuZnVuY3Rpb24gY3JlYXRlVGFpbHdpbmRNZXJnZShjcmVhdGVDb25maWdGaXJzdCwgLi4uY3JlYXRlQ29uZmlnUmVzdCkge1xuICBsZXQgY29uZmlnVXRpbHM7XG4gIGxldCBjYWNoZUdldDtcbiAgbGV0IGNhY2hlU2V0O1xuICBsZXQgZnVuY3Rpb25Ub0NhbGwgPSBpbml0VGFpbHdpbmRNZXJnZTtcbiAgZnVuY3Rpb24gaW5pdFRhaWx3aW5kTWVyZ2UoY2xhc3NMaXN0KSB7XG4gICAgY29uc3QgY29uZmlnID0gY3JlYXRlQ29uZmlnUmVzdC5yZWR1Y2UoKHByZXZpb3VzQ29uZmlnLCBjcmVhdGVDb25maWdDdXJyZW50KSA9PiBjcmVhdGVDb25maWdDdXJyZW50KHByZXZpb3VzQ29uZmlnKSwgY3JlYXRlQ29uZmlnRmlyc3QoKSk7XG4gICAgY29uZmlnVXRpbHMgPSBjcmVhdGVDb25maWdVdGlscyhjb25maWcpO1xuICAgIGNhY2hlR2V0ID0gY29uZmlnVXRpbHMuY2FjaGUuZ2V0O1xuICAgIGNhY2hlU2V0ID0gY29uZmlnVXRpbHMuY2FjaGUuc2V0O1xuICAgIGZ1bmN0aW9uVG9DYWxsID0gdGFpbHdpbmRNZXJnZTtcbiAgICByZXR1cm4gdGFpbHdpbmRNZXJnZShjbGFzc0xpc3QpO1xuICB9XG4gIGZ1bmN0aW9uIHRhaWx3aW5kTWVyZ2UoY2xhc3NMaXN0KSB7XG4gICAgY29uc3QgY2FjaGVkUmVzdWx0ID0gY2FjaGVHZXQoY2xhc3NMaXN0KTtcbiAgICBpZiAoY2FjaGVkUmVzdWx0KSB7XG4gICAgICByZXR1cm4gY2FjaGVkUmVzdWx0O1xuICAgIH1cbiAgICBjb25zdCByZXN1bHQgPSBtZXJnZUNsYXNzTGlzdChjbGFzc0xpc3QsIGNvbmZpZ1V0aWxzKTtcbiAgICBjYWNoZVNldChjbGFzc0xpc3QsIHJlc3VsdCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gY2FsbFRhaWx3aW5kTWVyZ2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uVG9DYWxsKHR3Sm9pbi5hcHBseShudWxsLCBhcmd1bWVudHMpKTtcbiAgfTtcbn1cbmNvbnN0IGZyb21UaGVtZSA9IGtleSA9PiB7XG4gIGNvbnN0IHRoZW1lR2V0dGVyID0gdGhlbWUgPT4gdGhlbWVba2V5XSB8fCBbXTtcbiAgdGhlbWVHZXR0ZXIuaXNUaGVtZUdldHRlciA9IHRydWU7XG4gIHJldHVybiB0aGVtZUdldHRlcjtcbn07XG5jb25zdCBhcmJpdHJhcnlWYWx1ZVJlZ2V4ID0gL15cXFsoPzooXFx3W1xcdy1dKik6KT8oLispXFxdJC9pO1xuY29uc3QgYXJiaXRyYXJ5VmFyaWFibGVSZWdleCA9IC9eXFwoKD86KFxcd1tcXHctXSopOik/KC4rKVxcKSQvaTtcbmNvbnN0IGZyYWN0aW9uUmVnZXggPSAvXlxcZCtcXC9cXGQrJC87XG5jb25zdCB0c2hpcnRVbml0UmVnZXggPSAvXihcXGQrKFxcLlxcZCspPyk/KHhzfHNtfG1kfGxnfHhsKSQvO1xuY29uc3QgbGVuZ3RoVW5pdFJlZ2V4ID0gL1xcZCsoJXxweHxyP2VtfFtzZGxdP3YoW2h3aWJdfG1pbnxtYXgpfHB0fHBjfGlufGNtfG1tfGNhcHxjaHxleHxyP2xofGNxKHd8aHxpfGJ8bWlufG1heCkpfFxcYihjYWxjfG1pbnxtYXh8Y2xhbXApXFwoLitcXCl8XjAkLztcbmNvbnN0IGNvbG9yRnVuY3Rpb25SZWdleCA9IC9eKHJnYmE/fGhzbGE/fGh3Ynwob2spPyhsYWJ8bGNoKXxjb2xvci1taXgpXFwoLitcXCkkLztcbi8vIFNoYWRvdyBhbHdheXMgYmVnaW5zIHdpdGggeCBhbmQgeSBvZmZzZXQgc2VwYXJhdGVkIGJ5IHVuZGVyc2NvcmUgb3B0aW9uYWxseSBwcmVwZW5kZWQgYnkgaW5zZXRcbmNvbnN0IHNoYWRvd1JlZ2V4ID0gL14oaW5zZXRfKT8tPygoXFxkKyk/XFwuPyhcXGQrKVthLXpdK3wwKV8tPygoXFxkKyk/XFwuPyhcXGQrKVthLXpdK3wwKS87XG5jb25zdCBpbWFnZVJlZ2V4ID0gL14odXJsfGltYWdlfGltYWdlLXNldHxjcm9zcy1mYWRlfGVsZW1lbnR8KHJlcGVhdGluZy0pPyhsaW5lYXJ8cmFkaWFsfGNvbmljKS1ncmFkaWVudClcXCguK1xcKSQvO1xuY29uc3QgaXNGcmFjdGlvbiA9IHZhbHVlID0+IGZyYWN0aW9uUmVnZXgudGVzdCh2YWx1ZSk7XG5jb25zdCBpc051bWJlciA9IHZhbHVlID0+ICEhdmFsdWUgJiYgIU51bWJlci5pc05hTihOdW1iZXIodmFsdWUpKTtcbmNvbnN0IGlzSW50ZWdlciA9IHZhbHVlID0+ICEhdmFsdWUgJiYgTnVtYmVyLmlzSW50ZWdlcihOdW1iZXIodmFsdWUpKTtcbmNvbnN0IGlzUGVyY2VudCA9IHZhbHVlID0+IHZhbHVlLmVuZHNXaXRoKCclJykgJiYgaXNOdW1iZXIodmFsdWUuc2xpY2UoMCwgLTEpKTtcbmNvbnN0IGlzVHNoaXJ0U2l6ZSA9IHZhbHVlID0+IHRzaGlydFVuaXRSZWdleC50ZXN0KHZhbHVlKTtcbmNvbnN0IGlzQW55ID0gKCkgPT4gdHJ1ZTtcbmNvbnN0IGlzTGVuZ3RoT25seSA9IHZhbHVlID0+XG4vLyBgY29sb3JGdW5jdGlvblJlZ2V4YCBjaGVjayBpcyBuZWNlc3NhcnkgYmVjYXVzZSBjb2xvciBmdW5jdGlvbnMgY2FuIGhhdmUgcGVyY2VudGFnZXMgaW4gdGhlbSB3aGljaCB3aGljaCB3b3VsZCBiZSBpbmNvcnJlY3RseSBjbGFzc2lmaWVkIGFzIGxlbmd0aHMuXG4vLyBGb3IgZXhhbXBsZSwgYGhzbCgwIDAlIDAlKWAgd291bGQgYmUgY2xhc3NpZmllZCBhcyBhIGxlbmd0aCB3aXRob3V0IHRoaXMgY2hlY2suXG4vLyBJIGNvdWxkIGFsc28gdXNlIGxvb2tiZWhpbmQgYXNzZXJ0aW9uIGluIGBsZW5ndGhVbml0UmVnZXhgIGJ1dCB0aGF0IGlzbid0IHN1cHBvcnRlZCB3aWRlbHkgZW5vdWdoLlxubGVuZ3RoVW5pdFJlZ2V4LnRlc3QodmFsdWUpICYmICFjb2xvckZ1bmN0aW9uUmVnZXgudGVzdCh2YWx1ZSk7XG5jb25zdCBpc05ldmVyID0gKCkgPT4gZmFsc2U7XG5jb25zdCBpc1NoYWRvdyA9IHZhbHVlID0+IHNoYWRvd1JlZ2V4LnRlc3QodmFsdWUpO1xuY29uc3QgaXNJbWFnZSA9IHZhbHVlID0+IGltYWdlUmVnZXgudGVzdCh2YWx1ZSk7XG5jb25zdCBpc0FueU5vbkFyYml0cmFyeSA9IHZhbHVlID0+ICFpc0FyYml0cmFyeVZhbHVlKHZhbHVlKSAmJiAhaXNBcmJpdHJhcnlWYXJpYWJsZSh2YWx1ZSk7XG5jb25zdCBpc0FyYml0cmFyeVNpemUgPSB2YWx1ZSA9PiBnZXRJc0FyYml0cmFyeVZhbHVlKHZhbHVlLCBpc0xhYmVsU2l6ZSwgaXNOZXZlcik7XG5jb25zdCBpc0FyYml0cmFyeVZhbHVlID0gdmFsdWUgPT4gYXJiaXRyYXJ5VmFsdWVSZWdleC50ZXN0KHZhbHVlKTtcbmNvbnN0IGlzQXJiaXRyYXJ5TGVuZ3RoID0gdmFsdWUgPT4gZ2V0SXNBcmJpdHJhcnlWYWx1ZSh2YWx1ZSwgaXNMYWJlbExlbmd0aCwgaXNMZW5ndGhPbmx5KTtcbmNvbnN0IGlzQXJiaXRyYXJ5TnVtYmVyID0gdmFsdWUgPT4gZ2V0SXNBcmJpdHJhcnlWYWx1ZSh2YWx1ZSwgaXNMYWJlbE51bWJlciwgaXNOdW1iZXIpO1xuY29uc3QgaXNBcmJpdHJhcnlQb3NpdGlvbiA9IHZhbHVlID0+IGdldElzQXJiaXRyYXJ5VmFsdWUodmFsdWUsIGlzTGFiZWxQb3NpdGlvbiwgaXNOZXZlcik7XG5jb25zdCBpc0FyYml0cmFyeUltYWdlID0gdmFsdWUgPT4gZ2V0SXNBcmJpdHJhcnlWYWx1ZSh2YWx1ZSwgaXNMYWJlbEltYWdlLCBpc0ltYWdlKTtcbmNvbnN0IGlzQXJiaXRyYXJ5U2hhZG93ID0gdmFsdWUgPT4gZ2V0SXNBcmJpdHJhcnlWYWx1ZSh2YWx1ZSwgaXNMYWJlbFNoYWRvdywgaXNTaGFkb3cpO1xuY29uc3QgaXNBcmJpdHJhcnlWYXJpYWJsZSA9IHZhbHVlID0+IGFyYml0cmFyeVZhcmlhYmxlUmVnZXgudGVzdCh2YWx1ZSk7XG5jb25zdCBpc0FyYml0cmFyeVZhcmlhYmxlTGVuZ3RoID0gdmFsdWUgPT4gZ2V0SXNBcmJpdHJhcnlWYXJpYWJsZSh2YWx1ZSwgaXNMYWJlbExlbmd0aCk7XG5jb25zdCBpc0FyYml0cmFyeVZhcmlhYmxlRmFtaWx5TmFtZSA9IHZhbHVlID0+IGdldElzQXJiaXRyYXJ5VmFyaWFibGUodmFsdWUsIGlzTGFiZWxGYW1pbHlOYW1lKTtcbmNvbnN0IGlzQXJiaXRyYXJ5VmFyaWFibGVQb3NpdGlvbiA9IHZhbHVlID0+IGdldElzQXJiaXRyYXJ5VmFyaWFibGUodmFsdWUsIGlzTGFiZWxQb3NpdGlvbik7XG5jb25zdCBpc0FyYml0cmFyeVZhcmlhYmxlU2l6ZSA9IHZhbHVlID0+IGdldElzQXJiaXRyYXJ5VmFyaWFibGUodmFsdWUsIGlzTGFiZWxTaXplKTtcbmNvbnN0IGlzQXJiaXRyYXJ5VmFyaWFibGVJbWFnZSA9IHZhbHVlID0+IGdldElzQXJiaXRyYXJ5VmFyaWFibGUodmFsdWUsIGlzTGFiZWxJbWFnZSk7XG5jb25zdCBpc0FyYml0cmFyeVZhcmlhYmxlU2hhZG93ID0gdmFsdWUgPT4gZ2V0SXNBcmJpdHJhcnlWYXJpYWJsZSh2YWx1ZSwgaXNMYWJlbFNoYWRvdywgdHJ1ZSk7XG4vLyBIZWxwZXJzXG5jb25zdCBnZXRJc0FyYml0cmFyeVZhbHVlID0gKHZhbHVlLCB0ZXN0TGFiZWwsIHRlc3RWYWx1ZSkgPT4ge1xuICBjb25zdCByZXN1bHQgPSBhcmJpdHJhcnlWYWx1ZVJlZ2V4LmV4ZWModmFsdWUpO1xuICBpZiAocmVzdWx0KSB7XG4gICAgaWYgKHJlc3VsdFsxXSkge1xuICAgICAgcmV0dXJuIHRlc3RMYWJlbChyZXN1bHRbMV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGVzdFZhbHVlKHJlc3VsdFsyXSk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcbmNvbnN0IGdldElzQXJiaXRyYXJ5VmFyaWFibGUgPSAodmFsdWUsIHRlc3RMYWJlbCwgc2hvdWxkTWF0Y2hOb0xhYmVsID0gZmFsc2UpID0+IHtcbiAgY29uc3QgcmVzdWx0ID0gYXJiaXRyYXJ5VmFyaWFibGVSZWdleC5leGVjKHZhbHVlKTtcbiAgaWYgKHJlc3VsdCkge1xuICAgIGlmIChyZXN1bHRbMV0pIHtcbiAgICAgIHJldHVybiB0ZXN0TGFiZWwocmVzdWx0WzFdKTtcbiAgICB9XG4gICAgcmV0dXJuIHNob3VsZE1hdGNoTm9MYWJlbDtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuLy8gTGFiZWxzXG5jb25zdCBpc0xhYmVsUG9zaXRpb24gPSBsYWJlbCA9PiBsYWJlbCA9PT0gJ3Bvc2l0aW9uJyB8fCBsYWJlbCA9PT0gJ3BlcmNlbnRhZ2UnO1xuY29uc3QgaXNMYWJlbEltYWdlID0gbGFiZWwgPT4gbGFiZWwgPT09ICdpbWFnZScgfHwgbGFiZWwgPT09ICd1cmwnO1xuY29uc3QgaXNMYWJlbFNpemUgPSBsYWJlbCA9PiBsYWJlbCA9PT0gJ2xlbmd0aCcgfHwgbGFiZWwgPT09ICdzaXplJyB8fCBsYWJlbCA9PT0gJ2JnLXNpemUnO1xuY29uc3QgaXNMYWJlbExlbmd0aCA9IGxhYmVsID0+IGxhYmVsID09PSAnbGVuZ3RoJztcbmNvbnN0IGlzTGFiZWxOdW1iZXIgPSBsYWJlbCA9PiBsYWJlbCA9PT0gJ251bWJlcic7XG5jb25zdCBpc0xhYmVsRmFtaWx5TmFtZSA9IGxhYmVsID0+IGxhYmVsID09PSAnZmFtaWx5LW5hbWUnO1xuY29uc3QgaXNMYWJlbFNoYWRvdyA9IGxhYmVsID0+IGxhYmVsID09PSAnc2hhZG93JztcbmNvbnN0IHZhbGlkYXRvcnMgPSAvKiNfX1BVUkVfXyovT2JqZWN0LmRlZmluZVByb3BlcnR5KHtcbiAgX19wcm90b19fOiBudWxsLFxuICBpc0FueSxcbiAgaXNBbnlOb25BcmJpdHJhcnksXG4gIGlzQXJiaXRyYXJ5SW1hZ2UsXG4gIGlzQXJiaXRyYXJ5TGVuZ3RoLFxuICBpc0FyYml0cmFyeU51bWJlcixcbiAgaXNBcmJpdHJhcnlQb3NpdGlvbixcbiAgaXNBcmJpdHJhcnlTaGFkb3csXG4gIGlzQXJiaXRyYXJ5U2l6ZSxcbiAgaXNBcmJpdHJhcnlWYWx1ZSxcbiAgaXNBcmJpdHJhcnlWYXJpYWJsZSxcbiAgaXNBcmJpdHJhcnlWYXJpYWJsZUZhbWlseU5hbWUsXG4gIGlzQXJiaXRyYXJ5VmFyaWFibGVJbWFnZSxcbiAgaXNBcmJpdHJhcnlWYXJpYWJsZUxlbmd0aCxcbiAgaXNBcmJpdHJhcnlWYXJpYWJsZVBvc2l0aW9uLFxuICBpc0FyYml0cmFyeVZhcmlhYmxlU2hhZG93LFxuICBpc0FyYml0cmFyeVZhcmlhYmxlU2l6ZSxcbiAgaXNGcmFjdGlvbixcbiAgaXNJbnRlZ2VyLFxuICBpc051bWJlcixcbiAgaXNQZXJjZW50LFxuICBpc1RzaGlydFNpemVcbn0sIFN5bWJvbC50b1N0cmluZ1RhZywge1xuICB2YWx1ZTogJ01vZHVsZSdcbn0pO1xuY29uc3QgZ2V0RGVmYXVsdENvbmZpZyA9ICgpID0+IHtcbiAgLyoqXG4gICAqIFRoZW1lIGdldHRlcnMgZm9yIHRoZW1lIHZhcmlhYmxlIG5hbWVzcGFjZXNcbiAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RoZW1lI3RoZW1lLXZhcmlhYmxlLW5hbWVzcGFjZXNcbiAgICovXG4gIC8qKiovXG4gIGNvbnN0IHRoZW1lQ29sb3IgPSBmcm9tVGhlbWUoJ2NvbG9yJyk7XG4gIGNvbnN0IHRoZW1lRm9udCA9IGZyb21UaGVtZSgnZm9udCcpO1xuICBjb25zdCB0aGVtZVRleHQgPSBmcm9tVGhlbWUoJ3RleHQnKTtcbiAgY29uc3QgdGhlbWVGb250V2VpZ2h0ID0gZnJvbVRoZW1lKCdmb250LXdlaWdodCcpO1xuICBjb25zdCB0aGVtZVRyYWNraW5nID0gZnJvbVRoZW1lKCd0cmFja2luZycpO1xuICBjb25zdCB0aGVtZUxlYWRpbmcgPSBmcm9tVGhlbWUoJ2xlYWRpbmcnKTtcbiAgY29uc3QgdGhlbWVCcmVha3BvaW50ID0gZnJvbVRoZW1lKCdicmVha3BvaW50Jyk7XG4gIGNvbnN0IHRoZW1lQ29udGFpbmVyID0gZnJvbVRoZW1lKCdjb250YWluZXInKTtcbiAgY29uc3QgdGhlbWVTcGFjaW5nID0gZnJvbVRoZW1lKCdzcGFjaW5nJyk7XG4gIGNvbnN0IHRoZW1lUmFkaXVzID0gZnJvbVRoZW1lKCdyYWRpdXMnKTtcbiAgY29uc3QgdGhlbWVTaGFkb3cgPSBmcm9tVGhlbWUoJ3NoYWRvdycpO1xuICBjb25zdCB0aGVtZUluc2V0U2hhZG93ID0gZnJvbVRoZW1lKCdpbnNldC1zaGFkb3cnKTtcbiAgY29uc3QgdGhlbWVUZXh0U2hhZG93ID0gZnJvbVRoZW1lKCd0ZXh0LXNoYWRvdycpO1xuICBjb25zdCB0aGVtZURyb3BTaGFkb3cgPSBmcm9tVGhlbWUoJ2Ryb3Atc2hhZG93Jyk7XG4gIGNvbnN0IHRoZW1lQmx1ciA9IGZyb21UaGVtZSgnYmx1cicpO1xuICBjb25zdCB0aGVtZVBlcnNwZWN0aXZlID0gZnJvbVRoZW1lKCdwZXJzcGVjdGl2ZScpO1xuICBjb25zdCB0aGVtZUFzcGVjdCA9IGZyb21UaGVtZSgnYXNwZWN0Jyk7XG4gIGNvbnN0IHRoZW1lRWFzZSA9IGZyb21UaGVtZSgnZWFzZScpO1xuICBjb25zdCB0aGVtZUFuaW1hdGUgPSBmcm9tVGhlbWUoJ2FuaW1hdGUnKTtcbiAgLyoqXG4gICAqIEhlbHBlcnMgdG8gYXZvaWQgcmVwZWF0aW5nIHRoZSBzYW1lIHNjYWxlc1xuICAgKlxuICAgKiBXZSB1c2UgZnVuY3Rpb25zIHRoYXQgY3JlYXRlIGEgbmV3IGFycmF5IGV2ZXJ5IHRpbWUgdGhleSdyZSBjYWxsZWQgaW5zdGVhZCBvZiBzdGF0aWMgYXJyYXlzLlxuICAgKiBUaGlzIGVuc3VyZXMgdGhhdCB1c2VycyB3aG8gbW9kaWZ5IGFueSBzY2FsZSBieSBtdXRhdGluZyB0aGUgYXJyYXkgKGUuZy4gd2l0aCBgYXJyYXkucHVzaChlbGVtZW50KWApIGRvbid0IGFjY2lkZW50YWxseSBtdXRhdGUgYXJyYXlzIGluIG90aGVyIHBhcnRzIG9mIHRoZSBjb25maWcuXG4gICAqL1xuICAvKioqL1xuICBjb25zdCBzY2FsZUJyZWFrID0gKCkgPT4gWydhdXRvJywgJ2F2b2lkJywgJ2FsbCcsICdhdm9pZC1wYWdlJywgJ3BhZ2UnLCAnbGVmdCcsICdyaWdodCcsICdjb2x1bW4nXTtcbiAgY29uc3Qgc2NhbGVQb3NpdGlvbiA9ICgpID0+IFsnY2VudGVyJywgJ3RvcCcsICdib3R0b20nLCAnbGVmdCcsICdyaWdodCcsICd0b3AtbGVmdCcsXG4gIC8vIERlcHJlY2F0ZWQgc2luY2UgVGFpbHdpbmQgQ1NTIHY0LjEuMCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS90YWlsd2luZGxhYnMvdGFpbHdpbmRjc3MvcHVsbC8xNzM3OFxuICAnbGVmdC10b3AnLCAndG9wLXJpZ2h0JyxcbiAgLy8gRGVwcmVjYXRlZCBzaW5jZSBUYWlsd2luZCBDU1MgdjQuMS4wLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3RhaWx3aW5kbGFicy90YWlsd2luZGNzcy9wdWxsLzE3Mzc4XG4gICdyaWdodC10b3AnLCAnYm90dG9tLXJpZ2h0JyxcbiAgLy8gRGVwcmVjYXRlZCBzaW5jZSBUYWlsd2luZCBDU1MgdjQuMS4wLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3RhaWx3aW5kbGFicy90YWlsd2luZGNzcy9wdWxsLzE3Mzc4XG4gICdyaWdodC1ib3R0b20nLCAnYm90dG9tLWxlZnQnLFxuICAvLyBEZXByZWNhdGVkIHNpbmNlIFRhaWx3aW5kIENTUyB2NC4xLjAsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vdGFpbHdpbmRsYWJzL3RhaWx3aW5kY3NzL3B1bGwvMTczNzhcbiAgJ2xlZnQtYm90dG9tJ107XG4gIGNvbnN0IHNjYWxlUG9zaXRpb25XaXRoQXJiaXRyYXJ5ID0gKCkgPT4gWy4uLnNjYWxlUG9zaXRpb24oKSwgaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlWYWx1ZV07XG4gIGNvbnN0IHNjYWxlT3ZlcmZsb3cgPSAoKSA9PiBbJ2F1dG8nLCAnaGlkZGVuJywgJ2NsaXAnLCAndmlzaWJsZScsICdzY3JvbGwnXTtcbiAgY29uc3Qgc2NhbGVPdmVyc2Nyb2xsID0gKCkgPT4gWydhdXRvJywgJ2NvbnRhaW4nLCAnbm9uZSddO1xuICBjb25zdCBzY2FsZVVuYW1iaWd1b3VzU3BhY2luZyA9ICgpID0+IFtpc0FyYml0cmFyeVZhcmlhYmxlLCBpc0FyYml0cmFyeVZhbHVlLCB0aGVtZVNwYWNpbmddO1xuICBjb25zdCBzY2FsZUluc2V0ID0gKCkgPT4gW2lzRnJhY3Rpb24sICdmdWxsJywgJ2F1dG8nLCAuLi5zY2FsZVVuYW1iaWd1b3VzU3BhY2luZygpXTtcbiAgY29uc3Qgc2NhbGVHcmlkVGVtcGxhdGVDb2xzUm93cyA9ICgpID0+IFtpc0ludGVnZXIsICdub25lJywgJ3N1YmdyaWQnLCBpc0FyYml0cmFyeVZhcmlhYmxlLCBpc0FyYml0cmFyeVZhbHVlXTtcbiAgY29uc3Qgc2NhbGVHcmlkQ29sUm93U3RhcnRBbmRFbmQgPSAoKSA9PiBbJ2F1dG8nLCB7XG4gICAgc3BhbjogWydmdWxsJywgaXNJbnRlZ2VyLCBpc0FyYml0cmFyeVZhcmlhYmxlLCBpc0FyYml0cmFyeVZhbHVlXVxuICB9LCBpc0ludGVnZXIsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdO1xuICBjb25zdCBzY2FsZUdyaWRDb2xSb3dTdGFydE9yRW5kID0gKCkgPT4gW2lzSW50ZWdlciwgJ2F1dG8nLCBpc0FyYml0cmFyeVZhcmlhYmxlLCBpc0FyYml0cmFyeVZhbHVlXTtcbiAgY29uc3Qgc2NhbGVHcmlkQXV0b0NvbHNSb3dzID0gKCkgPT4gWydhdXRvJywgJ21pbicsICdtYXgnLCAnZnInLCBpc0FyYml0cmFyeVZhcmlhYmxlLCBpc0FyYml0cmFyeVZhbHVlXTtcbiAgY29uc3Qgc2NhbGVBbGlnblByaW1hcnlBeGlzID0gKCkgPT4gWydzdGFydCcsICdlbmQnLCAnY2VudGVyJywgJ2JldHdlZW4nLCAnYXJvdW5kJywgJ2V2ZW5seScsICdzdHJldGNoJywgJ2Jhc2VsaW5lJywgJ2NlbnRlci1zYWZlJywgJ2VuZC1zYWZlJ107XG4gIGNvbnN0IHNjYWxlQWxpZ25TZWNvbmRhcnlBeGlzID0gKCkgPT4gWydzdGFydCcsICdlbmQnLCAnY2VudGVyJywgJ3N0cmV0Y2gnLCAnY2VudGVyLXNhZmUnLCAnZW5kLXNhZmUnXTtcbiAgY29uc3Qgc2NhbGVNYXJnaW4gPSAoKSA9PiBbJ2F1dG8nLCAuLi5zY2FsZVVuYW1iaWd1b3VzU3BhY2luZygpXTtcbiAgY29uc3Qgc2NhbGVTaXppbmcgPSAoKSA9PiBbaXNGcmFjdGlvbiwgJ2F1dG8nLCAnZnVsbCcsICdkdncnLCAnZHZoJywgJ2x2dycsICdsdmgnLCAnc3Z3JywgJ3N2aCcsICdtaW4nLCAnbWF4JywgJ2ZpdCcsIC4uLnNjYWxlVW5hbWJpZ3VvdXNTcGFjaW5nKCldO1xuICBjb25zdCBzY2FsZUNvbG9yID0gKCkgPT4gW3RoZW1lQ29sb3IsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdO1xuICBjb25zdCBzY2FsZUJnUG9zaXRpb24gPSAoKSA9PiBbLi4uc2NhbGVQb3NpdGlvbigpLCBpc0FyYml0cmFyeVZhcmlhYmxlUG9zaXRpb24sIGlzQXJiaXRyYXJ5UG9zaXRpb24sIHtcbiAgICBwb3NpdGlvbjogW2lzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdXG4gIH1dO1xuICBjb25zdCBzY2FsZUJnUmVwZWF0ID0gKCkgPT4gWyduby1yZXBlYXQnLCB7XG4gICAgcmVwZWF0OiBbJycsICd4JywgJ3knLCAnc3BhY2UnLCAncm91bmQnXVxuICB9XTtcbiAgY29uc3Qgc2NhbGVCZ1NpemUgPSAoKSA9PiBbJ2F1dG8nLCAnY292ZXInLCAnY29udGFpbicsIGlzQXJiaXRyYXJ5VmFyaWFibGVTaXplLCBpc0FyYml0cmFyeVNpemUsIHtcbiAgICBzaXplOiBbaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlWYWx1ZV1cbiAgfV07XG4gIGNvbnN0IHNjYWxlR3JhZGllbnRTdG9wUG9zaXRpb24gPSAoKSA9PiBbaXNQZXJjZW50LCBpc0FyYml0cmFyeVZhcmlhYmxlTGVuZ3RoLCBpc0FyYml0cmFyeUxlbmd0aF07XG4gIGNvbnN0IHNjYWxlUmFkaXVzID0gKCkgPT4gW1xuICAvLyBEZXByZWNhdGVkIHNpbmNlIFRhaWx3aW5kIENTUyB2NC4wLjBcbiAgJycsICdub25lJywgJ2Z1bGwnLCB0aGVtZVJhZGl1cywgaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlWYWx1ZV07XG4gIGNvbnN0IHNjYWxlQm9yZGVyV2lkdGggPSAoKSA9PiBbJycsIGlzTnVtYmVyLCBpc0FyYml0cmFyeVZhcmlhYmxlTGVuZ3RoLCBpc0FyYml0cmFyeUxlbmd0aF07XG4gIGNvbnN0IHNjYWxlTGluZVN0eWxlID0gKCkgPT4gWydzb2xpZCcsICdkYXNoZWQnLCAnZG90dGVkJywgJ2RvdWJsZSddO1xuICBjb25zdCBzY2FsZUJsZW5kTW9kZSA9ICgpID0+IFsnbm9ybWFsJywgJ211bHRpcGx5JywgJ3NjcmVlbicsICdvdmVybGF5JywgJ2RhcmtlbicsICdsaWdodGVuJywgJ2NvbG9yLWRvZGdlJywgJ2NvbG9yLWJ1cm4nLCAnaGFyZC1saWdodCcsICdzb2Z0LWxpZ2h0JywgJ2RpZmZlcmVuY2UnLCAnZXhjbHVzaW9uJywgJ2h1ZScsICdzYXR1cmF0aW9uJywgJ2NvbG9yJywgJ2x1bWlub3NpdHknXTtcbiAgY29uc3Qgc2NhbGVNYXNrSW1hZ2VQb3NpdGlvbiA9ICgpID0+IFtpc051bWJlciwgaXNQZXJjZW50LCBpc0FyYml0cmFyeVZhcmlhYmxlUG9zaXRpb24sIGlzQXJiaXRyYXJ5UG9zaXRpb25dO1xuICBjb25zdCBzY2FsZUJsdXIgPSAoKSA9PiBbXG4gIC8vIERlcHJlY2F0ZWQgc2luY2UgVGFpbHdpbmQgQ1NTIHY0LjAuMFxuICAnJywgJ25vbmUnLCB0aGVtZUJsdXIsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdO1xuICBjb25zdCBzY2FsZVJvdGF0ZSA9ICgpID0+IFsnbm9uZScsIGlzTnVtYmVyLCBpc0FyYml0cmFyeVZhcmlhYmxlLCBpc0FyYml0cmFyeVZhbHVlXTtcbiAgY29uc3Qgc2NhbGVTY2FsZSA9ICgpID0+IFsnbm9uZScsIGlzTnVtYmVyLCBpc0FyYml0cmFyeVZhcmlhYmxlLCBpc0FyYml0cmFyeVZhbHVlXTtcbiAgY29uc3Qgc2NhbGVTa2V3ID0gKCkgPT4gW2lzTnVtYmVyLCBpc0FyYml0cmFyeVZhcmlhYmxlLCBpc0FyYml0cmFyeVZhbHVlXTtcbiAgY29uc3Qgc2NhbGVUcmFuc2xhdGUgPSAoKSA9PiBbaXNGcmFjdGlvbiwgJ2Z1bGwnLCAuLi5zY2FsZVVuYW1iaWd1b3VzU3BhY2luZygpXTtcbiAgcmV0dXJuIHtcbiAgICBjYWNoZVNpemU6IDUwMCxcbiAgICB0aGVtZToge1xuICAgICAgYW5pbWF0ZTogWydzcGluJywgJ3BpbmcnLCAncHVsc2UnLCAnYm91bmNlJ10sXG4gICAgICBhc3BlY3Q6IFsndmlkZW8nXSxcbiAgICAgIGJsdXI6IFtpc1RzaGlydFNpemVdLFxuICAgICAgYnJlYWtwb2ludDogW2lzVHNoaXJ0U2l6ZV0sXG4gICAgICBjb2xvcjogW2lzQW55XSxcbiAgICAgIGNvbnRhaW5lcjogW2lzVHNoaXJ0U2l6ZV0sXG4gICAgICAnZHJvcC1zaGFkb3cnOiBbaXNUc2hpcnRTaXplXSxcbiAgICAgIGVhc2U6IFsnaW4nLCAnb3V0JywgJ2luLW91dCddLFxuICAgICAgZm9udDogW2lzQW55Tm9uQXJiaXRyYXJ5XSxcbiAgICAgICdmb250LXdlaWdodCc6IFsndGhpbicsICdleHRyYWxpZ2h0JywgJ2xpZ2h0JywgJ25vcm1hbCcsICdtZWRpdW0nLCAnc2VtaWJvbGQnLCAnYm9sZCcsICdleHRyYWJvbGQnLCAnYmxhY2snXSxcbiAgICAgICdpbnNldC1zaGFkb3cnOiBbaXNUc2hpcnRTaXplXSxcbiAgICAgIGxlYWRpbmc6IFsnbm9uZScsICd0aWdodCcsICdzbnVnJywgJ25vcm1hbCcsICdyZWxheGVkJywgJ2xvb3NlJ10sXG4gICAgICBwZXJzcGVjdGl2ZTogWydkcmFtYXRpYycsICduZWFyJywgJ25vcm1hbCcsICdtaWRyYW5nZScsICdkaXN0YW50JywgJ25vbmUnXSxcbiAgICAgIHJhZGl1czogW2lzVHNoaXJ0U2l6ZV0sXG4gICAgICBzaGFkb3c6IFtpc1RzaGlydFNpemVdLFxuICAgICAgc3BhY2luZzogWydweCcsIGlzTnVtYmVyXSxcbiAgICAgIHRleHQ6IFtpc1RzaGlydFNpemVdLFxuICAgICAgJ3RleHQtc2hhZG93JzogW2lzVHNoaXJ0U2l6ZV0sXG4gICAgICB0cmFja2luZzogWyd0aWdodGVyJywgJ3RpZ2h0JywgJ25vcm1hbCcsICd3aWRlJywgJ3dpZGVyJywgJ3dpZGVzdCddXG4gICAgfSxcbiAgICBjbGFzc0dyb3Vwczoge1xuICAgICAgLy8gLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIC0tLSBMYXlvdXQgLS0tXG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLVxuICAgICAgLyoqXG4gICAgICAgKiBBc3BlY3QgUmF0aW9cbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9hc3BlY3QtcmF0aW9cbiAgICAgICAqL1xuICAgICAgYXNwZWN0OiBbe1xuICAgICAgICBhc3BlY3Q6IFsnYXV0bycsICdzcXVhcmUnLCBpc0ZyYWN0aW9uLCBpc0FyYml0cmFyeVZhbHVlLCBpc0FyYml0cmFyeVZhcmlhYmxlLCB0aGVtZUFzcGVjdF1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBDb250YWluZXJcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9jb250YWluZXJcbiAgICAgICAqIEBkZXByZWNhdGVkIHNpbmNlIFRhaWx3aW5kIENTUyB2NC4wLjBcbiAgICAgICAqL1xuICAgICAgY29udGFpbmVyOiBbJ2NvbnRhaW5lciddLFxuICAgICAgLyoqXG4gICAgICAgKiBDb2x1bW5zXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvY29sdW1uc1xuICAgICAgICovXG4gICAgICBjb2x1bW5zOiBbe1xuICAgICAgICBjb2x1bW5zOiBbaXNOdW1iZXIsIGlzQXJiaXRyYXJ5VmFsdWUsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIHRoZW1lQ29udGFpbmVyXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJyZWFrIEFmdGVyXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYnJlYWstYWZ0ZXJcbiAgICAgICAqL1xuICAgICAgJ2JyZWFrLWFmdGVyJzogW3tcbiAgICAgICAgJ2JyZWFrLWFmdGVyJzogc2NhbGVCcmVhaygpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQnJlYWsgQmVmb3JlXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYnJlYWstYmVmb3JlXG4gICAgICAgKi9cbiAgICAgICdicmVhay1iZWZvcmUnOiBbe1xuICAgICAgICAnYnJlYWstYmVmb3JlJzogc2NhbGVCcmVhaygpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQnJlYWsgSW5zaWRlXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYnJlYWstaW5zaWRlXG4gICAgICAgKi9cbiAgICAgICdicmVhay1pbnNpZGUnOiBbe1xuICAgICAgICAnYnJlYWstaW5zaWRlJzogWydhdXRvJywgJ2F2b2lkJywgJ2F2b2lkLXBhZ2UnLCAnYXZvaWQtY29sdW1uJ11cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBCb3ggRGVjb3JhdGlvbiBCcmVha1xuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JveC1kZWNvcmF0aW9uLWJyZWFrXG4gICAgICAgKi9cbiAgICAgICdib3gtZGVjb3JhdGlvbic6IFt7XG4gICAgICAgICdib3gtZGVjb3JhdGlvbic6IFsnc2xpY2UnLCAnY2xvbmUnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJveCBTaXppbmdcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ib3gtc2l6aW5nXG4gICAgICAgKi9cbiAgICAgIGJveDogW3tcbiAgICAgICAgYm94OiBbJ2JvcmRlcicsICdjb250ZW50J11cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBEaXNwbGF5XG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvZGlzcGxheVxuICAgICAgICovXG4gICAgICBkaXNwbGF5OiBbJ2Jsb2NrJywgJ2lubGluZS1ibG9jaycsICdpbmxpbmUnLCAnZmxleCcsICdpbmxpbmUtZmxleCcsICd0YWJsZScsICdpbmxpbmUtdGFibGUnLCAndGFibGUtY2FwdGlvbicsICd0YWJsZS1jZWxsJywgJ3RhYmxlLWNvbHVtbicsICd0YWJsZS1jb2x1bW4tZ3JvdXAnLCAndGFibGUtZm9vdGVyLWdyb3VwJywgJ3RhYmxlLWhlYWRlci1ncm91cCcsICd0YWJsZS1yb3ctZ3JvdXAnLCAndGFibGUtcm93JywgJ2Zsb3ctcm9vdCcsICdncmlkJywgJ2lubGluZS1ncmlkJywgJ2NvbnRlbnRzJywgJ2xpc3QtaXRlbScsICdoaWRkZW4nXSxcbiAgICAgIC8qKlxuICAgICAgICogU2NyZWVuIFJlYWRlciBPbmx5XG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvZGlzcGxheSNzY3JlZW4tcmVhZGVyLW9ubHlcbiAgICAgICAqL1xuICAgICAgc3I6IFsnc3Itb25seScsICdub3Qtc3Itb25seSddLFxuICAgICAgLyoqXG4gICAgICAgKiBGbG9hdHNcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9mbG9hdFxuICAgICAgICovXG4gICAgICBmbG9hdDogW3tcbiAgICAgICAgZmxvYXQ6IFsncmlnaHQnLCAnbGVmdCcsICdub25lJywgJ3N0YXJ0JywgJ2VuZCddXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQ2xlYXJcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9jbGVhclxuICAgICAgICovXG4gICAgICBjbGVhcjogW3tcbiAgICAgICAgY2xlYXI6IFsnbGVmdCcsICdyaWdodCcsICdib3RoJywgJ25vbmUnLCAnc3RhcnQnLCAnZW5kJ11cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBJc29sYXRpb25cbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9pc29sYXRpb25cbiAgICAgICAqL1xuICAgICAgaXNvbGF0aW9uOiBbJ2lzb2xhdGUnLCAnaXNvbGF0aW9uLWF1dG8nXSxcbiAgICAgIC8qKlxuICAgICAgICogT2JqZWN0IEZpdFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL29iamVjdC1maXRcbiAgICAgICAqL1xuICAgICAgJ29iamVjdC1maXQnOiBbe1xuICAgICAgICBvYmplY3Q6IFsnY29udGFpbicsICdjb3ZlcicsICdmaWxsJywgJ25vbmUnLCAnc2NhbGUtZG93biddXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogT2JqZWN0IFBvc2l0aW9uXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3Mvb2JqZWN0LXBvc2l0aW9uXG4gICAgICAgKi9cbiAgICAgICdvYmplY3QtcG9zaXRpb24nOiBbe1xuICAgICAgICBvYmplY3Q6IHNjYWxlUG9zaXRpb25XaXRoQXJiaXRyYXJ5KClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBPdmVyZmxvd1xuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL292ZXJmbG93XG4gICAgICAgKi9cbiAgICAgIG92ZXJmbG93OiBbe1xuICAgICAgICBvdmVyZmxvdzogc2NhbGVPdmVyZmxvdygpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogT3ZlcmZsb3cgWFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL292ZXJmbG93XG4gICAgICAgKi9cbiAgICAgICdvdmVyZmxvdy14JzogW3tcbiAgICAgICAgJ292ZXJmbG93LXgnOiBzY2FsZU92ZXJmbG93KClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBPdmVyZmxvdyBZXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3Mvb3ZlcmZsb3dcbiAgICAgICAqL1xuICAgICAgJ292ZXJmbG93LXknOiBbe1xuICAgICAgICAnb3ZlcmZsb3cteSc6IHNjYWxlT3ZlcmZsb3coKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIE92ZXJzY3JvbGwgQmVoYXZpb3JcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9vdmVyc2Nyb2xsLWJlaGF2aW9yXG4gICAgICAgKi9cbiAgICAgIG92ZXJzY3JvbGw6IFt7XG4gICAgICAgIG92ZXJzY3JvbGw6IHNjYWxlT3ZlcnNjcm9sbCgpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogT3ZlcnNjcm9sbCBCZWhhdmlvciBYXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3Mvb3ZlcnNjcm9sbC1iZWhhdmlvclxuICAgICAgICovXG4gICAgICAnb3ZlcnNjcm9sbC14JzogW3tcbiAgICAgICAgJ292ZXJzY3JvbGwteCc6IHNjYWxlT3ZlcnNjcm9sbCgpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogT3ZlcnNjcm9sbCBCZWhhdmlvciBZXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3Mvb3ZlcnNjcm9sbC1iZWhhdmlvclxuICAgICAgICovXG4gICAgICAnb3ZlcnNjcm9sbC15JzogW3tcbiAgICAgICAgJ292ZXJzY3JvbGwteSc6IHNjYWxlT3ZlcnNjcm9sbCgpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogUG9zaXRpb25cbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9wb3NpdGlvblxuICAgICAgICovXG4gICAgICBwb3NpdGlvbjogWydzdGF0aWMnLCAnZml4ZWQnLCAnYWJzb2x1dGUnLCAncmVsYXRpdmUnLCAnc3RpY2t5J10sXG4gICAgICAvKipcbiAgICAgICAqIFRvcCAvIFJpZ2h0IC8gQm90dG9tIC8gTGVmdFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RvcC1yaWdodC1ib3R0b20tbGVmdFxuICAgICAgICovXG4gICAgICBpbnNldDogW3tcbiAgICAgICAgaW5zZXQ6IHNjYWxlSW5zZXQoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFJpZ2h0IC8gTGVmdFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RvcC1yaWdodC1ib3R0b20tbGVmdFxuICAgICAgICovXG4gICAgICAnaW5zZXQteCc6IFt7XG4gICAgICAgICdpbnNldC14Jzogc2NhbGVJbnNldCgpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogVG9wIC8gQm90dG9tXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvdG9wLXJpZ2h0LWJvdHRvbS1sZWZ0XG4gICAgICAgKi9cbiAgICAgICdpbnNldC15JzogW3tcbiAgICAgICAgJ2luc2V0LXknOiBzY2FsZUluc2V0KClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBTdGFydFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RvcC1yaWdodC1ib3R0b20tbGVmdFxuICAgICAgICovXG4gICAgICBzdGFydDogW3tcbiAgICAgICAgc3RhcnQ6IHNjYWxlSW5zZXQoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEVuZFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RvcC1yaWdodC1ib3R0b20tbGVmdFxuICAgICAgICovXG4gICAgICBlbmQ6IFt7XG4gICAgICAgIGVuZDogc2NhbGVJbnNldCgpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogVG9wXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvdG9wLXJpZ2h0LWJvdHRvbS1sZWZ0XG4gICAgICAgKi9cbiAgICAgIHRvcDogW3tcbiAgICAgICAgdG9wOiBzY2FsZUluc2V0KClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBSaWdodFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RvcC1yaWdodC1ib3R0b20tbGVmdFxuICAgICAgICovXG4gICAgICByaWdodDogW3tcbiAgICAgICAgcmlnaHQ6IHNjYWxlSW5zZXQoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJvdHRvbVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RvcC1yaWdodC1ib3R0b20tbGVmdFxuICAgICAgICovXG4gICAgICBib3R0b206IFt7XG4gICAgICAgIGJvdHRvbTogc2NhbGVJbnNldCgpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogTGVmdFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RvcC1yaWdodC1ib3R0b20tbGVmdFxuICAgICAgICovXG4gICAgICBsZWZ0OiBbe1xuICAgICAgICBsZWZ0OiBzY2FsZUluc2V0KClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBWaXNpYmlsaXR5XG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvdmlzaWJpbGl0eVxuICAgICAgICovXG4gICAgICB2aXNpYmlsaXR5OiBbJ3Zpc2libGUnLCAnaW52aXNpYmxlJywgJ2NvbGxhcHNlJ10sXG4gICAgICAvKipcbiAgICAgICAqIFotSW5kZXhcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy96LWluZGV4XG4gICAgICAgKi9cbiAgICAgIHo6IFt7XG4gICAgICAgIHo6IFtpc0ludGVnZXIsICdhdXRvJywgaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlWYWx1ZV1cbiAgICAgIH1dLFxuICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyAtLS0gRmxleGJveCBhbmQgR3JpZCAtLS1cbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLyoqXG4gICAgICAgKiBGbGV4IEJhc2lzXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvZmxleC1iYXNpc1xuICAgICAgICovXG4gICAgICBiYXNpczogW3tcbiAgICAgICAgYmFzaXM6IFtpc0ZyYWN0aW9uLCAnZnVsbCcsICdhdXRvJywgdGhlbWVDb250YWluZXIsIC4uLnNjYWxlVW5hbWJpZ3VvdXNTcGFjaW5nKCldXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogRmxleCBEaXJlY3Rpb25cbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9mbGV4LWRpcmVjdGlvblxuICAgICAgICovXG4gICAgICAnZmxleC1kaXJlY3Rpb24nOiBbe1xuICAgICAgICBmbGV4OiBbJ3JvdycsICdyb3ctcmV2ZXJzZScsICdjb2wnLCAnY29sLXJldmVyc2UnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEZsZXggV3JhcFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2ZsZXgtd3JhcFxuICAgICAgICovXG4gICAgICAnZmxleC13cmFwJzogW3tcbiAgICAgICAgZmxleDogWydub3dyYXAnLCAnd3JhcCcsICd3cmFwLXJldmVyc2UnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEZsZXhcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9mbGV4XG4gICAgICAgKi9cbiAgICAgIGZsZXg6IFt7XG4gICAgICAgIGZsZXg6IFtpc051bWJlciwgaXNGcmFjdGlvbiwgJ2F1dG8nLCAnaW5pdGlhbCcsICdub25lJywgaXNBcmJpdHJhcnlWYWx1ZV1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBGbGV4IEdyb3dcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9mbGV4LWdyb3dcbiAgICAgICAqL1xuICAgICAgZ3JvdzogW3tcbiAgICAgICAgZ3JvdzogWycnLCBpc051bWJlciwgaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlWYWx1ZV1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBGbGV4IFNocmlua1xuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2ZsZXgtc2hyaW5rXG4gICAgICAgKi9cbiAgICAgIHNocmluazogW3tcbiAgICAgICAgc2hyaW5rOiBbJycsIGlzTnVtYmVyLCBpc0FyYml0cmFyeVZhcmlhYmxlLCBpc0FyYml0cmFyeVZhbHVlXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIE9yZGVyXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3Mvb3JkZXJcbiAgICAgICAqL1xuICAgICAgb3JkZXI6IFt7XG4gICAgICAgIG9yZGVyOiBbaXNJbnRlZ2VyLCAnZmlyc3QnLCAnbGFzdCcsICdub25lJywgaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlWYWx1ZV1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBHcmlkIFRlbXBsYXRlIENvbHVtbnNcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ncmlkLXRlbXBsYXRlLWNvbHVtbnNcbiAgICAgICAqL1xuICAgICAgJ2dyaWQtY29scyc6IFt7XG4gICAgICAgICdncmlkLWNvbHMnOiBzY2FsZUdyaWRUZW1wbGF0ZUNvbHNSb3dzKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBHcmlkIENvbHVtbiBTdGFydCAvIEVuZFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2dyaWQtY29sdW1uXG4gICAgICAgKi9cbiAgICAgICdjb2wtc3RhcnQtZW5kJzogW3tcbiAgICAgICAgY29sOiBzY2FsZUdyaWRDb2xSb3dTdGFydEFuZEVuZCgpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogR3JpZCBDb2x1bW4gU3RhcnRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ncmlkLWNvbHVtblxuICAgICAgICovXG4gICAgICAnY29sLXN0YXJ0JzogW3tcbiAgICAgICAgJ2NvbC1zdGFydCc6IHNjYWxlR3JpZENvbFJvd1N0YXJ0T3JFbmQoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEdyaWQgQ29sdW1uIEVuZFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2dyaWQtY29sdW1uXG4gICAgICAgKi9cbiAgICAgICdjb2wtZW5kJzogW3tcbiAgICAgICAgJ2NvbC1lbmQnOiBzY2FsZUdyaWRDb2xSb3dTdGFydE9yRW5kKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBHcmlkIFRlbXBsYXRlIFJvd3NcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ncmlkLXRlbXBsYXRlLXJvd3NcbiAgICAgICAqL1xuICAgICAgJ2dyaWQtcm93cyc6IFt7XG4gICAgICAgICdncmlkLXJvd3MnOiBzY2FsZUdyaWRUZW1wbGF0ZUNvbHNSb3dzKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBHcmlkIFJvdyBTdGFydCAvIEVuZFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2dyaWQtcm93XG4gICAgICAgKi9cbiAgICAgICdyb3ctc3RhcnQtZW5kJzogW3tcbiAgICAgICAgcm93OiBzY2FsZUdyaWRDb2xSb3dTdGFydEFuZEVuZCgpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogR3JpZCBSb3cgU3RhcnRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ncmlkLXJvd1xuICAgICAgICovXG4gICAgICAncm93LXN0YXJ0JzogW3tcbiAgICAgICAgJ3Jvdy1zdGFydCc6IHNjYWxlR3JpZENvbFJvd1N0YXJ0T3JFbmQoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEdyaWQgUm93IEVuZFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2dyaWQtcm93XG4gICAgICAgKi9cbiAgICAgICdyb3ctZW5kJzogW3tcbiAgICAgICAgJ3Jvdy1lbmQnOiBzY2FsZUdyaWRDb2xSb3dTdGFydE9yRW5kKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBHcmlkIEF1dG8gRmxvd1xuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2dyaWQtYXV0by1mbG93XG4gICAgICAgKi9cbiAgICAgICdncmlkLWZsb3cnOiBbe1xuICAgICAgICAnZ3JpZC1mbG93JzogWydyb3cnLCAnY29sJywgJ2RlbnNlJywgJ3Jvdy1kZW5zZScsICdjb2wtZGVuc2UnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEdyaWQgQXV0byBDb2x1bW5zXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvZ3JpZC1hdXRvLWNvbHVtbnNcbiAgICAgICAqL1xuICAgICAgJ2F1dG8tY29scyc6IFt7XG4gICAgICAgICdhdXRvLWNvbHMnOiBzY2FsZUdyaWRBdXRvQ29sc1Jvd3MoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEdyaWQgQXV0byBSb3dzXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvZ3JpZC1hdXRvLXJvd3NcbiAgICAgICAqL1xuICAgICAgJ2F1dG8tcm93cyc6IFt7XG4gICAgICAgICdhdXRvLXJvd3MnOiBzY2FsZUdyaWRBdXRvQ29sc1Jvd3MoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEdhcFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2dhcFxuICAgICAgICovXG4gICAgICBnYXA6IFt7XG4gICAgICAgIGdhcDogc2NhbGVVbmFtYmlndW91c1NwYWNpbmcoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEdhcCBYXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvZ2FwXG4gICAgICAgKi9cbiAgICAgICdnYXAteCc6IFt7XG4gICAgICAgICdnYXAteCc6IHNjYWxlVW5hbWJpZ3VvdXNTcGFjaW5nKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBHYXAgWVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2dhcFxuICAgICAgICovXG4gICAgICAnZ2FwLXknOiBbe1xuICAgICAgICAnZ2FwLXknOiBzY2FsZVVuYW1iaWd1b3VzU3BhY2luZygpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogSnVzdGlmeSBDb250ZW50XG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvanVzdGlmeS1jb250ZW50XG4gICAgICAgKi9cbiAgICAgICdqdXN0aWZ5LWNvbnRlbnQnOiBbe1xuICAgICAgICBqdXN0aWZ5OiBbLi4uc2NhbGVBbGlnblByaW1hcnlBeGlzKCksICdub3JtYWwnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEp1c3RpZnkgSXRlbXNcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9qdXN0aWZ5LWl0ZW1zXG4gICAgICAgKi9cbiAgICAgICdqdXN0aWZ5LWl0ZW1zJzogW3tcbiAgICAgICAgJ2p1c3RpZnktaXRlbXMnOiBbLi4uc2NhbGVBbGlnblNlY29uZGFyeUF4aXMoKSwgJ25vcm1hbCddXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogSnVzdGlmeSBTZWxmXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvanVzdGlmeS1zZWxmXG4gICAgICAgKi9cbiAgICAgICdqdXN0aWZ5LXNlbGYnOiBbe1xuICAgICAgICAnanVzdGlmeS1zZWxmJzogWydhdXRvJywgLi4uc2NhbGVBbGlnblNlY29uZGFyeUF4aXMoKV1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBBbGlnbiBDb250ZW50XG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYWxpZ24tY29udGVudFxuICAgICAgICovXG4gICAgICAnYWxpZ24tY29udGVudCc6IFt7XG4gICAgICAgIGNvbnRlbnQ6IFsnbm9ybWFsJywgLi4uc2NhbGVBbGlnblByaW1hcnlBeGlzKCldXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQWxpZ24gSXRlbXNcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9hbGlnbi1pdGVtc1xuICAgICAgICovXG4gICAgICAnYWxpZ24taXRlbXMnOiBbe1xuICAgICAgICBpdGVtczogWy4uLnNjYWxlQWxpZ25TZWNvbmRhcnlBeGlzKCksIHtcbiAgICAgICAgICBiYXNlbGluZTogWycnLCAnbGFzdCddXG4gICAgICAgIH1dXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQWxpZ24gU2VsZlxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2FsaWduLXNlbGZcbiAgICAgICAqL1xuICAgICAgJ2FsaWduLXNlbGYnOiBbe1xuICAgICAgICBzZWxmOiBbJ2F1dG8nLCAuLi5zY2FsZUFsaWduU2Vjb25kYXJ5QXhpcygpLCB7XG4gICAgICAgICAgYmFzZWxpbmU6IFsnJywgJ2xhc3QnXVxuICAgICAgICB9XVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFBsYWNlIENvbnRlbnRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9wbGFjZS1jb250ZW50XG4gICAgICAgKi9cbiAgICAgICdwbGFjZS1jb250ZW50JzogW3tcbiAgICAgICAgJ3BsYWNlLWNvbnRlbnQnOiBzY2FsZUFsaWduUHJpbWFyeUF4aXMoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFBsYWNlIEl0ZW1zXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvcGxhY2UtaXRlbXNcbiAgICAgICAqL1xuICAgICAgJ3BsYWNlLWl0ZW1zJzogW3tcbiAgICAgICAgJ3BsYWNlLWl0ZW1zJzogWy4uLnNjYWxlQWxpZ25TZWNvbmRhcnlBeGlzKCksICdiYXNlbGluZSddXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogUGxhY2UgU2VsZlxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3BsYWNlLXNlbGZcbiAgICAgICAqL1xuICAgICAgJ3BsYWNlLXNlbGYnOiBbe1xuICAgICAgICAncGxhY2Utc2VsZic6IFsnYXV0bycsIC4uLnNjYWxlQWxpZ25TZWNvbmRhcnlBeGlzKCldXG4gICAgICB9XSxcbiAgICAgIC8vIFNwYWNpbmdcbiAgICAgIC8qKlxuICAgICAgICogUGFkZGluZ1xuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3BhZGRpbmdcbiAgICAgICAqL1xuICAgICAgcDogW3tcbiAgICAgICAgcDogc2NhbGVVbmFtYmlndW91c1NwYWNpbmcoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFBhZGRpbmcgWFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3BhZGRpbmdcbiAgICAgICAqL1xuICAgICAgcHg6IFt7XG4gICAgICAgIHB4OiBzY2FsZVVuYW1iaWd1b3VzU3BhY2luZygpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogUGFkZGluZyBZXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvcGFkZGluZ1xuICAgICAgICovXG4gICAgICBweTogW3tcbiAgICAgICAgcHk6IHNjYWxlVW5hbWJpZ3VvdXNTcGFjaW5nKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBQYWRkaW5nIFN0YXJ0XG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvcGFkZGluZ1xuICAgICAgICovXG4gICAgICBwczogW3tcbiAgICAgICAgcHM6IHNjYWxlVW5hbWJpZ3VvdXNTcGFjaW5nKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBQYWRkaW5nIEVuZFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3BhZGRpbmdcbiAgICAgICAqL1xuICAgICAgcGU6IFt7XG4gICAgICAgIHBlOiBzY2FsZVVuYW1iaWd1b3VzU3BhY2luZygpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogUGFkZGluZyBUb3BcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9wYWRkaW5nXG4gICAgICAgKi9cbiAgICAgIHB0OiBbe1xuICAgICAgICBwdDogc2NhbGVVbmFtYmlndW91c1NwYWNpbmcoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFBhZGRpbmcgUmlnaHRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9wYWRkaW5nXG4gICAgICAgKi9cbiAgICAgIHByOiBbe1xuICAgICAgICBwcjogc2NhbGVVbmFtYmlndW91c1NwYWNpbmcoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFBhZGRpbmcgQm90dG9tXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvcGFkZGluZ1xuICAgICAgICovXG4gICAgICBwYjogW3tcbiAgICAgICAgcGI6IHNjYWxlVW5hbWJpZ3VvdXNTcGFjaW5nKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBQYWRkaW5nIExlZnRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9wYWRkaW5nXG4gICAgICAgKi9cbiAgICAgIHBsOiBbe1xuICAgICAgICBwbDogc2NhbGVVbmFtYmlndW91c1NwYWNpbmcoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIE1hcmdpblxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL21hcmdpblxuICAgICAgICovXG4gICAgICBtOiBbe1xuICAgICAgICBtOiBzY2FsZU1hcmdpbigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogTWFyZ2luIFhcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9tYXJnaW5cbiAgICAgICAqL1xuICAgICAgbXg6IFt7XG4gICAgICAgIG14OiBzY2FsZU1hcmdpbigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogTWFyZ2luIFlcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9tYXJnaW5cbiAgICAgICAqL1xuICAgICAgbXk6IFt7XG4gICAgICAgIG15OiBzY2FsZU1hcmdpbigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogTWFyZ2luIFN0YXJ0XG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvbWFyZ2luXG4gICAgICAgKi9cbiAgICAgIG1zOiBbe1xuICAgICAgICBtczogc2NhbGVNYXJnaW4oKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIE1hcmdpbiBFbmRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9tYXJnaW5cbiAgICAgICAqL1xuICAgICAgbWU6IFt7XG4gICAgICAgIG1lOiBzY2FsZU1hcmdpbigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogTWFyZ2luIFRvcFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL21hcmdpblxuICAgICAgICovXG4gICAgICBtdDogW3tcbiAgICAgICAgbXQ6IHNjYWxlTWFyZ2luKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBNYXJnaW4gUmlnaHRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9tYXJnaW5cbiAgICAgICAqL1xuICAgICAgbXI6IFt7XG4gICAgICAgIG1yOiBzY2FsZU1hcmdpbigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogTWFyZ2luIEJvdHRvbVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL21hcmdpblxuICAgICAgICovXG4gICAgICBtYjogW3tcbiAgICAgICAgbWI6IHNjYWxlTWFyZ2luKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBNYXJnaW4gTGVmdFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL21hcmdpblxuICAgICAgICovXG4gICAgICBtbDogW3tcbiAgICAgICAgbWw6IHNjYWxlTWFyZ2luKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBTcGFjZSBCZXR3ZWVuIFhcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9tYXJnaW4jYWRkaW5nLXNwYWNlLWJldHdlZW4tY2hpbGRyZW5cbiAgICAgICAqL1xuICAgICAgJ3NwYWNlLXgnOiBbe1xuICAgICAgICAnc3BhY2UteCc6IHNjYWxlVW5hbWJpZ3VvdXNTcGFjaW5nKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBTcGFjZSBCZXR3ZWVuIFggUmV2ZXJzZVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL21hcmdpbiNhZGRpbmctc3BhY2UtYmV0d2Vlbi1jaGlsZHJlblxuICAgICAgICovXG4gICAgICAnc3BhY2UteC1yZXZlcnNlJzogWydzcGFjZS14LXJldmVyc2UnXSxcbiAgICAgIC8qKlxuICAgICAgICogU3BhY2UgQmV0d2VlbiBZXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvbWFyZ2luI2FkZGluZy1zcGFjZS1iZXR3ZWVuLWNoaWxkcmVuXG4gICAgICAgKi9cbiAgICAgICdzcGFjZS15JzogW3tcbiAgICAgICAgJ3NwYWNlLXknOiBzY2FsZVVuYW1iaWd1b3VzU3BhY2luZygpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogU3BhY2UgQmV0d2VlbiBZIFJldmVyc2VcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9tYXJnaW4jYWRkaW5nLXNwYWNlLWJldHdlZW4tY2hpbGRyZW5cbiAgICAgICAqL1xuICAgICAgJ3NwYWNlLXktcmV2ZXJzZSc6IFsnc3BhY2UteS1yZXZlcnNlJ10sXG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gLS0tIFNpemluZyAtLS1cbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tXG4gICAgICAvKipcbiAgICAgICAqIFNpemVcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy93aWR0aCNzZXR0aW5nLWJvdGgtd2lkdGgtYW5kLWhlaWdodFxuICAgICAgICovXG4gICAgICBzaXplOiBbe1xuICAgICAgICBzaXplOiBzY2FsZVNpemluZygpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogV2lkdGhcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy93aWR0aFxuICAgICAgICovXG4gICAgICB3OiBbe1xuICAgICAgICB3OiBbdGhlbWVDb250YWluZXIsICdzY3JlZW4nLCAuLi5zY2FsZVNpemluZygpXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIE1pbi1XaWR0aFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL21pbi13aWR0aFxuICAgICAgICovXG4gICAgICAnbWluLXcnOiBbe1xuICAgICAgICAnbWluLXcnOiBbdGhlbWVDb250YWluZXIsICdzY3JlZW4nLCAvKiogRGVwcmVjYXRlZC4gQHNlZSBodHRwczovL2dpdGh1Yi5jb20vdGFpbHdpbmRsYWJzL3RhaWx3aW5kY3NzLmNvbS9pc3N1ZXMvMjAyNyNpc3N1ZWNvbW1lbnQtMjYyMDE1Mjc1NyAqL1xuICAgICAgICAnbm9uZScsIC4uLnNjYWxlU2l6aW5nKCldXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogTWF4LVdpZHRoXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvbWF4LXdpZHRoXG4gICAgICAgKi9cbiAgICAgICdtYXgtdyc6IFt7XG4gICAgICAgICdtYXgtdyc6IFt0aGVtZUNvbnRhaW5lciwgJ3NjcmVlbicsICdub25lJywgLyoqIERlcHJlY2F0ZWQgc2luY2UgVGFpbHdpbmQgQ1NTIHY0LjAuMC4gQHNlZSBodHRwczovL2dpdGh1Yi5jb20vdGFpbHdpbmRsYWJzL3RhaWx3aW5kY3NzLmNvbS9pc3N1ZXMvMjAyNyNpc3N1ZWNvbW1lbnQtMjYyMDE1Mjc1NyAqL1xuICAgICAgICAncHJvc2UnLCAvKiogRGVwcmVjYXRlZCBzaW5jZSBUYWlsd2luZCBDU1MgdjQuMC4wLiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS90YWlsd2luZGxhYnMvdGFpbHdpbmRjc3MuY29tL2lzc3Vlcy8yMDI3I2lzc3VlY29tbWVudC0yNjIwMTUyNzU3ICovXG4gICAgICAgIHtcbiAgICAgICAgICBzY3JlZW46IFt0aGVtZUJyZWFrcG9pbnRdXG4gICAgICAgIH0sIC4uLnNjYWxlU2l6aW5nKCldXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogSGVpZ2h0XG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvaGVpZ2h0XG4gICAgICAgKi9cbiAgICAgIGg6IFt7XG4gICAgICAgIGg6IFsnc2NyZWVuJywgJ2xoJywgLi4uc2NhbGVTaXppbmcoKV1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBNaW4tSGVpZ2h0XG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvbWluLWhlaWdodFxuICAgICAgICovXG4gICAgICAnbWluLWgnOiBbe1xuICAgICAgICAnbWluLWgnOiBbJ3NjcmVlbicsICdsaCcsICdub25lJywgLi4uc2NhbGVTaXppbmcoKV1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBNYXgtSGVpZ2h0XG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvbWF4LWhlaWdodFxuICAgICAgICovXG4gICAgICAnbWF4LWgnOiBbe1xuICAgICAgICAnbWF4LWgnOiBbJ3NjcmVlbicsICdsaCcsIC4uLnNjYWxlU2l6aW5nKCldXG4gICAgICB9XSxcbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gLS0tIFR5cG9ncmFwaHkgLS0tXG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8qKlxuICAgICAgICogRm9udCBTaXplXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvZm9udC1zaXplXG4gICAgICAgKi9cbiAgICAgICdmb250LXNpemUnOiBbe1xuICAgICAgICB0ZXh0OiBbJ2Jhc2UnLCB0aGVtZVRleHQsIGlzQXJiaXRyYXJ5VmFyaWFibGVMZW5ndGgsIGlzQXJiaXRyYXJ5TGVuZ3RoXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEZvbnQgU21vb3RoaW5nXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvZm9udC1zbW9vdGhpbmdcbiAgICAgICAqL1xuICAgICAgJ2ZvbnQtc21vb3RoaW5nJzogWydhbnRpYWxpYXNlZCcsICdzdWJwaXhlbC1hbnRpYWxpYXNlZCddLFxuICAgICAgLyoqXG4gICAgICAgKiBGb250IFN0eWxlXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvZm9udC1zdHlsZVxuICAgICAgICovXG4gICAgICAnZm9udC1zdHlsZSc6IFsnaXRhbGljJywgJ25vdC1pdGFsaWMnXSxcbiAgICAgIC8qKlxuICAgICAgICogRm9udCBXZWlnaHRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9mb250LXdlaWdodFxuICAgICAgICovXG4gICAgICAnZm9udC13ZWlnaHQnOiBbe1xuICAgICAgICBmb250OiBbdGhlbWVGb250V2VpZ2h0LCBpc0FyYml0cmFyeVZhcmlhYmxlLCBpc0FyYml0cmFyeU51bWJlcl1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBGb250IFN0cmV0Y2hcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9mb250LXN0cmV0Y2hcbiAgICAgICAqL1xuICAgICAgJ2ZvbnQtc3RyZXRjaCc6IFt7XG4gICAgICAgICdmb250LXN0cmV0Y2gnOiBbJ3VsdHJhLWNvbmRlbnNlZCcsICdleHRyYS1jb25kZW5zZWQnLCAnY29uZGVuc2VkJywgJ3NlbWktY29uZGVuc2VkJywgJ25vcm1hbCcsICdzZW1pLWV4cGFuZGVkJywgJ2V4cGFuZGVkJywgJ2V4dHJhLWV4cGFuZGVkJywgJ3VsdHJhLWV4cGFuZGVkJywgaXNQZXJjZW50LCBpc0FyYml0cmFyeVZhbHVlXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEZvbnQgRmFtaWx5XG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvZm9udC1mYW1pbHlcbiAgICAgICAqL1xuICAgICAgJ2ZvbnQtZmFtaWx5JzogW3tcbiAgICAgICAgZm9udDogW2lzQXJiaXRyYXJ5VmFyaWFibGVGYW1pbHlOYW1lLCBpc0FyYml0cmFyeVZhbHVlLCB0aGVtZUZvbnRdXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogRm9udCBWYXJpYW50IE51bWVyaWNcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9mb250LXZhcmlhbnQtbnVtZXJpY1xuICAgICAgICovXG4gICAgICAnZnZuLW5vcm1hbCc6IFsnbm9ybWFsLW51bXMnXSxcbiAgICAgIC8qKlxuICAgICAgICogRm9udCBWYXJpYW50IE51bWVyaWNcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9mb250LXZhcmlhbnQtbnVtZXJpY1xuICAgICAgICovXG4gICAgICAnZnZuLW9yZGluYWwnOiBbJ29yZGluYWwnXSxcbiAgICAgIC8qKlxuICAgICAgICogRm9udCBWYXJpYW50IE51bWVyaWNcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9mb250LXZhcmlhbnQtbnVtZXJpY1xuICAgICAgICovXG4gICAgICAnZnZuLXNsYXNoZWQtemVybyc6IFsnc2xhc2hlZC16ZXJvJ10sXG4gICAgICAvKipcbiAgICAgICAqIEZvbnQgVmFyaWFudCBOdW1lcmljXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvZm9udC12YXJpYW50LW51bWVyaWNcbiAgICAgICAqL1xuICAgICAgJ2Z2bi1maWd1cmUnOiBbJ2xpbmluZy1udW1zJywgJ29sZHN0eWxlLW51bXMnXSxcbiAgICAgIC8qKlxuICAgICAgICogRm9udCBWYXJpYW50IE51bWVyaWNcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9mb250LXZhcmlhbnQtbnVtZXJpY1xuICAgICAgICovXG4gICAgICAnZnZuLXNwYWNpbmcnOiBbJ3Byb3BvcnRpb25hbC1udW1zJywgJ3RhYnVsYXItbnVtcyddLFxuICAgICAgLyoqXG4gICAgICAgKiBGb250IFZhcmlhbnQgTnVtZXJpY1xuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2ZvbnQtdmFyaWFudC1udW1lcmljXG4gICAgICAgKi9cbiAgICAgICdmdm4tZnJhY3Rpb24nOiBbJ2RpYWdvbmFsLWZyYWN0aW9ucycsICdzdGFja2VkLWZyYWN0aW9ucyddLFxuICAgICAgLyoqXG4gICAgICAgKiBMZXR0ZXIgU3BhY2luZ1xuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2xldHRlci1zcGFjaW5nXG4gICAgICAgKi9cbiAgICAgIHRyYWNraW5nOiBbe1xuICAgICAgICB0cmFja2luZzogW3RoZW1lVHJhY2tpbmcsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogTGluZSBDbGFtcFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2xpbmUtY2xhbXBcbiAgICAgICAqL1xuICAgICAgJ2xpbmUtY2xhbXAnOiBbe1xuICAgICAgICAnbGluZS1jbGFtcCc6IFtpc051bWJlciwgJ25vbmUnLCBpc0FyYml0cmFyeVZhcmlhYmxlLCBpc0FyYml0cmFyeU51bWJlcl1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBMaW5lIEhlaWdodFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2xpbmUtaGVpZ2h0XG4gICAgICAgKi9cbiAgICAgIGxlYWRpbmc6IFt7XG4gICAgICAgIGxlYWRpbmc6IFsvKiogRGVwcmVjYXRlZCBzaW5jZSBUYWlsd2luZCBDU1MgdjQuMC4wLiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS90YWlsd2luZGxhYnMvdGFpbHdpbmRjc3MuY29tL2lzc3Vlcy8yMDI3I2lzc3VlY29tbWVudC0yNjIwMTUyNzU3ICovXG4gICAgICAgIHRoZW1lTGVhZGluZywgLi4uc2NhbGVVbmFtYmlndW91c1NwYWNpbmcoKV1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBMaXN0IFN0eWxlIEltYWdlXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvbGlzdC1zdHlsZS1pbWFnZVxuICAgICAgICovXG4gICAgICAnbGlzdC1pbWFnZSc6IFt7XG4gICAgICAgICdsaXN0LWltYWdlJzogWydub25lJywgaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlWYWx1ZV1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBMaXN0IFN0eWxlIFBvc2l0aW9uXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvbGlzdC1zdHlsZS1wb3NpdGlvblxuICAgICAgICovXG4gICAgICAnbGlzdC1zdHlsZS1wb3NpdGlvbic6IFt7XG4gICAgICAgIGxpc3Q6IFsnaW5zaWRlJywgJ291dHNpZGUnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIExpc3QgU3R5bGUgVHlwZVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2xpc3Qtc3R5bGUtdHlwZVxuICAgICAgICovXG4gICAgICAnbGlzdC1zdHlsZS10eXBlJzogW3tcbiAgICAgICAgbGlzdDogWydkaXNjJywgJ2RlY2ltYWwnLCAnbm9uZScsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogVGV4dCBBbGlnbm1lbnRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy90ZXh0LWFsaWduXG4gICAgICAgKi9cbiAgICAgICd0ZXh0LWFsaWdubWVudCc6IFt7XG4gICAgICAgIHRleHQ6IFsnbGVmdCcsICdjZW50ZXInLCAncmlnaHQnLCAnanVzdGlmeScsICdzdGFydCcsICdlbmQnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFBsYWNlaG9sZGVyIENvbG9yXG4gICAgICAgKiBAZGVwcmVjYXRlZCBzaW5jZSBUYWlsd2luZCBDU1MgdjMuMC4wXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdjMudGFpbHdpbmRjc3MuY29tL2RvY3MvcGxhY2Vob2xkZXItY29sb3JcbiAgICAgICAqL1xuICAgICAgJ3BsYWNlaG9sZGVyLWNvbG9yJzogW3tcbiAgICAgICAgcGxhY2Vob2xkZXI6IHNjYWxlQ29sb3IoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFRleHQgQ29sb3JcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy90ZXh0LWNvbG9yXG4gICAgICAgKi9cbiAgICAgICd0ZXh0LWNvbG9yJzogW3tcbiAgICAgICAgdGV4dDogc2NhbGVDb2xvcigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogVGV4dCBEZWNvcmF0aW9uXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvdGV4dC1kZWNvcmF0aW9uXG4gICAgICAgKi9cbiAgICAgICd0ZXh0LWRlY29yYXRpb24nOiBbJ3VuZGVybGluZScsICdvdmVybGluZScsICdsaW5lLXRocm91Z2gnLCAnbm8tdW5kZXJsaW5lJ10sXG4gICAgICAvKipcbiAgICAgICAqIFRleHQgRGVjb3JhdGlvbiBTdHlsZVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RleHQtZGVjb3JhdGlvbi1zdHlsZVxuICAgICAgICovXG4gICAgICAndGV4dC1kZWNvcmF0aW9uLXN0eWxlJzogW3tcbiAgICAgICAgZGVjb3JhdGlvbjogWy4uLnNjYWxlTGluZVN0eWxlKCksICd3YXZ5J11cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBUZXh0IERlY29yYXRpb24gVGhpY2tuZXNzXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvdGV4dC1kZWNvcmF0aW9uLXRoaWNrbmVzc1xuICAgICAgICovXG4gICAgICAndGV4dC1kZWNvcmF0aW9uLXRoaWNrbmVzcyc6IFt7XG4gICAgICAgIGRlY29yYXRpb246IFtpc051bWJlciwgJ2Zyb20tZm9udCcsICdhdXRvJywgaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlMZW5ndGhdXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogVGV4dCBEZWNvcmF0aW9uIENvbG9yXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvdGV4dC1kZWNvcmF0aW9uLWNvbG9yXG4gICAgICAgKi9cbiAgICAgICd0ZXh0LWRlY29yYXRpb24tY29sb3InOiBbe1xuICAgICAgICBkZWNvcmF0aW9uOiBzY2FsZUNvbG9yKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBUZXh0IFVuZGVybGluZSBPZmZzZXRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy90ZXh0LXVuZGVybGluZS1vZmZzZXRcbiAgICAgICAqL1xuICAgICAgJ3VuZGVybGluZS1vZmZzZXQnOiBbe1xuICAgICAgICAndW5kZXJsaW5lLW9mZnNldCc6IFtpc051bWJlciwgJ2F1dG8nLCBpc0FyYml0cmFyeVZhcmlhYmxlLCBpc0FyYml0cmFyeVZhbHVlXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFRleHQgVHJhbnNmb3JtXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvdGV4dC10cmFuc2Zvcm1cbiAgICAgICAqL1xuICAgICAgJ3RleHQtdHJhbnNmb3JtJzogWyd1cHBlcmNhc2UnLCAnbG93ZXJjYXNlJywgJ2NhcGl0YWxpemUnLCAnbm9ybWFsLWNhc2UnXSxcbiAgICAgIC8qKlxuICAgICAgICogVGV4dCBPdmVyZmxvd1xuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RleHQtb3ZlcmZsb3dcbiAgICAgICAqL1xuICAgICAgJ3RleHQtb3ZlcmZsb3cnOiBbJ3RydW5jYXRlJywgJ3RleHQtZWxsaXBzaXMnLCAndGV4dC1jbGlwJ10sXG4gICAgICAvKipcbiAgICAgICAqIFRleHQgV3JhcFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RleHQtd3JhcFxuICAgICAgICovXG4gICAgICAndGV4dC13cmFwJzogW3tcbiAgICAgICAgdGV4dDogWyd3cmFwJywgJ25vd3JhcCcsICdiYWxhbmNlJywgJ3ByZXR0eSddXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogVGV4dCBJbmRlbnRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy90ZXh0LWluZGVudFxuICAgICAgICovXG4gICAgICBpbmRlbnQ6IFt7XG4gICAgICAgIGluZGVudDogc2NhbGVVbmFtYmlndW91c1NwYWNpbmcoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFZlcnRpY2FsIEFsaWdubWVudFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3ZlcnRpY2FsLWFsaWduXG4gICAgICAgKi9cbiAgICAgICd2ZXJ0aWNhbC1hbGlnbic6IFt7XG4gICAgICAgIGFsaWduOiBbJ2Jhc2VsaW5lJywgJ3RvcCcsICdtaWRkbGUnLCAnYm90dG9tJywgJ3RleHQtdG9wJywgJ3RleHQtYm90dG9tJywgJ3N1YicsICdzdXBlcicsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogV2hpdGVzcGFjZVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3doaXRlc3BhY2VcbiAgICAgICAqL1xuICAgICAgd2hpdGVzcGFjZTogW3tcbiAgICAgICAgd2hpdGVzcGFjZTogWydub3JtYWwnLCAnbm93cmFwJywgJ3ByZScsICdwcmUtbGluZScsICdwcmUtd3JhcCcsICdicmVhay1zcGFjZXMnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFdvcmQgQnJlYWtcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy93b3JkLWJyZWFrXG4gICAgICAgKi9cbiAgICAgIGJyZWFrOiBbe1xuICAgICAgICBicmVhazogWydub3JtYWwnLCAnd29yZHMnLCAnYWxsJywgJ2tlZXAnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIE92ZXJmbG93IFdyYXBcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9vdmVyZmxvdy13cmFwXG4gICAgICAgKi9cbiAgICAgIHdyYXA6IFt7XG4gICAgICAgIHdyYXA6IFsnYnJlYWstd29yZCcsICdhbnl3aGVyZScsICdub3JtYWwnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEh5cGhlbnNcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9oeXBoZW5zXG4gICAgICAgKi9cbiAgICAgIGh5cGhlbnM6IFt7XG4gICAgICAgIGh5cGhlbnM6IFsnbm9uZScsICdtYW51YWwnLCAnYXV0byddXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQ29udGVudFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2NvbnRlbnRcbiAgICAgICAqL1xuICAgICAgY29udGVudDogW3tcbiAgICAgICAgY29udGVudDogWydub25lJywgaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlWYWx1ZV1cbiAgICAgIH1dLFxuICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gLS0tIEJhY2tncm91bmRzIC0tLVxuICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLyoqXG4gICAgICAgKiBCYWNrZ3JvdW5kIEF0dGFjaG1lbnRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9iYWNrZ3JvdW5kLWF0dGFjaG1lbnRcbiAgICAgICAqL1xuICAgICAgJ2JnLWF0dGFjaG1lbnQnOiBbe1xuICAgICAgICBiZzogWydmaXhlZCcsICdsb2NhbCcsICdzY3JvbGwnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJhY2tncm91bmQgQ2xpcFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JhY2tncm91bmQtY2xpcFxuICAgICAgICovXG4gICAgICAnYmctY2xpcCc6IFt7XG4gICAgICAgICdiZy1jbGlwJzogWydib3JkZXInLCAncGFkZGluZycsICdjb250ZW50JywgJ3RleHQnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJhY2tncm91bmQgT3JpZ2luXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYmFja2dyb3VuZC1vcmlnaW5cbiAgICAgICAqL1xuICAgICAgJ2JnLW9yaWdpbic6IFt7XG4gICAgICAgICdiZy1vcmlnaW4nOiBbJ2JvcmRlcicsICdwYWRkaW5nJywgJ2NvbnRlbnQnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJhY2tncm91bmQgUG9zaXRpb25cbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9iYWNrZ3JvdW5kLXBvc2l0aW9uXG4gICAgICAgKi9cbiAgICAgICdiZy1wb3NpdGlvbic6IFt7XG4gICAgICAgIGJnOiBzY2FsZUJnUG9zaXRpb24oKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJhY2tncm91bmQgUmVwZWF0XG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYmFja2dyb3VuZC1yZXBlYXRcbiAgICAgICAqL1xuICAgICAgJ2JnLXJlcGVhdCc6IFt7XG4gICAgICAgIGJnOiBzY2FsZUJnUmVwZWF0KClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBCYWNrZ3JvdW5kIFNpemVcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9iYWNrZ3JvdW5kLXNpemVcbiAgICAgICAqL1xuICAgICAgJ2JnLXNpemUnOiBbe1xuICAgICAgICBiZzogc2NhbGVCZ1NpemUoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJhY2tncm91bmQgSW1hZ2VcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9iYWNrZ3JvdW5kLWltYWdlXG4gICAgICAgKi9cbiAgICAgICdiZy1pbWFnZSc6IFt7XG4gICAgICAgIGJnOiBbJ25vbmUnLCB7XG4gICAgICAgICAgbGluZWFyOiBbe1xuICAgICAgICAgICAgdG86IFsndCcsICd0cicsICdyJywgJ2JyJywgJ2InLCAnYmwnLCAnbCcsICd0bCddXG4gICAgICAgICAgfSwgaXNJbnRlZ2VyLCBpc0FyYml0cmFyeVZhcmlhYmxlLCBpc0FyYml0cmFyeVZhbHVlXSxcbiAgICAgICAgICByYWRpYWw6IFsnJywgaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlWYWx1ZV0sXG4gICAgICAgICAgY29uaWM6IFtpc0ludGVnZXIsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdXG4gICAgICAgIH0sIGlzQXJiaXRyYXJ5VmFyaWFibGVJbWFnZSwgaXNBcmJpdHJhcnlJbWFnZV1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBCYWNrZ3JvdW5kIENvbG9yXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYmFja2dyb3VuZC1jb2xvclxuICAgICAgICovXG4gICAgICAnYmctY29sb3InOiBbe1xuICAgICAgICBiZzogc2NhbGVDb2xvcigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogR3JhZGllbnQgQ29sb3IgU3RvcHMgRnJvbSBQb3NpdGlvblxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2dyYWRpZW50LWNvbG9yLXN0b3BzXG4gICAgICAgKi9cbiAgICAgICdncmFkaWVudC1mcm9tLXBvcyc6IFt7XG4gICAgICAgIGZyb206IHNjYWxlR3JhZGllbnRTdG9wUG9zaXRpb24oKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEdyYWRpZW50IENvbG9yIFN0b3BzIFZpYSBQb3NpdGlvblxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2dyYWRpZW50LWNvbG9yLXN0b3BzXG4gICAgICAgKi9cbiAgICAgICdncmFkaWVudC12aWEtcG9zJzogW3tcbiAgICAgICAgdmlhOiBzY2FsZUdyYWRpZW50U3RvcFBvc2l0aW9uKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBHcmFkaWVudCBDb2xvciBTdG9wcyBUbyBQb3NpdGlvblxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2dyYWRpZW50LWNvbG9yLXN0b3BzXG4gICAgICAgKi9cbiAgICAgICdncmFkaWVudC10by1wb3MnOiBbe1xuICAgICAgICB0bzogc2NhbGVHcmFkaWVudFN0b3BQb3NpdGlvbigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogR3JhZGllbnQgQ29sb3IgU3RvcHMgRnJvbVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2dyYWRpZW50LWNvbG9yLXN0b3BzXG4gICAgICAgKi9cbiAgICAgICdncmFkaWVudC1mcm9tJzogW3tcbiAgICAgICAgZnJvbTogc2NhbGVDb2xvcigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogR3JhZGllbnQgQ29sb3IgU3RvcHMgVmlhXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvZ3JhZGllbnQtY29sb3Itc3RvcHNcbiAgICAgICAqL1xuICAgICAgJ2dyYWRpZW50LXZpYSc6IFt7XG4gICAgICAgIHZpYTogc2NhbGVDb2xvcigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogR3JhZGllbnQgQ29sb3IgU3RvcHMgVG9cbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ncmFkaWVudC1jb2xvci1zdG9wc1xuICAgICAgICovXG4gICAgICAnZ3JhZGllbnQtdG8nOiBbe1xuICAgICAgICB0bzogc2NhbGVDb2xvcigpXG4gICAgICB9XSxcbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gLS0tIEJvcmRlcnMgLS0tXG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8qKlxuICAgICAgICogQm9yZGVyIFJhZGl1c1xuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JvcmRlci1yYWRpdXNcbiAgICAgICAqL1xuICAgICAgcm91bmRlZDogW3tcbiAgICAgICAgcm91bmRlZDogc2NhbGVSYWRpdXMoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJvcmRlciBSYWRpdXMgU3RhcnRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ib3JkZXItcmFkaXVzXG4gICAgICAgKi9cbiAgICAgICdyb3VuZGVkLXMnOiBbe1xuICAgICAgICAncm91bmRlZC1zJzogc2NhbGVSYWRpdXMoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJvcmRlciBSYWRpdXMgRW5kXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYm9yZGVyLXJhZGl1c1xuICAgICAgICovXG4gICAgICAncm91bmRlZC1lJzogW3tcbiAgICAgICAgJ3JvdW5kZWQtZSc6IHNjYWxlUmFkaXVzKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBCb3JkZXIgUmFkaXVzIFRvcFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JvcmRlci1yYWRpdXNcbiAgICAgICAqL1xuICAgICAgJ3JvdW5kZWQtdCc6IFt7XG4gICAgICAgICdyb3VuZGVkLXQnOiBzY2FsZVJhZGl1cygpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQm9yZGVyIFJhZGl1cyBSaWdodFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JvcmRlci1yYWRpdXNcbiAgICAgICAqL1xuICAgICAgJ3JvdW5kZWQtcic6IFt7XG4gICAgICAgICdyb3VuZGVkLXInOiBzY2FsZVJhZGl1cygpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQm9yZGVyIFJhZGl1cyBCb3R0b21cbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ib3JkZXItcmFkaXVzXG4gICAgICAgKi9cbiAgICAgICdyb3VuZGVkLWInOiBbe1xuICAgICAgICAncm91bmRlZC1iJzogc2NhbGVSYWRpdXMoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJvcmRlciBSYWRpdXMgTGVmdFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JvcmRlci1yYWRpdXNcbiAgICAgICAqL1xuICAgICAgJ3JvdW5kZWQtbCc6IFt7XG4gICAgICAgICdyb3VuZGVkLWwnOiBzY2FsZVJhZGl1cygpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQm9yZGVyIFJhZGl1cyBTdGFydCBTdGFydFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JvcmRlci1yYWRpdXNcbiAgICAgICAqL1xuICAgICAgJ3JvdW5kZWQtc3MnOiBbe1xuICAgICAgICAncm91bmRlZC1zcyc6IHNjYWxlUmFkaXVzKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBCb3JkZXIgUmFkaXVzIFN0YXJ0IEVuZFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JvcmRlci1yYWRpdXNcbiAgICAgICAqL1xuICAgICAgJ3JvdW5kZWQtc2UnOiBbe1xuICAgICAgICAncm91bmRlZC1zZSc6IHNjYWxlUmFkaXVzKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBCb3JkZXIgUmFkaXVzIEVuZCBFbmRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ib3JkZXItcmFkaXVzXG4gICAgICAgKi9cbiAgICAgICdyb3VuZGVkLWVlJzogW3tcbiAgICAgICAgJ3JvdW5kZWQtZWUnOiBzY2FsZVJhZGl1cygpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQm9yZGVyIFJhZGl1cyBFbmQgU3RhcnRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ib3JkZXItcmFkaXVzXG4gICAgICAgKi9cbiAgICAgICdyb3VuZGVkLWVzJzogW3tcbiAgICAgICAgJ3JvdW5kZWQtZXMnOiBzY2FsZVJhZGl1cygpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQm9yZGVyIFJhZGl1cyBUb3AgTGVmdFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JvcmRlci1yYWRpdXNcbiAgICAgICAqL1xuICAgICAgJ3JvdW5kZWQtdGwnOiBbe1xuICAgICAgICAncm91bmRlZC10bCc6IHNjYWxlUmFkaXVzKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBCb3JkZXIgUmFkaXVzIFRvcCBSaWdodFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JvcmRlci1yYWRpdXNcbiAgICAgICAqL1xuICAgICAgJ3JvdW5kZWQtdHInOiBbe1xuICAgICAgICAncm91bmRlZC10cic6IHNjYWxlUmFkaXVzKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBCb3JkZXIgUmFkaXVzIEJvdHRvbSBSaWdodFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JvcmRlci1yYWRpdXNcbiAgICAgICAqL1xuICAgICAgJ3JvdW5kZWQtYnInOiBbe1xuICAgICAgICAncm91bmRlZC1icic6IHNjYWxlUmFkaXVzKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBCb3JkZXIgUmFkaXVzIEJvdHRvbSBMZWZ0XG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYm9yZGVyLXJhZGl1c1xuICAgICAgICovXG4gICAgICAncm91bmRlZC1ibCc6IFt7XG4gICAgICAgICdyb3VuZGVkLWJsJzogc2NhbGVSYWRpdXMoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJvcmRlciBXaWR0aFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JvcmRlci13aWR0aFxuICAgICAgICovXG4gICAgICAnYm9yZGVyLXcnOiBbe1xuICAgICAgICBib3JkZXI6IHNjYWxlQm9yZGVyV2lkdGgoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJvcmRlciBXaWR0aCBYXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYm9yZGVyLXdpZHRoXG4gICAgICAgKi9cbiAgICAgICdib3JkZXItdy14JzogW3tcbiAgICAgICAgJ2JvcmRlci14Jzogc2NhbGVCb3JkZXJXaWR0aCgpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQm9yZGVyIFdpZHRoIFlcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ib3JkZXItd2lkdGhcbiAgICAgICAqL1xuICAgICAgJ2JvcmRlci13LXknOiBbe1xuICAgICAgICAnYm9yZGVyLXknOiBzY2FsZUJvcmRlcldpZHRoKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBCb3JkZXIgV2lkdGggU3RhcnRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ib3JkZXItd2lkdGhcbiAgICAgICAqL1xuICAgICAgJ2JvcmRlci13LXMnOiBbe1xuICAgICAgICAnYm9yZGVyLXMnOiBzY2FsZUJvcmRlcldpZHRoKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBCb3JkZXIgV2lkdGggRW5kXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYm9yZGVyLXdpZHRoXG4gICAgICAgKi9cbiAgICAgICdib3JkZXItdy1lJzogW3tcbiAgICAgICAgJ2JvcmRlci1lJzogc2NhbGVCb3JkZXJXaWR0aCgpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQm9yZGVyIFdpZHRoIFRvcFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JvcmRlci13aWR0aFxuICAgICAgICovXG4gICAgICAnYm9yZGVyLXctdCc6IFt7XG4gICAgICAgICdib3JkZXItdCc6IHNjYWxlQm9yZGVyV2lkdGgoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJvcmRlciBXaWR0aCBSaWdodFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JvcmRlci13aWR0aFxuICAgICAgICovXG4gICAgICAnYm9yZGVyLXctcic6IFt7XG4gICAgICAgICdib3JkZXItcic6IHNjYWxlQm9yZGVyV2lkdGgoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJvcmRlciBXaWR0aCBCb3R0b21cbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ib3JkZXItd2lkdGhcbiAgICAgICAqL1xuICAgICAgJ2JvcmRlci13LWInOiBbe1xuICAgICAgICAnYm9yZGVyLWInOiBzY2FsZUJvcmRlcldpZHRoKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBCb3JkZXIgV2lkdGggTGVmdFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JvcmRlci13aWR0aFxuICAgICAgICovXG4gICAgICAnYm9yZGVyLXctbCc6IFt7XG4gICAgICAgICdib3JkZXItbCc6IHNjYWxlQm9yZGVyV2lkdGgoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIERpdmlkZSBXaWR0aCBYXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYm9yZGVyLXdpZHRoI2JldHdlZW4tY2hpbGRyZW5cbiAgICAgICAqL1xuICAgICAgJ2RpdmlkZS14JzogW3tcbiAgICAgICAgJ2RpdmlkZS14Jzogc2NhbGVCb3JkZXJXaWR0aCgpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogRGl2aWRlIFdpZHRoIFggUmV2ZXJzZVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JvcmRlci13aWR0aCNiZXR3ZWVuLWNoaWxkcmVuXG4gICAgICAgKi9cbiAgICAgICdkaXZpZGUteC1yZXZlcnNlJzogWydkaXZpZGUteC1yZXZlcnNlJ10sXG4gICAgICAvKipcbiAgICAgICAqIERpdmlkZSBXaWR0aCBZXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYm9yZGVyLXdpZHRoI2JldHdlZW4tY2hpbGRyZW5cbiAgICAgICAqL1xuICAgICAgJ2RpdmlkZS15JzogW3tcbiAgICAgICAgJ2RpdmlkZS15Jzogc2NhbGVCb3JkZXJXaWR0aCgpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogRGl2aWRlIFdpZHRoIFkgUmV2ZXJzZVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JvcmRlci13aWR0aCNiZXR3ZWVuLWNoaWxkcmVuXG4gICAgICAgKi9cbiAgICAgICdkaXZpZGUteS1yZXZlcnNlJzogWydkaXZpZGUteS1yZXZlcnNlJ10sXG4gICAgICAvKipcbiAgICAgICAqIEJvcmRlciBTdHlsZVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JvcmRlci1zdHlsZVxuICAgICAgICovXG4gICAgICAnYm9yZGVyLXN0eWxlJzogW3tcbiAgICAgICAgYm9yZGVyOiBbLi4uc2NhbGVMaW5lU3R5bGUoKSwgJ2hpZGRlbicsICdub25lJ11cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBEaXZpZGUgU3R5bGVcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ib3JkZXItc3R5bGUjc2V0dGluZy10aGUtZGl2aWRlci1zdHlsZVxuICAgICAgICovXG4gICAgICAnZGl2aWRlLXN0eWxlJzogW3tcbiAgICAgICAgZGl2aWRlOiBbLi4uc2NhbGVMaW5lU3R5bGUoKSwgJ2hpZGRlbicsICdub25lJ11cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBCb3JkZXIgQ29sb3JcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ib3JkZXItY29sb3JcbiAgICAgICAqL1xuICAgICAgJ2JvcmRlci1jb2xvcic6IFt7XG4gICAgICAgIGJvcmRlcjogc2NhbGVDb2xvcigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQm9yZGVyIENvbG9yIFhcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ib3JkZXItY29sb3JcbiAgICAgICAqL1xuICAgICAgJ2JvcmRlci1jb2xvci14JzogW3tcbiAgICAgICAgJ2JvcmRlci14Jzogc2NhbGVDb2xvcigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQm9yZGVyIENvbG9yIFlcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ib3JkZXItY29sb3JcbiAgICAgICAqL1xuICAgICAgJ2JvcmRlci1jb2xvci15JzogW3tcbiAgICAgICAgJ2JvcmRlci15Jzogc2NhbGVDb2xvcigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQm9yZGVyIENvbG9yIFNcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ib3JkZXItY29sb3JcbiAgICAgICAqL1xuICAgICAgJ2JvcmRlci1jb2xvci1zJzogW3tcbiAgICAgICAgJ2JvcmRlci1zJzogc2NhbGVDb2xvcigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQm9yZGVyIENvbG9yIEVcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ib3JkZXItY29sb3JcbiAgICAgICAqL1xuICAgICAgJ2JvcmRlci1jb2xvci1lJzogW3tcbiAgICAgICAgJ2JvcmRlci1lJzogc2NhbGVDb2xvcigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQm9yZGVyIENvbG9yIFRvcFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JvcmRlci1jb2xvclxuICAgICAgICovXG4gICAgICAnYm9yZGVyLWNvbG9yLXQnOiBbe1xuICAgICAgICAnYm9yZGVyLXQnOiBzY2FsZUNvbG9yKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBCb3JkZXIgQ29sb3IgUmlnaHRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ib3JkZXItY29sb3JcbiAgICAgICAqL1xuICAgICAgJ2JvcmRlci1jb2xvci1yJzogW3tcbiAgICAgICAgJ2JvcmRlci1yJzogc2NhbGVDb2xvcigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQm9yZGVyIENvbG9yIEJvdHRvbVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JvcmRlci1jb2xvclxuICAgICAgICovXG4gICAgICAnYm9yZGVyLWNvbG9yLWInOiBbe1xuICAgICAgICAnYm9yZGVyLWInOiBzY2FsZUNvbG9yKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBCb3JkZXIgQ29sb3IgTGVmdFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JvcmRlci1jb2xvclxuICAgICAgICovXG4gICAgICAnYm9yZGVyLWNvbG9yLWwnOiBbe1xuICAgICAgICAnYm9yZGVyLWwnOiBzY2FsZUNvbG9yKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBEaXZpZGUgQ29sb3JcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9kaXZpZGUtY29sb3JcbiAgICAgICAqL1xuICAgICAgJ2RpdmlkZS1jb2xvcic6IFt7XG4gICAgICAgIGRpdmlkZTogc2NhbGVDb2xvcigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogT3V0bGluZSBTdHlsZVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL291dGxpbmUtc3R5bGVcbiAgICAgICAqL1xuICAgICAgJ291dGxpbmUtc3R5bGUnOiBbe1xuICAgICAgICBvdXRsaW5lOiBbLi4uc2NhbGVMaW5lU3R5bGUoKSwgJ25vbmUnLCAnaGlkZGVuJ11cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBPdXRsaW5lIE9mZnNldFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL291dGxpbmUtb2Zmc2V0XG4gICAgICAgKi9cbiAgICAgICdvdXRsaW5lLW9mZnNldCc6IFt7XG4gICAgICAgICdvdXRsaW5lLW9mZnNldCc6IFtpc051bWJlciwgaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlWYWx1ZV1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBPdXRsaW5lIFdpZHRoXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3Mvb3V0bGluZS13aWR0aFxuICAgICAgICovXG4gICAgICAnb3V0bGluZS13JzogW3tcbiAgICAgICAgb3V0bGluZTogWycnLCBpc051bWJlciwgaXNBcmJpdHJhcnlWYXJpYWJsZUxlbmd0aCwgaXNBcmJpdHJhcnlMZW5ndGhdXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogT3V0bGluZSBDb2xvclxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL291dGxpbmUtY29sb3JcbiAgICAgICAqL1xuICAgICAgJ291dGxpbmUtY29sb3InOiBbe1xuICAgICAgICBvdXRsaW5lOiBzY2FsZUNvbG9yKClcbiAgICAgIH1dLFxuICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyAtLS0gRWZmZWN0cyAtLS1cbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLVxuICAgICAgLyoqXG4gICAgICAgKiBCb3ggU2hhZG93XG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYm94LXNoYWRvd1xuICAgICAgICovXG4gICAgICBzaGFkb3c6IFt7XG4gICAgICAgIHNoYWRvdzogW1xuICAgICAgICAvLyBEZXByZWNhdGVkIHNpbmNlIFRhaWx3aW5kIENTUyB2NC4wLjBcbiAgICAgICAgJycsICdub25lJywgdGhlbWVTaGFkb3csIGlzQXJiaXRyYXJ5VmFyaWFibGVTaGFkb3csIGlzQXJiaXRyYXJ5U2hhZG93XVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJveCBTaGFkb3cgQ29sb3JcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ib3gtc2hhZG93I3NldHRpbmctdGhlLXNoYWRvdy1jb2xvclxuICAgICAgICovXG4gICAgICAnc2hhZG93LWNvbG9yJzogW3tcbiAgICAgICAgc2hhZG93OiBzY2FsZUNvbG9yKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBJbnNldCBCb3ggU2hhZG93XG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYm94LXNoYWRvdyNhZGRpbmctYW4taW5zZXQtc2hhZG93XG4gICAgICAgKi9cbiAgICAgICdpbnNldC1zaGFkb3cnOiBbe1xuICAgICAgICAnaW5zZXQtc2hhZG93JzogWydub25lJywgdGhlbWVJbnNldFNoYWRvdywgaXNBcmJpdHJhcnlWYXJpYWJsZVNoYWRvdywgaXNBcmJpdHJhcnlTaGFkb3ddXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogSW5zZXQgQm94IFNoYWRvdyBDb2xvclxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JveC1zaGFkb3cjc2V0dGluZy10aGUtaW5zZXQtc2hhZG93LWNvbG9yXG4gICAgICAgKi9cbiAgICAgICdpbnNldC1zaGFkb3ctY29sb3InOiBbe1xuICAgICAgICAnaW5zZXQtc2hhZG93Jzogc2NhbGVDb2xvcigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogUmluZyBXaWR0aFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JveC1zaGFkb3cjYWRkaW5nLWEtcmluZ1xuICAgICAgICovXG4gICAgICAncmluZy13JzogW3tcbiAgICAgICAgcmluZzogc2NhbGVCb3JkZXJXaWR0aCgpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogUmluZyBXaWR0aCBJbnNldFxuICAgICAgICogQHNlZSBodHRwczovL3YzLnRhaWx3aW5kY3NzLmNvbS9kb2NzL3Jpbmctd2lkdGgjaW5zZXQtcmluZ3NcbiAgICAgICAqIEBkZXByZWNhdGVkIHNpbmNlIFRhaWx3aW5kIENTUyB2NC4wLjBcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3RhaWx3aW5kbGFicy90YWlsd2luZGNzcy9ibG9iL3Y0LjAuMC9wYWNrYWdlcy90YWlsd2luZGNzcy9zcmMvdXRpbGl0aWVzLnRzI0w0MTU4XG4gICAgICAgKi9cbiAgICAgICdyaW5nLXctaW5zZXQnOiBbJ3JpbmctaW5zZXQnXSxcbiAgICAgIC8qKlxuICAgICAgICogUmluZyBDb2xvclxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JveC1zaGFkb3cjc2V0dGluZy10aGUtcmluZy1jb2xvclxuICAgICAgICovXG4gICAgICAncmluZy1jb2xvcic6IFt7XG4gICAgICAgIHJpbmc6IHNjYWxlQ29sb3IoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFJpbmcgT2Zmc2V0IFdpZHRoXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdjMudGFpbHdpbmRjc3MuY29tL2RvY3MvcmluZy1vZmZzZXQtd2lkdGhcbiAgICAgICAqIEBkZXByZWNhdGVkIHNpbmNlIFRhaWx3aW5kIENTUyB2NC4wLjBcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3RhaWx3aW5kbGFicy90YWlsd2luZGNzcy9ibG9iL3Y0LjAuMC9wYWNrYWdlcy90YWlsd2luZGNzcy9zcmMvdXRpbGl0aWVzLnRzI0w0MTU4XG4gICAgICAgKi9cbiAgICAgICdyaW5nLW9mZnNldC13JzogW3tcbiAgICAgICAgJ3Jpbmctb2Zmc2V0JzogW2lzTnVtYmVyLCBpc0FyYml0cmFyeUxlbmd0aF1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBSaW5nIE9mZnNldCBDb2xvclxuICAgICAgICogQHNlZSBodHRwczovL3YzLnRhaWx3aW5kY3NzLmNvbS9kb2NzL3Jpbmctb2Zmc2V0LWNvbG9yXG4gICAgICAgKiBAZGVwcmVjYXRlZCBzaW5jZSBUYWlsd2luZCBDU1MgdjQuMC4wXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS90YWlsd2luZGxhYnMvdGFpbHdpbmRjc3MvYmxvYi92NC4wLjAvcGFja2FnZXMvdGFpbHdpbmRjc3Mvc3JjL3V0aWxpdGllcy50cyNMNDE1OFxuICAgICAgICovXG4gICAgICAncmluZy1vZmZzZXQtY29sb3InOiBbe1xuICAgICAgICAncmluZy1vZmZzZXQnOiBzY2FsZUNvbG9yKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBJbnNldCBSaW5nIFdpZHRoXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYm94LXNoYWRvdyNhZGRpbmctYW4taW5zZXQtcmluZ1xuICAgICAgICovXG4gICAgICAnaW5zZXQtcmluZy13JzogW3tcbiAgICAgICAgJ2luc2V0LXJpbmcnOiBzY2FsZUJvcmRlcldpZHRoKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBJbnNldCBSaW5nIENvbG9yXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYm94LXNoYWRvdyNzZXR0aW5nLXRoZS1pbnNldC1yaW5nLWNvbG9yXG4gICAgICAgKi9cbiAgICAgICdpbnNldC1yaW5nLWNvbG9yJzogW3tcbiAgICAgICAgJ2luc2V0LXJpbmcnOiBzY2FsZUNvbG9yKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBUZXh0IFNoYWRvd1xuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RleHQtc2hhZG93XG4gICAgICAgKi9cbiAgICAgICd0ZXh0LXNoYWRvdyc6IFt7XG4gICAgICAgICd0ZXh0LXNoYWRvdyc6IFsnbm9uZScsIHRoZW1lVGV4dFNoYWRvdywgaXNBcmJpdHJhcnlWYXJpYWJsZVNoYWRvdywgaXNBcmJpdHJhcnlTaGFkb3ddXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogVGV4dCBTaGFkb3cgQ29sb3JcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy90ZXh0LXNoYWRvdyNzZXR0aW5nLXRoZS1zaGFkb3ctY29sb3JcbiAgICAgICAqL1xuICAgICAgJ3RleHQtc2hhZG93LWNvbG9yJzogW3tcbiAgICAgICAgJ3RleHQtc2hhZG93Jzogc2NhbGVDb2xvcigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogT3BhY2l0eVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL29wYWNpdHlcbiAgICAgICAqL1xuICAgICAgb3BhY2l0eTogW3tcbiAgICAgICAgb3BhY2l0eTogW2lzTnVtYmVyLCBpc0FyYml0cmFyeVZhcmlhYmxlLCBpc0FyYml0cmFyeVZhbHVlXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIE1peCBCbGVuZCBNb2RlXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvbWl4LWJsZW5kLW1vZGVcbiAgICAgICAqL1xuICAgICAgJ21peC1ibGVuZCc6IFt7XG4gICAgICAgICdtaXgtYmxlbmQnOiBbLi4uc2NhbGVCbGVuZE1vZGUoKSwgJ3BsdXMtZGFya2VyJywgJ3BsdXMtbGlnaHRlciddXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQmFja2dyb3VuZCBCbGVuZCBNb2RlXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYmFja2dyb3VuZC1ibGVuZC1tb2RlXG4gICAgICAgKi9cbiAgICAgICdiZy1ibGVuZCc6IFt7XG4gICAgICAgICdiZy1ibGVuZCc6IHNjYWxlQmxlbmRNb2RlKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBNYXNrIENsaXBcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9tYXNrLWNsaXBcbiAgICAgICAqL1xuICAgICAgJ21hc2stY2xpcCc6IFt7XG4gICAgICAgICdtYXNrLWNsaXAnOiBbJ2JvcmRlcicsICdwYWRkaW5nJywgJ2NvbnRlbnQnLCAnZmlsbCcsICdzdHJva2UnLCAndmlldyddXG4gICAgICB9LCAnbWFzay1uby1jbGlwJ10sXG4gICAgICAvKipcbiAgICAgICAqIE1hc2sgQ29tcG9zaXRlXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvbWFzay1jb21wb3NpdGVcbiAgICAgICAqL1xuICAgICAgJ21hc2stY29tcG9zaXRlJzogW3tcbiAgICAgICAgbWFzazogWydhZGQnLCAnc3VidHJhY3QnLCAnaW50ZXJzZWN0JywgJ2V4Y2x1ZGUnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIE1hc2sgSW1hZ2VcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9tYXNrLWltYWdlXG4gICAgICAgKi9cbiAgICAgICdtYXNrLWltYWdlLWxpbmVhci1wb3MnOiBbe1xuICAgICAgICAnbWFzay1saW5lYXInOiBbaXNOdW1iZXJdXG4gICAgICB9XSxcbiAgICAgICdtYXNrLWltYWdlLWxpbmVhci1mcm9tLXBvcyc6IFt7XG4gICAgICAgICdtYXNrLWxpbmVhci1mcm9tJzogc2NhbGVNYXNrSW1hZ2VQb3NpdGlvbigpXG4gICAgICB9XSxcbiAgICAgICdtYXNrLWltYWdlLWxpbmVhci10by1wb3MnOiBbe1xuICAgICAgICAnbWFzay1saW5lYXItdG8nOiBzY2FsZU1hc2tJbWFnZVBvc2l0aW9uKClcbiAgICAgIH1dLFxuICAgICAgJ21hc2staW1hZ2UtbGluZWFyLWZyb20tY29sb3InOiBbe1xuICAgICAgICAnbWFzay1saW5lYXItZnJvbSc6IHNjYWxlQ29sb3IoKVxuICAgICAgfV0sXG4gICAgICAnbWFzay1pbWFnZS1saW5lYXItdG8tY29sb3InOiBbe1xuICAgICAgICAnbWFzay1saW5lYXItdG8nOiBzY2FsZUNvbG9yKClcbiAgICAgIH1dLFxuICAgICAgJ21hc2staW1hZ2UtdC1mcm9tLXBvcyc6IFt7XG4gICAgICAgICdtYXNrLXQtZnJvbSc6IHNjYWxlTWFza0ltYWdlUG9zaXRpb24oKVxuICAgICAgfV0sXG4gICAgICAnbWFzay1pbWFnZS10LXRvLXBvcyc6IFt7XG4gICAgICAgICdtYXNrLXQtdG8nOiBzY2FsZU1hc2tJbWFnZVBvc2l0aW9uKClcbiAgICAgIH1dLFxuICAgICAgJ21hc2staW1hZ2UtdC1mcm9tLWNvbG9yJzogW3tcbiAgICAgICAgJ21hc2stdC1mcm9tJzogc2NhbGVDb2xvcigpXG4gICAgICB9XSxcbiAgICAgICdtYXNrLWltYWdlLXQtdG8tY29sb3InOiBbe1xuICAgICAgICAnbWFzay10LXRvJzogc2NhbGVDb2xvcigpXG4gICAgICB9XSxcbiAgICAgICdtYXNrLWltYWdlLXItZnJvbS1wb3MnOiBbe1xuICAgICAgICAnbWFzay1yLWZyb20nOiBzY2FsZU1hc2tJbWFnZVBvc2l0aW9uKClcbiAgICAgIH1dLFxuICAgICAgJ21hc2staW1hZ2Utci10by1wb3MnOiBbe1xuICAgICAgICAnbWFzay1yLXRvJzogc2NhbGVNYXNrSW1hZ2VQb3NpdGlvbigpXG4gICAgICB9XSxcbiAgICAgICdtYXNrLWltYWdlLXItZnJvbS1jb2xvcic6IFt7XG4gICAgICAgICdtYXNrLXItZnJvbSc6IHNjYWxlQ29sb3IoKVxuICAgICAgfV0sXG4gICAgICAnbWFzay1pbWFnZS1yLXRvLWNvbG9yJzogW3tcbiAgICAgICAgJ21hc2stci10byc6IHNjYWxlQ29sb3IoKVxuICAgICAgfV0sXG4gICAgICAnbWFzay1pbWFnZS1iLWZyb20tcG9zJzogW3tcbiAgICAgICAgJ21hc2stYi1mcm9tJzogc2NhbGVNYXNrSW1hZ2VQb3NpdGlvbigpXG4gICAgICB9XSxcbiAgICAgICdtYXNrLWltYWdlLWItdG8tcG9zJzogW3tcbiAgICAgICAgJ21hc2stYi10byc6IHNjYWxlTWFza0ltYWdlUG9zaXRpb24oKVxuICAgICAgfV0sXG4gICAgICAnbWFzay1pbWFnZS1iLWZyb20tY29sb3InOiBbe1xuICAgICAgICAnbWFzay1iLWZyb20nOiBzY2FsZUNvbG9yKClcbiAgICAgIH1dLFxuICAgICAgJ21hc2staW1hZ2UtYi10by1jb2xvcic6IFt7XG4gICAgICAgICdtYXNrLWItdG8nOiBzY2FsZUNvbG9yKClcbiAgICAgIH1dLFxuICAgICAgJ21hc2staW1hZ2UtbC1mcm9tLXBvcyc6IFt7XG4gICAgICAgICdtYXNrLWwtZnJvbSc6IHNjYWxlTWFza0ltYWdlUG9zaXRpb24oKVxuICAgICAgfV0sXG4gICAgICAnbWFzay1pbWFnZS1sLXRvLXBvcyc6IFt7XG4gICAgICAgICdtYXNrLWwtdG8nOiBzY2FsZU1hc2tJbWFnZVBvc2l0aW9uKClcbiAgICAgIH1dLFxuICAgICAgJ21hc2staW1hZ2UtbC1mcm9tLWNvbG9yJzogW3tcbiAgICAgICAgJ21hc2stbC1mcm9tJzogc2NhbGVDb2xvcigpXG4gICAgICB9XSxcbiAgICAgICdtYXNrLWltYWdlLWwtdG8tY29sb3InOiBbe1xuICAgICAgICAnbWFzay1sLXRvJzogc2NhbGVDb2xvcigpXG4gICAgICB9XSxcbiAgICAgICdtYXNrLWltYWdlLXgtZnJvbS1wb3MnOiBbe1xuICAgICAgICAnbWFzay14LWZyb20nOiBzY2FsZU1hc2tJbWFnZVBvc2l0aW9uKClcbiAgICAgIH1dLFxuICAgICAgJ21hc2staW1hZ2UteC10by1wb3MnOiBbe1xuICAgICAgICAnbWFzay14LXRvJzogc2NhbGVNYXNrSW1hZ2VQb3NpdGlvbigpXG4gICAgICB9XSxcbiAgICAgICdtYXNrLWltYWdlLXgtZnJvbS1jb2xvcic6IFt7XG4gICAgICAgICdtYXNrLXgtZnJvbSc6IHNjYWxlQ29sb3IoKVxuICAgICAgfV0sXG4gICAgICAnbWFzay1pbWFnZS14LXRvLWNvbG9yJzogW3tcbiAgICAgICAgJ21hc2steC10byc6IHNjYWxlQ29sb3IoKVxuICAgICAgfV0sXG4gICAgICAnbWFzay1pbWFnZS15LWZyb20tcG9zJzogW3tcbiAgICAgICAgJ21hc2steS1mcm9tJzogc2NhbGVNYXNrSW1hZ2VQb3NpdGlvbigpXG4gICAgICB9XSxcbiAgICAgICdtYXNrLWltYWdlLXktdG8tcG9zJzogW3tcbiAgICAgICAgJ21hc2steS10byc6IHNjYWxlTWFza0ltYWdlUG9zaXRpb24oKVxuICAgICAgfV0sXG4gICAgICAnbWFzay1pbWFnZS15LWZyb20tY29sb3InOiBbe1xuICAgICAgICAnbWFzay15LWZyb20nOiBzY2FsZUNvbG9yKClcbiAgICAgIH1dLFxuICAgICAgJ21hc2staW1hZ2UteS10by1jb2xvcic6IFt7XG4gICAgICAgICdtYXNrLXktdG8nOiBzY2FsZUNvbG9yKClcbiAgICAgIH1dLFxuICAgICAgJ21hc2staW1hZ2UtcmFkaWFsJzogW3tcbiAgICAgICAgJ21hc2stcmFkaWFsJzogW2lzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdXG4gICAgICB9XSxcbiAgICAgICdtYXNrLWltYWdlLXJhZGlhbC1mcm9tLXBvcyc6IFt7XG4gICAgICAgICdtYXNrLXJhZGlhbC1mcm9tJzogc2NhbGVNYXNrSW1hZ2VQb3NpdGlvbigpXG4gICAgICB9XSxcbiAgICAgICdtYXNrLWltYWdlLXJhZGlhbC10by1wb3MnOiBbe1xuICAgICAgICAnbWFzay1yYWRpYWwtdG8nOiBzY2FsZU1hc2tJbWFnZVBvc2l0aW9uKClcbiAgICAgIH1dLFxuICAgICAgJ21hc2staW1hZ2UtcmFkaWFsLWZyb20tY29sb3InOiBbe1xuICAgICAgICAnbWFzay1yYWRpYWwtZnJvbSc6IHNjYWxlQ29sb3IoKVxuICAgICAgfV0sXG4gICAgICAnbWFzay1pbWFnZS1yYWRpYWwtdG8tY29sb3InOiBbe1xuICAgICAgICAnbWFzay1yYWRpYWwtdG8nOiBzY2FsZUNvbG9yKClcbiAgICAgIH1dLFxuICAgICAgJ21hc2staW1hZ2UtcmFkaWFsLXNoYXBlJzogW3tcbiAgICAgICAgJ21hc2stcmFkaWFsJzogWydjaXJjbGUnLCAnZWxsaXBzZSddXG4gICAgICB9XSxcbiAgICAgICdtYXNrLWltYWdlLXJhZGlhbC1zaXplJzogW3tcbiAgICAgICAgJ21hc2stcmFkaWFsJzogW3tcbiAgICAgICAgICBjbG9zZXN0OiBbJ3NpZGUnLCAnY29ybmVyJ10sXG4gICAgICAgICAgZmFydGhlc3Q6IFsnc2lkZScsICdjb3JuZXInXVxuICAgICAgICB9XVxuICAgICAgfV0sXG4gICAgICAnbWFzay1pbWFnZS1yYWRpYWwtcG9zJzogW3tcbiAgICAgICAgJ21hc2stcmFkaWFsLWF0Jzogc2NhbGVQb3NpdGlvbigpXG4gICAgICB9XSxcbiAgICAgICdtYXNrLWltYWdlLWNvbmljLXBvcyc6IFt7XG4gICAgICAgICdtYXNrLWNvbmljJzogW2lzTnVtYmVyXVxuICAgICAgfV0sXG4gICAgICAnbWFzay1pbWFnZS1jb25pYy1mcm9tLXBvcyc6IFt7XG4gICAgICAgICdtYXNrLWNvbmljLWZyb20nOiBzY2FsZU1hc2tJbWFnZVBvc2l0aW9uKClcbiAgICAgIH1dLFxuICAgICAgJ21hc2staW1hZ2UtY29uaWMtdG8tcG9zJzogW3tcbiAgICAgICAgJ21hc2stY29uaWMtdG8nOiBzY2FsZU1hc2tJbWFnZVBvc2l0aW9uKClcbiAgICAgIH1dLFxuICAgICAgJ21hc2staW1hZ2UtY29uaWMtZnJvbS1jb2xvcic6IFt7XG4gICAgICAgICdtYXNrLWNvbmljLWZyb20nOiBzY2FsZUNvbG9yKClcbiAgICAgIH1dLFxuICAgICAgJ21hc2staW1hZ2UtY29uaWMtdG8tY29sb3InOiBbe1xuICAgICAgICAnbWFzay1jb25pYy10byc6IHNjYWxlQ29sb3IoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIE1hc2sgTW9kZVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL21hc2stbW9kZVxuICAgICAgICovXG4gICAgICAnbWFzay1tb2RlJzogW3tcbiAgICAgICAgbWFzazogWydhbHBoYScsICdsdW1pbmFuY2UnLCAnbWF0Y2gnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIE1hc2sgT3JpZ2luXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvbWFzay1vcmlnaW5cbiAgICAgICAqL1xuICAgICAgJ21hc2stb3JpZ2luJzogW3tcbiAgICAgICAgJ21hc2stb3JpZ2luJzogWydib3JkZXInLCAncGFkZGluZycsICdjb250ZW50JywgJ2ZpbGwnLCAnc3Ryb2tlJywgJ3ZpZXcnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIE1hc2sgUG9zaXRpb25cbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9tYXNrLXBvc2l0aW9uXG4gICAgICAgKi9cbiAgICAgICdtYXNrLXBvc2l0aW9uJzogW3tcbiAgICAgICAgbWFzazogc2NhbGVCZ1Bvc2l0aW9uKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBNYXNrIFJlcGVhdFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL21hc2stcmVwZWF0XG4gICAgICAgKi9cbiAgICAgICdtYXNrLXJlcGVhdCc6IFt7XG4gICAgICAgIG1hc2s6IHNjYWxlQmdSZXBlYXQoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIE1hc2sgU2l6ZVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL21hc2stc2l6ZVxuICAgICAgICovXG4gICAgICAnbWFzay1zaXplJzogW3tcbiAgICAgICAgbWFzazogc2NhbGVCZ1NpemUoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIE1hc2sgVHlwZVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL21hc2stdHlwZVxuICAgICAgICovXG4gICAgICAnbWFzay10eXBlJzogW3tcbiAgICAgICAgJ21hc2stdHlwZSc6IFsnYWxwaGEnLCAnbHVtaW5hbmNlJ11cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBNYXNrIEltYWdlXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvbWFzay1pbWFnZVxuICAgICAgICovXG4gICAgICAnbWFzay1pbWFnZSc6IFt7XG4gICAgICAgIG1hc2s6IFsnbm9uZScsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdXG4gICAgICB9XSxcbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gLS0tIEZpbHRlcnMgLS0tXG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8qKlxuICAgICAgICogRmlsdGVyXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvZmlsdGVyXG4gICAgICAgKi9cbiAgICAgIGZpbHRlcjogW3tcbiAgICAgICAgZmlsdGVyOiBbXG4gICAgICAgIC8vIERlcHJlY2F0ZWQgc2luY2UgVGFpbHdpbmQgQ1NTIHYzLjAuMFxuICAgICAgICAnJywgJ25vbmUnLCBpc0FyYml0cmFyeVZhcmlhYmxlLCBpc0FyYml0cmFyeVZhbHVlXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJsdXJcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ibHVyXG4gICAgICAgKi9cbiAgICAgIGJsdXI6IFt7XG4gICAgICAgIGJsdXI6IHNjYWxlQmx1cigpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQnJpZ2h0bmVzc1xuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JyaWdodG5lc3NcbiAgICAgICAqL1xuICAgICAgYnJpZ2h0bmVzczogW3tcbiAgICAgICAgYnJpZ2h0bmVzczogW2lzTnVtYmVyLCBpc0FyYml0cmFyeVZhcmlhYmxlLCBpc0FyYml0cmFyeVZhbHVlXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIENvbnRyYXN0XG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvY29udHJhc3RcbiAgICAgICAqL1xuICAgICAgY29udHJhc3Q6IFt7XG4gICAgICAgIGNvbnRyYXN0OiBbaXNOdW1iZXIsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogRHJvcCBTaGFkb3dcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9kcm9wLXNoYWRvd1xuICAgICAgICovXG4gICAgICAnZHJvcC1zaGFkb3cnOiBbe1xuICAgICAgICAnZHJvcC1zaGFkb3cnOiBbXG4gICAgICAgIC8vIERlcHJlY2F0ZWQgc2luY2UgVGFpbHdpbmQgQ1NTIHY0LjAuMFxuICAgICAgICAnJywgJ25vbmUnLCB0aGVtZURyb3BTaGFkb3csIGlzQXJiaXRyYXJ5VmFyaWFibGVTaGFkb3csIGlzQXJiaXRyYXJ5U2hhZG93XVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIERyb3AgU2hhZG93IENvbG9yXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvZmlsdGVyLWRyb3Atc2hhZG93I3NldHRpbmctdGhlLXNoYWRvdy1jb2xvclxuICAgICAgICovXG4gICAgICAnZHJvcC1zaGFkb3ctY29sb3InOiBbe1xuICAgICAgICAnZHJvcC1zaGFkb3cnOiBzY2FsZUNvbG9yKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBHcmF5c2NhbGVcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ncmF5c2NhbGVcbiAgICAgICAqL1xuICAgICAgZ3JheXNjYWxlOiBbe1xuICAgICAgICBncmF5c2NhbGU6IFsnJywgaXNOdW1iZXIsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogSHVlIFJvdGF0ZVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2h1ZS1yb3RhdGVcbiAgICAgICAqL1xuICAgICAgJ2h1ZS1yb3RhdGUnOiBbe1xuICAgICAgICAnaHVlLXJvdGF0ZSc6IFtpc051bWJlciwgaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlWYWx1ZV1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBJbnZlcnRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9pbnZlcnRcbiAgICAgICAqL1xuICAgICAgaW52ZXJ0OiBbe1xuICAgICAgICBpbnZlcnQ6IFsnJywgaXNOdW1iZXIsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogU2F0dXJhdGVcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9zYXR1cmF0ZVxuICAgICAgICovXG4gICAgICBzYXR1cmF0ZTogW3tcbiAgICAgICAgc2F0dXJhdGU6IFtpc051bWJlciwgaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlWYWx1ZV1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBTZXBpYVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3NlcGlhXG4gICAgICAgKi9cbiAgICAgIHNlcGlhOiBbe1xuICAgICAgICBzZXBpYTogWycnLCBpc051bWJlciwgaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlWYWx1ZV1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBCYWNrZHJvcCBGaWx0ZXJcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9iYWNrZHJvcC1maWx0ZXJcbiAgICAgICAqL1xuICAgICAgJ2JhY2tkcm9wLWZpbHRlcic6IFt7XG4gICAgICAgICdiYWNrZHJvcC1maWx0ZXInOiBbXG4gICAgICAgIC8vIERlcHJlY2F0ZWQgc2luY2UgVGFpbHdpbmQgQ1NTIHYzLjAuMFxuICAgICAgICAnJywgJ25vbmUnLCBpc0FyYml0cmFyeVZhcmlhYmxlLCBpc0FyYml0cmFyeVZhbHVlXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJhY2tkcm9wIEJsdXJcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9iYWNrZHJvcC1ibHVyXG4gICAgICAgKi9cbiAgICAgICdiYWNrZHJvcC1ibHVyJzogW3tcbiAgICAgICAgJ2JhY2tkcm9wLWJsdXInOiBzY2FsZUJsdXIoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJhY2tkcm9wIEJyaWdodG5lc3NcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9iYWNrZHJvcC1icmlnaHRuZXNzXG4gICAgICAgKi9cbiAgICAgICdiYWNrZHJvcC1icmlnaHRuZXNzJzogW3tcbiAgICAgICAgJ2JhY2tkcm9wLWJyaWdodG5lc3MnOiBbaXNOdW1iZXIsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQmFja2Ryb3AgQ29udHJhc3RcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9iYWNrZHJvcC1jb250cmFzdFxuICAgICAgICovXG4gICAgICAnYmFja2Ryb3AtY29udHJhc3QnOiBbe1xuICAgICAgICAnYmFja2Ryb3AtY29udHJhc3QnOiBbaXNOdW1iZXIsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQmFja2Ryb3AgR3JheXNjYWxlXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYmFja2Ryb3AtZ3JheXNjYWxlXG4gICAgICAgKi9cbiAgICAgICdiYWNrZHJvcC1ncmF5c2NhbGUnOiBbe1xuICAgICAgICAnYmFja2Ryb3AtZ3JheXNjYWxlJzogWycnLCBpc051bWJlciwgaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlWYWx1ZV1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBCYWNrZHJvcCBIdWUgUm90YXRlXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYmFja2Ryb3AtaHVlLXJvdGF0ZVxuICAgICAgICovXG4gICAgICAnYmFja2Ryb3AtaHVlLXJvdGF0ZSc6IFt7XG4gICAgICAgICdiYWNrZHJvcC1odWUtcm90YXRlJzogW2lzTnVtYmVyLCBpc0FyYml0cmFyeVZhcmlhYmxlLCBpc0FyYml0cmFyeVZhbHVlXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJhY2tkcm9wIEludmVydFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JhY2tkcm9wLWludmVydFxuICAgICAgICovXG4gICAgICAnYmFja2Ryb3AtaW52ZXJ0JzogW3tcbiAgICAgICAgJ2JhY2tkcm9wLWludmVydCc6IFsnJywgaXNOdW1iZXIsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQmFja2Ryb3AgT3BhY2l0eVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JhY2tkcm9wLW9wYWNpdHlcbiAgICAgICAqL1xuICAgICAgJ2JhY2tkcm9wLW9wYWNpdHknOiBbe1xuICAgICAgICAnYmFja2Ryb3Atb3BhY2l0eSc6IFtpc051bWJlciwgaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlWYWx1ZV1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBCYWNrZHJvcCBTYXR1cmF0ZVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JhY2tkcm9wLXNhdHVyYXRlXG4gICAgICAgKi9cbiAgICAgICdiYWNrZHJvcC1zYXR1cmF0ZSc6IFt7XG4gICAgICAgICdiYWNrZHJvcC1zYXR1cmF0ZSc6IFtpc051bWJlciwgaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlWYWx1ZV1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBCYWNrZHJvcCBTZXBpYVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2JhY2tkcm9wLXNlcGlhXG4gICAgICAgKi9cbiAgICAgICdiYWNrZHJvcC1zZXBpYSc6IFt7XG4gICAgICAgICdiYWNrZHJvcC1zZXBpYSc6IFsnJywgaXNOdW1iZXIsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdXG4gICAgICB9XSxcbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyAtLS0gVGFibGVzIC0tLVxuICAgICAgLy8gLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8qKlxuICAgICAgICogQm9yZGVyIENvbGxhcHNlXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYm9yZGVyLWNvbGxhcHNlXG4gICAgICAgKi9cbiAgICAgICdib3JkZXItY29sbGFwc2UnOiBbe1xuICAgICAgICBib3JkZXI6IFsnY29sbGFwc2UnLCAnc2VwYXJhdGUnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJvcmRlciBTcGFjaW5nXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYm9yZGVyLXNwYWNpbmdcbiAgICAgICAqL1xuICAgICAgJ2JvcmRlci1zcGFjaW5nJzogW3tcbiAgICAgICAgJ2JvcmRlci1zcGFjaW5nJzogc2NhbGVVbmFtYmlndW91c1NwYWNpbmcoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJvcmRlciBTcGFjaW5nIFhcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ib3JkZXItc3BhY2luZ1xuICAgICAgICovXG4gICAgICAnYm9yZGVyLXNwYWNpbmcteCc6IFt7XG4gICAgICAgICdib3JkZXItc3BhY2luZy14Jzogc2NhbGVVbmFtYmlndW91c1NwYWNpbmcoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEJvcmRlciBTcGFjaW5nIFlcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9ib3JkZXItc3BhY2luZ1xuICAgICAgICovXG4gICAgICAnYm9yZGVyLXNwYWNpbmcteSc6IFt7XG4gICAgICAgICdib3JkZXItc3BhY2luZy15Jzogc2NhbGVVbmFtYmlndW91c1NwYWNpbmcoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFRhYmxlIExheW91dFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RhYmxlLWxheW91dFxuICAgICAgICovXG4gICAgICAndGFibGUtbGF5b3V0JzogW3tcbiAgICAgICAgdGFibGU6IFsnYXV0bycsICdmaXhlZCddXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQ2FwdGlvbiBTaWRlXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvY2FwdGlvbi1zaWRlXG4gICAgICAgKi9cbiAgICAgIGNhcHRpb246IFt7XG4gICAgICAgIGNhcHRpb246IFsndG9wJywgJ2JvdHRvbSddXG4gICAgICB9XSxcbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gLS0tIFRyYW5zaXRpb25zIGFuZCBBbmltYXRpb24gLS0tXG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8qKlxuICAgICAgICogVHJhbnNpdGlvbiBQcm9wZXJ0eVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RyYW5zaXRpb24tcHJvcGVydHlcbiAgICAgICAqL1xuICAgICAgdHJhbnNpdGlvbjogW3tcbiAgICAgICAgdHJhbnNpdGlvbjogWycnLCAnYWxsJywgJ2NvbG9ycycsICdvcGFjaXR5JywgJ3NoYWRvdycsICd0cmFuc2Zvcm0nLCAnbm9uZScsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogVHJhbnNpdGlvbiBCZWhhdmlvclxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RyYW5zaXRpb24tYmVoYXZpb3JcbiAgICAgICAqL1xuICAgICAgJ3RyYW5zaXRpb24tYmVoYXZpb3InOiBbe1xuICAgICAgICB0cmFuc2l0aW9uOiBbJ25vcm1hbCcsICdkaXNjcmV0ZSddXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogVHJhbnNpdGlvbiBEdXJhdGlvblxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RyYW5zaXRpb24tZHVyYXRpb25cbiAgICAgICAqL1xuICAgICAgZHVyYXRpb246IFt7XG4gICAgICAgIGR1cmF0aW9uOiBbaXNOdW1iZXIsICdpbml0aWFsJywgaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlWYWx1ZV1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBUcmFuc2l0aW9uIFRpbWluZyBGdW5jdGlvblxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uXG4gICAgICAgKi9cbiAgICAgIGVhc2U6IFt7XG4gICAgICAgIGVhc2U6IFsnbGluZWFyJywgJ2luaXRpYWwnLCB0aGVtZUVhc2UsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogVHJhbnNpdGlvbiBEZWxheVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RyYW5zaXRpb24tZGVsYXlcbiAgICAgICAqL1xuICAgICAgZGVsYXk6IFt7XG4gICAgICAgIGRlbGF5OiBbaXNOdW1iZXIsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQW5pbWF0aW9uXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYW5pbWF0aW9uXG4gICAgICAgKi9cbiAgICAgIGFuaW1hdGU6IFt7XG4gICAgICAgIGFuaW1hdGU6IFsnbm9uZScsIHRoZW1lQW5pbWF0ZSwgaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlWYWx1ZV1cbiAgICAgIH1dLFxuICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyAtLS0gVHJhbnNmb3JtcyAtLS1cbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLyoqXG4gICAgICAgKiBCYWNrZmFjZSBWaXNpYmlsaXR5XG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYmFja2ZhY2UtdmlzaWJpbGl0eVxuICAgICAgICovXG4gICAgICBiYWNrZmFjZTogW3tcbiAgICAgICAgYmFja2ZhY2U6IFsnaGlkZGVuJywgJ3Zpc2libGUnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFBlcnNwZWN0aXZlXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvcGVyc3BlY3RpdmVcbiAgICAgICAqL1xuICAgICAgcGVyc3BlY3RpdmU6IFt7XG4gICAgICAgIHBlcnNwZWN0aXZlOiBbdGhlbWVQZXJzcGVjdGl2ZSwgaXNBcmJpdHJhcnlWYXJpYWJsZSwgaXNBcmJpdHJhcnlWYWx1ZV1cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBQZXJzcGVjdGl2ZSBPcmlnaW5cbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9wZXJzcGVjdGl2ZS1vcmlnaW5cbiAgICAgICAqL1xuICAgICAgJ3BlcnNwZWN0aXZlLW9yaWdpbic6IFt7XG4gICAgICAgICdwZXJzcGVjdGl2ZS1vcmlnaW4nOiBzY2FsZVBvc2l0aW9uV2l0aEFyYml0cmFyeSgpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogUm90YXRlXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3Mvcm90YXRlXG4gICAgICAgKi9cbiAgICAgIHJvdGF0ZTogW3tcbiAgICAgICAgcm90YXRlOiBzY2FsZVJvdGF0ZSgpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogUm90YXRlIFhcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9yb3RhdGVcbiAgICAgICAqL1xuICAgICAgJ3JvdGF0ZS14JzogW3tcbiAgICAgICAgJ3JvdGF0ZS14Jzogc2NhbGVSb3RhdGUoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFJvdGF0ZSBZXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3Mvcm90YXRlXG4gICAgICAgKi9cbiAgICAgICdyb3RhdGUteSc6IFt7XG4gICAgICAgICdyb3RhdGUteSc6IHNjYWxlUm90YXRlKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBSb3RhdGUgWlxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3JvdGF0ZVxuICAgICAgICovXG4gICAgICAncm90YXRlLXonOiBbe1xuICAgICAgICAncm90YXRlLXonOiBzY2FsZVJvdGF0ZSgpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogU2NhbGVcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9zY2FsZVxuICAgICAgICovXG4gICAgICBzY2FsZTogW3tcbiAgICAgICAgc2NhbGU6IHNjYWxlU2NhbGUoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFNjYWxlIFhcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9zY2FsZVxuICAgICAgICovXG4gICAgICAnc2NhbGUteCc6IFt7XG4gICAgICAgICdzY2FsZS14Jzogc2NhbGVTY2FsZSgpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogU2NhbGUgWVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3NjYWxlXG4gICAgICAgKi9cbiAgICAgICdzY2FsZS15JzogW3tcbiAgICAgICAgJ3NjYWxlLXknOiBzY2FsZVNjYWxlKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBTY2FsZSBaXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3Mvc2NhbGVcbiAgICAgICAqL1xuICAgICAgJ3NjYWxlLXonOiBbe1xuICAgICAgICAnc2NhbGUteic6IHNjYWxlU2NhbGUoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFNjYWxlIDNEXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3Mvc2NhbGVcbiAgICAgICAqL1xuICAgICAgJ3NjYWxlLTNkJzogWydzY2FsZS0zZCddLFxuICAgICAgLyoqXG4gICAgICAgKiBTa2V3XG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3Mvc2tld1xuICAgICAgICovXG4gICAgICBza2V3OiBbe1xuICAgICAgICBza2V3OiBzY2FsZVNrZXcoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFNrZXcgWFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3NrZXdcbiAgICAgICAqL1xuICAgICAgJ3NrZXcteCc6IFt7XG4gICAgICAgICdza2V3LXgnOiBzY2FsZVNrZXcoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFNrZXcgWVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3NrZXdcbiAgICAgICAqL1xuICAgICAgJ3NrZXcteSc6IFt7XG4gICAgICAgICdza2V3LXknOiBzY2FsZVNrZXcoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFRyYW5zZm9ybVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RyYW5zZm9ybVxuICAgICAgICovXG4gICAgICB0cmFuc2Zvcm06IFt7XG4gICAgICAgIHRyYW5zZm9ybTogW2lzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWUsICcnLCAnbm9uZScsICdncHUnLCAnY3B1J11cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBUcmFuc2Zvcm0gT3JpZ2luXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvdHJhbnNmb3JtLW9yaWdpblxuICAgICAgICovXG4gICAgICAndHJhbnNmb3JtLW9yaWdpbic6IFt7XG4gICAgICAgIG9yaWdpbjogc2NhbGVQb3NpdGlvbldpdGhBcmJpdHJhcnkoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFRyYW5zZm9ybSBTdHlsZVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RyYW5zZm9ybS1zdHlsZVxuICAgICAgICovXG4gICAgICAndHJhbnNmb3JtLXN0eWxlJzogW3tcbiAgICAgICAgdHJhbnNmb3JtOiBbJzNkJywgJ2ZsYXQnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFRyYW5zbGF0ZVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RyYW5zbGF0ZVxuICAgICAgICovXG4gICAgICB0cmFuc2xhdGU6IFt7XG4gICAgICAgIHRyYW5zbGF0ZTogc2NhbGVUcmFuc2xhdGUoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFRyYW5zbGF0ZSBYXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvdHJhbnNsYXRlXG4gICAgICAgKi9cbiAgICAgICd0cmFuc2xhdGUteCc6IFt7XG4gICAgICAgICd0cmFuc2xhdGUteCc6IHNjYWxlVHJhbnNsYXRlKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBUcmFuc2xhdGUgWVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RyYW5zbGF0ZVxuICAgICAgICovXG4gICAgICAndHJhbnNsYXRlLXknOiBbe1xuICAgICAgICAndHJhbnNsYXRlLXknOiBzY2FsZVRyYW5zbGF0ZSgpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogVHJhbnNsYXRlIFpcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy90cmFuc2xhdGVcbiAgICAgICAqL1xuICAgICAgJ3RyYW5zbGF0ZS16JzogW3tcbiAgICAgICAgJ3RyYW5zbGF0ZS16Jzogc2NhbGVUcmFuc2xhdGUoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFRyYW5zbGF0ZSBOb25lXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvdHJhbnNsYXRlXG4gICAgICAgKi9cbiAgICAgICd0cmFuc2xhdGUtbm9uZSc6IFsndHJhbnNsYXRlLW5vbmUnXSxcbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gLS0tIEludGVyYWN0aXZpdHkgLS0tXG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8qKlxuICAgICAgICogQWNjZW50IENvbG9yXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYWNjZW50LWNvbG9yXG4gICAgICAgKi9cbiAgICAgIGFjY2VudDogW3tcbiAgICAgICAgYWNjZW50OiBzY2FsZUNvbG9yKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBBcHBlYXJhbmNlXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvYXBwZWFyYW5jZVxuICAgICAgICovXG4gICAgICBhcHBlYXJhbmNlOiBbe1xuICAgICAgICBhcHBlYXJhbmNlOiBbJ25vbmUnLCAnYXV0byddXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogQ2FyZXQgQ29sb3JcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9qdXN0LWluLXRpbWUtbW9kZSNjYXJldC1jb2xvci11dGlsaXRpZXNcbiAgICAgICAqL1xuICAgICAgJ2NhcmV0LWNvbG9yJzogW3tcbiAgICAgICAgY2FyZXQ6IHNjYWxlQ29sb3IoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIENvbG9yIFNjaGVtZVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2NvbG9yLXNjaGVtZVxuICAgICAgICovXG4gICAgICAnY29sb3Itc2NoZW1lJzogW3tcbiAgICAgICAgc2NoZW1lOiBbJ25vcm1hbCcsICdkYXJrJywgJ2xpZ2h0JywgJ2xpZ2h0LWRhcmsnLCAnb25seS1kYXJrJywgJ29ubHktbGlnaHQnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIEN1cnNvclxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2N1cnNvclxuICAgICAgICovXG4gICAgICBjdXJzb3I6IFt7XG4gICAgICAgIGN1cnNvcjogWydhdXRvJywgJ2RlZmF1bHQnLCAncG9pbnRlcicsICd3YWl0JywgJ3RleHQnLCAnbW92ZScsICdoZWxwJywgJ25vdC1hbGxvd2VkJywgJ25vbmUnLCAnY29udGV4dC1tZW51JywgJ3Byb2dyZXNzJywgJ2NlbGwnLCAnY3Jvc3NoYWlyJywgJ3ZlcnRpY2FsLXRleHQnLCAnYWxpYXMnLCAnY29weScsICduby1kcm9wJywgJ2dyYWInLCAnZ3JhYmJpbmcnLCAnYWxsLXNjcm9sbCcsICdjb2wtcmVzaXplJywgJ3Jvdy1yZXNpemUnLCAnbi1yZXNpemUnLCAnZS1yZXNpemUnLCAncy1yZXNpemUnLCAndy1yZXNpemUnLCAnbmUtcmVzaXplJywgJ253LXJlc2l6ZScsICdzZS1yZXNpemUnLCAnc3ctcmVzaXplJywgJ2V3LXJlc2l6ZScsICducy1yZXNpemUnLCAnbmVzdy1yZXNpemUnLCAnbndzZS1yZXNpemUnLCAnem9vbS1pbicsICd6b29tLW91dCcsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogRmllbGQgU2l6aW5nXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvZmllbGQtc2l6aW5nXG4gICAgICAgKi9cbiAgICAgICdmaWVsZC1zaXppbmcnOiBbe1xuICAgICAgICAnZmllbGQtc2l6aW5nJzogWydmaXhlZCcsICdjb250ZW50J11cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBQb2ludGVyIEV2ZW50c1xuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3BvaW50ZXItZXZlbnRzXG4gICAgICAgKi9cbiAgICAgICdwb2ludGVyLWV2ZW50cyc6IFt7XG4gICAgICAgICdwb2ludGVyLWV2ZW50cyc6IFsnYXV0bycsICdub25lJ11cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBSZXNpemVcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9yZXNpemVcbiAgICAgICAqL1xuICAgICAgcmVzaXplOiBbe1xuICAgICAgICByZXNpemU6IFsnbm9uZScsICcnLCAneScsICd4J11cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBTY3JvbGwgQmVoYXZpb3JcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9zY3JvbGwtYmVoYXZpb3JcbiAgICAgICAqL1xuICAgICAgJ3Njcm9sbC1iZWhhdmlvcic6IFt7XG4gICAgICAgIHNjcm9sbDogWydhdXRvJywgJ3Ntb290aCddXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogU2Nyb2xsIE1hcmdpblxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3Njcm9sbC1tYXJnaW5cbiAgICAgICAqL1xuICAgICAgJ3Njcm9sbC1tJzogW3tcbiAgICAgICAgJ3Njcm9sbC1tJzogc2NhbGVVbmFtYmlndW91c1NwYWNpbmcoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFNjcm9sbCBNYXJnaW4gWFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3Njcm9sbC1tYXJnaW5cbiAgICAgICAqL1xuICAgICAgJ3Njcm9sbC1teCc6IFt7XG4gICAgICAgICdzY3JvbGwtbXgnOiBzY2FsZVVuYW1iaWd1b3VzU3BhY2luZygpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogU2Nyb2xsIE1hcmdpbiBZXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3Mvc2Nyb2xsLW1hcmdpblxuICAgICAgICovXG4gICAgICAnc2Nyb2xsLW15JzogW3tcbiAgICAgICAgJ3Njcm9sbC1teSc6IHNjYWxlVW5hbWJpZ3VvdXNTcGFjaW5nKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBTY3JvbGwgTWFyZ2luIFN0YXJ0XG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3Mvc2Nyb2xsLW1hcmdpblxuICAgICAgICovXG4gICAgICAnc2Nyb2xsLW1zJzogW3tcbiAgICAgICAgJ3Njcm9sbC1tcyc6IHNjYWxlVW5hbWJpZ3VvdXNTcGFjaW5nKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBTY3JvbGwgTWFyZ2luIEVuZFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3Njcm9sbC1tYXJnaW5cbiAgICAgICAqL1xuICAgICAgJ3Njcm9sbC1tZSc6IFt7XG4gICAgICAgICdzY3JvbGwtbWUnOiBzY2FsZVVuYW1iaWd1b3VzU3BhY2luZygpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogU2Nyb2xsIE1hcmdpbiBUb3BcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9zY3JvbGwtbWFyZ2luXG4gICAgICAgKi9cbiAgICAgICdzY3JvbGwtbXQnOiBbe1xuICAgICAgICAnc2Nyb2xsLW10Jzogc2NhbGVVbmFtYmlndW91c1NwYWNpbmcoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFNjcm9sbCBNYXJnaW4gUmlnaHRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9zY3JvbGwtbWFyZ2luXG4gICAgICAgKi9cbiAgICAgICdzY3JvbGwtbXInOiBbe1xuICAgICAgICAnc2Nyb2xsLW1yJzogc2NhbGVVbmFtYmlndW91c1NwYWNpbmcoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFNjcm9sbCBNYXJnaW4gQm90dG9tXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3Mvc2Nyb2xsLW1hcmdpblxuICAgICAgICovXG4gICAgICAnc2Nyb2xsLW1iJzogW3tcbiAgICAgICAgJ3Njcm9sbC1tYic6IHNjYWxlVW5hbWJpZ3VvdXNTcGFjaW5nKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBTY3JvbGwgTWFyZ2luIExlZnRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9zY3JvbGwtbWFyZ2luXG4gICAgICAgKi9cbiAgICAgICdzY3JvbGwtbWwnOiBbe1xuICAgICAgICAnc2Nyb2xsLW1sJzogc2NhbGVVbmFtYmlndW91c1NwYWNpbmcoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFNjcm9sbCBQYWRkaW5nXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3Mvc2Nyb2xsLXBhZGRpbmdcbiAgICAgICAqL1xuICAgICAgJ3Njcm9sbC1wJzogW3tcbiAgICAgICAgJ3Njcm9sbC1wJzogc2NhbGVVbmFtYmlndW91c1NwYWNpbmcoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFNjcm9sbCBQYWRkaW5nIFhcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9zY3JvbGwtcGFkZGluZ1xuICAgICAgICovXG4gICAgICAnc2Nyb2xsLXB4JzogW3tcbiAgICAgICAgJ3Njcm9sbC1weCc6IHNjYWxlVW5hbWJpZ3VvdXNTcGFjaW5nKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBTY3JvbGwgUGFkZGluZyBZXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3Mvc2Nyb2xsLXBhZGRpbmdcbiAgICAgICAqL1xuICAgICAgJ3Njcm9sbC1weSc6IFt7XG4gICAgICAgICdzY3JvbGwtcHknOiBzY2FsZVVuYW1iaWd1b3VzU3BhY2luZygpXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogU2Nyb2xsIFBhZGRpbmcgU3RhcnRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9zY3JvbGwtcGFkZGluZ1xuICAgICAgICovXG4gICAgICAnc2Nyb2xsLXBzJzogW3tcbiAgICAgICAgJ3Njcm9sbC1wcyc6IHNjYWxlVW5hbWJpZ3VvdXNTcGFjaW5nKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBTY3JvbGwgUGFkZGluZyBFbmRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9zY3JvbGwtcGFkZGluZ1xuICAgICAgICovXG4gICAgICAnc2Nyb2xsLXBlJzogW3tcbiAgICAgICAgJ3Njcm9sbC1wZSc6IHNjYWxlVW5hbWJpZ3VvdXNTcGFjaW5nKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBTY3JvbGwgUGFkZGluZyBUb3BcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9zY3JvbGwtcGFkZGluZ1xuICAgICAgICovXG4gICAgICAnc2Nyb2xsLXB0JzogW3tcbiAgICAgICAgJ3Njcm9sbC1wdCc6IHNjYWxlVW5hbWJpZ3VvdXNTcGFjaW5nKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBTY3JvbGwgUGFkZGluZyBSaWdodFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3Njcm9sbC1wYWRkaW5nXG4gICAgICAgKi9cbiAgICAgICdzY3JvbGwtcHInOiBbe1xuICAgICAgICAnc2Nyb2xsLXByJzogc2NhbGVVbmFtYmlndW91c1NwYWNpbmcoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFNjcm9sbCBQYWRkaW5nIEJvdHRvbVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3Njcm9sbC1wYWRkaW5nXG4gICAgICAgKi9cbiAgICAgICdzY3JvbGwtcGInOiBbe1xuICAgICAgICAnc2Nyb2xsLXBiJzogc2NhbGVVbmFtYmlndW91c1NwYWNpbmcoKVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFNjcm9sbCBQYWRkaW5nIExlZnRcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9zY3JvbGwtcGFkZGluZ1xuICAgICAgICovXG4gICAgICAnc2Nyb2xsLXBsJzogW3tcbiAgICAgICAgJ3Njcm9sbC1wbCc6IHNjYWxlVW5hbWJpZ3VvdXNTcGFjaW5nKClcbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBTY3JvbGwgU25hcCBBbGlnblxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3Njcm9sbC1zbmFwLWFsaWduXG4gICAgICAgKi9cbiAgICAgICdzbmFwLWFsaWduJzogW3tcbiAgICAgICAgc25hcDogWydzdGFydCcsICdlbmQnLCAnY2VudGVyJywgJ2FsaWduLW5vbmUnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFNjcm9sbCBTbmFwIFN0b3BcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9zY3JvbGwtc25hcC1zdG9wXG4gICAgICAgKi9cbiAgICAgICdzbmFwLXN0b3AnOiBbe1xuICAgICAgICBzbmFwOiBbJ25vcm1hbCcsICdhbHdheXMnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFNjcm9sbCBTbmFwIFR5cGVcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9zY3JvbGwtc25hcC10eXBlXG4gICAgICAgKi9cbiAgICAgICdzbmFwLXR5cGUnOiBbe1xuICAgICAgICBzbmFwOiBbJ25vbmUnLCAneCcsICd5JywgJ2JvdGgnXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFNjcm9sbCBTbmFwIFR5cGUgU3RyaWN0bmVzc1xuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3Njcm9sbC1zbmFwLXR5cGVcbiAgICAgICAqL1xuICAgICAgJ3NuYXAtc3RyaWN0bmVzcyc6IFt7XG4gICAgICAgIHNuYXA6IFsnbWFuZGF0b3J5JywgJ3Byb3hpbWl0eSddXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogVG91Y2ggQWN0aW9uXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvdG91Y2gtYWN0aW9uXG4gICAgICAgKi9cbiAgICAgIHRvdWNoOiBbe1xuICAgICAgICB0b3VjaDogWydhdXRvJywgJ25vbmUnLCAnbWFuaXB1bGF0aW9uJ11cbiAgICAgIH1dLFxuICAgICAgLyoqXG4gICAgICAgKiBUb3VjaCBBY3Rpb24gWFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3RvdWNoLWFjdGlvblxuICAgICAgICovXG4gICAgICAndG91Y2gteCc6IFt7XG4gICAgICAgICd0b3VjaC1wYW4nOiBbJ3gnLCAnbGVmdCcsICdyaWdodCddXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogVG91Y2ggQWN0aW9uIFlcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy90b3VjaC1hY3Rpb25cbiAgICAgICAqL1xuICAgICAgJ3RvdWNoLXknOiBbe1xuICAgICAgICAndG91Y2gtcGFuJzogWyd5JywgJ3VwJywgJ2Rvd24nXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFRvdWNoIEFjdGlvbiBQaW5jaCBab29tXG4gICAgICAgKiBAc2VlIGh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvdG91Y2gtYWN0aW9uXG4gICAgICAgKi9cbiAgICAgICd0b3VjaC1weic6IFsndG91Y2gtcGluY2gtem9vbSddLFxuICAgICAgLyoqXG4gICAgICAgKiBVc2VyIFNlbGVjdFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3VzZXItc2VsZWN0XG4gICAgICAgKi9cbiAgICAgIHNlbGVjdDogW3tcbiAgICAgICAgc2VsZWN0OiBbJ25vbmUnLCAndGV4dCcsICdhbGwnLCAnYXV0byddXG4gICAgICB9XSxcbiAgICAgIC8qKlxuICAgICAgICogV2lsbCBDaGFuZ2VcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy93aWxsLWNoYW5nZVxuICAgICAgICovXG4gICAgICAnd2lsbC1jaGFuZ2UnOiBbe1xuICAgICAgICAnd2lsbC1jaGFuZ2UnOiBbJ2F1dG8nLCAnc2Nyb2xsJywgJ2NvbnRlbnRzJywgJ3RyYW5zZm9ybScsIGlzQXJiaXRyYXJ5VmFyaWFibGUsIGlzQXJiaXRyYXJ5VmFsdWVdXG4gICAgICB9XSxcbiAgICAgIC8vIC0tLS0tLS0tLS0tXG4gICAgICAvLyAtLS0gU1ZHIC0tLVxuICAgICAgLy8gLS0tLS0tLS0tLS1cbiAgICAgIC8qKlxuICAgICAgICogRmlsbFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2ZpbGxcbiAgICAgICAqL1xuICAgICAgZmlsbDogW3tcbiAgICAgICAgZmlsbDogWydub25lJywgLi4uc2NhbGVDb2xvcigpXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFN0cm9rZSBXaWR0aFxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3N0cm9rZS13aWR0aFxuICAgICAgICovXG4gICAgICAnc3Ryb2tlLXcnOiBbe1xuICAgICAgICBzdHJva2U6IFtpc051bWJlciwgaXNBcmJpdHJhcnlWYXJpYWJsZUxlbmd0aCwgaXNBcmJpdHJhcnlMZW5ndGgsIGlzQXJiaXRyYXJ5TnVtYmVyXVxuICAgICAgfV0sXG4gICAgICAvKipcbiAgICAgICAqIFN0cm9rZVxuICAgICAgICogQHNlZSBodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL3N0cm9rZVxuICAgICAgICovXG4gICAgICBzdHJva2U6IFt7XG4gICAgICAgIHN0cm9rZTogWydub25lJywgLi4uc2NhbGVDb2xvcigpXVxuICAgICAgfV0sXG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIC0tLSBBY2Nlc3NpYmlsaXR5IC0tLVxuICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvKipcbiAgICAgICAqIEZvcmNlZCBDb2xvciBBZGp1c3RcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9mb3JjZWQtY29sb3ItYWRqdXN0XG4gICAgICAgKi9cbiAgICAgICdmb3JjZWQtY29sb3ItYWRqdXN0JzogW3tcbiAgICAgICAgJ2ZvcmNlZC1jb2xvci1hZGp1c3QnOiBbJ2F1dG8nLCAnbm9uZSddXG4gICAgICB9XVxuICAgIH0sXG4gICAgY29uZmxpY3RpbmdDbGFzc0dyb3Vwczoge1xuICAgICAgb3ZlcmZsb3c6IFsnb3ZlcmZsb3cteCcsICdvdmVyZmxvdy15J10sXG4gICAgICBvdmVyc2Nyb2xsOiBbJ292ZXJzY3JvbGwteCcsICdvdmVyc2Nyb2xsLXknXSxcbiAgICAgIGluc2V0OiBbJ2luc2V0LXgnLCAnaW5zZXQteScsICdzdGFydCcsICdlbmQnLCAndG9wJywgJ3JpZ2h0JywgJ2JvdHRvbScsICdsZWZ0J10sXG4gICAgICAnaW5zZXQteCc6IFsncmlnaHQnLCAnbGVmdCddLFxuICAgICAgJ2luc2V0LXknOiBbJ3RvcCcsICdib3R0b20nXSxcbiAgICAgIGZsZXg6IFsnYmFzaXMnLCAnZ3JvdycsICdzaHJpbmsnXSxcbiAgICAgIGdhcDogWydnYXAteCcsICdnYXAteSddLFxuICAgICAgcDogWydweCcsICdweScsICdwcycsICdwZScsICdwdCcsICdwcicsICdwYicsICdwbCddLFxuICAgICAgcHg6IFsncHInLCAncGwnXSxcbiAgICAgIHB5OiBbJ3B0JywgJ3BiJ10sXG4gICAgICBtOiBbJ214JywgJ215JywgJ21zJywgJ21lJywgJ210JywgJ21yJywgJ21iJywgJ21sJ10sXG4gICAgICBteDogWydtcicsICdtbCddLFxuICAgICAgbXk6IFsnbXQnLCAnbWInXSxcbiAgICAgIHNpemU6IFsndycsICdoJ10sXG4gICAgICAnZm9udC1zaXplJzogWydsZWFkaW5nJ10sXG4gICAgICAnZnZuLW5vcm1hbCc6IFsnZnZuLW9yZGluYWwnLCAnZnZuLXNsYXNoZWQtemVybycsICdmdm4tZmlndXJlJywgJ2Z2bi1zcGFjaW5nJywgJ2Z2bi1mcmFjdGlvbiddLFxuICAgICAgJ2Z2bi1vcmRpbmFsJzogWydmdm4tbm9ybWFsJ10sXG4gICAgICAnZnZuLXNsYXNoZWQtemVybyc6IFsnZnZuLW5vcm1hbCddLFxuICAgICAgJ2Z2bi1maWd1cmUnOiBbJ2Z2bi1ub3JtYWwnXSxcbiAgICAgICdmdm4tc3BhY2luZyc6IFsnZnZuLW5vcm1hbCddLFxuICAgICAgJ2Z2bi1mcmFjdGlvbic6IFsnZnZuLW5vcm1hbCddLFxuICAgICAgJ2xpbmUtY2xhbXAnOiBbJ2Rpc3BsYXknLCAnb3ZlcmZsb3cnXSxcbiAgICAgIHJvdW5kZWQ6IFsncm91bmRlZC1zJywgJ3JvdW5kZWQtZScsICdyb3VuZGVkLXQnLCAncm91bmRlZC1yJywgJ3JvdW5kZWQtYicsICdyb3VuZGVkLWwnLCAncm91bmRlZC1zcycsICdyb3VuZGVkLXNlJywgJ3JvdW5kZWQtZWUnLCAncm91bmRlZC1lcycsICdyb3VuZGVkLXRsJywgJ3JvdW5kZWQtdHInLCAncm91bmRlZC1icicsICdyb3VuZGVkLWJsJ10sXG4gICAgICAncm91bmRlZC1zJzogWydyb3VuZGVkLXNzJywgJ3JvdW5kZWQtZXMnXSxcbiAgICAgICdyb3VuZGVkLWUnOiBbJ3JvdW5kZWQtc2UnLCAncm91bmRlZC1lZSddLFxuICAgICAgJ3JvdW5kZWQtdCc6IFsncm91bmRlZC10bCcsICdyb3VuZGVkLXRyJ10sXG4gICAgICAncm91bmRlZC1yJzogWydyb3VuZGVkLXRyJywgJ3JvdW5kZWQtYnInXSxcbiAgICAgICdyb3VuZGVkLWInOiBbJ3JvdW5kZWQtYnInLCAncm91bmRlZC1ibCddLFxuICAgICAgJ3JvdW5kZWQtbCc6IFsncm91bmRlZC10bCcsICdyb3VuZGVkLWJsJ10sXG4gICAgICAnYm9yZGVyLXNwYWNpbmcnOiBbJ2JvcmRlci1zcGFjaW5nLXgnLCAnYm9yZGVyLXNwYWNpbmcteSddLFxuICAgICAgJ2JvcmRlci13JzogWydib3JkZXItdy14JywgJ2JvcmRlci13LXknLCAnYm9yZGVyLXctcycsICdib3JkZXItdy1lJywgJ2JvcmRlci13LXQnLCAnYm9yZGVyLXctcicsICdib3JkZXItdy1iJywgJ2JvcmRlci13LWwnXSxcbiAgICAgICdib3JkZXItdy14JzogWydib3JkZXItdy1yJywgJ2JvcmRlci13LWwnXSxcbiAgICAgICdib3JkZXItdy15JzogWydib3JkZXItdy10JywgJ2JvcmRlci13LWInXSxcbiAgICAgICdib3JkZXItY29sb3InOiBbJ2JvcmRlci1jb2xvci14JywgJ2JvcmRlci1jb2xvci15JywgJ2JvcmRlci1jb2xvci1zJywgJ2JvcmRlci1jb2xvci1lJywgJ2JvcmRlci1jb2xvci10JywgJ2JvcmRlci1jb2xvci1yJywgJ2JvcmRlci1jb2xvci1iJywgJ2JvcmRlci1jb2xvci1sJ10sXG4gICAgICAnYm9yZGVyLWNvbG9yLXgnOiBbJ2JvcmRlci1jb2xvci1yJywgJ2JvcmRlci1jb2xvci1sJ10sXG4gICAgICAnYm9yZGVyLWNvbG9yLXknOiBbJ2JvcmRlci1jb2xvci10JywgJ2JvcmRlci1jb2xvci1iJ10sXG4gICAgICB0cmFuc2xhdGU6IFsndHJhbnNsYXRlLXgnLCAndHJhbnNsYXRlLXknLCAndHJhbnNsYXRlLW5vbmUnXSxcbiAgICAgICd0cmFuc2xhdGUtbm9uZSc6IFsndHJhbnNsYXRlJywgJ3RyYW5zbGF0ZS14JywgJ3RyYW5zbGF0ZS15JywgJ3RyYW5zbGF0ZS16J10sXG4gICAgICAnc2Nyb2xsLW0nOiBbJ3Njcm9sbC1teCcsICdzY3JvbGwtbXknLCAnc2Nyb2xsLW1zJywgJ3Njcm9sbC1tZScsICdzY3JvbGwtbXQnLCAnc2Nyb2xsLW1yJywgJ3Njcm9sbC1tYicsICdzY3JvbGwtbWwnXSxcbiAgICAgICdzY3JvbGwtbXgnOiBbJ3Njcm9sbC1tcicsICdzY3JvbGwtbWwnXSxcbiAgICAgICdzY3JvbGwtbXknOiBbJ3Njcm9sbC1tdCcsICdzY3JvbGwtbWInXSxcbiAgICAgICdzY3JvbGwtcCc6IFsnc2Nyb2xsLXB4JywgJ3Njcm9sbC1weScsICdzY3JvbGwtcHMnLCAnc2Nyb2xsLXBlJywgJ3Njcm9sbC1wdCcsICdzY3JvbGwtcHInLCAnc2Nyb2xsLXBiJywgJ3Njcm9sbC1wbCddLFxuICAgICAgJ3Njcm9sbC1weCc6IFsnc2Nyb2xsLXByJywgJ3Njcm9sbC1wbCddLFxuICAgICAgJ3Njcm9sbC1weSc6IFsnc2Nyb2xsLXB0JywgJ3Njcm9sbC1wYiddLFxuICAgICAgdG91Y2g6IFsndG91Y2gteCcsICd0b3VjaC15JywgJ3RvdWNoLXB6J10sXG4gICAgICAndG91Y2gteCc6IFsndG91Y2gnXSxcbiAgICAgICd0b3VjaC15JzogWyd0b3VjaCddLFxuICAgICAgJ3RvdWNoLXB6JzogWyd0b3VjaCddXG4gICAgfSxcbiAgICBjb25mbGljdGluZ0NsYXNzR3JvdXBNb2RpZmllcnM6IHtcbiAgICAgICdmb250LXNpemUnOiBbJ2xlYWRpbmcnXVxuICAgIH0sXG4gICAgb3JkZXJTZW5zaXRpdmVNb2RpZmllcnM6IFsnKicsICcqKicsICdhZnRlcicsICdiYWNrZHJvcCcsICdiZWZvcmUnLCAnZGV0YWlscy1jb250ZW50JywgJ2ZpbGUnLCAnZmlyc3QtbGV0dGVyJywgJ2ZpcnN0LWxpbmUnLCAnbWFya2VyJywgJ3BsYWNlaG9sZGVyJywgJ3NlbGVjdGlvbiddXG4gIH07XG59O1xuXG4vKipcbiAqIEBwYXJhbSBiYXNlQ29uZmlnIENvbmZpZyB3aGVyZSBvdGhlciBjb25maWcgd2lsbCBiZSBtZXJnZWQgaW50by4gVGhpcyBvYmplY3Qgd2lsbCBiZSBtdXRhdGVkLlxuICogQHBhcmFtIGNvbmZpZ0V4dGVuc2lvbiBQYXJ0aWFsIGNvbmZpZyB0byBtZXJnZSBpbnRvIHRoZSBgYmFzZUNvbmZpZ2AuXG4gKi9cbmNvbnN0IG1lcmdlQ29uZmlncyA9IChiYXNlQ29uZmlnLCB7XG4gIGNhY2hlU2l6ZSxcbiAgcHJlZml4LFxuICBleHBlcmltZW50YWxQYXJzZUNsYXNzTmFtZSxcbiAgZXh0ZW5kID0ge30sXG4gIG92ZXJyaWRlID0ge31cbn0pID0+IHtcbiAgb3ZlcnJpZGVQcm9wZXJ0eShiYXNlQ29uZmlnLCAnY2FjaGVTaXplJywgY2FjaGVTaXplKTtcbiAgb3ZlcnJpZGVQcm9wZXJ0eShiYXNlQ29uZmlnLCAncHJlZml4JywgcHJlZml4KTtcbiAgb3ZlcnJpZGVQcm9wZXJ0eShiYXNlQ29uZmlnLCAnZXhwZXJpbWVudGFsUGFyc2VDbGFzc05hbWUnLCBleHBlcmltZW50YWxQYXJzZUNsYXNzTmFtZSk7XG4gIG92ZXJyaWRlQ29uZmlnUHJvcGVydGllcyhiYXNlQ29uZmlnLnRoZW1lLCBvdmVycmlkZS50aGVtZSk7XG4gIG92ZXJyaWRlQ29uZmlnUHJvcGVydGllcyhiYXNlQ29uZmlnLmNsYXNzR3JvdXBzLCBvdmVycmlkZS5jbGFzc0dyb3Vwcyk7XG4gIG92ZXJyaWRlQ29uZmlnUHJvcGVydGllcyhiYXNlQ29uZmlnLmNvbmZsaWN0aW5nQ2xhc3NHcm91cHMsIG92ZXJyaWRlLmNvbmZsaWN0aW5nQ2xhc3NHcm91cHMpO1xuICBvdmVycmlkZUNvbmZpZ1Byb3BlcnRpZXMoYmFzZUNvbmZpZy5jb25mbGljdGluZ0NsYXNzR3JvdXBNb2RpZmllcnMsIG92ZXJyaWRlLmNvbmZsaWN0aW5nQ2xhc3NHcm91cE1vZGlmaWVycyk7XG4gIG92ZXJyaWRlUHJvcGVydHkoYmFzZUNvbmZpZywgJ29yZGVyU2Vuc2l0aXZlTW9kaWZpZXJzJywgb3ZlcnJpZGUub3JkZXJTZW5zaXRpdmVNb2RpZmllcnMpO1xuICBtZXJnZUNvbmZpZ1Byb3BlcnRpZXMoYmFzZUNvbmZpZy50aGVtZSwgZXh0ZW5kLnRoZW1lKTtcbiAgbWVyZ2VDb25maWdQcm9wZXJ0aWVzKGJhc2VDb25maWcuY2xhc3NHcm91cHMsIGV4dGVuZC5jbGFzc0dyb3Vwcyk7XG4gIG1lcmdlQ29uZmlnUHJvcGVydGllcyhiYXNlQ29uZmlnLmNvbmZsaWN0aW5nQ2xhc3NHcm91cHMsIGV4dGVuZC5jb25mbGljdGluZ0NsYXNzR3JvdXBzKTtcbiAgbWVyZ2VDb25maWdQcm9wZXJ0aWVzKGJhc2VDb25maWcuY29uZmxpY3RpbmdDbGFzc0dyb3VwTW9kaWZpZXJzLCBleHRlbmQuY29uZmxpY3RpbmdDbGFzc0dyb3VwTW9kaWZpZXJzKTtcbiAgbWVyZ2VBcnJheVByb3BlcnRpZXMoYmFzZUNvbmZpZywgZXh0ZW5kLCAnb3JkZXJTZW5zaXRpdmVNb2RpZmllcnMnKTtcbiAgcmV0dXJuIGJhc2VDb25maWc7XG59O1xuY29uc3Qgb3ZlcnJpZGVQcm9wZXJ0eSA9IChiYXNlT2JqZWN0LCBvdmVycmlkZUtleSwgb3ZlcnJpZGVWYWx1ZSkgPT4ge1xuICBpZiAob3ZlcnJpZGVWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYmFzZU9iamVjdFtvdmVycmlkZUtleV0gPSBvdmVycmlkZVZhbHVlO1xuICB9XG59O1xuY29uc3Qgb3ZlcnJpZGVDb25maWdQcm9wZXJ0aWVzID0gKGJhc2VPYmplY3QsIG92ZXJyaWRlT2JqZWN0KSA9PiB7XG4gIGlmIChvdmVycmlkZU9iamVjdCkge1xuICAgIGZvciAoY29uc3Qga2V5IGluIG92ZXJyaWRlT2JqZWN0KSB7XG4gICAgICBvdmVycmlkZVByb3BlcnR5KGJhc2VPYmplY3QsIGtleSwgb3ZlcnJpZGVPYmplY3Rba2V5XSk7XG4gICAgfVxuICB9XG59O1xuY29uc3QgbWVyZ2VDb25maWdQcm9wZXJ0aWVzID0gKGJhc2VPYmplY3QsIG1lcmdlT2JqZWN0KSA9PiB7XG4gIGlmIChtZXJnZU9iamVjdCkge1xuICAgIGZvciAoY29uc3Qga2V5IGluIG1lcmdlT2JqZWN0KSB7XG4gICAgICBtZXJnZUFycmF5UHJvcGVydGllcyhiYXNlT2JqZWN0LCBtZXJnZU9iamVjdCwga2V5KTtcbiAgICB9XG4gIH1cbn07XG5jb25zdCBtZXJnZUFycmF5UHJvcGVydGllcyA9IChiYXNlT2JqZWN0LCBtZXJnZU9iamVjdCwga2V5KSA9PiB7XG4gIGNvbnN0IG1lcmdlVmFsdWUgPSBtZXJnZU9iamVjdFtrZXldO1xuICBpZiAobWVyZ2VWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYmFzZU9iamVjdFtrZXldID0gYmFzZU9iamVjdFtrZXldID8gYmFzZU9iamVjdFtrZXldLmNvbmNhdChtZXJnZVZhbHVlKSA6IG1lcmdlVmFsdWU7XG4gIH1cbn07XG5jb25zdCBleHRlbmRUYWlsd2luZE1lcmdlID0gKGNvbmZpZ0V4dGVuc2lvbiwgLi4uY3JlYXRlQ29uZmlnKSA9PiB0eXBlb2YgY29uZmlnRXh0ZW5zaW9uID09PSAnZnVuY3Rpb24nID8gY3JlYXRlVGFpbHdpbmRNZXJnZShnZXREZWZhdWx0Q29uZmlnLCBjb25maWdFeHRlbnNpb24sIC4uLmNyZWF0ZUNvbmZpZykgOiBjcmVhdGVUYWlsd2luZE1lcmdlKCgpID0+IG1lcmdlQ29uZmlncyhnZXREZWZhdWx0Q29uZmlnKCksIGNvbmZpZ0V4dGVuc2lvbiksIC4uLmNyZWF0ZUNvbmZpZyk7XG5jb25zdCB0d01lcmdlID0gLyojX19QVVJFX18qL2NyZWF0ZVRhaWx3aW5kTWVyZ2UoZ2V0RGVmYXVsdENvbmZpZyk7XG5leHBvcnQgeyBjcmVhdGVUYWlsd2luZE1lcmdlLCBleHRlbmRUYWlsd2luZE1lcmdlLCBmcm9tVGhlbWUsIGdldERlZmF1bHRDb25maWcsIG1lcmdlQ29uZmlncywgdHdKb2luLCB0d01lcmdlLCB2YWxpZGF0b3JzIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1idW5kbGUtbWpzLm1qcy5tYXBcbiIsImZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gIFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjtcblxuICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHtcbiAgICBfdHlwZW9mID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmo7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBfdHlwZW9mID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBfdHlwZW9mKG9iaik7XG59XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLWJpdHdpc2UgLS0gdXNlZCBmb3IgY2FsY3VsYXRpb25zICovXG5cbi8qIGVzbGludC1kaXNhYmxlIHVuaWNvcm4vcHJlZmVyLXF1ZXJ5LXNlbGVjdG9yIC0tIGFpbWluZyBhdFxuICBiYWNrd2FyZC1jb21wYXRpYmlsaXR5ICovXG5cbi8qKlxuKiBTdGFja0JsdXIgLSBhIGZhc3QgYWxtb3N0IEdhdXNzaWFuIEJsdXIgRm9yIENhbnZhc1xuKlxuKiBJbiBjYXNlIHlvdSBmaW5kIHRoaXMgY2xhc3MgdXNlZnVsIC0gZXNwZWNpYWxseSBpbiBjb21tZXJjaWFsIHByb2plY3RzIC1cbiogSSBhbSBub3QgdG90YWxseSB1bmhhcHB5IGZvciBhIHNtYWxsIGRvbmF0aW9uIHRvIG15IFBheVBhbCBhY2NvdW50XG4qIG1hcmlvQHF1YXNpbW9uZG8uZGVcbipcbiogT3Igc3VwcG9ydCBtZSBvbiBmbGF0dHI6XG4qIHtAbGluayBodHRwczovL2ZsYXR0ci5jb20vdGhpbmcvNzI3OTEvU3RhY2tCbHVyLWEtZmFzdC1hbG1vc3QtR2F1c3NpYW4tQmx1ci1FZmZlY3QtZm9yLUNhbnZhc0phdmFzY3JpcHR9LlxuKlxuKiBAbW9kdWxlIFN0YWNrQmx1clxuKiBAYXV0aG9yIE1hcmlvIEtsaW5nZW1hbm5cbiogQ29udGFjdDogbWFyaW9AcXVhc2ltb25kby5jb21cbiogV2Vic2l0ZToge0BsaW5rIGh0dHA6Ly93d3cucXVhc2ltb25kby5jb20vU3RhY2tCbHVyRm9yQ2FudmFzL1N0YWNrQmx1ckRlbW8uaHRtbH1cbiogVHdpdHRlcjogQHF1YXNpbW9uZG9cbipcbiogQGNvcHlyaWdodCAoYykgMjAxMCBNYXJpbyBLbGluZ2VtYW5uXG4qXG4qIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uXG4qIG9idGFpbmluZyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uXG4qIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dFxuKiByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSxcbiogY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlXG4qIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nXG4qIGNvbmRpdGlvbnM6XG4qXG4qIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG4qIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuKlxuKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuKiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVNcbiogT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbiogTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFRcbiogSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksXG4qIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lOR1xuKiBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SXG4qIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiovXG52YXIgbXVsVGFibGUgPSBbNTEyLCA1MTIsIDQ1NiwgNTEyLCAzMjgsIDQ1NiwgMzM1LCA1MTIsIDQwNSwgMzI4LCAyNzEsIDQ1NiwgMzg4LCAzMzUsIDI5MiwgNTEyLCA0NTQsIDQwNSwgMzY0LCAzMjgsIDI5OCwgMjcxLCA0OTYsIDQ1NiwgNDIwLCAzODgsIDM2MCwgMzM1LCAzMTIsIDI5MiwgMjczLCA1MTIsIDQ4MiwgNDU0LCA0MjgsIDQwNSwgMzgzLCAzNjQsIDM0NSwgMzI4LCAzMTIsIDI5OCwgMjg0LCAyNzEsIDI1OSwgNDk2LCA0NzUsIDQ1NiwgNDM3LCA0MjAsIDQwNCwgMzg4LCAzNzQsIDM2MCwgMzQ3LCAzMzUsIDMyMywgMzEyLCAzMDIsIDI5MiwgMjgyLCAyNzMsIDI2NSwgNTEyLCA0OTcsIDQ4MiwgNDY4LCA0NTQsIDQ0MSwgNDI4LCA0MTcsIDQwNSwgMzk0LCAzODMsIDM3MywgMzY0LCAzNTQsIDM0NSwgMzM3LCAzMjgsIDMyMCwgMzEyLCAzMDUsIDI5OCwgMjkxLCAyODQsIDI3OCwgMjcxLCAyNjUsIDI1OSwgNTA3LCA0OTYsIDQ4NSwgNDc1LCA0NjUsIDQ1NiwgNDQ2LCA0MzcsIDQyOCwgNDIwLCA0MTIsIDQwNCwgMzk2LCAzODgsIDM4MSwgMzc0LCAzNjcsIDM2MCwgMzU0LCAzNDcsIDM0MSwgMzM1LCAzMjksIDMyMywgMzE4LCAzMTIsIDMwNywgMzAyLCAyOTcsIDI5MiwgMjg3LCAyODIsIDI3OCwgMjczLCAyNjksIDI2NSwgMjYxLCA1MTIsIDUwNSwgNDk3LCA0ODksIDQ4MiwgNDc1LCA0NjgsIDQ2MSwgNDU0LCA0NDcsIDQ0MSwgNDM1LCA0MjgsIDQyMiwgNDE3LCA0MTEsIDQwNSwgMzk5LCAzOTQsIDM4OSwgMzgzLCAzNzgsIDM3MywgMzY4LCAzNjQsIDM1OSwgMzU0LCAzNTAsIDM0NSwgMzQxLCAzMzcsIDMzMiwgMzI4LCAzMjQsIDMyMCwgMzE2LCAzMTIsIDMwOSwgMzA1LCAzMDEsIDI5OCwgMjk0LCAyOTEsIDI4NywgMjg0LCAyODEsIDI3OCwgMjc0LCAyNzEsIDI2OCwgMjY1LCAyNjIsIDI1OSwgMjU3LCA1MDcsIDUwMSwgNDk2LCA0OTEsIDQ4NSwgNDgwLCA0NzUsIDQ3MCwgNDY1LCA0NjAsIDQ1NiwgNDUxLCA0NDYsIDQ0MiwgNDM3LCA0MzMsIDQyOCwgNDI0LCA0MjAsIDQxNiwgNDEyLCA0MDgsIDQwNCwgNDAwLCAzOTYsIDM5MiwgMzg4LCAzODUsIDM4MSwgMzc3LCAzNzQsIDM3MCwgMzY3LCAzNjMsIDM2MCwgMzU3LCAzNTQsIDM1MCwgMzQ3LCAzNDQsIDM0MSwgMzM4LCAzMzUsIDMzMiwgMzI5LCAzMjYsIDMyMywgMzIwLCAzMTgsIDMxNSwgMzEyLCAzMTAsIDMwNywgMzA0LCAzMDIsIDI5OSwgMjk3LCAyOTQsIDI5MiwgMjg5LCAyODcsIDI4NSwgMjgyLCAyODAsIDI3OCwgMjc1LCAyNzMsIDI3MSwgMjY5LCAyNjcsIDI2NSwgMjYzLCAyNjEsIDI1OV07XG52YXIgc2hnVGFibGUgPSBbOSwgMTEsIDEyLCAxMywgMTMsIDE0LCAxNCwgMTUsIDE1LCAxNSwgMTUsIDE2LCAxNiwgMTYsIDE2LCAxNywgMTcsIDE3LCAxNywgMTcsIDE3LCAxNywgMTgsIDE4LCAxOCwgMTgsIDE4LCAxOCwgMTgsIDE4LCAxOCwgMTksIDE5LCAxOSwgMTksIDE5LCAxOSwgMTksIDE5LCAxOSwgMTksIDE5LCAxOSwgMTksIDE5LCAyMCwgMjAsIDIwLCAyMCwgMjAsIDIwLCAyMCwgMjAsIDIwLCAyMCwgMjAsIDIwLCAyMCwgMjAsIDIwLCAyMCwgMjAsIDIwLCAyMSwgMjEsIDIxLCAyMSwgMjEsIDIxLCAyMSwgMjEsIDIxLCAyMSwgMjEsIDIxLCAyMSwgMjEsIDIxLCAyMSwgMjEsIDIxLCAyMSwgMjEsIDIxLCAyMSwgMjEsIDIxLCAyMSwgMjEsIDIxLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0XTtcbi8qKlxuICogQHBhcmFtIHtzdHJpbmd8SFRNTEltYWdlRWxlbWVudH0gaW1nXG4gKiBAcGFyYW0ge3N0cmluZ3xIVE1MQ2FudmFzRWxlbWVudH0gY2FudmFzXG4gKiBAcGFyYW0ge0Zsb2F0fSByYWRpdXNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYmx1ckFscGhhQ2hhbm5lbFxuICogQHBhcmFtIHtib29sZWFufSB1c2VPZmZzZXRcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gc2tpcFN0eWxlc1xuICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAqL1xuXG5mdW5jdGlvbiBwcm9jZXNzSW1hZ2UoaW1nLCBjYW52YXMsIHJhZGl1cywgYmx1ckFscGhhQ2hhbm5lbCwgdXNlT2Zmc2V0LCBza2lwU3R5bGVzKSB7XG4gIGlmICh0eXBlb2YgaW1nID09PSAnc3RyaW5nJykge1xuICAgIGltZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGltZyk7XG4gIH1cblxuICBpZiAoIWltZyB8fCBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaW1nKS5zbGljZSg4LCAtMSkgPT09ICdIVE1MSW1hZ2VFbGVtZW50JyAmJiAhKCduYXR1cmFsV2lkdGgnIGluIGltZykpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZGltZW5zaW9uVHlwZSA9IHVzZU9mZnNldCA/ICdvZmZzZXQnIDogJ25hdHVyYWwnO1xuICB2YXIgdyA9IGltZ1tkaW1lbnNpb25UeXBlICsgJ1dpZHRoJ107XG4gIHZhciBoID0gaW1nW2RpbWVuc2lvblR5cGUgKyAnSGVpZ2h0J107IC8vIGFkZCBJbWFnZUJpdG1hcCBzdXBwb3J0LGNhbiBibHVyIHRleHR1cmUgc291cmNlXG5cbiAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpbWcpLnNsaWNlKDgsIC0xKSA9PT0gJ0ltYWdlQml0bWFwJykge1xuICAgIHcgPSBpbWcud2lkdGg7XG4gICAgaCA9IGltZy5oZWlnaHQ7XG4gIH1cblxuICBpZiAodHlwZW9mIGNhbnZhcyA9PT0gJ3N0cmluZycpIHtcbiAgICBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjYW52YXMpO1xuICB9XG5cbiAgaWYgKCFjYW52YXMgfHwgISgnZ2V0Q29udGV4dCcgaW4gY2FudmFzKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghc2tpcFN0eWxlcykge1xuICAgIGNhbnZhcy5zdHlsZS53aWR0aCA9IHcgKyAncHgnO1xuICAgIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBoICsgJ3B4JztcbiAgfVxuXG4gIGNhbnZhcy53aWR0aCA9IHc7XG4gIGNhbnZhcy5oZWlnaHQgPSBoO1xuICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB3LCBoKTtcbiAgY29udGV4dC5kcmF3SW1hZ2UoaW1nLCAwLCAwLCBpbWcubmF0dXJhbFdpZHRoLCBpbWcubmF0dXJhbEhlaWdodCwgMCwgMCwgdywgaCk7XG5cbiAgaWYgKGlzTmFOKHJhZGl1cykgfHwgcmFkaXVzIDwgMSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChibHVyQWxwaGFDaGFubmVsKSB7XG4gICAgcHJvY2Vzc0NhbnZhc1JHQkEoY2FudmFzLCAwLCAwLCB3LCBoLCByYWRpdXMpO1xuICB9IGVsc2Uge1xuICAgIHByb2Nlc3NDYW52YXNSR0IoY2FudmFzLCAwLCAwLCB3LCBoLCByYWRpdXMpO1xuICB9XG59XG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfEhUTUxDYW52YXNFbGVtZW50fSBjYW52YXNcbiAqIEBwYXJhbSB7SW50ZWdlcn0gdG9wWFxuICogQHBhcmFtIHtJbnRlZ2VyfSB0b3BZXG4gKiBAcGFyYW0ge0ludGVnZXJ9IHdpZHRoXG4gKiBAcGFyYW0ge0ludGVnZXJ9IGhlaWdodFxuICogQHRocm93cyB7RXJyb3J8VHlwZUVycm9yfVxuICogQHJldHVybnMge0ltYWdlRGF0YX0gU2VlIHtAbGluayBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9jYW52YXMuaHRtbCNpbWFnZWRhdGF9XG4gKi9cblxuXG5mdW5jdGlvbiBnZXRJbWFnZURhdGFGcm9tQ2FudmFzKGNhbnZhcywgdG9wWCwgdG9wWSwgd2lkdGgsIGhlaWdodCkge1xuICBpZiAodHlwZW9mIGNhbnZhcyA9PT0gJ3N0cmluZycpIHtcbiAgICBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjYW52YXMpO1xuICB9XG5cbiAgaWYgKCFjYW52YXMgfHwgX3R5cGVvZihjYW52YXMpICE9PSAnb2JqZWN0JyB8fCAhKCdnZXRDb250ZXh0JyBpbiBjYW52YXMpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0aW5nIGNhbnZhcyB3aXRoIGBnZXRDb250ZXh0YCBtZXRob2QgJyArICdpbiBwcm9jZXNzQ2FudmFzUkdCKEEpIGNhbGxzIScpO1xuICB9XG5cbiAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICB0cnkge1xuICAgIHJldHVybiBjb250ZXh0LmdldEltYWdlRGF0YSh0b3BYLCB0b3BZLCB3aWR0aCwgaGVpZ2h0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigndW5hYmxlIHRvIGFjY2VzcyBpbWFnZSBkYXRhOiAnICsgZSk7XG4gIH1cbn1cbi8qKlxuICogQHBhcmFtIHtIVE1MQ2FudmFzRWxlbWVudH0gY2FudmFzXG4gKiBAcGFyYW0ge0ludGVnZXJ9IHRvcFhcbiAqIEBwYXJhbSB7SW50ZWdlcn0gdG9wWVxuICogQHBhcmFtIHtJbnRlZ2VyfSB3aWR0aFxuICogQHBhcmFtIHtJbnRlZ2VyfSBoZWlnaHRcbiAqIEBwYXJhbSB7RmxvYXR9IHJhZGl1c1xuICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAqL1xuXG5cbmZ1bmN0aW9uIHByb2Nlc3NDYW52YXNSR0JBKGNhbnZhcywgdG9wWCwgdG9wWSwgd2lkdGgsIGhlaWdodCwgcmFkaXVzKSB7XG4gIGlmIChpc05hTihyYWRpdXMpIHx8IHJhZGl1cyA8IDEpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICByYWRpdXMgfD0gMDtcbiAgdmFyIGltYWdlRGF0YSA9IGdldEltYWdlRGF0YUZyb21DYW52YXMoY2FudmFzLCB0b3BYLCB0b3BZLCB3aWR0aCwgaGVpZ2h0KTtcbiAgaW1hZ2VEYXRhID0gcHJvY2Vzc0ltYWdlRGF0YVJHQkEoaW1hZ2VEYXRhLCB0b3BYLCB0b3BZLCB3aWR0aCwgaGVpZ2h0LCByYWRpdXMpO1xuICBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKS5wdXRJbWFnZURhdGEoaW1hZ2VEYXRhLCB0b3BYLCB0b3BZKTtcbn1cbi8qKlxuICogQHBhcmFtIHtJbWFnZURhdGF9IGltYWdlRGF0YVxuICogQHBhcmFtIHtJbnRlZ2VyfSB0b3BYXG4gKiBAcGFyYW0ge0ludGVnZXJ9IHRvcFlcbiAqIEBwYXJhbSB7SW50ZWdlcn0gd2lkdGhcbiAqIEBwYXJhbSB7SW50ZWdlcn0gaGVpZ2h0XG4gKiBAcGFyYW0ge0Zsb2F0fSByYWRpdXNcbiAqIEByZXR1cm5zIHtJbWFnZURhdGF9XG4gKi9cblxuXG5mdW5jdGlvbiBwcm9jZXNzSW1hZ2VEYXRhUkdCQShpbWFnZURhdGEsIHRvcFgsIHRvcFksIHdpZHRoLCBoZWlnaHQsIHJhZGl1cykge1xuICB2YXIgcGl4ZWxzID0gaW1hZ2VEYXRhLmRhdGE7XG4gIHZhciBkaXYgPSAyICogcmFkaXVzICsgMTsgLy8gY29uc3QgdzQgPSB3aWR0aCA8PCAyO1xuXG4gIHZhciB3aWR0aE1pbnVzMSA9IHdpZHRoIC0gMTtcbiAgdmFyIGhlaWdodE1pbnVzMSA9IGhlaWdodCAtIDE7XG4gIHZhciByYWRpdXNQbHVzMSA9IHJhZGl1cyArIDE7XG4gIHZhciBzdW1GYWN0b3IgPSByYWRpdXNQbHVzMSAqIChyYWRpdXNQbHVzMSArIDEpIC8gMjtcbiAgdmFyIHN0YWNrU3RhcnQgPSBuZXcgQmx1clN0YWNrKCk7XG4gIHZhciBzdGFjayA9IHN0YWNrU3RhcnQ7XG4gIHZhciBzdGFja0VuZDtcblxuICBmb3IgKHZhciBpID0gMTsgaSA8IGRpdjsgaSsrKSB7XG4gICAgc3RhY2sgPSBzdGFjay5uZXh0ID0gbmV3IEJsdXJTdGFjaygpO1xuXG4gICAgaWYgKGkgPT09IHJhZGl1c1BsdXMxKSB7XG4gICAgICBzdGFja0VuZCA9IHN0YWNrO1xuICAgIH1cbiAgfVxuXG4gIHN0YWNrLm5leHQgPSBzdGFja1N0YXJ0O1xuICB2YXIgc3RhY2tJbiA9IG51bGwsXG4gICAgICBzdGFja091dCA9IG51bGwsXG4gICAgICB5dyA9IDAsXG4gICAgICB5aSA9IDA7XG4gIHZhciBtdWxTdW0gPSBtdWxUYWJsZVtyYWRpdXNdO1xuICB2YXIgc2hnU3VtID0gc2hnVGFibGVbcmFkaXVzXTtcblxuICBmb3IgKHZhciB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgc3RhY2sgPSBzdGFja1N0YXJ0O1xuICAgIHZhciBwciA9IHBpeGVsc1t5aV0sXG4gICAgICAgIHBnID0gcGl4ZWxzW3lpICsgMV0sXG4gICAgICAgIHBiID0gcGl4ZWxzW3lpICsgMl0sXG4gICAgICAgIHBhID0gcGl4ZWxzW3lpICsgM107XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgcmFkaXVzUGx1czE7IF9pKyspIHtcbiAgICAgIHN0YWNrLnIgPSBwcjtcbiAgICAgIHN0YWNrLmcgPSBwZztcbiAgICAgIHN0YWNrLmIgPSBwYjtcbiAgICAgIHN0YWNrLmEgPSBwYTtcbiAgICAgIHN0YWNrID0gc3RhY2submV4dDtcbiAgICB9XG5cbiAgICB2YXIgckluU3VtID0gMCxcbiAgICAgICAgZ0luU3VtID0gMCxcbiAgICAgICAgYkluU3VtID0gMCxcbiAgICAgICAgYUluU3VtID0gMCxcbiAgICAgICAgck91dFN1bSA9IHJhZGl1c1BsdXMxICogcHIsXG4gICAgICAgIGdPdXRTdW0gPSByYWRpdXNQbHVzMSAqIHBnLFxuICAgICAgICBiT3V0U3VtID0gcmFkaXVzUGx1czEgKiBwYixcbiAgICAgICAgYU91dFN1bSA9IHJhZGl1c1BsdXMxICogcGEsXG4gICAgICAgIHJTdW0gPSBzdW1GYWN0b3IgKiBwcixcbiAgICAgICAgZ1N1bSA9IHN1bUZhY3RvciAqIHBnLFxuICAgICAgICBiU3VtID0gc3VtRmFjdG9yICogcGIsXG4gICAgICAgIGFTdW0gPSBzdW1GYWN0b3IgKiBwYTtcblxuICAgIGZvciAodmFyIF9pMiA9IDE7IF9pMiA8IHJhZGl1c1BsdXMxOyBfaTIrKykge1xuICAgICAgdmFyIHAgPSB5aSArICgod2lkdGhNaW51czEgPCBfaTIgPyB3aWR0aE1pbnVzMSA6IF9pMikgPDwgMik7XG4gICAgICB2YXIgciA9IHBpeGVsc1twXSxcbiAgICAgICAgICBnID0gcGl4ZWxzW3AgKyAxXSxcbiAgICAgICAgICBiID0gcGl4ZWxzW3AgKyAyXSxcbiAgICAgICAgICBhID0gcGl4ZWxzW3AgKyAzXTtcbiAgICAgIHZhciByYnMgPSByYWRpdXNQbHVzMSAtIF9pMjtcbiAgICAgIHJTdW0gKz0gKHN0YWNrLnIgPSByKSAqIHJicztcbiAgICAgIGdTdW0gKz0gKHN0YWNrLmcgPSBnKSAqIHJicztcbiAgICAgIGJTdW0gKz0gKHN0YWNrLmIgPSBiKSAqIHJicztcbiAgICAgIGFTdW0gKz0gKHN0YWNrLmEgPSBhKSAqIHJicztcbiAgICAgIHJJblN1bSArPSByO1xuICAgICAgZ0luU3VtICs9IGc7XG4gICAgICBiSW5TdW0gKz0gYjtcbiAgICAgIGFJblN1bSArPSBhO1xuICAgICAgc3RhY2sgPSBzdGFjay5uZXh0O1xuICAgIH1cblxuICAgIHN0YWNrSW4gPSBzdGFja1N0YXJ0O1xuICAgIHN0YWNrT3V0ID0gc3RhY2tFbmQ7XG5cbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcbiAgICAgIHZhciBwYUluaXRpYWwgPSBhU3VtICogbXVsU3VtID4+PiBzaGdTdW07XG4gICAgICBwaXhlbHNbeWkgKyAzXSA9IHBhSW5pdGlhbDtcblxuICAgICAgaWYgKHBhSW5pdGlhbCAhPT0gMCkge1xuICAgICAgICB2YXIgX2EyID0gMjU1IC8gcGFJbml0aWFsO1xuXG4gICAgICAgIHBpeGVsc1t5aV0gPSAoclN1bSAqIG11bFN1bSA+Pj4gc2hnU3VtKSAqIF9hMjtcbiAgICAgICAgcGl4ZWxzW3lpICsgMV0gPSAoZ1N1bSAqIG11bFN1bSA+Pj4gc2hnU3VtKSAqIF9hMjtcbiAgICAgICAgcGl4ZWxzW3lpICsgMl0gPSAoYlN1bSAqIG11bFN1bSA+Pj4gc2hnU3VtKSAqIF9hMjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBpeGVsc1t5aV0gPSBwaXhlbHNbeWkgKyAxXSA9IHBpeGVsc1t5aSArIDJdID0gMDtcbiAgICAgIH1cblxuICAgICAgclN1bSAtPSByT3V0U3VtO1xuICAgICAgZ1N1bSAtPSBnT3V0U3VtO1xuICAgICAgYlN1bSAtPSBiT3V0U3VtO1xuICAgICAgYVN1bSAtPSBhT3V0U3VtO1xuICAgICAgck91dFN1bSAtPSBzdGFja0luLnI7XG4gICAgICBnT3V0U3VtIC09IHN0YWNrSW4uZztcbiAgICAgIGJPdXRTdW0gLT0gc3RhY2tJbi5iO1xuICAgICAgYU91dFN1bSAtPSBzdGFja0luLmE7XG5cbiAgICAgIHZhciBfcCA9IHggKyByYWRpdXMgKyAxO1xuXG4gICAgICBfcCA9IHl3ICsgKF9wIDwgd2lkdGhNaW51czEgPyBfcCA6IHdpZHRoTWludXMxKSA8PCAyO1xuICAgICAgckluU3VtICs9IHN0YWNrSW4uciA9IHBpeGVsc1tfcF07XG4gICAgICBnSW5TdW0gKz0gc3RhY2tJbi5nID0gcGl4ZWxzW19wICsgMV07XG4gICAgICBiSW5TdW0gKz0gc3RhY2tJbi5iID0gcGl4ZWxzW19wICsgMl07XG4gICAgICBhSW5TdW0gKz0gc3RhY2tJbi5hID0gcGl4ZWxzW19wICsgM107XG4gICAgICByU3VtICs9IHJJblN1bTtcbiAgICAgIGdTdW0gKz0gZ0luU3VtO1xuICAgICAgYlN1bSArPSBiSW5TdW07XG4gICAgICBhU3VtICs9IGFJblN1bTtcbiAgICAgIHN0YWNrSW4gPSBzdGFja0luLm5leHQ7XG4gICAgICB2YXIgX3N0YWNrT3V0ID0gc3RhY2tPdXQsXG4gICAgICAgICAgX3IgPSBfc3RhY2tPdXQucixcbiAgICAgICAgICBfZyA9IF9zdGFja091dC5nLFxuICAgICAgICAgIF9iID0gX3N0YWNrT3V0LmIsXG4gICAgICAgICAgX2EgPSBfc3RhY2tPdXQuYTtcbiAgICAgIHJPdXRTdW0gKz0gX3I7XG4gICAgICBnT3V0U3VtICs9IF9nO1xuICAgICAgYk91dFN1bSArPSBfYjtcbiAgICAgIGFPdXRTdW0gKz0gX2E7XG4gICAgICBySW5TdW0gLT0gX3I7XG4gICAgICBnSW5TdW0gLT0gX2c7XG4gICAgICBiSW5TdW0gLT0gX2I7XG4gICAgICBhSW5TdW0gLT0gX2E7XG4gICAgICBzdGFja091dCA9IHN0YWNrT3V0Lm5leHQ7XG4gICAgICB5aSArPSA0O1xuICAgIH1cblxuICAgIHl3ICs9IHdpZHRoO1xuICB9XG5cbiAgZm9yICh2YXIgX3ggPSAwOyBfeCA8IHdpZHRoOyBfeCsrKSB7XG4gICAgeWkgPSBfeCA8PCAyO1xuXG4gICAgdmFyIF9wciA9IHBpeGVsc1t5aV0sXG4gICAgICAgIF9wZyA9IHBpeGVsc1t5aSArIDFdLFxuICAgICAgICBfcGIgPSBwaXhlbHNbeWkgKyAyXSxcbiAgICAgICAgX3BhID0gcGl4ZWxzW3lpICsgM10sXG4gICAgICAgIF9yT3V0U3VtID0gcmFkaXVzUGx1czEgKiBfcHIsXG4gICAgICAgIF9nT3V0U3VtID0gcmFkaXVzUGx1czEgKiBfcGcsXG4gICAgICAgIF9iT3V0U3VtID0gcmFkaXVzUGx1czEgKiBfcGIsXG4gICAgICAgIF9hT3V0U3VtID0gcmFkaXVzUGx1czEgKiBfcGEsXG4gICAgICAgIF9yU3VtID0gc3VtRmFjdG9yICogX3ByLFxuICAgICAgICBfZ1N1bSA9IHN1bUZhY3RvciAqIF9wZyxcbiAgICAgICAgX2JTdW0gPSBzdW1GYWN0b3IgKiBfcGIsXG4gICAgICAgIF9hU3VtID0gc3VtRmFjdG9yICogX3BhO1xuXG4gICAgc3RhY2sgPSBzdGFja1N0YXJ0O1xuXG4gICAgZm9yICh2YXIgX2kzID0gMDsgX2kzIDwgcmFkaXVzUGx1czE7IF9pMysrKSB7XG4gICAgICBzdGFjay5yID0gX3ByO1xuICAgICAgc3RhY2suZyA9IF9wZztcbiAgICAgIHN0YWNrLmIgPSBfcGI7XG4gICAgICBzdGFjay5hID0gX3BhO1xuICAgICAgc3RhY2sgPSBzdGFjay5uZXh0O1xuICAgIH1cblxuICAgIHZhciB5cCA9IHdpZHRoO1xuICAgIHZhciBfZ0luU3VtID0gMCxcbiAgICAgICAgX2JJblN1bSA9IDAsXG4gICAgICAgIF9hSW5TdW0gPSAwLFxuICAgICAgICBfckluU3VtID0gMDtcblxuICAgIGZvciAodmFyIF9pNCA9IDE7IF9pNCA8PSByYWRpdXM7IF9pNCsrKSB7XG4gICAgICB5aSA9IHlwICsgX3ggPDwgMjtcblxuICAgICAgdmFyIF9yYnMgPSByYWRpdXNQbHVzMSAtIF9pNDtcblxuICAgICAgX3JTdW0gKz0gKHN0YWNrLnIgPSBfcHIgPSBwaXhlbHNbeWldKSAqIF9yYnM7XG4gICAgICBfZ1N1bSArPSAoc3RhY2suZyA9IF9wZyA9IHBpeGVsc1t5aSArIDFdKSAqIF9yYnM7XG4gICAgICBfYlN1bSArPSAoc3RhY2suYiA9IF9wYiA9IHBpeGVsc1t5aSArIDJdKSAqIF9yYnM7XG4gICAgICBfYVN1bSArPSAoc3RhY2suYSA9IF9wYSA9IHBpeGVsc1t5aSArIDNdKSAqIF9yYnM7XG4gICAgICBfckluU3VtICs9IF9wcjtcbiAgICAgIF9nSW5TdW0gKz0gX3BnO1xuICAgICAgX2JJblN1bSArPSBfcGI7XG4gICAgICBfYUluU3VtICs9IF9wYTtcbiAgICAgIHN0YWNrID0gc3RhY2submV4dDtcblxuICAgICAgaWYgKF9pNCA8IGhlaWdodE1pbnVzMSkge1xuICAgICAgICB5cCArPSB3aWR0aDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB5aSA9IF94O1xuICAgIHN0YWNrSW4gPSBzdGFja1N0YXJ0O1xuICAgIHN0YWNrT3V0ID0gc3RhY2tFbmQ7XG5cbiAgICBmb3IgKHZhciBfeSA9IDA7IF95IDwgaGVpZ2h0OyBfeSsrKSB7XG4gICAgICB2YXIgX3AyID0geWkgPDwgMjtcblxuICAgICAgcGl4ZWxzW19wMiArIDNdID0gX3BhID0gX2FTdW0gKiBtdWxTdW0gPj4+IHNoZ1N1bTtcblxuICAgICAgaWYgKF9wYSA+IDApIHtcbiAgICAgICAgX3BhID0gMjU1IC8gX3BhO1xuICAgICAgICBwaXhlbHNbX3AyXSA9IChfclN1bSAqIG11bFN1bSA+Pj4gc2hnU3VtKSAqIF9wYTtcbiAgICAgICAgcGl4ZWxzW19wMiArIDFdID0gKF9nU3VtICogbXVsU3VtID4+PiBzaGdTdW0pICogX3BhO1xuICAgICAgICBwaXhlbHNbX3AyICsgMl0gPSAoX2JTdW0gKiBtdWxTdW0gPj4+IHNoZ1N1bSkgKiBfcGE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwaXhlbHNbX3AyXSA9IHBpeGVsc1tfcDIgKyAxXSA9IHBpeGVsc1tfcDIgKyAyXSA9IDA7XG4gICAgICB9XG5cbiAgICAgIF9yU3VtIC09IF9yT3V0U3VtO1xuICAgICAgX2dTdW0gLT0gX2dPdXRTdW07XG4gICAgICBfYlN1bSAtPSBfYk91dFN1bTtcbiAgICAgIF9hU3VtIC09IF9hT3V0U3VtO1xuICAgICAgX3JPdXRTdW0gLT0gc3RhY2tJbi5yO1xuICAgICAgX2dPdXRTdW0gLT0gc3RhY2tJbi5nO1xuICAgICAgX2JPdXRTdW0gLT0gc3RhY2tJbi5iO1xuICAgICAgX2FPdXRTdW0gLT0gc3RhY2tJbi5hO1xuICAgICAgX3AyID0gX3ggKyAoKF9wMiA9IF95ICsgcmFkaXVzUGx1czEpIDwgaGVpZ2h0TWludXMxID8gX3AyIDogaGVpZ2h0TWludXMxKSAqIHdpZHRoIDw8IDI7XG4gICAgICBfclN1bSArPSBfckluU3VtICs9IHN0YWNrSW4uciA9IHBpeGVsc1tfcDJdO1xuICAgICAgX2dTdW0gKz0gX2dJblN1bSArPSBzdGFja0luLmcgPSBwaXhlbHNbX3AyICsgMV07XG4gICAgICBfYlN1bSArPSBfYkluU3VtICs9IHN0YWNrSW4uYiA9IHBpeGVsc1tfcDIgKyAyXTtcbiAgICAgIF9hU3VtICs9IF9hSW5TdW0gKz0gc3RhY2tJbi5hID0gcGl4ZWxzW19wMiArIDNdO1xuICAgICAgc3RhY2tJbiA9IHN0YWNrSW4ubmV4dDtcbiAgICAgIF9yT3V0U3VtICs9IF9wciA9IHN0YWNrT3V0LnI7XG4gICAgICBfZ091dFN1bSArPSBfcGcgPSBzdGFja091dC5nO1xuICAgICAgX2JPdXRTdW0gKz0gX3BiID0gc3RhY2tPdXQuYjtcbiAgICAgIF9hT3V0U3VtICs9IF9wYSA9IHN0YWNrT3V0LmE7XG4gICAgICBfckluU3VtIC09IF9wcjtcbiAgICAgIF9nSW5TdW0gLT0gX3BnO1xuICAgICAgX2JJblN1bSAtPSBfcGI7XG4gICAgICBfYUluU3VtIC09IF9wYTtcbiAgICAgIHN0YWNrT3V0ID0gc3RhY2tPdXQubmV4dDtcbiAgICAgIHlpICs9IHdpZHRoO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpbWFnZURhdGE7XG59XG4vKipcbiAqIEBwYXJhbSB7SFRNTENhbnZhc0VsZW1lbnR9IGNhbnZhc1xuICogQHBhcmFtIHtJbnRlZ2VyfSB0b3BYXG4gKiBAcGFyYW0ge0ludGVnZXJ9IHRvcFlcbiAqIEBwYXJhbSB7SW50ZWdlcn0gd2lkdGhcbiAqIEBwYXJhbSB7SW50ZWdlcn0gaGVpZ2h0XG4gKiBAcGFyYW0ge0Zsb2F0fSByYWRpdXNcbiAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gKi9cblxuXG5mdW5jdGlvbiBwcm9jZXNzQ2FudmFzUkdCKGNhbnZhcywgdG9wWCwgdG9wWSwgd2lkdGgsIGhlaWdodCwgcmFkaXVzKSB7XG4gIGlmIChpc05hTihyYWRpdXMpIHx8IHJhZGl1cyA8IDEpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICByYWRpdXMgfD0gMDtcbiAgdmFyIGltYWdlRGF0YSA9IGdldEltYWdlRGF0YUZyb21DYW52YXMoY2FudmFzLCB0b3BYLCB0b3BZLCB3aWR0aCwgaGVpZ2h0KTtcbiAgaW1hZ2VEYXRhID0gcHJvY2Vzc0ltYWdlRGF0YVJHQihpbWFnZURhdGEsIHRvcFgsIHRvcFksIHdpZHRoLCBoZWlnaHQsIHJhZGl1cyk7XG4gIGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLnB1dEltYWdlRGF0YShpbWFnZURhdGEsIHRvcFgsIHRvcFkpO1xufVxuLyoqXG4gKiBAcGFyYW0ge0ltYWdlRGF0YX0gaW1hZ2VEYXRhXG4gKiBAcGFyYW0ge0ludGVnZXJ9IHRvcFhcbiAqIEBwYXJhbSB7SW50ZWdlcn0gdG9wWVxuICogQHBhcmFtIHtJbnRlZ2VyfSB3aWR0aFxuICogQHBhcmFtIHtJbnRlZ2VyfSBoZWlnaHRcbiAqIEBwYXJhbSB7RmxvYXR9IHJhZGl1c1xuICogQHJldHVybnMge0ltYWdlRGF0YX1cbiAqL1xuXG5cbmZ1bmN0aW9uIHByb2Nlc3NJbWFnZURhdGFSR0IoaW1hZ2VEYXRhLCB0b3BYLCB0b3BZLCB3aWR0aCwgaGVpZ2h0LCByYWRpdXMpIHtcbiAgdmFyIHBpeGVscyA9IGltYWdlRGF0YS5kYXRhO1xuICB2YXIgZGl2ID0gMiAqIHJhZGl1cyArIDE7IC8vIGNvbnN0IHc0ID0gd2lkdGggPDwgMjtcblxuICB2YXIgd2lkdGhNaW51czEgPSB3aWR0aCAtIDE7XG4gIHZhciBoZWlnaHRNaW51czEgPSBoZWlnaHQgLSAxO1xuICB2YXIgcmFkaXVzUGx1czEgPSByYWRpdXMgKyAxO1xuICB2YXIgc3VtRmFjdG9yID0gcmFkaXVzUGx1czEgKiAocmFkaXVzUGx1czEgKyAxKSAvIDI7XG4gIHZhciBzdGFja1N0YXJ0ID0gbmV3IEJsdXJTdGFjaygpO1xuICB2YXIgc3RhY2sgPSBzdGFja1N0YXJ0O1xuICB2YXIgc3RhY2tFbmQ7XG5cbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBkaXY7IGkrKykge1xuICAgIHN0YWNrID0gc3RhY2submV4dCA9IG5ldyBCbHVyU3RhY2soKTtcblxuICAgIGlmIChpID09PSByYWRpdXNQbHVzMSkge1xuICAgICAgc3RhY2tFbmQgPSBzdGFjaztcbiAgICB9XG4gIH1cblxuICBzdGFjay5uZXh0ID0gc3RhY2tTdGFydDtcbiAgdmFyIHN0YWNrSW4gPSBudWxsO1xuICB2YXIgc3RhY2tPdXQgPSBudWxsO1xuICB2YXIgbXVsU3VtID0gbXVsVGFibGVbcmFkaXVzXTtcbiAgdmFyIHNoZ1N1bSA9IHNoZ1RhYmxlW3JhZGl1c107XG4gIHZhciBwLCByYnM7XG4gIHZhciB5dyA9IDAsXG4gICAgICB5aSA9IDA7XG5cbiAgZm9yICh2YXIgeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xuICAgIHZhciBwciA9IHBpeGVsc1t5aV0sXG4gICAgICAgIHBnID0gcGl4ZWxzW3lpICsgMV0sXG4gICAgICAgIHBiID0gcGl4ZWxzW3lpICsgMl0sXG4gICAgICAgIHJPdXRTdW0gPSByYWRpdXNQbHVzMSAqIHByLFxuICAgICAgICBnT3V0U3VtID0gcmFkaXVzUGx1czEgKiBwZyxcbiAgICAgICAgYk91dFN1bSA9IHJhZGl1c1BsdXMxICogcGIsXG4gICAgICAgIHJTdW0gPSBzdW1GYWN0b3IgKiBwcixcbiAgICAgICAgZ1N1bSA9IHN1bUZhY3RvciAqIHBnLFxuICAgICAgICBiU3VtID0gc3VtRmFjdG9yICogcGI7XG4gICAgc3RhY2sgPSBzdGFja1N0YXJ0O1xuXG4gICAgZm9yICh2YXIgX2k1ID0gMDsgX2k1IDwgcmFkaXVzUGx1czE7IF9pNSsrKSB7XG4gICAgICBzdGFjay5yID0gcHI7XG4gICAgICBzdGFjay5nID0gcGc7XG4gICAgICBzdGFjay5iID0gcGI7XG4gICAgICBzdGFjayA9IHN0YWNrLm5leHQ7XG4gICAgfVxuXG4gICAgdmFyIHJJblN1bSA9IDAsXG4gICAgICAgIGdJblN1bSA9IDAsXG4gICAgICAgIGJJblN1bSA9IDA7XG5cbiAgICBmb3IgKHZhciBfaTYgPSAxOyBfaTYgPCByYWRpdXNQbHVzMTsgX2k2KyspIHtcbiAgICAgIHAgPSB5aSArICgod2lkdGhNaW51czEgPCBfaTYgPyB3aWR0aE1pbnVzMSA6IF9pNikgPDwgMik7XG4gICAgICByU3VtICs9IChzdGFjay5yID0gcHIgPSBwaXhlbHNbcF0pICogKHJicyA9IHJhZGl1c1BsdXMxIC0gX2k2KTtcbiAgICAgIGdTdW0gKz0gKHN0YWNrLmcgPSBwZyA9IHBpeGVsc1twICsgMV0pICogcmJzO1xuICAgICAgYlN1bSArPSAoc3RhY2suYiA9IHBiID0gcGl4ZWxzW3AgKyAyXSkgKiByYnM7XG4gICAgICBySW5TdW0gKz0gcHI7XG4gICAgICBnSW5TdW0gKz0gcGc7XG4gICAgICBiSW5TdW0gKz0gcGI7XG4gICAgICBzdGFjayA9IHN0YWNrLm5leHQ7XG4gICAgfVxuXG4gICAgc3RhY2tJbiA9IHN0YWNrU3RhcnQ7XG4gICAgc3RhY2tPdXQgPSBzdGFja0VuZDtcblxuICAgIGZvciAodmFyIHggPSAwOyB4IDwgd2lkdGg7IHgrKykge1xuICAgICAgcGl4ZWxzW3lpXSA9IHJTdW0gKiBtdWxTdW0gPj4+IHNoZ1N1bTtcbiAgICAgIHBpeGVsc1t5aSArIDFdID0gZ1N1bSAqIG11bFN1bSA+Pj4gc2hnU3VtO1xuICAgICAgcGl4ZWxzW3lpICsgMl0gPSBiU3VtICogbXVsU3VtID4+PiBzaGdTdW07XG4gICAgICByU3VtIC09IHJPdXRTdW07XG4gICAgICBnU3VtIC09IGdPdXRTdW07XG4gICAgICBiU3VtIC09IGJPdXRTdW07XG4gICAgICByT3V0U3VtIC09IHN0YWNrSW4ucjtcbiAgICAgIGdPdXRTdW0gLT0gc3RhY2tJbi5nO1xuICAgICAgYk91dFN1bSAtPSBzdGFja0luLmI7XG4gICAgICBwID0geXcgKyAoKHAgPSB4ICsgcmFkaXVzICsgMSkgPCB3aWR0aE1pbnVzMSA/IHAgOiB3aWR0aE1pbnVzMSkgPDwgMjtcbiAgICAgIHJJblN1bSArPSBzdGFja0luLnIgPSBwaXhlbHNbcF07XG4gICAgICBnSW5TdW0gKz0gc3RhY2tJbi5nID0gcGl4ZWxzW3AgKyAxXTtcbiAgICAgIGJJblN1bSArPSBzdGFja0luLmIgPSBwaXhlbHNbcCArIDJdO1xuICAgICAgclN1bSArPSBySW5TdW07XG4gICAgICBnU3VtICs9IGdJblN1bTtcbiAgICAgIGJTdW0gKz0gYkluU3VtO1xuICAgICAgc3RhY2tJbiA9IHN0YWNrSW4ubmV4dDtcbiAgICAgIHJPdXRTdW0gKz0gcHIgPSBzdGFja091dC5yO1xuICAgICAgZ091dFN1bSArPSBwZyA9IHN0YWNrT3V0Lmc7XG4gICAgICBiT3V0U3VtICs9IHBiID0gc3RhY2tPdXQuYjtcbiAgICAgIHJJblN1bSAtPSBwcjtcbiAgICAgIGdJblN1bSAtPSBwZztcbiAgICAgIGJJblN1bSAtPSBwYjtcbiAgICAgIHN0YWNrT3V0ID0gc3RhY2tPdXQubmV4dDtcbiAgICAgIHlpICs9IDQ7XG4gICAgfVxuXG4gICAgeXcgKz0gd2lkdGg7XG4gIH1cblxuICBmb3IgKHZhciBfeDIgPSAwOyBfeDIgPCB3aWR0aDsgX3gyKyspIHtcbiAgICB5aSA9IF94MiA8PCAyO1xuXG4gICAgdmFyIF9wcjIgPSBwaXhlbHNbeWldLFxuICAgICAgICBfcGcyID0gcGl4ZWxzW3lpICsgMV0sXG4gICAgICAgIF9wYjIgPSBwaXhlbHNbeWkgKyAyXSxcbiAgICAgICAgX3JPdXRTdW0yID0gcmFkaXVzUGx1czEgKiBfcHIyLFxuICAgICAgICBfZ091dFN1bTIgPSByYWRpdXNQbHVzMSAqIF9wZzIsXG4gICAgICAgIF9iT3V0U3VtMiA9IHJhZGl1c1BsdXMxICogX3BiMixcbiAgICAgICAgX3JTdW0yID0gc3VtRmFjdG9yICogX3ByMixcbiAgICAgICAgX2dTdW0yID0gc3VtRmFjdG9yICogX3BnMixcbiAgICAgICAgX2JTdW0yID0gc3VtRmFjdG9yICogX3BiMjtcblxuICAgIHN0YWNrID0gc3RhY2tTdGFydDtcblxuICAgIGZvciAodmFyIF9pNyA9IDA7IF9pNyA8IHJhZGl1c1BsdXMxOyBfaTcrKykge1xuICAgICAgc3RhY2suciA9IF9wcjI7XG4gICAgICBzdGFjay5nID0gX3BnMjtcbiAgICAgIHN0YWNrLmIgPSBfcGIyO1xuICAgICAgc3RhY2sgPSBzdGFjay5uZXh0O1xuICAgIH1cblxuICAgIHZhciBfckluU3VtMiA9IDAsXG4gICAgICAgIF9nSW5TdW0yID0gMCxcbiAgICAgICAgX2JJblN1bTIgPSAwO1xuXG4gICAgZm9yICh2YXIgX2k4ID0gMSwgeXAgPSB3aWR0aDsgX2k4IDw9IHJhZGl1czsgX2k4KyspIHtcbiAgICAgIHlpID0geXAgKyBfeDIgPDwgMjtcbiAgICAgIF9yU3VtMiArPSAoc3RhY2suciA9IF9wcjIgPSBwaXhlbHNbeWldKSAqIChyYnMgPSByYWRpdXNQbHVzMSAtIF9pOCk7XG4gICAgICBfZ1N1bTIgKz0gKHN0YWNrLmcgPSBfcGcyID0gcGl4ZWxzW3lpICsgMV0pICogcmJzO1xuICAgICAgX2JTdW0yICs9IChzdGFjay5iID0gX3BiMiA9IHBpeGVsc1t5aSArIDJdKSAqIHJicztcbiAgICAgIF9ySW5TdW0yICs9IF9wcjI7XG4gICAgICBfZ0luU3VtMiArPSBfcGcyO1xuICAgICAgX2JJblN1bTIgKz0gX3BiMjtcbiAgICAgIHN0YWNrID0gc3RhY2submV4dDtcblxuICAgICAgaWYgKF9pOCA8IGhlaWdodE1pbnVzMSkge1xuICAgICAgICB5cCArPSB3aWR0aDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB5aSA9IF94MjtcbiAgICBzdGFja0luID0gc3RhY2tTdGFydDtcbiAgICBzdGFja091dCA9IHN0YWNrRW5kO1xuXG4gICAgZm9yICh2YXIgX3kyID0gMDsgX3kyIDwgaGVpZ2h0OyBfeTIrKykge1xuICAgICAgcCA9IHlpIDw8IDI7XG4gICAgICBwaXhlbHNbcF0gPSBfclN1bTIgKiBtdWxTdW0gPj4+IHNoZ1N1bTtcbiAgICAgIHBpeGVsc1twICsgMV0gPSBfZ1N1bTIgKiBtdWxTdW0gPj4+IHNoZ1N1bTtcbiAgICAgIHBpeGVsc1twICsgMl0gPSBfYlN1bTIgKiBtdWxTdW0gPj4+IHNoZ1N1bTtcbiAgICAgIF9yU3VtMiAtPSBfck91dFN1bTI7XG4gICAgICBfZ1N1bTIgLT0gX2dPdXRTdW0yO1xuICAgICAgX2JTdW0yIC09IF9iT3V0U3VtMjtcbiAgICAgIF9yT3V0U3VtMiAtPSBzdGFja0luLnI7XG4gICAgICBfZ091dFN1bTIgLT0gc3RhY2tJbi5nO1xuICAgICAgX2JPdXRTdW0yIC09IHN0YWNrSW4uYjtcbiAgICAgIHAgPSBfeDIgKyAoKHAgPSBfeTIgKyByYWRpdXNQbHVzMSkgPCBoZWlnaHRNaW51czEgPyBwIDogaGVpZ2h0TWludXMxKSAqIHdpZHRoIDw8IDI7XG4gICAgICBfclN1bTIgKz0gX3JJblN1bTIgKz0gc3RhY2tJbi5yID0gcGl4ZWxzW3BdO1xuICAgICAgX2dTdW0yICs9IF9nSW5TdW0yICs9IHN0YWNrSW4uZyA9IHBpeGVsc1twICsgMV07XG4gICAgICBfYlN1bTIgKz0gX2JJblN1bTIgKz0gc3RhY2tJbi5iID0gcGl4ZWxzW3AgKyAyXTtcbiAgICAgIHN0YWNrSW4gPSBzdGFja0luLm5leHQ7XG4gICAgICBfck91dFN1bTIgKz0gX3ByMiA9IHN0YWNrT3V0LnI7XG4gICAgICBfZ091dFN1bTIgKz0gX3BnMiA9IHN0YWNrT3V0Lmc7XG4gICAgICBfYk91dFN1bTIgKz0gX3BiMiA9IHN0YWNrT3V0LmI7XG4gICAgICBfckluU3VtMiAtPSBfcHIyO1xuICAgICAgX2dJblN1bTIgLT0gX3BnMjtcbiAgICAgIF9iSW5TdW0yIC09IF9wYjI7XG4gICAgICBzdGFja091dCA9IHN0YWNrT3V0Lm5leHQ7XG4gICAgICB5aSArPSB3aWR0aDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaW1hZ2VEYXRhO1xufVxuLyoqXG4gKlxuICovXG5cblxudmFyIEJsdXJTdGFjayA9XG4vKipcbiAqIFNldCBwcm9wZXJ0aWVzLlxuICovXG5mdW5jdGlvbiBCbHVyU3RhY2soKSB7XG4gIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBCbHVyU3RhY2spO1xuXG4gIHRoaXMuciA9IDA7XG4gIHRoaXMuZyA9IDA7XG4gIHRoaXMuYiA9IDA7XG4gIHRoaXMuYSA9IDA7XG4gIHRoaXMubmV4dCA9IG51bGw7XG59O1xuXG5leHBvcnQgeyBCbHVyU3RhY2ssIHByb2Nlc3NDYW52YXNSR0IgYXMgY2FudmFzUkdCLCBwcm9jZXNzQ2FudmFzUkdCQSBhcyBjYW52YXNSR0JBLCBwcm9jZXNzSW1hZ2UgYXMgaW1hZ2UsIHByb2Nlc3NJbWFnZURhdGFSR0IgYXMgaW1hZ2VEYXRhUkdCLCBwcm9jZXNzSW1hZ2VEYXRhUkdCQSBhcyBpbWFnZURhdGFSR0JBIH07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMoc3R5bGVFbGVtZW50KSB7XG4gIHZhciBub25jZSA9IHR5cGVvZiBfX3dlYnBhY2tfbm9uY2VfXyAhPT0gXCJ1bmRlZmluZWRcIiA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXM7IiwiY29uc3QgY3JlYXRlU3RvcmVJbXBsID0gKGNyZWF0ZVN0YXRlKSA9PiB7XG4gIGxldCBzdGF0ZTtcbiAgY29uc3QgbGlzdGVuZXJzID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTtcbiAgY29uc3Qgc2V0U3RhdGUgPSAocGFydGlhbCwgcmVwbGFjZSkgPT4ge1xuICAgIGNvbnN0IG5leHRTdGF0ZSA9IHR5cGVvZiBwYXJ0aWFsID09PSBcImZ1bmN0aW9uXCIgPyBwYXJ0aWFsKHN0YXRlKSA6IHBhcnRpYWw7XG4gICAgaWYgKCFPYmplY3QuaXMobmV4dFN0YXRlLCBzdGF0ZSkpIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzU3RhdGUgPSBzdGF0ZTtcbiAgICAgIHN0YXRlID0gKHJlcGxhY2UgIT0gbnVsbCA/IHJlcGxhY2UgOiB0eXBlb2YgbmV4dFN0YXRlICE9PSBcIm9iamVjdFwiIHx8IG5leHRTdGF0ZSA9PT0gbnVsbCkgPyBuZXh0U3RhdGUgOiBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSwgbmV4dFN0YXRlKTtcbiAgICAgIGxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4gbGlzdGVuZXIoc3RhdGUsIHByZXZpb3VzU3RhdGUpKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IGdldFN0YXRlID0gKCkgPT4gc3RhdGU7XG4gIGNvbnN0IGdldEluaXRpYWxTdGF0ZSA9ICgpID0+IGluaXRpYWxTdGF0ZTtcbiAgY29uc3Qgc3Vic2NyaWJlID0gKGxpc3RlbmVyKSA9PiB7XG4gICAgbGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgcmV0dXJuICgpID0+IGxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICB9O1xuICBjb25zdCBhcGkgPSB7IHNldFN0YXRlLCBnZXRTdGF0ZSwgZ2V0SW5pdGlhbFN0YXRlLCBzdWJzY3JpYmUgfTtcbiAgY29uc3QgaW5pdGlhbFN0YXRlID0gc3RhdGUgPSBjcmVhdGVTdGF0ZShzZXRTdGF0ZSwgZ2V0U3RhdGUsIGFwaSk7XG4gIHJldHVybiBhcGk7XG59O1xuY29uc3QgY3JlYXRlU3RvcmUgPSAoKGNyZWF0ZVN0YXRlKSA9PiBjcmVhdGVTdGF0ZSA/IGNyZWF0ZVN0b3JlSW1wbChjcmVhdGVTdGF0ZSkgOiBjcmVhdGVTdG9yZUltcGwpO1xuXG5leHBvcnQgeyBjcmVhdGVTdG9yZSB9O1xuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNyZWF0ZVN0b3JlIH0gZnJvbSAnenVzdGFuZC92YW5pbGxhJztcblxuY29uc3QgaWRlbnRpdHkgPSAoYXJnKSA9PiBhcmc7XG5mdW5jdGlvbiB1c2VTdG9yZShhcGksIHNlbGVjdG9yID0gaWRlbnRpdHkpIHtcbiAgY29uc3Qgc2xpY2UgPSBSZWFjdC51c2VTeW5jRXh0ZXJuYWxTdG9yZShcbiAgICBhcGkuc3Vic2NyaWJlLFxuICAgIFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHNlbGVjdG9yKGFwaS5nZXRTdGF0ZSgpKSwgW2FwaSwgc2VsZWN0b3JdKSxcbiAgICBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiBzZWxlY3RvcihhcGkuZ2V0SW5pdGlhbFN0YXRlKCkpLCBbYXBpLCBzZWxlY3Rvcl0pXG4gICk7XG4gIFJlYWN0LnVzZURlYnVnVmFsdWUoc2xpY2UpO1xuICByZXR1cm4gc2xpY2U7XG59XG5jb25zdCBjcmVhdGVJbXBsID0gKGNyZWF0ZVN0YXRlKSA9PiB7XG4gIGNvbnN0IGFwaSA9IGNyZWF0ZVN0b3JlKGNyZWF0ZVN0YXRlKTtcbiAgY29uc3QgdXNlQm91bmRTdG9yZSA9IChzZWxlY3RvcikgPT4gdXNlU3RvcmUoYXBpLCBzZWxlY3Rvcik7XG4gIE9iamVjdC5hc3NpZ24odXNlQm91bmRTdG9yZSwgYXBpKTtcbiAgcmV0dXJuIHVzZUJvdW5kU3RvcmU7XG59O1xuY29uc3QgY3JlYXRlID0gKChjcmVhdGVTdGF0ZSkgPT4gY3JlYXRlU3RhdGUgPyBjcmVhdGVJbXBsKGNyZWF0ZVN0YXRlKSA6IGNyZWF0ZUltcGwpO1xuXG5leHBvcnQgeyBjcmVhdGUsIHVzZVN0b3JlIH07XG4iLCJleHBvcnQgKiBmcm9tICd6dXN0YW5kL3ZhbmlsbGEnO1xuZXhwb3J0ICogZnJvbSAnenVzdGFuZC9yZWFjdCc7XG4iLCJmdW5jdGlvbiBfY2xhc3NfYXBwbHlfZGVzY3JpcHRvcl9nZXQocmVjZWl2ZXIsIGRlc2NyaXB0b3IpIHtcbiAgICBpZiAoZGVzY3JpcHRvci5nZXQpIHJldHVybiBkZXNjcmlwdG9yLmdldC5jYWxsKHJlY2VpdmVyKTtcblxuICAgIHJldHVybiBkZXNjcmlwdG9yLnZhbHVlO1xufVxuZXhwb3J0IHsgX2NsYXNzX2FwcGx5X2Rlc2NyaXB0b3JfZ2V0IGFzIF8gfTtcbiIsImltcG9ydCB7IF8gYXMgX2NsYXNzX2FwcGx5X2Rlc2NyaXB0b3JfZ2V0IH0gZnJvbSBcIi4vX2NsYXNzX2FwcGx5X2Rlc2NyaXB0b3JfZ2V0LmpzXCI7XG5pbXBvcnQgeyBfIGFzIF9jbGFzc19leHRyYWN0X2ZpZWxkX2Rlc2NyaXB0b3IgfSBmcm9tIFwiLi9fY2xhc3NfZXh0cmFjdF9maWVsZF9kZXNjcmlwdG9yLmpzXCI7XG5cbmZ1bmN0aW9uIF9jbGFzc19wcml2YXRlX2ZpZWxkX2dldChyZWNlaXZlciwgcHJpdmF0ZU1hcCkge1xuICAgIHZhciBkZXNjcmlwdG9yID0gX2NsYXNzX2V4dHJhY3RfZmllbGRfZGVzY3JpcHRvcihyZWNlaXZlciwgcHJpdmF0ZU1hcCwgXCJnZXRcIik7XG4gICAgcmV0dXJuIF9jbGFzc19hcHBseV9kZXNjcmlwdG9yX2dldChyZWNlaXZlciwgZGVzY3JpcHRvcik7XG59XG5leHBvcnQgeyBfY2xhc3NfcHJpdmF0ZV9maWVsZF9nZXQgYXMgXyB9O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL2Nqcy91c2Utc3luYy1leHRlcm5hbC1zdG9yZS1zaGltL3dpdGgtc2VsZWN0b3IucHJvZHVjdGlvbi5qcycpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9janMvdXNlLXN5bmMtZXh0ZXJuYWwtc3RvcmUtc2hpbS93aXRoLXNlbGVjdG9yLmRldmVsb3BtZW50LmpzJyk7XG59XG4iLCJmdW5jdGlvbiBtZW1vKGdldERlcHMsIGZuLCBvcHRzKSB7XG4gIGxldCBkZXBzID0gb3B0cy5pbml0aWFsRGVwcyA/PyBbXTtcbiAgbGV0IHJlc3VsdDtcbiAgZnVuY3Rpb24gbWVtb2l6ZWRGdW5jdGlvbigpIHtcbiAgICB2YXIgX2EsIF9iLCBfYywgX2Q7XG4gICAgbGV0IGRlcFRpbWU7XG4gICAgaWYgKG9wdHMua2V5ICYmICgoX2EgPSBvcHRzLmRlYnVnKSA9PSBudWxsID8gdm9pZCAwIDogX2EuY2FsbChvcHRzKSkpIGRlcFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIGNvbnN0IG5ld0RlcHMgPSBnZXREZXBzKCk7XG4gICAgY29uc3QgZGVwc0NoYW5nZWQgPSBuZXdEZXBzLmxlbmd0aCAhPT0gZGVwcy5sZW5ndGggfHwgbmV3RGVwcy5zb21lKChkZXAsIGluZGV4KSA9PiBkZXBzW2luZGV4XSAhPT0gZGVwKTtcbiAgICBpZiAoIWRlcHNDaGFuZ2VkKSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBkZXBzID0gbmV3RGVwcztcbiAgICBsZXQgcmVzdWx0VGltZTtcbiAgICBpZiAob3B0cy5rZXkgJiYgKChfYiA9IG9wdHMuZGVidWcpID09IG51bGwgPyB2b2lkIDAgOiBfYi5jYWxsKG9wdHMpKSkgcmVzdWx0VGltZSA9IERhdGUubm93KCk7XG4gICAgcmVzdWx0ID0gZm4oLi4ubmV3RGVwcyk7XG4gICAgaWYgKG9wdHMua2V5ICYmICgoX2MgPSBvcHRzLmRlYnVnKSA9PSBudWxsID8gdm9pZCAwIDogX2MuY2FsbChvcHRzKSkpIHtcbiAgICAgIGNvbnN0IGRlcEVuZFRpbWUgPSBNYXRoLnJvdW5kKChEYXRlLm5vdygpIC0gZGVwVGltZSkgKiAxMDApIC8gMTAwO1xuICAgICAgY29uc3QgcmVzdWx0RW5kVGltZSA9IE1hdGgucm91bmQoKERhdGUubm93KCkgLSByZXN1bHRUaW1lKSAqIDEwMCkgLyAxMDA7XG4gICAgICBjb25zdCByZXN1bHRGcHNQZXJjZW50YWdlID0gcmVzdWx0RW5kVGltZSAvIDE2O1xuICAgICAgY29uc3QgcGFkID0gKHN0ciwgbnVtKSA9PiB7XG4gICAgICAgIHN0ciA9IFN0cmluZyhzdHIpO1xuICAgICAgICB3aGlsZSAoc3RyLmxlbmd0aCA8IG51bSkge1xuICAgICAgICAgIHN0ciA9IFwiIFwiICsgc3RyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgICB9O1xuICAgICAgY29uc29sZS5pbmZvKFxuICAgICAgICBgJWPij7EgJHtwYWQocmVzdWx0RW5kVGltZSwgNSl9IC8ke3BhZChkZXBFbmRUaW1lLCA1KX0gbXNgLFxuICAgICAgICBgXG4gICAgICAgICAgICBmb250LXNpemU6IC42cmVtO1xuICAgICAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgICAgICAgICBjb2xvcjogaHNsKCR7TWF0aC5tYXgoXG4gICAgICAgICAgMCxcbiAgICAgICAgICBNYXRoLm1pbigxMjAgLSAxMjAgKiByZXN1bHRGcHNQZXJjZW50YWdlLCAxMjApXG4gICAgICAgICl9ZGVnIDEwMCUgMzElKTtgLFxuICAgICAgICBvcHRzID09IG51bGwgPyB2b2lkIDAgOiBvcHRzLmtleVxuICAgICAgKTtcbiAgICB9XG4gICAgKF9kID0gb3B0cyA9PSBudWxsID8gdm9pZCAwIDogb3B0cy5vbkNoYW5nZSkgPT0gbnVsbCA/IHZvaWQgMCA6IF9kLmNhbGwob3B0cywgcmVzdWx0KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIG1lbW9pemVkRnVuY3Rpb24udXBkYXRlRGVwcyA9IChuZXdEZXBzKSA9PiB7XG4gICAgZGVwcyA9IG5ld0RlcHM7XG4gIH07XG4gIHJldHVybiBtZW1vaXplZEZ1bmN0aW9uO1xufVxuZnVuY3Rpb24gbm90VW5kZWZpbmVkKHZhbHVlLCBtc2cpIHtcbiAgaWYgKHZhbHVlID09PSB2b2lkIDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgdW5kZWZpbmVkJHttc2cgPyBgOiAke21zZ31gIDogXCJcIn1gKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn1cbmNvbnN0IGFwcHJveEVxdWFsID0gKGEsIGIpID0+IE1hdGguYWJzKGEgLSBiKSA8IDEuMDE7XG5jb25zdCBkZWJvdW5jZSA9ICh0YXJnZXRXaW5kb3csIGZuLCBtcykgPT4ge1xuICBsZXQgdGltZW91dElkO1xuICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncykge1xuICAgIHRhcmdldFdpbmRvdy5jbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICB0aW1lb3V0SWQgPSB0YXJnZXRXaW5kb3cuc2V0VGltZW91dCgoKSA9PiBmbi5hcHBseSh0aGlzLCBhcmdzKSwgbXMpO1xuICB9O1xufTtcbmV4cG9ydCB7XG4gIGFwcHJveEVxdWFsLFxuICBkZWJvdW5jZSxcbiAgbWVtbyxcbiAgbm90VW5kZWZpbmVkXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXRpbHMuanMubWFwXG4iLCJpbXBvcnQgeyBkZWJvdW5jZSwgbWVtbywgbm90VW5kZWZpbmVkLCBhcHByb3hFcXVhbCB9IGZyb20gXCIuL3V0aWxzLmpzXCI7XG5jb25zdCBnZXRSZWN0ID0gKGVsZW1lbnQpID0+IHtcbiAgY29uc3QgeyBvZmZzZXRXaWR0aCwgb2Zmc2V0SGVpZ2h0IH0gPSBlbGVtZW50O1xuICByZXR1cm4geyB3aWR0aDogb2Zmc2V0V2lkdGgsIGhlaWdodDogb2Zmc2V0SGVpZ2h0IH07XG59O1xuY29uc3QgZGVmYXVsdEtleUV4dHJhY3RvciA9IChpbmRleCkgPT4gaW5kZXg7XG5jb25zdCBkZWZhdWx0UmFuZ2VFeHRyYWN0b3IgPSAocmFuZ2UpID0+IHtcbiAgY29uc3Qgc3RhcnQgPSBNYXRoLm1heChyYW5nZS5zdGFydEluZGV4IC0gcmFuZ2Uub3ZlcnNjYW4sIDApO1xuICBjb25zdCBlbmQgPSBNYXRoLm1pbihyYW5nZS5lbmRJbmRleCArIHJhbmdlLm92ZXJzY2FuLCByYW5nZS5jb3VudCAtIDEpO1xuICBjb25zdCBhcnIgPSBbXTtcbiAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDw9IGVuZDsgaSsrKSB7XG4gICAgYXJyLnB1c2goaSk7XG4gIH1cbiAgcmV0dXJuIGFycjtcbn07XG5jb25zdCBvYnNlcnZlRWxlbWVudFJlY3QgPSAoaW5zdGFuY2UsIGNiKSA9PiB7XG4gIGNvbnN0IGVsZW1lbnQgPSBpbnN0YW5jZS5zY3JvbGxFbGVtZW50O1xuICBpZiAoIWVsZW1lbnQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgdGFyZ2V0V2luZG93ID0gaW5zdGFuY2UudGFyZ2V0V2luZG93O1xuICBpZiAoIXRhcmdldFdpbmRvdykge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBoYW5kbGVyID0gKHJlY3QpID0+IHtcbiAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IHJlY3Q7XG4gICAgY2IoeyB3aWR0aDogTWF0aC5yb3VuZCh3aWR0aCksIGhlaWdodDogTWF0aC5yb3VuZChoZWlnaHQpIH0pO1xuICB9O1xuICBoYW5kbGVyKGdldFJlY3QoZWxlbWVudCkpO1xuICBpZiAoIXRhcmdldFdpbmRvdy5SZXNpemVPYnNlcnZlcikge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgfTtcbiAgfVxuICBjb25zdCBvYnNlcnZlciA9IG5ldyB0YXJnZXRXaW5kb3cuUmVzaXplT2JzZXJ2ZXIoKGVudHJpZXMpID0+IHtcbiAgICBjb25zdCBydW4gPSAoKSA9PiB7XG4gICAgICBjb25zdCBlbnRyeSA9IGVudHJpZXNbMF07XG4gICAgICBpZiAoZW50cnkgPT0gbnVsbCA/IHZvaWQgMCA6IGVudHJ5LmJvcmRlckJveFNpemUpIHtcbiAgICAgICAgY29uc3QgYm94ID0gZW50cnkuYm9yZGVyQm94U2l6ZVswXTtcbiAgICAgICAgaWYgKGJveCkge1xuICAgICAgICAgIGhhbmRsZXIoeyB3aWR0aDogYm94LmlubGluZVNpemUsIGhlaWdodDogYm94LmJsb2NrU2l6ZSB9KTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGhhbmRsZXIoZ2V0UmVjdChlbGVtZW50KSk7XG4gICAgfTtcbiAgICBpbnN0YW5jZS5vcHRpb25zLnVzZUFuaW1hdGlvbkZyYW1lV2l0aFJlc2l6ZU9ic2VydmVyID8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJ1bikgOiBydW4oKTtcbiAgfSk7XG4gIG9ic2VydmVyLm9ic2VydmUoZWxlbWVudCwgeyBib3g6IFwiYm9yZGVyLWJveFwiIH0pO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIG9ic2VydmVyLnVub2JzZXJ2ZShlbGVtZW50KTtcbiAgfTtcbn07XG5jb25zdCBhZGRFdmVudExpc3RlbmVyT3B0aW9ucyA9IHtcbiAgcGFzc2l2ZTogdHJ1ZVxufTtcbmNvbnN0IG9ic2VydmVXaW5kb3dSZWN0ID0gKGluc3RhbmNlLCBjYikgPT4ge1xuICBjb25zdCBlbGVtZW50ID0gaW5zdGFuY2Uuc2Nyb2xsRWxlbWVudDtcbiAgaWYgKCFlbGVtZW50KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGhhbmRsZXIgPSAoKSA9PiB7XG4gICAgY2IoeyB3aWR0aDogZWxlbWVudC5pbm5lcldpZHRoLCBoZWlnaHQ6IGVsZW1lbnQuaW5uZXJIZWlnaHQgfSk7XG4gIH07XG4gIGhhbmRsZXIoKTtcbiAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIGhhbmRsZXIsIGFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgaGFuZGxlcik7XG4gIH07XG59O1xuY29uc3Qgc3VwcG9ydHNTY3JvbGxlbmQgPSB0eXBlb2Ygd2luZG93ID09IFwidW5kZWZpbmVkXCIgPyB0cnVlIDogXCJvbnNjcm9sbGVuZFwiIGluIHdpbmRvdztcbmNvbnN0IG9ic2VydmVFbGVtZW50T2Zmc2V0ID0gKGluc3RhbmNlLCBjYikgPT4ge1xuICBjb25zdCBlbGVtZW50ID0gaW5zdGFuY2Uuc2Nyb2xsRWxlbWVudDtcbiAgaWYgKCFlbGVtZW50KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHRhcmdldFdpbmRvdyA9IGluc3RhbmNlLnRhcmdldFdpbmRvdztcbiAgaWYgKCF0YXJnZXRXaW5kb3cpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IG9mZnNldCA9IDA7XG4gIGNvbnN0IGZhbGxiYWNrID0gaW5zdGFuY2Uub3B0aW9ucy51c2VTY3JvbGxlbmRFdmVudCAmJiBzdXBwb3J0c1Njcm9sbGVuZCA/ICgpID0+IHZvaWQgMCA6IGRlYm91bmNlKFxuICAgIHRhcmdldFdpbmRvdyxcbiAgICAoKSA9PiB7XG4gICAgICBjYihvZmZzZXQsIGZhbHNlKTtcbiAgICB9LFxuICAgIGluc3RhbmNlLm9wdGlvbnMuaXNTY3JvbGxpbmdSZXNldERlbGF5XG4gICk7XG4gIGNvbnN0IGNyZWF0ZUhhbmRsZXIgPSAoaXNTY3JvbGxpbmcpID0+ICgpID0+IHtcbiAgICBjb25zdCB7IGhvcml6b250YWwsIGlzUnRsIH0gPSBpbnN0YW5jZS5vcHRpb25zO1xuICAgIG9mZnNldCA9IGhvcml6b250YWwgPyBlbGVtZW50W1wic2Nyb2xsTGVmdFwiXSAqIChpc1J0bCAmJiAtMSB8fCAxKSA6IGVsZW1lbnRbXCJzY3JvbGxUb3BcIl07XG4gICAgZmFsbGJhY2soKTtcbiAgICBjYihvZmZzZXQsIGlzU2Nyb2xsaW5nKTtcbiAgfTtcbiAgY29uc3QgaGFuZGxlciA9IGNyZWF0ZUhhbmRsZXIodHJ1ZSk7XG4gIGNvbnN0IGVuZEhhbmRsZXIgPSBjcmVhdGVIYW5kbGVyKGZhbHNlKTtcbiAgZW5kSGFuZGxlcigpO1xuICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgaGFuZGxlciwgYWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xuICBjb25zdCByZWdpc3RlclNjcm9sbGVuZEV2ZW50ID0gaW5zdGFuY2Uub3B0aW9ucy51c2VTY3JvbGxlbmRFdmVudCAmJiBzdXBwb3J0c1Njcm9sbGVuZDtcbiAgaWYgKHJlZ2lzdGVyU2Nyb2xsZW5kRXZlbnQpIHtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxlbmRcIiwgZW5kSGFuZGxlciwgYWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xuICB9XG4gIHJldHVybiAoKSA9PiB7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIGhhbmRsZXIpO1xuICAgIGlmIChyZWdpc3RlclNjcm9sbGVuZEV2ZW50KSB7XG4gICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzY3JvbGxlbmRcIiwgZW5kSGFuZGxlcik7XG4gICAgfVxuICB9O1xufTtcbmNvbnN0IG9ic2VydmVXaW5kb3dPZmZzZXQgPSAoaW5zdGFuY2UsIGNiKSA9PiB7XG4gIGNvbnN0IGVsZW1lbnQgPSBpbnN0YW5jZS5zY3JvbGxFbGVtZW50O1xuICBpZiAoIWVsZW1lbnQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgdGFyZ2V0V2luZG93ID0gaW5zdGFuY2UudGFyZ2V0V2luZG93O1xuICBpZiAoIXRhcmdldFdpbmRvdykge1xuICAgIHJldHVybjtcbiAgfVxuICBsZXQgb2Zmc2V0ID0gMDtcbiAgY29uc3QgZmFsbGJhY2sgPSBpbnN0YW5jZS5vcHRpb25zLnVzZVNjcm9sbGVuZEV2ZW50ICYmIHN1cHBvcnRzU2Nyb2xsZW5kID8gKCkgPT4gdm9pZCAwIDogZGVib3VuY2UoXG4gICAgdGFyZ2V0V2luZG93LFxuICAgICgpID0+IHtcbiAgICAgIGNiKG9mZnNldCwgZmFsc2UpO1xuICAgIH0sXG4gICAgaW5zdGFuY2Uub3B0aW9ucy5pc1Njcm9sbGluZ1Jlc2V0RGVsYXlcbiAgKTtcbiAgY29uc3QgY3JlYXRlSGFuZGxlciA9IChpc1Njcm9sbGluZykgPT4gKCkgPT4ge1xuICAgIG9mZnNldCA9IGVsZW1lbnRbaW5zdGFuY2Uub3B0aW9ucy5ob3Jpem9udGFsID8gXCJzY3JvbGxYXCIgOiBcInNjcm9sbFlcIl07XG4gICAgZmFsbGJhY2soKTtcbiAgICBjYihvZmZzZXQsIGlzU2Nyb2xsaW5nKTtcbiAgfTtcbiAgY29uc3QgaGFuZGxlciA9IGNyZWF0ZUhhbmRsZXIodHJ1ZSk7XG4gIGNvbnN0IGVuZEhhbmRsZXIgPSBjcmVhdGVIYW5kbGVyKGZhbHNlKTtcbiAgZW5kSGFuZGxlcigpO1xuICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgaGFuZGxlciwgYWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xuICBjb25zdCByZWdpc3RlclNjcm9sbGVuZEV2ZW50ID0gaW5zdGFuY2Uub3B0aW9ucy51c2VTY3JvbGxlbmRFdmVudCAmJiBzdXBwb3J0c1Njcm9sbGVuZDtcbiAgaWYgKHJlZ2lzdGVyU2Nyb2xsZW5kRXZlbnQpIHtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxlbmRcIiwgZW5kSGFuZGxlciwgYWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xuICB9XG4gIHJldHVybiAoKSA9PiB7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIGhhbmRsZXIpO1xuICAgIGlmIChyZWdpc3RlclNjcm9sbGVuZEV2ZW50KSB7XG4gICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzY3JvbGxlbmRcIiwgZW5kSGFuZGxlcik7XG4gICAgfVxuICB9O1xufTtcbmNvbnN0IG1lYXN1cmVFbGVtZW50ID0gKGVsZW1lbnQsIGVudHJ5LCBpbnN0YW5jZSkgPT4ge1xuICBpZiAoZW50cnkgPT0gbnVsbCA/IHZvaWQgMCA6IGVudHJ5LmJvcmRlckJveFNpemUpIHtcbiAgICBjb25zdCBib3ggPSBlbnRyeS5ib3JkZXJCb3hTaXplWzBdO1xuICAgIGlmIChib3gpIHtcbiAgICAgIGNvbnN0IHNpemUgPSBNYXRoLnJvdW5kKFxuICAgICAgICBib3hbaW5zdGFuY2Uub3B0aW9ucy5ob3Jpem9udGFsID8gXCJpbmxpbmVTaXplXCIgOiBcImJsb2NrU2l6ZVwiXVxuICAgICAgKTtcbiAgICAgIHJldHVybiBzaXplO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZWxlbWVudFtpbnN0YW5jZS5vcHRpb25zLmhvcml6b250YWwgPyBcIm9mZnNldFdpZHRoXCIgOiBcIm9mZnNldEhlaWdodFwiXTtcbn07XG5jb25zdCB3aW5kb3dTY3JvbGwgPSAob2Zmc2V0LCB7XG4gIGFkanVzdG1lbnRzID0gMCxcbiAgYmVoYXZpb3Jcbn0sIGluc3RhbmNlKSA9PiB7XG4gIHZhciBfYSwgX2I7XG4gIGNvbnN0IHRvT2Zmc2V0ID0gb2Zmc2V0ICsgYWRqdXN0bWVudHM7XG4gIChfYiA9IChfYSA9IGluc3RhbmNlLnNjcm9sbEVsZW1lbnQpID09IG51bGwgPyB2b2lkIDAgOiBfYS5zY3JvbGxUbykgPT0gbnVsbCA/IHZvaWQgMCA6IF9iLmNhbGwoX2EsIHtcbiAgICBbaW5zdGFuY2Uub3B0aW9ucy5ob3Jpem9udGFsID8gXCJsZWZ0XCIgOiBcInRvcFwiXTogdG9PZmZzZXQsXG4gICAgYmVoYXZpb3JcbiAgfSk7XG59O1xuY29uc3QgZWxlbWVudFNjcm9sbCA9IChvZmZzZXQsIHtcbiAgYWRqdXN0bWVudHMgPSAwLFxuICBiZWhhdmlvclxufSwgaW5zdGFuY2UpID0+IHtcbiAgdmFyIF9hLCBfYjtcbiAgY29uc3QgdG9PZmZzZXQgPSBvZmZzZXQgKyBhZGp1c3RtZW50cztcbiAgKF9iID0gKF9hID0gaW5zdGFuY2Uuc2Nyb2xsRWxlbWVudCkgPT0gbnVsbCA/IHZvaWQgMCA6IF9hLnNjcm9sbFRvKSA9PSBudWxsID8gdm9pZCAwIDogX2IuY2FsbChfYSwge1xuICAgIFtpbnN0YW5jZS5vcHRpb25zLmhvcml6b250YWwgPyBcImxlZnRcIiA6IFwidG9wXCJdOiB0b09mZnNldCxcbiAgICBiZWhhdmlvclxuICB9KTtcbn07XG5jbGFzcyBWaXJ0dWFsaXplciB7XG4gIGNvbnN0cnVjdG9yKG9wdHMpIHtcbiAgICB0aGlzLnVuc3VicyA9IFtdO1xuICAgIHRoaXMuc2Nyb2xsRWxlbWVudCA9IG51bGw7XG4gICAgdGhpcy50YXJnZXRXaW5kb3cgPSBudWxsO1xuICAgIHRoaXMuaXNTY3JvbGxpbmcgPSBmYWxzZTtcbiAgICB0aGlzLm1lYXN1cmVtZW50c0NhY2hlID0gW107XG4gICAgdGhpcy5pdGVtU2l6ZUNhY2hlID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICB0aGlzLnBlbmRpbmdNZWFzdXJlZENhY2hlSW5kZXhlcyA9IFtdO1xuICAgIHRoaXMuc2Nyb2xsUmVjdCA9IG51bGw7XG4gICAgdGhpcy5zY3JvbGxPZmZzZXQgPSBudWxsO1xuICAgIHRoaXMuc2Nyb2xsRGlyZWN0aW9uID0gbnVsbDtcbiAgICB0aGlzLnNjcm9sbEFkanVzdG1lbnRzID0gMDtcbiAgICB0aGlzLmVsZW1lbnRzQ2FjaGUgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgIHRoaXMub2JzZXJ2ZXIgPSAvKiBAX19QVVJFX18gKi8gKCgpID0+IHtcbiAgICAgIGxldCBfcm8gPSBudWxsO1xuICAgICAgY29uc3QgZ2V0ID0gKCkgPT4ge1xuICAgICAgICBpZiAoX3JvKSB7XG4gICAgICAgICAgcmV0dXJuIF9ybztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMudGFyZ2V0V2luZG93IHx8ICF0aGlzLnRhcmdldFdpbmRvdy5SZXNpemVPYnNlcnZlcikge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcm8gPSBuZXcgdGhpcy50YXJnZXRXaW5kb3cuUmVzaXplT2JzZXJ2ZXIoKGVudHJpZXMpID0+IHtcbiAgICAgICAgICBlbnRyaWVzLmZvckVhY2goKGVudHJ5KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBydW4gPSAoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuX21lYXN1cmVFbGVtZW50KGVudHJ5LnRhcmdldCwgZW50cnkpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy51c2VBbmltYXRpb25GcmFtZVdpdGhSZXNpemVPYnNlcnZlciA/IHJlcXVlc3RBbmltYXRpb25GcmFtZShydW4pIDogcnVuKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRpc2Nvbm5lY3Q6ICgpID0+IHtcbiAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgKF9hID0gZ2V0KCkpID09IG51bGwgPyB2b2lkIDAgOiBfYS5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgX3JvID0gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgICAgb2JzZXJ2ZTogKHRhcmdldCkgPT4ge1xuICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICByZXR1cm4gKF9hID0gZ2V0KCkpID09IG51bGwgPyB2b2lkIDAgOiBfYS5vYnNlcnZlKHRhcmdldCwgeyBib3g6IFwiYm9yZGVyLWJveFwiIH0pO1xuICAgICAgICB9LFxuICAgICAgICB1bm9ic2VydmU6ICh0YXJnZXQpID0+IHtcbiAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgcmV0dXJuIChfYSA9IGdldCgpKSA9PSBudWxsID8gdm9pZCAwIDogX2EudW5vYnNlcnZlKHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKTtcbiAgICB0aGlzLnJhbmdlID0gbnVsbDtcbiAgICB0aGlzLnNldE9wdGlvbnMgPSAob3B0czIpID0+IHtcbiAgICAgIE9iamVjdC5lbnRyaWVzKG9wdHMyKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJ1bmRlZmluZWRcIikgZGVsZXRlIG9wdHMyW2tleV07XG4gICAgICB9KTtcbiAgICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgICAgZGVidWc6IGZhbHNlLFxuICAgICAgICBpbml0aWFsT2Zmc2V0OiAwLFxuICAgICAgICBvdmVyc2NhbjogMSxcbiAgICAgICAgcGFkZGluZ1N0YXJ0OiAwLFxuICAgICAgICBwYWRkaW5nRW5kOiAwLFxuICAgICAgICBzY3JvbGxQYWRkaW5nU3RhcnQ6IDAsXG4gICAgICAgIHNjcm9sbFBhZGRpbmdFbmQ6IDAsXG4gICAgICAgIGhvcml6b250YWw6IGZhbHNlLFxuICAgICAgICBnZXRJdGVtS2V5OiBkZWZhdWx0S2V5RXh0cmFjdG9yLFxuICAgICAgICByYW5nZUV4dHJhY3RvcjogZGVmYXVsdFJhbmdlRXh0cmFjdG9yLFxuICAgICAgICBvbkNoYW5nZTogKCkgPT4ge1xuICAgICAgICB9LFxuICAgICAgICBtZWFzdXJlRWxlbWVudCxcbiAgICAgICAgaW5pdGlhbFJlY3Q6IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9LFxuICAgICAgICBzY3JvbGxNYXJnaW46IDAsXG4gICAgICAgIGdhcDogMCxcbiAgICAgICAgaW5kZXhBdHRyaWJ1dGU6IFwiZGF0YS1pbmRleFwiLFxuICAgICAgICBpbml0aWFsTWVhc3VyZW1lbnRzQ2FjaGU6IFtdLFxuICAgICAgICBsYW5lczogMSxcbiAgICAgICAgaXNTY3JvbGxpbmdSZXNldERlbGF5OiAxNTAsXG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIGlzUnRsOiBmYWxzZSxcbiAgICAgICAgdXNlU2Nyb2xsZW5kRXZlbnQ6IGZhbHNlLFxuICAgICAgICB1c2VBbmltYXRpb25GcmFtZVdpdGhSZXNpemVPYnNlcnZlcjogZmFsc2UsXG4gICAgICAgIC4uLm9wdHMyXG4gICAgICB9O1xuICAgIH07XG4gICAgdGhpcy5ub3RpZnkgPSAoc3luYykgPT4ge1xuICAgICAgdmFyIF9hLCBfYjtcbiAgICAgIChfYiA9IChfYSA9IHRoaXMub3B0aW9ucykub25DaGFuZ2UpID09IG51bGwgPyB2b2lkIDAgOiBfYi5jYWxsKF9hLCB0aGlzLCBzeW5jKTtcbiAgICB9O1xuICAgIHRoaXMubWF5YmVOb3RpZnkgPSBtZW1vKFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZVJhbmdlKCk7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgdGhpcy5pc1Njcm9sbGluZyxcbiAgICAgICAgICB0aGlzLnJhbmdlID8gdGhpcy5yYW5nZS5zdGFydEluZGV4IDogbnVsbCxcbiAgICAgICAgICB0aGlzLnJhbmdlID8gdGhpcy5yYW5nZS5lbmRJbmRleCA6IG51bGxcbiAgICAgICAgXTtcbiAgICAgIH0sXG4gICAgICAoaXNTY3JvbGxpbmcpID0+IHtcbiAgICAgICAgdGhpcy5ub3RpZnkoaXNTY3JvbGxpbmcpO1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIgJiYgXCJtYXliZU5vdGlmeVwiLFxuICAgICAgICBkZWJ1ZzogKCkgPT4gdGhpcy5vcHRpb25zLmRlYnVnLFxuICAgICAgICBpbml0aWFsRGVwczogW1xuICAgICAgICAgIHRoaXMuaXNTY3JvbGxpbmcsXG4gICAgICAgICAgdGhpcy5yYW5nZSA/IHRoaXMucmFuZ2Uuc3RhcnRJbmRleCA6IG51bGwsXG4gICAgICAgICAgdGhpcy5yYW5nZSA/IHRoaXMucmFuZ2UuZW5kSW5kZXggOiBudWxsXG4gICAgICAgIF1cbiAgICAgIH1cbiAgICApO1xuICAgIHRoaXMuY2xlYW51cCA9ICgpID0+IHtcbiAgICAgIHRoaXMudW5zdWJzLmZpbHRlcihCb29sZWFuKS5mb3JFYWNoKChkKSA9PiBkKCkpO1xuICAgICAgdGhpcy51bnN1YnMgPSBbXTtcbiAgICAgIHRoaXMub2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgdGhpcy5zY3JvbGxFbGVtZW50ID0gbnVsbDtcbiAgICAgIHRoaXMudGFyZ2V0V2luZG93ID0gbnVsbDtcbiAgICB9O1xuICAgIHRoaXMuX2RpZE1vdW50ID0gKCkgPT4ge1xuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgdGhpcy5jbGVhbnVwKCk7XG4gICAgICB9O1xuICAgIH07XG4gICAgdGhpcy5fd2lsbFVwZGF0ZSA9ICgpID0+IHtcbiAgICAgIHZhciBfYTtcbiAgICAgIGNvbnN0IHNjcm9sbEVsZW1lbnQgPSB0aGlzLm9wdGlvbnMuZW5hYmxlZCA/IHRoaXMub3B0aW9ucy5nZXRTY3JvbGxFbGVtZW50KCkgOiBudWxsO1xuICAgICAgaWYgKHRoaXMuc2Nyb2xsRWxlbWVudCAhPT0gc2Nyb2xsRWxlbWVudCkge1xuICAgICAgICB0aGlzLmNsZWFudXAoKTtcbiAgICAgICAgaWYgKCFzY3JvbGxFbGVtZW50KSB7XG4gICAgICAgICAgdGhpcy5tYXliZU5vdGlmeSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNjcm9sbEVsZW1lbnQgPSBzY3JvbGxFbGVtZW50O1xuICAgICAgICBpZiAodGhpcy5zY3JvbGxFbGVtZW50ICYmIFwib3duZXJEb2N1bWVudFwiIGluIHRoaXMuc2Nyb2xsRWxlbWVudCkge1xuICAgICAgICAgIHRoaXMudGFyZ2V0V2luZG93ID0gdGhpcy5zY3JvbGxFbGVtZW50Lm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy50YXJnZXRXaW5kb3cgPSAoKF9hID0gdGhpcy5zY3JvbGxFbGVtZW50KSA9PSBudWxsID8gdm9pZCAwIDogX2Eud2luZG93KSA/PyBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZWxlbWVudHNDYWNoZS5mb3JFYWNoKChjYWNoZWQpID0+IHtcbiAgICAgICAgICB0aGlzLm9ic2VydmVyLm9ic2VydmUoY2FjaGVkKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3Njcm9sbFRvT2Zmc2V0KHRoaXMuZ2V0U2Nyb2xsT2Zmc2V0KCksIHtcbiAgICAgICAgICBhZGp1c3RtZW50czogdm9pZCAwLFxuICAgICAgICAgIGJlaGF2aW9yOiB2b2lkIDBcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudW5zdWJzLnB1c2goXG4gICAgICAgICAgdGhpcy5vcHRpb25zLm9ic2VydmVFbGVtZW50UmVjdCh0aGlzLCAocmVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxSZWN0ID0gcmVjdDtcbiAgICAgICAgICAgIHRoaXMubWF5YmVOb3RpZnkoKTtcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgICB0aGlzLnVuc3Vicy5wdXNoKFxuICAgICAgICAgIHRoaXMub3B0aW9ucy5vYnNlcnZlRWxlbWVudE9mZnNldCh0aGlzLCAob2Zmc2V0LCBpc1Njcm9sbGluZykgPT4ge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxBZGp1c3RtZW50cyA9IDA7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbERpcmVjdGlvbiA9IGlzU2Nyb2xsaW5nID8gdGhpcy5nZXRTY3JvbGxPZmZzZXQoKSA8IG9mZnNldCA/IFwiZm9yd2FyZFwiIDogXCJiYWNrd2FyZFwiIDogbnVsbDtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsT2Zmc2V0ID0gb2Zmc2V0O1xuICAgICAgICAgICAgdGhpcy5pc1Njcm9sbGluZyA9IGlzU2Nyb2xsaW5nO1xuICAgICAgICAgICAgdGhpcy5tYXliZU5vdGlmeSgpO1xuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLmdldFNpemUgPSAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5lbmFibGVkKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsUmVjdCA9IG51bGw7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgICAgdGhpcy5zY3JvbGxSZWN0ID0gdGhpcy5zY3JvbGxSZWN0ID8/IHRoaXMub3B0aW9ucy5pbml0aWFsUmVjdDtcbiAgICAgIHJldHVybiB0aGlzLnNjcm9sbFJlY3RbdGhpcy5vcHRpb25zLmhvcml6b250YWwgPyBcIndpZHRoXCIgOiBcImhlaWdodFwiXTtcbiAgICB9O1xuICAgIHRoaXMuZ2V0U2Nyb2xsT2Zmc2V0ID0gKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZW5hYmxlZCkge1xuICAgICAgICB0aGlzLnNjcm9sbE9mZnNldCA9IG51bGw7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgICAgdGhpcy5zY3JvbGxPZmZzZXQgPSB0aGlzLnNjcm9sbE9mZnNldCA/PyAodHlwZW9mIHRoaXMub3B0aW9ucy5pbml0aWFsT2Zmc2V0ID09PSBcImZ1bmN0aW9uXCIgPyB0aGlzLm9wdGlvbnMuaW5pdGlhbE9mZnNldCgpIDogdGhpcy5vcHRpb25zLmluaXRpYWxPZmZzZXQpO1xuICAgICAgcmV0dXJuIHRoaXMuc2Nyb2xsT2Zmc2V0O1xuICAgIH07XG4gICAgdGhpcy5nZXRGdXJ0aGVzdE1lYXN1cmVtZW50ID0gKG1lYXN1cmVtZW50cywgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IGZ1cnRoZXN0TWVhc3VyZW1lbnRzRm91bmQgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgICAgY29uc3QgZnVydGhlc3RNZWFzdXJlbWVudHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgICAgZm9yIChsZXQgbSA9IGluZGV4IC0gMTsgbSA+PSAwOyBtLS0pIHtcbiAgICAgICAgY29uc3QgbWVhc3VyZW1lbnQgPSBtZWFzdXJlbWVudHNbbV07XG4gICAgICAgIGlmIChmdXJ0aGVzdE1lYXN1cmVtZW50c0ZvdW5kLmhhcyhtZWFzdXJlbWVudC5sYW5lKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByZXZpb3VzRnVydGhlc3RNZWFzdXJlbWVudCA9IGZ1cnRoZXN0TWVhc3VyZW1lbnRzLmdldChcbiAgICAgICAgICBtZWFzdXJlbWVudC5sYW5lXG4gICAgICAgICk7XG4gICAgICAgIGlmIChwcmV2aW91c0Z1cnRoZXN0TWVhc3VyZW1lbnQgPT0gbnVsbCB8fCBtZWFzdXJlbWVudC5lbmQgPiBwcmV2aW91c0Z1cnRoZXN0TWVhc3VyZW1lbnQuZW5kKSB7XG4gICAgICAgICAgZnVydGhlc3RNZWFzdXJlbWVudHMuc2V0KG1lYXN1cmVtZW50LmxhbmUsIG1lYXN1cmVtZW50KTtcbiAgICAgICAgfSBlbHNlIGlmIChtZWFzdXJlbWVudC5lbmQgPCBwcmV2aW91c0Z1cnRoZXN0TWVhc3VyZW1lbnQuZW5kKSB7XG4gICAgICAgICAgZnVydGhlc3RNZWFzdXJlbWVudHNGb3VuZC5zZXQobWVhc3VyZW1lbnQubGFuZSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZ1cnRoZXN0TWVhc3VyZW1lbnRzRm91bmQuc2l6ZSA9PT0gdGhpcy5vcHRpb25zLmxhbmVzKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmdXJ0aGVzdE1lYXN1cmVtZW50cy5zaXplID09PSB0aGlzLm9wdGlvbnMubGFuZXMgPyBBcnJheS5mcm9tKGZ1cnRoZXN0TWVhc3VyZW1lbnRzLnZhbHVlcygpKS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIGlmIChhLmVuZCA9PT0gYi5lbmQpIHtcbiAgICAgICAgICByZXR1cm4gYS5pbmRleCAtIGIuaW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGEuZW5kIC0gYi5lbmQ7XG4gICAgICB9KVswXSA6IHZvaWQgMDtcbiAgICB9O1xuICAgIHRoaXMuZ2V0TWVhc3VyZW1lbnRPcHRpb25zID0gbWVtbyhcbiAgICAgICgpID0+IFtcbiAgICAgICAgdGhpcy5vcHRpb25zLmNvdW50LFxuICAgICAgICB0aGlzLm9wdGlvbnMucGFkZGluZ1N0YXJ0LFxuICAgICAgICB0aGlzLm9wdGlvbnMuc2Nyb2xsTWFyZ2luLFxuICAgICAgICB0aGlzLm9wdGlvbnMuZ2V0SXRlbUtleSxcbiAgICAgICAgdGhpcy5vcHRpb25zLmVuYWJsZWRcbiAgICAgIF0sXG4gICAgICAoY291bnQsIHBhZGRpbmdTdGFydCwgc2Nyb2xsTWFyZ2luLCBnZXRJdGVtS2V5LCBlbmFibGVkKSA9PiB7XG4gICAgICAgIHRoaXMucGVuZGluZ01lYXN1cmVkQ2FjaGVJbmRleGVzID0gW107XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY291bnQsXG4gICAgICAgICAgcGFkZGluZ1N0YXJ0LFxuICAgICAgICAgIHNjcm9sbE1hcmdpbixcbiAgICAgICAgICBnZXRJdGVtS2V5LFxuICAgICAgICAgIGVuYWJsZWRcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogZmFsc2VcbiAgICAgIH1cbiAgICApO1xuICAgIHRoaXMuZ2V0TWVhc3VyZW1lbnRzID0gbWVtbyhcbiAgICAgICgpID0+IFt0aGlzLmdldE1lYXN1cmVtZW50T3B0aW9ucygpLCB0aGlzLml0ZW1TaXplQ2FjaGVdLFxuICAgICAgKHsgY291bnQsIHBhZGRpbmdTdGFydCwgc2Nyb2xsTWFyZ2luLCBnZXRJdGVtS2V5LCBlbmFibGVkIH0sIGl0ZW1TaXplQ2FjaGUpID0+IHtcbiAgICAgICAgaWYgKCFlbmFibGVkKSB7XG4gICAgICAgICAgdGhpcy5tZWFzdXJlbWVudHNDYWNoZSA9IFtdO1xuICAgICAgICAgIHRoaXMuaXRlbVNpemVDYWNoZS5jbGVhcigpO1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5tZWFzdXJlbWVudHNDYWNoZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLm1lYXN1cmVtZW50c0NhY2hlID0gdGhpcy5vcHRpb25zLmluaXRpYWxNZWFzdXJlbWVudHNDYWNoZTtcbiAgICAgICAgICB0aGlzLm1lYXN1cmVtZW50c0NhY2hlLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgIHRoaXMuaXRlbVNpemVDYWNoZS5zZXQoaXRlbS5rZXksIGl0ZW0uc2l6ZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWluID0gdGhpcy5wZW5kaW5nTWVhc3VyZWRDYWNoZUluZGV4ZXMubGVuZ3RoID4gMCA/IE1hdGgubWluKC4uLnRoaXMucGVuZGluZ01lYXN1cmVkQ2FjaGVJbmRleGVzKSA6IDA7XG4gICAgICAgIHRoaXMucGVuZGluZ01lYXN1cmVkQ2FjaGVJbmRleGVzID0gW107XG4gICAgICAgIGNvbnN0IG1lYXN1cmVtZW50cyA9IHRoaXMubWVhc3VyZW1lbnRzQ2FjaGUuc2xpY2UoMCwgbWluKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IG1pbjsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICBjb25zdCBrZXkgPSBnZXRJdGVtS2V5KGkpO1xuICAgICAgICAgIGNvbnN0IGZ1cnRoZXN0TWVhc3VyZW1lbnQgPSB0aGlzLm9wdGlvbnMubGFuZXMgPT09IDEgPyBtZWFzdXJlbWVudHNbaSAtIDFdIDogdGhpcy5nZXRGdXJ0aGVzdE1lYXN1cmVtZW50KG1lYXN1cmVtZW50cywgaSk7XG4gICAgICAgICAgY29uc3Qgc3RhcnQgPSBmdXJ0aGVzdE1lYXN1cmVtZW50ID8gZnVydGhlc3RNZWFzdXJlbWVudC5lbmQgKyB0aGlzLm9wdGlvbnMuZ2FwIDogcGFkZGluZ1N0YXJ0ICsgc2Nyb2xsTWFyZ2luO1xuICAgICAgICAgIGNvbnN0IG1lYXN1cmVkU2l6ZSA9IGl0ZW1TaXplQ2FjaGUuZ2V0KGtleSk7XG4gICAgICAgICAgY29uc3Qgc2l6ZSA9IHR5cGVvZiBtZWFzdXJlZFNpemUgPT09IFwibnVtYmVyXCIgPyBtZWFzdXJlZFNpemUgOiB0aGlzLm9wdGlvbnMuZXN0aW1hdGVTaXplKGkpO1xuICAgICAgICAgIGNvbnN0IGVuZCA9IHN0YXJ0ICsgc2l6ZTtcbiAgICAgICAgICBjb25zdCBsYW5lID0gZnVydGhlc3RNZWFzdXJlbWVudCA/IGZ1cnRoZXN0TWVhc3VyZW1lbnQubGFuZSA6IGkgJSB0aGlzLm9wdGlvbnMubGFuZXM7XG4gICAgICAgICAgbWVhc3VyZW1lbnRzW2ldID0ge1xuICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICBzdGFydCxcbiAgICAgICAgICAgIHNpemUsXG4gICAgICAgICAgICBlbmQsXG4gICAgICAgICAgICBrZXksXG4gICAgICAgICAgICBsYW5lXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1lYXN1cmVtZW50c0NhY2hlID0gbWVhc3VyZW1lbnRzO1xuICAgICAgICByZXR1cm4gbWVhc3VyZW1lbnRzO1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIgJiYgXCJnZXRNZWFzdXJlbWVudHNcIixcbiAgICAgICAgZGVidWc6ICgpID0+IHRoaXMub3B0aW9ucy5kZWJ1Z1xuICAgICAgfVxuICAgICk7XG4gICAgdGhpcy5jYWxjdWxhdGVSYW5nZSA9IG1lbW8oXG4gICAgICAoKSA9PiBbXG4gICAgICAgIHRoaXMuZ2V0TWVhc3VyZW1lbnRzKCksXG4gICAgICAgIHRoaXMuZ2V0U2l6ZSgpLFxuICAgICAgICB0aGlzLmdldFNjcm9sbE9mZnNldCgpLFxuICAgICAgICB0aGlzLm9wdGlvbnMubGFuZXNcbiAgICAgIF0sXG4gICAgICAobWVhc3VyZW1lbnRzLCBvdXRlclNpemUsIHNjcm9sbE9mZnNldCwgbGFuZXMpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZ2UgPSBtZWFzdXJlbWVudHMubGVuZ3RoID4gMCAmJiBvdXRlclNpemUgPiAwID8gY2FsY3VsYXRlUmFuZ2Uoe1xuICAgICAgICAgIG1lYXN1cmVtZW50cyxcbiAgICAgICAgICBvdXRlclNpemUsXG4gICAgICAgICAgc2Nyb2xsT2Zmc2V0LFxuICAgICAgICAgIGxhbmVzXG4gICAgICAgIH0pIDogbnVsbDtcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGtleTogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiICYmIFwiY2FsY3VsYXRlUmFuZ2VcIixcbiAgICAgICAgZGVidWc6ICgpID0+IHRoaXMub3B0aW9ucy5kZWJ1Z1xuICAgICAgfVxuICAgICk7XG4gICAgdGhpcy5nZXRWaXJ0dWFsSW5kZXhlcyA9IG1lbW8oXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGxldCBzdGFydEluZGV4ID0gbnVsbDtcbiAgICAgICAgbGV0IGVuZEluZGV4ID0gbnVsbDtcbiAgICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLmNhbGN1bGF0ZVJhbmdlKCk7XG4gICAgICAgIGlmIChyYW5nZSkge1xuICAgICAgICAgIHN0YXJ0SW5kZXggPSByYW5nZS5zdGFydEluZGV4O1xuICAgICAgICAgIGVuZEluZGV4ID0gcmFuZ2UuZW5kSW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tYXliZU5vdGlmeS51cGRhdGVEZXBzKFt0aGlzLmlzU2Nyb2xsaW5nLCBzdGFydEluZGV4LCBlbmRJbmRleF0pO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgIHRoaXMub3B0aW9ucy5yYW5nZUV4dHJhY3RvcixcbiAgICAgICAgICB0aGlzLm9wdGlvbnMub3ZlcnNjYW4sXG4gICAgICAgICAgdGhpcy5vcHRpb25zLmNvdW50LFxuICAgICAgICAgIHN0YXJ0SW5kZXgsXG4gICAgICAgICAgZW5kSW5kZXhcbiAgICAgICAgXTtcbiAgICAgIH0sXG4gICAgICAocmFuZ2VFeHRyYWN0b3IsIG92ZXJzY2FuLCBjb3VudCwgc3RhcnRJbmRleCwgZW5kSW5kZXgpID0+IHtcbiAgICAgICAgcmV0dXJuIHN0YXJ0SW5kZXggPT09IG51bGwgfHwgZW5kSW5kZXggPT09IG51bGwgPyBbXSA6IHJhbmdlRXh0cmFjdG9yKHtcbiAgICAgICAgICBzdGFydEluZGV4LFxuICAgICAgICAgIGVuZEluZGV4LFxuICAgICAgICAgIG92ZXJzY2FuLFxuICAgICAgICAgIGNvdW50XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAga2V5OiBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIgJiYgXCJnZXRWaXJ0dWFsSW5kZXhlc1wiLFxuICAgICAgICBkZWJ1ZzogKCkgPT4gdGhpcy5vcHRpb25zLmRlYnVnXG4gICAgICB9XG4gICAgKTtcbiAgICB0aGlzLmluZGV4RnJvbUVsZW1lbnQgPSAobm9kZSkgPT4ge1xuICAgICAgY29uc3QgYXR0cmlidXRlTmFtZSA9IHRoaXMub3B0aW9ucy5pbmRleEF0dHJpYnV0ZTtcbiAgICAgIGNvbnN0IGluZGV4U3RyID0gbm9kZS5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSk7XG4gICAgICBpZiAoIWluZGV4U3RyKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBgTWlzc2luZyBhdHRyaWJ1dGUgbmFtZSAnJHthdHRyaWJ1dGVOYW1lfT17aW5kZXh9JyBvbiBtZWFzdXJlZCBlbGVtZW50LmBcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhcnNlSW50KGluZGV4U3RyLCAxMCk7XG4gICAgfTtcbiAgICB0aGlzLl9tZWFzdXJlRWxlbWVudCA9IChub2RlLCBlbnRyeSkgPT4ge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmluZGV4RnJvbUVsZW1lbnQobm9kZSk7XG4gICAgICBjb25zdCBpdGVtID0gdGhpcy5tZWFzdXJlbWVudHNDYWNoZVtpbmRleF07XG4gICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3Qga2V5ID0gaXRlbS5rZXk7XG4gICAgICBjb25zdCBwcmV2Tm9kZSA9IHRoaXMuZWxlbWVudHNDYWNoZS5nZXQoa2V5KTtcbiAgICAgIGlmIChwcmV2Tm9kZSAhPT0gbm9kZSkge1xuICAgICAgICBpZiAocHJldk5vZGUpIHtcbiAgICAgICAgICB0aGlzLm9ic2VydmVyLnVub2JzZXJ2ZShwcmV2Tm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vYnNlcnZlci5vYnNlcnZlKG5vZGUpO1xuICAgICAgICB0aGlzLmVsZW1lbnRzQ2FjaGUuc2V0KGtleSwgbm9kZSk7XG4gICAgICB9XG4gICAgICBpZiAobm9kZS5pc0Nvbm5lY3RlZCkge1xuICAgICAgICB0aGlzLnJlc2l6ZUl0ZW0oaW5kZXgsIHRoaXMub3B0aW9ucy5tZWFzdXJlRWxlbWVudChub2RlLCBlbnRyeSwgdGhpcykpO1xuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5yZXNpemVJdGVtID0gKGluZGV4LCBzaXplKSA9PiB7XG4gICAgICBjb25zdCBpdGVtID0gdGhpcy5tZWFzdXJlbWVudHNDYWNoZVtpbmRleF07XG4gICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgaXRlbVNpemUgPSB0aGlzLml0ZW1TaXplQ2FjaGUuZ2V0KGl0ZW0ua2V5KSA/PyBpdGVtLnNpemU7XG4gICAgICBjb25zdCBkZWx0YSA9IHNpemUgLSBpdGVtU2l6ZTtcbiAgICAgIGlmIChkZWx0YSAhPT0gMCkge1xuICAgICAgICBpZiAodGhpcy5zaG91bGRBZGp1c3RTY3JvbGxQb3NpdGlvbk9uSXRlbVNpemVDaGFuZ2UgIT09IHZvaWQgMCA/IHRoaXMuc2hvdWxkQWRqdXN0U2Nyb2xsUG9zaXRpb25Pbkl0ZW1TaXplQ2hhbmdlKGl0ZW0sIGRlbHRhLCB0aGlzKSA6IGl0ZW0uc3RhcnQgPCB0aGlzLmdldFNjcm9sbE9mZnNldCgpICsgdGhpcy5zY3JvbGxBZGp1c3RtZW50cykge1xuICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIgJiYgdGhpcy5vcHRpb25zLmRlYnVnKSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oXCJjb3JyZWN0aW9uXCIsIGRlbHRhKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fc2Nyb2xsVG9PZmZzZXQodGhpcy5nZXRTY3JvbGxPZmZzZXQoKSwge1xuICAgICAgICAgICAgYWRqdXN0bWVudHM6IHRoaXMuc2Nyb2xsQWRqdXN0bWVudHMgKz0gZGVsdGEsXG4gICAgICAgICAgICBiZWhhdmlvcjogdm9pZCAwXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wZW5kaW5nTWVhc3VyZWRDYWNoZUluZGV4ZXMucHVzaChpdGVtLmluZGV4KTtcbiAgICAgICAgdGhpcy5pdGVtU2l6ZUNhY2hlID0gbmV3IE1hcCh0aGlzLml0ZW1TaXplQ2FjaGUuc2V0KGl0ZW0ua2V5LCBzaXplKSk7XG4gICAgICAgIHRoaXMubm90aWZ5KGZhbHNlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMubWVhc3VyZUVsZW1lbnQgPSAobm9kZSkgPT4ge1xuICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNDYWNoZS5mb3JFYWNoKChjYWNoZWQsIGtleSkgPT4ge1xuICAgICAgICAgIGlmICghY2FjaGVkLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVyLnVub2JzZXJ2ZShjYWNoZWQpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50c0NhY2hlLmRlbGV0ZShrZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX21lYXN1cmVFbGVtZW50KG5vZGUsIHZvaWQgMCk7XG4gICAgfTtcbiAgICB0aGlzLmdldFZpcnR1YWxJdGVtcyA9IG1lbW8oXG4gICAgICAoKSA9PiBbdGhpcy5nZXRWaXJ0dWFsSW5kZXhlcygpLCB0aGlzLmdldE1lYXN1cmVtZW50cygpXSxcbiAgICAgIChpbmRleGVzLCBtZWFzdXJlbWVudHMpID0+IHtcbiAgICAgICAgY29uc3QgdmlydHVhbEl0ZW1zID0gW107XG4gICAgICAgIGZvciAobGV0IGsgPSAwLCBsZW4gPSBpbmRleGVzLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICAgICAgY29uc3QgaSA9IGluZGV4ZXNba107XG4gICAgICAgICAgY29uc3QgbWVhc3VyZW1lbnQgPSBtZWFzdXJlbWVudHNbaV07XG4gICAgICAgICAgdmlydHVhbEl0ZW1zLnB1c2gobWVhc3VyZW1lbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2aXJ0dWFsSXRlbXM7XG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBrZXk6IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIiAmJiBcImdldFZpcnR1YWxJdGVtc1wiLFxuICAgICAgICBkZWJ1ZzogKCkgPT4gdGhpcy5vcHRpb25zLmRlYnVnXG4gICAgICB9XG4gICAgKTtcbiAgICB0aGlzLmdldFZpcnR1YWxJdGVtRm9yT2Zmc2V0ID0gKG9mZnNldCkgPT4ge1xuICAgICAgY29uc3QgbWVhc3VyZW1lbnRzID0gdGhpcy5nZXRNZWFzdXJlbWVudHMoKTtcbiAgICAgIGlmIChtZWFzdXJlbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG4gICAgICByZXR1cm4gbm90VW5kZWZpbmVkKFxuICAgICAgICBtZWFzdXJlbWVudHNbZmluZE5lYXJlc3RCaW5hcnlTZWFyY2goXG4gICAgICAgICAgMCxcbiAgICAgICAgICBtZWFzdXJlbWVudHMubGVuZ3RoIC0gMSxcbiAgICAgICAgICAoaW5kZXgpID0+IG5vdFVuZGVmaW5lZChtZWFzdXJlbWVudHNbaW5kZXhdKS5zdGFydCxcbiAgICAgICAgICBvZmZzZXRcbiAgICAgICAgKV1cbiAgICAgICk7XG4gICAgfTtcbiAgICB0aGlzLmdldE9mZnNldEZvckFsaWdubWVudCA9ICh0b09mZnNldCwgYWxpZ24sIGl0ZW1TaXplID0gMCkgPT4ge1xuICAgICAgY29uc3Qgc2l6ZSA9IHRoaXMuZ2V0U2l6ZSgpO1xuICAgICAgY29uc3Qgc2Nyb2xsT2Zmc2V0ID0gdGhpcy5nZXRTY3JvbGxPZmZzZXQoKTtcbiAgICAgIGlmIChhbGlnbiA9PT0gXCJhdXRvXCIpIHtcbiAgICAgICAgYWxpZ24gPSB0b09mZnNldCA+PSBzY3JvbGxPZmZzZXQgKyBzaXplID8gXCJlbmRcIiA6IFwic3RhcnRcIjtcbiAgICAgIH1cbiAgICAgIGlmIChhbGlnbiA9PT0gXCJjZW50ZXJcIikge1xuICAgICAgICB0b09mZnNldCArPSAoaXRlbVNpemUgLSBzaXplKSAvIDI7XG4gICAgICB9IGVsc2UgaWYgKGFsaWduID09PSBcImVuZFwiKSB7XG4gICAgICAgIHRvT2Zmc2V0IC09IHNpemU7XG4gICAgICB9XG4gICAgICBjb25zdCBtYXhPZmZzZXQgPSB0aGlzLmdldFRvdGFsU2l6ZSgpICsgdGhpcy5vcHRpb25zLnNjcm9sbE1hcmdpbiAtIHNpemU7XG4gICAgICByZXR1cm4gTWF0aC5tYXgoTWF0aC5taW4obWF4T2Zmc2V0LCB0b09mZnNldCksIDApO1xuICAgIH07XG4gICAgdGhpcy5nZXRPZmZzZXRGb3JJbmRleCA9IChpbmRleCwgYWxpZ24gPSBcImF1dG9cIikgPT4ge1xuICAgICAgaW5kZXggPSBNYXRoLm1heCgwLCBNYXRoLm1pbihpbmRleCwgdGhpcy5vcHRpb25zLmNvdW50IC0gMSkpO1xuICAgICAgY29uc3QgaXRlbSA9IHRoaXMubWVhc3VyZW1lbnRzQ2FjaGVbaW5kZXhdO1xuICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG4gICAgICBjb25zdCBzaXplID0gdGhpcy5nZXRTaXplKCk7XG4gICAgICBjb25zdCBzY3JvbGxPZmZzZXQgPSB0aGlzLmdldFNjcm9sbE9mZnNldCgpO1xuICAgICAgaWYgKGFsaWduID09PSBcImF1dG9cIikge1xuICAgICAgICBpZiAoaXRlbS5lbmQgPj0gc2Nyb2xsT2Zmc2V0ICsgc2l6ZSAtIHRoaXMub3B0aW9ucy5zY3JvbGxQYWRkaW5nRW5kKSB7XG4gICAgICAgICAgYWxpZ24gPSBcImVuZFwiO1xuICAgICAgICB9IGVsc2UgaWYgKGl0ZW0uc3RhcnQgPD0gc2Nyb2xsT2Zmc2V0ICsgdGhpcy5vcHRpb25zLnNjcm9sbFBhZGRpbmdTdGFydCkge1xuICAgICAgICAgIGFsaWduID0gXCJzdGFydFwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBbc2Nyb2xsT2Zmc2V0LCBhbGlnbl07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IHRvT2Zmc2V0ID0gYWxpZ24gPT09IFwiZW5kXCIgPyBpdGVtLmVuZCArIHRoaXMub3B0aW9ucy5zY3JvbGxQYWRkaW5nRW5kIDogaXRlbS5zdGFydCAtIHRoaXMub3B0aW9ucy5zY3JvbGxQYWRkaW5nU3RhcnQ7XG4gICAgICByZXR1cm4gW1xuICAgICAgICB0aGlzLmdldE9mZnNldEZvckFsaWdubWVudCh0b09mZnNldCwgYWxpZ24sIGl0ZW0uc2l6ZSksXG4gICAgICAgIGFsaWduXG4gICAgICBdO1xuICAgIH07XG4gICAgdGhpcy5pc0R5bmFtaWNNb2RlID0gKCkgPT4gdGhpcy5lbGVtZW50c0NhY2hlLnNpemUgPiAwO1xuICAgIHRoaXMuc2Nyb2xsVG9PZmZzZXQgPSAodG9PZmZzZXQsIHsgYWxpZ24gPSBcInN0YXJ0XCIsIGJlaGF2aW9yIH0gPSB7fSkgPT4ge1xuICAgICAgaWYgKGJlaGF2aW9yID09PSBcInNtb290aFwiICYmIHRoaXMuaXNEeW5hbWljTW9kZSgpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBcIlRoZSBgc21vb3RoYCBzY3JvbGwgYmVoYXZpb3IgaXMgbm90IGZ1bGx5IHN1cHBvcnRlZCB3aXRoIGR5bmFtaWMgc2l6ZS5cIlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdGhpcy5fc2Nyb2xsVG9PZmZzZXQodGhpcy5nZXRPZmZzZXRGb3JBbGlnbm1lbnQodG9PZmZzZXQsIGFsaWduKSwge1xuICAgICAgICBhZGp1c3RtZW50czogdm9pZCAwLFxuICAgICAgICBiZWhhdmlvclxuICAgICAgfSk7XG4gICAgfTtcbiAgICB0aGlzLnNjcm9sbFRvSW5kZXggPSAoaW5kZXgsIHsgYWxpZ246IGluaXRpYWxBbGlnbiA9IFwiYXV0b1wiLCBiZWhhdmlvciB9ID0ge30pID0+IHtcbiAgICAgIGlmIChiZWhhdmlvciA9PT0gXCJzbW9vdGhcIiAmJiB0aGlzLmlzRHluYW1pY01vZGUoKSkge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgXCJUaGUgYHNtb290aGAgc2Nyb2xsIGJlaGF2aW9yIGlzIG5vdCBmdWxseSBzdXBwb3J0ZWQgd2l0aCBkeW5hbWljIHNpemUuXCJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGluZGV4ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oaW5kZXgsIHRoaXMub3B0aW9ucy5jb3VudCAtIDEpKTtcbiAgICAgIGxldCBhdHRlbXB0cyA9IDA7XG4gICAgICBjb25zdCBtYXhBdHRlbXB0cyA9IDEwO1xuICAgICAgY29uc3QgdHJ5U2Nyb2xsID0gKGN1cnJlbnRBbGlnbikgPT4ge1xuICAgICAgICBpZiAoIXRoaXMudGFyZ2V0V2luZG93KSByZXR1cm47XG4gICAgICAgIGNvbnN0IG9mZnNldEluZm8gPSB0aGlzLmdldE9mZnNldEZvckluZGV4KGluZGV4LCBjdXJyZW50QWxpZ24pO1xuICAgICAgICBpZiAoIW9mZnNldEluZm8pIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJGYWlsZWQgdG8gZ2V0IG9mZnNldCBmb3IgaW5kZXg6XCIsIGluZGV4KTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgW29mZnNldCwgYWxpZ25dID0gb2Zmc2V0SW5mbztcbiAgICAgICAgdGhpcy5fc2Nyb2xsVG9PZmZzZXQob2Zmc2V0LCB7IGFkanVzdG1lbnRzOiB2b2lkIDAsIGJlaGF2aW9yIH0pO1xuICAgICAgICB0aGlzLnRhcmdldFdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGN1cnJlbnRPZmZzZXQgPSB0aGlzLmdldFNjcm9sbE9mZnNldCgpO1xuICAgICAgICAgIGNvbnN0IGFmdGVySW5mbyA9IHRoaXMuZ2V0T2Zmc2V0Rm9ySW5kZXgoaW5kZXgsIGFsaWduKTtcbiAgICAgICAgICBpZiAoIWFmdGVySW5mbykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiRmFpbGVkIHRvIGdldCBvZmZzZXQgZm9yIGluZGV4OlwiLCBpbmRleCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghYXBwcm94RXF1YWwoYWZ0ZXJJbmZvWzBdLCBjdXJyZW50T2Zmc2V0KSkge1xuICAgICAgICAgICAgc2NoZWR1bGVSZXRyeShhbGlnbik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgICBjb25zdCBzY2hlZHVsZVJldHJ5ID0gKGFsaWduKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy50YXJnZXRXaW5kb3cpIHJldHVybjtcbiAgICAgICAgYXR0ZW1wdHMrKztcbiAgICAgICAgaWYgKGF0dGVtcHRzIDwgbWF4QXR0ZW1wdHMpIHtcbiAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiICYmIHRoaXMub3B0aW9ucy5kZWJ1Zykge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiU2NoZWR1bGUgcmV0cnlcIiwgYXR0ZW1wdHMsIG1heEF0dGVtcHRzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy50YXJnZXRXaW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRyeVNjcm9sbChhbGlnbikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgIGBGYWlsZWQgdG8gc2Nyb2xsIHRvIGluZGV4ICR7aW5kZXh9IGFmdGVyICR7bWF4QXR0ZW1wdHN9IGF0dGVtcHRzLmBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgdHJ5U2Nyb2xsKGluaXRpYWxBbGlnbik7XG4gICAgfTtcbiAgICB0aGlzLnNjcm9sbEJ5ID0gKGRlbHRhLCB7IGJlaGF2aW9yIH0gPSB7fSkgPT4ge1xuICAgICAgaWYgKGJlaGF2aW9yID09PSBcInNtb290aFwiICYmIHRoaXMuaXNEeW5hbWljTW9kZSgpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBcIlRoZSBgc21vb3RoYCBzY3JvbGwgYmVoYXZpb3IgaXMgbm90IGZ1bGx5IHN1cHBvcnRlZCB3aXRoIGR5bmFtaWMgc2l6ZS5cIlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdGhpcy5fc2Nyb2xsVG9PZmZzZXQodGhpcy5nZXRTY3JvbGxPZmZzZXQoKSArIGRlbHRhLCB7XG4gICAgICAgIGFkanVzdG1lbnRzOiB2b2lkIDAsXG4gICAgICAgIGJlaGF2aW9yXG4gICAgICB9KTtcbiAgICB9O1xuICAgIHRoaXMuZ2V0VG90YWxTaXplID0gKCkgPT4ge1xuICAgICAgdmFyIF9hO1xuICAgICAgY29uc3QgbWVhc3VyZW1lbnRzID0gdGhpcy5nZXRNZWFzdXJlbWVudHMoKTtcbiAgICAgIGxldCBlbmQ7XG4gICAgICBpZiAobWVhc3VyZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBlbmQgPSB0aGlzLm9wdGlvbnMucGFkZGluZ1N0YXJ0O1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMubGFuZXMgPT09IDEpIHtcbiAgICAgICAgZW5kID0gKChfYSA9IG1lYXN1cmVtZW50c1ttZWFzdXJlbWVudHMubGVuZ3RoIC0gMV0pID09IG51bGwgPyB2b2lkIDAgOiBfYS5lbmQpID8/IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBlbmRCeUxhbmUgPSBBcnJheSh0aGlzLm9wdGlvbnMubGFuZXMpLmZpbGwobnVsbCk7XG4gICAgICAgIGxldCBlbmRJbmRleCA9IG1lYXN1cmVtZW50cy5sZW5ndGggLSAxO1xuICAgICAgICB3aGlsZSAoZW5kSW5kZXggPj0gMCAmJiBlbmRCeUxhbmUuc29tZSgodmFsKSA9PiB2YWwgPT09IG51bGwpKSB7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IG1lYXN1cmVtZW50c1tlbmRJbmRleF07XG4gICAgICAgICAgaWYgKGVuZEJ5TGFuZVtpdGVtLmxhbmVdID09PSBudWxsKSB7XG4gICAgICAgICAgICBlbmRCeUxhbmVbaXRlbS5sYW5lXSA9IGl0ZW0uZW5kO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbmRJbmRleC0tO1xuICAgICAgICB9XG4gICAgICAgIGVuZCA9IE1hdGgubWF4KC4uLmVuZEJ5TGFuZS5maWx0ZXIoKHZhbCkgPT4gdmFsICE9PSBudWxsKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gTWF0aC5tYXgoXG4gICAgICAgIGVuZCAtIHRoaXMub3B0aW9ucy5zY3JvbGxNYXJnaW4gKyB0aGlzLm9wdGlvbnMucGFkZGluZ0VuZCxcbiAgICAgICAgMFxuICAgICAgKTtcbiAgICB9O1xuICAgIHRoaXMuX3Njcm9sbFRvT2Zmc2V0ID0gKG9mZnNldCwge1xuICAgICAgYWRqdXN0bWVudHMsXG4gICAgICBiZWhhdmlvclxuICAgIH0pID0+IHtcbiAgICAgIHRoaXMub3B0aW9ucy5zY3JvbGxUb0ZuKG9mZnNldCwgeyBiZWhhdmlvciwgYWRqdXN0bWVudHMgfSwgdGhpcyk7XG4gICAgfTtcbiAgICB0aGlzLm1lYXN1cmUgPSAoKSA9PiB7XG4gICAgICB0aGlzLml0ZW1TaXplQ2FjaGUgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgICAgdGhpcy5ub3RpZnkoZmFsc2UpO1xuICAgIH07XG4gICAgdGhpcy5zZXRPcHRpb25zKG9wdHMpO1xuICB9XG59XG5jb25zdCBmaW5kTmVhcmVzdEJpbmFyeVNlYXJjaCA9IChsb3csIGhpZ2gsIGdldEN1cnJlbnRWYWx1ZSwgdmFsdWUpID0+IHtcbiAgd2hpbGUgKGxvdyA8PSBoaWdoKSB7XG4gICAgY29uc3QgbWlkZGxlID0gKGxvdyArIGhpZ2gpIC8gMiB8IDA7XG4gICAgY29uc3QgY3VycmVudFZhbHVlID0gZ2V0Q3VycmVudFZhbHVlKG1pZGRsZSk7XG4gICAgaWYgKGN1cnJlbnRWYWx1ZSA8IHZhbHVlKSB7XG4gICAgICBsb3cgPSBtaWRkbGUgKyAxO1xuICAgIH0gZWxzZSBpZiAoY3VycmVudFZhbHVlID4gdmFsdWUpIHtcbiAgICAgIGhpZ2ggPSBtaWRkbGUgLSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWlkZGxlO1xuICAgIH1cbiAgfVxuICBpZiAobG93ID4gMCkge1xuICAgIHJldHVybiBsb3cgLSAxO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAwO1xuICB9XG59O1xuZnVuY3Rpb24gY2FsY3VsYXRlUmFuZ2Uoe1xuICBtZWFzdXJlbWVudHMsXG4gIG91dGVyU2l6ZSxcbiAgc2Nyb2xsT2Zmc2V0LFxuICBsYW5lc1xufSkge1xuICBjb25zdCBsYXN0SW5kZXggPSBtZWFzdXJlbWVudHMubGVuZ3RoIC0gMTtcbiAgY29uc3QgZ2V0T2Zmc2V0ID0gKGluZGV4KSA9PiBtZWFzdXJlbWVudHNbaW5kZXhdLnN0YXJ0O1xuICBpZiAobWVhc3VyZW1lbnRzLmxlbmd0aCA8PSBsYW5lcykge1xuICAgIHJldHVybiB7XG4gICAgICBzdGFydEluZGV4OiAwLFxuICAgICAgZW5kSW5kZXg6IGxhc3RJbmRleFxuICAgIH07XG4gIH1cbiAgbGV0IHN0YXJ0SW5kZXggPSBmaW5kTmVhcmVzdEJpbmFyeVNlYXJjaChcbiAgICAwLFxuICAgIGxhc3RJbmRleCxcbiAgICBnZXRPZmZzZXQsXG4gICAgc2Nyb2xsT2Zmc2V0XG4gICk7XG4gIGxldCBlbmRJbmRleCA9IHN0YXJ0SW5kZXg7XG4gIGlmIChsYW5lcyA9PT0gMSkge1xuICAgIHdoaWxlIChlbmRJbmRleCA8IGxhc3RJbmRleCAmJiBtZWFzdXJlbWVudHNbZW5kSW5kZXhdLmVuZCA8IHNjcm9sbE9mZnNldCArIG91dGVyU2l6ZSkge1xuICAgICAgZW5kSW5kZXgrKztcbiAgICB9XG4gIH0gZWxzZSBpZiAobGFuZXMgPiAxKSB7XG4gICAgY29uc3QgZW5kUGVyTGFuZSA9IEFycmF5KGxhbmVzKS5maWxsKDApO1xuICAgIHdoaWxlIChlbmRJbmRleCA8IGxhc3RJbmRleCAmJiBlbmRQZXJMYW5lLnNvbWUoKHBvcykgPT4gcG9zIDwgc2Nyb2xsT2Zmc2V0ICsgb3V0ZXJTaXplKSkge1xuICAgICAgY29uc3QgaXRlbSA9IG1lYXN1cmVtZW50c1tlbmRJbmRleF07XG4gICAgICBlbmRQZXJMYW5lW2l0ZW0ubGFuZV0gPSBpdGVtLmVuZDtcbiAgICAgIGVuZEluZGV4Kys7XG4gICAgfVxuICAgIGNvbnN0IHN0YXJ0UGVyTGFuZSA9IEFycmF5KGxhbmVzKS5maWxsKHNjcm9sbE9mZnNldCArIG91dGVyU2l6ZSk7XG4gICAgd2hpbGUgKHN0YXJ0SW5kZXggPj0gMCAmJiBzdGFydFBlckxhbmUuc29tZSgocG9zKSA9PiBwb3MgPj0gc2Nyb2xsT2Zmc2V0KSkge1xuICAgICAgY29uc3QgaXRlbSA9IG1lYXN1cmVtZW50c1tzdGFydEluZGV4XTtcbiAgICAgIHN0YXJ0UGVyTGFuZVtpdGVtLmxhbmVdID0gaXRlbS5zdGFydDtcbiAgICAgIHN0YXJ0SW5kZXgtLTtcbiAgICB9XG4gICAgc3RhcnRJbmRleCA9IE1hdGgubWF4KDAsIHN0YXJ0SW5kZXggLSBzdGFydEluZGV4ICUgbGFuZXMpO1xuICAgIGVuZEluZGV4ID0gTWF0aC5taW4obGFzdEluZGV4LCBlbmRJbmRleCArIChsYW5lcyAtIDEgLSBlbmRJbmRleCAlIGxhbmVzKSk7XG4gIH1cbiAgcmV0dXJuIHsgc3RhcnRJbmRleCwgZW5kSW5kZXggfTtcbn1cbmV4cG9ydCB7XG4gIFZpcnR1YWxpemVyLFxuICBhcHByb3hFcXVhbCxcbiAgZGVib3VuY2UsXG4gIGRlZmF1bHRLZXlFeHRyYWN0b3IsXG4gIGRlZmF1bHRSYW5nZUV4dHJhY3RvcixcbiAgZWxlbWVudFNjcm9sbCxcbiAgbWVhc3VyZUVsZW1lbnQsXG4gIG1lbW8sXG4gIG5vdFVuZGVmaW5lZCxcbiAgb2JzZXJ2ZUVsZW1lbnRPZmZzZXQsXG4gIG9ic2VydmVFbGVtZW50UmVjdCxcbiAgb2JzZXJ2ZVdpbmRvd09mZnNldCxcbiAgb2JzZXJ2ZVdpbmRvd1JlY3QsXG4gIHdpbmRvd1Njcm9sbFxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcFxuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBmbHVzaFN5bmMgfSBmcm9tIFwicmVhY3QtZG9tXCI7XG5pbXBvcnQgeyBWaXJ0dWFsaXplciwgZWxlbWVudFNjcm9sbCwgb2JzZXJ2ZUVsZW1lbnRPZmZzZXQsIG9ic2VydmVFbGVtZW50UmVjdCwgd2luZG93U2Nyb2xsLCBvYnNlcnZlV2luZG93T2Zmc2V0LCBvYnNlcnZlV2luZG93UmVjdCB9IGZyb20gXCJAdGFuc3RhY2svdmlydHVhbC1jb3JlXCI7XG5leHBvcnQgKiBmcm9tIFwiQHRhbnN0YWNrL3ZpcnR1YWwtY29yZVwiO1xuY29uc3QgdXNlSXNvbW9ycGhpY0xheW91dEVmZmVjdCA9IHR5cGVvZiBkb2N1bWVudCAhPT0gXCJ1bmRlZmluZWRcIiA/IFJlYWN0LnVzZUxheW91dEVmZmVjdCA6IFJlYWN0LnVzZUVmZmVjdDtcbmZ1bmN0aW9uIHVzZVZpcnR1YWxpemVyQmFzZShvcHRpb25zKSB7XG4gIGNvbnN0IHJlcmVuZGVyID0gUmVhY3QudXNlUmVkdWNlcigoKSA9PiAoe30pLCB7fSlbMV07XG4gIGNvbnN0IHJlc29sdmVkT3B0aW9ucyA9IHtcbiAgICAuLi5vcHRpb25zLFxuICAgIG9uQ2hhbmdlOiAoaW5zdGFuY2UyLCBzeW5jKSA9PiB7XG4gICAgICB2YXIgX2E7XG4gICAgICBpZiAoc3luYykge1xuICAgICAgICBmbHVzaFN5bmMocmVyZW5kZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVyZW5kZXIoKTtcbiAgICAgIH1cbiAgICAgIChfYSA9IG9wdGlvbnMub25DaGFuZ2UpID09IG51bGwgPyB2b2lkIDAgOiBfYS5jYWxsKG9wdGlvbnMsIGluc3RhbmNlMiwgc3luYyk7XG4gICAgfVxuICB9O1xuICBjb25zdCBbaW5zdGFuY2VdID0gUmVhY3QudXNlU3RhdGUoXG4gICAgKCkgPT4gbmV3IFZpcnR1YWxpemVyKHJlc29sdmVkT3B0aW9ucylcbiAgKTtcbiAgaW5zdGFuY2Uuc2V0T3B0aW9ucyhyZXNvbHZlZE9wdGlvbnMpO1xuICB1c2VJc29tb3JwaGljTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gaW5zdGFuY2UuX2RpZE1vdW50KCk7XG4gIH0sIFtdKTtcbiAgdXNlSXNvbW9ycGhpY0xheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuIGluc3RhbmNlLl93aWxsVXBkYXRlKCk7XG4gIH0pO1xuICByZXR1cm4gaW5zdGFuY2U7XG59XG5mdW5jdGlvbiB1c2VWaXJ0dWFsaXplcihvcHRpb25zKSB7XG4gIHJldHVybiB1c2VWaXJ0dWFsaXplckJhc2Uoe1xuICAgIG9ic2VydmVFbGVtZW50UmVjdCxcbiAgICBvYnNlcnZlRWxlbWVudE9mZnNldCxcbiAgICBzY3JvbGxUb0ZuOiBlbGVtZW50U2Nyb2xsLFxuICAgIC4uLm9wdGlvbnNcbiAgfSk7XG59XG5mdW5jdGlvbiB1c2VXaW5kb3dWaXJ0dWFsaXplcihvcHRpb25zKSB7XG4gIHJldHVybiB1c2VWaXJ0dWFsaXplckJhc2Uoe1xuICAgIGdldFNjcm9sbEVsZW1lbnQ6ICgpID0+IHR5cGVvZiBkb2N1bWVudCAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IG51bGwsXG4gICAgb2JzZXJ2ZUVsZW1lbnRSZWN0OiBvYnNlcnZlV2luZG93UmVjdCxcbiAgICBvYnNlcnZlRWxlbWVudE9mZnNldDogb2JzZXJ2ZVdpbmRvd09mZnNldCxcbiAgICBzY3JvbGxUb0ZuOiB3aW5kb3dTY3JvbGwsXG4gICAgaW5pdGlhbE9mZnNldDogKCkgPT4gdHlwZW9mIGRvY3VtZW50ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnNjcm9sbFkgOiAwLFxuICAgIC4uLm9wdGlvbnNcbiAgfSk7XG59XG5leHBvcnQge1xuICB1c2VWaXJ0dWFsaXplcixcbiAgdXNlV2luZG93VmlydHVhbGl6ZXJcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXBcbiIsIi8qKlxuICogQGxpY2Vuc2UgUmVhY3RcbiAqIHVzZS1zeW5jLWV4dGVybmFsLXN0b3JlLXdpdGgtc2VsZWN0b3IuZGV2ZWxvcG1lbnQuanNcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIE1ldGEgUGxhdGZvcm1zLCBJbmMuIGFuZCBhZmZpbGlhdGVzLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXCJwcm9kdWN0aW9uXCIgIT09IHByb2Nlc3MuZW52Lk5PREVfRU5WICYmXG4gIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gaXMoeCwgeSkge1xuICAgICAgcmV0dXJuICh4ID09PSB5ICYmICgwICE9PSB4IHx8IDEgLyB4ID09PSAxIC8geSkpIHx8ICh4ICE9PSB4ICYmIHkgIT09IHkpO1xuICAgIH1cbiAgICBcInVuZGVmaW5lZFwiICE9PSB0eXBlb2YgX19SRUFDVF9ERVZUT09MU19HTE9CQUxfSE9PS19fICYmXG4gICAgICBcImZ1bmN0aW9uXCIgPT09XG4gICAgICAgIHR5cGVvZiBfX1JFQUNUX0RFVlRPT0xTX0dMT0JBTF9IT09LX18ucmVnaXN0ZXJJbnRlcm5hbE1vZHVsZVN0YXJ0ICYmXG4gICAgICBfX1JFQUNUX0RFVlRPT0xTX0dMT0JBTF9IT09LX18ucmVnaXN0ZXJJbnRlcm5hbE1vZHVsZVN0YXJ0KEVycm9yKCkpO1xuICAgIHZhciBSZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKSxcbiAgICAgIG9iamVjdElzID0gXCJmdW5jdGlvblwiID09PSB0eXBlb2YgT2JqZWN0LmlzID8gT2JqZWN0LmlzIDogaXMsXG4gICAgICB1c2VTeW5jRXh0ZXJuYWxTdG9yZSA9IFJlYWN0LnVzZVN5bmNFeHRlcm5hbFN0b3JlLFxuICAgICAgdXNlUmVmID0gUmVhY3QudXNlUmVmLFxuICAgICAgdXNlRWZmZWN0ID0gUmVhY3QudXNlRWZmZWN0LFxuICAgICAgdXNlTWVtbyA9IFJlYWN0LnVzZU1lbW8sXG4gICAgICB1c2VEZWJ1Z1ZhbHVlID0gUmVhY3QudXNlRGVidWdWYWx1ZTtcbiAgICBleHBvcnRzLnVzZVN5bmNFeHRlcm5hbFN0b3JlV2l0aFNlbGVjdG9yID0gZnVuY3Rpb24gKFxuICAgICAgc3Vic2NyaWJlLFxuICAgICAgZ2V0U25hcHNob3QsXG4gICAgICBnZXRTZXJ2ZXJTbmFwc2hvdCxcbiAgICAgIHNlbGVjdG9yLFxuICAgICAgaXNFcXVhbFxuICAgICkge1xuICAgICAgdmFyIGluc3RSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgICBpZiAobnVsbCA9PT0gaW5zdFJlZi5jdXJyZW50KSB7XG4gICAgICAgIHZhciBpbnN0ID0geyBoYXNWYWx1ZTogITEsIHZhbHVlOiBudWxsIH07XG4gICAgICAgIGluc3RSZWYuY3VycmVudCA9IGluc3Q7XG4gICAgICB9IGVsc2UgaW5zdCA9IGluc3RSZWYuY3VycmVudDtcbiAgICAgIGluc3RSZWYgPSB1c2VNZW1vKFxuICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZnVuY3Rpb24gbWVtb2l6ZWRTZWxlY3RvcihuZXh0U25hcHNob3QpIHtcbiAgICAgICAgICAgIGlmICghaGFzTWVtbykge1xuICAgICAgICAgICAgICBoYXNNZW1vID0gITA7XG4gICAgICAgICAgICAgIG1lbW9pemVkU25hcHNob3QgPSBuZXh0U25hcHNob3Q7XG4gICAgICAgICAgICAgIG5leHRTbmFwc2hvdCA9IHNlbGVjdG9yKG5leHRTbmFwc2hvdCk7XG4gICAgICAgICAgICAgIGlmICh2b2lkIDAgIT09IGlzRXF1YWwgJiYgaW5zdC5oYXNWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50U2VsZWN0aW9uID0gaW5zdC52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoaXNFcXVhbChjdXJyZW50U2VsZWN0aW9uLCBuZXh0U25hcHNob3QpKVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIChtZW1vaXplZFNlbGVjdGlvbiA9IGN1cnJlbnRTZWxlY3Rpb24pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiAobWVtb2l6ZWRTZWxlY3Rpb24gPSBuZXh0U25hcHNob3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3VycmVudFNlbGVjdGlvbiA9IG1lbW9pemVkU2VsZWN0aW9uO1xuICAgICAgICAgICAgaWYgKG9iamVjdElzKG1lbW9pemVkU25hcHNob3QsIG5leHRTbmFwc2hvdCkpXG4gICAgICAgICAgICAgIHJldHVybiBjdXJyZW50U2VsZWN0aW9uO1xuICAgICAgICAgICAgdmFyIG5leHRTZWxlY3Rpb24gPSBzZWxlY3RvcihuZXh0U25hcHNob3QpO1xuICAgICAgICAgICAgaWYgKHZvaWQgMCAhPT0gaXNFcXVhbCAmJiBpc0VxdWFsKGN1cnJlbnRTZWxlY3Rpb24sIG5leHRTZWxlY3Rpb24pKVxuICAgICAgICAgICAgICByZXR1cm4gKG1lbW9pemVkU25hcHNob3QgPSBuZXh0U25hcHNob3QpLCBjdXJyZW50U2VsZWN0aW9uO1xuICAgICAgICAgICAgbWVtb2l6ZWRTbmFwc2hvdCA9IG5leHRTbmFwc2hvdDtcbiAgICAgICAgICAgIHJldHVybiAobWVtb2l6ZWRTZWxlY3Rpb24gPSBuZXh0U2VsZWN0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGhhc01lbW8gPSAhMSxcbiAgICAgICAgICAgIG1lbW9pemVkU25hcHNob3QsXG4gICAgICAgICAgICBtZW1vaXplZFNlbGVjdGlvbixcbiAgICAgICAgICAgIG1heWJlR2V0U2VydmVyU25hcHNob3QgPVxuICAgICAgICAgICAgICB2b2lkIDAgPT09IGdldFNlcnZlclNuYXBzaG90ID8gbnVsbCA6IGdldFNlcnZlclNuYXBzaG90O1xuICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHJldHVybiBtZW1vaXplZFNlbGVjdG9yKGdldFNuYXBzaG90KCkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG51bGwgPT09IG1heWJlR2V0U2VydmVyU25hcHNob3RcbiAgICAgICAgICAgICAgPyB2b2lkIDBcbiAgICAgICAgICAgICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbWVtb2l6ZWRTZWxlY3RvcihtYXliZUdldFNlcnZlclNuYXBzaG90KCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICBdO1xuICAgICAgICB9LFxuICAgICAgICBbZ2V0U25hcHNob3QsIGdldFNlcnZlclNuYXBzaG90LCBzZWxlY3RvciwgaXNFcXVhbF1cbiAgICAgICk7XG4gICAgICB2YXIgdmFsdWUgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShzdWJzY3JpYmUsIGluc3RSZWZbMF0sIGluc3RSZWZbMV0pO1xuICAgICAgdXNlRWZmZWN0KFxuICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaW5zdC5oYXNWYWx1ZSA9ICEwO1xuICAgICAgICAgIGluc3QudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgW3ZhbHVlXVxuICAgICAgKTtcbiAgICAgIHVzZURlYnVnVmFsdWUodmFsdWUpO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG4gICAgXCJ1bmRlZmluZWRcIiAhPT0gdHlwZW9mIF9fUkVBQ1RfREVWVE9PTFNfR0xPQkFMX0hPT0tfXyAmJlxuICAgICAgXCJmdW5jdGlvblwiID09PVxuICAgICAgICB0eXBlb2YgX19SRUFDVF9ERVZUT09MU19HTE9CQUxfSE9PS19fLnJlZ2lzdGVySW50ZXJuYWxNb2R1bGVTdG9wICYmXG4gICAgICBfX1JFQUNUX0RFVlRPT0xTX0dMT0JBTF9IT09LX18ucmVnaXN0ZXJJbnRlcm5hbE1vZHVsZVN0b3AoRXJyb3IoKSk7XG4gIH0pKCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIG1lbW8gPSB7fTtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBnZXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgdmFyIHN0eWxlVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpO1xuXG4gICAgLy8gU3BlY2lhbCBjYXNlIHRvIHJldHVybiBoZWFkIG9mIGlmcmFtZSBpbnN0ZWFkIG9mIGlmcmFtZSBpdHNlbGZcbiAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICB9XG4gIHJldHVybiBtZW1vW3RhcmdldF07XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0QnlTZWxlY3RvcihpbnNlcnQsIHN0eWxlKSB7XG4gIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQoaW5zZXJ0KTtcbiAgaWYgKCF0YXJnZXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydCcgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuICB9XG4gIHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEJ5U2VsZWN0b3I7IiwiJ3VzZSBzdHJpY3QnO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vY2pzL3VzZS1zeW5jLWV4dGVybmFsLXN0b3JlLXdpdGgtc2VsZWN0b3IucHJvZHVjdGlvbi5qcycpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Nqcy91c2Utc3luYy1leHRlcm5hbC1zdG9yZS13aXRoLXNlbGVjdG9yLmRldmVsb3BtZW50LmpzJyk7XG59XG4iLCJmdW5jdGlvbiBfY2xhc3NfYXBwbHlfZGVzY3JpcHRvcl9zZXQocmVjZWl2ZXIsIGRlc2NyaXB0b3IsIHZhbHVlKSB7XG4gICAgaWYgKGRlc2NyaXB0b3Iuc2V0KSBkZXNjcmlwdG9yLnNldC5jYWxsKHJlY2VpdmVyLCB2YWx1ZSk7XG4gICAgZWxzZSB7XG4gICAgICAgIGlmICghZGVzY3JpcHRvci53cml0YWJsZSkge1xuICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgb25seSB0aHJvdyBpbiBzdHJpY3QgbW9kZSwgYnV0IGNsYXNzIGJvZGllcyBhcmVcbiAgICAgICAgICAgIC8vIGFsd2F5cyBzdHJpY3QgYW5kIHByaXZhdGUgZmllbGRzIGNhbiBvbmx5IGJlIHVzZWQgaW5zaWRlXG4gICAgICAgICAgICAvLyBjbGFzcyBib2RpZXMuXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXR0ZW1wdGVkIHRvIHNldCByZWFkIG9ubHkgcHJpdmF0ZSBmaWVsZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBkZXNjcmlwdG9yLnZhbHVlID0gdmFsdWU7XG4gICAgfVxufVxuZXhwb3J0IHsgX2NsYXNzX2FwcGx5X2Rlc2NyaXB0b3Jfc2V0IGFzIF8gfTtcbiIsImltcG9ydCB7IF8gYXMgX2NsYXNzX2FwcGx5X2Rlc2NyaXB0b3Jfc2V0IH0gZnJvbSBcIi4vX2NsYXNzX2FwcGx5X2Rlc2NyaXB0b3Jfc2V0LmpzXCI7XG5pbXBvcnQgeyBfIGFzIF9jbGFzc19leHRyYWN0X2ZpZWxkX2Rlc2NyaXB0b3IgfSBmcm9tIFwiLi9fY2xhc3NfZXh0cmFjdF9maWVsZF9kZXNjcmlwdG9yLmpzXCI7XG5cbmZ1bmN0aW9uIF9jbGFzc19wcml2YXRlX2ZpZWxkX3NldChyZWNlaXZlciwgcHJpdmF0ZU1hcCwgdmFsdWUpIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IF9jbGFzc19leHRyYWN0X2ZpZWxkX2Rlc2NyaXB0b3IocmVjZWl2ZXIsIHByaXZhdGVNYXAsIFwic2V0XCIpO1xuICAgIF9jbGFzc19hcHBseV9kZXNjcmlwdG9yX3NldChyZWNlaXZlciwgZGVzY3JpcHRvciwgdmFsdWUpO1xuICAgIHJldHVybiB2YWx1ZTtcbn1cbmV4cG9ydCB7IF9jbGFzc19wcml2YXRlX2ZpZWxkX3NldCBhcyBfIH07XG4iLCIvKipcbiAqIEBsaWNlbnNlIFJlYWN0XG4gKiB1c2Utc3luYy1leHRlcm5hbC1zdG9yZS1zaGltL3dpdGgtc2VsZWN0b3IuZGV2ZWxvcG1lbnQuanNcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIE1ldGEgUGxhdGZvcm1zLCBJbmMuIGFuZCBhZmZpbGlhdGVzLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXCJwcm9kdWN0aW9uXCIgIT09IHByb2Nlc3MuZW52Lk5PREVfRU5WICYmXG4gIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gaXMoeCwgeSkge1xuICAgICAgcmV0dXJuICh4ID09PSB5ICYmICgwICE9PSB4IHx8IDEgLyB4ID09PSAxIC8geSkpIHx8ICh4ICE9PSB4ICYmIHkgIT09IHkpO1xuICAgIH1cbiAgICBcInVuZGVmaW5lZFwiICE9PSB0eXBlb2YgX19SRUFDVF9ERVZUT09MU19HTE9CQUxfSE9PS19fICYmXG4gICAgICBcImZ1bmN0aW9uXCIgPT09XG4gICAgICAgIHR5cGVvZiBfX1JFQUNUX0RFVlRPT0xTX0dMT0JBTF9IT09LX18ucmVnaXN0ZXJJbnRlcm5hbE1vZHVsZVN0YXJ0ICYmXG4gICAgICBfX1JFQUNUX0RFVlRPT0xTX0dMT0JBTF9IT09LX18ucmVnaXN0ZXJJbnRlcm5hbE1vZHVsZVN0YXJ0KEVycm9yKCkpO1xuICAgIHZhciBSZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKSxcbiAgICAgIHNoaW0gPSByZXF1aXJlKFwidXNlLXN5bmMtZXh0ZXJuYWwtc3RvcmUvc2hpbVwiKSxcbiAgICAgIG9iamVjdElzID0gXCJmdW5jdGlvblwiID09PSB0eXBlb2YgT2JqZWN0LmlzID8gT2JqZWN0LmlzIDogaXMsXG4gICAgICB1c2VTeW5jRXh0ZXJuYWxTdG9yZSA9IHNoaW0udXNlU3luY0V4dGVybmFsU3RvcmUsXG4gICAgICB1c2VSZWYgPSBSZWFjdC51c2VSZWYsXG4gICAgICB1c2VFZmZlY3QgPSBSZWFjdC51c2VFZmZlY3QsXG4gICAgICB1c2VNZW1vID0gUmVhY3QudXNlTWVtbyxcbiAgICAgIHVzZURlYnVnVmFsdWUgPSBSZWFjdC51c2VEZWJ1Z1ZhbHVlO1xuICAgIGV4cG9ydHMudXNlU3luY0V4dGVybmFsU3RvcmVXaXRoU2VsZWN0b3IgPSBmdW5jdGlvbiAoXG4gICAgICBzdWJzY3JpYmUsXG4gICAgICBnZXRTbmFwc2hvdCxcbiAgICAgIGdldFNlcnZlclNuYXBzaG90LFxuICAgICAgc2VsZWN0b3IsXG4gICAgICBpc0VxdWFsXG4gICAgKSB7XG4gICAgICB2YXIgaW5zdFJlZiA9IHVzZVJlZihudWxsKTtcbiAgICAgIGlmIChudWxsID09PSBpbnN0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgdmFyIGluc3QgPSB7IGhhc1ZhbHVlOiAhMSwgdmFsdWU6IG51bGwgfTtcbiAgICAgICAgaW5zdFJlZi5jdXJyZW50ID0gaW5zdDtcbiAgICAgIH0gZWxzZSBpbnN0ID0gaW5zdFJlZi5jdXJyZW50O1xuICAgICAgaW5zdFJlZiA9IHVzZU1lbW8oXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBmdW5jdGlvbiBtZW1vaXplZFNlbGVjdG9yKG5leHRTbmFwc2hvdCkge1xuICAgICAgICAgICAgaWYgKCFoYXNNZW1vKSB7XG4gICAgICAgICAgICAgIGhhc01lbW8gPSAhMDtcbiAgICAgICAgICAgICAgbWVtb2l6ZWRTbmFwc2hvdCA9IG5leHRTbmFwc2hvdDtcbiAgICAgICAgICAgICAgbmV4dFNuYXBzaG90ID0gc2VsZWN0b3IobmV4dFNuYXBzaG90KTtcbiAgICAgICAgICAgICAgaWYgKHZvaWQgMCAhPT0gaXNFcXVhbCAmJiBpbnN0Lmhhc1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRTZWxlY3Rpb24gPSBpbnN0LnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmIChpc0VxdWFsKGN1cnJlbnRTZWxlY3Rpb24sIG5leHRTbmFwc2hvdCkpXG4gICAgICAgICAgICAgICAgICByZXR1cm4gKG1lbW9pemVkU2VsZWN0aW9uID0gY3VycmVudFNlbGVjdGlvbik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIChtZW1vaXplZFNlbGVjdGlvbiA9IG5leHRTbmFwc2hvdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdXJyZW50U2VsZWN0aW9uID0gbWVtb2l6ZWRTZWxlY3Rpb247XG4gICAgICAgICAgICBpZiAob2JqZWN0SXMobWVtb2l6ZWRTbmFwc2hvdCwgbmV4dFNuYXBzaG90KSlcbiAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRTZWxlY3Rpb247XG4gICAgICAgICAgICB2YXIgbmV4dFNlbGVjdGlvbiA9IHNlbGVjdG9yKG5leHRTbmFwc2hvdCk7XG4gICAgICAgICAgICBpZiAodm9pZCAwICE9PSBpc0VxdWFsICYmIGlzRXF1YWwoY3VycmVudFNlbGVjdGlvbiwgbmV4dFNlbGVjdGlvbikpXG4gICAgICAgICAgICAgIHJldHVybiAobWVtb2l6ZWRTbmFwc2hvdCA9IG5leHRTbmFwc2hvdCksIGN1cnJlbnRTZWxlY3Rpb247XG4gICAgICAgICAgICBtZW1vaXplZFNuYXBzaG90ID0gbmV4dFNuYXBzaG90O1xuICAgICAgICAgICAgcmV0dXJuIChtZW1vaXplZFNlbGVjdGlvbiA9IG5leHRTZWxlY3Rpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgaGFzTWVtbyA9ICExLFxuICAgICAgICAgICAgbWVtb2l6ZWRTbmFwc2hvdCxcbiAgICAgICAgICAgIG1lbW9pemVkU2VsZWN0aW9uLFxuICAgICAgICAgICAgbWF5YmVHZXRTZXJ2ZXJTbmFwc2hvdCA9XG4gICAgICAgICAgICAgIHZvaWQgMCA9PT0gZ2V0U2VydmVyU25hcHNob3QgPyBudWxsIDogZ2V0U2VydmVyU25hcHNob3Q7XG4gICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG1lbW9pemVkU2VsZWN0b3IoZ2V0U25hcHNob3QoKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbnVsbCA9PT0gbWF5YmVHZXRTZXJ2ZXJTbmFwc2hvdFxuICAgICAgICAgICAgICA/IHZvaWQgMFxuICAgICAgICAgICAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBtZW1vaXplZFNlbGVjdG9yKG1heWJlR2V0U2VydmVyU25hcHNob3QoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgIF07XG4gICAgICAgIH0sXG4gICAgICAgIFtnZXRTbmFwc2hvdCwgZ2V0U2VydmVyU25hcHNob3QsIHNlbGVjdG9yLCBpc0VxdWFsXVxuICAgICAgKTtcbiAgICAgIHZhciB2YWx1ZSA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKHN1YnNjcmliZSwgaW5zdFJlZlswXSwgaW5zdFJlZlsxXSk7XG4gICAgICB1c2VFZmZlY3QoXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpbnN0Lmhhc1ZhbHVlID0gITA7XG4gICAgICAgICAgaW5zdC52YWx1ZSA9IHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICBbdmFsdWVdXG4gICAgICApO1xuICAgICAgdXNlRGVidWdWYWx1ZSh2YWx1ZSk7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcbiAgICBcInVuZGVmaW5lZFwiICE9PSB0eXBlb2YgX19SRUFDVF9ERVZUT09MU19HTE9CQUxfSE9PS19fICYmXG4gICAgICBcImZ1bmN0aW9uXCIgPT09XG4gICAgICAgIHR5cGVvZiBfX1JFQUNUX0RFVlRPT0xTX0dMT0JBTF9IT09LX18ucmVnaXN0ZXJJbnRlcm5hbE1vZHVsZVN0b3AgJiZcbiAgICAgIF9fUkVBQ1RfREVWVE9PTFNfR0xPQkFMX0hPT0tfXy5yZWdpc3RlckludGVybmFsTW9kdWxlU3RvcChFcnJvcigpKTtcbiAgfSkoKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgc3R5bGVzSW5ET00gPSBbXTtcbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRE9NLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRE9NW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXhCeUlkZW50aWZpZXIgPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM10sXG4gICAgICBzdXBwb3J0czogaXRlbVs0XSxcbiAgICAgIGxheWVyOiBpdGVtWzVdXG4gICAgfTtcbiAgICBpZiAoaW5kZXhCeUlkZW50aWZpZXIgIT09IC0xKSB7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0ucmVmZXJlbmNlcysrO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnVwZGF0ZXIob2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHVwZGF0ZXIgPSBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKTtcbiAgICAgIG9wdGlvbnMuYnlJbmRleCA9IGk7XG4gICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoaSwgMCwge1xuICAgICAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuICAgICAgICB1cGRhdGVyOiB1cGRhdGVyLFxuICAgICAgICByZWZlcmVuY2VzOiAxXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuICByZXR1cm4gaWRlbnRpZmllcnM7XG59XG5mdW5jdGlvbiBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKSB7XG4gIHZhciBhcGkgPSBvcHRpb25zLmRvbUFQSShvcHRpb25zKTtcbiAgYXBpLnVwZGF0ZShvYmopO1xuICB2YXIgdXBkYXRlciA9IGZ1bmN0aW9uIHVwZGF0ZXIobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCAmJiBuZXdPYmouc3VwcG9ydHMgPT09IG9iai5zdXBwb3J0cyAmJiBuZXdPYmoubGF5ZXIgPT09IG9iai5sYXllcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhcGkudXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwaS5yZW1vdmUoKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiB1cGRhdGVyO1xufVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG4gICAgdmFyIG5ld0xhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShuZXdMaXN0LCBvcHRpb25zKTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG4gICAgICBpZiAoc3R5bGVzSW5ET01bX2luZGV4XS5yZWZlcmVuY2VzID09PSAwKSB7XG4gICAgICAgIHN0eWxlc0luRE9NW19pbmRleF0udXBkYXRlcigpO1xuICAgICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCIvKipcbiAqIEBsaWNlbnNlIFJlYWN0XG4gKiB1c2Utc3luYy1leHRlcm5hbC1zdG9yZS1zaGltLmRldmVsb3BtZW50LmpzXG4gKlxuICogQ29weXJpZ2h0IChjKSBNZXRhIFBsYXRmb3JtcywgSW5jLiBhbmQgYWZmaWxpYXRlcy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblwicHJvZHVjdGlvblwiICE9PSBwcm9jZXNzLmVudi5OT0RFX0VOViAmJlxuICAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGlzKHgsIHkpIHtcbiAgICAgIHJldHVybiAoeCA9PT0geSAmJiAoMCAhPT0geCB8fCAxIC8geCA9PT0gMSAvIHkpKSB8fCAoeCAhPT0geCAmJiB5ICE9PSB5KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdXNlU3luY0V4dGVybmFsU3RvcmUkMihzdWJzY3JpYmUsIGdldFNuYXBzaG90KSB7XG4gICAgICBkaWRXYXJuT2xkMThBbHBoYSB8fFxuICAgICAgICB2b2lkIDAgPT09IFJlYWN0LnN0YXJ0VHJhbnNpdGlvbiB8fFxuICAgICAgICAoKGRpZFdhcm5PbGQxOEFscGhhID0gITApLFxuICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgIFwiWW91IGFyZSB1c2luZyBhbiBvdXRkYXRlZCwgcHJlLXJlbGVhc2UgYWxwaGEgb2YgUmVhY3QgMTggdGhhdCBkb2VzIG5vdCBzdXBwb3J0IHVzZVN5bmNFeHRlcm5hbFN0b3JlLiBUaGUgdXNlLXN5bmMtZXh0ZXJuYWwtc3RvcmUgc2hpbSB3aWxsIG5vdCB3b3JrIGNvcnJlY3RseS4gVXBncmFkZSB0byBhIG5ld2VyIHByZS1yZWxlYXNlLlwiXG4gICAgICAgICkpO1xuICAgICAgdmFyIHZhbHVlID0gZ2V0U25hcHNob3QoKTtcbiAgICAgIGlmICghZGlkV2FyblVuY2FjaGVkR2V0U25hcHNob3QpIHtcbiAgICAgICAgdmFyIGNhY2hlZFZhbHVlID0gZ2V0U25hcHNob3QoKTtcbiAgICAgICAgb2JqZWN0SXModmFsdWUsIGNhY2hlZFZhbHVlKSB8fFxuICAgICAgICAgIChjb25zb2xlLmVycm9yKFxuICAgICAgICAgICAgXCJUaGUgcmVzdWx0IG9mIGdldFNuYXBzaG90IHNob3VsZCBiZSBjYWNoZWQgdG8gYXZvaWQgYW4gaW5maW5pdGUgbG9vcFwiXG4gICAgICAgICAgKSxcbiAgICAgICAgICAoZGlkV2FyblVuY2FjaGVkR2V0U25hcHNob3QgPSAhMCkpO1xuICAgICAgfVxuICAgICAgY2FjaGVkVmFsdWUgPSB1c2VTdGF0ZSh7XG4gICAgICAgIGluc3Q6IHsgdmFsdWU6IHZhbHVlLCBnZXRTbmFwc2hvdDogZ2V0U25hcHNob3QgfVxuICAgICAgfSk7XG4gICAgICB2YXIgaW5zdCA9IGNhY2hlZFZhbHVlWzBdLmluc3QsXG4gICAgICAgIGZvcmNlVXBkYXRlID0gY2FjaGVkVmFsdWVbMV07XG4gICAgICB1c2VMYXlvdXRFZmZlY3QoXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpbnN0LnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgaW5zdC5nZXRTbmFwc2hvdCA9IGdldFNuYXBzaG90O1xuICAgICAgICAgIGNoZWNrSWZTbmFwc2hvdENoYW5nZWQoaW5zdCkgJiYgZm9yY2VVcGRhdGUoeyBpbnN0OiBpbnN0IH0pO1xuICAgICAgICB9LFxuICAgICAgICBbc3Vic2NyaWJlLCB2YWx1ZSwgZ2V0U25hcHNob3RdXG4gICAgICApO1xuICAgICAgdXNlRWZmZWN0KFxuICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY2hlY2tJZlNuYXBzaG90Q2hhbmdlZChpbnN0KSAmJiBmb3JjZVVwZGF0ZSh7IGluc3Q6IGluc3QgfSk7XG4gICAgICAgICAgcmV0dXJuIHN1YnNjcmliZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjaGVja0lmU25hcHNob3RDaGFuZ2VkKGluc3QpICYmIGZvcmNlVXBkYXRlKHsgaW5zdDogaW5zdCB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgW3N1YnNjcmliZV1cbiAgICAgICk7XG4gICAgICB1c2VEZWJ1Z1ZhbHVlKHZhbHVlKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2hlY2tJZlNuYXBzaG90Q2hhbmdlZChpbnN0KSB7XG4gICAgICB2YXIgbGF0ZXN0R2V0U25hcHNob3QgPSBpbnN0LmdldFNuYXBzaG90O1xuICAgICAgaW5zdCA9IGluc3QudmFsdWU7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgbmV4dFZhbHVlID0gbGF0ZXN0R2V0U25hcHNob3QoKTtcbiAgICAgICAgcmV0dXJuICFvYmplY3RJcyhpbnN0LCBuZXh0VmFsdWUpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuICEwO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB1c2VTeW5jRXh0ZXJuYWxTdG9yZSQxKHN1YnNjcmliZSwgZ2V0U25hcHNob3QpIHtcbiAgICAgIHJldHVybiBnZXRTbmFwc2hvdCgpO1xuICAgIH1cbiAgICBcInVuZGVmaW5lZFwiICE9PSB0eXBlb2YgX19SRUFDVF9ERVZUT09MU19HTE9CQUxfSE9PS19fICYmXG4gICAgICBcImZ1bmN0aW9uXCIgPT09XG4gICAgICAgIHR5cGVvZiBfX1JFQUNUX0RFVlRPT0xTX0dMT0JBTF9IT09LX18ucmVnaXN0ZXJJbnRlcm5hbE1vZHVsZVN0YXJ0ICYmXG4gICAgICBfX1JFQUNUX0RFVlRPT0xTX0dMT0JBTF9IT09LX18ucmVnaXN0ZXJJbnRlcm5hbE1vZHVsZVN0YXJ0KEVycm9yKCkpO1xuICAgIHZhciBSZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKSxcbiAgICAgIG9iamVjdElzID0gXCJmdW5jdGlvblwiID09PSB0eXBlb2YgT2JqZWN0LmlzID8gT2JqZWN0LmlzIDogaXMsXG4gICAgICB1c2VTdGF0ZSA9IFJlYWN0LnVzZVN0YXRlLFxuICAgICAgdXNlRWZmZWN0ID0gUmVhY3QudXNlRWZmZWN0LFxuICAgICAgdXNlTGF5b3V0RWZmZWN0ID0gUmVhY3QudXNlTGF5b3V0RWZmZWN0LFxuICAgICAgdXNlRGVidWdWYWx1ZSA9IFJlYWN0LnVzZURlYnVnVmFsdWUsXG4gICAgICBkaWRXYXJuT2xkMThBbHBoYSA9ICExLFxuICAgICAgZGlkV2FyblVuY2FjaGVkR2V0U25hcHNob3QgPSAhMSxcbiAgICAgIHNoaW0gPVxuICAgICAgICBcInVuZGVmaW5lZFwiID09PSB0eXBlb2Ygd2luZG93IHx8XG4gICAgICAgIFwidW5kZWZpbmVkXCIgPT09IHR5cGVvZiB3aW5kb3cuZG9jdW1lbnQgfHxcbiAgICAgICAgXCJ1bmRlZmluZWRcIiA9PT0gdHlwZW9mIHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50XG4gICAgICAgICAgPyB1c2VTeW5jRXh0ZXJuYWxTdG9yZSQxXG4gICAgICAgICAgOiB1c2VTeW5jRXh0ZXJuYWxTdG9yZSQyO1xuICAgIGV4cG9ydHMudXNlU3luY0V4dGVybmFsU3RvcmUgPVxuICAgICAgdm9pZCAwICE9PSBSZWFjdC51c2VTeW5jRXh0ZXJuYWxTdG9yZSA/IFJlYWN0LnVzZVN5bmNFeHRlcm5hbFN0b3JlIDogc2hpbTtcbiAgICBcInVuZGVmaW5lZFwiICE9PSB0eXBlb2YgX19SRUFDVF9ERVZUT09MU19HTE9CQUxfSE9PS19fICYmXG4gICAgICBcImZ1bmN0aW9uXCIgPT09XG4gICAgICAgIHR5cGVvZiBfX1JFQUNUX0RFVlRPT0xTX0dMT0JBTF9IT09LX18ucmVnaXN0ZXJJbnRlcm5hbE1vZHVsZVN0b3AgJiZcbiAgICAgIF9fUkVBQ1RfREVWVE9PTFNfR0xPQkFMX0hPT0tfXy5yZWdpc3RlckludGVybmFsTW9kdWxlU3RvcChFcnJvcigpKTtcbiAgfSkoKTtcbiIsImNvbnN0IHJlZHV4SW1wbCA9IChyZWR1Y2VyLCBpbml0aWFsKSA9PiAoc2V0LCBfZ2V0LCBhcGkpID0+IHtcbiAgYXBpLmRpc3BhdGNoID0gKGFjdGlvbikgPT4ge1xuICAgIHNldCgoc3RhdGUpID0+IHJlZHVjZXIoc3RhdGUsIGFjdGlvbiksIGZhbHNlLCBhY3Rpb24pO1xuICAgIHJldHVybiBhY3Rpb247XG4gIH07XG4gIGFwaS5kaXNwYXRjaEZyb21EZXZ0b29scyA9IHRydWU7XG4gIHJldHVybiB7IGRpc3BhdGNoOiAoLi4uYXJncykgPT4gYXBpLmRpc3BhdGNoKC4uLmFyZ3MpLCAuLi5pbml0aWFsIH07XG59O1xuY29uc3QgcmVkdXggPSByZWR1eEltcGw7XG5cbmNvbnN0IHRyYWNrZWRDb25uZWN0aW9ucyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG5jb25zdCBnZXRUcmFja2VkQ29ubmVjdGlvblN0YXRlID0gKG5hbWUpID0+IHtcbiAgY29uc3QgYXBpID0gdHJhY2tlZENvbm5lY3Rpb25zLmdldChuYW1lKTtcbiAgaWYgKCFhcGkpIHJldHVybiB7fTtcbiAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICBPYmplY3QuZW50cmllcyhhcGkuc3RvcmVzKS5tYXAoKFtrZXksIGFwaTJdKSA9PiBba2V5LCBhcGkyLmdldFN0YXRlKCldKVxuICApO1xufTtcbmNvbnN0IGV4dHJhY3RDb25uZWN0aW9uSW5mb3JtYXRpb24gPSAoc3RvcmUsIGV4dGVuc2lvbkNvbm5lY3Rvciwgb3B0aW9ucykgPT4ge1xuICBpZiAoc3RvcmUgPT09IHZvaWQgMCkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBcInVudHJhY2tlZFwiLFxuICAgICAgY29ubmVjdGlvbjogZXh0ZW5zaW9uQ29ubmVjdG9yLmNvbm5lY3Qob3B0aW9ucylcbiAgICB9O1xuICB9XG4gIGNvbnN0IGV4aXN0aW5nQ29ubmVjdGlvbiA9IHRyYWNrZWRDb25uZWN0aW9ucy5nZXQob3B0aW9ucy5uYW1lKTtcbiAgaWYgKGV4aXN0aW5nQ29ubmVjdGlvbikge1xuICAgIHJldHVybiB7IHR5cGU6IFwidHJhY2tlZFwiLCBzdG9yZSwgLi4uZXhpc3RpbmdDb25uZWN0aW9uIH07XG4gIH1cbiAgY29uc3QgbmV3Q29ubmVjdGlvbiA9IHtcbiAgICBjb25uZWN0aW9uOiBleHRlbnNpb25Db25uZWN0b3IuY29ubmVjdChvcHRpb25zKSxcbiAgICBzdG9yZXM6IHt9XG4gIH07XG4gIHRyYWNrZWRDb25uZWN0aW9ucy5zZXQob3B0aW9ucy5uYW1lLCBuZXdDb25uZWN0aW9uKTtcbiAgcmV0dXJuIHsgdHlwZTogXCJ0cmFja2VkXCIsIHN0b3JlLCAuLi5uZXdDb25uZWN0aW9uIH07XG59O1xuY29uc3QgcmVtb3ZlU3RvcmVGcm9tVHJhY2tlZENvbm5lY3Rpb25zID0gKG5hbWUsIHN0b3JlKSA9PiB7XG4gIGlmIChzdG9yZSA9PT0gdm9pZCAwKSByZXR1cm47XG4gIGNvbnN0IGNvbm5lY3Rpb25JbmZvID0gdHJhY2tlZENvbm5lY3Rpb25zLmdldChuYW1lKTtcbiAgaWYgKCFjb25uZWN0aW9uSW5mbykgcmV0dXJuO1xuICBkZWxldGUgY29ubmVjdGlvbkluZm8uc3RvcmVzW3N0b3JlXTtcbiAgaWYgKE9iamVjdC5rZXlzKGNvbm5lY3Rpb25JbmZvLnN0b3JlcykubGVuZ3RoID09PSAwKSB7XG4gICAgdHJhY2tlZENvbm5lY3Rpb25zLmRlbGV0ZShuYW1lKTtcbiAgfVxufTtcbmNvbnN0IGZpbmRDYWxsZXJOYW1lID0gKHN0YWNrKSA9PiB7XG4gIHZhciBfYSwgX2I7XG4gIGlmICghc3RhY2spIHJldHVybiB2b2lkIDA7XG4gIGNvbnN0IHRyYWNlTGluZXMgPSBzdGFjay5zcGxpdChcIlxcblwiKTtcbiAgY29uc3QgYXBpU2V0U3RhdGVMaW5lSW5kZXggPSB0cmFjZUxpbmVzLmZpbmRJbmRleChcbiAgICAodHJhY2VMaW5lKSA9PiB0cmFjZUxpbmUuaW5jbHVkZXMoXCJhcGkuc2V0U3RhdGVcIilcbiAgKTtcbiAgaWYgKGFwaVNldFN0YXRlTGluZUluZGV4IDwgMCkgcmV0dXJuIHZvaWQgMDtcbiAgY29uc3QgY2FsbGVyTGluZSA9ICgoX2EgPSB0cmFjZUxpbmVzW2FwaVNldFN0YXRlTGluZUluZGV4ICsgMV0pID09IG51bGwgPyB2b2lkIDAgOiBfYS50cmltKCkpIHx8IFwiXCI7XG4gIHJldHVybiAoX2IgPSAvLisgKC4rKSAuKy8uZXhlYyhjYWxsZXJMaW5lKSkgPT0gbnVsbCA/IHZvaWQgMCA6IF9iWzFdO1xufTtcbmNvbnN0IGRldnRvb2xzSW1wbCA9IChmbiwgZGV2dG9vbHNPcHRpb25zID0ge30pID0+IChzZXQsIGdldCwgYXBpKSA9PiB7XG4gIGNvbnN0IHsgZW5hYmxlZCwgYW5vbnltb3VzQWN0aW9uVHlwZSwgc3RvcmUsIC4uLm9wdGlvbnMgfSA9IGRldnRvb2xzT3B0aW9ucztcbiAgbGV0IGV4dGVuc2lvbkNvbm5lY3RvcjtcbiAgdHJ5IHtcbiAgICBleHRlbnNpb25Db25uZWN0b3IgPSAoZW5hYmxlZCAhPSBudWxsID8gZW5hYmxlZCA6IChpbXBvcnQubWV0YS5lbnYgPyBpbXBvcnQubWV0YS5lbnYuTU9ERSA6IHZvaWQgMCkgIT09IFwicHJvZHVjdGlvblwiKSAmJiB3aW5kb3cuX19SRURVWF9ERVZUT09MU19FWFRFTlNJT05fXztcbiAgfSBjYXRjaCAoZSkge1xuICB9XG4gIGlmICghZXh0ZW5zaW9uQ29ubmVjdG9yKSB7XG4gICAgcmV0dXJuIGZuKHNldCwgZ2V0LCBhcGkpO1xuICB9XG4gIGNvbnN0IHsgY29ubmVjdGlvbiwgLi4uY29ubmVjdGlvbkluZm9ybWF0aW9uIH0gPSBleHRyYWN0Q29ubmVjdGlvbkluZm9ybWF0aW9uKHN0b3JlLCBleHRlbnNpb25Db25uZWN0b3IsIG9wdGlvbnMpO1xuICBsZXQgaXNSZWNvcmRpbmcgPSB0cnVlO1xuICBhcGkuc2V0U3RhdGUgPSAoKHN0YXRlLCByZXBsYWNlLCBuYW1lT3JBY3Rpb24pID0+IHtcbiAgICBjb25zdCByID0gc2V0KHN0YXRlLCByZXBsYWNlKTtcbiAgICBpZiAoIWlzUmVjb3JkaW5nKSByZXR1cm4gcjtcbiAgICBjb25zdCBhY3Rpb24gPSBuYW1lT3JBY3Rpb24gPT09IHZvaWQgMCA/IHtcbiAgICAgIHR5cGU6IGFub255bW91c0FjdGlvblR5cGUgfHwgZmluZENhbGxlck5hbWUobmV3IEVycm9yKCkuc3RhY2spIHx8IFwiYW5vbnltb3VzXCJcbiAgICB9IDogdHlwZW9mIG5hbWVPckFjdGlvbiA9PT0gXCJzdHJpbmdcIiA/IHsgdHlwZTogbmFtZU9yQWN0aW9uIH0gOiBuYW1lT3JBY3Rpb247XG4gICAgaWYgKHN0b3JlID09PSB2b2lkIDApIHtcbiAgICAgIGNvbm5lY3Rpb24gPT0gbnVsbCA/IHZvaWQgMCA6IGNvbm5lY3Rpb24uc2VuZChhY3Rpb24sIGdldCgpKTtcbiAgICAgIHJldHVybiByO1xuICAgIH1cbiAgICBjb25uZWN0aW9uID09IG51bGwgPyB2b2lkIDAgOiBjb25uZWN0aW9uLnNlbmQoXG4gICAgICB7XG4gICAgICAgIC4uLmFjdGlvbixcbiAgICAgICAgdHlwZTogYCR7c3RvcmV9LyR7YWN0aW9uLnR5cGV9YFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgLi4uZ2V0VHJhY2tlZENvbm5lY3Rpb25TdGF0ZShvcHRpb25zLm5hbWUpLFxuICAgICAgICBbc3RvcmVdOiBhcGkuZ2V0U3RhdGUoKVxuICAgICAgfVxuICAgICk7XG4gICAgcmV0dXJuIHI7XG4gIH0pO1xuICBhcGkuZGV2dG9vbHMgPSB7XG4gICAgY2xlYW51cDogKCkgPT4ge1xuICAgICAgaWYgKGNvbm5lY3Rpb24gJiYgdHlwZW9mIGNvbm5lY3Rpb24udW5zdWJzY3JpYmUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBjb25uZWN0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICB9XG4gICAgICByZW1vdmVTdG9yZUZyb21UcmFja2VkQ29ubmVjdGlvbnMob3B0aW9ucy5uYW1lLCBzdG9yZSk7XG4gICAgfVxuICB9O1xuICBjb25zdCBzZXRTdGF0ZUZyb21EZXZ0b29scyA9ICguLi5hKSA9PiB7XG4gICAgY29uc3Qgb3JpZ2luYWxJc1JlY29yZGluZyA9IGlzUmVjb3JkaW5nO1xuICAgIGlzUmVjb3JkaW5nID0gZmFsc2U7XG4gICAgc2V0KC4uLmEpO1xuICAgIGlzUmVjb3JkaW5nID0gb3JpZ2luYWxJc1JlY29yZGluZztcbiAgfTtcbiAgY29uc3QgaW5pdGlhbFN0YXRlID0gZm4oYXBpLnNldFN0YXRlLCBnZXQsIGFwaSk7XG4gIGlmIChjb25uZWN0aW9uSW5mb3JtYXRpb24udHlwZSA9PT0gXCJ1bnRyYWNrZWRcIikge1xuICAgIGNvbm5lY3Rpb24gPT0gbnVsbCA/IHZvaWQgMCA6IGNvbm5lY3Rpb24uaW5pdChpbml0aWFsU3RhdGUpO1xuICB9IGVsc2Uge1xuICAgIGNvbm5lY3Rpb25JbmZvcm1hdGlvbi5zdG9yZXNbY29ubmVjdGlvbkluZm9ybWF0aW9uLnN0b3JlXSA9IGFwaTtcbiAgICBjb25uZWN0aW9uID09IG51bGwgPyB2b2lkIDAgOiBjb25uZWN0aW9uLmluaXQoXG4gICAgICBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKGNvbm5lY3Rpb25JbmZvcm1hdGlvbi5zdG9yZXMpLm1hcCgoW2tleSwgc3RvcmUyXSkgPT4gW1xuICAgICAgICAgIGtleSxcbiAgICAgICAgICBrZXkgPT09IGNvbm5lY3Rpb25JbmZvcm1hdGlvbi5zdG9yZSA/IGluaXRpYWxTdGF0ZSA6IHN0b3JlMi5nZXRTdGF0ZSgpXG4gICAgICAgIF0pXG4gICAgICApXG4gICAgKTtcbiAgfVxuICBpZiAoYXBpLmRpc3BhdGNoRnJvbURldnRvb2xzICYmIHR5cGVvZiBhcGkuZGlzcGF0Y2ggPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGxldCBkaWRXYXJuQWJvdXRSZXNlcnZlZEFjdGlvblR5cGUgPSBmYWxzZTtcbiAgICBjb25zdCBvcmlnaW5hbERpc3BhdGNoID0gYXBpLmRpc3BhdGNoO1xuICAgIGFwaS5kaXNwYXRjaCA9ICguLi5hcmdzKSA9PiB7XG4gICAgICBpZiAoKGltcG9ydC5tZXRhLmVudiA/IGltcG9ydC5tZXRhLmVudi5NT0RFIDogdm9pZCAwKSAhPT0gXCJwcm9kdWN0aW9uXCIgJiYgYXJnc1swXS50eXBlID09PSBcIl9fc2V0U3RhdGVcIiAmJiAhZGlkV2FybkFib3V0UmVzZXJ2ZWRBY3Rpb25UeXBlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAnW3p1c3RhbmQgZGV2dG9vbHMgbWlkZGxld2FyZV0gXCJfX3NldFN0YXRlXCIgYWN0aW9uIHR5cGUgaXMgcmVzZXJ2ZWQgdG8gc2V0IHN0YXRlIGZyb20gdGhlIGRldnRvb2xzLiBBdm9pZCB1c2luZyBpdC4nXG4gICAgICAgICk7XG4gICAgICAgIGRpZFdhcm5BYm91dFJlc2VydmVkQWN0aW9uVHlwZSA9IHRydWU7XG4gICAgICB9XG4gICAgICBvcmlnaW5hbERpc3BhdGNoKC4uLmFyZ3MpO1xuICAgIH07XG4gIH1cbiAgY29ubmVjdGlvbi5zdWJzY3JpYmUoKG1lc3NhZ2UpID0+IHtcbiAgICB2YXIgX2E7XG4gICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcbiAgICAgIGNhc2UgXCJBQ1RJT05cIjpcbiAgICAgICAgaWYgKHR5cGVvZiBtZXNzYWdlLnBheWxvYWQgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgICAgXCJbenVzdGFuZCBkZXZ0b29scyBtaWRkbGV3YXJlXSBVbnN1cHBvcnRlZCBhY3Rpb24gZm9ybWF0XCJcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyc2VKc29uVGhlbihcbiAgICAgICAgICBtZXNzYWdlLnBheWxvYWQsXG4gICAgICAgICAgKGFjdGlvbikgPT4ge1xuICAgICAgICAgICAgaWYgKGFjdGlvbi50eXBlID09PSBcIl9fc2V0U3RhdGVcIikge1xuICAgICAgICAgICAgICBpZiAoc3RvcmUgPT09IHZvaWQgMCkge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlRnJvbURldnRvb2xzKGFjdGlvbi5zdGF0ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhhY3Rpb24uc3RhdGUpLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAgICAgICBgXG4gICAgICAgICAgICAgICAgICAgIFt6dXN0YW5kIGRldnRvb2xzIG1pZGRsZXdhcmVdIFVuc3VwcG9ydGVkIF9fc2V0U3RhdGUgYWN0aW9uIGZvcm1hdC5cbiAgICAgICAgICAgICAgICAgICAgV2hlbiB1c2luZyAnc3RvcmUnIG9wdGlvbiBpbiBkZXZ0b29scygpLCB0aGUgJ3N0YXRlJyBzaG91bGQgaGF2ZSBvbmx5IG9uZSBrZXksIHdoaWNoIGlzIGEgdmFsdWUgb2YgJ3N0b3JlJyB0aGF0IHdhcyBwYXNzZWQgaW4gZGV2dG9vbHMoKSxcbiAgICAgICAgICAgICAgICAgICAgYW5kIHZhbHVlIG9mIHRoaXMgb25seSBrZXkgc2hvdWxkIGJlIGEgc3RhdGUgb2JqZWN0LiBFeGFtcGxlOiB7IFwidHlwZVwiOiBcIl9fc2V0U3RhdGVcIiwgXCJzdGF0ZVwiOiB7IFwiYWJjMTIzU3RvcmVcIjogeyBcImZvb1wiOiBcImJhclwiIH0gfSB9XG4gICAgICAgICAgICAgICAgICAgIGBcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IHN0YXRlRnJvbURldnRvb2xzID0gYWN0aW9uLnN0YXRlW3N0b3JlXTtcbiAgICAgICAgICAgICAgaWYgKHN0YXRlRnJvbURldnRvb2xzID09PSB2b2lkIDAgfHwgc3RhdGVGcm9tRGV2dG9vbHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKEpTT04uc3RyaW5naWZ5KGFwaS5nZXRTdGF0ZSgpKSAhPT0gSlNPTi5zdHJpbmdpZnkoc3RhdGVGcm9tRGV2dG9vbHMpKSB7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGVGcm9tRGV2dG9vbHMoc3RhdGVGcm9tRGV2dG9vbHMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghYXBpLmRpc3BhdGNoRnJvbURldnRvb2xzKSByZXR1cm47XG4gICAgICAgICAgICBpZiAodHlwZW9mIGFwaS5kaXNwYXRjaCAhPT0gXCJmdW5jdGlvblwiKSByZXR1cm47XG4gICAgICAgICAgICBhcGkuZGlzcGF0Y2goYWN0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICBjYXNlIFwiRElTUEFUQ0hcIjpcbiAgICAgICAgc3dpdGNoIChtZXNzYWdlLnBheWxvYWQudHlwZSkge1xuICAgICAgICAgIGNhc2UgXCJSRVNFVFwiOlxuICAgICAgICAgICAgc2V0U3RhdGVGcm9tRGV2dG9vbHMoaW5pdGlhbFN0YXRlKTtcbiAgICAgICAgICAgIGlmIChzdG9yZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjb25uZWN0aW9uID09IG51bGwgPyB2b2lkIDAgOiBjb25uZWN0aW9uLmluaXQoYXBpLmdldFN0YXRlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb24gPT0gbnVsbCA/IHZvaWQgMCA6IGNvbm5lY3Rpb24uaW5pdChnZXRUcmFja2VkQ29ubmVjdGlvblN0YXRlKG9wdGlvbnMubmFtZSkpO1xuICAgICAgICAgIGNhc2UgXCJDT01NSVRcIjpcbiAgICAgICAgICAgIGlmIChzdG9yZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgIGNvbm5lY3Rpb24gPT0gbnVsbCA/IHZvaWQgMCA6IGNvbm5lY3Rpb24uaW5pdChhcGkuZ2V0U3RhdGUoKSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb25uZWN0aW9uID09IG51bGwgPyB2b2lkIDAgOiBjb25uZWN0aW9uLmluaXQoZ2V0VHJhY2tlZENvbm5lY3Rpb25TdGF0ZShvcHRpb25zLm5hbWUpKTtcbiAgICAgICAgICBjYXNlIFwiUk9MTEJBQ0tcIjpcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUpzb25UaGVuKG1lc3NhZ2Uuc3RhdGUsIChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgICBpZiAoc3RvcmUgPT09IHZvaWQgMCkge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlRnJvbURldnRvb2xzKHN0YXRlKTtcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uID09IG51bGwgPyB2b2lkIDAgOiBjb25uZWN0aW9uLmluaXQoYXBpLmdldFN0YXRlKCkpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZXRTdGF0ZUZyb21EZXZ0b29scyhzdGF0ZVtzdG9yZV0pO1xuICAgICAgICAgICAgICBjb25uZWN0aW9uID09IG51bGwgPyB2b2lkIDAgOiBjb25uZWN0aW9uLmluaXQoZ2V0VHJhY2tlZENvbm5lY3Rpb25TdGF0ZShvcHRpb25zLm5hbWUpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIGNhc2UgXCJKVU1QX1RPX1NUQVRFXCI6XG4gICAgICAgICAgY2FzZSBcIkpVTVBfVE9fQUNUSU9OXCI6XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VKc29uVGhlbihtZXNzYWdlLnN0YXRlLCAoc3RhdGUpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHN0b3JlID09PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICBzZXRTdGF0ZUZyb21EZXZ0b29scyhzdGF0ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChKU09OLnN0cmluZ2lmeShhcGkuZ2V0U3RhdGUoKSkgIT09IEpTT04uc3RyaW5naWZ5KHN0YXRlW3N0b3JlXSkpIHtcbiAgICAgICAgICAgICAgICBzZXRTdGF0ZUZyb21EZXZ0b29scyhzdGF0ZVtzdG9yZV0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICBjYXNlIFwiSU1QT1JUX1NUQVRFXCI6IHtcbiAgICAgICAgICAgIGNvbnN0IHsgbmV4dExpZnRlZFN0YXRlIH0gPSBtZXNzYWdlLnBheWxvYWQ7XG4gICAgICAgICAgICBjb25zdCBsYXN0Q29tcHV0ZWRTdGF0ZSA9IChfYSA9IG5leHRMaWZ0ZWRTdGF0ZS5jb21wdXRlZFN0YXRlcy5zbGljZSgtMSlbMF0pID09IG51bGwgPyB2b2lkIDAgOiBfYS5zdGF0ZTtcbiAgICAgICAgICAgIGlmICghbGFzdENvbXB1dGVkU3RhdGUpIHJldHVybjtcbiAgICAgICAgICAgIGlmIChzdG9yZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgIHNldFN0YXRlRnJvbURldnRvb2xzKGxhc3RDb21wdXRlZFN0YXRlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNldFN0YXRlRnJvbURldnRvb2xzKGxhc3RDb21wdXRlZFN0YXRlW3N0b3JlXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25uZWN0aW9uID09IG51bGwgPyB2b2lkIDAgOiBjb25uZWN0aW9uLnNlbmQoXG4gICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgIC8vIEZJWE1FIG5vLWFueVxuICAgICAgICAgICAgICBuZXh0TGlmdGVkU3RhdGVcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgXCJQQVVTRV9SRUNPUkRJTkdcIjpcbiAgICAgICAgICAgIHJldHVybiBpc1JlY29yZGluZyA9ICFpc1JlY29yZGluZztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGluaXRpYWxTdGF0ZTtcbn07XG5jb25zdCBkZXZ0b29scyA9IGRldnRvb2xzSW1wbDtcbmNvbnN0IHBhcnNlSnNvblRoZW4gPSAoc3RyaW5naWZpZWQsIGZuKSA9PiB7XG4gIGxldCBwYXJzZWQ7XG4gIHRyeSB7XG4gICAgcGFyc2VkID0gSlNPTi5wYXJzZShzdHJpbmdpZmllZCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgXCJbenVzdGFuZCBkZXZ0b29scyBtaWRkbGV3YXJlXSBDb3VsZCBub3QgcGFyc2UgdGhlIHJlY2VpdmVkIGpzb25cIixcbiAgICAgIGVcbiAgICApO1xuICB9XG4gIGlmIChwYXJzZWQgIT09IHZvaWQgMCkgZm4ocGFyc2VkKTtcbn07XG5cbmNvbnN0IHN1YnNjcmliZVdpdGhTZWxlY3RvckltcGwgPSAoZm4pID0+IChzZXQsIGdldCwgYXBpKSA9PiB7XG4gIGNvbnN0IG9yaWdTdWJzY3JpYmUgPSBhcGkuc3Vic2NyaWJlO1xuICBhcGkuc3Vic2NyaWJlID0gKChzZWxlY3Rvciwgb3B0TGlzdGVuZXIsIG9wdGlvbnMpID0+IHtcbiAgICBsZXQgbGlzdGVuZXIgPSBzZWxlY3RvcjtcbiAgICBpZiAob3B0TGlzdGVuZXIpIHtcbiAgICAgIGNvbnN0IGVxdWFsaXR5Rm4gPSAob3B0aW9ucyA9PSBudWxsID8gdm9pZCAwIDogb3B0aW9ucy5lcXVhbGl0eUZuKSB8fCBPYmplY3QuaXM7XG4gICAgICBsZXQgY3VycmVudFNsaWNlID0gc2VsZWN0b3IoYXBpLmdldFN0YXRlKCkpO1xuICAgICAgbGlzdGVuZXIgPSAoc3RhdGUpID0+IHtcbiAgICAgICAgY29uc3QgbmV4dFNsaWNlID0gc2VsZWN0b3Ioc3RhdGUpO1xuICAgICAgICBpZiAoIWVxdWFsaXR5Rm4oY3VycmVudFNsaWNlLCBuZXh0U2xpY2UpKSB7XG4gICAgICAgICAgY29uc3QgcHJldmlvdXNTbGljZSA9IGN1cnJlbnRTbGljZTtcbiAgICAgICAgICBvcHRMaXN0ZW5lcihjdXJyZW50U2xpY2UgPSBuZXh0U2xpY2UsIHByZXZpb3VzU2xpY2UpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgaWYgKG9wdGlvbnMgPT0gbnVsbCA/IHZvaWQgMCA6IG9wdGlvbnMuZmlyZUltbWVkaWF0ZWx5KSB7XG4gICAgICAgIG9wdExpc3RlbmVyKGN1cnJlbnRTbGljZSwgY3VycmVudFNsaWNlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9yaWdTdWJzY3JpYmUobGlzdGVuZXIpO1xuICB9KTtcbiAgY29uc3QgaW5pdGlhbFN0YXRlID0gZm4oc2V0LCBnZXQsIGFwaSk7XG4gIHJldHVybiBpbml0aWFsU3RhdGU7XG59O1xuY29uc3Qgc3Vic2NyaWJlV2l0aFNlbGVjdG9yID0gc3Vic2NyaWJlV2l0aFNlbGVjdG9ySW1wbDtcblxuZnVuY3Rpb24gY29tYmluZShpbml0aWFsU3RhdGUsIGNyZWF0ZSkge1xuICByZXR1cm4gKC4uLmFyZ3MpID0+IE9iamVjdC5hc3NpZ24oe30sIGluaXRpYWxTdGF0ZSwgY3JlYXRlKC4uLmFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSlNPTlN0b3JhZ2UoZ2V0U3RvcmFnZSwgb3B0aW9ucykge1xuICBsZXQgc3RvcmFnZTtcbiAgdHJ5IHtcbiAgICBzdG9yYWdlID0gZ2V0U3RvcmFnZSgpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHBlcnNpc3RTdG9yYWdlID0ge1xuICAgIGdldEl0ZW06IChuYW1lKSA9PiB7XG4gICAgICB2YXIgX2E7XG4gICAgICBjb25zdCBwYXJzZSA9IChzdHIyKSA9PiB7XG4gICAgICAgIGlmIChzdHIyID09PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2Uoc3RyMiwgb3B0aW9ucyA9PSBudWxsID8gdm9pZCAwIDogb3B0aW9ucy5yZXZpdmVyKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBzdHIgPSAoX2EgPSBzdG9yYWdlLmdldEl0ZW0obmFtZSkpICE9IG51bGwgPyBfYSA6IG51bGw7XG4gICAgICBpZiAoc3RyIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gc3RyLnRoZW4ocGFyc2UpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhcnNlKHN0cik7XG4gICAgfSxcbiAgICBzZXRJdGVtOiAobmFtZSwgbmV3VmFsdWUpID0+IHN0b3JhZ2Uuc2V0SXRlbShuYW1lLCBKU09OLnN0cmluZ2lmeShuZXdWYWx1ZSwgb3B0aW9ucyA9PSBudWxsID8gdm9pZCAwIDogb3B0aW9ucy5yZXBsYWNlcikpLFxuICAgIHJlbW92ZUl0ZW06IChuYW1lKSA9PiBzdG9yYWdlLnJlbW92ZUl0ZW0obmFtZSlcbiAgfTtcbiAgcmV0dXJuIHBlcnNpc3RTdG9yYWdlO1xufVxuY29uc3QgdG9UaGVuYWJsZSA9IChmbikgPT4gKGlucHV0KSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzdWx0ID0gZm4oaW5wdXQpO1xuICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgdGhlbihvbkZ1bGZpbGxlZCkge1xuICAgICAgICByZXR1cm4gdG9UaGVuYWJsZShvbkZ1bGZpbGxlZCkocmVzdWx0KTtcbiAgICAgIH0sXG4gICAgICBjYXRjaChfb25SZWplY3RlZCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICB9O1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRoZW4oX29uRnVsZmlsbGVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSxcbiAgICAgIGNhdGNoKG9uUmVqZWN0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHRvVGhlbmFibGUob25SZWplY3RlZCkoZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcbmNvbnN0IHBlcnNpc3RJbXBsID0gKGNvbmZpZywgYmFzZU9wdGlvbnMpID0+IChzZXQsIGdldCwgYXBpKSA9PiB7XG4gIGxldCBvcHRpb25zID0ge1xuICAgIHN0b3JhZ2U6IGNyZWF0ZUpTT05TdG9yYWdlKCgpID0+IGxvY2FsU3RvcmFnZSksXG4gICAgcGFydGlhbGl6ZTogKHN0YXRlKSA9PiBzdGF0ZSxcbiAgICB2ZXJzaW9uOiAwLFxuICAgIG1lcmdlOiAocGVyc2lzdGVkU3RhdGUsIGN1cnJlbnRTdGF0ZSkgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnRTdGF0ZSxcbiAgICAgIC4uLnBlcnNpc3RlZFN0YXRlXG4gICAgfSksXG4gICAgLi4uYmFzZU9wdGlvbnNcbiAgfTtcbiAgbGV0IGhhc0h5ZHJhdGVkID0gZmFsc2U7XG4gIGNvbnN0IGh5ZHJhdGlvbkxpc3RlbmVycyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gIGNvbnN0IGZpbmlzaEh5ZHJhdGlvbkxpc3RlbmVycyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gIGxldCBzdG9yYWdlID0gb3B0aW9ucy5zdG9yYWdlO1xuICBpZiAoIXN0b3JhZ2UpIHtcbiAgICByZXR1cm4gY29uZmlnKFxuICAgICAgKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIGBbenVzdGFuZCBwZXJzaXN0IG1pZGRsZXdhcmVdIFVuYWJsZSB0byB1cGRhdGUgaXRlbSAnJHtvcHRpb25zLm5hbWV9JywgdGhlIGdpdmVuIHN0b3JhZ2UgaXMgY3VycmVudGx5IHVuYXZhaWxhYmxlLmBcbiAgICAgICAgKTtcbiAgICAgICAgc2V0KC4uLmFyZ3MpO1xuICAgICAgfSxcbiAgICAgIGdldCxcbiAgICAgIGFwaVxuICAgICk7XG4gIH1cbiAgY29uc3Qgc2V0SXRlbSA9ICgpID0+IHtcbiAgICBjb25zdCBzdGF0ZSA9IG9wdGlvbnMucGFydGlhbGl6ZSh7IC4uLmdldCgpIH0pO1xuICAgIHJldHVybiBzdG9yYWdlLnNldEl0ZW0ob3B0aW9ucy5uYW1lLCB7XG4gICAgICBzdGF0ZSxcbiAgICAgIHZlcnNpb246IG9wdGlvbnMudmVyc2lvblxuICAgIH0pO1xuICB9O1xuICBjb25zdCBzYXZlZFNldFN0YXRlID0gYXBpLnNldFN0YXRlO1xuICBhcGkuc2V0U3RhdGUgPSAoc3RhdGUsIHJlcGxhY2UpID0+IHtcbiAgICBzYXZlZFNldFN0YXRlKHN0YXRlLCByZXBsYWNlKTtcbiAgICByZXR1cm4gc2V0SXRlbSgpO1xuICB9O1xuICBjb25zdCBjb25maWdSZXN1bHQgPSBjb25maWcoXG4gICAgKC4uLmFyZ3MpID0+IHtcbiAgICAgIHNldCguLi5hcmdzKTtcbiAgICAgIHJldHVybiBzZXRJdGVtKCk7XG4gICAgfSxcbiAgICBnZXQsXG4gICAgYXBpXG4gICk7XG4gIGFwaS5nZXRJbml0aWFsU3RhdGUgPSAoKSA9PiBjb25maWdSZXN1bHQ7XG4gIGxldCBzdGF0ZUZyb21TdG9yYWdlO1xuICBjb25zdCBoeWRyYXRlID0gKCkgPT4ge1xuICAgIHZhciBfYSwgX2I7XG4gICAgaWYgKCFzdG9yYWdlKSByZXR1cm47XG4gICAgaGFzSHlkcmF0ZWQgPSBmYWxzZTtcbiAgICBoeWRyYXRpb25MaXN0ZW5lcnMuZm9yRWFjaCgoY2IpID0+IHtcbiAgICAgIHZhciBfYTI7XG4gICAgICByZXR1cm4gY2IoKF9hMiA9IGdldCgpKSAhPSBudWxsID8gX2EyIDogY29uZmlnUmVzdWx0KTtcbiAgICB9KTtcbiAgICBjb25zdCBwb3N0UmVoeWRyYXRpb25DYWxsYmFjayA9ICgoX2IgPSBvcHRpb25zLm9uUmVoeWRyYXRlU3RvcmFnZSkgPT0gbnVsbCA/IHZvaWQgMCA6IF9iLmNhbGwob3B0aW9ucywgKF9hID0gZ2V0KCkpICE9IG51bGwgPyBfYSA6IGNvbmZpZ1Jlc3VsdCkpIHx8IHZvaWQgMDtcbiAgICByZXR1cm4gdG9UaGVuYWJsZShzdG9yYWdlLmdldEl0ZW0uYmluZChzdG9yYWdlKSkob3B0aW9ucy5uYW1lKS50aGVuKChkZXNlcmlhbGl6ZWRTdG9yYWdlVmFsdWUpID0+IHtcbiAgICAgIGlmIChkZXNlcmlhbGl6ZWRTdG9yYWdlVmFsdWUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBkZXNlcmlhbGl6ZWRTdG9yYWdlVmFsdWUudmVyc2lvbiA9PT0gXCJudW1iZXJcIiAmJiBkZXNlcmlhbGl6ZWRTdG9yYWdlVmFsdWUudmVyc2lvbiAhPT0gb3B0aW9ucy52ZXJzaW9uKSB7XG4gICAgICAgICAgaWYgKG9wdGlvbnMubWlncmF0ZSkge1xuICAgICAgICAgICAgY29uc3QgbWlncmF0aW9uID0gb3B0aW9ucy5taWdyYXRlKFxuICAgICAgICAgICAgICBkZXNlcmlhbGl6ZWRTdG9yYWdlVmFsdWUuc3RhdGUsXG4gICAgICAgICAgICAgIGRlc2VyaWFsaXplZFN0b3JhZ2VWYWx1ZS52ZXJzaW9uXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKG1pZ3JhdGlvbiBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG1pZ3JhdGlvbi50aGVuKChyZXN1bHQpID0+IFt0cnVlLCByZXN1bHRdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBbdHJ1ZSwgbWlncmF0aW9uXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgIGBTdGF0ZSBsb2FkZWQgZnJvbSBzdG9yYWdlIGNvdWxkbid0IGJlIG1pZ3JhdGVkIHNpbmNlIG5vIG1pZ3JhdGUgZnVuY3Rpb24gd2FzIHByb3ZpZGVkYFxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFtmYWxzZSwgZGVzZXJpYWxpemVkU3RvcmFnZVZhbHVlLnN0YXRlXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIFtmYWxzZSwgdm9pZCAwXTtcbiAgICB9KS50aGVuKChtaWdyYXRpb25SZXN1bHQpID0+IHtcbiAgICAgIHZhciBfYTI7XG4gICAgICBjb25zdCBbbWlncmF0ZWQsIG1pZ3JhdGVkU3RhdGVdID0gbWlncmF0aW9uUmVzdWx0O1xuICAgICAgc3RhdGVGcm9tU3RvcmFnZSA9IG9wdGlvbnMubWVyZ2UoXG4gICAgICAgIG1pZ3JhdGVkU3RhdGUsXG4gICAgICAgIChfYTIgPSBnZXQoKSkgIT0gbnVsbCA/IF9hMiA6IGNvbmZpZ1Jlc3VsdFxuICAgICAgKTtcbiAgICAgIHNldChzdGF0ZUZyb21TdG9yYWdlLCB0cnVlKTtcbiAgICAgIGlmIChtaWdyYXRlZCkge1xuICAgICAgICByZXR1cm4gc2V0SXRlbSgpO1xuICAgICAgfVxuICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgcG9zdFJlaHlkcmF0aW9uQ2FsbGJhY2sgPT0gbnVsbCA/IHZvaWQgMCA6IHBvc3RSZWh5ZHJhdGlvbkNhbGxiYWNrKHN0YXRlRnJvbVN0b3JhZ2UsIHZvaWQgMCk7XG4gICAgICBzdGF0ZUZyb21TdG9yYWdlID0gZ2V0KCk7XG4gICAgICBoYXNIeWRyYXRlZCA9IHRydWU7XG4gICAgICBmaW5pc2hIeWRyYXRpb25MaXN0ZW5lcnMuZm9yRWFjaCgoY2IpID0+IGNiKHN0YXRlRnJvbVN0b3JhZ2UpKTtcbiAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgcG9zdFJlaHlkcmF0aW9uQ2FsbGJhY2sgPT0gbnVsbCA/IHZvaWQgMCA6IHBvc3RSZWh5ZHJhdGlvbkNhbGxiYWNrKHZvaWQgMCwgZSk7XG4gICAgfSk7XG4gIH07XG4gIGFwaS5wZXJzaXN0ID0ge1xuICAgIHNldE9wdGlvbnM6IChuZXdPcHRpb25zKSA9PiB7XG4gICAgICBvcHRpb25zID0ge1xuICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAuLi5uZXdPcHRpb25zXG4gICAgICB9O1xuICAgICAgaWYgKG5ld09wdGlvbnMuc3RvcmFnZSkge1xuICAgICAgICBzdG9yYWdlID0gbmV3T3B0aW9ucy5zdG9yYWdlO1xuICAgICAgfVxuICAgIH0sXG4gICAgY2xlYXJTdG9yYWdlOiAoKSA9PiB7XG4gICAgICBzdG9yYWdlID09IG51bGwgPyB2b2lkIDAgOiBzdG9yYWdlLnJlbW92ZUl0ZW0ob3B0aW9ucy5uYW1lKTtcbiAgICB9LFxuICAgIGdldE9wdGlvbnM6ICgpID0+IG9wdGlvbnMsXG4gICAgcmVoeWRyYXRlOiAoKSA9PiBoeWRyYXRlKCksXG4gICAgaGFzSHlkcmF0ZWQ6ICgpID0+IGhhc0h5ZHJhdGVkLFxuICAgIG9uSHlkcmF0ZTogKGNiKSA9PiB7XG4gICAgICBoeWRyYXRpb25MaXN0ZW5lcnMuYWRkKGNiKTtcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGh5ZHJhdGlvbkxpc3RlbmVycy5kZWxldGUoY2IpO1xuICAgICAgfTtcbiAgICB9LFxuICAgIG9uRmluaXNoSHlkcmF0aW9uOiAoY2IpID0+IHtcbiAgICAgIGZpbmlzaEh5ZHJhdGlvbkxpc3RlbmVycy5hZGQoY2IpO1xuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgZmluaXNoSHlkcmF0aW9uTGlzdGVuZXJzLmRlbGV0ZShjYik7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbiAgaWYgKCFvcHRpb25zLnNraXBIeWRyYXRpb24pIHtcbiAgICBoeWRyYXRlKCk7XG4gIH1cbiAgcmV0dXJuIHN0YXRlRnJvbVN0b3JhZ2UgfHwgY29uZmlnUmVzdWx0O1xufTtcbmNvbnN0IHBlcnNpc3QgPSBwZXJzaXN0SW1wbDtcblxuZXhwb3J0IHsgY29tYmluZSwgY3JlYXRlSlNPTlN0b3JhZ2UsIGRldnRvb2xzLCBwZXJzaXN0LCByZWR1eCwgc3Vic2NyaWJlV2l0aFNlbGVjdG9yIH07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gXCJcIjtcbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KG9iai5zdXBwb3J0cywgXCIpIHtcIik7XG4gIH1cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIkBtZWRpYSBcIi5jb25jYXQob2JqLm1lZGlhLCBcIiB7XCIpO1xuICB9XG4gIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2Ygb2JqLmxheWVyICE9PSBcInVuZGVmaW5lZFwiO1xuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwiQGxheWVyXCIuY29uY2F0KG9iai5sYXllci5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KG9iai5sYXllcikgOiBcIlwiLCBcIiB7XCIpO1xuICB9XG4gIGNzcyArPSBvYmouY3NzO1xuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcbiAgaWYgKHNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9XG5cbiAgLy8gRm9yIG9sZCBJRVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG4gIG9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG59XG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGVFbGVtZW50LnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgc3R5bGVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50KTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBkb21BUEkob3B0aW9ucykge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKCkge30sXG4gICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgfTtcbiAgfVxuICB2YXIgc3R5bGVFbGVtZW50ID0gb3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gIHJldHVybiB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUob2JqKSB7XG4gICAgICBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaik7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuICAgIH1cbiAgfTtcbn1cbm1vZHVsZS5leHBvcnRzID0gZG9tQVBJOyIsIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXG5cblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxucHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXG5SRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFlcbkFORCBGSVRORVNTLiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SIEJFIExJQUJMRSBGT1IgQU5ZIFNQRUNJQUwsIERJUkVDVCxcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxuTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1Jcbk9USEVSIFRPUlRJT1VTIEFDVElPTiwgQVJJU0lORyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBVU0UgT1JcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xudmFyIHQ9ZnVuY3Rpb24ocixlKXtyZXR1cm4odD1PYmplY3Quc2V0UHJvdG90eXBlT2Z8fHtfX3Byb3RvX186W119aW5zdGFuY2VvZiBBcnJheSYmZnVuY3Rpb24odCxyKXt0Ll9fcHJvdG9fXz1yfXx8ZnVuY3Rpb24odCxyKXtmb3IodmFyIGUgaW4gcilPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocixlKSYmKHRbZV09cltlXSl9KShyLGUpfTtmdW5jdGlvbiByKHIsZSl7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgZSYmbnVsbCE9PWUpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIrU3RyaW5nKGUpK1wiIGlzIG5vdCBhIGNvbnN0cnVjdG9yIG9yIG51bGxcIik7ZnVuY3Rpb24gaSgpe3RoaXMuY29uc3RydWN0b3I9cn10KHIsZSksci5wcm90b3R5cGU9bnVsbD09PWU/T2JqZWN0LmNyZWF0ZShlKTooaS5wcm90b3R5cGU9ZS5wcm90b3R5cGUsbmV3IGkpfWZ1bmN0aW9uIGUodCl7dmFyIHI9XCJcIjtBcnJheS5pc0FycmF5KHQpfHwodD1bdF0pO2Zvcih2YXIgZT0wO2U8dC5sZW5ndGg7ZSsrKXt2YXIgaT10W2VdO2lmKGkudHlwZT09PV8uQ0xPU0VfUEFUSClyKz1cInpcIjtlbHNlIGlmKGkudHlwZT09PV8uSE9SSVpfTElORV9UTylyKz0oaS5yZWxhdGl2ZT9cImhcIjpcIkhcIikraS54O2Vsc2UgaWYoaS50eXBlPT09Xy5WRVJUX0xJTkVfVE8pcis9KGkucmVsYXRpdmU/XCJ2XCI6XCJWXCIpK2kueTtlbHNlIGlmKGkudHlwZT09PV8uTU9WRV9UTylyKz0oaS5yZWxhdGl2ZT9cIm1cIjpcIk1cIikraS54K1wiIFwiK2kueTtlbHNlIGlmKGkudHlwZT09PV8uTElORV9UTylyKz0oaS5yZWxhdGl2ZT9cImxcIjpcIkxcIikraS54K1wiIFwiK2kueTtlbHNlIGlmKGkudHlwZT09PV8uQ1VSVkVfVE8pcis9KGkucmVsYXRpdmU/XCJjXCI6XCJDXCIpK2kueDErXCIgXCIraS55MStcIiBcIitpLngyK1wiIFwiK2kueTIrXCIgXCIraS54K1wiIFwiK2kueTtlbHNlIGlmKGkudHlwZT09PV8uU01PT1RIX0NVUlZFX1RPKXIrPShpLnJlbGF0aXZlP1wic1wiOlwiU1wiKStpLngyK1wiIFwiK2kueTIrXCIgXCIraS54K1wiIFwiK2kueTtlbHNlIGlmKGkudHlwZT09PV8uUVVBRF9UTylyKz0oaS5yZWxhdGl2ZT9cInFcIjpcIlFcIikraS54MStcIiBcIitpLnkxK1wiIFwiK2kueCtcIiBcIitpLnk7ZWxzZSBpZihpLnR5cGU9PT1fLlNNT09USF9RVUFEX1RPKXIrPShpLnJlbGF0aXZlP1widFwiOlwiVFwiKStpLngrXCIgXCIraS55O2Vsc2V7aWYoaS50eXBlIT09Xy5BUkMpdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIGNvbW1hbmQgdHlwZSBcIicraS50eXBlKydcIiBhdCBpbmRleCAnK2UrXCIuXCIpO3IrPShpLnJlbGF0aXZlP1wiYVwiOlwiQVwiKStpLnJYK1wiIFwiK2kuclkrXCIgXCIraS54Um90K1wiIFwiKyAraS5sQXJjRmxhZytcIiBcIisgK2kuc3dlZXBGbGFnK1wiIFwiK2kueCtcIiBcIitpLnl9fXJldHVybiByfWZ1bmN0aW9uIGkodCxyKXt2YXIgZT10WzBdLGk9dFsxXTtyZXR1cm5bZSpNYXRoLmNvcyhyKS1pKk1hdGguc2luKHIpLGUqTWF0aC5zaW4ocikraSpNYXRoLmNvcyhyKV19ZnVuY3Rpb24gYSgpe2Zvcih2YXIgdD1bXSxyPTA7cjxhcmd1bWVudHMubGVuZ3RoO3IrKyl0W3JdPWFyZ3VtZW50c1tyXTtmb3IodmFyIGU9MDtlPHQubGVuZ3RoO2UrKylpZihcIm51bWJlclwiIT10eXBlb2YgdFtlXSl0aHJvdyBuZXcgRXJyb3IoXCJhc3NlcnROdW1iZXJzIGFyZ3VtZW50c1tcIitlK1wiXSBpcyBub3QgYSBudW1iZXIuIFwiK3R5cGVvZiB0W2VdK1wiID09IHR5cGVvZiBcIit0W2VdKTtyZXR1cm4hMH12YXIgbj1NYXRoLlBJO2Z1bmN0aW9uIG8odCxyLGUpe3QubEFyY0ZsYWc9MD09PXQubEFyY0ZsYWc/MDoxLHQuc3dlZXBGbGFnPTA9PT10LnN3ZWVwRmxhZz8wOjE7dmFyIGE9dC5yWCxvPXQuclkscz10LngsdT10Lnk7YT1NYXRoLmFicyh0LnJYKSxvPU1hdGguYWJzKHQuclkpO3ZhciBoPWkoWyhyLXMpLzIsKGUtdSkvMl0sLXQueFJvdC8xODAqbiksYz1oWzBdLHk9aFsxXSxwPU1hdGgucG93KGMsMikvTWF0aC5wb3coYSwyKStNYXRoLnBvdyh5LDIpL01hdGgucG93KG8sMik7MTxwJiYoYSo9TWF0aC5zcXJ0KHApLG8qPU1hdGguc3FydChwKSksdC5yWD1hLHQuclk9bzt2YXIgbT1NYXRoLnBvdyhhLDIpKk1hdGgucG93KHksMikrTWF0aC5wb3cobywyKSpNYXRoLnBvdyhjLDIpLE89KHQubEFyY0ZsYWchPT10LnN3ZWVwRmxhZz8xOi0xKSpNYXRoLnNxcnQoTWF0aC5tYXgoMCwoTWF0aC5wb3coYSwyKSpNYXRoLnBvdyhvLDIpLW0pL20pKSxsPWEqeS9vKk8sVD0tbypjL2EqTyx2PWkoW2wsVF0sdC54Um90LzE4MCpuKTt0LmNYPXZbMF0rKHIrcykvMix0LmNZPXZbMV0rKGUrdSkvMix0LnBoaTE9TWF0aC5hdGFuMigoeS1UKS9vLChjLWwpL2EpLHQucGhpMj1NYXRoLmF0YW4yKCgteS1UKS9vLCgtYy1sKS9hKSwwPT09dC5zd2VlcEZsYWcmJnQucGhpMj50LnBoaTEmJih0LnBoaTItPTIqbiksMT09PXQuc3dlZXBGbGFnJiZ0LnBoaTI8dC5waGkxJiYodC5waGkyKz0yKm4pLHQucGhpMSo9MTgwL24sdC5waGkyKj0xODAvbn1mdW5jdGlvbiBzKHQscixlKXthKHQscixlKTt2YXIgaT10KnQrcipyLWUqZTtpZigwPmkpcmV0dXJuW107aWYoMD09PWkpcmV0dXJuW1t0KmUvKHQqdCtyKnIpLHIqZS8odCp0K3IqcildXTt2YXIgbj1NYXRoLnNxcnQoaSk7cmV0dXJuW1sodCplK3IqbikvKHQqdCtyKnIpLChyKmUtdCpuKS8odCp0K3IqcildLFsodCplLXIqbikvKHQqdCtyKnIpLChyKmUrdCpuKS8odCp0K3IqcildXX12YXIgdSxoPU1hdGguUEkvMTgwO2Z1bmN0aW9uIGModCxyLGUpe3JldHVybigxLWUpKnQrZSpyfWZ1bmN0aW9uIHkodCxyLGUsaSl7cmV0dXJuIHQrTWF0aC5jb3MoaS8xODAqbikqcitNYXRoLnNpbihpLzE4MCpuKSplfWZ1bmN0aW9uIHAodCxyLGUsaSl7dmFyIGE9MWUtNixuPXItdCxvPWUtcixzPTMqbiszKihpLWUpLTYqbyx1PTYqKG8tbiksaD0zKm47cmV0dXJuIE1hdGguYWJzKHMpPGE/Wy1oL3VdOmZ1bmN0aW9uKHQscixlKXt2b2lkIDA9PT1lJiYoZT0xZS02KTt2YXIgaT10KnQvNC1yO2lmKGk8LWUpcmV0dXJuW107aWYoaTw9ZSlyZXR1cm5bLXQvMl07dmFyIGE9TWF0aC5zcXJ0KGkpO3JldHVyblstdC8yLWEsLXQvMithXX0odS9zLGgvcyxhKX1mdW5jdGlvbiBtKHQscixlLGksYSl7dmFyIG49MS1hO3JldHVybiB0KihuKm4qbikrciooMypuKm4qYSkrZSooMypuKmEqYSkraSooYSphKmEpfSFmdW5jdGlvbih0KXtmdW5jdGlvbiByKCl7cmV0dXJuIHUoKGZ1bmN0aW9uKHQscixlKXtyZXR1cm4gdC5yZWxhdGl2ZSYmKHZvaWQgMCE9PXQueDEmJih0LngxKz1yKSx2b2lkIDAhPT10LnkxJiYodC55MSs9ZSksdm9pZCAwIT09dC54MiYmKHQueDIrPXIpLHZvaWQgMCE9PXQueTImJih0LnkyKz1lKSx2b2lkIDAhPT10LngmJih0LngrPXIpLHZvaWQgMCE9PXQueSYmKHQueSs9ZSksdC5yZWxhdGl2ZT0hMSksdH0pKX1mdW5jdGlvbiBlKCl7dmFyIHQ9TmFOLHI9TmFOLGU9TmFOLGk9TmFOO3JldHVybiB1KChmdW5jdGlvbihhLG4sbyl7cmV0dXJuIGEudHlwZSZfLlNNT09USF9DVVJWRV9UTyYmKGEudHlwZT1fLkNVUlZFX1RPLHQ9aXNOYU4odCk/bjp0LHI9aXNOYU4ocik/bzpyLGEueDE9YS5yZWxhdGl2ZT9uLXQ6MipuLXQsYS55MT1hLnJlbGF0aXZlP28tcjoyKm8tciksYS50eXBlJl8uQ1VSVkVfVE8/KHQ9YS5yZWxhdGl2ZT9uK2EueDI6YS54MixyPWEucmVsYXRpdmU/bythLnkyOmEueTIpOih0PU5hTixyPU5hTiksYS50eXBlJl8uU01PT1RIX1FVQURfVE8mJihhLnR5cGU9Xy5RVUFEX1RPLGU9aXNOYU4oZSk/bjplLGk9aXNOYU4oaSk/bzppLGEueDE9YS5yZWxhdGl2ZT9uLWU6MipuLWUsYS55MT1hLnJlbGF0aXZlP28taToyKm8taSksYS50eXBlJl8uUVVBRF9UTz8oZT1hLnJlbGF0aXZlP24rYS54MTphLngxLGk9YS5yZWxhdGl2ZT9vK2EueTE6YS55MSk6KGU9TmFOLGk9TmFOKSxhfSkpfWZ1bmN0aW9uIG4oKXt2YXIgdD1OYU4scj1OYU47cmV0dXJuIHUoKGZ1bmN0aW9uKGUsaSxhKXtpZihlLnR5cGUmXy5TTU9PVEhfUVVBRF9UTyYmKGUudHlwZT1fLlFVQURfVE8sdD1pc05hTih0KT9pOnQscj1pc05hTihyKT9hOnIsZS54MT1lLnJlbGF0aXZlP2ktdDoyKmktdCxlLnkxPWUucmVsYXRpdmU/YS1yOjIqYS1yKSxlLnR5cGUmXy5RVUFEX1RPKXt0PWUucmVsYXRpdmU/aStlLngxOmUueDEscj1lLnJlbGF0aXZlP2ErZS55MTplLnkxO3ZhciBuPWUueDEsbz1lLnkxO2UudHlwZT1fLkNVUlZFX1RPLGUueDE9KChlLnJlbGF0aXZlPzA6aSkrMipuKS8zLGUueTE9KChlLnJlbGF0aXZlPzA6YSkrMipvKS8zLGUueDI9KGUueCsyKm4pLzMsZS55Mj0oZS55KzIqbykvM31lbHNlIHQ9TmFOLHI9TmFOO3JldHVybiBlfSkpfWZ1bmN0aW9uIHUodCl7dmFyIHI9MCxlPTAsaT1OYU4sYT1OYU47cmV0dXJuIGZ1bmN0aW9uKG4pe2lmKGlzTmFOKGkpJiYhKG4udHlwZSZfLk1PVkVfVE8pKXRocm93IG5ldyBFcnJvcihcInBhdGggbXVzdCBzdGFydCB3aXRoIG1vdmV0b1wiKTt2YXIgbz10KG4scixlLGksYSk7cmV0dXJuIG4udHlwZSZfLkNMT1NFX1BBVEgmJihyPWksZT1hKSx2b2lkIDAhPT1uLngmJihyPW4ucmVsYXRpdmU/cituLng6bi54KSx2b2lkIDAhPT1uLnkmJihlPW4ucmVsYXRpdmU/ZStuLnk6bi55KSxuLnR5cGUmXy5NT1ZFX1RPJiYoaT1yLGE9ZSksb319ZnVuY3Rpb24gTyh0LHIsZSxpLG4sbyl7cmV0dXJuIGEodCxyLGUsaSxuLG8pLHUoKGZ1bmN0aW9uKGEscyx1LGgpe3ZhciBjPWEueDEseT1hLngyLHA9YS5yZWxhdGl2ZSYmIWlzTmFOKGgpLG09dm9pZCAwIT09YS54P2EueDpwPzA6cyxPPXZvaWQgMCE9PWEueT9hLnk6cD8wOnU7ZnVuY3Rpb24gbCh0KXtyZXR1cm4gdCp0fWEudHlwZSZfLkhPUklaX0xJTkVfVE8mJjAhPT1yJiYoYS50eXBlPV8uTElORV9UTyxhLnk9YS5yZWxhdGl2ZT8wOnUpLGEudHlwZSZfLlZFUlRfTElORV9UTyYmMCE9PWUmJihhLnR5cGU9Xy5MSU5FX1RPLGEueD1hLnJlbGF0aXZlPzA6cyksdm9pZCAwIT09YS54JiYoYS54PWEueCp0K08qZSsocD8wOm4pKSx2b2lkIDAhPT1hLnkmJihhLnk9bSpyK2EueSppKyhwPzA6bykpLHZvaWQgMCE9PWEueDEmJihhLngxPWEueDEqdCthLnkxKmUrKHA/MDpuKSksdm9pZCAwIT09YS55MSYmKGEueTE9YypyK2EueTEqaSsocD8wOm8pKSx2b2lkIDAhPT1hLngyJiYoYS54Mj1hLngyKnQrYS55MiplKyhwPzA6bikpLHZvaWQgMCE9PWEueTImJihhLnkyPXkqcithLnkyKmkrKHA/MDpvKSk7dmFyIFQ9dCppLXIqZTtpZih2b2lkIDAhPT1hLnhSb3QmJigxIT09dHx8MCE9PXJ8fDAhPT1lfHwxIT09aSkpaWYoMD09PVQpZGVsZXRlIGEuclgsZGVsZXRlIGEuclksZGVsZXRlIGEueFJvdCxkZWxldGUgYS5sQXJjRmxhZyxkZWxldGUgYS5zd2VlcEZsYWcsYS50eXBlPV8uTElORV9UTztlbHNle3ZhciB2PWEueFJvdCpNYXRoLlBJLzE4MCxmPU1hdGguc2luKHYpLE49TWF0aC5jb3ModikseD0xL2woYS5yWCksZD0xL2woYS5yWSksRT1sKE4pKngrbChmKSpkLEE9MipmKk4qKHgtZCksQz1sKGYpKngrbChOKSpkLE09RSppKmktQSpyKmkrQypyKnIsUj1BKih0KmkrciplKS0yKihFKmUqaStDKnQqciksZz1FKmUqZS1BKnQqZStDKnQqdCxJPShNYXRoLmF0YW4yKFIsTS1nKStNYXRoLlBJKSVNYXRoLlBJLzIsUz1NYXRoLnNpbihJKSxMPU1hdGguY29zKEkpO2Euclg9TWF0aC5hYnMoVCkvTWF0aC5zcXJ0KE0qbChMKStSKlMqTCtnKmwoUykpLGEuclk9TWF0aC5hYnMoVCkvTWF0aC5zcXJ0KE0qbChTKS1SKlMqTCtnKmwoTCkpLGEueFJvdD0xODAqSS9NYXRoLlBJfXJldHVybiB2b2lkIDAhPT1hLnN3ZWVwRmxhZyYmMD5UJiYoYS5zd2VlcEZsYWc9KyFhLnN3ZWVwRmxhZyksYX0pKX1mdW5jdGlvbiBsKCl7cmV0dXJuIGZ1bmN0aW9uKHQpe3ZhciByPXt9O2Zvcih2YXIgZSBpbiB0KXJbZV09dFtlXTtyZXR1cm4gcn19dC5ST1VORD1mdW5jdGlvbih0KXtmdW5jdGlvbiByKHIpe3JldHVybiBNYXRoLnJvdW5kKHIqdCkvdH1yZXR1cm4gdm9pZCAwPT09dCYmKHQ9MWUxMyksYSh0KSxmdW5jdGlvbih0KXtyZXR1cm4gdm9pZCAwIT09dC54MSYmKHQueDE9cih0LngxKSksdm9pZCAwIT09dC55MSYmKHQueTE9cih0LnkxKSksdm9pZCAwIT09dC54MiYmKHQueDI9cih0LngyKSksdm9pZCAwIT09dC55MiYmKHQueTI9cih0LnkyKSksdm9pZCAwIT09dC54JiYodC54PXIodC54KSksdm9pZCAwIT09dC55JiYodC55PXIodC55KSksdm9pZCAwIT09dC5yWCYmKHQuclg9cih0LnJYKSksdm9pZCAwIT09dC5yWSYmKHQuclk9cih0LnJZKSksdH19LHQuVE9fQUJTPXIsdC5UT19SRUw9ZnVuY3Rpb24oKXtyZXR1cm4gdSgoZnVuY3Rpb24odCxyLGUpe3JldHVybiB0LnJlbGF0aXZlfHwodm9pZCAwIT09dC54MSYmKHQueDEtPXIpLHZvaWQgMCE9PXQueTEmJih0LnkxLT1lKSx2b2lkIDAhPT10LngyJiYodC54Mi09ciksdm9pZCAwIT09dC55MiYmKHQueTItPWUpLHZvaWQgMCE9PXQueCYmKHQueC09ciksdm9pZCAwIT09dC55JiYodC55LT1lKSx0LnJlbGF0aXZlPSEwKSx0fSkpfSx0Lk5PUk1BTElaRV9IVlo9ZnVuY3Rpb24odCxyLGUpe3JldHVybiB2b2lkIDA9PT10JiYodD0hMCksdm9pZCAwPT09ciYmKHI9ITApLHZvaWQgMD09PWUmJihlPSEwKSx1KChmdW5jdGlvbihpLGEsbixvLHMpe2lmKGlzTmFOKG8pJiYhKGkudHlwZSZfLk1PVkVfVE8pKXRocm93IG5ldyBFcnJvcihcInBhdGggbXVzdCBzdGFydCB3aXRoIG1vdmV0b1wiKTtyZXR1cm4gciYmaS50eXBlJl8uSE9SSVpfTElORV9UTyYmKGkudHlwZT1fLkxJTkVfVE8saS55PWkucmVsYXRpdmU/MDpuKSxlJiZpLnR5cGUmXy5WRVJUX0xJTkVfVE8mJihpLnR5cGU9Xy5MSU5FX1RPLGkueD1pLnJlbGF0aXZlPzA6YSksdCYmaS50eXBlJl8uQ0xPU0VfUEFUSCYmKGkudHlwZT1fLkxJTkVfVE8saS54PWkucmVsYXRpdmU/by1hOm8saS55PWkucmVsYXRpdmU/cy1uOnMpLGkudHlwZSZfLkFSQyYmKDA9PT1pLnJYfHwwPT09aS5yWSkmJihpLnR5cGU9Xy5MSU5FX1RPLGRlbGV0ZSBpLnJYLGRlbGV0ZSBpLnJZLGRlbGV0ZSBpLnhSb3QsZGVsZXRlIGkubEFyY0ZsYWcsZGVsZXRlIGkuc3dlZXBGbGFnKSxpfSkpfSx0Lk5PUk1BTElaRV9TVD1lLHQuUVRfVE9fQz1uLHQuSU5GTz11LHQuU0FOSVRJWkU9ZnVuY3Rpb24odCl7dm9pZCAwPT09dCYmKHQ9MCksYSh0KTt2YXIgcj1OYU4sZT1OYU4saT1OYU4sbj1OYU47cmV0dXJuIHUoKGZ1bmN0aW9uKGEsbyxzLHUsaCl7dmFyIGM9TWF0aC5hYnMseT0hMSxwPTAsbT0wO2lmKGEudHlwZSZfLlNNT09USF9DVVJWRV9UTyYmKHA9aXNOYU4ocik/MDpvLXIsbT1pc05hTihlKT8wOnMtZSksYS50eXBlJihfLkNVUlZFX1RPfF8uU01PT1RIX0NVUlZFX1RPKT8ocj1hLnJlbGF0aXZlP28rYS54MjphLngyLGU9YS5yZWxhdGl2ZT9zK2EueTI6YS55Mik6KHI9TmFOLGU9TmFOKSxhLnR5cGUmXy5TTU9PVEhfUVVBRF9UTz8oaT1pc05hTihpKT9vOjIqby1pLG49aXNOYU4obik/czoyKnMtbik6YS50eXBlJl8uUVVBRF9UTz8oaT1hLnJlbGF0aXZlP28rYS54MTphLngxLG49YS5yZWxhdGl2ZT9zK2EueTE6YS55Mik6KGk9TmFOLG49TmFOKSxhLnR5cGUmXy5MSU5FX0NPTU1BTkRTfHxhLnR5cGUmXy5BUkMmJigwPT09YS5yWHx8MD09PWEucll8fCFhLmxBcmNGbGFnKXx8YS50eXBlJl8uQ1VSVkVfVE98fGEudHlwZSZfLlNNT09USF9DVVJWRV9UT3x8YS50eXBlJl8uUVVBRF9UT3x8YS50eXBlJl8uU01PT1RIX1FVQURfVE8pe3ZhciBPPXZvaWQgMD09PWEueD8wOmEucmVsYXRpdmU/YS54OmEueC1vLGw9dm9pZCAwPT09YS55PzA6YS5yZWxhdGl2ZT9hLnk6YS55LXM7cD1pc05hTihpKT92b2lkIDA9PT1hLngxP3A6YS5yZWxhdGl2ZT9hLng6YS54MS1vOmktbyxtPWlzTmFOKG4pP3ZvaWQgMD09PWEueTE/bTphLnJlbGF0aXZlP2EueTphLnkxLXM6bi1zO3ZhciBUPXZvaWQgMD09PWEueDI/MDphLnJlbGF0aXZlP2EueDphLngyLW8sdj12b2lkIDA9PT1hLnkyPzA6YS5yZWxhdGl2ZT9hLnk6YS55Mi1zO2MoTyk8PXQmJmMobCk8PXQmJmMocCk8PXQmJmMobSk8PXQmJmMoVCk8PXQmJmModik8PXQmJih5PSEwKX1yZXR1cm4gYS50eXBlJl8uQ0xPU0VfUEFUSCYmYyhvLXUpPD10JiZjKHMtaCk8PXQmJih5PSEwKSx5P1tdOmF9KSl9LHQuTUFUUklYPU8sdC5ST1RBVEU9ZnVuY3Rpb24odCxyLGUpe3ZvaWQgMD09PXImJihyPTApLHZvaWQgMD09PWUmJihlPTApLGEodCxyLGUpO3ZhciBpPU1hdGguc2luKHQpLG49TWF0aC5jb3ModCk7cmV0dXJuIE8obixpLC1pLG4sci1yKm4rZSppLGUtcippLWUqbil9LHQuVFJBTlNMQVRFPWZ1bmN0aW9uKHQscil7cmV0dXJuIHZvaWQgMD09PXImJihyPTApLGEodCxyKSxPKDEsMCwwLDEsdCxyKX0sdC5TQ0FMRT1mdW5jdGlvbih0LHIpe3JldHVybiB2b2lkIDA9PT1yJiYocj10KSxhKHQsciksTyh0LDAsMCxyLDAsMCl9LHQuU0tFV19YPWZ1bmN0aW9uKHQpe3JldHVybiBhKHQpLE8oMSwwLE1hdGguYXRhbih0KSwxLDAsMCl9LHQuU0tFV19ZPWZ1bmN0aW9uKHQpe3JldHVybiBhKHQpLE8oMSxNYXRoLmF0YW4odCksMCwxLDAsMCl9LHQuWF9BWElTX1NZTU1FVFJZPWZ1bmN0aW9uKHQpe3JldHVybiB2b2lkIDA9PT10JiYodD0wKSxhKHQpLE8oLTEsMCwwLDEsdCwwKX0sdC5ZX0FYSVNfU1lNTUVUUlk9ZnVuY3Rpb24odCl7cmV0dXJuIHZvaWQgMD09PXQmJih0PTApLGEodCksTygxLDAsMCwtMSwwLHQpfSx0LkFfVE9fQz1mdW5jdGlvbigpe3JldHVybiB1KChmdW5jdGlvbih0LHIsZSl7cmV0dXJuIF8uQVJDPT09dC50eXBlP2Z1bmN0aW9uKHQscixlKXt2YXIgYSxuLHMsdTt0LmNYfHxvKHQscixlKTtmb3IodmFyIHk9TWF0aC5taW4odC5waGkxLHQucGhpMikscD1NYXRoLm1heCh0LnBoaTEsdC5waGkyKS15LG09TWF0aC5jZWlsKHAvOTApLE89bmV3IEFycmF5KG0pLGw9cixUPWUsdj0wO3Y8bTt2Kyspe3ZhciBmPWModC5waGkxLHQucGhpMix2L20pLE49Yyh0LnBoaTEsdC5waGkyLCh2KzEpL20pLHg9Ti1mLGQ9NC8zKk1hdGgudGFuKHgqaC80KSxFPVtNYXRoLmNvcyhmKmgpLWQqTWF0aC5zaW4oZipoKSxNYXRoLnNpbihmKmgpK2QqTWF0aC5jb3MoZipoKV0sQT1FWzBdLEM9RVsxXSxNPVtNYXRoLmNvcyhOKmgpLE1hdGguc2luKE4qaCldLFI9TVswXSxnPU1bMV0sST1bUitkKk1hdGguc2luKE4qaCksZy1kKk1hdGguY29zKE4qaCldLFM9SVswXSxMPUlbMV07T1t2XT17cmVsYXRpdmU6dC5yZWxhdGl2ZSx0eXBlOl8uQ1VSVkVfVE99O3ZhciBIPWZ1bmN0aW9uKHIsZSl7dmFyIGE9aShbcip0LnJYLGUqdC5yWV0sdC54Um90KSxuPWFbMF0sbz1hWzFdO3JldHVyblt0LmNYK24sdC5jWStvXX07YT1IKEEsQyksT1t2XS54MT1hWzBdLE9bdl0ueTE9YVsxXSxuPUgoUyxMKSxPW3ZdLngyPW5bMF0sT1t2XS55Mj1uWzFdLHM9SChSLGcpLE9bdl0ueD1zWzBdLE9bdl0ueT1zWzFdLHQucmVsYXRpdmUmJihPW3ZdLngxLT1sLE9bdl0ueTEtPVQsT1t2XS54Mi09bCxPW3ZdLnkyLT1ULE9bdl0ueC09bCxPW3ZdLnktPVQpLGw9KHU9W09bdl0ueCxPW3ZdLnldKVswXSxUPXVbMV19cmV0dXJuIE99KHQsdC5yZWxhdGl2ZT8wOnIsdC5yZWxhdGl2ZT8wOmUpOnR9KSl9LHQuQU5OT1RBVEVfQVJDUz1mdW5jdGlvbigpe3JldHVybiB1KChmdW5jdGlvbih0LHIsZSl7cmV0dXJuIHQucmVsYXRpdmUmJihyPTAsZT0wKSxfLkFSQz09PXQudHlwZSYmbyh0LHIsZSksdH0pKX0sdC5DTE9ORT1sLHQuQ0FMQ1VMQVRFX0JPVU5EUz1mdW5jdGlvbigpe3ZhciB0PWZ1bmN0aW9uKHQpe3ZhciByPXt9O2Zvcih2YXIgZSBpbiB0KXJbZV09dFtlXTtyZXR1cm4gcn0saT1yKCksYT1uKCksaD1lKCksYz11KChmdW5jdGlvbihyLGUsbil7dmFyIHU9aChhKGkodChyKSkpKTtmdW5jdGlvbiBPKHQpe3Q+Yy5tYXhYJiYoYy5tYXhYPXQpLHQ8Yy5taW5YJiYoYy5taW5YPXQpfWZ1bmN0aW9uIGwodCl7dD5jLm1heFkmJihjLm1heFk9dCksdDxjLm1pblkmJihjLm1pblk9dCl9aWYodS50eXBlJl8uRFJBV0lOR19DT01NQU5EUyYmKE8oZSksbChuKSksdS50eXBlJl8uSE9SSVpfTElORV9UTyYmTyh1LngpLHUudHlwZSZfLlZFUlRfTElORV9UTyYmbCh1LnkpLHUudHlwZSZfLkxJTkVfVE8mJihPKHUueCksbCh1LnkpKSx1LnR5cGUmXy5DVVJWRV9UTyl7Tyh1LngpLGwodS55KTtmb3IodmFyIFQ9MCx2PXAoZSx1LngxLHUueDIsdS54KTtUPHYubGVuZ3RoO1QrKyl7MDwodz12W1RdKSYmMT53JiZPKG0oZSx1LngxLHUueDIsdS54LHcpKX1mb3IodmFyIGY9MCxOPXAobix1LnkxLHUueTIsdS55KTtmPE4ubGVuZ3RoO2YrKyl7MDwodz1OW2ZdKSYmMT53JiZsKG0obix1LnkxLHUueTIsdS55LHcpKX19aWYodS50eXBlJl8uQVJDKXtPKHUueCksbCh1LnkpLG8odSxlLG4pO2Zvcih2YXIgeD11LnhSb3QvMTgwKk1hdGguUEksZD1NYXRoLmNvcyh4KSp1LnJYLEU9TWF0aC5zaW4oeCkqdS5yWCxBPS1NYXRoLnNpbih4KSp1LnJZLEM9TWF0aC5jb3MoeCkqdS5yWSxNPXUucGhpMTx1LnBoaTI/W3UucGhpMSx1LnBoaTJdOi0xODA+dS5waGkyP1t1LnBoaTIrMzYwLHUucGhpMSszNjBdOlt1LnBoaTIsdS5waGkxXSxSPU1bMF0sZz1NWzFdLEk9ZnVuY3Rpb24odCl7dmFyIHI9dFswXSxlPXRbMV0saT0xODAqTWF0aC5hdGFuMihlLHIpL01hdGguUEk7cmV0dXJuIGk8Uj9pKzM2MDppfSxTPTAsTD1zKEEsLWQsMCkubWFwKEkpO1M8TC5sZW5ndGg7UysrKXsodz1MW1NdKT5SJiZ3PGcmJk8oeSh1LmNYLGQsQSx3KSl9Zm9yKHZhciBIPTAsVT1zKEMsLUUsMCkubWFwKEkpO0g8VS5sZW5ndGg7SCsrKXt2YXIgdzsodz1VW0hdKT5SJiZ3PGcmJmwoeSh1LmNZLEUsQyx3KSl9fXJldHVybiByfSkpO3JldHVybiBjLm1pblg9MS8wLGMubWF4WD0tMS8wLGMubWluWT0xLzAsYy5tYXhZPS0xLzAsY319KHV8fCh1PXt9KSk7dmFyIE8sbD1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoKXt9cmV0dXJuIHQucHJvdG90eXBlLnJvdW5kPWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLnRyYW5zZm9ybSh1LlJPVU5EKHQpKX0sdC5wcm90b3R5cGUudG9BYnM9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy50cmFuc2Zvcm0odS5UT19BQlMoKSl9LHQucHJvdG90eXBlLnRvUmVsPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudHJhbnNmb3JtKHUuVE9fUkVMKCkpfSx0LnByb3RvdHlwZS5ub3JtYWxpemVIVlo9ZnVuY3Rpb24odCxyLGUpe3JldHVybiB0aGlzLnRyYW5zZm9ybSh1Lk5PUk1BTElaRV9IVloodCxyLGUpKX0sdC5wcm90b3R5cGUubm9ybWFsaXplU1Q9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy50cmFuc2Zvcm0odS5OT1JNQUxJWkVfU1QoKSl9LHQucHJvdG90eXBlLnF0VG9DPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudHJhbnNmb3JtKHUuUVRfVE9fQygpKX0sdC5wcm90b3R5cGUuYVRvQz1mdW5jdGlvbigpe3JldHVybiB0aGlzLnRyYW5zZm9ybSh1LkFfVE9fQygpKX0sdC5wcm90b3R5cGUuc2FuaXRpemU9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMudHJhbnNmb3JtKHUuU0FOSVRJWkUodCkpfSx0LnByb3RvdHlwZS50cmFuc2xhdGU9ZnVuY3Rpb24odCxyKXtyZXR1cm4gdGhpcy50cmFuc2Zvcm0odS5UUkFOU0xBVEUodCxyKSl9LHQucHJvdG90eXBlLnNjYWxlPWZ1bmN0aW9uKHQscil7cmV0dXJuIHRoaXMudHJhbnNmb3JtKHUuU0NBTEUodCxyKSl9LHQucHJvdG90eXBlLnJvdGF0ZT1mdW5jdGlvbih0LHIsZSl7cmV0dXJuIHRoaXMudHJhbnNmb3JtKHUuUk9UQVRFKHQscixlKSl9LHQucHJvdG90eXBlLm1hdHJpeD1mdW5jdGlvbih0LHIsZSxpLGEsbil7cmV0dXJuIHRoaXMudHJhbnNmb3JtKHUuTUFUUklYKHQscixlLGksYSxuKSl9LHQucHJvdG90eXBlLnNrZXdYPWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLnRyYW5zZm9ybSh1LlNLRVdfWCh0KSl9LHQucHJvdG90eXBlLnNrZXdZPWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLnRyYW5zZm9ybSh1LlNLRVdfWSh0KSl9LHQucHJvdG90eXBlLnhTeW1tZXRyeT1mdW5jdGlvbih0KXtyZXR1cm4gdGhpcy50cmFuc2Zvcm0odS5YX0FYSVNfU1lNTUVUUlkodCkpfSx0LnByb3RvdHlwZS55U3ltbWV0cnk9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMudHJhbnNmb3JtKHUuWV9BWElTX1NZTU1FVFJZKHQpKX0sdC5wcm90b3R5cGUuYW5ub3RhdGVBcmNzPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudHJhbnNmb3JtKHUuQU5OT1RBVEVfQVJDUygpKX0sdH0oKSxUPWZ1bmN0aW9uKHQpe3JldHVyblwiIFwiPT09dHx8XCJcXHRcIj09PXR8fFwiXFxyXCI9PT10fHxcIlxcblwiPT09dH0sdj1mdW5jdGlvbih0KXtyZXR1cm5cIjBcIi5jaGFyQ29kZUF0KDApPD10LmNoYXJDb2RlQXQoMCkmJnQuY2hhckNvZGVBdCgwKTw9XCI5XCIuY2hhckNvZGVBdCgwKX0sZj1mdW5jdGlvbih0KXtmdW5jdGlvbiBlKCl7dmFyIHI9dC5jYWxsKHRoaXMpfHx0aGlzO3JldHVybiByLmN1ck51bWJlcj1cIlwiLHIuY3VyQ29tbWFuZFR5cGU9LTEsci5jdXJDb21tYW5kUmVsYXRpdmU9ITEsci5jYW5QYXJzZUNvbW1hbmRPckNvbW1hPSEwLHIuY3VyTnVtYmVySGFzRXhwPSExLHIuY3VyTnVtYmVySGFzRXhwRGlnaXRzPSExLHIuY3VyTnVtYmVySGFzRGVjaW1hbD0hMSxyLmN1ckFyZ3M9W10scn1yZXR1cm4gcihlLHQpLGUucHJvdG90eXBlLmZpbmlzaD1mdW5jdGlvbih0KXtpZih2b2lkIDA9PT10JiYodD1bXSksdGhpcy5wYXJzZShcIiBcIix0KSwwIT09dGhpcy5jdXJBcmdzLmxlbmd0aHx8IXRoaXMuY2FuUGFyc2VDb21tYW5kT3JDb21tYSl0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJVbnRlcm1pbmF0ZWQgY29tbWFuZCBhdCB0aGUgcGF0aCBlbmQuXCIpO3JldHVybiB0fSxlLnByb3RvdHlwZS5wYXJzZT1mdW5jdGlvbih0LHIpe3ZhciBlPXRoaXM7dm9pZCAwPT09ciYmKHI9W10pO2Zvcih2YXIgaT1mdW5jdGlvbih0KXtyLnB1c2godCksZS5jdXJBcmdzLmxlbmd0aD0wLGUuY2FuUGFyc2VDb21tYW5kT3JDb21tYT0hMH0sYT0wO2E8dC5sZW5ndGg7YSsrKXt2YXIgbj10W2FdLG89ISh0aGlzLmN1ckNvbW1hbmRUeXBlIT09Xy5BUkN8fDMhPT10aGlzLmN1ckFyZ3MubGVuZ3RoJiY0IT09dGhpcy5jdXJBcmdzLmxlbmd0aHx8MSE9PXRoaXMuY3VyTnVtYmVyLmxlbmd0aHx8XCIwXCIhPT10aGlzLmN1ck51bWJlciYmXCIxXCIhPT10aGlzLmN1ck51bWJlcikscz12KG4pJiYoXCIwXCI9PT10aGlzLmN1ck51bWJlciYmXCIwXCI9PT1ufHxvKTtpZighdihuKXx8cylpZihcImVcIiE9PW4mJlwiRVwiIT09bilpZihcIi1cIiE9PW4mJlwiK1wiIT09bnx8IXRoaXMuY3VyTnVtYmVySGFzRXhwfHx0aGlzLmN1ck51bWJlckhhc0V4cERpZ2l0cylpZihcIi5cIiE9PW58fHRoaXMuY3VyTnVtYmVySGFzRXhwfHx0aGlzLmN1ck51bWJlckhhc0RlY2ltYWx8fG8pe2lmKHRoaXMuY3VyTnVtYmVyJiYtMSE9PXRoaXMuY3VyQ29tbWFuZFR5cGUpe3ZhciB1PU51bWJlcih0aGlzLmN1ck51bWJlcik7aWYoaXNOYU4odSkpdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiSW52YWxpZCBudW1iZXIgZW5kaW5nIGF0IFwiK2EpO2lmKHRoaXMuY3VyQ29tbWFuZFR5cGU9PT1fLkFSQylpZigwPT09dGhpcy5jdXJBcmdzLmxlbmd0aHx8MT09PXRoaXMuY3VyQXJncy5sZW5ndGgpe2lmKDA+dSl0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ0V4cGVjdGVkIHBvc2l0aXZlIG51bWJlciwgZ290IFwiJyt1KydcIiBhdCBpbmRleCBcIicrYSsnXCInKX1lbHNlIGlmKCgzPT09dGhpcy5jdXJBcmdzLmxlbmd0aHx8ND09PXRoaXMuY3VyQXJncy5sZW5ndGgpJiZcIjBcIiE9PXRoaXMuY3VyTnVtYmVyJiZcIjFcIiE9PXRoaXMuY3VyTnVtYmVyKXRocm93IG5ldyBTeW50YXhFcnJvcignRXhwZWN0ZWQgYSBmbGFnLCBnb3QgXCInK3RoaXMuY3VyTnVtYmVyKydcIiBhdCBpbmRleCBcIicrYSsnXCInKTt0aGlzLmN1ckFyZ3MucHVzaCh1KSx0aGlzLmN1ckFyZ3MubGVuZ3RoPT09Tlt0aGlzLmN1ckNvbW1hbmRUeXBlXSYmKF8uSE9SSVpfTElORV9UTz09PXRoaXMuY3VyQ29tbWFuZFR5cGU/aSh7dHlwZTpfLkhPUklaX0xJTkVfVE8scmVsYXRpdmU6dGhpcy5jdXJDb21tYW5kUmVsYXRpdmUseDp1fSk6Xy5WRVJUX0xJTkVfVE89PT10aGlzLmN1ckNvbW1hbmRUeXBlP2koe3R5cGU6Xy5WRVJUX0xJTkVfVE8scmVsYXRpdmU6dGhpcy5jdXJDb21tYW5kUmVsYXRpdmUseTp1fSk6dGhpcy5jdXJDb21tYW5kVHlwZT09PV8uTU9WRV9UT3x8dGhpcy5jdXJDb21tYW5kVHlwZT09PV8uTElORV9UT3x8dGhpcy5jdXJDb21tYW5kVHlwZT09PV8uU01PT1RIX1FVQURfVE8/KGkoe3R5cGU6dGhpcy5jdXJDb21tYW5kVHlwZSxyZWxhdGl2ZTp0aGlzLmN1ckNvbW1hbmRSZWxhdGl2ZSx4OnRoaXMuY3VyQXJnc1swXSx5OnRoaXMuY3VyQXJnc1sxXX0pLF8uTU9WRV9UTz09PXRoaXMuY3VyQ29tbWFuZFR5cGUmJih0aGlzLmN1ckNvbW1hbmRUeXBlPV8uTElORV9UTykpOnRoaXMuY3VyQ29tbWFuZFR5cGU9PT1fLkNVUlZFX1RPP2koe3R5cGU6Xy5DVVJWRV9UTyxyZWxhdGl2ZTp0aGlzLmN1ckNvbW1hbmRSZWxhdGl2ZSx4MTp0aGlzLmN1ckFyZ3NbMF0seTE6dGhpcy5jdXJBcmdzWzFdLHgyOnRoaXMuY3VyQXJnc1syXSx5Mjp0aGlzLmN1ckFyZ3NbM10seDp0aGlzLmN1ckFyZ3NbNF0seTp0aGlzLmN1ckFyZ3NbNV19KTp0aGlzLmN1ckNvbW1hbmRUeXBlPT09Xy5TTU9PVEhfQ1VSVkVfVE8/aSh7dHlwZTpfLlNNT09USF9DVVJWRV9UTyxyZWxhdGl2ZTp0aGlzLmN1ckNvbW1hbmRSZWxhdGl2ZSx4Mjp0aGlzLmN1ckFyZ3NbMF0seTI6dGhpcy5jdXJBcmdzWzFdLHg6dGhpcy5jdXJBcmdzWzJdLHk6dGhpcy5jdXJBcmdzWzNdfSk6dGhpcy5jdXJDb21tYW5kVHlwZT09PV8uUVVBRF9UTz9pKHt0eXBlOl8uUVVBRF9UTyxyZWxhdGl2ZTp0aGlzLmN1ckNvbW1hbmRSZWxhdGl2ZSx4MTp0aGlzLmN1ckFyZ3NbMF0seTE6dGhpcy5jdXJBcmdzWzFdLHg6dGhpcy5jdXJBcmdzWzJdLHk6dGhpcy5jdXJBcmdzWzNdfSk6dGhpcy5jdXJDb21tYW5kVHlwZT09PV8uQVJDJiZpKHt0eXBlOl8uQVJDLHJlbGF0aXZlOnRoaXMuY3VyQ29tbWFuZFJlbGF0aXZlLHJYOnRoaXMuY3VyQXJnc1swXSxyWTp0aGlzLmN1ckFyZ3NbMV0seFJvdDp0aGlzLmN1ckFyZ3NbMl0sbEFyY0ZsYWc6dGhpcy5jdXJBcmdzWzNdLHN3ZWVwRmxhZzp0aGlzLmN1ckFyZ3NbNF0seDp0aGlzLmN1ckFyZ3NbNV0seTp0aGlzLmN1ckFyZ3NbNl19KSksdGhpcy5jdXJOdW1iZXI9XCJcIix0aGlzLmN1ck51bWJlckhhc0V4cERpZ2l0cz0hMSx0aGlzLmN1ck51bWJlckhhc0V4cD0hMSx0aGlzLmN1ck51bWJlckhhc0RlY2ltYWw9ITEsdGhpcy5jYW5QYXJzZUNvbW1hbmRPckNvbW1hPSEwfWlmKCFUKG4pKWlmKFwiLFwiPT09biYmdGhpcy5jYW5QYXJzZUNvbW1hbmRPckNvbW1hKXRoaXMuY2FuUGFyc2VDb21tYW5kT3JDb21tYT0hMTtlbHNlIGlmKFwiK1wiIT09biYmXCItXCIhPT1uJiZcIi5cIiE9PW4paWYocyl0aGlzLmN1ck51bWJlcj1uLHRoaXMuY3VyTnVtYmVySGFzRGVjaW1hbD0hMTtlbHNle2lmKDAhPT10aGlzLmN1ckFyZ3MubGVuZ3RoKXRocm93IG5ldyBTeW50YXhFcnJvcihcIlVudGVybWluYXRlZCBjb21tYW5kIGF0IGluZGV4IFwiK2ErXCIuXCIpO2lmKCF0aGlzLmNhblBhcnNlQ29tbWFuZE9yQ29tbWEpdGhyb3cgbmV3IFN5bnRheEVycm9yKCdVbmV4cGVjdGVkIGNoYXJhY3RlciBcIicrbisnXCIgYXQgaW5kZXggJythK1wiLiBDb21tYW5kIGNhbm5vdCBmb2xsb3cgY29tbWFcIik7aWYodGhpcy5jYW5QYXJzZUNvbW1hbmRPckNvbW1hPSExLFwielwiIT09biYmXCJaXCIhPT1uKWlmKFwiaFwiPT09bnx8XCJIXCI9PT1uKXRoaXMuY3VyQ29tbWFuZFR5cGU9Xy5IT1JJWl9MSU5FX1RPLHRoaXMuY3VyQ29tbWFuZFJlbGF0aXZlPVwiaFwiPT09bjtlbHNlIGlmKFwidlwiPT09bnx8XCJWXCI9PT1uKXRoaXMuY3VyQ29tbWFuZFR5cGU9Xy5WRVJUX0xJTkVfVE8sdGhpcy5jdXJDb21tYW5kUmVsYXRpdmU9XCJ2XCI9PT1uO2Vsc2UgaWYoXCJtXCI9PT1ufHxcIk1cIj09PW4pdGhpcy5jdXJDb21tYW5kVHlwZT1fLk1PVkVfVE8sdGhpcy5jdXJDb21tYW5kUmVsYXRpdmU9XCJtXCI9PT1uO2Vsc2UgaWYoXCJsXCI9PT1ufHxcIkxcIj09PW4pdGhpcy5jdXJDb21tYW5kVHlwZT1fLkxJTkVfVE8sdGhpcy5jdXJDb21tYW5kUmVsYXRpdmU9XCJsXCI9PT1uO2Vsc2UgaWYoXCJjXCI9PT1ufHxcIkNcIj09PW4pdGhpcy5jdXJDb21tYW5kVHlwZT1fLkNVUlZFX1RPLHRoaXMuY3VyQ29tbWFuZFJlbGF0aXZlPVwiY1wiPT09bjtlbHNlIGlmKFwic1wiPT09bnx8XCJTXCI9PT1uKXRoaXMuY3VyQ29tbWFuZFR5cGU9Xy5TTU9PVEhfQ1VSVkVfVE8sdGhpcy5jdXJDb21tYW5kUmVsYXRpdmU9XCJzXCI9PT1uO2Vsc2UgaWYoXCJxXCI9PT1ufHxcIlFcIj09PW4pdGhpcy5jdXJDb21tYW5kVHlwZT1fLlFVQURfVE8sdGhpcy5jdXJDb21tYW5kUmVsYXRpdmU9XCJxXCI9PT1uO2Vsc2UgaWYoXCJ0XCI9PT1ufHxcIlRcIj09PW4pdGhpcy5jdXJDb21tYW5kVHlwZT1fLlNNT09USF9RVUFEX1RPLHRoaXMuY3VyQ29tbWFuZFJlbGF0aXZlPVwidFwiPT09bjtlbHNle2lmKFwiYVwiIT09biYmXCJBXCIhPT1uKXRocm93IG5ldyBTeW50YXhFcnJvcignVW5leHBlY3RlZCBjaGFyYWN0ZXIgXCInK24rJ1wiIGF0IGluZGV4ICcrYStcIi5cIik7dGhpcy5jdXJDb21tYW5kVHlwZT1fLkFSQyx0aGlzLmN1ckNvbW1hbmRSZWxhdGl2ZT1cImFcIj09PW59ZWxzZSByLnB1c2goe3R5cGU6Xy5DTE9TRV9QQVRIfSksdGhpcy5jYW5QYXJzZUNvbW1hbmRPckNvbW1hPSEwLHRoaXMuY3VyQ29tbWFuZFR5cGU9LTF9ZWxzZSB0aGlzLmN1ck51bWJlcj1uLHRoaXMuY3VyTnVtYmVySGFzRGVjaW1hbD1cIi5cIj09PW59ZWxzZSB0aGlzLmN1ck51bWJlcis9bix0aGlzLmN1ck51bWJlckhhc0RlY2ltYWw9ITA7ZWxzZSB0aGlzLmN1ck51bWJlcis9bjtlbHNlIHRoaXMuY3VyTnVtYmVyKz1uLHRoaXMuY3VyTnVtYmVySGFzRXhwPSEwO2Vsc2UgdGhpcy5jdXJOdW1iZXIrPW4sdGhpcy5jdXJOdW1iZXJIYXNFeHBEaWdpdHM9dGhpcy5jdXJOdW1iZXJIYXNFeHB9cmV0dXJuIHJ9LGUucHJvdG90eXBlLnRyYW5zZm9ybT1mdW5jdGlvbih0KXtyZXR1cm4gT2JqZWN0LmNyZWF0ZSh0aGlzLHtwYXJzZTp7dmFsdWU6ZnVuY3Rpb24ocixlKXt2b2lkIDA9PT1lJiYoZT1bXSk7Zm9yKHZhciBpPTAsYT1PYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykucGFyc2UuY2FsbCh0aGlzLHIpO2k8YS5sZW5ndGg7aSsrKXt2YXIgbj1hW2ldLG89dChuKTtBcnJheS5pc0FycmF5KG8pP2UucHVzaC5hcHBseShlLG8pOmUucHVzaChvKX1yZXR1cm4gZX19fSl9LGV9KGwpLF89ZnVuY3Rpb24odCl7ZnVuY3Rpb24gaShyKXt2YXIgZT10LmNhbGwodGhpcyl8fHRoaXM7cmV0dXJuIGUuY29tbWFuZHM9XCJzdHJpbmdcIj09dHlwZW9mIHI/aS5wYXJzZShyKTpyLGV9cmV0dXJuIHIoaSx0KSxpLnByb3RvdHlwZS5lbmNvZGU9ZnVuY3Rpb24oKXtyZXR1cm4gaS5lbmNvZGUodGhpcy5jb21tYW5kcyl9LGkucHJvdG90eXBlLmdldEJvdW5kcz1mdW5jdGlvbigpe3ZhciB0PXUuQ0FMQ1VMQVRFX0JPVU5EUygpO3JldHVybiB0aGlzLnRyYW5zZm9ybSh0KSx0fSxpLnByb3RvdHlwZS50cmFuc2Zvcm09ZnVuY3Rpb24odCl7Zm9yKHZhciByPVtdLGU9MCxpPXRoaXMuY29tbWFuZHM7ZTxpLmxlbmd0aDtlKyspe3ZhciBhPXQoaVtlXSk7QXJyYXkuaXNBcnJheShhKT9yLnB1c2guYXBwbHkocixhKTpyLnB1c2goYSl9cmV0dXJuIHRoaXMuY29tbWFuZHM9cix0aGlzfSxpLmVuY29kZT1mdW5jdGlvbih0KXtyZXR1cm4gZSh0KX0saS5wYXJzZT1mdW5jdGlvbih0KXt2YXIgcj1uZXcgZixlPVtdO3JldHVybiByLnBhcnNlKHQsZSksci5maW5pc2goZSksZX0saS5DTE9TRV9QQVRIPTEsaS5NT1ZFX1RPPTIsaS5IT1JJWl9MSU5FX1RPPTQsaS5WRVJUX0xJTkVfVE89OCxpLkxJTkVfVE89MTYsaS5DVVJWRV9UTz0zMixpLlNNT09USF9DVVJWRV9UTz02NCxpLlFVQURfVE89MTI4LGkuU01PT1RIX1FVQURfVE89MjU2LGkuQVJDPTUxMixpLkxJTkVfQ09NTUFORFM9aS5MSU5FX1RPfGkuSE9SSVpfTElORV9UT3xpLlZFUlRfTElORV9UTyxpLkRSQVdJTkdfQ09NTUFORFM9aS5IT1JJWl9MSU5FX1RPfGkuVkVSVF9MSU5FX1RPfGkuTElORV9UT3xpLkNVUlZFX1RPfGkuU01PT1RIX0NVUlZFX1RPfGkuUVVBRF9UT3xpLlNNT09USF9RVUFEX1RPfGkuQVJDLGl9KGwpLE49KChPPXt9KVtfLk1PVkVfVE9dPTIsT1tfLkxJTkVfVE9dPTIsT1tfLkhPUklaX0xJTkVfVE9dPTEsT1tfLlZFUlRfTElORV9UT109MSxPW18uQ0xPU0VfUEFUSF09MCxPW18uUVVBRF9UT109NCxPW18uU01PT1RIX1FVQURfVE9dPTIsT1tfLkNVUlZFX1RPXT02LE9bXy5TTU9PVEhfQ1VSVkVfVE9dPTQsT1tfLkFSQ109NyxPKTtleHBvcnR7TiBhcyBDT01NQU5EX0FSR19DT1VOVFMsXyBhcyBTVkdQYXRoRGF0YSxmIGFzIFNWR1BhdGhEYXRhUGFyc2VyLHUgYXMgU1ZHUGF0aERhdGFUcmFuc2Zvcm1lcixlIGFzIGVuY29kZVNWR1BhdGh9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9U1ZHUGF0aERhdGEubW9kdWxlLmpzLm1hcFxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9