import axios from 'axios';

export async function get(url: string, params: any = null, responseType: string = "json", headers: any = null): Promise<any> {
    const reqHeaders = headers || { "Accept": "*/*" };

    try {
        const response = await axios.get(url, { headers: reqHeaders, params });
        if (responseType === "json" || responseType === "geojson") {
            return response.data;
        }
    } catch (error) {
        console.error(`API呼び出し失敗 URL:${url} params:${JSON.stringify(params)} エラー:`, error);
        return { data: [] };
    }
}
