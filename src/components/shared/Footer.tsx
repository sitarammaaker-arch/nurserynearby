import Link from "next/link";
import { CATEGORIES, CITIES, SITE } from "@/lib/utils";

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-forest-100">
      {/* Top CTA strip */}
      <div className="border-b border-forest-700">
        <div className="container py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl font-bold text-white mb-1">Own a Nursery?</h3>
            <p className="text-forest-300 text-sm">List for free and reach thousands of plant lovers near you.</p>
          </div>
          <Link href="/add-listing" className="btn btn-lg shrink-0"
            style={{ background: "#faf7f0", color: "#1a3a2a", fontFamily: "DM Sans, sans-serif" }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Add Free Listing
          </Link>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="container py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand col */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-forest rounded-xl flex items-center justify-center border border-forest-600">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2 6-4 8-3 8-3-4 0-6 1-6 1 4-4 3-3 6-3C18 1 12 1 8 6c0 0 1-4 6-4C8 0 7 7 7 7c-1 0-2-1-2-1C7 10 9 12 9 12c-2 0-3-2-3-2 0 4 4 5 4 5-2 0-3-1-3-1 1 3 5 4 5 4-2-1-4-1-4-1 2 2 6 2 6 2-4 1-7-1-7-1C5 22 9 22 9 22c4 0 8-4 8-14z"/>
                </svg>
              </div>
              <div>
                <span className="font-display font-bold text-xl text-white block">NurseryNearby</span>
                <span className="text-2xs text-forest-400 uppercase tracking-widest">India's Plant Directory</span>
              </div>
            </Link>
            <p className="text-forest-300 text-sm leading-relaxed max-w-xs mb-6">
              Connecting plant lovers with the finest nurseries, rare botanicals & garden experts across India since 2024.
            </p>
            <div className="flex gap-3">
              {[
                { icon: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z", label: "Facebook" },
                { icon: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z", label: "Twitter" },
                { icon: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z", label: "Instagram" },
              ].map((s) => (
                <a key={s.label} href={`https://${s.label.toLowerCase()}.com`} aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-forest-800 hover:bg-forest flex items-center justify-center transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-forest-300 stroke-2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.icon}/>
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-forest-400 mb-4">Categories</h4>
            <ul className="space-y-2">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/nursery/all/${c.slug}`}
                    className="text-sm text-forest-300 hover:text-white transition-colors flex items-center gap-1.5">
                    <span className="text-xs">{c.icon}</span> {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-forest-400 mb-4">Top Cities</h4>
            <ul className="space-y-2">
              {CITIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/nursery/${c.slug}`}
                    className="text-sm text-forest-300 hover:text-white transition-colors">
                    Nursery in {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-forest-400 mb-4">Company</h4>
            <ul className="space-y-2">
              {[
                { l: "About Us",       h: "/about" },
                { l: "Browse by State",  h: "/states" },
                { l: "Add Listing",    h: "/add-listing" },
                { l: "Blog",           h: "/blog" },
                { l: "Contact",        h: "/contact" },
                { l: "Privacy Policy", h: "/privacy" },
                { l: "Terms of Use",   h: "/terms" },
                { l: "Sitemap",        h: "/sitemap.xml" },
                { l: "Admin",          h: "/admin" },
              ].map((i) => (
                <li key={i.h}>
                  <Link href={i.h} className="text-sm text-forest-300 hover:text-white transition-colors">{i.l}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-forest-800">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-forest-400">
          <p>© {new Date().getFullYear()} NurseryNearby. All rights reserved.</p>
          <p className="flex items-center gap-1">Made with <span className="text-red-400">♥</span> for plant lovers across India</p>
        </div>
      </div>
    </footer>
  );
}
