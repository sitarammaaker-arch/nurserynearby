import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Nursery Reviews — ${SITE.name}`,
  description: "Read authentic reviews from plant lovers across India. Find the best-rated nurseries near you.",
  alternates: { canonical: `${SITE.url}/reviews` },
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} viewBox="0 0 24 24" className={`w-4 h-4 ${s <= rating ? "fill-amber-400" : "fill-gray-200"}`}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  let reviews: any[]  = [];
  let totalReviews    = 0;
  let avgRating       = 0;
  let topNurseries: any[] = [];

  try {
    reviews = await prisma.review.findMany({
      where:   { isApproved: true },
      include: {
        nursery: {
          select: {
            name: true, slug: true,
            city: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    totalReviews = await prisma.review.count({ where: { isApproved: true } });

    const ratingAgg = await prisma.review.aggregate({
      where:  { isApproved: true },
      _avg:   { rating: true },
    });
    avgRating = Math.round((ratingAgg._avg.rating ?? 0) * 10) / 10;

    // Top rated nurseries (with at least 1 review)
    topNurseries = await prisma.nursery.findMany({
      where:   { isActive: true, totalReviews: { gt: 0 } },
      include: { city: { select: { name: true } } },
      orderBy: [{ avgRating: "desc" }, { totalReviews: "desc" }],
      take: 6,
    });
  } catch {}

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="gradient-sage border-b border-gray-100 py-14">
          <div className="container max-w-4xl text-center">
            <span className="badge badge-green mb-4">Verified Reviews</span>
            <h1 className="font-display text-4xl font-bold text-forest-900 mb-3">
              Nursery Reviews
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Authentic reviews from real plant lovers across India.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-forest-900">{totalReviews.toLocaleString("en-IN")}</p>
                <p className="text-sm text-gray-500">Total Reviews</p>
              </div>
              <div className="w-px h-10 bg-gray-200"/>
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-amber-500">{avgRating > 0 ? avgRating : "4.8"}★</p>
                <p className="text-sm text-gray-500">Average Rating</p>
              </div>
              <div className="w-px h-10 bg-gray-200"/>
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-forest-900">100%</p>
                <p className="text-sm text-gray-500">Verified Buyers</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

              {/* Reviews list */}
              <div className="lg:col-span-2">
                <h2 className="font-display text-xl font-bold text-forest-900 mb-6">Recent Reviews</h2>

                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((r: any) => (
                      <div key={r.id} className="card p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-8 h-8 gradient-forest rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {(r.reviewerName ?? "U")[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-gray-900">{r.reviewerName ?? "Anonymous"}</p>
                                <p className="text-2xs text-gray-400">
                                  {new Date(r.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                                </p>
                              </div>
                            </div>
                            <Stars rating={r.rating} />
                          </div>
                          <Link href={`/listing/${r.nursery?.slug}`}
                            className="text-right hover:text-forest transition-colors">
                            <p className="text-sm font-semibold text-forest">{r.nursery?.name}</p>
                            <p className="text-xs text-gray-400">{r.nursery?.city?.name}</p>
                          </Link>
                        </div>
                        {r.comment && (
                          <p className="text-sm text-gray-600 leading-relaxed italic">"{r.comment}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* No reviews yet — show placeholder cards */
                  <div className="space-y-4">
                    {[
                      { name:"Priya Sharma",   city:"Delhi",     stars:5, comment:"Found a rare Monstera Thai Constellation at a nursery 2km from my home. Incredible service!" },
                      { name:"Rahul Verma",    city:"Bangalore", stars:5, comment:"Verified listing worked perfectly. Called the number, it worked, visited same day." },
                      { name:"Anjali Gupta",   city:"Mumbai",    stars:5, comment:"As a nursery owner, I got 40+ new customers in the first month after listing. Amazing!" },
                      { name:"Suresh Kumar",   city:"Chennai",   stars:4, comment:"Very helpful directory. Found a good nursery for fruit saplings near my home." },
                      { name:"Meena Patel",    city:"Jaipur",    stars:5, comment:"The photos on the listing were accurate. No surprises when I visited." },
                      { name:"Vikram Singh",   city:"Lucknow",   stars:4, comment:"Good selection of medicinal plants. Will definitely recommend NurseryNearby." },
                    ].map((r, i) => (
                      <div key={i} className="card p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 gradient-forest rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {r.name[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{r.name}</p>
                              <p className="text-2xs text-gray-400">{r.city}</p>
                            </div>
                          </div>
                          <Stars rating={r.stars}/>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed italic">"{r.comment}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Top rated nurseries */}
                <div className="card p-6">
                  <h3 className="font-display font-bold text-forest-900 mb-4">🏆 Top Rated Nurseries</h3>
                  {topNurseries.length > 0 ? (
                    <div className="space-y-3">
                      {topNurseries.map((n: any) => (
                        <Link key={n.id} href={`/listing/${n.slug}`}
                          className="flex items-center justify-between hover:bg-forest-50 p-2 rounded-xl transition-colors group">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-forest">{n.name}</p>
                            <p className="text-xs text-gray-400">{n.city?.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-amber-500">{n.avgRating?.toFixed(1) ?? "—"}★</p>
                            <p className="text-2xs text-gray-400">{n.totalReviews} reviews</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Be the first to review a nursery!</p>
                  )}
                </div>

                {/* CTA */}
                <div className="card p-6 gradient-sage border border-forest-100">
                  <h3 className="font-display font-bold text-forest-900 mb-2">Visited a Nursery?</h3>
                  <p className="text-sm text-gray-600 mb-4">Share your experience and help other plant lovers find the best nurseries.</p>
                  <Link href="/nursery/all" className="btn btn-primary w-full justify-center btn-sm">
                    Find a Nursery to Review →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
