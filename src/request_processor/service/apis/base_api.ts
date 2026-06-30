import { getSurroundingTiles, filterDistance } from '../../common/point_filter';
import { overlapJudge } from '../../common/polygon_filter';
import { get } from '../../common/requester';
import { LIBRARY_API_KEY, ZOOM } from '../../../utils/const';

export interface ApiConfig {
    name: string;
    path: string;
    response_type: string;
}

export abstract class BaseApi {
    reqBody: any;
    converted: any;

    constructor(reqBody: any, converted: any, ...args: any[]) {
        this.reqBody = reqBody;
        this.converted = converted;
    }

    abstract exchange(): Promise<any>;
}

export abstract class BaseRealEstateApi extends BaseApi {
    abstract API_CONFIG: ApiConfig;

    abstract _callApi(): Promise<any>;
    abstract _processData(data: any): Promise<any>;

    async exchange(): Promise<any> {
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
        } catch (e) {
            console.error(`${this.API_CONFIG.name} exchange エラー:`, e);
            return null;
        }
    }
}

export class BasePointApi extends BaseRealEstateApi {
    API_CONFIG!: ApiConfig; // Should be set by subclasses

    async _callApi(): Promise<any> {
        const tiles = getSurroundingTiles(this.converted.x, this.converted.y, this.converted.x_frac, this.converted.y_frac);
        const mergedGeojson = { type: "FeatureCollection", features: [] as any[] };

        for (const [x, y] of tiles) {
            const params = this._buildParams(x, y);

            try {
                const response: any = await get(
                    this.API_CONFIG.path,
                    params,
                    this.API_CONFIG.response_type,
                    {
                        "Ocp-Apim-Subscription-Key": `${LIBRARY_API_KEY}`,
                        "Accept": "*/*",
                    }
                );
                if (response && response.features && Array.isArray(response.features)) {
                    mergedGeojson.features.push(...response.features);
                }
            } catch (e) {
                console.error(`${this.API_CONFIG.name} 呼び出し失敗:`, e);
                throw e;
            }
        }

        return mergedGeojson;
    }

    _buildParams(x: number, y: number): any {
        return { response_format: "geojson", z: ZOOM, x, y };
    }

    async _processData(data: any): Promise<any> {
        if (!data || !data.features || data.features.length === 0) {
            console.info(`${this.API_CONFIG.name}の該当データなし`);
            return null;
        }

        const distance = this.reqBody.distance;
        const filteredFeatures = filterDistance(
            data.features,
            [this.converted.lat, this.converted.lon],
            distance
        );

        if (!filteredFeatures || filteredFeatures.length === 0) {
            console.info(`${this.API_CONFIG.name}の該当データなし（絞り込み後）`);
            return null;
        }

        data.features = filteredFeatures;
        return data;
    }
}

export class BasePolygonApi extends BaseRealEstateApi {
    API_CONFIG!: ApiConfig; // Should be set by subclasses

    async _callApi(): Promise<any> {
        const params = this._buildParams();
        return await get(
            this.API_CONFIG.path,
            params,
            this.API_CONFIG.response_type,
            {
                "Ocp-Apim-Subscription-Key": `${LIBRARY_API_KEY}`,
                "Accept": "*/*",
            }
        );
    }

    _buildParams(): any {
        return {
            response_format: "geojson",
            z: ZOOM,
            x: this.converted.x,
            y: this.converted.y,
        };
    }

    async _processData(data: any): Promise<any> {
        if (!data || !data.features || data.features.length === 0) {
            console.info(`${this.API_CONFIG.name}の該当データなし`);
            return null;
        }

        const filteredFeatures = overlapJudge(
            data.features,
            [this.converted.lat, this.converted.lon]
        );

        if (!filteredFeatures || filteredFeatures.length === 0) {
            console.info(`${this.API_CONFIG.name}の該当データなし（絞り込み後）`);
            return null;
        }

        data.features = filteredFeatures;
        return data;
    }
}
