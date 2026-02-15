import type {
  SalesRecord,
  MembershipRecord,
  User,
} from "@/types/data";

/** Core user fields (no memberships/purchases). Used to build User. */
type UserCore = Pick<
  User,
  "memberId" | "prefecture" | "birthday" | "gender" | "name" | "phoneNumber" | "bodyShape"
>;

export const mockProfiles: UserCore[] = [
  {
    memberId: "RC01862444",
    prefecture: "石川県",
    birthday: "1990-05-12",
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
    itemId: "002250801501",
    itemName: "チュール刺繍フレアスカート",
    color: "IVY",
    size: "M",
    brandCode: "MD",
    quantity: 1,
    totalCost: 8640,
    storeName: "FC金沢フォーラス",
    salesAssociate: "MD FC金沢フォーラス",
  },
  {
    memberId: "RC01862444",
    purchaseDate: "2023-01-01",
    itemId: "002260800101",
    itemName: "異素材ドッキングスーパーハイウエストスカート",
    color: "C.GRY",
    size: "M",
    brandCode: "MD",
    quantity: 1,
    totalCost: 9360,
    storeName: "FC金沢フォーラス",
    salesAssociate: "MD FC金沢フォーラス",
  },
  {
    memberId: "RC01866206",
    purchaseDate: "2023-01-01",
    itemId: "002240400501",
    itemName: "2WAYリボンボリュームスリーブブラウス",
    color: "B.PNK",
    size: "F",
    brandCode: "MD",
    quantity: 1,
    totalCost: 3600,
    storeName: "FC金沢フォーラス",
    salesAssociate: "MD FC金沢フォーラス",
  },
];

export const mockMemberships: MembershipRecord[] = [
  {
    memberId: "RC01862444",
    brandCode: "00",
    storeCode: "0032602",
    storeName: "MD FC金沢フォーラス",
    salesAssociate: "MD FC金沢フォーラス",
    ranking: "シルバー",
  },
  {
    memberId: "RC01866206",
    brandCode: "00",
    storeCode: "0060101",
    storeName: "MERCURYDUO ルミネエスト新宿",
    salesAssociate: "岡田 端穂",
    ranking: "ゴールド",
  },
  {
    memberId: "RC01017392",
    brandCode: "00",
    storeCode: "0060501",
    storeName: "MERCURYDUO 渋谷マルイ",
    salesAssociate: "平出 有紗",
    ranking: "ブロンズ",
  },
];

/** Fetch all sales (mock; replace with CSV/API later). */
export async function fetchSales(): Promise<SalesRecord[]> {
  await delay(300);
  return [...mockSales];
}

/** Fetch core user fields by member id (mock). */
export async function fetchUserCore(memberId: string): Promise<UserCore | null> {
  await delay(200);
  return mockProfiles.find((p) => p.memberId === memberId) ?? null;
}

/** Fetch a single User by member id: core fields + memberships + purchases (no memberId in sub-fields). */
export async function fetchUser(memberId: string): Promise<User | null> {
  const [core, salesForMember, membershipsForMember] = await Promise.all([
    fetchUserCore(memberId),
    Promise.resolve(mockSales.filter((s) => s.memberId === memberId)),
    Promise.resolve(mockMemberships.filter((m) => m.memberId === memberId)),
  ]);
  if (!core) return null;
  return {
    ...core,
    memberships: membershipsForMember.map(({ memberId: _, ...m }) => m),
    purchases: salesForMember.map(({ memberId: _, ...s }) => s),
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
