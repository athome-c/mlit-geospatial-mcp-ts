export interface CoordinatesItem {
    lat: number;
    lon: number;
}
export declare class RequestModel {
    coordinates: CoordinatesItem[];
    target_apis?: number[];
    distance?: number;
    landmap_distance?: number;
    price_classification?: string;
    year?: number;
    quarter?: number;
    language?: string;
    division?: string[];
    land_price_classification?: string;
    use_category_code?: string[];
    administrative_area_code?: string[];
    welfare_facility_class_code?: string[];
    welfare_facility_middle_class_code?: string[];
    welfare_facility_minor_class_code?: string[];
    prefecture_code?: string[];
    district_code?: string[];
    save_file?: boolean | null;
    output_dir?: string;
    constructor(data: any);
    static CONDITIONAL_FIELDS: {
        [key: string]: number[];
    };
    validateFields(): void;
    modelDump(): any;
}
//# sourceMappingURL=api_models.d.ts.map