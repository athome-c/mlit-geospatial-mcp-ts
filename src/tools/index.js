"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_SPECS = exports.TOOLS = void 0;
const definitions_1 = require("../utils/definitions");
const toolsJson = `[
  {
    "tool": {
      "name": "get_multi_api",
      "description": "このtoolはtarget_apiに指定されたデータを取得します。target_apisが単一の指定で3,4,5の場合はAPIは専用のtoolを使用します。例：「地価公示と都市計画区域のデータが欲しい」の場合、こちらのtoolでtarget_api3,4が指定されます。返却内容は、取得結果と不動産ライブラリの地図表示用URL（＋保存先ディレクトリ）です。取得結果のgeojsonファイルを任意のフォルダに保存するかどうかユーザに必ず確認を行い、保存する場合（save_file=true）は保存先フォルダをユーザに返却する。ファイル保存に関してユーザが明示していない場合は、保存するか確認をしてほしいためNoneとしてください。save_fileがNoneまたはnullの場合は、必ず「取得結果のファイルは保存しますか？」とユーザーに確認してください。",
      "inputSchema": {
        "type": "object",
        "properties": {
          "lat": { "type": "number", "description": "緯度" },
          "lon": { "type": "number", "description": "経度" },
          "target_apis": {
            "type": "array",
            "items": { "type": "number" },
            "description": "呼び出すAPI番号。(例：[3,4,5])"
          },
          "distance": {
            "type": "number",
            "description": "中心地点からの検索距離（メートル）",
            "default": 425.0,
            "maximum": 425.0
          },
          "save_file": {
            "type": ["boolean", "null"],
            "description": "取得結果のgeojsonファイルを保存するか"
          },
          "output_dir": {
            "type": "string",
            "description": "保存先ディレクトリ"
          }
        },
        "required": ["lat", "lon", "target_apis"]
      }
    },
    "spec": {
      "tool_name": "get_multi_api",
      "target_api": null,
      "allowed_params": [
        "quarter", "land_price_classification", "welfare_facility_class_code", "prefecture_code",
        "administrative_area_code", "year", "price_classification", "welfare_facility_minor_class_code",
        "use_category_code", "district_code", "language", "output_dir", "division",
        "welfare_facility_middle_class_code", "distance", "save_file"
      ]
    }
  },
  {
    "tool": {
      "name": "plateau_space_id",
      "description": "緯度経度からPLATEAU空間ID（z/f/x/y）を計算します。PLATEAUデータを取得する前は必ずこのtoolを実行してください。",
      "inputSchema": {
        "type": "object",
        "properties": {
          "lat": { "type": "number", "description": "緯度" },
          "lon": { "type": "number", "description": "経度" },
          "z": { "type": "integer", "description": "ズームレベル", "default": 18 },
          "h_m": { "type": "number", "description": "標高", "default": 0.0 }
        },
        "required": ["lat", "lon"]
      }
    },
    "spec": {
      "tool_name": "plateau_space_id",
      "target_api": null,
      "allowed_params": []
    }
  }
]`;
const parsed = JSON.parse(toolsJson);
exports.TOOLS = parsed.map((p) => p.tool);
exports.API_SPECS = {};
for (const p of parsed) {
    exports.API_SPECS[p.spec.tool_name] = {
        ...p.spec,
        allowed_params: new Set(p.spec.allowed_params)
    };
}
//# sourceMappingURL=index.js.map