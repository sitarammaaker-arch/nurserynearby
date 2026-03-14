import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD ?? "admin@nursery2024";
    const adminSecret   = process.env.ADMIN_SECRET   ?? "nurseryadmin2024";

    if (!password || password !== adminPassword) {
      // Delay to slow brute force
      await new Promise((r) => setTimeout(r, 1000));
      return NextResponse.json({ error: "Incorrect password. Try again." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", adminSecret, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   60 * 60 * 24 * 7, // 7 days
      path:     "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
