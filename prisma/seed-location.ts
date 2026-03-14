import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function s(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ── All 28 States + 8 UTs ────────────────────────────────
const STATES = [
  { name:"Andhra Pradesh",        code:"AP", capital:"Amaravati",    region:"South" },
  { name:"Arunachal Pradesh",     code:"AR", capital:"Itanagar",     region:"Northeast" },
  { name:"Assam",                 code:"AS", capital:"Dispur",       region:"Northeast" },
  { name:"Bihar",                 code:"BR", capital:"Patna",        region:"East" },
  { name:"Chhattisgarh",          code:"CG", capital:"Raipur",       region:"Central" },
  { name:"Goa",                   code:"GA", capital:"Panaji",       region:"West" },
  { name:"Gujarat",               code:"GJ", capital:"Gandhinagar",  region:"West" },
  { name:"Haryana",               code:"HR", capital:"Chandigarh",   region:"North" },
  { name:"Himachal Pradesh",      code:"HP", capital:"Shimla",       region:"North" },
  { name:"Jharkhand",             code:"JH", capital:"Ranchi",       region:"East" },
  { name:"Karnataka",             code:"KA", capital:"Bengaluru",    region:"South" },
  { name:"Kerala",                code:"KL", capital:"Thiruvananthapuram", region:"South" },
  { name:"Madhya Pradesh",        code:"MP", capital:"Bhopal",       region:"Central" },
  { name:"Maharashtra",           code:"MH", capital:"Mumbai",       region:"West" },
  { name:"Manipur",               code:"MN", capital:"Imphal",       region:"Northeast" },
  { name:"Meghalaya",             code:"ML", capital:"Shillong",     region:"Northeast" },
  { name:"Mizoram",               code:"MZ", capital:"Aizawl",       region:"Northeast" },
  { name:"Nagaland",              code:"NL", capital:"Kohima",       region:"Northeast" },
  { name:"Odisha",                code:"OD", capital:"Bhubaneswar",  region:"East" },
  { name:"Punjab",                code:"PB", capital:"Chandigarh",   region:"North" },
  { name:"Rajasthan",             code:"RJ", capital:"Jaipur",       region:"North" },
  { name:"Sikkim",                code:"SK", capital:"Gangtok",      region:"Northeast" },
  { name:"Tamil Nadu",            code:"TN", capital:"Chennai",      region:"South" },
  { name:"Telangana",             code:"TS", capital:"Hyderabad",    region:"South" },
  { name:"Tripura",               code:"TR", capital:"Agartala",     region:"Northeast" },
  { name:"Uttar Pradesh",         code:"UP", capital:"Lucknow",      region:"North" },
  { name:"Uttarakhand",           code:"UK", capital:"Dehradun",     region:"North" },
  { name:"West Bengal",           code:"WB", capital:"Kolkata",      region:"East" },
  // Union Territories
  { name:"Delhi",                 code:"DL", capital:"New Delhi",    region:"North" },
  { name:"Jammu and Kashmir",     code:"JK", capital:"Srinagar",     region:"North" },
  { name:"Ladakh",                code:"LA", capital:"Leh",          region:"North" },
  { name:"Chandigarh",            code:"CH", capital:"Chandigarh",   region:"North" },
  { name:"Puducherry",            code:"PY", capital:"Puducherry",   region:"South" },
  { name:"Andaman and Nicobar",   code:"AN", capital:"Port Blair",   region:"Islands" },
  { name:"Lakshadweep",           code:"LD", capital:"Kavaratti",    region:"Islands" },
  { name:"Dadra and Nagar Haveli",code:"DN", capital:"Silvassa",     region:"West" },
  { name:"Daman and Diu",         code:"DD", capital:"Daman",        region:"West" },
];

// ── Key Districts by State ──────────────────────────────
const DISTRICTS: Record<string, string[]> = {
  "Delhi":               ["Central Delhi","East Delhi","New Delhi","North Delhi","North East Delhi","North West Delhi","Shahdara","South Delhi","South East Delhi","South West Delhi","West Delhi"],
  "Haryana":             ["Ambala","Bhiwani","Charkhi Dadri","Faridabad","Fatehabad","Gurugram","Hisar","Jhajjar","Jind","Kaithal","Karnal","Kurukshetra","Mahendragarh","Nuh","Palwal","Panchkula","Panipat","Rewari","Rohtak","Sirsa","Sonipat","Yamunanagar"],
  "Punjab":              ["Amritsar","Barnala","Bathinda","Faridkot","Fatehgarh Sahib","Fazilka","Ferozepur","Gurdaspur","Hoshiarpur","Jalandhar","Kapurthala","Ludhiana","Mansa","Moga","Mohali","Muktsar","Pathankot","Patiala","Rupnagar","Sangrur","SAS Nagar","Tarn Taran"],
  "Uttar Pradesh":       ["Agra","Aligarh","Allahabad","Ambedkar Nagar","Amethi","Amroha","Auraiya","Ayodhya","Azamgarh","Baghpat","Bahraich","Ballia","Balrampur","Banda","Barabanki","Bareilly","Basti","Bijnor","Budaun","Bulandshahr","Chandauli","Chitrakoot","Deoria","Etah","Etawah","Farrukhabad","Fatehpur","Firozabad","Gautam Buddha Nagar","Ghaziabad","Ghazipur","Gonda","Gorakhpur","Hamirpur","Hapur","Hardoi","Hathras","Jalaun","Jaunpur","Jhansi","Kannauj","Kanpur","Kasganj","Kaushambi","Kushinagar","Lakhimpur Kheri","Lalitpur","Lucknow","Mathura","Mau","Meerut","Mirzapur","Moradabad","Muzaffarnagar","Pilibhit","Pratapgarh","Raebareli","Rampur","Saharanpur","Sambhal","Sant Kabir Nagar","Shahjahanpur","Shamli","Shravasti","Siddharthnagar","Sitapur","Sonbhadra","Sultanpur","Unnao","Varanasi"],
  "Maharashtra":         ["Ahmednagar","Akola","Amravati","Aurangabad","Beed","Bhandara","Buldhana","Chandrapur","Dhule","Gadchiroli","Gondia","Hingoli","Jalgaon","Jalna","Kolhapur","Latur","Mumbai City","Mumbai Suburban","Nagpur","Nanded","Nandurbar","Nashik","Osmanabad","Palghar","Parbhani","Pune","Raigad","Ratnagiri","Sangli","Satara","Sindhudurg","Solapur","Thane","Wardha","Washim","Yavatmal"],
  "Karnataka":           ["Bagalkote","Ballari","Belagavi","Bengaluru Rural","Bengaluru Urban","Bidar","Chamarajanagar","Chikkaballapura","Chikkamagaluru","Chitradurga","Dakshina Kannada","Davanagere","Dharwad","Gadag","Hassan","Haveri","Kalaburagi","Kodagu","Kolar","Koppal","Mandya","Mysuru","Raichur","Ramanagara","Shivamogga","Tumakuru","Udupi","Uttara Kannada","Vijayapura","Yadgir"],
  "Tamil Nadu":          ["Ariyalur","Chengalpattu","Chennai","Coimbatore","Cuddalore","Dharmapuri","Dindigul","Erode","Kallakurichi","Kancheepuram","Kanyakumari","Karur","Krishnagiri","Madurai","Mayiladuthurai","Nagapattinam","Namakkal","Nilgiris","Perambalur","Pudukkottai","Ramanathapuram","Ranipet","Salem","Sivaganga","Tenkasi","Thanjavur","Theni","Thoothukudi","Tiruchirappalli","Tirunelveli","Tirupathur","Tiruppur","Tiruvallur","Tiruvannamalai","Tiruvarur","Vellore","Viluppuram","Virudhunagar"],
  "Gujarat":             ["Ahmedabad","Amreli","Anand","Aravalli","Banaskantha","Bharuch","Bhavnagar","Botad","Chhota Udaipur","Dahod","Dang","Devbhoomi Dwarka","Gandhinagar","Gir Somnath","Jamnagar","Junagadh","Kheda","Kutch","Mahisagar","Mehsana","Morbi","Narmada","Navsari","Panchmahal","Patan","Porbandar","Rajkot","Sabarkantha","Surat","Surendranagar","Tapi","Vadodara","Valsad"],
  "Rajasthan":           ["Ajmer","Alwar","Banswara","Baran","Barmer","Bharatpur","Bhilwara","Bikaner","Bundi","Chittorgarh","Churu","Dausa","Dholpur","Dungarpur","Hanumangarh","Jaipur","Jaisalmer","Jalore","Jhalawar","Jhunjhunu","Jodhpur","Karauli","Kota","Nagaur","Pali","Pratapgarh","Rajsamand","Sawai Madhopur","Sikar","Sirohi","Sri Ganganagar","Tonk","Udaipur"],
  "West Bengal":         ["Alipurduar","Bankura","Birbhum","Cooch Behar","Dakshin Dinajpur","Darjeeling","Hooghly","Howrah","Jalpaiguri","Jhargram","Kalimpong","Kolkata","Malda","Murshidabad","Nadia","North 24 Parganas","Paschim Bardhaman","Paschim Medinipur","Purba Bardhaman","Purba Medinipur","Purulia","South 24 Parganas","Uttar Dinajpur"],
  "Madhya Pradesh":      ["Agar Malwa","Alirajpur","Anuppur","Ashoknagar","Balaghat","Barwani","Betul","Bhind","Bhopal","Burhanpur","Chhatarpur","Chhindwara","Damoh","Datia","Dewas","Dhar","Dindori","Guna","Gwalior","Harda","Hoshangabad","Indore","Jabalpur","Jhabua","Katni","Khandwa","Khargone","Mandla","Mandsaur","Morena","Narsinghpur","Neemuch","Niwari","Panna","Raisen","Rajgarh","Ratlam","Rewa","Sagar","Satna","Sehore","Seoni","Shahdol","Shajapur","Sheopur","Shivpuri","Sidhi","Singrauli","Tikamgarh","Ujjain","Umaria","Vidisha"],
  "Telangana":           ["Adilabad","Bhadradri Kothagudem","Hyderabad","Jagtial","Jangaon","Jayashankar","Jogulamba","Kamareddy","Karimnagar","Khammam","Kumuram Bheem","Mahabubabad","Mahabubnagar","Mancherial","Medak","Medchal","Mulugu","Nagarkurnool","Nalgonda","Narayanpet","Nirmal","Nizamabad","Peddapalli","Rajanna Sircilla","Ranga Reddy","Sangareddy","Siddipet","Suryapet","Vikarabad","Wanaparthy","Warangal Rural","Warangal Urban","Yadadri"],
  "Kerala":              ["Alappuzha","Ernakulam","Idukki","Kannur","Kasaragod","Kollam","Kottayam","Kozhikode","Malappuram","Palakkad","Pathanamthitta","Thiruvananthapuram","Thrissur","Wayanad"],
  "Bihar":               ["Araria","Arwal","Aurangabad","Banka","Begusarai","Bhagalpur","Bhojpur","Buxar","Darbhanga","East Champaran","Gaya","Gopalganj","Jamui","Jehanabad","Kaimur","Katihar","Khagaria","Kishanganj","Lakhisarai","Madhepura","Madhubani","Munger","Muzaffarpur","Nalanda","Nawada","Patna","Purnia","Rohtas","Saharsa","Samastipur","Saran","Sheikhpura","Sheohar","Sitamarhi","Siwan","Supaul","Vaishali","West Champaran"],
  "Andhra Pradesh":      ["Alluri Sitharama Raju","Anakapalli","Anantapur","Bapatla","Chittoor","Dr. B.R. Ambedkar Konaseema","East Godavari","Eluru","Guntur","Kakinada","Krishna","Kurnool","Nandyal","NTR","Palnadu","Parvathipuram Manyam","Prakasam","Sri Potti Sriramulu","Sri Sathya Sai","Srikakulam","Tirupati","Visakhapatnam","Vizianagaram","West Godavari","YSR Kadapa"],
};

async function main() {
  console.log("🌱 Seeding India States & Districts…");

  // ── 1. Seed all States ──────────────────────────────────
  const stateMap: Record<string, string> = {};
  for (const st of STATES) {
    const rec = await prisma.state.upsert({
      where:  { slug: s(st.name) },
      update: { code: st.code, capital: st.capital, region: st.region },
      create: {
        name:    st.name,
        slug:    s(st.name),
        code:    st.code,
        capital: st.capital,
        region:  st.region,
      },
    });
    stateMap[st.name] = rec.id;
    process.stdout.write(`  ✅ ${st.name}\n`);
  }
  console.log(`\n✅ ${STATES.length} states seeded`);

  // ── 2. Seed Districts ────────────────────────────────────
  let districtCount = 0;
  for (const [stateName, districts] of Object.entries(DISTRICTS)) {
    const stateId = stateMap[stateName];
    if (!stateId) { console.warn(`  ⚠️ State not found: ${stateName}`); continue; }

    for (const dist of districts) {
      const distSlug = s(dist);
      await prisma.district.upsert({
        where:  { slug_stateId: { slug: distSlug, stateId } },
        update: { name: dist },
        create: { name: dist, slug: distSlug, stateId },
      });
      districtCount++;
    }

    // Update district count on state
    await prisma.state.update({
      where: { id: stateId },
      data:  { districtCount: districts.length },
    });
    console.log(`  ✅ ${stateName}: ${districts.length} districts`);
  }
  console.log(`\n✅ ${districtCount} districts seeded`);

  // ── 3. Link existing Cities to States ────────────────────
  const cityLinks: Record<string, { state: string; district?: string }> = {
    "delhi":     { state: "Delhi",          district: "New Delhi" },
    "mumbai":    { state: "Maharashtra",    district: "Mumbai City" },
    "bangalore": { state: "Karnataka",      district: "Bengaluru Urban" },
    "chandigarh":{ state: "Chandigarh" },
    "jaipur":    { state: "Rajasthan",      district: "Jaipur" },
    "ludhiana":  { state: "Punjab",         district: "Ludhiana" },
    "panipat":   { state: "Haryana",        district: "Panipat" },
    "pune":      { state: "Maharashtra",    district: "Pune" },
    "hyderabad": { state: "Telangana",      district: "Hyderabad" },
    "ahmedabad": { state: "Gujarat",        district: "Ahmedabad" },
    "chennai":   { state: "Tamil Nadu",     district: "Chennai" },
    "kolkata":   { state: "West Bengal",    district: "Kolkata" },
  };

  for (const [citySlug, link] of Object.entries(cityLinks)) {
    const stateId = stateMap[link.state];
    if (!stateId) continue;

    let districtId: string | undefined;
    if (link.district) {
      const dist = await prisma.district.findFirst({
        where: { name: link.district, stateId },
      });
      districtId = dist?.id;
    }

    await prisma.city.updateMany({
      where: { slug: citySlug },
      data:  { stateId, ...(districtId && { districtId }) },
    });
    console.log(`  🔗 Linked ${citySlug} → ${link.state}${link.district ? " / " + link.district : ""}`);
  }

  // ── 4. Update nursery counts per state ──────────────────
  const stateList = await prisma.state.findMany({ select: { id: true } });
  for (const state of stateList) {
    const count = await prisma.nursery.count({
      where: { isActive: true, city: { stateId: state.id } },
    });
    if (count > 0) {
      await prisma.state.update({ where: { id: state.id }, data: { nurseryCount: count } });
    }
  }

  console.log("\n🎉 Phase 1 seeding complete!");
  console.log(`   States:    ${STATES.length}`);
  console.log(`   Districts: ${districtCount}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
