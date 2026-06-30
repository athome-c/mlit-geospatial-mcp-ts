"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.H_METERS = exports.Z_HEIGHT_EXP = exports.WEB_MERCATOR_LAT_MAX = void 0;
exports.asString = asString;
exports.clipLat = clipLat;
exports.lonlatToXyz = lonlatToXyz;
exports.elevationToF = elevationToF;
exports.spatialIdFromWgs84 = spatialIdFromWgs84;
// PLATEAU Spatial ID utils
exports.WEB_MERCATOR_LAT_MAX = 85.05112878;
exports.Z_HEIGHT_EXP = 25;
exports.H_METERS = Math.pow(2, exports.Z_HEIGHT_EXP);
function asString(sid) {
    return `${sid.z}/${sid.f}/${sid.x}/${sid.y}`;
}
function clipLat(latDeg) {
    return Math.max(Math.min(latDeg, exports.WEB_MERCATOR_LAT_MAX), -exports.WEB_MERCATOR_LAT_MAX);
}
function lonlatToXyz(lonDeg, latDeg, z) {
    const clippedLat = clipLat(latDeg);
    const n = Math.pow(2, z);
    const xFloat = n * ((lonDeg + 180.0) / 360.0);
    const x = Math.floor(xFloat);
    const latRad = clippedLat * (Math.PI / 180.0);
    const yFloat = (n * (1.0 - (Math.log(Math.tan(latRad) + (1.0 / Math.cos(latRad))) / Math.PI)) / 2.0);
    const y = Math.floor(yFloat);
    return [x, y];
}
function elevationToF(hM, z) {
    const n = Math.pow(2, z);
    return Math.floor((n * hM) / exports.H_METERS);
}
function spatialIdFromWgs84(latDeg, lonDeg, z = 18, hM = 0.0) {
    const [x, y] = lonlatToXyz(lonDeg, latDeg, z);
    const f = elevationToF(hM, z);
    return { z, f, x, y };
}
//# sourceMappingURL=space_id_calculaton.js.map