"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label:"Dashboard",    href:"/admin",               icon:"M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
  { label:"Bulk Upload",  href:"/admin/upload",         icon:"M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" },
  { label:"Listings",     href:"/admin/listings",       icon:"M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" },
  { label:"Import Logs",  href:"/admin/import-logs",    icon:"M20 6h-2.18c.07-.44.18-.88.18-1a3 3 0 0 0-6 0c0 .12.11.56.18 1H10c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" },
  { label:"Add Nursery",  href:"/add-listing",          icon:"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" },
  { label:"← Back to Site",href:"/",                   icon:"M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-forest-900 flex flex-col">
        <div className="p-6 border-b border-forest-700">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-forest rounded-lg flex items-center justify-center border border-forest-600">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm">Admin Panel</p>
              <p className="text-2xs text-forest-400">NurseryNearby</p>
            </div>
          </Link>
        </div>
        <nav className="p-4 flex-1 space-y-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className={`admin-sidebar-link ${path === n.href ? "active" : ""}`}>
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0"><path d={n.icon}/></svg>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-forest-700">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-8 h-8 rounded-full gradient-forest flex items-center justify-center text-white text-xs font-bold">A</div>
            <div>
              <p className="text-xs font-semibold text-white">Admin User</p>
              <p className="text-2xs text-forest-400">admin@nurserynearby.in</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
