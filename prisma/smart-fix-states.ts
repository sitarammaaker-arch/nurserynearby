/**
 * SMART FIX v2 — Links all cities/nurseries to correct states
 * Run from: D:\Website\nursery
 * Command:  npx tsx prisma/smart-fix-states.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function normalize(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9 ]/g,"").replace(/\s+/g," ").trim();
}

async function main() {
  console.log("🔍 SMART FIX v2 — Starting...\n");

  // Load all states
  const states = await prisma.state.findMany();
  console.log(`✅ Loaded ${states.length} states from DB\n`);

  // Build lookup maps
  const byName: Record<string,any> = {};
  const byCode: Record<string,any> = {};
  const bySlug: Record<string,any> = {};
  for (const st of states) {
    byName[normalize(st.name)] = st;
    byCode[st.code.toUpperCase()] = st;
    bySlug[st.slug] = st;
  }

  function findState(raw: string): any {
    if (!raw?.trim()) return null;
    const n = normalize(raw);
    const u = raw.trim().toUpperCase();
    // exact name
    if (byName[n]) return byName[n];
    // code (HP, UP, AP etc)
    if (byCode[u]) return byCode[u];
    // slug
    const sl = raw.toLowerCase().replace(/[^a-z0-9]+/g,"-");
    if (bySlug[sl]) return bySlug[sl];
    // partial
    for (const [key, st] of Object.entries(byName)) {
      if (n.includes(key) || key.includes(n)) return st;
    }
    return null;
  }

  // Get distinct state values from cities table
  const cityRows = await prisma.city.findMany({
    where:  { stateId: null },
    select: { id: true, name: true, state: true },
  });

  console.log(`Found ${cityRows.length} cities without stateId\n`);

  // Show what state names exist
  const stateNames = [...new Set(cityRows.map(c => c.state))];
  console.log("State names found in cities:");
  for (const name of stateNames) {
    const match = findState(name ?? "");
    console.log(`  "${name}" → ${match ? "✅ " + match.name : "❌ NO MATCH"}`);
  }

  // Link cities to states
  console.log("\n🔗 Linking cities...");
  let linked = 0;
  for (const city of cityRows) {
    const st = findState(city.state ?? "");
    if (!st) continue;

    // Find matching district
    const dist = await prisma.district.findFirst({
      where: { stateId: st.id, name: { equals: city.name, mode: "insensitive" } },
    });

    await prisma.city.update({
      where: { id: city.id },
      data:  { stateId: st.id, districtId: dist?.id ?? undefined },
    });
    linked++;
  }
  console.log(`✅ Linked ${linked} cities to states\n`);

  // Link nurseries to states via cities — in batches
  console.log("🔗 Linking nurseries to states (batches of 1000)...");
  let nurseryLinked = 0;
  let skip = 0;
  while (true) {
    const batch = await prisma.nursery.findMany({
      where:   { stateId: null },
      include: { city: { select: { stateId: true, districtId: true } } },
      take:    1000,
      skip,
    });
    if (batch.length === 0) break;

    for (const n of batch) {
      if (!n.city.stateId) continue;
      await prisma.nursery.update({
        where: { id: n.id },
        data:  { stateId: n.city.stateId, districtId: n.city.districtId ?? undefined },
      });
      nurseryLinked++;
    }
    process.stdout.write(`\r  Nurseries linked: ${nurseryLinked}`);
    skip += 1000;
  }
  console.log(`\n✅ ${nurseryLinked} nurseries linked to states\n`);

  // Update city nursery counts
  console.log("📊 Updating city counts...");
  const allCities = await prisma.city.findMany({ select: { id: true } });
  for (const c of allCities) {
    const count = await prisma.nursery.count({ where: { cityId: c.id, isActive: true } });
    await prisma.city.update({ where: { id: c.id }, data: { nurseryCount: count } });
  }
  console.log(`✅ Updated ${allCities.length} city counts\n`);

  // Update district nursery counts
  console.log("📊 Updating district counts...");
  const allDistricts = await prisma.district.findMany({
    include: { cities: { select: { nurseryCount: true } } },
  });
  for (const d of allDistricts) {
    const count = d.cities.reduce((s:number, c:any) => s + (c.nurseryCount ?? 0), 0);
    await prisma.district.update({ where: { id: d.id }, data: { nurseryCount: count } });
  }
  console.log(`✅ Updated ${allDistricts.length} district counts\n`);

  // Update state counts + show results
  console.log("📊 Updating state counts...\n");
  for (const st of states) {
    const nurseryCount  = await prisma.nursery.count({ where: { isActive: true, stateId: st.id } });
    const districtCount = await prisma.district.count({ where: { stateId: st.id } });
    await prisma.state.update({ where: { id: st.id }, data: { nurseryCount, districtCount } });
    if (nurseryCount > 0) {
      console.log(`  ${st.code.padEnd(4)} ${st.name.padEnd(28)} ${nurseryCount.toLocaleString()} nurseries`);
    }
  }

  const total = await prisma.nursery.count({ where: { isActive: true } });
  console.log(`\n${"═".repeat(50)}`);
  console.log(`🎉 DONE! Total active nurseries: ${total.toLocaleString()}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
