#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { TOOLS, API_SPECS } from "./tools/index";
import { spatialIdFromWgs84, asString } from "./utils/space_id_calculaton";
import { buildPayload } from "./utils/payload";
import { handleRequest } from "./request_processor/handler";
import { getLatlon } from "./utils/geocoder";

const server = new Server({
    name: "mlit-geospatial-mcp-ts",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {}
    }
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: TOOLS
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
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

        const sid = spatialIdFromWgs84(lat, lon, z, h_m);
        const result = {
            spatial_id: asString(sid),
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

    if (name === "geocode_address") {
        const address = String(args.address || "");
        if (!address) {
            return {
                content: [{ type: "text", text: JSON.stringify({ error: "Address is required" }) }],
                isError: true
            };
        }

        const [lon, lat] = await getLatlon(address);
        if (lon === null || lat === null) {
            return {
                content: [{ type: "text", text: JSON.stringify({ error: "Could not geocode the provided address." }) }],
                isError: true
            };
        }

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ address, lat, lon }, null, 2)
                }
            ]
        };
    }

    const spec = API_SPECS[name];
    if (!spec) {
        throw new Error(`Unknown tool: ${name}`);
    }

    const payload = buildPayload(spec, args);
    console.error(`payload: ${JSON.stringify(payload)}`);

    const result = await handleRequest(payload);

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result, null, 2)
            }
        ],
        isError: result.status === "error"
    };
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
