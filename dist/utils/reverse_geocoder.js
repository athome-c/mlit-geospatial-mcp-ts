"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCitycd = getCitycd;
const axios_1 = __importDefault(require("axios"));
const const_1 = require("./const");
// 緯度経度から都道府県CD検索(国土地理院による逆ジオコーダ)
async function getCitycd(lat, lon) {
    try {
        const response = await axios_1.default.get(const_1.RE_RGEOCODER_URL, {
            params: { lat, lon },
            headers: { "User-Agent": "REINS-Client" }
        });
        if (response.status === 200) {
            const muniCd = response.data.results.muniCd;
            const lv01Nm = response.data.results.lv01Nm;
            return [muniCd, lv01Nm];
        }
        return [null, null];
    }
    catch (error) {
        return [null, null];
    }
}
