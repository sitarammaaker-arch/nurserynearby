import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nurseryId   = searchParams.get("nurseryId");
  const nurserySlug = searchParams.get("slug");

  try {
    const where: any = { isApproved: true };
    if (nurseryId)        where.nurseryId = nurseryId;
    else if (nurserySlug) {
      const n = await prisma.nursery.findUnique({ where: { slug: nurserySlug }, select: { id: true } });
      if (!n) return NextResponse.json({ reviews: [] });
      where.nurseryId = n.id;
    } else {
      return NextResponse.json({ error: "nurseryId or slug required" }, { status: 400 });
    }
    const reviews = await prisma.review.findMany({ where, orderBy: { createdAt: "desc" }, take: 30 });
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nurseryId, nurserySlug, rating, title, comment, reviewerName } = await req.json();
    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5)
      return NextResponse.json({ error: "Rating 1–5 required" }, { status: 400 });
    if (!comment?.trim())
      return NextResponse.json({ error: "Review comment is required" }, { status: 400 });

    // Resolve nursery by id or slug
    let resolvedId = nurseryId;
    if (!resolvedId && nurserySlug) {
      const n = await prisma.nursery.findUnique({ where: { slug: nurserySlug }, select: { id: true } });
      if (!n) return NextResponse.json({ error: "Nursery not found" }, { status: 404 });
      resolvedId = n.id;
    }
    if (!resolvedId) return NextResponse.json({ error: "nurseryId or nurserySlug required" }, { status: 400 });

    const review = await prisma.review.create({
      data: {
        nurseryId:    resolvedId,
        rating:       ratingNum,
        title:        title?.trim()        || null,
        comment:      comment.trim(),
        reviewerName: reviewerName?.trim() || "Anonymous",
        isApproved:   false, // pending admin approval
      },
    });

    // Recalculate nursery stats
    const agg = await prisma.review.aggregate({
      where: { nurseryId: resolvedId, isApproved: true },
      _avg:  { rating: true },
      _count: true,
    });
    await prisma.nursery.update({
      where: { id: resolvedId },
      data:  { avgRating: agg._avg.rating ?? 0, totalReviews: agg._count },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (err: any) {
    console.error("Review POST error:", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
