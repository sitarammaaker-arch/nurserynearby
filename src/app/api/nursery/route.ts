// src/app/api/nursery/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city     = searchParams.get("city");
  const category = searchParams.get("category");
  const q        = searchParams.get("q");
  const page     = Number(searchParams.get("page") ?? 1);
  const limit    = Number(searchParams.get("limit") ?? 12);
  const featured = searchParams.get("featured") === "true";
  const sort     = searchParams.get("sort") ?? "featured";

  try {
    const where: any = {
      isActive: true,
      ...(city     && city !== "all" && { city:       { slug: city } }),
      ...(category && { categories: { some: { category: { slug: category } } } }),
      ...(q        && { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }),
      ...(featured && { isFeatured: true }),
    };
    const orderBy: any =
      sort === "rating"  ? [{ avgRating: "desc" }] :
      sort === "newest"  ? [{ createdAt: "desc" }] :
      sort === "reviews" ? [{ totalReviews: "desc" }] :
                           [{ isFeatured: "desc" }, { avgRating: "desc" }];

    const [nurseries, total] = await Promise.all([
      prisma.nursery.findMany({
        where, orderBy,
        include: {
          city:       { select: { name: true, slug: true } },
          categories: { include: { category: { select: { name: true, slug: true, icon: true } } } },
          photos:     { where: { isPrimary: true }, take: 1 },
        },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.nursery.count({ where }),
    ]);

    return NextResponse.json({ nurseries, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch nurseries" }, { status: 500 });
  }
}
