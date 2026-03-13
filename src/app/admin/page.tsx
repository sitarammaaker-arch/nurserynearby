import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin Dashboard" };

const STATS = [
  { label:"Total Nurseries",  value:"1,284",  change:"+12 this week", icon:"🌿", color:"bg-forest-50 text-forest border-forest-100" },
  { label:"Pending Review",   value:"23",      change:"Needs action",  icon:"⏳", color:"bg-amber-50 text-amber-800 border-amber-100" },
  { label:"Cities Covered",   value:"48",      change:"+3 this month", icon:"🏙️", color:"bg-blue-50 text-blue-800 border-blue-100"   },
  { label:"Total Reviews",    value:"8,420",   change:"+89 this week", icon:"⭐", color:"bg-purple-50 text-purple-800 border-purple-100" },
];

const RECENT_IMPORTS = [
  { filename:"delhi_nurseries_jan.csv", rows:245, success:238, failed:7,  status:"done",       date:"Mar 12, 2025" },
  { filename:"mumbai_batch_2.xlsx",     rows:180, success:180, failed:0,  status:"done",       date:"Mar 10, 2025" },
  { filename:"punjab_nurseries.csv",    rows:92,  success:88,  failed:4,  status:"done",       date:"Mar 8, 2025"  },
  { filename:"south_india_batch.xlsx",  rows:310, success:0,   failed:0,  status:"processing", date:"Mar 14, 2025" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <Link href="/admin/upload" className="btn btn-primary">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg>
          Bulk Upload
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className={`rounded-2xl border p-5 ${s.color}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">{s.label}</p>
                <p className="font-display text-3xl font-bold">{s.value}</p>
                <p className="text-xs mt-1 opacity-70">{s.change}</p>
              </div>
              <span className="text-2xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-forest-900 mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:"Bulk CSV Upload",  href:"/admin/upload",  icon:"📤", desc:"Upload CSV/Excel files" },
              { label:"View All Listings",href:"/admin/listings",icon:"📋", desc:"Manage all nurseries" },
              { label:"Import Logs",      href:"/admin/import-logs",icon:"📊", desc:"View upload history" },
              { label:"Add Single",       href:"/add-listing",   icon:"➕", desc:"Add one nursery" },
            ].map((a) => (
              <Link key={a.href} href={a.href}
                className="flex flex-col p-4 rounded-xl border border-gray-100 hover:border-forest-200 hover:bg-forest-50 transition-all group">
                <span className="text-2xl mb-2">{a.icon}</span>
                <span className="font-semibold text-sm text-gray-900 group-hover:text-forest">{a.label}</span>
                <span className="text-2xs text-gray-400">{a.desc}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent imports */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-forest-900">Recent Imports</h2>
            <Link href="/admin/import-logs" className="text-xs text-forest font-semibold hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {RECENT_IMPORTS.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{r.filename}</p>
                  <p className="text-2xs text-gray-400">{r.date} · {r.rows} rows</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-2xs text-green-700">✓{r.success}</span>
                  {r.failed > 0 && <span className="text-2xs text-red-600">✗{r.failed}</span>}
                  <span className={`badge text-2xs ${r.status === "done" ? "badge-green" : "badge-gold"}`}>
                    {r.status === "done" ? "Done" : "⏳ Running"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
