"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatlon = getLatlon;
const axios_1 = __importDefault(require("axios"));
const const_1 = require("./const");
// 住所から緯度経度(国土地理院のジオコーダ)
async function getLatlon(fullAddr) {
    try {
        const response = await axios_1.default.get(const_1.RGEOCODER_URL, {
            params: { q: fullAddr },
            headers: { "User-Agent": "REINS-Client" }
        });
        const result = response.data;
        if (result && Array.isArray(result) && result.length > 0) {
            const lon = result[0].geometry.coordinates[0];
            const lat = result[0].geometry.coordinates[1];
            return [lon, lat];
        }
        return [null, null];
    }
    catch (error) {
        return [null, null];
    }
}
