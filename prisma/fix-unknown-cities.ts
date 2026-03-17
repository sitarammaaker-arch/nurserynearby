/**
 * Fix cities with state = "Unknown"
 * Matches them to correct state by city name → district lookup
 * Run: npx tsx prisma/fix-unknown-cities.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Manual mapping: city name → state name
// These are the cities from HP, JK, Ladakh, UK CSVs
const CITY_STATE_MAP: Record<string, string> = {
  // Himachal Pradesh cities
  "Shimla": "Himachal Pradesh",
  "Manali": "Himachal Pradesh",
  "Dharamsala": "Himachal Pradesh",
  "Kullu": "Himachal Pradesh",
  "Mandi": "Himachal Pradesh",
  "Solan": "Himachal Pradesh",
  "Baddi": "Himachal Pradesh",
  "Palampur": "Himachal Pradesh",
  "Chamba": "Himachal Pradesh",
  "Hamirpur": "Himachal Pradesh",
  "Una": "Himachal Pradesh",
  "Bilaspur": "Himachal Pradesh",
  "Nahan": "Himachal Pradesh",
  "Kangra": "Himachal Pradesh",
  "Ranikhet": "Himachal Pradesh",
  "Kasauli": "Himachal Pradesh",
  "Mussoorie": "Himachal Pradesh",
  "Dalhousie": "Himachal Pradesh",
  "Parwanoo": "Himachal Pradesh",
  "Nalagarh": "Himachal Pradesh",
  "Rupnagar": "Himachal Pradesh",
  "Sundernagar": "Himachal Pradesh",
  "Jogindernagar": "Himachal Pradesh",
  "Rampur": "Himachal Pradesh",
  "Rohru": "Himachal Pradesh",
  "Narkanda": "Himachal Pradesh",
  "Theog": "Himachal Pradesh",
  "Paonta Sahib": "Himachal Pradesh",
  "Sirmaur": "Himachal Pradesh",
  "Shivamogga": "Himachal Pradesh",
  "Kufri": "Himachal Pradesh",
  "Chail": "Himachal Pradesh",
  "McLeod Ganj": "Himachal Pradesh",
  "Bhuntar": "Himachal Pradesh",
  "Naggar": "Himachal Pradesh",
  "Keylong": "Himachal Pradesh",
  "Kaza": "Himachal Pradesh",
  "Bageshwar": "Himachal Pradesh",
  "Pithoragarh": "Himachal Pradesh",
  "Gopeshwar": "Himachal Pradesh",
  "Champawat": "Himachal Pradesh",

  // Jammu & Kashmir cities
  "Srinagar": "Jammu and Kashmir",
  "Jammu": "Jammu and Kashmir",
  "Anantnag": "Jammu and Kashmir",
  "Baramulla": "Jammu and Kashmir",
  "Sopore": "Jammu and Kashmir",
  "Kathua": "Jammu and Kashmir",
  "Udhampur": "Jammu and Kashmir",
  "Rajouri": "Jammu and Kashmir",
  "Poonch": "Jammu and Kashmir",
  "Doda": "Jammu and Kashmir",
  "Kulgam": "Jammu and Kashmir",
  "Shopian": "Jammu and Kashmir",
  "Pulwama": "Jammu and Kashmir",
  "Budgam": "Jammu and Kashmir",
  "Ganderbal": "Jammu and Kashmir",
  "Bandipora": "Jammu and Kashmir",
  "Kupwara": "Jammu and Kashmir",
  "Kishtwar": "Jammu and Kashmir",
  "Ramban": "Jammu and Kashmir",
  "Reasi": "Jammu and Kashmir",
  "Samba": "Jammu and Kashmir",
  "Pathankot": "Jammu and Kashmir",
  "Pahalgam": "Jammu and Kashmir",
  "Gulmarg": "Jammu and Kashmir",
  "Pampore": "Jammu and Kashmir",
  "Awantipora": "Jammu and Kashmir",
  "Banihal": "Jammu and Kashmir",
  "Batote": "Jammu and Kashmir",
  "Katra": "Jammu and Kashmir",
  "Nagrota": "Jammu and Kashmir",
  "Vijaypur": "Jammu and Kashmir",
  "Bhaderwah": "Jammu and Kashmir",

  // Ladakh cities
  "Leh": "Ladakh",
  "Kargil": "Ladakh",
  "Nubra Valley": "Ladakh",
  "Diskit": "Ladakh",
  "Padum": "Ladakh",
  "Drass": "Ladakh",
  "Sankoo": "Ladakh",

  // Uttar Pradesh missing cities
  "Maharajganj": "Uttar Pradesh",
  "Kanpur Dehat": "Uttar Pradesh",
  "Rae Bareli": "Uttar Pradesh",
  "Mainpuri": "Uttar Pradesh",
  "Prayagraj": "Uttar Pradesh",
  "Mahoba": "Uttar Pradesh",

  // Andhra Pradesh missing cities
  "Machilipatnam": "Andhra Pradesh",
  "Ongole": "Andhra Pradesh",
  "Paderu": "Andhra Pradesh",
  "Amalapuram": "Andhra Pradesh",
  "NTR District": "Andhra Pradesh",
  "Kadapa": "Andhra Pradesh",
  "Parvathipuram": "Andhra Pradesh",
  "Vijayawada": "Andhra Pradesh",
  "Narasaraopet": "Andhra Pradesh",
  "Eluru West": "Andhra Pradesh",

  // Karnataka missing cities
  "Mangaluru": "Karnataka",
  "Bengaluru": "Karnataka",
  "Karwar": "Karnataka",

  // Uttarakhand cities
  "Dehradun": "Uttarakhand",
  "Haridwar": "Uttarakhand",
  "Rishikesh": "Uttarakhand",
  "Nainital": "Uttarakhand",
  "Haldwani": "Uttarakhand",
  "Roorkee": "Uttarakhand",
  "Rudrapur": "Uttarakhand",
  "Kashipur": "Uttarakhand",
  "Almora": "Uttarakhand",
  "Pauri": "Uttarakhand",
  "Kotdwar": "Uttarakhand",
  "Mussoorie": "Uttarakhand",
  "Tehri": "Uttarakhand",
  "Uttarkashi": "Uttarakhand",
  "Chamoli": "Uttarakhand",
  "Joshimath": "Uttarakhand",
  "Badrinath": "Uttarakhand",
  "Kedarnath": "Uttarakhand",
  "Gangotri": "Uttarakhand",
  "Yamunotri": "Uttarakhand",
  "Pithoragarh": "Uttarakhand",
  "Bageshwar": "Uttarakhand",
  "Champawat": "Uttarakhand",
  "Rudraprayag": "Uttarakhand",
  "Karnaprayag": "Uttarakhand",
  "Srinagar Garhwal": "Uttarakhand",
  "Lansdowne": "Uttarakhand",
  "Zirakpur": "Uttarakhand",
  "Vikasnagar": "Uttarakhand",
  "Herbertpur": "Uttarakhand",
  "Doiwala": "Uttarakhand",
  "Chakrata": "Uttarakhand",
  "Munsiari": "Uttarakhand",
  "Dharchula": "Uttarakhand",
  "Tanakpur": "Uttarakhand",
  "Khatima": "Uttarakhand",
  "Sitarganj": "Uttarakhand",
  "Jaspur": "Uttarakhand",
  "Pantnagar": "Uttarakhand",
  "Lalkuan": "Uttarakhand",
  "Ramnagar": "Uttarakhand",
  "Bhimtal": "Uttarakhand",
  "Mukteshwar": "Uttarakhand",
  "Ranikhet": "Uttarakhand",
  "Dwarahat": "Uttarakhand",
  "Someshwar": "Uttarakhand",
  "Kichha": "Uttarakhand",
  "Udham Singh Nagar": "Uttarakhand",
};

async function main() {
  console.log("🔧 Fixing cities with state = 'Unknown'...\n");

  // Load all states
  const states = await prisma.state.findMany();
  const stateByName: Record<string, any> = {};
  for (const st of states) {
    stateByName[st.name] = st;
  }

  // Get all cities with Unknown state
  const unknownCities = await prisma.city.findMany({
    where: {
      stateId: null,
    },
  });

  console.log(`Found ${unknownCities.length} cities with unknown/missing state\n`);

  let fixed = 0;
  let notFound = 0;

  for (const city of unknownCities) {
    // Look up state from manual map
    const stateName = CITY_STATE_MAP[city.name];

    if (!stateName) {
      // Try to find by district match
      const district = await prisma.district.findFirst({
        where: { name: { equals: city.name, mode: "insensitive" } },
        include: { state: true },
      });

      if (district) {
        await prisma.city.update({
          where: { id: city.id },
          data: {
            stateId:    district.stateId,
            districtId: district.id,
            state:      district.state.name,
          },
        });
        console.log(`  ✅ ${city.name} → ${district.state.name} (via district)`);
        fixed++;
        continue;
      }

      console.log(`  ❌ ${city.name} → NOT FOUND`);
      notFound++;
      continue;
    }

    const stateRec = stateByName[stateName];
    if (!stateRec) {
      console.log(`  ❌ ${city.name} → state "${stateName}" not in DB`);
      notFound++;
      continue;
    }

    // Find matching district
    const district = await prisma.district.findFirst({
      where: {
        stateId: stateRec.id,
        name: { equals: city.name, mode: "insensitive" },
      },
    });

    await prisma.city.update({
      where: { id: city.id },
      data: {
        stateId:    stateRec.id,
        districtId: district?.id ?? undefined,
        state:      stateName,
      },
    });

    console.log(`  ✅ ${city.name} → ${stateName}${district ? " / " + district.name : ""}`);
    fixed++;
  }

  console.log(`\n✅ Fixed: ${fixed} cities`);
  console.log(`❌ Not found: ${notFound} cities\n`);

  // Now link nurseries to states via cities
  console.log("🔗 Linking nurseries to states...");
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
  console.log(`\n✅ ${nurseryLinked} nurseries linked\n`);

  // Update all counts
  console.log("📊 Updating counts...");

  // City counts
  const allCities = await prisma.city.findMany({ select: { id: true } });
  for (const c of allCities) {
    const count = await prisma.nursery.count({ where: { cityId: c.id, isActive: true } });
    await prisma.city.update({ where: { id: c.id }, data: { nurseryCount: count } });
  }

  // District counts
  const allDistricts = await prisma.district.findMany({
    include: { cities: { select: { nurseryCount: true } } },
  });
  for (const d of allDistricts) {
    const count = d.cities.reduce((s: number, c: any) => s + (c.nurseryCount ?? 0), 0);
    await prisma.district.update({ where: { id: d.id }, data: { nurseryCount: count } });
  }

  // State counts
  console.log("\n📊 State nursery counts:\n");
  for (const st of states) {
    const count = await prisma.nursery.count({ where: { isActive: true, stateId: st.id } });
    const dcount = await prisma.district.count({ where: { stateId: st.id } });
    await prisma.state.update({ where: { id: st.id }, data: { nurseryCount: count, districtCount: dcount } });
    if (count > 0) {
      console.log(`  ${st.code.padEnd(4)} ${st.name.padEnd(28)} ${count.toLocaleString()} nurseries`);
    }
  }

  const total = await prisma.nursery.count({ where: { isActive: true } });
  console.log(`\n${"═".repeat(50)}`);
  console.log(`🎉 DONE! Total: ${total.toLocaleString()} nurseries`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
