import axios from 'axios';
import { RE_RGEOCODER_URL } from './const';

// 緯度経度から都道府県CD検索(国土地理院による逆ジオコーダ)
export async function getCitycd(lat: number, lon: number): Promise<[string | null, string | null]> {
    try {
        const response = await axios.get(RE_RGEOCODER_URL, {
            params: { lat, lon },
            headers: { "User-Agent": "REINS-Client" }
        });

        if (response.status === 200) {
            const muniCd: string = response.data.results.muniCd;
            const lv01Nm: string = response.data.results.lv01Nm;
            return [muniCd, lv01Nm];
        }
        return [null, null];
    } catch (error) {
        return [null, null];
    }
}
