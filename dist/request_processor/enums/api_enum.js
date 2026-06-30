"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIEnum = void 0;
const apiReg = __importStar(require("../service/apis/apiRegistry"));
class APIEnum {
    static API1 = 1;
    static API2 = 2;
    static API3 = 3;
    static API4 = 4;
    static API5 = 5;
    static API6 = 6;
    static API7 = 7;
    static API8 = 8;
    static API9 = 9;
    static API10 = 10;
    static API11 = 11;
    static API12 = 12;
    static API13 = 13;
    static API14 = 14;
    static API15 = 15;
    static API16 = 16;
    static API17 = 17;
    static API18 = 18;
    static API19 = 19;
    static API20 = 20;
    static API21 = 21;
    static API22 = 22;
    static API23 = 23;
    static API24 = 24;
    static API25 = 25;
    static getInstance(code, reqBody, converted) {
        const cls = CLASS_MATRIX[code];
        if (!cls) {
            throw new Error(`存在しないAPIコード：${code}`);
        }
        return new cls(reqBody, converted);
    }
    static fromCode(code) {
        if (CLASS_MATRIX[code]) {
            return code;
        }
        throw new Error(`存在しないAPIコード：${code}`);
    }
}
exports.APIEnum = APIEnum;
const CLASS_MATRIX = {
    1: apiReg.RealEstateApi1,
    2: apiReg.RealEstateApi2,
    3: apiReg.RealEstateApi3,
    4: apiReg.RealEstateApi4,
    5: apiReg.RealEstateApi5,
    6: apiReg.RealEstateApi6,
    7: apiReg.RealEstateApi7,
    8: apiReg.RealEstateApi8,
    9: apiReg.RealEstateApi9,
    10: apiReg.RealEstateApi10,
    11: apiReg.RealEstateApi11,
    12: apiReg.RealEstateApi12,
    13: apiReg.RealEstateApi13,
    14: apiReg.RealEstateApi14,
    15: apiReg.RealEstateApi15,
    16: apiReg.RealEstateApi16,
    17: apiReg.RealEstateApi17,
    18: apiReg.RealEstateApi18,
    19: apiReg.RealEstateApi19,
    20: apiReg.RealEstateApi20,
    21: apiReg.RealEstateApi21,
    22: apiReg.RealEstateApi22,
    23: apiReg.RealEstateApi23,
    24: apiReg.RealEstateApi24,
    25: apiReg.RealEstateApi25,
};
