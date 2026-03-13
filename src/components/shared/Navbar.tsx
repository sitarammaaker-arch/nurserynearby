"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { CATEGORIES, CITIES, SITE } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Find Nursery", href: "/nursery/all" },
  { label: "Blog",         href: "/blog" },
  { label: "About",        href: "/about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-forest text-cream-100 text-center text-xs py-2 px-4 font-body font-medium tracking-wide">
        🌱 India's most trusted nursery directory · Free listing for nursery owners
        <Link href="/add-listing" className="ml-3 underline underline-offset-2 hover:text-white">Add yours →</Link>
      </div>

      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-card border-b border-gray-100" : "bg-white border-b border-gray-100"
      }`}>
        <div className="container">
          <div className="flex items-center justify-between h-16 lg:h-18">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 gradient-forest rounded-xl flex items-center justify-center shadow-green group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2 6-4 8-3 8-3-4 0-6 1-6 1 4-4 3-3 6-3C18 1 12 1 8 6c0 0 1-4 6-4C8 0 7 7 7 7c-1 0-2-1-2-1C7 10 9 12 9 12c-2 0-3-2-3-2 0 4 4 5 4 5-2 0-3-1-3-1 1 3 5 4 5 4-2-1-4-1-4-1 2 2 6 2 6 2-4 1-7-1-7-1C5 22 9 22 9 22c4 0 8-4 8-14z"/>
                </svg>
              </div>
              <div className="leading-none">
                <span className="font-display font-bold text-xl text-forest block tracking-tight">Nursery</span>
                <span className="font-body text-2xs text-sage-400 block font-medium tracking-widest uppercase">Nearby</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* Find Nursery megamenu */}
              <div className="relative group">
                <button
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-forest hover:bg-forest-50 transition-all"
                  onMouseEnter={() => setCatOpen(true)}
                  onMouseLeave={() => setCatOpen(false)}
                >
                  Find Nursery
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current opacity-60 mt-0.5 transition-transform group-hover:rotate-180"><path d="M7 10l5 5 5-5z"/></svg>
                </button>

                {catOpen && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[560px] bg-white rounded-2xl shadow-lifted border border-gray-100 p-6 mt-2"
                    onMouseEnter={() => setCatOpen(true)}
                    onMouseLeave={() => setCatOpen(false)}
                  >
                    <p className="label mb-3">Browse by Category</p>
                    <div className="grid grid-cols-2 gap-2 mb-5">
                      {CATEGORIES.map((c) => (
                        <Link key={c.slug} href={`/nursery/all/${c.slug}`}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-forest-50 group/item transition-colors">
                          <span className="text-xl">{c.icon}</span>
                          <span className="text-sm font-medium text-gray-700 group-hover/item:text-forest">{c.name}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                      <p className="label mb-2">Popular Cities</p>
                      <div className="flex flex-wrap gap-2">
                        {CITIES.slice(0, 8).map((c) => (
                          <Link key={c.slug} href={`/nursery/${c.slug}`}
                            className="badge badge-cream hover:badge-green transition-all text-xs">{c.emoji} {c.name}</Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cities dropdown */}
              <div className="relative group">
                <button
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-forest hover:bg-forest-50 transition-all"
                  onMouseEnter={() => setCityOpen(true)}
                  onMouseLeave={() => setCityOpen(false)}
                >
                  Cities
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current opacity-60 mt-0.5 transition-transform group-hover:rotate-180"><path d="M7 10l5 5 5-5z"/></svg>
                </button>
                {cityOpen && (
                  <div
                    className="absolute top-full left-0 w-52 bg-white rounded-2xl shadow-lifted border border-gray-100 p-2 mt-2"
                    onMouseEnter={() => setCityOpen(true)}
                    onMouseLeave={() => setCityOpen(false)}
                  >
                    {CITIES.map((c) => (
                      <Link key={c.slug} href={`/nursery/${c.slug}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-forest-50 hover:text-forest transition-colors">
                        <span>{c.emoji}</span> {c.name}
                        <span className="ml-auto text-2xs text-gray-400">{c.state}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/blog" className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-forest hover:bg-forest-50 transition-all">Blog</Link>
            </nav>

            {/* Right CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/add-listing" className="btn btn-secondary btn-sm">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                List Nursery
              </Link>
              <Link href="/login" className="btn btn-primary btn-sm">Sign In</Link>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-forest stroke-2" strokeLinecap="round">
                {mobileOpen
                  ? <path d="M6 18L18 6M6 6l12 12"/>
                  : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="container py-4 space-y-1">
              <p className="label pt-2 pb-1 px-2">Categories</p>
              {CATEGORIES.map((c) => (
                <Link key={c.slug} href={`/nursery/all/${c.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-forest-50 hover:text-forest transition-colors">
                  <span className="text-lg">{c.icon}</span> {c.name}
                </Link>
              ))}
              <div className="border-t border-gray-100 my-3"/>
              <p className="label px-2 pb-1">Cities</p>
              <div className="grid grid-cols-3 gap-1.5 pb-2">
                {CITIES.map((c) => (
                  <Link key={c.slug} href={`/nursery/${c.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="text-center py-2 px-1 rounded-xl text-sm text-gray-700 hover:bg-forest-50 hover:text-forest transition-colors">
                    <span className="block text-lg mb-0.5">{c.emoji}</span>
                    {c.name}
                  </Link>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 flex gap-2">
                <Link href="/add-listing" onClick={() => setMobileOpen(false)} className="btn btn-outline flex-1 btn-sm justify-center">List Nursery</Link>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="btn btn-primary flex-1 btn-sm justify-center">Sign In</Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
