import { getCitycd } from './reverse_geocoder';

// タイル内の相対位置を取得
export function latlonToTileFraction(lat: number, lon: number, zoom: number): [number, number, number, number] {
    // どのタイルに属するか計算（小数点込）
    const n = Math.pow(2, zoom);
    const latRad = lat * (Math.PI / 180);
    const xFloat = n * ((lon + 180) / 360);
    const yFloat = n * (1 - (Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI)) / 2;

    // 整数
    const x = Math.floor(xFloat);
    const y = Math.floor(yFloat);

    // タイル内での相対位置（小数点部分）
    const xFrac = xFloat - x;
    const yFrac = yFloat - y;

    return [x, y, xFrac, yFrac];
}

// 住所変換
export async function latlonToAddress(lat: number, lon: number): Promise<[string | null, string | null]> {
    return await getCitycd(lat, lon);
}
