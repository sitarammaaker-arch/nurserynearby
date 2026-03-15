import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { CITIES, CATEGORIES, SITE } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const now  = new Date();

  // ── Static pages ──────────────────────────────────────────
  const statics: MetadataRoute.Sitemap = [
    // Homepage — highest priority
    { url: base,                  lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    // Core pages
    { url: `${base}/nursery/all`, lastModified: now, changeFrequency: "daily",   priority: 0.95 },
    { url: `${base}/blog`,        lastModified: now, changeFrequency: "daily",   priority: 0.90 },
    { url: `${base}/add-listing`, lastModified: now, changeFrequency: "monthly", priority: 0.80 },
    { url: `${base}/about`,       lastModified: now, changeFrequency: "monthly", priority: 0.50 },
    { url: `${base}/contact`,     lastModified: now, changeFrequency: "monthly", priority: 0.50 },
  ];

  // ── City pages — very high SEO value ─────────────────────
  const cityPages: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url:             `${base}/nursery/${c.slug}`,
    lastModified:    now,
    changeFrequency: "daily" as const,
    priority:        0.90,
  }));

  // ── Category pages (all cities) ───────────────────────────
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url:             `${base}/nursery/all/${c.slug}`,
    lastModified:    now,
    changeFrequency: "weekly" as const,
    priority:        0.80,
  }));

  // ── City + Category combinations — long tail SEO gold ─────
  // e.g. /nursery/delhi/indoor-plants, /nursery/mumbai/flower-plants
  const cityCategory: MetadataRoute.Sitemap = CITIES.flatMap((city) =>
    CATEGORIES.map((cat) => ({
      url:             `${base}/nursery/${city.slug}/${cat.slug}`,
      lastModified:    now,
      changeFrequency: "weekly" as const,
      priority:        0.85,
    }))
  );

  // ── State pages ───────────────────────────────────────────
  let statePages:    MetadataRoute.Sitemap = [];
  let districtPages: MetadataRoute.Sitemap = [];

  try {
    const states = await prisma.state.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
    statePages = states.map((s: any) => ({
      url:             `${base}/${s.slug}`,
      lastModified:    new Date(),
      changeFrequency: "weekly" as const,
      priority:        0.85,
    }));

    const districts = await prisma.district.findMany({
      where:   { isActive: true },
      include: { state: { select: { slug: true } } },
    });
    districtPages = districts.map((d: any) => ({
      url:             `${base}/${d.state.slug}/${d.slug}`,
      lastModified:    new Date(),
      changeFrequency: "weekly" as const,
      priority:        0.80,
    }));
  } catch {}

  // ── Dynamic pages from DB ─────────────────────────────────
  let nurseryPages: MetadataRoute.Sitemap = [];
  let blogPages:    MetadataRoute.Sitemap = [];

  try {
    // All active nursery listing pages
    const nurseries = await prisma.nursery.findMany({
      where:   { isActive: true },
      select:  { slug: true, updatedAt: true, isFeatured: true },
      orderBy: { updatedAt: "desc" },
    });

    nurseryPages = nurseries.map((n) => ({
      url:             `${base}/listing/${n.slug}`,
      lastModified:    n.updatedAt,
      changeFrequency: "weekly" as const,
      priority:        n.isFeatured ? 0.85 : 0.75,
    }));

    // All published blog posts
    const posts = await prisma.blogPost.findMany({
      where:   { isPublished: true },
      select:  { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });

    blogPages = posts.map((p) => ({
      url:             `${base}/blog/${p.slug}`,
      lastModified:    p.updatedAt,
      changeFrequency: "monthly" as const,
      priority:        0.70,
    }));
  } catch (e) {
    console.error("Sitemap DB error:", e);
  }

  // ── Combine all — most important first ────────────────────
  return [
    ...statics,
    ...statePages,
    ...districtPages,
    ...cityPages,
    ...cityCategory,
    ...categoryPages,
    ...nurseryPages,
    ...blogPages,
  ];
}
