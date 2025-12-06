"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[4865],{

/***/ 16069:
/***/ ((__unused_webpack_module, exports) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.qg = parse;
exports.lK = serialize;
/**
 * RegExp to match cookie-name in RFC 6265 sec 4.1.1
 * This refers out to the obsoleted definition of token in RFC 2616 sec 2.2
 * which has been replaced by the token definition in RFC 7230 appendix B.
 *
 * cookie-name       = token
 * token             = 1*tchar
 * tchar             = "!" / "#" / "$" / "%" / "&" / "'" /
 *                     "*" / "+" / "-" / "." / "^" / "_" /
 *                     "`" / "|" / "~" / DIGIT / ALPHA
 *
 * Note: Allowing more characters - https://github.com/jshttp/cookie/issues/191
 * Allow same range as cookie value, except `=`, which delimits end of name.
 */
const cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
/**
 * RegExp to match cookie-value in RFC 6265 sec 4.1.1
 *
 * cookie-value      = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
 * cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
 *                     ; US-ASCII characters excluding CTLs,
 *                     ; whitespace DQUOTE, comma, semicolon,
 *                     ; and backslash
 *
 * Allowing more characters: https://github.com/jshttp/cookie/issues/191
 * Comma, backslash, and DQUOTE are not part of the parsing algorithm.
 */
const cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
/**
 * RegExp to match domain-value in RFC 6265 sec 4.1.1
 *
 * domain-value      = <subdomain>
 *                     ; defined in [RFC1034], Section 3.5, as
 *                     ; enhanced by [RFC1123], Section 2.1
 * <subdomain>       = <label> | <subdomain> "." <label>
 * <label>           = <let-dig> [ [ <ldh-str> ] <let-dig> ]
 *                     Labels must be 63 characters or less.
 *                     'let-dig' not 'letter' in the first char, per RFC1123
 * <ldh-str>         = <let-dig-hyp> | <let-dig-hyp> <ldh-str>
 * <let-dig-hyp>     = <let-dig> | "-"
 * <let-dig>         = <letter> | <digit>
 * <letter>          = any one of the 52 alphabetic characters A through Z in
 *                     upper case and a through z in lower case
 * <digit>           = any one of the ten digits 0 through 9
 *
 * Keep support for leading dot: https://github.com/jshttp/cookie/issues/173
 *
 * > (Note that a leading %x2E ("."), if present, is ignored even though that
 * character is not permitted, but a trailing %x2E ("."), if present, will
 * cause the user agent to ignore the attribute.)
 */
const domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
/**
 * RegExp to match path-value in RFC 6265 sec 4.1.1
 *
 * path-value        = <any CHAR except CTLs or ";">
 * CHAR              = %x01-7F
 *                     ; defined in RFC 5234 appendix B.1
 */
const pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
const __toString = Object.prototype.toString;
const NullObject = /* @__PURE__ */ (() => {
    const C = function () { };
    C.prototype = Object.create(null);
    return C;
})();
/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 */
function parse(str, options) {
    const obj = new NullObject();
    const len = str.length;
    // RFC 6265 sec 4.1.1, RFC 2616 2.2 defines a cookie name consists of one char minimum, plus '='.
    if (len < 2)
        return obj;
    const dec = options?.decode || decode;
    let index = 0;
    do {
        const eqIdx = str.indexOf("=", index);
        if (eqIdx === -1)
            break; // No more cookie pairs.
        const colonIdx = str.indexOf(";", index);
        const endIdx = colonIdx === -1 ? len : colonIdx;
        if (eqIdx > endIdx) {
            // backtrack on prior semicolon
            index = str.lastIndexOf(";", eqIdx - 1) + 1;
            continue;
        }
        const keyStartIdx = startIndex(str, index, eqIdx);
        const keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
        const key = str.slice(keyStartIdx, keyEndIdx);
        // only assign once
        if (obj[key] === undefined) {
            let valStartIdx = startIndex(str, eqIdx + 1, endIdx);
            let valEndIdx = endIndex(str, endIdx, valStartIdx);
            const value = dec(str.slice(valStartIdx, valEndIdx));
            obj[key] = value;
        }
        index = endIdx + 1;
    } while (index < len);
    return obj;
}
function startIndex(str, index, max) {
    do {
        const code = str.charCodeAt(index);
        if (code !== 0x20 /*   */ && code !== 0x09 /* \t */)
            return index;
    } while (++index < max);
    return max;
}
function endIndex(str, index, min) {
    while (index > min) {
        const code = str.charCodeAt(--index);
        if (code !== 0x20 /*   */ && code !== 0x09 /* \t */)
            return index + 1;
    }
    return min;
}
/**
 * Serialize data into a cookie header.
 *
 * Serialize a name value pair into a cookie string suitable for
 * http headers. An optional options object specifies cookie parameters.
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 */
function serialize(name, val, options) {
    const enc = options?.encode || encodeURIComponent;
    if (!cookieNameRegExp.test(name)) {
        throw new TypeError(`argument name is invalid: ${name}`);
    }
    const value = enc(val);
    if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${val}`);
    }
    let str = name + "=" + value;
    if (!options)
        return str;
    if (options.maxAge !== undefined) {
        if (!Number.isInteger(options.maxAge)) {
            throw new TypeError(`option maxAge is invalid: ${options.maxAge}`);
        }
        str += "; Max-Age=" + options.maxAge;
    }
    if (options.domain) {
        if (!domainValueRegExp.test(options.domain)) {
            throw new TypeError(`option domain is invalid: ${options.domain}`);
        }
        str += "; Domain=" + options.domain;
    }
    if (options.path) {
        if (!pathValueRegExp.test(options.path)) {
            throw new TypeError(`option path is invalid: ${options.path}`);
        }
        str += "; Path=" + options.path;
    }
    if (options.expires) {
        if (!isDate(options.expires) ||
            !Number.isFinite(options.expires.valueOf())) {
            throw new TypeError(`option expires is invalid: ${options.expires}`);
        }
        str += "; Expires=" + options.expires.toUTCString();
    }
    if (options.httpOnly) {
        str += "; HttpOnly";
    }
    if (options.secure) {
        str += "; Secure";
    }
    if (options.partitioned) {
        str += "; Partitioned";
    }
    if (options.priority) {
        const priority = typeof options.priority === "string"
            ? options.priority.toLowerCase()
            : undefined;
        switch (priority) {
            case "low":
                str += "; Priority=Low";
                break;
            case "medium":
                str += "; Priority=Medium";
                break;
            case "high":
                str += "; Priority=High";
                break;
            default:
                throw new TypeError(`option priority is invalid: ${options.priority}`);
        }
    }
    if (options.sameSite) {
        const sameSite = typeof options.sameSite === "string"
            ? options.sameSite.toLowerCase()
            : options.sameSite;
        switch (sameSite) {
            case true:
            case "strict":
                str += "; SameSite=Strict";
                break;
            case "lax":
                str += "; SameSite=Lax";
                break;
            case "none":
                str += "; SameSite=None";
                break;
            default:
                throw new TypeError(`option sameSite is invalid: ${options.sameSite}`);
        }
    }
    return str;
}
/**
 * URL-decode string value. Optimized to skip native call when no %.
 */
function decode(str) {
    if (str.indexOf("%") === -1)
        return str;
    try {
        return decodeURIComponent(str);
    }
    catch (e) {
        return str;
    }
}
/**
 * Determine if value is a Date.
 */
function isDate(val) {
    return __toString.call(val) === "[object Date]";
}
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 29949:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Await: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.jD),
/* harmony export */   BrowserRouter: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.Kd),
/* harmony export */   Form: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.lV),
/* harmony export */   HashRouter: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.I9),
/* harmony export */   IDLE_BLOCKER: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.G3),
/* harmony export */   IDLE_FETCHER: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.HW),
/* harmony export */   IDLE_NAVIGATION: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.uD),
/* harmony export */   Link: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.N_),
/* harmony export */   Links: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.qF),
/* harmony export */   MemoryRouter: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.fS),
/* harmony export */   Meta: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.W8),
/* harmony export */   NavLink: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.k2),
/* harmony export */   Navigate: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.C5),
/* harmony export */   NavigationType: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.rc),
/* harmony export */   Outlet: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.sv),
/* harmony export */   PrefetchPageLinks: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.cM),
/* harmony export */   Route: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.qh),
/* harmony export */   Router: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.Ix),
/* harmony export */   RouterContextProvider: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.aB),
/* harmony export */   RouterProvider: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.pg),
/* harmony export */   Routes: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.BV),
/* harmony export */   Scripts: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.Tw),
/* harmony export */   ScrollRestoration: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.OA),
/* harmony export */   ServerRouter: () => (/* reexport safe */ _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__.Zz),
/* harmony export */   StaticRouter: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.kO),
/* harmony export */   StaticRouterProvider: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.je),
/* harmony export */   UNSAFE_AwaitContextProvider: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.$n),
/* harmony export */   UNSAFE_DataRouterContext: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.hf),
/* harmony export */   UNSAFE_DataRouterStateContext: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.ay),
/* harmony export */   UNSAFE_ErrorResponseImpl: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.cj),
/* harmony export */   UNSAFE_FetchersContext: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.QH),
/* harmony export */   UNSAFE_FrameworkContext: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.yL),
/* harmony export */   UNSAFE_LocationContext: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.di),
/* harmony export */   UNSAFE_NavigationContext: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__._3),
/* harmony export */   UNSAFE_RSCDefaultRootErrorBoundary: () => (/* reexport safe */ _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__.yq),
/* harmony export */   UNSAFE_RemixErrorBoundary: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.aJ),
/* harmony export */   UNSAFE_RouteContext: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.Pl),
/* harmony export */   UNSAFE_ServerMode: () => (/* reexport safe */ _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__.dC),
/* harmony export */   UNSAFE_SingleFetchRedirectSymbol: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.lR),
/* harmony export */   UNSAFE_ViewTransitionContext: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.KZ),
/* harmony export */   UNSAFE_WithComponentProps: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.Q2),
/* harmony export */   UNSAFE_WithErrorBoundaryProps: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.pp),
/* harmony export */   UNSAFE_WithHydrateFallbackProps: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.EB),
/* harmony export */   UNSAFE_createBrowserHistory: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.zR),
/* harmony export */   UNSAFE_createClientRoutes: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.qI),
/* harmony export */   UNSAFE_createClientRoutesWithHMRRevalidationOptOut: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.ou),
/* harmony export */   UNSAFE_createRouter: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.aE),
/* harmony export */   UNSAFE_decodeViaTurboStream: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.ht),
/* harmony export */   UNSAFE_deserializeErrors: () => (/* reexport safe */ _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__.lR),
/* harmony export */   UNSAFE_getHydrationData: () => (/* reexport safe */ _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__.Zd),
/* harmony export */   UNSAFE_getPatchRoutesOnNavigationFunction: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.Wj),
/* harmony export */   UNSAFE_getTurboStreamSingleFetchDataStrategy: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.aD),
/* harmony export */   UNSAFE_hydrationRouteProperties: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.jC),
/* harmony export */   UNSAFE_invariant: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.V1),
/* harmony export */   UNSAFE_mapRouteProperties: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.nW),
/* harmony export */   UNSAFE_shouldHydrateRouteLoader: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.vB),
/* harmony export */   UNSAFE_useFogOFWarDiscovery: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.p4),
/* harmony export */   UNSAFE_useScrollRestoration: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.RV),
/* harmony export */   UNSAFE_withComponentProps: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.ux),
/* harmony export */   UNSAFE_withErrorBoundaryProps: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.Vp),
/* harmony export */   UNSAFE_withHydrateFallbackProps: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.AX),
/* harmony export */   createBrowserRouter: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.Ys),
/* harmony export */   createContext: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.q6),
/* harmony export */   createCookie: () => (/* reexport safe */ _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__.n0),
/* harmony export */   createCookieSessionStorage: () => (/* reexport safe */ _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__.Y6),
/* harmony export */   createHashRouter: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.Ge),
/* harmony export */   createMemoryRouter: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.bg),
/* harmony export */   createMemorySessionStorage: () => (/* reexport safe */ _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__.Nb),
/* harmony export */   createPath: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.AO),
/* harmony export */   createRequestHandler: () => (/* reexport safe */ _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__.KB),
/* harmony export */   createRoutesFromChildren: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.AV),
/* harmony export */   createRoutesFromElements: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.Eu),
/* harmony export */   createRoutesStub: () => (/* reexport safe */ _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__.PY),
/* harmony export */   createSearchParams: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.PI),
/* harmony export */   createSession: () => (/* reexport safe */ _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__.jw),
/* harmony export */   createSessionStorage: () => (/* reexport safe */ _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__.yM),
/* harmony export */   createStaticHandler: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.xu),
/* harmony export */   createStaticRouter: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.KD),
/* harmony export */   data: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.p),
/* harmony export */   generatePath: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.tW),
/* harmony export */   href: () => (/* reexport safe */ _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__.UF),
/* harmony export */   isCookie: () => (/* reexport safe */ _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__.fm),
/* harmony export */   isRouteErrorResponse: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.pX),
/* harmony export */   isSession: () => (/* reexport safe */ _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__.lV),
/* harmony export */   matchPath: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.B6),
/* harmony export */   matchRoutes: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.ue),
/* harmony export */   parsePath: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.Rr),
/* harmony export */   redirect: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.V2),
/* harmony export */   redirectDocument: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.Sk),
/* harmony export */   renderMatches: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.KT),
/* harmony export */   replace: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.HC),
/* harmony export */   resolvePath: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.o1),
/* harmony export */   unstable_HistoryRouter: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.ks),
/* harmony export */   unstable_RSCStaticRouter: () => (/* reexport safe */ _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__.E3),
/* harmony export */   unstable_routeRSCServerRequest: () => (/* reexport safe */ _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__.C3),
/* harmony export */   unstable_setDevServerHooks: () => (/* reexport safe */ _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__.LQ),
/* harmony export */   unstable_usePrompt: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.kc),
/* harmony export */   unstable_useRoute: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.lq),
/* harmony export */   useActionData: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.mP),
/* harmony export */   useAsyncError: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.oI),
/* harmony export */   useAsyncValue: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.J8),
/* harmony export */   useBeforeUnload: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.K),
/* harmony export */   useBlocker: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.KP),
/* harmony export */   useFetcher: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.Ls),
/* harmony export */   useFetchers: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.SI),
/* harmony export */   useFormAction: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.g$),
/* harmony export */   useHref: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.$P),
/* harmony export */   useInRouterContext: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.Ri),
/* harmony export */   useLinkClickHandler: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.Gy),
/* harmony export */   useLoaderData: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.LG),
/* harmony export */   useLocation: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.zy),
/* harmony export */   useMatch: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.RQ),
/* harmony export */   useMatches: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.FE),
/* harmony export */   useNavigate: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.Zp),
/* harmony export */   useNavigation: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.cq),
/* harmony export */   useNavigationType: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.wQ),
/* harmony export */   useOutlet: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.P1),
/* harmony export */   useOutletContext: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.KC),
/* harmony export */   useParams: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.g),
/* harmony export */   useResolvedPath: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.x$),
/* harmony export */   useRevalidator: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.vL),
/* harmony export */   useRouteError: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.r5),
/* harmony export */   useRouteLoaderData: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.Ew),
/* harmony export */   useRoutes: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.Ye),
/* harmony export */   useSearchParams: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.ok),
/* harmony export */   useSubmit: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.of),
/* harmony export */   useViewTransitionState: () => (/* reexport safe */ _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__.PM)
/* harmony export */ });
/* harmony import */ var _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(85003);
/* harmony import */ var _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61526);
/**
 * react-router v7.9.5
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
"use client";





/***/ }),

/***/ 52600:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HydratedRouter: () => (/* binding */ HydratedRouter),
/* harmony export */   RouterProvider: () => (/* binding */ RouterProvider2),
/* harmony export */   unstable_RSCHydratedRouter: () => (/* binding */ RSCHydratedRouter),
/* harmony export */   unstable_createCallServer: () => (/* binding */ createCallServer),
/* harmony export */   unstable_getRSCStream: () => (/* binding */ getRSCStream)
/* harmony export */ });
/* harmony import */ var _chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(85003);
/* harmony import */ var _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61526);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(96540);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(40961);
/**
 * react-router v7.9.5
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
"use client";



// lib/dom-export/dom-router-provider.tsx


function RouterProvider2(props) {
  return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_2__.createElement(_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .RouterProvider */ .pg, { flushSync: react_dom__WEBPACK_IMPORTED_MODULE_3__.flushSync, ...props });
}

// lib/dom-export/hydrated-router.tsx

var ssrInfo = null;
var router = null;
function initSsrInfo() {
  if (!ssrInfo && window.__reactRouterContext && window.__reactRouterManifest && window.__reactRouterRouteModules) {
    if (window.__reactRouterManifest.sri === true) {
      const importMap = document.querySelector("script[rr-importmap]");
      if (importMap?.textContent) {
        try {
          window.__reactRouterManifest.sri = JSON.parse(
            importMap.textContent
          ).integrity;
        } catch (err) {
          console.error("Failed to parse import map", err);
        }
      }
    }
    ssrInfo = {
      context: window.__reactRouterContext,
      manifest: window.__reactRouterManifest,
      routeModules: window.__reactRouterRouteModules,
      stateDecodingPromise: void 0,
      router: void 0,
      routerInitialized: false
    };
  }
}
function createHydratedRouter({
  getContext,
  unstable_instrumentations
}) {
  initSsrInfo();
  if (!ssrInfo) {
    throw new Error(
      "You must be using the SSR features of React Router in order to skip passing a `router` prop to `<RouterProvider>`"
    );
  }
  let localSsrInfo = ssrInfo;
  if (!ssrInfo.stateDecodingPromise) {
    let stream = ssrInfo.context.stream;
    (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .invariant */ .V1)(stream, "No stream found for single fetch decoding");
    ssrInfo.context.stream = void 0;
    ssrInfo.stateDecodingPromise = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .decodeViaTurboStream */ .ht)(stream, window).then((value) => {
      ssrInfo.context.state = value.value;
      localSsrInfo.stateDecodingPromise.value = true;
    }).catch((e) => {
      localSsrInfo.stateDecodingPromise.error = e;
    });
  }
  if (ssrInfo.stateDecodingPromise.error) {
    throw ssrInfo.stateDecodingPromise.error;
  }
  if (!ssrInfo.stateDecodingPromise.value) {
    throw ssrInfo.stateDecodingPromise;
  }
  let routes = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .createClientRoutes */ .qI)(
    ssrInfo.manifest.routes,
    ssrInfo.routeModules,
    ssrInfo.context.state,
    ssrInfo.context.ssr,
    ssrInfo.context.isSpaMode
  );
  let hydrationData = void 0;
  if (ssrInfo.context.isSpaMode) {
    let { loaderData } = ssrInfo.context.state;
    if (ssrInfo.manifest.routes.root?.hasLoader && loaderData && "root" in loaderData) {
      hydrationData = {
        loaderData: {
          root: loaderData.root
        }
      };
    }
  } else {
    hydrationData = (0,_chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__/* .getHydrationData */ .Zd)({
      state: ssrInfo.context.state,
      routes,
      getRouteInfo: (routeId) => ({
        clientLoader: ssrInfo.routeModules[routeId]?.clientLoader,
        hasLoader: ssrInfo.manifest.routes[routeId]?.hasLoader === true,
        hasHydrateFallback: ssrInfo.routeModules[routeId]?.HydrateFallback != null
      }),
      location: window.location,
      basename: window.__reactRouterContext?.basename,
      isSpaMode: ssrInfo.context.isSpaMode
    });
    if (hydrationData && hydrationData.errors) {
      hydrationData.errors = (0,_chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__/* .deserializeErrors */ .lR)(hydrationData.errors);
    }
  }
  let router2 = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .createRouter */ .aE)({
    routes,
    history: (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .createBrowserHistory */ .zR)(),
    basename: ssrInfo.context.basename,
    getContext,
    hydrationData,
    hydrationRouteProperties: _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .hydrationRouteProperties */ .jC,
    unstable_instrumentations,
    mapRouteProperties: _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .mapRouteProperties */ .nW,
    future: {
      middleware: ssrInfo.context.future.v8_middleware
    },
    dataStrategy: (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .getTurboStreamSingleFetchDataStrategy */ .aD)(
      () => router2,
      ssrInfo.manifest,
      ssrInfo.routeModules,
      ssrInfo.context.ssr,
      ssrInfo.context.basename
    ),
    patchRoutesOnNavigation: (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .getPatchRoutesOnNavigationFunction */ .Wj)(
      ssrInfo.manifest,
      ssrInfo.routeModules,
      ssrInfo.context.ssr,
      ssrInfo.context.routeDiscovery,
      ssrInfo.context.isSpaMode,
      ssrInfo.context.basename
    )
  });
  ssrInfo.router = router2;
  if (router2.state.initialized) {
    ssrInfo.routerInitialized = true;
    router2.initialize();
  }
  router2.createRoutesForHMR = /* spacer so ts-ignore does not affect the right hand of the assignment */
  _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .createClientRoutesWithHMRRevalidationOptOut */ .ou;
  window.__reactRouterDataRouter = router2;
  return router2;
}
function HydratedRouter(props) {
  if (!router) {
    router = createHydratedRouter({
      getContext: props.getContext,
      unstable_instrumentations: props.unstable_instrumentations
    });
  }
  let [criticalCss, setCriticalCss] = react__WEBPACK_IMPORTED_MODULE_2__.useState(
     true ? ssrInfo?.context.criticalCss : 0
  );
  react__WEBPACK_IMPORTED_MODULE_2__.useEffect(() => {
    if (true) {
      setCriticalCss(void 0);
    }
  }, []);
  react__WEBPACK_IMPORTED_MODULE_2__.useEffect(() => {
    if ( true && criticalCss === void 0) {
      document.querySelectorAll(`[${_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .CRITICAL_CSS_DATA_ATTRIBUTE */ .u7}]`).forEach((element) => element.remove());
    }
  }, [criticalCss]);
  let [location2, setLocation] = react__WEBPACK_IMPORTED_MODULE_2__.useState(router.state.location);
  react__WEBPACK_IMPORTED_MODULE_2__.useLayoutEffect(() => {
    if (ssrInfo && ssrInfo.router && !ssrInfo.routerInitialized) {
      ssrInfo.routerInitialized = true;
      ssrInfo.router.initialize();
    }
  }, []);
  react__WEBPACK_IMPORTED_MODULE_2__.useLayoutEffect(() => {
    if (ssrInfo && ssrInfo.router) {
      return ssrInfo.router.subscribe((newState) => {
        if (newState.location !== location2) {
          setLocation(newState.location);
        }
      });
    }
  }, [location2]);
  (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .invariant */ .V1)(ssrInfo, "ssrInfo unavailable for HydratedRouter");
  (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .useFogOFWarDiscovery */ .p4)(
    router,
    ssrInfo.manifest,
    ssrInfo.routeModules,
    ssrInfo.context.ssr,
    ssrInfo.context.routeDiscovery,
    ssrInfo.context.isSpaMode
  );
  return (
    // This fragment is important to ensure we match the <ServerRouter> JSX
    // structure so that useId values hydrate correctly
    /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_2__.createElement(react__WEBPACK_IMPORTED_MODULE_2__.Fragment, null, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_2__.createElement(
      _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .FrameworkContext */ .yL.Provider,
      {
        value: {
          manifest: ssrInfo.manifest,
          routeModules: ssrInfo.routeModules,
          future: ssrInfo.context.future,
          criticalCss,
          ssr: ssrInfo.context.ssr,
          isSpaMode: ssrInfo.context.isSpaMode,
          routeDiscovery: ssrInfo.context.routeDiscovery
        }
      },
      /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_2__.createElement(_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .RemixErrorBoundary */ .aJ, { location: location2 }, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_2__.createElement(
        RouterProvider2,
        {
          router,
          unstable_onError: props.unstable_onError
        }
      ))
    ), /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_2__.createElement(react__WEBPACK_IMPORTED_MODULE_2__.Fragment, null))
  );
}

// lib/rsc/browser.tsx


function createCallServer({
  createFromReadableStream,
  createTemporaryReferenceSet,
  encodeReply,
  fetch: fetchImplementation = fetch
}) {
  const globalVar = window;
  let landedActionId = 0;
  return async (id, args) => {
    let actionId = globalVar.__routerActionID = (globalVar.__routerActionID ?? (globalVar.__routerActionID = 0)) + 1;
    const temporaryReferences = createTemporaryReferenceSet();
    const payloadPromise = fetchImplementation(
      new Request(location.href, {
        body: await encodeReply(args, { temporaryReferences }),
        method: "POST",
        headers: {
          Accept: "text/x-component",
          "rsc-action-id": id
        }
      })
    ).then((response) => {
      if (!response.body) {
        throw new Error("No response body");
      }
      return createFromReadableStream(response.body, {
        temporaryReferences
      });
    });
    globalVar.__reactRouterDataRouter.__setPendingRerender(
      Promise.resolve(payloadPromise).then(async (payload) => {
        if (payload.type === "redirect") {
          if (payload.reload || isExternalLocation(payload.location)) {
            window.location.href = payload.location;
            return () => {
            };
          }
          return () => {
            globalVar.__reactRouterDataRouter.navigate(payload.location, {
              replace: payload.replace
            });
          };
        }
        if (payload.type !== "action") {
          throw new Error("Unexpected payload type");
        }
        const rerender = await payload.rerender;
        if (rerender && landedActionId < actionId && globalVar.__routerActionID <= actionId) {
          if (rerender.type === "redirect") {
            if (rerender.reload || isExternalLocation(rerender.location)) {
              window.location.href = rerender.location;
              return;
            }
            return () => {
              globalVar.__reactRouterDataRouter.navigate(rerender.location, {
                replace: rerender.replace
              });
            };
          }
          return () => {
            let lastMatch;
            for (const match of rerender.matches) {
              globalVar.__reactRouterDataRouter.patchRoutes(
                lastMatch?.id ?? null,
                [createRouteFromServerManifest(match)],
                true
              );
              lastMatch = match;
            }
            window.__reactRouterDataRouter._internalSetStateDoNotUseOrYouWillBreakYourApp(
              {
                loaderData: Object.assign(
                  {},
                  globalVar.__reactRouterDataRouter.state.loaderData,
                  rerender.loaderData
                ),
                errors: rerender.errors ? Object.assign(
                  {},
                  globalVar.__reactRouterDataRouter.state.errors,
                  rerender.errors
                ) : null
              }
            );
          };
        }
        return () => {
        };
      }).catch(() => {
      })
    );
    return payloadPromise.then((payload) => {
      if (payload.type !== "action" && payload.type !== "redirect") {
        throw new Error("Unexpected payload type");
      }
      return payload.actionResult;
    });
  };
}
function createRouterFromPayload({
  fetchImplementation,
  createFromReadableStream,
  getContext,
  payload
}) {
  const globalVar = window;
  if (globalVar.__reactRouterDataRouter && globalVar.__reactRouterRouteModules)
    return {
      router: globalVar.__reactRouterDataRouter,
      routeModules: globalVar.__reactRouterRouteModules
    };
  if (payload.type !== "render") throw new Error("Invalid payload type");
  globalVar.__reactRouterRouteModules = globalVar.__reactRouterRouteModules ?? {};
  (0,_chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__/* .populateRSCRouteModules */ .Vv)(globalVar.__reactRouterRouteModules, payload.matches);
  let patches = /* @__PURE__ */ new Map();
  payload.patches?.forEach((patch) => {
    (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .invariant */ .V1)(patch.parentId, "Invalid patch parentId");
    if (!patches.has(patch.parentId)) {
      patches.set(patch.parentId, []);
    }
    patches.get(patch.parentId)?.push(patch);
  });
  let routes = payload.matches.reduceRight((previous, match) => {
    const route = createRouteFromServerManifest(
      match,
      payload
    );
    if (previous.length > 0) {
      route.children = previous;
      let childrenToPatch = patches.get(match.id);
      if (childrenToPatch) {
        route.children.push(
          ...childrenToPatch.map((r) => createRouteFromServerManifest(r))
        );
      }
    }
    return [route];
  }, []);
  globalVar.__reactRouterDataRouter = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .createRouter */ .aE)({
    routes,
    getContext,
    basename: payload.basename,
    history: (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .createBrowserHistory */ .zR)(),
    hydrationData: (0,_chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__/* .getHydrationData */ .Zd)({
      state: {
        loaderData: payload.loaderData,
        actionData: payload.actionData,
        errors: payload.errors
      },
      routes,
      getRouteInfo: (routeId) => {
        let match = payload.matches.find((m) => m.id === routeId);
        (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .invariant */ .V1)(match, "Route not found in payload");
        return {
          clientLoader: match.clientLoader,
          hasLoader: match.hasLoader,
          hasHydrateFallback: match.hydrateFallbackElement != null
        };
      },
      location: payload.location,
      basename: payload.basename,
      isSpaMode: false
    }),
    async patchRoutesOnNavigation({ path, signal }) {
      if (discoveredPaths.has(path)) {
        return;
      }
      await fetchAndApplyManifestPatches(
        [path],
        createFromReadableStream,
        fetchImplementation,
        signal
      );
    },
    // FIXME: Pass `build.ssr` into this function
    dataStrategy: getRSCSingleFetchDataStrategy(
      () => globalVar.__reactRouterDataRouter,
      true,
      payload.basename,
      createFromReadableStream,
      fetchImplementation
    )
  });
  if (globalVar.__reactRouterDataRouter.state.initialized) {
    globalVar.__routerInitialized = true;
    globalVar.__reactRouterDataRouter.initialize();
  } else {
    globalVar.__routerInitialized = false;
  }
  let lastLoaderData = void 0;
  globalVar.__reactRouterDataRouter.subscribe(({ loaderData, actionData }) => {
    if (lastLoaderData !== loaderData) {
      globalVar.__routerActionID = (globalVar.__routerActionID ?? (globalVar.__routerActionID = 0)) + 1;
    }
  });
  globalVar.__reactRouterDataRouter._updateRoutesForHMR = (routeUpdateByRouteId) => {
    const oldRoutes = window.__reactRouterDataRouter.routes;
    const newRoutes = [];
    function walkRoutes(routes2, parentId) {
      return routes2.map((route) => {
        const routeUpdate = routeUpdateByRouteId.get(route.id);
        if (routeUpdate) {
          const {
            routeModule,
            hasAction,
            hasComponent,
            hasErrorBoundary,
            hasLoader
          } = routeUpdate;
          const newRoute = createRouteFromServerManifest({
            clientAction: routeModule.clientAction,
            clientLoader: routeModule.clientLoader,
            element: route.element,
            errorElement: route.errorElement,
            handle: route.handle,
            hasAction,
            hasComponent,
            hasErrorBoundary,
            hasLoader,
            hydrateFallbackElement: route.hydrateFallbackElement,
            id: route.id,
            index: route.index,
            links: routeModule.links,
            meta: routeModule.meta,
            parentId,
            path: route.path,
            shouldRevalidate: routeModule.shouldRevalidate
          });
          if (route.children) {
            newRoute.children = walkRoutes(route.children, route.id);
          }
          return newRoute;
        }
        const updatedRoute = { ...route };
        if (route.children) {
          updatedRoute.children = walkRoutes(route.children, route.id);
        }
        return updatedRoute;
      });
    }
    newRoutes.push(
      ...walkRoutes(oldRoutes, void 0)
    );
    window.__reactRouterDataRouter._internalSetRoutes(newRoutes);
  };
  return {
    router: globalVar.__reactRouterDataRouter,
    routeModules: globalVar.__reactRouterRouteModules
  };
}
var renderedRoutesContext = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .createContext */ .q6)();
function getRSCSingleFetchDataStrategy(getRouter, ssr, basename, createFromReadableStream, fetchImplementation) {
  let dataStrategy = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .getSingleFetchDataStrategyImpl */ .gQ)(
    getRouter,
    (match) => {
      let M = match;
      return {
        hasLoader: M.route.hasLoader,
        hasClientLoader: M.route.hasClientLoader,
        hasComponent: M.route.hasComponent,
        hasAction: M.route.hasAction,
        hasClientAction: M.route.hasClientAction,
        hasShouldRevalidate: M.route.hasShouldRevalidate
      };
    },
    // pass map into fetchAndDecode so it can add payloads
    getFetchAndDecodeViaRSC(createFromReadableStream, fetchImplementation),
    ssr,
    basename,
    // If the route has a component but we don't have an element, we need to hit
    // the server loader flow regardless of whether the client loader calls
    // `serverLoader` or not, otherwise we'll have nothing to render.
    (match) => {
      let M = match;
      return M.route.hasComponent && !M.route.element;
    }
  );
  return async (args) => args.runClientMiddleware(async () => {
    let context = args.context;
    context.set(renderedRoutesContext, []);
    let results = await dataStrategy(args);
    const renderedRoutesById = /* @__PURE__ */ new Map();
    for (const route of context.get(renderedRoutesContext)) {
      if (!renderedRoutesById.has(route.id)) {
        renderedRoutesById.set(route.id, []);
      }
      renderedRoutesById.get(route.id).push(route);
    }
    for (const match of args.matches) {
      const renderedRoutes = renderedRoutesById.get(match.route.id);
      if (renderedRoutes) {
        for (const rendered of renderedRoutes) {
          window.__reactRouterDataRouter.patchRoutes(
            rendered.parentId ?? null,
            [createRouteFromServerManifest(rendered)],
            true
          );
        }
      }
    }
    return results;
  });
}
function getFetchAndDecodeViaRSC(createFromReadableStream, fetchImplementation) {
  return async (args, basename, targetRoutes) => {
    let { request, context } = args;
    let url = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .singleFetchUrl */ .MF)(request.url, basename, "rsc");
    if (request.method === "GET") {
      url = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .stripIndexParam */ .Qd)(url);
      if (targetRoutes) {
        url.searchParams.set("_routes", targetRoutes.join(","));
      }
    }
    let res = await fetchImplementation(
      new Request(url, await (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .createRequestInit */ .Ul)(request))
    );
    if (res.status >= 400 && !res.headers.has("X-Remix-Response")) {
      throw new _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .ErrorResponseImpl */ .cj(res.status, res.statusText, await res.text());
    }
    (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .invariant */ .V1)(res.body, "No response body to decode");
    try {
      const payload = await createFromReadableStream(res.body, {
        temporaryReferences: void 0
      });
      if (payload.type === "redirect") {
        return {
          status: res.status,
          data: {
            redirect: {
              redirect: payload.location,
              reload: payload.reload,
              replace: payload.replace,
              revalidate: false,
              status: payload.status
            }
          }
        };
      }
      if (payload.type !== "render") {
        throw new Error("Unexpected payload type");
      }
      context.get(renderedRoutesContext).push(...payload.matches);
      let results = { routes: {} };
      const dataKey = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .isMutationMethod */ .jM)(request.method) ? "actionData" : "loaderData";
      for (let [routeId, data] of Object.entries(payload[dataKey] || {})) {
        results.routes[routeId] = { data };
      }
      if (payload.errors) {
        for (let [routeId, error] of Object.entries(payload.errors)) {
          results.routes[routeId] = { error };
        }
      }
      return { status: res.status, data: results };
    } catch (e) {
      throw new Error("Unable to decode RSC response");
    }
  };
}
function RSCHydratedRouter({
  createFromReadableStream,
  fetch: fetchImplementation = fetch,
  payload,
  routeDiscovery = "eager",
  getContext
}) {
  if (payload.type !== "render") throw new Error("Invalid payload type");
  let { router: router2, routeModules } = react__WEBPACK_IMPORTED_MODULE_2__.useMemo(
    () => createRouterFromPayload({
      payload,
      fetchImplementation,
      getContext,
      createFromReadableStream
    }),
    [createFromReadableStream, payload, fetchImplementation, getContext]
  );
  react__WEBPACK_IMPORTED_MODULE_2__.useEffect(() => {
    (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .setIsHydrated */ .q9)();
  }, []);
  react__WEBPACK_IMPORTED_MODULE_2__.useLayoutEffect(() => {
    const globalVar = window;
    if (!globalVar.__routerInitialized) {
      globalVar.__routerInitialized = true;
      globalVar.__reactRouterDataRouter.initialize();
    }
  }, []);
  let [location2, setLocation] = react__WEBPACK_IMPORTED_MODULE_2__.useState(router2.state.location);
  react__WEBPACK_IMPORTED_MODULE_2__.useLayoutEffect(
    () => router2.subscribe((newState) => {
      if (newState.location !== location2) {
        setLocation(newState.location);
      }
    }),
    [router2, location2]
  );
  react__WEBPACK_IMPORTED_MODULE_2__.useEffect(() => {
    if (routeDiscovery === "lazy" || // @ts-expect-error - TS doesn't know about this yet
    window.navigator?.connection?.saveData === true) {
      return;
    }
    function registerElement(el) {
      let path = el.tagName === "FORM" ? el.getAttribute("action") : el.getAttribute("href");
      if (!path) {
        return;
      }
      let pathname = el.tagName === "A" ? el.pathname : new URL(path, window.location.origin).pathname;
      if (!discoveredPaths.has(pathname)) {
        nextPaths.add(pathname);
      }
    }
    async function fetchPatches() {
      document.querySelectorAll("a[data-discover], form[data-discover]").forEach(registerElement);
      let paths = Array.from(nextPaths.keys()).filter((path) => {
        if (discoveredPaths.has(path)) {
          nextPaths.delete(path);
          return false;
        }
        return true;
      });
      if (paths.length === 0) {
        return;
      }
      try {
        await fetchAndApplyManifestPatches(
          paths,
          createFromReadableStream,
          fetchImplementation
        );
      } catch (e) {
        console.error("Failed to fetch manifest patches", e);
      }
    }
    let debouncedFetchPatches = debounce(fetchPatches, 100);
    fetchPatches();
    let observer = new MutationObserver(() => debouncedFetchPatches());
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-discover", "href", "action"]
    });
  }, [routeDiscovery, createFromReadableStream, fetchImplementation]);
  const frameworkContext = {
    future: {
      // These flags have no runtime impact so can always be false.  If we add
      // flags that drive runtime behavior they'll need to be proxied through.
      v8_middleware: false,
      unstable_subResourceIntegrity: false
    },
    isSpaMode: false,
    ssr: true,
    criticalCss: "",
    manifest: {
      routes: {},
      version: "1",
      url: "",
      entry: {
        module: "",
        imports: []
      }
    },
    routeDiscovery: { mode: "lazy", manifestPath: "/__manifest" },
    routeModules
  };
  return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_2__.createElement(_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .RSCRouterContext */ .Bu.Provider, { value: true }, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_2__.createElement(_chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__/* .RSCRouterGlobalErrorBoundary */ .ZJ, { location: location2 }, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_2__.createElement(_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .FrameworkContext */ .yL.Provider, { value: frameworkContext }, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_2__.createElement(_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .UNSTABLE_TransitionEnabledRouterProvider */ .Wt, { router: router2, flushSync: react_dom__WEBPACK_IMPORTED_MODULE_3__.flushSync }))));
}
function createRouteFromServerManifest(match, payload) {
  let hasInitialData = payload && match.id in payload.loaderData;
  let initialData = payload?.loaderData[match.id];
  let hasInitialError = payload?.errors && match.id in payload.errors;
  let initialError = payload?.errors?.[match.id];
  let isHydrationRequest = match.clientLoader?.hydrate === true || !match.hasLoader || // If the route has a component but we don't have an element, we need to hit
  // the server loader flow regardless of whether the client loader calls
  // `serverLoader` or not, otherwise we'll have nothing to render.
  match.hasComponent && !match.element;
  (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .invariant */ .V1)(window.__reactRouterRouteModules);
  (0,_chunk_JG3XND5A_mjs__WEBPACK_IMPORTED_MODULE_0__/* .populateRSCRouteModules */ .Vv)(window.__reactRouterRouteModules, match);
  let dataRoute = {
    id: match.id,
    element: match.element,
    errorElement: match.errorElement,
    handle: match.handle,
    hasErrorBoundary: match.hasErrorBoundary,
    hydrateFallbackElement: match.hydrateFallbackElement,
    index: match.index,
    loader: match.clientLoader ? async (args, singleFetch) => {
      try {
        let result = await match.clientLoader({
          ...args,
          serverLoader: () => {
            preventInvalidServerHandlerCall(
              "loader",
              match.id,
              match.hasLoader
            );
            if (isHydrationRequest) {
              if (hasInitialData) {
                return initialData;
              }
              if (hasInitialError) {
                throw initialError;
              }
            }
            return callSingleFetch(singleFetch);
          }
        });
        return result;
      } finally {
        isHydrationRequest = false;
      }
    } : (
      // We always make the call in this RSC world since even if we don't
      // have a `loader` we may need to get the `element` implementation
      (_, singleFetch) => callSingleFetch(singleFetch)
    ),
    action: match.clientAction ? (args, singleFetch) => match.clientAction({
      ...args,
      serverAction: async () => {
        preventInvalidServerHandlerCall(
          "action",
          match.id,
          match.hasLoader
        );
        return await callSingleFetch(singleFetch);
      }
    }) : match.hasAction ? (_, singleFetch) => callSingleFetch(singleFetch) : () => {
      throw (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .noActionDefinedError */ .hA)("action", match.id);
    },
    path: match.path,
    shouldRevalidate: match.shouldRevalidate,
    // We always have a "loader" in this RSC world since even if we don't
    // have a `loader` we may need to get the `element` implementation
    hasLoader: true,
    hasClientLoader: match.clientLoader != null,
    hasAction: match.hasAction,
    hasClientAction: match.clientAction != null,
    hasShouldRevalidate: match.shouldRevalidate != null
  };
  if (typeof dataRoute.loader === "function") {
    dataRoute.loader.hydrate = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .shouldHydrateRouteLoader */ .vB)(
      match.id,
      match.clientLoader,
      match.hasLoader,
      false
    );
  }
  return dataRoute;
}
function callSingleFetch(singleFetch) {
  (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .invariant */ .V1)(typeof singleFetch === "function", "Invalid singleFetch parameter");
  return singleFetch();
}
function preventInvalidServerHandlerCall(type, routeId, hasHandler) {
  if (!hasHandler) {
    let fn = type === "action" ? "serverAction()" : "serverLoader()";
    let msg = `You are trying to call ${fn} on a route that does not have a server ${type} (routeId: "${routeId}")`;
    console.error(msg);
    throw new _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_1__/* .ErrorResponseImpl */ .cj(400, "Bad Request", new Error(msg), true);
  }
}
var nextPaths = /* @__PURE__ */ new Set();
var discoveredPathsMaxSize = 1e3;
var discoveredPaths = /* @__PURE__ */ new Set();
var URL_LIMIT = 7680;
function getManifestUrl(paths) {
  if (paths.length === 0) {
    return null;
  }
  if (paths.length === 1) {
    return new URL(`${paths[0]}.manifest`, window.location.origin);
  }
  const globalVar = window;
  let basename = (globalVar.__reactRouterDataRouter.basename ?? "").replace(
    /^\/|\/$/g,
    ""
  );
  let url = new URL(`${basename}/.manifest`, window.location.origin);
  url.searchParams.set("paths", paths.sort().join(","));
  return url;
}
async function fetchAndApplyManifestPatches(paths, createFromReadableStream, fetchImplementation, signal) {
  let url = getManifestUrl(paths);
  if (url == null) {
    return;
  }
  if (url.toString().length > URL_LIMIT) {
    nextPaths.clear();
    return;
  }
  let response = await fetchImplementation(new Request(url, { signal }));
  if (!response.body || response.status < 200 || response.status >= 300) {
    throw new Error("Unable to fetch new route matches from the server");
  }
  let payload = await createFromReadableStream(response.body, {
    temporaryReferences: void 0
  });
  if (payload.type !== "manifest") {
    throw new Error("Failed to patch routes");
  }
  paths.forEach((p) => addToFifoQueue(p, discoveredPaths));
  payload.patches.forEach((p) => {
    window.__reactRouterDataRouter.patchRoutes(
      p.parentId ?? null,
      [createRouteFromServerManifest(p)]
    );
  });
}
function addToFifoQueue(path, queue) {
  if (queue.size >= discoveredPathsMaxSize) {
    let first = queue.values().next().value;
    queue.delete(first);
  }
  queue.add(path);
}
function debounce(callback, wait) {
  let timeoutId;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), wait);
  };
}
function isExternalLocation(location2) {
  const newLocation = new URL(location2, window.location.href);
  return newLocation.origin !== window.location.origin;
}

// lib/rsc/html-stream/browser.ts
function getRSCStream() {
  let encoder = new TextEncoder();
  let streamController = null;
  let rscStream = new ReadableStream({
    start(controller) {
      if (typeof window === "undefined") {
        return;
      }
      let handleChunk = (chunk) => {
        if (typeof chunk === "string") {
          controller.enqueue(encoder.encode(chunk));
        } else {
          controller.enqueue(chunk);
        }
      };
      window.__FLIGHT_DATA || (window.__FLIGHT_DATA = []);
      window.__FLIGHT_DATA.forEach(handleChunk);
      window.__FLIGHT_DATA.push = (chunk) => {
        handleChunk(chunk);
        return 0;
      };
      streamController = controller;
    }
  });
  if (typeof document !== "undefined" && document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      streamController?.close();
    });
  } else {
    streamController?.close();
  }
  return rscStream;
}



/***/ }),

/***/ 84976:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * react-router-dom v7.9.5
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var index_exports = {};
__export(index_exports, {
  HydratedRouter: () => import_dom.HydratedRouter,
  RouterProvider: () => import_dom.RouterProvider
});
module.exports = __toCommonJS(index_exports);
var import_dom = __webpack_require__(52600);
__reExport(index_exports, __webpack_require__(29949), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (0);


/***/ }),

/***/ 85003:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

var react__WEBPACK_IMPORTED_MODULE_1___namespace_cache;
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   C3: () => (/* binding */ routeRSCServerRequest),
/* harmony export */   E3: () => (/* binding */ RSCStaticRouter),
/* harmony export */   KB: () => (/* binding */ createRequestHandler),
/* harmony export */   LQ: () => (/* binding */ setDevServerHooks),
/* harmony export */   Nb: () => (/* binding */ createMemorySessionStorage),
/* harmony export */   PY: () => (/* binding */ createRoutesStub),
/* harmony export */   UF: () => (/* binding */ href),
/* harmony export */   Vv: () => (/* binding */ populateRSCRouteModules),
/* harmony export */   Y6: () => (/* binding */ createCookieSessionStorage),
/* harmony export */   ZJ: () => (/* binding */ RSCRouterGlobalErrorBoundary),
/* harmony export */   Zd: () => (/* binding */ getHydrationData),
/* harmony export */   Zz: () => (/* binding */ ServerRouter),
/* harmony export */   dC: () => (/* binding */ ServerMode),
/* harmony export */   fm: () => (/* binding */ isCookie),
/* harmony export */   jw: () => (/* binding */ createSession),
/* harmony export */   lR: () => (/* binding */ deserializeErrors),
/* harmony export */   lV: () => (/* binding */ isSession),
/* harmony export */   n0: () => (/* binding */ createCookie),
/* harmony export */   yM: () => (/* binding */ createSessionStorage),
/* harmony export */   yq: () => (/* binding */ RSCDefaultRootErrorBoundary)
/* harmony export */ });
/* harmony import */ var _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(61526);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var cookie__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(16069);
/* harmony import */ var set_cookie_parser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(34635);
/* provided dependency */ var process = __webpack_require__(69695);
/**
 * react-router v7.9.5
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */


// lib/dom/ssr/server.tsx

function ServerRouter({
  context,
  url,
  nonce
}) {
  if (typeof url === "string") {
    url = new URL(url);
  }
  let { manifest, routeModules, criticalCss, serverHandoffString } = context;
  let routes = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .createServerRoutes */ .OW)(
    manifest.routes,
    routeModules,
    context.future,
    context.isSpaMode
  );
  context.staticHandlerContext.loaderData = {
    ...context.staticHandlerContext.loaderData
  };
  for (let match of context.staticHandlerContext.matches) {
    let routeId = match.route.id;
    let route = routeModules[routeId];
    let manifestRoute = context.manifest.routes[routeId];
    if (route && manifestRoute && (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .shouldHydrateRouteLoader */ .vB)(
      routeId,
      route.clientLoader,
      manifestRoute.hasLoader,
      context.isSpaMode
    ) && (route.HydrateFallback || !manifestRoute.hasLoader)) {
      delete context.staticHandlerContext.loaderData[routeId];
    }
  }
  let router = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .createStaticRouter */ .KD)(routes, context.staticHandlerContext);
  return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(react__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(
    _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .FrameworkContext */ .yL.Provider,
    {
      value: {
        manifest,
        routeModules,
        criticalCss,
        serverHandoffString,
        future: context.future,
        ssr: context.ssr,
        isSpaMode: context.isSpaMode,
        routeDiscovery: context.routeDiscovery,
        serializeError: context.serializeError,
        renderMeta: context.renderMeta
      }
    },
    /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .RemixErrorBoundary */ .aJ, { location: router.state.location }, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(
      _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .StaticRouterProvider */ .je,
      {
        router,
        context: context.staticHandlerContext,
        hydrate: false
      }
    ))
  ), context.serverHandoffStream ? /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(react__WEBPACK_IMPORTED_MODULE_1__.Suspense, null, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(
    _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .StreamTransfer */ .UU,
    {
      context,
      identifier: 0,
      reader: context.serverHandoffStream.getReader(),
      textDecoder: new TextDecoder(),
      nonce
    }
  )) : null);
}

// lib/dom/ssr/routes-test-stub.tsx

function createRoutesStub(routes, _context) {
  return function RoutesTestStub({
    initialEntries,
    initialIndex,
    hydrationData,
    future
  }) {
    let routerRef = react__WEBPACK_IMPORTED_MODULE_1__.useRef();
    let frameworkContextRef = react__WEBPACK_IMPORTED_MODULE_1__.useRef();
    if (routerRef.current == null) {
      frameworkContextRef.current = {
        future: {
          unstable_subResourceIntegrity: future?.unstable_subResourceIntegrity === true,
          v8_middleware: future?.v8_middleware === true
        },
        manifest: {
          routes: {},
          entry: { imports: [], module: "" },
          url: "",
          version: ""
        },
        routeModules: {},
        ssr: false,
        isSpaMode: false,
        routeDiscovery: { mode: "lazy", manifestPath: "/__manifest" }
      };
      let patched = processRoutes(
        // @ts-expect-error `StubRouteObject` is stricter about `loader`/`action`
        // types compared to `AgnosticRouteObject`
        (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .convertRoutesToDataRoutes */ .R_)(routes, (r) => r),
        _context !== void 0 ? _context : future?.v8_middleware ? new _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .RouterContextProvider */ .aB() : {},
        frameworkContextRef.current.manifest,
        frameworkContextRef.current.routeModules
      );
      routerRef.current = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .createMemoryRouter */ .bg)(patched, {
        initialEntries,
        initialIndex,
        hydrationData
      });
    }
    return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .FrameworkContext */ .yL.Provider, { value: frameworkContextRef.current }, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .RouterProvider */ .pg, { router: routerRef.current }));
  };
}
function processRoutes(routes, context, manifest, routeModules, parentId) {
  return routes.map((route) => {
    if (!route.id) {
      throw new Error(
        "Expected a route.id in react-router processRoutes() function"
      );
    }
    let newRoute = {
      id: route.id,
      path: route.path,
      index: route.index,
      Component: route.Component ? (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .withComponentProps */ .ux)(route.Component) : void 0,
      HydrateFallback: route.HydrateFallback ? (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .withHydrateFallbackProps */ .AX)(route.HydrateFallback) : void 0,
      ErrorBoundary: route.ErrorBoundary ? (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .withErrorBoundaryProps */ .Vp)(route.ErrorBoundary) : void 0,
      action: route.action ? (args) => route.action({ ...args, context }) : void 0,
      loader: route.loader ? (args) => route.loader({ ...args, context }) : void 0,
      middleware: route.middleware ? route.middleware.map(
        (mw) => (...args) => mw(
          { ...args[0], context },
          args[1]
        )
      ) : void 0,
      handle: route.handle,
      shouldRevalidate: route.shouldRevalidate
    };
    let entryRoute = {
      id: route.id,
      path: route.path,
      index: route.index,
      parentId,
      hasAction: route.action != null,
      hasLoader: route.loader != null,
      // When testing routes, you should be stubbing loader/action/middleware,
      // not trying to re-implement the full loader/clientLoader/SSR/hydration
      // flow. That is better tested via E2E tests.
      hasClientAction: false,
      hasClientLoader: false,
      hasClientMiddleware: false,
      hasErrorBoundary: route.ErrorBoundary != null,
      // any need for these?
      module: "build/stub-path-to-module.js",
      clientActionModule: void 0,
      clientLoaderModule: void 0,
      clientMiddlewareModule: void 0,
      hydrateFallbackModule: void 0
    };
    manifest.routes[newRoute.id] = entryRoute;
    routeModules[route.id] = {
      default: newRoute.Component || _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .Outlet */ .sv,
      ErrorBoundary: newRoute.ErrorBoundary || void 0,
      handle: route.handle,
      links: route.links,
      meta: route.meta,
      shouldRevalidate: route.shouldRevalidate
    };
    if (route.children) {
      newRoute.children = processRoutes(
        route.children,
        context,
        manifest,
        routeModules,
        newRoute.id
      );
    }
    return newRoute;
  });
}

// lib/server-runtime/cookies.ts


// lib/server-runtime/crypto.ts
var encoder = /* @__PURE__ */ new TextEncoder();
var sign = async (value, secret) => {
  let data2 = encoder.encode(value);
  let key = await createKey(secret, ["sign"]);
  let signature = await crypto.subtle.sign("HMAC", key, data2);
  let hash = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(
    /=+$/,
    ""
  );
  return value + "." + hash;
};
var unsign = async (cookie, secret) => {
  let index = cookie.lastIndexOf(".");
  let value = cookie.slice(0, index);
  let hash = cookie.slice(index + 1);
  let data2 = encoder.encode(value);
  let key = await createKey(secret, ["verify"]);
  try {
    let signature = byteStringToUint8Array(atob(hash));
    let valid = await crypto.subtle.verify("HMAC", key, signature, data2);
    return valid ? value : false;
  } catch (error) {
    return false;
  }
};
var createKey = async (secret, usages) => crypto.subtle.importKey(
  "raw",
  encoder.encode(secret),
  { name: "HMAC", hash: "SHA-256" },
  false,
  usages
);
function byteStringToUint8Array(byteString) {
  let array = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    array[i] = byteString.charCodeAt(i);
  }
  return array;
}

// lib/server-runtime/cookies.ts
var createCookie = (name, cookieOptions = {}) => {
  let { secrets = [], ...options } = {
    path: "/",
    sameSite: "lax",
    ...cookieOptions
  };
  warnOnceAboutExpiresCookie(name, options.expires);
  return {
    get name() {
      return name;
    },
    get isSigned() {
      return secrets.length > 0;
    },
    get expires() {
      return typeof options.maxAge !== "undefined" ? new Date(Date.now() + options.maxAge * 1e3) : options.expires;
    },
    async parse(cookieHeader, parseOptions) {
      if (!cookieHeader) return null;
      let cookies = (0,cookie__WEBPACK_IMPORTED_MODULE_2__/* .parse */ .qg)(cookieHeader, { ...options, ...parseOptions });
      if (name in cookies) {
        let value = cookies[name];
        if (typeof value === "string" && value !== "") {
          let decoded = await decodeCookieValue(value, secrets);
          return decoded;
        } else {
          return "";
        }
      } else {
        return null;
      }
    },
    async serialize(value, serializeOptions) {
      return (0,cookie__WEBPACK_IMPORTED_MODULE_2__/* .serialize */ .lK)(
        name,
        value === "" ? "" : await encodeCookieValue(value, secrets),
        {
          ...options,
          ...serializeOptions
        }
      );
    }
  };
};
var isCookie = (object) => {
  return object != null && typeof object.name === "string" && typeof object.isSigned === "boolean" && typeof object.parse === "function" && typeof object.serialize === "function";
};
async function encodeCookieValue(value, secrets) {
  let encoded = encodeData(value);
  if (secrets.length > 0) {
    encoded = await sign(encoded, secrets[0]);
  }
  return encoded;
}
async function decodeCookieValue(value, secrets) {
  if (secrets.length > 0) {
    for (let secret of secrets) {
      let unsignedValue = await unsign(value, secret);
      if (unsignedValue !== false) {
        return decodeData(unsignedValue);
      }
    }
    return null;
  }
  return decodeData(value);
}
function encodeData(value) {
  return btoa(myUnescape(encodeURIComponent(JSON.stringify(value))));
}
function decodeData(value) {
  try {
    return JSON.parse(decodeURIComponent(myEscape(atob(value))));
  } catch (error) {
    return {};
  }
}
function myEscape(value) {
  let str = value.toString();
  let result = "";
  let index = 0;
  let chr, code;
  while (index < str.length) {
    chr = str.charAt(index++);
    if (/[\w*+\-./@]/.exec(chr)) {
      result += chr;
    } else {
      code = chr.charCodeAt(0);
      if (code < 256) {
        result += "%" + hex(code, 2);
      } else {
        result += "%u" + hex(code, 4).toUpperCase();
      }
    }
  }
  return result;
}
function hex(code, length) {
  let result = code.toString(16);
  while (result.length < length) result = "0" + result;
  return result;
}
function myUnescape(value) {
  let str = value.toString();
  let result = "";
  let index = 0;
  let chr, part;
  while (index < str.length) {
    chr = str.charAt(index++);
    if (chr === "%") {
      if (str.charAt(index) === "u") {
        part = str.slice(index + 1, index + 5);
        if (/^[\da-f]{4}$/i.exec(part)) {
          result += String.fromCharCode(parseInt(part, 16));
          index += 5;
          continue;
        }
      } else {
        part = str.slice(index, index + 2);
        if (/^[\da-f]{2}$/i.exec(part)) {
          result += String.fromCharCode(parseInt(part, 16));
          index += 2;
          continue;
        }
      }
    }
    result += chr;
  }
  return result;
}
function warnOnceAboutExpiresCookie(name, expires) {
  (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .warnOnce */ .mc)(
    !expires,
    `The "${name}" cookie has an "expires" property set. This will cause the expires value to not be updated when the session is committed. Instead, you should set the expires value when serializing the cookie. You can use \`commitSession(session, { expires })\` if using a session storage object, or \`cookie.serialize("value", { expires })\` if you're using the cookie directly.`
  );
}

// lib/server-runtime/entry.ts
function createEntryRouteModules(manifest) {
  return Object.keys(manifest).reduce((memo, routeId) => {
    let route = manifest[routeId];
    if (route) {
      memo[routeId] = route.module;
    }
    return memo;
  }, {});
}

// lib/server-runtime/mode.ts
var ServerMode = /* @__PURE__ */ ((ServerMode2) => {
  ServerMode2["Development"] = "development";
  ServerMode2["Production"] = "production";
  ServerMode2["Test"] = "test";
  return ServerMode2;
})(ServerMode || {});
function isServerMode(value) {
  return value === "development" /* Development */ || value === "production" /* Production */ || value === "test" /* Test */;
}

// lib/server-runtime/errors.ts
function sanitizeError(error, serverMode) {
  if (error instanceof Error && serverMode !== "development" /* Development */) {
    let sanitized = new Error("Unexpected Server Error");
    sanitized.stack = void 0;
    return sanitized;
  }
  return error;
}
function sanitizeErrors(errors, serverMode) {
  return Object.entries(errors).reduce((acc, [routeId, error]) => {
    return Object.assign(acc, { [routeId]: sanitizeError(error, serverMode) });
  }, {});
}
function serializeError(error, serverMode) {
  let sanitized = sanitizeError(error, serverMode);
  return {
    message: sanitized.message,
    stack: sanitized.stack
  };
}
function serializeErrors(errors, serverMode) {
  if (!errors) return null;
  let entries = Object.entries(errors);
  let serialized = {};
  for (let [key, val] of entries) {
    if ((0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isRouteErrorResponse */ .pX)(val)) {
      serialized[key] = { ...val, __type: "RouteErrorResponse" };
    } else if (val instanceof Error) {
      let sanitized = sanitizeError(val, serverMode);
      serialized[key] = {
        message: sanitized.message,
        stack: sanitized.stack,
        __type: "Error",
        // If this is a subclass (i.e., ReferenceError), send up the type so we
        // can re-create the same type during hydration.  This will only apply
        // in dev mode since all production errors are sanitized to normal
        // Error instances
        ...sanitized.name !== "Error" ? {
          __subType: sanitized.name
        } : {}
      };
    } else {
      serialized[key] = val;
    }
  }
  return serialized;
}

// lib/server-runtime/routeMatching.ts
function matchServerRoutes(routes, pathname, basename) {
  let matches = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .matchRoutes */ .ue)(
    routes,
    pathname,
    basename
  );
  if (!matches) return null;
  return matches.map((match) => ({
    params: match.params,
    pathname: match.pathname,
    route: match.route
  }));
}

// lib/server-runtime/data.ts
async function callRouteHandler(handler, args) {
  let result = await handler({
    request: stripRoutesParam(stripIndexParam(args.request)),
    params: args.params,
    context: args.context,
    unstable_pattern: args.unstable_pattern
  });
  if ((0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isDataWithResponseInit */ .YX)(result) && result.init && result.init.status && (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isRedirectStatusCode */ .QE)(result.init.status)) {
    throw new Response(null, result.init);
  }
  return result;
}
function stripIndexParam(request) {
  let url = new URL(request.url);
  let indexValues = url.searchParams.getAll("index");
  url.searchParams.delete("index");
  let indexValuesToKeep = [];
  for (let indexValue of indexValues) {
    if (indexValue) {
      indexValuesToKeep.push(indexValue);
    }
  }
  for (let toKeep of indexValuesToKeep) {
    url.searchParams.append("index", toKeep);
  }
  let init = {
    method: request.method,
    body: request.body,
    headers: request.headers,
    signal: request.signal
  };
  if (init.body) {
    init.duplex = "half";
  }
  return new Request(url.href, init);
}
function stripRoutesParam(request) {
  let url = new URL(request.url);
  url.searchParams.delete("_routes");
  let init = {
    method: request.method,
    body: request.body,
    headers: request.headers,
    signal: request.signal
  };
  if (init.body) {
    init.duplex = "half";
  }
  return new Request(url.href, init);
}

// lib/server-runtime/invariant.ts
function invariant(value, message) {
  if (value === false || value === null || typeof value === "undefined") {
    console.error(
      "The following error is a bug in React Router; please open an issue! https://github.com/remix-run/react-router/issues/new/choose"
    );
    throw new Error(message);
  }
}

// lib/server-runtime/dev.ts
var globalDevServerHooksKey = "__reactRouterDevServerHooks";
function setDevServerHooks(devServerHooks) {
  globalThis[globalDevServerHooksKey] = devServerHooks;
}
function getDevServerHooks() {
  return globalThis[globalDevServerHooksKey];
}
function getBuildTimeHeader(request, headerName) {
  if (typeof process !== "undefined") {
    try {
      if (process.env?.IS_RR_BUILD_REQUEST === "yes") {
        return request.headers.get(headerName);
      }
    } catch (e) {
    }
  }
  return null;
}

// lib/server-runtime/routes.ts
function groupRoutesByParentId(manifest) {
  let routes = {};
  Object.values(manifest).forEach((route) => {
    if (route) {
      let parentId = route.parentId || "";
      if (!routes[parentId]) {
        routes[parentId] = [];
      }
      routes[parentId].push(route);
    }
  });
  return routes;
}
function createRoutes(manifest, parentId = "", routesByParentId = groupRoutesByParentId(manifest)) {
  return (routesByParentId[parentId] || []).map((route) => ({
    ...route,
    children: createRoutes(manifest, route.id, routesByParentId)
  }));
}
function createStaticHandlerDataRoutes(manifest, future, parentId = "", routesByParentId = groupRoutesByParentId(manifest)) {
  return (routesByParentId[parentId] || []).map((route) => {
    let commonRoute = {
      // Always include root due to default boundaries
      hasErrorBoundary: route.id === "root" || route.module.ErrorBoundary != null,
      id: route.id,
      path: route.path,
      middleware: route.module.middleware,
      // Need to use RR's version in the param typed here to permit the optional
      // context even though we know it'll always be provided in remix
      loader: route.module.loader ? async (args) => {
        let preRenderedData = getBuildTimeHeader(
          args.request,
          "X-React-Router-Prerender-Data"
        );
        if (preRenderedData != null) {
          let encoded = preRenderedData ? decodeURI(preRenderedData) : preRenderedData;
          invariant(encoded, "Missing prerendered data for route");
          let uint8array = new TextEncoder().encode(encoded);
          let stream = new ReadableStream({
            start(controller) {
              controller.enqueue(uint8array);
              controller.close();
            }
          });
          let decoded = await (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .decodeViaTurboStream */ .ht)(stream, window);
          let data2 = decoded.value;
          if (data2 && _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .SingleFetchRedirectSymbol */ .lR in data2) {
            let result = data2[_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .SingleFetchRedirectSymbol */ .lR];
            let init = { status: result.status };
            if (result.reload) {
              throw (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .redirectDocument */ .Sk)(result.redirect, init);
            } else if (result.replace) {
              throw (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .replace */ .HC)(result.redirect, init);
            } else {
              throw (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .redirect */ .V2)(result.redirect, init);
            }
          } else {
            invariant(
              data2 && route.id in data2,
              "Unable to decode prerendered data"
            );
            let result = data2[route.id];
            invariant(
              "data" in result,
              "Unable to process prerendered data"
            );
            return result.data;
          }
        }
        let val = await callRouteHandler(route.module.loader, args);
        return val;
      } : void 0,
      action: route.module.action ? (args) => callRouteHandler(route.module.action, args) : void 0,
      handle: route.module.handle
    };
    return route.index ? {
      index: true,
      ...commonRoute
    } : {
      caseSensitive: route.caseSensitive,
      children: createStaticHandlerDataRoutes(
        manifest,
        future,
        route.id,
        routesByParentId
      ),
      ...commonRoute
    };
  });
}

// lib/server-runtime/serverHandoff.ts
function createServerHandoffString(serverHandoff) {
  return (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .escapeHtml */ .ZD)(JSON.stringify(serverHandoff));
}

// lib/server-runtime/headers.ts

function getDocumentHeaders(context, build) {
  return getDocumentHeadersImpl(context, (m) => {
    let route = build.routes[m.route.id];
    invariant(route, `Route with id "${m.route.id}" not found in build`);
    return route.module.headers;
  });
}
function getDocumentHeadersImpl(context, getRouteHeadersFn, _defaultHeaders) {
  let boundaryIdx = context.errors ? context.matches.findIndex((m) => context.errors[m.route.id]) : -1;
  let matches = boundaryIdx >= 0 ? context.matches.slice(0, boundaryIdx + 1) : context.matches;
  let errorHeaders;
  if (boundaryIdx >= 0) {
    let { actionHeaders, actionData, loaderHeaders, loaderData } = context;
    context.matches.slice(boundaryIdx).some((match) => {
      let id = match.route.id;
      if (actionHeaders[id] && (!actionData || !actionData.hasOwnProperty(id))) {
        errorHeaders = actionHeaders[id];
      } else if (loaderHeaders[id] && !loaderData.hasOwnProperty(id)) {
        errorHeaders = loaderHeaders[id];
      }
      return errorHeaders != null;
    });
  }
  const defaultHeaders = new Headers(_defaultHeaders);
  return matches.reduce((parentHeaders, match, idx) => {
    let { id } = match.route;
    let loaderHeaders = context.loaderHeaders[id] || new Headers();
    let actionHeaders = context.actionHeaders[id] || new Headers();
    let includeErrorHeaders = errorHeaders != null && idx === matches.length - 1;
    let includeErrorCookies = includeErrorHeaders && errorHeaders !== loaderHeaders && errorHeaders !== actionHeaders;
    let headersFn = getRouteHeadersFn(match);
    if (headersFn == null) {
      let headers2 = new Headers(parentHeaders);
      if (includeErrorCookies) {
        prependCookies(errorHeaders, headers2);
      }
      prependCookies(actionHeaders, headers2);
      prependCookies(loaderHeaders, headers2);
      return headers2;
    }
    let headers = new Headers(
      typeof headersFn === "function" ? headersFn({
        loaderHeaders,
        parentHeaders,
        actionHeaders,
        errorHeaders: includeErrorHeaders ? errorHeaders : void 0
      }) : headersFn
    );
    if (includeErrorCookies) {
      prependCookies(errorHeaders, headers);
    }
    prependCookies(actionHeaders, headers);
    prependCookies(loaderHeaders, headers);
    prependCookies(parentHeaders, headers);
    return headers;
  }, new Headers(defaultHeaders));
}
function prependCookies(parentHeaders, childHeaders) {
  let parentSetCookieString = parentHeaders.get("Set-Cookie");
  if (parentSetCookieString) {
    let cookies = (0,set_cookie_parser__WEBPACK_IMPORTED_MODULE_3__.splitCookiesString)(parentSetCookieString);
    let childCookies = new Set(childHeaders.getSetCookie());
    cookies.forEach((cookie) => {
      if (!childCookies.has(cookie)) {
        childHeaders.append("Set-Cookie", cookie);
      }
    });
  }
}

// lib/server-runtime/single-fetch.ts
var SERVER_NO_BODY_STATUS_CODES = /* @__PURE__ */ new Set([
  ..._chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .NO_BODY_STATUS_CODES */ .RF,
  304
]);
async function singleFetchAction(build, serverMode, staticHandler, request, handlerUrl, loadContext, handleError) {
  try {
    let handlerRequest = new Request(handlerUrl, {
      method: request.method,
      body: request.body,
      headers: request.headers,
      signal: request.signal,
      ...request.body ? { duplex: "half" } : void 0
    });
    let result = await staticHandler.query(handlerRequest, {
      requestContext: loadContext,
      skipLoaderErrorBubbling: true,
      skipRevalidation: true,
      generateMiddlewareResponse: build.future.v8_middleware ? async (query) => {
        try {
          let innerResult = await query(handlerRequest);
          return handleQueryResult(innerResult);
        } catch (error) {
          return handleQueryError(error);
        }
      } : void 0
    });
    return handleQueryResult(result);
  } catch (error) {
    return handleQueryError(error);
  }
  function handleQueryResult(result) {
    return (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isResponse */ .Sv)(result) ? result : staticContextToResponse(result);
  }
  function handleQueryError(error) {
    handleError(error);
    return generateSingleFetchResponse(request, build, serverMode, {
      result: { error },
      headers: new Headers(),
      status: 500
    });
  }
  function staticContextToResponse(context) {
    let headers = getDocumentHeaders(context, build);
    if ((0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isRedirectStatusCode */ .QE)(context.statusCode) && headers.has("Location")) {
      return new Response(null, { status: context.statusCode, headers });
    }
    if (context.errors) {
      Object.values(context.errors).forEach((err) => {
        if (!(0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isRouteErrorResponse */ .pX)(err) || err.error) {
          handleError(err);
        }
      });
      context.errors = sanitizeErrors(context.errors, serverMode);
    }
    let singleFetchResult;
    if (context.errors) {
      singleFetchResult = { error: Object.values(context.errors)[0] };
    } else {
      singleFetchResult = {
        data: Object.values(context.actionData || {})[0]
      };
    }
    return generateSingleFetchResponse(request, build, serverMode, {
      result: singleFetchResult,
      headers,
      status: context.statusCode
    });
  }
}
async function singleFetchLoaders(build, serverMode, staticHandler, request, handlerUrl, loadContext, handleError) {
  let routesParam = new URL(request.url).searchParams.get("_routes");
  let loadRouteIds = routesParam ? new Set(routesParam.split(",")) : null;
  try {
    let handlerRequest = new Request(handlerUrl, {
      headers: request.headers,
      signal: request.signal
    });
    let result = await staticHandler.query(handlerRequest, {
      requestContext: loadContext,
      filterMatchesToLoad: (m) => !loadRouteIds || loadRouteIds.has(m.route.id),
      skipLoaderErrorBubbling: true,
      generateMiddlewareResponse: build.future.v8_middleware ? async (query) => {
        try {
          let innerResult = await query(handlerRequest);
          return handleQueryResult(innerResult);
        } catch (error) {
          return handleQueryError(error);
        }
      } : void 0
    });
    return handleQueryResult(result);
  } catch (error) {
    return handleQueryError(error);
  }
  function handleQueryResult(result) {
    return (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isResponse */ .Sv)(result) ? result : staticContextToResponse(result);
  }
  function handleQueryError(error) {
    handleError(error);
    return generateSingleFetchResponse(request, build, serverMode, {
      result: { error },
      headers: new Headers(),
      status: 500
    });
  }
  function staticContextToResponse(context) {
    let headers = getDocumentHeaders(context, build);
    if ((0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isRedirectStatusCode */ .QE)(context.statusCode) && headers.has("Location")) {
      return new Response(null, { status: context.statusCode, headers });
    }
    if (context.errors) {
      Object.values(context.errors).forEach((err) => {
        if (!(0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isRouteErrorResponse */ .pX)(err) || err.error) {
          handleError(err);
        }
      });
      context.errors = sanitizeErrors(context.errors, serverMode);
    }
    let results = {};
    let loadedMatches = new Set(
      context.matches.filter(
        (m) => loadRouteIds ? loadRouteIds.has(m.route.id) : m.route.loader != null
      ).map((m) => m.route.id)
    );
    if (context.errors) {
      for (let [id, error] of Object.entries(context.errors)) {
        results[id] = { error };
      }
    }
    for (let [id, data2] of Object.entries(context.loaderData)) {
      if (!(id in results) && loadedMatches.has(id)) {
        results[id] = { data: data2 };
      }
    }
    return generateSingleFetchResponse(request, build, serverMode, {
      result: results,
      headers,
      status: context.statusCode
    });
  }
}
function generateSingleFetchResponse(request, build, serverMode, {
  result,
  headers,
  status
}) {
  let resultHeaders = new Headers(headers);
  resultHeaders.set("X-Remix-Response", "yes");
  if (SERVER_NO_BODY_STATUS_CODES.has(status)) {
    return new Response(null, { status, headers: resultHeaders });
  }
  resultHeaders.set("Content-Type", "text/x-script");
  resultHeaders.delete("Content-Length");
  return new Response(
    encodeViaTurboStream(
      result,
      request.signal,
      build.entry.module.streamTimeout,
      serverMode
    ),
    {
      status: status || 200,
      headers: resultHeaders
    }
  );
}
function generateSingleFetchRedirectResponse(redirectResponse, request, build, serverMode) {
  let redirect2 = getSingleFetchRedirect(
    redirectResponse.status,
    redirectResponse.headers,
    build.basename
  );
  let headers = new Headers(redirectResponse.headers);
  headers.delete("Location");
  headers.set("Content-Type", "text/x-script");
  return generateSingleFetchResponse(request, build, serverMode, {
    result: request.method === "GET" ? { [_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .SingleFetchRedirectSymbol */ .lR]: redirect2 } : redirect2,
    headers,
    status: _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .SINGLE_FETCH_REDIRECT_STATUS */ .gI
  });
}
function getSingleFetchRedirect(status, headers, basename) {
  let redirect2 = headers.get("Location");
  if (basename) {
    redirect2 = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .stripBasename */ .pb)(redirect2, basename) || redirect2;
  }
  return {
    redirect: redirect2,
    status,
    revalidate: (
      // Technically X-Remix-Revalidate isn't needed here - that was an implementation
      // detail of ?_data requests as our way to tell the front end to revalidate when
      // we didn't have a response body to include that information in.
      // With single fetch, we tell the front end via this revalidate boolean field.
      // However, we're respecting it for now because it may be something folks have
      // used in their own responses
      // TODO(v3): Consider removing or making this official public API
      headers.has("X-Remix-Revalidate") || headers.has("Set-Cookie")
    ),
    reload: headers.has("X-Remix-Reload-Document"),
    replace: headers.has("X-Remix-Replace")
  };
}
function encodeViaTurboStream(data2, requestSignal, streamTimeout, serverMode) {
  let controller = new AbortController();
  let timeoutId = setTimeout(
    () => controller.abort(new Error("Server Timeout")),
    typeof streamTimeout === "number" ? streamTimeout : 4950
  );
  requestSignal.addEventListener("abort", () => clearTimeout(timeoutId));
  return (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .encode */ .lF)(data2, {
    signal: controller.signal,
    plugins: [
      (value) => {
        if (value instanceof Error) {
          let { name, message, stack } = serverMode === "production" /* Production */ ? sanitizeError(value, serverMode) : value;
          return ["SanitizedError", name, message, stack];
        }
        if (value instanceof _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .ErrorResponseImpl */ .cj) {
          let { data: data3, status, statusText } = value;
          return ["ErrorResponse", data3, status, statusText];
        }
        if (value && typeof value === "object" && _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .SingleFetchRedirectSymbol */ .lR in value) {
          return ["SingleFetchRedirect", value[_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .SingleFetchRedirectSymbol */ .lR]];
        }
      }
    ],
    postPlugins: [
      (value) => {
        if (!value) return;
        if (typeof value !== "object") return;
        return [
          "SingleFetchClassInstance",
          Object.fromEntries(Object.entries(value))
        ];
      },
      () => ["SingleFetchFallback"]
    ]
  });
}

// lib/server-runtime/server.ts
function derive(build, mode) {
  let routes = createRoutes(build.routes);
  let dataRoutes = createStaticHandlerDataRoutes(build.routes, build.future);
  let serverMode = isServerMode(mode) ? mode : "production" /* Production */;
  let staticHandler = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .createStaticHandler */ .d6)(dataRoutes, {
    basename: build.basename,
    unstable_instrumentations: build.entry.module.unstable_instrumentations
  });
  let errorHandler = build.entry.module.handleError || ((error, { request }) => {
    if (serverMode !== "test" /* Test */ && !request.signal.aborted) {
      console.error(
        // @ts-expect-error This is "private" from users but intended for internal use
        (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isRouteErrorResponse */ .pX)(error) && error.error ? error.error : error
      );
    }
  });
  let requestHandler = async (request, initialContext) => {
    let params = {};
    let loadContext;
    let handleError = (error) => {
      if (mode === "development" /* Development */) {
        getDevServerHooks()?.processRequestError?.(error);
      }
      errorHandler(error, {
        context: loadContext,
        params,
        request
      });
    };
    if (build.future.v8_middleware) {
      if (initialContext && !(initialContext instanceof _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .RouterContextProvider */ .aB)) {
        let error = new Error(
          "Invalid `context` value provided to `handleRequest`. When middleware is enabled you must return an instance of `RouterContextProvider` from your `getLoadContext` function."
        );
        handleError(error);
        return returnLastResortErrorResponse(error, serverMode);
      }
      loadContext = initialContext || new _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .RouterContextProvider */ .aB();
    } else {
      loadContext = initialContext || {};
    }
    let url = new URL(request.url);
    let normalizedBasename = build.basename || "/";
    let normalizedPath = url.pathname;
    if ((0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .stripBasename */ .pb)(normalizedPath, normalizedBasename) === "/_root.data") {
      normalizedPath = normalizedBasename;
    } else if (normalizedPath.endsWith(".data")) {
      normalizedPath = normalizedPath.replace(/\.data$/, "");
    }
    if ((0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .stripBasename */ .pb)(normalizedPath, normalizedBasename) !== "/" && normalizedPath.endsWith("/")) {
      normalizedPath = normalizedPath.slice(0, -1);
    }
    let isSpaMode = getBuildTimeHeader(request, "X-React-Router-SPA-Mode") === "yes";
    if (!build.ssr) {
      let decodedPath = decodeURI(normalizedPath);
      if (normalizedBasename !== "/") {
        let strippedPath = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .stripBasename */ .pb)(decodedPath, normalizedBasename);
        if (strippedPath == null) {
          errorHandler(
            new _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .ErrorResponseImpl */ .cj(
              404,
              "Not Found",
              `Refusing to prerender the \`${decodedPath}\` path because it does not start with the basename \`${normalizedBasename}\``
            ),
            {
              context: loadContext,
              params,
              request
            }
          );
          return new Response("Not Found", {
            status: 404,
            statusText: "Not Found"
          });
        }
        decodedPath = strippedPath;
      }
      if (build.prerender.length === 0) {
        isSpaMode = true;
      } else if (!build.prerender.includes(decodedPath) && !build.prerender.includes(decodedPath + "/")) {
        if (url.pathname.endsWith(".data")) {
          errorHandler(
            new _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .ErrorResponseImpl */ .cj(
              404,
              "Not Found",
              `Refusing to SSR the path \`${decodedPath}\` because \`ssr:false\` is set and the path is not included in the \`prerender\` config, so in production the path will be a 404.`
            ),
            {
              context: loadContext,
              params,
              request
            }
          );
          return new Response("Not Found", {
            status: 404,
            statusText: "Not Found"
          });
        } else {
          isSpaMode = true;
        }
      }
    }
    let manifestUrl = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .getManifestPath */ .lS)(
      build.routeDiscovery.manifestPath,
      normalizedBasename
    );
    if (url.pathname === manifestUrl) {
      try {
        let res = await handleManifestRequest(build, routes, url);
        return res;
      } catch (e) {
        handleError(e);
        return new Response("Unknown Server Error", { status: 500 });
      }
    }
    let matches = matchServerRoutes(routes, normalizedPath, build.basename);
    if (matches && matches.length > 0) {
      Object.assign(params, matches[0].params);
    }
    let response;
    if (url.pathname.endsWith(".data")) {
      let handlerUrl = new URL(request.url);
      handlerUrl.pathname = normalizedPath;
      let singleFetchMatches = matchServerRoutes(
        routes,
        handlerUrl.pathname,
        build.basename
      );
      response = await handleSingleFetchRequest(
        serverMode,
        build,
        staticHandler,
        request,
        handlerUrl,
        loadContext,
        handleError
      );
      if ((0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isRedirectResponse */ .U)(response)) {
        response = generateSingleFetchRedirectResponse(
          response,
          request,
          build,
          serverMode
        );
      }
      if (build.entry.module.handleDataRequest) {
        response = await build.entry.module.handleDataRequest(response, {
          context: loadContext,
          params: singleFetchMatches ? singleFetchMatches[0].params : {},
          request
        });
        if ((0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isRedirectResponse */ .U)(response)) {
          response = generateSingleFetchRedirectResponse(
            response,
            request,
            build,
            serverMode
          );
        }
      }
    } else if (!isSpaMode && matches && matches[matches.length - 1].route.module.default == null && matches[matches.length - 1].route.module.ErrorBoundary == null) {
      response = await handleResourceRequest(
        serverMode,
        build,
        staticHandler,
        matches.slice(-1)[0].route.id,
        request,
        loadContext,
        handleError
      );
    } else {
      let { pathname } = url;
      let criticalCss = void 0;
      if (build.unstable_getCriticalCss) {
        criticalCss = await build.unstable_getCriticalCss({ pathname });
      } else if (mode === "development" /* Development */ && getDevServerHooks()?.getCriticalCss) {
        criticalCss = await getDevServerHooks()?.getCriticalCss?.(pathname);
      }
      response = await handleDocumentRequest(
        serverMode,
        build,
        staticHandler,
        request,
        loadContext,
        handleError,
        isSpaMode,
        criticalCss
      );
    }
    if (request.method === "HEAD") {
      return new Response(null, {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText
      });
    }
    return response;
  };
  if (build.entry.module.unstable_instrumentations) {
    requestHandler = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .instrumentHandler */ .Cu)(
      requestHandler,
      build.entry.module.unstable_instrumentations.map((i) => i.handler).filter(Boolean)
    );
  }
  return {
    routes,
    dataRoutes,
    serverMode,
    staticHandler,
    errorHandler,
    requestHandler
  };
}
var createRequestHandler = (build, mode) => {
  let _build;
  let routes;
  let serverMode;
  let staticHandler;
  let errorHandler;
  let _requestHandler;
  return async function requestHandler(request, initialContext) {
    _build = typeof build === "function" ? await build() : build;
    if (typeof build === "function") {
      let derived = derive(_build, mode);
      routes = derived.routes;
      serverMode = derived.serverMode;
      staticHandler = derived.staticHandler;
      errorHandler = derived.errorHandler;
      _requestHandler = derived.requestHandler;
    } else if (!routes || !serverMode || !staticHandler || !errorHandler || !_requestHandler) {
      let derived = derive(_build, mode);
      routes = derived.routes;
      serverMode = derived.serverMode;
      staticHandler = derived.staticHandler;
      errorHandler = derived.errorHandler;
      _requestHandler = derived.requestHandler;
    }
    return _requestHandler(request, initialContext);
  };
};
async function handleManifestRequest(build, routes, url) {
  if (build.assets.version !== url.searchParams.get("version")) {
    return new Response(null, {
      status: 204,
      headers: {
        "X-Remix-Reload-Document": "true"
      }
    });
  }
  let patches = {};
  if (url.searchParams.has("paths")) {
    let paths = /* @__PURE__ */ new Set();
    let pathParam = url.searchParams.get("paths") || "";
    let requestedPaths = pathParam.split(",").filter(Boolean);
    requestedPaths.forEach((path) => {
      if (!path.startsWith("/")) {
        path = `/${path}`;
      }
      let segments = path.split("/").slice(1);
      segments.forEach((_, i) => {
        let partialPath = segments.slice(0, i + 1).join("/");
        paths.add(`/${partialPath}`);
      });
    });
    for (let path of paths) {
      let matches = matchServerRoutes(routes, path, build.basename);
      if (matches) {
        for (let match of matches) {
          let routeId = match.route.id;
          let route = build.assets.routes[routeId];
          if (route) {
            patches[routeId] = route;
          }
        }
      }
    }
    return Response.json(patches, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  }
  return new Response("Invalid Request", { status: 400 });
}
async function handleSingleFetchRequest(serverMode, build, staticHandler, request, handlerUrl, loadContext, handleError) {
  let response = request.method !== "GET" ? await singleFetchAction(
    build,
    serverMode,
    staticHandler,
    request,
    handlerUrl,
    loadContext,
    handleError
  ) : await singleFetchLoaders(
    build,
    serverMode,
    staticHandler,
    request,
    handlerUrl,
    loadContext,
    handleError
  );
  return response;
}
async function handleDocumentRequest(serverMode, build, staticHandler, request, loadContext, handleError, isSpaMode, criticalCss) {
  try {
    let result = await staticHandler.query(request, {
      requestContext: loadContext,
      generateMiddlewareResponse: build.future.v8_middleware ? async (query) => {
        try {
          let innerResult = await query(request);
          if (!(0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isResponse */ .Sv)(innerResult)) {
            innerResult = await renderHtml(innerResult, isSpaMode);
          }
          return innerResult;
        } catch (error) {
          handleError(error);
          return new Response(null, { status: 500 });
        }
      } : void 0
    });
    if (!(0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isResponse */ .Sv)(result)) {
      result = await renderHtml(result, isSpaMode);
    }
    return result;
  } catch (error) {
    handleError(error);
    return new Response(null, { status: 500 });
  }
  async function renderHtml(context, isSpaMode2) {
    let headers = getDocumentHeaders(context, build);
    if (SERVER_NO_BODY_STATUS_CODES.has(context.statusCode)) {
      return new Response(null, { status: context.statusCode, headers });
    }
    if (context.errors) {
      Object.values(context.errors).forEach((err) => {
        if (!(0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isRouteErrorResponse */ .pX)(err) || err.error) {
          handleError(err);
        }
      });
      context.errors = sanitizeErrors(context.errors, serverMode);
    }
    let state = {
      loaderData: context.loaderData,
      actionData: context.actionData,
      errors: serializeErrors(context.errors, serverMode)
    };
    let baseServerHandoff = {
      basename: build.basename,
      future: build.future,
      routeDiscovery: build.routeDiscovery,
      ssr: build.ssr,
      isSpaMode: isSpaMode2
    };
    let entryContext = {
      manifest: build.assets,
      routeModules: createEntryRouteModules(build.routes),
      staticHandlerContext: context,
      criticalCss,
      serverHandoffString: createServerHandoffString({
        ...baseServerHandoff,
        criticalCss
      }),
      serverHandoffStream: encodeViaTurboStream(
        state,
        request.signal,
        build.entry.module.streamTimeout,
        serverMode
      ),
      renderMeta: {},
      future: build.future,
      ssr: build.ssr,
      routeDiscovery: build.routeDiscovery,
      isSpaMode: isSpaMode2,
      serializeError: (err) => serializeError(err, serverMode)
    };
    let handleDocumentRequestFunction = build.entry.module.default;
    try {
      return await handleDocumentRequestFunction(
        request,
        context.statusCode,
        headers,
        entryContext,
        loadContext
      );
    } catch (error) {
      handleError(error);
      let errorForSecondRender = error;
      if ((0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isResponse */ .Sv)(error)) {
        try {
          let data2 = await unwrapResponse(error);
          errorForSecondRender = new _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .ErrorResponseImpl */ .cj(
            error.status,
            error.statusText,
            data2
          );
        } catch (e) {
        }
      }
      context = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .getStaticContextFromError */ .eF)(
        staticHandler.dataRoutes,
        context,
        errorForSecondRender
      );
      if (context.errors) {
        context.errors = sanitizeErrors(context.errors, serverMode);
      }
      let state2 = {
        loaderData: context.loaderData,
        actionData: context.actionData,
        errors: serializeErrors(context.errors, serverMode)
      };
      entryContext = {
        ...entryContext,
        staticHandlerContext: context,
        serverHandoffString: createServerHandoffString(baseServerHandoff),
        serverHandoffStream: encodeViaTurboStream(
          state2,
          request.signal,
          build.entry.module.streamTimeout,
          serverMode
        ),
        renderMeta: {}
      };
      try {
        return await handleDocumentRequestFunction(
          request,
          context.statusCode,
          headers,
          entryContext,
          loadContext
        );
      } catch (error2) {
        handleError(error2);
        return returnLastResortErrorResponse(error2, serverMode);
      }
    }
  }
}
async function handleResourceRequest(serverMode, build, staticHandler, routeId, request, loadContext, handleError) {
  try {
    let result = await staticHandler.queryRoute(request, {
      routeId,
      requestContext: loadContext,
      generateMiddlewareResponse: build.future.v8_middleware ? async (queryRoute) => {
        try {
          let innerResult = await queryRoute(request);
          return handleQueryRouteResult(innerResult);
        } catch (error) {
          return handleQueryRouteError(error);
        }
      } : void 0
    });
    return handleQueryRouteResult(result);
  } catch (error) {
    return handleQueryRouteError(error);
  }
  function handleQueryRouteResult(result) {
    if ((0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isResponse */ .Sv)(result)) {
      return result;
    }
    if (typeof result === "string") {
      return new Response(result);
    }
    return Response.json(result);
  }
  function handleQueryRouteError(error) {
    if ((0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isResponse */ .Sv)(error)) {
      return error;
    }
    if ((0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isRouteErrorResponse */ .pX)(error)) {
      handleError(error);
      return errorResponseToJson(error, serverMode);
    }
    if (error instanceof Error && error.message === "Expected a response from queryRoute") {
      let newError = new Error(
        "Expected a Response to be returned from resource route handler"
      );
      handleError(newError);
      return returnLastResortErrorResponse(newError, serverMode);
    }
    handleError(error);
    return returnLastResortErrorResponse(error, serverMode);
  }
}
function errorResponseToJson(errorResponse, serverMode) {
  return Response.json(
    serializeError(
      // @ts-expect-error This is "private" from users but intended for internal use
      errorResponse.error || new Error("Unexpected Server Error"),
      serverMode
    ),
    {
      status: errorResponse.status,
      statusText: errorResponse.statusText
    }
  );
}
function returnLastResortErrorResponse(error, serverMode) {
  let message = "Unexpected Server Error";
  if (serverMode !== "production" /* Production */) {
    message += `

${String(error)}`;
  }
  return new Response(message, {
    status: 500,
    headers: {
      "Content-Type": "text/plain"
    }
  });
}
function unwrapResponse(response) {
  let contentType = response.headers.get("Content-Type");
  return contentType && /\bapplication\/json\b/.test(contentType) ? response.body == null ? null : response.json() : response.text();
}

// lib/server-runtime/sessions.ts
function flash(name) {
  return `__flash_${name}__`;
}
var createSession = (initialData = {}, id = "") => {
  let map = new Map(Object.entries(initialData));
  return {
    get id() {
      return id;
    },
    get data() {
      return Object.fromEntries(map);
    },
    has(name) {
      return map.has(name) || map.has(flash(name));
    },
    get(name) {
      if (map.has(name)) return map.get(name);
      let flashName = flash(name);
      if (map.has(flashName)) {
        let value = map.get(flashName);
        map.delete(flashName);
        return value;
      }
      return void 0;
    },
    set(name, value) {
      map.set(name, value);
    },
    flash(name, value) {
      map.set(flash(name), value);
    },
    unset(name) {
      map.delete(name);
    }
  };
};
var isSession = (object) => {
  return object != null && typeof object.id === "string" && typeof object.data !== "undefined" && typeof object.has === "function" && typeof object.get === "function" && typeof object.set === "function" && typeof object.flash === "function" && typeof object.unset === "function";
};
function createSessionStorage({
  cookie: cookieArg,
  createData,
  readData,
  updateData,
  deleteData
}) {
  let cookie = isCookie(cookieArg) ? cookieArg : createCookie(cookieArg?.name || "__session", cookieArg);
  warnOnceAboutSigningSessionCookie(cookie);
  return {
    async getSession(cookieHeader, options) {
      let id = cookieHeader && await cookie.parse(cookieHeader, options);
      let data2 = id && await readData(id);
      return createSession(data2 || {}, id || "");
    },
    async commitSession(session, options) {
      let { id, data: data2 } = session;
      let expires = options?.maxAge != null ? new Date(Date.now() + options.maxAge * 1e3) : options?.expires != null ? options.expires : cookie.expires;
      if (id) {
        await updateData(id, data2, expires);
      } else {
        id = await createData(data2, expires);
      }
      return cookie.serialize(id, options);
    },
    async destroySession(session, options) {
      await deleteData(session.id);
      return cookie.serialize("", {
        ...options,
        maxAge: void 0,
        expires: /* @__PURE__ */ new Date(0)
      });
    }
  };
}
function warnOnceAboutSigningSessionCookie(cookie) {
  (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .warnOnce */ .mc)(
    cookie.isSigned,
    `The "${cookie.name}" cookie is not signed, but session cookies should be signed to prevent tampering on the client before they are sent back to the server. See https://reactrouter.com/explanation/sessions-and-cookies#signing-cookies for more information.`
  );
}

// lib/server-runtime/sessions/cookieStorage.ts
function createCookieSessionStorage({ cookie: cookieArg } = {}) {
  let cookie = isCookie(cookieArg) ? cookieArg : createCookie(cookieArg?.name || "__session", cookieArg);
  warnOnceAboutSigningSessionCookie(cookie);
  return {
    async getSession(cookieHeader, options) {
      return createSession(
        cookieHeader && await cookie.parse(cookieHeader, options) || {}
      );
    },
    async commitSession(session, options) {
      let serializedCookie = await cookie.serialize(session.data, options);
      if (serializedCookie.length > 4096) {
        throw new Error(
          "Cookie length will exceed browser maximum. Length: " + serializedCookie.length
        );
      }
      return serializedCookie;
    },
    async destroySession(_session, options) {
      return cookie.serialize("", {
        ...options,
        maxAge: void 0,
        expires: /* @__PURE__ */ new Date(0)
      });
    }
  };
}

// lib/server-runtime/sessions/memoryStorage.ts
function createMemorySessionStorage({ cookie } = {}) {
  let map = /* @__PURE__ */ new Map();
  return createSessionStorage({
    cookie,
    async createData(data2, expires) {
      let id = Math.random().toString(36).substring(2, 10);
      map.set(id, { data: data2, expires });
      return id;
    },
    async readData(id) {
      if (map.has(id)) {
        let { data: data2, expires } = map.get(id);
        if (!expires || expires > /* @__PURE__ */ new Date()) {
          return data2;
        }
        if (expires) map.delete(id);
      }
      return null;
    },
    async updateData(id, data2, expires) {
      map.set(id, { data: data2, expires });
    },
    async deleteData(id) {
      map.delete(id);
    }
  });
}

// lib/href.ts
function href(path, ...args) {
  let params = args[0];
  let result = path.replace(/\/*\*?$/, "").replace(
    /\/:([\w-]+)(\?)?/g,
    // same regex as in .\router\utils.ts: compilePath().
    (_, param, questionMark) => {
      const isRequired = questionMark === void 0;
      const value = params ? params[param] : void 0;
      if (isRequired && value === void 0) {
        throw new Error(
          `Path '${path}' requires param '${param}' but it was not provided`
        );
      }
      return value === void 0 ? "" : "/" + value;
    }
  );
  if (path.endsWith("*")) {
    const value = params ? params["*"] : void 0;
    if (value !== void 0) {
      result += "/" + value;
    }
  }
  return result || "/";
}

// lib/rsc/server.ssr.tsx


// lib/rsc/html-stream/server.ts
var encoder2 = new TextEncoder();
var trailer = "</body></html>";
function injectRSCPayload(rscStream) {
  let decoder = new TextDecoder();
  let resolveFlightDataPromise;
  let flightDataPromise = new Promise(
    (resolve) => resolveFlightDataPromise = resolve
  );
  let startedRSC = false;
  let buffered = [];
  let timeout = null;
  function flushBufferedChunks(controller) {
    for (let chunk of buffered) {
      let buf = decoder.decode(chunk, { stream: true });
      if (buf.endsWith(trailer)) {
        buf = buf.slice(0, -trailer.length);
      }
      controller.enqueue(encoder2.encode(buf));
    }
    buffered.length = 0;
    timeout = null;
  }
  return new TransformStream({
    transform(chunk, controller) {
      buffered.push(chunk);
      if (timeout) {
        return;
      }
      timeout = setTimeout(async () => {
        flushBufferedChunks(controller);
        if (!startedRSC) {
          startedRSC = true;
          writeRSCStream(rscStream, controller).catch((err) => controller.error(err)).then(resolveFlightDataPromise);
        }
      }, 0);
    },
    async flush(controller) {
      await flightDataPromise;
      if (timeout) {
        clearTimeout(timeout);
        flushBufferedChunks(controller);
      }
      controller.enqueue(encoder2.encode("</body></html>"));
    }
  });
}
async function writeRSCStream(rscStream, controller) {
  let decoder = new TextDecoder("utf-8", { fatal: true });
  const reader = rscStream.getReader();
  try {
    let read;
    while ((read = await reader.read()) && !read.done) {
      const chunk = read.value;
      try {
        writeChunk(
          JSON.stringify(decoder.decode(chunk, { stream: true })),
          controller
        );
      } catch (err) {
        let base64 = JSON.stringify(btoa(String.fromCodePoint(...chunk)));
        writeChunk(
          `Uint8Array.from(atob(${base64}), m => m.codePointAt(0))`,
          controller
        );
      }
    }
  } finally {
    reader.releaseLock();
  }
  let remaining = decoder.decode();
  if (remaining.length) {
    writeChunk(JSON.stringify(remaining), controller);
  }
}
function writeChunk(chunk, controller) {
  controller.enqueue(
    encoder2.encode(
      `<script>${escapeScript(
        `(self.__FLIGHT_DATA||=[]).push(${chunk})`
      )}</script>`
    )
  );
}
function escapeScript(script) {
  return script.replace(/<!--/g, "<\\!--").replace(/<\/(script)/gi, "</\\$1");
}

// lib/rsc/errorBoundaries.tsx

var RSCRouterGlobalErrorBoundary = class extends react__WEBPACK_IMPORTED_MODULE_1__.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, location: props.location };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  static getDerivedStateFromProps(props, state) {
    if (state.location !== props.location) {
      return { error: null, location: props.location };
    }
    return { error: state.error, location: state.location };
  }
  render() {
    if (this.state.error) {
      return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(
        RSCDefaultRootErrorBoundaryImpl,
        {
          error: this.state.error,
          renderAppShell: true
        }
      );
    } else {
      return this.props.children;
    }
  }
};
function ErrorWrapper({
  renderAppShell,
  title,
  children
}) {
  if (!renderAppShell) {
    return children;
  }
  return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement("html", { lang: "en" }, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement("head", null, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement("meta", { charSet: "utf-8" }), /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(
    "meta",
    {
      name: "viewport",
      content: "width=device-width,initial-scale=1,viewport-fit=cover"
    }
  ), /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement("title", null, title)), /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement("body", null, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement("main", { style: { fontFamily: "system-ui, sans-serif", padding: "2rem" } }, children)));
}
function RSCDefaultRootErrorBoundaryImpl({
  error,
  renderAppShell
}) {
  console.error(error);
  let heyDeveloper = /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(
    "script",
    {
      dangerouslySetInnerHTML: {
        __html: `
        console.log(
          "\u{1F4BF} Hey developer \u{1F44B}. You can provide a way better UX than this when your app throws errors. Check out https://reactrouter.com/how-to/error-boundary for more information."
        );
      `
      }
    }
  );
  if ((0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isRouteErrorResponse */ .pX)(error)) {
    return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(
      ErrorWrapper,
      {
        renderAppShell,
        title: "Unhandled Thrown Response!"
      },
      /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement("h1", { style: { fontSize: "24px" } }, error.status, " ", error.statusText),
      _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .ENABLE_DEV_WARNINGS */ .U2 ? heyDeveloper : null
    );
  }
  let errorInstance;
  if (error instanceof Error) {
    errorInstance = error;
  } else {
    let errorString = error == null ? "Unknown Error" : typeof error === "object" && "toString" in error ? error.toString() : JSON.stringify(error);
    errorInstance = new Error(errorString);
  }
  return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(ErrorWrapper, { renderAppShell, title: "Application Error!" }, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement("h1", { style: { fontSize: "24px" } }, "Application Error"), /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(
    "pre",
    {
      style: {
        padding: "2rem",
        background: "hsla(10, 50%, 50%, 0.1)",
        color: "red",
        overflow: "auto"
      }
    },
    errorInstance.stack
  ), heyDeveloper);
}
function RSCDefaultRootErrorBoundary({
  hasRootLayout
}) {
  let error = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .useRouteError */ .r5)();
  if (hasRootLayout === void 0) {
    throw new Error("Missing 'hasRootLayout' prop");
  }
  return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(
    RSCDefaultRootErrorBoundaryImpl,
    {
      renderAppShell: !hasRootLayout,
      error
    }
  );
}

// lib/rsc/route-modules.ts
function createRSCRouteModules(payload) {
  const routeModules = {};
  for (const match of payload.matches) {
    populateRSCRouteModules(routeModules, match);
  }
  return routeModules;
}
function populateRSCRouteModules(routeModules, matches) {
  matches = Array.isArray(matches) ? matches : [matches];
  for (const match of matches) {
    routeModules[match.id] = {
      links: match.links,
      meta: match.meta,
      default: noopComponent
    };
  }
}
var noopComponent = () => null;

// lib/rsc/server.ssr.tsx
var REACT_USE = "use";
var useImpl = /*#__PURE__*/ (react__WEBPACK_IMPORTED_MODULE_1___namespace_cache || (react__WEBPACK_IMPORTED_MODULE_1___namespace_cache = __webpack_require__.t(react__WEBPACK_IMPORTED_MODULE_1__, 2)))[REACT_USE];
function useSafe(promise) {
  if (useImpl) {
    return useImpl(promise);
  }
  throw new Error("React Router v7 requires React 19+ for RSC features.");
}
async function routeRSCServerRequest({
  request,
  fetchServer,
  createFromReadableStream,
  renderHTML,
  hydrate = true
}) {
  const url = new URL(request.url);
  const isDataRequest = isReactServerRequest(url);
  const respondWithRSCPayload = isDataRequest || isManifestRequest(url) || request.headers.has("rsc-action-id");
  const serverResponse = await fetchServer(request);
  if (respondWithRSCPayload || serverResponse.headers.get("React-Router-Resource") === "true") {
    return serverResponse;
  }
  if (!serverResponse.body) {
    throw new Error("Missing body in server response");
  }
  const detectRedirectResponse = serverResponse.clone();
  let serverResponseB = null;
  if (hydrate) {
    serverResponseB = serverResponse.clone();
  }
  const body = serverResponse.body;
  let buffer;
  let streamControllers = [];
  const createStream = () => {
    if (!buffer) {
      buffer = [];
      return body.pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            buffer.push(chunk);
            controller.enqueue(chunk);
            streamControllers.forEach((c) => c.enqueue(chunk));
          },
          flush() {
            streamControllers.forEach((c) => c.close());
            streamControllers = [];
          }
        })
      );
    }
    return new ReadableStream({
      start(controller) {
        buffer.forEach((chunk) => controller.enqueue(chunk));
        streamControllers.push(controller);
      }
    });
  };
  let deepestRenderedBoundaryId = null;
  const getPayload = () => {
    const payloadPromise = Promise.resolve(
      createFromReadableStream(createStream())
    );
    return Object.defineProperties(payloadPromise, {
      _deepestRenderedBoundaryId: {
        get() {
          return deepestRenderedBoundaryId;
        },
        set(boundaryId) {
          deepestRenderedBoundaryId = boundaryId;
        }
      },
      formState: {
        get() {
          return payloadPromise.then(
            (payload) => payload.type === "render" ? payload.formState : void 0
          );
        }
      }
    });
  };
  try {
    if (!detectRedirectResponse.body) {
      throw new Error("Failed to clone server response");
    }
    const payload = await createFromReadableStream(
      detectRedirectResponse.body
    );
    if (serverResponse.status === _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .SINGLE_FETCH_REDIRECT_STATUS */ .gI && payload.type === "redirect") {
      const headers2 = new Headers(serverResponse.headers);
      headers2.delete("Content-Encoding");
      headers2.delete("Content-Length");
      headers2.delete("Content-Type");
      headers2.delete("X-Remix-Response");
      headers2.set("Location", payload.location);
      return new Response(serverResponseB?.body || "", {
        headers: headers2,
        status: payload.status,
        statusText: serverResponse.statusText
      });
    }
    const html = await renderHTML(getPayload);
    const headers = new Headers(serverResponse.headers);
    headers.set("Content-Type", "text/html; charset=utf-8");
    if (!hydrate) {
      return new Response(html, {
        status: serverResponse.status,
        headers
      });
    }
    if (!serverResponseB?.body) {
      throw new Error("Failed to clone server response");
    }
    const body2 = html.pipeThrough(injectRSCPayload(serverResponseB.body));
    return new Response(body2, {
      status: serverResponse.status,
      headers
    });
  } catch (reason) {
    if (reason instanceof Response) {
      return reason;
    }
    try {
      const status = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .isRouteErrorResponse */ .pX)(reason) ? reason.status : 500;
      const html = await renderHTML(() => {
        const decoded = Promise.resolve(
          createFromReadableStream(createStream())
        );
        const payloadPromise = decoded.then(
          (payload) => Object.assign(payload, {
            status,
            errors: deepestRenderedBoundaryId ? {
              [deepestRenderedBoundaryId]: reason
            } : {}
          })
        );
        return Object.defineProperties(payloadPromise, {
          _deepestRenderedBoundaryId: {
            get() {
              return deepestRenderedBoundaryId;
            },
            set(boundaryId) {
              deepestRenderedBoundaryId = boundaryId;
            }
          },
          formState: {
            get() {
              return payloadPromise.then(
                (payload) => payload.type === "render" ? payload.formState : void 0
              );
            }
          }
        });
      });
      const headers = new Headers(serverResponse.headers);
      headers.set("Content-Type", "text/html");
      if (!hydrate) {
        return new Response(html, {
          status,
          headers
        });
      }
      if (!serverResponseB?.body) {
        throw new Error("Failed to clone server response");
      }
      const body2 = html.pipeThrough(injectRSCPayload(serverResponseB.body));
      return new Response(body2, {
        status,
        headers
      });
    } catch {
    }
    throw reason;
  }
}
function RSCStaticRouter({ getPayload }) {
  const decoded = getPayload();
  const payload = useSafe(decoded);
  if (payload.type === "redirect") {
    throw new Response(null, {
      status: payload.status,
      headers: {
        Location: payload.location
      }
    });
  }
  if (payload.type !== "render") return null;
  let patchedLoaderData = { ...payload.loaderData };
  for (const match of payload.matches) {
    if ((0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .shouldHydrateRouteLoader */ .vB)(
      match.id,
      match.clientLoader,
      match.hasLoader,
      false
    ) && (match.hydrateFallbackElement || !match.hasLoader)) {
      delete patchedLoaderData[match.id];
    }
  }
  const context = {
    get _deepestRenderedBoundaryId() {
      return decoded._deepestRenderedBoundaryId ?? null;
    },
    set _deepestRenderedBoundaryId(boundaryId) {
      decoded._deepestRenderedBoundaryId = boundaryId;
    },
    actionData: payload.actionData,
    actionHeaders: {},
    basename: payload.basename,
    errors: payload.errors,
    loaderData: patchedLoaderData,
    loaderHeaders: {},
    location: payload.location,
    statusCode: 200,
    matches: payload.matches.map((match) => ({
      params: match.params,
      pathname: match.pathname,
      pathnameBase: match.pathnameBase,
      route: {
        id: match.id,
        action: match.hasAction || !!match.clientAction,
        handle: match.handle,
        hasErrorBoundary: match.hasErrorBoundary,
        loader: match.hasLoader || !!match.clientLoader,
        index: match.index,
        path: match.path,
        shouldRevalidate: match.shouldRevalidate
      }
    }))
  };
  const router = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .createStaticRouter */ .KD)(
    payload.matches.reduceRight((previous, match) => {
      const route = {
        id: match.id,
        action: match.hasAction || !!match.clientAction,
        element: match.element,
        errorElement: match.errorElement,
        handle: match.handle,
        hasErrorBoundary: !!match.errorElement,
        hydrateFallbackElement: match.hydrateFallbackElement,
        index: match.index,
        loader: match.hasLoader || !!match.clientLoader,
        path: match.path,
        shouldRevalidate: match.shouldRevalidate
      };
      if (previous.length > 0) {
        route.children = previous;
      }
      return [route];
    }, []),
    context
  );
  const frameworkContext = {
    future: {
      // These flags have no runtime impact so can always be false.  If we add
      // flags that drive runtime behavior they'll need to be proxied through.
      v8_middleware: false,
      unstable_subResourceIntegrity: false
    },
    isSpaMode: false,
    ssr: true,
    criticalCss: "",
    manifest: {
      routes: {},
      version: "1",
      url: "",
      entry: {
        module: "",
        imports: []
      }
    },
    routeDiscovery: { mode: "lazy", manifestPath: "/__manifest" },
    routeModules: createRSCRouteModules(payload)
  };
  return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .RSCRouterContext */ .Bu.Provider, { value: true }, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(RSCRouterGlobalErrorBoundary, { location: payload.location }, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .FrameworkContext */ .yL.Provider, { value: frameworkContext }, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(
    _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .StaticRouterProvider */ .je,
    {
      context,
      router,
      hydrate: false,
      nonce: payload.nonce
    }
  ))));
}
function isReactServerRequest(url) {
  return url.pathname.endsWith(".rsc");
}
function isManifestRequest(url) {
  return url.pathname.endsWith(".manifest");
}

// lib/dom/ssr/errors.ts
function deserializeErrors(errors) {
  if (!errors) return null;
  let entries = Object.entries(errors);
  let serialized = {};
  for (let [key, val] of entries) {
    if (val && val.__type === "RouteErrorResponse") {
      serialized[key] = new _chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .ErrorResponseImpl */ .cj(
        val.status,
        val.statusText,
        val.data,
        val.internal === true
      );
    } else if (val && val.__type === "Error") {
      if (val.__subType) {
        let ErrorConstructor = window[val.__subType];
        if (typeof ErrorConstructor === "function") {
          try {
            let error = new ErrorConstructor(val.message);
            error.stack = val.stack;
            serialized[key] = error;
          } catch (e) {
          }
        }
      }
      if (serialized[key] == null) {
        let error = new Error(val.message);
        error.stack = val.stack;
        serialized[key] = error;
      }
    } else {
      serialized[key] = val;
    }
  }
  return serialized;
}

// lib/dom/ssr/hydration.tsx
function getHydrationData({
  state,
  routes,
  getRouteInfo,
  location,
  basename,
  isSpaMode
}) {
  let hydrationData = {
    ...state,
    loaderData: { ...state.loaderData }
  };
  let initialMatches = (0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .matchRoutes */ .ue)(routes, location, basename);
  if (initialMatches) {
    for (let match of initialMatches) {
      let routeId = match.route.id;
      let routeInfo = getRouteInfo(routeId);
      if ((0,_chunk_UIGDSWPH_mjs__WEBPACK_IMPORTED_MODULE_0__/* .shouldHydrateRouteLoader */ .vB)(
        routeId,
        routeInfo.clientLoader,
        routeInfo.hasLoader,
        isSpaMode
      ) && (routeInfo.hasHydrateFallback || !routeInfo.hasLoader)) {
        delete hydrationData.loaderData[routeId];
      } else if (!routeInfo.hasLoader) {
        hydrationData.loaderData[routeId] = null;
      }
    }
  }
  return hydrationData;
}




/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVuZG9yLWNvbW1vbi1iODZjNDM2ZS4xYjMwZDU1ZThjZjc3ZDFiNWY2Ny5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQWE7QUFDYiw2QkFBNkMsRUFBRSxhQUFhLENBQUM7QUFDN0QsVUFBYTtBQUNiLFVBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekIseUJBQXlCO0FBQ3pCLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekIseUJBQXlCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvREFBb0QsS0FBSyxrQ0FBa0MsS0FBSztBQUNoRztBQUNBO0FBQ0E7QUFDQSxrREFBa0Q7QUFDbEQ7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQix1Q0FBdUM7QUFDdkM7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0EsdUJBQXVCLDBFQUFXO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVSx1RkFBd0I7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF1QkUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1yb3V0ZXIvbm9kZV9tb2R1bGVzL2Nvb2tpZS9kaXN0L2luZGV4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LXJvdXRlci9kaXN0L2RldmVsb3BtZW50L2luZGV4Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1yb3V0ZXIvZGlzdC9kZXZlbG9wbWVudC9kb20tZXhwb3J0Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1yb3V0ZXItZG9tL2Rpc3QvaW5kZXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVhY3Qtcm91dGVyL2Rpc3QvZGV2ZWxvcG1lbnQvY2h1bmstSkczWE5ENUEubWpzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5wYXJzZSA9IHBhcnNlO1xuZXhwb3J0cy5zZXJpYWxpemUgPSBzZXJpYWxpemU7XG4vKipcbiAqIFJlZ0V4cCB0byBtYXRjaCBjb29raWUtbmFtZSBpbiBSRkMgNjI2NSBzZWMgNC4xLjFcbiAqIFRoaXMgcmVmZXJzIG91dCB0byB0aGUgb2Jzb2xldGVkIGRlZmluaXRpb24gb2YgdG9rZW4gaW4gUkZDIDI2MTYgc2VjIDIuMlxuICogd2hpY2ggaGFzIGJlZW4gcmVwbGFjZWQgYnkgdGhlIHRva2VuIGRlZmluaXRpb24gaW4gUkZDIDcyMzAgYXBwZW5kaXggQi5cbiAqXG4gKiBjb29raWUtbmFtZSAgICAgICA9IHRva2VuXG4gKiB0b2tlbiAgICAgICAgICAgICA9IDEqdGNoYXJcbiAqIHRjaGFyICAgICAgICAgICAgID0gXCIhXCIgLyBcIiNcIiAvIFwiJFwiIC8gXCIlXCIgLyBcIiZcIiAvIFwiJ1wiIC9cbiAqICAgICAgICAgICAgICAgICAgICAgXCIqXCIgLyBcIitcIiAvIFwiLVwiIC8gXCIuXCIgLyBcIl5cIiAvIFwiX1wiIC9cbiAqICAgICAgICAgICAgICAgICAgICAgXCJgXCIgLyBcInxcIiAvIFwiflwiIC8gRElHSVQgLyBBTFBIQVxuICpcbiAqIE5vdGU6IEFsbG93aW5nIG1vcmUgY2hhcmFjdGVycyAtIGh0dHBzOi8vZ2l0aHViLmNvbS9qc2h0dHAvY29va2llL2lzc3Vlcy8xOTFcbiAqIEFsbG93IHNhbWUgcmFuZ2UgYXMgY29va2llIHZhbHVlLCBleGNlcHQgYD1gLCB3aGljaCBkZWxpbWl0cyBlbmQgb2YgbmFtZS5cbiAqL1xuY29uc3QgY29va2llTmFtZVJlZ0V4cCA9IC9eW1xcdTAwMjEtXFx1MDAzQVxcdTAwM0NcXHUwMDNFLVxcdTAwN0VdKyQvO1xuLyoqXG4gKiBSZWdFeHAgdG8gbWF0Y2ggY29va2llLXZhbHVlIGluIFJGQyA2MjY1IHNlYyA0LjEuMVxuICpcbiAqIGNvb2tpZS12YWx1ZSAgICAgID0gKmNvb2tpZS1vY3RldCAvICggRFFVT1RFICpjb29raWUtb2N0ZXQgRFFVT1RFIClcbiAqIGNvb2tpZS1vY3RldCAgICAgID0gJXgyMSAvICV4MjMtMkIgLyAleDJELTNBIC8gJXgzQy01QiAvICV4NUQtN0VcbiAqICAgICAgICAgICAgICAgICAgICAgOyBVUy1BU0NJSSBjaGFyYWN0ZXJzIGV4Y2x1ZGluZyBDVExzLFxuICogICAgICAgICAgICAgICAgICAgICA7IHdoaXRlc3BhY2UgRFFVT1RFLCBjb21tYSwgc2VtaWNvbG9uLFxuICogICAgICAgICAgICAgICAgICAgICA7IGFuZCBiYWNrc2xhc2hcbiAqXG4gKiBBbGxvd2luZyBtb3JlIGNoYXJhY3RlcnM6IGh0dHBzOi8vZ2l0aHViLmNvbS9qc2h0dHAvY29va2llL2lzc3Vlcy8xOTFcbiAqIENvbW1hLCBiYWNrc2xhc2gsIGFuZCBEUVVPVEUgYXJlIG5vdCBwYXJ0IG9mIHRoZSBwYXJzaW5nIGFsZ29yaXRobS5cbiAqL1xuY29uc3QgY29va2llVmFsdWVSZWdFeHAgPSAvXltcXHUwMDIxLVxcdTAwM0FcXHUwMDNDLVxcdTAwN0VdKiQvO1xuLyoqXG4gKiBSZWdFeHAgdG8gbWF0Y2ggZG9tYWluLXZhbHVlIGluIFJGQyA2MjY1IHNlYyA0LjEuMVxuICpcbiAqIGRvbWFpbi12YWx1ZSAgICAgID0gPHN1YmRvbWFpbj5cbiAqICAgICAgICAgICAgICAgICAgICAgOyBkZWZpbmVkIGluIFtSRkMxMDM0XSwgU2VjdGlvbiAzLjUsIGFzXG4gKiAgICAgICAgICAgICAgICAgICAgIDsgZW5oYW5jZWQgYnkgW1JGQzExMjNdLCBTZWN0aW9uIDIuMVxuICogPHN1YmRvbWFpbj4gICAgICAgPSA8bGFiZWw+IHwgPHN1YmRvbWFpbj4gXCIuXCIgPGxhYmVsPlxuICogPGxhYmVsPiAgICAgICAgICAgPSA8bGV0LWRpZz4gWyBbIDxsZGgtc3RyPiBdIDxsZXQtZGlnPiBdXG4gKiAgICAgICAgICAgICAgICAgICAgIExhYmVscyBtdXN0IGJlIDYzIGNoYXJhY3RlcnMgb3IgbGVzcy5cbiAqICAgICAgICAgICAgICAgICAgICAgJ2xldC1kaWcnIG5vdCAnbGV0dGVyJyBpbiB0aGUgZmlyc3QgY2hhciwgcGVyIFJGQzExMjNcbiAqIDxsZGgtc3RyPiAgICAgICAgID0gPGxldC1kaWctaHlwPiB8IDxsZXQtZGlnLWh5cD4gPGxkaC1zdHI+XG4gKiA8bGV0LWRpZy1oeXA+ICAgICA9IDxsZXQtZGlnPiB8IFwiLVwiXG4gKiA8bGV0LWRpZz4gICAgICAgICA9IDxsZXR0ZXI+IHwgPGRpZ2l0PlxuICogPGxldHRlcj4gICAgICAgICAgPSBhbnkgb25lIG9mIHRoZSA1MiBhbHBoYWJldGljIGNoYXJhY3RlcnMgQSB0aHJvdWdoIFogaW5cbiAqICAgICAgICAgICAgICAgICAgICAgdXBwZXIgY2FzZSBhbmQgYSB0aHJvdWdoIHogaW4gbG93ZXIgY2FzZVxuICogPGRpZ2l0PiAgICAgICAgICAgPSBhbnkgb25lIG9mIHRoZSB0ZW4gZGlnaXRzIDAgdGhyb3VnaCA5XG4gKlxuICogS2VlcCBzdXBwb3J0IGZvciBsZWFkaW5nIGRvdDogaHR0cHM6Ly9naXRodWIuY29tL2pzaHR0cC9jb29raWUvaXNzdWVzLzE3M1xuICpcbiAqID4gKE5vdGUgdGhhdCBhIGxlYWRpbmcgJXgyRSAoXCIuXCIpLCBpZiBwcmVzZW50LCBpcyBpZ25vcmVkIGV2ZW4gdGhvdWdoIHRoYXRcbiAqIGNoYXJhY3RlciBpcyBub3QgcGVybWl0dGVkLCBidXQgYSB0cmFpbGluZyAleDJFIChcIi5cIiksIGlmIHByZXNlbnQsIHdpbGxcbiAqIGNhdXNlIHRoZSB1c2VyIGFnZW50IHRvIGlnbm9yZSB0aGUgYXR0cmlidXRlLilcbiAqL1xuY29uc3QgZG9tYWluVmFsdWVSZWdFeHAgPSAvXihbLl0/W2EtejAtOV0oW2EtejAtOS1dezAsNjF9W2EtejAtOV0pPykoWy5dW2EtejAtOV0oW2EtejAtOS1dezAsNjF9W2EtejAtOV0pPykqJC9pO1xuLyoqXG4gKiBSZWdFeHAgdG8gbWF0Y2ggcGF0aC12YWx1ZSBpbiBSRkMgNjI2NSBzZWMgNC4xLjFcbiAqXG4gKiBwYXRoLXZhbHVlICAgICAgICA9IDxhbnkgQ0hBUiBleGNlcHQgQ1RMcyBvciBcIjtcIj5cbiAqIENIQVIgICAgICAgICAgICAgID0gJXgwMS03RlxuICogICAgICAgICAgICAgICAgICAgICA7IGRlZmluZWQgaW4gUkZDIDUyMzQgYXBwZW5kaXggQi4xXG4gKi9cbmNvbnN0IHBhdGhWYWx1ZVJlZ0V4cCA9IC9eW1xcdTAwMjAtXFx1MDAzQVxcdTAwM0QtXFx1MDA3RV0qJC87XG5jb25zdCBfX3RvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbmNvbnN0IE51bGxPYmplY3QgPSAvKiBAX19QVVJFX18gKi8gKCgpID0+IHtcbiAgICBjb25zdCBDID0gZnVuY3Rpb24gKCkgeyB9O1xuICAgIEMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICByZXR1cm4gQztcbn0pKCk7XG4vKipcbiAqIFBhcnNlIGEgY29va2llIGhlYWRlci5cbiAqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gY29va2llIGhlYWRlciBzdHJpbmcgaW50byBhbiBvYmplY3RcbiAqIFRoZSBvYmplY3QgaGFzIHRoZSB2YXJpb3VzIGNvb2tpZXMgYXMga2V5cyhuYW1lcykgPT4gdmFsdWVzXG4gKi9cbmZ1bmN0aW9uIHBhcnNlKHN0ciwgb3B0aW9ucykge1xuICAgIGNvbnN0IG9iaiA9IG5ldyBOdWxsT2JqZWN0KCk7XG4gICAgY29uc3QgbGVuID0gc3RyLmxlbmd0aDtcbiAgICAvLyBSRkMgNjI2NSBzZWMgNC4xLjEsIFJGQyAyNjE2IDIuMiBkZWZpbmVzIGEgY29va2llIG5hbWUgY29uc2lzdHMgb2Ygb25lIGNoYXIgbWluaW11bSwgcGx1cyAnPScuXG4gICAgaWYgKGxlbiA8IDIpXG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgY29uc3QgZGVjID0gb3B0aW9ucz8uZGVjb2RlIHx8IGRlY29kZTtcbiAgICBsZXQgaW5kZXggPSAwO1xuICAgIGRvIHtcbiAgICAgICAgY29uc3QgZXFJZHggPSBzdHIuaW5kZXhPZihcIj1cIiwgaW5kZXgpO1xuICAgICAgICBpZiAoZXFJZHggPT09IC0xKVxuICAgICAgICAgICAgYnJlYWs7IC8vIE5vIG1vcmUgY29va2llIHBhaXJzLlxuICAgICAgICBjb25zdCBjb2xvbklkeCA9IHN0ci5pbmRleE9mKFwiO1wiLCBpbmRleCk7XG4gICAgICAgIGNvbnN0IGVuZElkeCA9IGNvbG9uSWR4ID09PSAtMSA/IGxlbiA6IGNvbG9uSWR4O1xuICAgICAgICBpZiAoZXFJZHggPiBlbmRJZHgpIHtcbiAgICAgICAgICAgIC8vIGJhY2t0cmFjayBvbiBwcmlvciBzZW1pY29sb25cbiAgICAgICAgICAgIGluZGV4ID0gc3RyLmxhc3RJbmRleE9mKFwiO1wiLCBlcUlkeCAtIDEpICsgMTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleVN0YXJ0SWR4ID0gc3RhcnRJbmRleChzdHIsIGluZGV4LCBlcUlkeCk7XG4gICAgICAgIGNvbnN0IGtleUVuZElkeCA9IGVuZEluZGV4KHN0ciwgZXFJZHgsIGtleVN0YXJ0SWR4KTtcbiAgICAgICAgY29uc3Qga2V5ID0gc3RyLnNsaWNlKGtleVN0YXJ0SWR4LCBrZXlFbmRJZHgpO1xuICAgICAgICAvLyBvbmx5IGFzc2lnbiBvbmNlXG4gICAgICAgIGlmIChvYmpba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBsZXQgdmFsU3RhcnRJZHggPSBzdGFydEluZGV4KHN0ciwgZXFJZHggKyAxLCBlbmRJZHgpO1xuICAgICAgICAgICAgbGV0IHZhbEVuZElkeCA9IGVuZEluZGV4KHN0ciwgZW5kSWR4LCB2YWxTdGFydElkeCk7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGRlYyhzdHIuc2xpY2UodmFsU3RhcnRJZHgsIHZhbEVuZElkeCkpO1xuICAgICAgICAgICAgb2JqW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBpbmRleCA9IGVuZElkeCArIDE7XG4gICAgfSB3aGlsZSAoaW5kZXggPCBsZW4pO1xuICAgIHJldHVybiBvYmo7XG59XG5mdW5jdGlvbiBzdGFydEluZGV4KHN0ciwgaW5kZXgsIG1heCkge1xuICAgIGRvIHtcbiAgICAgICAgY29uc3QgY29kZSA9IHN0ci5jaGFyQ29kZUF0KGluZGV4KTtcbiAgICAgICAgaWYgKGNvZGUgIT09IDB4MjAgLyogICAqLyAmJiBjb2RlICE9PSAweDA5IC8qIFxcdCAqLylcbiAgICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICB9IHdoaWxlICgrK2luZGV4IDwgbWF4KTtcbiAgICByZXR1cm4gbWF4O1xufVxuZnVuY3Rpb24gZW5kSW5kZXgoc3RyLCBpbmRleCwgbWluKSB7XG4gICAgd2hpbGUgKGluZGV4ID4gbWluKSB7XG4gICAgICAgIGNvbnN0IGNvZGUgPSBzdHIuY2hhckNvZGVBdCgtLWluZGV4KTtcbiAgICAgICAgaWYgKGNvZGUgIT09IDB4MjAgLyogICAqLyAmJiBjb2RlICE9PSAweDA5IC8qIFxcdCAqLylcbiAgICAgICAgICAgIHJldHVybiBpbmRleCArIDE7XG4gICAgfVxuICAgIHJldHVybiBtaW47XG59XG4vKipcbiAqIFNlcmlhbGl6ZSBkYXRhIGludG8gYSBjb29raWUgaGVhZGVyLlxuICpcbiAqIFNlcmlhbGl6ZSBhIG5hbWUgdmFsdWUgcGFpciBpbnRvIGEgY29va2llIHN0cmluZyBzdWl0YWJsZSBmb3JcbiAqIGh0dHAgaGVhZGVycy4gQW4gb3B0aW9uYWwgb3B0aW9ucyBvYmplY3Qgc3BlY2lmaWVzIGNvb2tpZSBwYXJhbWV0ZXJzLlxuICpcbiAqIHNlcmlhbGl6ZSgnZm9vJywgJ2JhcicsIHsgaHR0cE9ubHk6IHRydWUgfSlcbiAqICAgPT4gXCJmb289YmFyOyBodHRwT25seVwiXG4gKi9cbmZ1bmN0aW9uIHNlcmlhbGl6ZShuYW1lLCB2YWwsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBlbmMgPSBvcHRpb25zPy5lbmNvZGUgfHwgZW5jb2RlVVJJQ29tcG9uZW50O1xuICAgIGlmICghY29va2llTmFtZVJlZ0V4cC50ZXN0KG5hbWUpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYGFyZ3VtZW50IG5hbWUgaXMgaW52YWxpZDogJHtuYW1lfWApO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZSA9IGVuYyh2YWwpO1xuICAgIGlmICghY29va2llVmFsdWVSZWdFeHAudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgYXJndW1lbnQgdmFsIGlzIGludmFsaWQ6ICR7dmFsfWApO1xuICAgIH1cbiAgICBsZXQgc3RyID0gbmFtZSArIFwiPVwiICsgdmFsdWU7XG4gICAgaWYgKCFvcHRpb25zKVxuICAgICAgICByZXR1cm4gc3RyO1xuICAgIGlmIChvcHRpb25zLm1heEFnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihvcHRpb25zLm1heEFnZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYG9wdGlvbiBtYXhBZ2UgaXMgaW52YWxpZDogJHtvcHRpb25zLm1heEFnZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBzdHIgKz0gXCI7IE1heC1BZ2U9XCIgKyBvcHRpb25zLm1heEFnZTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZG9tYWluKSB7XG4gICAgICAgIGlmICghZG9tYWluVmFsdWVSZWdFeHAudGVzdChvcHRpb25zLmRvbWFpbikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYG9wdGlvbiBkb21haW4gaXMgaW52YWxpZDogJHtvcHRpb25zLmRvbWFpbn1gKTtcbiAgICAgICAgfVxuICAgICAgICBzdHIgKz0gXCI7IERvbWFpbj1cIiArIG9wdGlvbnMuZG9tYWluO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5wYXRoKSB7XG4gICAgICAgIGlmICghcGF0aFZhbHVlUmVnRXhwLnRlc3Qob3B0aW9ucy5wYXRoKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgb3B0aW9uIHBhdGggaXMgaW52YWxpZDogJHtvcHRpb25zLnBhdGh9YCk7XG4gICAgICAgIH1cbiAgICAgICAgc3RyICs9IFwiOyBQYXRoPVwiICsgb3B0aW9ucy5wYXRoO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5leHBpcmVzKSB7XG4gICAgICAgIGlmICghaXNEYXRlKG9wdGlvbnMuZXhwaXJlcykgfHxcbiAgICAgICAgICAgICFOdW1iZXIuaXNGaW5pdGUob3B0aW9ucy5leHBpcmVzLnZhbHVlT2YoKSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYG9wdGlvbiBleHBpcmVzIGlzIGludmFsaWQ6ICR7b3B0aW9ucy5leHBpcmVzfWApO1xuICAgICAgICB9XG4gICAgICAgIHN0ciArPSBcIjsgRXhwaXJlcz1cIiArIG9wdGlvbnMuZXhwaXJlcy50b1VUQ1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5odHRwT25seSkge1xuICAgICAgICBzdHIgKz0gXCI7IEh0dHBPbmx5XCI7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLnNlY3VyZSkge1xuICAgICAgICBzdHIgKz0gXCI7IFNlY3VyZVwiO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5wYXJ0aXRpb25lZCkge1xuICAgICAgICBzdHIgKz0gXCI7IFBhcnRpdGlvbmVkXCI7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLnByaW9yaXR5KSB7XG4gICAgICAgIGNvbnN0IHByaW9yaXR5ID0gdHlwZW9mIG9wdGlvbnMucHJpb3JpdHkgPT09IFwic3RyaW5nXCJcbiAgICAgICAgICAgID8gb3B0aW9ucy5wcmlvcml0eS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICAgICAgc3dpdGNoIChwcmlvcml0eSkge1xuICAgICAgICAgICAgY2FzZSBcImxvd1wiOlxuICAgICAgICAgICAgICAgIHN0ciArPSBcIjsgUHJpb3JpdHk9TG93XCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwibWVkaXVtXCI6XG4gICAgICAgICAgICAgICAgc3RyICs9IFwiOyBQcmlvcml0eT1NZWRpdW1cIjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJoaWdoXCI6XG4gICAgICAgICAgICAgICAgc3RyICs9IFwiOyBQcmlvcml0eT1IaWdoXCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYG9wdGlvbiBwcmlvcml0eSBpcyBpbnZhbGlkOiAke29wdGlvbnMucHJpb3JpdHl9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuc2FtZVNpdGUpIHtcbiAgICAgICAgY29uc3Qgc2FtZVNpdGUgPSB0eXBlb2Ygb3B0aW9ucy5zYW1lU2l0ZSA9PT0gXCJzdHJpbmdcIlxuICAgICAgICAgICAgPyBvcHRpb25zLnNhbWVTaXRlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIDogb3B0aW9ucy5zYW1lU2l0ZTtcbiAgICAgICAgc3dpdGNoIChzYW1lU2l0ZSkge1xuICAgICAgICAgICAgY2FzZSB0cnVlOlxuICAgICAgICAgICAgY2FzZSBcInN0cmljdFwiOlxuICAgICAgICAgICAgICAgIHN0ciArPSBcIjsgU2FtZVNpdGU9U3RyaWN0XCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwibGF4XCI6XG4gICAgICAgICAgICAgICAgc3RyICs9IFwiOyBTYW1lU2l0ZT1MYXhcIjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJub25lXCI6XG4gICAgICAgICAgICAgICAgc3RyICs9IFwiOyBTYW1lU2l0ZT1Ob25lXCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYG9wdGlvbiBzYW1lU2l0ZSBpcyBpbnZhbGlkOiAke29wdGlvbnMuc2FtZVNpdGV9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0cjtcbn1cbi8qKlxuICogVVJMLWRlY29kZSBzdHJpbmcgdmFsdWUuIE9wdGltaXplZCB0byBza2lwIG5hdGl2ZSBjYWxsIHdoZW4gbm8gJS5cbiAqL1xuZnVuY3Rpb24gZGVjb2RlKHN0cikge1xuICAgIGlmIChzdHIuaW5kZXhPZihcIiVcIikgPT09IC0xKVxuICAgICAgICByZXR1cm4gc3RyO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG59XG4vKipcbiAqIERldGVybWluZSBpZiB2YWx1ZSBpcyBhIERhdGUuXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgICByZXR1cm4gX190b1N0cmluZy5jYWxsKHZhbCkgPT09IFwiW29iamVjdCBEYXRlXVwiO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwiLyoqXG4gKiByZWFjdC1yb3V0ZXIgdjcuOS41XG4gKlxuICogQ29weXJpZ2h0IChjKSBSZW1peCBTb2Z0d2FyZSBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFLm1kIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKlxuICogQGxpY2Vuc2UgTUlUXG4gKi9cblwidXNlIGNsaWVudFwiO1xuaW1wb3J0IHtcbiAgUlNDRGVmYXVsdFJvb3RFcnJvckJvdW5kYXJ5LFxuICBSU0NTdGF0aWNSb3V0ZXIsXG4gIFNlcnZlck1vZGUsXG4gIFNlcnZlclJvdXRlcixcbiAgY3JlYXRlQ29va2llLFxuICBjcmVhdGVDb29raWVTZXNzaW9uU3RvcmFnZSxcbiAgY3JlYXRlTWVtb3J5U2Vzc2lvblN0b3JhZ2UsXG4gIGNyZWF0ZVJlcXVlc3RIYW5kbGVyLFxuICBjcmVhdGVSb3V0ZXNTdHViLFxuICBjcmVhdGVTZXNzaW9uLFxuICBjcmVhdGVTZXNzaW9uU3RvcmFnZSxcbiAgZGVzZXJpYWxpemVFcnJvcnMsXG4gIGdldEh5ZHJhdGlvbkRhdGEsXG4gIGhyZWYsXG4gIGlzQ29va2llLFxuICBpc1Nlc3Npb24sXG4gIHJvdXRlUlNDU2VydmVyUmVxdWVzdCxcbiAgc2V0RGV2U2VydmVySG9va3Ncbn0gZnJvbSBcIi4vY2h1bmstSkczWE5ENUEubWpzXCI7XG5pbXBvcnQge1xuICBBY3Rpb24sXG4gIEF3YWl0LFxuICBBd2FpdENvbnRleHRQcm92aWRlcixcbiAgQnJvd3NlclJvdXRlcixcbiAgRGF0YVJvdXRlckNvbnRleHQsXG4gIERhdGFSb3V0ZXJTdGF0ZUNvbnRleHQsXG4gIEVycm9yUmVzcG9uc2VJbXBsLFxuICBGZXRjaGVyc0NvbnRleHQsXG4gIEZvcm0sXG4gIEZyYW1ld29ya0NvbnRleHQsXG4gIEhhc2hSb3V0ZXIsXG4gIEhpc3RvcnlSb3V0ZXIsXG4gIElETEVfQkxPQ0tFUixcbiAgSURMRV9GRVRDSEVSLFxuICBJRExFX05BVklHQVRJT04sXG4gIExpbmssXG4gIExpbmtzLFxuICBMb2NhdGlvbkNvbnRleHQsXG4gIE1lbW9yeVJvdXRlcixcbiAgTWV0YSxcbiAgTmF2TGluayxcbiAgTmF2aWdhdGUsXG4gIE5hdmlnYXRpb25Db250ZXh0LFxuICBPdXRsZXQsXG4gIFByZWZldGNoUGFnZUxpbmtzLFxuICBSZW1peEVycm9yQm91bmRhcnksXG4gIFJvdXRlLFxuICBSb3V0ZUNvbnRleHQsXG4gIFJvdXRlcixcbiAgUm91dGVyQ29udGV4dFByb3ZpZGVyLFxuICBSb3V0ZXJQcm92aWRlcixcbiAgUm91dGVzLFxuICBTY3JpcHRzLFxuICBTY3JvbGxSZXN0b3JhdGlvbixcbiAgU2luZ2xlRmV0Y2hSZWRpcmVjdFN5bWJvbCxcbiAgU3RhdGljUm91dGVyLFxuICBTdGF0aWNSb3V0ZXJQcm92aWRlcixcbiAgVmlld1RyYW5zaXRpb25Db250ZXh0LFxuICBXaXRoQ29tcG9uZW50UHJvcHMsXG4gIFdpdGhFcnJvckJvdW5kYXJ5UHJvcHMsXG4gIFdpdGhIeWRyYXRlRmFsbGJhY2tQcm9wcyxcbiAgY3JlYXRlQnJvd3Nlckhpc3RvcnksXG4gIGNyZWF0ZUJyb3dzZXJSb3V0ZXIsXG4gIGNyZWF0ZUNsaWVudFJvdXRlcyxcbiAgY3JlYXRlQ2xpZW50Um91dGVzV2l0aEhNUlJldmFsaWRhdGlvbk9wdE91dCxcbiAgY3JlYXRlQ29udGV4dCxcbiAgY3JlYXRlSGFzaFJvdXRlcixcbiAgY3JlYXRlTWVtb3J5Um91dGVyLFxuICBjcmVhdGVQYXRoLFxuICBjcmVhdGVSb3V0ZXIsXG4gIGNyZWF0ZVJvdXRlc0Zyb21DaGlsZHJlbixcbiAgY3JlYXRlUm91dGVzRnJvbUVsZW1lbnRzLFxuICBjcmVhdGVTZWFyY2hQYXJhbXMsXG4gIGNyZWF0ZVN0YXRpY0hhbmRsZXIyIGFzIGNyZWF0ZVN0YXRpY0hhbmRsZXIsXG4gIGNyZWF0ZVN0YXRpY1JvdXRlcixcbiAgZGF0YSxcbiAgZGVjb2RlVmlhVHVyYm9TdHJlYW0sXG4gIGdlbmVyYXRlUGF0aCxcbiAgZ2V0UGF0Y2hSb3V0ZXNPbk5hdmlnYXRpb25GdW5jdGlvbixcbiAgZ2V0VHVyYm9TdHJlYW1TaW5nbGVGZXRjaERhdGFTdHJhdGVneSxcbiAgaHlkcmF0aW9uUm91dGVQcm9wZXJ0aWVzLFxuICBpbnZhcmlhbnQsXG4gIGlzUm91dGVFcnJvclJlc3BvbnNlLFxuICBtYXBSb3V0ZVByb3BlcnRpZXMsXG4gIG1hdGNoUGF0aCxcbiAgbWF0Y2hSb3V0ZXMsXG4gIHBhcnNlUGF0aCxcbiAgcmVkaXJlY3QsXG4gIHJlZGlyZWN0RG9jdW1lbnQsXG4gIHJlbmRlck1hdGNoZXMsXG4gIHJlcGxhY2UsXG4gIHJlc29sdmVQYXRoLFxuICBzaG91bGRIeWRyYXRlUm91dGVMb2FkZXIsXG4gIHVzZUFjdGlvbkRhdGEsXG4gIHVzZUFzeW5jRXJyb3IsXG4gIHVzZUFzeW5jVmFsdWUsXG4gIHVzZUJlZm9yZVVubG9hZCxcbiAgdXNlQmxvY2tlcixcbiAgdXNlRmV0Y2hlcixcbiAgdXNlRmV0Y2hlcnMsXG4gIHVzZUZvZ09GV2FyRGlzY292ZXJ5LFxuICB1c2VGb3JtQWN0aW9uLFxuICB1c2VIcmVmLFxuICB1c2VJblJvdXRlckNvbnRleHQsXG4gIHVzZUxpbmtDbGlja0hhbmRsZXIsXG4gIHVzZUxvYWRlckRhdGEsXG4gIHVzZUxvY2F0aW9uLFxuICB1c2VNYXRjaCxcbiAgdXNlTWF0Y2hlcyxcbiAgdXNlTmF2aWdhdGUsXG4gIHVzZU5hdmlnYXRpb24sXG4gIHVzZU5hdmlnYXRpb25UeXBlLFxuICB1c2VPdXRsZXQsXG4gIHVzZU91dGxldENvbnRleHQsXG4gIHVzZVBhcmFtcyxcbiAgdXNlUHJvbXB0LFxuICB1c2VSZXNvbHZlZFBhdGgsXG4gIHVzZVJldmFsaWRhdG9yLFxuICB1c2VSb3V0ZSxcbiAgdXNlUm91dGVFcnJvcixcbiAgdXNlUm91dGVMb2FkZXJEYXRhLFxuICB1c2VSb3V0ZXMsXG4gIHVzZVNjcm9sbFJlc3RvcmF0aW9uLFxuICB1c2VTZWFyY2hQYXJhbXMsXG4gIHVzZVN1Ym1pdCxcbiAgdXNlVmlld1RyYW5zaXRpb25TdGF0ZSxcbiAgd2l0aENvbXBvbmVudFByb3BzLFxuICB3aXRoRXJyb3JCb3VuZGFyeVByb3BzLFxuICB3aXRoSHlkcmF0ZUZhbGxiYWNrUHJvcHNcbn0gZnJvbSBcIi4vY2h1bmstVUlHRFNXUEgubWpzXCI7XG5leHBvcnQge1xuICBBd2FpdCxcbiAgQnJvd3NlclJvdXRlcixcbiAgRm9ybSxcbiAgSGFzaFJvdXRlcixcbiAgSURMRV9CTE9DS0VSLFxuICBJRExFX0ZFVENIRVIsXG4gIElETEVfTkFWSUdBVElPTixcbiAgTGluayxcbiAgTGlua3MsXG4gIE1lbW9yeVJvdXRlcixcbiAgTWV0YSxcbiAgTmF2TGluayxcbiAgTmF2aWdhdGUsXG4gIEFjdGlvbiBhcyBOYXZpZ2F0aW9uVHlwZSxcbiAgT3V0bGV0LFxuICBQcmVmZXRjaFBhZ2VMaW5rcyxcbiAgUm91dGUsXG4gIFJvdXRlcixcbiAgUm91dGVyQ29udGV4dFByb3ZpZGVyLFxuICBSb3V0ZXJQcm92aWRlcixcbiAgUm91dGVzLFxuICBTY3JpcHRzLFxuICBTY3JvbGxSZXN0b3JhdGlvbixcbiAgU2VydmVyUm91dGVyLFxuICBTdGF0aWNSb3V0ZXIsXG4gIFN0YXRpY1JvdXRlclByb3ZpZGVyLFxuICBBd2FpdENvbnRleHRQcm92aWRlciBhcyBVTlNBRkVfQXdhaXRDb250ZXh0UHJvdmlkZXIsXG4gIERhdGFSb3V0ZXJDb250ZXh0IGFzIFVOU0FGRV9EYXRhUm91dGVyQ29udGV4dCxcbiAgRGF0YVJvdXRlclN0YXRlQ29udGV4dCBhcyBVTlNBRkVfRGF0YVJvdXRlclN0YXRlQ29udGV4dCxcbiAgRXJyb3JSZXNwb25zZUltcGwgYXMgVU5TQUZFX0Vycm9yUmVzcG9uc2VJbXBsLFxuICBGZXRjaGVyc0NvbnRleHQgYXMgVU5TQUZFX0ZldGNoZXJzQ29udGV4dCxcbiAgRnJhbWV3b3JrQ29udGV4dCBhcyBVTlNBRkVfRnJhbWV3b3JrQ29udGV4dCxcbiAgTG9jYXRpb25Db250ZXh0IGFzIFVOU0FGRV9Mb2NhdGlvbkNvbnRleHQsXG4gIE5hdmlnYXRpb25Db250ZXh0IGFzIFVOU0FGRV9OYXZpZ2F0aW9uQ29udGV4dCxcbiAgUlNDRGVmYXVsdFJvb3RFcnJvckJvdW5kYXJ5IGFzIFVOU0FGRV9SU0NEZWZhdWx0Um9vdEVycm9yQm91bmRhcnksXG4gIFJlbWl4RXJyb3JCb3VuZGFyeSBhcyBVTlNBRkVfUmVtaXhFcnJvckJvdW5kYXJ5LFxuICBSb3V0ZUNvbnRleHQgYXMgVU5TQUZFX1JvdXRlQ29udGV4dCxcbiAgU2VydmVyTW9kZSBhcyBVTlNBRkVfU2VydmVyTW9kZSxcbiAgU2luZ2xlRmV0Y2hSZWRpcmVjdFN5bWJvbCBhcyBVTlNBRkVfU2luZ2xlRmV0Y2hSZWRpcmVjdFN5bWJvbCxcbiAgVmlld1RyYW5zaXRpb25Db250ZXh0IGFzIFVOU0FGRV9WaWV3VHJhbnNpdGlvbkNvbnRleHQsXG4gIFdpdGhDb21wb25lbnRQcm9wcyBhcyBVTlNBRkVfV2l0aENvbXBvbmVudFByb3BzLFxuICBXaXRoRXJyb3JCb3VuZGFyeVByb3BzIGFzIFVOU0FGRV9XaXRoRXJyb3JCb3VuZGFyeVByb3BzLFxuICBXaXRoSHlkcmF0ZUZhbGxiYWNrUHJvcHMgYXMgVU5TQUZFX1dpdGhIeWRyYXRlRmFsbGJhY2tQcm9wcyxcbiAgY3JlYXRlQnJvd3Nlckhpc3RvcnkgYXMgVU5TQUZFX2NyZWF0ZUJyb3dzZXJIaXN0b3J5LFxuICBjcmVhdGVDbGllbnRSb3V0ZXMgYXMgVU5TQUZFX2NyZWF0ZUNsaWVudFJvdXRlcyxcbiAgY3JlYXRlQ2xpZW50Um91dGVzV2l0aEhNUlJldmFsaWRhdGlvbk9wdE91dCBhcyBVTlNBRkVfY3JlYXRlQ2xpZW50Um91dGVzV2l0aEhNUlJldmFsaWRhdGlvbk9wdE91dCxcbiAgY3JlYXRlUm91dGVyIGFzIFVOU0FGRV9jcmVhdGVSb3V0ZXIsXG4gIGRlY29kZVZpYVR1cmJvU3RyZWFtIGFzIFVOU0FGRV9kZWNvZGVWaWFUdXJib1N0cmVhbSxcbiAgZGVzZXJpYWxpemVFcnJvcnMgYXMgVU5TQUZFX2Rlc2VyaWFsaXplRXJyb3JzLFxuICBnZXRIeWRyYXRpb25EYXRhIGFzIFVOU0FGRV9nZXRIeWRyYXRpb25EYXRhLFxuICBnZXRQYXRjaFJvdXRlc09uTmF2aWdhdGlvbkZ1bmN0aW9uIGFzIFVOU0FGRV9nZXRQYXRjaFJvdXRlc09uTmF2aWdhdGlvbkZ1bmN0aW9uLFxuICBnZXRUdXJib1N0cmVhbVNpbmdsZUZldGNoRGF0YVN0cmF0ZWd5IGFzIFVOU0FGRV9nZXRUdXJib1N0cmVhbVNpbmdsZUZldGNoRGF0YVN0cmF0ZWd5LFxuICBoeWRyYXRpb25Sb3V0ZVByb3BlcnRpZXMgYXMgVU5TQUZFX2h5ZHJhdGlvblJvdXRlUHJvcGVydGllcyxcbiAgaW52YXJpYW50IGFzIFVOU0FGRV9pbnZhcmlhbnQsXG4gIG1hcFJvdXRlUHJvcGVydGllcyBhcyBVTlNBRkVfbWFwUm91dGVQcm9wZXJ0aWVzLFxuICBzaG91bGRIeWRyYXRlUm91dGVMb2FkZXIgYXMgVU5TQUZFX3Nob3VsZEh5ZHJhdGVSb3V0ZUxvYWRlcixcbiAgdXNlRm9nT0ZXYXJEaXNjb3ZlcnkgYXMgVU5TQUZFX3VzZUZvZ09GV2FyRGlzY292ZXJ5LFxuICB1c2VTY3JvbGxSZXN0b3JhdGlvbiBhcyBVTlNBRkVfdXNlU2Nyb2xsUmVzdG9yYXRpb24sXG4gIHdpdGhDb21wb25lbnRQcm9wcyBhcyBVTlNBRkVfd2l0aENvbXBvbmVudFByb3BzLFxuICB3aXRoRXJyb3JCb3VuZGFyeVByb3BzIGFzIFVOU0FGRV93aXRoRXJyb3JCb3VuZGFyeVByb3BzLFxuICB3aXRoSHlkcmF0ZUZhbGxiYWNrUHJvcHMgYXMgVU5TQUZFX3dpdGhIeWRyYXRlRmFsbGJhY2tQcm9wcyxcbiAgY3JlYXRlQnJvd3NlclJvdXRlcixcbiAgY3JlYXRlQ29udGV4dCxcbiAgY3JlYXRlQ29va2llLFxuICBjcmVhdGVDb29raWVTZXNzaW9uU3RvcmFnZSxcbiAgY3JlYXRlSGFzaFJvdXRlcixcbiAgY3JlYXRlTWVtb3J5Um91dGVyLFxuICBjcmVhdGVNZW1vcnlTZXNzaW9uU3RvcmFnZSxcbiAgY3JlYXRlUGF0aCxcbiAgY3JlYXRlUmVxdWVzdEhhbmRsZXIsXG4gIGNyZWF0ZVJvdXRlc0Zyb21DaGlsZHJlbixcbiAgY3JlYXRlUm91dGVzRnJvbUVsZW1lbnRzLFxuICBjcmVhdGVSb3V0ZXNTdHViLFxuICBjcmVhdGVTZWFyY2hQYXJhbXMsXG4gIGNyZWF0ZVNlc3Npb24sXG4gIGNyZWF0ZVNlc3Npb25TdG9yYWdlLFxuICBjcmVhdGVTdGF0aWNIYW5kbGVyLFxuICBjcmVhdGVTdGF0aWNSb3V0ZXIsXG4gIGRhdGEsXG4gIGdlbmVyYXRlUGF0aCxcbiAgaHJlZixcbiAgaXNDb29raWUsXG4gIGlzUm91dGVFcnJvclJlc3BvbnNlLFxuICBpc1Nlc3Npb24sXG4gIG1hdGNoUGF0aCxcbiAgbWF0Y2hSb3V0ZXMsXG4gIHBhcnNlUGF0aCxcbiAgcmVkaXJlY3QsXG4gIHJlZGlyZWN0RG9jdW1lbnQsXG4gIHJlbmRlck1hdGNoZXMsXG4gIHJlcGxhY2UsXG4gIHJlc29sdmVQYXRoLFxuICBIaXN0b3J5Um91dGVyIGFzIHVuc3RhYmxlX0hpc3RvcnlSb3V0ZXIsXG4gIFJTQ1N0YXRpY1JvdXRlciBhcyB1bnN0YWJsZV9SU0NTdGF0aWNSb3V0ZXIsXG4gIHJvdXRlUlNDU2VydmVyUmVxdWVzdCBhcyB1bnN0YWJsZV9yb3V0ZVJTQ1NlcnZlclJlcXVlc3QsXG4gIHNldERldlNlcnZlckhvb2tzIGFzIHVuc3RhYmxlX3NldERldlNlcnZlckhvb2tzLFxuICB1c2VQcm9tcHQgYXMgdW5zdGFibGVfdXNlUHJvbXB0LFxuICB1c2VSb3V0ZSBhcyB1bnN0YWJsZV91c2VSb3V0ZSxcbiAgdXNlQWN0aW9uRGF0YSxcbiAgdXNlQXN5bmNFcnJvcixcbiAgdXNlQXN5bmNWYWx1ZSxcbiAgdXNlQmVmb3JlVW5sb2FkLFxuICB1c2VCbG9ja2VyLFxuICB1c2VGZXRjaGVyLFxuICB1c2VGZXRjaGVycyxcbiAgdXNlRm9ybUFjdGlvbixcbiAgdXNlSHJlZixcbiAgdXNlSW5Sb3V0ZXJDb250ZXh0LFxuICB1c2VMaW5rQ2xpY2tIYW5kbGVyLFxuICB1c2VMb2FkZXJEYXRhLFxuICB1c2VMb2NhdGlvbixcbiAgdXNlTWF0Y2gsXG4gIHVzZU1hdGNoZXMsXG4gIHVzZU5hdmlnYXRlLFxuICB1c2VOYXZpZ2F0aW9uLFxuICB1c2VOYXZpZ2F0aW9uVHlwZSxcbiAgdXNlT3V0bGV0LFxuICB1c2VPdXRsZXRDb250ZXh0LFxuICB1c2VQYXJhbXMsXG4gIHVzZVJlc29sdmVkUGF0aCxcbiAgdXNlUmV2YWxpZGF0b3IsXG4gIHVzZVJvdXRlRXJyb3IsXG4gIHVzZVJvdXRlTG9hZGVyRGF0YSxcbiAgdXNlUm91dGVzLFxuICB1c2VTZWFyY2hQYXJhbXMsXG4gIHVzZVN1Ym1pdCxcbiAgdXNlVmlld1RyYW5zaXRpb25TdGF0ZVxufTtcbiIsIi8qKlxuICogcmVhY3Qtcm91dGVyIHY3LjkuNVxuICpcbiAqIENvcHlyaWdodCAoYykgUmVtaXggU29mdHdhcmUgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRS5tZCBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICpcbiAqIEBsaWNlbnNlIE1JVFxuICovXG5cInVzZSBjbGllbnRcIjtcbmltcG9ydCB7XG4gIFJTQ1JvdXRlckdsb2JhbEVycm9yQm91bmRhcnksXG4gIGRlc2VyaWFsaXplRXJyb3JzLFxuICBnZXRIeWRyYXRpb25EYXRhLFxuICBwb3B1bGF0ZVJTQ1JvdXRlTW9kdWxlc1xufSBmcm9tIFwiLi9jaHVuay1KRzNYTkQ1QS5tanNcIjtcbmltcG9ydCB7XG4gIENSSVRJQ0FMX0NTU19EQVRBX0FUVFJJQlVURSxcbiAgRXJyb3JSZXNwb25zZUltcGwsXG4gIEZyYW1ld29ya0NvbnRleHQsXG4gIFJTQ1JvdXRlckNvbnRleHQsXG4gIFJlbWl4RXJyb3JCb3VuZGFyeSxcbiAgUm91dGVyUHJvdmlkZXIsXG4gIFVOU1RBQkxFX1RyYW5zaXRpb25FbmFibGVkUm91dGVyUHJvdmlkZXIsXG4gIGNyZWF0ZUJyb3dzZXJIaXN0b3J5LFxuICBjcmVhdGVDbGllbnRSb3V0ZXMsXG4gIGNyZWF0ZUNsaWVudFJvdXRlc1dpdGhITVJSZXZhbGlkYXRpb25PcHRPdXQsXG4gIGNyZWF0ZUNvbnRleHQsXG4gIGNyZWF0ZVJlcXVlc3RJbml0LFxuICBjcmVhdGVSb3V0ZXIsXG4gIGRlY29kZVZpYVR1cmJvU3RyZWFtLFxuICBnZXRQYXRjaFJvdXRlc09uTmF2aWdhdGlvbkZ1bmN0aW9uLFxuICBnZXRTaW5nbGVGZXRjaERhdGFTdHJhdGVneUltcGwsXG4gIGdldFR1cmJvU3RyZWFtU2luZ2xlRmV0Y2hEYXRhU3RyYXRlZ3ksXG4gIGh5ZHJhdGlvblJvdXRlUHJvcGVydGllcyxcbiAgaW52YXJpYW50LFxuICBpc011dGF0aW9uTWV0aG9kLFxuICBtYXBSb3V0ZVByb3BlcnRpZXMsXG4gIG5vQWN0aW9uRGVmaW5lZEVycm9yLFxuICBzZXRJc0h5ZHJhdGVkLFxuICBzaG91bGRIeWRyYXRlUm91dGVMb2FkZXIsXG4gIHNpbmdsZUZldGNoVXJsLFxuICBzdHJpcEluZGV4UGFyYW0sXG4gIHVzZUZvZ09GV2FyRGlzY292ZXJ5XG59IGZyb20gXCIuL2NodW5rLVVJR0RTV1BILm1qc1wiO1xuXG4vLyBsaWIvZG9tLWV4cG9ydC9kb20tcm91dGVyLXByb3ZpZGVyLnRzeFxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgKiBhcyBSZWFjdERPTSBmcm9tIFwicmVhY3QtZG9tXCI7XG5mdW5jdGlvbiBSb3V0ZXJQcm92aWRlcjIocHJvcHMpIHtcbiAgcmV0dXJuIC8qIEBfX1BVUkVfXyAqLyBSZWFjdC5jcmVhdGVFbGVtZW50KFJvdXRlclByb3ZpZGVyLCB7IGZsdXNoU3luYzogUmVhY3RET00uZmx1c2hTeW5jLCAuLi5wcm9wcyB9KTtcbn1cblxuLy8gbGliL2RvbS1leHBvcnQvaHlkcmF0ZWQtcm91dGVyLnRzeFxuaW1wb3J0ICogYXMgUmVhY3QyIGZyb20gXCJyZWFjdFwiO1xudmFyIHNzckluZm8gPSBudWxsO1xudmFyIHJvdXRlciA9IG51bGw7XG5mdW5jdGlvbiBpbml0U3NySW5mbygpIHtcbiAgaWYgKCFzc3JJbmZvICYmIHdpbmRvdy5fX3JlYWN0Um91dGVyQ29udGV4dCAmJiB3aW5kb3cuX19yZWFjdFJvdXRlck1hbmlmZXN0ICYmIHdpbmRvdy5fX3JlYWN0Um91dGVyUm91dGVNb2R1bGVzKSB7XG4gICAgaWYgKHdpbmRvdy5fX3JlYWN0Um91dGVyTWFuaWZlc3Quc3JpID09PSB0cnVlKSB7XG4gICAgICBjb25zdCBpbXBvcnRNYXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwic2NyaXB0W3JyLWltcG9ydG1hcF1cIik7XG4gICAgICBpZiAoaW1wb3J0TWFwPy50ZXh0Q29udGVudCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHdpbmRvdy5fX3JlYWN0Um91dGVyTWFuaWZlc3Quc3JpID0gSlNPTi5wYXJzZShcbiAgICAgICAgICAgIGltcG9ydE1hcC50ZXh0Q29udGVudFxuICAgICAgICAgICkuaW50ZWdyaXR5O1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHBhcnNlIGltcG9ydCBtYXBcIiwgZXJyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBzc3JJbmZvID0ge1xuICAgICAgY29udGV4dDogd2luZG93Ll9fcmVhY3RSb3V0ZXJDb250ZXh0LFxuICAgICAgbWFuaWZlc3Q6IHdpbmRvdy5fX3JlYWN0Um91dGVyTWFuaWZlc3QsXG4gICAgICByb3V0ZU1vZHVsZXM6IHdpbmRvdy5fX3JlYWN0Um91dGVyUm91dGVNb2R1bGVzLFxuICAgICAgc3RhdGVEZWNvZGluZ1Byb21pc2U6IHZvaWQgMCxcbiAgICAgIHJvdXRlcjogdm9pZCAwLFxuICAgICAgcm91dGVySW5pdGlhbGl6ZWQ6IGZhbHNlXG4gICAgfTtcbiAgfVxufVxuZnVuY3Rpb24gY3JlYXRlSHlkcmF0ZWRSb3V0ZXIoe1xuICBnZXRDb250ZXh0LFxuICB1bnN0YWJsZV9pbnN0cnVtZW50YXRpb25zXG59KSB7XG4gIGluaXRTc3JJbmZvKCk7XG4gIGlmICghc3NySW5mbykge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIFwiWW91IG11c3QgYmUgdXNpbmcgdGhlIFNTUiBmZWF0dXJlcyBvZiBSZWFjdCBSb3V0ZXIgaW4gb3JkZXIgdG8gc2tpcCBwYXNzaW5nIGEgYHJvdXRlcmAgcHJvcCB0byBgPFJvdXRlclByb3ZpZGVyPmBcIlxuICAgICk7XG4gIH1cbiAgbGV0IGxvY2FsU3NySW5mbyA9IHNzckluZm87XG4gIGlmICghc3NySW5mby5zdGF0ZURlY29kaW5nUHJvbWlzZSkge1xuICAgIGxldCBzdHJlYW0gPSBzc3JJbmZvLmNvbnRleHQuc3RyZWFtO1xuICAgIGludmFyaWFudChzdHJlYW0sIFwiTm8gc3RyZWFtIGZvdW5kIGZvciBzaW5nbGUgZmV0Y2ggZGVjb2RpbmdcIik7XG4gICAgc3NySW5mby5jb250ZXh0LnN0cmVhbSA9IHZvaWQgMDtcbiAgICBzc3JJbmZvLnN0YXRlRGVjb2RpbmdQcm9taXNlID0gZGVjb2RlVmlhVHVyYm9TdHJlYW0oc3RyZWFtLCB3aW5kb3cpLnRoZW4oKHZhbHVlKSA9PiB7XG4gICAgICBzc3JJbmZvLmNvbnRleHQuc3RhdGUgPSB2YWx1ZS52YWx1ZTtcbiAgICAgIGxvY2FsU3NySW5mby5zdGF0ZURlY29kaW5nUHJvbWlzZS52YWx1ZSA9IHRydWU7XG4gICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgIGxvY2FsU3NySW5mby5zdGF0ZURlY29kaW5nUHJvbWlzZS5lcnJvciA9IGU7XG4gICAgfSk7XG4gIH1cbiAgaWYgKHNzckluZm8uc3RhdGVEZWNvZGluZ1Byb21pc2UuZXJyb3IpIHtcbiAgICB0aHJvdyBzc3JJbmZvLnN0YXRlRGVjb2RpbmdQcm9taXNlLmVycm9yO1xuICB9XG4gIGlmICghc3NySW5mby5zdGF0ZURlY29kaW5nUHJvbWlzZS52YWx1ZSkge1xuICAgIHRocm93IHNzckluZm8uc3RhdGVEZWNvZGluZ1Byb21pc2U7XG4gIH1cbiAgbGV0IHJvdXRlcyA9IGNyZWF0ZUNsaWVudFJvdXRlcyhcbiAgICBzc3JJbmZvLm1hbmlmZXN0LnJvdXRlcyxcbiAgICBzc3JJbmZvLnJvdXRlTW9kdWxlcyxcbiAgICBzc3JJbmZvLmNvbnRleHQuc3RhdGUsXG4gICAgc3NySW5mby5jb250ZXh0LnNzcixcbiAgICBzc3JJbmZvLmNvbnRleHQuaXNTcGFNb2RlXG4gICk7XG4gIGxldCBoeWRyYXRpb25EYXRhID0gdm9pZCAwO1xuICBpZiAoc3NySW5mby5jb250ZXh0LmlzU3BhTW9kZSkge1xuICAgIGxldCB7IGxvYWRlckRhdGEgfSA9IHNzckluZm8uY29udGV4dC5zdGF0ZTtcbiAgICBpZiAoc3NySW5mby5tYW5pZmVzdC5yb3V0ZXMucm9vdD8uaGFzTG9hZGVyICYmIGxvYWRlckRhdGEgJiYgXCJyb290XCIgaW4gbG9hZGVyRGF0YSkge1xuICAgICAgaHlkcmF0aW9uRGF0YSA9IHtcbiAgICAgICAgbG9hZGVyRGF0YToge1xuICAgICAgICAgIHJvb3Q6IGxvYWRlckRhdGEucm9vdFxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBoeWRyYXRpb25EYXRhID0gZ2V0SHlkcmF0aW9uRGF0YSh7XG4gICAgICBzdGF0ZTogc3NySW5mby5jb250ZXh0LnN0YXRlLFxuICAgICAgcm91dGVzLFxuICAgICAgZ2V0Um91dGVJbmZvOiAocm91dGVJZCkgPT4gKHtcbiAgICAgICAgY2xpZW50TG9hZGVyOiBzc3JJbmZvLnJvdXRlTW9kdWxlc1tyb3V0ZUlkXT8uY2xpZW50TG9hZGVyLFxuICAgICAgICBoYXNMb2FkZXI6IHNzckluZm8ubWFuaWZlc3Qucm91dGVzW3JvdXRlSWRdPy5oYXNMb2FkZXIgPT09IHRydWUsXG4gICAgICAgIGhhc0h5ZHJhdGVGYWxsYmFjazogc3NySW5mby5yb3V0ZU1vZHVsZXNbcm91dGVJZF0/Lkh5ZHJhdGVGYWxsYmFjayAhPSBudWxsXG4gICAgICB9KSxcbiAgICAgIGxvY2F0aW9uOiB3aW5kb3cubG9jYXRpb24sXG4gICAgICBiYXNlbmFtZTogd2luZG93Ll9fcmVhY3RSb3V0ZXJDb250ZXh0Py5iYXNlbmFtZSxcbiAgICAgIGlzU3BhTW9kZTogc3NySW5mby5jb250ZXh0LmlzU3BhTW9kZVxuICAgIH0pO1xuICAgIGlmIChoeWRyYXRpb25EYXRhICYmIGh5ZHJhdGlvbkRhdGEuZXJyb3JzKSB7XG4gICAgICBoeWRyYXRpb25EYXRhLmVycm9ycyA9IGRlc2VyaWFsaXplRXJyb3JzKGh5ZHJhdGlvbkRhdGEuZXJyb3JzKTtcbiAgICB9XG4gIH1cbiAgbGV0IHJvdXRlcjIgPSBjcmVhdGVSb3V0ZXIoe1xuICAgIHJvdXRlcyxcbiAgICBoaXN0b3J5OiBjcmVhdGVCcm93c2VySGlzdG9yeSgpLFxuICAgIGJhc2VuYW1lOiBzc3JJbmZvLmNvbnRleHQuYmFzZW5hbWUsXG4gICAgZ2V0Q29udGV4dCxcbiAgICBoeWRyYXRpb25EYXRhLFxuICAgIGh5ZHJhdGlvblJvdXRlUHJvcGVydGllcyxcbiAgICB1bnN0YWJsZV9pbnN0cnVtZW50YXRpb25zLFxuICAgIG1hcFJvdXRlUHJvcGVydGllcyxcbiAgICBmdXR1cmU6IHtcbiAgICAgIG1pZGRsZXdhcmU6IHNzckluZm8uY29udGV4dC5mdXR1cmUudjhfbWlkZGxld2FyZVxuICAgIH0sXG4gICAgZGF0YVN0cmF0ZWd5OiBnZXRUdXJib1N0cmVhbVNpbmdsZUZldGNoRGF0YVN0cmF0ZWd5KFxuICAgICAgKCkgPT4gcm91dGVyMixcbiAgICAgIHNzckluZm8ubWFuaWZlc3QsXG4gICAgICBzc3JJbmZvLnJvdXRlTW9kdWxlcyxcbiAgICAgIHNzckluZm8uY29udGV4dC5zc3IsXG4gICAgICBzc3JJbmZvLmNvbnRleHQuYmFzZW5hbWVcbiAgICApLFxuICAgIHBhdGNoUm91dGVzT25OYXZpZ2F0aW9uOiBnZXRQYXRjaFJvdXRlc09uTmF2aWdhdGlvbkZ1bmN0aW9uKFxuICAgICAgc3NySW5mby5tYW5pZmVzdCxcbiAgICAgIHNzckluZm8ucm91dGVNb2R1bGVzLFxuICAgICAgc3NySW5mby5jb250ZXh0LnNzcixcbiAgICAgIHNzckluZm8uY29udGV4dC5yb3V0ZURpc2NvdmVyeSxcbiAgICAgIHNzckluZm8uY29udGV4dC5pc1NwYU1vZGUsXG4gICAgICBzc3JJbmZvLmNvbnRleHQuYmFzZW5hbWVcbiAgICApXG4gIH0pO1xuICBzc3JJbmZvLnJvdXRlciA9IHJvdXRlcjI7XG4gIGlmIChyb3V0ZXIyLnN0YXRlLmluaXRpYWxpemVkKSB7XG4gICAgc3NySW5mby5yb3V0ZXJJbml0aWFsaXplZCA9IHRydWU7XG4gICAgcm91dGVyMi5pbml0aWFsaXplKCk7XG4gIH1cbiAgcm91dGVyMi5jcmVhdGVSb3V0ZXNGb3JITVIgPSAvKiBzcGFjZXIgc28gdHMtaWdub3JlIGRvZXMgbm90IGFmZmVjdCB0aGUgcmlnaHQgaGFuZCBvZiB0aGUgYXNzaWdubWVudCAqL1xuICBjcmVhdGVDbGllbnRSb3V0ZXNXaXRoSE1SUmV2YWxpZGF0aW9uT3B0T3V0O1xuICB3aW5kb3cuX19yZWFjdFJvdXRlckRhdGFSb3V0ZXIgPSByb3V0ZXIyO1xuICByZXR1cm4gcm91dGVyMjtcbn1cbmZ1bmN0aW9uIEh5ZHJhdGVkUm91dGVyKHByb3BzKSB7XG4gIGlmICghcm91dGVyKSB7XG4gICAgcm91dGVyID0gY3JlYXRlSHlkcmF0ZWRSb3V0ZXIoe1xuICAgICAgZ2V0Q29udGV4dDogcHJvcHMuZ2V0Q29udGV4dCxcbiAgICAgIHVuc3RhYmxlX2luc3RydW1lbnRhdGlvbnM6IHByb3BzLnVuc3RhYmxlX2luc3RydW1lbnRhdGlvbnNcbiAgICB9KTtcbiAgfVxuICBsZXQgW2NyaXRpY2FsQ3NzLCBzZXRDcml0aWNhbENzc10gPSBSZWFjdDIudXNlU3RhdGUoXG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwiZGV2ZWxvcG1lbnRcIiA/IHNzckluZm8/LmNvbnRleHQuY3JpdGljYWxDc3MgOiB2b2lkIDBcbiAgKTtcbiAgUmVhY3QyLnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcImRldmVsb3BtZW50XCIpIHtcbiAgICAgIHNldENyaXRpY2FsQ3NzKHZvaWQgMCk7XG4gICAgfVxuICB9LCBbXSk7XG4gIFJlYWN0Mi51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNyaXRpY2FsQ3NzID09PSB2b2lkIDApIHtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYFske0NSSVRJQ0FMX0NTU19EQVRBX0FUVFJJQlVURX1dYCkuZm9yRWFjaCgoZWxlbWVudCkgPT4gZWxlbWVudC5yZW1vdmUoKSk7XG4gICAgfVxuICB9LCBbY3JpdGljYWxDc3NdKTtcbiAgbGV0IFtsb2NhdGlvbjIsIHNldExvY2F0aW9uXSA9IFJlYWN0Mi51c2VTdGF0ZShyb3V0ZXIuc3RhdGUubG9jYXRpb24pO1xuICBSZWFjdDIudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc3NySW5mbyAmJiBzc3JJbmZvLnJvdXRlciAmJiAhc3NySW5mby5yb3V0ZXJJbml0aWFsaXplZCkge1xuICAgICAgc3NySW5mby5yb3V0ZXJJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICBzc3JJbmZvLnJvdXRlci5pbml0aWFsaXplKCk7XG4gICAgfVxuICB9LCBbXSk7XG4gIFJlYWN0Mi51c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzc3JJbmZvICYmIHNzckluZm8ucm91dGVyKSB7XG4gICAgICByZXR1cm4gc3NySW5mby5yb3V0ZXIuc3Vic2NyaWJlKChuZXdTdGF0ZSkgPT4ge1xuICAgICAgICBpZiAobmV3U3RhdGUubG9jYXRpb24gIT09IGxvY2F0aW9uMikge1xuICAgICAgICAgIHNldExvY2F0aW9uKG5ld1N0YXRlLmxvY2F0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9LCBbbG9jYXRpb24yXSk7XG4gIGludmFyaWFudChzc3JJbmZvLCBcInNzckluZm8gdW5hdmFpbGFibGUgZm9yIEh5ZHJhdGVkUm91dGVyXCIpO1xuICB1c2VGb2dPRldhckRpc2NvdmVyeShcbiAgICByb3V0ZXIsXG4gICAgc3NySW5mby5tYW5pZmVzdCxcbiAgICBzc3JJbmZvLnJvdXRlTW9kdWxlcyxcbiAgICBzc3JJbmZvLmNvbnRleHQuc3NyLFxuICAgIHNzckluZm8uY29udGV4dC5yb3V0ZURpc2NvdmVyeSxcbiAgICBzc3JJbmZvLmNvbnRleHQuaXNTcGFNb2RlXG4gICk7XG4gIHJldHVybiAoXG4gICAgLy8gVGhpcyBmcmFnbWVudCBpcyBpbXBvcnRhbnQgdG8gZW5zdXJlIHdlIG1hdGNoIHRoZSA8U2VydmVyUm91dGVyPiBKU1hcbiAgICAvLyBzdHJ1Y3R1cmUgc28gdGhhdCB1c2VJZCB2YWx1ZXMgaHlkcmF0ZSBjb3JyZWN0bHlcbiAgICAvKiBAX19QVVJFX18gKi8gUmVhY3QyLmNyZWF0ZUVsZW1lbnQoUmVhY3QyLkZyYWdtZW50LCBudWxsLCAvKiBAX19QVVJFX18gKi8gUmVhY3QyLmNyZWF0ZUVsZW1lbnQoXG4gICAgICBGcmFtZXdvcmtDb250ZXh0LlByb3ZpZGVyLFxuICAgICAge1xuICAgICAgICB2YWx1ZToge1xuICAgICAgICAgIG1hbmlmZXN0OiBzc3JJbmZvLm1hbmlmZXN0LFxuICAgICAgICAgIHJvdXRlTW9kdWxlczogc3NySW5mby5yb3V0ZU1vZHVsZXMsXG4gICAgICAgICAgZnV0dXJlOiBzc3JJbmZvLmNvbnRleHQuZnV0dXJlLFxuICAgICAgICAgIGNyaXRpY2FsQ3NzLFxuICAgICAgICAgIHNzcjogc3NySW5mby5jb250ZXh0LnNzcixcbiAgICAgICAgICBpc1NwYU1vZGU6IHNzckluZm8uY29udGV4dC5pc1NwYU1vZGUsXG4gICAgICAgICAgcm91dGVEaXNjb3Zlcnk6IHNzckluZm8uY29udGV4dC5yb3V0ZURpc2NvdmVyeVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLyogQF9fUFVSRV9fICovIFJlYWN0Mi5jcmVhdGVFbGVtZW50KFJlbWl4RXJyb3JCb3VuZGFyeSwgeyBsb2NhdGlvbjogbG9jYXRpb24yIH0sIC8qIEBfX1BVUkVfXyAqLyBSZWFjdDIuY3JlYXRlRWxlbWVudChcbiAgICAgICAgUm91dGVyUHJvdmlkZXIyLFxuICAgICAgICB7XG4gICAgICAgICAgcm91dGVyLFxuICAgICAgICAgIHVuc3RhYmxlX29uRXJyb3I6IHByb3BzLnVuc3RhYmxlX29uRXJyb3JcbiAgICAgICAgfVxuICAgICAgKSlcbiAgICApLCAvKiBAX19QVVJFX18gKi8gUmVhY3QyLmNyZWF0ZUVsZW1lbnQoUmVhY3QyLkZyYWdtZW50LCBudWxsKSlcbiAgKTtcbn1cblxuLy8gbGliL3JzYy9icm93c2VyLnRzeFxuaW1wb3J0ICogYXMgUmVhY3QzIGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0ICogYXMgUmVhY3RET00yIGZyb20gXCJyZWFjdC1kb21cIjtcbmZ1bmN0aW9uIGNyZWF0ZUNhbGxTZXJ2ZXIoe1xuICBjcmVhdGVGcm9tUmVhZGFibGVTdHJlYW0sXG4gIGNyZWF0ZVRlbXBvcmFyeVJlZmVyZW5jZVNldCxcbiAgZW5jb2RlUmVwbHksXG4gIGZldGNoOiBmZXRjaEltcGxlbWVudGF0aW9uID0gZmV0Y2hcbn0pIHtcbiAgY29uc3QgZ2xvYmFsVmFyID0gd2luZG93O1xuICBsZXQgbGFuZGVkQWN0aW9uSWQgPSAwO1xuICByZXR1cm4gYXN5bmMgKGlkLCBhcmdzKSA9PiB7XG4gICAgbGV0IGFjdGlvbklkID0gZ2xvYmFsVmFyLl9fcm91dGVyQWN0aW9uSUQgPSAoZ2xvYmFsVmFyLl9fcm91dGVyQWN0aW9uSUQgPz8gKGdsb2JhbFZhci5fX3JvdXRlckFjdGlvbklEID0gMCkpICsgMTtcbiAgICBjb25zdCB0ZW1wb3JhcnlSZWZlcmVuY2VzID0gY3JlYXRlVGVtcG9yYXJ5UmVmZXJlbmNlU2V0KCk7XG4gICAgY29uc3QgcGF5bG9hZFByb21pc2UgPSBmZXRjaEltcGxlbWVudGF0aW9uKFxuICAgICAgbmV3IFJlcXVlc3QobG9jYXRpb24uaHJlZiwge1xuICAgICAgICBib2R5OiBhd2FpdCBlbmNvZGVSZXBseShhcmdzLCB7IHRlbXBvcmFyeVJlZmVyZW5jZXMgfSksXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBBY2NlcHQ6IFwidGV4dC94LWNvbXBvbmVudFwiLFxuICAgICAgICAgIFwicnNjLWFjdGlvbi1pZFwiOiBpZFxuICAgICAgICB9XG4gICAgICB9KVxuICAgICkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgIGlmICghcmVzcG9uc2UuYm9keSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyByZXNwb25zZSBib2R5XCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNyZWF0ZUZyb21SZWFkYWJsZVN0cmVhbShyZXNwb25zZS5ib2R5LCB7XG4gICAgICAgIHRlbXBvcmFyeVJlZmVyZW5jZXNcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGdsb2JhbFZhci5fX3JlYWN0Um91dGVyRGF0YVJvdXRlci5fX3NldFBlbmRpbmdSZXJlbmRlcihcbiAgICAgIFByb21pc2UucmVzb2x2ZShwYXlsb2FkUHJvbWlzZSkudGhlbihhc3luYyAocGF5bG9hZCkgPT4ge1xuICAgICAgICBpZiAocGF5bG9hZC50eXBlID09PSBcInJlZGlyZWN0XCIpIHtcbiAgICAgICAgICBpZiAocGF5bG9hZC5yZWxvYWQgfHwgaXNFeHRlcm5hbExvY2F0aW9uKHBheWxvYWQubG9jYXRpb24pKSB7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHBheWxvYWQubG9jYXRpb247XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGdsb2JhbFZhci5fX3JlYWN0Um91dGVyRGF0YVJvdXRlci5uYXZpZ2F0ZShwYXlsb2FkLmxvY2F0aW9uLCB7XG4gICAgICAgICAgICAgIHJlcGxhY2U6IHBheWxvYWQucmVwbGFjZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGF5bG9hZC50eXBlICE9PSBcImFjdGlvblwiKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBwYXlsb2FkIHR5cGVcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVyZW5kZXIgPSBhd2FpdCBwYXlsb2FkLnJlcmVuZGVyO1xuICAgICAgICBpZiAocmVyZW5kZXIgJiYgbGFuZGVkQWN0aW9uSWQgPCBhY3Rpb25JZCAmJiBnbG9iYWxWYXIuX19yb3V0ZXJBY3Rpb25JRCA8PSBhY3Rpb25JZCkge1xuICAgICAgICAgIGlmIChyZXJlbmRlci50eXBlID09PSBcInJlZGlyZWN0XCIpIHtcbiAgICAgICAgICAgIGlmIChyZXJlbmRlci5yZWxvYWQgfHwgaXNFeHRlcm5hbExvY2F0aW9uKHJlcmVuZGVyLmxvY2F0aW9uKSkge1xuICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHJlcmVuZGVyLmxvY2F0aW9uO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICBnbG9iYWxWYXIuX19yZWFjdFJvdXRlckRhdGFSb3V0ZXIubmF2aWdhdGUocmVyZW5kZXIubG9jYXRpb24sIHtcbiAgICAgICAgICAgICAgICByZXBsYWNlOiByZXJlbmRlci5yZXBsYWNlXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGxldCBsYXN0TWF0Y2g7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1hdGNoIG9mIHJlcmVuZGVyLm1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgZ2xvYmFsVmFyLl9fcmVhY3RSb3V0ZXJEYXRhUm91dGVyLnBhdGNoUm91dGVzKFxuICAgICAgICAgICAgICAgIGxhc3RNYXRjaD8uaWQgPz8gbnVsbCxcbiAgICAgICAgICAgICAgICBbY3JlYXRlUm91dGVGcm9tU2VydmVyTWFuaWZlc3QobWF0Y2gpXSxcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIGxhc3RNYXRjaCA9IG1hdGNoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2luZG93Ll9fcmVhY3RSb3V0ZXJEYXRhUm91dGVyLl9pbnRlcm5hbFNldFN0YXRlRG9Ob3RVc2VPcllvdVdpbGxCcmVha1lvdXJBcHAoXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2FkZXJEYXRhOiBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICBnbG9iYWxWYXIuX19yZWFjdFJvdXRlckRhdGFSb3V0ZXIuc3RhdGUubG9hZGVyRGF0YSxcbiAgICAgICAgICAgICAgICAgIHJlcmVuZGVyLmxvYWRlckRhdGFcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGVycm9yczogcmVyZW5kZXIuZXJyb3JzID8gT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgICAgZ2xvYmFsVmFyLl9fcmVhY3RSb3V0ZXJEYXRhUm91dGVyLnN0YXRlLmVycm9ycyxcbiAgICAgICAgICAgICAgICAgIHJlcmVuZGVyLmVycm9yc1xuICAgICAgICAgICAgICAgICkgOiBudWxsXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICB9O1xuICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgfSlcbiAgICApO1xuICAgIHJldHVybiBwYXlsb2FkUHJvbWlzZS50aGVuKChwYXlsb2FkKSA9PiB7XG4gICAgICBpZiAocGF5bG9hZC50eXBlICE9PSBcImFjdGlvblwiICYmIHBheWxvYWQudHlwZSAhPT0gXCJyZWRpcmVjdFwiKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgcGF5bG9hZCB0eXBlXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBheWxvYWQuYWN0aW9uUmVzdWx0O1xuICAgIH0pO1xuICB9O1xufVxuZnVuY3Rpb24gY3JlYXRlUm91dGVyRnJvbVBheWxvYWQoe1xuICBmZXRjaEltcGxlbWVudGF0aW9uLFxuICBjcmVhdGVGcm9tUmVhZGFibGVTdHJlYW0sXG4gIGdldENvbnRleHQsXG4gIHBheWxvYWRcbn0pIHtcbiAgY29uc3QgZ2xvYmFsVmFyID0gd2luZG93O1xuICBpZiAoZ2xvYmFsVmFyLl9fcmVhY3RSb3V0ZXJEYXRhUm91dGVyICYmIGdsb2JhbFZhci5fX3JlYWN0Um91dGVyUm91dGVNb2R1bGVzKVxuICAgIHJldHVybiB7XG4gICAgICByb3V0ZXI6IGdsb2JhbFZhci5fX3JlYWN0Um91dGVyRGF0YVJvdXRlcixcbiAgICAgIHJvdXRlTW9kdWxlczogZ2xvYmFsVmFyLl9fcmVhY3RSb3V0ZXJSb3V0ZU1vZHVsZXNcbiAgICB9O1xuICBpZiAocGF5bG9hZC50eXBlICE9PSBcInJlbmRlclwiKSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHBheWxvYWQgdHlwZVwiKTtcbiAgZ2xvYmFsVmFyLl9fcmVhY3RSb3V0ZXJSb3V0ZU1vZHVsZXMgPSBnbG9iYWxWYXIuX19yZWFjdFJvdXRlclJvdXRlTW9kdWxlcyA/PyB7fTtcbiAgcG9wdWxhdGVSU0NSb3V0ZU1vZHVsZXMoZ2xvYmFsVmFyLl9fcmVhY3RSb3V0ZXJSb3V0ZU1vZHVsZXMsIHBheWxvYWQubWF0Y2hlcyk7XG4gIGxldCBwYXRjaGVzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgcGF5bG9hZC5wYXRjaGVzPy5mb3JFYWNoKChwYXRjaCkgPT4ge1xuICAgIGludmFyaWFudChwYXRjaC5wYXJlbnRJZCwgXCJJbnZhbGlkIHBhdGNoIHBhcmVudElkXCIpO1xuICAgIGlmICghcGF0Y2hlcy5oYXMocGF0Y2gucGFyZW50SWQpKSB7XG4gICAgICBwYXRjaGVzLnNldChwYXRjaC5wYXJlbnRJZCwgW10pO1xuICAgIH1cbiAgICBwYXRjaGVzLmdldChwYXRjaC5wYXJlbnRJZCk/LnB1c2gocGF0Y2gpO1xuICB9KTtcbiAgbGV0IHJvdXRlcyA9IHBheWxvYWQubWF0Y2hlcy5yZWR1Y2VSaWdodCgocHJldmlvdXMsIG1hdGNoKSA9PiB7XG4gICAgY29uc3Qgcm91dGUgPSBjcmVhdGVSb3V0ZUZyb21TZXJ2ZXJNYW5pZmVzdChcbiAgICAgIG1hdGNoLFxuICAgICAgcGF5bG9hZFxuICAgICk7XG4gICAgaWYgKHByZXZpb3VzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJvdXRlLmNoaWxkcmVuID0gcHJldmlvdXM7XG4gICAgICBsZXQgY2hpbGRyZW5Ub1BhdGNoID0gcGF0Y2hlcy5nZXQobWF0Y2guaWQpO1xuICAgICAgaWYgKGNoaWxkcmVuVG9QYXRjaCkge1xuICAgICAgICByb3V0ZS5jaGlsZHJlbi5wdXNoKFxuICAgICAgICAgIC4uLmNoaWxkcmVuVG9QYXRjaC5tYXAoKHIpID0+IGNyZWF0ZVJvdXRlRnJvbVNlcnZlck1hbmlmZXN0KHIpKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gW3JvdXRlXTtcbiAgfSwgW10pO1xuICBnbG9iYWxWYXIuX19yZWFjdFJvdXRlckRhdGFSb3V0ZXIgPSBjcmVhdGVSb3V0ZXIoe1xuICAgIHJvdXRlcyxcbiAgICBnZXRDb250ZXh0LFxuICAgIGJhc2VuYW1lOiBwYXlsb2FkLmJhc2VuYW1lLFxuICAgIGhpc3Rvcnk6IGNyZWF0ZUJyb3dzZXJIaXN0b3J5KCksXG4gICAgaHlkcmF0aW9uRGF0YTogZ2V0SHlkcmF0aW9uRGF0YSh7XG4gICAgICBzdGF0ZToge1xuICAgICAgICBsb2FkZXJEYXRhOiBwYXlsb2FkLmxvYWRlckRhdGEsXG4gICAgICAgIGFjdGlvbkRhdGE6IHBheWxvYWQuYWN0aW9uRGF0YSxcbiAgICAgICAgZXJyb3JzOiBwYXlsb2FkLmVycm9yc1xuICAgICAgfSxcbiAgICAgIHJvdXRlcyxcbiAgICAgIGdldFJvdXRlSW5mbzogKHJvdXRlSWQpID0+IHtcbiAgICAgICAgbGV0IG1hdGNoID0gcGF5bG9hZC5tYXRjaGVzLmZpbmQoKG0pID0+IG0uaWQgPT09IHJvdXRlSWQpO1xuICAgICAgICBpbnZhcmlhbnQobWF0Y2gsIFwiUm91dGUgbm90IGZvdW5kIGluIHBheWxvYWRcIik7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY2xpZW50TG9hZGVyOiBtYXRjaC5jbGllbnRMb2FkZXIsXG4gICAgICAgICAgaGFzTG9hZGVyOiBtYXRjaC5oYXNMb2FkZXIsXG4gICAgICAgICAgaGFzSHlkcmF0ZUZhbGxiYWNrOiBtYXRjaC5oeWRyYXRlRmFsbGJhY2tFbGVtZW50ICE9IG51bGxcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBsb2NhdGlvbjogcGF5bG9hZC5sb2NhdGlvbixcbiAgICAgIGJhc2VuYW1lOiBwYXlsb2FkLmJhc2VuYW1lLFxuICAgICAgaXNTcGFNb2RlOiBmYWxzZVxuICAgIH0pLFxuICAgIGFzeW5jIHBhdGNoUm91dGVzT25OYXZpZ2F0aW9uKHsgcGF0aCwgc2lnbmFsIH0pIHtcbiAgICAgIGlmIChkaXNjb3ZlcmVkUGF0aHMuaGFzKHBhdGgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGF3YWl0IGZldGNoQW5kQXBwbHlNYW5pZmVzdFBhdGNoZXMoXG4gICAgICAgIFtwYXRoXSxcbiAgICAgICAgY3JlYXRlRnJvbVJlYWRhYmxlU3RyZWFtLFxuICAgICAgICBmZXRjaEltcGxlbWVudGF0aW9uLFxuICAgICAgICBzaWduYWxcbiAgICAgICk7XG4gICAgfSxcbiAgICAvLyBGSVhNRTogUGFzcyBgYnVpbGQuc3NyYCBpbnRvIHRoaXMgZnVuY3Rpb25cbiAgICBkYXRhU3RyYXRlZ3k6IGdldFJTQ1NpbmdsZUZldGNoRGF0YVN0cmF0ZWd5KFxuICAgICAgKCkgPT4gZ2xvYmFsVmFyLl9fcmVhY3RSb3V0ZXJEYXRhUm91dGVyLFxuICAgICAgdHJ1ZSxcbiAgICAgIHBheWxvYWQuYmFzZW5hbWUsXG4gICAgICBjcmVhdGVGcm9tUmVhZGFibGVTdHJlYW0sXG4gICAgICBmZXRjaEltcGxlbWVudGF0aW9uXG4gICAgKVxuICB9KTtcbiAgaWYgKGdsb2JhbFZhci5fX3JlYWN0Um91dGVyRGF0YVJvdXRlci5zdGF0ZS5pbml0aWFsaXplZCkge1xuICAgIGdsb2JhbFZhci5fX3JvdXRlckluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICBnbG9iYWxWYXIuX19yZWFjdFJvdXRlckRhdGFSb3V0ZXIuaW5pdGlhbGl6ZSgpO1xuICB9IGVsc2Uge1xuICAgIGdsb2JhbFZhci5fX3JvdXRlckluaXRpYWxpemVkID0gZmFsc2U7XG4gIH1cbiAgbGV0IGxhc3RMb2FkZXJEYXRhID0gdm9pZCAwO1xuICBnbG9iYWxWYXIuX19yZWFjdFJvdXRlckRhdGFSb3V0ZXIuc3Vic2NyaWJlKCh7IGxvYWRlckRhdGEsIGFjdGlvbkRhdGEgfSkgPT4ge1xuICAgIGlmIChsYXN0TG9hZGVyRGF0YSAhPT0gbG9hZGVyRGF0YSkge1xuICAgICAgZ2xvYmFsVmFyLl9fcm91dGVyQWN0aW9uSUQgPSAoZ2xvYmFsVmFyLl9fcm91dGVyQWN0aW9uSUQgPz8gKGdsb2JhbFZhci5fX3JvdXRlckFjdGlvbklEID0gMCkpICsgMTtcbiAgICB9XG4gIH0pO1xuICBnbG9iYWxWYXIuX19yZWFjdFJvdXRlckRhdGFSb3V0ZXIuX3VwZGF0ZVJvdXRlc0ZvckhNUiA9IChyb3V0ZVVwZGF0ZUJ5Um91dGVJZCkgPT4ge1xuICAgIGNvbnN0IG9sZFJvdXRlcyA9IHdpbmRvdy5fX3JlYWN0Um91dGVyRGF0YVJvdXRlci5yb3V0ZXM7XG4gICAgY29uc3QgbmV3Um91dGVzID0gW107XG4gICAgZnVuY3Rpb24gd2Fsa1JvdXRlcyhyb3V0ZXMyLCBwYXJlbnRJZCkge1xuICAgICAgcmV0dXJuIHJvdXRlczIubWFwKChyb3V0ZSkgPT4ge1xuICAgICAgICBjb25zdCByb3V0ZVVwZGF0ZSA9IHJvdXRlVXBkYXRlQnlSb3V0ZUlkLmdldChyb3V0ZS5pZCk7XG4gICAgICAgIGlmIChyb3V0ZVVwZGF0ZSkge1xuICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgIHJvdXRlTW9kdWxlLFxuICAgICAgICAgICAgaGFzQWN0aW9uLFxuICAgICAgICAgICAgaGFzQ29tcG9uZW50LFxuICAgICAgICAgICAgaGFzRXJyb3JCb3VuZGFyeSxcbiAgICAgICAgICAgIGhhc0xvYWRlclxuICAgICAgICAgIH0gPSByb3V0ZVVwZGF0ZTtcbiAgICAgICAgICBjb25zdCBuZXdSb3V0ZSA9IGNyZWF0ZVJvdXRlRnJvbVNlcnZlck1hbmlmZXN0KHtcbiAgICAgICAgICAgIGNsaWVudEFjdGlvbjogcm91dGVNb2R1bGUuY2xpZW50QWN0aW9uLFxuICAgICAgICAgICAgY2xpZW50TG9hZGVyOiByb3V0ZU1vZHVsZS5jbGllbnRMb2FkZXIsXG4gICAgICAgICAgICBlbGVtZW50OiByb3V0ZS5lbGVtZW50LFxuICAgICAgICAgICAgZXJyb3JFbGVtZW50OiByb3V0ZS5lcnJvckVsZW1lbnQsXG4gICAgICAgICAgICBoYW5kbGU6IHJvdXRlLmhhbmRsZSxcbiAgICAgICAgICAgIGhhc0FjdGlvbixcbiAgICAgICAgICAgIGhhc0NvbXBvbmVudCxcbiAgICAgICAgICAgIGhhc0Vycm9yQm91bmRhcnksXG4gICAgICAgICAgICBoYXNMb2FkZXIsXG4gICAgICAgICAgICBoeWRyYXRlRmFsbGJhY2tFbGVtZW50OiByb3V0ZS5oeWRyYXRlRmFsbGJhY2tFbGVtZW50LFxuICAgICAgICAgICAgaWQ6IHJvdXRlLmlkLFxuICAgICAgICAgICAgaW5kZXg6IHJvdXRlLmluZGV4LFxuICAgICAgICAgICAgbGlua3M6IHJvdXRlTW9kdWxlLmxpbmtzLFxuICAgICAgICAgICAgbWV0YTogcm91dGVNb2R1bGUubWV0YSxcbiAgICAgICAgICAgIHBhcmVudElkLFxuICAgICAgICAgICAgcGF0aDogcm91dGUucGF0aCxcbiAgICAgICAgICAgIHNob3VsZFJldmFsaWRhdGU6IHJvdXRlTW9kdWxlLnNob3VsZFJldmFsaWRhdGVcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAocm91dGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIG5ld1JvdXRlLmNoaWxkcmVuID0gd2Fsa1JvdXRlcyhyb3V0ZS5jaGlsZHJlbiwgcm91dGUuaWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbmV3Um91dGU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXBkYXRlZFJvdXRlID0geyAuLi5yb3V0ZSB9O1xuICAgICAgICBpZiAocm91dGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICB1cGRhdGVkUm91dGUuY2hpbGRyZW4gPSB3YWxrUm91dGVzKHJvdXRlLmNoaWxkcmVuLCByb3V0ZS5pZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVwZGF0ZWRSb3V0ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBuZXdSb3V0ZXMucHVzaChcbiAgICAgIC4uLndhbGtSb3V0ZXMob2xkUm91dGVzLCB2b2lkIDApXG4gICAgKTtcbiAgICB3aW5kb3cuX19yZWFjdFJvdXRlckRhdGFSb3V0ZXIuX2ludGVybmFsU2V0Um91dGVzKG5ld1JvdXRlcyk7XG4gIH07XG4gIHJldHVybiB7XG4gICAgcm91dGVyOiBnbG9iYWxWYXIuX19yZWFjdFJvdXRlckRhdGFSb3V0ZXIsXG4gICAgcm91dGVNb2R1bGVzOiBnbG9iYWxWYXIuX19yZWFjdFJvdXRlclJvdXRlTW9kdWxlc1xuICB9O1xufVxudmFyIHJlbmRlcmVkUm91dGVzQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQoKTtcbmZ1bmN0aW9uIGdldFJTQ1NpbmdsZUZldGNoRGF0YVN0cmF0ZWd5KGdldFJvdXRlciwgc3NyLCBiYXNlbmFtZSwgY3JlYXRlRnJvbVJlYWRhYmxlU3RyZWFtLCBmZXRjaEltcGxlbWVudGF0aW9uKSB7XG4gIGxldCBkYXRhU3RyYXRlZ3kgPSBnZXRTaW5nbGVGZXRjaERhdGFTdHJhdGVneUltcGwoXG4gICAgZ2V0Um91dGVyLFxuICAgIChtYXRjaCkgPT4ge1xuICAgICAgbGV0IE0gPSBtYXRjaDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGhhc0xvYWRlcjogTS5yb3V0ZS5oYXNMb2FkZXIsXG4gICAgICAgIGhhc0NsaWVudExvYWRlcjogTS5yb3V0ZS5oYXNDbGllbnRMb2FkZXIsXG4gICAgICAgIGhhc0NvbXBvbmVudDogTS5yb3V0ZS5oYXNDb21wb25lbnQsXG4gICAgICAgIGhhc0FjdGlvbjogTS5yb3V0ZS5oYXNBY3Rpb24sXG4gICAgICAgIGhhc0NsaWVudEFjdGlvbjogTS5yb3V0ZS5oYXNDbGllbnRBY3Rpb24sXG4gICAgICAgIGhhc1Nob3VsZFJldmFsaWRhdGU6IE0ucm91dGUuaGFzU2hvdWxkUmV2YWxpZGF0ZVxuICAgICAgfTtcbiAgICB9LFxuICAgIC8vIHBhc3MgbWFwIGludG8gZmV0Y2hBbmREZWNvZGUgc28gaXQgY2FuIGFkZCBwYXlsb2Fkc1xuICAgIGdldEZldGNoQW5kRGVjb2RlVmlhUlNDKGNyZWF0ZUZyb21SZWFkYWJsZVN0cmVhbSwgZmV0Y2hJbXBsZW1lbnRhdGlvbiksXG4gICAgc3NyLFxuICAgIGJhc2VuYW1lLFxuICAgIC8vIElmIHRoZSByb3V0ZSBoYXMgYSBjb21wb25lbnQgYnV0IHdlIGRvbid0IGhhdmUgYW4gZWxlbWVudCwgd2UgbmVlZCB0byBoaXRcbiAgICAvLyB0aGUgc2VydmVyIGxvYWRlciBmbG93IHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgY2xpZW50IGxvYWRlciBjYWxsc1xuICAgIC8vIGBzZXJ2ZXJMb2FkZXJgIG9yIG5vdCwgb3RoZXJ3aXNlIHdlJ2xsIGhhdmUgbm90aGluZyB0byByZW5kZXIuXG4gICAgKG1hdGNoKSA9PiB7XG4gICAgICBsZXQgTSA9IG1hdGNoO1xuICAgICAgcmV0dXJuIE0ucm91dGUuaGFzQ29tcG9uZW50ICYmICFNLnJvdXRlLmVsZW1lbnQ7XG4gICAgfVxuICApO1xuICByZXR1cm4gYXN5bmMgKGFyZ3MpID0+IGFyZ3MucnVuQ2xpZW50TWlkZGxld2FyZShhc3luYyAoKSA9PiB7XG4gICAgbGV0IGNvbnRleHQgPSBhcmdzLmNvbnRleHQ7XG4gICAgY29udGV4dC5zZXQocmVuZGVyZWRSb3V0ZXNDb250ZXh0LCBbXSk7XG4gICAgbGV0IHJlc3VsdHMgPSBhd2FpdCBkYXRhU3RyYXRlZ3koYXJncyk7XG4gICAgY29uc3QgcmVuZGVyZWRSb3V0ZXNCeUlkID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IHJvdXRlIG9mIGNvbnRleHQuZ2V0KHJlbmRlcmVkUm91dGVzQ29udGV4dCkpIHtcbiAgICAgIGlmICghcmVuZGVyZWRSb3V0ZXNCeUlkLmhhcyhyb3V0ZS5pZCkpIHtcbiAgICAgICAgcmVuZGVyZWRSb3V0ZXNCeUlkLnNldChyb3V0ZS5pZCwgW10pO1xuICAgICAgfVxuICAgICAgcmVuZGVyZWRSb3V0ZXNCeUlkLmdldChyb3V0ZS5pZCkucHVzaChyb3V0ZSk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgbWF0Y2ggb2YgYXJncy5tYXRjaGVzKSB7XG4gICAgICBjb25zdCByZW5kZXJlZFJvdXRlcyA9IHJlbmRlcmVkUm91dGVzQnlJZC5nZXQobWF0Y2gucm91dGUuaWQpO1xuICAgICAgaWYgKHJlbmRlcmVkUm91dGVzKSB7XG4gICAgICAgIGZvciAoY29uc3QgcmVuZGVyZWQgb2YgcmVuZGVyZWRSb3V0ZXMpIHtcbiAgICAgICAgICB3aW5kb3cuX19yZWFjdFJvdXRlckRhdGFSb3V0ZXIucGF0Y2hSb3V0ZXMoXG4gICAgICAgICAgICByZW5kZXJlZC5wYXJlbnRJZCA/PyBudWxsLFxuICAgICAgICAgICAgW2NyZWF0ZVJvdXRlRnJvbVNlcnZlck1hbmlmZXN0KHJlbmRlcmVkKV0sXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfSk7XG59XG5mdW5jdGlvbiBnZXRGZXRjaEFuZERlY29kZVZpYVJTQyhjcmVhdGVGcm9tUmVhZGFibGVTdHJlYW0sIGZldGNoSW1wbGVtZW50YXRpb24pIHtcbiAgcmV0dXJuIGFzeW5jIChhcmdzLCBiYXNlbmFtZSwgdGFyZ2V0Um91dGVzKSA9PiB7XG4gICAgbGV0IHsgcmVxdWVzdCwgY29udGV4dCB9ID0gYXJncztcbiAgICBsZXQgdXJsID0gc2luZ2xlRmV0Y2hVcmwocmVxdWVzdC51cmwsIGJhc2VuYW1lLCBcInJzY1wiKTtcbiAgICBpZiAocmVxdWVzdC5tZXRob2QgPT09IFwiR0VUXCIpIHtcbiAgICAgIHVybCA9IHN0cmlwSW5kZXhQYXJhbSh1cmwpO1xuICAgICAgaWYgKHRhcmdldFJvdXRlcykge1xuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLnNldChcIl9yb3V0ZXNcIiwgdGFyZ2V0Um91dGVzLmpvaW4oXCIsXCIpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGV0IHJlcyA9IGF3YWl0IGZldGNoSW1wbGVtZW50YXRpb24oXG4gICAgICBuZXcgUmVxdWVzdCh1cmwsIGF3YWl0IGNyZWF0ZVJlcXVlc3RJbml0KHJlcXVlc3QpKVxuICAgICk7XG4gICAgaWYgKHJlcy5zdGF0dXMgPj0gNDAwICYmICFyZXMuaGVhZGVycy5oYXMoXCJYLVJlbWl4LVJlc3BvbnNlXCIpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3JSZXNwb25zZUltcGwocmVzLnN0YXR1cywgcmVzLnN0YXR1c1RleHQsIGF3YWl0IHJlcy50ZXh0KCkpO1xuICAgIH1cbiAgICBpbnZhcmlhbnQocmVzLmJvZHksIFwiTm8gcmVzcG9uc2UgYm9keSB0byBkZWNvZGVcIik7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCBjcmVhdGVGcm9tUmVhZGFibGVTdHJlYW0ocmVzLmJvZHksIHtcbiAgICAgICAgdGVtcG9yYXJ5UmVmZXJlbmNlczogdm9pZCAwXG4gICAgICB9KTtcbiAgICAgIGlmIChwYXlsb2FkLnR5cGUgPT09IFwicmVkaXJlY3RcIikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN0YXR1czogcmVzLnN0YXR1cyxcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZWRpcmVjdDoge1xuICAgICAgICAgICAgICByZWRpcmVjdDogcGF5bG9hZC5sb2NhdGlvbixcbiAgICAgICAgICAgICAgcmVsb2FkOiBwYXlsb2FkLnJlbG9hZCxcbiAgICAgICAgICAgICAgcmVwbGFjZTogcGF5bG9hZC5yZXBsYWNlLFxuICAgICAgICAgICAgICByZXZhbGlkYXRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgc3RhdHVzOiBwYXlsb2FkLnN0YXR1c1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChwYXlsb2FkLnR5cGUgIT09IFwicmVuZGVyXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBwYXlsb2FkIHR5cGVcIik7XG4gICAgICB9XG4gICAgICBjb250ZXh0LmdldChyZW5kZXJlZFJvdXRlc0NvbnRleHQpLnB1c2goLi4ucGF5bG9hZC5tYXRjaGVzKTtcbiAgICAgIGxldCByZXN1bHRzID0geyByb3V0ZXM6IHt9IH07XG4gICAgICBjb25zdCBkYXRhS2V5ID0gaXNNdXRhdGlvbk1ldGhvZChyZXF1ZXN0Lm1ldGhvZCkgPyBcImFjdGlvbkRhdGFcIiA6IFwibG9hZGVyRGF0YVwiO1xuICAgICAgZm9yIChsZXQgW3JvdXRlSWQsIGRhdGFdIG9mIE9iamVjdC5lbnRyaWVzKHBheWxvYWRbZGF0YUtleV0gfHwge30pKSB7XG4gICAgICAgIHJlc3VsdHMucm91dGVzW3JvdXRlSWRdID0geyBkYXRhIH07XG4gICAgICB9XG4gICAgICBpZiAocGF5bG9hZC5lcnJvcnMpIHtcbiAgICAgICAgZm9yIChsZXQgW3JvdXRlSWQsIGVycm9yXSBvZiBPYmplY3QuZW50cmllcyhwYXlsb2FkLmVycm9ycykpIHtcbiAgICAgICAgICByZXN1bHRzLnJvdXRlc1tyb3V0ZUlkXSA9IHsgZXJyb3IgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgc3RhdHVzOiByZXMuc3RhdHVzLCBkYXRhOiByZXN1bHRzIH07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIGRlY29kZSBSU0MgcmVzcG9uc2VcIik7XG4gICAgfVxuICB9O1xufVxuZnVuY3Rpb24gUlNDSHlkcmF0ZWRSb3V0ZXIoe1xuICBjcmVhdGVGcm9tUmVhZGFibGVTdHJlYW0sXG4gIGZldGNoOiBmZXRjaEltcGxlbWVudGF0aW9uID0gZmV0Y2gsXG4gIHBheWxvYWQsXG4gIHJvdXRlRGlzY292ZXJ5ID0gXCJlYWdlclwiLFxuICBnZXRDb250ZXh0XG59KSB7XG4gIGlmIChwYXlsb2FkLnR5cGUgIT09IFwicmVuZGVyXCIpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcGF5bG9hZCB0eXBlXCIpO1xuICBsZXQgeyByb3V0ZXI6IHJvdXRlcjIsIHJvdXRlTW9kdWxlcyB9ID0gUmVhY3QzLnVzZU1lbW8oXG4gICAgKCkgPT4gY3JlYXRlUm91dGVyRnJvbVBheWxvYWQoe1xuICAgICAgcGF5bG9hZCxcbiAgICAgIGZldGNoSW1wbGVtZW50YXRpb24sXG4gICAgICBnZXRDb250ZXh0LFxuICAgICAgY3JlYXRlRnJvbVJlYWRhYmxlU3RyZWFtXG4gICAgfSksXG4gICAgW2NyZWF0ZUZyb21SZWFkYWJsZVN0cmVhbSwgcGF5bG9hZCwgZmV0Y2hJbXBsZW1lbnRhdGlvbiwgZ2V0Q29udGV4dF1cbiAgKTtcbiAgUmVhY3QzLnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0SXNIeWRyYXRlZCgpO1xuICB9LCBbXSk7XG4gIFJlYWN0My51c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGdsb2JhbFZhciA9IHdpbmRvdztcbiAgICBpZiAoIWdsb2JhbFZhci5fX3JvdXRlckluaXRpYWxpemVkKSB7XG4gICAgICBnbG9iYWxWYXIuX19yb3V0ZXJJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICBnbG9iYWxWYXIuX19yZWFjdFJvdXRlckRhdGFSb3V0ZXIuaW5pdGlhbGl6ZSgpO1xuICAgIH1cbiAgfSwgW10pO1xuICBsZXQgW2xvY2F0aW9uMiwgc2V0TG9jYXRpb25dID0gUmVhY3QzLnVzZVN0YXRlKHJvdXRlcjIuc3RhdGUubG9jYXRpb24pO1xuICBSZWFjdDMudXNlTGF5b3V0RWZmZWN0KFxuICAgICgpID0+IHJvdXRlcjIuc3Vic2NyaWJlKChuZXdTdGF0ZSkgPT4ge1xuICAgICAgaWYgKG5ld1N0YXRlLmxvY2F0aW9uICE9PSBsb2NhdGlvbjIpIHtcbiAgICAgICAgc2V0TG9jYXRpb24obmV3U3RhdGUubG9jYXRpb24pO1xuICAgICAgfVxuICAgIH0pLFxuICAgIFtyb3V0ZXIyLCBsb2NhdGlvbjJdXG4gICk7XG4gIFJlYWN0My51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChyb3V0ZURpc2NvdmVyeSA9PT0gXCJsYXp5XCIgfHwgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFRTIGRvZXNuJ3Qga25vdyBhYm91dCB0aGlzIHlldFxuICAgIHdpbmRvdy5uYXZpZ2F0b3I/LmNvbm5lY3Rpb24/LnNhdmVEYXRhID09PSB0cnVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlZ2lzdGVyRWxlbWVudChlbCkge1xuICAgICAgbGV0IHBhdGggPSBlbC50YWdOYW1lID09PSBcIkZPUk1cIiA/IGVsLmdldEF0dHJpYnV0ZShcImFjdGlvblwiKSA6IGVsLmdldEF0dHJpYnV0ZShcImhyZWZcIik7XG4gICAgICBpZiAoIXBhdGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbGV0IHBhdGhuYW1lID0gZWwudGFnTmFtZSA9PT0gXCJBXCIgPyBlbC5wYXRobmFtZSA6IG5ldyBVUkwocGF0aCwgd2luZG93LmxvY2F0aW9uLm9yaWdpbikucGF0aG5hbWU7XG4gICAgICBpZiAoIWRpc2NvdmVyZWRQYXRocy5oYXMocGF0aG5hbWUpKSB7XG4gICAgICAgIG5leHRQYXRocy5hZGQocGF0aG5hbWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBhc3luYyBmdW5jdGlvbiBmZXRjaFBhdGNoZXMoKSB7XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiYVtkYXRhLWRpc2NvdmVyXSwgZm9ybVtkYXRhLWRpc2NvdmVyXVwiKS5mb3JFYWNoKHJlZ2lzdGVyRWxlbWVudCk7XG4gICAgICBsZXQgcGF0aHMgPSBBcnJheS5mcm9tKG5leHRQYXRocy5rZXlzKCkpLmZpbHRlcigocGF0aCkgPT4ge1xuICAgICAgICBpZiAoZGlzY292ZXJlZFBhdGhzLmhhcyhwYXRoKSkge1xuICAgICAgICAgIG5leHRQYXRocy5kZWxldGUocGF0aCk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgICBpZiAocGF0aHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGZldGNoQW5kQXBwbHlNYW5pZmVzdFBhdGNoZXMoXG4gICAgICAgICAgcGF0aHMsXG4gICAgICAgICAgY3JlYXRlRnJvbVJlYWRhYmxlU3RyZWFtLFxuICAgICAgICAgIGZldGNoSW1wbGVtZW50YXRpb25cbiAgICAgICAgKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBmZXRjaCBtYW5pZmVzdCBwYXRjaGVzXCIsIGUpO1xuICAgICAgfVxuICAgIH1cbiAgICBsZXQgZGVib3VuY2VkRmV0Y2hQYXRjaGVzID0gZGVib3VuY2UoZmV0Y2hQYXRjaGVzLCAxMDApO1xuICAgIGZldGNoUGF0Y2hlcygpO1xuICAgIGxldCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IGRlYm91bmNlZEZldGNoUGF0Y2hlcygpKTtcbiAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwge1xuICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICBhdHRyaWJ1dGVGaWx0ZXI6IFtcImRhdGEtZGlzY292ZXJcIiwgXCJocmVmXCIsIFwiYWN0aW9uXCJdXG4gICAgfSk7XG4gIH0sIFtyb3V0ZURpc2NvdmVyeSwgY3JlYXRlRnJvbVJlYWRhYmxlU3RyZWFtLCBmZXRjaEltcGxlbWVudGF0aW9uXSk7XG4gIGNvbnN0IGZyYW1ld29ya0NvbnRleHQgPSB7XG4gICAgZnV0dXJlOiB7XG4gICAgICAvLyBUaGVzZSBmbGFncyBoYXZlIG5vIHJ1bnRpbWUgaW1wYWN0IHNvIGNhbiBhbHdheXMgYmUgZmFsc2UuICBJZiB3ZSBhZGRcbiAgICAgIC8vIGZsYWdzIHRoYXQgZHJpdmUgcnVudGltZSBiZWhhdmlvciB0aGV5J2xsIG5lZWQgdG8gYmUgcHJveGllZCB0aHJvdWdoLlxuICAgICAgdjhfbWlkZGxld2FyZTogZmFsc2UsXG4gICAgICB1bnN0YWJsZV9zdWJSZXNvdXJjZUludGVncml0eTogZmFsc2VcbiAgICB9LFxuICAgIGlzU3BhTW9kZTogZmFsc2UsXG4gICAgc3NyOiB0cnVlLFxuICAgIGNyaXRpY2FsQ3NzOiBcIlwiLFxuICAgIG1hbmlmZXN0OiB7XG4gICAgICByb3V0ZXM6IHt9LFxuICAgICAgdmVyc2lvbjogXCIxXCIsXG4gICAgICB1cmw6IFwiXCIsXG4gICAgICBlbnRyeToge1xuICAgICAgICBtb2R1bGU6IFwiXCIsXG4gICAgICAgIGltcG9ydHM6IFtdXG4gICAgICB9XG4gICAgfSxcbiAgICByb3V0ZURpc2NvdmVyeTogeyBtb2RlOiBcImxhenlcIiwgbWFuaWZlc3RQYXRoOiBcIi9fX21hbmlmZXN0XCIgfSxcbiAgICByb3V0ZU1vZHVsZXNcbiAgfTtcbiAgcmV0dXJuIC8qIEBfX1BVUkVfXyAqLyBSZWFjdDMuY3JlYXRlRWxlbWVudChSU0NSb3V0ZXJDb250ZXh0LlByb3ZpZGVyLCB7IHZhbHVlOiB0cnVlIH0sIC8qIEBfX1BVUkVfXyAqLyBSZWFjdDMuY3JlYXRlRWxlbWVudChSU0NSb3V0ZXJHbG9iYWxFcnJvckJvdW5kYXJ5LCB7IGxvY2F0aW9uOiBsb2NhdGlvbjIgfSwgLyogQF9fUFVSRV9fICovIFJlYWN0My5jcmVhdGVFbGVtZW50KEZyYW1ld29ya0NvbnRleHQuUHJvdmlkZXIsIHsgdmFsdWU6IGZyYW1ld29ya0NvbnRleHQgfSwgLyogQF9fUFVSRV9fICovIFJlYWN0My5jcmVhdGVFbGVtZW50KFVOU1RBQkxFX1RyYW5zaXRpb25FbmFibGVkUm91dGVyUHJvdmlkZXIsIHsgcm91dGVyOiByb3V0ZXIyLCBmbHVzaFN5bmM6IFJlYWN0RE9NMi5mbHVzaFN5bmMgfSkpKSk7XG59XG5mdW5jdGlvbiBjcmVhdGVSb3V0ZUZyb21TZXJ2ZXJNYW5pZmVzdChtYXRjaCwgcGF5bG9hZCkge1xuICBsZXQgaGFzSW5pdGlhbERhdGEgPSBwYXlsb2FkICYmIG1hdGNoLmlkIGluIHBheWxvYWQubG9hZGVyRGF0YTtcbiAgbGV0IGluaXRpYWxEYXRhID0gcGF5bG9hZD8ubG9hZGVyRGF0YVttYXRjaC5pZF07XG4gIGxldCBoYXNJbml0aWFsRXJyb3IgPSBwYXlsb2FkPy5lcnJvcnMgJiYgbWF0Y2guaWQgaW4gcGF5bG9hZC5lcnJvcnM7XG4gIGxldCBpbml0aWFsRXJyb3IgPSBwYXlsb2FkPy5lcnJvcnM/LlttYXRjaC5pZF07XG4gIGxldCBpc0h5ZHJhdGlvblJlcXVlc3QgPSBtYXRjaC5jbGllbnRMb2FkZXI/Lmh5ZHJhdGUgPT09IHRydWUgfHwgIW1hdGNoLmhhc0xvYWRlciB8fCAvLyBJZiB0aGUgcm91dGUgaGFzIGEgY29tcG9uZW50IGJ1dCB3ZSBkb24ndCBoYXZlIGFuIGVsZW1lbnQsIHdlIG5lZWQgdG8gaGl0XG4gIC8vIHRoZSBzZXJ2ZXIgbG9hZGVyIGZsb3cgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSBjbGllbnQgbG9hZGVyIGNhbGxzXG4gIC8vIGBzZXJ2ZXJMb2FkZXJgIG9yIG5vdCwgb3RoZXJ3aXNlIHdlJ2xsIGhhdmUgbm90aGluZyB0byByZW5kZXIuXG4gIG1hdGNoLmhhc0NvbXBvbmVudCAmJiAhbWF0Y2guZWxlbWVudDtcbiAgaW52YXJpYW50KHdpbmRvdy5fX3JlYWN0Um91dGVyUm91dGVNb2R1bGVzKTtcbiAgcG9wdWxhdGVSU0NSb3V0ZU1vZHVsZXMod2luZG93Ll9fcmVhY3RSb3V0ZXJSb3V0ZU1vZHVsZXMsIG1hdGNoKTtcbiAgbGV0IGRhdGFSb3V0ZSA9IHtcbiAgICBpZDogbWF0Y2guaWQsXG4gICAgZWxlbWVudDogbWF0Y2guZWxlbWVudCxcbiAgICBlcnJvckVsZW1lbnQ6IG1hdGNoLmVycm9yRWxlbWVudCxcbiAgICBoYW5kbGU6IG1hdGNoLmhhbmRsZSxcbiAgICBoYXNFcnJvckJvdW5kYXJ5OiBtYXRjaC5oYXNFcnJvckJvdW5kYXJ5LFxuICAgIGh5ZHJhdGVGYWxsYmFja0VsZW1lbnQ6IG1hdGNoLmh5ZHJhdGVGYWxsYmFja0VsZW1lbnQsXG4gICAgaW5kZXg6IG1hdGNoLmluZGV4LFxuICAgIGxvYWRlcjogbWF0Y2guY2xpZW50TG9hZGVyID8gYXN5bmMgKGFyZ3MsIHNpbmdsZUZldGNoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBsZXQgcmVzdWx0ID0gYXdhaXQgbWF0Y2guY2xpZW50TG9hZGVyKHtcbiAgICAgICAgICAuLi5hcmdzLFxuICAgICAgICAgIHNlcnZlckxvYWRlcjogKCkgPT4ge1xuICAgICAgICAgICAgcHJldmVudEludmFsaWRTZXJ2ZXJIYW5kbGVyQ2FsbChcbiAgICAgICAgICAgICAgXCJsb2FkZXJcIixcbiAgICAgICAgICAgICAgbWF0Y2guaWQsXG4gICAgICAgICAgICAgIG1hdGNoLmhhc0xvYWRlclxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmIChpc0h5ZHJhdGlvblJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgaWYgKGhhc0luaXRpYWxEYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluaXRpYWxEYXRhO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChoYXNJbml0aWFsRXJyb3IpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBpbml0aWFsRXJyb3I7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjYWxsU2luZ2xlRmV0Y2goc2luZ2xlRmV0Y2gpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpc0h5ZHJhdGlvblJlcXVlc3QgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9IDogKFxuICAgICAgLy8gV2UgYWx3YXlzIG1ha2UgdGhlIGNhbGwgaW4gdGhpcyBSU0Mgd29ybGQgc2luY2UgZXZlbiBpZiB3ZSBkb24ndFxuICAgICAgLy8gaGF2ZSBhIGBsb2FkZXJgIHdlIG1heSBuZWVkIHRvIGdldCB0aGUgYGVsZW1lbnRgIGltcGxlbWVudGF0aW9uXG4gICAgICAoXywgc2luZ2xlRmV0Y2gpID0+IGNhbGxTaW5nbGVGZXRjaChzaW5nbGVGZXRjaClcbiAgICApLFxuICAgIGFjdGlvbjogbWF0Y2guY2xpZW50QWN0aW9uID8gKGFyZ3MsIHNpbmdsZUZldGNoKSA9PiBtYXRjaC5jbGllbnRBY3Rpb24oe1xuICAgICAgLi4uYXJncyxcbiAgICAgIHNlcnZlckFjdGlvbjogYXN5bmMgKCkgPT4ge1xuICAgICAgICBwcmV2ZW50SW52YWxpZFNlcnZlckhhbmRsZXJDYWxsKFxuICAgICAgICAgIFwiYWN0aW9uXCIsXG4gICAgICAgICAgbWF0Y2guaWQsXG4gICAgICAgICAgbWF0Y2guaGFzTG9hZGVyXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBhd2FpdCBjYWxsU2luZ2xlRmV0Y2goc2luZ2xlRmV0Y2gpO1xuICAgICAgfVxuICAgIH0pIDogbWF0Y2guaGFzQWN0aW9uID8gKF8sIHNpbmdsZUZldGNoKSA9PiBjYWxsU2luZ2xlRmV0Y2goc2luZ2xlRmV0Y2gpIDogKCkgPT4ge1xuICAgICAgdGhyb3cgbm9BY3Rpb25EZWZpbmVkRXJyb3IoXCJhY3Rpb25cIiwgbWF0Y2guaWQpO1xuICAgIH0sXG4gICAgcGF0aDogbWF0Y2gucGF0aCxcbiAgICBzaG91bGRSZXZhbGlkYXRlOiBtYXRjaC5zaG91bGRSZXZhbGlkYXRlLFxuICAgIC8vIFdlIGFsd2F5cyBoYXZlIGEgXCJsb2FkZXJcIiBpbiB0aGlzIFJTQyB3b3JsZCBzaW5jZSBldmVuIGlmIHdlIGRvbid0XG4gICAgLy8gaGF2ZSBhIGBsb2FkZXJgIHdlIG1heSBuZWVkIHRvIGdldCB0aGUgYGVsZW1lbnRgIGltcGxlbWVudGF0aW9uXG4gICAgaGFzTG9hZGVyOiB0cnVlLFxuICAgIGhhc0NsaWVudExvYWRlcjogbWF0Y2guY2xpZW50TG9hZGVyICE9IG51bGwsXG4gICAgaGFzQWN0aW9uOiBtYXRjaC5oYXNBY3Rpb24sXG4gICAgaGFzQ2xpZW50QWN0aW9uOiBtYXRjaC5jbGllbnRBY3Rpb24gIT0gbnVsbCxcbiAgICBoYXNTaG91bGRSZXZhbGlkYXRlOiBtYXRjaC5zaG91bGRSZXZhbGlkYXRlICE9IG51bGxcbiAgfTtcbiAgaWYgKHR5cGVvZiBkYXRhUm91dGUubG9hZGVyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBkYXRhUm91dGUubG9hZGVyLmh5ZHJhdGUgPSBzaG91bGRIeWRyYXRlUm91dGVMb2FkZXIoXG4gICAgICBtYXRjaC5pZCxcbiAgICAgIG1hdGNoLmNsaWVudExvYWRlcixcbiAgICAgIG1hdGNoLmhhc0xvYWRlcixcbiAgICAgIGZhbHNlXG4gICAgKTtcbiAgfVxuICByZXR1cm4gZGF0YVJvdXRlO1xufVxuZnVuY3Rpb24gY2FsbFNpbmdsZUZldGNoKHNpbmdsZUZldGNoKSB7XG4gIGludmFyaWFudCh0eXBlb2Ygc2luZ2xlRmV0Y2ggPT09IFwiZnVuY3Rpb25cIiwgXCJJbnZhbGlkIHNpbmdsZUZldGNoIHBhcmFtZXRlclwiKTtcbiAgcmV0dXJuIHNpbmdsZUZldGNoKCk7XG59XG5mdW5jdGlvbiBwcmV2ZW50SW52YWxpZFNlcnZlckhhbmRsZXJDYWxsKHR5cGUsIHJvdXRlSWQsIGhhc0hhbmRsZXIpIHtcbiAgaWYgKCFoYXNIYW5kbGVyKSB7XG4gICAgbGV0IGZuID0gdHlwZSA9PT0gXCJhY3Rpb25cIiA/IFwic2VydmVyQWN0aW9uKClcIiA6IFwic2VydmVyTG9hZGVyKClcIjtcbiAgICBsZXQgbXNnID0gYFlvdSBhcmUgdHJ5aW5nIHRvIGNhbGwgJHtmbn0gb24gYSByb3V0ZSB0aGF0IGRvZXMgbm90IGhhdmUgYSBzZXJ2ZXIgJHt0eXBlfSAocm91dGVJZDogXCIke3JvdXRlSWR9XCIpYDtcbiAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgdGhyb3cgbmV3IEVycm9yUmVzcG9uc2VJbXBsKDQwMCwgXCJCYWQgUmVxdWVzdFwiLCBuZXcgRXJyb3IobXNnKSwgdHJ1ZSk7XG4gIH1cbn1cbnZhciBuZXh0UGF0aHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xudmFyIGRpc2NvdmVyZWRQYXRoc01heFNpemUgPSAxZTM7XG52YXIgZGlzY292ZXJlZFBhdGhzID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTtcbnZhciBVUkxfTElNSVQgPSA3NjgwO1xuZnVuY3Rpb24gZ2V0TWFuaWZlc3RVcmwocGF0aHMpIHtcbiAgaWYgKHBhdGhzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmIChwYXRocy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbmV3IFVSTChgJHtwYXRoc1swXX0ubWFuaWZlc3RgLCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcbiAgfVxuICBjb25zdCBnbG9iYWxWYXIgPSB3aW5kb3c7XG4gIGxldCBiYXNlbmFtZSA9IChnbG9iYWxWYXIuX19yZWFjdFJvdXRlckRhdGFSb3V0ZXIuYmFzZW5hbWUgPz8gXCJcIikucmVwbGFjZShcbiAgICAvXlxcL3xcXC8kL2csXG4gICAgXCJcIlxuICApO1xuICBsZXQgdXJsID0gbmV3IFVSTChgJHtiYXNlbmFtZX0vLm1hbmlmZXN0YCwgd2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG4gIHVybC5zZWFyY2hQYXJhbXMuc2V0KFwicGF0aHNcIiwgcGF0aHMuc29ydCgpLmpvaW4oXCIsXCIpKTtcbiAgcmV0dXJuIHVybDtcbn1cbmFzeW5jIGZ1bmN0aW9uIGZldGNoQW5kQXBwbHlNYW5pZmVzdFBhdGNoZXMocGF0aHMsIGNyZWF0ZUZyb21SZWFkYWJsZVN0cmVhbSwgZmV0Y2hJbXBsZW1lbnRhdGlvbiwgc2lnbmFsKSB7XG4gIGxldCB1cmwgPSBnZXRNYW5pZmVzdFVybChwYXRocyk7XG4gIGlmICh1cmwgPT0gbnVsbCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodXJsLnRvU3RyaW5nKCkubGVuZ3RoID4gVVJMX0xJTUlUKSB7XG4gICAgbmV4dFBhdGhzLmNsZWFyKCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGxldCByZXNwb25zZSA9IGF3YWl0IGZldGNoSW1wbGVtZW50YXRpb24obmV3IFJlcXVlc3QodXJsLCB7IHNpZ25hbCB9KSk7XG4gIGlmICghcmVzcG9uc2UuYm9keSB8fCByZXNwb25zZS5zdGF0dXMgPCAyMDAgfHwgcmVzcG9uc2Uuc3RhdHVzID49IDMwMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBmZXRjaCBuZXcgcm91dGUgbWF0Y2hlcyBmcm9tIHRoZSBzZXJ2ZXJcIik7XG4gIH1cbiAgbGV0IHBheWxvYWQgPSBhd2FpdCBjcmVhdGVGcm9tUmVhZGFibGVTdHJlYW0ocmVzcG9uc2UuYm9keSwge1xuICAgIHRlbXBvcmFyeVJlZmVyZW5jZXM6IHZvaWQgMFxuICB9KTtcbiAgaWYgKHBheWxvYWQudHlwZSAhPT0gXCJtYW5pZmVzdFwiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIHBhdGNoIHJvdXRlc1wiKTtcbiAgfVxuICBwYXRocy5mb3JFYWNoKChwKSA9PiBhZGRUb0ZpZm9RdWV1ZShwLCBkaXNjb3ZlcmVkUGF0aHMpKTtcbiAgcGF5bG9hZC5wYXRjaGVzLmZvckVhY2goKHApID0+IHtcbiAgICB3aW5kb3cuX19yZWFjdFJvdXRlckRhdGFSb3V0ZXIucGF0Y2hSb3V0ZXMoXG4gICAgICBwLnBhcmVudElkID8/IG51bGwsXG4gICAgICBbY3JlYXRlUm91dGVGcm9tU2VydmVyTWFuaWZlc3QocCldXG4gICAgKTtcbiAgfSk7XG59XG5mdW5jdGlvbiBhZGRUb0ZpZm9RdWV1ZShwYXRoLCBxdWV1ZSkge1xuICBpZiAocXVldWUuc2l6ZSA+PSBkaXNjb3ZlcmVkUGF0aHNNYXhTaXplKSB7XG4gICAgbGV0IGZpcnN0ID0gcXVldWUudmFsdWVzKCkubmV4dCgpLnZhbHVlO1xuICAgIHF1ZXVlLmRlbGV0ZShmaXJzdCk7XG4gIH1cbiAgcXVldWUuYWRkKHBhdGgpO1xufVxuZnVuY3Rpb24gZGVib3VuY2UoY2FsbGJhY2ssIHdhaXQpIHtcbiAgbGV0IHRpbWVvdXRJZDtcbiAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgd2luZG93LmNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgIHRpbWVvdXRJZCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IGNhbGxiYWNrKC4uLmFyZ3MpLCB3YWl0KTtcbiAgfTtcbn1cbmZ1bmN0aW9uIGlzRXh0ZXJuYWxMb2NhdGlvbihsb2NhdGlvbjIpIHtcbiAgY29uc3QgbmV3TG9jYXRpb24gPSBuZXcgVVJMKGxvY2F0aW9uMiwgd2luZG93LmxvY2F0aW9uLmhyZWYpO1xuICByZXR1cm4gbmV3TG9jYXRpb24ub3JpZ2luICE9PSB3aW5kb3cubG9jYXRpb24ub3JpZ2luO1xufVxuXG4vLyBsaWIvcnNjL2h0bWwtc3RyZWFtL2Jyb3dzZXIudHNcbmZ1bmN0aW9uIGdldFJTQ1N0cmVhbSgpIHtcbiAgbGV0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgbGV0IHN0cmVhbUNvbnRyb2xsZXIgPSBudWxsO1xuICBsZXQgcnNjU3RyZWFtID0gbmV3IFJlYWRhYmxlU3RyZWFtKHtcbiAgICBzdGFydChjb250cm9sbGVyKSB7XG4gICAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsZXQgaGFuZGxlQ2h1bmsgPSAoY2h1bmspID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjaHVuayA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShlbmNvZGVyLmVuY29kZShjaHVuaykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShjaHVuayk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB3aW5kb3cuX19GTElHSFRfREFUQSB8fCAod2luZG93Ll9fRkxJR0hUX0RBVEEgPSBbXSk7XG4gICAgICB3aW5kb3cuX19GTElHSFRfREFUQS5mb3JFYWNoKGhhbmRsZUNodW5rKTtcbiAgICAgIHdpbmRvdy5fX0ZMSUdIVF9EQVRBLnB1c2ggPSAoY2h1bmspID0+IHtcbiAgICAgICAgaGFuZGxlQ2h1bmsoY2h1bmspO1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH07XG4gICAgICBzdHJlYW1Db250cm9sbGVyID0gY29udHJvbGxlcjtcbiAgICB9XG4gIH0pO1xuICBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSBcInVuZGVmaW5lZFwiICYmIGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwibG9hZGluZ1wiKSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xuICAgICAgc3RyZWFtQ29udHJvbGxlcj8uY2xvc2UoKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBzdHJlYW1Db250cm9sbGVyPy5jbG9zZSgpO1xuICB9XG4gIHJldHVybiByc2NTdHJlYW07XG59XG5leHBvcnQge1xuICBIeWRyYXRlZFJvdXRlcixcbiAgUm91dGVyUHJvdmlkZXIyIGFzIFJvdXRlclByb3ZpZGVyLFxuICBSU0NIeWRyYXRlZFJvdXRlciBhcyB1bnN0YWJsZV9SU0NIeWRyYXRlZFJvdXRlcixcbiAgY3JlYXRlQ2FsbFNlcnZlciBhcyB1bnN0YWJsZV9jcmVhdGVDYWxsU2VydmVyLFxuICBnZXRSU0NTdHJlYW0gYXMgdW5zdGFibGVfZ2V0UlNDU3RyZWFtXG59O1xuIiwiLyoqXG4gKiByZWFjdC1yb3V0ZXItZG9tIHY3LjkuNVxuICpcbiAqIENvcHlyaWdodCAoYykgUmVtaXggU29mdHdhcmUgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRS5tZCBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICpcbiAqIEBsaWNlbnNlIE1JVFxuICovXG5cInVzZSBzdHJpY3RcIjtcbnZhciBfX2RlZlByb3AgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XG52YXIgX19nZXRPd25Qcm9wRGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG52YXIgX19nZXRPd25Qcm9wTmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcztcbnZhciBfX2hhc093blByb3AgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIF9fZXhwb3J0ID0gKHRhcmdldCwgYWxsKSA9PiB7XG4gIGZvciAodmFyIG5hbWUgaW4gYWxsKVxuICAgIF9fZGVmUHJvcCh0YXJnZXQsIG5hbWUsIHsgZ2V0OiBhbGxbbmFtZV0sIGVudW1lcmFibGU6IHRydWUgfSk7XG59O1xudmFyIF9fY29weVByb3BzID0gKHRvLCBmcm9tLCBleGNlcHQsIGRlc2MpID0+IHtcbiAgaWYgKGZyb20gJiYgdHlwZW9mIGZyb20gPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGZyb20gPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGZvciAobGV0IGtleSBvZiBfX2dldE93blByb3BOYW1lcyhmcm9tKSlcbiAgICAgIGlmICghX19oYXNPd25Qcm9wLmNhbGwodG8sIGtleSkgJiYga2V5ICE9PSBleGNlcHQpXG4gICAgICAgIF9fZGVmUHJvcCh0bywga2V5LCB7IGdldDogKCkgPT4gZnJvbVtrZXldLCBlbnVtZXJhYmxlOiAhKGRlc2MgPSBfX2dldE93blByb3BEZXNjKGZyb20sIGtleSkpIHx8IGRlc2MuZW51bWVyYWJsZSB9KTtcbiAgfVxuICByZXR1cm4gdG87XG59O1xudmFyIF9fcmVFeHBvcnQgPSAodGFyZ2V0LCBtb2QsIHNlY29uZFRhcmdldCkgPT4gKF9fY29weVByb3BzKHRhcmdldCwgbW9kLCBcImRlZmF1bHRcIiksIHNlY29uZFRhcmdldCAmJiBfX2NvcHlQcm9wcyhzZWNvbmRUYXJnZXQsIG1vZCwgXCJkZWZhdWx0XCIpKTtcbnZhciBfX3RvQ29tbW9uSlMgPSAobW9kKSA9PiBfX2NvcHlQcm9wcyhfX2RlZlByb3Aoe30sIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pLCBtb2QpO1xuXG4vLyBpbmRleC50c1xudmFyIGluZGV4X2V4cG9ydHMgPSB7fTtcbl9fZXhwb3J0KGluZGV4X2V4cG9ydHMsIHtcbiAgSHlkcmF0ZWRSb3V0ZXI6ICgpID0+IGltcG9ydF9kb20uSHlkcmF0ZWRSb3V0ZXIsXG4gIFJvdXRlclByb3ZpZGVyOiAoKSA9PiBpbXBvcnRfZG9tLlJvdXRlclByb3ZpZGVyXG59KTtcbm1vZHVsZS5leHBvcnRzID0gX190b0NvbW1vbkpTKGluZGV4X2V4cG9ydHMpO1xudmFyIGltcG9ydF9kb20gPSByZXF1aXJlKFwicmVhY3Qtcm91dGVyL2RvbVwiKTtcbl9fcmVFeHBvcnQoaW5kZXhfZXhwb3J0cywgcmVxdWlyZShcInJlYWN0LXJvdXRlclwiKSwgbW9kdWxlLmV4cG9ydHMpO1xuLy8gQW5ub3RhdGUgdGhlIENvbW1vbkpTIGV4cG9ydCBuYW1lcyBmb3IgRVNNIGltcG9ydCBpbiBub2RlOlxuMCAmJiAobW9kdWxlLmV4cG9ydHMgPSB7XG4gIEh5ZHJhdGVkUm91dGVyLFxuICBSb3V0ZXJQcm92aWRlcixcbiAgLi4ucmVxdWlyZShcInJlYWN0LXJvdXRlclwiKVxufSk7XG4iLCIvKipcbiAqIHJlYWN0LXJvdXRlciB2Ny45LjVcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIFJlbWl4IFNvZnR3YXJlIEluYy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UubWQgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqXG4gKiBAbGljZW5zZSBNSVRcbiAqL1xuaW1wb3J0IHtcbiAgRU5BQkxFX0RFVl9XQVJOSU5HUyxcbiAgRXJyb3JSZXNwb25zZUltcGwsXG4gIEZyYW1ld29ya0NvbnRleHQsXG4gIE5PX0JPRFlfU1RBVFVTX0NPREVTLFxuICBPdXRsZXQsXG4gIFJTQ1JvdXRlckNvbnRleHQsXG4gIFJlbWl4RXJyb3JCb3VuZGFyeSxcbiAgUm91dGVyQ29udGV4dFByb3ZpZGVyLFxuICBSb3V0ZXJQcm92aWRlcixcbiAgU0lOR0xFX0ZFVENIX1JFRElSRUNUX1NUQVRVUyxcbiAgU2luZ2xlRmV0Y2hSZWRpcmVjdFN5bWJvbCxcbiAgU3RhdGljUm91dGVyUHJvdmlkZXIsXG4gIFN0cmVhbVRyYW5zZmVyLFxuICBjb252ZXJ0Um91dGVzVG9EYXRhUm91dGVzLFxuICBjcmVhdGVNZW1vcnlSb3V0ZXIsXG4gIGNyZWF0ZVNlcnZlclJvdXRlcyxcbiAgY3JlYXRlU3RhdGljSGFuZGxlcixcbiAgY3JlYXRlU3RhdGljUm91dGVyLFxuICBkZWNvZGVWaWFUdXJib1N0cmVhbSxcbiAgZW5jb2RlLFxuICBlc2NhcGVIdG1sLFxuICBnZXRNYW5pZmVzdFBhdGgsXG4gIGdldFN0YXRpY0NvbnRleHRGcm9tRXJyb3IsXG4gIGluc3RydW1lbnRIYW5kbGVyLFxuICBpc0RhdGFXaXRoUmVzcG9uc2VJbml0LFxuICBpc1JlZGlyZWN0UmVzcG9uc2UsXG4gIGlzUmVkaXJlY3RTdGF0dXNDb2RlLFxuICBpc1Jlc3BvbnNlLFxuICBpc1JvdXRlRXJyb3JSZXNwb25zZSxcbiAgbWF0Y2hSb3V0ZXMsXG4gIHJlZGlyZWN0LFxuICByZWRpcmVjdERvY3VtZW50LFxuICByZXBsYWNlLFxuICBzaG91bGRIeWRyYXRlUm91dGVMb2FkZXIsXG4gIHN0cmlwQmFzZW5hbWUsXG4gIHVzZVJvdXRlRXJyb3IsXG4gIHdhcm5PbmNlLFxuICB3aXRoQ29tcG9uZW50UHJvcHMsXG4gIHdpdGhFcnJvckJvdW5kYXJ5UHJvcHMsXG4gIHdpdGhIeWRyYXRlRmFsbGJhY2tQcm9wc1xufSBmcm9tIFwiLi9jaHVuay1VSUdEU1dQSC5tanNcIjtcblxuLy8gbGliL2RvbS9zc3Ivc2VydmVyLnRzeFxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5mdW5jdGlvbiBTZXJ2ZXJSb3V0ZXIoe1xuICBjb250ZXh0LFxuICB1cmwsXG4gIG5vbmNlXG59KSB7XG4gIGlmICh0eXBlb2YgdXJsID09PSBcInN0cmluZ1wiKSB7XG4gICAgdXJsID0gbmV3IFVSTCh1cmwpO1xuICB9XG4gIGxldCB7IG1hbmlmZXN0LCByb3V0ZU1vZHVsZXMsIGNyaXRpY2FsQ3NzLCBzZXJ2ZXJIYW5kb2ZmU3RyaW5nIH0gPSBjb250ZXh0O1xuICBsZXQgcm91dGVzID0gY3JlYXRlU2VydmVyUm91dGVzKFxuICAgIG1hbmlmZXN0LnJvdXRlcyxcbiAgICByb3V0ZU1vZHVsZXMsXG4gICAgY29udGV4dC5mdXR1cmUsXG4gICAgY29udGV4dC5pc1NwYU1vZGVcbiAgKTtcbiAgY29udGV4dC5zdGF0aWNIYW5kbGVyQ29udGV4dC5sb2FkZXJEYXRhID0ge1xuICAgIC4uLmNvbnRleHQuc3RhdGljSGFuZGxlckNvbnRleHQubG9hZGVyRGF0YVxuICB9O1xuICBmb3IgKGxldCBtYXRjaCBvZiBjb250ZXh0LnN0YXRpY0hhbmRsZXJDb250ZXh0Lm1hdGNoZXMpIHtcbiAgICBsZXQgcm91dGVJZCA9IG1hdGNoLnJvdXRlLmlkO1xuICAgIGxldCByb3V0ZSA9IHJvdXRlTW9kdWxlc1tyb3V0ZUlkXTtcbiAgICBsZXQgbWFuaWZlc3RSb3V0ZSA9IGNvbnRleHQubWFuaWZlc3Qucm91dGVzW3JvdXRlSWRdO1xuICAgIGlmIChyb3V0ZSAmJiBtYW5pZmVzdFJvdXRlICYmIHNob3VsZEh5ZHJhdGVSb3V0ZUxvYWRlcihcbiAgICAgIHJvdXRlSWQsXG4gICAgICByb3V0ZS5jbGllbnRMb2FkZXIsXG4gICAgICBtYW5pZmVzdFJvdXRlLmhhc0xvYWRlcixcbiAgICAgIGNvbnRleHQuaXNTcGFNb2RlXG4gICAgKSAmJiAocm91dGUuSHlkcmF0ZUZhbGxiYWNrIHx8ICFtYW5pZmVzdFJvdXRlLmhhc0xvYWRlcikpIHtcbiAgICAgIGRlbGV0ZSBjb250ZXh0LnN0YXRpY0hhbmRsZXJDb250ZXh0LmxvYWRlckRhdGFbcm91dGVJZF07XG4gICAgfVxuICB9XG4gIGxldCByb3V0ZXIgPSBjcmVhdGVTdGF0aWNSb3V0ZXIocm91dGVzLCBjb250ZXh0LnN0YXRpY0hhbmRsZXJDb250ZXh0KTtcbiAgcmV0dXJuIC8qIEBfX1BVUkVfXyAqLyBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkZyYWdtZW50LCBudWxsLCAvKiBAX19QVVJFX18gKi8gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICBGcmFtZXdvcmtDb250ZXh0LlByb3ZpZGVyLFxuICAgIHtcbiAgICAgIHZhbHVlOiB7XG4gICAgICAgIG1hbmlmZXN0LFxuICAgICAgICByb3V0ZU1vZHVsZXMsXG4gICAgICAgIGNyaXRpY2FsQ3NzLFxuICAgICAgICBzZXJ2ZXJIYW5kb2ZmU3RyaW5nLFxuICAgICAgICBmdXR1cmU6IGNvbnRleHQuZnV0dXJlLFxuICAgICAgICBzc3I6IGNvbnRleHQuc3NyLFxuICAgICAgICBpc1NwYU1vZGU6IGNvbnRleHQuaXNTcGFNb2RlLFxuICAgICAgICByb3V0ZURpc2NvdmVyeTogY29udGV4dC5yb3V0ZURpc2NvdmVyeSxcbiAgICAgICAgc2VyaWFsaXplRXJyb3I6IGNvbnRleHQuc2VyaWFsaXplRXJyb3IsXG4gICAgICAgIHJlbmRlck1ldGE6IGNvbnRleHQucmVuZGVyTWV0YVxuICAgICAgfVxuICAgIH0sXG4gICAgLyogQF9fUFVSRV9fICovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVtaXhFcnJvckJvdW5kYXJ5LCB7IGxvY2F0aW9uOiByb3V0ZXIuc3RhdGUubG9jYXRpb24gfSwgLyogQF9fUFVSRV9fICovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBTdGF0aWNSb3V0ZXJQcm92aWRlcixcbiAgICAgIHtcbiAgICAgICAgcm91dGVyLFxuICAgICAgICBjb250ZXh0OiBjb250ZXh0LnN0YXRpY0hhbmRsZXJDb250ZXh0LFxuICAgICAgICBoeWRyYXRlOiBmYWxzZVxuICAgICAgfVxuICAgICkpXG4gICksIGNvbnRleHQuc2VydmVySGFuZG9mZlN0cmVhbSA/IC8qIEBfX1BVUkVfXyAqLyBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LlN1c3BlbnNlLCBudWxsLCAvKiBAX19QVVJFX18gKi8gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICBTdHJlYW1UcmFuc2ZlcixcbiAgICB7XG4gICAgICBjb250ZXh0LFxuICAgICAgaWRlbnRpZmllcjogMCxcbiAgICAgIHJlYWRlcjogY29udGV4dC5zZXJ2ZXJIYW5kb2ZmU3RyZWFtLmdldFJlYWRlcigpLFxuICAgICAgdGV4dERlY29kZXI6IG5ldyBUZXh0RGVjb2RlcigpLFxuICAgICAgbm9uY2VcbiAgICB9XG4gICkpIDogbnVsbCk7XG59XG5cbi8vIGxpYi9kb20vc3NyL3JvdXRlcy10ZXN0LXN0dWIudHN4XG5pbXBvcnQgKiBhcyBSZWFjdDIgZnJvbSBcInJlYWN0XCI7XG5mdW5jdGlvbiBjcmVhdGVSb3V0ZXNTdHViKHJvdXRlcywgX2NvbnRleHQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIFJvdXRlc1Rlc3RTdHViKHtcbiAgICBpbml0aWFsRW50cmllcyxcbiAgICBpbml0aWFsSW5kZXgsXG4gICAgaHlkcmF0aW9uRGF0YSxcbiAgICBmdXR1cmVcbiAgfSkge1xuICAgIGxldCByb3V0ZXJSZWYgPSBSZWFjdDIudXNlUmVmKCk7XG4gICAgbGV0IGZyYW1ld29ya0NvbnRleHRSZWYgPSBSZWFjdDIudXNlUmVmKCk7XG4gICAgaWYgKHJvdXRlclJlZi5jdXJyZW50ID09IG51bGwpIHtcbiAgICAgIGZyYW1ld29ya0NvbnRleHRSZWYuY3VycmVudCA9IHtcbiAgICAgICAgZnV0dXJlOiB7XG4gICAgICAgICAgdW5zdGFibGVfc3ViUmVzb3VyY2VJbnRlZ3JpdHk6IGZ1dHVyZT8udW5zdGFibGVfc3ViUmVzb3VyY2VJbnRlZ3JpdHkgPT09IHRydWUsXG4gICAgICAgICAgdjhfbWlkZGxld2FyZTogZnV0dXJlPy52OF9taWRkbGV3YXJlID09PSB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgICAgcm91dGVzOiB7fSxcbiAgICAgICAgICBlbnRyeTogeyBpbXBvcnRzOiBbXSwgbW9kdWxlOiBcIlwiIH0sXG4gICAgICAgICAgdXJsOiBcIlwiLFxuICAgICAgICAgIHZlcnNpb246IFwiXCJcbiAgICAgICAgfSxcbiAgICAgICAgcm91dGVNb2R1bGVzOiB7fSxcbiAgICAgICAgc3NyOiBmYWxzZSxcbiAgICAgICAgaXNTcGFNb2RlOiBmYWxzZSxcbiAgICAgICAgcm91dGVEaXNjb3Zlcnk6IHsgbW9kZTogXCJsYXp5XCIsIG1hbmlmZXN0UGF0aDogXCIvX19tYW5pZmVzdFwiIH1cbiAgICAgIH07XG4gICAgICBsZXQgcGF0Y2hlZCA9IHByb2Nlc3NSb3V0ZXMoXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgYFN0dWJSb3V0ZU9iamVjdGAgaXMgc3RyaWN0ZXIgYWJvdXQgYGxvYWRlcmAvYGFjdGlvbmBcbiAgICAgICAgLy8gdHlwZXMgY29tcGFyZWQgdG8gYEFnbm9zdGljUm91dGVPYmplY3RgXG4gICAgICAgIGNvbnZlcnRSb3V0ZXNUb0RhdGFSb3V0ZXMocm91dGVzLCAocikgPT4gciksXG4gICAgICAgIF9jb250ZXh0ICE9PSB2b2lkIDAgPyBfY29udGV4dCA6IGZ1dHVyZT8udjhfbWlkZGxld2FyZSA/IG5ldyBSb3V0ZXJDb250ZXh0UHJvdmlkZXIoKSA6IHt9LFxuICAgICAgICBmcmFtZXdvcmtDb250ZXh0UmVmLmN1cnJlbnQubWFuaWZlc3QsXG4gICAgICAgIGZyYW1ld29ya0NvbnRleHRSZWYuY3VycmVudC5yb3V0ZU1vZHVsZXNcbiAgICAgICk7XG4gICAgICByb3V0ZXJSZWYuY3VycmVudCA9IGNyZWF0ZU1lbW9yeVJvdXRlcihwYXRjaGVkLCB7XG4gICAgICAgIGluaXRpYWxFbnRyaWVzLFxuICAgICAgICBpbml0aWFsSW5kZXgsXG4gICAgICAgIGh5ZHJhdGlvbkRhdGFcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gLyogQF9fUFVSRV9fICovIFJlYWN0Mi5jcmVhdGVFbGVtZW50KEZyYW1ld29ya0NvbnRleHQuUHJvdmlkZXIsIHsgdmFsdWU6IGZyYW1ld29ya0NvbnRleHRSZWYuY3VycmVudCB9LCAvKiBAX19QVVJFX18gKi8gUmVhY3QyLmNyZWF0ZUVsZW1lbnQoUm91dGVyUHJvdmlkZXIsIHsgcm91dGVyOiByb3V0ZXJSZWYuY3VycmVudCB9KSk7XG4gIH07XG59XG5mdW5jdGlvbiBwcm9jZXNzUm91dGVzKHJvdXRlcywgY29udGV4dCwgbWFuaWZlc3QsIHJvdXRlTW9kdWxlcywgcGFyZW50SWQpIHtcbiAgcmV0dXJuIHJvdXRlcy5tYXAoKHJvdXRlKSA9PiB7XG4gICAgaWYgKCFyb3V0ZS5pZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBcIkV4cGVjdGVkIGEgcm91dGUuaWQgaW4gcmVhY3Qtcm91dGVyIHByb2Nlc3NSb3V0ZXMoKSBmdW5jdGlvblwiXG4gICAgICApO1xuICAgIH1cbiAgICBsZXQgbmV3Um91dGUgPSB7XG4gICAgICBpZDogcm91dGUuaWQsXG4gICAgICBwYXRoOiByb3V0ZS5wYXRoLFxuICAgICAgaW5kZXg6IHJvdXRlLmluZGV4LFxuICAgICAgQ29tcG9uZW50OiByb3V0ZS5Db21wb25lbnQgPyB3aXRoQ29tcG9uZW50UHJvcHMocm91dGUuQ29tcG9uZW50KSA6IHZvaWQgMCxcbiAgICAgIEh5ZHJhdGVGYWxsYmFjazogcm91dGUuSHlkcmF0ZUZhbGxiYWNrID8gd2l0aEh5ZHJhdGVGYWxsYmFja1Byb3BzKHJvdXRlLkh5ZHJhdGVGYWxsYmFjaykgOiB2b2lkIDAsXG4gICAgICBFcnJvckJvdW5kYXJ5OiByb3V0ZS5FcnJvckJvdW5kYXJ5ID8gd2l0aEVycm9yQm91bmRhcnlQcm9wcyhyb3V0ZS5FcnJvckJvdW5kYXJ5KSA6IHZvaWQgMCxcbiAgICAgIGFjdGlvbjogcm91dGUuYWN0aW9uID8gKGFyZ3MpID0+IHJvdXRlLmFjdGlvbih7IC4uLmFyZ3MsIGNvbnRleHQgfSkgOiB2b2lkIDAsXG4gICAgICBsb2FkZXI6IHJvdXRlLmxvYWRlciA/IChhcmdzKSA9PiByb3V0ZS5sb2FkZXIoeyAuLi5hcmdzLCBjb250ZXh0IH0pIDogdm9pZCAwLFxuICAgICAgbWlkZGxld2FyZTogcm91dGUubWlkZGxld2FyZSA/IHJvdXRlLm1pZGRsZXdhcmUubWFwKFxuICAgICAgICAobXcpID0+ICguLi5hcmdzKSA9PiBtdyhcbiAgICAgICAgICB7IC4uLmFyZ3NbMF0sIGNvbnRleHQgfSxcbiAgICAgICAgICBhcmdzWzFdXG4gICAgICAgIClcbiAgICAgICkgOiB2b2lkIDAsXG4gICAgICBoYW5kbGU6IHJvdXRlLmhhbmRsZSxcbiAgICAgIHNob3VsZFJldmFsaWRhdGU6IHJvdXRlLnNob3VsZFJldmFsaWRhdGVcbiAgICB9O1xuICAgIGxldCBlbnRyeVJvdXRlID0ge1xuICAgICAgaWQ6IHJvdXRlLmlkLFxuICAgICAgcGF0aDogcm91dGUucGF0aCxcbiAgICAgIGluZGV4OiByb3V0ZS5pbmRleCxcbiAgICAgIHBhcmVudElkLFxuICAgICAgaGFzQWN0aW9uOiByb3V0ZS5hY3Rpb24gIT0gbnVsbCxcbiAgICAgIGhhc0xvYWRlcjogcm91dGUubG9hZGVyICE9IG51bGwsXG4gICAgICAvLyBXaGVuIHRlc3Rpbmcgcm91dGVzLCB5b3Ugc2hvdWxkIGJlIHN0dWJiaW5nIGxvYWRlci9hY3Rpb24vbWlkZGxld2FyZSxcbiAgICAgIC8vIG5vdCB0cnlpbmcgdG8gcmUtaW1wbGVtZW50IHRoZSBmdWxsIGxvYWRlci9jbGllbnRMb2FkZXIvU1NSL2h5ZHJhdGlvblxuICAgICAgLy8gZmxvdy4gVGhhdCBpcyBiZXR0ZXIgdGVzdGVkIHZpYSBFMkUgdGVzdHMuXG4gICAgICBoYXNDbGllbnRBY3Rpb246IGZhbHNlLFxuICAgICAgaGFzQ2xpZW50TG9hZGVyOiBmYWxzZSxcbiAgICAgIGhhc0NsaWVudE1pZGRsZXdhcmU6IGZhbHNlLFxuICAgICAgaGFzRXJyb3JCb3VuZGFyeTogcm91dGUuRXJyb3JCb3VuZGFyeSAhPSBudWxsLFxuICAgICAgLy8gYW55IG5lZWQgZm9yIHRoZXNlP1xuICAgICAgbW9kdWxlOiBcImJ1aWxkL3N0dWItcGF0aC10by1tb2R1bGUuanNcIixcbiAgICAgIGNsaWVudEFjdGlvbk1vZHVsZTogdm9pZCAwLFxuICAgICAgY2xpZW50TG9hZGVyTW9kdWxlOiB2b2lkIDAsXG4gICAgICBjbGllbnRNaWRkbGV3YXJlTW9kdWxlOiB2b2lkIDAsXG4gICAgICBoeWRyYXRlRmFsbGJhY2tNb2R1bGU6IHZvaWQgMFxuICAgIH07XG4gICAgbWFuaWZlc3Qucm91dGVzW25ld1JvdXRlLmlkXSA9IGVudHJ5Um91dGU7XG4gICAgcm91dGVNb2R1bGVzW3JvdXRlLmlkXSA9IHtcbiAgICAgIGRlZmF1bHQ6IG5ld1JvdXRlLkNvbXBvbmVudCB8fCBPdXRsZXQsXG4gICAgICBFcnJvckJvdW5kYXJ5OiBuZXdSb3V0ZS5FcnJvckJvdW5kYXJ5IHx8IHZvaWQgMCxcbiAgICAgIGhhbmRsZTogcm91dGUuaGFuZGxlLFxuICAgICAgbGlua3M6IHJvdXRlLmxpbmtzLFxuICAgICAgbWV0YTogcm91dGUubWV0YSxcbiAgICAgIHNob3VsZFJldmFsaWRhdGU6IHJvdXRlLnNob3VsZFJldmFsaWRhdGVcbiAgICB9O1xuICAgIGlmIChyb3V0ZS5jaGlsZHJlbikge1xuICAgICAgbmV3Um91dGUuY2hpbGRyZW4gPSBwcm9jZXNzUm91dGVzKFxuICAgICAgICByb3V0ZS5jaGlsZHJlbixcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgbWFuaWZlc3QsXG4gICAgICAgIHJvdXRlTW9kdWxlcyxcbiAgICAgICAgbmV3Um91dGUuaWRcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBuZXdSb3V0ZTtcbiAgfSk7XG59XG5cbi8vIGxpYi9zZXJ2ZXItcnVudGltZS9jb29raWVzLnRzXG5pbXBvcnQgeyBwYXJzZSwgc2VyaWFsaXplIH0gZnJvbSBcImNvb2tpZVwiO1xuXG4vLyBsaWIvc2VydmVyLXJ1bnRpbWUvY3J5cHRvLnRzXG52YXIgZW5jb2RlciA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgVGV4dEVuY29kZXIoKTtcbnZhciBzaWduID0gYXN5bmMgKHZhbHVlLCBzZWNyZXQpID0+IHtcbiAgbGV0IGRhdGEyID0gZW5jb2Rlci5lbmNvZGUodmFsdWUpO1xuICBsZXQga2V5ID0gYXdhaXQgY3JlYXRlS2V5KHNlY3JldCwgW1wic2lnblwiXSk7XG4gIGxldCBzaWduYXR1cmUgPSBhd2FpdCBjcnlwdG8uc3VidGxlLnNpZ24oXCJITUFDXCIsIGtleSwgZGF0YTIpO1xuICBsZXQgaGFzaCA9IGJ0b2EoU3RyaW5nLmZyb21DaGFyQ29kZSguLi5uZXcgVWludDhBcnJheShzaWduYXR1cmUpKSkucmVwbGFjZShcbiAgICAvPSskLyxcbiAgICBcIlwiXG4gICk7XG4gIHJldHVybiB2YWx1ZSArIFwiLlwiICsgaGFzaDtcbn07XG52YXIgdW5zaWduID0gYXN5bmMgKGNvb2tpZSwgc2VjcmV0KSA9PiB7XG4gIGxldCBpbmRleCA9IGNvb2tpZS5sYXN0SW5kZXhPZihcIi5cIik7XG4gIGxldCB2YWx1ZSA9IGNvb2tpZS5zbGljZSgwLCBpbmRleCk7XG4gIGxldCBoYXNoID0gY29va2llLnNsaWNlKGluZGV4ICsgMSk7XG4gIGxldCBkYXRhMiA9IGVuY29kZXIuZW5jb2RlKHZhbHVlKTtcbiAgbGV0IGtleSA9IGF3YWl0IGNyZWF0ZUtleShzZWNyZXQsIFtcInZlcmlmeVwiXSk7XG4gIHRyeSB7XG4gICAgbGV0IHNpZ25hdHVyZSA9IGJ5dGVTdHJpbmdUb1VpbnQ4QXJyYXkoYXRvYihoYXNoKSk7XG4gICAgbGV0IHZhbGlkID0gYXdhaXQgY3J5cHRvLnN1YnRsZS52ZXJpZnkoXCJITUFDXCIsIGtleSwgc2lnbmF0dXJlLCBkYXRhMik7XG4gICAgcmV0dXJuIHZhbGlkID8gdmFsdWUgOiBmYWxzZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG52YXIgY3JlYXRlS2V5ID0gYXN5bmMgKHNlY3JldCwgdXNhZ2VzKSA9PiBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgXCJyYXdcIixcbiAgZW5jb2Rlci5lbmNvZGUoc2VjcmV0KSxcbiAgeyBuYW1lOiBcIkhNQUNcIiwgaGFzaDogXCJTSEEtMjU2XCIgfSxcbiAgZmFsc2UsXG4gIHVzYWdlc1xuKTtcbmZ1bmN0aW9uIGJ5dGVTdHJpbmdUb1VpbnQ4QXJyYXkoYnl0ZVN0cmluZykge1xuICBsZXQgYXJyYXkgPSBuZXcgVWludDhBcnJheShieXRlU3RyaW5nLmxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZVN0cmluZy5sZW5ndGg7IGkrKykge1xuICAgIGFycmF5W2ldID0gYnl0ZVN0cmluZy5jaGFyQ29kZUF0KGkpO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuLy8gbGliL3NlcnZlci1ydW50aW1lL2Nvb2tpZXMudHNcbnZhciBjcmVhdGVDb29raWUgPSAobmFtZSwgY29va2llT3B0aW9ucyA9IHt9KSA9PiB7XG4gIGxldCB7IHNlY3JldHMgPSBbXSwgLi4ub3B0aW9ucyB9ID0ge1xuICAgIHBhdGg6IFwiL1wiLFxuICAgIHNhbWVTaXRlOiBcImxheFwiLFxuICAgIC4uLmNvb2tpZU9wdGlvbnNcbiAgfTtcbiAgd2Fybk9uY2VBYm91dEV4cGlyZXNDb29raWUobmFtZSwgb3B0aW9ucy5leHBpcmVzKTtcbiAgcmV0dXJuIHtcbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgIHJldHVybiBuYW1lO1xuICAgIH0sXG4gICAgZ2V0IGlzU2lnbmVkKCkge1xuICAgICAgcmV0dXJuIHNlY3JldHMubGVuZ3RoID4gMDtcbiAgICB9LFxuICAgIGdldCBleHBpcmVzKCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvcHRpb25zLm1heEFnZSAhPT0gXCJ1bmRlZmluZWRcIiA/IG5ldyBEYXRlKERhdGUubm93KCkgKyBvcHRpb25zLm1heEFnZSAqIDFlMykgOiBvcHRpb25zLmV4cGlyZXM7XG4gICAgfSxcbiAgICBhc3luYyBwYXJzZShjb29raWVIZWFkZXIsIHBhcnNlT3B0aW9ucykge1xuICAgICAgaWYgKCFjb29raWVIZWFkZXIpIHJldHVybiBudWxsO1xuICAgICAgbGV0IGNvb2tpZXMgPSBwYXJzZShjb29raWVIZWFkZXIsIHsgLi4ub3B0aW9ucywgLi4ucGFyc2VPcHRpb25zIH0pO1xuICAgICAgaWYgKG5hbWUgaW4gY29va2llcykge1xuICAgICAgICBsZXQgdmFsdWUgPSBjb29raWVzW25hbWVdO1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiICYmIHZhbHVlICE9PSBcIlwiKSB7XG4gICAgICAgICAgbGV0IGRlY29kZWQgPSBhd2FpdCBkZWNvZGVDb29raWVWYWx1ZSh2YWx1ZSwgc2VjcmV0cyk7XG4gICAgICAgICAgcmV0dXJuIGRlY29kZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH0sXG4gICAgYXN5bmMgc2VyaWFsaXplKHZhbHVlLCBzZXJpYWxpemVPcHRpb25zKSB7XG4gICAgICByZXR1cm4gc2VyaWFsaXplKFxuICAgICAgICBuYW1lLFxuICAgICAgICB2YWx1ZSA9PT0gXCJcIiA/IFwiXCIgOiBhd2FpdCBlbmNvZGVDb29raWVWYWx1ZSh2YWx1ZSwgc2VjcmV0cyksXG4gICAgICAgIHtcbiAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgIC4uLnNlcmlhbGl6ZU9wdGlvbnNcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG4gIH07XG59O1xudmFyIGlzQ29va2llID0gKG9iamVjdCkgPT4ge1xuICByZXR1cm4gb2JqZWN0ICE9IG51bGwgJiYgdHlwZW9mIG9iamVjdC5uYW1lID09PSBcInN0cmluZ1wiICYmIHR5cGVvZiBvYmplY3QuaXNTaWduZWQgPT09IFwiYm9vbGVhblwiICYmIHR5cGVvZiBvYmplY3QucGFyc2UgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2Ygb2JqZWN0LnNlcmlhbGl6ZSA9PT0gXCJmdW5jdGlvblwiO1xufTtcbmFzeW5jIGZ1bmN0aW9uIGVuY29kZUNvb2tpZVZhbHVlKHZhbHVlLCBzZWNyZXRzKSB7XG4gIGxldCBlbmNvZGVkID0gZW5jb2RlRGF0YSh2YWx1ZSk7XG4gIGlmIChzZWNyZXRzLmxlbmd0aCA+IDApIHtcbiAgICBlbmNvZGVkID0gYXdhaXQgc2lnbihlbmNvZGVkLCBzZWNyZXRzWzBdKTtcbiAgfVxuICByZXR1cm4gZW5jb2RlZDtcbn1cbmFzeW5jIGZ1bmN0aW9uIGRlY29kZUNvb2tpZVZhbHVlKHZhbHVlLCBzZWNyZXRzKSB7XG4gIGlmIChzZWNyZXRzLmxlbmd0aCA+IDApIHtcbiAgICBmb3IgKGxldCBzZWNyZXQgb2Ygc2VjcmV0cykge1xuICAgICAgbGV0IHVuc2lnbmVkVmFsdWUgPSBhd2FpdCB1bnNpZ24odmFsdWUsIHNlY3JldCk7XG4gICAgICBpZiAodW5zaWduZWRWYWx1ZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGRlY29kZURhdGEodW5zaWduZWRWYWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBkZWNvZGVEYXRhKHZhbHVlKTtcbn1cbmZ1bmN0aW9uIGVuY29kZURhdGEodmFsdWUpIHtcbiAgcmV0dXJuIGJ0b2EobXlVbmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkodmFsdWUpKSkpO1xufVxuZnVuY3Rpb24gZGVjb2RlRGF0YSh2YWx1ZSkge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKGRlY29kZVVSSUNvbXBvbmVudChteUVzY2FwZShhdG9iKHZhbHVlKSkpKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4ge307XG4gIH1cbn1cbmZ1bmN0aW9uIG15RXNjYXBlKHZhbHVlKSB7XG4gIGxldCBzdHIgPSB2YWx1ZS50b1N0cmluZygpO1xuICBsZXQgcmVzdWx0ID0gXCJcIjtcbiAgbGV0IGluZGV4ID0gMDtcbiAgbGV0IGNociwgY29kZTtcbiAgd2hpbGUgKGluZGV4IDwgc3RyLmxlbmd0aCkge1xuICAgIGNociA9IHN0ci5jaGFyQXQoaW5kZXgrKyk7XG4gICAgaWYgKC9bXFx3KitcXC0uL0BdLy5leGVjKGNocikpIHtcbiAgICAgIHJlc3VsdCArPSBjaHI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvZGUgPSBjaHIuY2hhckNvZGVBdCgwKTtcbiAgICAgIGlmIChjb2RlIDwgMjU2KSB7XG4gICAgICAgIHJlc3VsdCArPSBcIiVcIiArIGhleChjb2RlLCAyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCArPSBcIiV1XCIgKyBoZXgoY29kZSwgNCkudG9VcHBlckNhc2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGhleChjb2RlLCBsZW5ndGgpIHtcbiAgbGV0IHJlc3VsdCA9IGNvZGUudG9TdHJpbmcoMTYpO1xuICB3aGlsZSAocmVzdWx0Lmxlbmd0aCA8IGxlbmd0aCkgcmVzdWx0ID0gXCIwXCIgKyByZXN1bHQ7XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBteVVuZXNjYXBlKHZhbHVlKSB7XG4gIGxldCBzdHIgPSB2YWx1ZS50b1N0cmluZygpO1xuICBsZXQgcmVzdWx0ID0gXCJcIjtcbiAgbGV0IGluZGV4ID0gMDtcbiAgbGV0IGNociwgcGFydDtcbiAgd2hpbGUgKGluZGV4IDwgc3RyLmxlbmd0aCkge1xuICAgIGNociA9IHN0ci5jaGFyQXQoaW5kZXgrKyk7XG4gICAgaWYgKGNociA9PT0gXCIlXCIpIHtcbiAgICAgIGlmIChzdHIuY2hhckF0KGluZGV4KSA9PT0gXCJ1XCIpIHtcbiAgICAgICAgcGFydCA9IHN0ci5zbGljZShpbmRleCArIDEsIGluZGV4ICsgNSk7XG4gICAgICAgIGlmICgvXltcXGRhLWZdezR9JC9pLmV4ZWMocGFydCkpIHtcbiAgICAgICAgICByZXN1bHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChwYXJ0LCAxNikpO1xuICAgICAgICAgIGluZGV4ICs9IDU7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnQgPSBzdHIuc2xpY2UoaW5kZXgsIGluZGV4ICsgMik7XG4gICAgICAgIGlmICgvXltcXGRhLWZdezJ9JC9pLmV4ZWMocGFydCkpIHtcbiAgICAgICAgICByZXN1bHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChwYXJ0LCAxNikpO1xuICAgICAgICAgIGluZGV4ICs9IDI7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0ICs9IGNocjtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gd2Fybk9uY2VBYm91dEV4cGlyZXNDb29raWUobmFtZSwgZXhwaXJlcykge1xuICB3YXJuT25jZShcbiAgICAhZXhwaXJlcyxcbiAgICBgVGhlIFwiJHtuYW1lfVwiIGNvb2tpZSBoYXMgYW4gXCJleHBpcmVzXCIgcHJvcGVydHkgc2V0LiBUaGlzIHdpbGwgY2F1c2UgdGhlIGV4cGlyZXMgdmFsdWUgdG8gbm90IGJlIHVwZGF0ZWQgd2hlbiB0aGUgc2Vzc2lvbiBpcyBjb21taXR0ZWQuIEluc3RlYWQsIHlvdSBzaG91bGQgc2V0IHRoZSBleHBpcmVzIHZhbHVlIHdoZW4gc2VyaWFsaXppbmcgdGhlIGNvb2tpZS4gWW91IGNhbiB1c2UgXFxgY29tbWl0U2Vzc2lvbihzZXNzaW9uLCB7IGV4cGlyZXMgfSlcXGAgaWYgdXNpbmcgYSBzZXNzaW9uIHN0b3JhZ2Ugb2JqZWN0LCBvciBcXGBjb29raWUuc2VyaWFsaXplKFwidmFsdWVcIiwgeyBleHBpcmVzIH0pXFxgIGlmIHlvdSdyZSB1c2luZyB0aGUgY29va2llIGRpcmVjdGx5LmBcbiAgKTtcbn1cblxuLy8gbGliL3NlcnZlci1ydW50aW1lL2VudHJ5LnRzXG5mdW5jdGlvbiBjcmVhdGVFbnRyeVJvdXRlTW9kdWxlcyhtYW5pZmVzdCkge1xuICByZXR1cm4gT2JqZWN0LmtleXMobWFuaWZlc3QpLnJlZHVjZSgobWVtbywgcm91dGVJZCkgPT4ge1xuICAgIGxldCByb3V0ZSA9IG1hbmlmZXN0W3JvdXRlSWRdO1xuICAgIGlmIChyb3V0ZSkge1xuICAgICAgbWVtb1tyb3V0ZUlkXSA9IHJvdXRlLm1vZHVsZTtcbiAgICB9XG4gICAgcmV0dXJuIG1lbW87XG4gIH0sIHt9KTtcbn1cblxuLy8gbGliL3NlcnZlci1ydW50aW1lL21vZGUudHNcbnZhciBTZXJ2ZXJNb2RlID0gLyogQF9fUFVSRV9fICovICgoU2VydmVyTW9kZTIpID0+IHtcbiAgU2VydmVyTW9kZTJbXCJEZXZlbG9wbWVudFwiXSA9IFwiZGV2ZWxvcG1lbnRcIjtcbiAgU2VydmVyTW9kZTJbXCJQcm9kdWN0aW9uXCJdID0gXCJwcm9kdWN0aW9uXCI7XG4gIFNlcnZlck1vZGUyW1wiVGVzdFwiXSA9IFwidGVzdFwiO1xuICByZXR1cm4gU2VydmVyTW9kZTI7XG59KShTZXJ2ZXJNb2RlIHx8IHt9KTtcbmZ1bmN0aW9uIGlzU2VydmVyTW9kZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IFwiZGV2ZWxvcG1lbnRcIiAvKiBEZXZlbG9wbWVudCAqLyB8fCB2YWx1ZSA9PT0gXCJwcm9kdWN0aW9uXCIgLyogUHJvZHVjdGlvbiAqLyB8fCB2YWx1ZSA9PT0gXCJ0ZXN0XCIgLyogVGVzdCAqLztcbn1cblxuLy8gbGliL3NlcnZlci1ydW50aW1lL2Vycm9ycy50c1xuZnVuY3Rpb24gc2FuaXRpemVFcnJvcihlcnJvciwgc2VydmVyTW9kZSkge1xuICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBzZXJ2ZXJNb2RlICE9PSBcImRldmVsb3BtZW50XCIgLyogRGV2ZWxvcG1lbnQgKi8pIHtcbiAgICBsZXQgc2FuaXRpemVkID0gbmV3IEVycm9yKFwiVW5leHBlY3RlZCBTZXJ2ZXIgRXJyb3JcIik7XG4gICAgc2FuaXRpemVkLnN0YWNrID0gdm9pZCAwO1xuICAgIHJldHVybiBzYW5pdGl6ZWQ7XG4gIH1cbiAgcmV0dXJuIGVycm9yO1xufVxuZnVuY3Rpb24gc2FuaXRpemVFcnJvcnMoZXJyb3JzLCBzZXJ2ZXJNb2RlKSB7XG4gIHJldHVybiBPYmplY3QuZW50cmllcyhlcnJvcnMpLnJlZHVjZSgoYWNjLCBbcm91dGVJZCwgZXJyb3JdKSA9PiB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oYWNjLCB7IFtyb3V0ZUlkXTogc2FuaXRpemVFcnJvcihlcnJvciwgc2VydmVyTW9kZSkgfSk7XG4gIH0sIHt9KTtcbn1cbmZ1bmN0aW9uIHNlcmlhbGl6ZUVycm9yKGVycm9yLCBzZXJ2ZXJNb2RlKSB7XG4gIGxldCBzYW5pdGl6ZWQgPSBzYW5pdGl6ZUVycm9yKGVycm9yLCBzZXJ2ZXJNb2RlKTtcbiAgcmV0dXJuIHtcbiAgICBtZXNzYWdlOiBzYW5pdGl6ZWQubWVzc2FnZSxcbiAgICBzdGFjazogc2FuaXRpemVkLnN0YWNrXG4gIH07XG59XG5mdW5jdGlvbiBzZXJpYWxpemVFcnJvcnMoZXJyb3JzLCBzZXJ2ZXJNb2RlKSB7XG4gIGlmICghZXJyb3JzKSByZXR1cm4gbnVsbDtcbiAgbGV0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyhlcnJvcnMpO1xuICBsZXQgc2VyaWFsaXplZCA9IHt9O1xuICBmb3IgKGxldCBba2V5LCB2YWxdIG9mIGVudHJpZXMpIHtcbiAgICBpZiAoaXNSb3V0ZUVycm9yUmVzcG9uc2UodmFsKSkge1xuICAgICAgc2VyaWFsaXplZFtrZXldID0geyAuLi52YWwsIF9fdHlwZTogXCJSb3V0ZUVycm9yUmVzcG9uc2VcIiB9O1xuICAgIH0gZWxzZSBpZiAodmFsIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIGxldCBzYW5pdGl6ZWQgPSBzYW5pdGl6ZUVycm9yKHZhbCwgc2VydmVyTW9kZSk7XG4gICAgICBzZXJpYWxpemVkW2tleV0gPSB7XG4gICAgICAgIG1lc3NhZ2U6IHNhbml0aXplZC5tZXNzYWdlLFxuICAgICAgICBzdGFjazogc2FuaXRpemVkLnN0YWNrLFxuICAgICAgICBfX3R5cGU6IFwiRXJyb3JcIixcbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhIHN1YmNsYXNzIChpLmUuLCBSZWZlcmVuY2VFcnJvciksIHNlbmQgdXAgdGhlIHR5cGUgc28gd2VcbiAgICAgICAgLy8gY2FuIHJlLWNyZWF0ZSB0aGUgc2FtZSB0eXBlIGR1cmluZyBoeWRyYXRpb24uICBUaGlzIHdpbGwgb25seSBhcHBseVxuICAgICAgICAvLyBpbiBkZXYgbW9kZSBzaW5jZSBhbGwgcHJvZHVjdGlvbiBlcnJvcnMgYXJlIHNhbml0aXplZCB0byBub3JtYWxcbiAgICAgICAgLy8gRXJyb3IgaW5zdGFuY2VzXG4gICAgICAgIC4uLnNhbml0aXplZC5uYW1lICE9PSBcIkVycm9yXCIgPyB7XG4gICAgICAgICAgX19zdWJUeXBlOiBzYW5pdGl6ZWQubmFtZVxuICAgICAgICB9IDoge31cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlcmlhbGl6ZWRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHNlcmlhbGl6ZWQ7XG59XG5cbi8vIGxpYi9zZXJ2ZXItcnVudGltZS9yb3V0ZU1hdGNoaW5nLnRzXG5mdW5jdGlvbiBtYXRjaFNlcnZlclJvdXRlcyhyb3V0ZXMsIHBhdGhuYW1lLCBiYXNlbmFtZSkge1xuICBsZXQgbWF0Y2hlcyA9IG1hdGNoUm91dGVzKFxuICAgIHJvdXRlcyxcbiAgICBwYXRobmFtZSxcbiAgICBiYXNlbmFtZVxuICApO1xuICBpZiAoIW1hdGNoZXMpIHJldHVybiBudWxsO1xuICByZXR1cm4gbWF0Y2hlcy5tYXAoKG1hdGNoKSA9PiAoe1xuICAgIHBhcmFtczogbWF0Y2gucGFyYW1zLFxuICAgIHBhdGhuYW1lOiBtYXRjaC5wYXRobmFtZSxcbiAgICByb3V0ZTogbWF0Y2gucm91dGVcbiAgfSkpO1xufVxuXG4vLyBsaWIvc2VydmVyLXJ1bnRpbWUvZGF0YS50c1xuYXN5bmMgZnVuY3Rpb24gY2FsbFJvdXRlSGFuZGxlcihoYW5kbGVyLCBhcmdzKSB7XG4gIGxldCByZXN1bHQgPSBhd2FpdCBoYW5kbGVyKHtcbiAgICByZXF1ZXN0OiBzdHJpcFJvdXRlc1BhcmFtKHN0cmlwSW5kZXhQYXJhbShhcmdzLnJlcXVlc3QpKSxcbiAgICBwYXJhbXM6IGFyZ3MucGFyYW1zLFxuICAgIGNvbnRleHQ6IGFyZ3MuY29udGV4dCxcbiAgICB1bnN0YWJsZV9wYXR0ZXJuOiBhcmdzLnVuc3RhYmxlX3BhdHRlcm5cbiAgfSk7XG4gIGlmIChpc0RhdGFXaXRoUmVzcG9uc2VJbml0KHJlc3VsdCkgJiYgcmVzdWx0LmluaXQgJiYgcmVzdWx0LmluaXQuc3RhdHVzICYmIGlzUmVkaXJlY3RTdGF0dXNDb2RlKHJlc3VsdC5pbml0LnN0YXR1cykpIHtcbiAgICB0aHJvdyBuZXcgUmVzcG9uc2UobnVsbCwgcmVzdWx0LmluaXQpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBzdHJpcEluZGV4UGFyYW0ocmVxdWVzdCkge1xuICBsZXQgdXJsID0gbmV3IFVSTChyZXF1ZXN0LnVybCk7XG4gIGxldCBpbmRleFZhbHVlcyA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0QWxsKFwiaW5kZXhcIik7XG4gIHVybC5zZWFyY2hQYXJhbXMuZGVsZXRlKFwiaW5kZXhcIik7XG4gIGxldCBpbmRleFZhbHVlc1RvS2VlcCA9IFtdO1xuICBmb3IgKGxldCBpbmRleFZhbHVlIG9mIGluZGV4VmFsdWVzKSB7XG4gICAgaWYgKGluZGV4VmFsdWUpIHtcbiAgICAgIGluZGV4VmFsdWVzVG9LZWVwLnB1c2goaW5kZXhWYWx1ZSk7XG4gICAgfVxuICB9XG4gIGZvciAobGV0IHRvS2VlcCBvZiBpbmRleFZhbHVlc1RvS2VlcCkge1xuICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKFwiaW5kZXhcIiwgdG9LZWVwKTtcbiAgfVxuICBsZXQgaW5pdCA9IHtcbiAgICBtZXRob2Q6IHJlcXVlc3QubWV0aG9kLFxuICAgIGJvZHk6IHJlcXVlc3QuYm9keSxcbiAgICBoZWFkZXJzOiByZXF1ZXN0LmhlYWRlcnMsXG4gICAgc2lnbmFsOiByZXF1ZXN0LnNpZ25hbFxuICB9O1xuICBpZiAoaW5pdC5ib2R5KSB7XG4gICAgaW5pdC5kdXBsZXggPSBcImhhbGZcIjtcbiAgfVxuICByZXR1cm4gbmV3IFJlcXVlc3QodXJsLmhyZWYsIGluaXQpO1xufVxuZnVuY3Rpb24gc3RyaXBSb3V0ZXNQYXJhbShyZXF1ZXN0KSB7XG4gIGxldCB1cmwgPSBuZXcgVVJMKHJlcXVlc3QudXJsKTtcbiAgdXJsLnNlYXJjaFBhcmFtcy5kZWxldGUoXCJfcm91dGVzXCIpO1xuICBsZXQgaW5pdCA9IHtcbiAgICBtZXRob2Q6IHJlcXVlc3QubWV0aG9kLFxuICAgIGJvZHk6IHJlcXVlc3QuYm9keSxcbiAgICBoZWFkZXJzOiByZXF1ZXN0LmhlYWRlcnMsXG4gICAgc2lnbmFsOiByZXF1ZXN0LnNpZ25hbFxuICB9O1xuICBpZiAoaW5pdC5ib2R5KSB7XG4gICAgaW5pdC5kdXBsZXggPSBcImhhbGZcIjtcbiAgfVxuICByZXR1cm4gbmV3IFJlcXVlc3QodXJsLmhyZWYsIGluaXQpO1xufVxuXG4vLyBsaWIvc2VydmVyLXJ1bnRpbWUvaW52YXJpYW50LnRzXG5mdW5jdGlvbiBpbnZhcmlhbnQodmFsdWUsIG1lc3NhZ2UpIHtcbiAgaWYgKHZhbHVlID09PSBmYWxzZSB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgXCJUaGUgZm9sbG93aW5nIGVycm9yIGlzIGEgYnVnIGluIFJlYWN0IFJvdXRlcjsgcGxlYXNlIG9wZW4gYW4gaXNzdWUhIGh0dHBzOi8vZ2l0aHViLmNvbS9yZW1peC1ydW4vcmVhY3Qtcm91dGVyL2lzc3Vlcy9uZXcvY2hvb3NlXCJcbiAgICApO1xuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgfVxufVxuXG4vLyBsaWIvc2VydmVyLXJ1bnRpbWUvZGV2LnRzXG52YXIgZ2xvYmFsRGV2U2VydmVySG9va3NLZXkgPSBcIl9fcmVhY3RSb3V0ZXJEZXZTZXJ2ZXJIb29rc1wiO1xuZnVuY3Rpb24gc2V0RGV2U2VydmVySG9va3MoZGV2U2VydmVySG9va3MpIHtcbiAgZ2xvYmFsVGhpc1tnbG9iYWxEZXZTZXJ2ZXJIb29rc0tleV0gPSBkZXZTZXJ2ZXJIb29rcztcbn1cbmZ1bmN0aW9uIGdldERldlNlcnZlckhvb2tzKCkge1xuICByZXR1cm4gZ2xvYmFsVGhpc1tnbG9iYWxEZXZTZXJ2ZXJIb29rc0tleV07XG59XG5mdW5jdGlvbiBnZXRCdWlsZFRpbWVIZWFkZXIocmVxdWVzdCwgaGVhZGVyTmFtZSkge1xuICBpZiAodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKHByb2Nlc3MuZW52Py5JU19SUl9CVUlMRF9SRVFVRVNUID09PSBcInllc1wiKSB7XG4gICAgICAgIHJldHVybiByZXF1ZXN0LmhlYWRlcnMuZ2V0KGhlYWRlck5hbWUpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8vIGxpYi9zZXJ2ZXItcnVudGltZS9yb3V0ZXMudHNcbmZ1bmN0aW9uIGdyb3VwUm91dGVzQnlQYXJlbnRJZChtYW5pZmVzdCkge1xuICBsZXQgcm91dGVzID0ge307XG4gIE9iamVjdC52YWx1ZXMobWFuaWZlc3QpLmZvckVhY2goKHJvdXRlKSA9PiB7XG4gICAgaWYgKHJvdXRlKSB7XG4gICAgICBsZXQgcGFyZW50SWQgPSByb3V0ZS5wYXJlbnRJZCB8fCBcIlwiO1xuICAgICAgaWYgKCFyb3V0ZXNbcGFyZW50SWRdKSB7XG4gICAgICAgIHJvdXRlc1twYXJlbnRJZF0gPSBbXTtcbiAgICAgIH1cbiAgICAgIHJvdXRlc1twYXJlbnRJZF0ucHVzaChyb3V0ZSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJvdXRlcztcbn1cbmZ1bmN0aW9uIGNyZWF0ZVJvdXRlcyhtYW5pZmVzdCwgcGFyZW50SWQgPSBcIlwiLCByb3V0ZXNCeVBhcmVudElkID0gZ3JvdXBSb3V0ZXNCeVBhcmVudElkKG1hbmlmZXN0KSkge1xuICByZXR1cm4gKHJvdXRlc0J5UGFyZW50SWRbcGFyZW50SWRdIHx8IFtdKS5tYXAoKHJvdXRlKSA9PiAoe1xuICAgIC4uLnJvdXRlLFxuICAgIGNoaWxkcmVuOiBjcmVhdGVSb3V0ZXMobWFuaWZlc3QsIHJvdXRlLmlkLCByb3V0ZXNCeVBhcmVudElkKVxuICB9KSk7XG59XG5mdW5jdGlvbiBjcmVhdGVTdGF0aWNIYW5kbGVyRGF0YVJvdXRlcyhtYW5pZmVzdCwgZnV0dXJlLCBwYXJlbnRJZCA9IFwiXCIsIHJvdXRlc0J5UGFyZW50SWQgPSBncm91cFJvdXRlc0J5UGFyZW50SWQobWFuaWZlc3QpKSB7XG4gIHJldHVybiAocm91dGVzQnlQYXJlbnRJZFtwYXJlbnRJZF0gfHwgW10pLm1hcCgocm91dGUpID0+IHtcbiAgICBsZXQgY29tbW9uUm91dGUgPSB7XG4gICAgICAvLyBBbHdheXMgaW5jbHVkZSByb290IGR1ZSB0byBkZWZhdWx0IGJvdW5kYXJpZXNcbiAgICAgIGhhc0Vycm9yQm91bmRhcnk6IHJvdXRlLmlkID09PSBcInJvb3RcIiB8fCByb3V0ZS5tb2R1bGUuRXJyb3JCb3VuZGFyeSAhPSBudWxsLFxuICAgICAgaWQ6IHJvdXRlLmlkLFxuICAgICAgcGF0aDogcm91dGUucGF0aCxcbiAgICAgIG1pZGRsZXdhcmU6IHJvdXRlLm1vZHVsZS5taWRkbGV3YXJlLFxuICAgICAgLy8gTmVlZCB0byB1c2UgUlIncyB2ZXJzaW9uIGluIHRoZSBwYXJhbSB0eXBlZCBoZXJlIHRvIHBlcm1pdCB0aGUgb3B0aW9uYWxcbiAgICAgIC8vIGNvbnRleHQgZXZlbiB0aG91Z2ggd2Uga25vdyBpdCdsbCBhbHdheXMgYmUgcHJvdmlkZWQgaW4gcmVtaXhcbiAgICAgIGxvYWRlcjogcm91dGUubW9kdWxlLmxvYWRlciA/IGFzeW5jIChhcmdzKSA9PiB7XG4gICAgICAgIGxldCBwcmVSZW5kZXJlZERhdGEgPSBnZXRCdWlsZFRpbWVIZWFkZXIoXG4gICAgICAgICAgYXJncy5yZXF1ZXN0LFxuICAgICAgICAgIFwiWC1SZWFjdC1Sb3V0ZXItUHJlcmVuZGVyLURhdGFcIlxuICAgICAgICApO1xuICAgICAgICBpZiAocHJlUmVuZGVyZWREYXRhICE9IG51bGwpIHtcbiAgICAgICAgICBsZXQgZW5jb2RlZCA9IHByZVJlbmRlcmVkRGF0YSA/IGRlY29kZVVSSShwcmVSZW5kZXJlZERhdGEpIDogcHJlUmVuZGVyZWREYXRhO1xuICAgICAgICAgIGludmFyaWFudChlbmNvZGVkLCBcIk1pc3NpbmcgcHJlcmVuZGVyZWQgZGF0YSBmb3Igcm91dGVcIik7XG4gICAgICAgICAgbGV0IHVpbnQ4YXJyYXkgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoZW5jb2RlZCk7XG4gICAgICAgICAgbGV0IHN0cmVhbSA9IG5ldyBSZWFkYWJsZVN0cmVhbSh7XG4gICAgICAgICAgICBzdGFydChjb250cm9sbGVyKSB7XG4gICAgICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZSh1aW50OGFycmF5KTtcbiAgICAgICAgICAgICAgY29udHJvbGxlci5jbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGxldCBkZWNvZGVkID0gYXdhaXQgZGVjb2RlVmlhVHVyYm9TdHJlYW0oc3RyZWFtLCBnbG9iYWwpO1xuICAgICAgICAgIGxldCBkYXRhMiA9IGRlY29kZWQudmFsdWU7XG4gICAgICAgICAgaWYgKGRhdGEyICYmIFNpbmdsZUZldGNoUmVkaXJlY3RTeW1ib2wgaW4gZGF0YTIpIHtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBkYXRhMltTaW5nbGVGZXRjaFJlZGlyZWN0U3ltYm9sXTtcbiAgICAgICAgICAgIGxldCBpbml0ID0geyBzdGF0dXM6IHJlc3VsdC5zdGF0dXMgfTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQucmVsb2FkKSB7XG4gICAgICAgICAgICAgIHRocm93IHJlZGlyZWN0RG9jdW1lbnQocmVzdWx0LnJlZGlyZWN0LCBpbml0KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzdWx0LnJlcGxhY2UpIHtcbiAgICAgICAgICAgICAgdGhyb3cgcmVwbGFjZShyZXN1bHQucmVkaXJlY3QsIGluaXQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgcmVkaXJlY3QocmVzdWx0LnJlZGlyZWN0LCBpbml0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW52YXJpYW50KFxuICAgICAgICAgICAgICBkYXRhMiAmJiByb3V0ZS5pZCBpbiBkYXRhMixcbiAgICAgICAgICAgICAgXCJVbmFibGUgdG8gZGVjb2RlIHByZXJlbmRlcmVkIGRhdGFcIlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBkYXRhMltyb3V0ZS5pZF07XG4gICAgICAgICAgICBpbnZhcmlhbnQoXG4gICAgICAgICAgICAgIFwiZGF0YVwiIGluIHJlc3VsdCxcbiAgICAgICAgICAgICAgXCJVbmFibGUgdG8gcHJvY2VzcyBwcmVyZW5kZXJlZCBkYXRhXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LmRhdGE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxldCB2YWwgPSBhd2FpdCBjYWxsUm91dGVIYW5kbGVyKHJvdXRlLm1vZHVsZS5sb2FkZXIsIGFyZ3MpO1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgfSA6IHZvaWQgMCxcbiAgICAgIGFjdGlvbjogcm91dGUubW9kdWxlLmFjdGlvbiA/IChhcmdzKSA9PiBjYWxsUm91dGVIYW5kbGVyKHJvdXRlLm1vZHVsZS5hY3Rpb24sIGFyZ3MpIDogdm9pZCAwLFxuICAgICAgaGFuZGxlOiByb3V0ZS5tb2R1bGUuaGFuZGxlXG4gICAgfTtcbiAgICByZXR1cm4gcm91dGUuaW5kZXggPyB7XG4gICAgICBpbmRleDogdHJ1ZSxcbiAgICAgIC4uLmNvbW1vblJvdXRlXG4gICAgfSA6IHtcbiAgICAgIGNhc2VTZW5zaXRpdmU6IHJvdXRlLmNhc2VTZW5zaXRpdmUsXG4gICAgICBjaGlsZHJlbjogY3JlYXRlU3RhdGljSGFuZGxlckRhdGFSb3V0ZXMoXG4gICAgICAgIG1hbmlmZXN0LFxuICAgICAgICBmdXR1cmUsXG4gICAgICAgIHJvdXRlLmlkLFxuICAgICAgICByb3V0ZXNCeVBhcmVudElkXG4gICAgICApLFxuICAgICAgLi4uY29tbW9uUm91dGVcbiAgICB9O1xuICB9KTtcbn1cblxuLy8gbGliL3NlcnZlci1ydW50aW1lL3NlcnZlckhhbmRvZmYudHNcbmZ1bmN0aW9uIGNyZWF0ZVNlcnZlckhhbmRvZmZTdHJpbmcoc2VydmVySGFuZG9mZikge1xuICByZXR1cm4gZXNjYXBlSHRtbChKU09OLnN0cmluZ2lmeShzZXJ2ZXJIYW5kb2ZmKSk7XG59XG5cbi8vIGxpYi9zZXJ2ZXItcnVudGltZS9oZWFkZXJzLnRzXG5pbXBvcnQgeyBzcGxpdENvb2tpZXNTdHJpbmcgfSBmcm9tIFwic2V0LWNvb2tpZS1wYXJzZXJcIjtcbmZ1bmN0aW9uIGdldERvY3VtZW50SGVhZGVycyhjb250ZXh0LCBidWlsZCkge1xuICByZXR1cm4gZ2V0RG9jdW1lbnRIZWFkZXJzSW1wbChjb250ZXh0LCAobSkgPT4ge1xuICAgIGxldCByb3V0ZSA9IGJ1aWxkLnJvdXRlc1ttLnJvdXRlLmlkXTtcbiAgICBpbnZhcmlhbnQocm91dGUsIGBSb3V0ZSB3aXRoIGlkIFwiJHttLnJvdXRlLmlkfVwiIG5vdCBmb3VuZCBpbiBidWlsZGApO1xuICAgIHJldHVybiByb3V0ZS5tb2R1bGUuaGVhZGVycztcbiAgfSk7XG59XG5mdW5jdGlvbiBnZXREb2N1bWVudEhlYWRlcnNJbXBsKGNvbnRleHQsIGdldFJvdXRlSGVhZGVyc0ZuLCBfZGVmYXVsdEhlYWRlcnMpIHtcbiAgbGV0IGJvdW5kYXJ5SWR4ID0gY29udGV4dC5lcnJvcnMgPyBjb250ZXh0Lm1hdGNoZXMuZmluZEluZGV4KChtKSA9PiBjb250ZXh0LmVycm9yc1ttLnJvdXRlLmlkXSkgOiAtMTtcbiAgbGV0IG1hdGNoZXMgPSBib3VuZGFyeUlkeCA+PSAwID8gY29udGV4dC5tYXRjaGVzLnNsaWNlKDAsIGJvdW5kYXJ5SWR4ICsgMSkgOiBjb250ZXh0Lm1hdGNoZXM7XG4gIGxldCBlcnJvckhlYWRlcnM7XG4gIGlmIChib3VuZGFyeUlkeCA+PSAwKSB7XG4gICAgbGV0IHsgYWN0aW9uSGVhZGVycywgYWN0aW9uRGF0YSwgbG9hZGVySGVhZGVycywgbG9hZGVyRGF0YSB9ID0gY29udGV4dDtcbiAgICBjb250ZXh0Lm1hdGNoZXMuc2xpY2UoYm91bmRhcnlJZHgpLnNvbWUoKG1hdGNoKSA9PiB7XG4gICAgICBsZXQgaWQgPSBtYXRjaC5yb3V0ZS5pZDtcbiAgICAgIGlmIChhY3Rpb25IZWFkZXJzW2lkXSAmJiAoIWFjdGlvbkRhdGEgfHwgIWFjdGlvbkRhdGEuaGFzT3duUHJvcGVydHkoaWQpKSkge1xuICAgICAgICBlcnJvckhlYWRlcnMgPSBhY3Rpb25IZWFkZXJzW2lkXTtcbiAgICAgIH0gZWxzZSBpZiAobG9hZGVySGVhZGVyc1tpZF0gJiYgIWxvYWRlckRhdGEuaGFzT3duUHJvcGVydHkoaWQpKSB7XG4gICAgICAgIGVycm9ySGVhZGVycyA9IGxvYWRlckhlYWRlcnNbaWRdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVycm9ySGVhZGVycyAhPSBudWxsO1xuICAgIH0pO1xuICB9XG4gIGNvbnN0IGRlZmF1bHRIZWFkZXJzID0gbmV3IEhlYWRlcnMoX2RlZmF1bHRIZWFkZXJzKTtcbiAgcmV0dXJuIG1hdGNoZXMucmVkdWNlKChwYXJlbnRIZWFkZXJzLCBtYXRjaCwgaWR4KSA9PiB7XG4gICAgbGV0IHsgaWQgfSA9IG1hdGNoLnJvdXRlO1xuICAgIGxldCBsb2FkZXJIZWFkZXJzID0gY29udGV4dC5sb2FkZXJIZWFkZXJzW2lkXSB8fCBuZXcgSGVhZGVycygpO1xuICAgIGxldCBhY3Rpb25IZWFkZXJzID0gY29udGV4dC5hY3Rpb25IZWFkZXJzW2lkXSB8fCBuZXcgSGVhZGVycygpO1xuICAgIGxldCBpbmNsdWRlRXJyb3JIZWFkZXJzID0gZXJyb3JIZWFkZXJzICE9IG51bGwgJiYgaWR4ID09PSBtYXRjaGVzLmxlbmd0aCAtIDE7XG4gICAgbGV0IGluY2x1ZGVFcnJvckNvb2tpZXMgPSBpbmNsdWRlRXJyb3JIZWFkZXJzICYmIGVycm9ySGVhZGVycyAhPT0gbG9hZGVySGVhZGVycyAmJiBlcnJvckhlYWRlcnMgIT09IGFjdGlvbkhlYWRlcnM7XG4gICAgbGV0IGhlYWRlcnNGbiA9IGdldFJvdXRlSGVhZGVyc0ZuKG1hdGNoKTtcbiAgICBpZiAoaGVhZGVyc0ZuID09IG51bGwpIHtcbiAgICAgIGxldCBoZWFkZXJzMiA9IG5ldyBIZWFkZXJzKHBhcmVudEhlYWRlcnMpO1xuICAgICAgaWYgKGluY2x1ZGVFcnJvckNvb2tpZXMpIHtcbiAgICAgICAgcHJlcGVuZENvb2tpZXMoZXJyb3JIZWFkZXJzLCBoZWFkZXJzMik7XG4gICAgICB9XG4gICAgICBwcmVwZW5kQ29va2llcyhhY3Rpb25IZWFkZXJzLCBoZWFkZXJzMik7XG4gICAgICBwcmVwZW5kQ29va2llcyhsb2FkZXJIZWFkZXJzLCBoZWFkZXJzMik7XG4gICAgICByZXR1cm4gaGVhZGVyczI7XG4gICAgfVxuICAgIGxldCBoZWFkZXJzID0gbmV3IEhlYWRlcnMoXG4gICAgICB0eXBlb2YgaGVhZGVyc0ZuID09PSBcImZ1bmN0aW9uXCIgPyBoZWFkZXJzRm4oe1xuICAgICAgICBsb2FkZXJIZWFkZXJzLFxuICAgICAgICBwYXJlbnRIZWFkZXJzLFxuICAgICAgICBhY3Rpb25IZWFkZXJzLFxuICAgICAgICBlcnJvckhlYWRlcnM6IGluY2x1ZGVFcnJvckhlYWRlcnMgPyBlcnJvckhlYWRlcnMgOiB2b2lkIDBcbiAgICAgIH0pIDogaGVhZGVyc0ZuXG4gICAgKTtcbiAgICBpZiAoaW5jbHVkZUVycm9yQ29va2llcykge1xuICAgICAgcHJlcGVuZENvb2tpZXMoZXJyb3JIZWFkZXJzLCBoZWFkZXJzKTtcbiAgICB9XG4gICAgcHJlcGVuZENvb2tpZXMoYWN0aW9uSGVhZGVycywgaGVhZGVycyk7XG4gICAgcHJlcGVuZENvb2tpZXMobG9hZGVySGVhZGVycywgaGVhZGVycyk7XG4gICAgcHJlcGVuZENvb2tpZXMocGFyZW50SGVhZGVycywgaGVhZGVycyk7XG4gICAgcmV0dXJuIGhlYWRlcnM7XG4gIH0sIG5ldyBIZWFkZXJzKGRlZmF1bHRIZWFkZXJzKSk7XG59XG5mdW5jdGlvbiBwcmVwZW5kQ29va2llcyhwYXJlbnRIZWFkZXJzLCBjaGlsZEhlYWRlcnMpIHtcbiAgbGV0IHBhcmVudFNldENvb2tpZVN0cmluZyA9IHBhcmVudEhlYWRlcnMuZ2V0KFwiU2V0LUNvb2tpZVwiKTtcbiAgaWYgKHBhcmVudFNldENvb2tpZVN0cmluZykge1xuICAgIGxldCBjb29raWVzID0gc3BsaXRDb29raWVzU3RyaW5nKHBhcmVudFNldENvb2tpZVN0cmluZyk7XG4gICAgbGV0IGNoaWxkQ29va2llcyA9IG5ldyBTZXQoY2hpbGRIZWFkZXJzLmdldFNldENvb2tpZSgpKTtcbiAgICBjb29raWVzLmZvckVhY2goKGNvb2tpZSkgPT4ge1xuICAgICAgaWYgKCFjaGlsZENvb2tpZXMuaGFzKGNvb2tpZSkpIHtcbiAgICAgICAgY2hpbGRIZWFkZXJzLmFwcGVuZChcIlNldC1Db29raWVcIiwgY29va2llKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG4vLyBsaWIvc2VydmVyLXJ1bnRpbWUvc2luZ2xlLWZldGNoLnRzXG52YXIgU0VSVkVSX05PX0JPRFlfU1RBVFVTX0NPREVTID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoW1xuICAuLi5OT19CT0RZX1NUQVRVU19DT0RFUyxcbiAgMzA0XG5dKTtcbmFzeW5jIGZ1bmN0aW9uIHNpbmdsZUZldGNoQWN0aW9uKGJ1aWxkLCBzZXJ2ZXJNb2RlLCBzdGF0aWNIYW5kbGVyLCByZXF1ZXN0LCBoYW5kbGVyVXJsLCBsb2FkQ29udGV4dCwgaGFuZGxlRXJyb3IpIHtcbiAgdHJ5IHtcbiAgICBsZXQgaGFuZGxlclJlcXVlc3QgPSBuZXcgUmVxdWVzdChoYW5kbGVyVXJsLCB7XG4gICAgICBtZXRob2Q6IHJlcXVlc3QubWV0aG9kLFxuICAgICAgYm9keTogcmVxdWVzdC5ib2R5LFxuICAgICAgaGVhZGVyczogcmVxdWVzdC5oZWFkZXJzLFxuICAgICAgc2lnbmFsOiByZXF1ZXN0LnNpZ25hbCxcbiAgICAgIC4uLnJlcXVlc3QuYm9keSA/IHsgZHVwbGV4OiBcImhhbGZcIiB9IDogdm9pZCAwXG4gICAgfSk7XG4gICAgbGV0IHJlc3VsdCA9IGF3YWl0IHN0YXRpY0hhbmRsZXIucXVlcnkoaGFuZGxlclJlcXVlc3QsIHtcbiAgICAgIHJlcXVlc3RDb250ZXh0OiBsb2FkQ29udGV4dCxcbiAgICAgIHNraXBMb2FkZXJFcnJvckJ1YmJsaW5nOiB0cnVlLFxuICAgICAgc2tpcFJldmFsaWRhdGlvbjogdHJ1ZSxcbiAgICAgIGdlbmVyYXRlTWlkZGxld2FyZVJlc3BvbnNlOiBidWlsZC5mdXR1cmUudjhfbWlkZGxld2FyZSA/IGFzeW5jIChxdWVyeSkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGxldCBpbm5lclJlc3VsdCA9IGF3YWl0IHF1ZXJ5KGhhbmRsZXJSZXF1ZXN0KTtcbiAgICAgICAgICByZXR1cm4gaGFuZGxlUXVlcnlSZXN1bHQoaW5uZXJSZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHJldHVybiBoYW5kbGVRdWVyeUVycm9yKGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSA6IHZvaWQgMFxuICAgIH0pO1xuICAgIHJldHVybiBoYW5kbGVRdWVyeVJlc3VsdChyZXN1bHQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVRdWVyeUVycm9yKGVycm9yKTtcbiAgfVxuICBmdW5jdGlvbiBoYW5kbGVRdWVyeVJlc3VsdChyZXN1bHQpIHtcbiAgICByZXR1cm4gaXNSZXNwb25zZShyZXN1bHQpID8gcmVzdWx0IDogc3RhdGljQ29udGV4dFRvUmVzcG9uc2UocmVzdWx0KTtcbiAgfVxuICBmdW5jdGlvbiBoYW5kbGVRdWVyeUVycm9yKGVycm9yKSB7XG4gICAgaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgIHJldHVybiBnZW5lcmF0ZVNpbmdsZUZldGNoUmVzcG9uc2UocmVxdWVzdCwgYnVpbGQsIHNlcnZlck1vZGUsIHtcbiAgICAgIHJlc3VsdDogeyBlcnJvciB9LFxuICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnMoKSxcbiAgICAgIHN0YXR1czogNTAwXG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gc3RhdGljQ29udGV4dFRvUmVzcG9uc2UoY29udGV4dCkge1xuICAgIGxldCBoZWFkZXJzID0gZ2V0RG9jdW1lbnRIZWFkZXJzKGNvbnRleHQsIGJ1aWxkKTtcbiAgICBpZiAoaXNSZWRpcmVjdFN0YXR1c0NvZGUoY29udGV4dC5zdGF0dXNDb2RlKSAmJiBoZWFkZXJzLmhhcyhcIkxvY2F0aW9uXCIpKSB7XG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHsgc3RhdHVzOiBjb250ZXh0LnN0YXR1c0NvZGUsIGhlYWRlcnMgfSk7XG4gICAgfVxuICAgIGlmIChjb250ZXh0LmVycm9ycykge1xuICAgICAgT2JqZWN0LnZhbHVlcyhjb250ZXh0LmVycm9ycykuZm9yRWFjaCgoZXJyKSA9PiB7XG4gICAgICAgIGlmICghaXNSb3V0ZUVycm9yUmVzcG9uc2UoZXJyKSB8fCBlcnIuZXJyb3IpIHtcbiAgICAgICAgICBoYW5kbGVFcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNvbnRleHQuZXJyb3JzID0gc2FuaXRpemVFcnJvcnMoY29udGV4dC5lcnJvcnMsIHNlcnZlck1vZGUpO1xuICAgIH1cbiAgICBsZXQgc2luZ2xlRmV0Y2hSZXN1bHQ7XG4gICAgaWYgKGNvbnRleHQuZXJyb3JzKSB7XG4gICAgICBzaW5nbGVGZXRjaFJlc3VsdCA9IHsgZXJyb3I6IE9iamVjdC52YWx1ZXMoY29udGV4dC5lcnJvcnMpWzBdIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHNpbmdsZUZldGNoUmVzdWx0ID0ge1xuICAgICAgICBkYXRhOiBPYmplY3QudmFsdWVzKGNvbnRleHQuYWN0aW9uRGF0YSB8fCB7fSlbMF1cbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBnZW5lcmF0ZVNpbmdsZUZldGNoUmVzcG9uc2UocmVxdWVzdCwgYnVpbGQsIHNlcnZlck1vZGUsIHtcbiAgICAgIHJlc3VsdDogc2luZ2xlRmV0Y2hSZXN1bHQsXG4gICAgICBoZWFkZXJzLFxuICAgICAgc3RhdHVzOiBjb250ZXh0LnN0YXR1c0NvZGVcbiAgICB9KTtcbiAgfVxufVxuYXN5bmMgZnVuY3Rpb24gc2luZ2xlRmV0Y2hMb2FkZXJzKGJ1aWxkLCBzZXJ2ZXJNb2RlLCBzdGF0aWNIYW5kbGVyLCByZXF1ZXN0LCBoYW5kbGVyVXJsLCBsb2FkQ29udGV4dCwgaGFuZGxlRXJyb3IpIHtcbiAgbGV0IHJvdXRlc1BhcmFtID0gbmV3IFVSTChyZXF1ZXN0LnVybCkuc2VhcmNoUGFyYW1zLmdldChcIl9yb3V0ZXNcIik7XG4gIGxldCBsb2FkUm91dGVJZHMgPSByb3V0ZXNQYXJhbSA/IG5ldyBTZXQocm91dGVzUGFyYW0uc3BsaXQoXCIsXCIpKSA6IG51bGw7XG4gIHRyeSB7XG4gICAgbGV0IGhhbmRsZXJSZXF1ZXN0ID0gbmV3IFJlcXVlc3QoaGFuZGxlclVybCwge1xuICAgICAgaGVhZGVyczogcmVxdWVzdC5oZWFkZXJzLFxuICAgICAgc2lnbmFsOiByZXF1ZXN0LnNpZ25hbFxuICAgIH0pO1xuICAgIGxldCByZXN1bHQgPSBhd2FpdCBzdGF0aWNIYW5kbGVyLnF1ZXJ5KGhhbmRsZXJSZXF1ZXN0LCB7XG4gICAgICByZXF1ZXN0Q29udGV4dDogbG9hZENvbnRleHQsXG4gICAgICBmaWx0ZXJNYXRjaGVzVG9Mb2FkOiAobSkgPT4gIWxvYWRSb3V0ZUlkcyB8fCBsb2FkUm91dGVJZHMuaGFzKG0ucm91dGUuaWQpLFxuICAgICAgc2tpcExvYWRlckVycm9yQnViYmxpbmc6IHRydWUsXG4gICAgICBnZW5lcmF0ZU1pZGRsZXdhcmVSZXNwb25zZTogYnVpbGQuZnV0dXJlLnY4X21pZGRsZXdhcmUgPyBhc3luYyAocXVlcnkpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsZXQgaW5uZXJSZXN1bHQgPSBhd2FpdCBxdWVyeShoYW5kbGVyUmVxdWVzdCk7XG4gICAgICAgICAgcmV0dXJuIGhhbmRsZVF1ZXJ5UmVzdWx0KGlubmVyUmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4gaGFuZGxlUXVlcnlFcnJvcihlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0gOiB2b2lkIDBcbiAgICB9KTtcbiAgICByZXR1cm4gaGFuZGxlUXVlcnlSZXN1bHQocmVzdWx0KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlUXVlcnlFcnJvcihlcnJvcik7XG4gIH1cbiAgZnVuY3Rpb24gaGFuZGxlUXVlcnlSZXN1bHQocmVzdWx0KSB7XG4gICAgcmV0dXJuIGlzUmVzcG9uc2UocmVzdWx0KSA/IHJlc3VsdCA6IHN0YXRpY0NvbnRleHRUb1Jlc3BvbnNlKHJlc3VsdCk7XG4gIH1cbiAgZnVuY3Rpb24gaGFuZGxlUXVlcnlFcnJvcihlcnJvcikge1xuICAgIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICByZXR1cm4gZ2VuZXJhdGVTaW5nbGVGZXRjaFJlc3BvbnNlKHJlcXVlc3QsIGJ1aWxkLCBzZXJ2ZXJNb2RlLCB7XG4gICAgICByZXN1bHQ6IHsgZXJyb3IgfSxcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKCksXG4gICAgICBzdGF0dXM6IDUwMFxuICAgIH0pO1xuICB9XG4gIGZ1bmN0aW9uIHN0YXRpY0NvbnRleHRUb1Jlc3BvbnNlKGNvbnRleHQpIHtcbiAgICBsZXQgaGVhZGVycyA9IGdldERvY3VtZW50SGVhZGVycyhjb250ZXh0LCBidWlsZCk7XG4gICAgaWYgKGlzUmVkaXJlY3RTdGF0dXNDb2RlKGNvbnRleHQuc3RhdHVzQ29kZSkgJiYgaGVhZGVycy5oYXMoXCJMb2NhdGlvblwiKSkge1xuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7IHN0YXR1czogY29udGV4dC5zdGF0dXNDb2RlLCBoZWFkZXJzIH0pO1xuICAgIH1cbiAgICBpZiAoY29udGV4dC5lcnJvcnMpIHtcbiAgICAgIE9iamVjdC52YWx1ZXMoY29udGV4dC5lcnJvcnMpLmZvckVhY2goKGVycikgPT4ge1xuICAgICAgICBpZiAoIWlzUm91dGVFcnJvclJlc3BvbnNlKGVycikgfHwgZXJyLmVycm9yKSB7XG4gICAgICAgICAgaGFuZGxlRXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBjb250ZXh0LmVycm9ycyA9IHNhbml0aXplRXJyb3JzKGNvbnRleHQuZXJyb3JzLCBzZXJ2ZXJNb2RlKTtcbiAgICB9XG4gICAgbGV0IHJlc3VsdHMgPSB7fTtcbiAgICBsZXQgbG9hZGVkTWF0Y2hlcyA9IG5ldyBTZXQoXG4gICAgICBjb250ZXh0Lm1hdGNoZXMuZmlsdGVyKFxuICAgICAgICAobSkgPT4gbG9hZFJvdXRlSWRzID8gbG9hZFJvdXRlSWRzLmhhcyhtLnJvdXRlLmlkKSA6IG0ucm91dGUubG9hZGVyICE9IG51bGxcbiAgICAgICkubWFwKChtKSA9PiBtLnJvdXRlLmlkKVxuICAgICk7XG4gICAgaWYgKGNvbnRleHQuZXJyb3JzKSB7XG4gICAgICBmb3IgKGxldCBbaWQsIGVycm9yXSBvZiBPYmplY3QuZW50cmllcyhjb250ZXh0LmVycm9ycykpIHtcbiAgICAgICAgcmVzdWx0c1tpZF0gPSB7IGVycm9yIH07XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAobGV0IFtpZCwgZGF0YTJdIG9mIE9iamVjdC5lbnRyaWVzKGNvbnRleHQubG9hZGVyRGF0YSkpIHtcbiAgICAgIGlmICghKGlkIGluIHJlc3VsdHMpICYmIGxvYWRlZE1hdGNoZXMuaGFzKGlkKSkge1xuICAgICAgICByZXN1bHRzW2lkXSA9IHsgZGF0YTogZGF0YTIgfTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGdlbmVyYXRlU2luZ2xlRmV0Y2hSZXNwb25zZShyZXF1ZXN0LCBidWlsZCwgc2VydmVyTW9kZSwge1xuICAgICAgcmVzdWx0OiByZXN1bHRzLFxuICAgICAgaGVhZGVycyxcbiAgICAgIHN0YXR1czogY29udGV4dC5zdGF0dXNDb2RlXG4gICAgfSk7XG4gIH1cbn1cbmZ1bmN0aW9uIGdlbmVyYXRlU2luZ2xlRmV0Y2hSZXNwb25zZShyZXF1ZXN0LCBidWlsZCwgc2VydmVyTW9kZSwge1xuICByZXN1bHQsXG4gIGhlYWRlcnMsXG4gIHN0YXR1c1xufSkge1xuICBsZXQgcmVzdWx0SGVhZGVycyA9IG5ldyBIZWFkZXJzKGhlYWRlcnMpO1xuICByZXN1bHRIZWFkZXJzLnNldChcIlgtUmVtaXgtUmVzcG9uc2VcIiwgXCJ5ZXNcIik7XG4gIGlmIChTRVJWRVJfTk9fQk9EWV9TVEFUVVNfQ09ERVMuaGFzKHN0YXR1cykpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHsgc3RhdHVzLCBoZWFkZXJzOiByZXN1bHRIZWFkZXJzIH0pO1xuICB9XG4gIHJlc3VsdEhlYWRlcnMuc2V0KFwiQ29udGVudC1UeXBlXCIsIFwidGV4dC94LXNjcmlwdFwiKTtcbiAgcmVzdWx0SGVhZGVycy5kZWxldGUoXCJDb250ZW50LUxlbmd0aFwiKTtcbiAgcmV0dXJuIG5ldyBSZXNwb25zZShcbiAgICBlbmNvZGVWaWFUdXJib1N0cmVhbShcbiAgICAgIHJlc3VsdCxcbiAgICAgIHJlcXVlc3Quc2lnbmFsLFxuICAgICAgYnVpbGQuZW50cnkubW9kdWxlLnN0cmVhbVRpbWVvdXQsXG4gICAgICBzZXJ2ZXJNb2RlXG4gICAgKSxcbiAgICB7XG4gICAgICBzdGF0dXM6IHN0YXR1cyB8fCAyMDAsXG4gICAgICBoZWFkZXJzOiByZXN1bHRIZWFkZXJzXG4gICAgfVxuICApO1xufVxuZnVuY3Rpb24gZ2VuZXJhdGVTaW5nbGVGZXRjaFJlZGlyZWN0UmVzcG9uc2UocmVkaXJlY3RSZXNwb25zZSwgcmVxdWVzdCwgYnVpbGQsIHNlcnZlck1vZGUpIHtcbiAgbGV0IHJlZGlyZWN0MiA9IGdldFNpbmdsZUZldGNoUmVkaXJlY3QoXG4gICAgcmVkaXJlY3RSZXNwb25zZS5zdGF0dXMsXG4gICAgcmVkaXJlY3RSZXNwb25zZS5oZWFkZXJzLFxuICAgIGJ1aWxkLmJhc2VuYW1lXG4gICk7XG4gIGxldCBoZWFkZXJzID0gbmV3IEhlYWRlcnMocmVkaXJlY3RSZXNwb25zZS5oZWFkZXJzKTtcbiAgaGVhZGVycy5kZWxldGUoXCJMb2NhdGlvblwiKTtcbiAgaGVhZGVycy5zZXQoXCJDb250ZW50LVR5cGVcIiwgXCJ0ZXh0L3gtc2NyaXB0XCIpO1xuICByZXR1cm4gZ2VuZXJhdGVTaW5nbGVGZXRjaFJlc3BvbnNlKHJlcXVlc3QsIGJ1aWxkLCBzZXJ2ZXJNb2RlLCB7XG4gICAgcmVzdWx0OiByZXF1ZXN0Lm1ldGhvZCA9PT0gXCJHRVRcIiA/IHsgW1NpbmdsZUZldGNoUmVkaXJlY3RTeW1ib2xdOiByZWRpcmVjdDIgfSA6IHJlZGlyZWN0MixcbiAgICBoZWFkZXJzLFxuICAgIHN0YXR1czogU0lOR0xFX0ZFVENIX1JFRElSRUNUX1NUQVRVU1xuICB9KTtcbn1cbmZ1bmN0aW9uIGdldFNpbmdsZUZldGNoUmVkaXJlY3Qoc3RhdHVzLCBoZWFkZXJzLCBiYXNlbmFtZSkge1xuICBsZXQgcmVkaXJlY3QyID0gaGVhZGVycy5nZXQoXCJMb2NhdGlvblwiKTtcbiAgaWYgKGJhc2VuYW1lKSB7XG4gICAgcmVkaXJlY3QyID0gc3RyaXBCYXNlbmFtZShyZWRpcmVjdDIsIGJhc2VuYW1lKSB8fCByZWRpcmVjdDI7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICByZWRpcmVjdDogcmVkaXJlY3QyLFxuICAgIHN0YXR1cyxcbiAgICByZXZhbGlkYXRlOiAoXG4gICAgICAvLyBUZWNobmljYWxseSBYLVJlbWl4LVJldmFsaWRhdGUgaXNuJ3QgbmVlZGVkIGhlcmUgLSB0aGF0IHdhcyBhbiBpbXBsZW1lbnRhdGlvblxuICAgICAgLy8gZGV0YWlsIG9mID9fZGF0YSByZXF1ZXN0cyBhcyBvdXIgd2F5IHRvIHRlbGwgdGhlIGZyb250IGVuZCB0byByZXZhbGlkYXRlIHdoZW5cbiAgICAgIC8vIHdlIGRpZG4ndCBoYXZlIGEgcmVzcG9uc2UgYm9keSB0byBpbmNsdWRlIHRoYXQgaW5mb3JtYXRpb24gaW4uXG4gICAgICAvLyBXaXRoIHNpbmdsZSBmZXRjaCwgd2UgdGVsbCB0aGUgZnJvbnQgZW5kIHZpYSB0aGlzIHJldmFsaWRhdGUgYm9vbGVhbiBmaWVsZC5cbiAgICAgIC8vIEhvd2V2ZXIsIHdlJ3JlIHJlc3BlY3RpbmcgaXQgZm9yIG5vdyBiZWNhdXNlIGl0IG1heSBiZSBzb21ldGhpbmcgZm9sa3MgaGF2ZVxuICAgICAgLy8gdXNlZCBpbiB0aGVpciBvd24gcmVzcG9uc2VzXG4gICAgICAvLyBUT0RPKHYzKTogQ29uc2lkZXIgcmVtb3Zpbmcgb3IgbWFraW5nIHRoaXMgb2ZmaWNpYWwgcHVibGljIEFQSVxuICAgICAgaGVhZGVycy5oYXMoXCJYLVJlbWl4LVJldmFsaWRhdGVcIikgfHwgaGVhZGVycy5oYXMoXCJTZXQtQ29va2llXCIpXG4gICAgKSxcbiAgICByZWxvYWQ6IGhlYWRlcnMuaGFzKFwiWC1SZW1peC1SZWxvYWQtRG9jdW1lbnRcIiksXG4gICAgcmVwbGFjZTogaGVhZGVycy5oYXMoXCJYLVJlbWl4LVJlcGxhY2VcIilcbiAgfTtcbn1cbmZ1bmN0aW9uIGVuY29kZVZpYVR1cmJvU3RyZWFtKGRhdGEyLCByZXF1ZXN0U2lnbmFsLCBzdHJlYW1UaW1lb3V0LCBzZXJ2ZXJNb2RlKSB7XG4gIGxldCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICBsZXQgdGltZW91dElkID0gc2V0VGltZW91dChcbiAgICAoKSA9PiBjb250cm9sbGVyLmFib3J0KG5ldyBFcnJvcihcIlNlcnZlciBUaW1lb3V0XCIpKSxcbiAgICB0eXBlb2Ygc3RyZWFtVGltZW91dCA9PT0gXCJudW1iZXJcIiA/IHN0cmVhbVRpbWVvdXQgOiA0OTUwXG4gICk7XG4gIHJlcXVlc3RTaWduYWwuYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsICgpID0+IGNsZWFyVGltZW91dCh0aW1lb3V0SWQpKTtcbiAgcmV0dXJuIGVuY29kZShkYXRhMiwge1xuICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgcGx1Z2luczogW1xuICAgICAgKHZhbHVlKSA9PiB7XG4gICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgbGV0IHsgbmFtZSwgbWVzc2FnZSwgc3RhY2sgfSA9IHNlcnZlck1vZGUgPT09IFwicHJvZHVjdGlvblwiIC8qIFByb2R1Y3Rpb24gKi8gPyBzYW5pdGl6ZUVycm9yKHZhbHVlLCBzZXJ2ZXJNb2RlKSA6IHZhbHVlO1xuICAgICAgICAgIHJldHVybiBbXCJTYW5pdGl6ZWRFcnJvclwiLCBuYW1lLCBtZXNzYWdlLCBzdGFja107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRXJyb3JSZXNwb25zZUltcGwpIHtcbiAgICAgICAgICBsZXQgeyBkYXRhOiBkYXRhMywgc3RhdHVzLCBzdGF0dXNUZXh0IH0gPSB2YWx1ZTtcbiAgICAgICAgICByZXR1cm4gW1wiRXJyb3JSZXNwb25zZVwiLCBkYXRhMywgc3RhdHVzLCBzdGF0dXNUZXh0XTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIFNpbmdsZUZldGNoUmVkaXJlY3RTeW1ib2wgaW4gdmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gW1wiU2luZ2xlRmV0Y2hSZWRpcmVjdFwiLCB2YWx1ZVtTaW5nbGVGZXRjaFJlZGlyZWN0U3ltYm9sXV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdLFxuICAgIHBvc3RQbHVnaW5zOiBbXG4gICAgICAodmFsdWUpID0+IHtcbiAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcIm9iamVjdFwiKSByZXR1cm47XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgXCJTaW5nbGVGZXRjaENsYXNzSW5zdGFuY2VcIixcbiAgICAgICAgICBPYmplY3QuZnJvbUVudHJpZXMoT2JqZWN0LmVudHJpZXModmFsdWUpKVxuICAgICAgICBdO1xuICAgICAgfSxcbiAgICAgICgpID0+IFtcIlNpbmdsZUZldGNoRmFsbGJhY2tcIl1cbiAgICBdXG4gIH0pO1xufVxuXG4vLyBsaWIvc2VydmVyLXJ1bnRpbWUvc2VydmVyLnRzXG5mdW5jdGlvbiBkZXJpdmUoYnVpbGQsIG1vZGUpIHtcbiAgbGV0IHJvdXRlcyA9IGNyZWF0ZVJvdXRlcyhidWlsZC5yb3V0ZXMpO1xuICBsZXQgZGF0YVJvdXRlcyA9IGNyZWF0ZVN0YXRpY0hhbmRsZXJEYXRhUm91dGVzKGJ1aWxkLnJvdXRlcywgYnVpbGQuZnV0dXJlKTtcbiAgbGV0IHNlcnZlck1vZGUgPSBpc1NlcnZlck1vZGUobW9kZSkgPyBtb2RlIDogXCJwcm9kdWN0aW9uXCIgLyogUHJvZHVjdGlvbiAqLztcbiAgbGV0IHN0YXRpY0hhbmRsZXIgPSBjcmVhdGVTdGF0aWNIYW5kbGVyKGRhdGFSb3V0ZXMsIHtcbiAgICBiYXNlbmFtZTogYnVpbGQuYmFzZW5hbWUsXG4gICAgdW5zdGFibGVfaW5zdHJ1bWVudGF0aW9uczogYnVpbGQuZW50cnkubW9kdWxlLnVuc3RhYmxlX2luc3RydW1lbnRhdGlvbnNcbiAgfSk7XG4gIGxldCBlcnJvckhhbmRsZXIgPSBidWlsZC5lbnRyeS5tb2R1bGUuaGFuZGxlRXJyb3IgfHwgKChlcnJvciwgeyByZXF1ZXN0IH0pID0+IHtcbiAgICBpZiAoc2VydmVyTW9kZSAhPT0gXCJ0ZXN0XCIgLyogVGVzdCAqLyAmJiAhcmVxdWVzdC5zaWduYWwuYWJvcnRlZCkge1xuICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUaGlzIGlzIFwicHJpdmF0ZVwiIGZyb20gdXNlcnMgYnV0IGludGVuZGVkIGZvciBpbnRlcm5hbCB1c2VcbiAgICAgICAgaXNSb3V0ZUVycm9yUmVzcG9uc2UoZXJyb3IpICYmIGVycm9yLmVycm9yID8gZXJyb3IuZXJyb3IgOiBlcnJvclxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuICBsZXQgcmVxdWVzdEhhbmRsZXIgPSBhc3luYyAocmVxdWVzdCwgaW5pdGlhbENvbnRleHQpID0+IHtcbiAgICBsZXQgcGFyYW1zID0ge307XG4gICAgbGV0IGxvYWRDb250ZXh0O1xuICAgIGxldCBoYW5kbGVFcnJvciA9IChlcnJvcikgPT4ge1xuICAgICAgaWYgKG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAvKiBEZXZlbG9wbWVudCAqLykge1xuICAgICAgICBnZXREZXZTZXJ2ZXJIb29rcygpPy5wcm9jZXNzUmVxdWVzdEVycm9yPy4oZXJyb3IpO1xuICAgICAgfVxuICAgICAgZXJyb3JIYW5kbGVyKGVycm9yLCB7XG4gICAgICAgIGNvbnRleHQ6IGxvYWRDb250ZXh0LFxuICAgICAgICBwYXJhbXMsXG4gICAgICAgIHJlcXVlc3RcbiAgICAgIH0pO1xuICAgIH07XG4gICAgaWYgKGJ1aWxkLmZ1dHVyZS52OF9taWRkbGV3YXJlKSB7XG4gICAgICBpZiAoaW5pdGlhbENvbnRleHQgJiYgIShpbml0aWFsQ29udGV4dCBpbnN0YW5jZW9mIFJvdXRlckNvbnRleHRQcm92aWRlcikpIHtcbiAgICAgICAgbGV0IGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAgIFwiSW52YWxpZCBgY29udGV4dGAgdmFsdWUgcHJvdmlkZWQgdG8gYGhhbmRsZVJlcXVlc3RgLiBXaGVuIG1pZGRsZXdhcmUgaXMgZW5hYmxlZCB5b3UgbXVzdCByZXR1cm4gYW4gaW5zdGFuY2Ugb2YgYFJvdXRlckNvbnRleHRQcm92aWRlcmAgZnJvbSB5b3VyIGBnZXRMb2FkQ29udGV4dGAgZnVuY3Rpb24uXCJcbiAgICAgICAgKTtcbiAgICAgICAgaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgICByZXR1cm4gcmV0dXJuTGFzdFJlc29ydEVycm9yUmVzcG9uc2UoZXJyb3IsIHNlcnZlck1vZGUpO1xuICAgICAgfVxuICAgICAgbG9hZENvbnRleHQgPSBpbml0aWFsQ29udGV4dCB8fCBuZXcgUm91dGVyQ29udGV4dFByb3ZpZGVyKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvYWRDb250ZXh0ID0gaW5pdGlhbENvbnRleHQgfHwge307XG4gICAgfVxuICAgIGxldCB1cmwgPSBuZXcgVVJMKHJlcXVlc3QudXJsKTtcbiAgICBsZXQgbm9ybWFsaXplZEJhc2VuYW1lID0gYnVpbGQuYmFzZW5hbWUgfHwgXCIvXCI7XG4gICAgbGV0IG5vcm1hbGl6ZWRQYXRoID0gdXJsLnBhdGhuYW1lO1xuICAgIGlmIChzdHJpcEJhc2VuYW1lKG5vcm1hbGl6ZWRQYXRoLCBub3JtYWxpemVkQmFzZW5hbWUpID09PSBcIi9fcm9vdC5kYXRhXCIpIHtcbiAgICAgIG5vcm1hbGl6ZWRQYXRoID0gbm9ybWFsaXplZEJhc2VuYW1lO1xuICAgIH0gZWxzZSBpZiAobm9ybWFsaXplZFBhdGguZW5kc1dpdGgoXCIuZGF0YVwiKSkge1xuICAgICAgbm9ybWFsaXplZFBhdGggPSBub3JtYWxpemVkUGF0aC5yZXBsYWNlKC9cXC5kYXRhJC8sIFwiXCIpO1xuICAgIH1cbiAgICBpZiAoc3RyaXBCYXNlbmFtZShub3JtYWxpemVkUGF0aCwgbm9ybWFsaXplZEJhc2VuYW1lKSAhPT0gXCIvXCIgJiYgbm9ybWFsaXplZFBhdGguZW5kc1dpdGgoXCIvXCIpKSB7XG4gICAgICBub3JtYWxpemVkUGF0aCA9IG5vcm1hbGl6ZWRQYXRoLnNsaWNlKDAsIC0xKTtcbiAgICB9XG4gICAgbGV0IGlzU3BhTW9kZSA9IGdldEJ1aWxkVGltZUhlYWRlcihyZXF1ZXN0LCBcIlgtUmVhY3QtUm91dGVyLVNQQS1Nb2RlXCIpID09PSBcInllc1wiO1xuICAgIGlmICghYnVpbGQuc3NyKSB7XG4gICAgICBsZXQgZGVjb2RlZFBhdGggPSBkZWNvZGVVUkkobm9ybWFsaXplZFBhdGgpO1xuICAgICAgaWYgKG5vcm1hbGl6ZWRCYXNlbmFtZSAhPT0gXCIvXCIpIHtcbiAgICAgICAgbGV0IHN0cmlwcGVkUGF0aCA9IHN0cmlwQmFzZW5hbWUoZGVjb2RlZFBhdGgsIG5vcm1hbGl6ZWRCYXNlbmFtZSk7XG4gICAgICAgIGlmIChzdHJpcHBlZFBhdGggPT0gbnVsbCkge1xuICAgICAgICAgIGVycm9ySGFuZGxlcihcbiAgICAgICAgICAgIG5ldyBFcnJvclJlc3BvbnNlSW1wbChcbiAgICAgICAgICAgICAgNDA0LFxuICAgICAgICAgICAgICBcIk5vdCBGb3VuZFwiLFxuICAgICAgICAgICAgICBgUmVmdXNpbmcgdG8gcHJlcmVuZGVyIHRoZSBcXGAke2RlY29kZWRQYXRofVxcYCBwYXRoIGJlY2F1c2UgaXQgZG9lcyBub3Qgc3RhcnQgd2l0aCB0aGUgYmFzZW5hbWUgXFxgJHtub3JtYWxpemVkQmFzZW5hbWV9XFxgYFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29udGV4dDogbG9hZENvbnRleHQsXG4gICAgICAgICAgICAgIHBhcmFtcyxcbiAgICAgICAgICAgICAgcmVxdWVzdFxuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShcIk5vdCBGb3VuZFwiLCB7XG4gICAgICAgICAgICBzdGF0dXM6IDQwNCxcbiAgICAgICAgICAgIHN0YXR1c1RleHQ6IFwiTm90IEZvdW5kXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBkZWNvZGVkUGF0aCA9IHN0cmlwcGVkUGF0aDtcbiAgICAgIH1cbiAgICAgIGlmIChidWlsZC5wcmVyZW5kZXIubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGlzU3BhTW9kZSA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKCFidWlsZC5wcmVyZW5kZXIuaW5jbHVkZXMoZGVjb2RlZFBhdGgpICYmICFidWlsZC5wcmVyZW5kZXIuaW5jbHVkZXMoZGVjb2RlZFBhdGggKyBcIi9cIikpIHtcbiAgICAgICAgaWYgKHVybC5wYXRobmFtZS5lbmRzV2l0aChcIi5kYXRhXCIpKSB7XG4gICAgICAgICAgZXJyb3JIYW5kbGVyKFxuICAgICAgICAgICAgbmV3IEVycm9yUmVzcG9uc2VJbXBsKFxuICAgICAgICAgICAgICA0MDQsXG4gICAgICAgICAgICAgIFwiTm90IEZvdW5kXCIsXG4gICAgICAgICAgICAgIGBSZWZ1c2luZyB0byBTU1IgdGhlIHBhdGggXFxgJHtkZWNvZGVkUGF0aH1cXGAgYmVjYXVzZSBcXGBzc3I6ZmFsc2VcXGAgaXMgc2V0IGFuZCB0aGUgcGF0aCBpcyBub3QgaW5jbHVkZWQgaW4gdGhlIFxcYHByZXJlbmRlclxcYCBjb25maWcsIHNvIGluIHByb2R1Y3Rpb24gdGhlIHBhdGggd2lsbCBiZSBhIDQwNC5gXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb250ZXh0OiBsb2FkQ29udGV4dCxcbiAgICAgICAgICAgICAgcGFyYW1zLFxuICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFwiTm90IEZvdW5kXCIsIHtcbiAgICAgICAgICAgIHN0YXR1czogNDA0LFxuICAgICAgICAgICAgc3RhdHVzVGV4dDogXCJOb3QgRm91bmRcIlxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlzU3BhTW9kZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgbGV0IG1hbmlmZXN0VXJsID0gZ2V0TWFuaWZlc3RQYXRoKFxuICAgICAgYnVpbGQucm91dGVEaXNjb3ZlcnkubWFuaWZlc3RQYXRoLFxuICAgICAgbm9ybWFsaXplZEJhc2VuYW1lXG4gICAgKTtcbiAgICBpZiAodXJsLnBhdGhuYW1lID09PSBtYW5pZmVzdFVybCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGV0IHJlcyA9IGF3YWl0IGhhbmRsZU1hbmlmZXN0UmVxdWVzdChidWlsZCwgcm91dGVzLCB1cmwpO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBoYW5kbGVFcnJvcihlKTtcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShcIlVua25vd24gU2VydmVyIEVycm9yXCIsIHsgc3RhdHVzOiA1MDAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBtYXRjaGVzID0gbWF0Y2hTZXJ2ZXJSb3V0ZXMocm91dGVzLCBub3JtYWxpemVkUGF0aCwgYnVpbGQuYmFzZW5hbWUpO1xuICAgIGlmIChtYXRjaGVzICYmIG1hdGNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgT2JqZWN0LmFzc2lnbihwYXJhbXMsIG1hdGNoZXNbMF0ucGFyYW1zKTtcbiAgICB9XG4gICAgbGV0IHJlc3BvbnNlO1xuICAgIGlmICh1cmwucGF0aG5hbWUuZW5kc1dpdGgoXCIuZGF0YVwiKSkge1xuICAgICAgbGV0IGhhbmRsZXJVcmwgPSBuZXcgVVJMKHJlcXVlc3QudXJsKTtcbiAgICAgIGhhbmRsZXJVcmwucGF0aG5hbWUgPSBub3JtYWxpemVkUGF0aDtcbiAgICAgIGxldCBzaW5nbGVGZXRjaE1hdGNoZXMgPSBtYXRjaFNlcnZlclJvdXRlcyhcbiAgICAgICAgcm91dGVzLFxuICAgICAgICBoYW5kbGVyVXJsLnBhdGhuYW1lLFxuICAgICAgICBidWlsZC5iYXNlbmFtZVxuICAgICAgKTtcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgaGFuZGxlU2luZ2xlRmV0Y2hSZXF1ZXN0KFxuICAgICAgICBzZXJ2ZXJNb2RlLFxuICAgICAgICBidWlsZCxcbiAgICAgICAgc3RhdGljSGFuZGxlcixcbiAgICAgICAgcmVxdWVzdCxcbiAgICAgICAgaGFuZGxlclVybCxcbiAgICAgICAgbG9hZENvbnRleHQsXG4gICAgICAgIGhhbmRsZUVycm9yXG4gICAgICApO1xuICAgICAgaWYgKGlzUmVkaXJlY3RSZXNwb25zZShyZXNwb25zZSkpIHtcbiAgICAgICAgcmVzcG9uc2UgPSBnZW5lcmF0ZVNpbmdsZUZldGNoUmVkaXJlY3RSZXNwb25zZShcbiAgICAgICAgICByZXNwb25zZSxcbiAgICAgICAgICByZXF1ZXN0LFxuICAgICAgICAgIGJ1aWxkLFxuICAgICAgICAgIHNlcnZlck1vZGVcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlmIChidWlsZC5lbnRyeS5tb2R1bGUuaGFuZGxlRGF0YVJlcXVlc3QpIHtcbiAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBidWlsZC5lbnRyeS5tb2R1bGUuaGFuZGxlRGF0YVJlcXVlc3QocmVzcG9uc2UsIHtcbiAgICAgICAgICBjb250ZXh0OiBsb2FkQ29udGV4dCxcbiAgICAgICAgICBwYXJhbXM6IHNpbmdsZUZldGNoTWF0Y2hlcyA/IHNpbmdsZUZldGNoTWF0Y2hlc1swXS5wYXJhbXMgOiB7fSxcbiAgICAgICAgICByZXF1ZXN0XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaXNSZWRpcmVjdFJlc3BvbnNlKHJlc3BvbnNlKSkge1xuICAgICAgICAgIHJlc3BvbnNlID0gZ2VuZXJhdGVTaW5nbGVGZXRjaFJlZGlyZWN0UmVzcG9uc2UoXG4gICAgICAgICAgICByZXNwb25zZSxcbiAgICAgICAgICAgIHJlcXVlc3QsXG4gICAgICAgICAgICBidWlsZCxcbiAgICAgICAgICAgIHNlcnZlck1vZGVcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghaXNTcGFNb2RlICYmIG1hdGNoZXMgJiYgbWF0Y2hlc1ttYXRjaGVzLmxlbmd0aCAtIDFdLnJvdXRlLm1vZHVsZS5kZWZhdWx0ID09IG51bGwgJiYgbWF0Y2hlc1ttYXRjaGVzLmxlbmd0aCAtIDFdLnJvdXRlLm1vZHVsZS5FcnJvckJvdW5kYXJ5ID09IG51bGwpIHtcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgaGFuZGxlUmVzb3VyY2VSZXF1ZXN0KFxuICAgICAgICBzZXJ2ZXJNb2RlLFxuICAgICAgICBidWlsZCxcbiAgICAgICAgc3RhdGljSGFuZGxlcixcbiAgICAgICAgbWF0Y2hlcy5zbGljZSgtMSlbMF0ucm91dGUuaWQsXG4gICAgICAgIHJlcXVlc3QsXG4gICAgICAgIGxvYWRDb250ZXh0LFxuICAgICAgICBoYW5kbGVFcnJvclxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHsgcGF0aG5hbWUgfSA9IHVybDtcbiAgICAgIGxldCBjcml0aWNhbENzcyA9IHZvaWQgMDtcbiAgICAgIGlmIChidWlsZC51bnN0YWJsZV9nZXRDcml0aWNhbENzcykge1xuICAgICAgICBjcml0aWNhbENzcyA9IGF3YWl0IGJ1aWxkLnVuc3RhYmxlX2dldENyaXRpY2FsQ3NzKHsgcGF0aG5hbWUgfSk7XG4gICAgICB9IGVsc2UgaWYgKG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAvKiBEZXZlbG9wbWVudCAqLyAmJiBnZXREZXZTZXJ2ZXJIb29rcygpPy5nZXRDcml0aWNhbENzcykge1xuICAgICAgICBjcml0aWNhbENzcyA9IGF3YWl0IGdldERldlNlcnZlckhvb2tzKCk/LmdldENyaXRpY2FsQ3NzPy4ocGF0aG5hbWUpO1xuICAgICAgfVxuICAgICAgcmVzcG9uc2UgPSBhd2FpdCBoYW5kbGVEb2N1bWVudFJlcXVlc3QoXG4gICAgICAgIHNlcnZlck1vZGUsXG4gICAgICAgIGJ1aWxkLFxuICAgICAgICBzdGF0aWNIYW5kbGVyLFxuICAgICAgICByZXF1ZXN0LFxuICAgICAgICBsb2FkQ29udGV4dCxcbiAgICAgICAgaGFuZGxlRXJyb3IsXG4gICAgICAgIGlzU3BhTW9kZSxcbiAgICAgICAgY3JpdGljYWxDc3NcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChyZXF1ZXN0Lm1ldGhvZCA9PT0gXCJIRUFEXCIpIHtcbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwge1xuICAgICAgICBoZWFkZXJzOiByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVzcG9uc2Uuc3RhdHVzVGV4dFxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfTtcbiAgaWYgKGJ1aWxkLmVudHJ5Lm1vZHVsZS51bnN0YWJsZV9pbnN0cnVtZW50YXRpb25zKSB7XG4gICAgcmVxdWVzdEhhbmRsZXIgPSBpbnN0cnVtZW50SGFuZGxlcihcbiAgICAgIHJlcXVlc3RIYW5kbGVyLFxuICAgICAgYnVpbGQuZW50cnkubW9kdWxlLnVuc3RhYmxlX2luc3RydW1lbnRhdGlvbnMubWFwKChpKSA9PiBpLmhhbmRsZXIpLmZpbHRlcihCb29sZWFuKVxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICByb3V0ZXMsXG4gICAgZGF0YVJvdXRlcyxcbiAgICBzZXJ2ZXJNb2RlLFxuICAgIHN0YXRpY0hhbmRsZXIsXG4gICAgZXJyb3JIYW5kbGVyLFxuICAgIHJlcXVlc3RIYW5kbGVyXG4gIH07XG59XG52YXIgY3JlYXRlUmVxdWVzdEhhbmRsZXIgPSAoYnVpbGQsIG1vZGUpID0+IHtcbiAgbGV0IF9idWlsZDtcbiAgbGV0IHJvdXRlcztcbiAgbGV0IHNlcnZlck1vZGU7XG4gIGxldCBzdGF0aWNIYW5kbGVyO1xuICBsZXQgZXJyb3JIYW5kbGVyO1xuICBsZXQgX3JlcXVlc3RIYW5kbGVyO1xuICByZXR1cm4gYXN5bmMgZnVuY3Rpb24gcmVxdWVzdEhhbmRsZXIocmVxdWVzdCwgaW5pdGlhbENvbnRleHQpIHtcbiAgICBfYnVpbGQgPSB0eXBlb2YgYnVpbGQgPT09IFwiZnVuY3Rpb25cIiA/IGF3YWl0IGJ1aWxkKCkgOiBidWlsZDtcbiAgICBpZiAodHlwZW9mIGJ1aWxkID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGxldCBkZXJpdmVkID0gZGVyaXZlKF9idWlsZCwgbW9kZSk7XG4gICAgICByb3V0ZXMgPSBkZXJpdmVkLnJvdXRlcztcbiAgICAgIHNlcnZlck1vZGUgPSBkZXJpdmVkLnNlcnZlck1vZGU7XG4gICAgICBzdGF0aWNIYW5kbGVyID0gZGVyaXZlZC5zdGF0aWNIYW5kbGVyO1xuICAgICAgZXJyb3JIYW5kbGVyID0gZGVyaXZlZC5lcnJvckhhbmRsZXI7XG4gICAgICBfcmVxdWVzdEhhbmRsZXIgPSBkZXJpdmVkLnJlcXVlc3RIYW5kbGVyO1xuICAgIH0gZWxzZSBpZiAoIXJvdXRlcyB8fCAhc2VydmVyTW9kZSB8fCAhc3RhdGljSGFuZGxlciB8fCAhZXJyb3JIYW5kbGVyIHx8ICFfcmVxdWVzdEhhbmRsZXIpIHtcbiAgICAgIGxldCBkZXJpdmVkID0gZGVyaXZlKF9idWlsZCwgbW9kZSk7XG4gICAgICByb3V0ZXMgPSBkZXJpdmVkLnJvdXRlcztcbiAgICAgIHNlcnZlck1vZGUgPSBkZXJpdmVkLnNlcnZlck1vZGU7XG4gICAgICBzdGF0aWNIYW5kbGVyID0gZGVyaXZlZC5zdGF0aWNIYW5kbGVyO1xuICAgICAgZXJyb3JIYW5kbGVyID0gZGVyaXZlZC5lcnJvckhhbmRsZXI7XG4gICAgICBfcmVxdWVzdEhhbmRsZXIgPSBkZXJpdmVkLnJlcXVlc3RIYW5kbGVyO1xuICAgIH1cbiAgICByZXR1cm4gX3JlcXVlc3RIYW5kbGVyKHJlcXVlc3QsIGluaXRpYWxDb250ZXh0KTtcbiAgfTtcbn07XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVNYW5pZmVzdFJlcXVlc3QoYnVpbGQsIHJvdXRlcywgdXJsKSB7XG4gIGlmIChidWlsZC5hc3NldHMudmVyc2lvbiAhPT0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoXCJ2ZXJzaW9uXCIpKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7XG4gICAgICBzdGF0dXM6IDIwNCxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgXCJYLVJlbWl4LVJlbG9hZC1Eb2N1bWVudFwiOiBcInRydWVcIlxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGxldCBwYXRjaGVzID0ge307XG4gIGlmICh1cmwuc2VhcmNoUGFyYW1zLmhhcyhcInBhdGhzXCIpKSB7XG4gICAgbGV0IHBhdGhzID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTtcbiAgICBsZXQgcGF0aFBhcmFtID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoXCJwYXRoc1wiKSB8fCBcIlwiO1xuICAgIGxldCByZXF1ZXN0ZWRQYXRocyA9IHBhdGhQYXJhbS5zcGxpdChcIixcIikuZmlsdGVyKEJvb2xlYW4pO1xuICAgIHJlcXVlc3RlZFBhdGhzLmZvckVhY2goKHBhdGgpID0+IHtcbiAgICAgIGlmICghcGF0aC5zdGFydHNXaXRoKFwiL1wiKSkge1xuICAgICAgICBwYXRoID0gYC8ke3BhdGh9YDtcbiAgICAgIH1cbiAgICAgIGxldCBzZWdtZW50cyA9IHBhdGguc3BsaXQoXCIvXCIpLnNsaWNlKDEpO1xuICAgICAgc2VnbWVudHMuZm9yRWFjaCgoXywgaSkgPT4ge1xuICAgICAgICBsZXQgcGFydGlhbFBhdGggPSBzZWdtZW50cy5zbGljZSgwLCBpICsgMSkuam9pbihcIi9cIik7XG4gICAgICAgIHBhdGhzLmFkZChgLyR7cGFydGlhbFBhdGh9YCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBmb3IgKGxldCBwYXRoIG9mIHBhdGhzKSB7XG4gICAgICBsZXQgbWF0Y2hlcyA9IG1hdGNoU2VydmVyUm91dGVzKHJvdXRlcywgcGF0aCwgYnVpbGQuYmFzZW5hbWUpO1xuICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgZm9yIChsZXQgbWF0Y2ggb2YgbWF0Y2hlcykge1xuICAgICAgICAgIGxldCByb3V0ZUlkID0gbWF0Y2gucm91dGUuaWQ7XG4gICAgICAgICAgbGV0IHJvdXRlID0gYnVpbGQuYXNzZXRzLnJvdXRlc1tyb3V0ZUlkXTtcbiAgICAgICAgICBpZiAocm91dGUpIHtcbiAgICAgICAgICAgIHBhdGNoZXNbcm91dGVJZF0gPSByb3V0ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFJlc3BvbnNlLmpzb24ocGF0Y2hlcywge1xuICAgICAgaGVhZGVyczoge1xuICAgICAgICBcIkNhY2hlLUNvbnRyb2xcIjogXCJwdWJsaWMsIG1heC1hZ2U9MzE1MzYwMDAsIGltbXV0YWJsZVwiXG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIG5ldyBSZXNwb25zZShcIkludmFsaWQgUmVxdWVzdFwiLCB7IHN0YXR1czogNDAwIH0pO1xufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2luZ2xlRmV0Y2hSZXF1ZXN0KHNlcnZlck1vZGUsIGJ1aWxkLCBzdGF0aWNIYW5kbGVyLCByZXF1ZXN0LCBoYW5kbGVyVXJsLCBsb2FkQ29udGV4dCwgaGFuZGxlRXJyb3IpIHtcbiAgbGV0IHJlc3BvbnNlID0gcmVxdWVzdC5tZXRob2QgIT09IFwiR0VUXCIgPyBhd2FpdCBzaW5nbGVGZXRjaEFjdGlvbihcbiAgICBidWlsZCxcbiAgICBzZXJ2ZXJNb2RlLFxuICAgIHN0YXRpY0hhbmRsZXIsXG4gICAgcmVxdWVzdCxcbiAgICBoYW5kbGVyVXJsLFxuICAgIGxvYWRDb250ZXh0LFxuICAgIGhhbmRsZUVycm9yXG4gICkgOiBhd2FpdCBzaW5nbGVGZXRjaExvYWRlcnMoXG4gICAgYnVpbGQsXG4gICAgc2VydmVyTW9kZSxcbiAgICBzdGF0aWNIYW5kbGVyLFxuICAgIHJlcXVlc3QsXG4gICAgaGFuZGxlclVybCxcbiAgICBsb2FkQ29udGV4dCxcbiAgICBoYW5kbGVFcnJvclxuICApO1xuICByZXR1cm4gcmVzcG9uc2U7XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVEb2N1bWVudFJlcXVlc3Qoc2VydmVyTW9kZSwgYnVpbGQsIHN0YXRpY0hhbmRsZXIsIHJlcXVlc3QsIGxvYWRDb250ZXh0LCBoYW5kbGVFcnJvciwgaXNTcGFNb2RlLCBjcml0aWNhbENzcykge1xuICB0cnkge1xuICAgIGxldCByZXN1bHQgPSBhd2FpdCBzdGF0aWNIYW5kbGVyLnF1ZXJ5KHJlcXVlc3QsIHtcbiAgICAgIHJlcXVlc3RDb250ZXh0OiBsb2FkQ29udGV4dCxcbiAgICAgIGdlbmVyYXRlTWlkZGxld2FyZVJlc3BvbnNlOiBidWlsZC5mdXR1cmUudjhfbWlkZGxld2FyZSA/IGFzeW5jIChxdWVyeSkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGxldCBpbm5lclJlc3VsdCA9IGF3YWl0IHF1ZXJ5KHJlcXVlc3QpO1xuICAgICAgICAgIGlmICghaXNSZXNwb25zZShpbm5lclJlc3VsdCkpIHtcbiAgICAgICAgICAgIGlubmVyUmVzdWx0ID0gYXdhaXQgcmVuZGVySHRtbChpbm5lclJlc3VsdCwgaXNTcGFNb2RlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGlubmVyUmVzdWx0O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHsgc3RhdHVzOiA1MDAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gOiB2b2lkIDBcbiAgICB9KTtcbiAgICBpZiAoIWlzUmVzcG9uc2UocmVzdWx0KSkge1xuICAgICAgcmVzdWx0ID0gYXdhaXQgcmVuZGVySHRtbChyZXN1bHQsIGlzU3BhTW9kZSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwgeyBzdGF0dXM6IDUwMCB9KTtcbiAgfVxuICBhc3luYyBmdW5jdGlvbiByZW5kZXJIdG1sKGNvbnRleHQsIGlzU3BhTW9kZTIpIHtcbiAgICBsZXQgaGVhZGVycyA9IGdldERvY3VtZW50SGVhZGVycyhjb250ZXh0LCBidWlsZCk7XG4gICAgaWYgKFNFUlZFUl9OT19CT0RZX1NUQVRVU19DT0RFUy5oYXMoY29udGV4dC5zdGF0dXNDb2RlKSkge1xuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7IHN0YXR1czogY29udGV4dC5zdGF0dXNDb2RlLCBoZWFkZXJzIH0pO1xuICAgIH1cbiAgICBpZiAoY29udGV4dC5lcnJvcnMpIHtcbiAgICAgIE9iamVjdC52YWx1ZXMoY29udGV4dC5lcnJvcnMpLmZvckVhY2goKGVycikgPT4ge1xuICAgICAgICBpZiAoIWlzUm91dGVFcnJvclJlc3BvbnNlKGVycikgfHwgZXJyLmVycm9yKSB7XG4gICAgICAgICAgaGFuZGxlRXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBjb250ZXh0LmVycm9ycyA9IHNhbml0aXplRXJyb3JzKGNvbnRleHQuZXJyb3JzLCBzZXJ2ZXJNb2RlKTtcbiAgICB9XG4gICAgbGV0IHN0YXRlID0ge1xuICAgICAgbG9hZGVyRGF0YTogY29udGV4dC5sb2FkZXJEYXRhLFxuICAgICAgYWN0aW9uRGF0YTogY29udGV4dC5hY3Rpb25EYXRhLFxuICAgICAgZXJyb3JzOiBzZXJpYWxpemVFcnJvcnMoY29udGV4dC5lcnJvcnMsIHNlcnZlck1vZGUpXG4gICAgfTtcbiAgICBsZXQgYmFzZVNlcnZlckhhbmRvZmYgPSB7XG4gICAgICBiYXNlbmFtZTogYnVpbGQuYmFzZW5hbWUsXG4gICAgICBmdXR1cmU6IGJ1aWxkLmZ1dHVyZSxcbiAgICAgIHJvdXRlRGlzY292ZXJ5OiBidWlsZC5yb3V0ZURpc2NvdmVyeSxcbiAgICAgIHNzcjogYnVpbGQuc3NyLFxuICAgICAgaXNTcGFNb2RlOiBpc1NwYU1vZGUyXG4gICAgfTtcbiAgICBsZXQgZW50cnlDb250ZXh0ID0ge1xuICAgICAgbWFuaWZlc3Q6IGJ1aWxkLmFzc2V0cyxcbiAgICAgIHJvdXRlTW9kdWxlczogY3JlYXRlRW50cnlSb3V0ZU1vZHVsZXMoYnVpbGQucm91dGVzKSxcbiAgICAgIHN0YXRpY0hhbmRsZXJDb250ZXh0OiBjb250ZXh0LFxuICAgICAgY3JpdGljYWxDc3MsXG4gICAgICBzZXJ2ZXJIYW5kb2ZmU3RyaW5nOiBjcmVhdGVTZXJ2ZXJIYW5kb2ZmU3RyaW5nKHtcbiAgICAgICAgLi4uYmFzZVNlcnZlckhhbmRvZmYsXG4gICAgICAgIGNyaXRpY2FsQ3NzXG4gICAgICB9KSxcbiAgICAgIHNlcnZlckhhbmRvZmZTdHJlYW06IGVuY29kZVZpYVR1cmJvU3RyZWFtKFxuICAgICAgICBzdGF0ZSxcbiAgICAgICAgcmVxdWVzdC5zaWduYWwsXG4gICAgICAgIGJ1aWxkLmVudHJ5Lm1vZHVsZS5zdHJlYW1UaW1lb3V0LFxuICAgICAgICBzZXJ2ZXJNb2RlXG4gICAgICApLFxuICAgICAgcmVuZGVyTWV0YToge30sXG4gICAgICBmdXR1cmU6IGJ1aWxkLmZ1dHVyZSxcbiAgICAgIHNzcjogYnVpbGQuc3NyLFxuICAgICAgcm91dGVEaXNjb3Zlcnk6IGJ1aWxkLnJvdXRlRGlzY292ZXJ5LFxuICAgICAgaXNTcGFNb2RlOiBpc1NwYU1vZGUyLFxuICAgICAgc2VyaWFsaXplRXJyb3I6IChlcnIpID0+IHNlcmlhbGl6ZUVycm9yKGVyciwgc2VydmVyTW9kZSlcbiAgICB9O1xuICAgIGxldCBoYW5kbGVEb2N1bWVudFJlcXVlc3RGdW5jdGlvbiA9IGJ1aWxkLmVudHJ5Lm1vZHVsZS5kZWZhdWx0O1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgaGFuZGxlRG9jdW1lbnRSZXF1ZXN0RnVuY3Rpb24oXG4gICAgICAgIHJlcXVlc3QsXG4gICAgICAgIGNvbnRleHQuc3RhdHVzQ29kZSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgZW50cnlDb250ZXh0LFxuICAgICAgICBsb2FkQ29udGV4dFxuICAgICAgKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgbGV0IGVycm9yRm9yU2Vjb25kUmVuZGVyID0gZXJyb3I7XG4gICAgICBpZiAoaXNSZXNwb25zZShlcnJvcikpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsZXQgZGF0YTIgPSBhd2FpdCB1bndyYXBSZXNwb25zZShlcnJvcik7XG4gICAgICAgICAgZXJyb3JGb3JTZWNvbmRSZW5kZXIgPSBuZXcgRXJyb3JSZXNwb25zZUltcGwoXG4gICAgICAgICAgICBlcnJvci5zdGF0dXMsXG4gICAgICAgICAgICBlcnJvci5zdGF0dXNUZXh0LFxuICAgICAgICAgICAgZGF0YTJcbiAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnRleHQgPSBnZXRTdGF0aWNDb250ZXh0RnJvbUVycm9yKFxuICAgICAgICBzdGF0aWNIYW5kbGVyLmRhdGFSb3V0ZXMsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGVycm9yRm9yU2Vjb25kUmVuZGVyXG4gICAgICApO1xuICAgICAgaWYgKGNvbnRleHQuZXJyb3JzKSB7XG4gICAgICAgIGNvbnRleHQuZXJyb3JzID0gc2FuaXRpemVFcnJvcnMoY29udGV4dC5lcnJvcnMsIHNlcnZlck1vZGUpO1xuICAgICAgfVxuICAgICAgbGV0IHN0YXRlMiA9IHtcbiAgICAgICAgbG9hZGVyRGF0YTogY29udGV4dC5sb2FkZXJEYXRhLFxuICAgICAgICBhY3Rpb25EYXRhOiBjb250ZXh0LmFjdGlvbkRhdGEsXG4gICAgICAgIGVycm9yczogc2VyaWFsaXplRXJyb3JzKGNvbnRleHQuZXJyb3JzLCBzZXJ2ZXJNb2RlKVxuICAgICAgfTtcbiAgICAgIGVudHJ5Q29udGV4dCA9IHtcbiAgICAgICAgLi4uZW50cnlDb250ZXh0LFxuICAgICAgICBzdGF0aWNIYW5kbGVyQ29udGV4dDogY29udGV4dCxcbiAgICAgICAgc2VydmVySGFuZG9mZlN0cmluZzogY3JlYXRlU2VydmVySGFuZG9mZlN0cmluZyhiYXNlU2VydmVySGFuZG9mZiksXG4gICAgICAgIHNlcnZlckhhbmRvZmZTdHJlYW06IGVuY29kZVZpYVR1cmJvU3RyZWFtKFxuICAgICAgICAgIHN0YXRlMixcbiAgICAgICAgICByZXF1ZXN0LnNpZ25hbCxcbiAgICAgICAgICBidWlsZC5lbnRyeS5tb2R1bGUuc3RyZWFtVGltZW91dCxcbiAgICAgICAgICBzZXJ2ZXJNb2RlXG4gICAgICAgICksXG4gICAgICAgIHJlbmRlck1ldGE6IHt9XG4gICAgICB9O1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZURvY3VtZW50UmVxdWVzdEZ1bmN0aW9uKFxuICAgICAgICAgIHJlcXVlc3QsXG4gICAgICAgICAgY29udGV4dC5zdGF0dXNDb2RlLFxuICAgICAgICAgIGhlYWRlcnMsXG4gICAgICAgICAgZW50cnlDb250ZXh0LFxuICAgICAgICAgIGxvYWRDb250ZXh0XG4gICAgICAgICk7XG4gICAgICB9IGNhdGNoIChlcnJvcjIpIHtcbiAgICAgICAgaGFuZGxlRXJyb3IoZXJyb3IyKTtcbiAgICAgICAgcmV0dXJuIHJldHVybkxhc3RSZXNvcnRFcnJvclJlc3BvbnNlKGVycm9yMiwgc2VydmVyTW9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVSZXNvdXJjZVJlcXVlc3Qoc2VydmVyTW9kZSwgYnVpbGQsIHN0YXRpY0hhbmRsZXIsIHJvdXRlSWQsIHJlcXVlc3QsIGxvYWRDb250ZXh0LCBoYW5kbGVFcnJvcikge1xuICB0cnkge1xuICAgIGxldCByZXN1bHQgPSBhd2FpdCBzdGF0aWNIYW5kbGVyLnF1ZXJ5Um91dGUocmVxdWVzdCwge1xuICAgICAgcm91dGVJZCxcbiAgICAgIHJlcXVlc3RDb250ZXh0OiBsb2FkQ29udGV4dCxcbiAgICAgIGdlbmVyYXRlTWlkZGxld2FyZVJlc3BvbnNlOiBidWlsZC5mdXR1cmUudjhfbWlkZGxld2FyZSA/IGFzeW5jIChxdWVyeVJvdXRlKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbGV0IGlubmVyUmVzdWx0ID0gYXdhaXQgcXVlcnlSb3V0ZShyZXF1ZXN0KTtcbiAgICAgICAgICByZXR1cm4gaGFuZGxlUXVlcnlSb3V0ZVJlc3VsdChpbm5lclJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgcmV0dXJuIGhhbmRsZVF1ZXJ5Um91dGVFcnJvcihlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0gOiB2b2lkIDBcbiAgICB9KTtcbiAgICByZXR1cm4gaGFuZGxlUXVlcnlSb3V0ZVJlc3VsdChyZXN1bHQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBoYW5kbGVRdWVyeVJvdXRlRXJyb3IoZXJyb3IpO1xuICB9XG4gIGZ1bmN0aW9uIGhhbmRsZVF1ZXJ5Um91dGVSZXN1bHQocmVzdWx0KSB7XG4gICAgaWYgKGlzUmVzcG9uc2UocmVzdWx0KSkge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiByZXN1bHQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UocmVzdWx0KTtcbiAgICB9XG4gICAgcmV0dXJuIFJlc3BvbnNlLmpzb24ocmVzdWx0KTtcbiAgfVxuICBmdW5jdGlvbiBoYW5kbGVRdWVyeVJvdXRlRXJyb3IoZXJyb3IpIHtcbiAgICBpZiAoaXNSZXNwb25zZShlcnJvcikpIHtcbiAgICAgIHJldHVybiBlcnJvcjtcbiAgICB9XG4gICAgaWYgKGlzUm91dGVFcnJvclJlc3BvbnNlKGVycm9yKSkge1xuICAgICAgaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2VUb0pzb24oZXJyb3IsIHNlcnZlck1vZGUpO1xuICAgIH1cbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnJvci5tZXNzYWdlID09PSBcIkV4cGVjdGVkIGEgcmVzcG9uc2UgZnJvbSBxdWVyeVJvdXRlXCIpIHtcbiAgICAgIGxldCBuZXdFcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgXCJFeHBlY3RlZCBhIFJlc3BvbnNlIHRvIGJlIHJldHVybmVkIGZyb20gcmVzb3VyY2Ugcm91dGUgaGFuZGxlclwiXG4gICAgICApO1xuICAgICAgaGFuZGxlRXJyb3IobmV3RXJyb3IpO1xuICAgICAgcmV0dXJuIHJldHVybkxhc3RSZXNvcnRFcnJvclJlc3BvbnNlKG5ld0Vycm9yLCBzZXJ2ZXJNb2RlKTtcbiAgICB9XG4gICAgaGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgIHJldHVybiByZXR1cm5MYXN0UmVzb3J0RXJyb3JSZXNwb25zZShlcnJvciwgc2VydmVyTW9kZSk7XG4gIH1cbn1cbmZ1bmN0aW9uIGVycm9yUmVzcG9uc2VUb0pzb24oZXJyb3JSZXNwb25zZSwgc2VydmVyTW9kZSkge1xuICByZXR1cm4gUmVzcG9uc2UuanNvbihcbiAgICBzZXJpYWxpemVFcnJvcihcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVGhpcyBpcyBcInByaXZhdGVcIiBmcm9tIHVzZXJzIGJ1dCBpbnRlbmRlZCBmb3IgaW50ZXJuYWwgdXNlXG4gICAgICBlcnJvclJlc3BvbnNlLmVycm9yIHx8IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgU2VydmVyIEVycm9yXCIpLFxuICAgICAgc2VydmVyTW9kZVxuICAgICksXG4gICAge1xuICAgICAgc3RhdHVzOiBlcnJvclJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IGVycm9yUmVzcG9uc2Uuc3RhdHVzVGV4dFxuICAgIH1cbiAgKTtcbn1cbmZ1bmN0aW9uIHJldHVybkxhc3RSZXNvcnRFcnJvclJlc3BvbnNlKGVycm9yLCBzZXJ2ZXJNb2RlKSB7XG4gIGxldCBtZXNzYWdlID0gXCJVbmV4cGVjdGVkIFNlcnZlciBFcnJvclwiO1xuICBpZiAoc2VydmVyTW9kZSAhPT0gXCJwcm9kdWN0aW9uXCIgLyogUHJvZHVjdGlvbiAqLykge1xuICAgIG1lc3NhZ2UgKz0gYFxuXG4ke1N0cmluZyhlcnJvcil9YDtcbiAgfVxuICByZXR1cm4gbmV3IFJlc3BvbnNlKG1lc3NhZ2UsIHtcbiAgICBzdGF0dXM6IDUwMCxcbiAgICBoZWFkZXJzOiB7XG4gICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcInRleHQvcGxhaW5cIlxuICAgIH1cbiAgfSk7XG59XG5mdW5jdGlvbiB1bndyYXBSZXNwb25zZShyZXNwb25zZSkge1xuICBsZXQgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldChcIkNvbnRlbnQtVHlwZVwiKTtcbiAgcmV0dXJuIGNvbnRlbnRUeXBlICYmIC9cXGJhcHBsaWNhdGlvblxcL2pzb25cXGIvLnRlc3QoY29udGVudFR5cGUpID8gcmVzcG9uc2UuYm9keSA9PSBudWxsID8gbnVsbCA6IHJlc3BvbnNlLmpzb24oKSA6IHJlc3BvbnNlLnRleHQoKTtcbn1cblxuLy8gbGliL3NlcnZlci1ydW50aW1lL3Nlc3Npb25zLnRzXG5mdW5jdGlvbiBmbGFzaChuYW1lKSB7XG4gIHJldHVybiBgX19mbGFzaF8ke25hbWV9X19gO1xufVxudmFyIGNyZWF0ZVNlc3Npb24gPSAoaW5pdGlhbERhdGEgPSB7fSwgaWQgPSBcIlwiKSA9PiB7XG4gIGxldCBtYXAgPSBuZXcgTWFwKE9iamVjdC5lbnRyaWVzKGluaXRpYWxEYXRhKSk7XG4gIHJldHVybiB7XG4gICAgZ2V0IGlkKCkge1xuICAgICAgcmV0dXJuIGlkO1xuICAgIH0sXG4gICAgZ2V0IGRhdGEoKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKG1hcCk7XG4gICAgfSxcbiAgICBoYXMobmFtZSkge1xuICAgICAgcmV0dXJuIG1hcC5oYXMobmFtZSkgfHwgbWFwLmhhcyhmbGFzaChuYW1lKSk7XG4gICAgfSxcbiAgICBnZXQobmFtZSkge1xuICAgICAgaWYgKG1hcC5oYXMobmFtZSkpIHJldHVybiBtYXAuZ2V0KG5hbWUpO1xuICAgICAgbGV0IGZsYXNoTmFtZSA9IGZsYXNoKG5hbWUpO1xuICAgICAgaWYgKG1hcC5oYXMoZmxhc2hOYW1lKSkge1xuICAgICAgICBsZXQgdmFsdWUgPSBtYXAuZ2V0KGZsYXNoTmFtZSk7XG4gICAgICAgIG1hcC5kZWxldGUoZmxhc2hOYW1lKTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICB9LFxuICAgIHNldChuYW1lLCB2YWx1ZSkge1xuICAgICAgbWFwLnNldChuYW1lLCB2YWx1ZSk7XG4gICAgfSxcbiAgICBmbGFzaChuYW1lLCB2YWx1ZSkge1xuICAgICAgbWFwLnNldChmbGFzaChuYW1lKSwgdmFsdWUpO1xuICAgIH0sXG4gICAgdW5zZXQobmFtZSkge1xuICAgICAgbWFwLmRlbGV0ZShuYW1lKTtcbiAgICB9XG4gIH07XG59O1xudmFyIGlzU2Vzc2lvbiA9IChvYmplY3QpID0+IHtcbiAgcmV0dXJuIG9iamVjdCAhPSBudWxsICYmIHR5cGVvZiBvYmplY3QuaWQgPT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIG9iamVjdC5kYXRhICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBvYmplY3QuaGFzID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIG9iamVjdC5nZXQgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2Ygb2JqZWN0LnNldCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBvYmplY3QuZmxhc2ggPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2Ygb2JqZWN0LnVuc2V0ID09PSBcImZ1bmN0aW9uXCI7XG59O1xuZnVuY3Rpb24gY3JlYXRlU2Vzc2lvblN0b3JhZ2Uoe1xuICBjb29raWU6IGNvb2tpZUFyZyxcbiAgY3JlYXRlRGF0YSxcbiAgcmVhZERhdGEsXG4gIHVwZGF0ZURhdGEsXG4gIGRlbGV0ZURhdGFcbn0pIHtcbiAgbGV0IGNvb2tpZSA9IGlzQ29va2llKGNvb2tpZUFyZykgPyBjb29raWVBcmcgOiBjcmVhdGVDb29raWUoY29va2llQXJnPy5uYW1lIHx8IFwiX19zZXNzaW9uXCIsIGNvb2tpZUFyZyk7XG4gIHdhcm5PbmNlQWJvdXRTaWduaW5nU2Vzc2lvbkNvb2tpZShjb29raWUpO1xuICByZXR1cm4ge1xuICAgIGFzeW5jIGdldFNlc3Npb24oY29va2llSGVhZGVyLCBvcHRpb25zKSB7XG4gICAgICBsZXQgaWQgPSBjb29raWVIZWFkZXIgJiYgYXdhaXQgY29va2llLnBhcnNlKGNvb2tpZUhlYWRlciwgb3B0aW9ucyk7XG4gICAgICBsZXQgZGF0YTIgPSBpZCAmJiBhd2FpdCByZWFkRGF0YShpZCk7XG4gICAgICByZXR1cm4gY3JlYXRlU2Vzc2lvbihkYXRhMiB8fCB7fSwgaWQgfHwgXCJcIik7XG4gICAgfSxcbiAgICBhc3luYyBjb21taXRTZXNzaW9uKHNlc3Npb24sIG9wdGlvbnMpIHtcbiAgICAgIGxldCB7IGlkLCBkYXRhOiBkYXRhMiB9ID0gc2Vzc2lvbjtcbiAgICAgIGxldCBleHBpcmVzID0gb3B0aW9ucz8ubWF4QWdlICE9IG51bGwgPyBuZXcgRGF0ZShEYXRlLm5vdygpICsgb3B0aW9ucy5tYXhBZ2UgKiAxZTMpIDogb3B0aW9ucz8uZXhwaXJlcyAhPSBudWxsID8gb3B0aW9ucy5leHBpcmVzIDogY29va2llLmV4cGlyZXM7XG4gICAgICBpZiAoaWQpIHtcbiAgICAgICAgYXdhaXQgdXBkYXRlRGF0YShpZCwgZGF0YTIsIGV4cGlyZXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWQgPSBhd2FpdCBjcmVhdGVEYXRhKGRhdGEyLCBleHBpcmVzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb29raWUuc2VyaWFsaXplKGlkLCBvcHRpb25zKTtcbiAgICB9LFxuICAgIGFzeW5jIGRlc3Ryb3lTZXNzaW9uKHNlc3Npb24sIG9wdGlvbnMpIHtcbiAgICAgIGF3YWl0IGRlbGV0ZURhdGEoc2Vzc2lvbi5pZCk7XG4gICAgICByZXR1cm4gY29va2llLnNlcmlhbGl6ZShcIlwiLCB7XG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIG1heEFnZTogdm9pZCAwLFxuICAgICAgICBleHBpcmVzOiAvKiBAX19QVVJFX18gKi8gbmV3IERhdGUoMClcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1cbmZ1bmN0aW9uIHdhcm5PbmNlQWJvdXRTaWduaW5nU2Vzc2lvbkNvb2tpZShjb29raWUpIHtcbiAgd2Fybk9uY2UoXG4gICAgY29va2llLmlzU2lnbmVkLFxuICAgIGBUaGUgXCIke2Nvb2tpZS5uYW1lfVwiIGNvb2tpZSBpcyBub3Qgc2lnbmVkLCBidXQgc2Vzc2lvbiBjb29raWVzIHNob3VsZCBiZSBzaWduZWQgdG8gcHJldmVudCB0YW1wZXJpbmcgb24gdGhlIGNsaWVudCBiZWZvcmUgdGhleSBhcmUgc2VudCBiYWNrIHRvIHRoZSBzZXJ2ZXIuIFNlZSBodHRwczovL3JlYWN0cm91dGVyLmNvbS9leHBsYW5hdGlvbi9zZXNzaW9ucy1hbmQtY29va2llcyNzaWduaW5nLWNvb2tpZXMgZm9yIG1vcmUgaW5mb3JtYXRpb24uYFxuICApO1xufVxuXG4vLyBsaWIvc2VydmVyLXJ1bnRpbWUvc2Vzc2lvbnMvY29va2llU3RvcmFnZS50c1xuZnVuY3Rpb24gY3JlYXRlQ29va2llU2Vzc2lvblN0b3JhZ2UoeyBjb29raWU6IGNvb2tpZUFyZyB9ID0ge30pIHtcbiAgbGV0IGNvb2tpZSA9IGlzQ29va2llKGNvb2tpZUFyZykgPyBjb29raWVBcmcgOiBjcmVhdGVDb29raWUoY29va2llQXJnPy5uYW1lIHx8IFwiX19zZXNzaW9uXCIsIGNvb2tpZUFyZyk7XG4gIHdhcm5PbmNlQWJvdXRTaWduaW5nU2Vzc2lvbkNvb2tpZShjb29raWUpO1xuICByZXR1cm4ge1xuICAgIGFzeW5jIGdldFNlc3Npb24oY29va2llSGVhZGVyLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gY3JlYXRlU2Vzc2lvbihcbiAgICAgICAgY29va2llSGVhZGVyICYmIGF3YWl0IGNvb2tpZS5wYXJzZShjb29raWVIZWFkZXIsIG9wdGlvbnMpIHx8IHt9XG4gICAgICApO1xuICAgIH0sXG4gICAgYXN5bmMgY29tbWl0U2Vzc2lvbihzZXNzaW9uLCBvcHRpb25zKSB7XG4gICAgICBsZXQgc2VyaWFsaXplZENvb2tpZSA9IGF3YWl0IGNvb2tpZS5zZXJpYWxpemUoc2Vzc2lvbi5kYXRhLCBvcHRpb25zKTtcbiAgICAgIGlmIChzZXJpYWxpemVkQ29va2llLmxlbmd0aCA+IDQwOTYpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIFwiQ29va2llIGxlbmd0aCB3aWxsIGV4Y2VlZCBicm93c2VyIG1heGltdW0uIExlbmd0aDogXCIgKyBzZXJpYWxpemVkQ29va2llLmxlbmd0aFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNlcmlhbGl6ZWRDb29raWU7XG4gICAgfSxcbiAgICBhc3luYyBkZXN0cm95U2Vzc2lvbihfc2Vzc2lvbiwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIGNvb2tpZS5zZXJpYWxpemUoXCJcIiwge1xuICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICBtYXhBZ2U6IHZvaWQgMCxcbiAgICAgICAgZXhwaXJlczogLyogQF9fUFVSRV9fICovIG5ldyBEYXRlKDApXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XG5cbi8vIGxpYi9zZXJ2ZXItcnVudGltZS9zZXNzaW9ucy9tZW1vcnlTdG9yYWdlLnRzXG5mdW5jdGlvbiBjcmVhdGVNZW1vcnlTZXNzaW9uU3RvcmFnZSh7IGNvb2tpZSB9ID0ge30pIHtcbiAgbGV0IG1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIHJldHVybiBjcmVhdGVTZXNzaW9uU3RvcmFnZSh7XG4gICAgY29va2llLFxuICAgIGFzeW5jIGNyZWF0ZURhdGEoZGF0YTIsIGV4cGlyZXMpIHtcbiAgICAgIGxldCBpZCA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCAxMCk7XG4gICAgICBtYXAuc2V0KGlkLCB7IGRhdGE6IGRhdGEyLCBleHBpcmVzIH0pO1xuICAgICAgcmV0dXJuIGlkO1xuICAgIH0sXG4gICAgYXN5bmMgcmVhZERhdGEoaWQpIHtcbiAgICAgIGlmIChtYXAuaGFzKGlkKSkge1xuICAgICAgICBsZXQgeyBkYXRhOiBkYXRhMiwgZXhwaXJlcyB9ID0gbWFwLmdldChpZCk7XG4gICAgICAgIGlmICghZXhwaXJlcyB8fCBleHBpcmVzID4gLyogQF9fUFVSRV9fICovIG5ldyBEYXRlKCkpIHtcbiAgICAgICAgICByZXR1cm4gZGF0YTI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4cGlyZXMpIG1hcC5kZWxldGUoaWQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBhc3luYyB1cGRhdGVEYXRhKGlkLCBkYXRhMiwgZXhwaXJlcykge1xuICAgICAgbWFwLnNldChpZCwgeyBkYXRhOiBkYXRhMiwgZXhwaXJlcyB9KTtcbiAgICB9LFxuICAgIGFzeW5jIGRlbGV0ZURhdGEoaWQpIHtcbiAgICAgIG1hcC5kZWxldGUoaWQpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIGxpYi9ocmVmLnRzXG5mdW5jdGlvbiBocmVmKHBhdGgsIC4uLmFyZ3MpIHtcbiAgbGV0IHBhcmFtcyA9IGFyZ3NbMF07XG4gIGxldCByZXN1bHQgPSBwYXRoLnJlcGxhY2UoL1xcLypcXCo/JC8sIFwiXCIpLnJlcGxhY2UoXG4gICAgL1xcLzooW1xcdy1dKykoXFw/KT8vZyxcbiAgICAvLyBzYW1lIHJlZ2V4IGFzIGluIC5cXHJvdXRlclxcdXRpbHMudHM6IGNvbXBpbGVQYXRoKCkuXG4gICAgKF8sIHBhcmFtLCBxdWVzdGlvbk1hcmspID0+IHtcbiAgICAgIGNvbnN0IGlzUmVxdWlyZWQgPSBxdWVzdGlvbk1hcmsgPT09IHZvaWQgMDtcbiAgICAgIGNvbnN0IHZhbHVlID0gcGFyYW1zID8gcGFyYW1zW3BhcmFtXSA6IHZvaWQgMDtcbiAgICAgIGlmIChpc1JlcXVpcmVkICYmIHZhbHVlID09PSB2b2lkIDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBQYXRoICcke3BhdGh9JyByZXF1aXJlcyBwYXJhbSAnJHtwYXJhbX0nIGJ1dCBpdCB3YXMgbm90IHByb3ZpZGVkYFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlID09PSB2b2lkIDAgPyBcIlwiIDogXCIvXCIgKyB2YWx1ZTtcbiAgICB9XG4gICk7XG4gIGlmIChwYXRoLmVuZHNXaXRoKFwiKlwiKSkge1xuICAgIGNvbnN0IHZhbHVlID0gcGFyYW1zID8gcGFyYW1zW1wiKlwiXSA6IHZvaWQgMDtcbiAgICBpZiAodmFsdWUgIT09IHZvaWQgMCkge1xuICAgICAgcmVzdWx0ICs9IFwiL1wiICsgdmFsdWU7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQgfHwgXCIvXCI7XG59XG5cbi8vIGxpYi9yc2Mvc2VydmVyLnNzci50c3hcbmltcG9ydCAqIGFzIFJlYWN0NCBmcm9tIFwicmVhY3RcIjtcblxuLy8gbGliL3JzYy9odG1sLXN0cmVhbS9zZXJ2ZXIudHNcbnZhciBlbmNvZGVyMiA9IG5ldyBUZXh0RW5jb2RlcigpO1xudmFyIHRyYWlsZXIgPSBcIjwvYm9keT48L2h0bWw+XCI7XG5mdW5jdGlvbiBpbmplY3RSU0NQYXlsb2FkKHJzY1N0cmVhbSkge1xuICBsZXQgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuICBsZXQgcmVzb2x2ZUZsaWdodERhdGFQcm9taXNlO1xuICBsZXQgZmxpZ2h0RGF0YVByb21pc2UgPSBuZXcgUHJvbWlzZShcbiAgICAocmVzb2x2ZSkgPT4gcmVzb2x2ZUZsaWdodERhdGFQcm9taXNlID0gcmVzb2x2ZVxuICApO1xuICBsZXQgc3RhcnRlZFJTQyA9IGZhbHNlO1xuICBsZXQgYnVmZmVyZWQgPSBbXTtcbiAgbGV0IHRpbWVvdXQgPSBudWxsO1xuICBmdW5jdGlvbiBmbHVzaEJ1ZmZlcmVkQ2h1bmtzKGNvbnRyb2xsZXIpIHtcbiAgICBmb3IgKGxldCBjaHVuayBvZiBidWZmZXJlZCkge1xuICAgICAgbGV0IGJ1ZiA9IGRlY29kZXIuZGVjb2RlKGNodW5rLCB7IHN0cmVhbTogdHJ1ZSB9KTtcbiAgICAgIGlmIChidWYuZW5kc1dpdGgodHJhaWxlcikpIHtcbiAgICAgICAgYnVmID0gYnVmLnNsaWNlKDAsIC10cmFpbGVyLmxlbmd0aCk7XG4gICAgICB9XG4gICAgICBjb250cm9sbGVyLmVucXVldWUoZW5jb2RlcjIuZW5jb2RlKGJ1ZikpO1xuICAgIH1cbiAgICBidWZmZXJlZC5sZW5ndGggPSAwO1xuICAgIHRpbWVvdXQgPSBudWxsO1xuICB9XG4gIHJldHVybiBuZXcgVHJhbnNmb3JtU3RyZWFtKHtcbiAgICB0cmFuc2Zvcm0oY2h1bmssIGNvbnRyb2xsZXIpIHtcbiAgICAgIGJ1ZmZlcmVkLnB1c2goY2h1bmspO1xuICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xuICAgICAgICBmbHVzaEJ1ZmZlcmVkQ2h1bmtzKGNvbnRyb2xsZXIpO1xuICAgICAgICBpZiAoIXN0YXJ0ZWRSU0MpIHtcbiAgICAgICAgICBzdGFydGVkUlNDID0gdHJ1ZTtcbiAgICAgICAgICB3cml0ZVJTQ1N0cmVhbShyc2NTdHJlYW0sIGNvbnRyb2xsZXIpLmNhdGNoKChlcnIpID0+IGNvbnRyb2xsZXIuZXJyb3IoZXJyKSkudGhlbihyZXNvbHZlRmxpZ2h0RGF0YVByb21pc2UpO1xuICAgICAgICB9XG4gICAgICB9LCAwKTtcbiAgICB9LFxuICAgIGFzeW5jIGZsdXNoKGNvbnRyb2xsZXIpIHtcbiAgICAgIGF3YWl0IGZsaWdodERhdGFQcm9taXNlO1xuICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICBmbHVzaEJ1ZmZlcmVkQ2h1bmtzKGNvbnRyb2xsZXIpO1xuICAgICAgfVxuICAgICAgY29udHJvbGxlci5lbnF1ZXVlKGVuY29kZXIyLmVuY29kZShcIjwvYm9keT48L2h0bWw+XCIpKTtcbiAgICB9XG4gIH0pO1xufVxuYXN5bmMgZnVuY3Rpb24gd3JpdGVSU0NTdHJlYW0ocnNjU3RyZWFtLCBjb250cm9sbGVyKSB7XG4gIGxldCBkZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKFwidXRmLThcIiwgeyBmYXRhbDogdHJ1ZSB9KTtcbiAgY29uc3QgcmVhZGVyID0gcnNjU3RyZWFtLmdldFJlYWRlcigpO1xuICB0cnkge1xuICAgIGxldCByZWFkO1xuICAgIHdoaWxlICgocmVhZCA9IGF3YWl0IHJlYWRlci5yZWFkKCkpICYmICFyZWFkLmRvbmUpIHtcbiAgICAgIGNvbnN0IGNodW5rID0gcmVhZC52YWx1ZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHdyaXRlQ2h1bmsoXG4gICAgICAgICAgSlNPTi5zdHJpbmdpZnkoZGVjb2Rlci5kZWNvZGUoY2h1bmssIHsgc3RyZWFtOiB0cnVlIH0pKSxcbiAgICAgICAgICBjb250cm9sbGVyXG4gICAgICAgICk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgbGV0IGJhc2U2NCA9IEpTT04uc3RyaW5naWZ5KGJ0b2EoU3RyaW5nLmZyb21Db2RlUG9pbnQoLi4uY2h1bmspKSk7XG4gICAgICAgIHdyaXRlQ2h1bmsoXG4gICAgICAgICAgYFVpbnQ4QXJyYXkuZnJvbShhdG9iKCR7YmFzZTY0fSksIG0gPT4gbS5jb2RlUG9pbnRBdCgwKSlgLFxuICAgICAgICAgIGNvbnRyb2xsZXJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZmluYWxseSB7XG4gICAgcmVhZGVyLnJlbGVhc2VMb2NrKCk7XG4gIH1cbiAgbGV0IHJlbWFpbmluZyA9IGRlY29kZXIuZGVjb2RlKCk7XG4gIGlmIChyZW1haW5pbmcubGVuZ3RoKSB7XG4gICAgd3JpdGVDaHVuayhKU09OLnN0cmluZ2lmeShyZW1haW5pbmcpLCBjb250cm9sbGVyKTtcbiAgfVxufVxuZnVuY3Rpb24gd3JpdGVDaHVuayhjaHVuaywgY29udHJvbGxlcikge1xuICBjb250cm9sbGVyLmVucXVldWUoXG4gICAgZW5jb2RlcjIuZW5jb2RlKFxuICAgICAgYDxzY3JpcHQ+JHtlc2NhcGVTY3JpcHQoXG4gICAgICAgIGAoc2VsZi5fX0ZMSUdIVF9EQVRBfHw9W10pLnB1c2goJHtjaHVua30pYFxuICAgICAgKX08L3NjcmlwdD5gXG4gICAgKVxuICApO1xufVxuZnVuY3Rpb24gZXNjYXBlU2NyaXB0KHNjcmlwdCkge1xuICByZXR1cm4gc2NyaXB0LnJlcGxhY2UoLzwhLS0vZywgXCI8XFxcXCEtLVwiKS5yZXBsYWNlKC88XFwvKHNjcmlwdCkvZ2ksIFwiPC9cXFxcJDFcIik7XG59XG5cbi8vIGxpYi9yc2MvZXJyb3JCb3VuZGFyaWVzLnRzeFxuaW1wb3J0IFJlYWN0MyBmcm9tIFwicmVhY3RcIjtcbnZhciBSU0NSb3V0ZXJHbG9iYWxFcnJvckJvdW5kYXJ5ID0gY2xhc3MgZXh0ZW5kcyBSZWFjdDMuQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHsgZXJyb3I6IG51bGwsIGxvY2F0aW9uOiBwcm9wcy5sb2NhdGlvbiB9O1xuICB9XG4gIHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IoZXJyb3IpIHtcbiAgICByZXR1cm4geyBlcnJvciB9O1xuICB9XG4gIHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMocHJvcHMsIHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlLmxvY2F0aW9uICE9PSBwcm9wcy5sb2NhdGlvbikge1xuICAgICAgcmV0dXJuIHsgZXJyb3I6IG51bGwsIGxvY2F0aW9uOiBwcm9wcy5sb2NhdGlvbiB9O1xuICAgIH1cbiAgICByZXR1cm4geyBlcnJvcjogc3RhdGUuZXJyb3IsIGxvY2F0aW9uOiBzdGF0ZS5sb2NhdGlvbiB9O1xuICB9XG4gIHJlbmRlcigpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5lcnJvcikge1xuICAgICAgcmV0dXJuIC8qIEBfX1BVUkVfXyAqLyBSZWFjdDMuY3JlYXRlRWxlbWVudChcbiAgICAgICAgUlNDRGVmYXVsdFJvb3RFcnJvckJvdW5kYXJ5SW1wbCxcbiAgICAgICAge1xuICAgICAgICAgIGVycm9yOiB0aGlzLnN0YXRlLmVycm9yLFxuICAgICAgICAgIHJlbmRlckFwcFNoZWxsOiB0cnVlXG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuO1xuICAgIH1cbiAgfVxufTtcbmZ1bmN0aW9uIEVycm9yV3JhcHBlcih7XG4gIHJlbmRlckFwcFNoZWxsLFxuICB0aXRsZSxcbiAgY2hpbGRyZW5cbn0pIHtcbiAgaWYgKCFyZW5kZXJBcHBTaGVsbCkge1xuICAgIHJldHVybiBjaGlsZHJlbjtcbiAgfVxuICByZXR1cm4gLyogQF9fUFVSRV9fICovIFJlYWN0My5jcmVhdGVFbGVtZW50KFwiaHRtbFwiLCB7IGxhbmc6IFwiZW5cIiB9LCAvKiBAX19QVVJFX18gKi8gUmVhY3QzLmNyZWF0ZUVsZW1lbnQoXCJoZWFkXCIsIG51bGwsIC8qIEBfX1BVUkVfXyAqLyBSZWFjdDMuY3JlYXRlRWxlbWVudChcIm1ldGFcIiwgeyBjaGFyU2V0OiBcInV0Zi04XCIgfSksIC8qIEBfX1BVUkVfXyAqLyBSZWFjdDMuY3JlYXRlRWxlbWVudChcbiAgICBcIm1ldGFcIixcbiAgICB7XG4gICAgICBuYW1lOiBcInZpZXdwb3J0XCIsXG4gICAgICBjb250ZW50OiBcIndpZHRoPWRldmljZS13aWR0aCxpbml0aWFsLXNjYWxlPTEsdmlld3BvcnQtZml0PWNvdmVyXCJcbiAgICB9XG4gICksIC8qIEBfX1BVUkVfXyAqLyBSZWFjdDMuY3JlYXRlRWxlbWVudChcInRpdGxlXCIsIG51bGwsIHRpdGxlKSksIC8qIEBfX1BVUkVfXyAqLyBSZWFjdDMuY3JlYXRlRWxlbWVudChcImJvZHlcIiwgbnVsbCwgLyogQF9fUFVSRV9fICovIFJlYWN0My5jcmVhdGVFbGVtZW50KFwibWFpblwiLCB7IHN0eWxlOiB7IGZvbnRGYW1pbHk6IFwic3lzdGVtLXVpLCBzYW5zLXNlcmlmXCIsIHBhZGRpbmc6IFwiMnJlbVwiIH0gfSwgY2hpbGRyZW4pKSk7XG59XG5mdW5jdGlvbiBSU0NEZWZhdWx0Um9vdEVycm9yQm91bmRhcnlJbXBsKHtcbiAgZXJyb3IsXG4gIHJlbmRlckFwcFNoZWxsXG59KSB7XG4gIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICBsZXQgaGV5RGV2ZWxvcGVyID0gLyogQF9fUFVSRV9fICovIFJlYWN0My5jcmVhdGVFbGVtZW50KFxuICAgIFwic2NyaXB0XCIsXG4gICAge1xuICAgICAgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw6IHtcbiAgICAgICAgX19odG1sOiBgXG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgIFwiXFx1ezFGNEJGfSBIZXkgZGV2ZWxvcGVyIFxcdXsxRjQ0Qn0uIFlvdSBjYW4gcHJvdmlkZSBhIHdheSBiZXR0ZXIgVVggdGhhbiB0aGlzIHdoZW4geW91ciBhcHAgdGhyb3dzIGVycm9ycy4gQ2hlY2sgb3V0IGh0dHBzOi8vcmVhY3Ryb3V0ZXIuY29tL2hvdy10by9lcnJvci1ib3VuZGFyeSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cIlxuICAgICAgICApO1xuICAgICAgYFxuICAgICAgfVxuICAgIH1cbiAgKTtcbiAgaWYgKGlzUm91dGVFcnJvclJlc3BvbnNlKGVycm9yKSkge1xuICAgIHJldHVybiAvKiBAX19QVVJFX18gKi8gUmVhY3QzLmNyZWF0ZUVsZW1lbnQoXG4gICAgICBFcnJvcldyYXBwZXIsXG4gICAgICB7XG4gICAgICAgIHJlbmRlckFwcFNoZWxsLFxuICAgICAgICB0aXRsZTogXCJVbmhhbmRsZWQgVGhyb3duIFJlc3BvbnNlIVwiXG4gICAgICB9LFxuICAgICAgLyogQF9fUFVSRV9fICovIFJlYWN0My5jcmVhdGVFbGVtZW50KFwiaDFcIiwgeyBzdHlsZTogeyBmb250U2l6ZTogXCIyNHB4XCIgfSB9LCBlcnJvci5zdGF0dXMsIFwiIFwiLCBlcnJvci5zdGF0dXNUZXh0KSxcbiAgICAgIEVOQUJMRV9ERVZfV0FSTklOR1MgPyBoZXlEZXZlbG9wZXIgOiBudWxsXG4gICAgKTtcbiAgfVxuICBsZXQgZXJyb3JJbnN0YW5jZTtcbiAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICBlcnJvckluc3RhbmNlID0gZXJyb3I7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGVycm9yU3RyaW5nID0gZXJyb3IgPT0gbnVsbCA/IFwiVW5rbm93biBFcnJvclwiIDogdHlwZW9mIGVycm9yID09PSBcIm9iamVjdFwiICYmIFwidG9TdHJpbmdcIiBpbiBlcnJvciA/IGVycm9yLnRvU3RyaW5nKCkgOiBKU09OLnN0cmluZ2lmeShlcnJvcik7XG4gICAgZXJyb3JJbnN0YW5jZSA9IG5ldyBFcnJvcihlcnJvclN0cmluZyk7XG4gIH1cbiAgcmV0dXJuIC8qIEBfX1BVUkVfXyAqLyBSZWFjdDMuY3JlYXRlRWxlbWVudChFcnJvcldyYXBwZXIsIHsgcmVuZGVyQXBwU2hlbGwsIHRpdGxlOiBcIkFwcGxpY2F0aW9uIEVycm9yIVwiIH0sIC8qIEBfX1BVUkVfXyAqLyBSZWFjdDMuY3JlYXRlRWxlbWVudChcImgxXCIsIHsgc3R5bGU6IHsgZm9udFNpemU6IFwiMjRweFwiIH0gfSwgXCJBcHBsaWNhdGlvbiBFcnJvclwiKSwgLyogQF9fUFVSRV9fICovIFJlYWN0My5jcmVhdGVFbGVtZW50KFxuICAgIFwicHJlXCIsXG4gICAge1xuICAgICAgc3R5bGU6IHtcbiAgICAgICAgcGFkZGluZzogXCIycmVtXCIsXG4gICAgICAgIGJhY2tncm91bmQ6IFwiaHNsYSgxMCwgNTAlLCA1MCUsIDAuMSlcIixcbiAgICAgICAgY29sb3I6IFwicmVkXCIsXG4gICAgICAgIG92ZXJmbG93OiBcImF1dG9cIlxuICAgICAgfVxuICAgIH0sXG4gICAgZXJyb3JJbnN0YW5jZS5zdGFja1xuICApLCBoZXlEZXZlbG9wZXIpO1xufVxuZnVuY3Rpb24gUlNDRGVmYXVsdFJvb3RFcnJvckJvdW5kYXJ5KHtcbiAgaGFzUm9vdExheW91dFxufSkge1xuICBsZXQgZXJyb3IgPSB1c2VSb3V0ZUVycm9yKCk7XG4gIGlmIChoYXNSb290TGF5b3V0ID09PSB2b2lkIDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nICdoYXNSb290TGF5b3V0JyBwcm9wXCIpO1xuICB9XG4gIHJldHVybiAvKiBAX19QVVJFX18gKi8gUmVhY3QzLmNyZWF0ZUVsZW1lbnQoXG4gICAgUlNDRGVmYXVsdFJvb3RFcnJvckJvdW5kYXJ5SW1wbCxcbiAgICB7XG4gICAgICByZW5kZXJBcHBTaGVsbDogIWhhc1Jvb3RMYXlvdXQsXG4gICAgICBlcnJvclxuICAgIH1cbiAgKTtcbn1cblxuLy8gbGliL3JzYy9yb3V0ZS1tb2R1bGVzLnRzXG5mdW5jdGlvbiBjcmVhdGVSU0NSb3V0ZU1vZHVsZXMocGF5bG9hZCkge1xuICBjb25zdCByb3V0ZU1vZHVsZXMgPSB7fTtcbiAgZm9yIChjb25zdCBtYXRjaCBvZiBwYXlsb2FkLm1hdGNoZXMpIHtcbiAgICBwb3B1bGF0ZVJTQ1JvdXRlTW9kdWxlcyhyb3V0ZU1vZHVsZXMsIG1hdGNoKTtcbiAgfVxuICByZXR1cm4gcm91dGVNb2R1bGVzO1xufVxuZnVuY3Rpb24gcG9wdWxhdGVSU0NSb3V0ZU1vZHVsZXMocm91dGVNb2R1bGVzLCBtYXRjaGVzKSB7XG4gIG1hdGNoZXMgPSBBcnJheS5pc0FycmF5KG1hdGNoZXMpID8gbWF0Y2hlcyA6IFttYXRjaGVzXTtcbiAgZm9yIChjb25zdCBtYXRjaCBvZiBtYXRjaGVzKSB7XG4gICAgcm91dGVNb2R1bGVzW21hdGNoLmlkXSA9IHtcbiAgICAgIGxpbmtzOiBtYXRjaC5saW5rcyxcbiAgICAgIG1ldGE6IG1hdGNoLm1ldGEsXG4gICAgICBkZWZhdWx0OiBub29wQ29tcG9uZW50XG4gICAgfTtcbiAgfVxufVxudmFyIG5vb3BDb21wb25lbnQgPSAoKSA9PiBudWxsO1xuXG4vLyBsaWIvcnNjL3NlcnZlci5zc3IudHN4XG52YXIgUkVBQ1RfVVNFID0gXCJ1c2VcIjtcbnZhciB1c2VJbXBsID0gUmVhY3Q0W1JFQUNUX1VTRV07XG5mdW5jdGlvbiB1c2VTYWZlKHByb21pc2UpIHtcbiAgaWYgKHVzZUltcGwpIHtcbiAgICByZXR1cm4gdXNlSW1wbChwcm9taXNlKTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoXCJSZWFjdCBSb3V0ZXIgdjcgcmVxdWlyZXMgUmVhY3QgMTkrIGZvciBSU0MgZmVhdHVyZXMuXCIpO1xufVxuYXN5bmMgZnVuY3Rpb24gcm91dGVSU0NTZXJ2ZXJSZXF1ZXN0KHtcbiAgcmVxdWVzdCxcbiAgZmV0Y2hTZXJ2ZXIsXG4gIGNyZWF0ZUZyb21SZWFkYWJsZVN0cmVhbSxcbiAgcmVuZGVySFRNTCxcbiAgaHlkcmF0ZSA9IHRydWVcbn0pIHtcbiAgY29uc3QgdXJsID0gbmV3IFVSTChyZXF1ZXN0LnVybCk7XG4gIGNvbnN0IGlzRGF0YVJlcXVlc3QgPSBpc1JlYWN0U2VydmVyUmVxdWVzdCh1cmwpO1xuICBjb25zdCByZXNwb25kV2l0aFJTQ1BheWxvYWQgPSBpc0RhdGFSZXF1ZXN0IHx8IGlzTWFuaWZlc3RSZXF1ZXN0KHVybCkgfHwgcmVxdWVzdC5oZWFkZXJzLmhhcyhcInJzYy1hY3Rpb24taWRcIik7XG4gIGNvbnN0IHNlcnZlclJlc3BvbnNlID0gYXdhaXQgZmV0Y2hTZXJ2ZXIocmVxdWVzdCk7XG4gIGlmIChyZXNwb25kV2l0aFJTQ1BheWxvYWQgfHwgc2VydmVyUmVzcG9uc2UuaGVhZGVycy5nZXQoXCJSZWFjdC1Sb3V0ZXItUmVzb3VyY2VcIikgPT09IFwidHJ1ZVwiKSB7XG4gICAgcmV0dXJuIHNlcnZlclJlc3BvbnNlO1xuICB9XG4gIGlmICghc2VydmVyUmVzcG9uc2UuYm9keSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk1pc3NpbmcgYm9keSBpbiBzZXJ2ZXIgcmVzcG9uc2VcIik7XG4gIH1cbiAgY29uc3QgZGV0ZWN0UmVkaXJlY3RSZXNwb25zZSA9IHNlcnZlclJlc3BvbnNlLmNsb25lKCk7XG4gIGxldCBzZXJ2ZXJSZXNwb25zZUIgPSBudWxsO1xuICBpZiAoaHlkcmF0ZSkge1xuICAgIHNlcnZlclJlc3BvbnNlQiA9IHNlcnZlclJlc3BvbnNlLmNsb25lKCk7XG4gIH1cbiAgY29uc3QgYm9keSA9IHNlcnZlclJlc3BvbnNlLmJvZHk7XG4gIGxldCBidWZmZXI7XG4gIGxldCBzdHJlYW1Db250cm9sbGVycyA9IFtdO1xuICBjb25zdCBjcmVhdGVTdHJlYW0gPSAoKSA9PiB7XG4gICAgaWYgKCFidWZmZXIpIHtcbiAgICAgIGJ1ZmZlciA9IFtdO1xuICAgICAgcmV0dXJuIGJvZHkucGlwZVRocm91Z2goXG4gICAgICAgIG5ldyBUcmFuc2Zvcm1TdHJlYW0oe1xuICAgICAgICAgIHRyYW5zZm9ybShjaHVuaywgY29udHJvbGxlcikge1xuICAgICAgICAgICAgYnVmZmVyLnB1c2goY2h1bmspO1xuICAgICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKGNodW5rKTtcbiAgICAgICAgICAgIHN0cmVhbUNvbnRyb2xsZXJzLmZvckVhY2goKGMpID0+IGMuZW5xdWV1ZShjaHVuaykpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZmx1c2goKSB7XG4gICAgICAgICAgICBzdHJlYW1Db250cm9sbGVycy5mb3JFYWNoKChjKSA9PiBjLmNsb3NlKCkpO1xuICAgICAgICAgICAgc3RyZWFtQ29udHJvbGxlcnMgPSBbXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFJlYWRhYmxlU3RyZWFtKHtcbiAgICAgIHN0YXJ0KGNvbnRyb2xsZXIpIHtcbiAgICAgICAgYnVmZmVyLmZvckVhY2goKGNodW5rKSA9PiBjb250cm9sbGVyLmVucXVldWUoY2h1bmspKTtcbiAgICAgICAgc3RyZWFtQ29udHJvbGxlcnMucHVzaChjb250cm9sbGVyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgbGV0IGRlZXBlc3RSZW5kZXJlZEJvdW5kYXJ5SWQgPSBudWxsO1xuICBjb25zdCBnZXRQYXlsb2FkID0gKCkgPT4ge1xuICAgIGNvbnN0IHBheWxvYWRQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKFxuICAgICAgY3JlYXRlRnJvbVJlYWRhYmxlU3RyZWFtKGNyZWF0ZVN0cmVhbSgpKVxuICAgICk7XG4gICAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHBheWxvYWRQcm9taXNlLCB7XG4gICAgICBfZGVlcGVzdFJlbmRlcmVkQm91bmRhcnlJZDoge1xuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIGRlZXBlc3RSZW5kZXJlZEJvdW5kYXJ5SWQ7XG4gICAgICAgIH0sXG4gICAgICAgIHNldChib3VuZGFyeUlkKSB7XG4gICAgICAgICAgZGVlcGVzdFJlbmRlcmVkQm91bmRhcnlJZCA9IGJvdW5kYXJ5SWQ7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBmb3JtU3RhdGU6IHtcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiBwYXlsb2FkUHJvbWlzZS50aGVuKFxuICAgICAgICAgICAgKHBheWxvYWQpID0+IHBheWxvYWQudHlwZSA9PT0gXCJyZW5kZXJcIiA/IHBheWxvYWQuZm9ybVN0YXRlIDogdm9pZCAwXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICB0cnkge1xuICAgIGlmICghZGV0ZWN0UmVkaXJlY3RSZXNwb25zZS5ib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gY2xvbmUgc2VydmVyIHJlc3BvbnNlXCIpO1xuICAgIH1cbiAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgY3JlYXRlRnJvbVJlYWRhYmxlU3RyZWFtKFxuICAgICAgZGV0ZWN0UmVkaXJlY3RSZXNwb25zZS5ib2R5XG4gICAgKTtcbiAgICBpZiAoc2VydmVyUmVzcG9uc2Uuc3RhdHVzID09PSBTSU5HTEVfRkVUQ0hfUkVESVJFQ1RfU1RBVFVTICYmIHBheWxvYWQudHlwZSA9PT0gXCJyZWRpcmVjdFwiKSB7XG4gICAgICBjb25zdCBoZWFkZXJzMiA9IG5ldyBIZWFkZXJzKHNlcnZlclJlc3BvbnNlLmhlYWRlcnMpO1xuICAgICAgaGVhZGVyczIuZGVsZXRlKFwiQ29udGVudC1FbmNvZGluZ1wiKTtcbiAgICAgIGhlYWRlcnMyLmRlbGV0ZShcIkNvbnRlbnQtTGVuZ3RoXCIpO1xuICAgICAgaGVhZGVyczIuZGVsZXRlKFwiQ29udGVudC1UeXBlXCIpO1xuICAgICAgaGVhZGVyczIuZGVsZXRlKFwiWC1SZW1peC1SZXNwb25zZVwiKTtcbiAgICAgIGhlYWRlcnMyLnNldChcIkxvY2F0aW9uXCIsIHBheWxvYWQubG9jYXRpb24pO1xuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShzZXJ2ZXJSZXNwb25zZUI/LmJvZHkgfHwgXCJcIiwge1xuICAgICAgICBoZWFkZXJzOiBoZWFkZXJzMixcbiAgICAgICAgc3RhdHVzOiBwYXlsb2FkLnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogc2VydmVyUmVzcG9uc2Uuc3RhdHVzVGV4dFxuICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnN0IGh0bWwgPSBhd2FpdCByZW5kZXJIVE1MKGdldFBheWxvYWQpO1xuICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSGVhZGVycyhzZXJ2ZXJSZXNwb25zZS5oZWFkZXJzKTtcbiAgICBoZWFkZXJzLnNldChcIkNvbnRlbnQtVHlwZVwiLCBcInRleHQvaHRtbDsgY2hhcnNldD11dGYtOFwiKTtcbiAgICBpZiAoIWh5ZHJhdGUpIHtcbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoaHRtbCwge1xuICAgICAgICBzdGF0dXM6IHNlcnZlclJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgaGVhZGVyc1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICghc2VydmVyUmVzcG9uc2VCPy5ib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gY2xvbmUgc2VydmVyIHJlc3BvbnNlXCIpO1xuICAgIH1cbiAgICBjb25zdCBib2R5MiA9IGh0bWwucGlwZVRocm91Z2goaW5qZWN0UlNDUGF5bG9hZChzZXJ2ZXJSZXNwb25zZUIuYm9keSkpO1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoYm9keTIsIHtcbiAgICAgIHN0YXR1czogc2VydmVyUmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgaGVhZGVyc1xuICAgIH0pO1xuICB9IGNhdGNoIChyZWFzb24pIHtcbiAgICBpZiAocmVhc29uIGluc3RhbmNlb2YgUmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiByZWFzb247XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBzdGF0dXMgPSBpc1JvdXRlRXJyb3JSZXNwb25zZShyZWFzb24pID8gcmVhc29uLnN0YXR1cyA6IDUwMDtcbiAgICAgIGNvbnN0IGh0bWwgPSBhd2FpdCByZW5kZXJIVE1MKCgpID0+IHtcbiAgICAgICAgY29uc3QgZGVjb2RlZCA9IFByb21pc2UucmVzb2x2ZShcbiAgICAgICAgICBjcmVhdGVGcm9tUmVhZGFibGVTdHJlYW0oY3JlYXRlU3RyZWFtKCkpXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHBheWxvYWRQcm9taXNlID0gZGVjb2RlZC50aGVuKFxuICAgICAgICAgIChwYXlsb2FkKSA9PiBPYmplY3QuYXNzaWduKHBheWxvYWQsIHtcbiAgICAgICAgICAgIHN0YXR1cyxcbiAgICAgICAgICAgIGVycm9yczogZGVlcGVzdFJlbmRlcmVkQm91bmRhcnlJZCA/IHtcbiAgICAgICAgICAgICAgW2RlZXBlc3RSZW5kZXJlZEJvdW5kYXJ5SWRdOiByZWFzb25cbiAgICAgICAgICAgIH0gOiB7fVxuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhwYXlsb2FkUHJvbWlzZSwge1xuICAgICAgICAgIF9kZWVwZXN0UmVuZGVyZWRCb3VuZGFyeUlkOiB7XG4gICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgIHJldHVybiBkZWVwZXN0UmVuZGVyZWRCb3VuZGFyeUlkO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldChib3VuZGFyeUlkKSB7XG4gICAgICAgICAgICAgIGRlZXBlc3RSZW5kZXJlZEJvdW5kYXJ5SWQgPSBib3VuZGFyeUlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZm9ybVN0YXRlOiB7XG4gICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwYXlsb2FkUHJvbWlzZS50aGVuKFxuICAgICAgICAgICAgICAgIChwYXlsb2FkKSA9PiBwYXlsb2FkLnR5cGUgPT09IFwicmVuZGVyXCIgPyBwYXlsb2FkLmZvcm1TdGF0ZSA6IHZvaWQgMFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSGVhZGVycyhzZXJ2ZXJSZXNwb25zZS5oZWFkZXJzKTtcbiAgICAgIGhlYWRlcnMuc2V0KFwiQ29udGVudC1UeXBlXCIsIFwidGV4dC9odG1sXCIpO1xuICAgICAgaWYgKCFoeWRyYXRlKSB7XG4gICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoaHRtbCwge1xuICAgICAgICAgIHN0YXR1cyxcbiAgICAgICAgICBoZWFkZXJzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKCFzZXJ2ZXJSZXNwb25zZUI/LmJvZHkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGNsb25lIHNlcnZlciByZXNwb25zZVwiKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGJvZHkyID0gaHRtbC5waXBlVGhyb3VnaChpbmplY3RSU0NQYXlsb2FkKHNlcnZlclJlc3BvbnNlQi5ib2R5KSk7XG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKGJvZHkyLCB7XG4gICAgICAgIHN0YXR1cyxcbiAgICAgICAgaGVhZGVyc1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCB7XG4gICAgfVxuICAgIHRocm93IHJlYXNvbjtcbiAgfVxufVxuZnVuY3Rpb24gUlNDU3RhdGljUm91dGVyKHsgZ2V0UGF5bG9hZCB9KSB7XG4gIGNvbnN0IGRlY29kZWQgPSBnZXRQYXlsb2FkKCk7XG4gIGNvbnN0IHBheWxvYWQgPSB1c2VTYWZlKGRlY29kZWQpO1xuICBpZiAocGF5bG9hZC50eXBlID09PSBcInJlZGlyZWN0XCIpIHtcbiAgICB0aHJvdyBuZXcgUmVzcG9uc2UobnVsbCwge1xuICAgICAgc3RhdHVzOiBwYXlsb2FkLnN0YXR1cyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgTG9jYXRpb246IHBheWxvYWQubG9jYXRpb25cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBpZiAocGF5bG9hZC50eXBlICE9PSBcInJlbmRlclwiKSByZXR1cm4gbnVsbDtcbiAgbGV0IHBhdGNoZWRMb2FkZXJEYXRhID0geyAuLi5wYXlsb2FkLmxvYWRlckRhdGEgfTtcbiAgZm9yIChjb25zdCBtYXRjaCBvZiBwYXlsb2FkLm1hdGNoZXMpIHtcbiAgICBpZiAoc2hvdWxkSHlkcmF0ZVJvdXRlTG9hZGVyKFxuICAgICAgbWF0Y2guaWQsXG4gICAgICBtYXRjaC5jbGllbnRMb2FkZXIsXG4gICAgICBtYXRjaC5oYXNMb2FkZXIsXG4gICAgICBmYWxzZVxuICAgICkgJiYgKG1hdGNoLmh5ZHJhdGVGYWxsYmFja0VsZW1lbnQgfHwgIW1hdGNoLmhhc0xvYWRlcikpIHtcbiAgICAgIGRlbGV0ZSBwYXRjaGVkTG9hZGVyRGF0YVttYXRjaC5pZF07XG4gICAgfVxuICB9XG4gIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgZ2V0IF9kZWVwZXN0UmVuZGVyZWRCb3VuZGFyeUlkKCkge1xuICAgICAgcmV0dXJuIGRlY29kZWQuX2RlZXBlc3RSZW5kZXJlZEJvdW5kYXJ5SWQgPz8gbnVsbDtcbiAgICB9LFxuICAgIHNldCBfZGVlcGVzdFJlbmRlcmVkQm91bmRhcnlJZChib3VuZGFyeUlkKSB7XG4gICAgICBkZWNvZGVkLl9kZWVwZXN0UmVuZGVyZWRCb3VuZGFyeUlkID0gYm91bmRhcnlJZDtcbiAgICB9LFxuICAgIGFjdGlvbkRhdGE6IHBheWxvYWQuYWN0aW9uRGF0YSxcbiAgICBhY3Rpb25IZWFkZXJzOiB7fSxcbiAgICBiYXNlbmFtZTogcGF5bG9hZC5iYXNlbmFtZSxcbiAgICBlcnJvcnM6IHBheWxvYWQuZXJyb3JzLFxuICAgIGxvYWRlckRhdGE6IHBhdGNoZWRMb2FkZXJEYXRhLFxuICAgIGxvYWRlckhlYWRlcnM6IHt9LFxuICAgIGxvY2F0aW9uOiBwYXlsb2FkLmxvY2F0aW9uLFxuICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICBtYXRjaGVzOiBwYXlsb2FkLm1hdGNoZXMubWFwKChtYXRjaCkgPT4gKHtcbiAgICAgIHBhcmFtczogbWF0Y2gucGFyYW1zLFxuICAgICAgcGF0aG5hbWU6IG1hdGNoLnBhdGhuYW1lLFxuICAgICAgcGF0aG5hbWVCYXNlOiBtYXRjaC5wYXRobmFtZUJhc2UsXG4gICAgICByb3V0ZToge1xuICAgICAgICBpZDogbWF0Y2guaWQsXG4gICAgICAgIGFjdGlvbjogbWF0Y2guaGFzQWN0aW9uIHx8ICEhbWF0Y2guY2xpZW50QWN0aW9uLFxuICAgICAgICBoYW5kbGU6IG1hdGNoLmhhbmRsZSxcbiAgICAgICAgaGFzRXJyb3JCb3VuZGFyeTogbWF0Y2guaGFzRXJyb3JCb3VuZGFyeSxcbiAgICAgICAgbG9hZGVyOiBtYXRjaC5oYXNMb2FkZXIgfHwgISFtYXRjaC5jbGllbnRMb2FkZXIsXG4gICAgICAgIGluZGV4OiBtYXRjaC5pbmRleCxcbiAgICAgICAgcGF0aDogbWF0Y2gucGF0aCxcbiAgICAgICAgc2hvdWxkUmV2YWxpZGF0ZTogbWF0Y2guc2hvdWxkUmV2YWxpZGF0ZVxuICAgICAgfVxuICAgIH0pKVxuICB9O1xuICBjb25zdCByb3V0ZXIgPSBjcmVhdGVTdGF0aWNSb3V0ZXIoXG4gICAgcGF5bG9hZC5tYXRjaGVzLnJlZHVjZVJpZ2h0KChwcmV2aW91cywgbWF0Y2gpID0+IHtcbiAgICAgIGNvbnN0IHJvdXRlID0ge1xuICAgICAgICBpZDogbWF0Y2guaWQsXG4gICAgICAgIGFjdGlvbjogbWF0Y2guaGFzQWN0aW9uIHx8ICEhbWF0Y2guY2xpZW50QWN0aW9uLFxuICAgICAgICBlbGVtZW50OiBtYXRjaC5lbGVtZW50LFxuICAgICAgICBlcnJvckVsZW1lbnQ6IG1hdGNoLmVycm9yRWxlbWVudCxcbiAgICAgICAgaGFuZGxlOiBtYXRjaC5oYW5kbGUsXG4gICAgICAgIGhhc0Vycm9yQm91bmRhcnk6ICEhbWF0Y2guZXJyb3JFbGVtZW50LFxuICAgICAgICBoeWRyYXRlRmFsbGJhY2tFbGVtZW50OiBtYXRjaC5oeWRyYXRlRmFsbGJhY2tFbGVtZW50LFxuICAgICAgICBpbmRleDogbWF0Y2guaW5kZXgsXG4gICAgICAgIGxvYWRlcjogbWF0Y2guaGFzTG9hZGVyIHx8ICEhbWF0Y2guY2xpZW50TG9hZGVyLFxuICAgICAgICBwYXRoOiBtYXRjaC5wYXRoLFxuICAgICAgICBzaG91bGRSZXZhbGlkYXRlOiBtYXRjaC5zaG91bGRSZXZhbGlkYXRlXG4gICAgICB9O1xuICAgICAgaWYgKHByZXZpb3VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcm91dGUuY2hpbGRyZW4gPSBwcmV2aW91cztcbiAgICAgIH1cbiAgICAgIHJldHVybiBbcm91dGVdO1xuICAgIH0sIFtdKSxcbiAgICBjb250ZXh0XG4gICk7XG4gIGNvbnN0IGZyYW1ld29ya0NvbnRleHQgPSB7XG4gICAgZnV0dXJlOiB7XG4gICAgICAvLyBUaGVzZSBmbGFncyBoYXZlIG5vIHJ1bnRpbWUgaW1wYWN0IHNvIGNhbiBhbHdheXMgYmUgZmFsc2UuICBJZiB3ZSBhZGRcbiAgICAgIC8vIGZsYWdzIHRoYXQgZHJpdmUgcnVudGltZSBiZWhhdmlvciB0aGV5J2xsIG5lZWQgdG8gYmUgcHJveGllZCB0aHJvdWdoLlxuICAgICAgdjhfbWlkZGxld2FyZTogZmFsc2UsXG4gICAgICB1bnN0YWJsZV9zdWJSZXNvdXJjZUludGVncml0eTogZmFsc2VcbiAgICB9LFxuICAgIGlzU3BhTW9kZTogZmFsc2UsXG4gICAgc3NyOiB0cnVlLFxuICAgIGNyaXRpY2FsQ3NzOiBcIlwiLFxuICAgIG1hbmlmZXN0OiB7XG4gICAgICByb3V0ZXM6IHt9LFxuICAgICAgdmVyc2lvbjogXCIxXCIsXG4gICAgICB1cmw6IFwiXCIsXG4gICAgICBlbnRyeToge1xuICAgICAgICBtb2R1bGU6IFwiXCIsXG4gICAgICAgIGltcG9ydHM6IFtdXG4gICAgICB9XG4gICAgfSxcbiAgICByb3V0ZURpc2NvdmVyeTogeyBtb2RlOiBcImxhenlcIiwgbWFuaWZlc3RQYXRoOiBcIi9fX21hbmlmZXN0XCIgfSxcbiAgICByb3V0ZU1vZHVsZXM6IGNyZWF0ZVJTQ1JvdXRlTW9kdWxlcyhwYXlsb2FkKVxuICB9O1xuICByZXR1cm4gLyogQF9fUFVSRV9fICovIFJlYWN0NC5jcmVhdGVFbGVtZW50KFJTQ1JvdXRlckNvbnRleHQuUHJvdmlkZXIsIHsgdmFsdWU6IHRydWUgfSwgLyogQF9fUFVSRV9fICovIFJlYWN0NC5jcmVhdGVFbGVtZW50KFJTQ1JvdXRlckdsb2JhbEVycm9yQm91bmRhcnksIHsgbG9jYXRpb246IHBheWxvYWQubG9jYXRpb24gfSwgLyogQF9fUFVSRV9fICovIFJlYWN0NC5jcmVhdGVFbGVtZW50KEZyYW1ld29ya0NvbnRleHQuUHJvdmlkZXIsIHsgdmFsdWU6IGZyYW1ld29ya0NvbnRleHQgfSwgLyogQF9fUFVSRV9fICovIFJlYWN0NC5jcmVhdGVFbGVtZW50KFxuICAgIFN0YXRpY1JvdXRlclByb3ZpZGVyLFxuICAgIHtcbiAgICAgIGNvbnRleHQsXG4gICAgICByb3V0ZXIsXG4gICAgICBoeWRyYXRlOiBmYWxzZSxcbiAgICAgIG5vbmNlOiBwYXlsb2FkLm5vbmNlXG4gICAgfVxuICApKSkpO1xufVxuZnVuY3Rpb24gaXNSZWFjdFNlcnZlclJlcXVlc3QodXJsKSB7XG4gIHJldHVybiB1cmwucGF0aG5hbWUuZW5kc1dpdGgoXCIucnNjXCIpO1xufVxuZnVuY3Rpb24gaXNNYW5pZmVzdFJlcXVlc3QodXJsKSB7XG4gIHJldHVybiB1cmwucGF0aG5hbWUuZW5kc1dpdGgoXCIubWFuaWZlc3RcIik7XG59XG5cbi8vIGxpYi9kb20vc3NyL2Vycm9ycy50c1xuZnVuY3Rpb24gZGVzZXJpYWxpemVFcnJvcnMoZXJyb3JzKSB7XG4gIGlmICghZXJyb3JzKSByZXR1cm4gbnVsbDtcbiAgbGV0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyhlcnJvcnMpO1xuICBsZXQgc2VyaWFsaXplZCA9IHt9O1xuICBmb3IgKGxldCBba2V5LCB2YWxdIG9mIGVudHJpZXMpIHtcbiAgICBpZiAodmFsICYmIHZhbC5fX3R5cGUgPT09IFwiUm91dGVFcnJvclJlc3BvbnNlXCIpIHtcbiAgICAgIHNlcmlhbGl6ZWRba2V5XSA9IG5ldyBFcnJvclJlc3BvbnNlSW1wbChcbiAgICAgICAgdmFsLnN0YXR1cyxcbiAgICAgICAgdmFsLnN0YXR1c1RleHQsXG4gICAgICAgIHZhbC5kYXRhLFxuICAgICAgICB2YWwuaW50ZXJuYWwgPT09IHRydWVcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmICh2YWwgJiYgdmFsLl9fdHlwZSA9PT0gXCJFcnJvclwiKSB7XG4gICAgICBpZiAodmFsLl9fc3ViVHlwZSkge1xuICAgICAgICBsZXQgRXJyb3JDb25zdHJ1Y3RvciA9IHdpbmRvd1t2YWwuX19zdWJUeXBlXTtcbiAgICAgICAgaWYgKHR5cGVvZiBFcnJvckNvbnN0cnVjdG9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IGVycm9yID0gbmV3IEVycm9yQ29uc3RydWN0b3IodmFsLm1lc3NhZ2UpO1xuICAgICAgICAgICAgZXJyb3Iuc3RhY2sgPSB2YWwuc3RhY2s7XG4gICAgICAgICAgICBzZXJpYWxpemVkW2tleV0gPSBlcnJvcjtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc2VyaWFsaXplZFtrZXldID09IG51bGwpIHtcbiAgICAgICAgbGV0IGVycm9yID0gbmV3IEVycm9yKHZhbC5tZXNzYWdlKTtcbiAgICAgICAgZXJyb3Iuc3RhY2sgPSB2YWwuc3RhY2s7XG4gICAgICAgIHNlcmlhbGl6ZWRba2V5XSA9IGVycm9yO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzZXJpYWxpemVkW2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG4gIHJldHVybiBzZXJpYWxpemVkO1xufVxuXG4vLyBsaWIvZG9tL3Nzci9oeWRyYXRpb24udHN4XG5mdW5jdGlvbiBnZXRIeWRyYXRpb25EYXRhKHtcbiAgc3RhdGUsXG4gIHJvdXRlcyxcbiAgZ2V0Um91dGVJbmZvLFxuICBsb2NhdGlvbixcbiAgYmFzZW5hbWUsXG4gIGlzU3BhTW9kZVxufSkge1xuICBsZXQgaHlkcmF0aW9uRGF0YSA9IHtcbiAgICAuLi5zdGF0ZSxcbiAgICBsb2FkZXJEYXRhOiB7IC4uLnN0YXRlLmxvYWRlckRhdGEgfVxuICB9O1xuICBsZXQgaW5pdGlhbE1hdGNoZXMgPSBtYXRjaFJvdXRlcyhyb3V0ZXMsIGxvY2F0aW9uLCBiYXNlbmFtZSk7XG4gIGlmIChpbml0aWFsTWF0Y2hlcykge1xuICAgIGZvciAobGV0IG1hdGNoIG9mIGluaXRpYWxNYXRjaGVzKSB7XG4gICAgICBsZXQgcm91dGVJZCA9IG1hdGNoLnJvdXRlLmlkO1xuICAgICAgbGV0IHJvdXRlSW5mbyA9IGdldFJvdXRlSW5mbyhyb3V0ZUlkKTtcbiAgICAgIGlmIChzaG91bGRIeWRyYXRlUm91dGVMb2FkZXIoXG4gICAgICAgIHJvdXRlSWQsXG4gICAgICAgIHJvdXRlSW5mby5jbGllbnRMb2FkZXIsXG4gICAgICAgIHJvdXRlSW5mby5oYXNMb2FkZXIsXG4gICAgICAgIGlzU3BhTW9kZVxuICAgICAgKSAmJiAocm91dGVJbmZvLmhhc0h5ZHJhdGVGYWxsYmFjayB8fCAhcm91dGVJbmZvLmhhc0xvYWRlcikpIHtcbiAgICAgICAgZGVsZXRlIGh5ZHJhdGlvbkRhdGEubG9hZGVyRGF0YVtyb3V0ZUlkXTtcbiAgICAgIH0gZWxzZSBpZiAoIXJvdXRlSW5mby5oYXNMb2FkZXIpIHtcbiAgICAgICAgaHlkcmF0aW9uRGF0YS5sb2FkZXJEYXRhW3JvdXRlSWRdID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGh5ZHJhdGlvbkRhdGE7XG59XG5cbmV4cG9ydCB7XG4gIFNlcnZlclJvdXRlcixcbiAgY3JlYXRlUm91dGVzU3R1YixcbiAgY3JlYXRlQ29va2llLFxuICBpc0Nvb2tpZSxcbiAgU2VydmVyTW9kZSxcbiAgc2V0RGV2U2VydmVySG9va3MsXG4gIGNyZWF0ZVJlcXVlc3RIYW5kbGVyLFxuICBjcmVhdGVTZXNzaW9uLFxuICBpc1Nlc3Npb24sXG4gIGNyZWF0ZVNlc3Npb25TdG9yYWdlLFxuICBjcmVhdGVDb29raWVTZXNzaW9uU3RvcmFnZSxcbiAgY3JlYXRlTWVtb3J5U2Vzc2lvblN0b3JhZ2UsXG4gIGhyZWYsXG4gIFJTQ1JvdXRlckdsb2JhbEVycm9yQm91bmRhcnksXG4gIFJTQ0RlZmF1bHRSb290RXJyb3JCb3VuZGFyeSxcbiAgcG9wdWxhdGVSU0NSb3V0ZU1vZHVsZXMsXG4gIHJvdXRlUlNDU2VydmVyUmVxdWVzdCxcbiAgUlNDU3RhdGljUm91dGVyLFxuICBkZXNlcmlhbGl6ZUVycm9ycyxcbiAgZ2V0SHlkcmF0aW9uRGF0YVxufTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==