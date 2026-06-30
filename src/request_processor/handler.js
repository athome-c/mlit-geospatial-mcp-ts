"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRequest = handleRequest;
const api_models_1 = require("./models/api_models");
const geospatial_service_1 = require("./service/geospatial_service");
async function handleRequest(payload) {
    console.info("handle_request started");
    try {
        const req = new api_models_1.RequestModel(payload);
        const serviceInstance = new geospatial_service_1.GeospatialService();
        const res = await serviceInstance.processRequest(req);
        return { status: "success", data: res };
    }
    catch (e) {
        console.error(`処理エラー:${e}`);
        return { status: "error", data: String(e) };
    }
}
//# sourceMappingURL=handler.js.map