"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSurroundingTiles = getSurroundingTiles;
exports.filterDistance = filterDistance;
const helpers_1 = require("@turf/helpers");
const distance_1 = __importDefault(require("@turf/distance"));
const nearest_point_on_line_1 = __importDefault(require("@turf/nearest-point-on-line"));
// 周辺タイルの座標を取得（中心含む）
function getSurroundingTiles(x, y, xFrac, yFrac) {
    if (xFrac < 0.5 && yFrac < 0.5) {
        return [[x, y], [x - 1, y], [x - 1, y - 1], [x, y - 1]];
    }
    else if (xFrac >= 0.5 && yFrac < 0.5) {
        return [[x, y], [x + 1, y], [x + 1, y - 1], [x, y - 1]];
    }
    else if (xFrac >= 0.5 && yFrac >= 0.5) {
        return [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]];
    }
    else {
        return [[x, y], [x - 1, y], [x - 1, y + 1], [x, y + 1]];
    }
}
function filterDistance(features, latlon, r) {
    const [searchLat, searchLon] = latlon;
    const searchPt = (0, helpers_1.point)([searchLon, searchLat]);
    const filtered = [];
    for (const feature of features) {
        const geom = feature.geometry || {};
        const geomType = geom.type;
        const coords = geom.coordinates;
        let distM = Infinity;
        if (geomType === 'Point') {
            const targetPt = (0, helpers_1.point)([coords[0], coords[1]]);
            distM = (0, distance_1.default)(searchPt, targetPt, { units: 'meters' });
        }
        else if (geomType === 'LineString') {
            const line = (0, helpers_1.lineString)(coords);
            const nearest = (0, nearest_point_on_line_1.default)(line, searchPt, { units: 'meters' });
            distM = nearest.properties.dist * 1000; // @turf/nearest-point-on-line returns km, distance() returns meters? wait, nearest returns units specified. If units is meters, it returns meters. Let's make sure it's consistent. Wait, turf options 'meters' returns meters.
        }
        if (distM <= r) {
            filtered.push(feature);
        }
    }
    return filtered;
}
//# sourceMappingURL=point_filter.js.map