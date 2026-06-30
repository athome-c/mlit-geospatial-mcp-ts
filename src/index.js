"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const index_1 = require("./tools/index");
const space_id_calculaton_1 = require("./utils/space_id_calculaton");
const payload_1 = require("./utils/payload");
const handler_1 = require("./request_processor/handler");
const server = new index_js_1.Server({
    name: "mlit-geospatial-mcp-ts",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {}
    }
});
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: index_1.TOOLS
    };
});
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (!args) {
        throw new Error("No arguments provided");
    }
    console.error(`Tool called: ${name}`);
    if (name === "plateau_space_id") {
        const lat = Number(args.lat);
        const lon = Number(args.lon);
        const z = args.z !== undefined ? Number(args.z) : 18;
        const h_m = args.h_m !== undefined ? Number(args.h_m) : 0.0;
        const sid = (0, space_id_calculaton_1.spatialIdFromWgs84)(lat, lon, z, h_m);
        const result = {
            spatial_id: (0, space_id_calculaton_1.asString)(sid),
            components: { z: sid.z, f: sid.f, x: sid.x, y: sid.y }
        };
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    const spec = index_1.API_SPECS[name];
    if (!spec) {
        throw new Error(`Unknown tool: ${name}`);
    }
    const payload = (0, payload_1.buildPayload)(spec, args);
    console.error(`payload: ${JSON.stringify(payload)}`);
    const result = await (0, handler_1.handleRequest)(payload);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result, null, 2)
            }
        ]
    };
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("MCP server running on stdio");
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map