"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.latlonToTileFraction = latlonToTileFraction;
exports.latlonToAddress = latlonToAddress;
const reverse_geocoder_1 = require("./reverse_geocoder");
// タイル内の相対位置を取得
function latlonToTileFraction(lat, lon, zoom) {
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
async function latlonToAddress(lat, lon) {
    return await (0, reverse_geocoder_1.getCitycd)(lat, lon);
}
//# sourceMappingURL=coordinates_conversion.js.map