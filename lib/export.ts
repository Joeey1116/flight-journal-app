/**
 * Export — CSV and PDF.
 *
 * Export is a core feature, not an afterthought: the logbook is the
 * pilot's, and it must leave the app in standard formats.
 *  - CSV: every field, one row per flight, decimal hours — imports into
 *    LogTen, ForeFlight, MyFlightbook, or a spreadsheet.
 *  - PDF: traditional printed-logbook format (FAA Order 8900.1 style
 *    columns) with a totals row and a signature line, rendered with
 *    expo-print and shared with expo-sharing.
 */
import { Platform } from "react-native";
import type { LogbookEntry, Totals } from "./types";
import { TIME_FIELDS } from "./types";

const CSV_COLUMNS: Array<{ key: string; label: string }> = [
  { key: "date", label: "Date" },
  { key: "aircraftType", label: "Aircraft Type" },
  { key: "aircraftModel", label: "Aircraft Model" },
  { key: "registration", label: "Registration" },
  { key: "departure", label: "From" },
  { key: "arrival", label: "To" },
  { key: "route", label: "Route" },
  { key: "outTime", label: "Out" },
  { key: "offTime", label: "Off" },
  { key: "onTime", label: "On" },
  { key: "inTime", label: "In" },
  { key: "totalTime", label: "Total Time" },
  { key: "pic", label: "PIC" },
  { key: "sic", label: "SIC" },
  { key: "dualReceived", label: "Dual Received" },
  { key: "dualGiven", label: "Dual Given" },
  { key: "solo", label: "Solo" },
  { key: "crossCountry", label: "Cross Country" },
  { key: "night", label: "Night" },
  { key: "instrumentActual", label: "Instrument Actual" },
  { key: "instrumentSimulated", label: "Instrument Simulated" },
  { key: "dayLandings", label: "Day Landings" },
  { key: "nightLandings", label: "Night Landings" },
  { key: "approaches", label: "Approaches" },
  { key: "holds", label: "Holds" },
  { key: "isSim", label: "Simulator" },
  { key: "remarks", label: "Remarks" },
];

function csvEscape(value: unknown): string {
  const s = value === undefined || value === null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildCSV(entries: LogbookEntry[]): string {
  const sorted = [...entries].sort((a, b) =>
    a.date === b.date ? a.createdAt.localeCompare(b.createdAt) : a.date.localeCompare(b.date),
  );
  const header = CSV_COLUMNS.map((c) => c.label).join(",");
  const rows = sorted.map((e) =>
    CSV_COLUMNS.map((c) => {
      const v = (e as unknown as Record<string, unknown>)[c.key];
      if (typeof v === "boolean") return v ? "Yes" : "No";
      if (typeof v === "number") return v === 0 ? "" : String(v);
      return csvEscape(v);
    }).join(","),
  );
  return [header, ...rows].join("\n");
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const num = (n: number) => (n ? n.toFixed(1) : "");

/**
 * Traditional logbook page as print HTML: date, aircraft, route,
 * block times, time columns, landings, approaches, remarks — plus a
 * totals row and a signature line, like the paper book.
 */
export function buildLogbookHTML(
  entries: LogbookEntry[],
  totals: Totals,
  pilotName: string,
): string {
  const sorted = [...entries].sort((a, b) =>
    a.date === b.date ? a.createdAt.localeCompare(b.createdAt) : a.date.localeCompare(b.date),
  );
  const rows = sorted
    .map(
      (e) => `<tr>
        <td>${escHtml(e.date)}</td>
        <td>${escHtml(e.aircraftType)}<br><small>${escHtml(e.registration)}</small></td>
        <td>${escHtml(e.departure)} → ${escHtml(e.arrival)}</td>
        <td>${num(e.totalTime)}</td>
        <td>${num(e.pic)}</td>
        <td>${num(e.sic)}</td>
        <td>${num(e.crossCountry)}</td>
        <td>${num(e.night)}</td>
        <td>${num(e.instrumentActual + e.instrumentSimulated)}</td>
        <td>${e.dayLandings + e.nightLandings || ""}</td>
        <td>${e.approaches || ""}</td>
        <td>${escHtml(e.remarks ?? "")}${e.isSim ? " <i>(SIM)</i>" : ""}</td>
      </tr>`,
    )
    .join("\n");
  const totalRow = `<tr class="totals"><td colspan="3">TOTALS</td>
    <td>${totals.totalTime.toFixed(1)}</td>
    <td>${totals.pic.toFixed(1)}</td>
    <td>${totals.sic.toFixed(1)}</td>
    <td>${totals.crossCountry.toFixed(1)}</td>
    <td>${totals.night.toFixed(1)}</td>
    <td>${(totals.instrumentActual + totals.instrumentSimulated).toFixed(1)}</td>
    <td>${totals.dayLandings + totals.nightLandings}</td>
    <td>${totals.approaches}</td>
    <td></td></tr>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body { font-family: Helvetica, Arial, sans-serif; color: #111; margin: 24px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    p.sub { color: #555; font-size: 12px; margin: 0 0 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #999; padding: 5px 6px; text-align: left; vertical-align: top; }
    th { background: #eee; }
    tr.totals td { font-weight: bold; background: #f5f5f5; }
    .sig { margin-top: 28px; font-size: 12px; }
    .sig span { display: inline-block; border-bottom: 1px solid #111; width: 260px; margin-left: 8px; }
  </style></head><body>
  <h1>Flight Journal${pilotName ? ` — ${escHtml(pilotName)}` : ""}</h1>
  <p class="sub">Exported ${new Date().toISOString().slice(0, 10)} · ${sorted.length} flights · Times in decimal hours</p>
  <table><thead><tr>
    <th>Date</th><th>Aircraft</th><th>Route</th><th>Total</th><th>PIC</th><th>SIC</th>
    <th>XC</th><th>Night</th><th>Instr</th><th>Landings</th><th>Appr</th><th>Remarks</th>
  </tr></thead><tbody>
  ${rows}
  ${totalRow}
  </tbody></table>
  <p class="sig">Pilot signature:<span></span> &nbsp; Date:<span></span></p>
  </body></html>`;
}

/** Write text to a file and open the share sheet. Returns false on web/unsupported. */
export async function shareTextFile(
  filename: string,
  contents: string,
  mimeType: string,
): Promise<boolean> {
  try {
    if (Platform.OS === "web") return false;
    const FileSystem = await import("expo-file-system/legacy");
    const Sharing = await import("expo-sharing");
    if (!(await Sharing.isAvailableAsync())) return false;
    const uri = `${FileSystem.cacheDirectory ?? ""}${filename}`;
    await FileSystem.writeAsStringAsync(uri, contents, {
      encoding: "utf8",
    });
    await Sharing.shareAsync(uri, { mimeType, dialogTitle: filename });
    return true;
  } catch {
    return false;
  }
}

/** Render the logbook PDF and open the share sheet. Returns false on web/unsupported. */
export async function shareLogbookPDF(html: string): Promise<boolean> {
  try {
    if (Platform.OS === "web") return false;
    const Print = await import("expo-print");
    const Sharing = await import("expo-sharing");
    if (!(await Sharing.isAvailableAsync())) return false;
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Flight Journal.pdf",
    });
    return true;
  } catch {
    return false;
  }
}

export { TIME_FIELDS };
