export declare const WEB_MERCATOR_LAT_MAX = 85.05112878;
export declare const Z_HEIGHT_EXP = 25;
export declare const H_METERS: number;
export interface SpatialID {
    z: number;
    f: number;
    x: number;
    y: number;
}
export declare function asString(sid: SpatialID): string;
export declare function clipLat(latDeg: number): number;
export declare function lonlatToXyz(lonDeg: number, latDeg: number, z: number): [number, number];
export declare function elevationToF(hM: number, z: number): number;
export declare function spatialIdFromWgs84(latDeg: number, lonDeg: number, z?: number, hM?: number): SpatialID;
//# sourceMappingURL=space_id_calculaton.d.ts.map