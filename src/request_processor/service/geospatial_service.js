"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeospatialService = void 0;
const api_models_1 = require("../models/api_models");
const const_1 = require("../../utils/const");
const coordinates_conversion_1 = require("../../utils/coordinates_conversion");
const map_url_generator_1 = require("../../utils/map_url_generator");
const api_enum_1 = require("../enums/api_enum");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class GeospatialService {
    async convertedCoordinate(coord) {
        const [x, y, x_frac, y_frac] = (0, coordinates_conversion_1.latlonToTileFraction)(coord.lat, coord.lon, const_1.ZOOM);
        const [muni_cd, lv_01_nm] = await (0, coordinates_conversion_1.latlonToAddress)(coord.lat, coord.lon);
        return {
            lat: coord.lat,
            lon: coord.lon,
            x, y, x_frac, y_frac,
            muni_cd, lv_01_nm,
        };
    }
    async processRequest(req) {
        if (req.save_file === undefined || req.save_file === null) {
            return {
                status: "need_confirmation",
                message: "【重要】取得結果のファイルを保存しますか？ save_file=true/false を必ずユーザーに選択させてください。自動でfalseにしないでください。",
            };
        }
        const baseOutputFolder = "C:/output";
        let filePaths = [];
        // We only process the first coordinate like in python loop or actually for each coordinate
        // wait python says: for c in req.coordinates: -> returns at the end, returning only the first c result realistically because of `return { ..., mapUrl, ... }` inside the loop!?
        // Let's iterate and return the last one like python does? Python returns inside the loop for the first element. Wait... looking at python `geospatial_service.py` L191 `return` is outside the `for` loop, so it returns the last element c's results. We will do the same.
        let finalResult = null;
        for (const c of req.coordinates) {
            const converted = await this.convertedCoordinate(c);
            const reqDict = req.modelDump();
            const apis = [];
            for (const code of (req.target_apis || [])) {
                const instance = api_enum_1.APIEnum.getInstance(code, reqDict, converted);
                apis.push(instance);
            }
            const tasks = apis.map(api => api.exchange());
            const apiResults = await Promise.all(tasks);
            const mapUrl = (0, map_url_generator_1.buildMapUrl)(c.lat, c.lon, req.target_apis || [], reqDict);
            if (req.save_file) {
                const nowStr = new Date().toISOString().replace(/[:\-T]/g, "").slice(0, 12); // YYYYMMDDHHmm
                const outputDir = (req.output_dir && req.output_dir.trim()) ? req.output_dir.trim() : baseOutputFolder;
                const outputFolder = path.join(outputDir, nowStr);
                fs.mkdirSync(outputFolder, { recursive: true });
                filePaths = [];
                for (let idx = 0; idx < apiResults.length; idx++) {
                    const result = apiResults[idx];
                    if (!result)
                        continue;
                    let payloadToWrite = result;
                    let fileName = `api_result_${idx + 1}.geojson`;
                    if (typeof result === 'object' && result !== null) {
                        if (result.file_name && typeof result.file_name === 'string' && result.file_name.trim()) {
                            fileName = result.file_name.trim();
                        }
                        if ('data' in result) {
                            const data = result.data;
                            if (data === null || data === undefined)
                                continue;
                            if (Array.isArray(data) && data.length === 0)
                                continue;
                            if (typeof data === 'object') {
                                if (data.features && Array.isArray(data.features) && data.features.length === 0)
                                    continue;
                            }
                            payloadToWrite = data;
                        }
                    }
                    const filePath = path.join(outputFolder, fileName);
                    try {
                        if (typeof payloadToWrite === 'object') {
                            fs.writeFileSync(filePath, JSON.stringify(payloadToWrite, null, 2), "utf-8");
                        }
                        else {
                            fs.writeFileSync(filePath, String(payloadToWrite), "utf-8");
                        }
                        filePaths.push(filePath);
                    }
                    catch (e) {
                        console.error(`ファイル保存失敗: ${filePath}`, e);
                        filePaths.push(null);
                    }
                }
            }
            finalResult = {
                input: { lat: c.lat, lon: c.lon },
                api_results: apiResults,
                map_url: mapUrl,
                saved_file_paths: filePaths,
            };
        }
        return finalResult;
    }
}
exports.GeospatialService = GeospatialService;
//# sourceMappingURL=geospatial_service.js.map