"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.overlapJudge = overlapJudge;
const helpers_1 = require("@turf/helpers");
const boolean_intersects_1 = __importDefault(require("@turf/boolean-intersects"));
// 不動産ライブラリのポリゴン重なり判定
function overlapJudge(features, latlon) {
    const [searchLat, searchLon] = latlon;
    const searchPt = (0, helpers_1.point)([searchLon, searchLat]);
    const filtered = [];
    for (const feature of features) {
        const geom = feature.geometry || {};
        let targetGeom = null;
        try {
            if (geom.type === 'Polygon') {
                targetGeom = (0, helpers_1.polygon)(geom.coordinates);
            }
            else if (geom.type === 'MultiPolygon') {
                targetGeom = (0, helpers_1.multiPolygon)(geom.coordinates);
            }
        }
        catch (e) {
            console.error(`GeoJSON座標の変換エラー:`, e);
        }
        if (targetGeom) {
            if ((0, boolean_intersects_1.default)(searchPt, targetGeom)) {
                filtered.push(feature);
            }
        }
    }
    return filtered;
}
