import * as apiReg from '../service/apis/apiRegistry';

export class APIEnum {
    static readonly API1 = 1;
    static readonly API2 = 2;
    static readonly API3 = 3;
    static readonly API4 = 4;
    static readonly API5 = 5;
    static readonly API6 = 6;
    static readonly API7 = 7;
    static readonly API8 = 8;
    static readonly API9 = 9;
    static readonly API10 = 10;
    static readonly API11 = 11;
    static readonly API12 = 12;
    static readonly API13 = 13;
    static readonly API14 = 14;
    static readonly API15 = 15;
    static readonly API16 = 16;
    static readonly API17 = 17;
    static readonly API18 = 18;
    static readonly API19 = 19;
    static readonly API20 = 20;
    static readonly API21 = 21;
    static readonly API22 = 22;
    static readonly API23 = 23;
    static readonly API24 = 24;
    static readonly API25 = 25;

    static getInstance(code: number, reqBody: any, converted: any): any {
        const cls = CLASS_MATRIX[code];
        if (!cls) {
            throw new Error(`存在しないAPIコード：${code}`);
        }
        return new cls(reqBody, converted);
    }

    static fromCode(code: number): number {
        if (CLASS_MATRIX[code]) {
            return code;
        }
        throw new Error(`存在しないAPIコード：${code}`);
    }
}

const CLASS_MATRIX: { [key: number]: any } = {
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
