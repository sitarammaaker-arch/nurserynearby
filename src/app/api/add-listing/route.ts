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
      name, phone, address,
      cityId, cityName, stateName, districtName,
      categories = [], tagline, description,
      whatsapp, email, website, area,
      landmark, pincode, openingHours, closedOn, established,
      images = [],
    } = body;

    if (!name?.trim())    return NextResponse.json({ error: "Nursery name is required" },  { status: 400 });
    if (!phone?.trim())   return NextResponse.json({ error: "Phone number is required" },  { status: 400 });
    if (!address?.trim()) return NextResponse.json({ error: "Address is required" },        { status: 400 });
    if (!cityId && !cityName) return NextResponse.json({ error: "City is required" }, { status: 400 });

    // Resolve city — by id/slug first, then by name, then auto-create
    let city = await prisma.city.findFirst({
      where: {
        OR: [
          ...(cityId ? [{ slug: cityId }, { id: cityId }] : []),
          ...(cityName ? [{ name: { equals: cityName, mode: "insensitive" as const } }] : []),
        ],
      },
      include: { stateRef: true },
    });

    // Auto-create city if not found
    if (!city && (cityName || districtName)) {
      const resolvedName = (cityName || districtName).trim();

      // Find state
      let stateId: string | undefined;
      if (stateName) {
        const stateRec = await prisma.state.findFirst({
          where: { name: { equals: stateName, mode: "insensitive" } },
        });
        stateId = stateRec?.id;
      }

      // Find district
      let districtId: string | undefined;
      if (districtName && stateId) {
        const distRec = await prisma.district.findFirst({
          where: { name: { equals: districtName, mode: "insensitive" }, stateId },
        });
        districtId = distRec?.id;
      }

      const slug    = resolvedName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const existing = await prisma.city.findUnique({ where: { slug } });
      city = await prisma.city.create({
        data: {
          name:       resolvedName,
          slug:       existing ? `${slug}-${Date.now()}` : slug,
          state:      stateName ?? "India",
          stateId,
          districtId,
          isActive:   true,
        },
        include: { stateRef: true },
      });
    }

    if (!city) return NextResponse.json({ error: "City is required" }, { status: 400 });

    // Build SEO-rich slug: name + city + state
    // e.g. "shiv-green-house-karnal-haryana"
    const stateRef = city.stateId
      ? await prisma.state.findUnique({ where: { id: city.stateId }, select: { slug: true } })
      : null;

    const baseSlug   = makeSlug(name);
    const cityPart   = makeSlug(city.name);
    const statePart  = stateRef?.slug ?? "";
    const richSlug   = statePart
      ? `${baseSlug}-${cityPart}-${statePart}`
      : `${baseSlug}-${cityPart}`;

    // Ensure uniqueness
    let nurserySlug = richSlug;
    const existing  = await prisma.nursery.findUnique({ where: { slug: nurserySlug } });
    if (existing) nurserySlug = `${richSlug}-${Date.now()}`;

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
