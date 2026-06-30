import axios from 'axios';
import { LIBRARY_API_KEY, LIBRARY_API_URL, PREFECTURE_MAP } from '../../utils/const';

export function getFullAddress(muniCd: string, lv01Nm: string): string {
    const prefName = getPrefName(muniCd);
    const cityName = "";
    // Wait, the python implementation of getCityname actually calls API synchronously. I will implement them as async.
    const districtName = getDistrictName(lv01Nm);
    // Returns promise, requires refactor. Let's return the pieces.
    return `${prefName}${cityName}${districtName}`;
}

// 都道府県名取得
export function getPrefName(muniCd: string): string {
    const prefCode = muniCd.substring(0, 2);
    return PREFECTURE_MAP[prefCode] || "";
}

// 市区町村名取得
export async function getCityname(muniCd: string): Promise<string | null> {
    const prefCd = muniCd.substring(0, 2);
    const cityList = await getLibraryapi(prefCd);
    if (cityList && cityList.data) {
        const match = cityList.data.find((item: any) => item.id === muniCd);
        return match ? match.name : null;
    }
    return null;
}

// 地名取得（大字）
export function getDistrictName(lv01Nm: string): string {
    return lv01Nm.replace(/([一二三四五六七八九十百千万]+|[0-9]+)丁目$/, "");
}

// 不動産ライブラリAPI（都道府県）
export async function getLibraryapi(prefCd: string): Promise<any> {
    try {
        const response = await axios.get(`${LIBRARY_API_URL}/XIT002`, {
            params: { area: prefCd },
            headers: {
                "User-Agent": "REINS-Client",
                "Ocp-Apim-Subscription-Key": LIBRARY_API_KEY
            }
        });
        return response.data;
    } catch (e) {
        return null;
    }
}

export async function getFullAddressAsync(muniCd: string, lv01Nm: string): Promise<string> {
    const prefName = getPrefName(muniCd);
    const cityName = await getCityname(muniCd) || "";
    const districtName = getDistrictName(lv01Nm);
    return `${prefName}${cityName}${districtName}`;
}
