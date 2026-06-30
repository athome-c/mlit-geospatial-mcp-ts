export const ZOOM = 15;
export const PLATEAU_ZOOM = 18;
export const MAP_URL_ZOOM = 16;
export const SURVER_YEAR = 2025;

/////// 不動産ライブラリに関する定数定義 ///////
// API情報
export const LIBRARY_API_KEY = process.env.LIBRARY_API_KEY || "";
export const LIBRARY_API_URL = "https://www.reinfolib.mlit.go.jp/ex-api/external";

/////// PLATEAUに関する定数定義 ///////
// API情報
export const PLATEAU_API_URL = "https://api.plateauview.mlit.go.jp/datacatalog/citygml/";

/////// 登記所備付地図に関する定数定義 ///////
export const LANDMAP_API_URL = "https://www.geospatial.jp/ckan/api/3/action/package_search";
export const SEARCH_KEY = ["登記所備付地図"];

// 出力フォルダ
export const OUTPUT_PATH = "C:\\output\\landmap";
export const OUTPUT_FILE = "output.geojson";

/////// 逆ジオコーダ（国土地理院） ///////
export const RE_RGEOCODER_URL = "https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress";

/////// ジオコーダ（国土地理院） ///////
export const RGEOCODER_URL = "https://msearch.gsi.go.jp/address-search/AddressSearch";

/////// 情報変換バッチ ファイル変換 ///////
export const DOWNLOAD = "/tmp/download";

/////// 都道府県一覧 ///////
export const PREFECTURE_MAP: { [key: string]: string } = {
    "01": "北海道", "02": "青森県", "03": "岩手県", "04": "宮城県",
    "05": "秋田県", "06": "山形県", "07": "福島県", "08": "茨城県",
    "09": "栃木県", "10": "群馬県", "11": "埼玉県", "12": "千葉県",
    "13": "東京都", "14": "神奈川県", "15": "新潟県", "16": "富山県",
    "17": "石川県", "18": "福井県", "19": "山梨県", "20": "長野県",
    "21": "岐阜県", "22": "静岡県", "23": "愛知県", "24": "三重県",
    "25": "滋賀県", "26": "京都府", "27": "大阪府", "28": "兵庫県",
    "29": "奈良県", "30": "和歌山県", "31": "鳥取県", "32": "島根県",
    "33": "岡山県", "34": "広島県", "35": "山口県", "36": "徳島県",
    "37": "香川県", "38": "愛媛県", "39": "高知県", "40": "福岡県",
    "41": "佐賀県", "42": "長崎県", "43": "熊本県", "44": "大分県",
    "45": "宮崎県", "46": "鹿児島県", "47": "沖縄県"
};
