// PLATEAU Spatial ID utils
export const WEB_MERCATOR_LAT_MAX = 85.05112878;
export const Z_HEIGHT_EXP = 25;
export const H_METERS = Math.pow(2, Z_HEIGHT_EXP);

export interface SpatialID {
    z: number;
    f: number;
    x: number;
    y: number;
}

export function asString(sid: SpatialID): string {
    return `${sid.z}/${sid.f}/${sid.x}/${sid.y}`;
}

export function clipLat(latDeg: number): number {
    return Math.max(Math.min(latDeg, WEB_MERCATOR_LAT_MAX), -WEB_MERCATOR_LAT_MAX);
}

export function lonlatToXyz(lonDeg: number, latDeg: number, z: number): [number, number] {
    const clippedLat = clipLat(latDeg);
    const n = Math.pow(2, z);

    const xFloat = n * ((lonDeg + 180.0) / 360.0);
    const x = Math.floor(xFloat);

    const latRad = clippedLat * (Math.PI / 180.0);
    const yFloat = (n * (1.0 - (Math.log(Math.tan(latRad) + (1.0 / Math.cos(latRad))) / Math.PI)) / 2.0);
    const y = Math.floor(yFloat);

    return [x, y];
}

export function elevationToF(hM: number, z: number): number {
    const n = Math.pow(2, z);
    return Math.floor((n * hM) / H_METERS);
}

export function spatialIdFromWgs84(latDeg: number, lonDeg: number, z: number = 18, hM: number = 0.0): SpatialID {
    const [x, y] = lonlatToXyz(lonDeg, latDeg, z);
    const f = elevationToF(hM, z);
    return { z, f, x, y };
}
