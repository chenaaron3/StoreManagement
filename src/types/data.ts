/**
 * One row from sales/purchase data (e.g. mark_sales.csv).
 * Use for CSV/API; when nested under User, use Purchase instead.
 * Supports two shapes: CSV (productId/productName/brandId/brandName) and
 * membership/fabricated (itemId/itemName/brandCode). At least one set should be present.
 */
export interface SalesRecord {
  memberId: string;
  purchaseDate: string;
  /** CSV shape (mark_sales). */
  brandId?: string;
  brandName?: string;
  productId?: string;
  productName?: string;
  /** Alternate shape (memberships/fabricated). */
  itemId?: string;
  itemName?: string;
  brandCode?: string;
  color: string;
  size: string;
  quantity: number;
  totalCost: number;
  storeName: string;
  /** Store code (e.g. EMODA, MD). Used for cross-store detection. */
  storeCode?: string;
  salesAssociate: string;
}

/** A single purchase (SalesRecord without memberId). Nested under User. */
export type Purchase = Omit<SalesRecord, "memberId">;

/**
 * Membership / customer–store association (e.g. mark_membership_MD_LM_EL.csv).
 * Use for CSV/API; when nested under User, use Membership instead.
 */
export interface MembershipRecord {
  memberId: string;
  brandCode: string;
  storeCode: string;
  storeName: string;
  salesAssociate: string;
  ranking: string;
}

/** A single membership (MembershipRecord without memberId). Nested under User. */
export type Membership = Omit<MembershipRecord, "memberId">;

/** Coupon distributed to a customer (mock for MVP). */
export interface Coupon {
  id: string;
  name: string;
  code?: string;
  discount: string;
  expiry: string;
  used?: boolean;
}

/** Associate todo task (mock for MVP; localStorage). */
export interface AssociateTodo {
  id: string;
  title: string;
  dueDate: string;
  status: "pending" | "done";
  memberId?: string;
}

/** Online cart item (mock for MVP). */
export interface OnlineCartItem {
  id: string;
  itemName: string;
  price: number;
  quantity?: number;
}

/** Body shape types. */
export const BODY_SHAPES = ["unknown", "straight", "wavy", "natural"] as const;

export type BodyShape = (typeof BODY_SHAPES)[number];

/**
 * User: core fields + memberships + purchases.
 * Sub-fields do not repeat memberId.
 */
export interface User {
  memberId: string;
  prefecture: string;
  birthday: string;
  gender: string;
  name: string;
  phoneNumber: string;
  bodyShape: BodyShape;
  memberships: Membership[];
  purchases: Purchase[];
  coupons?: Coupon[];
}
