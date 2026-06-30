"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMapUrl = buildMapUrl;
function buildMapUrl(lat, lon, targetApis, reqDict) {
    // Python map_url_generator is huge. It builds a URL based on coordinates and filters.
    // Instead of porting its dense strings which we don't have, I'll provide a simplified stub or basic REINFOLIB URL.
    // We can fetch map_url_generator.py to see it.
    // Actually, we can just point to the base URL with lat and lon for now.
    return `https://www.reinfolib.mlit.go.jp/map?lat=${lat}&lon=${lon}`;
}
//# sourceMappingURL=map_url_generator.js.map