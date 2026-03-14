import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { id, action } = await request.json();

    if (!id || !action) {
      return NextResponse.json({ error: "id and action are required" }, { status: 400 });
    }

    let data: any = {};

    switch (action) {
      case "approve":
        // Make live on the site
        data = { isActive: true, isPending: false };
        break;

      case "deactivate":
        // Remove from site (keep in DB)
        data = { isActive: false, isPending: false };
        break;

      case "feature":
        data = { isFeatured: true };
        break;

      case "unfeature":
        data = { isFeatured: false };
        break;

      case "verify":
        data = { isVerified: true };
        break;

      case "delete":
        await prisma.nursery.delete({ where: { id } });
        return NextResponse.json({ success: true, action: "deleted" });

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const nursery = await prisma.nursery.update({
      where: { id },
      data,
      select: { id: true, name: true, isActive: true, isPending: true, isFeatured: true },
    });

    return NextResponse.json({ success: true, action, nursery });
  } catch (err: any) {
    console.error("Admin action error:", err);
    return NextResponse.json({ error: err.message ?? "Action failed" }, { status: 500 });
  }
}
