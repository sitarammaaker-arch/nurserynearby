import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { NurseryCard, SearchBar } from "@/components/ui/Cards";
import { CATEGORIES, CITIES, SITE } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

interface Props {
  params: { city: string; category: string };
  searchParams: { page?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = CITIES.find((c) => c.slug === params.city);
  const cat  = CATEGORIES.find((c) => c.slug === params.category);
  const cityName = city?.name ?? "All Cities";
  const catName  = cat?.name  ?? params.category;
  const title = `${catName} in ${cityName} — Best Plant Nursery`;
  const desc  = `Find the best ${catName.toLowerCase()} nurseries in ${cityName}. Compare ratings, get phone numbers & directions.`;
  return {
    title, description: desc,
    alternates: { canonical: `${SITE.url}/nursery/${params.city}/${params.category}` },
    openGraph: { title, description: desc },
  };
}

async function getNurseries(citySlug: string, categorySlug: string, page = 1) {
  const PER_PAGE = 12;
  try {
    const where: any = {
      isActive: true,
      categories: { some: { category: { slug: categorySlug } } },
      ...(citySlug !== "all" && { city: { slug: citySlug } }),
    };
    const [items, total] = await Promise.all([
      prisma.nursery.findMany({
        where,
        include: {
          city: { select: { name: true } },
          categories: { include: { category: { select: { name: true } } } },
          photos: { where: { isPrimary: true }, take: 1 },
        },
        orderBy: [{ isFeatured: "desc" }, { avgRating: "desc" }],
        take: PER_PAGE,
        skip: (page - 1) * PER_PAGE,
      }),
      prisma.nursery.count({ where }),
    ]);
    return { items, total, pages: Math.ceil(total / PER_PAGE) };
  } catch {
    return { items: [], total: 0, pages: 0 };
  }
}

export const dynamic = "force-dynamic";

export default async function CityCategoryPage({ params, searchParams }: Props) {
  const cityMeta = params.city === "all"
    ? { name: "All Cities", slug: "all" }
    : CITIES.find((c) => c.slug === params.city);
  const catMeta = CATEGORIES.find((c) => c.slug === params.category);
  if (!catMeta) notFound();

  const page = Number(searchParams.page ?? 1);
  const { items, total, pages } = await getNurseries(params.city, params.category, page);

  const nurseries = items.length > 0 ? items.map((n: any) => ({
    id: n.id, name: n.name, slug: n.slug, tagline: n.tagline,
    address: n.address, area: n.area, cityName: n.city.name,
    avgRating: n.avgRating, totalReviews: n.totalReviews,
    phone: n.phone, primaryImage: n.photos[0]?.url ?? null,
    isFeatured: n.isFeatured, isVerified: n.isVerified,
    categories: n.categories.map((c: any) => c.category.name),
    established: n.established,
  })) : [];

  return (
    <>
      <Navbar />
      <main>
        <section className="gradient-sage border-b border-gray-100 py-12">
          <div className="container">
            <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-5 font-medium flex-wrap">
              <a href="/" className="hover:text-forest">Home</a>
              <span>/</span>
              <a href={`/nursery/${params.city}`} className="hover:text-forest">
                {cityMeta?.name ?? params.city}
              </a>
              <span>/</span>
              <span className="text-forest font-semibold">{catMeta.name}</span>
            </nav>
            <div className="flex flex-col lg:flex-row lg:items-end gap-6">
              <div className="flex-1">
                <span className="text-4xl block mb-2">{catMeta.icon}</span>
                <h1 className="font-display text-4xl font-bold text-forest-900 mb-2">
                  {catMeta.name}
                  <span className="text-sage-500 font-semibold"> in {cityMeta?.name ?? "India"}</span>
                </h1>
                <p className="text-gray-500">{total > 0 ? `${total} nurseries` : `Explore ${catMeta.name.toLowerCase()} near you`}</p>
              </div>
              <div className="lg:w-80">
                <SearchBar defaultCity={params.city !== "all" ? params.city : undefined} />
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container">
            {/* Category siblings */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 mb-8">
              {CATEGORIES.map((c) => (
                <a key={c.slug} href={`/nursery/${params.city}/${c.slug}`}
                  className={`inline-flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                    c.slug === params.category
                      ? "bg-forest text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-forest-50 hover:text-forest"
                  }`}>
                  <span className="text-base leading-none">{c.icon}</span>
                  {c.name}
                </a>
              ))}
            </div>

            {nurseries.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {nurseries.map((n: any) => <NurseryCard key={n.id} {...n} />)}
                </div>
                {pages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                      <a key={p} href={`?page=${p}`}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${p === page ? "gradient-forest text-white" : "bg-white border border-gray-200 text-gray-700 hover:border-forest"}`}>
                        {p}
                      </a>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24">
                <div className="text-7xl mb-5">{catMeta.icon}</div>
                <h2 className="font-display text-2xl font-bold text-gray-700 mb-3">
                  No {catMeta.name} nurseries listed yet
                </h2>
                <p className="text-gray-500 mb-6">Know one? Add it for free!</p>
                <a href="/add-listing" className="btn btn-primary btn-lg">Add a Nursery</a>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
