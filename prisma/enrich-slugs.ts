/**
 * Enrich existing nursery slugs with city + state
 * Before: /listing/shiv-green-house
 * After:  /listing/shiv-green-house-karnal-haryana
 *
 * Run: npx tsx prisma/enrich-slugs.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function makeSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🔄 Enriching nursery slugs with city + state...\n");

  const nurseries = await prisma.nursery.findMany({
    include: {
      city: {
        include: { stateRef: { select: { slug: true, name: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  let updated = 0;
  let skipped = 0;
  let alreadyRich = 0;

  for (const nursery of nurseries) {
    const citySlug  = makeSlug(nursery.city.name);
    const stateSlug = nursery.city.stateRef?.slug ?? "";

    // Check if slug already contains city name — already enriched
    if (nursery.slug.includes(citySlug)) {
      alreadyRich++;
      continue;
    }

    // Build rich slug
    const baseName = makeSlug(nursery.name);
    const richSlug = stateSlug
      ? `${baseName}-${citySlug}-${stateSlug}`
      : `${baseName}-${citySlug}`;

    // Check if rich slug already taken by another nursery
    const conflict = await prisma.nursery.findFirst({
      where: { slug: richSlug, id: { not: nursery.id } },
    });

    let finalSlug = richSlug;
    if (conflict) {
      finalSlug = `${richSlug}-${Date.now()}`;
    }

    try {
      await prisma.nursery.update({
        where: { id: nursery.id },
        data:  { slug: finalSlug },
      });
      console.log(`  ✅ ${nursery.slug}`);
      console.log(`     → ${finalSlug}`);
      updated++;
    } catch (e: any) {
      console.log(`  ❌ Failed: ${nursery.name} — ${e.message}`);
      skipped++;
    }
  }

  console.log(`\n🎉 Slug enrichment complete!`);
  console.log(`   Updated:      ${updated}`);
  console.log(`   Already rich: ${alreadyRich}`);
  console.log(`   Failed:       ${skipped}`);
  console.log(`\n⚠️  Note: Old URLs like /listing/shiv-green-house will now 404.`);
  console.log(`   Add redirects in next.config.js if needed for existing bookmarks.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
