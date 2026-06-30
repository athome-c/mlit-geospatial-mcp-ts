"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = get;
const axios_1 = __importDefault(require("axios"));
async function get(url, params = null, responseType = "json", headers = null) {
    const reqHeaders = headers || { "Accept": "*/*" };
    try {
        const response = await axios_1.default.get(url, { headers: reqHeaders, params });
        if (responseType === "json" || responseType === "geojson") {
            return response.data;
        }
    }
    catch (error) {
        console.error(`API呼び出し失敗 URL:${url} params:${JSON.stringify(params)} エラー:`, error);
        return { data: [] };
    }
}
