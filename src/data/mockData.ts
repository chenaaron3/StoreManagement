import type {
  SalesRecord,
  MembershipRecord,
  User,
  Coupon,
  AssociateTodo,
  OnlineCartItem,
} from "@/types/data";

/** Core user fields (no memberships/purchases). Used to build User. */
type UserCore = Pick<
  User,
  | "memberId"
  | "prefecture"
  | "birthday"
  | "gender"
  | "name"
  | "phoneNumber"
  | "bodyShape"
>;

export const mockProfiles: UserCore[] = [
  {
    memberId: "RC01862444",
    prefecture: "石川県",
    birthday: "1990-02-20",
    gender: "2",
    name: "田中 花子",
    phoneNumber: "090-1234-5678",
    bodyShape: "straight",
  },
  {
    memberId: "RC01866206",
    prefecture: "東京都",
    birthday: "1985-08-03",
    gender: "2",
    name: "佐藤 美咲",
    phoneNumber: "080-2345-6789",
    bodyShape: "wavy",
  },
  {
    memberId: "RC01017392",
    prefecture: "神奈川県",
    birthday: "1978-11-22",
    gender: "2",
    name: "鈴木 恵",
    phoneNumber: "070-3456-7890",
    bodyShape: "natural",
  },
];

export const mockSales: SalesRecord[] = [
  {
    memberId: "RC01862444",
    purchaseDate: "2023-01-01",
    brandId: "SAKURA",
    brandName: "SAKURA",
    productId: "002250801501",
    productName: "チュール刺繍フレアスカート",
    color: "IVY",
    size: "M",
    quantity: 1,
    totalCost: 8640,
    storeName: "SAKURA 店舗1",
    storeCode: "SAKURA",
    salesAssociate: "山田",
  },
  {
    memberId: "RC01862444",
    purchaseDate: "2023-01-01",
    brandId: "SAKURA",
    brandName: "SAKURA",
    productId: "002260800101",
    productName: "異素材ドッキングスーパーハイウエストスカート",
    color: "C.GRY",
    size: "M",
    quantity: 1,
    totalCost: 9360,
    storeName: "SAKURA 店舗1",
    storeCode: "SAKURA",
    salesAssociate: "山田",
  },
  {
    memberId: "RC01866206",
    purchaseDate: "2023-01-01",
    brandId: "SAKURA",
    brandName: "SAKURA",
    productId: "002240400501",
    productName: "2WAYリボンボリュームスリーブブラウス",
    color: "B.PNK",
    size: "F",
    quantity: 1,
    totalCost: 3600,
    storeName: "SAKURA 店舗1",
    storeCode: "SAKURA",
    salesAssociate: "伊藤",
  },
  {
    memberId: "RC01866206",
    purchaseDate: "2024-08-20",
    itemId: "002240400501",
    itemName: "2WAYリボンボリュームスリーブブラウス",
    color: "B.PNK",
    size: "F",
    brandCode: "SAKURA",
    quantity: 1,
    totalCost: 3600,
    storeName: "SAKURA 店舗1",
    storeCode: "SAKURA",
    salesAssociate: "佐藤",
  },
  {
    memberId: "RC01866206",
    purchaseDate: "2024-12-05",
    itemId: "002270300101",
    itemName: "ウールブレンドジャケット",
    color: "BLK",
    size: "M",
    brandCode: "SAKURA",
    quantity: 1,
    totalCost: 12000,
    storeName: "SAKURA 店舗2",
    storeCode: "SAKURA",
    salesAssociate: "岡田",
  },
  {
    memberId: "RC01866206",
    purchaseDate: "2024-06-10",
    itemId: "EM001",
    itemName: "KAEDE プリーツパンツ",
    color: "BLK",
    size: "M",
    brandCode: "KAEDE",
    quantity: 1,
    totalCost: 7920,
    storeName: "KAEDE 渋谷",
    storeCode: "KAEDE",
    salesAssociate: "高橋",
  },
  {
    memberId: "RC01866206",
    purchaseDate: "2024-05-12",
    itemId: "002230500201",
    itemName: "リネン混ドレス",
    color: "WHT",
    size: "M",
    brandCode: "SAKURA",
    quantity: 1,
    totalCost: 12800,
    storeName: "SAKURA 店舗2",
    storeCode: "SAKURA",
    salesAssociate: "岡田",
  },
  {
    memberId: "RC01866206",
    purchaseDate: "2024-09-08",
    itemId: "002241000101",
    itemName: "フレアスカート",
    color: "BEG",
    size: "M",
    brandCode: "SAKURA",
    quantity: 1,
    totalCost: 7200,
    storeName: "SAKURA 店舗1",
    storeCode: "SAKURA",
    salesAssociate: "佐藤",
  },
  {
    memberId: "RC01866206",
    purchaseDate: "2024-10-20",
    itemId: "002250400301",
    itemName: "シフォンブラウス",
    color: "BLK",
    size: "F",
    brandCode: "SAKURA",
    quantity: 1,
    totalCost: 4500,
    storeName: "SAKURA 店舗2",
    storeCode: "SAKURA",
    salesAssociate: "岡田",
  },
  {
    memberId: "RC01866206",
    purchaseDate: "2024-11-15",
    itemId: "002260100101",
    itemName: "ニットセーター",
    color: "GRY",
    size: "M",
    brandCode: "SAKURA",
    quantity: 1,
    totalCost: 6900,
    storeName: "SAKURA 店舗2",
    storeCode: "SAKURA",
    salesAssociate: "岡田",
  },
  {
    memberId: "RC01866206",
    purchaseDate: "2025-01-05",
    itemId: "002280200201",
    itemName: "ウールコート",
    color: "NAV",
    size: "M",
    brandCode: "SAKURA",
    quantity: 1,
    totalCost: 19800,
    storeName: "SAKURA 店舗2",
    storeCode: "SAKURA",
    salesAssociate: "岡田",
  },
  {
    memberId: "RC01866206",
    purchaseDate: "2024-07-22",
    itemId: "002235000101",
    itemName: "テーラードジャケット",
    color: "BLK",
    size: "M",
    brandCode: "SAKURA",
    quantity: 1,
    totalCost: 14500,
    storeName: "SAKURA 店舗1",
    storeCode: "SAKURA",
    salesAssociate: "佐藤",
  },
  {
    memberId: "RC01866206",
    purchaseDate: "2024-12-18",
    itemId: "002265000101",
    itemName: "ストレッチパンツ",
    color: "CHR",
    size: "M",
    brandCode: "SAKURA",
    quantity: 1,
    totalCost: 5800,
    storeName: "SAKURA 店舗2",
    storeCode: "SAKURA",
    salesAssociate: "岡田",
  },
  {
    memberId: "RC01866206",
    purchaseDate: "2025-02-08",
    itemId: "002240400501",
    itemName: "2WAYリボンボリュームスリーブブラウス",
    color: "B.PNK",
    size: "F",
    brandCode: "SAKURA",
    quantity: 1,
    totalCost: 3600,
    storeName: "SAKURA 店舗2",
    storeCode: "SAKURA",
    salesAssociate: "岡田",
  },
  {
    memberId: "RC01017392",
    purchaseDate: "2024-10-12",
    itemId: "002280100501",
    itemName: "プリーツミディドレス",
    color: "NAV",
    size: "S",
    brandCode: "SAKURA",
    quantity: 1,
    totalCost: 8900,
    storeName: "SAKURA 店舗3",
    storeCode: "SAKURA",
    salesAssociate: "平出",
  },
  {
    memberId: "RC01017392",
    purchaseDate: "2024-07-01",
    itemId: "002250801501",
    itemName: "チュール刺繍フレアスカート",
    color: "IVY",
    size: "M",
    brandCode: "SAKURA",
    quantity: 1,
    totalCost: 8640,
    storeName: "SAKURA 店舗3",
    storeCode: "SAKURA",
    salesAssociate: "平出",
  },
  {
    memberId: "RC01017392",
    purchaseDate: "2025-02-01",
    itemId: "002290200101",
    itemName: "ニットカーディガン",
    color: "GRY",
    size: "M",
    brandCode: "SAKURA",
    quantity: 1,
    totalCost: 5500,
    storeName: "SAKURA 店舗3",
    storeCode: "SAKURA",
    salesAssociate: "平出",
  },
];

export const mockMemberships: MembershipRecord[] = [
  {
    memberId: "RC01862444",
    brandCode: "SAKURA",
    storeCode: "0032602",
    storeName: "SAKURA 店舗1",
    salesAssociate: "SAKURA 店舗1",
    ranking: "シルバー",
  },
  {
    memberId: "RC01866206",
    brandCode: "SAKURA",
    storeCode: "0060101",
    storeName: "SAKURA 店舗2",
    salesAssociate: "岡田 端穂",
    ranking: "ゴールド",
  },
  {
    memberId: "RC01017392",
    brandCode: "SAKURA",
    storeCode: "0060501",
    storeName: "SAKURA 店舗3",
    salesAssociate: "平出 有紗",
    ranking: "ブロンズ",
  },
];

/** Mock coupons per member (MVP). Birthday coupon is on the member with birthday in Feb (RC01862444). */
export const mockCouponsByMember: Record<string, Coupon[]> = {
  RC01862444: [
    {
      id: "c1",
      name: "10% Off Next Visit",
      code: "WELCOME10",
      discount: "10%",
      expiry: "2025-12-31",
      used: false,
    },
    {
      id: "c2",
      name: "Free Shipping",
      discount: "Free ship",
      expiry: "2025-06-30",
      used: true,
    },
  ],
};

/** Mock online cart per member. EC browse tag is shown only when cart has items. */
export const mockOnlineCartByMember: Record<string, OnlineCartItem[]> = {
  RC01862444: [
    {
      id: "cart1",
      itemName: "プリーツミディスカート",
      price: 5500,
      quantity: 1,
    },
    { id: "cart2", itemName: "シルク風ブラウス", price: 4500, quantity: 1 },
  ],
  RC01866206: [],
  RC01017392: [],
};

/** Prepopulated notes per member (used when localStorage has no notes yet). */
export const mockNotesByMember: Record<string, string> = {
  RC01862444:
    "前回来店時はご家族と一緒でした。スカートの新作にご興味あり。",
  RC01866206:
    "VIPのお客様。ブラウスとジャケットをお好み。ウィッシュリストのフォローをお願いします。",
};

/** Initial notes for a member (mock), when none saved yet. */
export function getInitialNotes(memberId: string): string {
  return mockNotesByMember[memberId] ?? "";
}

/** Mock recommendation items by category (for プラスワン). */
export const mockRecommendationItems: {
  category: string;
  itemName: string;
  price: number;
}[] = [
  { category: "スカート", itemName: "プリーツミディスカート", price: 5500 },
  { category: "スカート", itemName: "ウールブレンドスカート", price: 7200 },
  { category: "ブラウス", itemName: "シルク風ブラウス", price: 4500 },
  { category: "ブラウス", itemName: "レースカフスブラウス", price: 3900 },
  { category: "ドレス", itemName: "ミニワンピース", price: 8900 },
  { category: "ジャケット", itemName: "ウールジャケット", price: 12000 },
];

/** Mock initial associate todos (seed; persisted in localStorage). */
export const mockAssociateTodos: AssociateTodo[] = [
  {
    id: "t1",
    title: "Follow-up call: 田中 花子",
    dueDate: "2025-02-20",
    status: "pending",
    memberId: "RC01862444",
  },
  {
    id: "t2",
    title: "Stock check: skirts section",
    dueDate: "2025-02-16",
    status: "pending",
  },
  {
    id: "t3",
    title: "Send thank-you to 佐藤 美咲",
    dueDate: "2025-02-18",
    status: "done",
    memberId: "RC01866206",
  },
];

/** Normalize phone for search: strip spaces and dashes. */
function normalizePhone(phone: string): string {
  return phone.replace(/\s|-/g, "");
}

/** Fetch all sales (mock; replace with CSV/API later). */
export async function fetchSales(): Promise<SalesRecord[]> {
  await delay(300);
  return [...mockSales];
}

/** Fetch core user fields by member id (mock). */
export async function fetchUserCore(
  memberId: string,
): Promise<UserCore | null> {
  await delay(200);
  return mockProfiles.find((p) => p.memberId === memberId) ?? null;
}

/** Fetch a single User by member id: core fields + memberships + purchases + coupons (no memberId in sub-fields). */
export async function fetchUser(memberId: string): Promise<User | null> {
  const [core, salesForMember, membershipsForMember] = await Promise.all([
    fetchUserCore(memberId),
    Promise.resolve(mockSales.filter((s) => s.memberId === memberId)),
    Promise.resolve(mockMemberships.filter((m) => m.memberId === memberId)),
  ]);
  if (!core) return null;
  const coupons = mockCouponsByMember[memberId] ?? [];
  return {
    ...core,
    memberships: membershipsForMember.map(({ memberId: _, ...m }) => m),
    purchases: salesForMember.map(({ memberId: _, ...s }) => s),
    coupons,
  };
}

/** Fetch user by phone number (normalized: strip spaces/dashes). Returns null if no match. */
export async function fetchUserByPhone(phone: string): Promise<User | null> {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const core =
    mockProfiles.find((p) => normalizePhone(p.phoneNumber) === normalized) ??
    null;
  if (!core) return null;
  return fetchUser(core.memberId);
}

/** Fetch online cart items for a member (mock). */
export function getOnlineCart(memberId: string): OnlineCartItem[] {
  return mockOnlineCartByMember[memberId] ?? [];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
