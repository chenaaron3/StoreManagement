/**
 * RFM (Recency, Frequency, Monetary) analysis.
 */
import type { SalesRecord } from "@/types/data";
import type { RFMSegment, RFMMatrixCell } from "@/types/analysis";
import { getCustomerDetails } from "./customerDetails";

export function getRFMSegments(salesData: SalesRecord[]): RFMSegment[] {
  const customerDetails = getCustomerDetails(salesData);
  const customers = Array.from(customerDetails.values());
  if (customers.length === 0) return [];

  const monetaries = customers.map((c) => c.totalRevenue).sort((a, b) => a - b);
  const p = (arr: number[], q: number) => {
    if (arr.length === 0) return 0;
    const i = Math.floor(arr.length * q);
    return arr[Math.min(i, arr.length - 1)];
  };
  const m25 = p(monetaries, 0.25);
  const m50 = p(monetaries, 0.5);
  const m75 = p(monetaries, 0.75);

  const segmentMap = new Map<
    string,
    { count: number; revenue: number; description: string; rScore: number; fScore: number; mScore: number }
  >();
  const quartileSize = Math.ceil(customers.length / 4);
  const byRecency = [...customers].sort(
    (a, b) => a.daysSinceLastPurchase - b.daysSinceLastPurchase,
  );
  const byFreq = [...customers].sort(
    (a, b) => b.transactionCount - a.transactionCount,
  );
  const recencyIdx = new Map(byRecency.map((c, i) => [c.memberId, i]));
  const freqIdx = new Map(byFreq.map((c, i) => [c.memberId, i]));

  customers.forEach((customer) => {
    const rScore =
      (recencyIdx.get(customer.memberId) ?? 0) < quartileSize ? 4
        : (recencyIdx.get(customer.memberId) ?? 0) < quartileSize * 2 ? 3
          : (recencyIdx.get(customer.memberId) ?? 0) < quartileSize * 3 ? 2
            : 1;
    const fScore =
      (freqIdx.get(customer.memberId) ?? 0) < quartileSize ? 4
        : (freqIdx.get(customer.memberId) ?? 0) < quartileSize * 2 ? 3
          : (freqIdx.get(customer.memberId) ?? 0) < quartileSize * 3 ? 2
            : 1;
    const mScore =
      customer.totalRevenue >= m75 ? 4
        : customer.totalRevenue >= m50 ? 3
          : customer.totalRevenue >= m25 ? 2
            : 1;

    let segment = "Hibernating";
    let description = "Inactive customers.";
    if (rScore >= 3 && fScore >= 3 && mScore >= 3) {
      segment = "Champions";
      description = "Best customers: recent, frequent, high spend.";
    } else if (rScore >= 3 && fScore <= 2 && mScore >= 3) {
      segment = "Potential Loyalists";
      description = "High value, recent, low frequency.";
    } else if (rScore <= 2 && fScore >= 3 && mScore >= 3) {
      segment = "At Risk";
      description = "Previously valuable, not recent.";
    } else if (rScore <= 2 && fScore <= 2 && mScore <= 2) {
      segment = "Lost";
      description = "Low value, inactive.";
    }

    if (!segmentMap.has(segment)) {
      segmentMap.set(segment, { count: 0, revenue: 0, description, rScore: 0, fScore: 0, mScore: 0 });
    }
    const seg = segmentMap.get(segment)!;
    seg.count++;
    seg.revenue += customer.totalRevenue;
    seg.rScore = (seg.rScore * (seg.count - 1) + rScore) / seg.count;
    seg.fScore = (seg.fScore * (seg.count - 1) + fScore) / seg.count;
    seg.mScore = (seg.mScore * (seg.count - 1) + mScore) / seg.count;
  });

  const totalCustomers = customers.length;
  return Array.from(segmentMap.entries())
    .map(([segment, data]) => ({
      segment,
      description: data.description,
      count: data.count,
      totalRevenue: data.revenue,
      averageRevenue: data.count > 0 ? data.revenue / data.count : 0,
      percentage: (data.count / totalCustomers) * 100,
      rScore: Math.round(data.rScore * 10) / 10,
      fScore: Math.round(data.fScore * 10) / 10,
      mScore: Math.round(data.mScore * 10) / 10,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function getRFMMatrix(salesData: SalesRecord[]): RFMMatrixCell[] {
  const customerDetails = getCustomerDetails(salesData);
  const customers = Array.from(customerDetails.values());
  if (customers.length === 0) return [];

  const monetaries = customers.map((c) => c.totalRevenue).sort((a, b) => a - b);
  const p = (arr: number[], q: number) => {
    if (arr.length === 0) return 0;
    const i = Math.floor(arr.length * q);
    return arr[Math.min(i, arr.length - 1)];
  };
  const m25 = p(monetaries, 0.25);
  const m50 = p(monetaries, 0.5);
  const m75 = p(monetaries, 0.75);

  const matrixMap = new Map<
    string,
    { count: number; revenue: number; transactionCount: number; mScoreSum: number; segments: Set<string> }
  >();
  for (let r = 1; r <= 4; r++) {
    for (let f = 1; f <= 4; f++) {
      matrixMap.set(`${r}-${f}`, {
        count: 0,
        revenue: 0,
        transactionCount: 0,
        mScoreSum: 0,
        segments: new Set(),
      });
    }
  }

  const rfmSegments = getRFMSegments(salesData);
  const quartileSize = Math.ceil(customers.length / 4);
  const byRecency = [...customers].sort(
    (a, b) => a.daysSinceLastPurchase - b.daysSinceLastPurchase,
  );
  const byFreq = [...customers].sort(
    (a, b) => b.transactionCount - a.transactionCount,
  );
  const recencyIdx = new Map(byRecency.map((c, i) => [c.memberId, i]));
  const freqIdx = new Map(byFreq.map((c, i) => [c.memberId, i]));

  customers.forEach((customer) => {
    const rScore =
      (recencyIdx.get(customer.memberId) ?? 0) < quartileSize ? 4
        : (recencyIdx.get(customer.memberId) ?? 0) < quartileSize * 2 ? 3
          : (recencyIdx.get(customer.memberId) ?? 0) < quartileSize * 3 ? 2
            : 1;
    const fScore =
      (freqIdx.get(customer.memberId) ?? 0) < quartileSize ? 4
        : (freqIdx.get(customer.memberId) ?? 0) < quartileSize * 2 ? 3
          : (freqIdx.get(customer.memberId) ?? 0) < quartileSize * 3 ? 2
            : 1;
    const mScore =
      customer.totalRevenue >= m75 ? 4
        : customer.totalRevenue >= m50 ? 3
          : customer.totalRevenue >= m25 ? 2
            : 1;
    const key = `${rScore}-${fScore}`;
    const cell = matrixMap.get(key)!;
    cell.count++;
    cell.revenue += customer.totalRevenue;
    cell.transactionCount += customer.transactionCount;
    cell.mScoreSum += mScore;
    rfmSegments.forEach((seg) => {
      const sr = Math.round(seg.rScore);
      const sf = Math.round(seg.fScore);
      if (sr === rScore && sf === fScore) cell.segments.add(seg.segment);
    });
  });

  const result: RFMMatrixCell[] = [];
  for (let r = 1; r <= 4; r++) {
    for (let f = 1; f <= 4; f++) {
      const cell = matrixMap.get(`${r}-${f}`)!;
      const segments = Array.from(cell.segments)
        .map((name) => rfmSegments.find((s) => s.segment === name))
        .filter((s): s is RFMSegment => s != null);
      result.push({
        rScore: r,
        fScore: f,
        count: cell.count,
        totalRevenue: cell.revenue,
        averageRevenue:
          cell.transactionCount > 0 ? cell.revenue / cell.transactionCount : 0,
        averageMScore: cell.count > 0 ? cell.mScoreSum / cell.count : 0,
        percentage: customers.length > 0 ? (cell.count / customers.length) * 100 : 0,
        segments,
      });
    }
  }
  return result;
}
