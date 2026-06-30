"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_LAYERS = void 0;
exports.buildMapUrl = buildMapUrl;
const const_1 = require("./const");
const LAYER_PARAMS = {
    publicNotices: ["00", "03", "05", "07", "09", "10", "13", "20"]
};
function getArray(p, key) {
    const val = p[key];
    if (!val)
        return [];
    if (Array.isArray(val))
        return val.map(v => String(v).trim()).filter(Boolean);
    return String(val).split(',').map(v => v.trim()).filter(Boolean);
}
exports.API_LAYERS = {
    3: [
        {
            layer: "publicNotices",
            condition: p => {
                const lp = p.land_price_classification;
                const matchesStr = (lp === undefined || lp === null || lp === "0");
                const codes = getArray(p, "use_category_code");
                return matchesStr && (codes.length === 0 || codes.some(c => LAYER_PARAMS.publicNotices.includes(c)));
            },
            params: p => {
                const codes = getArray(p, "use_category_code");
                if (codes.length > 0)
                    return codes.map(c => `publicNotices=${c}`);
                return LAYER_PARAMS.publicNotices.map(v => `publicNotices=${v}`);
            }
        },
        {
            layer: "surveys",
            condition: p => {
                const lp = p.land_price_classification;
                const matchesStr = (lp === undefined || lp === null || lp === "1");
                const codes = getArray(p, "use_category_code");
                return matchesStr && (codes.length === 0 || codes.some(c => LAYER_PARAMS.publicNotices.includes(c)));
            },
            params: p => {
                const codes = getArray(p, "use_category_code");
                if (codes.length > 0)
                    return codes.map(c => `publicNotices=${c}`);
                return LAYER_PARAMS.publicNotices.map(v => `publicNotices=${v}`);
            }
        }
    ],
    12: [
        { layer: "welfareFacility", condition: p => true, params: p => [] },
        { layer: "shelterLayer", condition: p => getArray(p, "welfare_facility_class_code").includes("01"), params: p => [] },
        { layer: "elderlyWelfareFacilityLayer", condition: p => getArray(p, "welfare_facility_class_code").includes("02"), params: p => [] },
        { layer: "facilityForTheHandicappedLayer", condition: p => getArray(p, "welfare_facility_class_code").includes("03"), params: p => [] },
        { layer: "socialParticipationSupportFacilitiesLayer", condition: p => getArray(p, "welfare_facility_class_code").includes("04"), params: p => [] },
        { layer: "childWelfareFacilityLayer", condition: p => getArray(p, "welfare_facility_class_code").includes("05"), params: p => [] },
        { layer: "maternalAndChildWelfareLayer", condition: p => getArray(p, "welfare_facility_class_code").includes("06"), params: p => [] },
        { layer: "otherWelfareFacilityLayer", condition: p => getArray(p, "welfare_facility_class_code").includes("99"), params: p => [] },
        ...[
            ["shelterLayer", "01"],
            ["elderlyWelfareFacilityLayer", "02"],
            ["facilityForTheHandicappedLayer", "03"],
            ["socialParticipationSupportFacilitiesLayer", "04"],
            ["childWelfareFacilityLayer", "05"],
            ["maternalAndChildWelfareLayer", "06"],
            ["otherWelfareFacilityLayer", "99"]
        ].map(([l, code]) => ({
            layer: l,
            condition: (p) => {
                const codes = getArray(p, "welfare_facility_class_code");
                if (codes.length === 0)
                    return true; // defaults to true if no codes specified
                return false; // already handled by individual conditions
            },
            params: (p) => []
        }))
    ],
    4: ["urbanPlanAreaLayer", "areaClassification", "urbanizationPromotionAreaLayer", "urbanizationControlAreaLayer"].map(l => ({ layer: l, condition: p => true, params: p => [] })),
    5: [{ layer: "useAreaLayer", condition: p => true, params: p => [] }],
    6: [{ layer: "locationOptimizePlanAreaLayer", condition: p => true, params: p => [] }],
    7: [{ layer: "elementarySchoolAreaLayer", condition: p => true, params: p => [] }],
    8: [{ layer: "juniorHighSchoolAreaLayer", condition: p => true, params: p => [] }],
    9: ["school", "elementarySchoolLayer", "juniorHighSchoolLayer", "secondarySchoolLayer", "highSchoolLayer", "technicalSchoolLayer", "juniorCollegeLayer", "universityLayer", "specialSupportSchoolLayer", "compulsoryEducationSchoolLayer", "miscellaneousSchoolLayer", "professionalTrainingCollegeLayer"].map(l => ({ layer: l, condition: p => true, params: p => [] })),
    10: [{ layer: "preschoolLayer", condition: p => true, params: p => [] }],
    11: ["medicalInstitution", "hospitalLayer", "clinicLayer", "dentalClinicLayer"].map(l => ({ layer: l, condition: p => true, params: p => [] })),
    14: [{ layer: "fireProtectionAreaLayer", condition: p => true, params: p => [] }],
    15: [{ layer: "passengersByStationLayer", condition: p => true, params: p => [] }],
    16: [{ layer: "disasterRiskAreaLayer", condition: p => true, params: p => [] }],
    17: [{ layer: "culturalFacilityLayer", condition: p => true, params: p => [] }],
    18: ["cityTownHall", "townHallLayer", "townHallBranchLayer", "otherAdministrativeServicesLayer", "publicHallLayer", "meetingFacilityLayer"].map(l => ({ layer: l, condition: p => true, params: p => [] })),
    19: [{ layer: "naturalParkAreaLayer", condition: p => true, params: p => [] }],
    20: [{ layer: "developedLandLayer", condition: p => true, params: p => [] }],
    21: [{ layer: "landslidePreventionLayer", condition: p => true, params: p => [] }],
    22: [{ layer: "collapseRiskAreaLayer", condition: p => true, params: p => [] }],
    23: [{ layer: "districtPlanLayer", condition: p => true, params: p => [] }],
    24: [{ layer: "advancedUseLayer", condition: p => true, params: p => [] }],
    25: [{ layer: "liqueFactionLayer", condition: p => true, params: p => [] }],
};
function buildMapUrl(lat, lon, targetApis, params = {}) {
    const baseUrl = "https://www.reinfolib.mlit.go.jp/map?";
    const urlParams = [];
    if (targetApis.includes(3)) {
        const year = parseFloat(params.year);
        if (!isNaN(year) && Number.isInteger(year)) {
            urlParams.push(`surveyYear=${year}`);
        }
        else {
            urlParams.push(`surveyYear=${const_1.SURVER_YEAR}`);
        }
    }
    for (const api of targetApis) {
        const entries = exports.API_LAYERS[api] || [];
        for (const entry of entries) {
            // deduplicate checking if it's welfare logic default
            // actually just condition check
            if (entry.condition(params)) {
                // Ensure no duplicate layers
                if (!urlParams.includes(`layers=${entry.layer}`)) {
                    urlParams.push(`layers=${entry.layer}`);
                }
                const extraParams = entry.params(params);
                for (const v of extraParams) {
                    if (!urlParams.includes(v)) {
                        urlParams.push(v);
                    }
                }
            }
        }
    }
    urlParams.push(`x=${lat}`);
    urlParams.push(`y=${lon}`);
    urlParams.push(`zoom=${const_1.MAP_URL_ZOOM}`);
    return baseUrl + urlParams.join('&');
}
