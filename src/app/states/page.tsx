import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title:       "Plant Nursery by State — All India",
  description: "Find plant nurseries across all states of India. Browse by state, district and city.",
  alternates:  { canonical: `${SITE.url}/states` },
};

export const dynamic = "force-dynamic";

const REGION_ORDER = ["North","South","East","West","Central","Northeast","Islands"];

export default async function AllStatesPage() {
  let states: any[] = [];
  try {
    states = await prisma.state.findMany({
      where:   { isActive: true },
      include: { _count: { select: { districts: true, nurseries: true } } },
      orderBy: { name: "asc" },
    });
  } catch {}

  // Group by region
  const byRegion: Record<string, any[]> = {};
  for (const st of states) {
    const r = st.region ?? "Other";
    if (!byRegion[r]) byRegion[r] = [];
    byRegion[r].push(st);
  }

  const REGION_EMOJI: Record<string, string> = {
    North:     "🏔️", South:    "🌴", East:  "🌅",
    West:      "🌊", Central:  "🌿", Northeast: "🍃",
    Islands:   "🏝️", Other:    "📍",
  };

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="gradient-sage border-b border-gray-100 py-14">
          <div className="container">
            <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-5 font-medium">
              <Link href="/" className="hover:text-forest">Home</Link>
              <span>/</span>
              <span className="text-forest font-semibold">All States</span>
            </nav>
            <h1 className="font-display text-4xl font-bold text-forest-900 mb-2">
              🗺️ Plant Nurseries Across India
            </h1>
            <p className="text-gray-500 text-lg">
              Browse {states.length} states and union territories · Find nurseries by location
            </p>
          </div>
        </section>

        {/* Stats strip */}
        <div className="bg-forest text-white py-5">
          <div className="container">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                { label: "States & UTs",    value: states.length },
                { label: "Districts",        value: states.reduce((s, st) => s + (st._count?.districts ?? 0), 0) + "+" },
                { label: "Nurseries Listed", value: states.reduce((s, st) => s + (st.nurseryCount ?? 0), 0) + "+" },
                { label: "Cities Covered",   value: "100+" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-forest-300 text-xs uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* States by Region */}
        <section className="section">
          <div className="container space-y-14">
            {REGION_ORDER.map((region) => {
              const regionStates = byRegion[region];
              if (!regionStates?.length) return null;
              return (
                <div key={region}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">{REGION_EMOJI[region]}</span>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-forest-900">{region} India</h2>
                      <p className="text-sm text-gray-400">{regionStates.length} states</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {regionStates.map((state: any) => (
                      <Link key={state.slug} href={`/state/${state.slug}`}
                        className="group card-hover p-5 flex flex-col gap-2">
                        <div className="flex items-start justify-between">
                          <span className="inline-block bg-forest-50 text-forest text-xs font-bold px-2 py-1 rounded-lg border border-forest-100">
                            {state.code}
                          </span>
                          {state.nurseryCount > 0 && (
                            <span className="badge badge-green text-2xs">{state.nurseryCount}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-gray-900 group-hover:text-forest transition-colors leading-tight">
                            {state.name}
                          </h3>
                          {state.capital && (
                            <p className="text-xs text-gray-400 mt-0.5">📍 {state.capital}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-50">
                          <span className="text-2xs text-gray-400">{state._count?.districts ?? 0} districts</span>
                          <span className="text-gray-200">·</span>
                          <span className="text-2xs text-forest font-medium">
                            {state.nurseryCount > 0 ? `${state.nurseryCount} nurseries` : "Browse →"}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="section-sm gradient-forest">
          <div className="container text-center">
            <h2 className="font-display text-3xl font-bold text-white mb-3">Own a Nursery?</h2>
            <p className="text-forest-200 mb-6">List your nursery free — reach plant lovers in your district</p>
            <Link href="/add-listing" className="btn btn-lg"
              style={{ background: "#faf7f0", color: "#1a3a2a" }}>
              Add Free Listing
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
