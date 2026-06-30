"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealEstateApi25 = exports.RealEstateApi24 = exports.RealEstateApi23 = exports.RealEstateApi22 = exports.RealEstateApi21 = exports.RealEstateApi20 = exports.RealEstateApi19 = exports.RealEstateApi18 = exports.RealEstateApi17 = exports.RealEstateApi16 = exports.RealEstateApi15 = exports.RealEstateApi14 = exports.RealEstateApi13 = exports.RealEstateApi12 = exports.RealEstateApi11 = exports.RealEstateApi10 = exports.RealEstateApi9 = exports.RealEstateApi8 = exports.RealEstateApi7 = exports.RealEstateApi6 = exports.RealEstateApi5 = exports.RealEstateApi4 = exports.RealEstateApi3 = exports.RealEstateApi2 = exports.RealEstateApi1 = void 0;
const base_api_1 = require("./base_api");
const const_1 = require("../../../utils/const");
const requester_1 = require("../../common/requester");
const change_address_1 = require("../../common/change_address");
const geocoder_1 = require("../../../utils/geocoder");
const point_filter_1 = require("../../common/point_filter");
const point_filter_2 = require("../../common/point_filter");
// We implement RealEstateApi1 manually
class RealEstateApi1 extends base_api_1.BaseRealEstateApi {
    API_CONFIG = {
        name: "不動産取引価格（取引価格・成約価格）情報",
        path: `${const_1.LIBRARY_API_URL}/XIT001`,
        response_type: "json"
    };
    async _callApi() {
        const headers = {
            "Ocp-Apim-Subscription-Key": `${const_1.LIBRARY_API_KEY}`,
            "Accept": "*/*"
        };
        const params = {
            year: this.reqBody.year,
            city: this.converted.muni_cd,
        };
        const optionalParamMapping = {
            priceClassification: "price_classification",
            quarter: "quarter",
            language: "language"
        };
        for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
            const value = this.reqBody[reqKey];
            if (value !== undefined && value !== null) {
                params[apiKey] = value;
            }
        }
        return await (0, requester_1.get)(this.API_CONFIG.path, params, this.API_CONFIG.response_type, headers);
    }
    async _processData(data) {
        if (!data || !data.data) {
            console.info("APIから有効なデータが取得できませんでした。");
            return null;
        }
        const prefecture = (0, change_address_1.getPrefName)(this.converted.muni_cd);
        const municipality = await (0, change_address_1.getCityname)(this.converted.muni_cd) || "";
        const district_name = (0, change_address_1.getDistrictName)(this.converted.lv_01_nm || "");
        const fullAddr = `${prefecture}${municipality}${district_name}`;
        const filterData = data.data.filter((item) => item.Prefecture === prefecture &&
            item.Municipality === municipality &&
            item.DistrictName === district_name);
        if (filterData.length === 0) {
            return null;
        }
        const coordinates = await (0, geocoder_1.getLatlon)(fullAddr);
        if (!coordinates[0]) {
            return null;
        }
        const features = filterData.map((item) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates },
            properties: item
        }));
        return { type: "FeatureCollection", features };
    }
}
exports.RealEstateApi1 = RealEstateApi1;
// RealEstateApi2
class RealEstateApi2 extends base_api_1.BaseRealEstateApi {
    API_CONFIG = {
        name: "鑑定評価書情報",
        path: `${const_1.LIBRARY_API_URL}/XCT001`,
        response_type: "json"
    };
    async _callApi() {
        const divisions = this.reqBody.division || [null];
        const results = { data: [] };
        const area = String(this.converted.muni_cd).substring(0, 2);
        for (const div of divisions) {
            const headers = {
                "Ocp-Apim-Subscription-Key": `${const_1.LIBRARY_API_KEY}`,
                "Accept": "*/*"
            };
            const params = { year: this.reqBody.year, area };
            if (div !== null) {
                params.division = div;
            }
            try {
                const response = await (0, requester_1.get)(this.API_CONFIG.path, params, this.API_CONFIG.response_type, headers);
                if (response && response.data && Array.isArray(response.data)) {
                    results.data.push(...response.data);
                }
            }
            catch (e) { /* ignore */ }
        }
        return results;
    }
    async _processData(data) {
        if (!data || !data.data || data.data.length === 0)
            return null;
        const features = data.data.map((item) => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [parseFloat(item["位置座標 経度"]), parseFloat(item["位置座標 緯度"])]
            },
            properties: item
        }));
        const distance = this.reqBody.distance;
        const filteredFeatures = (0, point_filter_1.filterDistance)(features, [this.converted.lat, this.converted.lon], distance);
        if (!filteredFeatures || filteredFeatures.length === 0)
            return null;
        return { type: "FeatureCollection", features: filteredFeatures };
    }
}
exports.RealEstateApi2 = RealEstateApi2;
// RealEstateApi3
class RealEstateApi3 extends base_api_1.BasePointApi {
    API_CONFIG = {
        name: "地価公示・地価調査のポイント（点）",
        path: `${const_1.LIBRARY_API_URL}/XPT002`,
        response_type: "geojson"
    };
    async _callApi() {
        const tiles = (0, point_filter_2.getSurroundingTiles)(this.converted.x, this.converted.y, this.converted.x_frac, this.converted.y_frac);
        const ObjectRet = { type: "FeatureCollection", features: [] };
        for (const [x, y] of tiles) {
            const params = { response_format: "geojson", z: const_1.ZOOM, x, y, year: this.reqBody.year };
            const optionalParamMapping = {
                priceClassification: "land_price_classification",
                useCategoryCode: "use_category_code"
            };
            for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
                const value = this.reqBody[reqKey];
                if (value !== undefined && value !== null) {
                    params[apiKey] = Array.isArray(value) ? value.join(",") : value;
                }
            }
            try {
                const headers = { "Ocp-Apim-Subscription-Key": `${const_1.LIBRARY_API_KEY}`, "Accept": "*/*" };
                const response = await (0, requester_1.get)(this.API_CONFIG.path, params, this.API_CONFIG.response_type, headers);
                if (response && response.features && Array.isArray(response.features)) {
                    ObjectRet.features.push(...response.features);
                }
            }
            catch (e) { }
        }
        return ObjectRet;
    }
}
exports.RealEstateApi3 = RealEstateApi3;
// RealEstateApi4
class RealEstateApi4 extends base_api_1.BasePolygonApi {
    API_CONFIG = {
        name: "都市計画決定GISデータ（都市計画区域_区域区分）",
        path: `${const_1.LIBRARY_API_URL}/XKT001`,
        response_type: "geojson"
    };
}
exports.RealEstateApi4 = RealEstateApi4;
// RealEstateApi5
class RealEstateApi5 extends base_api_1.BasePolygonApi {
    API_CONFIG = {
        name: "都市計画決定GISデータ（用途地域）",
        path: `${const_1.LIBRARY_API_URL}/XKT002`,
        response_type: "geojson"
    };
}
exports.RealEstateApi5 = RealEstateApi5;
// RealEstateApi6
class RealEstateApi6 extends base_api_1.BasePolygonApi {
    API_CONFIG = {
        name: "都市計画決定GISデータ（立地適正化計画）",
        path: `${const_1.LIBRARY_API_URL}/XKT003`,
        response_type: "geojson"
    };
}
exports.RealEstateApi6 = RealEstateApi6;
// RealEstateApi7
class RealEstateApi7 extends base_api_1.BasePolygonApi {
    API_CONFIG = {
        name: "国土数値情報（小学校区）",
        path: `${const_1.LIBRARY_API_URL}/XKT007`,
        response_type: "geojson"
    };
    _buildParams() {
        const params = super._buildParams();
        const optionalParamMapping = {
            administrativeAreaCode: "administrative_area_code",
        };
        for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
            const value = this.reqBody[reqKey];
            if (value !== undefined && value !== null) {
                let strValue = Array.isArray(value) ? value.map((v) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
                params[apiKey] = Array.isArray(value) ? value.join(',') : value;
            }
        }
        return params;
    }
}
exports.RealEstateApi7 = RealEstateApi7;
// RealEstateApi8
class RealEstateApi8 extends base_api_1.BasePolygonApi {
    API_CONFIG = {
        name: "国土数値情報（中学校区）",
        path: `${const_1.LIBRARY_API_URL}/XKT008`,
        response_type: "geojson"
    };
    _buildParams() {
        const params = super._buildParams();
        const optionalParamMapping = {
            administrativeAreaCode: "administrative_area_code",
        };
        for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
            const value = this.reqBody[reqKey];
            if (value !== undefined && value !== null) {
                let strValue = Array.isArray(value) ? value.map((v) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
                params[apiKey] = Array.isArray(value) ? value.join(',') : value;
            }
        }
        return params;
    }
}
exports.RealEstateApi8 = RealEstateApi8;
// RealEstateApi9
class RealEstateApi9 extends base_api_1.BasePointApi {
    API_CONFIG = {
        name: "国土数値情報（学校）",
        path: `${const_1.LIBRARY_API_URL}/XKT009`,
        response_type: "geojson"
    };
}
exports.RealEstateApi9 = RealEstateApi9;
// RealEstateApi10
class RealEstateApi10 extends base_api_1.BasePointApi {
    API_CONFIG = {
        name: "国土数値情報（保育園・幼稚園等）",
        path: `${const_1.LIBRARY_API_URL}/XKT010`,
        response_type: "geojson"
    };
}
exports.RealEstateApi10 = RealEstateApi10;
// RealEstateApi11
class RealEstateApi11 extends base_api_1.BasePointApi {
    API_CONFIG = {
        name: "国土数値情報（医療機関）",
        path: `${const_1.LIBRARY_API_URL}/XKT011`,
        response_type: "geojson"
    };
}
exports.RealEstateApi11 = RealEstateApi11;
// RealEstateApi12
class RealEstateApi12 extends base_api_1.BasePointApi {
    API_CONFIG = {
        name: "国土数値情報（福祉施設）",
        path: `${const_1.LIBRARY_API_URL}/XKT012`,
        response_type: "geojson"
    };
    _buildParams(x, y) {
        const params = super._buildParams(x, y);
        const optionalParamMapping = {
            administrativeAreaCode: "administrative_area_code",
            welfareFacilityClassCode: "welfare_facility_class_code",
            welfareFacilityMiddleClassCode: "welfare_facility_middle_class_code",
            welfareFacilityMinorClassCode: "welfare_facility_minor_class_code",
        };
        for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
            const value = this.reqBody[reqKey];
            if (value !== undefined && value !== null) {
                let strValue = Array.isArray(value) ? value.map((v) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
                params[apiKey] = Array.isArray(value) ? value.join(',') : value;
            }
        }
        return params;
    }
}
exports.RealEstateApi12 = RealEstateApi12;
// RealEstateApi13
class RealEstateApi13 extends base_api_1.BasePolygonApi {
    API_CONFIG = {
        name: "国土数値情報（将来推計人口250mメッシュ）",
        path: `${const_1.LIBRARY_API_URL}/XKT013`,
        response_type: "geojson"
    };
}
exports.RealEstateApi13 = RealEstateApi13;
// RealEstateApi14
class RealEstateApi14 extends base_api_1.BasePolygonApi {
    API_CONFIG = {
        name: "都市計画決定GISデータ（防火・準防火地域）",
        path: `${const_1.LIBRARY_API_URL}/XKT014`,
        response_type: "geojson"
    };
}
exports.RealEstateApi14 = RealEstateApi14;
// RealEstateApi15
class RealEstateApi15 extends base_api_1.BasePointApi {
    API_CONFIG = {
        name: "国土数値情報（駅別乗降客数）",
        path: `${const_1.LIBRARY_API_URL}/XKT015`,
        response_type: "geojson"
    };
}
exports.RealEstateApi15 = RealEstateApi15;
// RealEstateApi16
class RealEstateApi16 extends base_api_1.BasePolygonApi {
    API_CONFIG = {
        name: "国土数値情報（災害危険区域）",
        path: `${const_1.LIBRARY_API_URL}/XKT016`,
        response_type: "geojson"
    };
    _buildParams() {
        const params = super._buildParams();
        const optionalParamMapping = {
            administrativeAreaCode: "administrative_area_code",
        };
        for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
            const value = this.reqBody[reqKey];
            if (value !== undefined && value !== null) {
                let strValue = Array.isArray(value) ? value.map((v) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
                params[apiKey] = Array.isArray(value) ? value.join(',') : value;
            }
        }
        return params;
    }
}
exports.RealEstateApi16 = RealEstateApi16;
// RealEstateApi17
class RealEstateApi17 extends base_api_1.BasePointApi {
    API_CONFIG = {
        name: "国土数値情報（図書館）",
        path: `${const_1.LIBRARY_API_URL}/XKT017`,
        response_type: "geojson"
    };
    _buildParams(x, y) {
        const params = super._buildParams(x, y);
        const optionalParamMapping = {
            administrativeAreaCode: "administrative_area_code",
        };
        for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
            const value = this.reqBody[reqKey];
            if (value !== undefined && value !== null) {
                let strValue = Array.isArray(value) ? value.map((v) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
                params[apiKey] = Array.isArray(value) ? value.join(',') : value;
            }
        }
        return params;
    }
}
exports.RealEstateApi17 = RealEstateApi17;
// RealEstateApi18
class RealEstateApi18 extends base_api_1.BasePointApi {
    API_CONFIG = {
        name: "国土数値情報（市区町村役場及び集会施設等）",
        path: `${const_1.LIBRARY_API_URL}/XKT018`,
        response_type: "geojson"
    };
}
exports.RealEstateApi18 = RealEstateApi18;
// RealEstateApi19
class RealEstateApi19 extends base_api_1.BasePolygonApi {
    API_CONFIG = {
        name: "国土数値情報（自然公園地域）",
        path: `${const_1.LIBRARY_API_URL}/XKT019`,
        response_type: "geojson"
    };
    _buildParams() {
        const params = super._buildParams();
        const optionalParamMapping = {
            prefectureCode: "prefecture_code",
            districtCode: "district_code",
        };
        for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
            const value = this.reqBody[reqKey];
            if (value !== undefined && value !== null) {
                let strValue = Array.isArray(value) ? value.map((v) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
                // Handle zero stripping if needed, but python code lstrips zeros for API19
                params[apiKey] = Array.isArray(value) ? value.map((v) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
            }
        }
        return params;
    }
}
exports.RealEstateApi19 = RealEstateApi19;
// RealEstateApi20
class RealEstateApi20 extends base_api_1.BasePolygonApi {
    API_CONFIG = {
        name: "国土数値情報（大規模盛土造成地マップ）",
        path: `${const_1.LIBRARY_API_URL}/XKT020`,
        response_type: "geojson"
    };
}
exports.RealEstateApi20 = RealEstateApi20;
// RealEstateApi21
class RealEstateApi21 extends base_api_1.BasePolygonApi {
    API_CONFIG = {
        name: "国土数値情報（地すべり防止地区）",
        path: `${const_1.LIBRARY_API_URL}/XKT021`,
        response_type: "geojson"
    };
    _buildParams() {
        const params = super._buildParams();
        const optionalParamMapping = {
            prefectureCode: "prefecture_code",
            administrativeAreaCode: "administrative_area_code",
        };
        for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
            const value = this.reqBody[reqKey];
            if (value !== undefined && value !== null) {
                let strValue = Array.isArray(value) ? value.map((v) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
                // Handle zero stripping if needed, but python code lstrips zeros for API19
                params[apiKey] = Array.isArray(value) ? value.map((v) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
            }
        }
        return params;
    }
}
exports.RealEstateApi21 = RealEstateApi21;
// RealEstateApi22
class RealEstateApi22 extends base_api_1.BasePolygonApi {
    API_CONFIG = {
        name: "国土数値情報（急傾斜地崩壊危険区域）",
        path: `${const_1.LIBRARY_API_URL}/XKT022`,
        response_type: "geojson"
    };
    _buildParams() {
        const params = super._buildParams();
        const optionalParamMapping = {
            prefectureCode: "prefecture_code",
            administrativeAreaCode: "administrative_area_code",
        };
        for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
            const value = this.reqBody[reqKey];
            if (value !== undefined && value !== null) {
                let strValue = Array.isArray(value) ? value.map((v) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
                // Handle zero stripping if needed, but python code lstrips zeros for API19
                params[apiKey] = Array.isArray(value) ? value.map((v) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
            }
        }
        return params;
    }
}
exports.RealEstateApi22 = RealEstateApi22;
// RealEstateApi23
class RealEstateApi23 extends base_api_1.BasePolygonApi {
    API_CONFIG = {
        name: "都市計画決定GISデータ（地区計画）",
        path: `${const_1.LIBRARY_API_URL}/XKT023`,
        response_type: "geojson"
    };
}
exports.RealEstateApi23 = RealEstateApi23;
// RealEstateApi24
class RealEstateApi24 extends base_api_1.BasePolygonApi {
    API_CONFIG = {
        name: "都市計画決定GISデータ（高度利用地区）",
        path: `${const_1.LIBRARY_API_URL}/XKT024`,
        response_type: "geojson"
    };
}
exports.RealEstateApi24 = RealEstateApi24;
// RealEstateApi25
class RealEstateApi25 extends base_api_1.BasePolygonApi {
    API_CONFIG = {
        name: "国土交通省都市局（地形区分に基づく液状化の発生傾向図）",
        path: `${const_1.LIBRARY_API_URL}/XKT025`,
        response_type: "geojson"
    };
}
exports.RealEstateApi25 = RealEstateApi25;
//# sourceMappingURL=apiRegistry.js.map