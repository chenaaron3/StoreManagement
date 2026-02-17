/**
 * Build member demographics (birthdate, gender) from membership + users CSVs.
 * Join: membership 会員ID → users 会員ID → 生年月日, 性別.
 * Applies the same member ID anonymization as anonymizeSales so keys match
 * mark_sales_anonymized.csv 会員ID.
 *
 * Prerequisites: run npm run anonymize-sales first (writes public/data/member_prefix_map.json).
 * Output: public/data/member_demographics.json
 * Then: npm run precompute
 */

import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import Papa from 'papaparse';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MEMBER_ID_COL = "会員ID";
const BIRTHDATE_COL = "生年月日";
const GENDER_COL = "性別";

function loadMemberPrefixMap(publicDataDir: string): Map<string, string> {
  const path = join(publicDataDir, "member_prefix_map.json");
  if (!existsSync(path)) {
    throw new Error(
      "member_prefix_map.json not found. Run: npm run anonymize-sales",
    );
  }
  const json = JSON.parse(readFileSync(path, "utf-8")) as Record<
    string,
    string
  >;
  return new Map(Object.entries(json));
}

function anonymizeMemberId(
  memberId: string,
  prefixMap: Map<string, string>,
): string {
  const mid = (memberId ?? "").trim();
  if (mid.length < 2) return mid;
  const prefix = prefixMap.get(mid.slice(0, 2));
  if (prefix) return prefix + mid.slice(2);
  return mid;
}

async function loadMembershipIds(membershipPath: string): Promise<Set<string>> {
  const ids = new Set<string>();
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(membershipPath, { encoding: "utf-8" });
    Papa.parse(stream, {
      header: true,
      skipEmptyLines: true,
      step: (results) => {
        const row = results.data as Record<string, string>;
        if (!row || typeof row !== "object") return;
        const id = row[MEMBER_ID_COL]?.trim() ?? "";
        if (id) ids.add(id);
      },
      complete: () => resolve(),
      error: (err) => reject(err),
    });
  });
  return ids;
}

async function buildDemographics(
  usersPath: string,
  membershipIds: Set<string>,
  prefixMap: Map<string, string>,
): Promise<Record<string, { birthdate: string; genderCode: string }>> {
  const out: Record<string, { birthdate: string; genderCode: string }> = {};
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(usersPath, { encoding: "utf-8" });
    Papa.parse(stream, {
      header: true,
      skipEmptyLines: true,
      step: (results) => {
        const row = results.data as Record<string, string>;
        if (!row || typeof row !== "object") return;
        const memberId = row[MEMBER_ID_COL]?.trim() ?? "";
        if (!memberId || !membershipIds.has(memberId)) return;
        const birthdate = row[BIRTHDATE_COL]?.trim() ?? "";
        const genderCode = row[GENDER_COL]?.trim() ?? "";
        const anonymizedId = anonymizeMemberId(memberId, prefixMap);
        out[anonymizedId] = { birthdate, genderCode };
      },
      complete: () => resolve(),
      error: (err) => reject(err),
    });
  });
  return out;
}

async function run() {
  const projectRoot = join(__dirname, "..");
  const dataDir = join(projectRoot, "src", "data");
  const publicDataDir = join(projectRoot, "public", "data");

  const membershipPath = join(dataDir, "mark_membership_MD_LM_EL.csv");
  const usersPath = join(dataDir, "mark_users.csv");

  if (!existsSync(membershipPath)) {
    throw new Error(`Missing: ${membershipPath}`);
  }
  if (!existsSync(usersPath)) {
    throw new Error(`Missing: ${usersPath}`);
  }

  console.log("Loading member prefix map...");
  const prefixMap = loadMemberPrefixMap(publicDataDir);

  console.log("Loading membership IDs...");
  const membershipIds = await loadMembershipIds(membershipPath);
  console.log(`  ${membershipIds.size} distinct 会員ID in membership`);

  console.log("Building demographics from users (join on 会員ID)...");
  const demographics = await buildDemographics(
    usersPath,
    membershipIds,
    prefixMap,
  );
  console.log(
    `  ${Object.keys(demographics).length} members with demographics`,
  );

  if (!existsSync(publicDataDir)) mkdirSync(publicDataDir, { recursive: true });
  const outputPath = join(publicDataDir, "member_demographics.json");
  writeFileSync(outputPath, JSON.stringify(demographics, null, 2), "utf-8");
  console.log("Wrote", outputPath);
  console.log("Run: npm run precompute");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
