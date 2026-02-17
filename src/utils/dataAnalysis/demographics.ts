/**
 * Age and gender segments from member demographics.
 */
import type { SalesRecord } from "@/types/data";
import type { CustomerSegment } from "@/types/analysis";

/** Member demographics from mark_users (生年月日, 性別). Keys = anonymized memberId. */
export type MemberDemographics = Record<
  string,
  { birthdate: string; genderCode: string }
>;

function memberHash(memberId: string): number {
  let h = 0;
  for (let i = 0; i < memberId.length; i++) {
    h = (h * 31 + memberId.charCodeAt(i)) >>> 0;
  }
  return h;
}

const AGE_BUCKETS = [
  "10s (10–19)",
  "20s (20–29)",
  "30s (30–39)",
  "40s (40–49)",
  "50s (50–59)",
  "60+",
];

const GENDER_VALUES = ["Male", "Female", "Unknown"] as const;

function ageFromBirthdate(
  birthdate: string,
  refDate: Date = new Date(),
): number | null {
  const m = birthdate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const month = parseInt(m[2], 10) - 1;
  const day = parseInt(m[3], 10);
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  let age = refDate.getFullYear() - y;
  if (
    refDate.getMonth() < month ||
    (refDate.getMonth() === month && refDate.getDate() < day)
  ) {
    age--;
  }
  return age >= 0 ? age : null;
}

function ageToBucket(age: number): string {
  if (age < 20) return AGE_BUCKETS[0];
  if (age < 30) return AGE_BUCKETS[1];
  if (age < 40) return AGE_BUCKETS[2];
  if (age < 50) return AGE_BUCKETS[3];
  if (age < 60) return AGE_BUCKETS[4];
  return AGE_BUCKETS[5];
}

function genderCodeToSegment(
  genderCode: string,
): (typeof GENDER_VALUES)[number] {
  const code = (genderCode ?? "").trim();
  if (code === "1") return "Female";
  if (code === "2") return "Male";
  return "Unknown";
}

export function getAgeSegments(
  salesData: SalesRecord[],
  memberDemographics?: MemberDemographics | null,
): CustomerSegment[] {
  const memberRevenues = new Map<string, number>();
  salesData.forEach((sale) => {
    if (sale.totalCost <= 0) return;
    const mid = sale.memberId;
    memberRevenues.set(mid, (memberRevenues.get(mid) ?? 0) + sale.totalCost);
  });
  const totalMembers = memberRevenues.size;
  if (totalMembers === 0) return [];

  const bucketMap = new Map<string, { count: number; totalRevenue: number }>();
  AGE_BUCKETS.forEach((b) => bucketMap.set(b, { count: 0, totalRevenue: 0 }));

  memberRevenues.forEach((totalRevenue, memberId) => {
    let bucket: string;
    const demo = memberDemographics?.[memberId];
    if (demo?.birthdate) {
      const age = ageFromBirthdate(demo.birthdate);
      bucket =
        age !== null
          ? ageToBucket(age)
          : AGE_BUCKETS[memberHash(memberId) % AGE_BUCKETS.length];
    } else {
      bucket = AGE_BUCKETS[memberHash(memberId) % AGE_BUCKETS.length];
    }
    const d = bucketMap.get(bucket)!;
    d.count++;
    d.totalRevenue += totalRevenue;
  });

  return Array.from(bucketMap.entries())
    .filter(([, d]) => d.count > 0)
    .map(([segment, d]) => ({
      segment,
      count: d.count,
      totalRevenue: d.totalRevenue,
      averageRevenue: d.count > 0 ? d.totalRevenue / d.count : 0,
      percentage: totalMembers > 0 ? (d.count / totalMembers) * 100 : 0,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function getGenderSegments(
  salesData: SalesRecord[],
  memberDemographics?: MemberDemographics | null,
): CustomerSegment[] {
  const memberRevenues = new Map<string, number>();
  salesData.forEach((sale) => {
    if (sale.totalCost <= 0) return;
    const mid = sale.memberId;
    memberRevenues.set(mid, (memberRevenues.get(mid) ?? 0) + sale.totalCost);
  });
  const totalMembers = memberRevenues.size;
  if (totalMembers === 0) return [];

  const segmentMap = new Map<string, { count: number; totalRevenue: number }>();
  GENDER_VALUES.forEach((g) => segmentMap.set(g, { count: 0, totalRevenue: 0 }));

  memberRevenues.forEach((totalRevenue, memberId) => {
    let gender: (typeof GENDER_VALUES)[number];
    const demo = memberDemographics?.[memberId];
    if (demo) {
      gender = genderCodeToSegment(demo.genderCode);
    } else {
      gender = GENDER_VALUES[memberHash(memberId) % GENDER_VALUES.length];
    }
    const d = segmentMap.get(gender)!;
    d.count++;
    d.totalRevenue += totalRevenue;
  });

  return Array.from(segmentMap.entries())
    .filter(([, d]) => d.count > 0)
    .map(([segment, d]) => ({
      segment,
      count: d.count,
      totalRevenue: d.totalRevenue,
      averageRevenue: d.count > 0 ? d.totalRevenue / d.count : 0,
      percentage: totalMembers > 0 ? (d.count / totalMembers) * 100 : 0,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}
