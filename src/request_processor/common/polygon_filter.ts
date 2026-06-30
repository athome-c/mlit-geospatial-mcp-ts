import { point, polygon, multiPolygon } from '@turf/helpers';
import booleanIntersects from '@turf/boolean-intersects';

// 不動産ライブラリのポリゴン重なり判定
export function overlapJudge(features: any[], latlon: [number, number]): any[] {
    const [searchLat, searchLon] = latlon;
    const searchPt = point([searchLon, searchLat]);
    const filtered = [];

    for (const feature of features) {
        const geom = feature.geometry || {};

        let targetGeom = null;
        try {
            if (geom.type === 'Polygon') {
                targetGeom = polygon(geom.coordinates);
            } else if (geom.type === 'MultiPolygon') {
                targetGeom = multiPolygon(geom.coordinates);
            }
        } catch (e) {
            console.error(`GeoJSON座標の変換エラー:`, e);
        }

        if (targetGeom) {
            if (booleanIntersects(searchPt, targetGeom)) {
                filtered.push(feature);
            }
        }
    }

    return filtered;
}
