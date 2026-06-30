export interface ApiConfig {
    name: string;
    path: string;
    response_type: string;
}
export declare abstract class BaseApi {
    reqBody: any;
    converted: any;
    constructor(reqBody: any, converted: any, ...args: any[]);
    abstract exchange(): Promise<any>;
}
export declare abstract class BaseRealEstateApi extends BaseApi {
    abstract API_CONFIG: ApiConfig;
    abstract _callApi(): Promise<any>;
    abstract _processData(data: any): Promise<any>;
    exchange(): Promise<any>;
}
export declare class BasePointApi extends BaseRealEstateApi {
    API_CONFIG: ApiConfig;
    _callApi(): Promise<any>;
    _buildParams(x: number, y: number): any;
    _processData(data: any): Promise<any>;
}
export declare class BasePolygonApi extends BaseRealEstateApi {
    API_CONFIG: ApiConfig;
    _callApi(): Promise<any>;
    _buildParams(): any;
    _processData(data: any): Promise<any>;
}
//# sourceMappingURL=base_api.d.ts.map