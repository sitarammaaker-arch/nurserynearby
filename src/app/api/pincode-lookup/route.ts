import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get("pin")?.trim();

  if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
  }

  try {
    // Call India Post free API
    let apiResult: any = null;
    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`,
        { signal: AbortSignal.timeout(5000) }
      );
      const data = await res.json();
      if (data?.[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        apiResult = {
          district:    po.District,
          state:       po.State,
          region:      po.Region,
          taluk:       po.Taluk,
          postOffices: data[0].PostOffice.map((p: any) => p.Name),
        };
      }
    } catch {}

    if (!apiResult) {
      return NextResponse.json({ error: "Pincode not found. Please enter city manually." }, { status: 404 });
    }

    // Match state in our DB
    const stateDb = await prisma.state.findFirst({
      where: { name: { equals: apiResult.state, mode: "insensitive" } },
      select: { id: true, name: true, slug: true, code: true },
    });

    // Match district in our DB
    const districtDb = stateDb
      ? await prisma.district.findFirst({
          where: {
            stateId: stateDb.id,
            name: { equals: apiResult.district, mode: "insensitive" },
          },
          select: { id: true, name: true, slug: true },
        })
      : null;

    // Match or suggest city
    const cityDb = districtDb
      ? await prisma.city.findFirst({
          where: { districtId: districtDb.id },
          select: { id: true, name: true, slug: true },
        })
      : stateDb
      ? await prisma.city.findFirst({
          where: {
            stateId: stateDb.id,
            name: { contains: apiResult.district, mode: "insensitive" },
          },
          select: { id: true, name: true, slug: true },
        })
      : null;

    return NextResponse.json({
      success:     true,
      pincode,
      district:    apiResult.district,
      state:       apiResult.state,
      taluk:       apiResult.taluk,
      postOffices: apiResult.postOffices?.slice(0, 5) ?? [],
      stateDb,
      districtDb,
      cityDb,
    });

  } catch (err: any) {
    console.error("Pincode lookup error:", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
