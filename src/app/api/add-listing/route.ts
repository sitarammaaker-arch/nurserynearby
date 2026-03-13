import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slug as makeSlug } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, address, cityId, categories = [], tagline, description,
            whatsapp, email, website, area, landmark, pincode, openingHours, closedOn, established } = body;

    if (!name?.trim())    return NextResponse.json({ error: "Nursery name is required" }, { status: 400 });
    if (!phone?.trim())   return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    if (!address?.trim()) return NextResponse.json({ error: "Address is required" }, { status: 400 });
    if (!cityId)          return NextResponse.json({ error: "City is required" }, { status: 400 });

    const city = await prisma.city.findUnique({ where: { slug: cityId } });
    if (!city) return NextResponse.json({ error: "Invalid city" }, { status: 400 });

    let nurserySlug = makeSlug(name);
    const exists = await prisma.nursery.findUnique({ where: { slug: nurserySlug } });
    if (exists) nurserySlug = `${nurserySlug}-${city.slug}-${Date.now()}`;

    const nursery = await prisma.nursery.create({
      data: {
        name: name.trim(), slug: nurserySlug,
        tagline: tagline?.trim() || null,
        description: description?.trim() || null,
        phone: phone.trim(),
        whatsapp: whatsapp?.replace(/\D/g, "") || null,
        email: email?.trim() || null,
        website: website?.trim() || null,
        address: address.trim(),
        area: area?.trim() || null,
        landmark: landmark?.trim() || null,
        pincode: pincode?.trim() || null,
        openingHours: openingHours?.trim() || null,
        closedOn: closedOn?.trim() || null,
        established: established ? parseInt(established) : null,
        cityId: city.id,
        isActive: false,
        isPending: true,
        ...(categories.length > 0 && {
          categories: {
            create: (await Promise.all(
              categories.map((s: string) => prisma.category.findUnique({ where: { slug: s } }))
            )).filter(Boolean).map((c: any) => ({ categoryId: c.id })),
          },
        }),
      },
    });

    await prisma.city.update({ where: { id: city.id }, data: { nurseryCount: { increment: 1 } } });

    return NextResponse.json({ success: true, id: nursery.id, slug: nursery.slug }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to submit listing" }, { status: 500 });
  }
}
