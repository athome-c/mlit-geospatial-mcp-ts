"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePolygonApi = exports.BasePointApi = exports.BaseRealEstateApi = exports.BaseApi = void 0;
const point_filter_1 = require("../../common/point_filter");
const polygon_filter_1 = require("../../common/polygon_filter");
const requester_1 = require("../../common/requester");
const const_1 = require("../../../utils/const");
class BaseApi {
    reqBody;
    converted;
    constructor(reqBody, converted, ...args) {
        this.reqBody = reqBody;
        this.converted = converted;
    }
}
exports.BaseApi = BaseApi;
class BaseRealEstateApi extends BaseApi {
    async exchange() {
        try {
            const rawData = await this._callApi();
            const processedData = await this._processData(rawData);
            if (processedData === null || processedData === undefined) {
                return null;
            }
            return {
                file_name: `${this.API_CONFIG.name}.geojson`,
                data: processedData,
            };
        }
        catch (e) {
            console.error(`${this.API_CONFIG.name} exchange エラー:`, e);
            return null;
        }
    }
}
exports.BaseRealEstateApi = BaseRealEstateApi;
class BasePointApi extends BaseRealEstateApi {
    API_CONFIG; // Should be set by subclasses
    async _callApi() {
        const tiles = (0, point_filter_1.getSurroundingTiles)(this.converted.x, this.converted.y, this.converted.x_frac, this.converted.y_frac);
        const mergedGeojson = { type: "FeatureCollection", features: [] };
        for (const [x, y] of tiles) {
            const params = this._buildParams(x, y);
            try {
                const response = await (0, requester_1.get)(this.API_CONFIG.path, params, this.API_CONFIG.response_type, {
                    "Ocp-Apim-Subscription-Key": `${const_1.LIBRARY_API_KEY}`,
                    "Accept": "*/*",
                });
                if (response && response.features && Array.isArray(response.features)) {
                    mergedGeojson.features.push(...response.features);
                }
            }
            catch (e) {
                console.error(`${this.API_CONFIG.name} 呼び出し失敗:`, e);
                throw e;
            }
        }
        return mergedGeojson;
    }
    _buildParams(x, y) {
        return { response_format: "geojson", z: const_1.ZOOM, x, y };
    }
    async _processData(data) {
        if (!data || !data.features || data.features.length === 0) {
            console.info(`${this.API_CONFIG.name}の該当データなし`);
            return null;
        }
        const distance = this.reqBody.distance;
        const filteredFeatures = (0, point_filter_1.filterDistance)(data.features, [this.converted.lat, this.converted.lon], distance);
        if (!filteredFeatures || filteredFeatures.length === 0) {
            console.info(`${this.API_CONFIG.name}の該当データなし（絞り込み後）`);
            return null;
        }
        data.features = filteredFeatures;
        return data;
    }
}
exports.BasePointApi = BasePointApi;
class BasePolygonApi extends BaseRealEstateApi {
    API_CONFIG; // Should be set by subclasses
    async _callApi() {
        const params = this._buildParams();
        return await (0, requester_1.get)(this.API_CONFIG.path, params, this.API_CONFIG.response_type, {
            "Ocp-Apim-Subscription-Key": `${const_1.LIBRARY_API_KEY}`,
            "Accept": "*/*",
        });
    }
    _buildParams() {
        return {
            response_format: "geojson",
            z: const_1.ZOOM,
            x: this.converted.x,
            y: this.converted.y,
        };
    }
    async _processData(data) {
        if (!data || !data.features || data.features.length === 0) {
            console.info(`${this.API_CONFIG.name}の該当データなし`);
            return null;
        }
        const filteredFeatures = (0, polygon_filter_1.overlapJudge)(data.features, [this.converted.lat, this.converted.lon]);
        if (!filteredFeatures || filteredFeatures.length === 0) {
            console.info(`${this.API_CONFIG.name}の該当データなし（絞り込み後）`);
            return null;
        }
        data.features = filteredFeatures;
        return data;
    }
}
exports.BasePolygonApi = BasePolygonApi;
//# sourceMappingURL=base_api.js.map