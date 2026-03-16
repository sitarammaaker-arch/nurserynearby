/**
 * Seeds districts for ALL remaining Indian states showing 0 districts
 * Run: npx tsx prisma/seed-all-districts.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function s(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const ALL_DISTRICTS: Record<string, string[]> = {

  // ── NORTH INDIA ──────────────────────────────────────
  "Himachal Pradesh": [
    "Bilaspur","Chamba","Hamirpur","Kangra","Kinnaur",
    "Kullu","Lahaul and Spiti","Mandi","Shimla","Sirmaur","Solan","Una"
  ],
  "Jammu and Kashmir": [
    "Anantnag","Bandipora","Baramulla","Budgam","Doda",
    "Ganderbal","Jammu","Kathua","Kishtwar","Kulgam",
    "Kupwara","Poonch","Pulwama","Rajouri","Ramban",
    "Reasi","Samba","Shopian","Srinagar","Udhampur"
  ],
  "Ladakh": ["Kargil","Leh"],
  "Uttarakhand": [
    "Almora","Bageshwar","Chamoli","Champawat","Dehradun",
    "Haridwar","Nainital","Pauri Garhwal","Pithoragarh",
    "Rudraprayag","Tehri Garhwal","Udham Singh Nagar","Uttarkashi"
  ],
  "Chandigarh": ["Chandigarh"],

  // ── SOUTH INDIA ──────────────────────────────────────
  "Andhra Pradesh": [
    "Alluri Sitharama Raju","Anakapalli","Anantapur","Bapatla",
    "Chittoor","Dr BR Ambedkar Konaseema","East Godavari","Eluru",
    "Guntur","YSR Kadapa","Kakinada","Krishna","Kurnool",
    "Nandyal","Nellore","NTR","Palnadu","Parvathipuram Manyam",
    "Prakasam","Srikakulam","Sri Sathya Sai","Tirupati",
    "Visakhapatnam","Vizianagaram","West Godavari"
  ],
  "Karnataka": [
    "Bagalkote","Ballari","Belagavi","Bengaluru Rural","Bengaluru Urban",
    "Bidar","Chamarajanagar","Chikkaballapur","Chikkamagaluru","Chitradurga",
    "Dakshina Kannada","Davangere","Dharwad","Gadag","Hassan",
    "Haveri","Kalaburagi","Kodagu","Kolar","Koppal",
    "Mandya","Mysuru","Raichur","Ramanagara","Shivamogga",
    "Tumakuru","Udupi","Uttara Kannada","Vijayapura","Yadgir","Vijayanagara"
  ],
  "Kerala": [
    "Alappuzha","Ernakulam","Idukki","Kannur","Kasaragod",
    "Kollam","Kottayam","Kozhikode","Malappuram","Palakkad",
    "Pathanamthitta","Thiruvananthapuram","Thrissur","Wayanad"
  ],
  "Tamil Nadu": [
    "Ariyalur","Chengalpattu","Chennai","Coimbatore","Cuddalore",
    "Dharmapuri","Dindigul","Erode","Kallakurichi","Kancheepuram",
    "Kanyakumari","Karur","Krishnagiri","Madurai","Mayiladuthurai",
    "Nagapattinam","Namakkal","Nilgiris","Perambalur","Pudukkottai",
    "Ramanathapuram","Ranipet","Salem","Sivaganga","Tenkasi",
    "Thanjavur","Theni","Thoothukudi","Tiruchirappalli","Tirunelveli",
    "Tirupathur","Tiruppur","Tiruvallur","Tiruvannamalai","Tiruvarur",
    "Vellore","Viluppuram","Virudhunagar"
  ],
  "Telangana": [
    "Adilabad","Bhadradri Kothagudem","Hyderabad","Jagtial","Jangaon",
    "Jayashankar Bhupalpally","Jogulamba Gadwal","Kamareddy","Karimnagar",
    "Khammam","Kumuram Bheem","Mahabubabad","Mahabubnagar","Mancherial",
    "Medak","Medchal Malkajgiri","Mulugu","Nagarkurnool","Nalgonda",
    "Narayanpet","Nirmal","Nizamabad","Peddapalli","Rajanna Sircilla",
    "Ranga Reddy","Sangareddy","Siddipet","Suryapet","Vikarabad",
    "Wanaparthy","Warangal Rural","Warangal Urban","Yadadri Bhuvanagiri"
  ],
  "Puducherry": ["Karaikal","Mahe","Puducherry","Yanam"],

  // ── EAST INDIA ───────────────────────────────────────
  "Bihar": [
    "Araria","Arwal","Aurangabad","Banka","Begusarai","Bhagalpur",
    "Bhojpur","Buxar","Darbhanga","East Champaran","Gaya","Gopalganj",
    "Jamui","Jehanabad","Kaimur","Katihar","Khagaria","Kishanganj",
    "Lakhisarai","Madhepura","Madhubani","Munger","Muzaffarpur",
    "Nalanda","Nawada","Patna","Purnia","Rohtas","Saharsa",
    "Samastipur","Saran","Sheikhpura","Sheohar","Sitamarhi","Siwan",
    "Supaul","Vaishali","West Champaran"
  ],
  "Jharkhand": [
    "Bokaro","Chatra","Deoghar","Dhanbad","Dumka","East Singhbhum",
    "Garhwa","Giridih","Godda","Gumla","Hazaribagh","Jamtara",
    "Khunti","Koderma","Latehar","Lohardaga","Pakur","Palamu",
    "Ramgarh","Ranchi","Sahebganj","Seraikela Kharsawan","Simdega",
    "West Singhbhum"
  ],
  "Odisha": [
    "Angul","Balangir","Balasore","Bargarh","Bhadrak","Boudh",
    "Cuttack","Deogarh","Dhenkanal","Gajapati","Ganjam","Jagatsinghpur",
    "Jajpur","Jharsuguda","Kalahandi","Kandhamal","Kendrapara","Kendujhar",
    "Khordha","Koraput","Malkangiri","Mayurbhanj","Nabarangpur","Nayagarh",
    "Nuapada","Puri","Rayagada","Sambalpur","Sonepur","Sundargarh"
  ],
  "West Bengal": [
    "Alipurduar","Bankura","Birbhum","Cooch Behar","Dakshin Dinajpur",
    "Darjeeling","Hooghly","Howrah","Jalpaiguri","Jhargram","Kalimpong",
    "Kolkata","Malda","Murshidabad","Nadia","North 24 Parganas",
    "Paschim Bardhaman","Paschim Medinipur","Purba Bardhaman",
    "Purba Medinipur","Purulia","South 24 Parganas","Uttar Dinajpur"
  ],

  // ── WEST INDIA ───────────────────────────────────────
  "Goa": ["North Goa","South Goa"],
  "Gujarat": [
    "Ahmedabad","Amreli","Anand","Aravalli","Banaskantha","Bharuch",
    "Bhavnagar","Botad","Chhota Udaipur","Dahod","Dang","Devbhoomi Dwarka",
    "Gandhinagar","Gir Somnath","Jamnagar","Junagadh","Kheda","Kutch",
    "Mahisagar","Mehsana","Morbi","Narmada","Navsari","Panchmahal",
    "Patan","Porbandar","Rajkot","Sabarkantha","Surat","Surendranagar",
    "Tapi","Vadodara","Valsad"
  ],
  "Maharashtra": [
    "Ahmednagar","Akola","Amravati","Aurangabad","Beed","Bhandara",
    "Buldhana","Chandrapur","Dhule","Gadchiroli","Gondia","Hingoli",
    "Jalgaon","Jalna","Kolhapur","Latur","Mumbai City","Mumbai Suburban",
    "Nagpur","Nanded","Nandurbar","Nashik","Osmanabad","Palghar",
    "Parbhani","Pune","Raigad","Ratnagiri","Sangli","Satara",
    "Sindhudurg","Solapur","Thane","Wardha","Washim","Yavatmal"
  ],
  "Dadra and Nagar Haveli": ["Dadra and Nagar Haveli"],
  "Daman and Diu": ["Daman","Diu"],

  // ── CENTRAL INDIA ────────────────────────────────────
  "Chhattisgarh": [
    "Balod","Baloda Bazar","Balrampur","Bastar","Bemetara","Bijapur",
    "Bilaspur","Dantewada","Dhamtari","Durg","Gariaband","Gaurela Pendra Marwahi",
    "Janjgir Champa","Jashpur","Kabirdham","Kanker","Khairagarh","Kondagaon",
    "Korba","Koriya","Mahasamund","Manendragarh","Mohla Manpur","Mungeli",
    "Narayanpur","Raigarh","Raipur","Rajnandgaon","Sakti","Sarangarh Bilaigarh",
    "Sukma","Surajpur","Surguja"
  ],
  "Madhya Pradesh": [
    "Agar Malwa","Alirajpur","Anuppur","Ashoknagar","Balaghat","Barwani",
    "Betul","Bhind","Bhopal","Burhanpur","Chhatarpur","Chhindwara","Damoh",
    "Datia","Dewas","Dhar","Dindori","Guna","Gwalior","Harda","Hoshangabad",
    "Indore","Jabalpur","Jhabua","Katni","Khandwa","Khargone","Mandla",
    "Mandsaur","Morena","Narsinghpur","Neemuch","Niwari","Panna","Raisen",
    "Rajgarh","Ratlam","Rewa","Sagar","Satna","Sehore","Seoni","Shahdol",
    "Shajapur","Sheopur","Shivpuri","Sidhi","Singrauli","Tikamgarh","Ujjain",
    "Umaria","Vidisha"
  ],

  // ── NORTHEAST INDIA ──────────────────────────────────
  "Arunachal Pradesh": [
    "Anjaw","Changlang","Dibang Valley","East Kameng","East Siang",
    "Kamle","Kra Daadi","Kurung Kumey","Lepa Rada","Lohit","Longding",
    "Lower Dibang Valley","Lower Siang","Lower Subansiri","Namsai",
    "Pakke Kessang","Papum Pare","Shi Yomi","Siang","Tawang",
    "Tirap","Upper Dibang Valley","Upper Siang","Upper Subansiri",
    "West Kameng","West Siang"
  ],
  "Assam": [
    "Bajali","Baksa","Barpeta","Biswanath","Bongaigaon","Cachar",
    "Charaideo","Chirang","Darrang","Dhemaji","Dhubri","Dibrugarh",
    "Dima Hasao","Goalpara","Golaghat","Hailakandi","Hojai","Jorhat",
    "Kamrup","Kamrup Metropolitan","Karbi Anglong","Karimganj","Kokrajhar",
    "Lakhimpur","Majuli","Morigaon","Nagaon","Nalbari","Sivasagar",
    "Sonitpur","South Salmara Mankachar","Tinsukia","Udalguri","West Karbi Anglong"
  ],
  "Manipur": [
    "Bishnupur","Chandel","Churachandpur","Imphal East","Imphal West",
    "Jiribam","Kakching","Kamjong","Kangpokpi","Noney","Pherzawl",
    "Senapati","Tamenglong","Tengnoupal","Thoubal","Ukhrul"
  ],
  "Meghalaya": [
    "East Garo Hills","East Jaintia Hills","East Khasi Hills",
    "Eastern West Khasi Hills","North Garo Hills","Ri Bhoi",
    "South Garo Hills","South West Garo Hills","South West Khasi Hills",
    "West Garo Hills","West Jaintia Hills","West Khasi Hills"
  ],
  "Mizoram": [
    "Aizawl","Champhai","Hnahthial","Khawzawl","Kolasib",
    "Lawngtlai","Lunglei","Mamit","Saitual","Serchhip","Siaha"
  ],
  "Nagaland": [
    "Chumoukedima","Dimapur","Kiphire","Kohima","Longleng","Mokokchung",
    "Mon","Niuland","Noklak","Peren","Phek","Shamator","Tseminyu",
    "Tuensang","Wokha","Zunheboto"
  ],
  "Sikkim": ["East Sikkim","North Sikkim","Pakyong","Soreng","South Sikkim","West Sikkim"],
  "Tripura": [
    "Dhalai","Gomati","Khowai","North Tripura","Sepahijala",
    "South Tripura","Sipahijala","Unakoti","West Tripura"
  ],

  // ── ISLANDS ──────────────────────────────────────────
  "Andaman and Nicobar": [
    "Nicobar","North and Middle Andaman","South Andaman"
  ],
  "Lakshadweep": ["Lakshadweep"],
};

async function main() {
  console.log("🌱 Seeding ALL missing districts for India...\n");

  let totalNew   = 0;
  let totalSkip  = 0;
  const results: { state: string; added: number; total: number }[] = [];

  for (const [stateName, districts] of Object.entries(ALL_DISTRICTS)) {
    const state = await prisma.state.findFirst({
      where: { name: { equals: stateName, mode: "insensitive" } },
    });

    if (!state) {
      console.warn(`  ⚠️  State not found in DB: ${stateName}`);
      continue;
    }

    let added = 0;
    for (const distName of districts) {
      const slug = s(distName);
      const existing = await prisma.district.findFirst({
        where: { stateId: state.id, slug },
      });
      if (!existing) {
        await prisma.district.create({
          data: { name: distName, slug, stateId: state.id, isActive: true },
        });
        added++;
        totalNew++;
      } else {
        totalSkip++;
      }
    }

    const total = await prisma.district.count({ where: { stateId: state.id } });
    await prisma.state.update({
      where: { id: state.id },
      data:  { districtCount: total },
    });

    results.push({ state: stateName, added, total });
    console.log(`  ✅ ${stateName.padEnd(30)} +${String(added).padStart(3)} new  (total: ${total})`);
  }

  // ── Link cities to districts where name matches ──────
  console.log("\n🔗 Linking cities to districts by name match...");
  const unlinkedCities = await prisma.city.findMany({
    where: { districtId: null, stateId: { not: null } },
  });

  let linked = 0;
  for (const city of unlinkedCities) {
    if (!city.stateId) continue;
    const dist = await prisma.district.findFirst({
      where: {
        stateId: city.stateId,
        name: { equals: city.name, mode: "insensitive" },
      },
    });
    if (dist) {
      await prisma.city.update({
        where: { id: city.id },
        data:  { districtId: dist.id },
      });
      linked++;
    }
  }

  // ── Update nursery counts on districts ───────────────
  console.log("📊 Updating district nursery counts...");
  const allDistricts = await prisma.district.findMany({
    include: { cities: { select: { nurseryCount: true } } },
  });

  for (const dist of allDistricts) {
    const count = dist.cities.reduce((sum, c) => sum + (c.nurseryCount ?? 0), 0);
    if (count > 0) {
      await prisma.district.update({
        where: { id: dist.id },
        data:  { nurseryCount: count },
      });
    }
  }

  console.log(`\n${"─".repeat(50)}`);
  console.log(`🎉 ALL INDIA districts seeded!`);
  console.log(`   New districts added : ${totalNew}`);
  console.log(`   Already existed     : ${totalSkip}`);
  console.log(`   Cities linked       : ${linked}`);
  console.log(`\n📋 States processed: ${results.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
