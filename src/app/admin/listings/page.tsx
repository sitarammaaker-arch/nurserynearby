import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ApprovalActions from "./ApprovalActions";

interface Props {
  searchParams: { status?: string; city?: string; q?: string; page?: string };
}

export const dynamic = "force-dynamic";

export default async function AdminListings({ searchParams }: Props) {
  const page   = Number(searchParams.page ?? 1);
  const limit  = 20;
  const status = searchParams.status ?? "all";

  const where: any = {};
  if (status === "pending") { where.isPending = true;  where.isActive = false; }
  if (status === "active")  { where.isPending = false; where.isActive = true;  }
  if (status === "inactive"){ where.isActive  = false; where.isPending = false; }
  if (searchParams.city)    where.city = { slug: searchParams.city };
  if (searchParams.q)       where.name = { contains: searchParams.q, mode: "insensitive" };

  let nurseries: any[] = [];
  let total = 0;
  try {
    [nurseries, total] = await Promise.all([
      prisma.nursery.findMany({
        where,
        include: {
          city:       { select: { name: true, slug: true } },
          categories: { include: { category: { select: { name: true } } } },
        },
        orderBy: [{ isPending: "desc" }, { createdAt: "desc" }],
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.nursery.count({ where }),
    ]);
  } catch (e) {
    console.error(e);
  }

  // Count badges
  let pendingCount = 0, activeCount = 0, allCount = 0;
  try {
    [pendingCount, activeCount, allCount] = await Promise.all([
      prisma.nursery.count({ where: { isPending: true, isActive: false } }),
      prisma.nursery.count({ where: { isActive: true, isPending: false } }),
      prisma.nursery.count(),
    ]);
  } catch {}

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest-900">Manage Listings</h1>
          <p className="text-sm text-gray-500 mt-1">{total} nurseries shown</p>
        </div>
        <Link href="/admin/upload" className="btn btn-primary">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg>
          Bulk Upload
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "All",      val: "all",      count: allCount,     color: "bg-gray-100 text-gray-700"           },
          { label: "⏳ Pending Approval", val: "pending", count: pendingCount, color: "bg-amber-100 text-amber-800" },
          { label: "✅ Active", val: "active",   count: activeCount,  color: "bg-green-100 text-green-800"         },
          { label: "❌ Inactive", val: "inactive", count: allCount - activeCount - pendingCount, color: "bg-red-50 text-red-700" },
        ].map((t) => (
          <Link key={t.val} href={`?status=${t.val}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              status === t.val
                ? "gradient-forest text-white border-transparent shadow-green"
                : `${t.color} border-transparent hover:border-gray-200`
            }`}>
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${status === t.val ? "bg-white/20 text-white" : "bg-white/60"}`}>
              {t.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && status !== "pending" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="font-semibold text-amber-800">{pendingCount} nurseries waiting for approval</p>
            <p className="text-sm text-amber-600">These won't show on the site until you approve them.</p>
          </div>
          <Link href="?status=pending" className="btn btn-sm bg-amber-500 text-white hover:bg-amber-600 shrink-0">
            Review Now →
          </Link>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Nursery</th>
                <th className="table-th">City</th>
                <th className="table-th">Category</th>
                <th className="table-th">Phone</th>
                <th className="table-th">Rating</th>
                <th className="table-th">Status</th>
                <th className="table-th">Added</th>
                <th className="table-th text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {nurseries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-2">🌱</p>
                    <p className="font-medium">No nurseries found</p>
                  </td>
                </tr>
              ) : (
                nurseries.map((n) => (
                  <tr key={n.id} className={`hover:bg-gray-50 transition-colors ${n.isPending ? "bg-amber-50/50" : ""}`}>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        {n.isPending && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" title="Pending approval"/>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{n.name}</p>
                          <p className="text-2xs text-gray-400 truncate max-w-[180px]">{n.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className="badge badge-cream">{n.city.name}</span>
                    </td>
                    <td className="table-td">
                      <div className="flex gap-1 flex-wrap max-w-[140px]">
                        {n.categories.slice(0, 2).map((c: any) => (
                          <span key={c.category.name} className="text-2xs bg-forest-50 text-forest-700 px-1.5 py-0.5 rounded-full border border-forest-100">
                            {c.category.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="table-td text-xs text-gray-600">{n.phone ?? "—"}</td>
                    <td className="table-td">
                      {n.avgRating > 0 ? (
                        <span className="flex items-center gap-1 text-sm">
                          <span className="text-amber-400">★</span>
                          <span className="font-bold">{n.avgRating.toFixed(1)}</span>
                          <span className="text-gray-400 text-xs">({n.totalReviews})</span>
                        </span>
                      ) : <span className="text-gray-400 text-xs">No reviews</span>}
                    </td>
                    <td className="table-td">
                      {n.isPending ? (
                        <span className="badge badge-gold">⏳ Pending</span>
                      ) : n.isActive ? (
                        <span className="badge badge-green">✅ Live</span>
                      ) : (
                        <span className="badge badge-red">❌ Inactive</span>
                      )}
                    </td>
                    <td className="table-td text-2xs text-gray-400">
                      {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="table-td">
                      <ApprovalActions
                        id={n.id}
                        isActive={n.isActive}
                        isPending={n.isPending}
                        isFeatured={n.isFeatured}
                        slug={n.slug}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-sm text-gray-500">Page {page} of {pages} · {total} total</span>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={`?status=${status}&page=${p}`}
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                    p === page ? "gradient-forest text-white" : "hover:bg-gray-100 text-gray-600"
                  }`}>{p}</Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
