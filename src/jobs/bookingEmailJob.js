const Booking = require("../models/Booking");
const Vault = require("../models/Vault");
const sendMail = require("../utils/sendMail");

const TEN_MINUTES_MS = 10 * 60 * 1000;

/** Parse "9:30 PM" to minutes since midnight. */
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

/** Get slot end Date from slotDate (YYYY-MM-DD) and timeSlot ("From - Till"). */
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

/**
 * Run every minute:
 * 1) Send "10 min left" email (once per booking); no delete.
 * 2) For ended bookings: send "booking over" email, then delete booking + delete vault.
 * 3) Delete any vault whose slot end time has passed (including never-booked vaults).
 */
async function runBookingEmailJob() {
  const now = new Date();
  const tenMinFromNow = new Date(now.getTime() + TEN_MINUTES_MS);

  try {
    // 1) Bookings that end in ≤10 min and we haven't sent reminder yet
    const reminderBookings = await Booking.find({
      end: { $gt: now, $lte: tenMinFromNow },
      reminderSentAt: null,
    })
      .populate("user", "email")
      .populate("vault")
      .lean();

    for (const b of reminderBookings) {
      const email = b.user?.email;
      const lockerLabel = b.vault?.lockerNo ? `Locker ${b.vault.lockerNo}` : "your locker";
      if (email) {
        try {
          await sendMail.sendBookingReminderEmail(email, lockerLabel, b.end);
        } catch (err) {
          console.error("Booking reminder email failed:", err.message);
        }
      }
      await Booking.findByIdAndUpdate(b._id, { reminderSentAt: now });
    }

    // 2) Bookings that have ended: send "booking over" email, then remove from DB completely
    //    - Delete the booking (user removed from access, gone from user dashboard)
    //    - Delete the vault for that slot (date/time passed; admin creates new slots as needed)
    const endedBookings = await Booking.find({ end: { $lte: now } })
      .populate("user", "email")
      .populate("vault")
      .lean();

    for (const b of endedBookings) {
      const email = b.user?.email;
      const lockerLabel = b.vault?.lockerNo ? `Locker ${b.vault.lockerNo}` : "your locker";
      const vaultId = b.vault?._id;

      if (email) {
        try {
          await sendMail.sendBookingOverEmail(email, lockerLabel);
        } catch (err) {
          console.error("Booking over email failed:", err.message);
        }
      }

      // Remove booking from database → no longer shown in user's "My bookings"
      await Booking.findByIdAndDelete(b._id);

      // Delete the vault (that date/time slot) from database → admin will create new locker slots as needed
      if (vaultId) {
        await Vault.findByIdAndDelete(vaultId);
      }
    }

    // 3) Delete vaults whose slot duration has passed but were never booked (or any remaining past slots)
    const allVaults = await Vault.find({}).lean();
    for (const v of allVaults) {
      const slotEnd = getSlotEndDate(v.slotDate, v.timeSlot);
      if (slotEnd && slotEnd <= now) {
        await Vault.findByIdAndDelete(v._id);
      }
    }
  } catch (err) {
    console.error("Booking email job error:", err);
  }
}

module.exports = { runBookingEmailJob };
