"use client";
import { useState } from "react";

const MOCK = Array.from({ length: 20 }, (_, i) => ({
  id: `n${i+1}`,
  name: ["Green Paradise Nursery","Bloom & Grow Garden","Nature's Basket","Harish Plants","Sukhna Green","Flora Hub","Royal Botanics","Patel Garden"][i % 8] + (i > 7 ? ` #${i}` : ""),
  city: ["Delhi","Bangalore","Mumbai","Jaipur","Chandigarh","Hyderabad","Pune","Lucknow"][i % 8],
  phone: `+91-9810${String(i).padStart(5,"0")}`,
  rating: (3.5 + (i % 15) * 0.1).toFixed(1),
  reviews: (20 + i * 7),
  status: i % 5 === 0 ? "pending" : "active",
  featured: i % 4 === 0,
  verified: i % 3 === 0,
  createdAt: new Date(Date.now() - i * 86400000 * 2).toLocaleDateString("en-IN"),
}));

export default function AdminListings() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = MOCK.filter((n) => {
    const q = search.toLowerCase();
    const matchQ = !q || n.name.toLowerCase().includes(q) || n.city.toLowerCase().includes(q);
    const matchS = statusFilter === "all" || n.status === statusFilter;
    return matchQ && matchS;
  });

  const toggleSelect = (id: string) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((n) => n.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest-900">Manage Listings</h1>
          <p className="text-sm text-gray-500 mt-1">{MOCK.length} total nurseries</p>
        </div>
        <a href="/admin/upload" className="btn btn-primary">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg>
          Bulk Upload
        </a>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-400 shrink-0">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nurseries…" className="outline-none bg-transparent text-sm w-full"/>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="input px-4 py-2 w-auto text-sm">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
        </select>
        {selected.length > 0 && (
          <div className="flex gap-2">
            <button className="btn btn-sm bg-green-50 text-green-800 border border-green-200">✓ Approve ({selected.length})</button>
            <button className="btn btn-sm bg-red-50 text-red-800 border border-red-100">✗ Delete ({selected.length})</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th w-10">
                  <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll} className="rounded"/>
                </th>
                <th className="table-th">Nursery</th>
                <th className="table-th">City</th>
                <th className="table-th">Rating</th>
                <th className="table-th">Status</th>
                <th className="table-th">Badges</th>
                <th className="table-th">Added</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr key={n.id} className={`hover:bg-gray-50 ${selected.includes(n.id) ? "bg-forest-50" : ""}`}>
                  <td className="table-td text-center">
                    <input type="checkbox" checked={selected.includes(n.id)} onChange={() => toggleSelect(n.id)} className="rounded"/>
                  </td>
                  <td className="table-td">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{n.name}</p>
                      <p className="text-2xs text-gray-400">{n.phone}</p>
                    </div>
                  </td>
                  <td className="table-td"><span className="badge badge-cream">{n.city}</span></td>
                  <td className="table-td">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400 text-sm">★</span>
                      <span className="text-sm font-semibold">{n.rating}</span>
                      <span className="text-2xs text-gray-400">({n.reviews})</span>
                    </div>
                  </td>
                  <td className="table-td">
                    <span className={`badge ${n.status === "active" ? "badge-green" : "badge-gold"}`}>
                      {n.status === "active" ? "✓ Active" : "⏳ Pending"}
                    </span>
                  </td>
                  <td className="table-td">
                    <div className="flex gap-1">
                      {n.featured && <span className="badge badge-gold">⭐</span>}
                      {n.verified && <span className="badge badge-green">✓</span>}
                    </div>
                  </td>
                  <td className="table-td text-gray-400 text-2xs">{n.createdAt}</td>
                  <td className="table-td">
                    <div className="flex gap-1">
                      <button className="text-xs text-forest hover:underline font-medium">Edit</button>
                      <span className="text-gray-300">|</span>
                      <button className="text-xs text-red-500 hover:underline font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50">
          <span>Showing {filtered.length} of {MOCK.length} nurseries</span>
          <div className="flex gap-1">
            {[1,2,3].map((p) => (
              <button key={p} className={`w-8 h-8 rounded-lg text-xs font-bold ${p===1?"gradient-forest text-white":"hover:bg-gray-100"}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
