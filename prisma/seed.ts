import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🌱 Seeding NurseryNearby database…");

  const cityData = [
    { name: "Delhi",      state: "Delhi" },
    { name: "Mumbai",     state: "Maharashtra" },
    { name: "Bangalore",  state: "Karnataka" },
    { name: "Chandigarh", state: "Punjab" },
    { name: "Jaipur",     state: "Rajasthan" },
    { name: "Ludhiana",   state: "Punjab" },
    { name: "Panipat",    state: "Haryana" },
    { name: "Pune",       state: "Maharashtra" },
    { name: "Hyderabad",  state: "Telangana" },
    { name: "Ahmedabad",  state: "Gujarat" },
    { name: "Chennai",    state: "Tamil Nadu" },
    { name: "Kolkata",    state: "West Bengal" },
  ];

  const cities = await Promise.all(
    cityData.map((c) =>
      prisma.city.upsert({
        where: { slug: slugify(c.name) },
        update: {},
        create: { name: c.name, slug: slugify(c.name), state: c.state },
      })
    )
  );
  console.log(`✅ ${cities.length} cities seeded`);

  const catData = [
    { name: "Indoor Plants",        icon: "🪴", order: 1 },
    { name: "Fruit Plants",         icon: "🍋", order: 2 },
    { name: "Flower Plants",        icon: "🌸", order: 3 },
    { name: "Wholesale Nursery",    icon: "🏭", order: 4 },
    { name: "Garden Supplies",      icon: "🧰", order: 5 },
    { name: "Landscaping",          icon: "🌿", order: 6 },
    { name: "Rare & Exotic Plants", icon: "🌺", order: 7 },
    { name: "Succulents & Cactus",  icon: "🌵", order: 8 },
  ];

  const categories = await Promise.all(
    catData.map((c) =>
      prisma.category.upsert({
        where: { slug: slugify(c.name) },
        update: {},
        create: { name: c.name, slug: slugify(c.name), icon: c.icon, sortOrder: c.order },
      })
    )
  );
  console.log(`✅ ${categories.length} categories seeded`);

  const delhi    = cities.find((c) => c.slug === "delhi")!;
  const bangalore = cities.find((c) => c.slug === "bangalore")!;
  const indoor   = categories.find((c) => c.slug === "indoor-plants")!;
  const flower   = categories.find((c) => c.slug === "flower-plants")!;

  await prisma.nursery.upsert({
    where: { slug: "green-paradise-nursery" },
    update: {},
    create: {
      name: "Green Paradise Nursery",
      slug: "green-paradise-nursery",
      tagline: "Where plants find their home",
      description: "Delhi's finest plant nursery since 1998. Over 2,500 varieties of indoor, outdoor, and exotic plants.",
      phone: "+91-98101-23456",
      whatsapp: "9810123456",
      email: "info@greenparadise.in",
      address: "15, Model Town Phase 2, Delhi",
      area: "Model Town",
      landmark: "Near Model Town Metro",
      pincode: "110009",
      openingHours: "Mon–Sun: 8:00 AM – 8:00 PM",
      established: 1998,
      isVerified: true, isFeatured: true, isActive: true, isPending: false,
      avgRating: 4.8, totalReviews: 234,
      cityId: delhi.id,
      photos: { create: [{ url: "https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?w=800&q=80", isPrimary: true, alt: "Green Paradise Nursery" }] },
      categories: { create: [{ categoryId: indoor.id }, { categoryId: flower.id }] },
    },
  });

  await prisma.nursery.upsert({
    where: { slug: "bloom-grow-garden-bangalore" },
    update: {},
    create: {
      name: "Bloom & Grow Garden",
      slug: "bloom-grow-garden-bangalore",
      tagline: "Rare plants, real care",
      phone: "+91-98201-34567",
      address: "5th Block, Koramangala, Bangalore",
      area: "Koramangala",
      isVerified: true, isFeatured: true, isActive: true, isPending: false,
      avgRating: 4.6, totalReviews: 187,
      cityId: bangalore.id,
      photos: { create: [{ url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80", isPrimary: true, alt: "Bloom & Grow" }] },
      categories: { create: [{ categoryId: indoor.id }] },
    },
  });

  // Blog post
  await prisma.blogPost.upsert({
    where: { slug: "indoor-plants-indian-apartments" },
    update: {},
    create: {
      title: "10 Indoor Plants That Thrive in Indian Apartments",
      slug: "indoor-plants-indian-apartments",
      excerpt: "Peace lilies to pothos — the best low-maintenance plants for every room in your Indian home.",
      content: "<h2>Why Indoor Plants Thrive in India</h2><p>India's climate is perfect for many tropical houseplants year-round.</p>",
      category: "Indoor Plants",
      tags: ["indoor plants", "India", "apartment"],
      isPublished: true,
      publishedAt: new Date("2025-03-08"),
      readTime: 5,
      author: "NurseryNearby Team",
    },
  });

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
