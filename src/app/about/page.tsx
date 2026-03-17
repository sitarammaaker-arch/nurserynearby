import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: `About Us — ${SITE.name}`,
  description: "Learn about NurseryNearby — India's largest plant nursery directory. Our mission, story and team.",
  alternates: { canonical: `${SITE.url}/about` },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="gradient-sage border-b border-gray-100 py-16">
          <div className="container max-w-4xl text-center">
            <span className="badge badge-green mb-4">Our Story</span>
            <h1 className="font-display text-5xl font-bold text-forest-900 mb-4">
              About NurseryNearby
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              India's most trusted plant nursery directory — connecting plant lovers with verified nurseries across every city, district and state.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="section bg-white">
          <div className="container max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="badge badge-green mb-4">Our Mission</span>
                <h2 className="font-display text-3xl font-bold text-forest-900 mb-4">
                  Making India Greener, One Nursery at a Time
                </h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  NurseryNearby was born from a simple frustration — finding a good plant nursery near you was surprisingly hard. Phone numbers were wrong, addresses outdated, and there was no reliable way to know what plants a nursery actually stocked.
                </p>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  We set out to fix that. Today, NurseryNearby is home to <strong>58,000+ verified nursery listings</strong> across all 36 states and union territories of India — from the Himalayan valleys of Uttarakhand to the coastal plains of Kerala.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Every listing is manually reviewed, phone numbers are verified, and photos are real — not stock images.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "🌿", value: "58,000+", label: "Nurseries Listed" },
                  { icon: "🏙️", value: "250+",    label: "Cities Covered" },
                  { icon: "🗺️", value: "36",       label: "States & UTs" },
                  { icon: "⭐", value: "4.8",      label: "Average Rating" },
                ].map((s) => (
                  <div key={s.label} className="card p-6 text-center">
                    <span className="text-4xl block mb-2">{s.icon}</span>
                    <p className="font-display text-3xl font-bold text-forest-900">{s.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section gradient-sage">
          <div className="container max-w-4xl">
            <div className="text-center mb-12">
              <span className="badge badge-green mb-3">What We Stand For</span>
              <h2 className="font-display text-3xl font-bold text-forest-900">Our Values</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: "✅", title: "Verified First",    desc: "Every nursery listing is manually reviewed. We check phone numbers, addresses and business details before publishing." },
                { icon: "🆓", title: "Free for Everyone", desc: "Listing your nursery and finding nurseries near you is completely free. No hidden charges, no premium walls." },
                { icon: "🌱", title: "Green India",       desc: "We believe plants make cities better. Our goal is to make buying and finding plants as easy as ordering food online." },
              ].map((v) => (
                <div key={v.title} className="card p-7 text-center">
                  <div className="w-14 h-14 gradient-forest rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">{v.icon}</div>
                  <h3 className="font-display font-bold text-forest-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What we cover */}
        <section className="section bg-white">
          <div className="container max-w-4xl">
            <div className="text-center mb-10">
              <span className="badge badge-cream mb-3">Coverage</span>
              <h2 className="font-display text-3xl font-bold text-forest-900">
                We Cover All of India
              </h2>
              <p className="text-gray-500 mt-3">
                From Kashmir to Kanyakumari, from Gujarat to Arunachal Pradesh — every state has nursery listings.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { region: "North India",     states: "Delhi, Haryana, Punjab, UP, Uttarakhand, HP, J&K, Ladakh, Rajasthan" },
                { region: "South India",     states: "Karnataka, Kerala, Tamil Nadu, Andhra Pradesh, Telangana, Puducherry" },
                { region: "West India",      states: "Maharashtra, Gujarat, Goa, Dadra & Nagar Haveli, Daman & Diu" },
                { region: "East & Northeast",states: "West Bengal, Odisha, Bihar, Jharkhand, Assam, and all 7 NE states" },
              ].map((r) => (
                <div key={r.region} className="card p-5">
                  <h4 className="font-display font-bold text-forest-900 text-sm mb-2">{r.region}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{r.states}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section gradient-forest">
          <div className="container max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              Own a Nursery? List it Free!
            </h2>
            <p className="text-forest-200 mb-8">
              Join 58,000+ nurseries on NurseryNearby. Get discovered by plant lovers in your city — completely free, forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/add-listing" className="btn btn-lg bg-white text-forest-900 hover:bg-cream-50">
                Add Free Listing →
              </Link>
              <Link href="/contact" className="btn btn-lg border-2 border-white/30 text-white hover:bg-white/10">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
