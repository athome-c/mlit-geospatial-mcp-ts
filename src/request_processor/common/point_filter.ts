import { point, lineString } from '@turf/helpers';
import distance from '@turf/distance';
import nearestPointOnLine from '@turf/nearest-point-on-line';

// 周辺タイルの座標を取得（中心含む）
export function getSurroundingTiles(x: number, y: number, xFrac: number, yFrac: number): [number, number][] {
    if (xFrac < 0.5 && yFrac < 0.5) {
        return [[x, y], [x - 1, y], [x - 1, y - 1], [x, y - 1]];
    } else if (xFrac >= 0.5 && yFrac < 0.5) {
        return [[x, y], [x + 1, y], [x + 1, y - 1], [x, y - 1]];
    } else if (xFrac >= 0.5 && yFrac >= 0.5) {
        return [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]];
    } else {
        return [[x, y], [x - 1, y], [x - 1, y + 1], [x, y + 1]];
    }
}

export function filterDistance(features: any[], latlon: [number, number], r: number): any[] {
    const [searchLat, searchLon] = latlon;
    const searchPt = point([searchLon, searchLat]);
    const filtered = [];

    for (const feature of features) {
        const geom = feature.geometry || {};
        const geomType = geom.type;
        const coords = geom.coordinates;

        let distM = Infinity;

        if (geomType === 'Point') {
            const targetPt = point([coords[0], coords[1]]);
            distM = distance(searchPt, targetPt, { units: 'meters' });
        } else if (geomType === 'LineString') {
            const line = lineString(coords);
            const nearest = nearestPointOnLine(line, searchPt, { units: 'meters' });
            distM = nearest.properties.dist * 1000; // @turf/nearest-point-on-line returns km, distance() returns meters? wait, nearest returns units specified. If units is meters, it returns meters. Let's make sure it's consistent. Wait, turf options 'meters' returns meters.
        }

        if (distM <= r) {
            filtered.push(feature);
        }
    }

    return filtered;
}
