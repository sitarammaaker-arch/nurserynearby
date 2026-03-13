// src/app/api/reviews/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nurseryId = searchParams.get("nurseryId");
  if (!nurseryId) return NextResponse.json({ error: "nurseryId required" }, { status: 400 });
  try {
    const reviews = await prisma.review.findMany({
      where: { nurseryId, isApproved: true },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nurseryId, userId, rating, title, comment } = await req.json();
    if (!nurseryId || !userId || !rating) return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    if (rating < 1 || rating > 5) return NextResponse.json({ error: "Rating 1–5 required" }, { status: 400 });

    const review = await prisma.review.create({
      data: { nurseryId, userId, rating: Number(rating), title: title?.trim() || null, comment: comment?.trim() || null },
    });

    const agg = await prisma.review.aggregate({ where: { nurseryId, isApproved: true }, _avg: { rating: true }, _count: true });
    await prisma.nursery.update({ where: { id: nurseryId }, data: { avgRating: agg._avg.rating ?? 0, totalReviews: agg._count } });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
