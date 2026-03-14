import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { NurseryCard, CategoryCard, SearchBar } from "@/components/ui/Cards";
import { CATEGORIES, CITIES, SITE } from "@/lib/utils";

interface Props {
  params: { city: string };
  searchParams: { q?: string; category?: string; page?: string; sort?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = CITIES.find((c) => c.slug === params.city);
  const name = city?.name ?? (params.city === "all" ? "All Cities" : params.city);
  return {
    title: `Plant Nursery in ${name} — Buy Plants Near You`,
    description: `Find the best plant nurseries in ${name}. Indoor plants, fruit trees, flower plants & more.`,
    alternates: { canonical: `${SITE.url}/nursery/${params.city}` },
  };
}

async function getNurseries(citySlug: string, q?: string, category?: string, page = 1, sort = "featured") {
  try {
    const params = new URLSearchParams();
    if (citySlug !== "all") params.set("city", citySlug);
    if (q)        params.set("q", q);
    if (category) params.set("category", category);
    params.set("page",  String(page));
    params.set("limit", "12");
    params.set("sort",  sort);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/nursery?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) return { nurseries: [], total: 0, pages: 0 };
    const data = await res.json();

    const nurseries = (data.nurseries ?? []).map((n: any) => ({
      id:           n.id,
      name:         n.name,
      slug:         n.slug,
      tagline:      n.tagline,
      address:      n.address,
      area:         n.area,
      cityName:     n.city?.name ?? "",
      avgRating:    n.avgRating,
      totalReviews: n.totalReviews,
      phone:        n.phone,
      primaryImage: n.photos?.[0]?.url ?? null,
      isFeatured:   n.isFeatured,
      isVerified:   n.isVerified,
      categories:   (n.categories ?? []).map((c: any) => c.category?.name),
      established:  n.established,
    }));

    return { nurseries, total: data.total ?? 0, pages: data.pages ?? 0 };
  } catch (e) {
    console.error("getNurseries error:", e);
    return { nurseries: [], total: 0, pages: 0 };
  }
}

export default async function CityPage({ params, searchParams }: Props) {
  const cityMeta =
    params.city === "all"
      ? { name: "All Cities", slug: "all", state: "India", emoji: "🌍" }
      : CITIES.find((c) => c.slug === params.city);

  if (!cityMeta) notFound();

  const page    = Number(searchParams.page ?? 1);
  const catMeta = CATEGORIES.find((c) => c.slug === searchParams.category);
  const sort    = searchParams.sort ?? "featured";

  const { nurseries, total, pages } = await getNurseries(
    params.city, searchParams.q, searchParams.category, page, sort
  );

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="gradient-sage border-b border-gray-100 py-12">
          <div className="container">
            <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-5 font-medium flex-wrap">
              <Link href="/" className="hover:text-forest">Home</Link>
              <span>/</span>
              <Link href="/nursery/all" className="hover:text-forest">Nursery</Link>
              {params.city !== "all" && (
                <><span>/</span><span className="text-forest font-semibold">{cityMeta.name}</span></>
              )}
              {catMeta && (
                <><span>/</span><span className="text-forest font-semibold">{catMeta.name}</span></>
              )}
            </nav>
            <div className="flex flex-col lg:flex-row lg:items-end gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{(cityMeta as any).emoji ?? "🌱"}</span>
                  <h1 className="font-display text-4xl font-bold text-forest-900">
                    {catMeta ? `${catMeta.icon} ${catMeta.name} in ${cityMeta.name}` : `Nursery in ${cityMeta.name}`}
                  </h1>
                </div>
                <p className="text-gray-500">
                  {total > 0 ? `${total} nurseries found` : "No nurseries listed yet"}
                  {searchParams.q && ` for "${searchParams.q}"`}
                </p>
              </div>
              <div className="lg:w-80 xl:w-96">
                <SearchBar defaultCity={params.city !== "all" ? params.city : undefined} />
              </div>
            </div>
          </div>
        </section>

        {/* Category pills */}
        <div className="sticky top-[104px] z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="container py-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <Link href={`/nursery/${params.city}`}
                className={`badge shrink-0 px-4 py-2 text-xs transition-all ${!searchParams.category ? "bg-forest text-white" : "badge-cream hover:badge-green"}`}>
                All Types
              </Link>
              {CATEGORIES.map((c) => (
                <Link key={c.slug} href={`/nursery/${params.city}/${c.slug}`}
                  className={`badge shrink-0 px-4 py-2 text-xs transition-all ${searchParams.category === c.slug ? "bg-forest text-white" : "badge-cream hover:badge-green"}`}>
                  {c.icon} {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main */}
        <section className="py-10">
          <div className="container">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar */}
              <aside className="w-full lg:w-64 shrink-0 space-y-5">
                <div className="card p-5">
                  <p className="label mb-3">Sort By</p>
                  <div className="space-y-1">
                    {[
                      { label: "Featured First", val: "featured" },
                      { label: "Highest Rated",  val: "rating"   },
                      { label: "Most Reviews",   val: "reviews"  },
                      { label: "Newest First",   val: "newest"   },
                    ].map((s) => (
                      <Link key={s.val}
                        href={`?sort=${s.val}${searchParams.category ? "&category="+searchParams.category : ""}${searchParams.q ? "&q="+searchParams.q : ""}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${sort === s.val ? "bg-forest text-white font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sort === s.val ? "bg-white" : "bg-gray-300"}`}/>
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="card p-5">
                  <p className="label mb-3">Browse Cities</p>
                  <div className="space-y-1">
                    <Link href="/nursery/all"
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${params.city === "all" ? "bg-forest text-white font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
                      🌍 All Cities
                    </Link>
                    {CITIES.map((c) => (
                      <Link key={c.slug} href={`/nursery/${c.slug}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${params.city === c.slug ? "bg-forest text-white font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
                        <span>{c.emoji}</span> {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Grid */}
              <div className="flex-1 min-w-0">
                {nurseries.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {nurseries.map((n) => <NurseryCard key={n.id} {...n} />)}
                    </div>
                    {pages > 1 && (
                      <div className="flex justify-center gap-2 mt-10">
                        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                          <Link key={p}
                            href={`?page=${p}&sort=${sort}${searchParams.q ? "&q="+searchParams.q : ""}${searchParams.category ? "&category="+searchParams.category : ""}`}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${p === page ? "gradient-forest text-white shadow-green" : "bg-white border border-gray-200 hover:border-forest"}`}>
                            {p}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-24">
                    <div className="text-7xl mb-5">🌱</div>
                    <h3 className="font-display text-2xl font-bold text-gray-700 mb-2">No nurseries found</h3>
                    <p className="text-gray-500 mb-6">
                      {searchParams.q ? `No results for "${searchParams.q}"` : `Be the first to list in ${cityMeta.name}!`}
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Link href={`/nursery/${params.city}`} className="btn btn-outline">Clear Filters</Link>
                      <Link href="/add-listing" className="btn btn-primary">Add Free Listing</Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Category grid */}
        <section className="section-sm gradient-sage border-t border-gray-100">
          <div className="container">
            <h2 className="font-display text-2xl font-bold text-forest-900 mb-6">Browse by Category in {cityMeta.name}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {CATEGORIES.map((c) => <CategoryCard key={c.slug} {...c} citySlug={params.city} />)}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
