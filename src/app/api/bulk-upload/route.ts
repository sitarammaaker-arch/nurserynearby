import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

function makeSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST(request: Request) {
  try {
    const { rows } = await request.json() as { rows: Record<string, string>[] };

    if (!rows?.length) return NextResponse.json({ error: "No rows provided" }, { status: 400 });
    if (rows.length > 10000) return NextResponse.json({ error: "Max 10,000 rows per upload" }, { status: 400 });

    const batchId = randomUUID();
    const errors: { row: number; name: string; error: string }[] = [];
    let successCount = 0;

    const [allCities, allCategories] = await Promise.all([
      prisma.city.findMany(),
      prisma.category.findMany(),
    ]);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const city = allCities.find(
          (c) => c.name.toLowerCase() === row.city?.toLowerCase().trim() || c.slug === makeSlug(row.city ?? "")
        );
        if (!city) {
          errors.push({ row: i + 2, name: row.name ?? "Unknown", error: `City "${row.city}" not found. Valid: Delhi, Mumbai, Bangalore, Chandigarh, Jaipur, Ludhiana, Panipat, Pune, Hyderabad, Ahmedabad, Chennai, Kolkata` });
          continue;
        }

        let nurserySlug = makeSlug(row.name);
        const existing = await prisma.nursery.findUnique({ where: { slug: nurserySlug } });
        if (existing) nurserySlug = `${nurserySlug}-${city.slug}-${Date.now()}`;

        const categoryNames = row.categories ? row.categories.split("|").map((s) => s.trim()).filter(Boolean) : [];
        const categoryIds = categoryNames
          .map((n) => allCategories.find((c) => c.name.toLowerCase() === n.toLowerCase() || c.slug === makeSlug(n)))
          .filter(Boolean).map((c: any) => c.id);

        await prisma.nursery.create({
          data: {
            name:         row.name.trim(),
            slug:         nurserySlug,
            tagline:      row.tagline?.trim()     || null,
            description:  row.description?.trim() || null,
            phone:        row.phone.trim(),
            phone2:       row.phone2?.trim()       || null,
            whatsapp:     row.whatsapp?.replace(/\D/g, "") || null,
            email:        row.email?.trim()        || null,
            website:      row.website?.trim()      || null,
            address:      row.address.trim(),
            area:         row.area?.trim()         || null,
            landmark:     row.landmark?.trim()     || null,
            pincode:      row.pincode?.trim()      || null,
            openingHours: row.openingHours?.trim() || null,
            closedOn:     row.closedOn?.trim()     || null,
            established:  row.established ? parseInt(row.established) : null,
            latitude:     row.latitude  ? parseFloat(row.latitude)  : null,
            longitude:    row.longitude ? parseFloat(row.longitude) : null,
            isFeatured:   row.isFeatured === "true",
            isVerified:   row.isVerified === "true",
            isActive:     true,
            isPending:    false,
            importBatch:  batchId,
            cityId:       city.id,
            categories:   categoryIds.length > 0 ? { create: categoryIds.map((id: string) => ({ categoryId: id })) } : undefined,
            photos:       row.primaryImageUrl ? { create: [{ url: row.primaryImageUrl, isPrimary: true, alt: row.name }] } : undefined,
          },
        });

        await prisma.city.update({ where: { id: city.id }, data: { nurseryCount: { increment: 1 } } });
        successCount++;
      } catch (err: any) {
        errors.push({ row: i + 2, name: row.name ?? "Unknown", error: err.message ?? "Unknown error" });
      }
    }

    try {
      await prisma.bulkImportLog.create({
        data: {
          batchId, filename: `bulk_upload_${new Date().toISOString().slice(0,10)}.csv`,
          totalRows: rows.length, successRows: successCount, failedRows: errors.length,
          errors: errors.length > 0 ? errors : undefined, status: "done", importedBy: "admin",
        },
      });
    } catch {}

    return NextResponse.json({ success: true, batchId, total: rows.length, imported: successCount, failed: errors.length, errors: errors.slice(0, 50) });
  } catch (err: any) {
    return NextResponse.json({ error: "Bulk upload failed: " + err.message }, { status: 500 });
  }
}
