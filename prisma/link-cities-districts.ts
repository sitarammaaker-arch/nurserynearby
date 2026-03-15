/**
 * Run this once to link all existing cities to their matching districts
 * npx tsx prisma/link-cities-districts.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🔗 Linking cities to districts...\n");

  const cities    = await prisma.city.findMany({ where: { districtId: null } });
  const districts = await prisma.district.findMany({ include: { state: true } });

  let linked = 0, skipped = 0;

  for (const city of cities) {
    // Find matching district by name (exact or contains)
    const match = districts.find(
      (d) =>
        d.name.toLowerCase() === city.name.toLowerCase() ||
        d.name.toLowerCase() === city.name.toLowerCase().replace(" district", "") ||
        city.name.toLowerCase().includes(d.name.toLowerCase())
    );

    if (match) {
      await prisma.city.update({
        where: { id: city.id },
        data:  { districtId: match.id, stateId: match.stateId },
      });
      console.log(`  ✅ ${city.name} → ${match.name} (${match.state.name})`);
      linked++;
    } else {
      // Try to match by state name in city.state field
      const stateMatch = districts.find(
        (d) =>
          d.state.name.toLowerCase() === city.state.toLowerCase() &&
          d.name.toLowerCase() === city.name.toLowerCase()
      );
      if (stateMatch) {
        await prisma.city.update({
          where: { id: city.id },
          data:  { districtId: stateMatch.id, stateId: stateMatch.stateId },
        });
        console.log(`  ✅ ${city.name} → ${stateMatch.name}`);
        linked++;
      } else {
        skipped++;
      }
    }
  }

  // Also update nursery districtId from their city's districtId
  console.log("\n🔗 Updating nursery district links...");
  const nurseriesWithoutDistrict = await prisma.nursery.findMany({
    where:   { districtId: null },
    include: { city: { select: { districtId: true, stateId: true } } },
  });

  let nurseryLinked = 0;
  for (const nursery of nurseriesWithoutDistrict) {
    if (nursery.city.districtId) {
      await prisma.nursery.update({
        where: { id: nursery.id },
        data:  {
          districtId: nursery.city.districtId,
          stateId:    nursery.city.stateId ?? undefined,
        },
      });
      nurseryLinked++;
    }
  }

  // Update district nursery counts
  console.log("\n📊 Updating district nursery counts...");
  const allDistricts = await prisma.district.findMany({ select: { id: true, name: true } });
  for (const d of allDistricts) {
    const count = await prisma.nursery.count({
      where: { isActive: true, districtId: d.id },
    });
    if (count > 0) {
      await prisma.district.update({ where: { id: d.id }, data: { nurseryCount: count } });
      console.log(`  📍 ${d.name}: ${count} nurseries`);
    }
  }

  console.log(`\n🎉 Done!`);
  console.log(`   Cities linked:    ${linked}`);
  console.log(`   Cities skipped:   ${skipped} (no matching district)`);
  console.log(`   Nurseries linked: ${nurseryLinked}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
