import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rows } = body as { rows: Record<string, string>[] };

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: "Invalid data format." }, { status: 400 });
    }

    const batchId = randomUUID();
    let success = 0;
    const errors: { row: number; name: string; error: string }[] = [];

    // Simulate processing each row
    rows.forEach((row, i) => {
      try {
        if (!row.name || !row.phone || !row.address || !row.city) {
          throw new Error("Missing required fields");
        }
        success++;
      } catch (e: any) {
        errors.push({ row: i + 1, name: row.name ?? "Unknown", error: e.message });
      }
    });

    return NextResponse.json({
      total: rows.length,
      success,
      failed: errors.length,
      errors,
      batchId,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Upload failed" }, { status: 500 });
  }
}
