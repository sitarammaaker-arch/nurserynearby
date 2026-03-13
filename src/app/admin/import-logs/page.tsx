import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Import Logs — Admin" };

const DEMO_LOGS = [
  { id:"l1", batchId:"batch-001", filename:"delhi_nurseries_jan.csv",     totalRows:245, successRows:238, failedRows:7,  status:"done",       importedBy:"admin", createdAt:new Date("2025-03-12T10:30:00") },
  { id:"l2", batchId:"batch-002", filename:"mumbai_batch_2.xlsx",         totalRows:180, successRows:180, failedRows:0,  status:"done",       importedBy:"admin", createdAt:new Date("2025-03-10T14:15:00") },
  { id:"l3", batchId:"batch-003", filename:"punjab_nurseries.csv",        totalRows:92,  successRows:88,  failedRows:4,  status:"done",       importedBy:"admin", createdAt:new Date("2025-03-08T09:00:00") },
  { id:"l4", batchId:"batch-004", filename:"south_india_batch.xlsx",      totalRows:310, successRows:297, failedRows:13, status:"done",       importedBy:"admin", createdAt:new Date("2025-03-06T16:45:00") },
  { id:"l5", batchId:"batch-005", filename:"rajasthan_nurseries.csv",     totalRows:67,  successRows:65,  failedRows:2,  status:"done",       importedBy:"admin", createdAt:new Date("2025-03-04T11:20:00") },
  { id:"l6", batchId:"batch-006", filename:"maharashtra_wholesalers.csv", totalRows:140, successRows:140, failedRows:0,  status:"done",       importedBy:"admin", createdAt:new Date("2025-03-01T08:30:00") },
];

export default async function ImportLogsPage() {
  let logs = DEMO_LOGS;
  try {
    const db = await prisma.bulkImportLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    if (db.length > 0) logs = db as any;
  } catch {}

  const totalImported = logs.reduce((s, l) => s + l.successRows, 0);
  const totalFailed   = logs.reduce((s, l) => s + l.failedRows, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest-900">Import Logs</h1>
          <p className="text-sm text-gray-500 mt-1">History of all bulk upload operations</p>
        </div>
        <Link href="/admin/upload" className="btn btn-primary">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg>
          New Upload
        </Link>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 bg-forest-50 border-forest-100">
          <p className="text-2xs font-bold uppercase tracking-wider text-forest-500 mb-1">Total Batches</p>
          <p className="font-display text-3xl font-bold text-forest">{logs.length}</p>
        </div>
        <div className="card p-5 bg-green-50 border-green-100">
          <p className="text-2xs font-bold uppercase tracking-wider text-green-600 mb-1">Successfully Imported</p>
          <p className="font-display text-3xl font-bold text-green-700">{totalImported.toLocaleString()}</p>
        </div>
        <div className="card p-5 bg-red-50 border-red-100">
          <p className="text-2xs font-bold uppercase tracking-wider text-red-500 mb-1">Failed Rows</p>
          <p className="font-display text-3xl font-bold text-red-600">{totalFailed.toLocaleString()}</p>
        </div>
      </div>

      {/* Logs table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="font-semibold text-sm text-gray-700">All Import Batches</p>
          <span className="badge badge-cream">{logs.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Filename</th>
                <th className="table-th">Date</th>
                <th className="table-th text-center">Total</th>
                <th className="table-th text-center">Success</th>
                <th className="table-th text-center">Failed</th>
                <th className="table-th text-center">Success Rate</th>
                <th className="table-th">Status</th>
                <th className="table-th">Batch ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const rate = Math.round((log.successRows / (log.totalRows || 1)) * 100);
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="table-td">
                      <p className="font-medium text-gray-900 text-sm">{log.filename}</p>
                      <p className="text-2xs text-gray-400">By {log.importedBy}</p>
                    </td>
                    <td className="table-td text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                      <br/>
                      <span className="text-2xs text-gray-400">
                        {new Date(log.createdAt).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}
                      </span>
                    </td>
                    <td className="table-td text-center font-bold text-gray-700">{log.totalRows}</td>
                    <td className="table-td text-center font-bold text-green-700">{log.successRows}</td>
                    <td className="table-td text-center font-bold text-red-500">{log.failedRows}</td>
                    <td className="table-td text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-forest rounded-full" style={{ width: `${rate}%` }}/>
                        </div>
                        <span className="text-xs font-bold text-gray-700">{rate}%</span>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className={`badge ${log.status === "done" ? "badge-green" : "badge-gold"}`}>
                        {log.status === "done" ? "✓ Done" : "⏳ Running"}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className="font-mono text-2xs text-gray-400 select-all">{log.batchId.slice(0, 8)}…</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
