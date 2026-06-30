import { RequestModel } from './models/api_models';
import { GeospatialService } from './service/geospatial_service';

export async function handleRequest(payload: any): Promise<any> {
    console.info("handle_request started");

    try {
        const req = new RequestModel(payload);
        const serviceInstance = new GeospatialService();
        const res = await serviceInstance.processRequest(req);

        return { status: "success", data: res };
    } catch (e: any) {
        console.error(`処理エラー:${e}`);
        return { status: "error", data: String(e) };
    }
}
