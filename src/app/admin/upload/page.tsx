"use client";
import { useState, useRef, useCallback } from "react";
import { BULK_UPLOAD_TEMPLATE_HEADERS, BULK_UPLOAD_SAMPLE_ROW } from "@/lib/utils";

type UploadStatus = "idle" | "parsing" | "uploading" | "done" | "error";

interface ParsedRow {
  row: number;
  data: Record<string, string>;
  errors: string[];
  valid: boolean;
}

interface UploadResult {
  total:             number;
  imported:          number;
  failed:            number;
  skippedDuplicates: number;
  errors:            { row: number; name: string; error: string }[];
  batchId:           string;
}

function downloadTemplate() {
  const header = BULK_UPLOAD_TEMPLATE_HEADERS.join(",");
  const sample = BULK_UPLOAD_SAMPLE_ROW.map((v) => `"${v}"`).join(",");
  const instructions = [
    "# NurseryNearby Bulk Upload Template",
    "# Instructions:",
    "# - Do NOT modify the header row",
    "# - 'city' must match exactly: Delhi, Mumbai, Bangalore, Chandigarh, Jaipur, Ludhiana, Panipat, Pune, Hyderabad, Ahmedabad, Chennai, Kolkata",
    "# - 'categories' multiple values separated by | e.g. Indoor Plants|Flower Plants",
    "# - 'isFeatured' and 'isVerified': true or false",
    "# - Remove this instruction block before uploading",
    header,
    sample,
  ].join("\n");
  const blob = new Blob([instructions], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "nurserynearby_upload_template.csv"; a.click();
  URL.revokeObjectURL(url);
}

function validateRow(row: Record<string, string>, rowNum: number): ParsedRow {
  const errors: string[] = [];
  if (!row.name?.trim()) errors.push("'name' is required");
  if (!row.phone?.trim()) errors.push("'phone' is required");
  if (!row.address?.trim()) errors.push("'address' is required");
  if (!row.city?.trim()) errors.push("'city' is required");
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) errors.push("Invalid email");
  if (row.latitude && isNaN(parseFloat(row.latitude))) errors.push("Invalid latitude");
  if (row.longitude && isNaN(parseFloat(row.longitude))) errors.push("Invalid longitude");
  return { row: rowNum, data: row, errors, valid: errors.length === 0 };
}

export default function BulkUploadPage() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCSV = useCallback(async (f: File) => {
    setStatus("parsing");
    setErrorMsg("");
    setParsedRows([]);
    setResult(null);

    try {
      const text = await f.text();
      const lines = text.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
      if (lines.length < 2) throw new Error("File is empty or has no data rows.");

      // Auto-detect delimiter: tab or comma
      const firstLine = lines[0];
      const delimiter = firstLine.includes("\t") ? "\t" : ",";

      const rawHeader = firstLine.split(delimiter).map((h) => h.replace(/['"\r]/g, "").trim());
      const missing = ["name","address","city"].filter((r) => !rawHeader.includes(r));
      if (missing.length > 0) throw new Error(`Missing required columns: ${missing.join(", ")}`);

      const rows: ParsedRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].replace(/\r$/, "");
        if (!line.trim()) continue;

        let values: string[];
        if (delimiter === "\t") {
          // Tab-separated: simple split
          values = line.split("\t").map((v) => v.replace(/^"|"$/g, "").trim());
        } else {
          // Comma-separated: handle quoted fields
          values = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g) ?? [];
          values = values.map((v) => v.replace(/^"|"$/g, "").trim());
        }

        const row: Record<string, string> = {};
        rawHeader.forEach((h, idx) => {
          row[h] = (values[idx] ?? "").trim();
        });
        rows.push(validateRow(row, i));
      }

      setParsedRows(rows);
      setPreviewMode(true);
      setStatus("idle");
    } catch (e: any) {
      setErrorMsg(e.message);
      setStatus("error");
    }
  }, []);

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".csv") && !f.name.endsWith(".xlsx") && !f.name.endsWith(".xls")) {
      setErrorMsg("Only CSV and Excel files are supported.");
      return;
    }
    setFile(f);
    parseCSV(f);
  };

  const handleUpload = async () => {
    const validRows = parsedRows.filter((r) => r.valid);
    if (validRows.length === 0) { setErrorMsg("No valid rows to upload."); return; }

    setStatus("uploading");
    setProgress(0);

    try {
      // Simulate progress while uploading
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 85));
      }, 300);

      const res = await fetch("/api/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validRows.map((r) => r.data) }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Upload failed");
      }

      const data = await res.json();
      setResult({ ...data, skippedDuplicates: data.skippedDuplicates ?? 0 });
      setStatus("done");
    } catch (e: any) {
      setErrorMsg(e.message);
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle"); setFile(null); setParsedRows([]);
    setResult(null); setErrorMsg(""); setProgress(0); setPreviewMode(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const valid   = parsedRows.filter((r) => r.valid).length;
  const invalid = parsedRows.filter((r) => !r.valid).length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest-900">Bulk Upload Nurseries</h1>
          <p className="text-gray-500 text-sm mt-1">Upload hundreds of nursery listings at once via CSV or Excel</p>
        </div>
        <button onClick={downloadTemplate}
          className="btn btn-outline btn-sm">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          Download Template
        </button>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[
          { step:"1", label:"Download Template", desc:"Get the CSV template with all required columns", icon:"📥" },
          { step:"2", label:"Fill in Data",       desc:"Add nursery data following the format guide",    icon:"✏️" },
          { step:"3", label:"Upload File",         desc:"Drag & drop your CSV or Excel file here",       icon:"📤" },
          { step:"4", label:"Review & Import",     desc:"Preview, fix errors, then confirm upload",      icon:"✅" },
        ].map((s) => (
          <div key={s.step} className="flex gap-3 p-4 rounded-xl bg-forest-50 border border-forest-100">
            <div className="w-7 h-7 gradient-forest rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">{s.step}</div>
            <div>
              <p className="text-xs font-bold text-forest-900">{s.label}</p>
              <p className="text-2xs text-gray-500 mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      {!previewMode && (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
            ${dragOver ? "border-forest bg-forest-50 scale-[1.01]" : "border-gray-200 hover:border-forest-300 hover:bg-gray-50"}
            ${status === "parsing" ? "pointer-events-none opacity-60" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept=".csv,.tsv,.xlsx,.xls,.txt" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}/>
          <div className="text-5xl mb-4">{status === "parsing" ? "⏳" : "📤"}</div>
          {status === "parsing" ? (
            <p className="font-semibold text-forest">Parsing your file…</p>
          ) : (
            <>
              <p className="font-display text-xl font-bold text-gray-800 mb-1">Drop your CSV or Excel file here</p>
              <p className="text-sm text-gray-500 mb-4">or click to browse from your computer</p>
              <div className="flex justify-center gap-2">
                <span className="badge badge-cream">CSV</span>
                <span className="badge badge-cream">TSV</span>
                <span className="badge badge-cream">XLSX</span>
              </div>
              <p className="text-xs text-gray-400 mt-4">Max 10,000 rows · CSV or TSV (tab-separated) · UTF-8 encoding</p>
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {status === "error" && errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-red-500 text-lg shrink-0">⚠️</span>
          <div>
            <p className="font-semibold text-red-800 text-sm">Upload Error</p>
            <p className="text-red-700 text-sm mt-0.5">{errorMsg}</p>
          </div>
          <button onClick={reset} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Preview panel */}
      {previewMode && parsedRows.length > 0 && status !== "done" && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex flex-wrap items-center gap-4 p-5 rounded-2xl border border-gray-100 bg-white shadow-soft">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-forest-50 border border-forest-100 rounded-xl flex items-center justify-center text-forest text-lg">📄</div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{file?.name}</p>
                <p className="text-2xs text-gray-400">{parsedRows.length} rows detected</p>
              </div>
            </div>
            <div className="flex gap-3 ml-auto flex-wrap">
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-800 px-3 py-2 rounded-xl text-sm font-semibold">
                <span>✓</span> {valid} Valid
              </div>
              {invalid > 0 && (
                <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 text-red-800 px-3 py-2 rounded-xl text-sm font-semibold">
                  <span>✗</span> {invalid} Errors
                </div>
              )}
              <button onClick={reset} className="btn btn-ghost btn-sm text-gray-500">Change File</button>
              <button onClick={handleUpload} disabled={valid === 0 || status === "uploading"}
                className="btn btn-primary btn-sm disabled:opacity-50">
                {status === "uploading"
                  ? `Uploading… ${progress}%`
                  : `Import ${valid} Nurseries`}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {status === "uploading" && (
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full gradient-forest rounded-full transition-all duration-300" style={{ width: `${progress}%` }}/>
            </div>
          )}

          {/* Data table preview */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <p className="font-semibold text-sm text-gray-700">Data Preview (first 20 rows)</p>
              <span className="badge badge-cream">{parsedRows.length} total rows</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-th w-12">Row</th>
                    <th className="table-th">Name</th>
                    <th className="table-th">Phone</th>
                    <th className="table-th">City</th>
                    <th className="table-th">Address</th>
                    <th className="table-th">Categories</th>
                    <th className="table-th w-24">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.slice(0, 20).map((r) => (
                    <tr key={r.row} className={r.valid ? "" : "bg-red-50"}>
                      <td className="table-td text-gray-400 text-center">{r.row}</td>
                      <td className="table-td font-semibold text-gray-900 max-w-[180px] truncate">{r.data.name || "—"}</td>
                      <td className="table-td text-gray-600">{r.data.phone || "—"}</td>
                      <td className="table-td">
                        <span className="badge badge-cream">{r.data.city || "—"}</span>
                      </td>
                      <td className="table-td text-gray-500 max-w-[200px] truncate">{r.data.address || "—"}</td>
                      <td className="table-td text-gray-500 max-w-[160px] truncate">{r.data.categories || "—"}</td>
                      <td className="table-td">
                        {r.valid
                          ? <span className="badge badge-green">✓ Valid</span>
                          : (
                            <div title={r.errors.join(", ")}>
                              <span className="badge badge-red cursor-help">✗ Error</span>
                            </div>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedRows.length > 20 && (
                <p className="text-center text-xs text-gray-400 py-3">
                  … and {parsedRows.length - 20} more rows
                </p>
              )}
            </div>
          </div>

          {/* Error detail panel */}
          {invalid > 0 && (
            <div className="card p-5 border-red-100">
              <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <span>⚠️</span> {invalid} Row{invalid > 1 ? "s" : ""} with Errors
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {parsedRows.filter((r) => !r.valid).map((r) => (
                  <div key={r.row} className="bg-red-50 rounded-xl px-4 py-2.5 flex items-start gap-3">
                    <span className="badge badge-red shrink-0 text-2xs">Row {r.row}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-red-800 truncate">{r.data.name || "Unknown"}</p>
                      <p className="text-2xs text-red-600">{r.errors.join(" · ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success result */}
      {status === "done" && result && (
        <div className="card p-8 text-center border-forest-100 bg-forest-50">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="font-display text-2xl font-bold text-forest-900 mb-2">Import Complete!</h2>
          <p className="text-gray-600 mb-6">Your nursery data has been successfully uploaded and is pending review.</p>
          <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto mb-6">
            <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
              <p className="font-display text-2xl font-bold text-forest">{result.total}</p>
              <p className="text-2xs text-gray-500 uppercase tracking-wider">Total</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-green-100 text-center">
              <p className="font-display text-2xl font-bold text-green-600">{result.imported}</p>
              <p className="text-2xs text-gray-500 uppercase tracking-wider">Imported</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-amber-100 text-center">
              <p className="font-display text-2xl font-bold text-amber-500">{result.skippedDuplicates}</p>
              <p className="text-2xs text-gray-500 uppercase tracking-wider">Duplicates</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-red-100 text-center">
              <p className="font-display text-2xl font-bold text-red-500">{result.failed - result.skippedDuplicates}</p>
              <p className="text-2xs text-gray-500 uppercase tracking-wider">Errors</p>
            </div>
          </div>
          <p className="text-2xs text-gray-400 mb-5">Batch ID: {result.batchId}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={reset} className="btn btn-outline">Upload Another File</button>
            <a href="/admin/listings" className="btn btn-primary">View Listings</a>
          </div>
        </div>
      )}

      {/* Template reference */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-forest-900">Column Reference</h3>
          <button onClick={downloadTemplate} className="btn btn-ghost btn-sm text-forest">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            Download CSV Template
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="table-th">Column</th>
                <th className="table-th">Required</th>
                <th className="table-th">Format</th>
                <th className="table-th">Example</th>
              </tr>
            </thead>
            <tbody>
              {[
                { col:"name",          req:true,  fmt:"Text",         ex:"Green Paradise Nursery" },
                { col:"phone",         req:true,  fmt:"+91XXXXXXXXXX", ex:"+91-9810123456" },
                { col:"address",       req:true,  fmt:"Text",         ex:"15 Model Town Phase 2" },
                { col:"city",          req:true,  fmt:"City name",    ex:"Delhi" },
                { col:"categories",    req:false, fmt:"Pipe-separated",ex:"Indoor Plants|Flower Plants" },
                { col:"phone2",        req:false, fmt:"+91XXXXXXXXXX", ex:"+91-9810123457" },
                { col:"whatsapp",      req:false, fmt:"10-digit num",  ex:"9810123456" },
                { col:"email",         req:false, fmt:"email",         ex:"info@nursery.in" },
                { col:"website",       req:false, fmt:"URL",           ex:"https://nursery.com" },
                { col:"area",          req:false, fmt:"Locality name", ex:"Model Town" },
                { col:"landmark",      req:false, fmt:"Text",          ex:"Near Metro Station" },
                { col:"pincode",       req:false, fmt:"6-digit",       ex:"110009" },
                { col:"latitude",      req:false, fmt:"Decimal",       ex:"28.7041" },
                { col:"longitude",     req:false, fmt:"Decimal",       ex:"77.1025" },
                { col:"openingHours",  req:false, fmt:"Text",          ex:"Mon-Sun 8AM-8PM" },
                { col:"established",   req:false, fmt:"Year",          ex:"1998" },
                { col:"isFeatured",    req:false, fmt:"true/false",    ex:"true" },
                { col:"isVerified",    req:false, fmt:"true/false",    ex:"true" },
                { col:"primaryImageUrl",req:false,fmt:"URL",           ex:"https://..." },
              ].map((r) => (
                <tr key={r.col} className="hover:bg-gray-50">
                  <td className="table-td font-mono font-semibold text-forest">{r.col}</td>
                  <td className="table-td">
                    <span className={`badge text-2xs ${r.req ? "badge-red" : "badge-cream"}`}>{r.req ? "Required" : "Optional"}</span>
                  </td>
                  <td className="table-td text-gray-500">{r.fmt}</td>
                  <td className="table-td text-gray-400 font-mono text-2xs">{r.ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
