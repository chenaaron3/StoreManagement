/**
 * Deterministic mappings for sales data anonymization.
 * Used by scripts/anonymizeSales.ts.
 */

/** Brand: original code/name → anonymized code and name */
export const BRAND_MAP: Record<string, { code: string; name: string }> = {
  "00": { code: "SA", name: "SAKURA" },
  MD: { code: "SA", name: "SAKURA" },
  "51": { code: "KA", name: "KAEDE" },
  EL: { code: "KA", name: "KAEDE" },
  "03": { code: "WA", name: "WAKABA" },
  LM: { code: "WA", name: "WAKABA" },
};

/** Substrings that indicate an online/web store (case-insensitive for ASCII). */
export const ONLINE_STORE_KEYWORDS = [
  "WEB",
  "ONLINE",
  "ZOZOBASE",
  "通販",
  "ウェブ",
  "オンライン",
];

export const ANONYMIZED_ONLINE_STORE_NAME = "オンライン";

/** Physical store name pool: plausible Japanese location-style names (suffixes). */
export const PHYSICAL_STORE_NAME_POOL = [
  "駅前店",
  "モール店",
  "デパート店",
  "プラザ店",
  "グランド店",
  "シティ店",
  "パーク店",
  "駅ビル店",
  "アネックス店",
  "ルミネ店",
  "アトレ店",
  "阪急店",
  "パルコ店",
  "ミオ店",
  "一番街店",
  "エスト店",
  "ゲートタワー店",
  "名古屋店",
  "横浜店",
  "新宿店",
  "池袋店",
  "梅田店",
  "渋谷店",
  "心斎橋店",
  "博多店",
  "広島店",
  "天王寺店",
  "岡山店",
  "福岡店",
  "なんば店",
  "神戸店",
  "恵比寿店",
  "立川店",
  "北千住店",
  "有楽町店",
  "高崎店",
];

/** Family names (姓) for associate anonymization. */
export const FAMILY_NAMES = [
  "佐藤", "鈴木", "高橋", "田中", "渡辺", "伊藤", "中村", "小林", "山本", "加藤",
  "吉田", "山田", "佐々木", "松本", "井上", "木村", "林", "斎藤", "清水", "山口",
  "森", "阿部", "池田", "橋本", "山崎", "石川", "前田", "藤田", "岡田", "後藤",
  "長谷川", "石井", "村上", "遠藤", "青木", "坂本", "福田", "太田", "西村", "藤井",
  "藤原", "本田", "久保", "横山", "松田", "中川", "中野", "原田", "小川", "竹内",
];

/** Given names (名) for associate anonymization. */
export const GIVEN_NAMES = [
  "陽子", "美咲", "翔太", "優子", "健一", "真由美", "大輔", "恵子", "直樹", "香織",
  "拓也", "裕子", "浩二", "智子", "誠", "明美", "淳", "京子", "剛", "由美",
  "健太郎", "麻衣", "和也", "千尋", "慎一", "綾", "雄大", "彩", "亮", "愛",
  "大樹", "美穂", "翔", "奈々", "陸", "花", "蓮", "結衣", "蒼", "凛",
  "楓", "陽菜", "颯", "結菜", "樹", "心", "湊", "咲", "陽", "芽衣",
];

/** Member ID replacement prefixes (no "RC"); used in deterministic order for sorted original prefixes. */
export const MEMBER_ID_REPLACEMENT_PREFIXES = ["A1", "B2", "C3", "D4", "E5", "F6", "G7", "H8", "J9", "K0"];

/**
 * Product name → generic category (Japanese keywords).
 * Order matters: longer/more specific matches first.
 */
export const PRODUCT_CATEGORY_KEYWORDS: { pattern: RegExp | string; category: string }[] = [
  { pattern: /スカート/i, category: "スカート" },
  { pattern: /SK(?:IRT)?\b/i, category: "スカート" },
  { pattern: /ワンピース|ワンシー|OP|WCD|ONEPIECE/i, category: "ワンピース" },
  { pattern: /ドレス/i, category: "ドレス" },
  { pattern: /ブーツ/i, category: "ブーツ" },
  { pattern: /ニット|KNIT|KT\b/i, category: "ニット" },
  { pattern: /コート|COAT|CT\b/i, category: "コート" },
  { pattern: /ジャケット|JACKET|JKT/i, category: "ジャケット" },
  { pattern: /カーディガン|CARDIGAN/i, category: "カーディガン" },
  { pattern: /ブルゾン|BLAZER|BLZ/i, category: "ブルゾン" },
  { pattern: /パンツ|PANTS|PT\b/i, category: "パンツ" },
  { pattern: /ショートパンツ|SHORTS/i, category: "ショートパンツ" },
  { pattern: /シャツ|SHIRT|SL\b/i, category: "シャツ" },
  { pattern: /ブラウス|BLOUSE|BL\b/i, category: "ブラウス" },
  { pattern: /トップス|TOPS|TP\b/i, category: "トップス" },
  { pattern: /Tシャツ|T-SHIRT|TKT/i, category: "Tシャツ" },
  { pattern: /セーター|SWEATER/i, category: "セーター" },
  { pattern: /ベスト|VEST/i, category: "ベスト" },
  { pattern: /キャミソール|CAMISOLE/i, category: "キャミソール" },
  { pattern: /スニーカー|SNEAKER/i, category: "スニーカー" },
  { pattern: /サンダル|SANDAL/i, category: "サンダル" },
  { pattern: /バッグ|BAG/i, category: "バッグ" },
  { pattern: /アクセサリー|ACCESSORY/i, category: "アクセサリー" },
  { pattern: /ベルト|BELT/i, category: "ベルト" },
  { pattern: /ストール|STOLE|SCARF/i, category: "ストール" },
];

export const PRODUCT_FALLBACK_CATEGORY = "その他";
