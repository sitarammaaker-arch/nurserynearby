/**
 * MASTER FIX: Links all cities to correct states + districts
 * Fixes the "0 districts · 0 cities · No nurseries" problem on state pages
 *
 * Run: npx tsx prisma/fix-state-links.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function slug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Map all possible state name variations → canonical state name in DB
const STATE_ALIASES: Record<string, string> = {
  // Full names
  "andhra pradesh": "Andhra Pradesh",
  "arunachal pradesh": "Arunachal Pradesh",
  "assam": "Assam",
  "bihar": "Bihar",
  "chhattisgarh": "Chhattisgarh",
  "goa": "Goa",
  "gujarat": "Gujarat",
  "haryana": "Haryana",
  "himachal pradesh": "Himachal Pradesh",
  "jharkhand": "Jharkhand",
  "jammu and kashmir": "Jammu and Kashmir",
  "j&k": "Jammu and Kashmir",
  "j & k": "Jammu and Kashmir",
  "karnataka": "Karnataka",
  "kerala": "Kerala",
  "ladakh": "Ladakh",
  "madhya pradesh": "Madhya Pradesh",
  "maharashtra": "Maharashtra",
  "manipur": "Manipur",
  "meghalaya": "Meghalaya",
  "mizoram": "Mizoram",
  "nagaland": "Nagaland",
  "odisha": "Odisha",
  "orissa": "Odisha",
  "punjab": "Punjab",
  "rajasthan": "Rajasthan",
  "sikkim": "Sikkim",
  "tamil nadu": "Tamil Nadu",
  "tamilnadu": "Tamil Nadu",
  "telangana": "Telangana",
  "tripura": "Tripura",
  "uttar pradesh": "Uttar Pradesh",
  "up": "Uttar Pradesh",
  "uttarakhand": "Uttarakhand",
  "uttaranchal": "Uttarakhand",
  "west bengal": "West Bengal",
  "delhi": "Delhi",
  "chandigarh": "Chandigarh",
  "puducherry": "Puducherry",
  "pondicherry": "Puducherry",
  "andaman and nicobar": "Andaman and Nicobar",
  "lakshadweep": "Lakshadweep",
  "dadra and nagar haveli": "Dadra and Nagar Haveli",
  "daman and diu": "Daman and Diu",
  // Short codes
  "hp": "Himachal Pradesh",
  "jk": "Jammu and Kashmir",
  "ap": "Andhra Pradesh",
  "tn": "Tamil Nadu",
  "wb": "West Bengal",
  "mp": "Madhya Pradesh",
  "uk": "Uttarakhand",
};

async function main() {
  console.log("🔧 MASTER FIX: Linking all cities to states...\n");

  // 1. Load all states into map
  const states = await prisma.state.findMany();
  const stateByName: Record<string, any> = {};
  const stateBySlug: Record<string, any> = {};
  for (const st of states) {
    stateByName[st.name.toLowerCase()] = st;
    stateBySlug[st.slug] = st;
  }

  // 2. Load all cities without stateId
  const cities = await prisma.city.findMany({
    where: { stateId: null },
  });
  console.log(`Found ${cities.length} cities without stateId\n`);

  let linked = 0, skipped = 0;

  for (const city of cities) {
    const stateRaw = (city.state ?? "").toLowerCase().trim();

    // Try alias map first
    let stateName = STATE_ALIASES[stateRaw];

    // Try direct name match
    if (!stateName) {
      stateName = stateByName[stateRaw]?.name;
    }

    // Try slug match
    if (!stateName) {
      const sl = slug(city.state ?? "");
      stateName = stateBySlug[sl]?.name;
    }

    if (!stateName) {
      skipped++;
      continue;
    }

    const stateRec = stateByName[stateName.toLowerCase()];
    if (!stateRec) { skipped++; continue; }

    // Try to find matching district
    const districtMatch = await prisma.district.findFirst({
      where: {
        stateId: stateRec.id,
        name: { equals: city.name, mode: "insensitive" },
      },
    });

    await prisma.city.update({
      where: { id: city.id },
      data: {
        stateId:    stateRec.id,
        districtId: districtMatch?.id ?? undefined,
      },
    });
    linked++;
  }

  console.log(`✅ Linked ${linked} cities to states`);
  console.log(`⚠️  Skipped ${skipped} cities (state name unrecognized)\n`);

  // 3. Now update nurseries to link to state via their city
  console.log("🔗 Linking nurseries to states via cities...");
  const nurseriesWithoutState = await prisma.nursery.findMany({
    where:   { stateId: null },
    include: { city: { select: { stateId: true, districtId: true } } },
  });

  let nurseryLinked = 0;
  for (const n of nurseriesWithoutState) {
    if (n.city.stateId) {
      await prisma.nursery.update({
        where: { id: n.id },
        data: {
          stateId:    n.city.stateId,
          districtId: n.city.districtId ?? undefined,
        },
      });
      nurseryLinked++;
    }
  }
  console.log(`✅ Linked ${nurseryLinked} nurseries to states\n`);

  // 4. Update nursery counts on cities
  console.log("📊 Updating city nursery counts...");
  const allCities = await prisma.city.findMany({
    include: { _count: { select: { nurseries: true } } },
  });
  for (const c of allCities) {
    const count = c._count?.nurseries ?? 0;
    if (count !== c.nurseryCount) {
      await prisma.city.update({
        where: { id: c.id },
        data:  { nurseryCount: count },
      });
    }
  }
  console.log(`✅ Updated nursery counts on ${allCities.length} cities\n`);

  // 5. Update district nursery counts
  console.log("📊 Updating district nursery counts...");
  const allDistricts = await prisma.district.findMany({
    include: { cities: { select: { nurseryCount: true } } },
  });
  for (const d of allDistricts) {
    const count = d.cities.reduce((s, c) => s + (c.nurseryCount ?? 0), 0);
    await prisma.district.update({
      where: { id: d.id },
      data:  { nurseryCount: count },
    });
  }
  console.log(`✅ Updated nursery counts on ${allDistricts.length} districts\n`);

  // 6. Update state nursery counts
  console.log("📊 Updating state nursery counts...");
  for (const st of states) {
    const count = await prisma.nursery.count({
      where: { isActive: true, stateId: st.id },
    });
    await prisma.state.update({
      where: { id: st.id },
      data:  {
        nurseryCount:  count,
        districtCount: await prisma.district.count({ where: { stateId: st.id } }),
      },
    });
    if (count > 0) {
      console.log(`  ${st.code.padEnd(4)} ${st.name.padEnd(30)} → ${count} nurseries`);
    }
  }

  // 7. Final summary
  const totalNurseries = await prisma.nursery.count({ where: { isActive: true } });
  const totalCities    = await prisma.city.count({ where: { isActive: true } });
  const linkedCities   = await prisma.city.count({ where: { stateId: { not: null } } });
  const totalDistricts = await prisma.district.count();

  console.log(`\n${"═".repeat(55)}`);
  console.log(`🎉 FIX COMPLETE!`);
  console.log(`   Total nurseries  : ${totalNurseries.toLocaleString()}`);
  console.log(`   Total cities     : ${totalCities} (${linkedCities} linked to states)`);
  console.log(`   Total districts  : ${totalDistricts}`);
  console.log(`\n✅ All state pages should now show correct data.`);
  console.log(`   Visit: /himachal-pradesh, /karnataka, /kerala etc.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
