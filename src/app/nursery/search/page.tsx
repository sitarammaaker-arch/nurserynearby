import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { NurseryCard, SearchBar } from "@/components/ui/Cards";
import { CITIES, SITE } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

interface Props { searchParams: { q?: string; city?: string; page?: string } }

export function generateMetadata({ searchParams }: Props): Metadata {
  const q = searchParams.q ?? "";
  const title = q ? `"${q}" — Nursery Search Results` : "Search Nurseries";
  return { title, description: `Find plant nurseries matching "${q}" near you.`, alternates: { canonical: `${SITE.url}/nursery/search` } };
}

async function search(q: string, city: string, page: number) {
  try {
    const where: any = {
      isActive: true,
      ...(city && city !== "all" && { city: { slug: city } }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { tagline: { contains: q, mode: "insensitive" } },
          { area: { contains: q, mode: "insensitive" } },
        ],
      }),
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
        take: 12,
        skip: (page - 1) * 12,
      }),
      prisma.nursery.count({ where }),
    ]);
    return { items, total };
  } catch {
    return { items: [], total: 0 };
  }
}

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: Props) {
  const q    = searchParams.q ?? "";
  const city = searchParams.city ?? "all";
  const page = Number(searchParams.page ?? 1);
  const cityMeta = CITIES.find((c) => c.slug === city);

  const { items, total } = await search(q, city, page);
  const nurseries = items.map((n: any) => ({
    id: n.id, name: n.name, slug: n.slug,
    tagline: n.tagline, address: n.address, area: n.area,
    cityName: n.city.name, avgRating: n.avgRating, totalReviews: n.totalReviews,
    phone: n.phone, primaryImage: n.photos[0]?.url ?? null,
    isFeatured: n.isFeatured, isVerified: n.isVerified,
    categories: n.categories.map((c: any) => c.category.name),
    established: n.established,
  }));

  return (
    <>
      <Navbar />
      <main>
        <section className="gradient-sage border-b border-gray-100 py-12">
          <div className="container">
            <div className="mb-6">
              <h1 className="font-display text-3xl font-bold text-forest-900 mb-1">
                {q ? <>Results for "<span className="text-forest">{q}</span>"</> : "Browse All Nurseries"}
              </h1>
              <p className="text-gray-500">
                {total > 0 ? `${total} nurseries found` : "No nurseries found"}
                {cityMeta ? ` in ${cityMeta.name}` : " across India"}
              </p>
            </div>
            <div className="max-w-2xl">
              <SearchBar defaultCity={city !== "all" ? city : undefined} />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            {nurseries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {nurseries.map((n: any) => <NurseryCard key={n.id} {...n} />)}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="text-7xl mb-4">🔍</div>
                <h2 className="font-display text-2xl font-bold text-gray-700 mb-3">No nurseries found</h2>
                <p className="text-gray-500 mb-6">
                  Try a different search term or browse by city.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="/nursery/all" className="btn btn-primary">Browse All Nurseries</a>
                  <a href="/add-listing" className="btn btn-outline">Add Your Nursery</a>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
