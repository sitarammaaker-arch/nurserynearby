"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

interface Props {
  params: { slug: string };
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <svg viewBox="0 0 24 24" className={`w-10 h-10 transition-colors ${
            s <= (hover || value) ? "fill-amber-400" : "fill-gray-200"
          }`}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-500 font-medium">
        {hover || value ? ["","Poor","Fair","Good","Very Good","Excellent"][hover || value] : "Tap to rate"}
      </span>
    </div>
  );
}

export default function WriteReviewPage({ params }: Props) {
  const router  = useRouter();
  const [nursery, setNursery]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState("");

  const [form, setForm] = useState({
    rating:       0,
    name:         "",
    email:        "",
    phone:        "",
    comment:      "",
    visitDate:    "",
    recommend:    true,
  });

  // Load nursery info
  useEffect(() => {
    fetch(`/api/nursery?slug=${params.slug}`)
      .then(r => r.json())
      .then(d => { setNursery(d.nursery ?? d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.rating === 0) { setError("Please select a star rating."); return; }
    if (!form.name.trim()) { setError("Please enter your name."); return; }
    if (!form.comment.trim()) { setError("Please write a review comment."); return; }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          nurserySlug:  params.slug,
          rating:       form.rating,
          reviewerName: form.name,
          email:        form.email,
          phone:        form.phone,
          comment:      form.comment,
          visitDate:    form.visitDate || null,
          recommend:    form.recommend,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="gradient-sage min-h-screen py-12">
        <div className="container max-w-2xl">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 font-medium">
            <Link href="/" className="hover:text-forest">Home</Link>
            <span>/</span>
            <Link href="/nursery/all" className="hover:text-forest">Nurseries</Link>
            <span>/</span>
            {nursery && (
              <>
                <Link href={`/listing/${params.slug}`} className="hover:text-forest">{nursery.name}</Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-400">Write Review</span>
          </nav>

          {loading ? (
            <div className="card p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-forest border-t-transparent rounded-full mx-auto"/>
              <p className="text-gray-400 mt-4 text-sm">Loading nursery info…</p>
            </div>

          ) : submitted ? (
            <div className="card p-12 text-center">
              <div className="w-20 h-20 gradient-forest rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-green">
                ⭐
              </div>
              <h1 className="font-display text-3xl font-bold text-forest-900 mb-2">Review Submitted!</h1>
              <p className="text-gray-500 mb-2">Thank you for sharing your experience.</p>
              <p className="text-sm text-gray-400 mb-8">Your review will appear after approval by our team.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={`/listing/${params.slug}`} className="btn btn-primary justify-center">
                  Back to Listing
                </Link>
                <Link href="/nursery/all" className="btn btn-outline justify-center">
                  Browse More Nurseries
                </Link>
              </div>
            </div>

          ) : (
            <>
              {/* Nursery header */}
              {nursery && (
                <div className="card p-5 mb-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl gradient-forest flex items-center justify-center text-3xl shrink-0">🌿</div>
                  <div>
                    <h2 className="font-display font-bold text-forest-900">{nursery.name}</h2>
                    <p className="text-sm text-gray-400">{nursery.area}{nursery.area && nursery.cityName ? ", " : ""}{nursery.cityName}</p>
                  </div>
                  <Link href={`/listing/${params.slug}`} className="ml-auto btn btn-ghost btn-sm text-xs">
                    View Listing
                  </Link>
                </div>
              )}

              {/* Review Form */}
              <div className="card p-7 space-y-6">
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 gradient-forest rounded-2xl mb-4 text-2xl shadow-green">✍️</div>
                  <h1 className="font-display text-2xl font-bold text-forest-900">Write a Review</h1>
                  <p className="text-sm text-gray-400 mt-1">Share your honest experience to help other plant lovers</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                    ⚠️ {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Star Rating */}
                  <div>
                    <label className="label mb-2">
                      Your Rating <span className="text-red-500">*</span>
                    </label>
                    <StarPicker value={form.rating} onChange={(v) => setForm(p => ({ ...p, rating: v }))} />
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Your Name <span className="text-red-500">*</span></label>
                      <input
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="input"
                        placeholder="e.g. Ramesh Kumar"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Phone / Email <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
                      <input
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        className="input"
                        placeholder="For verification only"
                      />
                    </div>
                  </div>

                  {/* Visit Date */}
                  <div>
                    <label className="label">When did you visit? <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
                    <input
                      type="month"
                      value={form.visitDate}
                      onChange={e => setForm(p => ({ ...p, visitDate: e.target.value }))}
                      className="input max-w-xs"
                      max={new Date().toISOString().slice(0,7)}
                    />
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="label">
                      Your Review <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={form.comment}
                      onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                      className="textarea"
                      rows={5}
                      placeholder="Tell others about the plant variety, quality, staff behaviour, pricing, location accuracy…"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">{form.comment.length}/500 characters</p>
                  </div>

                  {/* Recommend */}
                  <div>
                    <label className="label mb-2">Would you recommend this nursery?</label>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setForm(p => ({ ...p, recommend: true }))}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                          form.recommend ? "border-forest bg-forest-50 text-forest" : "border-gray-200 text-gray-500"
                        }`}>
                        👍 Yes, recommend
                      </button>
                      <button type="button" onClick={() => setForm(p => ({ ...p, recommend: false }))}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                          !form.recommend ? "border-red-400 bg-red-50 text-red-600" : "border-gray-200 text-gray-500"
                        }`}>
                        👎 No
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={submitting}
                      className="btn btn-primary flex-1 justify-center py-3">
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
                          </svg>
                          Submitting…
                        </span>
                      ) : "Submit Review →"}
                    </button>
                    <Link href={`/listing/${params.slug}`} className="btn btn-outline px-6">
                      Cancel
                    </Link>
                  </div>

                  <p className="text-xs text-gray-400 text-center">
                    Reviews are moderated and published within 24 hours. Please only review nurseries you have personally visited.
                  </p>
                </form>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
