import { NextResponse } from "next/server";
import { notifyTestMessage } from "@/lib/whatsapp";

// GET /api/test-whatsapp — only works in development or with admin cookie
export async function GET(request: Request) {
  // Basic protection — only allow if secret matches
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const adminSecret = process.env.ADMIN_SECRET ?? "nurseryadmin2024";

  if (secret !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const success = await notifyTestMessage();
  return NextResponse.json({
    success,
    message: success
      ? "✅ Test WhatsApp sent! Check your phone."
      : "❌ Failed — check WHATSAPP_PHONE and WHATSAPP_APIKEY in .env",
    configured: {
      phone:  !!process.env.WHATSAPP_PHONE,
      apiKey: !!process.env.WHATSAPP_APIKEY,
    },
  });
}
