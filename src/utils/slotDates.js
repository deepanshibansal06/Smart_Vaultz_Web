/** IST = UTC+5:30 → offset +330 minutes. Slot times (e.g. "9:00 AM") are interpreted in this timezone. */
const DEFAULT_SLOT_OFFSET_MINUTES = 330;

function getSlotOffsetMs() {
  const val = process.env.SLOT_TIMEZONE_OFFSET_MINUTES;
  if (val === undefined || val === "") return DEFAULT_SLOT_OFFSET_MINUTES * 60 * 1000;
  const n = parseInt(val, 10);
  if (Number.isNaN(n)) return DEFAULT_SLOT_OFFSET_MINUTES * 60 * 1000;
  return n * 60 * 1000;
}

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

/** Build a Date in UTC that represents the given local (e.g. IST) date/time. */
function localToUtcDate(y, mo, d, hour, min) {
  const offsetMs = getSlotOffsetMs();
  const utcMs = Date.UTC(y, mo - 1, d, hour, min, 0, 0) - offsetMs;
  return new Date(utcMs);
}

/** Get slot start Date (in UTC) from slotDate (YYYY-MM-DD) and timeSlot ("From - Till"). Time is interpreted in IST (or SLOT_TIMEZONE_OFFSET_MINUTES). */
function getSlotStartDate(slotDateStr, timeSlotStr) {
  if (!slotDateStr || !timeSlotStr) return null;
  const parts = String(timeSlotStr).split("-").map((s) => s.trim());
  const fromStr = parts.length >= 2 ? parts[0] : parts[0];
  const minutes = parseTimeToMinutes(fromStr);
  if (minutes == null) return null;
  const [y, mo, d] = slotDateStr.split("-").map(Number);
  if (!y || !mo || !d) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return localToUtcDate(y, mo, d, h, m);
}

/** Get slot end Date (in UTC). When Till is 12:00 AM, it means end of that calendar day (midnight next day in local time). */
function getSlotEndDate(slotDateStr, timeSlotStr) {
  if (!slotDateStr || !timeSlotStr) return null;
  const parts = String(timeSlotStr).split("-").map((s) => s.trim());
  const tillStr = parts.length >= 2 ? parts[1] : parts[0];
  const minutes = parseTimeToMinutes(tillStr);
  if (minutes == null) return null;
  const [y, mo, d] = slotDateStr.split("-").map(Number);
  if (!y || !mo || !d) return null;
  if (minutes === 0) {
    return localToUtcDate(y, mo, d + 1, 0, 0);
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return localToUtcDate(y, mo, d, h, m);
}

module.exports = { parseTimeToMinutes, getSlotStartDate, getSlotEndDate };
