import { ApiSpec } from './definitions';

export function buildPayload(spec: ApiSpec, args: any): any {
    const payload: any = {
        coordinates: [
            {
                lat: Number(args.lat),
                lon: Number(args.lon)
            }
        ]
    };

    if (spec.target_api !== null && spec.target_api !== undefined) {
        payload.target_apis = [spec.target_api];
    } else {
        payload.target_apis = args.target_apis || [];
    }

    for (const param of spec.allowed_params) {
        if (args[param] !== undefined && args[param] !== null) {
            payload[param] = args[param];
        }
    }

    return payload;
}
