// utils/sortDcrDate.js

// Map of month abbreviations to numbers
const monthMap = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

/**
 * Convert "Nov. 23, 2025" → JS Date object
 */
export function parseDcrDate(str: string) {
  if (!str) return new Date(0); // fallback for bad values

  // Remove commas and split: "Nov. 23 2025"
  const cleaned = str.replace(",", "");

  // ["Nov.", "23", "2025"]
  const parts = cleaned.split(" ");

  if (parts.length < 3) return new Date(0);

  const month = parts[0].replace(".", ""); // "Nov." → "Nov"
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  return new Date(year, monthMap[month], day);
}

/**
 * Sort records by dcrDate (latest first)
 */
export function sortByDcrDate(records) {
  return [...records].sort((a, b) => {
    const d1 = parseDcrDate(a.dcrDate);
    const d2 = parseDcrDate(b.dcrDate);
    return d2 - d1; // descending
  });
}
