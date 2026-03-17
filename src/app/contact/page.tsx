"use client";
import { useState } from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Link from "next/link";

export default function ContactPage() {
  const [form, setForm]       = useState({ name:"", email:"", subject:"", message:"" });
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    // Simulate sending — replace with real email API if needed
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  }

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="gradient-sage border-b border-gray-100 py-16">
          <div className="container max-w-3xl text-center">
            <span className="badge badge-green mb-4">Get in Touch</span>
            <h1 className="font-display text-5xl font-bold text-forest-900 mb-4">Contact Us</h1>
            <p className="text-lg text-gray-600">
              Have a question, feedback or want to list your nursery? We'd love to hear from you.
            </p>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

              {/* Contact Info */}
              <div className="space-y-6">
                <h2 className="font-display text-xl font-bold text-forest-900">Other Ways to Reach Us</h2>
                {[
                  { icon:"📧", title:"Email",    val:"support@nurserynearby.in",  sub:"We reply within 24 hours" },
                  { icon:"💬", title:"WhatsApp", val:"+91 98100 00000",           sub:"Mon–Sat, 9AM–6PM" },
                  { icon:"🏢", title:"Office",   val:"New Delhi, India",          sub:"By appointment only" },
                ].map((c) => (
                  <div key={c.title} className="flex gap-4">
                    <div className="w-11 h-11 gradient-forest rounded-xl flex items-center justify-center text-xl shrink-0">{c.icon}</div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{c.title}</p>
                      <p className="text-sm text-forest font-medium">{c.val}</p>
                      <p className="text-xs text-gray-400">{c.sub}</p>
                    </div>
                  </div>
                ))}

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="font-semibold text-sm text-gray-700 mb-3">Quick Links</h3>
                  {[
                    { label:"Add Your Nursery Free", href:"/add-listing" },
                    { label:"Browse All Nurseries",  href:"/states" },
                    { label:"About NurseryNearby",   href:"/about" },
                    { label:"Privacy Policy",        href:"/privacy" },
                  ].map((l) => (
                    <Link key={l.href} href={l.href}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-forest py-1.5 transition-colors">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-forest opacity-60"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Form */}
              <div className="lg:col-span-2">
                {sent ? (
                  <div className="card p-12 text-center">
                    <div className="w-20 h-20 gradient-forest rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">✅</div>
                    <h2 className="font-display text-2xl font-bold text-forest-900 mb-2">Message Sent!</h2>
                    <p className="text-gray-500 mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                    <button onClick={() => { setSent(false); setForm({ name:"", email:"", subject:"", message:"" }); }}
                      className="btn btn-outline">Send Another Message</button>
                  </div>
                ) : (
                  <div className="card p-8">
                    <h2 className="font-display text-xl font-bold text-forest-900 mb-6">Send us a Message</h2>
                    {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">Your Name <span className="text-red-500">*</span></label>
                          <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                            className="input" placeholder="e.g. Ramesh Kumar" required />
                        </div>
                        <div>
                          <label className="label">Email Address <span className="text-red-500">*</span></label>
                          <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                            className="input" placeholder="you@email.com" required />
                        </div>
                      </div>
                      <div>
                        <label className="label">Subject</label>
                        <select value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))} className="select input">
                          <option value="">Select a subject</option>
                          <option value="list-nursery">I want to list my nursery</option>
                          <option value="update-listing">Update my existing listing</option>
                          <option value="wrong-info">Report wrong information</option>
                          <option value="partnership">Partnership enquiry</option>
                          <option value="feedback">General feedback</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Message <span className="text-red-500">*</span></label>
                        <textarea value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))}
                          className="textarea" rows={5} placeholder="Tell us how we can help…" required />
                      </div>
                      <button type="submit" disabled={loading}
                        className="btn btn-primary w-full justify-center py-3">
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
                            </svg>
                            Sending…
                          </span>
                        ) : "Send Message →"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
