import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — fetch photos for a nursery
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nurseryId = searchParams.get("nurseryId");
  if (!nurseryId) return NextResponse.json({ error: "nurseryId required" }, { status: 400 });

  try {
    const photos = await prisma.photo.findMany({
      where:   { nurseryId },
      orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
    });
    return NextResponse.json({ photos });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — add new photos to a nursery
export async function POST(request: Request) {
  try {
    const { nurseryId, photos } = await request.json();
    if (!nurseryId || !photos?.length) {
      return NextResponse.json({ error: "nurseryId and photos required" }, { status: 400 });
    }

    // If nursery has no photos yet, first one becomes primary
    const existingCount = await prisma.photo.count({ where: { nurseryId } });

    const created = await Promise.all(
      photos.map((p: any, i: number) =>
        prisma.photo.create({
          data: {
            nurseryId,
            url:       p.url,
            alt:       p.alt ?? "Nursery photo",
            isPrimary: existingCount === 0 && i === 0,
            sortOrder: existingCount + i,
          },
        })
      )
    );

    return NextResponse.json({ success: true, created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH — set primary or delete photo
export async function PATCH(request: Request) {
  try {
    const { action, photoId, nurseryId } = await request.json();

    if (action === "setPrimary") {
      // Unset all, then set this one
      await prisma.photo.updateMany({ where: { nurseryId }, data: { isPrimary: false } });
      await prisma.photo.update({ where: { id: photoId }, data: { isPrimary: true } });
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      const photo = await prisma.photo.delete({ where: { id: photoId } });
      // If deleted photo was primary, make first remaining photo primary
      if (photo.isPrimary) {
        const first = await prisma.photo.findFirst({
          where:   { nurseryId: photo.nurseryId },
          orderBy: { sortOrder: "asc" },
        });
        if (first) await prisma.photo.update({ where: { id: first.id }, data: { isPrimary: true } });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
