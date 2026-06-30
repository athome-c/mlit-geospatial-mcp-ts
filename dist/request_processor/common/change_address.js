"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFullAddress = getFullAddress;
exports.getPrefName = getPrefName;
exports.getCityname = getCityname;
exports.getDistrictName = getDistrictName;
exports.getLibraryapi = getLibraryapi;
exports.getFullAddressAsync = getFullAddressAsync;
const axios_1 = __importDefault(require("axios"));
const const_1 = require("../../utils/const");
function getFullAddress(muniCd, lv01Nm) {
    const prefName = getPrefName(muniCd);
    const cityName = "";
    // Wait, the python implementation of getCityname actually calls API synchronously. I will implement them as async.
    const districtName = getDistrictName(lv01Nm);
    // Returns promise, requires refactor. Let's return the pieces.
    return `${prefName}${cityName}${districtName}`;
}
// 都道府県名取得
function getPrefName(muniCd) {
    const prefCode = muniCd.substring(0, 2);
    return const_1.PREFECTURE_MAP[prefCode] || "";
}
// 市区町村名取得
async function getCityname(muniCd) {
    const prefCd = muniCd.substring(0, 2);
    const cityList = await getLibraryapi(prefCd);
    if (cityList && cityList.data) {
        const match = cityList.data.find((item) => item.id === muniCd);
        return match ? match.name : null;
    }
    return null;
}
// 地名取得（大字）
function getDistrictName(lv01Nm) {
    return lv01Nm.replace(/([一二三四五六七八九十百千万]+|[0-9]+)丁目$/, "");
}
// 不動産ライブラリAPI（都道府県）
async function getLibraryapi(prefCd) {
    try {
        const response = await axios_1.default.get(`${const_1.LIBRARY_API_URL}/XIT002`, {
            params: { area: prefCd },
            headers: {
                "User-Agent": "REINS-Client",
                "Ocp-Apim-Subscription-Key": const_1.LIBRARY_API_KEY
            }
        });
        return response.data;
    }
    catch (e) {
        return null;
    }
}
async function getFullAddressAsync(muniCd, lv01Nm) {
    const prefName = getPrefName(muniCd);
    const cityName = await getCityname(muniCd) || "";
    const districtName = getDistrictName(lv01Nm);
    return `${prefName}${cityName}${districtName}`;
}
