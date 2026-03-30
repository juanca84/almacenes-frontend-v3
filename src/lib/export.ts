/**
 * Utilities for client-side CSV export.
 * No external dependencies — uses only browser APIs.
 */

/** Escapes a single cell value per RFC 4180. */
export function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

/** Builds a CSV string from headers and rows. */
export function toCSV(headers: string[], rows: string[][]): string {
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ]
  return lines.join('\r\n')
}

/** Returns a timestamped filename for CSV exports: `{prefix}_YYYY-MM-DD.csv` */
export function csvFilename(prefix: string): string {
  return `${prefix}_${new Date().toISOString().slice(0, 10)}.csv`
}

/** Triggers a browser download of a CSV file. */
export function downloadCSV(filename: string, content: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  // Revoke after a tick so the browser has time to start the download
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
