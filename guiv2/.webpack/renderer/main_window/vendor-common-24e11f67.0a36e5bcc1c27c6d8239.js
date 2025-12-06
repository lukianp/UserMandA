"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[1818],{

/***/ 8915:
/***/ ((__unused_webpack___webpack_module__, __unused_webpack___webpack_exports__, __webpack_require__) => {


// UNUSED EXPORTS: geoAlbers, geoAlbersUsa, geoArea, geoAzimuthalEqualArea, geoAzimuthalEqualAreaRaw, geoAzimuthalEquidistant, geoAzimuthalEquidistantRaw, geoBounds, geoCentroid, geoCircle, geoClipAntimeridian, geoClipCircle, geoClipExtent, geoClipRectangle, geoConicConformal, geoConicConformalRaw, geoConicEqualArea, geoConicEqualAreaRaw, geoConicEquidistant, geoConicEquidistantRaw, geoContains, geoDistance, geoEqualEarth, geoEqualEarthRaw, geoEquirectangular, geoEquirectangularRaw, geoGnomonic, geoGnomonicRaw, geoGraticule, geoGraticule10, geoIdentity, geoInterpolate, geoLength, geoMercator, geoMercatorRaw, geoNaturalEarth1, geoNaturalEarth1Raw, geoOrthographic, geoOrthographicRaw, geoPath, geoProjection, geoProjectionMutator, geoRotation, geoStereographic, geoStereographicRaw, geoStream, geoTransform, geoTransverseMercator, geoTransverseMercatorRaw

// EXTERNAL MODULE: ./node_modules/d3-array/src/index.js + 60 modules
var src = __webpack_require__(3398);
;// ./node_modules/d3-geo/src/math.js
var math_epsilon = 1e-6;
var math_epsilon2 = 1e-12;
var math_pi = Math.PI;
var math_halfPi = math_pi / 2;
var quarterPi = math_pi / 4;
var math_tau = math_pi * 2;

var math_degrees = 180 / math_pi;
var math_radians = math_pi / 180;

var math_abs = Math.abs;
var math_atan = Math.atan;
var math_atan2 = Math.atan2;
var math_cos = Math.cos;
var math_ceil = Math.ceil;
var exp = Math.exp;
var floor = Math.floor;
var math_hypot = Math.hypot;
var math_log = Math.log;
var math_pow = Math.pow;
var math_sin = Math.sin;
var math_sign = Math.sign || function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
var math_sqrt = Math.sqrt;
var math_tan = Math.tan;

function math_acos(x) {
  return x > 1 ? 0 : x < -1 ? math_pi : Math.acos(x);
}

function math_asin(x) {
  return x > 1 ? math_halfPi : x < -1 ? -math_halfPi : Math.asin(x);
}

function math_haversin(x) {
  return (x = math_sin(x / 2)) * x;
}

;// ./node_modules/d3-geo/src/noop.js
function noop() {}

;// ./node_modules/d3-geo/src/stream.js
function streamGeometry(geometry, stream) {
  if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
    streamGeometryType[geometry.type](geometry, stream);
  }
}

var streamObjectType = {
  Feature: function(object, stream) {
    streamGeometry(object.geometry, stream);
  },
  FeatureCollection: function(object, stream) {
    var features = object.features, i = -1, n = features.length;
    while (++i < n) streamGeometry(features[i].geometry, stream);
  }
};

var streamGeometryType = {
  Sphere: function(object, stream) {
    stream.sphere();
  },
  Point: function(object, stream) {
    object = object.coordinates;
    stream.point(object[0], object[1], object[2]);
  },
  MultiPoint: function(object, stream) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
  },
  LineString: function(object, stream) {
    streamLine(object.coordinates, stream, 0);
  },
  MultiLineString: function(object, stream) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) streamLine(coordinates[i], stream, 0);
  },
  Polygon: function(object, stream) {
    streamPolygon(object.coordinates, stream);
  },
  MultiPolygon: function(object, stream) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) streamPolygon(coordinates[i], stream);
  },
  GeometryCollection: function(object, stream) {
    var geometries = object.geometries, i = -1, n = geometries.length;
    while (++i < n) streamGeometry(geometries[i], stream);
  }
};

function streamLine(coordinates, stream, closed) {
  var i = -1, n = coordinates.length - closed, coordinate;
  stream.lineStart();
  while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
  stream.lineEnd();
}

function streamPolygon(coordinates, stream) {
  var i = -1, n = coordinates.length;
  stream.polygonStart();
  while (++i < n) streamLine(coordinates[i], stream, 1);
  stream.polygonEnd();
}

/* harmony default export */ function src_stream(object, stream) {
  if (object && streamObjectType.hasOwnProperty(object.type)) {
    streamObjectType[object.type](object, stream);
  } else {
    streamGeometry(object, stream);
  }
}

;// ./node_modules/d3-geo/src/area.js





var areaRingSum = new src/* Adder */.ph();

// hello?

var areaSum = new src/* Adder */.ph(),
    lambda00,
    phi00,
    lambda0,
    cosPhi0,
    sinPhi0;

var areaStream = {
  point: noop,
  lineStart: noop,
  lineEnd: noop,
  polygonStart: function() {
    areaRingSum = new src/* Adder */.ph();
    areaStream.lineStart = areaRingStart;
    areaStream.lineEnd = areaRingEnd;
  },
  polygonEnd: function() {
    var areaRing = +areaRingSum;
    areaSum.add(areaRing < 0 ? math_tau + areaRing : areaRing);
    this.lineStart = this.lineEnd = this.point = noop;
  },
  sphere: function() {
    areaSum.add(math_tau);
  }
};

function areaRingStart() {
  areaStream.point = areaPointFirst;
}

function areaRingEnd() {
  areaPoint(lambda00, phi00);
}

function areaPointFirst(lambda, phi) {
  areaStream.point = areaPoint;
  lambda00 = lambda, phi00 = phi;
  lambda *= math_radians, phi *= math_radians;
  lambda0 = lambda, cosPhi0 = math_cos(phi = phi / 2 + quarterPi), sinPhi0 = math_sin(phi);
}

function areaPoint(lambda, phi) {
  lambda *= math_radians, phi *= math_radians;
  phi = phi / 2 + quarterPi; // half the angular distance from south pole

  // Spherical excess E for a spherical triangle with vertices: south pole,
  // previous point, current point.  Uses a formula derived from Cagnoli’s
  // theorem.  See Todhunter, Spherical Trig. (1871), Sec. 103, Eq. (2).
  var dLambda = lambda - lambda0,
      sdLambda = dLambda >= 0 ? 1 : -1,
      adLambda = sdLambda * dLambda,
      cosPhi = math_cos(phi),
      sinPhi = math_sin(phi),
      k = sinPhi0 * sinPhi,
      u = cosPhi0 * cosPhi + k * math_cos(adLambda),
      v = k * sdLambda * math_sin(adLambda);
  areaRingSum.add(math_atan2(v, u));

  // Advance the previous points.
  lambda0 = lambda, cosPhi0 = cosPhi, sinPhi0 = sinPhi;
}

/* harmony default export */ function src_area(object) {
  areaSum = new Adder();
  stream(object, areaStream);
  return areaSum * 2;
}

;// ./node_modules/d3-geo/src/cartesian.js


function cartesian_spherical(cartesian) {
  return [math_atan2(cartesian[1], cartesian[0]), math_asin(cartesian[2])];
}

function cartesian_cartesian(spherical) {
  var lambda = spherical[0], phi = spherical[1], cosPhi = math_cos(phi);
  return [cosPhi * math_cos(lambda), cosPhi * math_sin(lambda), math_sin(phi)];
}

function cartesian_cartesianDot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cartesian_cartesianCross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

// TODO return a
function cartesian_cartesianAddInPlace(a, b) {
  a[0] += b[0], a[1] += b[1], a[2] += b[2];
}

function cartesian_cartesianScale(vector, k) {
  return [vector[0] * k, vector[1] * k, vector[2] * k];
}

// TODO return d
function cartesian_cartesianNormalizeInPlace(d) {
  var l = math_sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
  d[0] /= l, d[1] /= l, d[2] /= l;
}

;// ./node_modules/d3-geo/src/bounds.js






var bounds_lambda0, phi0, lambda1, phi1, // bounds
    lambda2, // previous lambda-coordinate
    bounds_lambda00, bounds_phi00, // first point
    p0, // previous 3D point
    deltaSum,
    ranges,
    bounds_range;

var bounds_boundsStream = {
  point: boundsPoint,
  lineStart: boundsLineStart,
  lineEnd: boundsLineEnd,
  polygonStart: function() {
    bounds_boundsStream.point = boundsRingPoint;
    bounds_boundsStream.lineStart = boundsRingStart;
    bounds_boundsStream.lineEnd = boundsRingEnd;
    deltaSum = new src/* Adder */.ph();
    areaStream.polygonStart();
  },
  polygonEnd: function() {
    areaStream.polygonEnd();
    bounds_boundsStream.point = boundsPoint;
    bounds_boundsStream.lineStart = boundsLineStart;
    bounds_boundsStream.lineEnd = boundsLineEnd;
    if (areaRingSum < 0) bounds_lambda0 = -(lambda1 = 180), phi0 = -(phi1 = 90);
    else if (deltaSum > math_epsilon) phi1 = 90;
    else if (deltaSum < -math_epsilon) phi0 = -90;
    bounds_range[0] = bounds_lambda0, bounds_range[1] = lambda1;
  },
  sphere: function() {
    bounds_lambda0 = -(lambda1 = 180), phi0 = -(phi1 = 90);
  }
};

function boundsPoint(lambda, phi) {
  ranges.push(bounds_range = [bounds_lambda0 = lambda, lambda1 = lambda]);
  if (phi < phi0) phi0 = phi;
  if (phi > phi1) phi1 = phi;
}

function linePoint(lambda, phi) {
  var p = cartesian_cartesian([lambda * math_radians, phi * math_radians]);
  if (p0) {
    var normal = cartesian_cartesianCross(p0, p),
        equatorial = [normal[1], -normal[0], 0],
        inflection = cartesian_cartesianCross(equatorial, normal);
    cartesian_cartesianNormalizeInPlace(inflection);
    inflection = cartesian_spherical(inflection);
    var delta = lambda - lambda2,
        sign = delta > 0 ? 1 : -1,
        lambdai = inflection[0] * math_degrees * sign,
        phii,
        antimeridian = math_abs(delta) > 180;
    if (antimeridian ^ (sign * lambda2 < lambdai && lambdai < sign * lambda)) {
      phii = inflection[1] * math_degrees;
      if (phii > phi1) phi1 = phii;
    } else if (lambdai = (lambdai + 360) % 360 - 180, antimeridian ^ (sign * lambda2 < lambdai && lambdai < sign * lambda)) {
      phii = -inflection[1] * math_degrees;
      if (phii < phi0) phi0 = phii;
    } else {
      if (phi < phi0) phi0 = phi;
      if (phi > phi1) phi1 = phi;
    }
    if (antimeridian) {
      if (lambda < lambda2) {
        if (angle(bounds_lambda0, lambda) > angle(bounds_lambda0, lambda1)) lambda1 = lambda;
      } else {
        if (angle(lambda, lambda1) > angle(bounds_lambda0, lambda1)) bounds_lambda0 = lambda;
      }
    } else {
      if (lambda1 >= bounds_lambda0) {
        if (lambda < bounds_lambda0) bounds_lambda0 = lambda;
        if (lambda > lambda1) lambda1 = lambda;
      } else {
        if (lambda > lambda2) {
          if (angle(bounds_lambda0, lambda) > angle(bounds_lambda0, lambda1)) lambda1 = lambda;
        } else {
          if (angle(lambda, lambda1) > angle(bounds_lambda0, lambda1)) bounds_lambda0 = lambda;
        }
      }
    }
  } else {
    ranges.push(bounds_range = [bounds_lambda0 = lambda, lambda1 = lambda]);
  }
  if (phi < phi0) phi0 = phi;
  if (phi > phi1) phi1 = phi;
  p0 = p, lambda2 = lambda;
}

function boundsLineStart() {
  bounds_boundsStream.point = linePoint;
}

function boundsLineEnd() {
  bounds_range[0] = bounds_lambda0, bounds_range[1] = lambda1;
  bounds_boundsStream.point = boundsPoint;
  p0 = null;
}

function boundsRingPoint(lambda, phi) {
  if (p0) {
    var delta = lambda - lambda2;
    deltaSum.add(math_abs(delta) > 180 ? delta + (delta > 0 ? 360 : -360) : delta);
  } else {
    bounds_lambda00 = lambda, bounds_phi00 = phi;
  }
  areaStream.point(lambda, phi);
  linePoint(lambda, phi);
}

function boundsRingStart() {
  areaStream.lineStart();
}

function boundsRingEnd() {
  boundsRingPoint(bounds_lambda00, bounds_phi00);
  areaStream.lineEnd();
  if (math_abs(deltaSum) > math_epsilon) bounds_lambda0 = -(lambda1 = 180);
  bounds_range[0] = bounds_lambda0, bounds_range[1] = lambda1;
  p0 = null;
}

// Finds the left-right distance between two longitudes.
// This is almost the same as (lambda1 - lambda0 + 360°) % 360°, except that we want
// the distance between ±180° to be 360°.
function angle(lambda0, lambda1) {
  return (lambda1 -= lambda0) < 0 ? lambda1 + 360 : lambda1;
}

function rangeCompare(a, b) {
  return a[0] - b[0];
}

function rangeContains(range, x) {
  return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x;
}

/* harmony default export */ function bounds(feature) {
  var i, n, a, b, merged, deltaMax, delta;

  phi1 = lambda1 = -(bounds_lambda0 = phi0 = Infinity);
  ranges = [];
  stream(feature, bounds_boundsStream);

  // First, sort ranges by their minimum longitudes.
  if (n = ranges.length) {
    ranges.sort(rangeCompare);

    // Then, merge any ranges that overlap.
    for (i = 1, a = ranges[0], merged = [a]; i < n; ++i) {
      b = ranges[i];
      if (rangeContains(a, b[0]) || rangeContains(a, b[1])) {
        if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1];
        if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0];
      } else {
        merged.push(a = b);
      }
    }

    // Finally, find the largest gap between the merged ranges.
    // The final bounding box will be the inverse of this gap.
    for (deltaMax = -Infinity, n = merged.length - 1, i = 0, a = merged[n]; i <= n; a = b, ++i) {
      b = merged[i];
      if ((delta = angle(a[1], b[0])) > deltaMax) deltaMax = delta, bounds_lambda0 = b[0], lambda1 = a[1];
    }
  }

  ranges = bounds_range = null;

  return bounds_lambda0 === Infinity || phi0 === Infinity
      ? [[NaN, NaN], [NaN, NaN]]
      : [[bounds_lambda0, phi0], [lambda1, phi1]];
}

;// ./node_modules/d3-geo/src/centroid.js





var W0, W1,
    X0, Y0, Z0,
    X1, Y1, Z1,
    X2, Y2, Z2,
    centroid_lambda00, centroid_phi00, // first point
    x0, y0, z0; // previous point

var centroidStream = {
  sphere: noop,
  point: centroidPoint,
  lineStart: centroidLineStart,
  lineEnd: centroidLineEnd,
  polygonStart: function() {
    centroidStream.lineStart = centroidRingStart;
    centroidStream.lineEnd = centroidRingEnd;
  },
  polygonEnd: function() {
    centroidStream.lineStart = centroidLineStart;
    centroidStream.lineEnd = centroidLineEnd;
  }
};

// Arithmetic mean of Cartesian vectors.
function centroidPoint(lambda, phi) {
  lambda *= math_radians, phi *= math_radians;
  var cosPhi = math_cos(phi);
  centroidPointCartesian(cosPhi * math_cos(lambda), cosPhi * math_sin(lambda), math_sin(phi));
}

function centroidPointCartesian(x, y, z) {
  ++W0;
  X0 += (x - X0) / W0;
  Y0 += (y - Y0) / W0;
  Z0 += (z - Z0) / W0;
}

function centroidLineStart() {
  centroidStream.point = centroidLinePointFirst;
}

function centroidLinePointFirst(lambda, phi) {
  lambda *= math_radians, phi *= math_radians;
  var cosPhi = math_cos(phi);
  x0 = cosPhi * math_cos(lambda);
  y0 = cosPhi * math_sin(lambda);
  z0 = math_sin(phi);
  centroidStream.point = centroidLinePoint;
  centroidPointCartesian(x0, y0, z0);
}

function centroidLinePoint(lambda, phi) {
  lambda *= math_radians, phi *= math_radians;
  var cosPhi = math_cos(phi),
      x = cosPhi * math_cos(lambda),
      y = cosPhi * math_sin(lambda),
      z = math_sin(phi),
      w = math_atan2(math_sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
  W1 += w;
  X1 += w * (x0 + (x0 = x));
  Y1 += w * (y0 + (y0 = y));
  Z1 += w * (z0 + (z0 = z));
  centroidPointCartesian(x0, y0, z0);
}

function centroidLineEnd() {
  centroidStream.point = centroidPoint;
}

// See J. E. Brock, The Inertia Tensor for a Spherical Triangle,
// J. Applied Mechanics 42, 239 (1975).
function centroidRingStart() {
  centroidStream.point = centroidRingPointFirst;
}

function centroidRingEnd() {
  centroidRingPoint(centroid_lambda00, centroid_phi00);
  centroidStream.point = centroidPoint;
}

function centroidRingPointFirst(lambda, phi) {
  centroid_lambda00 = lambda, centroid_phi00 = phi;
  lambda *= math_radians, phi *= math_radians;
  centroidStream.point = centroidRingPoint;
  var cosPhi = math_cos(phi);
  x0 = cosPhi * math_cos(lambda);
  y0 = cosPhi * math_sin(lambda);
  z0 = math_sin(phi);
  centroidPointCartesian(x0, y0, z0);
}

function centroidRingPoint(lambda, phi) {
  lambda *= math_radians, phi *= math_radians;
  var cosPhi = math_cos(phi),
      x = cosPhi * math_cos(lambda),
      y = cosPhi * math_sin(lambda),
      z = math_sin(phi),
      cx = y0 * z - z0 * y,
      cy = z0 * x - x0 * z,
      cz = x0 * y - y0 * x,
      m = math_hypot(cx, cy, cz),
      w = math_asin(m), // line weight = angle
      v = m && -w / m; // area weight multiplier
  X2.add(v * cx);
  Y2.add(v * cy);
  Z2.add(v * cz);
  W1 += w;
  X1 += w * (x0 + (x0 = x));
  Y1 += w * (y0 + (y0 = y));
  Z1 += w * (z0 + (z0 = z));
  centroidPointCartesian(x0, y0, z0);
}

/* harmony default export */ function centroid(object) {
  W0 = W1 =
  X0 = Y0 = Z0 =
  X1 = Y1 = Z1 = 0;
  X2 = new Adder();
  Y2 = new Adder();
  Z2 = new Adder();
  stream(object, centroidStream);

  var x = +X2,
      y = +Y2,
      z = +Z2,
      m = hypot(x, y, z);

  // If the area-weighted ccentroid is undefined, fall back to length-weighted ccentroid.
  if (m < epsilon2) {
    x = X1, y = Y1, z = Z1;
    // If the feature has zero length, fall back to arithmetic mean of point vectors.
    if (W1 < epsilon) x = X0, y = Y0, z = Z0;
    m = hypot(x, y, z);
    // If the feature still has an undefined ccentroid, then return.
    if (m < epsilon2) return [NaN, NaN];
  }

  return [atan2(y, x) * degrees, asin(z / m) * degrees];
}

;// ./node_modules/d3-geo/src/constant.js
/* harmony default export */ function src_constant(x) {
  return function() {
    return x;
  };
}

;// ./node_modules/d3-geo/src/compose.js
/* harmony default export */ function src_compose(a, b) {

  function compose(x, y) {
    return x = a(x, y), b(x[0], x[1]);
  }

  if (a.invert && b.invert) compose.invert = function(x, y) {
    return x = b.invert(x, y), x && a.invert(x[0], x[1]);
  };

  return compose;
}

;// ./node_modules/d3-geo/src/rotation.js



function rotationIdentity(lambda, phi) {
  if (math_abs(lambda) > math_pi) lambda -= Math.round(lambda / math_tau) * math_tau;
  return [lambda, phi];
}

rotationIdentity.invert = rotationIdentity;

function rotation_rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
  return (deltaLambda %= tau) ? (deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma))
    : rotationLambda(deltaLambda))
    : (deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma)
    : rotationIdentity);
}

function forwardRotationLambda(deltaLambda) {
  return function(lambda, phi) {
    lambda += deltaLambda;
    if (abs(lambda) > pi) lambda -= Math.round(lambda / tau) * tau;
    return [lambda, phi];
  };
}

function rotationLambda(deltaLambda) {
  var rotation = forwardRotationLambda(deltaLambda);
  rotation.invert = forwardRotationLambda(-deltaLambda);
  return rotation;
}

function rotationPhiGamma(deltaPhi, deltaGamma) {
  var cosDeltaPhi = cos(deltaPhi),
      sinDeltaPhi = sin(deltaPhi),
      cosDeltaGamma = cos(deltaGamma),
      sinDeltaGamma = sin(deltaGamma);

  function rotation(lambda, phi) {
    var cosPhi = cos(phi),
        x = cos(lambda) * cosPhi,
        y = sin(lambda) * cosPhi,
        z = sin(phi),
        k = z * cosDeltaPhi + x * sinDeltaPhi;
    return [
      atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
      asin(k * cosDeltaGamma + y * sinDeltaGamma)
    ];
  }

  rotation.invert = function(lambda, phi) {
    var cosPhi = cos(phi),
        x = cos(lambda) * cosPhi,
        y = sin(lambda) * cosPhi,
        z = sin(phi),
        k = z * cosDeltaGamma - y * sinDeltaGamma;
    return [
      atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
      asin(k * cosDeltaPhi - x * sinDeltaPhi)
    ];
  };

  return rotation;
}

/* harmony default export */ function src_rotation(rotate) {
  rotate = rotation_rotateRadians(rotate[0] * radians, rotate[1] * radians, rotate.length > 2 ? rotate[2] * radians : 0);

  function forward(coordinates) {
    coordinates = rotate(coordinates[0] * radians, coordinates[1] * radians);
    return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
  }

  forward.invert = function(coordinates) {
    coordinates = rotate.invert(coordinates[0] * radians, coordinates[1] * radians);
    return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
  };

  return forward;
}

;// ./node_modules/d3-geo/src/circle.js





// Generates a circle centered at [0°, 0°], with a given radius and precision.
function circle_circleStream(stream, radius, delta, direction, t0, t1) {
  if (!delta) return;
  var cosRadius = cos(radius),
      sinRadius = sin(radius),
      step = direction * delta;
  if (t0 == null) {
    t0 = radius + direction * tau;
    t1 = radius - step / 2;
  } else {
    t0 = circleRadius(cosRadius, t0);
    t1 = circleRadius(cosRadius, t1);
    if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau;
  }
  for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
    point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
    stream.point(point[0], point[1]);
  }
}

// Returns the signed angle of a cartesian point relative to [cosRadius, 0, 0].
function circleRadius(cosRadius, point) {
  point = cartesian(point), point[0] -= cosRadius;
  cartesianNormalizeInPlace(point);
  var radius = acos(-point[1]);
  return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
}

/* harmony default export */ function circle() {
  var center = constant([0, 0]),
      radius = constant(90),
      precision = constant(2),
      ring,
      rotate,
      stream = {point: point};

  function point(x, y) {
    ring.push(x = rotate(x, y));
    x[0] *= degrees, x[1] *= degrees;
  }

  function circle() {
    var c = center.apply(this, arguments),
        r = radius.apply(this, arguments) * radians,
        p = precision.apply(this, arguments) * radians;
    ring = [];
    rotate = rotateRadians(-c[0] * radians, -c[1] * radians, 0).invert;
    circle_circleStream(stream, r, p, 1);
    c = {type: "Polygon", coordinates: [ring]};
    ring = rotate = null;
    return c;
  }

  circle.center = function(_) {
    return arguments.length ? (center = typeof _ === "function" ? _ : constant([+_[0], +_[1]]), circle) : center;
  };

  circle.radius = function(_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), circle) : radius;
  };

  circle.precision = function(_) {
    return arguments.length ? (precision = typeof _ === "function" ? _ : constant(+_), circle) : precision;
  };

  return circle;
}

;// ./node_modules/d3-geo/src/clip/buffer.js


/* harmony default export */ function buffer() {
  var lines = [],
      line;
  return {
    point: function(x, y, m) {
      line.push([x, y, m]);
    },
    lineStart: function() {
      lines.push(line = []);
    },
    lineEnd: noop,
    rejoin: function() {
      if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
    },
    result: function() {
      var result = lines;
      lines = [];
      line = null;
      return result;
    }
  };
}

;// ./node_modules/d3-geo/src/pointEqual.js


/* harmony default export */ function src_pointEqual(a, b) {
  return math_abs(a[0] - b[0]) < math_epsilon && math_abs(a[1] - b[1]) < math_epsilon;
}

;// ./node_modules/d3-geo/src/clip/rejoin.js



function Intersection(point, points, other, entry) {
  this.x = point;
  this.z = points;
  this.o = other; // another intersection
  this.e = entry; // is an entry?
  this.v = false; // visited
  this.n = this.p = null; // next & previous
}

// A generalized polygon clipping algorithm: given a polygon that has been cut
// into its visible line segments, and rejoins the segments by interpolating
// along the clip edge.
/* harmony default export */ function rejoin(segments, compareIntersection, startInside, interpolate, stream) {
  var subject = [],
      clip = [],
      i,
      n;

  segments.forEach(function(segment) {
    if ((n = segment.length - 1) <= 0) return;
    var n, p0 = segment[0], p1 = segment[n], x;

    if (src_pointEqual(p0, p1)) {
      if (!p0[2] && !p1[2]) {
        stream.lineStart();
        for (i = 0; i < n; ++i) stream.point((p0 = segment[i])[0], p0[1]);
        stream.lineEnd();
        return;
      }
      // handle degenerate cases by moving the point
      p1[0] += 2 * math_epsilon;
    }

    subject.push(x = new Intersection(p0, segment, null, true));
    clip.push(x.o = new Intersection(p0, null, x, false));
    subject.push(x = new Intersection(p1, segment, null, false));
    clip.push(x.o = new Intersection(p1, null, x, true));
  });

  if (!subject.length) return;

  clip.sort(compareIntersection);
  rejoin_link(subject);
  rejoin_link(clip);

  for (i = 0, n = clip.length; i < n; ++i) {
    clip[i].e = startInside = !startInside;
  }

  var start = subject[0],
      points,
      point;

  while (1) {
    // Find first unvisited intersection.
    var current = start,
        isSubject = true;
    while (current.v) if ((current = current.n) === start) return;
    points = current.z;
    stream.lineStart();
    do {
      current.v = current.o.v = true;
      if (current.e) {
        if (isSubject) {
          for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
        } else {
          interpolate(current.x, current.n.x, 1, stream);
        }
        current = current.n;
      } else {
        if (isSubject) {
          points = current.p.z;
          for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
        } else {
          interpolate(current.x, current.p.x, -1, stream);
        }
        current = current.p;
      }
      current = current.o;
      points = current.z;
      isSubject = !isSubject;
    } while (!current.v);
    stream.lineEnd();
  }
}

function rejoin_link(array) {
  if (!(n = array.length)) return;
  var n,
      i = 0,
      a = array[0],
      b;
  while (++i < n) {
    a.n = b = array[i];
    b.p = a;
    a = b;
  }
  a.n = b = array[0];
  b.p = a;
}

;// ./node_modules/d3-geo/src/polygonContains.js




function longitude(point) {
  return math_abs(point[0]) <= math_pi ? point[0] : math_sign(point[0]) * ((math_abs(point[0]) + math_pi) % math_tau - math_pi);
}

/* harmony default export */ function polygonContains(polygon, point) {
  var lambda = longitude(point),
      phi = point[1],
      sinPhi = math_sin(phi),
      normal = [math_sin(lambda), -math_cos(lambda), 0],
      angle = 0,
      winding = 0;

  var sum = new src/* Adder */.ph();

  if (sinPhi === 1) phi = math_halfPi + math_epsilon;
  else if (sinPhi === -1) phi = -math_halfPi - math_epsilon;

  for (var i = 0, n = polygon.length; i < n; ++i) {
    if (!(m = (ring = polygon[i]).length)) continue;
    var ring,
        m,
        point0 = ring[m - 1],
        lambda0 = longitude(point0),
        phi0 = point0[1] / 2 + quarterPi,
        sinPhi0 = math_sin(phi0),
        cosPhi0 = math_cos(phi0);

    for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
      var point1 = ring[j],
          lambda1 = longitude(point1),
          phi1 = point1[1] / 2 + quarterPi,
          sinPhi1 = math_sin(phi1),
          cosPhi1 = math_cos(phi1),
          delta = lambda1 - lambda0,
          sign = delta >= 0 ? 1 : -1,
          absDelta = sign * delta,
          antimeridian = absDelta > math_pi,
          k = sinPhi0 * sinPhi1;

      sum.add(math_atan2(k * sign * math_sin(absDelta), cosPhi0 * cosPhi1 + k * math_cos(absDelta)));
      angle += antimeridian ? delta + sign * math_tau : delta;

      // Are the longitudes either side of the point’s meridian (lambda),
      // and are the latitudes smaller than the parallel (phi)?
      if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
        var arc = cartesian_cartesianCross(cartesian_cartesian(point0), cartesian_cartesian(point1));
        cartesian_cartesianNormalizeInPlace(arc);
        var intersection = cartesian_cartesianCross(normal, arc);
        cartesian_cartesianNormalizeInPlace(intersection);
        var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * math_asin(intersection[2]);
        if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
          winding += antimeridian ^ delta >= 0 ? 1 : -1;
        }
      }
    }
  }

  // First, determine whether the South pole is inside or outside:
  //
  // It is inside if:
  // * the polygon winds around it in a clockwise direction.
  // * the polygon does not (cumulatively) wind around it, but has a negative
  //   (counter-clockwise) area.
  //
  // Second, count the (signed) number of times a segment crosses a lambda
  // from the point to the South pole.  If it is zero, then the point is the
  // same side as the South pole.

  return (angle < -math_epsilon || angle < math_epsilon && sum < -math_epsilon2) ^ (winding & 1);
}

;// ./node_modules/d3-geo/src/clip/index.js






/* harmony default export */ function src_clip(pointVisible, clipLine, interpolate, start) {
  return function(sink) {
    var line = clipLine(sink),
        ringBuffer = buffer(),
        ringSink = clipLine(ringBuffer),
        polygonStarted = false,
        polygon,
        segments,
        ring;

    var clip = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: function() {
        clip.point = pointRing;
        clip.lineStart = ringStart;
        clip.lineEnd = ringEnd;
        segments = [];
        polygon = [];
      },
      polygonEnd: function() {
        clip.point = point;
        clip.lineStart = lineStart;
        clip.lineEnd = lineEnd;
        segments = (0,src/* merge */.Am)(segments);
        var startInside = polygonContains(polygon, start);
        if (segments.length) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          rejoin(segments, compareIntersection, startInside, interpolate, sink);
        } else if (startInside) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          sink.lineStart();
          interpolate(null, null, 1, sink);
          sink.lineEnd();
        }
        if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
        segments = polygon = null;
      },
      sphere: function() {
        sink.polygonStart();
        sink.lineStart();
        interpolate(null, null, 1, sink);
        sink.lineEnd();
        sink.polygonEnd();
      }
    };

    function point(lambda, phi) {
      if (pointVisible(lambda, phi)) sink.point(lambda, phi);
    }

    function pointLine(lambda, phi) {
      line.point(lambda, phi);
    }

    function lineStart() {
      clip.point = pointLine;
      line.lineStart();
    }

    function lineEnd() {
      clip.point = point;
      line.lineEnd();
    }

    function pointRing(lambda, phi) {
      ring.push([lambda, phi]);
      ringSink.point(lambda, phi);
    }

    function ringStart() {
      ringSink.lineStart();
      ring = [];
    }

    function ringEnd() {
      pointRing(ring[0][0], ring[0][1]);
      ringSink.lineEnd();

      var clean = ringSink.clean(),
          ringSegments = ringBuffer.result(),
          i, n = ringSegments.length, m,
          segment,
          point;

      ring.pop();
      polygon.push(ring);
      ring = null;

      if (!n) return;

      // No intersections.
      if (clean & 1) {
        segment = ringSegments[0];
        if ((m = segment.length - 1) > 0) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          sink.lineStart();
          for (i = 0; i < m; ++i) sink.point((point = segment[i])[0], point[1]);
          sink.lineEnd();
        }
        return;
      }

      // Rejoin connected segments.
      // TODO reuse ringBuffer.rejoin()?
      if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));

      segments.push(ringSegments.filter(validSegment));
    }

    return clip;
  };
}

function validSegment(segment) {
  return segment.length > 1;
}

// Intersections are sorted along the clip edge. For both antimeridian cutting
// and circle clipping, the same comparison is used.
function compareIntersection(a, b) {
  return ((a = a.x)[0] < 0 ? a[1] - math_halfPi - math_epsilon : math_halfPi - a[1])
       - ((b = b.x)[0] < 0 ? b[1] - math_halfPi - math_epsilon : math_halfPi - b[1]);
}

;// ./node_modules/d3-geo/src/clip/antimeridian.js



/* harmony default export */ const antimeridian = (src_clip(
  function() { return true; },
  clipAntimeridianLine,
  clipAntimeridianInterpolate,
  [-math_pi, -math_halfPi]
));

// Takes a line and cuts into visible segments. Return values: 0 - there were
// intersections or the line was empty; 1 - no intersections; 2 - there were
// intersections, and the first and last segments should be rejoined.
function clipAntimeridianLine(stream) {
  var lambda0 = NaN,
      phi0 = NaN,
      sign0 = NaN,
      clean; // no intersections

  return {
    lineStart: function() {
      stream.lineStart();
      clean = 1;
    },
    point: function(lambda1, phi1) {
      var sign1 = lambda1 > 0 ? math_pi : -math_pi,
          delta = math_abs(lambda1 - lambda0);
      if (math_abs(delta - math_pi) < math_epsilon) { // line crosses a pole
        stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? math_halfPi : -math_halfPi);
        stream.point(sign0, phi0);
        stream.lineEnd();
        stream.lineStart();
        stream.point(sign1, phi0);
        stream.point(lambda1, phi0);
        clean = 0;
      } else if (sign0 !== sign1 && delta >= math_pi) { // line crosses antimeridian
        if (math_abs(lambda0 - sign0) < math_epsilon) lambda0 -= sign0 * math_epsilon; // handle degeneracies
        if (math_abs(lambda1 - sign1) < math_epsilon) lambda1 -= sign1 * math_epsilon;
        phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
        stream.point(sign0, phi0);
        stream.lineEnd();
        stream.lineStart();
        stream.point(sign1, phi0);
        clean = 0;
      }
      stream.point(lambda0 = lambda1, phi0 = phi1);
      sign0 = sign1;
    },
    lineEnd: function() {
      stream.lineEnd();
      lambda0 = phi0 = NaN;
    },
    clean: function() {
      return 2 - clean; // if intersections, rejoin first and last segments
    }
  };
}

function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
  var cosPhi0,
      cosPhi1,
      sinLambda0Lambda1 = math_sin(lambda0 - lambda1);
  return math_abs(sinLambda0Lambda1) > math_epsilon
      ? math_atan((math_sin(phi0) * (cosPhi1 = math_cos(phi1)) * math_sin(lambda1)
          - math_sin(phi1) * (cosPhi0 = math_cos(phi0)) * math_sin(lambda0))
          / (cosPhi0 * cosPhi1 * sinLambda0Lambda1))
      : (phi0 + phi1) / 2;
}

function clipAntimeridianInterpolate(from, to, direction, stream) {
  var phi;
  if (from == null) {
    phi = direction * math_halfPi;
    stream.point(-math_pi, phi);
    stream.point(0, phi);
    stream.point(math_pi, phi);
    stream.point(math_pi, 0);
    stream.point(math_pi, -phi);
    stream.point(0, -phi);
    stream.point(-math_pi, -phi);
    stream.point(-math_pi, 0);
    stream.point(-math_pi, phi);
  } else if (math_abs(from[0] - to[0]) > math_epsilon) {
    var lambda = from[0] < to[0] ? math_pi : -math_pi;
    phi = direction * lambda / 2;
    stream.point(-lambda, phi);
    stream.point(0, phi);
    stream.point(lambda, phi);
  } else {
    stream.point(to[0], to[1]);
  }
}

;// ./node_modules/d3-geo/src/clip/circle.js






/* harmony default export */ function clip_circle(radius) {
  var cr = cos(radius),
      delta = 2 * radians,
      smallRadius = cr > 0,
      notHemisphere = abs(cr) > epsilon; // TODO optimise for this common case

  function interpolate(from, to, direction, stream) {
    circleStream(stream, radius, delta, direction, from, to);
  }

  function visible(lambda, phi) {
    return cos(lambda) * cos(phi) > cr;
  }

  // Takes a line and cuts into visible segments. Return values used for polygon
  // clipping: 0 - there were intersections or the line was empty; 1 - no
  // intersections 2 - there were intersections, and the first and last segments
  // should be rejoined.
  function clipLine(stream) {
    var point0, // previous point
        c0, // code for previous point
        v0, // visibility of previous point
        v00, // visibility of first point
        clean; // no intersections
    return {
      lineStart: function() {
        v00 = v0 = false;
        clean = 1;
      },
      point: function(lambda, phi) {
        var point1 = [lambda, phi],
            point2,
            v = visible(lambda, phi),
            c = smallRadius
              ? v ? 0 : code(lambda, phi)
              : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
        if (!point0 && (v00 = v0 = v)) stream.lineStart();
        if (v !== v0) {
          point2 = intersect(point0, point1);
          if (!point2 || pointEqual(point0, point2) || pointEqual(point1, point2))
            point1[2] = 1;
        }
        if (v !== v0) {
          clean = 0;
          if (v) {
            // outside going in
            stream.lineStart();
            point2 = intersect(point1, point0);
            stream.point(point2[0], point2[1]);
          } else {
            // inside going out
            point2 = intersect(point0, point1);
            stream.point(point2[0], point2[1], 2);
            stream.lineEnd();
          }
          point0 = point2;
        } else if (notHemisphere && point0 && smallRadius ^ v) {
          var t;
          // If the codes for two points are different, or are both zero,
          // and there this segment intersects with the small circle.
          if (!(c & c0) && (t = intersect(point1, point0, true))) {
            clean = 0;
            if (smallRadius) {
              stream.lineStart();
              stream.point(t[0][0], t[0][1]);
              stream.point(t[1][0], t[1][1]);
              stream.lineEnd();
            } else {
              stream.point(t[1][0], t[1][1]);
              stream.lineEnd();
              stream.lineStart();
              stream.point(t[0][0], t[0][1], 3);
            }
          }
        }
        if (v && (!point0 || !pointEqual(point0, point1))) {
          stream.point(point1[0], point1[1]);
        }
        point0 = point1, v0 = v, c0 = c;
      },
      lineEnd: function() {
        if (v0) stream.lineEnd();
        point0 = null;
      },
      // Rejoin first and last segments if there were intersections and the first
      // and last points were visible.
      clean: function() {
        return clean | ((v00 && v0) << 1);
      }
    };
  }

  // Intersects the great circle between a and b with the clip circle.
  function intersect(a, b, two) {
    var pa = cartesian(a),
        pb = cartesian(b);

    // We have two planes, n1.p = d1 and n2.p = d2.
    // Find intersection line p(t) = c1 n1 + c2 n2 + t (n1 ⨯ n2).
    var n1 = [1, 0, 0], // normal
        n2 = cartesianCross(pa, pb),
        n2n2 = cartesianDot(n2, n2),
        n1n2 = n2[0], // cartesianDot(n1, n2),
        determinant = n2n2 - n1n2 * n1n2;

    // Two polar points.
    if (!determinant) return !two && a;

    var c1 =  cr * n2n2 / determinant,
        c2 = -cr * n1n2 / determinant,
        n1xn2 = cartesianCross(n1, n2),
        A = cartesianScale(n1, c1),
        B = cartesianScale(n2, c2);
    cartesianAddInPlace(A, B);

    // Solve |p(t)|^2 = 1.
    var u = n1xn2,
        w = cartesianDot(A, u),
        uu = cartesianDot(u, u),
        t2 = w * w - uu * (cartesianDot(A, A) - 1);

    if (t2 < 0) return;

    var t = sqrt(t2),
        q = cartesianScale(u, (-w - t) / uu);
    cartesianAddInPlace(q, A);
    q = spherical(q);

    if (!two) return q;

    // Two intersection points.
    var lambda0 = a[0],
        lambda1 = b[0],
        phi0 = a[1],
        phi1 = b[1],
        z;

    if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z;

    var delta = lambda1 - lambda0,
        polar = abs(delta - pi) < epsilon,
        meridian = polar || delta < epsilon;

    if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;

    // Check that the first point is between a and b.
    if (meridian
        ? polar
          ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda0) < epsilon ? phi0 : phi1)
          : phi0 <= q[1] && q[1] <= phi1
        : delta > pi ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
      var q1 = cartesianScale(u, (-w + t) / uu);
      cartesianAddInPlace(q1, A);
      return [q, spherical(q1)];
    }
  }

  // Generates a 4-bit vector representing the location of a point relative to
  // the small circle's bounding box.
  function code(lambda, phi) {
    var r = smallRadius ? radius : pi - radius,
        code = 0;
    if (lambda < -r) code |= 1; // left
    else if (lambda > r) code |= 2; // right
    if (phi < -r) code |= 4; // below
    else if (phi > r) code |= 8; // above
    return code;
  }

  return clip(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi, radius - pi]);
}

;// ./node_modules/d3-geo/src/clip/line.js
/* harmony default export */ function line(a, b, x0, y0, x1, y1) {
  var ax = a[0],
      ay = a[1],
      bx = b[0],
      by = b[1],
      t0 = 0,
      t1 = 1,
      dx = bx - ax,
      dy = by - ay,
      r;

  r = x0 - ax;
  if (!dx && r > 0) return;
  r /= dx;
  if (dx < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dx > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }

  r = x1 - ax;
  if (!dx && r < 0) return;
  r /= dx;
  if (dx < 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  } else if (dx > 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  }

  r = y0 - ay;
  if (!dy && r > 0) return;
  r /= dy;
  if (dy < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dy > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }

  r = y1 - ay;
  if (!dy && r < 0) return;
  r /= dy;
  if (dy < 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  } else if (dy > 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  }

  if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
  if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
  return true;
}

;// ./node_modules/d3-geo/src/clip/rectangle.js






var clipMax = 1e9, clipMin = -clipMax;

// TODO Use d3-polygon’s polygonContains here for the ring check?
// TODO Eliminate duplicate buffering in clipBuffer and polygon.push?

function rectangle_clipRectangle(x0, y0, x1, y1) {

  function visible(x, y) {
    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
  }

  function interpolate(from, to, direction, stream) {
    var a = 0, a1 = 0;
    if (from == null
        || (a = corner(from, direction)) !== (a1 = corner(to, direction))
        || comparePoint(from, to) < 0 ^ direction > 0) {
      do stream.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
      while ((a = (a + direction + 4) % 4) !== a1);
    } else {
      stream.point(to[0], to[1]);
    }
  }

  function corner(p, direction) {
    return abs(p[0] - x0) < epsilon ? direction > 0 ? 0 : 3
        : abs(p[0] - x1) < epsilon ? direction > 0 ? 2 : 1
        : abs(p[1] - y0) < epsilon ? direction > 0 ? 1 : 0
        : direction > 0 ? 3 : 2; // abs(p[1] - y1) < epsilon
  }

  function compareIntersection(a, b) {
    return comparePoint(a.x, b.x);
  }

  function comparePoint(a, b) {
    var ca = corner(a, 1),
        cb = corner(b, 1);
    return ca !== cb ? ca - cb
        : ca === 0 ? b[1] - a[1]
        : ca === 1 ? a[0] - b[0]
        : ca === 2 ? a[1] - b[1]
        : b[0] - a[0];
  }

  return function(stream) {
    var activeStream = stream,
        bufferStream = clipBuffer(),
        segments,
        polygon,
        ring,
        x__, y__, v__, // first point
        x_, y_, v_, // previous point
        first,
        clean;

    var clipStream = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: polygonStart,
      polygonEnd: polygonEnd
    };

    function point(x, y) {
      if (visible(x, y)) activeStream.point(x, y);
    }

    function polygonInside() {
      var winding = 0;

      for (var i = 0, n = polygon.length; i < n; ++i) {
        for (var ring = polygon[i], j = 1, m = ring.length, point = ring[0], a0, a1, b0 = point[0], b1 = point[1]; j < m; ++j) {
          a0 = b0, a1 = b1, point = ring[j], b0 = point[0], b1 = point[1];
          if (a1 <= y1) { if (b1 > y1 && (b0 - a0) * (y1 - a1) > (b1 - a1) * (x0 - a0)) ++winding; }
          else { if (b1 <= y1 && (b0 - a0) * (y1 - a1) < (b1 - a1) * (x0 - a0)) --winding; }
        }
      }

      return winding;
    }

    // Buffer geometry within a polygon and then clip it en masse.
    function polygonStart() {
      activeStream = bufferStream, segments = [], polygon = [], clean = true;
    }

    function polygonEnd() {
      var startInside = polygonInside(),
          cleanInside = clean && startInside,
          visible = (segments = merge(segments)).length;
      if (cleanInside || visible) {
        stream.polygonStart();
        if (cleanInside) {
          stream.lineStart();
          interpolate(null, null, 1, stream);
          stream.lineEnd();
        }
        if (visible) {
          clipRejoin(segments, compareIntersection, startInside, interpolate, stream);
        }
        stream.polygonEnd();
      }
      activeStream = stream, segments = polygon = ring = null;
    }

    function lineStart() {
      clipStream.point = linePoint;
      if (polygon) polygon.push(ring = []);
      first = true;
      v_ = false;
      x_ = y_ = NaN;
    }

    // TODO rather than special-case polygons, simply handle them separately.
    // Ideally, coincident intersection points should be jittered to avoid
    // clipping issues.
    function lineEnd() {
      if (segments) {
        linePoint(x__, y__);
        if (v__ && v_) bufferStream.rejoin();
        segments.push(bufferStream.result());
      }
      clipStream.point = point;
      if (v_) activeStream.lineEnd();
    }

    function linePoint(x, y) {
      var v = visible(x, y);
      if (polygon) ring.push([x, y]);
      if (first) {
        x__ = x, y__ = y, v__ = v;
        first = false;
        if (v) {
          activeStream.lineStart();
          activeStream.point(x, y);
        }
      } else {
        if (v && v_) activeStream.point(x, y);
        else {
          var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))],
              b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
          if (clipLine(a, b, x0, y0, x1, y1)) {
            if (!v_) {
              activeStream.lineStart();
              activeStream.point(a[0], a[1]);
            }
            activeStream.point(b[0], b[1]);
            if (!v) activeStream.lineEnd();
            clean = false;
          } else if (v) {
            activeStream.lineStart();
            activeStream.point(x, y);
            clean = false;
          }
        }
      }
      x_ = x, y_ = y, v_ = v;
    }

    return clipStream;
  };
}

;// ./node_modules/d3-geo/src/clip/extent.js


/* harmony default export */ function extent() {
  var x0 = 0,
      y0 = 0,
      x1 = 960,
      y1 = 500,
      cache,
      cacheStream,
      clip;

  return clip = {
    stream: function(stream) {
      return cache && cacheStream === stream ? cache : cache = clipRectangle(x0, y0, x1, y1)(cacheStream = stream);
    },
    extent: function(_) {
      return arguments.length ? (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1], cache = cacheStream = null, clip) : [[x0, y0], [x1, y1]];
    }
  };
}

;// ./node_modules/d3-geo/src/length.js





var lengthSum,
    length_lambda0,
    length_sinPhi0,
    length_cosPhi0;

var lengthStream = {
  sphere: noop,
  point: noop,
  lineStart: lengthLineStart,
  lineEnd: noop,
  polygonStart: noop,
  polygonEnd: noop
};

function lengthLineStart() {
  lengthStream.point = lengthPointFirst;
  lengthStream.lineEnd = lengthLineEnd;
}

function lengthLineEnd() {
  lengthStream.point = lengthStream.lineEnd = noop;
}

function lengthPointFirst(lambda, phi) {
  lambda *= math_radians, phi *= math_radians;
  length_lambda0 = lambda, length_sinPhi0 = math_sin(phi), length_cosPhi0 = math_cos(phi);
  lengthStream.point = lengthPoint;
}

function lengthPoint(lambda, phi) {
  lambda *= math_radians, phi *= math_radians;
  var sinPhi = math_sin(phi),
      cosPhi = math_cos(phi),
      delta = math_abs(lambda - length_lambda0),
      cosDelta = math_cos(delta),
      sinDelta = math_sin(delta),
      x = cosPhi * sinDelta,
      y = length_cosPhi0 * sinPhi - length_sinPhi0 * cosPhi * cosDelta,
      z = length_sinPhi0 * sinPhi + length_cosPhi0 * cosPhi * cosDelta;
  lengthSum.add(math_atan2(math_sqrt(x * x + y * y), z));
  length_lambda0 = lambda, length_sinPhi0 = sinPhi, length_cosPhi0 = cosPhi;
}

/* harmony default export */ function src_length(object) {
  lengthSum = new src/* Adder */.ph();
  src_stream(object, lengthStream);
  return +lengthSum;
}

;// ./node_modules/d3-geo/src/distance.js


var coordinates = [null, null],
    object = {type: "LineString", coordinates: coordinates};

/* harmony default export */ function distance(a, b) {
  coordinates[0] = a;
  coordinates[1] = b;
  return src_length(object);
}

;// ./node_modules/d3-geo/src/contains.js




var containsObjectType = {
  Feature: function(object, point) {
    return containsGeometry(object.geometry, point);
  },
  FeatureCollection: function(object, point) {
    var features = object.features, i = -1, n = features.length;
    while (++i < n) if (containsGeometry(features[i].geometry, point)) return true;
    return false;
  }
};

var containsGeometryType = {
  Sphere: function() {
    return true;
  },
  Point: function(object, point) {
    return containsPoint(object.coordinates, point);
  },
  MultiPoint: function(object, point) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) if (containsPoint(coordinates[i], point)) return true;
    return false;
  },
  LineString: function(object, point) {
    return containsLine(object.coordinates, point);
  },
  MultiLineString: function(object, point) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) if (containsLine(coordinates[i], point)) return true;
    return false;
  },
  Polygon: function(object, point) {
    return containsPolygon(object.coordinates, point);
  },
  MultiPolygon: function(object, point) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) if (containsPolygon(coordinates[i], point)) return true;
    return false;
  },
  GeometryCollection: function(object, point) {
    var geometries = object.geometries, i = -1, n = geometries.length;
    while (++i < n) if (containsGeometry(geometries[i], point)) return true;
    return false;
  }
};

function containsGeometry(geometry, point) {
  return geometry && containsGeometryType.hasOwnProperty(geometry.type)
      ? containsGeometryType[geometry.type](geometry, point)
      : false;
}

function containsPoint(coordinates, point) {
  return distance(coordinates, point) === 0;
}

function containsLine(coordinates, point) {
  var ao, bo, ab;
  for (var i = 0, n = coordinates.length; i < n; i++) {
    bo = distance(coordinates[i], point);
    if (bo === 0) return true;
    if (i > 0) {
      ab = distance(coordinates[i], coordinates[i - 1]);
      if (
        ab > 0 &&
        ao <= ab &&
        bo <= ab &&
        (ao + bo - ab) * (1 - Math.pow((ao - bo) / ab, 2)) < math_epsilon2 * ab
      )
        return true;
    }
    ao = bo;
  }
  return false;
}

function containsPolygon(coordinates, point) {
  return !!polygonContains(coordinates.map(ringRadians), pointRadians(point));
}

function ringRadians(ring) {
  return ring = ring.map(pointRadians), ring.pop(), ring;
}

function pointRadians(point) {
  return [point[0] * math_radians, point[1] * math_radians];
}

/* harmony default export */ function contains(object, point) {
  return (object && containsObjectType.hasOwnProperty(object.type)
      ? containsObjectType[object.type]
      : containsGeometry)(object, point);
}

;// ./node_modules/d3-geo/src/graticule.js



function graticuleX(y0, y1, dy) {
  var y = range(y0, y1 - epsilon, dy).concat(y1);
  return function(x) { return y.map(function(y) { return [x, y]; }); };
}

function graticuleY(x0, x1, dx) {
  var x = range(x0, x1 - epsilon, dx).concat(x1);
  return function(y) { return x.map(function(x) { return [x, y]; }); };
}

function graticule() {
  var x1, x0, X1, X0,
      y1, y0, Y1, Y0,
      dx = 10, dy = dx, DX = 90, DY = 360,
      x, y, X, Y,
      precision = 2.5;

  function graticule() {
    return {type: "MultiLineString", coordinates: lines()};
  }

  function lines() {
    return range(ceil(X0 / DX) * DX, X1, DX).map(X)
        .concat(range(ceil(Y0 / DY) * DY, Y1, DY).map(Y))
        .concat(range(ceil(x0 / dx) * dx, x1, dx).filter(function(x) { return abs(x % DX) > epsilon; }).map(x))
        .concat(range(ceil(y0 / dy) * dy, y1, dy).filter(function(y) { return abs(y % DY) > epsilon; }).map(y));
  }

  graticule.lines = function() {
    return lines().map(function(coordinates) { return {type: "LineString", coordinates: coordinates}; });
  };

  graticule.outline = function() {
    return {
      type: "Polygon",
      coordinates: [
        X(X0).concat(
        Y(Y1).slice(1),
        X(X1).reverse().slice(1),
        Y(Y0).reverse().slice(1))
      ]
    };
  };

  graticule.extent = function(_) {
    if (!arguments.length) return graticule.extentMinor();
    return graticule.extentMajor(_).extentMinor(_);
  };

  graticule.extentMajor = function(_) {
    if (!arguments.length) return [[X0, Y0], [X1, Y1]];
    X0 = +_[0][0], X1 = +_[1][0];
    Y0 = +_[0][1], Y1 = +_[1][1];
    if (X0 > X1) _ = X0, X0 = X1, X1 = _;
    if (Y0 > Y1) _ = Y0, Y0 = Y1, Y1 = _;
    return graticule.precision(precision);
  };

  graticule.extentMinor = function(_) {
    if (!arguments.length) return [[x0, y0], [x1, y1]];
    x0 = +_[0][0], x1 = +_[1][0];
    y0 = +_[0][1], y1 = +_[1][1];
    if (x0 > x1) _ = x0, x0 = x1, x1 = _;
    if (y0 > y1) _ = y0, y0 = y1, y1 = _;
    return graticule.precision(precision);
  };

  graticule.step = function(_) {
    if (!arguments.length) return graticule.stepMinor();
    return graticule.stepMajor(_).stepMinor(_);
  };

  graticule.stepMajor = function(_) {
    if (!arguments.length) return [DX, DY];
    DX = +_[0], DY = +_[1];
    return graticule;
  };

  graticule.stepMinor = function(_) {
    if (!arguments.length) return [dx, dy];
    dx = +_[0], dy = +_[1];
    return graticule;
  };

  graticule.precision = function(_) {
    if (!arguments.length) return precision;
    precision = +_;
    x = graticuleX(y0, y1, 90);
    y = graticuleY(x0, x1, precision);
    X = graticuleX(Y0, Y1, 90);
    Y = graticuleY(X0, X1, precision);
    return graticule;
  };

  return graticule
      .extentMajor([[-180, -90 + epsilon], [180, 90 - epsilon]])
      .extentMinor([[-180, -80 - epsilon], [180, 80 + epsilon]]);
}

function graticule10() {
  return graticule()();
}

;// ./node_modules/d3-geo/src/interpolate.js


/* harmony default export */ function interpolate(a, b) {
  var x0 = a[0] * radians,
      y0 = a[1] * radians,
      x1 = b[0] * radians,
      y1 = b[1] * radians,
      cy0 = cos(y0),
      sy0 = sin(y0),
      cy1 = cos(y1),
      sy1 = sin(y1),
      kx0 = cy0 * cos(x0),
      ky0 = cy0 * sin(x0),
      kx1 = cy1 * cos(x1),
      ky1 = cy1 * sin(x1),
      d = 2 * asin(sqrt(haversin(y1 - y0) + cy0 * cy1 * haversin(x1 - x0))),
      k = sin(d);

  var interpolate = d ? function(t) {
    var B = sin(t *= d) / k,
        A = sin(d - t) / k,
        x = A * kx0 + B * kx1,
        y = A * ky0 + B * ky1,
        z = A * sy0 + B * sy1;
    return [
      atan2(y, x) * degrees,
      atan2(z, sqrt(x * x + y * y)) * degrees
    ];
  } : function() {
    return [x0 * degrees, y0 * degrees];
  };

  interpolate.distance = d;

  return interpolate;
}

;// ./node_modules/d3-geo/src/identity.js
/* harmony default export */ const src_identity = (x => x);

;// ./node_modules/d3-geo/src/path/area.js




var area_areaSum = new src/* Adder */.ph(),
    area_areaRingSum = new src/* Adder */.ph(),
    x00,
    y00,
    area_x0,
    area_y0;

var area_areaStream = {
  point: noop,
  lineStart: noop,
  lineEnd: noop,
  polygonStart: function() {
    area_areaStream.lineStart = area_areaRingStart;
    area_areaStream.lineEnd = area_areaRingEnd;
  },
  polygonEnd: function() {
    area_areaStream.lineStart = area_areaStream.lineEnd = area_areaStream.point = noop;
    area_areaSum.add(math_abs(area_areaRingSum));
    area_areaRingSum = new src/* Adder */.ph();
  },
  result: function() {
    var area = area_areaSum / 2;
    area_areaSum = new src/* Adder */.ph();
    return area;
  }
};

function area_areaRingStart() {
  area_areaStream.point = area_areaPointFirst;
}

function area_areaPointFirst(x, y) {
  area_areaStream.point = area_areaPoint;
  x00 = area_x0 = x, y00 = area_y0 = y;
}

function area_areaPoint(x, y) {
  area_areaRingSum.add(area_y0 * x - area_x0 * y);
  area_x0 = x, area_y0 = y;
}

function area_areaRingEnd() {
  area_areaPoint(x00, y00);
}

/* harmony default export */ const path_area = ((/* unused pure expression or super */ null && (area_areaStream)));

;// ./node_modules/d3-geo/src/path/bounds.js


var bounds_x0 = Infinity,
    bounds_y0 = bounds_x0,
    x1 = -bounds_x0,
    y1 = x1;

var path_bounds_boundsStream = {
  point: bounds_boundsPoint,
  lineStart: noop,
  lineEnd: noop,
  polygonStart: noop,
  polygonEnd: noop,
  result: function() {
    var bounds = [[bounds_x0, bounds_y0], [x1, y1]];
    x1 = y1 = -(bounds_y0 = bounds_x0 = Infinity);
    return bounds;
  }
};

function bounds_boundsPoint(x, y) {
  if (x < bounds_x0) bounds_x0 = x;
  if (x > x1) x1 = x;
  if (y < bounds_y0) bounds_y0 = y;
  if (y > y1) y1 = y;
}

/* harmony default export */ const path_bounds = ((/* unused pure expression or super */ null && (path_bounds_boundsStream)));

;// ./node_modules/d3-geo/src/path/centroid.js


// TODO Enforce positive area for exterior, negative area for interior?

var centroid_X0 = 0,
    centroid_Y0 = 0,
    centroid_Z0 = 0,
    centroid_X1 = 0,
    centroid_Y1 = 0,
    centroid_Z1 = 0,
    centroid_X2 = 0,
    centroid_Y2 = 0,
    centroid_Z2 = 0,
    centroid_x00,
    centroid_y00,
    centroid_x0,
    centroid_y0;

var centroid_centroidStream = {
  point: centroid_centroidPoint,
  lineStart: centroid_centroidLineStart,
  lineEnd: centroid_centroidLineEnd,
  polygonStart: function() {
    centroid_centroidStream.lineStart = centroid_centroidRingStart;
    centroid_centroidStream.lineEnd = centroid_centroidRingEnd;
  },
  polygonEnd: function() {
    centroid_centroidStream.point = centroid_centroidPoint;
    centroid_centroidStream.lineStart = centroid_centroidLineStart;
    centroid_centroidStream.lineEnd = centroid_centroidLineEnd;
  },
  result: function() {
    var centroid = centroid_Z2 ? [centroid_X2 / centroid_Z2, centroid_Y2 / centroid_Z2]
        : centroid_Z1 ? [centroid_X1 / centroid_Z1, centroid_Y1 / centroid_Z1]
        : centroid_Z0 ? [centroid_X0 / centroid_Z0, centroid_Y0 / centroid_Z0]
        : [NaN, NaN];
    centroid_X0 = centroid_Y0 = centroid_Z0 =
    centroid_X1 = centroid_Y1 = centroid_Z1 =
    centroid_X2 = centroid_Y2 = centroid_Z2 = 0;
    return centroid;
  }
};

function centroid_centroidPoint(x, y) {
  centroid_X0 += x;
  centroid_Y0 += y;
  ++centroid_Z0;
}

function centroid_centroidLineStart() {
  centroid_centroidStream.point = centroidPointFirstLine;
}

function centroidPointFirstLine(x, y) {
  centroid_centroidStream.point = centroidPointLine;
  centroid_centroidPoint(centroid_x0 = x, centroid_y0 = y);
}

function centroidPointLine(x, y) {
  var dx = x - centroid_x0, dy = y - centroid_y0, z = math_sqrt(dx * dx + dy * dy);
  centroid_X1 += z * (centroid_x0 + x) / 2;
  centroid_Y1 += z * (centroid_y0 + y) / 2;
  centroid_Z1 += z;
  centroid_centroidPoint(centroid_x0 = x, centroid_y0 = y);
}

function centroid_centroidLineEnd() {
  centroid_centroidStream.point = centroid_centroidPoint;
}

function centroid_centroidRingStart() {
  centroid_centroidStream.point = centroidPointFirstRing;
}

function centroid_centroidRingEnd() {
  centroidPointRing(centroid_x00, centroid_y00);
}

function centroidPointFirstRing(x, y) {
  centroid_centroidStream.point = centroidPointRing;
  centroid_centroidPoint(centroid_x00 = centroid_x0 = x, centroid_y00 = centroid_y0 = y);
}

function centroidPointRing(x, y) {
  var dx = x - centroid_x0,
      dy = y - centroid_y0,
      z = math_sqrt(dx * dx + dy * dy);

  centroid_X1 += z * (centroid_x0 + x) / 2;
  centroid_Y1 += z * (centroid_y0 + y) / 2;
  centroid_Z1 += z;

  z = centroid_y0 * x - centroid_x0 * y;
  centroid_X2 += z * (centroid_x0 + x);
  centroid_Y2 += z * (centroid_y0 + y);
  centroid_Z2 += z * 3;
  centroid_centroidPoint(centroid_x0 = x, centroid_y0 = y);
}

/* harmony default export */ const path_centroid = ((/* unused pure expression or super */ null && (centroid_centroidStream)));

;// ./node_modules/d3-geo/src/path/context.js



function context_PathContext(context) {
  this._context = context;
}

context_PathContext.prototype = {
  _radius: 4.5,
  pointRadius: function(_) {
    return this._radius = _, this;
  },
  polygonStart: function() {
    this._line = 0;
  },
  polygonEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line === 0) this._context.closePath();
    this._point = NaN;
  },
  point: function(x, y) {
    switch (this._point) {
      case 0: {
        this._context.moveTo(x, y);
        this._point = 1;
        break;
      }
      case 1: {
        this._context.lineTo(x, y);
        break;
      }
      default: {
        this._context.moveTo(x + this._radius, y);
        this._context.arc(x, y, this._radius, 0, math_tau);
        break;
      }
    }
  },
  result: noop
};

;// ./node_modules/d3-geo/src/path/measure.js




var measure_lengthSum = new src/* Adder */.ph(),
    lengthRing,
    measure_x00,
    measure_y00,
    measure_x0,
    measure_y0;

var measure_lengthStream = {
  point: noop,
  lineStart: function() {
    measure_lengthStream.point = measure_lengthPointFirst;
  },
  lineEnd: function() {
    if (lengthRing) measure_lengthPoint(measure_x00, measure_y00);
    measure_lengthStream.point = noop;
  },
  polygonStart: function() {
    lengthRing = true;
  },
  polygonEnd: function() {
    lengthRing = null;
  },
  result: function() {
    var length = +measure_lengthSum;
    measure_lengthSum = new src/* Adder */.ph();
    return length;
  }
};

function measure_lengthPointFirst(x, y) {
  measure_lengthStream.point = measure_lengthPoint;
  measure_x00 = measure_x0 = x, measure_y00 = measure_y0 = y;
}

function measure_lengthPoint(x, y) {
  measure_x0 -= x, measure_y0 -= y;
  measure_lengthSum.add(math_sqrt(measure_x0 * measure_x0 + measure_y0 * measure_y0));
  measure_x0 = x, measure_y0 = y;
}

/* harmony default export */ const measure = ((/* unused pure expression or super */ null && (measure_lengthStream)));

;// ./node_modules/d3-geo/src/path/string.js
// Simple caching for constant-radius points.
let cacheDigits, cacheAppend, cacheRadius, cacheCircle;

class string_PathString {
  constructor(digits) {
    this._append = digits == null ? append : appendRound(digits);
    this._radius = 4.5;
    this._ = "";
  }
  pointRadius(_) {
    this._radius = +_;
    return this;
  }
  polygonStart() {
    this._line = 0;
  }
  polygonEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._point = 0;
  }
  lineEnd() {
    if (this._line === 0) this._ += "Z";
    this._point = NaN;
  }
  point(x, y) {
    switch (this._point) {
      case 0: {
        this._append`M${x},${y}`;
        this._point = 1;
        break;
      }
      case 1: {
        this._append`L${x},${y}`;
        break;
      }
      default: {
        this._append`M${x},${y}`;
        if (this._radius !== cacheRadius || this._append !== cacheAppend) {
          const r = this._radius;
          const s = this._;
          this._ = ""; // stash the old string so we can cache the circle path fragment
          this._append`m0,${r}a${r},${r} 0 1,1 0,${-2 * r}a${r},${r} 0 1,1 0,${2 * r}z`;
          cacheRadius = r;
          cacheAppend = this._append;
          cacheCircle = this._;
          this._ = s;
        }
        this._ += cacheCircle;
        break;
      }
    }
  }
  result() {
    const result = this._;
    this._ = "";
    return result.length ? result : null;
  }
}

function append(strings) {
  let i = 1;
  this._ += strings[0];
  for (const j = strings.length; i < j; ++i) {
    this._ += arguments[i] + strings[i];
  }
}

function appendRound(digits) {
  const d = Math.floor(digits);
  if (!(d >= 0)) throw new RangeError(`invalid digits: ${digits}`);
  if (d > 15) return append;
  if (d !== cacheDigits) {
    const k = 10 ** d;
    cacheDigits = d;
    cacheAppend = function append(strings) {
      let i = 1;
      this._ += strings[0];
      for (const j = strings.length; i < j; ++i) {
        this._ += Math.round(arguments[i] * k) / k + strings[i];
      }
    };
  }
  return cacheAppend;
}

;// ./node_modules/d3-geo/src/path/index.js









/* harmony default export */ function path(projection, context) {
  let digits = 3,
      pointRadius = 4.5,
      projectionStream,
      contextStream;

  function path(object) {
    if (object) {
      if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
      stream(object, projectionStream(contextStream));
    }
    return contextStream.result();
  }

  path.area = function(object) {
    stream(object, projectionStream(pathArea));
    return pathArea.result();
  };

  path.measure = function(object) {
    stream(object, projectionStream(pathMeasure));
    return pathMeasure.result();
  };

  path.bounds = function(object) {
    stream(object, projectionStream(pathBounds));
    return pathBounds.result();
  };

  path.centroid = function(object) {
    stream(object, projectionStream(pathCentroid));
    return pathCentroid.result();
  };

  path.projection = function(_) {
    if (!arguments.length) return projection;
    projectionStream = _ == null ? (projection = null, identity) : (projection = _).stream;
    return path;
  };

  path.context = function(_) {
    if (!arguments.length) return context;
    contextStream = _ == null ? (context = null, new PathString(digits)) : new PathContext(context = _);
    if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
    return path;
  };

  path.pointRadius = function(_) {
    if (!arguments.length) return pointRadius;
    pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
    return path;
  };

  path.digits = function(_) {
    if (!arguments.length) return digits;
    if (_ == null) digits = null;
    else {
      const d = Math.floor(_);
      if (!(d >= 0)) throw new RangeError(`invalid digits: ${_}`);
      digits = d;
    }
    if (context === null) contextStream = new PathString(digits);
    return path;
  };

  return path.projection(projection).digits(digits).context(context);
}

;// ./node_modules/d3-geo/src/transform.js
/* harmony default export */ function transform(methods) {
  return {
    stream: transform_transformer(methods)
  };
}

function transform_transformer(methods) {
  return function(stream) {
    var s = new TransformStream;
    for (var key in methods) s[key] = methods[key];
    s.stream = stream;
    return s;
  };
}

function TransformStream() {}

TransformStream.prototype = {
  constructor: TransformStream,
  point: function(x, y) { this.stream.point(x, y); },
  sphere: function() { this.stream.sphere(); },
  lineStart: function() { this.stream.lineStart(); },
  lineEnd: function() { this.stream.lineEnd(); },
  polygonStart: function() { this.stream.polygonStart(); },
  polygonEnd: function() { this.stream.polygonEnd(); }
};

;// ./node_modules/d3-geo/src/projection/fit.js



function fit(projection, fitBounds, object) {
  var clip = projection.clipExtent && projection.clipExtent();
  projection.scale(150).translate([0, 0]);
  if (clip != null) projection.clipExtent(null);
  geoStream(object, projection.stream(boundsStream));
  fitBounds(boundsStream.result());
  if (clip != null) projection.clipExtent(clip);
  return projection;
}

function fit_fitExtent(projection, extent, object) {
  return fit(projection, function(b) {
    var w = extent[1][0] - extent[0][0],
        h = extent[1][1] - extent[0][1],
        k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])),
        x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
        y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
    projection.scale(150 * k).translate([x, y]);
  }, object);
}

function fit_fitSize(projection, size, object) {
  return fit_fitExtent(projection, [[0, 0], size], object);
}

function fit_fitWidth(projection, width, object) {
  return fit(projection, function(b) {
    var w = +width,
        k = w / (b[1][0] - b[0][0]),
        x = (w - k * (b[1][0] + b[0][0])) / 2,
        y = -k * b[0][1];
    projection.scale(150 * k).translate([x, y]);
  }, object);
}

function fit_fitHeight(projection, height, object) {
  return fit(projection, function(b) {
    var h = +height,
        k = h / (b[1][1] - b[0][1]),
        x = -k * b[0][0],
        y = (h - k * (b[1][1] + b[0][1])) / 2;
    projection.scale(150 * k).translate([x, y]);
  }, object);
}

;// ./node_modules/d3-geo/src/projection/resample.js




var maxDepth = 16, // maximum depth of subdivision
    cosMinDistance = math_cos(30 * math_radians); // cos(minimum angular distance)

/* harmony default export */ function projection_resample(project, delta2) {
  return +delta2 ? resample_resample(project, delta2) : resampleNone(project);
}

function resampleNone(project) {
  return transformer({
    point: function(x, y) {
      x = project(x, y);
      this.stream.point(x[0], x[1]);
    }
  });
}

function resample_resample(project, delta2) {

  function resampleLineTo(x0, y0, lambda0, a0, b0, c0, x1, y1, lambda1, a1, b1, c1, depth, stream) {
    var dx = x1 - x0,
        dy = y1 - y0,
        d2 = dx * dx + dy * dy;
    if (d2 > 4 * delta2 && depth--) {
      var a = a0 + a1,
          b = b0 + b1,
          c = c0 + c1,
          m = sqrt(a * a + b * b + c * c),
          phi2 = asin(c /= m),
          lambda2 = abs(abs(c) - 1) < epsilon || abs(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : atan2(b, a),
          p = project(lambda2, phi2),
          x2 = p[0],
          y2 = p[1],
          dx2 = x2 - x0,
          dy2 = y2 - y0,
          dz = dy * dx2 - dx * dy2;
      if (dz * dz / d2 > delta2 // perpendicular projected distance
          || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 // midpoint close to an end
          || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) { // angular distance
        resampleLineTo(x0, y0, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
        stream.point(x2, y2);
        resampleLineTo(x2, y2, lambda2, a, b, c, x1, y1, lambda1, a1, b1, c1, depth, stream);
      }
    }
  }
  return function(stream) {
    var lambda00, x00, y00, a00, b00, c00, // first point
        lambda0, x0, y0, a0, b0, c0; // previous point

    var resampleStream = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: function() { stream.polygonStart(); resampleStream.lineStart = ringStart; },
      polygonEnd: function() { stream.polygonEnd(); resampleStream.lineStart = lineStart; }
    };

    function point(x, y) {
      x = project(x, y);
      stream.point(x[0], x[1]);
    }

    function lineStart() {
      x0 = NaN;
      resampleStream.point = linePoint;
      stream.lineStart();
    }

    function linePoint(lambda, phi) {
      var c = cartesian([lambda, phi]), p = project(lambda, phi);
      resampleLineTo(x0, y0, lambda0, a0, b0, c0, x0 = p[0], y0 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
      stream.point(x0, y0);
    }

    function lineEnd() {
      resampleStream.point = point;
      stream.lineEnd();
    }

    function ringStart() {
      lineStart();
      resampleStream.point = ringPoint;
      resampleStream.lineEnd = ringEnd;
    }

    function ringPoint(lambda, phi) {
      linePoint(lambda00 = lambda, phi), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
      resampleStream.point = linePoint;
    }

    function ringEnd() {
      resampleLineTo(x0, y0, lambda0, a0, b0, c0, x00, y00, lambda00, a00, b00, c00, maxDepth, stream);
      resampleStream.lineEnd = lineEnd;
      lineEnd();
    }

    return resampleStream;
  };
}

;// ./node_modules/d3-geo/src/projection/index.js











var transformRadians = transform_transformer({
  point: function(x, y) {
    this.stream.point(x * math_radians, y * math_radians);
  }
});

function transformRotate(rotate) {
  return transformer({
    point: function(x, y) {
      var r = rotate(x, y);
      return this.stream.point(r[0], r[1]);
    }
  });
}

function scaleTranslate(k, dx, dy, sx, sy) {
  function transform(x, y) {
    x *= sx; y *= sy;
    return [dx + k * x, dy - k * y];
  }
  transform.invert = function(x, y) {
    return [(x - dx) / k * sx, (dy - y) / k * sy];
  };
  return transform;
}

function scaleTranslateRotate(k, dx, dy, sx, sy, alpha) {
  if (!alpha) return scaleTranslate(k, dx, dy, sx, sy);
  var cosAlpha = cos(alpha),
      sinAlpha = sin(alpha),
      a = cosAlpha * k,
      b = sinAlpha * k,
      ai = cosAlpha / k,
      bi = sinAlpha / k,
      ci = (sinAlpha * dy - cosAlpha * dx) / k,
      fi = (sinAlpha * dx + cosAlpha * dy) / k;
  function transform(x, y) {
    x *= sx; y *= sy;
    return [a * x - b * y + dx, dy - b * x - a * y];
  }
  transform.invert = function(x, y) {
    return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)];
  };
  return transform;
}

function projection_projection(project) {
  return projection_projectionMutator(function() { return project; })();
}

function projection_projectionMutator(projectAt) {
  var project,
      k = 150, // scale
      x = 480, y = 250, // translate
      lambda = 0, phi = 0, // center
      deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, // pre-rotate
      alpha = 0, // post-rotate angle
      sx = 1, // reflectX
      sy = 1, // reflectX
      theta = null, preclip = clipAntimeridian, // pre-clip angle
      x0 = null, y0, x1, y1, postclip = identity, // post-clip extent
      delta2 = 0.5, // precision
      projectResample,
      projectTransform,
      projectRotateTransform,
      cache,
      cacheStream;

  function projection(point) {
    return projectRotateTransform(point[0] * radians, point[1] * radians);
  }

  function invert(point) {
    point = projectRotateTransform.invert(point[0], point[1]);
    return point && [point[0] * degrees, point[1] * degrees];
  }

  projection.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
  };

  projection.preclip = function(_) {
    return arguments.length ? (preclip = _, theta = undefined, reset()) : preclip;
  };

  projection.postclip = function(_) {
    return arguments.length ? (postclip = _, x0 = y0 = x1 = y1 = null, reset()) : postclip;
  };

  projection.clipAngle = function(_) {
    return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees;
  };

  projection.clipExtent = function(_) {
    return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
  };

  projection.scale = function(_) {
    return arguments.length ? (k = +_, recenter()) : k;
  };

  projection.translate = function(_) {
    return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
  };

  projection.center = function(_) {
    return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees];
  };

  projection.rotate = function(_) {
    return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
  };

  projection.angle = function(_) {
    return arguments.length ? (alpha = _ % 360 * radians, recenter()) : alpha * degrees;
  };

  projection.reflectX = function(_) {
    return arguments.length ? (sx = _ ? -1 : 1, recenter()) : sx < 0;
  };

  projection.reflectY = function(_) {
    return arguments.length ? (sy = _ ? -1 : 1, recenter()) : sy < 0;
  };

  projection.precision = function(_) {
    return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
  };

  projection.fitExtent = function(extent, object) {
    return fitExtent(projection, extent, object);
  };

  projection.fitSize = function(size, object) {
    return fitSize(projection, size, object);
  };

  projection.fitWidth = function(width, object) {
    return fitWidth(projection, width, object);
  };

  projection.fitHeight = function(height, object) {
    return fitHeight(projection, height, object);
  };

  function recenter() {
    var center = scaleTranslateRotate(k, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi)),
        transform = scaleTranslateRotate(k, x - center[0], y - center[1], sx, sy, alpha);
    rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
    projectTransform = compose(project, transform);
    projectRotateTransform = compose(rotate, projectTransform);
    projectResample = resample(projectTransform, delta2);
    return reset();
  }

  function reset() {
    cache = cacheStream = null;
    return projection;
  }

  return function() {
    project = projectAt.apply(this, arguments);
    projection.invert = project.invert && invert;
    return recenter();
  };
}

;// ./node_modules/d3-geo/src/projection/conic.js



function conic_conicProjection(projectAt) {
  var phi0 = 0,
      phi1 = pi / 3,
      m = projectionMutator(projectAt),
      p = m(phi0, phi1);

  p.parallels = function(_) {
    return arguments.length ? m(phi0 = _[0] * radians, phi1 = _[1] * radians) : [phi0 * degrees, phi1 * degrees];
  };

  return p;
}

;// ./node_modules/d3-geo/src/projection/cylindricalEqualArea.js


function cylindricalEqualArea_cylindricalEqualAreaRaw(phi0) {
  var cosPhi0 = cos(phi0);

  function forward(lambda, phi) {
    return [lambda * cosPhi0, sin(phi) / cosPhi0];
  }

  forward.invert = function(x, y) {
    return [x / cosPhi0, asin(y * cosPhi0)];
  };

  return forward;
}

;// ./node_modules/d3-geo/src/projection/conicEqualArea.js




function conicEqualAreaRaw(y0, y1) {
  var sy0 = sin(y0), n = (sy0 + sin(y1)) / 2;

  // Are the parallels symmetrical around the Equator?
  if (abs(n) < epsilon) return cylindricalEqualAreaRaw(y0);

  var c = 1 + sy0 * (2 * n - sy0), r0 = sqrt(c) / n;

  function project(x, y) {
    var r = sqrt(c - 2 * n * sin(y)) / n;
    return [r * sin(x *= n), r0 - r * cos(x)];
  }

  project.invert = function(x, y) {
    var r0y = r0 - y,
        l = atan2(x, abs(r0y)) * sign(r0y);
    if (r0y * n < 0)
      l -= pi * sign(x) * sign(r0y);
    return [l / n, asin((c - (x * x + r0y * r0y) * n * n) / (2 * n))];
  };

  return project;
}

/* harmony default export */ function projection_conicEqualArea() {
  return conicProjection(conicEqualAreaRaw)
      .scale(155.424)
      .center([0, 33.6442]);
}

;// ./node_modules/d3-geo/src/projection/albers.js


/* harmony default export */ function projection_albers() {
  return conicEqualArea()
      .parallels([29.5, 45.5])
      .scale(1070)
      .translate([480, 250])
      .rotate([96, 0])
      .center([-0.6, 38.7]);
}

;// ./node_modules/d3-geo/src/projection/albersUsa.js





// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex(streams) {
  var n = streams.length;
  return {
    point: function(x, y) { var i = -1; while (++i < n) streams[i].point(x, y); },
    sphere: function() { var i = -1; while (++i < n) streams[i].sphere(); },
    lineStart: function() { var i = -1; while (++i < n) streams[i].lineStart(); },
    lineEnd: function() { var i = -1; while (++i < n) streams[i].lineEnd(); },
    polygonStart: function() { var i = -1; while (++i < n) streams[i].polygonStart(); },
    polygonEnd: function() { var i = -1; while (++i < n) streams[i].polygonEnd(); }
  };
}

// A composite projection for the United States, configured by default for
// 960×500. The projection also works quite well at 960×600 if you change the
// scale to 1285 and adjust the translate accordingly. The set of standard
// parallels for each region comes from USGS, which is published here:
// http://egsc.usgs.gov/isb/pubs/MapProjections/projections.html#albers
/* harmony default export */ function albersUsa() {
  var cache,
      cacheStream,
      lower48 = albers(), lower48Point,
      alaska = conicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]), alaskaPoint, // EPSG:3338
      hawaii = conicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]), hawaiiPoint, // ESRI:102007
      point, pointStream = {point: function(x, y) { point = [x, y]; }};

  function albersUsa(coordinates) {
    var x = coordinates[0], y = coordinates[1];
    return point = null,
        (lower48Point.point(x, y), point)
        || (alaskaPoint.point(x, y), point)
        || (hawaiiPoint.point(x, y), point);
  }

  albersUsa.invert = function(coordinates) {
    var k = lower48.scale(),
        t = lower48.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;
    return (y >= 0.120 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska
        : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii
        : lower48).invert(coordinates);
  };

  albersUsa.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = multiplex([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream)]);
  };

  albersUsa.precision = function(_) {
    if (!arguments.length) return lower48.precision();
    lower48.precision(_), alaska.precision(_), hawaii.precision(_);
    return reset();
  };

  albersUsa.scale = function(_) {
    if (!arguments.length) return lower48.scale();
    lower48.scale(_), alaska.scale(_ * 0.35), hawaii.scale(_);
    return albersUsa.translate(lower48.translate());
  };

  albersUsa.translate = function(_) {
    if (!arguments.length) return lower48.translate();
    var k = lower48.scale(), x = +_[0], y = +_[1];

    lower48Point = lower48
        .translate(_)
        .clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]])
        .stream(pointStream);

    alaskaPoint = alaska
        .translate([x - 0.307 * k, y + 0.201 * k])
        .clipExtent([[x - 0.425 * k + epsilon, y + 0.120 * k + epsilon], [x - 0.214 * k - epsilon, y + 0.234 * k - epsilon]])
        .stream(pointStream);

    hawaiiPoint = hawaii
        .translate([x - 0.205 * k, y + 0.212 * k])
        .clipExtent([[x - 0.214 * k + epsilon, y + 0.166 * k + epsilon], [x - 0.115 * k - epsilon, y + 0.234 * k - epsilon]])
        .stream(pointStream);

    return reset();
  };

  albersUsa.fitExtent = function(extent, object) {
    return fitExtent(albersUsa, extent, object);
  };

  albersUsa.fitSize = function(size, object) {
    return fitSize(albersUsa, size, object);
  };

  albersUsa.fitWidth = function(width, object) {
    return fitWidth(albersUsa, width, object);
  };

  albersUsa.fitHeight = function(height, object) {
    return fitHeight(albersUsa, height, object);
  };

  function reset() {
    cache = cacheStream = null;
    return albersUsa;
  }

  return albersUsa.scale(1070);
}

;// ./node_modules/d3-geo/src/projection/azimuthal.js


function azimuthalRaw(scale) {
  return function(x, y) {
    var cx = math_cos(x),
        cy = math_cos(y),
        k = scale(cx * cy);
        if (k === Infinity) return [2, 0];
    return [
      k * cy * math_sin(x),
      k * math_sin(y)
    ];
  }
}

function azimuthalInvert(angle) {
  return function(x, y) {
    var z = math_sqrt(x * x + y * y),
        c = angle(z),
        sc = math_sin(c),
        cc = math_cos(c);
    return [
      math_atan2(x * sc, z * cc),
      math_asin(z && y * sc / z)
    ];
  }
}

;// ./node_modules/d3-geo/src/projection/azimuthalEqualArea.js




var azimuthalEqualAreaRaw = azimuthalRaw(function(cxcy) {
  return math_sqrt(2 / (1 + cxcy));
});

azimuthalEqualAreaRaw.invert = azimuthalInvert(function(z) {
  return 2 * math_asin(z / 2);
});

/* harmony default export */ function azimuthalEqualArea() {
  return projection(azimuthalEqualAreaRaw)
      .scale(124.75)
      .clipAngle(180 - 1e-3);
}

;// ./node_modules/d3-geo/src/projection/azimuthalEquidistant.js




var azimuthalEquidistantRaw = azimuthalRaw(function(c) {
  return (c = math_acos(c)) && c / math_sin(c);
});

azimuthalEquidistantRaw.invert = azimuthalInvert(function(z) {
  return z;
});

/* harmony default export */ function azimuthalEquidistant() {
  return projection(azimuthalEquidistantRaw)
      .scale(79.4188)
      .clipAngle(180 - 1e-3);
}

;// ./node_modules/d3-geo/src/projection/mercator.js




function mercator_mercatorRaw(lambda, phi) {
  return [lambda, math_log(math_tan((math_halfPi + phi) / 2))];
}

mercator_mercatorRaw.invert = function(x, y) {
  return [x, 2 * math_atan(exp(y)) - math_halfPi];
};

/* harmony default export */ function mercator() {
  return mercator_mercatorProjection(mercator_mercatorRaw)
      .scale(961 / tau);
}

function mercator_mercatorProjection(project) {
  var m = projection(project),
      center = m.center,
      scale = m.scale,
      translate = m.translate,
      clipExtent = m.clipExtent,
      x0 = null, y0, x1, y1; // clip extent

  m.scale = function(_) {
    return arguments.length ? (scale(_), reclip()) : scale();
  };

  m.translate = function(_) {
    return arguments.length ? (translate(_), reclip()) : translate();
  };

  m.center = function(_) {
    return arguments.length ? (center(_), reclip()) : center();
  };

  m.clipExtent = function(_) {
    return arguments.length ? ((_ == null ? x0 = y0 = x1 = y1 = null : (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1])), reclip()) : x0 == null ? null : [[x0, y0], [x1, y1]];
  };

  function reclip() {
    var k = pi * scale(),
        t = m(rotation(m.rotate()).invert([0, 0]));
    return clipExtent(x0 == null
        ? [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]] : project === mercator_mercatorRaw
        ? [[Math.max(t[0] - k, x0), y0], [Math.min(t[0] + k, x1), y1]]
        : [[x0, Math.max(t[1] - k, y0)], [x1, Math.min(t[1] + k, y1)]]);
  }

  return reclip();
}

;// ./node_modules/d3-geo/src/projection/conicConformal.js




function tany(y) {
  return tan((halfPi + y) / 2);
}

function conicConformalRaw(y0, y1) {
  var cy0 = cos(y0),
      n = y0 === y1 ? sin(y0) : log(cy0 / cos(y1)) / log(tany(y1) / tany(y0)),
      f = cy0 * pow(tany(y0), n) / n;

  if (!n) return mercatorRaw;

  function project(x, y) {
    if (f > 0) { if (y < -halfPi + epsilon) y = -halfPi + epsilon; }
    else { if (y > halfPi - epsilon) y = halfPi - epsilon; }
    var r = f / pow(tany(y), n);
    return [r * sin(n * x), f - r * cos(n * x)];
  }

  project.invert = function(x, y) {
    var fy = f - y, r = sign(n) * sqrt(x * x + fy * fy),
      l = atan2(x, abs(fy)) * sign(fy);
    if (fy * n < 0)
      l -= pi * sign(x) * sign(fy);
    return [l / n, 2 * atan(pow(f / r, 1 / n)) - halfPi];
  };

  return project;
}

/* harmony default export */ function conicConformal() {
  return conicProjection(conicConformalRaw)
      .scale(109.5)
      .parallels([30, 30]);
}

;// ./node_modules/d3-geo/src/projection/equirectangular.js


function equirectangular_equirectangularRaw(lambda, phi) {
  return [lambda, phi];
}

equirectangular_equirectangularRaw.invert = equirectangular_equirectangularRaw;

/* harmony default export */ function equirectangular() {
  return projection(equirectangular_equirectangularRaw)
      .scale(152.63);
}

;// ./node_modules/d3-geo/src/projection/conicEquidistant.js




function conicEquidistantRaw(y0, y1) {
  var cy0 = cos(y0),
      n = y0 === y1 ? sin(y0) : (cy0 - cos(y1)) / (y1 - y0),
      g = cy0 / n + y0;

  if (abs(n) < epsilon) return equirectangularRaw;

  function project(x, y) {
    var gy = g - y, nx = n * x;
    return [gy * sin(nx), g - gy * cos(nx)];
  }

  project.invert = function(x, y) {
    var gy = g - y,
        l = atan2(x, abs(gy)) * sign(gy);
    if (gy * n < 0)
      l -= pi * sign(x) * sign(gy);
    return [l / n, g - sign(n) * sqrt(x * x + gy * gy)];
  };

  return project;
}

/* harmony default export */ function conicEquidistant() {
  return conicProjection(conicEquidistantRaw)
      .scale(131.154)
      .center([0, 13.9389]);
}

;// ./node_modules/d3-geo/src/projection/equalEarth.js



var A1 = 1.340264,
    A2 = -0.081106,
    A3 = 0.000893,
    A4 = 0.003796,
    M = math_sqrt(3) / 2,
    iterations = 12;

function equalEarthRaw(lambda, phi) {
  var l = math_asin(M * math_sin(phi)), l2 = l * l, l6 = l2 * l2 * l2;
  return [
    lambda * math_cos(l) / (M * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2))),
    l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2))
  ];
}

equalEarthRaw.invert = function(x, y) {
  var l = y, l2 = l * l, l6 = l2 * l2 * l2;
  for (var i = 0, delta, fy, fpy; i < iterations; ++i) {
    fy = l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2)) - y;
    fpy = A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2);
    l -= delta = fy / fpy, l2 = l * l, l6 = l2 * l2 * l2;
    if (math_abs(delta) < math_epsilon2) break;
  }
  return [
    M * x * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2)) / math_cos(l),
    math_asin(math_sin(l) / M)
  ];
};

/* harmony default export */ function equalEarth() {
  return projection(equalEarthRaw)
      .scale(177.158);
}

;// ./node_modules/d3-geo/src/projection/gnomonic.js




function gnomonicRaw(x, y) {
  var cy = math_cos(y), k = math_cos(x) * cy;
  return [cy * math_sin(x) / k, math_sin(y) / k];
}

gnomonicRaw.invert = azimuthalInvert(math_atan);

/* harmony default export */ function gnomonic() {
  return projection(gnomonicRaw)
      .scale(144.049)
      .clipAngle(60);
}

;// ./node_modules/d3-geo/src/projection/identity.js






/* harmony default export */ function projection_identity() {
  var k = 1, tx = 0, ty = 0, sx = 1, sy = 1, // scale, translate and reflect
      alpha = 0, ca, sa, // angle
      x0 = null, y0, x1, y1, // clip extent
      kx = 1, ky = 1,
      transform = transformer({
        point: function(x, y) {
          var p = projection([x, y])
          this.stream.point(p[0], p[1]);
        }
      }),
      postclip = identity,
      cache,
      cacheStream;

  function reset() {
    kx = k * sx;
    ky = k * sy;
    cache = cacheStream = null;
    return projection;
  }

  function projection (p) {
    var x = p[0] * kx, y = p[1] * ky;
    if (alpha) {
      var t = y * ca - x * sa;
      x = x * ca + y * sa;
      y = t;
    }    
    return [x + tx, y + ty];
  }
  projection.invert = function(p) {
    var x = p[0] - tx, y = p[1] - ty;
    if (alpha) {
      var t = y * ca + x * sa;
      x = x * ca - y * sa;
      y = t;
    }
    return [x / kx, y / ky];
  };
  projection.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = transform(postclip(cacheStream = stream));
  };
  projection.postclip = function(_) {
    return arguments.length ? (postclip = _, x0 = y0 = x1 = y1 = null, reset()) : postclip;
  };
  projection.clipExtent = function(_) {
    return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
  };
  projection.scale = function(_) {
    return arguments.length ? (k = +_, reset()) : k;
  };
  projection.translate = function(_) {
    return arguments.length ? (tx = +_[0], ty = +_[1], reset()) : [tx, ty];
  }
  projection.angle = function(_) {
    return arguments.length ? (alpha = _ % 360 * radians, sa = sin(alpha), ca = cos(alpha), reset()) : alpha * degrees;
  };
  projection.reflectX = function(_) {
    return arguments.length ? (sx = _ ? -1 : 1, reset()) : sx < 0;
  };
  projection.reflectY = function(_) {
    return arguments.length ? (sy = _ ? -1 : 1, reset()) : sy < 0;
  };
  projection.fitExtent = function(extent, object) {
    return fitExtent(projection, extent, object);
  };
  projection.fitSize = function(size, object) {
    return fitSize(projection, size, object);
  };
  projection.fitWidth = function(width, object) {
    return fitWidth(projection, width, object);
  };
  projection.fitHeight = function(height, object) {
    return fitHeight(projection, height, object);
  };

  return projection;
}

;// ./node_modules/d3-geo/src/projection/naturalEarth1.js



function naturalEarth1Raw(lambda, phi) {
  var phi2 = phi * phi, phi4 = phi2 * phi2;
  return [
    lambda * (0.8707 - 0.131979 * phi2 + phi4 * (-0.013791 + phi4 * (0.003971 * phi2 - 0.001529 * phi4))),
    phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 0.005916 * phi4)))
  ];
}

naturalEarth1Raw.invert = function(x, y) {
  var phi = y, i = 25, delta;
  do {
    var phi2 = phi * phi, phi4 = phi2 * phi2;
    phi -= delta = (phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 0.005916 * phi4))) - y) /
        (1.007226 + phi2 * (0.015085 * 3 + phi4 * (-0.044475 * 7 + 0.028874 * 9 * phi2 - 0.005916 * 11 * phi4)));
  } while (math_abs(delta) > math_epsilon && --i > 0);
  return [
    x / (0.8707 + (phi2 = phi * phi) * (-0.131979 + phi2 * (-0.013791 + phi2 * phi2 * phi2 * (0.003971 - 0.001529 * phi2)))),
    phi
  ];
};

/* harmony default export */ function naturalEarth1() {
  return projection(naturalEarth1Raw)
      .scale(175.295);
}

;// ./node_modules/d3-geo/src/projection/orthographic.js




function orthographicRaw(x, y) {
  return [math_cos(y) * math_sin(x), math_sin(y)];
}

orthographicRaw.invert = azimuthalInvert(math_asin);

/* harmony default export */ function orthographic() {
  return projection(orthographicRaw)
      .scale(249.5)
      .clipAngle(90 + epsilon);
}

;// ./node_modules/d3-geo/src/projection/stereographic.js




function stereographicRaw(x, y) {
  var cy = math_cos(y), k = 1 + math_cos(x) * cy;
  return [cy * math_sin(x) / k, math_sin(y) / k];
}

stereographicRaw.invert = azimuthalInvert(function(z) {
  return 2 * math_atan(z);
});

/* harmony default export */ function stereographic() {
  return projection(stereographicRaw)
      .scale(250)
      .clipAngle(142);
}

;// ./node_modules/d3-geo/src/projection/transverseMercator.js



function transverseMercatorRaw(lambda, phi) {
  return [math_log(math_tan((math_halfPi + phi) / 2)), -lambda];
}

transverseMercatorRaw.invert = function(x, y) {
  return [-y, 2 * math_atan(exp(x)) - math_halfPi];
};

/* harmony default export */ function transverseMercator() {
  var m = mercatorProjection(transverseMercatorRaw),
      center = m.center,
      rotate = m.rotate;

  m.center = function(_) {
    return arguments.length ? center([-_[1], _[0]]) : (_ = center(), [_[1], -_[0]]);
  };

  m.rotate = function(_) {
    return arguments.length ? rotate([_[0], _[1], _.length > 2 ? _[2] + 90 : 90]) : (_ = rotate(), [_[0], _[1], _[2] - 90]);
  };

  return rotate([0, 0, 90])
      .scale(159.155);
}

;// ./node_modules/d3-geo/src/index.js






 // DEPRECATED! Use d3.geoIdentity().clipExtent(…).





























/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVuZG9yLWNvbW1vbi0yNGUxMWY2Ny44NDI4NDhhNTYyYjc3YjRmMDg1ZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBTyxJQUFJLFlBQU87QUFDWCxJQUFJLGFBQVE7QUFDWixJQUFJLE9BQUU7QUFDTixJQUFJLFdBQU0sR0FBRyxPQUFFO0FBQ2YsZ0JBQWdCLE9BQUU7QUFDbEIsSUFBSSxRQUFHLEdBQUcsT0FBRTs7QUFFWixJQUFJLFlBQU8sU0FBUyxPQUFFO0FBQ3RCLElBQUksWUFBTyxHQUFHLE9BQUU7O0FBRWhCLElBQUksUUFBRztBQUNQLElBQUksU0FBSTtBQUNSLElBQUksVUFBSztBQUNULElBQUksUUFBRztBQUNQLElBQUksU0FBSTtBQUNSO0FBQ0E7QUFDQSxJQUFJLFVBQUs7QUFDVCxJQUFJLFFBQUc7QUFDUCxJQUFJLFFBQUc7QUFDUCxJQUFJLFFBQUc7QUFDUCxJQUFJLFNBQUksOEJBQThCO0FBQ3RDLElBQUksU0FBSTtBQUNSLElBQUksUUFBRzs7QUFFUCxTQUFTLFNBQUk7QUFDcEIsOEJBQThCLE9BQUU7QUFDaEM7O0FBRU8sU0FBUyxTQUFJO0FBQ3BCLGlCQUFpQixXQUFNLGFBQWEsV0FBTTtBQUMxQzs7QUFFTyxTQUFTLGFBQVE7QUFDeEIsY0FBYyxRQUFHO0FBQ2pCOzs7QUNuQ2U7OztBQ0FmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDZCQUFlLG9CQUFTO0FBQ3hCO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBOzs7QUNwRStCO0FBQ29DO0FBQ3RDO0FBQ0k7O0FBRTFCLHNCQUFzQixpQkFBSzs7QUFFbEM7O0FBRUEsa0JBQWtCLGlCQUFLO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUCxTQUFTLElBQUk7QUFDYixhQUFhLElBQUk7QUFDakIsV0FBVyxJQUFJO0FBQ2Y7QUFDQSxzQkFBc0IsaUJBQUs7QUFDM0I7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsK0JBQStCLFFBQUc7QUFDbEMsaURBQWlELElBQUk7QUFDckQsR0FBRztBQUNIO0FBQ0EsZ0JBQWdCLFFBQUc7QUFDbkI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVksWUFBTyxTQUFTLFlBQU87QUFDbkMsOEJBQThCLFFBQUcsaUJBQWlCLFNBQVMsYUFBYSxRQUFHO0FBQzNFOztBQUVBO0FBQ0EsWUFBWSxZQUFPLFNBQVMsWUFBTztBQUNuQyxrQkFBa0IsU0FBUyxFQUFFOztBQUU3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLFFBQUc7QUFDbEIsZUFBZSxRQUFHO0FBQ2xCO0FBQ0EsaUNBQWlDLFFBQUc7QUFDcEMseUJBQXlCLFFBQUc7QUFDNUIsa0JBQWtCLFVBQUs7O0FBRXZCO0FBQ0E7QUFDQTs7QUFFQSw2QkFBZSxrQkFBUztBQUN4QjtBQUNBO0FBQ0E7QUFDQTs7O0FDM0VzRDs7QUFFL0MsU0FBUyxtQkFBUztBQUN6QixVQUFVLFVBQUssOEJBQThCLFNBQUk7QUFDakQ7O0FBRU8sU0FBUyxtQkFBUztBQUN6QiwwREFBMEQsUUFBRztBQUM3RCxtQkFBbUIsUUFBRyxtQkFBbUIsUUFBRyxVQUFVLFFBQUc7QUFDekQ7O0FBRU8sU0FBUyxzQkFBWTtBQUM1QjtBQUNBOztBQUVPLFNBQVMsd0JBQWM7QUFDOUI7QUFDQTs7QUFFQTtBQUNPLFNBQVMsNkJBQW1CO0FBQ25DO0FBQ0E7O0FBRU8sU0FBUyx3QkFBYztBQUM5QjtBQUNBOztBQUVBO0FBQ08sU0FBUyxtQ0FBeUI7QUFDekMsVUFBVSxTQUFJO0FBQ2Q7QUFDQTs7O0FDaEMrQjtBQUNtQjtBQUM2QztBQUN0QztBQUN4Qjs7QUFFakMsSUFBSSxjQUFPO0FBQ1g7QUFDQSxJQUFJLGVBQVEsRUFBRSxZQUFLO0FBQ25CO0FBQ0E7QUFDQTtBQUNBLElBQUksWUFBSzs7QUFFVCxJQUFJLG1CQUFZO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxtQkFBWTtBQUNoQixJQUFJLG1CQUFZO0FBQ2hCLElBQUksbUJBQVk7QUFDaEIsbUJBQW1CLGlCQUFLO0FBQ3hCLElBQUksVUFBVTtBQUNkLEdBQUc7QUFDSDtBQUNBLElBQUksVUFBVTtBQUNkLElBQUksbUJBQVk7QUFDaEIsSUFBSSxtQkFBWTtBQUNoQixJQUFJLG1CQUFZO0FBQ2hCLFFBQVEsV0FBVyxNQUFNLGNBQU87QUFDaEMsd0JBQXdCLFlBQU87QUFDL0IseUJBQXlCLFlBQU87QUFDaEMsSUFBSSxZQUFLLE1BQU0sY0FBTyxFQUFFLFlBQUs7QUFDN0IsR0FBRztBQUNIO0FBQ0EsSUFBSSxjQUFPO0FBQ1g7QUFDQTs7QUFFQTtBQUNBLGNBQWMsWUFBSyxJQUFJLGNBQU87QUFDOUI7QUFDQTtBQUNBOztBQUVBO0FBQ0EsVUFBVSxtQkFBUyxXQUFXLFlBQU8sUUFBUSxZQUFPO0FBQ3BEO0FBQ0EsaUJBQWlCLHdCQUFjO0FBQy9CO0FBQ0EscUJBQXFCLHdCQUFjO0FBQ25DLElBQUksbUNBQXlCO0FBQzdCLGlCQUFpQixtQkFBUztBQUMxQjtBQUNBO0FBQ0Esa0NBQWtDLFlBQU87QUFDekM7QUFDQSx1QkFBdUIsUUFBRztBQUMxQjtBQUNBLDZCQUE2QixZQUFPO0FBQ3BDO0FBQ0EsTUFBTTtBQUNOLDhCQUE4QixZQUFPO0FBQ3JDO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsY0FBTyxrQkFBa0IsY0FBTztBQUNsRCxRQUFRO0FBQ1IsMkNBQTJDLGNBQU8sWUFBWSxjQUFPO0FBQ3JFO0FBQ0EsTUFBTTtBQUNOLHFCQUFxQixjQUFPO0FBQzVCLHFCQUFxQixjQUFPLEVBQUUsY0FBTztBQUNyQztBQUNBLFFBQVE7QUFDUjtBQUNBLG9CQUFvQixjQUFPLGtCQUFrQixjQUFPO0FBQ3BELFVBQVU7QUFDViw2Q0FBNkMsY0FBTyxZQUFZLGNBQU87QUFDdkU7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKLGdCQUFnQixZQUFLLElBQUksY0FBTztBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsRUFBRSxtQkFBWTtBQUNkOztBQUVBO0FBQ0EsRUFBRSxZQUFLLE1BQU0sY0FBTyxFQUFFLFlBQUs7QUFDM0IsRUFBRSxtQkFBWTtBQUNkO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLFFBQUc7QUFDcEIsSUFBSTtBQUNKLElBQUksZUFBUSxXQUFXLFlBQUs7QUFDNUI7QUFDQSxFQUFFLFVBQVU7QUFDWjtBQUNBOztBQUVBO0FBQ0EsRUFBRSxVQUFVO0FBQ1o7O0FBRUE7QUFDQSxrQkFBa0IsZUFBUSxFQUFFLFlBQUs7QUFDakMsRUFBRSxVQUFVO0FBQ1osTUFBTSxRQUFHLGFBQWEsWUFBTyxFQUFFLGNBQU87QUFDdEMsRUFBRSxZQUFLLE1BQU0sY0FBTyxFQUFFLFlBQUs7QUFDM0I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSw2QkFBZSxnQkFBUztBQUN4Qjs7QUFFQSxxQkFBcUIsY0FBTztBQUM1QjtBQUNBLGtCQUFrQixtQkFBWTs7QUFFOUI7QUFDQTtBQUNBOztBQUVBO0FBQ0EsNkNBQTZDLE9BQU87QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw0RUFBNEUsUUFBUTtBQUNwRjtBQUNBLG9FQUFvRSxjQUFPO0FBQzNFO0FBQ0E7O0FBRUEsV0FBVyxZQUFLOztBQUVoQixTQUFTLGNBQU87QUFDaEI7QUFDQSxVQUFVLGNBQU87QUFDakI7OztBQ2xMK0I7QUFDbUU7QUFDckU7QUFDSTs7QUFFakM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLGlCQUFRLEVBQUUsY0FBSztBQUNuQixnQkFBZ0I7O0FBRWhCO0FBQ0EsVUFBVSxJQUFJO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFlBQVksWUFBTyxTQUFTLFlBQU87QUFDbkMsZUFBZSxRQUFHO0FBQ2xCLGtDQUFrQyxRQUFHLG1CQUFtQixRQUFHLFVBQVUsUUFBRztBQUN4RTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsWUFBWSxZQUFPLFNBQVMsWUFBTztBQUNuQyxlQUFlLFFBQUc7QUFDbEIsZ0JBQWdCLFFBQUc7QUFDbkIsZ0JBQWdCLFFBQUc7QUFDbkIsT0FBTyxRQUFHO0FBQ1Y7QUFDQTtBQUNBOztBQUVBO0FBQ0EsWUFBWSxZQUFPLFNBQVMsWUFBTztBQUNuQyxlQUFlLFFBQUc7QUFDbEIsbUJBQW1CLFFBQUc7QUFDdEIsbUJBQW1CLFFBQUc7QUFDdEIsVUFBVSxRQUFHO0FBQ2IsVUFBVSxVQUFLLENBQUMsU0FBSTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxvQkFBb0IsaUJBQVEsRUFBRSxjQUFLO0FBQ25DO0FBQ0E7O0FBRUE7QUFDQSxFQUFFLGlCQUFRLFdBQVcsY0FBSztBQUMxQixZQUFZLFlBQU8sU0FBUyxZQUFPO0FBQ25DO0FBQ0EsZUFBZSxRQUFHO0FBQ2xCLGdCQUFnQixRQUFHO0FBQ25CLGdCQUFnQixRQUFHO0FBQ25CLE9BQU8sUUFBRztBQUNWO0FBQ0E7O0FBRUE7QUFDQSxZQUFZLFlBQU8sU0FBUyxZQUFPO0FBQ25DLGVBQWUsUUFBRztBQUNsQixtQkFBbUIsUUFBRztBQUN0QixtQkFBbUIsUUFBRztBQUN0QixVQUFVLFFBQUc7QUFDYjtBQUNBO0FBQ0E7QUFDQSxVQUFVLFVBQUs7QUFDZixVQUFVLFNBQUk7QUFDZCx1QkFBdUI7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDZCQUFlLGtCQUFTO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7QUM5SUEsNkJBQWUsc0JBQVM7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7OztBQ0pBLDZCQUFlLHFCQUFTOztBQUV4QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7OztBQ1htQztBQUM2Qzs7QUFFaEY7QUFDQSxNQUFNLFFBQUcsV0FBVyxPQUFFLGdDQUFnQyxRQUFHLElBQUksUUFBRztBQUNoRTtBQUNBOztBQUVBOztBQUVPLFNBQVMsc0JBQWE7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsNkJBQWUsc0JBQVM7QUFDeEIsV0FBVyxzQkFBYTs7QUFFeEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7O0FDOUUrRTtBQUMxQztBQUNvQztBQUM3Qjs7QUFFNUM7QUFDTyxTQUFTLG1CQUFZO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLGlDQUFpQztBQUMzRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw2QkFBZSxrQkFBVztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCOztBQUVoQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLG1CQUFZO0FBQ2hCLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7O0FDdkU4Qjs7QUFFOUIsNkJBQWUsa0JBQVc7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMLGFBQWEsSUFBSTtBQUNqQjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZCdUM7O0FBRXZDLDZCQUFlLHdCQUFTO0FBQ3hCLFNBQVMsUUFBRyxnQkFBZ0IsWUFBTyxJQUFJLFFBQUcsZ0JBQWdCLFlBQU87QUFDakU7OztBQ0owQztBQUNQOztBQUVuQztBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEIsa0JBQWtCO0FBQ2xCLGtCQUFrQjtBQUNsQiwwQkFBMEI7QUFDMUI7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNkJBQWUsZ0JBQVM7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLFFBQVEsY0FBVTtBQUNsQjtBQUNBO0FBQ0Esb0JBQW9CLE9BQU87QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsWUFBTztBQUMxQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQSxFQUFFLFdBQUk7QUFDTixFQUFFLFdBQUk7O0FBRU4sK0JBQStCLE9BQU87QUFDdEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QyxPQUFPO0FBQ2hELFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBLHNDQUFzQyxRQUFRO0FBQzlDLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUEsU0FBUyxXQUFJO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3RHK0I7QUFDcUQ7QUFDc0I7O0FBRTFHO0FBQ0EsU0FBUyxRQUFHLGNBQWMsT0FBRSxjQUFjLFNBQUksZUFBZSxRQUFHLGFBQWEsT0FBRSxJQUFJLFFBQUcsR0FBRyxPQUFFO0FBQzNGOztBQUVBLDZCQUFlLHlCQUFTO0FBQ3hCO0FBQ0E7QUFDQSxlQUFlLFFBQUc7QUFDbEIsZ0JBQWdCLFFBQUcsV0FBVyxRQUFHO0FBQ2pDO0FBQ0E7O0FBRUEsZ0JBQWdCLGlCQUFLOztBQUVyQiwwQkFBMEIsV0FBTSxHQUFHLFlBQU87QUFDMUMsaUNBQWlDLFdBQU0sR0FBRyxZQUFPOztBQUVqRCxzQ0FBc0MsT0FBTztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLFNBQVM7QUFDeEMsa0JBQWtCLFFBQUc7QUFDckIsa0JBQWtCLFFBQUc7O0FBRXJCLG9CQUFvQixPQUFPO0FBQzNCO0FBQ0E7QUFDQSxpQ0FBaUMsU0FBUztBQUMxQyxvQkFBb0IsUUFBRztBQUN2QixvQkFBb0IsUUFBRztBQUN2QjtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0MsT0FBRTtBQUN0Qzs7QUFFQSxjQUFjLFVBQUssWUFBWSxRQUFHLG9DQUFvQyxRQUFHO0FBQ3pFLDZDQUE2QyxRQUFHOztBQUVoRDtBQUNBO0FBQ0E7QUFDQSxrQkFBa0Isd0JBQWMsQ0FBQyxtQkFBUyxVQUFVLG1CQUFTO0FBQzdELFFBQVEsbUNBQXlCO0FBQ2pDLDJCQUEyQix3QkFBYztBQUN6QyxRQUFRLG1DQUF5QjtBQUNqQyw0REFBNEQsU0FBSTtBQUNoRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsbUJBQW1CLFlBQU8sWUFBWSxZQUFPLFdBQVcsYUFBUTtBQUNoRTs7O0FDekVxQztBQUNBO0FBQ007QUFDUztBQUNyQjs7QUFFL0IsNkJBQWUsa0JBQVM7QUFDeEI7QUFDQTtBQUNBLHFCQUFxQixNQUFVO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIscUJBQUs7QUFDeEIsMEJBQTBCLGVBQWU7QUFDekM7QUFDQTtBQUNBLFVBQVUsTUFBVTtBQUNwQixVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsT0FBTztBQUM3QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxXQUFNLEdBQUcsWUFBTyxHQUFHLFdBQU07QUFDN0Qsb0NBQW9DLFdBQU0sR0FBRyxZQUFPLEdBQUcsV0FBTTtBQUM3RDs7O0FDbEk4QjtBQUNzQzs7QUFFcEUsbURBQWUsUUFBSTtBQUNuQixlQUFlLGNBQWM7QUFDN0I7QUFDQTtBQUNBLElBQUksT0FBRSxHQUFHLFdBQU07QUFDZixDQUFDLEVBQUM7O0FBRUY7QUFDQSx3Q0FBd0Msc0JBQXNCO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsZ0NBQWdDLE9BQUUsSUFBSSxPQUFFO0FBQ3hDLGtCQUFrQixRQUFHO0FBQ3JCLFVBQVUsUUFBRyxTQUFTLE9BQUUsSUFBSSxZQUFPLElBQUk7QUFDdkMsNkRBQTZELFdBQU0sSUFBSSxXQUFNO0FBQzdFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEscUNBQXFDLE9BQUUsSUFBSTtBQUNuRCxZQUFZLFFBQUcsb0JBQW9CLFlBQU8scUJBQXFCLFlBQU8sRUFBRTtBQUN4RSxZQUFZLFFBQUcsb0JBQW9CLFlBQU8scUJBQXFCLFlBQU87QUFDdEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLHdCQUF3QjtBQUN4QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLFFBQUc7QUFDN0IsU0FBUyxRQUFHLHNCQUFzQixZQUFPO0FBQ3pDLFFBQVEsU0FBSSxFQUFFLFFBQUcsb0JBQW9CLFFBQUcsVUFBVSxRQUFHO0FBQ3JELFlBQVksUUFBRyxvQkFBb0IsUUFBRyxVQUFVLFFBQUc7QUFDbkQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixXQUFNO0FBQzVCLGtCQUFrQixPQUFFO0FBQ3BCO0FBQ0EsaUJBQWlCLE9BQUU7QUFDbkIsaUJBQWlCLE9BQUU7QUFDbkIsaUJBQWlCLE9BQUU7QUFDbkI7QUFDQSxrQkFBa0IsT0FBRTtBQUNwQixrQkFBa0IsT0FBRTtBQUNwQixrQkFBa0IsT0FBRTtBQUNwQixJQUFJLFNBQVMsUUFBRyxvQkFBb0IsWUFBTztBQUMzQyxtQ0FBbUMsT0FBRSxJQUFJLE9BQUU7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBOzs7QUMzRndIO0FBQzlFO0FBQ3NCO0FBQ3RCO0FBQ1o7O0FBRTlCLDZCQUFlLHFCQUFTO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBLHlDQUF5Qzs7QUFFekM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1FQUFtRTtBQUNuRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDO0FBQ2hDLG9DQUFvQztBQUNwQyw2QkFBNkI7QUFDN0IsaUNBQWlDO0FBQ2pDO0FBQ0E7O0FBRUE7QUFDQTs7O0FDaExBLDZCQUFlLGNBQVM7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7OztBQzFEd0M7QUFDSDtBQUNKO0FBQ0k7QUFDTjs7QUFFL0I7O0FBRUE7QUFDQTs7QUFFZSxTQUFTLHVCQUFhOztBQUVyQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDO0FBQ2pDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsMENBQTBDLE9BQU87QUFDakQsbUhBQW1ILE9BQU87QUFDMUg7QUFDQSwwQkFBMEI7QUFDMUIsaUJBQWlCO0FBQ2pCO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FDdksyQzs7QUFFM0MsNkJBQWUsa0JBQVc7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25CK0I7QUFDK0I7QUFDakM7QUFDSTs7QUFFakM7QUFDQSxJQUFJLGNBQU87QUFDWCxJQUFJLGNBQU87QUFDWCxJQUFJLGNBQU87O0FBRVg7QUFDQSxVQUFVLElBQUk7QUFDZCxTQUFTLElBQUk7QUFDYjtBQUNBLFdBQVcsSUFBSTtBQUNmLGdCQUFnQixJQUFJO0FBQ3BCLGNBQWMsSUFBSTtBQUNsQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhDQUE4QyxJQUFJO0FBQ2xEOztBQUVBO0FBQ0EsWUFBWSxZQUFPLFNBQVMsWUFBTztBQUNuQyxFQUFFLGNBQU8sV0FBVyxjQUFPLEdBQUcsUUFBRyxPQUFPLGNBQU8sR0FBRyxRQUFHO0FBQ3JEO0FBQ0E7O0FBRUE7QUFDQSxZQUFZLFlBQU8sU0FBUyxZQUFPO0FBQ25DLGVBQWUsUUFBRztBQUNsQixlQUFlLFFBQUc7QUFDbEIsY0FBYyxRQUFHLFVBQVUsY0FBTztBQUNsQyxpQkFBaUIsUUFBRztBQUNwQixpQkFBaUIsUUFBRztBQUNwQjtBQUNBLFVBQVUsY0FBTyxZQUFZLGNBQU87QUFDcEMsVUFBVSxjQUFPLFlBQVksY0FBTztBQUNwQyxnQkFBZ0IsVUFBSyxDQUFDLFNBQUk7QUFDMUIsRUFBRSxjQUFPLFdBQVcsY0FBTyxXQUFXLGNBQU87QUFDN0M7O0FBRUEsNkJBQWUsb0JBQVM7QUFDeEIsa0JBQWtCLGlCQUFLO0FBQ3ZCLEVBQUUsVUFBTTtBQUNSO0FBQ0E7OztBQ3BEaUM7O0FBRWpDO0FBQ0EsY0FBYzs7QUFFZCw2QkFBZSxrQkFBUztBQUN4QjtBQUNBO0FBQ0EsU0FBUyxVQUFNO0FBQ2Y7OztBQ1RnRTtBQUNkO0FBQ047O0FBRTVDO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUyxRQUFRO0FBQ2pCOztBQUVBO0FBQ0E7QUFDQSwwQ0FBMEMsT0FBTztBQUNqRCxTQUFTLFFBQVE7QUFDakI7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZEQUE2RCxhQUFRO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsV0FBVyxlQUFlO0FBQzFCOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHFCQUFxQixZQUFPLGFBQWEsWUFBTztBQUNoRDs7QUFFQSw2QkFBZSxrQkFBUztBQUN4QjtBQUNBO0FBQ0E7QUFDQTs7O0FDaEcrQjtBQUNjOztBQUU3QztBQUNBO0FBQ0EsdUJBQXVCLDJCQUEyQixnQkFBZ0I7QUFDbEU7O0FBRUE7QUFDQTtBQUNBLHVCQUF1QiwyQkFBMkIsZ0JBQWdCO0FBQ2xFOztBQUVlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFlBQVk7QUFDWjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx1RUFBdUUsK0JBQStCO0FBQ3RHLHVFQUF1RSwrQkFBK0I7QUFDdEc7O0FBRUE7QUFDQSwrQ0FBK0MsUUFBUSxnREFBZ0Q7QUFDdkc7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7OztBQ3hHa0Y7O0FBRWxGLDZCQUFlLHFCQUFTO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOzs7QUNuQ0EsbURBQWUsTUFBTSxFQUFDOzs7QUNBUztBQUNBO0FBQ0Q7O0FBRTlCLElBQUksWUFBTyxPQUFPLGlCQUFLO0FBQ3ZCLElBQUksZ0JBQVcsT0FBTyxpQkFBSztBQUMzQjtBQUNBO0FBQ0EsSUFBSSxPQUFFO0FBQ04sSUFBSSxPQUFFOztBQUVOLElBQUksZUFBVTtBQUNkLFNBQVMsSUFBSTtBQUNiLGFBQWEsSUFBSTtBQUNqQixXQUFXLElBQUk7QUFDZjtBQUNBLElBQUksZUFBVSxhQUFhLGtCQUFhO0FBQ3hDLElBQUksZUFBVSxXQUFXLGdCQUFXO0FBQ3BDLEdBQUc7QUFDSDtBQUNBLElBQUksZUFBVSxhQUFhLGVBQVUsV0FBVyxlQUFVLFNBQVMsSUFBSTtBQUN2RSxJQUFJLFlBQU8sS0FBSyxRQUFHLENBQUMsZ0JBQVc7QUFDL0IsSUFBSSxnQkFBVyxPQUFPLGlCQUFLO0FBQzNCLEdBQUc7QUFDSDtBQUNBLGVBQWUsWUFBTztBQUN0QixJQUFJLFlBQU8sT0FBTyxpQkFBSztBQUN2QjtBQUNBO0FBQ0E7O0FBRUEsU0FBUyxrQkFBYTtBQUN0QixFQUFFLGVBQVUsU0FBUyxtQkFBYztBQUNuQzs7QUFFQSxTQUFTLG1CQUFjO0FBQ3ZCLEVBQUUsZUFBVSxTQUFTLGNBQVM7QUFDOUIsUUFBUSxPQUFFLFlBQVksT0FBRTtBQUN4Qjs7QUFFQSxTQUFTLGNBQVM7QUFDbEIsRUFBRSxnQkFBVyxLQUFLLE9BQUUsT0FBTyxPQUFFO0FBQzdCLEVBQUUsT0FBRSxNQUFNLE9BQUU7QUFDWjs7QUFFQSxTQUFTLGdCQUFXO0FBQ3BCLEVBQUUsY0FBUztBQUNYOztBQUVBLGdEQUFlLCtEQUFVLElBQUM7OztBQ2pESTs7QUFFOUIsSUFBSSxTQUFFO0FBQ04sSUFBSSxTQUFFLEdBQUcsU0FBRTtBQUNYLFVBQVUsU0FBRTtBQUNaOztBQUVBLElBQUksd0JBQVk7QUFDaEIsU0FBUyxrQkFBVztBQUNwQixhQUFhLElBQUk7QUFDakIsV0FBVyxJQUFJO0FBQ2YsZ0JBQWdCLElBQUk7QUFDcEIsY0FBYyxJQUFJO0FBQ2xCO0FBQ0EsbUJBQW1CLFNBQUUsRUFBRSxTQUFFO0FBQ3pCLGdCQUFnQixTQUFFLEdBQUcsU0FBRTtBQUN2QjtBQUNBO0FBQ0E7O0FBRUEsU0FBUyxrQkFBVztBQUNwQixVQUFVLFNBQUUsRUFBRSxTQUFFO0FBQ2hCO0FBQ0EsVUFBVSxTQUFFLEVBQUUsU0FBRTtBQUNoQjtBQUNBOztBQUVBLGtEQUFlLHdFQUFZLElBQUM7OztBQzNCSTs7QUFFaEM7O0FBRUEsSUFBSSxXQUFFO0FBQ04sSUFBSSxXQUFFO0FBQ04sSUFBSSxXQUFFO0FBQ04sSUFBSSxXQUFFO0FBQ04sSUFBSSxXQUFFO0FBQ04sSUFBSSxXQUFFO0FBQ04sSUFBSSxXQUFFO0FBQ04sSUFBSSxXQUFFO0FBQ04sSUFBSSxXQUFFO0FBQ04sSUFBSSxZQUFHO0FBQ1AsSUFBSSxZQUFHO0FBQ1AsSUFBSSxXQUFFO0FBQ04sSUFBSSxXQUFFOztBQUVOLElBQUksdUJBQWM7QUFDbEIsU0FBUyxzQkFBYTtBQUN0QixhQUFhLDBCQUFpQjtBQUM5QixXQUFXLHdCQUFlO0FBQzFCO0FBQ0EsSUFBSSx1QkFBYyxhQUFhLDBCQUFpQjtBQUNoRCxJQUFJLHVCQUFjLFdBQVcsd0JBQWU7QUFDNUMsR0FBRztBQUNIO0FBQ0EsSUFBSSx1QkFBYyxTQUFTLHNCQUFhO0FBQ3hDLElBQUksdUJBQWMsYUFBYSwwQkFBaUI7QUFDaEQsSUFBSSx1QkFBYyxXQUFXLHdCQUFlO0FBQzVDLEdBQUc7QUFDSDtBQUNBLG1CQUFtQixXQUFFLElBQUksV0FBRSxHQUFHLFdBQUUsRUFBRSxXQUFFLEdBQUcsV0FBRTtBQUN6QyxVQUFVLFdBQUUsSUFBSSxXQUFFLEdBQUcsV0FBRSxFQUFFLFdBQUUsR0FBRyxXQUFFO0FBQ2hDLFVBQVUsV0FBRSxJQUFJLFdBQUUsR0FBRyxXQUFFLEVBQUUsV0FBRSxHQUFHLFdBQUU7QUFDaEM7QUFDQSxJQUFJLFdBQUUsR0FBRyxXQUFFLEdBQUcsV0FBRTtBQUNoQixJQUFJLFdBQUUsR0FBRyxXQUFFLEdBQUcsV0FBRTtBQUNoQixJQUFJLFdBQUUsR0FBRyxXQUFFLEdBQUcsV0FBRTtBQUNoQjtBQUNBO0FBQ0E7O0FBRUEsU0FBUyxzQkFBYTtBQUN0QixFQUFFLFdBQUU7QUFDSixFQUFFLFdBQUU7QUFDSixJQUFJLFdBQUU7QUFDTjs7QUFFQSxTQUFTLDBCQUFpQjtBQUMxQixFQUFFLHVCQUFjO0FBQ2hCOztBQUVBO0FBQ0EsRUFBRSx1QkFBYztBQUNoQixFQUFFLHNCQUFhLENBQUMsV0FBRSxNQUFNLFdBQUU7QUFDMUI7O0FBRUE7QUFDQSxlQUFlLFdBQUUsV0FBVyxXQUFFLE1BQU0sU0FBSTtBQUN4QyxFQUFFLFdBQUUsU0FBUyxXQUFFO0FBQ2YsRUFBRSxXQUFFLFNBQVMsV0FBRTtBQUNmLEVBQUUsV0FBRTtBQUNKLEVBQUUsc0JBQWEsQ0FBQyxXQUFFLE1BQU0sV0FBRTtBQUMxQjs7QUFFQSxTQUFTLHdCQUFlO0FBQ3hCLEVBQUUsdUJBQWMsU0FBUyxzQkFBYTtBQUN0Qzs7QUFFQSxTQUFTLDBCQUFpQjtBQUMxQixFQUFFLHVCQUFjO0FBQ2hCOztBQUVBLFNBQVMsd0JBQWU7QUFDeEIsb0JBQW9CLFlBQUcsRUFBRSxZQUFHO0FBQzVCOztBQUVBO0FBQ0EsRUFBRSx1QkFBYztBQUNoQixFQUFFLHNCQUFhLENBQUMsWUFBRyxHQUFHLFdBQUUsTUFBTSxZQUFHLEdBQUcsV0FBRTtBQUN0Qzs7QUFFQTtBQUNBLGVBQWUsV0FBRTtBQUNqQixlQUFlLFdBQUU7QUFDakIsVUFBVSxTQUFJOztBQUVkLEVBQUUsV0FBRSxTQUFTLFdBQUU7QUFDZixFQUFFLFdBQUUsU0FBUyxXQUFFO0FBQ2YsRUFBRSxXQUFFOztBQUVKLE1BQU0sV0FBRSxPQUFPLFdBQUU7QUFDakIsRUFBRSxXQUFFLFNBQVMsV0FBRTtBQUNmLEVBQUUsV0FBRSxTQUFTLFdBQUU7QUFDZixFQUFFLFdBQUU7QUFDSixFQUFFLHNCQUFhLENBQUMsV0FBRSxNQUFNLFdBQUU7QUFDMUI7O0FBRUEsb0RBQWUsdUVBQWMsSUFBQzs7O0FDbkdDO0FBQ0Q7O0FBRWYsU0FBUyxtQkFBVztBQUNuQztBQUNBOztBQUVBLG1CQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUFpRCxRQUFHO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxVQUFVLElBQUk7QUFDZDs7O0FDNUMrQjtBQUNDO0FBQ0Y7O0FBRTlCLElBQUksaUJBQVMsT0FBTyxpQkFBSztBQUN6QjtBQUNBLElBQUksV0FBRztBQUNQLElBQUksV0FBRztBQUNQLElBQUksVUFBRTtBQUNOLElBQUksVUFBRTs7QUFFTixJQUFJLG9CQUFZO0FBQ2hCLFNBQVMsSUFBSTtBQUNiO0FBQ0EsSUFBSSxvQkFBWSxTQUFTLHdCQUFnQjtBQUN6QyxHQUFHO0FBQ0g7QUFDQSxvQkFBb0IsbUJBQVcsQ0FBQyxXQUFHLEVBQUUsV0FBRztBQUN4QyxJQUFJLG9CQUFZLFNBQVMsSUFBSTtBQUM3QixHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0Esa0JBQWtCLGlCQUFTO0FBQzNCLElBQUksaUJBQVMsT0FBTyxpQkFBSztBQUN6QjtBQUNBO0FBQ0E7O0FBRUEsU0FBUyx3QkFBZ0I7QUFDekIsRUFBRSxvQkFBWSxTQUFTLG1CQUFXO0FBQ2xDLEVBQUUsV0FBRyxHQUFHLFVBQUUsTUFBTSxXQUFHLEdBQUcsVUFBRTtBQUN4Qjs7QUFFQSxTQUFTLG1CQUFXO0FBQ3BCLEVBQUUsVUFBRSxPQUFPLFVBQUU7QUFDYixFQUFFLGlCQUFTLEtBQUssU0FBSSxDQUFDLFVBQUUsR0FBRyxVQUFFLEdBQUcsVUFBRSxHQUFHLFVBQUU7QUFDdEMsRUFBRSxVQUFFLE1BQU0sVUFBRTtBQUNaOztBQUVBLDhDQUFlLG9FQUFZLElBQUM7OztBQzVDNUI7QUFDQTs7QUFFZSxNQUFNLGlCQUFVO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLEVBQUUsR0FBRyxFQUFFO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLEVBQUUsR0FBRyxFQUFFO0FBQy9CO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixFQUFFLEdBQUcsRUFBRTtBQUMvQjtBQUNBO0FBQ0E7QUFDQSx1QkFBdUI7QUFDdkIsNEJBQTRCLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxVQUFVLE9BQU8sR0FBRyxFQUFFLEdBQUcsR0FBRyxVQUFVLE1BQU07QUFDckY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDLE9BQU87QUFDeEM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx5REFBeUQsT0FBTztBQUNoRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyxPQUFPO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDckZzQztBQUNKO0FBQ0Q7QUFDSTtBQUNJO0FBQ0Y7QUFDQTtBQUNGOztBQUVyQyw2QkFBZSxjQUFTO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZEQUE2RCxFQUFFO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7O0FDM0VBLDZCQUFlLG1CQUFTO0FBQ3hCO0FBQ0EsWUFBWSxxQkFBVztBQUN2QjtBQUNBOztBQUVPLFNBQVMscUJBQVc7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLDBCQUEwQiwwQkFBMEI7QUFDcEQsdUJBQXVCLHVCQUF1QjtBQUM5QywwQkFBMEIsMEJBQTBCO0FBQ3BELHdCQUF3Qix3QkFBd0I7QUFDaEQsNkJBQTZCLDZCQUE2QjtBQUMxRCwyQkFBMkI7QUFDM0I7OztBQ3pCa0Q7QUFDTDs7QUFFN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPLFNBQVMsYUFBUztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFTyxTQUFTLFdBQU87QUFDdkIsU0FBUyxhQUFTO0FBQ2xCOztBQUVPLFNBQVMsWUFBUTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRU8sU0FBUyxhQUFTO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7O0FDOUMwQztBQUMrQjtBQUM3Qjs7QUFFNUM7QUFDQSxxQkFBcUIsUUFBRyxNQUFNLFlBQU8sR0FBRzs7QUFFeEMsNkJBQWUsNkJBQVM7QUFDeEIsbUJBQW1CLGlCQUFRO0FBQzNCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQSxTQUFTLGlCQUFROztBQUVqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZEQUE2RDtBQUM3RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUNBQXFDOztBQUVyQztBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQyx1QkFBdUIsdUNBQXVDO0FBQy9GLCtCQUErQixxQkFBcUI7QUFDcEQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQ3JHdUQ7QUFDWjtBQUNNO0FBQ2I7QUFDRTtBQUNzQjtBQUNmO0FBQ0Q7QUFDcUI7QUFDNUI7O0FBRXJDLHVCQUF1QixxQkFBVztBQUNsQztBQUNBLDBCQUEwQixZQUFPLE1BQU0sWUFBTztBQUM5QztBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFZSxTQUFTLHFCQUFVO0FBQ2xDLFNBQVMsNEJBQWlCLGNBQWMsaUJBQWlCO0FBQ3pEOztBQUVPLFNBQVMsNEJBQWlCO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2hMZ0Q7QUFDSDs7QUFFdEMsU0FBUyxxQkFBZTtBQUMvQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7O0FDZDBDOztBQUVuQyxTQUFTLDRDQUF1QjtBQUN2Qzs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7OztBQ2QrRTtBQUNwQztBQUN1Qjs7QUFFM0Q7QUFDUDs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsNkJBQWUscUNBQVc7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7OztBQ2hDaUQ7O0FBRWpELDZCQUFlLDZCQUFXO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNUbUM7QUFDRjtBQUNnQjtBQUNnQjs7QUFFakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixZQUFZLHlDQUF5QztBQUNqRix5QkFBeUIsWUFBWSxzQ0FBc0M7QUFDM0UsNEJBQTRCLFlBQVkseUNBQXlDO0FBQ2pGLDBCQUEwQixZQUFZLHVDQUF1QztBQUM3RSwrQkFBK0IsWUFBWSw0Q0FBNEM7QUFDdkYsNkJBQTZCLFlBQVk7QUFDekM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQWUscUJBQVc7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0Qix3QkFBd0I7O0FBRXBEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7QUM5R3VEOztBQUVoRDtBQUNQO0FBQ0EsYUFBYSxRQUFHO0FBQ2hCLGFBQWEsUUFBRztBQUNoQjtBQUNBO0FBQ0E7QUFDQSxlQUFlLFFBQUc7QUFDbEIsVUFBVSxRQUFHO0FBQ2I7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQSxZQUFZLFNBQUk7QUFDaEI7QUFDQSxhQUFhLFFBQUc7QUFDaEIsYUFBYSxRQUFHO0FBQ2hCO0FBQ0EsTUFBTSxVQUFLO0FBQ1gsTUFBTSxTQUFJO0FBQ1Y7QUFDQTtBQUNBOzs7QUMxQnNDO0FBQ3VCO0FBQ3pCOztBQUU3Qiw0QkFBNEIsWUFBWTtBQUMvQyxTQUFTLFNBQUk7QUFDYixDQUFDOztBQUVELCtCQUErQixlQUFlO0FBQzlDLGFBQWEsU0FBSTtBQUNqQixDQUFDOztBQUVELDZCQUFlLDhCQUFXO0FBQzFCO0FBQ0E7QUFDQTtBQUNBOzs7QUNoQnFDO0FBQ3dCO0FBQ3pCOztBQUU3Qiw4QkFBOEIsWUFBWTtBQUNqRCxjQUFjLFNBQUksWUFBWSxRQUFHO0FBQ2pDLENBQUM7O0FBRUQsaUNBQWlDLGVBQWU7QUFDaEQ7QUFDQSxDQUFDOztBQUVELDZCQUFlLGdDQUFXO0FBQzFCO0FBQ0E7QUFDQTtBQUNBOzs7QUNoQmdFO0FBQzFCO0FBQ0Y7O0FBRTdCLFNBQVMsb0JBQVc7QUFDM0Isa0JBQWtCLFFBQUcsQ0FBQyxRQUFHLEVBQUUsV0FBTTtBQUNqQzs7QUFFQSxvQkFBVztBQUNYLGlCQUFpQixTQUFJLENBQUMsR0FBRyxPQUFPLFdBQU07QUFDdEM7O0FBRUEsNkJBQWUsb0JBQVc7QUFDMUIsU0FBUywyQkFBa0IsQ0FBQyxvQkFBVztBQUN2QztBQUNBOztBQUVPLFNBQVMsMkJBQWtCO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkI7O0FBRTdCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFFQUFxRSxvQkFBVztBQUNoRjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7O0FDbkRzRztBQUMzRDtBQUNEOztBQUUxQztBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxpQkFBaUI7QUFDakIsV0FBVztBQUNYO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLDZCQUFlLDBCQUFXO0FBQzFCO0FBQ0E7QUFDQTtBQUNBOzs7QUNyQ29DOztBQUU3QixTQUFTLGtDQUFrQjtBQUNsQztBQUNBOztBQUVBLGtDQUFrQixVQUFVLGtDQUFrQjs7QUFFOUMsNkJBQWUsMkJBQVc7QUFDMUIsb0JBQW9CLGtDQUFrQjtBQUN0QztBQUNBOzs7QUNYeUU7QUFDOUI7QUFDYTs7QUFFakQ7QUFDUDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSw2QkFBZSw0QkFBVztBQUMxQjtBQUNBO0FBQ0E7QUFDQTs7O0FDL0JvQztBQUMyQjs7QUFFL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLFNBQUk7QUFDWjs7QUFFTztBQUNQLFVBQVUsU0FBSSxLQUFLLFFBQUc7QUFDdEI7QUFDQSxhQUFhLFFBQUc7QUFDaEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxrQ0FBa0MsZ0JBQWdCO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsUUFBRyxVQUFVLGFBQVE7QUFDN0I7QUFDQTtBQUNBLCtEQUErRCxRQUFHO0FBQ2xFLElBQUksU0FBSSxDQUFDLFFBQUc7QUFDWjtBQUNBOztBQUVBLDZCQUFlLHNCQUFXO0FBQzFCO0FBQ0E7QUFDQTs7O0FDbkMwQztBQUNLO0FBQ1g7O0FBRTdCO0FBQ1AsV0FBVyxRQUFHLFNBQVMsUUFBRztBQUMxQixlQUFlLFFBQUcsU0FBUyxRQUFHO0FBQzlCOztBQUVBLHFCQUFxQixlQUFlLENBQUMsU0FBSTs7QUFFekMsNkJBQWUsb0JBQVc7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7OztBQ2ZpRDtBQUNYO0FBQ007QUFDcUI7QUFDWDs7QUFFdEQsNkJBQWUsK0JBQVc7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7OztBQ3BGb0M7QUFDSTs7QUFFakM7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxPQUFPLFFBQUcsVUFBVSxZQUFPO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsNkJBQWUseUJBQVc7QUFDMUI7QUFDQTtBQUNBOzs7QUMzQm1EO0FBQ0o7QUFDWDs7QUFFN0I7QUFDUCxVQUFVLFFBQUcsTUFBTSxRQUFHLEtBQUssUUFBRztBQUM5Qjs7QUFFQSx5QkFBeUIsZUFBZSxDQUFDLFNBQUk7O0FBRTdDLDZCQUFlLHdCQUFXO0FBQzFCO0FBQ0E7QUFDQTtBQUNBOzs7QUNkMEM7QUFDSztBQUNYOztBQUU3QjtBQUNQLFdBQVcsUUFBRyxhQUFhLFFBQUc7QUFDOUIsZUFBZSxRQUFHLFNBQVMsUUFBRztBQUM5Qjs7QUFFQSwwQkFBMEIsZUFBZTtBQUN6QyxhQUFhLFNBQUk7QUFDakIsQ0FBQzs7QUFFRCw2QkFBZSx5QkFBVztBQUMxQjtBQUNBO0FBQ0E7QUFDQTs7O0FDakJ1RDtBQUNOOztBQUUxQztBQUNQLFVBQVUsUUFBRyxDQUFDLFFBQUcsRUFBRSxXQUFNO0FBQ3pCOztBQUVBO0FBQ0Esa0JBQWtCLFNBQUksQ0FBQyxHQUFHLE9BQU8sV0FBTTtBQUN2Qzs7QUFFQSw2QkFBZSw4QkFBVztBQUMxQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQzFCNkM7QUFDSTtBQUNJO0FBQ0o7QUFDcUI7QUFDWjtBQUNBLENBQUM7QUFDSztBQUNYO0FBQ0E7QUFDaUM7QUFDM0I7QUFDVjtBQUNFO0FBQ1M7QUFDTTtBQUNxRTtBQUNRO0FBQ3hCO0FBQ0E7QUFDUTtBQUN4QjtBQUNvQjtBQUM1QjtBQUMvQjtBQUMwQztBQUNYO0FBQ29CO0FBQ0o7QUFDSTtBQUNvQjtBQUNsRjtBQUNKO0FBQ00iLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL21hdGguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9ub29wLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvc3RyZWFtLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvYXJlYS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2NhcnRlc2lhbi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2JvdW5kcy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2NlbnRyb2lkLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY29uc3RhbnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jb21wb3NlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcm90YXRpb24uanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jaXJjbGUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jbGlwL2J1ZmZlci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3BvaW50RXF1YWwuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jbGlwL3Jlam9pbi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3BvbHlnb25Db250YWlucy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2NsaXAvaW5kZXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jbGlwL2FudGltZXJpZGlhbi5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2NsaXAvY2lyY2xlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2xpcC9saW5lLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2xpcC9yZWN0YW5nbGUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jbGlwL2V4dGVudC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2xlbmd0aC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2Rpc3RhbmNlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY29udGFpbnMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9ncmF0aWN1bGUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9pbnRlcnBvbGF0ZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2lkZW50aXR5LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9hcmVhLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9ib3VuZHMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wYXRoL2NlbnRyb2lkLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9jb250ZXh0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9tZWFzdXJlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9zdHJpbmcuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wYXRoL2luZGV4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvdHJhbnNmb3JtLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcHJvamVjdGlvbi9maXQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL3Jlc2FtcGxlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcHJvamVjdGlvbi9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vY29uaWMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2N5bGluZHJpY2FsRXF1YWxBcmVhLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcHJvamVjdGlvbi9jb25pY0VxdWFsQXJlYS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vYWxiZXJzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcHJvamVjdGlvbi9hbGJlcnNVc2EuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2F6aW11dGhhbC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vYXppbXV0aGFsRXF1YWxBcmVhLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcHJvamVjdGlvbi9hemltdXRoYWxFcXVpZGlzdGFudC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vbWVyY2F0b3IuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2NvbmljQ29uZm9ybWFsLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcHJvamVjdGlvbi9lcXVpcmVjdGFuZ3VsYXIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2NvbmljRXF1aWRpc3RhbnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2VxdWFsRWFydGguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2dub21vbmljLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcHJvamVjdGlvbi9pZGVudGl0eS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vbmF0dXJhbEVhcnRoMS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vb3J0aG9ncmFwaGljLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcHJvamVjdGlvbi9zdGVyZW9ncmFwaGljLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcHJvamVjdGlvbi90cmFuc3ZlcnNlTWVyY2F0b3IuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgdmFyIGVwc2lsb24gPSAxZS02O1xuZXhwb3J0IHZhciBlcHNpbG9uMiA9IDFlLTEyO1xuZXhwb3J0IHZhciBwaSA9IE1hdGguUEk7XG5leHBvcnQgdmFyIGhhbGZQaSA9IHBpIC8gMjtcbmV4cG9ydCB2YXIgcXVhcnRlclBpID0gcGkgLyA0O1xuZXhwb3J0IHZhciB0YXUgPSBwaSAqIDI7XG5cbmV4cG9ydCB2YXIgZGVncmVlcyA9IDE4MCAvIHBpO1xuZXhwb3J0IHZhciByYWRpYW5zID0gcGkgLyAxODA7XG5cbmV4cG9ydCB2YXIgYWJzID0gTWF0aC5hYnM7XG5leHBvcnQgdmFyIGF0YW4gPSBNYXRoLmF0YW47XG5leHBvcnQgdmFyIGF0YW4yID0gTWF0aC5hdGFuMjtcbmV4cG9ydCB2YXIgY29zID0gTWF0aC5jb3M7XG5leHBvcnQgdmFyIGNlaWwgPSBNYXRoLmNlaWw7XG5leHBvcnQgdmFyIGV4cCA9IE1hdGguZXhwO1xuZXhwb3J0IHZhciBmbG9vciA9IE1hdGguZmxvb3I7XG5leHBvcnQgdmFyIGh5cG90ID0gTWF0aC5oeXBvdDtcbmV4cG9ydCB2YXIgbG9nID0gTWF0aC5sb2c7XG5leHBvcnQgdmFyIHBvdyA9IE1hdGgucG93O1xuZXhwb3J0IHZhciBzaW4gPSBNYXRoLnNpbjtcbmV4cG9ydCB2YXIgc2lnbiA9IE1hdGguc2lnbiB8fCBmdW5jdGlvbih4KSB7IHJldHVybiB4ID4gMCA/IDEgOiB4IDwgMCA/IC0xIDogMDsgfTtcbmV4cG9ydCB2YXIgc3FydCA9IE1hdGguc3FydDtcbmV4cG9ydCB2YXIgdGFuID0gTWF0aC50YW47XG5cbmV4cG9ydCBmdW5jdGlvbiBhY29zKHgpIHtcbiAgcmV0dXJuIHggPiAxID8gMCA6IHggPCAtMSA/IHBpIDogTWF0aC5hY29zKHgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNpbih4KSB7XG4gIHJldHVybiB4ID4gMSA/IGhhbGZQaSA6IHggPCAtMSA/IC1oYWxmUGkgOiBNYXRoLmFzaW4oeCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXZlcnNpbih4KSB7XG4gIHJldHVybiAoeCA9IHNpbih4IC8gMikpICogeDtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5vb3AoKSB7fVxuIiwiZnVuY3Rpb24gc3RyZWFtR2VvbWV0cnkoZ2VvbWV0cnksIHN0cmVhbSkge1xuICBpZiAoZ2VvbWV0cnkgJiYgc3RyZWFtR2VvbWV0cnlUeXBlLmhhc093blByb3BlcnR5KGdlb21ldHJ5LnR5cGUpKSB7XG4gICAgc3RyZWFtR2VvbWV0cnlUeXBlW2dlb21ldHJ5LnR5cGVdKGdlb21ldHJ5LCBzdHJlYW0pO1xuICB9XG59XG5cbnZhciBzdHJlYW1PYmplY3RUeXBlID0ge1xuICBGZWF0dXJlOiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHN0cmVhbUdlb21ldHJ5KG9iamVjdC5nZW9tZXRyeSwgc3RyZWFtKTtcbiAgfSxcbiAgRmVhdHVyZUNvbGxlY3Rpb246IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgdmFyIGZlYXR1cmVzID0gb2JqZWN0LmZlYXR1cmVzLCBpID0gLTEsIG4gPSBmZWF0dXJlcy5sZW5ndGg7XG4gICAgd2hpbGUgKCsraSA8IG4pIHN0cmVhbUdlb21ldHJ5KGZlYXR1cmVzW2ldLmdlb21ldHJ5LCBzdHJlYW0pO1xuICB9XG59O1xuXG52YXIgc3RyZWFtR2VvbWV0cnlUeXBlID0ge1xuICBTcGhlcmU6IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgc3RyZWFtLnNwaGVyZSgpO1xuICB9LFxuICBQb2ludDogZnVuY3Rpb24ob2JqZWN0LCBzdHJlYW0pIHtcbiAgICBvYmplY3QgPSBvYmplY3QuY29vcmRpbmF0ZXM7XG4gICAgc3RyZWFtLnBvaW50KG9iamVjdFswXSwgb2JqZWN0WzFdLCBvYmplY3RbMl0pO1xuICB9LFxuICBNdWx0aVBvaW50OiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHZhciBjb29yZGluYXRlcyA9IG9iamVjdC5jb29yZGluYXRlcywgaSA9IC0xLCBuID0gY29vcmRpbmF0ZXMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSBvYmplY3QgPSBjb29yZGluYXRlc1tpXSwgc3RyZWFtLnBvaW50KG9iamVjdFswXSwgb2JqZWN0WzFdLCBvYmplY3RbMl0pO1xuICB9LFxuICBMaW5lU3RyaW5nOiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHN0cmVhbUxpbmUob2JqZWN0LmNvb3JkaW5hdGVzLCBzdHJlYW0sIDApO1xuICB9LFxuICBNdWx0aUxpbmVTdHJpbmc6IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgdmFyIGNvb3JkaW5hdGVzID0gb2JqZWN0LmNvb3JkaW5hdGVzLCBpID0gLTEsIG4gPSBjb29yZGluYXRlcy5sZW5ndGg7XG4gICAgd2hpbGUgKCsraSA8IG4pIHN0cmVhbUxpbmUoY29vcmRpbmF0ZXNbaV0sIHN0cmVhbSwgMCk7XG4gIH0sXG4gIFBvbHlnb246IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgc3RyZWFtUG9seWdvbihvYmplY3QuY29vcmRpbmF0ZXMsIHN0cmVhbSk7XG4gIH0sXG4gIE11bHRpUG9seWdvbjogZnVuY3Rpb24ob2JqZWN0LCBzdHJlYW0pIHtcbiAgICB2YXIgY29vcmRpbmF0ZXMgPSBvYmplY3QuY29vcmRpbmF0ZXMsIGkgPSAtMSwgbiA9IGNvb3JkaW5hdGVzLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbikgc3RyZWFtUG9seWdvbihjb29yZGluYXRlc1tpXSwgc3RyZWFtKTtcbiAgfSxcbiAgR2VvbWV0cnlDb2xsZWN0aW9uOiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHZhciBnZW9tZXRyaWVzID0gb2JqZWN0Lmdlb21ldHJpZXMsIGkgPSAtMSwgbiA9IGdlb21ldHJpZXMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSBzdHJlYW1HZW9tZXRyeShnZW9tZXRyaWVzW2ldLCBzdHJlYW0pO1xuICB9XG59O1xuXG5mdW5jdGlvbiBzdHJlYW1MaW5lKGNvb3JkaW5hdGVzLCBzdHJlYW0sIGNsb3NlZCkge1xuICB2YXIgaSA9IC0xLCBuID0gY29vcmRpbmF0ZXMubGVuZ3RoIC0gY2xvc2VkLCBjb29yZGluYXRlO1xuICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gIHdoaWxlICgrK2kgPCBuKSBjb29yZGluYXRlID0gY29vcmRpbmF0ZXNbaV0sIHN0cmVhbS5wb2ludChjb29yZGluYXRlWzBdLCBjb29yZGluYXRlWzFdLCBjb29yZGluYXRlWzJdKTtcbiAgc3RyZWFtLmxpbmVFbmQoKTtcbn1cblxuZnVuY3Rpb24gc3RyZWFtUG9seWdvbihjb29yZGluYXRlcywgc3RyZWFtKSB7XG4gIHZhciBpID0gLTEsIG4gPSBjb29yZGluYXRlcy5sZW5ndGg7XG4gIHN0cmVhbS5wb2x5Z29uU3RhcnQoKTtcbiAgd2hpbGUgKCsraSA8IG4pIHN0cmVhbUxpbmUoY29vcmRpbmF0ZXNbaV0sIHN0cmVhbSwgMSk7XG4gIHN0cmVhbS5wb2x5Z29uRW5kKCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gIGlmIChvYmplY3QgJiYgc3RyZWFtT2JqZWN0VHlwZS5oYXNPd25Qcm9wZXJ0eShvYmplY3QudHlwZSkpIHtcbiAgICBzdHJlYW1PYmplY3RUeXBlW29iamVjdC50eXBlXShvYmplY3QsIHN0cmVhbSk7XG4gIH0gZWxzZSB7XG4gICAgc3RyZWFtR2VvbWV0cnkob2JqZWN0LCBzdHJlYW0pO1xuICB9XG59XG4iLCJpbXBvcnQge0FkZGVyfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7YXRhbjIsIGNvcywgcXVhcnRlclBpLCByYWRpYW5zLCBzaW4sIHRhdX0gZnJvbSBcIi4vbWF0aC5qc1wiO1xuaW1wb3J0IG5vb3AgZnJvbSBcIi4vbm9vcC5qc1wiO1xuaW1wb3J0IHN0cmVhbSBmcm9tIFwiLi9zdHJlYW0uanNcIjtcblxuZXhwb3J0IHZhciBhcmVhUmluZ1N1bSA9IG5ldyBBZGRlcigpO1xuXG4vLyBoZWxsbz9cblxudmFyIGFyZWFTdW0gPSBuZXcgQWRkZXIoKSxcbiAgICBsYW1iZGEwMCxcbiAgICBwaGkwMCxcbiAgICBsYW1iZGEwLFxuICAgIGNvc1BoaTAsXG4gICAgc2luUGhpMDtcblxuZXhwb3J0IHZhciBhcmVhU3RyZWFtID0ge1xuICBwb2ludDogbm9vcCxcbiAgbGluZVN0YXJ0OiBub29wLFxuICBsaW5lRW5kOiBub29wLFxuICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIGFyZWFSaW5nU3VtID0gbmV3IEFkZGVyKCk7XG4gICAgYXJlYVN0cmVhbS5saW5lU3RhcnQgPSBhcmVhUmluZ1N0YXJ0O1xuICAgIGFyZWFTdHJlYW0ubGluZUVuZCA9IGFyZWFSaW5nRW5kO1xuICB9LFxuICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJlYVJpbmcgPSArYXJlYVJpbmdTdW07XG4gICAgYXJlYVN1bS5hZGQoYXJlYVJpbmcgPCAwID8gdGF1ICsgYXJlYVJpbmcgOiBhcmVhUmluZyk7XG4gICAgdGhpcy5saW5lU3RhcnQgPSB0aGlzLmxpbmVFbmQgPSB0aGlzLnBvaW50ID0gbm9vcDtcbiAgfSxcbiAgc3BoZXJlOiBmdW5jdGlvbigpIHtcbiAgICBhcmVhU3VtLmFkZCh0YXUpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBhcmVhUmluZ1N0YXJ0KCkge1xuICBhcmVhU3RyZWFtLnBvaW50ID0gYXJlYVBvaW50Rmlyc3Q7XG59XG5cbmZ1bmN0aW9uIGFyZWFSaW5nRW5kKCkge1xuICBhcmVhUG9pbnQobGFtYmRhMDAsIHBoaTAwKTtcbn1cblxuZnVuY3Rpb24gYXJlYVBvaW50Rmlyc3QobGFtYmRhLCBwaGkpIHtcbiAgYXJlYVN0cmVhbS5wb2ludCA9IGFyZWFQb2ludDtcbiAgbGFtYmRhMDAgPSBsYW1iZGEsIHBoaTAwID0gcGhpO1xuICBsYW1iZGEgKj0gcmFkaWFucywgcGhpICo9IHJhZGlhbnM7XG4gIGxhbWJkYTAgPSBsYW1iZGEsIGNvc1BoaTAgPSBjb3MocGhpID0gcGhpIC8gMiArIHF1YXJ0ZXJQaSksIHNpblBoaTAgPSBzaW4ocGhpKTtcbn1cblxuZnVuY3Rpb24gYXJlYVBvaW50KGxhbWJkYSwgcGhpKSB7XG4gIGxhbWJkYSAqPSByYWRpYW5zLCBwaGkgKj0gcmFkaWFucztcbiAgcGhpID0gcGhpIC8gMiArIHF1YXJ0ZXJQaTsgLy8gaGFsZiB0aGUgYW5ndWxhciBkaXN0YW5jZSBmcm9tIHNvdXRoIHBvbGVcblxuICAvLyBTcGhlcmljYWwgZXhjZXNzIEUgZm9yIGEgc3BoZXJpY2FsIHRyaWFuZ2xlIHdpdGggdmVydGljZXM6IHNvdXRoIHBvbGUsXG4gIC8vIHByZXZpb3VzIHBvaW50LCBjdXJyZW50IHBvaW50LiAgVXNlcyBhIGZvcm11bGEgZGVyaXZlZCBmcm9tIENhZ25vbGnigJlzXG4gIC8vIHRoZW9yZW0uICBTZWUgVG9kaHVudGVyLCBTcGhlcmljYWwgVHJpZy4gKDE4NzEpLCBTZWMuIDEwMywgRXEuICgyKS5cbiAgdmFyIGRMYW1iZGEgPSBsYW1iZGEgLSBsYW1iZGEwLFxuICAgICAgc2RMYW1iZGEgPSBkTGFtYmRhID49IDAgPyAxIDogLTEsXG4gICAgICBhZExhbWJkYSA9IHNkTGFtYmRhICogZExhbWJkYSxcbiAgICAgIGNvc1BoaSA9IGNvcyhwaGkpLFxuICAgICAgc2luUGhpID0gc2luKHBoaSksXG4gICAgICBrID0gc2luUGhpMCAqIHNpblBoaSxcbiAgICAgIHUgPSBjb3NQaGkwICogY29zUGhpICsgayAqIGNvcyhhZExhbWJkYSksXG4gICAgICB2ID0gayAqIHNkTGFtYmRhICogc2luKGFkTGFtYmRhKTtcbiAgYXJlYVJpbmdTdW0uYWRkKGF0YW4yKHYsIHUpKTtcblxuICAvLyBBZHZhbmNlIHRoZSBwcmV2aW91cyBwb2ludHMuXG4gIGxhbWJkYTAgPSBsYW1iZGEsIGNvc1BoaTAgPSBjb3NQaGksIHNpblBoaTAgPSBzaW5QaGk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG9iamVjdCkge1xuICBhcmVhU3VtID0gbmV3IEFkZGVyKCk7XG4gIHN0cmVhbShvYmplY3QsIGFyZWFTdHJlYW0pO1xuICByZXR1cm4gYXJlYVN1bSAqIDI7XG59XG4iLCJpbXBvcnQge2FzaW4sIGF0YW4yLCBjb3MsIHNpbiwgc3FydH0gZnJvbSBcIi4vbWF0aC5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gc3BoZXJpY2FsKGNhcnRlc2lhbikge1xuICByZXR1cm4gW2F0YW4yKGNhcnRlc2lhblsxXSwgY2FydGVzaWFuWzBdKSwgYXNpbihjYXJ0ZXNpYW5bMl0pXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhcnRlc2lhbihzcGhlcmljYWwpIHtcbiAgdmFyIGxhbWJkYSA9IHNwaGVyaWNhbFswXSwgcGhpID0gc3BoZXJpY2FsWzFdLCBjb3NQaGkgPSBjb3MocGhpKTtcbiAgcmV0dXJuIFtjb3NQaGkgKiBjb3MobGFtYmRhKSwgY29zUGhpICogc2luKGxhbWJkYSksIHNpbihwaGkpXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhcnRlc2lhbkRvdChhLCBiKSB7XG4gIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYXJ0ZXNpYW5Dcm9zcyhhLCBiKSB7XG4gIHJldHVybiBbYVsxXSAqIGJbMl0gLSBhWzJdICogYlsxXSwgYVsyXSAqIGJbMF0gLSBhWzBdICogYlsyXSwgYVswXSAqIGJbMV0gLSBhWzFdICogYlswXV07XG59XG5cbi8vIFRPRE8gcmV0dXJuIGFcbmV4cG9ydCBmdW5jdGlvbiBjYXJ0ZXNpYW5BZGRJblBsYWNlKGEsIGIpIHtcbiAgYVswXSArPSBiWzBdLCBhWzFdICs9IGJbMV0sIGFbMl0gKz0gYlsyXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhcnRlc2lhblNjYWxlKHZlY3Rvciwgaykge1xuICByZXR1cm4gW3ZlY3RvclswXSAqIGssIHZlY3RvclsxXSAqIGssIHZlY3RvclsyXSAqIGtdO1xufVxuXG4vLyBUT0RPIHJldHVybiBkXG5leHBvcnQgZnVuY3Rpb24gY2FydGVzaWFuTm9ybWFsaXplSW5QbGFjZShkKSB7XG4gIHZhciBsID0gc3FydChkWzBdICogZFswXSArIGRbMV0gKiBkWzFdICsgZFsyXSAqIGRbMl0pO1xuICBkWzBdIC89IGwsIGRbMV0gLz0gbCwgZFsyXSAvPSBsO1xufVxuIiwiaW1wb3J0IHtBZGRlcn0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2FyZWFTdHJlYW0sIGFyZWFSaW5nU3VtfSBmcm9tIFwiLi9hcmVhLmpzXCI7XG5pbXBvcnQge2NhcnRlc2lhbiwgY2FydGVzaWFuQ3Jvc3MsIGNhcnRlc2lhbk5vcm1hbGl6ZUluUGxhY2UsIHNwaGVyaWNhbH0gZnJvbSBcIi4vY2FydGVzaWFuLmpzXCI7XG5pbXBvcnQge2FicywgZGVncmVlcywgZXBzaWxvbiwgcmFkaWFuc30gZnJvbSBcIi4vbWF0aC5qc1wiO1xuaW1wb3J0IHN0cmVhbSBmcm9tIFwiLi9zdHJlYW0uanNcIjtcblxudmFyIGxhbWJkYTAsIHBoaTAsIGxhbWJkYTEsIHBoaTEsIC8vIGJvdW5kc1xuICAgIGxhbWJkYTIsIC8vIHByZXZpb3VzIGxhbWJkYS1jb29yZGluYXRlXG4gICAgbGFtYmRhMDAsIHBoaTAwLCAvLyBmaXJzdCBwb2ludFxuICAgIHAwLCAvLyBwcmV2aW91cyAzRCBwb2ludFxuICAgIGRlbHRhU3VtLFxuICAgIHJhbmdlcyxcbiAgICByYW5nZTtcblxudmFyIGJvdW5kc1N0cmVhbSA9IHtcbiAgcG9pbnQ6IGJvdW5kc1BvaW50LFxuICBsaW5lU3RhcnQ6IGJvdW5kc0xpbmVTdGFydCxcbiAgbGluZUVuZDogYm91bmRzTGluZUVuZCxcbiAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICBib3VuZHNTdHJlYW0ucG9pbnQgPSBib3VuZHNSaW5nUG9pbnQ7XG4gICAgYm91bmRzU3RyZWFtLmxpbmVTdGFydCA9IGJvdW5kc1JpbmdTdGFydDtcbiAgICBib3VuZHNTdHJlYW0ubGluZUVuZCA9IGJvdW5kc1JpbmdFbmQ7XG4gICAgZGVsdGFTdW0gPSBuZXcgQWRkZXIoKTtcbiAgICBhcmVhU3RyZWFtLnBvbHlnb25TdGFydCgpO1xuICB9LFxuICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICBhcmVhU3RyZWFtLnBvbHlnb25FbmQoKTtcbiAgICBib3VuZHNTdHJlYW0ucG9pbnQgPSBib3VuZHNQb2ludDtcbiAgICBib3VuZHNTdHJlYW0ubGluZVN0YXJ0ID0gYm91bmRzTGluZVN0YXJ0O1xuICAgIGJvdW5kc1N0cmVhbS5saW5lRW5kID0gYm91bmRzTGluZUVuZDtcbiAgICBpZiAoYXJlYVJpbmdTdW0gPCAwKSBsYW1iZGEwID0gLShsYW1iZGExID0gMTgwKSwgcGhpMCA9IC0ocGhpMSA9IDkwKTtcbiAgICBlbHNlIGlmIChkZWx0YVN1bSA+IGVwc2lsb24pIHBoaTEgPSA5MDtcbiAgICBlbHNlIGlmIChkZWx0YVN1bSA8IC1lcHNpbG9uKSBwaGkwID0gLTkwO1xuICAgIHJhbmdlWzBdID0gbGFtYmRhMCwgcmFuZ2VbMV0gPSBsYW1iZGExO1xuICB9LFxuICBzcGhlcmU6IGZ1bmN0aW9uKCkge1xuICAgIGxhbWJkYTAgPSAtKGxhbWJkYTEgPSAxODApLCBwaGkwID0gLShwaGkxID0gOTApO1xuICB9XG59O1xuXG5mdW5jdGlvbiBib3VuZHNQb2ludChsYW1iZGEsIHBoaSkge1xuICByYW5nZXMucHVzaChyYW5nZSA9IFtsYW1iZGEwID0gbGFtYmRhLCBsYW1iZGExID0gbGFtYmRhXSk7XG4gIGlmIChwaGkgPCBwaGkwKSBwaGkwID0gcGhpO1xuICBpZiAocGhpID4gcGhpMSkgcGhpMSA9IHBoaTtcbn1cblxuZnVuY3Rpb24gbGluZVBvaW50KGxhbWJkYSwgcGhpKSB7XG4gIHZhciBwID0gY2FydGVzaWFuKFtsYW1iZGEgKiByYWRpYW5zLCBwaGkgKiByYWRpYW5zXSk7XG4gIGlmIChwMCkge1xuICAgIHZhciBub3JtYWwgPSBjYXJ0ZXNpYW5Dcm9zcyhwMCwgcCksXG4gICAgICAgIGVxdWF0b3JpYWwgPSBbbm9ybWFsWzFdLCAtbm9ybWFsWzBdLCAwXSxcbiAgICAgICAgaW5mbGVjdGlvbiA9IGNhcnRlc2lhbkNyb3NzKGVxdWF0b3JpYWwsIG5vcm1hbCk7XG4gICAgY2FydGVzaWFuTm9ybWFsaXplSW5QbGFjZShpbmZsZWN0aW9uKTtcbiAgICBpbmZsZWN0aW9uID0gc3BoZXJpY2FsKGluZmxlY3Rpb24pO1xuICAgIHZhciBkZWx0YSA9IGxhbWJkYSAtIGxhbWJkYTIsXG4gICAgICAgIHNpZ24gPSBkZWx0YSA+IDAgPyAxIDogLTEsXG4gICAgICAgIGxhbWJkYWkgPSBpbmZsZWN0aW9uWzBdICogZGVncmVlcyAqIHNpZ24sXG4gICAgICAgIHBoaWksXG4gICAgICAgIGFudGltZXJpZGlhbiA9IGFicyhkZWx0YSkgPiAxODA7XG4gICAgaWYgKGFudGltZXJpZGlhbiBeIChzaWduICogbGFtYmRhMiA8IGxhbWJkYWkgJiYgbGFtYmRhaSA8IHNpZ24gKiBsYW1iZGEpKSB7XG4gICAgICBwaGlpID0gaW5mbGVjdGlvblsxXSAqIGRlZ3JlZXM7XG4gICAgICBpZiAocGhpaSA+IHBoaTEpIHBoaTEgPSBwaGlpO1xuICAgIH0gZWxzZSBpZiAobGFtYmRhaSA9IChsYW1iZGFpICsgMzYwKSAlIDM2MCAtIDE4MCwgYW50aW1lcmlkaWFuIF4gKHNpZ24gKiBsYW1iZGEyIDwgbGFtYmRhaSAmJiBsYW1iZGFpIDwgc2lnbiAqIGxhbWJkYSkpIHtcbiAgICAgIHBoaWkgPSAtaW5mbGVjdGlvblsxXSAqIGRlZ3JlZXM7XG4gICAgICBpZiAocGhpaSA8IHBoaTApIHBoaTAgPSBwaGlpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocGhpIDwgcGhpMCkgcGhpMCA9IHBoaTtcbiAgICAgIGlmIChwaGkgPiBwaGkxKSBwaGkxID0gcGhpO1xuICAgIH1cbiAgICBpZiAoYW50aW1lcmlkaWFuKSB7XG4gICAgICBpZiAobGFtYmRhIDwgbGFtYmRhMikge1xuICAgICAgICBpZiAoYW5nbGUobGFtYmRhMCwgbGFtYmRhKSA+IGFuZ2xlKGxhbWJkYTAsIGxhbWJkYTEpKSBsYW1iZGExID0gbGFtYmRhO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGFuZ2xlKGxhbWJkYSwgbGFtYmRhMSkgPiBhbmdsZShsYW1iZGEwLCBsYW1iZGExKSkgbGFtYmRhMCA9IGxhbWJkYTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGxhbWJkYTEgPj0gbGFtYmRhMCkge1xuICAgICAgICBpZiAobGFtYmRhIDwgbGFtYmRhMCkgbGFtYmRhMCA9IGxhbWJkYTtcbiAgICAgICAgaWYgKGxhbWJkYSA+IGxhbWJkYTEpIGxhbWJkYTEgPSBsYW1iZGE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobGFtYmRhID4gbGFtYmRhMikge1xuICAgICAgICAgIGlmIChhbmdsZShsYW1iZGEwLCBsYW1iZGEpID4gYW5nbGUobGFtYmRhMCwgbGFtYmRhMSkpIGxhbWJkYTEgPSBsYW1iZGE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGFuZ2xlKGxhbWJkYSwgbGFtYmRhMSkgPiBhbmdsZShsYW1iZGEwLCBsYW1iZGExKSkgbGFtYmRhMCA9IGxhbWJkYTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByYW5nZXMucHVzaChyYW5nZSA9IFtsYW1iZGEwID0gbGFtYmRhLCBsYW1iZGExID0gbGFtYmRhXSk7XG4gIH1cbiAgaWYgKHBoaSA8IHBoaTApIHBoaTAgPSBwaGk7XG4gIGlmIChwaGkgPiBwaGkxKSBwaGkxID0gcGhpO1xuICBwMCA9IHAsIGxhbWJkYTIgPSBsYW1iZGE7XG59XG5cbmZ1bmN0aW9uIGJvdW5kc0xpbmVTdGFydCgpIHtcbiAgYm91bmRzU3RyZWFtLnBvaW50ID0gbGluZVBvaW50O1xufVxuXG5mdW5jdGlvbiBib3VuZHNMaW5lRW5kKCkge1xuICByYW5nZVswXSA9IGxhbWJkYTAsIHJhbmdlWzFdID0gbGFtYmRhMTtcbiAgYm91bmRzU3RyZWFtLnBvaW50ID0gYm91bmRzUG9pbnQ7XG4gIHAwID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gYm91bmRzUmluZ1BvaW50KGxhbWJkYSwgcGhpKSB7XG4gIGlmIChwMCkge1xuICAgIHZhciBkZWx0YSA9IGxhbWJkYSAtIGxhbWJkYTI7XG4gICAgZGVsdGFTdW0uYWRkKGFicyhkZWx0YSkgPiAxODAgPyBkZWx0YSArIChkZWx0YSA+IDAgPyAzNjAgOiAtMzYwKSA6IGRlbHRhKTtcbiAgfSBlbHNlIHtcbiAgICBsYW1iZGEwMCA9IGxhbWJkYSwgcGhpMDAgPSBwaGk7XG4gIH1cbiAgYXJlYVN0cmVhbS5wb2ludChsYW1iZGEsIHBoaSk7XG4gIGxpbmVQb2ludChsYW1iZGEsIHBoaSk7XG59XG5cbmZ1bmN0aW9uIGJvdW5kc1JpbmdTdGFydCgpIHtcbiAgYXJlYVN0cmVhbS5saW5lU3RhcnQoKTtcbn1cblxuZnVuY3Rpb24gYm91bmRzUmluZ0VuZCgpIHtcbiAgYm91bmRzUmluZ1BvaW50KGxhbWJkYTAwLCBwaGkwMCk7XG4gIGFyZWFTdHJlYW0ubGluZUVuZCgpO1xuICBpZiAoYWJzKGRlbHRhU3VtKSA+IGVwc2lsb24pIGxhbWJkYTAgPSAtKGxhbWJkYTEgPSAxODApO1xuICByYW5nZVswXSA9IGxhbWJkYTAsIHJhbmdlWzFdID0gbGFtYmRhMTtcbiAgcDAgPSBudWxsO1xufVxuXG4vLyBGaW5kcyB0aGUgbGVmdC1yaWdodCBkaXN0YW5jZSBiZXR3ZWVuIHR3byBsb25naXR1ZGVzLlxuLy8gVGhpcyBpcyBhbG1vc3QgdGhlIHNhbWUgYXMgKGxhbWJkYTEgLSBsYW1iZGEwICsgMzYwwrApICUgMzYwwrAsIGV4Y2VwdCB0aGF0IHdlIHdhbnRcbi8vIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIMKxMTgwwrAgdG8gYmUgMzYwwrAuXG5mdW5jdGlvbiBhbmdsZShsYW1iZGEwLCBsYW1iZGExKSB7XG4gIHJldHVybiAobGFtYmRhMSAtPSBsYW1iZGEwKSA8IDAgPyBsYW1iZGExICsgMzYwIDogbGFtYmRhMTtcbn1cblxuZnVuY3Rpb24gcmFuZ2VDb21wYXJlKGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gLSBiWzBdO1xufVxuXG5mdW5jdGlvbiByYW5nZUNvbnRhaW5zKHJhbmdlLCB4KSB7XG4gIHJldHVybiByYW5nZVswXSA8PSByYW5nZVsxXSA/IHJhbmdlWzBdIDw9IHggJiYgeCA8PSByYW5nZVsxXSA6IHggPCByYW5nZVswXSB8fCByYW5nZVsxXSA8IHg7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGZlYXR1cmUpIHtcbiAgdmFyIGksIG4sIGEsIGIsIG1lcmdlZCwgZGVsdGFNYXgsIGRlbHRhO1xuXG4gIHBoaTEgPSBsYW1iZGExID0gLShsYW1iZGEwID0gcGhpMCA9IEluZmluaXR5KTtcbiAgcmFuZ2VzID0gW107XG4gIHN0cmVhbShmZWF0dXJlLCBib3VuZHNTdHJlYW0pO1xuXG4gIC8vIEZpcnN0LCBzb3J0IHJhbmdlcyBieSB0aGVpciBtaW5pbXVtIGxvbmdpdHVkZXMuXG4gIGlmIChuID0gcmFuZ2VzLmxlbmd0aCkge1xuICAgIHJhbmdlcy5zb3J0KHJhbmdlQ29tcGFyZSk7XG5cbiAgICAvLyBUaGVuLCBtZXJnZSBhbnkgcmFuZ2VzIHRoYXQgb3ZlcmxhcC5cbiAgICBmb3IgKGkgPSAxLCBhID0gcmFuZ2VzWzBdLCBtZXJnZWQgPSBbYV07IGkgPCBuOyArK2kpIHtcbiAgICAgIGIgPSByYW5nZXNbaV07XG4gICAgICBpZiAocmFuZ2VDb250YWlucyhhLCBiWzBdKSB8fCByYW5nZUNvbnRhaW5zKGEsIGJbMV0pKSB7XG4gICAgICAgIGlmIChhbmdsZShhWzBdLCBiWzFdKSA+IGFuZ2xlKGFbMF0sIGFbMV0pKSBhWzFdID0gYlsxXTtcbiAgICAgICAgaWYgKGFuZ2xlKGJbMF0sIGFbMV0pID4gYW5nbGUoYVswXSwgYVsxXSkpIGFbMF0gPSBiWzBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVyZ2VkLnB1c2goYSA9IGIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEZpbmFsbHksIGZpbmQgdGhlIGxhcmdlc3QgZ2FwIGJldHdlZW4gdGhlIG1lcmdlZCByYW5nZXMuXG4gICAgLy8gVGhlIGZpbmFsIGJvdW5kaW5nIGJveCB3aWxsIGJlIHRoZSBpbnZlcnNlIG9mIHRoaXMgZ2FwLlxuICAgIGZvciAoZGVsdGFNYXggPSAtSW5maW5pdHksIG4gPSBtZXJnZWQubGVuZ3RoIC0gMSwgaSA9IDAsIGEgPSBtZXJnZWRbbl07IGkgPD0gbjsgYSA9IGIsICsraSkge1xuICAgICAgYiA9IG1lcmdlZFtpXTtcbiAgICAgIGlmICgoZGVsdGEgPSBhbmdsZShhWzFdLCBiWzBdKSkgPiBkZWx0YU1heCkgZGVsdGFNYXggPSBkZWx0YSwgbGFtYmRhMCA9IGJbMF0sIGxhbWJkYTEgPSBhWzFdO1xuICAgIH1cbiAgfVxuXG4gIHJhbmdlcyA9IHJhbmdlID0gbnVsbDtcblxuICByZXR1cm4gbGFtYmRhMCA9PT0gSW5maW5pdHkgfHwgcGhpMCA9PT0gSW5maW5pdHlcbiAgICAgID8gW1tOYU4sIE5hTl0sIFtOYU4sIE5hTl1dXG4gICAgICA6IFtbbGFtYmRhMCwgcGhpMF0sIFtsYW1iZGExLCBwaGkxXV07XG59XG4iLCJpbXBvcnQge0FkZGVyfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7YXNpbiwgYXRhbjIsIGNvcywgZGVncmVlcywgZXBzaWxvbiwgZXBzaWxvbjIsIGh5cG90LCByYWRpYW5zLCBzaW4sIHNxcnR9IGZyb20gXCIuL21hdGguanNcIjtcbmltcG9ydCBub29wIGZyb20gXCIuL25vb3AuanNcIjtcbmltcG9ydCBzdHJlYW0gZnJvbSBcIi4vc3RyZWFtLmpzXCI7XG5cbnZhciBXMCwgVzEsXG4gICAgWDAsIFkwLCBaMCxcbiAgICBYMSwgWTEsIFoxLFxuICAgIFgyLCBZMiwgWjIsXG4gICAgbGFtYmRhMDAsIHBoaTAwLCAvLyBmaXJzdCBwb2ludFxuICAgIHgwLCB5MCwgejA7IC8vIHByZXZpb3VzIHBvaW50XG5cbnZhciBjZW50cm9pZFN0cmVhbSA9IHtcbiAgc3BoZXJlOiBub29wLFxuICBwb2ludDogY2VudHJvaWRQb2ludCxcbiAgbGluZVN0YXJ0OiBjZW50cm9pZExpbmVTdGFydCxcbiAgbGluZUVuZDogY2VudHJvaWRMaW5lRW5kLFxuICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIGNlbnRyb2lkU3RyZWFtLmxpbmVTdGFydCA9IGNlbnRyb2lkUmluZ1N0YXJ0O1xuICAgIGNlbnRyb2lkU3RyZWFtLmxpbmVFbmQgPSBjZW50cm9pZFJpbmdFbmQ7XG4gIH0sXG4gIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGNlbnRyb2lkU3RyZWFtLmxpbmVTdGFydCA9IGNlbnRyb2lkTGluZVN0YXJ0O1xuICAgIGNlbnRyb2lkU3RyZWFtLmxpbmVFbmQgPSBjZW50cm9pZExpbmVFbmQ7XG4gIH1cbn07XG5cbi8vIEFyaXRobWV0aWMgbWVhbiBvZiBDYXJ0ZXNpYW4gdmVjdG9ycy5cbmZ1bmN0aW9uIGNlbnRyb2lkUG9pbnQobGFtYmRhLCBwaGkpIHtcbiAgbGFtYmRhICo9IHJhZGlhbnMsIHBoaSAqPSByYWRpYW5zO1xuICB2YXIgY29zUGhpID0gY29zKHBoaSk7XG4gIGNlbnRyb2lkUG9pbnRDYXJ0ZXNpYW4oY29zUGhpICogY29zKGxhbWJkYSksIGNvc1BoaSAqIHNpbihsYW1iZGEpLCBzaW4ocGhpKSk7XG59XG5cbmZ1bmN0aW9uIGNlbnRyb2lkUG9pbnRDYXJ0ZXNpYW4oeCwgeSwgeikge1xuICArK1cwO1xuICBYMCArPSAoeCAtIFgwKSAvIFcwO1xuICBZMCArPSAoeSAtIFkwKSAvIFcwO1xuICBaMCArPSAoeiAtIFowKSAvIFcwO1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZExpbmVTdGFydCgpIHtcbiAgY2VudHJvaWRTdHJlYW0ucG9pbnQgPSBjZW50cm9pZExpbmVQb2ludEZpcnN0O1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZExpbmVQb2ludEZpcnN0KGxhbWJkYSwgcGhpKSB7XG4gIGxhbWJkYSAqPSByYWRpYW5zLCBwaGkgKj0gcmFkaWFucztcbiAgdmFyIGNvc1BoaSA9IGNvcyhwaGkpO1xuICB4MCA9IGNvc1BoaSAqIGNvcyhsYW1iZGEpO1xuICB5MCA9IGNvc1BoaSAqIHNpbihsYW1iZGEpO1xuICB6MCA9IHNpbihwaGkpO1xuICBjZW50cm9pZFN0cmVhbS5wb2ludCA9IGNlbnRyb2lkTGluZVBvaW50O1xuICBjZW50cm9pZFBvaW50Q2FydGVzaWFuKHgwLCB5MCwgejApO1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZExpbmVQb2ludChsYW1iZGEsIHBoaSkge1xuICBsYW1iZGEgKj0gcmFkaWFucywgcGhpICo9IHJhZGlhbnM7XG4gIHZhciBjb3NQaGkgPSBjb3MocGhpKSxcbiAgICAgIHggPSBjb3NQaGkgKiBjb3MobGFtYmRhKSxcbiAgICAgIHkgPSBjb3NQaGkgKiBzaW4obGFtYmRhKSxcbiAgICAgIHogPSBzaW4ocGhpKSxcbiAgICAgIHcgPSBhdGFuMihzcXJ0KCh3ID0geTAgKiB6IC0gejAgKiB5KSAqIHcgKyAodyA9IHowICogeCAtIHgwICogeikgKiB3ICsgKHcgPSB4MCAqIHkgLSB5MCAqIHgpICogdyksIHgwICogeCArIHkwICogeSArIHowICogeik7XG4gIFcxICs9IHc7XG4gIFgxICs9IHcgKiAoeDAgKyAoeDAgPSB4KSk7XG4gIFkxICs9IHcgKiAoeTAgKyAoeTAgPSB5KSk7XG4gIFoxICs9IHcgKiAoejAgKyAoejAgPSB6KSk7XG4gIGNlbnRyb2lkUG9pbnRDYXJ0ZXNpYW4oeDAsIHkwLCB6MCk7XG59XG5cbmZ1bmN0aW9uIGNlbnRyb2lkTGluZUVuZCgpIHtcbiAgY2VudHJvaWRTdHJlYW0ucG9pbnQgPSBjZW50cm9pZFBvaW50O1xufVxuXG4vLyBTZWUgSi4gRS4gQnJvY2ssIFRoZSBJbmVydGlhIFRlbnNvciBmb3IgYSBTcGhlcmljYWwgVHJpYW5nbGUsXG4vLyBKLiBBcHBsaWVkIE1lY2hhbmljcyA0MiwgMjM5ICgxOTc1KS5cbmZ1bmN0aW9uIGNlbnRyb2lkUmluZ1N0YXJ0KCkge1xuICBjZW50cm9pZFN0cmVhbS5wb2ludCA9IGNlbnRyb2lkUmluZ1BvaW50Rmlyc3Q7XG59XG5cbmZ1bmN0aW9uIGNlbnRyb2lkUmluZ0VuZCgpIHtcbiAgY2VudHJvaWRSaW5nUG9pbnQobGFtYmRhMDAsIHBoaTAwKTtcbiAgY2VudHJvaWRTdHJlYW0ucG9pbnQgPSBjZW50cm9pZFBvaW50O1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZFJpbmdQb2ludEZpcnN0KGxhbWJkYSwgcGhpKSB7XG4gIGxhbWJkYTAwID0gbGFtYmRhLCBwaGkwMCA9IHBoaTtcbiAgbGFtYmRhICo9IHJhZGlhbnMsIHBoaSAqPSByYWRpYW5zO1xuICBjZW50cm9pZFN0cmVhbS5wb2ludCA9IGNlbnRyb2lkUmluZ1BvaW50O1xuICB2YXIgY29zUGhpID0gY29zKHBoaSk7XG4gIHgwID0gY29zUGhpICogY29zKGxhbWJkYSk7XG4gIHkwID0gY29zUGhpICogc2luKGxhbWJkYSk7XG4gIHowID0gc2luKHBoaSk7XG4gIGNlbnRyb2lkUG9pbnRDYXJ0ZXNpYW4oeDAsIHkwLCB6MCk7XG59XG5cbmZ1bmN0aW9uIGNlbnRyb2lkUmluZ1BvaW50KGxhbWJkYSwgcGhpKSB7XG4gIGxhbWJkYSAqPSByYWRpYW5zLCBwaGkgKj0gcmFkaWFucztcbiAgdmFyIGNvc1BoaSA9IGNvcyhwaGkpLFxuICAgICAgeCA9IGNvc1BoaSAqIGNvcyhsYW1iZGEpLFxuICAgICAgeSA9IGNvc1BoaSAqIHNpbihsYW1iZGEpLFxuICAgICAgeiA9IHNpbihwaGkpLFxuICAgICAgY3ggPSB5MCAqIHogLSB6MCAqIHksXG4gICAgICBjeSA9IHowICogeCAtIHgwICogeixcbiAgICAgIGN6ID0geDAgKiB5IC0geTAgKiB4LFxuICAgICAgbSA9IGh5cG90KGN4LCBjeSwgY3opLFxuICAgICAgdyA9IGFzaW4obSksIC8vIGxpbmUgd2VpZ2h0ID0gYW5nbGVcbiAgICAgIHYgPSBtICYmIC13IC8gbTsgLy8gYXJlYSB3ZWlnaHQgbXVsdGlwbGllclxuICBYMi5hZGQodiAqIGN4KTtcbiAgWTIuYWRkKHYgKiBjeSk7XG4gIFoyLmFkZCh2ICogY3opO1xuICBXMSArPSB3O1xuICBYMSArPSB3ICogKHgwICsgKHgwID0geCkpO1xuICBZMSArPSB3ICogKHkwICsgKHkwID0geSkpO1xuICBaMSArPSB3ICogKHowICsgKHowID0geikpO1xuICBjZW50cm9pZFBvaW50Q2FydGVzaWFuKHgwLCB5MCwgejApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvYmplY3QpIHtcbiAgVzAgPSBXMSA9XG4gIFgwID0gWTAgPSBaMCA9XG4gIFgxID0gWTEgPSBaMSA9IDA7XG4gIFgyID0gbmV3IEFkZGVyKCk7XG4gIFkyID0gbmV3IEFkZGVyKCk7XG4gIFoyID0gbmV3IEFkZGVyKCk7XG4gIHN0cmVhbShvYmplY3QsIGNlbnRyb2lkU3RyZWFtKTtcblxuICB2YXIgeCA9ICtYMixcbiAgICAgIHkgPSArWTIsXG4gICAgICB6ID0gK1oyLFxuICAgICAgbSA9IGh5cG90KHgsIHksIHopO1xuXG4gIC8vIElmIHRoZSBhcmVhLXdlaWdodGVkIGNjZW50cm9pZCBpcyB1bmRlZmluZWQsIGZhbGwgYmFjayB0byBsZW5ndGgtd2VpZ2h0ZWQgY2NlbnRyb2lkLlxuICBpZiAobSA8IGVwc2lsb24yKSB7XG4gICAgeCA9IFgxLCB5ID0gWTEsIHogPSBaMTtcbiAgICAvLyBJZiB0aGUgZmVhdHVyZSBoYXMgemVybyBsZW5ndGgsIGZhbGwgYmFjayB0byBhcml0aG1ldGljIG1lYW4gb2YgcG9pbnQgdmVjdG9ycy5cbiAgICBpZiAoVzEgPCBlcHNpbG9uKSB4ID0gWDAsIHkgPSBZMCwgeiA9IFowO1xuICAgIG0gPSBoeXBvdCh4LCB5LCB6KTtcbiAgICAvLyBJZiB0aGUgZmVhdHVyZSBzdGlsbCBoYXMgYW4gdW5kZWZpbmVkIGNjZW50cm9pZCwgdGhlbiByZXR1cm4uXG4gICAgaWYgKG0gPCBlcHNpbG9uMikgcmV0dXJuIFtOYU4sIE5hTl07XG4gIH1cblxuICByZXR1cm4gW2F0YW4yKHksIHgpICogZGVncmVlcywgYXNpbih6IC8gbSkgKiBkZWdyZWVzXTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB4O1xuICB9O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuXG4gIGZ1bmN0aW9uIGNvbXBvc2UoeCwgeSkge1xuICAgIHJldHVybiB4ID0gYSh4LCB5KSwgYih4WzBdLCB4WzFdKTtcbiAgfVxuXG4gIGlmIChhLmludmVydCAmJiBiLmludmVydCkgY29tcG9zZS5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgcmV0dXJuIHggPSBiLmludmVydCh4LCB5KSwgeCAmJiBhLmludmVydCh4WzBdLCB4WzFdKTtcbiAgfTtcblxuICByZXR1cm4gY29tcG9zZTtcbn1cbiIsImltcG9ydCBjb21wb3NlIGZyb20gXCIuL2NvbXBvc2UuanNcIjtcbmltcG9ydCB7YWJzLCBhc2luLCBhdGFuMiwgY29zLCBkZWdyZWVzLCBwaSwgcmFkaWFucywgc2luLCB0YXV9IGZyb20gXCIuL21hdGguanNcIjtcblxuZnVuY3Rpb24gcm90YXRpb25JZGVudGl0eShsYW1iZGEsIHBoaSkge1xuICBpZiAoYWJzKGxhbWJkYSkgPiBwaSkgbGFtYmRhIC09IE1hdGgucm91bmQobGFtYmRhIC8gdGF1KSAqIHRhdTtcbiAgcmV0dXJuIFtsYW1iZGEsIHBoaV07XG59XG5cbnJvdGF0aW9uSWRlbnRpdHkuaW52ZXJ0ID0gcm90YXRpb25JZGVudGl0eTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVJhZGlhbnMoZGVsdGFMYW1iZGEsIGRlbHRhUGhpLCBkZWx0YUdhbW1hKSB7XG4gIHJldHVybiAoZGVsdGFMYW1iZGEgJT0gdGF1KSA/IChkZWx0YVBoaSB8fCBkZWx0YUdhbW1hID8gY29tcG9zZShyb3RhdGlvbkxhbWJkYShkZWx0YUxhbWJkYSksIHJvdGF0aW9uUGhpR2FtbWEoZGVsdGFQaGksIGRlbHRhR2FtbWEpKVxuICAgIDogcm90YXRpb25MYW1iZGEoZGVsdGFMYW1iZGEpKVxuICAgIDogKGRlbHRhUGhpIHx8IGRlbHRhR2FtbWEgPyByb3RhdGlvblBoaUdhbW1hKGRlbHRhUGhpLCBkZWx0YUdhbW1hKVxuICAgIDogcm90YXRpb25JZGVudGl0eSk7XG59XG5cbmZ1bmN0aW9uIGZvcndhcmRSb3RhdGlvbkxhbWJkYShkZWx0YUxhbWJkYSkge1xuICByZXR1cm4gZnVuY3Rpb24obGFtYmRhLCBwaGkpIHtcbiAgICBsYW1iZGEgKz0gZGVsdGFMYW1iZGE7XG4gICAgaWYgKGFicyhsYW1iZGEpID4gcGkpIGxhbWJkYSAtPSBNYXRoLnJvdW5kKGxhbWJkYSAvIHRhdSkgKiB0YXU7XG4gICAgcmV0dXJuIFtsYW1iZGEsIHBoaV07XG4gIH07XG59XG5cbmZ1bmN0aW9uIHJvdGF0aW9uTGFtYmRhKGRlbHRhTGFtYmRhKSB7XG4gIHZhciByb3RhdGlvbiA9IGZvcndhcmRSb3RhdGlvbkxhbWJkYShkZWx0YUxhbWJkYSk7XG4gIHJvdGF0aW9uLmludmVydCA9IGZvcndhcmRSb3RhdGlvbkxhbWJkYSgtZGVsdGFMYW1iZGEpO1xuICByZXR1cm4gcm90YXRpb247XG59XG5cbmZ1bmN0aW9uIHJvdGF0aW9uUGhpR2FtbWEoZGVsdGFQaGksIGRlbHRhR2FtbWEpIHtcbiAgdmFyIGNvc0RlbHRhUGhpID0gY29zKGRlbHRhUGhpKSxcbiAgICAgIHNpbkRlbHRhUGhpID0gc2luKGRlbHRhUGhpKSxcbiAgICAgIGNvc0RlbHRhR2FtbWEgPSBjb3MoZGVsdGFHYW1tYSksXG4gICAgICBzaW5EZWx0YUdhbW1hID0gc2luKGRlbHRhR2FtbWEpO1xuXG4gIGZ1bmN0aW9uIHJvdGF0aW9uKGxhbWJkYSwgcGhpKSB7XG4gICAgdmFyIGNvc1BoaSA9IGNvcyhwaGkpLFxuICAgICAgICB4ID0gY29zKGxhbWJkYSkgKiBjb3NQaGksXG4gICAgICAgIHkgPSBzaW4obGFtYmRhKSAqIGNvc1BoaSxcbiAgICAgICAgeiA9IHNpbihwaGkpLFxuICAgICAgICBrID0geiAqIGNvc0RlbHRhUGhpICsgeCAqIHNpbkRlbHRhUGhpO1xuICAgIHJldHVybiBbXG4gICAgICBhdGFuMih5ICogY29zRGVsdGFHYW1tYSAtIGsgKiBzaW5EZWx0YUdhbW1hLCB4ICogY29zRGVsdGFQaGkgLSB6ICogc2luRGVsdGFQaGkpLFxuICAgICAgYXNpbihrICogY29zRGVsdGFHYW1tYSArIHkgKiBzaW5EZWx0YUdhbW1hKVxuICAgIF07XG4gIH1cblxuICByb3RhdGlvbi5pbnZlcnQgPSBmdW5jdGlvbihsYW1iZGEsIHBoaSkge1xuICAgIHZhciBjb3NQaGkgPSBjb3MocGhpKSxcbiAgICAgICAgeCA9IGNvcyhsYW1iZGEpICogY29zUGhpLFxuICAgICAgICB5ID0gc2luKGxhbWJkYSkgKiBjb3NQaGksXG4gICAgICAgIHogPSBzaW4ocGhpKSxcbiAgICAgICAgayA9IHogKiBjb3NEZWx0YUdhbW1hIC0geSAqIHNpbkRlbHRhR2FtbWE7XG4gICAgcmV0dXJuIFtcbiAgICAgIGF0YW4yKHkgKiBjb3NEZWx0YUdhbW1hICsgeiAqIHNpbkRlbHRhR2FtbWEsIHggKiBjb3NEZWx0YVBoaSArIGsgKiBzaW5EZWx0YVBoaSksXG4gICAgICBhc2luKGsgKiBjb3NEZWx0YVBoaSAtIHggKiBzaW5EZWx0YVBoaSlcbiAgICBdO1xuICB9O1xuXG4gIHJldHVybiByb3RhdGlvbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocm90YXRlKSB7XG4gIHJvdGF0ZSA9IHJvdGF0ZVJhZGlhbnMocm90YXRlWzBdICogcmFkaWFucywgcm90YXRlWzFdICogcmFkaWFucywgcm90YXRlLmxlbmd0aCA+IDIgPyByb3RhdGVbMl0gKiByYWRpYW5zIDogMCk7XG5cbiAgZnVuY3Rpb24gZm9yd2FyZChjb29yZGluYXRlcykge1xuICAgIGNvb3JkaW5hdGVzID0gcm90YXRlKGNvb3JkaW5hdGVzWzBdICogcmFkaWFucywgY29vcmRpbmF0ZXNbMV0gKiByYWRpYW5zKTtcbiAgICByZXR1cm4gY29vcmRpbmF0ZXNbMF0gKj0gZGVncmVlcywgY29vcmRpbmF0ZXNbMV0gKj0gZGVncmVlcywgY29vcmRpbmF0ZXM7XG4gIH1cblxuICBmb3J3YXJkLmludmVydCA9IGZ1bmN0aW9uKGNvb3JkaW5hdGVzKSB7XG4gICAgY29vcmRpbmF0ZXMgPSByb3RhdGUuaW52ZXJ0KGNvb3JkaW5hdGVzWzBdICogcmFkaWFucywgY29vcmRpbmF0ZXNbMV0gKiByYWRpYW5zKTtcbiAgICByZXR1cm4gY29vcmRpbmF0ZXNbMF0gKj0gZGVncmVlcywgY29vcmRpbmF0ZXNbMV0gKj0gZGVncmVlcywgY29vcmRpbmF0ZXM7XG4gIH07XG5cbiAgcmV0dXJuIGZvcndhcmQ7XG59XG4iLCJpbXBvcnQge2NhcnRlc2lhbiwgY2FydGVzaWFuTm9ybWFsaXplSW5QbGFjZSwgc3BoZXJpY2FsfSBmcm9tIFwiLi9jYXJ0ZXNpYW4uanNcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuaW1wb3J0IHthY29zLCBjb3MsIGRlZ3JlZXMsIGVwc2lsb24sIHJhZGlhbnMsIHNpbiwgdGF1fSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5pbXBvcnQge3JvdGF0ZVJhZGlhbnN9IGZyb20gXCIuL3JvdGF0aW9uLmpzXCI7XG5cbi8vIEdlbmVyYXRlcyBhIGNpcmNsZSBjZW50ZXJlZCBhdCBbMMKwLCAwwrBdLCB3aXRoIGEgZ2l2ZW4gcmFkaXVzIGFuZCBwcmVjaXNpb24uXG5leHBvcnQgZnVuY3Rpb24gY2lyY2xlU3RyZWFtKHN0cmVhbSwgcmFkaXVzLCBkZWx0YSwgZGlyZWN0aW9uLCB0MCwgdDEpIHtcbiAgaWYgKCFkZWx0YSkgcmV0dXJuO1xuICB2YXIgY29zUmFkaXVzID0gY29zKHJhZGl1cyksXG4gICAgICBzaW5SYWRpdXMgPSBzaW4ocmFkaXVzKSxcbiAgICAgIHN0ZXAgPSBkaXJlY3Rpb24gKiBkZWx0YTtcbiAgaWYgKHQwID09IG51bGwpIHtcbiAgICB0MCA9IHJhZGl1cyArIGRpcmVjdGlvbiAqIHRhdTtcbiAgICB0MSA9IHJhZGl1cyAtIHN0ZXAgLyAyO1xuICB9IGVsc2Uge1xuICAgIHQwID0gY2lyY2xlUmFkaXVzKGNvc1JhZGl1cywgdDApO1xuICAgIHQxID0gY2lyY2xlUmFkaXVzKGNvc1JhZGl1cywgdDEpO1xuICAgIGlmIChkaXJlY3Rpb24gPiAwID8gdDAgPCB0MSA6IHQwID4gdDEpIHQwICs9IGRpcmVjdGlvbiAqIHRhdTtcbiAgfVxuICBmb3IgKHZhciBwb2ludCwgdCA9IHQwOyBkaXJlY3Rpb24gPiAwID8gdCA+IHQxIDogdCA8IHQxOyB0IC09IHN0ZXApIHtcbiAgICBwb2ludCA9IHNwaGVyaWNhbChbY29zUmFkaXVzLCAtc2luUmFkaXVzICogY29zKHQpLCAtc2luUmFkaXVzICogc2luKHQpXSk7XG4gICAgc3RyZWFtLnBvaW50KHBvaW50WzBdLCBwb2ludFsxXSk7XG4gIH1cbn1cblxuLy8gUmV0dXJucyB0aGUgc2lnbmVkIGFuZ2xlIG9mIGEgY2FydGVzaWFuIHBvaW50IHJlbGF0aXZlIHRvIFtjb3NSYWRpdXMsIDAsIDBdLlxuZnVuY3Rpb24gY2lyY2xlUmFkaXVzKGNvc1JhZGl1cywgcG9pbnQpIHtcbiAgcG9pbnQgPSBjYXJ0ZXNpYW4ocG9pbnQpLCBwb2ludFswXSAtPSBjb3NSYWRpdXM7XG4gIGNhcnRlc2lhbk5vcm1hbGl6ZUluUGxhY2UocG9pbnQpO1xuICB2YXIgcmFkaXVzID0gYWNvcygtcG9pbnRbMV0pO1xuICByZXR1cm4gKCgtcG9pbnRbMl0gPCAwID8gLXJhZGl1cyA6IHJhZGl1cykgKyB0YXUgLSBlcHNpbG9uKSAlIHRhdTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBjZW50ZXIgPSBjb25zdGFudChbMCwgMF0pLFxuICAgICAgcmFkaXVzID0gY29uc3RhbnQoOTApLFxuICAgICAgcHJlY2lzaW9uID0gY29uc3RhbnQoMiksXG4gICAgICByaW5nLFxuICAgICAgcm90YXRlLFxuICAgICAgc3RyZWFtID0ge3BvaW50OiBwb2ludH07XG5cbiAgZnVuY3Rpb24gcG9pbnQoeCwgeSkge1xuICAgIHJpbmcucHVzaCh4ID0gcm90YXRlKHgsIHkpKTtcbiAgICB4WzBdICo9IGRlZ3JlZXMsIHhbMV0gKj0gZGVncmVlcztcbiAgfVxuXG4gIGZ1bmN0aW9uIGNpcmNsZSgpIHtcbiAgICB2YXIgYyA9IGNlbnRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpLFxuICAgICAgICByID0gcmFkaXVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgKiByYWRpYW5zLFxuICAgICAgICBwID0gcHJlY2lzaW9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgKiByYWRpYW5zO1xuICAgIHJpbmcgPSBbXTtcbiAgICByb3RhdGUgPSByb3RhdGVSYWRpYW5zKC1jWzBdICogcmFkaWFucywgLWNbMV0gKiByYWRpYW5zLCAwKS5pbnZlcnQ7XG4gICAgY2lyY2xlU3RyZWFtKHN0cmVhbSwgciwgcCwgMSk7XG4gICAgYyA9IHt0eXBlOiBcIlBvbHlnb25cIiwgY29vcmRpbmF0ZXM6IFtyaW5nXX07XG4gICAgcmluZyA9IHJvdGF0ZSA9IG51bGw7XG4gICAgcmV0dXJuIGM7XG4gIH1cblxuICBjaXJjbGUuY2VudGVyID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGNlbnRlciA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoWytfWzBdLCArX1sxXV0pLCBjaXJjbGUpIDogY2VudGVyO1xuICB9O1xuXG4gIGNpcmNsZS5yYWRpdXMgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocmFkaXVzID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIGNpcmNsZSkgOiByYWRpdXM7XG4gIH07XG5cbiAgY2lyY2xlLnByZWNpc2lvbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwcmVjaXNpb24gPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgY2lyY2xlKSA6IHByZWNpc2lvbjtcbiAgfTtcblxuICByZXR1cm4gY2lyY2xlO1xufVxuIiwiaW1wb3J0IG5vb3AgZnJvbSBcIi4uL25vb3AuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBsaW5lcyA9IFtdLFxuICAgICAgbGluZTtcbiAgcmV0dXJuIHtcbiAgICBwb2ludDogZnVuY3Rpb24oeCwgeSwgbSkge1xuICAgICAgbGluZS5wdXNoKFt4LCB5LCBtXSk7XG4gICAgfSxcbiAgICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgbGluZXMucHVzaChsaW5lID0gW10pO1xuICAgIH0sXG4gICAgbGluZUVuZDogbm9vcCxcbiAgICByZWpvaW46IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGxpbmVzLmxlbmd0aCA+IDEpIGxpbmVzLnB1c2gobGluZXMucG9wKCkuY29uY2F0KGxpbmVzLnNoaWZ0KCkpKTtcbiAgICB9LFxuICAgIHJlc3VsdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gbGluZXM7XG4gICAgICBsaW5lcyA9IFtdO1xuICAgICAgbGluZSA9IG51bGw7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfTtcbn1cbiIsImltcG9ydCB7YWJzLCBlcHNpbG9ufSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIGFicyhhWzBdIC0gYlswXSkgPCBlcHNpbG9uICYmIGFicyhhWzFdIC0gYlsxXSkgPCBlcHNpbG9uO1xufVxuIiwiaW1wb3J0IHBvaW50RXF1YWwgZnJvbSBcIi4uL3BvaW50RXF1YWwuanNcIjtcbmltcG9ydCB7ZXBzaWxvbn0gZnJvbSBcIi4uL21hdGguanNcIjtcblxuZnVuY3Rpb24gSW50ZXJzZWN0aW9uKHBvaW50LCBwb2ludHMsIG90aGVyLCBlbnRyeSkge1xuICB0aGlzLnggPSBwb2ludDtcbiAgdGhpcy56ID0gcG9pbnRzO1xuICB0aGlzLm8gPSBvdGhlcjsgLy8gYW5vdGhlciBpbnRlcnNlY3Rpb25cbiAgdGhpcy5lID0gZW50cnk7IC8vIGlzIGFuIGVudHJ5P1xuICB0aGlzLnYgPSBmYWxzZTsgLy8gdmlzaXRlZFxuICB0aGlzLm4gPSB0aGlzLnAgPSBudWxsOyAvLyBuZXh0ICYgcHJldmlvdXNcbn1cblxuLy8gQSBnZW5lcmFsaXplZCBwb2x5Z29uIGNsaXBwaW5nIGFsZ29yaXRobTogZ2l2ZW4gYSBwb2x5Z29uIHRoYXQgaGFzIGJlZW4gY3V0XG4vLyBpbnRvIGl0cyB2aXNpYmxlIGxpbmUgc2VnbWVudHMsIGFuZCByZWpvaW5zIHRoZSBzZWdtZW50cyBieSBpbnRlcnBvbGF0aW5nXG4vLyBhbG9uZyB0aGUgY2xpcCBlZGdlLlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VnbWVudHMsIGNvbXBhcmVJbnRlcnNlY3Rpb24sIHN0YXJ0SW5zaWRlLCBpbnRlcnBvbGF0ZSwgc3RyZWFtKSB7XG4gIHZhciBzdWJqZWN0ID0gW10sXG4gICAgICBjbGlwID0gW10sXG4gICAgICBpLFxuICAgICAgbjtcblxuICBzZWdtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHNlZ21lbnQpIHtcbiAgICBpZiAoKG4gPSBzZWdtZW50Lmxlbmd0aCAtIDEpIDw9IDApIHJldHVybjtcbiAgICB2YXIgbiwgcDAgPSBzZWdtZW50WzBdLCBwMSA9IHNlZ21lbnRbbl0sIHg7XG5cbiAgICBpZiAocG9pbnRFcXVhbChwMCwgcDEpKSB7XG4gICAgICBpZiAoIXAwWzJdICYmICFwMVsyXSkge1xuICAgICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHN0cmVhbS5wb2ludCgocDAgPSBzZWdtZW50W2ldKVswXSwgcDBbMV0pO1xuICAgICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBoYW5kbGUgZGVnZW5lcmF0ZSBjYXNlcyBieSBtb3ZpbmcgdGhlIHBvaW50XG4gICAgICBwMVswXSArPSAyICogZXBzaWxvbjtcbiAgICB9XG5cbiAgICBzdWJqZWN0LnB1c2goeCA9IG5ldyBJbnRlcnNlY3Rpb24ocDAsIHNlZ21lbnQsIG51bGwsIHRydWUpKTtcbiAgICBjbGlwLnB1c2goeC5vID0gbmV3IEludGVyc2VjdGlvbihwMCwgbnVsbCwgeCwgZmFsc2UpKTtcbiAgICBzdWJqZWN0LnB1c2goeCA9IG5ldyBJbnRlcnNlY3Rpb24ocDEsIHNlZ21lbnQsIG51bGwsIGZhbHNlKSk7XG4gICAgY2xpcC5wdXNoKHgubyA9IG5ldyBJbnRlcnNlY3Rpb24ocDEsIG51bGwsIHgsIHRydWUpKTtcbiAgfSk7XG5cbiAgaWYgKCFzdWJqZWN0Lmxlbmd0aCkgcmV0dXJuO1xuXG4gIGNsaXAuc29ydChjb21wYXJlSW50ZXJzZWN0aW9uKTtcbiAgbGluayhzdWJqZWN0KTtcbiAgbGluayhjbGlwKTtcblxuICBmb3IgKGkgPSAwLCBuID0gY2xpcC5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICBjbGlwW2ldLmUgPSBzdGFydEluc2lkZSA9ICFzdGFydEluc2lkZTtcbiAgfVxuXG4gIHZhciBzdGFydCA9IHN1YmplY3RbMF0sXG4gICAgICBwb2ludHMsXG4gICAgICBwb2ludDtcblxuICB3aGlsZSAoMSkge1xuICAgIC8vIEZpbmQgZmlyc3QgdW52aXNpdGVkIGludGVyc2VjdGlvbi5cbiAgICB2YXIgY3VycmVudCA9IHN0YXJ0LFxuICAgICAgICBpc1N1YmplY3QgPSB0cnVlO1xuICAgIHdoaWxlIChjdXJyZW50LnYpIGlmICgoY3VycmVudCA9IGN1cnJlbnQubikgPT09IHN0YXJ0KSByZXR1cm47XG4gICAgcG9pbnRzID0gY3VycmVudC56O1xuICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICBkbyB7XG4gICAgICBjdXJyZW50LnYgPSBjdXJyZW50Lm8udiA9IHRydWU7XG4gICAgICBpZiAoY3VycmVudC5lKSB7XG4gICAgICAgIGlmIChpc1N1YmplY3QpIHtcbiAgICAgICAgICBmb3IgKGkgPSAwLCBuID0gcG9pbnRzLmxlbmd0aDsgaSA8IG47ICsraSkgc3RyZWFtLnBvaW50KChwb2ludCA9IHBvaW50c1tpXSlbMF0sIHBvaW50WzFdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbnRlcnBvbGF0ZShjdXJyZW50LngsIGN1cnJlbnQubi54LCAxLCBzdHJlYW0pO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaXNTdWJqZWN0KSB7XG4gICAgICAgICAgcG9pbnRzID0gY3VycmVudC5wLno7XG4gICAgICAgICAgZm9yIChpID0gcG9pbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSBzdHJlYW0ucG9pbnQoKHBvaW50ID0gcG9pbnRzW2ldKVswXSwgcG9pbnRbMV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGludGVycG9sYXRlKGN1cnJlbnQueCwgY3VycmVudC5wLngsIC0xLCBzdHJlYW0pO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnA7XG4gICAgICB9XG4gICAgICBjdXJyZW50ID0gY3VycmVudC5vO1xuICAgICAgcG9pbnRzID0gY3VycmVudC56O1xuICAgICAgaXNTdWJqZWN0ID0gIWlzU3ViamVjdDtcbiAgICB9IHdoaWxlICghY3VycmVudC52KTtcbiAgICBzdHJlYW0ubGluZUVuZCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxpbmsoYXJyYXkpIHtcbiAgaWYgKCEobiA9IGFycmF5Lmxlbmd0aCkpIHJldHVybjtcbiAgdmFyIG4sXG4gICAgICBpID0gMCxcbiAgICAgIGEgPSBhcnJheVswXSxcbiAgICAgIGI7XG4gIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgYS5uID0gYiA9IGFycmF5W2ldO1xuICAgIGIucCA9IGE7XG4gICAgYSA9IGI7XG4gIH1cbiAgYS5uID0gYiA9IGFycmF5WzBdO1xuICBiLnAgPSBhO1xufVxuIiwiaW1wb3J0IHtBZGRlcn0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2NhcnRlc2lhbiwgY2FydGVzaWFuQ3Jvc3MsIGNhcnRlc2lhbk5vcm1hbGl6ZUluUGxhY2V9IGZyb20gXCIuL2NhcnRlc2lhbi5qc1wiO1xuaW1wb3J0IHthYnMsIGFzaW4sIGF0YW4yLCBjb3MsIGVwc2lsb24sIGVwc2lsb24yLCBoYWxmUGksIHBpLCBxdWFydGVyUGksIHNpZ24sIHNpbiwgdGF1fSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5cbmZ1bmN0aW9uIGxvbmdpdHVkZShwb2ludCkge1xuICByZXR1cm4gYWJzKHBvaW50WzBdKSA8PSBwaSA/IHBvaW50WzBdIDogc2lnbihwb2ludFswXSkgKiAoKGFicyhwb2ludFswXSkgKyBwaSkgJSB0YXUgLSBwaSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHBvbHlnb24sIHBvaW50KSB7XG4gIHZhciBsYW1iZGEgPSBsb25naXR1ZGUocG9pbnQpLFxuICAgICAgcGhpID0gcG9pbnRbMV0sXG4gICAgICBzaW5QaGkgPSBzaW4ocGhpKSxcbiAgICAgIG5vcm1hbCA9IFtzaW4obGFtYmRhKSwgLWNvcyhsYW1iZGEpLCAwXSxcbiAgICAgIGFuZ2xlID0gMCxcbiAgICAgIHdpbmRpbmcgPSAwO1xuXG4gIHZhciBzdW0gPSBuZXcgQWRkZXIoKTtcblxuICBpZiAoc2luUGhpID09PSAxKSBwaGkgPSBoYWxmUGkgKyBlcHNpbG9uO1xuICBlbHNlIGlmIChzaW5QaGkgPT09IC0xKSBwaGkgPSAtaGFsZlBpIC0gZXBzaWxvbjtcblxuICBmb3IgKHZhciBpID0gMCwgbiA9IHBvbHlnb24ubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKCEobSA9IChyaW5nID0gcG9seWdvbltpXSkubGVuZ3RoKSkgY29udGludWU7XG4gICAgdmFyIHJpbmcsXG4gICAgICAgIG0sXG4gICAgICAgIHBvaW50MCA9IHJpbmdbbSAtIDFdLFxuICAgICAgICBsYW1iZGEwID0gbG9uZ2l0dWRlKHBvaW50MCksXG4gICAgICAgIHBoaTAgPSBwb2ludDBbMV0gLyAyICsgcXVhcnRlclBpLFxuICAgICAgICBzaW5QaGkwID0gc2luKHBoaTApLFxuICAgICAgICBjb3NQaGkwID0gY29zKHBoaTApO1xuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBtOyArK2osIGxhbWJkYTAgPSBsYW1iZGExLCBzaW5QaGkwID0gc2luUGhpMSwgY29zUGhpMCA9IGNvc1BoaTEsIHBvaW50MCA9IHBvaW50MSkge1xuICAgICAgdmFyIHBvaW50MSA9IHJpbmdbal0sXG4gICAgICAgICAgbGFtYmRhMSA9IGxvbmdpdHVkZShwb2ludDEpLFxuICAgICAgICAgIHBoaTEgPSBwb2ludDFbMV0gLyAyICsgcXVhcnRlclBpLFxuICAgICAgICAgIHNpblBoaTEgPSBzaW4ocGhpMSksXG4gICAgICAgICAgY29zUGhpMSA9IGNvcyhwaGkxKSxcbiAgICAgICAgICBkZWx0YSA9IGxhbWJkYTEgLSBsYW1iZGEwLFxuICAgICAgICAgIHNpZ24gPSBkZWx0YSA+PSAwID8gMSA6IC0xLFxuICAgICAgICAgIGFic0RlbHRhID0gc2lnbiAqIGRlbHRhLFxuICAgICAgICAgIGFudGltZXJpZGlhbiA9IGFic0RlbHRhID4gcGksXG4gICAgICAgICAgayA9IHNpblBoaTAgKiBzaW5QaGkxO1xuXG4gICAgICBzdW0uYWRkKGF0YW4yKGsgKiBzaWduICogc2luKGFic0RlbHRhKSwgY29zUGhpMCAqIGNvc1BoaTEgKyBrICogY29zKGFic0RlbHRhKSkpO1xuICAgICAgYW5nbGUgKz0gYW50aW1lcmlkaWFuID8gZGVsdGEgKyBzaWduICogdGF1IDogZGVsdGE7XG5cbiAgICAgIC8vIEFyZSB0aGUgbG9uZ2l0dWRlcyBlaXRoZXIgc2lkZSBvZiB0aGUgcG9pbnTigJlzIG1lcmlkaWFuIChsYW1iZGEpLFxuICAgICAgLy8gYW5kIGFyZSB0aGUgbGF0aXR1ZGVzIHNtYWxsZXIgdGhhbiB0aGUgcGFyYWxsZWwgKHBoaSk/XG4gICAgICBpZiAoYW50aW1lcmlkaWFuIF4gbGFtYmRhMCA+PSBsYW1iZGEgXiBsYW1iZGExID49IGxhbWJkYSkge1xuICAgICAgICB2YXIgYXJjID0gY2FydGVzaWFuQ3Jvc3MoY2FydGVzaWFuKHBvaW50MCksIGNhcnRlc2lhbihwb2ludDEpKTtcbiAgICAgICAgY2FydGVzaWFuTm9ybWFsaXplSW5QbGFjZShhcmMpO1xuICAgICAgICB2YXIgaW50ZXJzZWN0aW9uID0gY2FydGVzaWFuQ3Jvc3Mobm9ybWFsLCBhcmMpO1xuICAgICAgICBjYXJ0ZXNpYW5Ob3JtYWxpemVJblBsYWNlKGludGVyc2VjdGlvbik7XG4gICAgICAgIHZhciBwaGlBcmMgPSAoYW50aW1lcmlkaWFuIF4gZGVsdGEgPj0gMCA/IC0xIDogMSkgKiBhc2luKGludGVyc2VjdGlvblsyXSk7XG4gICAgICAgIGlmIChwaGkgPiBwaGlBcmMgfHwgcGhpID09PSBwaGlBcmMgJiYgKGFyY1swXSB8fCBhcmNbMV0pKSB7XG4gICAgICAgICAgd2luZGluZyArPSBhbnRpbWVyaWRpYW4gXiBkZWx0YSA+PSAwID8gMSA6IC0xO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gRmlyc3QsIGRldGVybWluZSB3aGV0aGVyIHRoZSBTb3V0aCBwb2xlIGlzIGluc2lkZSBvciBvdXRzaWRlOlxuICAvL1xuICAvLyBJdCBpcyBpbnNpZGUgaWY6XG4gIC8vICogdGhlIHBvbHlnb24gd2luZHMgYXJvdW5kIGl0IGluIGEgY2xvY2t3aXNlIGRpcmVjdGlvbi5cbiAgLy8gKiB0aGUgcG9seWdvbiBkb2VzIG5vdCAoY3VtdWxhdGl2ZWx5KSB3aW5kIGFyb3VuZCBpdCwgYnV0IGhhcyBhIG5lZ2F0aXZlXG4gIC8vICAgKGNvdW50ZXItY2xvY2t3aXNlKSBhcmVhLlxuICAvL1xuICAvLyBTZWNvbmQsIGNvdW50IHRoZSAoc2lnbmVkKSBudW1iZXIgb2YgdGltZXMgYSBzZWdtZW50IGNyb3NzZXMgYSBsYW1iZGFcbiAgLy8gZnJvbSB0aGUgcG9pbnQgdG8gdGhlIFNvdXRoIHBvbGUuICBJZiBpdCBpcyB6ZXJvLCB0aGVuIHRoZSBwb2ludCBpcyB0aGVcbiAgLy8gc2FtZSBzaWRlIGFzIHRoZSBTb3V0aCBwb2xlLlxuXG4gIHJldHVybiAoYW5nbGUgPCAtZXBzaWxvbiB8fCBhbmdsZSA8IGVwc2lsb24gJiYgc3VtIDwgLWVwc2lsb24yKSBeICh3aW5kaW5nICYgMSk7XG59XG4iLCJpbXBvcnQgY2xpcEJ1ZmZlciBmcm9tIFwiLi9idWZmZXIuanNcIjtcbmltcG9ydCBjbGlwUmVqb2luIGZyb20gXCIuL3Jlam9pbi5qc1wiO1xuaW1wb3J0IHtlcHNpbG9uLCBoYWxmUGl9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQgcG9seWdvbkNvbnRhaW5zIGZyb20gXCIuLi9wb2x5Z29uQ29udGFpbnMuanNcIjtcbmltcG9ydCB7bWVyZ2V9IGZyb20gXCJkMy1hcnJheVwiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihwb2ludFZpc2libGUsIGNsaXBMaW5lLCBpbnRlcnBvbGF0ZSwgc3RhcnQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHNpbmspIHtcbiAgICB2YXIgbGluZSA9IGNsaXBMaW5lKHNpbmspLFxuICAgICAgICByaW5nQnVmZmVyID0gY2xpcEJ1ZmZlcigpLFxuICAgICAgICByaW5nU2luayA9IGNsaXBMaW5lKHJpbmdCdWZmZXIpLFxuICAgICAgICBwb2x5Z29uU3RhcnRlZCA9IGZhbHNlLFxuICAgICAgICBwb2x5Z29uLFxuICAgICAgICBzZWdtZW50cyxcbiAgICAgICAgcmluZztcblxuICAgIHZhciBjbGlwID0ge1xuICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgbGluZVN0YXJ0OiBsaW5lU3RhcnQsXG4gICAgICBsaW5lRW5kOiBsaW5lRW5kLFxuICAgICAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgY2xpcC5wb2ludCA9IHBvaW50UmluZztcbiAgICAgICAgY2xpcC5saW5lU3RhcnQgPSByaW5nU3RhcnQ7XG4gICAgICAgIGNsaXAubGluZUVuZCA9IHJpbmdFbmQ7XG4gICAgICAgIHNlZ21lbnRzID0gW107XG4gICAgICAgIHBvbHlnb24gPSBbXTtcbiAgICAgIH0sXG4gICAgICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY2xpcC5wb2ludCA9IHBvaW50O1xuICAgICAgICBjbGlwLmxpbmVTdGFydCA9IGxpbmVTdGFydDtcbiAgICAgICAgY2xpcC5saW5lRW5kID0gbGluZUVuZDtcbiAgICAgICAgc2VnbWVudHMgPSBtZXJnZShzZWdtZW50cyk7XG4gICAgICAgIHZhciBzdGFydEluc2lkZSA9IHBvbHlnb25Db250YWlucyhwb2x5Z29uLCBzdGFydCk7XG4gICAgICAgIGlmIChzZWdtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAoIXBvbHlnb25TdGFydGVkKSBzaW5rLnBvbHlnb25TdGFydCgpLCBwb2x5Z29uU3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgY2xpcFJlam9pbihzZWdtZW50cywgY29tcGFyZUludGVyc2VjdGlvbiwgc3RhcnRJbnNpZGUsIGludGVycG9sYXRlLCBzaW5rKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGFydEluc2lkZSkge1xuICAgICAgICAgIGlmICghcG9seWdvblN0YXJ0ZWQpIHNpbmsucG9seWdvblN0YXJ0KCksIHBvbHlnb25TdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICBzaW5rLmxpbmVTdGFydCgpO1xuICAgICAgICAgIGludGVycG9sYXRlKG51bGwsIG51bGwsIDEsIHNpbmspO1xuICAgICAgICAgIHNpbmsubGluZUVuZCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwb2x5Z29uU3RhcnRlZCkgc2luay5wb2x5Z29uRW5kKCksIHBvbHlnb25TdGFydGVkID0gZmFsc2U7XG4gICAgICAgIHNlZ21lbnRzID0gcG9seWdvbiA9IG51bGw7XG4gICAgICB9LFxuICAgICAgc3BoZXJlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgc2luay5wb2x5Z29uU3RhcnQoKTtcbiAgICAgICAgc2luay5saW5lU3RhcnQoKTtcbiAgICAgICAgaW50ZXJwb2xhdGUobnVsbCwgbnVsbCwgMSwgc2luayk7XG4gICAgICAgIHNpbmsubGluZUVuZCgpO1xuICAgICAgICBzaW5rLnBvbHlnb25FbmQoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gcG9pbnQobGFtYmRhLCBwaGkpIHtcbiAgICAgIGlmIChwb2ludFZpc2libGUobGFtYmRhLCBwaGkpKSBzaW5rLnBvaW50KGxhbWJkYSwgcGhpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb2ludExpbmUobGFtYmRhLCBwaGkpIHtcbiAgICAgIGxpbmUucG9pbnQobGFtYmRhLCBwaGkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpbmVTdGFydCgpIHtcbiAgICAgIGNsaXAucG9pbnQgPSBwb2ludExpbmU7XG4gICAgICBsaW5lLmxpbmVTdGFydCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpbmVFbmQoKSB7XG4gICAgICBjbGlwLnBvaW50ID0gcG9pbnQ7XG4gICAgICBsaW5lLmxpbmVFbmQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb2ludFJpbmcobGFtYmRhLCBwaGkpIHtcbiAgICAgIHJpbmcucHVzaChbbGFtYmRhLCBwaGldKTtcbiAgICAgIHJpbmdTaW5rLnBvaW50KGxhbWJkYSwgcGhpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByaW5nU3RhcnQoKSB7XG4gICAgICByaW5nU2luay5saW5lU3RhcnQoKTtcbiAgICAgIHJpbmcgPSBbXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByaW5nRW5kKCkge1xuICAgICAgcG9pbnRSaW5nKHJpbmdbMF1bMF0sIHJpbmdbMF1bMV0pO1xuICAgICAgcmluZ1NpbmsubGluZUVuZCgpO1xuXG4gICAgICB2YXIgY2xlYW4gPSByaW5nU2luay5jbGVhbigpLFxuICAgICAgICAgIHJpbmdTZWdtZW50cyA9IHJpbmdCdWZmZXIucmVzdWx0KCksXG4gICAgICAgICAgaSwgbiA9IHJpbmdTZWdtZW50cy5sZW5ndGgsIG0sXG4gICAgICAgICAgc2VnbWVudCxcbiAgICAgICAgICBwb2ludDtcblxuICAgICAgcmluZy5wb3AoKTtcbiAgICAgIHBvbHlnb24ucHVzaChyaW5nKTtcbiAgICAgIHJpbmcgPSBudWxsO1xuXG4gICAgICBpZiAoIW4pIHJldHVybjtcblxuICAgICAgLy8gTm8gaW50ZXJzZWN0aW9ucy5cbiAgICAgIGlmIChjbGVhbiAmIDEpIHtcbiAgICAgICAgc2VnbWVudCA9IHJpbmdTZWdtZW50c1swXTtcbiAgICAgICAgaWYgKChtID0gc2VnbWVudC5sZW5ndGggLSAxKSA+IDApIHtcbiAgICAgICAgICBpZiAoIXBvbHlnb25TdGFydGVkKSBzaW5rLnBvbHlnb25TdGFydCgpLCBwb2x5Z29uU3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgc2luay5saW5lU3RhcnQoKTtcbiAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbTsgKytpKSBzaW5rLnBvaW50KChwb2ludCA9IHNlZ21lbnRbaV0pWzBdLCBwb2ludFsxXSk7XG4gICAgICAgICAgc2luay5saW5lRW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBSZWpvaW4gY29ubmVjdGVkIHNlZ21lbnRzLlxuICAgICAgLy8gVE9ETyByZXVzZSByaW5nQnVmZmVyLnJlam9pbigpP1xuICAgICAgaWYgKG4gPiAxICYmIGNsZWFuICYgMikgcmluZ1NlZ21lbnRzLnB1c2gocmluZ1NlZ21lbnRzLnBvcCgpLmNvbmNhdChyaW5nU2VnbWVudHMuc2hpZnQoKSkpO1xuXG4gICAgICBzZWdtZW50cy5wdXNoKHJpbmdTZWdtZW50cy5maWx0ZXIodmFsaWRTZWdtZW50KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNsaXA7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHZhbGlkU2VnbWVudChzZWdtZW50KSB7XG4gIHJldHVybiBzZWdtZW50Lmxlbmd0aCA+IDE7XG59XG5cbi8vIEludGVyc2VjdGlvbnMgYXJlIHNvcnRlZCBhbG9uZyB0aGUgY2xpcCBlZGdlLiBGb3IgYm90aCBhbnRpbWVyaWRpYW4gY3V0dGluZ1xuLy8gYW5kIGNpcmNsZSBjbGlwcGluZywgdGhlIHNhbWUgY29tcGFyaXNvbiBpcyB1c2VkLlxuZnVuY3Rpb24gY29tcGFyZUludGVyc2VjdGlvbihhLCBiKSB7XG4gIHJldHVybiAoKGEgPSBhLngpWzBdIDwgMCA/IGFbMV0gLSBoYWxmUGkgLSBlcHNpbG9uIDogaGFsZlBpIC0gYVsxXSlcbiAgICAgICAtICgoYiA9IGIueClbMF0gPCAwID8gYlsxXSAtIGhhbGZQaSAtIGVwc2lsb24gOiBoYWxmUGkgLSBiWzFdKTtcbn1cbiIsImltcG9ydCBjbGlwIGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQge2FicywgYXRhbiwgY29zLCBlcHNpbG9uLCBoYWxmUGksIHBpLCBzaW59IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsaXAoXG4gIGZ1bmN0aW9uKCkgeyByZXR1cm4gdHJ1ZTsgfSxcbiAgY2xpcEFudGltZXJpZGlhbkxpbmUsXG4gIGNsaXBBbnRpbWVyaWRpYW5JbnRlcnBvbGF0ZSxcbiAgWy1waSwgLWhhbGZQaV1cbik7XG5cbi8vIFRha2VzIGEgbGluZSBhbmQgY3V0cyBpbnRvIHZpc2libGUgc2VnbWVudHMuIFJldHVybiB2YWx1ZXM6IDAgLSB0aGVyZSB3ZXJlXG4vLyBpbnRlcnNlY3Rpb25zIG9yIHRoZSBsaW5lIHdhcyBlbXB0eTsgMSAtIG5vIGludGVyc2VjdGlvbnM7IDIgLSB0aGVyZSB3ZXJlXG4vLyBpbnRlcnNlY3Rpb25zLCBhbmQgdGhlIGZpcnN0IGFuZCBsYXN0IHNlZ21lbnRzIHNob3VsZCBiZSByZWpvaW5lZC5cbmZ1bmN0aW9uIGNsaXBBbnRpbWVyaWRpYW5MaW5lKHN0cmVhbSkge1xuICB2YXIgbGFtYmRhMCA9IE5hTixcbiAgICAgIHBoaTAgPSBOYU4sXG4gICAgICBzaWduMCA9IE5hTixcbiAgICAgIGNsZWFuOyAvLyBubyBpbnRlcnNlY3Rpb25zXG5cbiAgcmV0dXJuIHtcbiAgICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgY2xlYW4gPSAxO1xuICAgIH0sXG4gICAgcG9pbnQ6IGZ1bmN0aW9uKGxhbWJkYTEsIHBoaTEpIHtcbiAgICAgIHZhciBzaWduMSA9IGxhbWJkYTEgPiAwID8gcGkgOiAtcGksXG4gICAgICAgICAgZGVsdGEgPSBhYnMobGFtYmRhMSAtIGxhbWJkYTApO1xuICAgICAgaWYgKGFicyhkZWx0YSAtIHBpKSA8IGVwc2lsb24pIHsgLy8gbGluZSBjcm9zc2VzIGEgcG9sZVxuICAgICAgICBzdHJlYW0ucG9pbnQobGFtYmRhMCwgcGhpMCA9IChwaGkwICsgcGhpMSkgLyAyID4gMCA/IGhhbGZQaSA6IC1oYWxmUGkpO1xuICAgICAgICBzdHJlYW0ucG9pbnQoc2lnbjAsIHBoaTApO1xuICAgICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgIHN0cmVhbS5wb2ludChzaWduMSwgcGhpMCk7XG4gICAgICAgIHN0cmVhbS5wb2ludChsYW1iZGExLCBwaGkwKTtcbiAgICAgICAgY2xlYW4gPSAwO1xuICAgICAgfSBlbHNlIGlmIChzaWduMCAhPT0gc2lnbjEgJiYgZGVsdGEgPj0gcGkpIHsgLy8gbGluZSBjcm9zc2VzIGFudGltZXJpZGlhblxuICAgICAgICBpZiAoYWJzKGxhbWJkYTAgLSBzaWduMCkgPCBlcHNpbG9uKSBsYW1iZGEwIC09IHNpZ24wICogZXBzaWxvbjsgLy8gaGFuZGxlIGRlZ2VuZXJhY2llc1xuICAgICAgICBpZiAoYWJzKGxhbWJkYTEgLSBzaWduMSkgPCBlcHNpbG9uKSBsYW1iZGExIC09IHNpZ24xICogZXBzaWxvbjtcbiAgICAgICAgcGhpMCA9IGNsaXBBbnRpbWVyaWRpYW5JbnRlcnNlY3QobGFtYmRhMCwgcGhpMCwgbGFtYmRhMSwgcGhpMSk7XG4gICAgICAgIHN0cmVhbS5wb2ludChzaWduMCwgcGhpMCk7XG4gICAgICAgIHN0cmVhbS5saW5lRW5kKCk7XG4gICAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgc3RyZWFtLnBvaW50KHNpZ24xLCBwaGkwKTtcbiAgICAgICAgY2xlYW4gPSAwO1xuICAgICAgfVxuICAgICAgc3RyZWFtLnBvaW50KGxhbWJkYTAgPSBsYW1iZGExLCBwaGkwID0gcGhpMSk7XG4gICAgICBzaWduMCA9IHNpZ24xO1xuICAgIH0sXG4gICAgbGluZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgbGFtYmRhMCA9IHBoaTAgPSBOYU47XG4gICAgfSxcbiAgICBjbGVhbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gMiAtIGNsZWFuOyAvLyBpZiBpbnRlcnNlY3Rpb25zLCByZWpvaW4gZmlyc3QgYW5kIGxhc3Qgc2VnbWVudHNcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsaXBBbnRpbWVyaWRpYW5JbnRlcnNlY3QobGFtYmRhMCwgcGhpMCwgbGFtYmRhMSwgcGhpMSkge1xuICB2YXIgY29zUGhpMCxcbiAgICAgIGNvc1BoaTEsXG4gICAgICBzaW5MYW1iZGEwTGFtYmRhMSA9IHNpbihsYW1iZGEwIC0gbGFtYmRhMSk7XG4gIHJldHVybiBhYnMoc2luTGFtYmRhMExhbWJkYTEpID4gZXBzaWxvblxuICAgICAgPyBhdGFuKChzaW4ocGhpMCkgKiAoY29zUGhpMSA9IGNvcyhwaGkxKSkgKiBzaW4obGFtYmRhMSlcbiAgICAgICAgICAtIHNpbihwaGkxKSAqIChjb3NQaGkwID0gY29zKHBoaTApKSAqIHNpbihsYW1iZGEwKSlcbiAgICAgICAgICAvIChjb3NQaGkwICogY29zUGhpMSAqIHNpbkxhbWJkYTBMYW1iZGExKSlcbiAgICAgIDogKHBoaTAgKyBwaGkxKSAvIDI7XG59XG5cbmZ1bmN0aW9uIGNsaXBBbnRpbWVyaWRpYW5JbnRlcnBvbGF0ZShmcm9tLCB0bywgZGlyZWN0aW9uLCBzdHJlYW0pIHtcbiAgdmFyIHBoaTtcbiAgaWYgKGZyb20gPT0gbnVsbCkge1xuICAgIHBoaSA9IGRpcmVjdGlvbiAqIGhhbGZQaTtcbiAgICBzdHJlYW0ucG9pbnQoLXBpLCBwaGkpO1xuICAgIHN0cmVhbS5wb2ludCgwLCBwaGkpO1xuICAgIHN0cmVhbS5wb2ludChwaSwgcGhpKTtcbiAgICBzdHJlYW0ucG9pbnQocGksIDApO1xuICAgIHN0cmVhbS5wb2ludChwaSwgLXBoaSk7XG4gICAgc3RyZWFtLnBvaW50KDAsIC1waGkpO1xuICAgIHN0cmVhbS5wb2ludCgtcGksIC1waGkpO1xuICAgIHN0cmVhbS5wb2ludCgtcGksIDApO1xuICAgIHN0cmVhbS5wb2ludCgtcGksIHBoaSk7XG4gIH0gZWxzZSBpZiAoYWJzKGZyb21bMF0gLSB0b1swXSkgPiBlcHNpbG9uKSB7XG4gICAgdmFyIGxhbWJkYSA9IGZyb21bMF0gPCB0b1swXSA/IHBpIDogLXBpO1xuICAgIHBoaSA9IGRpcmVjdGlvbiAqIGxhbWJkYSAvIDI7XG4gICAgc3RyZWFtLnBvaW50KC1sYW1iZGEsIHBoaSk7XG4gICAgc3RyZWFtLnBvaW50KDAsIHBoaSk7XG4gICAgc3RyZWFtLnBvaW50KGxhbWJkYSwgcGhpKTtcbiAgfSBlbHNlIHtcbiAgICBzdHJlYW0ucG9pbnQodG9bMF0sIHRvWzFdKTtcbiAgfVxufVxuIiwiaW1wb3J0IHtjYXJ0ZXNpYW4sIGNhcnRlc2lhbkFkZEluUGxhY2UsIGNhcnRlc2lhbkNyb3NzLCBjYXJ0ZXNpYW5Eb3QsIGNhcnRlc2lhblNjYWxlLCBzcGhlcmljYWx9IGZyb20gXCIuLi9jYXJ0ZXNpYW4uanNcIjtcbmltcG9ydCB7Y2lyY2xlU3RyZWFtfSBmcm9tIFwiLi4vY2lyY2xlLmpzXCI7XG5pbXBvcnQge2FicywgY29zLCBlcHNpbG9uLCBwaSwgcmFkaWFucywgc3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCBwb2ludEVxdWFsIGZyb20gXCIuLi9wb2ludEVxdWFsLmpzXCI7XG5pbXBvcnQgY2xpcCBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihyYWRpdXMpIHtcbiAgdmFyIGNyID0gY29zKHJhZGl1cyksXG4gICAgICBkZWx0YSA9IDIgKiByYWRpYW5zLFxuICAgICAgc21hbGxSYWRpdXMgPSBjciA+IDAsXG4gICAgICBub3RIZW1pc3BoZXJlID0gYWJzKGNyKSA+IGVwc2lsb247IC8vIFRPRE8gb3B0aW1pc2UgZm9yIHRoaXMgY29tbW9uIGNhc2VcblxuICBmdW5jdGlvbiBpbnRlcnBvbGF0ZShmcm9tLCB0bywgZGlyZWN0aW9uLCBzdHJlYW0pIHtcbiAgICBjaXJjbGVTdHJlYW0oc3RyZWFtLCByYWRpdXMsIGRlbHRhLCBkaXJlY3Rpb24sIGZyb20sIHRvKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHZpc2libGUobGFtYmRhLCBwaGkpIHtcbiAgICByZXR1cm4gY29zKGxhbWJkYSkgKiBjb3MocGhpKSA+IGNyO1xuICB9XG5cbiAgLy8gVGFrZXMgYSBsaW5lIGFuZCBjdXRzIGludG8gdmlzaWJsZSBzZWdtZW50cy4gUmV0dXJuIHZhbHVlcyB1c2VkIGZvciBwb2x5Z29uXG4gIC8vIGNsaXBwaW5nOiAwIC0gdGhlcmUgd2VyZSBpbnRlcnNlY3Rpb25zIG9yIHRoZSBsaW5lIHdhcyBlbXB0eTsgMSAtIG5vXG4gIC8vIGludGVyc2VjdGlvbnMgMiAtIHRoZXJlIHdlcmUgaW50ZXJzZWN0aW9ucywgYW5kIHRoZSBmaXJzdCBhbmQgbGFzdCBzZWdtZW50c1xuICAvLyBzaG91bGQgYmUgcmVqb2luZWQuXG4gIGZ1bmN0aW9uIGNsaXBMaW5lKHN0cmVhbSkge1xuICAgIHZhciBwb2ludDAsIC8vIHByZXZpb3VzIHBvaW50XG4gICAgICAgIGMwLCAvLyBjb2RlIGZvciBwcmV2aW91cyBwb2ludFxuICAgICAgICB2MCwgLy8gdmlzaWJpbGl0eSBvZiBwcmV2aW91cyBwb2ludFxuICAgICAgICB2MDAsIC8vIHZpc2liaWxpdHkgb2YgZmlyc3QgcG9pbnRcbiAgICAgICAgY2xlYW47IC8vIG5vIGludGVyc2VjdGlvbnNcbiAgICByZXR1cm4ge1xuICAgICAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdjAwID0gdjAgPSBmYWxzZTtcbiAgICAgICAgY2xlYW4gPSAxO1xuICAgICAgfSxcbiAgICAgIHBvaW50OiBmdW5jdGlvbihsYW1iZGEsIHBoaSkge1xuICAgICAgICB2YXIgcG9pbnQxID0gW2xhbWJkYSwgcGhpXSxcbiAgICAgICAgICAgIHBvaW50MixcbiAgICAgICAgICAgIHYgPSB2aXNpYmxlKGxhbWJkYSwgcGhpKSxcbiAgICAgICAgICAgIGMgPSBzbWFsbFJhZGl1c1xuICAgICAgICAgICAgICA/IHYgPyAwIDogY29kZShsYW1iZGEsIHBoaSlcbiAgICAgICAgICAgICAgOiB2ID8gY29kZShsYW1iZGEgKyAobGFtYmRhIDwgMCA/IHBpIDogLXBpKSwgcGhpKSA6IDA7XG4gICAgICAgIGlmICghcG9pbnQwICYmICh2MDAgPSB2MCA9IHYpKSBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgIGlmICh2ICE9PSB2MCkge1xuICAgICAgICAgIHBvaW50MiA9IGludGVyc2VjdChwb2ludDAsIHBvaW50MSk7XG4gICAgICAgICAgaWYgKCFwb2ludDIgfHwgcG9pbnRFcXVhbChwb2ludDAsIHBvaW50MikgfHwgcG9pbnRFcXVhbChwb2ludDEsIHBvaW50MikpXG4gICAgICAgICAgICBwb2ludDFbMl0gPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2ICE9PSB2MCkge1xuICAgICAgICAgIGNsZWFuID0gMDtcbiAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgLy8gb3V0c2lkZSBnb2luZyBpblxuICAgICAgICAgICAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgICAgICAgcG9pbnQyID0gaW50ZXJzZWN0KHBvaW50MSwgcG9pbnQwKTtcbiAgICAgICAgICAgIHN0cmVhbS5wb2ludChwb2ludDJbMF0sIHBvaW50MlsxXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGluc2lkZSBnb2luZyBvdXRcbiAgICAgICAgICAgIHBvaW50MiA9IGludGVyc2VjdChwb2ludDAsIHBvaW50MSk7XG4gICAgICAgICAgICBzdHJlYW0ucG9pbnQocG9pbnQyWzBdLCBwb2ludDJbMV0sIDIpO1xuICAgICAgICAgICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcG9pbnQwID0gcG9pbnQyO1xuICAgICAgICB9IGVsc2UgaWYgKG5vdEhlbWlzcGhlcmUgJiYgcG9pbnQwICYmIHNtYWxsUmFkaXVzIF4gdikge1xuICAgICAgICAgIHZhciB0O1xuICAgICAgICAgIC8vIElmIHRoZSBjb2RlcyBmb3IgdHdvIHBvaW50cyBhcmUgZGlmZmVyZW50LCBvciBhcmUgYm90aCB6ZXJvLFxuICAgICAgICAgIC8vIGFuZCB0aGVyZSB0aGlzIHNlZ21lbnQgaW50ZXJzZWN0cyB3aXRoIHRoZSBzbWFsbCBjaXJjbGUuXG4gICAgICAgICAgaWYgKCEoYyAmIGMwKSAmJiAodCA9IGludGVyc2VjdChwb2ludDEsIHBvaW50MCwgdHJ1ZSkpKSB7XG4gICAgICAgICAgICBjbGVhbiA9IDA7XG4gICAgICAgICAgICBpZiAoc21hbGxSYWRpdXMpIHtcbiAgICAgICAgICAgICAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgICAgICAgICBzdHJlYW0ucG9pbnQodFswXVswXSwgdFswXVsxXSk7XG4gICAgICAgICAgICAgIHN0cmVhbS5wb2ludCh0WzFdWzBdLCB0WzFdWzFdKTtcbiAgICAgICAgICAgICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHN0cmVhbS5wb2ludCh0WzFdWzBdLCB0WzFdWzFdKTtcbiAgICAgICAgICAgICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgICAgICAgICAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgICAgICAgICBzdHJlYW0ucG9pbnQodFswXVswXSwgdFswXVsxXSwgMyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh2ICYmICghcG9pbnQwIHx8ICFwb2ludEVxdWFsKHBvaW50MCwgcG9pbnQxKSkpIHtcbiAgICAgICAgICBzdHJlYW0ucG9pbnQocG9pbnQxWzBdLCBwb2ludDFbMV0pO1xuICAgICAgICB9XG4gICAgICAgIHBvaW50MCA9IHBvaW50MSwgdjAgPSB2LCBjMCA9IGM7XG4gICAgICB9LFxuICAgICAgbGluZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh2MCkgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgICAgcG9pbnQwID0gbnVsbDtcbiAgICAgIH0sXG4gICAgICAvLyBSZWpvaW4gZmlyc3QgYW5kIGxhc3Qgc2VnbWVudHMgaWYgdGhlcmUgd2VyZSBpbnRlcnNlY3Rpb25zIGFuZCB0aGUgZmlyc3RcbiAgICAgIC8vIGFuZCBsYXN0IHBvaW50cyB3ZXJlIHZpc2libGUuXG4gICAgICBjbGVhbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBjbGVhbiB8ICgodjAwICYmIHYwKSA8PCAxKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gSW50ZXJzZWN0cyB0aGUgZ3JlYXQgY2lyY2xlIGJldHdlZW4gYSBhbmQgYiB3aXRoIHRoZSBjbGlwIGNpcmNsZS5cbiAgZnVuY3Rpb24gaW50ZXJzZWN0KGEsIGIsIHR3bykge1xuICAgIHZhciBwYSA9IGNhcnRlc2lhbihhKSxcbiAgICAgICAgcGIgPSBjYXJ0ZXNpYW4oYik7XG5cbiAgICAvLyBXZSBoYXZlIHR3byBwbGFuZXMsIG4xLnAgPSBkMSBhbmQgbjIucCA9IGQyLlxuICAgIC8vIEZpbmQgaW50ZXJzZWN0aW9uIGxpbmUgcCh0KSA9IGMxIG4xICsgYzIgbjIgKyB0IChuMSDiqK8gbjIpLlxuICAgIHZhciBuMSA9IFsxLCAwLCAwXSwgLy8gbm9ybWFsXG4gICAgICAgIG4yID0gY2FydGVzaWFuQ3Jvc3MocGEsIHBiKSxcbiAgICAgICAgbjJuMiA9IGNhcnRlc2lhbkRvdChuMiwgbjIpLFxuICAgICAgICBuMW4yID0gbjJbMF0sIC8vIGNhcnRlc2lhbkRvdChuMSwgbjIpLFxuICAgICAgICBkZXRlcm1pbmFudCA9IG4ybjIgLSBuMW4yICogbjFuMjtcblxuICAgIC8vIFR3byBwb2xhciBwb2ludHMuXG4gICAgaWYgKCFkZXRlcm1pbmFudCkgcmV0dXJuICF0d28gJiYgYTtcblxuICAgIHZhciBjMSA9ICBjciAqIG4ybjIgLyBkZXRlcm1pbmFudCxcbiAgICAgICAgYzIgPSAtY3IgKiBuMW4yIC8gZGV0ZXJtaW5hbnQsXG4gICAgICAgIG4xeG4yID0gY2FydGVzaWFuQ3Jvc3MobjEsIG4yKSxcbiAgICAgICAgQSA9IGNhcnRlc2lhblNjYWxlKG4xLCBjMSksXG4gICAgICAgIEIgPSBjYXJ0ZXNpYW5TY2FsZShuMiwgYzIpO1xuICAgIGNhcnRlc2lhbkFkZEluUGxhY2UoQSwgQik7XG5cbiAgICAvLyBTb2x2ZSB8cCh0KXxeMiA9IDEuXG4gICAgdmFyIHUgPSBuMXhuMixcbiAgICAgICAgdyA9IGNhcnRlc2lhbkRvdChBLCB1KSxcbiAgICAgICAgdXUgPSBjYXJ0ZXNpYW5Eb3QodSwgdSksXG4gICAgICAgIHQyID0gdyAqIHcgLSB1dSAqIChjYXJ0ZXNpYW5Eb3QoQSwgQSkgLSAxKTtcblxuICAgIGlmICh0MiA8IDApIHJldHVybjtcblxuICAgIHZhciB0ID0gc3FydCh0MiksXG4gICAgICAgIHEgPSBjYXJ0ZXNpYW5TY2FsZSh1LCAoLXcgLSB0KSAvIHV1KTtcbiAgICBjYXJ0ZXNpYW5BZGRJblBsYWNlKHEsIEEpO1xuICAgIHEgPSBzcGhlcmljYWwocSk7XG5cbiAgICBpZiAoIXR3bykgcmV0dXJuIHE7XG5cbiAgICAvLyBUd28gaW50ZXJzZWN0aW9uIHBvaW50cy5cbiAgICB2YXIgbGFtYmRhMCA9IGFbMF0sXG4gICAgICAgIGxhbWJkYTEgPSBiWzBdLFxuICAgICAgICBwaGkwID0gYVsxXSxcbiAgICAgICAgcGhpMSA9IGJbMV0sXG4gICAgICAgIHo7XG5cbiAgICBpZiAobGFtYmRhMSA8IGxhbWJkYTApIHogPSBsYW1iZGEwLCBsYW1iZGEwID0gbGFtYmRhMSwgbGFtYmRhMSA9IHo7XG5cbiAgICB2YXIgZGVsdGEgPSBsYW1iZGExIC0gbGFtYmRhMCxcbiAgICAgICAgcG9sYXIgPSBhYnMoZGVsdGEgLSBwaSkgPCBlcHNpbG9uLFxuICAgICAgICBtZXJpZGlhbiA9IHBvbGFyIHx8IGRlbHRhIDwgZXBzaWxvbjtcblxuICAgIGlmICghcG9sYXIgJiYgcGhpMSA8IHBoaTApIHogPSBwaGkwLCBwaGkwID0gcGhpMSwgcGhpMSA9IHo7XG5cbiAgICAvLyBDaGVjayB0aGF0IHRoZSBmaXJzdCBwb2ludCBpcyBiZXR3ZWVuIGEgYW5kIGIuXG4gICAgaWYgKG1lcmlkaWFuXG4gICAgICAgID8gcG9sYXJcbiAgICAgICAgICA/IHBoaTAgKyBwaGkxID4gMCBeIHFbMV0gPCAoYWJzKHFbMF0gLSBsYW1iZGEwKSA8IGVwc2lsb24gPyBwaGkwIDogcGhpMSlcbiAgICAgICAgICA6IHBoaTAgPD0gcVsxXSAmJiBxWzFdIDw9IHBoaTFcbiAgICAgICAgOiBkZWx0YSA+IHBpIF4gKGxhbWJkYTAgPD0gcVswXSAmJiBxWzBdIDw9IGxhbWJkYTEpKSB7XG4gICAgICB2YXIgcTEgPSBjYXJ0ZXNpYW5TY2FsZSh1LCAoLXcgKyB0KSAvIHV1KTtcbiAgICAgIGNhcnRlc2lhbkFkZEluUGxhY2UocTEsIEEpO1xuICAgICAgcmV0dXJuIFtxLCBzcGhlcmljYWwocTEpXTtcbiAgICB9XG4gIH1cblxuICAvLyBHZW5lcmF0ZXMgYSA0LWJpdCB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBsb2NhdGlvbiBvZiBhIHBvaW50IHJlbGF0aXZlIHRvXG4gIC8vIHRoZSBzbWFsbCBjaXJjbGUncyBib3VuZGluZyBib3guXG4gIGZ1bmN0aW9uIGNvZGUobGFtYmRhLCBwaGkpIHtcbiAgICB2YXIgciA9IHNtYWxsUmFkaXVzID8gcmFkaXVzIDogcGkgLSByYWRpdXMsXG4gICAgICAgIGNvZGUgPSAwO1xuICAgIGlmIChsYW1iZGEgPCAtcikgY29kZSB8PSAxOyAvLyBsZWZ0XG4gICAgZWxzZSBpZiAobGFtYmRhID4gcikgY29kZSB8PSAyOyAvLyByaWdodFxuICAgIGlmIChwaGkgPCAtcikgY29kZSB8PSA0OyAvLyBiZWxvd1xuICAgIGVsc2UgaWYgKHBoaSA+IHIpIGNvZGUgfD0gODsgLy8gYWJvdmVcbiAgICByZXR1cm4gY29kZTtcbiAgfVxuXG4gIHJldHVybiBjbGlwKHZpc2libGUsIGNsaXBMaW5lLCBpbnRlcnBvbGF0ZSwgc21hbGxSYWRpdXMgPyBbMCwgLXJhZGl1c10gOiBbLXBpLCByYWRpdXMgLSBwaV0pO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYiwgeDAsIHkwLCB4MSwgeTEpIHtcbiAgdmFyIGF4ID0gYVswXSxcbiAgICAgIGF5ID0gYVsxXSxcbiAgICAgIGJ4ID0gYlswXSxcbiAgICAgIGJ5ID0gYlsxXSxcbiAgICAgIHQwID0gMCxcbiAgICAgIHQxID0gMSxcbiAgICAgIGR4ID0gYnggLSBheCxcbiAgICAgIGR5ID0gYnkgLSBheSxcbiAgICAgIHI7XG5cbiAgciA9IHgwIC0gYXg7XG4gIGlmICghZHggJiYgciA+IDApIHJldHVybjtcbiAgciAvPSBkeDtcbiAgaWYgKGR4IDwgMCkge1xuICAgIGlmIChyIDwgdDApIHJldHVybjtcbiAgICBpZiAociA8IHQxKSB0MSA9IHI7XG4gIH0gZWxzZSBpZiAoZHggPiAwKSB7XG4gICAgaWYgKHIgPiB0MSkgcmV0dXJuO1xuICAgIGlmIChyID4gdDApIHQwID0gcjtcbiAgfVxuXG4gIHIgPSB4MSAtIGF4O1xuICBpZiAoIWR4ICYmIHIgPCAwKSByZXR1cm47XG4gIHIgLz0gZHg7XG4gIGlmIChkeCA8IDApIHtcbiAgICBpZiAociA+IHQxKSByZXR1cm47XG4gICAgaWYgKHIgPiB0MCkgdDAgPSByO1xuICB9IGVsc2UgaWYgKGR4ID4gMCkge1xuICAgIGlmIChyIDwgdDApIHJldHVybjtcbiAgICBpZiAociA8IHQxKSB0MSA9IHI7XG4gIH1cblxuICByID0geTAgLSBheTtcbiAgaWYgKCFkeSAmJiByID4gMCkgcmV0dXJuO1xuICByIC89IGR5O1xuICBpZiAoZHkgPCAwKSB7XG4gICAgaWYgKHIgPCB0MCkgcmV0dXJuO1xuICAgIGlmIChyIDwgdDEpIHQxID0gcjtcbiAgfSBlbHNlIGlmIChkeSA+IDApIHtcbiAgICBpZiAociA+IHQxKSByZXR1cm47XG4gICAgaWYgKHIgPiB0MCkgdDAgPSByO1xuICB9XG5cbiAgciA9IHkxIC0gYXk7XG4gIGlmICghZHkgJiYgciA8IDApIHJldHVybjtcbiAgciAvPSBkeTtcbiAgaWYgKGR5IDwgMCkge1xuICAgIGlmIChyID4gdDEpIHJldHVybjtcbiAgICBpZiAociA+IHQwKSB0MCA9IHI7XG4gIH0gZWxzZSBpZiAoZHkgPiAwKSB7XG4gICAgaWYgKHIgPCB0MCkgcmV0dXJuO1xuICAgIGlmIChyIDwgdDEpIHQxID0gcjtcbiAgfVxuXG4gIGlmICh0MCA+IDApIGFbMF0gPSBheCArIHQwICogZHgsIGFbMV0gPSBheSArIHQwICogZHk7XG4gIGlmICh0MSA8IDEpIGJbMF0gPSBheCArIHQxICogZHgsIGJbMV0gPSBheSArIHQxICogZHk7XG4gIHJldHVybiB0cnVlO1xufVxuIiwiaW1wb3J0IHthYnMsIGVwc2lsb259IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQgY2xpcEJ1ZmZlciBmcm9tIFwiLi9idWZmZXIuanNcIjtcbmltcG9ydCBjbGlwTGluZSBmcm9tIFwiLi9saW5lLmpzXCI7XG5pbXBvcnQgY2xpcFJlam9pbiBmcm9tIFwiLi9yZWpvaW4uanNcIjtcbmltcG9ydCB7bWVyZ2V9IGZyb20gXCJkMy1hcnJheVwiO1xuXG52YXIgY2xpcE1heCA9IDFlOSwgY2xpcE1pbiA9IC1jbGlwTWF4O1xuXG4vLyBUT0RPIFVzZSBkMy1wb2x5Z29u4oCZcyBwb2x5Z29uQ29udGFpbnMgaGVyZSBmb3IgdGhlIHJpbmcgY2hlY2s/XG4vLyBUT0RPIEVsaW1pbmF0ZSBkdXBsaWNhdGUgYnVmZmVyaW5nIGluIGNsaXBCdWZmZXIgYW5kIHBvbHlnb24ucHVzaD9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY2xpcFJlY3RhbmdsZSh4MCwgeTAsIHgxLCB5MSkge1xuXG4gIGZ1bmN0aW9uIHZpc2libGUoeCwgeSkge1xuICAgIHJldHVybiB4MCA8PSB4ICYmIHggPD0geDEgJiYgeTAgPD0geSAmJiB5IDw9IHkxO1xuICB9XG5cbiAgZnVuY3Rpb24gaW50ZXJwb2xhdGUoZnJvbSwgdG8sIGRpcmVjdGlvbiwgc3RyZWFtKSB7XG4gICAgdmFyIGEgPSAwLCBhMSA9IDA7XG4gICAgaWYgKGZyb20gPT0gbnVsbFxuICAgICAgICB8fCAoYSA9IGNvcm5lcihmcm9tLCBkaXJlY3Rpb24pKSAhPT0gKGExID0gY29ybmVyKHRvLCBkaXJlY3Rpb24pKVxuICAgICAgICB8fCBjb21wYXJlUG9pbnQoZnJvbSwgdG8pIDwgMCBeIGRpcmVjdGlvbiA+IDApIHtcbiAgICAgIGRvIHN0cmVhbS5wb2ludChhID09PSAwIHx8IGEgPT09IDMgPyB4MCA6IHgxLCBhID4gMSA/IHkxIDogeTApO1xuICAgICAgd2hpbGUgKChhID0gKGEgKyBkaXJlY3Rpb24gKyA0KSAlIDQpICE9PSBhMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0cmVhbS5wb2ludCh0b1swXSwgdG9bMV0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNvcm5lcihwLCBkaXJlY3Rpb24pIHtcbiAgICByZXR1cm4gYWJzKHBbMF0gLSB4MCkgPCBlcHNpbG9uID8gZGlyZWN0aW9uID4gMCA/IDAgOiAzXG4gICAgICAgIDogYWJzKHBbMF0gLSB4MSkgPCBlcHNpbG9uID8gZGlyZWN0aW9uID4gMCA/IDIgOiAxXG4gICAgICAgIDogYWJzKHBbMV0gLSB5MCkgPCBlcHNpbG9uID8gZGlyZWN0aW9uID4gMCA/IDEgOiAwXG4gICAgICAgIDogZGlyZWN0aW9uID4gMCA/IDMgOiAyOyAvLyBhYnMocFsxXSAtIHkxKSA8IGVwc2lsb25cbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbXBhcmVJbnRlcnNlY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBjb21wYXJlUG9pbnQoYS54LCBiLngpO1xuICB9XG5cbiAgZnVuY3Rpb24gY29tcGFyZVBvaW50KGEsIGIpIHtcbiAgICB2YXIgY2EgPSBjb3JuZXIoYSwgMSksXG4gICAgICAgIGNiID0gY29ybmVyKGIsIDEpO1xuICAgIHJldHVybiBjYSAhPT0gY2IgPyBjYSAtIGNiXG4gICAgICAgIDogY2EgPT09IDAgPyBiWzFdIC0gYVsxXVxuICAgICAgICA6IGNhID09PSAxID8gYVswXSAtIGJbMF1cbiAgICAgICAgOiBjYSA9PT0gMiA/IGFbMV0gLSBiWzFdXG4gICAgICAgIDogYlswXSAtIGFbMF07XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgdmFyIGFjdGl2ZVN0cmVhbSA9IHN0cmVhbSxcbiAgICAgICAgYnVmZmVyU3RyZWFtID0gY2xpcEJ1ZmZlcigpLFxuICAgICAgICBzZWdtZW50cyxcbiAgICAgICAgcG9seWdvbixcbiAgICAgICAgcmluZyxcbiAgICAgICAgeF9fLCB5X18sIHZfXywgLy8gZmlyc3QgcG9pbnRcbiAgICAgICAgeF8sIHlfLCB2XywgLy8gcHJldmlvdXMgcG9pbnRcbiAgICAgICAgZmlyc3QsXG4gICAgICAgIGNsZWFuO1xuXG4gICAgdmFyIGNsaXBTdHJlYW0gPSB7XG4gICAgICBwb2ludDogcG9pbnQsXG4gICAgICBsaW5lU3RhcnQ6IGxpbmVTdGFydCxcbiAgICAgIGxpbmVFbmQ6IGxpbmVFbmQsXG4gICAgICBwb2x5Z29uU3RhcnQ6IHBvbHlnb25TdGFydCxcbiAgICAgIHBvbHlnb25FbmQ6IHBvbHlnb25FbmRcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gcG9pbnQoeCwgeSkge1xuICAgICAgaWYgKHZpc2libGUoeCwgeSkpIGFjdGl2ZVN0cmVhbS5wb2ludCh4LCB5KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb2x5Z29uSW5zaWRlKCkge1xuICAgICAgdmFyIHdpbmRpbmcgPSAwO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbiA9IHBvbHlnb24ubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIGZvciAodmFyIHJpbmcgPSBwb2x5Z29uW2ldLCBqID0gMSwgbSA9IHJpbmcubGVuZ3RoLCBwb2ludCA9IHJpbmdbMF0sIGEwLCBhMSwgYjAgPSBwb2ludFswXSwgYjEgPSBwb2ludFsxXTsgaiA8IG07ICsraikge1xuICAgICAgICAgIGEwID0gYjAsIGExID0gYjEsIHBvaW50ID0gcmluZ1tqXSwgYjAgPSBwb2ludFswXSwgYjEgPSBwb2ludFsxXTtcbiAgICAgICAgICBpZiAoYTEgPD0geTEpIHsgaWYgKGIxID4geTEgJiYgKGIwIC0gYTApICogKHkxIC0gYTEpID4gKGIxIC0gYTEpICogKHgwIC0gYTApKSArK3dpbmRpbmc7IH1cbiAgICAgICAgICBlbHNlIHsgaWYgKGIxIDw9IHkxICYmIChiMCAtIGEwKSAqICh5MSAtIGExKSA8IChiMSAtIGExKSAqICh4MCAtIGEwKSkgLS13aW5kaW5nOyB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHdpbmRpbmc7XG4gICAgfVxuXG4gICAgLy8gQnVmZmVyIGdlb21ldHJ5IHdpdGhpbiBhIHBvbHlnb24gYW5kIHRoZW4gY2xpcCBpdCBlbiBtYXNzZS5cbiAgICBmdW5jdGlvbiBwb2x5Z29uU3RhcnQoKSB7XG4gICAgICBhY3RpdmVTdHJlYW0gPSBidWZmZXJTdHJlYW0sIHNlZ21lbnRzID0gW10sIHBvbHlnb24gPSBbXSwgY2xlYW4gPSB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBvbHlnb25FbmQoKSB7XG4gICAgICB2YXIgc3RhcnRJbnNpZGUgPSBwb2x5Z29uSW5zaWRlKCksXG4gICAgICAgICAgY2xlYW5JbnNpZGUgPSBjbGVhbiAmJiBzdGFydEluc2lkZSxcbiAgICAgICAgICB2aXNpYmxlID0gKHNlZ21lbnRzID0gbWVyZ2Uoc2VnbWVudHMpKS5sZW5ndGg7XG4gICAgICBpZiAoY2xlYW5JbnNpZGUgfHwgdmlzaWJsZSkge1xuICAgICAgICBzdHJlYW0ucG9seWdvblN0YXJ0KCk7XG4gICAgICAgIGlmIChjbGVhbkluc2lkZSkge1xuICAgICAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICBpbnRlcnBvbGF0ZShudWxsLCBudWxsLCAxLCBzdHJlYW0pO1xuICAgICAgICAgIHN0cmVhbS5saW5lRW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZpc2libGUpIHtcbiAgICAgICAgICBjbGlwUmVqb2luKHNlZ21lbnRzLCBjb21wYXJlSW50ZXJzZWN0aW9uLCBzdGFydEluc2lkZSwgaW50ZXJwb2xhdGUsIHN0cmVhbSk7XG4gICAgICAgIH1cbiAgICAgICAgc3RyZWFtLnBvbHlnb25FbmQoKTtcbiAgICAgIH1cbiAgICAgIGFjdGl2ZVN0cmVhbSA9IHN0cmVhbSwgc2VnbWVudHMgPSBwb2x5Z29uID0gcmluZyA9IG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGluZVN0YXJ0KCkge1xuICAgICAgY2xpcFN0cmVhbS5wb2ludCA9IGxpbmVQb2ludDtcbiAgICAgIGlmIChwb2x5Z29uKSBwb2x5Z29uLnB1c2gocmluZyA9IFtdKTtcbiAgICAgIGZpcnN0ID0gdHJ1ZTtcbiAgICAgIHZfID0gZmFsc2U7XG4gICAgICB4XyA9IHlfID0gTmFOO1xuICAgIH1cblxuICAgIC8vIFRPRE8gcmF0aGVyIHRoYW4gc3BlY2lhbC1jYXNlIHBvbHlnb25zLCBzaW1wbHkgaGFuZGxlIHRoZW0gc2VwYXJhdGVseS5cbiAgICAvLyBJZGVhbGx5LCBjb2luY2lkZW50IGludGVyc2VjdGlvbiBwb2ludHMgc2hvdWxkIGJlIGppdHRlcmVkIHRvIGF2b2lkXG4gICAgLy8gY2xpcHBpbmcgaXNzdWVzLlxuICAgIGZ1bmN0aW9uIGxpbmVFbmQoKSB7XG4gICAgICBpZiAoc2VnbWVudHMpIHtcbiAgICAgICAgbGluZVBvaW50KHhfXywgeV9fKTtcbiAgICAgICAgaWYgKHZfXyAmJiB2XykgYnVmZmVyU3RyZWFtLnJlam9pbigpO1xuICAgICAgICBzZWdtZW50cy5wdXNoKGJ1ZmZlclN0cmVhbS5yZXN1bHQoKSk7XG4gICAgICB9XG4gICAgICBjbGlwU3RyZWFtLnBvaW50ID0gcG9pbnQ7XG4gICAgICBpZiAodl8pIGFjdGl2ZVN0cmVhbS5saW5lRW5kKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGluZVBvaW50KHgsIHkpIHtcbiAgICAgIHZhciB2ID0gdmlzaWJsZSh4LCB5KTtcbiAgICAgIGlmIChwb2x5Z29uKSByaW5nLnB1c2goW3gsIHldKTtcbiAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICB4X18gPSB4LCB5X18gPSB5LCB2X18gPSB2O1xuICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICBpZiAodikge1xuICAgICAgICAgIGFjdGl2ZVN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICBhY3RpdmVTdHJlYW0ucG9pbnQoeCwgeSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh2ICYmIHZfKSBhY3RpdmVTdHJlYW0ucG9pbnQoeCwgeSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHZhciBhID0gW3hfID0gTWF0aC5tYXgoY2xpcE1pbiwgTWF0aC5taW4oY2xpcE1heCwgeF8pKSwgeV8gPSBNYXRoLm1heChjbGlwTWluLCBNYXRoLm1pbihjbGlwTWF4LCB5XykpXSxcbiAgICAgICAgICAgICAgYiA9IFt4ID0gTWF0aC5tYXgoY2xpcE1pbiwgTWF0aC5taW4oY2xpcE1heCwgeCkpLCB5ID0gTWF0aC5tYXgoY2xpcE1pbiwgTWF0aC5taW4oY2xpcE1heCwgeSkpXTtcbiAgICAgICAgICBpZiAoY2xpcExpbmUoYSwgYiwgeDAsIHkwLCB4MSwgeTEpKSB7XG4gICAgICAgICAgICBpZiAoIXZfKSB7XG4gICAgICAgICAgICAgIGFjdGl2ZVN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICAgICAgYWN0aXZlU3RyZWFtLnBvaW50KGFbMF0sIGFbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWN0aXZlU3RyZWFtLnBvaW50KGJbMF0sIGJbMV0pO1xuICAgICAgICAgICAgaWYgKCF2KSBhY3RpdmVTdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICAgICAgY2xlYW4gPSBmYWxzZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHYpIHtcbiAgICAgICAgICAgIGFjdGl2ZVN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICAgIGFjdGl2ZVN0cmVhbS5wb2ludCh4LCB5KTtcbiAgICAgICAgICAgIGNsZWFuID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB4XyA9IHgsIHlfID0geSwgdl8gPSB2O1xuICAgIH1cblxuICAgIHJldHVybiBjbGlwU3RyZWFtO1xuICB9O1xufVxuIiwiaW1wb3J0IGNsaXBSZWN0YW5nbGUgZnJvbSBcIi4vcmVjdGFuZ2xlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgeDAgPSAwLFxuICAgICAgeTAgPSAwLFxuICAgICAgeDEgPSA5NjAsXG4gICAgICB5MSA9IDUwMCxcbiAgICAgIGNhY2hlLFxuICAgICAgY2FjaGVTdHJlYW0sXG4gICAgICBjbGlwO1xuXG4gIHJldHVybiBjbGlwID0ge1xuICAgIHN0cmVhbTogZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICByZXR1cm4gY2FjaGUgJiYgY2FjaGVTdHJlYW0gPT09IHN0cmVhbSA/IGNhY2hlIDogY2FjaGUgPSBjbGlwUmVjdGFuZ2xlKHgwLCB5MCwgeDEsIHkxKShjYWNoZVN0cmVhbSA9IHN0cmVhbSk7XG4gICAgfSxcbiAgICBleHRlbnQ6IGZ1bmN0aW9uKF8pIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHgwID0gK19bMF1bMF0sIHkwID0gK19bMF1bMV0sIHgxID0gK19bMV1bMF0sIHkxID0gK19bMV1bMV0sIGNhY2hlID0gY2FjaGVTdHJlYW0gPSBudWxsLCBjbGlwKSA6IFtbeDAsIHkwXSwgW3gxLCB5MV1dO1xuICAgIH1cbiAgfTtcbn1cbiIsImltcG9ydCB7QWRkZXJ9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHthYnMsIGF0YW4yLCBjb3MsIHJhZGlhbnMsIHNpbiwgc3FydH0gZnJvbSBcIi4vbWF0aC5qc1wiO1xuaW1wb3J0IG5vb3AgZnJvbSBcIi4vbm9vcC5qc1wiO1xuaW1wb3J0IHN0cmVhbSBmcm9tIFwiLi9zdHJlYW0uanNcIjtcblxudmFyIGxlbmd0aFN1bSxcbiAgICBsYW1iZGEwLFxuICAgIHNpblBoaTAsXG4gICAgY29zUGhpMDtcblxudmFyIGxlbmd0aFN0cmVhbSA9IHtcbiAgc3BoZXJlOiBub29wLFxuICBwb2ludDogbm9vcCxcbiAgbGluZVN0YXJ0OiBsZW5ndGhMaW5lU3RhcnQsXG4gIGxpbmVFbmQ6IG5vb3AsXG4gIHBvbHlnb25TdGFydDogbm9vcCxcbiAgcG9seWdvbkVuZDogbm9vcFxufTtcblxuZnVuY3Rpb24gbGVuZ3RoTGluZVN0YXJ0KCkge1xuICBsZW5ndGhTdHJlYW0ucG9pbnQgPSBsZW5ndGhQb2ludEZpcnN0O1xuICBsZW5ndGhTdHJlYW0ubGluZUVuZCA9IGxlbmd0aExpbmVFbmQ7XG59XG5cbmZ1bmN0aW9uIGxlbmd0aExpbmVFbmQoKSB7XG4gIGxlbmd0aFN0cmVhbS5wb2ludCA9IGxlbmd0aFN0cmVhbS5saW5lRW5kID0gbm9vcDtcbn1cblxuZnVuY3Rpb24gbGVuZ3RoUG9pbnRGaXJzdChsYW1iZGEsIHBoaSkge1xuICBsYW1iZGEgKj0gcmFkaWFucywgcGhpICo9IHJhZGlhbnM7XG4gIGxhbWJkYTAgPSBsYW1iZGEsIHNpblBoaTAgPSBzaW4ocGhpKSwgY29zUGhpMCA9IGNvcyhwaGkpO1xuICBsZW5ndGhTdHJlYW0ucG9pbnQgPSBsZW5ndGhQb2ludDtcbn1cblxuZnVuY3Rpb24gbGVuZ3RoUG9pbnQobGFtYmRhLCBwaGkpIHtcbiAgbGFtYmRhICo9IHJhZGlhbnMsIHBoaSAqPSByYWRpYW5zO1xuICB2YXIgc2luUGhpID0gc2luKHBoaSksXG4gICAgICBjb3NQaGkgPSBjb3MocGhpKSxcbiAgICAgIGRlbHRhID0gYWJzKGxhbWJkYSAtIGxhbWJkYTApLFxuICAgICAgY29zRGVsdGEgPSBjb3MoZGVsdGEpLFxuICAgICAgc2luRGVsdGEgPSBzaW4oZGVsdGEpLFxuICAgICAgeCA9IGNvc1BoaSAqIHNpbkRlbHRhLFxuICAgICAgeSA9IGNvc1BoaTAgKiBzaW5QaGkgLSBzaW5QaGkwICogY29zUGhpICogY29zRGVsdGEsXG4gICAgICB6ID0gc2luUGhpMCAqIHNpblBoaSArIGNvc1BoaTAgKiBjb3NQaGkgKiBjb3NEZWx0YTtcbiAgbGVuZ3RoU3VtLmFkZChhdGFuMihzcXJ0KHggKiB4ICsgeSAqIHkpLCB6KSk7XG4gIGxhbWJkYTAgPSBsYW1iZGEsIHNpblBoaTAgPSBzaW5QaGksIGNvc1BoaTAgPSBjb3NQaGk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG9iamVjdCkge1xuICBsZW5ndGhTdW0gPSBuZXcgQWRkZXIoKTtcbiAgc3RyZWFtKG9iamVjdCwgbGVuZ3RoU3RyZWFtKTtcbiAgcmV0dXJuICtsZW5ndGhTdW07XG59XG4iLCJpbXBvcnQgbGVuZ3RoIGZyb20gXCIuL2xlbmd0aC5qc1wiO1xuXG52YXIgY29vcmRpbmF0ZXMgPSBbbnVsbCwgbnVsbF0sXG4gICAgb2JqZWN0ID0ge3R5cGU6IFwiTGluZVN0cmluZ1wiLCBjb29yZGluYXRlczogY29vcmRpbmF0ZXN9O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIGNvb3JkaW5hdGVzWzBdID0gYTtcbiAgY29vcmRpbmF0ZXNbMV0gPSBiO1xuICByZXR1cm4gbGVuZ3RoKG9iamVjdCk7XG59XG4iLCJpbXBvcnQge2RlZmF1bHQgYXMgcG9seWdvbkNvbnRhaW5zfSBmcm9tIFwiLi9wb2x5Z29uQ29udGFpbnMuanNcIjtcbmltcG9ydCB7ZGVmYXVsdCBhcyBkaXN0YW5jZX0gZnJvbSBcIi4vZGlzdGFuY2UuanNcIjtcbmltcG9ydCB7ZXBzaWxvbjIsIHJhZGlhbnN9IGZyb20gXCIuL21hdGguanNcIjtcblxudmFyIGNvbnRhaW5zT2JqZWN0VHlwZSA9IHtcbiAgRmVhdHVyZTogZnVuY3Rpb24ob2JqZWN0LCBwb2ludCkge1xuICAgIHJldHVybiBjb250YWluc0dlb21ldHJ5KG9iamVjdC5nZW9tZXRyeSwgcG9pbnQpO1xuICB9LFxuICBGZWF0dXJlQ29sbGVjdGlvbjogZnVuY3Rpb24ob2JqZWN0LCBwb2ludCkge1xuICAgIHZhciBmZWF0dXJlcyA9IG9iamVjdC5mZWF0dXJlcywgaSA9IC0xLCBuID0gZmVhdHVyZXMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoY29udGFpbnNHZW9tZXRyeShmZWF0dXJlc1tpXS5nZW9tZXRyeSwgcG9pbnQpKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbnZhciBjb250YWluc0dlb21ldHJ5VHlwZSA9IHtcbiAgU3BoZXJlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgUG9pbnQ6IGZ1bmN0aW9uKG9iamVjdCwgcG9pbnQpIHtcbiAgICByZXR1cm4gY29udGFpbnNQb2ludChvYmplY3QuY29vcmRpbmF0ZXMsIHBvaW50KTtcbiAgfSxcbiAgTXVsdGlQb2ludDogZnVuY3Rpb24ob2JqZWN0LCBwb2ludCkge1xuICAgIHZhciBjb29yZGluYXRlcyA9IG9iamVjdC5jb29yZGluYXRlcywgaSA9IC0xLCBuID0gY29vcmRpbmF0ZXMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoY29udGFpbnNQb2ludChjb29yZGluYXRlc1tpXSwgcG9pbnQpKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIExpbmVTdHJpbmc6IGZ1bmN0aW9uKG9iamVjdCwgcG9pbnQpIHtcbiAgICByZXR1cm4gY29udGFpbnNMaW5lKG9iamVjdC5jb29yZGluYXRlcywgcG9pbnQpO1xuICB9LFxuICBNdWx0aUxpbmVTdHJpbmc6IGZ1bmN0aW9uKG9iamVjdCwgcG9pbnQpIHtcbiAgICB2YXIgY29vcmRpbmF0ZXMgPSBvYmplY3QuY29vcmRpbmF0ZXMsIGkgPSAtMSwgbiA9IGNvb3JkaW5hdGVzLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbikgaWYgKGNvbnRhaW5zTGluZShjb29yZGluYXRlc1tpXSwgcG9pbnQpKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIFBvbHlnb246IGZ1bmN0aW9uKG9iamVjdCwgcG9pbnQpIHtcbiAgICByZXR1cm4gY29udGFpbnNQb2x5Z29uKG9iamVjdC5jb29yZGluYXRlcywgcG9pbnQpO1xuICB9LFxuICBNdWx0aVBvbHlnb246IGZ1bmN0aW9uKG9iamVjdCwgcG9pbnQpIHtcbiAgICB2YXIgY29vcmRpbmF0ZXMgPSBvYmplY3QuY29vcmRpbmF0ZXMsIGkgPSAtMSwgbiA9IGNvb3JkaW5hdGVzLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbikgaWYgKGNvbnRhaW5zUG9seWdvbihjb29yZGluYXRlc1tpXSwgcG9pbnQpKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIEdlb21ldHJ5Q29sbGVjdGlvbjogZnVuY3Rpb24ob2JqZWN0LCBwb2ludCkge1xuICAgIHZhciBnZW9tZXRyaWVzID0gb2JqZWN0Lmdlb21ldHJpZXMsIGkgPSAtMSwgbiA9IGdlb21ldHJpZXMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoY29udGFpbnNHZW9tZXRyeShnZW9tZXRyaWVzW2ldLCBwb2ludCkpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuZnVuY3Rpb24gY29udGFpbnNHZW9tZXRyeShnZW9tZXRyeSwgcG9pbnQpIHtcbiAgcmV0dXJuIGdlb21ldHJ5ICYmIGNvbnRhaW5zR2VvbWV0cnlUeXBlLmhhc093blByb3BlcnR5KGdlb21ldHJ5LnR5cGUpXG4gICAgICA/IGNvbnRhaW5zR2VvbWV0cnlUeXBlW2dlb21ldHJ5LnR5cGVdKGdlb21ldHJ5LCBwb2ludClcbiAgICAgIDogZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5zUG9pbnQoY29vcmRpbmF0ZXMsIHBvaW50KSB7XG4gIHJldHVybiBkaXN0YW5jZShjb29yZGluYXRlcywgcG9pbnQpID09PSAwO1xufVxuXG5mdW5jdGlvbiBjb250YWluc0xpbmUoY29vcmRpbmF0ZXMsIHBvaW50KSB7XG4gIHZhciBhbywgYm8sIGFiO1xuICBmb3IgKHZhciBpID0gMCwgbiA9IGNvb3JkaW5hdGVzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgIGJvID0gZGlzdGFuY2UoY29vcmRpbmF0ZXNbaV0sIHBvaW50KTtcbiAgICBpZiAoYm8gPT09IDApIHJldHVybiB0cnVlO1xuICAgIGlmIChpID4gMCkge1xuICAgICAgYWIgPSBkaXN0YW5jZShjb29yZGluYXRlc1tpXSwgY29vcmRpbmF0ZXNbaSAtIDFdKTtcbiAgICAgIGlmIChcbiAgICAgICAgYWIgPiAwICYmXG4gICAgICAgIGFvIDw9IGFiICYmXG4gICAgICAgIGJvIDw9IGFiICYmXG4gICAgICAgIChhbyArIGJvIC0gYWIpICogKDEgLSBNYXRoLnBvdygoYW8gLSBibykgLyBhYiwgMikpIDwgZXBzaWxvbjIgKiBhYlxuICAgICAgKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgYW8gPSBibztcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5zUG9seWdvbihjb29yZGluYXRlcywgcG9pbnQpIHtcbiAgcmV0dXJuICEhcG9seWdvbkNvbnRhaW5zKGNvb3JkaW5hdGVzLm1hcChyaW5nUmFkaWFucyksIHBvaW50UmFkaWFucyhwb2ludCkpO1xufVxuXG5mdW5jdGlvbiByaW5nUmFkaWFucyhyaW5nKSB7XG4gIHJldHVybiByaW5nID0gcmluZy5tYXAocG9pbnRSYWRpYW5zKSwgcmluZy5wb3AoKSwgcmluZztcbn1cblxuZnVuY3Rpb24gcG9pbnRSYWRpYW5zKHBvaW50KSB7XG4gIHJldHVybiBbcG9pbnRbMF0gKiByYWRpYW5zLCBwb2ludFsxXSAqIHJhZGlhbnNdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvYmplY3QsIHBvaW50KSB7XG4gIHJldHVybiAob2JqZWN0ICYmIGNvbnRhaW5zT2JqZWN0VHlwZS5oYXNPd25Qcm9wZXJ0eShvYmplY3QudHlwZSlcbiAgICAgID8gY29udGFpbnNPYmplY3RUeXBlW29iamVjdC50eXBlXVxuICAgICAgOiBjb250YWluc0dlb21ldHJ5KShvYmplY3QsIHBvaW50KTtcbn1cbiIsImltcG9ydCB7cmFuZ2V9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHthYnMsIGNlaWwsIGVwc2lsb259IGZyb20gXCIuL21hdGguanNcIjtcblxuZnVuY3Rpb24gZ3JhdGljdWxlWCh5MCwgeTEsIGR5KSB7XG4gIHZhciB5ID0gcmFuZ2UoeTAsIHkxIC0gZXBzaWxvbiwgZHkpLmNvbmNhdCh5MSk7XG4gIHJldHVybiBmdW5jdGlvbih4KSB7IHJldHVybiB5Lm1hcChmdW5jdGlvbih5KSB7IHJldHVybiBbeCwgeV07IH0pOyB9O1xufVxuXG5mdW5jdGlvbiBncmF0aWN1bGVZKHgwLCB4MSwgZHgpIHtcbiAgdmFyIHggPSByYW5nZSh4MCwgeDEgLSBlcHNpbG9uLCBkeCkuY29uY2F0KHgxKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKHkpIHsgcmV0dXJuIHgubWFwKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIFt4LCB5XTsgfSk7IH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdyYXRpY3VsZSgpIHtcbiAgdmFyIHgxLCB4MCwgWDEsIFgwLFxuICAgICAgeTEsIHkwLCBZMSwgWTAsXG4gICAgICBkeCA9IDEwLCBkeSA9IGR4LCBEWCA9IDkwLCBEWSA9IDM2MCxcbiAgICAgIHgsIHksIFgsIFksXG4gICAgICBwcmVjaXNpb24gPSAyLjU7XG5cbiAgZnVuY3Rpb24gZ3JhdGljdWxlKCkge1xuICAgIHJldHVybiB7dHlwZTogXCJNdWx0aUxpbmVTdHJpbmdcIiwgY29vcmRpbmF0ZXM6IGxpbmVzKCl9O1xuICB9XG5cbiAgZnVuY3Rpb24gbGluZXMoKSB7XG4gICAgcmV0dXJuIHJhbmdlKGNlaWwoWDAgLyBEWCkgKiBEWCwgWDEsIERYKS5tYXAoWClcbiAgICAgICAgLmNvbmNhdChyYW5nZShjZWlsKFkwIC8gRFkpICogRFksIFkxLCBEWSkubWFwKFkpKVxuICAgICAgICAuY29uY2F0KHJhbmdlKGNlaWwoeDAgLyBkeCkgKiBkeCwgeDEsIGR4KS5maWx0ZXIoZnVuY3Rpb24oeCkgeyByZXR1cm4gYWJzKHggJSBEWCkgPiBlcHNpbG9uOyB9KS5tYXAoeCkpXG4gICAgICAgIC5jb25jYXQocmFuZ2UoY2VpbCh5MCAvIGR5KSAqIGR5LCB5MSwgZHkpLmZpbHRlcihmdW5jdGlvbih5KSB7IHJldHVybiBhYnMoeSAlIERZKSA+IGVwc2lsb247IH0pLm1hcCh5KSk7XG4gIH1cblxuICBncmF0aWN1bGUubGluZXMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbGluZXMoKS5tYXAoZnVuY3Rpb24oY29vcmRpbmF0ZXMpIHsgcmV0dXJuIHt0eXBlOiBcIkxpbmVTdHJpbmdcIiwgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzfTsgfSk7XG4gIH07XG5cbiAgZ3JhdGljdWxlLm91dGxpbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogXCJQb2x5Z29uXCIsXG4gICAgICBjb29yZGluYXRlczogW1xuICAgICAgICBYKFgwKS5jb25jYXQoXG4gICAgICAgIFkoWTEpLnNsaWNlKDEpLFxuICAgICAgICBYKFgxKS5yZXZlcnNlKCkuc2xpY2UoMSksXG4gICAgICAgIFkoWTApLnJldmVyc2UoKS5zbGljZSgxKSlcbiAgICAgIF1cbiAgICB9O1xuICB9O1xuXG4gIGdyYXRpY3VsZS5leHRlbnQgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZ3JhdGljdWxlLmV4dGVudE1pbm9yKCk7XG4gICAgcmV0dXJuIGdyYXRpY3VsZS5leHRlbnRNYWpvcihfKS5leHRlbnRNaW5vcihfKTtcbiAgfTtcblxuICBncmF0aWN1bGUuZXh0ZW50TWFqb3IgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gW1tYMCwgWTBdLCBbWDEsIFkxXV07XG4gICAgWDAgPSArX1swXVswXSwgWDEgPSArX1sxXVswXTtcbiAgICBZMCA9ICtfWzBdWzFdLCBZMSA9ICtfWzFdWzFdO1xuICAgIGlmIChYMCA+IFgxKSBfID0gWDAsIFgwID0gWDEsIFgxID0gXztcbiAgICBpZiAoWTAgPiBZMSkgXyA9IFkwLCBZMCA9IFkxLCBZMSA9IF87XG4gICAgcmV0dXJuIGdyYXRpY3VsZS5wcmVjaXNpb24ocHJlY2lzaW9uKTtcbiAgfTtcblxuICBncmF0aWN1bGUuZXh0ZW50TWlub3IgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gW1t4MCwgeTBdLCBbeDEsIHkxXV07XG4gICAgeDAgPSArX1swXVswXSwgeDEgPSArX1sxXVswXTtcbiAgICB5MCA9ICtfWzBdWzFdLCB5MSA9ICtfWzFdWzFdO1xuICAgIGlmICh4MCA+IHgxKSBfID0geDAsIHgwID0geDEsIHgxID0gXztcbiAgICBpZiAoeTAgPiB5MSkgXyA9IHkwLCB5MCA9IHkxLCB5MSA9IF87XG4gICAgcmV0dXJuIGdyYXRpY3VsZS5wcmVjaXNpb24ocHJlY2lzaW9uKTtcbiAgfTtcblxuICBncmF0aWN1bGUuc3RlcCA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBncmF0aWN1bGUuc3RlcE1pbm9yKCk7XG4gICAgcmV0dXJuIGdyYXRpY3VsZS5zdGVwTWFqb3IoXykuc3RlcE1pbm9yKF8pO1xuICB9O1xuXG4gIGdyYXRpY3VsZS5zdGVwTWFqb3IgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gW0RYLCBEWV07XG4gICAgRFggPSArX1swXSwgRFkgPSArX1sxXTtcbiAgICByZXR1cm4gZ3JhdGljdWxlO1xuICB9O1xuXG4gIGdyYXRpY3VsZS5zdGVwTWlub3IgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gW2R4LCBkeV07XG4gICAgZHggPSArX1swXSwgZHkgPSArX1sxXTtcbiAgICByZXR1cm4gZ3JhdGljdWxlO1xuICB9O1xuXG4gIGdyYXRpY3VsZS5wcmVjaXNpb24gPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcHJlY2lzaW9uO1xuICAgIHByZWNpc2lvbiA9ICtfO1xuICAgIHggPSBncmF0aWN1bGVYKHkwLCB5MSwgOTApO1xuICAgIHkgPSBncmF0aWN1bGVZKHgwLCB4MSwgcHJlY2lzaW9uKTtcbiAgICBYID0gZ3JhdGljdWxlWChZMCwgWTEsIDkwKTtcbiAgICBZID0gZ3JhdGljdWxlWShYMCwgWDEsIHByZWNpc2lvbik7XG4gICAgcmV0dXJuIGdyYXRpY3VsZTtcbiAgfTtcblxuICByZXR1cm4gZ3JhdGljdWxlXG4gICAgICAuZXh0ZW50TWFqb3IoW1stMTgwLCAtOTAgKyBlcHNpbG9uXSwgWzE4MCwgOTAgLSBlcHNpbG9uXV0pXG4gICAgICAuZXh0ZW50TWlub3IoW1stMTgwLCAtODAgLSBlcHNpbG9uXSwgWzE4MCwgODAgKyBlcHNpbG9uXV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ3JhdGljdWxlMTAoKSB7XG4gIHJldHVybiBncmF0aWN1bGUoKSgpO1xufVxuIiwiaW1wb3J0IHthc2luLCBhdGFuMiwgY29zLCBkZWdyZWVzLCBoYXZlcnNpbiwgcmFkaWFucywgc2luLCBzcXJ0fSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIHgwID0gYVswXSAqIHJhZGlhbnMsXG4gICAgICB5MCA9IGFbMV0gKiByYWRpYW5zLFxuICAgICAgeDEgPSBiWzBdICogcmFkaWFucyxcbiAgICAgIHkxID0gYlsxXSAqIHJhZGlhbnMsXG4gICAgICBjeTAgPSBjb3MoeTApLFxuICAgICAgc3kwID0gc2luKHkwKSxcbiAgICAgIGN5MSA9IGNvcyh5MSksXG4gICAgICBzeTEgPSBzaW4oeTEpLFxuICAgICAga3gwID0gY3kwICogY29zKHgwKSxcbiAgICAgIGt5MCA9IGN5MCAqIHNpbih4MCksXG4gICAgICBreDEgPSBjeTEgKiBjb3MoeDEpLFxuICAgICAga3kxID0gY3kxICogc2luKHgxKSxcbiAgICAgIGQgPSAyICogYXNpbihzcXJ0KGhhdmVyc2luKHkxIC0geTApICsgY3kwICogY3kxICogaGF2ZXJzaW4oeDEgLSB4MCkpKSxcbiAgICAgIGsgPSBzaW4oZCk7XG5cbiAgdmFyIGludGVycG9sYXRlID0gZCA/IGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgQiA9IHNpbih0ICo9IGQpIC8gayxcbiAgICAgICAgQSA9IHNpbihkIC0gdCkgLyBrLFxuICAgICAgICB4ID0gQSAqIGt4MCArIEIgKiBreDEsXG4gICAgICAgIHkgPSBBICoga3kwICsgQiAqIGt5MSxcbiAgICAgICAgeiA9IEEgKiBzeTAgKyBCICogc3kxO1xuICAgIHJldHVybiBbXG4gICAgICBhdGFuMih5LCB4KSAqIGRlZ3JlZXMsXG4gICAgICBhdGFuMih6LCBzcXJ0KHggKiB4ICsgeSAqIHkpKSAqIGRlZ3JlZXNcbiAgICBdO1xuICB9IDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFt4MCAqIGRlZ3JlZXMsIHkwICogZGVncmVlc107XG4gIH07XG5cbiAgaW50ZXJwb2xhdGUuZGlzdGFuY2UgPSBkO1xuXG4gIHJldHVybiBpbnRlcnBvbGF0ZTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IHggPT4geDtcbiIsImltcG9ydCB7QWRkZXJ9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHthYnN9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQgbm9vcCBmcm9tIFwiLi4vbm9vcC5qc1wiO1xuXG52YXIgYXJlYVN1bSA9IG5ldyBBZGRlcigpLFxuICAgIGFyZWFSaW5nU3VtID0gbmV3IEFkZGVyKCksXG4gICAgeDAwLFxuICAgIHkwMCxcbiAgICB4MCxcbiAgICB5MDtcblxudmFyIGFyZWFTdHJlYW0gPSB7XG4gIHBvaW50OiBub29wLFxuICBsaW5lU3RhcnQ6IG5vb3AsXG4gIGxpbmVFbmQ6IG5vb3AsXG4gIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7XG4gICAgYXJlYVN0cmVhbS5saW5lU3RhcnQgPSBhcmVhUmluZ1N0YXJ0O1xuICAgIGFyZWFTdHJlYW0ubGluZUVuZCA9IGFyZWFSaW5nRW5kO1xuICB9LFxuICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICBhcmVhU3RyZWFtLmxpbmVTdGFydCA9IGFyZWFTdHJlYW0ubGluZUVuZCA9IGFyZWFTdHJlYW0ucG9pbnQgPSBub29wO1xuICAgIGFyZWFTdW0uYWRkKGFicyhhcmVhUmluZ1N1bSkpO1xuICAgIGFyZWFSaW5nU3VtID0gbmV3IEFkZGVyKCk7XG4gIH0sXG4gIHJlc3VsdDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZWEgPSBhcmVhU3VtIC8gMjtcbiAgICBhcmVhU3VtID0gbmV3IEFkZGVyKCk7XG4gICAgcmV0dXJuIGFyZWE7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGFyZWFSaW5nU3RhcnQoKSB7XG4gIGFyZWFTdHJlYW0ucG9pbnQgPSBhcmVhUG9pbnRGaXJzdDtcbn1cblxuZnVuY3Rpb24gYXJlYVBvaW50Rmlyc3QoeCwgeSkge1xuICBhcmVhU3RyZWFtLnBvaW50ID0gYXJlYVBvaW50O1xuICB4MDAgPSB4MCA9IHgsIHkwMCA9IHkwID0geTtcbn1cblxuZnVuY3Rpb24gYXJlYVBvaW50KHgsIHkpIHtcbiAgYXJlYVJpbmdTdW0uYWRkKHkwICogeCAtIHgwICogeSk7XG4gIHgwID0geCwgeTAgPSB5O1xufVxuXG5mdW5jdGlvbiBhcmVhUmluZ0VuZCgpIHtcbiAgYXJlYVBvaW50KHgwMCwgeTAwKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJlYVN0cmVhbTtcbiIsImltcG9ydCBub29wIGZyb20gXCIuLi9ub29wLmpzXCI7XG5cbnZhciB4MCA9IEluZmluaXR5LFxuICAgIHkwID0geDAsXG4gICAgeDEgPSAteDAsXG4gICAgeTEgPSB4MTtcblxudmFyIGJvdW5kc1N0cmVhbSA9IHtcbiAgcG9pbnQ6IGJvdW5kc1BvaW50LFxuICBsaW5lU3RhcnQ6IG5vb3AsXG4gIGxpbmVFbmQ6IG5vb3AsXG4gIHBvbHlnb25TdGFydDogbm9vcCxcbiAgcG9seWdvbkVuZDogbm9vcCxcbiAgcmVzdWx0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYm91bmRzID0gW1t4MCwgeTBdLCBbeDEsIHkxXV07XG4gICAgeDEgPSB5MSA9IC0oeTAgPSB4MCA9IEluZmluaXR5KTtcbiAgICByZXR1cm4gYm91bmRzO1xuICB9XG59O1xuXG5mdW5jdGlvbiBib3VuZHNQb2ludCh4LCB5KSB7XG4gIGlmICh4IDwgeDApIHgwID0geDtcbiAgaWYgKHggPiB4MSkgeDEgPSB4O1xuICBpZiAoeSA8IHkwKSB5MCA9IHk7XG4gIGlmICh5ID4geTEpIHkxID0geTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYm91bmRzU3RyZWFtO1xuIiwiaW1wb3J0IHtzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuXG4vLyBUT0RPIEVuZm9yY2UgcG9zaXRpdmUgYXJlYSBmb3IgZXh0ZXJpb3IsIG5lZ2F0aXZlIGFyZWEgZm9yIGludGVyaW9yP1xuXG52YXIgWDAgPSAwLFxuICAgIFkwID0gMCxcbiAgICBaMCA9IDAsXG4gICAgWDEgPSAwLFxuICAgIFkxID0gMCxcbiAgICBaMSA9IDAsXG4gICAgWDIgPSAwLFxuICAgIFkyID0gMCxcbiAgICBaMiA9IDAsXG4gICAgeDAwLFxuICAgIHkwMCxcbiAgICB4MCxcbiAgICB5MDtcblxudmFyIGNlbnRyb2lkU3RyZWFtID0ge1xuICBwb2ludDogY2VudHJvaWRQb2ludCxcbiAgbGluZVN0YXJ0OiBjZW50cm9pZExpbmVTdGFydCxcbiAgbGluZUVuZDogY2VudHJvaWRMaW5lRW5kLFxuICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIGNlbnRyb2lkU3RyZWFtLmxpbmVTdGFydCA9IGNlbnRyb2lkUmluZ1N0YXJ0O1xuICAgIGNlbnRyb2lkU3RyZWFtLmxpbmVFbmQgPSBjZW50cm9pZFJpbmdFbmQ7XG4gIH0sXG4gIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGNlbnRyb2lkU3RyZWFtLnBvaW50ID0gY2VudHJvaWRQb2ludDtcbiAgICBjZW50cm9pZFN0cmVhbS5saW5lU3RhcnQgPSBjZW50cm9pZExpbmVTdGFydDtcbiAgICBjZW50cm9pZFN0cmVhbS5saW5lRW5kID0gY2VudHJvaWRMaW5lRW5kO1xuICB9LFxuICByZXN1bHQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjZW50cm9pZCA9IFoyID8gW1gyIC8gWjIsIFkyIC8gWjJdXG4gICAgICAgIDogWjEgPyBbWDEgLyBaMSwgWTEgLyBaMV1cbiAgICAgICAgOiBaMCA/IFtYMCAvIFowLCBZMCAvIFowXVxuICAgICAgICA6IFtOYU4sIE5hTl07XG4gICAgWDAgPSBZMCA9IFowID1cbiAgICBYMSA9IFkxID0gWjEgPVxuICAgIFgyID0gWTIgPSBaMiA9IDA7XG4gICAgcmV0dXJuIGNlbnRyb2lkO1xuICB9XG59O1xuXG5mdW5jdGlvbiBjZW50cm9pZFBvaW50KHgsIHkpIHtcbiAgWDAgKz0geDtcbiAgWTAgKz0geTtcbiAgKytaMDtcbn1cblxuZnVuY3Rpb24gY2VudHJvaWRMaW5lU3RhcnQoKSB7XG4gIGNlbnRyb2lkU3RyZWFtLnBvaW50ID0gY2VudHJvaWRQb2ludEZpcnN0TGluZTtcbn1cblxuZnVuY3Rpb24gY2VudHJvaWRQb2ludEZpcnN0TGluZSh4LCB5KSB7XG4gIGNlbnRyb2lkU3RyZWFtLnBvaW50ID0gY2VudHJvaWRQb2ludExpbmU7XG4gIGNlbnRyb2lkUG9pbnQoeDAgPSB4LCB5MCA9IHkpO1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZFBvaW50TGluZSh4LCB5KSB7XG4gIHZhciBkeCA9IHggLSB4MCwgZHkgPSB5IC0geTAsIHogPSBzcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgWDEgKz0geiAqICh4MCArIHgpIC8gMjtcbiAgWTEgKz0geiAqICh5MCArIHkpIC8gMjtcbiAgWjEgKz0gejtcbiAgY2VudHJvaWRQb2ludCh4MCA9IHgsIHkwID0geSk7XG59XG5cbmZ1bmN0aW9uIGNlbnRyb2lkTGluZUVuZCgpIHtcbiAgY2VudHJvaWRTdHJlYW0ucG9pbnQgPSBjZW50cm9pZFBvaW50O1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZFJpbmdTdGFydCgpIHtcbiAgY2VudHJvaWRTdHJlYW0ucG9pbnQgPSBjZW50cm9pZFBvaW50Rmlyc3RSaW5nO1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZFJpbmdFbmQoKSB7XG4gIGNlbnRyb2lkUG9pbnRSaW5nKHgwMCwgeTAwKTtcbn1cblxuZnVuY3Rpb24gY2VudHJvaWRQb2ludEZpcnN0UmluZyh4LCB5KSB7XG4gIGNlbnRyb2lkU3RyZWFtLnBvaW50ID0gY2VudHJvaWRQb2ludFJpbmc7XG4gIGNlbnRyb2lkUG9pbnQoeDAwID0geDAgPSB4LCB5MDAgPSB5MCA9IHkpO1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZFBvaW50UmluZyh4LCB5KSB7XG4gIHZhciBkeCA9IHggLSB4MCxcbiAgICAgIGR5ID0geSAtIHkwLFxuICAgICAgeiA9IHNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuXG4gIFgxICs9IHogKiAoeDAgKyB4KSAvIDI7XG4gIFkxICs9IHogKiAoeTAgKyB5KSAvIDI7XG4gIFoxICs9IHo7XG5cbiAgeiA9IHkwICogeCAtIHgwICogeTtcbiAgWDIgKz0geiAqICh4MCArIHgpO1xuICBZMiArPSB6ICogKHkwICsgeSk7XG4gIFoyICs9IHogKiAzO1xuICBjZW50cm9pZFBvaW50KHgwID0geCwgeTAgPSB5KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2VudHJvaWRTdHJlYW07XG4iLCJpbXBvcnQge3RhdX0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCBub29wIGZyb20gXCIuLi9ub29wLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFBhdGhDb250ZXh0KGNvbnRleHQpIHtcbiAgdGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG59XG5cblBhdGhDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgX3JhZGl1czogNC41LFxuICBwb2ludFJhZGl1czogZnVuY3Rpb24oXykge1xuICAgIHJldHVybiB0aGlzLl9yYWRpdXMgPSBfLCB0aGlzO1xuICB9LFxuICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSAwO1xuICB9LFxuICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gTmFOO1xuICB9LFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3BvaW50ID0gMDtcbiAgfSxcbiAgbGluZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX2xpbmUgPT09IDApIHRoaXMuX2NvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgdGhpcy5fcG9pbnQgPSBOYU47XG4gIH0sXG4gIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgc3dpdGNoICh0aGlzLl9wb2ludCkge1xuICAgICAgY2FzZSAwOiB7XG4gICAgICAgIHRoaXMuX2NvbnRleHQubW92ZVRvKHgsIHkpO1xuICAgICAgICB0aGlzLl9wb2ludCA9IDE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAxOiB7XG4gICAgICAgIHRoaXMuX2NvbnRleHQubGluZVRvKHgsIHkpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgdGhpcy5fY29udGV4dC5tb3ZlVG8oeCArIHRoaXMuX3JhZGl1cywgeSk7XG4gICAgICAgIHRoaXMuX2NvbnRleHQuYXJjKHgsIHksIHRoaXMuX3JhZGl1cywgMCwgdGF1KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICByZXN1bHQ6IG5vb3Bcbn07XG4iLCJpbXBvcnQge0FkZGVyfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7c3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCBub29wIGZyb20gXCIuLi9ub29wLmpzXCI7XG5cbnZhciBsZW5ndGhTdW0gPSBuZXcgQWRkZXIoKSxcbiAgICBsZW5ndGhSaW5nLFxuICAgIHgwMCxcbiAgICB5MDAsXG4gICAgeDAsXG4gICAgeTA7XG5cbnZhciBsZW5ndGhTdHJlYW0gPSB7XG4gIHBvaW50OiBub29wLFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIGxlbmd0aFN0cmVhbS5wb2ludCA9IGxlbmd0aFBvaW50Rmlyc3Q7XG4gIH0sXG4gIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmIChsZW5ndGhSaW5nKSBsZW5ndGhQb2ludCh4MDAsIHkwMCk7XG4gICAgbGVuZ3RoU3RyZWFtLnBvaW50ID0gbm9vcDtcbiAgfSxcbiAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICBsZW5ndGhSaW5nID0gdHJ1ZTtcbiAgfSxcbiAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7XG4gICAgbGVuZ3RoUmluZyA9IG51bGw7XG4gIH0sXG4gIHJlc3VsdDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxlbmd0aCA9ICtsZW5ndGhTdW07XG4gICAgbGVuZ3RoU3VtID0gbmV3IEFkZGVyKCk7XG4gICAgcmV0dXJuIGxlbmd0aDtcbiAgfVxufTtcblxuZnVuY3Rpb24gbGVuZ3RoUG9pbnRGaXJzdCh4LCB5KSB7XG4gIGxlbmd0aFN0cmVhbS5wb2ludCA9IGxlbmd0aFBvaW50O1xuICB4MDAgPSB4MCA9IHgsIHkwMCA9IHkwID0geTtcbn1cblxuZnVuY3Rpb24gbGVuZ3RoUG9pbnQoeCwgeSkge1xuICB4MCAtPSB4LCB5MCAtPSB5O1xuICBsZW5ndGhTdW0uYWRkKHNxcnQoeDAgKiB4MCArIHkwICogeTApKTtcbiAgeDAgPSB4LCB5MCA9IHk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGxlbmd0aFN0cmVhbTtcbiIsIi8vIFNpbXBsZSBjYWNoaW5nIGZvciBjb25zdGFudC1yYWRpdXMgcG9pbnRzLlxubGV0IGNhY2hlRGlnaXRzLCBjYWNoZUFwcGVuZCwgY2FjaGVSYWRpdXMsIGNhY2hlQ2lyY2xlO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXRoU3RyaW5nIHtcbiAgY29uc3RydWN0b3IoZGlnaXRzKSB7XG4gICAgdGhpcy5fYXBwZW5kID0gZGlnaXRzID09IG51bGwgPyBhcHBlbmQgOiBhcHBlbmRSb3VuZChkaWdpdHMpO1xuICAgIHRoaXMuX3JhZGl1cyA9IDQuNTtcbiAgICB0aGlzLl8gPSBcIlwiO1xuICB9XG4gIHBvaW50UmFkaXVzKF8pIHtcbiAgICB0aGlzLl9yYWRpdXMgPSArXztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBwb2x5Z29uU3RhcnQoKSB7XG4gICAgdGhpcy5fbGluZSA9IDA7XG4gIH1cbiAgcG9seWdvbkVuZCgpIHtcbiAgICB0aGlzLl9saW5lID0gTmFOO1xuICB9XG4gIGxpbmVTdGFydCgpIHtcbiAgICB0aGlzLl9wb2ludCA9IDA7XG4gIH1cbiAgbGluZUVuZCgpIHtcbiAgICBpZiAodGhpcy5fbGluZSA9PT0gMCkgdGhpcy5fICs9IFwiWlwiO1xuICAgIHRoaXMuX3BvaW50ID0gTmFOO1xuICB9XG4gIHBvaW50KHgsIHkpIHtcbiAgICBzd2l0Y2ggKHRoaXMuX3BvaW50KSB7XG4gICAgICBjYXNlIDA6IHtcbiAgICAgICAgdGhpcy5fYXBwZW5kYE0ke3h9LCR7eX1gO1xuICAgICAgICB0aGlzLl9wb2ludCA9IDE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAxOiB7XG4gICAgICAgIHRoaXMuX2FwcGVuZGBMJHt4fSwke3l9YDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIHRoaXMuX2FwcGVuZGBNJHt4fSwke3l9YDtcbiAgICAgICAgaWYgKHRoaXMuX3JhZGl1cyAhPT0gY2FjaGVSYWRpdXMgfHwgdGhpcy5fYXBwZW5kICE9PSBjYWNoZUFwcGVuZCkge1xuICAgICAgICAgIGNvbnN0IHIgPSB0aGlzLl9yYWRpdXM7XG4gICAgICAgICAgY29uc3QgcyA9IHRoaXMuXztcbiAgICAgICAgICB0aGlzLl8gPSBcIlwiOyAvLyBzdGFzaCB0aGUgb2xkIHN0cmluZyBzbyB3ZSBjYW4gY2FjaGUgdGhlIGNpcmNsZSBwYXRoIGZyYWdtZW50XG4gICAgICAgICAgdGhpcy5fYXBwZW5kYG0wLCR7cn1hJHtyfSwke3J9IDAgMSwxIDAsJHstMiAqIHJ9YSR7cn0sJHtyfSAwIDEsMSAwLCR7MiAqIHJ9emA7XG4gICAgICAgICAgY2FjaGVSYWRpdXMgPSByO1xuICAgICAgICAgIGNhY2hlQXBwZW5kID0gdGhpcy5fYXBwZW5kO1xuICAgICAgICAgIGNhY2hlQ2lyY2xlID0gdGhpcy5fO1xuICAgICAgICAgIHRoaXMuXyA9IHM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fICs9IGNhY2hlQ2lyY2xlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmVzdWx0KCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuXztcbiAgICB0aGlzLl8gPSBcIlwiO1xuICAgIHJldHVybiByZXN1bHQubGVuZ3RoID8gcmVzdWx0IDogbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBlbmQoc3RyaW5ncykge1xuICBsZXQgaSA9IDE7XG4gIHRoaXMuXyArPSBzdHJpbmdzWzBdO1xuICBmb3IgKGNvbnN0IGogPSBzdHJpbmdzLmxlbmd0aDsgaSA8IGo7ICsraSkge1xuICAgIHRoaXMuXyArPSBhcmd1bWVudHNbaV0gKyBzdHJpbmdzW2ldO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGVuZFJvdW5kKGRpZ2l0cykge1xuICBjb25zdCBkID0gTWF0aC5mbG9vcihkaWdpdHMpO1xuICBpZiAoIShkID49IDApKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgaW52YWxpZCBkaWdpdHM6ICR7ZGlnaXRzfWApO1xuICBpZiAoZCA+IDE1KSByZXR1cm4gYXBwZW5kO1xuICBpZiAoZCAhPT0gY2FjaGVEaWdpdHMpIHtcbiAgICBjb25zdCBrID0gMTAgKiogZDtcbiAgICBjYWNoZURpZ2l0cyA9IGQ7XG4gICAgY2FjaGVBcHBlbmQgPSBmdW5jdGlvbiBhcHBlbmQoc3RyaW5ncykge1xuICAgICAgbGV0IGkgPSAxO1xuICAgICAgdGhpcy5fICs9IHN0cmluZ3NbMF07XG4gICAgICBmb3IgKGNvbnN0IGogPSBzdHJpbmdzLmxlbmd0aDsgaSA8IGo7ICsraSkge1xuICAgICAgICB0aGlzLl8gKz0gTWF0aC5yb3VuZChhcmd1bWVudHNbaV0gKiBrKSAvIGsgKyBzdHJpbmdzW2ldO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGNhY2hlQXBwZW5kO1xufVxuIiwiaW1wb3J0IGlkZW50aXR5IGZyb20gXCIuLi9pZGVudGl0eS5qc1wiO1xuaW1wb3J0IHN0cmVhbSBmcm9tIFwiLi4vc3RyZWFtLmpzXCI7XG5pbXBvcnQgcGF0aEFyZWEgZnJvbSBcIi4vYXJlYS5qc1wiO1xuaW1wb3J0IHBhdGhCb3VuZHMgZnJvbSBcIi4vYm91bmRzLmpzXCI7XG5pbXBvcnQgcGF0aENlbnRyb2lkIGZyb20gXCIuL2NlbnRyb2lkLmpzXCI7XG5pbXBvcnQgUGF0aENvbnRleHQgZnJvbSBcIi4vY29udGV4dC5qc1wiO1xuaW1wb3J0IHBhdGhNZWFzdXJlIGZyb20gXCIuL21lYXN1cmUuanNcIjtcbmltcG9ydCBQYXRoU3RyaW5nIGZyb20gXCIuL3N0cmluZy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihwcm9qZWN0aW9uLCBjb250ZXh0KSB7XG4gIGxldCBkaWdpdHMgPSAzLFxuICAgICAgcG9pbnRSYWRpdXMgPSA0LjUsXG4gICAgICBwcm9qZWN0aW9uU3RyZWFtLFxuICAgICAgY29udGV4dFN0cmVhbTtcblxuICBmdW5jdGlvbiBwYXRoKG9iamVjdCkge1xuICAgIGlmIChvYmplY3QpIHtcbiAgICAgIGlmICh0eXBlb2YgcG9pbnRSYWRpdXMgPT09IFwiZnVuY3Rpb25cIikgY29udGV4dFN0cmVhbS5wb2ludFJhZGl1cygrcG9pbnRSYWRpdXMuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgICBzdHJlYW0ob2JqZWN0LCBwcm9qZWN0aW9uU3RyZWFtKGNvbnRleHRTdHJlYW0pKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnRleHRTdHJlYW0ucmVzdWx0KCk7XG4gIH1cblxuICBwYXRoLmFyZWEgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICBzdHJlYW0ob2JqZWN0LCBwcm9qZWN0aW9uU3RyZWFtKHBhdGhBcmVhKSk7XG4gICAgcmV0dXJuIHBhdGhBcmVhLnJlc3VsdCgpO1xuICB9O1xuXG4gIHBhdGgubWVhc3VyZSA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHN0cmVhbShvYmplY3QsIHByb2plY3Rpb25TdHJlYW0ocGF0aE1lYXN1cmUpKTtcbiAgICByZXR1cm4gcGF0aE1lYXN1cmUucmVzdWx0KCk7XG4gIH07XG5cbiAgcGF0aC5ib3VuZHMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICBzdHJlYW0ob2JqZWN0LCBwcm9qZWN0aW9uU3RyZWFtKHBhdGhCb3VuZHMpKTtcbiAgICByZXR1cm4gcGF0aEJvdW5kcy5yZXN1bHQoKTtcbiAgfTtcblxuICBwYXRoLmNlbnRyb2lkID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgc3RyZWFtKG9iamVjdCwgcHJvamVjdGlvblN0cmVhbShwYXRoQ2VudHJvaWQpKTtcbiAgICByZXR1cm4gcGF0aENlbnRyb2lkLnJlc3VsdCgpO1xuICB9O1xuXG4gIHBhdGgucHJvamVjdGlvbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBwcm9qZWN0aW9uO1xuICAgIHByb2plY3Rpb25TdHJlYW0gPSBfID09IG51bGwgPyAocHJvamVjdGlvbiA9IG51bGwsIGlkZW50aXR5KSA6IChwcm9qZWN0aW9uID0gXykuc3RyZWFtO1xuICAgIHJldHVybiBwYXRoO1xuICB9O1xuXG4gIHBhdGguY29udGV4dCA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBjb250ZXh0O1xuICAgIGNvbnRleHRTdHJlYW0gPSBfID09IG51bGwgPyAoY29udGV4dCA9IG51bGwsIG5ldyBQYXRoU3RyaW5nKGRpZ2l0cykpIDogbmV3IFBhdGhDb250ZXh0KGNvbnRleHQgPSBfKTtcbiAgICBpZiAodHlwZW9mIHBvaW50UmFkaXVzICE9PSBcImZ1bmN0aW9uXCIpIGNvbnRleHRTdHJlYW0ucG9pbnRSYWRpdXMocG9pbnRSYWRpdXMpO1xuICAgIHJldHVybiBwYXRoO1xuICB9O1xuXG4gIHBhdGgucG9pbnRSYWRpdXMgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcG9pbnRSYWRpdXM7XG4gICAgcG9pbnRSYWRpdXMgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IChjb250ZXh0U3RyZWFtLnBvaW50UmFkaXVzKCtfKSwgK18pO1xuICAgIHJldHVybiBwYXRoO1xuICB9O1xuXG4gIHBhdGguZGlnaXRzID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGRpZ2l0cztcbiAgICBpZiAoXyA9PSBudWxsKSBkaWdpdHMgPSBudWxsO1xuICAgIGVsc2Uge1xuICAgICAgY29uc3QgZCA9IE1hdGguZmxvb3IoXyk7XG4gICAgICBpZiAoIShkID49IDApKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgaW52YWxpZCBkaWdpdHM6ICR7X31gKTtcbiAgICAgIGRpZ2l0cyA9IGQ7XG4gICAgfVxuICAgIGlmIChjb250ZXh0ID09PSBudWxsKSBjb250ZXh0U3RyZWFtID0gbmV3IFBhdGhTdHJpbmcoZGlnaXRzKTtcbiAgICByZXR1cm4gcGF0aDtcbiAgfTtcblxuICByZXR1cm4gcGF0aC5wcm9qZWN0aW9uKHByb2plY3Rpb24pLmRpZ2l0cyhkaWdpdHMpLmNvbnRleHQoY29udGV4dCk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtZXRob2RzKSB7XG4gIHJldHVybiB7XG4gICAgc3RyZWFtOiB0cmFuc2Zvcm1lcihtZXRob2RzKVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtZXIobWV0aG9kcykge1xuICByZXR1cm4gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgdmFyIHMgPSBuZXcgVHJhbnNmb3JtU3RyZWFtO1xuICAgIGZvciAodmFyIGtleSBpbiBtZXRob2RzKSBzW2tleV0gPSBtZXRob2RzW2tleV07XG4gICAgcy5zdHJlYW0gPSBzdHJlYW07XG4gICAgcmV0dXJuIHM7XG4gIH07XG59XG5cbmZ1bmN0aW9uIFRyYW5zZm9ybVN0cmVhbSgpIHt9XG5cblRyYW5zZm9ybVN0cmVhbS5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBUcmFuc2Zvcm1TdHJlYW0sXG4gIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7IHRoaXMuc3RyZWFtLnBvaW50KHgsIHkpOyB9LFxuICBzcGhlcmU6IGZ1bmN0aW9uKCkgeyB0aGlzLnN0cmVhbS5zcGhlcmUoKTsgfSxcbiAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHsgdGhpcy5zdHJlYW0ubGluZVN0YXJ0KCk7IH0sXG4gIGxpbmVFbmQ6IGZ1bmN0aW9uKCkgeyB0aGlzLnN0cmVhbS5saW5lRW5kKCk7IH0sXG4gIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7IHRoaXMuc3RyZWFtLnBvbHlnb25TdGFydCgpOyB9LFxuICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHsgdGhpcy5zdHJlYW0ucG9seWdvbkVuZCgpOyB9XG59O1xuIiwiaW1wb3J0IHtkZWZhdWx0IGFzIGdlb1N0cmVhbX0gZnJvbSBcIi4uL3N0cmVhbS5qc1wiO1xuaW1wb3J0IGJvdW5kc1N0cmVhbSBmcm9tIFwiLi4vcGF0aC9ib3VuZHMuanNcIjtcblxuZnVuY3Rpb24gZml0KHByb2plY3Rpb24sIGZpdEJvdW5kcywgb2JqZWN0KSB7XG4gIHZhciBjbGlwID0gcHJvamVjdGlvbi5jbGlwRXh0ZW50ICYmIHByb2plY3Rpb24uY2xpcEV4dGVudCgpO1xuICBwcm9qZWN0aW9uLnNjYWxlKDE1MCkudHJhbnNsYXRlKFswLCAwXSk7XG4gIGlmIChjbGlwICE9IG51bGwpIHByb2plY3Rpb24uY2xpcEV4dGVudChudWxsKTtcbiAgZ2VvU3RyZWFtKG9iamVjdCwgcHJvamVjdGlvbi5zdHJlYW0oYm91bmRzU3RyZWFtKSk7XG4gIGZpdEJvdW5kcyhib3VuZHNTdHJlYW0ucmVzdWx0KCkpO1xuICBpZiAoY2xpcCAhPSBudWxsKSBwcm9qZWN0aW9uLmNsaXBFeHRlbnQoY2xpcCk7XG4gIHJldHVybiBwcm9qZWN0aW9uO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZml0RXh0ZW50KHByb2plY3Rpb24sIGV4dGVudCwgb2JqZWN0KSB7XG4gIHJldHVybiBmaXQocHJvamVjdGlvbiwgZnVuY3Rpb24oYikge1xuICAgIHZhciB3ID0gZXh0ZW50WzFdWzBdIC0gZXh0ZW50WzBdWzBdLFxuICAgICAgICBoID0gZXh0ZW50WzFdWzFdIC0gZXh0ZW50WzBdWzFdLFxuICAgICAgICBrID0gTWF0aC5taW4odyAvIChiWzFdWzBdIC0gYlswXVswXSksIGggLyAoYlsxXVsxXSAtIGJbMF1bMV0pKSxcbiAgICAgICAgeCA9ICtleHRlbnRbMF1bMF0gKyAodyAtIGsgKiAoYlsxXVswXSArIGJbMF1bMF0pKSAvIDIsXG4gICAgICAgIHkgPSArZXh0ZW50WzBdWzFdICsgKGggLSBrICogKGJbMV1bMV0gKyBiWzBdWzFdKSkgLyAyO1xuICAgIHByb2plY3Rpb24uc2NhbGUoMTUwICogaykudHJhbnNsYXRlKFt4LCB5XSk7XG4gIH0sIG9iamVjdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaXRTaXplKHByb2plY3Rpb24sIHNpemUsIG9iamVjdCkge1xuICByZXR1cm4gZml0RXh0ZW50KHByb2plY3Rpb24sIFtbMCwgMF0sIHNpemVdLCBvYmplY3QpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZml0V2lkdGgocHJvamVjdGlvbiwgd2lkdGgsIG9iamVjdCkge1xuICByZXR1cm4gZml0KHByb2plY3Rpb24sIGZ1bmN0aW9uKGIpIHtcbiAgICB2YXIgdyA9ICt3aWR0aCxcbiAgICAgICAgayA9IHcgLyAoYlsxXVswXSAtIGJbMF1bMF0pLFxuICAgICAgICB4ID0gKHcgLSBrICogKGJbMV1bMF0gKyBiWzBdWzBdKSkgLyAyLFxuICAgICAgICB5ID0gLWsgKiBiWzBdWzFdO1xuICAgIHByb2plY3Rpb24uc2NhbGUoMTUwICogaykudHJhbnNsYXRlKFt4LCB5XSk7XG4gIH0sIG9iamVjdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaXRIZWlnaHQocHJvamVjdGlvbiwgaGVpZ2h0LCBvYmplY3QpIHtcbiAgcmV0dXJuIGZpdChwcm9qZWN0aW9uLCBmdW5jdGlvbihiKSB7XG4gICAgdmFyIGggPSAraGVpZ2h0LFxuICAgICAgICBrID0gaCAvIChiWzFdWzFdIC0gYlswXVsxXSksXG4gICAgICAgIHggPSAtayAqIGJbMF1bMF0sXG4gICAgICAgIHkgPSAoaCAtIGsgKiAoYlsxXVsxXSArIGJbMF1bMV0pKSAvIDI7XG4gICAgcHJvamVjdGlvbi5zY2FsZSgxNTAgKiBrKS50cmFuc2xhdGUoW3gsIHldKTtcbiAgfSwgb2JqZWN0KTtcbn1cbiIsImltcG9ydCB7Y2FydGVzaWFufSBmcm9tIFwiLi4vY2FydGVzaWFuLmpzXCI7XG5pbXBvcnQge2FicywgYXNpbiwgYXRhbjIsIGNvcywgZXBzaWxvbiwgcmFkaWFucywgc3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCB7dHJhbnNmb3JtZXJ9IGZyb20gXCIuLi90cmFuc2Zvcm0uanNcIjtcblxudmFyIG1heERlcHRoID0gMTYsIC8vIG1heGltdW0gZGVwdGggb2Ygc3ViZGl2aXNpb25cbiAgICBjb3NNaW5EaXN0YW5jZSA9IGNvcygzMCAqIHJhZGlhbnMpOyAvLyBjb3MobWluaW11bSBhbmd1bGFyIGRpc3RhbmNlKVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihwcm9qZWN0LCBkZWx0YTIpIHtcbiAgcmV0dXJuICtkZWx0YTIgPyByZXNhbXBsZShwcm9qZWN0LCBkZWx0YTIpIDogcmVzYW1wbGVOb25lKHByb2plY3QpO1xufVxuXG5mdW5jdGlvbiByZXNhbXBsZU5vbmUocHJvamVjdCkge1xuICByZXR1cm4gdHJhbnNmb3JtZXIoe1xuICAgIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICB4ID0gcHJvamVjdCh4LCB5KTtcbiAgICAgIHRoaXMuc3RyZWFtLnBvaW50KHhbMF0sIHhbMV0pO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlc2FtcGxlKHByb2plY3QsIGRlbHRhMikge1xuXG4gIGZ1bmN0aW9uIHJlc2FtcGxlTGluZVRvKHgwLCB5MCwgbGFtYmRhMCwgYTAsIGIwLCBjMCwgeDEsIHkxLCBsYW1iZGExLCBhMSwgYjEsIGMxLCBkZXB0aCwgc3RyZWFtKSB7XG4gICAgdmFyIGR4ID0geDEgLSB4MCxcbiAgICAgICAgZHkgPSB5MSAtIHkwLFxuICAgICAgICBkMiA9IGR4ICogZHggKyBkeSAqIGR5O1xuICAgIGlmIChkMiA+IDQgKiBkZWx0YTIgJiYgZGVwdGgtLSkge1xuICAgICAgdmFyIGEgPSBhMCArIGExLFxuICAgICAgICAgIGIgPSBiMCArIGIxLFxuICAgICAgICAgIGMgPSBjMCArIGMxLFxuICAgICAgICAgIG0gPSBzcXJ0KGEgKiBhICsgYiAqIGIgKyBjICogYyksXG4gICAgICAgICAgcGhpMiA9IGFzaW4oYyAvPSBtKSxcbiAgICAgICAgICBsYW1iZGEyID0gYWJzKGFicyhjKSAtIDEpIDwgZXBzaWxvbiB8fCBhYnMobGFtYmRhMCAtIGxhbWJkYTEpIDwgZXBzaWxvbiA/IChsYW1iZGEwICsgbGFtYmRhMSkgLyAyIDogYXRhbjIoYiwgYSksXG4gICAgICAgICAgcCA9IHByb2plY3QobGFtYmRhMiwgcGhpMiksXG4gICAgICAgICAgeDIgPSBwWzBdLFxuICAgICAgICAgIHkyID0gcFsxXSxcbiAgICAgICAgICBkeDIgPSB4MiAtIHgwLFxuICAgICAgICAgIGR5MiA9IHkyIC0geTAsXG4gICAgICAgICAgZHogPSBkeSAqIGR4MiAtIGR4ICogZHkyO1xuICAgICAgaWYgKGR6ICogZHogLyBkMiA+IGRlbHRhMiAvLyBwZXJwZW5kaWN1bGFyIHByb2plY3RlZCBkaXN0YW5jZVxuICAgICAgICAgIHx8IGFicygoZHggKiBkeDIgKyBkeSAqIGR5MikgLyBkMiAtIDAuNSkgPiAwLjMgLy8gbWlkcG9pbnQgY2xvc2UgdG8gYW4gZW5kXG4gICAgICAgICAgfHwgYTAgKiBhMSArIGIwICogYjEgKyBjMCAqIGMxIDwgY29zTWluRGlzdGFuY2UpIHsgLy8gYW5ndWxhciBkaXN0YW5jZVxuICAgICAgICByZXNhbXBsZUxpbmVUbyh4MCwgeTAsIGxhbWJkYTAsIGEwLCBiMCwgYzAsIHgyLCB5MiwgbGFtYmRhMiwgYSAvPSBtLCBiIC89IG0sIGMsIGRlcHRoLCBzdHJlYW0pO1xuICAgICAgICBzdHJlYW0ucG9pbnQoeDIsIHkyKTtcbiAgICAgICAgcmVzYW1wbGVMaW5lVG8oeDIsIHkyLCBsYW1iZGEyLCBhLCBiLCBjLCB4MSwgeTEsIGxhbWJkYTEsIGExLCBiMSwgYzEsIGRlcHRoLCBzdHJlYW0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgdmFyIGxhbWJkYTAwLCB4MDAsIHkwMCwgYTAwLCBiMDAsIGMwMCwgLy8gZmlyc3QgcG9pbnRcbiAgICAgICAgbGFtYmRhMCwgeDAsIHkwLCBhMCwgYjAsIGMwOyAvLyBwcmV2aW91cyBwb2ludFxuXG4gICAgdmFyIHJlc2FtcGxlU3RyZWFtID0ge1xuICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgbGluZVN0YXJ0OiBsaW5lU3RhcnQsXG4gICAgICBsaW5lRW5kOiBsaW5lRW5kLFxuICAgICAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHsgc3RyZWFtLnBvbHlnb25TdGFydCgpOyByZXNhbXBsZVN0cmVhbS5saW5lU3RhcnQgPSByaW5nU3RhcnQ7IH0sXG4gICAgICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHsgc3RyZWFtLnBvbHlnb25FbmQoKTsgcmVzYW1wbGVTdHJlYW0ubGluZVN0YXJ0ID0gbGluZVN0YXJ0OyB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHBvaW50KHgsIHkpIHtcbiAgICAgIHggPSBwcm9qZWN0KHgsIHkpO1xuICAgICAgc3RyZWFtLnBvaW50KHhbMF0sIHhbMV0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpbmVTdGFydCgpIHtcbiAgICAgIHgwID0gTmFOO1xuICAgICAgcmVzYW1wbGVTdHJlYW0ucG9pbnQgPSBsaW5lUG9pbnQ7XG4gICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGluZVBvaW50KGxhbWJkYSwgcGhpKSB7XG4gICAgICB2YXIgYyA9IGNhcnRlc2lhbihbbGFtYmRhLCBwaGldKSwgcCA9IHByb2plY3QobGFtYmRhLCBwaGkpO1xuICAgICAgcmVzYW1wbGVMaW5lVG8oeDAsIHkwLCBsYW1iZGEwLCBhMCwgYjAsIGMwLCB4MCA9IHBbMF0sIHkwID0gcFsxXSwgbGFtYmRhMCA9IGxhbWJkYSwgYTAgPSBjWzBdLCBiMCA9IGNbMV0sIGMwID0gY1syXSwgbWF4RGVwdGgsIHN0cmVhbSk7XG4gICAgICBzdHJlYW0ucG9pbnQoeDAsIHkwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaW5lRW5kKCkge1xuICAgICAgcmVzYW1wbGVTdHJlYW0ucG9pbnQgPSBwb2ludDtcbiAgICAgIHN0cmVhbS5saW5lRW5kKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmluZ1N0YXJ0KCkge1xuICAgICAgbGluZVN0YXJ0KCk7XG4gICAgICByZXNhbXBsZVN0cmVhbS5wb2ludCA9IHJpbmdQb2ludDtcbiAgICAgIHJlc2FtcGxlU3RyZWFtLmxpbmVFbmQgPSByaW5nRW5kO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJpbmdQb2ludChsYW1iZGEsIHBoaSkge1xuICAgICAgbGluZVBvaW50KGxhbWJkYTAwID0gbGFtYmRhLCBwaGkpLCB4MDAgPSB4MCwgeTAwID0geTAsIGEwMCA9IGEwLCBiMDAgPSBiMCwgYzAwID0gYzA7XG4gICAgICByZXNhbXBsZVN0cmVhbS5wb2ludCA9IGxpbmVQb2ludDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByaW5nRW5kKCkge1xuICAgICAgcmVzYW1wbGVMaW5lVG8oeDAsIHkwLCBsYW1iZGEwLCBhMCwgYjAsIGMwLCB4MDAsIHkwMCwgbGFtYmRhMDAsIGEwMCwgYjAwLCBjMDAsIG1heERlcHRoLCBzdHJlYW0pO1xuICAgICAgcmVzYW1wbGVTdHJlYW0ubGluZUVuZCA9IGxpbmVFbmQ7XG4gICAgICBsaW5lRW5kKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc2FtcGxlU3RyZWFtO1xuICB9O1xufVxuIiwiaW1wb3J0IGNsaXBBbnRpbWVyaWRpYW4gZnJvbSBcIi4uL2NsaXAvYW50aW1lcmlkaWFuLmpzXCI7XG5pbXBvcnQgY2xpcENpcmNsZSBmcm9tIFwiLi4vY2xpcC9jaXJjbGUuanNcIjtcbmltcG9ydCBjbGlwUmVjdGFuZ2xlIGZyb20gXCIuLi9jbGlwL3JlY3RhbmdsZS5qc1wiO1xuaW1wb3J0IGNvbXBvc2UgZnJvbSBcIi4uL2NvbXBvc2UuanNcIjtcbmltcG9ydCBpZGVudGl0eSBmcm9tIFwiLi4vaWRlbnRpdHkuanNcIjtcbmltcG9ydCB7Y29zLCBkZWdyZWVzLCByYWRpYW5zLCBzaW4sIHNxcnR9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQge3JvdGF0ZVJhZGlhbnN9IGZyb20gXCIuLi9yb3RhdGlvbi5qc1wiO1xuaW1wb3J0IHt0cmFuc2Zvcm1lcn0gZnJvbSBcIi4uL3RyYW5zZm9ybS5qc1wiO1xuaW1wb3J0IHtmaXRFeHRlbnQsIGZpdFNpemUsIGZpdFdpZHRoLCBmaXRIZWlnaHR9IGZyb20gXCIuL2ZpdC5qc1wiO1xuaW1wb3J0IHJlc2FtcGxlIGZyb20gXCIuL3Jlc2FtcGxlLmpzXCI7XG5cbnZhciB0cmFuc2Zvcm1SYWRpYW5zID0gdHJhbnNmb3JtZXIoe1xuICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgIHRoaXMuc3RyZWFtLnBvaW50KHggKiByYWRpYW5zLCB5ICogcmFkaWFucyk7XG4gIH1cbn0pO1xuXG5mdW5jdGlvbiB0cmFuc2Zvcm1Sb3RhdGUocm90YXRlKSB7XG4gIHJldHVybiB0cmFuc2Zvcm1lcih7XG4gICAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHZhciByID0gcm90YXRlKHgsIHkpO1xuICAgICAgcmV0dXJuIHRoaXMuc3RyZWFtLnBvaW50KHJbMF0sIHJbMV0pO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNjYWxlVHJhbnNsYXRlKGssIGR4LCBkeSwgc3gsIHN5KSB7XG4gIGZ1bmN0aW9uIHRyYW5zZm9ybSh4LCB5KSB7XG4gICAgeCAqPSBzeDsgeSAqPSBzeTtcbiAgICByZXR1cm4gW2R4ICsgayAqIHgsIGR5IC0gayAqIHldO1xuICB9XG4gIHRyYW5zZm9ybS5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgcmV0dXJuIFsoeCAtIGR4KSAvIGsgKiBzeCwgKGR5IC0geSkgLyBrICogc3ldO1xuICB9O1xuICByZXR1cm4gdHJhbnNmb3JtO1xufVxuXG5mdW5jdGlvbiBzY2FsZVRyYW5zbGF0ZVJvdGF0ZShrLCBkeCwgZHksIHN4LCBzeSwgYWxwaGEpIHtcbiAgaWYgKCFhbHBoYSkgcmV0dXJuIHNjYWxlVHJhbnNsYXRlKGssIGR4LCBkeSwgc3gsIHN5KTtcbiAgdmFyIGNvc0FscGhhID0gY29zKGFscGhhKSxcbiAgICAgIHNpbkFscGhhID0gc2luKGFscGhhKSxcbiAgICAgIGEgPSBjb3NBbHBoYSAqIGssXG4gICAgICBiID0gc2luQWxwaGEgKiBrLFxuICAgICAgYWkgPSBjb3NBbHBoYSAvIGssXG4gICAgICBiaSA9IHNpbkFscGhhIC8gayxcbiAgICAgIGNpID0gKHNpbkFscGhhICogZHkgLSBjb3NBbHBoYSAqIGR4KSAvIGssXG4gICAgICBmaSA9IChzaW5BbHBoYSAqIGR4ICsgY29zQWxwaGEgKiBkeSkgLyBrO1xuICBmdW5jdGlvbiB0cmFuc2Zvcm0oeCwgeSkge1xuICAgIHggKj0gc3g7IHkgKj0gc3k7XG4gICAgcmV0dXJuIFthICogeCAtIGIgKiB5ICsgZHgsIGR5IC0gYiAqIHggLSBhICogeV07XG4gIH1cbiAgdHJhbnNmb3JtLmludmVydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICByZXR1cm4gW3N4ICogKGFpICogeCAtIGJpICogeSArIGNpKSwgc3kgKiAoZmkgLSBiaSAqIHggLSBhaSAqIHkpXTtcbiAgfTtcbiAgcmV0dXJuIHRyYW5zZm9ybTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcHJvamVjdGlvbihwcm9qZWN0KSB7XG4gIHJldHVybiBwcm9qZWN0aW9uTXV0YXRvcihmdW5jdGlvbigpIHsgcmV0dXJuIHByb2plY3Q7IH0pKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9qZWN0aW9uTXV0YXRvcihwcm9qZWN0QXQpIHtcbiAgdmFyIHByb2plY3QsXG4gICAgICBrID0gMTUwLCAvLyBzY2FsZVxuICAgICAgeCA9IDQ4MCwgeSA9IDI1MCwgLy8gdHJhbnNsYXRlXG4gICAgICBsYW1iZGEgPSAwLCBwaGkgPSAwLCAvLyBjZW50ZXJcbiAgICAgIGRlbHRhTGFtYmRhID0gMCwgZGVsdGFQaGkgPSAwLCBkZWx0YUdhbW1hID0gMCwgcm90YXRlLCAvLyBwcmUtcm90YXRlXG4gICAgICBhbHBoYSA9IDAsIC8vIHBvc3Qtcm90YXRlIGFuZ2xlXG4gICAgICBzeCA9IDEsIC8vIHJlZmxlY3RYXG4gICAgICBzeSA9IDEsIC8vIHJlZmxlY3RYXG4gICAgICB0aGV0YSA9IG51bGwsIHByZWNsaXAgPSBjbGlwQW50aW1lcmlkaWFuLCAvLyBwcmUtY2xpcCBhbmdsZVxuICAgICAgeDAgPSBudWxsLCB5MCwgeDEsIHkxLCBwb3N0Y2xpcCA9IGlkZW50aXR5LCAvLyBwb3N0LWNsaXAgZXh0ZW50XG4gICAgICBkZWx0YTIgPSAwLjUsIC8vIHByZWNpc2lvblxuICAgICAgcHJvamVjdFJlc2FtcGxlLFxuICAgICAgcHJvamVjdFRyYW5zZm9ybSxcbiAgICAgIHByb2plY3RSb3RhdGVUcmFuc2Zvcm0sXG4gICAgICBjYWNoZSxcbiAgICAgIGNhY2hlU3RyZWFtO1xuXG4gIGZ1bmN0aW9uIHByb2plY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gcHJvamVjdFJvdGF0ZVRyYW5zZm9ybShwb2ludFswXSAqIHJhZGlhbnMsIHBvaW50WzFdICogcmFkaWFucyk7XG4gIH1cblxuICBmdW5jdGlvbiBpbnZlcnQocG9pbnQpIHtcbiAgICBwb2ludCA9IHByb2plY3RSb3RhdGVUcmFuc2Zvcm0uaW52ZXJ0KHBvaW50WzBdLCBwb2ludFsxXSk7XG4gICAgcmV0dXJuIHBvaW50ICYmIFtwb2ludFswXSAqIGRlZ3JlZXMsIHBvaW50WzFdICogZGVncmVlc107XG4gIH1cblxuICBwcm9qZWN0aW9uLnN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgIHJldHVybiBjYWNoZSAmJiBjYWNoZVN0cmVhbSA9PT0gc3RyZWFtID8gY2FjaGUgOiBjYWNoZSA9IHRyYW5zZm9ybVJhZGlhbnModHJhbnNmb3JtUm90YXRlKHJvdGF0ZSkocHJlY2xpcChwcm9qZWN0UmVzYW1wbGUocG9zdGNsaXAoY2FjaGVTdHJlYW0gPSBzdHJlYW0pKSkpKTtcbiAgfTtcblxuICBwcm9qZWN0aW9uLnByZWNsaXAgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocHJlY2xpcCA9IF8sIHRoZXRhID0gdW5kZWZpbmVkLCByZXNldCgpKSA6IHByZWNsaXA7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5wb3N0Y2xpcCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwb3N0Y2xpcCA9IF8sIHgwID0geTAgPSB4MSA9IHkxID0gbnVsbCwgcmVzZXQoKSkgOiBwb3N0Y2xpcDtcbiAgfTtcblxuICBwcm9qZWN0aW9uLmNsaXBBbmdsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwcmVjbGlwID0gK18gPyBjbGlwQ2lyY2xlKHRoZXRhID0gXyAqIHJhZGlhbnMpIDogKHRoZXRhID0gbnVsbCwgY2xpcEFudGltZXJpZGlhbiksIHJlc2V0KCkpIDogdGhldGEgKiBkZWdyZWVzO1xuICB9O1xuXG4gIHByb2plY3Rpb24uY2xpcEV4dGVudCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwb3N0Y2xpcCA9IF8gPT0gbnVsbCA/ICh4MCA9IHkwID0geDEgPSB5MSA9IG51bGwsIGlkZW50aXR5KSA6IGNsaXBSZWN0YW5nbGUoeDAgPSArX1swXVswXSwgeTAgPSArX1swXVsxXSwgeDEgPSArX1sxXVswXSwgeTEgPSArX1sxXVsxXSksIHJlc2V0KCkpIDogeDAgPT0gbnVsbCA/IG51bGwgOiBbW3gwLCB5MF0sIFt4MSwgeTFdXTtcbiAgfTtcblxuICBwcm9qZWN0aW9uLnNjYWxlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGsgPSArXywgcmVjZW50ZXIoKSkgOiBrO1xuICB9O1xuXG4gIHByb2plY3Rpb24udHJhbnNsYXRlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHggPSArX1swXSwgeSA9ICtfWzFdLCByZWNlbnRlcigpKSA6IFt4LCB5XTtcbiAgfTtcblxuICBwcm9qZWN0aW9uLmNlbnRlciA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChsYW1iZGEgPSBfWzBdICUgMzYwICogcmFkaWFucywgcGhpID0gX1sxXSAlIDM2MCAqIHJhZGlhbnMsIHJlY2VudGVyKCkpIDogW2xhbWJkYSAqIGRlZ3JlZXMsIHBoaSAqIGRlZ3JlZXNdO1xuICB9O1xuXG4gIHByb2plY3Rpb24ucm90YXRlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGRlbHRhTGFtYmRhID0gX1swXSAlIDM2MCAqIHJhZGlhbnMsIGRlbHRhUGhpID0gX1sxXSAlIDM2MCAqIHJhZGlhbnMsIGRlbHRhR2FtbWEgPSBfLmxlbmd0aCA+IDIgPyBfWzJdICUgMzYwICogcmFkaWFucyA6IDAsIHJlY2VudGVyKCkpIDogW2RlbHRhTGFtYmRhICogZGVncmVlcywgZGVsdGFQaGkgKiBkZWdyZWVzLCBkZWx0YUdhbW1hICogZGVncmVlc107XG4gIH07XG5cbiAgcHJvamVjdGlvbi5hbmdsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChhbHBoYSA9IF8gJSAzNjAgKiByYWRpYW5zLCByZWNlbnRlcigpKSA6IGFscGhhICogZGVncmVlcztcbiAgfTtcblxuICBwcm9qZWN0aW9uLnJlZmxlY3RYID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHN4ID0gXyA/IC0xIDogMSwgcmVjZW50ZXIoKSkgOiBzeCA8IDA7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5yZWZsZWN0WSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChzeSA9IF8gPyAtMSA6IDEsIHJlY2VudGVyKCkpIDogc3kgPCAwO1xuICB9O1xuXG4gIHByb2plY3Rpb24ucHJlY2lzaW9uID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHByb2plY3RSZXNhbXBsZSA9IHJlc2FtcGxlKHByb2plY3RUcmFuc2Zvcm0sIGRlbHRhMiA9IF8gKiBfKSwgcmVzZXQoKSkgOiBzcXJ0KGRlbHRhMik7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5maXRFeHRlbnQgPSBmdW5jdGlvbihleHRlbnQsIG9iamVjdCkge1xuICAgIHJldHVybiBmaXRFeHRlbnQocHJvamVjdGlvbiwgZXh0ZW50LCBvYmplY3QpO1xuICB9O1xuXG4gIHByb2plY3Rpb24uZml0U2l6ZSA9IGZ1bmN0aW9uKHNpemUsIG9iamVjdCkge1xuICAgIHJldHVybiBmaXRTaXplKHByb2plY3Rpb24sIHNpemUsIG9iamVjdCk7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5maXRXaWR0aCA9IGZ1bmN0aW9uKHdpZHRoLCBvYmplY3QpIHtcbiAgICByZXR1cm4gZml0V2lkdGgocHJvamVjdGlvbiwgd2lkdGgsIG9iamVjdCk7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5maXRIZWlnaHQgPSBmdW5jdGlvbihoZWlnaHQsIG9iamVjdCkge1xuICAgIHJldHVybiBmaXRIZWlnaHQocHJvamVjdGlvbiwgaGVpZ2h0LCBvYmplY3QpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHJlY2VudGVyKCkge1xuICAgIHZhciBjZW50ZXIgPSBzY2FsZVRyYW5zbGF0ZVJvdGF0ZShrLCAwLCAwLCBzeCwgc3ksIGFscGhhKS5hcHBseShudWxsLCBwcm9qZWN0KGxhbWJkYSwgcGhpKSksXG4gICAgICAgIHRyYW5zZm9ybSA9IHNjYWxlVHJhbnNsYXRlUm90YXRlKGssIHggLSBjZW50ZXJbMF0sIHkgLSBjZW50ZXJbMV0sIHN4LCBzeSwgYWxwaGEpO1xuICAgIHJvdGF0ZSA9IHJvdGF0ZVJhZGlhbnMoZGVsdGFMYW1iZGEsIGRlbHRhUGhpLCBkZWx0YUdhbW1hKTtcbiAgICBwcm9qZWN0VHJhbnNmb3JtID0gY29tcG9zZShwcm9qZWN0LCB0cmFuc2Zvcm0pO1xuICAgIHByb2plY3RSb3RhdGVUcmFuc2Zvcm0gPSBjb21wb3NlKHJvdGF0ZSwgcHJvamVjdFRyYW5zZm9ybSk7XG4gICAgcHJvamVjdFJlc2FtcGxlID0gcmVzYW1wbGUocHJvamVjdFRyYW5zZm9ybSwgZGVsdGEyKTtcbiAgICByZXR1cm4gcmVzZXQoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIGNhY2hlID0gY2FjaGVTdHJlYW0gPSBudWxsO1xuICAgIHJldHVybiBwcm9qZWN0aW9uO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHByb2plY3QgPSBwcm9qZWN0QXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBwcm9qZWN0aW9uLmludmVydCA9IHByb2plY3QuaW52ZXJ0ICYmIGludmVydDtcbiAgICByZXR1cm4gcmVjZW50ZXIoKTtcbiAgfTtcbn1cbiIsImltcG9ydCB7ZGVncmVlcywgcGksIHJhZGlhbnN9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQge3Byb2plY3Rpb25NdXRhdG9yfSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gY29uaWNQcm9qZWN0aW9uKHByb2plY3RBdCkge1xuICB2YXIgcGhpMCA9IDAsXG4gICAgICBwaGkxID0gcGkgLyAzLFxuICAgICAgbSA9IHByb2plY3Rpb25NdXRhdG9yKHByb2plY3RBdCksXG4gICAgICBwID0gbShwaGkwLCBwaGkxKTtcblxuICBwLnBhcmFsbGVscyA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IG0ocGhpMCA9IF9bMF0gKiByYWRpYW5zLCBwaGkxID0gX1sxXSAqIHJhZGlhbnMpIDogW3BoaTAgKiBkZWdyZWVzLCBwaGkxICogZGVncmVlc107XG4gIH07XG5cbiAgcmV0dXJuIHA7XG59XG4iLCJpbXBvcnQge2FzaW4sIGNvcywgc2lufSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gY3lsaW5kcmljYWxFcXVhbEFyZWFSYXcocGhpMCkge1xuICB2YXIgY29zUGhpMCA9IGNvcyhwaGkwKTtcblxuICBmdW5jdGlvbiBmb3J3YXJkKGxhbWJkYSwgcGhpKSB7XG4gICAgcmV0dXJuIFtsYW1iZGEgKiBjb3NQaGkwLCBzaW4ocGhpKSAvIGNvc1BoaTBdO1xuICB9XG5cbiAgZm9yd2FyZC5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgcmV0dXJuIFt4IC8gY29zUGhpMCwgYXNpbih5ICogY29zUGhpMCldO1xuICB9O1xuXG4gIHJldHVybiBmb3J3YXJkO1xufVxuIiwiaW1wb3J0IHthYnMsIGFzaW4sIGF0YW4yLCBjb3MsIGVwc2lsb24sIHBpLCBzaWduLCBzaW4sIHNxcnR9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQge2NvbmljUHJvamVjdGlvbn0gZnJvbSBcIi4vY29uaWMuanNcIjtcbmltcG9ydCB7Y3lsaW5kcmljYWxFcXVhbEFyZWFSYXd9IGZyb20gXCIuL2N5bGluZHJpY2FsRXF1YWxBcmVhLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25pY0VxdWFsQXJlYVJhdyh5MCwgeTEpIHtcbiAgdmFyIHN5MCA9IHNpbih5MCksIG4gPSAoc3kwICsgc2luKHkxKSkgLyAyO1xuXG4gIC8vIEFyZSB0aGUgcGFyYWxsZWxzIHN5bW1ldHJpY2FsIGFyb3VuZCB0aGUgRXF1YXRvcj9cbiAgaWYgKGFicyhuKSA8IGVwc2lsb24pIHJldHVybiBjeWxpbmRyaWNhbEVxdWFsQXJlYVJhdyh5MCk7XG5cbiAgdmFyIGMgPSAxICsgc3kwICogKDIgKiBuIC0gc3kwKSwgcjAgPSBzcXJ0KGMpIC8gbjtcblxuICBmdW5jdGlvbiBwcm9qZWN0KHgsIHkpIHtcbiAgICB2YXIgciA9IHNxcnQoYyAtIDIgKiBuICogc2luKHkpKSAvIG47XG4gICAgcmV0dXJuIFtyICogc2luKHggKj0gbiksIHIwIC0gciAqIGNvcyh4KV07XG4gIH1cblxuICBwcm9qZWN0LmludmVydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB2YXIgcjB5ID0gcjAgLSB5LFxuICAgICAgICBsID0gYXRhbjIoeCwgYWJzKHIweSkpICogc2lnbihyMHkpO1xuICAgIGlmIChyMHkgKiBuIDwgMClcbiAgICAgIGwgLT0gcGkgKiBzaWduKHgpICogc2lnbihyMHkpO1xuICAgIHJldHVybiBbbCAvIG4sIGFzaW4oKGMgLSAoeCAqIHggKyByMHkgKiByMHkpICogbiAqIG4pIC8gKDIgKiBuKSldO1xuICB9O1xuXG4gIHJldHVybiBwcm9qZWN0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGNvbmljUHJvamVjdGlvbihjb25pY0VxdWFsQXJlYVJhdylcbiAgICAgIC5zY2FsZSgxNTUuNDI0KVxuICAgICAgLmNlbnRlcihbMCwgMzMuNjQ0Ml0pO1xufVxuIiwiaW1wb3J0IGNvbmljRXF1YWxBcmVhIGZyb20gXCIuL2NvbmljRXF1YWxBcmVhLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gY29uaWNFcXVhbEFyZWEoKVxuICAgICAgLnBhcmFsbGVscyhbMjkuNSwgNDUuNV0pXG4gICAgICAuc2NhbGUoMTA3MClcbiAgICAgIC50cmFuc2xhdGUoWzQ4MCwgMjUwXSlcbiAgICAgIC5yb3RhdGUoWzk2LCAwXSlcbiAgICAgIC5jZW50ZXIoWy0wLjYsIDM4LjddKTtcbn1cbiIsImltcG9ydCB7ZXBzaWxvbn0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCBhbGJlcnMgZnJvbSBcIi4vYWxiZXJzLmpzXCI7XG5pbXBvcnQgY29uaWNFcXVhbEFyZWEgZnJvbSBcIi4vY29uaWNFcXVhbEFyZWEuanNcIjtcbmltcG9ydCB7Zml0RXh0ZW50LCBmaXRTaXplLCBmaXRXaWR0aCwgZml0SGVpZ2h0fSBmcm9tIFwiLi9maXQuanNcIjtcblxuLy8gVGhlIHByb2plY3Rpb25zIG11c3QgaGF2ZSBtdXR1YWxseSBleGNsdXNpdmUgY2xpcCByZWdpb25zIG9uIHRoZSBzcGhlcmUsXG4vLyBhcyB0aGlzIHdpbGwgYXZvaWQgZW1pdHRpbmcgaW50ZXJsZWF2aW5nIGxpbmVzIGFuZCBwb2x5Z29ucy5cbmZ1bmN0aW9uIG11bHRpcGxleChzdHJlYW1zKSB7XG4gIHZhciBuID0gc3RyZWFtcy5sZW5ndGg7XG4gIHJldHVybiB7XG4gICAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHsgdmFyIGkgPSAtMTsgd2hpbGUgKCsraSA8IG4pIHN0cmVhbXNbaV0ucG9pbnQoeCwgeSk7IH0sXG4gICAgc3BoZXJlOiBmdW5jdGlvbigpIHsgdmFyIGkgPSAtMTsgd2hpbGUgKCsraSA8IG4pIHN0cmVhbXNbaV0uc3BoZXJlKCk7IH0sXG4gICAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHsgdmFyIGkgPSAtMTsgd2hpbGUgKCsraSA8IG4pIHN0cmVhbXNbaV0ubGluZVN0YXJ0KCk7IH0sXG4gICAgbGluZUVuZDogZnVuY3Rpb24oKSB7IHZhciBpID0gLTE7IHdoaWxlICgrK2kgPCBuKSBzdHJlYW1zW2ldLmxpbmVFbmQoKTsgfSxcbiAgICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkgeyB2YXIgaSA9IC0xOyB3aGlsZSAoKytpIDwgbikgc3RyZWFtc1tpXS5wb2x5Z29uU3RhcnQoKTsgfSxcbiAgICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHsgdmFyIGkgPSAtMTsgd2hpbGUgKCsraSA8IG4pIHN0cmVhbXNbaV0ucG9seWdvbkVuZCgpOyB9XG4gIH07XG59XG5cbi8vIEEgY29tcG9zaXRlIHByb2plY3Rpb24gZm9yIHRoZSBVbml0ZWQgU3RhdGVzLCBjb25maWd1cmVkIGJ5IGRlZmF1bHQgZm9yXG4vLyA5NjDDlzUwMC4gVGhlIHByb2plY3Rpb24gYWxzbyB3b3JrcyBxdWl0ZSB3ZWxsIGF0IDk2MMOXNjAwIGlmIHlvdSBjaGFuZ2UgdGhlXG4vLyBzY2FsZSB0byAxMjg1IGFuZCBhZGp1c3QgdGhlIHRyYW5zbGF0ZSBhY2NvcmRpbmdseS4gVGhlIHNldCBvZiBzdGFuZGFyZFxuLy8gcGFyYWxsZWxzIGZvciBlYWNoIHJlZ2lvbiBjb21lcyBmcm9tIFVTR1MsIHdoaWNoIGlzIHB1Ymxpc2hlZCBoZXJlOlxuLy8gaHR0cDovL2Vnc2MudXNncy5nb3YvaXNiL3B1YnMvTWFwUHJvamVjdGlvbnMvcHJvamVjdGlvbnMuaHRtbCNhbGJlcnNcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgY2FjaGUsXG4gICAgICBjYWNoZVN0cmVhbSxcbiAgICAgIGxvd2VyNDggPSBhbGJlcnMoKSwgbG93ZXI0OFBvaW50LFxuICAgICAgYWxhc2thID0gY29uaWNFcXVhbEFyZWEoKS5yb3RhdGUoWzE1NCwgMF0pLmNlbnRlcihbLTIsIDU4LjVdKS5wYXJhbGxlbHMoWzU1LCA2NV0pLCBhbGFza2FQb2ludCwgLy8gRVBTRzozMzM4XG4gICAgICBoYXdhaWkgPSBjb25pY0VxdWFsQXJlYSgpLnJvdGF0ZShbMTU3LCAwXSkuY2VudGVyKFstMywgMTkuOV0pLnBhcmFsbGVscyhbOCwgMThdKSwgaGF3YWlpUG9pbnQsIC8vIEVTUkk6MTAyMDA3XG4gICAgICBwb2ludCwgcG9pbnRTdHJlYW0gPSB7cG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHsgcG9pbnQgPSBbeCwgeV07IH19O1xuXG4gIGZ1bmN0aW9uIGFsYmVyc1VzYShjb29yZGluYXRlcykge1xuICAgIHZhciB4ID0gY29vcmRpbmF0ZXNbMF0sIHkgPSBjb29yZGluYXRlc1sxXTtcbiAgICByZXR1cm4gcG9pbnQgPSBudWxsLFxuICAgICAgICAobG93ZXI0OFBvaW50LnBvaW50KHgsIHkpLCBwb2ludClcbiAgICAgICAgfHwgKGFsYXNrYVBvaW50LnBvaW50KHgsIHkpLCBwb2ludClcbiAgICAgICAgfHwgKGhhd2FpaVBvaW50LnBvaW50KHgsIHkpLCBwb2ludCk7XG4gIH1cblxuICBhbGJlcnNVc2EuaW52ZXJ0ID0gZnVuY3Rpb24oY29vcmRpbmF0ZXMpIHtcbiAgICB2YXIgayA9IGxvd2VyNDguc2NhbGUoKSxcbiAgICAgICAgdCA9IGxvd2VyNDgudHJhbnNsYXRlKCksXG4gICAgICAgIHggPSAoY29vcmRpbmF0ZXNbMF0gLSB0WzBdKSAvIGssXG4gICAgICAgIHkgPSAoY29vcmRpbmF0ZXNbMV0gLSB0WzFdKSAvIGs7XG4gICAgcmV0dXJuICh5ID49IDAuMTIwICYmIHkgPCAwLjIzNCAmJiB4ID49IC0wLjQyNSAmJiB4IDwgLTAuMjE0ID8gYWxhc2thXG4gICAgICAgIDogeSA+PSAwLjE2NiAmJiB5IDwgMC4yMzQgJiYgeCA+PSAtMC4yMTQgJiYgeCA8IC0wLjExNSA/IGhhd2FpaVxuICAgICAgICA6IGxvd2VyNDgpLmludmVydChjb29yZGluYXRlcyk7XG4gIH07XG5cbiAgYWxiZXJzVXNhLnN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgIHJldHVybiBjYWNoZSAmJiBjYWNoZVN0cmVhbSA9PT0gc3RyZWFtID8gY2FjaGUgOiBjYWNoZSA9IG11bHRpcGxleChbbG93ZXI0OC5zdHJlYW0oY2FjaGVTdHJlYW0gPSBzdHJlYW0pLCBhbGFza2Euc3RyZWFtKHN0cmVhbSksIGhhd2FpaS5zdHJlYW0oc3RyZWFtKV0pO1xuICB9O1xuXG4gIGFsYmVyc1VzYS5wcmVjaXNpb24gPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbG93ZXI0OC5wcmVjaXNpb24oKTtcbiAgICBsb3dlcjQ4LnByZWNpc2lvbihfKSwgYWxhc2thLnByZWNpc2lvbihfKSwgaGF3YWlpLnByZWNpc2lvbihfKTtcbiAgICByZXR1cm4gcmVzZXQoKTtcbiAgfTtcblxuICBhbGJlcnNVc2Euc2NhbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbG93ZXI0OC5zY2FsZSgpO1xuICAgIGxvd2VyNDguc2NhbGUoXyksIGFsYXNrYS5zY2FsZShfICogMC4zNSksIGhhd2FpaS5zY2FsZShfKTtcbiAgICByZXR1cm4gYWxiZXJzVXNhLnRyYW5zbGF0ZShsb3dlcjQ4LnRyYW5zbGF0ZSgpKTtcbiAgfTtcblxuICBhbGJlcnNVc2EudHJhbnNsYXRlID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGxvd2VyNDgudHJhbnNsYXRlKCk7XG4gICAgdmFyIGsgPSBsb3dlcjQ4LnNjYWxlKCksIHggPSArX1swXSwgeSA9ICtfWzFdO1xuXG4gICAgbG93ZXI0OFBvaW50ID0gbG93ZXI0OFxuICAgICAgICAudHJhbnNsYXRlKF8pXG4gICAgICAgIC5jbGlwRXh0ZW50KFtbeCAtIDAuNDU1ICogaywgeSAtIDAuMjM4ICoga10sIFt4ICsgMC40NTUgKiBrLCB5ICsgMC4yMzggKiBrXV0pXG4gICAgICAgIC5zdHJlYW0ocG9pbnRTdHJlYW0pO1xuXG4gICAgYWxhc2thUG9pbnQgPSBhbGFza2FcbiAgICAgICAgLnRyYW5zbGF0ZShbeCAtIDAuMzA3ICogaywgeSArIDAuMjAxICoga10pXG4gICAgICAgIC5jbGlwRXh0ZW50KFtbeCAtIDAuNDI1ICogayArIGVwc2lsb24sIHkgKyAwLjEyMCAqIGsgKyBlcHNpbG9uXSwgW3ggLSAwLjIxNCAqIGsgLSBlcHNpbG9uLCB5ICsgMC4yMzQgKiBrIC0gZXBzaWxvbl1dKVxuICAgICAgICAuc3RyZWFtKHBvaW50U3RyZWFtKTtcblxuICAgIGhhd2FpaVBvaW50ID0gaGF3YWlpXG4gICAgICAgIC50cmFuc2xhdGUoW3ggLSAwLjIwNSAqIGssIHkgKyAwLjIxMiAqIGtdKVxuICAgICAgICAuY2xpcEV4dGVudChbW3ggLSAwLjIxNCAqIGsgKyBlcHNpbG9uLCB5ICsgMC4xNjYgKiBrICsgZXBzaWxvbl0sIFt4IC0gMC4xMTUgKiBrIC0gZXBzaWxvbiwgeSArIDAuMjM0ICogayAtIGVwc2lsb25dXSlcbiAgICAgICAgLnN0cmVhbShwb2ludFN0cmVhbSk7XG5cbiAgICByZXR1cm4gcmVzZXQoKTtcbiAgfTtcblxuICBhbGJlcnNVc2EuZml0RXh0ZW50ID0gZnVuY3Rpb24oZXh0ZW50LCBvYmplY3QpIHtcbiAgICByZXR1cm4gZml0RXh0ZW50KGFsYmVyc1VzYSwgZXh0ZW50LCBvYmplY3QpO1xuICB9O1xuXG4gIGFsYmVyc1VzYS5maXRTaXplID0gZnVuY3Rpb24oc2l6ZSwgb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZpdFNpemUoYWxiZXJzVXNhLCBzaXplLCBvYmplY3QpO1xuICB9O1xuXG4gIGFsYmVyc1VzYS5maXRXaWR0aCA9IGZ1bmN0aW9uKHdpZHRoLCBvYmplY3QpIHtcbiAgICByZXR1cm4gZml0V2lkdGgoYWxiZXJzVXNhLCB3aWR0aCwgb2JqZWN0KTtcbiAgfTtcblxuICBhbGJlcnNVc2EuZml0SGVpZ2h0ID0gZnVuY3Rpb24oaGVpZ2h0LCBvYmplY3QpIHtcbiAgICByZXR1cm4gZml0SGVpZ2h0KGFsYmVyc1VzYSwgaGVpZ2h0LCBvYmplY3QpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIGNhY2hlID0gY2FjaGVTdHJlYW0gPSBudWxsO1xuICAgIHJldHVybiBhbGJlcnNVc2E7XG4gIH1cblxuICByZXR1cm4gYWxiZXJzVXNhLnNjYWxlKDEwNzApO1xufVxuIiwiaW1wb3J0IHthc2luLCBhdGFuMiwgY29zLCBzaW4sIHNxcnR9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBhemltdXRoYWxSYXcoc2NhbGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB2YXIgY3ggPSBjb3MoeCksXG4gICAgICAgIGN5ID0gY29zKHkpLFxuICAgICAgICBrID0gc2NhbGUoY3ggKiBjeSk7XG4gICAgICAgIGlmIChrID09PSBJbmZpbml0eSkgcmV0dXJuIFsyLCAwXTtcbiAgICByZXR1cm4gW1xuICAgICAgayAqIGN5ICogc2luKHgpLFxuICAgICAgayAqIHNpbih5KVxuICAgIF07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF6aW11dGhhbEludmVydChhbmdsZSkge1xuICByZXR1cm4gZnVuY3Rpb24oeCwgeSkge1xuICAgIHZhciB6ID0gc3FydCh4ICogeCArIHkgKiB5KSxcbiAgICAgICAgYyA9IGFuZ2xlKHopLFxuICAgICAgICBzYyA9IHNpbihjKSxcbiAgICAgICAgY2MgPSBjb3MoYyk7XG4gICAgcmV0dXJuIFtcbiAgICAgIGF0YW4yKHggKiBzYywgeiAqIGNjKSxcbiAgICAgIGFzaW4oeiAmJiB5ICogc2MgLyB6KVxuICAgIF07XG4gIH1cbn1cbiIsImltcG9ydCB7YXNpbiwgc3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCB7YXppbXV0aGFsUmF3LCBhemltdXRoYWxJbnZlcnR9IGZyb20gXCIuL2F6aW11dGhhbC5qc1wiO1xuaW1wb3J0IHByb2plY3Rpb24gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IHZhciBhemltdXRoYWxFcXVhbEFyZWFSYXcgPSBhemltdXRoYWxSYXcoZnVuY3Rpb24oY3hjeSkge1xuICByZXR1cm4gc3FydCgyIC8gKDEgKyBjeGN5KSk7XG59KTtcblxuYXppbXV0aGFsRXF1YWxBcmVhUmF3LmludmVydCA9IGF6aW11dGhhbEludmVydChmdW5jdGlvbih6KSB7XG4gIHJldHVybiAyICogYXNpbih6IC8gMik7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBwcm9qZWN0aW9uKGF6aW11dGhhbEVxdWFsQXJlYVJhdylcbiAgICAgIC5zY2FsZSgxMjQuNzUpXG4gICAgICAuY2xpcEFuZ2xlKDE4MCAtIDFlLTMpO1xufVxuIiwiaW1wb3J0IHthY29zLCBzaW59IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQge2F6aW11dGhhbFJhdywgYXppbXV0aGFsSW52ZXJ0fSBmcm9tIFwiLi9hemltdXRoYWwuanNcIjtcbmltcG9ydCBwcm9qZWN0aW9uIGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCB2YXIgYXppbXV0aGFsRXF1aWRpc3RhbnRSYXcgPSBhemltdXRoYWxSYXcoZnVuY3Rpb24oYykge1xuICByZXR1cm4gKGMgPSBhY29zKGMpKSAmJiBjIC8gc2luKGMpO1xufSk7XG5cbmF6aW11dGhhbEVxdWlkaXN0YW50UmF3LmludmVydCA9IGF6aW11dGhhbEludmVydChmdW5jdGlvbih6KSB7XG4gIHJldHVybiB6O1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gcHJvamVjdGlvbihhemltdXRoYWxFcXVpZGlzdGFudFJhdylcbiAgICAgIC5zY2FsZSg3OS40MTg4KVxuICAgICAgLmNsaXBBbmdsZSgxODAgLSAxZS0zKTtcbn1cbiIsImltcG9ydCB7YXRhbiwgZXhwLCBoYWxmUGksIGxvZywgcGksIHRhbiwgdGF1fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IHJvdGF0aW9uIGZyb20gXCIuLi9yb3RhdGlvbi5qc1wiO1xuaW1wb3J0IHByb2plY3Rpb24gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmNhdG9yUmF3KGxhbWJkYSwgcGhpKSB7XG4gIHJldHVybiBbbGFtYmRhLCBsb2codGFuKChoYWxmUGkgKyBwaGkpIC8gMikpXTtcbn1cblxubWVyY2F0b3JSYXcuaW52ZXJ0ID0gZnVuY3Rpb24oeCwgeSkge1xuICByZXR1cm4gW3gsIDIgKiBhdGFuKGV4cCh5KSkgLSBoYWxmUGldO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBtZXJjYXRvclByb2plY3Rpb24obWVyY2F0b3JSYXcpXG4gICAgICAuc2NhbGUoOTYxIC8gdGF1KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmNhdG9yUHJvamVjdGlvbihwcm9qZWN0KSB7XG4gIHZhciBtID0gcHJvamVjdGlvbihwcm9qZWN0KSxcbiAgICAgIGNlbnRlciA9IG0uY2VudGVyLFxuICAgICAgc2NhbGUgPSBtLnNjYWxlLFxuICAgICAgdHJhbnNsYXRlID0gbS50cmFuc2xhdGUsXG4gICAgICBjbGlwRXh0ZW50ID0gbS5jbGlwRXh0ZW50LFxuICAgICAgeDAgPSBudWxsLCB5MCwgeDEsIHkxOyAvLyBjbGlwIGV4dGVudFxuXG4gIG0uc2NhbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoc2NhbGUoXyksIHJlY2xpcCgpKSA6IHNjYWxlKCk7XG4gIH07XG5cbiAgbS50cmFuc2xhdGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodHJhbnNsYXRlKF8pLCByZWNsaXAoKSkgOiB0cmFuc2xhdGUoKTtcbiAgfTtcblxuICBtLmNlbnRlciA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChjZW50ZXIoXyksIHJlY2xpcCgpKSA6IGNlbnRlcigpO1xuICB9O1xuXG4gIG0uY2xpcEV4dGVudCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICgoXyA9PSBudWxsID8geDAgPSB5MCA9IHgxID0geTEgPSBudWxsIDogKHgwID0gK19bMF1bMF0sIHkwID0gK19bMF1bMV0sIHgxID0gK19bMV1bMF0sIHkxID0gK19bMV1bMV0pKSwgcmVjbGlwKCkpIDogeDAgPT0gbnVsbCA/IG51bGwgOiBbW3gwLCB5MF0sIFt4MSwgeTFdXTtcbiAgfTtcblxuICBmdW5jdGlvbiByZWNsaXAoKSB7XG4gICAgdmFyIGsgPSBwaSAqIHNjYWxlKCksXG4gICAgICAgIHQgPSBtKHJvdGF0aW9uKG0ucm90YXRlKCkpLmludmVydChbMCwgMF0pKTtcbiAgICByZXR1cm4gY2xpcEV4dGVudCh4MCA9PSBudWxsXG4gICAgICAgID8gW1t0WzBdIC0gaywgdFsxXSAtIGtdLCBbdFswXSArIGssIHRbMV0gKyBrXV0gOiBwcm9qZWN0ID09PSBtZXJjYXRvclJhd1xuICAgICAgICA/IFtbTWF0aC5tYXgodFswXSAtIGssIHgwKSwgeTBdLCBbTWF0aC5taW4odFswXSArIGssIHgxKSwgeTFdXVxuICAgICAgICA6IFtbeDAsIE1hdGgubWF4KHRbMV0gLSBrLCB5MCldLCBbeDEsIE1hdGgubWluKHRbMV0gKyBrLCB5MSldXSk7XG4gIH1cblxuICByZXR1cm4gcmVjbGlwKCk7XG59XG4iLCJpbXBvcnQge2FicywgYXRhbiwgYXRhbjIsIGNvcywgZXBzaWxvbiwgaGFsZlBpLCBsb2csIHBpLCBwb3csIHNpZ24sIHNpbiwgc3FydCwgdGFufSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IHtjb25pY1Byb2plY3Rpb259IGZyb20gXCIuL2NvbmljLmpzXCI7XG5pbXBvcnQge21lcmNhdG9yUmF3fSBmcm9tIFwiLi9tZXJjYXRvci5qc1wiO1xuXG5mdW5jdGlvbiB0YW55KHkpIHtcbiAgcmV0dXJuIHRhbigoaGFsZlBpICsgeSkgLyAyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmljQ29uZm9ybWFsUmF3KHkwLCB5MSkge1xuICB2YXIgY3kwID0gY29zKHkwKSxcbiAgICAgIG4gPSB5MCA9PT0geTEgPyBzaW4oeTApIDogbG9nKGN5MCAvIGNvcyh5MSkpIC8gbG9nKHRhbnkoeTEpIC8gdGFueSh5MCkpLFxuICAgICAgZiA9IGN5MCAqIHBvdyh0YW55KHkwKSwgbikgLyBuO1xuXG4gIGlmICghbikgcmV0dXJuIG1lcmNhdG9yUmF3O1xuXG4gIGZ1bmN0aW9uIHByb2plY3QoeCwgeSkge1xuICAgIGlmIChmID4gMCkgeyBpZiAoeSA8IC1oYWxmUGkgKyBlcHNpbG9uKSB5ID0gLWhhbGZQaSArIGVwc2lsb247IH1cbiAgICBlbHNlIHsgaWYgKHkgPiBoYWxmUGkgLSBlcHNpbG9uKSB5ID0gaGFsZlBpIC0gZXBzaWxvbjsgfVxuICAgIHZhciByID0gZiAvIHBvdyh0YW55KHkpLCBuKTtcbiAgICByZXR1cm4gW3IgKiBzaW4obiAqIHgpLCBmIC0gciAqIGNvcyhuICogeCldO1xuICB9XG5cbiAgcHJvamVjdC5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgdmFyIGZ5ID0gZiAtIHksIHIgPSBzaWduKG4pICogc3FydCh4ICogeCArIGZ5ICogZnkpLFxuICAgICAgbCA9IGF0YW4yKHgsIGFicyhmeSkpICogc2lnbihmeSk7XG4gICAgaWYgKGZ5ICogbiA8IDApXG4gICAgICBsIC09IHBpICogc2lnbih4KSAqIHNpZ24oZnkpO1xuICAgIHJldHVybiBbbCAvIG4sIDIgKiBhdGFuKHBvdyhmIC8gciwgMSAvIG4pKSAtIGhhbGZQaV07XG4gIH07XG5cbiAgcmV0dXJuIHByb2plY3Q7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gY29uaWNQcm9qZWN0aW9uKGNvbmljQ29uZm9ybWFsUmF3KVxuICAgICAgLnNjYWxlKDEwOS41KVxuICAgICAgLnBhcmFsbGVscyhbMzAsIDMwXSk7XG59XG4iLCJpbXBvcnQgcHJvamVjdGlvbiBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gZXF1aXJlY3Rhbmd1bGFyUmF3KGxhbWJkYSwgcGhpKSB7XG4gIHJldHVybiBbbGFtYmRhLCBwaGldO1xufVxuXG5lcXVpcmVjdGFuZ3VsYXJSYXcuaW52ZXJ0ID0gZXF1aXJlY3Rhbmd1bGFyUmF3O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHByb2plY3Rpb24oZXF1aXJlY3Rhbmd1bGFyUmF3KVxuICAgICAgLnNjYWxlKDE1Mi42Myk7XG59XG4iLCJpbXBvcnQge2FicywgYXRhbjIsIGNvcywgZXBzaWxvbiwgcGksIHNpZ24sIHNpbiwgc3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCB7Y29uaWNQcm9qZWN0aW9ufSBmcm9tIFwiLi9jb25pYy5qc1wiO1xuaW1wb3J0IHtlcXVpcmVjdGFuZ3VsYXJSYXd9IGZyb20gXCIuL2VxdWlyZWN0YW5ndWxhci5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gY29uaWNFcXVpZGlzdGFudFJhdyh5MCwgeTEpIHtcbiAgdmFyIGN5MCA9IGNvcyh5MCksXG4gICAgICBuID0geTAgPT09IHkxID8gc2luKHkwKSA6IChjeTAgLSBjb3MoeTEpKSAvICh5MSAtIHkwKSxcbiAgICAgIGcgPSBjeTAgLyBuICsgeTA7XG5cbiAgaWYgKGFicyhuKSA8IGVwc2lsb24pIHJldHVybiBlcXVpcmVjdGFuZ3VsYXJSYXc7XG5cbiAgZnVuY3Rpb24gcHJvamVjdCh4LCB5KSB7XG4gICAgdmFyIGd5ID0gZyAtIHksIG54ID0gbiAqIHg7XG4gICAgcmV0dXJuIFtneSAqIHNpbihueCksIGcgLSBneSAqIGNvcyhueCldO1xuICB9XG5cbiAgcHJvamVjdC5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgdmFyIGd5ID0gZyAtIHksXG4gICAgICAgIGwgPSBhdGFuMih4LCBhYnMoZ3kpKSAqIHNpZ24oZ3kpO1xuICAgIGlmIChneSAqIG4gPCAwKVxuICAgICAgbCAtPSBwaSAqIHNpZ24oeCkgKiBzaWduKGd5KTtcbiAgICByZXR1cm4gW2wgLyBuLCBnIC0gc2lnbihuKSAqIHNxcnQoeCAqIHggKyBneSAqIGd5KV07XG4gIH07XG5cbiAgcmV0dXJuIHByb2plY3Q7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gY29uaWNQcm9qZWN0aW9uKGNvbmljRXF1aWRpc3RhbnRSYXcpXG4gICAgICAuc2NhbGUoMTMxLjE1NClcbiAgICAgIC5jZW50ZXIoWzAsIDEzLjkzODldKTtcbn1cbiIsImltcG9ydCBwcm9qZWN0aW9uIGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQge2FicywgYXNpbiwgY29zLCBlcHNpbG9uMiwgc2luLCBzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuXG52YXIgQTEgPSAxLjM0MDI2NCxcbiAgICBBMiA9IC0wLjA4MTEwNixcbiAgICBBMyA9IDAuMDAwODkzLFxuICAgIEE0ID0gMC4wMDM3OTYsXG4gICAgTSA9IHNxcnQoMykgLyAyLFxuICAgIGl0ZXJhdGlvbnMgPSAxMjtcblxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsRWFydGhSYXcobGFtYmRhLCBwaGkpIHtcbiAgdmFyIGwgPSBhc2luKE0gKiBzaW4ocGhpKSksIGwyID0gbCAqIGwsIGw2ID0gbDIgKiBsMiAqIGwyO1xuICByZXR1cm4gW1xuICAgIGxhbWJkYSAqIGNvcyhsKSAvIChNICogKEExICsgMyAqIEEyICogbDIgKyBsNiAqICg3ICogQTMgKyA5ICogQTQgKiBsMikpKSxcbiAgICBsICogKEExICsgQTIgKiBsMiArIGw2ICogKEEzICsgQTQgKiBsMikpXG4gIF07XG59XG5cbmVxdWFsRWFydGhSYXcuaW52ZXJ0ID0gZnVuY3Rpb24oeCwgeSkge1xuICB2YXIgbCA9IHksIGwyID0gbCAqIGwsIGw2ID0gbDIgKiBsMiAqIGwyO1xuICBmb3IgKHZhciBpID0gMCwgZGVsdGEsIGZ5LCBmcHk7IGkgPCBpdGVyYXRpb25zOyArK2kpIHtcbiAgICBmeSA9IGwgKiAoQTEgKyBBMiAqIGwyICsgbDYgKiAoQTMgKyBBNCAqIGwyKSkgLSB5O1xuICAgIGZweSA9IEExICsgMyAqIEEyICogbDIgKyBsNiAqICg3ICogQTMgKyA5ICogQTQgKiBsMik7XG4gICAgbCAtPSBkZWx0YSA9IGZ5IC8gZnB5LCBsMiA9IGwgKiBsLCBsNiA9IGwyICogbDIgKiBsMjtcbiAgICBpZiAoYWJzKGRlbHRhKSA8IGVwc2lsb24yKSBicmVhaztcbiAgfVxuICByZXR1cm4gW1xuICAgIE0gKiB4ICogKEExICsgMyAqIEEyICogbDIgKyBsNiAqICg3ICogQTMgKyA5ICogQTQgKiBsMikpIC8gY29zKGwpLFxuICAgIGFzaW4oc2luKGwpIC8gTSlcbiAgXTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gcHJvamVjdGlvbihlcXVhbEVhcnRoUmF3KVxuICAgICAgLnNjYWxlKDE3Ny4xNTgpO1xufVxuIiwiaW1wb3J0IHthdGFuLCBjb3MsIHNpbn0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCB7YXppbXV0aGFsSW52ZXJ0fSBmcm9tIFwiLi9hemltdXRoYWwuanNcIjtcbmltcG9ydCBwcm9qZWN0aW9uIGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBnbm9tb25pY1Jhdyh4LCB5KSB7XG4gIHZhciBjeSA9IGNvcyh5KSwgayA9IGNvcyh4KSAqIGN5O1xuICByZXR1cm4gW2N5ICogc2luKHgpIC8gaywgc2luKHkpIC8ga107XG59XG5cbmdub21vbmljUmF3LmludmVydCA9IGF6aW11dGhhbEludmVydChhdGFuKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBwcm9qZWN0aW9uKGdub21vbmljUmF3KVxuICAgICAgLnNjYWxlKDE0NC4wNDkpXG4gICAgICAuY2xpcEFuZ2xlKDYwKTtcbn1cbiIsImltcG9ydCBjbGlwUmVjdGFuZ2xlIGZyb20gXCIuLi9jbGlwL3JlY3RhbmdsZS5qc1wiO1xuaW1wb3J0IGlkZW50aXR5IGZyb20gXCIuLi9pZGVudGl0eS5qc1wiO1xuaW1wb3J0IHt0cmFuc2Zvcm1lcn0gZnJvbSBcIi4uL3RyYW5zZm9ybS5qc1wiO1xuaW1wb3J0IHtmaXRFeHRlbnQsIGZpdFNpemUsIGZpdFdpZHRoLCBmaXRIZWlnaHR9IGZyb20gXCIuL2ZpdC5qc1wiO1xuaW1wb3J0IHtjb3MsIGRlZ3JlZXMsIHJhZGlhbnMsIHNpbn0gZnJvbSBcIi4uL21hdGguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBrID0gMSwgdHggPSAwLCB0eSA9IDAsIHN4ID0gMSwgc3kgPSAxLCAvLyBzY2FsZSwgdHJhbnNsYXRlIGFuZCByZWZsZWN0XG4gICAgICBhbHBoYSA9IDAsIGNhLCBzYSwgLy8gYW5nbGVcbiAgICAgIHgwID0gbnVsbCwgeTAsIHgxLCB5MSwgLy8gY2xpcCBleHRlbnRcbiAgICAgIGt4ID0gMSwga3kgPSAxLFxuICAgICAgdHJhbnNmb3JtID0gdHJhbnNmb3JtZXIoe1xuICAgICAgICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgIHZhciBwID0gcHJvamVjdGlvbihbeCwgeV0pXG4gICAgICAgICAgdGhpcy5zdHJlYW0ucG9pbnQocFswXSwgcFsxXSk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgcG9zdGNsaXAgPSBpZGVudGl0eSxcbiAgICAgIGNhY2hlLFxuICAgICAgY2FjaGVTdHJlYW07XG5cbiAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAga3ggPSBrICogc3g7XG4gICAga3kgPSBrICogc3k7XG4gICAgY2FjaGUgPSBjYWNoZVN0cmVhbSA9IG51bGw7XG4gICAgcmV0dXJuIHByb2plY3Rpb247XG4gIH1cblxuICBmdW5jdGlvbiBwcm9qZWN0aW9uIChwKSB7XG4gICAgdmFyIHggPSBwWzBdICoga3gsIHkgPSBwWzFdICoga3k7XG4gICAgaWYgKGFscGhhKSB7XG4gICAgICB2YXIgdCA9IHkgKiBjYSAtIHggKiBzYTtcbiAgICAgIHggPSB4ICogY2EgKyB5ICogc2E7XG4gICAgICB5ID0gdDtcbiAgICB9ICAgIFxuICAgIHJldHVybiBbeCArIHR4LCB5ICsgdHldO1xuICB9XG4gIHByb2plY3Rpb24uaW52ZXJ0ID0gZnVuY3Rpb24ocCkge1xuICAgIHZhciB4ID0gcFswXSAtIHR4LCB5ID0gcFsxXSAtIHR5O1xuICAgIGlmIChhbHBoYSkge1xuICAgICAgdmFyIHQgPSB5ICogY2EgKyB4ICogc2E7XG4gICAgICB4ID0geCAqIGNhIC0geSAqIHNhO1xuICAgICAgeSA9IHQ7XG4gICAgfVxuICAgIHJldHVybiBbeCAvIGt4LCB5IC8ga3ldO1xuICB9O1xuICBwcm9qZWN0aW9uLnN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgIHJldHVybiBjYWNoZSAmJiBjYWNoZVN0cmVhbSA9PT0gc3RyZWFtID8gY2FjaGUgOiBjYWNoZSA9IHRyYW5zZm9ybShwb3N0Y2xpcChjYWNoZVN0cmVhbSA9IHN0cmVhbSkpO1xuICB9O1xuICBwcm9qZWN0aW9uLnBvc3RjbGlwID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBvc3RjbGlwID0gXywgeDAgPSB5MCA9IHgxID0geTEgPSBudWxsLCByZXNldCgpKSA6IHBvc3RjbGlwO1xuICB9O1xuICBwcm9qZWN0aW9uLmNsaXBFeHRlbnQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocG9zdGNsaXAgPSBfID09IG51bGwgPyAoeDAgPSB5MCA9IHgxID0geTEgPSBudWxsLCBpZGVudGl0eSkgOiBjbGlwUmVjdGFuZ2xlKHgwID0gK19bMF1bMF0sIHkwID0gK19bMF1bMV0sIHgxID0gK19bMV1bMF0sIHkxID0gK19bMV1bMV0pLCByZXNldCgpKSA6IHgwID09IG51bGwgPyBudWxsIDogW1t4MCwgeTBdLCBbeDEsIHkxXV07XG4gIH07XG4gIHByb2plY3Rpb24uc2NhbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoayA9ICtfLCByZXNldCgpKSA6IGs7XG4gIH07XG4gIHByb2plY3Rpb24udHJhbnNsYXRlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHR4ID0gK19bMF0sIHR5ID0gK19bMV0sIHJlc2V0KCkpIDogW3R4LCB0eV07XG4gIH1cbiAgcHJvamVjdGlvbi5hbmdsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChhbHBoYSA9IF8gJSAzNjAgKiByYWRpYW5zLCBzYSA9IHNpbihhbHBoYSksIGNhID0gY29zKGFscGhhKSwgcmVzZXQoKSkgOiBhbHBoYSAqIGRlZ3JlZXM7XG4gIH07XG4gIHByb2plY3Rpb24ucmVmbGVjdFggPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoc3ggPSBfID8gLTEgOiAxLCByZXNldCgpKSA6IHN4IDwgMDtcbiAgfTtcbiAgcHJvamVjdGlvbi5yZWZsZWN0WSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChzeSA9IF8gPyAtMSA6IDEsIHJlc2V0KCkpIDogc3kgPCAwO1xuICB9O1xuICBwcm9qZWN0aW9uLmZpdEV4dGVudCA9IGZ1bmN0aW9uKGV4dGVudCwgb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZpdEV4dGVudChwcm9qZWN0aW9uLCBleHRlbnQsIG9iamVjdCk7XG4gIH07XG4gIHByb2plY3Rpb24uZml0U2l6ZSA9IGZ1bmN0aW9uKHNpemUsIG9iamVjdCkge1xuICAgIHJldHVybiBmaXRTaXplKHByb2plY3Rpb24sIHNpemUsIG9iamVjdCk7XG4gIH07XG4gIHByb2plY3Rpb24uZml0V2lkdGggPSBmdW5jdGlvbih3aWR0aCwgb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZpdFdpZHRoKHByb2plY3Rpb24sIHdpZHRoLCBvYmplY3QpO1xuICB9O1xuICBwcm9qZWN0aW9uLmZpdEhlaWdodCA9IGZ1bmN0aW9uKGhlaWdodCwgb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZpdEhlaWdodChwcm9qZWN0aW9uLCBoZWlnaHQsIG9iamVjdCk7XG4gIH07XG5cbiAgcmV0dXJuIHByb2plY3Rpb247XG59XG4iLCJpbXBvcnQgcHJvamVjdGlvbiBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHthYnMsIGVwc2lsb259IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBuYXR1cmFsRWFydGgxUmF3KGxhbWJkYSwgcGhpKSB7XG4gIHZhciBwaGkyID0gcGhpICogcGhpLCBwaGk0ID0gcGhpMiAqIHBoaTI7XG4gIHJldHVybiBbXG4gICAgbGFtYmRhICogKDAuODcwNyAtIDAuMTMxOTc5ICogcGhpMiArIHBoaTQgKiAoLTAuMDEzNzkxICsgcGhpNCAqICgwLjAwMzk3MSAqIHBoaTIgLSAwLjAwMTUyOSAqIHBoaTQpKSksXG4gICAgcGhpICogKDEuMDA3MjI2ICsgcGhpMiAqICgwLjAxNTA4NSArIHBoaTQgKiAoLTAuMDQ0NDc1ICsgMC4wMjg4NzQgKiBwaGkyIC0gMC4wMDU5MTYgKiBwaGk0KSkpXG4gIF07XG59XG5cbm5hdHVyYWxFYXJ0aDFSYXcuaW52ZXJ0ID0gZnVuY3Rpb24oeCwgeSkge1xuICB2YXIgcGhpID0geSwgaSA9IDI1LCBkZWx0YTtcbiAgZG8ge1xuICAgIHZhciBwaGkyID0gcGhpICogcGhpLCBwaGk0ID0gcGhpMiAqIHBoaTI7XG4gICAgcGhpIC09IGRlbHRhID0gKHBoaSAqICgxLjAwNzIyNiArIHBoaTIgKiAoMC4wMTUwODUgKyBwaGk0ICogKC0wLjA0NDQ3NSArIDAuMDI4ODc0ICogcGhpMiAtIDAuMDA1OTE2ICogcGhpNCkpKSAtIHkpIC9cbiAgICAgICAgKDEuMDA3MjI2ICsgcGhpMiAqICgwLjAxNTA4NSAqIDMgKyBwaGk0ICogKC0wLjA0NDQ3NSAqIDcgKyAwLjAyODg3NCAqIDkgKiBwaGkyIC0gMC4wMDU5MTYgKiAxMSAqIHBoaTQpKSk7XG4gIH0gd2hpbGUgKGFicyhkZWx0YSkgPiBlcHNpbG9uICYmIC0taSA+IDApO1xuICByZXR1cm4gW1xuICAgIHggLyAoMC44NzA3ICsgKHBoaTIgPSBwaGkgKiBwaGkpICogKC0wLjEzMTk3OSArIHBoaTIgKiAoLTAuMDEzNzkxICsgcGhpMiAqIHBoaTIgKiBwaGkyICogKDAuMDAzOTcxIC0gMC4wMDE1MjkgKiBwaGkyKSkpKSxcbiAgICBwaGlcbiAgXTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gcHJvamVjdGlvbihuYXR1cmFsRWFydGgxUmF3KVxuICAgICAgLnNjYWxlKDE3NS4yOTUpO1xufVxuIiwiaW1wb3J0IHthc2luLCBjb3MsIGVwc2lsb24sIHNpbn0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCB7YXppbXV0aGFsSW52ZXJ0fSBmcm9tIFwiLi9hemltdXRoYWwuanNcIjtcbmltcG9ydCBwcm9qZWN0aW9uIGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBvcnRob2dyYXBoaWNSYXcoeCwgeSkge1xuICByZXR1cm4gW2Nvcyh5KSAqIHNpbih4KSwgc2luKHkpXTtcbn1cblxub3J0aG9ncmFwaGljUmF3LmludmVydCA9IGF6aW11dGhhbEludmVydChhc2luKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBwcm9qZWN0aW9uKG9ydGhvZ3JhcGhpY1JhdylcbiAgICAgIC5zY2FsZSgyNDkuNSlcbiAgICAgIC5jbGlwQW5nbGUoOTAgKyBlcHNpbG9uKTtcbn1cbiIsImltcG9ydCB7YXRhbiwgY29zLCBzaW59IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQge2F6aW11dGhhbEludmVydH0gZnJvbSBcIi4vYXppbXV0aGFsLmpzXCI7XG5pbXBvcnQgcHJvamVjdGlvbiBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gc3RlcmVvZ3JhcGhpY1Jhdyh4LCB5KSB7XG4gIHZhciBjeSA9IGNvcyh5KSwgayA9IDEgKyBjb3MoeCkgKiBjeTtcbiAgcmV0dXJuIFtjeSAqIHNpbih4KSAvIGssIHNpbih5KSAvIGtdO1xufVxuXG5zdGVyZW9ncmFwaGljUmF3LmludmVydCA9IGF6aW11dGhhbEludmVydChmdW5jdGlvbih6KSB7XG4gIHJldHVybiAyICogYXRhbih6KTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHByb2plY3Rpb24oc3RlcmVvZ3JhcGhpY1JhdylcbiAgICAgIC5zY2FsZSgyNTApXG4gICAgICAuY2xpcEFuZ2xlKDE0Mik7XG59XG4iLCJpbXBvcnQge2F0YW4sIGV4cCwgaGFsZlBpLCBsb2csIHRhbn0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCB7bWVyY2F0b3JQcm9qZWN0aW9ufSBmcm9tIFwiLi9tZXJjYXRvci5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnN2ZXJzZU1lcmNhdG9yUmF3KGxhbWJkYSwgcGhpKSB7XG4gIHJldHVybiBbbG9nKHRhbigoaGFsZlBpICsgcGhpKSAvIDIpKSwgLWxhbWJkYV07XG59XG5cbnRyYW5zdmVyc2VNZXJjYXRvclJhdy5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gIHJldHVybiBbLXksIDIgKiBhdGFuKGV4cCh4KSkgLSBoYWxmUGldO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBtID0gbWVyY2F0b3JQcm9qZWN0aW9uKHRyYW5zdmVyc2VNZXJjYXRvclJhdyksXG4gICAgICBjZW50ZXIgPSBtLmNlbnRlcixcbiAgICAgIHJvdGF0ZSA9IG0ucm90YXRlO1xuXG4gIG0uY2VudGVyID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gY2VudGVyKFstX1sxXSwgX1swXV0pIDogKF8gPSBjZW50ZXIoKSwgW19bMV0sIC1fWzBdXSk7XG4gIH07XG5cbiAgbS5yb3RhdGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyByb3RhdGUoW19bMF0sIF9bMV0sIF8ubGVuZ3RoID4gMiA/IF9bMl0gKyA5MCA6IDkwXSkgOiAoXyA9IHJvdGF0ZSgpLCBbX1swXSwgX1sxXSwgX1syXSAtIDkwXSk7XG4gIH07XG5cbiAgcmV0dXJuIHJvdGF0ZShbMCwgMCwgOTBdKVxuICAgICAgLnNjYWxlKDE1OS4xNTUpO1xufVxuIiwiZXhwb3J0IHtkZWZhdWx0IGFzIGdlb0FyZWF9IGZyb20gXCIuL2FyZWEuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBnZW9Cb3VuZHN9IGZyb20gXCIuL2JvdW5kcy5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGdlb0NlbnRyb2lkfSBmcm9tIFwiLi9jZW50cm9pZC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGdlb0NpcmNsZX0gZnJvbSBcIi4vY2lyY2xlLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgZ2VvQ2xpcEFudGltZXJpZGlhbn0gZnJvbSBcIi4vY2xpcC9hbnRpbWVyaWRpYW4uanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBnZW9DbGlwQ2lyY2xlfSBmcm9tIFwiLi9jbGlwL2NpcmNsZS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGdlb0NsaXBFeHRlbnR9IGZyb20gXCIuL2NsaXAvZXh0ZW50LmpzXCI7IC8vIERFUFJFQ0FURUQhIFVzZSBkMy5nZW9JZGVudGl0eSgpLmNsaXBFeHRlbnQo4oCmKS5cbmV4cG9ydCB7ZGVmYXVsdCBhcyBnZW9DbGlwUmVjdGFuZ2xlfSBmcm9tIFwiLi9jbGlwL3JlY3RhbmdsZS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGdlb0NvbnRhaW5zfSBmcm9tIFwiLi9jb250YWlucy5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGdlb0Rpc3RhbmNlfSBmcm9tIFwiLi9kaXN0YW5jZS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGdlb0dyYXRpY3VsZSwgZ3JhdGljdWxlMTAgYXMgZ2VvR3JhdGljdWxlMTB9IGZyb20gXCIuL2dyYXRpY3VsZS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGdlb0ludGVycG9sYXRlfSBmcm9tIFwiLi9pbnRlcnBvbGF0ZS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGdlb0xlbmd0aH0gZnJvbSBcIi4vbGVuZ3RoLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgZ2VvUGF0aH0gZnJvbSBcIi4vcGF0aC9pbmRleC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGdlb0FsYmVyc30gZnJvbSBcIi4vcHJvamVjdGlvbi9hbGJlcnMuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBnZW9BbGJlcnNVc2F9IGZyb20gXCIuL3Byb2plY3Rpb24vYWxiZXJzVXNhLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgZ2VvQXppbXV0aGFsRXF1YWxBcmVhLCBhemltdXRoYWxFcXVhbEFyZWFSYXcgYXMgZ2VvQXppbXV0aGFsRXF1YWxBcmVhUmF3fSBmcm9tIFwiLi9wcm9qZWN0aW9uL2F6aW11dGhhbEVxdWFsQXJlYS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGdlb0F6aW11dGhhbEVxdWlkaXN0YW50LCBhemltdXRoYWxFcXVpZGlzdGFudFJhdyBhcyBnZW9BemltdXRoYWxFcXVpZGlzdGFudFJhd30gZnJvbSBcIi4vcHJvamVjdGlvbi9hemltdXRoYWxFcXVpZGlzdGFudC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGdlb0NvbmljQ29uZm9ybWFsLCBjb25pY0NvbmZvcm1hbFJhdyBhcyBnZW9Db25pY0NvbmZvcm1hbFJhd30gZnJvbSBcIi4vcHJvamVjdGlvbi9jb25pY0NvbmZvcm1hbC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGdlb0NvbmljRXF1YWxBcmVhLCBjb25pY0VxdWFsQXJlYVJhdyBhcyBnZW9Db25pY0VxdWFsQXJlYVJhd30gZnJvbSBcIi4vcHJvamVjdGlvbi9jb25pY0VxdWFsQXJlYS5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGdlb0NvbmljRXF1aWRpc3RhbnQsIGNvbmljRXF1aWRpc3RhbnRSYXcgYXMgZ2VvQ29uaWNFcXVpZGlzdGFudFJhd30gZnJvbSBcIi4vcHJvamVjdGlvbi9jb25pY0VxdWlkaXN0YW50LmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgZ2VvRXF1YWxFYXJ0aCwgZXF1YWxFYXJ0aFJhdyBhcyBnZW9FcXVhbEVhcnRoUmF3fSBmcm9tIFwiLi9wcm9qZWN0aW9uL2VxdWFsRWFydGguanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBnZW9FcXVpcmVjdGFuZ3VsYXIsIGVxdWlyZWN0YW5ndWxhclJhdyBhcyBnZW9FcXVpcmVjdGFuZ3VsYXJSYXd9IGZyb20gXCIuL3Byb2plY3Rpb24vZXF1aXJlY3Rhbmd1bGFyLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgZ2VvR25vbW9uaWMsIGdub21vbmljUmF3IGFzIGdlb0dub21vbmljUmF3fSBmcm9tIFwiLi9wcm9qZWN0aW9uL2dub21vbmljLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgZ2VvSWRlbnRpdHl9IGZyb20gXCIuL3Byb2plY3Rpb24vaWRlbnRpdHkuanNcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBnZW9Qcm9qZWN0aW9uLCBwcm9qZWN0aW9uTXV0YXRvciBhcyBnZW9Qcm9qZWN0aW9uTXV0YXRvcn0gZnJvbSBcIi4vcHJvamVjdGlvbi9pbmRleC5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGdlb01lcmNhdG9yLCBtZXJjYXRvclJhdyBhcyBnZW9NZXJjYXRvclJhd30gZnJvbSBcIi4vcHJvamVjdGlvbi9tZXJjYXRvci5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGdlb05hdHVyYWxFYXJ0aDEsIG5hdHVyYWxFYXJ0aDFSYXcgYXMgZ2VvTmF0dXJhbEVhcnRoMVJhd30gZnJvbSBcIi4vcHJvamVjdGlvbi9uYXR1cmFsRWFydGgxLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgZ2VvT3J0aG9ncmFwaGljLCBvcnRob2dyYXBoaWNSYXcgYXMgZ2VvT3J0aG9ncmFwaGljUmF3fSBmcm9tIFwiLi9wcm9qZWN0aW9uL29ydGhvZ3JhcGhpYy5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGdlb1N0ZXJlb2dyYXBoaWMsIHN0ZXJlb2dyYXBoaWNSYXcgYXMgZ2VvU3RlcmVvZ3JhcGhpY1Jhd30gZnJvbSBcIi4vcHJvamVjdGlvbi9zdGVyZW9ncmFwaGljLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgZ2VvVHJhbnN2ZXJzZU1lcmNhdG9yLCB0cmFuc3ZlcnNlTWVyY2F0b3JSYXcgYXMgZ2VvVHJhbnN2ZXJzZU1lcmNhdG9yUmF3fSBmcm9tIFwiLi9wcm9qZWN0aW9uL3RyYW5zdmVyc2VNZXJjYXRvci5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGdlb1JvdGF0aW9ufSBmcm9tIFwiLi9yb3RhdGlvbi5qc1wiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGdlb1N0cmVhbX0gZnJvbSBcIi4vc3RyZWFtLmpzXCI7XG5leHBvcnQge2RlZmF1bHQgYXMgZ2VvVHJhbnNmb3JtfSBmcm9tIFwiLi90cmFuc2Zvcm0uanNcIjtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==