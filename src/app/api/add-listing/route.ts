import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewNursery } from "@/lib/whatsapp";

function makeSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name, phone, address, cityId,
      categories = [], tagline, description,
      whatsapp, email, website, area,
      landmark, pincode, openingHours, closedOn, established,
      images = [],
    } = body;

    if (!name?.trim())    return NextResponse.json({ error: "Nursery name is required" },  { status: 400 });
    if (!phone?.trim())   return NextResponse.json({ error: "Phone number is required" },  { status: 400 });
    if (!address?.trim()) return NextResponse.json({ error: "Address is required" },        { status: 400 });
    if (!cityId)          return NextResponse.json({ error: "City is required" },           { status: 400 });

    // Find city by slug or id
    const city = await prisma.city.findFirst({
      where: { OR: [{ slug: cityId }, { id: cityId }] },
    });
    if (!city) return NextResponse.json({ error: "Invalid city selected" }, { status: 400 });

    // Make unique slug
    let nurserySlug = makeSlug(name);
    const existing = await prisma.nursery.findUnique({ where: { slug: nurserySlug } });
    if (existing) nurserySlug = `${nurserySlug}-${city.slug}-${Date.now()}`;

    // Resolve category IDs
    const allCategories = await prisma.category.findMany();
    const categoryIds = (categories as string[])
      .map((s) => allCategories.find((c) => c.slug === s || c.name.toLowerCase() === s.toLowerCase()))
      .filter(Boolean)
      .map((c: any) => c.id);

    const nursery = await prisma.nursery.create({
      data: {
        name:         name.trim(),
        slug:         nurserySlug,
        tagline:      tagline?.trim()     || null,
        description:  description?.trim() || null,
        phone:        phone.trim(),
        whatsapp:     whatsapp?.replace(/\D/g, "") || null,
        email:        email?.trim()       || null,
        website:      website?.trim()     || null,
        address:      address.trim(),
        area:         area?.trim()        || null,
        landmark:     landmark?.trim()    || null,
        pincode:      pincode?.trim()     || null,
        openingHours: openingHours?.trim()|| null,
        closedOn:     closedOn?.trim()    || null,
        established:  established ? parseInt(established) : null,
        cityId:       city.id,
        isActive:     true,
        isPending:    false,
        categories:   categoryIds.length > 0
          ? { create: categoryIds.map((id: string) => ({ categoryId: id })) }
          : undefined,
        photos: images && images.length > 0
          ? { create: images.map((img: any, i: number) => ({
              url:       img.url,
              isPrimary: i === 0,
              alt:       name.trim(),
              sortOrder: i,
            })) }
          : undefined,
      },
    });

    await prisma.city.update({
      where: { id: city.id },
      data:  { nurseryCount: { increment: 1 } },
    });

    // Send WhatsApp notification (non-blocking)
    notifyNewNursery({
      name:    nursery.name,
      phone:   nursery.phone ?? "",
      city:    city.name,
      address: nursery.address,
      slug:    nursery.slug,
    }).catch(console.error);

    return NextResponse.json({ success: true, id: nursery.id, slug: nursery.slug }, { status: 201 });
  } catch (err: any) {
    console.error("add-listing error:", err);
    return NextResponse.json({ error: "Failed to submit listing: " + err.message }, { status: 500 });
  }
}
