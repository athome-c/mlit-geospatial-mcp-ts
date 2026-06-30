import axios from 'axios';
import { RGEOCODER_URL } from './const';

// 住所から緯度経度(国土地理院のジオコーダ)
export async function getLatlon(fullAddr: string): Promise<[number | null, number | null]> {
    try {
        const response = await axios.get(RGEOCODER_URL, {
            params: { q: fullAddr },
            headers: { "User-Agent": "REINS-Client" }
        });

        const result = response.data;
        if (result && Array.isArray(result) && result.length > 0) {
            const lon: number = result[0].geometry.coordinates[0];
            const lat: number = result[0].geometry.coordinates[1];
            return [lon, lat];
        }
        return [null, null];
    } catch (error) {
        return [null, null];
    }
}
