/**
 * Universal CSV export utility.
 * Generates a CSV string from typed data + column definitions.
 */

export interface CSVColumn<T> {
  header: string;
  accessor: (row: T) => string | number;
}

/**
 * Generate a CSV string from an array of typed rows.
 * - Headers and string values are wrapped in double quotes.
 * - Embedded double quotes are escaped (RFC 4180).
 */
export function generateCSV<T>(data: T[], columns: CSVColumn<T>[]): string {
  const header = columns.map((c) => `"${c.header}"`).join(',');

  const rows = data.map((row) =>
    columns
      .map((c) => {
        const val = c.accessor(row);
        if (typeof val === 'string') {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return String(val);
      })
      .join(','),
  );

  return [header, ...rows].join('\n');
}

/**
 * Set CSV response headers on an Express Response object.
 */
export function setCsvHeaders(
  res: { setHeader(name: string, value: string): void },
  filename: string,
): void {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
}
