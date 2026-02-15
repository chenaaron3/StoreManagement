/**
 * One row from sales/purchase data (e.g. mark_sales.csv).
 * Use for CSV/API; when nested under User, use Purchase instead.
 */
export interface SalesRecord {
  memberId: string;
  purchaseDate: string;
  itemId: string;
  itemName: string;
  color: string;
  size: string;
  brandCode: string;
  quantity: number;
  totalCost: number;
  storeName: string;
  salesAssociate: string;
}

/** A single purchase (SalesRecord without memberId). Nested under User. */
export type Purchase = Omit<SalesRecord, "memberId">;

/**
 * Membership / customer–store association (e.g. mark_transactions.csv).
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
}
