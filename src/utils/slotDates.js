/** Parse "9:30 PM" or "12:00 AM" to minutes since midnight. */
function parseTimeToMinutes(str) {
  if (!str || typeof str !== "string") return null;
  const trimmed = str.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = (match[3] || "").toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

/** Get slot start Date from slotDate (YYYY-MM-DD) and timeSlot ("From - Till"). Returns null if invalid. */
function getSlotStartDate(slotDateStr, timeSlotStr) {
  if (!slotDateStr || !timeSlotStr) return null;
  const parts = String(timeSlotStr).split("-").map((s) => s.trim());
  const fromStr = parts.length >= 2 ? parts[0] : parts[0];
  const minutes = parseTimeToMinutes(fromStr);
  if (minutes == null) return null;
  const [y, mo, d] = slotDateStr.split("-").map(Number);
  if (!y || !mo || !d) return null;
  return new Date(y, mo - 1, d, Math.floor(minutes / 60), minutes % 60, 0, 0);
}

/** Get slot end Date from slotDate (YYYY-MM-DD) and timeSlot ("From - Till"). Returns null if invalid. */
/** When Till is 12:00 AM (midnight), it means end of that calendar day → next day 00:00 (e.g. 11:30 PM–12:00 AM slot). */
function getSlotEndDate(slotDateStr, timeSlotStr) {
  if (!slotDateStr || !timeSlotStr) return null;
  const parts = String(timeSlotStr).split("-").map((s) => s.trim());
  const tillStr = parts.length >= 2 ? parts[1] : parts[0];
  const minutes = parseTimeToMinutes(tillStr);
  if (minutes == null) return null;
  const [y, mo, d] = slotDateStr.split("-").map(Number);
  if (!y || !mo || !d) return null;
  if (minutes === 0) {
    return new Date(y, mo - 1, d + 1, 0, 0, 0, 0);
  }
  return new Date(y, mo - 1, d, Math.floor(minutes / 60), minutes % 60, 0, 0);
}

module.exports = { parseTimeToMinutes, getSlotStartDate, getSlotEndDate };
