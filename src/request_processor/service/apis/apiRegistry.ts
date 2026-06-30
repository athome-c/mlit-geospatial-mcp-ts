import { BaseRealEstateApi, BasePointApi, BasePolygonApi } from './base_api';
import { LIBRARY_API_URL, LIBRARY_API_KEY, ZOOM } from '../../../utils/const';
import { get } from '../../common/requester';
import { getPrefName, getCityname, getDistrictName } from '../../common/change_address';
import { getLatlon } from '../../../utils/geocoder';
import { filterDistance } from '../../common/point_filter';
import { getSurroundingTiles } from '../../common/point_filter';

// We implement RealEstateApi1 manually
export class RealEstateApi1 extends BaseRealEstateApi {
  API_CONFIG = {
    name: "不動産取引価格（取引価格・成約価格）情報",
    path: `${LIBRARY_API_URL}/XIT001`,
    response_type: "json"
  };

  async _callApi(): Promise<any> {
    const headers = {
      "Ocp-Apim-Subscription-Key": `${LIBRARY_API_KEY}`,
      "Accept": "*/*"
    };

    const params: any = {
      year: this.reqBody.year,
      city: this.converted.muni_cd,
    };

    const optionalParamMapping: any = {
      priceClassification: "price_classification",
      quarter: "quarter",
      language: "language"
    };

    for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
      const value = this.reqBody[reqKey as string];
      if (value !== undefined && value !== null) {
        params[apiKey] = value;
      }
    }

    return await get(this.API_CONFIG.path, params, this.API_CONFIG.response_type, headers);
  }

  async _processData(data: any): Promise<any> {
    if (!data || !data.data) {
      console.info("APIから有効なデータが取得できませんでした。");
      return null;
    }

    const prefecture = getPrefName(this.converted.muni_cd);
    const municipality = await getCityname(this.converted.muni_cd) || "";
    const district_name = getDistrictName(this.converted.lv_01_nm || "");
    const fullAddr = `${prefecture}${municipality}${district_name}`;

    const filterData = data.data.filter((item: any) => {
      // console.log(`Checking item: ${item.Prefecture} ${item.Municipality} ${item.DistrictName}`);
      // For designated cities (e.g. Nagoya), API 1 returns '名古屋市中区' but XIT002 returns '中区'. 
      // Using includes() fixes this.
      return item.Prefecture === prefecture &&
        (item.Municipality === municipality || item.Municipality.endsWith(municipality)) &&
        item.DistrictName === district_name;
    });

    console.log(`Pre-filter count: ${data.data.length}, Post-filter count: ${filterData.length}`);
    console.log(`Searching for: ${prefecture} ${municipality} ${district_name}`);
    if (data.data.length > 0) {
      console.log(`First item: ${data.data[0].Prefecture} ${data.data[0].Municipality} ${data.data[0].DistrictName}`);
    }

    if (filterData.length === 0) {
      return null;
    }

    const coordinates = await getLatlon(fullAddr);
    if (!coordinates[0]) {
      return null;
    }

    const features = filterData.map((item: any) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates },
      properties: item
    }));

    return { type: "FeatureCollection", features };
  }
}

// RealEstateApi2
export class RealEstateApi2 extends BaseRealEstateApi {
  API_CONFIG = {
    name: "鑑定評価書情報",
    path: `${LIBRARY_API_URL}/XCT001`,
    response_type: "json"
  };

  async _callApi(): Promise<any> {
    const divisions = this.reqBody.division || [null];
    const results = { data: [] as any[] };
    const area = String(this.converted.muni_cd).substring(0, 2);

    for (const div of divisions) {
      const headers = {
        "Ocp-Apim-Subscription-Key": `${LIBRARY_API_KEY}`,
        "Accept": "*/*"
      };
      const params: any = { year: this.reqBody.year, area };
      if (div !== null) {
        params.division = div;
      }

      try {
        const response = await get(this.API_CONFIG.path, params, this.API_CONFIG.response_type, headers);
        if (response && response.data && Array.isArray(response.data)) {
          results.data.push(...response.data);
        }
      } catch (e) { /* ignore */ }
    }
    return results;
  }

  async _processData(data: any): Promise<any> {
    if (!data || !data.data || data.data.length === 0) return null;

    const features = data.data.map((item: any) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [parseFloat(item["位置座標 経度"]), parseFloat(item["位置座標 緯度"])]
      },
      properties: item
    }));

    const distance = this.reqBody.distance;
    const filteredFeatures = filterDistance(features, [this.converted.lat, this.converted.lon], distance);
    if (!filteredFeatures || filteredFeatures.length === 0) return null;

    return { type: "FeatureCollection", features: filteredFeatures };
  }
}

// RealEstateApi3
export class RealEstateApi3 extends BasePointApi {
  API_CONFIG = {
    name: "地価公示・地価調査のポイント（点）",
    path: `${LIBRARY_API_URL}/XPT002`,
    response_type: "geojson"
  };

  async _callApi(): Promise<any> {
    const tiles = getSurroundingTiles(this.converted.x, this.converted.y, this.converted.x_frac, this.converted.y_frac);
    const ObjectRet = { type: "FeatureCollection", features: [] as any[] };

    for (const [x, y] of tiles) {
      const params: any = { response_format: "geojson", z: ZOOM, x, y, year: this.reqBody.year };

      const optionalParamMapping: any = {
        priceClassification: "land_price_classification",
        useCategoryCode: "use_category_code"
      };

      for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
        const value = this.reqBody[reqKey as string];
        if (value !== undefined && value !== null) {
          params[apiKey] = Array.isArray(value) ? value.join(",") : value;
        }
      }

      try {
        const headers = { "Ocp-Apim-Subscription-Key": `${LIBRARY_API_KEY}`, "Accept": "*/*" };
        const response: any = await get(this.API_CONFIG.path, params, this.API_CONFIG.response_type, headers);
        if (response && response.features && Array.isArray(response.features)) {
          ObjectRet.features.push(...response.features);
        }
      } catch (e) { }
    }
    return ObjectRet;
  }
}

// RealEstateApi4
export class RealEstateApi4 extends BasePolygonApi {
  API_CONFIG = {
    name: "都市計画決定GISデータ（都市計画区域_区域区分）",
    path: `${LIBRARY_API_URL}/XKT001`,
    response_type: "geojson"
  };
}

// RealEstateApi5
export class RealEstateApi5 extends BasePolygonApi {
  API_CONFIG = {
    name: "都市計画決定GISデータ（用途地域）",
    path: `${LIBRARY_API_URL}/XKT002`,
    response_type: "geojson"
  };
}

// RealEstateApi6
export class RealEstateApi6 extends BasePolygonApi {
  API_CONFIG = {
    name: "都市計画決定GISデータ（立地適正化計画）",
    path: `${LIBRARY_API_URL}/XKT003`,
    response_type: "geojson"
  };
}

// RealEstateApi7
export class RealEstateApi7 extends BasePolygonApi {
  API_CONFIG = {
    name: "国土数値情報（小学校区）",
    path: `${LIBRARY_API_URL}/XKT007`,
    response_type: "geojson"
  };
  _buildParams() {
    const params = super._buildParams();
    const optionalParamMapping: any = {
      administrativeAreaCode: "administrative_area_code",
    };
    for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
      const value = this.reqBody[reqKey as string];
      if (value !== undefined && value !== null) {
        let strValue = Array.isArray(value) ? value.map((v: any) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
        params[apiKey] = Array.isArray(value) ? value.join(',') : value;
      }
    }
    return params;
  }
}

// RealEstateApi8
export class RealEstateApi8 extends BasePolygonApi {
  API_CONFIG = {
    name: "国土数値情報（中学校区）",
    path: `${LIBRARY_API_URL}/XKT008`,
    response_type: "geojson"
  };
  _buildParams() {
    const params = super._buildParams();
    const optionalParamMapping: any = {
      administrativeAreaCode: "administrative_area_code",
    };
    for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
      const value = this.reqBody[reqKey as string];
      if (value !== undefined && value !== null) {
        let strValue = Array.isArray(value) ? value.map((v: any) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
        params[apiKey] = Array.isArray(value) ? value.join(',') : value;
      }
    }
    return params;
  }
}

// RealEstateApi9
export class RealEstateApi9 extends BasePointApi {
  API_CONFIG = {
    name: "国土数値情報（学校）",
    path: `${LIBRARY_API_URL}/XKT009`,
    response_type: "geojson"
  };
}

// RealEstateApi10
export class RealEstateApi10 extends BasePointApi {
  API_CONFIG = {
    name: "国土数値情報（保育園・幼稚園等）",
    path: `${LIBRARY_API_URL}/XKT010`,
    response_type: "geojson"
  };
}

// RealEstateApi11
export class RealEstateApi11 extends BasePointApi {
  API_CONFIG = {
    name: "国土数値情報（医療機関）",
    path: `${LIBRARY_API_URL}/XKT011`,
    response_type: "geojson"
  };
}

// RealEstateApi12
export class RealEstateApi12 extends BasePointApi {
  API_CONFIG = {
    name: "国土数値情報（福祉施設）",
    path: `${LIBRARY_API_URL}/XKT012`,
    response_type: "geojson"
  };
  _buildParams(x: number, y: number) {
    const params = super._buildParams(x, y);
    const optionalParamMapping: any = {
      administrativeAreaCode: "administrative_area_code",
      welfareFacilityClassCode: "welfare_facility_class_code",
      welfareFacilityMiddleClassCode: "welfare_facility_middle_class_code",
      welfareFacilityMinorClassCode: "welfare_facility_minor_class_code",
    };
    for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
      const value = this.reqBody[reqKey as string];
      if (value !== undefined && value !== null) {
        let strValue = Array.isArray(value) ? value.map((v: any) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
        params[apiKey] = Array.isArray(value) ? value.join(',') : value;
      }
    }
    return params;
  }
}

// RealEstateApi13
export class RealEstateApi13 extends BasePolygonApi {
  API_CONFIG = {
    name: "国土数値情報（将来推計人口250mメッシュ）",
    path: `${LIBRARY_API_URL}/XKT013`,
    response_type: "geojson"
  };
}

// RealEstateApi14
export class RealEstateApi14 extends BasePolygonApi {
  API_CONFIG = {
    name: "都市計画決定GISデータ（防火・準防火地域）",
    path: `${LIBRARY_API_URL}/XKT014`,
    response_type: "geojson"
  };
}

// RealEstateApi15
export class RealEstateApi15 extends BasePointApi {
  API_CONFIG = {
    name: "国土数値情報（駅別乗降客数）",
    path: `${LIBRARY_API_URL}/XKT015`,
    response_type: "geojson"
  };
}

// RealEstateApi16
export class RealEstateApi16 extends BasePolygonApi {
  API_CONFIG = {
    name: "国土数値情報（災害危険区域）",
    path: `${LIBRARY_API_URL}/XKT016`,
    response_type: "geojson"
  };
  _buildParams() {
    const params = super._buildParams();
    const optionalParamMapping: any = {
      administrativeAreaCode: "administrative_area_code",
    };
    for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
      const value = this.reqBody[reqKey as string];
      if (value !== undefined && value !== null) {
        let strValue = Array.isArray(value) ? value.map((v: any) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
        params[apiKey] = Array.isArray(value) ? value.join(',') : value;
      }
    }
    return params;
  }
}

// RealEstateApi17
export class RealEstateApi17 extends BasePointApi {
  API_CONFIG = {
    name: "国土数値情報（図書館）",
    path: `${LIBRARY_API_URL}/XKT017`,
    response_type: "geojson"
  };
  _buildParams(x: number, y: number) {
    const params = super._buildParams(x, y);
    const optionalParamMapping: any = {
      administrativeAreaCode: "administrative_area_code",
    };
    for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
      const value = this.reqBody[reqKey as string];
      if (value !== undefined && value !== null) {
        let strValue = Array.isArray(value) ? value.map((v: any) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
        params[apiKey] = Array.isArray(value) ? value.join(',') : value;
      }
    }
    return params;
  }
}

// RealEstateApi18
export class RealEstateApi18 extends BasePointApi {
  API_CONFIG = {
    name: "国土数値情報（市区町村役場及び集会施設等）",
    path: `${LIBRARY_API_URL}/XKT018`,
    response_type: "geojson"
  };
}

// RealEstateApi19
export class RealEstateApi19 extends BasePolygonApi {
  API_CONFIG = {
    name: "国土数値情報（自然公園地域）",
    path: `${LIBRARY_API_URL}/XKT019`,
    response_type: "geojson"
  };
  _buildParams() {
    const params = super._buildParams();
    const optionalParamMapping: any = {
      prefectureCode: "prefecture_code",
      districtCode: "district_code",
    };
    for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
      const value = this.reqBody[reqKey as string];
      if (value !== undefined && value !== null) {
        let strValue = Array.isArray(value) ? value.map((v: any) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
        // Handle zero stripping if needed, but python code lstrips zeros for API19
        params[apiKey] = Array.isArray(value) ? value.map((v: any) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
      }
    }
    return params;
  }
}

// RealEstateApi20
export class RealEstateApi20 extends BasePolygonApi {
  API_CONFIG = {
    name: "国土数値情報（大規模盛土造成地マップ）",
    path: `${LIBRARY_API_URL}/XKT020`,
    response_type: "geojson"
  };
}

// RealEstateApi21
export class RealEstateApi21 extends BasePolygonApi {
  API_CONFIG = {
    name: "国土数値情報（地すべり防止地区）",
    path: `${LIBRARY_API_URL}/XKT021`,
    response_type: "geojson"
  };
  _buildParams() {
    const params = super._buildParams();
    const optionalParamMapping: any = {
      prefectureCode: "prefecture_code",
      administrativeAreaCode: "administrative_area_code",
    };
    for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
      const value = this.reqBody[reqKey as string];
      if (value !== undefined && value !== null) {
        let strValue = Array.isArray(value) ? value.map((v: any) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
        // Handle zero stripping if needed, but python code lstrips zeros for API19
        params[apiKey] = Array.isArray(value) ? value.map((v: any) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
      }
    }
    return params;
  }
}

// RealEstateApi22
export class RealEstateApi22 extends BasePolygonApi {
  API_CONFIG = {
    name: "国土数値情報（急傾斜地崩壊危険区域）",
    path: `${LIBRARY_API_URL}/XKT022`,
    response_type: "geojson"
  };
  _buildParams() {
    const params = super._buildParams();
    const optionalParamMapping: any = {
      prefectureCode: "prefecture_code",
      administrativeAreaCode: "administrative_area_code",
    };
    for (const [apiKey, reqKey] of Object.entries(optionalParamMapping)) {
      const value = this.reqBody[reqKey as string];
      if (value !== undefined && value !== null) {
        let strValue = Array.isArray(value) ? value.map((v: any) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
        // Handle zero stripping if needed, but python code lstrips zeros for API19
        params[apiKey] = Array.isArray(value) ? value.map((v: any) => String(v).replace(/^0+/, '')).join(',') : String(value).replace(/^0+/, '');
      }
    }
    return params;
  }
}

// RealEstateApi23
export class RealEstateApi23 extends BasePolygonApi {
  API_CONFIG = {
    name: "都市計画決定GISデータ（地区計画）",
    path: `${LIBRARY_API_URL}/XKT023`,
    response_type: "geojson"
  };
}

// RealEstateApi24
export class RealEstateApi24 extends BasePolygonApi {
  API_CONFIG = {
    name: "都市計画決定GISデータ（高度利用地区）",
    path: `${LIBRARY_API_URL}/XKT024`,
    response_type: "geojson"
  };
}

// RealEstateApi25
export class RealEstateApi25 extends BasePolygonApi {
  API_CONFIG = {
    name: "国土交通省都市局（地形区分に基づく液状化の発生傾向図）",
    path: `${LIBRARY_API_URL}/XKT025`,
    response_type: "geojson"
  };
}

