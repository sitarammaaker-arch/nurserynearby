"use client";
import { useState } from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { CATEGORIES, CITIES } from "@/lib/utils";
import ImageUploader from "@/components/ui/ImageUploader";

export default function AddListingPage() {
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error,   setError]     = useState("");
  const [selCats, setSelCats]   = useState<string[]>([]);
  const [images,  setImages]    = useState<{url:string;publicId:string;thumbnail:string}[]>([]);

  const toggleCat = (slug: string) =>
    setSelCats((p) => p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd   = new FormData(e.currentTarget);
    const body = {
      name:         fd.get("name"),
      tagline:      fd.get("tagline"),
      description:  fd.get("description"),
      phone:        fd.get("phone"),
      phone2:       fd.get("phone2"),
      whatsapp:     fd.get("whatsapp"),
      email:        fd.get("email"),
      website:      fd.get("website"),
      address:      fd.get("address"),
      area:         fd.get("area"),
      landmark:     fd.get("landmark"),
      pincode:      fd.get("pincode"),
      cityId:       fd.get("cityId"),
      openingHours: fd.get("openingHours"),
      established:  fd.get("established"),
      categories:   selCats,
      images:       images.map((img, i) => ({ url: img.url, isPrimary: i === 0 })),
    };

    try {
      const res = await fetch("/api/add-listing", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) return (
    <>
      <Navbar />
      <main className="min-h-[70vh] flex items-center justify-center gradient-sage px-4">
        <div className="card p-12 text-center max-w-md w-full shadow-lifted">
          <div className="w-20 h-20 gradient-forest rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-green">🎉</div>
          <h1 className="font-display text-3xl font-bold text-forest-900 mb-2">You're Listed!</h1>
          <p className="text-gray-500 mb-6">Your nursery is now live on NurseryNearby. Plant lovers in your city can find you right now!</p>
          <div className="flex flex-col gap-3">
            <a href="/nursery/all" className="btn btn-primary justify-center">Browse All Nurseries</a>
            <a href="/add-listing" className="btn btn-ghost justify-center text-sm text-gray-500" onClick={() => setSuccess(false)}>Add another nursery</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <main className="gradient-sage min-h-screen py-12">
        <div className="container max-w-3xl">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 gradient-forest rounded-2xl mb-5 shadow-green text-3xl">🌿</div>
            <h1 className="font-display text-4xl font-bold text-forest-900 mb-2">List Your Nursery Free</h1>
            <p className="text-gray-500">Fill in the details below — your nursery goes live immediately.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Basic Info ── */}
            <div className="card p-7 space-y-5">
              <h2 className="font-display text-xl font-bold text-forest-900 border-b border-gray-100 pb-3">
                Basic Information
              </h2>

              <div>
                <label className="label">Nursery Name <span className="text-red-500">*</span></label>
                <input name="name" required placeholder="e.g. Green Paradise Nursery" className="input-lg" />
              </div>

              <div>
                <label className="label">Tagline <span className="text-gray-400 normal-case font-normal text-xs">(optional)</span></label>
                <input name="tagline" placeholder="e.g. Where plants find their home" className="input" />
              </div>

              <div>
                <label className="label">About Your Nursery <span className="text-gray-400 normal-case font-normal text-xs">(optional)</span></label>
                <textarea name="description" rows={4}
                  placeholder="Tell customers about your specialties, plant varieties, services offered…"
                  className="textarea" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Opening Hours</label>
                  <input name="openingHours" placeholder="e.g. Mon–Sun 8AM–8PM" className="input" />
                </div>
                <div>
                  <label className="label">Established Year</label>
                  <input name="established" type="number" placeholder="e.g. 1998" min="1900" max="2025" className="input" />
                </div>
              </div>
            </div>

            {/* ── Contact Info ── */}
            <div className="card p-7 space-y-5">
              <h2 className="font-display text-xl font-bold text-forest-900 border-b border-gray-100 pb-3">
                Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone Number <span className="text-red-500">*</span></label>
                  <input name="phone" required type="tel" placeholder="+91 98100 00000" className="input" />
                </div>
                <div>
                  <label className="label">WhatsApp Number</label>
                  <input name="whatsapp" type="tel" placeholder="9810000000 (without +91)" className="input" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Email Address</label>
                  <input name="email" type="email" placeholder="nursery@example.com" className="input" />
                </div>
                <div>
                  <label className="label">Alternate Phone</label>
                  <input name="phone2" type="tel" placeholder="+91 98100 00001" className="input" />
                </div>
              </div>

              <div>
                <label className="label">Website</label>
                <input name="website" type="url" placeholder="https://yourwebsite.com" className="input" />
              </div>
            </div>

            {/* ── Location ── */}
            <div className="card p-7 space-y-5">
              <h2 className="font-display text-xl font-bold text-forest-900 border-b border-gray-100 pb-3">
                Location
              </h2>

              <div>
                <label className="label">City <span className="text-red-500">*</span></label>
                <select name="cityId" required className="select input-lg">
                  <option value="">— Select your city —</option>
                  {CITIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.emoji} {c.name}, {c.state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Full Address <span className="text-red-500">*</span></label>
                <input name="address" required placeholder="e.g. 15, Model Town Phase 2" className="input" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Area / Locality</label>
                  <input name="area" placeholder="e.g. Model Town" className="input" />
                </div>
                <div>
                  <label className="label">Pincode</label>
                  <input name="pincode" placeholder="110001" maxLength={6} className="input" />
                </div>
              </div>

              <div>
                <label className="label">Landmark</label>
                <input name="landmark" placeholder="e.g. Near Metro Station, Opposite Shopping Mall" className="input" />
              </div>
            </div>

            {/* ── Photos ── */}
            <div className="card p-7">
              <h2 className="font-display text-xl font-bold text-forest-900 border-b border-gray-100 pb-3 mb-5">
                Photos <span className="text-gray-400 normal-case font-normal text-sm">(optional but recommended)</span>
              </h2>
              <ImageUploader
                value={images}
                onChange={setImages}
                maxImages={5}
                folder="nurseries"
                label=""
              />
            </div>

            {/* ── Categories ── */}
            <div className="card p-7">
              <h2 className="font-display text-xl font-bold text-forest-900 border-b border-gray-100 pb-3 mb-5">
                Plant Categories
              </h2>
              <p className="text-sm text-gray-500 mb-4">Select all that apply to your nursery:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORIES.map((c) => {
                  const on = selCats.includes(c.slug);
                  return (
                    <button key={c.slug} type="button" onClick={() => toggleCat(c.slug)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        on ? "border-forest bg-forest-50 shadow-green" : "border-gray-200 hover:border-forest-200 hover:bg-gray-50"
                      }`}>
                      <span className="text-2xl">{c.icon}</span>
                      <span className={`text-sm font-semibold ${on ? "text-forest" : "text-gray-700"}`}>{c.name}</span>
                      {on && <span className="ml-auto text-forest text-lg">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <span className="text-red-500 text-xl shrink-0">⚠️</span>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn btn-primary w-full justify-center btn-lg disabled:opacity-60 text-base">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
                  </svg>
                  Submitting…
                </span>
              ) : (
                <>🌱 Submit Free Listing — Go Live Now</>
              )}
            </button>

            <p className="text-xs text-center text-gray-400 pb-4">
              Free forever · No credit card · Listed immediately · No spam
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
