"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestModel = void 0;
class RequestModel {
    coordinates;
    target_apis;
    distance;
    landmap_distance;
    price_classification;
    year;
    quarter;
    language;
    division;
    land_price_classification;
    use_category_code;
    administrative_area_code;
    welfare_facility_class_code;
    welfare_facility_middle_class_code;
    welfare_facility_minor_class_code;
    prefecture_code;
    district_code;
    save_file;
    output_dir;
    constructor(data) {
        this.coordinates = data.coordinates;
        this.target_apis = data.target_apis || Array.from({ length: 25 }, (_, i) => i + 1);
        this.distance = data.distance ?? 425;
        this.landmap_distance = data.landmap_distance ?? 50;
        this.price_classification = data.price_classification;
        this.year = data.year ?? new Date().getFullYear() - 1;
        this.quarter = data.quarter;
        this.language = data.language;
        this.division = data.division || ["00", "03", "05", "07", "09", "10", "13", "20"];
        this.land_price_classification = data.land_price_classification;
        this.use_category_code = data.use_category_code;
        this.administrative_area_code = data.administrative_area_code;
        this.welfare_facility_class_code = data.welfare_facility_class_code;
        this.welfare_facility_middle_class_code = data.welfare_facility_middle_class_code;
        this.welfare_facility_minor_class_code = data.welfare_facility_minor_class_code;
        this.prefecture_code = data.prefecture_code;
        this.district_code = data.district_code;
        this.save_file = data.save_file;
        this.output_dir = data.output_dir;
        if (!this.coordinates || this.coordinates.length === 0) {
            throw new Error("Please specify one or more coordinates");
        }
        this.validateFields();
    }
    static CONDITIONAL_FIELDS = {
        distance: Array.from({ length: 25 }, (_, i) => i + 1),
        price_classification: [1],
        year: [1, 2, 3],
        quarter: [1],
        language: [1],
        division: [2],
        land_price_classification: [3],
        use_category_code: [3],
        administrative_area_code: [7, 8, 12, 16, 17, 21, 22],
        welfare_facility_class_code: [12],
        welfare_facility_middle_class_code: [12],
        welfare_facility_minor_class_code: [12],
        prefecture_code: [19, 21, 22],
        district_code: [19],
    };
    validateFields() {
        const targetApisList = this.target_apis || [];
        for (const [fieldName, requiredValues] of Object.entries(RequestModel.CONDITIONAL_FIELDS)) {
            if (this[fieldName] !== undefined) {
                if (!requiredValues.some(v => targetApisList.includes(v))) {
                    this[fieldName] = undefined;
                }
            }
        }
    }
    modelDump() {
        return { ...this };
    }
}
exports.RequestModel = RequestModel;
