// src/features/dashboard/components/ImportExcelModal.jsx
import React, { useCallback, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  X, UploadCloud, FileSpreadsheet, AlertCircle,
  CheckCircle2, ChevronDown, ChevronUp, Loader2,
} from "lucide-react";
import { searchMedicines } from "../../medicines/api/medicinesSearchApi"; // ✅ use shared search fn
import { addInventoryItem } from "../../inventory item/api/inventoryItem";

// ── helpers ──────────────────────────────────────────────────────────────────

const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const defaultExpiry = () =>
  new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

/**
 * Maps one spreadsheet row → internal preview shape.
 *
 * Accepts the app's own CSV export columns:  ID, Name, Category, Qty, Price, Expiry, Status
 * AND the import template columns:           MedicineName, Quantity, Price, ExpiryDate
 */
const mapRow = (raw, index) => {
  const r = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k.trim().toLowerCase().replace(/\s+/g, ""), v])
  );

  const medicineName = String(
    r["medicinename"] ?? r["medicine"] ?? r["drugname"] ?? r["drug"] ?? r["name"] ?? ""
  ).trim();

  const quantity = toNumber(r["quantity"] ?? r["qty"] ?? r["stock"] ?? r["amount"] ?? 0);
  const price    = toNumber(r["price"]    ?? r["unitprice"] ?? r["cost"] ?? 0);

  let expiryDate  = defaultExpiry();
  const rawExpiry = r["expirydate"] ?? r["expiry"] ?? r["expdate"] ?? r["expires"] ?? null;
  if (rawExpiry) {
    if (typeof rawExpiry === "number") {
      try {
        const d = XLSX.SSF.parse_date_code(rawExpiry);
        if (d) expiryDate = new Date(d.y, d.m - 1, d.d).toISOString();
      } catch (_) {}
    } else {
      const parsed = new Date(rawExpiry);
      if (!isNaN(parsed)) expiryDate = parsed.toISOString();
    }
  }

  const errors = [];
  if (!medicineName) errors.push("Medicine name is required");
  if (quantity <= 0) errors.push("Quantity must be > 0");

  return {
    rowIndex: index + 2,
    medicineName,
    quantity,
    price,
    expiryDate,
    errors,
    _valid: errors.length === 0,
  };
};

/**
 * Resolves a medicine name → numeric MedicineID via /medicines/search.
 * Uses the shared searchMedicines API fn so the query param is correct ("query", not "name").
 * Prefers an exact case-insensitive match; falls back to the first result.
 * Returns null if nothing found or the request fails.
 */
const resolveMedicineId = async (name) => {
  try {
    const res  = await searchMedicines(name);          // ✅ sends ?query=<name>&top=10
    const list = res?.data ?? [];
    if (!list.length) return null;
    const exact = list.find(
      (m) => (m.name ?? m.Name ?? "").toLowerCase() === name.toLowerCase()
    );
    const match = exact ?? list[0];
    return match?.id ?? match?.Id ?? null;
  } catch {
    return null;
  }
};

// ── sub-components ────────────────────────────────────────────────────────────

function DropZone({ onFile, disabled }) {
  const inputRef        = useRef(null);
  const [drag, setDrag] = useState(false);

  const handle = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext)) return;
    onFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl
        border-2 border-dashed p-10 text-center transition-all
        ${drag     ? "border-secondary bg-secondary/5 scale-[1.01]"
                   : "border-gray-200 bg-gray-50 hover:border-secondary/50 hover:bg-secondary/5"}
        ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
        <FileSpreadsheet className="h-7 w-7 text-secondary" />
      </div>
      <div>
        <p className="font-semibold text-gray-700">Drop your Excel / CSV file here</p>
        <p className="mt-0.5 text-xs text-gray-400">or click to browse · .xlsx · .xls · .csv</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
    </div>
  );
}

function TemplateDownload() {
  const download = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["MedicineName", "Quantity", "Price", "ExpiryDate"],
      ["Paracetamol 500mg", 100, 12.5,  "2026-12-31"],
      ["Amoxicillin 250mg",  50, 35.0,  "2027-06-30"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "inventory-import-template.xlsx");
  };
  return (
    <button
      type="button"
      onClick={download}
      className="text-xs text-secondary underline underline-offset-2 hover:opacity-80"
    >
      Download template
    </button>
  );
}

function PreviewTable({ rows, showAll, onToggle }) {
  const displayed    = showAll ? rows : rows.slice(0, 5);
  const invalidCount = rows.filter((r) => !r._valid).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">
          Preview — {rows.length} row{rows.length !== 1 ? "s" : ""}
          {invalidCount > 0 && (
            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
              {invalidCount} invalid
            </span>
          )}
        </p>
        <span className="text-xs text-gray-400">
          {rows.filter((r) => r._valid).length} will be imported
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-xs">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-500">
                {["Row","Medicine Name","Qty","Price","Expiry","Status"].map((h) => (
                  <th key={h} className={`px-3 py-2 font-medium ${h === "Qty" || h === "Price" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((row) => (
                <tr key={row.rowIndex} className={`border-t ${row._valid ? "hover:bg-gray-50" : "bg-red-50/60"}`}>
                  <td className="px-3 py-2 text-gray-400">{row.rowIndex}</td>
                  <td className="px-3 py-2 font-medium text-gray-800">{row.medicineName || "—"}</td>
                  <td className="px-3 py-2 text-right">{row.quantity}</td>
                  <td className="px-3 py-2 text-right">{row.price > 0 ? `EGP ${row.price}` : "—"}</td>
                  <td className="px-3 py-2 text-gray-600">
                    {row.expiryDate ? new Date(row.expiryDate).toISOString().slice(0, 10) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {row._valid ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Valid
                      </span>
                    ) : (
                      <span className="flex cursor-help items-center gap-1 text-red-500" title={row.errors.join(", ")}>
                        <AlertCircle className="h-3.5 w-3.5" /> {row.errors[0]}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rows.length > 5 && (
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-1 rounded-xl border py-2 text-xs text-gray-500 transition hover:bg-gray-50"
        >
          {showAll
            ? <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
            : <><ChevronDown className="h-3.5 w-3.5" /> Show all {rows.length} rows</>}
        </button>
      )}
    </div>
  );
}

function ImportProgress({ results }) {
  const done    = results.filter((r) => r.status !== "pending").length;
  const success = results.filter((r) => r.status === "success").length;
  const failed  = results.filter((r) => r.status === "error").length;
  const pct     = results.length ? Math.round((done / results.length) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">Importing {results.length} item{results.length !== 1 ? "s" : ""}…</span>
        <span className="text-gray-400">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-secondary transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex gap-4 text-xs">
        <span className="text-green-600">✅ {success} added</span>
        {failed > 0 && <span className="text-red-500">❌ {failed} failed</span>}
        <span className="text-gray-400">{results.length - done} remaining</span>
      </div>
      {failed > 0 && (
        <div className="max-h-32 overflow-y-auto rounded-xl border border-red-100 bg-red-50 p-3 text-xs space-y-1">
          {results.filter((r) => r.status === "error").map((r) => (
            <p key={r.rowIndex} className="text-red-600">
              Row {r.rowIndex} ({r.medicineName}): {r.error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ── main modal ────────────────────────────────────────────────────────────────

export default function ImportExcelModal({ open, onClose, onImportComplete }) {
  const [rows,      setRows]      = useState([]);
  const [fileName,  setFileName]  = useState("");
  const [showAll,   setShowAll]   = useState(false);
  const [importing, setImporting] = useState(false);
  const [results,   setResults]   = useState(null);
  const [done,      setDone]      = useState(false);

  const reset = () => {
    setRows([]); setFileName(""); setShowAll(false);
    setImporting(false); setResults(null); setDone(false);
  };

  const handleClose = () => { if (importing) return; reset(); onClose(); };

  const handleFile = useCallback((file) => {
    setFileName(file.name);
    setRows([]); setResults(null); setDone(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb     = XLSX.read(e.target.result, { type: "array", cellDates: false });
        const ws     = wb.Sheets[wb.SheetNames[0]];
        const raw    = XLSX.utils.sheet_to_json(ws, { defval: "" });
        setRows(raw.map((r, i) => mapRow(r, i)));
      } catch (err) { console.error("Excel parse error:", err); }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleImport = async () => {
    const validRows = rows.filter((r) => r._valid);
    if (!validRows.length) return;

    setImporting(true);
    const progress = validRows.map((r) => ({ ...r, status: "pending", error: null }));
    setResults([...progress]);

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        // ── Step 1: resolve name → MedicineID ─────────────────────────────
        const medicineId = await resolveMedicineId(row.medicineName);
        if (!medicineId) {
          progress[i] = {
            ...progress[i],
            status: "error",
            error: `"${row.medicineName}" not found in the medicine database`,
          };
          setResults([...progress]);
          continue;
        }

        // ── Step 2: POST InventoryItem with numeric MedicineID ─────────────
        await addInventoryItem({
          MedicineID:     medicineId,   // ✅ numeric ID — backend requires this
          Quantity:       row.quantity,
          Price:          row.price,
          ExpiryDate:     row.expiryDate,
          CategoryId:     null,
          PrescriptionID: null,
          Status:         0,
        });

        progress[i] = { ...progress[i], status: "success" };
      } catch (err) {
        const msg =
          err?.response?.data?.message ??
          err?.response?.data ??
          err?.message ??
          "Unknown error";
        progress[i] = { ...progress[i], status: "error", error: String(msg) };
      }

      setResults([...progress]);
    }

    setImporting(false);
    setDone(true);
    onImportComplete?.();
  };

  if (!open) return null;

  const validCount   = rows.filter((r) =>  r._valid).length;
  const invalidCount = rows.filter((r) => !r._valid).length;
  const successCount = results?.filter((r) => r.status === "success").length ?? 0;
  const failCount    = results?.filter((r) => r.status === "error").length   ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl
                      sm:max-h-[90vh] sm:w-[90%] sm:rounded-2xl md:w-[75%] lg:w-[60%] xl:max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10">
              <FileSpreadsheet className="h-4 w-4 text-secondary" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 sm:text-lg">
              Import from Excel / CSV
            </h3>
          </div>
          <button onClick={handleClose} disabled={importing}
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40">
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">

          {/* Step 1 — drop zone */}
          {!fileName && (
            <>
              <DropZone onFile={handleFile} disabled={importing} />
              <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500">
                <span>Need the right column names? Use our template.</span>
                <TemplateDownload />
              </div>
              <div className="rounded-xl border border-gray-100 p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Accepted column names</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600 sm:grid-cols-4">
                  <span><code className="font-bold text-gray-800">MedicineName</code> *</span>
                  <span><code className="font-bold text-gray-800">Quantity</code> *</span>
                  <span><code className="text-gray-800">Price</code></span>
                  <span><code className="text-gray-800">ExpiryDate</code></span>
                </div>
                <p className="text-[11px] text-gray-400">
                  * Required. Case-insensitive. The app's own export columns
                  (<code>Name</code>, <code>Qty</code>, <code>Expiry</code>) are also accepted.
                </p>
              </div>
            </>
          )}

          {/* Step 2 — preview */}
          {fileName && !results && (
            <>
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{fileName}</p>
                    <p className="text-xs text-gray-400">{rows.length} rows parsed</p>
                  </div>
                </div>
                <button type="button" onClick={reset}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {rows.length > 0 && (
                <PreviewTable rows={rows} showAll={showAll} onToggle={() => setShowAll((v) => !v)} />
              )}

              {invalidCount > 0 && (
                <div className="flex items-start gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs text-yellow-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>
                    {invalidCount} row{invalidCount !== 1 ? "s" : ""} with errors will be skipped.
                    Only the {validCount} valid row{validCount !== 1 ? "s" : ""} will be imported.
                  </span>
                </div>
              )}

              <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  Each medicine name will be looked up in the master database.
                  Names that don't match an existing medicine will be reported as failed.
                </span>
              </div>
            </>
          )}

          {/* Step 3 — progress / result */}
          {results && (
            <>
              <ImportProgress results={results} />
              {done && (
                <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium
                  ${failCount === 0
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-yellow-200 bg-yellow-50 text-yellow-700"}`}>
                  <CheckCircle2 className="h-4 w-4" />
                  {failCount === 0
                    ? `All ${successCount} items imported successfully!`
                    : `${successCount} imported, ${failCount} failed — see errors above.`}
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            {!done && (
              <button type="button" onClick={handleClose} disabled={importing}
                className="rounded-full border border-gray-200 px-5 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-40">
                Cancel
              </button>
            )}
            {!results && rows.length > 0 && (
              <button type="button" onClick={handleImport} disabled={validCount === 0}
                className="flex items-center gap-2 rounded-full bg-secondary px-6 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50">
                <UploadCloud className="h-4 w-4" />
                Import {validCount} item{validCount !== 1 ? "s" : ""}
              </button>
            )}
            {importing && (
              <button disabled className="flex items-center gap-2 rounded-full bg-secondary px-6 py-2 text-sm font-medium text-white opacity-80">
                <Loader2 className="h-4 w-4 animate-spin" /> Importing…
              </button>
            )}
            {done && (
              <button type="button" onClick={handleClose}
                className="rounded-full bg-secondary px-6 py-2 text-sm font-medium text-white transition hover:opacity-90">
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}