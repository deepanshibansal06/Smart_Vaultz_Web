const Vault = require("../models/Vault");
const Booking = require("../models/Booking");

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

exports.createVault = async (req, res) => {
  try {
    const { lockerNo, location, price, slotDate, timeSlot } = req.body;
    const lockerNoTrim = (lockerNo != null && String(lockerNo).trim()) ? String(lockerNo).trim() : "";
    if (lockerNoTrim) {
      const existing = await Vault.findOne({ lockerNo: lockerNoTrim });
      if (existing) {
        return res.status(400).json({ message: "A locker with this number already exists" });
      }
    }
    const slotEnd = getSlotEndDate(slotDate, timeSlot);
    if (slotEnd && slotEnd <= new Date()) {
      return res.status(400).json({
        message: "Cannot create a locker for a date/time that has already passed. Choose a future slot.",
      });
    }
    const vault = await Vault.create({
      lockerNo: lockerNoTrim,
      location: location != null ? String(location).trim() : "",
      price: price ?? 0,
      slotDate: slotDate != null ? String(slotDate) : "",
      timeSlot: timeSlot != null ? String(timeSlot) : "",
    });
    res.status(201).json(vault);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to create vault" });
  }
};

exports.getVaults = async (req, res) => {
  const availableOnly = req.query.available === "true";
  const filter = availableOnly ? { status: "available" } : {};
  const vaults = await Vault.find(filter);
  res.json(vaults);
};

exports.updateVault = async (req, res) => {
  try {
    const { lockerNo, location, price, slotDate, timeSlot, status } = req.body;
    if (lockerNo != null) {
      const lockerNoTrim = String(lockerNo).trim();
      if (lockerNoTrim) {
        const existing = await Vault.findOne({ lockerNo: lockerNoTrim, _id: { $ne: req.params.id } });
        if (existing) {
          return res.status(400).json({ message: "A locker with this number already exists" });
        }
      }
    }
    const update = {};
    if (lockerNo != null) update.lockerNo = String(lockerNo).trim();
    if (location != null) update.location = String(location).trim();
    if (price != null) update.price = Number(price);
    if (slotDate != null) update.slotDate = String(slotDate);
    if (timeSlot != null) update.timeSlot = String(timeSlot);
    if (status != null && ["available", "booked"].includes(status)) update.status = status;
    const vault = await Vault.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!vault) return res.status(404).json({ message: "Vault not found" });
    // When admin sets vault to "available", remove its bookings so the slot is free and user can book again
    if (status === "available") {
      await Booking.deleteMany({ vault: req.params.id });
    }
    res.json(vault.toObject ? vault.toObject() : vault);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to update vault" });
  }
};

exports.deleteVault = async (req, res) => {
  const vault = await Vault.findByIdAndDelete(req.params.id);
  if (!vault) return res.status(404).json({ message: "Vault not found" });
  res.json({ message: "Vault deleted" });
};