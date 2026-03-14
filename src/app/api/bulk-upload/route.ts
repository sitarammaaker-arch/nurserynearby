import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { notifyBulkUpload } from "@/lib/whatsapp";

function makeSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Fix scientific notation phone numbers like 9.19541E+11 → 919541000000
function fixPhone(raw: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  // Scientific notation check
  if (/\d+\.?\d*[eE][+\-]?\d+/.test(trimmed)) {
    try {
      const num = Number(trimmed);
      if (!isNaN(num) && num > 0) {
        return String(Math.round(num));
      }
    } catch {}
  }
  // Remove spaces/dashes but keep +
  return trimmed.replace(/[\s\-()]/g, "");
}

// Auto-create city if it doesn't exist, linked to state
async function findOrCreateCity(
  cityName: string,
  stateCache: Map<string, any>,
  cityCache: Map<string, string>
): Promise<string | null> {
  const key = cityName.toLowerCase().trim();
  if (!key) return null;

  // Check cache first
  if (cityCache.has(key)) return cityCache.get(key)!;

  // Look in DB by name or slug
  let city = await prisma.city.findFirst({
    where: {
      OR: [
        { name: { equals: cityName, mode: "insensitive" } },
        { slug: makeSlug(cityName) },
      ],
    },
  });

  if (city) {
    cityCache.set(key, city.id);
    return city.id;
  }

  // City doesn't exist → find matching district + state, then auto-create
  const district = await prisma.district.findFirst({
    where: { name: { equals: cityName, mode: "insensitive" } },
    include: { state: true },
  });

  let stateId: string | undefined;
  let stateName = "Unknown";

  if (district) {
    stateId   = district.stateId;
    stateName = district.state.name;
  } else {
    // Try matching state name
    const state = await prisma.state.findFirst({
      where: { name: { equals: cityName, mode: "insensitive" } },
    });
    if (state) { stateId = state.id; stateName = state.name; }
  }

  // Create the city
  const slug = makeSlug(cityName);
  let finalSlug = slug;
  const existing = await prisma.city.findUnique({ where: { slug } });
  if (existing) finalSlug = `${slug}-${Date.now()}`;

  city = await prisma.city.create({
    data: {
      name:       cityName.trim(),
      slug:       finalSlug,
      state:      stateName,
      stateId:    stateId ?? undefined,
      districtId: district?.id ?? undefined,
      isActive:   true,
    },
  });

  cityCache.set(key, city.id);
  console.log(`  📍 Auto-created city: ${cityName} (${stateName})`);
  return city.id;
}

export async function POST(request: Request) {
  try {
    const { rows } = await request.json() as { rows: Record<string, string>[] };

    if (!rows?.length)       return NextResponse.json({ error: "No rows provided" }, { status: 400 });
    if (rows.length > 10000) return NextResponse.json({ error: "Max 10,000 rows per upload" }, { status: 400 });

    const batchId = randomUUID();
    const errors: { row: number; name: string; error: string }[] = [];
    let successCount = 0;
    let skippedDuplicates = 0;

    // Pre-fetch categories
    const allCategories = await prisma.category.findMany();

    // Caches to avoid repeated DB lookups
    const cityCache: Map<string, string> = new Map();
    const stateCache: Map<string, any>  = new Map();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const name    = row.name?.trim();
        const rawPhone= fixPhone(row.phone ?? "");
        const address = row.address?.trim();
        const city    = row.city?.trim();

        if (!name)    { errors.push({ row: i+2, name: name||"?", error: "name is required" });    continue; }
        if (!address) { errors.push({ row: i+2, name, error: "address is required" });             continue; }
        if (!city)    { errors.push({ row: i+2, name, error: "city is required" });                continue; }

        // ── Duplicate check ─────────────────────────────────
        // Check by phone number (most reliable) OR name+city
        if (rawPhone) {
          const byPhone = await prisma.nursery.findFirst({
            where: {
              OR: [
                { phone:    rawPhone },
                { phone2:   rawPhone },
                { whatsapp: rawPhone.replace(/^\+91/, "").replace(/^91/, "") },
              ],
            },
            select: { id: true },
          });
          if (byPhone) {
            skippedDuplicates++;
            errors.push({ row: i+2, name, error: `Duplicate: phone ${rawPhone} already exists` });
            continue;
          }
        }

        // Also check by name + city combo
        const byNameCity = await prisma.nursery.findFirst({
          where: {
            name: { equals: name, mode: "insensitive" },
            city: { name:  { equals: city, mode: "insensitive" } },
          },
          select: { id: true },
        });
        if (byNameCity) {
          skippedDuplicates++;
          errors.push({ row: i+2, name, error: `Duplicate: "${name}" already listed in ${city}` });
          continue;
        }

        // ── Find or create city ──────────────────────────────
        const cityId = await findOrCreateCity(city, stateCache, cityCache);
        if (!cityId) {
          errors.push({ row: i+2, name, error: `Could not resolve city: "${city}"` });
          continue;
        }

        // ── Resolve categories ───────────────────────────────
        const categoryNames = row.categories
          ? row.categories.split(/[|,]/).map((s) => s.trim()).filter(Boolean)
          : [];
        const categoryIds = categoryNames
          .map((n) => allCategories.find(
            (c) => c.name.toLowerCase() === n.toLowerCase() || c.slug === makeSlug(n)
          ))
          .filter(Boolean)
          .map((c: any) => c.id);

        // ── Build unique slug ────────────────────────────────
        let slug = makeSlug(name);
        const slugExists = await prisma.nursery.findUnique({ where: { slug } });
        if (slugExists) slug = `${slug}-${makeSlug(city)}-${Date.now()}`;

        // ── Create nursery ───────────────────────────────────
        await prisma.nursery.create({
          data: {
            name,
            slug,
            tagline:      row.tagline?.trim()      || null,
            description:  row.description?.trim()  || null,
            phone:        rawPhone                  || null,
            phone2:       fixPhone(row.phone2 ?? "") || null,
            whatsapp:     fixPhone(row.whatsapp ?? "").replace(/^\+?91/, "") || null,
            email:        row.email?.trim()         || null,
            website:      row.website?.trim()       || null,
            address,
            area:         row.area?.trim()          || null,
            landmark:     row.landmark?.trim()      || null,
            pincode:      row.pincode?.trim()        || null,
            openingHours: row.openingHours?.trim()  || null,
            closedOn:     row.closedOn?.trim()      || null,
            established:  row.established ? parseInt(row.established) : null,
            latitude:     row.latitude  ? parseFloat(row.latitude)  : null,
            longitude:    row.longitude ? parseFloat(row.longitude) : null,
            isFeatured:   row.isFeatured === "true" || row.isFeatured === "TRUE",
            isVerified:   row.isVerified === "true" || row.isVerified === "TRUE",
            isActive:     true,
            isPending:    false,
            importBatch:  batchId,
            cityId,
            categories:   categoryIds.length > 0
              ? { create: categoryIds.map((id: string) => ({ categoryId: id })) }
              : undefined,
            photos: row.primaryImageUrl?.trim()
              ? { create: [{ url: row.primaryImageUrl.trim(), isPrimary: true, alt: name }] }
              : undefined,
          },
        });

        // Update city nursery count
        await prisma.city.update({ where: { id: cityId }, data: { nurseryCount: { increment: 1 } } });
        successCount++;

      } catch (err: any) {
        errors.push({ row: i+2, name: rows[i]?.name ?? "Unknown", error: err.message ?? "Error" });
      }
    }

    // Save import log
    try {
      await prisma.bulkImportLog.create({
        data: {
          batchId,
          filename:    `bulk_upload_${new Date().toISOString().slice(0,10)}.csv`,
          totalRows:   rows.length,
          successRows: successCount,
          failedRows:  errors.length,
          errors:      errors.length > 0 ? errors : undefined,
          status:      "done",
          importedBy:  "admin",
        },
      });
    } catch {}

    notifyBulkUpload(rows.length, successCount, errors.length, batchId).catch(console.error);

    return NextResponse.json({
      success:          true,
      batchId,
      total:            rows.length,
      imported:         successCount,
      failed:           errors.length,
      skippedDuplicates,
      errors:           errors.slice(0, 100),
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Bulk upload failed: " + err.message }, { status: 500 });
  }
}
