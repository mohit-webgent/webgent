const PLAIN_PHONE_NUMBER = /^\+?[\d\s()-]+$/;

/**
 * Quotes a CSV cell and neutralises spreadsheet formulas. Leads come from public forms, so a value
 * such as =HYPERLINK(...) would otherwise run when an admin opens the export in Excel or Sheets.
 */
export function escapeCsvCell(cell: string | number | null | undefined): string {
  if (cell === null || cell === undefined) return '""';
  const str = String(cell);
  const isFormula = /^[=+\-@\t\r]/.test(str) && !PLAIN_PHONE_NUMBER.test(str);
  return `"${(isFormula ? `'${str}` : str).replace(/"/g, '""')}"`;
}
