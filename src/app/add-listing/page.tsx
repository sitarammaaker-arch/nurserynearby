"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { CATEGORIES, CITIES } from "@/lib/utils";

export default function AddListingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  const toggleCat = (cat: string) =>
    setSelectedCats((s) => s.includes(cat) ? s.filter((c) => c !== cat) : [...s, cat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false); setSubmitted(true);
  };

  if (submitted) {
    return (
      <>
        <Navbar/>
        <div className="min-h-[70vh] flex items-center justify-center gradient-sage">
          <div className="text-center max-w-md px-6">
            <div className="text-6xl mb-5">🌱</div>
            <h1 className="font-display text-3xl font-bold text-forest-900 mb-3">Listing Submitted!</h1>
            <p className="text-gray-600 mb-6">Your nursery is under review and will be live within 24 hours.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/" className="btn btn-primary">Go to Homepage</Link>
              <button onClick={() => setSubmitted(false)} className="btn btn-outline">Add Another</button>
            </div>
          </div>
        </div>
        <Footer/>
      </>
    );
  }

  return (
    <>
      <Navbar/>
      <main>
        <section className="gradient-forest py-14">
          <div className="container text-center">
            <h1 className="font-display text-4xl font-bold text-white mb-3">List Your Nursery — Free</h1>
            <p className="text-forest-200 text-lg">Join 12,400+ nurseries on NurseryNearby. Get discovered by plant lovers nearby.</p>
          </div>
        </section>

        <div className="container py-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="card p-7">
                <h2 className="font-display text-xl font-bold text-forest-900 mb-5">Basic Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2"><label className="label">Nursery Name *</label><input required className="input" placeholder="e.g. Green Paradise Nursery"/></div>
                  <div className="sm:col-span-2"><label className="label">Tagline</label><input className="input" placeholder="Where plants find their home"/></div>
                  <div className="sm:col-span-2"><label className="label">Description</label><textarea rows={4} className="textarea" placeholder="Tell customers about your nursery..."/></div>
                </div>
              </div>

              <div className="card p-7">
                <h2 className="font-display text-xl font-bold text-forest-900 mb-2">Categories</h2>
                <p className="text-sm text-gray-500 mb-4">Select all that apply</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CATEGORIES.map((c) => {
                    const sel = selectedCats.includes(c.name);
                    return (
                      <button key={c.name} type="button" onClick={() => toggleCat(c.name)}
                        className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 text-xs font-bold transition-all
                          ${sel ? "border-forest bg-forest-50 text-forest" : "border-gray-100 hover:border-forest-200 text-gray-600"}`}>
                        <span className="text-2xl">{c.icon}</span>{c.name}
                        {sel && <span className="w-4 h-4 gradient-forest rounded-full text-white text-2xs flex items-center justify-center">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="card p-7">
                <h2 className="font-display text-xl font-bold text-forest-900 mb-5">Contact & Location</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div><label className="label">Phone *</label><input required type="tel" className="input" placeholder="+91-98101-XXXXX"/></div>
                  <div><label className="label">WhatsApp</label><input type="tel" className="input" placeholder="9810100000"/></div>
                  <div><label className="label">Email</label><input type="email" className="input" placeholder="nursery@example.com"/></div>
                  <div><label className="label">Website</label><input type="url" className="input" placeholder="https://"/></div>
                  <div><label className="label">City *</label>
                    <select required className="select">
                      <option value="">Select City</option>
                      {CITIES.map((c) => <option key={c.slug} value={c.name}>{c.name}, {c.state}</option>)}
                    </select>
                  </div>
                  <div><label className="label">Area / Locality</label><input className="input" placeholder="Model Town"/></div>
                  <div className="sm:col-span-2"><label className="label">Full Address *</label><input required className="input" placeholder="Shop No, Street, Landmark…"/></div>
                  <div><label className="label">Opening Hours</label><input className="input" placeholder="Mon-Sun 8AM-8PM"/></div>
                  <div><label className="label">Year Established</label><input type="number" className="input" placeholder="1998"/></div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full justify-center disabled:opacity-60">
                {loading ? "Submitting…" : "Submit Free Listing →"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-400">
              Have multiple locations? <Link href="/admin/upload" className="text-forest font-semibold hover:underline">Bulk Upload →</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer/>
    </>
  );
}
