// src/app/sitemap.ts
import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { CITIES, CATEGORIES, SITE } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;

  const statics: MetadataRoute.Sitemap = [
    { url: base,                     lastModified: new Date(), changeFrequency: "daily",   priority: 1 },
    { url: `${base}/add-listing`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`,           lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/nursery/all`,    lastModified: new Date(), changeFrequency: "daily",   priority: 0.95 },
    ...CITIES.map((c) => ({ url: `${base}/nursery/${c.slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 })),
    ...CATEGORIES.map((c) => ({ url: `${base}/nursery/all/${c.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...CITIES.flatMap((city) => CATEGORIES.map((cat) => ({ url: `${base}/nursery/${city.slug}/${cat.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.85 }))),
  ];

  let nurseries: MetadataRoute.Sitemap = [];
  let blogs: MetadataRoute.Sitemap = [];
  try {
    const ns = await prisma.nursery.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
    nurseries = ns.map((n) => ({ url: `${base}/listing/${n.slug}`, lastModified: n.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 }));
    const ps = await prisma.blogPost.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } });
    blogs = ps.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 }));
  } catch {}

  return [...statics, ...nurseries, ...blogs];
}
