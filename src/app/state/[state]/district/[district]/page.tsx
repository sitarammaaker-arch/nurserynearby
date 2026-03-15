import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { NurseryCard, CategoryCard } from "@/components/ui/Cards";
import { prisma } from "@/lib/prisma";
import { SITE, CATEGORIES } from "@/lib/utils";

interface Props {
  params: { state: string; district: string };
  searchParams: { category?: string; page?: string };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const state    = await prisma.state.findUnique({ where: { slug: params.state } });
    const district = await prisma.district.findFirst({
      where: { slug: params.district, stateId: state?.id },
    });
    if (!state || !district) return { title: "District Not Found" };
    const title = `Plant Nursery in ${district.name}, ${state.name}`;
    const desc  = `Find verified plant nurseries in ${district.name} district, ${state.name}. Browse indoor plants, flower plants & garden supplies with ratings and contact info.`;
    return {
      title, description: desc,
      alternates: { canonical: `${SITE.url}/state/${params.state}/district/${params.district}` },
      openGraph:  { title, description: desc },
    };
  } catch {
    return { title: "District Nurseries" };
  }
}

export default async function DistrictPage({ params, searchParams }: Props) {
  let state:    any = null;
  let district: any = null;
  let nurseries:any[] = [];
  let nearbyDistricts: any[] = [];

  try {
    state = await prisma.state.findUnique({ where: { slug: params.state } });
    if (!state) notFound();

    district = await prisma.district.findFirst({
      where: { slug: params.district, stateId: state.id },
    });
    if (!district) notFound();

    // Nurseries in this district — via city link (districtId on nursery may be null)
    const where: any = {
      isActive: true,
      OR: [
        { districtId: district.id },          // direct link
        { city: { districtId: district.id } }, // via city
        { city: {                              // city name matches district name
            name: { equals: district.name, mode: "insensitive" }
          }
        },
      ],
    };
    if (searchParams.category) {
      where.categories = { some: { category: { slug: searchParams.category } } };
    }

    nurseries = await prisma.nursery.findMany({
      where,
      include: {
        city:       { select: { name: true, slug: true } },
        categories: { include: { category: { select: { name: true } } } },
        photos:     { where: { isPrimary: true }, take: 1 },
      },
      orderBy: [{ isFeatured: "desc" }, { avgRating: "desc" }],
      take:    12,
    });

    // Nearby districts — count via cities
    const rawNearby = await prisma.district.findMany({
      where:   { stateId: state.id, id: { not: district.id } },
      include: { cities: { select: { _count: { select: { nurseries: true } } } } },
      orderBy: { name: "asc" },
      take:    10,
    });
    nearbyDistricts = rawNearby.map((d: any) => ({
      ...d,
      nurseryCount: d.cities.reduce(
        (sum: number, city: any) => sum + (city._count?.nurseries ?? 0), 0
      ),
    }));
  } catch (e) {
    console.error(e);
    if (!state || !district) notFound();
  }

  const nurseryCards = nurseries.map((n: any) => ({
    id:           n.id,
    name:         n.name,
    slug:         n.slug,
    tagline:      n.tagline,
    address:      n.address,
    area:         n.area,
    cityName:     n.city.name,
    avgRating:    n.avgRating,
    totalReviews: n.totalReviews,
    phone:        n.phone,
    primaryImage: n.photos[0]?.url ?? null,
    isFeatured:   n.isFeatured,
    isVerified:   n.isVerified,
    categories:   n.categories.map((c: any) => c.category.name),
    established:  n.established,
  }));

  const catMeta = CATEGORIES.find((c) => c.slug === searchParams.category);

  return (
    <>
      <Navbar />
      <main>

        {/* Header */}
        <section className="gradient-sage border-b border-gray-100 py-12">
          <div className="container">
            <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-5 flex-wrap font-medium">
              <Link href="/"                         className="hover:text-forest">Home</Link>
              <span>/</span>
              <Link href="/states"                   className="hover:text-forest">States</Link>
              <span>/</span>
              <Link href={`/state/${params.state}`}  className="hover:text-forest">{state.name}</Link>
              <span>/</span>
              <span className="text-forest font-semibold">{district.name}</span>
              {catMeta && <><span>/</span><span className="text-forest font-semibold">{catMeta.name}</span></>}
            </nav>

            <h1 className="font-display text-4xl font-bold text-forest-900 mb-2">
              {catMeta ? `${catMeta.icon} ${catMeta.name} in ` : ""}
              Plant Nursery in {district.name}
            </h1>
            <p className="text-gray-500">
              {district.name} District, {state.name} · {nurseries.length > 0 ? `${nurseries.length} nurseries found` : "Be the first to list!"}
            </p>
          </div>
        </section>

        {/* Category filter */}
        <div className="sticky z-20 bg-white border-b border-gray-100 shadow-sm">
          <div className="container py-3">
            <div className="flex gap-2 py-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <Link href={`/state/${params.state}/district/${params.district}`}
                className={`badge shrink-0 px-4 py-2 text-xs transition-all ${!searchParams.category ? "bg-forest text-white" : "badge-cream hover:badge-green"}`}>
                All Types
              </Link>
              {CATEGORIES.map((c) => (
                <Link key={c.slug}
                  href={`/state/${params.state}/district/${params.district}?category=${c.slug}`}
                  className={`badge shrink-0 px-4 py-2 text-xs transition-all ${searchParams.category === c.slug ? "bg-forest text-white" : "badge-cream hover:badge-green"}`}>
                  {c.icon} {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <section className="section">
          <div className="container">
            <div className="flex flex-col lg:flex-row gap-8">

              {/* Sidebar */}
              <aside className="w-full lg:w-60 shrink-0 space-y-5">
                <div className="card p-5">
                  <p className="label mb-3">Nearby Districts</p>
                  <div className="space-y-1">
                    {nearbyDistricts.map((d: any) => (
                      <Link key={d.id}
                        href={`/state/${params.state}/district/${d.slug}`}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-forest-50 hover:text-forest transition-colors">
                        <span>{d.name}</span>
                        {d._count?.nurseries > 0 && (
                          <span className="text-2xs text-gray-400">{d._count.nurseries}</span>
                        )}
                      </Link>
                    ))}
                    <Link href={`/state/${params.state}`}
                      className="flex items-center gap-1 px-3 py-2 text-xs text-forest font-semibold hover:underline">
                      ← All {state.name} Districts
                    </Link>
                  </div>
                </div>
              </aside>

              {/* Grid */}
              <div className="flex-1 min-w-0">
                {nurseryCards.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {nurseryCards.map((n) => <NurseryCard key={n.id} {...n} />)}
                  </div>
                ) : (
                  <div className="text-center py-24">
                    <div className="text-6xl mb-4">🌱</div>
                    <h3 className="font-display text-xl font-bold text-gray-700 mb-2">
                      No nurseries listed in {district.name} yet
                    </h3>
                    <p className="text-gray-500 mb-6">Be the first nursery from this district!</p>
                    <Link href="/add-listing" className="btn btn-primary btn-lg">Add Free Listing</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Category grid */}
        <section className="section-sm gradient-sage border-t border-gray-100">
          <div className="container">
            <h2 className="font-display text-xl font-bold text-forest-900 mb-5">
              Browse by Category in {district.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {CATEGORIES.map((c) => <CategoryCard key={c.slug} {...c} citySlug="all" />)}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
