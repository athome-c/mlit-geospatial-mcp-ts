"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPayload = buildPayload;
function buildPayload(spec, args) {
    const payload = {
        coordinates: [
            {
                lat: Number(args.lat),
                lon: Number(args.lon)
            }
        ]
    };
    if (spec.target_api !== null && spec.target_api !== undefined) {
        payload.target_apis = [spec.target_api];
    }
    else {
        payload.target_apis = args.target_apis || [];
    }
    for (const param of spec.allowed_params) {
        if (args[param] !== undefined && args[param] !== null) {
            payload[param] = args[param];
        }
    }
    return payload;
}
